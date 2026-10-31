# Account implementation and release checklist

Status: implemented locally, **not yet released**. Production Turnstile provisioning, Linux service validation, final browser QA and deployment remain required.

## Behavior

The account bar offers username/password login and registration. Registration requires a Cloudflare Turnstile token verified by the backend for the exact hostname `learn.lunaeth.com` and action `register`. No email is collected. Usernames are case-insensitive ASCII letters, digits and underscores (3–32 characters); passwords contain 12–128 characters and are stored as salted Argon2id hashes.

Visitors retain the existing browser-only mode. A signed-in account starts from its own server records and never silently merges guest records. Importing a file or guest snapshot requires explicit replacement consent; export is available before replacing anything. The old `ca` export page remains accessible. Browser archive file bindings are disabled in account mode so a previous user's file cannot receive a different account's data.

Account progress, mistakes, favourites, preferences, practice sessions and exam sessions/history are stored in SQLite, keyed by the authenticated user ID. The caller cannot select another user ID. Session cookies are host-only, HttpOnly, Secure and SameSite=Strict. Session tokens are random, hashed in the database, expire after 14 days, and are revoked on logout. Mutations require exact Origin plus a session-bound CSRF token (login/registration require Origin). Login and registration are rate limited with shared SQLite counters.

Writes are serialized in the browser and compare the database revision. Each write has an idempotency ID so a lost response can be retried safely. A stale tab or a changed login cannot overwrite newer/another-account records. A conflict pauses editing and leaves the current snapshot available for export. Network errors keep unsaved records in memory, display an error and trigger a navigation warning; the user can retry. Unsaved edits are not guaranteed to survive a browser crash. No account records or tokens are written to guest localStorage.

## Runtime provisioning

- Install Python 3.12+ and `server/requirements.txt` in `/opt/ctest-api/venv`.
- Install API source under an immutable release directory; `/opt/ctest-api/current` points to it. Never put `server/`, environment files or databases under a web root.
- Create a system user `ctest`, `/var/lib/ctest` owned by that user with mode 0700, and root-only `/etc/ctest/api.env` (0600).
- Environment: `CTEST_DATABASE=/var/lib/ctest/accounts.sqlite3`, `CTEST_ORIGIN=https://learn.lunaeth.com`, a cryptographically random `CTEST_SESSION_SECRET` of at least 32 characters, `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`. Never commit these values.
- Use the `ctest-api.service` unit. It binds a Unix socket under `/run/ctest-api`, accessible to Nginx; no public backend TCP port. The runtime directory needs the `httpd_var_run_t` SELinux label. Validate the service's sandbox and SELinux behavior on CentOS before switching the site.
- Include `deploy/account-api-location.conf` only in the `learn` TLS server. Preserve the Cloudflare IP allowlist, TLS validation, direct-host denial and the separate `ca` portal.
- Publish `account.css` and the new `src/account-*.js` with the static release. Keep all old release symlinks and database backups for rollback.
- Back up SQLite using its backup API (including live WAL state); keep backups private and restore-test before production rollout. A database backup is not a replacement for source release rollback.

## Validation completed locally

- 16 API tests: registration, login, durable account records, separation, revision conflicts, lost-response retry, CSRF/origin enforcement, expired/revoked sessions, hash/cookie properties, invalid payloads, rate limits and CAPTCHA failure/hostname/action/replay/outage.
- 7 client synchronization tests: queued edits, lost response, conflict refusal/export, per-account memory isolation, removal/no-op behavior, oversized snapshot recovery and proxy/network errors.
- Full JavaScript suite: 235 passed after integration and initial AI annotation changes. Existing Python parsers: 20 passed. API tests: 16 passed. These tests do not prove the unfinished whole-bank content audit or production setup.
- Edge browser: `preview_alice` answered DCAI Q1 incorrectly and favourited it; refresh restored the selected answer and favourite, home showed one attempted and one mistake. Logging out restored untouched guest records. `preview_bob` had zero attempts/mistakes in the same bank.
- Preview fixtures are disposable, localhost-only, and never deployed. Real Turnstile success, server installation and end-to-end production tests remain unproven.
- Two Edge tabs using the same test account reproduced a revision conflict: the stale tab displayed the conflict message, disabled the question area and retained export controls.

## Primary references

- [Cloudflare server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare explicit widget rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Flask web security](https://flask.palletsprojects.com/en/stable/web-security/)
- [argon2-cffi password hashing](https://argon2-cffi.readthedocs.io/en/stable/howto.html)
