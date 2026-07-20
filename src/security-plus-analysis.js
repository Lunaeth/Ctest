import { emphasizeKeywords } from './learning-annotations.js';

const TERM_RULES = [
  [/\bhacktivist\b/i, '黑客行动主义者', '以政治、社会议题或意识形态为动机，通过攻击、泄露或破坏来表达立场'],
  [/\bwhistleblower\b/i, '举报人', '从组织内部披露不当行为或违法事实，重点是内部信息与揭露动机'],
  [/\borganized crime\b/i, '有组织犯罪', '依靠资金、专业分工和犯罪网络实施牟利攻击，也可能受雇执行高能力行动'],
  [/\bunskilled attacker|script kiddie\b/i, '低技能攻击者', '使用现成工具或脚本发动机会型攻击，通常缺少定制化能力与长期资源'],
  [/\bnation.state|state.sponsored\b/i, '国家级攻击者', '以国家战略、情报或地缘政治目标为导向，具备持续资源与高级能力'],
  [/\binsider threat\b/i, '内部威胁', '利用合法身份、内部知识或既有访问权限造成泄露、破坏或滥用'],
  [/\bkey stretching\b/i, '密钥拉伸', '反复执行哈希或使用高成本 KDF，提高每次口令猜测的计算代价'],
  [/\bsalt(?:ing)?\b/i, '加盐', '在哈希前加入随机且唯一的数据，避免相同口令产生相同哈希并抵抗 rainbow table'],
  [/\btokenization\b/i, '令牌化', '用无敏感含义的 token 替代原始数据，并把映射关系保存在受控系统中'],
  [/\bdata masking|\bmasking\b/i, '数据掩码', '隐藏展示中的部分敏感字段，适合测试、客服或低权限查看场景'],
  [/\bsteganograph/i, '隐写术', '把秘密信息隐藏在图片、音频等载体中，重点是隐藏信息存在这一事实'],
  [/\bobfuscat/i, '混淆', '降低代码或数据的可读性以增加分析难度，但不等同于可靠加密'],
  [/\bencrypt|\bFDE\b|full disk encryption/i, '加密', '使用密钥把明文转换为密文，保护 data at rest 或 data in transit 的机密性'],
  [/\bhash(?:ing)?\b/i, '哈希', '执行单向摘要以验证完整性或保存口令验证值，不能像加密那样解密还原'],
  [/\bdigital signature|code signing|non.repudiation/i, '数字签名／不可否认性', '用私钥签名并由公钥验证来源与完整性，支持 authenticity 和 non-repudiation'],
  [/\bphishing campaign|\bphishing\b/i, '网络钓鱼', '通过伪装邮件或网页诱导用户泄露凭据、点击链接或执行恶意内容'],
  [/\bsmishing\b/i, '短信钓鱼', '通过 SMS 或即时消息实施钓鱼'],
  [/\bvishing\b/i, '语音钓鱼', '通过电话或语音渠道冒充可信对象套取信息'],
  [/\bwhaling\b/i, '高管钓鱼', '针对高管或高价值决策者定制社会工程内容'],
  [/\bpretexting\b/i, '借口诱骗', '构造可信身份和故事背景，诱导受害者提供信息或执行动作'],
  [/\bimpersonation\b/i, '身份冒充', '伪装成可信人员、供应商或机构来绕过人的信任判断'],
  [/\bwatering.hole\b/i, '水坑攻击', '入侵目标群体经常访问的网站，以访问者身份筛选受害者'],
  [/\btyposquatting\b/i, '拼写劫持', '注册与合法域名相似的错拼域名，利用用户输入错误实施欺骗'],
  [/\bsocial engineering\b/i, '社会工程', '利用人的信任、紧迫感、权威感或好奇心绕过技术控制'],
  [/\bransomware\b/i, '勒索软件', '加密或窃取数据后索取赎金，重点是可用性破坏与勒索'],
  [/\bkeylogger\b/i, '键盘记录器', '记录键盘输入以窃取口令和敏感内容'],
  [/\brootkit\b/i, 'Rootkit', '隐藏恶意活动并维持高权限持久化，常深入操作系统层'],
  [/\btrojan\b/i, '木马', '伪装成合法程序诱使执行，通常依赖用户安装或运行'],
  [/\bside loading\b/i, '旁加载', '绕过官方应用商店或受控发布渠道安装应用'],
  [/\bmemory injection\b/i, '内存注入', '把恶意代码写入其他进程内存并借其上下文执行'],
  [/\bpassword spraying\b/i, '密码喷洒', '用少量常见密码尝试大量账号，以降低单账号锁定风险'],
  [/\bcredential stuffing\b/i, '凭据填充', '把其他泄露事件中的用户名密码组合批量尝试到目标站点'],
  [/\bbrute.force\b/i, '暴力破解', '系统枚举大量密码或密钥候选值直到命中'],
  [/\bSQL injection\b/i, 'SQL 注入', '把未受控输入拼入数据库查询，造成读取、修改或绕过认证'],
  [/\bcross.site scripting|\bXSS\b/i, '跨站脚本', '让不可信脚本在其他用户浏览器中执行，攻击会话或页面信任边界'],
  [/\bbuffer overflow\b/i, '缓冲区溢出', '越界写入内存，可能导致崩溃、控制流劫持或任意代码执行'],
  [/\brace condition\b/i, '竞态条件', '执行结果依赖并发时序，攻击者可利用检查与使用之间的窗口'],
  [/\binput validation|input sanitization|\bsanitization\b/i, '输入验证／净化', '在数据进入处理逻辑前限制格式并处理危险字符，减少注入类漏洞'],
  [/\bstatic code analysis\b/i, '静态代码分析', '不运行程序而检查源代码或二进制中的缺陷与不安全模式'],
  [/\bWAF\b|web application firewall/i, 'Web 应用防火墙', '理解 HTTP 请求并过滤 SQL injection、XSS 等 Web 层攻击'],
  [/\bNGFW\b|next.generation firewall/i, '下一代防火墙', '结合应用识别、深度检测和传统网络策略进行边界控制'],
  [/\bhost.based firewall\b/i, '主机防火墙', '在单台端点上按端口、程序或网络范围控制进出流量'],
  [/\bfirewall\b/i, '防火墙', '依据网络策略允许或拒绝流量，核心是 traffic filtering 与边界控制'],
  [/\bIPS\b|intrusion prevention system/i, '入侵防御系统', '在线检测并主动阻断恶意流量，处于数据路径上'],
  [/\bIDS\b|intrusion detection system/i, '入侵检测系统', '监测可疑活动并告警，通常不直接阻断流量'],
  [/\bEDR\b/i, '端点检测与响应', '持续收集端点行为，支持检测、调查、隔离和响应'],
  [/\bSIEM\b/i, '安全信息与事件管理', '集中汇聚日志并关联分析，用于检测、告警和调查'],
  [/\bSOAR\b/i, '安全编排自动化与响应', '把告警处置流程编排成 playbook 并自动执行重复响应动作'],
  [/\bDLP\b|data loss prevention/i, '数据防泄漏', '识别敏感数据并限制其经邮件、端点、云或网络外流'],
  [/\bFIM\b|file integrity monitoring/i, '文件完整性监控', '对关键文件建立基线并发现未经授权的变化'],
  [/\bantivirus\b/i, '防病毒', '基于特征或行为发现并处置常见恶意软件'],
  [/\bhoneypot\b/i, '蜜罐', '部署诱饵系统吸引攻击者，以便检测、延迟和研究攻击行为'],
  [/\bsegmentation|microsegmentation/i, '网络分段', '划分信任区域并限制横向移动，缩小攻击面和故障范围'],
  [/\bNAC\b|network access control/i, '网络访问控制', '在设备接入网络前后验证身份、状态与合规性'],
  [/\bACL\b|access control list/i, '访问控制列表', '按主体、地址、端口或资源定义允许与拒绝规则'],
  [/\bVPN\b|\bIPSec\b/i, '虚拟专用网络', '通过加密隧道保护不可信网络上的远程或站点间通信'],
  [/\bproxy server\b/i, '代理服务器', '代表客户端访问外部资源，可过滤、缓存并隐藏内部地址'],
  [/\bjump server\b/i, '跳板机', '提供受控的管理入口，集中审计对敏感网段或服务器的访问'],
  [/\bload balanc/i, '负载均衡', '把请求分散到多个后端，提高容量、性能和服务可用性'],
  [/\bgeographic dispersion\b/i, '地理分散', '把资源部署到不同地理区域，降低单一区域灾害造成的共同失效'],
  [/\breplication\b/i, '复制', '把数据或服务状态同步到其他位置，提高冗余与恢复能力'],
  [/\bsnapshot/i, '快照', '保存某一时间点的卷或系统状态，便于快速回滚但不天然等同于离线备份'],
  [/\bhot site|^hot$/i, '热站点', '预置基础设施和近实时数据，可在较短时间内接管业务，成本最高'],
  [/\bwarm site|^warm$/i, '温站点', '具备部分设备和连接，需要补充数据或配置后才能恢复'],
  [/\bcold site|^cold$/i, '冷站点', '只提供基础场地与设施，恢复最慢但成本最低'],
  [/\bRTO\b/i, '恢复时间目标', '规定中断后业务必须在多长时间内恢复'],
  [/\bRPO\b/i, '恢复点目标', '规定可接受的数据丢失时间窗口，决定备份或复制频率'],
  [/\bmultifactor authentication|\bMFA\b/i, '多因素认证', '组合两个或以上不同因素类别，降低单一凭据泄露的风险'],
  [/\bbiometric/i, '生物特征', '以指纹、人脸等 inherence factor 证明身份'],
  [/\bSAML\b/i, '安全断言标记语言', '在身份提供商与服务提供商之间交换认证断言，常用于企业 Web SSO'],
  [/\bRADIUS\b/i, 'RADIUS', '为网络接入提供集中式 AAA，常配合 VPN、无线和 802.1X'],
  [/\bLDAP\b/i, '轻量目录访问协议', '查询和管理目录中的用户、组与属性，并非独立的现代联邦协议'],
  [/\bfederation\b/i, '身份联邦', '在不同信任域之间接受身份断言，使用户跨组织访问服务'],
  [/\bauthentication\b/i, '身份认证', '验证主体是谁；与授权其能做什么不同'],
  [/\bleast privilege\b/i, '最小权限', '只授予完成任务所需的最低权限和最短访问范围'],
  [/\bZero Trust\b/i, '零信任', '持续验证身份、设备和上下文，不因网络位置而默认信任'],
  [/\bcertificate|certification\b/i, '证书', '把主体身份与公钥绑定，并由受信任 CA 签名'],
  [/\bOCSP\b/i, '在线证书状态协议', '在线查询单张证书当前是否被撤销，响应比下载完整列表更及时'],
  [/\bCRL\b/i, '证书吊销列表', '由 CA 定期发布已吊销证书清单，客户端需要下载并检查'],
  [/\bCSR\b/i, '证书签名请求', '向 CA 提交主体信息和公钥以申请签发证书'],
  [/\battestation\b/i, '证明', '提供设备启动状态、配置或密钥受可信硬件保护的可验证证据'],
  [/\bvulnerability scan|vulnerability assessment/i, '漏洞扫描／评估', '系统识别已知弱点并评定风险，通常不以主动利用证明为目标'],
  [/\bpenetration test(?:ing)?\b/i, '渗透测试', '在授权范围内主动尝试利用弱点，以证明实际攻击路径与影响'],
  [/\bCVE\b/i, '通用漏洞编号', '为公开漏洞提供统一标识，便于跨工具和公告引用同一缺陷'],
  [/\bCVSS\b/i, '通用漏洞评分系统', '根据可利用性和影响等指标量化漏洞严重度'],
  [/\bSCAP\b/i, '安全内容自动化协议', '以标准化格式交换漏洞、配置和合规检查内容'],
  [/\bpatch(?:ing| availability)?\b/i, '补丁管理', '获取、测试并部署修复以消除已知漏洞，同时控制变更风险'],
  [/\bcontainment\b|\bisolation\b/i, '遏制／隔离', '限制事件继续扩散，保护证据并为清除与恢复争取时间'],
  [/\bpreparation\b/i, '准备阶段', '在事件发生前建立计划、人员、工具、通信和演练能力'],
  [/\bpreservation\b/i, '证据保全', '保持证据完整性与原始状态，避免调查过程改变数据'],
  [/\bchain of custody\b/i, '证据保管链', '记录证据由谁、何时、为何接触与转移，证明其完整可信'],
  [/\be.discovery\b/i, '电子取证发现', '为诉讼或调查识别、保全、收集和提供电子信息'],
  [/\btabletop exercise\b/i, '桌面推演', '通过情景讨论验证计划、职责和沟通，不实际中断生产系统'],
  [/\bIRP\b/i, '事件响应计划', '定义安全事件的角色、升级、通信和处置流程'],
  [/\brisk assessment\b/i, '风险评估', '识别资产、威胁、脆弱性、可能性和影响并确定优先级'],
  [/\brisk tolerance\b/i, '风险容忍度', '组织愿意承受的风险偏差或波动范围'],
  [/\baccept(?:ance)?\b/i, '风险接受', '在知情并获授权后保留风险，不额外改变其可能性或影响'],
  [/\btransfer\b/i, '风险转移', '通过保险或合同把部分财务责任转给第三方，但风险本身不会消失'],
  [/\bavoid(?:ance)?\b/i, '风险规避', '停止引发风险的活动，从源头移除该风险'],
  [/\bmitigat/i, '风险缓解', '实施控制降低风险发生可能性或影响'],
  [/\bSLA\b/i, '服务级别协议', '定义可用性、响应时间、支持和违约补救等可衡量服务承诺'],
  [/\bNDA\b/i, '保密协议', '约束签约方不得披露指定机密信息'],
  [/\bMOU\b|\bMOA\b/i, '谅解备忘录／协议备忘录', '记录合作意向、职责和共同理解，通常不等同于详细采购合同'],
  [/\bSOW\b/i, '工作说明书', '明确项目范围、交付物、里程碑和验收条件'],
  [/\bMSA\b/i, '主服务协议', '规定长期商业关系的通用法律与服务条款，具体工作再由 SOW 补充'],
  [/\bdue diligence\b/i, '尽职调查', '在决策或签约前主动调查并验证第三方、资产或控制状况'],
  [/\bdata sovereignty\b/i, '数据主权', '数据受其存储或处理所在地法律和监管要求约束'],
  [/\bclassification\b/i, '数据分类', '按敏感度和业务价值分级，从而匹配处理、访问和保留控制'],
  [/\bconfidentiality\b/i, '机密性', '防止未授权披露信息'],
  [/\bintegrity\b/i, '完整性', '防止或发现未经授权的数据修改'],
  [/\bavailability\b/i, '可用性', '确保授权用户在需要时能访问系统和数据'],
  [/\bpreventive\b/i, '预防性控制', '在事件发生前降低其发生可能性'],
  [/\bdetective\b/i, '检测性控制', '发现已经发生或正在发生的异常并产生告警'],
  [/\bcorrective\b/i, '纠正性控制', '在事件后修复影响并恢复到正常状态'],
  [/\bdeterrent\b/i, '威慑性控制', '通过可见惩罚或监控预期降低攻击意愿'],
  [/\bcompensating\b/i, '补偿性控制', '主控制无法实施时，用替代措施达到相近风险降低效果'],
  [/\bmanagerial\b/i, '管理性控制', '通过政策、治理、风险和人员管理来指导安全'],
  [/\boperational\b/i, '运营性控制', '由人员和日常流程执行，例如培训、巡查和事件处理'],
  [/\btechnical\b/i, '技术性控制', '由系统、软件或硬件强制执行访问与保护规则'],
  [/\bphysical\b/i, '物理控制', '通过门禁、围栏、摄像头和环境设施保护人员与设备'],
  [/\bvideo surveillance\b/i, '视频监控', '记录和观察物理区域活动，主要用于威慑、检测与调查'],
  [/\bvirtualization\b/i, '虚拟化', '在共享硬件上隔离运行多个虚拟系统，提高资源利用与部署灵活性'],
  [/\bcontainerization\b/i, '容器化', '共享主机内核并隔离应用进程与依赖，通常比完整虚拟机更轻量'],
  [/\bVM escape\b/i, '虚拟机逃逸', '突破虚拟机隔离并影响 hypervisor 或其他来宾系统'],
  [/\bshadow IT\b/i, '影子 IT', '未经 IT 或安全批准使用的系统、应用和云服务，造成不可见风险'],
  [/\bMDM\b/i, '移动设备管理', '集中配置、合规检查、远程锁定或擦除移动设备'],
];

const SCENARIO_RULES = [
  [/threat actor|foreign government|motivation|hacktivist|insider/i, '威胁行为者与动机', '攻击者的资源、访问位置、动机和目标必须同时匹配', ['foreign government', 'critical systems', 'motivation', 'insider']],
  [/phishing|smishing|vishing|pretext|impersonat|social engineering|watering.hole/i, '社会工程', '传播渠道、冒充方式和目标人群决定具体攻击类型', ['email', 'text message', 'phone', 'executive', 'frequently visits']],
  [/password|credential|authentication|multifactor|biometric|SAML|RADIUS|LDAP/i, '身份与访问管理', '先区分认证、授权和联邦，再匹配题干要求的因素或协议', ['password', 'credentials', 'authentication', 'single sign-on', 'factor']],
  [/hash|salt|encryption|certificate|public key|private key|signature|cryptograph/i, '密码学与 PKI', '区分机密性、完整性、身份验证以及操作发生在变换之前还是之后', ['one-way', 'before', 'public key', 'private key', 'certificate', 'at rest']],
  [/malware|ransomware|rootkit|trojan|keylogger|injection|side loading/i, '恶意软件与应用攻击', '根据执行位置、传播方式、持久化手段和攻击结果辨认技术', ['process', 'memory', 'encrypt', 'malicious', 'execute']],
  [/SQL|cross.site|XSS|buffer overflow|input validation|code analysis|web application/i, '应用安全', '漏洞成因和最接近代码入口的防护措施必须对应', ['input', 'query', 'browser', 'source code', 'memory']],
  [/firewall|WAF|IDS|IPS|network|segmentation|NAC|proxy|VPN|port|packet/i, '网络安全架构', '控制所在层级、是否在线阻断以及流量方向决定答案', ['traffic', 'network', 'inbound', 'outbound', 'lateral movement']],
  [/SIEM|SOAR|EDR|DLP|FIM|monitor|log|alert|detect/i, '安全监测与运营', '区分数据采集、关联检测、自动响应与数据外泄控制', ['logs', 'alert', 'endpoint', 'automate', 'exfiltration']],
  [/vulnerab|penetration|CVE|CVSS|SCAP|patch/i, '漏洞管理', '题干是在识别、量化、验证利用，还是实施修复', ['scan', 'exploit', 'severity', 'patch', 'known vulnerability']],
  [/incident|contain|eradication|recovery|forensic|e.discovery|chain of custody|preserv/i, '事件响应与取证', '按照准备、检测、遏制、清除、恢复、复盘的顺序，并保持证据完整', ['first', 'next', 'evidence', 'incident', 'preserve']],
  [/risk|likelihood|impact|accept|transfer|avoid|mitigat/i, '风险管理', '把组织采取的动作映射到接受、转移、规避或缓解', ['risk', 'insurance', 'stop', 'likelihood', 'impact']],
  [/SLA|NDA|MOU|MOA|SOW|MSA|policy|standard|procedure|guideline|third.party/i, '治理、合同与第三方', '文档的约束力、内容粒度和业务目的必须对应题干', ['agreement', 'vendor', 'measurable', 'scope', 'confidential']],
  [/RTO|RPO|backup|hot site|warm site|cold site|disaster|continuity|replication/i, '业务连续性与灾难恢复', '区分可接受停机时间、数据丢失窗口和恢复站点成熟度', ['downtime', 'data loss', 'restore', 'site', 'disaster']],
  [/classification|sovereignty|tokenization|masking|DLP|data (?:at|in)|privacy/i, '数据保护', '先判断数据状态、敏感级别和监管边界，再选择保护方式', ['sensitive data', 'at rest', 'in transit', 'location', 'display']],
  [/physical|surveillance|camera|badge|fence|sensor|SCADA/i, '物理与运营技术安全', '控制需要匹配物理威胁、环境信号或工业系统约束', ['facility', 'camera', 'badge', 'temperature', 'industrial']],
  [/cloud|virtual|container|hypervisor|shared responsibility|shadow IT/i, '云与虚拟化安全', '明确服务模型中的责任边界和隔离层级', ['cloud', 'hypervisor', 'container', 'provider', 'tenant']],
];

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function lookupTerm(text) {
  const value = normalize(text);
  const matched = TERM_RULES.find(([pattern]) => pattern.test(value));
  if (!matched) return null;
  return { zh: matched[1], role: matched[2] };
}

function formatOption(option, term = lookupTerm(option?.text)) {
  if (!option) return '';
  const label = `${option.key}. ${normalize(option.text)}`;
  return term && !normalize(option.text).includes(term.zh) ? `${label}（${term.zh}）` : label;
}

function inferScenario(question) {
  const corpus = `${question.stem} ${(question.options ?? []).map((option) => option.text).join(' ')}`;
  const matched = SCENARIO_RULES.find(([pattern]) => pattern.test(corpus));
  const rule = matched ?? [null, '安全概念辨析', '把选项的典型用途逐一代入题干限制，选择层级和目标最一致的一项', []];
  const matchedClues = rule[3]
    .filter((candidate) => new RegExp(candidate, 'i').test(question.stem))
    .slice(0, 3);
  const clue = matchedClues.length ? matchedClues.join(' + ') : extractStemClue(question.stem);
  return { label: rule[1], focus: rule[2], clue };
}

function extractStemClue(stem) {
  const normalized = normalize(stem).replace(/^(which|what|a security|an organization|a company)\b/i, '').trim();
  const quoted = normalized.match(/[“"]([^”"]{3,90})[”"]/);
  if (quoted) return quoted[1];
  const marker = normalized.match(/\b(?:most likely|best|first|next|before|after|prevent|detect|ensure|reduce|protect|requires?)\b[\s\S]{0,105}/i);
  const clue = normalize(marker?.[0] ?? normalized);
  return clue.length > 125 ? `${clue.slice(0, 122).trim()}...` : clue;
}

function cleanEvidence(value, option) {
  let text = normalize(value);
  if (option) {
    const escaped = normalize(option.text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`^${option.key}[.):\\-]\\s*`, 'i'), '');
    text = text.replace(new RegExp(`^${escaped}[.):\\-]?\\s*`, 'i'), '');
  }
  return text.length > 260 ? `${text.slice(0, 257).trim()}...` : text;
}

function getEvidence(question, option, { highlyVotedOnly = false } = {}) {
  const optionEvidence = question.discussion?.optionEvidence?.[option.key] ?? [];
  const eligible = highlyVotedOnly
    ? optionEvidence.filter((item) => item.highlyVoted)
    : optionEvidence;
  const evidence = eligible.find((item) => (
    item.highlyVoted && (item.selectedAnswer ?? []).includes(option.key)
  )) ?? eligible.find((item) => item.highlyVoted)
    ?? eligible.find((item) => (item.selectedAnswer ?? []).includes(option.key))
    ?? eligible[0];
  return evidence ? cleanEvidence(evidence.text, option) : '';
}

function getConsensusEvidence(question, correctOptions) {
  for (const option of correctOptions) {
    const evidence = getEvidence(question, option);
    if (evidence) return evidence;
  }
  return cleanEvidence(question.discussion?.summary ?? '', correctOptions[0]);
}

function buildCorrectExplanation(question, option, scenario, consensusEvidence) {
  const term = lookupTerm(option.text);
  const label = formatOption(option, term);
  const concept = term
    ? `${label} 的核心是${term.role}`
    : `${label} 所描述的能力直接对应本题要求的 ${scenario.label}`;
  const evidence = getEvidence(question, option) || consensusEvidence;
  return `${concept}。题干关键线索是“${scenario.clue}”，而该选项正面满足“${scenario.focus}”这一判断标准，所以应选。${evidence ? ` Discussion evidence（讨论依据）：${evidence}` : ''}`;
}

function buildWrongExplanation(question, option, scenario, correctLabels, consensusEvidence) {
  const term = lookupTerm(option.text);
  const label = formatOption(option, term);
  const role = term
    ? `${label} 通常用于${term.role}`
    : `${label} 只有在题干明确要求它所描述的对象、动作或控制层级时才成立`;
  const ownEvidence = getEvidence(question, option, { highlyVotedOnly: true });
  const contrast = `但本题的关键线索是“${scenario.clue}”，判断重点是${scenario.focus}；${correctLabels} 对这条限制的覆盖更直接，因此该项不是 best answer（最佳答案）`;
  const discussion = ownEvidence && ownEvidence !== consensusEvidence
    ? ` Discussion contrast（讨论对照）：高赞讨论中与该项关联的观点是“${ownEvidence}”，但这没有完整覆盖上述题干限制。`
    : consensusEvidence
      ? ` Discussion evidence（讨论依据）：${consensusEvidence}`
      : '';
  return `${role}。${contrast}。${discussion}`;
}

export function buildSecurityPlusAnalysis(question) {
  const answerSet = new Set(question.answer ?? []);
  const correctOptions = (question.options ?? []).filter((option) => answerSet.has(option.key));
  const correctLabels = correctOptions.map((option) => formatOption(option)).join(' / ');
  const scenario = inferScenario(question);
  const consensusEvidence = getConsensusEvidence(question, correctOptions);
  const keywords = unique([
    ...correctOptions.flatMap((option) => {
      const term = lookupTerm(option.text);
      return [option.text, term?.zh];
    }),
    scenario.clue,
  ]);
  const optionExplanations = (question.options ?? []).map((option) => {
    const isCorrect = answerSet.has(option.key);
    const explanation = isCorrect
      ? buildCorrectExplanation(question, option, scenario, consensusEvidence)
      : buildWrongExplanation(question, option, scenario, correctLabels, consensusEvidence);
    const term = lookupTerm(option.text);
    return {
      key: option.key,
      isCorrect,
      explanation,
      explanationHtml: emphasizeKeywords(explanation, unique([option.text, term?.zh, ...keywords])),
    };
  });
  const correctExplanations = optionExplanations.filter((item) => item.isCorrect);
  const wrongExplanations = optionExplanations.filter((item) => !item.isCorrect);
  const voteText = (question.discussion?.voteDistribution ?? [])
    .slice(0, 6)
    .map((vote) => `${(vote.answer ?? []).join('')} ${vote.percent}%`)
    .join(', ');
  const official = (question.officialAnswer ?? []).join('');
  const community = (question.answer ?? []).join('');
  const conflict = official && official !== community;
  const keyPoint = `关键点：本题考查 ${scenario.label}。看到“${scenario.clue}”，先判断${scenario.focus}；答案是 ${correctLabels}。`;
  const speedTip = conflict
    ? `速通：${scenario.clue} → ${correctLabels}。本题 PDF 原始答案 ${official} 与 community consensus ${community} 有分歧，练习采用讨论高票结论。`
    : `速通：${scenario.clue} → ${correctLabels}。不要只看术语相关性，要检查选项是否直接满足题干动作、范围和先后顺序。`;
  const studyNotes = [
    `知识框架：${scenario.focus}。`,
    consensusEvidence ? `高赞讨论依据：${consensusEvidence}` : '',
    voteText ? `社区投票：${voteText}。投票用于确定练习答案，解析仍以题意和技术原理为依据。` : '',
  ].filter(Boolean);

  return {
    learning: {
      ...(question.learning ?? {}),
      keyPointHtml: emphasizeKeywords(keyPoint, keywords),
      speedTipHtml: emphasizeKeywords(speedTip, keywords),
      studyNotesHtml: studyNotes.map((note) => emphasizeKeywords(note, keywords)),
      stemHtml: emphasizeKeywords(question.stem, keywords),
      keywords,
      options: optionExplanations,
    },
    analysis: {
      source: 'security-plus',
      outline: [
        `题干情境：${scenario.clue}。`,
        `知识点：${scenario.label}；${scenario.focus}。`,
        `判断关键：把每个选项的典型用途代入题干，${correctLabels} 对限制条件的覆盖最完整。`,
      ],
      whyChoose: correctExplanations.map((item) => item.explanation).join(' '),
      whyNotChoose: wrongExplanations.map((item) => {
        const option = question.options.find((candidate) => candidate.key === item.key);
        return { key: item.key, text: option?.text ?? '', reason: item.explanation };
      }),
    },
  };
}

export function decorateSecurityPlusQuestion(question) {
  const built = buildSecurityPlusAnalysis(question);
  return { ...question, ...built };
}

export function decorateSecurityPlusQuestions(questions = []) {
  return questions.map(decorateSecurityPlusQuestion);
}
