#!/bin/bash
# Publish a verified web archive after provisioning the same API release.
set -euo pipefail
release="$1"
archive="$2"
expected="$3"
[[ "$EUID" == 0 && "$release" =~ ^[0-9a-f]{40}$ && "$expected" =~ ^[0-9a-f]{64}$ ]]
[[ -f "$archive" ]]
[[ "$(sha256sum "$archive" | cut -d' ' -f1)" == "$expected" ]]
[[ "$(readlink -f /opt/ctest-api/current)" == "/opt/ctest-api/releases/$release" ]]
curl -fsS --unix-socket /run/ctest-api/api.sock http://localhost/api/config |
  python3 -c 'import json,sys; assert json.load(sys.stdin)["registrationEnabled"] is True'
old_web=$(readlink -f /var/www/ctest/current)
old_portal=$(readlink -f /var/www/lunaeth-portal/current)
backup="/root/ctest-deploy-backup/release-$release"
[[ ! -e "$backup" ]]
install -d -m 700 "$backup"
cp -a /etc/nginx/conf.d/ctest.conf "$backup/nginx.conf"
[[ ! -f /etc/nginx/ctest-account-api-location.conf ]] || cp -a /etc/nginx/ctest-account-api-location.conf "$backup/api-location.conf"
printf '%s\n%s\n' "$old_web" "$old_portal" > "$backup/previous-roots"
target="/var/www/ctest/releases/$release"
portal="/var/www/lunaeth-portal/releases/$release"
install -d -m 755 "$target" "$portal"
tar -xzf "$archive" --no-same-owner -C "$target"
test -f "$target/index.html"
test -f "$target/src/account-ui.js"
test -f "$target/ai-map.html"
cp -a "$target/portal/." "$portal/"
chown -R root:root "$target" "$portal"
restorecon -RF "$target" "$portal"
switch_root() {
  ln -s "$1" "$2.next"
  mv -Tf "$2.next" "$2"
}
rollback() {
  cp -a "$backup/nginx.conf" /etc/nginx/conf.d/ctest.conf
  if [[ -f "$backup/api-location.conf" ]]; then
    cp -a "$backup/api-location.conf" /etc/nginx/ctest-account-api-location.conf
  fi
  switch_root "$old_web" /var/www/ctest/current
  switch_root "$old_portal" /var/www/lunaeth-portal/current
  nginx -t && systemctl reload nginx
}
trap rollback ERR
install -m 644 "/opt/ctest-api/current/deploy/account-api-location.conf" /etc/nginx/ctest-account-api-location.conf
install -m 644 "/opt/ctest-api/current/deploy/nginx.conf" /etc/nginx/conf.d/ctest.conf
restorecon /etc/nginx/ctest-account-api-location.conf /etc/nginx/conf.d/ctest.conf
nginx -t
switch_root "$target" /var/www/ctest/current
switch_root "$portal" /var/www/lunaeth-portal/current
systemctl reload nginx
systemctl is-active nginx ctest-api ctest-backup.timer
curl -fsS --unix-socket /run/ctest-api/api.sock http://localhost/api/health
trap - ERR
printf '\nPUBLISHED %s\n' "$release"
