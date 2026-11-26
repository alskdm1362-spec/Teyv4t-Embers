/* Explicit test scenarios. This module is loaded only by qa.html. */
import {EVENTS} from './expedition-content.js';
import {createGame,act,serialize,hydrate,ownedDeck,makeUpgradeOffer,rollLoot,ROUTE} from './engine.js';
export const QA_SCENARIOS={title:'타이틀',lobby:'메인 로비',tutorial:'튜토리얼 1 · 카드',partner:'튜토리얼 2 · 파트너',recruitTalk1:'첫 지원 요청 대화',recruitTalk2:'두 번째 지원 요청 대화',arrival:'합류 연출',joinDialogue:'합류 대화',care:'정신 안정 · 붕괴',refine:'전술 각성 · 네 방향',event:'랜덤 사건',loot:'정예 전리품 · 각성',equipment:'획득 장비 장착',eventRemove:'사건 · 카드 제거',elite:'정예전',lateBase:'확장 구간 거점',recruit1:'첫 동료 선택',recruit2:'두 번째 동료 선택',base:'거점',camp:'야영',awakening:'전투 중 전술 각성 · 첫 카드 사용',battle:'일반 전투',special:'특수 카드 생성',eventPremium:'고급 장비 · 디버프 사건',eyesSerious:'눈 중상 · 카드 블러',eyesLoss:'눈 결손 · 실명',collapse:'정신 붕괴',collapseStep:'붕괴 1→2단계 전환 직전',injury:'부상 상태 창',reward:'전투 보상',travel:'경로 선택',boss:'후반 보스',defeat:'전멸 · 시간 역행',ending:'개발판 엔딩'};
const go=(s,a)=>{const r=act(s,a);if(!r.ok)throw Error(r.error);};
export function qaFixture(kind,{seed=20261122,hero='lohen',pair=['durin','illuga'],breakdown='despair',failures=0,part='eyes',stage=2}={}){
 if(kind==='special')pair=['durin','jahoda'];
 const s=createGame(seed);if(kind==='title')return s;go(s,{type:'start'});if(kind==='tutorial')return s;go(s,{type:'skipTutorial'});if(kind==='recruitTalk1')return s;go(s,{type:'skipRecruitDialogue'});if(kind==='recruit1')return s;
 const choices=[...new Set(pair.filter(id=>['durin','illuga','jahoda'].includes(id)))];for(const id of ['durin','illuga','jahoda'])if(choices.length<2&&!choices.includes(id))choices.push(id);
 if(hero!=='lohen'&&!choices.includes(hero))choices[1]=hero;
 if(['arrival','joinDialogue'].includes(kind)&&hero!=='lohen'){choices[0]=hero;}go(s,{type:'recruit',hero:choices[0]});if(kind==='arrival')return s;go(s,{type:'ackRecruit'});if(kind==='joinDialogue')return s;while(s.phase==='joinDialogue')go(s,{type:'joinNext'});if(kind==='partner')return s;go(s,{type:'skipTutorial'});if(kind==='recruitTalk2')return s;go(s,{type:'skipRecruitDialogue'});if(kind==='recruit2')return s;go(s,{type:'recruit',hero:choices[1]});go(s,{type:'ackRecruit'});while(s.phase==='joinDialogue')go(s,{type:'joinNext'});
 s.gold=250;s.hp=76;s.support=6;for(const h of Object.values(s.heroes)){h.level=2;h.xp=8;h.stress=35;}
 if(kind==='equipment'){s.inventory=['emberLance'];s.pendingEquip=['emberLance'];return s;}
 if(kind==='loot'){s.phase='reward';s.lastReward={gold:24,xp:10,pending:true,...rollLoot(s,true),upgradeOffer:makeUpgradeOffer(s,'loot','travel')};return s;}if(kind==='eventRemove'){s.phase='event';s.eventOffer=JSON.parse(JSON.stringify(EVENTS[1]));go(s,{type:'event',choice:'remove'});return s;}
 if(kind==='refine'){s.upgradeOffer=makeUpgradeOffer(s,'qa','travel');s.phase='refine';return s;}if(kind==='care'){s.heroes[hero].breakdown={type:breakdown,failures:Math.max(0,Math.min(10,Number(failures)||0))};s.heroes[hero].stress=100;}if(kind==='lateBase'){s.node=11;s.selectedStage=null;s.baseId='route-11';s.careUsed=false;}
 if(kind==='eventPremium'){s.phase='event';s.node=20;s.eventOffer=JSON.parse(JSON.stringify(EVENTS[2]));s.eventOffer.choices[1].benefit.item='emberLance';return s;}
 if(kind==='event'||kind==='elite'){s.phase='reward';s.node=kind==='event'?8:9;s.lastReward=null;go(s,{type:'advance'});return s;}
 if(kind==='injury'){s.heroes[hero].body={eyes:2,leftArm:3,rightArm:0,leftLeg:2,rightLeg:0};}
 // QA checkpoint is the precise base state; the production save is never read.
 s.checkpoint=null;const cp=hydrate(serialize(s));delete cp.checkpoint;s.checkpoint=cp;
 if(kind==='lobby'){go(s,{type:'returnToLobby'});return s;}if(['base','injury','care','lateBase'].includes(kind))return s;
 if(kind==='camp'){s.phase='camp';s.node=5;s.campActions=[];s.heroes[hero].body.eyes=2;return s;}
 if(kind==='special'){s.heroes.durin.acquired=['d_charge'];s.heroes.jahoda.acquired=['j_draw'];}
 if(kind==='boss')s.node=ROUTE.length-1;go(s,{type:kind==='boss'?'challenge':'farm'});
 if(kind==='boss')return s;
 if(kind==='awakening'){s.rng=2100;for(const e of s.battle.enemies)e.hp=e.maxHp=90;}
 if(kind==='special'){s.heroes.durin.upgrades.d_charge='D';s.heroes.jahoda.upgrades.j_draw='D';const all=[...s.battle.hand,...s.battle.draw];const keep=all.filter(c=>['d_charge','j_draw'].includes(c.key));s.battle.hand=[...keep,...all.filter(c=>!keep.includes(c)).slice(0,3)];const uids=new Set(s.battle.hand.map(c=>c.uid));s.battle.draw=all.filter(c=>!uids.has(c.uid));}
 if(['eyesSerious','eyesLoss'].includes(kind))s.heroes[hero].body.eyes=kind==='eyesLoss'?3:2;
 if(['collapse','collapseStep'].includes(kind)){s.heroes[hero].stress=100;s.heroes[hero].breakdown={type:breakdown,failures:kind==='collapseStep'?3:Math.max(0,Math.min(10,Number(failures)||0))};}
 if(['eyesSerious','eyesLoss','collapse','collapseStep'].includes(kind)){
  // Guarantee the chosen owner's cards are in hand without duplicating a physical UID.
  const all=['hand','draw','discard','exhaust'].flatMap(z=>s.battle[z]);s.battle.hand=[...all.filter(c=>c.owner===hero).slice(0,3),...all.filter(c=>c.owner!==hero).slice(0,3)];const uids=new Set(s.battle.hand.map(c=>c.uid));s.battle.draw=all.filter(c=>!uids.has(c.uid));s.battle.discard=[];s.battle.exhaust=[];
 }
 if(kind==='reward'||kind==='travel'){s.battle=null;s.phase='reward';s.lastReward={gold:16,xp:10,pending:true};if(kind==='travel'){s.mode='route';s.node=8;s.selectedStage=null;go(s,{type:'claimReward'});}}
 if(kind==='defeat'){s.hp=0;s.phase='defeat';s.retries=1;}
 if(kind==='ending'){s.phase='ending';s.battle=null;s.claimedEnding=true;s.collection.endings=['first-front'];}
 return hydrate(serialize(s));
}
export function qaApplyCondition(state,{hero='lohen',part='eyes',stage=0,breakdown='',failures=0,stress=35,ap=3,support=6}={}){
 const s=hydrate(serialize(state));if(!s.heroes[hero])throw Error('전투원을 확인하세요.');const h=s.heroes[hero];if(!['eyes','leftArm','rightArm','leftLeg','rightLeg'].includes(part))throw Error('부위를 확인하세요.');h.body[part]=Math.max(0,Math.min(3,Number(stage)||0));h.retired=Object.values(h.body).filter(n=>n===3).length>=2;h.stress=Math.max(0,Math.min(100,Number(stress)||0));h.breakdown=['despair','distrust','panic','frenzy'].includes(breakdown)?{type:breakdown,failures:Math.max(0,Math.min(10,Number(failures)||0))}:null;if(h.breakdown)h.stress=100;s.support=Math.max(0,Math.min(6,Number(support)||0));if(s.battle){s.battle.ap=Math.max(0,Math.min(6,Number(ap)||0));if(h.retired)for(const z of ['hand','draw','discard','exhaust'])s.battle[z]=s.battle[z].filter(c=>c.owner!==hero);}
 return hydrate(serialize(s));
}
