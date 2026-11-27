import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {CAST_VFX,shieldEffect,suppliedEffect,hasPartyCollapse,blindnessTransitions,CollapseAtmosphere} from '../dist/supplied-vfx.js';
import {galleryItems,ALLIES} from '../dist/archive-ui.js';
import {surfaceMarkup} from '../dist/menu-ui.js';
import {qaFixture,qaApplyCondition} from '../dist/qa-fixtures.js';
import {FACES,VERTS,faceRotation,rollPose,rollHeight,impactTimes,ROLL_MS,FAST_MS} from '../dist/dice.js';
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
const apply=(m,v)=>m.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]),near=(a,b)=>a.every((x,i)=>Math.abs(x-b[i])<1e-9);
test('the library-free d20 has twenty numbered faces, opposite faces sum to 21, and every face can stand upright toward the viewer',()=>{
 assert.equal(VERTS.length,12);assert.deepEqual(FACES.map(f=>f.value),Array.from({length:20},(_,i)=>i+1));
 for(const f of FACES){const back=FACES.find(o=>o.normal.every((x,i)=>Math.abs(x+f.normal[i])<1e-9));assert.equal(f.value+back.value,21);
  const m=faceRotation(f.value);assert.ok(near(apply(m,f.normal),[0,0,1]),'normal '+f.value);assert.ok(near(apply(m,f.up),[0,1,0]));assert.ok(near(apply(m,f.right),[1,0,0]));
  const det=m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);assert.ok(Math.abs(det-1)<1e-9);}
});
test('the d20 roll is thrown, bounces twice, slows, then clicks onto the committed face within a second',()=>{
 assert.ok(ROLL_MS<=1000);assert.ok(FAST_MS<ROLL_MS/3);const hits=impactTimes();assert.equal(hits.length,3);
 assert.equal(rollHeight(0),1);for(const t of hits)assert.ok(rollHeight(t)<1e-9);assert.ok(rollHeight((hits[0]+hits[1])/2)>.3);assert.ok(rollHeight((hits[1]+hits[2])/2)>.1&&rollHeight((hits[1]+hits[2])/2)<rollHeight((hits[0]+hits[1])/2));assert.equal(rollHeight(.95),0);
 for(let value=1;value<=20;value++){const end=rollPose(1,value),f=FACES[value-1];assert.ok(near(apply(end.rotation,f.normal),[0,0,1]),'front '+value);assert.ok(near(apply(end.rotation,f.up),[0,1,0]));assert.equal(end.height,0);assert.ok(Math.abs(end.x)<1e-9);assert.ok(end.done);
  const rest=rollPose(.86,value),tilt=Math.acos(Math.min(1,apply(rest.rotation,f.normal)[2]));assert.ok(tilt>.1&&tilt<.4,'the face rests a little off before the click');
  const start=rollPose(0,value);assert.ok(start.x<-.5&&start.height===1);}
 const turn=(a,b)=>{const m=rollPose(a,7).rotation,n=rollPose(b,7).rotation;return Math.acos(Math.max(-1,Math.min(1,(m[0][0]*n[0][0]+m[0][1]*n[0][1]+m[0][2]*n[0][2]+m[1][0]*n[1][0]+m[1][1]*n[1][1]+m[1][2]*n[1][2]+m[2][0]*n[2][0]+m[2][1]*n[2][1]+m[2][2]*n[2][2]-1)/2)));};
 assert.ok(turn(.05,.1)>turn(.6,.65)&&turn(.6,.65)>turn(.8,.85),'spin slows down');
});
test('the game no longer ships a 3D library for the dice',()=>{
 assert.ok(!fs.existsSync(new URL('../dist/vendor/three-r128.min.js',import.meta.url)));assert.ok(!fs.existsSync(new URL('../dist/vendor/polyhedral-dice.js',import.meta.url)));
 const src=fs.readFileSync(new URL('../dist/dice.js',import.meta.url),'utf8');assert.ok(!/import\s/.test(src));assert.ok(src.length<12000);
});
test('atmosphere keeps a single canvas, stops when the last party collapse clears, and resumes after visibility',()=>{
 const keys=['document','window','innerWidth','innerHeight','requestAnimationFrame','cancelAnimationFrame','GameVFXManager','GameVFXRenderers'];const old=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));const events={},canvases=[];let frame=0,cancelled=0,short=false;
 try{globalThis.GameVFXManager=class{};globalThis.GameVFXRenderers={};globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.document={hidden:false,createElement(){const n={style:{},dataset:{},isConnected:true,setAttribute(){},remove(){this.isConnected=false;}};canvases.push(n);return n;},body:{append(){}},querySelector(){return null;},addEventListener(k,fn){events[k]=fn;},removeEventListener(){}};globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.requestAnimationFrame=()=>++frame;globalThis.cancelAnimationFrame=()=>cancelled++;
 const s=qaFixture('battle');s.heroes.lohen.breakdown={type:'panic',failures:0};const a=new CollapseAtmosphere({getState:()=>s,short:()=>short});a.sync();const first=a.canvas;assert.equal(first.dataset.glitch,'true');a.sync();assert.equal(first.isConnected,false);assert.ok(a.canvas.isConnected);assert.equal(canvases.filter(c=>c.isConnected&&c.className==='collapse-atmosphere').length,1);
 s.heroes.lohen.breakdown=null;a.sync();assert.equal(a.canvas,null);s.heroes.durin.breakdown={type:'despair',failures:2};a.sync();document.hidden=true;events.visibilitychange();assert.equal(a.canvas,null);document.hidden=false;events.visibilitychange();assert.ok(a.canvas.isConnected);short=true;a.sync();assert.equal(a.canvas,null);a.destroy();assert.ok(cancelled>=4);
 }finally{for(const key of keys)if(old[key])Object.defineProperty(globalThis,key,old[key]);else delete globalThis[key];}
});

test('supplied originals retain recorded source hashes',()=>{const record=JSON.parse(fs.readFileSync(new URL('../references/supplied/provenance.json',import.meta.url)));for(const [path,hash] of Object.entries(record.files))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(new URL('../'+path,import.meta.url))).digest('hex'),hash,path);});
