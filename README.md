# Ctest

A frontend-only question practice system supporting CompTIA A+ Core 1/Core 2, Security+ SY0-701, and other question banks, along with practice, study, mock exam, mistake notebook, and local learning archive features.

## Features

- Switch between multiple question banks, with progress, favourites, incorrect answers, and exam records saved separately for each bank
- Practice mode: get instant marking and automatically record incorrect answers
- Study mode: filter by module, review step-by-step explanations and high-frequency topics, save favourites, and jump to specific question numbers
- Security+: study the five bilingual SY0-701 exam domains; the system uses the community's Most Voted answer for marking and combines highly rated discussions, question constraints, easily confused options, and related questions from the same bank into Core-style explanations
- Mock exams: view your score and review incorrect answers after submission
- Mistake notebook: review missed questions in one place and remove questions you have mastered
- Local learning archives: create a `question-archive.json` file and automatically keep your complete learning progress in sync

## Technology Stack

- Vanilla HTML, CSS, and JavaScript
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
- `data/questions.aws-saa.json`
- `data/questions.ccnp-dcai.json` — 56 scored questions, including 4 multi-select questions
- `data/questions.nca-aiio.json` — 116 scored questions, including 4 multi-select questions

### CCNP-DCAI and NCA-AIIO PDF imports

Both banks support study, practice, mock exams, favourites, and separate saved progress. Original PDF question numbers and page numbers are displayed. CCNP-DCAI has 60 source questions: its four illustrated matching questions (3, 11, 29, 36) are available in `ai-review.html`, linked from the bank's home and study pages, for self-assessment. They are excluded from automatic scoring. Question 28 retains its exhibit in study, practice, exams, and mistake review.

Answers and English explanations are transcribed from the supplied PDFs, not independently verified or represented as official exam answers. Missing explanations are explicitly labelled. Source file hashes and import counts are recorded in `data/*-import-report.json`. Original PDFs are not committed.

To reproduce these imports (requires Python and `PyMuPDF`):

```bash
python scripts/extract_ai_banks.py --ccnp "/path/to/CCNP DCAI.pdf" --nca "/path/to/NCA AIIO.pdf"
```

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
