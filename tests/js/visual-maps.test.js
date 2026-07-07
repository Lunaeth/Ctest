import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PRINTER_OVERVIEW,
  PRINT_PIPELINE,
  PRINTER_TYPES,
  PRINTER_SYMPTOM_MAP,
} from '../../src/printer-study-map.js';
import {
  HARDWARE_OVERVIEW,
  BOOT_FLOW,
  HARDWARE_PROCESS_FLOWS,
  HARDWARE_SECTIONS,
  HARDWARE_SYMPTOM_MAP,
} from '../../src/hardware-study-map.js';
import {
  TROUBLESHOOTING_FLOW,
  TROUBLESHOOTING_OVERVIEW,
  TROUBLESHOOTING_PATTERN_MAP,
  TROUBLESHOOTING_SECTIONS,
} from '../../src/troubleshooting-study-map.js';
import {
  CORE2_CONFUSION_SETS,
  CORE2_HIGH_YIELD_TERMS,
  CORE2_HIGH_FREQUENCY_MODULES,
  CORE2_OVERVIEW,
  CORE2_SYMPTOM_GROUPS,
  CORE2_SYMPTOM_MAP,
  buildCore2DecisionMnemonic,
  getCore2ModuleSnapshot,
  getCore2SymptomGroup,
  getCore2SymptomId,
  isCore2HighYieldPattern,
} from '../../src/core2-study-map.js';
import {
  buildCore2SymptomQueryUrl,
  CORE2_SYMPTOM_QUICK_FILTERS,
  getCore2CramCards,
  getCore2InitialSymptomQuery,
  getCore2SymptomSearchText,
  isCore2SymptomSearchMatch,
  syncCore2SymptomQueryUrl,
  tokenizeCore2SymptomQuery,
} from '../../src/core2-visual-page.js';
import { applyLearningAnnotations } from '../../src/learning-annotations.js';

function stringifyMaps() {
  return JSON.stringify({
    PRINT_PIPELINE,
    PRINTER_TYPES,
    PRINTER_SYMPTOM_MAP,
    BOOT_FLOW,
    HARDWARE_PROCESS_FLOWS,
    HARDWARE_SECTIONS,
    HARDWARE_SYMPTOM_MAP,
    TROUBLESHOOTING_FLOW,
    TROUBLESHOOTING_SECTIONS,
    TROUBLESHOOTING_PATTERN_MAP,
  });
}

function collectPrinterVisibleText() {
  return [
    PRINTER_OVERVIEW.title,
    PRINTER_OVERVIEW.summary,
    ...PRINTER_OVERVIEW.examRules,
    ...PRINT_PIPELINE.flatMap((step) => [step.label, step.detail, step.clue]),
    ...PRINTER_TYPES.flatMap((type) => [
      type.name,
      type.summary,
      type.priority,
      ...type.steps.flatMap((step) => [step.name, step.action, ...step.clues]),
      ...type.symptoms,
    ]),
    ...PRINTER_SYMPTOM_MAP.flatMap((row) => [row.symptom, row.answer, row.layer]),
  ];
}

function collectHardwareVisibleText() {
  return [
    HARDWARE_OVERVIEW.title,
    HARDWARE_OVERVIEW.summary,
    ...HARDWARE_OVERVIEW.examRules,
    ...BOOT_FLOW.flatMap((step) => [step.stage, step.detail, step.examMove, ...step.clues]),
    ...HARDWARE_PROCESS_FLOWS.flatMap((flow) => [
      flow.title,
      flow.summary,
      ...flow.steps.flatMap((step) => [step.stage, step.action, ...step.clues]),
    ]),
    ...HARDWARE_SECTIONS.flatMap((section) => [
      section.name,
      section.priority,
      section.summary,
      ...section.points.flatMap((point) => [point.label, point.text]),
      ...section.symptoms,
    ]),
    ...HARDWARE_SYMPTOM_MAP.flatMap((row) => [row.symptom, row.answer, row.group]),
  ];
}

function collectTroubleshootingVisibleText() {
  return [
    TROUBLESHOOTING_OVERVIEW.title,
    TROUBLESHOOTING_OVERVIEW.summary,
    ...TROUBLESHOOTING_OVERVIEW.examRules,
    ...TROUBLESHOOTING_FLOW.flatMap((step) => [
      step.stage,
      step.detail,
      step.examMove,
      ...step.clues,
    ]),
    ...TROUBLESHOOTING_SECTIONS.flatMap((section) => [
      section.name,
      section.priority,
      section.summary,
      ...section.points.flatMap((point) => [point.label, point.text]),
      ...section.symptoms,
    ]),
    ...TROUBLESHOOTING_PATTERN_MAP.flatMap((row) => [row.symptom, row.answer, row.group]),
  ];
}

function collectCore2VisibleText() {
  return [
    CORE2_OVERVIEW.title,
    CORE2_OVERVIEW.summary,
    ...CORE2_OVERVIEW.examRules,
    ...getCore2CramCards().flatMap((card) => [
      card.label,
      card.priority,
      ...card.signals,
      ...card.mnemonics.map((item) => item.text),
      card.confusion?.cue,
      card.confusion?.choose,
      card.confusion?.avoid,
    ]),
    ...CORE2_HIGH_FREQUENCY_MODULES.flatMap((module) => [
      module.label,
      module.summary,
      module.priority,
      ...module.signals,
      ...module.flow,
      ...module.actions,
      ...module.traps,
      ...module.examples.flatMap((item) => [item.clue, item.answer]),
      ...getCore2ModuleSnapshot(module.id).mnemonics.map((item) => item.text),
    ]),
    ...CORE2_CONFUSION_SETS.flatMap((set) => [
      set.title,
      set.group,
      ...set.rows.flatMap((row) => [row.cue, row.choose, row.avoid]),
    ]),
    ...CORE2_SYMPTOM_MAP.flatMap((row) => [
      row.symptom,
      row.answer,
      row.group,
      buildCore2DecisionMnemonic(row),
    ]),
  ];
}

const CORE2_MATCH_STOP_WORDS = new Set([
  'and',
  'are',
  'for',
  'from',
  'into',
  'the',
  'user',
  'users',
  'with',
  'that',
  'this',
  'which',
  'should',
  'following',
  'technician',
  'company',
  'computer',
  'most',
  'best',
  'first',
  'would',
  'will',
  'needs',
  'using',
  'after',
  'before',
  'been',
  'when',
  'what',
  'while',
  'within',
]);

function tokenizeCore2MatchText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !CORE2_MATCH_STOP_WORDS.has(token));
}

function getCore2CorrectAnswerText(question) {
  const keys = new Set(Array.isArray(question.answer) ? question.answer : [question.answer]);
  return (question.options ?? [])
    .filter((option) => keys.has(option.key))
    .map((option) => option.text)
    .join(' ');
}

function scoreCore2SymptomMatch(question, row) {
  const stemTokens = new Set(tokenizeCore2MatchText(question.stem));
  const answerTokens = new Set(tokenizeCore2MatchText(getCore2CorrectAnswerText(question)));
  const studyTags = new Set(question.learning?.studyTags ?? []);
  const symptomScore = tokenizeCore2MatchText(row.symptom)
    .filter((token) => stemTokens.has(token))
    .length;
  const answerScore = tokenizeCore2MatchText(row.answer)
    .filter((token) => answerTokens.has(token))
    .length;
  const moduleScore = studyTags.has(getCore2SymptomGroup(row.group)?.moduleId) ? 1 : 0;

  return symptomScore + (answerScore * 2) + moduleScore;
}

function getCore2SymptomCoverageStats() {
  const questions = applyLearningAnnotations(
    JSON.parse(fs.readFileSync('data/questions.core2.json', 'utf8')),
    { bankId: 'core2' },
  );
  const covered = questions.filter((question) => (
    CORE2_SYMPTOM_MAP.some((row) => scoreCore2SymptomMatch(question, row) >= 3)
  )).length;

  return { covered, total: questions.length };
}

test('printer visual map covers typed printer flows and exam symptoms', () => {
  const printerTypeIds = PRINTER_TYPES.map((type) => type.id);
  assert.deepEqual(printerTypeIds, ['laser', 'inkjet', 'thermal', 'impact', '3d']);
  assert.ok(PRINT_PIPELINE.some((step) => step.label === 'Print Spooler'));

  const laser = PRINTER_TYPES.find((type) => type.id === 'laser');
  assert.ok(laser.steps.some((step) => step.name === 'Fuser' && step.action.includes('fuser')));
  assert.ok(laser.symptoms.some((symptom) => symptom.includes('toner not fused')));

  const impact = PRINTER_TYPES.find((type) => type.id === 'impact');
  assert.ok(impact.steps.some((step) => step.name === 'Ribbon'));
  assert.ok(impact.symptoms.some((symptom) => symptom.includes('top page blank')));

  const thermal = PRINTER_TYPES.find((type) => type.id === 'thermal');
  assert.ok(thermal.steps.some((step) => step.name === 'Heating element'));

  const printer3d = PRINTER_TYPES.find((type) => type.id === '3d');
  assert.ok(printer3d.symptoms.some((symptom) => symptom.includes('Air filter mask')));

  assert.ok(PRINTER_SYMPTOM_MAP.some((row) => row.symptom.includes('Toner wipes off') && row.answer === 'Fuser'));
  assert.ok(PRINTER_SYMPTOM_MAP.some((row) => row.answer === 'Replace the ribbon'));
});

test('hardware visual map covers boot flow and hardware answer patterns', () => {
  assert.deepEqual(
    BOOT_FLOW.map((step) => step.stage),
    ['Power', 'BIOS / UEFI', 'POST', 'Boot order / options', 'Master boot record / GPT', 'TPM / Secure Boot', 'Drivers / services'],
  );
  assert.ok(BOOT_FLOW.some((step) => step.examMove.includes('passes POST')));
  assert.ok(BOOT_FLOW.some((step) => step.clues.includes('TPM')));

  const processIds = HARDWARE_PROCESS_FLOWS.map((flow) => flow.id);
  assert.deepEqual(processIds, ['raid-recovery', 'charging-power', 'display-projector', 'ram-service']);

  const raidFlow = HARDWARE_PROCESS_FLOWS.find((flow) => flow.id === 'raid-recovery');
  assert.ok(raidFlow.steps.some((step) => step.action.includes('perform individual drive diagnostics')));
  assert.ok(raidFlow.steps.some((step) => step.clues.includes('RAID array status')));

  const chargingFlow = HARDWARE_PROCESS_FLOWS.find((flow) => flow.id === 'charging-power');
  assert.ok(chargingFlow.steps.some((step) => step.clues.includes('Clean the USB-C port')));

  const displayFlow = HARDWARE_PROCESS_FLOWS.find((flow) => flow.id === 'display-projector');
  assert.ok(displayFlow.steps.some((step) => step.clues.includes('Check the projector input sources')));

  const memory = HARDWARE_SECTIONS.find((section) => section.id === 'memory');
  assert.ok(memory.points.some((point) => point.label === 'ECC RAM'));
  assert.ok(memory.points.some((point) => point.label === 'RDIMM'));

  const storage = HARDWARE_SECTIONS.find((section) => section.id === 'storage');
  assert.ok(storage.points.some((point) => point.text.includes('RAID 6')));
  assert.ok(storage.points.some((point) => point.label === 'GPT'));

  assert.ok(HARDWARE_SYMPTOM_MAP.some((row) => row.symptom.includes('Passes POST') && row.answer.includes('boot order')));
  assert.ok(HARDWARE_SYMPTOM_MAP.some((row) => row.answer === 'ECC RAM'));
});

test('troubleshooting visual map covers low-risk first and escalation patterns', () => {
  assert.ok(TROUBLESHOOTING_FLOW.some((step) => step.stage === 'Verify / Inspect'));
  assert.ok(TROUBLESHOOTING_FLOW.some((step) => step.stage === 'Escalate'));

  const lowRisk = TROUBLESHOOTING_SECTIONS.find((section) => section.id === 'low-risk-actions');
  assert.ok(lowRisk.points.some((point) => point.text.includes('Clean the pickup rollers')));
  assert.ok(lowRisk.points.some((point) => point.text.includes('Close unnecessary programs')));

  const security = TROUBLESHOOTING_SECTIONS.find((section) => section.id === 'security-malware');
  assert.ok(security.points.some((point) => point.text.includes('Quarantine the system')));
  assert.ok(security.points.some((point) => point.text.includes('Educate the end user')));

  assert.ok(TROUBLESHOOTING_PATTERN_MAP.some((row) => row.answer === 'Incident report'));
  assert.ok(TROUBLESHOOTING_PATTERN_MAP.some((row) => row.answer.includes('Escalate')));
});

test('core2 visual map covers high-frequency study modules', () => {
  assert.deepEqual(
    CORE2_HIGH_FREQUENCY_MODULES.map((module) => module.id),
    ['security', 'os-commands', 'app-troubleshooting', 'ops-support', 'remote-network'],
  );

  const security = CORE2_HIGH_FREQUENCY_MODULES.find((module) => module.id === 'security');
  assert.ok(security.signals.includes('MFA'));
  assert.ok(security.actions.some((item) => item.includes('TOTP')));
  assert.ok(security.flow.some((item) => item.includes('BitLocker')));

  const os = CORE2_HIGH_FREQUENCY_MODULES.find((module) => module.id === 'os-commands');
  assert.ok(os.actions.some((item) => item.includes('GPT')));
  assert.ok(os.flow.some((item) => item.includes('Event Viewer')));

  const apps = CORE2_HIGH_FREQUENCY_MODULES.find((module) => module.id === 'app-troubleshooting');
  assert.ok(apps.signals.includes('Print Spooler'));
  assert.ok(apps.flow.some((item) => item.includes('license assignment')));

  const ops = CORE2_HIGH_FREQUENCY_MODULES.find((module) => module.id === 'ops-support');
  assert.ok(ops.actions.includes('Check CMDB'));
  assert.ok(ops.flow.some((item) => item.includes('risk analysis')));

  const remote = CORE2_HIGH_FREQUENCY_MODULES.find((module) => module.id === 'remote-network');
  assert.ok(remote.examples.some((item) => item.answer === 'VNC'));
  assert.ok(remote.flow.some((item) => item.includes('RADIUS')));

  assert.deepEqual(
    CORE2_CONFUSION_SETS.map((set) => set.moduleId),
    ['security', 'os-commands', 'app-troubleshooting', 'ops-support', 'remote-network'],
  );
  assert.ok(CORE2_CONFUSION_SETS.every((set) => set.rows.length === 3));
  assert.ok(CORE2_CONFUSION_SETS.some((set) => (
    set.id === 'remote-confusions'
    && set.rows.some((row) => row.choose === 'RDP + VPN' && row.avoid.includes('VNC'))
  )));

  assert.ok(CORE2_SYMPTOM_MAP.length >= 180);
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.symptom.includes('Domain not found') && row.answer.includes('DNS')));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'BitLocker To Go'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Turn Windows features on or off'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Rejoin the device to the domain'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Smishing'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Group Policy'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Resource monitor'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Disable UPnP'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'Device Manager'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'powercfg'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'PXE'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'gpresult'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'SSH'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'DLP'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'TOTP'));
  assert.ok(CORE2_SYMPTOM_MAP.some((row) => row.answer === 'winver'));
});

test('core2 symptom map covers all current local Core 2 questions', () => {
  const { covered, total } = getCore2SymptomCoverageStats();

  assert.equal(covered, total);
});

test('core2 symptom map exposes stable unique anchor ids', () => {
  const ids = CORE2_SYMPTOM_MAP.map(getCore2SymptomId);
  const groupedRowCount = CORE2_SYMPTOM_GROUPS
    .reduce((total, group) => (
      total + CORE2_SYMPTOM_MAP.filter((row) => row.group === group.group).length
    ), 0);

  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every((id) => /^symptom-[a-z0-9-]+$/.test(id)));
  assert.ok(ids.includes('symptom-lost-phone-user-unaware'));
  assert.deepEqual(
    CORE2_SYMPTOM_GROUPS.map((group) => group.moduleId),
    ['security', 'os-commands', 'app-troubleshooting', 'ops-support', 'remote-network'],
  );
  assert.equal(groupedRowCount, CORE2_SYMPTOM_MAP.length);
  assert.equal(getCore2SymptomGroup('Security')?.id, 'symptom-group-security');
});

test('core2 visual page renders symptom group navigation', () => {
  const html = fs.readFileSync('core2-visual.html', 'utf8');
  const source = fs.readFileSync('src/core2-visual-page.js', 'utf8');
  const styles = fs.readFileSync('study-visual.css', 'utf8');

  assert.match(html, /core2-cram/);
  assert.match(source, /renderCramCards/);
  assert.match(source, /getCore2CramCards/);
  assert.match(source, /cram-practice-link/);
  assert.match(styles, /\.cram-grid/);
  assert.match(styles, /\.cram-card/);
  assert.match(source, /symptom-group-nav/);
  assert.match(source, /symptom-group-row/);
  assert.match(source, /symptom-group-practice-link/);
  assert.match(source, /toggle-core2-symptom-group/);
  assert.match(source, /data-expanded="true"/);
  assert.match(source, /aria-expanded="true"/);
  assert.match(source, /getSymptomRowsByGroup/);
  assert.match(source, /filter-core2-symptoms/);
  assert.match(source, /symptom-data-row/);
  assert.match(source, /symptom-stats/);
  assert.match(source, /symptom-filter-empty/);
  assert.match(source, /symptom-filter-chips/);
  assert.match(source, /start-core2-filter-practice/);
  assert.match(source, /start-core2-row-practice/);
  assert.match(source, /data-symptom-id="\$\{escapeHtml\(getCore2SymptomId\(row\)\)\}"/);
  assert.match(source, /symptomIds: \[symptomId\]/);
  assert.match(source, /练这类题/);
  assert.match(source, /currentFilterSymptomIds/);
  assert.match(source, /symptomIds: currentFilterSymptomIds/);
  assert.match(source, /练当前筛选/);
  assert.match(source, /symptom-group-controls/);
  assert.match(source, /apply-core2-symptom-filter/);
  assert.match(source, /set-core2-symptom-groups/);
  assert.match(source, /isCore2HighYieldPattern/);
  assert.match(source, /symptom-priority-badge/);
  assert.match(source, /highYieldCount/);
  assert.match(source, /module-snapshot/);
  assert.match(source, /module-pattern-link/);
  assert.match(source, /module-practice-link/);
  assert.match(source, /start-core2-module-practice/);
  assert.match(source, /pending-core2-module-practice/);
  assert.match(source, /renderConfusionSets/);
  assert.match(source, /confusion-card/);
  assert.match(source, /confusion-practice-link/);
  assert.match(source, /data-module-id="\$\{escapeHtml\(set\.moduleId\)\}"/);
  assert.match(styles, /\.confusion-card:target/);
  assert.match(styles, /\.confusion-practice-link/);
  assert.match(styles, /\.symptom-group-practice-link/);
  assert.match(styles, /\.symptom-group-toggle/);
  assert.match(styles, /\.symptom-group-controls/);
  assert.match(styles, /\.symptom-filter-practice-link/);
  assert.match(styles, /\.symptom-row-practice-link/);
  assert.match(styles, /\.symptom-priority-badge/);
  assert.match(source, /buildCore2DecisionMnemonic/);
  assert.match(source, /symptom-decision/);
  assert.match(source, /isCore2SymptomSearchMatch/);
  assert.match(source, /replaceState/);
});

test('core2 cram cards summarize each high-frequency module with local patterns', () => {
  const cards = getCore2CramCards();

  assert.deepEqual(
    cards.map((card) => card.moduleId),
    CORE2_HIGH_FREQUENCY_MODULES.map((module) => module.id),
  );
  assert.ok(cards.every((card) => card.signals.length === 3));
  assert.ok(cards.every((card) => card.mnemonics.length === 2));
  assert.ok(cards.every((card) => card.confusion?.choose && card.confusion?.avoid));

  for (const card of cards) {
    const snapshotTexts = getCore2ModuleSnapshot(card.moduleId)
      .mnemonics
      .map((item) => item.text);
    assert.ok(card.mnemonics.every((item) => snapshotTexts.includes(item.text)));
  }
});

test('core2 symptom group collapse keeps search results visible', () => {
  const source = fs.readFileSync('src/core2-visual-page.js', 'utf8');

  assert.match(source, /const hasQuery = Boolean\(query\.trim\(\)\)/);
  assert.match(source, /const isExpanded = hasQuery \|\| expandedByGroup\.get\(row\.dataset\.group\) !== false/);
  assert.match(source, /row\.hidden = !isSearchMatch \|\| !isExpanded/);
  assert.match(source, /groupRow\.dataset\.expanded === 'false' \? 'true' : 'false'/);
  assert.match(source, /const nextExpanded = button\.dataset\.expanded === 'true'/);
  assert.match(source, /row\.dataset\.expanded = String\(nextExpanded\)/);
});

test('core2 visible study text does not contain common mojibake markers', () => {
  const visibleStudyText = collectCore2VisibleText().join('\n');
  const mojibakePattern = /(?:锛|鐪|閫|鍥|棰|绛|妯|瀵|搴|涓|浠|�)/;

  assert.doesNotMatch(visibleStudyText, mojibakePattern);
  assert.match(visibleStudyText, /Core 2 高频题型图/);
  assert.match(visibleStudyText, /按 Core 2 题库高频触发词整理/);
});

test('core2 visual symptom filter supports multi-term module searches', () => {
  const lostPhone = CORE2_SYMPTOM_MAP.find((row) => row.symptom === 'Lost phone, user unaware');
  const remoteCommand = CORE2_SYMPTOM_MAP.find((row) => row.answer === 'SSH');

  assert.deepEqual(tokenizeCore2SymptomQuery('  MFA   Security  '), ['mfa', 'security']);
  assert.equal(getCore2InitialSymptomQuery({ search: '?v=test&q=vpn%20remote' }), 'vpn remote');
  assert.equal(getCore2InitialSymptomQuery({ search: '?v=test' }), '');
  assert.equal(
    buildCore2SymptomQueryUrl('vpn remote', {
      pathname: '/core2-visual.html',
      search: '?v=test',
      hash: '#symptom-group-remote',
    }),
    '/core2-visual.html?v=test&q=vpn+remote#symptom-group-remote',
  );
  assert.equal(
    buildCore2SymptomQueryUrl('', {
      pathname: '/core2-visual.html',
      search: '?v=test&q=vpn%20remote',
      hash: '#symptom-group-remote',
    }),
    '/core2-visual.html?v=test#symptom-group-remote',
  );
  assert.ok(isCore2SymptomSearchMatch(getCore2SymptomSearchText(lostPhone), 'lost security'));
  assert.ok(isCore2SymptomSearchMatch(getCore2SymptomSearchText(lostPhone), 'encryption malware'));
  assert.ok(isCore2SymptomSearchMatch(getCore2SymptomSearchText(lostPhone), '看 lost 选 encryption'));
  assert.ok(isCore2SymptomSearchMatch(getCore2SymptomSearchText(remoteCommand), 'ssh remote'));
  assert.ok(isCore2SymptomSearchMatch(getCore2SymptomSearchText(remoteCommand), 'remote-network'));
  assert.equal(isCore2SymptomSearchMatch(getCore2SymptomSearchText(lostPhone), 'lost remote'), false);
});

test('core2 visual decision mnemonics stay concise and source-backed', () => {
  const lostPhone = CORE2_SYMPTOM_MAP.find((row) => row.symptom === 'Lost phone, user unaware');
  const longRows = CORE2_SYMPTOM_MAP
    .map((row) => buildCore2DecisionMnemonic(row))
    .filter((text) => text.length > 76);

  assert.equal(buildCore2DecisionMnemonic(lostPhone), '看 Lost phone, user unaware -> 选 Encryption');
  assert.deepEqual(longRows, []);
  for (const row of CORE2_SYMPTOM_MAP) {
    const mnemonic = buildCore2DecisionMnemonic(row);
    assert.match(mnemonic, /^看 .+ -> 选 .+/);
    assert.ok(mnemonic.includes(row.symptom.slice(0, Math.min(8, row.symptom.length))));
  }
});

test('core2 module snapshots summarize local patterns for exam review', () => {
  for (const module of CORE2_HIGH_FREQUENCY_MODULES) {
    const snapshot = getCore2ModuleSnapshot(module.id);
    const expectedCount = CORE2_SYMPTOM_MAP.filter((row) => row.group === snapshot.group.group).length;

    assert.equal(snapshot.count, expectedCount);
    assert.equal(snapshot.mnemonics.length, 3);
    for (const item of snapshot.mnemonics) {
      assert.match(item.id, /^symptom-[a-z0-9-]+$/);
      assert.match(item.text, /^看 .+ -> 选 .+/);
      assert.ok(item.text.length <= 76, `module snapshot mnemonic too long: ${item.text}`);
    }
  }
});

test('core2 visual symptom filter syncs query changes back to URL', () => {
  const calls = [];
  const windowStub = {
    location: {
      pathname: '/core2-visual.html',
      search: '?v=test',
      hash: '#symptom-group-remote',
    },
    history: {
      replaceState(state, title, url) {
        calls.push([state, title, url]);
      },
    },
  };

  syncCore2SymptomQueryUrl('vpn remote', windowStub);
  assert.deepEqual(calls, [[null, '', '/core2-visual.html?v=test&q=vpn+remote#symptom-group-remote']]);

  windowStub.location.search = '?v=test&q=vpn+remote';
  syncCore2SymptomQueryUrl('vpn remote', windowStub);
  assert.equal(calls.length, 1);

  syncCore2SymptomQueryUrl('', windowStub);
  assert.deepEqual(calls.at(-1), [null, '', '/core2-visual.html?v=test#symptom-group-remote']);
});

test('core2 visual quick filters all match local symptom rows', () => {
  assert.deepEqual(
    CORE2_SYMPTOM_QUICK_FILTERS.map((filter) => filter.query),
    ['', 'high-yield', 'mfa security', 'malware security', 'command os', 'browser apps', 'vpn remote', 'backup ops'],
  );
  assert.equal(CORE2_SYMPTOM_QUICK_FILTERS[0].label, 'All patterns');
  assert.equal(CORE2_SYMPTOM_QUICK_FILTERS[1].label, 'High-yield');
  assert.ok(isCore2SymptomSearchMatch(getCore2SymptomSearchText(CORE2_SYMPTOM_MAP[0]), ''));

  for (const filter of CORE2_SYMPTOM_QUICK_FILTERS) {
    assert.ok(
      CORE2_SYMPTOM_MAP.some((row) => (
        isCore2SymptomSearchMatch(getCore2SymptomSearchText(row), filter.query)
      )),
      `quick filter has no local matches: ${filter.query}`,
    );
  }
});

test('core2 high-yield pattern markers focus repeated exam actions', () => {
  const highYieldRows = CORE2_SYMPTOM_MAP.filter(isCore2HighYieldPattern);
  const examples = [
    'Lost phone, user unaware',
    'Legacy Linux GUI',
    'Remote Windows PC',
    '4TB SSD install',
    'Daily print report fails',
    'Domain not found, ping works',
  ];

  assert.ok(highYieldRows.length > 40);
  assert.ok(highYieldRows.length < CORE2_SYMPTOM_MAP.length);

  for (const symptom of examples) {
    const row = CORE2_SYMPTOM_MAP.find((item) => item.symptom === symptom);
    assert.ok(row, `missing source row: ${symptom}`);
    assert.equal(isCore2HighYieldPattern(row), true, `expected high-yield row: ${symptom}`);
    assert.equal(isCore2SymptomSearchMatch(getCore2SymptomSearchText(row), 'high-yield'), true);
  }

  const lowYieldRow = CORE2_SYMPTOM_MAP.find((row) => row.symptom === 'AI limited training');
  assert.equal(isCore2HighYieldPattern(lowYieldRow), false);
  assert.equal(isCore2SymptomSearchMatch(getCore2SymptomSearchText(lowYieldRow), 'high-yield'), false);
});

test('visual maps stay concise and avoid unsupported expanded concepts', () => {
  for (const item of [
    ...collectPrinterVisibleText(),
    ...collectHardwareVisibleText(),
    ...collectTroubleshootingVisibleText(),
    ...collectCore2VisibleText(),
  ]) {
    assert.ok(item.length <= 80, `visual map text too long: ${item}`);
  }

  for (const type of PRINTER_TYPES) {
    assert.ok(type.steps.length <= 5, `${type.id} has too many printer steps`);
    for (const step of type.steps) {
      assert.ok(step.action.length <= 80, `${type.id}/${step.name} action is too long`);
    }
  }

  for (const section of HARDWARE_SECTIONS) {
    assert.ok(section.points.length <= 5, `${section.id} has too many hardware points`);
  }

  const text = stringifyMaps();
  [
    /direct thermal/i,
    /thermal transfer/i,
    /thermal paper/i,
    /label media/i,
    /extruder/i,
    /print bed/i,
    /Alt Mode/i,
    /EFI system partition/i,
    /bootloader/i,
    /startup repair/i,
    /beep codes/i,
    /tractor feed/i,
    /missing dots/i,
    /scanner glass/i,
    /Printer engine/i,
    /OS loader/i,
  ].forEach((pattern) => assert.doesNotMatch(text, pattern));
});

test('core2 visual map anchor terms are backed by the local Core 2 bank', () => {
  const bankText = fs.readFileSync('data/questions.core2.json', 'utf8').toLowerCase();
  const visibleStudyText = collectCore2VisibleText().join('\n').toLowerCase();

  [
    'malware',
    'ransomware',
    'phishing',
    'mfa',
    'totp',
    'bitlocker',
    'uac',
    'least privilege',
    'powershell',
    'netstat',
    'ipconfig',
    'gpt',
    'ntfs',
    'event viewer',
    'browser',
    'print spooler',
    'license assignment',
    'cmdb',
    '3-2-1',
    'backup testing',
    'sds',
    'active listening',
    'vpn',
    'rdp',
    'vnc',
    'ssh',
    'smb',
    'radius',
    'date and time settings',
    'whoami',
    'sending a code',
    'clean install',
    'reinstall',
    'nda',
    'net use',
    'bitlocker to go',
    'login restrictions',
    'proxy settings',
    'turn windows features on or off',
    'rejoin the device to the domain',
    'expired certificate',
    'tacacs+',
    'ldap',
    'smartscreen',
    'emergency procedures',
    'standard operating procedures',
    'smishing',
    'zero-day',
    'rogue wireless access point',
    'facial recognition',
    'mdm',
    'compare the hash value',
    'cryptominer',
    'bollard',
    'ext4',
    'exfat',
    'lusrmgr.msc',
    'group policy',
    'resource monitor',
    'internet options',
    'background applications',
    'secure master password',
    'disable upnp',
    'badge readers',
    'pxe',
    'powercfg',
    'device manager',
    'xdr',
    'mdr',
    'keychain',
    'windows hello',
    'refs',
    'gpresult',
    'file explorer',
    'task manager',
    'social engineering',
    'dig',
    'pam',
    'traceroute',
    'tracert',
    'mkdir',
    'kerberos token',
    'user education',
    'privacy',
    'service account is locked out',
    'dlp',
    'ddos',
    'winver',
    ...CORE2_HIGH_YIELD_TERMS,
  ].forEach((term) => {
    assert.ok(bankText.includes(term), `${term} missing from Core 2 bank`);
    assert.ok(visibleStudyText.includes(term), `${term} missing from Core 2 visual map`);
  });
});

test('visual map anchor terms are backed by the local Core 1/Core 2 banks', () => {
  const bankText = [
    fs.readFileSync('data/questions.en.json', 'utf8'),
    fs.readFileSync('data/questions.core2.json', 'utf8'),
  ].join('\n').toLowerCase();
  const visualText = stringifyMaps().toLowerCase();

  [
    'document feeder',
    'ADF',
    'Fuser',
    'pickup rollers',
    'Clean the printheads',
    'Cleaning the heating element',
    'Replace the ribbon',
    'broken pins',
    'carbon fiber-based filament',
    'Air filter mask',
    'Print Spooler',
    'printer driver',
    'BIOS',
    'UEFI',
    'Boot order',
    'Boot options',
    'Master boot record',
    'GPT',
    'TPM',
    'Secure Boot',
    'Drivers',
    'Services',
    'Modular power supply',
    'UPS',
    'amber light',
    'degraded RAID array',
    'Perform individual drive diagnostics',
    'Rebuild the array',
    'RAID array status',
    'Clean the USB-C port',
    'Use a different power supply',
    'Check the projector input sources',
    'Replace the DisplayPort cable',
    'Adjust the keystone',
    'Flip the image vertically',
    'Reseat the RAM',
    'antistatic bags',
    'ECC',
    'RDIMM',
    'NVMe M.2 SSD',
    'Digitizer',
    'DisplayPort',
    'Integrated video',
    'Docking station',
    'Thunderbolt',
    'NFC',
    'Hotspot',
    'Cellular',
    'lifting techniques',
    'Verify the date and time settings',
    'Inspect the USB-C port for damage',
    'Check the projector input sources',
    'Viewing and sharing permissions',
    'known-good workstation',
    'Connect a machine using Ethernet and test connectivity',
    'Restart the phone',
    'Close unnecessary programs',
    'Event Viewer',
    'Services',
    'Task Manager',
    'ipconfig',
    'netstat',
    'Quarantine the system',
    'Isolate the system',
    'Run a mobile malware scan',
    'Educate the end user',
    'Incident report',
    'Propose the change',
    'Sandbox testing',
    'Implement an emergency change',
    'Escalate the issue to a senior team member',
    'Explain the issue and the need for collaboration',
  ].forEach((term) => {
    const normalizedTerm = term.toLowerCase();
    assert.ok(bankText.includes(normalizedTerm), `${term} missing from question banks`);
    assert.ok(visualText.includes(normalizedTerm), `${term} missing from visual maps`);
  });
});
