function shuffleIds(ids) {
  const copy = [...ids];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}

function hydrateProgress(session, questions, progress = {}) {
  session.order.forEach((questionId) => {
    const progressEntry = progress[questionId];
    if (!progressEntry || !Array.isArray(progressEntry.selectedAnswer)) return;

    session.answers[questionId] = [...progressEntry.selectedAnswer];
    session.feedback[questionId] = gradePracticeAnswer(
      questions.find((question) => question.id === questionId),
      progressEntry.selectedAnswer,
    );
  });

  return session;
}

function normalizeSessionLabel(value) {
  const label = String(value ?? '').trim();
  return label ? label.slice(0, 80) : '';
}

function normalizeSessionSource(source) {
  const label = normalizeSessionLabel(source?.label);
  const url = String(source?.url ?? '').trim();
  if (!label || !url) return null;

  return {
    label,
    url: url.slice(0, 240),
  };
}

export function createPracticeSession(questions, mode = 'sequential') {
  const ids = questions.map((question) => question.id);
  return {
    mode,
    order: mode === 'random' ? shuffleIds(ids) : ids,
    currentIndex: 0,
    hydrateFromProgress: true,
    revealedAnswerIds: [],
    answers: {},
    feedback: {},
  };
}

export function restorePracticeSession(questions, persistedSession, progress = {}) {
  const ids = questions.map((question) => question.id);
  const validOrder = Array.isArray(persistedSession?.order)
    ? persistedSession.order.filter((questionId) => ids.includes(questionId))
    : [];

  if (!validOrder.length) {
    return hydrateProgress(
      createPracticeSession(questions, persistedSession?.mode ?? 'sequential'),
      questions,
      progress,
    );
  }

  const maxIndex = validOrder.length - 1;
  const currentIndex = Number.isInteger(persistedSession?.currentIndex)
    ? Math.min(Math.max(persistedSession.currentIndex, 0), maxIndex)
    : 0;
  const session = {
    mode: persistedSession?.mode === 'random' ? 'random' : 'sequential',
    label: normalizeSessionLabel(persistedSession?.label),
    source: normalizeSessionSource(persistedSession?.source),
    order: validOrder,
    currentIndex,
    hydrateFromProgress: persistedSession?.hydrateFromProgress !== false,
    showAnswerReview: persistedSession?.showAnswerReview === true,
    revealedAnswerIds: [],
    answers: {},
    feedback: {},
  };

  if (session.showAnswerReview) {
    session.revealedAnswerIds = [...validOrder];
    for (const questionId of validOrder) {
      const question = questions.find((item) => item.id === questionId);
      if (!question) continue;
      session.answers[questionId] = [...question.answer];
      session.feedback[questionId] = gradePracticeAnswer(question, question.answer);
    }
    return session;
  }

  if (session.hydrateFromProgress === false) {
    return session;
  }

  return hydrateProgress(session, questions, progress);
}

export function snapshotPracticeSession(session) {
  if (!session) return null;
  const snapshot = {
    mode: session.mode,
    order: [...session.order],
    currentIndex: session.currentIndex,
  };
  const label = normalizeSessionLabel(session.label);
  const source = normalizeSessionSource(session.source);

  if (label) {
    snapshot.label = label;
  }

  if (source) {
    snapshot.source = source;
  }

  if (session.hydrateFromProgress === false) {
    snapshot.hydrateFromProgress = false;
  }

  if (session.showAnswerReview === true) {
    snapshot.showAnswerReview = true;
  }

  return snapshot;
}

export function gradePracticeAnswer(question, selectedKeys) {
  const normalized = [...selectedKeys].sort();
  const expected = [...question.answer].sort();
  return {
    correct: normalized.join('|') === expected.join('|'),
    selectedAnswer: normalized,
    correctAnswer: expected,
  };
}
