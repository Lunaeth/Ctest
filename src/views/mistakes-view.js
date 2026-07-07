import { escapeHtml } from '../learning-annotations.js';
import { renderQuestionAnalysis } from './question-analysis-view.js';

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

  return isCorrect
    ? '正确选项：回到题干限制，优先选择最直接解决问题的技术或动作。'
    : '干扰选项：它可能是相关技术，但没有直接解决这道题的题干限制。';
}

function renderLearningSummary(question) {
  const keyPointHtml = question.learning?.keyPointHtml;
  const speedTipHtml = question.learning?.speedTipHtml;
  const studyNotes = question.learning?.studyNotesHtml ?? [];

  if (!keyPointHtml && !speedTipHtml && !studyNotes.length) return '';

  return `
    <section class="mistake-learning-summary" data-section="mistake-learning-summary">
      ${keyPointHtml ? `
        <div class="mistake-learning-summary__item">
          <strong>关键点</strong>
          <p>${keyPointHtml}</p>
        </div>
      ` : ''}
      ${speedTipHtml ? `
        <div class="mistake-learning-summary__item">
          <strong>速通提示</strong>
          <p>${speedTipHtml}</p>
        </div>
      ` : ''}
      ${studyNotes.length ? `
        <div class="mistake-learning-summary__item">
          <strong>高频知识点</strong>
          <ul>
            ${studyNotes.map((note) => `<li>${note}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </section>
  `;
}

function renderCorrectAnswerList(question) {
  return (question.answer ?? []).map((key) => {
    const option = question.options.find((item) => item.key === key);
    const label = option ? `${key}. ${option.text}` : key;
    return `<li>${escapeHtml(label)}</li>`;
  }).join('');
}

function renderMistakeOptionList(question) {
  const answerKeys = new Set(question.answer ?? []);

  return `
    <section class="mistake-card__options" data-section="mistake-options">
      <strong>所有选项解析</strong>
      <div class="mistake-option-list">
        ${question.options.map((option) => {
    const isCorrect = answerKeys.has(option.key);
    const explanationHtml = renderOptionExplanation(question, option, isCorrect);

    return `
          <article class="mistake-option ${isCorrect ? 'is-correct' : 'is-wrong'}">
            <div class="mistake-option__choice">
              <strong>${escapeHtml(option.key)}.</strong>
              <span>${escapeHtml(option.text)}</span>
              ${isCorrect ? '<em>正确答案</em>' : ''}
            </div>
            <p class="mistake-option__explanation">${explanationHtml}</p>
          </article>
        `;
  }).join('')}
      </div>
    </section>
  `;
}

function renderMistakeCard(question) {
  return `
    <article class="panel mistake-card" data-question-id="${escapeHtml(String(question.id))}">
      <div class="mistake-card__meta">
        <span>${escapeHtml(question.topic ?? 'Mistake')}</span>
        <strong>#${escapeHtml(String(question.id))}</strong>
      </div>
      <h3 class="mistake-card__stem">${escapeHtml(question.stem)}</h3>
      <p class="mistake-card__type">${question.type === 'multiple' ? 'Multiple choice' : 'Single choice'}</p>
      <div class="mistake-card__answers">
        <strong>Correct answer</strong>
        <ul>${renderCorrectAnswerList(question)}</ul>
      </div>
      ${renderLearningSummary(question)}
      ${renderMistakeOptionList(question)}
      ${renderQuestionAnalysis(question.analysis)}
      <div class="toolbar">
        <button class="secondary-btn" data-action="remove-mistake" data-question-id="${escapeHtml(String(question.id))}">Remove</button>
      </div>
    </article>
  `;
}

function renderArchivePanel(archiveStatus) {
  const status = {
    supported: false,
    bound: false,
    fileName: '',
    syncState: 'unsupported',
    lastSyncedAt: null,
    message: '当前浏览器不支持本地文件自动同步。',
    ...archiveStatus,
  };

  return `
    <article class="panel archive-panel">
      <div>
        <p class="eyebrow">Learning Archive</p>
        <h3>学习存档 JSON</h3>
        <p>${status.bound
          ? `当前文件：${status.fileName}`
          : '创建一个本地 JSON 文件，自动同步当前完整学习状态。'}</p>
        <p class="archive-status" data-archive-status>${status.message}</p>
        ${status.lastSyncedAt ? `<p class="archive-meta">最近同步：${status.lastSyncedAt}</p>` : ''}
      </div>
      ${status.supported ? `
        <button class="secondary-btn" data-action="bind-learning-archive">
          ${status.bound ? '重新绑定学习存档' : '创建学习存档 JSON'}
        </button>
      ` : ''}
    </article>
  `;
}

function renderAutoRemoveButton(isEnabled) {
  return `
    <button class="secondary-btn" data-action="toggle-auto-remove-mistakes">
      答对自动移除：${isEnabled ? '开' : '关'}
    </button>
  `;
}

export function renderMistakesView(
  mistakes,
  bankLabel = '',
  archiveStatus = {},
  autoRemoveCorrectMistakes = true,
) {
  const archivePanel = renderArchivePanel(archiveStatus);

  if (!mistakes.length) {
    return `
      <section class="mistakes-layout">
        ${archivePanel}
        <section class="panel mistakes-empty" data-empty-state="mistakes">
          <h2>错题本</h2>
          <p>当前题库：${bankLabel}</p>
          <p>当前没有错题记录，可以先去练习或考试。</p>
          <div class="hero-actions">
            ${renderAutoRemoveButton(autoRemoveCorrectMistakes)}
          </div>
        </section>
      </section>
    `;
  }

  return `
    <section class="mistakes-layout">
      <article class="panel mistakes-summary">
        <div>
          <p class="eyebrow">Mistake Notebook</p>
          <h2>错题本</h2>
          <p>当前题库：${bankLabel}</p>
          <p>已收录 ${mistakes.length} 道错题，支持集中重练和逐题移除。</p>
        </div>
        <div class="hero-actions">
          <button class="primary-btn" data-action="retry-mistakes">重练错题</button>
          ${renderAutoRemoveButton(autoRemoveCorrectMistakes)}
        </div>
      </article>
      ${archivePanel}
      <div class="mistake-list">
        ${mistakes.map((question) => renderMistakeCard(question)).join('')}
      </div>
    </section>
  `;
}
