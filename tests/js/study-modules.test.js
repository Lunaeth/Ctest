import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCore1ModuleStats,
  buildCore2ModuleStats,
  getCore1StudyModules,
  getCore1StudyTags,
  getCore2StudyModules,
  getCore2StudyTags,
} from '../../src/study-modules.js';

test('getCore1StudyTags maps Core 1 questions to exam study modules', () => {
  const networking = {
    stem: 'A laptop receives an APIPA address. Which service should the technician check first?',
    options: [{ text: 'DHCP' }, { text: 'DNS' }],
  };
  const printer = {
    stem: 'A laser printer leaves a vertical line only when making copies and scans.',
    options: [{ text: 'document feeder' }, { text: 'drum assembly' }],
  };
  const hardware = {
    stem: 'Which motherboard slot accepts an NVMe M.2 SSD?',
    options: [{ text: 'PCIe' }, { text: 'SATA' }],
  };

  assert.deepEqual(getCore1StudyTags(networking), ['networking', 'troubleshooting']);
  assert.deepEqual(getCore1StudyTags(printer), ['printers', 'troubleshooting']);
  assert.deepEqual(getCore1StudyTags(hardware), ['hardware']);
});

test('buildCore1ModuleStats counts all and per-module questions', () => {
  const questions = [
    { learning: { studyTags: ['networking'] } },
    { learning: { studyTags: ['printers', 'troubleshooting'] } },
    { learning: { studyTags: ['hardware'] } },
  ];
  const stats = buildCore1ModuleStats(questions);
  const counts = Object.fromEntries(stats.map((module) => [module.id, module.count]));

  assert.equal(getCore1StudyModules({ includeAll: true }).length, 5);
  assert.equal(counts.all, 3);
  assert.equal(counts.networking, 1);
  assert.equal(counts.printers, 1);
  assert.equal(counts.hardware, 1);
  assert.equal(counts.troubleshooting, 1);
});

test('getCore2StudyTags maps Core 2 questions to high-frequency modules', () => {
  const remote = {
    stem: 'A technician needs remote support for a legacy Linux GUI session.',
    options: [{ key: 'A', text: 'SSH' }, { key: 'B', text: 'VNC' }],
    answer: ['B'],
  };
  const security = {
    stem: 'A phone is lost and contains sensitive data.',
    options: [{ key: 'A', text: 'Encryption' }, { key: 'B', text: 'Remote wipe' }],
    answer: ['A'],
  };
  const ops = {
    stem: 'A company needs to ensure backups can be restored.',
    options: [{ key: 'A', text: 'Backup testing' }, { key: 'B', text: 'SLA' }],
    answer: ['A'],
  };

  assert.deepEqual(getCore2StudyTags(remote), ['remote-network']);
  assert.deepEqual(getCore2StudyTags(security), ['security']);
  assert.deepEqual(getCore2StudyTags(ops), ['ops-support']);
});

test('buildCore2ModuleStats counts all and high-frequency modules', () => {
  const questions = [
    { learning: { studyTags: ['security'] } },
    { learning: { studyTags: ['remote-network', 'os-commands'] } },
    { learning: { studyTags: ['app-troubleshooting'] } },
  ];
  const stats = buildCore2ModuleStats(questions);
  const counts = Object.fromEntries(stats.map((module) => [module.id, module.count]));

  assert.equal(getCore2StudyModules({ includeAll: true }).length, 6);
  assert.equal(counts.all, 3);
  assert.equal(counts.security, 1);
  assert.equal(counts['remote-network'], 1);
  assert.equal(counts['os-commands'], 1);
  assert.equal(counts['app-troubleshooting'], 1);
  assert.equal(counts['ops-support'], 0);
});
