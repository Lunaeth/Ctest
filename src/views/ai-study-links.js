import { escapeHtml } from '../learning-annotations.js?v=20261031-ai-accounts';
import { aiMapUrl,aiStudyUrl,getAiStudyModule } from '../ai-study.js?v=20261031-ai-accounts';

export function renderAiStudyLinks(question) {
  const study=question?.aiStudy;
  const module=getAiStudyModule(question);
  if(!module)return '';
  return `<section class="ai-study-links" aria-label="AI 复习入口">
    <strong>术语与延伸复习 / Terms &amp; related study</strong>
    <dl>${study.terms.map(term=>`<div><dt lang="en">${escapeHtml(term.en)}</dt><dd lang="zh-CN">${escapeHtml(term.zh)}</dd></div>`).join('')}</dl>
    <div class="toolbar"><a href="${escapeHtml(aiMapUrl(study.bankId,module.id,question.id))}">知识图谱与相关题 / Map &amp; related questions</a>
    <a href="${escapeHtml(aiStudyUrl(study.bankId,{moduleId:module.id,mode:'practice'}))}">练习本模块 / Practice this module</a></div>
  </section>`;
}
