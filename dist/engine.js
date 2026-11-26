import {STARTERS,DISCOVERIES,NEW_CARDS} from './awakening.js';
/* Teyvat: Oath of Embers — fan-game rules, independent of rendering. */
import {INSIGHTS,INSIGHT_BRANCHES,insightSpec,compatibleSparkIds,effectDescription} from './card-insights.js';
export {INSIGHTS,INSIGHT_BRANCHES} from './card-insights.js';
import {stageChoices} from './journey.js';
import {JOIN_LINES,CARE_SCRIPT} from './story-scripts.js';
import {EXTRA_ROUTE,EVENTS,LOOT_RULES} from './expedition-content.js';
export {LOOT_RULES} from './expedition-content.js';
export const HEROES = {
 lohen:{id:'lohen',name:'로엔',role:'단일 공격',partner:'varka',partnerName:'바르카',color:'#70d5ce',weakness:'의태',summary:'한 대상에게 공격을 집중하는 가장 기본적인 전투원.'},
 durin:{id:'durin',name:'두린',role:'광역 공격',partner:'albedo',partnerName:'알베도',color:'#bb91ef',weakness:'관측',summary:'높은 비용의 광역 공격. 성장하면 행동력을 일부 회수한다.'},
 illuga:{id:'illuga',name:'일루가',role:'생존·추가 타격',partner:'flins',partnerName:'플린스',color:'#f0ce65',weakness:'침식',summary:'공용 보호막과 엄호. 방어 성공을 추가 타격으로 연결한다.'},
 jahoda:{id:'jahoda',name:'야호다',role:'손패·행동력',partner:'nefer',partnerName:'네페르',color:'#ee99bf',weakness:'추적',summary:'손패와 행동력을 정리하고 원정 보급품을 더 찾아온다.'},
};
export const PARTNER_PASSIVES = {
 varka:{id:'varka',hero:'lohen',name:'서풍의 전술 감각',desc:'전투당 전술 되감기(Undo) +1회 · 붕괴 극복 시 공용 보호막 +4'},
 albedo:{id:'albedo',hero:'durin',name:'백악의 변성',desc:'전술 각성 시 희귀 잔불 각성(✦) 등장 확률 상승 · 붕괴 극복 시 행동력 +1'},
 flins:{id:'flins',hero:'illuga',name:'불빛의 엄호',desc:'붕괴 극복 시 다음 공격 피해 +5 · 아군 엄호 시 정신 부담 -2'},
 nefer:{id:'nefer',hero:'jahoda',name:'사막의 통찰',desc:'붕괴 극복 시 카드 1장 드로우 · 원정 보급품 탐색 보조'},
};
export const SPARK_EFFECTS = {
 ember_cost:{id:'ember_cost',name:'잔불 각성 · 경량화',badge:'✦ 각성',desc:'비용 -1 (최소 0)'},
 ember_support:{id:'ember_support',name:'잔불 각성 · 호응',badge:'✦ 각성',desc:'사용 시 지원 게이지 +1'},
 ember_calm:{id:'ember_calm',name:'잔불 각성 · 진정',badge:'✦ 각성',desc:'사용 시 사용자의 정신 부담 -4'},
 ember_draw:{id:'ember_draw',name:'잔불 각성 · 순환',badge:'✦ 각성',desc:'사용 시 카드 1장 드로우 (전투원당 턴당 1회)'},
 ember_force:{id:'ember_force',name:'잔불 각성 · 맹공',badge:'✦ 각성',desc:'공격 피해 +3'},
 ember_bastion:{id:'ember_bastion',name:'잔불 각성 · 성채',badge:'✦ 각성',desc:'공용 보호막 +4'},
 ember_mercy:{id:'ember_mercy',name:'잔불 각성 · 온기',badge:'✦ 각성',desc:'사용 시 공용 체력 3 회복 (전투원당 턴당 1회)'},
};
export const BRANCH_A_SPECS=Object.fromEntries(Object.entries(INSIGHTS).map(([key,v])=>[key,{title:v.A.title,...v.A.effects,bonusText:effectDescription(v.A.effects)}]));
export const RAID_AVAILABLE=false;
export const RAID_BOSS_DEFAULT = {
 bossKind:'nightmare',
 bossName:'천상의 왕좌 · 메타트론',
 bossMaxHp:240,
 maxTriesPerRecord:3,
 maxTurns:6,
};
export const BREAKDOWNS={
 despair:{name:'절망',desc:'아군 전체의 사기를 낮춘다.'},
 distrust:{name:'불신',desc:'다른 동료를 공격해 공용 체력에 피해를 준다.'},
 panic:{name:'공황',desc:'동료 한 명의 정신력을 낮춘다.'},
 frenzy:{name:'폭주',desc:'적을 멋대로 공격하고 확률적으로 자신의 신체를 손상한다.'},
};
const card=(owner,name,cost,target,type,amount,desc,extra={})=>({owner,name,cost,target,type,amount,desc,...extra});
export const CARDS={
 l_strike:card('lohen','정확한 일격',1,'enemy','attack',9,'적 하나에게 피해 9.'),
 l_guard:card('lohen','방어 태세',1,'none','guard',7,'공용 보호막 7.'),
 l_pierce:card('lohen','집중 관통',2,'enemy','attack',19,'적 하나에게 피해 19. 장막에 추가 압박 4.',{pierce:4}),
 l_aim:card('lohen','조준',0,'none','focus',6,'다음 로엔 공격 피해 +6. 소멸.',{exhaust:true}),
 d_strike:card('durin','용의 발톱',1,'enemy','attack',8,'적 하나에게 피해 8.'),
 d_guard:card('durin','비늘의 수호',1,'none','guard',7,'공용 보호막 7.'),
 d_wave:card('durin','흑염의 날개',2,'all','attack',13,'적 전체에게 피해 13.'),
 d_charge:card('durin','용의 숨결',0,'none','focus',5,'다음 두린 공격 피해 +5. 소멸.',{exhaust:true}),
 i_strike:card('illuga','견제',1,'enemy','attack',7,'적 하나에게 피해 7.'),
 i_guard:card('illuga','보호 전개',1,'none','guard',10,'공용 보호막 10.'),
 i_counter:card('illuga','반격 준비',2,'none','counter',15,'공용 보호막 15. 적 공격을 막으면 다음 공격에 추가 타격 6.'),
 i_cover:card('illuga','엄호',0,'ally','cover',12,'선택한 동료가 다음에 받을 정신력 피해 12 감소. 소멸.',{exhaust:true}),
 j_strike:card('jahoda','기습',1,'enemy','attack',8,'적 하나에게 피해 8.'),
 j_guard:card('jahoda','방어 태세',1,'none','guard',7,'공용 보호막 7.'),
 j_draw:card('jahoda','재정비',0,'none','draw',2,'2장 뽑고 1장을 골라 버린다. 소멸.',{exhaust:true}),
 j_energy:card('jahoda','행동 지원',1,'none','energy',2,'행동력 2 회복. 소멸.',{exhaust:true}),
};
CARDS.d_resonance=card('durin','흑염의 잔향',1,'all','attack',10,'적 전체에게 피해 10. 취약 1턴. 소멸.',{exhaust:true,generated:true,effects:{vuln:1}});
CARDS.j_dossier=card('jahoda','비밀 수첩',0,'none','draw',2,'2장 뽑고 1장을 버린다. 지원 +1. 소멸.',{exhaust:true,generated:true,effects:{support:1}});
for(const [key,,source,name,cost,amount,effects] of NEW_CARDS){
 CARDS[key]={...CARDS[source],name,cost,amount,effects,desc:name};
}
CARDS.curse_echo=card('lohen','악몽의 잔향',1,'none','curse',0,'아무 효과도 없다. 사용하면 소멸.',{exhaust:true,debuff:true});
export const EQUIPMENT={
 emberLance:{name:'잔불의 창',slot:'weapon',desc:'엘리트 · 공격 피해 +4, 첫 공격 +4.',attack:4,firstAttack:4,cost:0,rarity:'elite'},
 dawnSeal:{name:'여명의 인장',slot:'accessory',desc:'엘리트 · 시작 보호막 9, 정신 피해 15% 감소.',startShield:9,stressReduction:.15,cost:0,rarity:'elite'},
 plainSpear:{name:'정찰용 무기',slot:'weapon',desc:'공격 피해 +2.',attack:2,cost:30},
 frostEdge:{name:'얼음빛 날',slot:'weapon',desc:'첫 공격 피해 +5.',firstAttack:5,cost:45},
 wardCharm:{name:'수호 부적',slot:'accessory',desc:'전투 시작 시 공용 보호막 5.',startShield:5,cost:25},
 calmRibbon:{name:'안정의 매듭',slot:'accessory',desc:'받는 정신력 피해 20% 감소.',stressReduction:.2,cost:30},
};
export const ENEMIES={
 trainingSlime:{name:'작은 슬라임',faction:'야생',hp:40,attack:3,tag:'훈련',desc:'움직임이 느린 작은 슬라임. 침식·잔향·부상 기술이 없어 기본 조작을 익히기 좋다.'},
 hound:{name:'수계 사냥개',faction:'심연',hp:30,attack:6,tag:'침식',desc:'침식이 보호막을 넘어 짧은 지속 피해를 남긴다.'},
 wanderer:{name:'황야 배회자',faction:'심연',hp:27,attack:5,tag:'추적',desc:'육체를 쓰러뜨리면 잔향이 노출된다. 잔향까지 제거해야 한다.'},
 hunter:{name:'황야 사냥꾼',faction:'심연',hp:37,attack:8,tag:'추적',desc:'한 동료를 추적한다. 강한 공격을 미리 예고한다.'},
 angler:{name:'어둠의 낚시꾼',faction:'심연',hp:31,attack:6,tag:'의태',ward:12,desc:'연결된 장막 중 하나를 깨면 낚시꾼의 장막이 함께 무너진다.'},
 mimic:{name:'그윽한 의태',faction:'심연',hp:64,attack:10,tag:'의태',hits:3,desc:'장막은 여러 번의 공격으로 벗긴다. 변신 공격이 예고된다.'},
 breacher:{name:'균열계 원형체',faction:'심연',hp:58,attack:9,tag:'침식',ward:16,desc:'장막을 파괴하면 공격을 한 번 중단한다.'},
 nightmare:{name:'어둠의 악몽 영주',faction:'심연',hp:112,attack:14,tag:'의태',ward:22,boss:true,desc:'낚시꾼을 소환한다. 소환체를 쓰러뜨리면 영주의 장막도 약해진다.'},
 keeper:{name:'영역 수호자',faction:'천공',hp:94,attack:12,tag:'관측',boss:true,desc:'반복해서 공격한 전투원을 관측한다. 다른 동료의 공격으로 관측을 끊는다.'},
 sentinel:{name:'파수꾼·타락',faction:'천공',hp:128,attack:15,tag:'관측',boss:true,desc:'별을 전개해 큰 기술을 준비한다. 별을 모두 파괴하면 저지할 수 있다.'},
 star:{name:'관측의 별',faction:'천공',hp:12,attack:0,tag:'관측',desc:'파수꾼이 준비하는 기술의 매개. 파괴하면 큰 공격이 약해진다.'},
};
export const ROUTE=[
 {type:'battle',name:'부서진 순찰로',description:'낯선 발자국이 바람의 흔적을 지운다.',enemies:['wanderer']},
 {type:'recruit',name:'첫 번째 서풍 매',description:'바르카의 제안으로 로엔이 지원 요청을 띄운다.'},
 {type:'battle',name:'침식된 갈림길',description:'서로 다른 위협에 새 동료의 힘을 시험한다.',enemies:['hound','wanderer']},
 {type:'recruit',name:'다시 띄우는 날개',description:'다음 전선을 함께 지탱할 동료에게 연락한다.'},
 {type:'event',name:'뒤집힌 성상',description:'균열 너머의 보급품. 손을 뻗을지, 안전한 길을 택할지.'},
 {type:'camp',name:'바람이 머무는 밤',description:'불빛 곁에서 숨을 고른다. 정신 상태는 저절로 사라지지 않는다.'},
 {type:'elite',name:'서로를 비추는 어둠',description:'어둠의 장막이 두 개체를 연결하고 있다.',enemies:['angler','angler']},
 {type:'base',name:'첫 번째 생명의 거점',description:'따스한 생명의 불꽃이 손상된 몸을 감싼다.'},
];
ROUTE.push(...EXTRA_ROUTE);
const LEGACY_STARTERS={lohen:['l_strike','l_strike','l_strike','l_guard','l_pierce','l_aim'],durin:['d_strike','d_strike','d_guard','d_wave','d_wave','d_charge'],illuga:['i_strike','i_strike','i_guard','i_guard','i_counter','i_cover'],jahoda:['j_strike','j_strike','j_guard','j_guard','j_draw','j_energy']};
export const PARTS=['eyes','leftArm','rightArm','leftLeg','rightLeg'];
export const PART_NAMES={eyes:'눈',leftArm:'왼팔',rightArm:'오른팔',leftLeg:'왼다리',rightLeg:'오른다리'};
export const BODY_STAGES=['평소','경상','중상','결손'];
const clone=x=>JSON.parse(JSON.stringify(x));
const active=s=>s.party.filter(id=>!s.heroes[id].retired);
const emit=(events,type,text,data={})=>events.push({type,text,...data});
const livingEnemies=s=>s.battle?.enemies.filter(e=>e.hp>0)||[];
function random(s){s.rng=(Math.imul(s.rng,1664525)+1013904223)>>>0;return s.rng/4294967296;}
function choose(s,items){return items[Math.floor(random(s)*items.length)];}
function shuffle(s,items){for(let i=items.length-1;i>0;i--){let j=Math.floor(random(s)*(i+1));[items[i],items[j]]=[items[j],items[i]];}return items;}
function reject(message){throw new Error(message);}
function heroState(){return {level:1,xp:0,stress:0,breakdown:null,body:Object.fromEntries(PARTS.map(p=>[p,0])),retired:false,acquired:[],removedCards:[],upgrades:{},sparks:{},equipment:{weapon:null,accessory:null},buffs:{}};}
export function createGame(seed=20261115,{tutorial=true}={}){
 const s={version:3,tutorial:{active:!!tutorial,completed:!tutorial,chapter:1,step:'cost'},removalCount:0,phase:'title',seed:Number(seed)>>>0,rng:Number(seed)>>>0,party:['lohen'],heroes:Object.fromEntries(Object.keys(HEROES).map(id=>[id,heroState()])),hp:100,maxHp:100,shield:0,gold:30,support:2,retries:0,temporal:0,node:0,mode:'route',challengeStage:0,checkpoint:null,collection:{unlocked:['lohen'],codex:[],cutins:[],endings:[],records:[],raid:{bossKind:'nightmare',bossName:'천상의 왕좌 · 메타트론',bossMaxHp:240,totalDamage:0,clears:0,recordStats:{}}},battle:null,history:[],eventResult:null,battlesWon:0,claimedEnding:false,farmCount:0};
 normalizeSave(s);s.checkpoint=snapshot(s);return s;
}
export function currentNode(s){
 if(s.selectedStage&&s.selectedStage.mode===s.mode&&s.selectedStage.node===s.node)return s.selectedStage;
 if(s.mode==='farm')return {type:'battle',name:'재탐사 · 지난 순찰로',description:'이전 지역에서 보급품을 확보한다.'};
 if(s.mode==='challenge')return {type:'boss',name:['그윽한 균열','영역의 관측자','타락한 별의 파수'][s.challengeStage]||'깨어난 전선',description:'심연과 광계가 겹친 전선. 개발판 도전 구간.'};
 return ROUTE[s.node]||ROUTE.at(-1);
}
export function readiness(s){
 const warnings=[];
 if(s.party.length<3)warnings.push('아직 3인 파티가 완성되지 않았습니다.');
 if(active(s).length<s.party.length)warnings.push('전투에서 이탈한 동료가 있습니다. 거점에서 몸을 회복하세요.');
 if(s.party.some(id=>s.heroes[id].breakdown))warnings.push('붕괴 상태인 동료가 있습니다. 파트너 지원은 계속 사용할 수 있습니다.');
 if(s.hp<s.maxHp*.5)warnings.push('공용 체력이 부족합니다. 치료를 권합니다.');
 if(!s.party.includes('illuga'))warnings.push('지속 방어가 약한 편성입니다. 기본 방어와 파트너 보호막을 활용하세요.');
 if((s.mode==='challenge'||s.phase==='base')&&s.party.some(id=>s.heroes[id].level<2))warnings.push('일부 동료의 성장이 낮습니다. 거점의 전술 각성과 장비 보급으로 준비할 수 있습니다.');
 return warnings;
}
export function serialize(s){return JSON.stringify(s);}
export function hydrate(json){
 let s=typeof json==='string'?JSON.parse(json):clone(json);
 if(!s||![1,2,3].includes(s.version)||!Array.isArray(s.party)||!s.heroes||!s.collection)throw new Error('이 버전의 저장 데이터가 아닙니다.');
 if(s.version===1)s=migrateLegacy(s);
 normalizeSave(s);
 for(const id of s.party)if(!HEROES[id]||!s.heroes[id])throw new Error('잘못된 편성 데이터입니다.');
 return s;
}
function normalizeSave(s){
 s.version=3;s.inventory??=[];s.baseId??='route-7';s.careUsed??=false;s.upgradeOffer??=null;s.careDialogue??=null;
 const equipped=Object.values(s.heroes).flatMap(h=>Object.values(h.equipment||{})).filter(Boolean);for(const key of new Set(equipped)){while(s.inventory.filter(x=>x===key).length<equipped.filter(x=>x===key).length)s.inventory.push(key);}
 s.mainFrontStarted??=s.node>7||s.battlesWon>2;
 s.removalCount=Math.max(0,s.removalCount||0);s.tutorial??={active:false,completed:true,chapter:2,step:'complete'};if(s.tutorial.step==='partner-intro')s.tutorial.step='partner-select';
 for(const h of Object.values(s.heroes)){h.body={...Object.fromEntries(PARTS.map(p=>[p,0])),...h.body};if(!h.acquired){h.legacyLoadout=true;h.acquired=[];}h.removedCards??=[];h.curses??=[];}
 if(s.battle)for(const zone of ['hand','draw','discard','exhaust'])for(const c of s.battle[zone]||[])bindBlind(s,c,false);
 if(s.checkpoint)normalizeSave(s.checkpoint);
 s.collection??={unlocked:['lohen'],codex:[],cutins:[],endings:[],records:[],raid:{bossKind:'nightmare',bossName:'천상의 왕좌 · 메타트론',bossMaxHp:240,totalDamage:0,clears:0,recordStats:{}}};s.collection.records??=[];s.collection.raid??={bossKind:'nightmare',bossName:'천상의 왕좌 · 메타트론',bossMaxHp:240,totalDamage:0,clears:0,recordStats:{}};s.collection.raid.bossName=RAID_BOSS_DEFAULT.bossName;s.collection.raid.recordStats??={};for(const h of Object.values(s.heroes||{}))h.sparks??={};
}
export function ownedDeck(s,owner){return [...(s.heroes[owner].legacyLoadout?LEGACY_STARTERS:STARTERS)[owner].map((key,index)=>({owner,key,uid:`${owner}-${key}-${index}`})),...(s.heroes[owner].acquired||[]).map(key=>({owner,key,uid:owner+"-awaken-"+key})),...(s.heroes[owner].curses||[]).map(c=>({...c,owner}))].filter(c=>!(s.heroes[owner].removedCards||[]).includes(c.uid));}
export function removalCost(s){return 25+15*(s.removalCount||0);}
export function armEffectRate(h){return Math.max(.6,1-.2*[h.body.leftArm,h.body.rightArm].filter(n=>n>=2).length);}
export function injuryChance(h,special=false){return Math.min(.8,(special ? .35 : 0)+.15*[h.body.leftLeg,h.body.rightLeg].filter(n=>n>=2).length);}
function blindPool(s,owner){return [...new Set(ownedDeck(s,owner).map(c=>c.key))];}
function bindBlind(s,c,reroll=false){if(CARDS[c.key]?.debuff)return;
 if((s.heroes[c.owner]?.body.eyes||0)<3)return;
 const pool=blindPool(s,c.owner);if(!pool.length)return;
 if(!reroll&&pool.includes(c.blindKey))return;
 if(reroll)c.blindKey=choose(s,pool);else{let hash=s.seed>>>0;for(const char of c.uid||c.key)hash=(Math.imul(hash,31)+char.charCodeAt(0))>>>0;c.blindKey=pool[hash%pool.length];}
}
export function tutorialBlocked(s,a){
 const t=s.tutorial;if(!t?.active)return '';
 if(['skipTutorial','tutorialNext','tutorialSelect'].includes(a.type))return '';
 if(s.phase==='battle'){
  if(a.type==='ultimate')return '필살기는 튜토리얼을 마친 뒤 사용할 수 있습니다.';
  if(a.type==='support'&&!(t.step==='partner-use'&&a.hero==='lohen'||t.step==='free'&&t.chapter===2))return '파트너 안내 순서에서 바르카의 카드를 선택하세요.';
  if(a.type==='play'&&!['attack-use','defense-use','free'].includes(t.step))return '강조된 안내부터 확인하세요.';
  if(a.type==='play'&&t.step!=='free'){const c=s.battle.hand.find(c=>c.uid===a.uid),key=t.step==='attack-use'?'l_pierce':'l_guard';if(c?.key!==key)return '안내 중인 카드를 사용하세요.';}
  if(a.type==='endTurn'&&!['end-turn','free'].includes(t.step))return '공격 카드와 방어 카드를 먼저 사용하세요.';
 }
 return '';
}
// Rename the retired cast in both the live state and checkpoint, without rerolling
// cards, RNG, enemy targets, growth, injuries, or collection records.
function migrateLegacy(value){
 const rename=text=>text.replace(/\bmitya\b/g,'durin').replace(/\bvaleri\b/g,'albedo').replace(/\bm_(strike|guard|wave|charge)\b/g,'d_$1').replace(/미탸/g,'두린').replace(/발레리/g,'알베도');
 const walk=x=>typeof x==='string'?rename(x):Array.isArray(x)?x.map(walk):x&&typeof x==='object'?Object.fromEntries(Object.entries(x).map(([key,item])=>[rename(key),walk(item)])):x;
 const s=walk(value);s.version=2;if(s.checkpoint)s.checkpoint.version=2;return s;
}
export function newCampaign(previous,seed=Date.now()){
 const s=createGame(seed);if(previous?.collection)s.collection=clone(previous.collection);s.checkpoint=snapshot(s);return s;
}
function snapshot(s){const copy=clone(s);delete copy.checkpoint;delete copy.history;return copy;}
function saveCheckpoint(s,isNew=false){if(s.phase!=='base')return;if(isNew){s.retries=0;s.temporal=0;}s.checkpoint=snapshot(s);}
function makeCard(s,owner,key,index){return {uid:`${owner}-${key}-${index}`,owner,key};}
function draw(s,n,events=[]){const b=s.battle;for(let i=0;i<n&&b.hand.length<10;i++){
 if(!b.draw.length&&b.discard.length){const count=b.discard.length;b.draw=shuffle(s,b.discard.splice(0));emit(events,'shuffle','버린 카드를 다시 섞습니다.',{count});}
 if(!b.draw.length)break;const c=b.draw.pop();bindBlind(s,c,true);b.hand.push(c);emit(events,'draw',`${HEROES[c.owner].name}의 카드를 뽑았습니다.`,{uid:c.uid,hero:c.owner});
}}
function danger(h){const f=h.breakdown?.failures||0;return f>=7?3:f>=4?2:1;}
function recoveryChance(h){return h.breakdown.failures>=10?1:.15+Math.min(.15,h.breakdown.failures*.015);}
export function cardInfo(s,c){
 const original=CARDS[c?.key];if(!original)return null;if(original.debuff)return {...original,owner:c.owner,upgraded:false};const h=s.heroes[c.owner],blind=(h.body.eyes||0)>=3&&!h.breakdown;let effectiveKey=c.key;if(blind){const copy={...c};bindBlind(s,copy,false);effectiveKey=copy.blindKey||c.key;}const base=CARDS[effectiveKey];
 if(h.breakdown){const d=BREAKDOWNS[h.breakdown.type];return {...base,name:`붕괴 · ${d.name}`,cost:1,target:'none',type:'breakdown',exhaust:false,desc:`${d.desc} 극복 확률 ${Math.round(recoveryChance(h)*100)}%. 실패 ${h.breakdown.failures}/10. 위험 강도 ${danger(h)}.`,blurred:h.body.eyes===2,breakdown:true,breakdownType:h.breakdown.type,failures:h.breakdown.failures,upgraded:false};}
 const branch=h.upgrades[effectiveKey],spec=insightSpec(effectiveKey,branch),form={...base,...(spec||{})},rate=armEffectRate(h);
 let amount=Math.max(0,Math.floor(form.amount*rate)),cost=form.cost;
 if(form.type==='draw')amount=Math.max(0,amount-[h.body.leftArm,h.body.rightArm].filter(n=>n===3).length);
 const effects={...(base.effects||{}),...(spec?.effects||{})};
 for(const field of ['shield','focus','nextPierce','extraPierce','counter','heal'])if(effects[field])effects[field]=Math.floor(effects[field]*rate);
 if(form.type==='counter'&&!effects.counter)effects.counter=Math.floor(6*rate);
 if(c.owner==='durin'&&h.level>=3&&form.target==='all'&&h.buffs.discount)cost=Math.max(0,cost-1);
 if(form.type==='attack'&&s.battle?.nextAttackDiscount)cost=Math.max(0,cost-1);
 const sparkId=h.sparks?.[effectiveKey]||null,sparkInfo=sparkId?SPARK_EFFECTS[sparkId]:null;
 if(sparkId==='ember_cost')cost=Math.max(0,cost-1);
 if(sparkId==='ember_force'&&form.type==='attack')amount+=Math.floor(3*rate);
 if(sparkId==='ember_bastion'&&['guard','counter'].includes(form.type))amount+=Math.floor(4*rate);
 const text={tactic:'특수 지원.',attack:`적 ${form.target==='all'?'전체':'하나'}에게 피해 ${amount}.`,guard:`공용 보호막 ${amount}.`,counter:`공용 보호막 ${amount}.`,focus:`이번 턴 다음 ${HEROES[c.owner].name} 공격 피해 +${amount}.`,cover:`${effects.coverAll?'아군 전체':'선택한 동료'}가 다음에 받을 정신력 피해 ${amount} 감소.`,draw:`${amount}장 뽑${form.discard===0?'는다.':'고 1장을 골라 버린다.'}`,energy:`행동력 ${amount} 회복.`};
 const described={...effects};delete described.extraPierce;const pressure=Math.floor((form.pierce||0)*rate)+(effects.extraPierce||0);let desc=(text[form.type]||form.desc)+(pressure?` 장막 추가 압박 ${pressure}.`:'')+' '+effectDescription(described);if(form.exhaust)desc+=' 소멸.';
 if(spec)desc+=` [${spec.title}]`;if(sparkInfo)desc+=` [${sparkInfo.badge}: ${sparkInfo.desc}]`;
 const actual={...form,amount,cost,desc:desc.trim(),effects,upgraded:!!branch,branch,spark:sparkId,sparkName:sparkInfo?.name||null,effectiveKey,injuryRate:rate,blurred:h.body.eyes===2};return blind?{...actual,name:'실명',desc:'??',displayCost:'?',upgraded:false,blind:true,target:'none',type:'blind',actual}:actual;
}
function makeEnemy(s,kind,index){const d=ENEMIES[kind];return {id:`${kind}-${index}`,kind,name:d.name,hp:d.hp+Math.max(0,s.temporal)*3,maxHp:d.hp+Math.max(0,s.temporal)*3,ward:d.ward||0,hitWard:d.hits||0,turn:0,stun:0,vulnerable:0,observed:null,observedCount:0,echo:false,intent:null};}
function plans(s){
 const b=s.battle,targets=active(s);if(!targets.length)return;
 for(const e of livingEnemies(s)){
  const d=ENEMIES[e.kind];let target=targets[(e.turn+b.turn)%targets.length];let intent={name:'공격',damage:d.attack+s.temporal,stress:0,target,tag:d.tag};
  if(e.kind==='hound')intent={...intent,name:e.turn%2?'균열의 도약':'침식의 이빨',damage:e.turn%2?8:5,corrosion:e.turn%2?0:2};
  if(e.kind==='wanderer')intent={...intent,name:e.echo?'잔향 복원':'흔적 추적',damage:e.echo?0:5,restore:e.echo};
  if(e.kind==='hunter')intent={...intent,name:e.turn%2?'갈라진 추격':'추적 표식',damage:e.turn%2?12:5,stress:e.turn%2?8:5,injury:e.turn%2===1};
  if(e.kind==='angler')intent={...intent,name:e.ward?'연결된 장막':'낚싯줄의 속삭임',stress:e.ward?8:4};
  if(e.kind==='mimic')intent={...intent,name:e.turn%2?'의태 · 강습':'공허한 변형',damage:e.turn%2?16:6,stress:e.turn%2?12:5,injury:e.turn%2===1};
  if(e.kind==='breacher')intent={...intent,name:e.ward?'코어의 수축':'균열 분출',damage:e.ward?7:13,stress:7};
  if(e.kind==='nightmare')intent={...intent,name:e.turn%3===0?'어둠의 부름':e.turn%3===2?'악몽의 파도':'내리꽂는 그림자',damage:e.turn%3===2?18:10,stress:e.turn%3===2?20:8,summon:e.turn%3===0};
  if(e.kind==='keeper')intent={...intent,name:e.observedCount>=2?'관측된 결말':'영역 검출',damage:e.observedCount>=2?19:10,stress:10,target:e.observedCount>=2&&targets.includes(e.observed)?e.observed:target};
  if(e.kind==='sentinel'){
   const stars=livingEnemies(s).filter(x=>x.kind==='star').length;
   intent={...intent,name:e.turn%3===0?'타락한 별의 전개':e.turn%3===2?'별의 심판':'침묵의 검출',damage:e.turn%3===2?(stars?24:6):10,stress:e.turn%3===2?(stars?20:3):8,stars:e.turn%3===0,injury:e.turn%3===2&&stars>0};
  }
  if(e.kind==='star')intent={...intent,name:'심판에 힘을 보냄',damage:0};
  if(intent.damage>0){const h=s.heroes[intent.target];intent.damage=Math.ceil(intent.damage*(1+.25*[h.body.leftLeg,h.body.rightLeg].filter(n=>n===3).length));}
  if(e.stun)intent={...intent,name:'균형 붕괴 · 행동 중단',damage:0,stress:0,stunned:true,summon:false,stars:false,injury:false,corrosion:0};
  e.intent=intent;
 }
}
function beginBattle(s,kinds,events){
 kinds=[...kinds];const teaching=s.tutorial?.active&&s.mode==='route'&&[0,2].includes(s.node);if(teaching)kinds=s.node===0?['trainingSlime']:['trainingSlime','trainingSlime'];
 if(!teaching&&s.temporal>0&&s.mode==='route'&&s.node<7){
  if(s.node===0)kinds=[s.temporal===1?'hound':'hunter'];
  if(s.node===2)kinds=s.temporal===1?['hound','hunter']:['wanderer','breacher'];
  emit(events,'temporal','시간의 잔흔으로 다음 전선의 적 구성이 달라졌습니다. 적의 행동을 확인하세요.',{temporal:s.temporal});
 }
 const cards=active(s).flatMap(owner=>ownedDeck(s,owner));
 for(const id of s.party)s.heroes[id].buffs={...(s.heroes[id].buffs?.flins?{flins:s.heroes[id].buffs.flins}:{}),firstAttack:true};
 s.encounterType=currentNode(s).type;s.battle={turn:1,ap:3,hand:[],draw:shuffle(s,cards),discard:[],exhaust:[],enemies:kinds.map((k,i)=>makeEnemy(s,k,i)),supportUsed:false,ultimates:{},spent:0,recovered:false,corrosion:0,morale:0,chooseDiscard:0,undoStack:[],undoLeft:s.party.includes('lohen')?2:1};
 s.phase='battle';s.shield=0;
 for(const id of s.party){const item=EQUIPMENT[s.heroes[id].equipment.accessory];s.shield+=item?.startShield||0;}
 if(teaching){s.tutorial.chapter=s.node===0?1:2;s.tutorial.step=s.node===0?'cost':'partner-select';if(s.node===2){s.support=Math.max(2,s.support);for(const e of s.battle.enemies)e.hp=e.maxHp=22;}}
 if(teaching&&s.node===0){
  for(const [index,key] of ['l_pierce','l_guard','l_strike','l_strike','l_strike'].entries()){
   const at=s.battle.draw.findIndex(c=>c.key===key);
   const c=at<0?makeCard(s,'lohen',key,'lesson-'+index):s.battle.draw.splice(at,1)[0];
   s.battle.hand.push(c);emit(events,'draw','훈련 카드를 받았습니다.',{uid:c.uid,hero:c.owner});
  }
 }else draw(s,5,events);plans(s);emit(events,'battle','전투가 시작되었습니다.');
 for(const k of kinds)if(!s.collection.codex.includes(k))s.collection.codex.push(k);
}
export function healingNeeds(s){
 const mental=s.party.some(id=>s.heroes[id].stress>0),hp=Math.max(0,s.maxHp-s.hp),injured=Object.keys(s.heroes).filter(id=>Object.values(s.heroes[id].body).some(stage=>stage>0)),retired=Object.keys(s.heroes).filter(id=>s.heroes[id].retired);
 return {hp,injured,retired,mental,needed:hp>0||injured.length>0||retired.length>0||mental};
}
function restoreBodies(s){s.hp=Math.min(s.maxHp,s.hp+20);for(const h of Object.values(s.heroes)){h.body=Object.fromEntries(PARTS.map(p=>[p,0]));h.retired=false;}}
export function rollEventOffer(s){const offer=clone(choose(s,EVENTS));for(const c of offer.choices){const premium=c.benefit.elite||c.benefit.kind==='gold'&&c.benefit.amount>=40;if(!premium)c.cost=clone(choose(s,[{},{},{hp:6},{stress:7}]));if(c.benefit.kind==='equipment'&&!c.benefit.item)c.benefit.item=gearDrop(s,!!c.benefit.elite);}return offer;}
function enterNode(s,events){
 const n=currentNode(s);s.eventResult=null;s.lastReward=null;s.eventOffer=null;if(n.type==='event')s.eventOffer=rollEventOffer(s);if(n.type==='camp'){s.campActions=[];s.upgradeOffer=random(s)<LOOT_RULES.baseRefinement?makeUpgradeOffer(s,'camp','camp'):null;}if(n.type==='recruit')s.recruitLine=0;
 if(n.type==='battle'||n.type==='elite')return beginBattle(s,n.enemies,events);
 s.phase=n.type;
 if(n.type==='base'){
  const baseId='route-'+s.node;if(s.baseId!==baseId||!s.baseInitialized){s.baseId=baseId;s.baseInitialized=true;s.careUsed=false;s.upgradeOffer=random(s)<LOOT_RULES.baseRefinement?makeUpgradeOffer(s,'base','base'):null;}s.collection.unlocked=[...new Set([...s.collection.unlocked,...Object.keys(HEROES)])];saveCheckpoint(s,true);
  emit(events,'base','거점에 도착했습니다. 생명의 불꽃에서 회복 행동을 선택할 수 있습니다.');
 }
}
function stress(s,id,amount,events,tag=''){
 const h=s.heroes[id];if(!h||h.retired||h.breakdown)return;
 const item=EQUIPMENT[h.equipment.accessory];let value=Math.ceil(amount*(1-(item?.stressReduction||0)));
 if(HEROES[id].weakness===tag)value=Math.ceil(value*1.35);
 if(h.buffs.cover){value=Math.max(0,value-h.buffs.cover);delete h.buffs.cover;}
 h.stress=Math.min(100,h.stress+value);if(value)emit(events,'stress',`${HEROES[id].name}의 정신 부담 +${value}`,{hero:id,amount:value});
 if(h.stress>=100){h.breakdown={type:choose(s,Object.keys(BREAKDOWNS)),failures:0};emit(events,'breakdown',`${HEROES[id].name} · ${BREAKDOWNS[h.breakdown.type].name}`,{hero:id});const key=`breakdown-${id}`;if(!s.collection.cutins.includes(key))s.collection.cutins.push(key);}
}
function injury(s,id,part,events){
 const h=s.heroes[id];if(!h||h.retired)return;part=PARTS.includes(part)?part:choose(s,[h.body.leftLeg,h.body.rightLeg].some(n=>n>=2)?['eyes','leftArm','rightArm']:PARTS);
 if(h.body[part]>=3)return;h.body[part]=Math.min(3,h.body[part]+1);emit(events,'injury',`${HEROES[id].name}의 신체 손상이 진행됩니다.`,{hero:id,part,stage:h.body[part]});
 if(part==='eyes'&&h.body.eyes===3&&s.battle)for(const zone of ['hand','draw','discard','exhaust'])for(const c of s.battle[zone])if(c.owner===id)bindBlind(s,c,true);
 if(h.body[part]>=2)for(const ally of active(s))if(ally!==id)stress(s,ally,4,events);
 if(Object.values(h.body).filter(x=>x>=3).length>=2){h.retired=true;emit(events,'retire',`${HEROES[id].name} · 전투 이탈. 거점에서 회복하면 복귀합니다. 파트너 지원은 유지됩니다.`,{hero:id});if(s.battle)for(const zone of ['hand','draw','discard','exhaust'])s.battle[zone]=s.battle[zone].filter(c=>c.owner!==id);for(const ally of active(s))stress(s,ally,10,events);}
 if(!active(s).length)defeat(s,events);
}
function settleRaid(s,events,reason='turnLimit'){
 const run=s.raidRun,raid=s.collection.raid;
 if(!run||!raid)return;
 raid.recordStats??={};
 const st=raid.recordStats[run.recordId]||{triesUsed:0,maxTries:RAID_BOSS_DEFAULT.maxTriesPerRecord,bestDamage:0};
 const prevBest=st.bestDamage||0;
 st.triesUsed=Math.min(st.maxTries||3,(st.triesUsed||0)+1);
 st.bestDamage=Math.max(prevBest,run.damageDealt||0);
 raid.recordStats[run.recordId]=st;
 raid.totalDamage=Object.values(raid.recordStats).reduce((sum,x)=>sum+(x.bestDamage||0),0);
 const bossDefeated=raid.totalDamage>=raid.bossMaxHp;
 if(bossDefeated&&!raid.clearedThisCycle){raid.clears=(raid.clears||0)+1;raid.clearedThisCycle=true;}
 const rec=(s.collection.records||[]).find(r=>r.id===run.recordId);
 s.lastRaidResult={
  recordId:run.recordId,label:rec?.label||'원정 기록',reason,
  damageDealt:run.damageDealt||0,prevBest,newBest:st.bestDamage,improved:st.bestDamage>prevBest,
  triesUsed:st.triesUsed,maxTries:st.maxTries||3,
  totalDamage:raid.totalDamage,bossMaxHp:raid.bossMaxHp,bossDefeated,
 };
 s.raidRun=null;s.battle=null;s.mode='route';s.phase='lobby';
 emit(events,bossDefeated?'raidClear':'raidEnd',bossDefeated?`보스 레이드 토벌 완료! 누적 피해 ${raid.totalDamage} / ${raid.bossMaxHp}`:`레이드 트라이 종료 · 이번 피해 ${run.damageDealt} (최고 ${st.bestDamage})`,s.lastRaidResult);
}
function defeat(s,events){if(s.mode==='raid'&&s.raidRun){settleRaid(s,events,'defeat');return;}s.phase='defeat';emit(events,'defeat','더는 전선을 유지할 수 없습니다. 시간의 흐름이 흔들립니다.');}
function damageEnemy(s,e,amount,owner,events,extraWard=0){
 if(!e||e.hp<=0)return;let value=Math.max(0,Math.round(amount*(e.vulnerable?1.25:1)));
 if(e.kind==='keeper'&&owner){if(e.observed===owner)e.observedCount++;else{e.observed=owner;e.observedCount=1;}if(e.observedCount>=3)value=Math.ceil(value*.7);}
 if(e.hitWard>0){e.hitWard--;value=Math.max(1,Math.floor(value*.35));if(!e.hitWard){e.stun=1;emit(events,'break','의태의 공허 장막이 벗겨집니다.',{enemy:e.id});}}
 if(e.ward>0){
  const removed=Math.min(e.ward,value+extraWard);e.ward-=removed;value=Math.max(0,value-Math.max(0,removed-extraWard));
  if(e.ward===0){e.stun=1;if(e.kind==='angler'){for(const other of livingEnemies(s))if(other.kind==='angler'){other.ward=0;other.stun=1;}emit(events,'break','연결된 장막이 함께 무너집니다.',{enemy:e.id});}else emit(events,'break','장막을 파괴해 행동을 중단시켰습니다.',{enemy:e.id});s.support=Math.min(6,s.support+1);}
 }
 e.hp=Math.max(0,e.hp-value);emit(events,'damage',`${e.name}에게 피해 ${value}`,{hero:owner,enemy:e.id,amount:value});
 if(s.mode==='raid'&&s.raidRun&&e.kind===s.collection.raid.bossKind){s.raidRun.damageDealt=(s.raidRun.damageDealt||0)+value;}
 if(e.hp===0){
  if((e.kind==='wanderer'||e.kind==='hunter')&&!e.echo){e.echo=true;e.hp=6;e.maxHp=Math.max(e.maxHp,6);e.ward=0;emit(events,'echo',`${e.name}의 잔향이 드러납니다.`,{enemy:e.id});}
  else{emit(events,'kill',`${e.name} 제압`,{enemy:e.id});if(e.kind==='angler')for(const boss of livingEnemies(s))if(boss.kind==='nightmare')boss.ward=Math.max(0,boss.ward-12);
   if(e.kind==='star'){const boss=livingEnemies(s).find(x=>x.kind==='sentinel');if(boss&&!livingEnemies(s).some(x=>x.kind==='star')){boss.stun=1;emit(events,'break','별이 사라져 심판을 저지했습니다.',{enemy:boss.id});}}
  }
 }
 plans(s);
}
function checkVictory(s,events){
 if(s.phase!=='battle'||livingEnemies(s).length)return;
 if(s.mode==='raid'&&s.raidRun){settleRaid(s,events,'victory');return;}
 const reward=12+(s.party.includes('jahoda')?4:0)+(s.mode==='challenge'?8:0);s.battlesWon++;s.support=Math.min(6,s.support+1);
 const elite=currentNode(s).type==='elite'||s.mode==='challenge',loot=s.tutorial?.active?{}:rollLoot(s,elite);s.phase='reward';s.lastReward={gold:reward+(elite?12:0),xp:10,pending:true,...loot};emit(events,'victory',`전투 승리 · 보급품을 수령하거나 넘어갈 수 있습니다.`);if(s.tutorial?.active){settleReward(s,false,events);s.node=s.tutorial.chapter===1?1:3;s.selectedStage=null;s.battle=null;s.tutorial.step='recruit';enterNode(s,events);}
}
function attackBonus(s,id){const h=s.heroes[id],item=EQUIPMENT[h.equipment.weapon];let value=(h.level-1)*2+(item?.attack||0)+(h.buffs.firstAttack?(item?.firstAttack||0):0);value=Math.floor(value*armEffectRate(h));return value;}
function pushUndo(s){
 if(s.phase!=='battle'||!s.battle||s.tutorial?.active)return;
 const bCopy={...s.battle};delete bCopy.undoStack;
 const snap=clone({hp:s.hp,shield:s.shield,support:s.support,rng:s.rng,heroes:s.heroes,battle:bCopy});
 (s.battle.undoStack??=[]).push(snap);
 if(s.battle.undoStack.length>6)s.battle.undoStack.shift();
}
export function predictCardEffect(state,cardUid,enemyId=null){
 if(state.phase!=='battle'||!state.battle)return null;
 const c=state.battle.hand.find(x=>x.uid===cardUid),view=c&&cardInfo(state,c);if(!view||view.blind||view.breakdown)return null;
 const res={type:view.type,target:view.target,cost:view.cost,injured:view.injuryRate<1,injuryPct:Math.round(view.injuryRate*100),enemies:{}};
 const targets=view.target==='enemy'?(enemyId?livingEnemies(state).filter(e=>e.id===enemyId):livingEnemies(state)):[null];
 for(const target of targets){
  // The real interpreter runs on an isolated probe. Forecasts cannot consume live RNG,
  // create cards in the live deck, or drift from pierce / counter / shield scaling rules.
  const probe=clone(state);probe.tutorial.active=false;probe.battle.undoStack=[];probe.battle.ap=Math.max(probe.battle.ap,view.cost);
  const outcome=act(probe,{type:'play',uid:cardUid,target:view.target==='ally'?c.owner:target?.id});if(!outcome.ok)continue;
  if(['guard','counter'].includes(view.type))res.shieldGain=probe.shield-state.shield;
  if(probe.hp>state.hp)res.healGain=probe.hp-state.hp;
  if(view.type!=='attack')continue;
  for(const enemy of view.target==='all'?livingEnemies(state):[target]){
   const events=outcome.events.filter(e=>e.enemy===enemy.id),kill=events.some(e=>e.type==='kill'),next=probe.battle?.enemies.find(e=>e.id===enemy.id);
   res.enemies[enemy.id]={damage:events.filter(e=>e.type==='damage').reduce((n,e)=>n+e.amount,0),wardBroken:events.some(e=>e.type==='break'),willEcho:!kill&&events.some(e=>e.type==='echo'),willKill:kill,predictedHp:next?.hp??0};
  }
 }
 return res;
}

function play(s,a,events){
 const b=s.battle;if(s.phase!=='battle')reject('지금은 카드를 사용할 수 없습니다.');if(b.chooseDiscard)reject('먼저 버릴 카드를 선택하세요.');
 const index=b.hand.findIndex(c=>c.uid===a.uid);if(index<0)reject('손패에 없는 카드입니다.');const c=b.hand[index],h=s.heroes[c.owner],view=cardInfo(s,c),info=view.blind?view.actual:view,key=info.effectiveKey||c.key;
 if(h.retired)reject('이탈한 동료의 카드는 사용할 수 없습니다.');if(b.ap<info.cost)reject('행동력이 부족합니다.');let target;
 if(info.target==='enemy'){target=livingEnemies(s).find(e=>e.id===a.target);if(!target&&view.blind)target=choose(s,livingEnemies(s));if(!target)reject('공격할 적을 선택하세요.');}
 if(info.target==='ally'&&view.blind&&!s.party.includes(a.target))a={...a,target:choose(s,active(s))};
 if(info.target==='ally'&&(!s.party.includes(a.target)||s.heroes[a.target].retired))reject('엄호할 동료를 선택하세요.');
 pushUndo(s);b.ap-=info.cost;b.spent+=info.cost;b.hand.splice(index,1);const dest=!info.breakdown&&info.exhaust?'exhaust':'discard';b[dest].push(c);
 emit(events,'card',`${HEROES[c.owner].name} · ${info.name}`,{hero:c.owner,card:key,uid:c.uid,destination:dest,blind:!!view.blind,actualCost:info.cost});
 if(info.type==='breakdown'){
  const bd=h.breakdown,success=bd.failures>=10||random(s)<recoveryChance(h);
  if(success){
   h.breakdown=null;h.stress=40;h.buffs.awaken=6;
   emit(events,'recover',`${HEROES[c.owner].name} · 붕괴 극복`,{hero:c.owner});
   emit(events,'awaken',`${HEROES[c.owner].name} · 극복의 잔불 (+6)`,{hero:c.owner});
   if(s.party.includes('lohen')){s.shield+=4;emit(events,'shield','바르카 패시브 · 공용 보호막 +4',{hero:'lohen',amount:4});}
   if(s.party.includes('durin')){b.ap=Math.min(6,b.ap+1);emit(events,'resource','알베도 패시브 · 행동력 +1',{hero:'durin'});}
   if(s.party.includes('illuga')){h.buffs.flins=(h.buffs.flins||0)+5;}
   if(s.party.includes('jahoda')){draw(s,1,events);}
  }
  else{
   bd.failures++;const power=danger(h);emit(events,'collapseFail',`극복 실패 ${bd.failures}/10 · 위험 강도 ${power}`,{hero:c.owner});
   if(random(s)<.65){
    if(bd.type==='despair'){b.morale=Math.min(3,(b.morale||0)+power);emit(events,'morale','아군의 사기가 흔들립니다.');}
    if(bd.type==='distrust'){s.hp=Math.max(0,s.hp-(2+power*2));emit(events,'friendlyFire','불신이 아군을 겨눕니다.',{amount:2+power*2,hero:c.owner});}
    if(bd.type==='panic'){const allies=active(s).filter(id=>id!==c.owner);if(allies.length)stress(s,choose(s,allies),3+power*3,events);}
    if(bd.type==='frenzy'){const e=choose(s,livingEnemies(s));if(e)damageEnemy(s,e,7+power*3,c.owner,events);if(random(s)<.15*power)injury(s,c.owner,null,events);}
   }
  }
 }else{
  if(info.type==='attack'){
   const targets=info.target==='all'?[...livingEnemies(s)]:[target];let amount=info.amount+Math.floor(Math.min(info.effects?.shieldDamageCap||0,Math.floor(s.shield*(info.effects?.shieldDamage||0)))*info.injuryRate)+attackBonus(s,c.owner)+(h.buffs.focus||0)+(h.buffs.flins||0)+(h.buffs.awaken||0)-Math.min(3,b.morale||0);delete h.buffs.awaken;
   const totalPierce=Math.floor((info.pierce||0)*(info.injuryRate||1))+(info.effects?.extraPierce||0)+(h.buffs.nextPierce||0);
   for(const e of targets){damageEnemy(s,e,Math.max(1,amount),c.owner,events,totalPierce);if(info.effects?.vuln&&e.hp>0)e.vulnerable=Math.max(e.vulnerable||0,info.effects.vuln);}
   delete h.buffs.nextPierce;delete b.nextAttackDiscount;
   if(h.buffs.counter){const e=livingEnemies(s).find(x=>x.id===target?.id)||livingEnemies(s)[0];if(e)damageEnemy(s,e,h.buffs.counter,c.owner,events);delete h.buffs.counter;}
   delete h.buffs.focus;delete h.buffs.flins;h.buffs.firstAttack=false;
   if(c.owner==='durin'&&h.level>=3&&info.cost>=2)h.buffs.discount=true;else if(c.owner==='durin'&&h.buffs.discount)delete h.buffs.discount;
  }
  if(info.type==='guard'||info.type==='counter'){let amount=info.amount+Math.floor((h.level-1)*info.injuryRate)+(h.buffs.awaken||0);delete h.buffs.awaken;s.shield+=amount;emit(events,'shield',`공용 보호막 +${amount}`,{hero:c.owner,amount});}
  if(info.type==='focus')h.buffs.focus=(h.buffs.focus||0)+info.amount;
  if(info.type==='cover'){for(const id of info.effects?.coverAll?active(s):[a.target]){s.heroes[id].buffs.cover=info.amount;if(s.party.includes('illuga'))s.heroes[id].stress=Math.max(0,s.heroes[id].stress-2);emit(events,'cover',`${HEROES[id].name}을 엄호합니다.`,{hero:id});}}
  if(info.type==='energy')b.ap=Math.min(6,b.ap+info.amount);
  if(info.type==='draw'){draw(s,info.amount,events);b.chooseDiscard=info.discard===0?0:Math.min(1,b.hand.length);}
  applyCardExtras(s,c,info,events);

 }
 if(s.tutorial?.active){if(s.tutorial.step==='attack-use')s.tutorial.step='defense-select';else if(s.tutorial.step==='defense-use')s.tutorial.step='end-turn';}
 if(b.spent>=3&&!b.supportCharged){s.support=Math.min(6,s.support+1);b.supportCharged=true;}
 if(s.hp<=0)defeat(s,events);else{plans(s);checkVictory(s,events);}
}
function applyCardExtras(s,c,info,events){
 const b=s.battle,h=s.heroes[c.owner],e=info.effects||{},key=info.effectiveKey||c.key,turnKey=c.owner+':'+key;
 b.effectUsed??={};b.generatedUsed??={};b.rewardUsed??={};
 const proc=!b.effectUsed[turnKey],killed=events.some(x=>x.type==='kill');
 if(e.shield){s.shield+=e.shield;emit(events,'shield',`공용 보호막 +${e.shield}`,{hero:c.owner,amount:e.shield});}
 if(e.focus)h.buffs.focus=(h.buffs.focus||0)+e.focus;if(e.nextPierce)h.buffs.nextPierce=e.nextPierce;
 if(e.counter)h.buffs.counterReady=e.counter;
 if(e.heal&&proc){b.effectUsed[turnKey]=true;const n=Math.min(e.heal,s.maxHp-s.hp);s.hp+=n;emit(events,'cardHeal',`공용 체력 +${n}`,{hero:c.owner,amount:n});}
 if(e.calm)h.stress=Math.max(0,h.stress-e.calm);if(e.support)s.support=Math.min(6,s.support+e.support);
 if(proc){
  if(e.draw)draw(s,e.draw,events);
  const refund=(e.refund||0)+(killed?(e.killRefund||0):0);if(refund){b.ap=Math.min(6,b.ap+refund);emit(events,'resource',`행동력 +${refund}`,{hero:c.owner,amount:refund});}
  // An unsuccessful kill condition remains available for a later copy this turn.
  if(e.draw||e.refund||e.killRefund&&killed)b.effectUsed[turnKey]=true;
 }
 if(e.discountNext)b.nextAttackDiscount=1;
 if(e.killGold&&killed&&!b.rewardUsed[turnKey]){s.gold+=e.killGold;b.rewardUsed[turnKey]=true;emit(events,'gold',`숨겨 둔 보수 · 모라 +${e.killGold}`,{amount:e.killGold});}
 if(e.create&&!b.generatedUsed[turnKey]){if(b.hand.length<10){b.generatedUsed[turnKey]=true;const generated={owner:c.owner,key:e.create,uid:'generated-'+c.owner+'-'+e.create+'-'+b.turn};bindBlind(s,generated,true);b.hand.push(generated);emit(events,'createCard',`${CARDS[e.create].name} 생성`,{hero:c.owner,uid:generated.uid});}}
 if(info.spark==='ember_support')s.support=Math.min(6,s.support+1);
 if(info.spark==='ember_calm')h.stress=Math.max(0,h.stress-4);
 const sparkGate='spark:'+c.owner;
 if(info.spark==='ember_draw'&&!b.effectUsed[sparkGate+':draw']){b.effectUsed[sparkGate+':draw']=true;draw(s,1,events);}
 if(info.spark==='ember_mercy'&&!b.effectUsed[sparkGate+':heal']){b.effectUsed[sparkGate+':heal']=true;const n=Math.min(3,s.maxHp-s.hp);s.hp+=n;emit(events,'cardHeal',`잔불의 온기 · 체력 +${n}`,{hero:c.owner,amount:n});}
}
function support(s,a,events){
 if(s.phase!=='battle')reject('전투 중에 지원을 요청할 수 있습니다.');const b=s.battle;let id=a.hero;
 if(!HEROES[id])id=Object.keys(HEROES).find(x=>HEROES[x].partner===a.hero);
 if(!s.party.includes(id))reject('편성된 동료의 파트너만 지원할 수 있습니다.');if(s.support<2)reject('지원 게이지가 부족합니다.');if(b.supportUsed)reject('파트너 지원은 턴마다 한 번 사용할 수 있습니다.');
 const e=livingEnemies(s).find(x=>x.id===a.target);if((id==='illuga'||id==='jahoda')&&!e)reject('지원 공격의 대상을 선택하세요.');
 pushUndo(s);s.support-=2;b.supportUsed=true;if(s.tutorial?.active&&s.tutorial.step==='partner-use')s.tutorial.step='free';emit(events,'support',`${HEROES[id].partnerName}의 지원`,{hero:id,partner:HEROES[id].partner});const cutin=`support-${HEROES[id].partner}`;if(!s.collection.cutins.includes(cutin))s.collection.cutins.push(cutin);
 if(id==='lohen'){const enemies=[...livingEnemies(s)];for(const x of enemies)damageEnemy(s,x,enemies.length===1?24:16,id,events,enemies.length===1?6:0);}
 if(id==='durin'){s.shield+=13;b.ap=Math.min(6,b.ap+1);emit(events,'shield','알베도의 보호막 +13 · 행동력 +1',{hero:id,amount:13});}
 if(id==='illuga'){damageEnemy(s,e,20,id,events);s.heroes.illuga.buffs.flins=7;}
 if(id==='jahoda'){damageEnemy(s,e,17,id,events);if(e.hp>0)e.vulnerable=2;}
 plans(s);checkVictory(s,events);
}
function ultimate(s,a,events){
 if(s.phase!=='battle')reject('전투 중에 필살기를 사용할 수 있습니다.');const id=a.hero,b=s.battle,h=s.heroes[id];
 if(!HEROES[id]||!s.party.includes(id))reject('출전한 전투원을 선택하세요.');if(h.retired)reject('이탈한 전투원은 필살기를 사용할 수 없습니다.');if(h.breakdown)reject('붕괴 상태에서는 필살기를 사용할 수 없습니다.');if(b.chooseDiscard)reject('먼저 버릴 카드를 선택하세요.');if(b.ultimates?.[id])reject('이 전투에서 이미 필살기를 사용했습니다.');if(s.support<3)reject('필살기는 지원 게이지 3이 필요합니다.');
 const target=livingEnemies(s).find(e=>e.id===a.target);if(id==='lohen'&&!target)reject('필살기로 공격할 적을 선택하세요.');
 pushUndo(s);s.support-=3;(b.ultimates??={})[id]=true;emit(events,'ultimate',`${HEROES[id].name} · 필살기`,{hero:id});const cutin=`ultimate-${id}`;if(!s.collection.cutins.includes(cutin))s.collection.cutins.push(cutin);
 if(id==='lohen')damageEnemy(s,target,34,id,events,10);
 if(id==='durin')for(const e of [...livingEnemies(s)])damageEnemy(s,e,22,id,events);
 if(id==='illuga'){s.shield+=25;h.buffs.counterReady=12;emit(events,'shield','공용 보호막 +25 · 방어 성공 시 추가 타격 12 준비',{hero:id,amount:25});}
 if(id==='jahoda'){b.ap=Math.min(6,b.ap+2);draw(s,Math.max(0,2-[h.body.leftArm,h.body.rightArm].filter(n=>n===3).length),events);emit(events,'resource','행동력 +2 · 카드 드로우',{hero:id});}
 plans(s);checkVictory(s,events);
}
function endTurn(s,events){
 if(s.phase!=='battle')reject('전투 중이 아닙니다.');const b=s.battle;if(b.chooseDiscard)reject('먼저 버릴 카드를 선택하세요.');
 for(const e of [...livingEnemies(s)]){
  if(s.phase!=='battle')break;const it=e.intent;if(e.hp<=0)continue;if(e.stun){e.stun--;e.turn++;continue;}
  if(it.restore&&e.echo){e.echo=false;e.hp=Math.ceil(e.maxHp*.35);emit(events,'echoRestore','잔향이 육체를 복원합니다.',{enemy:e.id});}
  emit(events,'enemyAction',`${e.name} · ${it.name}`,{enemy:e.id,hero:it.target,name:it.name,damage:it.damage||0,stress:it.stress||0});
  const blocked=Math.min(s.shield,it.damage||0);s.shield-=blocked;const taken=Math.max(0,(it.damage||0)-blocked);s.hp=Math.max(0,s.hp-taken);
  if(it.damage)emit(events,'enemyAttack',`${e.name} · ${it.name}: 피해 ${taken}`,{enemy:e.id,hero:it.target,amount:taken,blocked});
  if(blocked)for(const id of active(s)){const h=s.heroes[id];if(h.buffs.counterReady){h.buffs.counter=h.buffs.counterReady;delete h.buffs.counterReady;}}
  if(it.stress&&(!it.damage||taken>0))stress(s,it.target,it.stress,events,it.tag);
  if(it.corrosion)b.corrosion=Math.max(b.corrosion,it.corrosion);
  if(taken>0&&injuryChance(s.heroes[it.target],!!it.injury)>0&&random(s)<injuryChance(s.heroes[it.target],!!it.injury))injury(s,it.target,null,events);
  if(it.summon&&livingEnemies(s).filter(x=>x.kind==='angler').length<2){const angler=makeEnemy(s,'angler',b.turn*10);b.enemies.push(angler);if(!s.collection.codex.includes('angler'))s.collection.codex.push('angler');emit(events,'summon','어둠의 낚시꾼이 나타납니다.');}
  if(it.stars&&!livingEnemies(s).some(x=>x.kind==='star')){b.enemies.push(makeEnemy(s,'star',b.turn*10),makeEnemy(s,'star',b.turn*10+1));if(!s.collection.codex.includes('star'))s.collection.codex.push('star');emit(events,'summon','관측의 별 둘이 펼쳐집니다.');}
  e.turn++;if(e.vulnerable)e.vulnerable--;if(s.hp<=0)defeat(s,events);
 }
 if(s.phase!=='battle')return;if(s.tutorial?.active&&s.tutorial.step==='end-turn')s.tutorial.step='refill';
 if(b.corrosion){s.hp=Math.max(0,s.hp-2);b.corrosion--;emit(events,'corrosion','침식 · 공용 체력 -2',{amount:2});if(s.hp<=0){defeat(s,events);return;}}
 s.shield=0;for(const id of s.party){const h=s.heroes[id];if(h.buffs.focus)delete h.buffs.focus;delete h.buffs.counterReady;delete h.buffs.nextPierce;}
 for(const c of b.hand)emit(events,'discard',`${HEROES[c.owner].name}의 카드를 버립니다.`,{uid:c.uid,hero:c.owner});b.discard.push(...b.hand.splice(0));b.turn++;b.ap=3;b.supportUsed=false;b.spent=0;b.supportCharged=false;b.recovered=false;b.effectUsed={};delete b.nextAttackDiscount;b.undoStack=[];
 if(s.mode==='raid'&&s.raidRun&&b.turn>(s.raidRun.maxTurns||6)){settleRaid(s,events,'turnLimit');return;}if(b.morale)b.morale--;draw(s,5,events);plans(s);emit(events,'turn',`${b.turn}번째 턴`);
}
function settleReward(s,skip,events){
 const r=s.lastReward;if(!r?.pending)return;
 r.pending=false;r.skipped=!!skip;
 if(skip){emit(events,'rewardSkipped','보급품을 남겨 두고 다음 길을 살핍니다.');return;}
 s.gold+=r.gold;for(const item of r.equipment||[])(s.inventory??=[]).push(item);if(r.equipment?.length)s.pendingEquip=[...(s.pendingEquip||[]),...r.equipment];
 for(const id of s.party){const h=s.heroes[id];h.xp+=r.xp;const cap=s.mode==='challenge'?5:3;while(h.xp>=20&&h.level<cap){h.xp-=20;h.level++;emit(events,'level',`${HEROES[id].name} 레벨 ${h.level}`,{hero:id});}}
 emit(events,'rewardClaimed',`보급품 수령 · 모라 ${r.gold} · 경험치 ${r.xp}`);
}
export function travelOptions(s){return s.phase==='travel'?stageChoices(s,ROUTE):[];}
function selectStage(s,id,events){
 if(s.phase!=='travel')reject('이동할 지점을 선택하는 중이 아닙니다.');const choice=travelOptions(s).find(n=>n.id===id);if(!choice)reject('연결된 다음 지점을 선택하세요.');
 (s.journey??=[]).push({id:choice.id,name:choice.name,node:choice.node??s.node,mode:choice.mode,stage:choice.stage});s.journey=s.journey.slice(-30);s.battle=null;
 if(choice.type==='ending'){s.phase='ending';if(!s.collection.endings.includes('first-front'))s.collection.endings.push('first-front');s.claimedEnding=true;emit(events,'ending','첫 전선에 다시 바람이 흐릅니다.');return;}
 if(choice.mode==='challenge'){s.challengeStage=choice.stage;s.selectedStage=null;s.hp=Math.min(s.maxHp,s.hp+25);beginBattle(s,choice.enemies,events);return;}
 if(choice.id==='return-base'){returnFromFarm(s);saveCheckpoint(s,false);}else{s.mode=choice.mode;s.node=choice.node;s.selectedStage={...choice};enterNode(s,events);}
 emit(events,'travel',`${choice.name}에 도착했습니다.`);
}
function rewardAdvance(s,events){
 if(s.phase!=='reward')reject('다음 경로로 이동할 수 없습니다.');settleReward(s,false,events);s.selectedStage=null;
 if(s.mode==='farm'){returnFromFarm(s);saveCheckpoint(s,false);emit(events,'base','보급을 정산하고 거점으로 돌아왔습니다. 회복하려면 생명의 불꽃을 선택하세요.');return;}
 if(s.mode==='challenge'){
  s.challengeStage++;if(s.challengeStage>=3){s.phase='ending';s.battle=null;if(!s.collection.endings.includes('first-front'))s.collection.endings.push('first-front');s.claimedEnding=true;emit(events,'ending','첫 전선에 다시 바람이 흐릅니다. 개발판 도전 완료.');return;}
  s.hp=Math.min(s.maxHp,s.hp+25);beginBattle(s,s.challengeStage===1?['keeper']:['sentinel'],events);return;
 }
 s.node=Math.min(ROUTE.length-1,s.node+1);s.battle=null;enterNode(s,events);
}
export function canCare(s,id){return s.phase==='base'&&!s.careUsed&&s.party.includes(id)&&!!s.heroes[id]?.breakdown;}
function availableDiscoveries(s,owner){
 const h=s.heroes[owner],known=new Set([...(h.legacyLoadout?LEGACY_STARTERS:STARTERS)[owner],...h.acquired]);
 return DISCOVERIES[owner].filter(key=>!known.has(key));
}
function learnCard(s,owner,key){
 s.heroes[owner].acquired.push(key);
 return {owner,key,uid:owner+'-awaken-'+key};
}
function battleAwakening(s,owner,events){
 if(s.phase!=='battle'||s.tutorial?.active||s.battle.awakened||s.heroes[owner].breakdown)return;
 const pool=availableDiscoveries(s,owner);
 if(!pool.length||random(s)>=.15)return;
 const key=choose(s,pool),c=learnCard(s,owner,key),b=s.battle;
 b.awakened=true;bindBlind(s,c,true);
 if(b.hand.length<10){b.hand.push(c);emit(events,'draw','각성 카드를 받았습니다.',{uid:c.uid,hero:owner});}
 else b.draw.push(c);
 emit(events,'awakening',HEROES[owner].name+' · 전술 각성 — '+CARDS[key].name+' 획득',{hero:owner,card:key});
}
export function makeUpgradeOffer(s,source='event',returnPhase='reward'){
 const pool=s.party.flatMap(owner=>[...new Set([...ownedDeck(s,owner).map(c=>c.key),...availableDiscoveries(s,owner)])].filter(key=>!CARDS[key].debuff&&!CARDS[key].generated&&!s.heroes[owner].upgrades[key]).map(key=>({owner,key})));
 const sparkChance=source==='elite'?100:(s.party.includes('durin')?30:15);
 const candidates=shuffle(s,pool).slice(0,3).map((c,idx)=>{
  const roll=Math.abs((s.rng+idx*37+s.node*13))%100;
  if(idx===0&&roll<sparkChance){
   const sparkBranch=INSIGHT_BRANCHES[Math.abs(s.rng+idx)%4],base=CARDS[c.key],form={...base,...insightSpec(c.key,sparkBranch)},pool=compatibleSparkIds(form),spark=pool[Math.abs(s.rng+idx)%pool.length];
   return {...c,spark,sparkBranch};
  }
  return c;
 });
 return candidates.length?{id:`${source}-${s.node}-${s.rng}`,source,returnPhase,candidates}:null;
}
function gearDrop(s,elite=false){const keys=Object.keys(EQUIPMENT).filter(key=>(EQUIPMENT[key].rarity==='elite')===elite);return choose(s,keys);}
export function rollLoot(s,elite=false){return {elite,equipment:random(s)<(elite?LOOT_RULES.eliteEquipment:LOOT_RULES.normalEquipment)?[gearDrop(s,elite&&random(s)<LOOT_RULES.eliteRarity)]:[],upgradeOffer:random(s)<(elite?LOOT_RULES.eliteUpgrade:LOOT_RULES.normalUpgrade)?makeUpgradeOffer(s,elite?'elite':'loot','travel'):null};}
function returnFromFarm(s){const loc=s.farmReturn||{node:7,mode:'route',selectedStage:null};s.mode=loc.mode;s.node=loc.node;s.selectedStage=loc.selectedStage;s.farmReturn=null;s.phase='base';s.battle=null;s.upgradeOffer=null;}
function finishRecruit(s,events){s.recruitNotice=null;s.battle=null;if(s.tutorial?.active){s.selectedStage=null;if(s.party.length<3){s.node=2;beginBattle(s,['trainingSlime','trainingSlime'],events);}else{s.tutorial={...s.tutorial,active:false,completed:true,step:'complete'};s.node=7;enterNode(s,events);}}else{s.phase='reward';s.lastReward=null;}}
function resolveEvent(s,id,events){const choice=s.eventOffer?.choices.find(c=>c.id===id);if(!choice)reject('사건의 선택지를 확인하세요.');const {benefit:b,cost}=choice;s.eventResult={title:s.eventOffer.name,choice:choice.label,benefit:clone(b),cost:clone(cost)};s.lastReward=null;s.phase='reward';s.eventOffer=null;
 s.hp=Math.max(0,s.hp-(cost.hp||0));if(cost.stress)for(const id of s.party)stress(s,id,cost.stress,events);if(cost.curse){const hero=choose(s,s.party);for(let i=0;i<cost.curse;i++)s.heroes[hero].curses.push({key:'curse_echo',uid:`curse-${s.rng}-${s.node}-${s.heroes[hero].curses.length}`});}
 if(b.kind==='gold')s.gold+=b.amount;if(b.kind==='equipment'){const key=b.item||gearDrop(s,!!b.elite);s.inventory.push(key);s.eventResult.item=key;}if(b.kind==='upgrade'){s.upgradeOffer=makeUpgradeOffer(s,'event','reward');if(s.upgradeOffer)s.phase='refine';else{s.gold+=15;s.eventResult.fallback='각성 가능한 카드가 없어 15모라를 받았습니다.';}}if(b.kind==='remove'){s.removalOffer={source:'event'};s.phase='eventRemove';}
 emit(events,'event',choice.label,{benefit:b,cost});if(s.hp<=0)defeat(s,events);
}
function perform(s,a,events){
 if(['arrival','joinDialogue'].includes(s.phase)&&!['ackRecruit','joinNext','skipJoinDialogue','newGame'].includes(a.type))reject('합류 대화를 마친 뒤 진행하세요.');if(s.careDialogue&&!['careNext','calm','cancelCare','newGame'].includes(a.type))reject('정신 안정 대화를 마치거나 닫아 주세요.');
 const blocked=tutorialBlocked(s,a);if(blocked)reject(blocked);
 switch(a.type){
  case 'tutorialNext':if(!s.tutorial?.active||!['cost','partner-intro','refill'].includes(s.tutorial.step))reject('진행할 안내가 없습니다.');s.tutorial.step=s.tutorial.step==='cost'?'attack-select':s.tutorial.step==='refill'?'free':'partner-select';break;
  case 'tutorialSelect':{const t=s.tutorial;if(!t?.active)break;if(t.step==='attack-select'&&s.battle?.hand.some(c=>c.uid===a.uid&&c.key==='l_pierce'))t.step='attack-use';else if(t.step==='defense-select'&&s.battle?.hand.some(c=>c.uid===a.uid&&c.key==='l_guard'))t.step='defense-use';else if(t.step==='partner-select'&&a.hero==='lohen'&&a.kind==='support')t.step='partner-use';else reject('안내에 표시된 카드나 바르카를 선택하세요.');break;}
  case 'skipTutorial':if(!s.tutorial?.active||s.phase!=='battle')reject('진행 중인 조작 튜토리얼이 아닙니다.');s.node=s.party.length===1?1:3;s.selectedStage=null;s.lastReward=null;s.phase='recruit';s.battle=null;s.recruitLine=0;s.tutorial.step='recruit';break;
  case 'skipRecruitDialogue':if(s.phase!=='recruit')reject('지금은 지원 요청 대화가 아닙니다.');s.recruitLine=4;break;
  case 'ackRecruit':if(s.phase==='arrival'&&s.recruitNotice?.flow==='story'){s.phase='joinDialogue';s.recruitNotice.line=0;break;}if(!s.recruitNotice)reject('확인할 지원 응답이 없습니다.');const hero=s.recruitNotice.hero;s.recruitNotice=null;if(s.checkpoint?.recruitNotice?.hero===hero)s.checkpoint.recruitNotice=null;break;
  case 'start':if(s.phase!=='title')reject('이미 시작한 원정입니다.');enterNode(s,events);break;
  case 'advance':rewardAdvance(s,events);break;
  case 'claimReward':if(s.phase!=='reward')reject('받을 보상이 없습니다.');settleReward(s,!!a.skip,events);s.phase='travel';if(!a.skip&&s.lastReward?.upgradeOffer){s.upgradeOffer=clone(s.lastReward.upgradeOffer);s.upgradeOffer.returnPhase='travel';s.phase='refine';}break;
  case 'travel':selectStage(s,a.id,events);break;
  case 'recruitDialogue':if(s.phase!=='recruit')reject('지금은 지원 요청 대화가 아닙니다.');s.recruitLine=Math.min(4,(s.recruitLine||0)+1);break;
  case 'recruit':{
   if(s.tutorial?.active&&(s.recruitLine||0)<4)reject('대화를 마친 뒤 지원을 선택하세요.');if(s.phase!=='recruit'||!HEROES[a.hero]||a.hero==='lohen'||s.party.includes(a.hero)||s.party.length>=3)reject('지원 요청 대상을 선택하세요.');s.party.push(a.hero);s.recruitNotice={hero:a.hero,flow:'story',line:0};s.collection.unlocked=[...new Set([...s.collection.unlocked,a.hero])];s.phase='arrival';s.lastReward=null;s.battle=null;emit(events,'recruit',`지원 합류 · ${HEROES[a.hero].name}`,{hero:a.hero});break;
  }
  case 'joinNext':case 'skipJoinDialogue':{
   if(s.phase!=='joinDialogue'||!s.recruitNotice)reject('진행할 합류 대화가 없습니다.');const notice=s.recruitNotice,lines=JOIN_LINES[notice.hero];if(a.type==='skipJoinDialogue')notice.line=lines.length;else notice.line++;if(notice.line>=lines.length)finishRecruit(s,events);break;
  }
  case 'event':{
   if(s.phase==='event'&&s.eventOffer){resolveEvent(s,a.choice,events);break;}if(s.phase!=='event'||!['safe','risk'].includes(a.choice))reject('사건의 선택지를 확인하세요.');s.lastReward=null;
   if(a.choice==='safe'){s.gold+=8;s.eventResult={choice:'safe',gold:8};for(const id of s.party)s.heroes[id].stress=Math.max(0,s.heroes[id].stress-5);emit(events,'event','안전한 길에서 보급품을 수습했습니다.');}
   else{const die=1+Math.floor(random(s)*20),bonus=s.party.includes('jahoda')?3:1,success=die+bonus>=12;s.eventResult={choice:'risk',die,roll:die,bonus,total:die+bonus,dc:12,target:12,success,gold:success?25:8};s.gold+=success?25:8;if(!success){for(const id of s.party)stress(s,id,12,events,'의태');injury(s,choose(s,active(s)),null,events);}else s.hp=Math.min(s.maxHp,s.hp+10);emit(events,'dice',success?'균열 너머의 보급품을 확보했습니다.':'기괴한 잔향이 남았습니다.',s.eventResult);}
   s.phase='reward';break;
  }
  case 'camp':{
   if(s.phase!=='camp'||!['rest','prepare'].includes(a.choice))reject('야영의 선택지를 확인하세요.');if((s.campActions||[]).includes(a.choice))reject('이번 야영에서 이미 선택한 행동입니다.');(s.campActions??=[]).push(a.choice);s.lastReward=null;
   if(a.choice==='rest'){s.hp=Math.min(s.maxHp,s.hp+25);for(const id of s.party){const h=s.heroes[id];h.stress=Math.max(0,h.stress-25);}emit(events,'camp','따뜻한 불빛과 함께 체력과 정신을 추슬렀습니다.');}
   else{s.support=Math.min(6,s.support+2);s.gold+=10;for(const id of s.party)s.heroes[id].stress=Math.max(0,s.heroes[id].stress-10);emit(events,'camp','장비를 점검하고 다음 전투의 지원을 준비했습니다.');}break;
  }
  case 'play':{const owner=s.battle?.hand.find(c=>c.uid===a.uid)?.owner;play(s,a,events);if(owner)battleAwakening(s,owner,events);break;}
  case 'discard':{
   if(s.phase!=='battle'||!s.battle.chooseDiscard)reject('버릴 카드를 선택하는 중이 아닙니다.');const i=s.battle.hand.findIndex(c=>c.uid===a.uid);if(i<0)reject('손패에서 버릴 카드를 선택하세요.');const [c]=s.battle.hand.splice(i,1);s.battle.discard.push(c);s.battle.chooseDiscard--;emit(events,'discard','카드를 버렸습니다.',{uid:c.uid,hero:c.owner});break;
  }
  case 'endTurn':endTurn(s,events);break;
  case 'support':support(s,a,events);break;
  case 'ultimate':ultimate(s,a,events);break;
  case 'leaveCamp':if(s.phase!=='camp')reject('야영 중이 아닙니다.');s.phase='reward';s.lastReward=null;break;
  case 'removeCard':{if(!['base','camp'].includes(s.phase))reject('상점에서 카드를 제거할 수 있습니다.');if(!s.party.includes(a.hero))reject('편성된 전투원을 선택하세요.');const deck=ownedDeck(s,a.hero),c=deck.find(c=>c.uid===a.uid);if(!c)reject('보유한 카드를 선택하세요.');if(deck.length<=3)reject('전투원마다 최소 3장의 카드를 유지해야 합니다.');const cost=removalCost(s);if(s.gold<cost)reject('모라가 부족합니다.');s.gold-=cost;(s.heroes[a.hero].removedCards??=[]).push(c.uid);s.removalCount=(s.removalCount||0)+1;saveCheckpoint(s);emit(events,'removeCard',`${CARDS[c.key].name} 한 장을 제거했습니다.`,{hero:a.hero,uid:c.uid,cost});break;}
  case 'upgrade':{
   const o=s.upgradeOffer;if(!o||!['base','camp','refine'].includes(s.phase)||!o.candidates.some(c=>c.owner===a.hero&&c.key===a.card)||!s.party.includes(a.hero)||!insightSpec(a.card,a.branch))reject('제시된 세 카드 중 하나를 선택하세요.');if(s.heroes[a.hero].upgrades[a.card])reject('이미 강화한 카드입니다.');if(availableDiscoveries(s,a.hero).includes(a.card))learnCard(s,a.hero,a.card);s.heroes[a.hero].upgrades[a.card]=a.branch;const picked=o.candidates.find(c=>c.owner===a.hero&&c.key===a.card);if(picked?.spark&&picked.sparkBranch===a.branch){(s.heroes[a.hero].sparks??={})[a.card]=picked.spark;emit(events,'spark',`${HEROES[a.hero].name} · ${CARDS[a.card].name} ${SPARK_EFFECTS[picked.spark].name}`,{hero:a.hero,card:a.card,spark:picked.spark});}s.upgradeOffer=null;if(s.phase==='refine')s.phase=o.returnPhase;saveCheckpoint(s);emit(events,'upgrade',`${CARDS[a.card].name} · 강화 ${a.branch}`,{hero:a.hero,card:a.card});break;
  }
  case 'skipUpgrade':{if(!s.upgradeOffer)reject('남은 각성 기회가 없습니다.');const phase=s.upgradeOffer.returnPhase;s.upgradeOffer=null;if(s.phase==='refine')s.phase=phase;saveCheckpoint(s);break;}
  case 'eventRemoveCard':{if(s.phase!=='eventRemove'||!s.removalOffer)reject('제거할 기회가 없습니다.');if(!a.skip){const deck=s.party.includes(a.hero)&&ownedDeck(s,a.hero),c=deck&&deck.find(c=>c.uid===a.uid);if(!c||deck.length<=3)reject('최소 세 장을 남기고 제거하세요.');s.heroes[a.hero].removedCards.push(c.uid);emit(events,'removeCard',`${CARDS[c.key].name} 한 장을 제거했습니다.`,{hero:a.hero,uid:c.uid});}s.removalOffer=null;s.phase='reward';break;}
  case 'equipOwned':{const item=EQUIPMENT[a.item];if(!['base','camp'].includes(s.phase)||!s.party.includes(a.hero)||!item)reject('장비를 확인하세요.');const used=Object.values(s.heroes).filter(h=>h.equipment[item.slot]===a.item).length;if((s.inventory||[]).filter(x=>x===a.item).length<=used)reject('남은 보유 장비가 없습니다.');s.heroes[a.hero].equipment[item.slot]=a.item;saveCheckpoint(s);emit(events,'equip',`${HEROES[a.hero].name} · ${item.name}`,{hero:a.hero});break;}
  case 'equip':{
   if(!['base','camp'].includes(s.phase))reject('거점이나 야영에서 장비를 바꿀 수 있습니다.');const item=EQUIPMENT[a.item];if(!item||item.rarity==='elite'||item.slot!==a.slot||!s.collection.unlocked.includes(a.hero))reject('해당 칸에 장비할 수 없습니다.');if(s.heroes[a.hero].equipment[a.slot]===a.item)reject('이미 장비 중입니다.');if(s.gold<item.cost)reject('모라가 부족합니다.');s.gold-=item.cost;(s.inventory??=[]).push(a.item);s.heroes[a.hero].equipment[a.slot]=a.item;saveCheckpoint(s);emit(events,'equip',`${HEROES[a.hero].name} · ${item.name}`,{hero:a.hero});break;
  }
  case 'swap':{
   if(!['base','camp'].includes(s.phase)||a.out==='lohen'||!s.party.includes(a.out)||s.party.includes(a.in)||!s.collection.unlocked.includes(a.in))reject('교체할 동료를 확인하세요.');s.party[s.party.indexOf(a.out)]=a.in;if(s.upgradeOffer){s.upgradeOffer.candidates=s.upgradeOffer.candidates.filter(c=>s.party.includes(c.owner));if(!s.upgradeOffer.candidates.length)s.upgradeOffer=null;}saveCheckpoint(s);emit(events,'swap',`${HEROES[a.in].name}에게 서풍 매로 지원을 요청했습니다.`,{hero:a.in});break;
  }
  case 'heal':{
   if(s.phase!=='base')reject('거점에서 치료할 수 있습니다.');const needs=healingNeeds(s),heroes=[...new Set([...needs.injured,...needs.retired,...(needs.hp>0?s.party:[])])];restoreBodies(s);for(const id of s.party)s.heroes[id].stress=Math.max(0,s.heroes[id].stress-5);saveCheckpoint(s);emit(events,'heal','생명의 불꽃이 따스하게 몸을 감쌉니다. 부상 회복 · 체력 +20 · 출전원 정신 부담 -5. 붕괴 극복은 별도로 필요합니다.',{heroes:[...new Set([...heroes,...s.party])],hp:Math.min(20,needs.hp)});break;
  }
  case 'careStart':{if(!canCare(s,a.hero))reject('붕괴한 동료만 거점에서 한 번 안정을 취할 수 있습니다.');s.careDialogue={hero:a.hero,line:0};break;}
  case 'careNext':{const d=s.careDialogue;if(!d)reject('진행할 대화가 없습니다.');d.line=Math.min(CARE_SCRIPT[d.hero].length-1,d.line+1);break;}
  case 'cancelCare':s.careDialogue=null;break;
  case 'calm':{
   const d=s.careDialogue;if(!canCare(s,a.hero)||d?.hero!==a.hero||d.line<CARE_SCRIPT[a.hero].length-1)reject('선택한 파트너와 대화를 마쳐 주세요.');s.heroes[a.hero].stress=0;s.heroes[a.hero].breakdown=null;s.careUsed=true;s.careDialogue=null;saveCheckpoint(s);emit(events,'calm',`${HEROES[a.hero].partnerName}와 대화를 마쳤습니다. 붕괴 극복 · 정신 부담 0.`,{hero:a.hero});break;
  }
  case 'farm':{
   if(s.phase!=='base')reject('거점에서 이전 지역으로 출발할 수 있습니다.');saveCheckpoint(s);s.farmReturn={node:s.node,mode:s.mode,selectedStage:clone(s.selectedStage||null)};s.upgradeOffer=null;s.mode='farm';s.selectedStage=null;s.lastReward=null;s.farmCount++;beginBattle(s,s.farmCount%2?['hound','wanderer']:['hunter','breacher'],events);break;
  }
  case 'challenge':{
   if(s.phase!=='base')reject('거점에서 도전 구간으로 출발할 수 있습니다.');if(s.node===7)s.mainFrontStarted=true;saveCheckpoint(s);s.upgradeOffer=null;if(s.node<ROUTE.length-1){s.mode='route';s.node++;s.selectedStage=null;enterNode(s,events);break;}s.mode='challenge';s.selectedStage=null;s.lastReward=null;s.challengeStage=0;beginBattle(s,['nightmare'],events);break;
  }
  case 'restart':{
   if(!['defeat','ending'].includes(s.phase))reject('전멸 또는 클리어 후 거점으로 돌아갈 수 있습니다.');const clearedThisCampaign=!!s.claimedEnding||s.phase==='ending',collection=clone(s.collection),retries=s.retries+(s.phase==='defeat'?1:0),checkpoint=clone(s.checkpoint);if(!checkpoint)reject('복원할 거점이 없습니다.');const restored=clone(checkpoint);for(const k of Object.keys(s))delete s[k];Object.assign(s,restored,{checkpoint,claimedEnding:clearedThisCampaign||!!restored.claimedEnding,retries,temporal:Math.min(2,Math.max(0,retries-1)),collection,history:[]});
   emit(events,'rewind','시간의 힘이 느껴집니다. 시계바늘이 거꾸로 움직입니다.',{retries,temporal:s.temporal});if(s.phase==='title')enterNode(s,events);else if(s.node===7){s.phase='base';s.mode='route';s.battle=null;}break;
  }
  case 'newGame':{
   const next=newCampaign(s,a.seed??Date.now());for(const k of Object.keys(s))delete s[k];Object.assign(s,next);emit(events,'newGame','새로운 캠페인을 시작합니다. 동료 해금과 기록은 남아 있습니다.');break;
  }
  case 'undo':{
   if(s.phase!=='battle'||!s.battle)reject('전투 중에만 되돌릴 수 있습니다.');
   if(s.tutorial?.active)reject('튜토리얼 중에는 되돌리기를 사용할 수 없습니다.');
   if((s.battle.undoLeft||0)<=0)reject('이번 전투의 되돌리기 횟수를 모두 사용했습니다.');
   if(!s.battle.undoStack?.length)reject('되돌릴 직전 행동이 없습니다.');
   const nextLeft=s.battle.undoLeft-1,restStack=s.battle.undoStack.slice(0,-1),snap=s.battle.undoStack.at(-1);
   s.hp=snap.hp;s.shield=snap.shield;s.support=snap.support;s.rng=snap.rng;s.heroes=clone(snap.heroes);
   s.battle={...clone(snap.battle),undoStack:restStack,undoLeft:nextLeft};
   plans(s);emit(events,'undo',`직전 행동을 되돌렸습니다. (남은 횟수 ${nextLeft})`,{undoLeft:nextLeft});break;
  }
  case 'saveRecord':{
   if(!['base','ending'].includes(s.phase))reject('거점이나 원정 완료 화면에서 기록을 남길 수 있습니다.');
   s.collection.records??=[];
   const rec={
    id:`rec-${Date.now()}-${s.rng}`,
    label:a.label||`${s.party.map(id=>HEROES[id].name).join(' · ')} (${s.phase==='ending'?'클리어':'거점'})`,
    savedAt:new Date().toISOString().slice(0,10),
    party:[...s.party],
    battlesWon:s.battlesWon||0,
    heroes:Object.fromEntries(s.party.map(id=>{
     const h=s.heroes[id];
     return [id,{level:h.level,upgrades:clone(h.upgrades||{}),sparks:clone(h.sparks||{}),equipment:clone(h.equipment||{}),deck:ownedDeck(s,id).map(c=>c.key)}];
    })),
   };
   s.collection.records=[rec,...s.collection.records].slice(0,5);
   emit(events,'recordSaved',`원정 기록을 저장했습니다: ${rec.label}`,{id:rec.id});break;
  }
  case 'deleteRecord':{
   s.collection.records=(s.collection.records||[]).filter(r=>r.id!==a.id);
   emit(events,'recordDeleted','원정 기록을 삭제했습니다.',{id:a.id});break;
  }
  case 'challengeRecord':{
   const rec=(s.collection.records||[]).find(r=>r.id===a.id);
   if(!rec)reject('불러올 원정 기록을 찾을 수 없습니다.');
   s.party=[...rec.party];
   for(const id of rec.party){
    const savedH=rec.heroes[id],h=s.heroes[id];if(!savedH||!h)continue;
    h.level=savedH.level||1;h.upgrades=clone(savedH.upgrades||{});h.sparks=clone(savedH.sparks||{});h.equipment=clone(savedH.equipment||{});
    h.stress=0;h.breakdown=null;h.retired=false;h.body=Object.fromEntries(PARTS.map(p=>[p,0]));
    if(Array.isArray(savedH.deck)&&savedH.deck.length)h.deck=savedH.deck.map((key,i)=>makeCard(s,id,key,i));
   }
   s.hp=s.maxHp;s.shield=0;s.support=2;s.mode='challenge';s.challengeStage=0;s.selectedStage=null;s.lastReward=null;
   beginBattle(s,['nightmare'],events);
   emit(events,'recordChallenge',`원정 기록으로 보스 방어전에 돌입합니다: ${rec.label}`,{id:rec.id});break;
  }
  case 'returnToLobby':{
   if(s.phase==='base'){saveCheckpoint(s);s.savedExpedition=true;}
   s.battle=null;s.phase='lobby';
   emit(events,'lobby','메인 로비로 귀환했습니다.');break;
  }
  case 'resumeExpedition':{
   if(s.phase!=='lobby')reject('로비에서 원정으로 출발할 수 있습니다.');
   if(s.savedExpedition||s.checkpoint){
    s.savedExpedition=false;s.mode='route';s.phase='base';s.battle=null;
    emit(events,'base','임시저장된 거점으로 복귀했습니다.');
   }else{
    s.mode='route';enterNode(s,events);
   }
   break;
  }
  case 'startRaid':{
   if(!RAID_AVAILABLE)reject('보스 레이드는 구현 중입니다.');
   const rec=(s.collection.records||[]).find(r=>r.id===a.id);
   if(!rec)reject('사용할 세이브 데이터(원정 기록)를 선택하세요.');
   const raid=s.collection.raid;raid.recordStats??={};
   const st=raid.recordStats[rec.id]||{triesUsed:0,maxTries:RAID_BOSS_DEFAULT.maxTriesPerRecord,bestDamage:0};
   if((st.triesUsed||0)>=(st.maxTries||3))reject('이 세이브 데이터의 3회 트라이를 모두 사용했습니다.');
   s.party=[...rec.party];
   for(const id of rec.party){
    const savedH=rec.heroes[id],h=s.heroes[id];if(!savedH||!h)continue;
    h.level=savedH.level||1;h.upgrades=clone(savedH.upgrades||{});h.sparks=clone(savedH.sparks||{});h.equipment=clone(savedH.equipment||{});
    h.stress=0;h.breakdown=null;h.retired=false;h.body=Object.fromEntries(PARTS.map(p=>[p,0]));
    if(Array.isArray(savedH.deck)&&savedH.deck.length)h.deck=savedH.deck.map((key,i)=>makeCard(s,id,key,i));
   }
   s.hp=s.maxHp;s.shield=0;s.support=2;s.mode='raid';s.lastRaidResult=null;
   s.raidRun={recordId:rec.id,damageDealt:0,maxTurns:RAID_BOSS_DEFAULT.maxTurns};
   beginBattle(s,[raid.bossKind||'nightmare'],events);
   if(s.battle?.enemies?.[0]){s.battle.enemies[0].hp=999;s.battle.enemies[0].maxHp=999;s.battle.enemies[0].name=raid.bossName;}
   emit(events,'raidStart',`보스 레이드 개시 (${(st.triesUsed||0)+1}/${st.maxTries||3} 트라이) · ${rec.label}`,{recordId:rec.id});break;
  }
  case 'finishRaid':{
   if(s.mode!=='raid'||!s.raidRun)reject('진행 중인 레이드가 없습니다.');
   settleRaid(s,events,'retreat');break;
  }
  case 'resetRaidBoss':{
   s.collection.raid={bossKind:'nightmare',bossName:'천상의 왕좌 · 메타트론',bossMaxHp:240,totalDamage:0,clears:s.collection.raid?.clears||0,clearedThisCycle:false,recordStats:{}};
   s.lastRaidResult=null;emit(events,'raidReset','새 보스 레이드 토벌을 시작합니다.');break;
  }
  case 'equipPending':{
   const itemKey=a.item||s.pendingEquip?.[0],item=EQUIPMENT[itemKey];
   if(!item||!s.party.includes(a.hero))reject('장착할 전리품과 대상을 확인하세요.');
   s.heroes[a.hero].equipment[item.slot]=itemKey;
   const idx=(s.pendingEquip||[]).indexOf(itemKey);
   if(idx>=0)s.pendingEquip.splice(idx,1);
   emit(events,'equip',`${HEROES[a.hero].name}에게 ${item.name} 장착`,{hero:a.hero,item:itemKey});break;
  }
  case 'skipPendingEquip':{
   s.pendingEquip=[];emit(events,'equipSkip','전리품 장비를 가방에 보관했습니다.');break;
  }
  default:reject('알 수 없는 행동입니다.');
 }
}
export function act(state,action){
 const draft=clone(state),events=[];try{perform(draft,action,events);}catch(e){return {ok:false,error:e.message,events:[]};}
 draft.history=[...(draft.history||[]),...events.filter(e=>!['draw','shuffle','enemyAction'].includes(e.type)&&!(e.type==='discard'&&action.type==='endTurn')).map(e=>e.text)].slice(-60);for(const k of Object.keys(state))delete state[k];Object.assign(state,draft);return {ok:true,error:null,events};
}
export function applyStress(state,hero,amount,tag=''){const events=[];stress(state,hero,amount,events,tag);return events;}
export function applyInjury(state,hero,part){const events=[];injury(state,hero,part,events);return events;}
