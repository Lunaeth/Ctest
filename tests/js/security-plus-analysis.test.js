import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  decorateSecurityPlusQuestion,
  decorateSecurityPlusQuestions,
} from '../../src/security-plus-analysis.js';

const bankPath = new URL('../../data/questions.security-plus.json', import.meta.url);

function loadBank() {
  return JSON.parse(fs.readFileSync(bankPath, 'utf8'));
}

test('Security+ threat-actor options use Core-style bilingual concept contrasts', () => {
  const question = decorateSecurityPlusQuestion(loadBank().find((item) => item.id === 1));
  const explanations = Object.fromEntries(
    question.learning.options.map((item) => [item.key, item.explanation]),
  );

  assert.match(explanations.A, /Hacktivist（黑客行动主义者）/);
  assert.match(explanations.A, /政治、社会议题|意识形态/);
  assert.match(explanations.B, /Whistleblower（举报人）/);
  assert.match(explanations.B, /内部.*披露/);
  assert.match(explanations.C, /Organized crime（有组织犯罪）/);
  assert.match(explanations.C, /资金、专业分工和犯罪网络/);
  assert.match(explanations.D, /Unskilled attacker（低技能攻击者）/);
  assert.match(explanations.D, /现成工具或脚本/);
  assert.ok(Object.values(explanations).every((text) => (
    text.includes('foreign government + critical systems')
  )));
});

test('Security+ cryptography options explain distinct uses instead of vote rank', () => {
  const question = decorateSecurityPlusQuestion(loadBank().find((item) => item.id === 2));
  const explanations = Object.fromEntries(
    question.learning.options.map((item) => [item.key, item.explanation]),
  );

  assert.match(explanations.A, /反复执行哈希|KDF/);
  assert.match(explanations.A, /Discussion contrast（讨论对照）/);
  assert.match(explanations.A, /支持正确答案的讨论/);
  assert.match(explanations.B, /隐藏展示中的部分敏感字段/);
  assert.doesNotMatch(explanations.B, /Discussion contrast（讨论对照）/);
  assert.match(explanations.C, /隐藏在图片、音频/);
  assert.match(explanations.D, /哈希前加入随机且唯一的数据/);
  assert.match(explanations.D, /Discussion evidence（讨论依据）/);
  assert.ok(Object.values(explanations).every((text) => !text.includes('不是社区最高票答案')));
});

test('every Security+ option receives substantive Chinese-English analysis', () => {
  const questions = decorateSecurityPlusQuestions(loadBank());

  for (const question of questions) {
    const answerSet = new Set(question.answer);
    assert.equal(question.learning.options.length, question.options.length);
    assert.equal(question.analysis.whyNotChoose.length, question.options.length - question.answer.length);
    assert.equal(question.analysis.outline.length, 3);

    for (const explanation of question.learning.options) {
      const option = question.options.find((item) => item.key === explanation.key);
      assert.ok(option, `Question ${question.id} option ${explanation.key} must exist`);
      assert.equal(explanation.isCorrect, answerSet.has(explanation.key));
      assert.ok(explanation.explanation.length >= 90, `Question ${question.id}${explanation.key} is too short`);
      assert.match(explanation.explanation, /[\u3400-\u9fff]/, `Question ${question.id}${explanation.key} needs Chinese analysis`);
      assert.ok(
        explanation.explanation.includes(option.text),
        `Question ${question.id}${explanation.key} must retain the English option term`,
      );
      assert.doesNotMatch(explanation.explanation, /不是社区最高票答案|本题讨论的主要依据指向/);
    }
  }
});
