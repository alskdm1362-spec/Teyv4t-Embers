import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {collapseStage,collapseArt,collapseCutins,COLLAPSE_GLASS} from '../dist/collapse-art.js';
import {CAST_IDS,castArt,cardArtwork} from '../dist/cast-art.js';
import {faceArt} from '../dist/condition-ui.js';
import {galleryItems} from '../dist/archive-ui.js';
import {qaFixture,qaApplyCondition} from '../dist/qa-fixtures.js';
import {act,serialize,hydrate,cardInfo} from '../dist/engine.js';
import {presentationPlan} from '../dist/motion-plan.js';
import {storyDialogue} from '../dist/story-ui.js';
import {CARE_SCRIPT} from '../dist/story-scripts.js';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root));
test('visual stages use 0–3 failures for first art and 4–10 for second, independently of collapse type',()=>{
 assert.equal(collapseStage(null),0);
 for(const type of ['despair','distrust','panic','frenzy'])for(let failures=0;failures<=10;failures++){
  const stage=failures<4?1:2;assert.equal(collapseStage({type,failures}),stage);
  for(const hero of CAST_IDS){const art=collapseArt(hero,stage);assert.equal(castArt(hero,'breakdown',stage),art);assert.equal(castArt(hero,'breakdownPortrait',stage),`assets/illustrations3/standing/${hero}-collapse.webp`);assert.equal(faceArt(hero,true,stage),`assets/illustrations3/portraits/${hero}-collapse.webp`);assert.equal(cardArtwork(hero,{breakdown:true,breakdownType:type,failures},''),`assets/illustrations/cards/${hero}/collapse-${['despair','panic'].includes(type)?1:2}.webp`);}
 }
 assert.ok(COLLAPSE_GLASS[2].opacity>COLLAPSE_GLASS[1].opacity);assert.ok(COLLAPSE_GLASS[1].opacity>.26);
});
test('eight cutin PNGs match upload hashes; only retired cutins are absent; original standing and combat pixels remain',()=>{
 const manifest=JSON.parse(read('dist/assets/collapse-stages/manifest.json'));assert.equal(manifest.assets.length,8);assert.equal(new Set(manifest.assets.map(a=>a.hero+'/'+a.stage)).size,8);
 for(const a of manifest.assets){const bytes=read('dist/'+a.path);assert.equal(bytes.length,a.bytes);assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),a.sha256);}
 const retired=JSON.parse(read('references/supplied/retired-collapse14.json'));for(const file of retired.retired_runtime_paths)assert.equal(fs.existsSync(new URL('dist/'+file,root)),false,file);
 for(const hero of CAST_IDS)assert.ok(fs.existsSync(new URL('dist/'+castArt(hero,'battleCollapsed'),root)));
});
test('a real fourth failed collapse card triggers one second-stage cutin; other failures, recoveries and resumes do not repeat it',()=>{
 for(const hero of CAST_IDS){const s=qaFixture('collapseStep',{hero});let before=hydrate(serialize(s));assert.equal(before.heroes[hero].breakdown.failures,3);const c=s.battle.hand.find(c=>c.owner===hero),r=act(s,{type:'play',uid:c.uid});assert.ok(r.ok,r.error);assert.equal(s.heroes[hero].breakdown.failures,4);assert.ok(r.events.some(e=>e.type==='collapseFail'));assert.deepEqual(presentationPlan(before,s,{type:'play',uid:c.uid},r.events).collapseCutins,[hero]);const reload=hydrate(serialize(s));assert.deepEqual(collapseCutins(s,reload),[]);assert.equal(collapseStage(reload.heroes[hero].breakdown),2);
  for(const failures of [0,1,2,4,5,6,7,8,9]){before=structuredClone(s);before.heroes[hero].breakdown.failures=failures;const after=structuredClone(before);after.heroes[hero].breakdown.failures++;assert.deepEqual(collapseCutins(before,after),[]);}
  before=structuredClone(s);const recovered=structuredClone(s);recovered.heroes[hero].breakdown=null;assert.deepEqual(collapseCutins(before,recovered),[]);const first=structuredClone(recovered);first.heroes[hero].breakdown={type:'panic',failures:0};assert.deepEqual(collapseCutins(recovered,first),[hero]);
 }
});
test('old saves at failure 0,3,4,10 retain RNG, growth, wounds and checkpoint while resolving correct art',()=>{
 for(const failures of [0,3,4,10]){const s=qaFixture('collapse',{failures});s.checkpoint.heroes.lohen.breakdown={type:'panic',failures};const bytes=serialize(s),loaded=hydrate(bytes);assert.equal(serialize(loaded),bytes);assert.equal(loaded.rng,s.rng);assert.equal(collapseStage(loaded.heroes.lohen.breakdown),failures<4?1:2);assert.equal(collapseStage(loaded.checkpoint.heroes.lohen.breakdown),failures<4?1:2);const c=loaded.battle.hand.find(c=>c.owner==='lohen');assert.equal(cardArtwork('lohen',cardInfo(loaded,c),c.key),`assets/illustrations/cards/lohen/collapse-${['despair','panic'].includes(loaded.heroes.lohen.breakdown.type)?1:2}.webp`);}
});
test('mental-care dialogue preserves original collapse standing at every failure count until the authored normal-pose cue',()=>{
 for(const hero of CAST_IDS)for(const failures of [0,3,4,10]){const cue=CARE_SCRIPT[hero].findIndex(l=>l.normal),stage=failures<4?1:2;for(let index=0;index<CARE_SCRIPT[hero].length;index++){const html=storyDialogue({kind:'care',hero,index,broken:{type:'panic',failures}});if(cue>=0&&index>=cue){assert.ok(!html.includes(collapseArt(hero,stage)));assert.ok(html.includes(`standing/${hero}.webp`));}else assert.ok(html.includes(`standing/${hero}-collapse.webp`));assert.ok(!html.includes('collapse-stages/'));}}
});
test('codex preserves original normal/collapse standing and exposes two separate cutin stages',()=>{
 for(const hero of CAST_IDS){const items=galleryItems(hero),standing=items.find(i=>i.id==='standing');assert.deepEqual(standing.variants.map(v=>v.name),['기본','붕괴']);for(const stage of [1,2]){const entry=items.find(i=>i.id==='breakdown-'+stage);assert.equal(entry.src,collapseArt(hero,stage));assert.equal(entry.stage,stage);assert.equal(entry.animation,'breakdown');}assert.ok(!items.some(i=>['battle','battleCollapsed'].includes(i.id)));assert.equal(galleryItems(hero,true).find(i=>i.id==='standing').variants,undefined);}
});
test('QA failures are bounded and never change the supplied production state',()=>{
 const s=qaFixture('battle'),original=serialize(s);const modified=qaApplyCondition(s,{hero:'lohen',breakdown:'panic',failures:4});assert.equal(serialize(s),original);assert.equal(collapseStage(modified.heroes.lohen.breakdown),2);assert.equal(qaApplyCondition(s,{breakdown:'panic',failures:99}).heroes.lohen.breakdown.failures,10);
});

test('standing and card originals retain supplied byte hashes independently of cutin PNGs',()=>{
 for(const manifest of ['illustrations3','illustrations']){const m=JSON.parse(read(`dist/assets/${manifest}/manifest.json`));const originals=m.assets.filter(a=>/\/(standing|portraits)\/.*-collapse\.webp$|\/cards\/.*\/collapse-[12]\.webp$/.test(a.path));assert.equal(originals.length,8);for(const a of originals)assert.equal(crypto.createHash('sha256').update(read('dist/'+a.path)).digest('hex'),a.sha256);}
});
