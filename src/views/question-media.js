import { escapeHtml } from '../learning-annotations.js';

export const AI_REVIEW_ENTRIES = [{
  href: './ai-review.html', title: 'CCNP-DCAI 图示配对题',
  summary: '4 道原题与答案图 · 自评复习，不计入选择题分数',
}];

export function renderQuestionMedia(question) {
  const source = question.source
    ? `<p class="question-source">PDF 原题 ${escapeHtml(question.id)} · 第 ${escapeHtml(question.source.page)} 页 · 答案来自所提供的 PDF</p>`
    : '';
  return source + (question.images ?? []).map((src, index) => `
    <figure><img src="${escapeHtml(src)}" alt="原题 ${escapeHtml(question.id)} 图示 ${index + 1}"
      style="max-width:100%;height:auto;background:white" loading="lazy"></figure>
  `).join('');
}
