// v0.33 mental-collapse cut-in scenes. The collapse art is a transparent cut-out, so each breakdown
// gets its own animated backdrop behind the character (plus a few pieces in front), graded to the
// illustration: dark base, one strong theme hue, light leaking from behind the figure.
//   despair  — a pane of glass cracks behind the figure and its lit shards drift apart
//   panic    — dry-brush spirals turning at different speeds
//   frenzy   — a red void with concentric rings, a horizon laser and rushing red streaks
//   distrust — thorned chains crossing a green haze, glowing threads
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),out3=t=>1-Math.pow(1-clamp(t),3),in2=t=>clamp(t)*clamp(t);
function rnd(seed){let a=seed>>>0||1;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const hexA=(h,a)=>{const n=parseInt(h.slice(1),16);return `rgba(${n>>16&255},${n>>8&255},${n&255},${clamp(a)})`;};

export const COLLAPSE_THEMES=Object.freeze({
 despair:{base:'#0c0b26',mid:'#2c2a78',hue:'#6f72ff',light:'#d6dcff',title:'#e9ecff'},
 panic:{base:'#22062f',mid:'#5a1676',hue:'#b452d6',light:'#f0b8ff',title:'#ffd9fb'},
 frenzy:{base:'#160103',mid:'#7a0610',hue:'#ff2a2a',light:'#ffb24a',title:'#ffe0d6'},
 distrust:{base:'#03140f',mid:'#0c4a3a',hue:'#2fe0a0',light:'#b8ffe2',title:'#dcfff0'},
});

/** Crack network: radial polylines from a point and rings that join them into cells (shards). */
export function crackNetwork(w,h,{x=.62,y=.42,seed=7,radials=13,rings=4}={}){
 const R=rnd(seed),cx=w*x,cy=h*y,far=Math.hypot(Math.max(cx,w-cx),Math.max(cy,h-cy))*1.08,angles=[];
 for(let i=0;i<radials;i++)angles.push((i+R()*.55)/radials*TAU);
 const radii=[0,...Array.from({length:rings},(_,k)=>far*Math.pow((k+1)/(rings+1),1.35)*(.9+R()*.2)),far];
 const grid=angles.map(a=>radii.map((r,k)=>{if(!k)return [cx,cy];const j=k===radii.length-1?0:(R()-.5)*r*.09,aa=a+(R()-.5)*.06;return [cx+Math.cos(aa)*(r+j),cy+Math.sin(aa)*(r+j)];}));
 const radialPaths=grid.map(col=>{const pts=[col[0]];for(let k=1;k<col.length;k++){const [x0,y0]=pts[pts.length-1],[x1,y1]=col[k],n=k===1?2:3;for(let m=1;m<n;m++){const u=m/n,nx=-(y1-y0),ny=x1-x0,l=Math.hypot(nx,ny)||1,o=(R()-.5)*l*.05;pts.push([x0+(x1-x0)*u+nx/l*o,y0+(y1-y0)*u+ny/l*o]);}pts.push(col[k]);}return pts;});
 const shards=[];for(let i=0;i<radials;i++){const j=(i+1)%radials;for(let k=0;k<radii.length-1;k++){const poly=[grid[i][k],grid[i][k+1],grid[j][k+1],grid[j][k]];
  if(k>=2&&R()<.55){const m=[(grid[i][k][0]+grid[j][k+1][0])/2,(grid[i][k][1]+grid[j][k+1][1])/2];shards.push({poly:[grid[i][k],grid[i][k+1],m],k},{poly:[m,grid[i][k+1],grid[j][k+1],grid[j][k]],k},{poly:[grid[i][k],m,grid[j][k]],k});}
  else shards.push({poly,k});}}
 for(const s of shards){s.cx=s.poly.reduce((a,p)=>a+p[0],0)/s.poly.length;s.cy=s.poly.reduce((a,p)=>a+p[1],0)/s.poly.length;s.d=Math.hypot(s.cx-cx,s.cy-cy)/far;}
 return {cx,cy,far,radii,grid,radialPaths,shards};
}
function pathLen(p){let L=0;for(let i=1;i<p.length;i++)L+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return L;}
function partial(c,p,f){const T=pathLen(p)*f;let acc=0;c.beginPath();c.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++){const l=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);if(acc+l>=T){const u=(T-acc)/l;c.lineTo(p[i-1][0]+(p[i][0]-p[i-1][0])*u,p[i-1][1]+(p[i][1]-p[i-1][1])*u);break;}c.lineTo(p[i][0],p[i][1]);acc+=l;}}
function glowDot(c,x,y,r,col,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,hexA(col,a));g.addColorStop(1,hexA(col,0));c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);}

function backdrop(c,w,h,T,fx,fy,boost=1){const g=c.createRadialGradient(w*fx,h*fy,0,w*fx,h*fy,Math.hypot(w,h)*.7);g.addColorStop(0,T.mid);g.addColorStop(.55,T.base);g.addColorStop(1,'#000000');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.globalCompositeOperation='lighter';glowDot(c,w*fx,h*fy,Math.min(w,h)*.55,T.hue,.35*boost);c.globalCompositeOperation='source-over';}
function vignette(c,w,h){const g=c.createRadialGradient(w*.6,h*.45,Math.min(w,h)*.3,w*.6,h*.45,Math.hypot(w,h)*.62);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');c.fillStyle=g;c.fillRect(0,0,w,h);}
function motes(c,w,h,T,t,R0,n,{rise=18,size=2.2,col}={}){c.globalCompositeOperation='lighter';const R=rnd(R0);for(let i=0;i<n;i++){const x=R()*w,y0=R()*h,sp=rise*(.4+R()),y=((y0-t*sp)%h+h)%h,tw=.5+.5*Math.sin(t*(2+R()*3)+i),s=size*(.4+R());glowDot(c,x+Math.sin(t+i)*6,y,s*4,col||T.light,.55*tw);c.fillStyle=hexA('#ffffff',.8*tw);c.fillRect(x+Math.sin(t+i)*6-s/2,y-s/2,s,s);}c.globalCompositeOperation='source-over';}

const SCENES={
 despair(T,w,h,stage){const net=crackNetwork(w,h,{x:.63,y:.46,seed:11+stage,radials:stage===2?18:14,rings:4}),R=rnd(5);
  for(const s of net.shards){s.dir=Math.atan2(s.cy-net.cy,s.cx-net.cx);s.push=(12+R()*30)*(.4+s.d);s.rot=(R()-.5)*.12;s.lit=.15+.85*(1-s.d)*(.6+R()*.4);s.sheen=R()*TAU;}
  const fliers=Array.from({length:stage===2?16:10},()=>({a:R()*TAU,v:.18+R()*.25,s:10+R()*26,r:R()*TAU,vr:(R()-.5)*2,front:R()<.35}));
  return {back(c,t){const crack=out3(t/.45),open=out3((t-.35)/1.6);backdrop(c,w,h,T,.63,.46,1+.4*crack);
    // shards lit from behind, drifting apart
    for(const s of net.shards){const ox=Math.cos(s.dir)*s.push*open,oy=Math.sin(s.dir)*s.push*open;c.save();c.translate(s.cx+ox,s.cy+oy);c.rotate(s.rot*open);c.translate(-s.cx,-s.cy);
     c.beginPath();s.poly.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();
     const g=c.createLinearGradient(s.cx+Math.cos(s.sheen)*60,s.cy+Math.sin(s.sheen)*60,s.cx-Math.cos(s.sheen)*60,s.cy-Math.sin(s.sheen)*60);g.addColorStop(0,hexA(T.mid,.55*crack));g.addColorStop(.5,hexA(T.hue,.22*s.lit*crack));g.addColorStop(1,hexA(T.base,.6*crack));c.fillStyle=g;c.fill();
     c.strokeStyle=hexA(T.light,.18*crack);c.lineWidth=1;c.stroke();c.restore();}
    // light bursting through the cracks
    c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';
    net.radialPaths.forEach((p,i)=>{const f=clamp(crack*1.1-(i%4)*.05);if(f<=0)return;partial(c,p,f);c.strokeStyle=hexA(T.hue,.28);c.lineWidth=10;c.stroke();c.strokeStyle=hexA(T.light,.7);c.lineWidth=2.2;c.stroke();c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=.9;c.stroke();});
    for(let k=1;k<net.radii.length-1;k++){const f=clamp((crack-.3-k*.12)/.3);if(f<=0)continue;for(let i=0;i<net.grid.length;i++){const a=net.grid[i][k],b=net.grid[(i+1)%net.grid.length][k];c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f);c.strokeStyle=hexA(T.light,.5);c.lineWidth=1.4;c.stroke();}}
    glowDot(c,net.cx,net.cy,Math.min(w,h)*(.22+.06*Math.sin(t*3)),T.light,.55*crack);
    c.globalCompositeOperation='source-over';vignette(c,w,h);motes(c,w,h,T,t,3,stage===2?60:40,{rise:14,size:2});
    for(const f of fliers)if(!f.front)this.flier(c,f,t);},
   front(c,t){for(const f of fliers)if(f.front)this.flier(c,f,t,true);},
   flier(c,f,t,front){const u=((t*f.v+f.a/TAU)%1),d=Math.hypot(w,h)*(.12+u*.9),x=net.cx+Math.cos(f.a)*d,y=net.cy+Math.sin(f.a)*d*.8,s=f.s*(front?1.8:1)*(.6+u),a=out3(t/.6)*(1-in2(u))*(front?.75:.9);if(a<=0)return;
    c.save();c.translate(x,y);c.rotate(f.r+t*f.vr);c.scale(1,Math.abs(Math.cos(t*f.vr*1.3))+.15);if(front)c.filter='blur(2px)';c.beginPath();c.moveTo(0,-s);c.lineTo(s*.42,-s*.1);c.lineTo(s*.12,s*.8);c.lineTo(-s*.4,s*.2);c.closePath();
    c.fillStyle=hexA(front?T.base:T.mid,a*.9);c.fill();c.strokeStyle=hexA(T.light,a);c.lineWidth=1.2;c.stroke();c.filter='none';c.restore();}};},
 panic(T,w,h,stage){const R=rnd(23),sp=Array.from({length:stage===2?22:16},()=>({x:R()*w*1.1-w*.05,y:R()*h*1.1-h*.05,r:50+R()*120,turns:1.6+R()*1.4,v:(R()<.5?-1:1)*(.3+R()*.6),ph:R()*TAU,a:.35+R()*.45}));
  const spiral=(c,s,t,scale,alpha)=>{const pts=[];const n=90;for(let i=0;i<=n;i++){const u=i/n,ang=s.ph+t*s.v+u*s.turns*TAU,rr=s.r*scale*u;pts.push([s.x+Math.cos(ang)*rr,s.y+Math.sin(ang)*rr]);}
   for(let k=0;k<3;k++){c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x+k*1.6,y-k*1.1):c.moveTo(x,y));c.strokeStyle=hexA(k?T.hue:T.light,alpha*(k?.55:.4));c.lineWidth=s.r*.14*(k?1:.5);c.lineCap='round';c.stroke();}};
  return {back(c,t){const o=out3(t/.6);backdrop(c,w,h,T,.6,.45,1);for(const s of sp)spiral(c,s,t,.6+.4*o+.04*Math.sin(t*2+s.ph),s.a*o);vignette(c,w,h);motes(c,w,h,T,t,9,30,{rise:-10,size:2.4});},
   front(c,t){const o=out3(t/.6);c.globalCompositeOperation='lighter';for(let i=0;i<2;i++)spiral(c,{x:w*(.08+i*.86),y:h*(.85-i*.6),r:90,turns:2.2,v:i?.8:-.8,ph:i},t,o,.5);c.globalCompositeOperation='source-over';}};},
 frenzy(T,w,h,stage){const R=rnd(41),cx=w*.62,cy=h*.47,streaks=Array.from({length:stage===2?26:16},()=>({a:R()*TAU,v:.6+R()*1.2,l:.2+R()*.4,ph:R()})),embers=Array.from({length:40},()=>({a:R()*TAU,v:40+R()*140,ph:R()*3}));
  return {back(c,t){const o=out3(t/.45),m=Math.min(w,h);backdrop(c,w,h,T,.62,.47,1.3);
    // dark void behind the figure
    const v=c.createRadialGradient(cx,cy,0,cx,cy,m*.55*o);v.addColorStop(0,'rgba(0,0,0,.95)');v.addColorStop(.7,'rgba(10,0,0,.85)');v.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=v;c.fillRect(0,0,w,h);
    c.globalCompositeOperation='lighter';
    for(let k=0;k<4;k++){const r=m*(.42+k*.16)*o*(1+.02*Math.sin(t*6+k)),sweep=TAU*(k%2?.7:.9),rot=t*(k%2?-.6:.4)+k;c.beginPath();c.arc(cx,cy,r,rot,rot+sweep);c.strokeStyle=hexA(T.hue,.8-k*.15);c.lineWidth=k?2:5;c.stroke();c.strokeStyle=hexA(T.hue,.18);c.lineWidth=k?10:22;c.stroke();}
    for(const s of streaks){const u=(t*s.v+s.ph)%1,r0=m*(.3+u*1.1),r1=r0+m*s.l*(1-u);c.beginPath();c.moveTo(cx+Math.cos(s.a)*r0,cy+Math.sin(s.a)*r0);c.lineTo(cx+Math.cos(s.a)*r1,cy+Math.sin(s.a)*r1);c.strokeStyle=hexA(T.hue,.55*(1-u)*o);c.lineWidth=2+3*(1-u);c.stroke();}
    // horizon laser, flickering
    const lw=(6+3*Math.sin(t*40))*o,ly=cy+m*.05;const g=c.createLinearGradient(0,ly-lw*4,0,ly+lw*4);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,hexA(T.light,.95));g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,ly-lw*4,w,lw*8);c.fillStyle='rgba(255,240,200,.9)';c.fillRect(0,ly-lw*.25,w*o,lw*.5);
    for(const e of embers){const u=((t+e.ph)%3)/3,x=cx+Math.cos(e.a)*e.v*u*4,y=cy+Math.sin(e.a)*e.v*u*3-u*60;glowDot(c,x,y,5,T.light,.8*(1-u));}
    c.globalCompositeOperation='source-over';vignette(c,w,h);},
   front(c,t){c.globalCompositeOperation='lighter';const R2=rnd(Math.floor(t*12));for(let i=0;i<3;i++){const y=R2()*h,x=R2()*w;c.fillStyle=hexA(T.hue,.25);c.fillRect(x-w*.2,y,w*.4,1.5);}c.globalCompositeOperation='source-over';}};},
 distrust(T,w,h,stage){const R=rnd(67),chains=Array.from({length:stage===2?6:4},(_,i)=>({y:h*(.25+R()*.6),tilt:(R()-.5)*.5,v:(R()<.5?-1:1)*(30+R()*40),front:i===0||(stage===2&&i===3),size:.9+R()*.5}));
  const chain=(c,ch,t,blur)=>{const L=Math.hypot(w,h)*1.2,step=34*ch.size;c.save();c.translate(w/2,ch.y);c.rotate(ch.tilt);if(blur)c.filter='blur(3px)';
   for(let x=-L/2+((t*ch.v)%(step*2));x<L/2;x+=step){const i=Math.round(x/step);c.save();c.translate(x,0);c.strokeStyle=blur?'#020806':hexA(T.mid,.95);c.lineWidth=7*ch.size;c.beginPath();if(i%2)c.ellipse(0,0,step*.62,step*.28,0,0,TAU);else{c.moveTo(-step*.55,0);c.lineTo(step*.55,0);}c.stroke();
    c.strokeStyle=blur?'#03100b':hexA(T.hue,.55);c.lineWidth=1.4;c.stroke();if(i%3===0){c.fillStyle=blur?'#020806':hexA(T.mid,1);c.beginPath();c.moveTo(-4,0);c.lineTo(0,-18*ch.size);c.lineTo(4,0);c.moveTo(4,0);c.lineTo(0,16*ch.size);c.lineTo(-4,0);c.fill();}c.restore();}
   c.filter='none';c.restore();};
  return {back(c,t){const o=out3(t/.6);backdrop(c,w,h,T,.6,.4,1);c.globalCompositeOperation='lighter';for(let i=0;i<5;i++){const y=h*(.18+i*.17)+Math.sin(t+i)*8;const g=c.createLinearGradient(0,y-6,0,y+6);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,hexA(T.hue,.35*o));g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,y-6,w*o,12);}
    c.globalCompositeOperation='source-over';c.globalAlpha=o;for(const ch of chains)if(!ch.front)chain(c,ch,t,false);c.globalAlpha=1;vignette(c,w,h);motes(c,w,h,T,t,13,40,{rise:12,size:2.2});},
   front(c,t){c.globalAlpha=out3(t/.6);for(const ch of chains)if(ch.front)chain(c,ch,t,true);c.globalAlpha=1;}};},
};

function layer(parent,cls,z){const c=document.createElement('canvas');c.className=cls;c.setAttribute('aria-hidden','true');Object.assign(c.style,{position:'absolute',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:String(z)});return c;}
/**
 * Build the scene inside a cut-in (.unframed-cutin): backdrop canvas under the art, foreground canvas over it.
 * options: {type, stage, hold (seconds, freeze for QA), short}. Runs until the cut-in is removed.
 */
export function collapseScene(root,{type='despair',stage=1,hold,short=false}={}){
 if(!root?.isConnected)return;const T=COLLAPSE_THEMES[type]||COLLAPSE_THEMES.despair,r=root.getBoundingClientRect(),w=r.width,h=r.height,dpr=Math.min(2,devicePixelRatio||1);
 root.dataset.breakdown=type;const back=layer(root,'collapse-back',0),front=layer(root,'collapse-front',2);root.prepend(back);const win=root.querySelector('.cutin-art-window');(win?win.after(front):root.append(front));
 for(const cv of [back,front]){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr);}
 const scene=SCENES[type]?.(T,w,h,stage)||SCENES.despair(T,w,h,stage),bc=back.getContext('2d'),fc=front.getContext('2d'),start=performance.now();
 const draw=t=>{for(const [c,f] of [[bc,'back'],[fc,'front']]){c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,w,h);c.globalAlpha=1;c.globalCompositeOperation='source-over';scene[f]?.(c,t);}};
 if(Number.isFinite(hold)){draw(hold);return;}
 const tick=now=>{if(!back.isConnected)return;draw((now-start)/1000*(short?2:1));requestAnimationFrame(tick);};requestAnimationFrame(tick);
}
