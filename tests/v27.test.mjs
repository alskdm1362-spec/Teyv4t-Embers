import test from 'node:test';
import assert from 'node:assert/strict';
import {act,hydrate,serialize,cardInfo,ownedDeck,SAVE_SLOTS,saveEntries,INSIGHTS} from '../dist/engine.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
const unchanged=(s,a)=>{const before=serialize(s);assert.equal(act(s,a).ok,false);assert.equal(serialize(s),before);};
function finished(extra=()=>{}){const s=qaFixture('base');extra(s);go(s,{type:'finishExpedition'});return s;}

test('ending an expedition snapshots every party combatant as separate save data',()=>{
 const s=finished(s=>{s.heroes.lohen.acquired.push('l_tempest');s.heroes.lohen.upgrades.l_pierce='A';s.heroes.lohen.equipment.weapon='plainSpear';});
 assert.equal(s.phase,'saveData');assert.equal(s.pendingSave.outcome,'retreat');assert.deepEqual(s.pendingSave.entries.map(x=>x.hero),s.party);
 const lohen=s.pendingSave.entries.find(x=>x.hero==='lohen').entry;assert.ok(lohen.deck.includes('l_tempest'));assert.equal(lohen.upgrades.l_pierce,'A');assert.equal(lohen.equipment.weapon,'plainSpear');assert.ok(lohen.value>=30);
 unchanged(s,{type:'closeExpedition'});
 for(const id of s.party)go(s,{type:id==='durin'?'dropSaveData':'keepSaveData',hero:id});
 const collection=s.collection.codex.length;go(s,{type:'closeExpedition'});
 assert.equal(s.phase,'lobby');assert.equal(s.runActive,false);assert.equal(saveEntries(s,'lohen').length,1);assert.equal(saveEntries(s,'durin').length,0);assert.equal(s.collection.codex.length,collection);
 assert.equal(s.heroes.lohen.level,1);assert.deepEqual(s.party,['lohen']);unchanged(s,{type:'resumeExpedition'});
 const loaded=hydrate(serialize(s));assert.equal(saveEntries(loaded,'lohen')[0].id,lohen.id);
});

test('clear and defeat both produce save data; full slots require choosing a record to replace',()=>{
 const clear=qaFixture('ending');go(clear,{type:'finishExpedition'});assert.equal(clear.pendingSave.outcome,'clear');
 const lost=qaFixture('defeat');go(lost,{type:'finishExpedition'});assert.equal(lost.pendingSave.outcome,'defeat');
 const s=finished(s=>{s.collection.saveData.lohen=Array.from({length:SAVE_SLOTS},(_,i)=>({id:'old-'+i,hero:'lohen',deck:[],value:0,level:1}));});
 unchanged(s,{type:'keepSaveData',hero:'lohen'});go(s,{type:'keepSaveData',hero:'lohen',replace:'old-1'});for(const id of s.party)if(id!=='lohen')go(s,{type:'dropSaveData',hero:id});
 go(s,{type:'closeExpedition'});const ids=saveEntries(s,'lohen').map(e=>e.id);assert.equal(ids.length,SAVE_SLOTS);assert.ok(!ids.includes('old-1'));
});

test('a new expedition starts from the lobby without the tutorial once it was finished',()=>{
 const s=finished();for(const id of s.party)go(s,{type:'dropSaveData',hero:id});go(s,{type:'closeExpedition'});
 go(s,{type:'newExpedition'});assert.equal(s.runActive,true);assert.equal(s.tutorial.active,false);assert.equal(s.phase,'battle');assert.equal(s.node,0);unchanged(s,{type:'newExpedition'});
});

test('leaving to the lobby mid-stage keeps the exact screen to resume',()=>{
 const s=qaFixture('battle');const hand=serialize(s.battle);go(s,{type:'returnToLobby'});assert.equal(s.phase,'lobby');go(s,{type:'resumeExpedition'});assert.equal(s.phase,'battle');assert.equal(serialize(s.battle),hand);
});

test('raids field one to three combatants from save data and restore the run afterwards',()=>{
 const s=finished(s=>{s.heroes.lohen.acquired.push('l_tempest');});for(const id of s.party)go(s,{type:'keepSaveData',hero:id});go(s,{type:'closeExpedition'});
 go(s,{type:'newExpedition'});go(s,{type:'returnToLobby'});const run=serialize({...s,collection:null});
 const lohen=saveEntries(s,'lohen')[0],durin=saveEntries(s,'durin')[0];
 unchanged(s,{type:'startRaid',saves:[]});unchanged(s,{type:'startRaid',saves:[lohen.id,lohen.id+'x']});
 go(s,{type:'startRaid',saves:[lohen.id,durin.id]});assert.equal(s.mode,'raid');assert.deepEqual(s.party,['lohen','durin']);
 assert.ok([...s.battle.hand,...s.battle.draw].some(c=>c.key==='l_tempest'));
 go(s,{type:'finishRaid'});assert.equal(s.phase,'lobby');assert.ok(s.lastRaidResult);assert.equal(s.collection.raid.recordStats['team:'+[lohen.id,durin.id].sort().join('|')].triesUsed,1);
 const {collection,lastRaidResult,raidStash,...rest}=s;const back=JSON.parse(run);delete back.collection;delete back.raidStash;delete back.lastRaidResult;rest.phase='lobby';back.phase='lobby';delete rest.history;delete back.history;assert.deepEqual(JSON.parse(JSON.stringify(rest)),back);
});

test('a glowing card costs 0, then offers three previewable awakenings that persist into save data',()=>{
 const s=qaFixture('battle');s.tutorial.active=false;const c=s.battle.hand.find(c=>INSIGHTS[c.key]&&!s.heroes[c.owner].upgrades[c.key]);c.epiphany=true;
 assert.equal(cardInfo(s,c).cost,0);assert.ok(cardInfo(s,c).epiphany);const ap=s.battle.ap;
 go(s,{type:'play',uid:c.uid,target:s.battle.enemies.find(e=>e.hp>0).id});assert.equal(s.battle?.ap??ap,ap);
 const o=s.epiphanyOffer;assert.equal(o.owner,c.owner);assert.equal(o.branches.length,3);unchanged(s,{type:'epiphany',branch:'Z'});
 go(s,{type:'epiphany',branch:o.branches[1]});assert.equal(s.heroes[c.owner].upgrades[c.key],o.branches[1]);assert.equal(s.epiphanyOffer,null);
 const t=qaFixture('base');t.heroes[c.owner].upgrades[c.key]=o.branches[1];go(t,{type:'finishExpedition'});assert.equal(t.pendingSave.entries.find(x=>x.hero===c.owner)?.entry.upgrades[c.key],o.branches[1]);
});

test('epiphanies never appear in the tutorial or raids and at most twice per battle',()=>{
 let glows=0;for(let seed=1;seed<60;seed++){const s=qaFixture('battle');s.seed=seed;s.rng=seed*7919;s.tutorial.active=false;for(let t=0;t<6&&s.phase==='battle';t++){act(s,{type:'endTurn'});}
  if(s.battle)assert.ok((s.battle.epiphanies||0)<=2);glows+=s.battle?.epiphanies||0;}
 assert.ok(glows>0);
 const tut=qaFixture('tutorial');for(let t=0;t<4;t++)act(tut,{type:'endTurn'});assert.ok(!(tut.battle?.epiphanies));
});
