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

test('DCAI terminology and scope corrections retain source wording and reach every question view',()=>{
  const questions=JSON.parse(fs.readFileSync('data/questions.ccnp-dcai.json','utf8'));
  const ipv4=questions.find(q=>q.id===4);
  assert.match(ipv4.stem,/IPv4/);
  assert.match(ipv4.options.find(o=>o.key==='D').originalText,/InfiniBand sequence numbering/);
  assert.doesNotMatch(ipv4.options.find(o=>o.key==='D').text,/break.*sequence/);
  assert.match(questions.find(q=>q.id===5).stem,/Data Center Quantized Congestion Notification \(DCQCN\)/);
  assert.match(questions.find(q=>q.id===10).stem,/C225 M8 EBox/);
  assert.match(questions.find(q=>q.id===16).stem,/RoCEv2 storage-data QoS class/);
  for(const id of [4,5,10,16,18,21,22,25,26,27,30,31,32,33]){
    const q=questions.find(q=>q.id===id);
    assert.ok(q.originalStem && q.originalStem!==q.stem);
    assert.equal(q.originalType,id===27||id===33?'multiple':'single');
    const session=createPracticeSession([q]);
    for(const html of [renderPracticeView(q,session,null),renderExamView(q,session),renderLearningView(q,0,1,'DCAI')]){
      assert.ok(text(html).includes(q.stem));
      assert.ok(!text(html).includes(q.originalStem));
    }
  }
});

test('DCAI hardware and terminology errata preserve source options and use precise revised terms',()=>{
  const questions=JSON.parse(fs.readFileSync('data/questions.ccnp-dcai.json','utf8'));
  for(const [id,key,expected] of [
    [21,'C',/RoCEv2/], [22,'A',/nccl-tests/], [27,'D',/GPU Temperature/],
    [28,'C',/port 1\/11/], [33,'C',/all compute-node and PCIe-node pairs/],
    [33,'D',/PCI Gen5/], [35,'D',/retraining/],
  ]){
    const q=questions.find(q=>q.id===id);
    const option=q.options.find(o=>o.key===key);
    assert.ok(option.originalText && option.originalText!==option.text,`${id}${key}: source preserved`);
    assert.match(option.text,expected);
    const session=createPracticeSession([q]);
    for(const html of [renderPracticeView(q,session,null),renderExamView(q,session),renderLearningView(q,0,1,'DCAI')]){
      assert.ok(text(html).includes(option.text));
      if(!option.text.includes(option.originalText)) assert.ok(!text(html).includes(option.originalText));
    }
  }
});
