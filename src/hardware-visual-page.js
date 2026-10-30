import { escapeHtml } from './learning-annotations.js?v=20260706-hardware-processes';
import {
  HARDWARE_OVERVIEW,
  BOOT_FLOW,
  HARDWARE_PROCESS_FLOWS,
  HARDWARE_SECTIONS,
  HARDWARE_SYMPTOM_MAP,
} from './hardware-study-map.js?v=20260706-hardware-processes';

function getElement(id) {
  return document.getElementById(id);
}

function renderRules() {
  getElement('hardware-rules').innerHTML = `
    <section class="visual-panel">
      <h2>应试判断规则</h2>
      <ul class="rule-grid">
        ${HARDWARE_OVERVIEW.examRules.map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderBootFlow() {
  getElement('hardware-boot').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>开机 / Boot Process 流程</h2>
          <p>题干说 passes POST、boot order、OS not found 时，按这条线往后定位。</p>
        </div>
      </div>
      <div class="boot-flow">
        ${BOOT_FLOW.map((step, index) => `
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

function renderHardwareProcesses() {
  getElement('hardware-processes').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>其他硬件流程</h2>
          <p>除了 boot process，这些流程也在题库里反复以 first/next/best action 出现。</p>
        </div>
      </div>
      <div class="process-grid">
        ${HARDWARE_PROCESS_FLOWS.map((flow) => `
          <article class="process-card" id="${escapeHtml(flow.id)}">
            <div class="process-card__head">
              <h3>${escapeHtml(flow.title)}</h3>
              <p>${escapeHtml(flow.summary)}</p>
            </div>
            <ol class="process-steps">
              ${flow.steps.map((step) => `
                <li>
                  <strong>${escapeHtml(step.stage)}</strong>
                  <span>${escapeHtml(step.action)}</span>
                  <div class="clue-row">
                    ${step.clues.map((clue) => `<span>${escapeHtml(clue)}</span>`).join('')}
                  </div>
                </li>
              `).join('')}
            </ol>
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

function renderHardwareSections() {
  getElement('hardware-sections').innerHTML = `
    <section class="visual-section">
      <div class="section-title-row">
        <div>
          <h2>硬件知识块</h2>
          <p>按部件类别记题眼，不要把供电、启动、存储、显示混在一起选。</p>
        </div>
      </div>
      <div class="hardware-grid">
        ${HARDWARE_SECTIONS.map((section) => `
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

function renderSymptomMap() {
  getElement('hardware-symptoms').innerHTML = `
    <section class="visual-section">
      <h2>症状 → 答案速查</h2>
      <table class="symptom-table">
        <thead>
          <tr>
            <th>题干症状</th>
            <th>答案方向</th>
            <th>知识块</th>
          </tr>
        </thead>
        <tbody>
          ${HARDWARE_SYMPTOM_MAP.map((row) => `
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
  getElement('visual-title').textContent = HARDWARE_OVERVIEW.title;
  getElement('visual-summary').textContent = HARDWARE_OVERVIEW.summary;
  renderRules();
  renderBootFlow();
  renderHardwareProcesses();
  renderHardwareSections();
  renderSymptomMap();
}

main();
