import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {act,serialize,hydrate,scarLimit,SCAR_RATE,legPenalty,legLocked,isBlurred,cardInfo,HERO_STATS,PART_NAMES} from '../dist/engine.js';
import {qaFixture,qaApplyCondition} from '../dist/qa-fixtures.js';
import {bodySilhouette,woundLabel,INJURY_HELP,STAGE_COLORS} from '../dist/condition-ui.js';
import {injuryEffects} from '../dist/archive-ui.js';
import {EVENTS} from '../dist/expedition-content.js';
import {EMBER_TERMS} from '../dist/keywords.js';

const go=(s,a)=>{const r=act(s,a);Object.assign(s,r.state);return r;};
const read=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');
function arena(){const s=qaFixture('battle');for(const id of s.party)s.heroes[id].shield=0;s.shield=0;s.battle.enemies=s.battle.enemies.slice(0,1);const e=s.battle.enemies[0];e.hp=e.maxHp=99999;e.stun=0;return s;}
const hit=(s,target,damage)=>{const e=s.battle.enemies[0];e.stun=0;e.intent={name:'시험',damage,stress:0,target,tag:'시험'};return go(s,{type:'endTurn'});};

test('v0.36 stage 5: every hero has a scar limit from their own max HP, and the rule text states the same share',()=>{
 for(const id of Object.keys(HERO_STATS))assert.equal(scarLimit(id),Math.round(HERO_STATS[id].hp*SCAR_RATE));
 assert.equal(SCAR_RATE,.5);assert.ok(EMBER_TERMS.scar.desc.includes('절반'));assert.ok(INJURY_HELP.find(r=>r[0]==='상흔')[1].includes('절반'));
});

test('v0.36 stage 5: one big hit can roll the roulette more than once, shields keep scars away, and a shielded hero is never rolled',()=>{
 const s=arena(),L=scarLimit('durin'),r=hit(s,'durin',L*2+10),rolls=r.events.filter(e=>e.type==='injury');
 assert.equal(rolls.length,2);assert.ok(rolls.every(e=>e.roulette&&e.hero==='durin'));assert.equal(s.heroes.durin.scar,10);assert.equal(Object.values(s.heroes.durin.body).reduce((a,n)=>a+n,0),2);
 const t=arena();t.heroes.illuga.shield=500;const q=hit(t,'illuga',300);assert.equal(t.heroes.illuga.scar||0,0);assert.ok(!q.events.some(e=>e.type==='injury'));
});

test('v0.36 stage 5: the roulette event lists only parts that are not lost, and a hero with nothing left to wound stops rolling',()=>{
 const s=arena(),h=s.heroes.lohen;h.body={eyes:3,leftArm:0,rightArm:0,leftLeg:0,rightLeg:0};h.scar=scarLimit('lohen')-1;const ev=hit(s,'lohen',20).events.find(e=>e.type==='injury');
 assert.deepEqual([...ev.open].sort(),['leftArm','leftLeg','rightArm','rightLeg']);assert.ok(ev.open.includes(ev.part));assert.equal(ev.stage,1);
});

test('v0.36 stage 5: leg wounds drain party AP every other turn at stage 1 and every turn from stage 2, never below 1',()=>{
 const s=arena();s.heroes.lohen.body.leftLeg=1;assert.equal(legPenalty(s),.5);const ap=[];for(let i=0;i<4;i++){hit(s,'lohen',0);ap.push(s.battle.ap);}assert.deepEqual([...new Set(ap)].sort(),[2,3]);assert.equal(ap.filter(n=>n===2).length,2);
 const t=arena();for(const id of t.party)t.heroes[id].body.leftLeg=t.heroes[id].body.rightLeg=2;assert.equal(legPenalty(t),6);hit(t,'lohen',0);assert.equal(t.battle.ap,1);
});

test('v0.36 stage 5: a lost leg locks move choices only when another choice remains',()=>{
 const offer=EVENTS.find(e=>e.choices.some(c=>c.move)),move=offer.choices.find(c=>c.move),s=qaFixture('base');
 assert.equal(legLocked(s,move,offer),false);s.heroes.durin.body.rightLeg=3;assert.equal(legLocked(s,move,offer),true);assert.equal(legLocked(s,offer.choices.find(c=>!c.move),offer),false);
 assert.equal(legLocked(s,move,{choices:[move]}),false);
 s.phase='event';s.eventOffer=JSON.parse(JSON.stringify(offer));const before=serialize(s),r=act(s,{type:'event',choice:move.id});assert.equal(r.ok,false);assert.ok(/다리/.test(r.error),r.error);assert.equal(serialize(r.state||s),before);
});

test('v0.36 stage 5: wound labels, mini silhouette and status lines describe the new rules',()=>{
 const body={eyes:2,leftArm:0,rightArm:1,leftLeg:3,rightLeg:0};assert.equal(woundLabel(body),'눈 중상, 오른팔 경상, 왼다리 결손');assert.equal(woundLabel({}),'부상 없음');
 const svg=bodySilhouette(body,{label:woundLabel(body)});for(const part of Object.keys(PART_NAMES))assert.ok(svg.includes(`data-part="${part}" data-stage="${body[part]}"`),part);assert.equal(STAGE_COLORS.length,4);
 const lines=injuryEffects({body,retired:false});assert.deepEqual(lines,['눈 중상 · 실명 카드 1장','오른팔 경상 · 턴 첫 공격 카드 비용 +1','다리 · 매 턴 파티 행동력 -1','다리 결손 · 이동이 필요한 사건 선택지 잠김']);
 assert.deepEqual(injuryEffects({body:{eyes:0,leftArm:0,rightArm:0,leftLeg:1,rightLeg:0}}),['다리 · 2턴마다 파티 행동력 -1']);
});

test('v0.36 stage 5: the battle sprite shows a scar gauge instead of the stress bar, and the roulette never blocks the turn',()=>{
 const app=read('app.js'),motion=read('motion.js'),css=read('feedback-v28.css');
 assert.ok(app.includes('class="fighter-scar'));assert.ok(!app.includes('fighter-mind'));assert.ok(app.includes('hud-stress'));assert.ok(app.includes("pct>=75?'near':''"));
 assert.ok(motion.includes('void this.roulette('));assert.ok(!motion.includes('await this.roulette('));assert.ok(css.includes('.fighter-scar.near'));assert.ok(css.includes('.scar-roulette'));
 assert.ok(app.includes('leg-locked'));
});

test('v0.36 stage 5: the QA page can preset a scar gauge',()=>{
 const s=qaApplyCondition(qaFixture('battle'),{hero:'durin',part:'eyes',stage:0,scar:80});assert.equal(s.heroes.durin.scar,Math.round(scarLimit('durin')*.8));
 assert.ok(read('qa.html').includes('id="scar"'));
});
