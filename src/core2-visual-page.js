import { escapeHtml } from './learning-annotations.js?v=20260707-core2-priority-feedback';
import {
  CORE2_CONFUSION_SETS,
  CORE2_HIGH_FREQUENCY_MODULES,
  CORE2_OVERVIEW,
  CORE2_SYMPTOM_GROUPS,
  CORE2_SYMPTOM_MAP,
  CORE2_TRUE_PROCESS_FLOWS,
  buildCore2DecisionMnemonic,
  getCore2ModuleSnapshot,
  getCore2SymptomGroup,
  getCore2SymptomId,
  isCore2HighYieldPattern,
} from './core2-study-map.js?v=20260707-core2-process-flows';

const APP_LEARN_URL = './index.html?v=20260707-core2-process-flows#/learn';
const PENDING_CORE2_MODULE_PRACTICE_KEY = 'question-app.pending-core2-module-practice';

export { buildCore2DecisionMnemonic, getCore2ModuleSnapshot };

function getElement(id) {
  return document.getElementById(id);
}

function renderList(title, items = []) {
  return `
    <div class="study-list">
      <strong>${escapeHtml(title)}</strong>
      <ul>
        ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ul>
    </div>
  `;
}

function renderModuleSnapshot(module) {
  const snapshot = getCore2ModuleSnapshot(module.id);
  if (!snapshot.group || !snapshot.count) return '';

  return `
    <div class="study-list module-snapshot">
      <strong>模块速记</strong>
      <a class="module-pattern-link" href="#${escapeHtml(snapshot.group.id)}">
        ${snapshot.count} local patterns
      </a>
      <a
        class="module-practice-link"
        href="${APP_LEARN_URL}"
        data-action="start-core2-module-practice"
        data-module-id="${escapeHtml(module.id)}"
      >
        练这个模块
      </a>
      <ul>
        ${snapshot.mnemonics.map((item) => `
          <li><a href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>
        `).join('')}
      </ul>
    </div>
  `;
}

function renderRules() {
  getElement('core2-rules').innerHTML = `
    <section class="visual-panel">
      <h2>应试判断规则</h2>
      <ul class="rule-grid">
        ${CORE2_OVERVIEW.examRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderTrueProcesses() {
  getElement('core2-processes').innerHTML = `
    <section class="visual-section true-process-section">
      <div class="section-title-row">
        <div>
          <h2>Core 2 真流程速记</h2>
          <p>只背会考顺序的流程；其他题继续按场景和题眼判断</p>
        </div>
      </div>
      <div class="process-grid core2-process-grid">
        ${CORE2_TRUE_PROCESS_FLOWS.map((flow) => `
          <article class="process-card core2-process-card" id="${escapeHtml(flow.id)}">
            <div class="process-card__head">
              <h3>${escapeHtml(flow.title)}</h3>
              <span class="priority-pill">${escapeHtml(flow.priority)}</span>
              <p>${escapeHtml(flow.summary)}</p>
            </div>
            <ol class="process-steps">
              ${flow.steps.map((step) => `
                <li>
                  <strong>${escapeHtml(step.stage)}</strong>
                  <span>${escapeHtml(step.action)}</span>
                </li>
              `).join('')}
            </ol>
            <p class="process-trap">
              <strong>排除</strong>
              ${escapeHtml(flow.trap)}
            </p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export function getCore2CramCards(maxMnemonics = 2) {
  return CORE2_HIGH_FREQUENCY_MODULES.map((module) => {
    const snapshot = getCore2ModuleSnapshot(module.id);
    const confusionSet = CORE2_CONFUSION_SETS.find((set) => set.moduleId === module.id);

    return {
      moduleId: module.id,
      label: module.label,
      priority: module.priority,
      signals: module.signals.slice(0, 3),
      mnemonics: snapshot.mnemonics.slice(0, maxMnemonics),
      confusion: confusionSet?.rows?.[0] ?? null,
    };
  });
}

function renderCramCards() {
  const cards = getCore2CramCards();

  getElement('core2-cram').innerHTML = `
    <section class="visual-section cram-section">
      <div class="section-title-row">
        <div>
          <h2>考前速记</h2>
          <p>每个模块只扫触发词、题干口诀和最常混的排除点</p>
        </div>
      </div>
      <div class="cram-grid">
        ${cards.map((card) => `
          <article class="cram-card">
            <div class="cram-card__head">
              <a href="#${escapeHtml(card.moduleId)}">${escapeHtml(card.label)}</a>
              <span>${escapeHtml(card.priority)}</span>
            </div>
            <p><strong>先抓</strong> ${escapeHtml(card.signals.join(' / '))}</p>
            <ul>
              ${card.mnemonics.map((item) => `
                <li><a href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>
              `).join('')}
            </ul>
            ${card.confusion ? `
              <small>
                ${escapeHtml(card.confusion.cue)}：选 ${escapeHtml(card.confusion.choose)}；排 ${escapeHtml(card.confusion.avoid)}
              </small>
            ` : ''}
            <a
              class="cram-practice-link"
              href="${APP_LEARN_URL}"
              data-action="start-core2-module-practice"
              data-module-id="${escapeHtml(card.moduleId)}"
            >
              练这个模块
            </a>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderModules() {
  getElement('core2-modules').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>高频题型模块</h2>
          <p>每题先找触发词，再从同一模块里选最直接答案</p>
        </div>
      </div>
      <div class="type-grid">
        ${CORE2_HIGH_FREQUENCY_MODULES.map((module) => `
          <article class="type-card" id="${escapeHtml(module.id)}">
            <div class="type-card__head">
              <div>
                <h3>${escapeHtml(module.label)}</h3>
                <p>${escapeHtml(module.summary)}</p>
              </div>
              <span class="priority-pill">${escapeHtml(module.priority)}</span>
            </div>
            <div class="type-card__body">
              ${renderList('常考信', module.signals)}
              ${renderList('应试流程', module.flow)}
              ${renderList('常见答案动作', module.actions)}
              ${renderList('易混排除', module.traps)}
              ${renderModuleSnapshot(module)}
              <div class="study-list">
                <strong>题库例子</strong>
                <ul>
                  ${module.examples.map((item) => `
                    <li>${escapeHtml(item.clue)} -> <strong>${escapeHtml(item.answer)}</strong></li>
                  `).join('')}
                </ul>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderConfusionSets() {
  getElement('core2-confusions').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>易混答案对照</h2>
          <p>同一题型里先分 cue，再排除相邻但不直接的答案</p>
        </div>
      </div>
      <div class="confusion-grid">
        ${CORE2_CONFUSION_SETS.map((set) => `
          <article class="confusion-card" id="${escapeHtml(set.id)}">
            <div class="confusion-card__head">
              <h3>${escapeHtml(set.title)}</h3>
              <a href="#${escapeHtml(getCore2SymptomGroup(set.group)?.id ?? '')}">${escapeHtml(set.group)}</a>
            </div>
            <a
              class="confusion-practice-link"
              href="${APP_LEARN_URL}"
              data-action="start-core2-module-practice"
              data-module-id="${escapeHtml(set.moduleId)}"
            >
              练相关模块
            </a>
            <ul>
              ${set.rows.map((row) => `
                <li>
                  <strong>${escapeHtml(row.cue)}</strong>
                  <span>选 ${escapeHtml(row.choose)}</span>
                  <em>排 ${escapeHtml(row.avoid)}</em>
                </li>
              `).join('')}
            </ul>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function getSymptomRowsByGroup() {
  return new Map(
    CORE2_SYMPTOM_GROUPS.map((group) => [
      group.group,
      CORE2_SYMPTOM_MAP.filter((row) => row.group === group.group),
    ]),
  );
}

export const CORE2_SYMPTOM_QUICK_FILTERS = [
  { label: 'All patterns', query: '' },
  { label: 'High-yield', query: 'high-yield' },
  { label: 'MFA + Security', query: 'mfa security' },
  { label: 'Malware + Security', query: 'malware security' },
  { label: 'Command + OS', query: 'command os' },
  { label: 'Browser + Apps', query: 'browser apps' },
  { label: 'VPN + Remote', query: 'vpn remote' },
  { label: 'Backup + Ops', query: 'backup ops' },
];

export function tokenizeCore2SymptomQuery(query) {
  return String(query ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function getCore2SymptomSearchText(row) {
  const group = getCore2SymptomGroup(row?.group);

  return [
    row?.symptom,
    row?.answer,
    row?.group,
    group?.label,
    group?.moduleId,
    buildCore2DecisionMnemonic(row),
    isCore2HighYieldPattern(row) ? 'high-yield priority focus' : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function isCore2SymptomSearchMatch(searchText, query) {
  const tokens = tokenizeCore2SymptomQuery(query);
  if (!tokens.length) return true;

  const normalizedText = String(searchText ?? '').toLowerCase();
  return tokens.every((token) => normalizedText.includes(token));
}

export function getCore2InitialSymptomQuery(locationObject = globalThis.location) {
  const search = String(locationObject?.search ?? '');
  if (!search) return '';

  try {
    return new URLSearchParams(search).get('q') ?? '';
  } catch {
    return '';
  }
}

export function buildCore2SymptomQueryUrl(query, locationObject = globalThis.location) {
  const pathname = String(locationObject?.pathname ?? '');
  const hash = String(locationObject?.hash ?? '');
  const params = new URLSearchParams(String(locationObject?.search ?? ''));
  const normalizedQuery = String(query ?? '').trim();

  if (normalizedQuery) {
    params.set('q', normalizedQuery);
  } else {
    params.delete('q');
  }

  const search = params.toString();
  return `${pathname}${search ? `?${search}` : ''}${hash}`;
}

export function syncCore2SymptomQueryUrl(query, windowObject = globalThis.window) {
  const locationObject = windowObject?.location;
  const historyObject = windowObject?.history;
  if (!locationObject || typeof historyObject?.replaceState !== 'function') return;

  const nextUrl = buildCore2SymptomQueryUrl(query, locationObject);
  const currentUrl = `${locationObject.pathname}${locationObject.search}${locationObject.hash}`;
  if (nextUrl === currentUrl) return;

  historyObject.replaceState(null, '', nextUrl);
}

function bindSymptomFilter() {
  const input = document.querySelector('[data-action="filter-core2-symptoms"]');
  const count = document.querySelector('[data-section="core2-symptom-filter-count"]');
  const empty = document.querySelector('[data-section="core2-symptom-filter-empty"]');
  const quickFilters = [...document.querySelectorAll('[data-action="apply-core2-symptom-filter"]')];
  const groupToggles = [...document.querySelectorAll('[data-action="toggle-core2-symptom-group"]')];
  const groupBulkToggles = [...document.querySelectorAll('[data-action="set-core2-symptom-groups"]')];
  const filteredPracticeButton = document.querySelector('[data-action="start-core2-filter-practice"]');
  const rowPracticeLinks = [...document.querySelectorAll('[data-action="start-core2-row-practice"]')];
  const rows = [...document.querySelectorAll('.symptom-data-row')];
  const groupRows = [...document.querySelectorAll('.symptom-group-row')];
  let currentFilterSymptomIds = [];

  if (!input || !count || !rows.length) return;
  input.value = getCore2InitialSymptomQuery();

  const applyFilter = () => {
    const query = input.value;
    const hasQuery = Boolean(query.trim());
    const visibleGroups = new Set();
    const matchedSymptomIds = [];
    let visibleCount = 0;
    const expandedByGroup = new Map(
      groupRows.map((row) => [row.dataset.group, row.dataset.expanded !== 'false']),
    );

    rows.forEach((row) => {
      const isSearchMatch = isCore2SymptomSearchMatch(row.dataset.search, query);
      const isExpanded = hasQuery || expandedByGroup.get(row.dataset.group) !== false;
      row.hidden = !isSearchMatch || !isExpanded;
      if (isSearchMatch) {
        visibleCount += 1;
        matchedSymptomIds.push(row.id);
        visibleGroups.add(row.dataset.group);
      }
    });
    currentFilterSymptomIds = matchedSymptomIds;

    groupRows.forEach((row) => {
      row.hidden = !visibleGroups.has(row.dataset.group);
    });
    quickFilters.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.query === query.trim().toLowerCase()));
    });
    groupToggles.forEach((button) => {
      const group = button.dataset.group;
      const isExpanded = expandedByGroup.get(group) !== false;
      button.setAttribute('aria-expanded', String(isExpanded));
      button.textContent = isExpanded ? '收起' : '展开';
    });
    count.textContent = `${visibleCount} / ${rows.length}`;
    if (empty) empty.hidden = visibleCount !== 0;
    if (filteredPracticeButton) {
      filteredPracticeButton.setAttribute('aria-disabled', String(!hasQuery || visibleCount === 0));
      filteredPracticeButton.textContent = hasQuery && visibleCount
        ? `练当前筛选（${visibleCount}）`
        : '练当前筛选';
    }
    syncCore2SymptomQueryUrl(query);
  };

  input.addEventListener('input', applyFilter);
  quickFilters.forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.query ?? '';
      applyFilter();
      input.focus({ preventScroll: true });
    });
  });
  groupToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const groupRow = groupRows.find((row) => row.dataset.group === button.dataset.group);
      if (!groupRow) return;
      groupRow.dataset.expanded = groupRow.dataset.expanded === 'false' ? 'true' : 'false';
      applyFilter();
    });
  });
  groupBulkToggles.forEach((button) => {
    button.addEventListener('click', () => {
      const nextExpanded = button.dataset.expanded === 'true';
      groupRows.forEach((row) => {
        row.dataset.expanded = String(nextExpanded);
      });
      applyFilter();
    });
  });
  filteredPracticeButton?.addEventListener('click', (event) => {
    if (!input.value.trim() || !currentFilterSymptomIds.length) {
      event.preventDefault();
      return;
    }

    try {
      window.localStorage?.setItem(PENDING_CORE2_MODULE_PRACTICE_KEY, JSON.stringify({
        bankId: 'core2',
        query: input.value.trim(),
        symptomIds: currentFilterSymptomIds,
        createdAt: Date.now(),
      }));
    } catch {
      // The link still opens learning mode if localStorage is unavailable.
    }
  });
  rowPracticeLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const symptomId = link.dataset.symptomId;
      if (!symptomId) {
        event.preventDefault();
        return;
      }

      try {
        window.localStorage?.setItem(PENDING_CORE2_MODULE_PRACTICE_KEY, JSON.stringify({
          bankId: 'core2',
          query: link.dataset.query ?? '',
          symptomIds: [symptomId],
          createdAt: Date.now(),
        }));
      } catch {
        // The link still opens learning mode if localStorage is unavailable.
      }
    });
  });
  applyFilter();
}

function renderSymptomMap() {
  const rowsByGroup = getSymptomRowsByGroup();
  const highYieldCount = CORE2_SYMPTOM_MAP.filter(isCore2HighYieldPattern).length;

  getElement('core2-symptoms').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>题干症状 -> 答案速查</h2>
          <p>先按模块扫题干信号，再点具体行复盘同类题</p>
        </div>
      </div>
        <div class="symptom-stats" aria-label="Core 2 symptom map stats">
          <strong>${CORE2_SYMPTOM_MAP.length}</strong>
          <span>patterns</span>
          <strong>${CORE2_SYMPTOM_GROUPS.length}</strong>
          <span>groups</span>
          <strong>${highYieldCount}</strong>
          <span>high-yield</span>
        </div>
      <nav class="symptom-group-nav" aria-label="Core 2 symptom groups">
        ${CORE2_SYMPTOM_GROUPS.map((group) => {
    const count = rowsByGroup.get(group.group)?.length ?? 0;

    return `
          <a href="#${escapeHtml(group.id)}">
            <strong>${escapeHtml(group.label)}</strong>
            <span>${count} patterns</span>
          </a>
        `;
  }).join('')}
      </nav>
      <div class="symptom-filter">
        <label>
          <span>Filter</span>
          <input
            type="search"
            placeholder="mfa security / vpn remote / browser apps"
            data-action="filter-core2-symptoms"
          />
        </label>
        <strong data-section="core2-symptom-filter-count"></strong>
      </div>
      <div class="symptom-filter-chips" aria-label="Core 2 quick filters">
        ${CORE2_SYMPTOM_QUICK_FILTERS.map((filter) => `
          <button
            type="button"
            data-action="apply-core2-symptom-filter"
            data-query="${escapeHtml(filter.query)}"
            aria-pressed="false"
          >
            ${escapeHtml(filter.label)}
          </button>
        `).join('')}
      </div>
      <div class="symptom-group-controls" aria-label="Core 2 symptom group controls">
        <button type="button" data-action="set-core2-symptom-groups" data-expanded="false">全部收起</button>
        <button type="button" data-action="set-core2-symptom-groups" data-expanded="true">全部展开</button>
        <a
          class="symptom-filter-practice-link"
          href="${APP_LEARN_URL}"
          data-action="start-core2-filter-practice"
          aria-disabled="true"
        >
          练当前筛选
        </a>
      </div>
      <p class="symptom-empty" data-section="core2-symptom-filter-empty" hidden>
        No matching local Core 2 pattern.
      </p>
      <table class="symptom-table">
        <thead>
          <tr>
            <th>题干症状</th>
            <th>答案方向</th>
            <th>判断口诀</th>
            <th>模块</th>
            <th>练习</th>
          </tr>
        </thead>
        <tbody>
          ${CORE2_SYMPTOM_GROUPS.map((group) => {
    const rows = rowsByGroup.get(group.group) ?? [];

    return `
            <tr
              id="${escapeHtml(group.id)}"
              class="symptom-group-row"
              data-group="${escapeHtml(group.group)}"
              data-expanded="true"
            >
              <th colspan="5">
                <a href="#${escapeHtml(group.moduleId)}">${escapeHtml(group.label)}</a>
                <span>${rows.length} patterns</span>
                <a
                  class="symptom-group-practice-link"
                  href="${APP_LEARN_URL}"
                  data-action="start-core2-module-practice"
                  data-module-id="${escapeHtml(group.moduleId)}"
                >
                  练本组
                </a>
                <button
                  type="button"
                  class="symptom-group-toggle"
                  data-action="toggle-core2-symptom-group"
                  data-group="${escapeHtml(group.group)}"
                  aria-expanded="true"
                >
                  收起
                </button>
              </th>
            </tr>
            ${rows.map((row) => `
            <tr
              id="${escapeHtml(getCore2SymptomId(row))}"
              class="symptom-data-row"
              data-group="${escapeHtml(row.group)}"
              data-search="${escapeHtml(getCore2SymptomSearchText(row))}"
            >
              <td>${escapeHtml(row.symptom)}</td>
              <td>
                <strong>${escapeHtml(row.answer)}</strong>
                ${isCore2HighYieldPattern(row) ? '<span class="symptom-priority-badge">重点</span>' : ''}
              </td>
              <td class="symptom-decision">${escapeHtml(buildCore2DecisionMnemonic(row))}</td>
              <td><span>${escapeHtml(row.group)}</span></td>
              <td>
                <a
                  class="symptom-row-practice-link"
                  href="${APP_LEARN_URL}"
                  data-action="start-core2-row-practice"
                  data-symptom-id="${escapeHtml(getCore2SymptomId(row))}"
                  data-query="${escapeHtml(row.symptom)}"
                >
                  练这类题
                </a>
              </td>
            </tr>
            `).join('')}
          `;
  }).join('')}
        </tbody>
      </table>
    </section>
  `;
  bindSymptomFilter();
}

function bindModulePracticeLinks() {
  document.querySelectorAll('[data-action="start-core2-module-practice"]').forEach((link) => {
    link.addEventListener('click', () => {
      try {
        window.localStorage?.setItem(PENDING_CORE2_MODULE_PRACTICE_KEY, JSON.stringify({
          bankId: 'core2',
          moduleId: link.dataset.moduleId,
          createdAt: Date.now(),
        }));
      } catch {
        // The link still opens learning mode if localStorage is unavailable.
      }
    });
  });
}

function main() {
  getElement('visual-title').textContent = CORE2_OVERVIEW.title;
  getElement('visual-summary').textContent = CORE2_OVERVIEW.summary;
  renderRules();
  renderTrueProcesses();
  renderCramCards();
  renderModules();
  renderConfusionSets();
  renderSymptomMap();
  bindModulePracticeLinks();
}

if (typeof document !== 'undefined') {
  main();
}
