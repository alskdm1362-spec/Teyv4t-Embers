import {completeJoin,finishCare} from './flow-helpers.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {act,createGame,hydrate,serialize} from '../dist/engine.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
test('both control skips preserve all four recruitment dialogue lines and restore their saved cursor',()=>{
 const s=createGame(718);go(s,{type:'start'});
 for(const hero of ['durin','illuga']){
  const hp=s.hp,gold=s.gold,rng=s.rng,deck=serialize(s.heroes);
  go(s,{type:'skipTutorial'});
  assert.equal(s.phase,'recruit');assert.equal(s.recruitLine,0);assert.equal(s.battle,null);
  assert.equal(s.hp,hp);assert.equal(s.gold,gold);assert.equal(s.rng,rng);assert.equal(serialize(s.heroes),deck);
  const before=serialize(s);assert.equal(act(s,{type:'recruit',hero}).ok,false);assert.equal(serialize(s),before);
  assert.equal(act(s,{type:'skipTutorial'}).ok,false);assert.equal(serialize(s),before);
  go(s,{type:'recruitDialogue'});const loaded=hydrate(serialize(s));assert.equal(loaded.recruitLine,1);
  for(let i=1;i<4;i++)go(loaded,{type:'recruitDialogue'});
  assert.equal(loaded.recruitLine,4);Object.assign(s,loaded);go(s,{type:'recruit',hero});completeJoin(s);
 }
 assert.equal(s.phase,'base');assert.equal(s.node,7);assert.equal(s.battlesWon,0);
});
test('dialogue skip is explicit, phase restricted, and works with legacy recruitment states',()=>{
 const s=qaFixture('partner');const before=serialize(s);assert.equal(act(s,{type:'skipRecruitDialogue'}).ok,false);assert.equal(serialize(s),before);
 go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});assert.equal(s.recruitLine,4);go(s,{type:'recruit',hero:'illuga'});completeJoin(s);
 const base=serialize(s);assert.equal(act(s,{type:'skipTutorial'}).ok,false);assert.equal(act(s,{type:'skipRecruitDialogue'}).ok,false);assert.equal(serialize(s),base);
 const old=qaFixture('recruitTalk1');old.tutorial.active=false;go(old,{type:'skipRecruitDialogue'});assert.equal(old.recruitLine,4);
 for(const key of ['recruitTalk1','recruitTalk2'])assert.equal(qaFixture(key).recruitLine,0);
});
