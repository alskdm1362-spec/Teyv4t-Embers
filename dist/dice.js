import {fallbackRollDie} from './dice-fallback.js';
// Result is already committed by the rules. Physics never draws a gameplay result.
export function rollDie(host,result,{instant=false,onDone=()=>{},sound=()=>{}}={}){
 let cancelled=false,engine=null,fallbackStop=null,reported=false;
 const finish=()=>{if(!cancelled&&!reported){reported=true;host.dataset.result=String(result);host.dataset.rolling='false';onDone();}};
 host.dataset.rolling='true';host.dataset.result='';
 void import('./vendor/polyhedral-dice.js').then(({PolyhedralDiceEngine})=>{
  if(cancelled||!host.isConnected)return;
  try{engine=new PolyhedralDiceEngine(host,{numberColor:'#e7f3f8',sound:{init(){},playImpact(gain){sound(Math.min(.5,gain));}},onRollComplete:finish});engine.roll([{type:'d20',targetValue:result}]);if(instant)engine.finish();}
  catch(error){engine?.destroy();engine=null;host.replaceChildren();const canvas=document.createElement('canvas');host.append(canvas);host.dataset.renderer='canvas-fallback';fallbackStop=fallbackRollDie(canvas,result,{instant,onDone:finish});}
 }).catch(()=>{if(cancelled||!host.isConnected)return;const canvas=document.createElement('canvas');host.replaceChildren(canvas);host.dataset.renderer='canvas-fallback';fallbackStop=fallbackRollDie(canvas,result,{instant,onDone:finish});});
 return ()=>{cancelled=true;engine?.destroy();fallbackStop?.();};
}
