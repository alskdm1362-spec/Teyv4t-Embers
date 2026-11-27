import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,act,serialize,hydrate} from '../dist/engine.js';
import {SEED_ALPHABET,SEED_PREFIX,randomSeed,normalizeSeed,isSeed,seedNumber,expeditionSeed} from '../dist/seed.js';
import {SAVE_APP,SAVE_FORMAT,SAVE_REASONS,CODE_PLAIN,CODE_PACKED,packSave,saveSummary,saveFileText,saveFileName,saveCode,parseSave,saveStore,formatSavedAt} from '../dist/save-seed.js';
import {qaFixture} from '../dist/qa-fixtures.js';

const go=(s,a)=>{const r=act(s,a);assert.equal(r.ok,true,r.error);return r;};
function memory(initial={}){const m=new Map(Object.entries(initial));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},key:i=>[...m.keys()][i]??null,get length(){return m.size;},map:m};}
function lobby(seed='EMBR-TEST'){const s=createGame(5,{tutorial:false});s.collection.tutorialDone=true;s.collection.seed=seed;go(s,{type:'newGame',seed:5});return s;}

test('v0.36 stage 7: seeds read EMBR-XXXX and leave out the letters that are easy to confuse',()=>{
 assert.equal(SEED_ALPHABET.length,32);for(const c of 'IO01')assert.ok(!SEED_ALPHABET.includes(c));
 let n=0;const rnd=()=>((n=(n*9301+49297)%233280)/233280);for(let i=0;i<200;i++){const seed=randomSeed(rnd);assert.match(seed,/^EMBR-[A-HJ-NP-Z2-9]{4}$/);assert.ok(isSeed(seed));}
 assert.equal(randomSeed(()=>.999999),'EMBR-9999');assert.equal(randomSeed(()=>0),'EMBR-AAAA');
 assert.equal(normalizeSeed(''),'');assert.equal(normalizeSeed('   '),'');assert.equal(normalizeSeed('embr-k7qw'),'EMBR-K7QW');assert.equal(normalizeSeed(' k7qw '),'EMBR-K7QW');assert.equal(normalizeSeed('EMBR K7QW'),'EMBR-K7QW');assert.equal(normalizeSeed('embrk7qw'),'EMBR-K7QW');
 for(const bad of ['EMBR-K7Q','EMBR-K7QWX','EMBR-O0I1','K7Q!','한글시드'])assert.equal(normalizeSeed(bad),null,bad);
 assert.equal(isSeed('embr-k7qw'),false);assert.equal(isSeed(null),false);
});

test('v0.36 stage 7: expedition randomness is the seed plus the run count',()=>{
 assert.equal(seedNumber('EMBR-K7QW'),seedNumber('EMBR-K7QW'));assert.notEqual(seedNumber('EMBR-K7QW'),seedNumber('EMBR-K7QX'));
 const a=expeditionSeed('EMBR-K7QW',1),b=expeditionSeed('EMBR-K7QW',2);assert.notEqual(a,b);assert.equal(a,expeditionSeed('EMBR-K7QW',1));assert.ok(Number.isInteger(a)&&a>=0&&a<2**32);
 const run=seed=>{const s=lobby(seed);go(s,{type:'newExpedition',party:['lohen','durin','illuga']});return s;};
 const one=run('EMBR-K7QW'),same=run('EMBR-K7QW'),other=run('EMBR-ABCD');
 assert.equal(one.seed,expeditionSeed('EMBR-K7QW',1));assert.equal(one.collection.runs,1);assert.equal(serialize(one.map),serialize(same.map));assert.equal(serialize(one.battle),serialize(same.battle));assert.notEqual(serialize(one.map),serialize(other.map));
 // the next expedition of the same save is a different, but again reproducible, road
 const finish=s=>{go(s,{type:'returnToLobby'});go(s,{type:'finishExpedition'});for(const id of s.party)go(s,{type:'dropSaveData',hero:id});go(s,{type:'closeExpedition'});};
 finish(one);finish(same);go(one,{type:'newExpedition',party:['lohen','durin','illuga']});go(same,{type:'newExpedition',party:['lohen','durin','illuga']});
 assert.equal(one.collection.runs,2);assert.equal(one.seed,expeditionSeed('EMBR-K7QW',2));assert.equal(serialize(one.map),serialize(same.map));assert.equal(one.collection.seed,'EMBR-K7QW');
});

test('v0.36 stage 7: clears are counted once per expedition and survive a save round trip',()=>{
 const s=qaFixture('ending');assert.equal(s.collection.clears,1);const again=hydrate(serialize(s));assert.equal(again.collection.clears,1);
 // the real road: the last challenge fight ends the expedition and counts one clear, a second ending in the same run does not
 const run=qaFixture('boss');run.collection.clears=0;run.collection.endings=[];run.claimedEnding=false;run.mode='challenge';run.challengeStage=2;for(const e of run.battle.enemies)e.hp=1;run.battle.ap=9;
 for(let i=0;i<40&&run.phase==='battle';i++){const c=run.battle.hand.find(c=>c.owner==='lohen'&&/strike|pierce/.test(c.key))||{uid:'x',owner:'lohen',key:'l_pierce'};if(!run.battle.hand.includes(c))run.battle.hand.push(c);run.battle.ap=9;go(run,{type:'play',uid:c.uid,target:run.battle.enemies.find(e=>e.hp>0).id});}
 if(run.phase==='reward')go(run,{type:'advance'});assert.equal(run.phase,'ending');assert.equal(run.collection.clears,1);
 const old=JSON.parse(serialize(qaFixture('base')));delete old.collection.clears;delete old.collection.runs;delete old.collection.seed;const h=hydrate(old);assert.equal(h.collection.clears,0);assert.equal(h.collection.runs,1);assert.equal(h.collection.seed,null);
 const junk=JSON.parse(serialize(qaFixture('base')));junk.collection.seed='not a seed';assert.equal(hydrate(junk).collection.seed,null);
});

test('v0.36 stage 7: a save file carries a format version, the seed, the collection, the run and the settings',async()=>{
 const s=qaFixture('battle');s.collection.seed='EMBR-K7QW';s.collection.clears=2;s.collection.runs=5;
 const env=packSave(s,{prefs:{volume:.3,fast:true},savedAt:'2026-11-28T03:04:05.000Z'});
 assert.equal(env.app,SAVE_APP);assert.equal(env.format,SAVE_FORMAT);assert.equal(env.seed,'EMBR-K7QW');assert.equal(env.clears,2);assert.equal(env.runs,5);assert.deepEqual(env.prefs,{volume:.3,fast:true});assert.equal(env.state.phase,'battle');assert.ok(env.state.collection&&env.state.battle);
 assert.equal(saveFileName(env),'EMBR-K7QW.embers');
 const back=await parseSave(saveFileText(env));assert.equal(back.ok,true);assert.equal(back.legacy,false);assert.equal(back.envelope.seed,'EMBR-K7QW');assert.equal(serialize(back.envelope.state),serialize(hydrate(serialize(s))));assert.deepEqual(back.envelope.prefs,{volume:.3,fast:true});assert.equal(back.envelope.savedAt,'2026-11-28T03:04:05.000Z');
 const sum=saveSummary(back.envelope);assert.equal(sum.seed,'EMBR-K7QW');assert.equal(sum.clears,2);assert.equal(sum.active,true);assert.ok(sum.place);assert.deepEqual(sum.party,['로엔','두린','일루가']);
 assert.match(formatSavedAt('2026-11-28T03:04:05.000Z'),/^2026-11-2\d \d\d:\d\d$/);assert.equal(formatSavedAt(''),'기록 없음');
});

test('v0.36 stage 7: the copyable code holds the same save, packed when the platform can, and notices damage',async()=>{
 const s=qaFixture('base');s.collection.seed='EMBR-K7QW';const env=packSave(s,{prefs:{volume:.5},savedAt:'2026-11-28T00:00:00.000Z'});
 const code=await saveCode(env);assert.ok(code.startsWith(CODE_PACKED)||code.startsWith(CODE_PLAIN));assert.match(code,/^EMBR[12]:[a-z0-9]+:[A-Za-z0-9_-]+$/);assert.ok(code.length<saveFileText(env).length,'packed code is shorter than the file');
 const back=await parseSave('  '+code.slice(0,40)+'\n'+code.slice(40)+'  ');assert.equal(back.ok,true);assert.equal(serialize(back.envelope.state),serialize(hydrate(serialize(s))));
 const cut=await parseSave(code.slice(0,-12));assert.deepEqual(cut,{ok:false,reason:SAVE_REASONS.code});
 const i=code.length-20,flipped=code.slice(0,i)+(code[i]==='A'?'B':'A')+code.slice(i+1);assert.equal((await parseSave(flipped)).ok,false);
 // without compression the plain form is used and read back
 const C=globalThis.CompressionStream;globalThis.CompressionStream=undefined;try{const plain=await saveCode(env);assert.ok(plain.startsWith(CODE_PLAIN));const p=await parseSave(plain);assert.equal(p.ok,true);assert.equal(p.envelope.seed,'EMBR-K7QW');}finally{globalThis.CompressionStream=C;}
});

test('v0.36 stage 7: unreadable or foreign files are refused with a reason and nothing is changed',async()=>{
 const s=qaFixture('base');s.collection.seed='EMBR-K7QW';const good=packSave(s);
 const reason=async x=>{const r=await parseSave(x);assert.equal(r.ok,false);assert.equal(r.envelope,undefined);return r.reason;};
 assert.equal(await reason(''),SAVE_REASONS.empty);assert.equal(await reason('{"half":'),SAVE_REASONS.broken);assert.equal(await reason('[1,2]'),SAVE_REASONS.foreign);assert.equal(await reason('{"app":"other","format":1}'),SAVE_REASONS.foreign);
 assert.equal(await reason(JSON.stringify({...good,format:SAVE_FORMAT+1})),SAVE_REASONS.newer);assert.equal(await reason(JSON.stringify({...good,format:'1'})),SAVE_REASONS.broken);
 assert.equal(await reason(JSON.stringify({...good,state:{version:3}})),SAVE_REASONS.state);assert.equal(await reason(JSON.stringify({...good,seed:'EMBR-O0O0'})),SAVE_REASONS.seed);
 assert.equal(await reason('EMBR1:zz:not base64!'),SAVE_REASONS.code);
 const noSeed=await parseSave(JSON.stringify({...good,seed:null}));assert.equal(noSeed.ok,true);assert.equal(noSeed.envelope.seed,null);
});

test('v0.36 stage 7: exports from before the seed system still load',async()=>{
 const s=qaFixture('base'),raw=JSON.parse(serialize(s));delete raw.collection.seed;delete raw.collection.runs;delete raw.collection.clears;
 const r=await parseSave(JSON.stringify(raw));assert.equal(r.ok,true);assert.equal(r.legacy,true);assert.equal(r.envelope.seed,null);assert.equal(r.envelope.format,SAVE_FORMAT);assert.deepEqual(r.envelope.state.party,s.party);
});

test('v0.36 stage 7: every seed has its own slot on the device, and the old single slot is moved once',()=>{
 const storage=memory(),store=saveStore(storage,'t');assert.equal(store.last(),null);assert.deepEqual(store.seeds(),[]);
 const a=qaFixture('base');a.collection.seed='EMBR-AAAA';const b=qaFixture('battle');b.collection.seed='EMBR-BBBB';
 store.write(packSave(a));store.write(packSave(b));assert.equal(store.last(),'EMBR-BBBB');assert.deepEqual(store.seeds(),['EMBR-AAAA','EMBR-BBBB']);assert.ok(store.has('EMBR-AAAA'));assert.ok(!store.has('EMBR-CCCC'));
 assert.equal(store.read('EMBR-AAAA').state.phase,'base');assert.equal(store.read('EMBR-BBBB').state.phase,'battle');assert.equal(store.read('EMBR-CCCC'),null);
 storage.setItem('t-save:EMBR-DDDD','{broken');assert.equal(store.read('EMBR-DDDD'),null);assert.throws(()=>store.write({...packSave(a),seed:'nope'}));
 store.remove('EMBR-BBBB');assert.equal(store.last(),null);assert.ok(!store.has('EMBR-BBBB'));
 // migration from the pre-seed single slot
 const old=memory({'legacy-key':serialize(qaFixture('base'))}),moved=saveStore(old,'t');let k=0;const env=moved.migrate('legacy-key',()=>(k++%32)/32);
 assert.ok(isSeed(env.seed));assert.equal(moved.last(),env.seed);assert.equal(moved.read(env.seed).state.phase,'base');assert.equal(moved.read(env.seed).state.collection.seed,env.seed);assert.ok(old.getItem('legacy-key'),'the old slot is kept');
 assert.equal(moved.migrate('legacy-key'),null,'only once');assert.equal(saveStore(memory(),'t').migrate('legacy-key'),null);assert.equal(saveStore(memory({'legacy-key':'{bad'}),'t').migrate('legacy-key'),null);
});

import fs from 'node:fs';
import {titleChoices,titleScreen} from '../dist/title-screen.js';
import {settingsMarkup,pauseMarkup} from '../dist/menu-ui.js';
const read=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');

test('v0.36 stage 7: the title offers 이어하기 (seed) and 다른 시드로 시작 once a save exists, and can always load a save file',()=>{
 const fresh=titleChoices(null);assert.deepEqual(fresh.map(c=>c.action),['new','continue','import','hub-menu']);assert.equal(fresh[0].label,'원정 시작');assert.equal(fresh[1].enabled,false);assert.equal(fresh[2].label,'저장 파일 불러오기');
 const s=qaFixture('battle');s.collection.seed='EMBR-K7QW';const live=titleChoices(s);assert.deepEqual(live.map(c=>c.action),['continue','new','import','hub-menu']);assert.equal(live[0].seed,'EMBR-K7QW');assert.equal(live[1].label,'다른 시드로 시작');
 const html=titleScreen(s,true);assert.ok(html.includes('이어하기 <small class="title-option-seed">(EMBR-K7QW)</small>'));assert.ok(html.includes('title-menu-four'));
 const waiting=lobby('EMBR-K7QW');assert.match(titleChoices(waiting)[0].hint,/로비/);
});

test('v0.36 stage 7: the menu shows the seed with copy, export, code and import actions',()=>{
 const html=settingsMarkup({volume:.5,music:.8,sfx:1,glow:.85},'save',{seed:'EMBR-K7QW',savedAt:'2026-11-28 03:04',clears:2,runs:5});
 assert.ok(html.includes('<strong data-seed>EMBR-K7QW</strong>'));for(const action of ['copy-seed','export','copy-code','import','import-text'])assert.ok(html.includes(`data-action="${action}"`),action);assert.ok(html.includes('클리어 2회 · 원정 5회차'));
 const none=settingsMarkup({volume:.5,music:.8,sfx:1,glow:.85},'save',{});assert.ok(none.includes('아직 없음'));assert.ok(none.includes('data-action="export" disabled'));assert.ok(!none.includes('copy-seed'));
 assert.ok(pauseMarkup(qaFixture('base')).includes('data-action="settings-save"'));
});

test('v0.36 stage 7: the app saves per seed after every action and never replaces data before a confirmation',()=>{
 const app=read('app.js');
 assert.ok(app.includes("store.migrate(KEY)"));assert.ok(app.includes("store.write(env)"));assert.ok(!app.includes("localStorage.setItem(KEY,"));
 assert.ok(app.includes("case'new':seedEntry();break;"));assert.ok(app.includes("state=createGame(expeditionSeed(seed,1));state.collection.seed=seed;state.collection.runs=1;"));
 // imports go parse → compare → explicit apply
 assert.ok(app.includes("const r=await parseSave(text);if(!r.ok)"));assert.ok(app.includes("case'import-apply':if(pendingImport)adoptSave(pendingImport,{applyPrefs:true});break;"));assert.equal(app.split('adoptSave(').length-1,3,'definition + takeover + confirmed import');
 assert.ok(app.includes('이 기기의 기록은 그대로입니다.'));assert.ok(app.includes("input.accept='.embers,.json,application/json'"));
});
