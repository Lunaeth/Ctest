import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const bankPath = new URL('../../data/questions.security-plus.json', import.meta.url);

test('Security+ SY0-701 bank is valid quiz-service JSON', () => {
  const questions = JSON.parse(fs.readFileSync(bankPath, 'utf8'));

  assert.equal(questions.length, 606);
  assert.equal(new Set(questions.map((question) => question.id)).size, questions.length);

  for (const question of questions) {
    const optionKeys = question.options.map((option) => option.key);
    assert.ok(question.stem.length > 0, `Question ${question.id} must have a stem`);
    assert.ok(optionKeys.length >= 2, `Question ${question.id} must have options`);
    assert.ok(question.answer.length >= 1, `Question ${question.id} must have an answer`);
    assert.ok(
      question.answer.every((key) => optionKeys.includes(key)),
      `Question ${question.id} answer must reference a valid option`,
    );
    assert.equal(question.type, question.answer.length === 1 ? 'single' : 'multiple');
    assert.ok(question.learning?.options?.length === question.options.length);
    assert.ok(question.analysis?.whyChoose);
    assert.deepEqual(
      Object.keys(question.discussion?.optionEvidence ?? {}),
      optionKeys,
      `Question ${question.id} must retain discussion evidence by option`,
    );
  }
});

test('Security+ bank uses community votes while retaining original answers and discussion', () => {
  const questions = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  const conflicts = questions.filter((question) => (
    question.answer.join('') !== question.officialAnswer.join('')
  ));
  const discussed = questions.filter((question) => question.discussion?.summary);

  assert.equal(conflicts.length, 3);
  assert.equal(discussed.length, 605);
  assert.ok(questions.every((question) => (
    ['community-vote', 'most-voted-marker'].includes(question.answerSource)
  )));
});

test('Security+ image-only multiple-choice options are restored', () => {
  const questions = JSON.parse(fs.readFileSync(bankPath, 'utf8'));
  const inputSanitization = questions.find((question) => question.id === 216);
  const firewallRules = questions.find((question) => question.id === 321);

  assert.equal(inputSanitization.options[0].text, '<script>alert("Warning!");</script>');
  assert.match(firewallRules.options[2].text, /10\.2\.2\.7\/32/);
  assert.deepEqual(firewallRules.answer, ['C']);
});
