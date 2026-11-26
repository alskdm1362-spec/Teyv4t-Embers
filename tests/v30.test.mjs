import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ENEMIES,RAID_BOSS_DEFAULT,battleRealm,createGame,act,serialize,hydrate} from '../dist/engine.js';
import {ENEMY_LOOKS,KIND_LOOKS,RAID_LOOK,pickLook,lookOf,enemyArtPath} from '../dist/enemy-looks.js';
import {CAST_SPRITES,CAST_IDS,castPose,castArt} from '../dist/cast-art.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const file=p=>new URL('../dist/'+p,import.meta.url),dist=p=>fs.readFileSync(file(p),'utf8');

test('every enemy kind has a monster look, and every look has art and a known kind',()=>{
 for(const kind of Object.keys(ENEMIES))assert.ok(KIND_LOOKS[kind],kind);
 for(const [id,look] of Object.entries(ENEMY_LOOKS)){assert.ok(ENEMIES[look.kind],id);const b=fs.readFileSync(file(enemyArtPath(id)));assert.equal(b.subarray(8,12).toString(),'WEBP');}
 assert.equal(Object.keys(ENEMY_LOOKS).length,19);
 assert.equal(pickLook('hound','celestial',0),'sky-seraph');assert.equal(pickLook('nightmare','celestial',0),'abyss-womb');
 assert.equal(lookOf({kind:'angler'}),'abyss-jelly');
 for(const old of ['rifthound','nightmare-large','primus','sentinel','angler'])assert.ok(!fs.existsSync(file(`assets/generated/${old}.png`)),old);
});

test('battles start in the abyss and spawn named looks; the celestial realm appears later on the map',()=>{
 const s=qaFixture('elite');for(const e of s.battle.enemies){assert.ok(ENEMY_LOOKS[e.look]);assert.equal(e.name,ENEMY_LOOKS[e.look].name);}
 const r=qaFixture('base');r.mode='route';r.node=8;assert.equal(battleRealm(r),'abyss');
 const realms=new Set();for(let seed=1;seed<40;seed++){r.seed=seed;r.node=30;realms.add(battleRealm(r));}
 assert.deepEqual([...realms].sort(),['abyss','celestial']);
});

test('old saves mid-battle gain looks on load',()=>{
 const s=qaFixture('elite');for(const e of s.battle.enemies){delete e.look;e.name='어둠의 낚시꾼';}delete s.battle.realm;
 const loaded=hydrate(serialize(s));for(const e of loaded.battle.enemies){assert.ok(ENEMY_LOOKS[e.look]);assert.notEqual(e.name,'어둠의 낚시꾼');}assert.equal(loaded.battle.realm,'abyss');
});

test('the raid boss is 천공의 사도·케루빔 with its own art',()=>{
 assert.equal(RAID_BOSS_DEFAULT.bossName,'천공의 사도·케루빔');assert.equal(ENEMY_LOOKS[RAID_LOOK].name,'천공의 사도·케루빔');
 const s=qaFixture('base');s.phase='lobby';s.runActive=false;s.collection.raid.bossName='천상의 왕좌 · 메타트론';
 const loaded=hydrate(serialize(s));assert.equal(loaded.collection.raid.bossName,'천공의 사도·케루빔');
 assert.ok(!dist('engine.js').includes('메타트론'));
});

test('hero battle sprites come in poses on feet-centred canvases',()=>{
 for(const id of CAST_IDS){
  const sp=CAST_SPRITES[id];assert.ok(sp.base>0.9&&sp.base<2);assert.ok(sp.poses.collapse>0);assert.ok(sp.poses.attack1&&sp.poses.guard);
  for(const pose of Object.keys(sp.poses).filter(p=>p!=='collapse'))assert.ok(fs.statSync(file(castPose(id,pose))).size>5000,id+pose);
  for(const role of ['battle','battleCollapsed'])assert.ok(fs.existsSync(file(castArt(id,role))));
 }
 assert.ok(CAST_SPRITES.illuga.poses.buff&&CAST_SPRITES.jahoda.poses.draw&&CAST_SPRITES.jahoda.poses.buff);
 const motion=dist('motion.js');assert.ok(motion.includes('pose(owner,action,before,effects,source)')&&motion.includes('void unpose?.()'));
});

test('shop opens the party only after an item is picked; awakening preview uses the card viewer spread',()=>{
 const app=dist('app.js');
 assert.ok(app.includes("case'shop':statusHero=state.party[0];shopItem=null;"));assert.ok(app.includes('data-state="${tab===\'equipment\'&&item?\'picked\':\'idle\'}"'));assert.ok(app.includes("case'shop-back':shopItem=null;"));assert.ok(app.includes('shop-party-open'));
 assert.ok(app.includes("case'file-branch':"));assert.ok(app.includes('file-view is-branch'));assert.ok(app.includes("action:'file-branch'"));
});
