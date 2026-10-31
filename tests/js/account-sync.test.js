import test from 'node:test';
import assert from 'node:assert/strict';
import { createAccountStorage, accountRequest } from '../../src/account-sync.js';
const key='question-app.progress';
const options=(extra={})=>({initial:{revision:0,entries:{}},csrfToken:'csrf',delay:60_000,makeId:()=>crypto.randomUUID(),...extra});
test('changes made during a save are sent afterward with the new revision',async()=>{
  let release;const gate=new Promise(resolve=>release=resolve),calls=[];
  const storage=createAccountStorage(options({request:async(_url,opts)=>{
    calls.push(JSON.parse(opts.body));if(calls.length===1)await gate;return{revision:calls.length};
  }}));
  storage.set(key,{ncaAiio:{1:true}});const flush=storage.flush();
  storage.set(key,{ncaAiio:{1:true,2:true}});release();await flush;
  assert.equal(calls.length,2);assert.equal(calls[1].revision,1);
  assert.deepEqual(JSON.parse(calls[1].entries[key]),{ncaAiio:{1:true,2:true}});
  assert.equal(storage.hasUnsaved(),false);storage.stop();
});
test('a lost response retries the identical request id and snapshot before later edits',async()=>{
  let attempts=0;const calls=[];
  const storage=createAccountStorage(options({request:async(_url,opts)=>{
    calls.push(JSON.parse(opts.body));if(++attempts===1)throw new Error('network');
    return{revision:attempts-1};
  }}));
  storage.set(key,{first:true});await assert.rejects(storage.flush());
  storage.set(key,{second:true});await storage.flush();
  assert.deepEqual(calls[0],calls[1]);assert.notEqual(calls[1].writeId,calls[2].writeId);
  assert.deepEqual(JSON.parse(calls[2].entries[key]),{second:true});storage.stop();
});
test('revision conflicts never retry as an unconditional overwrite and retain exportable data',async()=>{
  let count=0;const statuses=[];
  const storage=createAccountStorage(options({onStatus:s=>statuses.push(s),request:async()=>{
    count++;throw Object.assign(new Error('conflict'),{status:409});
  }}));
  storage.set(key,{mine:true});await assert.rejects(storage.flush());await assert.rejects(storage.flush());
  assert.equal(count,1);assert.equal(statuses.at(-1).state,'blocked');
  assert.deepEqual(JSON.parse(storage.snapshot()[key]),{mine:true});storage.stop();
});
test('account storage cannot read or mutate another account or browser guest storage',async()=>{
  const first=createAccountStorage(options({initial:{revision:2,entries:{[key]:'{"alice":true}'}}}));
  const second=createAccountStorage(options());
  const read=first.get(key,{});read.alice=false;
  assert.deepEqual(first.get(key,{}),{alice:true});assert.deepEqual(second.get(key,{}),{});
  second.set(key,{bob:true});assert.deepEqual(first.get(key,{}),{alice:true});first.stop();second.stop();
});
test('no change produces no write, and removed fields do not reappear',async()=>{
  let calls=0,payload;
  const storage=createAccountStorage(options({initial:{revision:1,entries:{[key]:'{"same":true}'}},request:async(_url,opts)=>{
    calls++;payload=JSON.parse(opts.body);return{revision:2};
  }}));
  storage.set(key,{same:true});await storage.flush();assert.equal(calls,0);
  storage.remove(key);await storage.flush();assert.equal(calls,1);assert.equal(Object.hasOwn(payload.entries,key),false);storage.stop();
});
test('a rejected oversized snapshot can be reduced and retried',async()=>{
  let calls=0;
  const storage=createAccountStorage(options({request:async(_url,opts)=>{
    if(++calls===1)throw Object.assign(new Error('too big'),{status:413});
    assert.deepEqual(JSON.parse(JSON.parse(opts.body).entries[key]),{small:true});return{revision:1};
  }}));
  storage.set(key,{large:true});await assert.rejects(storage.flush());
  storage.set(key,{small:true});await storage.flush();assert.equal(storage.hasUnsaved(),false);storage.stop();
});
test('network and proxy HTML errors produce actionable messages without leaking internal response text',async()=>{
  await assert.rejects(accountRequest('/api/config',{fetchImpl:async()=>{throw new TypeError('Failed to fetch');}}),/网络连接失败/);
  await assert.rejects(accountRequest('/api/config',{fetchImpl:async()=>({status:502,json:async()=>{throw new SyntaxError('nginx upstream details');}})}),error=>error.status===502&&!error.message.includes('nginx'));
});
