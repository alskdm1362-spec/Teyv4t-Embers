import {V2_CARDS} from './cards-v2.js';
import {isNewCast,standingArt,supportCutinArt,injuryArt,skillArt,collapseCardArt} from './cast36.js';
import {collapseArt} from './collapse-art.js';
// Every visual role resolves to the supplied archive, never a battle sprite fallback.
export const CAST_IDS=Object.freeze(['lohen','durin','illuga','jahoda','kinich','lyney','cyno']);
// v0.39: 발 위치(그림 너비 대비 0~1). 그림마다 몸이 캔버스 가운데에 있지 않아서, 맨 아래 몇 줄의 발 너비로 잰 값이다.
// 화면에서는 이 점이 전투원 자리(발판 고리)의 가운데에 오도록 그림을 옮긴다. 새 그림을 넣으면 다시 잰다(docs/V039-BATTLE-LAYOUT.md).
export const CAST_FEET=Object.freeze({"lohen":{"idle":0.477,"attack1":0.494,"attack2":0.506,"guard":0.343,"collapse":0.497},"durin":{"idle":0.508,"attack1":0.513,"attack2":0.506,"guard":0.504,"collapse":0.478},"illuga":{"idle":0.457,"attack1":0.501,"buff":0.487,"guard":0.509,"collapse":0.575},"jahoda":{"idle":0.446,"attack1":0.51,"attack2":0.515,"buff":0.507,"draw":0.501,"guard":0.362,"collapse":0.665},"kinich":{"idle":0.505,"attack1":0.666,"attack2":0.584,"guard":0.627,"collapse":0.729},"lyney":{"idle":0.664,"attack1":0.665,"attack2":0.726,"buff":0.632,"draw":0.663,"guard":0.733,"collapse":0.608},"cyno":{"idle":0.69,"attack1":0.566,"attack2":0.561,"guard":0.735,"collapse":0.525}});
export const CAST_FOOT_X=Object.freeze(Object.fromEntries(Object.entries(CAST_FEET).map(([id,f])=>[id,f.idle])));
// 자리 미세 조정(전투원 칸 너비 대비). 나모 님 지시(2026-11-28): 야호다 오른쪽, 리니·사이노 왼쪽.
export const CAST_NUDGE=Object.freeze({jahoda:.07,lyney:-.07,cyno:-.07});
/** 전투 그림 한 장의 배율·발 위치. pose: idle | attack1 | … | collapse */
export function spriteFrame(id,pose='idle'){const sp=CAST_SPRITES[id],f=CAST_FEET[id];if(!sp)return {scale:1,foot:.5};return {scale:+(sp.base*(pose==='idle'?1:sp.poses[pose]||1)).toFixed(4),foot:f?.[pose]??f?.idle??.5};}
/** .fighter와 그 .sprite에 거는 CSS 변수 문자열 */
export function spriteVars(id,pose='idle'){const {scale,foot}=spriteFrame(id,pose);return `--foot-x:${foot};--sprite-scale:${scale};--nudge:${CAST_NUDGE[id]||0}`;}
// v0.30 battle sprites: every pose sits on its own square canvas (feet on the bottom edge).
// v0.39: base = 대기 캔버스 너비 / 446 — 나모 님이 맞춘 그림 크기(픽셀)를 그대로 살린다. 예전에는 모두 같은 키로 늘렸다.
// poses[x] = 그 포즈 캔버스 / 대기 캔버스.
export const CAST_SPRITES=Object.freeze({"lohen":{"base":0.9843,"poses":{"attack1":1.9317,"attack2":2.5103,"guard":1.2711,"collapse":0.7107}},"durin":{"base":1.2332,"poses":{"attack1":1.2218,"attack2":1.2,"guard":1.0145,"collapse":0.96}},"illuga":{"base":1.296,"poses":{"attack1":0.9585,"buff":0.9273,"guard":0.8581,"collapse":0.6367}},"jahoda":{"base":1.3812,"poses":{"attack1":0.75,"attack2":0.8149,"buff":0.6737,"draw":0.7062,"guard":0.8539,"collapse":0.6201}},"kinich":{"base":0.991,"poses":{"attack1":1.0,"attack2":1.3484,"guard":0.8824,"collapse":1.0452}},"lyney":{"base":1.3363,"poses":{"attack1":0.9799,"attack2":0.9497,"buff":1.0872,"draw":0.9732,"guard":0.9732,"collapse":0.7987}},"cyno":{"base":1.2646,"poses":{"attack1":1.3546,"attack2":1.4291,"guard":1.0993,"collapse":0.8759}}});
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
