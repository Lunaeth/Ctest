export const TROUBLESHOOTING_OVERVIEW = {
  title: 'Troubleshooting 低风险最直接流程',
  summary: '题库 first/next 题优先选低风险、可验证、最贴近症状的动作。',
  examRules: [
    '先 verify / inspect：确认设置、端口、线缆、症状范围。',
    '先 isolate：用 known-good、external monitor、Ethernet test 缩小范围。',
    '先 low-risk：restart、clean、reseat、close apps、check settings。',
    '安全题先 quarantine / isolate，再 scan、remediate、educate。',
    '做不下去：escalate 给 senior，并告诉 customer next steps。',
  ],
};

export const TROUBLESHOOTING_FLOW = [
  {
    stage: 'Verify / Inspect',
    detail: '先确认题干限制：设置、端口、线缆、供电、症状是否可复现。',
    clues: ['verify', 'inspect', 'check first'],
    examMove: '先看 date/time、USB-C port、projector input、loose video cable。',
  },
  {
    stage: 'Scope / Isolate',
    detail: '判断是单机、线缆、AP、应用、打印机路径，别直接大修。',
    clues: ['known-good', 'external monitor', 'Ethernet test'],
    examMove: 'known-good 复现看上游；external monitor 分屏幕/主机。',
  },
  {
    stage: 'Low-risk Action',
    detail: '先做不破坏数据的动作：restart、clean、close apps、settings。',
    clues: ['restart', 'clean', 'close apps'],
    examMove: '手机慢先 restart/close apps；打印脏先 clean rollers/filter。',
  },
  {
    stage: 'Targeted Fix',
    detail: '定位后再换部件、roll back、repair MBR、firmware 或 Services。',
    clues: ['root cause', 'replace', 'roll back'],
    examMove: 'fuser、pickup rollers、Services、Event Viewer 都是定点答案。',
  },
  {
    stage: 'Verify / Document',
    detail: '修复后看是否复现；事故和变更题要留记录或报告。',
    clues: ['incident report', 'SOP', 'internal wiki'],
    examMove: 'outage 给 incident report；部署说明看 internal wiki。',
  },
  {
    stage: 'Escalate',
    detail: '知识用尽、跨团队或厂商 bug 时升级，同时给用户 next steps。',
    clues: ['escalate', 'senior team member', 'next steps'],
    examMove: '别甩锅；题库答案是 escalate + provide next steps。',
  },
];

export const TROUBLESHOOTING_SECTIONS = [
  {
    id: 'verify-first',
    name: 'Verify first（先确认）',
    priority: '最高频',
    summary: 'first 题常选最小检查动作，不先换设备或重装。',
    points: [
      { label: 'Date/time', text: 'MFA 旅行后失效：Verify the date and time settings。' },
      { label: 'USB-C port', text: '掉落后不充电：Inspect the USB-C port for damage。' },
      { label: 'Projector input', text: 'HDMI 无信号：Check the projector input sources。' },
      { label: 'Video cable', text: '屏幕闪烁：先查 Loose video cable。' },
      { label: 'Permissions', text: '共享链接打不开：先查 Viewing and sharing permissions。' },
    ],
    symptoms: [
      '能先确认设置/端口/权限，就不要先 escalte 或 replace。',
      '题干出现 first / next：找最直接、风险最低动作。',
    ],
  },
  {
    id: 'isolate-scope',
    name: 'Isolate scope（缩小范围）',
    priority: '高频',
    summary: '用对照测试判断问题在设备、线缆、网络还是上游。',
    points: [
      { label: 'Known-good', text: 'known-good workstation 也复现：看 network logs / port flapping。' },
      { label: 'Patch cable', text: '换 switch port 仍 flapping：Replace the patch cable。' },
      { label: 'External monitor', text: 'Laptop blank screen：Connect to an external monitor。' },
      { label: 'Ethernet test', text: '全员无线差：Connect a machine using Ethernet and test connectivity。' },
      { label: 'Copy/scan path', text: 'copy/scan 有线、print/fax 正常：Document feeder。' },
    ],
    symptoms: [
      '先分单机/全员、无线/有线、显示屏/主机、扫描/打印路径。',
      '能用对照测试定位范围，就不要直接换主板或重装 OS。',
    ],
  },
  {
    id: 'low-risk-actions',
    name: 'Low-risk action（低风险动作）',
    priority: '最高频',
    summary: '不破坏数据、不扩大影响的动作优先。',
    points: [
      { label: 'Restart phone', text: '手机性能慢：Restart the phone。' },
      { label: 'Close apps', text: '内存 97%：Close unnecessary programs。' },
      { label: 'Clean rollers', text: 'paper not feeding：Clean the pickup rollers。' },
      { label: 'Clean printheads', text: 'inkjet 换墨盒仍差：Clean the printheads。' },
      { label: 'Clean filter', text: 'projector 过热/异味：Clean or replace the filter。' },
    ],
    symptoms: [
      'clean / restart / close / check settings 经常比 replace 更先。',
      '低风险不是万能；题干已定位坏件时才 replace。',
    ],
  },
  {
    id: 'tools-root-cause',
    name: 'Tools / root cause（工具定位）',
    priority: '高频',
    summary: '看到 root cause / logs / service / resource，就选对应工具。',
    points: [
      { label: 'Event Viewer', text: 'service stop points / BSOD：Event Viewer。' },
      { label: 'Services', text: 'Print Spooler dependencies：Services。' },
      { label: 'Task Manager', text: 'CPU / memory / RDS users / unresponsive apps：Task Manager。' },
      { label: 'ipconfig', text: 'IP、gateway、DNS、APIPA：ipconfig。' },
      { label: 'netstat', text: 'background bandwidth / connections：netstat。' },
    ],
    symptoms: [
      '工具题别猜部件；先看题干问的是 log、service 还是 resource。',
      'root cause 常对应 Event Viewer / Services / Task Manager。',
    ],
  },
  {
    id: 'security-malware',
    name: 'Security incident（安全事件）',
    priority: '高频',
    summary: '安全题先控范围，再清理，再教育或报告。',
    points: [
      { label: 'Quarantine', text: 'malware / outbound connections：Quarantine the system。' },
      { label: 'Isolate', text: 'ransom note / infection：Isolate the system。' },
      { label: 'Scan', text: 'mobile suspicious app：Run a mobile malware scan。' },
      { label: 'Educate', text: 'quarantine + scan + remediate 后：Educate the end user。' },
      { label: 'Incident report', text: 'outage summary + actions taken：Incident report。' },
    ],
    symptoms: [
      '不要先继续调查感染机；先 quarantine / isolate。',
      '题干说已 remediation，next step 常是 educate 或 report。',
    ],
  },
  {
    id: 'change-escalation',
    name: 'Change / Escalation（变更与升级）',
    priority: '中高频',
    summary: '变更题看流程，卡住或跨团队时升级并说明下一步。',
    points: [
      { label: 'Propose change', text: 'switches end-of-life：Propose the change。' },
      { label: 'Sandbox testing', text: '提前发现 proposed change 风险：Sandbox testing。' },
      { label: 'Emergency change', text: 'zero-day + downtime：Implement an emergency change。' },
      { label: 'Escalate', text: 'knowledge exhausted：Escalate the issue to a senior team member。' },
      { label: 'Collaboration', text: '跨部门解决：Explain the issue and the need for collaboration。' },
    ],
    symptoms: [
      '变更未批准前先 propose / test；高影响漏洞才 emergency change。',
      '升级不是沉默转单；题库要求给用户 next steps。',
    ],
  },
];

export const TROUBLESHOOTING_PATTERN_MAP = [
  { symptom: 'MFA fails after travel', answer: 'Verify date and time settings', group: 'Verify' },
  { symptom: 'Dropped tablet will not charge', answer: 'Inspect USB-C port', group: 'Verify' },
  { symptom: 'HDMI no signal', answer: 'Check projector input sources', group: 'Verify' },
  { symptom: 'Known-good workstation also fails', answer: 'Network logs / port flapping', group: 'Isolate' },
  { symptom: 'Port flapping after port swap', answer: 'Replace patch cable', group: 'Isolate' },
  { symptom: 'Laptop blank screen', answer: 'Connect external monitor', group: 'Isolate' },
  { symptom: 'Phone/app slow', answer: 'Restart phone / close apps', group: 'Low-risk' },
  { symptom: 'Inkjet quality still poor', answer: 'Clean printheads', group: 'Low-risk' },
  { symptom: 'Print spooler dependencies fail', answer: 'Services', group: 'Tool' },
  { symptom: 'Service stops / BSOD cause', answer: 'Event Viewer', group: 'Tool' },
  { symptom: 'Malware outbound connections', answer: 'Quarantine the system', group: 'Security' },
  { symptom: 'Virus remediated', answer: 'Educate the end user', group: 'Security' },
  { symptom: 'Outage summary requested', answer: 'Incident report', group: 'Document' },
  { symptom: 'End-of-life switches', answer: 'Propose the change', group: 'Change' },
  { symptom: 'Cannot resolve + customer upset', answer: 'Escalate + next steps', group: 'Escalate' },
];
