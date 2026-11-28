// v0.37 이펙트 붓. 나모 님이 고른 2D 이펙트 레퍼런스 13장(2026-11-28)에서 뽑은 규칙을 그리기 함수로 묶었다.
//  1. 선은 모두 "칠한 모양"이다: 몸통이 두껍고 양 끝은 바늘처럼 뾰족하거나(sharp) 흐릿하게 사라진다(soft). 둥근 끝·같은 굵기 금지.
//  2. 심지가 넓다: 흰 심지가 몸통의 절반쯤, 색은 가장자리와 바깥 빛무리에만.
//  3. 한 이펙트는 한 색 + 흰색 (+ 많아야 보조색 하나).
//  4. 고리는 붓으로 그린 것처럼 한쪽이 두껍고 반대쪽이 가늘며 끊긴다.
//  5. 사라질 때는 꼬리부터 가늘어지고 조각(fleck)으로 흩어진다 — 통째로 투명해지지 않는다.
// 좌표는 CSS 픽셀. 모든 함수는 c(2D 컨텍스트)의 합성 상태를 원래대로 돌려 놓는다.

const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hexRgb=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
export const rgba=(h,a)=>{const [r,g,b]=hexRgb(h);return `rgba(${r},${g},${b},${clamp(a)})`;};
const hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};

/** 굵기 모양: t 0→1, 가장 두꺼운 곳 belly. 끝은 0(sharp) 또는 얇게 남는다(soft, 대신 투명해진다). */
export function taperWidth(t,{belly=.5,head='sharp',tail='sharp',pow=.65}={}){
 const u=t<belly?.5*t/Math.max(belly,1e-3):.5+.5*(t-belly)/Math.max(1-belly,1e-3),base=Math.pow(Math.sin(Math.PI*clamp(u)),pow);
 const soft=(t<belly?tail:head)==='soft';return soft?Math.max(base,.28*Math.sin(Math.PI*clamp(u))+.12):base;}

// 점이 적은 획(직선 두 점 등)은 굵기 모양이 보이도록 잘게 나눈다
function resample(pts,min=14){if(pts.length>=min)return pts;const out=[];const seg=pts.length-1,per=Math.ceil((min-1)/seg);for(let i=0;i<seg;i++)for(let k=0;k<per;k++){const t=k/per;out.push([pts[i][0]+(pts[i+1][0]-pts[i][0])*t,pts[i][1]+(pts[i+1][1]-pts[i][1])*t]);}out.push(pts[pts.length-1]);return out;}
function outline(pts,w,opt,k){pts=resample(pts);const n=pts.length,len=[0];for(let i=1;i<n;i++)len.push(len[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));const L=len[n-1]||1,left=[],right=[];
 for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;const t=len[i]/L;
  let hw=w*k*.5*taperWidth(t,opt);if(opt.jag)hw*=1+(hash(i,opt.seed||1)-.5)*opt.jag*2;left.push([pts[i][0]-dy*hw,pts[i][1]+dx*hw]);right.push([pts[i][0]+dy*hw,pts[i][1]-dx*hw]);}
 return {left,right,L};}
function fillOutline(c,{left,right},fill){c.beginPath();left.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));for(let i=right.length-1;i>=0;i--)c.lineTo(right[i][0],right[i][1]);c.closePath();c.fillStyle=fill;c.fill();}
// 흐릿한 끝: 처음 → 끝 방향 선형 그라데이션 (곧거나 살짝 휜 획에 맞다)
function endFade(c,pts,color,a,{head='sharp',tail='sharp',fade=.32}){const p0=pts[0],p1=pts[pts.length-1];if(head!=='soft'&&tail!=='soft')return rgba(color,a);
 const g=c.createLinearGradient(p0[0],p0[1],p1[0],p1[1]);g.addColorStop(0,rgba(color,tail==='soft'?0:a));g.addColorStop(tail==='soft'?fade:0,rgba(color,a));g.addColorStop(head==='soft'?1-fade:1,rgba(color,a));g.addColorStop(1,rgba(color,head==='soft'?0:a));return g;}

/**
 * 붓획 하나: 빛무리(색, 흐림) → 몸통(색) → 심지(흰색, 몸통의 core 배). pts는 꼬리 → 머리 순서.
 * opt: w 몸통 굵기, alpha, cols {core,main,deep}, head/tail 'sharp'|'soft', belly, core(심지 비율, 기본 .52), glow(빛무리 배율), jag(가장자리 거칠기 0~.4), ink(어두운 그늘 굵기 배율, 0이면 없음)
 */
export function brushStroke(c,pts,opt){if(!pts||pts.length<2||opt.alpha<=0||opt.w<=0)return;const a=clamp(opt.alpha),cols=opt.cols,o={head:'sharp',tail:'sharp',belly:.55,core:.52,glow:2.4,...opt};
 c.save();c.lineJoin='round';
 if(o.ink){c.globalCompositeOperation='source-over';fillOutline(c,outline(pts,o.w,{...o,jag:0},o.ink),endFade(c,pts,cols.ink||'#0a0414',a*.35,o));}
 c.globalCompositeOperation='lighter';
 // 빛무리: 흐림 필터 대신 넓고 옅은 겹 두 장 (휴대전화에서 가볍게)
 if(o.glow){fillOutline(c,outline(pts,o.w,o,o.glow),endFade(c,pts,cols.deep||cols.main,a*.16,o));fillOutline(c,outline(pts,o.w,o,1+(o.glow-1)*.45),endFade(c,pts,cols.main,a*.22,o));}
 fillOutline(c,outline(pts,o.w,o,1),endFade(c,pts,cols.main,a*.95,o));
 fillOutline(c,outline(pts,o.w,{...o,jag:o.jag*.5},o.core),endFade(c,pts,cols.core||'#ffffff',a,o));
 c.restore();}

/** 호(弧) 획: 타원 위의 a0→a1, 머리(a1)가 날카롭고 꼬리가 흐릿한 초승달. */
export function arcPoints(cx,cy,rx,ry,a0,a1,n=28,rot=0){const pts=[],cr=Math.cos(rot),sr=Math.sin(rot);for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n,x=Math.cos(a)*rx,y=Math.sin(a)*ry;pts.push([cx+x*cr-y*sr,cy+x*sr+y*cr]);}return pts;}
export function crescent(c,cx,cy,rx,ry,a0,a1,opt){brushStroke(c,arcPoints(cx,cy,rx,ry,a0,a1,28,opt.rot||0),{tail:'soft',head:'sharp',belly:.62,...opt});}

/**
 * 붓으로 그린 고리: 앞쪽(front 방향)이 두껍고 뒤쪽이 가늘며, 두세 군데 끊긴다. 여러 개의 호 획으로 그린다.
 */
export function brushRing(c,cx,cy,r,squash,opt){const n=opt.pieces||3,front=opt.front??Math.PI/2,seed=opt.seed||1,gap=opt.gap??.22;
 for(let i=0;i<n;i++){const a0=front+Math.PI+i/n*TAU+gap*.5+(hash(i,seed)-.5)*.2,a1=a0+TAU/n-gap,mid=(a0+a1)/2,thick=.35+.65*(.5+.5*Math.cos(mid-front));
  brushStroke(c,arcPoints(cx,cy,r,r*squash,a0,a1,22,opt.rot||0),{...opt,w:opt.w*thick,head:'sharp',tail:'sharp',belly:.5});}}

/** 네 갈래 별(길이가 서로 다른 가시) — 레퍼런스의 타격 순간 반짝임. */
export function spikeStar(c,x,y,r,opt){const rot=opt.rot||0,seed=opt.seed||1,n=opt.spikes||4;
 for(let i=0;i<n;i++){const a=rot+i/n*TAU,L=r*(i%2?.55+.25*hash(i,seed):1-.15*hash(i,seed));brushStroke(c,[[x,y],[x+Math.cos(a)*L,y+Math.sin(a)*L]],{...opt,w:r*(opt.thick||.16),tail:'sharp',head:'sharp',belly:.12,glow:opt.glow??2});}
 if(opt.extra)for(let i=0;i<opt.extra;i++){const a=rot+hash(i+9,seed)*TAU,L=r*(.25+.3*hash(i+19,seed));brushStroke(c,[[x,y],[x+Math.cos(a)*L,y+Math.sin(a)*L]],{...opt,w:r*.07,belly:.15,glow:1.6});}}

/** 날카로운 조각(fleck): 진행 방향으로 늘어난 마름모. 흩어지는 마무리에 쓴다. */
export function fleck(c,x,y,vx,vy,size,col,a,stretch=.05){if(a<=0||size<=0)return;const sp=Math.hypot(vx,vy),L=Math.max(size*1.6,sp*stretch),ang=Math.atan2(vy,vx);
 c.save();c.translate(x,y);c.rotate(ang);c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.fillStyle=col;c.beginPath();c.moveTo(-L,0);c.lineTo(0,-size*.42);c.lineTo(L*.35,0);c.lineTo(0,size*.42);c.closePath();c.fill();c.restore();}

/** 갈라진 번개(뾰족한 끝): pts를 따라 마디마다 굵기가 바뀌는 붓획. */
export function brushBolt(c,pts,opt){brushStroke(c,pts,{tail:'sharp',head:'sharp',belly:.4,jag:.35,pow:.4,core:.5,...opt});}

/** 먹 획: 어두운 색을 그대로 칠한다(빛을 더하지 않음). 꼬리는 흐릿하게, 머리는 뾰족하게. rim을 주면 가장자리에 얇은 빛. */
export function inkStroke(c,pts,{w,alpha=1,color='#12061f',rim=null,head='sharp',tail='soft',belly=.6,jag=0,seed=1}={}){if(!pts||pts.length<2||alpha<=0||w<=0)return;const o={head,tail,belly,jag,seed};
 c.save();c.globalCompositeOperation='source-over';fillOutline(c,outline(pts,w,o,1),endFade(c,pts,color,alpha,o));
 if(rim){c.globalCompositeOperation='lighter';const ol=outline(pts,w,o,1);c.lineWidth=Math.max(.8,w*.08);c.strokeStyle=endFade(c,pts,rim,alpha*.7,o);c.beginPath();ol.left.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
 c.restore();}
/** 2차 곡선 위의 점들 (눈꼬리 같은 휘어진 획에 쓴다) */
export function quadPoints(x0,y0,cx,cy,x1,y1,n=18){const p=[];for(let i=0;i<=n;i++){const t=i/n,u=1-t;p.push([u*u*x0+2*u*t*cx+t*t*x1,u*u*y0+2*u*t*cy+t*t*y1]);}return p;}
