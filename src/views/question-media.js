import { escapeHtml } from '../learning-annotations.js?v=20261031-sidebar-account';

export const AI_REVIEW_ENTRIES = [{
  href: './ai-review.html', title: 'CCNP-DCAI 图示配对题',
  summary: '4 道原题与答案图 · 自评复习，不计入选择题分数',
}];

export function renderOptionText(option) {
  return escapeHtml(option.text);
}

export function renderQuestionMedia(question) {
  const source = question.source?.page && !['ccnpDcai', 'ncaAiio'].includes(question.aiStudy?.bankId)
    ? `<p class="question-source">PDF 原题 ${escapeHtml(question.id)} · 第 ${escapeHtml(question.source.page)} 页 · ${question.aiStudy ? '解析已依据技术资料核对，参考资料见解析区' : '答案来自所提供的 PDF'}</p>`
    : '';
  return source + (question.images ?? []).map((src, index) => `
    <figure><img src="${escapeHtml(src)}" alt="原题 ${escapeHtml(question.id)} 图示 ${index + 1}"
      style="max-width:100%;height:auto;background:white" loading="lazy"></figure>
  `).join('');
}
