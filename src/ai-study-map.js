import { escapeHtml } from './learning-annotations.js?v=20261030-english-questions';
import { AI_BANKS,getAiStudyModules,filterAiStudyQuestions,getRelatedAiQuestions,aiStudyUrl,aiMapUrl } from './ai-study.js?v=20261030-english-questions';

const bilingual=value=>`<span lang="zh-CN">${escapeHtml(value.zh)}</span><span lang="en" class="ai-map-english">${escapeHtml(value.en)}</span>`;
const questionUrl=q=>q.type==='review'?`./ai-review.html#question-${q.id}`:aiStudyUrl(q.aiStudy.bankId,{moduleId:q.aiStudy.module,questionId:q.id});

export function renderAiModuleMap(questions,bankId,activeModule='all') {
  return getAiStudyModules(bankId).map(module=>{
    const group=questions.filter(q=>q.aiStudy?.bankId===bankId&&q.aiStudy.module===module.id);
    const scored=group.filter(q=>q.type!=='review').length;
    const illustrated=group.length-scored;
    return `<article class="ai-map-node${module.id===activeModule?' is-active':''}">
      <a href="${escapeHtml(aiMapUrl(bankId,module.id))}" data-map-module="${module.id}" ${module.id===activeModule?'aria-current="true"':''}><h2>${escapeHtml(module.label)}</h2><p>${escapeHtml(module.description)}</p></a>
      <p class="ai-map-count">${scored} 道计分题${illustrated?` · ${illustrated} 道图解题`:''}</p>
      <div class="ai-map-actions"><a href="${escapeHtml(aiStudyUrl(bankId,{moduleId:module.id}))}">学习 / Learn</a><a href="${escapeHtml(aiStudyUrl(bankId,{moduleId:module.id,mode:'practice'}))}">练习 / Practice</a></div>
    </article>`;
  }).join('');
}

export function renderAiMapQuestions(questions,{bankId,moduleId='all',query=''}={}) {
  const visible=filterAiStudyQuestions(questions,{bankId,moduleId,query});
  if(!visible.length)return '<p class="ai-map-empty">没有匹配的题目。尝试减少关键词或选择全部模块。<span lang="en">No matches. Try fewer keywords or all modules.</span></p>';
  return visible.map(q=>{
    const s=q.aiStudy;
    const related=getRelatedAiQuestions(q,questions);
    return `<article class="ai-map-question" id="question-${q.id}">
      <div class="ai-map-question-meta"><span>${escapeHtml(AI_BANKS[bankId].label)} · #${q.id} · ${q.type==='review'?'图解自评 / Illustrated review':'选择题 / Scored question'}</span><a href="${escapeHtml(questionUrl(q))}">打开此题 / Open question →</a></div>
      <h3 lang="en">${escapeHtml(q.stem)}</h3>
      <div class="ai-map-terms">${s.terms.map(t=>`<span>${escapeHtml(t.en)} · ${escapeHtml(t.zh)}</span>`).join('')}</div>
      <details><summary>展开知识卡片与推理流程 / Study card &amp; reasoning flow</summary>
        <h4>关键知识 / Key facts</h4><p>${bilingual(s.summary)}</p>
        <h4>推理流程 / Reasoning flow</h4><ol class="ai-map-flow">${s.steps.map(step=>`<li>${bilingual(step)}</li>`).join('')}</ol>
        <div class="ai-map-contrast"><section><h4>记忆提示 / Memory cue</h4><p>${bilingual(s.memory)}</p></section><section><h4>易混点与边界 / Pitfall &amp; scope</h4><p>${bilingual(s.pitfall)}</p></section></div>
        <p>逐选项中英文解析见“打开此题”。 / Open the question for every option's bilingual explanation.</p>
        <ul class="ai-map-references">${s.sources.map(ref=>`<li><a href="${escapeHtml(ref.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(ref.title)}</a></li>`).join('')}</ul>
      </details>
      <nav class="ai-map-related" aria-label="第 ${q.id} 题的相关题"><strong>相关题 / Related:</strong>${related.map(other=>`<a href="${escapeHtml(questionUrl(other))}" title="${escapeHtml(other.stem)}">#${other.id}${other.type==='review'?' 图解':''}</a>`).join('')}</nav>
    </article>`;
  }).join('');
}
