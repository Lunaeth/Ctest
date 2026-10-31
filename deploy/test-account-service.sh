#!/bin/sh
# Run this labelled entry point as ctest with /var/lib/ctest writable.
# Each test creates and removes its own temporary DB; the live DB is never selected.
export TMPDIR=/var/lib/ctest
export PYTHONDONTWRITEBYTECODE=1
exec /opt/ctest-api/venv/bin/python - <<'PY'
from pathlib import Path
import unittest

assert ':ctest_api_t:' in Path('/proc/self/attr/current').read_text()
suite = unittest.TestSuite()
for pattern in ('test_accounts.py', 'test_backup.py'):
    suite.addTests(unittest.defaultTestLoader.discover('tests/python', pattern=pattern))
result = unittest.TextTestRunner(verbosity=1).run(suite)
raise SystemExit(0 if result.wasSuccessful() else 1)
PY
