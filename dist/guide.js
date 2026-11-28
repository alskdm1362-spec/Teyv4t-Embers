// v0.36 8단계: 가이드(도움말). 분류 6개 → 항목 → 쪽.
// 설명은 한두 줄. **굵게** 표시한 말만 강조색(잔불색)으로 칠한다.
// shot: 스크린샷 파일(dist/assets/guide/<shot>.webp). 화면이 확정되면 찍어 넣는다. 그 전에는 틀만 보인다.
// marks: 스크린샷 위에 따로 얹는 손가락·원 표시. x·y·r 은 틀 기준 백분율이라 스크린샷을 다시 찍어도 남는다.
import {HEROES,HERO_STATS,SCAR_RATE,PARTY_SIZE} from './engine.js';
import {KEYWORDS,HAND_LIMIT,CRACK_MAX} from './keywords.js';
import {SAVE_SLOTS} from './savedata.js';

const page=(text,marks=[],shot=null)=>({text,marks,shot});
const item=(id,title,...pages)=>({id,title,pages});
const ring=(x,y,r=9)=>({kind:'ring',x,y,r}),tap=(x,y)=>({kind:'tap',x,y});
const pct=Math.round(SCAR_RATE*100);
const HERO_TIPS={
 lohen:'「서리 파편」을 만들고 **버려서** 추가공격을 냅니다. 「쇄빙」과 「결빙 투창」으로 한 턴에 여러 장을 터뜨리세요.',
 durin:'아군이 공격 카드를 쓰면 **협공**이 따라붙습니다. 연타가 많은 동료와 묶으면 태양화가 빨리 찹니다.',
 jahoda:'0코스트 카드로 **행동력을 보충**합니다. 비용이 큰 카드나 X코스트 카드를 가진 동료 옆에서 빛납니다.',
 illuga:'유일하게 **파티 전원**에게 보호막을 줍니다. 보호막은 체력 · 상흔 · 정신부담을 함께 지킵니다.',
 kinich:'「추적」 모드의 연타로 **추적흔**을 쌓고, 필살기 버튼으로 「분쇄」로 바꿔 한 번에 터뜨립니다.',
 lyney:'카드를 **많이 뽑고 버리는** 전투원입니다. 버리기가 필요한 로엔, 손패가 마르는 동료를 돕습니다.',
 cyno:'「심판」은 턴마다 **죄·명계·의식**으로 나뉩니다. 다른 카드를 다 쓰면 다시 결합해 판정만큼 강해집니다.',
};
export const GUIDE=[
 {id:'battle',name:'전투',icon:'sword',items:[
  item('ap','AP와 카드 사용',page('턴마다 **행동력(AP) 3**을 받습니다. 카드 왼쪽 위 숫자만큼 쓰고, 남은 행동력은 다음 턴으로 넘어가지 않습니다.',[ring(50,93,7)]),page('카드를 눌러 펼친 뒤 **적에게 끌거나** 적을 누르면 사용합니다. 대상이 없는 카드는 위로 끌어 올립니다.',[tap(36,84)])),
  item('hand','손패 10장 규칙',page(`손패가 **${HAND_LIMIT}장**이면 더 뽑지 못합니다. 드로우와 카드 생성이 모두 멈춥니다. 9장부터 손패 수가 경고색으로 바뀝니다.`,[ring(88,76,6)])),
  item('intent','적의 의도',page('적 머리 위에 **다음 행동과 대상**이 보입니다. 누가 얼마나 맞는지 보고 보호막을 줄 동료를 정하세요.',[ring(62,34,10)]),page('정예와 보스는 보호막을 무시하는 **정신공격**을 섞습니다. 보스는 그다음 행동까지 예고합니다.')),
  item('shield','보호막',page('보호막은 **전투원 개인**의 것입니다. 그 전투원이 맞을 때 먼저 깎이고, 턴이 끝나면 사라집니다.',[ring(22,52,8)]),page('방어 카드는 **본인에게만** 보호막을 줍니다. 일루가만 파티 전원에게 줍니다.')),
  item('scar','상흔 게이지와 부상',page(`막지 못한 피해는 맞은 전투원의 **상흔 게이지**에 쌓입니다. 개인 최대 체력의 ${pct}%에 닿으면 부위 룰렛이 돕니다.`,[ring(20,71,7)]),page('룰렛에 걸린 부위는 **경상 → 중상 → 결손**으로 한 단계씩 오릅니다. 치유를 받으면 상흔이 줄고, 전투가 끝나면 0이 됩니다.'),page('눈은 손패를 흐리고, 팔은 카드 비용을 올리고, 다리는 **파티 행동력**을 깎습니다. 부상은 거점에서 낫습니다.')),
  item('stress','정신부담과 붕괴',page('공격을 막지 못하면 맞은 전투원의 **정신부담**이 오릅니다. 초상화 옆 이름 아래 게이지입니다.',[ring(12,9,9)]),page('100이 되면 **붕괴**해 고유 카드가 붕괴 카드로 바뀝니다. 그 카드를 써서 극복을 시도하세요.')),
  item('support','파트너 지원',page('지원 게이지 2로 **파트너 지원**을 부릅니다. 왼쪽 아래에서 파트너를 누르면 지원 카드가 나옵니다. 턴당 한 번입니다.',[ring(17,84,8)])),
  item('ultimate','필살기',page('지원 게이지 3으로 전투원의 **필살기**를 씁니다. 행동력은 들지 않고, 전투원마다 전투당 한 번입니다.',[ring(11,84,7)]),page('키니치만 다릅니다. 필살기 버튼이 **모드 전환**이고, 게이지 없이 턴마다 한 번 누를 수 있습니다.')),
 ]},
 {id:'cards',name:'카드',icon:'cards',items:[
  item('notation','카드 표기(계수)',page('카드 수치는 **능력치의 몇 %**인지로 적습니다. `피해 120%`는 공격력의 120%, `보호막 200%`는 방어력의 200%입니다.'),page('카드를 **길게 누르면** 지금 상황에서의 실제 수치가 함께 보입니다.',[tap(40,80)])),
  item('keywords',`키워드 ${Object.keys(KEYWORDS).length}종`,...Object.values(KEYWORDS).reduce((rows,k,i)=>{(rows[Math.floor(i/4)]??=[]).push(`**${k.name}** — ${k.desc}`);return rows;},[]).map(rows=>page(rows.join('<br>')))),
  item('special','특수 · 생성 카드',page('전투 중에만 생기는 카드가 있습니다. 로엔의 **서리 파편**, 키니치의 아쥬의 참견, 리니의 마술 모자, 사이노의 죄·명계·의식 같은 것들입니다.'),page('생성 카드는 **덱에 남지 않습니다.** 전투가 끝나면 사라집니다.')),
  item('branch','전술 각성 분기',page('카드마다 **A 안정 · B 자원 · C 변형 · D 빌드** 네 방향이 있습니다. 한 장에 하나만 고릅니다.'),page('A는 수치, B는 비용과 드로우, C는 쓰임새, D는 **덱 전체의 방향**을 바꿉니다.')),
  item('ember','잔불 각성',page('전투 중 카드가 **빛나면** 그 카드는 0코스트가 됩니다. 쓰고 나면 세 가지 잔불 각성 중 하나를 고릅니다.'),page('잔불 각성은 전술 각성과 **따로** 붙습니다. 세이브 기록에도 남습니다.')),
 ]},
 {id:'heroes',name:'전투원',icon:'people',items:[
  item('stats','능력치',page('**체력**은 세 명의 합이 파티 체력이 됩니다. **공격력**은 피해, **방어력**은 받는 피해와 보호막의 기준입니다.'),page(`**치명확률**과 **치명피해**는 전투원마다 다릅니다. 균열이 붙은 적은 스택당 피해를 더 받습니다(최대 ${CRACK_MAX}).`)),
  ...Object.keys(HEROES).map(id=>item('hero-'+id,HEROES[id].name,page(`**${HEROES[id].role}.** ${HERO_TIPS[id]||HEROES[id].summary}`),page(`체력 **${HERO_STATS[id].hp}** · 공격 **${HERO_STATS[id].atk}** · 방어 **${HERO_STATS[id].def}** · 치명 ${Math.round(HERO_STATS[id].cr*100)}% / ${Math.round(HERO_STATS[id].cd*100)}%<br>파트너 ${Object.values(HEROES[id].partnerNames||{}).join(' · ')||HEROES[id].partnerName}`))),
 ]},
 {id:'expedition',name:'원정',icon:'map',items:[
  item('map','분기 지도',page('거점을 떠나면 **지도에서 다음 지점**을 고릅니다. 전투 · 정예 · 사건 · 야영이 갈림길로 놓여 있습니다.',[ring(55,45,12)]),page('정예는 위험하지만 **전리품**이 좋습니다. 길은 다음 거점에서 다시 만납니다.')),
  item('reward','전투 보상',page('전투에서 이기면 모라와 경험치, 그리고 **카드 세 장 중 한 장**을 얻습니다. 건너뛰어도 됩니다.',[ring(50,55,14)])),
  item('event','사건',page('사건의 선택지는 **얻는 것과 대가**가 함께 적혀 있습니다. 돋보기를 누르면 자세히 보입니다.',[ring(79,77,5)]),page('주사위가 붙은 선택지는 **d20 판정**입니다. 다리를 잃은 동료가 있으면 이동이 필요한 선택지가 잠깁니다.')),
  item('base','거점과 야영',page('거점에서는 **생명의 불꽃**으로 부상을 고치고 체력을 30% 회복합니다. 거점마다 한 번입니다.',[ring(50,60,9)]),page('야영에서는 **휴식**(체력 +20% · 전원 정신 -8)과 한 명과의 **대화**(정신 -30) 중 하나만 고릅니다.')),
  item('copy','카드 복제 · 제거',page('상점과 사건에서 카드를 **제거**해 덱을 가볍게 만들 수 있습니다. 전투원마다 세 장은 남아야 합니다.'),page('사건과 전리품에서 덱의 카드 한 장을 **복제**할 수 있습니다. 「유일」 카드는 복제되지 않습니다.')),
 ]},
 {id:'lobby',name:'로비',icon:'home',items:[
  item('formation','편성',page(`원정을 떠날 때 전투원 **${PARTY_SIZE}명**을 고릅니다. 파트너는 함께 따라옵니다.`,[ring(50,42,16)]),page('첫 클리어 전에는 **로엔이 고정**입니다. 클리어한 뒤에는 누구든 셋을 고를 수 있습니다.')),
  item('records','세이브 기록',page(`원정이 끝나면 전투원마다 그때의 덱과 장비를 **세이브 기록**으로 남길 수 있습니다. 전투원당 ${SAVE_SLOTS}개까지입니다.`)),
  item('raid','레이드',page('세이브 기록 **1~3개**로 팀을 짜 보스에게 도전합니다. 준 피해는 누적됩니다.',[ring(70,40,10)]),page('레이드는 진행 중인 원정에 **영향을 주지 않습니다.** 끝나면 원정은 그대로 돌아옵니다.')),
  item('codex','도감',page('만난 적, 본 컷인, 전투원과 파트너의 일러스트가 **도감**에 모입니다.')),
 ]},
 {id:'save',name:'저장',icon:'check',items:[
  item('seed','시드',page('시드(`EMBR-XXXX`)는 **저장의 이름**입니다. 타이틀에서 정하고, 메뉴의 저장에서 확인하고 복사할 수 있습니다.'),page('같은 시드는 **이 기기 · 이 브라우저 안에서만** 이어집니다.')),
  item('autosave','자동 저장',page('행동할 때마다 **자동으로 저장**됩니다. 지점을 옮길 때, 전투에 들어갈 때, 보상을 받은 뒤가 모두 저장됩니다.')),
  item('round-trip','로비 왕복',page('거점의 **「임시 저장 후 로비로」**로 로비에 다녀올 수 있습니다. 로비에서 「원정으로 돌아가기」를 누르면 그 자리에서 이어 갑니다.',[ring(74,91,8)])),
  item('transfer','다른 기기로 옮기기',page('메뉴 → 저장에서 **저장 파일 내보내기**를 누르면 `.embers` 파일이 내려받아집니다. 「코드 복사」로 글자로 옮길 수도 있습니다.'),page('다른 기기의 타이틀에서 **「저장 파일 불러오기」**를 누르거나, 시드를 적은 뒤 코드를 붙여 넣으세요.'),page('같은 시드의 기록이 이미 있으면 **양쪽을 비교해 보여 준 뒤** 덮어쓸지 묻습니다. 읽지 못한 파일은 아무것도 바꾸지 않습니다.')),
 ]},
];
export const GUIDE_ITEMS=GUIDE.flatMap(c=>c.items.map(it=>({...it,category:c.id})));
export const guideKey=(category,id)=>`${category}/${id}`;
export function guideItem(key){const [category,id]=String(key||'').split('/');return GUIDE_ITEMS.find(it=>it.category===category&&it.id===id)||null;}
// 강조: **말** → 잔불색, `코드` → 고정폭. 그 밖의 글자는 그대로 내보낸다.
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function guideText(text){return text.split('<br>').map(line=>esc(line).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>')).join('<br>');}
// 튜토리얼 뒤, 처음 겪는 순간에 한 번만 띄울 항목. 위에서부터 먼저 맞는 것 하나.
export const GUIDE_TRIGGERS=[
 ['battle/scar',(s,events)=>events.some(e=>e.type==='injury')],
 ['battle/stress',(s,events)=>events.some(e=>e.type==='breakdown')||s.party.some(id=>s.heroes[id].breakdown)],
 ['cards/ember',s=>!!s.epiphanyOffer],
 ['battle/hand',s=>s.phase==='battle'&&(s.battle?.hand.length||0)>=HAND_LIMIT-1],
 ['expedition/map',s=>s.phase==='travel'],
 ['expedition/reward',s=>s.phase==='cardReward'],
 ['cards/branch',s=>s.phase==='refine'],
 ['expedition/event',s=>s.phase==='event'],
 ['expedition/base',s=>s.phase==='camp'],
 ['lobby/records',s=>s.phase==='saveData'],
];
export function guideDue(state,events=[]){
 if(state.tutorial?.active||!state.collection?.tutorialDone)return null;const seen=new Set(state.collection.guideSeen||[]);
 for(const [key,test] of GUIDE_TRIGGERS){if(seen.has(key))continue;try{if(test(state,events))return key;}catch{}}
 return null;
}
export function guideMarks(marks=[]){return marks.map(m=>m.kind==='tap'?`<i class="guide-mark guide-tap" style="left:${m.x}%;top:${m.y}%"></i>`:`<i class="guide-mark guide-ring" style="left:${m.x}%;top:${m.y}%;width:${m.r*2}%"></i>`).join('');}
