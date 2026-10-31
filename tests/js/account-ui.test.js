import test from 'node:test';
import assert from 'node:assert/strict';
import { startAccountApp } from '../../src/account-ui.js';
import { KEYS } from '../../portal/progress-data.js';

test('a logged-out guest can export the complete whitelisted learning archive', async t => {
  const actions = [], nodes = new Map(), downloads = [];
  const entries = Object.fromEntries(KEYS.map(key => [key, null]));
  entries['question-app.progress'] = JSON.stringify({ ccnpDcai: { 1: { correct: true } } });
  const storage = { getItem: key => entries[key] ?? null };
  const makeElement = () => ({
    textContent: '', dataset: {},
    setAttribute() {},
    addEventListener(name, callback) { this[name] = callback; },
    append(node) { actions.push(node); },
    prepend() {},
    querySelector(selector) {
      if (!nodes.has(selector)) nodes.set(selector, makeElement());
      return nodes.get(selector);
    },
  });
  const document = {
    querySelector: () => makeElement(),
    createElement(tag) {
      if (tag === 'a') {
        const link = { click() { downloads.push(this); } };
        return link;
      }
      return makeElement();
    },
  };
  for (const [key, value] of Object.entries({ document,
    window: { localStorage: storage, addEventListener() {} }, localStorage: storage })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
    t.after(() => original ? Object.defineProperty(globalThis, key, original) : delete globalThis[key]);
  }
  t.mock.method(globalThis, 'fetch', async path => ({ ok: true, json: async () =>
    path === '/api/config' ? { registrationEnabled: false } : { user: null, csrfToken: null } }));
  let artifact;
  t.mock.method(URL, 'createObjectURL', blob => { artifact = blob; return 'blob:guest-archive'; });
  t.mock.method(globalThis, 'setTimeout', () => 0);
  await startAccountApp(async () => {});
  actions.find(button => button.textContent === '导出本地记录').click();
  assert.equal(downloads.length, 1);
  assert.match(downloads[0].download, /^study-guest-.*\.json$/);
  const result = JSON.parse(await artifact.text());
  assert.equal(result.format, 'lunaeth-study-progress');
  assert.deepEqual(result.entries, entries);
});
