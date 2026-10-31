# Release acceptance — 2026-10-31 UTC

This is the acceptance record for the release candidate. The installed release is identified by the Git SHA in the server's frontend/API symlinks and the separately generated artifact manifest; this file is not a live deployment monitor.

## Content and study features

The individual technical reviews cover all 60 DCAI source items (56 scored and four illustrated) and 116 AIIO items. Batch documents retain the primary references, answer corrections and scope decisions. Final consistency checks preserve the distinctions between training and inference, orchestration and model execution, GPU activity and memory capacity, ECN/CNP and PFC, and interconnects and storage services. Version-specific Cisco claims remain dated; DCAI 60 remains explicitly a capacity-only exercise rather than a verified firmware prediction. These are reviewed educational explanations, not official exam answer keys.

The strict compiler reports zero pending items and is idempotent. The 265-test JavaScript suite passes, covering all scored items across learning, practice, mistakes and exam results, illustrated disclosures, answer hiding, corrected-answer migration, module coverage, maps, search and deep links. The final added regression exercises the complete guest export callback with a null account and inspects the generated JSON Blob; it catches the former null-user exception.

Direct Edge ChatGPT browser acceptance checked:

- DCAI map: 60 cards, eight modules, search, closed/open bilingual reasoning cards, exact question/module navigation and module practice without early answers.
- DCAI practice: deliberate wrong selection reveals each option's bilingual explanation, missing/wrong choices, references, memory cues and module-review links.
- AIIO map: 116 cards, ten modules, search for question 104, exact navigation to the corrected choose-two question. Actual practice selection C+D is marked correct.
- AIIO mock exam: no explanations before submission; a wrong answer produces the full bilingual option review and map links after submission.
- Illustrated review: all four source questions and bilingual choices are present; the first disclosure shows used and unused option explanations and technical references; visible question images render. Offscreen images are lazy-loaded.
- 390×844 viewport: map filters, learning, practice and account login layout remain readable without horizontal overflow. This is responsive browser testing, not testing a physical phone.

## Real server and account checks

The existing production homepage was retained while a candidate path and `/api/` were temporarily restricted to the operator's Cloudflare client IP. The candidate used the actual CentOS API/database and `learn.lunaeth.com` HTTPS origin.

- Created `Ctest Registration` Turnstile widget: only `learn.lunaeth.com`, Managed mode, no pre-clearance. Keys are confined to the root-only server environment, not the repository or public frontend. After explicit approval for the CAPTCHA, the visible challenge succeeded and registration created a real signed-in test account.
- No token and an invalid token return 400; wrong credentials return 401; an unrelated Origin returns 403. The backend checks hostname and `register` action, not just the browser widget result.
- Test account A answered DCAI 1 incorrectly and favourited it. Refresh retained the selected answer, mistake and favourite. Another HTTPS client logged in and read the same records.
- Test account B was inserted as an isolated disposable database fixture, then logged in through the actual mobile-size browser UI. It initially had zero attempts/mistakes and could not read A's records even with A's user ID in the query string. B's creation is not claimed as a second CAPTCHA registration.
- Real cookies have Secure, HttpOnly, SameSite=Strict, Path=/ and the `__Host-` prefix without Domain. Missing CSRF returns 403 and stale revisions return 409. API restart followed by a readiness check preserved the session and exact records.
- Import without the replacement checkbox is refused. Explicit guest import completes without changing the guest store. A separate known file fixture imported into B produces exactly the specified DCAI 5 progress, mistake and favourite; the browser mistake notebook shows question 5.
- Private server backup completed before imports. Earlier actual SQLite restore comparison and the 19 tests inside the confined SELinux service domain remain recorded in `account-server-staging.md`.

Browser download-event capture timed out, and browser policy forbade opening `edge://downloads/`. No alternate desktop or internal-browser access was used. The export artifact's content and guest/account separation are covered by automated tests; an end-user download was not independently confirmed through the browser download manager.

## Publication

Package only tracked files from a clean Git commit using `scripts/package-release.py`; it separates public assets from private API files and supplies archive/per-file SHA-256 hashes. Provision the same API SHA, then run `deploy/publish-release.sh` with the verified web archive and hash. The script switches the two roots atomically per symlink, validates Nginx, retains rollback roots/configuration and removes the temporary acceptance route by installing the final configuration.

After publication, verify the public file hashes, HTTPS redirects, portal's single quiz link, private-file rejection, Cloudflare-only origin access, API behavior and matching API/frontend SHA. Remove only the two disposable test accounts and their temporary local credentials after acceptance; retain normal private backups.
