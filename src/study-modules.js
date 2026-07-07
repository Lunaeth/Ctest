const CORE1_MODULES = [
  {
    id: 'networking',
    label: 'Networking',
    shortLabel: 'Networking',
    description: 'IP / DHCP / DNS / Wi-Fi / ports / SOHO router',
    keywords: [
      'network',
      'networking',
      'wireless',
      'wi-fi',
      'wifi',
      '802.11',
      'ssid',
      'wpa',
      'wpa2',
      'wpa3',
      'ip address',
      'ipv4',
      'ipv6',
      'subnet',
      'subnet mask',
      'default gateway',
      'gateway',
      'dhcp',
      'dns',
      'apipa',
      'nat',
      'vpn',
      'vlan',
      'router',
      'switch',
      'access point',
      'firewall',
      'ethernet',
      'tcp',
      'udp',
      'port',
      'protocol',
      'soho',
      'cable modem',
      'ont',
      'patch panel',
      'rj45',
      'cat5',
      'cat6',
    ],
  },
  {
    id: 'printers',
    label: 'Printers',
    shortLabel: 'Printers',
    description: 'laser / ADF / drum / fuser / toner / spooler',
    keywords: [
      'printer',
      'print',
      'printing',
      'laser printer',
      'inkjet',
      'thermal printer',
      'impact printer',
      'copy',
      'copies',
      'scan',
      'scans',
      'scanner',
      'fax',
      'faxes',
      'adf',
      'automatic document feeder',
      'document feeder',
      'scanner glass',
      'toner',
      'drum',
      'fuser',
      'corona wire',
      'transfer roller',
      'pickup roller',
      'pickup rollers',
      'duplex',
      'paper jam',
      'print queue',
      'spooler',
      'printer driver',
    ],
  },
  {
    id: 'hardware',
    label: 'Hardware',
    shortLabel: 'Hardware',
    description: 'PC parts / storage / cables / mobile / cloud basics',
    keywords: [
      'motherboard',
      'system board',
      'cpu',
      'processor',
      'ram',
      'memory',
      'sodimm',
      'storage',
      'ssd',
      'hdd',
      'nvme',
      'm.2',
      'sata',
      'raid',
      'gpu',
      'video card',
      'display',
      'monitor',
      'hdmi',
      'displayport',
      'dvi',
      'vga',
      'usb',
      'usb-c',
      'thunderbolt',
      'bluetooth',
      'nfc',
      'psu',
      'power supply',
      'battery',
      'bios',
      'uefi',
      'cmos',
      'firmware',
      'touchscreen',
      'digitizer',
      'keyboard',
      'screen',
      'cellular',
      'sim card',
      'gps',
      'mdm',
      'synchronization',
      'dock',
      'port replicator',
      'peripheral',
      'virtualization',
      'hypervisor',
      'virtual machine',
      'cloud',
      'iaas',
      'paas',
      'saas',
    ],
  },
  {
    id: 'troubleshooting',
    label: 'Troubleshooting',
    shortLabel: 'Troubleshooting',
    description: 'symptom -> cause -> safest next step',
    keywords: [
      'troubleshoot',
      'troubleshooting',
      'technician',
      'issue',
      'problem',
      'symptom',
      'cause',
      'determine',
      'resolve',
      'repair',
      'replace',
      'first',
      'next',
      'most likely',
      'best',
      'intermittent',
      'fails',
      'failure',
      'error',
      'no power',
      'does not power',
      'will not boot',
      'boot',
      'post',
      'beep',
      'overheat',
      'slow',
      'frozen',
      'cannot connect',
      'connectivity',
      'not feeding',
      'misfeed',
      'jam',
      'vertical line',
      'blank page',
      'faded',
      'artifact',
    ],
  },
];

const CORE2_MODULES = [
  {
    id: 'security',
    label: 'Security / Malware',
    shortLabel: 'Security',
    description: 'malware / MFA / encryption / access control',
    keywords: [
      { term: 'malware', weight: 7 },
      { term: 'virus', weight: 7 },
      { term: 'ransomware', weight: 8 },
      { term: 'spyware', weight: 8 },
      { term: 'cryptominer', weight: 8 },
      { term: 'pup', weight: 7 },
      { term: 'potentially unwanted program', weight: 8 },
      { term: 'phishing', weight: 7 },
      { term: 'smishing', weight: 8 },
      { term: 'vishing', weight: 8 },
      { term: 'whaling', weight: 8 },
      { term: 'shoulder surfing', weight: 7 },
      { term: 'social engineering', weight: 7 },
      { term: 'evil twin', weight: 8 },
      { term: 'rogue wireless access point', weight: 8 },
      { term: 'rogue ap', weight: 8 },
      { term: 'zero-day', weight: 8 },
      { term: 'ddos', weight: 8 },
      { term: 'mfa', weight: 7 },
      { term: 'multifactor authentication', weight: 7 },
      { term: 'totp', weight: 8 },
      { term: 'one-time password', weight: 7 },
      { term: 'authenticator application', weight: 7 },
      { term: 'radius', weight: 7 },
      { term: 'tacacs+', weight: 8 },
      { term: 'kerberos', weight: 7 },
      { term: '802.1x', weight: 7 },
      { term: 'certificate authority', weight: 7 },
      { term: 'trusted certificate', weight: 7 },
      { term: 'bitlocker', weight: 7 },
      { term: 'filevault', weight: 7 },
      { term: 'encryption', weight: 6 },
      { term: 'dlp', weight: 8 },
      { term: 'data loss prevention', weight: 8 },
      { term: 'remote wipe', weight: 7 },
      { term: 'facial recognition', weight: 7 },
      { term: 'biometric', weight: 6 },
      { term: 'pin authentication', weight: 6 },
      { term: 'screen timeout', weight: 5 },
      { term: 'uac', weight: 7 },
      { term: 'least privilege', weight: 7 },
      { term: 'privileged access management', weight: 7 },
      { term: 'just-in-time access', weight: 8 },
      { term: 'local administrator', weight: 6 },
      { term: 'disable the guest account', weight: 7 },
      { term: 'default administrator password', weight: 7 },
      { term: 'badge reader', weight: 7 },
      { term: 'key fobs', weight: 7 },
      { term: 'bollards', weight: 7 },
      { term: 'video surveillance', weight: 6 },
      { term: 'acl', weight: 6 },
      { term: 'permissions', weight: 5 },
      { term: 'trusted url', weight: 6 },
      { term: 'https-only mode', weight: 7 },
      { term: 'gatekeeper', weight: 7 },
      { term: 'smartscreen', weight: 7 },
      { term: 'privacy & security', weight: 7 },
    ],
  },
  {
    id: 'os-commands',
    label: 'OS / Commands',
    shortLabel: 'OS',
    description: 'Windows / Linux / macOS commands and filesystems',
    keywords: [
      { term: 'windows 10', weight: 4 },
      { term: 'windows 11', weight: 4 },
      { term: 'windows server', weight: 7 },
      { term: 'windows server 2022', weight: 8 },
      { term: 'linux', weight: 5 },
      { term: 'macos', weight: 5 },
      { term: 'android', weight: 4 },
      { term: 'ios', weight: 4 },
      { term: 'powershell', weight: 8 },
      { term: 'command prompt', weight: 7 },
      { term: 'terminal', weight: 6 },
      { term: 'shell script', weight: 8 },
      { term: '.sh', weight: 8 },
      { term: 'batch file', weight: 8 },
      { term: '.bat', weight: 8 },
      { term: 'netstat', weight: 8 },
      { term: 'ipconfig', weight: 8 },
      { term: 'tracert', weight: 8 },
      { term: 'traceroute', weight: 8 },
      { term: 'pathping', weight: 8 },
      { term: 'nslookup', weight: 8 },
      { term: 'dig', weight: 8 },
      { term: 'net use', weight: 8 },
      { term: 'whoami', weight: 8 },
      { term: 'hostname', weight: 8 },
      { term: 'winver', weight: 8 },
      { term: 'cat', weight: 7 },
      { term: 'ls', weight: 7 },
      { term: 'chmod', weight: 8 },
      { term: 'sudo', weight: 8 },
      { term: 'su', weight: 8 },
      { term: 'cp', weight: 7 },
      { term: 'xcopy', weight: 7 },
      { term: 'robocopy', weight: 7 },
      { term: 'chkdsk', weight: 7 },
      { term: 'event viewer', weight: 7 },
      { term: 'task manager', weight: 7 },
      { term: 'device manager', weight: 7 },
      { term: 'services', weight: 6 },
      { term: 'gpedit', weight: 8 },
      { term: 'gpedit.msc', weight: 8 },
      { term: 'lusrmgr', weight: 8 },
      { term: 'disk management', weight: 8 },
      { term: 'diskmgmt.msc', weight: 8 },
      { term: 'file explorer', weight: 6 },
      { term: 'registry', weight: 6 },
      { term: 'ntfs', weight: 8 },
      { term: 'refs', weight: 8 },
      { term: 'exfat', weight: 8 },
      { term: 'fat32', weight: 8 },
      { term: 'apfs', weight: 8 },
      { term: 'ext4', weight: 8 },
      { term: 'xfs', weight: 8 },
      { term: 'gpt', weight: 8 },
      { term: 'mbr', weight: 8 },
      { term: 'master boot record', weight: 8 },
      { term: 'partition', weight: 5 },
      { term: 'boot options', weight: 6 },
      { term: 'safe mode', weight: 7 },
      { term: 'hyper-v', weight: 7 },
      { term: 'domain', weight: 4 },
      { term: 'group policy', weight: 6 },
      { term: 'gpo', weight: 6 },
    ],
  },
  {
    id: 'app-troubleshooting',
    label: 'Software Troubleshooting',
    shortLabel: 'Apps',
    description: 'apps / browser / services / symptoms',
    keywords: [
      { term: 'application', weight: 5 },
      { term: 'app', weight: 4 },
      { term: 'browser', weight: 7 },
      { term: 'home page', weight: 7 },
      { term: 'startup page', weight: 7 },
      { term: 'pop-up', weight: 7 },
      { term: 'extension', weight: 7 },
      { term: 'internet options', weight: 8 },
      { term: 'trusted sites', weight: 7 },
      { term: 'cache', weight: 6 },
      { term: 'history', weight: 5 },
      { term: 'bsod', weight: 8 },
      { term: 'blue screen', weight: 8 },
      { term: 'slow', weight: 5 },
      { term: 'crash', weight: 6 },
      { term: 'freeze', weight: 6 },
      { term: 'resource monitor', weight: 8 },
      { term: 'performance monitor', weight: 7 },
      { term: 'background applications', weight: 7 },
      { term: 'background services', weight: 7 },
      { term: 'service', weight: 4 },
      { term: 'print spooler', weight: 8 },
      { term: 'spooler', weight: 8 },
      { term: 'driver', weight: 5 },
      { term: 'update the failed software', weight: 8 },
      { term: 'mobile os upgrade', weight: 7 },
      { term: 'factory reset', weight: 7 },
      { term: 'uninstall', weight: 6 },
      { term: 'license assignment', weight: 8 },
      { term: 'features are disabled', weight: 7 },
      { term: '.net framework', weight: 8 },
      { term: 'optional feature', weight: 8 },
      { term: 'system files', weight: 7 },
      { term: 'definitions', weight: 6 },
      { term: 'remote desktop services', weight: 7 },
      { term: 'smart screen', weight: 7 },
      { term: 'smartscreen', weight: 7 },
      { term: 'gatekeeper', weight: 6 },
      { term: 'privacy & security', weight: 6 },
      { term: '.pkg', weight: 7 },
      { term: '.dmg', weight: 7 },
      { term: '.app', weight: 7 },
      { term: 'installer', weight: 5 },
      { term: 'x86 installer', weight: 7 },
      { term: 'system update utility', weight: 7 },
    ],
  },
  {
    id: 'ops-support',
    label: 'Ops / Support',
    shortLabel: 'Ops',
    description: 'change / backup / documentation / support',
    keywords: [
      { term: 'change management', weight: 8 },
      { term: 'propose the change', weight: 8 },
      { term: 'approve the change', weight: 6 },
      { term: 'implement the change', weight: 6 },
      { term: 'risk analysis', weight: 8 },
      { term: 'sandbox testing', weight: 7 },
      { term: 'rollback', weight: 7 },
      { term: 'emergency change', weight: 8 },
      { term: 'sop', weight: 8 },
      { term: 'standard operating procedures', weight: 8 },
      { term: 'sla', weight: 7 },
      { term: 'aup', weight: 8 },
      { term: 'eula', weight: 7 },
      { term: 'nda', weight: 8 },
      { term: 'mnda', weight: 8 },
      { term: 'cmdb', weight: 8 },
      { term: 'asset', weight: 5 },
      { term: 'ticket', weight: 6 },
      { term: 'incident report', weight: 8 },
      { term: 'documentation', weight: 7 },
      { term: 'internal wiki', weight: 8 },
      { term: 'deployment instructions', weight: 8 },
      { term: 'backup', weight: 7 },
      { term: '3-2-1', weight: 8 },
      { term: 'backup testing', weight: 8 },
      { term: 'full backup', weight: 7 },
      { term: 'incremental backup', weight: 7 },
      { term: 'differential backup', weight: 7 },
      { term: 'data retention', weight: 7 },
      { term: 'chain of custody', weight: 8 },
      { term: 'certified third-party destruction', weight: 8 },
      { term: 'physical shredding', weight: 7 },
      { term: 'degaussing', weight: 7 },
      { term: 'low-level formatting', weight: 7 },
      { term: 'sds', weight: 8 },
      { term: 'msds', weight: 8 },
      { term: 'emergency procedures', weight: 8 },
      { term: 'lifting techniques', weight: 8 },
      { term: 'eol', weight: 7 },
      { term: 'end of life', weight: 7 },
      { term: 'user education', weight: 7 },
      { term: 'educate the end user', weight: 7 },
      { term: 'threat education', weight: 7 },
      { term: 'active listening', weight: 8 },
      { term: 'empathetic tone', weight: 8 },
      { term: 'collaboration', weight: 5 },
      { term: 'image deployment', weight: 7 },
      { term: 'zero-touch deployment', weight: 7 },
      { term: 'pxe', weight: 7 },
      { term: 'network-based remote installation', weight: 7 },
      { term: 'in-place upgrade', weight: 6 },
      { term: 'clean install', weight: 5 },
    ],
  },
  {
    id: 'remote-network',
    label: 'Remote / Network',
    shortLabel: 'Remote',
    description: 'VPN / RDP / VNC / DNS / SMB / remote support',
    keywords: [
      { term: 'vpn', weight: 8 },
      { term: 'virtual private network', weight: 8 },
      { term: 'rdp', weight: 8 },
      { term: 'remote desktop protocol', weight: 8 },
      { term: 'vnc', weight: 8 },
      { term: 'ssh', weight: 8 },
      { term: 'spice', weight: 7 },
      { term: 'rmm', weight: 7 },
      { term: 'winrm', weight: 7 },
      { term: 'remote support', weight: 7 },
      { term: 'remote access', weight: 7 },
      { term: 'work from home', weight: 6 },
      { term: 'working from home', weight: 6 },
      { term: 'domain cannot be found', weight: 7 },
      { term: 'domain membership', weight: 6 },
      { term: 'dns', weight: 7 },
      { term: 'dhcp', weight: 6 },
      { term: 'proxy', weight: 6 },
      { term: 'smb', weight: 8 },
      { term: 'shared drive', weight: 8 },
      { term: 'net use', weight: 8 },
      { term: 'wireless', weight: 5 },
      { term: 'radius', weight: 6 },
      { term: 'ldap', weight: 7 },
      { term: 'tacacs+', weight: 7 },
      { term: 'kerberos', weight: 5 },
      { term: 'port mapping', weight: 7 },
      { term: 'firewall', weight: 5 },
      { term: 'ipconfig', weight: 5 },
      { term: 'netstat', weight: 5 },
      { term: 'tracert', weight: 6 },
      { term: 'traceroute', weight: 6 },
      { term: 'pathping', weight: 6 },
      { term: 'ping', weight: 4 },
      { term: 'intranet', weight: 6 },
      { term: 'network access', weight: 6 },
      { term: 'windows web server', weight: 5 },
    ],
  },
];

const ALL_MODULE = {
  id: 'all',
  label: 'All Questions',
  shortLabel: 'All',
  description: 'Core 1 all study questions',
};

const CORE2_ALL_MODULE = {
  ...ALL_MODULE,
  description: 'Core 2 all high-frequency study questions',
};

const MAX_CORE2_TAGS = 3;
const MIN_CORE2_TAG_SCORE = 7;

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesKeyword(source, keyword) {
  const normalizedKeyword = normalizeText(keyword);
  if (!normalizedKeyword) return false;

  if (normalizedKeyword.includes(' ') || normalizedKeyword.startsWith('.')) {
    return source.includes(normalizedKeyword);
  }

  if (/^[a-z0-9+.-]{2,5}$/.test(normalizedKeyword)) {
    return new RegExp(`\\b${escapeRegExp(normalizedKeyword)}\\b`, 'i').test(source);
  }

  return source.includes(normalizedKeyword);
}

function normalizeWeightedKeyword(keyword) {
  if (typeof keyword === 'string') {
    return { term: keyword, weight: 1 };
  }

  return {
    term: keyword.term,
    weight: Number.isFinite(keyword.weight) ? keyword.weight : 1,
  };
}

function getCorrectAnswerSource(question) {
  const answerKeys = new Set(question.answer ?? []);
  return normalizeText((question.options ?? [])
    .filter((option) => answerKeys.has(option.key))
    .map((option) => option.text)
    .join(' '));
}

function scoreModule(questionSource, answerSource, module) {
  return module.keywords.reduce((score, keyword) => {
    const { term, weight } = normalizeWeightedKeyword(keyword);
    let nextScore = score;

    if (includesKeyword(questionSource, term)) nextScore += weight;
    if (includesKeyword(answerSource, term)) nextScore += weight * 2;

    return nextScore;
  }, 0);
}

function buildModuleStats(questions, modules, allModule, getTags) {
  const stats = [{ ...allModule, count: questions.length }, ...modules.map((module) => ({
    ...module,
    count: 0,
  }))];
  const moduleMap = new Map(stats.map((module) => [module.id, module]));

  for (const question of questions) {
    const tags = question.learning?.studyTags ?? getTags(question);
    for (const tag of tags) {
      const module = moduleMap.get(tag);
      if (module) module.count += 1;
    }
  }

  return stats;
}

export function getCore1StudyModules({ includeAll = false } = {}) {
  const modules = CORE1_MODULES.map((module) => ({ ...module }));
  return includeAll ? [{ ...ALL_MODULE }, ...modules] : modules;
}

export function getCore2StudyModules({ includeAll = false } = {}) {
  const modules = CORE2_MODULES.map((module) => ({ ...module }));
  return includeAll ? [{ ...CORE2_ALL_MODULE }, ...modules] : modules;
}

export function getQuestionStudySource(question) {
  return normalizeText([
    question.topic,
    question.stem,
    ...(question.options ?? []).map((option) => option.text),
  ].join(' '));
}

export function getCore1StudyTags(question) {
  const source = getQuestionStudySource(question);
  return CORE1_MODULES
    .filter((module) => module.keywords.some((keyword) => includesKeyword(source, keyword)))
    .map((module) => module.id);
}

export function getCore2StudyTags(question) {
  const source = getQuestionStudySource(question);
  const answerSource = getCorrectAnswerSource(question);
  const ranked = CORE2_MODULES
    .map((module, index) => ({
      id: module.id,
      score: scoreModule(source, answerSource, module),
      index,
    }))
    .filter((module) => module.score >= MIN_CORE2_TAG_SCORE)
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, MAX_CORE2_TAGS)
    .map((module) => module.id);

  if (ranked.length) return ranked;

  return ['app-troubleshooting'];
}

export function buildCore1ModuleStats(questions = []) {
  return buildModuleStats(questions, CORE1_MODULES, ALL_MODULE, getCore1StudyTags);
}

export function buildCore2ModuleStats(questions = []) {
  return buildModuleStats(questions, CORE2_MODULES, CORE2_ALL_MODULE, getCore2StudyTags);
}

export function getModuleById(moduleId) {
  return getCore1StudyModules({ includeAll: true }).find((module) => module.id === moduleId)
    ?? { ...ALL_MODULE };
}
