import { escapeHtml } from '../learning-annotations.js';

import { renderFavoriteSyncControls } from './favorite-sync-view.js';

const CORE1_VISUAL_ENTRIES = [
  {
    href: './network-map.html?v=20260705-port-reference',
    title: 'Network',
    summary: '分层排错',
  },
  {
    href: './troubleshooting-visual.html?v=20260705-troubleshooting-visual',
    title: 'Troubleshooting',
    summary: '低风险流程',
  },
  {
    href: './printer-visual.html?v=20260705-visual-maps-source-backed',
    title: 'Printer',
    summary: '类型流程',
  },
  {
    href: './hardware-visual.html?v=20260706-hardware-processes',
    title: 'Hardware',
    summary: '硬件流程',
  },
];

const CORE2_VISUAL_ENTRIES = [
  {
    href: './core2-visual.html?v=20260707-core2-process-flows',
    title: 'Core 2 总图',
    summary: '五类高频题型总览',
  },
  {
    href: './core2-visual.html?v=20260707-core2-process-flows#security',
    title: 'Security',
    summary: 'Malware / MFA / Access',
  },
  {
    href: './core2-visual.html?v=20260707-core2-process-flows#os-commands',
    title: 'OS Commands',
    summary: 'Windows / Linux / tools',
  },
  {
    href: './core2-visual.html?v=20260707-core2-process-flows#app-troubleshooting',
    title: 'App Troubleshooting',
    summary: 'Apps / Services / logs',
  },
  {
    href: './core2-visual.html?v=20260707-core2-process-flows#ops-support',
    title: 'Ops Support',
    summary: 'Backup / change / support',
  },
  {
    href: './core2-visual.html?v=20260707-core2-process-flows#remote-network',
    title: 'Remote / Network',
    summary: 'VPN / RDP / VNC / Wi-Fi',
  },
];

const SECURITY_PLUS_VISUAL_ENTRIES = [
  {
    href: './security-plus-visual.html?v=20260720-security-plus-bilingual',
    title: 'Security+ 总图',
    summary: '五个 SY0-701 考试领域',
  },
  {
    href: './security-plus-visual.html?v=20260720-security-plus-bilingual#sec-threats-mitigations',
    title: 'Threats｜威胁与漏洞',
    summary: 'Actors（攻击者）/ attacks（攻击）/ mitigations（缓解）',
  },
  {
    href: './security-plus-visual.html?v=20260720-security-plus-bilingual#sec-architecture',
    title: 'Architecture｜安全架构',
    summary: 'Cloud（云）/ network（网络）/ resilience（韧性）',
  },
  {
    href: './security-plus-visual.html?v=20260720-security-plus-bilingual#sec-operations',
    title: 'Operations｜安全运营',
    summary: 'IAM（身份访问）/ monitoring（监控）/ incident response（事件响应）',
  },
  {
    href: './security-plus-visual.html?v=20260720-security-plus-bilingual#sec-program-management',
    title: 'Governance｜安全治理',
    summary: 'Risk（风险）/ compliance（合规）/ awareness（意识）',
  },
];

function getOptionAnnotation(question, key) {
  return question.learning?.options?.find((item) => item.key === key);
}

function renderOption(question, option) {
  const annotation = getOptionAnnotation(question, option.key);
  const isCorrect = annotation?.isCorrect === true;
  const explanationHtml = annotation?.explanationHtml
    ?? escapeHtml(annotation?.explanation ?? '暂无解释');

  return `
    <article class="learning-option ${isCorrect ? 'is-correct' : 'is-wrong'}">
      <div class="learning-option__choice">
        <strong>${escapeHtml(option.key)}.</strong>
        <span>${escapeHtml(option.text)}</span>
      </div>
      <p class="learning-explanation ${isCorrect ? 'is-correct' : 'is-wrong'}">
        ${explanationHtml}
      </p>
    </article>
  `;
}

function renderFavoriteButton(question, isFavorite) {
  return `
    <button
      class="favorite-btn ${isFavorite ? 'is-active' : ''}"
      data-action="toggle-favorite"
      data-question-id="${escapeHtml(question.id)}"
      aria-pressed="${isFavorite ? 'true' : 'false'}"
    >
      <span aria-hidden="true">${isFavorite ? '★' : '☆'}</span>
      ${isFavorite ? '已收藏' : '收藏'}
    </button>
  `;
}

function renderSpeedTip(question) {
  if (!question.learning?.speedTipHtml) return '';

  return `
    <div class="learning-speed-tip">
      <strong>速通提示</strong>
      <p>${question.learning.speedTipHtml}</p>
    </div>
  `;
}

function renderStudyNotes(question) {
  const notes = question.learning?.studyNotesHtml ?? [];
  if (!notes.length) return '';

  return `
    <div class="learning-study-note">
      <strong>高频知识点</strong>
      <ul>
        ${notes.map((note) => `<li>${note}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderDiscussionEvidence(question) {
  const discussion = question.discussion;
  if (!discussion) return '';

  const votes = Array.isArray(discussion.voteDistribution)
    ? discussion.voteDistribution.slice(0, 5)
    : [];
  const highlights = Array.isArray(discussion.highlights)
    ? discussion.highlights.slice(0, 2)
    : [];
  if (!discussion.summary && !votes.length && !highlights.length) return '';

  return `
    <section class="learning-discussion" aria-label="community discussion evidence">
      <div class="learning-discussion__header">
        <strong>社区讨论依据</strong>
        <span>判题采用 Most Voted</span>
      </div>
      ${votes.length ? `
        <div class="learning-discussion__votes">
          ${votes.map((vote) => `
            <span>${escapeHtml((vote.answer ?? []).join(''))} · ${escapeHtml(vote.percent)}%</span>
          `).join('')}
        </div>
      ` : ''}
      ${discussion.summary ? `<p>${escapeHtml(discussion.summary)}</p>` : ''}
      ${highlights.length ? `
        <details>
          <summary>查看高赞讨论摘录</summary>
          <div class="learning-discussion__highlights">
            ${highlights.map((comment) => `
              <blockquote>
                <strong>${escapeHtml(comment.author || 'Community')}</strong>
                ${comment.highlyVoted ? '<em>Highly Voted</em>' : ''}
                <p>${escapeHtml(comment.text)}</p>
              </blockquote>
            `).join('')}
          </div>
        </details>
      ` : ''}
    </section>
  `;
}

function renderLearningBankTabs(coreBanks, activeBankId) {
  if (!coreBanks.length) return '';

  return `
    <div class="learning-bank-tabs" aria-label="Certification question bank">
      ${coreBanks.map((bank) => `
        <button
          class="learning-bank-tab ${bank.id === activeBankId ? 'is-active' : ''}"
          data-action="select-learning-bank"
          data-bank-id="${escapeHtml(bank.id)}"
        >
          ${escapeHtml(bank.label)}
        </button>
      `).join('')}
    </div>
  `;
}

function getVisualEntries(activeBankId) {
  if (activeBankId === 'securityPlus') return SECURITY_PLUS_VISUAL_ENTRIES;
  return activeBankId === 'core2' ? CORE2_VISUAL_ENTRIES : CORE1_VISUAL_ENTRIES;
}

function renderVisualEntries(activeBankId) {
  const entries = getVisualEntries(activeBankId);

  return `
    <section class="visual-entry-panel visual-entry-panel--compact" aria-label="knowledge visualizations">
      <div>
        <strong>知识可视化</strong>
        <p>先看流程图，再回到模块刷题。</p>
      </div>
      <div class="visual-entry-grid">
        ${entries.map((entry) => `
          <a class="visual-entry" href="${escapeHtml(entry.href)}">
            <strong>${escapeHtml(entry.title)}</strong>
            <span>${escapeHtml(entry.summary)}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}

function renderLearningModules(modules, activeModuleId) {
  if (!modules.length) return '';

  return `
    <section class="module-study" aria-label="module study">
      <div class="module-study__header">
        <div>
          <strong>模块学习</strong>
          <p>按高频知识点分组刷题。</p>
        </div>
        <button class="secondary-btn module-study__practice" data-action="start-module-practice">
          练习当前模块
        </button>
      </div>
      <div class="module-study__list">
        ${modules.map((module) => `
          <button
            class="module-study__item ${module.id === activeModuleId ? 'is-active' : ''}"
            data-action="select-learning-module"
            data-module-id="${escapeHtml(module.id)}"
            ${module.count === 0 ? 'disabled' : ''}
          >
            <span>${escapeHtml(module.label)}</span>
            <small>${escapeHtml(module.description)}</small>
            <strong>${module.count} 题</strong>
          </button>
        `).join('')}
      </div>
    </section>
  `;
}

function renderQuestionTags(question, modules) {
  const tags = question.learning?.studyTags ?? [];
  const moduleMap = new Map(modules.map((module) => [module.id, module]));
  const visibleTags = tags.map((tag) => moduleMap.get(tag)).filter(Boolean);

  if (!visibleTags.length) return '';

  return `
    <div class="learning-tags" aria-label="Knowledge point tags">
      ${visibleTags.map((module) => `<span>${escapeHtml(module.shortLabel ?? module.label)}</span>`).join('')}
    </div>
  `;
}

function renderLearningJumpControl(currentIndex, total) {
  return `
    <div class="question-jump-control" aria-label="跳到题号">
      <label for="learning-question-jump">跳到题号</label>
      <div class="question-jump-control__row">
        <input
          id="learning-question-jump"
          type="number"
          min="1"
          max="${total}"
          value="${currentIndex + 1}"
          inputmode="numeric"
          data-question-jump-input="learning"
        />
        <button class="secondary-btn" type="button" data-action="jump-learning-question">跳转</button>
      </div>
    </div>
  `;
}

export function renderLearningView(
  question,
  currentIndex,
  total,
  bankLabel = '',
  {
    isFavorite = false,
    favoriteCount = 0,
    coreBanks = [],
    activeBankId = '',
    modules = [],
    activeModuleId = 'all',
    isNavigatorCollapsed = false,
    favoriteSyncText = '',
    favoriteSyncMessage = '',
    favoriteSyncMessageKind = 'info',
  } = {},
) {
  const stemHtml = question.learning?.stemHtml ?? escapeHtml(question.stem);
  const keyPointHtml = question.learning?.keyPointHtml
    ?? '关键点：抓住题干限制，排除不直接解决问题的选项。';

  return `
    <section class="learning-layout ${isNavigatorCollapsed ? 'is-learning-nav-collapsed' : ''}">
      <article class="panel learning-panel">
        <div class="learning-topbar">
          <div class="question-meta">
            <span>${escapeHtml(bankLabel)} · 学习模式</span>
            <strong>${currentIndex + 1} / ${total} 题</strong>
          </div>
          ${renderFavoriteButton(question, isFavorite)}
        </div>
        ${renderLearningBankTabs(coreBanks, activeBankId)}
        ${renderVisualEntries(activeBankId)}
        ${renderLearningModules(modules, activeModuleId)}
        <h2 class="question-stem learning-stem">${stemHtml}</h2>
        ${renderQuestionTags(question, modules)}
        <div class="learning-keypoint">
          <strong>关键点</strong>
          <p>${keyPointHtml}</p>
        </div>
        ${renderSpeedTip(question)}
        ${renderStudyNotes(question)}
        ${renderDiscussionEvidence(question)}
        <div class="learning-option-list">
          ${question.options.map((option) => renderOption(question, option)).join('')}
        </div>
        <div class="toolbar">
          <button class="secondary-btn" data-action="learning-prev" ${currentIndex === 0 ? 'disabled' : ''}>上一题</button>
          <button class="secondary-btn" data-action="learning-next" ${currentIndex === total - 1 ? 'disabled' : ''}>下一题</button>
        </div>
      </article>
      <aside class="panel navigator-panel learning-nav ${isNavigatorCollapsed ? 'is-collapsed' : ''}">
        <div class="learning-nav__header">
          <div>
            <h3>${escapeHtml(bankLabel)} 学习</h3>
            <p class="learning-nav__compact">第 ${currentIndex + 1} / ${total} 题</p>
          </div>
          <button
            class="learning-nav-toggle"
            data-action="toggle-learning-nav"
            aria-expanded="${isNavigatorCollapsed ? 'false' : 'true'}"
            aria-controls="learning-nav-body"
            aria-label="${isNavigatorCollapsed ? '展开学习信息' : '收起学习信息'}"
          >
            <span aria-hidden="true">⌄</span>
          </button>
        </div>
        <div class="learning-nav__body" id="learning-nav-body" ${isNavigatorCollapsed ? 'hidden' : ''}>
          ${renderLearningJumpControl(currentIndex, total)}
          <button
            class="secondary-btn learning-nav__favorite-entry"
            data-action="start-favorites-practice"
            ${favoriteCount === 0 ? 'disabled' : ''}
          >
            练收藏题
          </button>
          <p>已收藏 <strong>${favoriteCount}</strong> 题</p>
          <p>先抓题眼，再看每个选项的对错理由；收藏题适合后续做深度复盘。</p>
          ${renderFavoriteSyncControls({
    favoriteCount,
    syncText: favoriteSyncText,
    syncMessage: favoriteSyncMessage,
    syncMessageKind: favoriteSyncMessageKind,
  })}
        </div>
      </aside>
    </section>
  `;
}
