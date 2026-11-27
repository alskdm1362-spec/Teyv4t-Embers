import test from 'node:test';
import assert from 'node:assert/strict';
import {act} from '../dist/engine.js';
import {ENEMY_CYCLES,cycleMove} from '../dist/enemy-patterns.js';
import {qaFixture} from '../dist/qa-fixtures.js';

test('v0.36 stage 3: route monsters have no wards, echoes, corrosion or summons; bosses preview a fixed next move',()=>{
 const s=qaFixture('battle');const e=s.battle.enemies[0];e.kind='wanderer';e.hp=1;e.ward=0;
 const strike=s.battle.hand.find(c=>c.key==='l_strike'||c.key==='l_pierce');s.battle.ap=6;
 const r=act(s,{type:'play',uid:strike.uid,target:e.id});assert.ok(r.events.some(x=>x.type==='kill'&&x.enemy===e.id));assert.ok(!r.events.some(x=>x.type==='echo'));
 const b=qaFixture('battle');b.battle.enemies[0].kind='keeper';for(const x of b.battle.enemies)x.hp=x.maxHp=9999;act(b,{type:'endTurn'});
 const boss=b.battle.enemies[0];assert.ok(boss.next&&boss.next.name);assert.equal(boss.next.name,cycleMove('keeper',boss.turn+1).name);
 for(const x of b.battle.enemies)assert.ok(!x.intent.corrosion&&!x.intent.summon&&!x.intent.stars);
 for(const k of Object.keys(ENEMY_CYCLES))assert.ok(ENEMY_CYCLES[k].length>=1);
});
