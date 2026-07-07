import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createPracticeSession,
  gradePracticeAnswer,
  restorePracticeSession,
  snapshotPracticeSession,
} from '../../src/practice.js';

const sampleQuestions = [
  { id: 1, answer: ['A'], options: [{ key: 'A' }, { key: 'B' }] },
  { id: 2, answer: ['C'], options: [{ key: 'C' }, { key: 'D' }] },
];

test('createPracticeSession preserves sequential order', () => {
  const session = createPracticeSession(sampleQuestions, 'sequential');
  assert.deepEqual(session.order, [1, 2]);
});

test('gradePracticeAnswer marks a correct answer', () => {
  const result = gradePracticeAnswer(sampleQuestions[0], ['A']);
  assert.equal(result.correct, true);
  assert.deepEqual(result.correctAnswer, ['A']);
});

test('gradePracticeAnswer marks a wrong answer', () => {
  const result = gradePracticeAnswer(sampleQuestions[0], ['B']);
  assert.equal(result.correct, false);
});

test('restorePracticeSession preserves saved order and index while hydrating progress', () => {
  const session = restorePracticeSession(
    sampleQuestions,
    {
      mode: 'random',
      order: [2, 1],
      currentIndex: 1,
    },
    {
      2: { selectedAnswer: ['D'] },
    },
  );

  assert.equal(session.mode, 'random');
  assert.deepEqual(session.order, [2, 1]);
  assert.equal(session.currentIndex, 1);
  assert.deepEqual(session.answers[2], ['D']);
  assert.equal(session.feedback[2].correct, false);
  assert.deepEqual(session.feedback[2].correctAnswer, ['C']);
});

test('restorePracticeSession keeps retry sessions blank instead of reusing old selected answers', () => {
  const session = restorePracticeSession(
    sampleQuestions,
    {
      mode: 'sequential',
      order: [2, 1],
      currentIndex: 0,
      hydrateFromProgress: false,
    },
    {
      2: { selectedAnswer: ['D'] },
      1: { selectedAnswer: ['B'] },
    },
  );

  assert.deepEqual(session.order, [2, 1]);
  assert.deepEqual(session.answers, {});
  assert.deepEqual(session.feedback, {});
});

test('restorePracticeSession reveals answers for review sessions', () => {
  const session = restorePracticeSession(
    sampleQuestions,
    {
      mode: 'sequential',
      order: [2, 1],
      currentIndex: 0,
      hydrateFromProgress: false,
      showAnswerReview: true,
    },
    {
      2: { selectedAnswer: ['D'] },
      1: { selectedAnswer: ['B'] },
    },
  );

  assert.equal(session.showAnswerReview, true);
  assert.deepEqual(session.revealedAnswerIds, [2, 1]);
  assert.deepEqual(session.answers[2], ['C']);
  assert.equal(session.feedback[2].correct, true);
  assert.deepEqual(snapshotPracticeSession(session), {
    mode: 'sequential',
    order: [2, 1],
    currentIndex: 0,
    hydrateFromProgress: false,
    showAnswerReview: true,
  });
});

test('snapshot and restore preserve focused practice label and source', () => {
  const session = restorePracticeSession(
    sampleQuestions,
    {
      mode: 'sequential',
      label: 'Core 2 图谱筛选：vpn remote',
      source: {
        label: '返回图谱：vpn remote',
        url: './core2-visual.html?v=test&q=vpn%20remote#symptom-remote-windows-pc',
      },
      order: [1, 2],
      currentIndex: 0,
      hydrateFromProgress: false,
    },
  );

  assert.equal(session.label, 'Core 2 图谱筛选：vpn remote');
  assert.deepEqual(session.source, {
    label: '返回图谱：vpn remote',
    url: './core2-visual.html?v=test&q=vpn%20remote#symptom-remote-windows-pc',
  });
  assert.deepEqual(snapshotPracticeSession(session), {
    mode: 'sequential',
    order: [1, 2],
    currentIndex: 0,
    label: 'Core 2 图谱筛选：vpn remote',
    source: {
      label: '返回图谱：vpn remote',
      url: './core2-visual.html?v=test&q=vpn%20remote#symptom-remote-windows-pc',
    },
    hydrateFromProgress: false,
  });
});
