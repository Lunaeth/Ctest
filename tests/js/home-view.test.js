import test from 'node:test';
import assert from 'node:assert/strict';
import { renderHomeView } from '../../src/views/home-view.js';

test('renderHomeView shows summary cards and action buttons', () => {
  const html = renderHomeView({
    stats: {
      totalQuestions: 100,
      answeredCount: 40,
      accuracy: 75,
      mistakeCount: 8,
      lastExamScore: '18 / 20',
    },
    activeBankId: 'zh',
    banks: [
      { id: 'zh', label: '中文题库' },
      { id: 'en', label: 'Core 1 English Question Bank' },
      { id: 'core2', label: 'Core 2 English Question Bank' },
    ],
  });

  assert.match(html, /练习模式/);
  assert.match(html, /模拟考试/);
  assert.match(html, /data-action="start-practice"/);
  assert.match(html, /data-action="start-learning"/);
  assert.match(html, /data-mode="sequential"/);
  assert.match(html, /data-action="select-bank"/);
  assert.match(html, /knowledge visualizations/);
  assert.doesNotMatch(html, /core2-visual\.html\?v=20260707-core2-priority-feedback/);
  assert.match(html, /network-map\.html\?v=20260705-port-reference/);
  assert.match(html, /troubleshooting-visual\.html\?v=20260705-troubleshooting-visual/);
  assert.match(html, /printer-visual\.html\?v=20260705-visual-maps-source-backed/);
  assert.match(html, /hardware-visual\.html\?v=20260706-hardware-processes/);
  assert.match(html, /data-bank-id="zh"/);
  assert.match(html, /data-bank-id="en"/);
  assert.match(html, /data-bank-id="core2"/);
  assert.match(html, /中文题库/);
  assert.match(html, /Core 1 English Question Bank/);
  assert.match(html, /Core 2 English Question Bank/);
  assert.match(html, /100/);
  assert.match(html, /18 \/ 20/);
});

test('renderHomeView shows only the Core 2 study map when Core 2 is active', () => {
  const html = renderHomeView({
    stats: {
      totalQuestions: 100,
      answeredCount: 40,
      accuracy: 75,
      mistakeCount: 8,
      lastExamScore: '18 / 20',
    },
    activeBankId: 'core2',
    banks: [
      { id: 'en', label: 'Core 1 English Question Bank' },
      { id: 'core2', label: 'Core 2 English Question Bank' },
    ],
  });

  assert.match(html, /core2-visual\.html\?v=20260707-core2-priority-feedback/);
  assert.match(html, /Core 2 高频/);
  assert.doesNotMatch(html, /network-map\.html\?v=20260705-port-reference/);
  assert.doesNotMatch(html, /troubleshooting-visual\.html\?v=20260705-troubleshooting-visual/);
  assert.doesNotMatch(html, /printer-visual\.html\?v=20260705-visual-maps-source-backed/);
  assert.doesNotMatch(html, /hardware-visual\.html\?v=20260706-hardware-processes/);
});
