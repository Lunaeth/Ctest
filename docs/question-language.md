# Question language

AWS SAA, CCNP-DCAI and NCA-AIIO display English question stems and answer choices in study, practice, exams, mistake review and knowledge maps. DCAI illustrated matching prompts and candidates also use English. Chinese and bilingual explanations, memory aids and terminology remain available. Chinese interface controls are unchanged.

Regenerate the English AWS wording with `python scripts/build-aws-saa-english.py` and the AI study layer with `node scripts/build-ai-study.mjs --require-complete`. The AWS source is the 143 manually translated rows in `scripts/aws-saa-english/`; IDs, option order and answer keys remain unchanged. Before applying new OCR corrections, review the corresponding translation rows as well. The previous Chinese import is retained in Git history. These translations do not claim to reproduce an unavailable original English exam or independently validate its answer key.

## Incomplete AWS source text

The imported source contains truncated choices. Their English versions explicitly mark what is missing rather than inventing a distractor:

| Question | Choice | Missing content |
| --- | --- | --- |
| 42 | A | The remainder of the DynamoDB migration instruction |
| 45 | C | The service name after “Amazon” |
| 121 | B | The beginning of the parameter-store instruction, replaced by repeated question text |

The source screenshots were unavailable locally during translation. These three choices need the original images before their text can be completed. Other questionable source statements (for example question 50 B's public snapshot access and question 76 A's five-day interval) are translated as supplied; their answer keys have not been silently revised.
