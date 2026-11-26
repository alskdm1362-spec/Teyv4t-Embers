import test from 'node:test';
import assert from 'node:assert/strict';
import {surfaceMarkup} from '../dist/menu-ui.js';
import {sceneLayout} from '../dist/viewport-layout.js';
import {intersectBounds} from '../dist/visual-bounds.js';
test('only menu and route reserve a visible title; all surfaces retain accessible names and a close action',()=>{
 for(const kind of ['pause-menu','route','status','lobby-personnel','settings','care-select','care-dialogue','shop','formation','codex']){const html=surfaceMarkup('화면 이름','<p>내용</p>',kind);assert.ok(html.includes('aria-label="화면 이름"'));assert.ok(html.includes('data-action="close"'));assert.equal(html.includes('<h2>화면 이름</h2>'),['pause-menu','route'].includes(kind));assert.ok(html.includes('class="surface-content"'));}
 const media=surfaceMarkup('원본','<img alt="원본">','media-viewer');assert.ok(!media.includes('surface-content'));assert.ok(!media.includes('modern-surface'));
});
test('battle fits remain uniform and full viewport story scenes do not inherit lobby dimensions',()=>{
 for(const [w,h] of [[1280,720],[844,390],[640,360],[390,740]]){const b=sceneLayout(w,h,'battle');assert.ok(b.width*b.scale<=w+1e-6);assert.ok(Math.abs(b.height*b.scale-h)<1e-6);const story=sceneLayout(w,h,'joinDialogue');assert.deepEqual(story,{width:w,height:h,scale:1});}
});
test('collapse aura clips to visible card-list bounds without bleeding into the roster',()=>{
 const list={left:100,top:200,right:400,bottom:500};assert.equal(intersectBounds({left:120,top:510,right:300,bottom:710},list),null);assert.deepEqual(intersectBounds({left:120,top:450,right:300,bottom:650},list),{left:120,top:450,right:300,bottom:500,width:180,height:50});
});
