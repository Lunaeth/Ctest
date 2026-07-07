const focus = (text) => ({ level: 'focus', label: '重点', text });
const general = (text) => ({ level: 'general', label: '一般', text });

export const NETWORK_OVERVIEW = {
  title: 'Network 总排障顺序',
  summary: 'A+ Network 题先按层级定位，再选对应动作。不要把 DNS、DHCP、VLAN、VPN、port forwarding 混在一起选。',
  workflow: [
    '先看 physical link（物理连接）：网线、端口、灯、AP 覆盖、PoE 是否正常。',
    '再看 local network（二层/三层）：VLAN、IP address、subnet mask、default gateway、DHCP 是否正确。',
    '隔离部门/广播域 → VLAN；不同 VLAN/subnet 互通 → routing/default gateway/Layer 3 switch。',
    '能通 IP 但名称/网页不对时，看 DNS / proxy settings。',
    '服务本身连不上时，看 TCP/UDP port、firewall rule、port forwarding、netstat。',
    '能上网但访问公司资源失败时，看 VPN、RADIUS、802.1X、ACL、content filtering 等策略。',
  ],
  operations: [
    'ipconfig /all：看 IP、subnet mask、gateway、DNS、DHCP lease。',
    'ping：先测 local gateway，再测 remote IP，判断基础连通。',
    'tracert / pathping：看流量卡在哪一跳，定位 routing/path 问题。',
    'nslookup：查 DNS 解析；能 ping IP 不能访问 hostname 时优先用。',
    'netstat：看本机 network connections，判断服务/端口是否建立。',
    '检查 router/switch/AP：gateway、VLAN/port、wireless coverage/channel。',
  ],
  examRule: '地址→DHCP/IP/gateway；名称→DNS；跨网段→routing；端口→firewall；限制→VPN/RADIUS/ACL。',
};

export const NETWORK_PORT_REFERENCE = [
  {
    port: '21',
    service: 'FTP',
    function: 'file transfer（文件传输）；题库问 file transfer 直接选 21。',
    clue: 'file transfer / FTP',
    memory: 'FTP 先背 21；看到 file transfer 和数字题，先扫 21。',
  },
  {
    port: '22',
    service: 'SSH',
    function: 'secure remote shell（安全远程命令行）；比 Telnet 安全。',
    clue: 'secure remote connectivity',
    memory: '22 是安全远程；安全题别把 SSH 当成要禁用的第一选项。',
  },
  {
    port: '23',
    service: 'Telnet',
    function: 'insecure remote CLI（不安全远程命令行）；安全题优先 disable。',
    clue: 'disable to increase security',
    memory: '23 = Telnet = 明文；看到 disable remote connectivity 选 23。',
  },
  {
    port: '25',
    service: 'SMTP',
    function: 'send email（发送邮件）；scan-to-email 题库答案是 SMTP。',
    clue: 'scan-to-email / SMTP',
    memory: 'SMTP 有 S = Send；打印机发邮件就找 SMTP。',
  },
  {
    port: '53',
    service: 'DNS',
    function: 'name lookup（名称解析）；把 hostname/domain 解析成 IP。',
    clue: 'domain cannot be found',
    memory: 'DNS = Directory for Names；名字错找 DNS，不找 gateway。',
  },
  {
    port: '68',
    service: 'DHCP client',
    function: 'receive IP lease（拿地址租约）；DHCP 自动分配 IP。',
    clue: 'automatic IP assignment',
    memory: 'DHCP 管自动拿 IP；APIPA 169.254 就回头查 DHCP。',
  },
  {
    port: '110',
    service: 'POP3',
    function: 'old mail download（旧式收信）；题库要求升级到 IMAP 同步。',
    clue: 'port 110 email',
    memory: '110 是旧收信；要自动同步就选 IMAP。',
  },
  {
    port: '137',
    service: 'NetBIOS',
    function: 'legacy name service（旧式名称服务）；RDP 题里的干扰项。',
    clue: 'remote desktop distractor',
    memory: '137 不是远程桌面；RDP 只盯 3389。',
  },
  {
    port: '389',
    service: 'LDAP',
    function: 'directory query（目录查询）；常和 authentication 题放一起。',
    clue: 'LDAP / directory',
    memory: 'LDAP = directory；账号目录/查询想到 389。',
  },
  {
    port: '445',
    service: 'SMB',
    function: 'file share（文件共享）；scan-to-folder/SMB 选 network share。',
    clue: 'SMB / fileshare',
    memory: 'SMB = Share；scan-to-folder 和 fileshare 先找 SMB。',
  },
  {
    port: '3389',
    service: 'RDP',
    function: 'Remote Desktop（远程桌面）；防火墙放行远程桌面看它。',
    clue: 'remote desktop',
    memory: 'RDP 很长就背 3389；远程桌面数字题直接锁定。',
  },
];

export const NETWORK_PORT_MEMORY_RULES = [
  '文件传输数字题：FTP → 21。',
  '远程：SSH 22 安全；Telnet 23 明文要禁用；RDP 3389。',
  '邮件：SMTP 发送；POP3 110 旧收信；同步题选 IMAP。',
  '名字/地址：DNS 53 管名称；DHCP 68 管自动拿 IP。',
  '共享：SMB 445 管 fileshare；scan-to-folder 常选 SMB。',
  '目录认证：LDAP 389 是 directory，不是 file transfer。',
];

export const NETWORK_LAYERS = [
  {
    id: 'physical',
    label: 'RJ45 / Cabling',
    title: '物理层：线缆、端口、走线',
    summary: '先确认有没有物理连接，网线、墙口、配线架、端口和 PoE 是否正常。',
    coreConcept: 'Physical：先确认线缆、端口、PoE、墙口。物理层不通时，DNS/DHCP/VLAN 都救不了。',
    knowledge: [
      focus('cable tester 测线；toner probe 寻线；loopback plug 测端口；crimper 压 RJ45。'),
      focus('PoE 给 AP / IP phone / camera 供电；题库常见 PoE switch / PoE injector。'),
      focus('plenum-rated cable 用在 drop ceiling / shared air space。'),
      general('Cat 6、fiber、coaxial、plenum-rated 都是题库线缆词。'),
      general('patch panel / wall jack 是被动布线；switch port 才是活跃端口。'),
    ],
    operations: [
      '查 link light、网线、wall jack / patch panel。',
      'port flapping 换端口仍在时，换 patch cable。',
      '测线用 cable tester；寻线用 toner probe。',
      '布线经过吊顶共享空气空间时选 plenum-rated cable。',
      'PoE 设备不亮：查 PoE switch / injector。',
    ],
    answerPatterns: [
      '“Unlabeled wall jack / unknown cable run” → toner probe / cable toner。',
      '“Is this cable wired correctly?” → cable tester。',
      '“Need to terminate RJ45” → crimper。',
      '“AP/IP phone/camera needs power over Ethernet” → PoE switch or PoE injector。',
      '“Cable above drop ceiling / shared air space” → plenum-rated cable。',
    ],
    signals: [
      'no link lights',
      'unlabeled network connection',
      'drop ceiling',
      'patch cable',
      'PoE device no power',
    ],
    traps: [
      'Cable tester 回答“线好不好”，toner probe 回答“线通到哪里”。',
      'Network tap 是抓包/监控，不是测线或寻线。',
    ],
  },
  {
    id: 'data-link',
    label: 'Switch / VLAN',
    title: '二层：Switch、MAC、VLAN',
    summary: '同一局域网内的交换、VLAN、MAC address、端口状态和二层分段问题。',
    coreConcept: 'Data Link：VLAN 是二层分段；不同 VLAN 互通要三层 routing，答案转向 router / Layer 3 switch。',
    knowledge: [
      focus('VLAN configuration / Port VLAN assignment → managed switch。'),
      focus('managed switch 可管端口/VLAN；unmanaged switch 即插即用。'),
      focus('multiple VLANs + minimum hardware + wire speed → Layer 3 switch。'),
      general('Switch 按 MAC address 转发；hub 是干扰项。'),
      general('port flapping 换 switch port 仍在 → 看 patch cable。'),
      general('duplex setting 是网络端口配置，不是 duplex printing。'),
    ],
    operations: [
      '配置 VLAN assignment / Port VLAN assignment。',
      '同 VLAN 不通：查 switch port、VLAN assignment、patch cable。',
      '查 port disabled、port flapping、duplex setting。',
      '多个 VLAN 需要互通时，用 router 或 Layer 3 switch 做 inter-VLAN routing。',
      'wire speed/minimum hardware → Layer 3 switch。',
      '低成本增加有线端口 → unmanaged switch。',
    ],
    answerPatterns: [
      '“Assign desktops to another VLAN” → configure VLAN on managed switch。',
      '“Port disabled / enable port / VLAN assignment” → managed switch。',
      '“Multiple VLANs need to communicate” → Layer 3 switch or router。',
      '“Separate accounting/sales broadcast traffic” → VLAN on managed switch。',
      '“Minimum hardware + wire speed inter-VLAN” → Layer 3 switch。',
      '“Home office needs more Ethernet ports” → unmanaged switch。',
    ],
    signals: [
      'VLAN configuration',
      'managed switch',
      'port disabled',
      'port flapping',
      'MAC address',
    ],
    traps: [
      'VLAN 是二层分段；不同 VLAN 互通又进入三层 routing。',
      '只创建 VLAN 不能让 VLAN 之间互通；互通还需要 default gateway/router/Layer 3 switch。',
      'MAC filtering 是访问控制，不是提升无线性能或减少干扰。',
    ],
  },
  {
    id: 'network-ip',
    label: 'IP / DHCP / Gateway',
    title: '三层：IP、DHCP、Gateway、Routing',
    summary: '地址、子网、默认网关、DHCP、路由和跨网段通信。',
    coreConcept: 'Network/IP：IP、subnet mask、default gateway、DHCP 决定地址和跨网段路径。',
    knowledge: [
      focus('169.254.x.x / APIPA → DHCP 问题。'),
      focus('Static IP 手动填 IP address、subnet mask、default gateway。'),
      focus('default gateway 负责去外网/其他 subnet。'),
      general('DHCP reservation 固定租约；exclusion 是地址池排除。'),
      general('tracert / traceroute / pathping 看路径；ping 看基础连通。'),
    ],
    operations: [
      '用 ipconfig /all 查看 DHCP、IP、gateway、DNS。',
      'IP 异常：renew DHCP lease 或改 static IP。',
      '跨网段不通时检查 default gateway、route、router/Layer 3 switch。',
      '固定地址：区分 static IP、DHCP reservation、exclusion。',
      'APIPA：查 DHCP server、scope、物理连接。',
    ],
    answerPatterns: [
      '“169.254.x.x / cannot obtain IP” → DHCP problem or renew lease。',
      '“Static IP must be manually set” → IP address + subnet mask + default gateway。',
      '“Printer always gets same IP through DHCP” → DHCP reservation。',
      '“Keep DHCP from handing out a range” → DHCP exclusion。',
      '“Different subnet cannot reach” → default gateway / router / Layer 3 switch。',
    ],
    signals: [
      '169.254.x.x',
      'DHCP services not enabled',
      'static IP address',
      'subnet mask',
      'default gateway',
      'different subnet',
    ],
    traps: [
      'DHCP reservation 是 DHCP server/router 端设置，不是客户端手动字段。',
      '能 ping IP 但 hostname 不行，通常不是 gateway，而是 DNS。',
    ],
  },
  {
    id: 'transport-port',
    label: 'Ports / Firewall / netstat',
    title: '传输层：端口、转发、防火墙放行',
    summary: '服务端口、TCP/UDP、port forwarding、port mapping 和 netstat connections。',
    coreConcept: 'Transport：IP 能通不代表服务端口通；看 firewall、port forwarding、netstat。',
    knowledge: [
      focus('port forwarding / port mapping → SOHO router 入站访问。'),
      focus('Firewall 控制 ping requests、RDP、SSH 等是否允许。'),
      focus('netstat 查看 network connections。'),
      general('Transport 层看 TCP/UDP port，不是 IP 地址本身。'),
      general('题库端口号看端口速记板；先背 21、23、389、3389。'),
    ],
    operations: [
      '用 netstat 查看 network connections。',
      '网络通但服务不通：查端口、服务、firewall rule。',
      'SOHO router 上限制从互联网打进内网，通常改 port forwarding/port mapping。',
      'RDP 3389、Telnet 23、FTP 21 是题库高收益端口。',
      '本机能用、远程不能用：查 firewall rule。',
    ],
    answerPatterns: [
      '“Allow remote desktop through firewall” → open/allow RDP 3389 rule。',
      '“Limit inbound internet connections” → port forwarding / port mapping。',
      '“Investigate connections on the laptop” → netstat。',
      '“Block ping replies on public Wi-Fi” → firewall ICMP rule。',
      '“IP works but app port fails” → firewall port / service。',
    ],
    signals: [
      'port forwarding',
      'port mapping',
      'firewall rule',
      'netstat',
      'network connections',
      'TCP/UDP',
    ],
    traps: [
      '端口不通不等于 DNS 错；DNS 负责名字，port/firewall 负责服务入口。',
      'Port forwarding 是边界路由器/NAT 动作，不是本机 IP 地址设置。',
    ],
  },
  {
    id: 'dns-app',
    label: 'DNS / Proxy',
    title: '应用配置：DNS、Proxy、名称解析',
    summary: '能通 IP 但名称/网页/域找不到时，优先看 DNS、proxy、应用配置。',
    coreConcept: 'DNS/App：能 ping IP 但 hostname/domain 不行，优先 DNS；网页代理题看 proxy。',
    knowledge: [
      focus('can ping IP but domain cannot be found → DNS settings。'),
      focus('DNS records：AAAA、CNAME、MX、TXT、SPF、DKIM、DMARC。'),
      focus('nslookup / dig 查 DNS records；flushdns 清 DNS cache。'),
      general('hostname / DNS suffix / DNS server 都是名字解析题眼。'),
      general('proxy settings / web proxy 影响外部网页访问。'),
    ],
    operations: [
      '用 nslookup / dig 查 DNS records。',
      '能 ping server/IP 但 domain cannot be found，优先改 DNS settings。',
      '企业要求 web proxy 时，按给定 proxy server 信息改浏览器/系统代理。',
      '内部网站打不开但外网正常时，检查 corporate DNS / internal DNS settings。',
      '解析旧地址：查 DNS record / DNS cache / DNS suffix。',
    ],
    answerPatterns: [
      '“Ping works, domain cannot be found” → change DNS settings。',
      '“Look up DNS records for remote host” → nslookup / dig。',
      '“Internal sites fail, external works” → corporate/internal DNS settings。',
      '“All workstations need web proxy information” → configure proxy settings。',
      '“Email authentication record” → DNS TXT record.',
    ],
    signals: [
      'can ping IP but not hostname',
      'domain cannot be found',
      'DNS settings',
      'DNS records',
      'proxy settings',
      'Cannot reach this page',
    ],
    traps: [
      'DNS 不是 default gateway；gateway 管出网路径，DNS 管名字。',
      'Proxy 不是 VPN；proxy 主要代理网页/应用流量，VPN 是进入远端内网。',
    ],
  },
  {
    id: 'wireless',
    label: 'Wireless / SSID / AP',
    title: '无线：SSID、AP、覆盖、信道',
    summary: 'Wi-Fi 信号、AP、SSID、信道、加密、干扰和无线覆盖。',
    coreConcept: 'Wireless：先看 AP 覆盖、channel、SSID、加密；同名假热点看 evil twin / rogue AP。',
    knowledge: [
      focus('weak signal / coverage → AP 数量或位置。'),
      focus('channel / channel width / 2.4GHz、5GHz、6GHz → Wi-Fi 性能。'),
      focus('same SSID + unsecured → rogue AP / evil twin。'),
      general('SSID、WPA3、WEP、SSID broadcasting 是无线配置词。'),
      general('Bluetooth、NFC、hotspot 是移动连接词，别和 AP 覆盖混。'),
    ],
    operations: [
      '弱信号：移动/增加 AP。',
      '拥挤/干扰：改 channel 或更换 AP。',
      '机场 Wi-Fi pop-up window 关闭：重新连接并仔细阅读 pop-up。',
      '同名不安全网络：识别 rogue AP / evil twin。',
      '只有一台异常：先看 client wireless adapter/driver。',
    ],
    answerPatterns: [
      '“Crowded wireless + WEP/default channel” → replace/upgrade AP。',
      '“Same SSID + unsecured; file share fails” → rogue AP / evil twin。',
      '“Airport Wi-Fi pop-up window closed” → reconnect and read the pop-up carefully。',
      '“Weak signal/dead zone” → move/add AP or improve coverage。',
      '“Only one laptop affected” → client wireless card/driver, not whole AP.',
    ],
    signals: [
      'weak signal',
      'SSID',
      'rogue AP',
      'same wireless network name',
      'default channel',
      'crowded networks',
      'airport Wi-Fi',
    ],
    traps: [
      'MAC filtering 是访问控制，不会解决 channel/interference/performance。',
      'Disable SSID broadcasting 不是性能优化，只是隐藏式安全。',
    ],
  },
  {
    id: 'access-policy',
    label: 'VPN / ACL / RADIUS',
    title: '访问策略：VPN、RADIUS、ACL、过滤',
    summary: '网络没坏，而是策略、认证、VPN、ACL、内容过滤或准入控制限制访问。',
    coreConcept: 'Access Policy：底层网络正常但被挡住时，看 VPN、RADIUS、802.1X、ACL、content filtering。',
    knowledge: [
      focus('work from home 访问公司资源 → VPN status。'),
      focus('802.1X + EAP-TLS 登录失败 → expired certificate。'),
      focus('ACL / content filtering / guest wireless → 访问策略。'),
      general('RADIUS 是 AAA；LDAP 是目录/服务账户题眼。'),
      general('RDP/VNC/SSH 是远程控制；VPN 是进入公司网络。'),
    ],
    operations: [
      '在家访问公司文件：确认 VPN。',
      '按网站类别阻止：content filtering。',
      '802.1X/EAP-TLS 失败：查 certificate。',
      '外部人员插大厅网口：disable lobby ports + guest wireless。',
      '能上网但不能进内部资源：查 VPN / ACL。',
    ],
    answerPatterns: [
      '“Work from home cannot access company files” → configure/connect VPN。',
      '“Website categories must be blocked on SOHO router” → content filtering。',
      '“AAA for network services” → RADIUS。',
      '“Directory database authenticates wireless users” → RADIUS / LDAP。',
      '“Lobby Ethernet contractors” → disable lobby ports + guest wireless.',
    ],
    signals: [
      'work from home',
      'VPN',
      'RADIUS',
      '802.1X',
      'content filtering',
      'ACL',
      'guest wireless',
    ],
    traps: [
      '能上网但不能访问公司资源，不一定是 IP 错，常是 VPN/ACL/策略。',
      'RADIUS 是 AAA；LDAP 是目录查询，不要混成同一个协议。',
    ],
  },
];

const LAYER_RULES = [
  {
    id: 'physical',
    weight: 10,
    patterns: [
      'cable tester',
      'toner probe',
      'cable toner',
      'loopback plug',
      'patch panel',
      'wall jack',
      'rj45',
      'plenum',
      'cabling',
      'ethernet cable',
      'patch cable',
      'crossover cable',
      'poe switch',
      'power over ethernet',
      'drop ceiling',
      'reroute',
      'underneath a carpet',
      'network cable',
    ],
    reason: '题干/答案在定位物理连接、线缆、墙口、配线架、PoE 或布线介质。',
  },
  {
    id: 'data-link',
    weight: 9,
    patterns: [
      'vlan',
      'mac address',
      'managed switch',
      'unmanaged switch',
      'switch port',
      'port vlan',
      'layer 3 switch',
      'layer three switch',
      'port flapping',
      'duplex',
      'spanning tree',
      'stp',
      'hub',
      'bridge',
    ],
    reason: '题干/答案在处理 LAN 内交换、VLAN、MAC、端口状态或二层分段。',
  },
  {
    id: 'transport-port',
    weight: 8,
    patterns: [
      'port forwarding',
      'port mapping',
      'open port',
      'network connections',
      'tcp',
      'udp',
      'netstat',
      'firewall rule',
      'firewall rules',
      'allow remote desktop',
      'ping requests',
      'icmp',
    ],
    reason: '题干/答案在处理服务端口、协议、端口转发或防火墙端口放行。',
  },
  {
    id: 'dns-app',
    weight: 8,
    patterns: [
      'dns',
      'dns settings',
      'dns records',
      'dns record',
      'nslookup',
      'dig',
      'hostname',
      'fqdn',
      'domain cannot be found',
      'domain controller',
      'srv record',
      'proxy',
      'proxy settings',
      'proxy server',
      'web proxy',
      'cannot reach this page',
    ],
    reason: '题干/答案在处理名称解析、域定位、浏览器代理或应用层网络配置。',
  },
  {
    id: 'wireless',
    weight: 7,
    patterns: [
      'wireless',
      'wi-fi',
      'wifi',
      'ssid',
      'access point',
      'ap ',
      'rogue ap',
      'wpa',
      'wpa2',
      'wpa3',
      'wep',
      'channel',
      'bluetooth',
      'nfc',
      'pop-up window',
      'airport',
      'signal',
    ],
    reason: '题干/答案在处理无线接入、SSID、AP、信道、加密、门户或短距离无线。',
  },
  {
    id: 'access-policy',
    weight: 7,
    patterns: [
      'vpn',
      'virtual private network',
      'radius',
      'ldap',
      '802.1x',
      'eap-tls',
      'nac',
      'network access control',
      'acl',
      'access control list',
      'content filter',
      'content filtering',
      'website categorization',
      'allow list',
      'block',
      'blocked',
      'guest wireless',
      'disable lobby ports',
      'public wi-fi',
      'remote access',
    ],
    reason: '题干/答案在处理访问策略、认证、VPN、ACL、准入控制或内容过滤。',
  },
  {
    id: 'network-ip',
    weight: 6,
    patterns: [
      'ip address',
      'static ip',
      'dhcp',
      'dhcp reservation',
      'dhcp lease',
      'apipa',
      '169.254',
      'subnet',
      'subnet mask',
      'default gateway',
      'gateway',
      'router',
      'routing',
      'route',
      'tracert',
      'traceroute',
      'pathping',
      'nat',
      'wan',
      'lan',
    ],
    reason: '题干/答案在处理 IP 地址、DHCP、子网、网关、路由或跨网段连通。',
  },
];

const EXCLUDE_PATTERNS = [
  'propose the change',
  'approve the change',
  'schedule the change',
  'implement the change',
  'change management',
  'safety data sheet',
  'standard operating procedure',
  'acceptable use policy',
];

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function includesPattern(source, pattern) {
  const normalizedPattern = normalizeText(pattern);
  if (!normalizedPattern) return false;

  if (/^[a-z0-9.+-]{2,8}$/.test(normalizedPattern)) {
    return new RegExp(`\\b${normalizedPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      .test(source);
  }

  return source.includes(normalizedPattern);
}

function getQuestionText(question) {
  return normalizeText([
    question.topic,
    question.stem,
    ...(question.options ?? []).map((option) => option.text),
  ].join(' '));
}

function getCorrectText(question) {
  const answerKeys = new Set(question.answer ?? []);
  return normalizeText((question.options ?? [])
    .filter((option) => answerKeys.has(option.key))
    .map((option) => `${option.key}. ${option.text}`)
    .join(' '));
}

function findMatches(source, patterns) {
  return patterns.filter((pattern) => includesPattern(source, pattern));
}

export function getCorrectAnswers(question) {
  const answerKeys = new Set(question.answer ?? []);
  return (question.options ?? [])
    .filter((option) => answerKeys.has(option.key))
    .map((option) => ({
      key: option.key,
      text: option.text,
      label: `${option.key}. ${option.text}`,
      explanationHtml: question.learning?.options?.find((item) => item.key === option.key)
        ?.explanationHtml,
      explanation: question.learning?.options?.find((item) => item.key === option.key)
        ?.explanation,
    }));
}

export function classifyNetworkQuestion(question) {
  const questionText = getQuestionText(question);
  const correctText = getCorrectText(question);

  if (!questionText || EXCLUDE_PATTERNS.some((pattern) => includesPattern(correctText, pattern))) {
    return null;
  }

  const scored = LAYER_RULES.map((rule) => {
    const correctMatches = findMatches(correctText, rule.patterns);
    const questionMatches = findMatches(questionText, rule.patterns);
    return {
      id: rule.id,
      reason: rule.reason,
      matches: [...new Set([...correctMatches, ...questionMatches])],
      score: correctMatches.length * (rule.weight + 7) + questionMatches.length * rule.weight,
    };
  })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  const best = scored[0];
  if (!best || best.score < 8) return null;

  const correctAnswers = getCorrectAnswers(question);
  if (!correctAnswers.length) return null;

  return {
    layerId: best.id,
    reason: best.reason,
    clues: best.matches.slice(0, 5),
    score: best.score,
  };
}

export function buildNetworkQuestionRows(banks = []) {
  return banks.flatMap((bank) => (bank.questions ?? []).map((question) => {
    const classification = classifyNetworkQuestion(question);
    if (!classification) return null;

    return {
      bankId: bank.id,
      bankLabel: bank.label,
      id: question.id,
      stem: question.stem,
      type: question.type,
      topic: question.topic,
      options: question.options ?? [],
      answer: question.answer ?? [],
      correctAnswers: getCorrectAnswers(question),
      analysis: question.analysis,
      learning: question.learning,
      ...classification,
    };
  })).filter(Boolean)
    .sort((left, right) => (
      NETWORK_LAYERS.findIndex((layer) => layer.id === left.layerId)
        - NETWORK_LAYERS.findIndex((layer) => layer.id === right.layerId)
      || left.bankLabel.localeCompare(right.bankLabel)
      || Number(left.id) - Number(right.id)
    ));
}
