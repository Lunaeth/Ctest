import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {initializeAiMap} from '../../src/ai-map-page.js';

const data=Object.fromEntries(['ccnp-dcai','ccnp-dcai.review','nca-aiio'].map(name=>[
  `./data/questions.${name}.json`,JSON.parse(fs.readFileSync(`data/questions.${name}.json`,'utf8'))]));
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function environment(search='') {
  const elements=new Map();
  function element() {
    return {value:'',innerHTML:'',textContent:'',hidden:false,disabled:false,children:[],listeners:{},
      addEventListener(type,handler){this.listeners[type]=handler;},
      replaceChildren(){this.children=[];},append(child){this.children.push(child);},scrollIntoView(){this.scrolled=true;}};
  }
  for(const id of ['bank','module','search','nodes','questions','status','retry','learn','clear'])elements.set(`#ai-map-${id}`,element());
  const doc={querySelector:selector=>elements.get(selector),createElement:()=>element()};
  const win={location:new URL(`https://study.test/ai-map.html${search}`),listeners:{},
    addEventListener(type,handler){this.listeners[type]=handler;},history:{replaceState(_state,_empty,url){win.location=new URL(url);}}};
  return {document:doc,window:win,get:id=>elements.get(`#ai-map-${id}`)};
}
const fetchData=async file=>({ok:true,json:async()=>structuredClone(data[file])});

test('map initializes from a bilingual search URL and clear/filter controls update visible results and URL',async()=>{
  const env=environment('?bank=ncaAiio&module=ai-networking&q=RDMA');
  await initializeAiMap({...env,fetch:fetchData});
  assert.equal(env.get('bank').value,'ncaAiio');assert.equal(env.get('module').value,'ai-networking');
  assert.match(env.get('status').textContent,/NCA-AIIO/);
  assert.match(env.get('questions').innerHTML,/RDMA/);assert.doesNotMatch(env.get('questions').innerHTML,/CCNP-DCAI/);
  env.get('search').value='zzzero-matches';env.get('search').listeners.input();
  assert.match(env.get('questions').innerHTML,/No matches/);
  assert.equal(env.window.location.searchParams.get('q'),'zzzero-matches');
  env.get('clear').listeners.click();
  assert.equal(env.get('module').value,'all');assert.equal(env.get('search').value,'');
  assert.match(env.get('status').textContent,/116 \/ 116/);
  assert.equal(env.window.location.searchParams.has('q'),false);
  let prevented=false;
  env.get('nodes').listeners.click({target:{closest:()=>({dataset:{mapModule:'power-cooling'}})},preventDefault(){prevented=true;}});
  assert.equal(prevented,true);assert.match(env.get('status').textContent,/6 \/ 116/);
  assert.equal(env.window.location.searchParams.get('module'),'power-cooling');
});

test('failed bank load offers retry and never renders stale cards as the selected bank',async()=>{
  const env=environment('?bank=ccnpDcai');let fail=true;
  const fetch=async file=>fail?{ok:false}:fetchData(file);
  await initializeAiMap({...env,fetch});
  assert.equal(env.get('retry').hidden,false);assert.equal(env.get('questions').innerHTML,'');
  assert.equal(env.get('module').disabled,true);assert.match(env.get('status').textContent,/Unable to load/);
  fail=false;env.get('retry').listeners.click();await flush();
  assert.equal(env.get('retry').hidden,true);assert.equal(env.get('module').disabled,false);
  assert.match(env.get('status').textContent,/60 \/ 60/);
  assert.match(env.get('questions').innerHTML,/id="question-36"/);
});

test('a late bank response cannot replace the newer selected bank',async()=>{
  const env=environment('?bank=ccnpDcai');let resolveOld;
  const delayed=new Promise(resolve=>{resolveOld=resolve;});
  const loading=initializeAiMap({...env,fetch:async file=>file==='./data/questions.ccnp-dcai.json'?delayed:fetchData(file)});
  env.get('bank').value='ncaAiio';env.get('bank').listeners.change();await flush();
  assert.match(env.get('status').textContent,/NCA-AIIO/);
  resolveOld(await fetchData('./data/questions.ccnp-dcai.json'));await loading;
  assert.equal(env.get('bank').value,'ncaAiio');assert.match(env.get('status').textContent,/NCA-AIIO/);
  assert.doesNotMatch(env.get('questions').innerHTML,/CCNP-DCAI/);
});
