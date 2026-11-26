/* Original sound assets, mixed independently from music and gameplay RNG. */
export const gainFromSlider=value=>Math.max(0,Math.min(1,Number(value)||0))**2;
export const ATTACK_SOUNDS={
 spear:['spear_whoosh','spear_hit'],'frost-finisher':['heavy_whoosh','celestial_hit'],
 'arcane-wave':['arcane_cast','arcane_hit'],counter:['spear_whoosh','counter'],feint:['spear_whoosh','dagger'],
 'wind-cleave':['heavy_whoosh','heavy_hit'],'night-thrust':['abyss_cast','spear_hit'],'venom-mark':['spear_whoosh','dagger'],
 'abyss-hit':['abyss_cast','abyss_hit'],'celestial-hit':['resource','celestial_hit'],
};
export class SoundBank{
 constructor({music,getPrefs}){this.music=music;this.getPrefs=getPrefs;this.context=null;this.buffers=new Map();this.raw=new Map();this.counters=new Map();this.last=new Map();this.voices=[];this.loaded=false;this.unlocked=false;this.musicMix=1;
 this.ready=fetch('assets/audio/sfx/manifest.json').then(r=>r.json()).then(async manifest=>{this.manifest=manifest;await Promise.all(Object.entries(manifest.assets).map(async([key,list])=>{this.raw.set(key,await Promise.all(list.map(a=>fetch(a.src).then(r=>{if(!r.ok)throw new Error(a.src);return r.arrayBuffer();}))));}));this.loaded=true;document.body.dataset.sfx='loaded';}).catch(()=>{document.body.dataset.sfx='unavailable';});
 document.addEventListener('visibilitychange',()=>{if(!this.context)return;if(document.hidden){this.context.suspend().catch(()=>{});}else if(this.unlocked)this.unlock();});}
 async unlock(){this.unlocked=true;try{
 if(!this.context){const ctx=this.context=new AudioContext(),master=ctx.createGain(),limiter=ctx.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=6;limiter.ratio.value=6;limiter.attack.value=.003;limiter.release.value=.14;master.connect(limiter).connect(ctx.destination);this.master=master;this.sfx=ctx.createGain();this.ui=ctx.createGain();this.musicGain=ctx.createGain();this.transitionGain=ctx.createGain();this.transitionGain.gain.value=this.musicMix;this.duck=ctx.createGain();this.sfx.connect(master);this.ui.connect(master);this.musicGain.connect(this.transitionGain).connect(this.duck).connect(master);ctx.createMediaElementSource(this.music).connect(this.musicGain);this.music.volume=1;
 this.decoded=this.ready.then(async()=>{await Promise.all([...this.raw].map(async([key,list])=>{const out=await Promise.all(list.map(bytes=>ctx.decodeAudioData(bytes.slice(0))));this.buffers.set(key,out);}));document.body.dataset.sfx=this.buffers.size?'ready':'unavailable';});}
 await this.context.resume();this.update();
 }catch{document.body.dataset.sfx='unavailable';}}
 update(){if(!this.context)return;const p=this.getPrefs(),t=this.context.currentTime;this.master.gain.setTargetAtTime(gainFromSlider(p.volume),t,.025);this.musicGain.gain.setTargetAtTime(gainFromSlider(p.music),t,.03);this.sfx.gain.setTargetAtTime(gainFromSlider(p.sfx),t,.025);this.ui.gain.setTargetAtTime(gainFromSlider(p.sfx)*.3,t,.025);}
 setMusicMixGain(value,seconds=0){this.musicMix=Math.max(0,Math.min(1,Number(value)||0));if(!this.context||!this.transitionGain)return;const g=this.transitionGain.gain,t=this.context.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(g.value,t);if(seconds>0)g.linearRampToValueAtTime(this.musicMix,t+seconds);else g.setValueAtTime(this.musicMix,t);}
 async play(key,{gain=1,pan=0,rate=1,ui=false}={}){if(!this.unlocked)return;try{await this.decoded;if(!this.context||this.context.state!=='running'||!this.getPrefs().volume)return;const list=this.buffers.get(key);if(!list?.length)return;const now=this.context.currentTime,last=this.last.get(key)??-100;if(now-last<(key.startsWith('card_') ? .026 : .045))return;this.last.set(key,now);const n=this.counters.get(key)||0;this.counters.set(key,n+1);
 const src=this.context.createBufferSource(),v=this.context.createGain(),panner=this.context.createStereoPanner();src.buffer=list[n%list.length];src.playbackRate.value=rate*[1,.985,1.015][n%3];v.gain.value=Math.max(0,Math.min(1.2,gain));panner.pan.value=Math.max(-.35,Math.min(.35,pan));src.connect(v).connect(panner).connect(ui?this.ui:this.sfx);if(this.voices.length>=9)this.voices.shift().stop();this.voices.push(src);src.onended=()=>{this.voices=this.voices.filter(x=>x!==src);src.disconnect();v.disconnect();panner.disconnect();};src.start();document.body.dataset.lastSound=key;document.body.dataset.soundEvents=String((Number(document.body.dataset.soundEvents)||0)+1);
 if(!ui&&!key.startsWith('card_')){this.duck.gain.cancelScheduledValues(now);this.duck.gain.setTargetAtTime(.7,now,.01);this.duck.gain.setTargetAtTime(1,now+.12,.18);}
 }catch{document.body.dataset.sfx='unavailable';}}
}
