import { AI_BANKS,getAiStudyModules,aiStudyUrl,filterAiStudyQuestions } from './ai-study.js?v=20261031-ai-accounts';
import { renderAiModuleMap,renderAiMapQuestions } from './ai-study-map.js?v=20261031-ai-accounts';

export async function initializeAiMap({document=globalThis.document,window=globalThis.window,fetch=globalThis.fetch}={}) {
  const bankSelect=document.querySelector('#ai-map-bank');
  const moduleSelect=document.querySelector('#ai-map-module');
  const search=document.querySelector('#ai-map-search');
  const nodes=document.querySelector('#ai-map-nodes');
  const cards=document.querySelector('#ai-map-questions');
  const status=document.querySelector('#ai-map-status');
  const retry=document.querySelector('#ai-map-retry');
  const learn=document.querySelector('#ai-map-learn');
  const cache=new Map();
  let generation=0,questions=[];
  function readLocation() {
    const params=new URLSearchParams(window.location.search);
    bankSelect.value=Object.hasOwn(AI_BANKS,params.get('bank'))?params.get('bank'):'ccnpDcai';
    search.value=params.get('q')??'';
    return params.get('module')??'all';
  }
  function updateLocation() {
    const url=new URL(window.location.href);
    url.searchParams.set('bank',bankSelect.value);
    if(moduleSelect.value==='all')url.searchParams.delete('module');else url.searchParams.set('module',moduleSelect.value);
    if(search.value.trim())url.searchParams.set('q',search.value.trim());else url.searchParams.delete('q');
    url.hash='';
    window.history.replaceState(null,'',url);
  }
  function render({writeUrl=true}={}) {
    const bankId=bankSelect.value,moduleId=moduleSelect.value,query=search.value;
    nodes.innerHTML=renderAiModuleMap(questions,bankId,moduleId);
    cards.innerHTML=renderAiMapQuestions(questions,{bankId,moduleId,query});
    const shown=filterAiStudyQuestions(questions,{bankId,moduleId,query});
    status.textContent=`${AI_BANKS[bankId].label} · ${shown.length} / ${questions.length} 题 · 点击卡片展开知识与推理流程`;
    learn.href=aiStudyUrl(bankId,{moduleId});
    if(writeUrl)updateLocation();
  }
  async function loadBank(moduleId='all') {
    const request=++generation,bankId=bankSelect.value;
    questions=[];nodes.innerHTML='';cards.innerHTML='';retry.hidden=true;
    moduleSelect.disabled=true;search.disabled=true;learn.hidden=true;
    status.textContent='正在加载题库 / Loading question bank…';
    try {
      let loaded=cache.get(bankId);
      if(!loaded) {
        const config=AI_BANKS[bankId];
        const batches=await Promise.all([config.file,...(config.reviewFile?[config.reviewFile]:[])].map(async file=>{
          const response=await fetch(file);
          if(!response.ok)throw new Error('Question bank request failed');
          const batch=await response.json();
          if(!Array.isArray(batch)||batch.some(q=>q.aiStudy?.bankId!==bankId))throw new Error('Invalid question bank');
          return batch;
        }));
        loaded=batches.flat().sort((a,b)=>a.id-b.id);
        cache.set(bankId,loaded);
      }
      if(request!==generation)return;
      questions=loaded;
      moduleSelect.replaceChildren();
      for(const module of [{id:'all',label:'All modules｜全部模块'},...getAiStudyModules(bankId)]) {
        const option=document.createElement('option');option.value=module.id;option.textContent=module.label;moduleSelect.append(option);
      }
      moduleSelect.value=getAiStudyModules(bankId).some(m=>m.id===moduleId)?moduleId:'all';
      moduleSelect.disabled=false;search.disabled=false;learn.hidden=false;
      render({writeUrl:false});
      if(/^#question-\d+$/.test(window.location.hash))document.querySelector(window.location.hash)?.scrollIntoView({block:'start'});
    } catch {
      if(request!==generation)return;
      status.textContent='题库加载失败，请重试。 / Unable to load this bank. Please retry.';
      retry.hidden=false;
    }
  }
  bankSelect.addEventListener('change',()=>{search.value='';moduleSelect.value='all';updateLocation();void loadBank();});
  moduleSelect.addEventListener('change',()=>render());
  search.addEventListener('input',()=>render());
  retry.addEventListener('click',()=>void loadBank());
  document.querySelector('#ai-map-clear').addEventListener('click',()=>{search.value='';moduleSelect.value='all';render();});
  nodes.addEventListener('click',event=>{
    const link=event.target.closest('[data-map-module]');
    if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
    event.preventDefault();moduleSelect.value=link.dataset.mapModule;render();status.scrollIntoView({block:'start'});
  });
  window.addEventListener('popstate',()=>void loadBank(readLocation()));
  await loadBank(readLocation());
}

if(globalThis.document?.querySelector('#ai-map-bank'))void initializeAiMap();
