import {completeJoin,finishCare} from './flow-helpers.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {createGame,act,cardInfo,ownedDeck,serialize,hydrate,applyInjury,applyStress,legPenalty,legLocked,scarLimit,removalCost,newCampaign,CARDS,HERO_STATS} from '../dist/engine.js';
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
  const s=createGame(seed);go(s,{type:'start'});assert.deepEqual(s.battle.hand.map(c=>[c.key,cardInfo(s,c).cost]),[['l_pierce',2],['l_guard',1],['l_strike',1],['l_strike',1],['l_strike',1]]);assert.equal(s.battle.enemies[0].kind,'trainingSlime');assert.equal(s.battle.enemies[0].intent.damage,Math.round(3*17*100/140));
  const [attack,guard]=s.battle.hand;for(const a of [{type:'endTurn'},{type:'play',uid:attack.uid,target:s.battle.enemies[0].id},{type:'support',hero:'lohen'},{type:'ultimate',hero:'lohen'}]){const before=serialize(s);assert.equal(act(s,a).ok,false);assert.equal(serialize(s),before);}
  go(s,{type:'tutorialNext'});go(s,{type:'tutorialSelect',uid:attack.uid});go(s,{type:'play',uid:attack.uid,target:s.battle.enemies[0].id});assert.equal(s.tutorial.step,'defense-select');
  go(s,{type:'tutorialSelect',uid:guard.uid});go(s,{type:'play',uid:guard.uid});assert.equal(s.tutorial.step,'end-turn');go(s,{type:'endTurn'});assert.equal(s.tutorial.step,'refill');assert.equal(s.battle.ap,3);const resumed=hydrate(serialize(s));assert.equal(resumed.tutorial.step,'refill');assert.equal(act(s,{type:'endTurn'}).ok,false);go(s,{type:'tutorialNext'});assert.equal(s.tutorial.step,'free');finishBattle(s);assert.equal(s.node,1);
  assert.equal(act(s,{type:'recruit',hero:pair[0]}).ok,false);for(let i=0;i<4;i++)go(s,{type:'recruitDialogue'});go(s,{type:'recruit',hero:pair[0]});completeJoin(s);assert.equal(s.tutorial.step,'partner-select');assert.equal(s.battle.enemies.length,2);
  go(s,{type:'tutorialSelect',hero:'lohen',kind:'support'});go(s,{type:'support',hero:'lohen'});assert.equal(s.tutorial.step,'free');finishBattle(s);go(s,{type:'skipRecruitDialogue'});const hp=s.hp;go(s,{type:'recruit',hero:pair[1]});completeJoin(s);assert.equal(s.phase,'base');assert.equal(s.node,7);assert.equal(s.battlesWon,2);assert.equal(s.hp,hp+HERO_STATS[pair[1]].hp);assert.equal(s.maxHp,[ 'lohen',...pair].reduce((n,id)=>n+HERO_STATS[id].hp,0));assert.equal(s.tutorial.active,true);assert.equal(s.tutorial.step,'lobby-guide');assert.deepEqual(s.party,['lohen',...pair]);go(s,{type:'returnToLobby'});assert.equal(s.tutorial.step,'return-guide');assert.equal(s.collection.tutorialDone,undefined);go(s,{type:'resumeExpedition'});assert.equal(s.phase,'base');assert.equal(s.tutorial.completed,true);assert.equal(s.tutorial.active,false);assert.equal(s.collection.tutorialDone,true);assert.equal(s.checkpoint.tutorial.active,false);
 }
});
test('skipping controls and explicitly skipping dialogue opens recruit choices without a reward map',()=>{
 const s=createGame(123);go(s,{type:'start'});go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});assert.equal(s.phase,'recruit');assert.equal(s.recruitLine,4);assert.equal(s.battle,null);go(s,{type:'recruit',hero:'durin'});completeJoin(s);go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});assert.equal(s.node,3);assert.equal(s.recruitLine,4);go(s,{type:'recruit',hero:'illuga'});completeJoin(s);assert.equal(s.phase,'base');assert.equal(s.battlesWon,0);go(s,{type:'farm'});assert.equal(s.battle.enemies[0].kind,'hound');
});
test('eyes: stage 1 blurs one card in hand, stage 2 mixes in one 실명 card, stage 3 blurs half the hand; collapse keeps priority',()=>{
 const s=base();go(s,{type:'farm'});const mine=()=>s.battle.hand.filter(c=>c.owner==='lohen'),all=()=>['hand','draw','discard','exhaust'].flatMap(z=>s.battle[z]).filter(c=>c.owner==='lohen');
 s.battle.hand=[...all().slice(0,4),...s.battle.hand.filter(c=>c.owner!=='lohen').slice(0,1)];const uids=new Set(s.battle.hand.map(c=>c.uid));s.battle.draw=s.battle.draw.filter(c=>!uids.has(c.uid));
 applyInjury(s,'lohen','eyes');assert.equal(mine().filter(c=>cardInfo(s,c).blurred).length,1);assert.ok(!all().some(c=>c.blindMark));
 applyInjury(s,'lohen','eyes');const marked=all().filter(c=>c.blindMark);assert.equal(marked.length,1);const d=cardInfo(s,marked[0]);assert.deepEqual([d.name,d.desc,d.displayCost],['실명','??','?']);assert.ok(ownedDeck(s,'lohen').some(x=>x.key===marked[0].blindKey));assert.equal(d.cost,d.actual.cost);
 applyInjury(s,'lohen','eyes');const clear=mine().filter(c=>!c.blindMark);assert.equal(clear.filter(c=>cardInfo(s,c).blurred).length,Math.ceil(clear.length/2));assert.equal(all().filter(c=>c.blindMark).length,1);
 const before=serialize(s),rng=s.rng;for(const c of s.battle.hand)cardInfo(s,c);assert.equal(serialize(s),before);const loaded=hydrate(before);assert.equal(loaded.rng,rng);assert.deepEqual(loaded.battle,s.battle);
 applyStress(s,'lohen',100);assert.equal(cardInfo(s,marked[0]).type,'breakdown');assert.equal(cardInfo(s,marked[0]).cost,1);assert.equal(cardInfo(s,marked[0]).blind,undefined);
});
test('blind effects use actual costs, targets and exhaustion; insufficient AP cannot reroll',()=>{
 for(const key of ['l_pierce','l_guard','l_aim']){const s=base();s.heroes.lohen.acquired=['l_aim'];go(s,{type:'farm'});s.heroes.lohen.body.eyes=3;const c={...ownedDeck(s,'lohen')[0],blindKey:key,blindMark:true};s.battle.hand=[c];s.battle.ap=3;const e=s.battle.enemies[0],hp=e.hp,shield=s.shield;const r=go(s,{type:'play',uid:c.uid,target:e.id});assert.equal(s.battle.ap,3-CARDS[key].cost);assert.equal(r.events.find(e=>e.type==='card').card,key);assert.equal(r.events.find(e=>e.type==='card').blind,true);assert.ok(s.battle[key==='l_aim'?'exhaust':'discard'].some(x=>x.uid===c.uid));if(key==='l_pierce')assert.ok(e.hp> s.battle.enemies[0].hp||hp>s.battle.enemies[0].hp);if(key==='l_guard')assert.equal(s.shield-shield,80);if(key==='l_aim')assert.equal(s.heroes.lohen.buffs.nextPct,50);}
 const s=base();s.heroes.lohen.acquired=['l_aim'];go(s,{type:'farm'});s.heroes.lohen.body.eyes=3;s.battle.hand=[{...ownedDeck(s,'lohen')[0],blindKey:'l_pierce',blindMark:true}];s.battle.ap=1;const before=serialize(s);assert.equal(act(s,{type:'play',uid:s.battle.hand[0].uid}).ok,false);assert.equal(serialize(s),before);
});
test('arms: right taxes attack cards and left taxes guard and skill cards; stage 1 only the first each turn, stage 3 also cuts the effect',()=>{
 const s=base(['jahoda','illuga']);go(s,{type:'farm'});const h=s.heroes.lohen,cost=key=>cardInfo(s,{owner:'lohen',key,uid:key}).cost;
 assert.deepEqual([cost('l_strike'),cost('l_guard')],[1,1]);h.body.rightArm=1;assert.deepEqual([cost('l_strike'),cost('l_guard')],[2,1]);
 s.battle.hand=[{uid:'a',owner:'lohen',key:'l_strike'},{uid:'b',owner:'lohen',key:'l_strike'}];s.battle.ap=6;go(s,{type:'play',uid:'a',target:s.battle.enemies[0].id});assert.equal(s.battle.ap,4);assert.equal(cardInfo(s,s.battle.hand.find(c=>c.uid==='b')).cost,1);
 const h2=s.heroes.lohen;h2.body.rightArm=2;assert.equal(cost('l_strike'),2);h2.body.rightArm=3;assert.equal(cost('l_strike'),2);assert.equal(cardInfo(s,{owner:'lohen',key:'l_pierce'}).injuryRate,.7);assert.equal(cardInfo(s,{owner:'lohen',key:'l_guard'}).injuryRate,1);
 h2.body.leftArm=3;assert.equal(cost('l_guard'),2);assert.equal(cardInfo(s,{owner:'lohen',key:'l_guard'}).injuryRate,.7);assert.match(cardInfo(s,{owner:'lohen',key:'l_guard'}).desc,/팔 결손: 효과 70%/);
});
test('legs add up across the party: AP -1 every other turn for a light wound, every turn from a serious one, never below 1; a lost leg locks movement choices',()=>{
 const s=base();s.heroes.lohen.body.leftLeg=1;go(s,{type:'farm'});const ap=[s.battle.ap];for(let i=0;i<3;i++){for(const e of s.battle.enemies){e.hp=e.maxHp=99999;e.stun=9;}go(s,{type:'endTurn'});ap.push(s.battle.ap);}assert.deepEqual(ap,[3,2,3,2]);
 const t=base();t.heroes.lohen.body.leftLeg=2;t.heroes.durin.body.rightLeg=3;t.heroes.illuga.body.leftLeg=2;go(t,{type:'farm'});assert.equal(t.battle.ap,1);assert.equal(legPenalty(t),3);
 const e=base();e.phase='event';e.eventOffer={id:'x',name:'시험',choices:[{id:'around',label:'멀리 돌아간다',move:true,benefit:{kind:'gold',amount:1},cost:{}},{id:'stay',label:'머문다',benefit:{kind:'gold',amount:1},cost:{}}]};assert.equal(legLocked(e,e.eventOffer.choices[0]),false);e.heroes.lohen.body.leftLeg=3;assert.equal(legLocked(e,e.eventOffer.choices[0]),true);const before=serialize(e);assert.equal(act(e,{type:'event',choice:'around'}).ok,false);assert.equal(serialize(e),before);assert.ok(act(e,{type:'event',choice:'stay'}).ok);
});
test('scars: HP damage fills a per-hero gauge; at half of that hero HP a roulette wounds a part that is not lost; healing lowers the gauge and victory clears it',()=>{
 const s=base();go(s,{type:'farm'});const b=s.battle;for(const id of s.party)s.heroes[id].shield=0;b.enemies=b.enemies.slice(0,1);const e=b.enemies[0];e.hp=e.maxHp=99999;e.stun=0;assert.equal(scarLimit('lohen'),210);const L=scarLimit('lohen');
 e.intent={name:'시험',damage:L-5,stress:0,target:'lohen',tag:'시험'};let r=go(s,{type:'endTurn'});assert.equal(s.heroes.lohen.scar,L-5);assert.ok(!r.events.some(x=>x.type==='injury'));
 s.battle.enemies[0].stun=0;s.battle.enemies[0].intent={name:'시험',damage:30,stress:0,target:'lohen',tag:'시험'};r=go(s,{type:'endTurn'});const inj=r.events.find(x=>x.type==='injury');assert.ok(inj&&inj.roulette&&inj.open.length===5);assert.equal(s.heroes.lohen.scar,25);assert.equal(Object.values(s.heroes.lohen.body).reduce((a,n)=>a+n,0),1);
 const h=s.heroes.lohen;h.body={eyes:3,leftArm:0,rightArm:0,leftLeg:0,rightLeg:0};h.scar=L-1;for(let i=0;i<8;i++){const p=hydrate(serialize(s));p.rng+=i*977;p.battle.enemies[0].stun=0;p.battle.enemies[0].intent={name:'시험',damage:10,stress:0,target:'lohen',tag:'시험'};const ev=go(p,{type:'endTurn'}).events.find(x=>x.type==='injury');assert.ok(ev&&ev.part!=='eyes'&&!ev.open.includes('eyes'));}
 for(const x of s.battle.enemies)x.hp=1;s.battle.hand=[{uid:'k',owner:'lohen',key:'l_pierce'}];s.battle.ap=6;go(s,{type:'play',uid:'k',target:s.battle.enemies[0].id});assert.notEqual(s.phase,'battle');assert.ok(Object.values(s.heroes).every(x=>x.scar===0));
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
 const s=base(),checkpoint=serialize(s.checkpoint);s.phase='camp';s.node=5;s.hp=43;s.campActions=[];s.heroes.lohen.body.eyes=3;go(s,{type:'camp',choice:'rest'});assert.equal(s.phase,'camp');assert.equal(s.hp,43+Math.round(s.maxHp*.2));assert.equal(s.heroes.lohen.body.eyes,3);assert.equal(act(s,{type:'camp',choice:'rest'}).ok,false);s.gold=80;go(s,{type:'removeCard',hero:'lohen',uid:ownedDeck(s,'lohen')[0].uid});assert.equal(serialize(s.checkpoint),checkpoint);go(s,{type:'leaveCamp'});assert.equal(s.phase,'reward');
});
test('v2 migration adds eyes and removal defaults in both live state and checkpoint without changing RNG or progression',()=>{
 const s=base();s.version=2;s.checkpoint.version=2;for(const x of [s,s.checkpoint]){delete x.tutorial;delete x.removalCount;for(const h of Object.values(x.heroes)){delete h.body.eyes;delete h.removedCards;}}const rng=s.rng,loaded=hydrate(serialize(s));assert.equal(loaded.version,3);assert.equal(loaded.checkpoint.version,3);assert.equal(loaded.rng,rng);assert.equal(loaded.node,7);assert.equal(loaded.tutorial.completed,true);for(const x of [loaded,loaded.checkpoint]){assert.equal(x.heroes.lohen.body.eyes,0);assert.deepEqual(x.heroes.lohen.removedCards,[]);assert.equal(x.removalCount,0);}
});
test('all 58 supplied illustration outputs match recorded hashes',()=>{
 const m=JSON.parse(fs.readFileSync(new URL('../dist/assets/illustrations3/manifest.json',import.meta.url)));assert.equal(m.total_files,58);assert.equal(m.assets.length,58);for(const a of m.assets){const bytes=fs.readFileSync(new URL('../dist/'+a.path,import.meta.url));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
});
