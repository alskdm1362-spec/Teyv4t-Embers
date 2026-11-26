import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {MusicDirector,MUSIC_TRACKS,sceneMusic} from '../dist/music.js';
class Visibility extends EventTarget{hidden=false;setHidden(value){this.hidden=value;this.dispatchEvent(new Event('visibilitychange'));}}
class Audio extends EventTarget{
 paused=true;currentTime=0;src='';plays=0;loads=0;pauses=0;
 play(){this.plays++;this.paused=false;return Promise.resolve();}
 pause(){this.pauses++;this.paused=true;}
 load(){this.loads++;this.currentTime=0;this.paused=true;}
}
function setup(extra={}){const audio=new Audio(),visibility=new Visibility(),mix=[],changes=[],errors=[],director=new MusicDirector(audio,{fadeOut:.012,fadeIn:.01,visibilityTarget:visibility,setMixGain:(...v)=>mix.push(v),onTrackChange:id=>changes.push(id),onError:error=>errors.push(error),...extra});return {audio,visibility,mix,changes,errors,director};}

test('scene routing distinguishes rest, exploration, elite and final boss including defeats',()=>{
 for(const phase of ['title','base','camp','ending'])assert.equal(sceneMusic({phase,mode:'challenge',challengeStage:2}),'main');
 assert.equal(sceneMusic({phase:'battle',node:0}),'battle');assert.equal(sceneMusic({phase:'lobby'}),'lobby');assert.equal(sceneMusic({phase:'battle',mode:'raid'}),'raid');assert.equal(sceneMusic({phase:'event',node:4}),'stage-a');assert.equal(sceneMusic({phase:'reward',node:6}),'stage-b');
 assert.equal(sceneMusic({phase:'battle',node:6}),'boss');assert.equal(sceneMusic({phase:'defeat',node:6}),'boss');
 for(const phase of ['battle','reward','defeat']){assert.equal(sceneMusic({phase,mode:'farm',node:7}),'stage-a');assert.equal(sceneMusic({phase,mode:'challenge',challengeStage:1}),'boss');assert.equal(sceneMusic({phase,mode:'challenge',challengeStage:2}),'boss-final');}
});

test('source selection never autoplays before a gesture and same-track scene updates preserve progress',async()=>{
 const {director:d,audio:a}=setup();await d.setScene({phase:'reward',node:0});assert.equal(a.plays,0);assert.equal(a.loads,1);assert.equal(a.volume,1);assert.equal(a.loop,true);
 const play=d.unlock();assert.equal(a.plays,1,'play must be called in the same gesture stack');await play;a.currentTime=48.3;
 await d.setScene({phase:'event',node:4});await d.setScene({phase:'recruit',node:3});assert.equal(a.currentTime,48.3);assert.equal(a.loads,1);assert.equal(a.plays,1);d.destroy();
});

test('rapid transitions apply only the latest source and cancelled transitions settle',async()=>{
 const {director:d,audio:a,changes}=setup();await d.select('main');await d.unlock();const stale=d.select('boss');const latest=d.select('boss-final');assert.equal(await stale,false);assert.equal(await latest,true);
 assert.equal(d.current,'boss-final');assert.equal(a.src,MUSIC_TRACKS['boss-final'].src);assert.deepEqual(changes,['main','boss-final']);assert.equal(a.loads,2);d.destroy();
});

test('returning to the already-playing track during fade-out cancels replacement without rewinding',async()=>{
 const {director:d,audio:a,mix}=setup();await d.select('main');await d.unlock();a.currentTime=36;const cancelled=d.select('boss');await d.select('main');assert.equal(await cancelled,false);assert.equal(a.currentTime,36);assert.equal(a.loads,1);assert.equal(d.current,'main');assert.equal(mix.at(-1)[0],1);d.destroy();
});

test('muted scene changes remain paused and the chosen track resumes when enabled',async()=>{
 const {director:d,audio:a}=setup();await d.select('main');await d.unlock();await d.setEnabled(false);await d.select('boss');assert.equal(a.paused,true);assert.equal(d.current,'boss');const count=a.plays;
 await d.unlock();assert.equal(a.plays,count);await d.setEnabled(true);assert.equal(a.paused,false);assert.equal(a.plays,count+1);d.destroy();
});

test('visibility resumes only previously unlocked enabled music and preserves same-track time',async()=>{
 const {director:d,audio:a,visibility:v}=setup();await d.select('stage-a');v.setHidden(true);v.setHidden(false);assert.equal(a.plays,0);
 await d.unlock();a.currentTime=55;v.setHidden(true);assert.equal(a.paused,true);v.setHidden(false);assert.equal(a.paused,false);assert.equal(a.currentTime,55);
 await d.setEnabled(false);const count=a.plays;v.setHidden(true);await d.select('stage-b');v.setHidden(false);assert.equal(a.plays,count);assert.equal(a.paused,true);assert.equal(d.current,'stage-b');d.destroy();v.setHidden(true);v.setHidden(false);assert.equal(a.plays,count);
});

test('a stale play promise cannot pause or overwrite the newer track',async()=>{
 const pending=[];const {director:d,audio:a}=setup({fadeOut:0});a.play=function(){this.plays++;this.paused=false;return new Promise(resolve=>pending.push(resolve));};
 await d.select('main');const first=d.unlock();const latest=d.select('boss');await Promise.resolve();await Promise.resolve();assert.equal(pending.length,2);pending[0]();assert.equal(await first,false);assert.equal(d.current,'boss');assert.equal(a.paused,false);pending[1]();assert.equal(await latest,true);d.destroy();
});

test('provided MP3 copies match manifest hashes and every routed track has an asset',async()=>{
 const manifest=JSON.parse(await readFile(new URL('../dist/assets/audio/bgm/manifest.json',import.meta.url),'utf8'));
 for(const [id,track] of Object.entries(MUSIC_TRACKS)){const item=manifest.tracks[id];assert.equal(item.src,track.src);const bytes=await readFile(new URL('../dist/'+track.src,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),item.sha256);assert.equal(bytes.length,item.bytes);assert.ok(item.duration>45);assert.equal(item.originalPreserved,true);}
});
