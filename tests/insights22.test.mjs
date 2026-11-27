import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGame,act,CARDS,cardInfo,ownedDeck,makeUpgradeOffer,serialize,hydrate,predictCardEffect,rollEventOffer,EQUIPMENT,HEROES,SPECIAL_CARDS} from '../dist/engine.js';
import {INSIGHTS,INSIGHT_BRANCHES,compatibleSparkIds} from '../dist/card-insights.js';
import {ultimateCardArtwork,cardArtwork} from '../dist/cast-art.js';
import {presentationPlan} from '../dist/motion-plan.js';
import {sortSceneDepth} from '../dist/scene-interactions.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
function battle(key,branch=null){
 const owner=CARDS[key].owner,s=createGame(38,{tutorial:false});s.party=[...new Set([owner,'lohen',...['durin','illuga','jahoda'].filter(x=>x!==owner)])].slice(0,3);s.phase='base';s.node=7;go(s,{type:'farm'});
 s.hp=Math.round(s.maxHp*.5);for(const id of s.party)s.heroes[id].shield=0;s.shield=0;s.support=0;s.battle.ap=6;s.battle.noCrit=true;s.battle.hand=[{uid:'one',owner,key}];s.battle.draw=[];s.battle.discard=[];s.battle.exhaust=[];
 for(const e of s.battle.enemies){e.kind='hound';e.hp=e.maxHp=5000;e.ward=0;e.hitWard=0;}
 if(branch)s.heroes[owner].upgrades[key]=branch;return s;
}
function play(s,uid='one'){const c=s.battle.hand.find(x=>x.uid===uid),d=cardInfo(s,c);return go(s,{type:'play',uid,target:d.target==='ally'?'lohen':s.battle.enemies[0].id});}
test('all 56 deck cards have four branches (A 안정 / B 자원 / C 변형 / D 빌드) and every branch resolves legally',()=>{
 assert.equal(Object.keys(INSIGHTS).length,56);assert.equal(Object.values(CARDS).filter(c=>c.v2).length,62);
 for(const [key,paths]of Object.entries(INSIGHTS)){
  assert.deepEqual(Object.keys(paths),INSIGHT_BRANCHES);assert.equal(new Set(Object.values(paths).map(p=>p.title)).size,4);assert.equal(new Set(Object.values(paths).map(p=>JSON.stringify(p))).size,4);
  for(const [branch,word] of [['A','안정'],['B','자원'],['C','변형'],['D','빌드']]){assert.ok(paths[branch].title.endsWith(word),key+branch);const s=battle(key,branch),info=cardInfo(s,s.battle.hand[0]);assert.ok(Number.isFinite(info.cost)&&info.cost>=0);assert.ok(Number.isFinite(info.amount));assert.equal(info.branch,branch);assert.ok(!info.desc.includes('['));assert.ok((info.keywords||[]).length<=3);play(s);assert.ok(s.hp>=0&&s.hp<=s.maxHp);assert.ok(s.battle.ap>=0&&s.battle.ap<=6);const cards=['hand','draw','discard','exhaust'].flatMap(z=>s.battle[z]);assert.equal(new Set(cards.map(c=>c.uid)).size,cards.length);}
 }
});
test('the forecast leaves state untouched, shows the non-crit number and matches a non-crit hit',()=>{
 const s=battle('l_pierce','A'),before=serialize(s),enemy=s.battle.enemies[0].id,p=predictCardEffect(s,'one',enemy);
 assert.equal(serialize(s),before);assert.equal(p.enemies[enemy].damage,Math.round(300*110/100*100/110));assert.match(cardInfo(s,s.battle.hand[0]).desc,/피해 300%/);
 const result=play(s);assert.equal(result.events.find(e=>e.type==='damage').amount,p.enemies[enemy].damage);
});
test('Illuga: shield conversion, healing with scar relief and 되비춤 have different payoffs',()=>{
 const attack=battle('i_riposte');attack.heroes.illuga.shield=300;attack.shield=300;assert.equal(play(attack).events.find(e=>e.type==='damage').amount,Math.round(300*.5*100/110));assert.equal(attack.heroes.illuga.shield,0);
 const heal=battle('i_lantern');heal.heroes.illuga.scar=200;const hp0=heal.hp,want=Math.round(heal.maxHp*.06);play(heal);assert.equal(heal.hp,hp0+want);assert.equal(heal.heroes.illuga.scar,200-want);
 const counter=battle('i_counter');play(counter);assert.equal(counter.heroes.illuga.shield,120);counter.battle.enemies=counter.battle.enemies.slice(0,1);const foe=counter.battle.enemies[0];foe.stun=0;foe.intent={name:'시험',damage:10,stress:0,target:'illuga',tag:'시험'};const r=go(counter,{type:'endTurn'});assert.ok(r.events.some(e=>e.type==='reflect'));assert.equal(r.events.find(e=>e.type==='damage'&&e.enemy===foe.id).amount,Math.round(80*100/110));
 const party=battle('i_guard');play(party);assert.ok(party.party.every(id=>party.heroes[id].shield===56));
});
test('a turn-limited card refuses a second use in the same turn',()=>{
 const s=battle('j_wind','B');s.battle.ap=0;s.battle.hand.push({uid:'two',owner:'jahoda',key:'j_wind'});play(s);assert.equal(s.battle.ap,1);const before=serialize(s);assert.equal(act(s,{type:'play',uid:'two'}).ok,false);assert.equal(serialize(s),before);
 go(s,{type:'endTurn'});s.battle.hand=[{uid:'two',owner:'jahoda',key:'j_wind'}];assert.ok(act(s,{type:'play',uid:'two'}).ok);
});
test('an Ember draw limit is shared across the owner',()=>{
 const s=battle('l_guard');s.heroes.lohen.sparks.l_guard='ember_draw';s.battle.hand.push({uid:'two',owner:'lohen',key:'l_guard'});s.battle.draw=[{uid:'d1',owner:'durin',key:'d_strike'},{uid:'d2',owner:'durin',key:'d_strike'}];
 assert.equal(play(s).events.filter(e=>e.type==='draw').length,1);assert.equal(play(s,'two').events.filter(e=>e.type==='draw').length,0);
});
test('Durin: 타다 남은 불티 is a disposable AOE that cracks, exhausts and evaporates',()=>{
 const s=battle('d_charge','C'),before=hydrate(serialize(s)),r=play(s),generated=s.battle.hand.find(c=>c.key==='d_resonance');assert.ok(generated);assert.ok(presentationPlan(before,s,{type:'play'},r.events).drawn.includes(generated.uid));
 const hit=play(s,generated.uid);assert.equal(hit.events.filter(e=>e.type==='damage').length,s.battle.enemies.length);assert.ok(s.battle.exhaust.some(c=>c.uid===generated.uid));assert.ok(s.battle.enemies.every(e=>e.crack===1));assert.ok(!ownedDeck(s,'durin').some(c=>c.key==='d_resonance'));
 const e=battle('d_comet');play(e);const spark=e.battle.hand.find(c=>c.key==='d_resonance');assert.ok(spark);go(e,{type:'endTurn'});assert.ok(e.battle.exhaust.some(c=>c.uid===spark.uid));
});
test('Jahoda: 은닉 보급품 makes 여분의 태엽 twice per battle; Nefer cracks on AP gain; generated cards cannot be upgraded',()=>{
 const s=battle('j_cache');s.battle.hand.push({uid:'two',owner:'jahoda',key:'j_cache'},{uid:'three',owner:'jahoda',key:'j_cache'});play(s);play(s,'two');play(s,'three');const springs=s.battle.hand.filter(c=>c.key==='j_spring');assert.equal(springs.length,2);
 s.battle.ap=0;const r=play(s,springs[0].uid);assert.equal(s.battle.ap,1);assert.ok(r.events.some(e=>e.type==='crack'));assert.ok(s.battle.exhaust.some(c=>c.uid===springs[0].uid));
 s.phase='base';s.upgradeOffer={candidates:[{owner:'jahoda',key:'j_spring'}],returnPhase:'base'};assert.equal(act(s,{type:'upgrade',hero:'jahoda',card:'j_spring',branch:'A'}).ok,false);
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
test('ultimate and special cards resolve their illustrations',()=>{
 for(const id of Object.keys(HEROES))assert.ok(fs.existsSync(new URL('../dist/'+ultimateCardArtwork(id),import.meta.url)));
 for(const key of SPECIAL_CARDS){const d=CARDS[key],s=createGame();assert.ok(d.generated);assert.ok(fs.existsSync(new URL('../dist/'+cardArtwork(d.owner,cardInfo(s,{owner:d.owner,key}),key),import.meta.url)));}
});
test('depth compares feet across both teams rather than party array or DOM order',()=>{
 const unit=(id,bottom)=>({id,style:{},querySelector:()=>({getBoundingClientRect:()=>({bottom})})});const back=unit('durin',180),front=unit('lohen',230),enemy=unit('enemy',210);const field={querySelectorAll:()=>[front,back,enemy]};sortSceneDepth({querySelectorAll:()=>[field]});assert.ok(+back.style.zIndex<+enemy.style.zIndex);assert.ok(+enemy.style.zIndex<+front.style.zIndex);
});

test('first front departure is checkpointed so a later retry retains the departure flag',()=>{const s=createGame(24,{tutorial:false});s.phase='base';s.node=7;s.mainFrontStarted=false;go(s,{type:'challenge'});assert.equal(s.mainFrontStarted,true);assert.equal(s.checkpoint.mainFrontStarted,true);s.phase='defeat';go(s,{type:'restart'});assert.equal(s.mainFrontStarted,true);});
