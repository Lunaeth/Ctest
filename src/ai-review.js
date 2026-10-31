import { escapeHtml } from './learning-annotations.js?v=20261031-sidebar-account';
import { renderQuestionMedia } from './views/question-media.js?v=20261031-sidebar-account';
import { renderAiStudyLinks } from './views/ai-study-links.js?v=20261031-sidebar-account';

const bilingual = (value) => `<span lang="zh-CN">${escapeHtml(value.zh)}</span><br><span class="ai-english" lang="en">${escapeHtml(value.en)}</span>`;

function renderPrompts(study) {
  if (!study) return '';
  return `<section aria-label="候选项"><h3>候选项 / Choices</h3>
    <ul class="review-choices" lang="en">${Object.entries(study.options).map(([key, option]) => `<li><strong>${escapeHtml(key)}.</strong> ${escapeHtml(option.en)}</li>`).join('')}</ul>
    </section><section aria-label="配对目标"><h3>按顺序配对 / Match in order</h3>
    <ol class="review-prompts" lang="en">${study.matches.map((match) => `<li>${escapeHtml(match.prompt.en)}</li>`).join('')}</ol></section>`;
}

function renderExplanation(question) {
  const study = question.aiStudy;
  if (!study) return `<p class="explanation">${escapeHtml(question.explanation)}</p>`;
  const used = new Set(study.matches.map((match) => match.answerKey));
  return `<p>${bilingual(study.summary)}</p>
    <h3>配对答案 / Matched answers</h3>
    <ol class="review-matches">${study.matches.map((match) => `<li><p lang="en">${escapeHtml(match.prompt.en)}</p><p class="review-answer" lang="en"><strong>${escapeHtml(match.answerKey)}.</strong> ${escapeHtml(study.options[match.answerKey].en)}</p></li>`).join('')}</ol>
    <h3>逐项解析 / Every choice explained</h3>
    ${Object.entries(study.options).map(([key, option]) => `<section class="review-option"><h4>${escapeHtml(key)}. ${escapeHtml(option.en)} <span class="review-choice-status">${used.has(key) ? '已使用 / Used' : '未使用 / Unused'}</span></h4><p>${bilingual(option.reason)}</p></section>`).join('')}
    <h3>记忆提示 / Memory aid</h3><p>${bilingual(study.memory)}</p>
    <h3>易错点 / Pitfall</h3><p>${bilingual(study.pitfall)}</p>
    <h3>解题步骤 / Reasoning steps</h3><ol>${study.steps.map((step) => `<li>${bilingual(step)}</li>`).join('')}</ol>
    <h3>术语 / Terms</h3><ul>${study.terms.map((term) => `<li>${bilingual(term)}</li>`).join('')}</ul>
    <h3>核查依据 / References</h3><ul>${study.sources.map((ref) => `<li><a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}</a></li>`).join('')}</ul>`;
}

export function renderReviewQuestions(questions) {
  return questions.map((question) => `
    <article class="panel" id="question-${question.id}">
      <h2>原题 ${question.id}</h2>
      <p class="question-stem" lang="en">${escapeHtml(question.stem)}</p>
      ${renderQuestionMedia(question)}
      ${renderPrompts(question.aiStudy)}
      <details>
        <summary>查看答案与解析</summary>
        ${renderExplanation(question)}
        ${renderAiStudyLinks(question)}
        <h3>原 PDF 答案图 / Original answer exhibit</h3>
        ${(question.answerImages ?? []).map((src) => `<figure><img src="${escapeHtml(src)}" alt="原题 ${question.id} 答案图" loading="lazy"></figure>`).join('')}
      </details>
    </article>
  `).join('');
}

const root = globalThis.document?.querySelector('#review-questions');
if (root) {
  fetch('./data/questions.ccnp-dcai.review.json?v=20261031-sidebar-account')
    .then((response) => {
      if (!response.ok) throw new Error('题库读取失败');
      return response.json();
    })
    .then((questions) => { root.innerHTML = renderReviewQuestions(questions); })
    .catch(() => { root.textContent = '题库加载失败，请刷新页面重试。'; });
}
