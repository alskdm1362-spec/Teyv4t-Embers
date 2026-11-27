import {standingArt,partnerCardArt,injuryArt,supportCutinArt} from './cast36.js';
import {collapseArt} from './collapse-art.js';
import {HEROES,ENEMIES} from './engine.js';
import {NEW_ART} from './condition-ui.js';
import {castArt,ART_ROLES} from './cast-art.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const ALLIES=Object.entries(HEROES).flatMap(([hero,h])=>[{id:hero,hero,name:h.name,partner:false},...(h.partners||[h.partner]).map(p=>({id:p,hero,name:h.partnerNames?.[p]||h.partnerName,partner:true}))]);
export function galleryItems(hero,partner=false){const h=HEROES[hero],pid=typeof partner==='string'?partner:h.partner;if(partner)return [{id:'standing',name:'스탠딩',src:standingArt(pid)},{id:'support',name:'파트너 지원',src:supportCutinArt(pid)||castArt(hero,'support'),animation:'support'},{id:'partner-card',name:'지원 카드 일러스트',src:partnerCardArt(pid)}];
 return [{id:'standing',name:'스탠딩',src:castArt(hero,'portrait'),variants:[{id:'normal',name:'기본',src:castArt(hero,'portrait')},{id:'collapse',name:'붕괴',src:castArt(hero,'breakdownPortrait')}]},...[1,2].map(stage=>({id:'breakdown-'+stage,name:'붕괴 '+stage+'단계 컷인',src:collapseArt(hero,stage),animation:'breakdown',stage})),...['ultimate','portraitCutin'].map(role=>({id:role,name:ART_ROLES[role],src:castArt(hero,role),animation:['ultimate','breakdown'].includes(role)?role:null})),...['eye','arm','leg'].map((part,i)=>({id:part,name:['눈 결손','팔 결손','다리 결손'][i],src:injuryArt(hero,part+'-cutin'),animation:'injury-'+['eyes','leftArm','leftLeg'][i]}))];
}
export function allyRail(selected=null){return `<div class="ally-archive-rail" data-drag-scroll tabindex="0" aria-label="아군 목록 · 드래그해서 이동">${ALLIES.map(a=>`<button class="${selected===a.id?'selected':''}" style="--accent:${HEROES[a.hero].color}" data-action="codex-ally" data-entity="${a.id}" aria-label="${a.name} 상세정보"><figure class="archive-standing"><img src="${standingArt(a.id)}" alt="${a.name}" draggable="false"></figure><span>${a.name}<small>${a.partner?'파트너 · '+HEROES[a.hero].name:HEROES[a.hero].role}</small></span></button>`).join('')}</div>`;}
export function galleryMarkup(entity){const a=ALLIES.find(a=>a.id===entity);return `<div class="illustration-folders">${galleryItems(a.hero,a.partner?a.id:false).map(item=>`<details class="illustration-folder"><summary><img src="${item.src}" alt="${esc(item.name)} 미리보기"><span>${esc(item.name)}</span></summary><div>${`<button data-action="art-large" data-entity="${a.id}" data-art="${item.id}">확대</button>`}${item.animation?`<button data-action="replay-cutin" data-hero="${a.hero}" data-kind="${item.animation}" ${item.stage?`data-stage="${item.stage}"`:''}>연출</button>`:''}</div></details>`).join('')}</div>`;}
export function injuryEffects(h){const b=h.body,list=[];
 if(b.eyes===1)list.push('눈 경상 · 손패 1장 흐림');if(b.eyes===2)list.push('눈 중상 · 실명 카드 1장');if(b.eyes===3)list.push('눈 결손 · 손패 절반 흐림 + 실명 카드');
 const arm=(n,side,kind,word)=>{if(n===1)list.push(`${side} 경상 · 턴 첫 ${kind} 카드 비용 +1`);if(n===2)list.push(`${side} 중상 · ${kind} 카드 비용 +1`);if(n===3)list.push(`${side} 결손 · ${kind} 카드 비용 +1, ${word} -30%`);};
 arm(b.rightArm,'오른팔','공격','피해');arm(b.leftArm,'왼팔','방어·보조','효과');
 const legs=[b.leftLeg,b.rightLeg],cut=legs.reduce((n,v)=>n+(v>=2?1:v===1?.5:0),0);if(cut)list.push(`다리 · ${Number.isInteger(cut)?`매 턴 파티 행동력 -${cut}`:cut===.5?'2턴마다 파티 행동력 -1':`2턴마다 파티 행동력 -${cut*2}`}`);if(legs.includes(3))list.push('다리 결손 · 이동이 필요한 사건 선택지 잠김');
 if(h.retired)list.push('거점 치료 전까지 이탈 · 파트너 지원 유지');return list;}
