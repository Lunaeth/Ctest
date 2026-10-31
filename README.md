# Ctest

A question practice system supporting CompTIA A+ Core 1/Core 2, Security+ SY0-701, AWS SAA, CCNP-DCAI and NCA-AIIO. The static frontend supports guest study; the optional Flask account service synchronizes each user's progress, mistakes, favourites and exam records.

## Features

- Switch between multiple question banks, with progress, favourites, incorrect answers, and exam records saved separately for each bank
- Practice mode: get instant marking and automatically record incorrect answers
- Study mode: filter by module, review step-by-step explanations and high-frequency topics, save favourites, and jump to specific question numbers
- Security+: study the five bilingual SY0-701 exam domains; the system uses the community's Most Voted answer for marking and combines highly rated discussions, question constraints, easily confused options, and related questions from the same bank into Core-style explanations
- Mock exams: view your score and review incorrect answers after submission
- Mistake notebook: review missed questions in one place and remove questions you have mastered
- Local learning archives: create a `question-archive.json` file and automatically keep your complete learning progress in sync
- AWS SAA and AI study: English question stems and choices; AI explanations, memory cues, pitfalls and terminology remain bilingual. AI study includes technical references, related questions and searchable knowledge maps; eight DCAI and ten AIIO study modules
- Accounts: username/four-digit PIN login, Turnstile-protected registration, isolated records, explicit guest-record import, export and conflict protection when another tab or device has newer progress

## Technology Stack

- Vanilla HTML, CSS, and JavaScript
- Python Flask, SQLite, Argon2id and Gunicorn for the optional account service
- Python with `pypdf` for extracting question bank data from PDFs
- Node.js built-in test runner and Python `unittest`

## Run Locally

```bash
npm run serve
```

Then open:

```text
http://127.0.0.1:4173
```

Static serving supports guest records. Account features require the API. For a disposable local account UI fixture, install `server/requirements.txt` in a virtual environment and run `python scripts/serve-account-preview.py`, then open `http://localhost:4180`. That fixture supplies `preview_alice` and `preview_bob` with the test PIN documented in the fixture source; never deploy it or use its credentials/secrets in production.

## Tests

```bash
npm test
python -m unittest discover -s tests/python -p "test_*.py"
```

## Question Bank Data

The project currently includes the following question bank data files:

- `data/questions.zh.json`
- `data/questions.en.json`
- `data/questions.core2.json`
- `data/questions.security-plus.json`
- `data/questions.aws-saa.json` — 143 English questions; source-text limitations and rebuild instructions in [Question language](docs/question-language.md)
- `data/questions.ccnp-dcai.json` — 56 scored questions, including 4 multi-select questions
- `data/questions.nca-aiio.json` — 116 scored questions, including 5 multi-select questions

### CCNP-DCAI and NCA-AIIO PDF imports

Both banks support study, practice, mock exams, favourites, and separate saved progress. Original PDF question numbers and page numbers are displayed. CCNP-DCAI has 60 source questions: its four illustrated matching questions (3, 11, 29, 36) are available in `ai-review.html`, linked from the bank's home and study pages, for self-assessment. They are excluded from automatic scoring. Question 28 retains its exhibit in study, practice, exams, and mistake review.

All 176 AI source items have individually authored bilingual study content and review notes based on technical references. The reviewed layer corrects several source answers and clarifies ambiguous assumptions; original changed values are retained in the data. This is educational review, not an official exam answer key. Version-dependent claims specify their source context. DCAI question 60 is explicitly a capacity-planning exercise, not a verified claim about firmware standby behavior. See `docs/ai-audit/` for batch evidence, corrections and acceptance status. Source file hashes and import counts are recorded in `data/*-import-report.json`. Original PDFs are not committed.

To reproduce these imports (requires Python and `PyMuPDF`):

```bash
python scripts/extract_ai_banks.py --ccnp "/path/to/CCNP DCAI.pdf" --nca "/path/to/NCA AIIO.pdf"
node scripts/build-ai-study.mjs --require-complete
```

Always apply the reviewed study layer after a fresh import. The strict build requires all 176 entries; generated coverage is a completeness check, not proof of semantic correctness.

To regenerate the Security+ question bank:

```bash
python scripts/extract_security_plus.py \
  --input /path/to/sy0-701.pdf \
  --output data/questions.security-plus.json \
  --report security-plus-extraction-report.json
```

The Security+ importer prioritises the community's top-voted answer, followed by the `Most Voted` label, and uses the original PDF answer only as a final fallback. Performance-based questions (PBQs) that rely on drag-and-drop, hotspot diagrams, or interactive configuration are not misrepresented as standard multiple-choice questions.

The original PDF files are not included in the repository.

## Learning Records

If you create a learning archive from the application:

- The default filename is `question-archive.json`
- The file will not be committed to the repository

## PIN login

PINs contain exactly four ASCII digits, including leading zeros. Existing password accounts use **旧账号设置 PIN** to verify their original password and choose a PIN without changing their user ID or learning records. This invalidates their old sessions and password. Existing signed-in users can also open this flow from the sidebar. New registrations still require Turnstile.

PINs are stored as Argon2id hashes of a keyed digest, with an independent private `CTEST_PIN_PEPPER` outside the database and Git. Keep that key with private recovery configuration; changing or losing it requires PIN resets. Login and migration share account limits of five attempts per 15-minute window and twenty per day, plus an IP limit. Limits persist across processes and return the actual retry interval.
