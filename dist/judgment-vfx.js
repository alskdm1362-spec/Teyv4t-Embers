// v0.37 사이노 「심판」 연출. 기준: 나모 님이 보낸 사이노 원소폭발 영상의 4초 부근(3.4–6.7초)을 카드 한 장 길이로 줄였다.
//   영상 3.6–3.8  땅을 도는 검은 먹 리본과 보라 고리        → 0.00–0.30 그림자 소용돌이
//   영상 3.9–4.1  대상에 빛나는 구체, 위로 튀는 불꽃       → 0.30–0.46 구체 · 지그재그 번개
//   영상 4.2–4.5  하늘에서 비스듬히 꽂히는 거대한 번개 창   → 0.52      번개 창(마디 고리, 곁가지)
//   영상 4.6–4.8  땅의 흰 섬광, 옆으로 퍼지는 번개, 바위    → 0.52–0.80 땅 섬광 · 수평 번개 · 바위 조각
//   영상 4.9–5.2  검은 먹 조각이 바닥에 방사형으로 깔림     → 0.70–1.15 먹 조각 · 잔전기
//   영상 5.5–6.7  눈 모양 끝이 달린 큰 고리가 퍼지며 사라짐 → 1.00–1.70 아누비스의 눈 고리
// 기법은 Small Magic 분석(프로젝트 문서 분석/2026-11-28_SmallMagic_이펙트분석.md): 몇 단의 평평한 톤, 1을 넘는 흰 심지,
// 밝은 배경에서도 읽히게 빛 바깥에 어두운 그늘, 노이즈 경로 번개, 순서가 있는 사라짐.
// 짧은 연출이면 1.8배 빠르다. 움직임 줄이기 설정이면 섬광이 약하다.

import {brushStroke,brushBolt,brushRing,crescent,spikeStar,fleck,inkStroke,arcPoints,quadPoints} from './fx-brush.js';
// v0.37 개정: 모든 선을 fx-brush.js 붓획으로 — 양 끝이 뾰족하거나 흐릿하고, 흰 심지가 넓다(레퍼런스 13장 분석, docs/V037-FX-STYLE.md).
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);},out3=t=>1-Math.pow(1-clamp(t),3);
const hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const noise=(x,s)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hash(i,s),hash(i+1,s),u);};

// 영상의 색: 흰 심지, 밝은 보라, 짙은 보라, 먹(검은 보라)
export const JUDGE={core:'#fbf4ff',main:'#b77cff',deep:'#5a24c8',ink:'#12061f',gold:'#ffe3a0'};
// v0.39 나모 님 피드백: 아누비스의 눈이 번개보다 먼저 뜬다 (눈 → 구체 → 번개 → 조각). 번개가 내려칠 때 눈이 감기듯 가늘어진다.
export const BEATS={vortex:.30,eye:.36,orb:.48,strike:.64,shards:.80,end:1.7};

/** 한 줄의 번개 길: 헤매고 꺾이다가 끝에서 정확히 대상에 닿는다. */
export function boltPath(x0,y0,x1,y1,seed,amp,steps=26){
 const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,pts=[];
 for(let i=0;i<=steps;i++){const s=i/steps,env=Math.min(1,s*7)*Math.min(1,(1-s)*5),
  off=((noise(s*3,seed)-.5)*1+(noise(s*9,seed+7)-.5)*.42+(noise(s*24,seed+3)-.5)*.16)*amp*env;
  pts.push([x0+dx*s+nx*off,y0+dy*s+ny*off]);}
 pts[steps]=[x1,y1];return pts;}

// 빛나는 선(번개): 뾰족한 양 끝, 넓은 흰 심지, 보라 몸통과 빛무리
function litLine(c,pts,w,a,soft=false){brushBolt(c,pts,{w:w*2.8,alpha:a,cols:JUDGE,tail:soft?'soft':'sharp'});}
function glowDot(c,x,y,r,a){if(a<=0||r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,JUDGE.core);g.addColorStop(.3,'rgba(190,130,255,.75)');g.addColorStop(1,'rgba(90,36,200,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1;}
// 먹 리본: 타원 위를 도는 초승달 — 머리는 뾰족, 꼬리는 흐릿
function ribbon(c,cx,cy,rx,ry,a0,sweep,w,color,alpha){inkStroke(c,arcPoints(cx,cy,rx,ry,a0,a0+sweep,24),{w:w*2,alpha,color,rim:JUDGE.main,head:'sharp',tail:'soft',belly:.62});}
// 빛 리본: 같은 모양을 빛으로
function lightRibbon(c,cx,cy,rx,ry,a0,sweep,w,alpha){crescent(c,cx,cy,rx,ry,a0,a0+sweep,{w,alpha,cols:JUDGE,glow:2.2});}
// 아누비스의 눈: 붓으로 그린 고리(아래가 두껍고 위가 가늘며 끊김)와, 좌우로 뾰족하게 뻗는 눈꼬리 두 쌍. thin 0→1이면 획이 가늘어지며 사라진다.
export function drawEye(c,R,a,lw,thin=0){const w=lw*3.2*(1-.75*thin);if(a<=0||w<=0)return;
 brushRing(c,0,0,R,1,{w,alpha:a,cols:JUDGE,pieces:4,front:Math.PI/2,gap:.18,seed:7,glow:2});
 for(const sgn of [-1,1]){brushStroke(c,quadPoints(sgn*R*.7,-R*.64,sgn*R*1.4,-R*.38,sgn*R*1.95,0),{w:w*.9,alpha:a,cols:JUDGE,tail:'soft',head:'sharp',belly:.35});
  brushStroke(c,quadPoints(sgn*R*.7,R*.64,sgn*R*1.4,R*.38,sgn*R*1.95,0),{w:w*.9,alpha:a,cols:JUDGE,tail:'soft',head:'sharp',belly:.35});
  brushStroke(c,quadPoints(sgn*R*1.02,-R*.2,sgn*R*1.4,-R*.08,sgn*R*1.62,0),{w:w*.6,alpha:a*.9,cols:JUDGE,tail:'soft',head:'sharp',belly:.4});}}

function makeCanvas(z){const cv=document.createElement('canvas');cv.className='judgment-vfx';cv.setAttribute('aria-hidden','true');Object.assign(cv.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:String(z)});document.body.append(cv);return cv;}
function fit(cv){const dpr=Math.min(1.5,devicePixelRatio||1),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}const c=cv.getContext('2d');c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.setTransform(dpr,0,0,dpr,0,0);return c;}
const geoOf=target=>{const r=target.getBoundingClientRect(),u=parseFloat(document.querySelector('#game')?.style.getPropertyValue('--scale'))||1;
 return {x:r.left+r.width/2,y:r.top+r.height*.52,feet:r.bottom-6,R:Math.max(r.width*.78,96*u),u,size:Math.max(r.width,r.height,90*u)};};

/**
 * 「심판」 연출을 시작한다. strike 는 번개 창이 닿는 순간, done 은 눈 고리까지 끝난 뒤 풀린다.
 */
export function judgmentScene({target,short=false,calm=false,onStrike=()=>{},sound=()=>{}}={}){
 let strikeDone,doneDone;const strike=new Promise(r=>strikeDone=r),done=new Promise(r=>doneDone=r);
 if(!target?.isConnected||document.hidden){strikeDone();doneDone();return {strike,done,still:()=>{},stop:()=>{}};}
 const speed=short?1.8:1,cv=makeCanvas(79),seed=(Math.random()*1e4)|0,parts=[];let struck=false,shardsOut=false,last=0,cut=false;
 const P=o=>parts.push(o);
 function spawnStrike(g){const u=g.u;
  // 바위 조각 (어두운 다각형, 중력, 땅에서 한 번 튐)
  for(let i=0;i<14;i++){const a=-Math.PI*(.15+.7*hash(i,seed)),v=(220+hash(i,seed+1)*380)*u;P({kind:'rock',x:g.x+(hash(i,seed+9)-.5)*g.R*.6,y:g.feet,vx:Math.cos(a)*v*(hash(i,seed+2)<.5?-1:1),vy:Math.sin(a)*v,size:(5+hash(i,seed+3)*9)*u,life:.7+hash(i,seed+4)*.4,t:0,spin:hash(i,seed+5)*TAU,vs:(hash(i,seed+6)-.5)*12,drag:.8,grav:900*u});}
  // 보라 불티
  for(let i=0;i<34;i++){const a=hash(i,seed+20)*TAU,v=(160+hash(i,seed+21)*460)*u;P({kind:'spark',x:g.x,y:g.feet-10*u,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.55-140*u,size:(2+hash(i,seed+22)*3)*u,life:.35+hash(i,seed+23)*.4,t:0,drag:3,grav:300*u});}
 }
 function spawnShards(g){shardsOut=true;for(let i=0;i<16;i++){const a=i/16*TAU+(hash(i,seed+40)-.5)*.3;P({kind:'shard',a,r0:g.R*.25,reach:g.R*(1.2+hash(i,seed+41)*1.1),w:(10+hash(i,seed+42)*14)*g.u,len:(40+hash(i,seed+43)*70)*g.u,life:.45+hash(i,seed+44)*.3,t:0,cx:g.x,cy:g.feet});}}
 function frame(T,dt,g){
  const c=fit(cv),B=BEATS,u=g.u;
  // 어둠으로 강조 (영상처럼 화면이 보랏빛 회색으로 가라앉는다)
  const dim=Math.min(.5*smooth(0,.25,T),.5*(1-smooth(B.strike+.1,B.shards+.3,T)));
  if(dim>0){const gr=c.createRadialGradient(g.x,g.y,g.size*.45,g.x,g.y,g.size*1.6+g.R*1.4);gr.addColorStop(0,'rgba(14,6,28,0)');gr.addColorStop(1,`rgba(14,6,28,${dim})`);c.fillStyle=gr;c.fillRect(0,0,innerWidth,innerHeight);}
  // ① 그림자 소용돌이: 땅을 도는 먹 리본, 그 아래 보라 고리
  if(T<B.strike+.12){const k=smooth(0,.18,T)*(1-smooth(B.strike-.04,B.strike+.12,T)),rx=g.R*(1.05-.25*smooth(0,B.strike,T)),ry=rx*.3,spin=T*7;
   brushRing(c,g.x,g.feet,rx*.92,.3,{w:5*u,alpha:k*.85,cols:JUDGE,pieces:3,front:Math.PI/2,rot:0,seed:seed%97,gap:.35});
   for(let i=0;i<5;i++){const a0=spin+i/5*TAU+hash(i,seed)*.5;ribbon(c,g.x,g.feet-6*u,rx*(.95+.12*hash(i,seed+1)),ry*(.95+.12*hash(i,seed+1)),a0,1.6+.6*hash(i,seed+2),(9+6*hash(i,seed+3))*u,JUDGE.ink,k*.92);
    lightRibbon(c,g.x,g.feet-6*u,rx*1.02,ry*1.02,a0+.25,.9,4*u,k*.7);}
   // 먼저 휘두른 초승달 두 줄 (영상 3.4초)
   const sw=smooth(0,.14,T)*(1-smooth(.14,.28,T));if(sw>0)for(let j=0;j<2;j++)ribbon(c,g.x,g.y,g.R*(.7+j*.15),g.R*(.55+j*.12),-2.4+j*.3+T*4,1.5,7*u,JUDGE.ink,sw*.8);}
  // ② 구체와 지그재그 번개
  if(T>=B.vortex*.85&&T<B.strike+.08){const k=smooth(B.vortex*.85,B.vortex+.06,T)*(1-smooth(B.strike,B.strike+.08,T));c.globalCompositeOperation='lighter';glowDot(c,g.x,g.y,g.size*.42*(1+.15*Math.sin(T*40)),k);c.globalCompositeOperation='source-over';
   const fl=Math.floor(T*24);for(let j=0;j<2;j++){if(hash(fl,j+seed)<.35)continue;const a=hash(fl*3+j,seed)*TAU,r=g.size*.55;litLine(c,boltPath(g.x+Math.cos(a)*r*.2,g.y+Math.sin(a)*r*.2,g.x+Math.cos(a+1.2)*r,g.y+Math.sin(a+1.2)*r,fl+j*13,g.size*.18,10),1.3*u,k*.85);}
   // 위로 튀는 불꽃 한 줄
   const sp=smooth(B.vortex,B.orb,T),sy=g.y-g.size*.1-sp*g.size*.6;brushStroke(c,[[g.x+g.size*.33,sy+26*u],[g.x+g.size*.3,sy]],{w:5*u,alpha:k,cols:JUDGE,tail:'soft',head:'sharp',belly:.7});}
  // ③ 번개 창: 오른쪽 위 하늘에서 비스듬히, 마디 고리 둘과 곁가지
  if(T>=B.strike-.03&&T<B.strike+.3){const bt=T-B.strike,a=bt<0?smooth(-.03,0,bt):bt<.1?1:(Math.floor(bt*30)%3?.9:.35)*(1-smooth(.18,.3,bt)),re=Math.floor(Math.max(0,bt)*18);
   const x0=g.x+Math.min(innerWidth*.45,g.size*2.6),y0=-40,beam=boltPath(x0,y0,g.x,g.feet-4*u,seed+re*31,g.size*.22,30);litLine(c,beam,(calm?5:8)*u,a,true);
   for(const at of [.45,.75]){const [px,py]=beam[Math.round(at*30)];brushRing(c,px,py,15*u,.6,{w:3.4*u,alpha:a,cols:JUDGE,pieces:2,front:-.6+Math.PI/2,rot:-.6,seed:at*10,gap:.5});c.globalCompositeOperation='lighter';glowDot(c,px,py,22*u,a*.6);c.globalCompositeOperation='source-over';}
   if(bt>=0&&bt<.12)spikeStar(c,g.x,g.feet-8*u,g.size*1.1*(1-bt*3),{alpha:1-bt/.12,cols:JUDGE,rot:-.35,seed:seed%31,thick:.13,extra:4});
   for(let f=0;f<3;f++){const at=8+Math.floor(hash(f,seed+re)*18),[fx,fy]=beam[at],side=f%2?1:-1,len=g.size*(.35+hash(f,seed)*.3);litLine(c,boltPath(fx,fy,fx+side*len,fy+len*.5,seed+re*7+f*5,len*.3,10),1.6*u,a*.7);}}
  // ④ 땅 섬광 · 수평 번개
  if(T>=B.strike&&T<B.strike+.4){const bt=T-B.strike,k=1-smooth(.05,.4,bt),R=g.R*(1+1.1*out3(bt/.25));c.globalCompositeOperation='lighter';
   c.save();c.translate(g.x,g.feet);c.scale(1,.32);const gr=c.createRadialGradient(0,0,0,0,0,R);gr.addColorStop(0,`rgba(255,250,255,${(calm?.6:1)*k})`);gr.addColorStop(.35,`rgba(210,160,255,${.8*k})`);gr.addColorStop(1,'rgba(90,36,200,0)');c.fillStyle=gr;c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.restore();
   c.globalCompositeOperation='source-over';
   for(let j=0;j<4;j++){const side=j%2?1:-1,len=g.R*(1.3+hash(j,seed+60)*1.1)*out3(bt/.15);if(len<2)continue;litLine(c,boltPath(g.x,g.feet-4*u,g.x+side*len,g.feet-4*u+(hash(j,seed+61)-.5)*30*u,seed+j*9+Math.floor(bt*20),18*u,12),1.5*u,k*.8);}}
  // ⑤ 먹 조각 · 바위 · 불티
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue;}const q=p.t/p.life;
   if(p.kind==='shard'){// 먹 조각: 바깥으로 미끄러지며, 꼬리부터 깎여 짧아지고 가늘어진다
    const r=p.r0+(p.reach-p.r0)*out3(q),hx=p.cx+Math.cos(p.a)*r,hy=p.cy+Math.sin(p.a)*r*.32,dx=Math.cos(p.a),dy=Math.sin(p.a)*.32,dl=Math.hypot(dx,dy),len=p.len*(1-.8*smooth(.35,1,q)),w=p.w*(1-.6*smooth(.4,1,q));
    inkStroke(c,[[hx-dx/dl*len,hy-dy/dl*len],[hx,hy]],{w,alpha:.95*(1-smooth(.8,1,q)),color:JUDGE.ink,rim:JUDGE.main,tail:'soft',head:'sharp',belly:.7});continue;}
   const d=Math.exp(-p.drag*dt);p.vx*=d;p.vy=p.vy*d+p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.kind==='rock'){p.spin+=p.vs*dt;if(p.y>g.feet+8*u){p.y=g.feet+8*u;p.vy*=-.3;p.vx*=.6;}}
   const s=p.size*(1-smooth(.6,1,q));c.save();c.translate(p.x,p.y);
   if(p.kind==='rock'){c.rotate(p.spin);c.globalAlpha=1;c.fillStyle='#1d1430';c.beginPath();c.moveTo(-s*.6,-s*.3);c.lineTo(-s*.1,-s*.6);c.lineTo(s*.6,-s*.2);c.lineTo(s*.4,s*.5);c.lineTo(-s*.5,s*.4);c.closePath();c.fill();c.globalAlpha=.6;c.strokeStyle=JUDGE.main;c.lineWidth=1;c.stroke();}
   else{c.restore();fleck(c,p.x,p.y,p.vx,p.vy,s*1.4,hash(i,seed)<.3?JUDGE.core:JUDGE.main,.95);c.save();}
   c.restore();c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  // 잔전기 (조각이 깔린 동안 대상 주변에서 튄다)
  if(T>B.shards&&T<B.end-.3){const k=1-smooth(B.end-.6,B.end-.3,T),fl=Math.floor(T*20);if(hash(fl,seed+80)>.4){const a=hash(fl,seed+81)*TAU,r=g.size*.5;litLine(c,boltPath(g.x+Math.cos(a)*r*.3,g.y+Math.sin(a)*r*.3,g.x+Math.cos(a+.8)*r,g.y+Math.sin(a+.8)*r*.8,fl,g.size*.12,8),1*u,k*.7);}}
  // ⑥ 아누비스의 눈 고리: 퍼지면서 사라진다
  if(T>=B.eye-.05&&T<B.strike+.3){const k=smooth(B.eye-.05,B.eye+.1,T)*(1-smooth(B.strike+.04,B.strike+.3,T)),R=g.size*(.7+.12*out3((T-B.eye)/.25))*(1+.35*smooth(B.strike-.02,B.strike+.3,T)),cy=g.y-g.size*.25;if(k>0){c.save();c.translate(g.x,cy);drawEye(c,R,Math.min(1,k*1.4),2.2*u,smooth(B.strike-.06,B.strike+.2,T));c.restore();}}
  c.globalAlpha=1;c.globalCompositeOperation='source-over';
 }
 const start=performance.now();
 const tick=now=>{if(cut)return;const T=(now-start)/1000*speed,dt=Math.min(.05,(now-(last||now))/1000)*speed;last=now;
  if(!target.isConnected&&!struck){finish();return;}const g=geoOf(target);
  if(!struck&&T>=BEATS.strike){struck=true;spawnStrike(g);try{onStrike();}catch{}strikeDone();}
  if(struck&&!shardsOut&&T>=BEATS.shards)spawnShards(g);
  frame(T,dt,g);if(T<BEATS.end||parts.length)requestAnimationFrame(tick);else finish();};
 function finish(){if(cut)return;cut=true;cv.remove();strikeDone();doneDone();}
 sound('abyss_cast',{gain:.7});requestAnimationFrame(tick);
 // QA: 정해진 시각의 한 장면만 그린다
 const still=T=>{cut=true;const g=geoOf(target);if(T>=BEATS.strike)spawnStrike(g);if(T>=BEATS.shards)spawnShards(g);for(const p of parts)p.t=Math.max(0,Math.min(p.life*.5,T-(p.kind==='shard'?BEATS.shards:BEATS.strike)));frame(T,0,g);};
 return {strike,done,still,stop:finish};
}

/** 죄·명계가 저절로 발동할 때의 작은 번개: 짧은 사선 번개 + 먹 초승달 (0.38초). 죄는 왼쪽 위, 명계는 오른쪽 위에서 친다. */
export function verdictSpark(target,{part='sin',short=false}={}){
 if(!target?.isConnected||document.hidden)return Promise.resolve();
 const cv=makeCanvas(79),speed=short?1.8:1,start=performance.now(),dur=.38,seed=(Math.random()*1e4)|0;
 return new Promise(resolve=>{const tick=now=>{if(!target.isConnected){cv.remove();resolve();return;}const t=(now-start)/1000*speed,g=geoOf(target),c=fit(cv),k=t<.06?t/.06:1-smooth(.12,dur,t),side=part==='sin'?-1:1;
  ribbon(c,g.x,g.y,g.size*.55,g.size*.38,side<0?-2.6+t*5:-.6-t*5,1.6,10*g.u,JUDGE.ink,k*.9);
  litLine(c,boltPath(g.x+side*g.size*1.2,g.y-g.size*1.6,g.x,g.y,seed+Math.floor(t*25),g.size*.2,16),3.6*g.u,k,true);
  c.globalCompositeOperation='lighter';glowDot(c,g.x,g.y,g.size*.36,k*.7);c.globalCompositeOperation='source-over';if(t<.14)spikeStar(c,g.x,g.y,g.size*.7,{alpha:1-t/.14,cols:JUDGE,rot:side*.4,seed:seed%13,thick:.14});
  if(t<dur)requestAnimationFrame(tick);else{cv.remove();resolve();}};requestAnimationFrame(tick);});
}

/** 결합 순간의 반짝임: 길이가 다른 네 갈래 별 + 붓 고리 (레퍼런스의 타격 반짝임). */
// v0.39 결합 빛: 카드가 모이는 동안 작은 빛(0.3초, 반짝이며 조금씩 커짐) → 0.15초 만에 최종 크기의 큰 빛 → 퍼지는 원형 빛 두 겹(더 굵고 밝게) → 사라짐
const out5=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),5);
export const COMBINE_BEATS={small:.3,grow:.15,end:.95};
export function combineFlash(x,y,{short=false,scale=1}={}){
 const cv=makeCanvas(81),speed=short?1.8:1,start=performance.now(),B=COMBINE_BEATS;
 const draw=t=>{const c=fit(cv),S=scale;c.globalCompositeOperation='lighter';
  if(t<B.small){const k=t/B.small,tw=.8+.2*Math.sin(t*60);glowDot(c,x,y,(16+14*k)*S*tw,.9);spikeStar(c,x,y,(26+18*k)*S*tw,{alpha:.95,cols:JUDGE,rot:-.12+t*.6,seed:3,thick:.16,glow:1.8});c.globalCompositeOperation='source-over';return;}
  const u=t-B.small,g=out5(u/B.grow),a=u<B.grow+.08?1:1-smooth(B.grow+.08,B.end-B.small,u);
  glowDot(c,x,y,(30+110*g)*S*(1-.3*smooth(B.grow,B.end-B.small,u)),a*.95);
  // 원형으로 퍼지는 빛: 납작한 밝은 원판 + 굵은 붓 고리 두 겹
  const R=(40+230*out3(u/.4))*S;c.save();c.translate(x,y);c.scale(1,.55);const gr=c.createRadialGradient(0,0,R*.55,0,0,R);gr.addColorStop(0,'rgba(190,130,255,0)');gr.addColorStop(.85,`rgba(220,180,255,${.55*a})`);gr.addColorStop(1,'rgba(120,60,230,0)');c.fillStyle=gr;c.beginPath();c.arc(0,0,R,0,Math.PI*2);c.fill();c.restore();
  c.globalCompositeOperation='source-over';
  spikeStar(c,x,y,(44+236*g)*S*(1-.45*smooth(B.grow+.1,B.end-B.small,u)),{alpha:a,cols:JUDGE,rot:-.12,seed:3,thick:.12*(1-.5*smooth(0,.6,u)),extra:4});
  brushRing(c,x,y,R,.55,{w:14*S*(1-smooth(0,.55,u)),alpha:a,cols:JUDGE,pieces:3,front:Math.PI/2,seed:5,gap:.3,glow:2.6});
  brushRing(c,x,y,R*.7,.55,{w:8*S*(1-smooth(0,.45,u)),alpha:a*.85,cols:JUDGE,pieces:4,front:-Math.PI/2,seed:8,gap:.35});};
 return new Promise(resolve=>{const tick=now=>{const t=(now-start)/1000*speed;draw(t);if(t<B.end)requestAnimationFrame(tick);else{cv.remove();resolve();}};requestAnimationFrame(tick);});
}
