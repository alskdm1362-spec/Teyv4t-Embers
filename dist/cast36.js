/* v0.36 stage 4: art paths for the new fighters (키니치·리니·사이노), their partners and the extra cards.
   Everything new lives under assets/cast36/ (own manifest); the older folders and manifests are unchanged. */
export const NEW_CAST=Object.freeze(['kinich','lyney','cyno']);
export const NEW_PARTNERS=Object.freeze({mualani:'kinich',kachina:'kinich',lynette:'lyney',tighnari:'cyno'});
const D='assets/cast36/',OLD='assets/illustrations3/';
export const isNewCast=id=>NEW_CAST.includes(id);
// Works for a fighter id or a partner id.
export function standingArt(id,collapse=false){
 if(isNewCast(id))return `${D}${id}/standing${collapse?'-collapse':''}.webp`;
 if(NEW_PARTNERS[id])return `${D}${NEW_PARTNERS[id]}/partner-${id}.webp`;
 return `${OLD}standing/${id}${collapse?'-collapse':''}.webp`;
}
export const faceArt36=(id,broken=false)=>isNewCast(id)?`${D}${id}/face${broken?'-collapse':''}.webp`:`${OLD}portraits/${id}${broken?'-collapse':''}.webp`;
export const bannerArt=id=>isNewCast(id)?`${D}${id}/banner.webp`:NEW_PARTNERS[id]?`${D}${NEW_PARTNERS[id]}/banner-${id}.webp`:`${OLD}skill-portraits/${id}.webp`;
export const partnerCardArt=pid=>NEW_PARTNERS[pid]?`${D}${NEW_PARTNERS[pid]}/partner-card-${pid}.webp`:`${OLD}partner-cards/${pid}.webp`;
export const supportCutinArt=pid=>NEW_PARTNERS[pid]?`${D}${NEW_PARTNERS[pid]}/support-${pid}.webp`:null;
// name: eye-card | eye-cutin | arm-cutin | leg-cutin. Arm and leg art is shared by the left and right side.
export const injuryArt=(hero,name)=>isNewCast(hero)?`${D}${hero}/${name}.webp`:`${OLD}injuries/${hero}/${name}.webp`;
export const breakdownArt36=(hero,n)=>`${D}${hero}/breakdown-${n}.webp`;
export const skillArt=(id,n)=>isNewCast(id)?`${D}${id}/skill-${n}.webp`:n>7?`${D}extra/${id}-skill-${n}.webp`:`assets/illustrations/cards/${id}/skill-${n}.webp`;
export const collapseCardArt=(id,n)=>isNewCast(id)?`${D}${id}/collapse-${n}.webp`:`assets/illustrations/cards/${id}/collapse-${n}.webp`;
export const AJAW_ART=`${D}kinich/ajaw.png`;
// v0.39 분쇄 모드: 키니치 뒤에 크게 뜨는 아쥬 (나모 님 제공 ajaw-분쇄.png)
export const AJAW_CRUSH_ART=`${D}kinich/ajaw-crush.webp`;
