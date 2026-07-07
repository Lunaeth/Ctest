import { applyStoredCore2Analyses } from './core2-analysis.js?v=20260705-port-reference';
import { applyLearningAnnotations, escapeHtml } from './learning-annotations.js?v=20260707-core2-priority-feedback';
import { sanitizeQuestionBankData } from './question-bank-sanitizer.js';
import {
  NETWORK_OVERVIEW,
  NETWORK_PORT_MEMORY_RULES,
  NETWORK_PORT_REFERENCE,
  NETWORK_LAYERS,
  buildNetworkQuestionRows,
} from './network-question-map.js?v=20260705-port-reference';

const BANKS = [
  {
    id: 'en',
    label: 'Core 1',
    file: './data/questions.en.json',
  },
  {
    id: 'core2',
    label: 'Core 2',
    file: './data/questions.core2.json',
    analysisFiles: [
      './data/questions.core2.analysis.json',
      './data/questions.core2.curated.analysis.json',
    ],
  },
];

const state = {
  rows: [],
  activeLayerId: 'all',
  search: '',
};

function getElement(id) {
  return document.getElementById(id);
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return sanitizeQuestionBankData(await response.json());
}

async function loadBank(bank) {
  const questions = await fetchJson(bank.file);

  if (bank.id !== 'core2') {
    return {
      ...bank,
      questions: applyLearningAnnotations(questions, { bankId: bank.id }),
    };
  }

  const analysisRecords = [];
  for (const analysisFile of bank.analysisFiles ?? []) {
    analysisRecords.push(...await fetchJson(analysisFile));
  }

  return {
    ...bank,
    questions: applyLearningAnnotations(applyStoredCore2Analyses(questions, analysisRecords), { bankId: bank.id }),
  };
}

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function getLayer(layerId) {
  return NETWORK_LAYERS.find((layer) => layer.id === layerId);
}

function getVisibleRows() {
  const search = normalizeText(state.search);
  return state.rows.filter((row) => {
    if (state.activeLayerId !== 'all' && row.layerId !== state.activeLayerId) return false;
    if (!search) return true;

    return normalizeText([
      row.bankLabel,
      row.id,
      row.stem,
      row.clues.join(' '),
      row.correctAnswers.map((answer) => answer.label).join(' '),
      row.options.map((option) => option.text).join(' '),
    ].join(' ')).includes(search);
  });
}

function renderTabs() {
  const counts = new Map(NETWORK_LAYERS.map((layer) => [layer.id, 0]));
  for (const row of state.rows) {
    counts.set(row.layerId, (counts.get(row.layerId) ?? 0) + 1);
  }

  getElement('layer-tabs').innerHTML = [
    `<button class="layer-tab ${state.activeLayerId === 'all' ? 'is-active' : ''}" data-layer-id="all">全部 ${state.rows.length}</button>`,
    ...NETWORK_LAYERS.map((layer) => `
      <button class="layer-tab ${state.activeLayerId === layer.id ? 'is-active' : ''}" data-layer-id="${escapeHtml(layer.id)}">
        ${escapeHtml(layer.label)} ${counts.get(layer.id) ?? 0}
      </button>
    `),
  ].join('');
}

function renderSummary(rows) {
  const bankCounts = new Map();
  for (const row of rows) {
    bankCounts.set(row.bankLabel, (bankCounts.get(row.bankLabel) ?? 0) + 1);
  }

  getElement('network-summary').innerHTML = `
    <article class="summary-card">
      <strong>${rows.length}</strong>
      <span>当前显示的题库问</span>
    </article>
    <article class="summary-card">
      <strong>${NETWORK_LAYERS.filter((layer) => rows.some((row) => row.layerId === layer.id)).length}</strong>
      <span>覆盖的网络层</span>
    </article>
    <article class="summary-card">
      <strong>${bankCounts.get('Core 1') ?? 0}</strong>
      <span>Core 1 题目</span>
    </article>
    <article class="summary-card">
      <strong>${bankCounts.get('Core 2') ?? 0}</strong>
      <span>Core 2 题目</span>
    </article>
  `;
}

function renderList(title, items = []) {
  if (!items.length) return '';

  return `
    <div class="study-list">
      <strong>${escapeHtml(title)}</strong>
      <ul>
        ${items.map(renderStudyItem).join('')}
      </ul>
    </div>
  `;
}

function renderStudyItem(item) {
  if (typeof item === 'string') {
    return `<li>${escapeHtml(item)}</li>`;
  }

  const level = item.level === 'focus' ? 'focus' : 'general';
  return `
    <li class="study-item study-item--${level}">
      <span class="study-priority study-priority--${level}">${escapeHtml(item.label)}</span>
      <span>${escapeHtml(item.text)}</span>
    </li>
  `;
}

function renderOverview() {
  getElement('network-overview').innerHTML = `
    <article class="overview-panel">
      <div>
        <p class="eyebrow">Network Operating Model</p>
        <h2>${escapeHtml(NETWORK_OVERVIEW.title)}</h2>
        <p>${escapeHtml(NETWORK_OVERVIEW.summary)}</p>
      </div>
      <div class="overview-grid">
        ${renderList('总排障顺', NETWORK_OVERVIEW.workflow)}
        ${renderList('常用操作 / 命令', NETWORK_OVERVIEW.operations)}
      </div>
      <div class="exam-rule">
        <strong>应试规则</strong>
        <p>${escapeHtml(NETWORK_OVERVIEW.examRule)}</p>
      </div>
      <section class="port-reference-panel" aria-label="题库端口速记">
        <div class="port-reference-heading">
          <div>
            <p class="eyebrow">Ports From Question Bank</p>
            <h3>端口服务 题库功能</h3>
          </div>
          <strong>${NETWORK_PORT_REFERENCE.length} </strong>
        </div>
        <div class="port-card-grid">
          ${NETWORK_PORT_REFERENCE.map((item) => `
            <article class="port-card">
              <div class="port-card__top">
                <strong>${escapeHtml(item.port)}</strong>
                <span>${escapeHtml(item.service)}</span>
              </div>
              <p>${escapeHtml(item.function)}</p>
              <div class="port-card__clue">${escapeHtml(item.clue)}</div>
              <small>${escapeHtml(item.memory)}</small>
            </article>
          `).join('')}
        </div>
        ${renderList('端口速记', NETWORK_PORT_MEMORY_RULES)}
      </section>
    </article>
  `;
}

function renderCorrectAnswers(row) {
  const explanations = row.correctAnswers
    .map((answer) => answer.explanationHtml ?? (answer.explanation ? escapeHtml(answer.explanation) : ''))
    .filter(Boolean);

  return `
    <div class="answer-box">
      <strong>对应答案</strong>
      <ul>
        ${row.correctAnswers.map((answer) => `<li>${escapeHtml(answer.label)}</li>`).join('')}
      </ul>
      ${explanations.length ? `<p class="answer-explanation">${explanations[0]}</p>` : ''}
    </div>
  `;
}

function renderOptions(row) {
  const answerKeys = new Set(row.answer);
  return `
    <details class="option-box">
      <summary><strong>查看全部选项</strong></summary>
      <ul>
        ${row.options.map((option) => `
          <li class="${answerKeys.has(option.key) ? 'is-correct' : ''}">
            ${escapeHtml(option.key)}. ${escapeHtml(option.text)}
          </li>
        `).join('')}
      </ul>
    </details>
  `;
}

function renderLayerStudyGuide(layer) {
  return `
    <div class="layer-study-guide">
      <div class="layer-core-concept">
        <strong>核心判断</strong>
        <p>${escapeHtml(layer.coreConcept)}</p>
      </div>
      ${renderList('相关知识', layer.knowledge)}
      ${renderList('常见操作', layer.operations)}
      ${renderList('问题 答案模式', layer.answerPatterns)}
      ${renderList('题眼信号', layer.signals)}
      ${renderList('易错混', layer.traps)}
    </div>
  `;
}

function renderQuestionCard(row) {
  const layer = getLayer(row.layerId);
  return `
    <article class="question-card" data-layer-id="${escapeHtml(row.layerId)}">
      <div class="question-card__meta">
        <strong>${escapeHtml(row.bankLabel)} #${escapeHtml(row.id)}</strong>
        <span>${escapeHtml(row.type === 'multiple' ? 'Multiple choice' : 'Single choice')}</span>
        <span>${escapeHtml(layer?.label ?? row.layerId)}</span>
      </div>
      <h3>${escapeHtml(row.stem)}</h3>
      ${renderCorrectAnswers(row)}
      <div class="reason-box">
        <strong>为什么归到这一</strong>
        ${escapeHtml(row.reason)}
      </div>
      <div class="question-card__badges">
        ${row.clues.map((clue) => `<span>${escapeHtml(clue)}</span>`).join('')}
      </div>
      ${renderOptions(row)}
    </article>
  `;
}

function renderContent() {
  const rows = getVisibleRows();
  renderTabs();
  renderSummary(rows);

  if (!rows.length) {
    getElement('network-content').innerHTML = `
      <article class="empty-state">没有匹配的题目。换一个关键词，或者点“全部”</article>
    `;
    return;
  }

  getElement('network-content').innerHTML = NETWORK_LAYERS
    .map((layer) => {
      const layerRows = rows.filter((row) => row.layerId === layer.id);
      if (!layerRows.length) return '';

      return `
        <section class="layer-section" id="layer-${escapeHtml(layer.id)}">
          <div class="layer-heading">
            <div>
              <h2>${escapeHtml(layer.title)}</h2>
              <p>${escapeHtml(layer.summary)}</p>
            </div>
            <strong>${layerRows.length} </strong>
          </div>
          ${renderLayerStudyGuide(layer)}
          <div class="question-grid">
            ${layerRows.map(renderQuestionCard).join('')}
          </div>
        </section>
      `;
    }).join('');
}

function bindEvents() {
  getElement('network-search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderContent();
  });

  getElement('layer-tabs').addEventListener('click', (event) => {
    const button = event.target.closest('[data-layer-id]');
    if (!button) return;
    state.activeLayerId = button.dataset.layerId;
    renderContent();
  });
}

async function main() {
  try {
    bindEvents();
    const banks = await Promise.all(BANKS.map(loadBank));
    state.rows = buildNetworkQuestionRows(banks);
    renderOverview();
    renderContent();
  } catch (error) {
    getElement('network-content').innerHTML = `
      <article class="error-card">
        <strong>Network 地图加载失败</strong>
        <p>${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}

main();
