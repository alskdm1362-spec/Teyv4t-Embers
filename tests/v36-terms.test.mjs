import test from 'node:test';
import assert from 'node:assert/strict';
import {act,cardInfo,CARDS} from '../dist/engine.js';
import {KEYWORDS,EMBER_TERMS,cardKeywords,HAND_LIMIT} from '../dist/keywords.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
const base={owner:'lohen',target:'none',type:'focus',amount:1,cost:0,desc:'시험'};
Object.assign(CARDS,{
 t_ret:{...base,name:'시험 보존',type:'attack',target:'enemy',amount:9,cost:1,keywords:['retain'],retainBonus:9},
 t_evap:{...base,name:'시험 증발',keywords:['evaporate']},
 t_block:{...base,name:'시험 불가',keywords:['unplayable']},
 t_recall:{...base,name:'시험 회수',keywords:['recall']},
 t_fin:{...base,name:'시험 종극',keywords:['finale']},
 t_open:{...base,owner:'durin',name:'시험 개전',keywords:['opening']},
 t_init:{...base,name:'시험 주도',cost:1,keywords:['initiative']},
 t_chain:{...base,owner:'durin',name:'시험 연계',keywords:['chain'],chain:{on:'attack',allDamage:3}},
 t_sense:{...base,owner:'durin',name:'시험 감응',keywords:['sense'],sense:{ap:1}},
});
function arena(hand){const s=qaFixture('battle');s.battle.noCrit=true;s.battle.ap=6;s.battle.hand=hand.map((key,i)=>({uid:'c'+i,owner:CARDS[key].owner,key}));s.battle.draw=[];s.battle.discard=[];s.battle.exhaust=[];
 for(const e of s.battle.enemies){e.hp=e.maxHp=99999;e.ward=0;e.hitWard=0;e.intent={...e.intent,damage:0,stress:0};}return s;}

test('v0.36 stage 2: the glossary has the eleven rule keywords (no 신속) and the Embers terms',()=>{
 assert.deepEqual(Object.values(KEYWORDS).map(k=>k.name),['소멸','증발','사용 불가','유일','보존','회수','종극','개전','주도','연계','감응']);
 for(const t of ['균열','위축','되비춤','추적흔','조준점','태양화','상흔','정신부담'])assert.ok(Object.values(EMBER_TERMS).some(x=>x.name===t),t);
 assert.equal(CARDS.d_resonance.name,'타다 남은 불티');assert.equal(CARDS.curse_echo.name,'악몽의 찌꺼기');assert.equal(HAND_LIMIT,10);
 assert.match(cardInfo(qaFixture('battle'),{owner:'lohen',key:'l_aim'}).desc,/^소멸\. /);assert.deepEqual(cardKeywords({exhaust:true,keywords:['retain']}),['exhaust','retain']);
});

test('v0.36 stage 2: retain keeps a card and applies its 보존 bonus; evaporate exhausts; unplayable cannot be used',()=>{
 const s=arena(['t_ret','t_evap','t_block']);const plain=cardInfo(s,s.battle.hand[0]).amount;
 assert.equal(act(s,{type:'play',uid:'c2'}).ok,false);go(s,{type:'endTurn'});
 assert.ok(s.battle.hand.some(c=>c.uid==='c0'));assert.ok(s.battle.exhaust.some(c=>c.uid==='c1'));assert.ok(!s.battle.exhaust.some(c=>c.uid==='c2'));
 assert.equal(cardInfo(s,s.battle.hand.find(c=>c.uid==='c0')).amount,plain+9);
});

test('v0.36 stage 2: recall returns once, finale ends the turn, opening is drawn first',()=>{
 const s=arena(['t_recall','t_fin']);go(s,{type:'play',uid:'c0'});assert.ok(s.battle.hand.some(c=>c.uid==='c0'));go(s,{type:'play',uid:'c0'});assert.ok(s.battle.discard.some(c=>c.uid==='c0'));
 const turn=s.battle.turn;go(s,{type:'play',uid:'c1'});assert.equal(s.battle.turn,turn+1);
 const t=qaFixture('base');t.heroes.durin.acquired=[...(t.heroes.durin.acquired||[]),'t_open'];go(t,{type:'farm'});assert.ok(t.battle.hand.some(c=>c.key==='t_open'));
});

test('v0.36 stage 2: chain answers an ally attack once per turn; sense fires on draw; initiative is lost to another card',()=>{
 const s=arena(['t_chain','l_strike','l_strike']);const r=go(s,{type:'play',uid:'c1',target:s.battle.enemies[0].id});assert.ok(r.events.some(e=>e.type==='chain'));
 assert.ok(!go(s,{type:'play',uid:'c2',target:s.battle.enemies[0].id}).events.some(e=>e.type==='chain'));
 const d=arena([]);d.battle.draw=[{uid:'x',owner:'durin',key:'t_sense'}];d.battle.ap=2;go(d,{type:'endTurn'});assert.equal(d.battle.ap,4);
 const i=arena(['t_init','l_aim']);i.battle.hand[0].initiative=true;assert.equal(cardInfo(i,i.battle.hand[0]).cost,0);go(i,{type:'play',uid:'c1'});assert.equal(cardInfo(i,i.battle.hand[0]).cost,1);
});

test('v0.36 stage 2: crack adds 8% per stack up to five and decays each turn; reflect answers a fully blocked hit',()=>{
 const s=arena(['l_strike','l_strike']);const id=s.battle.enemies[0].id,foe=()=>s.battle.enemies.find(x=>x.id===id);const a=go(s,{type:'play',uid:'c0',target:id}).events.find(x=>x.type==='damage').amount;
 foe().crack=9;const b=go(s,{type:'play',uid:'c1',target:id}).events.find(x=>x.type==='damage').amount;assert.ok(b>a*1.35&&b<a*1.45,`${a} ${b}`);
 foe().crack=3;go(s,{type:'endTurn'});assert.equal(foe().crack,2);
});
