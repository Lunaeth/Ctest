"""Apply reviewed English wording without changing question IDs or answer keys."""
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
BANK = ROOT / "data/questions.aws-saa.json"
CONTENT = ROOT / "scripts/aws-saa-english"


def apply_english(questions, rows):
    translations = {}
    for row in rows:
        if not isinstance(row, list) or len(row) < 6 or row[0] in translations:
            raise ValueError("Invalid or duplicate English translation row")
        if any(not isinstance(text, str) or not text.strip() or re.search(r"[\u3400-\u9fff]", text)
               for text in row[1:]):
            raise ValueError(f"Question {row[0]} requires English text in every field")
        translations[row[0]] = row
    if set(translations) != {q["id"] for q in questions}:
        raise ValueError("English translations must cover the exact question ID set")
    for question in questions:
        row = translations[question["id"]]
        if len(row) != len(question["options"]) + 2:
            raise ValueError(f"Question {question['id']} option count changed")
        question["stem"] = row[1]
        for option, text in zip(question["options"], row[2:]):
            option["text"] = text
    return questions


def main():
    questions = json.loads(BANK.read_text(encoding="utf-8"))
    rows = [row for path in sorted(CONTENT.glob("*.json"))
            for row in json.loads(path.read_text(encoding="utf-8"))]
    updated = apply_english(questions, rows)
    BANK.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Applied English stems and options to {len(updated)} AWS SAA questions")


if __name__ == "__main__":
    main()
