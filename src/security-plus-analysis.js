import { emphasizeKeywords } from './learning-annotations.js';

const TERM_RULES = [
  [/\bhacktivist\b/i, '黑客行动主义者', '以政治、社会议题或意识形态为动机，通过攻击、泄露或破坏来表达立场'],
  [/\bwhistleblower\b/i, '举报人', '从组织内部披露不当行为或违法事实，重点是内部信息与揭露动机'],
  [/\borganized crime\b/i, '有组织犯罪', '依靠资金、专业分工和犯罪网络实施牟利攻击，也可能受雇执行高能力行动'],
  [/\bunskilled attacker|script kiddie\b/i, '低技能攻击者', '使用现成工具或脚本发动机会型攻击，通常缺少定制化能力与长期资源'],
  [/\bnation.state|state.sponsored\b/i, '国家级攻击者', '以国家战略、情报或地缘政治目标为导向，具备持续资源与高级能力'],
  [/\binsider threat\b/i, '内部威胁', '利用合法身份、内部知识或既有访问权限造成泄露、破坏或滥用'],
  [/^Secured zones$/i, '安全区域', '在 Zero Trust data plane（零信任数据平面）中划分并隔离资源区域，控制东西向访问'],
  [/^Subject role$/i, '主体角色', '作为 Zero Trust data plane 的策略输入，描述主体当前角色并参与访问决策'],
  [/^Adaptive identity$/i, '自适应身份', '根据风险、设备和行为动态调整身份置信度，更多属于身份与策略决策能力'],
  [/^Threat scope reduction$/i, '威胁范围缩减', '通过分段和最小权限限制攻击影响范围，是零信任带来的结果而非主体属性本身'],
  [/^Fines$/i, '罚款', '由监管机构或合同条款在违规成立后施加的经济处罚'],
  [/^Audit findings$/i, '审计发现', '记录内部或外部审计识别出的控制缺口，是评估失败最直接的产出'],
  [/^Sanctions$/i, '制裁', '由政府或权威机构实施的限制性惩罚，通常需要正式执法或监管决定'],
  [/^Reputation damage$/i, '声誉损害', '事件公开并影响客户信任后的间接业务后果，不是内部评估的直接记录'],
  [/^Non-compliance$/i, '不合规', '未满足法规、标准或政策要求，是后续罚款或制裁的原因'],
  [/^Regulatory requirement$/i, '监管要求', '由法律或监管机构强制要求组织执行审计、报告或控制'],
  [/^Self-assessment requirement$/i, '自评要求', '由组织或框架要求自行检查控制，但约束力通常低于法定监管义务'],
  [/^Automation$/i, '自动化', '用一致、可重复的脚本或工具持续执行任务，适合高频和大规模检查'],
  [/^Compliance checklist$/i, '合规检查表', '列出需要核对的控制项目，但本身不会持续检测配置是否变化'],
  [/^Manual audit$/i, '人工审计', '由人员定期检查证据，适合深入复核但不适合每日一致监控'],
  [/^Guard rail script$/i, '护栏脚本', '在自动化流程中阻止越界配置，重点是约束而不是完整创建账号'],
  [/^Ticketing workflow$/i, '工单工作流', '记录请求、审批和责任流转，但不直接配置账号权限'],
  [/^Escalation script$/i, '升级脚本', '把异常或高风险事项转交更高层处理，不负责标准账号创建'],
  [/^User provisioning(?: script)?$/i, '用户预配', '按模板自动创建、修改或停用账号与权限，保证身份生命周期配置一致'],
  [/^Security groups$/i, '安全组', '把权限赋给组并通过成员关系批量管理账号访问，减少逐用户修改'],
  [/^Version control$/i, '版本控制', '记录文档或代码每次修订、作者和差异，并支持追溯与回滚'],
  [/^Backout planning$/i, '回退规划', '在变更前定义失败时如何恢复原状态，是降低变更风险的必要步骤'],
  [/^Processor$/i, '数据处理者', '代表数据控制者按指令处理个人数据，不是数据所描述的个人'],
  [/^Custodian$/i, '数据保管者', '负责数据的日常存储、备份和技术保护，但不决定业务用途'],
  [/^Subject$/i, '数据主体', '个人数据所描述或关联的自然人，例如题干中的客户'],
  [/^Owner$/i, '数据所有者', '决定数据分类、访问要求和业务用途，并对保护要求负责'],
  [/^Private$/i, '私有数据', '只面向内部或特定个人使用，但敏感等级通常低于 confidential/restricted'],
  [/^Public$/i, '公开数据', '允许面向公众披露，泄露通常不会造成重大损害'],
  [/^Restricted$/i, '受限数据', '最高敏感等级之一，只允许严格授权人员访问并使用强化控制'],
  [/^Sanitization$/i, '介质净化', '用可重复验证的方法清除介质上的敏感数据，同时允许介质继续使用'],
  [/^Formatting$/i, '格式化', '重建文件系统结构，但数据可能仍可恢复，不等同于安全擦除'],
  [/^Degaussing$/i, '消磁', '用强磁场破坏磁性介质数据，通常会使硬盘无法继续正常使用'],
  [/^Defragmentation$/i, '磁盘碎片整理', '重排数据块以改善传统磁盘访问效率，不负责安全删除数据'],
  [/^Role-based$/i, '基于角色的访问控制', '根据岗位角色分配权限；用户未加入新角色组时就无法获得对应共享资源访问'],
  [/^Discretionary$/i, '自主访问控制', '由资源所有者自行决定谁可以访问对象'],
  [/^Time of day$/i, '按时间访问控制', '根据登录或访问发生的时间段允许或拒绝访问'],
  [/^Something you have$/i, '持有因素', '使用智能卡、硬件令牌或手机等用户持有物作为认证因素'],
  [/^Somewhere you are$/i, '位置因素', '根据地理位置或网络位置提供上下文判断，通常不属于传统三类 MFA 因素'],
  [/^PIN$/i, '个人识别码', '属于 something you know（所知因素），可与 smart card 的持有因素组成 MFA'],
  [/^Hardware token$/i, '硬件令牌', '属于 something you have（持有因素）；若已有智能卡，再加一个持有因素不形成不同类别'],
  [/^User ID$/i, '用户标识', '用于声明身份而不是证明身份，不能单独算作认证因素'],
  [/^SMS$/i, '短信验证码', '通过手机接收一次性代码，属于持有因素但存在 SIM swapping 等风险'],
  [/^SSH$/i, '安全外壳协议', '通过加密通道提供远程命令行管理，是 Telnet 的安全替代'],
  [/^HTTPS$/i, 'HTTPS', '保护 Web/HTTP 通信，不用于替代 Telnet 的通用远程命令行管理'],
  [/^SNMPv3$/i, 'SNMPv3', '用于安全监控和管理网络设备指标，不是交互式服务器 shell'],
  [/^RDP$/i, '远程桌面协议', '提供图形桌面远控；题干只要求替代 Telnet 命令行时 SSH 更直接'],
  [/^SMTP$/i, '邮件传输协议', '用于邮件服务器之间传递邮件，不提供远程系统管理'],
  [/^Red(?: team)?$/i, '红队', '模拟攻击者执行 offensive security（进攻性测试）并发现可利用路径'],
  [/^Blue(?: team)?$/i, '蓝队', '负责防御、监控、检测和事件响应'],
  [/^Purple(?: team)?$/i, '紫队', '让红队与蓝队协同，把进攻发现转化为检测和防御改进'],
  [/^Yellow(?: team)?$/i, '黄队', '通常代表开发或构建系统的一方，不是标准的红蓝协同测试队'],
  [/^White(?: team)?$/i, '白队', '在演练中制定规则、监督范围和裁决结果，不负责主要攻击执行'],
  [/^Honeytoken$/i, '诱饵令牌', '伪造账号、凭据或数据库记录；一旦被使用即可指示未授权活动'],
  [/^Honeynet$/i, '蜜网', '由多个诱饵系统组成的隔离网络，用于观察攻击路径'],
  [/^Honeyfile$/i, '诱饵文件', '放置可监控的假文件，访问或外传时触发告警'],
  [/^Production failover$/i, '生产故障切换', '真实把生产负载切换到备用电力或站点，最直接验证端到端韧性'],
  [/^Simulation testing$/i, '模拟测试', '在不实际切换生产的情况下模拟灾难流程，风险较低但证明力较弱'],
  [/^Parallel processing$/i, '并行处理', '让多个处理路径同时工作以提升容量或冗余，不等于执行故障切换测试'],
  [/^Generator$/i, '发电机', '在市电中断时持续提供备用电力，直接解决数据中心停电风险'],
  [/^Single point of failure$/i, '单点故障', '某一组件失效即可使整个关键服务中断，是遗留系统不可替换时的首要韧性风险'],
  [/^Assurance$/i, '安全保证', '向客户提供控制和开发实践有效的信心，但“正式证明”通常需要 attestation'],
  [/^Contract$/i, '合同', '规定双方义务与责任，但不是对某项安全事实本身的证明声明'],
  [/^Quantitative$/i, '定量分析', '使用金额、概率、SLE/ALE 和 exposure factor 等数值衡量风险'],
  [/^Heuristic$/i, '启发式分析', '基于经验规则判断可疑模式，不用于计算资产暴露因子'],
  [/^Security guard$/i, '保安人员', '在门禁前核验身份并阻止尾随者，能主动处理 tailgating'],
  [/^CCTV$/i, '视频监控', '记录门禁活动以供检测和调查，但通常不能当场物理阻止尾随'],
  [/^Access card$/i, '门禁卡', '验证持卡人是否获准进入，但单独使用无法阻止一人刷卡后他人尾随'],
  [/^Right.to.audit clause$/i, '审计权条款', '在合同中赋予组织检查服务商控制和绩效证据的权利'],
  [/^Supply chain analysis$/i, '供应链分析', '评估供应商、组件来源和依赖风险，但不直接赋予合同审计权'],
  [/^Certification$/i, '认证／销毁证明', '由合格主体确认某项要求已满足；介质处置中可作为销毁或净化已完成的正式证据'],
  [/^SD-WAN$/i, '软件定义广域网', '集中选择和管理多条 WAN 传输路径，改善连接与可用性，但不等同于应用层或身份安全控制'],
  [/^SDN$/i, '软件定义网络', '把控制平面与数据平面分离，通过集中控制器编排网络转发策略'],
  [/^Jailbreaking$/i, '越狱', '移除移动操作系统厂商限制，使设备能安装未批准软件并扩大攻击面'],
  [/^BPA$/i, '业务合作伙伴协议', '规定合作伙伴关系、共同目标和责任，不用于描述单次测试的技术边界'],
  [/^EAP$/i, '可扩展认证协议', '为 802.1X 等网络认证提供可插拔方法框架，具体安全性取决于 EAP 类型'],
  [/^LEAP$/i, '轻量级 EAP', 'Cisco 早期基于口令的 EAP 方法，抗离线口令攻击能力较弱'],
  [/^PEAP$/i, '受保护 EAP', '先建立 TLS 隧道，再保护内部身份认证，常用于企业无线接入'],
  [/^SSO$/i, '单点登录', '一次认证后访问多个受信应用，减少用户维护的凭据数量'],
  [/^Destruction$/i, '物理销毁', '通过粉碎、焚烧等方式使介质不可再用，适合最高敏感度但不满足复用要求'],
  [/^Analysis$/i, '分析阶段', '整理证据、判断原因和影响范围；它通常位于检测之后、处置决策之前'],
  [/^ARO$/i, '年发生率', '表示某威胁一年预计发生次数，用于 ALE = SLE × ARO 的定量风险计算'],
  [/^Recovery$/i, '恢复阶段', '在威胁清除后恢复系统、验证业务并持续监控是否复发'],
  [/^Decommissioning$/i, '退役', '按流程停止资产使用、移除访问、处理数据并更新资产记录'],
  [/^Rules of engagement$/i, '交战规则', '定义渗透测试允许的目标、时间、方法、限制和沟通升级方式'],
  [/^Resource reuse$/i, '资源复用', '存储或内存资源重新分配前残留数据未被清除，可能造成信息泄露'],
  [/^Configuration enforcement$/i, '配置强制执行', '持续把系统保持在批准基线，发现偏差后阻止或自动纠正'],
  [/^Open.source intelligence|^OSINT$/i, '开源情报', '从公开网站、社交媒体、DNS、代码仓库等合法公开来源收集情报'],
  [/^Intellectual property$/i, '知识产权', '包括设计、源代码、配方和研究成果，是研发部门常见的高价值数据'],
  [/^Critical$/i, '关键级别', '表示业务重要性或可用性要求很高，不必然等于数据机密等级最高'],
  [/^Lessons learned$/i, '经验复盘', '在事件后总结有效做法、根因和改进项，并更新计划与控制'],
  [/^GPO$/i, '组策略对象', '在 Windows 域中集中下发用户和计算机安全配置'],
  [/^Privilege escalation$/i, '权限提升', '从普通权限获得更高权限，可能利用漏洞、错误配置或被盗凭据'],
  [/^SCADA$/i, '监控与数据采集系统', '监视和控制工业过程，强调安全、可用性、实时性和遗留协议约束'],
  [/^CIA$/i, 'CIA 三元组', '以 confidentiality、integrity、availability 三项属性描述信息安全目标'],
  [/^Geographic restrictions$/i, '地理限制', '根据国家、地区或 GeoIP 限制访问，降低不应出现位置的登录风险'],
  [/^Sensor$/i, '传感器', '采集温度、运动、网络或设备状态，并把观测结果发送给监控系统'],
  [/^Disinformation$/i, '虚假信息操纵', '故意制造和传播虚假内容以影响判断；与无意错误信息不同'],
  [/^Misinformation$/i, '错误信息', '传播不准确内容但不一定具有故意欺骗意图'],
  [/^Concurrent session usage$/i, '并发会话使用', '同一账号同时出现多个会话，可能表示凭据共享或被盗用'],
  [/^DDoS(?: attack)?$/i, '分布式拒绝服务', '由大量来源耗尽目标带宽或资源，主要破坏 availability（可用性）'],
  [/^Microservices$/i, '微服务', '把应用拆成独立服务并通过 API 通信，增加服务间身份、网络和可观察性需求'],
  [/^URL scanning$/i, 'URL 扫描', '检查链接信誉、重定向和恶意内容，用于识别钓鱼或恶意站点'],
  [/^Espionage$/i, '间谍活动', '以长期窃取国家、商业或知识产权情报为目的'],
  [/^Directive$/i, '指令性控制', '通过政策或管理命令要求人员采取特定行为'],
  [/^Package monitoring$/i, '软件包监控', '跟踪依赖包、版本和漏洞，及时发现供应链或过期组件风险'],
  [/^On.path(?: attack)?$/i, '中间人／路径中攻击', '攻击者位于通信路径中监听或篡改流量，需要加密与身份验证防护'],
  [/^Journaling$/i, '日志式记录', '在变更写入前记录事务，帮助文件系统或数据库在故障后恢复一致性'],
  [/^AUP$/i, '可接受使用政策', '规定组织设备、网络和数据允许与禁止的用户行为'],
  [/^Blackmail$/i, '敲诈', '以公开敏感信息或造成损害相威胁，迫使受害者付款或执行动作'],
  [/^Active$/i, '主动侦察', '直接与目标交互扫描或探测，信息更准确但更容易被发现'],
  [/^Passive$/i, '被动侦察', '不直接接触目标，从公开或旁路来源收集信息，隐蔽性更高'],
  [/^Defensive$/i, '防御性活动', '侧重监控、加固和响应，不是主动模拟攻击者的测试方式'],
  [/^Offensive$/i, '进攻性活动', '主动模拟攻击者发现和利用弱点，用于验证真实攻击路径'],
  [/^DRP$/i, '灾难恢复计划', '规定重大中断后恢复 IT 系统、数据和基础设施的步骤'],
  [/^Incident response$/i, '事件响应', '按准备、检测、分析、遏制、清除、恢复和复盘处理安全事件'],
  [/^Threat hunting$/i, '威胁狩猎', '基于假设主动搜索尚未触发既有告警的恶意行为和 IoC'],
  [/^Partition$/i, '分区级加密', '只保护指定磁盘分区；若题干要求整台笔记本数据，full disk encryption 覆盖更完整'],
  [/^Asymmetric$/i, '非对称加密', '使用公私钥对，适合密钥交换和数字签名，但不是磁盘批量加密的首选描述'],
  [/^Hardening$/i, '系统加固', '关闭不必要服务、修补漏洞并安全配置系统，以缩小攻击面'],
  [/^Risk register$/i, '风险登记册', '记录风险描述、责任人、评分、阈值、响应措施和状态'],
  [/^Risk analysis$/i, '风险分析', '评估可能性和影响以确定风险等级，但登记册才负责持续记录风险条目'],
  [/^Bug bounty$/i, '漏洞奖励计划', '允许外部研究人员按规则测试公开资产，并按有效漏洞支付奖励'],
  [/^Capacity planning$/i, '容量规划', '估算人员、计算和存储资源以满足未来负载或中断期间的业务需求'],
  [/^Redundancy$/i, '冗余', '提供额外组件或路径以消除单点故障并提高可用性'],
  [/^Enumeration$/i, '枚举', '主动列出账号、服务、共享或资源信息，属于侦察而非数据处置'],
  [/^Inventory$/i, '资产清单', '记录资产标识、所有者和状态，不会清除介质中的敏感数据'],
  [/^Detection$/i, '检测阶段', '识别异常并确认事件是否发生，为后续分析和响应提供触发点'],
  [/^SNMP traps$/i, 'SNMP 陷阱', '设备主动发送事件通知，适合告警但不负责配置修复'],
  [/^End of life$/i, '生命周期终止', '厂商停止销售或开发产品；安全支持何时终止还需看 end of support'],
  [/^MTTR$/i, '平均修复时间', '衡量故障发生后恢复服务平均需要多久，数值越低恢复越快'],
  [/^MTBF$/i, '平均故障间隔', '衡量可修复系统两次故障之间平均运行时间，反映可靠性'],
  [/^SPF$/i, '发件人策略框架', '通过 DNS 声明哪些邮件服务器可代表域发送邮件，减少地址伪造'],
  [/^AAA$/i, '认证授权记账', '分别回答用户是谁、能做什么以及做过什么'],
  [/^ARP poisoning$/i, 'ARP 投毒', '伪造 ARP 映射把局域网流量引向攻击者，形成 on-path attack'],
  [/^Directory traversal$/i, '目录遍历', '利用 ../ 等路径输入越过应用目录边界读取未授权文件'],
  [/^DMARC$/i, '域邮件认证报告与一致性', '结合 SPF/DKIM 对齐定义邮件处理策略并提供报告'],
  [/^True positive$/i, '真阳性', '检测系统正确告警了真实恶意活动'],
  [/^True negative$/i, '真阴性', '检测系统正确地没有对正常活动告警'],
  [/^False positive$/i, '假阳性', '正常活动被错误标记为恶意，会增加调查噪声'],
  [/^False negative$/i, '假阴性', '真实恶意活动未被检测出来，直接形成漏报风险'],
  [/^Dynamic analysis$/i, '动态分析', '在受控环境运行代码并观察实际行为，能发现运行时活动'],
  [/^Replay attack$/i, '重放攻击', '截获合法认证或交易数据后再次发送以冒充有效请求'],
  [/^BCP$/i, '业务连续性计划', '确保关键业务在中断期间继续运行，不只关注 IT 系统恢复'],
  [/^Configuration auditing$/i, '配置审计', '把当前配置与批准基线或合规要求比较并记录偏差'],
  [/^Wildcard$/i, '通配符', '用 * 等符号匹配多个名称或路径，范围过宽可能扩大信任边界'],
  [/^Self.signed$/i, '自签名证书', '由主体自己签发，能加密但默认不具备受信 CA 提供的身份信任链'],
  [/^Nessus$/i, 'Nessus 漏洞扫描器', '使用插件识别主机、服务和已知漏洞，属于漏洞评估工具'],
  [/^Wireshark$/i, 'Wireshark 抓包分析器', '捕获并解析网络数据包，用于协议和流量调查'],
  [/^netcat$/i, 'Netcat 网络工具', '建立 TCP/UDP 连接、监听端口或传输数据，常用于排错和测试'],
  [/^Fuzzing$/i, '模糊测试', '向程序输入大量异常或随机数据以发现崩溃和输入处理缺陷'],
  [/^NIDS$/i, '网络入侵检测系统', '旁路监测网络流量并告警，通常不直接阻断数据包'],
  [/^Monitoring$/i, '持续监控', '持续观察系统和控制状态并发现偏差或异常'],
  [/^SASE$/i, '安全访问服务边缘', '在云端整合 SD-WAN、SWG、CASB、ZTNA 等能力保护分布式访问'],
  [/^Tailgating$/i, '尾随', '未经授权人员跟随获准人员进入受控区域，通常没有明确同意'],
  [/^Shoulder surfing$/i, '肩窥', '从旁观察屏幕或键盘以窃取口令和敏感信息'],
  [/^RFID cloning$/i, 'RFID 克隆', '复制门禁卡等 RFID 标识以冒充合法持卡人'],
  [/^Acquisition$/i, '证据采集', '按取证方法获取数据副本，并验证完整性与来源'],
  [/^Sandbox$/i, '沙箱', '在隔离环境运行可疑代码，观察行为并限制对生产系统的影响'],
  [/^IoT|Internet of Things$/i, '物联网', '由受限联网设备组成，常见风险包括默认凭据、更新不足和数据隐私'],
  [/^Business email compromise$/i, '商务邮件入侵', '冒充高管或合作伙伴诱导转账、礼品卡或敏感信息操作'],
  [/^SSH tunneling$/i, 'SSH 隧道', '通过 SSH 加密连接转发其他协议流量，可安全穿越不可信网络'],
  [/^COPE$/i, '公司所有个人启用', '设备由公司拥有，但允许员工在政策范围内进行个人使用'],
  [/^Right to be forgotten$/i, '被遗忘权', '允许数据主体请求删除不再有合法保留依据的个人数据'],
  [/^Ease of recovery$/i, '恢复便利性', '描述故障后恢复操作是否简单快速，是韧性设计的可运维属性'],
  [/^RTOS$/i, '实时操作系统', '强调确定性的任务响应时间，常用于嵌入式和工业控制环境'],
  [/^Containers?$/i, '容器', '共享主机内核隔离应用进程和依赖，比完整虚拟机更轻量'],
  [/^Default credentials$/i, '默认凭据', '厂商预设且常被公开的账号密码，部署后不修改会形成高风险入口'],
  [/^Exception$/i, '例外', '经授权暂时偏离政策或基线，并应记录范围、原因、期限和补偿控制'],
  [/^DHCP$/i, '动态主机配置协议', '自动分配 IP、网关和 DNS 等网络参数'],
  [/^Fencing$/i, '围栏', '建立可见物理边界并延迟未授权人员接近设施'],
  [/^Platform diversity$/i, '平台多样性', '使用不同技术栈降低共同漏洞导致同时失效的概率，但会增加管理复杂度'],
  [/^Impact analysis$/i, '影响分析', '评估变更、事件或风险对业务、系统和依赖的后果'],
  [/^Bollards$/i, '防撞柱', '阻止车辆接近建筑或入口，防御车辆冲撞类物理威胁'],
  [/^Privacy$/i, '隐私', '规范个人数据如何收集、使用、共享、保留和删除，强调个人权利'],
  [/^ALE$/i, '年度预期损失', '表示单项风险一年预计造成的损失，计算式为 ALE = SLE × ARO'],
  [/^SLE$/i, '单次预期损失', '表示一次事件预计造成的损失，计算式为 SLE = Asset Value × Exposure Factor'],
  [/^Recovery point objective$/i, '恢复点目标', '规定可接受的数据丢失时间窗口，影响备份和复制频率'],
  [/^Recovery time objective$/i, '恢复时间目标', '规定中断后服务必须在多长时间内恢复'],
  [/^Confidential$/i, '机密级数据', '仅限获授权且 need-to-know 的人员访问，泄露会造成显著损害'],
  [/^GDPR$/i, '欧盟通用数据保护条例', '规定个人数据处理原则以及访问、删除和被遗忘等数据主体权利'],
  [/^Baselines?$/i, '安全基线', '记录批准的最低安全配置，正确生命周期是 establish、deploy、maintain'],
  [/^Ease of deployment$/i, '部署便利性', '衡量方案安装上线是否容易，不能替代对安全和数据风险的评估'],
  [/^SQLi$/i, 'SQL 注入', '把恶意输入拼入数据库语句，导致越权查询、修改或认证绕过'],
  [/^Access badges$/i, '门禁证件', '用于识别获准进入人员并记录门禁事件，但需配合措施防止尾随'],
  [/^Supply chain$/i, '供应链', '涵盖供应商、组件、软件依赖和物流来源，需要评估假冒与第三方风险'],
  [/^Static$/i, '静态分析', '在不运行程序的情况下检查代码或二进制结构中的弱点'],
  [/^Business impact analysis$/i, '业务影响分析', '识别关键业务、依赖、最大可容忍中断和恢复优先级'],
  [/^Reporting$/i, '报告', '把事件、风险或控制结果整理给管理层和利益相关者用于决策'],
  [/^Content categorization$/i, '内容分类', '按网站或内容类别应用过滤策略，而不是逐个 URL 手工判断'],
  [/^Authorization$/i, '授权', '在身份认证后决定主体能访问哪些资源和执行哪些动作'],
  [/^Recovery site$/i, '恢复站点', '在主站点不可用时承接业务，具体恢复速度取决于 cold/warm/hot 准备程度'],
  [/^Philosophical beliefs$/i, '理念动机', '属于攻击者的意识形态动机，常与 hacktivist 等行为者相关'],
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
  [/\binput validation|input sanitization/i, '输入验证／净化', '在数据进入处理逻辑前限制格式并处理危险字符，减少注入类漏洞'],
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
  [/\bcertificate\b/i, '证书', '把主体身份与公钥绑定，并由受信任 CA 签名'],
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
  [/^Preventive$/i, '预防性控制', '在事件发生前降低其发生可能性'],
  [/^Detective$/i, '检测性控制', '发现已经发生或正在发生的异常并产生告警'],
  [/^Corrective$/i, '纠正性控制', '在事件后修复影响并恢复到正常状态'],
  [/^Deterrent$/i, '威慑性控制', '通过可见惩罚或监控预期降低攻击意愿'],
  [/^Compensating$/i, '补偿性控制', '主控制无法实施时，用替代措施达到相近风险降低效果'],
  [/^Managerial$/i, '管理性控制', '通过政策、治理、风险和人员管理来指导安全'],
  [/^Operational$/i, '运营性控制', '由人员和日常流程执行，例如培训、巡查和事件处理'],
  [/^Technical$/i, '技术性控制', '由系统、软件或硬件强制执行访问与保护规则'],
  [/^Physical$/i, '物理控制', '通过门禁、围栏、摄像头和环境设施保护人员与设备'],
  [/\bvideo surveillance\b/i, '视频监控', '记录和观察物理区域活动，主要用于威慑、检测与调查'],
  [/\bvirtualization\b/i, '虚拟化', '在共享硬件上隔离运行多个虚拟系统，提高资源利用与部署灵活性'],
  [/\bcontainerization\b/i, '容器化', '共享主机内核并隔离应用进程与依赖，通常比完整虚拟机更轻量'],
  [/\bVM escape\b/i, '虚拟机逃逸', '突破虚拟机隔离并影响 hypervisor 或其他来宾系统'],
  [/\bshadow IT\b/i, '影子 IT', '未经 IT 或安全批准使用的系统、应用和云服务，造成不可见风险'],
  [/\bMDM\b/i, '移动设备管理', '集中配置、合规检查、远程锁定或擦除移动设备'],
];

const SCENARIO_RULES = [
  [/zero trust|data plane|control plane|security concept|cia triad|least privilege|non.repudiation/i, '通用安全原则', '把题干所需属性映射到 Zero Trust、CIA triad 或访问最小化原则，不能只凭术语相关性作答', ['zero trust', 'data plane', 'security concept', 'least privilege', 'critical systems']],
  [/pci dss|gdpr|compliance|non.compliance|regulatory|audit|legal hold|right.to.audit|service provider|vendor controls/i, '合规、审计与证据义务', '区分审计产生的 finding（发现）、违规原因、监管处罚，以及合同赋予的检查权', ['internal', 'assessment', 'regulatory', 'audit', 'legal hold', 'right to be forgotten', 'service provider']],
  [/automate|automation|script|provision|baseline|version control|change must|design change|backout/i, '安全自动化与变更控制', '重复任务应标准化自动执行；变更必须经过建立基线、审批、部署、维护和回退规划', ['daily basis', 'manually', 'streamline', 'automate', 'revisions', 'baseline', 'design change']],
  [/data role|data subject|customer data|right to be forgotten|data classif|sensitive data|wipe sensitive|hard drives|data removal|fileshare|job postings|shared with the general public/i, '数据治理与生命周期', '区分数据主体、所有者、处理者和保管者，并按敏感等级及介质生命周期选择控制', ['customer', 'right to be forgotten', 'need to know', 'classified', 'wipe', 'reused', 'sensitive data', 'job postings', 'general public']],
  [/red team|blue team|purple team|offensive and defensive|offensive security assessment/i, '安全测试团队职责', 'Red team 负责进攻、Blue team 负责防御，Purple team 负责把双方能力协同起来', ['offensive and defensive', 'offensive security', 'critical systems', 'penetration testing']],
  [/mfa|smart card|authentication factor|access control|permissions|shared folders|new group|security groups/i, '身份、认证因素与授权', '先判断题干是在验证身份、组合不同 MFA 因素，还是根据角色/组授予资源权限', ['factor', 'smart card', 'permissions', 'shared folders', 'group', 'access']],
  [/telnet|remote development|insecure protocols|remote access to this server/i, '安全远程管理协议', '根据管理方式选择安全协议：命令行用 SSH，Web 用 HTTPS，图形桌面才用 RDP', ['telnet', 'insecure protocols', 'remote access', 'server']],
  [/resilien|power failure|power outage|failover|single point of failure|legacy system|only data center/i, '韧性与单点故障', '识别导致业务整体中断的单点，并用真实故障切换、备用电力或冗余路径验证和消除它', ['power failure', 'power outage', 'failover', 'single point of failure', 'only data center']],
  [/honeytoken|honeynet|honeypot|honeyfile|created as a trap|trap for malicious/i, '欺骗与诱饵技术', '根据诱饵载体区分假账号/凭据、假文件、单台蜜罐和蜜网', ['user account', 'trap', 'database', 'malicious activity']],
  [/tailgating|access control vestibule|security guard|cctv/i, '物理门禁与尾随防护', '门禁凭据只能验证刷卡者；防止 tailgating 还需要能核验并主动阻止第二人的控制', ['tailgating', 'access control vestibule', 'prevention']],
  [/iot|scada|industrial|operational technology/i, 'IoT 与运营技术风险', '低成本设备需要重点检查数据去向、供应链、默认配置和厂商支持，而不是只看部署便利性', ['low-cost', 'IoT', 'infrastructure', 'storage of data']],
  [/attestation|proving to a customer|secure coding|assurance/i, '保证与证明', '区分提供信心的 assurance 与对具体事实作出可验证声明的 attestation', ['proving', 'customer', 'trained', 'secure coding']],
  [/exposure factor|quantitative|annualized|single loss expectancy/i, '定量风险分析', '需要数值衡量资产损失比例或金额时使用 quantitative analysis，并关联 EF、SLE 和 ALE', ['measure', 'exposure factor', 'assets']],
  [/threat actor|foreign government|motivation|hacktivist|insider/i, '威胁行为者与动机', '攻击者的资源、访问位置、动机和目标必须同时匹配', ['foreign government', 'critical systems', 'motivation', 'insider']],
  [/phishing|smishing|vishing|pretext|impersonat|social engineering|watering.hole/i, '社会工程', '传播渠道、冒充方式和目标人群决定具体攻击类型', ['email', 'text message', 'phone', 'executive', 'frequently visits']],
  [/password|credential|authentication|multifactor|biometric|SAML|RADIUS|LDAP/i, '身份与访问管理', '先区分认证、授权和联邦，再匹配题干要求的因素或协议', ['password', 'credentials', 'authentication', 'single sign-on', 'factor']],
  [/hash|salt|encryption|certificate|public key|private key|signature|cryptograph|\bFDE\b|lost.*device|unable to read.*drive/i, '密码学与 PKI', '区分机密性、完整性、身份验证以及操作发生在变换之前还是之后', ['one-way', 'before', 'public key', 'private key', 'certificate', 'at rest', 'lost', 'drive']],
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

const OPTION_ROLE_RULES = [
  [/access.?list|\bACL\b|\bpermit\b.*\bdeny\b|\bdeny\b.*\bpermit\b/i, 'ACL 访问控制规则', '按 inbound/outbound、source、destination、permit/deny 和端口逐字段匹配流量，规则方向或地址位置错误就会放错对象'],
  [/\b(?:policy|standard|procedure|guideline|plan)\b/i, '治理文档或计划', '定义组织要求、执行步骤或应急安排；必须根据题干需要的约束层级和具体程度选择'],
  [/\b(?:agreement|contract|clause|SOW|terms)\b/i, '合同或协议条款', '记录双方责任、工作范围或可执行权利；需检查题干是在要服务指标、保密义务、交付范围还是审计权'],
  [/\b(?:log|logs|logging|packet capture|metadata)\b/i, '日志或遥测数据源', '提供特定层级的活动证据；应选择能直接观察题干目标对象的数据源'],
  [/\b(?:report|dashboard|metrics|KPI|KRI)\b/i, '报告与安全指标', '把运营数据汇总为管理层可理解的趋势、数量或风险指标，而不是直接实施技术控制'],
  [/\b(?:script|workflow|automation|automated)\b/i, '自动化流程', '把重复步骤编码为一致流程；关键是它是否直接执行题干要求的创建、检查、升级或约束动作'],
  [/\b(?:training|awareness|reminder|documentation)\b/i, '培训或文档措施', '通过知识传递改变人员行为或保存操作依据，适用于人的风险与流程一致性问题'],
  [/\b(?:deploy|implement|configure|enable|install|apply)\b/i, '实施型控制', '直接部署或启用一项控制；应确认它作用在正确层级并能处理题干中的具体威胁'],
  [/\b(?:disable|remove|delete|cancel|revoke|block|deny)\b/i, '限制或移除动作', '通过关闭、撤销或阻断来降低暴露；必须确认被限制的对象正是风险来源'],
  [/\b(?:update|upgrade|patch|change|replace|restart)\b/i, '变更或修复动作', '改变现有系统状态；只有已定位对应组件且满足变更顺序时才应优先执行'],
  [/\b(?:conduct|perform|review|audit|assess|analy[sz]e|investigat|test)\b/i, '检查或评估动作', '收集并验证信息以缩小范围；要看题干需要识别、证明、合规审查还是实际利用验证'],
  [/^Retain\b|\bretention\b/i, '记录保留措施', '按指定范围和期限保存数据；legal hold 要覆盖所有相关资料并持续到法务解除，而不是任意固定天数'],
  [/\b(?:encrypt|protect|secure|isolate|segment|air gap)\b/i, '保护或隔离措施', '通过机密性、隔离或暴露面控制降低风险；应与题干的数据状态和信任边界一致'],
  [/\b(?:recover|restore|backup|failover|replicate)\b/i, '恢复与韧性措施', '在故障后恢复数据或服务；需对应 RTO、RPO、单点故障以及是否真实切换生产'],
  [/\b(?:monitor|detect|alert|scan|observe)\b/i, '检测与监控措施', '持续发现异常或弱点并产生证据，但未必能直接预防或阻断攻击'],
  [/\b(?:respond|contain|eradicate|quarantine|escalate)\b/i, '事件响应动作', '在事件阶段限制影响、清除原因或升级处置；顺序必须符合当前事件状态'],
  [/\b(?:account|user|identity|group|permission|role)\b/i, '身份与权限对象', '描述账号、组、角色或权限关系；应根据认证、授权或生命周期管理的具体需求判断'],
  [/\b(?:data|file|database|drive|disk|storage)\b/i, '数据或存储控制', '作用于数据内容、存储介质或数据库；需要结合数据状态、敏感等级和是否继续复用介质判断'],
  [/\b(?:server|endpoint|device|host|workstation|mobile)\b/i, '系统或端点控制', '作用于特定主机或设备；必须确认题干风险发生在该端点层而不是网络、身份或应用层'],
  [/\b(?:network|subnet|route|traffic|port|protocol|DNS|IP address)\b/i, '网络或协议控制', '作用于通信路径、地址、端口或协议；需要匹配流量方向、管理方式和安全属性'],
  [/\b(?:application|software|code|SDLC|repository)\b/i, '应用与软件控制', '作用于代码、软件供应或开发生命周期；应对应漏洞成因或发布阶段'],
  [/\b(?:physical|camera|badge|card|guard|facility|door)\b/i, '物理安全控制', '作用于设施进入、人员核验或现场监控；需区分预防、检测和事后取证'],
  [/\b(?:certificate|key|token|TPM|HSM|ECC|TLS)\b/i, '密码学材料或组件', '用于密钥保护、身份验证或安全通信；必须区分密钥存储、算法和传输协议'],
  [/\b(?:finding|violation|requirement|damage|cost|complexity)\b/i, '治理结果或约束', '描述评估结果、义务或业务影响；应根据题干问的是直接结果、根因还是间接后果判断'],
];

function normalize(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

const OPTION_FOCUS_STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'been', 'by', 'for', 'from', 'in', 'is',
  'it', 'of', 'on', 'or', 'should', 'that', 'the', 'their', 'this', 'to', 'using', 'with',
  'will', 'would', 'company', 'organization', 'following',
]);

function extractOptionFocus(value) {
  const tokens = normalize(value)
    .match(/[A-Za-z][A-Za-z0-9+./:-]*/g)
    ?.filter((token) => !OPTION_FOCUS_STOP_WORDS.has(token.toLowerCase()) && token.length > 2)
    .slice(0, 5) ?? [];
  return tokens.length ? tokens.join(' / ') : normalize(value);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function lookupTerm(text) {
  const value = normalize(text);
  const matched = TERM_RULES.find(([pattern]) => pattern.test(value));
  if (matched) return { zh: matched[1], role: matched[2], source: 'term' };
  const roleMatched = OPTION_ROLE_RULES.find(([pattern]) => pattern.test(value));
  if (roleMatched) return { zh: roleMatched[1], role: roleMatched[2], source: 'role' };
  return {
    zh: '场景型选项',
    role: `主要聚焦 ${extractOptionFocus(value)} 相关的对象或动作；它成立的前提是题干确实要求这一对象、控制层级和执行时机`,
    source: 'fallback',
  };
}

function formatOption(option, term = lookupTerm(option?.text)) {
  if (!option) return '';
  const label = `${option.key}. ${normalize(option.text)}`;
  return term?.source !== 'fallback' && !normalize(option.text).includes(term.zh)
    ? `${label}（${term.zh}）`
    : label;
}

function inferScenario(question) {
  const stem = normalize(question.stem);
  const answerSet = new Set(question.answer ?? []);
  const answerCorpus = (question.options ?? [])
    .filter((option) => answerSet.has(option.key))
    .map((option) => option.text)
    .join(' ');
  const corpus = `${stem} ${(question.options ?? []).map((option) => option.text).join(' ')}`;
  const matched = SCENARIO_RULES.find(([pattern]) => pattern.test(stem))
    ?? SCENARIO_RULES.find(([pattern]) => pattern.test(answerCorpus))
    ?? SCENARIO_RULES.find(([pattern]) => pattern.test(corpus));
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

function getEvidence(question, option, { stripOptionLabel = true } = {}) {
  const eligible = question.discussion?.optionAnalysisEvidence?.[option.key] ?? [];
  const evidence = eligible.find((item) => (
    item.highlyVoted && (item.selectedAnswer ?? []).includes(option.key)
  )) ?? eligible.find((item) => item.highlyVoted)
    ?? eligible.find((item) => (item.selectedAnswer ?? []).includes(option.key))
    ?? eligible[0];
  return evidence ? cleanEvidence(evidence.text, stripOptionLabel ? option : null) : '';
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

function buildWrongExplanation(question, option, scenario, correctLabels) {
  const term = lookupTerm(option.text);
  const label = formatOption(option, term);
  const role = term
    ? `${label} 通常用于${term.role}`
    : `${label} 只有在题干明确要求它所描述的对象、动作或控制层级时才成立`;
  const ownEvidence = getEvidence(question, option, { stripOptionLabel: false });
  const contrast = `但本题的关键线索是“${scenario.clue}”，判断重点是${scenario.focus}；${correctLabels} 对这条限制的覆盖更直接，因此该项不是 best answer（最佳答案）`;
  const discussion = ownEvidence
    ? ` Discussion contrast（讨论对照）：支持正确答案的讨论在比较该项时指出“${ownEvidence}”；结合上述题干限制，它仍不如 ${correctLabels} 直接。`
    : '';
  return `${role}。${contrast}。${discussion}`;
}

function compactRole(value, limit = 72) {
  const role = normalize(value).replace(/[。；].*$/, '');
  return role.length > limit ? `${role.slice(0, limit - 3).trim()}...` : role;
}

function buildConceptNote(options) {
  return options
    .map((option) => {
      const term = lookupTerm(option.text);
      return `${formatOption(option, term)}：${term.role}`;
    })
    .join('；');
}

function buildDistractorNote(question, answerSet) {
  return (question.options ?? [])
    .filter((option) => !answerSet.has(option.key))
    .slice(0, 4)
    .map((option) => {
      const term = lookupTerm(option.text);
      return `${formatOption(option, term)} → ${compactRole(term.role, 58)}`;
    })
    .join('；');
}

function buildRelatedNote(relatedQuestions) {
  if (!relatedQuestions?.length) return '';
  return relatedQuestions
    .map((related) => `Q${related.id}「${related.clue}」→ ${related.answer}`)
    .join('；');
}

function buildQuestionMeta(question) {
  const scenario = inferScenario(question);
  const answerSet = new Set(question.answer ?? []);
  const correctOptions = (question.options ?? []).filter((option) => answerSet.has(option.key));
  return {
    question,
    scenario,
    answerTexts: correctOptions.map((option) => normalize(option.text).toLowerCase()),
    answerConcepts: correctOptions.flatMap((option) => {
      const term = lookupTerm(option.text);
      return term.source === 'fallback' ? [] : [term.zh];
    }),
    stemTokens: new Set(
      (normalize(question.stem).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? [])
        .filter((token) => !OPTION_FOCUS_STOP_WORDS.has(token)),
    ),
    answerLabel: correctOptions.map((option) => formatOption(option)).join(' / '),
  };
}

function buildRelatedQuestions(meta, allMeta) {
  return allMeta
    .filter((candidate) => candidate.question.id !== meta.question.id)
    .map((candidate) => {
      const sharedAnswer = candidate.answerTexts.some((text) => meta.answerTexts.includes(text));
      const sharedConcept = candidate.answerConcepts.some((concept) => meta.answerConcepts.includes(concept));
      const sameScenario = candidate.scenario.label === meta.scenario.label;
      const sharedStemTokens = [...candidate.stemTokens]
        .filter((token) => meta.stemTokens.has(token)).length;
      const score = (sharedAnswer ? 8 : 0)
        + (sharedConcept ? 4 : 0)
        + (sameScenario ? 2 : 0)
        + Math.min(sharedStemTokens, 4);
      return { candidate, score };
    })
    .filter((item) => item.score >= 2)
    .sort((left, right) => right.score - left.score || left.candidate.question.id - right.candidate.question.id)
    .slice(0, 2)
    .map(({ candidate }) => ({
      id: candidate.question.id,
      clue: candidate.scenario.clue,
      answer: candidate.answerLabel,
    }));
}

export function buildSecurityPlusAnalysis(question, { relatedQuestions = [] } = {}) {
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
      : buildWrongExplanation(question, option, scenario, correctLabels);
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
  const official = (question.officialAnswer ?? []).join('');
  const community = (question.answer ?? []).join('');
  const conflict = official && official !== community;
  const correctConcept = buildConceptNote(correctOptions);
  const distractorNote = buildDistractorNote(question, answerSet);
  const relatedNote = buildRelatedNote(relatedQuestions);
  const speedContrast = wrongExplanations
    .slice(0, 2)
    .map((item) => {
      const option = question.options.find((candidate) => candidate.key === item.key);
      const term = lookupTerm(option?.text);
      return `${item.key} 偏向${compactRole(term?.role, 38)}`;
    })
    .join('；');
  const keyPoint = `关键点：本题不是只认 ${scenario.label} 术语，而是要抓住“${scenario.clue}”这条限制。${scenario.focus}；${correctConcept}，因此选 ${correctLabels}。`;
  const speedTip = `速通：看到“${scenario.clue}”→ 先锁定 ${correctLabels} 的核心作用；${speedContrast || '再按作用对象、控制层级和执行时机排除其余选项'}。${conflict ? ` 本题 PDF 原始答案 ${official} 与 community consensus ${community} 有分歧，按题意与高赞讨论采用 ${community}。` : ''}`;
  const studyNotes = [
    `概念定位 Concept：${correctConcept}。`,
    distractorNote ? `易混对比 Compare：${distractorNote}。` : '',
    consensusEvidence ? `讨论校验 Discussion：${consensusEvidence}` : '',
    relatedNote ? `题库关联 Related questions：${relatedNote}。` : '',
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

export function decorateSecurityPlusQuestion(question, context = {}) {
  const built = buildSecurityPlusAnalysis(question, context);
  return { ...question, ...built };
}

export function decorateSecurityPlusQuestions(questions = []) {
  const metadata = questions.map(buildQuestionMeta);
  return metadata.map((meta) => decorateSecurityPlusQuestion(meta.question, {
    relatedQuestions: buildRelatedQuestions(meta, metadata),
  }));
}
