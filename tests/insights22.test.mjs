import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGame,act,CARDS,cardInfo,ownedDeck,makeUpgradeOffer,serialize,hydrate,predictCardEffect,rollEventOffer,EQUIPMENT} from '../dist/engine.js';
import {INSIGHTS,INSIGHT_BRANCHES,compatibleSparkIds} from '../dist/card-insights.js';
import {ultimateCardArtwork,cardArtwork} from '../dist/cast-art.js';
import {presentationPlan} from '../dist/motion-plan.js';
import {sortSceneDepth} from '../dist/scene-interactions.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
function battle(key,branch=null){
 const owner=CARDS[key].owner,s=createGame(38,{tutorial:false});s.party=[...new Set(['lohen',owner,...['durin','illuga','jahoda'].filter(x=>x!==owner)])].slice(0,3);s.phase='base';s.node=7;go(s,{type:'farm'});
 s.hp=Math.round(s.maxHp*.5);for(const id of s.party)s.heroes[id].shield=0;s.shield=0;s.support=0;s.battle.ap=6;s.battle.noCrit=true;s.battle.hand=[{uid:'one',owner,key}];s.battle.draw=[];s.battle.discard=[];s.battle.exhaust=[];
 for(const e of s.battle.enemies){e.kind='hound';e.hp=e.maxHp=5000;e.ward=0;e.hitWard=0;}
 if(branch)s.heroes[owner].upgrades[key]=branch;return s;
}
function play(s,uid='one'){const c=s.battle.hand.find(x=>x.uid===uid),d=cardInfo(s,c);return go(s,{type:'play',uid,target:d.target==='ally'?'lohen':s.battle.enemies[0].id});}
test('all 28 ordinary cards have four distinct tactics and every branch resolves legally',()=>{
 assert.equal(Object.keys(INSIGHTS).length,44);
 for(const [key,paths]of Object.entries(INSIGHTS)){
  assert.deepEqual(Object.keys(paths),INSIGHT_BRANCHES);assert.equal(new Set(Object.values(paths).map(p=>p.title)).size,4);
  for(const branch of INSIGHT_BRANCHES){const s=battle(key,branch),info=cardInfo(s,s.battle.hand[0]);assert.ok(Number.isFinite(info.cost)&&info.cost>=0);assert.ok(Number.isFinite(info.amount));assert.equal(info.branch,branch);assert.ok(!info.desc.includes('['));play(s);assert.ok(s.hp>=0&&s.hp<=s.maxHp);assert.ok(s.battle.ap>=0&&s.battle.ap<=6);const cards=['hand','draw','discard','exhaust'].flatMap(z=>s.battle[z]);assert.equal(new Set(cards.map(c=>c.uid)).size,cards.length);}
 }
});
test('pierce forecast includes all insight pressure, leaves state untouched, and matches damage',()=>{
 const s=battle('l_pierce','A');s.battle.enemies[0].ward=140;const before=serialize(s),enemy=s.battle.enemies[0].id,p=predictCardEffect(s,'one',enemy);
 assert.equal(serialize(s),before);assert.equal(p.enemies[enemy].damage,214);assert.equal(p.enemies[enemy].wardBroken,true);assert.match(cardInfo(s,s.battle.hand[0]).desc,/장막 추가 압박 89%/);
 const result=play(s);assert.equal(result.events.find(e=>e.type==='damage').amount,214);assert.equal(s.battle.enemies[0].hp,4786);
});
test('shield conversion, healing and block-triggered counter have different payoffs',()=>{
 const attack=battle('i_strike','B');attack.heroes.illuga.shield=300;attack.shield=300;assert.equal(predictCardEffect(attack,'one',attack.battle.enemies[0].id).enemies[attack.battle.enemies[0].id].damage,114);assert.equal(play(attack).events.find(e=>e.type==='damage').amount,114);
 const heal=battle('i_guard','C');heal.battle.hand.push({uid:'two',owner:'illuga',key:'i_guard'});const hp0=heal.hp;play(heal);assert.equal(heal.hp,hp0+Math.round(heal.maxHp*.04));assert.equal(heal.shield,183);play(heal,'two');assert.equal(heal.hp,hp0+Math.round(heal.maxHp*.04));assert.equal(heal.shield,366);
 const counter=battle('i_guard','B');play(counter);assert.equal(counter.heroes.illuga.buffs.reflect,8);counter.battle.enemies=counter.battle.enemies.slice(0,1);const foe=counter.battle.enemies[0];foe.stun=0;foe.intent={name:'시험',damage:10,stress:0,target:'illuga',tag:'시험'};const r=go(counter,{type:'endTurn'});assert.ok(r.events.some(e=>e.type==='reflect'));assert.equal(r.events.find(e=>e.type==='damage'&&e.enemy===foe.id).amount,Math.round(8*80/9*100/110));
});
test('zero-cost self-redraw cannot cycle beyond one proc for the same card name per turn',()=>{
 const s=battle('l_strike','C');s.heroes.lohen.sparks.l_strike='ember_cost';s.battle.ap=0;
 const first=play(s);assert.equal(first.events.filter(e=>e.type==='draw').length,1);assert.equal(s.battle.hand[0].uid,'one');assert.equal(s.battle.ap,0);
 const second=play(s);assert.equal(second.events.filter(e=>e.type==='draw').length,0);assert.equal(s.battle.hand.length,0);assert.equal(s.battle.ap,0);
});
test('duplicate cards share draw/refund limits and an Ember draw limit is shared across the owner',()=>{
 const s=battle('l_strike','C');s.heroes.lohen.sparks.l_strike='ember_draw';s.battle.hand.push({uid:'two',owner:'lohen',key:'l_strike'});s.battle.draw=[{uid:'d1',owner:'durin',key:'d_strike'},{uid:'d2',owner:'durin',key:'d_strike'}];
 assert.equal(play(s).events.filter(e=>e.type==='draw').length,2);assert.equal(play(s,'two').events.filter(e=>e.type==='draw').length,0);
 const wave=battle('d_wave','B');wave.battle.hand.push({uid:'two',owner:'durin',key:'d_wave'});play(wave);assert.equal(wave.battle.ap,5);play(wave,'two');assert.equal(wave.battle.ap,3);go(wave,{type:'endTurn'});assert.deepEqual(wave.battle.effectUsed,{});
});
test('Durin generates a distinct disposable AOE and only one such card per battle',()=>{
 const s=battle('d_charge','D');s.battle.hand.push({uid:'two',owner:'durin',key:'d_charge'});const before=hydrate(serialize(s)),r=play(s),generated=s.battle.hand.find(c=>c.key==='d_resonance');assert.ok(generated);assert.ok(presentationPlan(before,s,{type:'play'},r.events).drawn.includes(generated.uid));
 play(s,'two');assert.equal(s.battle.hand.filter(c=>c.key==='d_resonance').length,1);const hit=play(s,generated.uid);assert.deepEqual(hit.events.filter(e=>e.type==='damage').map(e=>e.amount),[154,154]);assert.ok(s.battle.exhaust.some(c=>c.uid===generated.uid));assert.ok(s.battle.enemies.every(e=>e.crack===1));assert.ok(!ownedDeck(s,'durin').some(c=>c.key==='d_resonance'));
});
test('Jahoda generates a utility card with draw/discard and support; generated cards cannot be upgraded',()=>{
 const s=battle('j_draw','D');play(s);const c=s.battle.hand.find(c=>c.key==='j_dossier');assert.ok(c);s.battle.draw=[{uid:'d1',owner:'lohen',key:'l_strike'},{uid:'d2',owner:'lohen',key:'l_strike'}];const support=s.support;play(s,c.uid);assert.equal(s.support,support+1);assert.equal(s.battle.chooseDiscard,1);assert.ok(s.battle.exhaust.some(x=>x.uid===c.uid));
 s.phase='base';s.upgradeOffer={candidates:[{owner:'jahoda',key:'j_dossier'}],returnPhase:'base'};assert.equal(act(s,{type:'upgrade',hero:'jahoda',card:'j_dossier',branch:'A'}).ok,false);
});
test('every rare modifier offered is compatible, and options persist through save and reload',()=>{
 for(let seed=1;seed<100;seed++){const s=createGame(seed,{tutorial:false});s.party=['lohen','durin','illuga'];s.phase='base';const o=makeUpgradeOffer(s,'elite','base');s.upgradeOffer=o;const c=o.candidates.find(c=>c.spark),form={...CARDS[c.key],...INSIGHTS[c.key][c.sparkBranch]};assert.ok(compatibleSparkIds(form).includes(c.spark));assert.deepEqual(hydrate(serialize(s)).upgradeOffer,o);go(s,{type:'upgrade',hero:c.owner,card:c.key,branch:c.sparkBranch});assert.equal(s.heroes[c.owner].sparks[c.key],c.spark);}
});
test('equipment shown before an event is the equipment granted after confirming, including reload',()=>{
 let checked=0;for(let seed=1;seed<60;seed++){const s=createGame(seed,{tutorial:false});s.phase='event';s.eventOffer=rollEventOffer(s);const c=s.eventOffer.choices.find(c=>c.benefit.kind==='equipment');if(!c)continue;const expected=c.benefit.item;assert.ok(EQUIPMENT[expected]);const loaded=hydrate(serialize(s));go(loaded,{type:'event',choice:c.id});assert.equal(loaded.eventResult.item,expected);assert.ok(loaded.inventory.includes(expected));checked++;}assert.ok(checked>20);
});
test('reward and route preserve the battlefield until actually entering the next stage',()=>{
 const s=battle('d_wave');for(const e of s.battle.enemies)e.hp=1;play(s);assert.equal(s.phase,'reward');const battleSnapshot=serialize(s.battle);go(s,{type:'claimReward'});if(s.phase==='cardReward')go(s,{type:'skipCard'});if(s.phase==='refine')go(s,{type:'skipUpgrade'});assert.equal(s.phase,'travel');assert.equal(serialize(s.battle),battleSnapshot);go(s,{type:'travel',id:'return-base'});assert.equal(s.phase,'base');assert.equal(s.battle,null);
});
test('ultimate and generated skill cards resolve existing unused illustrations without changing standing resources',()=>{
 for(const id of ['lohen','durin','illuga','jahoda'])assert.ok(fs.existsSync(new URL('../dist/'+ultimateCardArtwork(id),import.meta.url)));
 for(const key of ['d_resonance','j_dossier']){const d=CARDS[key],s=createGame();assert.ok(fs.existsSync(new URL('../dist/'+cardArtwork(d.owner,cardInfo(s,{owner:d.owner,key}),key),import.meta.url)));}
});
test('depth compares feet across both teams rather than party array or DOM order',()=>{
 const unit=(id,bottom)=>({id,style:{},querySelector:()=>({getBoundingClientRect:()=>({bottom})})});const back=unit('durin',180),front=unit('lohen',230),enemy=unit('enemy',210);const field={querySelectorAll:()=>[front,back,enemy]};sortSceneDepth({querySelectorAll:()=>[field]});assert.ok(+back.style.zIndex<+enemy.style.zIndex);assert.ok(+enemy.style.zIndex<+front.style.zIndex);
});

test('first front departure is checkpointed so a later retry retains the departure flag',()=>{const s=createGame(24,{tutorial:false});s.phase='base';s.node=7;s.mainFrontStarted=false;go(s,{type:'challenge'});assert.equal(s.mainFrontStarted,true);assert.equal(s.checkpoint.mainFrontStarted,true);s.phase='defeat';go(s,{type:'restart'});assert.equal(s.mainFrontStarted,true);});
