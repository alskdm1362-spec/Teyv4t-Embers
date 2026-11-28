// v0.37 칠흑의 심판 연출. 기준: 나모 님이 보낸 CZN 결합 덱 영상의 카드 한 장 박자(1배속 약 1.7초)와
// Small Magic 분석(분석/2026-11-28_SmallMagic_이펙트분석.md)의 기법.
//   선딜 0.00–0.30  세상이 어두워지고(대상만 밝게 남김), 대상 발밑에 일곱 변의 심판 문양이 테두리부터 써진다
//   집중 0.30–0.62  빛 조각이 대상으로 빨려 들고, 문양 안에서 작은 번개가 튄다
//   타격 0.62       잉크 프레임 두 박자(흑백 → 반전) + 노이즈 경로 번개 + 땅 충격파 + 네모 파편
//   여운 0.76–1.65  어둠이 걷히고, 문양은 바깥 테두리부터 먹혀 사라지고, 네모 불씨가 피어오른다
// 짧은 연출이면 1.8배 빠르고 반전 박자를 뺀다. 움직임 줄이기 설정이면 잉크 프레임 대신 옅은 섬광만 쓴다.

const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);},out3=t=>1-Math.pow(1-clamp(t),3);
const hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};
const noise=(x,s)=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hash(i,s),hash(i+1,s),u);};

// 문양 색: 심지는 거의 흰색, 몸은 보라, 테두리 그늘은 짙은 남보라. (불꽃 램프처럼 몇 단만 쓴다)
export const JUDGE={core:'#f7efff',main:'#b46cff',deep:'#3a1488',ink:'#140826',gold:'#ffe3a0'};
export const SIDES=7; // 칠흑의 심판 → 일곱 변
export const BEATS={charge:.30,strike:.62,ink:.07,clear:.76,end:1.65};

/** 한 줄의 번개 길: 높이를 따라 헤매고 꺾이다가 끝에서 정확히 대상에 닿는다. */
export function boltPath(x0,y0,x1,y1,seed,amp,steps=26){
 const pts=[];for(let i=0;i<=steps;i++){const s=i/steps,env=Math.min(1,s*7)*Math.min(1,(1-s)*5),
  off=((noise(s*3,seed)-.5)*1+(noise(s*9,seed+7)-.5)*.42+(noise(s*24,seed+3)-.5)*.16)*amp*env;
  pts.push([lerp(x0,x1,s)+off,lerp(y0,y1,s)]);}return pts;}

function stroke(c,pts,w,color,alpha){if(alpha<=0)return;c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=w;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
// 빛나는 선: 바깥에 어두운 그늘(밝은 배경에서도 읽히게) → 넓은 후광 → 몸 → 흰 심지.
function litLine(c,pts,w,a,cols=JUDGE){c.lineCap='round';c.lineJoin='round';c.globalCompositeOperation='source-over';stroke(c,pts,w*4.2,cols.ink,a*.28);
 c.globalCompositeOperation='lighter';stroke(c,pts,w*7,cols.main,a*.16);stroke(c,pts,w*2.6,cols.main,a*.6);stroke(c,pts,w,cols.core,a);c.globalCompositeOperation='source-over';}

function glyph(c,id,size){c.beginPath();for(let k=0;k<3;k++){const a=Math.floor(hash(id,k)*9),b=Math.floor(hash(id,k+5)*9);if(a===b)continue;c.moveTo((a%3-1)*size*.5,(Math.floor(a/3)-1)*size*.5);c.lineTo((b%3-1)*size*.5,(Math.floor(b/3)-1)*size*.5);}c.stroke();}

/**
 * 심판 문양. 좌표는 원 안(반지름 R), 바닥에 눕힐 때는 호출하는 쪽이 세로로 눌러 준다.
 * written 0→1: 테두리 → 눈금·룬 띠 → 일곱 변과 별 → 안쪽 원. gone 0→1: 바깥부터 조각나 먹혀 사라진다.
 */
export function drawSigil(c,R,{written=1,gone=0,turn=0,glow=1,px=1}={}){
 const lw=Math.max(px*1.1,R*.012),w0=clamp(written/.35),w1=clamp((written-.25)/.35),w2=clamp((written-.45)/.35),w3=clamp((written-.7)/.3);
 // 사라짐에 순서: 바깥 테두리 먼저, 룬, 도형, 안쪽 원이 마지막
 const keep=(order,i)=>hash(i,order*13)>smooth(order*.18,order*.18+.45,gone);
 const ring=(r,frac,width,order,a0=-Math.PI/2)=>{const seg=48;for(let i=0;i<seg*frac;i++){if(!keep(order,i))continue;c.beginPath();c.arc(0,0,r,a0+i/seg*TAU,a0+Math.min(frac*seg,i+1)/seg*TAU);c.lineWidth=width;c.stroke();}};
 const pass=(color,widthK,alpha)=>{c.strokeStyle=color;c.globalAlpha=alpha*glow;
  ring(R*.97,w0,lw*2.2*widthK,0);ring(R*.9,w0,lw*.8*widthK,0);
  // 다이얼 눈금 96개(8개마다 길게)
  c.lineWidth=lw*.7*widthK;c.beginPath();for(let i=0;i<96*w0;i++){if(!keep(0,i+100))continue;const a=-Math.PI/2+i/96*TAU+turn*.3,l=i%8?.025:.05;c.moveTo(Math.cos(a)*R*.905,Math.sin(a)*R*.905);c.lineTo(Math.cos(a)*R*(.905+l),Math.sin(a)*R*(.905+l));}c.stroke();
  // 룬 띠: 22자, 반대로 돈다
  c.lineWidth=lw*.9*widthK;for(let i=0;i<22*w1;i++){if(!keep(1,i))continue;const a=i/22*TAU-turn;c.save();c.rotate(a);c.translate(R*.8,0);c.rotate(Math.PI/2);glyph(c,i*5+3,R*.085);c.restore();}
  ring(R*.72,w1,lw*.7*widthK,1);
  // 일곱 변과 그 사이를 지나는 별 {7/3}
  if(w2>0){const n=SIDES,rot=-turn*.7-Math.PI/2,P=k=>[Math.cos(rot+k/n*TAU)*R*.66,Math.sin(rot+k/n*TAU)*R*.66];c.lineWidth=lw*1.1*widthK;
   const edges=Math.ceil(n*2*w2);c.beginPath();for(let e=0;e<edges;e++){if(!keep(2,e))continue;const star=e>=n,k=e%n,a=P(k),b=P(star?k+3:k+1);c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);}c.stroke();
   for(let k=0;k<n*w2;k++){if(!keep(2,k+30))continue;const [x,y]=P(k);c.beginPath();c.arc(x,y,R*.055,0,TAU);c.stroke();}}
  if(w3>0){ring(R*.33,w3,lw*1.2*widthK,3);ring(R*.12,w3,lw*1.6*widthK,3);}
 };
 c.lineCap='round';c.globalCompositeOperation='source-over';pass(JUDGE.ink,3.2,.22);
 c.globalCompositeOperation='lighter';pass(JUDGE.main,2.6,.38);pass(JUDGE.core,1,.95);
 // 써지는 자리의 밝은 점
 if(w0>0&&w0<1){const a=-Math.PI/2+w0*TAU,x=Math.cos(a)*R*.97,y=Math.sin(a)*R*.97,g=c.createRadialGradient(x,y,0,x,y,R*.09);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(200,150,255,.7)');g.addColorStop(1,'rgba(120,60,255,0)');c.globalAlpha=1;c.fillStyle=g;c.beginPath();c.arc(x,y,R*.09,0,TAU);c.fill();}
 c.globalCompositeOperation='source-over';c.globalAlpha=1;
}

function makeCanvas(z){const cv=document.createElement('canvas');cv.className='judgment-vfx';cv.setAttribute('aria-hidden','true');Object.assign(cv.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:String(z)});document.body.append(cv);return cv;}

/**
 * 연출을 시작한다. strike 는 번개가 닿는 순간, done 은 여운까지 끝난 뒤 풀린다.
 * target: 맞을 적 요소. onStrike: 닿는 순간 한 번(카메라 흔들림·소리 등).
 */
export function judgmentScene({target,short=false,calm=false,onStrike=()=>{},sound=()=>{}}={}){
 let strikeDone,doneDone;const strike=new Promise(r=>strikeDone=r),done=new Promise(r=>doneDone=r);
 if(!target?.isConnected||document.hidden){strikeDone();doneDone();return {strike,done,still:()=>{}};}
 const speed=short?1.8:1,cv=makeCanvas(79),ink=document.createElement('div');ink.className='judgment-ink';ink.setAttribute('aria-hidden','true');document.body.append(ink);
 const c=cv.getContext('2d'),seed=(Math.random()*1e4)|0,parts=[];let struck=false,last=0,cut=false;
 const geo=()=>{const r=target.getBoundingClientRect(),u=1.55*(parseFloat(document.querySelector('#game')?.style.getPropertyValue('--scale'))||1);
  return {x:r.left+r.width/2,y:r.top+r.height*.5,feet:r.bottom-6,R:Math.max(r.width*.9,68*u),u,size:Math.max(r.width,r.height)};};
 const P=(o)=>parts.push(o);
 function spawnStrike(g){for(let i=0;i<46;i++){const a=hash(i,seed)*TAU,v=(160+hash(i,seed+1)*520)*g.u/1.55;P({x:g.x,y:g.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-120,size:(3+hash(i,seed+2)*6)*g.u/1.55,life:.45+hash(i,seed+3)*.45,t:0,spin:hash(i,seed+4)*TAU,col:i%3?JUDGE.main:JUDGE.core,drag:3.2,grav:260});}}
 function spawnEmber(g,i){const a=hash(i,seed+9)*TAU,r=g.R*(.2+hash(i,seed+8)*.8);P({x:g.x+Math.cos(a)*r,y:g.feet+Math.sin(a)*r*.32,vx:(hash(i,seed+7)-.5)*30,vy:-(40+hash(i,seed+6)*90)*g.u/1.55,size:(2+hash(i,seed+5)*4)*g.u/1.55,life:.7+hash(i,seed+4)*.6,t:0,spin:0,col:i%4?JUDGE.main:JUDGE.gold,drag:.6,grav:-20});}
 function frame(T,dt,g){
  const dpr=Math.min(1.5,devicePixelRatio||1),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.setTransform(dpr,0,0,dpr,0,0);const S=BEATS,px=1/dpr;
  const inkOn=!calm&&T>=S.strike&&T<S.strike+S.ink*(short?1:2),inverted=inkOn&&T>=S.strike+S.ink;
  // 어둠으로 강조: 대상 둘레만 남기고 세상을 어둡게
  const dim=Math.min(.64*smooth(0,S.charge,T),.64*(1-smooth(S.strike+.04,S.clear+.3,T)));
  if(dim>0&&!inkOn){const gr=c.createRadialGradient(g.x,g.y,g.size*.5,g.x,g.y,g.size*1.5+g.R*1.2);gr.addColorStop(0,'rgba(10,4,24,0)');gr.addColorStop(1,`rgba(10,4,24,${dim})`);c.fillStyle=gr;c.fillRect(0,0,innerWidth,innerHeight);
   c.globalCompositeOperation='lighter';c.fillStyle=`rgba(90,30,160,${dim*.12})`;c.fillRect(0,0,innerWidth,innerHeight);c.globalCompositeOperation='source-over';}
  ink.className='judgment-ink'+(inkOn?inverted?' on inverted':' on':'');
  // 바닥 문양
  const written=out3(T/(S.strike-.04)),gone=smooth(S.clear-.05,S.end-.25,T),flare=1+1.4*Math.exp(-Math.pow((T-S.strike)/.06,2));
  if(gone<1){c.save();c.translate(g.x,g.feet);c.scale(1,.32);drawSigil(c,g.R*(1+.08*smooth(S.strike,S.strike+.3,T)),{written,gone,turn:T*1.1,glow:flare,px});c.restore();}
  // 집중: 빛 조각이 대상으로 빨려 든다 + 문양 안의 작은 번개
  if(T>S.charge*.8&&T<S.strike){const k=smooth(S.charge*.8,S.strike,T);c.globalCompositeOperation='lighter';
   for(let i=0;i<22;i++){const ph=(T*2.4+hash(i,seed))%1,a=hash(i,seed+11)*TAU,r=(1-ph)*(g.R*1.9+60),x=g.x+Math.cos(a)*r,y=g.y+Math.sin(a)*r*.75,tx=g.x+Math.cos(a)*r*.82,ty=g.y+Math.sin(a)*r*.75*.82;
    c.globalAlpha=k*Math.sin(ph*Math.PI)*.9;c.strokeStyle=i%3?JUDGE.main:JUDGE.core;c.lineWidth=2*g.u/1.55;c.beginPath();c.moveTo(x,y);c.lineTo(tx,ty);c.stroke();}
   c.globalCompositeOperation='source-over';
   const flick=Math.floor(T*22);for(let j=0;j<2;j++){if(hash(flick,j+seed)<.45)continue;const a=hash(flick*3+j,seed)*TAU,r0=g.R*.25,r1=g.R*.95;
    litLine(c,boltPath(g.x+Math.cos(a)*r0,g.feet+Math.sin(a)*r0*.32,g.x+Math.cos(a+.5)*r1,g.feet+Math.sin(a+.5)*r1*.32,flick+j*17,14*g.u/1.55,8),1.2*g.u/1.55,k*.8);}}
  // 잉크 프레임: 흑백 두 박자, 착탄점에서 방사형 광선과 딱딱한 원
  if(inkOn){const fg=inverted?'#fff':'#000',rays=48;c.fillStyle=fg;
   for(let i=0;i<rays;i++){if(hash(i,seed+(inverted?2:1))<.62)continue;const a=i/rays*TAU,b=a+TAU/rays*.55,r0=g.size*(.45+hash(i,seed)*.3),r1=Math.hypot(innerWidth,innerHeight);
    c.beginPath();c.moveTo(g.x+Math.cos(a)*r0,g.y+Math.sin(a)*r0);c.lineTo(g.x+Math.cos(a)*r1,g.y+Math.sin(a)*r1);c.lineTo(g.x+Math.cos(b)*r1,g.y+Math.sin(b)*r1);c.closePath();c.fill();}
   c.fillStyle=inverted?'#000':'#fff';c.beginPath();c.arc(g.x,g.y,g.size*(inverted?.16:.11),0,TAU);c.fill();}
  else if(calm&&T>=S.strike&&T<S.strike+.25){c.fillStyle=`rgba(240,225,255,${.35*(1-(T-S.strike)/.25)})`;c.fillRect(0,0,innerWidth,innerHeight);}
  // 본타 번개: 화면 위에서 대상까지, 갈래 둘, 50ms마다 다시 그어 떨린다
  if(T>=S.strike&&T<S.strike+.36){const bt=T-S.strike,a=bt<.1?1:(Math.floor(bt*30)%3?.85:.25)*(1-smooth(.2,.36,bt)),re=Math.floor(bt*20),x0=g.x+(hash(re,seed)-.5)*g.size*.6;
   const main=boltPath(x0,-30,g.x,g.y,seed+re*31,g.size*.55,34);litLine(c,main,(inkOn?5:3.4)*g.u/1.55,a);
   for(let f=0;f<2;f++){const at=10+Math.floor(hash(f,seed+re)*12),[fx,fy]=main[at],side=f?1:-1,len=(g.y-fy)*.45;litLine(c,boltPath(fx,fy,fx+side*len*.55,fy+len,seed+re*7+f*5,len*.35,12),1.6*g.u/1.55,a*.75);}
   // 땅 충격파 고리
   const k=out3(bt/.34);c.save();c.translate(g.x,g.feet);c.scale(1,.32);c.globalCompositeOperation='lighter';c.globalAlpha=(1-k)*.9;c.strokeStyle=JUDGE.core;c.lineWidth=(10*(1-k)+2)*g.u/1.55;c.beginPath();c.arc(0,0,g.R*(.8+1.6*k),0,TAU);c.stroke();
   c.globalAlpha=(1-k)*.5;c.strokeStyle=JUDGE.main;c.lineWidth=(26*(1-k)+4)*g.u/1.55;c.stroke();c.restore();c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  // 네모 파편과 불씨 (영상의 카드가 네모 조각으로 흩어지는 결을 따름)
  c.globalCompositeOperation='lighter';for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;if(p.t>p.life){parts.splice(i,1);continue;}const d=Math.exp(-p.drag*dt);p.vx*=d;p.vy=p.vy*d+p.grav*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.spin+=dt*3;
   const s=p.size*(1-smooth(.55,1,p.t/p.life));c.globalAlpha=.95;c.fillStyle=p.col;c.save();c.translate(p.x,p.y);c.rotate(p.spin);c.fillRect(-s/2,-s/2,s,s);c.restore();}
  c.globalCompositeOperation='source-over';c.globalAlpha=1;
 }
 const start=performance.now();
 const tick=now=>{if(cut)return;const T=(now-start)/1000*speed,dt=Math.min(.05,(now-(last||now))/1000)*speed;last=now;
  if(!target.isConnected&&!struck){finish();return;}const g=geo();
  if(!struck&&T>=BEATS.strike){struck=true;spawnStrike(g);try{onStrike();}catch{}strikeDone();}
  if(T>BEATS.clear&&T<BEATS.end-.4&&Math.floor(T*40)!==Math.floor((T-dt)*40))spawnEmber(g,Math.floor(T*40));
  frame(T,dt,g);if(T<BEATS.end||parts.length)requestAnimationFrame(tick);else finish();};
 function finish(){if(cut)return;cut=true;cv.remove();ink.remove();strikeDone();doneDone();}
 sound('abyss_cast',{gain:.7});requestAnimationFrame(tick);
 // QA: 정해진 시각의 한 장면만 그린다
 const still=T=>{cut=true;const g=geo();if(T>=BEATS.strike)spawnStrike(g);frame(T,0,g);};
 return {strike,done,still,stop:finish};
}

/** 결합 순간의 반짝임: 네 갈래 별빛 + 고리 (영상 24.6초의 흰 섬광 결). */
export function combineFlash(x,y,{short=false,scale=1}={}){
 const cv=makeCanvas(81),c=cv.getContext('2d'),speed=short?1.8:1,start=performance.now(),dur=.5;
 return new Promise(resolve=>{const tick=now=>{const t=(now-start)/1000*speed,dpr=Math.min(1.5,devicePixelRatio||1),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}
  c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);c.setTransform(dpr,0,0,dpr,0,0);c.translate(x,y);c.globalCompositeOperation='lighter';const k=clamp(t/dur),a=Math.exp(-Math.pow((k-.18)/.22,2)),L=(140+180*k)*scale;
  for(const [rx,ry,w] of [[L,0,7],[0,L*.7,7],[L*.35,L*.35,3],[-L*.35,L*.35,3]]){const g=c.createLinearGradient(-rx,-ry,rx,ry);g.addColorStop(0,'rgba(180,108,255,0)');g.addColorStop(.5,`rgba(255,250,255,${a})`);g.addColorStop(1,'rgba(180,108,255,0)');c.strokeStyle=g;c.lineWidth=w*scale;c.beginPath();c.moveTo(-rx,-ry);c.lineTo(rx,ry);c.stroke();}
  const gr=c.createRadialGradient(0,0,0,0,0,70*scale);gr.addColorStop(0,`rgba(255,255,255,${a})`);gr.addColorStop(.4,`rgba(180,108,255,${a*.6})`);gr.addColorStop(1,'rgba(90,30,200,0)');c.fillStyle=gr;c.beginPath();c.arc(0,0,70*scale,0,TAU);c.fill();
  c.globalAlpha=(1-k)*.8;c.strokeStyle=JUDGE.core;c.lineWidth=3*scale;c.beginPath();c.arc(0,0,(30+150*out3(k))*scale,0,TAU);c.stroke();c.globalAlpha=1;
  if(k<1)requestAnimationFrame(tick);else{cv.remove();resolve();}};requestAnimationFrame(tick);});
}
