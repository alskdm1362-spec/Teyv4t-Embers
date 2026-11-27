/* v0.36 stage 2: card term system (planning doc §9). Rule keywords follow the attached glossary;
   Embers-only terms name statuses so the original game's proper nouns are not reused. */

// Rule keywords, in the order they are printed on a card. A card carries at most two.
export const KEYWORDS={
 exhaust:{name:'소멸',desc:'사용하면 이번 전투에서 제외된다'},
 evaporate:{name:'증발',desc:'턴 종료 시 손에 남아 있으면 소멸한다'},
 unplayable:{name:'사용 불가',desc:'직접 사용할 수 없다'},
 unique:{name:'유일',desc:'복제되지 않는다'},
 retain:{name:'보존',desc:'턴 종료 시 버려지지 않는다. 「보존:」 효과는 보존된 채 턴을 넘기면 적용'},
 recall:{name:'회수',desc:'무덤으로 가면 손으로 돌아온다. 한 번 발동하면 회수가 사라진다'},
 finale:{name:'종극',desc:'사용하면 턴이 끝난다'},
 opening:{name:'개전',desc:'전투 시작 시 뽑을 카드 맨 위에 놓인다'},
 initiative:{name:'주도',desc:'턴 시작 시 50% 확률로 비용 1 감소. 다른 카드를 먼저 쓰면 감소가 사라진다'},
 chain:{name:'연계',desc:'다른 전투원이 카드를 쓰면 적힌 효과가 발동한다'},
 sense:{name:'감응',desc:'드로우되면 효과가 발동한다'},
};
export const KEYWORD_ORDER=Object.keys(KEYWORDS);

// Embers-only terms (statuses and resources).
export const EMBER_TERMS={
 crack:{name:'균열',kind:'적 약화',desc:'받는 피해 +8% × 스택(최대 5). 턴 종료 시 1 감소'},
 wither:{name:'위축',kind:'적 약화',desc:'주는 피해 -25%'},
 reflect:{name:'되비춤',kind:'아군 강화',desc:'보호막으로 공격을 전부 막아내면 공격자에게 반격'},
 track:{name:'추적흔',kind:'키니치 전용',desc:'연타 1타마다 1(최대 10). 분쇄 카드가 소모'},
 aim:{name:'조준점',kind:'타이나리 전용',desc:'붙은 적에게 사이노 치명확률 +30%'},
 solar:{name:'태양화',kind:'알베도 전용',desc:'협공 발동마다 1. 3이 되면 강화 협공'},
 scar:{name:'상흔',kind:'부상 누적',desc:'개인이 받은 HP 피해 누적. 최대 HP의 25%에 닿으면 부상 이벤트'},
 stress:{name:'정신부담',kind:'기존 유지',desc:'초상화 옆 이름 아래 게이지. 가득 차면 정신 붕괴'},
};
export const CRACK_MAX=5,CRACK_PER_STACK=.08,WITHER_RATE=.25,HAND_LIMIT=10,HAND_WARN=9;

export function cardKeywords(form){
 const list=new Set(form?.keywords||[]);if(form?.exhaust)list.add('exhaust');
 return KEYWORD_ORDER.filter(k=>list.has(k));
}
export function keywordLine(list){return list.map(k=>KEYWORDS[k]?.name).filter(Boolean).join(' · ');}
// Glossary entries for the card inspector: rule keywords first, then Embers terms.
export const TERM_GLOSSARY=[...Object.values(KEYWORDS).map(k=>[k.name,k.desc]),...Object.values(EMBER_TERMS).map(t=>[t.name,t.desc])];
