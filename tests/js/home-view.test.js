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
  assert.doesNotMatch(html, /core2-visual\.html\?v=20260707-core2-process-flows/);
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

  assert.match(html, /core2-visual\.html\?v=20260707-core2-process-flows/);
  assert.match(html, /Core 2 总图/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-process-flows#security/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-process-flows#os-commands/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-process-flows#app-troubleshooting/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-process-flows#ops-support/);
  assert.match(html, /core2-visual\.html\?v=20260707-core2-process-flows#remote-network/);
  assert.doesNotMatch(html, /network-map\.html\?v=20260705-port-reference/);
  assert.doesNotMatch(html, /troubleshooting-visual\.html\?v=20260705-troubleshooting-visual/);
  assert.doesNotMatch(html, /printer-visual\.html\?v=20260705-visual-maps-source-backed/);
  assert.doesNotMatch(html, /hardware-visual\.html\?v=20260706-hardware-processes/);
});

test('renderHomeView shows the Security+ study map for the SY0-701 bank', () => {
  const html = renderHomeView({
    stats: {
      totalQuestions: 606,
      answeredCount: 0,
      accuracy: 0,
      mistakeCount: 0,
      lastExamScore: '暂无',
    },
    activeBankId: 'securityPlus',
    banks: [{ id: 'securityPlus', label: 'Security+ SY0-701' }],
  });

  assert.match(html, /security-plus-visual\.html\?v=20260720-security-plus/);
  assert.match(html, /五个 SY0-701 考试领域/);
  assert.match(html, /General Concepts｜通用概念/);
  assert.match(html, /Architecture｜安全架构/);
  assert.match(html, /Operations｜安全运营/);
  assert.match(html, /Governance｜安全治理/);
  assert.match(html, /data-bank-id="securityPlus"/);
  assert.doesNotMatch(html, /core2-visual\.html/);
  assert.doesNotMatch(html, /printer-visual\.html/);
});
