// v0.39 전투원별 이펙트 — 나모 님 피드백(2026-11-28)과 참고 영상 15편을 보고 카드마다 모양을 나눴다.
// docs/V039-CAST-VFX.md 에 영상별 분석과 카드 → 이펙트 표가 있다.
// 그리는 규칙은 v0.37 붓(fx-brush.js)을 그대로 따른다: 선은 양 끝이 뾰족하거나 흐릿하고, 한 이펙트는 한 색 + 흰색.
// 예외 두 가지: 두린의 불은 「그린 듯한」 셀 불꽃(toon-fire.js), 키니치는 픽셀(격자에 붙은 네모).
import {brushStroke,brushRing,spikeStar,crescent,fleck,inkStroke,arcPoints,quadPoints} from './fx-brush.js';

// ---------- 카드 → 모양 ----------
// 근접(돌진) 여부도 여기서 정한다: 원거리 카드는 제자리에서 쏜다.
export const CARD_FX=Object.freeze({
 lohen:{l_strike:'stab',l_chase:'stab',l_pierce:'arrow',l_breach:'dagger'},
 illuga:{i_strike:'swing',i_riposte:'moon'},
 jahoda:{j_strike:'kicks',j_dart:'dart'},
 durin:{d_strike:'claw',d_wave:'wave',d_cinder:'cinder',d_comet:'comet',d_resonance:'ember',d_furnace:'ember',d_hand:'ember'},
 kinich:{k_shot:'shot',k_loop:'loop',k_dash:'dash',k_cannon:'cannon',k_fist:'fist'},
 lyney:{y_arrow:'arrow',y_cane:'cane',y_show:'show',y_curtain:'curtain'},
 cyno:{c_thrust:'thrust',c_claw:'swing'},
});
const RANGED={lohen:['arrow'],jahoda:['dart'],kinich:['shot','loop','dash','cannon','fist'],durin:['claw','wave','cinder','comet','ember'],lyney:['arrow','cane','show','curtain'],illuga:[],cyno:[]};
export const cardStyle=(hero,card)=>CARD_FX[hero]?.[card]||null;
/** 카드를 쓸 때 적에게 달려드는가 */
export function isMeleeCard(hero,card){const st=cardStyle(hero,card);if(['durin','lyney','kinich'].includes(hero))return false;return !RANGED[hero]?.includes(st);}

// 색
export const CAST_COLORS=Object.freeze({
 frost:{core:'#ffffff',main:'#8fdcff',deep:'#2f63e0',spark:'#d6f4ff',accent:'#ff6fd0'},
 gold:{core:'#fffbea',main:'#ffd66b',deep:'#d48a18',spark:'#fff1b8'},
 jahoda:{core:'#fff3fb',main:'#ff7ab8',deep:'#c7266f',spark:'#8ff4ff',teal:'#3fe3d4'},
 teal:{core:'#effffd',main:'#45e6d2',deep:'#0f8f86',spark:'#c4fff6'},
 fire:{core:'#fff1a8',main:'#ff7a26',deep:'#c8162a',ink:'#2a0612',glow:'#ff4a2a'},
 pixel:{core:'#f4ffb0',main:'#7dff4f',deep:'#18a84a',spark:'#ffe94a',dark:'#0b3a1c'},
 magic:{core:'#fffaf0',main:'#ff8a5c',deep:'#d4245a',spark:'#ffd06a',pink:'#ff7ac8',smoke:'#f3c9d8'},
 judge:{core:'#f6eaff',main:'#b06bff',deep:'#4a1a9e',spark:'#e0c4ff'},
 venom:{core:'#f0ffe0',main:'#4ff08a',deep:'#0c8a3e',spark:'#d6ff6a'},
 wind:{core:'#f0fffd',main:'#5ff0d6',deep:'#14907e',spark:'#c8fff4'},
 water:{core:'#ffffff',main:'#5fc8ff',deep:'#1a5fd0',spark:'#ffd36a',pink:'#ff9ae0'},
 geo:{core:'#fff8da',main:'#ffcf4a',deep:'#c07a10',spark:'#fff0a0',rock:'#7a5420'},
 bloom:{core:'#fbffe6',main:'#c8f54a',deep:'#4fa818',spark:'#ffffff'},
 storm:{core:'#f2f0ff',main:'#8c7cff',deep:'#3a2ab0',spark:'#d8d0ff',smoke:'#c44ee0'},
 heal:{core:'#fff8e6',main:'#ffb04a',deep:'#e0521c',spark:'#ffe39a'},
});

/** 어떤 이펙트를 어디에 그릴지. null이면 battle-vfx.js의 예전 계획을 쓴다. */
export function castPlan(kind,o,C0){
 const K=CAST_COLORS,ult=!!o.ultimate,h=o.hero,st=cardStyle(h,o.card),late=o.index>0;
 // 파트너 지원
 if(kind==='partner'){const p=o.partner;
  if(p==='nefer')return [{fx:'neferRune',at:'center',cols:K.venom,hold:420}];
  if(p==='lynette')return [{fx:'lynetteWind',at:'center',cols:K.wind,hold:380}];
  if(p==='mualani')return [{fx:'mualaniBubble',at:'center',cols:K.water,from:true,hold:560,delay:late?120:0}];
  if(p==='kachina')return [{fx:'kachinaDrill',at:'center',cols:K.geo,hold:420}];
  if(p==='tighnari')return [{fx:'tighnariBloom',at:'center',cols:K.bloom,from:true,hold:460}];
  if(p==='flins')return [{fx:'flinsSpears',at:'center',cols:K.storm,hold:360}];
  return null;}
 if(kind==='illuga-light')return [{fx:'lanternFlare',at:'body',cols:K.gold,hold:260}];
 if(kind==='illuga-bird')return [{fx:'goldBird',at:'body',cols:K.gold,from:true,hold:300}];
 if(kind==='jahoda-aura')return [{fx:'jahodaAura',at:'body',cols:K.jahoda,hold:700}];
 if(kind==='kinich-mode')return [{fx:'pixelGlitch',at:'body',cols:K.pixel,opts:{crush:o.mode==='crush'},hold:300}];
 if(kind==='flame-heal')return [{fx:'flameOrbit',at:'body',cols:K.heal,hold:700}];
 if((kind==='rally'||kind==='focus')&&h==='jahoda'){
  const c=o.card;if(c==='j_energy')return [{fx:'clockwork',at:'feet',cols:K.teal,opts:{big:true},hold:320}];
  if(c==='j_reserve')return [{fx:'reservePulse',at:'body',cols:K.jahoda,hold:320}];
  if(c==='j_draw')return [{fx:'cardSwirl',at:'body',cols:K.teal,hold:280}];
  return [{fx:'clockwork',at:'feet',cols:K.teal,opts:{},hold:260}];}
 if(kind==='guard'&&o.shield&&h==='illuga'&&!o.enemy)return [{fx:'goldDome',at:'body',cols:K.gold,opts:{big:o.strength>1||o.card==='i_watch',mirror:o.card==='i_counter'},hold:300}];
 if(!['spear','counter','feint','arcane-wave','frost-finisher'].includes(kind))return null;
 // ---- 공격 ----
 if(h==='lohen'){if(ult)return [{fx:'lohenUlt',at:'center',cols:K.frost,from:true,hold:640}];
  if(st==='arrow')return [{fx:'iceArrow',at:'center',cols:K.frost,from:true,hold:200}];
  if(st==='dagger')return [{fx:'daggerX',at:'center',cols:K.frost,hold:120}];
  return [{fx:'iceStab',at:'center',cols:K.frost,from:true,hold:110}];}
 if(h==='illuga'){if(ult)return [{fx:'moonSweep',at:'center',cols:K.gold,opts:{big:true},hold:360}];
  if(st==='moon')return [{fx:'moonSweep',at:'center',cols:K.gold,opts:{},hold:260}];
  return null;}
 if(h==='jahoda'){if(st==='dart')return [{fx:'dart',at:'center',cols:K.jahoda,from:true,hold:200}];
  if(st==='kicks')return [{fx:'kick',at:'center',cols:C0.kick,opts:{big:true}}];
  return [{fx:'kick',at:'center',cols:C0.kick,opts:{}}];}
 if(h==='durin'){const F=K.fire;
  if(ult)return late?[{fx:'celBurst',at:'center',cols:F,opts:{big:true},delay:720,hold:780}]:[{fx:'durinUlt',at:'center',cols:F,from:true,hold:780}];
  if(st==='claw')return [{fx:'fireClaw',at:'center',cols:F,hold:160}];
  if(st==='comet')return [{fx:'fireComet',at:'center',cols:F,hold:330,delay:late?90*o.index:0}];
  if(st==='cinder')return [{fx:'fireRain',at:'center',cols:F,hold:300}];
  if(st==='wave')return [{fx:'celBurst',at:'center',cols:F,opts:{wing:true},hold:220,delay:late?70*o.index:0}];
  return [{fx:'celBurst',at:'center',cols:F,opts:{},hold:180,delay:late?60*o.index:0}];}
 if(h==='kinich'){const P=K.pixel;
  if(st==='cannon')return [{fx:'pixelBeam',at:'center',cols:P,from:true,opts:{n:o.repeat?0:1},hold:o.repeat?80:300}];
  if(st==='fist')return [{fx:'pixelFist',at:'center',cols:P,from:true,hold:260}];
  if(st==='loop')return [{fx:'pixelBolt',at:'center',cols:P,from:true,opts:{loop:true},hold:300}];
  if(st==='dash')return [{fx:'pixelBolt',at:'center',cols:P,from:true,opts:{low:true,fast:true},hold:140}];
  return [{fx:'pixelBolt',at:'center',cols:P,from:true,opts:{},hold:170}];}
 if(h==='lyney'){const M=K.magic;
  if(ult)return [{fx:'magicPop',at:'center',cols:M,opts:{big:true},hold:300,delay:late?80*o.index:0}];
  if(st==='arrow')return [{fx:'propArrow',at:'center',cols:M,from:true,hold:190}];
  if(st==='cane')return [{fx:'magicPop',at:'center',cols:M,opts:{cane:true},hold:200}];
  if(st==='curtain')return [{fx:'cardRain',at:'center',cols:M,hold:380,delay:late?70*o.index:0}];
  if(st==='show')return [{fx:'magicPop',at:'center',cols:M,opts:{show:true},hold:240,delay:late?90*o.index:0}];
  return [{fx:'magicPop',at:'center',cols:M,opts:{},hold:200}];}
 if(h==='cyno'&&!ult){if(st==='thrust')return [{fx:'judgeThrust',at:'center',cols:K.judge,from:true,hold:110}];
  return [{fx:'clawSwing',at:'center',cols:K.judge,hold:150}];}
 return null;
}

// ---------- 그리기 도구 ----------
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),out3=t=>1-Math.pow(1-clamp(t),3),out5=t=>1-Math.pow(1-clamp(t),5),in2=t=>clamp(t)*clamp(t),bell=t=>Math.sin(Math.PI*clamp(t)),sm=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
const hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const hexRgb=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const rgba=(h,a)=>{const [r,g,b]=hexRgb(h);return `rgba(${r},${g},${b},${clamp(a)})`;};

/** 셀 연기 덩이: 동그라미 셋을 겹친 납작한 구름 */
function celPuff(c,x,y,r,col,rim,alpha){if(r<=0||alpha<=0)return;c.save();c.globalCompositeOperation='source-over';c.globalAlpha=clamp(alpha);c.fillStyle=col;c.beginPath();for(const [dx,dy,k] of [[0,0,1],[-.6,.18,.7],[.62,.2,.66],[.15,-.45,.6]])c.moveTo(x+dx*r+k*r,y+dy*r),c.arc(x+dx*r,y+dy*r,k*r,0,TAU);c.fill();if(rim){c.globalCompositeOperation='lighter';c.globalAlpha=clamp(alpha*.5);c.strokeStyle=rim;c.lineWidth=Math.max(1,r*.08);c.stroke();}c.restore();}
/** 픽셀 네모: 4px 격자에 붙여 칠한다 (부드럽게 만들지 않음) */
function px(c,x,y,size,col,a,q){if(a<=0||size<=.5)return;const g=q||4,S=Math.max(g,Math.round(size/g)*g);c.globalAlpha=clamp(a);c.fillStyle=col;c.fillRect(Math.round(x/g)*g-S/2,Math.round(y/g)*g-S/2,S,S);}
function vignette(c,a,col='#04020a'){if(a<=0)return;c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';const W=c.canvas.width,H=c.canvas.height,g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,rgba(col,0));g.addColorStop(1,rgba(col,a));c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();}
/** 얼음 결정 한 자루: 길쭉한 마름모(가운데 흰 심지), 끝이 바깥을 향한다 */
function crystal(c,x,y,ang,len,wid,cols,a){if(a<=0||len<=1)return;c.save();c.translate(x,y);c.rotate(ang);c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a*.35);c.fillStyle=cols.deep;c.beginPath();c.moveTo(len*1.08,0);c.lineTo(len*.25,-wid*1.5);c.lineTo(-len*.2,0);c.lineTo(len*.25,wid*1.5);c.closePath();c.fill();
 c.globalAlpha=clamp(a);c.fillStyle=cols.main;c.beginPath();c.moveTo(len,0);c.lineTo(len*.22,-wid);c.lineTo(-len*.12,0);c.lineTo(len*.22,wid);c.closePath();c.fill();c.fillStyle=cols.core;c.beginPath();c.moveTo(len*.92,0);c.lineTo(len*.24,-wid*.35);c.lineTo(0,0);c.lineTo(len*.24,wid*.18);c.closePath();c.fill();c.restore();}
/** 별자리: 땅 위 점 몇 개를 가는 선으로 잇는다 (로엔 영상) */
function constellation(c,x,y,r,cols,a,seed,u){if(a<=0)return;const n=5,pts=[];for(let i=0;i<n;i++){const ang=hash(i,seed)*TAU,d=r*(.35+.65*hash(i+7,seed));pts.push([x+Math.cos(ang)*d,y+Math.sin(ang)*d*.28]);}
 c.save();c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a*.75);c.strokeStyle=cols.main;c.lineWidth=1.2*u;c.beginPath();pts.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();c.restore();for(const [px2,py2] of pts)spikeStar(c,px2,py2,7*u,{alpha:a,cols,rot:.2,seed:3,thick:.18,glow:1.6});}
/** 금빛 새: 몸통 빛점 + 펄럭이는 초승달 날개 둘 + 꼬리 (일루가 영상 첫 장면) */
function bird(c,x,y,dir,size,cols,a,flap){if(a<=0)return;c.save();c.translate(x,y);c.scale(dir,1);const w=size,lift=Math.sin(flap);
 // 먼 날개(아래, 흐리게) → 꼬리 → 몸 → 가까운 날개(위, 크게). 날개는 뒤로 휜 초승달 획.
 brushStroke(c,quadPoints(w*.05,w*.02,-w*.3,w*(.25-lift*.25),-w*.75,w*(.1-lift*.45),14),{w:w*.2,alpha:a*.55,cols,tail:'soft',head:'sharp',belly:.3,glow:1.6});
 for(const d of [-1,1])brushStroke(c,[[-w*.2,0],[-w*1.25,w*.16*d+w*.05]],{w:w*.13,alpha:a*.8,cols,tail:'soft',head:'sharp',belly:.25,glow:1.6});
 brushStroke(c,[[-w*.35,w*.02],[w*.45,-w*.06]],{w:w*.26,alpha:a,cols,tail:'soft',head:'sharp',belly:.35,glow:2.2});
 brushStroke(c,quadPoints(w*.1,-w*.04,-w*.15,-w*(.55+lift*.35),-w*.95,-w*(.55+lift*.55),16),{w:w*.3,alpha:a,cols,tail:'soft',head:'sharp',belly:.28,glow:2.4});
 c.globalCompositeOperation='lighter';c.globalAlpha=a;c.fillStyle='#ffffff';c.beginPath();c.arc(w*.38,-w*.07,w*.05,0,TAU);c.fill();c.restore();}
const confettiPaint=(c,p,a,sz,col)=>{c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(1,Math.cos(p.age*p.flip+p.rot));c.globalCompositeOperation='source-over';c.globalAlpha=clamp(a);c.fillStyle=col;c.fillRect(-sz*.5,-sz*.32,sz,sz*.64);c.restore();};
const cardPaint=(c,p,a,sz,col)=>{c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.scale(Math.cos(p.age*p.flip+p.rot),1);c.globalCompositeOperation='source-over';c.globalAlpha=clamp(a);c.fillStyle='#fff6ee';c.fillRect(-sz*.36,-sz*.5,sz*.72,sz);c.fillStyle=col;c.fillRect(-sz*.26,-sz*.4,sz*.52,sz*.8);c.restore();};
const pixelPaint=(c,p,a,sz,col)=>{c.globalCompositeOperation='lighter';px(c,p.x,p.y,sz,col,a,4);};

const i0=a=>Math.floor(Math.abs(a)*7)%9+1;
export function castFX(H){const {Particle,burst,motes,flash,ring,arcTrail,streak,drawGlint,rays}=H;
 const P=o=>new Particle(o);
 const shards=(sys,x,y,cols,R,n,sp,s,dir=0,spread=TAU)=>burst(sys,x,y,cols,R,{n,speed:sp*s,size:7*s,shard:true,dir,spread});
 return {
 // ===== 로엔 =====
 // 창 찌르기(근거리): 창끝이 꽂히는 긴 획 → 가시 별 → 바깥으로 튀는 얼음 결정 다섯과 땅의 별자리
 iceStab(cols,{from}){let hit=false;const T=.08;return {dur:.85,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;burst(sys,0,0,cols,R,{n:14,speed:520*s,size:5*s,spread:1.4,dir:0});shards(sys,0,0,cols,R,8,320,s,0,2.4);}},
  draw(c,t,s){const sx=from?Math.max(-200*s,from.x*.6):-200*s,k=out5(t/T),tail=in2((t-.05)/.28);
   if(t<.34){brushStroke(c,[[sx+(0-sx)*tail*.85,4*s],[sx+(14*s-sx)*k,0]],{w:9*s*(1-tail*.6),alpha:1-tail,cols,tail:'soft',head:'sharp',belly:.8,glow:2.2});}
   if(t>=T){const u=t-T;flash(c,0,0,64*s,cols.main,1-u/.22);spikeStar(c,0,0,96*s*(1-u/.3),{alpha:1-u/.3,cols,rot:.12,seed:5,thick:.13,extra:3});
    for(let i=0;i<5;i++){const a=-.9+i*.45+hash(i,4)*.2,g=out3(u/.12)*(1-sm(.25,.5,u));crystal(c,Math.cos(a)*18*s,Math.sin(a)*18*s,a,(38+hash(i,9)*26)*s*g,6*s,cols,g);}
    constellation(c,0,46*s,80*s,cols,(1-sm(.2,.6,u))*sm(0,.1,u),11,s);}}};},
 // 얼음 화살(원거리): 로엔 쪽에서 날아와 대상을 꿰뚫고 뒤로 빠진다
 iceArrow(cols,{from}){const T=.17;let hit=false;const f=from||{x:-420,y:-20};return {dur:.8,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;burst(sys,0,0,cols,R,{n:12,speed:460*s,size:5*s,spread:1.2,dir:0});shards(sys,0,0,cols,R,6,260,s,0,1.6);}},
  draw(c,t,s){const k=out3(t/T),x=f.x*(1-k),y=f.y*(1-k)-Math.sin(Math.PI*k)*24*s,ang=Math.atan2(-f.y,-f.x);
   if(t<T+.02){streak(c,x-Math.cos(ang)*130*s,y-Math.sin(ang)*130*s,x,y,4*s,cols,1);crystal(c,x-Math.cos(ang)*16*s,y-Math.sin(ang)*16*s,ang,30*s,5*s,cols,1);}
   if(t>=T){const u=t-T;flash(c,0,0,58*s,cols.main,1-u/.2);const L=out5(u/.1)*260*s;brushStroke(c,[[0,0],[Math.cos(ang)*L,Math.sin(ang)*L]],{w:7*s*(1-u/.35),alpha:1-u/.35,cols,tail:'sharp',head:'soft',belly:.25,glow:2});
    ring(c,0,0,10*s+60*s*out3(u/.3),6*s,cols.core,1-u/.3,.42);ring(c,0,0,8*s+40*s*out3(u/.25),5*s,cols.main,1-u/.25,1.8);}}};},
 // 단검 베기(근거리): 빠르게 엇갈리는 두 획(X) + 교차점 가시 별
 daggerX(cols){let n=0;const at=[.02,.1];return {dur:.7,spawn(sys,t,R,s){while(n<2&&t>=at[n]+.06){burst(sys,0,0,cols,R,{n:10,speed:440*s,size:5*s});shards(sys,0,0,cols,R,4,260,s);n++;}},
  draw(c,t,s){at.forEach((t0,i)=>{const u=(t-t0)/.08;if(u<0)return;const d=i?1:-1,len=110*s,head=out5(u),fade=1-sm(1.2,4,u);if(fade<=0)return;const x0=-len*.55,y0=-len*.5*d,x1=len*.55,y1=len*.5*d;
    brushStroke(c,[[x0,y0],[x0+(x1-x0)*head,y0+(y1-y0)*head]],{w:10*s*fade,alpha:fade,cols,tail:'soft',head:'sharp',belly:.6,glow:2.2});});
   const u=t-.16;if(u>=0){spikeStar(c,0,0,80*s*(1-u/.3),{alpha:1-u/.3,cols,rot:.78,seed:8,thick:.12});flash(c,0,0,50*s,cols.main,1-u/.2);}}};},
 // 로엔 필살기: 어둠 → 주변에 얼음 결정 여덟이 날아와 꽂힘 → 두 창이 대각으로 가로지름 → 결정이 한꺼번에 터지며 별 모양으로 뻗음
 lohenUlt(cols){const N=8,LAND=.42,CROSS=.5,BOOM=.64;let boomed=false,landed=0;const ang=i=>-Math.PI/2+i/N*TAU+(hash(i,3)-.5)*.3;
  return {dur:1.7,spawn(sys,t,R,s){while(landed<N&&t>=.1+landed*(LAND-.1)/N+.12){const a=ang(landed),r=(78+hash(landed,5)*26)*s;burst(sys,Math.cos(a)*r,Math.sin(a)*r*.62,cols,R,{n:4,speed:180*s,size:4*s});landed++;}
    if(!boomed&&t>=BOOM){boomed=true;burst(sys,0,0,cols,R,{n:30,speed:760*s,size:7*s});shards(sys,0,0,cols,R,20,520,s);motes(sys,0,0,{...cols,main:'#dff6ff'},R,{n:10,r:60*s,rise:40*s,life:1.1,size:22*s,kind:'smoke'});
     for(let i=0;i<N;i++){const a=ang(i),r=(78+hash(i,5)*26)*s;shards(sys,Math.cos(a)*r,Math.sin(a)*r*.62,cols,R,3,300,s,a,1);}}},
   draw(c,t,s){vignette(c,.55*sm(0,.12,t)*(1-sm(BOOM+.15,1.3,t)));
    // ① 결정이 바깥에서 날아와 꽂힌다
    for(let i=0;i<N;i++){const t0=.1+i*(LAND-.1)/N,u=(t-t0)/.12,a=ang(i),r=(78+hash(i,5)*26)*s,len=(52+hash(i,6)*30)*s;if(u<0)continue;
     const k=out3(u),rr=r+(1-k)*260*s,x=Math.cos(a)*rr,y=Math.sin(a)*rr*.62,gone=t>=BOOM?1-sm(BOOM,BOOM+.06,t):1;
     if(u<1)brushStroke(c,[[Math.cos(a)*(rr+90*s),Math.sin(a)*(rr+90*s)*.62],[x,y]],{w:5*s,alpha:.8,cols,tail:'soft',head:'sharp',belly:.8,glow:1.8});
     crystal(c,x,y,a,len,8*s,cols,gone);if(u>=1&&u<1.8)drawGlint(c,x,y,26*s*(1.8-u),cols.main,a);}
    // ② 두 창이 대각선으로 가로지른다
    for(const [d,t0] of [[1,CROSS],[-1,CROSS+.05]]){const u=(t-t0)/.1;if(u<0||u>2.2)continue;const L=480*s,k=out5(u),fade=1-sm(1,2.2,u),x0=-L*d,y0=-L*.45;
     brushStroke(c,[[x0,y0],[x0+(L*2*d)*k,y0+L*.9*k]],{w:9*s*fade,alpha:fade,cols,tail:'soft',head:'sharp',belly:.7,glow:2.4});}
    // ③ 폭발: 별 모양으로 뻗는 얼음 칼날, 분홍빛 섬광 고리
    if(t>=BOOM){const u=t-BOOM,g=out5(u/.12)*(1-sm(.35,.75,u));
     flash(c,0,0,160*s,cols.main,1-u/.3);flash(c,0,0,70*s,cols.core,1-u/.14);flash(c,0,0,120*s,cols.accent,.5*(1-u/.22));
     for(let i=0;i<14;i++){const a=i/14*TAU+hash(i,21)*.3,L=(110+hash(i,22)*130)*s*g;crystal(c,Math.cos(a)*14*s,Math.sin(a)*14*s*.7,a,L,(7+hash(i,23)*5)*s,cols,g);}
     spikeStar(c,0,0,220*s*(1-u/.4),{alpha:1-u/.4,cols,rot:.1,seed:6,thick:.1,extra:5});
     ring(c,0,0,30*s+260*s*out3(u/.5),14*s,cols.accent,(1-u/.5)*.7,.45);ring(c,0,0,20*s+200*s*out3(u/.45),10*s,cols.core,1-u/.45,.45);
     constellation(c,0,60*s,150*s,cols,(1-sm(.4,1,u)),17,s);}}};},

 // ===== 일루가 =====
 // 보호막 카드: 일루가 몸에서만 등불 빛이 크게 열린다
 lanternFlare(cols){return {dur:.8,spawn(sys,t,R,s){if(!this.s&&t>.02){this.s=1;motes(sys,0,-10*s,cols,R,{n:14,r:40*s,rise:110*s,life:.8,size:5*s,kind:'glint'});}},
  draw(c,t,s){const o=out5(t/.12),f=1-sm(.25,.8,t);flash(c,0,-14*s,150*s,cols.deep,.4*o*f);flash(c,0,-14*s,90*s,cols.main,.7*o*f);flash(c,0,-14*s,40*s,cols.core,o*f);
   rays(c,0,-14*s,170*s*o,14,cols.main,.55*f,t*.5,.06);spikeStar(c,0,-14*s,110*s*o*(1-sm(.2,.6,t)),{alpha:f,cols,rot:.05,seed:2,thick:.11,extra:4});
   const ph=out3(t/.3);brushStroke(c,[[0,40*s],[0,40*s-260*s*ph]],{w:26*s*f,alpha:.5*f,cols,tail:'soft',head:'soft',belly:.4,glow:2,core:.4});}};},
 // 보호막이 둘러진다: 금빛 둥근 막 + 막 위를 도는 초승달 + 오르는 금가루. big: 빛줄기가 더해진다. mirror(되비추는 빛): 거울 조각이 돈다
 goldDome(cols,{big=false,mirror=false}){return {dur:1.3,spawn(sys,t,R,s){if(!this.s&&t>.06){this.s=1;motes(sys,0,0,cols,R,{n:big?18:12,r:58*s,rise:60*s,life:1,size:4*s,kind:'glint'});}},
  draw(c,t,s){const o=out3(t/.22),f=1-sm(.75,1.3,t),r=48*s*(.8+.2*o)*(big?1.12:1);c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(0,-r*.2,r*.1,0,0,r);g.addColorStop(0,rgba(cols.core,.04*f));g.addColorStop(.75,rgba(cols.main,.14*f*o));g.addColorStop(1,rgba(cols.main,.45*f*o));c.fillStyle=g;c.beginPath();c.ellipse(0,0,r*.92,r*1.08,0,0,TAU);c.fill();c.restore();
   brushRing(c,0,0,r*.95,1.15,{w:6*s*o,alpha:.9*f,cols,pieces:4,front:Math.PI/2,seed:7,gap:.18,glow:2.2,rot:t*.4});
   for(let i=0;i<2;i++){const a=t*3.2+i*Math.PI;crescent(c,0,0,r*.98,r*1.12,a,a+1.3,{w:4.5*s,alpha:.9*f*o,cols,glow:1.8});}
   if(mirror)for(let i=0;i<6;i++){const a=t*1.6+i/6*TAU,x=Math.cos(a)*r*1.15,y=Math.sin(a)*r*.5;spikeStar(c,x,y,14*s,{alpha:f*o*(.5+.5*Math.sin(a)),cols,rot:a,seed:i,thick:.2,glow:1.6});}
   if(big)rays(c,0,-r*.2,r*2,10,cols.main,.35*f*o,t*.4,.05);
   if(t<.35)ring(c,0,r*.85,r*.4+r*1.1*out3(t/.35),7*s,cols.main,(1-t/.35),.3);}}},
 // 금빛 새: 일루가에게서 날아올라 파티 위를 가로지른다
 goldBird(cols,{from}){const f=from||{x:-200,y:0};return {dur:1.1,spawn(sys,t,R,s){const k=clamp(t/.8);if(k<1&&R()<.9){const x=f.x*(1-out3(k)),y=f.y*(1-out3(k))-Math.sin(Math.PI*k)*120*s;sys.add(P({x,y,vx:(R()-.5)*30*s,vy:20*s,drag:2,life:.5+R()*.4,size:(3+R()*4)*s,color:R()<.5?cols.core:cols.main,kind:R()<.3?'glint':'glow',rot:R()}));}},
  draw(c,t,s){const k=clamp(t/.8),e=out3(k),x=f.x*(1-e),y=f.y*(1-e)-Math.sin(Math.PI*k)*120*s,dir=f.x<0?1:-1,a=(1-sm(.75,1.05,t))*sm(0,.06,t);
   const tail=[];for(let i=8;i>=0;i--){const kk=Math.max(0,k-i*.025),ee=out3(kk);tail.push([f.x*(1-ee),f.y*(1-ee)-Math.sin(Math.PI*kk)*120*s]);}
   brushStroke(c,tail,{w:10*s,alpha:a*.7,cols,tail:'soft',head:'sharp',belly:.85,glow:2});H.flash(c,x,y,60*s,cols.main,.45*a);bird(c,x,y,dir,62*s,cols,a,t*20);if(t>.78){const u=t-.78;spikeStar(c,0,0,70*s*(1-u/.25),{alpha:1-u/.25,cols,rot:.3,seed:9,thick:.12});}}};},
 // 되비추는 빛 · 필살기: 금빛 초승달이 대상을 감싸 돈다 (일루가 영상 5초)
 moonSweep(cols,{big=false}){let hit=false;return {dur:big?1.1:.8,spawn(sys,t,R,s){if(!hit&&t>=.14){hit=true;burst(sys,0,0,cols,R,{n:big?26:14,speed:(big?620:460)*s,size:6*s});motes(sys,0,0,cols,R,{n:8,r:60*s,rise:50*s,life:.9,size:5*s,kind:'glint'});}},
  draw(c,t,s){const S=s*(big?1.45:1),fade=1-sm(.3,big?.9:.7,t);for(let i=0;i<(big?3:2);i++){const a0=-2.6+i*2.1+out3(t/.3)*2.4,r=(70+i*16)*S;crescent(c,0,0,r,r*.62,a0,a0+2.2*out3(t/.16),{w:(15-i*3)*S*fade,alpha:fade,cols,glow:2.4});}
   if(t>=.14){const u=t-.14;flash(c,0,0,80*S,cols.main,1-u/.25);spikeStar(c,0,0,110*S*(1-u/.35),{alpha:1-u/.35,cols,rot:-.2,seed:4,thick:.11,extra:big?5:2});ring(c,0,0,20*S+120*S*out3(u/.45),9*S,cols.core,1-u/.45,.45);if(big)rays(c,0,0,240*S*out3(u/.2),16,cols.main,.5*(1-u/.6),u*.3,.05);}}};},

 // ===== 야호다 =====
 // 필살기(행동력 보충): 몸에 분홍-붉은 기운이 일렁이고 청록 구슬 셋이 몸을 돈다 (야호다 영상 2)
 jahodaAura(cols){const T=cols.teal;return {dur:1.8,spawn(sys,t,R,s){if(t<1.3&&R()<.7){const a=R()*TAU,d=(20+R()*26)*s;sys.add(P({x:Math.cos(a)*d,y:30*s-R()*90*s,vx:(R()-.5)*20*s,vy:-(60+R()*80)*s,drag:1.5,life:.5+R()*.4,size:(4+R()*5)*s,color:R()<.5?cols.main:cols.deep,kind:'glow'}));}
   if(!this.s&&t>.05){this.s=1;burst(sys,0,0,{...cols,spark:T},R,{n:16,speed:380*s,size:5*s});}},
  draw(c,t,s){const o=out3(t/.2),f=1-sm(1.25,1.8,t),fl=.75+.25*Math.sin(t*31);flash(c,0,-10*s,90*s,cols.deep,.35*o*f*fl);flash(c,0,-10*s,55*s,cols.main,.4*o*f);
   for(let i=0;i<9;i++){const x0=(i-4)*9*s,len=(100+40*Math.sin(t*13+i*2.3)-Math.abs(i-4)*12)*s*o*f,lean=Math.sin(t*7+i)*12*s;brushStroke(c,quadPoints(x0,46*s,x0*1.4+lean,46*s-len*.5,x0*.6+lean*1.6,46*s-len,12),{w:(16-Math.abs(i-4)*1.5)*s,alpha:.32*f*(i%2?1:.8),cols:i%3?cols:{core:'#ffd0d8',main:'#ff4a6a',deep:'#a01030'},tail:'soft',head:'soft',belly:.35,glow:1.8,core:.3});}
   const orbs=[];for(let i=0;i<3;i++){const a=t*4.2+i/3*TAU,x=Math.cos(a)*72*s,y=-14*s+Math.sin(a)*22*s+Math.sin(t*3+i)*12*s;orbs.push([a,x,y]);}
   for(const [a,x,y] of orbs.sort((p,q)=>Math.sin(p[0])-Math.sin(q[0]))){const depth=.55+.45*Math.sin(a);const trail=[];for(let k=6;k>=0;k--){const aa=a-k*.12;trail.push([Math.cos(aa)*72*s,-14*s+Math.sin(aa)*22*s+Math.sin((t-k*.03)*3)*12*s]);}
    brushStroke(c,trail,{w:11*s,alpha:.8*f*o*depth,cols:{core:'#ffffff',main:T,deep:'#0f8f86'},tail:'soft',head:'soft',belly:.85,glow:2});flash(c,x,y,34*s,T,.95*f*o*depth);flash(c,x,y,13*s,'#ffffff',f*o*depth);spikeStar(c,x,y,20*s*depth,{alpha:f*o*depth,cols:{core:'#fff',main:T,deep:'#0f8f86'},rot:a,seed:i0(a),thick:.2,glow:1.4});}
   brushRing(c,0,44*s,70*s*(.6+.4*o),.28,{w:6*s,alpha:.8*f,cols:{core:'#ffffff',main:T,deep:'#0f8f86'},pieces:3,front:Math.PI/2,seed:2,gap:.4,rot:t*.8});
   if(t<.2)spikeStar(c,0,-20*s,90*s*bell(t/.2),{alpha:1,cols,rot:.3,seed:3,thick:.12});}}},
 // 태엽(행동력 +1): 발밑에 톱니 고리가 돌고 째깍이는 반짝임. big(행동 지원 +2): 두 겹 톱니 + 청록 물결이 몸을 감는다
 clockwork(cols,{big=false}){return {dur:1.1,spawn(sys,t,R,s){if(!this.s){this.s=1;burst(sys,0,-40*s,cols,R,{n:big?14:8,speed:300*s,size:4*s,up:120*s});}},
  draw(c,t,s){const o=out3(t/.18),f=1-sm(.6,1.1,t);const gear=(r,teeth,rot,w)=>{brushRing(c,0,0,r,.32,{w,alpha:.85*f*o,cols,pieces:4,front:Math.PI/2,seed:teeth,gap:.12,rot:0});for(let i=0;i<teeth;i++){const a=rot+i/teeth*TAU;brushStroke(c,[[Math.cos(a)*r,Math.sin(a)*r*.32],[Math.cos(a)*(r+9*s),Math.sin(a)*(r+9*s)*.32]],{w:5*s,alpha:.8*f*o,cols,belly:.5,glow:1.4});}};
   gear(58*s,12,t*2.4,5*s);if(big){gear(84*s,16,-t*1.8,4*s);for(let i=0;i<2;i++){const a0=t*5+i*Math.PI;crescent(c,0,-50*s,62*s,28*s,a0,a0+2.4,{w:7*s*f,alpha:.8*f,cols,glow:2});}}
   const tick=Math.floor(t*8);if(tick%2===0)spikeStar(c,Math.cos(tick)*50*s,-30*s-hash(tick,2)*60*s,16*s,{alpha:f,cols:{core:'#fff',main:'#ff7ab8',deep:'#c7266f'},rot:tick,seed:tick,thick:.2});}}},
 // 예비 동력: 분홍 고리가 천천히 떠오르고 빛 구슬이 몸에 스며든다
 reservePulse(cols){return {dur:1.2,spawn(sys,t,R,s){if(!this.s){this.s=1;for(let i=0;i<8;i++){const a=i/8*TAU;sys.add(P({x:Math.cos(a)*70*s,y:Math.sin(a)*24*s+20*s,vx:-Math.cos(a)*80*s,vy:-Math.sin(a)*30*s-40*s,drag:1.4,life:.9,size:6*s,color:i%2?cols.main:cols.spark,kind:'glow'}));}}},
  draw(c,t,s){const f=1-sm(.7,1.2,t);for(let i=0;i<3;i++){const k=clamp((t-i*.14)/.7);brushRing(c,0,40*s-k*110*s,(40+20*k)*s,.3,{w:5*s*(1-k),alpha:f*(1-k),cols,pieces:3,front:Math.PI/2,seed:i+4,gap:.3});}flash(c,0,-10*s,50*s,cols.main,.35*bell(t/1.1));}}},
 // 재정비(뽑고 버림): 카드 모양 마름모가 몸을 휘감아 돈다
 cardSwirl(cols){return {dur:1,spawn(){},draw(c,t,s){const f=1-sm(.6,1,t);for(let i=0;i<5;i++){const a=t*6+i/5*TAU,x=Math.cos(a)*50*s,y=-20*s+Math.sin(a)*20*s-t*30*s,sz=12*s*(.6+.4*Math.sin(a));c.save();c.translate(x,y);c.rotate(a*.5);c.globalCompositeOperation='lighter';c.globalAlpha=f*.9;c.fillStyle=i%2?cols.main:'#ff7ab8';c.fillRect(-sz*.35,-sz*.5,sz*.7,sz);c.restore();}flash(c,0,-20*s,46*s,cols.main,.3*bell(t));}}},
 // 독 묻은 다트(원거리): 작고 빠른 다트 → 꽂힌 자리에 균열 표시와 포자
 dart(cols,{from}){const T=.15,f=from||{x:-380,y:-30},TL=cols.teal;let hit=false;return {dur:.75,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;burst(sys,0,0,{...cols,spark:TL},R,{n:10,speed:360*s,size:4*s});motes(sys,0,0,{...cols,main:TL,core:'#d6fff9'},R,{n:6,r:14*s,rise:30*s,life:.7,size:14*s,kind:'smoke'});}},
  draw(c,t,s){const k=out3(t/T),x=f.x*(1-k),y=f.y*(1-k)-Math.sin(Math.PI*k)*20*s,ang=Math.atan2(-f.y,-f.x);if(t<T+.01){brushStroke(c,[[x-Math.cos(ang)*90*s,y-Math.sin(ang)*90*s],[x,y]],{w:4*s,alpha:.9,cols,tail:'soft',head:'sharp',belly:.8,glow:1.8});brushStroke(c,[[x-Math.cos(ang)*14*s,y-Math.sin(ang)*14*s],[x+Math.cos(ang)*8*s,y+Math.sin(ang)*8*s]],{w:5*s,alpha:1,cols:{core:'#fff',main:TL,deep:'#0f8f86'},head:'sharp',tail:'sharp',glow:1.6});}
   if(t>=T){const u=t-T;spikeStar(c,0,0,60*s*(1-u/.3),{alpha:1-u/.3,cols:{core:'#fff',main:TL,deep:'#0f8f86'},rot:.78,seed:2,thick:.14});for(const d of [-1,1])brushStroke(c,[[-20*s,-20*s*d],[20*s,20*s*d]],{w:4*s,alpha:(1-sm(.2,.6,u)),cols,belly:.5,glow:1.6});}}};},

 // ===== 두린: toon-fire.js (밀도 문턱 셀 불꽃) =====
 // ===== 키니치 (픽셀) =====
 // 픽셀 탄: 네모가 이어진 화살 머리가 날아가고, 지나간 자리에 네모가 남는다. loop: 고리를 그리며 돌아 들어간다, low/fast: 낮고 빠르게
 pixelBolt(cols,{from,loop=false,low=false,fast=false}){const T=fast?.12:loop?.3:.17,f=from||{x:-380,y:-20};let hit=false;
  const pos=k=>{let x=f.x*(1-k),y=(low?f.y+30:f.y)*(1-k);if(loop){const a=k*TAU;x+=Math.sin(a)*60*(1-k);y+=-Math.cos(a)*60*(1-k)+60*(1-k)-Math.sin(Math.PI*k)*40;}else y-=Math.sin(Math.PI*k)*(low?0:26);return [x,y];};
  return {dur:.8,spawn(sys,t,R,s){const k=clamp(t/T);if(k<1){const [x,y]=pos(out3(k)).map(v=>v*s/s);for(let i=0;i<2;i++)sys.add(P({x:x*1,y:y*1,vx:(R()-.5)*40*s,vy:(R()-.5)*40*s,drag:3,life:.25+R()*.25,size:(4+R()*4)*s,size1:4*s,color:R()<.5?cols.main:cols.spark,paint:pixelPaint}));}
    if(!hit&&t>=T){hit=true;for(let i=0;i<18;i++){const a=Math.floor(R()*8)/8*TAU,v=(160+R()*280)*s;sys.add(P({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:4,life:.35+R()*.3,size:(5+R()*6)*s,size1:4*s,color:R()<.4?cols.core:R()<.7?cols.main:cols.spark,paint:pixelPaint}));}}},
   draw(c,t,s){const k=clamp(t/T);c.save();c.globalCompositeOperation='lighter';
    if(k<1){const e=out3(k),[x,y]=pos(e),[x0,y0]=pos(Math.max(0,e-.05)),ang=Math.atan2(y-y0,x-x0),q=4;for(let i=0;i<5;i++){const d=i*7*s;px(c,x-Math.cos(ang)*d,y-Math.sin(ang)*d,(12-i*2)*s,i<2?cols.core:cols.main,1-i*.15,q);}
     for(const side of [-1,1])px(c,x-Math.cos(ang)*8*s+Math.sin(ang)*side*8*s,y-Math.sin(ang)*8*s-Math.cos(ang)*side*8*s,6*s,cols.main,1,q);H.flash(c,x,y,26*s,cols.main,.5);}
    if(t>=T){const u=t-T,g=1-sm(.15,.4,u),r=out3(u/.2)*46*s;for(let i=-4;i<=4;i++){px(c,i*8*s*(r/46/s),0,(i===0?14:8)*s,i===0?cols.core:cols.main,g);px(c,0,i*8*s*(r/46/s),(i===0?14:8)*s,i===0?cols.core:cols.main,g);}
     const d=out3(u/.3)*60*s;for(let i=0;i<12;i++){const a=i/12*TAU;px(c,Math.round(Math.cos(a)*d/8)*8,Math.round(Math.sin(a)*d/8)*8,6*s,cols.spark,(1-u/.35));}H.flash(c,0,0,60*s,cols.main,.6*(1-u/.25));}
    c.restore();}};},
 // 비늘 포격(분쇄): 굵은 네모 빛줄기가 대상까지 뻗고, 큰 십자 네모 폭발
 pixelBeam(cols,{from,n=1}){const f=from||{x:-380,y:-20},T=.12;let hit=false;return {dur:n?1:.5,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;for(let i=0;i<(n?26:8);i++){const a=Math.floor(R()*8)/8*TAU,v=(200+R()*320)*s;sys.add(P({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3.5,life:.4+R()*.35,size:(6+R()*8)*s,size1:4*s,color:R()<.4?cols.core:R()<.7?cols.main:cols.spark,paint:pixelPaint}));}}},
  draw(c,t,s){c.save();c.globalCompositeOperation='lighter';const L=Math.hypot(f.x,f.y),ang=Math.atan2(-f.y,-f.x),reach=out5(t/T),fade=1-sm(.25,.55,t);
   if(n&&fade>0){const W=(22+6*Math.sin(t*60))*s*fade;for(let d=0;d<L*reach;d+=8*s){const x=f.x+Math.cos(ang)*d,y=f.y+Math.sin(ang)*d;px(c,x,y,W,cols.main,.55*fade,8);px(c,x,y,W*.45,cols.core,fade,4);}}
   if(t>=T){const u=t-T,g=1-sm(.2,.5,u),r=out3(u/.18)*(n?90:40)*s;for(let i=-5;i<=5;i++){const sz=(i===0?22:12)*s;px(c,i*r/5,0,sz,i===0?cols.core:cols.main,g,8);px(c,0,i*r/5,sz,i===0?cols.core:cols.main,g,8);}
    for(const [a,b] of [[1,1],[1,-1],[-1,1],[-1,-1]])px(c,a*r*.5,b*r*.5,10*s,cols.spark,g,8);H.flash(c,0,0,(n?120:60)*s,cols.main,.6*(1-u/.3));}
   c.restore();}}},
 // 맹렬한 주먹(분쇄): 큰 네모 덩어리가 날아가 부딪치고, 네모 고리가 퍼진다
 pixelFist(cols,{from}){const f=from||{x:-380,y:-20},T=.16;let hit=false;return {dur:.9,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;for(let i=0;i<22;i++){const a=Math.floor(R()*8)/8*TAU,v=(220+R()*300)*s;sys.add(P({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3.5,life:.4+R()*.3,size:(6+R()*8)*s,size1:4*s,color:R()<.5?cols.main:cols.spark,paint:pixelPaint}));}}},
  draw(c,t,s){c.save();c.globalCompositeOperation='lighter';if(t<T){const k=in2(t/T),x=f.x*(1-k),y=f.y*(1-k);for(let gx=-2;gx<=2;gx++)for(let gy=-2;gy<=2;gy++){if(Math.abs(gx)+Math.abs(gy)>3)continue;px(c,x+gx*9*s,y+gy*9*s,9*s,(gx+gy)%2?cols.main:cols.core,1,4);}H.flash(c,x,y,50*s,cols.main,.6);}
   if(t>=T){const u=t-T,d=out3(u/.3)*90*s,g=1-sm(.2,.5,u);for(let i=0;i<16;i++){const a=i/16*TAU,x=Math.cos(a)*d,y=Math.sin(a)*d*.8;px(c,x,y,10*s,i%2?cols.main:cols.spark,g,8);}
    for(let gx=-3;gx<=3;gx++)for(let gy=-3;gy<=3;gy++)if(Math.abs(gx)+Math.abs(gy)<=3-Math.floor(u*12))px(c,gx*10*s,gy*10*s,10*s,cols.core,g,4);H.flash(c,0,0,110*s,cols.main,.7*(1-u/.3));}
   c.restore();}}},
 // 모드 전환: 키니치 주변에 픽셀 조각이 흩어졌다 모인다 (분쇄면 붉은 눈빛이 섞인다)
 pixelGlitch(cols,{crush=false}){return {dur:.9,spawn(sys,t,R,s){if(!this.s){this.s=1;for(let i=0;i<30;i++){const a=R()*TAU,v=(120+R()*260)*s;sys.add(P({x:(R()-.5)*60*s,y:-40*s+(R()-.5)*120*s,vx:Math.cos(a)*v,vy:Math.sin(a)*v,drag:3.5,life:.35+R()*.4,size:(5+R()*9)*s,size1:4*s,color:crush&&R()<.15?'#ff3a3a':R()<.5?cols.main:cols.deep,paint:pixelPaint}));}}},
  draw(c,t,s){c.save();c.globalCompositeOperation='lighter';const g=1-sm(.3,.8,t);for(let i=0;i<8;i++){const y=-120*s+i*24*s+Math.floor(t*30+i)%3*4*s,w=(60+hash(i,Math.floor(t*20))*80)*s;if(hash(i,Math.floor(t*24))<.5)continue;c.globalAlpha=.35*g;c.fillStyle=i%2?cols.main:cols.deep;c.fillRect(-w/2,y,w,6*s);}c.restore();H.flash(c,0,-40*s,90*s,cols.main,.35*bell(t/.6));}}},

 // ===== 리니 (마술 폭발) =====
 // 펑: 흰 금빛 섬광 별 → 분홍·주황 꽃종이와 카드가 터져 나오고 연기 고리가 퍼진다. cane: 지팡이 원호가 먼저, show: 뒤이어 작은 펑 둘, big: 빛줄기와 큰 꽃종이
 magicPop(cols,{big=false,cane=false,show=false}){const T0=cane?.12:0,S0=big?1.5:show?1.2:1;let n=0;const extra=show||big?[[.22,-70,-40],[.32,64,-24]]:[];return {dur:big?1.5:1.2,spawn(sys,t,R,s){const S=s*S0;
    const pop=(x,y,k)=>{for(let i=0;i<Math.round(22*k);i++){const a=R()*TAU,v=(200+R()*420)*S*k;const col=[cols.pink,cols.main,cols.spark,'#ffffff','#7fe0ff'][Math.floor(R()*5)];sys.add(P({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-140*S,ay:420*S,drag:2.4,life:.7+R()*.6,size:(6+R()*6)*S,size1:5*S,color:col,rot:R()*TAU,vr:(R()-.5)*10,flip:6+R()*10,paint:R()<.25?cardPaint:confettiPaint,blend:'source-over'}));}
     for(let i=0;i<Math.round(6*k);i++){const a=i/6*TAU;sys.add(P({x:x+Math.cos(a)*20*S,y:y+Math.sin(a)*14*S,vx:Math.cos(a)*120*S*k,vy:Math.sin(a)*70*S*k,drag:2.5,life:.8+R()*.4,size:(16+R()*10)*S*k,size1:30*S*k,paint:(c,p,a2,sz)=>celPuff(c,p.x,p.y,sz,'#f6d6e2',null,a2*.55),blend:'source-over'}));}
     burst(sys,x,y,{...cols,spark:cols.spark},R,{n:Math.round(10*k),speed:420*S*k,size:5*S});};
    if(n===0&&t>=T0){n=1;pop(0,0,1);}while(n>0&&n-1<extra.length&&t>=extra[n-1][0]){const [,x,y]=extra[n-1];pop(x*S,y*S,.6);n++;}},
  draw(c,t,s){const S=s*S0;if(cane&&t<.2){const k=out3(t/.12),f=1-sm(.12,.2,t);crescent(c,0,-10*S,70*S,40*S,-2.6,-2.6+3*k,{w:9*S*f,alpha:f,cols,glow:2});}
   const u=t-T0;if(u<0)return;const pop=1-sm(0,.32,u);flash(c,0,0,140*S,cols.spark,.6*pop);flash(c,0,0,60*S,'#ffffff',1-u/.1);
   spikeStar(c,0,0,(130*S)*out5(u/.05)*(1-sm(.05,.3,u)),{alpha:1,cols:{core:'#ffffff',main:cols.spark,deep:cols.main},rot:.1,seed:3,thick:.11,extra:6});
   if(big)rays(c,0,0,300*S*out3(u/.15),18,cols.spark,.55*pop,u*.4,.05);
   brushRing(c,0,0,(30+150*out3(u/.35))*S,.5,{w:9*S*(1-sm(0,.4,u)),alpha:pop,cols:{core:'#ffffff',main:cols.pink,deep:cols.deep},pieces:4,front:Math.PI/2,seed:4,gap:.25});
   for(const [t1,x,y] of extra){const v=t-t1;if(v>=0&&v<.25){flash(c,x*S,y*S,60*S,cols.spark,.8*(1-v/.25));spikeStar(c,x*S,y*S,60*S*(1-v/.25),{alpha:1-v/.25,cols:{core:'#fff',main:cols.pink,deep:cols.deep},rot:.4,seed:7,thick:.12});}}}}},
 // 소품 화살: 붉은 깃 화살이 날아와 꽂히며 작게 펑
 propArrow(cols,{from}){const T=.16,f=from||{x:-380,y:-30};const pop=this.magicPop(cols,{});return {dur:1.3,spawn(sys,t,R,s){if(t>=T)pop.spawn(sys,t-T,R,s*.8);},
  draw(c,t,s){const k=out3(t/T),x=f.x*(1-k),y=f.y*(1-k)-Math.sin(Math.PI*k)*30*s,ang=Math.atan2(-f.y,-f.x);if(t<T+.02){streak(c,x-Math.cos(ang)*120*s,y-Math.sin(ang)*120*s,x,y,4*s,{core:'#fff',main:cols.pink,deep:cols.deep},1);brushStroke(c,[[x-Math.cos(ang)*20*s,y-Math.sin(ang)*20*s],[x+Math.cos(ang)*8*s,y+Math.sin(ang)*8*s]],{w:5*s,alpha:1,cols:{core:'#fff',main:cols.main,deep:cols.deep},glow:1.6});}
   if(t>=T)pop.draw(c,t-T,s*.8);}}},
 // 커튼콜: 카드가 위에서 쏟아지고, 대상 앞에서 한꺼번에 펑
 cardRain(cols){const pop=this.magicPop(cols,{show:true});return {dur:1.6,spawn(sys,t,R,s){if(t<.28&&R()<.9)sys.add(P({x:(R()-.5)*180*s,y:-260*s,vx:(R()-.5)*60*s,vy:(700+R()*200)*s,drag:.5,life:.4,size:(14+R()*6)*s,size1:12*s,color:R()<.5?cols.deep:cols.pink,rot:R()*TAU,vr:(R()-.5)*12,flip:8,paint:cardPaint,blend:'source-over'}));if(t>=.3)pop.spawn(sys,t-.3,R,s);},
  draw(c,t,s){if(t>=.3)pop.draw(c,t-.3,s);}}},

 // ===== 사이노 =====
 // 창 찌르기: 보랏빛 창끝 획 + 곁가지 번개 + 가시 별
 judgeThrust(cols,{from}){let hit=false;const T=.08;return {dur:.75,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;burst(sys,0,0,cols,R,{n:14,speed:520*s,size:5*s,spread:1.3,dir:0});}},
  draw(c,t,s){const sx=from?Math.max(-210*s,from.x*.6):-210*s,k=out5(t/T),tail=in2((t-.05)/.26);if(t<.32)brushStroke(c,[[sx+(0-sx)*tail*.85,0],[sx+(16*s-sx)*k,0]],{w:10*s*(1-tail*.6),alpha:1-tail,cols,tail:'soft',head:'sharp',belly:.85,glow:2.2});
   if(t>=T){const u=t-T,R=H.rnd(40+Math.floor(u*30));for(let j=0;j<3;j++){const a=-.8+j*.8+(R()-.5)*.4,len=(70+R()*50)*s*(1-u/.3);if(len>2)H.bolt(c,H.boltPath(0,0,Math.cos(a)*len,Math.sin(a)*len,R,8,12*s),1.4*s,cols,1-u/.3);}
    spikeStar(c,0,0,100*s*(1-u/.3),{alpha:1-u/.3,cols,rot:0,seed:9,thick:.12,extra:2});flash(c,0,0,60*s,cols.main,1-u/.2);}}};},
 // 검은 발톱 · 휘두르기: 크게 휘두른 초승달 두 줄이 엇갈린다
 clawSwing(cols){let n=0;const at=[.0,.1];return {dur:.8,spawn(sys,t,R,s){while(n<2&&t>=at[n]+.1){burst(sys,0,0,cols,R,{n:10,speed:440*s,size:5*s});n++;}},
  draw(c,t,s){at.forEach((t0,i)=>{const u=t-t0;if(u<0)return;const k=out3(u/.12),f=1-sm(.12,.45,u),a0=i?.6:-2.7,sw=i?-3:3;crescent(c,-10*s,0,96*s,64*s,a0,a0+sw*k,{w:15*s*f,alpha:f,cols,glow:2.4,rot:i?.3:-.2});
    inkStroke(c,arcPoints(-10*s,0,104*s,70*s,a0,a0+sw*k*.9,22,i?.3:-.2),{w:6*s*f,alpha:.6*f,color:'#14061f',head:'sharp',tail:'soft'});});
   const u=t-.1;if(u>=0){flash(c,0,0,70*s,cols.main,1-u/.25);ring(c,0,0,10*s+90*s*out3(u/.35),7*s,cols.core,1-u/.35,.5);}}}},

 // ===== 파트너 =====
 // 네페르: 땅에 초록 삼각 문양이 깔리고, 반투명한 초록 손톱이 솟은 뒤 흰 연기가 터진다
 neferRune(cols){return {dur:1.3,spawn(sys,t,R,s){if(!this.s&&t>=.4){this.s=1;for(let i=0;i<5;i++)sys.add(P({x:(R()-.5)*90*s,y:30*s+(R()-.5)*20*s,vx:(R()-.5)*60*s,vy:-(30+R()*40)*s,drag:1.5,life:.7+R()*.4,size:(16+R()*12)*s,size1:30*s,paint:(c,p,a,sz)=>celPuff(c,p.x,p.y,sz,'#f2f4e6','#ffe08a',a*.85),blend:'source-over'}));burst(sys,0,0,cols,R,{n:14,speed:420*s,size:5*s});}},
  draw(c,t,s){const o=out3(t/.2),f=1-sm(.8,1.3,t),y=50*s;for(let i=0;i<3;i++){const r=(50+i*26)*s*o,rot=t*(i%2?-1.2:1.4)+i;const pts=[0,1,2,3].map(k=>{const a=rot+k/3*TAU-Math.PI/2;return [Math.cos(a)*r,y+Math.sin(a)*r*.3];});brushStroke(c,pts,{w:4*s,alpha:.85*f,cols,belly:.5,glow:1.8});}
   brushRing(c,0,y,110*s*o,.3,{w:5*s,alpha:.8*f,cols,pieces:3,front:Math.PI/2,seed:3,gap:.3,rot:t});
   for(let i=0;i<4;i++){const u=(t-.12-i*.05)/.22;if(u<0)continue;const k=out3(u)*(1-sm(.9,1.6,u)),x=(i-1.5)*30*s,a=-Math.PI/2+(i-1.5)*.35;const L=(80+hash(i,3)*30)*s*k;brushStroke(c,quadPoints(x,y,x+Math.cos(a)*L*.4+14*s,y+Math.sin(a)*L*.6,x+Math.cos(a)*L,y+Math.sin(a)*L,12),{w:13*s,alpha:.65*k,cols,tail:'soft',head:'sharp',belly:.4,glow:2});}
   if(t>=.4){const u=t-.4;spikeStar(c,0,0,80*s*(1-u/.25),{alpha:1-u/.25,cols,rot:.3,seed:4,thick:.13});}}}},
 // 리넷: 청록 바람 줄기가 대상을 감아 돌며 연달아 벤다
 lynetteWind(cols){let n=0;const at=[.08,.16,.24,.32];return {dur:1.1,spawn(sys,t,R,s){while(n<at.length&&t>=at[n]){burst(sys,0,0,cols,R,{n:8,speed:380*s,size:4*s});n++;}if(t<.5&&R()<.6)sys.add(P({x:(R()-.5)*160*s,y:(R()-.5)*100*s,vx:(R()<.5?-1:1)*300*s,vy:(R()-.5)*40*s,drag:2,life:.4,size:3*s,color:cols.main,kind:'spark',stretch:.06}));},
  draw(c,t,s){const f=1-sm(.5,1.1,t);for(let i=0;i<3;i++){const a0=t*7+i*2.1;crescent(c,0,0,(80+i*14)*s,(30+i*8)*s,a0,a0+1.6,{w:8*s*f,alpha:.85*f,cols,glow:2,rot:-.2+i*.15});}
   at.forEach((t0,i)=>{const u=t-t0;if(u<0||u>.2)return;const d=i%2?1:-1;brushStroke(c,[[-70*s,-50*s*d],[70*s*out5(u/.06)-0*s,50*s*d*out5(u/.06)]],{w:7*s*(1-u/.2),alpha:1-u/.2,cols,tail:'soft',head:'sharp',belly:.6,glow:2});});
   if(t>=.32){const u=t-.32;spikeStar(c,0,0,70*s*(1-u/.25),{alpha:1-u/.25,cols,rot:.2,seed:6,thick:.12});}}}},
 // 말라니: 커다란 물방울이 통통 튀며 날아와 터진다 — 물보라와 분홍 반짝임
 mualaniBubble(cols,{from}){const f=from||{x:-380,y:-40},T=.4;let hit=false;return {dur:1.2,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;for(let i=0;i<22;i++){const a=-Math.PI/2+(R()-.5)*2.6,v=(220+R()*380)*s;sys.add(P({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v,ay:900*s,drag:1,life:.5+R()*.35,size:(4+R()*5)*s,size1:2*s,color:R()<.5?cols.main:cols.core,kind:'glow'}));}burst(sys,0,0,{...cols,spark:cols.pink},R,{n:10,speed:380*s,size:5*s});}},
  draw(c,t,s){if(t<T){const k=t/T,x=f.x*(1-k),y=f.y*(1-k)-Math.abs(Math.sin(k*Math.PI*2))*70*s,r=26*s*(1+.08*Math.sin(t*40));c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);g.addColorStop(0,rgba('#ffffff',.85));g.addColorStop(.55,rgba(cols.main,.35));g.addColorStop(1,rgba(cols.deep,.75));c.fillStyle=g;c.beginPath();c.ellipse(x,y,r,r*.9,0,0,TAU);c.fill();c.restore();crescent(c,x,y,r*.8,r*.72,-2.5,-1.3,{w:3*s,alpha:.9,cols,glow:1.4});}
   if(t>=T){const u=t-T;ring(c,0,0,14*s+110*s*out3(u/.4),10*s,cols.main,1-u/.4,.55);flash(c,0,0,90*s,cols.main,.6*(1-u/.3));for(let i=0;i<5;i++){const a=-Math.PI/2+(i-2)*.45,k=out3(u/.15)*(1-sm(.15,.45,u));brushStroke(c,[[0,10*s],[Math.cos(a)*90*s*k,10*s+Math.sin(a)*90*s*k]],{w:8*s,alpha:k,cols,tail:'soft',head:'soft',belly:.5,glow:1.8});}
    for(let i=0;i<4;i++){const v=u-.06*i;if(v>0&&v<.3)spikeStar(c,Math.cos(i*1.7)*60*s,-20*s+Math.sin(i*1.7)*40*s,24*s*(1-v/.3),{alpha:1-v/.3,cols:{core:'#fff',main:cols.pink,deep:'#c04aa0'},rot:i,seed:i,thick:.18});}}}};},
 // 카치나: 금빛 회오리 드릴이 땅을 파고들고, 바위 가시가 솟으며 터진다
 kachinaDrill(cols){const T=.36;let hit=false;return {dur:1.3,spawn(sys,t,R,s){if(!hit&&t>=T){hit=true;burst(sys,0,0,cols,R,{n:18,speed:520*s,size:6*s,up:120*s});for(let i=0;i<10;i++){const a=-Math.PI/2+(R()-.5)*2.2,v=(260+R()*300)*s;sys.add(P({x:(R()-.5)*30*s,y:40*s,vx:Math.cos(a)*v,vy:Math.sin(a)*v,ay:1100*s,drag:.8,life:.6+R()*.3,size:(6+R()*6)*s,color:cols.rock,kind:'shard',blend:'source-over',rot:R()*TAU,vr:(R()-.5)*14}));}}},
  draw(c,t,s){const o=out3(t/.15),f=1-sm(.9,1.3,t);for(let i=0;i<3;i++){const r=(70-i*18)*s*o,spin=t*(12+i*3);crescent(c,0,40*s-i*8*s,r,r*.32,spin,spin+2.4,{w:(9-i*2)*s,alpha:f,cols,glow:2});crescent(c,0,40*s-i*8*s,r,r*.32,spin+Math.PI,spin+Math.PI+2.4,{w:(9-i*2)*s,alpha:f,cols,glow:2});}
   for(let i=0;i<6;i++){const a=t*6+i/6*TAU,x=Math.cos(a)*90*s*o,y=40*s+Math.sin(a)*28*s*o;c.save();c.translate(x,y);c.rotate(a);c.globalCompositeOperation='lighter';c.globalAlpha=f*.9;c.fillStyle=cols.main;c.beginPath();c.moveTo(0,-7*s);c.lineTo(6*s,5*s);c.lineTo(-6*s,5*s);c.closePath();c.fill();c.restore();}
   if(t>=T){const u=t-T,g=out5(u/.1)*(1-sm(.4,.9,u));for(let i=0;i<7;i++){const x=(i-3)*20*s,h2=(50+hash(i,3)*60)*s*g*(1-Math.abs(i-3)*.12),w=(12+hash(i,4)*6)*s;c.save();c.globalCompositeOperation='source-over';c.globalAlpha=.95;c.fillStyle=cols.rock;c.beginPath();c.moveTo(x-w,50*s);c.lineTo(x+(hash(i,5)-.5)*10*s,50*s-h2);c.lineTo(x+w,50*s);c.closePath();c.fill();c.globalCompositeOperation='lighter';c.fillStyle=cols.main;c.globalAlpha=.6;c.beginPath();c.moveTo(x-w*.3,50*s);c.lineTo(x+(hash(i,5)-.5)*10*s,50*s-h2);c.lineTo(x+w*.15,50*s);c.closePath();c.fill();c.restore();}
    flash(c,0,0,130*s,cols.main,.7*(1-u/.3));spikeStar(c,0,0,110*s*(1-u/.25),{alpha:1-u/.25,cols,rot:.1,seed:2,thick:.12,extra:3});}}}},
 // 타이나리: 연둣빛 화살이 날아들고, 대상 둘레에 꽃 모양 별빛이 연달아 터진다
 tighnariBloom(cols,{from}){const f=from||{x:-380,y:-60},T=.16,blooms=[[0,0,0],[.08,-56,-30],[.14,50,-46],[.2,-30,40],[.26,60,26]];let n=0;return {dur:1.2,spawn(sys,t,R,s){while(n<blooms.length&&t>=T+blooms[n][0]){const [,x,y]=blooms[n];burst(sys,x*s,y*s,cols,R,{n:8,speed:300*s,size:4*s});n++;}if(t>T&&t<.7&&R()<.5)sys.add(P({x:(R()-.5)*160*s,y:(R()-.5)*120*s,vx:(R()-.5)*60*s,vy:-40*s,drag:1.5,life:.6,size:(6+R()*8)*s,size1:1,color:cols.main,kind:'glint',rot:R()}));},
  draw(c,t,s){const k=out3(t/T),x=f.x*(1-k),y=f.y*(1-k)-Math.sin(Math.PI*k)*50*s,ang=Math.atan2(-f.y,-f.x);if(t<T+.02){streak(c,x-Math.cos(ang)*150*s,y-Math.sin(ang)*150*s,x,y,4*s,cols,1);}
   for(const [t1,bx,by] of blooms){const u=t-T-t1;if(u<0||u>.5)continue;const g=out5(u/.08)*(1-sm(.15,.5,u));for(let p=0;p<5;p++){const a=p/5*TAU+u*2;brushStroke(c,[[bx*s,by*s],[bx*s+Math.cos(a)*40*s*g,by*s+Math.sin(a)*40*s*g]],{w:12*s*g,alpha:g,cols,belly:.6,glow:2});}spikeStar(c,bx*s,by*s,50*s*g,{alpha:g,cols,rot:.4,seed:5,thick:.12});}
   if(t>=T){const u=t-T;flash(c,0,0,110*s,cols.main,.5*(1-u/.4));}}}},
 // 플린스: 땅에서 남보랏빛 번개 창 여러 자루가 비스듬히 솟고, 보랏빛 연기가 남는다
 flinsSpears(cols){const sp=[[-.0,-50,-.5],[.05,40,.45],[.1,-10,-.15],[.15,70,.7],[.2,-80,-.75]];let n=0;return {dur:1.4,spawn(sys,t,R,s){while(n<sp.length&&t>=sp[n][0]+.08){const [,x]=sp[n];burst(sys,x*s,40*s,cols,R,{n:8,speed:360*s,size:4*s,up:100*s});n++;}if(t>.35&&t<.5&&R()<.6)sys.add(P({x:(R()-.5)*140*s,y:30*s,vx:(R()-.5)*40*s,vy:-(20+R()*30)*s,drag:1,life:.9+R()*.4,size:(14+R()*12)*s,size1:26*s,color:cols.smoke,kind:'smoke',alpha:.6}));},
  draw(c,t,s){for(const [t0,x,tilt] of sp){const u=t-t0;if(u<0)continue;const k=out5(u/.08),f=1-sm(.25,.6,u),L=(150+hash(x,2)*70)*s*k,x0=x*s,y0=50*s,a=-Math.PI/2+tilt;const R=H.rnd(Math.floor(u*24)+x);
    H.bolt(c,H.boltPath(x0,y0,x0+Math.cos(a)*L,y0+Math.sin(a)*L,R,9,10*s),3.4*s*f,cols,f);crystal(c,x0+Math.cos(a)*L*.7,y0+Math.sin(a)*L*.7,a,L*.32,7*s*f,cols,f);}
   if(t>=.08){const u=t-.08;flash(c,0,20*s,130*s,cols.main,.55*(1-u/.4));ring(c,0,48*s,20*s+120*s*out3(u/.5),8*s,cols.main,1-u/.5,.28);}}}},

 // ===== 생명의 불꽃 (거점) =====
 // 캐릭터를 가운데 두고 불빛 여럿이 타원을 그리며 맴돈다. 앞을 지날 땐 밝고 크게, 뒤를 지날 땐 어둡고 작게.
 flameOrbit(cols){const N=5;return {dur:2.4,spawn(sys,t,R,s){if(t<1.9&&R()<.5){const a=R()*TAU;sys.add(P({x:Math.cos(a)*60*s,y:10*s+Math.sin(a)*18*s,vx:(R()-.5)*16*s,vy:-(40+R()*50)*s,drag:.8,life:.8+R()*.6,size:(2.5+R()*2.5)*s,color:R()<.5?cols.spark:cols.main,kind:R()<.3?'glint':'glow',rot:R()}));}},
  draw(c,t,s){const o=sm(0,.35,t),f=1-sm(1.8,2.4,t);flash(c,0,0,120*s,cols.deep,.22*o*f);flash(c,0,-10*s,70*s,cols.main,.25*o*f);
   const items=[];for(let i=0;i<N;i++){const a=t*2.6+i/N*TAU,rx=(64+8*Math.sin(t*1.7+i))*s,y=-20*s+Math.sin(a)*22*s-i%2*30*s+Math.sin(t*2+i)*8*s;items.push({a,x:Math.cos(a)*rx,y,depth:.5+.5*Math.sin(a),i});}
   items.sort((p,q)=>p.depth-q.depth);
   for(const it of items){const al=o*f*(.35+.65*it.depth),sz=(.65+.45*it.depth)*s;const trail=[];for(let k=7;k>=0;k--){const aa=it.a-k*.09,rx=(64+8*Math.sin((t-k*.03)*1.7+it.i))*s;trail.push([Math.cos(aa)*rx,-20*s+Math.sin(aa)*22*s-it.i%2*30*s+Math.sin((t-k*.03)*2+it.i)*8*s]);}
    brushStroke(c,trail,{w:9*sz,alpha:al*.7,cols,tail:'soft',head:'soft',belly:.85,glow:2});
    flash(c,it.x,it.y,26*sz,cols.main,al*.9);flash(c,it.x,it.y,12*sz,cols.core,al);const fl=1+.15*Math.sin(t*25+it.i*3);brushStroke(c,[[it.x,it.y+6*sz],[it.x,it.y-18*sz*fl]],{w:9*sz,alpha:al,cols,tail:'soft',head:'sharp',belly:.3,glow:1.6});}
   brushRing(c,0,46*s,70*s*(.8+.2*o),.28,{w:5*s,alpha:.6*o*f,cols,pieces:3,front:Math.PI/2,seed:5,gap:.35,rot:t*.5});}}},
 };}
