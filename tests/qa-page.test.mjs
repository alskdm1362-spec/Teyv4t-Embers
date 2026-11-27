import test from 'node:test';
import assert from 'node:assert/strict';
import {QA_SCENARIOS,qaFixture,qaApplyCondition} from '../dist/qa-fixtures.js';
import {feedbackEntry,feedbackDocument,importFeedback,mergeFeedback} from '../dist/qa-feedback.js';
import {act,serialize,cardInfo} from '../dist/engine.js';
test('all QA scenarios deserialize as usable states with intentional tutorial/base/battle conditions',()=>{
 for(const kind of Object.keys(QA_SCENARIOS))for(const hero of ['lohen','durin','illuga','jahoda']){const s=qaFixture(kind,{hero});assert.equal(s.version,3);assert.equal(s.heroes[hero].retired,false);if(kind==='camp'){assert.equal(s.phase,'camp');assert.equal(s.hp,Math.round(s.maxHp*.76));assert.equal(s.checkpoint.phase,'base');}if(kind==='eyesLoss'){assert.equal(s.heroes[hero].body.eyes,3);const cards=s.battle.hand.filter(c=>c.owner===hero);assert.equal(cards.length,3);assert.ok(cards.every(c=>cardInfo(s,c).blind));}if(kind==='base')assert.equal(s.gold,250);if(s.battle){const cards=['hand','draw','discard','exhaust'].flatMap(z=>s.battle[z]);assert.equal(new Set(cards.map(c=>c.uid)).size,cards.length);}}
});
test('QA state adjustment is isolated and supports retirement without invalid owner cards',()=>{
 const original=qaFixture('battle'),before=serialize(original);const s=qaApplyCondition(original,{hero:'lohen',part:'eyes',stage:3,ap:6,support:4,breakdown:'panic'});assert.equal(serialize(original),before);assert.equal(s.heroes.lohen.body.eyes,3);assert.equal(s.heroes.lohen.breakdown.type,'panic');assert.equal(s.support,4);assert.equal(s.battle.ap,6);const t=qaApplyCondition(s,{hero:'lohen',part:'leftArm',stage:3});assert.equal(t.heroes.lohen.retired,true);assert.ok(['hand','draw','discard','exhaust'].every(z=>t.battle[z].every(c=>c.owner!=='lohen')));
});
test('feedback roundtrip retains context, reproducible save and draft; merging avoids duplicates',()=>{
 const s=qaFixture('eyesLoss');const entry=feedbackEntry({title:'실명 카드',actual:'화면 확인',expected:'더 크게',category:'카드 · 조작',priority:'high',includeSave:true},{phase:'battle',width:844,height:390},s,'2026-11-22T15:00:00Z');const doc=feedbackDocument([entry],{title:'작성 중',actual:'아직 작성 중'}),result=importFeedback(JSON.stringify(doc));assert.deepEqual(result.entries,[entry]);assert.equal(result.draft.title,'작성 중');const copy=result.entries[0].save;assert.equal(act(copy,{type:'endTurn'}).ok,true);assert.equal(s.battle.turn,1);
 const newer={...entry,title:'수정',updatedAt:'2026-11-22T15:10:00Z'};assert.deepEqual(mergeFeedback([entry],[newer,newer]),[newer]);assert.deepEqual(mergeFeedback([newer],[entry]),[newer]);assert.throws(()=>importFeedback('{"entries":[]}'));assert.throws(()=>feedbackEntry({title:'',actual:'test'}));
});
