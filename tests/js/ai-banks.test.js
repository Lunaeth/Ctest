import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createInitialState, setActiveBank } from '../../src/state.js';
import { createPracticeSession, gradePracticeAnswer } from '../../src/practice.js';
import { createExamSession, gradeExamSession } from '../../src/exam.js';
import { renderPracticeView } from '../../src/views/practice-view.js';
import { renderExamView } from '../../src/views/exam-view.js';
import { renderLearningView } from '../../src/views/learning-view.js';
import { renderMistakesView } from '../../src/views/mistakes-view.js';
import { renderReviewQuestions } from '../../src/ai-review.js';

const read = (name) => JSON.parse(fs.readFileSync(`data/${name}`, 'utf8'));
const ccnp = read('questions.ccnp-dcai.json');
const nca = read('questions.nca-aiio.json');
const review = read('questions.ccnp-dcai.review.json');

test('AI PDF banks preserve all source IDs, valid answers, and referenced illustrations', () => {
  assert.equal(ccnp.length, 56);
  assert.equal(nca.length, 116);
  assert.deepEqual(review.map((q) => q.id), [3, 11, 29, 36]);
  assert.deepEqual([...ccnp, ...review].map((q) => q.id).sort((a, b) => a - b), Array.from({ length: 60 }, (_, i) => i + 1));
  assert.deepEqual(nca.map((q) => q.id), Array.from({ length: 116 }, (_, i) => i + 1));
  for (const q of [...ccnp, ...nca, ...review]) {
    assert.ok(q.stem.trim().length, `${q.id}: missing stem`);
    assert.ok(q.source.page > 0);
    assert.equal(q.answerSource, 'provided-pdf');
    assert.ok(q.explanation.length);
    assert.doesNotMatch(q.stem, /Answer:|Explanation|QUESTION\s+\d|Question #:/);
    assert.doesNotMatch(JSON.stringify(q), /\ufffd|54043FF|店铺|Cisco - 300-640/);
    for (const image of [...q.images, ...(q.answerImages ?? [])]) assert.ok(fs.existsSync(image), image);
    if (q.type === 'review') {
      assert.ok(q.images.length && q.answerImages.length);
      continue;
    }
    assert.deepEqual(q.options.map((o) => o.key), 'ABCDEFGH'.slice(0, q.options.length).split(''));
    for (const option of q.options) {
      assert.ok(option.text.length);
      assert.doesNotMatch(option.text, /Correct Answer|Explanation\/Reference|Question #:/);
    }
    assert.ok(q.answer.length && q.answer.every((a) => q.options.some((o) => o.key === a)));
    assert.equal(q.type, q.answer.length > 1 ? 'multiple' : 'single');
    assert.equal(gradePracticeAnswer(q, q.answer).correct, true);
    if (q.type === 'multiple') assert.equal(gradePracticeAnswer(q, q.answer.slice(0, 1)).correct, false);
  }
  for (const bank of [ccnp, nca]) assert.equal(bank.filter((q) => q.type === 'multiple').length, 4);
});

test('AI progress and favourites remain independent of Core 2 after switching and reload', () => {
  const progress = { 1: { selectedAnswer: ['B'], correct: false } };
  const state = createInitialState(ccnp, {
    preferences: { activeBankId: 'ccnpDcai' },
    progress: { core2: progress }, favorites: { core2: [1] },
  });
  state.progress[1] = { selectedAnswer: ['A'], correct: true };
  state.favorites.push(2);
  setActiveBank(state, nca, 'ncaAiio');
  assert.deepEqual(state.progress, {});
  assert.deepEqual(state.favorites, []);
  state.favorites.push(3);
  const restored = createInitialState(ccnp, {
    preferences: { activeBankId: 'ccnpDcai' }, progress: state.progressByBank,
    favorites: state.favoritesByBank,
  });
  assert.deepEqual(restored.favorites, [2]);
  assert.deepEqual(restored.progress[1].selectedAnswer, ['A']);
  assert.deepEqual(restored.progressByBank.core2, progress);
  assert.deepEqual(restored.favoritesByBank.ncaAiio, [3]);
});

test('AI exams score only supported questions and handle smaller banks', () => {
  for (const bank of [ccnp, nca]) {
    const session = createExamSession(bank);
    assert.equal(session.order.length, Math.min(90, bank.length));
    for (const id of session.order) session.answers[id] = bank.find((q) => q.id === id).answer;
    const result = gradeExamSession(session, bank);
    assert.equal(result.score, session.order.length);
    assert.deepEqual(result.wrongIds, []);
  }
});

test('CCNP exhibits appear in every question view and PBQ answers stay in disclosures', () => {
  const q = ccnp.find((q) => q.id === 28);
  assert.equal(q.images.length, 1);
  const session = createPracticeSession(ccnp);
  for (const html of [
    renderPracticeView(q, session, null), renderExamView(q, session),
    renderLearningView(q, 25, 56, 'CCNP-DCAI', { activeBankId: 'ccnpDcai' }),
    renderMistakesView([q], 'CCNP-DCAI'),
  ]) assert.ok(html.includes(q.images[0]));
  const html = renderReviewQuestions(review);
  assert.equal((html.match(/<details>/g) ?? []).length, 4);
  assert.doesNotMatch(html, /<details open/);
  for (const q of review) assert.ok(html.includes(q.answerImages[0]));
  const ncaHtml = renderLearningView(nca[0], 0, 116, 'NCA-AIIO', { activeBankId: 'ncaAiio' });
  assert.doesNotMatch(ncaHtml, /network-map\.html|core2-visual\.html/);
});
