import { accountRequest, createAccountStorage } from './account-sync.js';
import { createStorageApi } from './storage.js';
import { snapshot, validate } from '../portal/progress-data.js';

const archiveDisabled = {
  async initialize() { return { supported: false, bound: false, syncState: 'unsupported', message: '账号记录自动同步到服务器；可使用账号栏导出备份。' }; },
};
let widgetPromise;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  widgetPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    const timer = setTimeout(() => { script.remove(); reject(new Error('人机验证加载超时，请关闭窗口后重试。')); }, 20_000);
    script.onload = () => { clearTimeout(timer); resolve(window.turnstile); };
    script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('无法加载人机验证，请检查网络后重试。')); };
    document.head.append(script);
  }).catch(error => { widgetPromise = null; throw error; });
  return widgetPromise;
}

function download(entries, username = 'guest') {
  const content = { format: 'lunaeth-study-progress', version: 1, createdAt: new Date().toISOString(), entries };
  const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url; link.download = `study-${username}-${new Date().toISOString().replaceAll(':', '-')}.json`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export async function startAccountApp(bootstrap) {
  const main = document.querySelector('.content-area');
  const bar = document.createElement('section');
  bar.className = 'account-bar'; bar.setAttribute('aria-label', '账号与同步');
  bar.innerHTML = '<div><strong id="account-name">正在连接账号服务…</strong><span id="account-status" role="status" aria-live="polite"></span></div><div id="account-actions" class="account-actions"></div>';
  main.prepend(bar);
  const name = bar.querySelector('#account-name'), status = bar.querySelector('#account-status'), actions = bar.querySelector('#account-actions');
  const appElement = document.querySelector('#app');
  let storage, account, config, unloading = false, reloadAfterSync = false;
  function button(label, callback) {
    const element = document.createElement('button'); element.type = 'button'; element.textContent = label;
    element.addEventListener('click', callback); actions.append(element); return element;
  }
  function tell(message) { status.textContent = message; }
  function exportCurrent() {
    try { download(storage ? storage.snapshot() : snapshot(localStorage).entries, account?.user.username); }
    catch { tell('无法导出，请检查浏览器存储权限。'); }
  }
  window.addEventListener('beforeunload', event => {
    if (!unloading && storage?.hasUnsaved()) { event.preventDefault(); event.returnValue = ''; }
  });
  try {
    [config, account] = await Promise.all([accountRequest('/api/config'), accountRequest('/api/auth/session')]);
  } catch {
    name.textContent = '暂时无法连接账号服务';
    tell('账号记录尚未加载。可以重试，或明确选择本浏览器的访客记录。');
    appElement.textContent = '请在上方选择重试或本地模式。';
    button('重试连接', () => location.reload());
    button('继续本地模式', async () => {
      actions.replaceChildren(); name.textContent = '访客 · 本地模式'; tell('当前记录只保存在本浏览器中。');
      button('重试账号连接', () => location.reload()); button('导出本地记录', exportCurrent);
      await bootstrap({ storage: createStorageApi() });
    });
    return;
  }

  if (account.user) {
    name.textContent = account.user.username;
    try {
      const initial = await accountRequest('/api/progress');
      storage = createAccountStorage({ initial, csrfToken: account.csrfToken, onStatus: update => {
        tell(update.message); bar.dataset.sync = update.state;
        if (update.state === 'saved' && reloadAfterSync) { unloading = true; location.reload(); }
        if (update.state === 'blocked') {
          appElement.inert = true;
          document.querySelector('.nav-links').inert = true;
          tell(`${update.message} 当前页面已暂停记录操作，请导出备份后刷新。`);
        }
      }});
    } catch {
      tell('无法加载账号记录。为避免覆盖已有进度，暂未打开题库。');
      appElement.textContent = '请重试加载账号记录。';
      button('重新加载', () => location.reload());
      button('退出登录', async () => {
        try { await accountRequest('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': account.csrfToken }, body: '{}' }); location.reload(); }
        catch (error) { tell(error.message); }
      });
      return;
    }
    tell('已同步到账号');
    const migrationLink = document.querySelector('a[href="./portal/progress.html"]');
    migrationLink?.addEventListener('click', event => { event.preventDefault(); openImport(); });
    button('立即同步', async () => { try { await storage.flush(); } catch {} });
    button('导出记录', exportCurrent);
    button('导入记录', () => openImport());
    button('刷新记录', () => location.reload());
    button('退出登录', async () => {
      try {
        await storage.flush();
        await accountRequest('/api/auth/logout', { method: 'POST', headers: { 'X-CSRF-Token': account.csrfToken }, body: '{}' });
        storage.stop(); unloading = true; location.reload();
      } catch (error) { tell(`未退出：${error.message} 可先导出当前记录备份。`); }
    });
    await bootstrap({ storage, archive: archiveDisabled });
  } else {
    name.textContent = '访客 · 本地记录'; tell('登录后可按账号保存进度、错题和收藏。');
    button('登录 / 注册', () => openAuth()); button('导出本地记录', exportCurrent);
    await bootstrap({ storage: createStorageApi() });
  }

  function openImport() {
    const dialog = document.createElement('dialog'); dialog.className = 'account-dialog';
    dialog.innerHTML = '<h2>导入学习记录</h2><p>导入会替换当前账号的记录。请先导出备份，不会自动合并。</p><p><a href="https://ca.lunaeth.com/progress.html" target="_blank" rel="noopener">从旧站 ca 导出记录 ↗</a></p><label>记录文件<input type="file" accept=".json,application/json" id="account-import-file"></label><label class="account-consent"><input type="checkbox" id="account-import-consent"> 我已备份，并同意替换当前账号的记录。</label><p role="status" id="import-message"></p><div class="dialog-actions"><button type="button" id="import-current">导入本浏览器访客记录</button><button type="button" id="import-file">导入文件</button><button type="button" id="import-cancel">取消</button></div>';
    document.body.append(dialog); dialog.showModal();
    dialog.addEventListener('close', () => dialog.remove());
    dialog.querySelector('#import-cancel').onclick = () => dialog.close();
    async function apply(useLocal) {
      const message = dialog.querySelector('#import-message');
      if (!dialog.querySelector('#account-import-consent').checked) { message.textContent = '请先备份并勾选替换确认。'; return; }
      try {
        let data;
        if (useLocal) data = snapshot(localStorage);
        else {
          const file = dialog.querySelector('#account-import-file').files[0];
          if (!file || file.size > 1_800_000) throw new Error('请选择不超过 1.8 MB 的学习记录 JSON 文件。');
          data = JSON.parse(await file.text());
        }
        const next = validate(data);
        if (Object.values(next).every(value => value === null)) throw new Error('所选来源没有学习记录，未执行替换。');
        if (JSON.stringify(next).length > 1_800_000) throw new Error('学习记录过大，暂时无法导入。');
        appElement.inert = true;
        await storage.flush(); reloadAfterSync = true; storage.replace(next); await storage.flush();
      } catch (error) {
        if (!reloadAfterSync && bar.dataset.sync !== 'blocked') appElement.inert = false;
        message.textContent = reloadAfterSync ? `${error.message} 请保留备份；关闭此窗口后可点击“立即同步”重试，成功后页面会刷新。` : error.message;
      }
    }
    dialog.querySelector('#import-current').onclick = () => apply(true);
    dialog.querySelector('#import-file').onclick = () => apply(false);
  }

  function openAuth() {
    const dialog = document.createElement('dialog'); dialog.className = 'account-dialog';
    dialog.innerHTML = '<div class="account-tabs"><button type="button" id="mode-login">登录</button><button type="button" id="mode-register">注册</button></div><h2 id="auth-title">登录账号</h2><p id="auth-description">在不同设备继续你的学习进度。</p><form id="account-form"><label>用户名<input name="username" autocomplete="username" pattern="[A-Za-z0-9_]{3,32}" minlength="3" maxlength="32" required placeholder="3–32 位字母、数字或下划线"></label><label>密码<input name="password" type="password" autocomplete="current-password" minlength="12" maxlength="128" required placeholder="至少 12 个字符"></label><label id="confirm-label" hidden>确认密码<input name="confirm" type="password" autocomplete="new-password" minlength="12" maxlength="128"></label><div id="account-turnstile"></div><p id="auth-message" role="status" aria-live="polite"></p><div class="dialog-actions"><button type="submit" id="auth-submit">登录</button><button type="button" id="auth-cancel">取消</button></div></form><p class="account-note">用户名不区分大小写。注册仅需用户名、密码及人机验证；请妥善保存密码。</p>';
    document.body.append(dialog); dialog.showModal();
    const form = dialog.querySelector('form'), message = dialog.querySelector('#auth-message'), submit = dialog.querySelector('#auth-submit');
    let mode = 'login', token = '', widget = null, modeVersion = 0;
    const close = () => dialog.close();
    dialog.querySelector('#auth-cancel').onclick = close;
    dialog.addEventListener('close', () => {
      modeVersion++; if (widget !== null && window.turnstile) window.turnstile.remove(widget);
      form.reset(); dialog.remove();
    });
    async function changeMode(nextMode) {
      mode = nextMode; token = ''; const generation = ++modeVersion;
      if (widget !== null && window.turnstile) { window.turnstile.remove(widget); widget = null; }
      const register = mode === 'register'; message.textContent = '';
      dialog.querySelector('#auth-title').textContent = register ? '创建账号' : '登录账号';
      submit.textContent = register ? '注册并登录' : '登录'; submit.disabled = register;
      dialog.querySelector('#confirm-label').hidden = !register;
      form.elements.confirm.required = register;
      form.elements.password.autocomplete = register ? 'new-password' : 'current-password';
      if (!register) return;
      if (!config.registrationEnabled) { message.textContent = '注册暂未开放，请稍后再试。'; return; }
      try {
        const turnstile = await loadTurnstile();
        if (generation !== modeVersion || !dialog.open) return;
        widget = turnstile.render(dialog.querySelector('#account-turnstile'), {
          sitekey: config.turnstileSiteKey, action: 'register', theme: 'auto',
          callback: value => { token = value; submit.disabled = false; message.textContent = ''; },
          'expired-callback': () => { token = ''; submit.disabled = true; message.textContent = '验证已过期，请重新验证。'; turnstile.reset(widget); },
          'error-callback': () => { token = ''; submit.disabled = true; message.textContent = '人机验证暂时失败，请关闭窗口后重试。'; },
        });
      } catch (error) { message.textContent = error.message; }
    }
    dialog.querySelector('#mode-login').onclick = () => changeMode('login');
    dialog.querySelector('#mode-register').onclick = () => changeMode('register');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (mode === 'register' && form.elements.password.value !== form.elements.confirm.value) { message.textContent = '两次输入的密码不一致。'; return; }
      if (mode === 'register' && !token) { message.textContent = '请先完成人机验证。'; return; }
      submit.disabled = true;
      try {
        await accountRequest(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify({
          username: form.elements.username.value, password: form.elements.password.value,
          ...(mode === 'register' ? { turnstileToken: token } : {}),
        }) });
        appElement.inert = true; form.reset(); unloading = true; location.reload();
      } catch (error) {
        message.textContent = error.message || '连接失败，请稍后重试。';
        if (mode === 'register' && widget !== null) { token = ''; window.turnstile.reset(widget); }
        else submit.disabled = false;
      }
    });
    form.elements.username.focus();
  }
}
