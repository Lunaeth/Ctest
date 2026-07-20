import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { SECURITY_PLUS_DOMAINS } from '../../src/security-plus-study-map.js';

test('Security+ visual map covers all five SY0-701 exam domains', () => {
  assert.deepEqual(
    SECURITY_PLUS_DOMAINS.map((domain) => domain.number),
    ['1.0', '2.0', '3.0', '4.0', '5.0'],
  );
  assert.equal(SECURITY_PLUS_DOMAINS.reduce((sum, domain) => (
    sum + Number.parseInt(domain.weight, 10)
  ), 0), 100);
  assert.ok(SECURITY_PLUS_DOMAINS.every((domain) => domain.flow.length >= 4));
  assert.ok(SECURITY_PLUS_DOMAINS.every((domain) => domain.traps.length >= 3));
});

test('Security+ visual page links domain cards back to focused learning', () => {
  const html = fs.readFileSync('./security-plus-visual.html', 'utf8');
  const pageScript = fs.readFileSync('./src/security-plus-visual-page.js', 'utf8');

  assert.match(html, /security-plus-domains/);
  assert.match(html, /Security\+ Study Map/);
  assert.match(pageScript, /start-security-plus-module/);
  assert.match(pageScript, /activeBankId = 'securityPlus'/);
  assert.match(pageScript, /securityPlus:\$\{moduleId\}/);
});
