// v0.31 battle effects in a hand-drawn 2D cel style: flat colour bands (dark rim → bright → white core),
// hard edges, tapered smears, starbursts that break into shards, and a soft glow only outside the shapes.
// Drawn on one canvas in code; time is stepped (STEP fps) and shapes "boil" between steps like hand-drawn
// frame-by-frame animation. Referenced in spirit from 2D frame-by-frame game VFX; no images are copied.
const STEP=18,TAU=Math.PI*2;
export const CEL_PALETTES=Object.freeze({
 ice:['#163f86','#2f8fe0','#8fe2ff','#ffffff'],
 violet:['#4c1068','#b02c9c','#ff86d6','#ffffff'],
 gold:['#8a3c08','#ea951c','#ffe066','#ffffff'],
 kick:['#6a1a58','#ff4fa3','#71f2ee','#ffffff'],
 teal:['#0c4b48','#22b49c','#8ff5da','#ffffff'],
 toxic:['#1f4a0e','#5fb21e','#c6f35a','#ffffff'],
 abyss:['#3a0b52','#9a2a9e','#ff63cf','#ffffff'],
 holy:['#8a5a12','#e2ae3a','#fff0a0','#ffffff'],
 smoke:['#3a2a5c','#6a52a0','#b7a2e8','#ffffff'],
});
const HERO_PAL={lohen:'ice',durin:'violet',illuga:'gold',jahoda:'kick'};
const P=n=>CEL_PALETTES[n]||CEL_PALETTES.ice;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>1-Math.pow(1-clamp(t),3),easeIn=t=>clamp(t)*clamp(t);
function rng(seed){let a=seed>>>0||1;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}

// ---- shape helpers (all paths centred on 0,0) ----
function star(ctx,R,r,n,rot,R0){ctx.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,rad=i%2?r:R*(R0?R0[(i>>1)%R0.length]:1);ctx.lineTo(Math.cos(a)*rad,Math.sin(a)*rad);}ctx.closePath();}
function blob(ctx,r,n,j,R,rot=0){ctx.beginPath();for(let i=0;i<=n;i++){const a=rot+i/n*TAU,k=1+(R()-.5)*j;ctx.lineTo(Math.cos(a)*r*k,Math.sin(a)*r*k);}ctx.closePath();}
// Tapered crescent band along an arc from a0 to a1; thickest in the middle (or near the head).
function band(ctx,r,a0,a1,w,head=.65,R=null){const n=26,pts=[],inner=[];for(let i=0;i<=n;i++){const u=i/n,a=a0+(a1-a0)*u,prof=Math.pow(Math.sin(Math.PI*Math.pow(u,Math.log(.5)/Math.log(head))),.8),k=w*prof*(R?1+(R()-.5)*.25:1);pts.push([Math.cos(a)*(r+k*.5),Math.sin(a)*(r+k*.5)]);inner.push([Math.cos(a)*(r-k*.5),Math.sin(a)*(r-k*.5)]);}
 ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));inner.reverse().forEach(([x,y])=>ctx.lineTo(x,y));ctx.closePath();}
function spindle(ctx,x0,x1,w,head=.8){ctx.beginPath();ctx.moveTo(x0,0);ctx.quadraticCurveTo(x0+(x1-x0)*head,-w,x1,0);ctx.quadraticCurveTo(x0+(x1-x0)*head,w,x0,0);ctx.closePath();}
function zig(ctx,x0,y0,x1,y1,seg,amp,R){ctx.beginPath();ctx.moveTo(x0,y0);for(let i=1;i<seg;i++){const u=i/seg,nx=-(y1-y0),ny=x1-x0,l=Math.hypot(nx,ny)||1,o=(R()-.5)*2*amp;ctx.lineTo(x0+(x1-x0)*u+nx/l*o,y0+(y1-y0)*u+ny/l*o);}ctx.lineTo(x1,y1);}
// Fill one path three or four times, shrinking towards the core: the flat cel bands.
function layers(ctx,pal,draw,{glow=18,scales=[1,.78,.52,.3],core=true}={}){
 for(let i=0;i<scales.length;i++){if(i===3&&!core)break;ctx.save();ctx.scale(scales[i],scales[i]);ctx.fillStyle=pal[Math.min(i,3)];if(i===0&&glow){ctx.shadowColor=pal[1];ctx.shadowBlur=glow;}draw(i);ctx.fill();ctx.restore();}
}

// ---- effects: each returns {dur, draw(ctx,t,R,s)} with t stepped, R a per-step rng, s the size unit ----
const FX={
 impact({pal,r=46,rays=8,crack=true}){return {dur:.42,draw(ctx,t,R,s){const p=t/.42;
  if(p<.12){const k=r*s*.62;ctx.save();ctx.shadowColor=pal[1];ctx.shadowBlur=28*s;ctx.fillStyle=pal[2];star(ctx,k*1.25,k*.42,rays,R()*.3);ctx.fill();ctx.restore();ctx.fillStyle='#fff';star(ctx,k,k*.36,rays,R()*.3);ctx.fill();ctx.beginPath();ctx.arc(0,0,k*.42,0,TAU);ctx.fill();return;}
  const g=ease((p-.12)/.5),Rr=r*s*(.75+.45*g),thin=1-easeIn((p-.35)/.65),rot=R()*.3;
  if(p<.62){const spikes=Array.from({length:rays},()=>.7+R()*.6);layers(ctx,pal,()=>star(ctx,Rr,Rr*.38*thin+2,rays,rot,spikes),{glow:22*s,scales:[1,.74,.48,.26*thin]});}
  const n=rays+2;ctx.fillStyle=pal[2];for(let i=0;i<n;i++){const a=i/n*TAU+R()*.4,d=Rr*(.7+1.1*ease(p)),L=r*s*.42*(1-p);if(L<1)continue;ctx.save();ctx.rotate(a);ctx.translate(d,0);spindle(ctx,-L,L*.4,Math.max(1,L*.18),.7);ctx.fill();ctx.restore();}
  if(crack&&p>.08&&p<.55){ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,1.4*s);for(let i=0;i<3;i++){const a=R()*TAU,L=r*s*(1+R()*.8);zig(ctx,0,0,Math.cos(a)*L,Math.sin(a)*L,5,6*s,R);ctx.stroke();}}
 }};},
 slash({pal,r=62,a0=-2.2,a1=.9,w=26,head=.7}){return {dur:.5,draw(ctx,t,R,s){const p=t/.5,grow=ease(p/.32),tail=easeIn((p-.3)/.7),a=a0+(a1-a0)*grow,start=a0+(a1-a0)*tail*.95;if(Math.abs(a-start)<.04)return;
  const W=w*s*(1-tail*.85),rr=r*s,span=a-start,mid=(a0+a1)/2;ctx.translate(-Math.cos(mid)*rr*.88,-Math.sin(mid)*rr*.88);
  // flat bands: dark rim, colour, bright, white edge — each narrower and hugging the outer edge
  ctx.save();ctx.shadowColor=pal[1];ctx.shadowBlur=20*s;ctx.fillStyle=pal[0];band(ctx,rr,start,a,W,head,R);ctx.fill();ctx.restore();
  ctx.fillStyle=pal[1];band(ctx,rr+W*.08,start+span*.06,a,W*.78,head,R);ctx.fill();
  ctx.fillStyle=pal[2];band(ctx,rr+W*.16,start+span*.16,a,W*.5,head,R);ctx.fill();
  ctx.fillStyle='#fff';band(ctx,rr+W*.24,start+span*.34,a,W*.22,head);ctx.fill();
  if(p>.3){ctx.fillStyle=pal[2];for(let i=0;i<5;i++){const aa=start+(a-start)*R(),d=rr+(R()-.3)*W*1.4+tail*14*s,L=(3+R()*6)*s*(1-tail);ctx.save();ctx.rotate(aa);ctx.translate(d,0);ctx.rotate(Math.PI/2);spindle(ctx,-L,L,Math.max(.8,L*.25));ctx.fill();ctx.restore();}}
 }};},
 thrust({pal,len=150,w=20}){return {dur:.46,draw(ctx,t,R,s){const p=t/.46,g=ease(p/.25),back=easeIn((p-.25)/.75),L=len*s,W=w*s*(1-back*.8);
  const x0=-L*(1-back*.9),x1=0;if(g<1&&p<.25){layers(ctx,pal,()=>spindle(ctx,-L*g,L*.05,W,.85),{glow:16*s,scales:[1,.7,.45]});return;}
  layers(ctx,pal,()=>spindle(ctx,x0,x1+L*.06,W,.88),{glow:16*s,scales:[1,.7,.45]});ctx.fillStyle='#fff';spindle(ctx,x0*.6,L*.06,W*.22,.9);ctx.fill();
  ctx.fillStyle=pal[2];for(let i=0;i<4;i++){const y=(R()-.5)*W*3.2,l=L*(.25+R()*.35)*(1-back);ctx.save();ctx.translate(-L*R()*.6,y);spindle(ctx,-l,0,1.2*s);ctx.fill();ctx.restore();}
  if(p<.6){const f=1-p/.6,Rr=(28+16*R())*s*f+4;layers(ctx,pal,()=>star(ctx,Rr,Rr*.18,4,R()*.15,[1.6,.7]),{glow:24*s,scales:[1,.72,.45,.25]});}
 }};},
 orb({pal,r=34}){return {dur:.62,draw(ctx,t,R,s){const p=t/.62,rr=r*s*(p<.6?.6+.4*ease(p/.3):1+.9*ease((p-.6)/.4)),fade=p<.6?1:1-ease((p-.6)/.4);if(fade<=.02)return;
  if(p<.6){ctx.save();ctx.shadowColor=pal[1];ctx.shadowBlur=26*s;ctx.fillStyle=pal[1];ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.fill();ctx.restore();
   ctx.fillStyle=pal[0];ctx.beginPath();ctx.arc(0,0,rr,-.2,Math.PI*.95);ctx.arc(rr*.18,-rr*.18,rr*.86,Math.PI*.95,-.2,true);ctx.fill();
   ctx.fillStyle=pal[2];blob(ctx,rr*.46,9,.3,R,R());ctx.save();ctx.translate(-rr*.2,-rr*.22);ctx.fill();ctx.restore();ctx.fillStyle='#fff';ctx.save();ctx.translate(-rr*.38,-rr*.4);blob(ctx,rr*.2,7,.4,R);ctx.fill();ctx.restore();
   const spin=t*9;ctx.fillStyle='#fff';band(ctx,rr*1.12,spin,spin+2.2,rr*.32,.75);ctx.fill();ctx.fillStyle=pal[2];band(ctx,rr*1.25,spin+Math.PI,spin+Math.PI+1.6,rr*.18,.75);ctx.fill();
   ctx.strokeStyle='#fff';ctx.lineWidth=Math.max(1,1.2*s);for(let i=0;i<2;i++){const a=R()*TAU;zig(ctx,Math.cos(a)*rr,Math.sin(a)*rr,Math.cos(a)*rr*1.9,Math.sin(a)*rr*1.9,4,5*s,R);ctx.stroke();}}
  else{ctx.globalAlpha=fade;ctx.fillStyle=pal[2];band(ctx,rr,0,TAU,rr*.28*fade,.5);ctx.fill();ctx.globalAlpha=1;FX.impact({pal,r:r*.9,rays:10}).draw(ctx,(p-.6)/.4*.42,R,s);}
 }};},
 pillar({pal,w=58}){return {dur:.9,draw(ctx,t,R,s){const p=t/.9,open=ease(p/.15),close=easeIn((p-.45)/.55),W=w*s*open*(1-close*.92),top=-innerHeight;if(W<1)return;
  const edge=(k,c)=>{ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(-W*k,top);for(let y=top;y<=0;y+=24*s)ctx.lineTo(-W*k*(1+(R()-.5)*.22),y);ctx.lineTo(W*k*.9,0);for(let y=0;y>=top;y-=24*s)ctx.lineTo(W*k*(1+(R()-.5)*.22),y);ctx.closePath();ctx.fill();};
  ctx.save();ctx.shadowColor=pal[1];ctx.shadowBlur=34*s;edge(1,pal[0]);ctx.restore();edge(.8,pal[1]);edge(.58,pal[2]);edge(.34,'#fff');
  ctx.save();ctx.scale(1,.32);layers(ctx,pal,()=>blob(ctx,W*1.9*(1+.4*ease(p)),14,.25,R),{glow:24*s});ctx.restore();
  if(p>.15&&p<.7)FX.impact({pal,r:w*1.1,rays:10,crack:true}).draw(ctx,(p-.15)/.55*.42,R,s);
 }};},
 bolt({pal,from=null}){return {dur:.5,draw(ctx,t,R,s){const p=t/.5;if(!from||p>.55)return FX.impact({pal,r:40,rays:9}).draw(ctx,clamp((p-.1)/.9)*.42,R,s);
  for(let k=0;k<3;k++){ctx.strokeStyle=k?pal[2]:pal[1];ctx.lineWidth=(k?2:7)*s;ctx.shadowColor=pal[1];ctx.shadowBlur=k?0:16*s;zig(ctx,from.x,from.y,0,0,9,18*s,R);ctx.stroke();}ctx.shadowBlur=0;ctx.strokeStyle='#fff';ctx.lineWidth=1.6*s;zig(ctx,from.x,from.y,0,0,9,10*s,R);ctx.stroke();
  FX.impact({pal,r:34,rays:8}).draw(ctx,clamp(p/.55)*.3,R,s);
 }};},
 shield({pal,r=52}){return {dur:.75,draw(ctx,t,R,s){const p=t/.75,pop=p<.2?.85+.3*ease(p/.2):1,brk=easeIn((p-.6)/.4),rr=r*s*pop;ctx.save();ctx.scale(1,1.12);
  ctx.globalAlpha=.16*(1-brk);ctx.fillStyle=pal[1];ctx.beginPath();ctx.arc(0,0,rr,0,TAU);ctx.fill();ctx.globalAlpha=1-brk*.6;
  ctx.save();ctx.shadowColor=pal[1];ctx.shadowBlur=18*s;ctx.fillStyle=pal[1];band(ctx,rr,-Math.PI*.95,Math.PI*1.05,rr*.12*(1-brk*.6),.5,R);ctx.fill();ctx.restore();
  ctx.fillStyle=pal[2];band(ctx,rr*.97,-Math.PI*.9,-.1,rr*.08,.4);ctx.fill();ctx.fillStyle='#fff';band(ctx,rr*.86,-2.6,-1.5,rr*.1,.5);ctx.fill();
  if(brk>0){ctx.fillStyle=pal[2];for(let i=0;i<9;i++){const a=i/9*TAU+R()*.3,d=rr*(1+brk*.6),L=8*s*(1-brk);ctx.save();ctx.rotate(a);ctx.translate(d,0);star(ctx,L,L*.3,2,0);ctx.fill();ctx.restore();}}
  ctx.restore();
 }};},
 block({pal,r=50}){return {dur:.42,draw(ctx,t,R,s){const p=t/.42,rr=r*s;ctx.globalAlpha=1-easeIn((p-.5)/.5);
  layers(ctx,pal,()=>band(ctx,rr,-1.2,1.2,rr*.34*(1-p*.5),.5,R),{glow:20*s,scales:[1,.92,.86,.8]});ctx.globalAlpha=1;
  ctx.save();ctx.translate(rr*.95,0);FX.impact({pal,r:26,rays:6,crack:false}).draw(ctx,p*.42,R,s);ctx.restore();
 }};},
 charge({pal,r=40}){return {dur:.62,draw(ctx,t,R,s){const p=t/.62,rr=r*s;
  ctx.fillStyle=pal[2];for(let i=0;i<9;i++){const a=i/9*TAU+R()*.5,d=rr*(2.4-2.1*ease(p)),L=rr*.5*(1-p*.6);ctx.save();ctx.rotate(a);ctx.translate(d,0);spindle(ctx,0,L,1.6*s,.3);ctx.fill();ctx.restore();}
  const c=rr*.18+rr*.4*ease(p/.85);layers(ctx,pal,()=>blob(ctx,c,10,.3,R),{glow:22*s});
  if(p>.85)FX.impact({pal,r:r*.8,rays:8,crack:false}).draw(ctx,(p-.85)/.15*.2,R,s);
 }};},
 smoke({pal,r=36}){return {dur:.8,draw(ctx,t,R,s){const p=t/.8,rr=r*s;
  for(let i=0;i<7;i++){const q=rng(91+i*13),a=i/7*TAU+q(),d=rr*(.2+1.1*ease(p))*(.6+q()*.6),k=rr*(.55-.5*easeIn(p))*(.7+q()*.5);if(k<1)continue;const x=Math.cos(a)*d,y=Math.sin(a)*d*.6-p*rr*.8;
   ctx.globalAlpha=.92-.5*easeIn(p);ctx.fillStyle=pal[0];ctx.beginPath();ctx.arc(x,y,k,0,TAU);ctx.fill();ctx.fillStyle=pal[1];ctx.beginPath();ctx.arc(x-k*.14,y-k*.16,k*.84,0,TAU);ctx.fill();ctx.fillStyle=pal[2];ctx.beginPath();ctx.arc(x-k*.34,y-k*.36,k*.34,0,TAU);ctx.fill();ctx.globalAlpha=1;}
  if(p>.05&&p<.5){ctx.save();ctx.scale(1,.45);ctx.strokeStyle=pal[2];ctx.lineWidth=Math.max(1,4*s*(1-p*2));ctx.beginPath();ctx.arc(0,rr*.9,rr*(.5+2*ease(p*2)),0,TAU);ctx.stroke();ctx.restore();}
  if(p<.25){ctx.fillStyle='#fff';blob(ctx,rr*.5*(1-p/.25),9,.4,R);ctx.fill();}
 }};},
 rise({pal,r=40}){return {dur:.9,draw(ctx,t,R,s){const p=t/.9,rr=r*s;ctx.save();ctx.scale(1,.3);ctx.translate(0,-p*rr*5);ctx.globalAlpha=1-easeIn(p);ctx.fillStyle=pal[1];band(ctx,rr*(1-p*.4),0,TAU,rr*.22,.5,R);ctx.fill();ctx.fillStyle=pal[2];band(ctx,rr*(1-p*.4),.3,2.6,rr*.12,.5);ctx.fill();ctx.restore();ctx.globalAlpha=1;
  for(let i=0;i<7;i++){const q=rng(7+i*29),x=(q()-.5)*rr*2,y=-q()*rr*.6-ease(p)*rr*(1.6+q()),k=(3+q()*5)*s*(1-p);if(k<.6)continue;ctx.save();ctx.translate(x,y);layers(ctx,pal,()=>star(ctx,k*2,k*.5,4,0),{glow:10*s,scales:[1,.6,.3]});ctx.restore();}
 }};},
 acid({pal,r=42}){return {dur:.7,draw(ctx,t,R,s){const p=t/.7,rr=r*s;ctx.save();ctx.scale(1,.42);layers(ctx,pal,()=>blob(ctx,rr*(.4+.9*ease(p))*(1-easeIn((p-.6)/.4)*.7),12,.45,R),{glow:14*s});ctx.restore();
  for(let i=0;i<8;i++){const q=rng(3+i*17),a=-Math.PI*(.15+.7*q()),v=rr*(1.2+q()*1.2),x=Math.cos(a)*v*ease(p),y=Math.sin(a)*v*ease(p)+p*p*rr*2.2,k=(4+q()*5)*s*(1-p);if(k<.8)continue;ctx.fillStyle=pal[2];ctx.beginPath();ctx.arc(x,y,k,0,TAU);ctx.fill();ctx.fillStyle=pal[0];ctx.beginPath();ctx.arc(x+k*.25,y+k*.25,k*.55,0,TAU);ctx.fill();}
 }};},
};

/** Steps for a game effect kind: [{fx,at,opts,delay,from}] or null when this module does not draw it. */
export function celPlan(kind,o={}){
 const pal=P(HERO_PAL[o.hero]||'ice'),ult=!!o.ultimate;
 const hit=(p=pal,extra={})=>({fx:'impact',at:'center',opts:{pal:p,...extra},delay:60});
 if(['spear','counter','feint','arcane-wave','frost-finisher'].includes(kind)){
  if(kind==='counter'&&!ult&&o.hero!=='illuga')return [hit(pal,{r:38})];
  if(o.hero==='durin')return ult?[{fx:'orb',at:'center',opts:{pal,r:62}},{fx:'impact',at:'center',opts:{pal,r:84,rays:12},delay:380}]:[{fx:'orb',at:'center',opts:{pal,r:34}}];
  if(o.hero==='illuga')return ult?[{fx:'pillar',at:'feet',opts:{pal,w:62}}]:[{fx:'slash',at:'center',opts:{pal,r:58,a0:-2.4,a1:.7,w:24}},hit(pal,{r:40})];
  if(o.hero==='jahoda')return ult?[{fx:'bolt',at:'center',from:true,opts:{pal}},{fx:'impact',at:'center',opts:{pal,r:70,rays:11},delay:200}]:[{fx:'slash',at:'center',opts:{pal,r:52,a0:2.3,a1:-.4,w:22,head:.75}},hit(pal,{r:40})];
  return ult?[{fx:'thrust',at:'center',opts:{pal,len:220,w:18}},{fx:'impact',at:'center',opts:{pal,r:78,rays:12},delay:90},{fx:'slash',at:'center',opts:{pal,r:70,a0:-1.9,a1:1.3,w:20},delay:140}]:[{fx:'thrust',at:'center',opts:{pal}},hit(pal,{r:40})];
 }
 if(kind==='wind-cleave')return [{fx:'slash',at:'center',opts:{pal:P('teal'),r:66,a0:-2.6,a1:1,w:26}},hit(P('teal'))];
 if(kind==='night-thrust')return [{fx:'thrust',at:'center',opts:{pal:P('violet')}},hit(P('violet'))];
 if(kind==='venom-mark')return [{fx:'acid',at:'feet',opts:{pal:P('toxic')}},hit(P('toxic'),{r:30})];
 if((kind==='guard'||kind==='veil')&&o.shield)return [{fx:'shield',at:'body',opts:{pal:o.enemy?P(o.celestial?'holy':'abyss'):kind==='veil'?P('violet'):pal,r:o.enemy?62:52},hold:320}];
 if(kind==='guard-hit')return [{fx:'block',at:'body',flip:!!o.enemy,opts:{pal:o.enemy?P(o.celestial?'holy':'abyss'):pal}}];
 if(kind==='abyss-hit'||kind==='celestial-hit')return [{fx:'impact',at:'center',flip:true,opts:{pal:P(kind==='abyss-hit'?'abyss':'holy'),r:40}}];
 if(kind==='abyss-charge'||kind==='celestial-charge')return [{fx:'charge',at:'center',opts:{pal:P(kind==='abyss-charge'?'abyss':'holy')}}];
 if(kind==='dissolve'&&o.sprite)return [{fx:'smoke',at:'center',opts:{pal:o.celestial?['#8a6a3a','#d8c08a','#fff4d0','#fff']:P('smoke'),r:44}}];
 if(kind==='recover')return [{fx:'rise',at:'feet',opts:{pal:P('teal')}}];
 if(kind==='rally'||kind==='focus')return [{fx:'rise',at:'feet',opts:{pal:P('gold'),r:34},hold:260}];
 return null;
}

export class CelVFX{
 constructor({short=()=>false,glow=()=>.85}={}){this.short=short;this.glow=glow;this.live=[];this.running=false;this.seed=17;}
 has(kind,o){return !!celPlan(kind,o);}
 unit(){return 1.5*(parseFloat(document.querySelector('#game')?.style.getPropertyValue('--scale'))||1);}
 layer(){if(this.canvas?.isConnected)return;const c=document.createElement('canvas');c.className='cel-vfx';c.setAttribute('aria-hidden','true');Object.assign(c.style,{position:'fixed',inset:'0',width:'100%',height:'100%',pointerEvents:'none',zIndex:'47'});document.body.append(c);this.canvas=c;this.ctx=c.getContext('2d');}
 point(el,at){const r=el.getBoundingClientRect(),x=r.left+r.width/2;return {x,y:at==='feet'?r.bottom-4:at==='body'?r.bottom-Math.min(r.height,r.width)*.42:r.top+r.height*.55};}
 /** Plays a kind on an element; resolves at the moment of contact while the effect finishes on its own. */
 async play(kind,anchor,options={}){
  const plan=celPlan(kind,{...options,sprite:anchor?.classList?.contains('sprite')});if(!plan||!anchor?.isConnected||document.hidden)return;this.layer();
  const speed=this.short()?2:1,s=this.unit()*(options.scale>1?Math.min(1.25,options.scale):1);let hold=0;
  for(const step of plan){const p=this.point(anchor,step.at),f=FX[step.fx],src=step.from&&options.from?.isConnected?this.point(options.from,'center'):null;
   const opts={...step.opts};if(src)opts.from={x:src.x-p.x,y:src.y-p.y};if(step.fx==='thrust'&&options.from?.isConnected){const sp=this.point(options.from,'center');opts.len=Math.max(90,Math.min(opts.len||150,(p.x-sp.x)/s-30));}
   const fx=f(opts);
   this.live.push({fx,x:p.x,y:p.y,flip:!!step.flip,s,born:performance.now()+(step.delay||0)/speed,speed,seed:(this.seed=this.seed*31+7>>>0)});
   hold=Math.max(hold,(step.delay||0)+(step.hold??fx.dur*1000*.42));}
  this.loop();await new Promise(r=>setTimeout(r,hold/speed));
 }
 async loop(){if(this.running)return;this.running=true;
  while(this.live.length){await new Promise(r=>requestAnimationFrame(r));const now=performance.now(),dpr=Math.min(2,devicePixelRatio||1),W=Math.round(innerWidth*dpr),H=Math.round(innerHeight*dpr);
   if(this.canvas.width!==W||this.canvas.height!==H){this.canvas.width=W;this.canvas.height=H;}const c=this.ctx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,W,H);
   this.live=this.live.filter(l=>(now-l.born)/1000*l.speed<l.fx.dur);
   for(const l of this.live){const age=(now-l.born)/1000*l.speed;if(age<0)continue;const step=Math.floor(age*STEP),t=step/STEP;
    c.setTransform(dpr,0,0,dpr,0,0);c.translate(l.x,l.y);if(l.flip)c.scale(-1,1);c.globalAlpha=1;c.globalCompositeOperation='source-over';c.shadowBlur=0;
    c.save();l.fx.draw(c,t,rng(l.seed+step*977),l.s*(this.glow()>.2?1:1));c.restore();}
  }
  this.ctx?.setTransform(1,0,0,1,0,0);this.ctx?.clearRect(0,0,this.canvas.width,this.canvas.height);this.running=false;}
 /** QA: draw every step of a kind frozen at time t (seconds). */
 still(kind,anchor,options={},t=.2){const plan=celPlan(kind,{...options,sprite:anchor?.classList?.contains('sprite')});if(!plan)return false;this.layer();const dpr=Math.min(2,devicePixelRatio||1),c=this.ctx,s=this.unit();this.canvas.width=Math.round(innerWidth*dpr);this.canvas.height=Math.round(innerHeight*dpr);
  for(const step of plan){const p=this.point(anchor,step.at),opts={...step.opts};if(step.from&&options.from){const q=this.point(options.from,'center');opts.from={x:q.x-p.x,y:q.y-p.y};}if(step.fx==='thrust'&&options.from){const sp=this.point(options.from,'center');opts.len=Math.max(90,Math.min(opts.len||150,(p.x-sp.x)/s-30));}
   const fx=FX[step.fx](opts),tt=Math.floor(Math.max(0,t-(step.delay||0)/1000)*STEP)/STEP;if(tt>=fx.dur)continue;c.setTransform(dpr,0,0,dpr,0,0);c.translate(p.x,p.y);if(step.flip)c.scale(-1,1);c.save();fx.draw(c,tt,rng(5+Math.floor(tt*STEP)*977),s);c.restore();}
  return true;}
 clear(){this.live=[];if(this.ctx){this.ctx.setTransform(1,0,0,1,0,0);this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);}}
}
