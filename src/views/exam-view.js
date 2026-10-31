import { renderQuestionMedia, renderOptionText } from './question-media.js?v=20261031-sidebar-account';
import { escapeHtml } from '../learning-annotations.js?v=20261031-sidebar-account';

export function renderExamView(question, session, selectedAnswer = [], bankLabel = '') {
  return `
    <section class="workspace-grid">
      <article class="panel question-panel">
        <div class="question-meta">
          <span>${escapeHtml(bankLabel)}</span>
          <strong>第 ${session.currentIndex + 1} / ${session.order.length} 题</strong>
        </div>
        <h2 class="question-stem">${escapeHtml(question.stem)}</h2>
        ${renderQuestionMedia(question)}
        <div class="option-list">
          ${question.options.map((option) => `
            <label class="option-item">
              <input
                type="${question.type === 'single' ? 'radio' : 'checkbox'}"
                name="answer"
                value="${escapeHtml(option.key)}"
                ${selectedAnswer.includes(option.key) ? 'checked' : ''}
              />
              <span>${escapeHtml(option.key)}. ${renderOptionText(option)}</span>
            </label>
          `).join('')}
        </div>
        <div class="toolbar">
          <button class="secondary-btn" data-action="exam-prev" ${session.currentIndex === 0 ? 'disabled' : ''}>上一题</button>
          <button class="secondary-btn" data-action="exam-next" ${session.currentIndex === session.order.length - 1 ? 'disabled' : ''}>下一题</button>
          <button class="primary-btn" data-action="exam-submit">交卷</button>
        </div>
      </article>
      <aside class="panel navigator-panel exam-nav">
        <h3>考试进度</h3>
        <p>当前题库：${escapeHtml(bankLabel)}</p>
        <p>已作答 ${Object.keys(session.answers).length} / ${session.order.length} 题</p>
      </aside>
    </section>
  `;
}
