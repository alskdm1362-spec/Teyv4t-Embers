import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {celPlan,CEL_PALETTES} from '../dist/cel-vfx.js';
const dist=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('battle effects are hand-drawn cel effects per hero, not pixel art',()=>{
 for(const hero of ['lohen','durin','illuga','jahoda'])for(const ultimate of [false,true]){const plan=celPlan(hero==='durin'?'arcane-wave':hero==='illuga'?'counter':hero==='jahoda'?'feint':'spear',{hero,ultimate});assert.ok(plan?.length,hero+ultimate);}
 assert.equal(celPlan('counter',{hero:'illuga'})[0].fx,'slash');assert.equal(celPlan('counter',{hero:'lohen'}).length,1);
 for(const kind of ['abyss-hit','celestial-hit','abyss-charge','celestial-charge','recover','rally','wind-cleave','night-thrust','venom-mark'])assert.ok(celPlan(kind,{hero:'lohen'}),kind);
 assert.ok(celPlan('guard',{hero:'lohen',shield:true}));assert.equal(celPlan('dissolve',{sprite:false}),null);assert.ok(celPlan('dissolve',{sprite:true}));
 for(const pal of Object.values(CEL_PALETTES))assert.equal(pal.length,4);
 const router=dist('supplied-vfx.js');assert.ok(router.includes("import {CelVFX} from './cel-vfx.js';")&&router.includes('this.cel.play(kind,anchor,options)'));
 assert.ok(!fs.existsSync(new URL('../dist/vendor/pixelfx',import.meta.url)));assert.ok(!/image-rendering|pixelated/.test(dist('cel-vfx.js')));
});
