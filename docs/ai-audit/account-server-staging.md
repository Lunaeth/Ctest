# Account service staging — 2026-10-30

The account API is installed and running on the actual CentOS Stream 10 server, but has no public Nginx route yet. The public quiz remains at commit `88150398d243de03499b9ab5e31dc8b8186eed09`; the portal still has one button pointing to `learn.lunaeth.com`. Registration is disabled because real Turnstile widget keys are not configured. No production users were created by these checks.

## Runtime and isolation

- Python 3.12.15, Gunicorn 26.2.0, Flask 3.1.3 and Argon2. Exact exercised dependency versions are recorded in `server/constraints-centos.txt`.
- `ctest-api.service` runs as user `ctest`, group `nginx`, with `NoNewPrivileges`, empty capabilities, `ProtectSystem=strict`, `ProtectHome`, private temporary storage and restricted writable directories. It listens on `/run/ctest-api/api.sock`, not a TCP port.
- `/etc/ctest/api.env` is root-owned mode 600; the session secret was generated on the server and was not printed or copied into the repository. `/var/lib/ctest` and `/var/backups/ctest` are private mode-700 directories. The socket directory is mode 750 with group `nginx`; its socket is group-accessible.
- Actual Nginx testing initially returned 502. The audit log identified a `connectto` denial from `httpd_t` to `unconfined_service_t`, despite correct socket file permissions. The final policy gives the API its own **confined** `ctest_api_t` domain, via a labelled launcher, and grants Nginx the specific peer-domain socket connection. Application records have `ctest_api_data_t`. There is no unconfined-domain macro, permissive declaration or global network-access boolean change.
- The API policy permits its interpreter/libraries, data and socket files, DNS and HTTP-service-port connections used by Turnstile's HTTPS endpoint. The source code fixes the verification URL. SELinux port permissions do not enforce a Cloudflare-only hostname allowlist.
- The otherwise unused Gunicorn control socket is explicitly disabled. SELinux stays Enforcing and `httpd_can_network_connect` stays off.

The policy uses interfaces installed with the server's SELinux development package; the [SELinux reference-policy source](https://github.com/SELinuxProject/refpolicy/tree/master/policy/modules) supplies the upstream interface context. Runtime evidence, not the existence of a policy file, proves the tested permissions.

## Executed checks

- All 16 account tests and three backup tests pass on CentOS, including a second run as `ctest` **inside `ctest_api_t`** with the service's read-only filesystem sandbox and private test databases. These exercise database writes, password hashing, session handling, isolation, concurrency and failure paths; CAPTCHA success is mocked in unit tests.
- `deploy/test-account-socket.sh` creates a temporary local Unix listener for the real Nginx workers. Health/config, unauthenticated-progress rejection (401) and invalid-Origin rejection (403) passed. It removes the listener/config afterward; no public staging endpoint remains.
- `deploy/test-account-network.sh`, executed in `ctest_api_t`, reached Cloudflare Siteverify using validated TLS and received a structured negative response to deliberately invalid diagnostic credentials. This proves DNS/TLS/connectivity, **not** a successful CAPTCHA or a working widget configuration.
- `ctest-backup.service` completed against the actual staged database. Its integrity-checked private backup was copied to a separate temporary database; users, sessions, progress and rate-limit rows matched. The temporary restore was removed without replacing the live database. A separate WAL fixture test proves committed progress, mistakes and favourites survive backup/restoration.
- `ctest-backup.timer` is enabled for daily 04:30 UTC execution with up to ten minutes of jitter. Fourteen verified generated backups are retained. Failed backup creation does not prune existing backups; restore refuses to overwrite existing files.

## Deployment prerequisites and remaining acceptance

Provisioning requires `python3-pip`, `selinux-policy-devel` and `policycoreutils-python-utils`. Build a Git archive containing `server/`, `deploy/` and the account/backup tests, verify its transfer hash, then run `deploy/provision-account-api.sh` as root with the full release SHA and archive path. `.gitattributes` keeps Linux artifacts LF even when the archive is built on Windows.

Still required: create the real Turnstile widget scoped to `learn.lunaeth.com`, configure private keys, verify actual successful/failed registration and login, test browser guest migration and account/device isolation, publish the final exact tested source to GitHub, add the API route only to `learn`, deploy the frontend and verify the public release. None of the staging checks claims these remaining steps are complete.

For an eventual live restore, stop the account service, preserve the original database and any WAL/SHM as a rollback set, restore to a new filename using `python -m server.backup --restore-from … --restore-to …`, verify integrity and ownership/SELinux labels, and only then switch the database while the service remains stopped. Do not replace an active SQLite file. Retain the private environment file separately; database backups do not contain that session secret or the Turnstile secret.
