import { escapeHtml } from './learning-annotations.js?v=20260705-visual-maps-source-backed';
import {
  PRINTER_OVERVIEW,
  PRINT_PIPELINE,
  PRINTER_TYPES,
  PRINTER_SYMPTOM_MAP,
} from './printer-study-map.js?v=20260705-visual-maps-source-backed';

function getElement(id) {
  return document.getElementById(id);
}

function renderRules() {
  getElement('printer-rules').innerHTML = `
    <section class="visual-panel">
      <h2>应试判断规则</h2>
      <ul class="rule-grid">
        ${PRINTER_OVERVIEW.examRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderPipeline() {
  getElement('printer-pipeline').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>通用打印路径</h2>
          <p>先排软件路径，再排具体打印引擎。</p>
        </div>
      </div>
      <div class="pipeline">
        ${PRINT_PIPELINE.map((step) => `
          <article class="flow-card">
            <strong>${escapeHtml(step.label)}</strong>
            <p>${escapeHtml(step.detail)}</p>
            <small>题眼：${escapeHtml(step.clue)}</small>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderSteps(steps) {
  return `
    <ol class="step-list">
      ${steps.map((step) => `
        <li>
          <strong>${escapeHtml(step.name)}</strong>
          ${escapeHtml(step.action)}
          <div class="clue-row">
            ${step.clues.map((clue) => `<span>${escapeHtml(clue)}</span>`).join('')}
          </div>
        </li>
      `).join('')}
    </ol>
  `;
}

function renderSymptoms(symptoms) {
  return `
    <ul class="symptom-list">
      ${symptoms.map((symptom) => `<li>${escapeHtml(symptom)}</li>`).join('')}
    </ul>
  `;
}

function renderPrinterTypes() {
  getElement('printer-types').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>按打印机类型串流程</h2>
          <p>每张卡先看类型，再沿步骤找题眼。</p>
        </div>
      </div>
      <div class="type-grid">
        ${PRINTER_TYPES.map((type) => `
          <article class="type-card" id="${escapeHtml(type.id)}">
            <div class="type-card__head">
              <div>
                <h3>${escapeHtml(type.name)}</h3>
                <p>${escapeHtml(type.summary)}</p>
              </div>
              <span class="priority-pill">${escapeHtml(type.priority)}</span>
            </div>
            <div class="type-card__body">
              ${renderSteps(type.steps)}
              ${renderSymptoms(type.symptoms)}
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderSymptomMap() {
  getElement('printer-symptoms').innerHTML = `
    <section class="visual-section">
      <h2>症状 → 答案速查</h2>
      <table class="symptom-table">
        <thead>
          <tr>
            <th>题干症状</th>
            <th>答案方向</th>
            <th>所在流程</th>
          </tr>
        </thead>
        <tbody>
          ${PRINTER_SYMPTOM_MAP.map((row) => `
            <tr>
              <td>${escapeHtml(row.symptom)}</td>
              <td><strong>${escapeHtml(row.answer)}</strong></td>
              <td><span>${escapeHtml(row.layer)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function main() {
  getElement('visual-title').textContent = PRINTER_OVERVIEW.title;
  getElement('visual-summary').textContent = PRINTER_OVERVIEW.summary;
  renderRules();
  renderPipeline();
  renderPrinterTypes();
  renderSymptomMap();
}

main();
