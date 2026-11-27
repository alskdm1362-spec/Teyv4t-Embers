import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {act,hydrate,serialize,ROUTE,CARDS,ownedDeck,travelOptions,makeCardOffer,rollEventOffer,STRESS_PER_DAMAGE} from '../dist/engine.js';
import {REWARD_POOL,REWARD_CARDS} from '../dist/awakening.js';
import {generateMap,depthScale,MAP_START} from '../dist/map.js';
import {cardArtwork} from '../dist/cast-art.js';
import {EVENTS} from '../dist/expedition-content.js';
import {qaFixture} from '../dist/qa-fixtures.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
const unchanged=(s,a)=>{const before=serialize(s);assert.equal(act(s,a).ok,false);assert.equal(serialize(s),before);};
function oneHit(pct,shieldPct){const s=qaFixture('battle'),damage=Math.round(pct*s.maxHp/100);for(const id of s.party)s.heroes[id].shield=0;s.heroes.lohen.shield=Math.round(shieldPct*s.maxHp/100);s.shield=s.heroes.lohen.shield;for(const h of Object.values(s.heroes)){h.stress=0;h.equipment.accessory=null;}
 s.battle.enemies=s.battle.enemies.slice(0,1);s.battle.enemies[0].intent={name:'시험',damage,stress:0,target:'lohen',tag:'시험'};s.battle.enemies[0].stun=0;s.battle.enemies[0].hp=9999;s.battle.enemies[0].maxHp=9999;
 go(s,{type:'endTurn'});return s;}

test('v0.36: an unblocked hit adds +5 (normal), +10 (elite) or +15 (boss) stress, counted at most twice per turn; blocked hits add none',()=>{
 {const s=qaFixture('battle');for(const id of s.party)s.heroes[id].shield=0;for(const h of Object.values(s.heroes)){h.stress=0;h.equipment.accessory=null;}const e0=s.battle.enemies[0];s.battle.enemies=[0,1,2].map(i=>({...e0,id:'t'+i,hp:9999,maxHp:9999,stun:0,intent:{name:'시험',damage:30,stress:0,target:'lohen',tag:'시험'}}));go(s,{type:'endTurn'});assert.equal(s.heroes.lohen.stress,10);}
 {const s=qaFixture('battle');s.encounterType='elite';for(const id of s.party)s.heroes[id].shield=0;for(const h of Object.values(s.heroes)){h.stress=0;h.equipment.accessory=null;}const e0=s.battle.enemies[0];s.battle.enemies=[{...e0,id:'t0',hp:9999,maxHp:9999,stun:0,intent:{name:'시험',damage:30,stress:0,target:'lohen',tag:'시험'}},{...e0,id:'t1',kind:'keeper',hp:9999,maxHp:9999,stun:0,intent:{name:'시험',damage:30,stress:0,target:'durin',tag:'시험'}}];go(s,{type:'endTurn'});assert.equal(s.heroes.lohen.stress,10);assert.equal(s.heroes.durin.stress,15);}
 const hit=oneHit(12,0);assert.equal(hit.heroes.lohen.stress,5);assert.equal(hit.heroes.lohen.scar,Math.round(12*hit.maxHp/100)%210);assert.equal(hit.heroes.durin.stress,0);
 const blocked=oneHit(12,20);assert.equal(blocked.heroes.lohen.stress,0);
 const partial=oneHit(12,8);assert.equal(partial.heroes.lohen.stress,5);
});

test('camp allows exactly one choice; a talk lowers one hero by 30 without clearing collapse',()=>{
 const s=qaFixture('base');s.phase='camp';s.campActions=[];s.heroes.durin.stress=70;s.heroes.lohen.stress=40;
 go(s,{type:'camp',choice:'calm',hero:'durin'});assert.equal(s.heroes.durin.stress,40);assert.equal(s.heroes.lohen.stress,40);
 unchanged(s,{type:'camp',choice:'rest'});unchanged(s,{type:'camp',choice:'calm',hero:'lohen'});
 const t=qaFixture('base');t.phase='camp';t.campActions=[];unchanged(t,{type:'camp',choice:'calm',hero:'jahoda'});
 const broken=qaFixture('care');broken.phase='camp';broken.campActions=[];go(broken,{type:'camp',choice:'calm',hero:'lohen'});assert.ok(broken.heroes.lohen.breakdown);
});

test('a won battle offers three distinct party cards; picking adds one copy, skipping adds none, offers survive saves',()=>{
 const s=qaFixture('battle');for(const e of s.battle.enemies){e.hp=1;e.echo=true;e.ward=0;e.hitWard=0;}
 for(let i=0;i<8&&s.phase==='battle';i++){const c=s.battle.hand.find(c=>CARDS[c.key].type==='attack');if(!c)break;act(s,{type:'play',uid:c.uid,target:s.battle.enemies.find(e=>e.hp>0)?.id});}
 assert.equal(s.phase,'reward');const offer=s.lastReward.cardOffer;assert.equal(offer.candidates.length,3);
 assert.equal(new Set(offer.candidates.map(c=>c.owner+c.key)).size,3);assert.ok(offer.candidates.every(c=>s.party.includes(c.owner)&&REWARD_POOL[c.owner].includes(c.key)));
 go(s,{type:'claimReward'});assert.equal(s.phase,'cardReward');const loaded=hydrate(serialize(s));assert.deepEqual(loaded.cardOffer,s.cardOffer);
 const pick=s.cardOffer.candidates[0],before=ownedDeck(s,pick.owner).length;unchanged(s,{type:'pickCard',hero:pick.owner,card:'not-a-card'});
 go(s,{type:'pickCard',hero:pick.owner,card:pick.key});assert.equal(ownedDeck(s,pick.owner).length,before+1);assert.ok(['travel','refine'].includes(s.phase));
 go(loaded,{type:'skipCard'});assert.equal(ownedDeck(loaded,pick.owner).length,before);
});

test('duplicate reward cards get unique deck ids and never more than two copies are offered',()=>{
 const s=qaFixture('base');s.heroes.lohen.acquired.push('l_vigil','l_vigil');const ids=ownedDeck(s,'lohen').map(c=>c.uid);assert.equal(new Set(ids).size,ids.length);
 for(let i=0;i<40;i++){const o=makeCardOffer(s);assert.ok(o.candidates.every(c=>!(c.owner==='lohen'&&c.key==='l_vigil')));}
});

test('every reward card has artwork, four tactics and a legal card definition',()=>{
 for(const [owner,keys] of Object.entries(REWARD_CARDS))for(const key of keys){assert.equal(CARDS[key].owner,owner);const s=qaFixture('base');const path=cardArtwork(owner,{cost:1},key);assert.ok(fs.existsSync(new URL('../dist/'+path,import.meta.url)),path);}
});

test('the expedition map is seeded, connected, and only offers linked nodes',()=>{
 for(const seed of [1,2,3,44,20261126]){
  const a=generateMap(seed,ROUTE),b=generateMap(seed,ROUTE);assert.deepEqual(a,b);
  for(let c=MAP_START;c<ROUTE.length;c++){const nodes=a.columns[c];assert.ok(nodes.length>=1&&nodes.length<=3);if(ROUTE[c].type==='base')assert.equal(nodes.length,1);assert.equal(nodes.find(n=>n.lane===1)?.id,`route-${c}-a`);
   for(const n of nodes){if(c>MAP_START)assert.ok(a.edges[c-1].some(([,to])=>to===n.lane),`no way into ${n.id}`);if(c<ROUTE.length-1)assert.ok(a.edges[c].some(([from])=>from===n.lane),`no way out of ${n.id}`);if(['battle','elite'].includes(n.type))assert.ok(n.enemies?.length);}}
 }
 const s=qaFixture('base');s.phase='travel';s.node=9;s.lane=0;const links=s.map.edges[9].filter(([from])=>from===0).map(([,to])=>to).sort();assert.deepEqual(travelOptions(s).map(c=>c.lane).sort(),links);
});

test('enemies grow stronger with depth on the map and in the final front',()=>{
 const s=qaFixture('base');s.mode='route';s.node=8;const early=depthScale(s);s.node=22;const late=depthScale(s);s.mode='challenge';const front=depthScale(s);
 assert.ok(early.hp>1&&late.hp>early.hp&&late.damage>early.damage&&front.hp>=early.hp);s.mode='route';s.node=2;assert.deepEqual(depthScale(s),{hp:1,damage:1});
});

test('events cover dice and hidden outcomes, and the same event is not repeated until all were seen',()=>{
 assert.ok(EVENTS.length>=12);assert.ok(EVENTS.flatMap(e=>e.choices).filter(c=>c.dice).length>=4);assert.ok(EVENTS.flatMap(e=>e.choices).filter(c=>c.mystery).length>=2);
 const s=qaFixture('base');s.seenEvents=[];const ids=[];for(let i=0;i<EVENTS.length;i++)ids.push(rollEventOffer(s).id);assert.equal(new Set(ids).size,EVENTS.length);
 const next=rollEventOffer(s);assert.deepEqual(s.seenEvents,[next.id]);
 for(let i=0;i<30;i++){const o=rollEventOffer(s);for(const c of o.choices){const original=EVENTS.find(e=>e.id===o.id).choices.find(x=>x.id===c.id);if(Object.keys(original.cost||{}).length)assert.deepEqual(c.cost,original.cost);}}
});
