import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {ATTACK_SOUNDS,gainFromSlider} from '../dist/sound.js';import {CameraFeedback} from '../dist/feedback.js';
const manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/audio/sfx/manifest.json',import.meta.url)));
test('every attack cue resolves to real nonclipping PCM assets, with distinct textures',()=>{
 const seen=new Set();for(const keys of Object.values(ATTACK_SOUNDS))for(const key of keys)assert.ok(manifest.assets[key],key);
 for(const list of Object.values(manifest.assets))for(const a of list){const wav=fs.readFileSync(new URL('../dist/'+a.src,import.meta.url));assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt16LE(22),1);assert.equal(wav.readUInt32LE(24),24000);assert.equal(wav.readUInt16LE(34),16);const samples=[];for(let i=44;i<wav.length;i+=2)samples.push(wav.readInt16LE(i)/32768);assert.ok(Math.max(...samples.map(Math.abs))<.71);assert.equal(samples[0],0);assert.equal(samples.at(-1),0);assert.ok(a.duration>0&&a.duration<=1);assert.ok(!seen.has(a.sha256));seen.add(a.sha256);}
 assert.ok(seen.size>=20);assert.equal(gainFromSlider(0),0);assert.equal(gainFromSlider(1),1);assert.equal(gainFromSlider(.5),.25);
});
test('camera impulse stays small, settles to neutral and respects disabled motion',()=>{
 const keys=['document','requestAnimationFrame','cancelAnimationFrame'],old=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));let tick,enabled=true;const values={},field={isConnected:true,style:{}},game={style:{getPropertyValue(){return '1';},setProperty(k,v){values[k]=v;}},dataset:{}};
 try{globalThis.document={querySelector(s){return s==='.battle-field'?field:game;}};globalThis.requestAnimationFrame=f=>{tick=f;return 1;};globalThis.cancelAnimationFrame=()=>{};const camera=new CameraFeedback({enabled:()=>enabled});camera.hit(2);const start=camera.start;tick(start+30);const xy=[...field.style.transform.matchAll(/(-?[\d.]+)px/g)].map(m=>Number(m[1]));assert.ok(xy.every(x=>Math.abs(x)<=3.6));tick(start+300);assert.equal(field.style.transform,'');assert.equal(game.dataset.shake,'idle');assert.equal(values['--camera-x'],'0px');enabled=false;camera.hit(2);assert.equal(camera.frame,0);}finally{for(const k of keys)if(old[k])Object.defineProperty(globalThis,k,old[k]);else delete globalThis[k];}
});
