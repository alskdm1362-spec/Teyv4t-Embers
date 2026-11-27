// v0.36 stage 4: the permanent four-card loadouts and reward pools come from cards-v2.js.
import {V2_STARTERS,V2_DISCOVERIES,v2Pool} from './cards-v2.js';
export const STARTERS=V2_STARTERS;
// Battle discoveries (전술 각성으로 얻는 카드): the first four non-starter cards of each fighter.
export const DISCOVERIES=V2_DISCOVERIES;
export const NEW_CARDS=[];
// Cards that can appear after a won battle: every non-starter, non-generated card of the fighter.
export const REWARD_CARDS=Object.fromEntries(Object.keys(V2_STARTERS).map(id=>[id,v2Pool(id).slice(4)]));
export const REWARD_POOL=Object.fromEntries(Object.keys(V2_STARTERS).map(id=>[id,v2Pool(id)]));
