import {NEW_CARDS} from './awakening.js';
import {collapseArt} from './collapse-art.js';
// Every visual role resolves to the supplied archive, never a battle sprite fallback.
export const CAST_IDS=Object.freeze(['lohen','durin','illuga','jahoda']);
export const CAST_FOOT_X=Object.freeze({lohen:.5,durin:.5,illuga:.5,jahoda:.5});
// v0.30 battle sprites: every pose sits on its own square canvas with the feet at the bottom centre.
// base keeps the idle figure as tall as the old sprite; poses[x] is that canvas relative to the idle one.
export const CAST_SPRITES=Object.freeze({"lohen":{"base":1.0186,"poses":{"attack1":1.9317,"attack2":2.5103,"guard":1.2711,"collapse":0.7107}},"durin":{"base":1.1879,"poses":{"attack1":1.2218,"attack2":1.2,"guard":1.0145,"collapse":0.96}},"illuga":{"base":1.2703,"poses":{"attack1":0.9585,"buff":0.9273,"guard":0.8581,"collapse":0.6367}},"jahoda":{"base":1.5024,"poses":{"attack1":0.75,"attack2":0.8149,"buff":0.6737,"draw":0.7062,"guard":0.8539,"collapse":0.6201}}});
export const castPose=(id,pose)=>`assets/cast/${id}/pose-${pose}.webp`;
export function preloadPoses(){if(typeof Image==='undefined')return;for(const [id,sp] of Object.entries(CAST_SPRITES))for(const pose of Object.keys(sp.poses))if(pose!=='collapse'){const im=new Image();im.src=castPose(id,pose);}}
export const ART_ROLES=Object.freeze({battle:'전투',portrait:'초상화',ultimate:'필살기',breakdown:'붕괴 컷인',breakdownPortrait:'붕괴 초상',partner:'파트너 초상',support:'지원 컷인',portraitCutin:'첫 컷인 그림',partnerCutin:'첫 지원 그림',battleCollapsed:'붕괴 전투'});
const FILES=Object.freeze({battle:'battle',portrait:'cutin-1',ultimate:'cutin-2',breakdown:'breakdown-1',breakdownPortrait:'breakdown-2',partner:'partner-1',support:'partner-2',portraitCutin:'cutin-1',partnerCutin:'partner-1'});
export function castArt(id,role='portrait',stage=1){
 if(!CAST_IDS.includes(id)||(!FILES[role]&&role!=='battleCollapsed'))throw new Error('Unknown cast artwork: '+id+'/'+role);
 if(role==='breakdown')return collapseArt(id,stage);
 if(role==='ultimate')return `assets/update25/${id}-ultimate.webp`;
 if(role==='battleCollapsed')return `assets/illustrations3/battle-collapse/${id}.webp`;
 if(role==='portrait')return `assets/illustrations3/standing/${id}.webp`;
 if(role==='breakdownPortrait')return `assets/illustrations3/standing/${id}-collapse.webp`;
 if(role==='partner')return `assets/illustrations3/standing/${({lohen:'varka',durin:'albedo',illuga:'flins',jahoda:'nefer'})[id]}.webp`;
 return `assets/cast/${id}/${FILES[role]}.webp`;
}
// Source numbers refer to the supplied image filenames, not new cards or levels.
export const CARD_ART_MAP=Object.freeze({
 ...Object.fromEntries(NEW_CARDS.map(([key,art])=>[key,{base:art,upgraded:art}])),
 l_strike:{base:1,upgraded:5},l_guard:{base:4,upgraded:6},l_pierce:{base:3,upgraded:7},l_aim:{base:2,upgraded:2},
 d_strike:{base:1,upgraded:5},d_guard:{base:4,upgraded:4},d_wave:{base:3,upgraded:7},d_charge:{base:2,upgraded:6},
 i_strike:{base:3,upgraded:7},i_guard:{base:1,upgraded:6},i_counter:{base:4,upgraded:4},i_cover:{base:2,upgraded:5},
 d_resonance:{base:6,upgraded:6},j_dossier:{base:2,upgraded:2},
 j_strike:{base:1,upgraded:4},j_guard:{base:6,upgraded:7},j_draw:{base:5,upgraded:5},j_energy:{base:3,upgraded:2},
});
export const ULTIMATE_CARD_ART=Object.freeze({lohen:7,durin:7,illuga:7,jahoda:4});
export const ultimateCardArtwork=id=>castArt(id,'ultimate');
export const COLLAPSE_ART_MAP=Object.freeze({despair:1,panic:1,distrust:2,frenzy:2});
export function cardArtwork(id,info,key){
 if(!CAST_IDS.includes(id))throw new Error('Unknown card owner: '+id);
 const directory=`assets/illustrations/cards/${id}`;
 if(info.debuff)return `${directory}/collapse-2.webp`;
 if(info.blind)return `assets/illustrations3/injuries/${id}/eye-card.webp`;
 if(info.breakdown)return `${directory}/collapse-${COLLAPSE_ART_MAP[info.breakdownType]||1}.webp`;
 const art=CARD_ART_MAP[key];if(!art)throw new Error('Missing card art mapping: '+key);
 return `${directory}/skill-${art.base}.webp`;
}
