export const CORE2_OVERVIEW = {
  title: 'Core 2 高频题型图',
  summary: '按 Core 2 题库高频触发词整理：先识别场景，再选最直接动作。',
  examRules: [
    'Security 先看 attack / credential / data loss',
    'OS 先看 command / filesystem / boot clue',
    'App 故障先看单个应用还是系统级症状',
    'Ops 先看 policy / backup / change step',
    'Remote 先分 VPN 通道和 RDP/VNC 会话',
  ],
};

export const CORE2_TRUE_PROCESS_FLOWS = [
  {
    id: 'malware-removal',
    title: 'Malware removal',
    summary: 'Contain first; clean or reimage; educate last.',
    priority: 'Must know',
    trap: 'Do not restore files before containment.',
    steps: [
      { stage: 'Identify', action: 'Confirm pop-ups, ransomware, redirects, or bad link' },
      { stage: 'Isolate', action: 'Disconnect network or quarantine the system' },
      { stage: 'Restore off', action: 'Disable System Restore before cleaning when asked' },
      { stage: 'Remediate', action: 'Update definitions, scan, clean install, or reimage' },
      { stage: 'Recover', action: 'Restore from a known-good backup' },
      { stage: 'Educate', action: 'User education prevents future infections' },
    ],
  },
  {
    id: 'troubleshooting-methodology',
    title: 'Troubleshooting methodology',
    summary: 'First/next questions favor low-risk direct checks.',
    priority: 'Must know',
    trap: 'Do not skip to rebuild when a direct check exists.',
    steps: [
      { stage: 'Identify', action: 'Ask open-ended questions and review tickets' },
      { stage: 'Theory', action: 'Pick likely cause from symptom and scope' },
      { stage: 'Test', action: 'Use known-good, Event Viewer, Device Manager' },
      { stage: 'Plan', action: 'Apply direct fix with rollback awareness' },
      { stage: 'Verify', action: 'Confirm function and document findings' },
    ],
  },
  {
    id: 'change-management',
    title: 'Change management',
    summary: 'Risk, rollback, approval, then implementation.',
    priority: 'Must know',
    trap: 'Emergency change is for critical risk, not normal updates.',
    steps: [
      { stage: 'Scope', action: 'Start with risk analysis and impact' },
      { stage: 'Plan', action: 'Prepare backup plan and rollback plan' },
      { stage: 'Test', action: 'Use sandbox testing for risky changes' },
      { stage: 'Approve', action: 'Use standard or emergency change path' },
      { stage: 'Validate', action: 'Confirm service and document the change' },
    ],
  },
  {
    id: 'backup-restore',
    title: 'Backup / restore verification',
    summary: 'Backups count only when restore is proven.',
    priority: 'High',
    trap: 'Backup testing is the answer when recovery must be proven.',
    steps: [
      { stage: 'Baseline', action: 'Full backup creates a recovery baseline' },
      { stage: '3-2-1', action: 'Use multiple copies and media types' },
      { stage: 'Run', action: 'Use incremental or differential after baseline' },
      { stage: 'Verify', action: 'Backup testing proves recovery is possible' },
      { stage: 'Maintain', action: 'Purge old backups by policy' },
    ],
  },
  {
    id: 'incident-documentation',
    title: 'Incident response / documentation',
    summary: 'Contain first; report what happened and impact.',
    priority: 'High',
    trap: 'Incident report fits management summary and root cause.',
    steps: [
      { stage: 'Detect', action: 'Use logs, EDR, or user report' },
      { stage: 'Contain', action: 'Isolate or quarantine affected systems' },
      { stage: 'Escalate', action: 'Use SLA, vendor, or senior technician' },
      { stage: 'Recover', action: 'Restore service or reimage from backup' },
      { stage: 'Document', action: 'Incident report, ticket notes, user education' },
    ],
  },
  {
    id: 'os-recovery',
    title: 'OS boot / update / recovery',
    summary: 'Match symptom to repair tool; avoid full reinstall.',
    priority: 'High',
    trap: 'Use reimage only after faster repair or remediation fails.',
    steps: [
      { stage: 'Boot', action: 'OS Not Found -> check boot order or options' },
      { stage: 'MBR / GPT', action: 'Repair MBR; use GPT for large disks' },
      { stage: 'Driver', action: 'BSOD after driver -> Safe mode + roll back' },
      { stage: 'Patch', action: 'Bad update -> roll back or uninstall update' },
      { stage: 'Files / disk', action: 'Missing files -> sfc; disk issue -> chkdsk' },
    ],
  },
];

export const CORE2_HIGH_FREQUENCY_MODULES = [
  {
    id: 'security',
    label: 'Security / Malware',
    summary: '攻击、凭证、加密、权限和物理访问控制。',
    priority: 'High',
    signals: ['malware', 'phishing', 'MFA', 'BitLocker', 'least privilege'],
    flow: [
      'Attack clue -> phishing / ransomware / evil twin',
      'Data loss -> BitLocker / device encryption',
      'Access control -> MFA / least privilege / badge readers',
      'Infection first -> Quarantine / isolate the system',
    ],
    actions: ['Quarantine the system', 'Use MFA / TOTP', 'Apply encryption', 'Use JIT access'],
    traps: ['Remote wipe 要设备在线', 'Firewall 不是身份认证', 'UAC 不是反恶意软件'],
    examples: [
      { clue: 'ransomware encrypts files', answer: 'Ransomware' },
      { clue: 'push approve/deny', answer: 'Authenticator application' },
      { clue: 'lost device data', answer: 'Encryption' },
    ],
  },
  {
    id: 'os-commands',
    label: 'OS / Commands',
    summary: 'Windows、Linux、macOS、命令、文件系统和启动定位。',
    priority: 'High',
    signals: ['PowerShell', 'netstat', 'ipconfig', 'GPT', 'NTFS'],
    flow: [
      'Command clue -> whoami / net use / netstat / ipconfig',
      'Disk clue -> GPT / MBR / NTFS / exFAT',
      'Evidence clue -> Event Viewer / Services / Task Manager',
      'Boot clue -> UEFI / BIOS / OS Not Found',
    ],
    actions: ['Use Event Viewer', 'Run net use', 'Choose GPT + NTFS', 'Use chmod / sudo'],
    traps: ['Windows Server 不是 Windows 11', 'exFAT 是跨平台', 'MBR 不适合 4TB'],
    examples: [
      { clue: '4TB SSD five partitions', answer: 'GPT + NTFS' },
      { clue: 'shared drive mapping', answer: 'net use' },
      { clue: 'which user am I', answer: 'whoami' },
    ],
  },
  {
    id: 'app-troubleshooting',
    label: 'Software Troubleshooting',
    summary: '浏览器、应用、服务、更新、驱动和性能症状。',
    priority: 'High',
    signals: ['browser home page', 'BSOD', 'Print Spooler', '.NET Framework', 'license assignment'],
    flow: [
      'Browser hijack -> remove extensions + reset startup page',
      'Evidence clue -> Event Viewer / Services / Task Manager',
      'Repeat print issue -> set Print Spooler to Automatic',
      'Missing dependency -> Turn Windows features on or off',
      'Locked feature -> check license assignment',
    ],
    actions: ['Remove malicious extensions', 'Check Event Viewer', 'Set Print Spooler Automatic'],
    traps: ['重装应用不等于分配 license', '清 history 不会移除 extension', '重启不是长期修复'],
    examples: [
      { clue: 'browser search hijacked', answer: 'Uninstall malicious extensions' },
      { clue: 'daily print issue returns', answer: 'Start Print Spooler + Automatic' },
      { clue: 'features disabled after login', answer: 'License assignment' },
    ],
  },
  {
    id: 'ops-support',
    label: 'Ops / Support',
    summary: '变更、备份、文档、资产、合规和客户沟通。',
    priority: 'Medium',
    signals: ['SOP', 'CMDB', '3-2-1 backup', 'SDS', 'risk analysis'],
    flow: [
      'Change -> propose / risk analysis / sandbox testing',
      'Backup -> full backup + backup testing',
      'Docs -> SOP / CMDB / SDS / incident report',
      'Customer -> active listening / escalate',
    ],
    actions: ['Propose the change', 'Check CMDB', 'Test backups', 'Use active listening'],
    traps: ['SLA 是服务承诺', 'SOP 是步骤标准', 'NDA 管保密不是许可'],
    examples: [
      { clue: 'product owner and critical service', answer: 'CMDB' },
      { clue: 'backup must restore', answer: 'Full backup + backup testing' },
      { clue: 'battery backup safety sheet', answer: 'Emergency procedures' },
    ],
  },
  {
    id: 'remote-network',
    label: 'Remote / Network',
    summary: '远程接入、目录认证、共享、DNS 和网络命令。',
    priority: 'Medium',
    signals: ['VPN', 'RDP', 'VNC', 'SMB', 'RADIUS'],
    flow: [
      'Outside company -> VPN first',
      'Windows GUI -> RDP',
      'Linux GUI -> VNC',
      'Command line -> SSH',
      'AAA / directory -> RADIUS / LDAP / TACACS+',
    ],
    actions: ['Verify VPN status', 'Use RDP for Windows GUI', 'Use VNC for Linux GUI'],
    traps: ['VPN 是通道', 'RDP 是桌面会话', 'SSH 主要是命令行'],
    examples: [
      { clue: 'legacy Linux GUI support', answer: 'VNC' },
      { clue: 'work from home internal files', answer: 'VPN' },
      { clue: 'Windows server remote GUI', answer: 'RDP' },
    ],
  },
];

export const CORE2_CONFUSION_SETS = [
  {
    id: 'security-confusions',
    group: 'Security',
    moduleId: 'security',
    title: 'Security 易混答案',
    rows: [
      {
        cue: 'MFA identity proof',
        choose: 'Authenticator / TOTP',
        avoid: 'Sending a code is only one MFA method',
        terms: ['Authenticator', 'TOTP', 'Sending a code'],
      },
      {
        cue: 'Lost data or removable media',
        choose: 'Encryption / BitLocker To Go',
        avoid: 'Remote wipe depends on device access',
        terms: ['Encryption', 'BitLocker To Go'],
      },
      {
        cue: 'Confirmed malware incident',
        choose: 'Quarantine the infected systems',
        avoid: 'Clean install after containment fails',
        terms: ['Quarantine the infected systems', 'Clean install'],
      },
    ],
  },
  {
    id: 'os-confusions',
    group: 'OS',
    moduleId: 'os-commands',
    title: 'OS / Command 易混答案',
    rows: [
      {
        cue: 'Large disk or many partitions',
        choose: 'GPT + NTFS',
        avoid: 'MBR is older; exFAT is portable',
        terms: ['GPT', 'NTFS', 'MBR', 'exFAT'],
      },
      {
        cue: 'Windows evidence or active users',
        choose: 'Event Viewer / Task Manager',
        avoid: 'Device Manager points to device/driver',
        terms: ['Event Viewer', 'Task Manager', 'Device Manager'],
      },
      {
        cue: 'Domain policy or script clue',
        choose: 'gpresult / .ps1 / winver',
        avoid: 'whoami only shows current user',
        terms: ['gpresult', '.ps1', 'winver', 'whoami'],
      },
    ],
  },
  {
    id: 'apps-confusions',
    group: 'Apps',
    moduleId: 'app-troubleshooting',
    title: 'App 故障易混答案',
    rows: [
      {
        cue: 'Slow app or crash evidence',
        choose: 'Resource monitor / Event Viewer',
        avoid: 'Task Manager is process/user view',
        terms: ['Resource monitor', 'Event Viewer', 'Task Manager'],
      },
      {
        cue: 'Daily print service returns',
        choose: 'Print Spooler Automatic',
        avoid: 'Restart alone is temporary',
        terms: ['Print Spooler', 'Services'],
      },
      {
        cue: 'Paid feature disabled',
        choose: 'License assignment',
        avoid: 'Reinstall does not assign license',
        terms: ['License assignment', 'Reinstall'],
      },
    ],
  },
  {
    id: 'ops-confusions',
    group: 'Ops',
    moduleId: 'ops-support',
    title: 'Ops / Support 易混答案',
    rows: [
      {
        cue: 'Service owner or asset lookup',
        choose: 'CMDB',
        avoid: 'SOP is steps; Incident report is after event',
        terms: ['CMDB', 'SOP', 'Incident report'],
      },
      {
        cue: 'Change or project risk',
        choose: 'Risk analysis',
        avoid: 'AUP is acceptable-use policy',
        terms: ['Risk analysis', 'AUP'],
      },
      {
        cue: 'Safety or confidentiality',
        choose: 'SDS / NDA',
        avoid: 'Backup testing proves restore',
        terms: ['SDS', 'NDA', 'Backup testing'],
      },
    ],
  },
  {
    id: 'remote-confusions',
    group: 'Remote',
    moduleId: 'remote-network',
    title: 'Remote / Network 易混答案',
    rows: [
      {
        cue: 'Windows GUI from home',
        choose: 'RDP + VPN',
        avoid: 'SSH is command line; VNC fits Linux GUI',
        terms: ['RDP', 'VPN', 'SSH', 'VNC'],
      },
      {
        cue: 'AAA or directory lookup',
        choose: 'RADIUS / LDAP / TACACS+',
        avoid: 'SMB is file sharing',
        terms: ['RADIUS', 'LDAP', 'TACACS+', 'SMB'],
      },
      {
        cue: 'Name or web path issue',
        choose: 'DNS / proxy / ipconfig',
        avoid: 'RDP/VNC are remote sessions',
        terms: ['DNS', 'proxy', 'ipconfig', 'RDP', 'VNC'],
      },
    ],
  },
];

export const CORE2_SYMPTOM_MAP = [
  { symptom: 'Browser home page changed', answer: 'Malicious extensions', group: 'Apps' },
  { symptom: 'BSOD twice a day', answer: 'Event Viewer', group: 'OS' },
  { symptom: 'Lost phone, user unaware', answer: 'Encryption', group: 'Security' },
  { symptom: 'Server owner lookup', answer: 'CMDB', group: 'Ops' },
  { symptom: 'Remote Windows PC', answer: 'RDP + VPN', group: 'Remote' },
  { symptom: 'Legacy Linux GUI', answer: 'VNC', group: 'Remote' },
  { symptom: '4TB SSD install', answer: 'GPT + NTFS', group: 'OS' },
  { symptom: 'Daily print report fails', answer: 'Print Spooler Automatic', group: 'Apps' },
  { symptom: 'AI limited training', answer: 'Bias', group: 'Security' },
  { symptom: 'Confidential external discussion', answer: 'NDA', group: 'Ops' },
  { symptom: 'MFA fails after travel', answer: 'Verify date and time settings', group: 'Security' },
  { symptom: 'Domain not found, ping works', answer: 'Change DNS settings', group: 'Remote' },
  { symptom: 'Current signed-in user', answer: 'whoami', group: 'OS' },
  { symptom: 'Mapped SMB shares', answer: 'net use', group: 'Remote' },
  { symptom: 'Background bandwidth usage', answer: 'netstat', group: 'OS' },
  { symptom: 'Lost removable media', answer: 'BitLocker To Go', group: 'Security' },
  { symptom: 'Contractor work hours', answer: 'Login restrictions', group: 'Ops' },
  { symptom: 'End-of-life switches', answer: 'Propose the change', group: 'Ops' },
  { symptom: 'Internal works, external web fails', answer: 'Proxy settings', group: 'Remote' },
  { symptom: '.NET dependency missing', answer: 'Turn Windows features on or off', group: 'Apps' },
  { symptom: 'Paid app features disabled', answer: 'License assignment', group: 'Apps' },
  { symptom: 'Users install unauthorized apps', answer: 'Remove local admin rights', group: 'Security' },
  { symptom: 'Trust relationship failed', answer: 'Rejoin the device to the domain', group: 'Remote' },
  { symptom: '802.1X after long absence', answer: 'Expired certificate', group: 'Security' },
  { symptom: 'Backup must restore', answer: 'Full backup + backup testing', group: 'Ops' },
  { symptom: 'Management asks what happened', answer: 'Incident report', group: 'Ops' },
  { symptom: 'Token auth for network devices', answer: 'TACACS+', group: 'Remote' },
  { symptom: 'Directory user lookup', answer: 'LDAP', group: 'Remote' },
  { symptom: 'Trusted download blocked', answer: 'SmartScreen', group: 'Security' },
  { symptom: 'MSDS battery backup', answer: 'Emergency procedures', group: 'Ops' },
  { symptom: 'OS security updates stop', answer: 'End of life', group: 'Ops' },
  { symptom: '800 custom images', answer: 'Network-based remote installation', group: 'Ops' },
  { symptom: 'Ticket misses contact asset issue', answer: 'Standard operating procedures', group: 'Ops' },
  { symptom: 'Data unrecoverable, reuse drive', answer: 'Low-level format', group: 'Ops' },
  { symptom: 'Many workstations OS install', answer: 'Image deployment', group: 'Ops' },
  { symptom: 'Rack UPS batteries', answer: 'Lifting techniques', group: 'Ops' },
  { symptom: '3-2-1 backup rule', answer: 'Use two different types of media', group: 'Ops' },
  { symptom: 'Customer panicking data loss', answer: 'Project confidence', group: 'Ops' },
  { symptom: 'Text message social engineering', answer: 'Smishing', group: 'Security' },
  { symptom: 'Exploit before patch', answer: 'Zero-day', group: 'Security' },
  { symptom: 'Unsecured same SSID', answer: 'Rogue wireless access point', group: 'Security' },
  { symptom: 'Rogue AP tricks users', answer: 'Evil twin', group: 'Security' },
  { symptom: 'Shared smartphone passcodes', answer: 'Facial recognition', group: 'Security' },
  { symptom: 'Password-cracking app on phone', answer: 'Deploy MDM', group: 'Security' },
  { symptom: 'MFA code to phone', answer: 'Sending a code', group: 'Security' },
  { symptom: 'Offboarding checklist', answer: 'Deactivate key fobs and suspend email', group: 'Security' },
  { symptom: 'Files demand payment', answer: 'Ransomware', group: 'Security' },
  { symptom: 'Downloaded app legitimacy', answer: 'Compare the hash value', group: 'Security' },
  { symptom: 'High computing resource malware', answer: 'Cryptominer', group: 'Security' },
  { symptom: 'Forced entry building', answer: 'Bollard', group: 'Security' },
  { symptom: 'OS Not Found after USB', answer: 'Check boot options', group: 'OS' },
  { symptom: 'Linux admin command', answer: 'su', group: 'OS' },
  { symptom: 'Linux filesystem', answer: 'ext4', group: 'OS' },
  { symptom: 'Windows login automation', answer: '.bat', group: 'OS' },
  { symptom: 'Linux to Windows USB disk', answer: 'exFAT', group: 'OS' },
  { symptom: 'Rename administrator account', answer: 'lusrmgr.msc', group: 'OS' },
  { symptom: 'Windows 11 upgrade blocked', answer: 'Missing TPM module', group: 'OS' },
  { symptom: 'Disable guest log-ins', answer: 'Group Policy', group: 'OS' },
  { symptom: 'No operating system found', answer: 'Repair the MBR', group: 'OS' },
  { symptom: 'Speech recognition setting', answer: 'Ease of Access', group: 'Apps' },
  { symptom: 'Application slows no crash', answer: 'Resource monitor', group: 'Apps' },
  { symptom: 'Mobile OS upgrade app fails', answer: 'Update failed software', group: 'Apps' },
  { symptom: 'Outdated browser images', answer: 'Internet Options', group: 'Apps' },
  { symptom: 'Spreadsheet not responding', answer: 'File size and memory utilization', group: 'Apps' },
  { symptom: 'Smartphone battery drains', answer: 'Background applications', group: 'Apps' },
  { symptom: '32-bit or 64-bit OS', answer: 'Intel i7 CPU', group: 'Apps' },
  { symptom: 'Credential manager safeguard', answer: 'Secure master password', group: 'Apps' },
  { symptom: 'Push notification identity', answer: 'Authenticator', group: 'Security' },
  { symptom: 'HD video connection timeout', answer: 'Bandwidth is not fast enough', group: 'Remote' },
  { symptom: 'Legacy OS map network drive', answer: 'Batch', group: 'OS' },
  { symptom: 'Different computers locations', answer: 'Roaming profiles', group: 'Apps' },
  { symptom: 'Home router limit internet connections', answer: 'Disable UPnP', group: 'Remote' },
  { symptom: 'OS boots only with USB', answer: 'Enable UEFI devices in BIOS', group: 'OS' },
  { symptom: 'AAA for network services', answer: 'RADIUS', group: 'Remote' },
  { symptom: 'VPN client bug update', answer: 'Delete hidden network adapters', group: 'Remote' },
  { symptom: 'IP addressing information', answer: 'DHCP services not enabled', group: 'Remote' },
  { symptom: 'BitLocker To Go training', answer: 'Password-protect removable media', group: 'Security' },
  { symptom: 'Restricted areas access', answer: 'Badge readers', group: 'Security' },
  { symptom: 'Malware incident verified', answer: 'Quarantine infected systems', group: 'Security' },
  { symptom: 'Windows 10 to 11 keep data', answer: 'In-place upgrade', group: 'OS' },
  { symptom: 'Internet browsing policy', answer: 'Content filtering', group: 'Apps' },
  { symptom: 'Permitted resource activities', answer: 'AUP', group: 'Ops' },
  { symptom: 'Undisclosed added software', answer: 'Potentially unwanted program', group: 'Security' },
  { symptom: 'AI false facts', answer: 'Hallucinations', group: 'Apps' },
  { symptom: 'Apple corporate restrictions', answer: 'Management profile', group: 'Remote' },
  { symptom: 'Baseline images network boot', answer: 'PXE', group: 'Ops' },
  { symptom: 'Large spreadsheet cannot open', answer: 'Increase RAM', group: 'Apps' },
  { symptom: 'RAM storage transport', answer: 'Antistatic bags', group: 'Apps' },
  { symptom: 'Troubleshooting unable to resolve', answer: 'Escalate to senior technician', group: 'Ops' },
  { symptom: 'Cloud suite external threats', answer: 'Multifactor authentication', group: 'Security' },
  { symptom: 'Ad click remote connection', answer: 'Quarantine the system', group: 'Security' },
  { symptom: 'Traffic outside host and network', answer: 'XDR', group: 'Security' },
  { symptom: 'Airport Wi-Fi pop-up', answer: 'Reconnect and read the pop-up', group: 'Apps' },
  { symptom: 'Multiple endpoints target one', answer: 'Distributed denial of service', group: 'Security' },
  { symptom: 'Slide deck link does not work', answer: 'Viewing and sharing permissions', group: 'Apps' },
  { symptom: 'Touch pad not physically damaged', answer: 'Device Manager', group: 'OS' },
  { symptom: 'Mobile upload works on Wi-Fi', answer: 'Check data usage limit', group: 'Apps' },
  { symptom: 'Batch file hibernation settings', answer: 'powercfg', group: 'OS' },
  { symptom: 'Malware removal fails', answer: 'Clean install', group: 'Security' },
  { symptom: 'Carbon fiber filament', answer: 'Air filter mask', group: 'Apps' },
  { symptom: 'Third-party incident protection', answer: 'MDR', group: 'Security' },
  { symptom: 'View single file Linux terminal', answer: 'cat', group: 'OS' },
  { symptom: 'Remote collaboration training', answer: 'Videoconferencing', group: 'Remote' },
  { symptom: 'Anti-piracy program closes', answer: 'USB key not plugged in', group: 'Apps' },
  { symptom: 'Crashes after OS patch', answer: 'Roll back updates', group: 'Apps' },
  { symptom: 'Hot phone after ad app', answer: 'Mobile malware scan', group: 'Security' },
  { symptom: 'Webcam driver causes BSOD', answer: 'Safe mode and roll back driver', group: 'Apps' },
  { symptom: 'Documents stored on network', answer: 'Folder redirection', group: 'Remote' },
  { symptom: 'Frequent credential prompts', answer: 'Single sign-on', group: 'Security' },
  { symptom: 'Slow smartphone apps', answer: 'Restart the phone', group: 'Apps' },
  { symptom: 'macOS password storage', answer: 'Keychain', group: 'Security' },
  { symptom: 'Verify installer integrity', answer: 'Hash', group: 'Security' },
  { symptom: 'Forgotten password login', answer: 'Windows Hello', group: 'Security' },
  { symptom: 'Pop-ups unexpected sounds', answer: 'Quarantine the machine', group: 'Security' },
  { symptom: 'Workstation hardening', answer: 'Disable guest and change admin password', group: 'Security' },
  { symptom: 'Successor to NTFS', answer: 'ReFS', group: 'OS' },
  { symptom: 'Secure cell phone unlock', answer: 'Passphrase', group: 'Security' },
  { symptom: 'Phone slow in office only', answer: 'Degraded network service', group: 'Remote' },
  { symptom: 'Potential malware clicked gift card', answer: 'Disconnect Ethernet connection', group: 'Security' },
  { symptom: 'Customer explains issues', answer: 'Avoid personal interruptions', group: 'Ops' },
  { symptom: 'macOS app installers', answer: '.pkg .dmg .app', group: 'OS' },
  { symptom: 'Shared drive prevent deletion', answer: 'File Explorer', group: 'OS' },
  { symptom: 'Antivirus update cannot install', answer: 'Missing system files', group: 'Apps' },
  { symptom: 'Remote Desktop active users', answer: 'Task Manager', group: 'OS' },
  { symptom: 'Minimum permissions necessary', answer: 'Least privilege', group: 'Security' },
  { symptom: 'Unique user hardening', answer: 'Fingerprint', group: 'Security' },
  { symptom: 'Join a domain OS', answer: 'Windows 11 Pro', group: 'OS' },
  { symptom: 'Adware pop-ups after scan', answer: 'Clear browser cache and history', group: 'Apps' },
  { symptom: 'Shoulder surfing threat', answer: 'Social engineering', group: 'Security' },
  { symptom: 'Look up DNS records', answer: 'dig', group: 'Remote' },
  { symptom: 'Deployment instructions reference', answer: 'Internal wiki', group: 'Ops' },
  { symptom: 'Open case unexpected noise', answer: 'Disconnect the power', group: 'Apps' },
  { symptom: 'Support roles responsibilities', answer: 'SOP', group: 'Ops' },
  { symptom: 'Install uninstall software only', answer: 'Power user', group: 'Security' },
  { symptom: 'Avoid licensing fees OS', answer: 'Linux', group: 'OS' },
  { symptom: 'Escalated junior technician', answer: 'Ask open-ended questions', group: 'Ops' },
  { symptom: 'Roaming profile slow', answer: 'Home folder large files', group: 'OS' },
  { symptom: 'Domain settings not applying', answer: 'gpresult', group: 'OS' },
  { symptom: 'Administrators elevated permissions', answer: 'PAM', group: 'Security' },
  { symptom: 'Coordinate with another department', answer: 'Explain collaboration need', group: 'Ops' },
  { symptom: 'Patch breaks critical app', answer: 'Uninstall and block the patch', group: 'Apps' },
  { symptom: 'Travel phone no data', answer: 'Enable cellular data', group: 'Remote' },
  { symptom: 'Online document missing locally', answer: 'Synchronize remote folder', group: 'Apps' },
  { symptom: 'Software sends data remote server', answer: 'Spyware', group: 'Security' },
  { symptom: 'Packet reaches server', answer: 'traceroute', group: 'Remote' },
  { symptom: 'Humidity prevents damage', answer: 'Prevent static discharge', group: 'Apps' },
  { symptom: 'Two-person admin control', answer: 'Insider threat', group: 'Security' },
  { symptom: 'Classified hard drive destruction', answer: 'Degaussing and physical shredding', group: 'Ops' },
  { symptom: 'Allocate shared folder', answer: 'mkdir', group: 'OS' },
  { symptom: 'Certificate date error', answer: 'Incorrect NTP settings', group: 'Apps' },
  { symptom: 'Unsigned PowerShell script', answer: '.ps1', group: 'OS' },
  { symptom: 'After malware remediation', answer: 'User education', group: 'Ops' },
  { symptom: 'Emergency cable hazard', answer: 'Cable management removes a hazard', group: 'Ops' },
  { symptom: 'System time accuracy', answer: 'Kerberos token', group: 'Security' },
  { symptom: 'Malware not detected', answer: 'Outdated definitions', group: 'Security' },
  { symptom: 'Prevent malware and disclosure', answer: 'Threat education', group: 'Ops' },
  { symptom: 'macOS unsigned app warning', answer: 'Privacy', group: 'Apps' },
  { symptom: 'Regulated drive expunge', answer: 'Certified third-party destruction', group: 'Ops' },
  { symptom: 'Service unexpectedly stopped', answer: 'Service account is locked out', group: 'Apps' },
  { symptom: 'Website point of failure', answer: 'tracert', group: 'Remote' },
  { symptom: 'Wrist strap purpose', answer: 'Ground electrostatic charge', group: 'Apps' },
  { symptom: 'Unapproved generative AI product', answer: 'Escalate to legal approval', group: 'Ops' },
  { symptom: 'Validate Windows IP settings', answer: 'ipconfig', group: 'Remote' },
  { symptom: 'Attach wrist strap', answer: 'Connect to metal frame', group: 'Apps' },
  { symptom: 'Linux manage files', answer: 'cp', group: 'OS' },
  { symptom: 'Verify downloaded files unchanged', answer: 'Hashing', group: 'Security' },
  { symptom: 'Install blocked on work laptop', answer: 'Incorrectly configured ACL', group: 'Security' },
  { symptom: 'Frustrated customer already called', answer: 'Listen and acknowledge frustration', group: 'Ops' },
  { symptom: 'macOS trash uninstall', answer: '.app', group: 'OS' },
  { symptom: 'Information exfiltration', answer: 'DLP', group: 'Security' },
  { symptom: 'Delete protected partitions', answer: 'Elevated command-line prompt', group: 'OS' },
  { symptom: 'Remote switch commands', answer: 'SSH', group: 'Remote' },
  { symptom: 'Mobile game still crashes', answer: 'Reinstall the application', group: 'Apps' },
  { symptom: 'Compromised machines fake purchases', answer: 'DDoS', group: 'Security' },
  { symptom: 'EOL software security consequence', answer: 'New vulnerabilities not patched', group: 'Ops' },
  { symptom: 'MFA user code', answer: 'TOTP', group: 'Security' },
  { symptom: 'Output OS name to file', answer: 'winver', group: 'OS' },
  { symptom: 'ERP project scope identified', answer: 'Risk analysis', group: 'Ops' },
  { symptom: 'Prior issue resolved before', answer: 'Review ticketing system', group: 'Ops' },
  { symptom: 'Client demands immediate resolution', answer: 'Active listening and priority assurance', group: 'Ops' },
];

export const CORE2_SYMPTOM_GROUPS = [
  { group: 'Security', id: 'symptom-group-security', label: 'Security / Malware', moduleId: 'security' },
  { group: 'OS', id: 'symptom-group-os', label: 'OS / Commands', moduleId: 'os-commands' },
  { group: 'Apps', id: 'symptom-group-apps', label: 'Software Troubleshooting', moduleId: 'app-troubleshooting' },
  { group: 'Ops', id: 'symptom-group-ops', label: 'Ops / Support', moduleId: 'ops-support' },
  { group: 'Remote', id: 'symptom-group-remote', label: 'Remote / Network', moduleId: 'remote-network' },
];

export const CORE2_HIGH_YIELD_TERMS = [
  'mfa',
  'totp',
  'bitlocker',
  'encryption',
  'ransomware',
  'quarantine',
  'hash',
  'dlp',
  'event viewer',
  'gpt',
  'ntfs',
  'mbr',
  'gpresult',
  'ipconfig',
  'netstat',
  'whoami',
  'print spooler',
  'resource monitor',
  'license assignment',
  'cmdb',
  'backup',
  'risk analysis',
  'sop',
  'incident report',
  'vpn',
  'rdp',
  'vnc',
  'ssh',
  'dns',
  'radius',
  'ldap',
  'tacacs',
  'proxy',
];

export function getCore2SymptomGroup(group) {
  return CORE2_SYMPTOM_GROUPS.find((item) => item.group === group);
}

export function isCore2HighYieldPattern(row) {
  const text = [
    row?.symptom,
    row?.answer,
    row?.group,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return CORE2_HIGH_YIELD_TERMS.some((term) => text.includes(term));
}

export function getCore2SymptomId(row) {
  const source = typeof row === 'string' ? row : row?.symptom;
  const slug = String(source ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `symptom-${slug || 'pattern'}`;
}

function compactCore2Text(value, maxLength) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(0, maxLength - 3))}...`;
}

export function buildCore2DecisionMnemonic(row, maxLength = 76) {
  const symptom = String(row?.symptom ?? '').trim();
  const answer = String(row?.answer ?? '').trim();
  const prefix = '\u770b ';
  const arrow = ' -> \u9009 ';
  const fullText = `${prefix}${symptom}${arrow}${answer}`;
  if (fullText.length <= maxLength) return fullText;

  const fixedLength = prefix.length + arrow.length;
  const answerLimit = Math.min(32, Math.max(14, Math.floor((maxLength - fixedLength) * 0.42)));
  const symptomLimit = Math.max(16, maxLength - fixedLength - answerLimit);
  const compact = `${prefix}${compactCore2Text(symptom, symptomLimit)}${arrow}${compactCore2Text(answer, answerLimit)}`;
  if (compact.length <= maxLength) return compact;

  const finalAnswerLimit = Math.max(12, maxLength - fixedLength - symptomLimit);
  return `${prefix}${compactCore2Text(symptom, symptomLimit)}${arrow}${compactCore2Text(answer, finalAnswerLimit)}`;
}

export function getCore2ModuleSnapshot(moduleId, maxItems = 3) {
  const group = CORE2_SYMPTOM_GROUPS.find((item) => item.moduleId === moduleId);
  const rows = CORE2_SYMPTOM_MAP.filter((row) => row.group === group?.group);

  return {
    group,
    count: rows.length,
    mnemonics: rows
      .slice(0, maxItems)
      .map((row) => ({
        id: getCore2SymptomId(row),
        text: buildCore2DecisionMnemonic(row),
      })),
  };
}
