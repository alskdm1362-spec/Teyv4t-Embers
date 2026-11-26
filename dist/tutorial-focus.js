import {TUTORIAL_COPY} from './condition-ui.js';
export function guidePosition(rect,width,height,viewWidth,viewHeight,other=[]){
 const clamp=(n,a,b)=>Math.max(a,Math.min(n,b)),gap=14,candidates=[{x:rect.x+rect.width+gap,y:rect.y},{x:rect.x-width-gap,y:rect.y},{x:rect.x+(rect.width-width)/2,y:rect.y-height-gap},{x:rect.x+(rect.width-width)/2,y:rect.y+rect.height+gap}];
 const all=[rect,...other],minY=Math.min(...all.map(r=>r.y)),maxY=Math.max(...all.map(r=>r.y+r.height));candidates.push({x:rect.x+(rect.width-width)/2,y:minY-height-gap},{x:rect.x+(rect.width-width)/2,y:maxY+gap});
 const overlap=(a,b)=>Math.max(0,Math.min(a.x+width,b.x+b.width)-Math.max(a.x,b.x))*Math.max(0,Math.min(a.y+height,b.y+b.height)-Math.max(a.y,b.y));
 return candidates.map(p=>({x:clamp(p.x,8,viewWidth-width-8),y:clamp(p.y,8,viewHeight-height-8)})).sort((a,b)=>[rect,...other].reduce((n,r)=>n+overlap(a,r)-overlap(b,r),0))[0];
}
export class TutorialFocus{
 constructor(getState,blocked){this.getState=getState;this.blocked=blocked;this.root=null;this.pending=0;window.addEventListener('resize',()=>this.update());}
 hide(){this.root?.remove();this.root=null;}
 update(){this.until=performance.now()+550;cancelAnimationFrame(this.pending);const tick=()=>{this.paint();if(performance.now()<this.until)this.pending=requestAnimationFrame(tick);};this.pending=requestAnimationFrame(tick);}
 paint(){const s=this.getState(),step=s.tutorial?.step;if(!s.tutorial?.active||s.phase!=='battle'||this.blocked()){this.hide();return;}
 const hand=key=>[...document.querySelectorAll('.hand [data-card]')].find(el=>s.battle.hand.find(c=>c.uid===el.dataset.card)?.key===key),attack=hand('l_pierce'),guard=hand('l_guard'),enemy=document.querySelector('[data-enemy]'),end=document.querySelector('[data-action="end-turn"]'),partner=document.querySelector('[data-action="support"][data-hero="lohen"]'),ability=document.querySelector('[data-skill-card]');
 const targets=({cost:[document.querySelector('.hand')],'attack-select':[attack],'attack-use':[enemy,attack],'defense-select':[guard],'defense-use':[guard],'end-turn':[end,document.querySelector('.ap-meter')],refill:[document.querySelector('.ap-meter')],'partner-intro':[partner],'partner-select':[partner],'partner-use':[enemy,ability],free:[]})[step]||[];
 let rects=targets.filter(Boolean).map(el=>{const r=el.getBoundingClientRect(),pad=7;return {x:Math.max(0,r.x-pad),y:Math.max(0,r.y-pad),width:r.width+pad*2,height:r.height+pad*2};});
 if(step==='cost'){
  const cards=[...document.querySelectorAll('.hand [data-card]')].map(el=>el.getBoundingClientRect());
  if(cards.length){
   const x=Math.max(0,Math.min(...cards.map(r=>r.left))-5),y=Math.max(0,Math.min(...cards.map(r=>r.top))-5);
   rects=[{x,y,width:Math.min(innerWidth,Math.max(...cards.map(r=>r.right))+5)-x,height:Math.min(innerHeight,Math.max(...cards.map(r=>r.bottom))+5)-y}];
  }
 }
 if(!this.root){this.root=document.createElement('div');this.root.id='tutorial-focus';document.body.append(this.root);}
 const [title,text]=TUTORIAL_COPY[step]||TUTORIAL_COPY.free,w=innerWidth,h=innerHeight,path=`M0 0H${w}V${h}H0Z`+rects.map(r=>`M${r.x} ${r.y}v${r.height}h${r.width}v-${r.height}Z`).join('');
 if(this.root.dataset.step!==step)this.root.innerHTML=`${rects.length?`<svg class="tutorial-mask" width="${w}" height="${h}" aria-hidden="true"><defs><mask id="tutorial-cutout"><rect width="100%" height="100%" fill="white"/><g class="tutorial-holes">${rects.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="black"/>`).join('')}</g></mask></defs><rect class="tutorial-dimmer" width="100%" height="100%" mask="url(#tutorial-cutout)"/><path class="tutorial-blocker" d="${path}" fill-rule="evenodd"/><g class="tutorial-rings">${rects.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="5"/>`).join('')}</g></svg>`:''}<div class="tutorial-callout"><aside class="tutorial-note" aria-label="튜토리얼 안내" aria-live="polite"><strong>${title}</strong><p>${text}</p>${['cost','refill'].includes(step)?'<button data-action="tutorial-next"><span aria-hidden="true">◆</span> 다음</button>':''}</aside><button class="tutorial-skip-near" data-action="tutorial-skip">스킵</button></div>`;
 const svg=this.root.querySelector('.tutorial-mask');if(svg){svg.setAttribute('width',w);svg.setAttribute('height',h);svg.querySelector('path').setAttribute('d',path);svg.querySelector('.tutorial-holes').innerHTML=rects.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="black"/>`).join('');svg.querySelector('.tutorial-rings').innerHTML=rects.map(r=>`<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" rx="5"/>`).join('');}
 const mask=this.root.querySelector('.tutorial-mask path');if(mask&&!mask.dataset.bound){mask.dataset.bound='true';for(const event of ['pointerdown','click'])mask?.addEventListener(event,e=>{e.stopPropagation();e.preventDefault();});}
 const box=this.root.querySelector('.tutorial-callout'),r=box.getBoundingClientRect(),p=rects.length?guidePosition(rects[0],r.width,r.height,w,h,rects.slice(1)):{x:Math.max(8,(w-r.width)/2),y:75};box.style.left=p.x+'px';box.style.top=p.y+'px';this.root.dataset.step=step;
 }
}
