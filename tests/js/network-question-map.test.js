import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  NETWORK_OVERVIEW,
  NETWORK_LAYERS,
  NETWORK_PORT_MEMORY_RULES,
  NETWORK_PORT_REFERENCE,
  buildNetworkQuestionRows,
  classifyNetworkQuestion,
} from '../../src/network-question-map.js';

function studyText(item) {
  return typeof item === 'string' ? item : item.text;
}

function collectVisibleStudyText() {
  return [
    NETWORK_OVERVIEW.title,
    NETWORK_OVERVIEW.summary,
    ...NETWORK_OVERVIEW.workflow,
    ...NETWORK_OVERVIEW.operations,
    NETWORK_OVERVIEW.examRule,
    ...NETWORK_PORT_REFERENCE.flatMap((item) => [
      item.port,
      item.service,
      item.function,
      item.clue,
      item.memory,
    ]),
    ...NETWORK_PORT_MEMORY_RULES,
    ...NETWORK_LAYERS.flatMap((layer) => [
      layer.label,
      layer.title,
      layer.summary,
      layer.coreConcept,
      ...layer.knowledge.map(studyText),
      ...layer.operations,
      ...layer.answerPatterns,
      ...layer.signals,
      ...layer.traps,
    ]),
  ];
}

test('network study guide metadata includes overall workflow and layer operations', () => {
  assert.ok(NETWORK_OVERVIEW.workflow.length >= 5);
  assert.ok(NETWORK_OVERVIEW.operations.some((item) => item.includes('ipconfig')));

  for (const layer of NETWORK_LAYERS) {
    assert.ok(layer.coreConcept.length >= 20, `${layer.id} missing core concept`);
    assert.ok(layer.knowledge.length >= 2, `${layer.id} missing knowledge`);
    assert.ok(layer.knowledge.every((item) => ['focus', 'general'].includes(item.level)), `${layer.id} missing knowledge priority`);
    assert.ok(layer.knowledge.some((item) => item.level === 'focus'), `${layer.id} missing focus knowledge`);
    assert.ok(layer.knowledge.some((item) => item.level === 'general'), `${layer.id} missing general knowledge`);
    assert.ok(layer.operations.length >= 2, `${layer.id} missing operations`);
    assert.ok(layer.answerPatterns.length >= 2, `${layer.id} missing answer patterns`);
    assert.ok(layer.signals.length >= 2, `${layer.id} missing signals`);
    assert.ok(layer.traps.length >= 1, `${layer.id} missing traps`);
  }

  const dataLink = NETWORK_LAYERS.find((layer) => layer.id === 'data-link');
  assert.ok(dataLink.coreConcept.includes('VLAN 是二层分段'));
  assert.ok(dataLink.coreConcept.includes('三层 routing'));
  assert.ok(dataLink.answerPatterns.some((item) => item.includes('Layer 3 switch')));
  assert.ok(dataLink.traps.some((item) => item.includes('不同 VLAN 互通')));

  const visibleStudyText = collectVisibleStudyText().join(' ');
  assert.doesNotMatch(visibleStudyText, /trunk/i);
  assert.doesNotMatch(visibleStudyText, /802\.1Q/i);
  assert.doesNotMatch(visibleStudyText, /access port/i);
});

test('network visual map stays concise and bank-scoped', () => {
  const visibleItems = collectVisibleStudyText();
  for (const item of visibleItems) {
    assert.ok(item.length <= 80, `network visual text too long: ${item}`);
  }

  const visibleStudyText = visibleItems.join(' ');
  [
    /LDAPS/i,
    /\b636\b/,
    /listening address/i,
    /listening ports?/i,
    /captive portal/i,
    /application settings/i,
    /Data Link \/ Switching/i,
    /Transport \/ Ports/i,
    /Wireless \/ RF/i,
    /Access Policy \/ Security/i,
    /DHCP relay/i,
    /router-on-a-stick/i,
  ].forEach((pattern) => assert.doesNotMatch(visibleStudyText, pattern));
});

test('network visual map includes bank-backed port reference', () => {
  assert.deepEqual(
    NETWORK_PORT_REFERENCE.map((item) => item.port),
    ['21', '22', '23', '25', '53', '68', '110', '137', '389', '445', '3389'],
  );

  const portText = NETWORK_PORT_REFERENCE.map((item) => [
    item.port,
    item.service,
    item.function,
    item.clue,
    item.memory,
  ].join(' ')).join('\n');

  [
    /21[\s\S]*FTP/i,
    /23[\s\S]*Telnet/i,
    /110[\s\S]*POP3/i,
    /389[\s\S]*LDAP/i,
    /445[\s\S]*SMB/i,
    /3389[\s\S]*RDP/i,
  ].forEach((pattern) => assert.match(portText, pattern));
});

test('network visual map anchor terms are backed by local question banks', () => {
  const bankText = [
    fs.readFileSync('data/questions.en.json', 'utf8'),
    fs.readFileSync('data/questions.core2.json', 'utf8'),
  ].join('\n').toLowerCase();
  const visibleStudyText = collectVisibleStudyText().join('\n').toLowerCase();

  [
    'RJ45',
    'cable tester',
    'Toner probe',
    'Loopback plug',
    'Crimper',
    'PoE injector',
    'drop ceiling',
    'patch panel',
    'wall jack',
    'VLAN',
    'Port VLAN assignment',
    'managed switch',
    'unmanaged switch',
    'Layer 3 switch',
    'port flapping',
    'patch cable',
    'duplex setting',
    'MAC address',
    'DHCP',
    'APIPA',
    '169.254',
    'subnet mask',
    'default gateway',
    'DHCP reservation',
    'Exclusion',
    'Scope',
    'tracert',
    'pathping',
    'nslookup',
    'dig',
    'ipconfig',
    'netstat',
    'Port mapping',
    'Firewall',
    'ping requests',
    'RDP',
    'SSH',
    'TCP',
    'UDP',
    'DNS settings',
    'DNS records',
    'DNS suffix',
    'proxy settings',
    'SSID',
    'WEP',
    'default channel',
    'Evil twin',
    'rogue AP',
    'airport',
    'pop-up window',
    'wireless adapter',
    'wireless card',
    'VPN',
    'RADIUS',
    'LDAP',
    '802.1X',
    'EAP-TLS',
    'Expired certificate',
    'ACL',
    'Content filtering',
    'guest wireless',
    'Disable lobby ports',
    'FTP',
    'SMTP',
    'SMB',
    '110',
    '3389',
  ].forEach((term) => {
    const normalizedTerm = term.toLowerCase();
    assert.ok(bankText.includes(normalizedTerm), `${term} missing from question banks`);
    assert.ok(visibleStudyText.includes(normalizedTerm), `${term} missing from network visual map`);
  });
});

test('classifyNetworkQuestion maps DNS symptoms to DNS/proxy layer', () => {
  const result = classifyNetworkQuestion({
    id: 3,
    stem: 'A technician can ping the server but the domain cannot be found.',
    options: [
      { key: 'A', text: 'Change the DNS settings.' },
      { key: 'B', text: 'Configure a subnet mask.' },
    ],
    answer: ['A'],
    type: 'single',
  });

  assert.equal(result.layerId, 'dns-app');
  assert.ok(result.clues.includes('dns'));
});

test('classifyNetworkQuestion maps VLAN answers to data link', () => {
  const result = classifyNetworkQuestion({
    id: 7,
    stem: 'A technician needs to move desktops into a different broadcast domain.',
    options: [
      { key: 'A', text: 'Configure the VLAN on the managed switch.' },
      { key: 'B', text: 'Change DNS settings.' },
    ],
    answer: ['A'],
    type: 'single',
  });

  assert.equal(result.layerId, 'data-link');
});

test('classifyNetworkQuestion maps VPN answers to access policy', () => {
  const result = classifyNetworkQuestion({
    id: 9,
    stem: 'A user is working from home and cannot access company files.',
    options: [
      { key: 'A', text: 'Configure a virtual private network.' },
      { key: 'B', text: 'Replace the patch cable.' },
    ],
    answer: ['A'],
    type: 'single',
  });

  assert.equal(result.layerId, 'access-policy');
});

test('buildNetworkQuestionRows skips change-management questions that only mention network', () => {
  const rows = buildNetworkQuestionRows([
    {
      id: 'core2',
      label: 'Core 2',
      questions: [
        {
          id: 4,
          stem: 'A network technician notices that network switches are end-of-life.',
          options: [
            { key: 'A', text: 'Implement the change.' },
            { key: 'B', text: 'Approve the change.' },
            { key: 'C', text: 'Propose the change.' },
          ],
          answer: ['C'],
          type: 'single',
        },
      ],
    },
  ]);

  assert.deepEqual(rows, []);
});
