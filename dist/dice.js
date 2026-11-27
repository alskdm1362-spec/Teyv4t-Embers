// 가벼운 로우폴리 20면체 주사위. 3D 라이브러리·물리 엔진 없이 캔버스에 직접 투영한다.
// 결과는 규칙이 먼저 정한다. 연출은 그 결과 면을 정면에 세우기만 한다.
// 흐름: 던짐 → 튀어 오르기 2회 → 감속 → 결과 면이 정면에 딸깍 (ROLL_MS 이내)
export const ROLL_MS=900,FAST_MS=220;
const g=(1+Math.sqrt(5))/2;
const unit=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const mul=(m,v)=>[dot(m[0],v),dot(m[1],v),dot(m[2],v)];
const mm=(a,b)=>a.map(r=>[0,1,2].map(j=>r[0]*b[0][j]+r[1]*b[1][j]+r[2]*b[2][j]));
export const VERTS=[[-1,g,0],[1,g,0],[-1,-g,0],[1,-g,0],[0,-1,g],[0,1,g],[0,-1,-g],[0,1,-g],[g,0,-1],[g,0,1],[-g,0,-1],[-g,0,1]].map(unit);
const TRI=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
// 면마다: 꼭짓점, 중심, 바깥 법선, 글자 위쪽(u)과 오른쪽(r). 마주 보는 면의 합은 21이 되도록 번호를 붙인다.
export const FACES=(()=>{
 const raw=TRI.map(f=>{const c=f.map(i=>VERTS[i]).reduce((a,v)=>a.map((n,j)=>n+v[j]/3),[0,0,0]),n=unit(c),u=unit(VERTS[f[0]].map((x,j)=>x-c[j])),r=cross(u,n);return {verts:f,center:c,normal:n,up:u,right:r};});
 const order=[],used=new Set();for(let i=0;i<raw.length;i++){if(used.has(i))continue;const j=raw.findIndex((f,k)=>k!==i&&!used.has(k)&&dot(f.normal,raw[i].normal)<-.999);used.add(i);used.add(j);order.push([i,j]);}
 order.forEach(([a,b],k)=>{raw[a].value=k+1;raw[b].value=20-k;});
 return raw.sort((a,b)=>a.value-b.value);
})();
const face=value=>FACES[Math.max(1,Math.min(20,Math.round(value)||1))-1];
// 결과 면을 화면 정면(+z), 글자를 똑바로(+y) 세우는 회전.
export function faceRotation(value){const f=face(value);return [f.right,f.up,f.normal];}
function axisRotation(axis,angle){const [x,y,z]=unit(axis),c=Math.cos(angle),s=Math.sin(angle),t=1-c;return [[t*x*x+c,t*x*y-s*z,t*x*z+s*y],[t*x*y+s*z,t*y*y+c,t*y*z-s*x],[t*x*z-s*y,t*y*z+s*x,t*z*z+c]];}
const SPIN_AXIS=[.74,.56,.37],CLICK_AXIS=[.45,1,0],SETTLE=.86,BOUNCES=[.38,.64,.82];
const outCubic=p=>1-Math.pow(1-p,3);
// 바닥에서 뜬 높이(0~1). 던져져 떨어진 뒤 두 번 튀고 멈춘다.
export function rollHeight(p){
 if(p<=0)return 1;if(p>=BOUNCES[2])return 0;
 if(p<BOUNCES[0]){const q=p/BOUNCES[0];return 1-q*q;}
 const arc=(a,b,h)=>{const q=(p-a)/(b-a);return 4*h*q*(1-q);};
 return p<BOUNCES[1]?arc(BOUNCES[0],BOUNCES[1],.42):arc(BOUNCES[1],BOUNCES[2],.16);
}
// 진행도 p(0~1)에서의 자세. p=1이면 결과 면이 정확히 정면에 선다.
export function rollPose(p,value){
 p=Math.max(0,Math.min(1,p));
 const spin=5.5*Math.PI*(1-outCubic(Math.min(1,p/SETTLE))),click=p<SETTLE?.22:.22*(1-outCubic((p-SETTLE)/(1-SETTLE)));
 const rotation=mm(axisRotation(CLICK_AXIS,click),mm(axisRotation(SPIN_AXIS,spin),faceRotation(value)));
 return {rotation,x:-.95*Math.pow(1-Math.min(1,p/BOUNCES[2]),1.6),height:rollHeight(p),settled:p>=SETTLE,done:p>=1};
}
export const impactTimes=()=>BOUNCES.slice();
function draw(ctx,size,pose,value,glow){
 const w=size.w,h=size.h,R=Math.min(w*.2,h*.36),ground=h*.86,cx=w*.5+pose.x*w*.42,cy=ground-R*.92-pose.height*(h*.44),persp=v=>{const k=1/(1-v[2]*.16);return [cx+v[0]*R*k,cy-v[1]*R*k];};
 ctx.clearRect(0,0,w,h);
 // 바닥 그림자: 높이 뜰수록 작고 옅다.
 const sh=1-pose.height*.55;ctx.save();ctx.translate(cx,ground);ctx.scale(1,.2);ctx.beginPath();ctx.arc(0,0,R*.95*sh,0,Math.PI*2);ctx.fillStyle=`rgba(0,0,0,${.42*sh})`;ctx.fill();ctx.restore();
 const pts=VERTS.map(v=>mul(pose.rotation,v)),light=unit([-.45,.6,.66]);
 const faces=FACES.map(f=>({f,n:mul(pose.rotation,f.normal),c:mul(pose.rotation,f.center),u:mul(pose.rotation,f.up),r:mul(pose.rotation,f.right)})).filter(x=>x.n[2]>-.05).sort((a,b)=>a.c[2]-b.c[2]);
 ctx.lineJoin='round';
 for(const x of faces){
  const lit=Math.max(0,dot(x.n,light)),hit=glow>0&&x.f.value===value,q=x.f.verts.map(i=>persp(pts[i]));
  ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();
  const base=[26+lit*52,34+lit*66,48+lit*78],warm=[150,82,40];ctx.fillStyle=`rgb(${base.map((c,i)=>Math.round(c+(hit?(warm[i]-c)*.55*glow:0))).join(',')})`;ctx.fill();
  ctx.strokeStyle=hit?`rgba(255,${170+60*glow},${110+70*glow},${.6+.4*glow})`:'rgba(176,198,206,.5)';ctx.lineWidth=hit?2.2:1.2;ctx.stroke();
  if(x.n[2]>.1){// 면 위에 놓인 글자: 면의 오른쪽·위쪽 벡터를 그대로 투영한다.
   const o=persp(x.c),s=R*.3/11;ctx.save();ctx.transform(x.r[0]*s,-x.r[1]*s,-x.u[0]*s,x.u[1]*s,o[0],o[1]);ctx.font='700 11px SUIT,system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=hit?`rgba(255,${236-20*glow},${214-40*glow},1)`:`rgba(231,243,248,${Math.min(1,x.n[2]*1.7)})`;ctx.fillText(String(x.f.value),0,.6);if(x.f.value===6||x.f.value===9)ctx.fillRect(-3.4,6.2,6.8,.9);ctx.restore();
  }
 }
}
export function rollDie(host,result,{instant=false,fast=false,onDone=()=>{},sound=()=>{}}={}){
 let cancelled=false,reported=false,frame=0;
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),value=Math.max(1,Math.min(20,Math.round(result)||1)),duration=instant?0:fast?FAST_MS:ROLL_MS;
 host.replaceChildren(canvas);host.dataset.renderer='dice-lite';host.dataset.rolling='true';host.dataset.result='';
 const size={w:1,h:1},fit=()=>{const r=host.getBoundingClientRect(),dpr=Math.min(2,globalThis.devicePixelRatio||1);size.w=Math.max(160,r.width||440);size.h=Math.max(120,r.height||260);canvas.width=Math.round(size.w*dpr);canvas.height=Math.round(size.h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);};
 fit();
 const finish=()=>{if(cancelled||reported)return;reported=true;host.dataset.result=String(value);host.dataset.rolling='false';onDone();};
 const begin=performance.now(),hits=impactTimes().map(t=>({t,played:false}));
 const step=()=>{
  if(cancelled)return;const now=performance.now();
  const p=duration?Math.min(1,(now-begin)/duration):1,pose=rollPose(p,value),after=duration?Math.min(1,Math.max(0,(now-begin-duration)/260)):1;
  for(const hit of hits)if(!hit.played&&p>=hit.t){hit.played=true;if(duration)sound(hit.t===hits[0].t?.42:hit.t===hits[1].t?.26:.16);}
  draw(ctx,size,pose,value,p>=1?1-after*.45:0);
  if(p>=1)finish();
  if(p<1||after<1)frame=requestAnimationFrame(step);
 };
 frame=requestAnimationFrame(step);
 return ()=>{cancelled=true;cancelAnimationFrame(frame);};
}
