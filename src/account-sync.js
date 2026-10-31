import { DEFAULT_KEYS } from './storage.js';

const allowed = new Set(Object.values(DEFAULT_KEYS));

export async function accountRequest(path, { fetchImpl = globalThis.fetch, ...options } = {}) {
  let response;
  try {
    response = await fetchImpl(path, {
      credentials: 'same-origin', cache: 'no-store', ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: options.signal ?? AbortSignal.timeout(15_000),
    });
  } catch { throw new Error('网络连接失败，请检查网络后重试。'); }
  let value;
  try { value = await response.json(); }
  catch { throw Object.assign(new Error('账号服务暂时不可用，请稍后重试。'), { status: response.status }); }
  if (!response.ok) {
    const error = new Error(value?.message || '账号服务暂时不可用。');
    error.status = response.status;
    error.code = value?.error;
    throw error;
  }
  return value;
}

/** Synchronous app storage with serialized, revision-checked server writes. */
export function createAccountStorage({ initial, csrfToken, request = accountRequest, onStatus = () => {},
  delay = 400, makeId = () => crypto.randomUUID() }) {
  let entries = { ...initial.entries };
  let revision = initial.revision;
  let version = 0, savedVersion = 0, timer = null, running = null, pending = null;
  let fatal = false, lastError = null, stopped = false;
  const notify = (state, message) => onStatus({ state, message, dirty: version !== savedVersion });
  const changed = () => {
    version += 1;
    if (fatal || lastError || stopped) return;
    notify('pending', '有新记录，等待同步…');
    clearTimeout(timer);
    timer = setTimeout(() => { api.flush().catch(() => {}); }, delay);
  };
  const api = {
    mode: 'account',
    get(key, fallback) {
      try { return entries[key] == null ? fallback : JSON.parse(entries[key]); }
      catch { return fallback; }
    },
    set(key, value) {
      if (!allowed.has(key)) throw new Error('Unsupported study storage key');
      const raw = JSON.stringify(value);
      if (entries[key] !== raw) { entries[key] = raw; changed(); }
    },
    remove(key) { if (Object.hasOwn(entries, key)) { delete entries[key]; changed(); } },
    hasUnsaved() { return version !== savedVersion; },
    snapshot() { return Object.fromEntries([...allowed].map(key => [key, entries[key] ?? null])); },
    replace(next) {
      if (Object.keys(next).some(key => !allowed.has(key))) throw new Error('Unsupported study storage key');
      entries = { ...next }; changed();
    },
    stop() { stopped = true; clearTimeout(timer); },
    flush() {
      clearTimeout(timer);
      if (running) return running;
      if (fatal || stopped) return Promise.reject(lastError || new Error('同步已停止，请导出记录后重新登录。'));
      lastError = null;
      running = (async () => {
        while (version !== savedVersion || pending) {
          pending ??= { revision, entries: { ...entries }, writeId: makeId(), version };
          const { version: sendingVersion, ...payload } = pending;
          notify('saving', '正在同步…');
          try {
            const result = await request('/api/progress', {
              method: 'PUT', headers: { 'X-CSRF-Token': csrfToken }, body: JSON.stringify(payload),
            });
            if (!Number.isInteger(result.revision) || result.revision <= revision) throw new Error('服务器同步响应无效。');
            revision = result.revision; savedVersion = sendingVersion; pending = null;
          } catch (error) {
            lastError = error;
            if ([400, 413, 422].includes(error.status)) pending = null;
            fatal = [401, 403, 409].includes(error.status);
            notify(fatal ? 'blocked' : 'error', error.message || '同步失败，请检查网络后重试。');
            throw error;
          }
        }
        notify('saved', '已同步到账号');
      })().finally(() => { running = null; });
      return running;
    },
  };
  return api;
}
