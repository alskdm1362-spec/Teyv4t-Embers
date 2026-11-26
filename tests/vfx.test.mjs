import test from 'node:test';
import assert from 'node:assert/strict';
import {effectSpec,drawEffectFrame,BespokeVFX} from '../dist/vfx.js';
const kinds=['spear','frost-finisher','arcane-wave','guard','guard-hit','counter','feint','rally','focus','wind-cleave','veil','night-thrust','venom-mark','abyss-hit','celestial-hit','abyss-charge','celestial-charge','collapse','recover','dissolve','flame-heal'];
function context(){const calls=[];let depth=0;const c={calls,get depth(){return depth;},save(){depth++;},restore(){depth--;assert.ok(depth>=0);},clearRect(){},setTransform(){}};
 for(const key of ['translate','rotate','moveTo','lineTo','bezierCurveTo','fillRect','scale'])c[key]=(...args)=>{assert.ok(args.every(Number.isFinite),key+' must have finite geometry');assert.ok(args.every(x=>Math.abs(x)<10000));calls.push([key,...args]);};
 c.drawImage=()=>calls.push(['drawImage']);
 for(const key of ['beginPath','closePath','fill','stroke'])c[key]=()=>calls.push([key]);return c;}
test('all original effects draw finite, balanced geometry throughout their lifetime and reduced motion',()=>{
 for(const kind of kinds)for(const quick of [false,true])for(const t of [0,.12,.25,.5,.8,1]){const c=context();assert.equal(drawEffectFrame(c,kind,t,{quick,seed:42,angle:-.2}),true,kind);assert.equal(c.depth,0,kind);assert.ok(c.calls.length,kind);}
 assert.equal(drawEffectFrame(context(),'missing',.5),false);
});
test('attack, protection, corruption and recovery have distinct deterministic silhouettes',()=>{
 const signature=kind=>{const c=context();drawEffectFrame(c,kind,.45,{seed:42});return JSON.stringify(c.calls);};
 const selected=['spear','arcane-wave','guard','wind-cleave','night-thrust','venom-mark','abyss-hit','celestial-hit','flame-heal'];assert.equal(new Set(selected.map(signature)).size,selected.length);assert.equal(signature('spear'),signature('spear'));
 const first=effectSpec('spear');first.colors[0]='changed';assert.notEqual(effectSpec('spear').colors[0],'changed');
});
test('effects follow moving cutin anchors and clearing releases promises and frame loop',async()=>{
 const old={};const keys=['document','window','innerWidth','innerHeight','requestAnimationFrame','cancelAnimationFrame'];for(const key of keys)old[key]=Object.getOwnPropertyDescriptor(globalThis,key);
 let cancelled=0,frame;const c=context(),canvas={style:{},dataset:{},isConnected:true,setAttribute(){},getContext(){return c;},remove(){this.isConnected=false;}};
 try{
  globalThis.document={hidden:false,createElement(){return canvas;},body:{append(){}},querySelector(){return null;},addEventListener(){},removeEventListener(){}};globalThis.window={addEventListener(){},removeEventListener(){}};globalThis.innerWidth=844;globalThis.innerHeight=390;globalThis.requestAnimationFrame=fn=>{frame=fn;return 1;};globalThis.cancelAnimationFrame=()=>cancelled++;
  let left=50;const v=new BespokeVFX(),anchor={isConnected:true,closest(){return null;},getBoundingClientRect(){return {left,top:40,width:110,height:150};}};
  const done=v.play('spear',anchor);assert.equal(canvas.dataset.active,'spear');assert.equal(typeof frame,'function');left=150;frame(performance.now()+100);assert.equal(v.effects[0].x,205);assert.ok(Number(canvas.dataset.frame)>0);v.clear();await done;assert.equal(canvas.dataset.active,'');assert.equal(cancelled,1);assert.equal(v.effects.length,0);v.destroy();
 }finally{for(const key of keys)if(old[key])Object.defineProperty(globalThis,key,old[key]);else delete globalThis[key];}
});
