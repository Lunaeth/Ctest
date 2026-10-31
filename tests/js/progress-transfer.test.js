import test from 'node:test';
import assert from 'node:assert/strict';
import {KEYS,snapshot,validate,restore} from '../../portal/progress-data.js';
function memory(initial={}) {
  const data=new Map(Object.entries(initial));
  return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
}
test('progress transfer preserves all bank data and leaves unrelated keys untouched',()=>{
  const source=memory({[KEYS[0]]:JSON.stringify({ccnp:{1:{correct:true}},nca:{2:{correct:false}}}),[KEYS[1]]:'[1,2]',[KEYS[4]]:'{"bankId":"nca"}',unrelated:'private'});
  const target=memory({unrelated:'keep',[KEYS[2]]:'{"en":[3]}'});
  const file=snapshot(source);restore(target,file);
  assert.deepEqual(snapshot(target).entries,file.entries);
  assert.equal(target.getItem('unrelated'),'keep');
  assert.equal(source.getItem('unrelated'),'private');
});
test('invalid or additional fields are rejected before any destination mutation',()=>{
  const target=memory({[KEYS[0]]:'{"old":true}'}),before=snapshot(target).entries;
  for(const mutate of [x=>x.version=99,x=>x.entries.extra='{}',x=>delete x.entries[KEYS[0]],x=>x.entries[KEYS[0]]='invalid',x=>x.entries[KEYS[0]]='"not-an-object"']) {
    const file=snapshot(memory());mutate(file);assert.throws(()=>restore(target,file));assert.deepEqual(snapshot(target).entries,before);
  }
});
test('storage failure rolls back writes and deletions',()=>{
  const target=memory(Object.fromEntries(KEYS.map(k=>[k,'{"old":true}']))),before=snapshot(target).entries;
  const original=target.setItem;let calls=0;
  target.setItem=(k,v)=>{if(++calls===2)throw new Error('quota');original(k,v);};
  const source=memory({[KEYS[1]]:'{}',[KEYS[2]]:'{}'});
  assert.throws(()=>restore(target,snapshot(source)),/已还原/);
  assert.deepEqual(snapshot(target).entries,before);
});
test('oversized values and malformed envelopes cannot be imported',()=>{
  assert.throws(()=>validate(null));assert.throws(()=>validate({format:'lunaeth-study-progress',version:1,entries:[]}));
  const file=snapshot(memory());file.entries[KEYS[0]]=' '.repeat(5_000_001);assert.throws(()=>validate(file));
});
