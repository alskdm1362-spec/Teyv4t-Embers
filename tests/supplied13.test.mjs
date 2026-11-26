import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {CAST_VFX,shieldEffect,suppliedEffect,hasPartyCollapse,blindnessTransitions,CollapseAtmosphere} from '../dist/supplied-vfx.js';
import {galleryItems,ALLIES} from '../dist/archive-ui.js';
import {surfaceMarkup} from '../dist/menu-ui.js';
import {qaFixture,qaApplyCondition} from '../dist/qa-fixtures.js';
import {PolyhedralDiceEngine} from '../dist/vendor/polyhedral-dice.js';
const THREE=globalThis.THREE;
test('supplied cast attacks and shields keep authored sky, gold, cyan/pink and dark red families',()=>{
 assert.deepEqual(Object.values(CAST_VFX).map(x=>x.guard),['guardSky','guardGold','guardCyanPink','guardDarkRed']);
 for(const [hero,d] of Object.entries(CAST_VFX)){assert.equal(suppliedEffect('spear',{hero}),d.attack);assert.equal(suppliedEffect('spear',{hero,ultimate:true}),d.ultimate);assert.equal(suppliedEffect('guard',{hero,shield:true}),d.guard);for(const kind of ['guard','guard-hit','veil'])assert.ok(!['guardWhite','guardPinkPurple'].includes(suppliedEffect(kind,{hero,shield:true})));}
 assert.equal(shieldEffect('lohen',{enemy:true}),'guardPinkPurple');assert.equal(shieldEffect('durin',{enemy:true,celestial:true}),'guardWhite');
 assert.equal(suppliedEffect('guard-hit',{enemy:true,celestial:true,shield:true}),'guardWhite');
});
test('persistent glitch follows any current party collapse, including retired fighters but excluding benches/title',()=>{
 const s=qaFixture('battle');assert.equal(hasPartyCollapse(s),false);s.heroes.jahoda.breakdown={type:'panic',failures:0};assert.equal(hasPartyCollapse(s),s.party.includes('jahoda'));s.heroes.durin.breakdown={type:'despair',failures:0};s.heroes.durin.retired=true;assert.equal(hasPartyCollapse(s),true);s.heroes.lohen.breakdown={type:'despair',failures:1};s.heroes.durin.breakdown=null;assert.equal(hasPartyCollapse(s),true);s.heroes.lohen.breakdown=null;assert.equal(hasPartyCollapse(s),false);s.heroes.lohen.breakdown={type:'despair',failures:0};s.phase='title';assert.equal(hasPartyCollapse(s),false);
});
test('burn only newly visible blindness faces; no repeated burn on draw/load, collapse takes precedence',()=>{
 const before=qaFixture('battle'),after=qaApplyCondition(before,{hero:'lohen',part:'eyes',stage:3});const own=before.battle.hand.filter(c=>c.owner==='lohen').map(c=>c.uid);
 assert.deepEqual(blindnessTransitions(before,after),own);assert.deepEqual(blindnessTransitions(after,after),[]);
 const collapsed=qaApplyCondition(after,{hero:'lohen',part:'eyes',stage:3,breakdown:'despair'});assert.deepEqual(blindnessTransitions(before,collapsed),[]);assert.deepEqual(blindnessTransitions(collapsed,after),own);
 const drawOnly=structuredClone(after);drawOnly.battle.hand.push({uid:'newly-drawn',owner:'lohen',key:'l_strike'});assert.deepEqual(blindnessTransitions(after,drawOnly),[]);
});
test('standing art is one gallery entry with normal/collapse variants; partners have no invented collapse art',()=>{
 for(const a of ALLIES){const items=galleryItems(a.hero,a.partner);assert.ok(!items.some(i=>['battle','battleCollapsed','collapse-standing'].includes(i.id)));const standing=items.find(i=>i.id==='standing');if(a.partner)assert.equal(standing.variants,undefined);else{assert.deepEqual(standing.variants.map(v=>v.name),['기본','붕괴']);for(const v of standing.variants)assert.ok(fs.existsSync(new URL('../dist/'+v.src,import.meta.url)));}}
 const html=surfaceMarkup('확대','<img alt="원본">','media-viewer');assert.ok(html.includes('aria-modal="true"'));assert.ok(!html.includes('<header'));assert.ok(!html.includes('modern-surface'));
});
function dice(){const e=Object.create(PolyhedralDiceEngine.prototype);Object.assign(e,{dice:[],scene:new THREE.Scene(),camera:new THREE.PerspectiveCamera(28,2,.5,60),sound:{init(){},playImpact(){}},isRolling:false,materialCache:new Map(),onRollStart(){},onRollComplete(){}});e.camera.position.set(0,0,16);e._createFaceMaterial=()=>new THREE.MeshStandardMaterial();return e;}
test('all supplied polyhedra align every labeled face upright toward camera',()=>{
 const e=dice();for(const type of ['d4','d6','d8','d10','d12','d20']){const d=e._buildDieMesh(type);assert.equal(d.faceTargets.length,Number(type.slice(1)));for(const face of d.faceTargets){const q=e._quatForFace(face),normal=face.normal.clone().applyQuaternion(q),up=face.tangentV.clone().applyQuaternion(q),right=face.tangentU.clone().applyQuaternion(q);assert.ok(normal.distanceTo(new THREE.Vector3(0,0,1))<1e-6,type+face.value);assert.ok(up.distanceTo(new THREE.Vector3(0,1,0))<1e-6);assert.ok(right.distanceTo(new THREE.Vector3(1,0,0))<1e-6);}}
});
test('supplied d20 physics settles exactly on each committed 1–20 result and calls completion once',()=>{
 const e=dice();let complete=0,result;e.onRollComplete=r=>{complete++;result=r[0].value;};for(let value=1;value<=20;value++){e.roll([{type:'d20',targetValue:value}]);for(let i=0;i<1000&&e.isRolling;i++)e._stepPhysics(1/60);assert.equal(e.isRolling,false);assert.equal(result,value);assert.equal(complete,value);const d=e.dice[0];assert.ok(d.mesh.quaternion.angleTo(d.targetQuat)<1e-6);assert.ok(d.pos.distanceTo(d.targetPos)<1e-6);e._stepPhysics(.04);assert.equal(complete,value);}
});

test('atmosphere keeps a single canvas, stops when the last party collapse clears, and resumes after visibility',()=>{
 const keys=['document','window','innerWidth','innerHeight','requestAnimationFrame','cancelAnimationFrame','GameVFXManager','GameVFXRenderers'];const old=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));const events={},canvases=[];let frame=0,cancelled=0,short=false;
 try{globalThis.GameVFXManager=class{};globalThis.GameVFXRenderers={};globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.document={hidden:false,createElement(){const n={style:{},dataset:{},isConnected:true,setAttribute(){},remove(){this.isConnected=false;}};canvases.push(n);return n;},body:{append(){}},querySelector(){return null;},addEventListener(k,fn){events[k]=fn;},removeEventListener(){}};globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.requestAnimationFrame=()=>++frame;globalThis.cancelAnimationFrame=()=>cancelled++;
 const s=qaFixture('battle');s.heroes.lohen.breakdown={type:'panic',failures:0};const a=new CollapseAtmosphere({getState:()=>s,short:()=>short});a.sync();const first=a.canvas;assert.equal(first.dataset.glitch,'true');a.sync();assert.equal(first.isConnected,false);assert.ok(a.canvas.isConnected);assert.equal(canvases.filter(c=>c.isConnected&&c.className==='collapse-atmosphere').length,1);
 s.heroes.lohen.breakdown=null;a.sync();assert.equal(a.canvas,null);s.heroes.durin.breakdown={type:'despair',failures:2};a.sync();document.hidden=true;events.visibilitychange();assert.equal(a.canvas,null);document.hidden=false;events.visibilitychange();assert.ok(a.canvas.isConnected);short=true;a.sync();assert.equal(a.canvas,null);a.destroy();assert.ok(cancelled>=4);
 }finally{for(const key of keys)if(old[key])Object.defineProperty(globalThis,key,old[key]);else delete globalThis[key];}
});

test('supplied originals and pinned Three distribution retain recorded source hashes',()=>{const record=JSON.parse(fs.readFileSync(new URL('../references/supplied/provenance.json',import.meta.url)));for(const [path,hash] of Object.entries(record.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),hash,path);});
