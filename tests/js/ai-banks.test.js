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
    assert.equal(q.answerSource, q.aiStudy ? 'primary-reference-review' : 'provided-pdf');
    if(q.aiStudy) assert.equal(q.originalAnswerSource, 'provided-pdf');
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
  for (const bank of [ccnp, nca]) assert.equal(bank.filter((q) => (q.originalAnswer ?? q.answer).length > 1).length, 4);
  assert.equal(ccnp.filter((q) => q.type === 'multiple').length, 4);
  assert.equal(nca.filter((q) => q.type === 'multiple').length, 5);
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

test('reviewed DGX BMC answer replaces the PDF key in practice and exam scoring', () => {
  const question = nca.find((q) => q.id === 85);
  assert.deepEqual(question.originalAnswer, ['C']);
  assert.deepEqual(question.answer, ['A']);
  assert.equal(gradePracticeAnswer(question, ['A']).correct, true);
  assert.equal(gradePracticeAnswer(question, ['C']).correct, false);
  const exam = createExamSession([question]);
  exam.answers[85] = ['C'];
  assert.deepEqual(gradeExamSession(exam, [question]).wrongIds, [85]);
  exam.answers[85] = ['A'];
  assert.equal(gradeExamSession(exam, [question]).score, 1);
});

test('ambiguous AIIO operations question explicitly requests both supported benefits', () => {
  const q = nca.find((question) => question.id === 104);
  assert.equal(q.originalType, 'single');
  assert.deepEqual(q.originalAnswer, ['C']);
  assert.match(q.originalStem, /current driver/);
  assert.match(q.stem, /Choose two/);
  assert.equal(q.type, 'multiple');
  assert.deepEqual(q.answer, ['C', 'D']);
  assert.equal(gradePracticeAnswer(q, ['C']).correct, false);
  assert.equal(gradePracticeAnswer(q, ['D', 'C']).correct, true);
  const exam = createExamSession([q]);
  exam.answers[104] = ['C','D'];
  assert.equal(gradeExamSession(exam, [q]).score, 1);
  assert.match(renderExamView(q,exam), /Choose two/);
  assert.doesNotMatch(renderExamView(q,exam), /current driver/);
});

test('DCAI 96-GPU template correction changes practice and exam grading while retaining its source key', () => {
  const q = ccnp.find((question) => question.id === 26);
  assert.deepEqual(q.originalAnswer, ['A']);
  assert.deepEqual(q.answer, ['B']);
  assert.match(q.stem, /2025 BRKDCN-2677 \(slide 44\)/);
  assert.ok(q.originalStem && q.originalStem !== q.stem);
  assert.equal(gradePracticeAnswer(q, ['A']).correct, false);
  assert.equal(gradePracticeAnswer(q, ['B']).correct, true);
  const exam = createExamSession([q]);
  exam.answers[26] = ['A'];
  assert.deepEqual(gradeExamSession(exam, [q]).wrongIds, [26]);
  exam.answers[26] = ['B'];
  assert.equal(gradeExamSession(exam, [q]).score, 1);
});

test('DCAI corrected template regrades saved choices on load and bank switch without crossing bank boundaries', () => {
  for (const viaSwitch of [false, true]) {
    for (const choice of ['A', 'B']) {
      const previouslyCorrect = choice === 'A';
      const otherBank = {26:{correct:previouslyCorrect,selectedAnswer:[choice]}};
      const persisted = {
        preferences:{activeBankId:viaSwitch?'ncaAiio':'ccnpDcai',autoRemoveCorrectMistakes:true},
        progress:{ccnpDcai:structuredClone(otherBank),core2:structuredClone(otherBank)},
        mistakes:{ccnpDcai:previouslyCorrect?[]:[26],core2:[26]},
        favorites:{ccnpDcai:[26],core2:[26]},
      };
      const before = structuredClone(persisted);
      const state = createInitialState(viaSwitch?nca:ccnp, persisted);
      if (viaSwitch) setActiveBank(state, ccnp, 'ccnpDcai');
      assert.equal(state.progress[26].correct, choice === 'B');
      assert.deepEqual(state.progress[26].selectedAnswer, [choice]);
      assert.equal(state.progress[26].answerReview.previousCorrect, previouslyCorrect);
      assert.deepEqual(state.progress[26].answerReview.answer, ['B']);
      assert.deepEqual(state.mistakes, choice==='A'?[26]:[]);
      assert.deepEqual(state.favorites, [26]);
      assert.deepEqual(state.progressByBank.core2, otherBank);
      assert.deepEqual(state.mistakesByBank.core2, [26]);
      assert.deepEqual(state.favoritesByBank.core2, [26]);
      assert.deepEqual(persisted, before);
    }
  }
});

test('audited answer corrections regrade saved selections on startup without changing other bank records', () => {
  const persisted = {
    preferences: { activeBankId: 'ncaAiio' },
    progress: { ncaAiio: {85:{correct:true,selectedAnswer:['C']}}, core2:{85:{correct:true,selectedAnswer:['C']}} },
    mistakes: { ncaAiio: [], core2:[12] },
    favorites: { ncaAiio:[85] },
  };
  const snapshot = structuredClone(persisted);
  const state = createInitialState(nca, persisted);
  assert.equal(state.progress[85].correct, false);
  assert.deepEqual(state.progress[85].selectedAnswer, ['C']);
  assert.deepEqual(state.progress[85].answerReview.answer, ['A']);
  assert.equal(state.progress[85].answerReview.previousCorrect, true);
  assert.deepEqual(state.mistakes, [85]);
  assert.deepEqual(state.favorites, [85]);
  assert.deepEqual(state.progressByBank.core2, persisted.progress.core2);
  assert.deepEqual(state.mistakesByBank.core2, [12]);
  assert.deepEqual(persisted, snapshot);
  // Once regraded, a later manual removal is not undone by every reload.
  const reloaded = createInitialState(nca, {
    ...persisted, progress: state.progressByBank, mistakes: {ncaAiio:[]},
  });
  assert.deepEqual(reloaded.mistakes, []);
});

test('answer corrections on bank switch honor the preference for retaining previously wrong answers', () => {
  for (const retain of [false, true]) {
    const state = createInitialState(ccnp, {
      preferences:{activeBankId:'ccnpDcai',autoRemoveCorrectMistakes:!retain},
      progress:{ncaAiio:{85:{correct:false,selectedAnswer:['A']}}},
      mistakes:{ncaAiio:[85]},
    });
    setActiveBank(state,nca,'ncaAiio');
    assert.equal(state.progress[85].correct,true);
    assert.deepEqual(state.progress[85].selectedAnswer,['A']);
    assert.deepEqual(state.mistakes,retain?[85]:[]);
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
