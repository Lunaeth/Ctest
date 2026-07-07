import { getRouteLabel, navigate, normalizeRoute } from './router.js';
import { createStorageApi, DEFAULT_KEYS } from './storage.js';
import { createInitialState, DEFAULT_BANK_ID, getDashboardStats, setActiveBank } from './state.js';
import {
  createPracticeSession,
  gradePracticeAnswer,
  restorePracticeSession,
  snapshotPracticeSession,
} from './practice.js?v=20260706-favorite-review';
import {
  DEFAULT_EXAM_SIZE,
  createExamSession,
  gradeExamSession,
  restoreExamSession,
  snapshotExamSession,
} from './exam.js';
import { createArchivePayload, createLearningArchiveService } from './learning-archive.js';
import { applyStoredCore2Analyses, decorateCore2Questions } from './core2-analysis.js?v=20260707-core2-priority-feedback';
import {
  CORE2_SYMPTOM_MAP,
  getCore2SymptomGroup,
  getCore2SymptomId,
} from './core2-study-map.js?v=20260707-core2-process-flows';
import { applyLearningAnnotations } from './learning-annotations.js?v=20260707-core2-priority-feedback';
import {
  buildFavoriteSyncText,
  mergeFavoriteIds,
  parseFavoriteSyncText,
} from './favorite-sync.js';
import { sanitizeQuestionBankData } from './question-bank-sanitizer.js';
import {
  buildCore1ModuleStats,
  buildCore2ModuleStats,
} from './study-modules.js?v=20260707-core2-priority-feedback';
import { renderHomeView } from './views/home-view.js?v=20260707-core2-process-flows';
import { renderExamView } from './views/exam-view.js';
import { renderLearningView } from './views/learning-view.js?v=20260707-mobile-sync-portrait';
import { renderMistakesView } from './views/mistakes-view.js?v=20260707-core2-priority-feedback';
import { renderPracticeView } from './views/practice-view.js?v=20260707-mobile-sync-portrait';
import { renderResultsView } from './views/results-view.js';

const QUESTION_BANKS = [
  { id: 'zh', label: '中文题库', file: './data/questions.zh.json' },
  { id: 'en', label: 'Core 1 English Question Bank', file: './data/questions.en.json' },
  {
    id: 'core2',
    label: 'Core 2 English Question Bank',
    file: './data/questions.core2.json',
    analysisFiles: [
      './data/questions.core2.analysis.json',
      './data/questions.core2.curated.analysis.json',
    ],
  },
  { id: 'awsSaa', label: 'AWS SAA Screenshots', file: './data/questions.aws-saa.json' },
];
const QUESTION_BANK_MAP = new Map(QUESTION_BANKS.map((bank) => [bank.id, bank]));
const DEFAULT_LEARNING_BANK_ID = 'en';
const LEARNING_BANK_IDS = new Set(['en', 'core2']);
const CORE1_BANK_ID = 'en';
const CORE2_BANK_ID = 'core2';
const DEFAULT_LEARNING_MODULE_ID = 'all';
const POSITION_MEMORY_ROUTES = new Set(['mistakes']);
const POSITION_ANCHOR_SELECTOR = '.mistake-card[data-question-id]';
const POSITION_ANCHOR_VIEWPORT_LINE = 96;
const SIDEBAR_COLLAPSED_KEY = 'question-app.sidebarCollapsed';
const SIDEBAR_SHORT_LABELS = {
  home: '\u9996',
  practice: '\u7ec3',
  learn: '\u5b66',
  exam: '\u8003',
  mistakes: '\u9519',
};
const PENDING_CORE2_MODULE_PRACTICE_MAX_AGE_MS = 10 * 60 * 1000;
const CORE2_VISUAL_URL = './core2-visual.html?v=20260707-core2-process-flows';
const CORE2_MATCH_STOP_WORDS = new Set([
  'and',
  'are',
  'for',
  'from',
  'into',
  'the',
  'user',
  'users',
  'with',
  'that',
  'this',
  'which',
  'should',
  'following',
  'technician',
  'company',
  'computer',
  'most',
  'best',
  'first',
  'would',
  'will',
  'needs',
  'using',
  'after',
  'before',
  'been',
  'when',
  'what',
  'while',
  'within',
]);

let state = null;
let storageApi = null;
let fetchApi = null;
let archiveService = null;
let appWindow = null;
let appDocument = null;
let archiveSyncQueue = Promise.resolve();
let lastRenderedRoute = null;
let pendingScrollSave = null;
let skipNextRoutePositionSave = false;
let favoriteSyncState = {
  text: '',
  message: '',
  kind: 'info',
};
const questionBankCache = new Map();
const boundDocuments = new WeakSet();
const boundWindows = new WeakSet();

function renderPlaceholder(route) {
  return `
    <section class="panel" style="padding: 28px">
      <h2>${getRouteLabel(route)}</h2>
      <p>页面骨架已启动，后续任务会填充具体内容</p>
    </section>
  `;
}

function getQuestionBank(bankId) {
  return QUESTION_BANK_MAP.get(bankId) ?? QUESTION_BANK_MAP.get(DEFAULT_BANK_ID);
}

function getActiveBankLabel() {
  return getQuestionBank(state?.bankId).label;
}

function getLearningBanks() {
  return QUESTION_BANKS.filter((bank) => LEARNING_BANK_IDS.has(bank.id));
}

function getLearningBankId(bankId = state?.bankId) {
  return LEARNING_BANK_IDS.has(bankId) ? bankId : DEFAULT_LEARNING_BANK_ID;
}

function getLearningModules() {
  if (state?.bankId === CORE1_BANK_ID) {
    return buildCore1ModuleStats(state.questions);
  }

  if (state?.bankId === CORE2_BANK_ID) {
    return buildCore2ModuleStats(state.questions);
  }

  return [];
}

function getActiveLearningModuleId() {
  if (!LEARNING_BANK_IDS.has(state?.bankId)) return DEFAULT_LEARNING_MODULE_ID;

  const savedModuleId = state.preferences.learningModuleByBank?.[state.bankId]
    ?? DEFAULT_LEARNING_MODULE_ID;
  const moduleIds = new Set(getLearningModules().map((module) => module.id));
  return moduleIds.has(savedModuleId) ? savedModuleId : DEFAULT_LEARNING_MODULE_ID;
}

function getLearningQuestions(moduleId = getActiveLearningModuleId()) {
  if (!LEARNING_BANK_IDS.has(state?.bankId) || moduleId === DEFAULT_LEARNING_MODULE_ID) {
    return state.questions;
  }

  return state.questions.filter((question) => (
    question.learning?.studyTags?.includes(moduleId)
  ));
}

function tokenizeCore2MatchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !CORE2_MATCH_STOP_WORDS.has(token));
}

function getCore2CorrectAnswerText(question) {
  const answerKeys = new Set(Array.isArray(question?.answer) ? question.answer : [question?.answer]);
  return (question?.options ?? [])
    .filter((option) => answerKeys.has(option.key))
    .map((option) => option.text)
    .join(' ');
}

function scoreCore2SymptomMatch(question, row) {
  const stemTokens = new Set(tokenizeCore2MatchText(question?.stem));
  const answerTokens = new Set(tokenizeCore2MatchText(getCore2CorrectAnswerText(question)));
  const studyTags = new Set(question?.learning?.studyTags ?? []);
  const symptomScore = tokenizeCore2MatchText(row?.symptom)
    .filter((token) => stemTokens.has(token))
    .length;
  const answerScore = tokenizeCore2MatchText(row?.answer)
    .filter((token) => answerTokens.has(token))
    .length;
  const moduleScore = studyTags.has(getCore2SymptomGroup(row?.group)?.moduleId) ? 1 : 0;

  return symptomScore + (answerScore * 2) + moduleScore;
}

function getCore2SymptomPracticeQuestions(symptomIds = []) {
  const targetIds = new Set(symptomIds.map(String).filter(Boolean));
  if (!targetIds.size || state?.bankId !== CORE2_BANK_ID) return [];

  return state.questions.filter((question) => (
    CORE2_SYMPTOM_MAP.some((row) => (
      targetIds.has(getCore2SymptomId(row))
        && scoreCore2SymptomMatch(question, row) >= 3
    ))
  ));
}

function buildCore2SymptomPracticeSource(pending) {
  const query = String(pending?.query ?? '').trim();
  const targetIds = new Set((pending?.symptomIds ?? []).map(String).filter(Boolean));
  const firstRow = CORE2_SYMPTOM_MAP.find((row) => targetIds.has(getCore2SymptomId(row)));
  const queryParam = query ? `&q=${encodeURIComponent(query)}` : '';
  const hash = firstRow ? `#${getCore2SymptomId(firstRow)}` : '';

  return {
    label: query ? `返回图谱：${query}` : '返回 Core 2 图谱',
    url: `${CORE2_VISUAL_URL}${queryParam}${hash}`,
  };
}

function getLearningCursorKey(moduleId = getActiveLearningModuleId()) {
  return `${state.bankId}:${moduleId}`;
}

function shouldRememberRoutePosition(route) {
  return POSITION_MEMORY_ROUTES.has(route);
}

function getRoutePositionKey(route) {
  return `${state?.bankId ?? DEFAULT_BANK_ID}:${route}`;
}

function getCurrentScrollY(windowObject, documentObject) {
  const documentElement = documentObject?.documentElement;
  const body = documentObject?.body;
  const candidates = [
    windowObject?.scrollY,
    windowObject?.pageYOffset,
    documentElement?.scrollTop,
    body?.scrollTop,
  ];
  const value = candidates.find((candidate) => Number.isFinite(Number(candidate)));
  return Math.max(0, Math.round(Number(value ?? 0)));
}

function getQuestionCardId(element) {
  return element?.dataset?.questionId
    ?? element?.getAttribute?.('data-question-id')
    ?? '';
}

function getQuestionCardRect(element) {
  if (typeof element?.getBoundingClientRect !== 'function') return null;

  const rect = element.getBoundingClientRect();
  const top = Number(rect?.top);
  if (!Number.isFinite(top)) return null;

  const fallbackBottom = Number.isFinite(Number(rect?.height))
    ? top + Number(rect.height)
    : top;
  const bottom = Number.isFinite(Number(rect?.bottom))
    ? Number(rect.bottom)
    : fallbackBottom;

  return { top, bottom };
}

function getQuestionCardElements(documentObject) {
  if (typeof documentObject?.querySelectorAll !== 'function') return [];

  try {
    return Array.from(documentObject.querySelectorAll(POSITION_ANCHOR_SELECTOR) ?? []);
  } catch {
    return [];
  }
}

function getQuestionCardAnchorCandidates(documentObject) {
  return getQuestionCardElements(documentObject)
    .map((element) => ({
      questionId: String(getQuestionCardId(element)),
      rect: getQuestionCardRect(element),
    }))
    .filter((item) => item.questionId && item.rect);
}

function selectRouteAnchor(cards = []) {
  if (!cards.length) return null;

  const crossingAnchorLine = cards
    .filter((item) => (
      item.rect.top <= POSITION_ANCHOR_VIEWPORT_LINE
        && item.rect.bottom > POSITION_ANCHOR_VIEWPORT_LINE
    ))
    .sort((a, b) => b.rect.top - a.rect.top);
  const firstVisibleBelowTop = cards
    .filter((item) => item.rect.top >= 0)
    .sort((a, b) => a.rect.top - b.rect.top);
  const closestToViewportTop = [...cards]
    .sort((a, b) => Math.abs(a.rect.top) - Math.abs(b.rect.top));
  const anchor = crossingAnchorLine[0]
    ?? firstVisibleBelowTop[0]
    ?? closestToViewportTop[0];

  return anchor;
}

function getCurrentRouteAnchor(windowObject, documentObject, options = {}) {
  const excluded = new Set((options.excludeQuestionIds ?? []).map(String));
  const cards = getQuestionCardAnchorCandidates(documentObject)
    .filter((item) => !excluded.has(item.questionId));
  const anchor = selectRouteAnchor(cards);

  if (!anchor) return null;

  return {
    questionId: anchor.questionId,
    offsetTop: Math.round(anchor.rect.top),
    scrollY: getCurrentScrollY(windowObject, documentObject),
  };
}

function areRouteAnchorsEqual(left, right) {
  return String(left?.questionId ?? '') === String(right?.questionId ?? '')
    && Number(left?.offsetTop) === Number(right?.offsetTop)
    && Number(left?.scrollY) === Number(right?.scrollY);
}

function persistPreferencesOnly() {
  if (!storageApi || !state) return;
  storageApi.set(DEFAULT_KEYS.preferences, state.preferences);
}

function persistRoutePosition(route, scrollY, anchor = null) {
  const key = getRoutePositionKey(route);
  const positions = state.preferences.scrollPositionByRoute ?? {};
  const anchors = state.preferences.scrollAnchorByRoute ?? {};
  const positionChanged = positions[key] !== scrollY;
  const anchorChanged = anchor && !areRouteAnchorsEqual(anchors[key], anchor);
  if (!positionChanged && !anchorChanged) return false;

  state.preferences.scrollPositionByRoute = {
    ...positions,
    [key]: scrollY,
  };

  if (anchor) {
    state.preferences.scrollAnchorByRoute = {
      ...anchors,
      [key]: anchor,
    };
  }

  persistPreferencesOnly();
  return true;
}

function saveRoutePosition(windowObject, documentObject, route = lastRenderedRoute) {
  if (!state || !shouldRememberRoutePosition(route)) return;

  const scrollY = getCurrentScrollY(windowObject, documentObject);
  const anchor = getCurrentRouteAnchor(windowObject, documentObject);
  persistRoutePosition(route, scrollY, anchor);
}

function saveRoutePositionAfterQuestionRemoval(
  windowObject,
  documentObject,
  removedQuestionId,
  route = lastRenderedRoute,
) {
  if (!state || !shouldRememberRoutePosition(route)) return;

  const removedId = String(removedQuestionId ?? '');
  const scrollY = getCurrentScrollY(windowObject, documentObject);
  const cards = getQuestionCardAnchorCandidates(documentObject);
  const currentAnchor = selectRouteAnchor(cards);
  const removedIndex = cards.findIndex((item) => item.questionId === removedId);
  let anchor = null;

  if (currentAnchor?.questionId === removedId && removedIndex !== -1) {
    const nextCard = cards.slice(removedIndex + 1)
      .find((item) => item.questionId !== removedId);
    const previousCard = [...cards.slice(0, removedIndex)]
      .reverse()
      .find((item) => item.questionId !== removedId);

    if (nextCard) {
      anchor = {
        questionId: nextCard.questionId,
        offsetTop: Math.round(currentAnchor.rect.top),
        scrollY,
      };
    } else if (previousCard) {
      anchor = {
        questionId: previousCard.questionId,
        offsetTop: Math.round(previousCard.rect.top),
        scrollY,
      };
    }
  }

  if (!anchor) {
    anchor = getCurrentRouteAnchor(windowObject, documentObject, {
      excludeQuestionIds: [removedId],
    });
  }

  persistRoutePosition(route, scrollY, anchor);
  skipNextRoutePositionSave = true;
}

function findQuestionCardElement(documentObject, questionId) {
  const targetId = String(questionId ?? '');
  if (!targetId) return null;

  return getQuestionCardElements(documentObject)
    .find((element) => String(getQuestionCardId(element)) === targetId)
    ?? null;
}

function getSavedRouteAnchor(route) {
  const key = getRoutePositionKey(route);
  const anchor = state?.preferences.scrollAnchorByRoute?.[key];
  const questionId = String(anchor?.questionId ?? '');
  const offsetTop = Number(anchor?.offsetTop);

  if (!questionId || !Number.isFinite(offsetTop)) return null;
  return { questionId, offsetTop };
}

function restoreRoutePosition(windowObject, documentObject, route) {
  if (!state || !shouldRememberRoutePosition(route)) return;
  if (typeof windowObject?.scrollTo !== 'function') return;

  const savedAnchor = getSavedRouteAnchor(route);
  if (savedAnchor) {
    const anchorElement = findQuestionCardElement(documentObject, savedAnchor.questionId);
    const rect = getQuestionCardRect(anchorElement);

    if (rect) {
      const currentScrollY = getCurrentScrollY(windowObject, documentObject);
      const targetScrollY = Math.max(0, Math.round(
        currentScrollY + rect.top - savedAnchor.offsetTop,
      ));
      windowObject.scrollTo(0, targetScrollY);
      return;
    }
  }

  const key = getRoutePositionKey(route);
  const savedPosition = Number(state.preferences.scrollPositionByRoute?.[key] ?? 0);
  if (!Number.isFinite(savedPosition) || savedPosition <= 0) return;

  windowObject.scrollTo(0, savedPosition);
}

function scheduleRoutePositionSave(windowObject, documentObject) {
  if (!shouldRememberRoutePosition(normalizeRoute(windowObject.location.hash))) return;
  if (pendingScrollSave) return;

  const save = () => {
    pendingScrollSave = null;
    saveRoutePosition(windowObject, documentObject, normalizeRoute(windowObject.location.hash));
  };

  if (typeof windowObject.requestAnimationFrame === 'function') {
    pendingScrollSave = windowObject.requestAnimationFrame(save);
    return;
  }

  pendingScrollSave = setTimeout(save, 100);
}

function setActiveLearningModule(moduleId) {
  const moduleIds = new Set(getLearningModules().map((module) => module.id));
  const nextModuleId = moduleIds.has(moduleId) ? moduleId : DEFAULT_LEARNING_MODULE_ID;

  state.preferences.learningModuleByBank = {
    ...(state.preferences.learningModuleByBank ?? {}),
    [state.bankId]: nextModuleId,
  };
  setLearningIndex(0, nextModuleId);
}

function startActiveModulePractice() {
  const learningQuestions = getLearningQuestions();
  if (!learningQuestions.length) return false;

  const activeModule = getLearningModules()
    .find((module) => module.id === getActiveLearningModuleId());

  state.currentPractice = createFocusedPracticeSession(
    learningQuestions,
    activeModule?.label ?? '',
  );
  return true;
}

function startCore2SymptomPractice(pending) {
  const symptomQuestions = getCore2SymptomPracticeQuestions(pending?.symptomIds);
  if (!symptomQuestions.length) return false;

  const query = String(pending?.query ?? '').trim();
  state.currentPractice = createFocusedPracticeSession(
    symptomQuestions,
    query ? `Core 2 图谱筛选：${query}` : 'Core 2 图谱筛选',
    {
      source: buildCore2SymptomPracticeSource(pending),
    },
  );
  return true;
}

function isFreshPendingCore2ModulePractice(pending) {
  const createdAt = Number(pending?.createdAt ?? 0);
  if (!Number.isFinite(createdAt) || createdAt <= 0) return true;
  return Date.now() - createdAt <= PENDING_CORE2_MODULE_PRACTICE_MAX_AGE_MS;
}

async function consumePendingCore2ModulePractice() {
  const pending = storageApi.get(DEFAULT_KEYS.pendingCore2ModulePractice, null);
  if (!pending) return false;

  storageApi.remove(DEFAULT_KEYS.pendingCore2ModulePractice);
  if (pending.bankId !== CORE2_BANK_ID || !isFreshPendingCore2ModulePractice(pending)) {
    return false;
  }

  await activateQuestionBank(CORE2_BANK_ID);
  if (Array.isArray(pending.symptomIds)) {
    if (startCore2SymptomPractice(pending)) {
      persistState();
      navigate('practice');
      return true;
    }
    if (!pending.moduleId) return false;
  }

  setActiveLearningModule(pending.moduleId);
  if (!startActiveModulePractice()) return false;

  persistState();
  navigate('practice');
  return true;
}

function updateArchiveStatus() {
  if (!state || !archiveService?.getStatus) return;
  state.archiveStatus = archiveService.getStatus();
}

function createLearningArchiveSnapshot() {
  return createArchivePayload(state, QUESTION_BANKS);
}

function queueArchiveSync() {
  updateArchiveStatus();
  if (!state?.archiveStatus?.bound || !archiveService?.sync) return;

  archiveSyncQueue = archiveSyncQueue
    .then(async () => {
      await archiveService.sync(createLearningArchiveSnapshot());
      updateArchiveStatus();
      if (appWindow && appDocument && normalizeRoute(appWindow.location.hash) === 'mistakes') {
        renderApp(appWindow, appDocument);
      }
    })
    .catch(() => {
      updateArchiveStatus();
      if (appWindow && appDocument && normalizeRoute(appWindow.location.hash) === 'mistakes') {
        renderApp(appWindow, appDocument);
      }
    });
}

async function bindLearningArchive(windowObject, documentObject) {
  if (!archiveService?.bindFile) return;

  await archiveService.bindFile();
  updateArchiveStatus();

  if (state?.archiveStatus?.bound && archiveService?.sync) {
    await archiveService.sync(createLearningArchiveSnapshot());
    updateArchiveStatus();
  }

  renderApp(windowObject, documentObject);
}

function hydrateActiveSessions() {
  if (state.currentPractice) {
    state.currentPractice = restorePracticeSession(
      state.questions,
      state.currentPractice,
      state.progress,
    );
  }

  if (state.currentExam) {
    state.currentExam = restoreExamSession(state.questions, state.currentExam, DEFAULT_EXAM_SIZE);
  }

  state.currentPracticeByBank[state.bankId] = snapshotPracticeSession(state.currentPractice);
  state.currentExamByBank[state.bankId] = snapshotExamSession(state.currentExam);
  state.lastResult = state.examHistory[0] ?? null;
}

function getQuestionById(questionId) {
  return state.questions.find((question) => question.id === questionId);
}

function getMistakeQuestions() {
  return state.mistakes
    .map((questionId) => getQuestionById(questionId))
    .filter(Boolean);
}

function getMistakeQuestionIds() {
  return getMistakeQuestions().map((question) => question.id);
}

function persistState() {
  if (!storageApi || !state) return;

  state.progressByBank[state.bankId] = state.progress;
  state.mistakesByBank[state.bankId] = state.mistakes;
  state.favoritesByBank[state.bankId] = state.favorites;
  state.examHistoryByBank[state.bankId] = state.examHistory;
  state.currentPracticeByBank[state.bankId] = snapshotPracticeSession(state.currentPractice);
  state.currentExamByBank[state.bankId] = snapshotExamSession(state.currentExam);

  storageApi.set(DEFAULT_KEYS.progress, state.progressByBank);
  storageApi.set(DEFAULT_KEYS.mistakes, state.mistakesByBank);
  storageApi.set(DEFAULT_KEYS.favorites, state.favoritesByBank);
  storageApi.set(DEFAULT_KEYS.examHistory, state.examHistoryByBank);
  storageApi.set(DEFAULT_KEYS.preferences, state.preferences);
  storageApi.set(DEFAULT_KEYS.currentPractice, state.currentPracticeByBank);
  storageApi.set(DEFAULT_KEYS.currentExam, state.currentExamByBank);
  queueArchiveSync();
}

function ensurePracticeSession() {
  if (!state.currentPractice) {
    state.currentPractice = createPracticeSession(state.questions, state.preferences.practiceMode);
  }
}

function ensureExamSession() {
  if (!state.currentExam) {
    state.currentExam = createExamSession(state.questions, DEFAULT_EXAM_SIZE);
    return true;
  }

  return false;
}

function getSelectedAnswers(documentObject) {
  return [...documentObject.querySelectorAll('input[name="answer"]:checked')]
    .map((input) => input.value);
}

function orderSelectedAnswers(question, selectedAnswers) {
  const selectedSet = new Set(selectedAnswers);
  return (question.options ?? [])
    .map((option) => option.key)
    .filter((key) => selectedSet.has(key));
}

function submitCurrentPracticeAnswer(documentObject, selectedAnswers = null) {
  ensurePracticeSession();
  const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
  const question = getQuestionById(currentId);
  const selected = selectedAnswers ?? getSelectedAnswers(documentObject);
  const result = gradePracticeAnswer(question, selected);

  state.currentPractice.answers[currentId] = selected;
  state.currentPractice.feedback[currentId] = result;
  revealCurrentPracticeAnswer(currentId);
  state.progress[currentId] = { correct: result.correct, selectedAnswer: selected };

  if (!result.correct && !state.mistakes.includes(currentId)) {
    state.mistakes.unshift(currentId);
  } else if (result.correct && state.preferences.autoRemoveCorrectMistakes !== false) {
    removeMistake(currentId);
  }

  return result;
}

function selectCurrentPracticeOption(optionKey) {
  ensurePracticeSession();
  const normalizedKey = String(optionKey ?? '').trim().toUpperCase();
  if (!normalizedKey) return false;

  const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
  const question = getQuestionById(currentId);
  if (!question?.options?.some((option) => option.key === normalizedKey)) return false;

  if (question.type === 'multiple') {
    const currentAnswers = new Set(state.currentPractice.answers[currentId] ?? []);
    if (currentAnswers.has(normalizedKey)) {
      currentAnswers.delete(normalizedKey);
    } else {
      currentAnswers.add(normalizedKey);
    }

    state.currentPractice.answers[currentId] = orderSelectedAnswers(question, currentAnswers);
    delete state.currentPractice.feedback[currentId];
    hideCurrentPracticeAnswer(currentId);
    return true;
  }

  if (question.type !== 'single') return false;
  submitCurrentPracticeAnswer(null, [normalizedKey]);
  return true;
}

function getPracticeShortcutKey(event) {
  const optionIndex = Number(event.key) - 1;
  if (!Number.isInteger(optionIndex) || optionIndex < 0) return '';

  ensurePracticeSession();
  const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
  const question = getQuestionById(currentId);
  return question?.options?.[optionIndex]?.key ?? '';
}

function handlePracticeEnter(documentObject) {
  ensurePracticeSession();
  const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
  const question = getQuestionById(currentId);
  if (!question) return false;

  if (question.type === 'multiple' && !isPracticeAnswerRevealed(currentId)) {
    submitCurrentPracticeAnswer(documentObject);
    return true;
  }

  if (isPracticeAnswerRevealed(currentId)) {
    movePracticeIndex(1);
    return true;
  }

  return false;
}

function revealCurrentPracticeAnswer(questionId) {
  state.currentPractice.revealedAnswerIds = [
    ...new Set([...(state.currentPractice.revealedAnswerIds ?? []), questionId]),
  ];
}

function hideCurrentPracticeAnswer(questionId) {
  state.currentPractice.revealedAnswerIds = (state.currentPractice.revealedAnswerIds ?? [])
    .filter((id) => id !== questionId);
}

function isPracticeAnswerRevealed(questionId) {
  return (state.currentPractice?.revealedAnswerIds ?? []).includes(questionId);
}

function saveCurrentExamAnswer(documentObject) {
  if (!state.currentExam?.order.length) return;
  const currentId = state.currentExam.order[state.currentExam.currentIndex];
  const selectedAnswers = getSelectedAnswers(documentObject);

  if (selectedAnswers.length) {
    state.currentExam.answers[currentId] = selectedAnswers;
  } else {
    delete state.currentExam.answers[currentId];
  }
}

function createRetrySession(wrongIds) {
  return {
    mode: 'sequential',
    order: [...wrongIds],
    currentIndex: 0,
    hydrateFromProgress: false,
    revealedAnswerIds: [],
    answers: {},
    feedback: {},
  };
}

function createFocusedPracticeSession(questions, label = '', options = {}) {
  const matchesFavoriteOrder = questions.length > 0
    && questions.length === state.favorites.length
    && questions.every((question, index) => question.id === state.favorites[index]);
  const session = {
    mode: 'sequential',
    label,
    source: options.source ?? null,
    order: questions.map((question) => question.id),
    currentIndex: 0,
    hydrateFromProgress: false,
    showAnswerReview: options.showAnswerReview === true || matchesFavoriteOrder,
    revealedAnswerIds: [],
    answers: {},
    feedback: {},
  };

  if (session.showAnswerReview) {
    session.revealedAnswerIds = [...session.order];
    for (const question of questions) {
      session.answers[question.id] = [...question.answer];
      session.feedback[question.id] = gradePracticeAnswer(question, question.answer);
    }
  }

  return session;
}

function recordExamResult(result) {
  state.lastResult = result;
  state.examHistory.unshift(result);

  for (const questionId of result.wrongIds) {
    if (!state.mistakes.includes(questionId)) {
      state.mistakes.unshift(questionId);
    }
  }
}

function movePracticeIndex(offset) {
  ensurePracticeSession();
  const lastIndex = state.currentPractice.order.length - 1;
  state.currentPractice.currentIndex = Math.max(
    0,
    Math.min(lastIndex, state.currentPractice.currentIndex + offset),
  );
}

function getQuestionJumpValue(documentObject, kind, target = null) {
  if (target?.dataset?.questionJumpInput === kind) {
    return target.value;
  }

  const input = documentObject.querySelector(`[data-question-jump-input="${kind}"]`);
  return input?.value;
}

function parseQuestionJumpIndex(value, total) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || total <= 0) return null;

  return Math.max(0, Math.min(total - 1, Math.trunc(numericValue) - 1));
}

function jumpPracticeQuestion(documentObject, target = null) {
  ensurePracticeSession();
  const index = parseQuestionJumpIndex(
    getQuestionJumpValue(documentObject, 'practice', target),
    state.currentPractice.order.length,
  );
  if (index === null) return false;

  state.currentPractice.currentIndex = index;
  return true;
}

function removeMistake(questionId) {
  state.mistakes = state.mistakes.filter((id) => id !== questionId);
}

function getLearningIndex(learningQuestions = getLearningQuestions()) {
  const moduleId = getActiveLearningModuleId();
  const scopeBucket = state.preferences.learningIndexByScope ?? {};
  const bucket = state.preferences.learningIndexByBank ?? {};
  const rawIndex = Number(scopeBucket[getLearningCursorKey(moduleId)] ?? bucket[state.bankId] ?? 0);
  if (!Number.isFinite(rawIndex)) return 0;
  return Math.max(0, Math.min(learningQuestions.length - 1, rawIndex));
}

function setLearningIndex(index, moduleId = getActiveLearningModuleId()) {
  const learningQuestions = getLearningQuestions(moduleId);
  const nextIndex = Math.max(0, Math.min(learningQuestions.length - 1, index));

  state.preferences.learningIndexByScope = {
    ...(state.preferences.learningIndexByScope ?? {}),
    [getLearningCursorKey(moduleId)]: nextIndex,
  };
  state.preferences.learningIndexByBank = {
    ...(state.preferences.learningIndexByBank ?? {}),
    [state.bankId]: nextIndex,
  };
}

function moveLearningIndex(offset) {
  setLearningIndex(getLearningIndex() + offset);
}

function jumpLearningQuestion(documentObject, target = null) {
  const learningQuestions = getLearningQuestions();
  const index = parseQuestionJumpIndex(
    getQuestionJumpValue(documentObject, 'learning', target),
    learningQuestions.length,
  );
  if (index === null) return false;

  setLearningIndex(index);
  return true;
}

function toggleFavorite(questionId) {
  if (!Number.isFinite(questionId)) return;

  if (state.favorites.includes(questionId)) {
    state.favorites = state.favorites.filter((id) => id !== questionId);
    return;
  }

  state.favorites = [questionId, ...state.favorites];
}

function getFavoriteQuestions() {
  return state.favorites
    .map((questionId) => getQuestionById(questionId))
    .filter(Boolean);
}

async function sendFavoriteSyncText(text) {
  const navigatorObject = appWindow?.navigator;

  try {
    if (navigatorObject?.share) {
      await navigatorObject.share({
        title: 'A+ Ctest 收藏题号',
        text,
      });
      return '已打开手机分享菜单，可以发到微信/邮箱/电脑。';
    }
  } catch {
    // Fall back to clipboard/manual copy below.
  }

  try {
    if (navigatorObject?.clipboard?.writeText) {
      await navigatorObject.clipboard.writeText(text);
      return '已复制收藏文本，发到电脑后粘贴导入。';
    }
  } catch {
    // Manual copy is still available from the textarea.
  }

  return '已生成收藏文本；长按文本框复制后发到电脑。';
}

async function exportFavoriteSyncText() {
  if (!state.favorites.length) {
    favoriteSyncState = {
      text: '',
      message: '当前题库还没有收藏题。',
      kind: 'warning',
    };
    return;
  }

  const text = buildFavoriteSyncText({
    bankId: state.bankId,
    bankLabel: getActiveBankLabel(),
    questions: state.questions,
    favoriteIds: state.favorites,
  });

  favoriteSyncState = {
    text,
    message: await sendFavoriteSyncText(text),
    kind: 'success',
  };
}

function importFavoriteSyncText(documentObject) {
  const input = documentObject.querySelector('[data-favorite-sync-input]');
  const text = input?.value?.trim() ?? '';

  if (!text) {
    favoriteSyncState = {
      ...favoriteSyncState,
      message: '先粘贴手机发来的收藏文本或题号。',
      kind: 'warning',
    };
    return false;
  }

  const parsed = parseFavoriteSyncText(text, state.questions);
  if (parsed.bankId && parsed.bankId !== state.bankId) {
    favoriteSyncState = {
      ...favoriteSyncState,
      message: `这段收藏属于 ${parsed.bankId}；请先切到对应题库再导入。`,
      kind: 'warning',
    };
    return false;
  }

  if (!parsed.ids.length) {
    favoriteSyncState = {
      ...favoriteSyncState,
      message: '没有识别到当前题库中的有效题号。',
      kind: 'warning',
    };
    return false;
  }

  const before = new Set(state.favorites);
  state.favorites = mergeFavoriteIds(state.favorites, parsed.ids);
  const addedCount = parsed.ids.filter((id) => !before.has(id)).length;
  favoriteSyncState = {
    text,
    message: `已导入 ${parsed.ids.length} 题，新增 ${addedCount} 题。`,
    kind: 'success',
  };
  return true;
}

function toggleCurrentPracticeFavorite() {
  ensurePracticeSession();
  const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
  if (!Number.isFinite(Number(currentId))) return false;
  toggleFavorite(Number(currentId));
  return true;
}

function renderPractice() {
  ensurePracticeSession();

  if (!state.currentPractice.order.length) {
    return `
      <section class="panel" style="padding: 28px">
        <h2>练习</h2>
        <p>当前没有可用题目</p>
      </section>
    `;
  }

  const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
  const question = getQuestionById(currentId);
  const feedback = isPracticeAnswerRevealed(currentId)
    ? state.currentPractice.feedback[currentId]
    : null;
  const selectedAnswer = state.currentPractice.answers[currentId] ?? [];

  return renderPracticeView(
    question,
    state.currentPractice,
    feedback,
    selectedAnswer,
    getActiveBankLabel(),
    {
      isFavorite: state.favorites.includes(question.id),
      isProgressCollapsed: state.preferences.practiceProgressCollapsed === true,
      favoriteCount: state.favorites.length,
      favoriteSync: favoriteSyncState,
    },
  );
}

function renderLearning() {
  const learningQuestions = getLearningQuestions();

  if (!learningQuestions.length) {
    return `
      <section class="panel" style="padding: 28px">
        <h2>学习</h2>
        <p>当前没有可用题目</p>
      </section>
    `;
  }

  const currentIndex = getLearningIndex(learningQuestions);
  const question = learningQuestions[currentIndex];
  const modules = getLearningModules();
  return renderLearningView(
    question,
    currentIndex,
    learningQuestions.length,
    getActiveBankLabel(),
    {
      isFavorite: state.favorites.includes(question.id),
      favoriteCount: state.favorites.length,
      coreBanks: getLearningBanks(),
      activeBankId: state.bankId,
      modules,
      activeModuleId: getActiveLearningModuleId(),
      isNavigatorCollapsed: state.preferences.learningNavCollapsed === true,
      favoriteSyncText: favoriteSyncState.text,
      favoriteSyncMessage: favoriteSyncState.message,
      favoriteSyncMessageKind: favoriteSyncState.kind,
    },
  );
}

function renderExam() {
  if (ensureExamSession()) {
    persistState();
  }

  if (!state.currentExam.order.length) {
    return `
      <section class="panel" style="padding: 28px">
        <h2>模拟考试</h2>
        <p>当前没有可用题目</p>
      </section>
    `;
  }

  const currentId = state.currentExam.order[state.currentExam.currentIndex];
  const question = getQuestionById(currentId);
  const selectedAnswer = state.currentExam.answers[currentId] ?? [];

  return renderExamView(question, state.currentExam, selectedAnswer, getActiveBankLabel());
}

function renderResults() {
  if (!state.lastResult) {
    return `
      <section class="panel" style="padding: 28px">
        <h2>考试结果</h2>
        <p>暂时还没有考试记录</p>
      </section>
    `;
  }

  const questionMap = new Map(state.questions.map((question) => [question.id, question]));
  return renderResultsView(state.lastResult, questionMap, getActiveBankLabel());
}

function renderMistakes() {
  return renderMistakesView(
    getMistakeQuestions(),
    getActiveBankLabel(),
    state.archiveStatus,
    state.preferences.autoRemoveCorrectMistakes !== false,
  );
}

function isTypingTarget(target) {
  if (!target || typeof target !== 'object') return false;
  const tagName = typeof target.tagName === 'string' ? target.tagName.toLowerCase() : '';
  return tagName === 'input'
    || tagName === 'textarea'
    || tagName === 'select'
    || target.isContentEditable === true;
}

function setSidebarCollapsed(windowObject, documentObject, collapsed, { persist = false } = {}) {
  const appShell = documentObject.querySelector('.app-shell');
  const toggleButton = documentObject.querySelector('[data-action="toggle-sidebar"]');

  documentObject.querySelectorAll('[data-route]').forEach((button) => {
    if (!button.dataset.short) {
      button.dataset.short = SIDEBAR_SHORT_LABELS[button.dataset.route] ?? '';
    }
  });

  appShell?.classList.toggle('is-sidebar-collapsed', collapsed);

  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', String(!collapsed));
    toggleButton.setAttribute('aria-label', collapsed ? '\u5c55\u5f00\u4fa7\u8fb9\u680f' : '\u6536\u8d77\u4fa7\u8fb9\u680f');
    toggleButton.setAttribute('title', collapsed ? '\u5c55\u5f00\u4fa7\u8fb9\u680f' : '\u6536\u8d77\u4fa7\u8fb9\u680f');
  }

  if (!persist) return;

  try {
    windowObject.localStorage?.setItem(SIDEBAR_COLLAPSED_KEY, collapsed ? 'true' : 'false');
  } catch {
    // Ignore storage failures; collapsing is still useful for the current session.
  }
}

function getPersistedSidebarCollapsed(windowObject) {
  try {
    return windowObject.localStorage?.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function initializeSidebarState(windowObject, documentObject) {
  setSidebarCollapsed(
    windowObject,
    documentObject,
    getPersistedSidebarCollapsed(windowObject),
  );
}

function toggleSidebarCollapsed(windowObject, documentObject) {
  const appShell = documentObject.querySelector('.app-shell');
  if (!appShell) return;
  const nextCollapsed = !appShell?.classList.contains('is-sidebar-collapsed');
  setSidebarCollapsed(windowObject, documentObject, nextCollapsed, { persist: true });
}

function renderApp(windowObject, documentObject) {
  const route = normalizeRoute(windowObject.location.hash);
  const app = documentObject.querySelector('#app');

  if (lastRenderedRoute) {
    if (skipNextRoutePositionSave) {
      skipNextRoutePositionSave = false;
    } else {
      saveRoutePosition(windowObject, documentObject, lastRenderedRoute);
    }
  }

  if (route === 'home') {
    app.innerHTML = renderHomeView({
      stats: getDashboardStats(state),
      banks: QUESTION_BANKS,
      activeBankId: state.bankId,
    });
  } else if (route === 'practice') {
    app.innerHTML = renderPractice();
  } else if (route === 'learn') {
    app.innerHTML = renderLearning();
  } else if (route === 'exam') {
    app.innerHTML = renderExam();
  } else if (route === 'mistakes') {
    app.innerHTML = renderMistakes();
  } else if (route === 'results') {
    app.innerHTML = renderResults();
  } else {
    app.innerHTML = renderPlaceholder(route);
  }

  documentObject.querySelectorAll('[data-route]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.route === route);
  });

  lastRenderedRoute = route;
  restoreRoutePosition(windowObject, documentObject, route);
}

function renderFailure(documentObject, error) {
  const app = documentObject.querySelector('#app');
  if (!app) return;
  app.innerHTML = `<section class="panel" style="padding: 28px"><h2>题库加载失败</h2><p>${error.message}</p></section>`;
}

async function loadQuestions(fetchImpl, bankId = DEFAULT_BANK_ID) {
  const bank = getQuestionBank(bankId);
  if (questionBankCache.has(bank.id)) {
    return questionBankCache.get(bank.id);
  }

  const response = await fetchImpl(bank.file);
  if (!response.ok) throw new Error('题库加载失败');
  const questions = sanitizeQuestionBankData(await response.json());
  let hydratedQuestions = questions;

  if (bank.id === 'core2') {
    if (bank.analysisFiles?.length) {
      const analysisRecords = [];

      for (const analysisFile of bank.analysisFiles) {
        const analysisResponse = await fetchImpl(analysisFile);
        if (!analysisResponse.ok) throw new Error('题库解析加载失败');
        const records = sanitizeQuestionBankData(await analysisResponse.json());
        analysisRecords.push(...records);
      }

      hydratedQuestions = applyStoredCore2Analyses(questions, analysisRecords);
    } else {
      hydratedQuestions = decorateCore2Questions(questions);
    }
  }

  if (LEARNING_BANK_IDS.has(bank.id)) {
    hydratedQuestions = applyLearningAnnotations(hydratedQuestions, { bankId: bank.id });
  }

  hydratedQuestions = sanitizeQuestionBankData(hydratedQuestions);
  questionBankCache.set(bank.id, hydratedQuestions);
  return hydratedQuestions;
}

async function activateQuestionBank(bankId, { resetSessions = false } = {}) {
  const nextBank = getQuestionBank(bankId);
  if (!state || nextBank.id === state.bankId) return false;

  persistState();
  const questions = await loadQuestions(fetchApi, nextBank.id);
  setActiveBank(state, questions, nextBank.id);

  if (resetSessions) {
    state.currentPractice = null;
    state.currentExam = null;
    state.currentPracticeByBank[state.bankId] = null;
    state.currentExamByBank[state.bankId] = null;
  }

  state.lastResult = state.examHistory[0] ?? null;
  persistState();
  return true;
}

async function switchQuestionBank(bankId, windowObject, documentObject) {
  await activateQuestionBank(bankId, { resetSessions: true });
  navigate('home');
  renderApp(windowObject, documentObject);
}

async function enterLearningMode(windowObject, documentObject, bankId = state?.bankId) {
  await activateQuestionBank(getLearningBankId(bankId));
  setLearningIndex(getLearningIndex());
  persistState();
  navigate('learn');
  renderApp(windowObject, documentObject);
}

function ensureEventBindings(windowObject, documentObject) {
  if (!boundDocuments.has(documentObject)) {
    documentObject.addEventListener('click', async (event) => {
      const startPracticeButton = event.target.closest('[data-action="start-practice"]');
      if (startPracticeButton?.dataset.action === 'start-practice') {
        state.preferences.practiceMode = startPracticeButton.dataset.mode || 'sequential';
        state.currentPractice = createPracticeSession(state.questions, state.preferences.practiceMode);
        persistState();
        navigate('practice');
        return;
      }

      const actionButton = event.target.closest('[data-action]');
      const action = actionButton?.dataset.action;
      if (action === 'toggle-sidebar') {
        toggleSidebarCollapsed(windowObject, documentObject);
        return;
      }

      if (action === 'toggle-practice-progress') {
        state.preferences.practiceProgressCollapsed = state.preferences.practiceProgressCollapsed !== true;
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'toggle-learning-nav') {
        state.preferences.learningNavCollapsed = state.preferences.learningNavCollapsed !== true;
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'export-favorites') {
        await exportFavoriteSyncText();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'import-favorites') {
        const changed = importFavoriteSyncText(documentObject);
        if (changed) {
          persistState();
        }
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'select-bank') {
        try {
          await switchQuestionBank(actionButton.dataset.bankId, windowObject, documentObject);
        } catch (error) {
          renderFailure(documentObject, error);
        }
        return;
      }

      if (action === 'bind-learning-archive') {
        try {
          await bindLearningArchive(windowObject, documentObject);
        } catch (error) {
          renderFailure(documentObject, error);
        }
        return;
      }

      if (action === 'start-learning') {
        try {
          await enterLearningMode(windowObject, documentObject, actionButton.dataset.bankId);
        } catch (error) {
          renderFailure(documentObject, error);
        }
        return;
      }

      if (action === 'select-learning-bank') {
        try {
          await enterLearningMode(windowObject, documentObject, actionButton.dataset.bankId);
        } catch (error) {
          renderFailure(documentObject, error);
        }
        return;
      }

      if (action === 'select-learning-module') {
        setActiveLearningModule(actionButton.dataset.moduleId);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'start-module-practice') {
        if (!startActiveModulePractice()) return;
        persistState();
        navigate('practice');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'start-practice-module') {
        setActiveLearningModule(actionButton.dataset.moduleId);
        if (!startActiveModulePractice()) return;
        persistState();
        navigate('practice');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'start-practice-symptom') {
        const symptomId = actionButton.dataset.symptomId;
        if (!symptomId) return;
        if (!startCore2SymptomPractice({
          bankId: CORE2_BANK_ID,
          query: actionButton.dataset.query ?? '',
          symptomIds: [symptomId],
        })) return;
        persistState();
        navigate('practice');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'start-favorites-practice') {
        const favoriteQuestions = getFavoriteQuestions();
        if (!favoriteQuestions.length) return;

        state.currentPractice = createFocusedPracticeSession(
          favoriteQuestions,
          '已收藏题',
        );
        persistState();
        navigate('practice');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'toggle-auto-remove-mistakes') {
        state.preferences.autoRemoveCorrectMistakes = state.preferences.autoRemoveCorrectMistakes === false;
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'start-exam') {
        state.currentExam = createExamSession(state.questions, DEFAULT_EXAM_SIZE);
        persistState();
        navigate('exam');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'practice-submit') {
        submitCurrentPracticeAnswer(documentObject);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'practice-prev') {
        movePracticeIndex(-1);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'practice-next') {
        movePracticeIndex(1);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'jump-practice-question') {
        if (!jumpPracticeQuestion(documentObject)) return;
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'learning-prev') {
        moveLearningIndex(-1);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'learning-next') {
        moveLearningIndex(1);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'jump-learning-question') {
        if (!jumpLearningQuestion(documentObject)) return;
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'toggle-favorite') {
        toggleFavorite(Number(actionButton.dataset.questionId));
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'exam-prev') {
        ensureExamSession();
        saveCurrentExamAnswer(documentObject);
        state.currentExam.currentIndex = Math.max(0, state.currentExam.currentIndex - 1);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'exam-next') {
        ensureExamSession();
        saveCurrentExamAnswer(documentObject);
        const lastIndex = state.currentExam.order.length - 1;
        state.currentExam.currentIndex = Math.min(lastIndex, state.currentExam.currentIndex + 1);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'exam-submit') {
        ensureExamSession();
        saveCurrentExamAnswer(documentObject);
        const result = gradeExamSession(state.currentExam, state.questions);
        recordExamResult(result);
        state.currentExam = null;
        persistState();
        navigate('results');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'retry-wrong-questions') {
        if (!state.lastResult?.wrongIds.length) return;
        state.currentPractice = createRetrySession(state.lastResult.wrongIds);
        persistState();
        navigate('practice');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'restart-exam') {
        state.currentExam = createExamSession(state.questions, DEFAULT_EXAM_SIZE);
        persistState();
        navigate('exam');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'retry-mistakes') {
        const mistakeIds = getMistakeQuestionIds();
        if (!mistakeIds.length) return;
        state.currentPractice = createRetrySession(mistakeIds);
        persistState();
        navigate('practice');
        renderApp(windowObject, documentObject);
        return;
      }

      if (action === 'remove-mistake') {
        const questionId = Number(actionButton.dataset.questionId);
        if (!Number.isFinite(questionId)) return;
        saveRoutePositionAfterQuestionRemoval(
          windowObject,
          documentObject,
          questionId,
          normalizeRoute(windowObject.location.hash),
        );
        removeMistake(questionId);
        persistState();
        renderApp(windowObject, documentObject);
        return;
      }

      const button = event.target.closest('[data-route]');
      if (!button) return;
      if (button.dataset.route === 'learn') {
        try {
          await enterLearningMode(windowObject, documentObject);
        } catch (error) {
          renderFailure(documentObject, error);
        }
        return;
      }
      navigate(button.dataset.route);
    });

    documentObject.addEventListener('change', (event) => {
      const input = event.target?.closest?.('input[name="answer"]');
      if (!input) return;
      if (normalizeRoute(windowObject.location.hash) !== 'practice') return;

      ensurePracticeSession();
      const currentId = state.currentPractice.order[state.currentPractice.currentIndex];
      const question = getQuestionById(currentId);
      if (question?.type === 'multiple') {
        const hadFeedback = Boolean(state.currentPractice.feedback[currentId]);
        state.currentPractice.answers[currentId] = getSelectedAnswers(documentObject);
        delete state.currentPractice.feedback[currentId];
        hideCurrentPracticeAnswer(currentId);
        persistState();
        if (hadFeedback) {
          renderApp(windowObject, documentObject);
        }
        return;
      }
      if (question?.type !== 'single') return;

      submitCurrentPracticeAnswer(documentObject, [input.value]);
      persistState();
      renderApp(windowObject, documentObject);
    });

    documentObject.addEventListener('keydown', (event) => {
      const jumpInput = event.target?.closest?.('[data-question-jump-input]');
      if (jumpInput && event.key === 'Enter') {
        const didJump = jumpInput.dataset.questionJumpInput === 'practice'
          ? jumpPracticeQuestion(documentObject, jumpInput)
          : jumpLearningQuestion(documentObject, jumpInput);
        if (!didJump) return;
        persistState();
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        renderApp(windowObject, documentObject);
        return;
      }

      if (normalizeRoute(windowObject.location.hash) !== 'practice') return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (isTypingTarget(event.target)) return;
      if (event.key === 'Enter') {
        if (!handlePracticeEnter(documentObject)) return;
        persistState();
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        renderApp(windowObject, documentObject);
        return;
      }

      if (event.key === '0') {
        if (!toggleCurrentPracticeFavorite()) return;
        persistState();
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        renderApp(windowObject, documentObject);
        return;
      }

      const shortcutKey = getPracticeShortcutKey(event);
      if (shortcutKey) {
        if (!selectCurrentPracticeOption(shortcutKey)) return;
        persistState();
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        renderApp(windowObject, documentObject);
        return;
      }

      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      movePracticeIndex(event.key === 'ArrowRight' ? 1 : -1);
      persistState();
      if (typeof event.preventDefault === 'function') {
        event.preventDefault();
      }
      renderApp(windowObject, documentObject);
    });

    boundDocuments.add(documentObject);
  }

  if (!boundWindows.has(windowObject)) {
    windowObject.addEventListener('scroll', () => {
      scheduleRoutePositionSave(windowObject, documentObject);
    });

    windowObject.addEventListener('hashchange', async () => {
      if (normalizeRoute(windowObject.location.hash) === 'learn' && !LEARNING_BANK_IDS.has(state?.bankId)) {
        try {
          await enterLearningMode(windowObject, documentObject);
        } catch (error) {
          renderFailure(documentObject, error);
        }
        return;
      }

      renderApp(windowObject, documentObject);
    });

    boundWindows.add(windowObject);
  }
}

function readPersistedState(storage) {
  return {
    progress: storage.get(DEFAULT_KEYS.progress, {}),
    mistakes: storage.get(DEFAULT_KEYS.mistakes, []),
    favorites: storage.get(DEFAULT_KEYS.favorites, []),
    examHistory: storage.get(DEFAULT_KEYS.examHistory, []),
    preferences: storage.get(DEFAULT_KEYS.preferences, { practiceMode: 'sequential' }),
    currentPractice: storage.get(DEFAULT_KEYS.currentPractice, null),
    currentExam: storage.get(DEFAULT_KEYS.currentExam, null),
  };
}

export async function bootstrapApp({
  fetch: fetchImpl = globalThis.fetch,
  storage = createStorageApi(),
  window: windowObject = globalThis.window,
  document: documentObject = globalThis.document,
  archive = createLearningArchiveService({ windowObject }),
} = {}) {
  try {
    appWindow = windowObject;
    appDocument = documentObject;
    fetchApi = fetchImpl;
    lastRenderedRoute = null;
    const persisted = readPersistedState(storage);
    const preferredBankId = persisted.preferences?.activeBankId ?? DEFAULT_BANK_ID;
    const questions = await loadQuestions(fetchImpl, preferredBankId);
    storageApi = storage;
    archiveService = archive;
    state = createInitialState(questions, persisted);
    state.archiveStatus = archiveService?.initialize
      ? await archiveService.initialize()
      : {
        supported: false,
        bound: false,
        fileName: '',
        syncState: 'unsupported',
        lastSyncedAt: null,
        message: '当前浏览器不支持本地文件自动同步',
    };
    hydrateActiveSessions();
    ensureEventBindings(windowObject, documentObject);
    initializeSidebarState(windowObject, documentObject);
    if (normalizeRoute(windowObject.location.hash) === 'learn' && !LEARNING_BANK_IDS.has(state.bankId)) {
      await activateQuestionBank(DEFAULT_LEARNING_BANK_ID);
    }

    if (await consumePendingCore2ModulePractice()) {
      renderApp(windowObject, documentObject);
      return state;
    }

    renderApp(windowObject, documentObject);
    return state;
  } catch (error) {
    renderFailure(documentObject, error);
    return null;
  }
}

await bootstrapApp();
