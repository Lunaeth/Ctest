import { escapeHtml } from './learning-annotations.js';
import { renderQuestionMedia } from './views/question-media.js';

export function renderReviewQuestions(questions) {
  return questions.map((question) => `
    <article class="panel" id="question-${question.id}">
      <h2>原题 ${question.id}</h2>
      <p>${escapeHtml(question.stem)}</p>
      ${renderQuestionMedia(question)}
      <details>
        <summary>查看答案与解析</summary>
        ${(question.answerImages ?? []).map((src) => `<figure><img src="${escapeHtml(src)}" alt="原题 ${question.id} 答案图" loading="lazy"></figure>`).join('')}
        <p class="explanation">${escapeHtml(question.explanation)}</p>
      </details>
    </article>
  `).join('');
}

const root = globalThis.document?.querySelector('#review-questions');
if (root) {
  fetch('./data/questions.ccnp-dcai.review.json')
    .then((response) => {
      if (!response.ok) throw new Error('题库读取失败');
      return response.json();
    })
    .then((questions) => { root.innerHTML = renderReviewQuestions(questions); })
    .catch(() => { root.textContent = '题库加载失败，请刷新页面重试。'; });
}
