// Visual stage is derived from the existing saved failure count; no save migration or RNG.
import {isNewCast,breakdownArt36} from './cast36.js';
export const COLLAPSE_CAST=['lohen','durin','illuga','jahoda','kinich','lyney','cyno'];
export function collapseStage(breakdown){if(!breakdown)return 0;return Number(breakdown.failures)>=4?2:1;}
export function collapseArt(hero,stage=1){if(!COLLAPSE_CAST.includes(hero))throw Error('Unknown collapse hero: '+hero);const n=stage===2?2:1;if(isNewCast(hero))return breakdownArt36(hero,n);if(hero==='illuga'||n===2&&['lohen','durin'].includes(hero))return `assets/update25/${hero}-collapse-${n}.webp`;return `assets/collapse-stages/${hero}-stage-${n}.png`;}
export function collapseCutins(before,after){return after.party.filter(id=>{const old=collapseStage(before.heroes[id]?.breakdown),next=collapseStage(after.heroes[id]?.breakdown);return next>old;});}
export const COLLAPSE_GLASS={1:{opacity:.44,duration:2150},2:{opacity:.68,duration:2600}};
