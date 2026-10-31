import {snapshot,restore} from './progress-data.js?v=20261030-english-questions';
const status=document.querySelector('#status');
const isNew=location.hostname==='learn.lunaeth.com';
document.querySelector('#export-panel').hidden=isNew;
document.querySelector('#import-panel').hidden=!isNew;
status.textContent=isNew?'选择旧站导出的文件。':'点击下载，保存旧站记录。';
function download(){
  try {
    const data=snapshot(localStorage);
    if(Object.values(data.entries).every(x=>x===null)){status.textContent='当前浏览器在此站点没有学习记录。请使用之前刷题的浏览器和配置。';return;}
    const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`lunaeth-progress-${location.hostname}-${new Date().toISOString().replaceAll(':','-')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
    status.textContent='已生成下载文件，确认文件保存后再进行下一步。';
  } catch {status.textContent='无法读取浏览器存储，请检查隐私或存储设置。';}
}
document.querySelector('#export').addEventListener('click',download);
document.querySelector('#backup').addEventListener('click',download);
document.querySelector('#import').addEventListener('click',async()=>{
  if(!isNew)return;
  const file=document.querySelector('#file').files[0];
  if(!file){status.textContent='请先选择记录文件。';return;}
  if(!document.querySelector('#consent').checked){status.textContent='请先备份需要保留的新站记录，并勾选替换确认。';return;}
  if(file.size>10_000_000){status.textContent='文件过大，无法导入。';return;}
  try {restore(localStorage,JSON.parse(await file.text()));status.textContent='导入成功！现在可以进入刷题系统继续学习。';}
  catch(error){status.textContent=error.message;}
});
