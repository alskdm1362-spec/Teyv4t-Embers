/* Single-element scene music. Audio volume and mix buses belong to SoundBank. */
export const MUSIC_TRACKS=Object.freeze({
 main:Object.freeze({id:'main',src:'assets/audio/bgm/main.mp3',label:'거점 · 메인'}),
 'stage-a':Object.freeze({id:'stage-a',src:'assets/audio/bgm/stage-a.mp3',label:'탐사 · 전반'}),
 'stage-b':Object.freeze({id:'stage-b',src:'assets/audio/bgm/stage-b.mp3',label:'탐사 · 후반'}),
 boss:Object.freeze({id:'boss',src:'assets/audio/bgm/boss.mp3',label:'정예 · 보스'}),
 'boss-final':Object.freeze({id:'boss-final',src:'assets/audio/bgm/boss-final.mp3',label:'최종 전선'}),
});

/** Chooses atmosphere only; it does not alter combat or the save state. */
export function sceneMusic(state={}){
 const phase=state.phase||'title',mode=state.mode||'route',node=Number(state.node)||0;
 if(['title','base','camp','ending'].includes(phase))return 'main';
 if(mode==='challenge')return Number(state.challengeStage)>=2?'boss-final':'boss';
 if(mode==='farm')return 'stage-a';
 // The current route's node 6 is the linked-ward elite. Outside that battle,
 // the late-route exploration/reward screen uses stage B.
 if(['battle','defeat'].includes(phase)&&(state.encounterType==='elite'||state.encounterType==='boss'||node===6))return 'boss';
 return node>=6?'stage-b':'stage-a';
}

export class MusicDirector{
 constructor(audio,{setMixGain=()=>{},onTrackChange=()=>{},onError=()=>{},fadeOut=.20,fadeIn=.22,visibilityTarget=globalThis.document}={}){
  if(!audio)throw new TypeError('MusicDirector requires one existing HTMLAudioElement.');
  this.audio=audio;this.setMixGain=setMixGain;this.onTrackChange=onTrackChange;this.onError=onError;
  this.fadeOut=Math.max(0,Number(fadeOut)||0);this.fadeIn=Math.max(0,Number(fadeIn)||0);this.visibilityTarget=visibilityTarget;
  this.current=null;this.desired=null;this.enabled=true;this.unlocked=false;this.visible=!visibilityTarget?.hidden;this.destroyed=false;this.serial=0;this.waiters=new Set();this.transition=null;
  audio.volume=1;audio.loop=true;audio.autoplay=false;audio.preload='metadata';
  this._visibility=()=>{this.visible=!this.visibilityTarget?.hidden;if(!this.visible)this._hold();else if(this.unlocked&&this.enabled)void this._play(this.serial);};
  this._audioError=()=>this._report(audio.error||new Error('Music could not be loaded.'),'load');
  visibilityTarget?.addEventListener?.('visibilitychange',this._visibility);audio.addEventListener?.('error',this._audioError);
  this._mix(1,0);
 }
 setScene(state){return this.select(sceneMusic(state));}
 select(id){
  if(this.destroyed)return Promise.resolve(false);
  if(!MUSIC_TRACKS[id]){this._report(new Error('Unknown music track: '+id),'selection');return Promise.resolve(false);}
  if(id===this.desired){if(this.transition)return this.transition;if(this.current===id)return this._play(this.serial);}
  this.desired=id;const token=++this.serial;this._cancelWaiters();
  if(id===this.current){this._mix(1,this._allowed()?this.fadeIn:0);this.transition=null;return this._play(token);}
  const task=this._change(id,token);this.transition=task;void task.then(()=>{if(this.transition===task)this.transition=null;});return task;
 }
 /** Must be called directly in a user interaction handler. play() is invoked
  * synchronously before this method returns, so browser gesture credit survives. */
 unlock(){
  if(this.destroyed)return Promise.resolve(false);this.unlocked=true;
  if(!this.current&&this.desired)this._source(this.desired);
  return this._play(this.serial);
 }
 setEnabled(value){
  if(this.destroyed)return Promise.resolve(false);const next=!!value;
  if(next===this.enabled)return next?this._play(this.serial):Promise.resolve(false);
  this.enabled=next;if(!next){this._hold();return Promise.resolve(false);}
  return this._play(this.serial);
 }
 _allowed(){return !this.destroyed&&this.unlocked&&this.enabled&&this.visible;}
 _mix(value,seconds){try{this.setMixGain(Math.max(0,Math.min(1,value)),Math.max(0,seconds));}catch(error){this._report(error,'mix');}}
 _report(error,phase){try{this.onError(error,{track:this.desired||this.current,phase});}catch{}}
 _source(id){
  if(this.current===id)return true;const track=MUSIC_TRACKS[id];if(!track)return false;
  try{this.audio.pause();this.audio.src=track.src;this.audio.load?.();this.current=id;try{this.onTrackChange(id,track);}catch{}return true;}
  catch(error){this._report(error,'source');return false;}
 }
 async _change(id,token){
  try{
   const fade=!!this.current&&this._allowed()&&!this.audio.paused;
   if(fade){this._mix(0,this.fadeOut);if(!await this._wait(this.fadeOut*1000,token))return false;}
   if(token!==this.serial||this.destroyed)return false;
   if(!this._source(id))return false;if(!fade)this._mix(1,0);
   const played=await this._play(token);if(token!==this.serial||this.destroyed)return false;if(fade)this._mix(1,this._allowed()?this.fadeIn:0);return played;
  }catch(error){if(token===this.serial)this._report(error,'transition');return false;}
 }
 _play(token){
  if(token!==this.serial||!this.current||!this._allowed())return Promise.resolve(false);
  if(!this.audio.paused)return Promise.resolve(true);
  // No awaits before this call: unlock() can run alongside AudioContext.resume().
  try{const playing=this.audio.play();return Promise.resolve(playing).then(()=>token===this.serial&&this._allowed()).catch(error=>{if(token===this.serial&&this._allowed())this._report(error,'play');return false;});}
  catch(error){if(token===this.serial&&this._allowed())this._report(error,'play');return Promise.resolve(false);}
 }
 _wait(ms,token){
  if(ms<=0)return Promise.resolve(token===this.serial);
  return new Promise(resolve=>{const waiter={timer:null,finish:value=>{clearTimeout(waiter.timer);this.waiters.delete(waiter);resolve(value);}};waiter.timer=setTimeout(()=>waiter.finish(token===this.serial&&!this.destroyed),ms);this.waiters.add(waiter);});
 }
 _cancelWaiters(){for(const waiter of [...this.waiters])waiter.finish(false);}
 _hold(){
  ++this.serial;this._cancelWaiters();this.transition=null;this.audio.pause();
  // A muted/hidden scene can change its pending source without starting playback.
  if(!this.destroyed&&this.desired&&this.current!==this.desired)this._source(this.desired);this._mix(1,0);
 }
 destroy(){if(this.destroyed)return;this.destroyed=true;this._hold();this.visibilityTarget?.removeEventListener?.('visibilitychange',this._visibility);this.audio.removeEventListener?.('error',this._audioError);}
}
