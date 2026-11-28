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

const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);},out3=t=>1-Math.pow(1-clamp(t),3);
const hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const noise=(x,s)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hash(i,s),hash(i+1,s),u);};

// 영상의 색: 흰 심지, 밝은 보라, 짙은 보라, 먹(검은 보라)
export const JUDGE={core:'#fbf4ff',main:'#b77cff',deep:'#5a24c8',ink:'#12061f',gold:'#ffe3a0'};
export const BEATS={vortex:.30,orb:.46,strike:.52,shards:.70,eye:1.0,end:1.7};

/** 한 줄의 번개 길: 헤매고 꺾이다가 끝에서 정확히 대상에 닿는다. */
export function boltPath(x0,y0,x1,y1,seed,amp,steps=26){
 const dx=x1-x0,dy=y1-y0,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,pts=[];
 for(let i=0;i<=steps;i++){const s=i/steps,env=Math.min(1,s*7)*Math.min(1,(1-s)*5),
  off=((noise(s*3,seed)-.5)*1+(noise(s*9,seed+7)-.5)*.42+(noise(s*24,seed+3)-.5)*.16)*amp*env;
  pts.push([x0+dx*s+nx*off,y0+dy*s+ny*off]);}
 pts[steps]=[x1,y1];return pts;}

function stroke(c,pts,w,color,alpha){if(alpha<=0)return;c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=w;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
// 빛나는 선: 어두운 그늘 → 넓은 후광 → 몸 → 흰 심지
function litLine(c,pts,w,a){c.lineCap='round';c.lineJoin='round';c.globalCompositeOperation='source-over';stroke(c,pts,w*4,JUDGE.ink,a*.3);
 c.globalCompositeOperation='lighter';stroke(c,pts,w*7,JUDGE.main,a*.16);stroke(c,pts,w*2.6,JUDGE.main,a*.65);stroke(c,pts,w,JUDGE.core,a);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
function glowDot(c,x,y,r,a){if(a<=0||r<=0)return;const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,JUDGE.core);g.addColorStop(.3,`rgba(190,130,255,${.75})`);g.addColorStop(1,'rgba(90,36,200,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.globalAlpha=1;}
// 먹 리본: 끝이 가늘어지는 초승달 띠 (타원 위의 호를 따라)
function ribbon(c,cx,cy,rx,ry,a0,sweep,w,color,alpha){if(alpha<=0)return;const n=18;c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();
 for(let i=0;i<=n;i++){const t=i/n,a=a0+sweep*t,k=Math.sin(Math.PI*t)*w;c.lineTo(cx+Math.cos(a)*(rx+k),cy+Math.sin(a)*(ry+k*.35));}
 for(let i=n;i>=0;i--){const t=i/n,a=a0+sweep*t,k=Math.sin(Math.PI*t)*w;c.lineTo(cx+Math.cos(a)*(rx-k*.4),cy+Math.sin(a)*(ry-k*.14));}
 c.closePath();c.fill();c.globalAlpha=1;}
// 아누비스의 눈: 원 하나와, 좌우로 뾰족하게 뻗는 눈꼬리 두 쌍
export function drawEye(c,R,a,lw){c.globalCompositeOperation='lighter';
 for(const [w,col,k] of [[lw*4,JUDGE.main,.18],[lw*1.6,JUDGE.main,.6],[lw*.7,JUDGE.core,.95]]){c.strokeStyle=col;c.lineWidth=w;c.globalAlpha=a*k;
  c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();
  for(const sgn of [-1,1]){c.beginPath();c.moveTo(sgn*R*.72,-R*.62);c.quadraticCurveTo(sgn*R*1.35,-R*.35,sgn*R*1.9,0);c.quadraticCurveTo(sgn*R*1.35,R*.35,sgn*R*.72,R*.62);c.stroke();
   c.beginPath();c.moveTo(sgn*R*1.02,-R*.2);c.quadraticCurveTo(sgn*R*1.4,-R*.08,sgn*R*1.62,0);c.stroke();}}
 c.globalAlpha=1;c.globalCompositeOperation='source-over';}

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
  const dim=Math.min(.5*smooth(0,.25,T),.5*(1-smooth(B.strike+.1,B.eye+.2,T)));
  if(dim>0){const gr=c.createRadialGradient(g.x,g.y,g.size*.45,g.x,g.y,g.size*1.6+g.R*1.4);gr.addColorStop(0,'rgba(14,6,28,0)');gr.addColorStop(1,`rgba(14,6,28,${dim})`);c.fillStyle=gr;c.fillRect(0,0,innerWidth,innerHeight);}
  // ① 그림자 소용돌이: 땅을 도는 먹 리본, 그 아래 보라 고리
  if(T<B.strike+.12){const k=smooth(0,.18,T)*(1-smooth(B.strike-.04,B.strike+.12,T)),rx=g.R*(1.05-.25*smooth(0,B.strike,T)),ry=rx*.3,spin=T*7;
   c.globalCompositeOperation='lighter';c.globalAlpha=k*.55;c.strokeStyle=JUDGE.main;c.lineWidth=7*u;c.beginPath();c.ellipse(g.x,g.feet,rx*.92,ry*.92,0,0,TAU);c.stroke();
   c.globalAlpha=k*.9;c.strokeStyle=JUDGE.core;c.lineWidth=1.6*u;c.stroke();c.globalCompositeOperation='source-over';c.globalAlpha=1;
   for(let i=0;i<5;i++){const a0=spin+i/5*TAU+hash(i,seed)*.5;ribbon(c,g.x,g.feet-6*u,rx*(.95+.12*hash(i,seed+1)),ry*(.95+.12*hash(i,seed+1)),a0,1.6+.6*hash(i,seed+2),(9+6*hash(i,seed+3))*u,JUDGE.ink,k*.92);
    c.globalCompositeOperation='lighter';ribbon(c,g.x,g.feet-6*u,rx*1.02,ry*1.02,a0+.25,.9,3*u,JUDGE.main,k*.55);c.globalCompositeOperation='source-over';}
   // 먼저 휘두른 초승달 두 줄 (영상 3.4초)
   const sw=smooth(0,.14,T)*(1-smooth(.14,.28,T));if(sw>0)for(let j=0;j<2;j++)ribbon(c,g.x,g.y,g.R*(.7+j*.15),g.R*(.55+j*.12),-2.4+j*.3+T*4,1.5,7*u,JUDGE.ink,sw*.8);}
  // ② 구체와 지그재그 번개
  if(T>=B.vortex*.85&&T<B.strike+.08){const k=smooth(B.vortex*.85,B.vortex+.06,T)*(1-smooth(B.strike,B.strike+.08,T));c.globalCompositeOperation='lighter';glowDot(c,g.x,g.y,g.size*.42*(1+.15*Math.sin(T*40)),k);c.globalCompositeOperation='source-over';
   const fl=Math.floor(T*24);for(let j=0;j<2;j++){if(hash(fl,j+seed)<.35)continue;const a=hash(fl*3+j,seed)*TAU,r=g.size*.55;litLine(c,boltPath(g.x+Math.cos(a)*r*.2,g.y+Math.sin(a)*r*.2,g.x+Math.cos(a+1.2)*r,g.y+Math.sin(a+1.2)*r,fl+j*13,g.size*.18,10),1.3*u,k*.85);}
   // 위로 튀는 불꽃 한 줄
   const sp=smooth(B.vortex,B.orb,T);c.globalCompositeOperation='lighter';c.globalAlpha=k;c.strokeStyle=JUDGE.core;c.lineWidth=2.5*u;c.lineCap='round';c.beginPath();c.moveTo(g.x+g.size*.3,g.y-g.size*.1-sp*g.size*.6);c.lineTo(g.x+g.size*.33,g.y-g.size*.1-sp*g.size*.6+18*u);c.stroke();c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  // ③ 번개 창: 오른쪽 위 하늘에서 비스듬히, 마디 고리 둘과 곁가지
  if(T>=B.strike-.03&&T<B.strike+.3){const bt=T-B.strike,a=bt<0?smooth(-.03,0,bt):bt<.1?1:(Math.floor(bt*30)%3?.9:.35)*(1-smooth(.18,.3,bt)),re=Math.floor(Math.max(0,bt)*18);
   const x0=g.x+Math.min(innerWidth*.45,g.size*2.6),y0=-40,beam=boltPath(x0,y0,g.x,g.feet-4*u,seed+re*31,g.size*.22,30);litLine(c,beam,(calm?5:8)*u,a);
   for(const at of [.45,.75]){const [px,py]=beam[Math.round(at*30)];c.globalCompositeOperation='lighter';c.globalAlpha=a;c.strokeStyle=JUDGE.core;c.lineWidth=2.2*u;c.beginPath();c.ellipse(px,py,14*u,9*u,-.6,0,TAU);c.stroke();glowDot(c,px,py,22*u,a*.7);c.globalCompositeOperation='source-over';}
   for(let f=0;f<3;f++){const at=8+Math.floor(hash(f,seed+re)*18),[fx,fy]=beam[at],side=f%2?1:-1,len=g.size*(.35+hash(f,seed)*.3);litLine(c,boltPath(fx,fy,fx+side*len,fy+len*.5,seed+re*7+f*5,len*.3,10),1.6*u,a*.7);}}
  // ④ 땅 섬광 · 수평 번개
  if(T>=B.strike&&T<B.strike+.4){const bt=T-B.strike,k=1-smooth(.05,.4,bt),R=g.R*(1+1.1*out3(bt/.25));c.globalCompositeOperation='lighter';
   c.save();c.translate(g.x,g.feet);c.scale(1,.32);const gr=c.createRadialGradient(0,0,0,0,0,R);gr.addColorStop(0,`rgba(255,250,255,${(calm?.6:1)*k})`);gr.addColorStop(.35,`rgba(210,160,255,${.8*k})`);gr.addColorStop(1,'rgba(90,36,200,0)');c.fillStyle=gr;c.beginPath();c.arc(0,0,R,0,TAU);c.fill();c.restore();
   c.globalCompositeOperation='source-over';
   for(let j=0;j<4;j++){const side=j%2?1:-1,len=g.R*(1.3+hash(j,seed+60)*1.1)*out3(bt/.15);if(len<2)continue;litLine(c,boltPath(g.x,g.feet-4*u,g.x+side*len,g.feet-4*u+(hash(j,seed+61)-.5)*30*u,seed+j*9+Math.floor(bt*20),18*u,12),1.5*u,k*.8);}}
  // ⑤ 먹 조각 · 바위 · 불티
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue;}const q=p.t/p.life;
   if(p.kind==='shard'){const r=p.r0+(p.reach-p.r0)*out3(q),x=p.cx+Math.cos(p.a)*r,y=p.cy+Math.sin(p.a)*r*.32,ang=Math.atan2(Math.sin(p.a)*.32,Math.cos(p.a)),fade=1-smooth(.5,1,q);
    c.save();c.translate(x,y);c.rotate(ang);c.globalAlpha=.9*fade;c.fillStyle=JUDGE.ink;c.beginPath();c.moveTo(-p.len*.5,0);c.quadraticCurveTo(0,-p.w*.5,p.len*.5,0);c.quadraticCurveTo(0,p.w*.18,-p.len*.5,0);c.fill();
    c.globalCompositeOperation='lighter';c.globalAlpha=.5*fade;c.strokeStyle=JUDGE.main;c.lineWidth=1.2*u;c.stroke();c.restore();c.globalCompositeOperation='source-over';c.globalAlpha=1;continue;}
   const d=Math.exp(-p.drag*dt);p.vx*=d;p.vy=p.vy*d+p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.kind==='rock'){p.spin+=p.vs*dt;if(p.y>g.feet+8*u){p.y=g.feet+8*u;p.vy*=-.3;p.vx*=.6;}}
   const s=p.size*(1-smooth(.6,1,q));c.save();c.translate(p.x,p.y);
   if(p.kind==='rock'){c.rotate(p.spin);c.globalAlpha=1;c.fillStyle='#1d1430';c.beginPath();c.moveTo(-s*.6,-s*.3);c.lineTo(-s*.1,-s*.6);c.lineTo(s*.6,-s*.2);c.lineTo(s*.4,s*.5);c.lineTo(-s*.5,s*.4);c.closePath();c.fill();c.globalAlpha=.6;c.strokeStyle=JUDGE.main;c.lineWidth=1;c.stroke();}
   else{c.globalCompositeOperation='lighter';c.globalAlpha=.95;c.fillStyle=hash(i,seed)<.3?JUDGE.core:JUDGE.main;c.fillRect(-s/2,-s/2,s,s);}
   c.restore();c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  // 잔전기 (조각이 깔린 동안 대상 주변에서 튄다)
  if(T>B.shards&&T<B.eye+.15){const k=1-smooth(B.eye-.1,B.eye+.15,T),fl=Math.floor(T*20);if(hash(fl,seed+80)>.4){const a=hash(fl,seed+81)*TAU,r=g.size*.5;litLine(c,boltPath(g.x+Math.cos(a)*r*.3,g.y+Math.sin(a)*r*.3,g.x+Math.cos(a+.8)*r,g.y+Math.sin(a+.8)*r*.8,fl,g.size*.12,8),1*u,k*.7);}}
  // ⑥ 아누비스의 눈 고리: 퍼지면서 사라진다
  if(T>=B.eye-.05){const k=smooth(B.eye-.05,B.eye+.12,T)*(1-smooth(B.end-.35,B.end,T)),R=g.size*(.62+.16*out3((T-B.eye)/.6));if(k>0){c.save();c.translate(g.x,g.y);drawEye(c,R,k,2.2*u);c.restore();}}
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
  litLine(c,boltPath(g.x+side*g.size*1.2,g.y-g.size*1.6,g.x,g.y,seed+Math.floor(t*25),g.size*.2,16),3.6*g.u,k);
  c.globalCompositeOperation='lighter';glowDot(c,g.x,g.y,g.size*.42,k*.85);c.globalCompositeOperation='source-over';
  if(t<dur)requestAnimationFrame(tick);else{cv.remove();resolve();}};requestAnimationFrame(tick);});
}

/** 결합 순간의 반짝임: 네 갈래 별빛 + 고리. */
export function combineFlash(x,y,{short=false,scale=1}={}){
 const cv=makeCanvas(81),speed=short?1.8:1,start=performance.now(),dur=.5;
 return new Promise(resolve=>{const tick=now=>{const t=(now-start)/1000*speed,c=fit(cv);c.translate(x,y);c.globalCompositeOperation='lighter';const k=clamp(t/dur),a=Math.exp(-Math.pow((k-.18)/.22,2)),L=(140+180*k)*scale;
  for(const [rx,ry,w] of [[L,0,7],[0,L*.7,7],[L*.35,L*.35,3],[-L*.35,L*.35,3]]){const g=c.createLinearGradient(-rx,-ry,rx,ry);g.addColorStop(0,'rgba(180,108,255,0)');g.addColorStop(.5,`rgba(255,250,255,${a})`);g.addColorStop(1,'rgba(180,108,255,0)');c.strokeStyle=g;c.lineWidth=w*scale;c.beginPath();c.moveTo(-rx,-ry);c.lineTo(rx,ry);c.stroke();}
  const gr=c.createRadialGradient(0,0,0,0,0,70*scale);gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(.4,`rgba(180,108,255,${a*.6})`);gr.addColorStop(1,'rgba(90,30,200,0)');c.fillStyle=gr;c.beginPath();c.arc(0,0,70*scale,0,TAU);c.fill();
  c.globalAlpha=(1-k)*.8;c.strokeStyle=JUDGE.core;c.lineWidth=3*scale;c.beginPath();c.arc(0,0,(30+150*out3(k))*scale,0,TAU);c.stroke();c.globalAlpha=1;
  if(k<1)requestAnimationFrame(tick);else{cv.remove();resolve();}};requestAnimationFrame(tick);});
}
