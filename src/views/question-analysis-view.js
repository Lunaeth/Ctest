import { escapeHtml } from '../learning-annotations.js?v=20261031-sidebar-account';

function renderOutline(analysis) {
  const outline = Array.isArray(analysis.outline) ? analysis.outline : [];
  if (!outline.length) return '';

  return `
    <div class="analysis-section">
      <strong>分析提纲</strong>
      <ul>
        ${outline.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderWhyChoose(analysis) {
  if (!analysis.whyChoose) return '';

  return `
    <div class="analysis-section">
      <strong>为什么选</strong>
      <p>${escapeHtml(analysis.whyChoose)}</p>
    </div>
  `;
}

function renderWhyNotChoose(analysis) {
  const whyNotChoose = Array.isArray(analysis.whyNotChoose) ? analysis.whyNotChoose : [];
  if (!whyNotChoose.length) return '';

  return `
    <div class="analysis-section">
      <strong>为什么不选</strong>
      <ul>
        ${whyNotChoose
          .map((item) => `<li><span>${escapeHtml(item.key)}. ${escapeHtml(item.text ?? '')}</span>：${escapeHtml(item.reason)}</li>`)
          .join('')}
      </ul>
    </div>
  `;
}

export function renderSources(analysis) {
  const sources = (analysis?.sources ?? []).filter(item => /^https:\/\//.test(item.url));
  if (!sources.length) return '';
  return `<section class="ai-sources"><strong>技术参考 / Technical references</strong><p>用于核对技术事实，不是官方考试答案。</p><ul>${sources.map(item => `<li><a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a></li>`).join('')}</ul></section>`;
}

export function renderQuestionAnalysis(analysis) {
  if (!analysis) return '';

  return `
    <section class="question-analysis">
      ${renderWhyChoose(analysis)}
      ${renderWhyNotChoose(analysis)}
      ${renderOutline(analysis)}
      ${renderSources(analysis)}
    </section>
  `;
}
