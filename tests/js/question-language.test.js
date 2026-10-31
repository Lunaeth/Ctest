import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createPracticeSession } from '../../src/practice.js';
import { renderPracticeView } from '../../src/views/practice-view.js';
import { renderExamView } from '../../src/views/exam-view.js';
import { renderLearningView } from '../../src/views/learning-view.js';
import { renderMistakesView } from '../../src/views/mistakes-view.js';
import { renderOptionText, renderQuestionMedia } from '../../src/views/question-media.js';
import { renderAiMapQuestions } from '../../src/ai-study-map.js';
import { renderReviewQuestions } from '../../src/ai-review.js';

const read = name => JSON.parse(fs.readFileSync(`data/questions.${name}.json`, 'utf8'));
const plain = html => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const han = /[\u3400-\u9fff]/u;

for (const [bank, count] of [['aws-saa',143], ['ccnp-dcai',56], ['nca-aiio',116]]) {
  test(`${bank}: every scored question and choice is English in study, practice, exams and mistakes`, () => {
    const questions = read(bank);
    assert.equal(questions.length, count);
    for (const q of questions) {
      assert.doesNotMatch(q.stem, han, `${bank} ${q.id}: stem`);
      if (q.learning) assert.doesNotMatch(plain(q.learning.stemHtml), han);
      for (const o of q.options) {
        assert.doesNotMatch(o.text, han, `${bank} ${q.id}${o.key}: choice`);
        assert.equal(plain(renderOptionText(o)), o.text);
      }
      const session = createPracticeSession([q]);
      const views = [renderLearningView(q,0,1,bank), renderPracticeView(q,session,null),
        renderExamView(q,session), renderMistakesView([q],bank)];
      for (const html of views) {
        assert.ok(plain(html).includes(q.stem));
        assert.doesNotMatch(html, /question-translation|option-translation/);
        for (const o of q.options) assert.ok(plain(html).includes(o.text));
        for (const stem of html.matchAll(/<(?:h2|h3) class="(?:question-stem[^"]*|mistake-card__stem)">([\s\S]*?)<\/(?:h2|h3)>/g)) {
          assert.doesNotMatch(plain(stem[1]), han);
        }
      }
    }
  });
}

test('all AI map headings, illustrated stems, matching prompts and candidates are English', () => {
  for (const [bank,bankId] of [['ccnp-dcai','ccnpDcai'],['nca-aiio','ncaAiio']]) {
    const questions = [...read(bank), ...read(`${bank}.review`)];
    const html = renderAiMapQuestions(questions,{bankId});
    const headings = [...html.matchAll(/<h3 lang="en">([\s\S]*?)<\/h3>/g)];
    assert.equal(headings.length, questions.length);
    for (const heading of headings) assert.doesNotMatch(plain(heading[1]), han);
    for (const q of questions.filter(q => q.type === 'review')) {
      assert.doesNotMatch(q.stem, han);
      const html = renderReviewQuestions([q]);
      const prompt = plain(html.split('<details>')[0]);
      for (const o of Object.values(q.aiStudy.options)) {
        assert.doesNotMatch(o.en, han); assert.ok(prompt.includes(o.en));
      }
      for (const m of q.aiStudy.matches) {
        assert.doesNotMatch(m.prompt.en, han); assert.ok(prompt.includes(m.prompt.en));
        assert.ok(!prompt.includes(m.prompt.zh));
      }
    }
  }
});

test('AWS wording matches translation source and keeps source gaps explicit', () => {
  const rows = fs.readdirSync('scripts/aws-saa-english').filter(n=>n.endsWith('.json')).sort()
    .flatMap(name=>JSON.parse(fs.readFileSync(`scripts/aws-saa-english/${name}`,'utf8')));
  const questions = read('aws-saa');
  assert.deepEqual(questions.map(q=>[q.id,q.stem,...q.options.map(o=>o.text)]),rows);
  for (const [id,key] of [[42,'A'],[45,'C'],[121,'B']]) {
    assert.match(questions.find(q=>q.id===id).options.find(o=>o.key===key).text,/\[.*(?:missing|truncated).*\]/);
  }
  assert.equal(renderQuestionMedia(questions[0]), '', 'Screenshot imports must not claim an undefined PDF page');
});
