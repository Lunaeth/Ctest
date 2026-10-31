import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { escapeHtml, emphasizeKeywords } from '../src/learning-annotations.js';
import { getAiStudyModules } from '../src/ai-study.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'scripts/ai-study-content');
const bilingual = (value, keywords = []) => `${emphasizeKeywords(value.zh, keywords)}<br><span lang="en" class="ai-english">${emphasizeKeywords(value.en, keywords)}</span>`;
const text = (value) => `${value.zh}\n${value.en}`;
const pair = (value, label) => {
  if (!value?.en?.trim() || !value?.zh?.trim() || !/[\u3400-\u9fff]/u.test(value.zh)) throw new Error(`Missing bilingual content: ${label}`);
};
const coverage = {};
for (const bank of ['ccnp-dcai', 'nca-aiio']) {
  const entries = [];
  for (const name of (await fs.readdir(contentDir)).filter((name) => name.startsWith(`${bank}-`) && name.endsWith('.mjs')).sort()) {
    entries.push(...(await import(pathToFileURL(path.join(contentDir, name)).href)).default);
  }
  const reviews = new Map();
  for (const entry of entries) {
    if (reviews.has(entry.id)) throw new Error(`Duplicate ${bank} review ${entry.id}`);
    reviews.set(entry.id, entry);
  }
  const reviewed = [];
  const pending = [];
  for (const suffix of ['', '.review']) {
    const filename = path.join(root, `data/questions.${bank}${suffix}.json`);
    const questions = JSON.parse(await fs.readFile(filename, 'utf8'));
    for (const question of questions) {
      const entry = reviews.get(question.id);
      if (!entry) { pending.push(question.id); continue; }
      if (!entry.stemZh || !entry.module || !entry.sources?.length || !entry.reviewNote) throw new Error(`Incomplete review ${bank} ${question.id}`);
      if (!getAiStudyModules(bank==='ccnp-dcai'?'ccnpDcai':'ncaAiio').some(module=>module.id===entry.module)) throw new Error(`Unknown study module ${bank} ${question.id}: ${entry.module}`);
      for (const key of ['summary', 'memory', 'pitfall']) pair(entry[key], `${bank} ${question.id} ${key}`);
      if (!entry.steps?.length || !entry.terms?.length) throw new Error(`Missing study notes ${bank} ${question.id}`);
      entry.steps.forEach((step) => pair(step, `${question.id} step`));
      entry.terms.forEach((term) => pair(term, `${question.id} term`));
      for (const ref of entry.sources) {
        if (!ref.title || !ref.supports || !/^https:\/\//.test(ref.url)) throw new Error(`Invalid source ${question.id}`);
      }
      if (question.type === 'review') {
        const candidates = Object.entries(entry.options ?? {});
        if (!candidates.length || !entry.matches?.length) throw new Error(`Missing review choices/matches ${question.id}`);
        for (const [key, detail] of candidates) {
          pair(detail, `${question.id}${key} label`);
          pair(detail.reason, `${question.id}${key} reason`);
        }
        for (const match of entry.matches) {
          pair(match.prompt, `${question.id} match prompt`);
          if (!entry.options[match.answerKey]) throw new Error(`Unknown matched choice ${question.id}`);
        }
      }
      const keys = new Set((question.options ?? []).map((option) => option.key));
      if (question.type !== 'review') {
        if (!entry.answer?.length || entry.answer.some((key) => !keys.has(key))) throw new Error(`Invalid answer ${question.id}`);
        if (Object.keys(entry.options).length !== keys.size) throw new Error(`Incomplete options ${question.id}`);
        question.options.forEach((option) => {
          const detail = entry.options[option.key];
          if (!detail?.zh) throw new Error(`Missing option translation ${question.id}${option.key}`);
          pair(detail.reason, `${question.id}${option.key}`);
        });
      }
      if (question.type !== 'review') question.originalAnswer ??= [...question.answer];
      question.originalExplanation ??= question.explanation;
      question.originalAnswerSource ??= question.answerSource;
      question.answerSource = 'primary-reference-review';
      if (entry.stemEn !== undefined) {
        if (typeof entry.stemEn !== 'string' || !entry.stemEn.trim()) throw new Error(`Invalid stem correction ${bank} ${question.id}`);
        question.originalStem ??= question.stem;
        question.originalType ??= question.type;
        question.stem = entry.stemEn;
      }
      if (question.type === 'review') {
        question.aiStudy = { ...entry, bankId: bank === 'ccnp-dcai' ? 'ccnpDcai' : 'ncaAiio', reviewedAt: '2026-10-30' };
        question.explanation = text(entry.summary);
        reviewed.push(question.id);
        continue;
      }
      if (question.type !== 'review') {
        question.answer = [...entry.answer];
        question.type = entry.answer.length > 1 ? 'multiple' : 'single';
      }
      question.options.forEach((option) => {
        const correction = entry.options[option.key]?.en;
        if (correction !== undefined) {
          if (typeof correction !== 'string' || !correction.trim()) throw new Error(`Invalid option correction ${question.id}${option.key}`);
          option.originalText ??= option.text;
          option.text = correction;
        }
      });
      question.aiStudy = { ...entry, bankId: bank === 'ccnp-dcai' ? 'ccnpDcai' : 'ncaAiio', reviewedAt: '2026-10-30' };
      question.explanation = text(entry.summary);
      question.analysis = {
        source: 'ai-reviewed',
        sources: entry.sources,
        outline: entry.steps.map(text),
        whyChoose: text(entry.summary),
        whyNotChoose: question.options.filter((o) => !question.answer.includes(o.key)).map((o) => ({key:o.key,text:o.text,reason:text(entry.options[o.key].reason)})),
      };
      const keywords = entry.terms.flatMap((term) => [term.en, term.zh]);
      question.learning = {
        stemHtml: emphasizeKeywords(question.stem, keywords),
        keyPointHtml: bilingual(entry.summary, keywords),
        speedTipHtml: bilingual(entry.memory, keywords),
        studyNotesHtml: [bilingual(entry.pitfall, keywords), ...entry.steps.map((step) => bilingual(step, keywords))],
        studyTags: [entry.module],
        keywords,
        options: question.options.map((option) => ({
          key: option.key, isCorrect: question.answer.includes(option.key),
          explanation: text(entry.options[option.key].reason),
          explanationHtml: bilingual(entry.options[option.key].reason, keywords),
        })),
      };
      question.options.forEach((option) => { delete option.translationZh; });
      reviewed.push(question.id);
    }
    await fs.writeFile(filename, JSON.stringify(questions, null, 2) + '\n');
  }
  const allIds = new Set([...reviewed, ...pending]);
  for (const id of reviews.keys()) if (!allIds.has(id)) throw new Error(`Review has no source question: ${bank} ${id}`);
  coverage[bank] = {total: allIds.size, reviewed:reviewed.sort((a,b)=>a-b), pending:pending.sort((a,b)=>a-b)};
}
await fs.mkdir(path.join(root, 'docs/ai-audit'), {recursive:true});
await fs.writeFile(path.join(root, 'docs/ai-audit/coverage.json'), JSON.stringify(coverage,null,2)+'\n');
console.log(JSON.stringify(coverage));
if (process.argv.includes('--require-complete') && Object.values(coverage).some((bank) => bank.pending.length)) {
  throw new Error('Full-bank review is incomplete. Do not publish this as a completed audit.');
}
