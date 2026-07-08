import { escapeHtml } from '../learning-annotations.js';
import {
  CORE2_CONFUSION_SETS,
  CORE2_HIGH_FREQUENCY_MODULES,
  CORE2_SYMPTOM_MAP,
  getCore2ModuleSnapshot,
  getCore2SymptomGroup,
  getCore2SymptomId,
  isCore2HighYieldPattern,
} from '../core2-study-map.js?v=20260707-core2-process-flows';
import { renderQuestionAnalysis } from './question-analysis-view.js';
import { renderFavoriteSyncControls } from './favorite-sync-view.js';

const TEXT = {
  questionSuffix: '\u9898',
  previous: '\u4e0a\u4e00\u9898',
  compareAnswer: '\u5bf9\u7167\u7b54\u6848',
  next: '\u4e0b\u4e00\u9898',
  favorite: '\u6536\u85cf',
  favorited: '\u5df2\u6536\u85cf',
  correct: '\u56de\u7b54\u6b63\u786e',
  wrong: '\u56de\u7b54\u9519\u8bef',
  correctAnswer: '\u6b63\u786e\u7b54\u6848',
  selectedAnswer: '\u4f60\u7684\u9009\u62e9',
  allOptionExplanations: '\u6240\u6709\u9009\u9879\u89e3\u91ca',
  correctFallback: '\u6b63\u786e\u9009\u9879\uff1a\u56de\u5230\u9898\u5e72\u9650\u5236\uff0c\u4f18\u5148\u9009\u62e9\u6700\u76f4\u63a5\u89e3\u51b3\u95ee\u9898\u7684\u6280\u672f\u6216\u52a8\u4f5c\u3002',
  wrongFallback: '\u5e72\u6270\u9009\u9879\uff1a\u5b83\u53ef\u80fd\u662f\u76f8\u5173\u6280\u672f\uff0c\u4f46\u6ca1\u6709\u76f4\u63a5\u89e3\u51b3\u8fd9\u9053\u9898\u7684\u9898\u5e72\u9650\u5236\u3002',
  progress: '\u7ec3\u4e60\u8fdb\u5ea6',
  currentBank: '\u5f53\u524d\u9898\u5e93',
  currentMode: '\u5f53\u524d\u6a21\u5f0f',
  practiceSource: '\u6765\u6e90',
  jumpToQuestion: '\u8df3\u5230\u9898\u53f7',
  jump: '\u8df3\u8f6c',
  random: '\u968f\u673a',
  sequential: '\u987a\u5e8f',
  collapseProgress: '\u6536\u8d77\u7ec3\u4e60\u8fdb\u5ea6',
  expandProgress: '\u5c55\u5f00\u7ec3\u4e60\u8fdb\u5ea6',
  highFrequencyModule: '\u9ad8\u9891\u6a21\u5757',
  moduleFlow: '\u672c\u9898\u6a21\u5757\u6d41\u7a0b',
  symptomPattern: '\u9898\u5e93\u901f\u67e5',
  examDecision: '\u5e94\u8bd5\u5224\u65ad',
  mistakeReason: '\u9519\u56e0\u5f52\u7c7b',
  confusionGuide: '\u6613\u6df7\u7b54\u6848\u5bf9\u7167',
  moduleSnapshot: '\u6a21\u5757\u901f\u8bb0',
  nextReview: '\u4e0b\u4e00\u6b65\u590d\u76d8',
  practiceThisModule: '\u7ec3\u8fd9\u4e2a\u6a21\u5757',
  samePattern: '\u770b\u540c\u7c7b\u9898\u56fe\u8c31',
  moduleMap: '\u770b\u6a21\u5757\u56fe\u8c31',
  reviewSearch: '\u590d\u76d8\u641c\u7d22',
  multiSelectType: '\u591a\u9009\u9898',
  selectedCount: '\u5df2\u9009',
  selectNeeded: '\u9700\u9009',
  compareInstruction: '\u9009\u5b8c\u70b9\u5bf9\u7167\u7b54\u6848 / Enter',
};

const CORE2_VISUAL_URL = './core2-visual.html?v=20260707-core2-process-flows';
const DEFAULT_PRACTICE_FONT_SCALE = 0.82;
const MIN_PRACTICE_FONT_SCALE = 0.72;
const MAX_PRACTICE_FONT_SCALE = 1;

const CORE2_STUDY_TAG_LABELS = {
  security: 'Security / Malware',
  'os-commands': 'OS / Commands',
  'app-troubleshooting': 'Software Troubleshooting',
  'ops-support': 'Ops / Support',
  'remote-network': 'Remote / Network',
};

const CORE2_MODULE_BY_ID = new Map(
  CORE2_HIGH_FREQUENCY_MODULES.map((module) => [module.id, module]),
);

const MATCH_STOP_WORDS = new Set([
  'and',
  'are',
  'for',
  'from',
  'into',
  'the',
  'user',
  'users',
  'with',
]);

function getCore2VisualUrl(anchor = '', query = '') {
  const params = query ? `&q=${encodeURIComponent(query)}` : '';
  const hash = anchor ? `#${anchor}` : '';
  return `${CORE2_VISUAL_URL}${params}${hash}`;
}

function tokenizeStudyText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !MATCH_STOP_WORDS.has(token));
}

export function normalizePracticeFontScale(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return DEFAULT_PRACTICE_FONT_SCALE;

  return Math.min(
    MAX_PRACTICE_FONT_SCALE,
    Math.max(MIN_PRACTICE_FONT_SCALE, numericValue),
  );
}

function renderPracticeFontControl(fontScale) {
  const normalizedScale = normalizePracticeFontScale(fontScale);
  const percentage = Math.round(normalizedScale * 100);

  return `
    <div class="practice-font-control" aria-label="练习字号">
      <div class="practice-font-control__header">
        <label for="practice-font-scale">字号</label>
        <strong>${percentage}%</strong>
      </div>
      <input
        id="practice-font-scale"
        type="range"
        min="72"
        max="100"
        step="2"
        value="${percentage}"
        data-practice-font-scale
      />
      <div class="practice-font-control__ticks" aria-hidden="true">
        <span>小</span>
        <span>默认</span>
      </div>
    </div>
  `;
}

function renderFavoriteButton(question, isFavorite) {
  return `
    <button
      class="favorite-btn practice-favorite-btn ${isFavorite ? 'is-active' : ''}"
      data-action="toggle-favorite"
      data-question-id="${escapeHtml(question.id)}"
      aria-pressed="${isFavorite ? 'true' : 'false'}"
    >
      <span aria-hidden="true">${isFavorite ? '\u2605' : '\u2606'}</span>
      ${isFavorite ? TEXT.favorited : TEXT.favorite}
    </button>
  `;
}

function renderPracticeStudyTags(question) {
  const tags = (question.learning?.studyTags ?? [])
    .map((tag) => ({ tag, label: CORE2_STUDY_TAG_LABELS[tag] }))
    .filter(({ label }) => Boolean(label));

  if (!tags.length) return '';
  const primaryTag = tags[0]?.tag ?? '';

  return `
    <div class="practice-study-strip" data-section="practice-study-tags">
      <div class="practice-tags" aria-label="Core 2 high-frequency modules">
        <strong>${TEXT.highFrequencyModule}</strong>
        ${tags.map(({ tag, label }) => `
          <a href="${escapeHtml(getCore2VisualUrl(tag, label))}">${escapeHtml(label)}</a>
        `).join('')}
      </div>
      <a class="practice-visual-link" href="${escapeHtml(getCore2VisualUrl(primaryTag))}">Core 2 高频</a>
    </div>
  `;
}

function getOptionAnnotation(question, key) {
  return question.learning?.options?.find((item) => item.key === key);
}

function getAnalysisExplanation(question, option, isCorrect) {
  if (isCorrect && question.analysis?.whyChoose) {
    return question.analysis.whyChoose;
  }

  return question.analysis?.whyNotChoose
    ?.find((item) => item.key === option.key)
    ?.reason;
}

function normalizeDecisionText(value, maxLength = 110) {
  const plainText = String(value ?? '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return plainText.length > maxLength
    ? `${plainText.slice(0, maxLength - 1)}...`
    : plainText;
}

function getWrongSelectionReasons(question, selectedKeys = [], answerKeys = new Set()) {
  const selectedSet = new Set(normalizeChoiceKeys(selectedKeys));
  const wrongOptions = (question.options ?? [])
    .filter((option) => selectedSet.has(option.key) && !answerKeys.has(option.key));

  return wrongOptions
    .map((option) => {
      const reason = normalizeDecisionText(
        getAnalysisExplanation(question, option, false)
          ?? getOptionAnnotation(question, option.key)?.explanation
          ?? TEXT.wrongFallback,
        76,
      );
      return `${option.key}. ${option.text}：${reason}`;
    })
    .join('；');
}

function prefersAnalysisExplanation(question) {
  return question.analysis?.source === 'core2';
}

function renderOptionExplanation(question, option, isCorrect) {
  if (prefersAnalysisExplanation(question)) {
    const analysisExplanation = getAnalysisExplanation(question, option, isCorrect);
    if (analysisExplanation) return escapeHtml(analysisExplanation);
  }

  const annotation = getOptionAnnotation(question, option.key);
  if (annotation?.explanationHtml) return annotation.explanationHtml;
  if (annotation?.explanation) return escapeHtml(annotation.explanation);

  const analysisExplanation = getAnalysisExplanation(question, option, isCorrect);
  if (analysisExplanation) return escapeHtml(analysisExplanation);

  return isCorrect ? TEXT.correctFallback : TEXT.wrongFallback;
}

function renderPracticeOptionExplanations(question, selectedAnswer = []) {
  const answerKeys = new Set(question.answer ?? []);
  const selectedKeys = new Set(selectedAnswer ?? []);

  return `
    <section class="practice-option-explanations" data-section="practice-option-explanations">
      <strong>${TEXT.allOptionExplanations}</strong>
      <div class="practice-option-list">
        ${question.options.map((option) => {
    const isCorrect = answerKeys.has(option.key);
    const isSelected = selectedKeys.has(option.key);
    const classNames = [
      'practice-option',
      isCorrect ? 'is-correct' : 'is-wrong',
      isSelected ? 'is-selected' : '',
    ].filter(Boolean).join(' ');
    const explanationHtml = renderOptionExplanation(question, option, isCorrect);

    return `
          <article class="${classNames}">
            <div class="practice-option__choice">
              <strong>${escapeHtml(option.key)}.</strong>
              <span>${escapeHtml(option.text)}</span>
              ${isCorrect ? `<em>${TEXT.correctAnswer}</em>` : ''}
              ${isSelected ? `<em class="is-selected-badge">${TEXT.selectedAnswer}</em>` : ''}
            </div>
            <p class="practice-option__explanation">${explanationHtml}</p>
          </article>
        `;
  }).join('')}
      </div>
    </section>
  `;
}

export function selectPracticeModuleFlow(question, module, maxItems = 2) {
  const questionTokens = new Set([
    ...tokenizeStudyText(question?.stem),
    ...tokenizeStudyText(getCorrectAnswerText(question)),
  ]);
  const rankedFlow = (module?.flow ?? [])
    .map((line, index) => ({
      line,
      index,
      score: tokenizeStudyText(line)
        .filter((token) => questionTokens.has(token))
        .length,
    }));
  const matchedFlow = rankedFlow
    .filter((item) => item.score >= 2)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, maxItems)
    .map((item) => item.line);

  return matchedFlow.length ? matchedFlow : (module?.flow ?? []).slice(0, maxItems);
}

function getPracticeModuleGuides(question) {
  return (question.learning?.studyTags ?? [])
    .map((tag) => CORE2_MODULE_BY_ID.get(tag))
    .filter(Boolean)
    .map((module) => ({
      id: module.id,
      label: module.label,
      flow: selectPracticeModuleFlow(question, module),
    }));
}

function getPracticeModuleSnapshots(moduleGuides = []) {
  return moduleGuides
    .map((module) => ({
      module,
      snapshot: getCore2ModuleSnapshot(module.id),
    }))
    .filter(({ snapshot }) => snapshot.group && snapshot.count && snapshot.mnemonics.length);
}

function getCorrectAnswerText(question) {
  const answerKeys = new Set(question.answer ?? []);
  return (question.options ?? [])
    .filter((option) => answerKeys.has(option.key))
    .map((option) => option.text)
    .join(' ');
}

function getAnswerText(question, keys = []) {
  const keySet = new Set(normalizeChoiceKeys(keys));
  return (question.options ?? [])
    .filter((option) => keySet.has(option.key))
    .map((option) => option.text)
    .join(' / ');
}

function getAnswerChoiceText(question, keys = []) {
  const keySet = new Set(normalizeChoiceKeys(keys));
  return (question.options ?? [])
    .filter((option) => keySet.has(option.key))
    .map((option) => `${option.key}. ${option.text}`)
    .join(' / ');
}

function normalizeChoiceKeys(keys = []) {
  return Array.isArray(keys) ? keys : [keys].filter(Boolean);
}

export function getPracticeAnswerPrompt(question, selectedAnswer = []) {
  const answerKeys = normalizeChoiceKeys(question?.answer);
  const selectedKeys = normalizeChoiceKeys(selectedAnswer);
  if (question?.type !== 'multiple' && answerKeys.length <= 1) return null;

  return {
    neededCount: answerKeys.length,
    selectedCount: selectedKeys.length,
    text: `${TEXT.multiSelectType}：${TEXT.selectNeeded} ${answerKeys.length} 个，${TEXT.selectedCount} ${selectedKeys.length} 个；${TEXT.compareInstruction}`,
  };
}

function renderPracticeAnswerPrompt(question, selectedAnswer = []) {
  const prompt = getPracticeAnswerPrompt(question, selectedAnswer);
  if (!prompt) return '';

  const isComplete = prompt.selectedCount === prompt.neededCount;
  return `
    <div class="practice-answer-prompt ${isComplete ? 'is-complete' : ''}" data-section="practice-answer-prompt">
      <strong>${TEXT.multiSelectType}</strong>
      <span>${escapeHtml(prompt.text)}</span>
    </div>
  `;
}

function buildMultiSelectDecisionHint(question, selectedKeys = []) {
  const answerKeys = normalizeChoiceKeys(question.answer);
  const selectedList = normalizeChoiceKeys(selectedKeys);
  if (question.type !== 'multiple' && answerKeys.length <= 1) return '';

  const selectedSet = new Set(selectedList);
  const answerSet = new Set(answerKeys);
  const missingKeys = answerKeys.filter((key) => !selectedSet.has(key));
  const extraKeys = selectedList.filter((key) => !answerSet.has(key));
  const parts = [];

  if (missingKeys.length) parts.push(`漏选：${getAnswerChoiceText(question, missingKeys)}`);
  if (extraKeys.length) parts.push(`多选：${getAnswerChoiceText(question, extraKeys)}`);
  if (!parts.length) parts.push('多选题已命中：每个正确项都对应题干里的一个需求');

  return parts.join('；');
}

function getSymptomPatternMatch(question, row) {
  const stemTokens = new Set(tokenizeStudyText(question.stem));
  const answerTokens = new Set(tokenizeStudyText(getCorrectAnswerText(question)));
  const tags = new Set(question.learning?.studyTags ?? []);
  const symptomTokens = tokenizeStudyText(row.symptom);
  const rowAnswerTokens = tokenizeStudyText(row.answer);
  const rowGroup = getCore2SymptomGroup(row.group);

  const symptomScore = symptomTokens
    .filter((token) => stemTokens.has(token))
    .length;
  const answerScore = rowAnswerTokens
    .filter((token) => answerTokens.has(token))
    .length;
  const moduleScore = tags.has(rowGroup?.moduleId) ? 1 : 0;
  const clueTerms = symptomTokens
    .filter((token) => stemTokens.has(token))
    .slice(0, 4);
  const answerTerms = rowAnswerTokens
    .filter((token) => answerTokens.has(token))
    .slice(0, 4);

  return {
    row,
    score: symptomScore + (answerScore * 2) + moduleScore,
    evidence: {
      clueTerms,
      answerTerms,
      hasModuleMatch: Boolean(moduleScore),
    },
  };
}

function getPracticeSymptomPatterns(question) {
  if (!question.learning?.studyTags?.length) return [];

  return CORE2_SYMPTOM_MAP
    .map((row) => getSymptomPatternMatch(question, row))
    .filter(({ score }) => score >= 3)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);
}

function scoreConfusionRow(row, questionTokens) {
  return tokenizeStudyText([
    row.cue,
    row.choose,
    row.avoid,
  ].join(' '))
    .filter((token) => questionTokens.has(token))
    .length;
}

function getPracticeConfusionRows(question, feedback, maxItems = 2) {
  const tags = new Set(question.learning?.studyTags ?? []);
  if (!tags.size) return [];

  const selectedText = getAnswerText(question, feedback?.selectedAnswer ?? []);
  const questionTokens = new Set([
    ...tokenizeStudyText(question.stem),
    ...tokenizeStudyText(getCorrectAnswerText(question)),
    ...tokenizeStudyText(selectedText),
  ]);
  const primaryGroup = getPracticeSymptomPatterns(question)[0]?.row?.group;
  const matchedSets = CORE2_CONFUSION_SETS
    .filter((set) => tags.has(set.moduleId) || set.group === primaryGroup);

  return matchedSets
    .flatMap((set) => set.rows.map((row, index) => ({
      row,
      set,
      index,
      score: scoreConfusionRow(row, questionTokens),
    })))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, maxItems);
}

function getPracticeReviewQuery(primaryPattern, primaryModule) {
  if (primaryPattern) {
    return [primaryPattern.group, primaryPattern.answer]
      .filter(Boolean)
      .join(' ')
      .replace(/\s*\+\s*/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return primaryModule?.label ?? '';
}

export function buildPracticeExamDecision(question, feedback) {
  if (!question || !feedback) return null;

  const selectedKeys = normalizeChoiceKeys(feedback.selectedAnswer);
  const answerKeys = new Set(normalizeChoiceKeys(question.answer));
  const selectedText = getAnswerText(question, selectedKeys) || '\u672a\u9009\u62e9';
  const correctText = getCorrectAnswerText(question);
  const primaryPattern = getPracticeSymptomPatterns(question)[0]?.row;
  const primaryModule = getPracticeModuleGuides(question)[0];
  const patternText = primaryPattern
    ? `${primaryPattern.symptom} -> ${primaryPattern.answer}`
    : '';
  const visualUrl = primaryPattern
    ? getCore2VisualUrl(getCore2SymptomId(primaryPattern), primaryPattern.group)
    : (primaryModule ? getCore2VisualUrl(primaryModule.id, primaryModule.label) : '');
  const reviewQuery = getPracticeReviewQuery(primaryPattern, primaryModule);

  if (feedback.correct) {
    const multiSelectHint = buildMultiSelectDecisionHint(question, selectedKeys);
    const correctTextPrefix = patternText
      ? `\u547d\u4e2d ${patternText}\uff1b\u8003\u573a\u5148\u6293\u9898\u5e72\u9650\u5236\uff0c\u518d\u9009\u6700\u76f4\u63a5\u52a8\u4f5c\u3002`
      : `\u547d\u4e2d ${primaryModule?.label ?? '\u5f53\u524d\u573a\u666f'}\uff1b\u6b63\u786e\u7b54\u6848\u662f ${correctText}\uff0c\u8bb0\u4f4f\u9898\u5e72\u9650\u5236\u4f18\u5148\u3002`;

    return {
      status: 'correct',
      text: multiSelectHint ? `${correctTextPrefix} ${multiSelectHint}。` : correctTextPrefix,
      visualUrl,
      visualLabel: primaryPattern ? TEXT.samePattern : TEXT.moduleMap,
      reviewQuery,
    };
  }

  const wrongReason = getWrongSelectionReasons(question, selectedKeys, answerKeys);
  const baseText = patternText
    ? `\u4f60\u9009\u4e86 ${selectedText}\uff1b\u672c\u9898\u5e94\u770b ${patternText}\uff0c\u6b63\u786e\u7b54\u6848\u662f ${correctText}\u3002`
    : `\u4f60\u9009\u4e86 ${selectedText}\uff1b\u6b63\u786e\u7b54\u6848\u662f ${correctText}\u3002\u5148\u56de\u5230\u9898\u5e72\u9650\u5236\uff0c\u522b\u88ab\u76f8\u5173\u4f46\u4e0d\u76f4\u63a5\u7684\u9009\u9879\u5e26\u8d70\u3002`;
  const multiSelectHint = buildMultiSelectDecisionHint(question, selectedKeys);
  const decisionText = [
    baseText,
    multiSelectHint ? `多选定位：${multiSelectHint}。` : '',
    wrongReason ? `\u6392\u9664\u6240\u9009\uff1a${wrongReason}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    status: 'wrong',
    text: decisionText,
    visualUrl,
    visualLabel: primaryPattern ? TEXT.samePattern : TEXT.moduleMap,
    reviewQuery,
  };
}

export function buildPracticeMistakeReason(question, feedback) {
  if (!question || !feedback || feedback.correct) return null;

  const moduleGuides = getPracticeModuleGuides(question);
  const primaryPattern = getPracticeSymptomPatterns(question)[0]?.row;
  const primaryModule = moduleGuides[0];
  if (!primaryPattern && !primaryModule) return null;

  const selectedKeys = normalizeChoiceKeys(feedback.selectedAnswer);
  const answerKeys = normalizeChoiceKeys(question.answer);
  const selectedSet = new Set(selectedKeys);
  const answerSet = new Set(answerKeys);
  const isMultiple = question.type === 'multiple' || answerKeys.length > 1;
  const missingKeys = answerKeys.filter((key) => !selectedSet.has(key));
  const extraKeys = selectedKeys.filter((key) => !answerSet.has(key));
  const selectedWrongKeys = extraKeys.length ? extraKeys : selectedKeys;
  const patternText = primaryPattern
    ? `${primaryPattern.symptom} -> ${primaryPattern.answer}`
    : selectPracticeModuleFlow(question, primaryModule, 1)[0];
  const details = getWrongSelectionReasons(question, selectedWrongKeys, answerSet);

  if (isMultiple) {
    const parts = [];
    if (missingKeys.length) parts.push(`漏选 ${getAnswerChoiceText(question, missingKeys)}`);
    if (extraKeys.length) parts.push(`多选 ${getAnswerChoiceText(question, extraKeys)}`);
    if (!parts.length) parts.push('组合没对齐题干需求');

    return {
      text: `先看组合：${parts.join('；')}。`,
      hint: patternText ? `速记：${patternText}。` : '',
      details: details ? `排除：${normalizeDecisionText(details, 120)}。` : '',
    };
  }

  const selectedText = getAnswerChoiceText(question, selectedWrongKeys) || '未选择';
  const correctText = getAnswerChoiceText(question, answerKeys) || getCorrectAnswerText(question);

  return {
    text: `选错点：${selectedText}；正确方向：${correctText}。`,
    hint: patternText ? `速记：${patternText}。` : '',
    details: details ? `排除：${normalizeDecisionText(details, 120)}。` : '',
  };
}

function renderPracticeExamDecision(question, feedback) {
  const decision = buildPracticeExamDecision(question, feedback);
  if (!decision) return '';

  return `
    <div class="practice-exam-decision is-${decision.status}" data-section="practice-exam-decision">
      <strong>${TEXT.examDecision}</strong>
      <p>${escapeHtml(decision.text)}</p>
      ${decision.visualUrl ? `
        <a class="practice-exam-decision__link" href="${escapeHtml(decision.visualUrl)}">${escapeHtml(decision.visualLabel)}</a>
      ` : ''}
      ${decision.reviewQuery ? `
        <span class="practice-exam-decision__review">
          <strong>${TEXT.reviewSearch}</strong>
          ${escapeHtml(decision.reviewQuery)}
        </span>
      ` : ''}
    </div>
  `;
}

function renderPracticeMistakeReason(question, feedback) {
  const reason = buildPracticeMistakeReason(question, feedback);
  if (!reason) return '';

  return `
    <div class="practice-mistake-reason is-wrong" data-section="practice-mistake-reason">
      <strong>${TEXT.mistakeReason}</strong>
      <p>${escapeHtml(reason.text)}</p>
      ${reason.hint ? `<span>${escapeHtml(reason.hint)}</span>` : ''}
      ${reason.details ? `<small>${escapeHtml(reason.details)}</small>` : ''}
    </div>
  `;
}

function renderSymptomEvidence(match = {}) {
  const { clueTerms = [], answerTerms = [], hasModuleMatch = false } = match.evidence ?? {};
  const row = match.row ?? {};
  const evidenceParts = [];

  if (clueTerms.length) evidenceParts.push(`\u9898\u5e72\u8bcd: ${clueTerms.join(', ')}`);
  if (answerTerms.length) evidenceParts.push(`\u7b54\u6848\u8bcd: ${answerTerms.join(', ')}`);
  if (hasModuleMatch) evidenceParts.push('\u6a21\u5757\u547d\u4e2d');
  if (row.symptom && row.answer) {
    evidenceParts.push(`\u901f\u901a: \u770b\u5230 ${row.symptom} -> \u9009 ${row.answer}`);
  }
  if (!evidenceParts.length) return '';

  return `<span class="practice-symptom-guide__evidence" data-section="practice-symptom-evidence">${escapeHtml(evidenceParts.join(' / '))}</span>`;
}

function renderSymptomPriorityBadge(row) {
  if (!isCore2HighYieldPattern(row)) return '';

  return `
    <a
      class="practice-symptom-guide__priority"
      href="${escapeHtml(getCore2VisualUrl(getCore2SymptomId(row), 'high-yield'))}"
    >
      重点
    </a>
  `;
}

function renderPracticeLearningSummary(question, feedback) {
  const keyPointHtml = question.learning?.keyPointHtml;
  const speedTipHtml = question.learning?.speedTipHtml;
  const studyNotes = question.learning?.studyNotesHtml ?? [];
  const moduleGuides = getPracticeModuleGuides(question);
  const moduleSnapshots = getPracticeModuleSnapshots(moduleGuides);
  const symptomPatterns = getPracticeSymptomPatterns(question);
  const confusionRows = getPracticeConfusionRows(question, feedback);

  if (
    !keyPointHtml
    && !speedTipHtml
    && !studyNotes.length
    && !symptomPatterns.length
    && !moduleGuides.length
    && !confusionRows.length
  ) return '';

  return `
    <section class="practice-learning-summary" data-section="practice-learning-summary">
      ${moduleGuides.length ? `
        <div class="practice-learning-summary__item practice-next-review" data-section="practice-next-review">
          <strong>${TEXT.nextReview}</strong>
          <button
            type="button"
            class="secondary-btn practice-next-review__button"
            data-action="start-practice-module"
            data-module-id="${escapeHtml(moduleGuides[0].id)}"
          >
            ${TEXT.practiceThisModule}：${escapeHtml(moduleGuides[0].label)}
          </button>
        </div>
      ` : ''}
      ${keyPointHtml ? `
        <div class="practice-learning-summary__item">
          <strong>关键</strong>
          <p>${keyPointHtml}</p>
        </div>
      ` : ''}
      ${speedTipHtml ? `
        <div class="practice-learning-summary__item">
          <strong>速通提</strong>
          <p>${speedTipHtml}</p>
        </div>
      ` : ''}
      ${studyNotes.length ? `
        <div class="practice-learning-summary__item">
          <strong>高频知识</strong>
          <ul>
            ${studyNotes.map((note) => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
      ${moduleSnapshots.length ? `
        <div class="practice-learning-summary__item practice-module-snapshot" data-section="practice-module-snapshot">
          <strong>${TEXT.moduleSnapshot}</strong>
          ${moduleSnapshots.map(({ module, snapshot }) => `
            <div class="practice-module-snapshot__group">
              <div class="practice-module-snapshot__head">
                <a href="${escapeHtml(getCore2VisualUrl(snapshot.group.id, snapshot.group.group))}">${escapeHtml(module.label)}</a>
                <span>${escapeHtml(snapshot.count)} patterns</span>
              </div>
              <ul>
                ${snapshot.mnemonics.map((item) => `
                  <li><a href="${escapeHtml(getCore2VisualUrl(item.id, snapshot.group.group))}">${escapeHtml(item.text)}</a></li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${symptomPatterns.length ? `
        <div class="practice-learning-summary__item practice-symptom-guide" data-section="practice-symptom-guide">
          <strong>${TEXT.symptomPattern}</strong>
          <ul>
            ${symptomPatterns.map((row) => `
              <li>
                <a href="${escapeHtml(getCore2VisualUrl(getCore2SymptomId(row.row), row.row.group))}">${escapeHtml(row.row.symptom)}</a>
                <em>-&gt;</em>
                <strong>${escapeHtml(row.row.answer)}</strong>
                <small>${escapeHtml(row.row.group)}</small>
                ${renderSymptomPriorityBadge(row.row)}
                <button
                  type="button"
                  class="practice-symptom-guide__practice"
                  data-action="start-practice-symptom"
                  data-symptom-id="${escapeHtml(getCore2SymptomId(row.row))}"
                  data-query="${escapeHtml(row.row.symptom)}"
                >
                  练这类题
                </button>
                ${renderSymptomEvidence(row)}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${moduleGuides.length ? `
        <div class="practice-learning-summary__item practice-module-guide" data-section="practice-module-guide">
          <strong>${TEXT.moduleFlow}</strong>
          <ul>
            ${moduleGuides.map((module) => `
              <li>
                <a href="${escapeHtml(getCore2VisualUrl(module.id, module.label))}">${escapeHtml(module.label)}</a>:
                ${module.flow.map(escapeHtml).join(' / ')}
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
      ${confusionRows.length ? `
        <div class="practice-learning-summary__item practice-confusion-guide" data-section="practice-confusion-guide">
          <strong>${TEXT.confusionGuide}</strong>
          <ul>
            ${confusionRows.map(({ row, set }) => `
              <li>
                <a href="${escapeHtml(getCore2VisualUrl(set.id))}">${escapeHtml(set.title)}</a>
                <strong>${escapeHtml(row.cue)}</strong>
                <em>选 ${escapeHtml(row.choose)}；排 ${escapeHtml(row.avoid)}</em>
              </li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </section>
  `;
}

function renderPracticeNavigator(
  bankLabel,
  modeLabel,
  isProgressCollapsed,
  source = null,
  currentNumber = 1,
  total = 1,
  favoriteCount = 0,
  favoriteSync = {},
  fontScale = DEFAULT_PRACTICE_FONT_SCALE,
) {
  const toggleLabel = isProgressCollapsed ? TEXT.expandProgress : TEXT.collapseProgress;
  const sourceLabel = String(source?.label ?? '').trim();
  const sourceUrl = String(source?.url ?? '').trim();
  return `
      <aside class="panel navigator-panel practice-progress-panel ${isProgressCollapsed ? 'is-collapsed' : ''}" id="practice-nav">
        <div class="practice-progress-header">
          <div>
            <h3>${TEXT.progress}</h3>
            <p class="practice-progress-compact">\u7b2c ${currentNumber} / ${total} \u9898</p>
          </div>
          <button
            class="practice-progress-toggle"
            type="button"
            data-action="toggle-practice-progress"
            aria-expanded="${isProgressCollapsed ? 'false' : 'true'}"
            aria-controls="practice-progress-body"
            aria-label="${toggleLabel}"
            title="${toggleLabel}"
          >
            <span aria-hidden="true">\u2304</span>
          </button>
        </div>
        <div class="practice-progress-body" id="practice-progress-body" ${isProgressCollapsed ? 'hidden' : ''}>
          <p>${TEXT.currentBank}：${escapeHtml(bankLabel)}</p>
          <p>${TEXT.currentMode}：${escapeHtml(modeLabel)}</p>
          ${renderPracticeFontControl(fontScale)}
          <div class="question-jump-control" aria-label="${TEXT.jumpToQuestion}">
            <label for="practice-question-jump">${TEXT.jumpToQuestion}</label>
            <div class="question-jump-control__row">
              <input
                id="practice-question-jump"
                type="number"
                min="1"
                max="${total}"
                value="${currentNumber}"
                inputmode="numeric"
                data-question-jump-input="practice"
              />
              <button class="secondary-btn" type="button" data-action="jump-practice-question">${TEXT.jump}</button>
            </div>
          </div>
          ${sourceLabel && sourceUrl ? `
            <a class="practice-source-link" href="${escapeHtml(sourceUrl)}">
              ${TEXT.practiceSource}：${escapeHtml(sourceLabel)}
            </a>
          ` : ''}
          ${renderFavoriteSyncControls({
    favoriteCount,
    syncText: favoriteSync.text,
    syncMessage: favoriteSync.message,
    syncMessageKind: favoriteSync.kind,
  })}
        </div>
      </aside>
  `;
}

export function renderPracticeView(
  question,
  session,
  feedback,
  selectedAnswer = [],
  bankLabel = '',
  {
    isFavorite = false,
    isProgressCollapsed = false,
    favoriteCount = 0,
    favoriteSync = {},
    fontScale = DEFAULT_PRACTICE_FONT_SCALE,
  } = {},
) {
  const currentNumber = session.currentIndex + 1;
  const total = session.order.length;
  const modeLabel = session.label || (session.mode === 'random' ? TEXT.random : TEXT.sequential);
  const isMultiple = question.type === 'multiple';
  const normalizedFontScale = normalizePracticeFontScale(fontScale);

  return `
    <section class="workspace-grid ${isProgressCollapsed ? 'is-practice-progress-collapsed' : ''}">
      <article class="panel question-panel practice-question-panel" style="--practice-font-scale: ${normalizedFontScale}">
        <div class="practice-topbar">
          <div class="question-meta">
            <span>${escapeHtml(bankLabel)}</span>
            <strong>\u7b2c ${currentNumber} / ${total} ${TEXT.questionSuffix}</strong>
          </div>
          ${renderFavoriteButton(question, isFavorite)}
        </div>
        <h2 class="question-stem">${escapeHtml(question.stem)}</h2>
        ${renderPracticeAnswerPrompt(question, selectedAnswer)}
        ${renderPracticeStudyTags(question)}
        <div class="option-list">
          ${question.options.map((option) => `
            <label class="option-item">
              <input
                type="${question.type === 'single' ? 'radio' : 'checkbox'}"
                name="answer"
                value="${escapeHtml(option.key)}"
                ${selectedAnswer.includes(option.key) ? 'checked' : ''}
              />
              <span>${escapeHtml(option.key)}. ${escapeHtml(option.text)}</span>
            </label>
          `).join('')}
        </div>
        <div class="toolbar">
          <button class="secondary-btn" data-action="practice-prev" ${session.currentIndex === 0 ? 'disabled' : ''}>${TEXT.previous}</button>
          ${isMultiple ? `<button class="primary-btn" data-action="practice-submit">${TEXT.compareAnswer}</button>` : ''}
          <button class="secondary-btn" data-action="practice-next" ${session.currentIndex === total - 1 ? 'disabled' : ''}>${TEXT.next}</button>
        </div>
        ${feedback ? `
          <div class="feedback ${feedback.correct ? 'is-correct' : 'is-wrong'}">
            <strong>${feedback.correct ? TEXT.correct : TEXT.wrong}</strong>
            <p>${TEXT.correctAnswer}：${feedback.correctAnswer.map(escapeHtml).join(', ')}</p>
          </div>
          ${renderPracticeOptionExplanations(question, feedback.selectedAnswer ?? selectedAnswer)}
          ${renderQuestionAnalysis(question.analysis)}
          ${renderPracticeExamDecision(question, feedback)}
          ${renderPracticeMistakeReason(question, feedback)}
          ${renderPracticeLearningSummary(question, feedback)}
        ` : ''}
      </article>
      ${renderPracticeNavigator(
    bankLabel,
    modeLabel,
    isProgressCollapsed,
    session.source,
    currentNumber,
    total,
    favoriteCount,
    favoriteSync,
    normalizedFontScale,
  )}
    </section>
  `;
}
