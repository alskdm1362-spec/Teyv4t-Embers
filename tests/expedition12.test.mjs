import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {act,createGame,hydrate,serialize,ROUTE,HEROES,CARDS,EQUIPMENT,canCare,makeUpgradeOffer,rollLoot,ownedDeck,cardInfo,travelOptions} from '../dist/engine.js';
import {JOIN_LINES,CARE_SCRIPT} from '../dist/story-scripts.js';
import {storyDialogue} from '../dist/story-ui.js';
import {EVENTS} from '../dist/expedition-content.js';
import {qaFixture} from '../dist/qa-fixtures.js';
import {completeJoin,finishCare} from './flow-helpers.mjs';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
const unchanged=(s,a)=>{const before=serialize(s);assert.equal(act(s,a).ok,false);assert.equal(serialize(s),before);};
test('all six tutorial recruitment orders wait for arrival and the full join dialogue, with saved line cursors',()=>{
 for(const first of ['durin','illuga','jahoda'])for(const second of ['durin','illuga','jahoda'].filter(x=>x!==first)){
  const s=createGame(73);go(s,{type:'start'});
  for(const hero of [first,second]){go(s,{type:'skipTutorial'});assert.equal(s.recruitLine,0);go(s,{type:'skipRecruitDialogue'});go(s,{type:'recruit',hero});assert.equal(s.phase,'arrival');assert.equal(s.battle,null);assert.equal(s.checkpoint.phase,'title');unchanged(s,{type:'skipTutorial'});go(s,{type:'ackRecruit'});go(s,{type:'joinNext'});const load=hydrate(serialize(s));assert.equal(load.recruitNotice.line,1);Object.assign(s,load);while(s.phase==='joinDialogue')go(s,{type:'joinNext'});}
  assert.equal(s.phase,'base');assert.equal(s.node,7);assert.equal(s.checkpoint.recruitNotice,null);
 }
});
test('authored story lines and pose cues remain separate, with correct pair artwork and persistent normal pose',()=>{
 assert.deepEqual(Object.values(JOIN_LINES).slice(0,3).map(x=>x.length),[6,8,9]);assert.deepEqual(Object.values(CARE_SCRIPT).slice(0,4).map(x=>x.length),[9,12,11,10]);for(const id of ['kinich','lyney','cyno']){assert.ok(JOIN_LINES[id].length>=3);assert.ok(CARE_SCRIPT[id].at(-1).normal);}
 assert.equal(JOIN_LINES.durin[3].motion,'bounce');assert.equal(JOIN_LINES.jahoda[0].hideLohen,true);assert.equal(JOIN_LINES.jahoda[3].motion,'shake');assert.equal(CARE_SCRIPT.illuga.at(-1).normal,true);
 const hidden=storyDialogue({kind:'join',hero:'jahoda',index:0});assert.doesNotMatch(hidden,/data-story-actor="lohen"/);assert.match(storyDialogue({kind:'join',hero:'jahoda',index:1}),/data-story-actor="lohen"/);
 for(const hero of Object.keys(CARE_SCRIPT)){const normal=CARE_SCRIPT[hero].findIndex(x=>x.normal);for(let i=0;i<CARE_SCRIPT[hero].length;i++){const html=storyDialogue({kind:'care',hero,index:i,broken:true});assert.ok(html.includes(CARE_SCRIPT[hero][i].text));if(normal>=0&&i>=normal)assert.doesNotMatch(html,new RegExp(hero+'-collapse'));for(const match of html.matchAll(/src="([^"]+)"/g))assert.ok(fs.existsSync(new URL('../dist/'+match[1],import.meta.url)));}}
});
test('mental care is collapse-only, one selected hero per base, and cannot be renewed by farming, reload or rewind',()=>{
 const s=qaFixture('care',{hero:'durin'});s.heroes.illuga.breakdown={type:'panic',failures:2};s.heroes.illuga.stress=100;assert.equal(canCare(s,'lohen'),false);unchanged(s,{type:'careStart',hero:'lohen'});go(s,{type:'careStart',hero:'durin'});unchanged(s,{type:'calm',hero:'durin'});go(s,{type:'cancelCare'});assert.equal(s.careUsed,false);finishCare(s,'durin');assert.equal(s.heroes.durin.stress,0);assert.equal(s.heroes.durin.breakdown,null);assert.equal(s.heroes.illuga.stress,100);assert.ok(s.heroes.illuga.breakdown);assert.equal(s.careUsed,true);unchanged(s,{type:'careStart',hero:'illuga'});
 go(s,{type:'farm'});s.phase='reward';s.lastReward=null;go(s,{type:'claimReward'});go(s,{type:'travel',id:'return-base'});assert.equal(s.careUsed,true);assert.equal(hydrate(serialize(s)).careUsed,true);s.phase='defeat';go(s,{type:'restart'});assert.equal(s.careUsed,true);unchanged(s,{type:'careStart',hero:'illuga'});
 s.phase='reward';s.node=10;s.selectedStage=null;go(s,{type:'claimReward'});go(s,{type:'travel',id:'route-11-a'});assert.equal(s.careUsed,false);assert.equal(canCare(s,'illuga'),true);finishCare(s,'illuga');assert.equal(s.heroes.illuga.stress,0);
});
test('camp rest and flame lower stress but cannot clear mental collapse or renew a care use',()=>{
 const s=qaFixture('care');go(s,{type:'heal'});assert.equal(s.heroes.lohen.stress,95);assert.ok(s.heroes.lohen.breakdown);s.phase='camp';s.campActions=[];go(s,{type:'camp',choice:'rest'});assert.ok(s.heroes.lohen.breakdown);assert.equal(s.heroes.lohen.stress,87);unchanged(s,{type:'camp',choice:'calm',hero:'lohen'});unchanged(s,{type:'careStart',hero:'lohen'});
});
test('three-card refinement offers persist, reject unoffered or benched cards, and grant exactly one free upgrade',()=>{
 for(const pair of [['durin','illuga'],['illuga','jahoda']]){const s=qaFixture('base',{pair});s.upgradeOffer=makeUpgradeOffer(s,'base','base');const o=structuredClone(s.upgradeOffer),gold=s.gold;assert.equal(o.candidates.length,3);assert.equal(new Set(o.candidates.map(c=>c.key)).size,3);assert.ok(o.candidates.every(c=>s.party.includes(c.owner)));assert.deepEqual(hydrate(serialize(s)).upgradeOffer,o);
 const absent=Object.entries(CARDS).find(([key,c])=>!c.debuff&&!o.candidates.some(x=>x.key===key));unchanged(s,{type:'upgrade',hero:absent[1].owner,card:absent[0],branch:'A'});const c=o.candidates[0];go(s,{type:'upgrade',hero:c.owner,card:c.key,branch:'B'});assert.equal(s.gold,gold);assert.equal(s.upgradeOffer,null);assert.equal(s.heroes[c.owner].upgrades[c.key],'B');unchanged(s,{type:'upgrade',hero:o.candidates[1].owner,card:o.candidates[1].key,branch:'A'});}
});
test('loot is fixed before claim, skips grant nothing, and inventory/refinement are paid once',()=>{
 const s=qaFixture('reward');s.lastReward={gold:22,xp:10,pending:true,...rollLoot(s,true)};s.lastReward.upgradeOffer=makeUpgradeOffer(s,'loot','travel');const loaded=hydrate(serialize(s)),item=loaded.lastReward.equipment[0],gold=loaded.gold;go(loaded,{type:'claimReward'});assert.equal(loaded.gold,gold+22);assert.equal(loaded.inventory.filter(x=>x===item).length,1);assert.equal(loaded.phase,'refine');const c=loaded.upgradeOffer.candidates[0];go(loaded,{type:'upgrade',hero:c.owner,card:c.key,branch:'A'});assert.equal(loaded.phase,'travel');unchanged(loaded,{type:'claimReward'});
 const skipped=hydrate(serialize(s));go(skipped,{type:'claimReward',skip:true});assert.equal(skipped.phase,'travel');assert.equal(skipped.gold,gold);assert.equal(skipped.inventory.length,0);
});
test('seeded loot sampling matches ordinary versus elite eligibility and never drops elite gear from ordinary mobs',()=>{
 const counts={normal:0,elite:0,rare:0,normalUp:0,eliteUp:0};const s=qaFixture('base');for(let i=0;i<3000;i++){const n=rollLoot(s,false),e=rollLoot(s,true);counts.normal+=n.equipment.length;counts.elite+=e.equipment.length;counts.normalUp+=!!n.upgradeOffer;counts.eliteUp+=!!e.upgradeOffer;assert.ok(n.equipment.every(k=>!EQUIPMENT[k].rarity));counts.rare+=e.equipment.filter(k=>EQUIPMENT[k].rarity==='elite').length;}
 assert.equal(counts.elite,3000);assert.ok(counts.normal>600&&counts.normal<900);assert.ok(counts.rare>600&&counts.rare<900);assert.ok(counts.normalUp>330&&counts.normalUp<570);assert.ok(counts.eliteUp>1450&&counts.eliteUp<1850);
});
test('all event choices are two or three options, apply announced gains/costs once, and cover every benefit type',()=>{
 const kinds=new Set();let dice=0,mystery=0;
 for(const e of EVENTS){assert.ok(e.choices.length>=2&&e.choices.length<=3);for(const c of e.choices){const s=qaFixture('base');s.gold=100;s.phase='event';s.eventOffer=structuredClone(e);const hp=s.hp,gold=s.gold,deck=s.party.flatMap(id=>ownedDeck(s,id)).length;
  go(s,{type:'event',choice:c.id});assert.notEqual(s.phase,'event');unchanged(s,{type:'event',choice:c.id});
  if(c.dice){dice++;assert.equal(typeof s.eventResult.success,'boolean');assert.equal(s.eventResult.dc,c.dice.dc);continue;}
  if(c.mystery){mystery++;assert.ok(s.eventResult.revealed);assert.ok(c.mystery.some(o=>o.benefit.kind===s.eventResult.benefit.kind));continue;}
  kinds.add(c.benefit.kind);const cost=c.cost;
  const pct=n=>Math.round((n||0)*s.maxHp/100);if(!cost.injury)assert.equal(s.hp,Math.min(s.maxHp,hp-pct(cost.hp)+(c.benefit.kind==='heal'?Math.min(pct(c.benefit.amount),s.maxHp-(hp-pct(cost.hp))):0)));
  if(cost.stress)for(const id of s.party)assert.equal(s.heroes[id].stress,35+cost.stress);
  if(c.benefit.kind==='calm')for(const id of s.party)assert.equal(s.heroes[id].stress,Math.max(0,35-c.benefit.amount));
  if(cost.curse)assert.equal(s.party.flatMap(id=>ownedDeck(s,id)).length,deck+cost.curse);
  if(c.benefit.kind==='gold')assert.equal(s.gold,gold+c.benefit.amount-(cost.gold||0));
  if(c.benefit.kind==='equipment'){assert.equal(s.inventory.length,1);if(c.benefit.elite)assert.equal(EQUIPMENT[s.inventory[0]].rarity,'elite');}
  if(c.benefit.kind==='upgrade'){assert.equal(s.phase,'refine');assert.equal(s.upgradeOffer.candidates.length,3);go(s,{type:'skipUpgrade'});}
  if(c.benefit.kind==='card'){assert.equal(s.phase,'cardReward');assert.equal(s.cardOffer.candidates.length,3);const p=s.cardOffer.candidates[0];go(s,{type:'pickCard',hero:p.owner,card:p.key});assert.equal(s.phase,'reward');assert.equal(s.party.flatMap(id=>ownedDeck(s,id)).length,deck+1+(cost.curse||0));}
  if(c.benefit.kind==='remove'){const card=ownedDeck(s,'lohen')[0];go(s,{type:'eventRemoveCard',hero:'lohen',uid:card.uid});assert.equal(ownedDeck(s,'lohen').length,3);assert.equal(s.removalCount,0);}
 }}
 assert.deepEqual([...kinds].sort(),['calm','card','equipment','gold','heal','remove','support','upgrade']);assert.ok(EVENTS.length>=12);assert.ok(dice>=4);assert.ok(mystery>=2);
});
test('earned equipment cannot be duplicated by equipping; elite gear is not a free shop purchase',()=>{
 const s=qaFixture('base');s.inventory=['emberLance'];const gold=s.gold;go(s,{type:'equipOwned',hero:'lohen',item:'emberLance'});assert.equal(s.gold,gold);assert.equal(s.heroes.lohen.equipment.weapon,'emberLance');unchanged(s,{type:'equipOwned',hero:'durin',item:'emberLance'});unchanged(s,{type:'equip',hero:'durin',slot:'weapon',item:'emberLance'});assert.deepEqual(hydrate(serialize(s)).inventory,['emberLance']);
});
test('curse cards have artwork, remain a real negative card despite collapse/eye loss, and persist through saves',()=>{
 const s=qaFixture('base');s.heroes.lohen.curses=[{key:'curse_echo',uid:'curse-test'}];s.heroes.lohen.body.eyes=3;s.heroes.lohen.breakdown={type:'panic',failures:0};const c=ownedDeck(s,'lohen').find(c=>c.uid==='curse-test');assert.equal(cardInfo(s,c).type,'curse');assert.equal(cardInfo(s,c).cost,1);assert.ok(ownedDeck(hydrate(serialize(s)),'lohen').some(c=>c.uid==='curse-test'));
});
test('extended route has sixteen map columns, real events and elites, and every map choice advances exactly one column',()=>{
 assert.equal(ROUTE.length,24);assert.ok(ROUTE.slice(8).filter(n=>n.type==='elite').length>=4);
 for(const seed of [3,81,20261123]){const fresh=qaFixture('base');fresh.seed=seed;fresh.map=null;const s0=hydrate(serialize(fresh));let s=s0;s.phase='travel';s.node=7;s.lane=1;s.selectedStage=null;
  for(let node=7;node<23;node++){const choices=travelOptions(s);assert.ok(choices.length>=1&&choices.length<=3,'choices at '+node);for(const c of choices){const t=hydrate(serialize(s));go(t,{type:'travel',id:c.id});assert.equal(t.node,node+1);assert.equal(t.lane,c.lane);if(c.type==='elite')assert.equal(t.encounterType,'elite');if(c.type==='event')assert.ok(t.eventOffer);}
   const next=hydrate(serialize(s));next.node=node+1;next.lane=choices[choices.length-1].lane;next.phase='travel';s=next;}
 }
 const s=qaFixture('base');go(s,{type:'challenge'});assert.equal(s.phase,'travel');assert.ok(travelOptions(s).every(c=>c.node===8));go(s,{type:'travel',id:travelOptions(s)[0].id});assert.equal(s.node,8);
 const late=qaFixture('lateBase');go(late,{type:'farm'});late.phase='reward';late.lastReward=null;go(late,{type:'claimReward'});go(late,{type:'travel',id:'return-base'});assert.equal(late.node,11);assert.equal(late.phase,'base');
});
