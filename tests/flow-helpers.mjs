import assert from 'node:assert/strict';
import {act} from '../dist/engine.js';
export function completeJoin(s){const go=a=>{const r=act(s,a);assert.ok(r.ok,r.error);};if(s.phase==='arrival')go({type:'ackRecruit'});while(s.phase==='joinDialogue')go({type:'joinNext'});}
export function finishCare(s,hero){const go=a=>{const r=act(s,a);assert.ok(r.ok,r.error);};go({type:'careStart',hero});for(let i=0;i<20;i++)go({type:'careNext'});go({type:'calm',hero});}
