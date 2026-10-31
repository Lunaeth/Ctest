#!/bin/bash
# Run as root with a Git release archive already uploaded by the operator.
# Does not publish the frontend or add public Nginx routes.
set -euo pipefail
release="$1"
archive="$2"
[[ "$release" =~ ^[0-9a-f]{40}$ ]] || exit 2
[[ "$EUID" == 0 && -f "$archive" ]] || exit 2
getent group nginx >/dev/null
if ! id ctest >/dev/null 2>&1; then
  useradd --system --user-group --home-dir /var/lib/ctest --no-create-home --shell /sbin/nologin ctest
fi
install -d -o root -g root -m 755 /opt/ctest-api /opt/ctest-api/releases
install -d -o ctest -g ctest -m 700 /var/lib/ctest /var/backups/ctest
install -d -o root -g root -m 700 /etc/ctest
target="/opt/ctest-api/releases/$release"
if [[ ! -d "$target" ]]; then
  install -d -m 755 "$target"
  tar -xzf "$archive" --no-same-owner -C "$target"
fi
test -f "$target/server/app.py"
test -f "$target/server/backup.py"
python3 - <<'PY'
import os, secrets
path = '/etc/ctest/api.env'
if not os.path.exists(path):
    descriptor = os.open(path, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    with os.fdopen(descriptor, 'w') as env:
        env.write('CTEST_DATABASE=/var/lib/ctest/accounts.sqlite3\n')
        env.write('CTEST_ORIGIN=https://learn.lunaeth.com\n')
        env.write('CTEST_SESSION_SECRET=' + secrets.token_urlsafe(48) + '\n')
        env.write('TURNSTILE_SITE_KEY=\nTURNSTILE_SECRET_KEY=\n')
with open(path) as env:
    contents = env.read()
peppers = [line.split('=', 1)[1] for line in contents.splitlines() if line.startswith('CTEST_PIN_PEPPER=')]
if not peppers:
    with open(path, 'a') as env:
        env.write(('' if contents.endswith('\n') else '\n') + 'CTEST_PIN_PEPPER=' + secrets.token_urlsafe(48) + '\n')
elif len(peppers) != 1 or len(peppers[0]) < 32:
    raise SystemExit('Invalid PIN pepper configuration; preserve the existing key and repair the private environment.')
PY
if [[ ! -x /opt/ctest-api/venv/bin/python ]]; then
  python3 -m venv /opt/ctest-api/venv
fi
/opt/ctest-api/venv/bin/python -m pip install --disable-pip-version-check -r "$target/server/requirements.txt" -c "$target/server/constraints-centos.txt"
cd "$target"
PYTHONDONTWRITEBYTECODE=1 /opt/ctest-api/venv/bin/python -m unittest discover -s tests/python -p test_accounts.py
PYTHONDONTWRITEBYTECODE=1 /opt/ctest-api/venv/bin/python -m unittest discover -s tests/python -p test_backup.py
ln -s "$target" /opt/ctest-api/current.next
mv -Tf /opt/ctest-api/current.next /opt/ctest-api/current
install -m 644 deploy/ctest-api.service /etc/systemd/system/ctest-api.service
install -m 644 deploy/ctest-backup.service /etc/systemd/system/ctest-backup.service
install -m 644 deploy/ctest-backup.timer /etc/systemd/system/ctest-backup.timer
install -d -m 755 /opt/ctest-api/selinux
install -m 644 deploy/ctest_api.te /opt/ctest-api/selinux/ctest_api.te
make -C /opt/ctest-api/selinux -f /usr/share/selinux/devel/Makefile ctest_api.pp
semodule -i /opt/ctest-api/selinux/ctest_api.pp
install -m 755 deploy/start-api.sh /opt/ctest-api/start-api
semanage fcontext -a -t ctest_api_exec_t '/opt/ctest-api/start-api' 2>/dev/null || semanage fcontext -m -t ctest_api_exec_t '/opt/ctest-api/start-api'
semanage fcontext -a -t ctest_api_data_t '/var/lib/ctest(/.*)?' 2>/dev/null || semanage fcontext -m -t ctest_api_data_t '/var/lib/ctest(/.*)?'
restorecon -RF /opt/ctest-api /var/lib/ctest /var/backups/ctest /etc/ctest
systemctl daemon-reload
systemctl enable ctest-api.service
systemctl restart ctest-api.service
for attempt in {1..15}; do
  if curl -fsS --unix-socket /run/ctest-api/api.sock http://localhost/api/health; then break; fi
  sleep 1
done
curl -fsS --unix-socket /run/ctest-api/api.sock http://localhost/api/health
systemctl start ctest-backup.service
systemctl enable --now ctest-backup.timer
systemctl is-active ctest-api.service
systemctl is-active ctest-backup.timer
echo ACCOUNT_SERVICE_STAGED
