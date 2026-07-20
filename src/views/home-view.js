export function renderHomeView({ stats, banks, activeBankId }) {
  const visualEntries = activeBankId === 'securityPlus'
    ? [
      {
        href: './security-plus-visual.html?v=20260720-security-plus-bilingual',
        title: 'Security+ 总图',
        summary: '五个 SY0-701 考试领域',
      },
      {
        href: './security-plus-visual.html?v=20260720-security-plus-bilingual#sec-general-concepts',
        title: 'General Concepts｜通用概念',
        summary: 'Controls（控制）/ CIA / crypto（密码学）',
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
    ]
    : activeBankId === 'core2'
    ? [
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
    ]
    : [
      {
        href: './network-map.html?v=20260705-port-reference',
        title: 'Network 分层地图',
        summary: '线缆 / VLAN / IP / DNS / wireless / VPN',
      },
      {
        href: './troubleshooting-visual.html?v=20260705-troubleshooting-visual',
        title: 'Troubleshooting 流程地图',
        summary: 'verify / isolate / low-risk / escalate',
      },
      {
        href: './printer-visual.html?v=20260705-visual-maps-source-backed',
        title: 'Printer 流程地图',
        summary: 'laser / inkjet / thermal / dot matrix / 3D',
      },
      {
        href: './hardware-visual.html?v=20260706-hardware-processes',
        title: 'Hardware 知识地图',
        summary: 'POST / UEFI / RAM / storage / PSU / ESD',
      },
    ];

  return `
    <section class="hero-grid">
      <article class="panel hero-card">
        <div class="bank-switcher">
          ${banks.map((bank) => `
            <button
              class="${bank.id === activeBankId ? 'primary-btn' : 'secondary-btn'}"
              data-action="select-bank"
              data-bank-id="${bank.id}"
            >${bank.label}</button>
          `).join('')}
        </div>
        <p class="eyebrow">Question Workspace</p>
        <h2>专注刷题，不做多余操</h2>
        <p class="hero-copy">练习模式用于即时判题，模拟考试用于整套自测，所有记录保存在当前浏览器</p>
        <div class="hero-actions">
          <button class="primary-btn" data-action="start-practice" data-mode="sequential">练习模式</button>
          <button class="secondary-btn" data-action="start-learning">学习模式</button>
          <button class="secondary-btn" data-route="exam">模拟考试</button>
        </div>
      </article>
      <article class="panel stats-card">
        <div class="stat-row"><span>题库总量</span><strong>${stats.totalQuestions}</strong></div>
        <div class="stat-row"><span>已做题数</span><strong>${stats.answeredCount}</strong></div>
        <div class="stat-row"><span>正确</span><strong>${stats.accuracy}%</strong></div>
        <div class="stat-row"><span>错题</span><strong>${stats.mistakeCount}</strong></div>
        <div class="stat-row"><span>最近考试</span><strong>${stats.lastExamScore}</strong></div>
      </article>
    </section>
    <section class="panel visual-entry-panel" aria-label="knowledge visualizations">
      <div>
        <p class="eyebrow">Study Maps</p>
        <h3>知识可视</h3>
        <p>按题库高频知识点整理流程和症状→答案，适合刷题前快速过一遍</p>
      </div>
      <div class="visual-entry-grid">
        ${visualEntries.map((entry) => `
          <a class="visual-entry" href="${entry.href}">
            <strong>${entry.title}</strong>
            <span>${entry.summary}</span>
          </a>
        `).join('')}
      </div>
    </section>
  `;
}
