import {
  getCore1StudyTags,
  getCore2StudyTags,
} from './study-modules.js?v=20260707-core2-priority-feedback';

const TERM_RULES = [
  {
    patterns: ['document feeder', 'adf', 'automatic document feeder'],
    label: 'document feeder / ADF',
    zh: '自动送稿',
    role: '把纸张送过扫描组件，用copy（复印）、scan（扫描）fax（传真输入）',
    examClue: 'copy/scan 有线条、污点或歪斜，但普print（打印）正常',
  },
  {
    patterns: ['scanner glass', 'scan glass', 'flatbed glass'],
    label: 'scanner glass',
    zh: '扫描玻璃',
    role: '提供扫描/复印时的成像表面，脏污会在扫描结果上形成固定线条',
    examClue: 'copy/scan 出现固定竖线，print 正常',
  },
  {
    patterns: ['pickup rollers', 'pickup roller', 'feed rollers'],
    label: 'pickup rollers',
    zh: '搓纸',
    role: '把纸从纸盒送入 printer（打印机）走纸路',
    examClue: 'paper jam（卡纸）、misfeed（进纸失败）、not feeding paper（不进纸',
  },
  {
    patterns: ['corona wire', 'primary corona'],
    label: 'corona wire',
    zh: '电晕',
    role: 'laser printer（激光打印机）成像流程中给感光部件充',
    examClue: '整页偏淡、空白、充电类成像问题，通常影响实际打印输出',
  },
  {
    patterns: ['drum assembly', 'imaging drum', 'drum'],
    label: 'drum assembly',
    zh: '感光鼓组',
    role: '形成 toner（碳粉）图像并参与转印到纸张',
    examClue: '重复污点、竖线、ghosting（重影），并影响所有通过打印引擎输出的页',
  },
  {
    patterns: ['fuser', 'fuser assembly'],
    label: 'fuser',
    zh: '定影',
    role: 'heat（热）和 pressure（压力）toner（碳粉）固定到纸',
    examClue: '刚打印出来一擦就掉粉、smearing（涂抹）、toner not fused（未定影）',
  },
  {
    patterns: ['toner cartridge', 'toner'],
    label: 'toner',
    zh: '碳粉',
    role: '提供 laser printer（激光打印机）的成像粉末',
    examClue: '打印变淡、缺粉、低 toner 提示；不是扫描路径故障',
  },
  {
    patterns: ['transfer roller', 'transfer belt'],
    label: 'transfer roller',
    zh: '转印',
    role: 'drum（感光鼓）上toner image（碳粉图像）转移到纸',
    examClue: '页面图像转印不完整、空白区域或反复成像缺陷',
  },
  {
    patterns: ['print spooler', 'spooler'],
    label: 'Print Spooler',
    zh: '打印后台处理服务',
    role: '管理 print queue（打印队列）和等待发送到 printer job（任务）',
    examClue: '任务卡在 queue（队列）、清队列无效、重printer 后本机任务仍不释',
  },
  {
    patterns: ['printer driver', 'pcl driver', 'postscript driver', 'driver'],
    label: 'printer driver',
    zh: '打印机驱',
    role: 'OS（操作系统）正确使用 printer 功能和页面描述语言',
    examClue: '高级功能缺失、特定应用打印异常、换电脑/驱动后表现改',
  },
  {
    patterns: ['firmware'],
    label: 'firmware',
    zh: '固件',
    role: '运行在设备内部控制硬件功能，常用于修复设备漏洞、稳定性问题或内置功能缺陷',
    examClue: '厂商发布 security vulnerability（安全漏洞）、设备功bug 修复SOHO router/firewall 更新',
  },
  {
    patterns: ['dhcp reservation', 'reservation'],
    label: 'DHCP reservation',
    zh: 'DHCP 保留',
    role: '让同一台设备总是DHCP 获得固定 IP address（IP 地址',
    examClue: 'printer 需要固定地址，但仍由 DHCP 自动分配',
  },
  {
    patterns: ['dhcp'],
    label: 'DHCP',
    zh: '\u52a8\u6001\u4e3b\u673a\u914d\u7f6e\u534f\u8bae',
    role: '自动分配 IP address（IP 地址）、default gateway（默认网关）DNS（域名解析）',
    examClue: '自动获取地址，或 APIPA 169.254.x.x 表示没有拿到 DHCP 地址',
  },
  {
    patterns: ['dns'],
    label: 'DNS',
    zh: '域名解析',
    role: 'hostname/domain name（主机名/域名）解析成 IP address（IP 地址',
    examClue: 'ping IP 但打不开域名，或名称解析失败',
  },
  {
    patterns: ['apipa'],
    label: 'APIPA',
    zh: '自动专用 IP 地址',
    role: 'DHCP 不可用时自动生成 169.254.x.x 地址',
    examClue: '169.254.x.x 基本就是 DHCP 问题线索',
  },
  {
    patterns: ['default gateway', 'gateway'],
    label: 'default gateway',
    zh: '默认网关',
    role: '把本地网络以外的流量转发出去',
    examClue: '本地资源可访问，internet（互联网）不可访问',
  },
  {
    patterns: ['subnet mask', 'subnet'],
    label: 'subnet mask',
    zh: '子网掩码',
    role: '定义本机所network（网络）范围',
    examClue: '同网段通信异常、IP 配置不匹',
  },
  {
    patterns: ['vpn'],
    label: 'VPN',
    zh: '虚拟专用网络',
    role: '通过 encrypted tunnel（加密隧道）安全接入远程网络',
    examClue: '远程访问公司内网资源',
  },
  {
    patterns: ['rdp'],
    label: 'RDP',
    zh: '远程桌面协议',
    role: '远程操作 Windows graphical desktop（图形桌面）',
    examClue: '远程使用 Windows PC 桌面',
  },
  {
    patterns: ['ssh'],
    label: 'SSH',
    zh: '安全外壳协议',
    role: '加密执行远程 command line（命令行）管',
    examClue: 'Linux/网络设备命令行远程管',
  },
  {
    patterns: ['vnc'],
    label: 'VNC',
    zh: '虚拟网络计算',
    role: '远程查看并控graphical desktop（图形桌面）',
    examClue: '跨平台图形远控，尤其Linux GUI',
  },
  {
    patterns: ['hybrid cloud'],
    label: 'hybrid cloud',
    zh: '混合',
    role: '组合 private cloud/on-premises（私有云/本地）和 public cloud（公有云',
    examClue: 'data residency（数据驻留）、合规、本地控制加云弹',
  },
  {
    patterns: ['public cloud'],
    label: 'public cloud',
    zh: '公有',
    role: '使用云服务商共享基础设施',
    examClue: '降低自建硬件成本，但数据位置/控制权较',
  },
  {
    patterns: ['private cloud'],
    label: 'private cloud',
    zh: '私有',
    role: '为单一组织专用的云环境',
    examClue: '最高控制权和合规性，但成管理更多',
  },
  {
    patterns: ['iaas'],
    label: 'IaaS',
    zh: '基础设施即服',
    role: '云端提供 compute（计算）、storage（存储）networking（网络）',
    examClue: 'VM、网络、磁盘，用户仍管OS',
  },
  {
    patterns: ['paas'],
    label: 'PaaS',
    zh: '平台即服',
    role: '提供应用开发和运行平台',
    examClue: '开发者部署代码，不管理底OS',
  },
  {
    patterns: ['saas'],
    label: 'SaaS',
    zh: '软件即服',
    role: '通过云直接使用应用软',
    examClue: '邮箱、CRM、在线办公等现成应用',
  },
  {
    patterns: ['cmos battery'],
    label: 'CMOS battery',
    zh: '主板纽扣电池',
    role: '断电后保BIOS/UEFI（固件）设置和时',
    examClue: '断电后日时间丢失',
  },
  {
    patterns: ['ups'],
    label: 'UPS',
    zh: '不间断电',
    role: '断电时短时间供电并保护设',
    examClue: '停电保护；不会保存主板时钟设',
  },
  {
    patterns: ['ram', 'memory'],
    label: 'RAM',
    zh: '内存',
    role: '运行程序时的临时工作空间',
    examClue: '随机崩溃、POST beep、内存测试失',
  },
];

TERM_RULES.push(
  {
    patterns: ['modular power supply', 'modular psu'],
    label: 'modular power supply',
    zh: '模组化电',
    role: '只接需要的电源线，减少机箱内多余和可见internal cables（内部线缆）',
    examClue: '题干强调 minimal visible internal cables、clean cable management（理线）airflow（风道）',
  },
  {
    patterns: ['redundant power supply', 'redundant psu'],
    label: 'redundant power supply',
    zh: '冗余电源',
    role: '提供第二套电源模块，单个 PSU 故障时系统仍可继续运',
    examClue: 'server uptime（服务器在线）、fault tolerance（容错）、一个电源坏了不停机',
  },
  {
    patterns: ['high-efficiency power supply', '80 plus power supply'],
    label: 'high-efficiency power supply',
    zh: '高效率电',
    role: '提高电能转换效率，减waste heat（废热）和电',
    examClue: '节能、低发热0 PLUS；不等于防断电或减少线缆',
  },
  {
    patterns: ['uninterruptible power supply'],
    label: 'UPS',
    zh: '不间断电',
    role: '断电时用电池短时间供电，让设备安全关机或继续运行一段时',
    examClue: 'unexpected shutdowns（意外关机）、power outage（停电）、保data integrity（数据完整性）',
  },
  {
    patterns: ['wireless nic', 'wi-fi nic', 'wifi nic', 'nic'],
    label: 'NIC',
    zh: '网卡',
    role: '\u63d0\u4f9b network connectivity\uff08\u7f51\u7edc\u8fde\u63a5\uff09\uff1bwireless NIC \u7528\u4e8e Wi-Fi\uff0c\u65e0\u7ebf\u7f51\u5361\u4e0d\u8d1f\u8d23\u673a\u7bb1\u5185\u7535\u6e90/\u6570\u636e\u7ebf\u7406\u7ebf',
    examClue: '网络接入、无线连接、网卡故障；不是减少内部线缆的答',
  },
  {
    patterns: ['sata drive connections', 'sata connection', 'sata'],
    label: 'SATA',
    zh: '串行 ATA',
    role: '连接 HDD/SSD/光驱storage device（存储设备）的数据接',
    examClue: '硬盘数据线.5/3.5 英寸盘、SATA SSD；会增加一根数据线，不是最少线',
  },
  {
    patterns: ['liquid cooling', 'water cooling'],
    label: 'liquid cooling',
    zh: '水冷',
    role: '用液体循环带CPU/GPU 热量，改善高负载散热',
    examClue: 'overheating（过热）、thermal throttling（热降频）、高性能桌面散热',
  },
  {
    patterns: ['heat sink', 'heatsink', 'high-performance heat sink'],
    label: 'heat sink',
    zh: '散热',
    role: 'CPU/GPU 热量传导并散出去，降低温度避throttling（降频）',
    examClue: '3-D rendering、CPU/GPU overheating、系统因温度降频',
  },
  {
    patterns: ['cpu fan', 'case fan', 'fan'],
    label: 'fan',
    zh: '风扇',
    role: '推动空气流动来带走热量，配合 heat sink（散热器）工',
    examClue: '噪音、转速、过热、airflow（风道）',
  },
  {
    patterns: ['thermal paste', 'thermal compound'],
    label: 'thermal paste',
    zh: '导热硅脂',
    role: '填补 CPU heat sink 之间的微小空隙，提高热传',
    examClue: '更换散热CPU 后温度异常，或散热接触不',
  },
  {
    patterns: ['overheating', 'thermal throttling', 'throttling'],
    label: 'thermal throttling',
    zh: '热降',
    role: '设备过热时自动降低性能保护硬件',
    examClue: '高负载变慢D rendering 降频、温度过',
  },
  {
    patterns: ['cpu', 'processor'],
    label: 'CPU',
    zh: '处理',
    role: '执行通用计算任务，是 PC 的主要计算核',
    examClue: 'socket（插槽）、核线程、虚拟化支持、散热需',
  },
  {
    patterns: ['gpu', 'graphics card', 'video card'],
    label: 'GPU',
    zh: '图形处理',
    role: '处理图形渲染、视频输出和部分并行计算任务',
    examClue: '3D rendering、multiple displays（多显示器）、图像性能',
  },
  {
    patterns: ['motherboard', 'system board'],
    label: 'motherboard',
    zh: '主板',
    role: '连接 CPU、RAM、storage、expansion cards（扩展卡）和电源',
    examClue: 'form factor、socket、chipset、扩展槽或接口兼容',
  },
  {
    patterns: ['hdd', 'hard drive', 'hard disk'],
    label: 'HDD',
    zh: '机械硬盘',
    role: '用磁盘存储数据，容量大但机械部件较慢且怕震',
    examClue: '大容量低成本、机械噪音、坏道、较慢启',
  },
  {
    patterns: ['ssd', 'solid-state drive'],
    label: 'SSD',
    zh: '固态硬',
    role: 'flash memory（闪存）存储数据，速度快且无机械部',
    examClue: '提升启动/加载速度、无机械噪音、SATA SSD NVMe SSD',
  },
  {
    patterns: ['nvme', 'm.2'],
    label: 'NVMe / M.2',
    zh: '高速固态硬盘接',
    role: '通过 PCIe 通道提供高SSD 存储，常见外形是 M.2',
    examClue: '高storage、M.2 slot、PCIe lanes（PCIe 通道',
  },
  {
    patterns: ['pcie', 'pci express'],
    label: 'PCIe',
    zh: '高速扩展总线',
    role: '连接 GPU、NVMe SSD、NIC 等高速扩展设',
    examClue: 'x1/x4/x8/x16 插槽、显卡、NVMe、扩展卡',
  },
  {
    patterns: ['dimm'],
    label: 'DIMM',
    zh: '台式机内存条',
    role: '台式机常RAM module（内存模块）外形',
    examClue: 'desktop memory（台式机内存',
  },
  {
    patterns: ['sodimm'],
    label: 'SODIMM',
    zh: '笔记本内存条',
    role: '笔记本和小型设备常用的短RAM module',
    examClue: 'laptop memory（笔记本内存',
  },
  {
    patterns: ['ecc'],
    label: 'ECC RAM',
    zh: '纠错内存',
    role: '能检测并纠正部分 memory errors（内存错误），提高可靠',
    examClue: 'server/workstation、data integrity（数据完整性）、稳定性优',
  },
  {
    patterns: ['raid 0'],
    label: 'RAID 0',
    zh: '条带',
    role: '把数据分散到多块盘提升速度，但没有 redundancy（冗余）',
    examClue: '最高性能、无容错；任一磁盘坏都会丢数据',
  },
  {
    patterns: ['raid 1'],
    label: 'RAID 1',
    zh: '镜像',
    role: '两块盘保存相同数据，提供 redundancy（冗余）',
    examClue: '一块盘坏仍可运行，容量利用率约 50%',
  },
  {
    patterns: ['raid 5'],
    label: 'RAID 5',
    zh: '带奇偶校验的条带',
    role: '至少三块盘，兼顾容量和单盘容',
    examClue: '可容1 块盘故障，读性能较好',
  },
  {
    patterns: ['raid 6'],
    label: 'RAID 6',
    zh: '双奇偶校',
    role: '至少四块盘，可容忍两块盘故障',
    examClue: 'RAID 5 更高容错，但写入开销更大',
  },
  {
    patterns: ['raid 10', 'raid 1+0'],
    label: 'RAID 10',
    zh: '镜像加条',
    role: '结合 RAID 1 的冗余和 RAID 0 的性能',
    examClue: '性能和冗余都要，但需要至少四块盘',
  },
  {
    patterns: ['raid'],
    label: 'RAID',
    zh: '磁盘阵列',
    role: '把多块磁盘组合起来提performance（性能）、redundancy（冗余）或容',
    examClue: '磁盘容错、性能、阵列级别选择',
  },
  {
    patterns: ['san'],
    label: 'SAN',
    zh: '存储区域网络',
    role: '为服务器提供块级 block storage（块存储',
    examClue: '企业级共享存储、iSCSI/Fibre Channel、服务器磁盘',
  },
  {
    patterns: ['nas', 'network attached storage'],
    label: 'NAS',
    zh: '网络附加存储',
    role: '通过网络共享 file storage（文件存储）',
    examClue: '文件共享、SMB/NFS、多人访问共享文件夹',
  },
  {
    patterns: ['usb-c', 'usb c'],
    label: 'USB-C',
    zh: 'USB-C 接口',
    role: '可正反插USB 连接器，可承载数据、充电和视频 alt mode',
    examClue: 'new laptop connector、charging、dock、Thunderbolt 外形',
  },
  {
    patterns: ['usb'],
    label: 'USB',
    zh: '通用串行总线',
    role: '连接键盘、鼠标、存储、打印机、移动设备等外设',
    examClue: 'peripherals（外设）、速度代际、供电、设备权',
  },
  {
    patterns: ['thunderbolt'],
    label: 'Thunderbolt',
    zh: '高速外设接',
    role: '通过 USB-C 外形提供高速数据、视频和 docking（扩展坞）能',
    examClue: '高dock、外接显示器、外GPU/存储',
  },
  {
    patterns: ['hdmi'],
    label: 'HDMI',
    zh: '高清视频接口',
    role: '传输 digital video/audio（数字视音频）到显示器或电视',
    examClue: 'TV/monitor 音视频、常见家用显示连',
  },
  {
    patterns: ['displayport'],
    label: 'DisplayPort',
    zh: '数字显示接口',
    role: '连接显示器，常用PC 高刷新率或多显示器场',
    examClue: '高分辨率、高刷新率、商用显示器',
  },
  {
    patterns: ['vga'],
    label: 'VGA',
    zh: '模拟视频接口',
    role: '传输 analog video（模拟视频），不传音',
    examClue: '旧投影仪/旧显示器、蓝15 针接',
  },
  {
    patterns: ['dvi'],
    label: 'DVI',
    zh: '数字视频接口',
    role: '较旧的显示接口，可有数字或模拟变',
    examClue: '旧显示器，通常不传音频',
  },
  {
    patterns: ['lightning cable', 'lightning'],
    label: 'Lightning',
    zh: '苹果移动设备接口',
    role: '连接部分 iPhone/iPad 进行充电和数据传',
    examClue: 'older Apple mobile devices（较旧苹果移动设备）',
  },
  {
    patterns: ['bluetooth'],
    label: 'Bluetooth',
    zh: '蓝牙',
    role: '短距离无线连接外设和移动设备',
    examClue: 'headset、keyboard、mouse、PAN（个人区域网',
  },
  {
    patterns: ['nfc', 'near-field communication'],
    label: 'NFC',
    zh: '近场通信',
    role: '极短距离无线通信，常用于 tap-to-pay（碰触支付）和配',
    examClue: '手机靠近读卡器、contactless payment（非接触支付',
  },
  {
    patterns: ['rfid'],
    label: 'RFID',
    zh: '射频识别',
    role: '用标签和读卡器识别物品或人员',
    examClue: 'inventory tracking（库存追踪）、badge（工牌）',
  },
  {
    patterns: ['cellular'],
    label: 'cellular',
    zh: '蜂窝网络',
    role: '通过移动运营商网络提供数据连',
    examClue: 'LTE/5G、SIM/eSIM、无 Wi-Fi 时联',
  },
  {
    patterns: ['hotspot', 'tethering'],
    label: 'hotspot / tethering',
    zh: '热点/网络共享',
    role: '把手机蜂窝网络分享给其他设备使用',
    examClue: 'laptop 通过 phone 上网、mobile hotspot',
  },
  {
    patterns: ['access point'],
    label: 'access point',
    zh: '无线接入',
    role: 'wireless clients（无线客户端）接入有线网',
    examClue: '扩大 Wi-Fi 覆盖、SSID、企业无',
  },
  {
    patterns: ['router'],
    label: 'router',
    zh: '路由',
    role: '连接不同网络并转发流量，SOHO 中常兼任 NAT/DHCP/firewall',
    examClue: 'internet edge（互联网出口）、default gateway、NAT',
  },
  {
    patterns: ['managed switch'],
    label: 'managed switch',
    zh: '可管理交换机',
    role: '提供 VLAN、端口配置、监控等管理功能',
    examClue: 'VLAN、端口镜像、企业交换机配置',
  },
  {
    patterns: ['unmanaged switch'],
    label: 'unmanaged switch',
    zh: '不可管理交换',
    role: '即插即用扩展以太网端口，没有高级管理功能',
    examClue: '小型网络快速增加有线端',
  },
  {
    patterns: ['poe switch'],
    label: 'PoE switch',
    zh: '以太网供电交换机',
    role: '通过 Ethernet cable（网线）同时传输数据和供',
    examClue: 'IP phone、AP、camera 只用一根网线供',
  },
  {
    patterns: ['poe injector', 'poe'],
    label: 'PoE',
    zh: '以太网供',
    role: '在普通网线中加入电力给网络设备供',
    examClue: '没有 PoE switch 但要AP/camera 供电',
  },
  {
    patterns: ['switch'],
    label: 'switch',
    zh: '交换',
    role: '在局域网内按 MAC address（MAC 地址）转发以太网',
    examClue: '增加 LAN 端口、同网段设备互联',
  },
  {
    patterns: ['modem', 'cable modem', 'dsl'],
    label: 'modem',
    zh: '调制解调',
    role: 'ISP 接入线路转换为本地网络可用连',
    examClue: 'cable/DSL/satellite/fiber ISP 入口设备',
  },
  {
    patterns: ['ont'],
    label: 'ONT',
    zh: '光网络终',
    role: 'fiber optic（光纤）服务转换为以太网/电话等本地接',
    examClue: 'fiber internet（光纤互联网）入户设',
  },
  {
    patterns: ['fiber', 'fiber optic'],
    label: 'fiber',
    zh: '光纤',
    role: '用光传输数据，距离长、带宽高、抗电磁干扰',
    examClue: '长距离、高带宽、EMI 环境',
  },
  {
    patterns: ['coaxial', 'coax', 'f-type'],
    label: 'coaxial / F-type',
    zh: '同轴F 型接',
    role: '常用cable internet（有线电视宽带）和电视信',
    examClue: 'cable modem、墙上圆形螺纹接',
  },
  {
    patterns: ['ethernet', 'rj45', 'cat5', 'cat6'],
    label: 'Ethernet / RJ45',
    zh: '以太网线接口',
    role: '常见有线 LAN 连接方式，RJ45 是常见网线水晶头',
    examClue: 'wired network（有线网络）、patch cable、switch/router 端口',
  },
  {
    patterns: ['2.4ghz'],
    label: '2.4GHz Wi-Fi',
    zh: '2.4GHz 无线频段',
    role: '覆盖范围更远、穿墙较好，但速度较低且更容易拥堵',
    examClue: '远距离、老设备、干扰多',
  },
  {
    patterns: ['5ghz'],
    label: '5GHz Wi-Fi',
    zh: '5GHz 无线频段',
    role: '速度更高、干扰较少，但覆盖距离通常短于 2.4GHz',
    examClue: '更高吞吐、较近距离、较少拥',
  },
  {
    patterns: ['6ghz'],
    label: '6GHz Wi-Fi',
    zh: '6GHz 无线频段',
    role: 'Wi-Fi 6E/7 使用的新频段，信道更宽、干扰更',
    examClue: '新设备、高吞吐、短距离',
  },
  {
    patterns: ['wi-fi direct'],
    label: 'Wi-Fi Direct',
    zh: 'Wi-Fi 直连',
    role: '不经过路由器，让两个设备直接无线连接',
    examClue: '手机直连打印设备，peer-to-peer wireless',
  },
  {
    patterns: ['external interference', 'interference'],
    label: 'wireless interference',
    zh: '无线干扰',
    role: '其他无线设备、墙体或电磁源导致信号质量下',
    examClue: '信号时好时坏、速度慢、附近设微波蓝牙干扰',
  },
  {
    patterns: ['high latency', 'increased latency', 'latency'],
    label: 'latency',
    zh: '延迟',
    role: '数据往返所需时间，影响语音、视频会议和游戏体验',
    examClue: 'lag、delay、实时应用卡',
  },
  {
    patterns: ['vlan'],
    label: 'VLAN',
    zh: '虚拟局域网',
    role: '在交换机上逻辑隔离网络广播',
    examClue: '分隔部门/访客网络、managed switch 配置',
  },
  {
    patterns: ['lan'],
    label: 'LAN',
    zh: '局域网',
    role: '小范围本地网络，如家庭或办公室内部网',
    examClue: 'same office/home network（同一办公家庭网络',
  },
  {
    patterns: ['pan'],
    label: 'PAN',
    zh: '个人区域',
    role: '个人设备之间的短距离网络，常见技术是 Bluetooth',
    examClue: 'phone、watch、headset、个人外设连',
  },
  {
    patterns: ['static ip address', 'static'],
    label: 'static IP address',
    zh: '静态 IP 地址',
    role: '手动配置固定 IP，不依赖 DHCP 自动分配',
    examClue: 'server/printer 固定地址、地址不应变化',
  },
  {
    patterns: ['lease'],
    label: 'DHCP lease',
    zh: 'DHCP 租约',
    role: 'DHCP 分配给客户端IP 使用期限',
    examClue: 'renew/release、地址到期重新分配',
  },
  {
    patterns: ['exclusion'],
    label: 'DHCP exclusion',
    zh: 'DHCP 排除范围',
    role: '把部分地址DHCP 自动分配池中排除',
    examClue: '避免 DHCP 分配给静态地址设备',
  },
  {
    patterns: ['cname'],
    label: 'CNAME record',
    zh: 'DNS 别名记录',
    role: '把一hostname（主机名）作为另一个名称的 alias（别名）',
    examClue: 'www 指向另一个域名，别名而不IP',
  },
  {
    patterns: ['mx'],
    label: 'MX record',
    zh: '邮件交换记录',
    role: '指定 domain（域名）mail server（邮件服务器',
    examClue: 'email routing（邮件投递）',
  },
  {
    patterns: ['txt'],
    label: 'TXT record',
    zh: 'DNS 文本记录',
    role: 'DNS 中存放验证文本，常用SPF/DKIM/DMARC 等邮件安',
    examClue: 'domain verification（域名验证）、邮件反欺骗记录',
  },
  {
    patterns: ['aaaa'],
    label: 'AAAA record',
    zh: 'IPv6 地址记录',
    role: 'hostname 解析IPv6 address（IPv6 地址',
    examClue: 'IPv6 解析',
  },
  {
    patterns: ['a record', 'a'],
    label: 'A record',
    zh: 'IPv4 地址记录',
    role: 'hostname 解析IPv4 address（IPv4 地址',
    examClue: '网站域名指向 IPv4 地址',
  },
  {
    patterns: ['spf'],
    label: 'SPF',
    zh: '发件服务器授',
    role: '声明哪些 mail servers 可以代表域名发信',
    examClue: '防止 email spoofing（邮件伪造）',
  },
  {
    patterns: ['dkim'],
    label: 'DKIM',
    zh: '邮件签名验证',
    role: 'cryptographic signature（加密签名）验证邮件未被篡改且来自授权域',
    examClue: '邮件完整性、域名签',
  },
  {
    patterns: ['dmarc'],
    label: 'DMARC',
    zh: '邮件认证策略',
    role: '基于 SPF/DKIM 结果定义邮件处理策略并提供报',
    examClue: 'reject/quarantine policy、防邮件冒充',
  },
  {
    patterns: ['smtp'],
    label: 'SMTP',
    zh: '简单邮件传输协',
    role: '用于发email（电子邮件）',
    examClue: 'outgoing mail（发件）、端25/587/465',
  },
  {
    patterns: ['imap'],
    label: 'IMAP',
    zh: '互联网邮件访问协',
    role: '在服务器上同步和读取邮件，适合多设备访问',
    examClue: '邮件保留在服务器、多设备同步',
  },
  {
    patterns: ['ftp'],
    label: 'FTP',
    zh: '文件传输协议',
    role: '传输文件但默认不加密',
    examClue: 'legacy file transfer（旧式文件传输）',
  },
  {
    patterns: ['sftp'],
    label: 'SFTP',
    zh: '安全文件传输协议',
    role: '通过 SSH 加密传输文件',
    examClue: 'secure file transfer（安全文件传输）',
  },
  {
    patterns: ['smb', 'network share'],
    label: 'SMB',
    zh: '服务器消息块',
    role: 'Windows 常用 file/printer sharing（文打印共享）协',
    examClue: '共享文件夹、网络驱动器、Windows share',
  },
  {
    patterns: ['ldap'],
    label: 'LDAP',
    zh: '目录访问协议',
    role: '查询 directory service（目录服务）中的用户、组和设备信',
    examClue: 'Active Directory 查询、集中身份目',
  },
  {
    patterns: ['ntp'],
    label: 'NTP',
    zh: '网络时间协议',
    role: '通过网络同步系统时间',
    examClue: '时间同步、证认证依赖正确时间；不修复 CMOS 电池失效',
  },
  {
    patterns: ['firewall'],
    label: 'firewall',
    zh: '防火',
    role: '按规则允许或阻止 network traffic（网络流量）',
    examClue: '端口被阻断、访问控制、网络安全边',
  },
  {
    patterns: ['type 1 hypervisor'],
    label: 'Type 1 hypervisor',
    zh: '裸机虚拟化管理器',
    role: '直接运行在硬件上管理 virtual machines（虚拟机',
    examClue: 'enterprise virtualization、ESXi/Hyper-V Server 类场',
  },
  {
    patterns: ['type 2 hypervisor'],
    label: 'Type 2 hypervisor',
    zh: '宿主型虚拟化管理',
    role: '运行在普OS 上，用于本机创建虚拟',
    examClue: 'VirtualBox/VMware Workstation、桌面实验环',
  },
  {
    patterns: ['hypervisor'],
    label: 'hypervisor',
    zh: '虚拟化管理器',
    role: '创建和管virtual machines（虚拟机',
    examClue: 'multiple OS on one host（单机多系统）、VM 资源分配',
  },
  {
    patterns: ['vdi'],
    label: 'VDI',
    zh: '虚拟桌面基础设施',
    role: '集中托管 desktop environment（桌面环境），用户远程访问',
    examClue: '远程桌面池、集中管理用户桌',
  },
  {
    patterns: ['sandbox'],
    label: 'sandbox',
    zh: '沙箱',
    role: '隔离运行程序或测试环境，降低对生产系统的影响',
    examClue: '安全测试、隔离可疑应用、实验环',
  },
  {
    patterns: ['container', 'containers'],
    label: 'containers',
    zh: '容器',
    role: '打包应用和依赖，共享宿主 OS kernel（内核）运行',
    examClue: '轻量部署、应用隔离、比 VM 更轻',
  },
  {
    patterns: ['multitenancy'],
    label: 'multitenancy',
    zh: '多租',
    role: '多个客户共享同一云平台资源但逻辑隔离',
    examClue: 'public cloud provider（公有云服务商）共享基础设施',
  },
  {
    patterns: ['elasticity'],
    label: 'elasticity',
    zh: '弹',
    role: '按负载快速扩展或缩减资源',
    examClue: '自动扩缩容、按需资源',
  },
  {
    patterns: ['availability'],
    label: 'availability',
    zh: '可用',
    role: '系统保持可访问和可运行的能力',
    examClue: 'uptime、redundancy、failover',
  },
  {
    patterns: ['dedicated resources'],
    label: 'dedicated resources',
    zh: '专用资源',
    role: '资源只分配给一个客户或工作负载，不与他人共',
    examClue: '性能隔离、合规、避noisy neighbor',
  },
  {
    patterns: ['faas'],
    label: 'FaaS',
    zh: '函数即服',
    role: '按事件运行小段代码，无需管理服务',
    examClue: 'serverless function（无服务器函数）',
  },
  {
    patterns: ['cross-platform virtualization'],
    label: 'cross-platform virtualization',
    zh: '跨平台虚拟化',
    role: '在一种平台上运行另一OS 或应用环',
    examClue: '运行不同 OS；不hybrid cloud 相比 public cloud 的主要优',
  },
  {
    patterns: ['data residency requirements', 'data residency'],
    label: 'data residency',
    zh: '数据驻留要求',
    role: '要求数据存放在指定国家、地区或本地环境',
    examClue: 'hybrid/private cloud、合规、数据位置限',
  },
  {
    patterns: ['reduce management overhead', 'management overhead'],
    label: 'management overhead',
    zh: '管理开销',
    role: '维护、配置、监控和运维系统所需的工作量',
    examClue: 'public cloud 通常降低自管硬件和平台运',
  },
  {
    patterns: ['biometrics'],
    label: 'biometrics',
    zh: '生物识别',
    role: '用指纹、面部等身体特征进行 authentication（认证）',
    examClue: '手机解锁、MFA、fingerprint/face recognition',
  },
  {
    patterns: ['mdm', 'mobile device management'],
    label: 'MDM',
    zh: '移动设备管理',
    role: '集中管理手机/平板策略、配置、远程擦除和应用',
    examClue: 'BYOD、company mobile devices、remote wipe',
  },
  {
    patterns: ['digitizer'],
    label: 'digitizer',
    zh: '触控数字化层',
    role: '把触摸输入转换为设备可识别的信号',
    examClue: '屏幕显示正常但触摸无',
  },
  {
    patterns: ['battery'],
    label: 'battery',
    zh: '电池',
    role: '为移动设备或笔记本提供离线供',
    examClue: '不能充电、续航短、鼓包、突然关',
  },
  {
    patterns: ['antenna'],
    label: 'antenna',
    zh: '天线',
    role: '收发无线信号，影Wi-Fi/cellular/Bluetooth 连接质量',
    examClue: '信号弱、连接距离短、跌落后无线异常',
  },
  {
    patterns: ['wi-fi standard', 'wireless standard', 'outdated wi-fi standard'],
    label: 'Wi-Fi standard',
    zh: '无线标准',
    role: '决定设备支持的频段、速度和功',
    examClue: '老设备速度慢、无法连接新网络或不支持 5/6GHz',
  },
  {
    patterns: ['power settings'],
    label: 'power settings',
    zh: '电源设置',
    role: '控制节能、性能、睡眠和无线省电行为',
    examClue: '省电导致性能下降、无线断连或后台限制',
  },
  {
    patterns: ['usb permissions'],
    label: 'USB permissions',
    zh: 'USB 权限',
    role: '控制设备是否允许 USB 数据访问或外设连',
    examClue: '手机只充电不传数据、企业策略限USB',
  },
  {
    patterns: ['docking station', 'dock', 'port replicator'],
    label: 'dock / port replicator',
    zh: '扩展端口复制',
    role: '为笔记本集中扩展显示器、网络、USB 和电源连',
    examClue: 'one-cable desk setup（一线连接办公桌外设',
  },
  {
    patterns: ['cable tester'],
    label: 'cable tester',
    zh: '网线测试',
    role: '检测网线连通性、线序和断路/短路',
    examClue: '验证 Ethernet cable 是否正常',
  },
  {
    patterns: ['loopback plug'],
    label: 'loopback plug',
    zh: '回环插头',
    role: '测试端口自身发送和接收能力',
    examClue: '验证 NIC/serial port 端口硬件',
  },
  {
    patterns: ['toner probe'],
    label: 'toner probe',
    zh: '寻线',
    role: '沿线缆追踪对应端口或线缆路径',
    examClue: 'patch panel 或墙口找对应网线',
  },
  {
    patterns: ['crimper'],
    label: 'crimper',
    zh: '压线',
    role: 'RJ45 等连接头压接到网线上',
    examClue: '制作 Ethernet patch cable（水晶头网线',
  },
  {
    patterns: ['cable stripper'],
    label: 'cable stripper',
    zh: '剥线',
    role: '剥开线缆外皮，准备端',
    examClue: '制作或修复网线前处理外皮',
  },
  {
    patterns: ['punchdown tool', 'punchdown'],
    label: 'punchdown tool',
    zh: '打线工具',
    role: '把双绞线压入 patch panel keystone jack（模块）',
    examClue: '配线架、墙面网络模块端',
  },
  {
    patterns: ['patch panel'],
    label: 'patch panel',
    zh: '配线',
    role: '集中端接和管理多条网络布',
    examClue: '机柜布线、墙口到交换机的线缆管理',
  },
  {
    patterns: ['network tap'],
    label: 'network tap',
    zh: '网络分流',
    role: '复制网络流量给监分析设备，不中断原连',
    examClue: 'packet capture（抓包）、安全监控、被动监听流',
  },
  {
    patterns: ['tpm', 'trusted platform module'],
    label: 'TPM',
    zh: '可信平台模块',
    role: '硬件安全芯片，存encryption keys（加密密钥）并支Secure Boot/BitLocker',
    examClue: 'disk encryption、hardware root of trust、Windows 安全要求',
  },
  {
    patterns: ['hsm'],
    label: 'HSM',
    zh: '硬件安全模块',
    role: '专用硬件保护和管cryptographic keys（加密密钥）',
    examClue: '企业密钥管理、高安全加密操作',
  },
  {
    patterns: ['secure boot'],
    label: 'Secure Boot',
    zh: '安全启动',
    role: '只允许受信任签名的启动组件运行，防止 boot malware（启动恶意软件）',
    examClue: 'UEFI 安全、阻止未签名 bootloader',
  },
  {
    patterns: ['bios password'],
    label: 'BIOS/UEFI password',
    zh: '固件密码',
    role: '限制进入 BIOS/UEFI 设置或启动设备更',
    examClue: '防止用户修改 boot order 或固件配',
  },
  {
    patterns: ['user authentication'],
    label: 'user authentication',
    zh: '用户认证',
    role: '验证用户身份后才允许访问系统或资',
    examClue: 'login、MFA、password/biometric',
  },
  {
    patterns: ['secure printing'],
    label: 'secure printing',
    zh: '安全打印',
    role: '用户到打印机前输PIN 或刷卡后才释放打印任',
    examClue: '保护敏感文件、共享打印机不让别人拿走输出',
  },
  {
    patterns: ['maintenance kit', 'install a maintenance kit', 'apply a maintenance kit'],
    label: 'printer maintenance kit',
    zh: '打印机维护套',
    role: '更换高磨损部件，rollers、fuser、transfer roller ',
    examClue: '达到页数寿命、频繁卡进纸问题、厂商维护提',
  },
  {
    patterns: ['printhead', 'clean the printhead'],
    label: 'printhead',
    zh: '喷头',
    role: 'inkjet printer（喷墨打印机）把墨水喷到纸上',
    examClue: '喷墨缺线、颜色缺失、需要清洁喷',
  },
  {
    patterns: ['ribbon', 'replace the ribbon'],
    label: 'ribbon',
    zh: '色带',
    role: 'impact printer（针击打式打印机）用色带成像',
    examClue: '针式打印变淡、色带耗尽',
  },
  {
    patterns: ['tray settings'],
    label: 'tray settings',
    zh: '纸盒设置',
    role: '告诉打印机纸张尺寸、类型和纸盒来源',
    examClue: '纸张尺寸/类型不匹配、从错误纸盒取纸',
  },
  {
    patterns: ['pcl'],
    label: 'PCL',
    zh: '打印机控制语言',
    role: 'HP 常见页面描述语言，驱动和打印机需匹配',
    examClue: '打印乱码、驱动语言不匹配、PostScript/PCL 选择',
  },
  {
    patterns: ['postscript'],
    label: 'PostScript',
    zh: '页面描述语言',
    role: '常用于图排版输出的打印描述语言',
    examClue: '特定应用或图形打印需要正driver/language',
  },
);

TERM_RULES.push(
  {
    patterns: ['syslog'],
    label: 'Syslog',
    zh: '系统日志服务',
    role: '集中收集 network hosts（网络主机）和设备产生的 event logs（事件日志）',
    examClue: 'collect events、logs from network-connected hosts、集中日',
  },
  {
    patterns: ['mail'],
    label: 'mail server',
    zh: '邮件服务',
    role: '处理 email（电子邮件）的发送、接收或邮箱访问',
    examClue: 'SMTP/IMAP/POP、send/receive email；不负责收集设备事件日志',
  },
  {
    patterns: ['print'],
    label: 'print server',
    zh: '\u6253\u5370\u670d\u52a1\u5668',
    role: '集中管理 printer（打印机）和 print queue（打印队列）',
    examClue: '共享打印机、打印队列、用户提交打印任',
  },
  {
    patterns: ['bios'],
    label: 'BIOS/UEFI',
    zh: '主板固件',
    role: '初始化硬件并启动 OS（操作系统），也保存 boot order（启动顺序）等设',
    examClue: 'POST、boot order、firmware settings；通常不是普通启动慢的首',
  },
  {
    patterns: ['flash the bios', 'bios update', 'run a bios update'],
    label: 'BIOS/UEFI update',
    zh: '固件更新',
    role: '更新主板固件以修复兼容性、安全或硬件支持问题',
    examClue: '厂商修复、硬件兼bug；不CMOS 电池没电的第一修法',
  },
  {
    patterns: ['charging port', 'connection port', 'clean the connection port'],
    label: 'charging port',
    zh: '充电接口',
    role: '让移动设备通过 cable（线缆）充电和传输数据；脏污或损坏会导致线缆插入方向敏感或无法识',
    examClue: '某一台设备识别线缆异常、翻转线缆才可用、其他同型号设备正常',
  },
  {
    patterns: ['device needs to be restarted', 'restart the computer', 'restart'],
    label: 'restart',
    zh: '重启',
    role: '清除临时软件状态并重新加载 OS/服务',
    examClue: '临时软件卡死可先重启；硬件接口脏/坏通常不会靠重启稳定修',
  },
  {
    patterns: ['cable is failing', 'replace the cable', 'replace the hdmi cable', 'cable'],
    label: 'cable',
    zh: '线缆',
    role: '连接设备并承载数据、视频或电力，损坏会导致连接不稳',
    examClue: '多设备都出问题、换线后恢复；若只有某台设备异常，先怀疑该设备接口',
  },
  {
    patterns: ['data roaming', 'enabling data roaming'],
    label: 'data roaming',
    zh: '数据漫游',
    role: '允许手机在本国运营商网络以外使用移动数据',
    examClue: 'international travel（国际旅行）时能打电话但 email/data 不',
  },
  {
    patterns: ['gps', 'global positioning system'],
    label: 'GPS',
    zh: '全球定位系统',
    role: '提供位置定位，不提供 email/mobile data（移动数据）连接',
    examClue: '地图定位、导航；不是国际漫游邮件无法收发的修',
  },
  {
    patterns: ['4g', 'configuring 4g usage only'],
    label: '4G setting',
    zh: '4G 网络设置',
    role: '限制手机只使4G/LTE 网络',
    examClue: '5G/4G 覆盖或兼容性问题；不等于开启国际数据漫',
  },
  {
    patterns: ['public ip address'],
    label: 'public IP address',
    zh: '公网 IP 地址',
    role: '可在互联网路由的地址，用于从外部访问设备或服',
    examClue: 'internet-facing service、NAT、外网可',
  },
  {
    patterns: ['public'],
    label: 'public cloud',
    zh: '公有',
    role: '使用云服务商共享基础设施，降低自建硬件和平台管理',
    examClue: 'shared provider infrastructure、lower management overhead',
  },
  {
    patterns: ['private'],
    label: 'private cloud',
    zh: '私有',
    role: '为单一组织专用，控制权和合规能力更',
    examClue: 'highest control、compliance、dedicated environment',
  },
  {
    patterns: ['hybrid'],
    label: 'hybrid cloud',
    zh: '混合',
    role: '结合 public cloud private/on-premises 环境',
    examClue: 'data residency、合规、本地保留敏感数据同时使用公有云弹',
  },
  {
    patterns: ['community'],
    label: 'SNMP community string',
    zh: 'SNMP 团体字符',
    role: 'SNMP v1/v2c 中类似共享密码，用于读取或管理网络设备信',
    examClue: 'monitoring network devices、SNMP polling、community string',
  },
  {
    patterns: ['satellite'],
    label: 'satellite internet',
    zh: '卫星互联',
    role: '通过卫星链路提供网络，覆盖广latency（延迟）通常',
    examClue: 'remote/rural location（偏远地区）、高延迟',
  },
  {
    patterns: ['oled'],
    label: 'OLED',
    zh: '有机发光二极管显示屏',
    role: '每个像素自发光，黑色表现好、对比度',
    examClue: 'mobile display、deep blacks、burn-in 风险',
  },
  {
    patterns: ['1920x1080'],
    label: '1920x1080',
    zh: '1080p 分辨',
    role: 'Full HD 显示分辨',
    examClue: '基础高清显示；比 4K/8K 像素',
  },
  {
    patterns: ['3840x2160'],
    label: '3840x2160',
    zh: '4K UHD 分辨',
    role: '4K 显示分辨率，像素数高1080p',
    examClue: '4K monitor/TV、高清晰度显',
  },
  {
    patterns: ['7680x4320'],
    label: '7680x4320',
    zh: '8K UHD 分辨',
    role: '8K 显示分辨率，像素数高4K',
    examClue: '8K display、最高分辨率选项',
  },
  {
    patterns: ['2048x1080'],
    label: '2048x1080',
    zh: '2K/DCI 分辨',
    role: '1080p 略宽的影2K 分辨',
    examClue: '投影/显示分辨率比',
  },
  {
    patterns: ['input voltage'],
    label: 'input voltage',
    zh: '输入电压',
    role: '电源可接受的墙插电压范围',
    examClue: '国际旅行10V/220V、电源兼容',
  },
  {
    patterns: ['unbuffered'],
    label: 'unbuffered RAM',
    zh: '非缓冲内',
    role: '普PC 常见内存类型，没register/buffer 芯片',
    examClue: 'consumer desktop/laptop memory；不同于 server registered memory',
  },
  {
    patterns: ['badging'],
    label: 'badging',
    zh: '刷卡/工牌认证',
    role: 'badge（工牌）识别用户或释放资',
    examClue: 'secure printing、门禁、刷卡取',
  },
  {
    patterns: ['firewire'],
    label: 'FireWire',
    zh: 'IEEE 1394 接口',
    role: '较旧的高速外设接口，曾常用于摄像机和音视频设',
    examClue: 'legacy camcorder/audio equipment',
  },
  {
    patterns: ['psu', 'power supply'],
    label: 'PSU',
    zh: '电源供应',
    role: '把交流电转换PC 组件使用的直流电',
    examClue: 'no power、随机关机、电源容效率/模组',
  },
  {
    patterns: ['arm'],
    label: 'ARM',
    zh: 'ARM 架构',
    role: '低功耗处理器架构，常见于手机、平板和部分笔记',
    examClue: 'mobile devices、battery efficiency、不CPU architecture',
  },
  {
    patterns: ['dynamic'],
    label: 'dynamic assignment',
    zh: '动态分',
    role: 'DHCP 或系统自动分配地址/资源',
    examClue: '自动获取 IP，而不是手static 配置',
  },
  {
    patterns: ['redundancy', 'redundant'],
    label: 'redundancy',
    zh: '冗余',
    role: '通过备用组件或副本降低单点故障风',
    examClue: 'fault tolerance、availability、RAID/power/network backup',
  },
  {
    patterns: ['802.1', '802.1x'],
    label: '802.1X',
    zh: '端口级网络认',
    role: '在有线或无线接入前进行用设备认证',
    examClue: 'enterprise Wi-Fi、RADIUS、port authentication',
  },
  {
    patterns: ['21'],
    label: 'port 21',
    zh: 'FTP 控制端口',
    role: 'FTP 的默认控制连接端',
    examClue: 'FTP file transfer',
  },
  {
    patterns: ['53'],
    label: 'port 53',
    zh: 'DNS 端口',
    role: 'DNS 查询常用 UDP/TCP 53',
    examClue: 'name resolution（名称解析）',
  },
  {
    patterns: ['68'],
    label: 'port 68',
    zh: 'DHCP 客户端端',
    role: 'DHCP client 接收地址配置常用 UDP 68',
    examClue: 'DHCP client/server 使用 67/68',
  },
  {
    patterns: ['389'],
    label: 'port 389',
    zh: 'LDAP 端口',
    role: 'LDAP 默认端口，用于目录查',
    examClue: 'directory service、Active Directory 查询',
  },
  {
    patterns: ['bitlocker'],
    label: 'BitLocker',
    zh: 'Windows 磁盘加密',
    role: '加密 Windows 磁盘，常结合 TPM 保护密钥',
    examClue: 'full-disk encryption、TPM、Windows data protection',
  },
  {
    patterns: ['pin code', 'pin'],
    label: 'PIN',
    zh: '个人识别',
    role: '短数字码，用于认证或释放 secure print job',
    examClue: 'secure printing、mobile unlock、MFA factor',
  },
  {
    patterns: ['keystone', 'adjust the keystone'],
    label: 'keystone correction',
    zh: '梯形校正',
    role: '校正投影画面因角度造成的梯形变',
    examClue: 'projector image trapezoid（投影画面梯形）',
  },
  {
    patterns: ['projector bulb', 'replace the bulb', 'bulb'],
    label: 'projector bulb',
    zh: '投影灯泡',
    role: '投影仪光源，老化会导致画面变暗或无法显示',
    examClue: 'dim projector image、lamp hours、replace bulb',
  },
  {
    patterns: ['projector filter', 'clean the projector filter', 'clean the filter'],
    label: 'projector filter',
    zh: '投影仪滤',
    role: '阻挡灰尘进入投影仪，堵塞会导致过',
    examClue: 'projector overheating、dust、clean filter',
  },
  {
    patterns: ['gamma'],
    label: 'gamma setting',
    zh: '伽马设置',
    role: '调整图像亮度曲线和暗亮部表现',
    examClue: 'display color/brightness tuning',
  },
  {
    patterns: ['sas'],
    label: 'SAS',
    zh: '串行连接 SCSI',
    role: '企业级服务器存储接口，可靠性和性能高于普SATA 场景',
    examClue: 'server drives、enterprise storage',
  },
  {
    patterns: ['error correction'],
    label: 'error correction',
    zh: '错误纠正',
    role: '检测并纠正数据错误，常见于 ECC memory',
    examClue: 'data integrity、server memory',
  },
  {
    patterns: ['dual channel', 'channel configuration'],
    label: 'dual-channel memory',
    zh: '双通道内存',
    role: '用匹配内存条提升内存带宽',
    examClue: '成对安装 RAM、matching slots',
  },
  {
    patterns: ['physical module size'],
    label: 'memory module size',
    zh: '内存条物理规',
    role: '区分 DIMM、SODIMM 等外形是否能插入设备',
    examClue: 'laptop vs desktop memory form factor',
  },
);

TERM_RULES.push(
  {
    patterns: ['repair the backup power source', 'backup power source'],
    label: 'backup power source',
    zh: '备用电源',
    role: '提供停电时的短时供电，通常对应 UPS 或备用电源系',
    examClue: 'unexpected shutdowns、power outage、设备断电保',
  },
  {
    patterns: ['shielded twisted', 'stp'],
    label: 'shielded twisted pair',
    zh: '屏蔽双绞',
    role: '用屏蔽层降低 EMI（电磁干扰）对网线的影响',
    examClue: '强电磁干扰环境、工业设备附近布',
  },
  {
    patterns: ['plenum-rated', 'plenum'],
    label: 'plenum-rated cable',
    zh: '阻燃通风夹层线缆',
    role: '外皮低烟阻燃，适合通风管道或吊顶回风空',
    examClue: 'through air ducts、ceiling plenum、消防规',
  },
  {
    patterns: ['optical'],
    label: 'optical cable',
    zh: '光纤线缆',
    role: '用光信号传输，适合长距离和高带',
    examClue: 'fiber、long distance、抗干扰；不等于阻燃通风夹层等级',
  },
  {
    patterns: ['sluggish performance'],
    label: 'sluggish performance',
    zh: '性能迟缓',
    role: '系统响应慢，可能来自 storage、RAM、CPU 或软件负',
    examClue: 'slow startup、apps slow、需要结合题干定位具体瓶',
  },
  {
    patterns: ['crashing applications'],
    label: 'crashing applications',
    zh: '应用崩溃',
    role: '应用异常退出，常见原因包括 RAM、软bug、驱动或系统文件问题',
    examClue: '应用反复关闭或报错，不一定是显示接口问题',
  },
  {
    patterns: ['remote device power delivery'],
    label: 'remote device power delivery',
    zh: '远程设备供电',
    role: '通过网络线缆给远端设备供电，典型实现PoE',
    examClue: 'AP/IP phone/camera 远端供电',
  },
  {
    patterns: ['content filtering'],
    label: 'content filtering',
    zh: '内容过滤',
    role: '按网站、类别或内容阻止不合规访问',
    examClue: 'block websites、parental/business web filtering',
  },
  {
    patterns: ['load balancer', 'load balancing'],
    label: 'load balancing',
    zh: '负载均衡',
    role: '把流量分配到多台服务器或链路，提availability（可用性）和扩展',
    examClue: 'multiple servers、traffic distribution、high availability',
  },
  {
    patterns: ['bare-metal installation'],
    label: 'bare-metal installation',
    zh: '裸机安装',
    role: '直接安装在物理硬件上，而不是运行在宿主 OS ',
    examClue: 'Type 1 hypervisor OS 直接装硬',
  },
  {
    patterns: ['need for an underlying os', 'underlying os'],
    label: 'underlying OS',
    zh: '底层宿主操作系统',
    role: 'Type 2 hypervisor 需要先有一host OS（宿主操作系统）再运行虚拟机',
    examClue: 'VirtualBox/Workstation 这类宿主型虚拟化',
  },
  {
    patterns: ['local management only'],
    label: 'local management only',
    zh: '仅本地管',
    role: '只能在设备本机管理，缺少远程集中管理能力',
    examClue: '不适合需要远程或集中管理的场',
  },
  {
    patterns: ['specific hardware requirements'],
    label: 'specific hardware requirements',
    zh: '特定硬件要求',
    role: '软件或虚拟化方案需要特CPU、RAM、TPM 或其他硬件支',
    examClue: '兼容性、虚拟化扩展、TPM/Secure Boot 要求',
  },
  {
    patterns: ['add new hardware assistant'],
    label: 'Add New Hardware assistant',
    zh: '添加新硬件向',
    role: '旧式手动添加硬件方式，现代显示器通常OS 自动检',
    examClue: '外接显示器不应优先用硬件向导解决',
  },
  {
    patterns: ['windows tiling'],
    label: 'Windows tiling',
    zh: '窗口平铺',
    role: '整理窗口布局，不负责启用外接显示器或扩展桌面',
    examClue: '窗口排列，而不display detection/extend',
  },
  {
    patterns: ['display settings', 'external monitor as extended', 'extended'],
    label: 'extended display mode',
    zh: '扩展显示模式',
    role: 'Windows Display settings 中把外接屏设为扩展桌',
    examClue: 'external monitor、extend these displays、多屏办',
  },
  {
    patterns: ['wired connections between several devices'],
    label: 'wired LAN connection',
    zh: '有线多设备连',
    role: '通过 Ethernet/switch 连接多台设备',
    examClue: '多台设备有线互联；不Bluetooth/PAN',
  },
  {
    patterns: ['short-distance wireless connections between two devices'],
    label: 'short-distance wireless pairing',
    zh: '短距离两设备无线连接',
    role: '描述两个设备在很近距离内建立无线通信；NFC 属于极短距离触碰式通信',
    examClue: 'tap-to-pay、手机靠近读卡器、两设备贴近配对',
  },
  {
    patterns: ['wireless connections between multiple devices at once'],
    label: 'multi-device wireless network',
    zh: '多设备无线网',
    role: '描述 Wi-Fi/AP 让多台设备同时接入网',
    examClue: 'SSID、access point、multiple clients',
  },
  {
    patterns: ['direct connection of two computers for file sharing'],
    label: 'direct computer connection',
    zh: '两台电脑直连',
    role: '点对点连接用于文件共享，不是普通蓝牙外设定',
    examClue: 'file sharing between two PCs',
  },
  {
    patterns: ['man'],
    label: 'MAN',
    zh: '城域',
    role: '覆盖城市或园区级范围的网络，范围大于 LAN 小于 WAN',
    examClue: 'metropolitan/city network',
  },
  {
    patterns: ['wan'],
    label: 'WAN',
    zh: '广域',
    role: '跨城市、国家或互联网级别连接多个网',
    examClue: 'branch offices、internet、long-distance network',
  },
  {
    patterns: ['ir'],
    label: 'IR',
    zh: '红外',
    role: '短距离、需要视线方向的无线通信',
    examClue: 'remote control、line of sight',
  },
  {
    patterns: ['disable wireless connectivity', 'turn off wi-fi'],
    label: 'disable wireless connectivity',
    zh: '关闭无线连接',
    role: '断开 Wi-Fi/Bluetooth/cellular 等无线通道',
    examClue: '隔离无线问题或安全限制；会导致无法无线联',
  },
  {
    patterns: ['enable audit logging', 'audit logging'],
    label: 'audit logging',
    zh: '审计日志',
    role: '记录用户或系统事件，便于追踪安全和运维活',
    examClue: 'who did what、security investigation、合规审',
  },
  {
    patterns: ['audio card', 'sound card'],
    label: 'audio card',
    zh: '声卡',
    role: '处理音频输入输出',
    examClue: 'speaker/microphone/audio output 问题',
  },
  {
    patterns: ['escalate to the network team'],
    label: 'escalate to network team',
    zh: '升级给网络团',
    role: '把超出本地设备范围的端到端网络问题交给网络团队处',
    examClue: '本机排查正常但链交换/路由问题仍存',
  },
  {
    patterns: ['anti-malware signatures', 'scan the system', 'malware'],
    label: 'anti-malware scan',
    zh: '反恶意软件扫',
    role: '更新恶意软件特征库并扫描系统',
    examClue: '可疑进程、弹窗、感染迹象、malware removal',
  },
  {
    patterns: ['test development'],
    label: 'test development environment',
    zh: '测试开发环',
    role: '用于隔离开测试，不影响生产系统',
    examClue: 'sandbox、testing、development without production impact',
  },
  {
    patterns: ['charging issues'],
    label: 'charging case issue',
    zh: '保护壳导致充电问',
    role: '保护壳可能阻挡线缆完全插入或影响无线充电',
    examClue: 'certain cases cause charging issue、remove case to test',
  },
  {
    patterns: ['tablets need to be updated', 'os update', 'update the os'],
    label: 'OS update',
    zh: '系统更新',
    role: '修复系统 bug、安全漏洞或兼容性问',
    examClue: 'known bug、vendor patch、update OS to latest version',
  },
  {
    patterns: ['manufacturing defects'],
    label: 'manufacturing defect',
    zh: '制造缺',
    role: '设备出厂硬件问题，通常需要保修或更换',
    examClue: '同批设备普遍异常、非配置问题',
  },
  {
    patterns: ['developer roller'],
    label: 'developer roller',
    zh: '显影',
    role: 'laser printer 中把 toner 带到感光鼓参与显影',
    examClue: '激光打印成像质量问',
  },
  {
    patterns: ['discharge lamp'],
    label: 'discharge lamp',
    zh: '消电',
    role: 'laser printer 流程中帮助清除感光鼓残余电荷',
    examClue: '打印成像流程步骤',
  },
  {
    patterns: ['port flapping'],
    label: 'port flapping',
    zh: '端口频繁上下',
    role: '交换机端口连接状态不up/down，常由线缆、端口或对端设备导致',
    examClue: 'intermittent network drops、switch logs',
  },
  {
    patterns: ['secondary configuration', 'secondary'],
    label: 'secondary configuration',
    zh: '备用配置',
    role: '启用备用网络/设备配置以恢复服务或提供冗余',
    examClue: 'failover、backup config、冗余切',
  },
  {
    patterns: ['replace the keyboard', 'keyboard'],
    label: 'keyboard',
    zh: '键盘',
    role: '输入设备，按键故障可能需要更换键盘或部件',
    examClue: 'multiple keys fail、laptop keyboard issue',
  },
  {
    patterns: ['circuit board'],
    label: 'circuit board',
    zh: '电路',
    role: '承载电子元件和连接，损坏会导致硬件功能异',
    examClue: 'liquid damage、physical damage、board-level fault',
  },
  {
    patterns: ['keycap'],
    label: 'keycap',
    zh: '键帽',
    role: '键盘按键上方的物理帽，松脱时可单独更',
    examClue: 'single key cap missing/broken but switch works',
  },
  {
    patterns: ['active directory'],
    label: 'Active Directory',
    zh: '活动目录',
    role: '集中管理 Windows domain 用户、计算机和策',
    examClue: 'domain account、reset account、enterprise login',
  },
  {
    patterns: ['join the wi-fi network', 'to connect to wi-fi', 'wi-fi'],
    label: 'Wi-Fi',
    zh: '无线局域网',
    role: '让设备通过无线接入 LAN/Internet',
    examClue: 'SSID、WPA、无线连',
  },
  {
    patterns: ['self assignment'],
    label: 'self-assigned IP',
    zh: '自分配地址',
    role: '设备无法DHCP 获得地址时给自己分配 APIPA 地址',
    examClue: '169.254.x.x、DHCP failure',
  },
  {
    patterns: ['drive diagnostics', 'individual drive diagnostics'],
    label: 'drive diagnostics',
    zh: '硬盘诊断',
    role: '检测单块磁盘健康、坏块和 SMART 状',
    examClue: 'RAID/drive failure、确认具体坏',
  },
  {
    patterns: ['chkdsk', 'run the chkdsk /f command'],
    label: 'chkdsk',
    zh: 'Windows 磁盘检',
    role: '检查并修复文件系统错误',
    examClue: 'Windows file system corruption、磁盘逻辑错误',
  },
  {
    patterns: ['duplex printing'],
    label: 'duplex printing',
    zh: '双面打印',
    role: '在纸张两面打',
    examClue: 'two-sided printing、duplexer',
  },
  {
    patterns: ['page orientation'],
    label: 'page orientation',
    zh: '页面方向',
    role: '设置 portrait/landscape（纵横向）打印或显示布局',
    examClue: 'landscape/portrait、页面方向不',
  },
  {
    patterns: ['licensing costs'],
    label: 'licensing costs',
    zh: '授权成本',
    role: '软件或服务订授权带来的费',
    examClue: 'minimize cost、per-user/per-device license',
  },
  {
    patterns: ['less manual configuration'],
    label: 'less manual configuration',
    zh: '减少手工配置',
    role: '通过自动化或集中管理降低逐台配置工作',
    examClue: 'many workstations、deployment efficiency',
  },
  {
    patterns: ['wi-fi protected access', 'wpa3', 'wpa2'],
    label: 'WPA',
    zh: 'Wi-Fi 保护访问',
    role: '无线网络安全加密标准，WPA3 新于 WPA2',
    examClue: 'wireless encryption、compatibility with old clients',
  },
  {
    patterns: ['close unnecessary programs'],
    label: 'close unnecessary programs',
    zh: '关闭不必要程',
    role: '释放 RAM/CPU 资源以改善短期性能',
    examClue: 'too many apps open、resource contention',
  },
  {
    patterns: ['factory default', 'factory settings'],
    label: 'factory reset',
    zh: '恢复出厂设置',
    role: '清除用户配置并恢复设备默认状',
    examClue: 'last resort、配置混乱、准备转交设',
  },
  {
    patterns: ['power cycle the projector'],
    label: 'power cycle projector',
    zh: '重启投影',
    role: '断电重启投影仪以清除临时状',
    examClue: 'projector temporary glitch、no signal after wake',
  },
  {
    patterns: ['increase the resolution', 'resolution settings', '1080p'],
    label: 'resolution setting',
    zh: '分辨率设',
    role: '调整显示输出像素数量以匹配屏幕或投影',
    examClue: 'blurry display、wrong resolution、external monitor/projector',
  },
  {
    patterns: ['projector configuration', 'projector input sources', 'input source'],
    label: 'projector input source',
    zh: '投影仪输入源',
    role: '选择 HDMI/VGA/DisplayPort 等正确输',
    examClue: 'projector no signal、wrong input selected',
  },
  {
    patterns: ['refresh rate'],
    label: 'refresh rate',
    zh: '刷新',
    role: '显示器每秒刷新次数，影响流畅度和兼容',
    examClue: 'flicker、gaming monitor、unsupported refresh rate',
  },
  {
    patterns: ['137'],
    label: 'port 137',
    zh: 'NetBIOS 名称服务端口',
    role: 'Windows/NetBIOS 名称解析相关端口',
    examClue: 'legacy Windows name service',
  },
  {
    patterns: ['445'],
    label: 'port 445',
    zh: 'SMB 端口',
    role: 'Windows 文件共享常用端口',
    examClue: 'network share、SMB、file sharing',
  },
  {
    patterns: ['3389'],
    label: 'port 3389',
    zh: 'RDP 端口',
    role: 'Remote Desktop Protocol 默认端口',
    examClue: 'Windows remote desktop',
  },
  {
    patterns: ['4443'],
    label: 'port 4443',
    zh: '自定HTTPS 类端',
    role: '常作应用自定义安Web 端口，但不是 A+ 常见默认协议端口',
    examClue: '看到端口题要优先匹配标准默认端口',
  },
  {
    patterns: ['sim connection', 'sim card'],
    label: 'SIM',
    zh: '用户身份识别',
    role: '让手蜂窝设备接入运营商网',
    examClue: 'cellular activation、carrier plan、SIM/eSIM',
  },
  {
    patterns: ['esim', 'international esim'],
    label: 'eSIM',
    zh: '嵌入SIM',
    role: '无需实体卡即可配置蜂窝运营商服务',
    examClue: 'international travel data plan、手机蜂窝激',
  },
  {
    patterns: ['incorrect time zone', 'time zone'],
    label: 'time zone',
    zh: '时区',
    role: '决定本地时间显示和时间转',
    examClue: 'travel、calendar/email timestamps、系统时间显示错',
  },
  {
    patterns: ['daas'],
    label: 'DaaS',
    zh: '桌面即服',
    role: '由云端提供托管桌面，用户远程访问',
    examClue: 'cloud-hosted desktops、remote work desktops',
  },
  {
    patterns: ['turn it off and disconnect all power sources'],
    label: 'disconnect power',
    zh: '断开所有电',
    role: '维修前关闭设备并断开电源，降低触电和短路风险',
    examClue: 'hardware repair safety、liquid spill、internal inspection',
  },
  {
    patterns: ['foreign objects', 'liquid spills', 'internal damage'],
    label: 'inspect for physical damage',
    zh: '检查异液体/内部损坏',
    role: '确认设备是否有异物、进液或内部损坏再继续通电',
    examClue: 'liquid spill、burn smell、physical damage',
  },
  {
    patterns: ['alternate ac adapter', 'ac adapter'],
    label: 'AC adapter',
    zh: '电源适配',
    role: '为笔记本/移动设备提供外部电源并充',
    examClue: 'not charging、no power、try known-good adapter',
  },
  {
    patterns: ['correct paper size', 'paper size'],
    label: 'paper size',
    zh: '纸张尺寸',
    role: '打印机和应用需匹配实际纸张尺寸',
    examClue: 'wrong tray、paper mismatch、打印布局异常',
  },
  {
    patterns: ['mac address filtering', 'mac filtering'],
    label: 'MAC address filtering',
    zh: 'MAC 鍦板潃杩囨护',
    role: '鎸夎澶囩殑 MAC address锛圡AC 鍦板潃锛夊仛 allowlist/denylist锛堝厑璁?鎷掔粷鍒楄〃锛夛紝灞炰access control锛堣闂帶鍒讹',
    examClue: 'security/access control锛堝畨鍏?璁块棶鎺у埗锛夛紱涓嶄細鍑忓皯 channel interference锛堜俊閬撳共鎵帮級鎴栨彁wireless throughput锛堟棤绾垮悶鍚愰噺锛?',
  },
  {
    patterns: ['mac'],
    label: 'MAC address',
    zh: '物理地址',
    role: '网卡二层硬件地址，用于局域网通信和过',
    examClue: 'MAC filtering、switch table、hardware address',
  },
  {
    patterns: ['boot options', 'boot order'],
    label: 'boot options',
    zh: '启动选项',
    role: '决定设备从哪个磁盘、USB 或网络启',
    examClue: 'wrong boot device、UEFI/BIOS boot order',
  },
  {
    patterns: ['multiboot', 'dual boot'],
    label: 'dual boot / multiboot',
    zh: '多系统启',
    role: '同一设备安装多个 OS 并在启动时选择',
    examClue: 'run Windows and Linux on same hardware',
  },
  {
    patterns: ['sd card'],
    label: 'SD card',
    zh: 'SD 存储',
    role: '可移flash storage（闪存），常用于相机、平板和手机扩展',
    examClue: 'photos/videos storage、removable media',
  },
  {
    patterns: ['22'],
    label: 'port 22',
    zh: 'SSH/SFTP 端口',
    role: 'SSH SFTP 常用默认端口',
    examClue: 'secure shell、secure file transfer',
  },
  {
    patterns: ['23'],
    label: 'port 23',
    zh: 'Telnet 端口',
    role: 'Telnet 默认端口，明文远程命令行，不安全',
    examClue: 'legacy remote terminal、avoid for security',
  },
  {
    patterns: ['25'],
    label: 'port 25',
    zh: 'SMTP 端口',
    role: 'SMTP 服务器间邮件传输常用端口',
    examClue: 'email sending/relay',
  },
  {
    patterns: ['roll back recent system updates'],
    label: 'rollback update',
    zh: '回滚更新',
    role: '撤销最近更新以恢复因更新引起的问题',
    examClue: 'problem started after update',
  },
  {
    patterns: ['microusb', 'micro usb'],
    label: 'Micro-USB',
    zh: 'Micro-USB 接口',
    role: '较旧移动设备常见充电/数据接口',
    examClue: 'older Android/mobile device connector',
  },
  {
    patterns: ['miniusb', 'mini usb'],
    label: 'Mini-USB',
    zh: 'Mini-USB 接口',
    role: '更旧USB 小型接口，常见于老相机或旧外',
    examClue: 'legacy mobile/camera connector',
  },
  {
    patterns: ['utm'],
    label: 'UTM',
    zh: '统一威胁管理',
    role: '集成 firewall、IDS/IPS、content filtering 等安全功',
    examClue: 'all-in-one security appliance',
  },
  {
    patterns: ['aaa'],
    label: 'AAA',
    zh: '认证、授权、审',
    role: 'Authentication、Authorization、Accounting，用于集中访问控',
    examClue: 'RADIUS/TACACS+、enterprise network access',
  },
  {
    patterns: ['vendor support'],
    label: 'vendor support',
    zh: '厂商支持',
    role: '当设备缺陷、保修或专有问题超出本地处理范围时联系厂',
    examClue: 'warranty、known defect、replacement authorization',
  },
  {
    patterns: ['inverter'],
    label: 'inverter',
    zh: '屏幕背光逆变',
    role: 'LCD 用于驱动背光，坏了可能导致屏幕很',
    examClue: 'old laptop LCD backlight issue',
  },
  {
    patterns: ['external monitor'],
    label: 'external monitor test',
    zh: '外接显示器测',
    role: '区分笔记本内置屏幕问题和 GPU/系统输出问题',
    examClue: 'laptop display blank/dim、connect external monitor',
  },
  {
    patterns: ['enable encryption', 'encryption'],
    label: 'encryption',
    zh: '加密',
    role: '把数据转换为未授权者无法读取的形式',
    examClue: 'protect lost device/data at rest、BitLocker/FileVault',
  },
  {
    patterns: ['default password'],
    label: 'default password',
    zh: '默认密码',
    role: '出厂默认凭据，部署设备后应立即修',
    examClue: 'new router/IoT/printer hardening',
  },
  {
    patterns: ['ips'],
    label: 'IPS display',
    zh: 'IPS 面板',
    role: 'LCD 面板类型，视角和色彩通常较好',
    examClue: 'display panel comparison、color accuracy',
  },
  {
    patterns: ['tn'],
    label: 'TN display',
    zh: 'TN 面板',
    role: 'LCD 面板类型，响应快但视色彩通常较弱',
    examClue: 'gaming/low cost display panel',
  },
  {
    patterns: ['va'],
    label: 'VA display',
    zh: 'VA 面板',
    role: 'LCD 面板类型，对比度较高，响应和视角介于 TN/IPS 之间',
    examClue: 'display panel comparison',
  },
  {
    patterns: ['ddr3'],
    label: 'DDR3',
    zh: 'DDR3 内存',
    role: '较旧一RAM 标准，不能与 DDR4/DDR5 插槽互换',
    examClue: 'memory compatibility、notch position',
  },
  {
    patterns: ['byod'],
    label: 'BYOD',
    zh: '自带设备',
    role: '员工使用个人设备访问组织资源',
    examClue: 'MDM、training、acceptable use policy',
  },
  {
    patterns: ['scalability'],
    label: 'scalability',
    zh: '可扩展',
    role: '系统随需求增加而扩展容量或性能的能',
    examClue: 'cloud growth、add resources as needed',
  },
  {
    patterns: ['password', 'passcode'],
    label: 'password / passcode',
    zh: '密码/口令',
    role: '用于验证用户身份的知识因',
    examClue: 'screen lock、account login、MFA',
  },
  {
    patterns: ['molex connector', 'molex'],
    label: 'Molex',
    zh: 'Molex 电源接口',
    role: '旧式 PC 外设电源接口，常见于老硬风扇/光驱',
    examClue: 'legacy internal power connector',
  },
  {
    patterns: ['smartscreen', 'microsoft defender smartscreen'],
    label: 'SmartScreen',
    zh: '微软信誉筛',
    role: 'Microsoft Edge/Windows 中按文件或网站信誉阻止可疑下载和运行',
    examClue: 'Edge blocks download、file type blocked、known safe file',
  },
  {
    patterns: ['screen'],
    label: 'screen',
    zh: '屏幕',
    role: '显示图像的部件；触摸设备还可能有 digitizer（触控层',
    examClue: 'display cracked/blank/burn-in vs touch input issue',
  },
  {
    patterns: ['stylus'],
    label: 'stylus',
    zh: '触控',
    role: '用于在触控屏/数字化层上精确输',
    examClue: 'tablet drawing、pen input、digitizer support',
  },
  {
    patterns: ['resetting the network settings', 'network settings'],
    label: 'reset network settings',
    zh: '重置网络设置',
    role: '清除保存的网络配置并恢复默认网络栈设',
    examClue: 'mobile Wi-Fi/cellular persistent issue',
  },
  {
    patterns: ['jitter'],
    label: 'jitter',
    zh: '抖动',
    role: '网络延迟变化幅度，影响语音和视频质量',
    examClue: 'VoIP/video call choppy despite bandwidth',
  },
  {
    patterns: ['insufficient power levels'],
    label: 'insufficient power',
    zh: '供电不足',
    role: '设备没有获得足够电力，导致不稳定或无法启',
    examClue: 'USB device not working、PoE budget、PSU capacity',
  },
  {
    patterns: ['7200rpm'],
    label: '7200 RPM HDD',
    zh: '7200 转机械硬',
    role: '5400 RPM 机械盘通常更快，但仍慢SSD',
    examClue: 'hard drive spindle speed、performance comparison',
  },
  {
    patterns: ['db9'],
    label: 'DB9',
    zh: '9 针串',
    role: '传统 serial port（串口）连接',
    examClue: 'legacy serial devices、console cable',
  },
  {
    patterns: ['st'],
    label: 'ST fiber connector',
    zh: 'ST 光纤接头',
    role: '一种老式圆形卡口光纤连接',
    examClue: 'fiber connector identification',
  },
  {
    patterns: ['burn-in'],
    label: 'burn-in',
    zh: '烧屏',
    role: '静态图像长期显示导致残影，OLED 更容易遇',
    examClue: 'persistent ghost image even when content changes',
  },
  {
    patterns: ['channel conflict'],
    label: 'Wi-Fi channel conflict',
    zh: '无线信道冲突',
    role: '相邻 AP 使用重叠信道导致干扰和吞吐下',
    examClue: 'crowded Wi-Fi、change channel.4GHz overlap',
  },
  {
    patterns: ['api'],
    label: 'API',
    zh: '应用程序接口',
    role: '让软件系统之间通过定义好的接口交换数据或调用功',
    examClue: 'application integration、cloud service calls',
  },
  {
    patterns: ['upnp settings', 'upnp'],
    label: 'UPnP',
    zh: '通用即插即用',
    role: '允许设备自动发现并请求网络端口映',
    examClue: 'SOHO router automatic port forwarding, security risk',
  },
  {
    patterns: ['nat rules', 'nat'],
    label: 'NAT rules',
    zh: '网络地址转换规则',
    role: '把私有地址流量转换到公网地址，或做端口转',
    examClue: 'port forwarding、private-to-public address translation',
  },
  {
    patterns: ['capacitors'],
    label: 'capacitors',
    zh: '电容',
    role: '电子元件，用于储能和滤波；鼓漏液可导致主板或 PSU 故障',
    examClue: 'bulging capacitors、random shutdowns、board failure',
  },
  {
    patterns: ['risc'],
    label: 'RISC',
    zh: '精简指令',
    role: 'CPU 架构设计理念，ARM 是常RISC 架构',
    examClue: 'processor architecture comparison',
  },
  {
    patterns: ['videoconferencing'],
    label: 'videoconferencing',
    zh: '视频会议',
    role: '实时音视频通信，依赖稳定带宽、低 latency 和低 jitter',
    examClue: 'camera/mic/network quality for meetings',
  },
  {
    patterns: ['hosted database'],
    label: 'hosted database',
    zh: '托管数据',
    role: '由云或服务商托管数据库平台，减少本地管理工作',
    examClue: 'PaaS/DBaaS、less database administration',
  },
  {
    patterns: ['cloud backup'],
    label: 'cloud backup',
    zh: '云备',
    role: '把数据备份到云端，避免本地设备损坏造成数据丢失',
    examClue: 'backup synchronization、avoid duplicate backup apps',
  },
  {
    patterns: ['cache storage'],
    label: 'cache storage',
    zh: '缓存存储',
    role: '临时保存常用数据以提升访问速度',
    examClue: 'performance cache、not long-term photo storage',
  },
  {
    patterns: ['data synchronization'],
    label: 'data synchronization',
    zh: '数据同步',
    role: '在多设备或云端保持数据一',
    examClue: 'sync only over Wi-Fi、mobile data savings',
  },
  {
    patterns: ['disk cleanup'],
    label: 'Disk Cleanup',
    zh: '磁盘清理',
    role: '删除临时文件和系统缓存释放存储空',
    examClue: 'low disk space、Windows cleanup utility',
  },
  {
    patterns: ['to assign ip addresses'],
    label: 'assign IP addresses',
    zh: '分配 IP 地址',
    role: 'DHCP 的核心作用是自动给客户端分配 IP 配置',
    examClue: 'DHCP server function',
  },
  {
    patterns: ['to route network packets locally', 'route network packets'],
    label: 'route packets',
    zh: '路由数据',
    role: 'router 在不同网络之间转发数据包',
    examClue: 'default gateway、inter-network traffic',
  },
  {
    patterns: ['to block unwanted traffic', 'block unwanted traffic'],
    label: 'block unwanted traffic',
    zh: '阻止不需要的流量',
    role: 'firewall 的核心作用是按规则阻止或允许流量',
    examClue: 'firewall function',
  },
  {
    patterns: ['damaged power port', 'power port'],
    label: 'power port',
    zh: '电源接口',
    role: '接入外部电源，损坏会导致无法充电或间歇断',
    examClue: 'wiggling adapter changes charging state',
  },
  {
    patterns: ['lcd'],
    label: 'LCD',
    zh: '液晶显示',
    role: '需要背光显示图像的平板显示技',
    examClue: 'backlight/inverter、screen panel replacement',
  },
  {
    patterns: ['check for broken pins', 'broken pins'],
    label: 'broken pins',
    zh: '针脚损坏',
    role: '连接器针脚弯曲或断裂会造成连接失败',
    examClue: 'physical port inspection、cable/device not detected',
  },
  {
    patterns: ['re-pair the devices', 're-pair'],
    label: 're-pair Bluetooth devices',
    zh: '重新配对蓝牙设备',
    role: '删除旧配对并重新建立 Bluetooth 连接',
    examClue: 'Bluetooth device no longer connects',
  },
  {
    patterns: ['form factors'],
    label: 'form factor',
    zh: '外形规格',
    role: '定义硬件尺寸、安装孔位和兼容',
    examClue: 'motherboard/case/PSU/RAM physical compatibility',
  },
  {
    patterns: ['spindle speeds'],
    label: 'spindle speed',
    zh: '硬盘转',
    role: '机械硬盘盘片每分钟转速，影响访问性能',
    examClue: '5400/7200/10000 RPM HDD comparison',
  },
  {
    patterns: ['network bridge'],
    label: 'network bridge',
    zh: '网络桥接',
    role: '连接两个网络段，使它们像同一二层网络一样通信',
    examClue: 'bridge two networks、VM network bridging',
  },
  {
    patterns: ['hub'],
    label: 'hub',
    zh: '集线',
    role: '把收到的以太网信号广播到所有端口，已被 switch 基本取代',
    examClue: 'legacy network device、collision domain',
  },
  {
    patterns: ['network access control'],
    label: 'NAC',
    zh: '网络准入控制',
    role: '在设备接入网络前检查身份和合规状',
    examClue: '802.1X、device posture、enterprise access',
  },
  {
    patterns: ['endpoint protection'],
    label: 'endpoint protection',
    zh: '终端防护',
    role: '保护 PC/移动设备免受 malware 和安全威',
    examClue: 'anti-malware、EDR、device security',
  },
);

function normalizeText(value = '') {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function includesPattern(source, pattern) {
  if (pattern.length === 1) {
    return source === pattern;
  }

  if (pattern === 'static') {
    return /\bstatic\b/i.test(source);
  }

  if (pattern.length <= 3) {
    return new RegExp(`\\b${escapeRegExp(pattern)}\\b`, 'i').test(source);
  }

  return source.includes(pattern);
}

function lookupTerms(value = '') {
  const source = normalizeText(value);
  return TERM_RULES.filter((rule) => (
    rule.patterns.some((pattern) => includesPattern(source, normalizeText(pattern)))
  ));
}

function getBestPatternLength(term, source) {
  return Math.max(
    0,
    ...term.patterns
      .map((pattern) => normalizeText(pattern))
      .filter((pattern) => includesPattern(source, pattern))
      .map((pattern) => pattern.length),
  );
}

function lookupPrimaryTerm(value = '') {
  const source = normalizeText(value);
  return lookupTerms(value)
    .sort((a, b) => getBestPatternLength(b, source) - getBestPatternLength(a, source))[0]
    ?? null;
}

function lookupQuestionOptionTerm(question, option) {
  const stem = normalizeText(question.stem);
  const optionText = normalizeText(option.text);

  if (optionText === 'man' && stem.includes('linux command')) {
    return null;
  }

  return lookupPrimaryTerm(option.text);
}

function formatTerm(term) {
  return term ? `${term.label}?${term.zh}）` : '';
}

function getQuestionText(question) {
  return normalizeText([
    question.topic,
    question.stem,
    ...(question.options ?? []).map((option) => option.text),
  ].join(' '));
}

function isPrinterQuestion(question) {
  const stem = normalizeText(question.stem);
  const optionText = normalizeText((question.options ?? []).map((option) => option.text).join(' '));

  return /\b(printer|printing|laser printer|copy|copies|scan|scans|fax|faxes|toner|fuser|drum|spooler|paper jam|adf)\b/i
    .test(stem)
    || /\b(document feeder|pickup rollers|corona wire|drum assembly|fuser|toner cartridge|printhead|maintenance kit|tray settings)\b/i
      .test(optionText);
}

function isScanPathPrinterQuestion(question) {
  const stem = normalizeText(question.stem);
  return isPrinterQuestion(question)
    && /(copy|copies|scan|scans|fax|faxes)/.test(stem)
    && /(print|printer).*(correct|normal|properly)|output.*correct/.test(stem);
}

function isCrowdedWirelessPerformanceQuestion(question) {
  const stem = normalizeText(question.stem);
  return stem.includes('wireless')
    && stem.includes('wep')
    && stem.includes('default channel')
    && (stem.includes('crowded') || stem.includes('nearby networks'))
    && stem.includes('performance');
}

function isDotMatrixMultipartRibbonQuestion(question) {
  const stem = normalizeText(question.stem);
  return stem.includes('dot matrix printer')
    && stem.includes('multipart')
    && stem.includes('top page')
    && stem.includes('bottom pages')
    && stem.includes('print fine');
}

function isStaticPrinterIpQuestion(question) {
  const stem = normalizeText(question.stem);
  return stem.includes('soho network')
    && stem.includes('static ip address')
    && stem.includes('printers')
    && stem.includes('set manually');
}

function isUnlabeledNetworkConnectionQuestion(question) {
  const stem = normalizeText(question.stem);
  return stem.includes('unlabeled network connection')
    && stem.includes('identify');
}

function isEsdWristStrapQuestion(question) {
  const text = getQuestionText(question);
  return text.includes('wrist strap')
    && text.includes('electrostatic charge')
    && /\b(ram|memory|component|computer)\b/.test(text);
}

function getTargetedCore1Scenario(question) {
  const stem = normalizeText(question.stem);
  const optionText = normalizeText((question.options ?? []).map((option) => option.text).join(' '));

  if (stem.includes('wi-fi signal is intermittent')
    && stem.includes('other users are not experiencing')) {
    return 'single-client-wifi';
  }

  if (stem.includes('legacy application')
    && stem.includes('hosted on three physical servers')
    && stem.includes('until it is retired')) {
    return 'legacy-app-virtualization';
  }

  if (stem.includes('spreadsheet')
    && stem.includes('duplex')
    && stem.includes('columns spill onto the second side')) {
    return 'spreadsheet-orientation';
  }

  if (stem.includes('confirm that a physical port is working')) {
    return 'physical-port-loopback';
  }

  if (stem.includes('home office')
    && stem.includes('add additional devices')
    && stem.includes('minimal cost and administration')) {
    return 'home-office-unmanaged-switch';
  }

  if (stem.includes('connect wires to an rj45 connector')) {
    return 'rj45-crimper';
  }

  if (stem.includes('best connectivity performance')
    && stem.includes('limited necessary accessories')) {
    return 'hotspot-connectivity';
  }

  if (stem.includes('no internet connectivity')
    && stem.includes('port is disabled')) {
    return 'disabled-port-managed-switch';
  }

  if (stem.includes('vlan configuration')
    && stem.includes('desktops in the sales office')) {
    return 'vlan-managed-switch';
  }

  if ((stem.includes('suspended ceiling') || stem.includes('air ventilation'))
    && stem.includes('copper network cable')) {
    return 'plenum-cable';
  }

  if (stem.includes('dmarc')
    && stem.includes('verify the authenticity of email servers')) {
    return 'dmarc-txt-record';
  }

  if (stem.includes('does not respond to touch')
    && stem.includes('evidence of physical damage')) {
    return 'phone-digitizer';
  }

  if (stem.includes('port-flapping issue')
    && stem.includes('different port')
    && stem.includes('issue persists')) {
    return 'replace-patch-cable';
  }

  if (stem.includes('local folders')
    && stem.includes('updates that are made by users on other devices')) {
    return 'cloud-synchronization';
  }

  if (stem.includes('activity light comes on briefly and turns off')
    && stem.includes('does not come online')) {
    return 'ap-port-flapping';
  }

  if (stem.includes('raid configurations')
    && stem.includes('lose two drives without data loss')) {
    return 'raid6-two-drive-fault';
  }

  if (stem.includes('cloud models')
    && stem.includes('exclusively utilizes a local data center')) {
    return 'private-cloud-local-datacenter';
  }

  if (stem.includes('rj45 pin is not properly terminated')
    && stem.includes('networking tools')) {
    return 'rj45-reterminate-crimper';
  }

  if (stem.includes('cloud service to provide email')) {
    return 'cloud-email-saas';
  }

  if (stem.includes('connect to company resources from their laptops')
    && stem.includes('least amount of infrastructure')) {
    return 'company-resources-saas';
  }

  if (stem.includes('characteristic of type 2 hypervisors')) {
    return 'type2-underlying-os';
  }

  if (stem.includes('slow startup times')
    && stem.includes('laptop')) {
    return 'slow-startup-hdd';
  }

  if (stem.includes('common feature of managed switches')) {
    return 'managed-switch-vlan-feature';
  }

  if (stem.includes('port numbers')
    && stem.includes('file transfer')) {
    return 'ftp-port-21';
  }

  if (stem.includes('share their mobile phone connection')
    && stem.includes('laptop')) {
    return 'mobile-tethering';
  }

  if (stem.includes('desktop pc does not turn on')) {
    return 'desktop-no-power-psu';
  }

  if (stem.includes('passes post')
    && stem.includes('will not turn on the operating system')) {
    return 'post-no-os-hdd';
  }

  if (stem.includes('testing a file for potential malware')) {
    return 'malware-file-sandbox';
  }

  if (stem.includes('styluses charge intermittently')
    && stem.includes('users can purchase their own accessories')) {
    return 'stylus-case-charging';
  }

  if (stem.includes('best penetration through physical objects')
    && stem.includes('walls')) {
    return 'wifi-24ghz-penetration';
  }

  if (stem.includes('example of vdi')) {
    return 'vdi-thin-client-streaming';
  }

  if (stem.includes('disaster recovery solution')
    && stem.includes('virtual machines')) {
    return 'dr-vms-iaas';
  }

  if (stem.includes('hands-free car system via bluetooth')
    && stem.includes('security feature')) {
    return 'bluetooth-pin-pairing';
  }

  if (stem.includes('usb-c port to a projector')
    && stem.includes('docking station')
    && stem.includes('charging port')) {
    return 'usb-c-thunderbolt-video';
  }

  if (optionText.includes('input voltage')
    && stem.includes('global')
    && stem.includes('remote workforce')) {
    return 'global-pc-input-voltage';
  }

  if (stem.includes('large amounts of affordable capacity')
    && stem.includes('without concern for read times')) {
    return 'affordable-capacity-hdd';
  }

  if (stem.includes('specialized ports on a laptop')
    && stem.includes('expand the local connection options')) {
    return 'laptop-docking-station';
  }

  if (stem.includes('transfer data and video')
    && stem.includes('cable types')) {
    return 'usb-c-data-video';
  }

  if (stem.includes('ram is best suited to handle errors')) {
    return 'ram-ecc-errors';
  }

  if (stem.includes('advantage of using vdi')) {
    return 'vdi-less-workstation-config';
  }

  if (stem.includes('secure applications')
    && stem.includes('work when in the office')
    && stem.includes('working from home')) {
    return 'remote-tablet-mdm';
  }

  if (stem.includes('bitlocker')
    && stem.includes('not able to encrypt the boot drive')) {
    return 'bitlocker-tpm';
  }

  if (stem.includes('screen is smaller at the bottom than at the top')
    && stem.includes('projector')) {
    return 'projector-keystone';
  }

  if (stem.includes('drive interfaces')
    && stem.includes('server systems')) {
    return 'server-drive-sas';
  }

  if (stem.includes('maximize module bandwidth')
    && stem.includes('memory')) {
    return 'memory-channel-config';
  }

  if (stem.includes('phone')
    && stem.includes('integration features')
    && stem.includes('charging the phone in a car')) {
    return 'phone-car-port-cleaning';
  }

  if (stem.includes('bare-metal server')
    && stem.includes('eol')
    && stem.includes('modern hardware')) {
    return 'eol-system-virtualize';
  }

  if (stem.includes('ports')
    && stem.includes('remote desktop connections')) {
    return 'rdp-port-3389';
  }

  if (stem.includes('time is wrong')
    && stem.includes('happens again')) {
    return 'wrong-time-cmos-battery';
  }

  if (stem.includes('burning smell')
    && stem.includes('laptop')) {
    return 'burning-smell-power-off-inspect';
  }

  if (stem.includes('managed vs unmanaged switches')) {
    return 'managed-vs-unmanaged-switch';
  }

  if (stem.includes('new os')
    && stem.includes('usb drive')
    && stem.includes('load automatically')) {
    return 'usb-os-boot-options';
  }

  if (stem.includes('locally hosted environment')
    && stem.includes('wide array of test oss')) {
    return 'test-oses-hypervisor';
  }

  if (stem.includes('less populated areas')
    && stem.includes('minimal infrastructure')) {
    return 'rural-minimal-infrastructure-cellular';
  }

  if (stem.includes('ports should a technician disable')
    && stem.includes('remote connectivity')) {
    return 'disable-telnet-port-23';
  }

  if (stem.includes('reporting only 16gb')
    && stem.includes('two dimms')) {
    return 'ram-half-detected-reseat-slots';
  }

  if (stem.includes('symmetrical upload and download speeds')) {
    return 'fiber-symmetrical-speed';
  }

  if (stem.includes('fast read speeds')
    && stem.includes('lowest cost')) {
    return 'raid0-fast-low-cost';
  }

  if (stem.includes('charge most modern mobile devices')
    && stem.includes('send data audio, and video')) {
    return 'modern-mobile-usb-c';
  }

  if (stem.includes('devices has acl capabilities')) {
    return 'firewall-acl-capabilities';
  }

  if (stem.includes('automatic time synchronization')) {
    return 'ntp-time-sync';
  }

  if (stem.includes('types of ram')
    && stem.includes('used in a server')) {
    return 'server-ram-ecc';
  }

  if (stem.includes('new mobile phone')
    && stem.includes('corporate communications and email')) {
    return 'enroll-phone-mdm';
  }

  if (stem.includes('automatically increase and decrease instances')) {
    return 'cloud-elasticity-autoscale';
  }

  if (stem.includes('physical server to host multiple virtual machines')) {
    return 'hypervisor-hosts-vms';
  }

  if (stem.includes('running microservices')) {
    return 'microservices-containers';
  }

  if (stem.includes('high-end video card')
    && stem.includes('fastest hard drive possible')) {
    return 'pcie-nvme-high-end-build';
  }

  if (stem.includes('track where an ethernet cable is patched')) {
    return 'ethernet-patched-toner-probe';
  }

  if (stem.includes('location services on their smartphone')
    && stem.includes('traveling')) {
    return 'gps-assisted-by-wifi';
  }

  if (stem.includes('places the laptop on top of a motor')) {
    return 'factory-motor-interference';
  }

  if (stem.includes('characteristic of an nvme drive')) {
    return 'nvme-m2-characteristic';
  }

  if (stem.includes('coaxial terminations')
    && stem.includes('cable internet')) {
    return 'coax-cable-internet-f-type';
  }

  if (stem.includes('presentation suddenly cuts off')
    && stem.includes('backup laptop')
    && stem.includes('projector')) {
    return 'projector-overheating-filter';
  }

  if (stem.includes('secured communication channel')
    && stem.includes('credentials for authentication')) {
    return 'vpn-secured-channel';
  }

  if (stem.includes('beam of light')
    && stem.includes('flexible cable')) {
    return 'fiber-light-transmission';
  }

  if (stem.includes('minimize the number of power cables')
    && stem.includes('power supply')) {
    return 'modular-psu-cable-management';
  }

  if (stem.includes('policy change requires all computers to be encrypted')) {
    return 'tpm-computer-encryption';
  }

  if (stem.includes('isolated virtual machine')) {
    return 'sandbox-isolated-vm';
  }

  if (stem.includes('evaluate several desktop linux oss simultaneously')) {
    return 'linux-oses-hypervisor';
  }

  if (stem.includes('documents are opened and saved')
    && stem.includes('7200rpm')) {
    return 'document-open-save-ssd-upgrade';
  }

  if (stem.includes('example of saas')) {
    return 'saas-videoconferencing';
  }

  if (stem.includes('cpu temperature')
    && stem.includes('208')) {
    return 'cpu-overheat-heat-sink';
  }

  if (stem.includes('purpose of a firewall')) {
    return 'firewall-block-unwanted-traffic';
  }

  if (stem.includes('charges intermittently')
    && stem.includes('screen dims')) {
    return 'laptop-faulty-battery';
  }

  if (stem.includes('smartphone is swollen')) {
    return 'swollen-phone-battery';
  }

  if (stem.includes('high-bandwidth digital content protection')) {
    return 'displayport-hdcp';
  }

  if (stem.includes('via an os running on the host')) {
    return 'hosted-type2-hypervisor';
  }

  if (stem.includes('track its asset inventory')) {
    return 'asset-inventory-rfid';
  }

  if (stem.includes('protected from a hard drive failure')
    && stem.includes('two hard drives')) {
    return 'raid1-two-drive-mirror';
  }

  if (stem.includes('forwards traffic based on mac addresses')) {
    return 'switch-mac-forwarding';
  }

  if (stem.includes('share an lte connection')) {
    return 'lte-sharing-hotspot';
  }

  if (stem.includes('traveling in another country')
    && stem.includes('unable to receive calls or emails')) {
    return 'international-esim';
  }

  if (stem.includes('malicious indicators')
    && stem.includes('inspected safely')) {
    return 'malicious-indicators-sandbox';
  }

  if (stem.includes('ran out of usb ports')
    && stem.includes('laptop')) {
    return 'usb-ports-port-replicator';
  }

  if (stem.includes('multiple, diverse environments')
    && stem.includes('least-expensive testing method')) {
    return 'type2-diverse-test-envs';
  }

  if (stem.includes('decommission a legacy application')
    && stem.includes('one year')) {
    return 'legacy-app-p2v-iaas';
  }

  if (stem.includes('corporate email on smartphones')
    && stem.includes('separates corporate and personal data')) {
    return 'mobile-email-mdm-container';
  }

  if (stem.includes('access local resources wherever the employees are while in the office')) {
    return 'office-common-ssid';
  }

  if (stem.includes('requires the connector to be attached in a specific orientation')) {
    return 'hdmi-specific-orientation';
  }

  if (stem.includes('misplaced smartphone')
    && stem.includes('locate')) {
    return 'locate-phone-satellite-gps';
  }

  if (stem.includes('function of an injector')) {
    return 'poe-injector-power';
  }

  if (stem.includes('international contractor')
    && stem.includes('destination')) {
    return 'international-power-cable';
  }

  if (stem.includes('most likely contains ecc memory')) {
    return 'file-server-ecc-memory';
  }

  if (stem.includes('used in different locations')
    && stem.includes('ip configurations')) {
    return 'laptop-dynamic-ip';
  }

  if (stem.includes('minimize the amount of heat')
    && stem.includes('power supply')) {
    return 'psu-energy-efficiency-heat';
  }

  if (stem.includes('shortest range')) {
    return 'nfc-shortest-range';
  }

  if (stem.includes('enabling bitlocker')) {
    return 'bitlocker-requires-tpm';
  }

  if (stem.includes('terminate a cat 6 cable')
    && stem.includes('patch panel')) {
    return 'patch-panel-punchdown-tool';
  }

  if (stem.includes('multiple instances of an application')
    && stem.includes('fewest resources')) {
    return 'containers-fewest-resources';
  }

  if (stem.includes('popular video games')
    && stem.includes('desktop machine')) {
    return 'gaming-pc-ram-dedicated-gpu';
  }

  if (stem.includes('standard for wi-fi 7')) {
    return 'wifi7-80211be';
  }

  if (stem.includes('reduce cabling requirements')
    && stem.includes('security cameras')) {
    return 'security-camera-poe';
  }

  if (stem.includes('no boot disk found')
    && (stem.includes('passes the hdd diagnostic test')
      || stem.includes('does pass the hdd diagnostic test'))) {
    return 'legacy-to-uefi-boot';
  }

  if (stem.includes('selecting objects on their tablet')
    && stem.includes('object that opens is to the right')) {
    return 'tablet-digitizer-calibration';
  }

  if (stem.includes('server memory modules')) {
    return 'server-memory-ecc';
  }

  if (stem.includes('three high-end graphics cards')
    && stem.includes('mission-critical')) {
    return 'gpu-workstation-psu-12v-redundancy';
  }

  if (stem.includes('corporate fileshare but cannot browse the internet')) {
    return 'internet-next-hop-gateway';
  }

  if (stem.includes('clicking sounds')
    && stem.includes('uefi post takes longer')) {
    return 'clicking-hdd-smart';
  }

  if (stem.includes('clicking sound')
    && stem.includes('long time for the system to start up')) {
    return 'clicking-hdd-replace';
  }

  if (stem.includes('mobile device to access a secure building')) {
    return 'secure-building-nfc';
  }

  if (stem.includes('vendor-hosted database server')) {
    return 'hosted-database-paas';
  }

  if (stem.includes('differentiates ddr4 ram from ddr3 ram')) {
    return 'ddr4-lower-voltage';
  }

  if (stem.includes('bare-metal servers')
    && stem.includes('consolidate the servers')
    && stem.includes('data privacy')) {
    return 'onprem-server-consolidation-containers';
  }

  if (stem.includes('environment that limits access to the os')) {
    return 'container-limits-os-access';
  }

  if (stem.includes('requirements for secure boot')
    && stem.includes('non-user- controllable keys')) {
    return 'secure-boot-tpm-uefi';
  }

  if (stem.includes('multiple vlans')
    && stem.includes('wire speed')) {
    return 'layer3-switch-intervlan';
  }

  if (stem.includes('on-site equipment until it is eol')
    && stem.includes('share data with the local data center')) {
    return 'hybrid-cloud-onsite-eol';
  }

  if (stem.includes('prohibits users from installing unapproved applications')
    && stem.includes('corporate tablets')) {
    return 'tablet-app-control-mdm';
  }

  if (stem.includes('isp cable modem')
    && stem.includes('wall jack')) {
    return 'cable-modem-f-type';
  }

  if (stem.includes('data centers')
    && stem.includes('high-performance machines')
    && stem.includes('types of ram')) {
    return 'datacenter-rdimm';
  }

  if (stem.includes('port 110')
    && stem.includes('automatically synchronizes with the server')) {
    return 'pop3-to-imap-sync';
  }

  if (stem.includes('voip')
    && stem.includes('peak hours')
    && optionText.includes('split services')) {
    return 'voip-vlan-split-services';
  }

  if (stem.includes('interference from rain')) {
    return 'satellite-rain-fade';
  }

  if (stem.includes('drive failure imminent')) {
    return 'drive-failure-imminent-replace-hdd';
  }

  if (stem.includes('share application resources with another business')) {
    return 'community-cloud-shared-business';
  }

  if (stem.includes('expansion card')
    && stem.includes('internet access')) {
    return 'internet-expansion-card-nic';
  }

  if (stem.includes('nvme port on the motherboard')) {
    return 'nvme-port-ssd';
  }

  if (stem.includes('automatically download email attachments')
    && stem.includes('malicious content')) {
    return 'email-attachment-sandbox';
  }

  if (stem.includes('remote desktop resources')
    && stem.includes('without providing physical workstations')) {
    return 'remote-desktop-resources-vdi';
  }

  if (stem.includes('commonly affected by high latency')) {
    return 'satellite-high-latency';
  }

  if (stem.includes('overall processing performance')
    && stem.includes('maximum system performance')) {
    return 'cpu-clock-frequency-performance';
  }

  if (stem.includes('radio frequency connections')) {
    return 'rf-satellite-cellular';
  }

  if (stem.includes('200-person call center')
    && optionText.includes('bandwidth dedicated')) {
    return 'call-center-insufficient-bandwidth';
  }

  if (stem.includes('testing environment')
    && stem.includes('execute unauthorized code')) {
    return 'unauthorized-code-virtual-machines';
  }

  if (stem.includes('projecting an image upside down')
    && stem.includes('ceiling-mounted projector')) {
    return 'projector-flip-vertical';
  }

  if (stem.includes('shares a host os')
    && stem.includes('shares kernel resources')) {
    return 'containers-shared-kernel';
  }

  if (stem.includes('install additional ram')
    && stem.includes('desktop computer')) {
    return 'desktop-ram-dimm';
  }

  if (stem.includes('local file server')
    && stem.includes('unable to access the internet')) {
    return 'local-fileserver-no-internet-gateway';
  }

  if (stem.includes('after replacing a laptop screen')
    && stem.includes('unable to see wi-fi connections')) {
    return 'laptop-screen-wifi-antenna-cables';
  }

  if (stem.includes('high-performance gaming laptop')
    && stem.includes('fast data access')) {
    return 'gaming-laptop-nvme-m2-ssd';
  }

  if (stem.includes('control which websites a user can access')) {
    return 'website-access-proxy-server';
  }

  if (stem.includes('protected from malicious software on startup')) {
    return 'secure-boot-startup-malware';
  }

  if (stem.includes('outer edge of the building')
    && stem.includes('slow connections')) {
    return 'wifi-edge-add-aps';
  }

  if (stem.includes('employees can only pick up their own printouts')) {
    return 'secure-print-release-pin-rfid';
  }

  if (stem.includes('most used in portable devices')) {
    return 'portable-devices-sodimm';
  }

  if (stem.includes('prioritize cable management')
    && stem.includes('power supply')) {
    return 'modular-psu-cable-management';
  }

  if (stem.includes('unable to unlock their smartphone')
    && stem.includes('input is unsuccessful')) {
    return 'smartphone-touch-screen-failed';
  }

  if (stem.includes('supplies power to an ip phone')) {
    return 'ip-phone-poe-switch';
  }

  if (stem.includes('workstation occasionally turns off')
    && stem.includes('smells burnt')) {
    return 'manufacturing-workstation-air-filter';
  }

  if (stem.includes('nearby electromagnetic interference')) {
    return 'emi-stp-cable';
  }

  if (stem.includes('characteristic to consider')
    && stem.includes('satellite internet')) {
    return 'satellite-increased-latency';
  }

  if (stem.includes('requires pairing')
    && stem.includes('new mobile accessory')) {
    return 'bluetooth-accessory-pairing';
  }

  if (stem.includes('ping gateway')
    && stem.includes('request timed out')) {
    return 'gateway-router-unreachable';
  }

  return '';
}

function getTargetedCore1Need(question) {
  switch (getTargetedCore1Scenario(question)) {
    case 'single-client-wifi':
      return '判断 single-user Wi-Fi issue（单个用户无线问题）：同一 open office 里别人正常，优先怀疑该 laptop wireless card（笔记本无线网卡）或本机无线硬件，而不是全局 interference（干扰）';
    case 'legacy-app-virtualization':
      return 'legacy application（遗留应用）从多physical servers（物理服务器）迁移到可维护、可隔离、可临时保留VMs（虚拟机），直到应用退';
    case 'spreadsheet-orientation':
      return '保持 duplex printing（双面打印）同时避免 spreadsheet columns（表格列）溢到第二面：调page orientation（页面方向）让横向空间变';
    case 'physical-port-loopback':
      return '验证 physical port（物理端口）本身是否能发接收信号：用 loopback plug（回环插头）做端口自';
    case 'home-office-unmanaged-switch':
      return 'home office（家庭办公室）低成本、低管理地给现有 internet service 增加更多有线设备端口：用 unmanaged switch（非管理型交换机）扩LAN 端口';
    case 'rj45-crimper':
      return '把双绞线线芯固定RJ45 connector（水晶头）里：用 crimper（压线钳）压接金属触';
    case 'hotspot-connectivity':
      return '在配件尽量少的情况下获得较好的移动网络连接：hotspot（热点）直接共享 cellular data（蜂窝数据）给设';
    case 'disabled-port-managed-switch':
      return '端口disabled（禁用）属于 switch port administration（交换机端口管理）；能禁启用端口的是 managed switch（管理型交换机）';
    case 'vlan-managed-switch':
      return '修改多个桌面所VLAN configuration（VLAN 配置）：连接managed switch（管理型交换机）调整 Port VLAN assignment（端VLAN 分配 VLAN membership（VLAN 成员关系';
    case 'plenum-cable':
      return '吊顶如果作为 air ventilation/plenum space（通风回风空间），必须plenum-rated copper cable（阻燃低烟通风线缆），重点是消低烟规范，不是线缆传输介';
    case 'dmarc-txt-record':
      return 'DMARC/SPF/DKIM 这类 email authentication（邮件认证）策略发布DNS TXT record（文本记录）里；MX 只负责邮件投递目的地';
    case 'phone-digitizer':
      return '手机 screen（屏幕显示）digitizer（触控数字化层）分开考：显示可能正常touch input（触摸输入）无响应时digitizer';
    case 'replace-patch-cable':
      return 'port flapping（端口反up/down）换交换机端口后仍持续，说明问题更可能在 device-to-wall patch cable（设备到墙口跳线）或端接，而不是原交换机端';
    case 'cloud-synchronization':
      return '本地文件夹能看到其他设备更新，是 cloud synchronization（云同步）：多设备之间保持文件状态一致，不是 availability（可用性）metered utilization（按量计费）';
    case 'ap-port-flapping':
      return 'AP 活动灯反复亮一下又掉线、设备不上线，像 Ethernet link up/down（以太网链路反复上下线），对port flapping，而不是无线信干扰问题';
    case 'raid6-two-drive-fault':
      return 'RAID 6 使用 dual parity（双重校验），可容忍 two drive failures（两块盘故障）而不丢数据；RAID 5 只能容忍一块盘';
    case 'private-cloud-local-datacenter':
      return 'exclusively local data center（只使用本地数据中心）对private cloud（私有云）；public 在云厂商，hybrid 混合本地和公有云，community 是多组织共享';
    case 'rj45-reterminate-crimper':
      return 'RJ45 pin not properly terminated（RJ45 针脚/线芯端接不良）需要重新压connector（水晶头），crimper（压线钳）；tester 只能验证问题';
    case 'cloud-email-saas':
      return '订阅云服务来提供 email（电子邮件）SaaS：直接使用云端应用；不是VM IaaS，也不是开发平PaaS';
    case 'company-resources-saas':
      return 'least infrastructure（最少基础设施）让员工 laptop 访问公司资源，通常 SaaS：供应商托管应用，用户用浏览器客户端直接访问';
    case 'type2-underlying-os':
      return 'Type 2 hypervisor（宿主型虚拟化）运行underlying host OS（底层宿主操作系统）之上；Type 1 才是 bare-metal（裸机）直接跑在硬件';
    case 'layer3-switch-intervlan':
      return 'multiple VLANs（多VLAN）要互通且要求 minimum hardware（最少硬件）wire speed（线速），Layer 3 switch（三层交换机）：它在交换机里inter-VLAN routing（VLAN 间路由），比外接 router 更贴';
    case 'slow-startup-hdd':
      return 'laptop slow startup（启动慢）常见瓶颈是 HDD（机械硬盘）寻道和随机读写慢；RAM/NIC/BIOS 通常不是“开机慢”的首选答';
    case 'managed-switch-vlan-feature':
      return 'managed switch（管理型交换机）的常考特征是 VLAN assignment（VLAN 分配）、端口管理、QoS 和监控；unmanaged switch 不做这些配置';
    case 'ftp-port-21':
      return 'file transfer（文件传输）端口题优先想FTP port 21；DNS 53，DHCP client 68，LDAP 389';
    case 'mobile-tethering':
      return '手机把移动网络共享给 laptop 使用tethering（网络共绑接）；hotspot 是常见方式，NFC/IR 不是给笔记本上网的主流方';
    case 'desktop-no-power-psu':
      return 'desktop PC completely does not turn on（完全不开机）优先怀PSU（电源供应器）或供电路径；GPU/RAM/CPU 更常见为开机后无显示、POST 或性能问题';
    case 'post-no-os-hdd':
      return 'passes POST 说明 CPU/RAM/主板基础自检过了；不能启OS 通常转向 boot device/storage（启动盘/硬盘';
    case 'malware-file-sandbox':
      return '测试可疑文件是否malware（恶意软件）应放sandbox（沙隔离环境），避免影响真实系统';
    case 'stylus-case-charging':
      return '同款公司 tablet 有人正常有人 stylus 充电断续，且用户自购 accessories（配件），优先怀case（保护壳）挡住触点或无线充电位置';
    case 'wifi-24ghz-penetration':
      return '无线穿墙能力通常 2.4GHz 最好；5GHz/6GHz 速度和容量更好但穿透更弱，NFC 是近场通信';
    case 'vdi-thin-client-streaming':
      return 'VDI（虚拟桌面基础架构）是服务器端运行桌面，把 GUI stream（图形界面流）给 thin client（瘦客户端）使用';
    case 'dr-vms-iaas':
      return '基于 virtual machines（虚拟机）的 disaster recovery（灾难恢复）最贴近 IaaS：云端提供计存储/网络来承VM';
    case 'bluetooth-pin-pairing':
      return 'Bluetooth 配对常用 PIN/passcode（配对码）确认双方授权；BitLocker/TPM/biometrics 不是蓝牙车载配对的直接安全动';
    case 'usb-c-thunderbolt-video':
      return 'USB-C 只是接口形状，不代表一定支Thunderbolt/DisplayPort Alt Mode；能充电不代表能输出 projector video（投影视频）';
    case 'global-pc-input-voltage':
      return '全球远程部署 desktop PC 时要确认 input voltage（输入电压）/电源适配范围，避免不同国家电压不兼容';
    case 'affordable-capacity-hdd':
      return '只要 large affordable capacity（大容量低成本）且不关心读取速度，机HDD NVMe/SSD/SAS 更符合题';
    case 'laptop-docking-station':
      return 'docking station（扩展坞）利用笔记本专用/高速接口扩展本地连接，如显示器、网口、USB 和电';
    case 'usb-c-data-video':
      return 'USB-C 可同时支charging/data/video（充数据/视频），前提是线缆和端口支持对应协议；它比单HDMI/DP 更通用';
    case 'ram-ecc-errors':
      return 'ECC RAM（纠错内存）能检测并纠正内存位错误，常见于服务器；DIMM/SODIMM 是外形规格，不等于纠错能';
    case 'vdi-less-workstation-config':
      return 'VDI（虚拟桌面）把桌面集中托管，终端只访问桌面会话；优势是减少每workstation（工作站）的手动配置和本地维';
    case 'remote-tablet-mdm':
      return '公司 tablet 在办公室能访问 secure apps、在家不行，常见是 MDM（移动设备管理）策略、合规或远程访问配置需要调整';
    case 'bitlocker-tpm':
      return 'BitLocker 加密 boot drive（启动盘）通常依赖 TPM（可信平台模块）安全存储密钥；无法加密时先检TPM 是否存在/启用';
    case 'projector-keystone':
      return '投影画面上宽下窄或梯形变形是 keystone（梯形校正）问题，不是线缆、分辨率或电源循环优';
    case 'server-drive-sas':
      return 'SAS（Serial Attached SCSI）常用于服务企业存储，SATA 更常见于家用/普通桌面，NVMe/PCIe 是高SSD 通道';
    case 'memory-channel-config':
      return '提升内存 module bandwidth（模块带宽）channel configuration（通道配置），dual-channel/quad-channel；ECC 是纠错，不是带宽';
    case 'phone-car-port-cleaning':
      return '手机在车内充电时集成功能反复断开/重启，且无恶意软件，优先清洁 connection port（连接口）或检查接口接触不';
    case 'eol-system-virtualize':
      return 'EOL 旧系统无法升级且可能跑不了现代硬件时，把 entire system virtualize（整机虚拟化）到兼容 hypervisor，可延长使用并减少硬件依';
    case 'rdp-port-3389':
      return 'Remote Desktop Protocol（RDP，远程桌面）默认端口TCP 3389；A+ 端口题要把服务和端口号直接配';
    case 'wrong-time-cmos-battery':
      return '电脑每次开机时间又错，常见CMOS battery（CMOS 电池）无法在断电后保BIOS/RTC 时间';
    case 'burning-smell-power-off-inspect':
      return 'laptop burning smell（烧焦味）先关机断电并检查异物、液体和内部损坏；这属于安全优先题，不要继续通电测试';
    case 'managed-vs-unmanaged-switch':
      return 'unmanaged switch 即插即用、少配置；managed switch 功能更多，可配置 VLAN、端口、安全和监控，但需要管';
    case 'usb-os-boot-options':
      return '要让 USB drive 里的 OS 开机自动加载，需要在 BIOS/UEFI boot options（启动选项）里调整启动顺序';
    case 'test-oses-hypervisor':
      return '同时运行多个 test OS（测试操作系统）最适合 hypervisor（虚拟机管理程序），比多重启动更适合并发访问';
    case 'rural-minimal-infrastructure-cellular':
      return 'less populated areas（人口较少地区）minimal infrastructure（基础设施少）时，cellular（蜂窝网络）覆盖部署更快；fiber/cable/DSL 需要更多有线基础设施';
    case 'disable-telnet-port-23':
      return 'remote connectivity 安全加固题：port 23 Telnet（明文远程登录），应禁用；SSH 22，SMTP 25，DNS 53';
    case 'ram-half-detected-reseat-slots':
      return '新装两条 DIMM 后系统只识别一半内存，先用低成本步reseat/reinstall RAM in different slots（重新插内存/换插槽），排除未插牢或通道/插槽问题';
    case 'fiber-symmetrical-speed':
      return 'extremely high data transfer（极高传输）symmetrical upload/download（上下行对称）优先fiber（光纤）；cable/DSL 常见上下行不对称';
    case 'raid0-fast-low-cost':
      return 'RAID 0 striping（条带化）提read speed（读取速度）且成本最低，但没redundancy（冗余）；题干只要快读和低成';
    case 'modern-mobile-usb-c':
      return '现代移动设备充电、data/audio/video（数音频/视频）一线多用，优先USB-C；MicroUSB/MiniUSB 老旧，Lightning 主要Apple 生';
    case 'firewall-acl-capabilities':
      return 'ACL（访问控制列表）按源/目的/端口/协议允许或拒绝流量，常见firewall（防火墙）或管理型网络设备；PoE injector/DSL/unmanaged switch 不做 ACL';
    case 'ntp-time-sync':
      return 'automatic time synchronization（自动时间同步）对应 NTP（Network Time Protocol，网络时间协议）；DHCP 分地址，AAA 做认证授权审';
    case 'server-ram-ecc':
      return 'server RAM（服务器内存）常ECC（纠错码内存），能检纠正 bit errors（位错误），提升稳定性；SODIMM 是笔记本外形规格';
    case 'enroll-phone-mdm':
      return '新手机要接入 corporate email/apps（企业邮应用）通常必须 enroll in MDM（注册进移动设备管理），让策略、证书、配置下发到设备';
    case 'cloud-elasticity-autoscale':
      return '根据 demand（需求）自动增减 instances（实例）elasticity（弹性）；scalability 是能扩展，availability 是可用性，multitenancy 是多租户';
    case 'hypervisor-hosts-vms':
      return 'physical server 承载 multiple virtual machines（多台虚拟机）靠 hypervisor（虚拟机管理程序）分CPU/RAM/storage 并隔VM';
    case 'microservices-containers':
      return 'microservices（微服务）常containers（容器）运行：轻量、启动快、每个服务独立打包；VDI 是桌面，hypervisor 是虚拟机';
    case 'pcie-nvme-high-end-build':
      return '高端显卡需PCIe slot（PCIe 插槽）；fastest hard drive/SSD 常NVMe（走 PCIe 的高SSD）。Molex/SATA/FireWire/USB-C 不同时满足两';
    case 'ethernet-patched-toner-probe':
      return 'track where an Ethernet cable is patched（追踪网线接到哪里）toner probe/cable toner（寻线器）；crimper 压头，punchdown 打线，stripper 剥线';
    case 'gps-assisted-by-wifi':
      return 'smartphone location services（手机定位）不准时，Wi-Fi can assist GPS（Wi-Fi 辅助定位）通过附近 AP/网络位置提高定位速度和准确';
    case 'factory-motor-interference':
      return 'laptop 放在 factory motor（工厂电机）上才断网，题眼是 external interference（外部电磁干扰）；jitter/latency 是网络传输质量指';
    case 'nvme-m2-characteristic':
      return 'A+ NVMe drive 常和 M.2 interface（M.2 接口PCIe 高速存储绑定；7200rpm HDD，Molex 是旧电源接头';
    case 'coax-cable-internet-f-type':
      return 'cable internet（有线电视宽带）使用 coaxial（同轴）布线时，常见终端 connector F-type；RJ45 是以太网，ST 是光纤，DB9 是串';
    case 'projector-overheating-filter':
      return '投影 30 分钟后画面切断、换笔记本仍复现audio 正常，说明不是电脑问题；LCD projector 常因 filter（滤网）堵塞过热保护关画';
    case 'vpn-secured-channel':
      return '不同地点 workstation 之间建立 secured communication channel（安全通信通道）并credentials 认证，关键词就是 VPN（虚拟专用网络）';
    case 'fiber-light-transmission':
      return 'beam of light（光束）flexible cable 中传输数据是 fiber optic（光纤）；single-mode fiber 常考长距离、高速光传输';
    case 'modular-psu-cable-management':
      return 'custom PC minimize power cables（减少电源线）并保持机箱整洁，modular PSU（模组化电源），只接需要的电源';
    case 'tpm-computer-encryption':
      return '公司要求电脑加密时，TPM（可信平台模块）用于安全存储 encryption keys（加密密钥）并支BitLocker/设备加密';
    case 'sandbox-isolated-vm':
      return 'isolated virtual machine（隔离虚拟机）用于安全测试或隔离运行环境，常sandbox（沙箱）；hypervisor 是承载它的底层技';
    case 'linux-oses-hypervisor':
      return '同时评估多个 desktop Linux OSs（桌Linux 系统）要hypervisor 创建多台 VM 并行测试，比一台机器反复重装更高效';
    case 'document-open-save-ssd-upgrade':
      return '打开/保存文档慢且配置瓶颈7200RPM HDD，minor upgrade（小升级）最有效是换 2.5 SATA SSD，随机读写远快于机械硬盘';
    case 'saas-videoconferencing':
      return 'videoconferencing（视频会议）是典SaaS：用户直接使用云端应用；hosted database 更像 PaaS，hypervisor/IaaS 更偏基础设施';
    case 'cpu-overheat-heat-sink':
      return 'CPU 温度50C 升到 98C random shutdown（随机关机）是散热问题；high-performance heat sink（高性能散热器）最贴近根因';
    case 'firewall-block-unwanted-traffic':
      return 'firewall（防火墙）的核心目的就是 block unwanted traffic（阻止不需不安全流量），通过规则控制进出网络或主机的通信';
    case 'laptop-faulty-battery':
      return 'laptop 随机关机、充电断续、离开充电时屏幕变暗，最faulty battery（电池故障）导致供电不稳；digitizer/malware 不解释供电症';
    case 'swollen-phone-battery':
      return 'smartphone swollen（手机鼓包）几乎就是 swollen battery（电池膨胀）安全问题，replace battery/停止使用；不要靠换壳或恢复出厂解';
    case 'displayport-hdcp':
      return 'HDCP（高带宽数字内容保护）用于数字视频内容保护；在给定选项DisplayPort 支持 HDCP，VGA/DVI-A/F-type 不符';
    case 'hosted-type2-hypervisor':
      return 'interaction via an OS running on the host（通过宿主 OS 交互）描Type 2 hypervisor（宿主型虚拟化）；Type 1 直接跑在硬件';
    case 'asset-inventory-rfid':
      return 'asset inventory（资产盘追踪）常RFID（射频识别）标签批量识别设备；NFC 距离更短，Bluetooth/Wi-Fi 不是资产标签首';
    case 'raid1-two-drive-mirror':
      return '两块硬盘要防单盘故障，RAID 1 mirror（镜像）把数据写到两块盘；RAID 0 无冗余，RAID 5/10 需要更多盘';
    case 'switch-mac-forwarding':
      return 'switch（交换机）根MAC address（MAC 地址）转发二层帧；router/gateway 看三IP，firewall 负责策略过滤';
    case 'lte-sharing-hotspot':
      return 'mobile device 分享 LTE connection 给附近设备，常考答案是 hotspot（热点）；cellular 是上游连接类型，不是共享方式';
    case 'international-esim':
      return '出国calls/emails 都不可用，题眼是 international service/profile（国际服务配置）；International eSIM 可提供当国际蜂窝语音和数据连';
    case 'malicious-indicators-sandbox':
      return 'malicious indicators（恶意迹象）要安全检查，放进 sandbox（沙箱）隔离执行/观察，避免污染真实系';
    case 'usb-ports-port-replicator':
      return '笔记USB ports 不够时，port replicator（端口复制器/扩展坞）扩展本地接口；NFC/Bluetooth/USB receiver 不是增加多个有线端口';
    case 'type2-diverse-test-envs':
      return 'least-expensive 且要 full experience of target environments（完整目标环境体验），Type 2 hypervisor 可在现有电脑上跑多种完整 OS VM';
    case 'legacy-app-p2v-iaas':
      return 'legacy application 只需保留一年并退役，P2V（物理转虚拟）后托管IaaS 可快速迁移旧环境，避免重构到 PaaS';
    case 'mobile-email-mdm-container':
      return '企业手机访问 email 且要 separate corporate/personal data（分离公司和个人数据），对应 MDM/MAM 管理与工作资料隔';
    case 'office-common-ssid':
      return '员工在办公室不同位置都要访问 local resources，用 common SSID（统一无线网络名）Wi-Fi 覆盖办公区，方便漫游接入局域网资源';
    case 'hdmi-specific-orientation':
      return 'HDMI connector（HDMI 接头）有固定方向；USB-C Lightning 可正反插，coaxial 圆形螺纹不按上下方向';
    case 'locate-phone-satellite-gps':
      return '定位丢失 smartphone（手机）依赖 GPS/satellite positioning（卫星定位）这类位置服务；NFC/Bluetooth 距离太短，DSL 无关';
    case 'poe-injector-power':
      return 'injector 在网络题里常PoE injector（以太网供电注入器），把 power（电力）注入 Ethernet cable，同时保留数据连';
    case 'international-power-cable':
      return '国际设备交付最可能因目的地变化的是 power cable（电源线/插头规格），因为国家插头形状和电压标准不同；Ethernet/USB 通常通用';
    case 'file-server-ecc-memory':
      return 'file server（文件服务器）需要稳定可靠，最可能使用 ECC memory（纠错内存）；游戏机/手机/普通笔记本通常不以 ECC 为常考特';
    case 'laptop-dynamic-ip':
      return 'laptop 会在不同 locations（地点）使用，最适合 dynamic IP/DHCP（动态地址），避免每到一个网络都手动static IP';
    case 'psu-energy-efficiency-heat':
      return '想让 power supply 产生更少 heat（热量），看 better energy efficiency（更高能效）；效率高表示浪费成热的电更少';
    case 'nfc-shortest-range':
      return 'NFC（近场通信）范围最短，通常几厘米；Bluetooth.4GHz Wi-FiG 都是更远距离无线技';
    case 'bitlocker-requires-tpm':
      return 'enabling BitLocker（启BitLocker）常要求 TPM 存储密钥并验证启动完整性；SAN/ARM/HSM 不是普通电脑启BitLocker 的必需';
    case 'patch-panel-punchdown-tool':
      return 'Cat 6 cable 端接patch panel（配线架）要punchdown tool（打线工具）压入 IDC 端子；crimper 用于 RJ45 水晶';
    case 'containers-fewest-resources':
      return '同一机器上跑多个 app instances fewest resources（最少资源），用 containerization（容器化）共享宿主内核，比每个实例一VM 更轻';
    case 'gaming-pc-ram-dedicated-gpu':
      return '新游戏电脑常dedicated graphics card（独立显卡）high amount of RAM（较大内存）；集成显低瓦电源不适合热门游戏';
    case 'wifi7-80211be':
      return 'Wi-Fi 7 标准802.11be02.11ax Wi-Fi 6/6E02.3at PoE+02.15.1 Bluetooth';
    case 'security-camera-poe':
      return 'security cameras（安防摄像头）减少布线用 PoE（Power over Ethernet，以太网供电），一根网线同时传 data power';
    case 'legacy-to-uefi-boot':
      return 'No boot disk found HDD diagnostic pass（硬盘检测通过），说明硬盘硬件可能没坏；优先检BIOS boot mode，legacy/UEFI 不匹配会找不到启动盘';
    case 'tablet-digitizer-calibration':
      return 'tablet 触控点和实际打开位置偏移，题眼是 digitizer calibration（触控数字化层校准），不是换 stylus 或清洁屏';
    case 'server-memory-ecc':
      return 'server memory modules（服务器内存模块）典型特征是 ECC（纠错）；RGB 是灯效，static 不是常见模块类型，SODIMM 多见于笔记本';
    case 'gpu-workstation-psu-12v-redundancy':
      return '三块高端 GPU workstation 需要足12V output2V 输出）供显卡/CPU，并mission-critical（关键任务）要求 redundancy（冗余电源）';
    case 'internet-next-hop-gateway':
      return '能访corporate fileshare（本内网资源）但不能上网，常见是 default gateway/next hop（默认网下一跳）错误；本地链路和 IP 未必有问';
    case 'clicking-hdd-smart':
      return 'HDD clicking（硬盘异响）POST 变慢，先启用/查看 S.M.A.R.T.（自监测分析与报告技术）检查硬盘健康状';
    case 'clicking-hdd-replace':
      return 'clicking sound（咔哒声）加启动很慢是机HDD 失效前兆；SSD 没有机械咔哒声，fan/RAM 不解释启动盘异响';
    case 'secure-building-nfc':
      return 'mobile device access secure building（手机门禁）常用 NFC（近场通信）模拟门禁卡/凭证；hotspot/geolocation 不负责门禁认';
    case 'hosted-database-paas':
      return 'vendor-hosted database server（厂商托管数据库）通常PaaS：用户使用数据库平台，厂商管理底OS/硬件；IaaS 是租 VM 自管数据';
    case 'ddr4-lower-voltage':
      return 'DDR4 相比 DDR3 的常考区别是 lower operating voltage（更低工作电压），带来更好能效；DIMM 宽度/单双面不是区分核';
    case 'onprem-server-consolidation-containers':
      return '题库server consolidation（服务器整合）且担心 data privacy/recurring costs（数据隐持续费用）指containers（容器）：尽量留在自有环境、减少每workload 的系统开销；真实项目还要确认混OS workload 是否能容器化';
    case 'container-limits-os-access':
      return 'application 需要在限制 OS access（限制访问宿主系统）的环境中测试，container（容器）能用 namespace/cgroup 隔离进程和资源，比完VM 更轻';
    case 'secure-boot-tpm-uefi':
      return 'Secure Boot（安全启动）需UEFI 固件执行签名验证，TPM（可信平台模块）可保护密度量；non-user-controllable keys 指向硬件/固件信任';
    case 'layer3-switch-intervlan':
      return 'multiple VLANs 之间要互通、minimum hardware、wire speed，Layer 3 switch（三层交换机）：在交换机内做 inter-VLAN routing（VLAN 间路由）';
    case 'hybrid-cloud-onsite-eol':
      return '继续使用 on-site equipment（本地设备）直到 EOL，同时和本地数据中心共享数据，属hybrid cloud（混合云）：本地与云/外部资源协同';
    case 'tablet-app-control-mdm':
      return 'corporate tablets 禁止安装 unapproved apps（未批准应用），MDM（移动设备管理）下发应用白名黑名单和设备合规策略';
    case 'cable-modem-f-type':
      return 'ISP cable modem wall jack（墙上同轴口）常F-type connector；LC 是光纤，RJ45 是以太网，Lightning Apple 移动设备接口';
    case 'datacenter-rdimm':
      return 'data center/high-performance machines 常用 RDIMM（Registered DIMM，寄存缓冲内存）提高大容量内存稳定性；ECC 是纠错能力，RDIMM 是服务器模块类型';
    case 'pop3-to-imap-sync':
      return 'port 110 POP3，通常偏下载邮件；secure connection automatically synchronizes with server（自动与服务器同步），题库指IMAP（实际安IMAP 常用 993';
    case 'voip-vlan-split-services':
      return 'VoIP peak hours 通话质量差时，把 voice/data split by VLAN（语音和数据VLAN）可隔离广播域并便于 QoS；题干给的选项里这是最贴近服务分离的动';
    case 'satellite-rain-fade':
      return 'rain interference（雨衰）最常影satellite internet（卫星互联网），因为无线信号穿过大气降雨会衰减；光纤/DSL/有线电视不直接受雨衰影响';
    case 'drive-failure-imminent-replace-hdd':
      return 'Drive failure imminent（硬盘即将故障）SMART/固件健康告警，不能靠继续F1；应 replace hard disk（更换硬盘）并先备份数据';
    case 'community-cloud-shared-business':
      return '多个组织/企业共享 application resources（应用资源）且有共同需求，community cloud（社区云）；public 面向大众，private 单组织专';
    case 'internet-expansion-card-nic':
      return 'desktop expansion card 用来提供 internet/network access（网络访问）就是 NIC（Network Interface Card，网卡）；GPU/sound/capture 分别处理图形/音频/采集';
    case 'nvme-port-ssd':
      return 'motherboard NVMe port/slot 用来安装 NVMe SSD（固态硬盘），不SATA/SAS/optical drive；NVMe 是高SSD 协议/接口方向';
    case 'email-attachment-sandbox':
      return '自动下载 email attachments 检malicious content（恶意内容）应放sandbox（沙箱）隔离分析，避免附件在真实系统直接执行';
    case 'remote-desktop-resources-vdi':
      return 'remote desktop resources without physical workstations（不给用户物理工作站也提供桌面资源）VDI（虚拟桌面基础架构';
    case 'satellite-high-latency':
      return 'high latency（高延迟）最常和 satellite（卫星）连接绑定，因为信号往返卫星距离远；fiber/cable/DSL 通常延迟更低';
    case 'cpu-clock-frequency-performance':
      return 'overall processing performance（处理性能）题眼落CPU，clock frequency（时钟频率）直接影响每秒处理周期；VRM/电源接头不是性能指标本身';
    case 'rf-satellite-cellular':
      return 'radio frequency connections（射频连接）是通过无线电波传输，典型是 satellite（卫星）cellular（蜂窝）；Ethernet/fiber/DSL/cable 是有线介';
    case 'call-center-insufficient-bandwidth':
      return '200-person call center 忙时 VoIP 降级，speed test 总带宽只50Mbps QoS/VLAN 已配置，最可能dedicated bandwidth（专用带宽）不足';
    case 'unauthorized-code-virtual-machines':
      return 'testing environment 执行 unauthorized code（未授权代码）常用 virtual machines（虚拟机）隔离测试环境，方便快照/回滚，避免污染主机';
    case 'projector-flip-vertical':
      return 'ceiling-mounted projector（吊装投影仪）画upside down（倒置）时，应projector 设置flip image vertically（垂直翻转），不是改输入源或频率';
    case 'containers-shared-kernel':
      return 'shares host OS/kernel resources、rapid start、limited isolation containers（容器）的典型特征；VM 有独guest OS，隔离更强但更重';
    case 'desktop-ram-dimm':
      return 'desktop computer（台式机）加内存通常DIMM（台式内存条）；SODIMM 是笔记本小内存条，ECC/registered 是服务器/稳定性特';
    case 'local-fileserver-no-internet-gateway':
      return '能访local file server（本地文件服务器）但不能上网，说明本LAN 通；restore internet access 通常set gateway（设置默认网关）';
    case 'laptop-screen-wifi-antenna-cables':
      return '更换 laptop screen 后看不到 Wi-Fi，常见是屏幕边框内的 Wi-Fi antenna cables（无线天线线）没接好；先检查线缆连';
    case 'gaming-laptop-nvme-m2-ssd':
      return 'high-performance gaming laptop fast data access/transfer rates（快速数据访传输），NVMe M.2 SSD，比 SATA HDD/SAS/机械盘更贴题';
    case 'website-access-proxy-server':
      return '控制用户能访问哪websites（网站）通常proxy server/web filter（代网页过滤），可按 URL/类别做访问控';
    case 'secure-boot-startup-malware':
      return 'Windows 11 启动时防 malicious software（恶意软件）加载，启Secure Boot（安全启动）验证启动组件签名；TPM 支持信任链但本题动作Secure Boot';
    case 'wifi-edge-add-aps':
      return '用户building outer edge（建筑边缘）信号慢且掉线，是 coverage（覆盖）不足；安additional wireless APs（额外无AP）扩大覆';
    case 'secure-print-release-pin-rfid':
      return '只允许员工领取自己的 printouts（打印件）是 secure print release（安全打印释放），常User PIN（用PIN）和 RFID（刷工牌';
    case 'portable-devices-sodimm':
      return 'portable devices/laptops（便携设笔记本）常用 SODIMM（小型内存模块）；ECC/RAID/SATA 不是“便携设备内存外形”的答案';
    case 'smartphone-touch-screen-failed':
      return 'smartphone 无法输入解锁码且 input unsuccessful（触控输入失败），最可能touch screen/digitizer（触摸屏/触控层）故障，而不OLED 显示';
    case 'ip-phone-poe-switch':
      return 'IP phone（IP 电话）常PoE switch（以太网供电交换机）通过网线供电并联网；patch panel/fiber router/DSL 不直接给电话供电';
    case 'manufacturing-workstation-air-filter':
      return '制造环境、需respirators（呼吸防护）说明空气粉尘重；workstation 关机burnt smell（烧焦味）常intake air filter（进气滤网）堵塞导致过热';
    case 'emi-stp-cable':
      return 'nearby EMI（电磁干扰）可能存在时，STP（屏蔽双绞线）抵抗干扰；UTP 无屏蔽，Thunderbolt/USB 不是建筑网线选择';
    case 'satellite-increased-latency':
      return 'satellite internet（卫星互联网）的常考缺点是 increased latency（更高延迟），因为信号路径长；不需要靠近城市基建或蜂窝';
    case 'bluetooth-accessory-pairing':
      return 'new mobile accessory 初次使用需pairing（配对）通常Bluetooth（蓝牙）；NFC/RFID 是近场识别，Lightning cable 是有线连';
    case 'gateway-router-unreachable':
      return 'ipconfig gateway，ping gateway 名称能解析到 192.168.1.1 request timed out，DNS/DHCP 已基本工作，source of issue 更像 router/default gateway 不可';
    default:
      return '';
  }
}

function hasTargetedCore1OptionExplanation(scenario) {
  return new Set([
    'single-client-wifi',
    'legacy-app-virtualization',
    'spreadsheet-orientation',
    'physical-port-loopback',
    'home-office-unmanaged-switch',
    'rj45-crimper',
    'hotspot-connectivity',
    'disabled-port-managed-switch',
    'vlan-managed-switch',
    'plenum-cable',
    'dmarc-txt-record',
    'phone-digitizer',
    'replace-patch-cable',
    'cloud-synchronization',
    'ap-port-flapping',
    'raid6-two-drive-fault',
    'private-cloud-local-datacenter',
    'rj45-reterminate-crimper',
    'cloud-email-saas',
    'company-resources-saas',
    'type2-underlying-os',
    'layer3-switch-intervlan',
  ]).has(scenario);
}

function explainTargetedCore1Option(question, option, isCorrect) {
  const text = normalizeText(option.text);
  const scenario = getTargetedCore1Scenario(question);

  if (scenario === 'single-client-wifi') {
    if (text.includes('wireless card')) {
      return 'wireless card（无线网卡）是本题答案。题眼是 other users are not experiencing this issue（其他人没有问题）：同一 open office 环境下只有一laptop 间歇断线，最client-side hardware/driver（客户端硬件/驱动）问题。考试里看到“只有一个用户异常”，先查该设备本身';
    }
    if (text.includes('other wi-fi signals') || text.includes('interference')) {
      return 'Wi-Fi interference（无线干扰）通常会影响同一区域内多台设备，尤其题干open office（开放办公区）且其他用户正常，所以它不如单台 laptop wireless card（无线网卡）直接';
    }
    if (text.includes('same frequency')) {
      return 'All wireless devices are on the same frequency（所有设备同频）说法太泛；常考的性能问题通常channel congestion（信道拥塞），而且会影响多名用户，不会只让一laptop 间歇异常';
    }
    if (text.includes('antenna')) {
      return 'antenna near electromagnetic interference（天线靠近电磁干扰源）更AP/天线部署问题，通常影响覆盖范围内多台设备。题干强调其他用户正常，所以不是最直接答案';
    }
  }

  if (scenario === 'legacy-app-virtualization') {
    if (text.includes('virtualization')) {
      return 'Virtualization（虚拟化）是本题答案。legacy application（遗留应用）暂时不能退役时，把三台 physical servers（物理服务器）迁VMs（虚拟机）可以保留旧环境、减少硬件依赖、方便备迁移，适合“maintain until retired（维护到退役）”';
    }
    if (text === 'san') {
      return 'SAN（存储区域网络）解决的是 centralized block storage（集中块存储），不是把旧应用和旧服务器环境迁移、隔离、延寿。它可能配合虚拟化使用，但不是本concept（概念）答案';
    }
    if (text === 'faas') {
      return 'FaaS（函数即服务）适合事件触发的无服务器函数。legacy app 已经跑在三台 physical servers 上，迁到 FaaS 通常需要重构应用，不适合“维持到退役”的低风险方案';
    }
    if (text.includes('configuration management')) {
      return 'Configuration management platform（配置管理平台）用于批量配置、补丁、状态管理。它能维护服务器，但不能把三台物理服务器整合成可迁移的旧环境；本题核心是 virtualization';
    }
  }

  if (scenario === 'spreadsheet-orientation') {
    if (text.includes('page orientation')) {
      return 'Change the page orientation（改变页面方向）是本题答案。spreadsheet columns（表格列）横向太宽时，把 portrait（纵向）改成 landscape（横向）能增加页面宽度，同时仍保duplex printing（双面打印）';
    }
    if (text.includes('turn off duplex')) {
      return 'Turn off duplex printing（关闭双面打印）会违反题still print on both sides（仍然双面打印）的限制。考试里遇到明确限制，不能选直接破坏限制的选项';
    }
    if (text.includes('smaller font')) {
      return 'smaller font size（缩小字体）可能勉强塞下内容，但会降低可读性；题干difficult to read，最佳做法是调整 page orientation（页面方向），不是把字再变小';
    }
    if (text.includes('print driver')) {
      return 'print driver（打印驱动）问题通常表现为功能不可用、格式异常或设备通信问题。本题是 spreadsheet layout（表格版式）太宽，先改页面方向';
    }
  }

  if (scenario === 'physical-port-loopback') {
    if (text.includes('loopback plug')) {
      return 'loopback plug（回环插头）是本题答案。它把端口的 transmit/receive（发接收）回接，用来 confirm a physical port is working（确认物理端口是否工作）。这是端口自测，不是找线或抓包';
    }
    if (text.includes('network tap')) {
      return 'network tap（网络分流器）用于复live traffic（实时流量）给分析设备，常见packet capture（抓包）。它不验证端口自身的发接收硬件是否正常';
    }
    if (text.includes('crimper')) {
      return 'crimper（压线钳）用于制RJ45 cable（网线水晶头），把线芯压connector（金属触点）。本题问 confirm a physical port works（确认端口硬件是否工作），应loopback plug，不是压线工具';
    }
    if (text.includes('patch panel')) {
      return 'patch panel（配线架）是被动布线管理设备，用来集中端接和跳线。它能帮你整切换线路，但不能让端transmit/receive 自测，所以不physical port tester（物理端口测试工具）';
    }
  }

  if (scenario === 'home-office-unmanaged-switch') {
    if (text.includes('unmanaged switch')) {
      return 'unmanaged switch（非管理型交换机）是本题答案。它能在现有 router/modem 后面低成本增加多LAN ports（局域网端口），即插即用，几乎不需administration（管理）';
    }
    if (text.includes('dsl modem') || text.includes('cable modem')) {
      return 'modem（调制解调器）连ISP 接入线路，解决“把互联网带进家里”。题干说 existing internet service（已有互联网服务），现在只是add additional devices（增加设备），所以不该再modem';
    }
    if (text.includes('firewall')) {
      return 'firewall（防火墙）主要做 traffic filtering/security（流量过安全控制）。它不是最便宜、最少管理地扩展多个设备接入的工具';
    }
  }

  if (scenario === 'rj45-crimper') {
    if (text.includes('crimper')) {
      return 'crimper（压线钳）是本题答案。制Ethernet patch cable（以太网跳线）时，把线芯排进 RJ45 connector（水晶头）后，用 crimper 压下金属触点固定线芯';
    }
    if (text.includes('cable stripper')) {
      return 'cable stripper（剥线钳）只负责剥外皮，帮助露出双绞线线芯；它不wires connect to RJ45 connector（线芯压接进水晶头）';
    }
    if (text.includes('punchdown')) {
      return 'punchdown tool（打线工具）用于把线压进 patch panel/keystone jack（配线架/信息模块）的 IDC 槽，不用RJ45 plug（水晶头）压接';
    }
    if (text.includes('loopback plug')) {
      return 'loopback plug（回环插头）用于端口自测，把 transmit/receive（发接收）回接来确认端口硬件是否工作。它不制作网线，也不把线芯压RJ45 connector';
    }
  }

  if (scenario === 'hotspot-connectivity') {
    if (text.includes('hotspot')) {
      return 'Hotspot（热点）是本题答案。它cellular data（蜂窝数据）laptop/tablet 提供网络，通常不需要额外线缆，性能也比 Bluetooth tethering（蓝牙共享）NFC 这类短距连接更适合上网';
    }
    if (text.includes('lightning')) {
      return 'Lightning cable（Lightning 线）是某Apple 设备的数充电线，可能用于有线共享，但需要线缆和兼容设备；题干强limited necessary accessories（尽量少配件），hotspot 更直接';
    }
    if (text.includes('nfc')) {
      return 'NFC（近场通信）距离极短，适合 tap-to-pay（轻触支付）、门禁或配对触发，吞吐低且不能给 laptop/tablet 提供正常上网体验。本题要 best connectivity performance，应hotspot';
    }
    if (text.includes('bluetooth')) {
      return 'Bluetooth（蓝牙）可以tethering（网络共享），但吞吐和稳定性通常不如 Wi-Fi hotspot（无线热点），所以不best connectivity performance';
    }
  }

  if (scenario === 'disabled-port-managed-switch') {
    if (text.includes('managed switch')) {
      return 'managed switch（管理型交换机）是本题答案。只有可管理交换机通常administratively disable/enable a port（管理性禁启用端口）、配VLAN、查看端口状态；题干已经确认 port is disabled';
    }
    if (text.includes('patch panel')) {
      return 'patch panel（配线架）是被动布线设备，不administratively disable（管理性禁用）端口。它可能导致物理断开或跳线错误，但题干说 port is disabled，指managed switch 的端口配置';
    }
    if (text.includes('physical nic')) {
      return 'Physical NIC（物理网卡）坏了会让本机无法联网，但题干确认的是 port is disabled（端口被禁用），更像 switch port 管理状态，不是网卡本身';
    }
    if (text.includes('firewall')) {
      return 'stand-alone firewall（独立防火墙）会过滤/阻断流量，但通常不会把某switch physical port（交换机物理端口）标记为 disabled';
    }
  }

  if (scenario === 'vlan-managed-switch') {
    if (text.includes('managed switch')) {
      return 'managed switch（管理型交换机）是本题答案。Port VLAN assignment（端VLAN 分配）和 VLAN membership（VLAN 成员关系）属于交换机管理功能；要sales office desktops VLAN，就连接managed switch';
    }
    if (text.includes('modem')) {
      return 'modem（调制解调器）负ISP 接入，把外部线路接入网络。VLAN configuration（VLAN 配置）发生在 LAN 交换侧，办公desktops 属于交换机端VLAN 管理，不modem 的工作';
    }
    if (text.includes('hub')) {
      return 'hub（集线器）是老式 Layer 1（一层）设备，只重复电信广播流量，没MAC learning、端口管理或 VLAN configuration 能力；要改桌VLAN 必须managed switch';
    }
    if (text.includes('poe injector')) {
      return 'PoE injector（PoE 注入器）只把 power（电力）注入 Ethernet cable（以太网线），常AP/摄像IP phone 供电。它不做 switching，也不能配置 VLAN';
    }
  }

  if (scenario === 'plenum-cable') {
    if (text.includes('plenum')) {
      return 'Plenum（通风夹层级线缆）是本题答案。suspended ceiling used for air ventilation（吊顶同时作为通风回风空间）属plenum space，必须用低烟、阻燃外皮，着火时减少有毒烟雾扩散';
    }
    if (text.includes('multimode')) {
      return 'Multimode（多模光纤）描述的是 fiber optic（光纤）传输类型，不是铜缆外皮防火等级；题干明确copper network cable（铜网线）';
    }
    if (text.includes('coaxial')) {
      return 'Coaxial（同轴线）是线缆结构/用途，常见cable modem/TV。题干明确是 copper network cable（铜网线）穿过通风吊顶，考的fire rating（防火等级），所以要 plenum';
    }
    if (text.includes('twisted pair')) {
      return 'Twisted pair（双绞线）只是以太网铜缆类型；在通风吊顶里仍要plenum-rated twisted pair。考试must be used in air ventilation，重点是 plenum';
    }
  }

  if (scenario === 'dmarc-txt-record') {
    if (text === 'txt' || text.includes('txt')) {
      return 'TXT record（DNS 文本记录）是本题答案。DMARC policy（DMARC 策略）以文本形式发布DNS 中，用来声明邮件认证/处理策略；SPF、DKIM、DMARC 这类邮件验证常考都TXT';
    }
    if (text === 'mx') {
      return 'MX record（邮件交换记录）指定邮件应该投递到哪个 mail server（邮件服务器）。它email routing（邮件路由），不存放 DMARC 验证策略';
    }
    if (text === 'cname') {
      return 'CNAME record（别名记录）把一hostname 指向另一hostname，用于别名解析或服务重定向。DMARC policy（DMARC 策略）需要发布文本策略值，不是主机别名，所以不CNAME';
    }
    if (text === 'a') {
      return 'A record（IPv4 地址记录）把 hostname（主机名）解析到 IPv4 address（IPv4 地址）。DMARC 不是找邮件服务器 IP 或主机地址，而是发布邮件认证策略文本，所以不A';
    }
  }

  if (scenario === 'phone-digitizer') {
    if (text.includes('digitizer')) {
      return 'Digitizer（触控数字化层）是本题答案。手机显示可以正常，touch input（触摸输入）无响应，说明把手指触摸转换成电信号的 digitizer 可能失效；重启无效且无外伤后就查它';
    }
    if (text.includes('battery')) {
      return 'Battery（电池）问题会表现为不开机、掉电、鼓包、充电异常或续航很差。题干设备能开机且 screen 显示正常，只touch input 无响应，所以优先查 digitizer，不是电池';
    }
    if (text.includes('screen')) {
      return 'Screen（显示屏）负责显示图像；如果画面坏、黑屏、裂屏或亮度异常才优先看 screen。题干说显示存在touch 不响应，故障层更digitizer（触控层）';
    }
    if (text.includes('stylus')) {
      return 'Stylus（触控笔）只是输入工具，常见问题是笔没电、配对或笔尖。题干说 user enters passcode input unsuccessful，即手指触控也失败，更像 digitizer（触控层）问题';
    }
  }

  if (scenario === 'replace-patch-cable') {
    if (text.includes('replace') && text.includes('patch cable')) {
      return 'Replace the patch cable from the device to the wall（更换设备到墙口的跳线）是本题答案。port-flapping（端口反复上下线）换到交换机另一个端口仍存在，说明原交换机端口不是根因；最常见下一步是换短跳线排除线缆/水晶头不良';
    }
    if (text.includes('crossover')) {
      return 'crossover cable（交叉线）用于老设备直连特定场景；现代交换NIC 多数支持 auto MDI-X。本题是 link up/down，不是线序类型不兼容';
    }
    if (text.includes('test the patch cable')) {
      return 'Test the patch cable from computer to network closet（从电脑测到网络间）范围太大，可能包含墙内布线。题干已经换过交换机端口，下一步更低成本、更直接是先更换 device-to-wall patch cable';
    }
    if (text.includes('length')) {
      return 'Verify cable length（确认长度）只有在超Ethernet 100m 限制或长距离布线时才是重点。普workstation 到墙口跳线反flapping，更像端跳线损坏';
    }
  }

  if (scenario === 'cloud-synchronization') {
    if (text.includes('synchronization')) {
      return 'Synchronization（同步）是本题答案。local folders（本地文件夹）能自动包含 other devices（其他设备）做出的更新，就是云盘/同步客户端把多端文件状态保持一致';
    }
    if (text.includes('network share')) {
      return 'Network share（网络共享）是访问同一个共享位置，不一定把文件更新复制/同步到本地文件夹。题干强local folders contain updates，关键词sync';
    }
    if (text.includes('availability')) {
      return 'Availability（可用性）表示服务能持续访问、少宕机，常redundancy（冗余）/uptime（正常运行时间）相关。它不描述多设备文件自动更新local folders，本题关键词synchronization';
    }
    if (text.includes('metered')) {
      return 'Metered utilization（按量计计量使用）是云服务按 CPU、storage、traffic 等实际用量收费的特征。它回答 billing（计费方式），不回答文件夹跨设备自动更新';
    }
  }

  if (scenario === 'ap-port-flapping') {
    if (text.includes('port flapping')) {
      return 'Port flapping（端口频繁上下线）是本题答案。AP activity light briefly on/off 且设备不上线，像交换机端口链路不up/down，常见原因是网线、PoE、端口或对端设备协商异常';
    }
    if (text.includes('latency')) {
      return 'High latency（高延迟）是在已连接时响应慢、ping time 高。题干是 AP activity light 反复亮灭does not come online，不是“慢”，而是链路 up/down port flapping';
    }
    if (text.includes('external interference')) {
      return 'External interference（外部无线干扰）会影响无线客户端信号质量，但题干描述的是 AP 接入网络时灯反复亮灭、设备不上线，更像有线端PoE 链路问题';
    }
    if (text.includes('channel conflict')) {
      return 'Channel conflict\uff08\u4fe1\u9053\u51b2\u7a81\uff09\u4f1a\u9020\u6210\u65e0\u7ebf\u541e\u5410\u4e0b\u964d\u6216\u5ba2\u6237\u7aef\u6f2b\u6e38/\u8fde\u63a5\u5dee\uff0c\u4f46\u901a\u5e38\u4e0d\u4f1a\u8ba9 AP \u81ea\u5df1\u7684 activity light \u53cd\u590d\u4e0a\u4e0b\u7ebf\uff1b\u8fd9\u79cd\u75c7\u72b6\u66f4\u50cf port flapping \u6216 PoE/patch cable \u95ee\u9898';
    }
  }

  if (scenario === 'raid6-two-drive-fault') {
    if (text === '6') {
      return 'RAID 6 是本题答案。它使用 dual parity（双重校验），可以同时损two drives（两块硬盘）而不丢数据；A+ 看到“lose two drives”基本锁RAID 6';
    }
    if (text === '0') {
      return 'RAID 0 striping（条带化）提升性能，没parity（校验）mirror（镜像）冗余；坏一块盘就会丢数据。题干要 tolerate two drive failures，所以完全不符合';
    }
    if (text === '1') {
      return 'RAID 1 mirroring（镜像），常见两盘场景可坏一块；如果镜像组内两块都坏仍会丢数据。题干问可损two drives（两块盘），最佳是 RAID 6';
    }
    if (text === '5') {
      return 'RAID 5 single parity（单校验），通常只能容忍 one drive failure（一块盘故障）；两块盘故障会丢数据，所以不是本题答案';
    }
  }

  if (scenario === 'private-cloud-local-datacenter') {
    if (text.includes('private')) {
      return 'Private cloud（私有云）是本题答案。exclusively utilizes a local data center（只使用本地数据中心）说明资源专供一个组织、在本地/专用环境运行，控制权最高';
    }
    if (text.includes('public')) {
      return 'Public cloud（公有云）使用云服务商共享基础设施，例AWS/Azure/GCP。题干说 exclusively utilizes a local data center（只用本地数据中心），控制范围是组织自有/专用环境，所以排public';
    }
    if (text.includes('hybrid')) {
      return 'Hybrid cloud（混合云）同时结private/on-premises public cloud；题干说 exclusively local，排hybrid';
    }
    if (text.includes('community')) {
      return 'Community cloud（社区云）由有共同需求的多个组织共享，不等于单一公司本地数据中心专用。这里的 Community 不是 SNMP community string';
    }
  }

  if (scenario === 'rj45-reterminate-crimper') {
    if (text.includes('crimper')) {
      return 'Crimper（压线钳）是本题答案。RJ45 pin not properly terminated（RJ45 线芯/针脚端接不良）需要剪掉或重新整理水晶头，再用 crimper 重新压接';
    }
    if (text.includes('toner probe')) {
      return 'Toner probe（寻线器）用于找追踪线缆走向，适合 unlabeled cable（未标记线缆）或patch panel 对应端口。题干已经知RJ45 端接不良，问 fix the issue，所以要 crimper 重压';
    }
    if (text.includes('cable tester')) {
      return 'Cable tester（网线测试仪）能验证线序/通断，帮助确认故障；但题干问 fix the issue（修复问题），RJ45 端接不良要用 crimper 重压';
    }
    if (text.includes('punchdown')) {
      return 'Punchdown tool（打线工具）用于 keystone jack/patch panel（墙口模配线架）IDC 端接；RJ45 plug（水晶头）端接用 crimper';
    }
  }

  if (scenario === 'cloud-email-saas' || scenario === 'company-resources-saas') {
    if (text === 'saas' || text.includes('saas')) {
      return 'SaaS\uff08\u8f6f\u4ef6\u5373\u670d\u52a1\uff09\u662f\u672c\u9898\u7b54\u6848\u3002\u7528\u6237\u76f4\u63a5\u8ba2\u9605\u5e76\u4f7f\u7528\u4e91\u7aef\u5e94\u7528\uff0c\u4f8b\u5982 email\u3001CRM\u3001\u5728\u7ebf\u529e\u516c\u548c\u516c\u53f8\u8d44\u6e90\u95e8\u6237\uff1b\u516c\u53f8\u4e0d\u9700\u8981\u7ef4\u62a4\u5e95\u5c42 servers\u3001OS \u6216\u8fd0\u884c\u5e73\u53f0\uff0c\u6240\u4ee5\u5b83\u6bd4 IaaS/PaaS \u66f4\u8d34\u9898\u3002';
    }
    if (text === 'paas' || text.includes('paas')) {
      return 'PaaS（平台即服务）给开发者部运行代码的平台，云商管理 OS/runtime，用户管理应用代码。题干是直接使用 email/company resources，不是在开发应用，所以不PaaS';
    }
    if (text === 'iaas' || text.includes('iaas')) {
      return 'IaaS（基础设施即服务）提供 VM、storage、networking，客户仍管理 OS 和应用；题干强调 least infrastructure 或直接订阅应用，所以不IaaS';
    }
    if (text === 'faas' || text.includes('faas')) {
      return 'FaaS（函数即服务）运行事件触发的小函数，适合 serverless event handling（无服务器事件处理）。它不是给员工提供完email 或公司资源访问应用的模式';
    }
    if (text === 'daas' || text.includes('daas')) {
      return 'DaaS（桌面即服务）提cloud-hosted desktop（云桌面），用户远程使用整套桌面环境。email/company resources 云应用属SaaS，不需要托管整套桌面';
    }
  }

  if (scenario === 'type2-underlying-os') {
    if (text.includes('underlying os')) {
      return 'Need for an underlying OS（需要底层宿主操作系统）是本题答案。Type 2 hypervisor 先安装在 Windows/macOS/Linux 这类 host OS 上，再运行虚拟机，例VirtualBox、VMware Workstation';
    }
    if (text.includes('bare-metal')) {
      return 'Bare-metal installation（裸机安装）Type 1 hypervisor 的特征，例如 ESXi/Hyper-V Server 直接跑在硬件上；Type 2 不是裸机';
    }
    if (text.includes('local management')) {
      return 'Local management only（仅本地管理）不Type 2 的定义。Type 2 的考点是“hosted hypervisor（宿主型）”，依赖 underlying OS';
    }
    if (text.includes('specific hardware')) {
      return 'Specific hardware requirements（特定硬件要求）可能影响虚拟化兼容性，但不Type 2 hypervisor 的核心特征。核心是运行host OS 上';
    }
  }

  if (scenario === 'layer3-switch-intervlan') {
    if (text.includes('layer 3 switch')) {
      return 'Layer 3 switch（三层交换机）是本题答案。多VLAN 要互通时需routing（路由）；Layer 3 switch switching（交换）routing（路由）放在同一台交换机里，常用硬件 ASIC/交换芯片处理，所以符minimum hardware（最少硬件）wire speed（线速）';
    }
    if (text.includes('router')) {
      return 'Router\uff08\u8def\u7531\u5668\uff09\u4e5f\u80fd\u505a inter-VLAN routing\uff08VLAN \u95f4\u8def\u7531\uff09\uff0c\u4f46\u9898\u5e72\u540c\u65f6\u5f3a\u8c03 minimum hardware\uff08\u6700\u5c11\u786c\u4ef6\uff09\u548c wire speed\uff08\u7ebf\u901f\uff09\uff0c\u6240\u4ee5\u628a switching + routing \u96c6\u6210\u5728\u4e00\u8d77\u7684 Layer 3 switch \u6bd4\u666e\u901a router \u66f4\u8d34\u9898\u3002';
    }
    if (text.includes('web application firewall')) {
      return 'Web application firewall / WAF（Web 应用防火墙）保护 HTTP/HTTPS 应用，拦SQL injection、XSS 等应用层攻击。它不负责让多个 VLAN 彼此路由互通，也不是提VLAN 间线速转发的设备';
    }
    if (text.includes('ddos appliance')) {
      return 'DDoS appliance（DDoS 防护设备）用于吸收或过滤 volumetric attack（大流量攻击）和异常流量。本题没有攻击或流量清洗需求，核心VLAN 间高速互通，所以排除';
    }
  }

  return isCorrect
    ? explainUntypedCorrectOption(option, getTargetedCore1Need(question))
    : explainUntypedWrongOption(option, getTargetedCore1Need(question));
}

function inferNeed(question) {
  const stem = normalizeText(question.stem);
  const topicText = normalizeText(question.topic);
  const optionText = normalizeText((question.options ?? []).map((option) => option.text).join(' '));
  const answerText = normalizeText(getAnswerOptionTexts(question).join(' '));
  const text = `${stem} ${optionText} ${answerText}`;

  if (isStaticPrinterIpQuestion(question)) {
    return '配置 printer（打印机）static IP address（静态 IP）时，DHCP 不会自动下发客户端参数；IP address 本身不在选项里，所以必须手动填 subnet mask（子网掩码）default gateway（默认网关）。DHCP reservation/exclusion 是在 DHCP/router 上做的，不是在打印机上手动设置静态地址';
  }

  if (isUnlabeledNetworkConnectionQuestion(question)) {
    return '识别 unlabeled network connection（未标记网络连接/网线）时，要 trace cable run（追踪线缆路径）或找 patch panel/wall jack（配线架/墙口）对应关系；toner probe（寻线器/音频探针），不是 printer toner（打印机碳粉）';
  }

  if (isEsdWristStrapQuestion(question)) {
    return 'wrist strap（防静电手环）的目的不是制造或保存静电，而是technician（技术员）身体上electrostatic charge（静电荷）导ground/common point（接共同点），避ESD（静电放电）击穿 RAM 等敏感芯';
  }

  if (getTargetedCore1Scenario(question)) {
    return getTargetedCore1Need(question);
  }

  if (isDotMatrixMultipartRibbonQuestion(question)) {
    return '定位 dot matrix printer（针式打印机）multipart forms（多联复写纸）故障：bottom pages print fine（底层页能显字）说明 printhead pins（打印头针脚）仍在击打；top page blank（顶页空白）优先怀ribbon（色带）没有把油墨转印到顶页。底层页的字来自压力/复写层，不是色带给后面上';
  }

  if (isScanPathPrinterQuestion(question)) {
    return '区分 scan/copy path（扫复印路径）和 laser print engine（激光打印引擎）';
  }
  if (isPrinterQuestion(question)) {
    return '根据 printer（打印机）症状定位部件、耗材、driver（驱动）、firmware（固件）spooler（后台服务）';
  }
  if (stem.includes('lightning cable') && stem.includes('flipping the cable')) {
    return '判断 Lightning cable（Lightning 线缆）只有在某台设备上翻面才识别的原因，优先怀疑该设备 charging port（充电接口）脏污或损';
  }
  if (stem.includes('collect data') && stem.includes('events')) {
    return '识别 Syslog server（系统日志服务器）用于集中收集网络主机和设备事件日志';
  }
  if (stem.includes('drop ceiling') || stem.includes('shared air space') || stem.includes('plenum')) {
    return '识别 plenum-rated cable（阻燃通风夹层线缆）用于吊顶回共享空气空间，满足消防低烟阻燃要';
  }
  if (stem.includes('type 2 hypervisor')) {
    return '区分 Type 2 hypervisor（宿主型虚拟化）需underlying OS（宿主操作系统），不同于直接跑在硬件上的 Type 1';
  }
  if (stem.includes('nfc')) {
    return '识别 NFC（近场通信）是极短距离、两设备靠近触碰式的无线通信';
  }
  if (isCrowdedWirelessPerformanceQuestion(question)) {
    return '改善 crowded Wi-Fi（拥挤无线环境）performance（性能）：优先处理 channel interference（信道干扰）outdated AP/security（过旧接入点/安全标准）；MAC filtering 属于访问控制，不提升吞吐';
  }
  if (stem.includes('traveling internationally') || stem.includes('internationally')) {
    return '判断国际旅行phone calls 正常email/data 不通，优先检data roaming（数据漫游）或国际数据套';
  }
  if (stem.includes('visible internal cables') || stem.includes('minimal number of visible')) {
    return '减少 PC 机箱visible internal cables（可见内部线缆），优先考虑 modular PSU（模组化电源）和理线';
  }
  if (stem.includes('unexpected shutdown') || stem.includes('power outage')) {
    return '处理 power loss（断电）导致的数据完整性或时钟问题，区UPS、CMOS battery 和普PSU';
  }
  if (stem.includes('throttling') || stem.includes('overheating') || stem.includes('3-d-rendering')) {
    return '处理高负载散热问题，优先定位 heat sink/fan/airflow（散热器/风扇/风道';
  }
  if (stem.includes('msds') || stem.includes('battery backup')) {
    return 'MSDS/SDS（安全数据表）记录电化学品的 hazards（危害）、handling（处理）、storage（存放）、first aid（急救）和 emergency procedures（应急流程），不是安装或配置手册';
  }
  if (stem.includes('no longer be issued security updates') || stem.includes('security updates and patches')) {
    return 'OS 不再收到 security updates/patches（安全更补丁）通常表示 end of life（生命周期结束）；应计划升级/替换，而不是只等新版本发布';
  }
  if (stem.includes('distribute custom images') || (stem.includes('large number of workstations') && stem.includes('operating system'))) {
    return '批量安装或分custom images（自定义镜像）时优先network-based remote installation / image deployment（基于网络的远程安装/镜像部署），不要逐台手工';
  }
  if (stem.includes('unsolicited text message') || stem.includes('text message to a user')) {
    return 'social engineering（社会工程）里，短信诱骗smishing（短信钓鱼）；语音电话是 vishing，定向邮件是 spear phishing';
  }
  if (stem.includes('linux command') && stem.includes('administrative')) {
    return 'Linux 管理权限题常su/sudo：su（切换用提权root）用administrative purposes；runas/net user 更偏 Windows';
  }
  if (stem.includes('local server') && stem.includes('database') && (stem.includes('does not populate') || stem.includes('does not connect'))) {
    return '应用连本地数据库服务器但不显示数据时，先确认 network connection/ports（网络连端口）是否建立；netstat 能查看连接和监听端口';
  }
  if (stem.includes('vulnerability') && (stem.includes('before a patch') || stem.includes('remediation is available'))) {
    return 'zero-day（零日漏洞）指漏洞已被利用但还没patch/remediation（补修复）；brute-force、DoS、spoofing 是攻击方式，不是“无补丁窗口';
  }
  if (stem.includes('speech recognition')) {
    return 'Windows speech recognition（语音识别）属于 accessibility/Ease of Access（辅助功轻松使用）设置，不是显示个性化或系统硬件设';
  }
  if (stem.includes('.net framework 3.5') || stem.includes('turn windows features on or off')) {
    return '.NET Framework 3.5 缺失Windows optional feature/dependency（可选功依赖）问题；优先通过 Turn Windows features on or off 启用，不要乱装第三方来源';
  }
  if (stem.includes('features are disabled') && stem.includes('log-in')) {
    return '应用功能因需login/license（登许可）而禁用时，优先检license assignment（许可证分配），不是修复或重装程';
  }
  if (stem.includes('windows 10 to windows 11') && stem.includes('without losing data')) {
    return 'Windows 10 升到 Windows 11 且不丢数据，题眼in-place upgrade（就地升级）；clean install 会清空环境，image deployment 更偏批量重装';
  }
  if (stem.includes('document user contact information') || stem.includes('device asset tags') || stem.includes('clear description of each issue')) {
    return '工单信息填写不一致时，用 SOP（Standard Operating Procedure，标准操作流程）规定每通电话必须记录哪些字段；SLA 是服务承诺，不是填写步骤';
  }
  if (stem.includes('performance is degrading over time') || (stem.includes('application is slowing') && stem.includes('does not crash'))) {
    return '应用逐渐变慢但不报错/不崩溃，先用 Resource Monitor（资源监视器）看 CPU、memory、disk、network 占用趋势，找资源瓶颈';
  }
  if (stem.includes('filesystem') && stem.includes('linux')) {
    return 'Linux 常见 filesystem（文件系统）ext4；NTFS Windows，APFS macOS，exFAT 常用于跨平台移动存储';
  }
  if (stem.includes('data unrecoverable') && stem.includes('repurposed')) {
    return '要让数据不可恢复drive（硬盘）还能再用，low-level format/secure wipe（低级格式化/安全擦除）；degaussing 会让磁盘不可再可靠使';
  }
  if (stem.includes('recent mobile os upgrade') && stem.includes('corporate email')) {
    return 'mobile OS upgrade（移动系统升级）后某个企业应用打不开，重启无效时update the failed software（更新故障应用）以匹配新系统版本';
  }
  if (stem.includes('sharing smartphone passcodes') || stem.includes('more secure screen lock')) {
    return '减少 passcode sharing（密码共享）时，biometric screen lock（生物识别锁屏）facial recognition 更合适；MFA 常用于登录流程，不是单纯本机锁屏答案';
  }
  if (stem.includes('permitted activities') && stem.includes('organization')) {
    return 'AUP（Acceptable Use Policy，可接受使用政策）规定员工如何使用组织资源、哪些活动允禁止；EULA 是软件许可，NDA/MNDA 是保';
  }
  if (stem.includes('service runs momentarily') && stem.includes('root cause')) {
    return '服务启动后又停止要查 Event Viewer（事件查看器）的 service/application logs（服应用日志）找根因；Task Manager 只看当前进程状';
  }
  if (stem.includes('undisclosed additional software') || stem.includes('installation package')) {
    return '安装包夹带未披露附加软件属于 PUP（Potentially Unwanted Program，潜在不需要程序）；它不一定是病毒或勒索软件，但会被安全工具标';
  }
  if (stem.includes('map a shared drive') || stem.includes('shared drive from a command-line')) {
    return 'Windows 命令行映shared drive（共享盘）用 net use；pathping/tracert 查网络路径，nslookup DNS';
  }
  if (stem.includes('in addition to a password') && stem.includes('mfa')) {
    return 'MFA（多因素认证）要password（知道的东西）之外加入另一因素，例phone code/push（手机验证码/推送）；重复输PIN 仍可能是同类因素';
  }
  if (stem.includes('rack-mounted ups') || stem.includes('battery modules from the bottom of the rack')) {
    return '更换 rack-mounted UPS（机架式 UPS）底部电池模块时重点workplace safety（工作安全）：电池重，需使用正确 lifting techniques（搬运姿指南';
  }
  if (stem.includes('automate tasks') && stem.includes('windows user log-in')) {
    return 'Windows 登录自动化常.bat batch file（批处理脚本）；.sh Linux shellpy/.js 需要相应解释器或运行环';
  }
  if (stem.includes('ai') && stem.includes('factually incorrect')) {
    return 'AI 生成内容里出factually incorrect information（事实错误）hallucination（幻觉）；使用时必须人工核对事实';
  }
  if (stem.includes('outdated images') && stem.includes('browsing websites')) {
    return '浏览器显示旧图片通常cache/temporary internet files（缓临时 Internet 文件）问题；Windows 里常Internet Options 清理浏览数据';
  }
  if (stem.includes('corporate restrictions') && stem.includes('apple device')) {
    return 'Apple 设备应用公司限制通常management profile（管理配置描述文件）/MDM 下发策略、证书和限制，不是普Apple ID 设置';
  }
  if (stem.includes('file is encrypted') || stem.includes('receives a message that the file is encrypted')) {
    return '用户文件被加密并无法打开，典型是 ransomware（勒索软件）；keylogger 记录键盘，cryptominer 挖矿，phishing 是诱骗获取信';
  }
  if (stem.includes('applications that are not installed by default') && stem.includes('software licensing')) {
    return '\u7528\u6237\u79c1\u88c5\u5e94\u7528\u548c\u8bb8\u53ef\u8bc1\u63d0\u793a\u589e\u52a0\uff0c\u6839\u56e0\u5e38\u662f local admin rights\uff08\u672c\u5730\u7ba1\u7406\u5458\u6743\u9650\uff09\u8fc7\u5bbd\uff1b\u79fb\u9664\u672c\u5730\u7ba1\u7406\u5458\u6743\u9650\u53ef\u51cf\u5c11\u672a\u6388\u6743\u5b89\u88c5\uff0c\u5e76\u7b26\u5408 least privilege\uff08\u6700\u5c0f\u6743\u9650\uff09\u539f\u5219\u3002';
  }
  if (stem.includes('forced entry into a building')) {
    return '阻止车辆/强行冲入建筑的 physical security（物理安全）控件是 bollard（防撞柱）；门禁卡和摄像头更偏识别记录，不是物理阻挡';
  }
  if (stem.includes('push notification') && (stem.includes('mfa') || stem.includes('verify'))) {
    return 'MFA push notification（推送验证）是在密码之外让用户手approve/deny（批拒绝）登录请求；它验possession factor（持有因素）';
  }
  if (stem.includes('single operating system') && stem.includes('avoid licensing fees')) {
    return '想让 workstations servers 使用同一OS 且避licensing fees（许可费用），优先想Linux/open-source OS（开源操作系统）';
  }
  if (stem.includes('backup') && stem.includes('taking too long') && stem.includes('incremental')) {
    return 'incremental backup（增量备份）每天只备份变化，但链太长会拖restore/backup 管理；常full backup（完整备份）重新建立基线';
  }
  if (stem.includes('music festival') || stem.includes('large number of attendees')) {
    return '大型活动人群密集cellular network（蜂窝网络）容易拥塞；排障要先判断是覆盖/容量问题，而不是单台设备配';
  }
  if (stem.includes('bsod') || stem.includes('blue screen')) {
    return 'BSOD（蓝屏）反复出现要先crash/error evidence（崩溃证据），常Event Viewer、memory dump、recent driver/update 入手定位根因';
  }
  if (stem.includes('legitimate one') && (stem.includes('downloaded from the internet') || stem.includes('application'))) {
    return '确认下载应用是否真实合法，优先看 digital signature / certificate（数字签证书）和 publisher（发布者）；不要只看文件名或图';
  }
  if (stem.includes('alerts') && stem.includes('videoconference')) {
    return '会议中被 Windows alerts（通知）打断，常用 Focus assist / Do not disturb（专注助勿扰）临时静音通知';
  }
  if (stem.includes('do not have assigned workspaces') || stem.includes('different computers and physical locations')) {
    return '员工在不同电位置办公时，重点roaming profile/VDI/cloud profile（漫游配虚拟桌面/云配置）让用户环境随登录迁移';
  }
  if (stem.includes('dispose of a failed hard drive') && stem.includes('unrecoverable')) {
    return 'failed hard drive（故障硬盘）要丢弃且数据不可恢复，优先用 physical destruction/shredding（物理销粉碎）；已故障设备不适合再擦写复';
  }
  if (stem.includes('will not turn on') && stem.includes('family pictures')) {
    return '电脑不开机但用户关心照片/数据时，先保data（数据）：取连接 storage drive（存储盘）尝试数据恢复，不急着重装或更换整';
  }
  if (stem.includes('bluetooth headset') && stem.includes('speaker')) {
    return 'Bluetooth 耳机已配对但声音仍从 speaker（扬声器）出，先检default audio output / sound settings（默认音频输声音设置';
  }
  if (stem.includes('legacy version of the os') && stem.includes('end of life')) {
    return 'legacy app 依赖 EOL OS（生命周期结束系统）时，应隔虚拟化或升级应用；安全风险来自继续运行无补丁旧系';
  }
  if (stem.includes('corporate mobile phone is lost') || stem.includes('lost corporate mobile')) {
    return '公司手机丢失时保local data（本地数据）的关键是 encryption（加密）remote wipe（远程擦除）；本地防护靠设备加密';
  }
  if (stem.includes('technical outage') && stem.includes('summary') && stem.includes('management')) {
    return '技术故障后管理层要 summary/root cause/business impact（摘根因/影响）时，产incident report / after-action report（事件报复盘报告';
  }
  if (stem.includes('multiple endpoints') && stem.includes('target a single endpoint')) {
    return '多个分散 endpoints 同时打一个目标是 DDoS（分布式拒绝服务）；DoS 是单源，brute-force 是反复猜凭证';
  }
  if (stem.includes('switch to windows from linux') || (stem.includes('linux') && stem.includes('external usb hard disk'))) {
    return 'Linux Windows 迁移外置盘读写问题常filesystem compatibility（文件系统兼容性）；Windows 原生不支ext4，exFAT 更适合跨平';
  }
  if (stem.includes('product owner') && stem.includes('business-critical')) {
    return '要记server owner（服务器负责人）business-critical status（业务关键性），属asset inventory / CMDB（资产清配置管理数据库）信息';
  }
  if (stem.includes('rename the administrator account')) {
    return '重命Windows 本地 Administrator 账户Local Users and Groups / lusrmgr（本地用户和组）或本地安全策略，不是普通文显示设置';
  }
  if (stem.includes('high computing resource usage')) {
    return 'malware 中资源占用很高常见于 cryptominer（挖矿程序），因为它持续消CPU/GPU 计算能力';
  }
  if (stem.includes('3-2-1 backup rule')) {
    return '3-2-1 backup rule（备份规则）= 3 copies 份数据） media types 种介质） off-site/offline copy 份异离线';
  }
  if (stem.includes('non-responsive touch pad') || stem.includes('touch pad does not appear')) {
    return 'touchpad（触控板）无响应且无物理损坏，先enable/disable setting、function key、Device Manager driver（启用设功能驱动';
  }
  if (stem.includes('renaming a .txt file to a .xml file')) {
    return 'Windows 改扩展名失败常因 file name extensions hidden（隐藏文件扩展名）；需要显示扩展名后再真正修改 .txt .xml';
  }
  if (stem.includes('outside the office') && stem.includes('upload files to the corporate servers')) {
    return '手机在办公室外无法上corporate servers（企业服务器）但办公室内正常，常见是需VPN/MDM remote access（远程接入策略）';
  }
  if (stem.includes('remote windows share') || stem.includes('winnas')) {
    return 'Windows 映射远程共享为本地盘net use drive: \\\\server\\share（net use 映射命令），可加 /persistent 控制是否保留';
  }
  if (stem.includes('confirm the username') || stem.includes('whoami')) {
    return '确认当前会话使用username（用户名）用 whoami；hostname 看计算机名，ipconfig 看网络配';
  }
  if (stem.includes('proper procedure for malware removal') && stem.includes('unable')) {
    return 'malware removal（恶意软件清除）按流程要 isolate、disable restore if needed、scan/remediate、schedule scans、update OS、educate user；卡住时回到安全模式/离线扫描';
  }
  if (stem.includes('confidential work projects')) {
    return '和外部人员讨confidential projects（机密项目）前要NDA/MNDA（保密协议），确保双方承担保密义';
  }
  if (stem.includes('incident management policy') && stem.includes('third-party vendor')) {
    return 'incident management 使用 third-party vendor（第三方供应商）时要SLA/contract（服务等级协合同）中的响应时间、升级路径和责任边界';
  }
  if (stem.includes('contents of a single file') && stem.includes('linux terminal')) {
    return 'Linux terminal 查看单个文件内容cat（concatenate，输出文件内容）；ls 列目录，cp 复制，chmod 改权';
  }
  if (stem.includes('crashes after an os patch')) {
    return 'OS patch 后频繁崩溃，后续应先 create restore point/backup（创建还原点/备份）再打补丁，并可回滚有问题的补丁';
  }
  if (stem.includes('prevent users from frequently entering their credentials')) {
    return '减少频繁输入凭证通常SSO/biometrics/cached credentials（单点登生物识别/凭证缓存），题干要看是便利性还是安全性优';
  }
  if (stem.includes('pay a vendor immediately') || stem.includes('chief executive officer')) {
    return '冒充 CEO 要求立即付款whaling / business email compromise（捕商务邮件妥协）线索；重点是高管身份和紧急付';
  }
  if (stem.includes('legacy, personal tablet') || stem.includes('latest version of an application on a legacy')) {
    return 'tablet 无法运行最新版 app，常见原因是 OS/device no longer supported（系设备不再受支持）；不是网络或账号优先';
  }
  if (stem.includes('store passwords in macos')) {
    return 'macOS 存储密码使用 Keychain（钥匙串）；Credential Manager Windowsetc/passwd Linux 账户文件';
  }
  if (stem.includes('download and install a new web browser')) {
    return '安装新浏览器应从 official vendor website / trusted store（官可信商店）下载，避免第三方捆绑或恶意安装';
  }
  if (stem.includes('alternative log-in authentication') || stem.includes('forgotten their password')) {
    return '忘记密码后请求替代登录方式，按场景看 password reset（密码重置）、biometrics/PIN（生物识别/PIN）或恢复流程，不能绕过身份验证';
  }
  if (stem.includes('privilege') && (stem.includes('administrators') || stem.includes('certain services'))) {
    return '限制管理员默认访问服务属于 least privilege / privilege management（最小权限/权限管理），需要按需提升而不是自动全权访问';
  }
  if (stem.includes('successor to ntfs')) {
    return 'ReFS（Resilient File System，弹性文件系统）Microsoft 面向可靠大容量场景的 NTFS 后继文件系统';
  }
  if (stem.includes('used space') && stem.includes('64gb')) {
    return 'iOS smartphone（iPhone）变慢且 used space（已用空间）几乎满时，优先判low free storage（剩余空间不足）；电池健90% 不是主要瓶颈';
  }
  if (stem.includes('elevated permissions') || stem.includes('automatically given elevated')) {
    return 'PAM（Privileged Access Management，特权访问管理）控制管理员何时能获得 elevated permissions（提升权限），避免默认长期拥有高权限';
  }
  if (stem.includes('password complexity') || stem.includes('failed log-in attempts')) {
    return 'password complexity（密码复杂度）和 account lockout（账户锁定）属于 local/group policy（本组策略）设置，MMC snap-in 常gpedit';
  }
  if (stem.includes('background services') && stem.includes('extra bandwidth')) {
    return '怀background services（后台服务）占用带宽时，netstat 查看本机 active connections/listening ports（活动连监听端口';
  }
  if (stem.includes('most secure method') && stem.includes('cell phone')) {
    return '保护手机访问时，passphrase（长密码短语）通常PIN、swipe、pattern 更强，因为长度和复杂度更';
  }
  if (stem.includes('web pages are loading slowly') && stem.includes('office')) {
    return '办公室内手机网页加载慢，若不是套餐限制或存储问题，题眼多degraded network service（网络服务质量下降）或局部无蜂窝拥塞';
  }
  if (stem.includes('browsing social media')) {
    return '客户描述问题时技术员刷手机违professionalism（职业沟通）：应避免 personal interruptions（私人打断），主动聆听并记录';
  }
  if (stem.includes('install applications on a macos machine')) {
    return 'macOS 应用安装常见扩展 .pkg（安装包）.dmg（磁盘映像）.app（应用包）；.msi/.appx 属于 Windows，.deb 属于 Debian Linux';
  }
  if (stem.includes('windows 10 enterprise 32-bit')) {
    return '32-bit Windows 要运行 x86 installer（32 位安装程序）；x64 是 64 位，.dmg 是 macOS 磁盘映像，zip 只是压缩包';
  }
  if (stem.includes('hiding the file') || (stem.includes('shared drive') && stem.includes('accidentally deleted'))) {
    return '隐藏文件或调整文件可见性通常File Explorer（文件资源管理器）里properties/hidden attribute（属隐藏属性），不Device Manager';
  }
  if (stem.includes('in-place upgrade') && stem.includes('latest os')) {
    return 'in-place upgrade（就地升级）到最OS 时，优先System Update utility（系统更新工具）保留应用和数据；fresh install 是重';
  }
  if (stem.includes('repetitive task') && stem.includes('linux command line')) {
    return 'Linux 命令行自动化重复任务通常shell script（Shell 脚本），常见扩展 .sh；Batch filebat）偏 Windows';
  }
  if (stem.includes('remote desktop services') && stem.includes('active users')) {
    return '查看 Remote Desktop Services（远程桌面服务）当前登录用户数量，可Task Manager（任务管理器）的 Users/会话信息';
  }
  if (stem.includes('minimum level of permissions')) {
    return 'least privilege（最小权限）原则：只给完成职责所需的最低权限；Zero Trust 是持续验证，SSO/MFA 是认证体验和强度';
  }
  if (stem.includes('trusted site') && stem.includes('external web address')) {
    return '把外部网址加入 Trusted sites（受信任站点）属Internet Options / Internet Properties（Internet 选项）安全区域配';
  }
  if (stem.includes('shoulder surfing')) {
    return 'shoulder surfing（肩窥）属于 social engineering（社会工程）：攻击者通过观察用户输入或屏幕获取信';
  }
  if (stem.includes('deployment instructions') && (stem.includes('large-scale') || stem.includes('complex'))) {
    return '大型软件部署的步骤、先决条件和回退说明应放internal wiki/knowledge base（内wiki/知识库）便于团队引用';
  }
  if (stem.includes('roles and responsibilities') && stem.includes('supporting the application')) {
    return '记录支持角色和职责通常属于 SOP（Standard Operating Procedure，标准操作流程）或运行手册内容，不是 NDA/EULA';
  }
  if (stem.includes('4.57gb') || stem.includes('.pst file')) {
    return 'FAT32 单文件上限约 4GB；移4.57GB .pst（Outlook 数据文件）应格式化为 NTFS（Windows 常用文件系统';
  }
  if (stem.includes('driver updates') || stem.includes('devmgmt.msc')) {
    return '检查设备驱动更新用 Device Manager（设备管理器），命令devmgmt.msc；lusrmgr 管用户，gpedit 管策';
  }
  if (stem.includes('install and uninstall software') && stem.includes('least-privilege')) {
    return 'Power user（高级用户）权限高于普通用户，可安卸载部分软件但不管理账户；Administrator 权限过大，不符合 least privilege';
  }
  if (stem.includes('backups work as intended') || stem.includes('recovery is possible')) {
    return '备份策略要包backup testing（备份测试）验证可恢复，并定期做 full backup（完整备份）建立可靠基线';
  }
  if (stem.includes('avoid expensive licensing fees') && stem.includes('files to be kept locally')) {
    return '想避OS licensing fees（许可费用）且本地保存文件，Linux 是典型选择；Chrome OS 偏云端，Windows/macOS 有授硬件生态限';
  }
  if (stem.includes('outcome does not match') || stem.includes('verify understanding')) {
    return '升级给高级技术员前应 ask open-ended questions（开放式问题）确认用户真正需求，避免交接后解决了错误问题';
  }
  if (stem.includes('high-end graphic design') || stem.includes('animation desktops')) {
    return '一次新增多台高端图动画 desktop（桌面工作站）时，要核算 electrical circuit power consumption（电路负功耗），避免跳闸或过载';
  }
  if (stem.includes('system folders on the macos')) {
    return 'macOS 常见系统级文件夹包括 Applications（应用程序）Library（资源库）；Spotlight/Time Machine/FileVault 是功能或服务';
  }
  if (stem.includes('zero-day vulnerability') && stem.includes('downtime')) {
    return 'zero-day 已有 vendor patch（厂商补丁）且业务影响重大，即使需downtime 也应emergency change（紧急变更）流程快速修';
  }
  if (stem.includes('coordinate with another department')) {
    return '需要其他部门协作时，要向用explain the issue and the need for collaboration（解释问题和协作必要性），保持透明沟';
  }
  if (stem.includes('macos') && stem.includes('older version of a file')) {
    return 'macOS 恢复旧版本文件用 Time Machine（时间机器）；Disk Utility 管磁盘，FileVault 管加密，Spotlight 管搜';
  }
  if (stem.includes('settings file') && stem.includes('all user workstations')) {
    return 'Windows 批量导入 settings file（设置文件）常见registry file（注册表文件），regedit.exe 导入；msconfig 管启服务配置';
  }
  if (stem.includes('single update interferes') && stem.includes('business-critical application')) {
    return 'VDI 更新破坏 business-critical app（关键业务应用）且应EOL 时，最低停机做法是 uninstall and block the patch（卸载并阻止该补丁）恢复功能';
  }
  if (stem.includes('root directory') && stem.includes('folder') && stem.includes('appear')) {
    return '看不到根目录中的文件夹时，常File Explorer（文件资源管理器）开hidden files（隐藏项目）file extensions（扩展名显示）等查看选项';
  }
  if (stem.includes('online collaboration tools') && stem.includes('not available on their laptop')) {
    return '在线协作文档没出现在 laptop 本地时，优先 synchronize remote folder（同步远程文件夹）到本机，而不是手动转发文';
  }
  if (stem.includes('appdata folder')) {
    return 'AppData 是用户配置目录，默认 hidden（隐藏）；要让用户容易访问，配置 File Explorer Options（文件资源管理器选项）显示隐藏项';
  }
  if (stem.includes('software sends data to a remote server')) {
    return '未经同意收集并发送数据到远端服务器的spyware（间谍软件）；cryptominer 消耗算力，ransomware 加密文件';
  }
  if (stem.includes('smb share') && stem.includes('command line')) {
    return '命令行映SMB share（SMB 共享）用 net use；cd 只切目录，robocopy 复制文件，nslookup DNS';
  }
  if (stem.includes('how a packet reaches a server')) {
    return '查看 packet（数据包）到服务器经过哪hops（跳路由）用 traceroute/tracert；ping 只测连通，dig DNS';
  }
  if (stem.includes('without the presence of another employee')) {
    return '要求管理员配置服务器时必须有另一名员工在场，separation of duties（职责分离）/two-person rule，用来降insider threat（内部人员威胁）';
  }
  if (stem.includes('hyper-v') && (stem.includes('home') || answerText.includes('home'))) {
    return 'Windows Hyper-V 需要支持的 edition（版本）Pro/Enterprise/Education；Windows Home 通常没有 Hyper-V 功能入口';
  }
  if (stem.includes('classified information') && stem.includes('hard drives cannot be recovered')) {
    return 'classified drives（涉密硬盘）要确保不可恢复，常用 degaussing followed by physical shredding（消磁后物理粉碎）满足高安全销';
  }
  if (stem.includes('series of commands each day') && stem.includes('linux server')) {
    return 'Linux server 上每天执行一串命令，最可能.sh shell script（Shell 脚本）自动化bat/.vbs Windows';
  }
  if (stem.includes('allocate a shared folder')) {
    return '创建/分配一shared folder（共享文件夹）前先用 mkdir（make directory）建立目录；net use 是映射共享，不是创建目录';
  }
  if (stem.includes('collects and sends data') && stem.includes('without the user')) {
    return '未经同意收集并发送用户数据的spyware（间谍软件）；Trojan 是伪装程序，virus 会感染传播，ransomware 加密勒索';
  }
  if (stem.includes('removable storage are disabled') && stem.includes('in-place upgrade')) {
    return '禁用 removable storage（可移动存储）且要批量就地升级时，用 PXE/network image deployment（网络启镜像部署）保留安全限';
  }
  if (stem.includes('ai makes incorrect assumptions') && stem.includes('limited training')) {
    return 'AI limited training data（训练数据局限）产生系统性错误假设，题眼bias（偏见）；hallucination 更偏生成具体事实错误';
  }
  if (stem.includes('unrestricted') && stem.includes('unsigned scripts')) {
    return 'PowerShell scriptps1）运行未签名脚本会受 execution policy（执行策略）限制；Unrestricted 允许 unsigned scripts';
  }
  if (stem.includes('completes malware remediation') && stem.includes('prevent future')) {
    return 'malware remediation（恶意软件清除）后防止再次感染，最有效的长期措施常user education（用户教育）和安全习惯培';
  }
  if (stem.includes('system time accuracy')) {
    return 'Kerberos token/ticket（Kerberos 票据）依赖客户端、服务器和域控制器时间同步；时间偏差会导致认证失';
  }
  if (stem.includes('intellectual property') && stem.includes('social media')) {
    return '防止 intellectual property（知识产权）被分享到社交平台，优先靠 NDA（保密协议）约束披露责任；SLA 是服务承';
  }
  if (stem.includes('appropriate folder') && stem.includes('hidden items')) {
    return 'AppData 等用户配置目录默认隐藏；File Explorer 里启view hidden items（查看隐藏项目）即可看到';
  }
  if (stem.includes('security software did not detect') || stem.includes('infection was undetected')) {
    return '安全软件未检测到恶意软件常因 definitions/signatures（病毒库/特征库）过期；先更新定义再扫';
  }
  if (stem.includes('windows versions') && stem.includes('server')) {
    return 'Windows Server 2022 是 Microsoft 服务器版 OS；Windows 10/11 Enterprise/Pro 22H2 更偏客户端版本';
  }
  if (stem.includes('prevent malware installation') && stem.includes('disclosure of sensitive information')) {
    return '防止用户安装恶意软件和泄露敏感信息，threat education/security awareness（威胁教安全意识培训）能减少人为风险';
  }
  if (stem.includes('unsigned and cannot be installed') && stem.includes('macos')) {
    return 'macOS 阻止 unsigned app（未签名应用）通常Gatekeeper/Privacy & Security（隐私与安全）控制；调整前应确认来源可信';
  }
  if (stem.includes('regulatory compliance') && stem.includes('confidential information')) {
    return '受监管的机密硬盘销毁应使用 certified third-party destruction（认证第三方销毁）并保chain of custody/certificate（交接链/销毁证明）';
  }
  if (stem.includes('service account') && stem.includes('locked out')) {
    return '服务突然无法启动且手动启动失败，若依service account（服务账户），账locked out（被锁定）会导致认证失败并阻止服务启';
  }
  if (stem.includes('remove ram') && stem.includes('retired workstations')) {
    return '回收 RAM 并运存放时要antistatic bags（防静电袋），避ESD（静电放电）损坏内存；identical pairs 是双通道/兼容性考点，不是存储运';
  }
  if (stem.includes('authentication methods') && stem.includes('token-based')) {
    return '本题题库TACACS+ 归到 token-based/AAA authentication（基于令集中认证）选项；应试时记住 token/ticket/AAA 都是在密码之外由认证服务发放或验证凭据，TKIP Wi-Fi 加密不是认证方法';
  }
  if (stem.includes('antivirus protection') && stem.includes('out of date') && stem.includes('definitions are current')) {
    return '杀毒软件提out of date 但服务器和本engine/definitions（引病毒库）都最新，说明更像 local system files（本机系统文件）损坏导致状态误报，而不是定义库真的过期';
  }
  if (stem.includes('unexpected text message') && stem.includes('link to reset')) {
    return 'unexpected text message（意外短信）里放 reset password link（重置密码链接）smishing（短信钓鱼）；vishing 是电话，spear phishing/whaling 更偏定向邮件或高管目';
  }
  if (stem.includes('superficially delete files')) {
    return 'superficially delete（表面删除）不是高安全销毁；本题题库low-level formatting（低级格式化）表示重清空磁盘结构但不等同shredding/degaussing/wiping 的强销';
  }
  if (stem.includes('service that was running has unexpectedly stopped') && stem.includes('fails to start')) {
    return '服务突然停止且手动启动失败，常见原因service account（服务账户）凭据/状态异常；若账locked out（被锁定），服务无法认证所以启动失';
  }
  if (stem.includes('restore a customer') && stem.includes('access to a website') && stem.includes('point of failure')) {
    return '定位访问网站失败point of failure（故障点）用 tracert/traceroute（路由跟踪）查看到目标的 hops（跳路径）；hostname/netstat/gpupdate 不显示路径断';
  }
  if (stem.includes('create new partitions')) {
    return '创建/管理 Windows partitions（分区）Disk Management（磁盘管理），命令是 diskmgmt.msc；perfmon 看性能，lusrmgr 管用户，devmgmt 管设备驱';
  }
  if (stem.includes('low-cost lab') && stem.includes('test scripts') && stem.includes('managing servers')) {
    return '低成server lab（服务器实验室）和脚本练习优先Linux（开低许可成本），也贴近服务器管理、shell scripting（脚本）和自动化学习场景';
  }
  if (stem.includes('default security settings') && stem.includes('too permissive')) {
    return 'Windows workstations（工作站）默认安全设置过宽时，用 Group Policy（组策略）集中下发安全基线；account lockout 只是其中一个策略项，不GPO 覆盖面完';
  }
  if (stem.includes('no os is found')) {
    return '开机找不到 OS 且硬盘无异常噪音，优先怀boot record/bootloader（启动记引导程序）损坏；A+ 选项里对Master boot record（MBR';
  }
  if (stem.includes('gaming ready') && stem.includes('modern game')) {
    return '游戏本玩现代游戏卡但轻量游戏正常，题眼是 graphics workload（图形负载）；应选择 dedicated graphics（独立显卡）而不NIC teaming、RAM 超频CPU 超线';
  }
  if (stem.includes('upset customer') && stem.includes('interrupts the technician')) {
    return '面对 upset customer（情绪激动客户）active listening（主动倾听）并保持 calm/empathetic tone（冷静同理语气）；不要抢话、甩锅、未沟通就升级或直接补';
  }
  if (stem.includes('trusted url list') && stem.includes('passwords will not be stored')) {
    return '统一配置 browser security settings（浏览器安全设置）、Trusted URL、密码保存、历史记录和内容限制，最佳是 Group Policy（组策略）集中强制下';
  }
  if (stem.includes('4tb ssd') && stem.includes('five primary partitions')) {
    return '4TB SSD 且至five primary partitions（五个主分区）要GPT（GUID 分区表）突破 MBR 2TB/4 主分区限制；Windows 数据文件系统通常NTFS';
  }
  if (stem.includes('certificate warning') && stem.includes('source cannot be verified')) {
    return 'certificate source cannot be verified（证书来源不可验证）说明证书链不被信任；要让其他用户不再警告，应trusted certificate authority（受信任 CA）签发证';
  }
  if (stem.includes('prompt for credentials') && stem.includes('install the application')) {
    return '安装软件弹出 credentials prompt（凭据提示）通常UAC（用户账户控制）在请elevation（提升权限）；本题题库把处理点放UAC settings，而不是重下软件或换浏览器';
  }
  if (stem.includes('legacy business application') && stem.includes('does not meet the application')) {
    return '新电脑不满足 legacy application（遗留应用）要求时，virtual machine（虚拟机）模older OS（旧操作系统）最稳；safe mode/swap file 不能补齐旧系统依';
  }
  if (stem.includes('validate the ip settings')) {
    return 'Windows 查看/验证 IP settings（IP 配置）用 ipconfig；ping 测连通，route print 看路由表，net use 管共享映';
  }
  if (stem.includes('external hard drive') && stem.includes('windows and macos')) {
    return '外置硬盘要同时给 Windows macOS 使用，常exFAT（跨平台文件系统）；NTFS/APFS/XFS 分别Windows/macOS/Linux 原生生';
  }
  if (stem.includes('sandboxed pc') && stem.includes('install the required software')) {
    return 'corporate-imaged sandboxed PC（企业镜像沙箱机）测试安装软件，可临时加local Administrators（本地管理员）完成安装；不要Domain Admins 或共享高权限密码';
  }
  if (stem.includes('manage files in a linux os')) {
    return 'Linux 管理/复制文件常用 cp（copy，复制）；robocopy/xcopy Windows，curl 主要用于 URL 数据传输';
  }
  if (stem.includes('downloaded from the internet') && stem.includes('not been modified')) {
    return '验证下载文件没有被修改，hashing（哈希校验）比较 hash/checksum（校验值）；证书验证来源，插件/扩展不是完整性校验核';
  }
  if (stem.includes('ai tool') && stem.includes('legally generate code')) {
    return '使用 AI 生成代码前要 check sources for copyrighted content（检查来源是否含受版权保护内容），避免把不明授权代码静默放进应用';
  }
  if (stem.includes('central log-in') && stem.includes('windows computer')) {
    return 'Windows 电脑central log-in（集中登录）通常必须加入 domain（域）；Active Directory 是后台目录服务，电脑端动作是 domain membership（域成员身份';
  }
  if (stem.includes('shorter screensaver timeout')) {
    return '缩短 screensaver timeout（屏锁屏超时）属于本地或组策略设置，单机工具常gpedit.msc；certmgr/devmgmt/perfmon 分别管证书、设备、性能';
  }
  if (stem.includes('smartphone') && stem.includes('data usage has increased') && stem.includes('battery drains')) {
    return '手机闲置data usage（数据用量）暴增、发热且 battery drains（电池快速耗尽），优先检malicious applications（恶意应用）或后台异常行为，而不是临时开飞行模式';
  }
  if (stem.includes('preferred word processor') && stem.includes('work laptop') && stem.includes('installation fails')) {
    return '工作电脑安装个人偏好软件失败，常见是 ACL/permissions（访问控制列权限）或企业策略限制安装；浏览器缓存、网速、未格式化磁盘都不贴';
  }
  if (stem.includes('administrative privileges for deployment')) {
    return '软件部署需要管理员权限时，最佳是 just-in-time access（JIT，即时权限）按需临时授权；长期加 local admin 或手动共享高权限都不符合最小权限';
  }
  if (stem.includes('prior unresolved tickets') && stem.includes('communicate with the customer')) {
    return '看到 prior unresolved tickets（之前多张未解决工单）且客户沮丧时，listen and acknowledge frustrations（倾听并认可挫败感），再澄清问题；不要立刻甩给上级或评价前任处';
  }
  if (stem.includes('macos users') && stem.includes('placing the file in the trash')) {
    return 'macOS .app（应用包）常可通过拖到 Trash（废纸篓）卸载；.pkg 是安装包msi/.exe Windowsrpm Linux 软件';
  }
  if (stem.includes('information exfiltration')) {
    return '防止 information exfiltration（信息外数据外传）用 DLP（Data Loss Prevention，数据防泄漏）；MDM 管设备，SAML/IAM 管身份认证与授权';
  }
  if (stem.includes('shipped directly to users from the manufacturer')) {
    return '电脑manufacturer（厂商）直发给远程用户时，用 zero-touch deployment（零接触部署）让设备开机后自动注册、下发策略和应用';
  }
  if (stem.includes('browser to encrypt communications') || stem.includes('login and payment details')) {
    return '浏览器输login/payment details（登支付信息）时，应强制 HTTPS-Only Mode（仅 HTTPS 模式）保证传输加密；禁用 cookies/JS/pop-up 不等于加密通信';
  }
  if (stem.includes('thousands of compromised machines') && stem.includes('fake purchases')) {
    return '大量 compromised machines（受控主机）同时对在线商店发起假购买，属botnet-driven DDoS/application-layer flood（僵尸网络分布式拒绝服务/应用层洪泛）';
  }
  if (stem.includes('automated tasks on startup') && stem.includes('windows computer')) {
    return 'Windows startup（启动时）自动化任务常用 BAT（批处理文件）或脚本；SH Linux，MSI 是安装包，EXE 是可执行程序但不是脚本文件类';
  }
  if (stem.includes('software that is eol')) {
    return 'EOL software（生命周期结束软件）的安全后果是 new vulnerabilities will not be patched（新漏洞不会再被修补）；软件可能还能运行，但风险会持续增';
  }
  if (stem.includes('preventing future unauthorized software installations')) {
    return '防止 future unauthorized software installations（未来未授权安装），remove account administrative rights（移除本地管理员权限）；防火墙、EDR、SmartScreen 不能替代权限控制';
  }
  if (stem.includes('leave their desks without logging off')) {
    return '员工离开座位不锁屏时，用 inactivity timeout settings（闲置超自动锁定）自动锁定会话，防止旁人使用已登录工作站';
  }
  if (stem.includes('provided to a user during mfa')) {
    return 'MFA 中提供给用户的一次性验证码常见 TOTP（Time-based One-Time Password，基于时间的一次性密码）；DLP/MDM/FRT 不是用户收到的认证码';
  }
  if (stem.includes('output the os name to a file')) {
    return '在给定选项里，winver 用于查看 Windows OS/version（系统版本）；若题目强调重定向到文件，真实工作中更常用 systeminfo 或 PowerShell，但本题选 winver';
  }
  if (stem.includes('work only during certain times')) {
    return '供应商账户只能在指定时段工作，应配置 account login restrictions / logon hours（账户登录时间限制），而不是只设置账户过期或事后告警';
  }
  if (stem.includes('legacy linux-based operating system') && stem.includes('see what the user is doing')) {
    return 'remote support（远程支持）Linux GUI 且要 see/interact with session（看到并操作用户会话）时VNC；VPN 只进内网，SSH 是命令行，RDP Windows';
  }
  if (stem.includes('bitlocker to go')) {
    return 'BitLocker To Go 用于 removable media（可移动介质）加密，丢失或被盗时需password protected（密码保护）防止数据泄露';
  }
  if (stem.includes('deploying mobile devices') && stem.includes('sensitive data') && stem.includes('lost')) {
    return '移动设备丢失且用户可能不知道时，最可靠的本地防护是 encryption（加密）保护 data at rest（静态数据）；remote wipe 依赖设备上线和触';
  }
  if (stem.includes('internet browsing policy') && stem.includes('unauthorized websites based on categorization')) {
    return 'SOHO router 上按 website category（网站分类）阻止未授权网站，考点是 content filtering（内容过滤），不是普通 firewall 端口规则或 Windows Group Policy';
  }
  if (stem.includes('company-owned cell phone') && stem.includes('unauthorized installations')) {
    return '公司手机出现未授app 后要防止再次安装，核心是 MDM（移动设备管理）下发 app restrictions（应用限制）和合规策';
  }
  if (stem.includes('only administrators can enable virtualization technology')) {
    return '限制谁能开virtualization technology（虚拟化技术）要保BIOS/UEFI settings（固件设置）；BIOS password 可阻止普通用户改虚拟化开';
  }
  if (stem.includes('specific spreadsheet') && stem.includes('not responding')) {
    return '特定 spreadsheet（电子表格）多年累积数据后打开卡死，优先看 file size and memory utilization（文件大小与内存占用），不是网络带宽或整机维';
  }
  if (stem.includes('enable full drive encryption')) {
    return 'Windows laptop built-in full drive encryption（内置整盘加密）BitLocker；EFS 只偏单文文件夹，NTFS 是文件系统，AD 是目录服';
  }
  if (stem.includes('32-bit or 64-bit os architecture')) {
    return '选择 32-bit/64-bit OS architecture（系统架构）取决CPU 是否支持 64-bit 指令集；RAM 容量会影响选择CPU 架构是前';
  }
  if (stem.includes('offboard a user')) {
    return 'user offboarding（员工离移交）常见任务是 disable/suspend accounts（停用账号）revoke physical access（撤销门禁），不要随意清除 PII 或隔离硬';
  }
  if (stem.includes('same spreadsheet for several years') && stem.includes('unable to open the file')) {
    return '多年累积 spreadsheet 数据后无法打开，常见瓶颈是 memory/RAM（内存）不足以加载大文件；碎片整理或网络升级不直接解决文件加';
  }
  if (stem.includes('credential manager') && stem.includes('large number of credentials')) {
    return 'credential manager（凭据管理器）的安全核心secure master password（强主密码）；它保护整个密码库，TPM/锁屏/登录时间不是这个应用的首要条';
  }
  if (stem.includes('work from home') && stem.includes('windows pc at the main office')) {
    return '在家使用办公Windows PC 通常需VPN（先安全接入内网 RDP（远程桌面操作电脑）；一个解决通路，一个解决桌面控';
  }
  if (stem.includes('windows server') && stem.includes('remote desktop connections for multiple users')) {
    return 'Windows server 开multiple remote desktop connections（多用户远程桌面）时要允firewall rule（防火墙规则）通过 RDP 流量';
  }
  if (stem.includes('only assigned users can access') && stem.includes('newly deployed workstation')) {
    return '新工作站防止未授权用户访问，常用 screensaver lock（屏保锁定）和 BIOS password（固件密码）；一个保护会话，一个保护启动/固件设置';
  }
  if (stem.includes('international traveler') && stem.includes('smartphone') && stem.includes('lost or stolen')) {
    return '手机丢失/被盗且已biometrics（生物识别）时，进一步降低数据访问风险靠 device encryption（设备加密）保护本地数据';
  }
  if (stem.includes('town hall server') && stem.includes('work from home')) {
    return '在家访问 town hall server（单位内部服务器）需VPN（虚拟专用网络）进入内网；VNC/RDP 是远控桌面，SSH 是命令行';
  }
  if (stem.includes('unable to upgrade') && stem.includes('windows 11')) {
    return 'Windows 11 upgrade（升级）常见硬性要求包TPM 2.0、Secure Boot、CPU/内存等；题库选项missing TPM module 最贴近升级阻断';
  }
  if (stem.includes('anti-piracy technologies') && stem.includes('briefly opens and then closes')) {
    return 'anti-piracy（反盗版）技术的软件启动即退出，常见USB key/dongle（硬件加密狗）未插入，授权校验失';
  }
  if (stem.includes('hardening a newly installed company workstation')) {
    return 'workstation hardening（工作站加固）常见动作是 disable guest account（禁用访客）change default administrator password（改默认管理员密码）';
  }
  if (stem.includes('clean installation from a usb drive') && stem.includes('installer loads again')) {
    return 'USB clean install（U 盘全新安装）重启后又进安装器，通常是还USB 启动；移USB drive 或调boot order 才能进入新系';
  }
  if (stem.includes('potential issues with a proposed change prior to implementation')) {
    return '变更实施前验证潜在问题用 sandbox testing（沙箱测试）；rollback plan 是失败后回退，request form 是发起，end-user acceptance 是验';
  }
  if (stem.includes('mdm policy') && stem.includes('unique to each user')) {
    return 'MDM hardening 使用每个用户独有特征时属biometric authentication（生物识别），fingerprint（指纹）pattern/password 更个人唯一';
  }
  if (stem.includes('collaboration tool') && stem.includes('highly regulated environment')) {
    return '高度监管环境里沟sensitive information（敏感信息），协作工具要MFA（多因素）、private channels（私有频道）data retention（数据保留）满足访问控制与合';
  }
  if (stem.includes('sensitive data on employee laptops') && stem.includes('taken off premises')) {
    return '员工 laptop 带离办公地点且担data theft（数据盗窃），首full disk encryption（整盘加密）保护静态数';
  }
  if (stem.includes('service did not start due to a log-on failure')) {
    return 'Windows service log-on failure（登录失败）时，重点service account（服务账户）是否 disabled/locked/password changed；这里是 LDAP service account disabled';
  }
  if (stem.includes('log in to the intranet') && stem.includes('without logging the current user out')) {
    return '在用户电脑上临时登录 intranet 又不退出当前用户，使用 private browsing/incognito（隐私浏览）隔离会话和缓';
  }
  if (stem.includes('unexpected overdue invoice') && stem.includes('issue persists')) {
    return '手机点开可疑 overdue invoice 附件后多应用异常且重启无效，按移动端恶意软件处置选择 wipe/factory reset（擦除并恢复出厂';
  }
  if (stem.includes('without a wi-fi connection') && stem.includes('after the user returns from a business trip')) {
    return '出差回来后手机没Wi-Fi 就不能上收邮件，优先检cellular data（蜂窝数据）是否关闭或被策略禁用';
  }
  if (stem.includes('prevent unauthorized physical access to its mobile devices')) {
    return '防止未授权物理访问 mobile devices（移动设备），要用 PIN authentication（PIN 解锁）和 screen timeout（自动锁屏超时）';
  }
  if (stem.includes('temperature and humidity') && stem.includes('multiple active computers')) {
    return '机房/多设备环境控temperature and humidity（温湿度）可减少 static discharge（静电放电）和硬件风险；湿度过低更易积累静电';
  }
  if (stem.includes('all phones be compliant') && stem.includes('os patches')) {
    return '公司手机要合规并保持 OS patches（系统补丁）最新，使用 MDM（移动设备管理）集中下发策略、更新和合规检';
  }
  if (stem.includes('website loads properly on a test workstation')) {
    return '网站只在某台电脑报错而测试机正常，若涉及证书/时间相关错误，incorrect NTP settings（时间同步错误）会导致证书验证失';
  }
  if (stem.includes('task manager multiple times') && stem.includes('does not open')) {
    return 'Task Manager 多次打不开且机器性能异常，常见是 malware infection（恶意软件感染）阻止诊断工具运行';
  }
  if (stem.includes('project status presentation') && stem.includes('external stakeholders')) {
    return '给外stakeholders（干系人）做项目状态展示，需videoconferencing（视频会议）软件；RMM/WinRM 是远程管理，SFT 是文件传';
  }
  if (stem.includes('time on their computer does not match') && stem.includes('voip phone')) {
    return '电脑VoIP phone 时间不一致，统一配置 NTP server（网络时间协议服务器）同步时间；手动改一台设备不能长期解';
  }
  if (stem.includes('vram requirement') && stem.includes('integrated video')) {
    return 'integrated graphics（集成显卡）通常共享系统内存，满VRAM requirement（显存要求）可能要进 BIOS/UEFI options 调整共享显存';
  }
  if (stem.includes('utility failure causes a workstation to immediately shut down')) {
    return '市电/utility failure（供电中断）导致工作站立刻关机，应使UPS（不间断电源）提供短时供电和安全关机时间';
  }
  if (stem.includes('linux server') && stem.includes('disk management tool') && stem.includes('gui')) {
    return '远程管理 Linux server 且工only accessible via GUI（只能图形界面访问），VNC 提供图形桌面；SSH 只有命令行，VPN 只提供通路';
  }
  if (stem.includes('soho firewall') && stem.includes('keep the firewall secure in the future')) {
    return 'SOHO firewall 已完成初始加固后，长期保持安全要 schedule regular firmware updates（定期固件更新）修补漏洞';
  }
  if (stem.includes('upgrades the ram') && stem.includes('no boot device found')) {
    return '升级 RAM 后出No boot device found（找不到启动设备），优先怀疑操作时碰松 SATA HDD power/data cable（硬盘线缆），而不是立刻格式化';
  }
  if (stem.includes('microsoft edge') && stem.includes('file type is blocked')) {
    return 'Microsoft Edge 阻止下载特定安全文件类型，且技术员确认文件安全，应配置 SmartScreen（信誉筛下载拦截）例外或允许策略';
  }
  if (stem.includes('will not load windows') && stem.includes('hardware') && stem.includes('working properly')) {
    return '硬件检查正常但 Windows 不加载，下一步查 boot order（启动顺序）/启动设备；filesystem/encryption/drivers 都是更后面的层面';
  }
  if (stem.includes('windows web server') && stem.includes('default remote access technologies')) {
    return '默认远程连接 Windows web server（Windows 服务器）通常RDP（远程桌面协议）；SSH Linux/命令行，VNC/SPICE Windows 默认首';
  }
  if (stem.includes('linux commands') && stem.includes('documentation')) {
    return 'Linux read another command’s documentation（读取命令文档）man（manual pages，手册页）；chmod 改权限，cat 看文件，sudo 提权';
  }
  if (stem.includes('dns') || stem.includes('record') || stem.includes('domain')) {
    return '根据 DNS record（DNS 记录）用途选择 A/AAAA/CNAME/MX/TXT/SPF/DKIM/DMARC';
  }
  if (stem.includes('raid')) {
    return '根据 RAID 目标区分 performance（性能）、redundancy（冗余）和可容忍磁盘故障数量';
  }
  if (stem.includes('display') || stem.includes('monitor') || stem.includes('resolution')) {
    return '按显示接口、分辨率或显示故障题眼选择最匹配video/display 组件';
  }
  if (stem.includes('network') || stem.includes('ip address') || stem.includes('wireless')) {
    return '先判network（网络）连接、地址、DNS default gateway（默认网关）问题';
  }
  if (stem.includes('cloud') || topicText.includes('cloud')) {
    return '区分 cloud（云）模型的控制权、合规性和管理开销';
  }
  if (stem.includes('first') || stem.includes('next')) {
    return 'troubleshooting（故障排查）顺序选择低风险、最直接的一';
  }

  return '锁定题干exam clue（考试线索）：受影响对象、目标动作、限制词和选项职责；答案必须和这些线索处在同一技术层';
}

function collectKeywords(question, optionTerms = []) {
  const stem = String(question.stem ?? '');
  const acronymMatches = stem.match(/\b[A-Z][A-Z0-9+.-]{1,}\b/g) ?? [];
  const quotedMatches = stem.match(/"([^"]{3,60})"/g) ?? [];
  const stemTerms = lookupTerms(stem).flatMap((term) => [term.label, ...term.patterns]);
  const answerTerms = optionTerms.flatMap((term) => [term.label, ...term.patterns]);
  const printerKeywords = isPrinterQuestion(question)
    ? ['printer', 'print', 'copy', 'copies', 'scan', 'scans', 'fax', 'faxes', 'vertical line']
    : [];
  const esdKeywords = isEsdWristStrapQuestion(question)
    ? ['wrist strap', 'electrostatic charge', 'ESD', 'ground', 'RAM']
    : [];

  return unique([
    ...answerTerms,
    ...stemTerms,
    ...printerKeywords,
    ...esdKeywords,
    ...acronymMatches,
    ...quotedMatches.map((item) => item.replaceAll('"', '')),
  ]).filter((item) => String(item).length >= 2).slice(0, 16);
}

export function emphasizeKeywords(text = '', keywords = []) {
  const raw = String(text);
  const phrases = unique(keywords)
    .map(String)
    .filter((item) => item.length >= 2)
    .sort((a, b) => b.length - a.length);

  if (!phrases.length) return escapeHtml(raw);

  const ranges = [];
  const lower = raw.toLowerCase();

  for (const phrase of phrases) {
    const needle = phrase.toLowerCase();
    let index = lower.indexOf(needle);

    while (index !== -1) {
      const nextRange = { start: index, end: index + phrase.length };
      const overlaps = ranges.some((range) => (
        nextRange.start < range.end && nextRange.end > range.start
      ));

      if (!overlaps) ranges.push(nextRange);
      index = lower.indexOf(needle, index + needle.length);
    }
  }

  if (!ranges.length) return escapeHtml(raw);
  ranges.sort((a, b) => a.start - b.start);

  let cursor = 0;
  let html = '';
  for (const range of ranges) {
    html += escapeHtml(raw.slice(cursor, range.start));
    html += `<strong>${escapeHtml(raw.slice(range.start, range.end))}</strong>`;
    cursor = range.end;
  }
  html += escapeHtml(raw.slice(cursor));
  return html;
}

function buildPrinterScenario(question) {
  const stem = normalizeText(question.stem);

  if (isScanPathPrinterQuestion(question)) {
    return '题眼 copy/scan 异常，但 print/fax 正常：问题在 scanner glass/ADF（扫描玻璃/自动送稿器）这条扫描路径，不是 toner/drum/fuser（碳粉/感光鼓/定影器）这条打印引擎';
  }
  if (stem.includes('smudge') || stem.includes('wipes') || stem.includes('come off')) {
    return '题眼 toner 一擦就掉或 smudge（涂抹）：优先想 fuser（定影器），因为它负责把碳粉热压固定到纸上';
  }
  if (stem.includes('jam') || stem.includes('misfeed') || stem.includes('not feeding')) {
    return '题眼paper jam/misfeed（卡进纸失败）：优先检pickup rollers（搓纸轮）、tray（纸盒）paper path（走纸路径）';
  }
  if (stem.includes('queue') || stem.includes('spooler')) {
    return '题眼print queue（打印队列）卡住：先处理 Print Spooler（打印后台处理服务）和本机队列，再考虑设备硬件';
  }
  if (stem.includes('security vulnerability') || stem.includes('manufacturer has an update')) {
    return '题眼是厂商发布安全漏洞或设备功能修复：通常firmware（固件）更新，而不是普driver（驱动）或网络配置';
  }

  return 'printer 题先问自己：这是 paper feed（进纸）、image quality（成像质量）、scan/copy path（扫描路径）、network（网络）还是 queue/spooler（队列服务）问题';
}

function getTargetedCore1StudyNotes(question) {
  switch (getTargetedCore1Scenario(question)) {
    case 'single-client-wifi':
      return [
        'Wi-Fi 排障先看范围：one user（单人）优先client device（客户端设备）；many users（多人）才优先查 AP、信道、干扰或上游网络',
        '无线网卡常见问题包括 driver（驱动）、antenna（天线）、radio hardware（射频硬件）和电源管理导致间歇掉线',
      ];
    case 'legacy-app-virtualization':
      return [
        'legacy application（遗留应用）要“保留到退役”时，virtualization（虚拟化）常用于封装OS/依赖，降低旧硬件风险',
        'SAN 是存储，configuration management 是配补丁，FaaS 通常要重构应用；它们都不VM 迁移贴近“维持旧应用”',
      ];
    case 'spreadsheet-orientation':
      return [
        'print layout（打印版式）题先看限制：题干保留 duplex（双面），所以不能turn off duplex',
        'spreadsheet columns（表格列）横向太宽时优先landscape/page orientation（横页面方向），不要先把字体缩到难读',
      ];
    case 'physical-port-loopback':
      return [
        'loopback plug（回环插头）测试端口 send/receive（发接收）能力，适合确认 physical port（物理端口）是否工作',
        'network tap 抓流量，crimper 做水晶头，patch panel 管理布线；它们不是端口自测工具',
      ];
    case 'home-office-unmanaged-switch':
      return [
        '已有 internet service（互联网服务）时，增加有线设备端口通常switch（交换机），不是再加 modem（调制解调器）',
        'unmanaged switch（非管理型交换机）即插即用、成本低；managed switch 才用VLAN、端口管理和监控',
      ];
    case 'rj45-crimper':
      return [
        'RJ45 plug（水晶头）端接用 crimper（压线钳）；keystone jack/patch panel（信息模配线架）端接punchdown tool（打线工具）',
        'cable stripper（剥线钳）只剥外皮，loopback plug（回环插头）只测端口，不负责压接',
      ];
    case 'hotspot-connectivity':
      return [
        'hotspot（热点）通过 Wi-Fi 分享 cellular data（蜂窝数据），通常Bluetooth tethering（蓝牙共享）更适合性能题',
        'NFC 是近场识支付，Lightning cable 是有线连接；题干limited accessories（少配件）时优先热点',
      ];
    case 'disabled-port-managed-switch':
      return [
        'port disabled（端口被禁用）是 switch administration（交换机管理）语义，不是单纯物理线缆断开',
        'managed switch（管理型交换机）enable/disable ports、配VLAN、看端口状态；patch panel 是被动布线',
      ];
    case 'vlan-managed-switch':
      return [
        'VLAN configuration（VLAN 配置）通常managed switch（管理型交换机）上做 Port VLAN assignment（端VLAN 分配 VLAN membership（VLAN 成员关系）设置',
        'hub 是一层设备，modem ISP 接入，PoE injector 只注入电力，都不管理 VLAN',
      ];
    case 'plenum-cable':
      return [
        'plenum space（通风夹层）会把烟雾带到整栋楼，所以线缆要 plenum-rated（阻燃低烟）',
        '这题fire rating（防火等级），不是传输介质：multimode 是光纤类型，twisted pair 只是铜缆结构',
      ];
    case 'dmarc-txt-record':
      return [
        'SPF、DKIM、DMARC 这类 email authentication（邮件认证）策略常发布在 DNS TXT record（文本记录）里',
        'MX record（邮件交换记录）只决定邮件投递到哪台 mail server；A/CNAME 做名称解析，不承DMARC 策略',
      ];
    case 'phone-digitizer':
      return [
        'touch screen 常拆display/screen（显示）digitizer（触控数字化层）：显示正常但触摸无响应，优先 digitizer',
        'battery 看供续航，stylus 是输入工具；题干说重启无效且无外伤，排除临时软件卡顿后查触控层',
      ];
    case 'replace-patch-cable':
      return [
        'port flapping（端口反up/down）常见原因是 patch cable（水晶头/短跳线）、端口、PoE 或协商异常',
        '换到另一switch port 后仍 flapping，原端口嫌疑下降；下一步先device-to-wall patch cable，成本最低且最直接',
      ];
    case 'cloud-synchronization':
      return [
        'synchronization（同步）表示多设备文件状态自动保持一致，本地文件夹会出现其他设备的更新',
        'network share 是访问共享位置，availability 是可用性，metered utilization 是按量计费；都不描述多端自动更新',
      ];
    case 'ap-port-flapping':
      return [
        'AP activity light 反复亮灭且设备不上线，优先想有线链路PoE 反复 up/down，而不是无线客户端干扰',
        'high latency 是“连上但慢”，channel conflict/interference 影响无线质量；本AP 自己没稳定上线',
      ];
    case 'raid6-two-drive-fault':
      return [
        'RAID 0 无冗余；RAID 1 镜像常见可坏一块；RAID 5 单校验可坏一块；RAID 6 双校验可坏两块',
        'A+ 速记：two drive failures without data loss（坏两块不丢数据）基本锁RAID 6',
      ];
    case 'private-cloud-local-datacenter':
      return [
        'private cloud（私有云）是单一组织专用，可在本data center（数据中心）或专用托管环境里运行',
        'public cloud 是云厂商共享基础设施，hybrid 混合本地和公有云，community cloud 是多组织共享',
      ];
    case 'rj45-reterminate-crimper':
      return [
        'RJ45 pin not properly terminated（RJ45 端接不良）要重新压接 plug（水晶头），工具crimper（压线钳）',
        'cable tester 能确认线通断，toner probe 用于寻线，punchdown tool 用于 patch panel/keystone jack',
      ];
    case 'cloud-email-saas':
    case 'company-resources-saas':
      return [
        'SaaS（软件即服务）是直接使用供应商托管的应用，例email、CRM、在线办公和公司资源门户',
        'IaaS 是租 VM/storage/networking 后自己管 OS；PaaS 是给开发者部署代码；FaaS 是事件触发函数；DaaS 是云桌面',
      ];
    case 'type2-underlying-os':
      return [
        'Type 2 hypervisor（宿主型虚拟化）安装host OS（宿主操作系统）上，例如 VirtualBox、VMware Workstation',
        'Type 1 hypervisor（裸机型）直接运行在硬件上，例如 ESXi Hyper-V Server；看bare-metal 就想 Type 1',
      ];
    default:
      return [];
  }
}

function getTargetedCore1SpeedTip(question) {
  switch (getTargetedCore1Scenario(question)) {
    case 'single-client-wifi':
      return '速通：同一区域只有 one laptop 间歇 Wi-Fi 异常，先client wireless card；多人同时异常才怀AP/干扰/信道';
    case 'legacy-app-virtualization':
      return '速通：legacy app 跑在 physical servers 上且要维持到退= virtualization，把旧环境搬VM';
    case 'spreadsheet-orientation':
      return '速通：spreadsheet 太宽但必duplex，page orientation/landscape，不要关双面或继续缩字';
    case 'physical-port-loopback':
      return '速通：confirm physical port works = loopback plug；trace cable = toner probe；test wire map = cable tester';
    case 'home-office-unmanaged-switch':
      return '速通：已有网络，只想低成本加有线端= unmanaged switch';
    case 'rj45-crimper':
      return '速通：RJ45 plug（水晶头）压= crimper；patch panel/keystone = punchdown';
    case 'hotspot-connectivity':
      return '速通：少配+ 最好移动连接性能 = hotspot；Bluetooth/NFC 不适合性能题';
    case 'disabled-port-managed-switch':
      return '速通：题干port disabled，就managed switch，因为禁启用端口是管理功能';
    case 'vlan-managed-switch':
      return '速通：desktops VLAN configuration = 连接 managed switch，不modem/hub/PoE injector';
    case 'plenum-cable':
      return '速通：suspended ceiling + air ventilation = plenum cable；关键词是消防低烟，不是线缆速度';
    case 'dmarc-txt-record':
      return '速通：DMARC/SPF/DKIM 发布策略 = TXT；邮件投递目的地才是 MX';
    case 'phone-digitizer':
      return '速通：display 正常touch 不响= digitizer；screen 是显示，stylus 是笔，battery 是供电';
    case 'replace-patch-cable':
      return '速通：port flapping switch port 仍存在，下一步先device-to-wall patch cable';
    case 'cloud-synchronization':
      return '速通：本地文件夹自动出现其他设备更= synchronization';
    case 'ap-port-flapping':
      return '速通：AP 灯亮一下又灭、设备不上线 = port flapping/有线链路，不是无线干扰';
    case 'raid6-two-drive-fault':
      return '速通：RAID 能坏 two drives 还不丢数= RAID 6';
    case 'private-cloud-local-datacenter':
      return '速通：exclusively local data center = private cloud；local + public 才是 hybrid';
    case 'rj45-reterminate-crimper':
      return '速通：RJ45 pin terminated wrong 且问 fix = crimper；tester 只能验证，toner probe 只寻线';
    case 'cloud-email-saas':
    case 'company-resources-saas':
      return '速通：用户直接用云端应邮件/公司资源且少基础设施 = SaaS';
    case 'type2-underlying-os':
      return '速通：Type 2 = needs underlying OS；Type 1 = bare-metal';
    default:
      return '';
  }
}

function getAnswerOptionTexts(question) {
  const answerSet = new Set(question.answer ?? []);
  return (question.options ?? [])
    .filter((option) => answerSet.has(option.key))
    .map((option) => option.text);
}

function getGeneralCore1StudyProfile(question) {
  const stem = normalizeText(question.stem);
  const optionText = normalizeText((question.options ?? []).map((option) => option.text).join(' '));
  const answerText = normalizeText(getAnswerOptionTexts(question).join(' '));
  const text = `${stem} ${optionText} ${answerText}`;

  if (text.includes('cloud') || /\b(saas|paas|iaas|faas|daas|hybrid|public cloud|private cloud|community cloud)\b/.test(text)) {
    return {
      speedTip: '速通：cloud model 题先问“用户直接用应用、开发平台、租基础设施、还是本公有云组合”',
      notes: [
        'SaaS（软件即服务）是直接用应用；PaaS（平台即服务）是部署代码的平台；IaaS（基础设施即服务）是租 VM、storage、networking 后自己管 OS',
        'public cloud（公有云）在云厂商共享基础设施；private cloud（私有云）专供一个组织；hybrid cloud（混合云）组合本私有和公有云',
      ],
    };
  }

  if (text.includes('raid')) {
    return {
      speedTip: '速通：RAID 题先数“能坏几块盘”和目标speed 还是 redundancy',
      notes: [
        'RAID 0 striping（条带化）提速但无冗余；RAID 1 mirroring（镜像）；RAID 5 single parity（单校验）；RAID 6 dual parity（双校验）',
        '考试里看performance/read speed 多想 RAID 0 或条带；看到 tolerate two drive failures（容忍两盘故障）基本锁定 RAID 6',
      ],
    };
  }

  if (/\b(remote support|remote access|remote desktop|rdp|vnc|ssh|vpn|winrm|rmm|sftp|legacy linux|windows pc at the main office)\b/.test(text)) {
    return {
      speedTip: '速通：remote access 题先分“图形桌面、命令行、加密隧道、文件传输、集中托管”',
      notes: [
        'RDP（远程桌面协议）Windows 图形桌面；VNC（虚拟网络计算）跨平台图形遥控；SSH 是加密命令行；VPN 是先接入内网，不等于远控桌面本身',
        'SFTP SSH 做加密文件传输；RMM（远程监控管理）偏集中托管设备；WinRM 偏脚本化管理 Windows',
      ],
    };
  }

  if (/\b(command-line|command line|cmd|powershell|terminal|netstat|ipconfig|nslookup|dig|ping|tracert|traceroute|pathping|whoami|hostname|winver|systeminfo|net user|net use|chkdsk|robocopy|xcopy|chmod|sudo|cat|ls|mkdir|cp)\b/.test(text)) {
    return {
      speedTip: '速通：command 题不要背长句，先问“这个命令输出什么”',
      notes: [
        'ipconfig/ip addr IP 配置；ping 测连通；tracert/traceroute/pathping 看路径；nslookup/dig DNS；netstat 看连接和端口',
        'whoami 看当前用户；hostname 看计算机名；winver Windows 版本；net user 管账户；net use 管共享映射',
      ],
    };
  }

  if (/\b(settings|control panel|services|event viewer|task manager|device manager|disk management|gpedit|lusrmgr|registry|default apps|windows update|print spooler|startup|safe mode|recovery|restore point)\b/.test(text)) {
    return {
      speedTip: '速通：Windows admin 题先定位控制面板/设置项、服务、日志、设备、磁盘或账户管理',
      notes: [
        'Services（服务）看后台服务状态和启动类型；Event Viewer（事件查看器）看日志；Task Manager（任务管理器）看进程和资源；Device Manager（设备管理器）看驱动/硬件',
        'Disk Management 管磁分区，gpedit 管本地组策略，lusrmgr 管本地用户和组；Default apps/Apps 处理默认应用和应用卸载',
      ],
    };
  }

  if (/\b(policy|aup|sla|sop|nda|mnda|eula|change management|risk analysis|backup plan|document findings|sandbox testing|contract|vendor|compliance|acceptable use|standard operating procedures|service-level)\b/.test(text)) {
    return {
      speedTip: '速通：policy/process 题看它是在约束行为、定义服务承诺、保护机密，还是按变更流程排序',
      notes: [
        'AUP（可接受使用政策）管员工如何使用资源；SLA 定义服务响应/可用性承诺；NDA/MNDA 管保密；EULA 管软件许可',
        '变更管理常见顺序：提界定变更、风险分析、审排期、测实施、验证并记录结果；不要跳过风险和回退思考',
      ],
    };
  }

  if (/\b(dns|dhcp|ip address|gateway|subnet|vlan|switch|router|firewall|port|ethernet|wi-fi|wireless|network|rj45|cable|patch panel|poe|vpn|rdp|ssh|ldap|ftp)\b/.test(text)) {
    return {
      speedTip: '速通：network 题先分层，地址/DNS/DHCP 是配置，switch/VLAN LAN，router/gateway 是跨网段，工具题看动作',
      notes: [
        'DHCP 自动IP 参数；DNS 做名称解析；default gateway 负责去外跨网段；VLAN 做逻辑分段；managed switch 才能做端VLAN 管理',
        '工具题要背动作：crimper RJ45，punchdown 打配线架/模块，cable tester 测线序通断，toner probe 寻线，loopback plug 测端口',
      ],
    };
  }

  if (/\b(virtual|vm|vdi|hypervisor|container|sandbox|bare-metal|host os|desktop resources)\b/.test(text)) {
    return {
      speedTip: '速通：virtualization 题看隔离层，Type 1 直接跑硬件，Type 2 跑在 host OS，container 共享内核，VDI 提供远程桌面',
      notes: [
        'VM（虚拟机）有 guest OS，隔离强但资源重；container（容器）共享 host kernel，启动快、资源省但隔离较轻',
        'VDI（虚拟桌面基础架构）把桌面运行在服务器端；sandbox（沙箱）用于隔离测试可疑文件或未知代码',
      ],
    };
  }

  if (/\b(display|monitor|projector|screen|resolution|hdmi|displayport|vga|usb-c|thunderbolt|video|flicker|image|brightness)\b/.test(text)) {
    return {
      speedTip: '速通：display 题先判断是接线缆、显示模式、分辨率，还是屏投影设备本身',
      notes: [
        'HDMI/DisplayPort/USB-C/Thunderbolt 常video output（视频输出）和兼容性；USB-C 不等于一定支持视频，要看 Alt Mode/Thunderbolt 能力',
        'duplicate/extend（复扩展）是显示模式；resolution（分辨率）和 orientation（方向）是画面设置；flicker（闪烁）常先查线接口/刷新率',
      ],
    };
  }

  if (/\b(phone|tablet|mobile|bluetooth|nfc|cellular|roaming|hotspot|tethering|stylus|battery|touch|digitizer|sim|esim)\b/.test(text)) {
    return {
      speedTip: '速通：mobile 题先connectivity（连接）、power（电充电）、input（触笔）management（MDM/策略）',
      notes: [
        'Bluetooth 适合短距配对外设，NFC 是极短距轻触通信，cellular/hotspot/tethering 用蜂窝数据给设备联网',
        'touch input（触摸输入）异常digitizer；显示异常看 screen/display；国际数据问题常data roaming/eSIM/SIM plan',
      ],
    };
  }

  if (/\b(power|psu|ups|battery|cmos|voltage|turn on|shutdown|burning smell|burnt|fan|heat|overheating|thermal)\b/.test(text)) {
    return {
      speedTip: '速通：power/thermal 题先区分完全不开机、断电保护、时间丢失、过热降频和烧焦味',
      notes: [
        'PSU（电源）影响开机和供电稳定；UPS（不间断电源）给断电缓冲；CMOS battery（主板纽扣电池）保存时间BIOS/UEFI 设置',
        'overheating（过热）常看 fan、heat sink、airflow、dust/filter；burning smell（烧焦味）先断电，避免继续损坏',
      ],
    };
  }

  if (/\b(ram|memory|dimm|sodimm|rdimm|ecc|ddr|channel)\b/.test(text)) {
    return {
      speedTip: '速通：memory 题先看设备类型、纠错需求、代电压和通道带宽',
      notes: [
        'DIMM 多用desktop/server，SODIMM 多用laptop；ECC memory（纠错内存）常用server/file server；RDIMM 是服务器常见 registered memory',
        'dual-channel/multi-channel（双通道/多通道）提升内存带宽；DDR 代际要匹配主板槽位和电压',
      ],
    };
  }

  if (/\b(storage|hdd|ssd|nvme|sata|sas|m\\.2|drive|disk|capacity|boot|post|smart)\b/.test(text)) {
    return {
      speedTip: '速通：storage 题看速度、容量、接口和故障信号，clicking/SMART 多指向硬盘健康',
      notes: [
        'HDD 容量便宜但随机读写慢；SATA SSD HDD 快；NVMe M.2 SSD PCIe，速度更高；SAS 常见server',
        'passes POST 说明基础硬件自检过了，后续不能进 OS 常查 boot device、storage、boot order legacy/UEFI 模式',
      ],
    };
  }

  if (/\b(security|malware|bitlocker|tpm|secure boot|mdm|acl|authentication|encryption|wep|wpa|mac filtering|nac|endpoint|rfid)\b/.test(text)) {
    return {
      speedTip: '速通：security 题先判断是在做身份认证、加密、防恶意软件、网络访问控制，还是设备管理',
      notes: [
        'TPM（可信平台模块）保护密钥并支BitLocker/Secure Boot；encryption（加密）保护静态数据；MDM 管移动设备策略和应用',
        'ACL/firewall 控制访问，endpoint protection 防终端威胁，NAC 做网络准入；WEP 是老旧弱无线加密',
      ],
    };
  }

  return {
    speedTip: '速通：先锁定题干是在问 component（部件）、function（功能）、symptom（症状）还是 troubleshooting step（排障步骤）',
    notes: [
      'A+ 题通常给一个限制词，例least cost、minimum hardware、first/next step、only one user、after update；这些词决定排除顺序',
      '选项不要只看熟不熟，先问它的职责是否和题干场景同层：工具解决工具动作，部件解决部件症状，服务/配置解决配置问题',
    ],
  };
}

function buildStudyNotes(question) {
  if (getTargetedCore1Scenario(question) === 'layer3-switch-intervlan') {
    return [
      'VLAN（虚拟局域网）把二层广播域分开；不同 VLAN 之间要通信，必须经 Layer 3 routing（第三层路由）',
      'Layer 3 switch（三层交换机）适合 campus/LAN 内多 VLAN 高速互通：一台设备完成 switching + routing，常考词 wire speed（线速）minimum hardware（最少硬件）',
      'Router（路由器）能做 inter-VLAN routing，但题干强调线速和少硬件时，优先 Layer 3 switch；WAF/DDoS appliance 是安全防护，不是 VLAN 互通设备',
    ];
  }

  const targetedNotes = getTargetedCore1StudyNotes(question);
  if (targetedNotes.length) return targetedNotes;

  if (isEsdWristStrapQuestion(question)) {
    return [
      'ESD（静电放电）会损RAM、CPU、motherboard（主板）adapter card（适配卡）等敏感电子部件；题干出现 wrist strap 时，目标通常grounding（接地）',
      '防静电手环要连接ground/common point（接共同点），让人体和设备处于相同电位；它不battery/capacitor（电电容），不会 store、increase replicate 静电',
    ];
  }

  if (isStaticPrinterIpQuestion(question)) {
    return [
      'static IP（静态 IP）手动配置时，客户端至少要有 IP address、subnet mask（子网掩码）default gateway（默认网关）这组基本网络参数',
      'DHCP reservation（DHCP 保留）是服务器端固定租约，exclusion（排除范围）是避DHCP 发出某段地址；它们不是打印机端必须手动填写的字段',
    ];
  }

  if (isCrowdedWirelessPerformanceQuestion(question)) {
    return [
      'crowded Wi-Fi（拥挤无线环境）性能题优先看 channel（信道）、band（频段）、AP 标准和安全配置；WEP default channel 都是老旧/不佳信号',
      'MAC filtering（MAC 地址过滤）是 access control（访问控制），不减少干扰、不换信道、不提升吞吐；SSID hiding 也不是性能优化',
    ];
  }

  if (isUnlabeledNetworkConnectionQuestion(question)) {
    return [
      'unlabeled network connection（未标记网络连接）题眼是 identify/trace（识别/追踪）：不知道墙口或网线另一端接到哪里，优先 toner probe / cable toner（寻线器）',
      'cable tester（网线测试仪）题眼是 continuity/wiring/pinout/open/short（连通线序/断路/短路）：它判断线好不好，不负责在配线架里把线找出来',
      'network tap（网络分流器）题眼是 packet capture/monitoring（抓监控）；loopback plug（回环插头）题眼test port/NIC（测试端网卡）',
    ];
  }

  if (isPrinterQuestion(question)) {
    return [
      'printer（打印机）速通分类：进纸问题看 pickup rollers/tray/paper path；成像问题看 toner/drum/transfer/fuser；队列问题看 Print Spooler；功能漏洞看 driver/firmware',
      'scan/copy 有线print 正常：优先查 ADF/document feeder（自动送稿器）scanner glass（扫描玻璃），因为普通打印不经过扫描组件',
      'laser printer 常考：toner（碳粉）负责成像材料，drum（感光鼓）负责形成图像，transfer roller（转印辊）负责转到纸上，fuser（定影器）负责热压固定',
      '考试排除法：如果故障只出现在 copy/scan，就不要选只影响 print engine（打印引擎）drum、fuser、corona wire、toner',
    ];
  }

  return getGeneralCore1StudyProfile(question).notes;
}

function buildSpeedTip(question, answerTerms) {
  if (getTargetedCore1Scenario(question) === 'layer3-switch-intervlan') {
    return '速通：multiple VLANs + communicate to each other + wire speed/minimum hardware = Layer 3 switch；看WAF/DDoS 就当安全防护排除，看router 要问题干有没有强调线速和少设备';
  }

  const targetedSpeedTip = getTargetedCore1SpeedTip(question);
  if (targetedSpeedTip) return targetedSpeedTip;

  if (isEsdWristStrapQuestion(question)) {
    return '速通：wrist strap + RAM/inside PC = ground electrostatic charge；看increase/store/replicate electrostatic charge 直接排除';
  }

  if (isStaticPrinterIpQuestion(question)) {
    return '速通：manual static printer IP must set manually，IP address 不在选项里时subnet mask + default gateway';
  }

  if (isCrowdedWirelessPerformanceQuestion(question)) {
    return '速通：WEP + default channel + crowded networks 是老旧 AP/信道问题；MAC filtering 是安全控制，不提升性能';
  }

  if (isUnlabeledNetworkConnectionQuestion(question)) {
    return '速通：题干unlabeled/identify/trace（未标记/识别/追踪）就toner probe；题干说 test cable/continuity/wiring（测连通线序）才cable tester';
  }

  if (isScanPathPrinterQuestion(question)) {
    return '速通：print/fax 正常 + copy/scan 有竖= 扫描路径坏，先document feeder/ADF scanner glass';
  }

  if (isPrinterQuestion(question)) {
    const answerLabel = answerTerms.map((term) => term.label).join(' / ');
    return answerLabel
      ? `速通：看到 printer 症状，先把题目归类，再找最贴近症状的部件；本题重点落在 ${answerLabel}。`
      : '速通：printer 题不要背答案，先分类症状，再排除不在同一路径上的部件';
  }

  return getGeneralCore1StudyProfile(question).speedTip;
}

function explainDotMatrixMultipartOption(option, isCorrect) {
  const text = normalizeText(option.text);

  if (text.includes('replace the ribbon')) {
    return 'ribbon（色带）是本题答案。dot matrix printer（针式打印机）靠 printhead pins（打印头针脚）击ribbon，把油墨转印top page（顶页）。multipart forms（多联复写纸）的 bottom pages（底层页）可以靠 impact pressure/carbonless copy layer（击打压无碳复写层）留下字迹；这不是“后面还有色带墨”。现bottom pages print fine 说明针脚仍在击打，top page blank 更像 ribbon 没有把油墨转印到顶页，可能是色带耗尽、安接触不正确或没有正常走带';
  }

  if (text.includes('broken pins')) {
    return 'broken pins（打印头针脚损坏）在这里dot matrix printhead pins（针式打印机打印头针脚），不是接口针脚。针脚坏通常会造成 missing dots/columns（缺缺列）、字符残缺，且会影响击打出的图案；本bottom pages print fine，说明针脚仍能击打，所以不是最直接答案';
  }

  if (text.includes('clean the printhead')) {
    return 'Clean the printhead（清洁打印头）适合针脚/打印头被污物影响、字符缺点或打印不均的情况。本题关键不是打印头无法击打，而是 ribbon 没有把油墨转印到顶页；底层页靠压复写层显字，说明击打动作存在';
  }

  if (text.includes('maintenance kit')) {
    return 'maintenance kit（维护套件）通常解决 rollers（滚轮）、paper path（走纸路径）或周期性维护问题，比如卡纸、进纸异常。本题没jam/misfeed，而是多联纸顶页空白，所以不优先选维护套件';
  }

  return isCorrect
    ? explainUntypedCorrectOption(option, '定位 dot matrix printer（针式打印机）multipart forms（多联复写纸）的 top page blank（顶页空白）')
    : explainUntypedWrongOption(option, '定位 dot matrix printer（针式打印机）multipart forms（多联复写纸）的 top page blank（顶页空白）');
}

function explainStaticPrinterIpOption(option, isCorrect) {
  const text = normalizeText(option.text);

  if (text === 'subnet mask' || text.includes('subnet mask')) {
    return 'subnet mask（子网掩码）是本题答案。手动配 static IP address（静态 IP）时，打印机必须知道哪些地址属于 local subnet（本地子网），否则它无法正确判断目标是在本地网络内还是需要交给 gateway。DHCP 自动配置时会下发它；不用 DHCP 时就要手动填';
  }

  if (text === 'default gateway' || text.includes('default gateway')) {
    return 'default gateway（默认网关）是本题答案。打印机如果要和本地子网外的设备通信，例如跨网段管理、云打印、邮件扫描服务或不同 VLAN 的客户端，就需要 gateway。DHCP 自动配置时会下发它；static IP（静态 IP）场景要手动填';
  }

  if (text === 'dhcp') {
    return 'DHCP（动态主机配置协议）是自动分配地址和网络参数的服务。题干说 printers static IP addresses（静态 IP），并问 must set manually（必须手动设置），所以不是 DHCP';
  }

  if (text === 'dns') {
    return 'DNS（域名解析）可以手动配置，但这题 A+ 想考的static IP 的基本必填网络参数：IP address、subnet mask、default gateway。题目没有把 IP address 放进选项，所以subnet mask default gateway；打印机IP 被访问时不一定需DNS';
  }

  if (text.includes('reservation')) {
    return 'Reservations\uff08DHCP \u4fdd\u7559\uff09\u4f1a\u8ba9\u8bbe\u5907\u901a\u8fc7 DHCP \u6bcf\u6b21\u62ff\u5230\u540c\u4e00 IP\u3002\u5b83\u9002\u5408\u201c\u56fa\u5b9a\u5730\u5740\u4f46\u4ecd\u7528 DHCP\u201d\u7684\u505a\u6cd5\uff1b\u4f46\u9898\u5e72 static IP addresses must set manually\uff0c\u8868\u793a\u5728\u6253\u5370\u673a\u7aef\u624b\u52a8\u586b\u7f51\u7edc\u53c2\u6570\uff0c\u6240\u4ee5 reservation \u4e0d\u662f\u672c\u9898\u7b54\u6848\u3002';
  }

  if (text.includes('exclusion')) {
    return 'Exclusions（DHCP 排除范围）是 DHCP scope（地址池）里预留一段不自动分配的地址，避免和手动静态 IP 冲突。它有用，但它是 router/DHCP server 上配置，不是打印机必须手动设置的客户端参数';
  }

  return isCorrect
    ? explainUntypedCorrectOption(option, '\u624b\u52a8\u914d\u7f6e printer static IP\uff08\u6253\u5370\u673a\u9759\u6001 IP\uff09\u7684\u5ba2\u6237\u7aef\u7f51\u7edc\u53c2\u6570')
    : explainUntypedWrongOption(option, '\u624b\u52a8\u914d\u7f6e printer static IP\uff08\u6253\u5370\u673a\u9759\u6001 IP\uff09\u7684\u5ba2\u6237\u7aef\u7f51\u7edc\u53c2\u6570');
}

function explainUnlabeledNetworkConnectionOption(option, isCorrect) {
  const text = normalizeText(option.text);

  if (text.includes('network tap')) {
    return 'network tap（网络分流器）用于复制网络流量给分析/监控设备，常见于 packet capture（抓包）security monitoring（安全监控）。它看的traffic（流量），不是帮你确认“这个未标记墙口/网线另一端接到哪patch panel 端口”，所以不是本题答案';
  }

  if (text.includes('loopback plug')) {
    return 'loopback plug（回环插头）用于测试端口自身是否send/receive（发接收），例如验证 NIC（网卡）switch port（交换机端口）硬件是否工作。它不沿墙内线缆追踪另一端位置，也不能识别未标记连接';
  }

  if (text.includes('cable tester')) {
    return 'cable tester（网线测试仪）用于检查一根已知网线是否通、wire map/pinout（线序）是否正确、是否有 open/short（断短路）。它回答“线好不好”。本题问 identify an unlabeled network connection（识别未标记连接），也就是“这根墙内线/墙口到底通到哪里”，所以应选能 trace cable（寻线）的工具';
  }

  if (text.includes('toner probe')) {
    return 'toner probe / cable toner（寻线器/音频探针）是本题答案。做法是tone generator（音频发生器）接到未标记网线wall jack（墙口）一端，让线缆带声音信号，再probe（探针）patch panel（配线架）或另一端附近听信号，从而找到它对应的端线路。这里的 toner 不是 printer toner（打印机碳粉）';
  }

  return isCorrect
    ? explainUntypedCorrectOption(option, '\u8bc6\u522b unlabeled network connection\uff08\u672a\u6807\u8bb0\u7f51\u7edc\u8fde\u63a5\uff09')
    : explainUntypedWrongOption(option, '\u8bc6\u522b unlabeled network connection\uff08\u672a\u6807\u8bb0\u7f51\u7edc\u8fde\u63a5\uff09');
}

function explainPrinterOption(question, option, term, isCorrect, need) {
  const optionName = formatTerm(term) || `选项 ${option.key}`;
  const stem = normalizeText(question.stem);
  const role = term?.role ?? '它不是本题最直接的故障点';
  const clue = term?.examClue ? `常考信号：${term.examClue}。` : '';

  if (isDotMatrixMultipartRibbonQuestion(question)) {
    return explainDotMatrixMultipartOption(option, isCorrect);
  }

  if (isCorrect && term?.patterns.includes('document feeder') && isScanPathPrinterQuestion(question)) {
    return `${optionName} 是本题答案。copy/scan 会经document feeder / ADF（自动送稿器）scanner glass（扫描玻璃）；普print/fax 输出正常，说laser print engine（激光打印引擎）基本没问题。竖线只出现在扫复印路径时，常见原因ADF 走纸路径或窄扫描玻璃上有灰尘、纸屑、划痕。`;
  }

  if (isCorrect) {
    return `${optionName} 是本题答案。它的作用是?${role}。题眼：${need}?${clue}`;
  }

  if (term?.patterns.includes('pickup rollers')) {
    return `${optionName} 负责进纸。它常用paper jam（卡纸）、misfeed（进纸失败）或不进纸；本题是图像竖线，而且 print/fax 正常，所以不是最佳答案。`;
  }
  if (term?.patterns.includes('corona wire')) {
    return `${optionName} 属于 laser printer（激光打印机）成充电流程。若它有问题，通常会影响实际打印输出；本题普print/fax 正常，故障更scanner/ADF 路径。`;
  }
  if (term?.patterns.includes('drum assembly') || term?.patterns.includes('drum')) {
    return `${optionName} 会造成通过打印引擎输出repeating marks（重复痕迹）、线条、重影等。如drum 坏了，普print 通常也会异常；本print/fax 正常，所以排除。`;
  }
  if (term?.patterns.includes('fuser')) {
    return `${optionName} \u8d1f\u8d23\u7528 heat\uff08\u70ed\uff09\u548c pressure\uff08\u538b\u529b\uff09\u628a toner\uff08\u78b3\u7c89\uff09\u56fa\u5b9a\u5230\u7eb8\u4e0a\u3002\u5b83\u7684\u9898\u773c\u662f\u6253\u5370\u540e\u4e00\u64e6\u5c31\u6389\u7c89\u3001toner not fused \u6216 smudge\uff08\u6d82\u62b9\uff09\uff1b\u5982\u679c\u9898\u5e72\u662f\u53ea\u5728 scan/copy \u51fa\u73b0\u7ad6\u7ebf\u800c print \u6b63\u5e38\uff0c\u5c31\u4e0d\u662f fuser\u3002`;
  }
  if (term?.patterns.includes('toner')) {
    return `${optionName} \u4e3b\u8981\u5bf9\u5e94 faded print\uff08\u6253\u5370\u53d8\u6de1\uff09\u3001low toner\uff08\u4f4e\u78b3\u7c89\uff09\u6216\u7f3a\u7c89\u3002\u5b83\u5f71\u54cd\u6253\u5370\u6210\u50cf\u6750\u6599\uff1b\u5982\u679c\u9898\u5e72\u8bf4\u53ea\u6709 scan/copy \u6709\u7ebf\u6761\u4f46\u666e\u901a print \u6b63\u5e38\uff0c\u8bf4\u660e\u626b\u63cf\u8def\u5f84\u66f4\u53ef\u7591\uff0c\u4e0d\u662f toner\u3002`;
  }

  return `${optionName} 的作用是?${role}?${clue}排除点：题眼?${need}，而这个选项的典型用途不在该故障路径上。`;
}

function formatRawOption(option) {
  return `选项 ${option.key}?${option.text}）`;
}

function describeUntypedOptionRole(option) {
  const text = normalizeText(option.text);

  if (!text) {
    return '这个选项缺少可读文本；做题时只能回到题干线索和答案类别来判断';
  }
  if (text.includes('platform as a service') || text === 'paas') {
    return 'PaaS（平台即服务）用于部运行自有应用代码，云商管OS/runtime，常考线索是 developer platform（开发平台）managed database（托管数据库）';
  }
  if (text.includes('software as a service') || text === 'saas') {
    return 'SaaS（软件即服务）是直接使用云端应用，常见线索是 email、CRM、videoconferencing subscription application（订阅应用）';
  }
  if (text.includes('infrastructure as a service') || text === 'iaas') {
    return 'IaaS（基础设施即服务）提供 VM、storage、networking 等基础资源，客户仍管理 OS 和应用，常考线索是 virtual machines（虚拟机）';
  }
  if (text.includes('security as a service')) {
    return 'Security as a service（安全即服务）偏安全防护/监控外包，常考线索是 threat detection（威胁检测）、filtering（过滤）managed security（托管安全）';
  }
  if (text.includes('anything as a service') || text.includes('everything as a service')) {
    return 'XaaS（Anything/Everything as a Service）是泛称，不SaaS/PaaS/IaaS 精确；考试通常要选更具体的服务模型';
  }
  if (text.includes('image deployment') || text.includes('clean install') || text.includes('in-place upgrade')) {
    return 'OS deployment（系统部署）选项要看目标是批量安装、保留数据升级，还是全新重装；关键词通常without losing data（不丢数据）many workstations（大量电脑）';
  }
  if (text.includes('group policy') || text.includes('gpupdate') || text.includes('gpedit')) {
    return 'Group Policy（组策略）用于集中或本地下发 Windows 策略；成立线索通常domain policy（域策略）、policy refresh（策略刷新）或管理限制';
  }
  if (text.includes('event viewer') || text.includes('reliability history') || text.includes('resource monitor') || text.includes('task manager')) {
    return 'Windows diagnostic tool（诊断工具）选项要看题干要日志、稳定性历史、实时资源占用还是进程管理；工具名称决定它能回答的问题';
  }
  if (text.includes('remote wipe') || text.includes('geofencing') || text.includes('management profile') || text.includes('mdm')) {
    return 'MDM/mobile management（移动设备管理）选项常用于设备丢失、合规策略、管理配置或远程控制；先看题干要保护数据还是下发访问配置';
  }
  if (text.includes('facial recognition') || text.includes('biometric') || text.includes('mfa') || text.includes('multifactor')) {
    return 'Authentication（身份认证）选项用于确认用户身份；biometrics 是生物识别，MFA 是多因素，成立线索通常是登录安全或防止共享密码';
  }
  if (text.includes('backup') || text.includes('restore') || text.includes('recovery')) {
    return 'Backup/recovery（备恢复）选项用于回滚或找回数据；如果题干还要求继续运行、迁移或隔离旧系统，单纯备份通常不够';
  }
  if (text.includes('install') || text.includes('replace') || text.includes('reinstall') || text.includes('repair')) {
    return 'Install/replace/repair（安更换/修复）是操作型选项；只有当题干已经定位到对应组件或软件损坏时才优先执行';
  }
  if (text.includes('security') || text.includes('malware') || text.includes('ransomware') || text.includes('zero-day') || text.includes('phishing') || text.includes('smishing')) {
    return 'Security（安全）选项要看题干是否出现攻击、恶意软件、凭证诱骗或防护目标；不要把普通配硬件故障误判成安全事件';
  }
  if (text.includes('network') || text.includes('ip address') || text.includes('wan') || text.includes('port') || text.includes('router') || text.includes('ssid')) {
    return 'Network（网络）选项要看是在解决地址、路由、无线覆盖、端口映射还是访问策略；不同层级不能混选';
  }
  if (text.includes('power') || text.includes('surge protector') || text.includes('voltage') || text.includes('wattage')) {
    return 'Power（电源）选项通常处理供电、浪涌、电瓦数或能效问题；成立线索是不开机、断电、烧焦味、地区电压或负载不足';
  }
  if (text.includes('local os') || text.includes('thin client') || text.includes('gui') || text.includes('desktop')) {
    return 'Desktop/VDI（桌虚拟桌面）选项要看桌面运行在本地还是服务器端；VDI 题眼通常streamed GUI（图形界面流）和 centralized management（集中管理）';
  }
  if (text === 'man') {
    return 'man（manual，手册页）用于阅Linux command documentation（命令文档），常见用法是 man <command>';
  }
  if (text === 'chmod') {
    return 'chmod（change mode）用于修Linux file permissions（文件权限），不是查看命令帮助';
  }
  if (text === 'cat') {
    return 'cat（concatenate）用于输出文件内容，不负责打开命令手册页';
  }
  if (text === 'sudo') {
    return 'sudo 用于elevated privileges（提升权限）执行命令，不是阅读文档';
  }
  if (/^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(text)) {
    return 'IP address（IP 地址）选项要先判断 public/private、子网范围和题干要求的接口位置；不是看到地址就选';
  }

  return `${option.text} 要先按考试动作分类：它是在setting（设置）、用 tool（工具）、执command（命令）、套 policy（策略）、换 hardware（硬件）还是启用 service（服务）；只有题干要求同一类动作时才选。`;
}

function explainUntypedCorrectOption(option, need) {
  return `${formatRawOption(option)} 是本题答案?${describeUntypedOptionRole(option)}本题题眼?${need}；它和题干要求的对象、症状或动作处在同一技术层。`;
}

function explainUntypedWrongOption(option, need) {
  return `${formatRawOption(option)} 不选?${describeUntypedOptionRole(option)}本题题眼?${need}；题干没有给出这个选项所需的触发条件。`;
}

function explainCrowdedWirelessPerformanceOption(option, isCorrect) {
  const text = normalizeText(option.text);

  if (text.includes('replacing the access point')) {
    return 'Replacing the access point（更换无线接入点）是本题答案，但要注意：这题选项不完美。真正直觉上更直接的动作会是 change the wireless channel（更换无线信道）、use 5GHz/6GHz（使5/6GHz）或升级WPA2/WPA3。四个选项里只有更换老旧 AP 最可能同时带来 modern Wi-Fi standards（新无线标准）、WPA2/WPA3、auto channel selection（自动信道选择）和 5GHz 支持，所以应试时选它';
  }

  if (text.includes('disabling ssid')) {
    return 'Disabling SSID broadcasting（关SSID 广播）主要是 security through obscurity（隐藏式安全），不是性能优化。客户端仍然会探测网络，空气中也不会少掉干扰；它不解default channel（默认信道）crowded networks（拥挤无线环境）';
  }

  if (text.includes('mac address filtering') || text.includes('mac filtering')) {
    return 'MAC address filtering（MAC 地址过滤）是 access control（访问控制）：只允许列表里的设备连接。它不改channel（信道）、noise/interference（噪干扰）、无线标准或吞吐量，而且 MAC 也可spoof（伪造），所以不能用来提wireless performance（无线性能）';
  }

  if (text.includes('firmware')) {
    return 'Updating the firmware（更新固件）可能bug 或安全漏洞，但题干没有说 AP 有已firmware bug。本题明确给WEP、default channel crowded urban area，核心是老旧/配置不佳的无线环境；firmware 不是最直接的性能改善';
  }

  return isCorrect
    ? explainUntypedCorrectOption(option, '\u6539\u5584 crowded Wi-Fi\uff08\u62e5\u6324\u65e0\u7ebf\u73af\u5883\uff09performance\uff08\u6027\u80fd\uff09')
    : explainUntypedWrongOption(option, '\u6539\u5584 crowded Wi-Fi\uff08\u62e5\u6324\u65e0\u7ebf\u73af\u5883\uff09performance\uff08\u6027\u80fd\uff09');
}

function explainEsdWristStrapOption(option, isCorrect) {
  const text = normalizeText(option.text);

  if (text.includes('ground electrostatic charge')) {
    return 'To ground electrostatic charge（接地静电荷）是本题答案。wrist strap（防静电手环）把 technician（技术员）身体上static buildup（静电积累）导向 ground/common point（接共同点），让人体与设备电位接近，避免 ESD（静电放电）损坏 RAM';
  }

  if (text.includes('replicate electrostatic charge')) {
    return 'Replicate electrostatic charge（复制静电荷）不是防静电手环的作用。考试wrist strap 的关键词grounding/dissipating（接泄放），不是复制电荷；复制或制造电荷反而会增加 ESD 风险，和保护 RAM 的目标相反';
  }

  if (text.includes('increase electrostatic charge')) {
    return 'Increase electrostatic charge（增加静电荷）正好相反。更RAM 时要降低人体静电差，防止 ESD（静电放电）击穿芯片；如果让静电更多，风险会上升，所以看increase 基本可以秒排';
  }

  if (text.includes('store electrostatic charge')) {
    return 'Store electrostatic charge\uff08\u50a8\u5b58\u9759\u7535\u8377\uff09\u4e5f\u4e0d\u662f wrist strap \u7684\u804c\u8d23\u3002\u624b\u73af\u4e0d\u662f capacitor/battery\uff08\u7535\u5bb9/\u7535\u6c60\uff09\uff0c\u5b83\u63d0\u4f9b\u4f4e\u98ce\u9669\u6cc4\u653e\u8def\u5f84\uff0c\u628a\u9759\u7535\u5bfc\u8d70\u5e76\u4fdd\u6301\u540c\u7535\u4f4d\uff1b\u9898\u5e72\u95ee purpose\uff08\u76ee\u7684\uff09\u65f6\u5e94\u9009\u62e9 ground electrostatic charge\u3002';
  }

  return isCorrect
    ? explainUntypedCorrectOption(option, 'wrist strap（防静电手环）ground electrostatic charge（接地静电荷），避免 ESD 损坏 RAM')
    : explainUntypedWrongOption(option, 'wrist strap（防静电手环）ground electrostatic charge（接地静电荷），避免 ESD 损坏 RAM');
}

function explainCorrectOption(question, option, term, need) {
  if (isUnlabeledNetworkConnectionQuestion(question)) {
    return explainUnlabeledNetworkConnectionOption(option, true);
  }

  if (isEsdWristStrapQuestion(question)) {
    return explainEsdWristStrapOption(option, true);
  }

  if (hasTargetedCore1OptionExplanation(getTargetedCore1Scenario(question))) {
    return explainTargetedCore1Option(question, option, true);
  }

  if (isStaticPrinterIpQuestion(question)) {
    return explainStaticPrinterIpOption(option, true);
  }

  if (isCrowdedWirelessPerformanceQuestion(question)) {
    return explainCrowdedWirelessPerformanceOption(option, true);
  }

  if (isPrinterQuestion(question)) {
    return explainPrinterOption(question, option, term, true, need);
  }

  if (!term) return explainUntypedCorrectOption(option, need);

  const answerName = formatTerm(term);
  return `${answerName} 是本题答案。它的作用是?${term.role}。题眼：${need}?${term.examClue ? `常考信号：${term.examClue}。` : ''}`;
}

function explainWrongOption(question, option, term, need) {
  if (isUnlabeledNetworkConnectionQuestion(question)) {
    return explainUnlabeledNetworkConnectionOption(option, false);
  }

  if (isEsdWristStrapQuestion(question)) {
    return explainEsdWristStrapOption(option, false);
  }

  if (hasTargetedCore1OptionExplanation(getTargetedCore1Scenario(question))) {
    return explainTargetedCore1Option(question, option, false);
  }

  if (isStaticPrinterIpQuestion(question)) {
    return explainStaticPrinterIpOption(option, false);
  }

  if (isCrowdedWirelessPerformanceQuestion(question)) {
    return explainCrowdedWirelessPerformanceOption(option, false);
  }

  if (isPrinterQuestion(question)) {
    return explainPrinterOption(question, option, term, false, need);
  }

  if (term) {
    return `${formatTerm(term)} \u4e0d\u662f\u6700\u4f73\u7b54\u6848\u3002\u5b83\u7684\u4f5c\u7528\u662f\uff1a${term.role}\u3002\u5e38\u8003\u4fe1\u53f7\uff1a${term.examClue ?? '\u770b\u9898\u5e72\u662f\u5426\u76f4\u63a5\u8981\u6c42\u5b83\u7684\u529f\u80fd'}\u3002\u6392\u9664\u70b9\uff1a\u9898\u773c\u662f${need}\uff0c\u8fd9\u4e2a\u9009\u9879\u6ca1\u6709\u843d\u5728\u8be5\u573a\u666f\u7684\u4e3b\u8981\u6545\u969c\u70b9\u6216\u914d\u7f6e\u70b9\u4e0a\u3002`;
  }

  return explainUntypedWrongOption(option, need);
}

function buildKeyPoint(question, answerTerms, need) {
  if (getTargetedCore1Scenario(question)) {
    return `关键点：${getTargetedCore1Need(question)}。`;
  }

  if (isUnlabeledNetworkConnectionQuestion(question)) {
    return '关键点：unlabeled network connection 是“这个未标记墙口/网线另一端到底接到哪里”的问题。toner probe / cable toner 用来 trace cable（寻线）；cable tester 测线好坏，network tap 抓流量，loopback plug 测端口。这里的 toner 不是打印机碳粉';
  }

  if (isStaticPrinterIpQuestion(question)) {
    return '关键点：static IP（静态 IP）是在打印机端手动填客户端网络参数；DHCP 不会自动下发。IP address 没出现在选项里，所以本题看 subnet mask / default gateway。Reservations/Exclusions 是 DHCP/router 端配置，不是打印机端必须手动设置的字段';
  }

  if (isEsdWristStrapQuestion(question)) {
    return '关键点：wrist strap（防静电手环）用ground electrostatic charge（接地静电荷），保护 RAM ESD-sensitive components（静电敏感部件）。它不是增加、储存或复制静电';
  }

  if (isDotMatrixMultipartRibbonQuestion(question)) {
    return '关键点：dot matrix printer multipart forms 底层页能显字，说明 printhead pins 仍在击打；底层页靠压复写层显字，不是色带给后面上墨。只 top page 空白时，优先怀疑 ribbon（色带）没有把油墨转印到顶页，而不是 broken pins';
  }

  if (isScanPathPrinterQuestion(question)) {
    return '关键点：copy/scan 有竖线，但普通 print/fax 正常，说明打印引擎没坏；优先 document feeder / ADF（自动送稿器）scanner glass（扫描玻璃）';
  }

  if (isCrowdedWirelessPerformanceQuestion(question)) {
    return '关键点：题干同时给出 WEP、default channel、crowded networks。理想答案通常会是 change channel 或升级无线标准/安全；但本题选项 C MAC address filtering 是安全访问控制，不改 performance，所以只能在给定选项中选 replacing the access point';
  }

  const answerLabels = answerTerms.map(formatTerm).filter(Boolean);
  if (answerLabels.length) {
    return `关键点：本题应归类到 ${answerLabels.join(' / ')}。记住它的常考用途，再用题干里的症状、限制词或目标动作排除不在同一场景的选项。`;
  }

  return `关键点：${need}。`;
}

function buildDeepKeywords(question, terms) {
  return unique([
    ...collectKeywords(question, terms),
    ...terms.flatMap((term) => [term.label, term.zh, ...term.patterns]),
    'printer',
    'print',
    'copy',
    'scan',
    'fax',
    'laser print engine',
    'document feeder',
    'ADF',
    'scanner glass',
    'toner',
    'drum',
    'fuser',
    'Print Spooler',
  ]);
}

export function buildLearningAnnotation(question) {
  const answerSet = new Set(question.answer ?? []);
  const optionTerms = question.options
    .filter((option) => answerSet.has(option.key))
    .map((option) => lookupQuestionOptionTerm(question, option))
    .filter(Boolean);
  const need = inferNeed(question);
  const keywords = buildDeepKeywords(question, optionTerms);
  const keyPoint = buildKeyPoint(question, optionTerms, need);
  const speedTip = buildSpeedTip(question, optionTerms);
  const studyNotes = buildStudyNotes(question);

  return {
    keyPointHtml: emphasizeKeywords(keyPoint, keywords),
    speedTipHtml: speedTip ? emphasizeKeywords(speedTip, keywords) : '',
    studyNotesHtml: studyNotes.map((note) => emphasizeKeywords(note, keywords)),
    stemHtml: emphasizeKeywords(question.stem, keywords),
    keywords,
    options: question.options.map((option) => {
      const isCorrect = answerSet.has(option.key);
      const term = lookupQuestionOptionTerm(question, option);
      const explanation = isCorrect
        ? explainCorrectOption(question, option, term, need)
        : explainWrongOption(question, option, term, need);

      return {
        key: option.key,
        isCorrect,
        explanation,
        explanationHtml: emphasizeKeywords(explanation, [
          ...(term ? [term.label, term.zh, ...term.patterns] : []),
          ...keywords,
        ]),
      };
    }),
  };
}

function getStudyTags(question, bankId) {
  if (bankId === 'core2') return getCore2StudyTags(question);
  return getCore1StudyTags(question);
}

export function applyLearningAnnotations(questions = [], { bankId = 'en' } = {}) {
  return questions.map((question) => ({
    ...question,
    learning: {
      ...(question.learning ?? buildLearningAnnotation(question)),
      studyTags: question.learning?.studyTags ?? getStudyTags(question, bankId),
    },
  }));
}
