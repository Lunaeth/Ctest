export const KEYS = ['progress','mistakes','favorites','exam-history','preferences','current-practice','current-exam','pending-core2-module-practice'].map(x => `question-app.${x}`);
export function snapshot(storage) {
  return {format:'lunaeth-study-progress',version:1,createdAt:new Date().toISOString(),entries:Object.fromEntries(KEYS.map(k=>[k,storage.getItem(k)]))};
}
export function validate(value) {
  if (!value || value.format !== 'lunaeth-study-progress' || value.version !== 1 || !value.entries || typeof value.entries !== 'object' || Array.isArray(value.entries)) throw new Error('这不是支持的学习记录文件。');
  if (Object.keys(value.entries).length !== KEYS.length || Object.keys(value.entries).some(k=>!KEYS.includes(k))) throw new Error('文件包含不支持的记录字段。');
  for (const key of KEYS) {
    const raw=value.entries[key];
    if(raw===null) continue;
    if(typeof raw!=='string' || raw.length>5_000_000) throw new Error('记录格式或大小异常。');
    const decoded=JSON.parse(raw);
    if(decoded!==null && typeof decoded!=='object') throw new Error('记录结构异常。');
  }
  return value.entries;
}
export function restore(storage, value) {
  const entries=validate(value), before=snapshot(storage).entries;
  try { for(const key of KEYS) entries[key]===null ? storage.removeItem(key) : storage.setItem(key,entries[key]); }
  catch(error) {
    try { for(const key of KEYS) before[key]===null ? storage.removeItem(key) : storage.setItem(key,before[key]); }
    catch { throw new Error('导入失败，自动还原未完成。请保留备份文件并重新导入备份。'); }
    throw new Error('导入失败，已还原原有记录。请检查浏览器存储空间。');
  }
}
