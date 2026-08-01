# Ctest

A frontend-only question practice system with Chinese and English question banks, practice mode, mock exams, a mistake notebook, and local learning archives.

## Features

- Switch between the Chinese and English question banks
- Practice mode: get instant grading and automatically record incorrect answers
- Mock exams: view your score and review incorrect answers after submission
- Mistake notebook: review missed questions in one place and remove questions you have mastered
- Local learning archives: create a `question-archive.json` file and automatically keep your complete learning progress in sync

## Tech Stack

- Vanilla HTML, CSS, and JavaScript
- Python with `pypdf` for extracting question-bank data from PDFs
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

## Question-Bank Data

The project currently includes two pre-extracted question-bank data files:

- `data/questions.zh.json`
- `data/questions.en.json`

The original PDF files are not included in the repository.

## Learning Records

If you create a learning archive from the application:

- The default filename is `question-archive.json`
- The file will not be committed to the repository
