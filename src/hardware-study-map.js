export const HARDWARE_OVERVIEW = {
  title: 'Hardware 知识与流程地图',
  summary: 'Hardware 先定位层：power、POST/firmware、boot、memory/storage、display/mobile、ESD。',
  examRules: [
    '完全不开机 / random shutdown：先看 PSU、power、charging、thermal。',
    'passes POST 但进不了 OS：看 boot device、boot order、storage cable、MBR/GPT/UEFI。',
    'server/file server/data center memory：优先 ECC / RDIMM，不要选 RGB 或普通 laptop SODIMM。',
    'BitLocker / Windows 11 / Secure Boot：常和 TPM、UEFI、Secure Boot 绑定。',
    '显示正常但触控不灵：digitizer；图像本身异常才更像 screen/display。',
  ],
};

export const BOOT_FLOW = [
  {
    stage: 'Power',
    detail: 'PSU / battery / UPS 提供稳定电力。',
    clues: ['does not turn on', 'random shutdown', 'utility failure', 'UPS', 'PSU'],
    examMove: '不开机先想 PSU；断电保护想 UPS。',
  },
  {
    stage: 'BIOS / UEFI',
    detail: 'BIOS / UEFI 初始化硬件，读取固件设置。',
    clues: ['BIOS', 'UEFI', 'CMOS battery', 'firmware settings'],
    examMove: '时间/BIOS 设置丢失看 CMOS battery；固件设置被改看 BIOS password。',
  },
  {
    stage: 'POST',
    detail: 'POST 是开机自检；passes POST 后再查 boot device / boot order。',
    clues: ['POST', 'passes POST'],
    examMove: 'passes POST 表示基础硬件大体过关，后面转向 boot device / boot order。',
  },
  {
    stage: 'Boot order / options',
    detail: 'firmware 根据 boot order 选择 USB、SSD、HDD、PXE 等启动设备。',
    clues: ['boot order', 'boot options', 'USB drive', 'PXE'],
    examMove: '重装后反复进 USB installer → 移除 USB 或改 boot order。',
  },
  {
    stage: 'Master boot record / GPT',
    detail: '系统从 Master boot record / GPT 等启动信息找 OS。',
    clues: ['No operating system found', 'Master boot record', 'GPT', '4TB SSD'],
    examMove: '4TB + 多主分区选 GPT；No OS found 可查 Master boot record。',
  },
  {
    stage: 'TPM / Secure Boot',
    detail: 'TPM / Secure Boot / BitLocker 参与启动信任链与密钥保护。',
    clues: ['TPM', 'Secure Boot', 'BitLocker', 'Windows 11 upgrade'],
    examMove: '防启动恶意软件选 Secure Boot；硬盘加密密钥/Windows 11 要求常看 TPM。',
  },
  {
    stage: 'Drivers / services',
    detail: 'OS 加载 drivers / services；硬件正常后才看这一层。',
    clues: ['safe mode', 'drivers', 'services'],
    examMove: '硬件检查正常后，再看 boot order、drivers、services。',
  },
];

export const HARDWARE_PROCESS_FLOWS = [
  {
    id: 'raid-recovery',
    title: 'RAID degraded / rebuild 流程',
    summary: 'amber/orange light、degraded RAID array 时，不要改 RAID level。',
    steps: [
      {
        stage: 'Alert',
        action: 'slow access、amber/orange light、degraded RAID array。',
        clues: ['amber light', 'degraded RAID array'],
      },
      {
        stage: 'Isolate',
        action: 'RAID 1 apparently degraded → perform individual drive diagnostics。',
        clues: ['Perform individual drive diagnostics'],
      },
      {
        stage: 'Replace',
        action: 'failed/degraded drive → replace failed drive with a new one。',
        clues: ['Replace the failed drive'],
      },
      {
        stage: 'Rebuild / verify',
        action: 'allow RAID controller to rebuild；再查 RAID array status。',
        clues: ['Rebuild the array', 'RAID array status'],
      },
    ],
  },
  {
    id: 'charging-power',
    title: 'Charging / battery 排查流程',
    summary: '慢充、间歇充电、膨胀电池要先分 port、charger、battery。',
    steps: [
      {
        stage: 'Dropped device',
        action: '摔过又不充电 → inspect USB-C port for damage。',
        clues: ['Inspect the USB-C port for damage'],
      },
      {
        stage: 'New cable fails',
        action: '换线仍间歇充电且 battery not swollen → clean USB-C port。',
        clues: ['Clean the USB-C port'],
      },
      {
        stage: 'Slow charging',
        action: '借来的 charger 慢充 → use a different power supply。',
        clues: ['Use a different power supply'],
      },
      {
        stage: 'Swollen / undock',
        action: 'swollen phone 或 undock shutdown → replace the battery。',
        clues: ['Replace the battery'],
      },
    ],
  },
  {
    id: 'display-projector',
    title: 'Display / projector 排查流程',
    summary: '外接显示先看 input/cable，再看 projector setting 或 compatibility。',
    steps: [
      {
        stage: 'No signal',
        action: 'HDMI 接好但 no signal → check projector input sources。',
        clues: ['Check the projector input sources'],
      },
      {
        stage: 'Cable follows',
        action: '同一 cable 接 monitor 仍异常 → replace DisplayPort cable。',
        clues: ['Replace the DisplayPort cable'],
      },
      {
        stage: 'USB-C projector',
        action: 'dock 正常但 projector 失败 → Thunderbolt compatibility。',
        clues: ['Thunderbolt'],
      },
      {
        stage: 'Image shape',
        action: '上宽下窄调 keystone；倒置用 flip image vertically。',
        clues: ['Adjust the keystone', 'Flip the image vertically'],
      },
    ],
  },
  {
    id: 'ram-service',
    title: 'RAM / service 操作流程',
    summary: '硬件动手题先保护 ESD，再按症状 reseat、replace 或配置。',
    steps: [
      {
        stage: 'Protect',
        action: '换 RAM / motherboard 前，用 wrist strap ground ESD。',
        clues: ['wrist strap', 'ground electrostatic charge'],
      },
      {
        stage: 'Transport',
        action: 'retired RAM transport → antistatic bags。',
        clues: ['antistatic bags'],
      },
      {
        stage: 'Fails POST',
        action: '新 motherboard 后 fails POST，PSU/CPU 正常 → reseat RAM。',
        clues: ['Reseat the RAM'],
      },
      {
        stage: 'Select',
        action: 'server/data center memory → ECC / RDIMM。',
        clues: ['ECC', 'RDIMM'],
      },
    ],
  },
];

export const HARDWARE_SECTIONS = [
  {
    id: 'power-thermal',
    name: 'Power / Thermal（电源与散热）',
    priority: '高频',
    summary: '供电不稳和过热会导致不开机、随机关机、风扇噪音或高温。',
    points: [
      { label: 'PSU', text: 'Power Supply Unit（电源）：不开机、功率不足或硬件升级供电题优先看它。' },
      { label: 'Modular PSU', text: 'modular power supply（模组化电源）可减少机箱内可见线缆，改善理线。' },
      { label: 'UPS', text: 'Uninterruptible Power Supply（不间断电源）用于 utility failure（市电中断）时短时供电和安全关机。' },
      { label: 'Thermal', text: 'CPU 高温、风扇吵：看 heat sink、thermal paste、fan。' },
      { label: 'CMOS battery', text: '时间或 BIOS/UEFI 设置反复丢失，常见原因是 CMOS battery。' },
    ],
    symptoms: [
      'does not turn on → PSU / power。',
      'CPU 98C under load → heat sink / thermal paste / fan。',
      'rack-mounted UPS battery modules → lifting techniques / safety。',
    ],
  },
  {
    id: 'memory',
    name: 'Memory（内存）',
    priority: '最高频',
    summary: '内存题通常考外形、稳定性、带宽和兼容性。',
    points: [
      { label: 'DIMM', text: 'desktop/server 常用 DIMM；portable devices/laptops 常用 SODIMM。' },
      { label: 'SODIMM', text: '小型笔记本内存外形，题眼是 portable devices / laptop。' },
      { label: 'ECC RAM', text: 'server / file server memory 常选 ECC。' },
      { label: 'RDIMM', text: 'data centers / high-performance machines 常选 RDIMM。' },
      { label: 'Channel configuration', text: 'dual-channel / multi-channel 提升 module bandwidth；ECC 是纠错，不是带宽。' },
    ],
    symptoms: [
      'server memory modules → ECC。',
      'data center machines → RDIMM。',
      'maximize memory bandwidth → channel configuration。',
      'replacing/removing RAM → antistatic bags / wrist strap。',
    ],
  },
  {
    id: 'storage',
    name: 'Storage / RAID（存储）',
    priority: '最高频',
    summary: '存储题先看目标：速度、容量、接口、启动、冗余。',
    points: [
      { label: '7200RPM HDD / NVMe M.2 SSD', text: 'SATA SSD 比 7200RPM HDD 快；NVMe M.2 SSD 更适合 high-performance laptop。' },
      { label: 'NVMe / M.2', text: 'NVMe port/slot 对应高速 SSD；不是 SATA/SAS/optical drive。' },
      { label: 'SATA cable', text: '升级 RAM 后 No boot device found，可能碰松 SATA HDD power/data cable。' },
      { label: 'GPT', text: '4TB SSD + five primary partitions，选 GPT + NTFS。' },
      { label: 'RAID', text: 'RAID 0 提速无冗余；RAID 1 mirror；RAID 5 single parity；RAID 6 dual parity 可坏两块。' },
    ],
    symptoms: [
      'fast data access in gaming laptop → NVMe M.2 SSD。',
      'tolerate two drive failures → RAID 6。',
      'No operating system found but SSD recognized → repair the MBR。',
    ],
  },
  {
    id: 'motherboard-firmware',
    name: 'Motherboard / Firmware（主板与固件）',
    priority: '高频',
    summary: '主板/固件题常和 BIOS、UEFI、Secure Boot、TPM、firmware update、boot mode 绑定。',
    points: [
      { label: 'BIOS / UEFI / Boot order', text: '控制 boot order、virtualization、Secure Boot、BIOS options。' },
      { label: 'TPM', text: 'Trusted Platform Module（可信平台模块）保护密钥，常和 BitLocker / Windows 11 requirement 相关。' },
      { label: 'Secure Boot', text: '验证启动组件签名，防止 malicious software 在启动阶段加载。' },
      { label: 'BIOS password', text: '限制普通用户修改 virtualization technology 或固件设置。' },
      { label: 'Firmware update', text: 'firmware update 可能修 bug；失败可能导致 boot loop 或无法进 UEFI。' },
    ],
    symptoms: [
      'Windows 11 upgrade blocked → TPM / Secure Boot。',
      'No boot disk found after legacy/UEFI mismatch → check boot mode。',
      'dual-BIOS firmware update stuck in boot loop → firmware recovery/downgrade path。',
    ],
  },
  {
    id: 'display-mobile',
    name: 'Display / Mobile（显示与移动设备）',
    priority: '中频',
    summary: '显示题先分清显示输出、屏幕面板、触控层、投影设置和移动连接。',
    points: [
      { label: 'DisplayPort / HDMI', text: '视频接口题看 HDCP、DisplayPort、HDMI、线缆。' },
      { label: 'Integrated video', text: 'integrated video 共享系统内存；VRAM requirement 可进 BIOS options 调整。' },
      { label: 'Digitizer', text: 'screen 正常但 touch input 不响应，优先 digitizer。' },
      { label: 'Projector', text: 'ceiling-mounted projector 画面倒置，选 flip image vertically。' },
      { label: 'Bluetooth / NFC / Hotspot / Cellular', text: 'Bluetooth、NFC、hotspot、cellular、roaming 按距离/用途区分。' },
    ],
    symptoms: [
      'touch input unsuccessful but display normal → digitizer。',
      'VRAM requirement with integrated video → BIOS options。',
      'projector image upside down → flip image vertically。',
    ],
  },
  {
    id: 'cards-peripherals',
    name: 'Expansion / Peripheral（扩展与外设）',
    priority: '中频',
    summary: '扩展/外设题看功能：network、graphics、docking、USB-C/Thunderbolt。',
    points: [
      { label: 'NIC', text: 'desktop expansion card for internet/network access = NIC。' },
      { label: 'GPU', text: 'modern games / graphics workload 卡顿，轻量任务正常，优先 dedicated graphics。' },
      { label: 'Docking station', text: 'laptop 外接多显示器/网口/外设时常见 docking station / port replicator。' },
      { label: 'USB-C / Thunderbolt', text: 'USB-C 接 projector 失败但 docking station 正常时，看 Thunderbolt compatibility。' },
    ],
    symptoms: [
      'needs network access expansion card → NIC。',
      'modern gaming poor, casual games OK → dedicated GPU。',
      'external display or peripherals through laptop desk setup → docking station。',
    ],
  },
  {
    id: 'esd-safety',
    name: 'ESD / Safety（静电与安全）',
    priority: '高频',
    summary: '硬件操作题常考 ESD 保护、重物搬运和先断电。',
    points: [
      { label: 'Wrist strap', text: 'wrist strap 用于 ground electrostatic charge，保护 RAM、CPU、motherboard。' },
      { label: 'Antistatic bag', text: '运输/存放 RAM 时用 antistatic bags。' },
      { label: 'ESD mat', text: '题库里 ESD mat 可作为安全干扰项；3D carbon fiber filament 题选 Air filter mask。' },
      { label: 'Lifting', text: 'UPS battery modules 等重物先考虑 proper lifting techniques。' },
      { label: 'Air filter mask', text: '3-D printing carbon fiber-based filament 题选 Air filter mask。' },
    ],
    symptoms: [
      'wrist strap while replacing RAM → ground electrostatic charge。',
      'retired RAM transport → antistatic bags。',
      'rack UPS bottom battery module → lifting techniques。',
    ],
  },
];

export const HARDWARE_SYMPTOM_MAP = [
  { symptom: 'Does not turn on', answer: 'PSU / power path', group: 'Power' },
  { symptom: 'Passes POST but cannot boot OS', answer: 'Boot device / boot order / storage', group: 'Boot' },
  { symptom: 'Windows 11 upgrade blocked by missing module', answer: 'TPM module', group: 'Firmware security' },
  { symptom: 'Server/file server memory', answer: 'ECC RAM', group: 'Memory' },
  { symptom: 'Fast gaming laptop storage', answer: 'NVMe M.2 SSD', group: 'Storage' },
  { symptom: 'Can lose two drives without data loss', answer: 'RAID 6', group: 'Storage' },
  { symptom: 'Touch input fails but screen displays', answer: 'Digitizer', group: 'Display/mobile' },
  { symptom: 'Replacing RAM with wrist strap', answer: 'Ground electrostatic charge', group: 'ESD' },
];
