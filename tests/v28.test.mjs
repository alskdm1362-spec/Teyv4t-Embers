import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sceneLayout,uiScale} from '../dist/viewport-layout.js';
import {pauseMarkup} from '../dist/menu-ui.js';
import {allyRail} from '../dist/archive-ui.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const dist=f=>readFileSync(new URL(`../dist/${f}`,import.meta.url),'utf8');

test('pixel-designed surfaces grow with the viewport only above the 1280×720 design size',()=>{
 for(const [w,h] of [[1280,720],[1277,635],[844,390],[640,360],[390,740]])assert.equal(uiScale(w,h),1);
 assert.ok(Math.abs(uiScale(2554,1270)-1270/720)<1e-9);
 assert.equal(uiScale(2560,1440),2);
});

test('card reward and refinement scenes keep their proportions on large screens',()=>{
 for(const phase of ['cardReward','refine','eventRemove']){
  const big=sceneLayout(2554,1270,phase);assert.ok(big.scale>1);assert.ok(Math.abs(big.width*big.scale-2554)<1e-6);assert.ok(Math.abs(big.height*big.scale-1270)<1e-6);
  assert.deepEqual(sceneLayout(844,390,phase),{width:844,height:390,scale:1});
 }
 assert.deepEqual(sceneLayout(2554,1270,'joinDialogue'),{width:2554,height:1270,scale:1});
});

test('pause menu uses lobby-style tiles and a stage for the party',()=>{
 const html=pauseMarkup(qaFixture('base'));
 for(const action of ['close','settings','settings-save','codex','guide','title'])assert.ok(html.includes(`data-action="${action}" class="menu-tile`),action);
 assert.equal((html.match(/class="tile-icon"/g)||[]).length,6);
 assert.ok(html.includes('menu-stage')&&html.includes('menu-stats'));
 assert.ok(!pauseMarkup({phase:'title'}).includes('menu-stats'));
});

test('codex ally cards carry a role caption and the v0.28 sheet loads last',()=>{
 assert.ok(allyRail().includes('<small>'));
 const index=dist('index.html');assert.ok(index.indexOf('feedback-v28.css')>index.indexOf('feedback-v26.css'));
 const css=dist('feedback-v28.css');
 assert.ok(css.includes('zoom:var(--uk,1)'));assert.ok(css.includes('.in-card-reward #game:before'));assert.ok(css.includes('backdrop-filter'));
 assert.ok(dist('app.js').includes("'in-card-reward':phase==='cardReward'"));
});
