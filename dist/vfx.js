/* Original motion drawings for Oath of Embers. No atlas, library, or gameplay RNG. */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const ease=t=>1-Math.pow(1-clamp(t),3);
const smooth=t=>{t=clamp(t);return t*t*(3-2*t);};
const PALETTES=Object.freeze({
 ice:['#233c65','#448caf','#95deee','#e4fbf5'],
 lilac:['#34213f','#765398','#c4a0e7','#f1d7f8'],
 gold:['#4a3228','#ae7f46','#e5c77f','#fff2bc'],
 green:['#263d3d','#5b9c87','#a1d4a6','#e6efc4'],
 wind:['#24484d','#52978e','#b3dfcc','#eff8dc'],
 night:['#25233f','#655b8a','#ada5d9','#e5dff5'],
 abyss:['#1f142e','#55315e','#a7669d','#edb6da'],
 flame:['#692e30','#be5739','#efa65c','#ffe3a2'],
});
const SPECS=Object.freeze({
 spear:{duration:390,palette:'ice'},'frost-finisher':{duration:620,palette:'ice'},
 'arcane-wave':{duration:560,palette:'lilac'},guard:{duration:600,palette:'gold'},
 'guard-hit':{duration:370,palette:'gold'},counter:{duration:440,palette:'gold'},
 feint:{duration:360,palette:'green'},rally:{duration:500,palette:'green'},focus:{duration:440,palette:'ice'},
 'wind-cleave':{duration:590,palette:'wind'},veil:{duration:580,palette:'lilac'},
 'night-thrust':{duration:470,palette:'night'},'venom-mark':{duration:520,palette:'green'},
 'abyss-hit':{duration:440,palette:'abyss'},'celestial-hit':{duration:470,palette:'gold'},
 'abyss-charge':{duration:570,palette:'abyss'},'celestial-charge':{duration:570,palette:'gold'},
 collapse:{duration:610,palette:'abyss'},recover:{duration:570,palette:'ice'},
 dissolve:{duration:430,palette:'lilac'},'flame-heal':{duration:1100,palette:'flame'},
});
export function effectSpec(kind){const spec=SPECS[kind];return spec?{kind,...spec,colors:[...PALETTES[spec.palette]]}:null;}
const point=(el,y=.52)=>{const r=el.getBoundingClientRect();return {x:r.left+r.width*Number(el.dataset?.anchorX??.5),y:r.top+r.height*y,width:r.width,height:r.height};};
const hash=(seed,n)=>{let v=Math.imul((seed+n*7919)|0,0x45d9f3b);v^=v>>>16;return (v>>>0)/4294967296;};
function polygon(c,pts,fill,alpha=1){c.globalAlpha=alpha;c.fillStyle=fill;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function line(c,pts,color,width=2,alpha=1){c.globalAlpha=alpha;c.strokeStyle=color;c.lineWidth=width;c.lineJoin='miter';c.lineCap='butt';c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();}
function facet(c,x,y,s,color,alpha=1,angle=0){c.save();c.translate(x,y);c.rotate(angle);polygon(c,[[0,-s],[s*.45,0],[0,s*.7],[-s*.45,0]],color,alpha);c.restore();}
function crescent(c,cx,cy,r,angle,thickness,color,alpha=1){c.save();c.translate(cx,cy);c.rotate(angle);c.globalAlpha=alpha;c.fillStyle=color;c.beginPath();c.moveTo(-r*.9,r*.2);c.bezierCurveTo(-r*.65,-r*.75,r*.55,-r*.88,r,r*.02);c.bezierCurveTo(r*.55,-r*.88+thickness,-r*.65,-r*.75+thickness,-r*.9,r*.2);c.fill();c.restore();}
function sparks(c,e,t,color,count=8,spread=1,up=false){const p=ease(t),fade=(1-t)*(1-t);for(let i=0;i<count;i++){const a=hash(e.seed,i)*Math.PI*2,r=(15+hash(e.seed,i+19)*48)*p*spread;const x=Math.cos(a)*r,y=(up?-r:Math.sin(a)*r*.65)+t*t*10;facet(c,x,y,(1+hash(e.seed,i+29)*3)*(1-t*.6),color,fade,a);}}
function slash(c,e,t,p){const wind=clamp(t/.2),strike=ease((t-.15)/.22),tail=1-smooth((t-.36)/.64);c.save();c.rotate(e.angle);line(c,[[-58,-4],[-15,0]],p[1],1,Math.min(wind,tail)*.5);if(t>.14){const x=-57+112*strike;polygon(c,[[x-95*tail,-2*tail],[x+13,0],[x-95*tail,3*tail],[x-38*tail,0]],p[2],tail*.9);line(c,[[x-62*tail,0],[x+8,0]],p[3],1.3,tail);for(let i=0;i<3;i++)line(c,[[x-51+i*8,-7+i*7],[x-17+i*3,-5+i*7]],p[1],1,tail*.7);}c.restore();if(t>.3)sparks(c,e,(t-.3)/.7,p[2],7,.7);}
function drawEffect(c,e,t){const p=PALETTES[e.palette],fade=1-smooth((t-.35)/.65),appear=ease(t/.22),pulse=Math.sin(Math.PI*clamp(t/.48));c.save();
 if(e.quick){c.globalAlpha=Math.sin(t*Math.PI)*.65;line(c,[[-20,3],[0,-10],[20,3]],p[2],2,c.globalAlpha);c.restore();return;}
 switch(e.kind){
  case 'spear':slash(c,e,t,p);break;
  case 'frost-finisher':{
   c.save();c.rotate(e.angle);line(c,[[-84,0],[54,0]],p[1],3,fade*.65);polygon(c,[[-76,-3],[66,0],[-76,3],[-35,0]],p[3],fade);c.restore();
   for(let i=0;i<5;i++){const delay=i*.025,q=clamp((t-.16-delay)/.7),h=Math.sin(q*Math.PI)*(32+i%2*17),x=(i-2)*19;polygon(c,[[x-5,24],[x-2,-h],[x+3,-h-8],[x+7,22]],p[1],(1-q)*.8);polygon(c,[[x-2,23],[x+1,-h],[x+3,-h-8],[x+2,22]],p[2],(1-q)*.9);}
   if(t>.27)sparks(c,e,(t-.27)/.73,p[3],12,1.1);break;}
  case 'arcane-wave':{
   for(let i=0;i<3;i++){const q=clamp((t-i*.07)/(.76-i*.07)),r=20+ease(q)*65;const a=(1-q)*clamp(q*10);crescent(c,(i-1)*8,5-i*4,r,-.36+i*.32,8,p[i===1?3:2],a*.8);}
   if(t>.2)for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2+t*.5,r=22+ease((t-.2)/.8)*44;facet(c,Math.cos(a)*r,Math.sin(a)*r*.6,4,p[2],fade*.65,a);}break;}
  case 'guard':case 'veil':{
   const radius=58*appear,alpha=(1-smooth((t-.63)/.37))*.8,col=e.kind==='veil'?p[2]:p[2];
   const pts=[[-radius*.75,27],[-radius,-8],[-radius*.57,-51],[0,-64],[radius*.57,-51],[radius,-8],[radius*.75,27]];
   polygon(c,pts,p[0],alpha*.2);line(c,pts,col,2,alpha);
   for(const side of [-1,1]){polygon(c,[[side*radius*.58,-49],[side*radius*.9,-10],[side*radius*.67,-16],[side*radius*.4,-45]],p[1],alpha*.14);line(c,[[side*radius*.78,-34],[side*radius*.9,-12]],p[3],1,alpha*.65);}
   line(c,[[-radius*.7,22],[-radius*.9,-8],[-radius*.52,-46],[0,-58],[radius*.52,-46],[radius*.9,-8],[radius*.7,22]],p[1],1,alpha*.8);
   for(let i=0;i<3;i++){const x=(i-1)*27;line(c,[[x-9,-27],[x,-39],[x+9,-27],[x,-15],[x-9,-27]],p[3],1,alpha*.55);}
   if(e.kind==='veil'){crescent(c,0,15,70,-.15,6,p[2],alpha*.5);for(let i=0;i<3;i++)facet(c,(i-1)*19,23-t*50,3,p[3],alpha*.7);}
   break;}
  case 'guard-hit':{
   const q=ease(t/.35);line(c,[[-37,29],[-52,-2],[-27,-40],[8,-49],[33,-25]],p[2],3,fade);line(c,[[-32,24],[-45,-3],[-23,-34],[7,-42]],p[3],1,fade*.9);
   for(let i=0;i<6;i++){const x=-22-q*(20+i*5),y=-22+(i-2)*13*q;facet(c,x,y,(5-i*.4)*(1-t),p[i%2?2:3],fade,i*.4);}break;}
  case 'counter':{
   const q=ease((t-.12)/.3);c.save();c.rotate(-.65);polygon(c,[[-62,-4],[57*q,-1],[70*q,1],[-62,5],[-28,0]],p[2],fade);line(c,[[-45,0],[68*q,0]],p[3],1,fade);c.restore();if(t>.24)sparks(c,e,(t-.24)/.76,p[2],7,.8);break;}
  case 'feint':{
   crescent(c,-9,8,52*appear,-.65,8,p[2],fade*.9);crescent(c,10,-8,39*ease((t-.15)/.35),2.3,4,p[3],fade*.7);if(t>.2)sparks(c,e,(t-.2)/.8,p[1],5,.6);break;}
  case 'rally':case 'focus':{
   const q=clamp(t/.7),rise=34*ease(q);for(let i=0;i<3;i++){const x=(i-1)*19,delay=i*.07;facet(c,x,20-rise-Math.max(0,t-delay)*16,4,p[i===1?3:2],fade);line(c,[[x,22],[x,14-rise]],p[1],1,fade*.55);}
   line(c,[[-29,28],[-10,20],[10,20],[29,28]],p[2],1,fade);if(e.kind==='focus'){line(c,[[-18,-34],[-7,-34],[-7,-23]],p[3],1,fade);line(c,[[18,-34],[7,-34],[7,-23]],p[3],1,fade);}break;}
  case 'wind-cleave':{
   for(let i=0;i<3;i++){const q=clamp((t-i*.06)/.8),r=36+ease(q)*43;crescent(c,-8+i*5,8-i*4,r,-.45+i*.08,11-i*2,p[3-i%2],(1-q)*.9);}
   line(c,[[-72,27],[-34,14],[12,22],[62,2]],p[1],1,fade*.6);if(t>.25)sparks(c,e,(t-.25)/.75,p[2],9,1.15);break;}
  case 'night-thrust':{
   c.save();c.rotate(e.angle-.2);polygon(c,[[-64,-3],[4,-8],[67,0],[3,8],[-64,3],[-18,0]],p[0],fade*.85);line(c,[[-57,-3],[8,-5],[62,0]],p[2],2,fade);line(c,[[-40,3],[9,4],[62,0]],p[3],1,fade*.8);c.restore();if(t>.3)for(let i=0;i<3;i++){const x=(i-1)*19;line(c,[[x-5,-10],[x,12+25*ease((t-.3)/.7)],[x+5,0]],p[1],1,fade);}break;}
  case 'venom-mark':{
   crescent(c,-8,4,52*appear,-.8,7,p[2],fade);const q=clamp((t-.25)/.25);line(c,[[-18,-24],[0,-35],[18,-24],[18,7],[0,23],[-18,7],[-18,-24]],p[1],2,q*fade);line(c,[[-7,-6],[0,-13],[7,-6],[0,9],[-7,-6]],p[3],1,q*fade);if(t>.3)sparks(c,e,(t-.3)/.7,p[2],5,.5);break;}
  case 'abyss-hit':{
   const q=ease((t-.1)/.26);for(let i=0;i<3;i++){const x=(i-1)*18;polygon(c,[[x-25,-47],[x-13,-18],[x-18,6],[x+18,44*q],[x+3,6],[x+6,-10]],p[0],fade*.8);line(c,[[x-24,-43],[x-9,-17],[x-14,6],[x+16,39*q]],p[2],2,fade*.9);line(c,[[x-21,-42],[x-6,-17],[x-11,6]],p[3],1,fade*.6);}if(t>.25)sparks(c,e,(t-.25)/.75,p[1],7,.8);break;}
  case 'celestial-hit':{
   const q=ease((t-.06)/.25);line(c,[[-16,-72],[3,-25],[3,35*q]],p[3],2,fade);line(c,[[18,-65],[-3,-23],[-3,34*q]],p[2],1,fade);line(c,[[-32,1],[0,-22],[32,1],[0,24],[-32,1]],p[1],2,fade*.8);facet(c,0,0,16*(1-t),p[3],fade);if(t>.2)sparks(c,e,(t-.2)/.8,p[2],8,.7);break;}
  case 'abyss-charge':case 'celestial-charge':{
   const r=33*(1-.35*appear),alpha=Math.sin(Math.PI*t)*.8;
   if(e.kind==='abyss-charge'){line(c,[[-r,-22],[-r*.5,-8],[-r*.7,7],[0,31],[r*.2,8],[r,-11],[r*.6,-31]],p[2],2,alpha);for(let i=0;i<5;i++){const a=i*1.3+t*2;facet(c,Math.cos(a)*r,Math.sin(a)*r*.7,3,p[1],alpha,a);}}
   else{line(c,[[0,-r],[r,0],[0,r],[-r,0],[0,-r]],p[2],1,alpha);line(c,[[-r*.7,-r*.7],[r*.7,-r*.7],[r*.7,r*.7],[-r*.7,r*.7],[-r*.7,-r*.7]],p[1],1,alpha*.65);facet(c,0,0,8*appear,p[3],alpha);}
   break;}
  case 'collapse':{
   const q=ease(t/.3);for(let i=0;i<4;i++){const x=(i-1.5)*19;line(c,[[x-12,-56],[x+3,-24],[x-9,-4],[x+8,26],[x,47]],p[0],7,fade*.7);line(c,[[x-12,-56],[x+3,-24],[x-9,-4],[x+8,26]],p[2],1.5,fade*.8*q);}for(let i=0;i<5;i++)facet(c,(i-2)*18,-15+t*48,5,p[1],fade,i);break;}
  case 'recover':{
   for(let i=0;i<5;i++){const a=i*Math.PI*.4,r=18+ease(t)*40;facet(c,Math.cos(a)*r,Math.sin(a)*r*.6,5*(1-t*.7),p[2],fade,a);}
   line(c,[[-33,22],[-20,3],[-9,12],[12,-20],[24,-8],[37,-34]],p[3],2,fade);break;}
  case 'dissolve':{
   for(let i=0;i<15;i++){const x=(hash(e.seed,i)-.5)*62,y=(hash(e.seed,i+17)-.5)*60-35*ease(t),size=(3+hash(e.seed,i+31)*5)*(1-t*.7);c.globalAlpha=fade;c.fillStyle=p[i%3];c.fillRect(Math.round(x),Math.round(y),Math.ceil(size),Math.ceil(size*.7));}break;}
  case 'flame-heal':{
   const life=clamp(t/.16)*(1-smooth((t-.8)/.2));
   for(let i=0;i<5;i++){const phase=(t*1.35+i*.173)%1,x=(i-2)*15+Math.sin(t*6+i)*3,base=40-(i%2)*5,h=32+Math.sin(t*5+i)*9+phase*23,w=9-(i%2)*2;
    const a=life*(.55+(1-phase)*.25);polygon(c,[[x-w,base],[x-w*1.2,base-h*.35],[x+2,base-h*.68],[x-2+Math.sin(t*11+i)*5,base-h],[x+w*.75,base-h*.58],[x+w,base-h*.23],[x+w*.7,base]],p[1],a*.65);
    polygon(c,[[x-w*.6,base],[x-3,base-h*.3],[x+4,base-h*.57],[x+1,base-h*.81],[x+w*.45,base-h*.3],[x+w*.3,base]],p[2],a*.75);
    polygon(c,[[x-2,base],[x-2,base-h*.22],[x+1,base-h*.42],[x+3,base-h*.14],[x+2,base]],p[3],a*.8);
   }
   for(let i=0;i<10;i++){const phase=(t*.92+i*.137)%1,x=(hash(e.seed,i)-.5)*79+Math.sin(phase*4+i)*4,y=29-phase*97;c.globalAlpha=life*Math.sin(phase*Math.PI)*.8;c.fillStyle=p[i%2?2:3];c.fillRect(Math.round(x),Math.round(y),2,3);}
   line(c,[[-38,44],[-21,48],[2,47],[23,48],[39,43]],p[1],2,life*.35);break;}
 }
 c.restore();
}

// Deterministic drawing entry point shared by asset review and geometry validation.
export function drawEffectFrame(context,kind,progress,options={}){
 const spec=effectSpec(kind);if(!spec)return false;
 drawEffect(context,{...spec,seed:Number.isFinite(options.seed)?options.seed:1,angle:Number.isFinite(options.angle)?options.angle:0,quick:!!options.quick},clamp(Number.isFinite(progress)?progress:0));return true;
}

export class BespokeVFX{
 constructor({short=()=>false,glow=()=>.85}={}){this.short=short;this.glow=glow;this.effects=[];this.canvas=null;this.ctx=null;this.raf=0;this.serial=0;this.frame=0;this._tick=this._tick.bind(this);this._resize=()=>{this.clear();if(this.canvas)this._size();};this._hidden=()=>{if(document.hidden)this.clear();};}
 _ensure(){if(this.canvas?.isConnected)return;const n=document.createElement('canvas');n.id='bespoke-vfx';n.setAttribute('aria-hidden','true');n.dataset.active='';n.dataset.frame='0';n.dataset.phase='idle';Object.assign(n.style,{position:'fixed',inset:'0',width:'100vw',height:'100vh',pointerEvents:'none',zIndex:'45',imageRendering:'pixelated'});document.body.append(n);this.canvas=n;this.ctx=n.getContext('2d',{alpha:true});this.ink=document.createElement('canvas');this.inkCtx=this.ink.getContext('2d',{alpha:true});this._size();window.addEventListener('resize',this._resize,{passive:true});document.addEventListener('visibilitychange',this._hidden);}
 _size(){this.ratio=.5;this.canvas.width=Math.max(1,Math.ceil(innerWidth*this.ratio));this.canvas.height=Math.max(1,Math.ceil(innerHeight*this.ratio));this.ctx.imageSmoothingEnabled=false;this.ink.width=this.canvas.width;this.ink.height=this.canvas.height;this.inkCtx.imageSmoothingEnabled=false;}
 play(kind,anchor,options={}){const spec=effectSpec(kind);if(!spec||!anchor?.isConnected||typeof document==='undefined'||document.hidden)return Promise.resolve();this._ensure();const source=options.from?.isConnected?point(options.from):null,target=point(anchor,kind==='flame-heal'?.57:.52);const game=document.querySelector('#game'),gameScale=game?Number.parseFloat(game.style.getPropertyValue('--scale'))||1:1;const base=clamp(target.width/130,.3,1.25);const scale=base*clamp(Number(options.scale)||1,.4,2.5);const quick=!!this.short();const duration=quick?Math.min(130,spec.duration*.2):spec.duration;
  return new Promise(resolve=>{this.effects.push({kind,palette:spec.palette,seed:++this.serial,anchor,anchorY:kind==='flame-heal'?.57:.52,x:target.x,y:target.y,scale:scale*(options.strength>1?Math.min(1.3,1+(options.strength-1)*.12):1),angle:source?Math.atan2(target.y-source.y,target.x-source.x):0,started:performance.now(),duration,quick,resolve,viewportScale:gameScale,layer:anchor.closest('.cutin-shade')?75:45});this._data();if(!this.raf)this.raf=requestAnimationFrame(this._tick);});
 }
 _data(){if(this.canvas){this.canvas.dataset.active=[...new Set(this.effects.map(e=>e.kind))].join(' ');this.canvas.style.zIndex=this.effects.some(e=>e.layer>45)?'75':'45';if(!this.effects.length)this.canvas.dataset.phase='idle';}}
 _tick(now){this.raf=0;if(!this.ctx||!this.canvas?.isConnected){this.clear();return;}const c=this.inkCtx;c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,this.canvas.width,this.canvas.height);const keep=[];let progress=0;for(const e of this.effects){const t=(now-e.started)/e.duration;if(t>=1){e.resolve();continue;}if(e.anchor?.isConnected){const p=point(e.anchor,e.anchorY);e.x=p.x;e.y=p.y;}c.save();c.translate(e.x*this.ratio,e.y*this.ratio);c.scale(e.scale*this.ratio,e.scale*this.ratio);drawEffect(c,e,clamp(t));c.restore();progress=Math.max(progress,t);keep.push(e);}this.effects=keep;this.canvas.dataset.phase=keep.length?(progress<.25?'forming':progress<.68?'impact':'fading'):'idle';this.canvas.dataset.frame=String(++this.frame);this._data();const output=this.ctx;output.setTransform(1,0,0,1,0,0);output.clearRect(0,0,this.canvas.width,this.canvas.height);const glow=this.short()?0:clamp(Number(this.glow())||0);this.canvas.dataset.glow=String(glow);if(keep.length){if(glow){output.save();output.globalCompositeOperation='lighter';output.globalAlpha=.25+glow*.45;output.filter=`blur(${1.5+glow*2.5}px)`;output.drawImage(this.ink,0,0);output.restore();}output.drawImage(this.ink,0,0);}if(keep.length)this.raf=requestAnimationFrame(this._tick);else c.clearRect(0,0,this.canvas.width,this.canvas.height);}
 clear(){if(this.raf)cancelAnimationFrame(this.raf);this.raf=0;for(const e of this.effects)e.resolve();this.effects=[];if(this.ctx&&this.canvas){this.ctx.setTransform(1,0,0,1,0,0);this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);this._data();}}
 destroy(){this.clear();window.removeEventListener('resize',this._resize);document.removeEventListener('visibilitychange',this._hidden);this.canvas?.remove();this.canvas=null;this.ctx=null;this.ink=null;this.inkCtx=null;}
}
