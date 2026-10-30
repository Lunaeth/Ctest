import { escapeHtml } from './learning-annotations.js?v=20260707-core2-priority-feedback';
import { SECURITY_PLUS_DOMAINS } from './security-plus-study-map.js?v=20260720-security-plus-bilingual';

const PREFERENCES_KEY = 'question-app.preferences';

function renderList(title, rows) {
  return `
    <div class="study-list">
      <strong>${escapeHtml(title)}</strong>
      <ul>${rows.map((row) => `<li>${escapeHtml(row)}</li>`).join('')}</ul>
    </div>
  `;
}

function selectModule(moduleId) {
  try {
    const stored = JSON.parse(localStorage.getItem(PREFERENCES_KEY) || '{}');
    const preferences = stored && typeof stored === 'object' ? stored : {};
    preferences.activeBankId = 'securityPlus';
    preferences.learningModuleByBank = {
      ...(preferences.learningModuleByBank ?? {}),
      securityPlus: moduleId,
    };
    preferences.learningIndexByScope = {
      ...(preferences.learningIndexByScope ?? {}),
      [`securityPlus:${moduleId}`]: 0,
    };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // The destination still opens the Security+ learning page when storage is unavailable.
  }
}

function renderWeights() {
  document.querySelector('#security-plus-weights').innerHTML = SECURITY_PLUS_DOMAINS
    .map((domain) => `
      <li>
        <strong>${escapeHtml(domain.number)} · ${escapeHtml(domain.weight)}</strong><br />
        ${escapeHtml(domain.label)}
      </li>
    `)
    .join('');
}

function renderDomains() {
  document.querySelector('#security-plus-domains').innerHTML = SECURITY_PLUS_DOMAINS
    .map((domain) => `
      <article class="process-card core2-process-card" id="${escapeHtml(domain.id)}">
        <div class="process-card__head">
          <div>
            <p class="eyebrow">领域 Domain ${escapeHtml(domain.number)}</p>
            <h3>${escapeHtml(domain.label)}</h3>
            <p>${escapeHtml(domain.summary)}</p>
          </div>
          <span class="priority-pill">${escapeHtml(domain.weight)}</span>
        </div>
        ${renderList('题干信号', domain.signals)}
        ${renderList('答题流程', domain.flow)}
        ${renderList('易混排除', domain.traps)}
        <div class="study-list">
          <a
            class="cram-practice-link"
            data-action="start-security-plus-module"
            data-module-id="${escapeHtml(domain.id)}"
            href="./index.html?v=20260720-security-plus-bilingual#/learn"
          >练习此领域</a>
        </div>
      </article>
    `)
    .join('');
}

renderWeights();
renderDomains();

document.querySelectorAll('[data-action="start-security-plus-module"]').forEach((link) => {
  link.addEventListener('click', () => selectModule(link.dataset.moduleId));
});
