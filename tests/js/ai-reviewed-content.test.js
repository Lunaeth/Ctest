import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createPracticeSession } from '../../src/practice.js';
import { renderPracticeView } from '../../src/views/practice-view.js';
import { renderExamView } from '../../src/views/exam-view.js';
import { renderLearningView } from '../../src/views/learning-view.js';
import { renderMistakesView } from '../../src/views/mistakes-view.js';
import { renderResultsView } from '../../src/views/results-view.js';
import { renderOptionText } from '../../src/views/question-media.js';
const banks=['ccnp-dcai','nca-aiio'].flatMap(bank=>JSON.parse(fs.readFileSync(`data/questions.${bank}.json`,'utf8')));
const reviewed=banks.filter(q=>q.aiStudy);
const text=html=>html.replace(/<[^>]*>/g,'').replaceAll('&amp;','&').replaceAll('&#39;',"'").replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
test('every currently reviewed question has individual bilingual options and technical references (partial audit)',()=>{
  assert.ok(reviewed.length>=3);
  for(const q of reviewed){
    assert.ok(q.originalExplanation && q.originalAnswer && q.originalAnswerSource);
    assert.ok(q.aiStudy.sources.every(ref=>ref.title&&ref.supports&&new URL(ref.url).protocol==='https:'));
    assert.ok(q.aiStudy.reviewNote);
    assert.equal(new Set(q.learning.options.map(o=>o.explanation)).size,q.options.length);
    for(const option of q.options){
      const detail=q.aiStudy.options[option.key];
      assert.match(detail.zh,/[\u3400-\u9fff]/u);assert.match(detail.reason.zh,/[\u3400-\u9fff]/u);
      assert.ok(detail.reason.en.length>35);
      assert.doesNotMatch(detail.reason.zh,/PDF 标注|具体理由见|暂无解释/);
      assert.equal(q.learning.options.find(o=>o.key===option.key).isCorrect,q.answer.includes(option.key));
    }
  }
});
test('bilingual options and references appear across learning, feedback, mistakes and exam results',()=>{
  for(const q of reviewed){
    const session=createPracticeSession([q]);
    const feedback={correct:false,correctAnswer:q.answer,selectedAnswer:[]};
    const views=[renderLearningView(q,0,1,'AI'),renderPracticeView(q,session,feedback),renderMistakesView([q],'AI'),
      renderResultsView({score:0,total:1,durationSeconds:1,wrongIds:[q.id]},new Map([[q.id,q]]),'AI')];
    for(const html of views){
      const visible=text(html);
      assert.ok(visible.includes(q.aiStudy.stemZh));
      for(const option of q.options){
        const detail=q.aiStudy.options[option.key];
        assert.ok(visible.includes(detail.zh),`${q.id}${option.key}: translation`);
        assert.ok(visible.includes(detail.reason.zh),`${q.id}${option.key}: Chinese explanation`);
        assert.ok(visible.includes(detail.reason.en),`${q.id}${option.key}: English explanation`);
      }
      for(const ref of q.aiStudy.sources)assert.ok(html.includes(ref.url));
    }
  }
});
test('unanswered practice and exams include translations but no explanations or reference hints',()=>{
  for(const q of reviewed){
    const session=createPracticeSession([q]);
    for(const html of [renderPracticeView(q,session,null),renderExamView(q,session)]){
      const visible=text(html);assert.ok(visible.includes(q.aiStudy.stemZh));
      for(const option of q.options){assert.ok(visible.includes(option.translationZh));assert.ok(!visible.includes(q.aiStudy.options[option.key].reason.en));}
      for(const ref of q.aiStudy.sources)assert.ok(!html.includes(ref.url));
      assert.doesNotMatch(html,/is-correct|正确答案：/);
    }
  }
});
test('option translations are escaped as plain text',()=>{
  const html=renderOptionText({text:'<script>bad</script>',translationZh:'<img onerror="bad">中文'});
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;img'));
  assert.doesNotMatch(html,/<script>|<img/);
});

test('AIIO GPUDirect erratum preserves the source option and renders its corrected text',()=>{
  const questions=JSON.parse(fs.readFileSync('data/questions.nca-aiio.json','utf8'));
  const q=questions.find(q=>q.id===69);
  const option=q.options.find(o=>o.key==='A');
  assert.equal(option.originalText,'It uses ROMA to eliminate CPU bottlenecks.');
  assert.equal(option.text,'It uses RDMA to reduce CPU data-copy bottlenecks.');
  assert.equal(q.originalAnswer.join(','),'A');
  const session=createPracticeSession([q]);
  for(const html of [renderLearningView(q,0,1,'AI'),renderPracticeView(q,session,null),renderExamView(q,session)]){
    assert.ok(text(html).includes(option.text));
    assert.ok(!text(html).includes(option.originalText));
  }
});
