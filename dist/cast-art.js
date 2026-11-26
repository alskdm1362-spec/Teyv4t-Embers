import {NEW_CARDS} from './awakening.js';
import {collapseArt} from './collapse-art.js';
// Every visual role resolves to the supplied archive, never a battle sprite fallback.
export const CAST_IDS=Object.freeze(['lohen','durin','illuga','jahoda']);
export const CAST_FOOT_X=Object.freeze({lohen:.563477,durin:.740234,illuga:.573242,jahoda:.583008});
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
