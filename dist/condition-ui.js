import {standingArt,faceArt36,bannerArt} from './cast36.js';
import {HEROES,PART_NAMES,BODY_STAGES} from './engine.js';
export const NEW_ART='assets/illustrations3/';
export const partnerId=id=>HEROES[id].partner;
export const faceArt=(id,broken=false)=>faceArt36(id,broken);
export const skillFace=(id,kind,partner=partnerId(id))=>bannerArt(kind==='support'?partner:id);
export function dialogueStage({hero,partner=partnerId(hero),speaker,text,controls,counter='',broken=false}){
 const partnerName=HEROES[hero].partnerNames?.[partner]||HEROES[hero].partnerName,heroName=HEROES[hero].name,side=['varka','albedo'].includes(partner)?'left':'right';
 return `<div class="visual-dialogue story-dialogue tutorial-conversation partner-${side}"><div class="dialogue-actors"><img class="dialogue-actor actor-hero ${speaker===heroName?'speaking':'listening'}" src="${standingArt(hero,broken)}" alt="${heroName}"><img class="dialogue-actor actor-partner ${speaker===partnerName?'speaking':'listening'}" src="${standingArt(partner)}" alt="${partnerName}"></div><div class="dialogue-box"><strong>${speaker}</strong><p>${text}</p><div class="dialogue-controls"><small>${counter}</small>${controls}</div></div></div>`;
}
export const STAGE_COLORS=['#67c5aa','#e9c46a','#e86e80','#090d15'];
const BODY_PATHS={leftArm:'M66 100 44 111 31 183 27 234 45 241 57 187 77 144Z',rightArm:'M164 100 186 111 199 183 203 234 185 241 173 187 153 144Z',leftLeg:'M93 239 111 247 108 309 102 372 73 372 83 307Z',rightLeg:'M137 239 119 247 122 309 128 372 157 372 147 307Z'};
// 전투 화면용 작은 실루엣. 눈·양팔·양다리 다섯 부위만 칠하고 몸통은 바탕으로 둔다.
export function bodySilhouette(body={},{cls='body-mini',label=''}={}){
 const st=k=>body[k]||0;
 return `<svg class="${cls}" viewBox="20 8 190 370" role="img" aria-label="${label}"><path class="torso" d="M99 73h32l6 12 25 10-8 103-18 32H94l-18-32-8-103 25-10ZM92 198h46l10 33-16 18H98l-16-18Z"/><circle data-part="eyes" data-stage="${st('eyes')}" cx="115" cy="44" r="30"/>${Object.entries(BODY_PATHS).map(([k,d])=>`<path data-part="${k}" data-stage="${st(k)}" d="${d}"/>`).join('')}</svg>`;
}
export function woundLabel(body={}){const list=Object.keys(PART_NAMES).filter(k=>body[k]>0).map(k=>`${PART_NAMES[k]} ${BODY_STAGES[body[k]]}`);return list.length?list.join(', '):'부상 없음';}
export function bodyDiagram(hero){
 const h=hero.body,color=n=>STAGE_COLORS[n]||STAGE_COLORS[0];
 const part=(key,path)=>`<path data-part="${key}" fill="${color(h[key]||0)}" d="${path}"><title>${PART_NAMES[key]} · ${BODY_STAGES[h[key]||0]}</title></path>`;
 return `<svg class="body-diagram" viewBox="0 0 230 390" role="img" aria-label="눈 ${BODY_STAGES[h.eyes||0]}, 왼팔 ${BODY_STAGES[h.leftArm]}, 오른팔 ${BODY_STAGES[h.rightArm]}, 왼다리 ${BODY_STAGES[h.leftLeg]}, 오른다리 ${BODY_STAGES[h.rightLeg]}"><g stroke="#b5d3c4" stroke-width="1.4"><circle cx="115" cy="44" r="30" fill="${color(h.eyes||0)}"/><path d="M99 73h32l6 12 25 10-8 103-18 32H94l-18-32-8-103 25-10Z" fill="#67c5aa"/><path d="M92 198h46l10 33-16 18H98l-16-18Z" fill="#67c5aa"/>${part('leftArm','M66 100 44 111 31 183 27 234 45 241 57 187 77 144Z')}${part('rightArm','M164 100 186 111 199 183 203 234 185 241 173 187 153 144Z')}${part('leftLeg','M93 239 111 247 108 309 102 372 73 372 83 307Z')}${part('rightLeg','M137 239 119 247 122 309 128 372 157 372 147 307Z')}<ellipse cx="104" cy="43" rx="6" ry="4" fill="${color(h.eyes||0)}" stroke="#e7efdc"/><ellipse cx="126" cy="43" rx="6" ry="4" fill="${color(h.eyes||0)}" stroke="#e7efdc"/></g><g class="body-labels"><text x="115" y="8">눈 · ${BODY_STAGES[h.eyes||0]}</text><text x="7" y="265">왼팔 · ${BODY_STAGES[h.leftArm]}</text><text x="178" y="265">오른팔 · ${BODY_STAGES[h.rightArm]}</text><text x="54" y="388">왼다리 · ${BODY_STAGES[h.leftLeg]}</text><text x="138" y="388">오른다리 · ${BODY_STAGES[h.rightLeg]}</text></g></svg>`;
}
export const INJURY_HELP=[['눈','경상: 손패 1장 흐림 / 중상: 실명 카드 1장이 덱에 섞임 / 결손: 손패 절반 흐림 + 실명 카드'],['오른팔','경상: 턴 첫 공격 카드 비용 +1 / 중상: 공격 카드 비용 +1 / 결손: 비용 +1, 피해 -30%'],['왼팔','경상: 턴 첫 방어·보조 카드 비용 +1 / 중상: 방어·보조 카드 비용 +1 / 결손: 비용 +1, 효과 -30%'],['다리','경상: 2턴마다 파티 행동력 -1 / 중상: 매 턴 -1 / 결손: 매 턴 -1, 이동이 필요한 사건 선택지 잠김 (양쪽 합산, 행동력 하한 1)'],['상흔','받은 체력 피해가 전투원별로 쌓인다. 개인 최대 체력의 절반에 닿으면 부위 룰렛이 돈다. 치유를 받으면 줄고, 전투가 끝나면 0']];
export const TUTORIAL_COPY={
 cost:['카드 코스트','왼쪽 위 숫자가 카드의 코스트입니다. 집중 관통은 2, 방어 태세는 1을 사용합니다.'],
 'attack-select':['공격 카드 선택','2코스트 집중 관통 카드를 눌러 펼쳐 보세요.'],
 'attack-use':['공격하기','펼친 카드를 점액에게 끌거나, 점액을 클릭하면 공격합니다.'],
 'defense-select':['방어 카드 선택','이번에는 1코스트 방어 태세 카드를 눌러 보세요.'],
 'defense-use':['방어하기','방어 카드를 위쪽으로 드래그하면 공용 보호막을 얻습니다.'],
 'end-turn':['턴 종료','행동력이 0이 되었습니다. 아래 행동력 표시와 오른쪽 턴 종료를 확인한 뒤 턴을 마치세요.'],
 'partner-intro':['함께 싸우는 동료','파트너도 전투를 도울 수 있습니다. 왼쪽에서 전투원과 파트너의 스킬을 고릅니다.'],
 'partner-select':['바르카의 지원','파트너도 전투를 도울 수 있습니다. 바르카를 눌러 지원 카드를 확인하세요.'],
 'partner-use':['지원하기','바르카 카드를 끌거나 점액을 클릭하면 지원이 발동합니다.'],
 refill:['매 턴 행동력 3','새 턴이 시작되면 행동력을 3 받습니다. 남은 행동력은 이월되지 않습니다. 보호막으로 막지 못한 피해는 맞은 동료의 정신 부담으로도 쌓입니다.'],
 free:['이제 자유롭게','남은 점액을 쓰러뜨리세요. 정신 부담이 100이 되면 붕괴하니 방어 카드도 함께 쓰세요.'],
};
