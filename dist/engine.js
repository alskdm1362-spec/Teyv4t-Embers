import {STARTERS,DISCOVERIES,NEW_CARDS,REWARD_POOL} from './awakening.js';
import {ensureMap,depthScale} from './map.js';
import {ENEMY_LOOKS,KIND_LOOKS,RAID_LOOK,pickLook,lookName} from './enemy-looks.js';
import {SAVE_SLOTS,makeSaveEntry,applySaveEntry} from './savedata.js';
export {SAVE_SLOTS,SAVE_OUTCOMES,saveValue} from './savedata.js';
/* Teyvat: Oath of Embers — fan-game rules, independent of rendering. */
import {INSIGHTS,INSIGHT_BRANCHES,insightSpec,compatibleSparkIds,effectDescription} from './card-insights.js';
export {INSIGHTS,INSIGHT_BRANCHES} from './card-insights.js';
import {stageChoices} from './journey.js';
import {cycleMove,STRESS_PIP,HIT_STRESS,HIT_STRESS_CAP,ELITE_MENTAL,BOSS_MENTAL} from './enemy-patterns.js';
import {V2_CARDS,V2_BRANCHES,V2_PARTNERS,V2_PASSIVES,SPECIAL_CARDS} from './cards-v2.js';
export {V2_PASSIVES,V2_PARTNERS,SPECIAL_CARDS} from './cards-v2.js';
import {cardKeywords,keywordLine,CRACK_MAX,CRACK_PER_STACK,WITHER_RATE,HAND_LIMIT} from './keywords.js';
import {JOIN_LINES,CARE_SCRIPT} from './story-scripts.js';
import {EXTRA_ROUTE,EVENTS,LOOT_RULES} from './expedition-content.js';
export {LOOT_RULES} from './expedition-content.js';
export const HEROES = {
 lohen:{id:'lohen',name:'로엔',role:'단일 딜 · 버리기 추가공격',partner:'varka',partnerName:'바르카',color:'#70d5ce',weakness:'의태',summary:'서리 파편을 만들고 버려서 추가공격을 잇는 단일 대상 전투원.'},
 durin:{id:'durin',name:'두린',role:'서브딜 · 광역',partner:'albedo',partnerName:'알베도',color:'#bb91ef',weakness:'관측',summary:'광역 공격과 협공. 동료의 공격에 맞춰 적 전체를 태운다.'},
 illuga:{id:'illuga',name:'일루가',role:'파티 보호막',partner:'flins',partnerName:'플린스',color:'#f0ce65',weakness:'침식',summary:'등불로 파티 전원을 지키고, 남은 보호막을 다음 턴의 공격력으로 바꾼다.'},
 jahoda:{id:'jahoda',name:'야호다',role:'행동력 보충',partner:'nefer',partnerName:'네페르',color:'#ee99bf',weakness:'추적',summary:'0코스트 태엽 카드로 행동력을 채워 동료의 큰 카드를 돕는다.'},
 kinich:{id:'kinich',name:'키니치',role:'모드 전환 연타',partner:'mualani',partnerName:'말라니',partners:['mualani','kachina'],partnerNames:{mualani:'말라니',kachina:'카치나'},color:'#58c98a',weakness:'침식',summary:'「추적」 모드의 연타로 추적흔을 쌓고 「분쇄」 모드에서 터뜨린다. 필살기 버튼이 모드 전환이다.'},
 lyney:{id:'lyney',name:'리니',role:'드로우 보충',partner:'lynette',partnerName:'리넷',color:'#e2607c',weakness:'관측',summary:'카드를 빠르게 뽑는다. 손패 10장에 막히기 전에 버리는 마술로 푼다.'},
 cyno:{id:'cyno',name:'사이노',role:'결합형 X코스트 한방',partner:'tighnari',partnerName:'타이나리',color:'#9d86f5',weakness:'의태',summary:'손에 심판의 편린만 남기면 칠흑의 심판으로 결합해, 남은 행동력을 한 번에 쏟는다.'},
};
export const PARTNER_PASSIVES = {
 varka:{id:'varka',hero:'lohen',name:'서풍의 전술 감각',desc:V2_PARTNERS.varka+' · 전투당 되돌리기 +1회 · 붕괴 극복 시 보호막'},
 albedo:{id:'albedo',hero:'durin',name:'백악의 변성',desc:V2_PARTNERS.albedo+' · 희귀 잔불 각성(✦) 확률 상승 · 붕괴 극복 시 행동력 +1'},
 flins:{id:'flins',hero:'illuga',name:'불빛의 엄호',desc:V2_PARTNERS.flins+' · 붕괴 극복 시 다음 공격 피해 +25%'},
 nefer:{id:'nefer',hero:'jahoda',name:'사막의 통찰',desc:V2_PARTNERS.nefer+' · 붕괴 극복 시 카드 1장 드로우 · 원정 보급품 탐색 보조'},
 mualani:{id:'mualani',hero:'kinich',name:'파도 타는 길잡이',desc:V2_PARTNERS.mualani},
 kachina:{id:'kachina',hero:'kinich',name:'바위를 뚫는 용기',desc:V2_PARTNERS.kachina},
 lynette:{id:'lynette',hero:'lyney',name:'말 없는 조수',desc:V2_PARTNERS.lynette},
 tighnari:{id:'tighnari',hero:'cyno',name:'숲의 순찰관',desc:V2_PARTNERS.tighnari},
};
export const SPARK_EFFECTS = {
 ember_cost:{id:'ember_cost',name:'잔불 각성 · 경량화',badge:'✦ 각성',desc:'비용 -1 (최소 0)'},
 ember_support:{id:'ember_support',name:'잔불 각성 · 호응',badge:'✦ 각성',desc:'사용 시 지원 게이지 +1'},
 ember_calm:{id:'ember_calm',name:'잔불 각성 · 진정',badge:'✦ 각성',desc:'사용 시 사용자의 정신 부담 -4'},
 ember_draw:{id:'ember_draw',name:'잔불 각성 · 순환',badge:'✦ 각성',desc:'사용 시 카드 1장 드로우 (전투원당 턴당 1회)'},
 ember_force:{id:'ember_force',name:'잔불 각성 · 맹공',badge:'✦ 각성',desc:'공격 피해 +30%'},
 ember_bastion:{id:'ember_bastion',name:'잔불 각성 · 성채',badge:'✦ 각성',desc:'보호막 +50%'},
 ember_mercy:{id:'ember_mercy',name:'잔불 각성 · 온기',badge:'✦ 각성',desc:'사용 시 공용 체력 3% 회복 (전투원당 턴당 1회)'},
};
export const BRANCH_A_SPECS=Object.fromEntries(Object.entries(INSIGHTS).map(([key,v])=>[key,{title:v.A.title,bonusText:v.A.text}]));
export const RAID_AVAILABLE=true;
export const RAID_BOSS_DEFAULT = {
 bossKind:'nightmare',
 bossName:'천공의 사도·케루빔',
 bossMaxHp:2400,
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
const firstPct=c=>{const o=c.ops.find(x=>x.op==='dmg')||c.ops.find(x=>x.op==='shield');return o?Math.round((o.op==='dmg'?(o.pct||0)*(o.hits||1)*9/100:o.pct*7/200)):1;};
export const CARDS=Object.fromEntries(Object.values(V2_CARDS).map(c=>[c.key,{...c,desc:c.text,amount:firstPct(c),exhaust:c.keywords.includes('exhaust'),effects:{}}]));
CARDS.curse_echo=card('lohen','악몽의 찌꺼기',1,'none','curse',0,'아무 효과도 없다. 사용하면 소멸.',{exhaust:true,debuff:true});
export const EQUIPMENT={
 emberLance:{name:'잔불의 창',slot:'weapon',desc:'엘리트 · 공격 피해 +20%, 첫 공격 +20%.',attack:4,firstAttack:4,cost:0,rarity:'elite'},
 dawnSeal:{name:'여명의 인장',slot:'accessory',desc:'엘리트 · 시작 본인 보호막(방어력 기반 257%), 정신 피해 15% 감소.',startShield:9,stressReduction:.15,cost:0,rarity:'elite'},
 plainSpear:{name:'정찰용 무기',slot:'weapon',desc:'공격 피해 +10%.',attack:2,cost:30},
 frostEdge:{name:'얼음빛 날',slot:'weapon',desc:'첫 공격 피해 +25%.',firstAttack:5,cost:45},
 wardCharm:{name:'수호 부적',slot:'accessory',desc:'전투 시작 시 본인 보호막(방어력 기반 143%).',startShield:5,cost:25},
 calmRibbon:{name:'안정의 매듭',slot:'accessory',desc:'받는 정신력 피해 20% 감소.',stressReduction:.2,cost:30},
};
export const ENEMIES={
 trainingSlime:{name:'떠도는 점액',faction:'야생',hp:40,attack:3,tag:'훈련',desc:'움직임이 느린 작은 점액. 특별한 기술이 없어 기본 조작을 익히기 좋다.'},
 hound:{name:'심연 진드기',faction:'심연',hp:30,attack:6,tag:'침식',desc:'두 가지 물기를 번갈아 쓴다. 두 번째 도약이 더 아프다.'},
 wanderer:{name:'되살아나는 마디벌레',faction:'심연',hp:27,attack:5,tag:'추적',desc:'느리지만 끈질기게 휘감는다. 쓰러뜨리면 그대로 끝난다.'},
 hunter:{name:'갈래낫 추적자',faction:'심연',hp:37,attack:8,tag:'추적',desc:'표식을 남긴 다음 강한 추격을 이어 간다.'},
 angler:{name:'응시하는 부유체',faction:'심연',hp:31,attack:6,tag:'의태',ward:12,desc:'촉수로 공격한다. 정예로 나오면 정신을 꿰뚫는 응시를 쓴다.'},
 mimic:{name:'가시심장 포식자',faction:'심연',hp:64,attack:10,tag:'의태',hits:3,desc:'변형 뒤 강습을 노린다. 정예로 나오면 공허의 속삭임으로 정신을 공격한다.'},
 breacher:{name:'맥동하는 균열 고치',faction:'심연',hp:58,attack:9,tag:'침식',ward:16,desc:'수축과 분출을 번갈아 쓴다. 정예로 나오면 맥동하는 공포로 정신을 공격한다.'},
 nightmare:{name:'천의 눈 · 모태',faction:'심연',hp:112,attack:14,tag:'의태',ward:22,boss:true,desc:'세 동작을 정해진 순서로 반복한다. 세 번째 파도는 정신까지 덮친다. 다음 행동이 미리 보인다.'},
 keeper:{name:'초승달의 관측자',faction:'천공',hp:94,attack:12,tag:'관측',boss:true,desc:'검출 → 시선(정신 공격) → 결말 순서로 반복한다. 다음 행동이 미리 보인다.'},
 sentinel:{name:'좌천사 · 별의 파수',faction:'천공',hp:128,attack:15,tag:'관측',boss:true,desc:'검출 → 타락한 별빛(정신 공격) → 별의 심판 순서로 반복한다. 다음 행동이 미리 보인다.'},
 star:{name:'관측의 결정',faction:'천공',hp:12,attack:0,tag:'관측',desc:'파수가 준비하는 기술의 매개. 파괴하면 큰 공격이 약해진다.'},
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
const LEGACY_STARTERS=STARTERS;
export const PARTS=['eyes','leftArm','rightArm','leftLeg','rightLeg'];
// v0.26: damage that gets past the shared shield also weighs on the targeted hero's mind.
export const STRESS_PER_DAMAGE=.75;
// v0.36 stage 1: hero stats and the damage formula (planning doc §6).
// Card amounts stay in "points": 1 point = 1/9 of ATK for attacks and 2/7 of DEF for shields,
// so a 9-point strike reads 피해 100% and a 7-point guard reads 보호막 200%.
export const HERO_STATS={lohen:{hp:420,atk:110,def:40,cr:.15,cd:1.5},durin:{hp:400,atk:95,def:50,cr:.10,cd:1.4},jahoda:{hp:380,atk:70,def:45,cr:.05,cd:1.2},illuga:{hp:560,atk:75,def:80,cr:.05,cd:1.2},kinich:{hp:430,atk:85,def:50,cr:.20,cd:1.3},lyney:{hp:380,atk:80,def:40,cr:.10,cd:1.4},cyno:{hp:400,atk:120,def:45,cr:.10,cd:2.0}};
export const ATK_PER_POINT=1/9,SHIELD_PER_POINT=2/7,PARTY_SHIELD_SHARE=1/3,ENEMY_HP_SCALE=9,ENEMY_DAMAGE_SCALE=17;
export function heroStats(id){return HERO_STATS[id]||{hp:400,atk:100,def:45,cr:.1,cd:1.4};}
export function defMitigation(def){return 100/(100+Math.max(0,def||0));}
export function attackPercent(points){return Math.round(points*100*ATK_PER_POINT);}
export function shieldPercent(points,party=false){return Math.round(points*100*SHIELD_PER_POINT*(party?PARTY_SHIELD_SHARE:1));}
export function partyMaxHp(s){return s.party.filter(id=>!s.heroes[id]?.retired).reduce((n,id)=>n+heroStats(id).hp,0)||1;}
function hpPts(s,n){return Math.round(n*s.maxHp/100);}
function syncShield(s){s.shield=s.party.reduce((n,id)=>n+(s.heroes[id]?.shield||0),0);}
function clearShields(s){for(const h of Object.values(s.heroes))h.shield=0;s.shield=0;}
function addShield(s,source,pts,events,{party=false,label=''}={}){
 const ids=party?s.party.filter(id=>!s.heroes[id].retired):[source].filter(id=>s.party.includes(id)&&!s.heroes[id]?.retired);if(!ids.length||pts<=0)return 0;
 const each=Math.max(1,Math.round(pts*SHIELD_PER_POINT*heroStats(source).def*(party?PARTY_SHIELD_SHARE:1)));
 for(const id of ids)s.heroes[id].shield=(s.heroes[id].shield||0)+each;syncShield(s);
 emit(events,'shield',`${label||(HEROES[source]?.name||'')+' 보호막'} +${each}${party?' · 파티 전원':''}`,{hero:source,amount:each*ids.length,each,targets:ids});return each;
}
function refreshMaxHp(s){const next=partyMaxHp(s);if(next===s.maxHp)return;const d=next-s.maxHp;s.maxHp=next;s.hp=Math.max(0,Math.min(next,s.hp+Math.max(0,d)));}
function spreadHeal(s,gain){const ids=s.party.filter(id=>(s.heroes[id]?.lost||0)>0),total=ids.reduce((n,id)=>n+s.heroes[id].lost,0);if(gain<=0||!total)return;for(const id of ids){const h=s.heroes[id];h.lost=Math.max(0,h.lost-Math.round(gain*h.lost/total));}}
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
function heroState(){return {level:1,xp:0,stress:0,shield:0,lost:0,scar:0,breakdown:null,body:Object.fromEntries(PARTS.map(p=>[p,0])),retired:false,acquired:[],removedCards:[],upgrades:{},sparks:{},equipment:{weapon:null,accessory:null},buffs:{}};}
export function createGame(seed=20261115,{tutorial=true}={}){
 const s={version:3,tutorial:{active:!!tutorial,completed:!tutorial,chapter:1,step:'cost'},removalCount:0,phase:'title',seed:Number(seed)>>>0,rng:Number(seed)>>>0,party:['lohen'],heroes:Object.fromEntries(Object.keys(HEROES).map(id=>[id,heroState()])),hp:100,maxHp:100,hpScaled:false,shield:0,gold:30,support:2,retries:0,temporal:0,node:0,mode:'route',challengeStage:0,checkpoint:null,collection:{unlocked:['lohen'],codex:[],cutins:[],endings:[],records:[],raid:{bossKind:'nightmare',bossName:'천공의 사도·케루빔',bossMaxHp:RAID_BOSS_DEFAULT.bossMaxHp,totalDamage:0,clears:0,recordStats:{}}},battle:null,history:[],eventResult:null,battlesWon:0,claimedEnding:false,farmCount:0};
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
 for(const e of s.battle?.enemies||[])if(!ENEMY_LOOKS[e.look]){e.look=pickLook(e.kind,s.mode==='raid'?'celestial':'abyss',0);if(!(s.mode==='raid'&&ENEMIES[e.kind]?.boss))e.name=ENEMY_LOOKS[e.look].name;}if(s.battle&&!s.battle.realm)s.battle.realm=s.mode==='raid'?'celestial':'abyss';

 s.version=3;ensureMap(s,ROUTE);
 // v0.36: party HP is the sum of the deployed heroes' HP; older saves used a flat 100 pool and 1/12-scale enemies.
 for(const id of Object.keys(HEROES))if(s.heroes&&!s.heroes[id])s.heroes[id]=heroState();
 // v0.36 stage 4: the card lists were rebuilt. Unknown keys from older saves are dropped.
 for(const [id,h] of Object.entries(s.heroes||{})){h.shield??=0;h.lost??=0;h.scar??=0;h.legacyLoadout=false;if(Array.isArray(h.acquired))h.acquired=h.acquired.filter(k=>CARDS[k]&&!CARDS[k].generated&&!CARDS[k].combined);for(const f of ['upgrades','sparks'])for(const k of Object.keys(h[f]||{}))if(!V2_BRANCHES[k])delete h[f][k];}
 if(s.battle){for(const zone of ['hand','draw','discard','exhaust'])s.battle[zone]=(s.battle[zone]||[]).filter(c=>CARDS[c.key]);s.battle.kmode??='chase';s.battle.tracks??=0;s.battle.modeLeft??=1;s.battle.persist??=[];}
 if(s.upgradeOffer?.candidates)s.upgradeOffer.candidates=s.upgradeOffer.candidates.filter(c=>V2_BRANCHES[c.key]);if(s.cardOffer?.candidates)s.cardOffer.candidates=s.cardOffer.candidates.filter(c=>CARDS[c.key]);
 for(const e of s.battle?.enemies||[]){if(e.crack==null){e.crack=Math.min(5,(e.vulnerable||0)*2);e.wither=0;}delete e.vulnerable;}
 if(!s.hpScaled&&Array.isArray(s.party)&&s.heroes){const max=partyMaxHp(s),ratio=s.hp/(s.maxHp||100);s.maxHp=max;s.hp=Math.max(s.hp>0?1:0,Math.round(ratio*max));s.shield=0;
  for(const e of s.battle?.enemies||[]){e.hp=Math.round(e.hp*ENEMY_HP_SCALE);e.maxHp=Math.round(e.maxHp*ENEMY_HP_SCALE);e.ward=Math.round((e.ward||0)*ENEMY_HP_SCALE);e.def??=ENEMIES[e.kind]?.def??(ENEMIES[e.kind]?.boss?25:10);if(e.intent?.damage>0&&!e.intent.raw){e.intent.raw=e.intent.damage;e.intent.damage=Math.round(e.intent.damage*ENEMY_DAMAGE_SCALE*defMitigation(heroStats(e.intent.target).def));}}
  s.hpScaled=true;}
 {const r=s.collection?.raid;if(r&&r.bossMaxHp&&r.bossMaxHp<1000){r.bossMaxHp*=10;r.totalDamage=(r.totalDamage||0)*10;for(const st of Object.values(r.recordStats||{}))st.bestDamage=(st.bestDamage||0)*10;}}s.runActive??=true;s.inventory??=[];s.baseId??='route-7';s.careUsed??=false;s.upgradeOffer??=null;s.careDialogue??=null;
 const equipped=Object.values(s.heroes).flatMap(h=>Object.values(h.equipment||{})).filter(Boolean);for(const key of new Set(equipped)){while(s.inventory.filter(x=>x===key).length<equipped.filter(x=>x===key).length)s.inventory.push(key);}
 s.mainFrontStarted??=s.node>7||s.battlesWon>2;
 s.removalCount=Math.max(0,s.removalCount||0);s.tutorial??={active:false,completed:true,chapter:2,step:'complete'};if(s.tutorial.step==='partner-intro')s.tutorial.step='partner-select';
 for(const h of Object.values(s.heroes)){h.body={...Object.fromEntries(PARTS.map(p=>[p,0])),...h.body};if(!h.acquired)h.acquired=[];h.legacyLoadout=false;h.removedCards??=[];h.curses??=[];}
 if(s.battle)for(const zone of ['hand','draw','discard','exhaust'])for(const c of s.battle[zone]||[])bindBlind(s,c,false);
 if(s.checkpoint)normalizeSave(s.checkpoint);
 s.collection??={unlocked:['lohen'],codex:[],cutins:[],endings:[],records:[],raid:{bossKind:'nightmare',bossName:'천공의 사도·케루빔',bossMaxHp:RAID_BOSS_DEFAULT.bossMaxHp,totalDamage:0,clears:0,recordStats:{}}};s.collection.records??=[];s.collection.raid??={bossKind:'nightmare',bossName:'천공의 사도·케루빔',bossMaxHp:RAID_BOSS_DEFAULT.bossMaxHp,totalDamage:0,clears:0,recordStats:{}};s.collection.raid.bossName=RAID_BOSS_DEFAULT.bossName;s.collection.raid.recordStats??={};s.collection.saveData??={};for(const id of Object.keys(HEROES))s.collection.saveData[id]??=[];for(const h of Object.values(s.heroes||{}))h.sparks??={};
}
export function ownedDeck(s,owner){return [...(s.heroes[owner].legacyLoadout?LEGACY_STARTERS:STARTERS)[owner].map((key,index)=>({owner,key,uid:`${owner}-${key}-${index}`})),...(s.heroes[owner].acquired||[]).map((key,i,all)=>{const n=all.slice(0,i).filter(k=>k===key).length;return {owner,key,uid:owner+"-awaken-"+key+(n?'-'+(n+1):'')};}),...(s.heroes[owner].curses||[]).map(c=>({...c,owner}))].filter(c=>!(s.heroes[owner].removedCards||[]).includes(c.uid));}
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
 const s=createGame(seed,{tutorial:!previous?.collection?.tutorialDone});if(previous?.collection)s.collection=clone(previous.collection);s.checkpoint=snapshot(s);return s;
}
function snapshot(s){const copy=clone(s);delete copy.checkpoint;delete copy.history;return copy;}
function saveCheckpoint(s,isNew=false){if(s.phase!=='base')return;if(isNew){s.retries=0;s.temporal=0;}s.checkpoint=snapshot(s);}
function makeCard(s,owner,key,index){return {uid:`${owner}-${key}-${index}`,owner,key};}
function addCrack(e,n,events){const before=e.crack||0;e.crack=Math.min(CRACK_MAX,before+n);if(e.crack>before)emit(events,'crack',`${e.name} · 균열 ${e.crack}`,{enemy:e.id,amount:e.crack});}
function hasKeyword(s,c,k){return (cardInfo(s,c)?.keywords||[]).includes(k);}
// 회수: a card bound for the discard pile returns to hand once.
function toDiscard(s,c,events){const b=s.battle;delete c.retained;delete c.initiative;if(!c.recallUsed&&hasKeyword(s,c,'recall')&&b.hand.length<HAND_LIMIT){c.recallUsed=true;b.hand.push(c);emit(events,'recall',`${CARDS[c.key]?.name||'카드'} · 회수`,{uid:c.uid,hero:c.owner});return 'hand';}b.discard.push(c);return 'discard';}
function senseEffect(s,c,events){const info=cardInfo(s,c),fx=info?.sense;if(!fx||!info.keywords.includes('sense'))return;const b=s.battle;emit(events,'sense',`${info.name} · 감응`,{uid:c.uid,hero:c.owner});
 if(fx.ap)b.ap=Math.min(6,b.ap+fx.ap);if(fx.shield)addShield(s,c.owner,fx.shield,events);if(fx.crack)for(const e of livingEnemies(s))addCrack(e,fx.crack,events);if(fx.draw)b.pendingSenseDraw=(b.pendingSenseDraw||0)+fx.draw;}
function rollInitiative(s){for(const c of s.battle.hand)if(hasKeyword(s,c,'initiative'))c.initiative=random(s)<.5;else delete c.initiative;}
function draw(s,n,events=[]){const b=s.battle;for(let i=0;i<n&&b.hand.length<10;i++){
 if(!b.draw.length&&b.discard.length){const count=b.discard.length;b.draw=shuffle(s,b.discard.splice(0));emit(events,'shuffle','버린 카드를 다시 섞습니다.',{count});}
 if(!b.draw.length)break;const c=b.draw.pop();bindBlind(s,c,true);b.hand.push(c);rollEpiphany(s,c);emit(events,'draw',`${HEROES[c.owner].name}의 카드를 뽑았습니다.`,{uid:c.uid,hero:c.owner});senseEffect(s,c,events);
}
 if(b.pendingSenseDraw&&!b.senseDrawing){const extra=b.pendingSenseDraw;b.pendingSenseDraw=0;b.senseDrawing=true;draw(s,extra,events);b.senseDrawing=false;}}
// v0.27 Epiphany: a drawn card may glow. Played while glowing it costs 0 AP and then offers
// three of its four tactical awakenings to choose from (previewed), sometimes with an ember spark.
export const EPIPHANY_CHANCE=.03,EPIPHANY_PER_BATTLE=1;
function rollEpiphany(s,c){const b=s.battle;if(!b||s.tutorial?.active||s.mode==='raid'||c.epiphany)return;if((b.epiphanies||0)>=EPIPHANY_PER_BATTLE)return;const h=s.heroes[c.owner],d=CARDS[c.key];
 if(!h||!INSIGHTS[c.key]||h.upgrades[c.key]||d?.generated||d?.debuff||h.breakdown||(h.body.eyes||0)>=3)return;if(b.hand.some(x=>x!==c&&x.epiphany&&x.owner===c.owner&&x.key===c.key))return;
 if(random(s)<EPIPHANY_CHANCE){c.epiphany=true;b.epiphanies=(b.epiphanies||0)+1;}}
export function makeEpiphanyOffer(s,owner,key){const branches=shuffle(s,[...INSIGHT_BRANCHES]).slice(0,3).sort();let spark=null,sparkBranch=null;
 if(random(s)<(s.party.includes('durin')?.25:.1)){sparkBranch=choose(s,branches);const form={...CARDS[key],...insightSpec(key,sparkBranch)},pool=compatibleSparkIds(form);spark=choose(s,pool);}
 return {owner,key,branches,spark,sparkBranch};}
function danger(h){const f=h.breakdown?.failures||0;return f>=7?3:f>=4?2:1;}
function recoveryChance(h){return h.breakdown.failures>=10?1:.15+Math.min(.15,h.breakdown.failures*.015);}
export function cardInfo(s,c){
 const original=CARDS[c?.key];if(!original)return null;if(original.debuff)return {...original,owner:c.owner,upgraded:false};const h=s.heroes[c.owner],blind=(h.body.eyes||0)>=3&&!h.breakdown;let effectiveKey=c.key;if(blind){const copy={...c};bindBlind(s,copy,false);effectiveKey=copy.blindKey||c.key;}const base=CARDS[effectiveKey];
 if(h.breakdown){const d=BREAKDOWNS[h.breakdown.type];return {...base,name:`붕괴 · ${d.name}`,cost:1,target:'none',type:'breakdown',exhaust:false,keywords:[],ops:[],v2:false,desc:`${d.desc} 극복 확률 ${Math.round(recoveryChance(h)*100)}%. 실패 ${h.breakdown.failures}/10. 위험 강도 ${danger(h)}.`,blurred:h.body.eyes===2,breakdown:true,breakdownType:h.breakdown.type,failures:h.breakdown.failures,upgraded:false};}
 if(base.v2)return cardInfoV2(s,c,h,effectiveKey,blind);
 const branch=h.upgrades[effectiveKey],spec=insightSpec(effectiveKey,branch),form={...base,...(spec||{})},rate=armEffectRate(h);
 let amount=Math.max(0,Math.floor(form.amount*rate)),cost=form.cost;const keywords=cardKeywords(form);
 if(c.retained&&form.retainBonus)amount+=Math.floor(form.retainBonus*rate);if(c.initiative&&keywords.includes('initiative'))cost=Math.max(0,cost-1);
 if(form.type==='draw')amount=Math.max(0,amount-[h.body.leftArm,h.body.rightArm].filter(n=>n===3).length);
 const effects={...(base.effects||{}),...(spec?.effects||{})};
 if(effects.counter&&!effects.reflect){effects.reflect=effects.counter;}delete effects.counter;if(effects.vuln&&!effects.crack)effects.crack=Math.min(CRACK_MAX,effects.vuln*2);delete effects.vuln;
 for(const field of ['shield','focus','nextPierce','extraPierce','reflect','heal'])if(effects[field])effects[field]=Math.floor(effects[field]*rate);
 if(form.type==='counter'&&!effects.reflect)effects.reflect=Math.floor(6*rate);
 if(c.owner==='durin'&&h.level>=3&&form.target==='all'&&h.buffs.discount)cost=Math.max(0,cost-1);
 if(form.type==='attack'&&s.battle?.nextAttackDiscount)cost=Math.max(0,cost-1);
 const sparkId=h.sparks?.[effectiveKey]||null,sparkInfo=sparkId?SPARK_EFFECTS[sparkId]:null;
 if(sparkId==='ember_cost')cost=Math.max(0,cost-1);
 if(sparkId==='ember_force'&&form.type==='attack')amount+=Math.floor(3*rate);
 if(sparkId==='ember_bastion'&&['guard','counter'].includes(form.type))amount+=Math.floor(4*rate);
 const partyGuard=c.owner==='illuga'&&form.type==='guard',text={tactic:'특수 지원.',attack:`${form.target==='all'?'전체 ':''}피해 ${attackPercent(amount)}%.`,guard:partyGuard?`방어력 기반 파티 전원 보호막 ${shieldPercent(amount,true)}%.`:`방어력 기반 본인 보호막 ${shieldPercent(amount)}%.`,counter:`방어력 기반 본인 보호막 ${shieldPercent(amount)}%.`,focus:`이번 턴 다음 ${HEROES[c.owner].name} 공격 피해 +${attackPercent(amount)}%.`,cover:`${effects.coverAll?'아군 전체':'선택한 동료'}가 다음에 받을 정신력 피해 ${amount} 감소.`,draw:`${amount}장 뽑${form.discard===0?'는다.':'고 1장을 골라 버린다.'}`,energy:`행동력 ${amount} 회복.`};
 const described={...effects};delete described.extraPierce;const pressure=Math.floor((form.pierce||0)*rate)+(effects.extraPierce||0);let desc=(keywords.length?keywordLine(keywords)+'. ':'')+(text[form.type]||form.desc)+(pressure?` 장막 추가 압박 ${attackPercent(pressure)}%.`:'')+' '+effectDescription(described);
 if(sparkInfo)desc+=` ${sparkInfo.desc}`;desc=desc.replace(/\s{2,}/g,' ');
 const st=heroStats(c.owner),numbers=form.type==='attack'?{damage:Math.round(amount*st.atk*ATK_PER_POINT),crit:st.cr,critDamage:Math.round(amount*st.atk*ATK_PER_POINT*st.cd)}:['guard','counter'].includes(form.type)?{shield:Math.round(amount*SHIELD_PER_POINT*st.def*(partyGuard?PARTY_SHIELD_SHARE:1)),party:partyGuard}:null;
 const actual={...form,amount,numbers,keywords,cost:c.epiphany&&!blind?0:cost,baseCost:cost,epiphany:!!c.epiphany&&!blind,desc:desc.trim(),effects,upgraded:!!branch,branch,spark:sparkId,sparkName:sparkInfo?.name||null,effectiveKey,injuryRate:rate,blurred:h.body.eyes===2};return blind?{...actual,name:'실명',desc:'??',displayCost:'?',upgraded:false,blind:true,target:'none',type:'blind',actual}:actual;
}
function makeEnemy(s,kind,index){const d=ENEMIES[kind],hp=Math.round(d.hp*depthScale(s).hp*ENEMY_HP_SCALE)+Math.max(0,s.temporal)*3*ENEMY_HP_SCALE,realm=s.battle?.realm||s.pendingRealm||'abyss',look=s.mode==='raid'&&kind===(s.collection?.raid?.bossKind||'nightmare')&&index===0&&!s.battle?RAID_LOOK:pickLook(kind,realm,index+(s.node||0));return {id:`${kind}-${index}`,kind,look,name:ENEMY_LOOKS[look]?.name||d.name,hp,maxHp:hp,def:d.def??(d.boss?25:10),ward:s.mode==='raid'?(d.ward||0)*ENEMY_HP_SCALE:0,hitWard:s.mode==='raid'?d.hits||0:0,turn:0,stun:0,crack:0,wither:0,observed:null,observedCount:0,echo:false,intent:null};}
function isEliteFight(s){return s.encounterType==='elite'||s.mode==='challenge';}
function routeIntent(s,e,target,d,preview=false){
 const move=cycleMove(e.kind,e.turn,e.look),boss=!!d.boss,mental=move.mental&&(boss||isEliteFight(s))?(boss?BOSS_MENTAL:ELITE_MENTAL)*STRESS_PIP:0;
 let damage=move.damage>0?move.damage+(s.temporal||0):0;if(!mental&&move.mental)damage=Math.max(damage,Math.round((d.attack||5)*.8));
 const intent={name:move.name,damage,stress:mental,mental:!!mental,target,tag:d.tag,boss};
 if(preview){const scale=depthScale(s);intent.damage=intent.damage>0?Math.max(1,Math.round(intent.damage*scale.damage*ENEMY_DAMAGE_SCALE*defMitigation(heroStats(target).def))):0;}
 return intent;
}
function plans(s){
 const b=s.battle,targets=active(s);if(!targets.length)return;
 for(const e of livingEnemies(s)){
  const d=ENEMIES[e.kind];let target=targets[(e.turn+b.turn)%targets.length];let intent={name:'공격',damage:d.attack+s.temporal,stress:0,target,tag:d.tag};
  if(s.mode!=='raid'){intent=routeIntent(s,e,target,d);e.next=d.boss?routeIntent(s,{...e,turn:e.turn+1},targets[(e.turn+1+b.turn+1)%targets.length],d,true):null;}
  else if(e.kind==='hound')intent={...intent,name:e.turn%2?'균열의 도약':'침식의 이빨',damage:e.turn%2?8:5,corrosion:e.turn%2?0:2};
  if(s.mode==='raid'&&e.kind==='wanderer')intent={...intent,name:e.echo?'잔향 복원':'흔적 추적',damage:e.echo?0:5,restore:e.echo};
  if(s.mode==='raid'&&e.kind==='hunter')intent={...intent,name:e.turn%2?'갈라진 추격':'추적 표식',damage:e.turn%2?12:5,stress:e.turn%2?8:5,injury:e.turn%2===1};
  if(s.mode==='raid'&&e.kind==='angler')intent={...intent,name:e.ward?'연결된 장막':'이끌림의 속삭임',stress:e.ward?8:4};
  if(s.mode==='raid'&&e.kind==='mimic')intent={...intent,name:e.turn%2?'의태 · 강습':'공허한 변형',damage:e.turn%2?16:6,stress:e.turn%2?12:5,injury:e.turn%2===1};
  if(s.mode==='raid'&&e.kind==='breacher')intent={...intent,name:e.ward?'코어의 수축':'균열 분출',damage:e.ward?7:13,stress:7};
  if(s.mode==='raid'&&e.kind==='nightmare'){const sky=ENEMY_LOOKS[e.look]?.realm==='celestial';intent={...intent,name:e.turn%3===0?(sky?'사도의 부름':'어둠의 부름'):e.turn%3===2?(sky?'천공의 파도':'악몽의 파도'):(sky?'내리꽂는 광휘':'내리꽂는 그림자'),damage:e.turn%3===2?18:10,stress:e.turn%3===2?20:8,summon:e.turn%3===0};}
  if(s.mode==='raid'&&e.kind==='keeper')intent={...intent,name:e.observedCount>=2?'관측된 결말':'영역 검출',damage:e.observedCount>=2?19:10,stress:10,target:e.observedCount>=2&&targets.includes(e.observed)?e.observed:target};
  if(s.mode==='raid'&&e.kind==='sentinel'){
   const stars=livingEnemies(s).filter(x=>x.kind==='star').length;
   intent={...intent,name:e.turn%3===0?'타락한 별의 전개':e.turn%3===2?'별의 심판':'침묵의 검출',damage:e.turn%3===2?(stars?24:6):10,stress:e.turn%3===2?(stars?20:3):8,stars:e.turn%3===0,injury:e.turn%3===2&&stars>0};
  }
  if(s.mode==='raid'&&e.kind==='star')intent={...intent,name:'심판에 힘을 보냄',damage:0};
  {const scale=depthScale(s);if(intent.damage>0)intent.damage=Math.round(intent.damage*scale.damage);if(intent.stress>0)intent.stress=Math.round(intent.stress*(1+(scale.damage-1)*.5));if(s.mode==='raid'&&s.encounterType==='elite'&&intent.damage>=10)intent.injury=true;}
  if(intent.damage>0){const h=s.heroes[intent.target];intent.damage=Math.ceil(intent.damage*(1+.25*[h.body.leftLeg,h.body.rightLeg].filter(n=>n===3).length));}
  if(intent.damage>0&&e.wither)intent.damage=Math.max(1,Math.round(intent.damage*(1-WITHER_RATE)));
  if(intent.damage>0){intent.raw=intent.damage;intent.damage=Math.max(1,Math.round(intent.damage*ENEMY_DAMAGE_SCALE*defMitigation(heroStats(intent.target).def)));}
  if(e.stun)intent={...intent,name:'균형 붕괴 · 행동 중단',damage:0,stress:0,stunned:true,summon:false,stars:false,injury:false,corrosion:0};
  e.intent=intent;
 }
}
// v0.30: from the second third of the map some battles move to the celestial realm.
export function battleRealm(s,teaching=false){
 if(s.mode==='raid')return 'celestial';if(teaching||s.mode!=='route')return s.mode==='challenge'?'celestial':'abyss';
 const span=Math.max(1,ROUTE.length-8),progress=(s.node-8)/span;if(progress<1/3)return 'abyss';
 return ((Math.imul((s.seed>>>0)^(s.node*2654435761),2246822519)>>>16)%3)<(progress<2/3?1:2)?'celestial':'abyss';
}
function beginBattle(s,kinds,events){
 kinds=[...kinds];const teaching=s.tutorial?.active&&s.mode==='route'&&[0,2].includes(s.node);if(teaching)kinds=s.node===0?['trainingSlime']:['trainingSlime','trainingSlime'];
 if(!teaching&&s.temporal>0&&s.mode==='route'&&s.node<7){
  if(s.node===0)kinds=[s.temporal===1?'hound':'hunter'];
  if(s.node===2)kinds=s.temporal===1?['hound','hunter']:['wanderer','breacher'];
  emit(events,'temporal','시간의 잔흔으로 다음 전선의 적 구성이 달라졌습니다. 적의 행동을 확인하세요.',{temporal:s.temporal});
 }
 const cards=active(s).flatMap(owner=>ownedDeck(s,owner));s.battle=null;s.pendingRealm=battleRealm(s,teaching);
 for(const id of s.party)s.heroes[id].buffs={...(s.heroes[id].buffs?.flins?{flins:s.heroes[id].buffs.flins}:{}),firstAttack:true};
 s.encounterType=currentNode(s).type;s.battle={turn:1,ap:3,hand:[],draw:shuffle(s,cards),discard:[],exhaust:[],enemies:kinds.map((k,i)=>makeEnemy(s,k,i)),supportUsed:false,ultimates:{},spent:0,recovered:false,corrosion:0,morale:0,chooseDiscard:0,undoStack:[],undoLeft:s.party.includes('lohen')?2:1,realm:s.pendingRealm,kmode:'chase',tracks:0,modeLeft:1,persist:[]};delete s.pendingRealm;
 {const b=s.battle,open=b.draw.filter(c=>hasKeyword(s,c,'opening'));if(open.length)b.draw=[...b.draw.filter(c=>!open.includes(c)),...open];}
 s.phase='battle';clearShields(s);for(const id of s.party)s.heroes[id].scar=0;
 for(const id of s.party){const item=EQUIPMENT[s.heroes[id].equipment.accessory];if(item?.startShield)addShield(s,id,item.startShield,events,{label:`${item.name} · 보호막`});}
 if(teaching){s.tutorial.chapter=s.node===0?1:2;s.tutorial.step=s.node===0?'cost':'partner-select';if(s.node===2){s.support=Math.max(2,s.support);for(const e of s.battle.enemies)e.hp=e.maxHp=22*ENEMY_HP_SCALE;}}
 if(teaching&&s.node===0){
  for(const [index,key] of ['l_pierce','l_guard','l_strike','l_strike','l_strike'].entries()){
   const at=s.battle.draw.findIndex(c=>c.key===key);
   const c=at<0?makeCard(s,'lohen',key,'lesson-'+index):s.battle.draw.splice(at,1)[0];
   s.battle.hand.push(c);emit(events,'draw','훈련 카드를 받았습니다.',{uid:c.uid,hero:c.owner});
  }
 }else{draw(s,5,events);rollInitiative(s);}plans(s);emit(events,'battle','전투가 시작되었습니다.');
 for(const k of kinds)if(!s.collection.codex.includes(k))s.collection.codex.push(k);for(const e of s.battle?.enemies||[])if(e.look&&!s.collection.codex.includes(e.look))s.collection.codex.push(e.look);
}
export function healingNeeds(s){
 const mental=s.party.some(id=>s.heroes[id].stress>0),hp=Math.max(0,s.maxHp-s.hp),injured=Object.keys(s.heroes).filter(id=>Object.values(s.heroes[id].body).some(stage=>stage>0)),retired=Object.keys(s.heroes).filter(id=>s.heroes[id].retired);
 return {hp,injured,retired,mental,needed:hp>0||injured.length>0||retired.length>0||mental};
}
function restoreBodies(s){s.hp=Math.min(s.maxHp,s.hp+hpPts(s,30));for(const h of Object.values(s.heroes)){h.body=Object.fromEntries(PARTS.map(p=>[p,0]));if(h.retired)h.lost=0;h.retired=false;}refreshMaxHp(s);}
export function rollEventOffer(s){const seen=s.seenEvents||[],fresh=EVENTS.filter(e=>!seen.includes(e.id)),offer=clone(choose(s,fresh.length?fresh:EVENTS));s.seenEvents=fresh.length?[...seen,offer.id]:[offer.id];for(const c of offer.choices){const premium=c.benefit?.elite||c.benefit?.kind==='gold'&&c.benefit.amount>=40;if(!premium&&!c.dice&&!c.mystery&&!Object.keys(c.cost||{}).length)c.cost=clone(choose(s,[{},{},{hp:6},{stress:7}]));if(c.benefit?.kind==='equipment'&&!c.benefit.item)c.benefit.item=gearDrop(s,!!c.benefit.elite);}return offer;}
function enterNode(s,events){
 const n=currentNode(s);s.eventResult=null;s.lastReward=null;s.eventOffer=null;if(n.type==='event')s.eventOffer=rollEventOffer(s);if(n.type==='camp'){s.campActions=[];s.upgradeOffer=random(s)<LOOT_RULES.baseRefinement?makeUpgradeOffer(s,'camp','camp'):null;}if(n.type==='recruit')s.recruitLine=0;
 if(n.type==='battle'||n.type==='elite')return beginBattle(s,n.enemies,events);
 s.phase=n.type;
 if(n.type==='base'){
  const baseId='route-'+s.node;if(s.baseId!==baseId||!s.baseInitialized){s.baseId=baseId;s.baseInitialized=true;s.careUsed=false;s.healUsed=false;s.upgradeOffer=random(s)<LOOT_RULES.baseRefinement?makeUpgradeOffer(s,'base','base'):null;}s.collection.unlocked=[...new Set([...s.collection.unlocked,...Object.keys(HEROES)])];saveCheckpoint(s,true);
  emit(events,'base','거점에 도착했습니다. 생명의 불꽃에서 회복 행동을 선택할 수 있습니다.');
 }
}
function stress(s,id,amount,events,tag=''){
 const h=s.heroes[id];if(!h||h.retired||h.breakdown)return;if(s.battle?.stressImmune&&s.phase==='battle')return;
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
 if(Object.values(h.body).filter(x=>x>=3).length>=2){h.retired=true;{const full=heroStats(id).hp;s.hp=Math.max(0,s.hp-Math.max(0,full-(h.lost||0)));s.maxHp=Math.max(1,s.maxHp-full);h.shield=0;syncShield(s);}emit(events,'retire',`${HEROES[id].name} · 전투 이탈. 거점에서 회복하면 복귀합니다. 파트너 지원은 유지됩니다.`,{hero:id});if(s.battle)for(const zone of ['hand','draw','discard','exhaust'])s.battle[zone]=s.battle[zone].filter(c=>c.owner!==id);for(const ally of active(s))stress(s,ally,10,events);}
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
  recordId:run.recordId,label:run.label||rec?.label||'원정 기록',reason,
  damageDealt:run.damageDealt||0,prevBest,newBest:st.bestDamage,improved:st.bestDamage>prevBest,
  triesUsed:st.triesUsed,maxTries:st.maxTries||3,
  totalDamage:raid.totalDamage,bossMaxHp:raid.bossMaxHp,bossDefeated,
 };
 s.raidRun=null;s.battle=null;s.mode='route';s.phase='lobby';restoreRaidStash(s);
 emit(events,bossDefeated?'raidClear':'raidEnd',bossDefeated?`보스 레이드 토벌 완료! 누적 피해 ${raid.totalDamage} / ${raid.bossMaxHp}`:`레이드 트라이 종료 · 이번 피해 ${run.damageDealt} (최고 ${st.bestDamage})`,s.lastRaidResult);
}
// The raid borrows the run's hero slots; everything outside the collection is stashed and restored.
function stashRun(s){const keep=new Set(['collection','raidStash']);s.raidStash=clone(Object.fromEntries(Object.entries(s).filter(([k])=>!keep.has(k))));}
function restoreRaidStash(s){const stash=s.raidStash;if(!stash)return;const collection=s.collection,result=s.lastRaidResult;for(const k of Object.keys(s))delete s[k];Object.assign(s,stash,{collection,lastRaidResult:result,phase:'lobby'});}
function freshRun(s,{tutorial=false}={}){const collection=s.collection,next=createGame(Date.now()^s.rng,{tutorial});for(const k of Object.keys(s))delete s[k];Object.assign(s,next,{collection});s.checkpoint=snapshot(s);}
export function saveEntries(s,hero){return s.collection.saveData?.[hero]||[];}
function defeat(s,events){if(s.mode==='raid'&&s.raidRun){settleRaid(s,events,'defeat');return;}s.phase='defeat';emit(events,'defeat','더는 전선을 유지할 수 없습니다. 시간의 흐름이 흔들립니다.');}
function damageEnemy(s,e,amount,owner,events,extraWard=0,opts={}){
 if(!e||e.hp<=0)return;const st=heroStats(owner),atk=opts.base??(HEROES[owner]?(opts.stat==='def'?st.def:st.atk+(opts.atkAdd||0)):100),crit=!!HEROES[owner]&&!s.battle?.forecast&&!s.battle?.noCrit&&random(s)<st.cr+(opts.crBonus||0);
 let value=Math.max(0,Math.round(amount*atk*ATK_PER_POINT*(1+(opts.inc||0))*(crit?st.cd:1)*defMitigation((e.def||0)*(opts.defMul??1))*(1+CRACK_PER_STACK*Math.min(CRACK_MAX,e.crack||0))));extraWard=Math.round(extraWard*atk*ATK_PER_POINT);
 if(s.mode==='raid'&&e.kind==='keeper'&&owner){if(e.observed===owner)e.observedCount++;else{e.observed=owner;e.observedCount=1;}if(e.observedCount>=3)value=Math.ceil(value*.7);}
 if(e.hitWard>0&&!opts.pierceWard){e.hitWard--;value=Math.max(1,Math.floor(value*.35));if(!e.hitWard){e.stun=1;emit(events,'break',`${e.name}의 장막이 벗겨집니다.`,{enemy:e.id});}}
 if(e.ward>0&&!opts.pierceWard){
  const wm=opts.wardMul||1,removed=Math.min(e.ward,value*wm+extraWard);e.ward-=removed;value=Math.max(0,Math.round(value-Math.max(0,removed-extraWard)/wm));
  if(e.ward===0){e.stun=1;if(e.kind==='angler'){for(const other of livingEnemies(s))if(other.kind==='angler'){other.ward=0;other.stun=1;}emit(events,'break','연결된 장막이 함께 무너집니다.',{enemy:e.id});}else emit(events,'break','장막을 파괴해 행동을 중단시켰습니다.',{enemy:e.id});s.support=Math.min(6,s.support+1);}
 }
 e.hp=Math.max(0,e.hp-value);emit(events,'damage',`${e.name}에게 피해 ${value}${crit?' (치명)':''}`,{hero:owner,enemy:e.id,amount:value,crit});
 if(s.mode==='raid'&&s.raidRun&&e.kind===s.collection.raid.bossKind){s.raidRun.damageDealt=(s.raidRun.damageDealt||0)+value;}
 if(e.hp===0){
  {emit(events,'kill',`${e.name} 제압`,{enemy:e.id});if(e.kind==='angler')for(const boss of livingEnemies(s))if(boss.kind==='nightmare')boss.ward=Math.max(0,boss.ward-12*ENEMY_HP_SCALE);
   if(e.kind==='star'){const boss=livingEnemies(s).find(x=>x.kind==='sentinel');if(boss&&!livingEnemies(s).some(x=>x.kind==='star')){boss.stun=1;emit(events,'break','별이 사라져 심판을 저지했습니다.',{enemy:boss.id});}}
  }
 }
 plans(s);
}
function checkVictory(s,events){
 if(s.phase!=='battle'||livingEnemies(s).length)return;
 if(s.mode==='raid'&&s.raidRun){settleRaid(s,events,'victory');return;}
 const reward=12+(s.party.includes('jahoda')?4:0)+(s.mode==='challenge'?8:0);s.battlesWon++;s.support=Math.min(6,s.support+1);
 const elite=currentNode(s).type==='elite'||s.mode==='challenge',loot=s.tutorial?.active?{}:rollLoot(s,elite);s.phase='reward';s.lastReward={gold:reward+(elite?12:0),xp:10,pending:true,...loot,cardOffer:s.tutorial?.active?null:makeCardOffer(s,elite?'elite':'battle','travel')};emit(events,'victory',`전투 승리 · 보급품을 수령하거나 넘어갈 수 있습니다.`);if(s.tutorial?.active){settleReward(s,false,events);s.node=s.tutorial.chapter===1?1:3;s.selectedStage=null;s.battle=null;s.tutorial.step='recruit';enterNode(s,events);}
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
  const probe=clone(state);probe.tutorial.active=false;probe.battle.undoStack=[];probe.battle.forecast=true;probe.battle.ap=Math.max(probe.battle.ap,view.cost);
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
 if(b.pickDraw)reject('먼저 가져올 카드를 고르세요.');
 if(!info.breakdown&&(info.keywords||[]).includes('unplayable'))reject('직접 사용할 수 없는 카드입니다.');
 if(!info.breakdown&&info.perTurnUse&&(b.turnUses?.[key]||0)>=info.perTurnUse)reject('이 카드는 이번 턴에 더 쓸 수 없습니다.');
 if(!info.breakdown&&c.owner==='durin'&&info.type==='attack'&&(b.persist||[]).some(p=>p.lock==='durinAttack'))reject('낙성의 불길이 타는 동안 두린은 공격 카드를 쓸 수 없습니다.');
 pushUndo(s);b.ap-=info.cost;b.spent+=info.cost;b.hand.splice(index,1);for(const x of b.hand)delete x.initiative;let dest=!info.breakdown&&info.exhaust?'exhaust':'discard';if(c.parts&&!info.breakdown){dest=info.shardsExhaust?'exhaust':'discard';for(const part of c.parts){delete part.retained;b[dest].push(part);}}else if(dest==='exhaust'){delete c.retained;b.exhaust.push(c);}else dest=toDiscard(s,c,events);
 emit(events,'card',`${HEROES[c.owner].name} · ${info.name}`,{hero:c.owner,card:key,uid:c.uid,destination:dest,blind:!!view.blind,actualCost:info.cost});
 if(info.type==='breakdown'){
  const bd=h.breakdown,success=bd.failures>=10||random(s)<recoveryChance(h);
  if(success){
   h.breakdown=null;h.stress=40;h.buffs.awaken=6;
   emit(events,'recover',`${HEROES[c.owner].name} · 붕괴 극복`,{hero:c.owner});
   emit(events,'awaken',`${HEROES[c.owner].name} · 극복의 잔불 (+6)`,{hero:c.owner});
   if(s.party.includes('lohen'))addShield(s,c.owner,4,events,{label:'바르카 패시브 · 보호막'});
   if(s.party.includes('durin')){b.ap=Math.min(6,b.ap+1);emit(events,'resource','알베도 패시브 · 행동력 +1',{hero:'durin'});}
   if(s.party.includes('illuga')){h.buffs.flins=(h.buffs.flins||0)+5;}
   if(s.party.includes('jahoda')){draw(s,1,events);}
  }
  else{
   bd.failures++;const power=danger(h);emit(events,'collapseFail',`극복 실패 ${bd.failures}/10 · 위험 강도 ${power}`,{hero:c.owner});
   if(random(s)<.65){
    if(bd.type==='despair'){b.morale=Math.min(3,(b.morale||0)+power);emit(events,'morale','아군의 사기가 흔들립니다.');}
    if(bd.type==='distrust'){const ff=hpPts(s,2+power*2);s.hp=Math.max(0,s.hp-ff);h.lost=Math.min(heroStats(c.owner).hp,(h.lost||0)+ff);emit(events,'friendlyFire','불신이 아군을 겨눕니다.',{amount:ff,hero:c.owner});}
    if(bd.type==='panic'){const allies=active(s).filter(id=>id!==c.owner);if(allies.length)stress(s,choose(s,allies),3+power*3,events);}
    if(bd.type==='frenzy'){const e=choose(s,livingEnemies(s));if(e)damageEnemy(s,e,7+power*3,c.owner,events);if(random(s)<.15*power)injury(s,c.owner,null,events);}
   }
  }
 }else if(info.v2){playV2(s,c,info,target,a,events);
 }else{
  if(info.type==='attack'){
   const targets=info.target==='all'?[...livingEnemies(s)]:[target];let amount=info.amount+Math.floor(Math.min(info.effects?.shieldDamageCap||0,Math.floor((h.shield||0)*(info.effects?.shieldDamage||0)/(heroStats(c.owner).atk*ATK_PER_POINT)))*info.injuryRate)+attackBonus(s,c.owner)+(h.buffs.focus||0)+(h.buffs.flins||0)+(h.buffs.awaken||0)-Math.min(3,b.morale||0);delete h.buffs.awaken;
   const totalPierce=Math.floor((info.pierce||0)*(info.injuryRate||1))+(info.effects?.extraPierce||0)+(h.buffs.nextPierce||0);
   for(const e of targets){damageEnemy(s,e,Math.max(1,amount),c.owner,events,totalPierce);if(info.effects?.crack&&e.hp>0)addCrack(e,info.effects.crack,events);}
   delete h.buffs.nextPierce;delete b.nextAttackDiscount;
   if(h.buffs.counter){const e=livingEnemies(s).find(x=>x.id===target?.id)||livingEnemies(s)[0];if(e)damageEnemy(s,e,h.buffs.counter,c.owner,events);delete h.buffs.counter;}
   delete h.buffs.focus;delete h.buffs.flins;h.buffs.firstAttack=false;
   if(c.owner==='durin'&&h.level>=3&&info.cost>=2)h.buffs.discount=true;else if(c.owner==='durin'&&h.buffs.discount)delete h.buffs.discount;
  }
  if(info.type==='guard'||info.type==='counter'){let amount=info.amount+Math.floor((h.level-1)*info.injuryRate)+(h.buffs.awaken||0);delete h.buffs.awaken;addShield(s,c.owner,amount,events,{party:c.owner==='illuga'&&info.type==='guard'});}
  if(info.type==='focus')h.buffs.focus=(h.buffs.focus||0)+info.amount;
  if(info.type==='cover'){for(const id of info.effects?.coverAll?active(s):[a.target]){s.heroes[id].buffs.cover=info.amount;if(s.party.includes('illuga'))s.heroes[id].stress=Math.max(0,s.heroes[id].stress-2);emit(events,'cover',`${HEROES[id].name}을 엄호합니다.`,{hero:id});}}
  if(info.type==='energy')b.ap=Math.min(6,b.ap+info.amount);
  if(info.type==='draw'){draw(s,info.amount,events);b.chooseDiscard=info.discard===0?0:Math.min(1,b.hand.length);}
  applyCardExtras(s,c,info,events);

 }
 // The UI opens the choice at once; engine callers may resolve it later. One offer is pending at a time.
 if(c.epiphany&&!info.breakdown&&!view.blind&&!s.epiphanyOffer){delete c.epiphany;if(!s.heroes[c.owner].upgrades[key]){s.epiphanyOffer=makeEpiphanyOffer(s,c.owner,key);emit(events,'epiphany',`${HEROES[c.owner].name} · ${CARDS[key].name} 번뜩임`,{hero:c.owner,card:key});}}
 if(s.tutorial?.active){if(s.tutorial.step==='attack-use')s.tutorial.step='defense-select';else if(s.tutorial.step==='defense-use')s.tutorial.step='end-turn';}
 if(b.spent>=3&&!b.supportCharged){s.support=Math.min(6,s.support+1);b.supportCharged=true;}
 if(!info.breakdown&&s.phase==='battle')chainTriggers(s,c,info,events);
 if(s.hp<=0)defeat(s,events);else{plans(s);checkVictory(s,events);}
 if(!info.breakdown&&s.phase==='battle'&&(info.keywords||[]).includes('finale')&&!b.chooseDiscard&&!b.pickDraw){emit(events,'finale',`${info.name} · 종극 — 턴 종료`,{hero:c.owner});endTurn(s,events);}
}
// 연계: chain cards in hand answer another hero's card once per turn each.
function chainTriggers(s,played,info,events){const b=s.battle;b.chainUsed??={};
 for(const c of [...b.hand]){if(c.owner===played.owner||b.chainUsed[c.uid])continue;const view=cardInfo(s,c),fx=view?.chain;if(!fx||!view.keywords.includes('chain'))continue;if(fx.on==='attack'&&info.type!=='attack')continue;
  b.chainUsed[c.uid]=true;emit(events,'chain',`${view.name} · 연계`,{uid:c.uid,hero:c.owner});
  const lim=fx.perTurn||1;b.chainCount??={};if(fx.ops){b.chainUsed[c.uid]=(b.chainCount[c.uid]=(b.chainCount[c.uid]||0)+1)>=lim;runOps(s,{c,info:view,owner:c.owner,h:s.heroes[c.owner],target:null,rate:view.injuryRate||1,mark:events.length,followUp:true,apSpent:0},fx.ops,events);}
  if(fx.allDamage)for(const e of [...livingEnemies(s)])damageEnemy(s,e,fx.allDamage,c.owner,events);if(fx.shield)addShield(s,c.owner,fx.shield,events);if(fx.crack)for(const e of livingEnemies(s))addCrack(e,fx.crack,events);if(fx.ap)b.ap=Math.min(6,b.ap+fx.ap);}
}
function applyCardExtras(s,c,info,events){
 const b=s.battle,h=s.heroes[c.owner],e=info.effects||{},key=info.effectiveKey||c.key,turnKey=c.owner+':'+key;
 b.effectUsed??={};b.generatedUsed??={};b.rewardUsed??={};
 const proc=!b.effectUsed[turnKey],killed=events.some(x=>x.type==='kill');
 if(e.shield)addShield(s,c.owner,e.shield,events,{party:c.owner==='illuga'});
 if(e.focus)h.buffs.focus=(h.buffs.focus||0)+e.focus;if(e.nextPierce)h.buffs.nextPierce=e.nextPierce;
 if(e.reflect){h.buffs.reflect=Math.max(h.buffs.reflect||0,e.reflect);h.buffs.reflectBy=c.owner;emit(events,'reflectReady',`${HEROES[c.owner].name} · 되비춤 준비`,{hero:c.owner});}
 if(e.heal&&proc){b.effectUsed[turnKey]=true;const n=Math.min(hpPts(s,e.heal),s.maxHp-s.hp);s.hp+=n;emit(events,'cardHeal',`공용 체력 +${n}`,{hero:c.owner,amount:n});}
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
 if(info.spark==='ember_mercy'&&!b.effectUsed[sparkGate+':heal']){b.effectUsed[sparkGate+':heal']=true;const n=Math.min(hpPts(s,3),s.maxHp-s.hp);s.hp+=n;emit(events,'cardHeal',`잔불의 온기 · 체력 +${n}`,{hero:c.owner,amount:n});}
}
/* ===== v0.36 stage 4: data-driven cards (cards-v2.js) ===== */
const PT=9/100; // percent of the base stat -> legacy points used by damageEnemy
function levelInc(h){return ((h?.level||1)-1)*.1;}
function dmgInc(s,id,info){const h=s.heroes[id],b=s.battle,item=EQUIPMENT[h.equipment.weapon];
 let inc=levelInc(h)+(item?.attack||0)*.05+(h.buffs.firstAttack?(item?.firstAttack||0)*.05:0)+(h.buffs.nextPct||0)/100+(h.buffs.awaken?.3:0)+(h.buffs.flins||0)*.05-Math.min(3,b.morale||0)*.05;
 if(info?.spark==='ember_force')inc+=.3;if(b.bigNext&&(info?.cost||0)>=3)inc+=b.bigNext/100;if(id==='kinich'&&b.kinichTurnDmg)inc+=b.kinichTurnDmg/100;if(id==='kinich'&&info?.mode==='crush'&&b.crushNext)inc+=b.crushNext/100;return inc;}
function kinichMode(b,m){return !!b&&(b.bothModes||(b.kmode||'chase')===m);}
function addTracks(s,n,events){const b=s.battle,before=b.tracks||0;b.tracks=Math.max(0,Math.min(10,before+n));if(b.tracks!==before)emit(events,'track',`추적흔 ${b.tracks}`,{hero:'kinich',amount:b.tracks});}
function lastTarget(s){const live=livingEnemies(s);return live.find(e=>e.id===s.battle.lastTarget)||live[0]||null;}
function giveShield(s,owner,ids,pct,events,label=''){ids=ids.filter(id=>s.party.includes(id)&&!s.heroes[id].retired);if(!ids.length||pct<=0)return 0;const each=Math.max(1,Math.round(heroStats(owner).def*pct/100));for(const id of ids)s.heroes[id].shield=(s.heroes[id].shield||0)+each;syncShield(s);emit(events,'shield',`${label||(HEROES[owner]?.name||'')+' 보호막'} +${each}${ids.length>1?' · 파티 전원':''}`,{hero:owner,amount:each*ids.length,each,targets:ids});return each;}
function gainAp(s,owner,n,events){const b=s.battle;if(n>0){b.ap=Math.min(6,b.ap+n);b.apRestored=true;emit(events,'resource',`행동력 +${n}`,{hero:owner,amount:n});if(owner==='jahoda'&&active(s).includes('jahoda')){const e=[...livingEnemies(s)].sort((x,y)=>y.hp-x.hp)[0];if(e)addCrack(e,1,events);}}else b.ap=Math.max(0,b.ap+n);}
function drawN(s,n,events){const b=s.battle,before=new Set(b.hand.map(c=>c.uid));if(n>0)draw(s,n,events);const drawn=b.hand.filter(c=>!before.has(c.uid));b.drawnThisTurn=(b.drawnThisTurn||0)+drawn.length;return drawn;}
function createCard(s,owner,key,events,o={}){const b=s.battle;if(!CARDS[key])return null;if(key==='l_frost'&&!o.force&&b.hand.filter(c=>c.key==='l_frost').length>=3)return null;if(!o.force&&b.hand.length>=HAND_LIMIT)return null;
 b.genSeq=(b.genSeq||0)+1;const c={owner,key,uid:`gen-${key}-${b.turn}-${b.genSeq}`,gen:true};if(o.retain)c.keepRetain=true;bindBlind(s,c,true);b.hand.push(c);emit(events,'createCard',`${CARDS[key].name} 생성`,{hero:owner,uid:c.uid});return c;}
// A card leaves the hand without being played. Returns 'frost' for 서리 파편 so callers can batch the follow-up.
function discardCard(s,c,events,o={}){const b=s.battle;b.discardedThisTurn=(b.discardedThisTurn||0)+1;delete c.retained;delete c.initiative;const view=cardInfo(s,c),info=view?.actual||view;
 emit(events,'discard',`${CARDS[c.key]?.name||'카드'} 버림`,{uid:c.uid,hero:c.owner});
 if(c.key==='l_frost'){b.exhaust.push(c);return 'frost';}
 if(c.parts){b.discard.push(...c.parts);return 'ok';}
 if(o.toTop)b.draw.push(c);else if(o.toBottom)b.draw.unshift(c);else if(o.returnShards&&info?.shard&&b.hand.length<HAND_LIMIT)b.hand.push(c);else toDiscard(s,c,events);
 if(info?.onDiscard&&!info.breakdown&&livingEnemies(s).length)runOps(s,{c,info,owner:c.owner,h:s.heroes[c.owner],target:null,rate:info.injuryRate||1,mark:events.length,followUp:true,apSpent:0},info.onDiscard,events);
 return 'ok';}
function frostBurst(s,n,events,o={}){const b=s.battle;if(!n||!livingEnemies(s).length)return;const aoe=!!o.aoe||n>=3,pct=30+(o.pct||0)+(b.frostBoost||0),h=s.heroes.lohen;
 emit(events,'frost',`서리 파편 ${n}장 · 추가공격${aoe?' (전체)':''}`,{hero:'lohen',amount:n});
 for(let i=0;i<n;i++){const targets=aoe?[...livingEnemies(s)]:[lastTarget(s)].filter(Boolean);for(const e of targets)damageEnemy(s,e,pct*PT,'lohen',events,0,{inc:levelInc(h)+(aoe?0:.3)});}}
function lynetteStrike(s,events){const b=s.battle;if(b.lynetteUsed||!active(s).includes('lyney')||!livingEnemies(s).length)return;b.lynetteUsed=true;emit(events,'assist','리넷 · 깜짝 조수',{hero:'lyney'});for(const e of [...livingEnemies(s)])damageEnemy(s,e,20*PT,'lyney',events,0,{inc:levelInc(s.heroes.lyney)});}
function durinAssist(s,c,events){const b=s.battle;if(c.owner==='durin'||b.forecast||!active(s).includes('durin')||s.heroes.durin.breakdown||!livingEnemies(s).length)return;
 if((b.assists||0)>=3+(b.assistCap||0)||random(s)>=.5+(b.assistChance||0))return;b.assists=(b.assists||0)+1;const strong=!!b.solarReady;delete b.solarReady;emit(events,'assist',`두린 · 협공${strong?' (태양화)':''}`,{hero:'durin'});
 for(const e of [...livingEnemies(s)]){damageEnemy(s,e,25*PT,'durin',events,0,{inc:levelInc(s.heroes.durin)});if(strong&&e.hp>0)damageEnemy(s,e,60*PT,'durin',events,0,{stat:'def'});}
 b.solar=(b.solar||0)+1;if(b.solar>=3){b.solar=0;b.assistCap=(b.assistCap||0)+1;b.solarReady=true;emit(events,'solar','알베도 · 태양화 3 — 다음 협공 강화',{hero:'durin'});}}
function switchMode(s,events,{free=false}={}){const b=s.battle;b.kmode=(b.kmode||'chase')==='chase'?'crush':'chase';const first=!b.modeSwitched;b.modeSwitched=true;if(!free)b.modeLeft=Math.max(0,(b.modeLeft??1)-1);
 emit(events,'mode',`키니치 · 「${b.kmode==='chase'?'추적':'분쇄'}」 모드`,{hero:'kinich',mode:b.kmode,first,partner:b.kmode==='chase'?'mualani':'kachina'});createCard(s,'kinich','k_ajaw',events);}
function shardInfo(s,c){const v=cardInfo(s,c);return v?.actual||v;}
// 결합: after a Cyno card, a hand of two or more 심판의 편린 and nothing else merges into 칠흑의 심판.
function tryCombine(s,events){const b=s.battle;if(!b||s.phase!=='battle'||!active(s).includes('cyno')||s.heroes.cyno.breakdown||b.chooseDiscard||b.pickDraw||b.hand.length<2)return;
 if(!b.hand.every(c=>c.owner==='cyno'&&shardInfo(s,c)?.shard))return;const parts=b.hand.splice(0);let shards=parts.length,coef=(b.combineCoef||0)+(b.combineGrow||0);
 for(const p of parts){const i=shardInfo(s,p);if(i.shardCoefPerRetain)coef+=i.shardCoefPerRetain*(p.retained||0);}
 if(!b.combined&&b.combineFirstPlus)shards+=b.combineFirstPlus;if(b.combinePlus){shards+=b.combinePlus;b.combinePlus=0;}if(livingEnemies(s).some(e=>e.aim))shards++;
 b.combineCoef=0;if((b.persist||[]).some(p=>p.watch==='combineGrow'))b.combineGrow=(b.combineGrow||0)+15;b.combined=(b.combined||0)+1;
 const j={owner:'cyno',key:'c_judgment',uid:`judgment-${b.turn}-${b.combined}`,parts,shards,coef,gen:true};b.hand.push(j);emit(events,'combine',`심판의 편린 ${parts.length}장 결합 · 칠흑의 심판 (편린 ${shards})`,{hero:'cyno',uid:j.uid});}
function startDiscard(s,ctx,o,events){const b=s.battle,eligible=b.hand.filter(c=>o.filter!=='nonShard'||!shardInfo(s,c)?.shard),n=Math.min(o.n||1,eligible.length);
 b.discardCtx={owner:ctx.owner,filter:o.filter||null,optional:!!o.optional,allyAp:o.allyAp||0,toTop:!!o.toTop,toBottom:!!o.toBottom,returnShards:!!o.returnShards,thenDrawEqual:!!o.thenDrawEqual,extraDraw:o.extraDraw||0,apAt:o.apAt||0,then:o.then||null,count:0};
 b.chooseDiscard=n;if(!n)finishDiscard(s,events);}
function finishDiscard(s,events){const b=s.battle,d=b.discardCtx;b.chooseDiscard=0;delete b.discardCtx;if(!d)return;
 if(d.count>0&&d.owner==='lyney')lynetteStrike(s,events);
 if(d.thenDrawEqual&&d.count>0)drawN(s,d.count+d.extraDraw,events);if(d.apAt&&d.count>=d.apAt)gainAp(s,d.owner,1,events);
 if(d.then)runOps(s,{c:{owner:d.owner,key:'',uid:'after-discard'},info:{},owner:d.owner,h:s.heroes[d.owner],target:null,rate:1,mark:events.length,apSpent:0},d.then,events);
 if(d.owner==='cyno')tryCombine(s,events);}
function opCond(s,ctx,cond){const b=s.battle;if(cond==='frostInHand2')return b.hand.filter(c=>c.key==='l_frost').length>=2;if(cond==='track5')return (b.tracks||0)>=5;if(cond==='aimTarget')return !!ctx.target?.aim;return false;}
function runOps(s,ctx,ops,events){
 const b=s.battle,{c,info,h}=ctx,key=info?.effectiveKey||c?.key;
 for(const o of ops||[]){
  if(s.phase!=='battle')return;
  switch(o.op){
   case 'dmg':{
    const tracks=b.tracks||0;let pct=o.pct||0,used=0;
    if(o.retainPct&&c.retained)pct+=o.retainPct;if(o.perRetain)pct+=o.perRetain*Math.min(o.perMax||9,c.retained||0);
    if(o.perUse)pct+=o.perUse*Math.min(o.perMax||9,b.useCount?.[key]||0);
    if(o.perGraveAttack)pct+=o.perGraveAttack*Math.min(o.perMax||9,b.discard.filter(x=>x.owner===ctx.owner&&x.uid!==c.uid&&CARDS[x.key]?.type==='attack').length);
    if(o.perHand)pct+=o.perHand*b.hand.length;if(o.perDrawn)pct+=o.perDrawn*(b.drawnThisTurn||0);
    if(o.chainGrow){b.chainGrow??={};pct+=o.chainGrow*Math.min(o.perMax||9,b.chainGrow[c.uid]||0);b.chainGrow[c.uid]=(b.chainGrow[c.uid]||0)+1;}
    if(o.perTrack){pct+=o.perTrack*tracks;used=o.trackUse==='half'?Math.ceil(tracks/2):o.trackUse==='none'?0:tracks;}
    if(o.perTrackBonus)pct+=o.perTrackBonus*tracks;
    if(o.judgment)pct+=o.perAp*(ctx.apSpent||0)+o.perShard*(c.shards||0)+(c.coef||0);
    let hits=o.hits||1;
    if(o.multi){hits+=(b.bonusHits||0)+(b.multiPlus||0);b.bonusHits=0;if(ctx.owner==='kinich'&&kinichMode(b,'chase')&&(b.mualaniUsed||0)<2){hits++;b.mualaniUsed=(b.mualaniUsed||0)+1;}}
    const opts={inc:ctx.followUp?levelInc(h):dmgInc(s,ctx.owner,info)};
    if(o.ifShield&&(h.shield||0)>0)opts.inc+=o.ifShield/100;
    if(o.basis==='def')opts.stat='def';
    if(o.basis==='shield'){const sh=h.shield||0;opts.base=sh;h.shield=Math.round(sh*(o.keepShield||0));syncShield(s);}
    else if(h.buffs?.atkBonus&&o.basis!=='def')opts.atkAdd=h.buffs.atkBonus;
    if(ctx.owner==='kinich'&&kinichMode(b,'crush')){opts.defMul=.7;opts.wardMul=2;}
    if(o.pierceWard)opts.pierceWard=true;
    for(let i=0;i<hits&&s.phase==='battle';i++){
     const live=livingEnemies(s);if(!live.length)break;
     const targets=o.aoe?[...live]:o.random?[choose(s,live)]:[ctx.target&&ctx.target.hp>0?ctx.target:lastTarget(s)].filter(Boolean);
     for(const e of targets){const x={...opts};let p=pct;if(o.ifCrack&&e.crack>0)x.inc+=o.ifCrack/100;if(o.ifAim&&e.aim)p+=o.ifAim;if(o.crackMaxDouble&&(e.crack||0)>=CRACK_MAX)p*=2;if(ctx.owner==='cyno'&&e.aim)x.crBonus=.3;
      damageEnemy(s,e,p*(ctx.rate||1)*PT,ctx.owner,events,0,x);if(o.crack&&e.hp>0)addCrack(e,o.crack,events);b.lastTarget=e.id;}
     if(o.multi&&ctx.owner==='kinich')addTracks(s,o.trackPer||1,events);
    }
    if(used)addTracks(s,-used,events);
    if(o.judgment&&o.refund)gainAp(s,ctx.owner,o.refund,events);
    break;}
   case 'shield':{
    let pct=o.pct+(o.retainPct&&c.retained?o.retainPct:0)+(o.perHand?o.perHand*b.hand.length:0);pct*=(ctx.rate||1)*(1+levelInc(h)+(h.buffs.awaken?.3:0)+(info?.spark==='ember_bastion'?.5:0));
    const ids=o.who==='party'?active(s):[ctx.owner];giveShield(s,ctx.owner,ids,pct,events);
    if(o.scarDouble){const top=[...active(s)].sort((x,y)=>(s.heroes[y].scar||0)-(s.heroes[x].scar||0))[0];if(top&&(s.heroes[top].scar||0)>0)giveShield(s,ctx.owner,[top],pct,events,'상흔이 깊은 동료 보호막');}
    break;}
   case 'create':{
    if(o.battleCap){b.createCount??={};if((b.createCount[key]||0)>=o.battleCap)break;b.createCount[key]=(b.createCount[key]||0)+1;}
    let n=o.n||1;if(ctx.owner==='lyney'&&CARDS[o.card]?.generated&&!b.forecast&&random(s)<.3)n++;
    for(let i=0;i<n;i++)createCard(s,CARDS[o.card].owner,o.card,events,{force:o.force,retain:o.retain});break;}
   case 'draw':{const drawn=drawN(s,o.n||1,events);
    if(o.bonusIfGenerated&&drawn.some(x=>x.gen||CARDS[x.key]?.generated))drawN(s,o.bonusIfGenerated,events);
    if(o.discardNonShard){let frost=0;for(const x of drawn)if(!shardInfo(s,x)?.shard){const at=b.hand.indexOf(x);if(at>=0){b.hand.splice(at,1);if(discardCard(s,x,events)==='frost')frost++;}}if(frost)frostBurst(s,frost,events);}
    break;}
   case 'discard':startDiscard(s,ctx,o,events);break;
   case 'discardHand':{
    const pick=b.hand.filter(x=>o.filter!=='nonShard'||!shardInfo(s,x)?.shard),n=pick.length;
    if(!o.keep&&n){b.hand=b.hand.filter(x=>!pick.includes(x));let frost=0;for(const x of pick)if(discardCard(s,x,events)==='frost')frost++;if(frost)frostBurst(s,frost,events);if(ctx.owner==='lyney')lynetteStrike(s,events);}
    if(o.perPct&&n)for(const e of [...livingEnemies(s)])damageEnemy(s,e,o.perPct*n*(ctx.rate||1)*PT,ctx.owner,events,0,{inc:dmgInc(s,ctx.owner,info)});
    if(o.thenDraw)drawN(s,o.thenDraw,events);break;}
   case 'shuffleHand':{let frost=0;const keep=[];for(const x of b.hand.splice(0)){if((shardInfo(s,x)?.keywords||[]).includes('unplayable')){if(discardCard(s,x,events)==='frost')frost++;}else keep.push(x);}
    if(frost)frostBurst(s,frost,events);for(const x of keep){delete x.retained;delete x.initiative;}b.draw=shuffle(s,[...b.draw,...keep]);drawN(s,keep.length,events);break;}
   case 'pickDraw':{if(!b.draw.length&&b.discard.length)b.draw=shuffle(s,b.discard.splice(0));if(b.draw.length&&b.hand.length<HAND_LIMIT)b.pickDraw={n:o.n||1,owner:ctx.owner};break;}
   case 'ap':gainAp(s,ctx.owner,o.n,events);break;
   case 'apNext':b.apNext=(b.apNext||0)+o.n+(o.retainN&&c.retained?o.retainN:0);emit(events,'resource',`다음 턴 행동력 ${b.apNext>0?'+':''}${b.apNext}`,{hero:ctx.owner});break;
   case 'drawNext':b.drawNext=(b.drawNext||0)+o.n;break;
   case 'buffNext':h.buffs.nextPct=(h.buffs.nextPct||0)+o.pct+(o.retainPct&&c.retained?o.retainPct:0);break;
   case 'frostBoost':b.frostBoost=(b.frostBoost||0)+o.pct;break;
   case 'ifKill':runOps(s,ctx,events.slice(ctx.mark).some(x=>x.type==='kill')?o.ops:o.else,events);break;
   case 'if':if(opCond(s,ctx,o.cond))runOps(s,ctx,o.ops,events);break;
   case 'shatter':{const fr=b.hand.filter(x=>x.key==='l_frost');if(!fr.length)break;b.hand=b.hand.filter(x=>x.key!=='l_frost');for(const x of fr){b.exhaust.push(x);emit(events,'discard','서리 파편 버림',{uid:x.uid,hero:x.owner});}b.discardedThisTurn=(b.discardedThisTurn||0)+fr.length;frostBurst(s,fr.length,events,{pct:o.pct,aoe:o.aoe});if(o.drawEach)drawN(s,fr.length,events);break;}
   case 'javelin':{const n=Math.min(o.max,b.discardedThisTurn||0);let made=0;for(let i=0;i<n;i++)if(createCard(s,'lohen','l_frost',events))made++;if(o.drawHalf)drawN(s,Math.floor(n/2),events);break;}
   case 'costNext':b.costNext=(b.costNext||0)+(o.count||1);break;
   case 'assistBoost':b.assistChance=(b.assistChance||0)+(o.chance||0);b.assistCap=(b.assistCap||0)+(o.cap||0);break;
   case 'bigNext':b.bigNext=o.pct;break;
   case 'persist':{(b.persist??=[]).push({owner:ctx.owner,key,name:CARDS[key]?.name||'',ops:o.ops||null,lock:o.lock||null,watch:o.watch||null});const at=b.discard.indexOf(c);if(at>=0){b.discard.splice(at,1);b.exhaust.push(c);}emit(events,'persist',`${CARDS[key]?.name||'카드'} · 지속 효과`,{hero:ctx.owner});break;}
   case 'reflect':h.buffs.reflect=Math.max(h.buffs.reflect||0,Math.round(o.pct*(ctx.rate||1)*PT*100)/100);h.buffs.reflectBy=ctx.owner;if(o.aoe)h.buffs.reflectAoe=true;if(o.ap)h.buffs.reflectAp=o.ap;emit(events,'reflectReady',`${HEROES[ctx.owner].name} · 되비춤 준비`,{hero:ctx.owner});break;
   case 'cover':{for(const id of o.all?active(s):[ctx.ally].filter(x=>s.party.includes(x))){const t=s.heroes[id];t.buffs.cover=o.stress;if(o.shieldPct)giveShield(s,ctx.owner,[id],o.shieldPct*(ctx.rate||1),events);if(o.buff)t.buffs.nextPct=(t.buffs.nextPct||0)+o.buff;emit(events,'cover',`${HEROES[id].name}에게 길잡이 불빛`,{hero:id});}break;}
   case 'heal':{const want=Math.round(hpPts(s,o.pct)*(ctx.rate||1)),n=Math.min(want,s.maxHp-s.hp);s.hp+=n;for(const id of o.scarAll?active(s):[ctx.owner])s.heroes[id].scar=Math.max(0,(s.heroes[id].scar||0)-want);emit(events,'cardHeal',`공용 체력 +${n}`,{hero:ctx.owner,amount:n});if(o.overShield&&want>n){h.shield=(h.shield||0)+(want-n);syncShield(s);emit(events,'shield',`넘친 온기 · 보호막 +${want-n}`,{hero:ctx.owner,amount:want-n,each:want-n,targets:[ctx.owner]});}break;}
   case 'stressImmune':b.stressImmune=true;break;
   case 'track':addTracks(s,o.n,events);break;
   case 'modeExtra':b.modeLeft=(b.modeLeft??1)+(o.n||1);break;
   case 'autoSwitch':if(active(s).includes('kinich'))switchMode(s,events,{free:true});break;
   case 'bonusHits':b.bonusHits=(b.bonusHits||0)+o.n+(o.retainN&&c.retained?o.retainN:0);break;
   case 'multiPlus':b.multiPlus=(b.multiPlus||0)+o.n;break;
   case 'crushNext':b.crushNext=o.pct;break;
   case 'bothModes':b.bothModes=true;break;
   case 'turnDmg':b.kinichTurnDmg=(b.kinichTurnDmg||0)+o.pct;break;
   case 'hatProc':b.hatProc=o.pct;break;
   case 'hatUsed':if(b.hatProc&&livingEnemies(s).length)damageEnemy(s,choose(s,livingEnemies(s)),b.hatProc*PT,'lyney',events,0,{inc:levelInc(s.heroes.lyney)});break;
   case 'combineCoef':b.combineCoef=(b.combineCoef||0)+o.pct;break;
   case 'combinePlus':if(o.first){if(!b.combined)b.combineFirstPlus=Math.max(b.combineFirstPlus||0,o.n);}else b.combinePlus=(b.combinePlus||0)+o.n;break;
   case 'aim':if(ctx.target&&ctx.target.hp>0){ctx.target.aim=true;emit(events,'aim',`${ctx.target.name} · 조준점`,{enemy:ctx.target.id,hero:'cyno'});}break;
   case 'recoverShard':{const at=b.discard.findIndex(x=>x.owner==='cyno'&&CARDS[x.key]?.shard);if(at>=0&&b.hand.length<HAND_LIMIT){const [x]=b.discard.splice(at,1);b.hand.push(x);emit(events,'draw','무덤의 편린을 되찾았습니다.',{uid:x.uid,hero:'cyno'});}break;}
  }
 }
}
function cardInfoV2(s,c,h,key,blind){
 const base=CARDS[key],branch=h.upgrades[key]||null,spec=branch?V2_BRANCHES[key]?.[branch]:null,form={...base,...(spec||{})},b=s.battle,rate=armEffectRate(h),tracks=b?.tracks||0;
 let keywords=cardKeywords(form);if(c.keepRetain)keywords=cardKeywords({keywords:[...keywords.filter(k=>k!=='evaporate'),'retain']});
 let cost=form.xCost?(b?.ap||0):form.cost,discounted=false;
 if(form.costRule==='retained0'&&c.retained)cost=0;if(form.costRule==='apRestored0'&&b?.apRestored)cost=0;if(form.costRule==='track5'&&tracks>=5)cost=0;if(form.costRule==='track3'&&tracks>=3)cost=0;
 const sparkId=h.sparks?.[key]||null,sparkInfo=sparkId?SPARK_EFFECTS[sparkId]:null;
 if(!form.xCost){if(c.initiative&&keywords.includes('initiative'))cost=Math.max(0,cost-1);if(sparkId==='ember_cost')cost=Math.max(0,cost-1);if(b?.costNext>0&&cost>0){cost--;discounted=true;}}
 const first=form.ops.find(o=>o.op==='dmg')||form.ops.find(o=>o.op==='shield'),st=heroStats(c.owner),dp=first?.op==='dmg'?((first.pct||0)+(first.perTrack||0)*tracks+(first.judgment?first.perAp*(b?.ap||0)+first.perShard*(c.shards||0)+(c.coef||0):0))*(first.hits||1):0;
 const amount=first?Math.round((first.op==='dmg'?dp*9/100:first.pct*7/200)*rate):1;
 const numbers=first?.op==='dmg'&&!first.basis?{damage:Math.round(dp*st.atk/100*rate),crit:st.cr,critDamage:Math.round(dp*st.atk/100*rate*st.cd)}:first?.op==='shield'?{shield:Math.round(first.pct*st.def/100*rate),party:first.who==='party'}:null;
 let desc=(keywords.length?keywordLine(keywords)+'. ':'')+form.text;if(c.parts)desc+=` (편린 ${c.shards}${c.coef?`, 계수 +${c.coef}%`:''})`;if(rate<1)desc+=` (팔 부상: 효과 ${Math.round(rate*100)}%)`;if(sparkInfo)desc+=' '+sparkInfo.desc;
 const actual={...form,name:base.name,title:spec?.title||null,amount,numbers,keywords,cost:c.epiphany&&!blind?0:cost,baseCost:cost,discounted,epiphany:!!c.epiphany&&!blind,desc,effects:{},exhaust:keywords.includes('exhaust'),upgraded:!!branch,branch,spark:sparkId,sparkName:sparkInfo?.name||null,effectiveKey:key,injuryRate:rate,blurred:h.body.eyes===2,v2:true};
 if(form.xCost)actual.displayCost='X';
 return blind?{...actual,name:'실명',desc:'??',displayCost:'?',upgraded:false,blind:true,target:'none',type:'blind',actual}:actual;
}
function playV2(s,c,info,target,a,events){
 const b=s.battle,h=s.heroes[c.owner],key=info.effectiveKey;(b.useCount??={});(b.turnUses??={});
 if(info.discounted)b.costNext=Math.max(0,(b.costNext||0)-1);
 if(c.owner==='cyno'&&info.type==='attack'&&!b.aimGiven&&target){target.aim=true;b.aimGiven=true;emit(events,'aim',`타이나리 · ${target.name}에게 조준점`,{enemy:target.id,hero:'cyno'});}
 const ctx={c,info,owner:c.owner,h,target,ally:a.target,rate:info.injuryRate||1,mark:events.length,apSpent:info.cost};
 runOps(s,ctx,info.ops||[],events);
 b.useCount[key]=(b.useCount[key]||0)+1;b.turnUses[key]=(b.turnUses[key]||0)+1;
 if(info.type==='attack'){delete h.buffs.nextPct;delete h.buffs.awaken;delete h.buffs.flins;h.buffs.firstAttack=false;if(info.cost>=3)delete b.bigNext;if(c.owner==='kinich'&&info.mode==='crush')delete b.crushNext;if(s.phase==='battle')durinAssist(s,c,events);}
 if(info.type==='guard')delete h.buffs.awaken;
 if(c.parts&&s.phase==='battle')createCard(s,'cyno','c_feather',events);
 if(s.phase!=='battle')return;
 if(info.spark==='ember_support')s.support=Math.min(6,s.support+1);if(info.spark==='ember_calm')h.stress=Math.max(0,h.stress-4);
 b.effectUsed??={};const gate='spark:'+c.owner;
 if(info.spark==='ember_draw'&&!b.effectUsed[gate+':draw']){b.effectUsed[gate+':draw']=true;drawN(s,1,events);}
 if(info.spark==='ember_mercy'&&!b.effectUsed[gate+':heal']){b.effectUsed[gate+':heal']=true;const n=Math.min(hpPts(s,3),s.maxHp-s.hp);s.hp+=n;emit(events,'cardHeal',`잔불의 온기 · 체력 +${n}`,{hero:c.owner,amount:n});}
 if(info.cost===0&&!b.zeroUsed){b.zeroUsed=true;if((b.persist||[]).some(p=>p.watch==='firstZero'))gainAp(s,'jahoda',1,events);}
 if(c.owner==='cyno')tryCombine(s,events);
}
function support(s,a,events){
 if(s.phase!=='battle')reject('전투 중에 지원을 요청할 수 있습니다.');const b=s.battle;let id=a.hero;
 if(!HEROES[id])id=Object.keys(HEROES).find(x=>HEROES[x].partner===a.hero);
 if(!s.party.includes(id))reject('편성된 동료의 파트너만 지원할 수 있습니다.');if(s.support<2)reject('지원 게이지가 부족합니다.');if(b.supportUsed)reject('파트너 지원은 턴마다 한 번 사용할 수 있습니다.');
 const e=livingEnemies(s).find(x=>x.id===a.target),partner=id==='kinich'?(b.kmode==='crush'?'kachina':'mualani'):HEROES[id].partner;if((['illuga','jahoda','cyno'].includes(id)||partner==='kachina')&&!e)reject('지원 공격의 대상을 선택하세요.');
 pushUndo(s);s.support-=2;b.supportUsed=true;if(s.tutorial?.active&&s.tutorial.step==='partner-use')s.tutorial.step='free';emit(events,'support',`${HEROES[id].partnerNames?.[partner]||HEROES[id].partnerName}의 지원`,{hero:id,partner});const cutin=`support-${partner}`;if(!s.collection.cutins.includes(cutin))s.collection.cutins.push(cutin);
 if(id==='lohen'){const enemies=[...livingEnemies(s)];for(const x of enemies)damageEnemy(s,x,enemies.length===1?24:16,id,events,enemies.length===1?6:0);}
 if(id==='durin'){addShield(s,id,13,events,{party:true,label:'알베도의 보호막'});b.ap=Math.min(6,b.ap+1);emit(events,'resource','알베도 · 행동력 +1',{hero:id});}
 if(id==='illuga'){damageEnemy(s,e,20,id,events);s.heroes.illuga.buffs.flins=7;}
 if(id==='jahoda'){damageEnemy(s,e,17,id,events);if(e.hp>0)addCrack(e,2,events);}
 if(partner==='mualani'){for(const x of [...livingEnemies(s)])damageEnemy(s,x,60*PT,id,events,0,{inc:levelInc(s.heroes[id])});addTracks(s,3,events);}
 if(partner==='kachina'){if(e.ward||e.hitWard){e.ward=0;e.hitWard=0;e.stun=1;emit(events,'break',`${e.name}의 장막이 부서집니다.`,{enemy:e.id});}addCrack(e,2,events);}
 if(id==='lyney'){giveShield(s,id,[id],150,events,'리넷의 엄호 · 보호막');drawN(s,3,events);startDiscard(s,{owner:id},{n:1},events);}
 if(id==='cyno'){e.aim=true;b.aimGiven=true;emit(events,'aim',`타이나리 · ${e.name}에게 조준점`,{enemy:e.id,hero:id});for(let i=0;i<2&&e.hp>0;i++)damageEnemy(s,e,80*PT,id,events,0,{inc:levelInc(s.heroes[id]),crBonus:.3});}
 plans(s);checkVictory(s,events);
}
function ultimate(s,a,events){
 if(s.phase!=='battle')reject('전투 중에 필살기를 사용할 수 있습니다.');const id=a.hero,b=s.battle,h=s.heroes[id];
 if(id==='kinich'){ // 확정 기록: 키니치의 필살기 버튼 = 모드 전환 (게이지 0, 턴당 1회)
  if(!s.party.includes(id))reject('출전한 전투원을 선택하세요.');if(h.retired)reject('이탈한 전투원은 필살기를 사용할 수 없습니다.');if(h.breakdown)reject('붕괴 상태에서는 모드를 바꿀 수 없습니다.');if(b.chooseDiscard||b.pickDraw)reject('먼저 카드를 선택하세요.');if((b.modeLeft??1)<=0)reject('이번 턴에는 이미 모드를 바꿨습니다.');
  pushUndo(s);const first=!b.modeSwitched;switchMode(s,events);if(first&&!s.collection.cutins.includes('ultimate-kinich'))s.collection.cutins.push('ultimate-kinich');plans(s);return;
 }
 if(!HEROES[id]||!s.party.includes(id))reject('출전한 전투원을 선택하세요.');if(h.retired)reject('이탈한 전투원은 필살기를 사용할 수 없습니다.');if(h.breakdown)reject('붕괴 상태에서는 필살기를 사용할 수 없습니다.');if(b.chooseDiscard)reject('먼저 버릴 카드를 선택하세요.');if(b.ultimates?.[id])reject('이 전투에서 이미 필살기를 사용했습니다.');if(s.support<3)reject('필살기는 지원 게이지 3이 필요합니다.');
 const target=livingEnemies(s).find(e=>e.id===a.target);if(['lohen','cyno'].includes(id)&&!target)reject('필살기로 공격할 적을 선택하세요.');
 pushUndo(s);s.support-=3;(b.ultimates??={})[id]=true;emit(events,'ultimate',`${HEROES[id].name} · 필살기`,{hero:id});const cutin=`ultimate-${id}`;if(!s.collection.cutins.includes(cutin))s.collection.cutins.push(cutin);
 if(id==='lohen')damageEnemy(s,target,34,id,events,10);
 if(id==='durin')for(const e of [...livingEnemies(s)])damageEnemy(s,e,22,id,events);
 if(id==='illuga'){addShield(s,id,25,events,{party:true,label:'일루가 필살기 · 보호막'});for(const ally of active(s)){const ah=s.heroes[ally];ah.buffs.reflect=Math.max(ah.buffs.reflect||0,12);ah.buffs.reflectBy='illuga';}emit(events,'reflectReady','파티 전원 · 되비춤 준비',{hero:id});}
 if(id==='jahoda'){b.ap=Math.min(6,b.ap+2);draw(s,Math.max(0,2-[h.body.leftArm,h.body.rightArm].filter(n=>n===3).length),events);emit(events,'resource','행동력 +2 · 카드 드로우',{hero:id});}
 if(id==='lyney'){for(const e of [...livingEnemies(s)])damageEnemy(s,e,200*PT,id,events,0,{inc:levelInc(h)});if(s.phase==='battle')drawN(s,3,events);}
 if(id==='cyno'){damageEnemy(s,target,350*PT,id,events,0,{inc:levelInc(h),crBonus:target.aim?.3:0});if(s.phase==='battle')for(const k of ['c_thrust','c_claw','c_gaze'])createCard(s,id,k,events);}
 plans(s);checkVictory(s,events);
}
function endTurn(s,events){
 if(s.phase!=='battle')reject('전투 중이 아닙니다.');const b=s.battle;if(b.chooseDiscard)reject('먼저 버릴 카드를 선택하세요.');if(b.pickDraw)reject('먼저 가져올 카드를 고르세요.');
 {const early=b.hand.filter(c=>{const i=shardInfo(s,c);return c.key==='l_frost'||(i?.onDiscard&&!(i.keywords||[]).includes('retain')&&!i.breakdown);});
  if(early.length){b.hand=b.hand.filter(c=>!early.includes(c));let frost=0;for(const c of early)if(discardCard(s,c,events)==='frost')frost++;if(frost)frostBurst(s,frost,events);checkVictory(s,events);if(s.phase!=='battle')return;}}
 for(const e of [...livingEnemies(s)]){
  if(s.phase!=='battle')break;const it=e.intent;if(e.hp<=0)continue;if(e.stun){e.stun--;e.turn++;continue;}
  if(it.restore&&e.echo){e.echo=false;e.hp=Math.ceil(e.maxHp*.35);emit(events,'echoRestore','잔향이 육체를 복원합니다.',{enemy:e.id});}
  emit(events,'enemyAction',`${e.name} · ${it.name}`,{enemy:e.id,hero:it.target,name:it.name,damage:it.damage||0,stress:it.stress||0});
  const th=s.heroes[it.target],blocked=Math.min(th?.shield||0,it.damage||0);if(th)th.shield-=blocked;syncShield(s);const taken=Math.max(0,(it.damage||0)-blocked);s.hp=Math.max(0,s.hp-taken);if(th&&taken){th.lost=Math.min(heroStats(it.target).hp,(th.lost||0)+taken);th.scar=(th.scar||0)+taken;}
  if(it.damage)emit(events,'enemyAttack',`${e.name} · ${it.name}: 피해 ${taken}`,{enemy:e.id,hero:it.target,amount:taken,blocked});
  if(blocked>0&&taken===0&&th?.buffs?.reflect&&e.hp>0){emit(events,'reflect',`${HEROES[it.target].name} · 되비춤`,{hero:it.target,enemy:e.id});for(const x of th.buffs.reflectAoe?[...livingEnemies(s)]:[e])damageEnemy(s,x,th.buffs.reflect,th.buffs.reflectBy||it.target,events,0,{stat:'def'});if(th.buffs.reflectAp&&!b.reflectApUsed){b.reflectApUsed=true;b.apNext=(b.apNext||0)+th.buffs.reflectAp;}if(e.hp<=0)continue;}
  if(blocked>0&&th&&th.shield===0&&active(s).includes('illuga')&&e.hp>0){emit(events,'reflect','플린스 · 깨진 불빛의 응징',{hero:'illuga',enemy:e.id});damageEnemy(s,e,40*PT,'illuga',events,0,{stat:'def'});if(e.hp<=0)continue;}
  b.hitStress??={};let mental=it.stress||0;if(taken>0&&(b.hitStress[it.target]||0)<HIT_STRESS_CAP){b.hitStress[it.target]=(b.hitStress[it.target]||0)+1;mental+=ENEMIES[e.kind]?.boss?HIT_STRESS.boss:isEliteFight(s)?HIT_STRESS.elite:HIT_STRESS.normal;}if(mental)stress(s,it.target,mental,events,it.mental?'정신공격':it.tag);
  if(it.corrosion)b.corrosion=Math.max(b.corrosion,it.corrosion);
  if(taken>0&&injuryChance(s.heroes[it.target],!!it.injury)>0&&random(s)<injuryChance(s.heroes[it.target],!!it.injury))injury(s,it.target,null,events);
  if(it.summon&&livingEnemies(s).filter(x=>x.kind==='angler').length<2){const angler=makeEnemy(s,'angler',b.turn*10);b.enemies.push(angler);if(!s.collection.codex.includes('angler'))s.collection.codex.push('angler');if(!s.collection.codex.includes(angler.look))s.collection.codex.push(angler.look);emit(events,'summon',`${angler.name} 하나가 나타납니다.`);}
  if(it.stars&&!livingEnemies(s).some(x=>x.kind==='star')){const pair=[makeEnemy(s,'star',b.turn*10),makeEnemy(s,'star',b.turn*10+1)];b.enemies.push(...pair);for(const k of ['star',pair[0].look])if(!s.collection.codex.includes(k))s.collection.codex.push(k);emit(events,'summon',`${pair[0].name} 둘이 펼쳐집니다.`);}
  e.turn++;if(e.wither)e.wither--;if(s.hp<=0)defeat(s,events);
 }
 if(s.phase!=='battle')return;if(s.tutorial?.active&&s.tutorial.step==='end-turn')s.tutorial.step='refill';
 if(b.corrosion){const cor=hpPts(s,2);s.hp=Math.max(0,s.hp-cor);b.corrosion--;emit(events,'corrosion',`침식 · 공용 체력 -${cor}`,{amount:cor});if(s.hp<=0){defeat(s,events);return;}}
 {const il=s.heroes.illuga;if(il){const carry=active(s).includes('illuga')?Math.round((il.shield||0)*.3*1.2):0;if(carry)il.buffs.atkBonus=carry;else delete il.buffs.atkBonus;}}
 clearShields(s);for(const id of s.party){const h=s.heroes[id];if(h.buffs.focus)delete h.buffs.focus;delete h.buffs.counterReady;delete h.buffs.reflect;delete h.buffs.reflectBy;delete h.buffs.reflectAoe;delete h.buffs.reflectAp;delete h.buffs.nextPierce;delete h.buffs.nextPct;}
 for(const e of livingEnemies(s))if(e.crack)e.crack--;
 {const keep=[];for(const c of b.hand.splice(0)){const kw=cardInfo(s,c)?.keywords||[];
  if(c.parts){keep.push(c);continue;}
  if(kw.includes('evaporate')){b.exhaust.push(c);emit(events,'evaporate',`${CARDS[c.key]?.name||'카드'} · 증발`,{uid:c.uid,hero:c.owner});continue;}
  if(kw.includes('retain')){c.retained=(c.retained||0)+1;keep.push(c);emit(events,'retain',`${CARDS[c.key]?.name||'카드'} · 보존`,{uid:c.uid,hero:c.owner});continue;}
  emit(events,'discard',`${HEROES[c.owner].name}의 카드를 버립니다.`,{uid:c.uid,hero:c.owner});b.discard.push(c);delete c.initiative;}
  b.hand.push(...keep);}
 b.chainUsed={};b.chainCount={};b.hitStress={};b.turn++;b.ap=Math.max(0,3+(b.apNext||0));b.apNext=0;b.supportUsed=false;b.spent=0;b.supportCharged=false;b.recovered=false;b.effectUsed={};delete b.nextAttackDiscount;b.undoStack=[];
 Object.assign(b,{assists:0,assistCap:0,assistChance:0,frostBoost:0,discardedThisTurn:0,apRestored:false,turnUses:{},zeroUsed:false,costNext:0,bigNext:0,mualaniUsed:0,modeLeft:1,bothModes:false,multiPlus:0,kinichTurnDmg:0,hatProc:0,lynetteUsed:false,stressImmune:false,reflectApUsed:false});
 if(s.mode==='raid'&&s.raidRun&&b.turn>(s.raidRun.maxTurns||6)){settleRaid(s,events,'turnLimit');return;}if(b.morale)b.morale--;draw(s,5+(b.drawNext||0),events);b.drawNext=0;b.drawnThisTurn=0;rollInitiative(s);
 for(const p of b.persist||[])if(p.ops&&s.phase==='battle'&&active(s).includes(p.owner))runOps(s,{c:{owner:p.owner,key:p.key,uid:'persist-'+p.key},info:{effectiveKey:p.key,cost:0},owner:p.owner,h:s.heroes[p.owner],target:null,rate:1,mark:events.length,followUp:true,apSpent:0},p.ops,events);
 if(s.phase!=='battle')return;checkVictory(s,events);if(s.phase!=='battle')return;plans(s);emit(events,'turn',`${b.turn}번째 턴`);
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
 if(choice.mode==='challenge'){s.challengeStage=choice.stage;s.selectedStage=null;s.hp=Math.min(s.maxHp,s.hp+hpPts(s,25));beginBattle(s,choice.enemies,events);return;}
 if(choice.id==='return-base'){returnFromFarm(s);saveCheckpoint(s,false);}else{s.mode=choice.mode;s.node=choice.node;if(choice.lane!==undefined)s.lane=choice.lane;s.selectedStage={...choice};enterNode(s,events);}
 emit(events,'travel',`${choice.name}에 도착했습니다.`);
}
function rewardAdvance(s,events){
 if(s.phase!=='reward')reject('다음 경로로 이동할 수 없습니다.');settleReward(s,false,events);s.selectedStage=null;
 if(s.mode==='farm'){returnFromFarm(s);saveCheckpoint(s,false);emit(events,'base','보급을 정산하고 거점으로 돌아왔습니다. 회복하려면 생명의 불꽃을 선택하세요.');return;}
 if(s.mode==='challenge'){
  s.challengeStage++;if(s.challengeStage>=3){s.phase='ending';s.battle=null;if(!s.collection.endings.includes('first-front'))s.collection.endings.push('first-front');s.claimedEnding=true;emit(events,'ending','첫 전선에 다시 바람이 흐릅니다. 개발판 도전 완료.');return;}
  s.hp=Math.min(s.maxHp,s.hp+hpPts(s,25));beginBattle(s,s.challengeStage===1?['keeper']:['sentinel'],events);return;
 }
 s.node=Math.min(ROUTE.length-1,s.node+1);s.battle=null;enterNode(s,events);
}
export function canCare(s,id){return s.phase==='base'&&!s.careUsed&&s.party.includes(id)&&!!s.heroes[id]?.breakdown;}
function availableDiscoveries(s,owner){
 const h=s.heroes[owner],known=new Set([...(h.legacyLoadout?LEGACY_STARTERS:STARTERS)[owner],...h.acquired]);
 return DISCOVERIES[owner].filter(key=>!known.has(key));
}
function learnCard(s,owner,key){
 const n=s.heroes[owner].acquired.filter(k=>k===key).length;s.heroes[owner].acquired.push(key);
 return {owner,key,uid:owner+'-awaken-'+key+(n?'-'+(n+1):'')};
}
// v0.26: after a won battle the party is offered three cards (or may skip).
export function makeCardOffer(s,source='battle',returnPhase='travel'){
 const copies=(owner,key)=>ownedDeck(s,owner).filter(c=>c.key===key).length;
 const pool=active(s).flatMap(owner=>(REWARD_POOL[owner]||[]).filter(key=>CARDS[key]&&copies(owner,key)<((CARDS[key].keywords||[]).includes('unique')?1:2)).map(key=>({owner,key})));
 const shuffled=shuffle(s,pool),picked=[],same=(a,b)=>a.owner===b.owner&&a.key===b.key;
 for(const c of shuffled)if(picked.length<3&&!picked.some(x=>x.owner===c.owner))picked.push(c);
 for(const c of shuffled)if(picked.length<3&&!picked.some(x=>same(x,c)))picked.push(c);
 return picked.length?{id:`${source}-${s.node}-${s.rng}`,source,returnPhase,candidates:picked}:null;
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
 const pool=s.party.flatMap(owner=>[...new Set([...ownedDeck(s,owner).map(c=>c.key),...availableDiscoveries(s,owner),...(owner==='cyno'?['c_judgment']:[])])].filter(key=>INSIGHTS[key]&&!CARDS[key].debuff&&!CARDS[key].generated&&!s.heroes[owner].upgrades[key]).map(key=>({owner,key})));
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
function returnFromFarm(s){const loc=s.farmReturn||{node:7,mode:'route',selectedStage:null};s.mode=loc.mode;s.node=loc.node;if(loc.lane!==undefined)s.lane=loc.lane;s.selectedStage=loc.selectedStage;s.farmReturn=null;s.phase='base';s.healUsed=false;s.battle=null;s.upgradeOffer=null;}
function finishRecruit(s,events){s.recruitNotice=null;s.battle=null;if(s.tutorial?.active){s.selectedStage=null;if(s.party.length<3){s.node=2;beginBattle(s,['trainingSlime','trainingSlime'],events);}else{s.tutorial={...s.tutorial,active:false,completed:true,step:'complete'};s.collection.tutorialDone=true;s.node=7;enterNode(s,events);}}else{s.phase='reward';s.lastReward=null;}}
function applyEventCost(s,cost,events){
 s.hp=Math.max(0,s.hp-hpPts(s,cost.hp||0));if(cost.gold)s.gold=Math.max(0,s.gold-cost.gold);if(cost.stress)for(const id of s.party)stress(s,id,cost.stress,events);
 if(cost.curse){const hero=choose(s,s.party);for(let i=0;i<cost.curse;i++)s.heroes[hero].curses.push({key:'curse_echo',uid:`curse-${s.rng}-${s.node}-${s.heroes[hero].curses.length}`});}
 for(let i=0;i<(cost.injury||0);i++){const targets=active(s);if(targets.length)injury(s,choose(s,targets),null,events);}
}
function resolveEvent(s,id,events){const choice=s.eventOffer?.choices.find(c=>c.id===id);if(!choice)reject('사건의 선택지를 확인하세요.');if(!choice.dice&&!choice.mystery&&(choice.cost?.gold||0)>s.gold)reject('모라가 부족합니다.');
 let b=choice.benefit,cost=choice.cost||{};const result={title:s.eventOffer.name,choice:choice.label,benefit:clone(b||{}),cost:clone(cost)};
 if(choice.dice){const die=1+Math.floor(random(s)*20),bonus=(s.party.includes('jahoda')?2:0)+(choice.dice.hero&&s.party.includes(choice.dice.hero)?2:0),total=die+bonus,success=total>=choice.dice.dc;Object.assign(result,{die,roll:die,bonus,total,dc:choice.dice.dc,target:choice.dice.dc,success});if(!success){b={kind:'none'};cost={...cost,...(choice.fail||{})};result.benefit=clone(b);result.cost=clone(cost);}}
 if(choice.mystery){const outcome=choose(s,choice.mystery);b=outcome.benefit;cost=outcome.cost||{};result.benefit=clone(b);result.cost=clone(cost);result.revealed=true;}
 s.eventResult=result;s.lastReward=null;s.phase='reward';s.eventOffer=null;
 applyEventCost(s,cost,events);
 if(b.kind==='gold')s.gold+=b.amount;if(b.kind==='equipment'){const key=b.item||gearDrop(s,!!b.elite);s.inventory.push(key);s.eventResult.item=key;}if(b.kind==='upgrade'){s.upgradeOffer=makeUpgradeOffer(s,'event','reward');if(s.upgradeOffer)s.phase='refine';else{s.gold+=15;s.eventResult.fallback='각성 가능한 카드가 없어 15모라를 받았습니다.';}}if(b.kind==='remove'){s.removalOffer={source:'event'};s.phase='eventRemove';}
 if(b.kind==='heal'){const n=Math.min(hpPts(s,b.amount),s.maxHp-s.hp);s.hp+=n;s.eventResult.healed=n;}
 if(b.kind==='calm')for(const id of s.party){const h=s.heroes[id];if(!h.breakdown)h.stress=Math.max(0,h.stress-b.amount);}
 if(b.kind==='support')s.support=Math.min(6,s.support+b.amount);
 if(b.kind==='card'){s.cardOffer=makeCardOffer(s,'event','reward');if(s.cardOffer)s.phase='cardReward';else{s.gold+=15;s.eventResult.fallback='고를 수 있는 카드가 없어 15모라를 받았습니다.';}}
 emit(events,choice.dice?'dice':'event',choice.label,{benefit:b,cost,...(choice.dice?result:{})});if(s.hp<=0)defeat(s,events);
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
  case 'claimReward':if(s.phase!=='reward')reject('받을 보상이 없습니다.');settleReward(s,!!a.skip,events);s.phase='travel';if(!a.skip&&s.lastReward?.cardOffer){s.cardOffer={...clone(s.lastReward.cardOffer),then:s.lastReward.upgradeOffer?'refine':'travel'};s.phase='cardReward';break;}if(!a.skip&&s.lastReward?.upgradeOffer){s.upgradeOffer=clone(s.lastReward.upgradeOffer);s.upgradeOffer.returnPhase='travel';s.phase='refine';}break;
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
   else{const die=1+Math.floor(random(s)*20),bonus=s.party.includes('jahoda')?3:1,success=die+bonus>=12;s.eventResult={choice:'risk',die,roll:die,bonus,total:die+bonus,dc:12,target:12,success,gold:success?25:8};s.gold+=success?25:8;if(!success){for(const id of s.party)stress(s,id,12,events,'의태');injury(s,choose(s,active(s)),null,events);}else s.hp=Math.min(s.maxHp,s.hp+hpPts(s,10));emit(events,'dice',success?'균열 너머의 보급품을 확보했습니다.':'기괴한 잔향이 남았습니다.',s.eventResult);}
   s.phase='reward';break;
  }
  case 'camp':{
   if(s.phase!=='camp'||!['rest','prepare','calm'].includes(a.choice))reject('야영의 선택지를 확인하세요.');if((s.campActions||[]).length)reject('야영에서는 한 가지 행동만 고를 수 있습니다.');if(a.choice==='calm'&&(!s.party.includes(a.hero)||s.heroes[a.hero].retired))reject('함께 이야기할 동료를 고르세요.');(s.campActions??=[]).push(a.choice);s.lastReward=null;
   if(a.choice==='rest'){s.hp=Math.min(s.maxHp,s.hp+hpPts(s,20));for(const id of s.party){const h=s.heroes[id];h.stress=Math.max(0,h.stress-8);}emit(events,'camp','불빛 곁에서 몸을 쉬었습니다. 체력 +20% · 정신 부담 -8.');}
   else if(a.choice==='calm'){const h=s.heroes[a.hero];h.stress=Math.max(0,h.stress-30);emit(events,'camp',`${HEROES[a.hero].name}와 밤새 이야기를 나눴습니다. 정신 부담 -30.`,{hero:a.hero});}
   else{s.support=Math.min(6,s.support+2);s.gold+=10;for(const id of s.party)s.heroes[id].stress=Math.max(0,s.heroes[id].stress-4);emit(events,'camp','장비를 점검하고 다음 전투의 지원을 준비했습니다.');}break;
  }
  case 'play':{const owner=s.battle?.hand.find(c=>c.uid===a.uid)?.owner;play(s,a,events);if(owner)battleAwakening(s,owner,events);break;}
  case 'discard':{
   if(s.phase!=='battle'||!s.battle.chooseDiscard)reject('버릴 카드를 선택하는 중이 아닙니다.');const b=s.battle,d=b.discardCtx,i=b.hand.findIndex(c=>c.uid===a.uid);if(i<0)reject('손패에서 버릴 카드를 선택하세요.');if(d?.filter==='nonShard'&&shardInfo(s,b.hand[i])?.shard)reject('심판의 편린이 아닌 카드를 고르세요.');const [c]=b.hand.splice(i,1);
   if(d){d.count++;if(d.allyAp&&c.owner!==d.owner)gainAp(s,d.owner,d.allyAp,events);}if(discardCard(s,c,events,d||{})==='frost')frostBurst(s,1,events);b.chooseDiscard--;
   if(d&&(b.chooseDiscard<=0||!b.hand.some(x=>d.filter!=='nonShard'||!shardInfo(s,x)?.shard)))finishDiscard(s,events);
   if(s.phase==='battle'){plans(s);checkVictory(s,events);}break;
  }
  case 'discardDone':{
   if(s.phase!=='battle'||!s.battle.chooseDiscard||!s.battle.discardCtx?.optional)reject('지금은 버리기를 멈출 수 없습니다.');finishDiscard(s,events);plans(s);checkVictory(s,events);break;
  }
  case 'pickDraw':{
   const b=s.battle;if(s.phase!=='battle'||!b?.pickDraw)reject('가져올 카드를 고르는 중이 아닙니다.');
   if(!a.skip){const i=b.draw.findIndex(c=>c.uid===a.uid);if(i<0)reject('뽑을 카드 더미에서 고르세요.');const [c]=b.draw.splice(i,1);bindBlind(s,c,true);b.hand.push(c);b.drawnThisTurn=(b.drawnThisTurn||0)+1;emit(events,'draw',`${HEROES[c.owner].name}의 카드를 골라 가져왔습니다.`,{uid:c.uid,hero:c.owner});}
   delete b.pickDraw;plans(s);break;
  }
  case 'endTurn':endTurn(s,events);break;
  case 'support':support(s,a,events);break;
  case 'ultimate':ultimate(s,a,events);break;
  case 'leaveCamp':if(s.phase!=='camp')reject('야영 중이 아닙니다.');s.phase='reward';s.lastReward=null;break;
  case 'removeCard':{if(!['base','camp'].includes(s.phase))reject('상점에서 카드를 제거할 수 있습니다.');if(!s.party.includes(a.hero))reject('편성된 전투원을 선택하세요.');const deck=ownedDeck(s,a.hero),c=deck.find(c=>c.uid===a.uid);if(!c)reject('보유한 카드를 선택하세요.');if(deck.length<=3)reject('전투원마다 최소 3장의 카드를 유지해야 합니다.');const cost=removalCost(s);if(s.gold<cost)reject('모라가 부족합니다.');s.gold-=cost;(s.heroes[a.hero].removedCards??=[]).push(c.uid);s.removalCount=(s.removalCount||0)+1;saveCheckpoint(s);emit(events,'removeCard',`${CARDS[c.key].name} 한 장을 제거했습니다.`,{hero:a.hero,uid:c.uid,cost});break;}
  case 'upgrade':{
   const o=s.upgradeOffer;if(!o||!['base','camp','refine'].includes(s.phase)||!o.candidates.some(c=>c.owner===a.hero&&c.key===a.card)||!s.party.includes(a.hero)||!insightSpec(a.card,a.branch))reject('제시된 세 카드 중 하나를 선택하세요.');if(s.heroes[a.hero].upgrades[a.card])reject('이미 강화한 카드입니다.');if(availableDiscoveries(s,a.hero).includes(a.card))learnCard(s,a.hero,a.card);s.heroes[a.hero].upgrades[a.card]=a.branch;const picked=o.candidates.find(c=>c.owner===a.hero&&c.key===a.card);if(picked?.spark&&picked.sparkBranch===a.branch){(s.heroes[a.hero].sparks??={})[a.card]=picked.spark;emit(events,'spark',`${HEROES[a.hero].name} · ${CARDS[a.card].name} ${SPARK_EFFECTS[picked.spark].name}`,{hero:a.hero,card:a.card,spark:picked.spark});}s.upgradeOffer=null;if(s.phase==='refine')s.phase=o.returnPhase;saveCheckpoint(s);emit(events,'upgrade',`${CARDS[a.card].name} · 강화 ${a.branch}`,{hero:a.hero,card:a.card});break;
  }
  case 'epiphany':case 'skipEpiphany':{
   const o=s.epiphanyOffer;if(!o)reject('정할 번뜩임이 없습니다.');
   if(a.type==='epiphany'){if(!o.branches.includes(a.branch))reject('제시된 방향 중 하나를 고르세요.');const h=s.heroes[o.owner];h.upgrades[o.key]=a.branch;if(o.spark&&o.sparkBranch===a.branch){(h.sparks??={})[o.key]=o.spark;emit(events,'spark',`${HEROES[o.owner].name} · ${CARDS[o.key].name} ${SPARK_EFFECTS[o.spark].name}`,{hero:o.owner,card:o.key,spark:o.spark});}emit(events,'upgrade',`${CARDS[o.key].name} · 번뜩임 ${INSIGHTS[o.key][a.branch].title}`,{hero:o.owner,card:o.key});}
   else emit(events,'epiphanySkipped','번뜩임을 흘려보냈습니다.');
   s.epiphanyOffer=null;break;
  }
  case 'pickCard':case 'skipCard':{
   const o=s.cardOffer;if(s.phase!=='cardReward'||!o)reject('고를 카드 보상이 없습니다.');
   if(a.type==='pickCard'){const c=o.candidates.find(c=>c.owner===a.hero&&c.key===a.card);if(!c||!s.party.includes(c.owner))reject('제시된 세 장 중 하나를 고르세요.');learnCard(s,c.owner,c.key);emit(events,'cardReward',`${HEROES[c.owner].name} · ${CARDS[c.key].name} 획득`,{hero:c.owner,card:c.key});}
   else emit(events,'cardRewardSkipped','카드를 더하지 않고 덱을 유지합니다.');
   s.cardOffer=null;
   if(o.source==='event'){s.phase='reward';break;}
   if(o.then==='refine'&&s.lastReward?.upgradeOffer){s.upgradeOffer=clone(s.lastReward.upgradeOffer);s.upgradeOffer.returnPhase='travel';s.phase='refine';}else s.phase='travel';
   break;
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
   if(s.phase!=='base')reject('거점에서 치료할 수 있습니다.');if(s.healUsed)reject('생명의 불꽃은 거점마다 한 번만 받을 수 있습니다.');const needs=healingNeeds(s);s.healUsed=true;const heroes=[...new Set([...needs.injured,...needs.retired,...(needs.hp>0?s.party:[])])];restoreBodies(s);for(const id of s.party)s.heroes[id].stress=Math.max(0,s.heroes[id].stress-5);saveCheckpoint(s);emit(events,'heal','생명의 불꽃이 따스하게 몸을 감쌉니다. 부상 회복 · 체력 +30% · 출전원 정신 부담 -5. 거점마다 한 번 받을 수 있습니다.',{heroes:[...new Set([...heroes,...s.party])],hp:Math.min(hpPts(s,30),needs.hp)});break;
  }
  case 'careStart':{if(!canCare(s,a.hero))reject('붕괴한 동료만 거점에서 한 번 안정을 취할 수 있습니다.');s.careDialogue={hero:a.hero,line:0};break;}
  case 'careNext':{const d=s.careDialogue;if(!d)reject('진행할 대화가 없습니다.');d.line=Math.min(CARE_SCRIPT[d.hero].length-1,d.line+1);break;}
  case 'cancelCare':s.careDialogue=null;break;
  case 'calm':{
   const d=s.careDialogue;if(!canCare(s,a.hero)||d?.hero!==a.hero||d.line<CARE_SCRIPT[a.hero].length-1)reject('선택한 파트너와 대화를 마쳐 주세요.');s.heroes[a.hero].stress=0;s.heroes[a.hero].breakdown=null;s.careUsed=true;s.careDialogue=null;saveCheckpoint(s);emit(events,'calm',`${HEROES[a.hero].partnerName}와 대화를 마쳤습니다. 붕괴 극복 · 정신 부담 0.`,{hero:a.hero});break;
  }
  case 'farm':{
   if(s.phase!=='base')reject('거점에서 이전 지역으로 출발할 수 있습니다.');saveCheckpoint(s);s.farmReturn={node:s.node,mode:s.mode,lane:s.lane??1,selectedStage:clone(s.selectedStage||null)};s.upgradeOffer=null;s.mode='farm';s.selectedStage=null;s.lastReward=null;s.farmCount++;beginBattle(s,s.farmCount%2?['hound','wanderer']:['hunter','breacher'],events);break;
  }
  case 'challenge':{
   if(s.phase!=='base')reject('거점에서 도전 구간으로 출발할 수 있습니다.');if(s.node===7)s.mainFrontStarted=true;saveCheckpoint(s);s.upgradeOffer=null;if(s.node<ROUTE.length-1){s.mode='route';s.selectedStage=null;s.lastReward=null;s.eventResult=null;s.phase='travel';emit(events,'travel','다음 지점을 지도에서 고르세요.');break;}s.mode='challenge';s.selectedStage=null;s.lastReward=null;s.challengeStage=0;beginBattle(s,['nightmare'],events);break;
  }
  case 'restart':{
   if(!['defeat','ending'].includes(s.phase))reject('전멸 또는 클리어 후 거점으로 돌아갈 수 있습니다.');const clearedThisCampaign=!!s.claimedEnding||s.phase==='ending',collection=clone(s.collection),retries=s.retries+(s.phase==='defeat'?1:0),checkpoint=clone(s.checkpoint);if(!checkpoint)reject('복원할 거점이 없습니다.');const restored=clone(checkpoint);for(const k of Object.keys(s))delete s[k];Object.assign(s,restored,{checkpoint,claimedEnding:clearedThisCampaign||!!restored.claimedEnding,retries,temporal:Math.min(2,Math.max(0,retries-1)),collection,history:[]});
   emit(events,'rewind','시간의 힘이 느껴집니다. 시계바늘이 거꾸로 움직입니다.',{retries,temporal:s.temporal});if(s.phase==='title')enterNode(s,events);else if(s.node===7){s.phase='base';s.healUsed=false;s.mode='route';s.battle=null;}break;
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
   refreshMaxHp(s);s.hp=s.maxHp;clearShields(s);s.support=2;s.mode='challenge';s.challengeStage=0;s.selectedStage=null;s.lastReward=null;
   beginBattle(s,['nightmare'],events);
   emit(events,'recordChallenge',`원정 기록으로 보스 방어전에 돌입합니다: ${rec.label}`,{id:rec.id});break;
  }
  case 'returnToLobby':{
   if(['lobby','saveData'].includes(s.phase))reject('이미 로비입니다.');if(s.mode==='raid')reject('레이드 중에는 로비로 돌아갈 수 없습니다.');
   if(s.phase==='base'){saveCheckpoint(s);s.savedExpedition=true;}
   // v0.27: the lobby sits outside the run; leaving mid-stage keeps the exact screen to resume.
   s.resumePhase=['base','title'].includes(s.phase)?null:s.phase;s.phase='lobby';
   emit(events,'lobby','메인 로비로 귀환했습니다.');break;
  }
  case 'finishExpedition':{
   if(!s.runActive||!['ending','defeat','base','lobby'].includes(s.phase))reject('거점, 원정 완료 또는 전멸 화면에서 원정을 끝낼 수 있습니다.');if(s.tutorial?.active)reject('튜토리얼을 마친 뒤 원정을 끝낼 수 있습니다.');
   const outcome=s.phase==='ending'||s.claimedEnding?'clear':s.phase==='defeat'?'defeat':'retreat';
   s.pendingSave={outcome,entries:s.party.map(hero=>({hero,entry:makeSaveEntry(s,hero,outcome,{cards:CARDS,equipment:EQUIPMENT,ownedDeck}),decision:null,replace:null}))};
   s.phase='saveData';emit(events,'saveData','원정을 마칩니다. 전투원별 세이브 데이터를 기록하세요.');break;
  }
  case 'keepSaveData':case 'dropSaveData':{
   const p=s.pendingSave;if(s.phase!=='saveData'||!p)reject('기록할 세이브 데이터가 없습니다.');const item=p.entries.find(x=>x.hero===a.hero);if(!item)reject('원정에 참여한 전투원을 고르세요.');
   if(a.type==='dropSaveData'){item.decision='drop';item.replace=null;break;}
   const slots=saveEntries(s,a.hero);if(slots.length>=SAVE_SLOTS&&!slots.some(x=>x.id===a.replace))reject(`세이브 데이터는 전투원당 ${SAVE_SLOTS}개까지입니다. 교체할 기록을 고르세요.`);
   item.decision='keep';item.replace=slots.length>=SAVE_SLOTS?a.replace:null;break;
  }
  case 'closeExpedition':{
   const p=s.pendingSave;if(s.phase!=='saveData'||!p)reject('끝낼 원정이 없습니다.');if(p.entries.some(x=>!x.decision))reject('모든 전투원의 세이브 데이터를 기록하거나 버려 주세요.');
   for(const x of p.entries){if(x.decision!=='keep')continue;const list=s.collection.saveData[x.hero]??=[];if(x.replace){const i=list.findIndex(e=>e.id===x.replace);if(i>=0)list.splice(i,1);}list.unshift(x.entry);}
   const kept=p.entries.filter(x=>x.decision==='keep').length;s.collection.tutorialDone=true;
   freshRun(s,{tutorial:false});s.runActive=false;s.phase='lobby';s.checkpoint=null;
   emit(events,'saveDataStored',kept?`세이브 데이터 ${kept}개를 기록했습니다.`:'세이브 데이터를 남기지 않고 원정을 마쳤습니다.',{kept});break;
  }
  case 'deleteSaveData':{
   if(s.phase!=='lobby')reject('로비에서 세이브 데이터를 정리할 수 있습니다.');const list=saveEntries(s,a.hero),i=list.findIndex(e=>e.id===a.id);if(i<0)reject('세이브 데이터를 찾을 수 없습니다.');list.splice(i,1);emit(events,'saveDataDeleted','세이브 데이터를 삭제했습니다.');break;
  }
  case 'newExpedition':{
   if(s.phase!=='lobby')reject('로비에서 새 원정을 시작할 수 있습니다.');if(s.runActive)reject('진행 중인 원정이 있습니다. 이어하거나 먼저 끝내 주세요.');
   freshRun(s,{tutorial:!s.collection.tutorialDone});s.runActive=true;enterNode(s,events);emit(events,'newExpedition','새 원정을 시작합니다.');break;
  }
  case 'resumeExpedition':{
   if(s.phase!=='lobby')reject('로비에서 원정으로 출발할 수 있습니다.');if(!s.runActive)reject('진행 중인 원정이 없습니다. 새 원정을 시작하세요.');
   if(s.resumePhase){s.phase=s.resumePhase;s.resumePhase=null;emit(events,'resume','원정으로 돌아왔습니다.');break;}
   if(s.savedExpedition||s.checkpoint){
    s.savedExpedition=false;s.mode='route';s.phase='base';s.healUsed=false;s.battle=null;
    emit(events,'base','임시저장된 거점으로 복귀했습니다.');
   }else{
    s.mode='route';enterNode(s,events);
   }
   break;
  }
  case 'startRaid':{
   if(!RAID_AVAILABLE)reject('보스 레이드는 구현 중입니다.');if(s.phase!=='lobby')reject('로비에서 레이드에 출격할 수 있습니다.');
   // v0.27: a raid team is one to three combatants' Save Data, each from a different combatant.
   const ids=[...new Set(a.saves||[])],picked=ids.map(id=>Object.values(s.collection.saveData||{}).flat().find(e=>e.id===id)).filter(Boolean);
   if(!picked.length||picked.length!==ids.length||picked.length>3)reject('출격할 세이브 데이터를 1~3개 고르세요.');if(new Set(picked.map(e=>e.hero)).size!==picked.length)reject('한 전투원의 세이브 데이터는 하나만 고를 수 있습니다.');
   const recordId='team:'+picked.map(e=>e.id).sort().join('|'),label=picked.map(e=>HEROES[e.hero].name).join(' · ');
   const raid=s.collection.raid;raid.recordStats??={};
   const st=raid.recordStats[recordId]||{triesUsed:0,maxTries:RAID_BOSS_DEFAULT.maxTriesPerRecord,bestDamage:0};
   if((st.triesUsed||0)>=(st.maxTries||3))reject('이 편성의 3회 트라이를 모두 사용했습니다.');
   stashRun(s);
   s.party=picked.map(e=>e.hero);for(const e of picked)s.heroes[e.hero]=applySaveEntry({...heroState(),body:Object.fromEntries(PARTS.map(p=>[p,0]))},e);
   s.tutorial={...(s.tutorial||{}),active:false};refreshMaxHp(s);s.hp=s.maxHp;clearShields(s);s.support=2;s.mode='raid';s.lastRaidResult=null;s.temporal=0;s.selectedStage=null;
   s.raidRun={recordId,label,saves:picked.map(e=>e.id),damageDealt:0,maxTurns:RAID_BOSS_DEFAULT.maxTurns};
   beginBattle(s,[raid.bossKind||'nightmare'],events);
   if(s.battle?.enemies?.[0]){s.battle.enemies[0].hp=999*ENEMY_HP_SCALE;s.battle.enemies[0].maxHp=999*ENEMY_HP_SCALE;s.battle.enemies[0].name=raid.bossName;}
   emit(events,'raidStart',`보스 레이드 개시 (${(st.triesUsed||0)+1}/${st.maxTries||3} 트라이) · ${label}`,{recordId});break;
  }
  case 'finishRaid':{
   if(s.mode!=='raid'||!s.raidRun)reject('진행 중인 레이드가 없습니다.');
   settleRaid(s,events,'retreat');break;
  }
  case 'resetRaidBoss':{
   s.collection.raid={bossKind:'nightmare',bossName:'천공의 사도·케루빔',bossMaxHp:RAID_BOSS_DEFAULT.bossMaxHp,totalDamage:0,clears:s.collection.raid?.clears||0,clearedThisCycle:false,recordStats:{}};
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
 const draft=clone(state),events=[];try{const hp0=draft.hp,max0=draft.maxHp;perform(draft,action,events);refreshMaxHp(draft);if(!['restart','undo','retry'].includes(action.type))spreadHeal(draft,draft.hp-hp0-Math.max(0,draft.maxHp-max0));syncShield(draft);}catch(e){return {ok:false,error:e.message,events:[]};}
 draft.history=[...(draft.history||[]),...events.filter(e=>!['draw','shuffle','enemyAction'].includes(e.type)&&!(e.type==='discard'&&action.type==='endTurn')).map(e=>e.text)].slice(-60);for(const k of Object.keys(state))delete state[k];Object.assign(state,draft);return {ok:true,error:null,events};
}
export function applyStress(state,hero,amount,tag=''){const events=[];stress(state,hero,amount,events,tag);return events;}
export function applyInjury(state,hero,part){const events=[];injury(state,hero,part,events);return events;}
