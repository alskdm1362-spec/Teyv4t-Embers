import test from 'node:test';
import assert from 'node:assert/strict';
import {act,ownedDeck,hydrate,serialize} from '../dist/engine.js';
import {qaFixture} from '../dist/qa-fixtures.js';
import {DISCOVERIES,STARTERS} from '../dist/awakening.js';
test('combat awakening adds one persistent physical card; undo and replay reproduce it',()=>{
 const s=qaFixture('awakening'),card=s.battle.hand.find(c=>c.key==='l_pierce');
 const action={type:'play',uid:card.uid,target:s.battle.enemies[0].id};
 const first=act(s,action).events.find(e=>e.type==='awakening');
 assert.ok(DISCOVERIES.lohen.includes(first.card));
 const learned=ownedDeck(s,'lohen').find(c=>c.key===first.card);
 assert.ok(s.battle.hand.some(c=>c.uid===learned.uid));
 assert.deepEqual(ownedDeck(hydrate(serialize(s)),'lohen'),ownedDeck(s,'lohen'));
 assert.ok(act(s,{type:'undo'}).ok);
 assert.equal(ownedDeck(s,'lohen').length,4);
 assert.deepEqual(act(s,action).events.find(e=>e.type==='awakening'),first);
});
test('legacy expeditions keep removed card IDs and acquired starter cards',()=>{
 const s=qaFixture('base');
 for(const h of Object.values(s.heroes))delete h.acquired;
 s.heroes.lohen.removedCards=['lohen-l_guard-3'];
 const migrated=hydrate(serialize(s));
 assert.equal(ownedDeck(migrated,'lohen').length,5);
 assert.ok(ownedDeck(migrated,'lohen').some(c=>c.key==='l_aim'));
 assert.ok(!ownedDeck(migrated,'lohen').some(c=>c.key==='l_guard'));
});
test('every new loadout has four fixed cards and four distinct discoveries',()=>{
 const s=qaFixture('base');
 for(const id of Object.keys(STARTERS)){
  assert.deepEqual(ownedDeck(s,id).map(c=>c.key),STARTERS[id]);
  assert.equal(STARTERS[id].length,4);
  assert.equal(new Set(DISCOVERIES[id]).size,4);
  assert.ok(DISCOVERIES[id].every(key=>!STARTERS[id].includes(key)));
 }
});
