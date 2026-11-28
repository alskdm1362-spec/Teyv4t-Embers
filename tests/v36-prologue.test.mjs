import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGame,act,serialize,hydrate,HEROES} from '../dist/engine.js';
import {PROLOGUE} from '../dist/story-scripts.js';
import {GUIDE,GUIDE_ITEMS,GUIDE_TRIGGERS,guideKey,guideItem,guideText,guideDue,guideMarks} from '../dist/guide.js';
import {KEYWORDS} from '../dist/keywords.js';
import {sceneBackground} from '../dist/scene-background.js';
import {TUTORIAL_COPY} from '../dist/condition-ui.js';
import {pauseMarkup} from '../dist/menu-ui.js';
import {qaFixture,QA_SCENARIOS} from '../dist/qa-fixtures.js';
import {completeJoin} from './flow-helpers.mjs';

const go=(s,a)=>{const r=act(s,a);assert.equal(r.ok,true,r.error);return r;};
const no=(s,a)=>{const before=serialize(s),r=act(s,a);assert.equal(r.ok,false);assert.equal(serialize(s),before);};
const read=p=>fs.readFileSync(new URL('../dist/'+p,import.meta.url),'utf8');
const exists=p=>fs.existsSync(new URL('../dist/'+p,import.meta.url));

test('v0.36 stage 8: the prologue keeps the written script, scene by scene',()=>{
 assert.equal(PROLOGUE.length,15);assert.deepEqual(PROLOGUE.map(l=>l.scene),[...Array(2).fill('black'),...Array(4).fill('radio'),...Array(7).fill('city'),...Array(2).fill('cutscene')]);
 assert.equal(PROLOGUE[0].text,'……');assert.equal(PROLOGUE[1].text,'…… 아');assert.equal(PROLOGUE[3].text,'마이크 테스트~, 하나 둘 셋.');assert.equal(PROLOGUE[4].text,'아, 드디어 연결됐네!');assert.equal(PROLOGUE[5].text,'모두가 보고 싶어할 앨리스 아줌마란다!');
 assert.equal(PROLOGUE[6].text,'길게 설명해주고 싶지만 성토화의 영향으로 보급형 도도통신기로는 한계가 있으니까 짧게 말할게.');assert.equal(PROLOGUE[12].text,'응, 그 표정을 보니 바르카가 한 말이 맞았네!');
 assert.equal(PROLOGUE[13].text,'각 국가의 일곱 집정관의 약간의 협력과, 소소한 선물과 함께 하렴.');assert.equal(PROLOGUE.at(-1).text,'티바트의 잔불을 부탁할게.');
 // the line is noisy until the call connects, and the caller is unnamed until she says who she is
 assert.deepEqual(PROLOGUE.map((l,i)=>l.noise?i:-1).filter(i=>i>=0),[2,3]);assert.deepEqual(PROLOGUE.slice(2,5).map(l=>l.speaker),['???','???','???']);assert.ok(PROLOGUE.slice(5).every(l=>l.speaker==='앨리스'));assert.ok(PROLOGUE.slice(0,2).every(l=>!l.speaker));
 for(const f of ['dodoco','city','alice','cutscene','battle-1','battle-2'])assert.ok(exists(`assets/prologue/${f}.webp`),f);
});

test('v0.36 stage 8: a first run plays the prologue before the tutorial fight and can skip it at any line',()=>{
 const s=createGame(3);go(s,{type:'start',prologue:true});assert.equal(s.phase,'prologue');assert.equal(s.prologueLine,0);no(s,{type:'start'});
 const mid=hydrate(serialize(s));for(let i=0;i<14;i++){go(s,{type:'prologueNext'});assert.equal(s.phase,'prologue');assert.equal(s.prologueLine,i+1);}
 go(s,{type:'prologueNext'});assert.equal(s.phase,'battle');assert.equal(s.node,0);assert.equal(s.tutorial.active,true);assert.equal(s.collection.prologueSeen,true);assert.equal(s.prologueLine,undefined);no(s,{type:'prologueNext'});
 go(mid,{type:'prologueNext'});go(mid,{type:'skipPrologue'});assert.equal(mid.phase,'battle');assert.equal(mid.battle.enemies.length,s.battle.enemies.length);
 const plain=createGame(3);go(plain,{type:'start'});assert.equal(plain.phase,'battle','fixtures and tests start without it');
 const veteran=createGame(3,{tutorial:false});go(veteran,{type:'start',prologue:true});assert.equal(veteran.phase,'battle');
});

test('v0.36 stage 8: the tutorial fights use the supplied backdrops',()=>{
 const s=qaFixture('tutorial');assert.equal(sceneBackground(s).src,'assets/prologue/battle-1.webp');
 const two=qaFixture('partner');assert.equal(two.node,2);assert.equal(sceneBackground(two).src,'assets/prologue/battle-2.webp');
 assert.notEqual(sceneBackground(qaFixture('battle')).src,'assets/prologue/battle-1.webp');assert.notEqual(sceneBackground(qaFixture('tutorialBase')).src,'assets/prologue/battle-2.webp');
});

test('v0.36 stage 8: the tutorial ends with a saved trip to the lobby and back',()=>{
 const s=qaFixture('tutorialBase');assert.equal(s.phase,'base');assert.equal(s.node,7);assert.equal(s.tutorial.active,true);assert.equal(s.tutorial.step,'lobby-guide');assert.ok(!s.collection.tutorialDone);
 go(s,{type:'returnToLobby'});assert.equal(s.phase,'lobby');assert.equal(s.tutorial.step,'return-guide');assert.equal(s.savedExpedition,true);no(s,{type:'finishExpedition'});
 const r=go(s,{type:'resumeExpedition'});assert.equal(s.phase,'base');assert.equal(s.tutorial.active,false);assert.equal(s.tutorial.completed,true);assert.equal(s.collection.tutorialDone,true);assert.ok(r.events.some(e=>e.type==='tutorialDone'));
 assert.equal(hydrate(serialize(s)).checkpoint.tutorial.active,false);
 // a player who ignores the hint and walks on is not stuck in the tutorial
 const t=qaFixture('tutorialBase'),q=go(t,{type:'challenge'});assert.equal(t.tutorial.active,false);assert.equal(t.collection.tutorialDone,true);assert.ok(q.events.some(e=>e.type==='tutorialDone'));
 for(const step of ['lobby-guide','return-guide'])assert.equal(TUTORIAL_COPY[step].length,2);assert.match(TUTORIAL_COPY['lobby-guide'][1],/임시 저장 후 로비로/);assert.match(TUTORIAL_COPY['return-guide'][1],/원정으로 돌아가기/);
 const focus=read('tutorial-focus.js');assert.ok(focus.includes('[data-action="return-lobby"]'));assert.ok(focus.includes('.lobby-run [data-action="lobby-expedition"]'));
});

test('v0.36 stage 8: a trip to the lobby does not hand out a second flame at the same base',()=>{
 const s=qaFixture('base');s.hp=Math.round(s.maxHp*.4);go(s,{type:'heal'});const hp=s.hp;assert.equal(s.healUsed,true);s.hp=Math.round(s.maxHp*.4);
 go(s,{type:'returnToLobby'});go(s,{type:'resumeExpedition'});assert.equal(s.phase,'base');assert.equal(s.healUsed,true);no(s,{type:'heal'});assert.ok(hp>s.hp);
});

test('v0.36 stage 8: the guide has six categories with the planned items, short pages and one accent',()=>{
 assert.deepEqual(GUIDE.map(c=>c.name),['전투','카드','전투원','원정','로비','저장']);
 const titles=id=>GUIDE.find(c=>c.id===id).items.map(i=>i.title);
 assert.deepEqual(titles('battle'),['AP와 카드 사용','손패 10장 규칙','적의 의도','보호막','상흔 게이지와 부상','정신부담과 붕괴','파트너 지원','필살기']);
 assert.deepEqual(titles('cards'),['카드 표기(계수)','키워드 12종','특수 · 생성 카드','전술 각성 분기','잔불 각성']);
 assert.deepEqual(titles('heroes'),['능력치',...Object.values(HEROES).map(h=>h.name)]);
 assert.deepEqual(titles('expedition'),['분기 지도','전투 보상','사건','거점과 야영','카드 복제 · 제거']);
 assert.deepEqual(titles('lobby'),['편성','세이브 기록','레이드','도감']);assert.deepEqual(titles('save'),['시드','자동 저장','로비 왕복','다른 기기로 옮기기']);
 assert.equal(Object.keys(KEYWORDS).length,12);const kw=guideItem('cards/keywords').pages.map(p=>p.text).join(' ');for(const k of Object.values(KEYWORDS))assert.ok(kw.includes(`**${k.name}**`),k.name);
 assert.equal(new Set(GUIDE_ITEMS.map(i=>guideKey(i.category,i.id))).size,GUIDE_ITEMS.length);
 for(const it of GUIDE_ITEMS){assert.ok(it.pages.length>=1&&it.pages.length<=4,it.title);for(const p of it.pages){assert.ok(/\*\*.+?\*\*/.test(p.text),it.title+': every page marks its key words');if(it.id!=='keywords')assert.ok(p.text.replace(/\*\*|`|<br>/g,'').length<=130,it.title+' stays one or two lines');assert.equal(p.shot,null,'screenshots come after the screens are final');}}
 assert.equal(guideText('**불** & `EMBR` <b>'),'<b>불</b> &amp; <code>EMBR</code> &lt;b&gt;');
 assert.equal(guideMarks([{kind:'ring',x:10,y:20,r:5},{kind:'tap',x:1,y:2}]).split('guide-mark').length-1,2);
});

test('v0.36 stage 8: each guide page opens by itself once, the first time its moment comes after the tutorial',()=>{
 const s=qaFixture('base');assert.equal(guideDue(s),null);go(s,{type:'challenge'});assert.equal(s.phase,'travel');assert.equal(guideDue(s),'expedition/map');
 go(s,{type:'guideSeen',id:'expedition/map'});assert.deepEqual(s.collection.guideSeen,['expedition/map']);assert.equal(guideDue(s),null);go(s,{type:'guideSeen',id:'expedition/map'});assert.equal(s.collection.guideSeen.length,1);
 assert.equal(guideDue(s,[{type:'injury',hero:'lohen'}]),'battle/scar');assert.equal(hydrate(serialize(s)).collection.guideSeen[0],'expedition/map');no(s,{type:'guideSeen',id:5});
 const t=qaFixture('tutorial');assert.equal(guideDue(t,[{type:'injury'}]),null,'nothing pops up during the tutorial');
 for(const [key] of GUIDE_TRIGGERS)assert.ok(guideItem(key),key);
 const run=qaFixture('ending');run.collection.guideSeen=['x'];go(run,{type:'restart'});assert.deepEqual(run.collection.guideSeen,['x'],'the record follows the collection');
});

test('v0.36 stage 8: the lobby lists the eight entries around a large lead standing, and the guide is reachable in play',()=>{
 const app=read('app.js'),lobby=app.slice(app.indexOf('function lobby(){'),app.indexOf('const HERO_TITLES'));
 for(const [name,action] of [['원정','lobby-expedition'],['레이드','open-raid'],['편성','lobby-formation'],['인물','lobby-personnel'],['도감','codex'],['가이드','guide'],['기록','save-data'],['설정','settings']]){assert.ok(lobby.includes(`'${name}'`),name);assert.ok(lobby.includes(`'${action}'`),action);}
 assert.ok(lobby.includes('원정으로 돌아가기'));assert.ok(lobby.includes('class="lobby-lead-art"'));assert.ok(lobby.includes('standingArt(lead)'));assert.ok(!lobby.includes('dialogue'));
 assert.ok(pauseMarkup(qaFixture('battle')).includes('data-action="guide"'));
 assert.ok(app.includes("prologue:prologuePage"));assert.ok(app.includes("run({type:'start',prologue:true})"));assert.ok(app.includes('프롤로그 건너뛰기'));assert.ok(app.includes('class="guide-tabs"')&&app.includes('class="guide-list"')&&app.includes('class="guide-page"'));
 for(const k of ['prologue','prologueCity','tutorialBase','tutorialLobby'])assert.ok(QA_SCENARIOS[k],k);assert.equal(qaFixture('prologue').phase,'prologue');assert.equal(qaFixture('prologueCity').prologueLine,6);assert.equal(qaFixture('tutorialLobby').phase,'lobby');
});
