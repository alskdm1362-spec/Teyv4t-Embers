import {completeJoin,finishCare} from './flow-helpers.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {qaFixture} from '../dist/qa-fixtures.js';
import {act,createGame,hydrate,serialize,healingNeeds} from '../dist/engine.js';
import {ALLIES,galleryItems,injuryEffects} from '../dist/archive-ui.js';
import {guidePosition} from '../dist/tutorial-focus.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
test('flame repairs bodies, adds exactly thirty HP and reduces only current party stress by five',()=>{
 const s=qaFixture('base');const hp31=Math.round(s.maxHp*.31),heal30=Math.round(s.maxHp*.3);s.hp=hp31;s.heroes.lohen.body.eyes=3;s.heroes.lohen.body.leftArm=3;s.heroes.lohen.retired=true;s.heroes.lohen.breakdown={type:'panic',failures:7};s.heroes.lohen.stress=100;s.heroes.durin.stress=3;s.heroes.illuga.stress=11;s.heroes.jahoda.stress=80;s.heroes.jahoda.body.rightLeg=2;const gold=s.gold;
 const r=go(s,{type:'heal'});assert.equal(s.hp,hp31+heal30);assert.equal(s.heroes.lohen.retired,false);assert.ok(Object.values(s.heroes.lohen.body).every(n=>n===0));assert.equal(s.heroes.lohen.stress,95);assert.deepEqual(s.heroes.lohen.breakdown,{type:'panic',failures:7});assert.equal(s.heroes.durin.stress,0);assert.equal(s.heroes.illuga.stress,6);assert.equal(s.heroes.jahoda.stress,80);assert.equal(s.gold,gold);assert.equal(r.events.find(e=>e.type==='heal').hp,heal30);assert.equal(s.checkpoint.hp,hp31+heal30);assert.equal(hydrate(serialize(s)).checkpoint.heroes.lohen.stress,95);
 s.hp=s.maxHp-50;s.healUsed=false;go(s,{type:'heal'});assert.equal(s.hp,s.maxHp);assert.equal(s.heroes.lohen.stress,90);
});
test('flame remains available for mental burden alone, while a care action requires exactly one party hero',()=>{
 const s=qaFixture('base');s.hp=s.maxHp;for(const h of Object.values(s.heroes))h.stress=0;s.heroes.durin.stress=9;assert.equal(healingNeeds(s).needed,true);go(s,{type:'heal'});assert.equal(s.heroes.durin.stress,4);const before=serialize(s);assert.equal(act(s,{type:'calm'}).ok,false);assert.equal(serialize(s),before);s.heroes.durin.breakdown={type:'panic',failures:0};finishCare(s,'durin');assert.equal(s.heroes.durin.stress,0);assert.equal(healingNeeds(s).needed,false);
});
test('arrival and join cursor survive reload and complete before the next tutorial or checkpoint',()=>{
 const s=createGame(82);go(s,{type:'start'});go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});go(s,{type:'recruit',hero:'durin'});assert.equal(s.phase,'arrival');assert.equal(s.recruitNotice.hero,'durin');assert.deepEqual(hydrate(serialize(s)).recruitNotice,s.recruitNotice);go(s,{type:'ackRecruit'});assert.equal(s.phase,'joinDialogue');completeJoin(s);assert.equal(s.tutorial.step,'partner-select');go(s,{type:'skipTutorial'});go(s,{type:'skipRecruitDialogue'});go(s,{type:'recruit',hero:'jahoda'});completeJoin(s);assert.equal(s.checkpoint.recruitNotice,null);go(s,{type:'challenge'});s.phase='defeat';go(s,{type:'restart'});assert.equal(s.recruitNotice,null);
});
test('old partner introduction saves resume directly at Varka selection without resetting the hand or RNG',()=>{
 const s=qaFixture('partner');s.tutorial.step='partner-intro';const rng=s.rng,hand=serialize(s.battle.hand),loaded=hydrate(serialize(s));assert.equal(loaded.tutorial.step,'partner-select');assert.equal(serialize(loaded.battle.hand),hand);assert.equal(loaded.rng,rng);go(loaded,{type:'tutorialSelect',hero:'lohen',kind:'support'});assert.equal(loaded.tutorial.step,'partner-use');
});
test('ally archive lists seven fighters and their eight partners and only animated art offers a replay',()=>{
 assert.equal(ALLIES.length,15);assert.equal(new Set(ALLIES.map(a=>a.id)).size,15);for(const a of ALLIES){const items=galleryItems(a.hero,a.partner?a.id:false);assert.ok(items.length>=3);assert.equal(new Set(items.map(a=>a.id)).size,items.length);for(const item of items){assert.ok(fs.existsSync(new URL('../dist/'+item.src,import.meta.url)),item.src);assert.ok(!item.animation||['ultimate','support','breakdown','injury-eyes','injury-leftArm','injury-leftLeg'].includes(item.animation));}assert.equal(items.find(a=>a.id==='standing').animation,undefined);if(a.partner)assert.equal(items.filter(x=>x.animation).length,1);}
});
test('right-side injury summaries represent stacked penalties and keep unaffected heroes clear',()=>{
 const s=qaFixture('base'),h=s.heroes.lohen;assert.deepEqual(injuryEffects(h),[]);h.body={eyes:3,leftArm:3,rightArm:2,leftLeg:3,rightLeg:2};h.retired=true;const labels=injuryEffects(h);assert.ok(labels.includes('팔 · 카드 수치 효과 -40%'));assert.ok(labels.includes('팔 결손 · 드로우 효과 -1'));assert.ok(labels.includes('다리 · 타 부위 부상 위험 +30%p'));assert.ok(labels.includes('다리 결손 · 받는 피해 +25%'));assert.ok(labels.some(x=>x.includes('실명')));
});
test('tutorial callout placement stays within desktop and landscape bounds and avoids action targets',()=>{
 for(const [w,h] of [[1280,720],[844,390],[640,360]])for(const r of [{x:20,y:h-90,width:90,height:80},{x:w-120,y:120,width:90,height:120},{x:w/2,y:h-90,width:90,height:80}]){const width=Math.min(310,w-16),height=120,p=guidePosition(r,width,height,w,h);assert.ok(p.x>=8&&p.y>=8);assert.ok(p.x+width<=w-8);assert.ok(p.y+height<=h-8);const intersection=Math.max(0,Math.min(p.x+width,r.x+r.width)-Math.max(p.x,r.x))*Math.max(0,Math.min(p.y+height,r.y+r.height)-Math.max(p.y,r.y));assert.equal(intersection,0);}
});
test('locally hosted LevelUp regular and bold fonts match recorded source hashes and OFL is bundled',()=>{
 const base=new URL('../dist/assets/fonts/levelup/',import.meta.url),m=JSON.parse(fs.readFileSync(new URL('source.json',base)));for(const file of m.files){const b=fs.readFileSync(new URL(file.file,base));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),file.sha256);}for(const f of ['LevelUp-Regular.woff2','LevelUp-Bold.woff2'])assert.equal(fs.readFileSync(new URL(f,base)).subarray(0,4).toString(),'wOF2');assert.match(fs.readFileSync(new URL('LICENSE.txt',base),'utf8'),/OPEN FONT LICENSE/);
});

test('returning after an ending keeps this-campaign clear status, while a new campaign clears it',()=>{const s=qaFixture('ending');go(s,{type:'restart'});assert.equal(s.phase,'base');assert.equal(s.claimedEnding,true);go(s,{type:'newGame',seed:3});assert.equal(s.claimedEnding,false);assert.ok(s.collection.endings.includes('first-front'));});
