import { bi, source } from './helpers.mjs';

export default [
  {
    id: 1, module: 'ai-platform', answer: ['D'],
    stemZh: 'Cisco AI PODs 的一项主要用途是什么？',
    sources: [source('Cisco AI PODs: architecture and use cases', 'https://www.cisco.com/site/us/en/solutions/artificial-intelligence/infrastructure/ai-pods.html', 'The platform combines compute, networking, storage and software, and supports training, model refinement and inference.')],
    reviewNote: 'Retained D. The vendor describes a prevalidated, modular full stack. Turnkey should mean an integrated deployment architecture, not a guarantee that every model runs without configuration.',
    summary: bi('Choose D: an AI POD is an integrated infrastructure stack for multiple AI workload stages, not just compute hardware or an inference appliance.', '选 D：AI POD 是面向多种 AI 工作负载阶段的集成基础设施，不只是计算服务器，也不是仅用于推理的设备。'),
    memory: bi('AI POD = a validated stack + the AI workload lifecycle.', 'AI POD＝经过验证的完整技术栈＋AI 工作负载生命周期。'),
    pitfall: bi('Modular does not mean hardware-only. A particular deployment may target inference, but that does not limit the purpose of the entire product family.', '模块化不等于只提供硬件。某个部署可以专门用于推理，但不能据此把整个产品系列的用途限制为推理。'),
    steps: [
      bi('Identify the scope: the question asks about the platform, not a single component.', '先看范围：题目问整个平台的用途，不是某个组件的功能。'),
      bi('Look for both integrated infrastructure and support for training, fine-tuning and inference.', '同时寻找两个要点：集成基础设施，以及对训练、微调、推理的支持。'),
      bi('Eliminate answers that narrow the hardware scope or omit the integrated software stack.', '排除缩小硬件范围、或遗漏集成软件栈的答案。'),
    ],
    terms: [bi('full stack', '完整技术栈'), bi('training', '训练'), bi('fine-tuning', '微调'), bi('inference', '推理')],
    options: {
      A: { zh: '通过云原生软件实现 AI 生命周期管理，但硬件支持仅限于计算服务器。', reason: bi('Incorrect: the compute-only restriction excludes networking and data platforms. Lifecycle software can be part of the solution, but it does not define the whole AI POD.', '错误：仅限计算服务器这一条件排除了网络和数据平台。生命周期软件可以是方案的一部分，但不能代表整个 AI POD。') },
      B: { zh: '提供以推理工作负载为重点、训练能力为可选项的灵活 AI 基础设施。', reason: bi('Incorrect as the general description: this makes inference the defining workload and treats training as secondary. The platform family supports a broader AI lifecycle.', '作为总体描述不正确：它把推理作为定义性工作负载，把训练放在次要位置。该平台系列覆盖更广的 AI 生命周期。') },
      C: { zh: '提供可与第三方软件平台集成的模块化 AI 硬件组件。', reason: bi('Incomplete: modular components and partner software are relevant, but the value proposition is their validated integration into a working infrastructure stack.', '描述不完整：模块化组件和合作伙伴软件确实相关，但关键价值在于把它们经过验证地集成为可部署的基础设施。') },
      D: { zh: '为 AI 训练、微调和推理提供集成式的完整基础设施方案。', reason: bi('Correct: this covers both the integrated stack and its workload breadth. It is the best match among the four options, without implying zero deployment work.', '正确：同时覆盖集成技术栈和工作负载范围，是四个选项中最完整的描述；这不意味着部署完全不需要配置。') },
    },
  },
  {
    id: 7, module: 'power-cooling', answer: ['B'],
    stemZh: '客户在具有两路供电的数据中心部署一台 UCS C885A 服务器。六个 3000 W 电源中，每路供电连接三个。其中一路因维护断电时，服务器会如何响应？',
    sources: [source('Cisco UCS C885A M8 installation guide: redundant PSU operation', 'https://www.cisco.com/c/en/us/td/docs/unified_computing/ucs/c/hw/c885A/install/b_c885a-m8-server-hig/m_overview.html', 'The 3000 W units are 54 V PSUs. Three available units imply a 60% GPU power cap; four or more support full performance. Full grid redundancy is not supported.')],
    reviewNote: 'Retained B. Interpret the abbreviated UCS 885a name as C885A M8 and the six 3000 W supplies as the 54 V GPU supplies, not the separate 12 V CPU supplies. The answer assumes the remaining supply path and CPU tray stay powered.',
    summary: bi('Choose B: losing one three-PSU feed leaves three GPU PSUs, so the server remains running with GPU power capped at 60%.', '选 B：失去连接三个电源的供电支路后，还剩三个 GPU 电源，服务器继续运行，但 GPU 功率限制为 60%。'),
    memory: bi('Three GPU PSUs: capped operation. Four or more: full performance.', '三个 GPU 电源：限功率运行；四个及以上：完整性能。'),
    pitfall: bi('A 60% power cap is not a promise of exactly 60% throughput. PSU redundancy and full grid redundancy are different.', '60% 功率上限不等于吞吐量必定是原来的 60%。电源模块冗余与完整的供电支路冗余不是同一概念。'),
    steps: [bi('Count surviving GPU supplies: six minus three leaves three.', '先数仍可供电的 GPU 电源：六个减去三个，剩三个。'), bi('Apply the model-specific reduced-power behavior.', '再应用该型号的降功率运行规则。'), bi('Reject shutdown and full-performance claims.', '排除关机以及保持完整性能的说法。')],
    terms: [bi('PSU', '电源模块'), bi('power capping', '功率限制'), bi('grid redundancy', '供电支路冗余')],
    options: {
      A: { zh: '服务器立即关机并停止所有操作。', reason: bi('Incorrect: the surviving supplies support reduced-power operation; immediate shutdown is not the stated response.', '错误：剩余电源能够支持降功率运行，此场景并非立即关机。') },
      B: { zh: '服务器以较低性能运行，并把 GPU 功率限制为 60%。', reason: bi('Correct: three surviving GPU supplies trigger the documented power cap.', '正确：剩余三个 GPU 电源，对应该型号文档规定的限功率状态。') },
      C: { zh: '服务器利用冗余电源继续保持完整性能，但 PSU 状态灯常亮琥珀色。', reason: bi('Incorrect: the full-performance claim fails before the LED detail matters.', '错误：完整性能这一核心前提已经不成立，附加的指示灯描述不能使该选项正确。') },
      D: { zh: '服务器启动操作系统的正常关机流程。', reason: bi('Incorrect: this event calls for power limiting, not an operating-system shutdown.', '错误：此事件对应功率限制，而不是发起操作系统关机流程。') },
    },
  },
  {
    id: 14, module: 'power-cooling', answer: ['B'],
    stemZh: '硬件升级后，多台 UCS X-Series 服务器的功率使用接近上限。机箱安装六个电源并采用冗余模式。管理员如何在保持该冗余模式的情况下提高可分配功率？',
    sources: [source('Configure Power Policy on UCS X9508 Chassis', 'https://www.cisco.com/c/en/us/support/docs/servers-unified-computing/unified-computing-system/223066-configure-power-policy-on-ucs-x9508.html', 'Extended Power Capacity adds 15% allocation in redundant modes. The documented six-PSU grid example increases 8400 W to 9660 W; an extended-range workload may throttle after a grid loss.')],
    reviewNote: 'Retained B, but qualified the source wording “without impacting redundancy”. The configured redundancy mode is retained; uninterrupted full performance after losing a grid is not guaranteed. The Chinese wording makes this distinction explicit.',
    summary: bi('Choose B: Extended Power Capacity increases the power budget while keeping a supported redundant mode. It does not guarantee unchanged performance after a supply-grid failure.', '选 B：Extended Power Capacity 在保留受支持的冗余模式时提高功率预算，但并不保证供电支路故障后性能完全不变。'),
    memory: bi('Extended capacity adds budget; capping restricts it.', '扩展容量增加预算；功率封顶限制预算。'),
    pitfall: bi('Redundant configuration is not the same as full-performance failover. At high extended-range load, losing a grid can trigger E-brake throttling.', '保留冗余配置不等于故障切换后仍保持满性能。在扩展功率区间的高负载下，失去一路供电可能触发 E-brake 限速。'),
    steps: [
      bi('The chassis already has six supplies, so adding more is not the available remedy.', '机箱已经有六个电源，继续增加电源不是可用的解决办法。'),
      bi('Enable the feature that raises allocation in a redundant mode, rather than lowering demand with a cap.', '启用在冗余模式下提高可分配功率的功能，而不是用功率封顶来降低需求。'),
      bi('Check failure-mode headroom separately: the documented budget rises 15%, from 8400 W to 9660 W in the example.', '另外检查故障工况余量：文档示例中预算提高 15%，从 8400 W 增至 9660 W。'),
    ],
    terms: [bi('Extended Power Capacity', '扩展功率容量'), bi('power budget', '功率预算'), bi('E-brake', '紧急功率限制机制')],
    options: {
      A: { zh: '实施功率封顶策略。', reason: bi('Incorrect: a cap limits consumption. It can help stay within an existing budget but does not create additional usable capacity.', '错误：功率封顶限制功耗，可帮助系统不超出现有预算，但不能增加可用功率容量。') },
      B: { zh: '启用扩展功率容量。', reason: bi('Correct: this is the policy feature that raises allocation in redundant modes. Retain the caveat that a grid failure can still reduce available performance.', '正确：这是在冗余模式下提高分配额度的策略功能；但仍须注意，供电支路故障可能降低可用性能。') },
      C: { zh: '增加更多电源模块。', reason: bi('Incorrect: the six installed supplies already occupy the supported PSU capacity of the X9508 chassis described here.', '错误：本题对应的 X9508 机箱已经安装六个电源，达到其支持的电源数量上限。') },
      D: { zh: '禁用扩展功率容量。', reason: bi('Incorrect: disabling the feature removes the extra allocation, which is the opposite of the requested change.', '错误：禁用该功能会移除额外的功率额度，与题目要求的增加可用功率相反。') },
    },
  },
];
