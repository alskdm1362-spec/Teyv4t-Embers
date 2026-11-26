import {completeJoin,finishCare} from './flow-helpers.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createGame,act,cardInfo,ownedDeck,serialize,hydrate,applyInjury,applyStress,injuryChance,removalCost,newCampaign,CARDS} from '../dist/engine.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
function base(pair=['durin','illuga']){const s=createGame(99);go(s,{type:'start'});go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});go(s,{type:'recruit',hero:pair[0]});completeJoin(s);go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});go(s,{type:'recruit',hero:pair[1]});completeJoin(s);return s;}
function finishBattle(s){for(let n=0;n<100&&s.phase==='battle';n++){
 if(s.battle.chooseDiscard){go(s,{type:'discard',uid:s.battle.hand[0].uid});continue;}
 const target=s.battle.enemies.find(e=>e.hp>0),cards=s.battle.hand.map(c=>({c,d:cardInfo(s,c)})).filter(({d})=>d.cost<=s.battle.ap);
 const pick=cards.find(({d})=>d.type==='attack')||cards.find(({d})=>d.type==='focus');
 if(pick)go(s,{type:'play',uid:pick.c.uid,target:target.id});else go(s,{type:'endTurn'});
 }assert.equal(s.phase,'recruit');}
test('guided tutorial enforces exact opening, ordered controls and two victories to unhealed base',()=>{
 for(const seed of [1,19,20261122])for(const pair of [['durin','illuga'],['illuga','jahoda'],['jahoda','durin']]){
  const s=createGame(seed);go(s,{type:'start'});assert.deepEqual(s.battle.hand.map(c=>[c.key,cardInfo(s,c).cost]),[['l_pierce',2],['l_guard',1],['l_strike',1],['l_strike',1],['l_strike',1]]);assert.equal(s.battle.enemies[0].kind,'trainingSlime');assert.equal(s.battle.enemies[0].intent.damage,3);
  const [attack,guard]=s.battle.hand;for(const a of [{type:'endTurn'},{type:'play',uid:attack.uid,target:s.battle.enemies[0].id},{type:'support',hero:'lohen'},{type:'ultimate',hero:'lohen'}]){const before=serialize(s);assert.equal(act(s,a).ok,false);assert.equal(serialize(s),before);}
  go(s,{type:'tutorialNext'});go(s,{type:'tutorialSelect',uid:attack.uid});go(s,{type:'play',uid:attack.uid,target:s.battle.enemies[0].id});assert.equal(s.tutorial.step,'defense-select');
  go(s,{type:'tutorialSelect',uid:guard.uid});go(s,{type:'play',uid:guard.uid});assert.equal(s.tutorial.step,'end-turn');go(s,{type:'endTurn'});assert.equal(s.tutorial.step,'refill');assert.equal(s.battle.ap,3);const resumed=hydrate(serialize(s));assert.equal(resumed.tutorial.step,'refill');assert.equal(act(s,{type:'endTurn'}).ok,false);go(s,{type:'tutorialNext'});assert.equal(s.tutorial.step,'free');finishBattle(s);assert.equal(s.node,1);
  assert.equal(act(s,{type:'recruit',hero:pair[0]}).ok,false);for(let i=0;i<4;i++)go(s,{type:'recruitDialogue'});go(s,{type:'recruit',hero:pair[0]});completeJoin(s);assert.equal(s.tutorial.step,'partner-select');assert.equal(s.battle.enemies.length,2);
  go(s,{type:'tutorialSelect',hero:'lohen',kind:'support'});go(s,{type:'support',hero:'lohen'});assert.equal(s.tutorial.step,'free');finishBattle(s);go(s,{type:'skipRecruitDialogue'});const hp=s.hp;go(s,{type:'recruit',hero:pair[1]});completeJoin(s);assert.equal(s.phase,'base');assert.equal(s.node,7);assert.equal(s.battlesWon,2);assert.equal(s.hp,hp);assert.equal(s.tutorial.completed,true);assert.deepEqual(s.party,['lohen',...pair]);assert.equal(s.checkpoint.tutorial.active,false);
 }
});
test('skipping controls and explicitly skipping dialogue opens recruit choices without a reward map',()=>{
 const s=createGame(123);go(s,{type:'start'});go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});assert.equal(s.phase,'recruit');assert.equal(s.recruitLine,4);assert.equal(s.battle,null);go(s,{type:'recruit',hero:'durin'});completeJoin(s);go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});assert.equal(s.node,3);assert.equal(s.recruitLine,4);go(s,{type:'recruit',hero:'illuga'});completeJoin(s);assert.equal(s.phase,'base');assert.equal(s.battlesWon,0);go(s,{type:'farm'});assert.equal(s.battle.enemies[0].kind,'hound');
});
test('eyes blur at serious stage, bind saved random owned effects on loss, and keep collapse priority',()=>{
 const s=base();go(s,{type:'farm'});applyInjury(s,'lohen','eyes');applyInjury(s,'lohen','eyes');const c=ownedDeck(s,'lohen')[0];assert.equal(cardInfo(s,c).blurred,true);applyInjury(s,'lohen','eyes');
 for(const zone of ['hand','draw','discard','exhaust'])for(const c of s.battle[zone].filter(c=>c.owner==='lohen')){const d=cardInfo(s,c);assert.deepEqual([d.name,d.desc,d.displayCost],['실명','??','?']);assert.ok(ownedDeck(s,'lohen').some(x=>x.key===c.blindKey));assert.equal(d.cost,CARDS[c.blindKey].cost);}
 const before=serialize(s),rng=s.rng;for(const c of s.battle.hand)cardInfo(s,c);assert.equal(serialize(s),before);const loaded=hydrate(before);assert.equal(loaded.rng,rng);assert.deepEqual(loaded.battle,s.battle);
 applyStress(s,'lohen',100);assert.equal(cardInfo(s,c).type,'breakdown');assert.equal(cardInfo(s,c).cost,1);assert.equal(cardInfo(s,c).blind,undefined);
});
test('blind effects use actual costs, targets and exhaustion; insufficient AP cannot reroll',()=>{
 for(const key of ['l_pierce','l_guard','l_aim']){const s=base();s.heroes.lohen.acquired=['l_aim'];go(s,{type:'farm'});s.heroes.lohen.body.eyes=3;const c={...ownedDeck(s,'lohen')[0],blindKey:key};s.battle.hand=[c];s.battle.ap=3;const e=s.battle.enemies[0],hp=e.hp,shield=s.shield;const r=go(s,{type:'play',uid:c.uid,target:e.id});assert.equal(s.battle.ap,3-CARDS[key].cost);assert.equal(r.events.find(e=>e.type==='card').card,key);assert.equal(r.events.find(e=>e.type==='card').blind,true);assert.ok(s.battle[key==='l_aim'?'exhaust':'discard'].some(x=>x.uid===c.uid));if(key==='l_pierce')assert.ok(e.hp> s.battle.enemies[0].hp||hp>s.battle.enemies[0].hp);if(key==='l_guard')assert.equal(s.shield-shield,7);if(key==='l_aim')assert.equal(s.heroes.lohen.buffs.focus,6);}
 const s=base();s.heroes.lohen.acquired=['l_aim'];go(s,{type:'farm'});s.heroes.lohen.body.eyes=3;s.battle.hand=[{...ownedDeck(s,'lohen')[0],blindKey:'l_pierce'}];s.battle.ap=1;const before=serialize(s);assert.equal(act(s,{type:'play',uid:s.battle.hand[0].uid}).ok,false);assert.equal(serialize(s),before);
});
test('arm penalties reduce attack and guard, with an extra lost-arm draw reduction',()=>{
 const s=base(['jahoda','illuga']);go(s,{type:'farm'});s.heroes.lohen.body.leftArm=2;assert.equal(cardInfo(s,{owner:'lohen',key:'l_pierce'}).amount,15);assert.equal(cardInfo(s,{owner:'lohen',key:'l_guard'}).amount,5);
 s.heroes.jahoda.body.leftArm=3;assert.equal(cardInfo(s,{owner:'jahoda',key:'j_draw'}).amount,0);s.heroes.jahoda.body.leftArm=2;assert.equal(cardInfo(s,{owner:'jahoda',key:'j_draw'}).amount,1);s.heroes.lohen.body.rightArm=2;assert.equal(cardInfo(s,{owner:'lohen',key:'l_pierce'}).amount,11);
});
test('leg serious stage increases other-part wounds and lost leg raises forecast damage',()=>{
 const s=base();go(s,{type:'farm'});const h=s.heroes.lohen;assert.equal(injuryChance(h,false),0);h.body.leftLeg=2;assert.equal(injuryChance(h,false),.15);assert.equal(injuryChance(h,true),.5);
 for(let i=0;i<20;i++){const probe=hydrate(serialize(s));applyInjury(probe,'lohen');assert.equal(probe.heroes.lohen.body.leftLeg,2);assert.equal(probe.heroes.lohen.body.rightLeg,0);assert.ok(['eyes','leftArm','rightArm'].some(k=>probe.heroes.lohen.body[k]===1));s.rng+=12345;}
 const normal=base();go(normal,{type:'farm'});const hurt=base();hurt.heroes.lohen.body.leftLeg=3;go(hurt,{type:'farm'});for(let i=0;i<normal.battle.enemies.length;i++){const n=normal.battle.enemies[i],e=hurt.battle.enemies[i];assert.equal(e.intent.damage,e.intent.target==='lohen'?Math.ceil(n.intent.damage*1.25):n.intent.damage);}
});
test('shop removes physical duplicates, scales shared prices and persists through bench, rewind and reload',()=>{
 const s=base();s.gold=500;let deck=ownedDeck(s,'lohen');const strike=deck.filter(c=>c.key==='l_strike');go(s,{type:'removeCard',hero:'lohen',uid:strike[0].uid});assert.equal(s.gold,475);assert.equal(removalCost(s),40);assert.equal(ownedDeck(s,'lohen').filter(c=>c.key==='l_strike').length,1);const before=serialize(s);assert.equal(act(s,{type:'removeCard',hero:'lohen',uid:strike[0].uid}).ok,false);assert.equal(serialize(s),before);
 go(s,{type:'removeCard',hero:'durin',uid:ownedDeck(s,'durin')[0].uid});assert.equal(s.gold,435);assert.equal(removalCost(s),55);go(s,{type:'swap',out:'durin',in:'jahoda'});go(s,{type:'swap',out:'jahoda',in:'durin'});assert.equal(ownedDeck(s,'durin').length,3);go(s,{type:'farm'});assert.ok(['hand','draw','discard','exhaust'].every(z=>!s.battle[z].some(c=>c.uid===strike[0].uid)));s.phase='defeat';go(s,{type:'restart'});assert.equal(s.removalCount,2);assert.equal(ownedDeck(hydrate(serialize(s)),'lohen').length,3);assert.equal(newCampaign(s,4).removalCount,0);assert.equal(ownedDeck(newCampaign(s,4),'lohen').length,4);
});
test('removal protects a three-card minimum and rejects battle or benched owners without changing state',()=>{
 const s=base();s.gold=999;for(let n=0;n<1;n++)go(s,{type:'removeCard',hero:'lohen',uid:ownedDeck(s,'lohen')[0].uid});assert.equal(ownedDeck(s,'lohen').length,3);for(const a of [{type:'removeCard',hero:'lohen',uid:ownedDeck(s,'lohen')[0].uid},{type:'removeCard',hero:'jahoda',uid:ownedDeck(s,'jahoda')[0].uid}]){const before=serialize(s);assert.equal(act(s,a).ok,false);assert.equal(serialize(s),before);}
 go(s,{type:'farm'});const before=serialize(s);assert.equal(act(s,{type:'removeCard',hero:'illuga',uid:ownedDeck(s,'illuga')[0].uid}).ok,false);assert.equal(serialize(s),before);
});
test('camp actions stay in camp, rest is explicit and limited, and the base checkpoint is retained',()=>{
 const s=base(),checkpoint=serialize(s.checkpoint);s.phase='camp';s.node=5;s.hp=43;s.campActions=[];s.heroes.lohen.body.eyes=3;go(s,{type:'camp',choice:'rest'});assert.equal(s.phase,'camp');assert.equal(s.hp,68);assert.equal(s.heroes.lohen.body.eyes,3);assert.equal(act(s,{type:'camp',choice:'rest'}).ok,false);s.gold=80;go(s,{type:'removeCard',hero:'lohen',uid:ownedDeck(s,'lohen')[0].uid});assert.equal(serialize(s.checkpoint),checkpoint);go(s,{type:'leaveCamp'});assert.equal(s.phase,'reward');
});
test('v2 migration adds eyes and removal defaults in both live state and checkpoint without changing RNG or progression',()=>{
 const s=base();s.version=2;s.checkpoint.version=2;for(const x of [s,s.checkpoint]){delete x.tutorial;delete x.removalCount;for(const h of Object.values(x.heroes)){delete h.body.eyes;delete h.removedCards;}}const rng=s.rng,loaded=hydrate(serialize(s));assert.equal(loaded.version,3);assert.equal(loaded.checkpoint.version,3);assert.equal(loaded.rng,rng);assert.equal(loaded.node,7);assert.equal(loaded.tutorial.completed,true);for(const x of [loaded,loaded.checkpoint]){assert.equal(x.heroes.lohen.body.eyes,0);assert.deepEqual(x.heroes.lohen.removedCards,[]);assert.equal(x.removalCount,0);}
});
test('all 58 supplied illustration outputs match recorded hashes',()=>{
 const m=JSON.parse(fs.readFileSync(new URL('../dist/assets/illustrations3/manifest.json',import.meta.url)));assert.equal(m.total_files,58);assert.equal(m.assets.length,58);for(const a of m.assets){const bytes=fs.readFileSync(new URL('../dist/'+a.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
});
