import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMistakesView } from '../../src/views/mistakes-view.js';

const mistakeEntries = [
  {
    id: 2,
    topic: 'Topic 2',
    stem: 'Question 2',
    type: 'single',
    analysis: {
      outline: ['先看题干主语。', '关键词：Gamma。', '答案要正中题干核心。'],
      whyChoose: '这是解析示例。',
      whyNotChoose: [
        { key: 'D', text: 'Delta', reason: '它不符合题干要求。' },
      ],
    },
    answer: ['C'],
    learning: {
      keyPointHtml: '关键点：<strong>Gamma</strong> 是本题题眼。',
      speedTipHtml: '速通：看到 <strong>Gamma</strong> 先排除 Delta。',
      studyNotesHtml: [
        '高频：Gamma 常和核心动作绑定。',
        '排除：Delta 是干扰方向。',
      ],
      options: [
        {
          key: 'C',
          isCorrect: true,
          explanationHtml: '<strong>Gamma clue</strong> explains why C is correct.',
        },
        {
          key: 'D',
          isCorrect: false,
          explanationHtml: 'Delta distractor explains why D is wrong.',
        },
      ],
    },
    options: [
      { key: 'C', text: 'Gamma' },
      { key: 'D', text: 'Delta' },
    ],
  },
  {
    id: 1,
    topic: 'Topic 1',
    stem: 'Question 1',
    type: 'multiple',
    answer: ['A', 'B'],
    options: [
      { key: 'A', text: 'Alpha' },
      { key: 'B', text: 'Beta' },
      { key: 'C', text: 'Gamma' },
    ],
  },
];

test('renderMistakesView lists mistake questions with answers and structured analysis', () => {
  const html = renderMistakesView(mistakeEntries, '中文题库', {
    supported: true,
    bound: false,
    fileName: '',
    syncState: 'idle',
    lastSyncedAt: null,
    message: '未创建学习存档 JSON。',
  }, true);

  assert.match(html, /Question 2/);
  assert.match(html, /Question 1/);
  assert.match(html, /C\. Gamma/);
  assert.match(html, /data-section="mistake-options"/);
  assert.match(html, /data-section="mistake-learning-summary"/);
  assert.match(html, /关键点：<strong>Gamma<\/strong> 是本题题眼/);
  assert.match(html, /速通：看到 <strong>Gamma<\/strong> 先排除 Delta/);
  assert.match(html, /高频：Gamma 常和核心动作绑定/);
  assert.match(html, /排除：Delta 是干扰方向/);
  assert.match(html, /Gamma clue/);
  assert.match(html, /Delta distractor/);
  assert.match(html, /class="mistake-option is-correct"/);
  assert.match(html, /class="mistake-option is-wrong"/);
  assert.match(html, /分析提纲/);
  assert.match(html, /为什么选/);
  assert.match(html, /为什么不选/);
  assert.match(html, /这是解析示例/);
  assert.match(html, /A\. Alpha/);
  assert.match(html, /B\. Beta/);
  assert.match(html, /data-action="retry-mistakes"/);
  assert.match(html, /data-action="toggle-auto-remove-mistakes"/);
  assert.match(html, /答对自动移除：开/);
  assert.match(html, /data-action="remove-mistake" data-question-id="2"/);
  assert.match(html, /data-action="remove-mistake" data-question-id="1"/);
  assert.match(html, /创建学习存档 JSON/);
  assert.match(html, /data-action="bind-learning-archive"/);
  assert.match(html, /未创建学习存档 JSON/);
  assert.ok(html.indexOf('为什么选') < html.indexOf('为什么不选'));
  assert.ok(html.indexOf('为什么不选') < html.indexOf('分析提纲'));
});

test('renderMistakesView renders an empty state when there are no mistakes', () => {
  const html = renderMistakesView([], '中文题库', {
    supported: false,
    bound: false,
    fileName: '',
    syncState: 'unsupported',
    lastSyncedAt: null,
    message: '当前浏览器不支持本地文件自动同步。',
  }, false);

  assert.match(html, /data-empty-state="mistakes"/);
  assert.doesNotMatch(html, /data-action="retry-mistakes"/);
  assert.match(html, /data-action="toggle-auto-remove-mistakes"/);
  assert.match(html, /答对自动移除：关/);
  assert.match(html, /当前浏览器不支持本地文件自动同步/);
});
