import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AI_BANKS,getAiStudyModules,buildAiModuleStats,filterAiStudyQuestions,getRelatedAiQuestions,readAiStudyRequest,resolveAiStudyRequest,aiStudyUrl} from '../../src/ai-study.js';
import {renderAiMapQuestions,renderAiModuleMap} from '../../src/ai-study-map.js';
import {renderPracticeView,buildPracticeExamDecision,buildPracticeMistakeReason} from '../../src/views/practice-view.js';
import {renderHomeView} from '../../src/views/home-view.js';
import {renderLearningView} from '../../src/views/learning-view.js';
import {renderMistakesView} from '../../src/views/mistakes-view.js';
import {renderResultsView} from '../../src/views/results-view.js';
import {createPracticeSession} from '../../src/practice.js';

const banks=Object.fromEntries(Object.entries(AI_BANKS).map(([id,config])=>[id,
  [config.file,...(config.reviewFile?[config.reviewFile]:[])].flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')))]));
const plain=html=>html.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');

test('AI topic groups cover every scored and illustrated question exactly once with usable per-bank counts',()=>{
  for(const [bankId,questions] of Object.entries(banks)) {
    const modules=getAiStudyModules(bankId);
    assert.equal(modules.length,bankId==='ccnpDcai'?8:10);
    const ids=new Set(modules.map(m=>m.id));
    for(const q of questions)assert.ok(ids.has(q.aiStudy.module),`${bankId} ${q.id}`);
    const stats=buildAiModuleStats(Object.values(banks).flat(),bankId);
    assert.equal(stats[0].count,bankId==='ccnpDcai'?56:116);
    assert.equal(stats.slice(1).reduce((sum,m)=>sum+m.count,0),stats[0].count);
    assert.ok(stats.every(m=>m.count>0&&/[\u3400-\u9fff]/u.test(m.label)&&/[A-Za-z]/.test(m.label)));
    for(const q of questions.filter(q=>q.type!=='review'))assert.deepEqual(q.learning.studyTags,[q.aiStudy.module]);
  }
});

test('search combines English/Chinese terms, preserves bank/module boundaries and excludes superseded source text',()=>{
  const all=Object.values(banks).flat();
  const found=filterAiStudyQuestions(all,{bankId:'ccnpDcai',query:'  RoCEv2  优先级  '});
  assert.ok(found.some(q=>q.id===54));
  assert.ok(found.every(q=>q.aiStudy.bankId==='ccnpDcai'));
  const mem=filterAiStudyQuestions(all,{bankId:'ncaAiio',moduleId:'accelerated-compute',query:'GPU'});
  assert.ok(mem.length>0);assert.ok(mem.every(q=>q.aiStudy.module==='accelerated-compute'));
  assert.deepEqual(filterAiStudyQuestions(all,{bankId:'ccnpDcai',query:'this-phrase-is-not-a-question'}),[]);
  const q=structuredClone(banks.ccnpDcai[0]);q.originalStem='SUPERSEDED_SENTINEL';q.originalExplanation='SUPERSEDED_SENTINEL';
  assert.deepEqual(filterAiStudyQuestions([q],{bankId:'ccnpDcai',query:'SUPERSEDED_SENTINEL'}),[]);
});

test('related questions use actual shared concepts or modules and never cross bank IDs',()=>{
  const all=Object.values(banks).flat();
  for(const q of all) {
    const related=getRelatedAiQuestions(q,all);
    assert.ok(related.length>0&&related.length<=4);
    for(const other of related) {
      assert.notEqual(other.id,q.id);assert.equal(other.aiStudy.bankId,q.aiStudy.bankId);
      const terms=new Set(q.aiStudy.terms.map(t=>t.en.toLowerCase()));
      assert.ok(other.aiStudy.module===q.aiStudy.module||other.aiStudy.terms.some(t=>terms.has(t.en.toLowerCase())));
    }
  }
});

test('every knowledge card has bilingual reasoning, memory, scope, references and valid app/review links',()=>{
  for(const [bankId,questions] of Object.entries(banks)) {
    const html=renderAiMapQuestions(questions,{bankId});const text=plain(html);
    assert.equal((html.match(/<details>/g)??[]).length,questions.length);
    assert.doesNotMatch(html,/<details open/);
    for(const q of questions) {
      assert.ok(html.includes(`id="question-${q.id}"`));
      for(const pair of [q.aiStudy.summary,q.aiStudy.memory,q.aiStudy.pitfall,...q.aiStudy.steps,...q.aiStudy.terms]) {
        assert.ok(text.includes(pair.en));assert.ok(text.includes(pair.zh));
      }
      for(const ref of q.aiStudy.sources)assert.ok(html.includes(ref.url));
    }
    for(const match of html.matchAll(/href="([^"]+)"/g)) {
      const href=match[1].replaceAll('&amp;','&');
      if(href.startsWith('./index.html')) {
        const request=readAiStudyRequest(new URL(href,'https://study.test').search);
        assert.equal(request.bankId,bankId);assert.ok(resolveAiStudyRequest(request,questions));
      } else if(href.startsWith('./ai-review.html')) {
        assert.equal(bankId,'ccnpDcai');assert.match(href,/#question-(3|11|29|36)$/);
      } else assert.ok(new URL(href).protocol==='https:');
    }
    const nodes=renderAiModuleMap(questions,bankId);
    for(const module of getAiStudyModules(bankId))assert.ok(nodes.includes(module.id));
  }
});

test('deep links reject unknown banks/modules, out-of-scope IDs and illustrated practice targets',()=>{
  for(const search of ['?studyBank=__proto__','?studyBank=core2','?studyBank=ncaAiio&studyModule=security','?studyBank=ncaAiio&studyMode=exam','?studyBank=ncaAiio&studyQuestion=-1','?studyBank=ncaAiio&studyQuestion=1.5'])assert.equal(readAiStudyRequest(search),null);
  for(const [bankId,questions] of Object.entries(banks))for(const q of questions) {
    const request=readAiStudyRequest(new URL(aiStudyUrl(bankId,{moduleId:q.aiStudy.module,questionId:q.id}),'https://study.test').search);
    const resolved=resolveAiStudyRequest(request,questions);
    if(q.type==='review')assert.equal(resolved,null);
    else assert.equal(resolved.questions[resolved.index].id,q.id);
  }
  assert.equal(resolveAiStudyRequest({bankId:'ccnpDcai',moduleId:'power-cooling',questionId:4},banks.ccnpDcai),null);
});

test('AI feedback uses question-specific bilingual reasoning and never Core 2 symptom matches',()=>{
  for(const questions of Object.values(banks))for(const q of questions.filter(q=>q.type!=='review')) {
    const wrong=q.options.find(o=>!q.answer.includes(o.key));
    const selected=wrong?[wrong.key]:[];
    const feedback={correct:false,correctAnswer:q.answer,selectedAnswer:selected};
    const decision=buildPracticeExamDecision(q,feedback),reason=buildPracticeMistakeReason(q,feedback);
    assert.ok(decision.text.includes(q.aiStudy.summary.en));assert.ok(reason.details.includes(q.aiStudy.pitfall.zh));
    if(wrong)assert.ok(decision.text.includes(q.aiStudy.options[wrong.key].reason.en));
    const session=createPracticeSession([q]);
    const reviewed=renderPracticeView(q,session,feedback);
    assert.match(reviewed,/data-action="start-practice-module"/);
    assert.match(reviewed,/ai-map.html/);assert.doesNotMatch(reviewed,/core2-visual|practice-symptom-guide|practice-confusion-guide/);
    const hidden=renderPracticeView(q,session,null);
    assert.doesNotMatch(hidden,/ai-map.html|practice-module-guide|AI 复习入口/);
  }
});

test('both banks expose maps on home and learning and targeted review links in mistakes/results',()=>{
  for(const [bankId,questions] of Object.entries(banks)) {
    const q=questions.find(q=>q.type!=='review');
    const home=renderHomeView({stats:{},banks:[],activeBankId:bankId});
    const learning=renderLearningView(q,0,1,'AI',{activeBankId:bankId});
    for(const html of [home,learning,renderMistakesView([q]),renderResultsView({total:1,score:0,wrongIds:[q.id]},new Map([[q.id,q]]))]) {
      assert.match(html,new RegExp(`ai-map.html\\?bank=${bankId}`));
      assert.doesNotMatch(html,/core2-visual.html|network-map.html/);
    }
  }
});

test('map content and links escape imported text',()=>{
  const q=structuredClone(banks.ccnpDcai[0]);q.stem='<img src=x onerror=bad>';q.aiStudy.stemZh='<script>中文</script>';
  q.aiStudy.summary.en='<svg onload=bad>';q.aiStudy.terms[0].en='" onmouseover="bad';
  const html=renderAiMapQuestions([q],{bankId:'ccnpDcai'});
  assert.doesNotMatch(html,/<script>|<img|<svg/);assert.match(html,/&lt;script&gt;/);
});
