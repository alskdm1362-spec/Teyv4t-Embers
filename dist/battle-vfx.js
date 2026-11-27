// v0.33 battle effects: soft, natural 2D VFX drawn in code — additive glow sprites, particles with drag
// and gravity, motion-blurred streaks, gradient slash trails, shockwaves, flames, lightning and glints.
// Continuous time (no stepped frames). One canvas per layer: under cut-ins (47) and above them (80).
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const out3=t=>1-Math.pow(1-clamp(t),3),out5=t=>1-Math.pow(1-clamp(t),5),in2=t=>clamp(t)*clamp(t),bell=t=>Math.sin(Math.PI*clamp(t));
function rnd(seed){let a=seed>>>0||1;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const hex=h=>{const n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255];};
const rgba=(h,a)=>{const [r,g,b]=hex(h);return `rgba(${r},${g},${b},${clamp(a)})`;};

// Colour sets: core (near white), main, deep, and an accent used for sparks.
export const VFX_COLORS=Object.freeze({
 ice:{core:'#f4fdff',main:'#7fd8ff',deep:'#2a6fd6',spark:'#c8f4ff'},
 hellfire:{core:'#ffd9b0',main:'#ff3b1f',deep:'#7a0a0a',spark:'#ff8a3a',smoke:'#120406'},
 lantern:{core:'#fffbe8',main:'#ffd36b',deep:'#d98a1c',spark:'#fff0b0'},
 kick:{core:'#fff4fb',main:'#ff6fb6',deep:'#c2207a',spark:'#8ff6ff'},
 gale:{core:'#effffb',main:'#4fe0c4',deep:'#0f8a7a',spark:'#bafff0'},
 storm:{core:'#eef0ff',main:'#6d78ff',deep:'#262c9e',spark:'#b9c1ff'},
 venom:{core:'#eaffd9',main:'#3fa34a',deep:'#0f3d1a',spark:'#9be07a'},
 abyss:{core:'#ffe6fb',main:'#d24ad0',deep:'#4a0e66',spark:'#ff9bf0',smoke:'#14051e'},
 holy:{core:'#fffdf0',main:'#ffe08a',deep:'#c58a25',spark:'#fff4c4'},
 glint:{core:'#ffffff',main:'#fff3c2',deep:'#ffbf4a',spark:'#ffffff'},
 heal:{core:'#fff8e6',main:'#ffb04a',deep:'#e0521c',spark:'#ffe39a'},
 jungle:{core:'#f2ffe8',main:'#63e08a',deep:'#127a3a',spark:'#c9ffb0'},
 show:{core:'#fff2e2',main:'#ff6a4a',deep:'#a81c3a',spark:'#ffd08a',smoke:'#1a0508'},
 judge:{core:'#f6eaff',main:'#b06bff',deep:'#4a1a9e',spark:'#e0c4ff'},
});
const glowCache=new Map(),flameCache=new Map();
// One pre-rendered flame tongue per colour set; particles only scale and rotate it.
function flameSprite(cs){const k=cs.join();if(flameCache.has(k))return flameCache.get(k);const c=document.createElement('canvas');c.width=44;c.height=112;const g=c.getContext('2d'),h=80,w=20;g.translate(22,80);
 const gr=g.createRadialGradient(0,-h*.05,0,0,-h*.2,h*.95);gr.addColorStop(0,rgba(cs[0],1));gr.addColorStop(.35,rgba(cs[1],.95));gr.addColorStop(.7,rgba(cs[2],.6));gr.addColorStop(1,rgba(cs[2],0));g.fillStyle=gr;
 g.beginPath();g.moveTo(0,-h);g.bezierCurveTo(w*.6,-h*.55,w*1.1,-h*.1,w,h*.15);g.arc(0,h*.15,w,0,Math.PI);g.bezierCurveTo(-w*1.1,-h*.1,-w*.6,-h*.55,0,-h);g.fill();flameCache.set(k,c);return c;}
function glow(color,soft=.55){const k=color+soft;if(glowCache.has(k))return glowCache.get(k);const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
 gr.addColorStop(0,rgba(color,1));gr.addColorStop(soft*.35,rgba(color,.55));gr.addColorStop(soft,rgba(color,.16));gr.addColorStop(1,rgba(color,0));g.fillStyle=gr;g.fillRect(0,0,128,128);glowCache.set(k,c);return c;}

// ---------- particles ----------
class Particle{constructor(o){Object.assign(this,{x:0,y:0,vx:0,vy:0,ay:0,drag:2,life:.6,age:0,size:6,size1:null,color:'#fff',alpha:1,kind:'glow',rot:0,vr:0,stretch:0,blend:'lighter',ramp:null},o);if(this.size1==null)this.size1=this.size*.2;}
 step(dt){this.age+=dt;const d=Math.exp(-this.drag*dt);this.vx*=d;this.vy=this.vy*d+this.ay*dt;this.x+=this.vx*dt;this.y+=this.vy*dt;this.rot+=this.vr*dt;return this.age<this.life;}
 draw(c){const u=this.age/this.life,a=this.alpha*(this.kind==='smoke'?bell(Math.min(1,u*1.6))*(1-u):1-in2(u)),sz=lerp(this.size,this.size1,out3(u)),col=this.ramp?this.ramp[Math.min(this.ramp.length-1,Math.floor(u*this.ramp.length))]:this.color;if(a<=.01||sz<=.2)return;
  c.globalCompositeOperation=this.blend;c.globalAlpha=a;
  if(this.kind==='spark'){const sp=Math.hypot(this.vx,this.vy),L=Math.max(sz,sp*this.stretch);c.save();c.translate(this.x,this.y);c.rotate(Math.atan2(this.vy,this.vx));const g=c.createLinearGradient(-L,0,0,0);g.addColorStop(0,rgba(col,0));g.addColorStop(1,rgba(col,1));c.strokeStyle=g;c.lineWidth=sz*.45;c.lineCap='round';c.beginPath();c.moveTo(-L,0);c.lineTo(0,0);c.stroke();c.restore();return;}
  if(this.kind==='shard'){c.save();c.translate(this.x,this.y);c.rotate(this.rot);c.fillStyle=col;c.beginPath();c.moveTo(0,-sz);c.lineTo(sz*.35,0);c.lineTo(0,sz*.7);c.lineTo(-sz*.3,0);c.closePath();c.fill();c.restore();c.globalCompositeOperation='lighter';c.globalAlpha=a*.5;c.drawImage(glow(col),this.x-sz*1.5,this.y-sz*1.5,sz*3,sz*3);return;}
  if(this.kind==='smoke'){c.save();c.translate(this.x,this.y);c.rotate(this.rot);const g=c.createRadialGradient(0,0,0,0,0,sz);g.addColorStop(0,rgba(col,.9));g.addColorStop(.6,rgba(col,.45));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.ellipse(0,0,sz,sz*.82,0,0,TAU);c.fill();c.restore();return;}
  if(this.kind==='glint'){drawGlint(c,this.x,this.y,sz,col,this.rot);return;}
  if(this.kind==='flame'){const h=sz*(2.1+.5*Math.sin(this.age*31+this.rot)),w=sz*(.42+.1*Math.sin(this.age*23+this.rot*2));c.save();c.translate(this.x,this.y);c.rotate(Math.atan2(this.vx,-this.vy)*.6);c.drawImage(flameSprite(this.cols),-w*1.1,-h,w*2.2,h*1.4);c.restore();return;}
  c.drawImage(glow(col),this.x-sz,this.y-sz,sz*2,sz*2);}
}
function drawGlint(c,x,y,r,col,rot=0){c.save();c.translate(x,y);c.rotate(rot);c.globalCompositeOperation='lighter';for(const [L,w] of [[r,r*.09],[r*.55,r*.07]]){for(let k=0;k<2;k++){c.save();c.rotate(k*Math.PI/2+(L<r?Math.PI/4:0));const g=c.createLinearGradient(-L,0,L,0);g.addColorStop(0,rgba(col,0));g.addColorStop(.5,rgba('#ffffff',1));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.moveTo(-L,0);c.quadraticCurveTo(0,-w,L,0);c.quadraticCurveTo(0,w,-L,0);c.fill();c.restore();}}
 c.drawImage(glow(col),-r*.6,-r*.6,r*1.2,r*1.2);c.restore();}

// ---------- primitives drawn from effect time ----------
function flash(c,x,y,r,col,a){if(a<=0)return;c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);c.drawImage(glow(col,.7),x-r,y-r,r*2,r*2);}
function ring(c,x,y,r,w,col,a,squash=1){a*=.32;w*=1.8;if(a<=0||r<=0)return;c.save();c.translate(x,y);c.scale(1,squash);c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);const g=c.createRadialGradient(0,0,Math.max(0,r-w),0,0,r+w*.3);g.addColorStop(0,rgba(col,0));g.addColorStop(.75,rgba(col,.9));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.arc(0,0,r+w*.3,0,TAU);c.arc(0,0,Math.max(0,r-w),0,TAU,true);c.fill();c.restore();}
// A slash trail: an arc whose width tapers to both ends and whose head is bright.
function arcTrail(c,x,y,r,a0,a1,head,w,cols,a,squash=1){if(a<=0)return;const n=40,span=a1-a0;c.save();c.translate(x,y);c.scale(1,squash);c.globalCompositeOperation='lighter';
 for(let pass=0;pass<3;pass++){const ww=w*[1.9,1,.38][pass],col=[cols.deep,cols.main,cols.core][pass],al=a*[.35,.8,1][pass];c.beginPath();
  for(let i=0;i<=n;i++){const u=i/n;if(u>head)break;const ang=a0+span*u,rel=u/Math.max(.001,head),thick=ww*Math.pow(Math.sin(Math.PI*Math.min(1,rel*.55+.45*Math.pow(rel,3))),.7)*(.25+.75*rel);c.lineTo(Math.cos(ang)*(r+thick*.5),Math.sin(ang)*(r+thick*.5));}
  for(let i=n;i>=0;i--){const u=i/n;if(u>head)continue;const ang=a0+span*u,rel=u/Math.max(.001,head),thick=ww*Math.pow(Math.sin(Math.PI*Math.min(1,rel*.55+.45*Math.pow(rel,3))),.7)*(.25+.75*rel);c.lineTo(Math.cos(ang)*(r-thick*.5),Math.sin(ang)*(r-thick*.5));}
  c.closePath();const g=c.createLinearGradient(Math.cos(a0)*r,Math.sin(a0)*r,Math.cos(a0+span*head)*r,Math.sin(a0+span*head)*r);g.addColorStop(0,rgba(col,0));g.addColorStop(.6,rgba(col,al*.6));g.addColorStop(1,rgba(col,al));c.fillStyle=g;c.fill();}
 c.restore();}
function streak(c,x0,y0,x1,y1,w,cols,a){if(a<=0)return;c.save();c.globalCompositeOperation='lighter';const ang=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);c.translate(x0,y0);c.rotate(ang);
 for(const [k,col,al] of [[2.4,cols.deep,.35],[1,cols.main,.85],[.35,cols.core,1]]){const g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,rgba(col,0));g.addColorStop(.7,rgba(col,al*a*.7));g.addColorStop(1,rgba(col,al*a));c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(L*.8,-w*k,L,0);c.quadraticCurveTo(L*.8,w*k,0,0);c.fill();}
 c.restore();}
function bolt(c,pts,w,cols,a){if(a<=0)return;c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';for(const [k,col,al] of [[4,cols.deep,.4],[1.8,cols.main,.9],[.6,cols.core,1]]){c.globalAlpha=clamp(a*al);c.strokeStyle=col;c.lineWidth=w*k;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}c.restore();}
function boltPath(x0,y0,x1,y1,R,seg=10,amp=18){const pts=[[x0,y0]];for(let i=1;i<seg;i++){const u=i/seg,nx=-(y1-y0),ny=x1-x0,l=Math.hypot(nx,ny)||1,o=(R()-.5)*2*amp*Math.sin(Math.PI*u);pts.push([x0+(x1-x0)*u+nx/l*o,y0+(y1-y0)*u+ny/l*o]);}pts.push([x1,y1]);return pts;}
function rays(c,x,y,r,n,col,a,rot,width=.12){if(a<=0)return;c.save();c.translate(x,y);c.rotate(rot);c.globalCompositeOperation='lighter';c.globalAlpha=clamp(a);for(let i=0;i<n;i++){c.rotate(TAU/n);const L=r*(.6+.4*Math.sin(i*2.7)),g=c.createLinearGradient(0,0,L,0);g.addColorStop(0,rgba(col,.9));g.addColorStop(1,rgba(col,0));c.fillStyle=g;c.beginPath();c.moveTo(0,0);c.lineTo(L,-L*width);c.lineTo(L,L*width);c.closePath();c.fill();}c.restore();}

// ---------- effect builders. Each returns {dur, spawn(sys,t0..t1), draw(c,t)} in local coordinates ----------
function burst(sys,x,y,cols,R,{n=14,speed=420,size=5,life=.45,spark=true,shard=false,up=0,spread=TAU,dir=0}={}){for(let i=0;i<n;i++){const a=dir+(R()-.5)*spread,v=speed*(.35+R()*.8);sys.add(new Particle({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-up,ay:shard?900:260,drag:shard?1.2:4.5,life:life*(.6+R()*.7),size:size*(.6+R()*.8),color:R()<.4?cols.core:R()<.7?cols.spark:cols.main,kind:shard?'shard':spark?'spark':'glow',stretch:.045,rot:R()*TAU,vr:(R()-.5)*16}));}}
function motes(sys,x,y,cols,R,{n=10,r=40,rise=90,life=1,size=5,kind='glow'}={}){for(let i=0;i<n;i++){const a=R()*TAU,d=r*Math.sqrt(R());sys.add(new Particle({x:x+Math.cos(a)*d,y:y+Math.sin(a)*d*.6,vx:(R()-.5)*30,vy:-rise*(.4+R()*.8),drag:1.2,life:life*(.6+R()*.6),size:size*(.6+R()*.9),size1:size*.2,color:R()<.5?cols.core:cols.main,kind,rot:R()*TAU}));}}
function impact(cols,{r=46,sparks=14,ring:rg=true,shards=false}={}){let done=false;return {dur:.55,spawn(sys,t,R,s){if(!done&&t>=0){done=true;burst(sys,0,0,cols,R,{n:sparks,speed:520*s,size:6*s,shard:shards});}},
 draw(c,t,s){flash(c,0,0,r*s*(1.1+.6*out3(t/.18)),cols.main,1-t/.3);flash(c,0,0,r*.55*s,cols.core,1-t/.16);if(t<.14)drawGlint(c,0,0,r*1.3*s*(1-t/.14*.4),cols.main,.3);if(rg)ring(c,0,0,r*s*(.4+1.4*out3(t/.4)),9*s*(1-t/.4),cols.main,1-t/.4,.55);}};}
const FX={
 // Lohen: a spear thrust — a long tapered streak that snaps to the target, then a frost flash and ice shards.
 thrust(cols,{from,len=180}){let hit=false;return {dur:.7,spawn(sys,t,R,s){if(!hit&&t>=.09){hit=true;burst(sys,0,0,cols,R,{n:16,speed:560*s,size:6*s,spread:1.6,dir:0});burst(sys,0,0,cols,R,{n:8,speed:320*s,size:9*s,shard:true});motes(sys,0,0,{...cols,main:'#dff6ff'},R,{n:8,r:30*s,rise:30*s,life:.9,size:12*s,kind:'smoke'});}},
  draw(c,t,s){const sx=from?Math.max(-len*s,from.x*.55):-len*s,head=out5(t/.09),tail=in2((t-.06)/.3),x0=lerp(sx,0,tail*.9),x1=lerp(sx,10*s,head);if(t<.36)streak(c,x0,0,x1,0,7*s,cols,1-tail);
   if(t>=.09){const u=t-.09;flash(c,0,0,70*s,cols.main,1-u/.25);drawGlint(c,0,0,90*s*(1-u/.35),cols.main,0);ring(c,0,0,24*s+120*s*out3(u/.4),10*s,cols.core,1-u/.4,.45);}}};},
 // Lohen ultimate: three thrown daggers in a quick fan, each landing with a frost burst.
 daggers(cols,{from}){const hits=[.16,.24,.32];let n=0;const off=[[-10,-18],[6,4],[-4,20]];return {dur:.95,spawn(sys,t,R,s){while(n<3&&t>=hits[n]){const [ox,oy]=off[n];burst(sys,ox*s,oy*s,cols,R,{n:10,speed:460*s,size:5*s,spread:1.8});burst(sys,ox*s,oy*s,cols,R,{n:5,speed:260*s,size:8*s,shard:true});n++;}},
  draw(c,t,s){const f=from||{x:-300*s,y:-40*s};for(let i=0;i<3;i++){const t0=hits[i]-.12,u=(t-t0)/.12,[ox,oy]=off[i];if(u<0)continue;const tx=ox*s,ty=oy*s;
   if(u<1){const k=out3(u),x=lerp(f.x,tx,k),y=lerp(f.y,ty,k)-Math.sin(Math.PI*k)*30*s,ang=Math.atan2(ty-f.y,tx-f.x);streak(c,x-Math.cos(ang)*90*s,y-Math.sin(ang)*90*s,x,y,4*s,cols,1);
    c.save();c.translate(x,y);c.rotate(ang);c.globalCompositeOperation='lighter';c.fillStyle=cols.core;c.beginPath();c.moveTo(10*s,0);c.lineTo(-8*s,-3*s);c.lineTo(-8*s,3*s);c.closePath();c.fill();c.restore();}
   else{const v=(t-hits[i]);flash(c,tx,ty,55*s,cols.main,1-v/.25);drawGlint(c,tx,ty,60*s*(1-v/.3),cols.main,i);ring(c,tx,ty,14*s+70*s*out3(v/.35),6*s,cols.core,1-v/.35,.5);}}}};},
 // Durin: black-and-red fire that wraps the target and climbs.
 hellfire(cols,{big=false}){let last=0;const D=big?1.5:1.05;return {dur:D+.6,spawn(sys,t,R,s){const S=s*(big?1.6:1);while(last<Math.min(t,D)){last+=1/100;const a=R()*TAU,d=(big?46:30)*S*Math.sqrt(R());const x=Math.cos(a)*d,y=Math.sin(a)*d*.45+20*S;
   sys.add(new Particle({x,y,vx:(R()-.5)*40*S,vy:-(150+R()*150)*S,drag:1.8,life:.5+R()*.35,size:(13+R()*11)*S,size1:2*S,kind:'flame',cols:R()<.25?['#ffb070','#ff3a14','#8a0606']:['#ff4a20','#b80c0a','#300104'],alpha:.72,blend:'lighter',rot:R()*9}));
   if(R()<.6)sys.add(new Particle({x:x*.9,y,vx:(R()-.5)*30*S,vy:-(140+R()*130)*S,drag:1.8,life:.55+R()*.4,size:(17+R()*13)*S,size1:3*S,kind:'flame',cols:['#000000','#0c0006','#3a0410'],blend:'source-over',alpha:.9,rot:R()*9}));if(R()<.25)sys.add(new Particle({x,y:y-20*S,vx:(R()-.5)*20*S,vy:-(90+R()*80)*S,drag:1.2,life:.9+R()*.4,size:(16+R()*14)*S,size1:30*S,color:'#0a0206',kind:'smoke',blend:'source-over',alpha:.55,rot:R()*TAU}));
   if(R()<.18)sys.add(new Particle({x,y,vx:(R()-.5)*120*S,vy:-(220+R()*200)*S,drag:1,ay:-60*S,life:.9+R()*.6,size:3*S,kind:'spark',color:'#ff8a3a',stretch:.04}));}},
  draw(c,t,s){const S=s*(big?1.6:1);flash(c,0,10*S,100*S,'#c8160c',.5*bell(t/D));flash(c,0,0,46*S,'#ff7a3a',(1-t/.25)*.8);if(big)ring(c,0,30*S,30*S+180*S*out3(t/.6),16*S,'#ff4a1f',1-t/.6,.35);}};},
 // Illuga: a long spear sweep — a gradient crescent with a bright head and sparks shed along it.
 slash(cols,{r=70,a0=-2.5,a1=.75,w=26,squash=.8,big=false}){let shed=0;const D=.5;return {dur:.75,spawn(sys,t,R,s){const S=s*(big?1.4:1);while(shed<Math.min(t,.16)){shed+=1/120;const u=shed/.16,ang=a0+(a1-a0)*out3(u),mid=(a0+a1)/2;sys.add(new Particle({x:Math.cos(ang)*r*S-Math.cos(mid)*r*S*.45,y:(Math.sin(ang)-Math.sin(mid)*.45)*r*S*squash,vx:-Math.sin(ang)*200*S*Math.sign(a1-a0),vy:Math.cos(ang)*200*S*squash*Math.sign(a1-a0),drag:5,life:.35+R()*.25,size:4*S,color:R()<.5?cols.spark:cols.core,kind:'spark',stretch:.05}));}
   if(t>=.12&&!this.hit){this.hit=true;burst(sys,0,0,cols,R,{n:12,speed:420*S,size:5*S});}},
  draw(c,t,s){const S=s*(big?1.4:1),head=out3(t/.16),fade=1-in2((t-.1)/.4),mid=(a0+a1)/2;arcTrail(c,-Math.cos(mid)*r*S*.45,-Math.sin(mid)*r*S*squash*.45,r*S,a0,a1,head,w*S,cols,fade,squash);if(t>.12){const v=t-.12;flash(c,0,0,60*S,cols.main,1-v/.25);ring(c,0,0,10*S+80*S*out3(v/.35),7*S,cols.core,1-v/.35,.5);}}};},
 // Illuga's lantern: warm light opens from the lantern bearer and settles on an ally as a halo shield.
 lantern(cols,{r=58}){let n=0;return {dur:1.1,spawn(sys,t,R,s){while(n<Math.min(36,t*60)){n++;const a=R()*TAU,d=r*s*(.6+R()*.5);sys.add(new Particle({x:Math.cos(a)*d,y:Math.sin(a)*d*.9-10*s,vx:-Math.cos(a)*30*s,vy:-30*s-R()*30*s,drag:1.5,life:.6+R()*.5,size:(3+R()*4)*s,color:R()<.5?cols.core:cols.main,kind:R()<.25?'glint':'glow',rot:R()}));}},
  draw(c,t,s){const o=out3(t/.25),f=1-in2((t-.55)/.55),rr=r*s*(.75+.25*o);flash(c,0,-10*s,rr*2.2,cols.deep,.35*o*f);flash(c,0,-10*s,rr*1.2,cols.main,.5*o*f);rays(c,0,-10*s,rr*1.9,12,cols.main,.45*o*f,t*.6,.07);
   c.save();c.globalCompositeOperation='lighter';c.globalAlpha=.35*o*f;c.strokeStyle=cols.core;c.lineWidth=1.5*s;c.beginPath();c.ellipse(0,-10*s,rr,rr*1.08,0,0,TAU);c.stroke();c.globalAlpha=.4*o*f;c.lineWidth=7*s;c.strokeStyle=cols.main;c.stroke();c.restore();
   drawGlint(c,-rr*.55,-rr*.75,26*s*bell(t/.6),cols.main,.4);}};},
 // Jahoda / Nefer: a kick — a short curved swoosh that ends in a punchy impact and a dust ring.
 kick(cols,{rise=false,big=false}){const hits=big?[.1,.22,.36]:[.1];let n=0;return {dur:big?.95:.65,spawn(sys,t,R,s){while(n<hits.length&&t>=hits[n]){const ox=(n-1)*16*s*(big?1:0),oy=(n%2?-14:8)*s*(big?1:0);burst(sys,ox,oy,cols,R,{n:14,speed:520*s,size:5.5*s});n++;}},
  draw(c,t,s){hits.forEach((h,i)=>{const u=(t-h+.1)/.1,ox=(i-1)*16*s*(big?1:0),oy=(i%2?-14:8)*s*(big?1:0),a0=rise||i%2?2.4:-2.6,a1=rise||i%2?.3:-.6;if(u>0&&u<3.5){arcTrail(c,ox-30*s,oy,46*s,a0,a1,out3(u),20*s,cols,1-in2((u-1)/2.5),.7);}
   const v=t-h;if(v>=0){flash(c,ox,oy,70*s,cols.main,1-v/.22);drawGlint(c,ox,oy,72*s*(1-v/.25),cols.main,.5+i);ring(c,ox,oy,12*s+90*s*out3(v/.35),9*s,cols.core,1-v/.35,.5);}});}};},
 // Varka: a giant greatsword arc riding a teal gale.
 greatsword(cols){let wind=0;return {dur:1,spawn(sys,t,R,s){while(wind<Math.min(t,.4)){wind+=1/70;const a=R()*TAU,y=(R()-.5)*120*s;sys.add(new Particle({x:-160*s+R()*60*s,y,vx:(520+R()*280)*s,vy:(R()-.5)*60*s,drag:1.6,life:.45+R()*.3,size:3*s,color:R()<.5?cols.core:cols.main,kind:'spark',stretch:.09}));}
   if(t>=.2&&!this.hit){this.hit=true;burst(sys,0,0,cols,R,{n:18,speed:600*s,size:6*s});motes(sys,0,0,cols,R,{n:10,r:50*s,rise:60*s,life:.9,size:20*s,kind:'smoke'});}},
  draw(c,t,s){const head=out3((t-.04)/.18),fade=1-in2((t-.2)/.5);const gx=-Math.cos(-.95)*55*s,gy=-Math.sin(-.95)*55*s*.62;arcTrail(c,gx,gy,120*s,-2.8,.9,head,46*s,cols,fade,.62);arcTrail(c,gx,gy,150*s,-2.6,.7,out3((t-.08)/.2),14*s,{...cols,core:cols.spark},fade*.6,.62);
   if(t>.2){const v=t-.2;flash(c,0,0,90*s,cols.main,1-v/.3);ring(c,0,0,20*s+130*s*out3(v/.45),12*s,cols.core,1-v/.45,.45);}}};},
 // Flins: indigo lightning striking down from above.
 thunder(cols){let strikes=0;const at=[.05,.17];return {dur:.8,spawn(sys,t,R,s){while(strikes<at.length&&t>=at[strikes]+.04){burst(sys,0,20*s,cols,R,{n:16,speed:460*s,size:5*s,up:200*s});strikes++;}},
  draw(c,t,s){at.forEach((t0,i)=>{const u=t-t0;if(u<0||u>.3)return;const R=rnd(91+i*7+Math.floor(u*30));const top=-innerHeight;bolt(c,boltPath(R()*60*s-30*s,top,0,20*s,R,14,40*s),3*s,cols,1-u/.3);const br=boltPath(0,-120*s,(R()-.5)*120*s,-20*s,R,6,16*s);bolt(c,br,1.6*s,cols,(1-u/.3)*.7);});
   const v=t-.05;if(v>=0){flash(c,0,0,140*s,cols.main,(1-v/.35)*.8);flash(c,0,10*s,50*s,cols.core,1-v/.15);ring(c,0,25*s,20*s+120*s*out3(v/.4),10*s,cols.main,1-v/.4,.3);}}};},
 // Sparkle buffs: crisp four-point glints popping around the body with a soft lift.
 sparkle(cols,{r=46}){let n=0;return {dur:1,spawn(sys,t,R,s){while(n<Math.min(14,t*40)){n++;const a=R()*TAU,d=r*s*Math.sqrt(R());sys.add(new Particle({x:Math.cos(a)*d,y:Math.sin(a)*d-20*s,vy:-40*s,drag:2,life:.45+R()*.35,size:(10+R()*16)*s,size1:1,color:R()<.5?cols.main:cols.deep,kind:'glint',rot:R()*.6}));}},
  draw(c,t,s){flash(c,0,-10*s,r*1.6*s,cols.main,.35*bell(t/.8));drawGlint(c,0,-28*s,64*s*bell(t/.35),cols.main,.2);ring(c,0,30*s,10*s+r*1.3*s*out3(t/.5),5*s,cols.main,(1-t/.5)*.8,.3);}};},
 // A clear shield bubble for everyone but Illuga.
 shield(cols,{r=56}){return {dur:.9,spawn(sys,t,R,s){if(!this.s&&t>.05){this.s=1;motes(sys,0,0,cols,R,{n:10,r:r*s,rise:40*s,life:.8,size:4*s,kind:'glint'});}},
  draw(c,t,s){const o=out3(t/.2),f=1-in2((t-.5)/.4),rr=r*s*(.85+.15*o);c.save();c.globalCompositeOperation='lighter';const g=c.createRadialGradient(-rr*.3,-rr*.4,rr*.1,0,0,rr);g.addColorStop(0,rgba(cols.core,.06*f));g.addColorStop(.8,rgba(cols.main,.16*f));g.addColorStop(1,rgba(cols.core,.6*f*o));c.fillStyle=g;c.beginPath();c.ellipse(0,0,rr,rr*1.1,0,0,TAU);c.fill();
   c.globalAlpha=.8*f;c.strokeStyle=cols.core;c.lineWidth=1.6*s;c.beginPath();c.ellipse(0,0,rr,rr*1.1,0,-2.6,-1.3);c.stroke();c.restore();ring(c,0,0,rr*(1+.4*out3((t-.05)/.4)),6*s,cols.main,(1-t/.45)*.7,1.1);}};},
 block(cols){return {dur:.5,spawn(sys,t,R,s){if(!this.s){this.s=1;burst(sys,30*s,0,cols,R,{n:12,speed:420*s,size:5*s,spread:2.2,dir:0});}},
  draw(c,t,s){c.save();c.translate(30*s,0);c.scale(.45,1);ring(c,0,0,56*s,14*s*(1-t/.4),cols.main,1-t/.4,1);c.restore();flash(c,30*s,0,60*s,cols.core,1-t/.2);}};},
 // Enemy blows on allies.
 enemyHit(cols){return {dur:.6,spawn(sys,t,R,s){if(!this.s){this.s=1;burst(sys,0,0,cols,R,{n:12,speed:460*s,size:5*s});if(cols.smoke)motes(sys,0,0,{...cols,main:cols.smoke,core:cols.deep},R,{n:6,r:20*s,rise:30*s,life:.7,size:22*s,kind:'smoke'});}},
  draw(c,t,s){flash(c,0,0,60*s,cols.main,1-t/.22);arcTrail(c,40*s,0,50*s,-.6,2.2,out3(t/.08),18*s,cols,1-t/.3,.8);ring(c,0,0,10*s+70*s*out3(t/.35),7*s,cols.main,1-t/.35,.5);}};},
 charge(cols){let n=0;return {dur:.8,spawn(sys,t,R,s){while(n<Math.min(40,t*70)){n++;const a=R()*TAU,d=(90+R()*50)*s;sys.add(new Particle({x:Math.cos(a)*d,y:Math.sin(a)*d,vx:-Math.cos(a)*d*2.6,vy:-Math.sin(a)*d*2.6,drag:3,life:.4,size:4*s,color:R()<.5?cols.core:cols.main,kind:'spark',stretch:.05}));}},
  draw(c,t,s){flash(c,0,0,30*s+50*s*out3(t/.6),cols.main,.8*bell(t/.8));flash(c,0,0,22*s*out3(t/.6),cols.core,bell(t/.8));}};},
 // Enemies dissolve into drifting ash and a fading glow.
 ash(cols){let n=0;return {dur:1.2,spawn(sys,t,R,s){while(n<Math.min(60,t*120)){n++;const x=(R()-.5)*90*s,y=(R()-.5)*90*s;sys.add(new Particle({x,y,vx:(R()-.3)*60*s,vy:-(40+R()*90)*s,drag:.8,life:.7+R()*.6,size:(2+R()*3)*s,color:R()<.5?cols.spark:cols.main,kind:'glow'}));if(R()<.25)sys.add(new Particle({x,y,vx:(R()-.5)*30*s,vy:-30*s,drag:1,life:.9,size:(18+R()*14)*s,size1:34*s,color:cols.smoke||'#140a1e',kind:'smoke',blend:'source-over',alpha:.6}));}},
  draw(c,t,s){flash(c,0,0,80*s,cols.main,.6*(1-t/.4));}};},
 // Venom, for Nefer's follow-up mist.
 mist(cols){return {dur:.9,spawn(sys,t,R,s){if(!this.s){this.s=1;motes(sys,0,0,{...cols,main:cols.deep,core:cols.main},R,{n:12,r:30*s,rise:40*s,life:.9,size:26*s,kind:'smoke'});}},draw(){}};},
 // Victory: a sunrise burst over the field with rays, a wide ring and drifting glints.
 victory(cols){let n=0;return {dur:2,spawn(sys,t,R,s){while(n<Math.min(70,t*90)){n++;const a=R()*TAU,v=(120+R()*360)*s;sys.add(new Particle({x:0,y:0,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.6-60*s,ay:80*s,drag:1.4,life:1+R()*.8,size:(8+R()*14)*s,size1:1,color:R()<.5?cols.main:cols.core,kind:R()<.45?'glint':'glow',rot:R()}));}},
  draw(c,t,s){const o=out3(t/.4),f=1-in2((t-1.1)/.9);flash(c,0,0,420*s*o,cols.deep,.35*f);flash(c,0,0,220*s*o,cols.main,.55*f);rays(c,0,0,520*s*o,18,cols.main,.5*f,t*.25,.05);ring(c,0,0,60*s+620*s*out3(t/.9),18*s,cols.core,(1-t/.9)*.8,.42);drawGlint(c,0,0,160*s*bell(t/.7),cols.main,.2);}};},
 // Living flame: warm flames curl up around each hero and heal motes rise.
 lifeFlame(cols){let last=0;return {dur:1.6,spawn(sys,t,R,s){while(last<Math.min(t,1.1)){last+=1/70;const a=R()*TAU,d=36*s*Math.sqrt(R());sys.add(new Particle({x:Math.cos(a)*d,y:30*s+Math.sin(a)*d*.35,vx:(R()-.5)*30*s,vy:-(120+R()*110)*s,drag:1.4,life:.55+R()*.4,size:(10+R()*9)*s,size1:2*s,kind:'flame',cols:R()<.4?['#fffbe6','#ffd27a','#ff8a2a']:['#ffe9a8','#ff9a3a','#d8401a'],alpha:.6,rot:R()*9}));if(R()<.25)sys.add(new Particle({x:(R()-.5)*60*s,y:20*s,vx:(R()-.5)*20*s,vy:-(60+R()*80)*s,drag:.6,life:1+R()*.5,size:4*s,color:R()<.5?'#bfffd6':'#fff1b0',kind:'glint',rot:R()}));}},
  draw(c,t,s){flash(c,0,0,110*s,'#ff9a3a',.4*bell(t/1.4));ring(c,0,40*s,20*s+80*s*out3(t/.8),8*s,'#ffd27a',(1-t/.8)*.8,.3);}};},
};

/** Steps for a game effect kind, or null when this module does not draw it. */
export function vfxPlan(kind,o={}){
 const C=VFX_COLORS,ult=!!o.ultimate;
 if(['spear','counter','feint','arcane-wave','frost-finisher'].includes(kind)){
  if(o.hero==='durin')return [{fx:'hellfire',at:'center',cols:C.hellfire,opts:{big:ult}}];
  if(o.hero==='illuga')return [{fx:'slash',at:'center',cols:C.lantern,opts:ult?{r:92,w:34,big:true}:{}}];
  if(o.hero==='jahoda')return [{fx:'kick',at:'center',cols:C.kick,opts:{big:ult}}];
  if(o.hero==='kinich')return [{fx:'greatsword',at:'center',cols:C.jungle}];
  if(o.hero==='lyney')return ult?[{fx:'hellfire',at:'center',cols:C.show,opts:{big:true}}]:[{fx:'thrust',at:'center',cols:C.show,from:true}];
  if(o.hero==='cyno')return ult?[{fx:'thunder',at:'center',cols:C.judge}]:[{fx:'slash',at:'center',cols:C.judge,opts:{}}];
  if(kind==='counter'&&!ult)return [{fx:'kick',at:'center',cols:C.ice,opts:{}}];
  return ult?[{fx:'daggers',at:'center',cols:C.ice,from:true}]:[{fx:'thrust',at:'center',cols:C.ice,from:true}];
 }
 if(kind==='wind-cleave')return [{fx:'greatsword',at:'center',cols:C.gale}];
 if(kind==='night-thrust')return [{fx:'thunder',at:'center',cols:C.storm}];
 if(kind==='venom-mark')return [{fx:'kick',at:'center',cols:C.venom,opts:{rise:true}},{fx:'mist',at:'center',cols:C.venom,delay:120}];
 if((kind==='guard'||kind==='veil')&&o.shield){if(o.enemy)return [{fx:'shield',at:'body',cols:o.celestial?C.holy:C.abyss,opts:{r:64},hold:300}];
  if(o.hero==='illuga')return [{fx:'lantern',at:'body',cols:C.lantern,hold:300}];
  return [{fx:'shield',at:'body',cols:kind==='veil'?C.hellfire:o.hero==='durin'?{...C.hellfire,core:'#ffd9b0'}:o.hero==='jahoda'?C.kick:o.hero==='kinich'?C.jungle:o.hero==='lyney'?C.show:o.hero==='cyno'?C.judge:C.ice,hold:300}];}
 if(kind==='guard-hit')return [{fx:'block',at:'body',flip:!!o.enemy,cols:o.enemy?(o.celestial?C.holy:C.abyss):C.ice}];
 if(kind==='abyss-hit'||kind==='celestial-hit')return [{fx:'enemyHit',at:'center',flip:true,cols:kind==='abyss-hit'?C.abyss:C.holy}];
 if(kind==='abyss-charge'||kind==='celestial-charge')return [{fx:'charge',at:'center',cols:kind==='abyss-charge'?C.abyss:C.holy}];
 if(kind==='dissolve'&&o.sprite)return [{fx:'ash',at:'center',cols:o.celestial?C.holy:C.abyss}];
 if(kind==='rally'||kind==='focus'||kind==='recover')return [{fx:'sparkle',at:'body',cols:kind==='recover'?C.gale:C.glint,hold:240}];
 if(kind==='victory')return [{fx:'victory',at:'center',cols:C.holy,hold:900}];
 if(kind==='flame-heal')return [{fx:'lifeFlame',at:'body',cols:C.heal,hold:600}];
 return null;
}

class System{constructor(){this.list=[];}add(p){this.list.push(p);}step(dt){this.list=this.list.filter(p=>p.step(dt));}draw(c){for(const p of this.list)if(p.blend==='source-over')p.draw(c);for(const p of this.list)if(p.blend!=='source-over')p.draw(c);}}
export class BattleVFX{
 constructor({short=()=>false,glow=()=>.85}={}){this.short=short;this.glow=glow;this.layers={};this.seed=29;}
 has(kind,o){return !!vfxPlan(kind,o);}
 unit(){return 1.55*(parseFloat(document.querySelector('#game')?.style.getPropertyValue('--scale'))||1);}
 layer(top){const k=top?'top':'base';let L=this.layers[k];if(L?.canvas.isConnected)return L;const c=document.createElement('canvas');c.className='battle-vfx '+k;c.setAttribute('aria-hidden','true');Object.assign(c.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:top?'80':'47'});document.body.append(c);
  L=this.layers[k]={canvas:c,ctx:c.getContext('2d'),fx:[],sys:new System(),running:false};return L;}
 point(el,at){const r=el.getBoundingClientRect(),x=r.left+r.width/2;return {x,y:at==='feet'?r.bottom-6:at==='body'?r.bottom-Math.min(r.height,r.width)*.45:r.top+r.height*.55};}
 /** Plays a kind on an element; resolves at the moment of contact, the rest plays on. */
 async play(kind,anchor,options={}){
  const plan=vfxPlan(kind,{...options,sprite:anchor?.classList?.contains('sprite')});if(!plan||!anchor?.isConnected||document.hidden)return;
  const top=!!anchor.closest?.('.cutin-shade'),L=this.layer(top),speed=this.short()?1.8:1,s=this.unit()*(kind==='victory'?1:1)*(options.scale>1.15?1.12:1);let hold=0;
  for(const step of plan){const p=this.point(anchor,step.at),src=options.from?.isConnected?this.point(options.from,'center'):null;const opts={...(step.opts||{})};if(step.from&&src)opts.from={x:src.x-p.x,y:src.y-p.y};
   const fx=FX[step.fx](step.cols,opts),flip=!!step.flip;L.fx.push({fx,x:p.x,y:p.y,flip,s,speed,born:performance.now()+(step.delay||0)/speed,R:rnd(this.seed=this.seed*1103515245+12345>>>0),sys:new System()});
   hold=Math.max(hold,(step.delay||0)+(step.hold??Math.min(380,fx.dur*1000*.35)));}
  this.run(L);await new Promise(r=>setTimeout(r,hold/speed));
 }
 async run(L){if(L.running)return;L.running=true;let last=performance.now();
  while(L.fx.length){await new Promise(r=>requestAnimationFrame(r));const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;const dpr=Math.min(1.25,devicePixelRatio||1),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);
   if(L.canvas.width!==W||L.canvas.height!==H){L.canvas.width=W;L.canvas.height=H;}const c=L.ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
   for(const e of L.fx){const t=(now-e.born)/1000*e.speed;if(t<0)continue;e.t=t;c.setTransform(dpr,0,0,dpr,0,0);c.translate(e.x,e.y);if(e.flip)c.scale(-1,1);
    e.fx.spawn?.(e.sys,t,e.R,e.s);e.sys.step(dt*e.speed);c.save();e.fx.draw(c,t,e.s);c.restore();c.save();e.sys.draw(c);c.restore();c.globalAlpha=1;c.globalCompositeOperation='source-over';}
   L.fx=L.fx.filter(e=>!(e.t>e.fx.dur&&!e.sys.list.length));}
  L.ctx.setTransform(1,0,0,1,0,0);L.ctx.clearRect(0,0,L.canvas.width,L.canvas.height);L.running=false;}
 /** QA: run a kind headlessly up to time t and draw that frame. */
 still(kind,anchor,options={},t=.2){const plan=vfxPlan(kind,{...options,sprite:anchor?.classList?.contains('sprite')});if(!plan)return false;const top=!!anchor.closest?.('.cutin-shade'),L=this.layer(top),dpr=Math.min(2,devicePixelRatio||1),c=L.ctx,s=this.unit();L.canvas.width=Math.round(innerWidth*dpr);L.canvas.height=Math.round(innerHeight*dpr);
  for(const step of plan){const p=this.point(anchor,step.at),src=options.from?this.point(options.from,'center'):null,opts={...(step.opts||{})};if(step.from&&src)opts.from={x:src.x-p.x,y:src.y-p.y};const fx=FX[step.fx](step.cols,opts),sys=new System(),R=rnd(7);let tt=0;const T=t-(step.delay||0)/1000;
   const steps=Math.max(0,Math.ceil(T*60)),dt=steps?T/steps:0;for(let i=0;i<steps;i++){tt+=dt;fx.spawn?.(sys,tt,R,s);sys.step(dt);}if(T<0)continue;c.setTransform(dpr,0,0,dpr,0,0);c.translate(p.x,p.y);if(step.flip)c.scale(-1,1);c.save();fx.draw(c,Math.max(0,T),s);c.restore();c.save();sys.draw(c);c.restore();c.globalAlpha=1;c.globalCompositeOperation='source-over';}
  return true;}
 clear(){for(const L of Object.values(this.layers)){L.fx=[];L.ctx.setTransform(1,0,0,1,0,0);L.ctx.clearRect(0,0,L.canvas.width,L.canvas.height);}}
}
