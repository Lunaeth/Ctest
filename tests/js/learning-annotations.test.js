import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  applyLearningAnnotations,
  buildLearningAnnotation,
  emphasizeKeywords,
} from '../../src/learning-annotations.js';
import { applyStoredCore2Analyses } from '../../src/core2-analysis.js';
import { sanitizeQuestionBankData } from '../../src/question-bank-sanitizer.js';

const dhcpQuestion = {
  id: 201,
  topic: 'Networking',
  stem: 'A laptop receives an APIPA address. Which service should the technician check first?',
  options: [
    { key: 'A', text: 'DHCP' },
    { key: 'B', text: 'DNS' },
    { key: 'C', text: 'VPN' },
  ],
  answer: ['A'],
  type: 'single',
};

const printerQuestion = {
  id: 1,
  topic: 'Topic 1',
  stem: 'A technician is troubleshooting an all-in-one laser printer that prints a vertical line when making copies and scans. When users print or receive faxes, the output from the printer is correct. Which of the following should the technician examine to determine the cause of the issue?',
  options: [
    { key: 'A', text: 'The pickup rollers' },
    { key: 'B', text: 'The corona wire' },
    { key: 'C', text: 'The document feeder' },
    { key: 'D', text: 'The drum assembly' },
  ],
  answer: ['C'],
  type: 'single',
};

const modularPowerQuestion = {
  id: 9,
  topic: 'Topic 1',
  stem: 'A technician needs to select PC components with a minimal number of visible internal cables. Which of the following should the technician use?',
  options: [
    { key: 'A', text: 'SATA drive connections' },
    { key: 'B', text: 'Liquid cooling' },
    { key: 'C', text: 'Modular power supply' },
    { key: 'D', text: 'Wireless NIC' },
  ],
  answer: ['C'],
  type: 'single',
};

const syslogQuestion = {
  id: 6,
  topic: 'Topic 1',
  stem: 'Which of the following servers is used to collect data and information about events from a network-connected host?',
  options: [
    { key: 'A', text: 'DNS' },
    { key: 'B', text: 'Mail' },
    { key: 'C', text: 'Print' },
    { key: 'D', text: 'Syslog' },
  ],
  answer: ['D'],
  type: 'single',
};

const crowdedWirelessQuestion = {
  id: 295,
  topic: 'Topic 1',
  stem: 'A consultant is assessing the wireless configurations for a small office. The existing equipment uses WEP encryption and operates on the default channel. The office is in a crowded urban area with many nearby networks. Which of the following is the best way to improve the wireless network performance?',
  options: [
    { key: 'A', text: 'Replacing the access point' },
    { key: 'B', text: 'Disabling SSID broadcasting' },
    { key: 'C', text: 'Enabling MAC address filtering' },
    { key: 'D', text: 'Updating the firmware' },
  ],
  answer: ['A'],
  type: 'single',
};

const dotMatrixMultipartQuestion = {
  id: 172,
  topic: 'Topic 1',
  stem: 'A customer uses multipart forms in a dot matrix printer. They report that nothing prints on the top page of the multipart form, but the bottom pages print fine. Which of the following should a technician do to resolve the issue?',
  options: [
    { key: 'A', text: 'Clean the printhead.' },
    { key: 'B', text: 'Install a maintenance kit.' },
    { key: 'C', text: 'Replace the ribbon.' },
    { key: 'D', text: 'Check for broken pins.' },
  ],
  answer: ['C'],
  type: 'single',
};

const staticPrinterIpQuestion = {
  id: 293,
  topic: 'Topic 1',
  stem: 'An administrator is configuring a SOHO network. The network scope requires static IP addresses for printers. Which of the following must the administrator set manually? (Choose two.)',
  options: [
    { key: 'A', text: 'DHCP' },
    { key: 'B', text: 'Subnet mask' },
    { key: 'C', text: 'Default gateway' },
    { key: 'D', text: 'DNS' },
    { key: 'E', text: 'Reservations' },
    { key: 'F', text: 'Exclusions' },
  ],
  answer: ['B', 'C'],
  type: 'multiple',
};

const unlabeledNetworkConnectionQuestion = {
  id: 265,
  topic: 'Topic 1',
  stem: 'Which of the following tools will a technician most likely use to identify an unlabeled network connection?',
  options: [
    { key: 'A', text: 'Network tap' },
    { key: 'B', text: 'Loopback plug' },
    { key: 'C', text: 'Cable tester' },
    { key: 'D', text: 'Toner probe' },
  ],
  answer: ['D'],
  type: 'single',
};

test('emphasizeKeywords escapes text before adding bold markers', () => {
  const html = emphasizeKeywords('Use DHCP before <script>', ['DHCP']);

  assert.equal(html, 'Use <strong>DHCP</strong> before &lt;script&gt;');
});

test('buildLearningAnnotation marks stem keywords and option explanations', () => {
  const annotation = buildLearningAnnotation(dhcpQuestion);
  const correct = annotation.options.find((item) => item.key === 'A');
  const wrong = annotation.options.find((item) => item.key === 'B');

  assert.match(annotation.stemHtml, /<strong>APIPA<\/strong>/);
  assert.match(annotation.keyPointHtml, /<strong>DHCP<\/strong>/);
  assert.equal(correct.isCorrect, true);
  assert.equal(wrong.isCorrect, false);
  assert.match(correct.explanation, /DHCP/);
  assert.match(correct.explanation, /动态主机配置协议/);
  assert.match(wrong.explanation, /DNS/);
  assert.match(wrong.explanation, /不是最佳答案/);
});

test('buildLearningAnnotation adds exam-focused printer study notes', () => {
  const annotation = buildLearningAnnotation(printerQuestion);
  const correct = annotation.options.find((item) => item.key === 'C');
  const drum = annotation.options.find((item) => item.key === 'D');

  assert.match(annotation.keyPointHtml, /document feeder/);
  assert.match(annotation.speedTipHtml, /print<\/strong>\/<strong>fax<\/strong> 正常/);
  assert.equal(annotation.studyNotesHtml.length, 4);
  assert.match(annotation.studyNotesHtml.join(' '), /laser <strong>printer<\/strong>/);
  assert.match(annotation.studyNotesHtml.join(' '), /Print Spooler/);
  assert.match(correct.explanation, /scan/);
  assert.match(correct.explanation, /scanner glass/);
  assert.match(correct.explanation, /自动送稿器/);
  assert.match(drum.explanation, /print 通常也会异常/);
});

test('buildLearningAnnotation explains modular power supply cable-management questions', () => {
  const annotation = buildLearningAnnotation(modularPowerQuestion);
  const correct = annotation.options.find((item) => item.key === 'C');
  const wirelessNic = annotation.options.find((item) => item.key === 'D');

  assert.match(correct.explanation, /只接需要的电源线/);
  assert.match(correct.explanation, /visible internal cables/);
  assert.match(wirelessNic.explanation, /不负责机箱内电源\/数据线理线/);
  assert.doesNotMatch(correct.explanation, /直接解决题干给出的限制/);
});

test('buildLearningAnnotation does not misclassify Syslog server questions as printer troubleshooting', () => {
  const annotation = buildLearningAnnotation(syslogQuestion);
  const syslog = annotation.options.find((item) => item.key === 'D');
  const print = annotation.options.find((item) => item.key === 'C');

  assert.match(syslog.explanation, /集中收集 network hosts/);
  assert.match(syslog.explanation, /event logs/);
  assert.match(print.explanation, /打印服务器/);
  assert.doesNotMatch(syslog.explanation, /不是本题最直接的故障点/);
});

test('buildLearningAnnotation explains crowded wireless performance without treating MAC filtering as projector filtering', () => {
  const annotation = buildLearningAnnotation(crowdedWirelessQuestion);
  const accessPoint = annotation.options.find((item) => item.key === 'A');
  const macFiltering = annotation.options.find((item) => item.key === 'C');
  const firmware = annotation.options.find((item) => item.key === 'D');

  assert.match(annotation.keyPointHtml, /default channel/);
  assert.match(annotation.keyPointHtml, /MAC address filtering/);
  assert.match(accessPoint.explanation, /选项不完美/);
  assert.match(accessPoint.explanation, /change the wireless channel/);
  assert.match(macFiltering.explanation, /access control/);
  assert.match(macFiltering.explanation, /wireless performance/);
  assert.doesNotMatch(macFiltering.explanation, /projector filter/);
  assert.doesNotMatch(macFiltering.explanation, /投影仪/);
  assert.match(firmware.explanation, /firmware bug/);
});

test('buildLearningAnnotation explains dot matrix multipart forms without treating broken pins as connector pins', () => {
  const annotation = buildLearningAnnotation(dotMatrixMultipartQuestion);
  const ribbon = annotation.options.find((item) => item.key === 'C');
  const brokenPins = annotation.options.find((item) => item.key === 'D');

  assert.match(annotation.keyPointHtml, /dot matrix/);
  assert.match(annotation.keyPointHtml, /printer/);
  assert.match(annotation.keyPointHtml, /print.*head pins/);
  assert.match(ribbon.explanation, /top page/);
  assert.match(ribbon.explanation, /bottom pages print fine/);
  assert.match(ribbon.explanation, /carbonless copy layer/);
  assert.match(ribbon.explanation, /不是“后面还有色带墨”/);
  assert.match(brokenPins.explanation, /dot matrix printhead pins/);
  assert.match(brokenPins.explanation, /missing dots\/columns/);
  assert.doesNotMatch(brokenPins.explanation, /连接器/);
});

test('buildLearningAnnotation explains static printer IP manual settings versus DHCP scope settings', () => {
  const annotation = buildLearningAnnotation(staticPrinterIpQuestion);
  const subnetMask = annotation.options.find((item) => item.key === 'B');
  const gateway = annotation.options.find((item) => item.key === 'C');
  const dns = annotation.options.find((item) => item.key === 'D');
  const reservation = annotation.options.find((item) => item.key === 'E');
  const exclusion = annotation.options.find((item) => item.key === 'F');

  assert.match(annotation.keyPointHtml, /static/);
  assert.match(annotation.keyPointHtml, /IP/);
  assert.match(annotation.keyPointHtml, /Reservations\/Exclusions/);
  assert.match(subnetMask.explanation, /local subnet/);
  assert.match(subnetMask.explanation, /DHCP 自动配置时会下发/);
  assert.match(gateway.explanation, /本地子网外/);
  assert.match(dns.explanation, /IP address、subnet mask、default gateway/);
  assert.match(reservation.explanation, /固定地址但仍用 DHCP/);
  assert.match(exclusion.explanation, /DHCP scope/);
  assert.match(exclusion.explanation, /不是打印机必须手动设置/);
});

test('buildLearningAnnotation explains Core 2 question 265 as ESD wrist strap grounding', () => {
  const questions = JSON.parse(fs.readFileSync('./data/questions.core2.json', 'utf8'));
  const question = questions.find((item) => item.id === 265);
  const annotation = buildLearningAnnotation(question);
  const replicate = annotation.options.find((item) => item.key === 'A');
  const increase = annotation.options.find((item) => item.key === 'B');
  const ground = annotation.options.find((item) => item.key === 'C');
  const store = annotation.options.find((item) => item.key === 'D');
  const keyPointText = annotation.keyPointHtml.replace(/<[^>]+>/g, '');
  const speedTipText = annotation.speedTipHtml.replace(/<[^>]+>/g, '');
  const studyNotesText = annotation.studyNotesHtml.join(' ').replace(/<[^>]+>/g, '');

  assert.match(question.stem, /wrist strap/);
  assert.match(keyPointText, /wrist strap/);
  assert.match(keyPointText, /ground electrostatic charge/);
  assert.doesNotMatch(keyPointText, /static IP/);
  assert.match(speedTipText, /ground electrostatic charge/);
  assert.match(studyNotesText, /ESD/);
  assert.doesNotMatch(studyNotesText, /DIMM/);
  assert.match(ground.explanation, /接地静电荷/);
  assert.match(ground.explanation, /损坏 RAM/);
  assert.match(replicate.explanation, /不是防静电手环的作用/);
  assert.match(increase.explanation, /正好相反/);
  assert.match(store.explanation, /不是 capacitor\/battery/);
});

test('buildLearningAnnotation explains toner probe as cable tracing instead of printer toner', () => {
  const annotation = buildLearningAnnotation(unlabeledNetworkConnectionQuestion);
  const tap = annotation.options.find((item) => item.key === 'A');
  const loopback = annotation.options.find((item) => item.key === 'B');
  const cableTester = annotation.options.find((item) => item.key === 'C');
  const tonerProbe = annotation.options.find((item) => item.key === 'D');
  const studyNotesText = annotation.studyNotesHtml.join(' ').replace(/<[^>]+>/g, '');

  assert.match(annotation.keyPointHtml, /unlabeled network connection/);
  assert.match(annotation.keyPointHtml, /toner probe/);
  assert.match(annotation.speedTipHtml, /unlabeled\/identify\/trace/);
  assert.match(studyNotesText, /cable toner/);
  assert.match(tap.explanation, /packet capture/);
  assert.match(loopback.explanation, /NIC/);
  assert.match(cableTester.explanation, /线好不好/);
  assert.match(cableTester.explanation, /trace cable/);
  assert.match(tonerProbe.explanation, /tone generator/);
  assert.match(tonerProbe.explanation, /patch panel/);
  assert.match(tonerProbe.explanation, /不是 printer toner/);
  assert.doesNotMatch(tonerProbe.explanation, /碳粉盒/);
});

test('buildLearningAnnotation explains display question 265 as Layer 3 switch inter-VLAN routing', () => {
  const questions = JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'));
  const displayQuestion = questions[264];
  const annotation = buildLearningAnnotation(displayQuestion);
  const waf = annotation.options.find((item) => item.key === 'A');
  const ddos = annotation.options.find((item) => item.key === 'B');
  const layer3Switch = annotation.options.find((item) => item.key === 'C');
  const router = annotation.options.find((item) => item.key === 'D');
  const studyNotesText = annotation.studyNotesHtml.join(' ').replace(/<[^>]+>/g, '');

  assert.equal(displayQuestion.id, 269);
  assert.match(displayQuestion.stem, /multiple VLANs/);
  assert.match(annotation.keyPointHtml, /Layer 3/);
  assert.match(annotation.speedTipHtml, /wire speed\/minimum hardware/);
  assert.match(studyNotesText, /inter-VLAN routing/);
  assert.match(waf.explanation, /Web application firewall/);
  assert.match(waf.explanation, /不负责让多个 VLAN/);
  assert.match(ddos.explanation, /DDoS 防护设备/);
  assert.match(layer3Switch.explanation, /switching/);
  assert.match(layer3Switch.explanation, /routing/);
  assert.match(layer3Switch.explanation, /ASIC/);
  assert.match(router.explanation, /minimum hardware/);
  assert.match(router.explanation, /wire speed/);
  assert.match(router.explanation, /Layer 3 switch 比普通 router/);
});

test('current Core 1 mistake explanations include speed tips and study notes', () => {
  const questions = JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'));
  const currentMistakeIds = [
    338, 238, 295, 61, 172, 329, 333, 14, 287, 58,
    268, 319, 293, 134, 94, 265, 88, 356, 301, 142,
    343, 90, 49, 106, 193,
  ];
  const missing = currentMistakeIds.flatMap((id) => {
    const question = questions.find((item) => item.id === id);
    const annotation = buildLearningAnnotation(question);
    return annotation.speedTipHtml && annotation.studyNotesHtml.length >= 2
      ? []
      : [`${id}: speed=${Boolean(annotation.speedTipHtml)} notes=${annotation.studyNotesHtml.length}`];
  });

  assert.deepEqual(missing, []);
});

test('all Core 1 questions include mistake-ready speed tips and study notes', () => {
  const questions = JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'));
  const missing = questions.flatMap((question) => {
    const annotation = buildLearningAnnotation(question);
    return annotation.speedTipHtml && annotation.studyNotesHtml.length >= 2
      ? []
      : [`${question.id}: speed=${Boolean(annotation.speedTipHtml)} notes=${annotation.studyNotesHtml.length}`];
  });

  assert.deepEqual(missing, []);
});

test('all Core 2 questions include mistake-ready speed tips and study notes', () => {
  const questions = sanitizeQuestionBankData(
    JSON.parse(fs.readFileSync('./data/questions.core2.json', 'utf8')),
  );
  const analysisRecords = sanitizeQuestionBankData([
    ...JSON.parse(fs.readFileSync('./data/questions.core2.analysis.json', 'utf8')),
    ...JSON.parse(fs.readFileSync('./data/questions.core2.curated.analysis.json', 'utf8')),
  ]);
  const hydrated = applyLearningAnnotations(
    applyStoredCore2Analyses(questions, analysisRecords),
    { bankId: 'core2' },
  );
  const missing = hydrated.flatMap((question) => (
    question.learning?.speedTipHtml && question.learning?.studyNotesHtml?.length >= 2
      ? []
      : [`${question.id}: speed=${Boolean(question.learning?.speedTipHtml)} notes=${question.learning?.studyNotesHtml?.length ?? 0}`]
  ));
  const remoteSupportQuestion = hydrated.find((question) => question.id === 2);
  const remoteSupportText = [
    remoteSupportQuestion.learning.speedTipHtml,
    ...remoteSupportQuestion.learning.studyNotesHtml,
  ].join(' ').replace(/<[^>]+>/g, '');

  assert.deepEqual(missing, []);
  assert.match(remoteSupportText, /remote access/);
  assert.match(remoteSupportText, /RDP/);
  assert.match(remoteSupportText, /VNC/);
  assert.doesNotMatch(remoteSupportText, /network 题先分层/);
});

test('Core 2 learning annotations use high-frequency module tags', () => {
  const questions = sanitizeQuestionBankData(
    JSON.parse(fs.readFileSync('./data/questions.core2.json', 'utf8')),
  );
  const hydrated = applyLearningAnnotations(questions, { bankId: 'core2' });
  const remoteSupport = hydrated.find((question) => question.id === 2);
  const lostDevice = hydrated.find((question) => question.id === 23);
  const backupPolicy = hydrated.find((question) => question.id === 109);
  const allTags = new Set(hydrated.flatMap((question) => question.learning.studyTags));

  assert.deepEqual(remoteSupport.learning.studyTags, ['remote-network']);
  assert.deepEqual(lostDevice.learning.studyTags, ['security']);
  assert.deepEqual(backupPolicy.learning.studyTags, ['ops-support']);
  assert.ok(allTags.has('app-troubleshooting'));
  assert.ok(allTags.has('os-commands'));
  assert.equal(allTags.has('printers'), false);
  assert.equal(allTags.has('hardware'), false);
  assert.equal(hydrated.filter((question) => question.learning.studyTags.length === 0).length, 0);
});

test('A+ learning option explanations avoid legacy generic fallback stubs', () => {
  const banks = [
    ['core1', sanitizeQuestionBankData(JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8')))],
    ['core2', sanitizeQuestionBankData(JSON.parse(fs.readFileSync('./data/questions.core2.json', 'utf8')))],
  ];
  const legacyPhrases = [
    '它可能是真实技术或操作',
    '应试时把它和题眼绑定记',
    '把题干拆成三件事',
    '这个选项要按它的字面职责判断',
    'exam clue',
  ];
  const failures = banks.flatMap(([bankId, questions]) => (
    questions.flatMap((question) => {
      const annotation = buildLearningAnnotation(question);
      const allText = [
        annotation.keyPointHtml,
        annotation.speedTipHtml,
        ...annotation.studyNotesHtml,
        ...annotation.options.map((option) => option.explanation),
      ].join('\n').replace(/<[^>]+>/g, '');
      const phraseHits = legacyPhrases
        .filter((phrase) => allText.includes(phrase))
        .map((phrase) => `${bankId}:${question.id}:phrase:${phrase}`);
      const shortExplanations = annotation.options.flatMap((option) => {
        const text = option.explanation.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        return text.length >= 75
          ? []
          : [`${bankId}:${question.id}:${option.key}:short:${text}`];
      });

      return [...phraseHits, ...shortExplanations];
    })
  ));

  assert.deepEqual(failures, []);
});

test('Core 2 key points cover common exam scenarios instead of generic clues', () => {
  const questions = sanitizeQuestionBankData(
    JSON.parse(fs.readFileSync('./data/questions.core2.json', 'utf8')),
  );
  const expectations = [
    { id: 6, patterns: [/MSDS\/SDS/, /emergency procedures/] },
    { id: 10, patterns: [/end of life/, /security updates/] },
    { id: 11, patterns: [/custom images/, /network-based remote installation/] },
    { id: 12, patterns: [/smishing/, /vishing/] },
    { id: 15, patterns: [/Linux/, /su\/sudo/] },
    { id: 16, patterns: [/netstat/, /ports/] },
    { id: 18, patterns: [/zero-day/, /patch/] },
    { id: 20, patterns: [/speech recognition/, /Ease of Access/] },
    { id: 21, patterns: [/\.NET Framework 3\.5/, /optional feature/] },
    { id: 22, patterns: [/license assignment/, /重装/] },
    { id: 24, patterns: [/in-place upgrade/, /clean install/] },
    { id: 25, patterns: [/SOP/, /SLA/] },
    { id: 26, patterns: [/Resource Monitor/, /CPU/] },
    { id: 27, patterns: [/ext4/, /NTFS/] },
    { id: 28, patterns: [/low-level format/, /degaussing/] },
    { id: 29, patterns: [/mobile OS upgrade/, /update the failed software/] },
    { id: 32, patterns: [/biometric screen lock/, /facial recognition/] },
    { id: 34, patterns: [/AUP/, /EULA/] },
    { id: 35, patterns: [/image deployment/, /逐台/] },
    { id: 37, patterns: [/Event Viewer/, /service\/application logs/] },
    { id: 38, patterns: [/PUP/, /Potentially Unwanted Program/] },
    { id: 39, patterns: [/net use/, /shared drive/] },
    { id: 41, patterns: [/MFA/, /phone code/] },
    { id: 42, patterns: [/UPS/, /lifting techniques/] },
    { id: 45, patterns: [/\.bat/, /Windows/] },
    { id: 46, patterns: [/hallucination/, /事实错误/] },
    { id: 48, patterns: [/Internet Options/, /cache/] },
    { id: 51, patterns: [/management profile/, /Apple/] },
    { id: 53, patterns: [/ransomware/, /加密/] },
    { id: 54, patterns: [/local admin rights/, /未授权安装/] },
    { id: 56, patterns: [/bollard/, /物理阻挡/] },
    { id: 63, patterns: [/MFA push notification/, /approve\/deny/] },
    { id: 65, patterns: [/Linux\/open-source OS/, /licensing fees/] },
    { id: 67, patterns: [/incremental backup/, /full backup/] },
    { id: 84, patterns: [/physical destruction/, /故障硬盘/] },
    { id: 99, patterns: [/DDoS/, /多个分散 endpoints/] },
    { id: 100, patterns: [/filesystem compatibility/, /exFAT/] },
    { id: 103, patterns: [/Local Users and Groups/, /Administrator/] },
    { id: 104, patterns: [/cryptominer/, /CPU\/GPU/] },
    { id: 109, patterns: [/3-2-1 backup rule/, /off-site/] },
    { id: 118, patterns: [/whoami/, /username/] },
    { id: 121, patterns: [/NDA\/MNDA/, /confidential projects/] },
    { id: 123, patterns: [/cat/, /Linux terminal/] },
    { id: 133, patterns: [/whaling/, /立即付款/] },
    { id: 136, patterns: [/Keychain/, /macOS/] },
    { id: 147, patterns: [/ReFS/, /NTFS/] },
    { id: 145, patterns: [/low free storage/, /90%/] },
    { id: 146, patterns: [/PAM/, /elevated permissions/] },
    { id: 148, patterns: [/account lockout/, /gpedit/] },
    { id: 150, patterns: [/background services/, /netstat/] },
    { id: 153, patterns: [/passphrase/, /PIN/] },
    { id: 157, patterns: [/\.pkg/, /\.dmg/] },
    { id: 158, patterns: [/x86 installer/, /32 位/] },
    { id: 160, patterns: [/System Update utility/, /fresh install/] },
    { id: 164, patterns: [/shell script/, /\.sh/] },
    { id: 165, patterns: [/Remote Desktop Services/, /Task Manager/] },
    { id: 166, patterns: [/least privilege/, /最低权限/] },
    { id: 170, patterns: [/Trusted sites/, /Internet Options/] },
    { id: 171, patterns: [/shoulder surfing/, /social engineering/] },
    { id: 176, patterns: [/FAT32/, /4GB/] },
    { id: 177, patterns: [/Device Manager/, /devmgmt\.msc/] },
    { id: 178, patterns: [/Power user/, /least privilege/] },
    { id: 179, patterns: [/backup testing/, /full backup/] },
    { id: 180, patterns: [/Linux/, /licensing fees/] },
    { id: 186, patterns: [/power consumption/, /跳闸|过载/] },
    { id: 191, patterns: [/Applications/, /Library/] },
    { id: 192, patterns: [/emergency change/, /vendor patch/] },
    { id: 196, patterns: [/Time Machine/, /FileVault/] },
    { id: 201, patterns: [/uninstall and block the patch/, /EOL/] },
    { id: 205, patterns: [/synchronize remote folder/, /在线协作/] },
    { id: 208, patterns: [/spyware/, /远端服务器/] },
    { id: 209, patterns: [/SMB share/, /net use/] },
    { id: 215, patterns: [/traceroute\/tracert/, /hops/] },
    { id: 218, patterns: [/separation of duties/, /insider threat/] },
    { id: 220, patterns: [/degaussing/, /physical shredding/] },
    { id: 222, patterns: [/\.sh shell script/, /Linux server/] },
    { id: 228, patterns: [/PXE\/network image deployment/, /removable storage/] },
    { id: 229, patterns: [/bias/, /limited training data/] },
    { id: 230, patterns: [/PowerShell script/, /Unrestricted/] },
    { id: 231, patterns: [/user education/, /malware remediation/] },
    { id: 234, patterns: [/Kerberos/, /时间/] },
    { id: 241, patterns: [/NDA/, /intellectual property/] },
    { id: 243, patterns: [/definitions\/signatures/, /过期/] },
    { id: 245, patterns: [/Windows Server 2022/, /服务器版/] },
    { id: 247, patterns: [/threat education/, /人为风险/] },
    { id: 250, patterns: [/Gatekeeper/, /Privacy &amp; Security/] },
    { id: 251, patterns: [/certified third-party destruction/, /chain of custody/] },
    { id: 68, patterns: [/antistatic bags/, /ESD/] },
    { id: 152, patterns: [/TACACS\+/, /token-based/] },
    { id: 163, patterns: [/engine\/definitions/, /system files/] },
    { id: 219, patterns: [/Hyper-V/, /Windows Home/] },
    { id: 236, patterns: [/smishing/, /reset password link/] },
    { id: 253, patterns: [/superficially delete/, /low-level formatting/] },
    { id: 254, patterns: [/service account/, /locked out/] },
    { id: 255, patterns: [/tracert\/traceroute/, /hops/] },
    { id: 256, patterns: [/Disk Management/, /diskmgmt\.msc/] },
    { id: 257, patterns: [/Linux/, /低许可成本/] },
    { id: 258, patterns: [/Group Policy/, /安全基线/] },
    { id: 262, patterns: [/Master boot record/, /bootloader/] },
    { id: 264, patterns: [/dedicated graphics/, /图形负载/] },
    { id: 268, patterns: [/active listening/, /calm\/empathetic tone/] },
    { id: 270, patterns: [/Group Policy/, /Trusted URL/] },
    { id: 271, patterns: [/GPT/, /NTFS/] },
    { id: 272, patterns: [/trusted certificate authority/, /证书链/] },
    { id: 275, patterns: [/UAC/, /elevation/] },
    { id: 277, patterns: [/virtual machine/, /older OS/] },
    { id: 278, patterns: [/ipconfig/, /IP settings/] },
    { id: 283, patterns: [/exFAT/, /跨平台文件系统/] },
    { id: 284, patterns: [/local Administrators/, /sandboxed PC/] },
    { id: 286, patterns: [/cp/, /Linux/] },
    { id: 287, patterns: [/hashing/, /checksum/] },
    { id: 288, patterns: [/copyrighted content/, /AI/] },
    { id: 289, patterns: [/domain membership/, /central log-in/] },
    { id: 290, patterns: [/screensaver timeout/, /gpedit\.msc/] },
    { id: 291, patterns: [/malicious applications/, /battery drains/] },
    { id: 292, patterns: [/ACL\/permissions/, /企业策略/] },
    { id: 293, patterns: [/just-in-time access/, /最小权限/] },
    { id: 294, patterns: [/acknowledge frustrations/, /prior unresolved tickets/] },
    { id: 296, patterns: [/\.app/, /Trash/] },
    { id: 298, patterns: [/DLP/, /information exfiltration/] },
    { id: 299, patterns: [/zero-touch deployment/, /manufacturer/] },
    { id: 303, patterns: [/HTTPS-Only Mode/, /传输加密/] },
    { id: 307, patterns: [/DDoS/, /compromised machines/] },
    { id: 308, patterns: [/BAT/, /startup/] },
    { id: 310, patterns: [/EOL software/, /vulnerabilities will not be patched/] },
    { id: 314, patterns: [/Remove account administrative rights/i, /未授权安装/] },
    { id: 316, patterns: [/inactivity timeout settings/, /自动锁定/] },
    { id: 318, patterns: [/TOTP/, /One-Time Password/] },
    { id: 320, patterns: [/winver/, /OS\/version/] },
    { id: 322, patterns: [/account login restrictions/, /logon hours/] },
  ];

  for (const { id, patterns } of expectations) {
    const question = questions.find((item) => item.id === id);
    const keyPoint = buildLearningAnnotation(question)
      .keyPointHtml
      .replace(/<[^>]+>/g, '');

    assert.doesNotMatch(keyPoint, /exam clue/, `expected Core 2 #${id} to avoid generic key point`);
    for (const pattern of patterns) {
      assert.match(keyPoint, pattern, `expected Core 2 #${id} key point to include ${pattern}`);
    }
  }
});

test('buildLearningAnnotation does not confuse SmartScreen or Linux man with screen and MAN', () => {
  const questions = sanitizeQuestionBankData(
    JSON.parse(fs.readFileSync('./data/questions.core2.json', 'utf8')),
  );
  const smartScreenQuestion = questions.find((item) => item.id === 297);
  const manQuestion = questions.find((item) => item.id === 317);
  const smartScreenAnnotation = buildLearningAnnotation(smartScreenQuestion);
  const manAnnotation = buildLearningAnnotation(manQuestion);
  const smartScreenText = [
    smartScreenAnnotation.keyPointHtml,
    ...smartScreenAnnotation.options.map((option) => option.explanationHtml),
  ].join('\n').replace(/<[^>]+>/g, '');
  const manText = [
    manAnnotation.keyPointHtml,
    ...manAnnotation.options.map((option) => option.explanationHtml),
  ].join('\n').replace(/<[^>]+>/g, '');

  assert.match(smartScreenText, /SmartScreen/);
  assert.match(smartScreenText, /下载/);
  assert.doesNotMatch(smartScreenText, /screen（屏幕）/);
  assert.match(manText, /manual pages|手册页/);
  assert.match(manText, /Linux command documentation/);
  assert.doesNotMatch(manText, /MAN（城域网）/);
});

test('buildLearningAnnotation adds targeted explanations for current mistake notebook scenarios', () => {
  const questions = JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'));
  const expectations = [
    { id: 338, patterns: [/single-user Wi-Fi/, /wireless card/] },
    { id: 238, patterns: [/legacy application/, /Virtualization/] },
    { id: 61, patterns: [/page orientation/, /duplex printing/] },
    { id: 329, patterns: [/physical port/, /loopback plug/] },
    { id: 287, patterns: [/unmanaged switch/, /LAN ports/] },
    { id: 58, patterns: [/RJ45 connector/, /crimper/] },
    { id: 356, patterns: [/Hotspot/, /cellular data/] },
    { id: 90, patterns: [/port is disabled/, /managed switch/] },
    { id: 193, patterns: [/VLAN configuration/, /managed switch/] },
    { id: 333, patterns: [/least infrastructure/, /SaaS/] },
    { id: 14, patterns: [/Type 2 hypervisor/, /underlying host OS/] },
    { id: 268, patterns: [/plenum-rated copper cable/, /air ventilation/] },
    { id: 319, patterns: [/DMARC/, /TXT record/] },
    { id: 134, patterns: [/touch input/, /Digitizer/] },
    { id: 94, patterns: [/port flapping/, /patch cable/] },
    { id: 88, patterns: [/email/, /SaaS/] },
    { id: 301, patterns: [/Synchronization/, /local folders/] },
    { id: 142, patterns: [/Port flapping/, /activity light/] },
    { id: 343, patterns: [/RAID 6/, /dual parity/] },
    { id: 49, patterns: [/Private cloud/, /local data center/] },
    { id: 106, patterns: [/RJ45 pin/, /Crimper/] },
    { id: 7, patterns: [/slow startup/, /HDD/] },
    { id: 13, patterns: [/managed switch/, /VLAN assignment/] },
    { id: 15, patterns: [/FTP port 21/, /LDAP/] },
    { id: 20, patterns: [/tethering/, /laptop/] },
    { id: 21, patterns: [/does not turn on/, /PSU/] },
    { id: 24, patterns: [/passes POST/, /boot device/] },
    { id: 26, patterns: [/malware/, /sandbox/] },
    { id: 28, patterns: [/stylus/, /case/] },
    { id: 30, patterns: [/2\.4GHz/, /穿透/] },
    { id: 33, patterns: [/VDI/, /thin client/] },
    { id: 34, patterns: [/disaster recovery/, /IaaS/] },
    { id: 35, patterns: [/Bluetooth/, /PIN/] },
    { id: 36, patterns: [/USB-C/, /Thunderbolt/] },
    { id: 42, patterns: [/input voltage/, /全球|global/] },
    { id: 56, patterns: [/affordable capacity/, /HDD/] },
    { id: 57, patterns: [/docking station/, /扩展/] },
    { id: 62, patterns: [/USB-C/, /data\/video/] },
    { id: 63, patterns: [/ECC RAM/, /纠错/] },
    { id: 66, patterns: [/VDI/, /manual configuration/] },
    { id: 67, patterns: [/secure apps/, /MDM/] },
    { id: 68, patterns: [/BitLocker/, /TPM/] },
    { id: 70, patterns: [/keystone/, /投影/] },
    { id: 74, patterns: [/SAS/, /server/] },
    { id: 75, patterns: [/module bandwidth/, /channel configuration/] },
    { id: 80, patterns: [/connection port/, /charging/] },
    { id: 82, patterns: [/EOL/, /virtualize/] },
    { id: 84, patterns: [/RDP/, /3389/] },
    { id: 87, patterns: [/CMOS battery/, /时间/] },
    { id: 91, patterns: [/burning smell/, /断电/] },
    { id: 95, patterns: [/unmanaged switch/, /managed switch/] },
    { id: 96, patterns: [/USB drive/, /boot options/] },
    { id: 97, patterns: [/test OS/, /hypervisor/] },
  ];
  const genericPatterns = [
    /\u5177\u4f53\u75c7\u72b6/,
    /\u76ee\u6807\u548c\u9650\u5236/,
    /\u4e0d\u80fd\u5904\u7406\u8be5\u76ee\u6807/,
    /\u6700\u76f4\u63a5\u5339\u914d/,
  ];

  for (const { id, patterns } of expectations) {
    const question = questions.find((item) => item.id === id);
    const annotation = buildLearningAnnotation(question);
    const text = [
      annotation.keyPointHtml.replace(/<[^>]+>/g, ''),
      ...annotation.options.map((option) => option.explanation),
    ].join('\n');

    for (const pattern of patterns) {
      assert.match(text, pattern, `expected #${id} to include ${pattern}`);
    }
    for (const pattern of genericPatterns) {
      assert.doesNotMatch(text, pattern, `expected #${id} to avoid generic ${pattern}`);
    }
  }
});

test('buildLearningAnnotation adds second-pass Core 1 targeted needs for high-frequency facts', () => {
  const questions = JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'));
  const expectations = [
    { id: 103, patterns: [/less populated areas/, /cellular/] },
    { id: 104, patterns: [/port 23/, /Telnet/] },
    { id: 107, patterns: [/DIMM/, /different slots/] },
    { id: 108, patterns: [/symmetrical upload\/download/, /fiber/] },
    { id: 109, patterns: [/RAID 0/, /read speed/] },
    { id: 110, patterns: [/USB-C/, /data\/audio\/video/] },
    { id: 111, patterns: [/ACL/, /firewall/] },
    { id: 114, patterns: [/time synchronization/, /NTP/] },
    { id: 124, patterns: [/server RAM/, /ECC/] },
    { id: 126, patterns: [/corporate email\/apps/, /MDM/] },
    { id: 127, patterns: [/instances/, /elasticity/] },
    { id: 130, patterns: [/multiple virtual machines/, /hypervisor/] },
    { id: 131, patterns: [/microservices/, /containers/] },
    { id: 132, patterns: [/PCIe/, /NVMe/] },
    { id: 133, patterns: [/Ethernet cable/, /toner probe/] },
    { id: 135, patterns: [/Wi-Fi can assist GPS/, /定位/] },
    { id: 136, patterns: [/factory motor/, /external interference/] },
    { id: 137, patterns: [/NVMe drive/, /M\.2/] },
    { id: 138, patterns: [/cable internet/, /F-type/] },
    { id: 141, patterns: [/projector/, /filter/] },
    { id: 147, patterns: [/secured communication channel/, /VPN/] },
    { id: 148, patterns: [/beam of light/, /fiber/] },
    { id: 149, patterns: [/modular PSU/, /power cables/] },
    { id: 150, patterns: [/加密/, /TPM/] },
    { id: 153, patterns: [/isolated virtual machine/, /sandbox/] },
    { id: 157, patterns: [/desktop Linux OSs/, /hypervisor/] },
    { id: 159, patterns: [/7200RPM HDD/, /SATA SSD/] },
    { id: 160, patterns: [/videoconferencing/, /SaaS/] },
    { id: 161, patterns: [/98C/, /heat sink/] },
    { id: 167, patterns: [/firewall/, /block unwanted traffic/] },
    { id: 168, patterns: [/faulty battery/, /供电/] },
    { id: 171, patterns: [/swollen battery/, /安全/] },
    { id: 176, patterns: [/HDCP/, /DisplayPort/] },
    { id: 178, patterns: [/Type 2 hypervisor/, /OS running on the host/] },
    { id: 181, patterns: [/asset inventory/, /RFID/] },
    { id: 182, patterns: [/RAID 1/, /mirror/] },
    { id: 184, patterns: [/MAC address/, /switch/] },
    { id: 186, patterns: [/LTE connection/, /hotspot/] },
    { id: 187, patterns: [/International eSIM/, /蜂窝/] },
    { id: 192, patterns: [/malicious indicators/, /sandbox/] },
    { id: 194, patterns: [/USB ports/, /port replicator/] },
    { id: 196, patterns: [/Type 2 hypervisor/, /target environments/] },
    { id: 197, patterns: [/P2V/, /IaaS/] },
    { id: 199, patterns: [/separate corporate\/personal data/, /MDM/] },
    { id: 200, patterns: [/common SSID/, /local resources/] },
    { id: 202, patterns: [/HDMI connector/, /固定方向/] },
    { id: 204, patterns: [/GPS\/satellite positioning/, /smartphone/] },
    { id: 206, patterns: [/PoE injector/, /power/] },
    { id: 207, patterns: [/power cable/, /目的地/] },
    { id: 214, patterns: [/file server/, /ECC memory/] },
    { id: 217, patterns: [/不同 locations/, /dynamic IP/] },
    { id: 219, patterns: [/energy efficiency/, /heat/] },
    { id: 221, patterns: [/NFC/, /范围最短/] },
    { id: 224, patterns: [/BitLocker/, /TPM/] },
    { id: 230, patterns: [/patch panel/, /punchdown tool/] },
    { id: 231, patterns: [/fewest resources/, /containerization/] },
    { id: 233, patterns: [/dedicated graphics card/, /RAM/] },
    { id: 235, patterns: [/Wi-Fi 7/, /802\.11be/] },
    { id: 239, patterns: [/security cameras/, /PoE/] },
    { id: 240, patterns: [/No boot disk found/, /legacy\/UEFI/] },
    { id: 241, patterns: [/digitizer calibration/, /触控/] },
    { id: 243, patterns: [/server memory modules/, /ECC/] },
    { id: 244, patterns: [/12V output/, /redundancy/] },
    { id: 249, patterns: [/fileshare/, /next hop/] },
    { id: 250, patterns: [/S\.M\.A\.R\.T\./, /HDD clicking/] },
    { id: 251, patterns: [/clicking sound/, /HDD/] },
    { id: 255, patterns: [/secure building/, /NFC/] },
    { id: 256, patterns: [/vendor-hosted database/, /PaaS/] },
    { id: 258, patterns: [/DDR4/, /lower operating voltage/] },
    { id: 50, patterns: [/server consolidation/, /containers/] },
    { id: 259, patterns: [/OS access/, /container/] },
    { id: 266, patterns: [/Secure Boot/, /TPM/] },
    { id: 269, patterns: [/multiple VLANs/, /Layer 3 switch/] },
    { id: 270, patterns: [/hybrid cloud/, /EOL/] },
    { id: 271, patterns: [/unapproved apps/, /MDM/] },
    { id: 272, patterns: [/cable modem/, /F-type/] },
    { id: 273, patterns: [/RDIMM/, /data center/] },
    { id: 277, patterns: [/port 110/, /IMAP/] },
    { id: 279, patterns: [/VoIP/, /VLAN/] },
    { id: 281, patterns: [/rain interference/, /satellite/] },
    { id: 283, patterns: [/Drive failure imminent/, /replace hard disk/] },
    { id: 291, patterns: [/application resources/, /community cloud/] },
    { id: 292, patterns: [/internet\/network access/, /NIC/] },
    { id: 302, patterns: [/NVMe port/, /SSD/] },
    { id: 305, patterns: [/email attachments/, /sandbox/] },
    { id: 307, patterns: [/remote desktop resources/, /VDI/] },
    { id: 308, patterns: [/high latency/, /satellite/] },
    { id: 309, patterns: [/processing performance/, /clock frequency/] },
    { id: 314, patterns: [/radio frequency connections/, /cellular/] },
    { id: 318, patterns: [/call center/, /bandwidth/] },
    { id: 322, patterns: [/unauthorized code/, /virtual machines/] },
    { id: 323, patterns: [/upside down/, /flip image vertically/] },
    { id: 324, patterns: [/shares host OS/, /containers/] },
    { id: 328, patterns: [/desktop computer/, /DIMM/] },
    { id: 331, patterns: [/local file server/, /set gateway/] },
    { id: 332, patterns: [/laptop screen/, /antenna cables/] },
    { id: 334, patterns: [/gaming laptop/, /NVMe M\.2 SSD/] },
    { id: 335, patterns: [/websites/, /proxy server/] },
    { id: 337, patterns: [/malicious software/, /Secure Boot/] },
    { id: 339, patterns: [/outer edge/, /additional wireless APs/] },
    { id: 340, patterns: [/secure print release/, /RFID/] },
    { id: 344, patterns: [/portable devices/, /SODIMM/] },
    { id: 347, patterns: [/modular PSU/, /power cables/] },
    { id: 349, patterns: [/input unsuccessful/, /touch screen/] },
    { id: 350, patterns: [/IP phone/, /PoE switch/] },
    { id: 353, patterns: [/burnt smell/, /intake air filter/] },
    { id: 354, patterns: [/EMI/, /STP/] },
    { id: 355, patterns: [/satellite internet/, /increased latency/] },
    { id: 362, patterns: [/pairing/, /Bluetooth/] },
    { id: 366, patterns: [/ping gateway/, /router/] },
  ];

  for (const { id, patterns } of expectations) {
    const question = questions.find((item) => item.id === id);
    const annotation = buildLearningAnnotation(question);
    const text = [
      annotation.keyPointHtml.replace(/<[^>]+>/g, ''),
      ...annotation.options.map((option) => option.explanation),
    ].join('\n');

    assert.doesNotMatch(text, /把题干拆成三件事/, `expected #${id} to avoid default fallback`);
    for (const pattern of patterns) {
      assert.match(text, pattern, `expected #${id} to include ${pattern}`);
    }
  }
});

test('Core 1 learning annotations do not use generic placeholder explanations', () => {
  const questions = applyLearningAnnotations(
    sanitizeQuestionBankData(JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'))),
  );
  const forbidden = [
    '直接解决题干给出的限制',
    '没有直接命中题干限制',
    '选择最直接匹配的技术或动作',
  ];
  const placeholders = questions.flatMap((question) => (
    question.learning.options
      .filter((option) => forbidden.some((phrase) => option.explanation.includes(phrase)))
      .map((option) => `${question.id}:${option.key}`)
  ));

  assert.deepEqual(placeholders, []);
});

test('Core 1 learning annotations avoid broad generic fallback phrases', () => {
  const questions = applyLearningAnnotations(
    sanitizeQuestionBankData(JSON.parse(fs.readFileSync('./data/questions.en.json', 'utf8'))),
  );
  const forbiddenPatterns = [
    /\u770b\u5230\u9898\u5e72\u9650\u5236/,
    /\u53ea\u89e3\u51b3\u65c1\u652f\u95ee\u9898/,
    /\u5177\u4f53\u75c7\u72b6/,
    /\u76ee\u6807\u548c\u9650\u5236/,
    /\u6700\u76f4\u63a5\u5339\u914d/,
    /\u76f4\u63a5\u89e3\u51b3\u9898\u5e72/,
    /\u4e0d\u80fd\u5904\u7406\u8be5\u76ee\u6807/,
    /\u672c\u9898\u5173\u952e\u662f\u5148\u5224\u65ad network/,
    /\u672c\u9898\u5173\u952e\u662f\u533a\u5206 cloud/,
    /\u672c\u9898\u5173\u952e\u662f\u6309 troubleshooting/,
  ];
  const hits = questions.flatMap((question) => {
    const text = [
      question.learning.keyPointHtml.replace(/<[^>]+>/g, ''),
      ...question.learning.options.map((option) => option.explanation),
    ].join('\n');

    return forbiddenPatterns.some((pattern) => pattern.test(text)) ? [question.id] : [];
  });

  assert.deepEqual(hits, []);
});
