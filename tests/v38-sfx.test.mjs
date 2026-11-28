import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {EVENT_CUES,eventCues,prologueCue} from '../dist/sound-cues.js';import {PROLOGUE} from '../dist/story-scripts.js';
const manifest=JSON.parse(fs.readFileSync(new URL('../dist/assets/audio/sfx/manifest.json',import.meta.url)));
const read=f=>fs.readFileSync(new URL('../dist/'+f,import.meta.url),'utf8');
test('v0.38: every sound key named in code exists in the sfx manifest',()=>{
 const keys=new Set(Object.values(EVENT_CUES).map(c=>c.key));
 for(const f of ['motion.js','app.js'])for(const m of read(f).matchAll(/(?:this\.sound|sounds\.play)\('([a-z_]+)'/g))keys.add(m[1]);
 for(const m of read('motion.js').matchAll(/'(injury_[a-z]+)'/g))keys.add(m[1]);
 for(const k of ['radio_noise','radio_glitch','radio_release','dice_roll','map_open','panel_open','panel_close','enemy_kill_heavy','hero_hit_heavy'])keys.add(k);
 for(const k of keys)assert.ok(manifest.assets[k]?.length,k);
});
test('v0.38: Lumina renders carry their recipe and seed',()=>{
 const lumina=Object.values(manifest.assets).flat().filter(a=>a.source?.startsWith('Lumina SFX'));assert.ok(lumina.length>=10);
 for(const a of lumina)assert.match(a.source,/^Lumina SFX v1\.5 \/ [a-z0-9-]+ \(seed \d+\)$/);
});
test('v0.38: event cues play once per kind and defeat waits for the last hit',()=>{
 const cues=eventCues([{type:'level'},{type:'level'},{type:'gold'},{type:'defeat'},{type:'unknown'}]);
 assert.deepEqual(cues.map(c=>c.key),['spark','gold','defeat']);assert.ok(cues.find(c=>c.key==='defeat').delay>0);
});
test('v0.38: the Dodoco radio uses the supplied recordings only',()=>{
 const cues=PROLOGUE.map((_,i)=>prologueCue(PROLOGUE,i)?.key).filter(Boolean);
 assert.deepEqual(cues,['radio_glitch','radio_noise','radio_release']);
 for(const k of ['radio_glitch','radio_noise','radio_release'])for(const a of manifest.assets[k])assert.match(a.source,/도도통신기/);
});
test('v0.38: synthetic beep and pitch-sweep cues are gone and stay gone',async()=>{
 const {OWNER_SOUNDS}=await import('../dist/sound.js');
 for(const l of Object.values(OWNER_SOUNDS))for(const k of l)assert.ok(manifest.assets[k]?.length,k);
 const banned=['radio_connect','enemy_fade','battle_start','enemy_turn','stress_rise','arc_snap','frost_shard','recruit','awaken','dice_hit'];
 for(const k of banned)assert.equal(manifest.assets[k],undefined,k);
 const code=read('motion.js')+read('app.js')+read('sound-cues.js');for(const k of banned)assert.doesNotMatch(code,new RegExp(`(?:sound|play)\\('${k}'|key:'${k}'`),k);
 const lumina=Object.values(manifest.assets).flat().filter(a=>a.source?.startsWith('Lumina SFX'));
 const SYNTH=/chime|beep|pulse|anomaly|sweep|scan|signal|carrier|relay|shield-collapse|energy|mana|dissolve|cinematic|arc-snap|crystal|quest|checkpoint|highlight/;
 for(const a of lumina)assert.doesNotMatch(a.source,SYNTH,a.source);
});
test('v0.38: every enemy look has a recorded attack cue that matches its creature',async()=>{
 const {ENEMY_ATTACK_SOUNDS,ENEMY_CHARGE_SOUNDS,enemyActionSound}=await import('../dist/sound.js');const {ENEMY_LOOKS}=await import('../dist/enemy-looks.js');
 for(const look of Object.keys(ENEMY_LOOKS)){const k=ENEMY_ATTACK_SOUNDS[look];assert.ok(k,look);assert.ok(manifest.assets[k]?.length,k);}
 for(const k of Object.values(ENEMY_CHARGE_SOUNDS))assert.ok(manifest.assets[k]?.length,k);
 assert.equal(enemyActionSound('abyss-mantis','abyss',true),'enemy_blade');assert.equal(enemyActionSound('sky-tome','celestial',false),'enemy_cloth');assert.equal(enemyActionSound('cherubim','celestial',false),'cherubim_attack');
 for(const k of new Set(Object.values(ENEMY_ATTACK_SOUNDS)))if(k!=='cherubim_attack')for(const a of manifest.assets[k])assert.match(a.source,/^Lumina SFX/);
});
