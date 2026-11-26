import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,rollEventOffer,serialize,hydrate,ENEMIES} from '../dist/engine.js';
import {ENEMY_MOVES} from '../dist/enemy-guide.js';
import {BattleMotion} from '../dist/motion.js';
test('ordinary event rewards can be free or carry a cost; premium rewards always carry their authored cost',()=>{
 const ordinary=new Set();let premium=0;
 for(let seed=1;seed<150;seed++){
  const s=createGame(seed);s.eventOffer=rollEventOffer(s);
  for(const c of s.eventOffer.choices){
   const costly=Object.keys(c.cost).length>0;
   if(c.benefit.elite||c.benefit.kind==='gold'&&c.benefit.amount>=40){assert.ok(costly);premium++;}
   else ordinary.add(costly?'cost':'free');
  }
  assert.deepEqual(hydrate(serialize(s)).eventOffer,s.eventOffer);
 }
 assert.deepEqual([...ordinary].sort(),['cost','free']);assert.ok(premium>0);
});
test('every implemented enemy has at least one named move for both codex and battle information',()=>{
 assert.deepEqual(Object.keys(ENEMY_MOVES).sort(),Object.keys(ENEMIES).sort());
 for(const moves of Object.values(ENEMY_MOVES))for(const [name,description]of moves){assert.ok(name.length);assert.ok(description.length>10);}
});
test('melee hold survives forward animation completion and is released only after hit and return',async()=>{
 const log=[],done=Promise.resolve();
 const el={isConnected:true,animate(frames,timing){log.push(['start',frames,timing]);return {finished:done,cancel(){log.push(['cancel']);}};}};
 const m=Object.create(BattleMotion.prototype);m.short=()=>false;
 const hold=await m.animate(el,[{transform:'translateX(0)'},{transform:'translateX(100px)'}],165,{retain:true});
 assert.equal(log.filter(x=>x[0]==='cancel').length,0);assert.equal(log[0][2].fill,'both');assert.equal('retain' in log[0][2],false);
 log.push(['hit-complete']);
 const back=await m.animate(el,[{transform:'translateX(100px)'},{transform:'translateX(0)'}],210,{retain:true});hold.cancel();back.cancel();
 assert.deepEqual(log.map(x=>x[0]),['start','hit-complete','start','cancel','cancel']);
 await m.animate(el,[{opacity:1},{opacity:0}],100);assert.equal(log.at(-1)[0],'cancel');
});
test('player remains at melee impact while either the VFX or damage feedback is still running',async()=>{
 const cls={add(){},remove(){}};const box=x=>({left:x,top:100,width:50,height:100});
 const animations=[],sprite=x=>({isConnected:true,getBoundingClientRect:()=>box(x),animate(){const a={finished:Promise.resolve(),cancelled:false,cancel(){this.cancelled=true;}};animations.push(a);return a;}});
 const source=sprite(100),target=sprite(600),actor={classList:cls,querySelector:()=>source},enemy={classList:cls,querySelector:q=>q==='.sprite'?target:null};
 const old=globalThis.document;globalThis.document={querySelector:q=>q==='#game'?{style:{getPropertyValue:()=>1}}:q.startsWith('[data-ally')?actor:q.startsWith('[data-enemy')?enemy:null};
 let visualDone,floatDone,started;const impact=new Promise(r=>started=r);
 const m=Object.create(BattleMotion.prototype);m.short=()=>true;m.getState=()=>({hp:100,shield:0,party:['lohen'],battle:{enemies:[{id:'e',hp:20,maxHp:30}]}});m.sound=()=>{};m.camera={hit(){}};
 m.effect=()=>{started();return new Promise(r=>visualDone=r);};m.float=()=>new Promise(r=>floatDone=r);
 try{
  const playing=m.playerEffects({hp:100,shield:0,battle:{hand:[]}},{type:'play',_owner:'lohen'},[{type:'damage',enemy:'e',amount:10}]);
  await impact;assert.equal(animations.length,1);assert.equal(animations[0].cancelled,false);
  // Wait for the hit's floating number to start, using its own presentation boundary.
  while(!floatDone)await new Promise(r=>setTimeout(r,1));
  floatDone();await Promise.resolve();assert.equal(animations[0].cancelled,false);assert.equal(animations.length,1);
  visualDone();await playing;assert.equal(animations.length,2);assert.ok(animations.every(a=>a.cancelled));
 }finally{globalThis.document=old;}
});
test('Durin ultimate wings use the caster anchor once for all enemies',async()=>{
 const cls={add(){},remove(){}},sprite={isConnected:true},actor={querySelector:()=>sprite},foes=new Map(['a','b'].map(id=>[id,{classList:cls,querySelector:()=>null}]));const old=globalThis.document;
 globalThis.document={querySelector:q=>q.startsWith('[data-ally')?actor:q.startsWith('[data-enemy')?foes.get(q.match(/"(.*?)"/)[1]):null};
 const m=Object.create(BattleMotion.prototype),calls=[];m.getState=()=>({hp:100,shield:0,party:['durin'],battle:{enemies:[{id:'a',hp:20,maxHp:42},{id:'b',hp:20,maxHp:42}]}});m.short=()=>true;m.sound=()=>{};m.camera={hit(){}};m.animate=async()=>{};m.float=async()=>{};m.effect=async(kind,anchor,options)=>calls.push({kind,anchor,options});
 try{await m.playerEffects({hp:100,shield:0,battle:{hand:[]}},{type:'ultimate',hero:'durin'},[{type:'damage',enemy:'a',amount:22},{type:'damage',enemy:'b',amount:22}]);assert.equal(calls.length,1);assert.equal(calls[0].anchor,sprite);assert.equal(calls[0].options.ultimate,true);assert.equal(calls[0].options.hero,'durin');}finally{globalThis.document=old;}
});
