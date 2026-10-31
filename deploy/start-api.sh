#!/bin/sh
exec /opt/ctest-api/venv/bin/gunicorn --workers 2 --threads 2 --timeout 30 \
  --bind unix:/run/ctest-api/api.sock --umask 007 --worker-tmp-dir /run/ctest-api \
  --no-control-socket --access-logfile - --error-logfile - 'server.app:create_app()'
