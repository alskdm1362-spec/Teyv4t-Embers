import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createGame,act,cardInfo,CARDS,HEROES,HERO_STATS,INSIGHTS,hydrate,serialize,PARTNER_PASSIVES,makeUpgradeOffer} from '../dist/engine.js';
import {V2_CARDS,V2_STARTERS,SPECIAL_CARDS} from '../dist/cards-v2.js';
import {CAST_IDS,CAST_SPRITES,castArt,castPose,cardArtwork} from '../dist/cast-art.js';
import {standingArt,faceArt36,bannerArt,partnerCardArt,injuryArt,supportCutinArt} from '../dist/cast36.js';
import {JOIN_LINES,CARE_SCRIPT} from '../dist/story-scripts.js';
const go=(s,a)=>{const r=act(s,a);assert.ok(r.ok,r.error);return r;};
const exists=p=>fs.existsSync(new URL('../dist/'+p,import.meta.url));
function arena(party,hand,{enemies=1}={}){
 const s=createGame(77,{tutorial:false});s.party=party;s.phase='base';s.node=7;go(s,{type:'farm'});const b=s.battle;b.noCrit=true;b.forecast=true;b.ap=6;
 b.enemies=b.enemies.slice(0,1);while(b.enemies.length<enemies)b.enemies.push({...b.enemies[0],id:'extra-'+b.enemies.length});
 for(const e of b.enemies){e.hp=e.maxHp=99999;e.def=0;e.ward=0;e.hitWard=0;e.crack=0;e.stun=99;e.intent={name:'시험',damage:0,stress:0,target:party[0],tag:'시험'};}
 b.hand=hand.map((key,i)=>({uid:'h'+i,owner:CARDS[key].owner,key}));b.draw=[];b.discard=[];b.exhaust=[];return s;}
const dmg=r=>r.events.filter(e=>e.type==='damage').map(e=>e.amount);
const foe=s=>s.battle.enemies[0];

test('v0.36 stage 4 (v0.37 사이노 명암): seven fighters, 64 cards (56 with four branches, 8 special) and the plan stats',()=>{
 assert.deepEqual(Object.keys(HEROES),['lohen','durin','illuga','jahoda','kinich','lyney','cyno']);assert.deepEqual(CAST_IDS,Object.keys(HEROES));
 assert.deepEqual(HERO_STATS.kinich,{hp:430,atk:85,def:50,cr:.2,cd:1.3});assert.deepEqual(HERO_STATS.cyno,{hp:400,atk:120,def:45,cr:.1,cd:2});assert.equal(HERO_STATS.lyney.atk,80);
 const count=id=>Object.values(V2_CARDS).filter(c=>c.owner===id).length;assert.deepEqual(CAST_IDS.map(count),[9,9,7,8,10,10,11]);
 assert.equal(Object.keys(INSIGHTS).length,56);assert.equal(SPECIAL_CARDS.length,8);for(const k of SPECIAL_CARDS)assert.ok(!INSIGHTS[k]&&CARDS[k].generated);
 for(const id of CAST_IDS){assert.equal(V2_STARTERS[id].length,4);for(const k of V2_STARTERS[id])assert.equal(CARDS[k].owner,id);}
 for(const p of ['mualani','kachina','lynette','tighnari'])assert.ok(PARTNER_PASSIVES[p].desc.length>10);assert.deepEqual(HEROES.kinich.partners,['mualani','kachina']);
});

test('v0.36 stage 4: every card and every role of the new cast has its supplied art',()=>{
 for(const c of Object.values(V2_CARDS))assert.ok(exists(cardArtwork(c.owner,{},c.key)),c.key);
 for(const id of ['kinich','lyney','cyno']){
  for(const role of ['battle','portrait','breakdownPortrait','ultimate','partner','support','battleCollapsed'])assert.ok(exists(castArt(id,role)),id+role);
  for(const stage of [1,2])assert.ok(exists(castArt(id,'breakdown',stage)));for(const pose of Object.keys(CAST_SPRITES[id].poses))if(pose!=='collapse')assert.ok(exists(castPose(id,pose)),id+pose);
  for(const f of [standingArt(id),standingArt(id,true),faceArt36(id),faceArt36(id,true),bannerArt(id),...['eye-card','eye-cutin','arm-cutin','leg-cutin'].map(n=>injuryArt(id,n)),cardArtwork(id,{breakdown:true,breakdownType:'panic'},''),cardArtwork(id,{blind:true},'')])assert.ok(exists(f),f);
  for(const p of HEROES[id].partners||[HEROES[id].partner])for(const f of [standingArt(p),bannerArt(p),partnerCardArt(p),supportCutinArt(p)])assert.ok(exists(f),f);
  assert.ok(JOIN_LINES[id].length>=3&&CARE_SCRIPT[id].length>=3);
 }
 const m=JSON.parse(fs.readFileSync(new URL('../dist/assets/cast36/manifest.json',import.meta.url)));assert.equal(m.assets.length,m.total_files);for(const a of m.assets)assert.equal(fs.statSync(new URL('../dist/'+a.path,import.meta.url)).size,a.bytes);
});

test('v0.36 stage 4 로엔: 서리 파편 is made by strikes, cannot be played, and answers every discard with a follow-up',()=>{
 const s=arena(['lohen','durin','illuga'],['l_strike','l_shatter','l_javelin']);let r=go(s,{type:'play',uid:'h0',target:foe(s).id});assert.deepEqual(dmg(r),[110]);
 const frost=s.battle.hand.find(c=>c.key==='l_frost');assert.ok(frost);assert.equal(act(s,{type:'play',uid:frost.uid}).ok,false);
 r=go(s,{type:'play',uid:'h1'});assert.deepEqual(dmg(r),[Math.round(110*.6*1.3)]);assert.ok(s.battle.exhaust.some(c=>c.uid===frost.uid));
 r=go(s,{type:'play',uid:'h2'});assert.equal(s.battle.hand.filter(c=>c.key==='l_frost').length,1); // one card discarded this turn
 r=go(s,{type:'endTurn'});assert.deepEqual(dmg(r),[Math.round(110*.3*1.3)]);
 const t=arena(['lohen','durin','illuga'],['l_breach'],{enemies:2});r=go(t,{type:'play',uid:'h0',target:foe(t).id});assert.equal(dmg(r).length,1+3*2);assert.equal(t.battle.turn,2); // 3 shards at once spread to all (Varka); 종극 ends the turn
});

test('v0.36 stage 4 두린: 협공 follows an ally attack, 태양화 strengthens every third, and 공명하는 손 chains from the hand',()=>{
 const s=arena(['lohen','durin','illuga'],['l_strike','l_strike','l_strike','l_strike','d_hand'],{enemies:2});s.battle.forecast=false;s.battle.ap=6;let assists=0;
 for(let i=0;i<4;i++){const r=go(s,{type:'play',uid:'h'+i,target:foe(s).id});if(r.events.some(e=>e.type==='assist'))assists++;if(i===0)assert.ok(r.events.some(e=>e.type==='chain'));else assert.ok(!r.events.some(e=>e.type==='chain'));}
 assert.ok(assists<=3);assert.equal(s.battle.assists,assists);
 const d=arena(['lohen','durin','illuga'],['d_comet','d_strike']);d.heroes.durin.upgrades.d_comet='D';go(d,{type:'play',uid:'h0'});assert.equal(d.battle.persist.length,1);assert.equal(act(d,{type:'play',uid:'h1',target:foe(d).id}).ok,false);
 const r=go(d,{type:'endTurn'});assert.ok(dmg(r).includes(Math.round(95*.6)));
});

test('v0.36 stage 4 야호다·일루가: springs, next-turn AP, party lantern, carry-over attack and Flins',()=>{
 const s=arena(['jahoda','illuga','lohen'],['j_reserve','j_energy','i_watch']);go(s,{type:'play',uid:'h0'});go(s,{type:'play',uid:'h1'});assert.equal(s.battle.ap,6);
 const r=go(s,{type:'play',uid:'h2'});assert.ok(s.battle.turn===2);assert.equal(s.battle.ap,4); // 종극 ended the turn; 예비 동력 gave +1
 assert.equal(s.heroes.illuga.buffs.atkBonus,Math.round(144*.36));
 const f=arena(['illuga','lohen','durin'],['i_guard']);go(f,{type:'play',uid:'h0'});foe(f).stun=0;foe(f).intent={name:'시험',damage:100,stress:0,target:'illuga',tag:'시험'};const end=go(f,{type:'endTurn'});assert.ok(end.events.some(e=>e.text.includes('플린스')));assert.ok(dmg(end).includes(Math.round(80*.4)));
});

test('v0.36 stage 4 키니치: the ultimate button switches mode for free once a turn; 추적 builds marks and 분쇄 spends them',()=>{
 const s=arena(['kinich','lohen','durin'],['k_shot','k_cannon','k_fist']);s.support=0;
 let r=go(s,{type:'play',uid:'h0',target:foe(s).id});assert.deepEqual(dmg(r),[30,30,30,30]);assert.equal(s.battle.tracks,4); // 3 hits + Mualani
 r=go(s,{type:'ultimate',hero:'kinich'});assert.equal(s.battle.kmode,'crush');assert.equal(s.support,0);assert.ok(s.battle.hand.some(c=>c.key==='k_ajaw'));assert.equal(act(s,{type:'ultimate',hero:'kinich'}).ok,false);
 go(s,{type:'play',uid:s.battle.hand.find(c=>c.key==='k_ajaw').uid});assert.equal(s.battle.tracks,6);assert.equal(cardInfo(s,s.battle.hand.find(c=>c.key==='k_fist')).cost,0);
 r=go(s,{type:'play',uid:'h1',target:foe(s).id});assert.deepEqual(dmg(r),[Math.round(85*.45*6)]);assert.equal(s.battle.tracks,0);
 go(s,{type:'endTurn'});assert.ok(act(s,{type:'ultimate',hero:'kinich'}).ok);assert.equal(s.battle.kmode,'chase');
 s.heroes.kinich.breakdown={type:'panic',failures:0};assert.equal(act(s,{type:'ultimate',hero:'kinich'}).ok,false);
});

test('v0.36 stage 4 리니: draws, chosen discards, 셔플 and 커튼콜; the hand never passes ten',()=>{
 const s=arena(['lyney','lohen','durin'],['y_trick','y_entrance','y_shuffle','y_curtain']);s.battle.draw=Array.from({length:12},(_,i)=>({uid:'d'+i,owner:'lohen',key:'l_guard'}));
 go(s,{type:'play',uid:'h0'});assert.equal(s.battle.hand.length,5);go(s,{type:'play',uid:'h1'});assert.equal(s.battle.chooseDiscard,1);
 let r=go(s,{type:'discard',uid:s.battle.hand.find(c=>c.owner==='lohen').uid});assert.ok(r.events.some(e=>e.text.includes('리넷')));assert.equal(s.battle.chooseDiscard,0);
 go(s,{type:'play',uid:'h2'});assert.equal(s.battle.chooseDiscard,3);go(s,{type:'discard',uid:s.battle.hand.find(c=>c.owner==='lohen').uid});const n=s.battle.hand.length;go(s,{type:'discardDone'});assert.equal(s.battle.hand.length,n+1);
 const hand=s.battle.hand.length-1;r=go(s,{type:'play',uid:'h3'});assert.equal(s.battle.hand.length,0);assert.deepEqual(dmg(r),[Math.round(80*.25*hand)]);
 const full=arena(['lyney','lohen','durin'],['y_trick',...Array(9).fill('l_guard')]);full.battle.draw=[{uid:'x1',owner:'lohen',key:'l_guard'},{uid:'x2',owner:'lohen',key:'l_guard'}];go(full,{type:'play',uid:'h0'});assert.equal(full.battle.hand.length,10);
 const pick=arena(['lyney','lohen','durin'],['y_trick']);pick.heroes.lyney.upgrades.y_trick='C';pick.battle.draw=[{uid:'p1',owner:'lohen',key:'l_guard'},{uid:'p2',owner:'lohen',key:'l_pierce'}];go(pick,{type:'play',uid:'h0'});assert.ok(pick.battle.pickDraw);assert.equal(act(pick,{type:'endTurn'}).ok,false);go(pick,{type:'pickDraw',uid:'p2'});assert.ok(pick.battle.hand.some(c=>c.uid==='p2'));
});

test('v0.37 사이노 명암: 심판이 전투 시작에 죄·명계·의식으로 나뉘고, 조건에 맞으면 저절로 발동한다',()=>{
 const g=createGame(77,{tutorial:false});g.party=['cyno','lohen','durin'];g.phase='base';g.node=7;go(g,{type:'farm'});const b=g.battle;
 assert.equal(b.hand[0].key,'c_sin');assert.ok(b.hand.some(c=>c.key==='c_dark')&&b.hand.some(c=>c.key==='c_rite'));assert.ok(![...b.draw,...b.discard,...b.hand].some(c=>c.key==='c_judgment'));
 assert.equal(b.hand.find(c=>c.key==='c_rite').verdict,1);assert.equal(cardInfo(g,b.hand.find(c=>c.key==='c_rite')).displayCost,'-');
 const s=arena(['cyno','lohen','durin'],['c_thrust','l_guard','l_guard','l_strike']);const v=s.battle;v.hand.unshift({uid:'sin',owner:'cyno',key:'c_sin',gen:true});v.hand.push({uid:'rite',owner:'cyno',key:'c_rite',gen:true,verdict:1},{uid:'dark',owner:'cyno',key:'c_dark',gen:true});
 let r=go(s,{type:'play',uid:'h0',target:foe(s).id});assert.equal(dmg(r).length,2);assert.ok(r.events.some(e=>e.type==='verdictProc'&&e.part==='sin'));assert.equal(s.battle.hand.find(c=>c.key==='c_rite').verdict,2);
 r=go(s,{type:'play',uid:'h1',target:'lohen'});assert.ok(!r.events.some(e=>e.type==='verdictProc'));
 r=go(s,{type:'play',uid:'h2',target:'lohen'});assert.ok(r.events.some(e=>e.type==='verdictProc'&&e.part==='dark'));assert.equal(s.battle.hand.find(c=>c.key==='c_rite').verdict,3);
});
test('v0.37 사이노 명암: 손에 죄·명계와 사용 불가 카드만 남으면 심판으로 결합하고, 판정 1당 +80%로 친 뒤 다음 턴에 다시 나뉜다',()=>{
 const s=arena(['cyno','lohen','durin'],['c_thrust']);const b=s.battle;b.hand.unshift({uid:'sin',owner:'cyno',key:'c_sin',gen:true});b.hand.push({uid:'rite',owner:'cyno',key:'c_rite',gen:true,verdict:3},{uid:'dark',owner:'cyno',key:'c_dark',gen:true});b.verdictWhole={owner:'cyno',key:'c_judgment',uid:'cyno-c_judgment-0'};
 let r=go(s,{type:'play',uid:'h0',target:foe(s).id});assert.ok(r.events.some(e=>e.type==='combine'&&e.stacks===4));assert.equal(s.battle.hand.length,1);const j=s.battle.hand[0];assert.equal(j.key,'c_judgment');assert.equal(cardInfo(s,j).cost,0);
 r=go(s,{type:'play',uid:j.uid,target:foe(s).id});assert.deepEqual(dmg(r),[Math.round(120*(400+80*4)/100)]);assert.equal(s.battle.turn,1);
 go(s,{type:'endTurn'});assert.equal(s.battle.hand[0].key,'c_sin');assert.ok(s.battle.hand.some(c=>c.key==='c_dark'));assert.ok(![...s.battle.discard,...s.battle.draw].some(c=>c.key==='c_judgment'));
 const t=arena(['cyno','lohen','durin'],['c_thrust','l_guard']);t.battle.hand.unshift({uid:'sin',owner:'cyno',key:'c_sin',gen:true});go(t,{type:'play',uid:'h0',target:foe(t).id});assert.ok(foe(t).aim);assert.ok(!t.battle.hand.some(c=>c.key==='c_judgment'));
 const o=createGame(5,{tutorial:false});o.party=['lohen','cyno','durin'];let seen=false;for(let i=0;i<40&&!seen;i++){o.rng=i*7919+1;seen=makeUpgradeOffer(o,'event','base').candidates.some(c=>c.key==='c_judgment');}assert.ok(seen);
});
test('v0.37 사이노 명암: 심판의 분기가 죄·명계의 피해와 발동 조건을 바꾼다 (로스바이세 명멸검 변형)',()=>{
 const s=arena(['cyno','lohen','durin'],['c_low','l_strike']);s.heroes.cyno.upgrades.c_judgment='B';const b=s.battle;b.hand.unshift({uid:'sin',owner:'cyno',key:'c_sin',gen:true});b.hand.push({uid:'dark',owner:'cyno',key:'c_dark',gen:true});
 assert.match(cardInfo(s,b.hand[0]).desc,/버릴 때마다/);assert.match(cardInfo(s,b.hand.at(-1)).desc,/뽑을 때마다/);
 let r=go(s,{type:'play',uid:'h0'});if(s.battle.chooseDiscard)r=go(s,{type:'discard',uid:'h1'});assert.ok(r.events.some(e=>e.type==='verdictProc'&&e.part==='sin'));
 const d=arena(['cyno','lohen','durin'],['c_thrust']);d.heroes.cyno.upgrades.c_judgment='D';d.battle.ap=4;d.battle.hand=[{uid:'w',owner:'cyno',key:'c_judgment'}];assert.equal(cardInfo(d,d.battle.hand[0]).displayCost,'X');const rr=go(d,{type:'play',uid:'w',target:foe(d).id});assert.deepEqual(dmg(rr),[Math.round(120*(400+120*4)/100)]);
});

test('v0.36 stage 4: older saves drop cards that no longer exist and gain the new fighters',()=>{
 const s=createGame(3,{tutorial:false});s.heroes.lohen.acquired=['l_thread','l_aim','l_vigil'];s.heroes.lohen.upgrades={l_thread:'A',l_strike:'B'};delete s.heroes.cyno;
 const back=hydrate(serialize(s));assert.deepEqual(back.heroes.lohen.acquired,['l_aim']);assert.deepEqual(back.heroes.lohen.upgrades,{l_strike:'B'});assert.ok(back.heroes.cyno);assert.deepEqual(hydrate(serialize(back)),back);
});
