from __future__ import annotations

import argparse
import html
import json
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

from pypdf import PdfReader


QUESTION_SPLIT_RE = re.compile(r"(?=Question #\d+\s+Topic\s+\d+)", re.IGNORECASE)
HEADER_RE = re.compile(r"^Question #(\d+)\s+(Topic\s+\d+)$", re.IGNORECASE)
OPTION_RE = re.compile(r"^([A-H])\.\s*(.*)$")
OFFICIAL_ANSWER_RE = re.compile(r"^Correct Answer\s*:\s*([A-H]+)", re.IGNORECASE)
SELECTED_ANSWER_RE = re.compile(r"Selected Answer\s*:\s*([A-H]+)", re.IGNORECASE)
VOTE_RE = re.compile(r"([A-H]{1,8})\s*\((\d+(?:\.\d+)?)%\)")
MOST_VOTED_RE = re.compile(r"\s+Most Voted\s*$", re.IGNORECASE)
COMMENT_HEADER_RE = re.compile(
    r"^(?P<author>.*?)(?P<highly>Highly Voted)?"
    r"(?P<age>\d+\s+(?:year|month|week|day|hour|minute)s?"
    r"(?:,\s*\d+\s+(?:year|month|week|day|hour|minute)s?)?\s+ago)$",
    re.IGNORECASE,
)
CONTROL_CHAR_RE = re.compile(r"[\x00-\x08\x0b-\x1f\x7f-\x9f]+")
FOOTER_RE = re.compile(r"^(?:\[\d{4}/\d{2}\]|https://examlearn\.online)$", re.IGNORECASE)
NON_STUDY_COMMENT_RE = re.compile(
    r"\b(?:this website|overpriced|subscription|contributor'?s access|"
    r"took the exam|barely pass|actual test|exam dump|gpt!!!!)\b",
    re.IGNORECASE,
)
OPTION_KEYS = "ABCDEFGH"
SPECIAL_IMAGE_OPTIONS = {
    216: {
        "A": '<script>alert("Warning!");</script>',
    },
    321: {
        "A": (
            "Permit 10.2.2.0/24 to 10.9.8.14/27; "
            "Permit 10.3.9.0/24 to 10.9.8.14/27; "
            "Deny 0.0.0.0/0 to 10.9.8.14/27"
        ),
        "B": (
            "Deny 0.0.0.0/0 to 10.9.8.14/27; "
            "Permit 10.2.2.0/24 to 10.9.8.14/27; "
            "Permit 10.3.9.0/24 to 10.9.8.14/27"
        ),
        "C": (
            "Permit 10.2.2.7/32 to 10.9.8.14/27; "
            "Permit 10.3.9.9/32 to 10.9.8.14/27; "
            "Deny 0.0.0.0/0 to 10.9.8.14/27"
        ),
        "D": (
            "Permit 10.2.2.7/32 to 10.9.8.14/27; "
            "Permit 10.3.9.0/24 to 10.9.8.14/27; "
            "Deny 10.9.8.14/27 to 0.0.0.0/0"
        ),
    },
}


@dataclass
class ParsedComment:
    author: str
    age: str
    highly_voted: bool
    selected_answer: list[str] = field(default_factory=list)
    text: str = ""


def clean_text(value: str) -> str:
    value = CONTROL_CHAR_RE.sub(" ", value)
    return re.sub(r"\s+", " ", value).strip()


def normalize_lines(block: str) -> list[str]:
    lines = []
    for raw_line in block.replace("\f", "\n").splitlines():
        line = clean_text(raw_line)
        if not line or FOOTER_RE.fullmatch(line):
            continue
        lines.append(line)
    return lines


def parse_answer_keys(value: str) -> list[str]:
    return [key for key in value.upper() if key in OPTION_KEYS]


def validate_option_sequence(options: list[dict]) -> None:
    keys = [option["key"] for option in options]
    if len(keys) < 2:
        raise ValueError("fewer than two options")
    expected = list(OPTION_KEYS[: OPTION_KEYS.index(keys[-1]) + 1])
    if keys != expected:
        raise ValueError(f"non-contiguous option keys: {''.join(keys)}")


def parse_comments(lines: list[str]) -> list[ParsedComment]:
    comments: list[ParsedComment] = []
    current: ParsedComment | None = None
    body: list[str] = []

    def flush() -> None:
        nonlocal current, body
        if current is None:
            body = []
            return
        joined = clean_text(" ".join(body))
        selected_match = SELECTED_ANSWER_RE.search(joined)
        if selected_match:
            current.selected_answer = parse_answer_keys(selected_match.group(1))
            joined = clean_text(SELECTED_ANSWER_RE.sub("", joined))
        current.text = joined
        comments.append(current)
        current = None
        body = []

    for line in lines:
        header = COMMENT_HEADER_RE.match(line)
        if header:
            flush()
            current = ParsedComment(
                author=clean_text(header.group("author")),
                age=clean_text(header.group("age")),
                highly_voted=bool(header.group("highly")),
            )
            continue
        if current is not None:
            body.append(line)

    flush()
    return comments


def is_substantive_comment(comment: ParsedComment) -> bool:
    return len(comment.text) >= 30 and not NON_STUDY_COMMENT_RE.search(comment.text)


def truncate_comment(value: str, limit: int = 520) -> str:
    value = clean_text(value)
    if len(value) <= limit:
        return value
    excerpt = value[: limit + 1]
    sentence_end = max(excerpt.rfind(". "), excerpt.rfind("; "), excerpt.rfind(".\""))
    if sentence_end >= limit // 2:
        return excerpt[: sentence_end + 1].strip()
    return f"{value[: limit - 3].rstrip()}..."


def comment_mentions_option(comment: ParsedComment, option: dict) -> bool:
    marker = re.compile(
        rf"(?:^|\s){re.escape(option['key'])}[.):\-]\s*",
        re.IGNORECASE,
    )
    phrase = re.compile(re.escape(option["text"]), re.IGNORECASE)
    return bool(marker.search(comment.text) or phrase.search(comment.text))


def comment_supports_answer(
    comment: ParsedComment,
    community_answer: list[str],
    options: list[dict],
) -> bool:
    correct_set = set(community_answer)
    if comment.selected_answer:
        return set(comment.selected_answer) == correct_set
    return any(
        option["key"] in correct_set and comment_mentions_option(comment, option)
        for option in options
    )


def select_discussion_comments(
    comments: list[ParsedComment],
    community_answer: list[str],
    options: list[dict],
    limit: int = 4,
) -> list[ParsedComment]:
    def supports_answer(comment: ParsedComment) -> bool:
        return comment_supports_answer(comment, community_answer, options)

    ranked = sorted(
        (comment for comment in comments if is_substantive_comment(comment)),
        key=lambda comment: (
            not (comment.highly_voted and supports_answer(comment)),
            not supports_answer(comment),
            not comment.highly_voted,
        ),
    )
    selected: list[ParsedComment] = []
    seen_texts: set[str] = set()
    for comment in ranked:
        normalized = comment.text.lower()
        if normalized in seen_texts:
            continue
        selected.append(comment)
        seen_texts.add(normalized)
        if len(selected) >= limit:
            break
    return selected


def select_option_discussion_comments(
    comments: list[ParsedComment],
    option: dict,
    community_answer: list[str],
    options: list[dict],
    limit: int = 2,
) -> list[ParsedComment]:
    """Keep consensus-aligned comments that help explain or eliminate an option."""
    correct_set = set(community_answer)

    candidates = []
    for comment in comments:
        if not is_substantive_comment(comment):
            continue
        if comment_supports_answer(comment, community_answer, options) and comment_mentions_option(comment, option):
            candidates.append(comment)

    candidates.sort(
        key=lambda comment: (
            not comment.highly_voted,
            not (comment.selected_answer and set(comment.selected_answer) == correct_set),
            -len(comment.text),
        )
    )

    selected: list[ParsedComment] = []
    seen_texts: set[str] = set()
    for comment in candidates:
        normalized = comment.text.lower()
        if normalized in seen_texts:
            continue
        selected.append(comment)
        seen_texts.add(normalized)
        if len(selected) >= limit:
            break
    return selected


def serialize_comment(comment: ParsedComment) -> dict:
    return {
        "author": comment.author,
        "age": comment.age,
        "highlyVoted": comment.highly_voted,
        "selectedAnswer": comment.selected_answer,
        "text": truncate_comment(comment.text),
    }


def choose_community_answer(
    options: list[dict],
    official_answer: list[str],
    votes: list[dict],
    marked_keys: list[str],
) -> tuple[list[str], str]:
    option_keys = {option["key"] for option in options}
    ranked_votes = sorted(votes, key=lambda vote: -vote["percent"])
    if ranked_votes:
        candidate = ranked_votes[0]["answer"]
        if candidate and set(candidate).issubset(option_keys):
            return candidate, "community-vote"
    if marked_keys and set(marked_keys).issubset(option_keys):
        return marked_keys, "most-voted-marker"
    if official_answer and set(official_answer).issubset(option_keys):
        return official_answer, "official-answer-fallback"
    raise ValueError("no valid answer")


def build_learning_data(
    question: dict,
    official_answer: list[str],
    votes: list[dict],
    comments: list[ParsedComment],
) -> tuple[dict, dict]:
    answer_set = set(question["answer"])
    answer_text = " / ".join(
        f'{option["key"]}. {option["text"]}'
        for option in question["options"]
        if option["key"] in answer_set
    )
    selected_comments = select_discussion_comments(
        comments,
        question["answer"],
        question["options"],
    )
    supporting_comment = next(
        (
            comment
            for comment in selected_comments
            if comment_supports_answer(comment, question["answer"], question["options"])
        ),
        selected_comments[0] if selected_comments else None,
    )
    summary = truncate_comment(supporting_comment.text) if supporting_comment else ""
    vote_text = ", ".join(
        f'{"".join(vote["answer"])} {vote["percent"]:g}%'
        for vote in votes[:6]
    )
    official_text = "".join(official_answer)
    community_text = "".join(question["answer"])
    conflict = official_answer != question["answer"]

    if summary:
        key_point = f"社区最高票选择 {community_text}：{answer_text}。讨论依据：{summary}"
    else:
        key_point = f"社区最高票选择 {community_text}：{answer_text}。"

    if conflict:
        speed_tip = (
            f"练习按社区最高票 {community_text} 判定；PDF 原始答案为 {official_text}，"
            "两者存在分歧，复习时优先核对题干限制与讨论依据。"
        )
    else:
        speed_tip = f"练习按社区最高票 {community_text} 判定；PDF 原始答案与社区投票一致。"

    study_notes = []
    if vote_text:
        study_notes.append(f"社区投票：{vote_text}。")
    if summary:
        study_notes.append(f"高赞讨论：{summary}")
    if conflict:
        study_notes.append(f"争议记录：原始答案 {official_text}，社区最高票 {community_text}。")

    option_explanations = []
    for option in question["options"]:
        is_correct = option["key"] in answer_set
        if is_correct:
            explanation = (
                f"{option['key']}. {option['text']} 与题干限制的匹配度最高，"
                "也是本题采用的 community consensus（社区共识）。"
            )
            if summary:
                explanation += f" Discussion evidence（讨论依据）：{summary}"
        else:
            explanation = (
                f"{option['key']}. {option['text']} 代表一个相关概念，但它的典型用途"
                f"没有直接覆盖本题的关键限制；相比之下，{answer_text} 与题意更直接对应。"
            )
        option_explanations.append(
            {
                "key": option["key"],
                "isCorrect": is_correct,
                "explanation": explanation,
            }
        )

    learning = {
        "keyPointHtml": html.escape(key_point),
        "speedTipHtml": html.escape(speed_tip),
        "studyNotesHtml": [html.escape(note) for note in study_notes],
        "keywords": [answer_text],
        "options": option_explanations,
    }
    why_not_choose = [
        {
            "key": option["key"],
            "text": option["text"],
            "reason": explanation["explanation"],
        }
        for option, explanation in zip(question["options"], option_explanations, strict=True)
        if option["key"] not in answer_set
    ]
    analysis = {
        "source": "security-plus",
        "outline": [
            f"社区最高票答案：{community_text}。",
            f"PDF 原始答案：{official_text}。",
            f"投票分布：{vote_text}。" if vote_text else "PDF 未提供可解析的投票分布。",
        ],
        "whyChoose": summary or f"社区最高票指向 {answer_text}。",
        "whyNotChoose": why_not_choose,
    }
    discussion = {
        "summary": summary,
        "voteDistribution": votes,
        "highlights": [serialize_comment(comment) for comment in selected_comments],
        "optionAnalysisEvidence": {
            option["key"]: [
                serialize_comment(comment)
                for comment in select_option_discussion_comments(
                    comments,
                    option,
                    question["answer"],
                    question["options"],
                )
            ]
            for option in question["options"]
        },
    }
    return learning, {"analysis": analysis, "discussion": discussion}


def parse_question_block(block: str) -> dict:
    lines = normalize_lines(block)
    if not lines:
        raise ValueError("empty block")
    header = HEADER_RE.match(lines[0])
    if not header:
        raise ValueError("unexpected header")

    question_id = int(header.group(1))
    topic = header.group(2)
    answer_index = next(
        (index for index, line in enumerate(lines) if OFFICIAL_ANSWER_RE.match(line)),
        None,
    )
    if answer_index is None:
        raise ValueError("missing official answer")

    official_match = OFFICIAL_ANSWER_RE.match(lines[answer_index])
    official_answer = parse_answer_keys(official_match.group(1))
    stem_lines: list[str] = []
    options: list[dict] = []
    marked_keys: list[str] = []

    for line in lines[1:answer_index]:
        if line.lower() == "most voted" and options:
            if options[-1]["key"] not in marked_keys:
                marked_keys.append(options[-1]["key"])
            continue

        option_match = OPTION_RE.match(line)
        if option_match:
            key = option_match.group(1)
            raw_text = option_match.group(2)
            is_most_voted = bool(MOST_VOTED_RE.search(raw_text))
            option_text = clean_text(MOST_VOTED_RE.sub("", raw_text))
            if not option_text:
                option_text = SPECIAL_IMAGE_OPTIONS.get(question_id, {}).get(key, "")
            if not option_text:
                raise ValueError(f"blank option {key}")
            options.append({"key": key, "text": option_text})
            if is_most_voted:
                marked_keys.append(key)
            continue

        if options:
            is_most_voted = bool(MOST_VOTED_RE.search(line))
            continuation = clean_text(MOST_VOTED_RE.sub("", line))
            if is_most_voted and options[-1]["key"] not in marked_keys:
                marked_keys.append(options[-1]["key"])
            if continuation:
                options[-1]["text"] = clean_text(
                    f'{options[-1]["text"]} {continuation}'
                )
        else:
            stem_lines.append(line)

    validate_option_sequence(options)
    stem = clean_text(" ".join(stem_lines))
    if not stem:
        raise ValueError("missing stem")

    comments_index = next(
        (index for index in range(answer_index + 1, len(lines)) if lines[index].lower() == "comments"),
        len(lines),
    )
    vote_lines = lines[answer_index + 1 : comments_index]
    votes = [
        {"answer": parse_answer_keys(match.group(1)), "percent": float(match.group(2))}
        for match in VOTE_RE.finditer(" ".join(vote_lines))
    ]
    votes.sort(key=lambda vote: -vote["percent"])
    comments = parse_comments(lines[comments_index + 1 :]) if comments_index < len(lines) else []
    community_answer, answer_source = choose_community_answer(
        options,
        official_answer,
        votes,
        marked_keys,
    )

    question = {
        "id": question_id,
        "topic": topic,
        "stem": stem,
        "options": options,
        "answer": community_answer,
        "type": "single" if len(community_answer) == 1 else "multiple",
        "officialAnswer": official_answer,
        "answerSource": answer_source,
    }
    learning, extra = build_learning_data(question, official_answer, votes, comments)
    question["learning"] = learning
    question.update(extra)
    return question


def extract_security_plus_questions(pdf_path: Path) -> tuple[list[dict], dict]:
    reader = PdfReader(str(pdf_path))
    full_text = "\n".join((page.extract_text() or "") for page in reader.pages)
    blocks = []
    for block in QUESTION_SPLIT_RE.split(full_text):
        lines = normalize_lines(block)
        if lines and HEADER_RE.match(lines[0]):
            blocks.append(block)
    questions: list[dict] = []
    skipped: list[dict] = []
    reasons: Counter[str] = Counter()

    for block in blocks:
        header = HEADER_RE.match(normalize_lines(block)[0])
        question_id = int(header.group(1)) if header else None
        try:
            questions.append(parse_question_block(block))
        except ValueError as error:
            reason = str(error).split(":", 1)[0]
            skipped.append({"id": question_id, "reason": str(error)})
            reasons[reason] += 1

    duplicate_ids = [
        question_id
        for question_id, count in Counter(question["id"] for question in questions).items()
        if count > 1
    ]
    report = {
        "pageCount": len(reader.pages),
        "blockCount": len(blocks),
        "parsedCount": len(questions),
        "skippedCount": len(skipped),
        "skipped": skipped,
        "reasonCounts": dict(reasons),
        "duplicateIds": duplicate_ids,
        "communityAnswerCount": sum(
            question["answerSource"] != "official-answer-fallback" for question in questions
        ),
        "answerConflictCount": sum(
            question["answer"] != question["officialAnswer"] for question in questions
        ),
        "discussionSummaryCount": sum(
            bool(question.get("discussion", {}).get("summary")) for question in questions
        ),
    }
    return questions, report


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()

    questions, report = extract_security_plus_questions(args.input)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(questions, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(
            json.dumps(report, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
