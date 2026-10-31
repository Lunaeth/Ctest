# AI study feature implementation — 2026-10-30

## Implemented

- Both banks use explicit authored topic assignments, not inferred PDF topic headings. DCAI has eight modules and AIIO ten. The compiler rejects unknown module IDs. Module counts exclude illustrated self-review items from scored practice.
- `ai-map.html` provides bank/module selection, English/Chinese multi-term search, all 176 question cards, per-question reasoning flow, memory cues, scope warnings, terminology, primary-reference links and related questions. Related links use shared reviewed terms and topic membership within the same bank. Superseded source wording/keys are not searched as current knowledge.
- Topic nodes link to learning and focused practice. Each scored question opens its exact bank, module and source ID. Illustrated items open their existing closed-disclosure review page, not a scored practice session.
- Deep links are validated against the requested bank before changing active state. Navigation parameters are consumed, so refreshing an active exercise restores its current location instead of restarting at the original linked question. Unknown banks, modules and out-of-scope IDs do not create a session.
- Homepage and learning expose both maps. Learning, submitted practice, mistake review, exam mistakes and illustrated explanations expose terminology and targeted module-review links.
- AI practice uses its own question-specific bilingual summary, missing/extra-choice feedback, pitfalls and reasoning flow. Core 2 symptom matching and confusion tables are bypassed for AI questions. Practice feedback is not displayed before submission.
- Fixed a related existing edge case: module practice that happens to equal the favourites list must still start unanswered, rather than automatically adopting the favourites answer-review mode. Explicit favourites review retains its existing behavior.

## Evidence

264 JavaScript tests pass, including the full existing suite. New coverage verifies:

- Exact module coverage/counts and valid application links for every scored and illustrated question.
- Search behavior and exclusion of superseded wording; related-question bank boundaries.
- Every card's bilingual steps, facts, memory cues, pitfalls and references; safe text escaping.
- AI-specific feedback across all scored questions, with no Core 2 guide leakage and no feedback links before submission.
- App startup, bank switching, module targeting, exact question positioning, URL consumption, persisted progress/favourites, refresh and practice answer hiding.
- Page-controller failures/retry and race handling when a previous bank's response arrives after a newer selection.

The page-controller tests use DOM test doubles. They verify behavior but do not prove actual browser layout, keyboard accessibility, responsive rendering or real account persistence. Both-bank desktop/mobile acceptance, the final semantic audit, production Turnstile and API deployment remain required before release. This document does not claim the whole objective is complete.
