import {collapseCutins} from './collapse-art.js';
/* Presentation consumes committed events. It never rolls dice or mutates rules. */
export function presentationPlan(before,after,action,events){
 const groups=[];let current=null;
 for(const e of events){if(e.type==='enemyAction'){current={...e,hostile:!!(e.damage||e.stress),effects:[]};groups.push(current);}else if(current&&!['draw','discard','shuffle','turn'].includes(e.type))current.effects.push(e);}
 const played=events.find(e=>e.type==='card');
 return {
  played:played?{uid:played.uid,destination:played.destination}:null,
  discarded:events.filter(e=>e.type==='discard').map(e=>e.uid),
  drawn:events.filter(e=>['draw','createCard','combine'].includes(e.type)).map(e=>e.uid),combine:events.find(e=>e.type==='combine')||null,
  shuffled:events.some(e=>e.type==='shuffle'),
  attacks:groups,
  collapseCutins:collapseCutins(before,after),
  changed:after.party.filter(id=>JSON.stringify(before.heroes[id]?.breakdown)!==JSON.stringify(after.heroes[id]?.breakdown)),
  // A card that spends the last AP ends the turn in the same action: its own hits come before the first enemy action
  // and are shown first (v0.37; before this they were dropped, so 칠흑의 심판 showed no strike at all).
  effects:(groups.length?(action.type==='play'?events.slice(0,events.findIndex(e=>e.type==='enemyAction')):[]):events).filter(e=>!['card','draw','discard','shuffle','battle','turn'].includes(e.type)),
  newBattle:after.phase==='battle'&&(before.phase!=='battle'||action.type==='restart'),
 };
}
