import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newCampaign} from '../dist/engine.js';
import {qaFixture} from '../dist/qa-fixtures.js';
import {settingsMarkup} from '../dist/menu-ui.js';
const dist=f=>readFileSync(new URL(`../dist/${f}`,import.meta.url),'utf8');

test('tutorial is skipped after it is done and comes back when replay is requested',()=>{
 const prev=qaFixture('base');prev.collection.tutorialDone=true;
 assert.ok(!newCampaign(prev,7).tutorial?.active);
 prev.collection.tutorialDone=false;
 const s=newCampaign(prev,7);assert.equal(s.tutorial?.active,true);
 assert.ok(settingsMarkup({volume:1,music:1,sfx:1,fast:false,shake:true,glow:1},'save').includes('data-action="replay-tutorial"'));
 assert.ok(dist('app.js').includes("case'replay-tutorial':state.collection.tutorialDone=false;save();"));
});

test('shop, raid and save data use the v0.29 layouts',()=>{
 const app=dist('app.js');
 for(const marker of ['class="shop-capsule','data-action="shop-item"','class="shop-hero','raid-slot','class="raid-save','raid-go','class="save-slot','data-action="save-select"','class="save-detail'])assert.ok(app.includes(marker),marker);
 const css=dist('feedback-v28.css');
 for(const sel of ['.shop-capsule','.raid-team','.save-columns','surface-headerless'])assert.ok(css.includes(sel),sel);
});

test('primary buttons are dark with a brass edge rather than a gold fill',()=>{
 const css=dist('feedback-v28.css'),last=css.lastIndexOf('button.primary{');
 assert.ok(last>0);const rule=css.slice(last,css.indexOf('}',css.indexOf('!important}',last)));
 assert.ok(rule.includes('#1a160f')&&rule.includes('border:1px solid #d8bd85'));
});
