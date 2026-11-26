import test from 'node:test';
import assert from 'node:assert/strict';
import {sceneLayout} from '../dist/viewport-layout.js';
import {qaFixture} from '../dist/qa-fixtures.js';
import {act,serialize,hydrate} from '../dist/engine.js';
test('lobby keeps the entire 16:9 canvas within each supported viewport with uniform scale',()=>{
 for(const [w,h] of [[1280,720],[1920,1080],[844,390],[640,360],[390,740]]){const l=sceneLayout(w,h,'lobby');assert.equal(l.width/l.height,16/9);assert.ok(l.width*l.scale<=w+1e-6);assert.ok(l.height*l.scale<=h+1e-6);assert.ok(Math.abs(Math.min(w-l.width*l.scale,h-l.height*l.scale))<1e-6);}
});
test('return from lobby preserves the saved expedition and resizing does not mutate it',()=>{
 const s=qaFixture('lobby'),bytes=serialize(s);assert.equal(s.phase,'lobby');for(const [w,h] of [[1280,720],[844,390],[390,740]])sceneLayout(w,h,s.phase);assert.equal(serialize(s),bytes);const loaded=hydrate(bytes),r=act(loaded,{type:'resumeExpedition'});assert.ok(r.ok,r.error);assert.equal(loaded.phase,'base');assert.equal(loaded.hp,s.hp);assert.deepEqual(loaded.party,s.party);
});
