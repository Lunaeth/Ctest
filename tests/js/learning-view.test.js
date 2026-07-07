import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLearningAnnotation } from '../../src/learning-annotations.js';
import { renderLearningView } from '../../src/views/learning-view.js';

test('renderLearningView shows bold keywords and separate correct and wrong explanations', () => {
  const question = {
    id: 301,
    topic: 'Networking',
    stem: 'Which service assigns IP settings through DHCP?',
    options: [
      { key: 'A', text: 'DHCP' },
      { key: 'B', text: 'DNS' },
    ],
    answer: ['A'],
    type: 'single',
  };
  const html = renderLearningView(
    {
      ...question,
      learning: {
        ...buildLearningAnnotation(question),
        studyTags: ['networking'],
      },
    },
    0,
    1,
    'Core 1 English Question Bank',
    {
      isFavorite: true,
      favoriteCount: 3,
      activeBankId: 'en',
      coreBanks: [
        { id: 'en', label: 'Core 1 English Question Bank' },
        { id: 'core2', label: 'Core 2 English Question Bank' },
      ],
      activeModuleId: 'networking',
      modules: [
        {
          id: 'all',
          label: '全部题目',
          shortLabel: 'All',
          description: 'Core 1 全部学习',
          count: 10,
        },
        {
          id: 'networking',
          label: 'Networking（网络）',
          shortLabel: 'Networking',
          description: 'IP / DHCP / DNS',
          count: 3,
        },
      ],
    },
  );

  assert.match(html, /learning-layout/);
  assert.match(html, /Core 1 English Question Bank/);
  assert.match(html, /Core 2 English Question Bank/);
  assert.match(html, /<strong>DHCP<\/strong>/);
  assert.match(html, /data-action="select-learning-bank"/);
  assert.doesNotMatch(html, /core2-visual\.html\?v=20260707-core2-priority-feedback/);
  assert.match(html, /printer-visual\.html\?v=20260705-visual-maps-source-backed/);
  assert.match(html, /hardware-visual\.html\?v=20260706-hardware-processes/);
  assert.match(html, /network-map\.html\?v=20260705-port-reference/);
  assert.match(html, /troubleshooting-visual\.html\?v=20260705-troubleshooting-visual/);
  assert.match(html, /data-action="select-learning-module"/);
  assert.match(html, /data-action="start-module-practice"/);
  assert.match(html, /module-study__item is-active/);
  assert.match(html, /Knowledge point tags/);
  assert.match(html, /Networking/);
  assert.match(html, /class="learning-explanation is-correct"/);
  assert.match(html, /class="learning-explanation is-wrong"/);
  assert.match(html, /data-action="toggle-favorite"/);
  assert.match(html, /favorite-btn is-active/);
  assert.match(html, /aria-pressed="true"/);
  assert.match(html, /data-action="toggle-learning-nav"/);
  assert.match(html, /aria-expanded="true"/);
  assert.match(html, /data-action="start-favorites-practice"/);
  assert.match(html, /练收藏题/);
  assert.match(html, /\u5df2\u6536\u85cf <strong>3<\/strong> \u9898/);
  assert.match(html, /data-action="learning-prev"/);
  assert.match(html, /data-action="learning-next"/);
});

test('renderLearningView shows only the Core 2 visual map for Core 2 learning', () => {
  const question = {
    id: 401,
    stem: 'Which tool updates Group Policy?',
    options: [{ key: 'A', text: 'gpupdate' }],
    answer: ['A'],
    type: 'single',
  };
  const html = renderLearningView(question, 0, 1, 'Core 2 English Question Bank', {
    activeBankId: 'core2',
  });

  assert.match(html, /core2-visual\.html\?v=20260707-core2-priority-feedback/);
  assert.match(html, /Core 2 高频图/);
  assert.doesNotMatch(html, /printer-visual\.html\?v=20260705-visual-maps-source-backed/);
  assert.doesNotMatch(html, /hardware-visual\.html\?v=20260706-hardware-processes/);
  assert.doesNotMatch(html, /network-map\.html\?v=20260705-port-reference/);
  assert.doesNotMatch(html, /troubleshooting-visual\.html\?v=20260705-troubleshooting-visual/);
});

test('renderLearningView can collapse the right learning navigator', () => {
  const question = {
    id: 1,
    stem: 'Which port is used for FTP?',
    options: [{ key: 'A', text: '21' }],
    answer: ['A'],
    type: 'single',
  };
  const html = renderLearningView(question, 0, 1, 'Core 1 English Question Bank', {
    favoriteCount: 39,
    isNavigatorCollapsed: true,
  });

  assert.match(html, /learning-layout is-learning-nav-collapsed/);
  assert.match(html, /learning-nav is-collapsed/);
  assert.match(html, /收藏 39/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /hidden/);
});

test('renderLearningView disables the favorite practice entry when there are no favorites', () => {
  const question = {
    id: 1,
    stem: 'Which port is used for FTP?',
    options: [{ key: 'A', text: '21' }],
    answer: ['A'],
    type: 'single',
  };
  const html = renderLearningView(question, 0, 1, 'Core 1 English Question Bank', {
    favoriteCount: 0,
  });

  assert.match(html, /data-action="start-favorites-practice"/);
  assert.match(html, /disabled/);
});
