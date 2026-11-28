const createGame=(seed)=>createLegacyFixture(seed,{tutorial:false});
import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame as createLegacyFixture,act,serialize,hydrate,cardInfo} from '../dist/engine.js';
import {presentationPlan} from '../dist/motion-plan.js';
const move=(s,a)=>{const before=hydrate(serialize(s));const r=act(s,a);assert.ok(r.ok,r.error);return {r,before,plan:presentationPlan(before,s,a,r.events)};};
test('turn presentation retains targets and attack order before the next hand, even when UIDs are redrawn',()=>{
 const s=createGame(16);move(s,{type:'start'});const expected=s.battle.enemies.map(e=>({enemy:e.id,hero:e.intent.target}));const old=new Set(s.battle.hand.map(c=>c.uid));
 const {r,plan}=move(s,{type:'endTurn'});
 assert.deepEqual(plan.attacks.map(({enemy,hero})=>({enemy,hero})),expected);
 assert.deepEqual(new Set(plan.discarded),old);assert.deepEqual(new Set(plan.drawn),new Set(s.battle.hand.map(c=>c.uid)));
 assert.ok(plan.drawn.some(uid=>old.has(uid)),'the same physical card must animate out then back in');assert.ok(plan.shuffled);
 assert.equal(plan.attacks[0].effects.find(e=>e.type==='enemyAttack').hero,expected[0].hero);
 const events=r.events.map(e=>e.type);assert.ok(events.indexOf('enemyAttack')<events.indexOf('discard'));assert.ok(events.indexOf('discard')<events.indexOf('draw'));
});
test('played exhaust and recovery discard have different destinations in presentation',()=>{
 const s=createGame(9);s.heroes.lohen.acquired=['l_aim'];move(s,{type:'start'});const c=[...s.battle.hand,...s.battle.draw].find(c=>c.key==='l_aim');
 s.battle.draw=s.battle.draw.filter(x=>x.uid!==c.uid);if(!s.battle.hand.some(x=>x.uid===c.uid))s.battle.hand.push(c);
 let n=hydrate(serialize(s));let p=move(n,{type:'play',uid:c.uid}).plan;assert.equal(p.played.destination,'exhaust');
 s.heroes.lohen.stress=100;s.heroes.lohen.breakdown={type:'distrust',failures:10};
 p=move(s,{type:'play',uid:c.uid}).plan;assert.equal(p.played.destination,'discard');assert.deepEqual(p.changed,['lohen']);assert.equal(s.heroes.lohen.breakdown,null);
});
test('mental collapse during a target attack is attached to that attacker and changes all owner card views',()=>{
 const s=createGame(42);move(s,{type:'start'});s.heroes.lohen.stress=95;s.battle.enemies[0].intent={...s.battle.enemies[0].intent,damage:1,stress:15,target:'lohen'};
 const {plan}=move(s,{type:'endTurn'});assert.ok(plan.attacks[0].effects.some(e=>e.type==='breakdown'&&e.hero==='lohen'));assert.deepEqual(plan.changed,['lohen']);
 for(const zone of ['hand','draw','discard'])for(const c of s.battle[zone])assert.ok(cardInfo(s,c).breakdown);
});
test('draw events identify the cards actually dealt without exposing the future draw order',()=>{
 const s=createGame(42);const {r,plan}=move(s,{type:'start'});assert.deepEqual(plan.drawn,s.battle.hand.map(c=>c.uid));assert.ok(plan.newBattle);
 assert.ok(r.events.filter(e=>e.type==='draw').every(e=>!('next' in e)&&!('drawPile' in e)));
 assert.equal(new Set([...s.battle.hand,...s.battle.draw].map(c=>c.uid)).size,4);
});
test('a harmless preparation never becomes an attack target lock',()=>{
 const s=createGame(1);move(s,{type:'start'});const before=hydrate(serialize(s));
 const plan=presentationPlan(before,s,{type:'endTurn'},[{type:'enemyAction',enemy:'star-1',hero:'lohen',name:'심판에 힘을 보냄',damage:0,stress:0},{type:'enemyAction',enemy:'keeper-0',hero:'lohen',name:'영역 검출',damage:10,stress:10}]);
 assert.equal(plan.attacks[0].hostile,false);assert.equal(plan.attacks[1].hostile,true);
});
test('v0.37: a play that spends the last AP keeps its own hits (shown before the enemy turn); endTurn still shows none',()=>{
 const s=createGame(1);move(s,{type:'start'});const before=hydrate(serialize(s));
 const events=[{type:'card',uid:'j1'},{type:'damage',enemy:'e0',amount:900},{type:'kill',enemy:'e0'},{type:'turn'},{type:'enemyAction',enemy:'e1',hero:'lohen',name:'물기',damage:8,stress:0},{type:'damage',enemy:'x',amount:1}];
 const play=presentationPlan(before,s,{type:'play',uid:'j1'},events);
 assert.deepEqual(play.effects.map(e=>e.type),['damage','kill']);assert.equal(play.attacks.length,1);
 assert.deepEqual(presentationPlan(before,s,{type:'endTurn'},events).effects,[]);
});
test('v0.37: 심판 연출 — 번개 길은 끝에서 대상에 정확히 닿고, 박자는 영상 순서(소용돌이 → 구체 → 번개 창 → 먹 조각 → 눈 고리)를 따른다',async()=>{
 const {boltPath,BEATS}=await import('../dist/judgment-vfx.js');
 for(const seed of [1,7,42]){const p=boltPath(100,-30,400,300,seed,120);assert.deepEqual(p.at(-1),[400,300]);assert.deepEqual(p[0],[100,-30]);assert.ok(p.every(([x,y])=>Number.isFinite(x)&&Number.isFinite(y)));}
 const order=['vortex','orb','strike','shards','eye','end'];for(let i=1;i<order.length;i++)assert.ok(BEATS[order[i-1]]<BEATS[order[i]],order[i]);assert.ok(BEATS.end>=1.4&&BEATS.end<=1.8);
});
