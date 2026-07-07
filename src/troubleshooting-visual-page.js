import { escapeHtml } from './learning-annotations.js?v=20260705-troubleshooting-visual';
import {
  TROUBLESHOOTING_FLOW,
  TROUBLESHOOTING_OVERVIEW,
  TROUBLESHOOTING_PATTERN_MAP,
  TROUBLESHOOTING_SECTIONS,
} from './troubleshooting-study-map.js?v=20260705-troubleshooting-visual';

function getElement(id) {
  return document.getElementById(id);
}

function renderRules() {
  getElement('troubleshooting-rules').innerHTML = `
    <section class="visual-panel">
      <h2>应试判断规则</h2>
      <ul class="rule-grid">
        ${TROUBLESHOOTING_OVERVIEW.examRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderFlow() {
  getElement('troubleshooting-flow').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>first / next 排障流程</h2>
          <p>先确认和缩小范围，再做低风险修复；安全题先控范围。</p>
        </div>
      </div>
      <div class="boot-flow">
        ${TROUBLESHOOTING_FLOW.map((step, index) => `
          <article class="boot-step">
            <strong>${index + 1}. ${escapeHtml(step.stage)}</strong>
            <div>
              <em>${escapeHtml(step.detail)}</em>
              <div class="clue-row">
                ${step.clues.map((clue) => `<span>${escapeHtml(clue)}</span>`).join('')}
              </div>
            </div>
            <small>${escapeHtml(step.examMove)}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPointList(points) {
  return `
    <ul class="point-list">
      ${points.map((point) => `
        <li>
          <strong>${escapeHtml(point.label)}</strong>
          ${escapeHtml(point.text)}
        </li>
      `).join('')}
    </ul>
  `;
}

function renderSymptoms(symptoms) {
  return `
    <ul class="symptom-list">
      ${symptoms.map((symptom) => `<li>${escapeHtml(symptom)}</li>`).join('')}
    </ul>
  `;
}

function renderSections() {
  getElement('troubleshooting-sections').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>题库高频判断块</h2>
          <p>每块只放题库出现过的操作词，适合考前快速扫。</p>
        </div>
      </div>
      <div class="hardware-grid">
        ${TROUBLESHOOTING_SECTIONS.map((section) => `
          <article class="hardware-card" id="${escapeHtml(section.id)}">
            <div class="hardware-card__head">
              <div>
                <h3>${escapeHtml(section.name)}</h3>
                <p>${escapeHtml(section.summary)}</p>
              </div>
              <span class="priority-pill">${escapeHtml(section.priority)}</span>
            </div>
            <div class="hardware-card__body">
              ${renderPointList(section.points)}
              ${renderSymptoms(section.symptoms)}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderPatternMap() {
  getElement('troubleshooting-patterns').innerHTML = `
    <section class="visual-section">
      <h2>题眼 → 答案速查</h2>
      <table class="symptom-table">
        <thead>
          <tr>
            <th>题干信号</th>
            <th>答案方向</th>
            <th>流程块</th>
          </tr>
        </thead>
        <tbody>
          ${TROUBLESHOOTING_PATTERN_MAP.map((row) => `
            <tr>
              <td>${escapeHtml(row.symptom)}</td>
              <td><strong>${escapeHtml(row.answer)}</strong></td>
              <td><span>${escapeHtml(row.group)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function main() {
  getElement('visual-title').textContent = TROUBLESHOOTING_OVERVIEW.title;
  getElement('visual-summary').textContent = TROUBLESHOOTING_OVERVIEW.summary;
  renderRules();
  renderFlow();
  renderSections();
  renderPatternMap();
}

main();
