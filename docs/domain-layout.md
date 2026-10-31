# Production domains

- `https://ca.lunaeth.com/` serves the contents of `portal/` from `/var/www/lunaeth-portal/current`, the navigation portal with one button per website.
- `https://learn.lunaeth.com/` serves the quiz application at the release root.

Both website hostnames use proxied Cloudflare DNS, host-scoped Full (strict) configuration, separate Origin CA certificates, and a Cloudflare-only origin allowlist. The zone-wide SSL configuration is unchanged.

Publish the root HTML/CSS files, `src/`, `data/`, and `portal/`. Do not publish repository metadata, scripts, tests, or source documents. `deploy/nginx.conf` is the server-block template; install it as `/etc/nginx/conf.d/ctest.conf`. The certificates and private keys are provisioned separately and are never committed.

The portal has its own release directory and current symlink, independent of `/var/www/ctest/current`. New websites can be deployed with separate document roots and server blocks without changing the quiz application. Only the quiz website is currently listed; its individual learning features stay inside `learn`.

## Existing browser records

Browser local storage belongs to each origin. Existing records on `ca` do not automatically appear on `learn`. In the same browser/profile, use the quiz sidebar's migration link: export a JSON file at `https://ca.lunaeth.com/progress.html`, then import it at `https://learn.lunaeth.com/portal/progress.html`. Export leaves old records intact. Import requires explicit replacement consent and offers a backup of new-site records. A storage write failure attempts to roll back the complete snapshot. Only the eight quiz storage keys are transferred; unrelated data is excluded. Learning archive directory handles must be rebound.

Old standalone topic-page URLs on `ca` redirect to the corresponding page on `learn`. The portal root, `/index.html`, and old hash routes remain the portal and never automatically open the quiz.
