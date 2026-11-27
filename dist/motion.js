import {sortSceneDepth} from './scene-interactions.js';
import {HEROES,cardInfo} from './engine.js';
import {CAST_SPRITES,castPose} from './cast-art.js';
import {presentationPlan} from './motion-plan.js';
import {SuppliedVFX,blindnessTransitions,cardTexture} from './supplied-vfx.js';
import {CameraFeedback} from './feedback.js';
import {ATTACK_SOUNDS} from './sound.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const center=(el,y=.5)=>{const r=el.getBoundingClientRect();return {x:r.left+r.width*.5,y:r.top+r.height*y};};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export class BattleMotion{
 constructor(options){Object.assign(this,options);this.vfx=new SuppliedVFX({short:()=>this.short(),glow:()=>this.glow?.()??.85});this.camera=new CameraFeedback({enabled:()=>!!this.shake?.()&&!this.short()});this.pending=new Set();}
 effect(kind,anchor,options={}){const p=this.vfx.play(kind,anchor,options);this.pending.add(p);p.finally(()=>this.pending.delete(p));return p;}
 unit(el){return el?.querySelector('.sprite')||el;}
 // Swap the acting hero to the pose that matches the card, then back to idle.
 pose(owner,action,before,effects,source){const sp=CAST_SPRITES[owner];if(!sp||!source?.classList?.contains('sprite')||this.getState().heroes?.[owner]?.breakdown)return null;
  const played=before.battle?.hand.find(c=>c.uid===action.uid),info=played?cardInfo(before,played):{},P=sp.poses;let pose;
  if(effects.some(e=>e.type==='damage'))pose=P.attack2&&(this.swing=(this.swing||0)+1)%2===0?'attack2':'attack1';
  else if((info.type==='draw'||effects.some(e=>e.type==='draw'))&&P.draw)pose='draw';
  else if(effects.some(e=>e.type==='shield'||e.type==='cover')||info.type==='guard')pose='guard';
  else pose=P.buff?'buff':'guard';
  const old=source.getAttribute('src'),t0=performance.now();source.src=castPose(owner,pose);source.style.scale=String(sp.base*P[pose]);source.classList.add('posed');source.dataset.pose=pose;
  return async()=>{const left=this.ms(420)-(performance.now()-t0);if(left>0)await wait(left);if(source.isConnected){source.src=old;source.style.scale='';source.classList.remove('posed');delete source.dataset.pose;}};}
 ms(n){return this.short()?Math.min(65,n*.2):n;}
 async animate(el,frames,duration=300,options={}){if(!el?.isConnected)return;const {retain=false,...timing}=options,a=el.animate(frames,{duration:this.ms(duration),easing:'cubic-bezier(.2,.7,.25,1)',fill:'both',...timing});try{await a.finished;}catch{}if(!retain)a.cancel();return a;}
 callout(text,enemy=false){const el=$('.battle-callout');if(!el)return;el.textContent=text;el.classList.add('visible');el.classList.toggle('enemy-call',enemy);}
 async float(el,text,kind=''){if(!el)return;const p=center(el,.42),n=document.createElement('span');n.className='floating-number '+kind;n.textContent=text;n.style.left=p.x+'px';n.style.top=p.y+'px';document.body.append(n);await this.animate(n,[{opacity:0,transform:'translate(-50%,-20%) scale(.7)'},{opacity:1,transform:'translate(-50%,-65%) scale(1.12)',offset:.22},{opacity:1,transform:'translate(-50%,-95%) scale(1)',offset:.6},{opacity:0,transform:'translate(-50%,-160%) scale(.95)'}],650);n.remove();}
 cloneCard(el){const r=el.getBoundingClientRect(),sc=parseFloat($('#game').style.getPropertyValue('--scale'))||1,n=el.cloneNode(true);n.removeAttribute('data-card');n.removeAttribute('aria-label');n.setAttribute('aria-hidden','true');n.classList.remove('inspected','unaffordable');n.classList.add('motion-card');Object.assign(n.style,{position:'fixed',left:(r.left+r.width/2-el.offsetWidth*sc/2)+'px',top:(r.top+r.height/2-el.offsetHeight*sc/2)+'px',width:el.offsetWidth*sc+'px',height:el.offsetHeight*sc+'px',transform:'none',zIndex:'65',margin:'0',pointerEvents:'none'});document.body.append(n);return n;}
 async leave(uid,destination='discard',played=false){const el=$(`[data-card="${uid}"]`),pile=$(`[data-pile="${destination==='exhaust'?'discard':destination}"]`);if(!el||!pile)return;void this.sound('card_discard',{gain:played ? .3 : .5,ui:true});const clone=this.cloneCard(el),a=center(clone),b=center(pile);el.style.visibility='hidden';if(played){await this.animate(clone,[{transform:'translate(0,0) scale(1)'},{transform:'translate(0,-85px) scale(1.1)',filter:'brightness(1.35)'}],190);clone.style.top=(parseFloat(clone.style.top)-85)+'px';}
 const dx=b.x-a.x,dy=b.y-a.y+(played?85:0);
 if(destination==='exhaust'){void this.effect('dissolve',clone,{scale:1});await this.animate(clone,[{opacity:1,transform:'scale(1)'},{opacity:.7,transform:'translateY(-35px) scale(.96)',filter:'brightness(2)',offset:.3},{opacity:0,transform:'translateY(-65px) scale(.15) rotate(13deg)',filter:'brightness(2)'}],350);}
 else await this.animate(clone,[{opacity:1,transform:'translate(0,0) scale(1)'},{opacity:1,transform:`translate(${dx*.55}px,${dy*.4-45}px) scale(.65) rotate(12deg)`,offset:.5},{opacity:0,transform:`translate(${dx}px,${dy}px) scale(.12) rotate(28deg)`}],320);
 clone.remove();pile.classList.add('fx-pulse');setTimeout(()=>pile.classList.remove('fx-pulse'),this.ms(250));}
 async deal(uids,shuffle=false){const nodes=uids.map(uid=>$(`[data-card="${uid}"]`)).filter(Boolean),pile=$('[data-pile="draw"]');if(!nodes.length||!pile)return;nodes.forEach(n=>n.style.visibility='hidden');if(shuffle){this.callout('버린 카드를 다시 섞습니다');await this.animate(pile,[{transform:'translateX(0) rotate(0)'},{transform:'translateX(7px) rotate(8deg)',offset:.3},{transform:'translateX(-7px) rotate(-8deg)',offset:.6},{transform:'translateX(0) rotate(0)'}],250);}
 await Promise.all(nodes.map(async(el,i)=>{await wait(this.ms(i*55));const n=this.cloneCard(el),a=center(pile),b=center(n),dx=a.x-b.x,dy=a.y-b.y;n.style.visibility='visible';n.classList.add('card-back');await this.animate(n,[{transform:`translate(${dx}px,${dy}px) scale(.16) rotate(-25deg)`,opacity:0},{transform:`translate(${dx*.3}px,${dy*.5-45}px) scale(.8) rotate(-8deg)`,opacity:1}],220);n.classList.remove('card-back');await this.animate(n,[{transform:`translate(${dx*.3}px,${dy*.5-45}px) scale(.8) rotate(-8deg)`,opacity:1},{transform:'translate(0,0) scale(1.03) rotate(0)',opacity:1,offset:.8},{transform:'translate(0,0) scale(1) rotate(0)',opacity:1}],180);n.remove();el.style.visibility='';void this.sound('card_flip',{gain:.8,ui:true});}));}
 async morph(before,heroes){if(!heroes.length)return;void this.sound('card_morph',{gain:.65});const after=this.getState(),nodes=$$('.hand [data-card]').filter(el=>heroes.includes(el.dataset.owner));for(const id of heroes){const broken=after.heroes[id].breakdown;this.callout(broken?before.heroes[id]?.breakdown?`${HEROES[id].name} · 극복 실패 ${broken.failures}/10 · 위험 상승`:`${HEROES[id].name} · 모든 고유 카드 변질`:`${HEROES[id].name} · 고유 카드 복원`);const actor=$(`[data-ally="${id}"]`);if(actor){actor.classList.toggle('collapsed',!!broken);void this.effect(broken?'collapse':'recover',this.unit(actor),{scale:1});}void this.float($(`[data-hud="${id}"]`),broken?'정신 붕괴':'붕괴 극복',broken?'stress':'heal');}
 await Promise.all(nodes.map(async(el,i)=>{const c=after.battle?.hand.find(c=>c.uid===el.dataset.card)||before.battle?.hand.find(c=>c.uid===el.dataset.card);if(!c)return;await wait(this.ms(i*35));el.classList.add('card-morph');const t=getComputedStyle(el).transform;await this.animate(el,[{transform:t,filter:'brightness(1)'},{transform:'translateY(-15px) rotateY(90deg)',filter:'brightness(2)'}],150);const temp=document.createElement('div');temp.innerHTML=this.cardHTML(c,i,nodes.length);const face=temp.firstElementChild;el.innerHTML=face.innerHTML;el.classList.toggle('broken',!!after.heroes[c.owner].breakdown);await this.animate(el,[{transform:'translateY(-15px) rotateY(-90deg)',filter:'brightness(2)'},{transform:t,filter:'brightness(1)'}],200);el.classList.remove('card-morph');}));await wait(this.ms(130));}
 async burnCard(el,face,hold){const old=await cardTexture(el),next=await cardTexture(face);await this.vfx.raw('cardBurnTransition',el,{card:true,cardImgA:old,cardImgB:next,hold});el.innerHTML=face.innerHTML;el.classList.toggle('blind-card',face.classList.contains('blind-card'));}
 async blindMorph(before){const after=this.getState(),uids=blindnessTransitions(before,after);await Promise.all(uids.map(async uid=>{const el=$(`[data-card="${uid}"]`),c=after.battle.hand.find(c=>c.uid===uid);if(!el||!c)return;const div=document.createElement('div');div.innerHTML=this.cardHTML(c,0,1);await this.burnCard(el,div.firstElementChild);}));}
 async previewBlind(hero,hold=false){const el=$(`.hand [data-card][data-owner="${hero}"]`);if(!el)return;const c=this.getState().battle.hand.find(c=>c.uid===el.dataset.card);if(!c)return;const next=structuredClone(this.getState());next.heroes[hero].body.eyes=3;next.heroes[hero].breakdown=null;const div=document.createElement('div');div.innerHTML=this.cardHTML(c,0,1,{viewState:next});const old=el.cloneNode(true);el.classList.add('inspected');await wait(this.ms(220));await this.burnCard(el,div.firstElementChild,hold ? .55 : undefined);await wait(this.ms(500));el.innerHTML=old.innerHTML;el.className=old.className;}
 hudDamage(hp,shield){const label=$('[data-hp-number]'),bar=$('.team-health .party-hp>i'),sh=$('[data-shield-number]');if(label)label.innerHTML=`${hp}<small> / ${this.getState().maxHp}</small>`;if(bar)bar.style.width=(hp/this.getState().maxHp*100)+'%';if(sh)sh.textContent='◇ '+shield;const sb=$('.shared-shield');if(sb)sb.style.width=Math.min(100,shield/this.getState().maxHp*100)+'%';}
 async enemyStep(group,live){
  const actor=$(`[data-enemy="${group.enemy}"]`),target=group.hostile?$(`[data-ally="${group.hero}"]`):null;if(!actor)return;
  const celestial=actor.dataset.realm==='celestial'||['keeper','sentinel','star'].includes(actor.dataset.kind),heroName=HEROES[group.hero]?.name||'파티',line=$(`[data-threat="${group.enemy}"]`);
  actor.classList.add('enemy-attacking');target?.classList.add('target-locked');line?.classList.add('focused');
  void this.sound(celestial?'resource':'abyss_cast',{gain:.55});this.callout(`${actor.querySelector('h3')?.textContent||'적'} · ${group.name}${group.hostile?' → '+heroName:''}`,true);await wait(this.ms(230));
  const sprite=this.unit(actor);let visual=Promise.resolve();
  if(group.hostile){void this.animate(sprite,[{transform:'translateX(0)'},{transform:'translateX(10px) scale(.97)',offset:.25},{transform:'translateX(-23px)',offset:.6},{transform:'translateX(0)'}],310);}
  else{const ward=this.getState().battle?.enemies.find(e=>e.id===group.enemy);visual=ward&&(ward.ward||ward.hitWard)?this.effect('guard',sprite,{enemy:true,celestial,shield:true}):this.effect(celestial?'celestial-charge':'abyss-charge',sprite);void this.float(actor,group.name,'label');}
  const hit=group.effects.find(e=>e.type==='enemyAttack');
  if(hit&&target){visual=this.effect(hit.blocked?'guard-hit':celestial?'celestial-hit':'abyss-hit',this.unit(target),{from:sprite,scale:1,hero:group.hero,shield:!!hit.blocked});await wait(this.ms(95));
   live.hp=Math.max(0,live.hp-hit.amount);live.shield=Math.max(0,live.shield-hit.blocked);this.hudDamage(live.hp,live.shield);target.classList.add(hit.amount?'ally-hit':'shielded');
   if(hit.blocked)void this.float(target,'◇ '+hit.blocked,'shield');if(hit.amount){void this.float(target,'−'+hit.amount);if(hit.blocked)void this.effect(celestial?'celestial-hit':'abyss-hit',this.unit(target),{scale:.7});}else if(hit.blocked)void this.float($('[data-shield-number]'),'방어','shield');void this.sound(hit.blocked?'shield_hit':celestial?'celestial_hit':'abyss_hit',{gain:hit.blocked ? .8 : 1});this.camera.hit(hit.amount?Math.min(2,hit.amount/12):.3);
  }else if(target)visual=this.effect(celestial?'celestial-charge':'abyss-charge',this.unit(target),{from:sprite,scale:.85});
  for(const e of group.effects){
   if(e.type==='stress'){const hud=$(`[data-hud="${e.hero}"]`);void this.float(hud,'정신 +'+e.amount,'stress');const bar=hud?.querySelector('.hud-stress i');live.stress[e.hero]=Math.min(100,(live.stress[e.hero]||0)+e.amount);if(bar)bar.style.width=live.stress[e.hero]+'%';}
   if(e.type==='injury')void this.float($(`[data-ally="${e.hero}"]`),'신체 손상','stress');if(e.type==='retire')void this.float($(`[data-ally="${e.hero}"]`),'회복 전까지 이탈','label');
  }
  await visual;await wait(this.ms(110));actor.classList.remove('enemy-attacking');target?.classList.remove('target-locked','ally-hit','shielded');line?.classList.remove('focused');
 }
 async playerEffects(before,action,effects){
  const state=this.getState(),owner=action._owner||action.hero,actor=$(`[data-ally="${owner}"]`),source=this.unit(actor),hits=effects.filter(e=>e.type==='damage');
  actor?.classList?.add('acting');const isMelee=['lohen','illuga','jahoda','kinich','cyno'].includes(owner)&&action.type==='play'&&hits.length>0,unpose=['play','ultimate'].includes(action.type)?this.pose(owner,action,before,effects,source):null;
  let dashDist=null,dashHold=null;
  if(hits.length){
   if(isMelee&&actor&&source){
    const firstEnemy=$(`[data-enemy="${hits[0].enemy}"]`),sc=parseFloat($('#game')?.style.getPropertyValue('--scale'))||1;
    if(firstEnemy){
     // feet to feet: stop just short of the target's near edge, standing on the same ground line
     const sr=source.getBoundingClientRect(),er=this.unit(firstEnemy).getBoundingClientRect(),a={x:sr.left+sr.width/2,y:sr.bottom},b={x:er.left+er.width*.18,y:er.bottom};
     // the sprite carries a CSS scale (pose canvases); transform translate is applied inside it, so divide it out
     const k=(()=>{try{return parseFloat(getComputedStyle(source).scale)||1;}catch{return 1;}})(),dx=Math.max(36,(b.x-a.x)/sc-46)/k,dy=Math.max(-40,Math.min(40,(b.y-a.y)/sc))/k;
     dashDist={dx,dy};
     actor.classList.add('melee-dashing');
     dashHold=await this.animate(source,[{transform:'translate(0,0) scale(1)'},{transform:`translate(${dx}px,${dy}px) scale(1.06)`}],165,{easing:'cubic-bezier(.15,.85,.25,1)',retain:true});sortSceneDepth();
    }else void this.animate(source,[{transform:'translateX(0)'},{transform:'translateX(26px)',offset:.5},{transform:'translateX(0)'}],260);
   }else void this.animate(source,[{transform:'translateX(0)'},{transform:'translateX(20px)',offset:.5},{transform:'translateX(0)'}],260);
   await Promise.all(hits.map(async(e,index)=>{
    const enemy=$(`[data-enemy="${e.enemy}"]`);if(!enemy)return;
    const repeat=hits.slice(0,index).some(hit=>hit.enemy===e.enemy),kind=repeat?'counter':action.type==='support'?({lohen:'wind-cleave',durin:'veil',illuga:'night-thrust',jahoda:'venom-mark',kinich:'wind-cleave',lyney:'veil',cyno:'venom-mark'})[owner]:action.type==='ultimate'?({lohen:'frost-finisher',durin:'arcane-wave',illuga:'counter',jahoda:'feint',kinich:'spear',lyney:'arcane-wave',cyno:'frost-finisher'})[owner]:({lohen:'spear',durin:'arcane-wave',illuga:'counter',jahoda:'feint'})[owner]||'spear';
    if(repeat)await wait(this.ms(100));const cue=(action.type==='ultimate'&&ATTACK_SOUNDS[kind+':ult'])||ATTACK_SOUNDS[kind]||ATTACK_SOUNDS.spear;if(index===0)void this.sound(cue[0],{gain:.7});const wing=owner==='durin'&&action.type==='ultimate',visual=wing&&index>0?Promise.resolve():this.effect(kind,wing?source:this.unit(enemy),{from:source,hero:owner,ultimate:action.type==='ultimate',scale:action.type==='ultimate'?1.3:1,strength:action.type==='ultimate'?2:1});await wait(this.ms(90));if(index===0||repeat)void this.sound(cue[1],{gain:repeat ? .6 : 1});this.camera.hit(action.type==='ultimate'?2:repeat ? .5 : .8);enemy.classList.add('enemy-hit');const damageText=this.float(enemy,e.amount);
    const next=state.battle?.enemies.find(n=>n.id===e.enemy);if(next){const bar=enemy.querySelector('.hpbar i');if(bar)bar.style.width=(next.hp/next.maxHp*100)+'%';const label=enemy.querySelector('.enemy-name>b');if(label)label.innerHTML=`${next.hp}<small> / ${next.maxHp}</small>`;}
    await wait(this.ms(120));enemy.classList.remove('enemy-hit');await Promise.all([visual,damageText]);
    if(effects.some(x=>x.type==='kill'&&x.enemy===e.enemy)){await this.effect('dissolve',this.unit(enemy),{scale:.8});await this.animate(enemy,[{opacity:1},{opacity:0,transform:'translateY(7px)'}],200);enemy.style.opacity='0';}
   }));
   if(dashDist&&actor&&source){
    const back=await this.animate(source,[{transform:`translate(${dashDist.dx}px,${dashDist.dy}px) scale(1.06)`},{transform:'translate(0,0) scale(1)'}],210,{easing:'cubic-bezier(.35,0,.2,1)',retain:true});dashHold?.cancel();back?.cancel();
    actor.classList.remove('melee-dashing');sortSceneDepth();
   }
  }
  for(const e of effects){
   if(e.type==='shield'){void this.sound('shield_cast',{gain:.75});void this.float($('[data-shield-number]'),'◇ +'+e.amount,'shield');for(const id of state.party.filter(id=>!state.heroes[id].retired)){const node=this.unit($(`[data-ally="${id}"]`));void this.effect(action.type==='support'&&owner==='durin'?'veil':'guard',node,{hero:owner,shield:true,scale:1,strength:action.type==='ultimate'?2:1});}}
   if(e.type==='cover')void this.effect('guard',this.unit($(`[data-ally="${e.hero}"]`)),{hero:owner||'illuga',shield:true,scale:.85});
   if(e.type==='friendlyFire'){this.callout('불신이 아군을 겨눕니다',true);void this.float($('[data-hp-number]'),'아군 피해 −'+e.amount,'stress');}
   if(e.type==='collapseFail')void this.float(actor,'극복 실패','stress');
   if(e.type==='break'){void this.effect('guard-hit',this.unit($(`[data-enemy="${e.enemy}"]`)),{enemy:true,celestial:$(`[data-enemy="${e.enemy}"]`)?.dataset.realm==='celestial',shield:true,scale:.8});void this.float($(`[data-enemy="${e.enemy}"]`),'장막 파괴','label');}
   if(e.type==='cardHeal'){void this.sound('heal',{gain:.65});void this.effect('recover',source);void this.float($('[data-hp-number]'),'+'+e.amount,'heal');}
   if(e.type==='resource'){void this.sound('resource',{gain:.6});void this.effect('rally',source);void this.float($('.ap-meter'),'+'+(e.amount||2)+' AP','heal');}
  }
  const played=before.battle?.hand.find(c=>c.uid===action.uid);if(played){const info=cardInfo(before,played);if(info.type==='focus'){void this.sound('resource',{gain:.4});void this.effect('focus',source);void this.float(actor,'공격 준비','label');}if(info.type==='energy'){void this.sound('resource',{gain:.65});void this.effect('rally',source);void this.float($('.ap-meter'),'행동력 회복','heal');}}
  if(state.hp!==before.hp||state.shield!==before.shield)this.hudDamage(state.hp,state.shield);
  void unpose?.();setTimeout(()=>actor?.classList?.remove('acting'),this.ms(420));
 }
 async present(before,action,events){const after=this.getState(),plan=presentationPlan(before,after,action,events);this.onBusy(true);try{
 const wasBattle=before.phase==='battle'&&!!$('.battle');if(wasBattle){
  const departure=plan.played?this.leave(plan.played.uid,plan.played.destination,true):Promise.resolve();
  if(plan.attacks.length){$$('.threat-path').forEach(n=>n.style.opacity='0');this.callout('ENEMY TURN',true);const live={hp:before.hp,shield:before.shield,stress:Object.fromEntries(before.party.map(id=>[id,before.heroes[id].stress]))};for(const group of plan.attacks){const line=$(`[data-threat="${group.enemy}"]`);if(line)line.style.opacity='1';await this.enemyStep(group,live);if(line)line.style.opacity='0';}}
  const special=events.find(e=>e.type==='ultimate'||e.type==='support');if(special)await this.cutin(special.hero,special.type);
  {const mode=events.find(e=>e.type==='mode');if(mode){if(mode.first&&!events.some(e=>e.type==='card'))await this.cutin('kinich','ultimate');const k=$('[data-ally="kinich"]');if(k){k.classList.remove('mode-flash');void k.offsetWidth;k.dataset.modeFlash=mode.mode;k.classList.add('mode-flash');setTimeout(()=>k.classList.remove('mode-flash'),this.ms(320));}void this.sound('card_flip',{gain:.7,ui:true});}}
  await this.playerEffects(before,action,plan.effects);await departure;
  for(const e of events.filter(e=>e.type==='injury'&&e.stage===3&&(before.heroes[e.hero]?.body[e.part]||0)<3))await this.cutin(e.hero,'injury-'+e.part);
  for(const hero of plan.collapseCutins)await this.cutin(hero,'breakdown');
  await this.blindMorph(before);await this.morph(before,plan.changed);await Promise.all([...this.pending]);
  if(plan.discarded.length)await Promise.all(plan.discarded.map((uid,i)=>wait(this.ms(i*22)).then(()=>this.leave(uid))));
 }
 if(events.some(e=>e.type==='victory')){void this.sound('stage_clear',{gain:.8});await this.effect('victory',$('.battle-field')||$('#screen'),{scale:.65});}this.render();
 if(after.phase==='battle'){
  if(plan.newBattle){this.callout('BATTLE START');for(const e of after.battle.enemies.filter(e=>e.hp>0&&(e.ward||e.hitWard)))void this.effect('guard',this.unit($(`[data-enemy="${e.id}"]`)),{enemy:true,celestial:['keeper','sentinel','star'].includes(e.kind),shield:true});}else if(action.type==='endTurn')this.callout(`YOUR TURN · ${String(after.battle.turn).padStart(2,'0')}`);
  await this.deal(plan.drawn,plan.shuffled);
  if(!plan.drawn.length&&plan.newBattle)await this.deal(after.battle.hand.map(c=>c.uid));
  const call=$('.battle-callout');if(call){await wait(this.ms(100));call.classList.remove('visible');}
 }
 await Promise.all([...this.pending]);
 }finally{this.camera.clear();this.vfx.clear();$$('.motion-card,.floating-number').forEach(n=>n.remove());this.onBusy(false);this.onDone();}}
}
