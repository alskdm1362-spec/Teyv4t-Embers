import {intersectBounds} from './visual-bounds.js';
// The supplied VFX pack is kept byte-for-byte (its hash is pinned). Some of its particles
// shrink past zero on their last frame; clamp the radius so canvas does not throw.
if(typeof CanvasRenderingContext2D!=='undefined'&&!CanvasRenderingContext2D.prototype.arc.__embersClamp){const arc=CanvasRenderingContext2D.prototype.arc;const safe=function(x,y,r,...rest){return arc.call(this,x,y,Math.max(0,r),...rest);};safe.__embersClamp=true;CanvasRenderingContext2D.prototype.arc=safe;}
import './vendor/game-vfx-pack.js';
import {BespokeVFX} from './vfx.js';
export const CAST_VFX={lohen:{attack:'spearThrust',ultimate:'daggerThrow',guard:'guardSky'},illuga:{attack:'spearSlash',ultimate:'goldenLightBeam',guard:'guardGold'},jahoda:{attack:'kickSweep',ultimate:'glintSparkle',guard:'guardCyanPink'},durin:{attack:'darkFireMagic',ultimate:'dragonWingFlap',guard:'guardDarkRed'}};
export function shieldEffect(hero,{enemy=false,celestial=false}={}){return enemy?(celestial?'guardWhite':'guardPinkPurple'):(CAST_VFX[hero]?.guard||'guardSky');}
export function suppliedEffect(kind,o={}){
 if(['guard','guard-hit','veil'].includes(kind)&&o.shield)return shieldEffect(o.hero,o);
 if(['spear','counter','feint','arcane-wave','frost-finisher'].includes(kind))return CAST_VFX[o.hero||'lohen']?.[o.ultimate?'ultimate':'attack'];
 return ({'wind-cleave':'spearThrust','night-thrust':'goldenLightBeam','venom-mark':'kickSweep','veil':'darkFireMagic',guard:shieldEffect(o.hero,o),'guard-hit':shieldEffect(o.hero,o),focus:'glintSparkle',rally:'glintSparkle','flame-heal':'warmFlameHeal','time-rewind':'clockRewind',victory:'stageClear','abyss-hit':'hitImpact','celestial-hit':'hitImpact'})[kind]||null;
}
export function hasPartyCollapse(state){return state.phase!=='title'&&state.party.some(id=>!!state.heroes[id]?.breakdown);}
export function blindnessTransitions(before,after){return (after.battle?.hand||[]).filter(c=>{const old=before.battle?.hand.find(n=>n.uid===c.uid);return old&&!(before.heroes[c.owner]?.body.eyes===3&&!before.heroes[c.owner]?.breakdown)&&!after.heroes[c.owner]?.breakdown&&after.heroes[c.owner]?.body.eyes===3;}).map(c=>c.uid);}
let prepared=false;
function prepare(){if(!prepared){new globalThis.GameVFXManager();prepared=true;}}
const screenRect=()=>({left:0,top:0,width:innerWidth,height:innerHeight});
function canvasLayer(parent=document.body,className='supplied-vfx',z=46){const n=document.createElement('canvas');n.className=className;n.setAttribute('aria-hidden','true');Object.assign(n.style,{position:parent===document.body?'fixed':'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:String(z)});parent.append(n);return n;}
export class SuppliedVFX{
 constructor(options={}){this.options=options;this.fallback=new BespokeVFX(options);this.effects=new Set();this.serial=0;this.hidden=()=>{if(document.hidden)this.clear();};document.addEventListener('visibilitychange',this.hidden);}
 play(kind,anchor,options={}){options={...options,scale:(options.scale||1)*1.35};const id=suppliedEffect(kind,options);if(!id)return this.fallback.play(kind,anchor,options);return this.raw(id,anchor,options);}
 raw(id,anchor,options={}){
  if(!anchor?.isConnected||document.hidden)return Promise.resolve();prepare();
  const parent=options.parent||document.body,n=canvasLayer(parent,'supplied-vfx '+(id==='screenShatter'?'supplied-shatter':''),parent===document.body?(anchor.closest('.cutin-shade')?75:46):0),ctx=n.getContext('2d'),ink=document.createElement('canvas'),ic=ink.getContext('2d'),r=(parent===document.body?screenRect():parent.getBoundingClientRect()),ratio=Math.min(1,devicePixelRatio||1);n.width=ink.width=Math.ceil(r.width*ratio);n.height=ink.height=Math.ceil(r.height*ratio);n.dataset.effect=id;n.style.opacity=String(options.opacity??1);
  const quick=!!this.options.short?.(),duration=quick?140:options.duration||({spearThrust:560,daggerThrow:520,dragonWingFlap:1100,darkFireMagic:1250,spearSlash:640,goldenLightBeam:1300,kickSweep:640,glintSparkle:1120,screenShatter:2150,cardBurnTransition:1500,warmFlameHeal:1500,clockRewind:1550,stageClear:1850})[id]||950;
  let frame=0,start=performance.now();return new Promise(resolve=>{const record={stop:()=>{cancelAnimationFrame(frame);n.remove();this.effects.delete(record);resolve();}};this.effects.add(record);
   const draw=now=>{if(!anchor.isConnected||document.hidden){record.stop();return;}const p=Number.isFinite(options.hold)?options.hold:Math.min(1,(now-start)/duration),a=anchor.getBoundingClientRect(),pr=parent===document.body?screenRect():parent.getBoundingClientRect(),full=['screenShatter'].includes(id),base=options.card?1:Math.max(.24,Math.min(1.2,a.width/200)),s=base*(options.scale||1),dir=options.from?.getBoundingClientRect().left>a.left?-1:1;let x=a.left+a.width/2-pr.left,y=a.top+a.height*.53-pr.top;if(id==='spearThrust')x-=260*s*dir;
    ic.setTransform(ratio,0,0,ratio,0,0);ic.clearRect(0,0,r.width,r.height);ic.save();if(options.card){ic.translate(x,y);ic.scale(a.width/112,a.height/160);x=0;y=0;}
    globalThis.GameVFXRenderers[id](ic,full?r.width*.5:x,full?r.height*.45:y,p,dir,s,options.seed||71,{w:r.width,h:r.height},{...options.timings,_elapsed:p*duration/1000,cardImgA:options.cardImgA,cardImgB:options.cardImgB});ic.restore();
    ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,n.width,n.height);const glow=quick?0:Math.max(0,Math.min(1,this.options.glow?.()??.85));if(glow&&!options.card&&!full){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=glow*.3;ctx.filter=`blur(${2+glow*3}px)`;ctx.drawImage(ink,0,0);ctx.restore();}ctx.drawImage(ink,0,0);n.dataset.progress=p.toFixed(2);if(Number.isFinite(options.hold)||p<1)frame=requestAnimationFrame(draw);else record.stop();};frame=requestAnimationFrame(draw);
  });
 }
 clear(){this.fallback.clear();for(const e of [...this.effects])e.stop();}
 destroy(){this.clear();this.fallback.destroy();document.removeEventListener('visibilitychange',this.hidden);}
}
// One persistent canvas for all visible collapse cards and the party's slow edge glitch.
// A transparent source deliberately keeps the real DOM card text legible; no demo card is drawn.
export class CollapseAtmosphere{
 constructor({getState,short=()=>false}={}){this.getState=getState;this.short=short;this.elapsed=0;this.last=0;this.frame=0;this.empty=null;this.visibility=()=>this.sync();document.addEventListener('visibilitychange',this.visibility);this.resize=()=>this.sync();window.addEventListener('resize',this.resize);}
 sync(){this.stop();if(document.hidden||this.short())return;const active=hasPartyCollapse(this.getState());if(!active&&!document.querySelector('.card.broken'))return;prepare();this.empty ||= document.createElement('canvas');this.empty.width=112;this.empty.height=160;this.canvas=canvasLayer(document.body,'collapse-atmosphere',64);this.canvas.width=Math.ceil(innerWidth*.7);this.canvas.height=Math.ceil(innerHeight*.7);this.canvas.dataset.glitch=String(active);this.last=performance.now();this.frame=requestAnimationFrame(now=>this.tick(now));}
 tick(now){this.frame=0;if(document.hidden||this.short()||!this.canvas?.isConnected){this.stop();return;}this.elapsed+=Math.min(.08,(now-this.last)/1000);this.last=now;const active=hasPartyCollapse(this.getState()),c=this.canvas.getContext('2d');c.setTransform(.7,0,0,.7,0,0);c.clearRect(0,0,innerWidth,innerHeight);
  this.canvas.dataset.glitch=String(active);if(active){c.save();c.globalAlpha=.55;globalThis.GameVFXRenderers.screenGlitch(c,0,0,(this.elapsed*.28/3.35)%1,1,1,159,{w:innerWidth,h:innerHeight},{_elapsed:this.elapsed*.28,edgeDepth:.1,burstFreq:.08});c.restore();}
  const cards=[...document.querySelectorAll('.card.broken')].filter(n=>!n.closest('[inert]')&&!n.closest('.motion-card')).filter(n=>{const r=n.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth;});this.canvas.dataset.cards=String(cards.length);
  for(const n of cards){const r=n.getBoundingClientRect(),list=n.closest('.status-v19-body,.czn-body,.shop-content,.surface-content'),clip=list?intersectBounds(list.getBoundingClientRect(),{left:0,top:0,right:innerWidth,bottom:innerHeight}):null;if(list&&(!clip||!intersectBounds(r,clip)))continue;c.save();if(clip){c.beginPath();c.rect(clip.left,clip.top,clip.width,clip.height);c.clip();}c.translate(r.left+r.width/2,r.top+r.height/2);c.scale(r.width/112,r.height/160);c.globalAlpha=.72;globalThis.GameVFXRenderers.cardOminousAura(c,0,0,(this.elapsed/2.4)%1,1,1,85,null,{_elapsed:this.elapsed,glitchFreq:.2,warpPower:.2,cardImgA:this.empty});c.restore();}
  if(!active&&!cards.length){this.stop();return;}this.frame=requestAnimationFrame(t=>this.tick(t));
 }
 stop(){cancelAnimationFrame(this.frame);this.frame=0;this.canvas?.remove();this.canvas=null;}
 destroy(){this.stop();document.removeEventListener('visibilitychange',this.visibility);window.removeEventListener('resize',this.resize);}
}
// Render the current card's real art and labels for the burn transition, never the pack's sample card.
export async function cardTexture(el){
 const image=el.querySelector('.card-art img');try{await image?.decode?.();}catch{}
 const canvas=document.createElement('canvas');canvas.width=224;canvas.height=320;const c=canvas.getContext('2d');c.fillStyle='#111720';c.fillRect(0,0,224,320);
 if(image?.naturalWidth){const k=Math.max(224/image.naturalWidth,320/image.naturalHeight),w=image.naturalWidth*k,h=image.naturalHeight*k;c.drawImage(image,(224-w)/2,(320-h)*.34,w,h);}
 c.fillStyle='#040914c9';c.fillRect(0,0,224,68);c.fillRect(0,216,224,82);c.strokeStyle=el.style.getPropertyValue('--accent')||'#d0dbe2';c.lineWidth=3;c.strokeRect(1,1,222,318);c.fillStyle='#f4f4ef';c.textBaseline='top';c.font='600 36px Paperlogy,sans-serif';c.fillText(el.querySelector('.card-cost')?.textContent||'?',10,7);c.font='600 18px Paperlogy,sans-serif';c.fillText(el.querySelector('.card-head b')?.textContent||'',51,12,163);c.font='14px Paperlogy,sans-serif';c.fillText(el.querySelector('.card-head small')?.textContent||'',51,38,163);c.textAlign='center';c.font='15px Paperlogy,sans-serif';const text=el.querySelector('.card-desc')?.textContent||'';let line='',lines=[];for(const ch of text){if(c.measureText(line+ch).width>204){lines.push(line);line=ch;}else line+=ch;}if(line)lines.push(line);lines.slice(0,4).forEach((l,i)=>c.fillText(l,112,224+i*17));return canvas;
}
