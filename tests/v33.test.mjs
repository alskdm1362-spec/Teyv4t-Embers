import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {vfxPlan,VFX_COLORS} from '../dist/battle-vfx.js';
import {crackNetwork,COLLAPSE_THEMES} from '../dist/collapse-scene.js';
const dist=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('each combatant and partner has its own natural battle effect (v0.39: 카드마다 다른 모양)',()=>{
 assert.equal(vfxPlan('spear',{hero:'lohen',card:'l_strike'})[0].fx,'iceStab');assert.equal(vfxPlan('spear',{hero:'lohen',card:'l_pierce'})[0].fx,'iceArrow');assert.equal(vfxPlan('spear',{hero:'lohen',card:'l_breach'})[0].fx,'daggerX');assert.equal(vfxPlan('frost-finisher',{hero:'lohen',ultimate:true})[0].fx,'lohenUlt');
 assert.equal(vfxPlan('arcane-wave',{hero:'durin',card:'d_strike'})[0].fx,'fireClaw');assert.equal(vfxPlan('arcane-wave',{hero:'durin',card:'d_comet'})[0].fx,'fireComet');assert.equal(vfxPlan('counter',{hero:'illuga'})[0].fx,'slash');
 assert.equal(vfxPlan('guard',{hero:'illuga',shield:true})[0].fx,'goldDome');assert.equal(vfxPlan('illuga-bird',{})[0].fx,'goldBird');assert.equal(vfxPlan('feint',{hero:'jahoda'})[0].fx,'kick');assert.equal(vfxPlan('spear',{hero:'jahoda',card:'j_dart'})[0].fx,'dart');assert.equal(vfxPlan('jahoda-aura',{})[0].fx,'jahodaAura');
 assert.equal(vfxPlan('spear',{hero:'kinich',card:'k_cannon'})[0].fx,'pixelBeam');assert.equal(vfxPlan('spear',{hero:'lyney',card:'y_show'})[0].fx,'magicPop');assert.equal(vfxPlan('spear',{hero:'cyno',card:'c_claw'})[0].fx,'clawSwing');
 for(const [p,fx] of [['nefer','neferRune'],['lynette','lynetteWind'],['mualani','mualaniBubble'],['kachina','kachinaDrill'],['tighnari','tighnariBloom'],['flins','flinsSpears']])assert.equal(vfxPlan('partner',{partner:p})[0].fx,fx);
 assert.equal(vfxPlan('wind-cleave',{})[0].fx,'greatsword');
 for(const k of ['rally','focus','recover'])assert.equal(vfxPlan(k,{})[0].fx,'sparkle');assert.equal(vfxPlan('rally',{hero:'jahoda',card:'j_energy'})[0].fx,'clockwork');
 assert.equal(vfxPlan('victory',{})[0].fx,'victory');assert.equal(vfxPlan('flame-heal',{})[0].fx,'flameOrbit');
 const router=dist('supplied-vfx.js');assert.ok(router.includes("import {BattleVFX} from './battle-vfx.js';"));
 assert.ok(!fs.existsSync(new URL('../dist/cel-vfx.js',import.meta.url)));
});

test('each breakdown has a themed backdrop; despair glass cracks into a closed set of shards',()=>{
 const n=crackNetwork(1280,720,{seed:3,radials:14,rings:4});
 assert.equal(n.radialPaths.length,14);assert.ok(n.shards.length>=14*5);
 for(const s of n.shards){assert.ok(s.poly.length>=3);assert.ok(s.d>=0&&s.d<=1.2);}
 assert.ok(dist('app.js').includes("collapseScene(shade.querySelector('.unframed-cutin')"));for(const t of ['despair','panic','frenzy','distrust'])assert.ok(COLLAPSE_THEMES[t],t);
});

test('v0.34: collapse cards glow in CSS, sprites share one scale everywhere, dash divides out the sprite scale',()=>{
 const css=dist('feedback-v28.css');assert.ok(css.includes('.card-frame.broken:after{inset:0;'));assert.ok(css.includes('.fighter .sprite{scale:var(--sprite-scale,1)'));
 const atm=dist('supplied-vfx.js');assert.ok(!atm.includes('cardOminousAura(c'));assert.ok(atm.includes('if(now-this.last<40)'));
 assert.ok(dist('motion.js').includes('dx=Math.max(36,(b.x-a.x)/sc-46)/k'));assert.ok(dist('battle-vfx.js').includes('function flameSprite('));
});
