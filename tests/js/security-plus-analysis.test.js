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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
  let discussionNotes = 0;
  let relatedNotes = 0;

  for (const question of questions) {
    const answerSet = new Set(question.answer);
    assert.ok(
      question.options.every((option) => !/Most Voted/i.test(option.text)),
      `Question ${question.id} options must not retain vote-marker text`,
    );
    assert.equal(question.learning.options.length, question.options.length);
    assert.equal(question.analysis.whyNotChoose.length, question.options.length - question.answer.length);
    assert.equal(question.analysis.outline.length, 3);
    assert.doesNotMatch(question.analysis.outline.join(' '), /安全概念辨析/);
    assert.match(question.learning.keyPointHtml, /关键点：本题不是只认/);
    assert.match(question.learning.keyPointHtml, /这条限制/);
    assert.doesNotMatch(question.learning.keyPointHtml, /最高票|Most Voted|community consensus/);
    assert.match(question.learning.speedTipHtml, /速通：看到/);
    assert.match(question.learning.speedTipHtml, /[A-H] 偏向/);
    assert.match(question.learning.studyNotesHtml.join(' '), /概念定位 Concept/);
    assert.match(question.learning.studyNotesHtml.join(' '), /易混对比 Compare/);
    assert.doesNotMatch(question.learning.studyNotesHtml.join(' '), /社区投票：/);
    if (question.learning.studyNotesHtml.some((note) => note.includes('讨论校验 Discussion'))) {
      discussionNotes += 1;
    }
    if (question.learning.studyNotesHtml.some((note) => note.includes('题库关联 Related questions'))) {
      relatedNotes += 1;
    }
    for (const answerKey of question.answer) {
      const correctOption = question.options.find((option) => option.key === answerKey);
      const escapedCorrectText = escapeHtml(correctOption.text);
      assert.ok(
        question.learning.keyPointHtml.includes(escapedCorrectText),
        `Question ${question.id} key point must explain correct option ${answerKey}`,
      );
      assert.ok(
        question.learning.studyNotesHtml.join(' ').includes(escapedCorrectText),
        `Question ${question.id} concept note must retain correct option ${answerKey}`,
      );
    }

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
      if (!explanation.isCorrect) {
        const optionEvidence = question.discussion?.optionAnalysisEvidence?.[explanation.key] ?? [];
        if (optionEvidence.length) {
          assert.match(
            explanation.explanation,
            /Discussion contrast（讨论对照）/,
            `Question ${question.id}${explanation.key} should retain a discussion-backed contrast`,
          );
        } else {
          assert.doesNotMatch(
            explanation.explanation,
            /Discussion (?:evidence|contrast)/,
            `Question ${question.id}${explanation.key} must not borrow unrelated discussion evidence`,
          );
        }
      }
    }
  }

  assert.ok(discussionNotes >= 600, 'Most questions should retain consensus discussion analysis');
  assert.equal(relatedNotes, questions.length, 'Every question should link to a related bank-backed concept');
});

test('Security+ special cases use question-specific learning logic', () => {
  const questions = decorateSecurityPlusQuestions(loadBank());
  const zeroTrust = questions.find((question) => question.id === 18);
  const compliance = questions.find((question) => question.id === 45);
  const mediaReuse = questions.find((question) => question.id === 299);
  const plain = (question) => question.learning.studyNotesHtml.join(' ').replace(/<[^>]+>/g, '');

  assert.match(zeroTrust.learning.keyPointHtml, /data plane/);
  assert.match(zeroTrust.learning.keyPointHtml, /Subject role/);
  assert.match(plain(compliance), /Audit findings（审计发现）/);
  assert.match(plain(mediaReuse), /Sanitization（介质净化）/);
  assert.match(plain(mediaReuse), /Formatting（格式化）/);
  assert.match(plain(mediaReuse), /Degaussing（消磁）/);
  assert.doesNotMatch(plain(mediaReuse), /输入验证／净化/);
});
