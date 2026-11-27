import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGame,act,serialize,hydrate,HEROES,ROUTE,formationError,defaultFormation,lohenFixed,expeditionCleared,partyMaxHp,PARTY_SIZE,heroStats} from '../dist/engine.js';
import {qaFixture,QA_SCENARIOS} from '../dist/qa-fixtures.js';
import {botTurn,botExpedition} from './flow-helpers.mjs';

const go=(s,a)=>{const r=act(s,a);assert.equal(r.ok,true,r.error);return r;};
const no=(s,a,pattern)=>{const before=serialize(s),r=act(s,a);assert.equal(r.ok,false);if(pattern)assert.match(r.error,pattern);assert.equal(serialize(s),before);};
const read=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');
function lobby({cleared=false,seed=5}={}){const s=createGame(seed,{tutorial:false});s.collection.tutorialDone=true;s.collection.endings=cleared?['first-front']:[];go(s,{type:'newGame',seed});return s;}

test('v0.36 stage 6: all seven combatants are open and the party is three distinct picks',()=>{
 assert.equal(Object.keys(HEROES).length,7);assert.equal(PARTY_SIZE,3);const s=lobby();
 assert.equal(s.phase,'lobby');assert.equal(s.runActive,false);
 for(const bad of [undefined,[],['lohen','durin'],['lohen','durin','durin'],['lohen','durin','mitya'],['lohen','durin','illuga','jahoda']])assert.ok(formationError(s,bad),JSON.stringify(bad));
 for(const a of Object.keys(HEROES))for(const b of Object.keys(HEROES))if(a<b&&a!=='lohen'&&b!=='lohen')assert.equal(formationError(s,['lohen',a,b]),'');
});

test('v0.36 stage 6: Lohen is fixed until the first clear, then any three may leave',()=>{
 const first=lobby();assert.equal(lohenFixed(first),true);assert.equal(expeditionCleared(first),false);assert.match(formationError(first,['durin','illuga','jahoda']),/로엔/);
 no(first,{type:'newExpedition'},/3명/);no(first,{type:'newExpedition',party:['kinich','lyney','cyno']},/로엔/);
 const later=lobby({cleared:true});assert.equal(lohenFixed(later),false);assert.equal(formationError(later,['kinich','lyney','cyno']),'');
 go(later,{type:'newExpedition',party:['kinich','lyney','cyno'],seed:3});assert.deepEqual(later.party,['kinich','lyney','cyno']);assert.equal(later.phase,'battle');
});

test('v0.36 stage 6: a picked party leaves at full strength with no recruiting on the road',()=>{
 const s=lobby();go(s,{type:'newExpedition',party:['illuga','lohen','cyno'],seed:11});
 assert.deepEqual(s.party,['lohen','illuga','cyno'],'Lohen leads when present');assert.equal(s.runActive,true);assert.equal(s.tutorial.active,false);
 assert.equal(s.maxHp,heroStats('lohen').hp+heroStats('illuga').hp+heroStats('cyno').hp);assert.equal(s.hp,s.maxHp);assert.equal(s.maxHp,partyMaxHp(s));
 assert.deepEqual(s.collection.unlocked.slice().sort(),Object.keys(HEROES).sort());assert.deepEqual(s.collection.lastParty,s.party);
 assert.equal(s.node,0);assert.equal(s.battle.enemies.length,2,'the opening patrol is sized for three');
 const seen=[];for(let n=0;n<4000&&s.phase!=='base';n++){
  if(!seen.includes(s.node))seen.push(s.node);assert.notEqual(s.phase,'recruit');assert.notEqual(s.phase,'arrival');assert.notEqual(s.phase,'joinDialogue');
  if(s.phase==='battle')botTurn(s);else if(s.phase==='reward')go(s,{type:'advance'});else if(s.phase==='event')go(s,{type:'event',choice:s.eventOffer.choices.at(-1).id});else if(s.phase==='camp'){go(s,{type:'camp',choice:'rest'});go(s,{type:'leaveCamp'});}
  else if(s.phase==='cardReward')go(s,{type:'skipCard'});else if(s.phase==='refine')go(s,{type:'skipUpgrade'});else if(s.phase==='eventRemove')go(s,{type:'eventRemoveCard',skip:true});else if(s.phase==='defeat')go(s,{type:'restart'});else assert.fail('phase '+s.phase);
 }
 assert.equal(s.phase,'base');assert.equal(s.node,7);assert.deepEqual(seen.filter(n=>ROUTE[n].type==='recruit'),[]);assert.deepEqual(seen,[0,2,4,5,6]);assert.equal(s.party.length,3);
});

test('v0.36 stage 6: the last party is offered again, and Lohen is put back while he is fixed',()=>{
 const s=lobby({cleared:true});assert.deepEqual(defaultFormation(s),['lohen','durin','illuga']);
 s.collection.lastParty=['kinich','lyney','cyno'];assert.deepEqual(defaultFormation(s),['kinich','lyney','cyno']);
 s.collection.endings=[];assert.deepEqual(defaultFormation(s),['lohen','kinich','lyney']);
 s.collection.lastParty=['ghost'];assert.equal(formationError(s,defaultFormation(s)),'');
});

test('v0.36 stage 6: swapping at a base follows the same Lohen rule and keeps party HP in step',()=>{
 const s=qaFixture('base');assert.equal(lohenFixed(s),true);no(s,{type:'swap',out:'lohen',in:'kinich'},/로엔/);
 const out=s.party.find(id=>id!=='lohen');go(s,{type:'swap',out,in:'cyno'});assert.ok(s.party.includes('cyno'));assert.equal(s.maxHp,partyMaxHp(s));assert.ok(s.hp<=s.maxHp);assert.deepEqual(s.collection.lastParty,s.party);
 s.collection.endings=['first-front'];go(s,{type:'swap',out:'lohen',in:'kinich'});assert.ok(!s.party.includes('lohen'));assert.equal(s.maxHp,partyMaxHp(s));
});

test('v0.36 stage 6: the tutorial still meets two companions on the road, chosen from the other six',()=>{
 const s=createGame(9);go(s,{type:'start'});assert.deepEqual(s.party,['lohen']);assert.equal(s.tutorial.active,true);no(s,{type:'newExpedition',party:['lohen','durin','illuga']});
 go(s,{type:'skipTutorial'});assert.equal(s.phase,'recruit');go(s,{type:'skipRecruitDialogue'});
 const app=read('app.js');assert.ok(app.includes("options=Object.keys(HEROES).filter(id=>!state.party.includes(id))"));assert.equal(Object.keys(HEROES).filter(id=>!s.party.includes(id)).length,6);
 go(s,{type:'recruit',hero:'cyno'});assert.deepEqual(s.party,['lohen','cyno']);
});

test('v0.36 stage 6: a new campaign after the tutorial waits in the lobby; the lobby opens the party picker',()=>{
 const s=lobby();assert.equal(s.phase,'lobby');const again=hydrate(serialize(s));assert.equal(again.runActive,false);
 const app=read('app.js');assert.ok(app.includes("case'new-expedition':if(state.collection.tutorialDone){partyPick=null;expeditionFormation();}"));assert.ok(app.includes("run({type:'newExpedition',party:[...partyPick]})"));
 assert.ok(app.includes('deploy-toggle'));assert.ok(read('feedback-v28.css').includes('.deploy-roster'));
 assert.ok(QA_SCENARIOS.formation&&QA_SCENARIOS.formationFree);assert.equal(lohenFixed(qaFixture('formation')),true);assert.equal(lohenFixed(qaFixture('formationFree')),false);assert.equal(qaFixture('formation').phase,'lobby');
});

test('v0.36 stage 6: picked parties can walk the whole expedition with legal actions',()=>{
 for(const [party,seed] of [[['lohen','durin','illuga'],20261123],[['lohen','kinich','cyno'],20261123],[['durin','kinich','lyney'],7]]){
  const s=lobby({cleared:true});go(s,{type:'newExpedition',party,seed});const r=botExpedition(s,{maxRestarts:12});
  assert.equal(r.cleared,true,party.join('+')+' at '+s.node);assert.ok(!r.visited.has(1)&&!r.visited.has(3));
 }
});
