export const SECURITY_PLUS_DOMAINS = [
  {
    id: 'sec-general-concepts',
    number: '1.0',
    weight: '12%',
    label: 'General Security Concepts｜通用安全概念',
    summary: '用 controls（控制）、CIA triad、Zero Trust（零信任）、change management（变更管理）和 cryptography（密码学）建立基础判断框架。',
    signals: ['control type（控制类型）', 'CIA impact（机密性/完整性/可用性）', 'Zero Trust（零信任）', 'hash / salt / signature（哈希/盐/签名）', 'PKI（公钥基础设施）'],
    flow: [
      '先判断题目要实现的 security objective（安全目标）或 control category（控制类别）。',
      '区分 authentication（认证）、authorization（授权）与 accounting（审计记账）。',
      '密码学题先定位 confidentiality（机密性）、integrity（完整性）或 non-repudiation（不可否认性）。',
      '选择能直接提供题干所需 property（属性）的控制，不选仅仅相关但作用层级不同的概念。',
    ],
    traps: [
      'Encryption（加密）主要提供机密性；hashing（哈希）主要验证完整性。',
      'Digital signature（数字签名）验证来源与完整性，本身不等于加密整条消息。',
      'Zero Trust（零信任）强调持续验证，而不是无条件拒绝所有访问。',
    ],
  },
  {
    id: 'sec-threats-mitigations',
    number: '2.0',
    weight: '22%',
    label: 'Threats, Vulnerabilities, and Mitigations｜威胁、漏洞与缓解',
    summary: '根据 threat actors（威胁行为者）、attack vectors（攻击向量）、indicators（迹象）和 mitigations（缓解措施）完成攻击链匹配。',
    signals: ['actor + motive（攻击者与动机）', 'attack vector（攻击向量）', 'indicator（攻击迹象）', 'exploit（漏洞利用）', 'best mitigation（最佳缓解）'],
    flow: [
      '先确认题干问的是 actor（攻击者）、vector（向量）、vulnerability（漏洞）还是 indicator（迹象）。',
      '把症状映射到最具体的 attack technique（攻击技术），避免停留在上位概念。',
      '选择能直接阻断该技术的 mitigation（缓解措施）。',
      '题目要求 prevention（预防）时，排除只能 detection（检测）或事后响应的控制。',
    ],
    traps: [
      'Phishing（钓鱼）是投递/诱骗技术；malware（恶意软件）通常是载荷，二者不是同一层。',
      'Vulnerability（漏洞）是弱点；exploit（利用）是攻击者滥用弱点的方法。',
      'Least privilege（最小权限）能限制影响，但不一定消除最初漏洞。',
    ],
  },
  {
    id: 'sec-architecture',
    number: '3.0',
    weight: '18%',
    label: 'Security Architecture｜安全架构',
    summary: '围绕 cloud（云）、infrastructure（基础设施）、segmentation（分段）、resilience（韧性）和 data protection（数据保护）设计信任边界。',
    signals: ['cloud responsibility（云责任边界）', 'network zone（网络区域）', 'resilience（韧性）', 'data state（数据状态）', 'secure design（安全设计）'],
    flow: [
      '先定位 trust boundary（信任边界）以及需要保护的数据或服务。',
      '判断责任属于 on-premises（本地）、cloud provider（云厂商）、customer（客户）还是 third party（第三方）。',
      '优先用 segmentation（分段）和 least exposure（最小暴露）缩小攻击面，再考虑监控。',
      '韧性题要针对题干给出的 single point of failure（单点故障）增加冗余或替代路径。',
    ],
    traps: [
      'Public subnet（公有子网）默认不适合放置数据库等敏感后端。',
      'Redundancy（冗余）提升可用性，但不能替代 backup（备份）。',
      'Tokenization（令牌化）和 masking（掩码）减少暴露，但不等同于 encryption（加密）。',
    ],
  },
  {
    id: 'sec-operations',
    number: '4.0',
    weight: '28%',
    label: 'Security Operations｜安全运营',
    summary: '覆盖 IAM（身份访问）、hardening（加固）、monitoring（监控）、vulnerability management（漏洞管理）和 incident response（事件响应）。',
    signals: ['operational task（运营动作）', 'log / alert（日志/告警）', 'IAM lifecycle（身份生命周期）', 'incident phase（事件阶段）', 'forensics（取证）'],
    flow: [
      '先判断任务属于 prevention（预防）、detection（检测）、response（响应）还是 recovery（恢复）。',
      '在正确 incident phase（事件阶段）使用题干指定的数据源或安全工具，不要跨阶段选工具。',
      '进行会改变系统状态的响应动作前，先 preservation（保全）关键证据。',
      '损害正在扩散时先 containment（遏制）；明确范围后再 eradication（清除）并恢复。',
    ],
    traps: [
      'SIEM 负责日志集中与关联；SOAR 负责 playbook（剧本）编排和自动响应。',
      'Vulnerability scan（漏洞扫描）发现可能弱点；penetration test（渗透测试）验证能否实际利用。',
      'Containment（遏制）限制扩散；recovery（恢复）让业务回到正常状态。',
    ],
  },
  {
    id: 'sec-program-management',
    number: '5.0',
    weight: '20%',
    label: 'Security Program Management and Oversight｜安全项目管理与监督',
    summary: '通过 governance（治理）、risk（风险）、vendors（供应商）、compliance（合规）、audit（审计）和 awareness（意识培训）管理安全项目。',
    signals: ['policy hierarchy（政策层级）', 'risk decision（风险决策）', 'third party（第三方）', 'compliance（合规）', 'awareness（安全意识）'],
    flow: [
      '先确定责任域：governance（治理）、risk（风险）、compliance（合规）、audit（审计）或 training（培训）。',
      '选择风险响应前先评估 likelihood（可能性）和 impact（影响）。',
      '使用 contract（合同）、assessment（评估）和 right-to-audit（审计权）管理第三方义务。',
      '根据题干要记录的决定或证据，选择正确的 policy、standard、procedure 或 agreement。',
    ],
    traps: [
      'Policy（政策）声明方向；procedure（程序）给出逐步执行方法。',
      'Risk acceptance（风险接受）保留风险；risk transfer（风险转移）转移部分财务责任。',
      'SLA 定义可衡量的服务目标，但不能替代完整的安全或法律协议。',
    ],
  },
];

export function getSecurityPlusDomain(domainId) {
  return SECURITY_PLUS_DOMAINS.find((domain) => domain.id === domainId);
}
