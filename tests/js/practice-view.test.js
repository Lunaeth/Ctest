import test from 'node:test';
import assert from 'node:assert/strict';
import { CORE2_HIGH_FREQUENCY_MODULES } from '../../src/core2-study-map.js';
import {
  buildPracticeExamDecision,
  buildPracticeMistakeReason,
  getPracticeAnswerPrompt,
  renderPracticeView,
  selectPracticeModuleFlow,
} from '../../src/views/practice-view.js';

function getCore2Module(id) {
  return CORE2_HIGH_FREQUENCY_MODULES.find((module) => module.id === id);
}

test('selectPracticeModuleFlow prioritizes the Core 2 flow line that matches the current question', () => {
  const apps = getCore2Module('app-troubleshooting');
  const remote = getCore2Module('remote-network');

  assert.deepEqual(
    selectPracticeModuleFlow({
      stem: 'A user reports a BSOD twice a day.',
      options: [
        { key: 'A', text: 'Event Viewer' },
        { key: 'B', text: 'Device Manager' },
      ],
      answer: ['A'],
    }, apps),
    ['Evidence clue -> Event Viewer / Services / Task Manager'],
  );

  assert.deepEqual(
    selectPracticeModuleFlow({
      stem: 'A technician needs remote support for a legacy Linux GUI session.',
      options: [
        { key: 'A', text: 'SSH' },
        { key: 'B', text: 'VNC' },
      ],
      answer: ['B'],
    }, remote),
    ['Linux GUI -> VNC'],
  );
});

test('selectPracticeModuleFlow keeps a concise default when no flow line matches', () => {
  const ops = getCore2Module('ops-support');

  assert.deepEqual(
    selectPracticeModuleFlow({
      stem: 'A technician receives an unclear request.',
      options: [{ key: 'A', text: 'Document it' }],
      answer: ['A'],
    }, ops),
    ops.flow.slice(0, 2),
  );
});

test('buildPracticeExamDecision summarizes a correct Core 2 pattern match', () => {
  const decision = buildPracticeExamDecision({
    stem: 'A user reports a BSOD twice a day.',
    type: 'single',
    options: [
      { key: 'A', text: 'Event Viewer' },
      { key: 'B', text: 'Device Manager' },
    ],
    answer: ['A'],
    learning: { studyTags: ['app-troubleshooting'] },
  }, {
    correct: true,
    selectedAnswer: ['A'],
    correctAnswer: ['A'],
  });

  assert.equal(decision.status, 'correct');
  assert.match(decision.text, /BSOD twice a day -> Event Viewer/);
  assert.match(decision.text, /最直接动作/);
  assert.match(decision.visualUrl, /core2-visual\.html/);
  assert.match(decision.visualUrl, /q=OS#symptom-bsod-twice-a-day/);
  assert.equal(decision.visualLabel, '看同类题图谱');
  assert.equal(decision.reviewQuery, 'OS Event Viewer');
});

test('buildPracticeExamDecision compares a wrong choice with the correct Core 2 action', () => {
  const decision = buildPracticeExamDecision({
    stem: 'A technician needs remote support for a legacy Linux GUI session.',
    type: 'single',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
    ],
    answer: ['B'],
    learning: { studyTags: ['remote-network'] },
    analysis: {
      source: 'core2',
      whyNotChoose: [
        { key: 'A', reason: 'SSH 偏 command line（命令行），不能直接看 Linux GUI 桌面。' },
      ],
    },
  }, {
    correct: false,
    selectedAnswer: ['A'],
    correctAnswer: ['B'],
  });

  assert.equal(decision.status, 'wrong');
  assert.match(decision.text, /你选了 SSH/);
  assert.match(decision.text, /Legacy Linux GUI -> VNC/);
  assert.match(decision.text, /SSH 偏 command line/);
  assert.match(decision.visualUrl, /q=Remote#symptom-legacy-linux-gui/);
  assert.equal(decision.visualLabel, '看同类题图谱');
  assert.equal(decision.reviewQuery, 'Remote VNC');
});

test('buildPracticeExamDecision pinpoints missing and extra answers for multiple-choice questions', () => {
  const decision = buildPracticeExamDecision({
    stem: 'A customer wants to work from home and remotely access a Windows PC at the main office. Choose two.',
    type: 'multiple',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
      { key: 'C', text: 'RDP' },
      { key: 'D', text: 'VPN' },
    ],
    answer: ['C', 'D'],
    learning: { studyTags: ['remote-network'] },
    analysis: {
      source: 'core2',
      whyNotChoose: [
        { key: 'A', reason: 'SSH 偏命令行，不适合普通 Windows 图形办公。' },
      ],
    },
  }, {
    correct: false,
    selectedAnswer: ['A', 'C'],
    correctAnswer: ['C', 'D'],
  });

  assert.equal(decision.status, 'wrong');
  assert.match(decision.text, /多选定位/);
  assert.match(decision.text, /漏选：D\. VPN/);
  assert.match(decision.text, /多选：A\. SSH/);
  assert.match(decision.text, /排除所选：A\. SSH：SSH 偏命令行/);
  assert.equal(decision.reviewQuery, 'Remote RDP VPN');
});

test('buildPracticeExamDecision explains every selected distractor in a multiple-choice answer', () => {
  const decision = buildPracticeExamDecision({
    stem: 'A customer wants to work from home and remotely access a Windows PC at the main office. Choose two.',
    type: 'multiple',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
      { key: 'C', text: 'RDP' },
      { key: 'D', text: 'VPN' },
    ],
    answer: ['C', 'D'],
    learning: { studyTags: ['remote-network'] },
    analysis: {
      source: 'core2',
      whyNotChoose: [
        { key: 'A', reason: 'SSH 偏 command line（命令行），不是 Windows GUI 远程桌面。' },
        { key: 'B', reason: 'VNC 可做图形远控，但本题标准搭配是 RDP 加 VPN。' },
      ],
    },
  }, {
    correct: false,
    selectedAnswer: ['A', 'B', 'C'],
    correctAnswer: ['C', 'D'],
  });

  assert.equal(decision.status, 'wrong');
  assert.match(decision.text, /多选定位/);
  assert.match(decision.text, /漏选：D\. VPN/);
  assert.match(decision.text, /多选：A\. SSH \/ B\. VNC/);
  assert.match(decision.text, /排除所选：A\. SSH：SSH 偏 command line/);
  assert.match(decision.text, /B\. VNC：VNC 可做图形远控/);
});

test('buildPracticeExamDecision reinforces completed multiple-choice answers', () => {
  const decision = buildPracticeExamDecision({
    stem: 'A customer wants to work from home and remotely access a Windows PC at the main office. Choose two.',
    type: 'multiple',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
      { key: 'C', text: 'RDP' },
      { key: 'D', text: 'VPN' },
    ],
    answer: ['C', 'D'],
    learning: { studyTags: ['remote-network'] },
  }, {
    correct: true,
    selectedAnswer: ['C', 'D'],
    correctAnswer: ['C', 'D'],
  });

  assert.equal(decision.status, 'correct');
  assert.match(decision.text, /多选题已命中/);
  assert.match(decision.text, /每个正确项都对应题干里的一个需求/);
  assert.equal(decision.reviewQuery, 'Remote RDP VPN');
});

test('buildPracticeMistakeReason gives a compact wrong-choice reason for single-select Core 2 questions', () => {
  const reason = buildPracticeMistakeReason({
    stem: 'A technician needs remote support for a legacy Linux GUI session.',
    type: 'single',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
    ],
    answer: ['B'],
    learning: { studyTags: ['remote-network'] },
    analysis: {
      source: 'core2',
      whyNotChoose: [
        { key: 'A', reason: 'SSH 偏 command line（命令行），不能直接看 Linux GUI 桌面。' },
      ],
    },
  }, {
    correct: false,
    selectedAnswer: ['A'],
    correctAnswer: ['B'],
  });

  assert.equal(reason.text, '选错点：A. SSH；正确方向：B. VNC。');
  assert.equal(reason.hint, '速记：Legacy Linux GUI -> VNC。');
  assert.match(reason.details, /排除：A\. SSH：SSH 偏 command line/);
});

test('buildPracticeMistakeReason summarizes missing and extra choices for Core 2 multiple-select questions', () => {
  const reason = buildPracticeMistakeReason({
    stem: 'A customer wants to work from home and remotely access a Windows PC at the main office. Choose two.',
    type: 'multiple',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
      { key: 'C', text: 'RDP' },
      { key: 'D', text: 'VPN' },
    ],
    answer: ['C', 'D'],
    learning: { studyTags: ['remote-network'] },
    analysis: {
      source: 'core2',
      whyNotChoose: [
        { key: 'A', reason: 'SSH 偏 command line（命令行），不是 Windows GUI 远程桌面。' },
      ],
    },
  }, {
    correct: false,
    selectedAnswer: ['A', 'C'],
    correctAnswer: ['C', 'D'],
  });

  assert.equal(reason.text, '先看组合：漏选 D. VPN；多选 A. SSH。');
  assert.equal(reason.hint, '速记：Remote Windows PC -> RDP + VPN。');
  assert.match(reason.details, /排除：A\. SSH：SSH 偏 command line/);
});

test('getPracticeAnswerPrompt summarizes needed and selected counts for multiple-choice', () => {
  assert.deepEqual(
    getPracticeAnswerPrompt({
      type: 'multiple',
      answer: ['C', 'D'],
    }, ['C']),
    {
      neededCount: 2,
      selectedCount: 1,
      text: '多选题：需选 2 个，已选 1 个；选完点对照答案 / Enter',
    },
  );

  assert.equal(
    getPracticeAnswerPrompt({
      type: 'single',
      answer: ['A'],
    }, ['A']),
    null,
  );
});

test('renderPracticeView shows a compact multiple-choice answer prompt', () => {
  const html = renderPracticeView({
    id: 64,
    stem: 'A customer wants to work from home. Choose two.',
    type: 'multiple',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
      { key: 'C', text: 'RDP' },
      { key: 'D', text: 'VPN' },
    ],
    answer: ['C', 'D'],
    learning: { studyTags: ['remote-network'] },
  }, {
    currentIndex: 0,
    order: [64],
    mode: 'sequential',
  }, null, ['C'], 'Core 2 English Question Bank');

  assert.match(html, /data-section="practice-answer-prompt"/);
  assert.match(html, /多选题：需选 2 个，已选 1 个；选完点对照答案 \/ Enter/);
  assert.match(html, /Core 2 高频/);
});

test('renderPracticeView shows a persisted practice source link', () => {
  const html = renderPracticeView({
    id: 2,
    stem: 'A technician needs remote support for a legacy Linux GUI session.',
    type: 'single',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
    ],
    answer: ['B'],
    learning: { studyTags: ['remote-network'] },
  }, {
    currentIndex: 0,
    order: [2],
    mode: 'sequential',
    label: 'Core 2 图谱筛选：linux gui',
    source: {
      label: '返回图谱：linux gui',
      url: './core2-visual.html?v=test&q=linux%20gui#symptom-legacy-linux-gui',
    },
  }, null, [], 'Core 2 English Question Bank');

  assert.match(html, /当前模式：Core 2 图谱筛选：linux gui/);
  assert.match(html, /class="practice-source-link"/);
  assert.match(html, /来源：返回图谱：linux gui/);
  assert.match(html, /core2-visual\.html\?v=test&amp;q=linux%20gui#symptom-legacy-linux-gui/);
});

test('renderPracticeView shows the Core 2 visual review query after feedback', () => {
  const html = renderPracticeView({
    id: 2,
    stem: 'A technician needs remote support for a legacy Linux GUI session.',
    type: 'single',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
    ],
    answer: ['B'],
    learning: { studyTags: ['remote-network'] },
    analysis: {
      source: 'core2',
      whyNotChoose: [
        { key: 'A', reason: 'SSH 偏 command line（命令行），不能直接看 Linux GUI 桌面。' },
      ],
    },
  }, {
    currentIndex: 0,
    order: [2],
    mode: 'sequential',
  }, {
    correct: false,
    selectedAnswer: ['A'],
    correctAnswer: ['B'],
  }, ['A'], 'Core 2 English Question Bank');

  assert.match(html, /data-section="practice-exam-decision"/);
  assert.match(html, /data-section="practice-mistake-reason"/);
  assert.match(html, /错因归类/);
  assert.match(html, /选错点：A\. SSH；正确方向：B\. VNC。/);
  assert.match(html, /看同类题图谱/);
  assert.match(html, /复盘搜索/);
  assert.match(html, /Remote VNC/);
  assert.match(html, /data-action="start-practice-symptom"/);
  assert.match(html, /data-symptom-id="symptom-legacy-linux-gui"/);
  assert.match(html, /data-query="Legacy Linux GUI"/);
  assert.match(html, /class="practice-symptom-guide__priority"/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-priority-feedback&amp;q=high-yield#symptom-legacy-linux-gui/);
  assert.match(html, /重点/);
  assert.match(html, /练这类题/);
});

test('renderPracticeView shows Core 2 confusion tips after feedback', () => {
  const html = renderPracticeView({
    id: 64,
    stem: 'A customer wants to work from home and remotely access a Windows PC at the main office. Choose two.',
    type: 'multiple',
    options: [
      { key: 'A', text: 'SSH' },
      { key: 'B', text: 'VNC' },
      { key: 'C', text: 'RDP' },
      { key: 'D', text: 'VPN' },
    ],
    answer: ['C', 'D'],
    learning: { studyTags: ['remote-network'] },
  }, {
    currentIndex: 0,
    order: [64],
    mode: 'sequential',
  }, {
    correct: false,
    selectedAnswer: ['A', 'B'],
    correctAnswer: ['C', 'D'],
  }, ['A', 'B'], 'Core 2 English Question Bank');

  assert.match(html, /data-section="practice-confusion-guide"/);
  assert.match(html, /data-section="practice-next-review"/);
  assert.match(html, /data-section="practice-module-snapshot"/);
  assert.match(html, /data-action="start-practice-module"/);
  assert.match(html, /data-module-id="remote-network"/);
  assert.match(html, /练这个模块：Remote \/ Network/);
  assert.match(html, /模块速记/);
  assert.match(html, /patterns/);
  assert.match(html, /看 Remote Windows PC -&gt; 选 RDP \+ VPN/);
  assert.match(html, /易混答案对照/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-priority-feedback#remote-confusions/);
  assert.match(html, /Windows GUI from home/);
  assert.match(html, /RDP \+ VPN/);
  assert.match(html, /SSH is command line; VNC fits Linux GUI/);
});
