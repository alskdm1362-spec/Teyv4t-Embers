/* v0.38 sound cue map: engine events and prologue lines -> sound keys in assets/audio/sfx/manifest.json.
   Combat hits, deaths, ward breaks, roulette and collapse are cued inside motion.js at their visual moments;
   this file covers events that have no animation of their own. Pure functions so tests can check the map. */
export const EVENT_CUES={
 travel:{key:'map_step',gain:.7,ui:true},
 rewardClaimed:{key:'reward_claim',gain:.8},
 rewardSkipped:{key:'reward_skip',gain:.6,ui:true},
 epiphany:{key:'spark',gain:.75},
 spark:{key:'spark',gain:.8},
 upgrade:{key:'spark',gain:1},
 awakening:{key:'spark',gain:1},
 level:{key:'spark',gain:.7,delay:220},
 recruit:{key:'recover',gain:.6},
 gold:{key:'gold',gain:.7},
 createCard:{key:'card_flip',gain:.5},
 recordSaved:{key:'save',gain:.7,ui:true},
 saveDataStored:{key:'save',gain:.7,ui:true},
 defeat:{key:'defeat',gain:.85,delay:420},
 ending:{key:'expedition_clear',gain:.9,delay:300},
};
// One cue per kind per action, so a reward screen that grants three levels does not stack three chimes.
export function eventCues(events=[]){const seen=new Set(),out=[];for(const e of events){const cue=EVENT_CUES[e.type];if(!cue||seen.has(cue.key))continue;seen.add(cue.key);out.push({delay:0,ui:false,...cue});}return out;}
// 도도통신기(나모 님 제공 녹음): 잡음 구간에 들어설 때 초반 잡음, 잡음 줄마다 그 잡음의 짧은 조각, 통신 장면을 떠날 때 끝음.
// v0.38 수정: 합성 비프·주파수 훑기('삐융' 계열)는 쓰지 않는다.
export function prologueCue(lines,index){const line=lines[index],prev=lines[index-1];if(!line)return null;
 if(line.scene==='radio'&&line.noise)return prev?.scene==='radio'?{key:'radio_noise',gain:.8,ui:true}:{key:'radio_glitch',gain:.85,ui:true};
 if(prev?.scene==='radio'&&line.scene!=='radio')return {key:'radio_release',gain:.8,ui:true};
 return null;}
