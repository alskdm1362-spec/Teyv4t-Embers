import {completeJoin,finishCare,botTurn as turn,botExpedition} from './flow-helpers.mjs';
const createGame=(seed)=>createLegacyFixture(seed,{tutorial:false});
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame as createLegacyFixture, act, cardInfo, serialize, hydrate, applyStress, applyInjury, newCampaign, readiness, HEROES, CARDS, healingNeeds,ROUTE,travelOptions } from '../dist/engine.js';

function action(s,a){const r=act(s,a);assert.equal(r.ok,true,r.error);return r;}

function toBase(pair,seed=81,beforeBase=false){const s=createGame(seed);action(s,{type:'start'});let recruits=0;for(let steps=0;steps<600;steps++){
 if(s.phase==='base'||(beforeBase&&s.phase==='reward'&&s.node===6))return s;
 if(s.phase==='defeat')throw new Error('Bot defeated: '+s.history.slice(-8).join(' / '));
 if(s.phase==='battle')turn(s);
 else if(s.phase==='reward')action(s,{type:'advance'});
 else if(s.phase==='recruit')action(s,{type:'recruit',hero:pair[recruits++]});
 else if(s.phase==='event')action(s,{type:'event',choice:s.eventOffer?.choices[0].id||'safe'});
 else if(s.phase==='arrival'||s.phase==='joinDialogue')completeJoin(s);
 else if(s.phase==='refine')action(s,{type:'skipUpgrade'});
 else if(s.phase==='eventRemove')action(s,{type:'eventRemoveCard',skip:true});
 else if(s.phase==='camp'){action(s,{type:'camp',choice:'rest'});action(s,{type:'leaveCamp'});}
 else if(s.phase==='cardReward')action(s,{type:'skipCard'});
 else throw new Error('Unexpected phase: '+s.phase);
 }throw new Error('Bot exceeded steps');}

test('all three legal parties reach first base without farming or state edits',()=>{
 for(const pair of [['durin','illuga'],['durin','jahoda'],['illuga','jahoda']]){
  const s=toBase(pair);assert.equal(s.phase,'base');assert.deepEqual(s.party,['lohen',...pair]);assert.ok(s.hp>0&&s.hp<=s.maxHp);assert.equal(s.checkpoint.hp,s.hp);assert.equal(s.battlesWon,3);assert.equal(s.retries,0);assert.equal(s.heroes.lohen.level,2);
 }
});

test('target and cost validation leave complete state unchanged',()=>{
 const s=createGame(41);action(s,{type:'start'});const attack=s.battle.hand.find(c=>CARDS[c.key].target==='enemy');assert.ok(attack);let before=serialize(s);
 assert.equal(act(s,{type:'play',uid:attack.uid,target:'not-an-enemy'}).ok,false);assert.equal(serialize(s),before);
 s.battle.ap=0;before=serialize(s);assert.equal(act(s,{type:'play',uid:attack.uid,target:s.battle.enemies[0].id}).ok,false);assert.equal(serialize(s),before);
});

test('all owner cards derive breakdown view; eleventh use guarantees recovery with no hazard',()=>{
 const s=createGame(17);action(s,{type:'start'});applyStress(s,'lohen',100);
 assert.ok(s.heroes.lohen.breakdown);s.heroes.lohen.breakdown={type:'distrust',failures:10};
 const c=s.battle.hand[0];assert.equal(cardInfo(s,c).type,'breakdown');assert.equal(cardInfo(s,c).exhaust,false);assert.equal(cardInfo(s,c).target,'none');const hp=s.hp;
 const r=action(s,{type:'play',uid:c.uid});assert.equal(s.heroes.lohen.breakdown,null);assert.equal(s.heroes.lohen.stress,40);assert.equal(s.hp,hp);assert.ok(r.events.some(e=>e.type==='recover'));
});

test('breakdown attempts persist across battles and strengthen with a cap',()=>{
 const s=createGame(1);action(s,{type:'start'});s.heroes.lohen.breakdown={type:'despair',failures:6};s.heroes.lohen.stress=100;
 let seed=1;while(((Math.imul(seed,1664525)+1013904223)>>>0)/4294967296<.3)seed++;
 s.rng=seed;const c=s.battle.hand[0];action(s,{type:'play',uid:c.uid});assert.equal(s.heroes.lohen.breakdown.failures,7);assert.match(cardInfo(s,s.battle.hand[0]).desc,/위험 강도 3/);
 const loaded=hydrate(serialize(s));assert.equal(loaded.heroes.lohen.breakdown.failures,7);
});

test('injury reaches four stages, retires after two losses, and removes own cards only',()=>{
 const s=toBase(['durin','illuga']);action(s,{type:'farm'});
 for(let i=0;i<2;i++)applyInjury(s,'durin','leftArm');assert.equal(s.heroes.durin.body.leftArm,2);assert.equal(s.heroes.durin.retired,false);
 applyInjury(s,'durin','leftArm');for(let i=0;i<3;i++)applyInjury(s,'durin','rightArm');assert.equal(s.heroes.durin.retired,true);
 for(const zone of ['hand','draw','discard','exhaust'])assert.ok(s.battle[zone].every(c=>c.owner!=='durin'));
 assert.ok(s.battle.hand.some(c=>c.owner!=='durin'));
 s.support=2;const r=action(s,{type:'support',hero:'durin'});assert.ok(r.events.some(e=>e.partner==='albedo'));assert.ok(s.shield>=13);
});

test('partner remains available while linked fighter is collapsed',()=>{
 const s=toBase(['durin','jahoda']);action(s,{type:'farm'});applyStress(s,'jahoda',100);assert.ok(s.heroes.jahoda.breakdown);s.support=2;
 const r=action(s,{type:'support',hero:'jahoda',target:s.battle.enemies[0].id});assert.ok(r.events.some(e=>e.partner==='nefer'));
});

test('checkpoint restores state, retries survive rewinds and cap temporal penalty',()=>{
 const s=toBase(['durin','illuga']);s.upgradeOffer={candidates:[{owner:'lohen',key:'l_pierce'}],returnPhase:'base'};action(s,{type:'upgrade',hero:'lohen',card:'l_pierce',branch:'B'});const baseGold=s.gold,baseHp=s.hp,baseStress=s.heroes.lohen.stress;
 for(let i=1;i<=5;i++){
  action(s,{type:'farm'});s.hp=0;s.phase='defeat';s.heroes.lohen.body.leftArm=3;s.gold+=99;s.heroes.lohen.stress=88;
  action(s,{type:'restart'});assert.equal(s.phase,'base');assert.equal(s.hp,baseHp);assert.equal(s.gold,baseGold);assert.equal(s.heroes.lohen.stress,baseStress);assert.equal(s.heroes.lohen.body.leftArm,0);assert.equal(s.retries,i);assert.equal(s.temporal,Math.min(2,Math.max(0,i-1)));assert.equal(s.heroes.lohen.upgrades.l_pierce,'B');
 }
});

test('save roundtrip preserves cards, RNG, and committed dice results',()=>{
 const s=createGame(93);s.phase='event';const r=action(s,{type:'event',choice:'risk'});const e=r.events.find(e=>e.type==='dice');assert.equal(e.roll>=1&&e.roll<=20,true);assert.equal(e.total,e.roll+e.bonus);assert.equal(e.target,12);
 const loaded=hydrate(serialize(s));assert.deepEqual(loaded,s);assert.equal(act(loaded,{type:'event',choice:'risk'}).ok,false);assert.equal(loaded.eventResult.roll,e.roll);
});

test('upgrades remain on benched heroes and equipment is fixed two-slot growth',()=>{
 const s=toBase(['durin','illuga']);s.gold=300;s.upgradeOffer={candidates:[{owner:'durin',key:'d_wave'}],returnPhase:'base'};action(s,{type:'upgrade',hero:'durin',card:'d_wave',branch:'B'});action(s,{type:'equip',hero:'durin',slot:'weapon',item:'plainSpear'});action(s,{type:'swap',out:'durin',in:'jahoda'});action(s,{type:'swap',out:'jahoda',in:'durin'});
 assert.equal(s.heroes.durin.upgrades.d_wave,'B');assert.equal(s.heroes.durin.equipment.weapon,'plainSpear');assert.equal(act(s,{type:'upgrade',hero:'durin',card:'d_wave',branch:'A'}).ok,false);
});

test('all three parties can finish post-base challenge with modest preparation',()=>{
 for(const pair of [['durin','illuga'],['durin','jahoda'],['illuga','jahoda']]){
  const s=toBase(pair,61);action(s,{type:'heal'});for(const hero of s.party)if(s.heroes[hero].breakdown&&!s.careUsed)finishCare(s,hero);
  for(let n=0;n<2;n++){action(s,{type:'farm'});for(let k=0;k<400&&s.phase==='battle';k++)turn(s);assert.equal(s.phase,'reward',s.history.slice(-6).join(' / '));action(s,{type:'advance'});action(s,{type:'heal'});for(const hero of s.party)if(s.heroes[hero].breakdown&&!s.careUsed)finishCare(s,hero);}
  s.upgradeOffer={candidates:[{owner:'lohen',key:'l_pierce'}],returnPhase:'base'};action(s,{type:'upgrade',hero:'lohen',card:'l_pierce',branch:'A'});
  if(s.gold>=30)action(s,{type:'equip',hero:'lohen',slot:'weapon',item:'plainSpear'});
  s.node=ROUTE.length-1;action(s,{type:'challenge'});
  for(let k=0;k<1200&&!['ending','defeat'].includes(s.phase);k++){
   if(s.phase==='battle')turn(s);else if(s.phase==='reward')action(s,{type:'advance'});else throw new Error(s.phase);
  }
  assert.equal(s.phase,'ending',pair.join('+')+': '+s.history.slice(-10).join(' / '));assert.ok(s.collection.endings.includes('first-front'));
  const n=newCampaign(s,88);assert.equal(n.phase,'title');assert.equal(n.heroes.lohen.level,1);assert.equal(n.heroes.lohen.upgrades.l_pierce,undefined);assert.deepEqual(n.collection,s.collection);
 }
});

test('v0.36: route anglers have no linked wards and elites may use a mental attack',()=>{
 const s=toBase(['durin','illuga']);s.node=6;s.phase='reward';s.node=5;action(s,{type:'advance'});
 assert.equal(s.battle.enemies.length,2);assert.ok(s.battle.enemies.every(e=>e.ward===0&&e.hitWard===0));
 for(let t=0;t<3;t++){if(s.phase!=='battle')break;for(const e of s.battle.enemies)e.hp=e.maxHp=99999;if(s.battle.enemies.some(e=>e.intent?.mental))break;action(s,{type:'endTurn'});}
 assert.ok(s.battle.enemies.some(e=>e.intent?.mental&&e.intent.stress===20));
});

test('breakdown replacement of an exhaust card goes to discard, allowing repeated recovery attempts',()=>{
 const s=createGame(9);s.heroes.lohen.acquired=['l_aim'];action(s,{type:'start'});const aim=[...s.battle.hand,...s.battle.draw].find(c=>c.key==='l_aim');
 s.battle.hand=s.battle.hand.filter(c=>c.uid!==aim.uid);s.battle.draw=s.battle.draw.filter(c=>c.uid!==aim.uid);s.battle.hand.push(aim);s.heroes.lohen.breakdown={type:'despair',failures:10};s.heroes.lohen.stress=100;
 action(s,{type:'play',uid:aim.uid});assert.ok(s.battle.discard.some(c=>c.uid===aim.uid));assert.ok(s.battle.exhaust.every(c=>c.uid!==aim.uid));
});

test('second rewind changes early enemy composition without resetting the retry counter',()=>{
 const s=createGame(3);action(s,{type:'start'});s.phase='defeat';action(s,{type:'restart'});assert.equal(s.phase,'battle');assert.equal(s.battle.enemies[0].kind,'wanderer');assert.equal(s.retries,1);
 s.phase='defeat';action(s,{type:'restart'});assert.equal(s.temporal,1);assert.equal(s.phase,'battle');assert.equal(s.battle.enemies[0].kind,'hound');assert.equal(s.retries,2);assert.equal(act(s,{type:'start'}).ok,false);
});

test('returning from farming saves wounds and retirement until explicit recovery',()=>{
 const s=toBase(['durin','illuga']);s.retries=3;s.temporal=2;action(s,{type:'heal'});action(s,{type:'farm'});
 for(let k=0;k<400&&s.phase==='battle';k++)turn(s);assert.equal(s.phase,'reward');
 s.hp=32;s.heroes.durin.body.leftArm=3;s.heroes.durin.body.rightArm=3;s.heroes.durin.retired=true;s.heroes.durin.stress=76;s.heroes.lohen.stress=28;
 const r=action(s,{type:'advance'});assert.equal(s.phase,'base');assert.equal(s.hp,32);assert.equal(s.heroes.durin.retired,true);assert.equal(s.heroes.durin.body.leftArm,3);assert.equal(s.heroes.durin.stress,76);assert.equal(s.heroes.lohen.stress,28);assert.equal(s.retries,3);assert.equal(s.temporal,2);assert.ok(!r.events.some(e=>e.type==='heal'));
 assert.equal(s.checkpoint.hp,32);assert.equal(s.checkpoint.heroes.durin.retired,true);assert.ok(healingNeeds(s).needed);
 const gold=s.gold,heal=action(s,{type:'heal'});assert.equal(s.hp,32+Math.round(.3*980)+400);assert.equal(s.heroes.durin.retired,false);assert.ok(Object.values(s.heroes.durin.body).every(n=>n===0));assert.equal(s.heroes.durin.stress,71);assert.equal(s.heroes.lohen.stress,23);assert.equal(s.gold,gold);assert.equal(s.retries,3);assert.ok(heal.events.some(e=>e.type==='heal'&&e.heroes.includes('durin')));assert.equal(healingNeeds(s).needed,true);
 assert.equal(s.checkpoint.hp,32+Math.round(.3*980)+400);assert.equal(s.checkpoint.heroes.durin.retired,false);
});

test('first base arrival and checkpoint rewind preserve unhealed state; recovery is separately saved',()=>{
 const s=toBase(['durin','illuga'],81,true);assert.equal(s.node,6);assert.equal(s.phase,'reward');
 s.hp=31;s.heroes.durin.body.leftArm=3;s.heroes.durin.body.rightLeg=3;s.heroes.durin.retired=true;s.heroes.durin.stress=100;s.heroes.durin.breakdown={type:'panic',failures:7};s.retries=4;s.temporal=2;
 const arrival=action(s,{type:'advance'});assert.equal(s.phase,'base');assert.equal(s.hp,31);assert.equal(s.heroes.durin.retired,true);assert.equal(s.heroes.durin.body.leftArm,3);assert.equal(s.checkpoint.hp,31);assert.equal(s.retries,0);assert.equal(s.temporal,0);assert.ok(!arrival.events.some(e=>e.type==='heal'));
 const loaded=hydrate(serialize(s));action(loaded,{type:'farm'});loaded.phase='defeat';loaded.hp=0;action(loaded,{type:'restart'});assert.equal(loaded.hp,31);assert.equal(loaded.heroes.durin.retired,true);assert.equal(loaded.heroes.durin.breakdown.failures,7);assert.equal(loaded.retries,1);
 const gold=loaded.gold;action(loaded,{type:'heal'});assert.equal(loaded.hp,31+Math.round(.3*980)+400);assert.equal(loaded.heroes.durin.retired,false);assert.equal(loaded.heroes.durin.stress,95);assert.deepEqual(loaded.heroes.durin.breakdown,{type:'panic',failures:7});assert.equal(loaded.gold,gold);
 action(loaded,{type:'farm'});loaded.phase='defeat';loaded.hp=0;action(loaded,{type:'restart'});assert.equal(loaded.hp,31+Math.round(.3*980)+400);assert.equal(loaded.heroes.durin.retired,false);assert.equal(loaded.heroes.durin.stress,95);assert.equal(loaded.retries,2);
});

test('body recovery only acts at base and cannot erase combat wounds by an invalid action',()=>{
 const s=createGame(5);action(s,{type:'start'});s.hp=28;s.heroes.lohen.body.leftArm=2;const saved=serialize(s);assert.equal(act(s,{type:'heal'}).ok,false);assert.equal(serialize(s),saved);
});

test('base readiness warns about low growth before starting challenge',()=>{
 const s=toBase(['durin','illuga']);action(s,{type:'swap',out:'durin',in:'jahoda'});assert.equal(s.heroes.jahoda.level,1);assert.ok(readiness(s).some(x=>x.includes('성장이 낮습니다')));
});

test('fighter ultimate spends three support without AP and is once per fighter per battle',()=>{
 const s=toBase(['durin','illuga']);action(s,{type:'farm'});s.support=6;const ap=s.battle.ap;
 const r=action(s,{type:'ultimate',hero:'lohen',target:s.battle.enemies[0].id});assert.equal(s.support,3);assert.equal(s.battle.ap,ap);assert.equal(s.battle.ultimates.lohen,true);assert.equal(s.battle.supportUsed,false);assert.ok(r.events.some(e=>e.type==='ultimate'&&e.hero==='lohen'));assert.ok(s.collection.cutins.includes('ultimate-lohen'));
 const before=serialize(s);assert.equal(act(s,{type:'ultimate',hero:'lohen',target:s.battle.enemies[1].id}).ok,false);assert.equal(serialize(s),before);
 action(s,{type:'support',hero:'durin'});assert.equal(s.support,1);assert.equal(s.battle.supportUsed,true);
});

test('ultimate validates target and gauge atomically and rejects retired or collapsed fighters',()=>{
 const s=toBase(['durin','illuga']);action(s,{type:'farm'});s.support=6;
 let before=serialize(s);assert.equal(act(s,{type:'ultimate',hero:'lohen',target:'missing'}).ok,false);assert.equal(serialize(s),before);
 s.support=2;before=serialize(s);assert.equal(act(s,{type:'ultimate',hero:'durin'}).ok,false);assert.equal(serialize(s),before);
 s.support=6;s.heroes.durin.retired=true;before=serialize(s);assert.equal(act(s,{type:'ultimate',hero:'durin'}).ok,false);assert.equal(serialize(s),before);
 s.heroes.durin.retired=false;s.heroes.durin.breakdown={type:'panic',failures:2};before=serialize(s);assert.equal(act(s,{type:'ultimate',hero:'durin'}).ok,false);assert.equal(serialize(s),before);
 action(s,{type:'support',hero:'durin'});assert.equal(s.battle.supportUsed,true);
});

test('Durin ultimate hits all enemies while Illuga ultimate sets shield and a real counter',()=>{
 const s=toBase(['durin','illuga']);action(s,{type:'farm'});s.support=6;
 const hp=s.battle.enemies.map(e=>e.hp);action(s,{type:'ultimate',hero:'durin'});assert.ok(s.battle.enemies.every((e,i)=>e.hp<hp[i]));
 action(s,{type:'ultimate',hero:'illuga'});assert.equal(s.shield,3*Math.round(25*2/7*80/3));assert.ok(s.party.every(id=>s.heroes[id].shield>0));assert.ok(s.party.every(id=>s.heroes[id].buffs.reflect===12));for(const e of s.battle.enemies)if(e.intent?.damage)e.intent.damage=1;const end=action(s,{type:'endTurn'});assert.ok(end.events.some(e=>e.type==='reflect'));
});

test('Jahoda ultimate caps AP at six, draws two without discard, and resets only next battle',()=>{
 const s=toBase(['durin','jahoda']);action(s,{type:'farm'});s.support=6;s.battle.ap=5;const count=s.battle.hand.length;
 action(s,{type:'ultimate',hero:'jahoda'});assert.equal(s.battle.ap,6);assert.equal(s.battle.hand.length,count+2);assert.equal(s.battle.chooseDiscard,0);assert.equal(s.battle.ultimates.jahoda,true);
 for(let k=0;k<400&&s.phase==='battle';k++)turn(s);assert.equal(s.phase,'reward');action(s,{type:'advance'});action(s,{type:'farm'});assert.equal(s.battle.ultimates.jahoda,undefined);
});

test('card descriptions follow the chosen branch and the branch changes what the card does',()=>{
 const s=toBase(['durin','jahoda']);s.heroes.lohen.upgrades.l_strike='A';let info=cardInfo(s,{owner:'lohen',key:'l_strike'});assert.match(info.desc,/피해 130%/);assert.doesNotMatch(info.desc,/피해 100%/);assert.equal(info.title,'정확한 일격 · 안정');
 s.heroes.lohen.upgrades.l_guard='B';info=cardInfo(s,{owner:'lohen',key:'l_guard'});assert.equal(info.cost,0);assert.equal(info.exhaust,true);assert.match(info.desc,/^소멸\. /);
 s.heroes.jahoda.upgrades.j_strike='C';action(s,{type:'farm'});const all=[...s.battle.hand,...s.battle.draw];const c=all.find(c=>c.key==='j_strike');s.battle.draw=s.battle.draw.filter(x=>x.uid!==c.uid);if(!s.battle.hand.some(x=>x.uid===c.uid))s.battle.hand.push(c);const shield=s.shield,id=s.battle.enemies[0].id;s.battle.enemies[0].hp=s.battle.enemies[0].maxHp=9999;action(s,{type:'play',uid:c.uid,target:id});assert.equal(s.shield,shield);assert.equal(s.battle.enemies.find(e=>e.id===id).crack,1);
});
test('attack-focused starter pools keep one defense while preserving four cards per owner',()=>{
 const s=toBase(['durin','illuga']);action(s,{type:'farm'});const cards=[...s.battle.hand,...s.battle.draw];
 for(const id of s.party){const own=cards.filter(c=>c.owner===id&&!c.uid.includes('-awaken-'));assert.equal(own.length,4);const defenses=own.filter(c=>['guard','counter'].includes(CARDS[c.key].type)).length;assert.equal(defenses,id==='illuga'?3:1);}
 assert.equal(cards.filter(c=>c.owner==='lohen'&&c.key==='l_strike').length,2);assert.equal(cards.filter(c=>c.owner==='durin'&&c.key==='d_wave').length,1);
});

test('all three parties traverse the expanded expedition, events, elites and final front with legal actions',()=>{
 for(const pair of [['durin','illuga'],['durin','jahoda'],['illuga','jahoda']]){
  const s=createLegacyFixture(20261123);action(s,{type:'start'});for(const hero of pair){action(s,{type:'skipTutorial'});action(s,{type:'skipRecruitDialogue'});action(s,{type:'recruit',hero});completeJoin(s);}
  const {visited}=botExpedition(s);
  assert.equal(s.phase,'ending',pair.join('+')+' at '+s.node+': '+s.history.slice(-12).join(' / '));for(let i=8;i<24;i++)assert.ok(visited.has(i));assert.ok(s.collection.endings.includes('first-front'));
 }
});
