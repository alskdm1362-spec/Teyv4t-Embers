import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,cardInfo,HERO_STATS,heroStats,partyMaxHp,defMitigation,attackPercent,shieldPercent,hydrate,serialize,applyInjury} from '../dist/engine.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};

test('v0.36 stage 1: hero stats follow the plan table and party HP is the sum of deployed heroes',()=>{
 assert.deepEqual(HERO_STATS.lohen,{hp:420,atk:110,def:40,cr:.15,cd:1.5});assert.equal(HERO_STATS.illuga.def,80);
 const s=qaFixture('base');assert.equal(s.maxHp,s.party.reduce((n,id)=>n+heroStats(id).hp,0));assert.equal(partyMaxHp(s),s.maxHp);
 assert.equal(createGame(3).maxHp,420);
});

test('v0.36 stage 1: cards read as coefficients and carry the actual numbers',()=>{
 const s=qaFixture('battle');const strike=cardInfo(s,{owner:'lohen',key:'l_strike'}),guard=cardInfo(s,{owner:'lohen',key:'l_guard'}),wall=cardInfo(s,{owner:'illuga',key:'i_guard'});
 assert.match(strike.desc,/^피해 100%/);assert.equal(attackPercent(9),100);assert.ok(strike.numbers.damage>0&&strike.numbers.critDamage>strike.numbers.damage);
 assert.match(guard.desc,/방어력 기반 본인 보호막 200%/);assert.equal(shieldPercent(7),200);assert.match(wall.desc,/방어력 기반 파티 전원 보호막/);assert.equal(wall.numbers.party,true);
});

test('v0.36 stage 1: damage uses ATK, crit and DEF; shields are personal except Illuga',()=>{
 const s=qaFixture('battle');s.battle.noCrit=true;s.battle.ap=6;const e=s.battle.enemies[0];e.hp=e.maxHp=9999;e.ward=0;e.hitWard=0;e.vulnerable=0;
 s.battle.hand=[{uid:'a',owner:'lohen',key:'l_strike'},{uid:'g',owner:'lohen',key:'l_guard'},{uid:'w',owner:'illuga',key:'i_guard'}];
 const before=s.heroes.lohen.level;const hit=go(s,{type:'play',uid:'a',target:e.id}).events.find(x=>x.type==='damage');
 const pts=cardInfo(s,{owner:'lohen',key:'l_strike'}).amount+(before-1)*2;assert.equal(hit.amount,Math.round(pts*110/9*defMitigation(e.def)));
 go(s,{type:'play',uid:'g'});assert.equal(s.heroes.lohen.shield,Math.round((7+before-1)*2/7*40));assert.equal(s.heroes.durin.shield,0);
 go(s,{type:'play',uid:'w'});assert.ok(s.party.every(id=>s.heroes[id].shield>0));assert.equal(s.shield,s.party.reduce((n,id)=>n+s.heroes[id].shield,0));
});

test('v0.36 stage 1: enemy hits pick a hero, are cut by that hero DEF and shield, and are recorded per hero',()=>{
 const s=qaFixture('battle');for(const id of s.party)s.heroes[id].shield=0;s.shield=0;s.battle.enemies=s.battle.enemies.slice(0,1);const e=s.battle.enemies[0];e.hp=e.maxHp=9999;e.stun=0;
 e.intent={name:'시험',damage:200,stress:0,target:'durin',tag:'시험'};s.heroes.durin.shield=50;const hp=s.hp;go(s,{type:'endTurn'});
 assert.equal(s.hp,hp-150);assert.equal(s.heroes.durin.scar,150);assert.equal(s.heroes.durin.lost,150);assert.equal(s.heroes.durin.shield,0);
});

test('v0.36 stage 1: a retiring hero removes their max HP and their remaining share; old saves rescale',()=>{
 const s=qaFixture('base');const full=s.maxHp,hp=s.hp;s.heroes.durin.lost=100;s.heroes.durin.body.leftArm=3;
 applyInjury(s,'durin','rightArm');applyInjury(s,'durin','rightArm');applyInjury(s,'durin','rightArm');assert.equal(s.heroes.durin.retired,true);
 assert.equal(s.maxHp,full-400);assert.equal(s.hp,hp-(400-100));
 const legacy=JSON.parse(serialize(qaFixture('base')));legacy.hp=50;legacy.maxHp=100;delete legacy.hpScaled;const back=hydrate(legacy);assert.equal(back.maxHp,partyMaxHp(back));assert.equal(back.hp,Math.round(back.maxHp/2));
});
