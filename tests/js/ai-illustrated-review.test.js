import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { renderReviewQuestions } from '../../src/ai-review.js';

const questions = JSON.parse(fs.readFileSync('data/questions.ccnp-dcai.review.json', 'utf8'));
const visible = (html) => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&#39;', "'").replaceAll('&quot;', '"');

test('all four illustrated questions have bilingual candidates, matches and individual reasons', () => {
  assert.deepEqual(questions.map(q => q.id), [3, 11, 29, 36]);
  for (const q of questions) {
    assert.equal(q.type, 'review');
    assert.equal(q.answer, undefined, 'review items must not become scored multiple choice questions');
    assert.ok(q.originalExplanation);
    assert.equal(q.originalAnswerSource, 'provided-pdf');
    const s = q.aiStudy;
    const pairs = [s.summary, s.pitfall, s.memory, ...s.terms, ...s.steps,
      ...Object.values(s.options), ...Object.values(s.options).map(o => o.reason), ...s.matches.map(m => m.prompt)];
    for (const pair of pairs) {
      assert.match(pair.zh, /[\u3400-\u9fff]/u);
      assert.ok(pair.en.trim());
    }
    assert.equal(new Set(Object.values(s.options).map(o => o.reason.en)).size, Object.keys(s.options).length);
    for (const m of s.matches) assert.ok(s.options[m.answerKey]);
    assert.ok(s.sources.every(ref => ref.title && ref.supports && new URL(ref.url).protocol === 'https:'));
  }
});

test('illustrated answers, reasons and references stay inside a closed disclosure', () => {
  for (const q of questions) {
    const html = renderReviewQuestions([q]);
    const [promptHtml, answerHtml] = html.split('<details>');
    assert.ok(answerHtml && !html.includes('<details open'));
    assert.ok(visible(promptHtml).includes(q.stem));
    assert.ok(!visible(promptHtml).includes(q.aiStudy.stemZh));
    for (const option of Object.values(q.aiStudy.options)) {
      assert.ok(visible(promptHtml).includes(option.en));
      assert.equal(visible(promptHtml).includes(option.zh), false);
      for (const reason of [option.reason.en, option.reason.zh]) {
        assert.ok(!visible(promptHtml).includes(reason));
        assert.ok(visible(answerHtml).includes(reason));
      }
    }
    for (const src of q.answerImages) {
      assert.ok(!promptHtml.includes(src));
      assert.ok(answerHtml.includes(src));
    }
    for (const ref of q.aiStudy.sources) {
      assert.ok(!promptHtml.includes(ref.url));
      assert.ok(answerHtml.includes(ref.url));
    }
    for (const pair of [q.aiStudy.memory, q.aiStudy.pitfall, ...q.aiStudy.steps, ...q.aiStudy.terms]) {
      assert.ok(visible(answerHtml).includes(pair.en));
      assert.ok(visible(answerHtml).includes(pair.zh));
    }
  }
});

test('review renderer escapes bilingual labels, prompts and explanations', () => {
  const q = structuredClone(questions[0]);
  q.aiStudy.options.A.en = '<img src=x onerror=bad>English';
  q.aiStudy.options.A.reason.en = '<script>bad</script>';
  q.aiStudy.matches[0].prompt.en = '<iframe>bad</iframe>';
  const html = renderReviewQuestions([q]);
  assert.ok(html.includes('&lt;img src=x onerror=bad&gt;'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;iframe&gt;'));
  assert.doesNotMatch(html, /<script>|<iframe>|<img src=x/);
});

test('DLB and congestion clarifications preserve original stems and explain alternatives', () => {
  for (const id of [3, 36]) {
    const q = questions.find(q => q.id === id);
    assert.ok(q.originalStem && q.originalStem !== q.stem);
    assert.equal(q.originalType, 'review');
  }
  const q = questions.find(q => q.id === 36);
  assert.deepEqual(q.aiStudy.matches.map(m => m.answerKey), ['A', 'C']);
  assert.match(q.aiStudy.options.D.reason.en, /ECN/);
  assert.match(q.aiStudy.pitfall.en, /not inherently incompatible/);
});
