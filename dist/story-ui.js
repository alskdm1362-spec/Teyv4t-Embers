import {standingArt} from './cast36.js';
import {HEROES} from './engine.js';
import {JOIN_LINES,CARE_SCRIPT} from './story-scripts.js';
import {NEW_ART} from './condition-ui.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const name=id=>HEROES[id]?.name||Object.values(HEROES).map(h=>h.partnerNames?.[id]||(h.partner===id?h.partnerName:null)).find(Boolean)||id;
export function storyDialogue({kind,hero,index=0,broken=false,controls=''}){
 const lines=kind==='join'?JOIN_LINES[hero]:CARE_SCRIPT[hero],line=lines[Math.min(index,lines.length-1)];
 const normal=lines.slice(0,index+1).some(l=>l.normal),ids=kind==='join'?['lohen',hero]:[hero,HEROES[hero].partner];
 const side=kind==='join'?'left':['varka','albedo'].includes(ids[1])?'left':'right';
 return `<div class="visual-dialogue story-dialogue ${kind==='join'?'join-conversation':''} ${line.hideLohen?'solo-speaker':''} partner-${side}"><div class="dialogue-actors">${ids.map((id,i)=>{if(kind==='join'&&id==='lohen'&&line.hideLohen)return '';const collapse=kind==='care'&&id===hero&&broken&&!normal;return `<img class="dialogue-actor ${i===0?'actor-hero':'actor-partner'} ${line.speaker===id?'speaking':'listening'} ${line.speaker===id&&line.motion?'story-'+line.motion:''}" src="${standingArt(id,collapse)}" alt="${name(id)}" data-story-actor="${id}">`;}).join('')}</div><div class="dialogue-box"><strong>${name(line.speaker)}</strong><p>${esc(line.text)}</p><div class="dialogue-controls"><small>${index+1} / ${lines.length}</small>${controls}</div></div></div>`;
}
export function arrivalMarkup(hero){const h=HEROES[hero],last=h.name.charCodeAt(h.name.length-1),particle=(last-0xac00)%28?'이':'가';return `<button type="button" data-action="ack-recruit" class="arrival-scene" aria-label="${h.name} 합류"><div class="arrival-light"></div><img class="arrival-standing" src="${standingArt(hero)}" alt="${h.name} 스탠딩"><div class="arrival-caption"><small>FAVONIUS · SUPPORT ARRIVED</small><h2>${h.name}</h2><p>${h.name}${particle} 지원 요청에 응답했습니다.</p></div></button>`;}
