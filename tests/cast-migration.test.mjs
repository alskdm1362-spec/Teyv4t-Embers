const createGame=(seed)=>createLegacyFixture(seed,{tutorial:false});
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {hydrate,serialize,act,HEROES,CARDS,createGame as createLegacyFixture} from '../dist/engine.js';
import {CAST_IDS,ART_ROLES,castArt,cardArtwork,CAST_FOOT_X} from '../dist/cast-art.js';
const fixture=fs.readFileSync(new URL('./fixtures/legacy-v1-cast.json',import.meta.url),'utf8');
const command=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};

test('v0.4 saves migrate live combat and checkpoint without losing growth, wounds, RNG or targets',()=>{
 const old=JSON.parse(fixture),s=hydrate(fixture);
 assert.equal(s.version,3);assert.deepEqual(s.party,['lohen','durin','illuga']);assert.equal(HEROES.mitya,undefined);
 assert.deepEqual([s.hp,s.gold,s.rng,s.support,s.retries,s.temporal],[old.hp,old.gold,old.rng,old.support,old.retries,old.temporal]);
 const h=s.heroes.durin;assert.equal(h.level,3);assert.equal(h.xp,25);assert.equal(h.body.leftArm,2);assert.equal(h.breakdown.failures,10);assert.equal(h.upgrades.d_wave,'B');assert.equal(h.equipment.weapon,'plainSpear');
 assert.equal(s.battle.hand[0].owner,'durin');assert.ok(CARDS[s.battle.hand[0].key]);assert.equal(s.battle.ultimates.durin,true);assert.equal(s.battle.enemies[0].observed,'durin');assert.equal(s.battle.enemies[0].intent.target,'durin');
 assert.ok(s.collection.cutins.includes('support-albedo'));assert.ok(s.collection.cutins.includes('ultimate-durin'));assert.deepEqual(s.collection.endings,['first-front']);
 assert.equal(s.checkpoint.version,3);assert.equal(s.checkpoint.heroes.durin.upgrades.d_wave,'B');assert.equal(s.checkpoint.heroes.durin.body.leftArm,2);
 assert.ok(!serialize(s).includes('mitya'));assert.ok(!serialize(s).includes('valeri'));assert.deepEqual(hydrate(serialize(s)),s);
});

test('migrated collapse can recover; Albedo support and checkpoint restore remain playable',()=>{
 const s=hydrate(fixture),hp=s.hp;command(s,{type:'play',uid:s.battle.hand[0].uid});assert.equal(s.heroes.durin.breakdown,null);assert.equal(s.heroes.durin.stress,40);assert.equal(s.hp,hp);
 s.heroes.durin.retired=true;s.heroes.durin.breakdown={type:'panic',failures:2};s.support=6;
 const r=command(s,{type:'support',hero:'durin'});assert.ok(r.events.some(e=>e.partner==='albedo'));assert.equal(s.heroes.durin.retired,true);assert.equal(s.heroes.durin.breakdown.type,'panic');assert.equal(s.support,4);
 s.phase='defeat';s.hp=0;command(s,{type:'restart'});assert.equal(s.hp,57);assert.equal(s.heroes.durin.body.leftArm,2);assert.equal(s.heroes.durin.upgrades.d_wave,'B');assert.equal(s.heroes.durin.breakdown.failures,10);assert.equal(s.retries,3);
});

test('cast artwork retains non-collapse cutins and resolves replacement collapse stages',()=>{
 const root=new URL('../dist/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/cast/manifest.json',import.meta.url)));
 assert.deepEqual(new Set(Object.keys(HEROES)),new Set(CAST_IDS));assert.equal(manifest.assets.length,20);
 const resolved=new Set();
 for(const id of CAST_IDS){
  assert.equal(CAST_FOOT_X[id],.5);
  for(const role of Object.keys(ART_ROLES)){
   const asset=castArt(id,role);resolved.add(asset);const bytes=fs.readFileSync(new URL(asset,root));if(asset.endsWith('.png'))assert.equal(bytes.subarray(1,4).toString(),'PNG');else{assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');}assert.ok(bytes.length>10000);
  }
  const key=Object.keys(CARDS).find(k=>CARDS[k].owner===id);assert.match(cardArtwork(id,{cost:1},key),/skill-/);assert.match(cardArtwork(id,{upgraded:true},key),/skill-/);assert.match(cardArtwork(id,{breakdown:true,breakdownType:'frenzy',failures:4},key),/collapse-2/);
 }
 for(const a of manifest.assets){const bytes=fs.readFileSync(new URL(a.path,root));assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
 assert.equal(resolved.size,40);assert.equal(createGame().version,3);
});
