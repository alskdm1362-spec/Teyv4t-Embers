const createGame=(seed)=>createLegacyFixture(seed,{tutorial:false});
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {CARDS,createGame as createLegacyFixture,cardInfo,serialize} from '../dist/engine.js';
import {CARD_ART_MAP,cardArtwork,castArt,CAST_IDS} from '../dist/cast-art.js';
import {sceneBackground} from '../dist/scene-background.js';
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root)),json=file=>JSON.parse(read(file));

test('provided backgrounds appear only in late areas and never reset game state',()=>{
 const s=createGame(154),before=serialize(s);assert.equal(sceneBackground(s).id,'early');assert.equal(serialize(s),before);
 for(let node=0;node<6;node++)for(const phase of ['battle','reward','recruit','event'])assert.equal(sceneBackground({...s,node,phase}).id,'early');
 assert.equal(sceneBackground({...s,node:6,phase:'battle'}).src,'assets/update25/background-a-1.webp');
 assert.equal(sceneBackground({...s,mode:'challenge',phase:'battle',challengeStage:0}).id,'late-abyss');
 assert.equal(sceneBackground({...s,mode:'challenge',phase:'battle',challengeStage:1}).src,'assets/update25/background-b-2.webp');
 assert.equal(sceneBackground({...s,mode:'challenge',phase:'battle',challengeStage:2}).id,'late-final');
 for(const phase of ['title','base','camp','ending'])assert.equal(sceneBackground({...s,phase,mode:'challenge',challengeStage:2}).id,'early');
 assert.equal(sceneBackground({...s,phase:'battle',mode:'farm',node:7}).id,'early');
});

test('existing cards, both upgrade branches and four collapse types resolve supplied art consistently',()=>{
 assert.deepEqual(Object.keys(CARD_ART_MAP).sort(),Object.keys(CARDS).filter(k=>!CARDS[k].debuff).sort());const s=createGame(99);
 for(const id of CAST_IDS){
  const used=new Set();assert.match(castArt(id,'portrait'),new RegExp('/standing/'+id+'\\.webp$'));
  for(const [key,card] of Object.entries(CARDS).filter(([,c])=>c.owner===id&&!c.debuff)){
   for(const branch of [null,'A','B','C','D']){s.heroes[id].upgrades=branch?{[key]:branch}:{};const info=cardInfo(s,{owner:id,key}),file=cardArtwork(id,info,key);assert.ok(fs.existsSync(new URL('dist/'+file,root)));used.add(file);assert.equal(cardArtwork(id,info,key),file);}
   for(const type of ['despair','distrust','panic','frenzy']){s.heroes[id].breakdown={type,failures:3};const info=cardInfo(s,{owner:id,key}),file=cardArtwork(id,info,key);assert.match(file,/collapse-[12]\.webp$/);assert.ok(fs.existsSync(new URL('dist/'+file,root)));s.heroes[id].breakdown=null;}
  }
  assert.equal(used.size,7,'ordinary artwork stays stable and generated special cards get their own illustration for '+id);
 }
 assert.equal(castArt('lohen','partner'),'assets/illustrations3/standing/varka.webp');
 const manifest=json('dist/assets/illustrations/manifest.json');assert.equal(manifest.assets.length,43);
 for(const a of manifest.assets){const bytes=read('dist/'+a.path);assert.equal(bytes.length,a.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
});

test('new monsters remain byte-identical references outside runtime assets and code',()=>{
 const m=json('references/monsters/manifest.json');assert.equal(m.reference_only,true);assert.equal(m.runtime,false);assert.equal(m.assets.length,14);
 for(const a of m.assets){const bytes=read('references/monsters/'+a.file);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.source_sha256);assert.equal(a.runtime,false);assert.equal(fs.existsSync(new URL('dist/assets/'+a.file,root)),false);}
 const code=fs.readdirSync(new URL('dist/',root)).filter(f=>/\.(js|css)$/.test(f)).map(f=>read('dist/'+f).toString()).join('\n');assert.doesNotMatch(code,/references\/monsters|monster-\d{2}\.png/);
});

test('November replacement art stays in its assigned role and late scenery never consumes game RNG',()=>{
 const m=json('dist/assets/update25/manifest.json');assert.equal(m.assets.length,18);
 for(const a of m.assets){const bytes=read('dist/'+a.path);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
 for(const id of CAST_IDS){assert.equal(castArt(id,'ultimate'),`assets/update25/${id}-ultimate.webp`);assert.equal(castArt(id,'breakdownPortrait'),`assets/illustrations3/standing/${id}-collapse.webp`);}
 const used=new Set(),s=createGame(25);
 for(let node=6;node<24;node++)for(const phase of ['battle','event','reward','travel']){const sample={...s,node,phase},before=serialize(sample),scene=sceneBackground(sample);used.add(scene.src);assert.ok(fs.existsSync(new URL('dist/'+scene.src,root)));assert.equal(serialize(sample),before);}
 assert.equal(used.size,9);assert.equal(sceneBackground({...s,phase:'lobby'}).src,'assets/update25/lobby.webp');
});
