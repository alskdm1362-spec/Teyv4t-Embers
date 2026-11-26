import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ATTACK_SOUNDS} from '../dist/sound.js';
const dist=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('v0.35: attackers draw above enemies, dash lands feet to feet, removal tab is visible',()=>{
 assert.ok(dist('feedback-v28.css').includes('.in-battle .fighter.acting,.in-battle .fighter.melee-dashing{z-index:60!important}'));
 const motion=dist('motion.js');assert.ok(motion.includes("actor?.classList?.add('acting')"));assert.ok(motion.includes('y:sr.bottom'));
 assert.ok(dist('app.js').includes(`data-state="\${tab==='remove'?'remove':item?'picked':'idle'}"`));
});

test('v0.35: loot equipment uses the shop picked layout',()=>{
 const app=dist('app.js'),i=app.indexOf('function pendingEquipModal'),body=app.slice(i,app.indexOf('\n',i));
 for(const s of ['loot-equip','shop-equip-layout','shop-showcase','showcase-capsule','shop-hero','equip-pending','skip-pending-equip'])assert.ok(body.includes(s),s);
 assert.ok(!body.includes('equipment-recipient'));
});

test('v0.35: supplied SFX and BGM are wired',()=>{
 for(const pair of Object.values(ATTACK_SOUNDS))for(const k of pair)assert.ok(['','-1'].some(v=>fs.existsSync(new URL(`../dist/assets/audio/sfx/${k}${v}.wav`,import.meta.url))),k);
 for(const k of ['swing_light','strike','fire_strong','stage_clear','card_flip','ui_tap'])assert.ok(fs.existsSync(new URL(`../dist/assets/audio/sfx/${k}.wav`,import.meta.url)),k);
 for(const k of ['lobby','battle','raid'])assert.ok(fs.existsSync(new URL(`../dist/assets/audio/bgm/${k}.mp3`,import.meta.url)),k);
});

test('v0.35.1: the living flame heals once per base visit',async()=>{
 const {qaFixture}=await import('../dist/qa-fixtures.js');const {act}=await import('../dist/engine.js');
 const s=qaFixture('base');s.hp=Math.max(1,s.maxHp-60);assert.ok(act(s,{type:'heal'}).ok);assert.equal(s.healUsed,true);
 s.hp=1;const again=act(s,{type:'heal'});assert.equal(again.ok,false);assert.equal(s.hp,1);
 assert.ok(dist('app.js').includes("(!needs.needed||state.healUsed)?'disabled'"));
});
