#!/bin/sh
# Label this diagnostic entry point ctest_api_exec_t and run with the API service's user/sandbox.
exec /opt/ctest-api/venv/bin/python - <<'PY'
from pathlib import Path
import json
from urllib.error import HTTPError
from server.app import verify_turnstile

context = Path('/proc/self/attr/current').read_text().strip('\x00\n')
assert ':ctest_api_t:' in context, context
try:
    result = verify_turnstile('invalid-diagnostic-secret', 'invalid-diagnostic-token', '127.0.0.1')
except HTTPError as error:
    assert error.code == 400, error.code
    result = json.loads(error.read(32768))
assert result.get('success') is False and result.get('error-codes'), result
print('PASS: confined service received Cloudflare negative verification over validated HTTPS')
print('This proves DNS/TLS/connectivity only, not successful human verification.')
PY
