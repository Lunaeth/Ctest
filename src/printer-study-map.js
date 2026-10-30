export const PRINTER_OVERVIEW = {
  title: 'Printer 类型与打印流程',
  summary: 'Printer 题先判断类型，再按题眼定位：进纸、成像、固定、扫描路径、queue/driver/firmware。',
  examRules: [
    'copy/scan 异常、print/fax 正常 → ADF / document feeder；别选 fuser/toner/drum。',
    '打印后一擦就掉粉、smudge：锁定 laser printer 的 fuser。',
    'paper jam / misfeed / not feeding：先看 pickup rollers、paper tray、paper path。',
    'queue 卡住、spooler stop/fails：先处理 Print Spooler / driver。',
    'dot matrix multipart：top page blank、bottom pages fine → ribbon；不是 broken pins。',
  ],
};

export const PRINT_PIPELINE = [
  {
    label: 'Custom application',
    detail: '用户或应用发起 print job（打印任务）。',
    clue: '某个 custom application 一打印就卡，其他文件正常。',
  },
  {
    label: 'Printer driver',
    detail: 'driver（驱动）把任务转换成打印机能理解的格式。',
    clue: '新电脑/print server/型号不匹配时，先看 driver。',
  },
  {
    label: 'Print Spooler',
    detail: 'spooler（后台打印服务）排队并把任务送给打印机。',
    clue: 'queue 卡住、spooler stops、service fails to start。',
  },
  {
    label: 'Printer firmware',
    detail: 'firmware（固件）控制设备内部逻辑和功能修复。',
    clue: '厂商发布漏洞/功能修复或设备固件 bug。',
  },
  {
    label: 'Printer components',
    detail: '按 laser、inkjet、thermal、impact 或 3D 类型定位部件。',
    clue: 'toner、fuser、ribbon、printhead、heating element、rollers。',
  },
];

export const PRINTER_TYPES = [
  {
    id: 'laser',
    name: 'Laser Printer（激光打印机）',
    summary: '题库重点是 toner、corona wire、drum、transfer roller、fuser、pickup rollers。',
    priority: '最高频',
    steps: [
      {
        name: 'Processing',
        action: 'driver / spooler / printer firmware 处理 print job。',
        clues: ['driver', 'Print Spooler', 'firmware'],
      },
      {
        name: 'Toner cartridge / drum',
        action: 'toner cartridge、corona wire、drum 参与成像。',
        clues: ['toner cartridge', 'corona wire', 'drum'],
      },
      {
        name: 'Transfer',
        action: 'transfer roller 把图像转到纸上。',
        clues: ['transfer roller'],
      },
      {
        name: 'Fuser',
        action: 'fuser 把 toner 固定到纸上。',
        clues: ['smudge', 'toner wipes off', 'fuser'],
      },
      {
        name: 'Pickup rollers',
        action: 'pickup rollers 负责进纸。',
        clues: ['misfeed', 'pickup rollers'],
      },
    ],
    symptoms: [
      '一擦就掉粉 / toner not fused → replace fuser。',
      'intermittently not feeding / misfeed → clean or replace pickup rollers。',
      'lines and smudges + paper feed issue → maintenance kit 方向。',
      '只 copy/scan 有竖线，print/fax 正常 → document feeder / ADF。',
    ],
  },
  {
    id: 'inkjet',
    name: 'Inkjet Printer（喷墨打印机）',
    summary: '题库重点是 ink cartridge 和 Clean the printheads。',
    priority: '高频',
    steps: [
      {
        name: 'Ink cartridge',
        action: 'ink cartridge 提供墨水。',
        clues: ['ink cartridge'],
      },
      {
        name: 'Printhead',
        action: 'printhead 负责把墨水打印到纸上。',
        clues: ['poor quality', 'Clean the printheads'],
      },
      {
        name: 'Paper feed',
        action: 'rollers 送纸，纸张逐行经过打印头。',
        clues: ['pickup rollers', 'paper feed'],
      },
      {
        name: 'Cleaning',
        action: '换 ink cartridge 后仍质量差，下一步 Clean the printheads。',
        clues: ['Clean the printheads'],
      },
    ],
    symptoms: [
      '换 ink cartridge 后质量仍差 → Clean the printheads。',
      '能打印大多数文件，但某应用导致 spooler 停止 → 应用/driver/spooler 层，不是墨盒。',
    ],
  },
  {
    id: 'thermal',
    name: 'Thermal Printer（热敏打印机）',
    summary: '题库出现 thermal receipt printer：竖白线优先清洁 heating element。',
    priority: '中频',
    steps: [
      {
        name: 'Paper type',
        action: '确认 paper type 是否正确。',
        clues: ['correct paper type'],
      },
      {
        name: 'Heating element',
        action: 'heating element 出问题会造成 thermal receipt printer 竖白线。',
        clues: ['vertical white lines', 'heating element'],
      },
    ],
    symptoms: [
      'thermal receipt printer + vertical white lines → Cleaning the heating element。',
      '不要选 ink cartridge / maintenance kit。',
    ],
  },
  {
    id: 'impact',
    name: 'Impact / Dot Matrix（击打式/针式打印机）',
    summary: 'printhead pins（打印针）击打 ribbon（色带），把油墨或压力传到 paper / multipart forms。',
    priority: '高频错点',
    steps: [
      {
        name: 'Multipart forms',
        action: 'multipart forms 可以让 bottom pages 通过击打压力显字。',
        clues: ['multipart forms', 'bottom pages print fine'],
      },
      {
        name: 'Ribbon',
        action: 'ribbon 位于 printhead 和 top page 之间，提供油墨。',
        clues: ['ribbon', 'top page blank'],
      },
      {
        name: 'Broken pins',
        action: 'printhead pins 击打 ribbon 和纸张形成字符。',
        clues: ['broken pins', 'printhead pins'],
      },
    ],
    symptoms: [
      'top page blank + bottom pages print fine → Replace the ribbon。',
      'broken pins 不是本题 top page blank 的最直接原因。',
      '输出越来越浅 → Replace the ribbon。',
    ],
  },
  {
    id: '3d',
    name: '3D Printer（3D 打印机）',
    summary: '题库只出现 carbon fiber-based filament 的安全题：答案是 Air filter mask。',
    priority: '低频',
    steps: [
      {
        name: 'Carbon fiber-based filament',
        action: '题干给 carbon fiber-based filament。',
        clues: ['carbon fiber-based filament', 'high strength'],
      },
      {
        name: 'Air filter mask',
        action: '最贴题的安全用品是 Air filter mask。',
        clues: ['Air filter mask'],
      },
    ],
    symptoms: [
      '3-D printing + carbon fiber-based filament → Air filter mask。',
      '不要把 3D printer 和普通 paper printer 的 fuser/toner/ribbon 混选。',
    ],
  },
];

export const PRINTER_SYMPTOM_MAP = [
  { symptom: 'Toner wipes off / smudges when touched', answer: 'Fuser', layer: 'Laser fusing' },
  { symptom: 'Paper intermittently not feeding', answer: 'Pickup rollers', layer: 'Paper feed' },
  { symptom: 'Poor inkjet print quality after cartridge replacement', answer: 'Clean the printheads', layer: 'Inkjet printhead' },
  { symptom: 'Dot matrix multipart top page blank, bottom pages fine', answer: 'Replace the ribbon', layer: 'Ribbon' },
  { symptom: 'Print queue stuck / spooler stops', answer: 'Print Spooler / printer driver', layer: 'Print services' },
  { symptom: 'Copy/scan issue only, print/fax normal', answer: 'Document feeder / ADF', layer: 'Document feeder' },
];
