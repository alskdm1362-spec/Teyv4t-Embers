import {V2_CARDS} from './cards-v2.js';
import {isNewCast,standingArt,supportCutinArt,injuryArt,skillArt,collapseCardArt} from './cast36.js';
import {collapseArt} from './collapse-art.js';
// Every visual role resolves to the supplied archive, never a battle sprite fallback.
export const CAST_IDS=Object.freeze(['lohen','durin','illuga','jahoda','kinich','lyney','cyno']);
export const CAST_FOOT_X=Object.freeze({lohen:.5,durin:.5,illuga:.5,jahoda:.5,kinich:.5,lyney:.5,cyno:.5});
// v0.30 battle sprites: every pose sits on its own square canvas with the feet at the bottom centre.
// base keeps the idle figure as tall as the old sprite; poses[x] is that canvas relative to the idle one.
export const CAST_SPRITES=Object.freeze({"lohen":{"base":1.0186,"poses":{"attack1":1.9317,"attack2":2.5103,"guard":1.2711,"collapse":0.7107}},"durin":{"base":1.1879,"poses":{"attack1":1.2218,"attack2":1.2,"guard":1.0145,"collapse":0.96}},"illuga":{"base":1.2703,"poses":{"attack1":0.9585,"buff":0.9273,"guard":0.8581,"collapse":0.6367}},"jahoda":{"base":1.5024,"poses":{"attack1":0.75,"attack2":0.8149,"buff":0.6737,"draw":0.7062,"guard":0.8539,"collapse":0.6201}},"kinich":{"base":1.0023,"poses":{"attack1":1.0,"attack2":1.3484,"guard":0.8824,"collapse":1.0452}},"lyney":{"base":1.2985,"poses":{"attack1":0.9799,"attack2":0.9497,"buff":1.0872,"draw":0.9732,"guard":0.9732,"collapse":0.7987}},"cyno":{"base":1.1824,"poses":{"attack1":1.3546,"attack2":1.4291,"guard":1.0993,"collapse":0.8759}}});
export const castPose=(id,pose)=>`assets/${isNewCast(id)?'cast36':'cast'}/${id}/pose-${pose}.webp`;
export function preloadPoses(){if(typeof Image==='undefined')return;for(const [id,sp] of Object.entries(CAST_SPRITES))for(const pose of Object.keys(sp.poses))if(pose!=='collapse'){const im=new Image();im.src=castPose(id,pose);}}
export const ART_ROLES=Object.freeze({battle:'전투',portrait:'초상화',ultimate:'필살기',breakdown:'붕괴 컷인',breakdownPortrait:'붕괴 초상',partner:'파트너 초상',support:'지원 컷인',portraitCutin:'첫 컷인 그림',partnerCutin:'첫 지원 그림',battleCollapsed:'붕괴 전투'});
const FILES=Object.freeze({battle:'battle',portrait:'cutin-1',ultimate:'cutin-2',breakdown:'breakdown-1',breakdownPortrait:'breakdown-2',partner:'partner-1',support:'partner-2',portraitCutin:'cutin-1',partnerCutin:'partner-1'});
const PARTNER_OF={lohen:'varka',durin:'albedo',illuga:'flins',jahoda:'nefer',kinich:'mualani',lyney:'lynette',cyno:'tighnari'};
export function castArt(id,role='portrait',stage=1){
 if(!CAST_IDS.includes(id)||(!FILES[role]&&role!=='battleCollapsed'))throw new Error('Unknown cast artwork: '+id+'/'+role);
 if(role==='breakdown')return collapseArt(id,stage);
 if(isNewCast(id)){const d=`assets/cast36/${id}/`,p=PARTNER_OF[id];return role==='ultimate'||role==='portraitCutin'?d+'ultimate.webp':role==='battleCollapsed'?d+'collapse-sprite.webp':role==='battle'?d+'battle.webp':role==='portrait'?standingArt(id):role==='breakdownPortrait'?standingArt(id,true):role==='partner'?standingArt(p):supportCutinArt(p);}
 if(role==='ultimate')return `assets/update25/${id}-ultimate.webp`;
 if(role==='battleCollapsed')return `assets/illustrations3/battle-collapse/${id}.webp`;
 if(role==='portrait')return `assets/illustrations3/standing/${id}.webp`;
 if(role==='breakdownPortrait')return `assets/illustrations3/standing/${id}-collapse.webp`;
 if(role==='partner')return standingArt(PARTNER_OF[id]);
 return `assets/cast/${id}/${FILES[role]}.webp`;
}
// Source numbers refer to the supplied image filenames, not new cards or levels.
export const CARD_ART_MAP=Object.freeze(Object.fromEntries(Object.values(V2_CARDS).map(c=>[c.key,{base:c.art,upgraded:c.art}])));
export const ULTIMATE_CARD_ART=Object.freeze({lohen:7,durin:7,illuga:7,jahoda:4,kinich:7,lyney:7,cyno:7});
export const ultimateCardArtwork=id=>castArt(id,'ultimate');
export const COLLAPSE_ART_MAP=Object.freeze({despair:1,panic:1,distrust:2,frenzy:2});
export function cardArtwork(id,info,key){
 if(!CAST_IDS.includes(id))throw new Error('Unknown card owner: '+id);
 if(info.debuff)return collapseCardArt(id,2);
 if(info.blind)return injuryArt(id,'eye-card');
 if(info.breakdown)return collapseCardArt(id,COLLAPSE_ART_MAP[info.breakdownType]||1);
 const art=CARD_ART_MAP[key];if(!art)throw new Error('Missing card art mapping: '+key);
 return skillArt(id,art.base);
}
