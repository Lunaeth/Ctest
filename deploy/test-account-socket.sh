#!/bin/bash
# Exercise the real Nginx worker -> API socket under SELinux, without a public listener.
set -euo pipefail
[[ "$EUID" == 0 ]] || exit 2
probe_dir=$(mktemp -d /run/ctest-nginx-probe.XXXXXX)
probe_conf=$(mktemp /etc/nginx/conf.d/ctest-socket-probe.XXXXXX.conf)
cleanup() {
  rm -f -- "$probe_conf"
  nginx -t && systemctl reload nginx
  for attempt in {1..10}; do
    [[ ! -S "$probe_dir/http.sock" ]] && break
    sleep 1
  done
  rm -f -- "$probe_dir/http.sock"
  rmdir -- "$probe_dir"
}
trap cleanup EXIT
chown root:nginx "$probe_dir"
chmod 750 "$probe_dir"
chcon -t httpd_var_run_t "$probe_dir"
cat > "$probe_conf" <<EOF
server {
    listen unix:$probe_dir/http.sock;
    server_name localhost;
    location /api/ {
        proxy_pass http://unix:/run/ctest-api/api.sock;
        proxy_set_header Host learn.lunaeth.com;
        proxy_set_header X-Client-IP 127.0.0.1;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF
chmod 644 "$probe_conf"
restorecon "$probe_conf"
nginx -t
systemctl reload nginx
for attempt in {1..10}; do
  [[ -S "$probe_dir/http.sock" ]] && break
  sleep 1
done
chmod 600 "$probe_dir/http.sock"
curl -fsS --unix-socket "$probe_dir/http.sock" http://localhost/api/health
curl -fsS --unix-socket "$probe_dir/http.sock" http://localhost/api/config
code=$(curl -sS --unix-socket "$probe_dir/http.sock" -o /dev/null -w '%{http_code}' http://localhost/api/progress)
[[ "$code" == 401 ]]
code=$(curl -sS --unix-socket "$probe_dir/http.sock" -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' -H 'Origin: https://untrusted.invalid' --data '{}' http://localhost/api/auth/register)
[[ "$code" == 403 ]]
echo 'PASS: Nginx Unix-socket proxy, anonymous access and origin enforcement'
