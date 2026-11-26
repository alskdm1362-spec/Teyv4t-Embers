const EARLY=Object.freeze({id:'early',src:'assets/backgrounds/stormterror.png'});
const LOBBY=Object.freeze({id:'lobby',src:'assets/update25/lobby.webp'});
const abyss=n=>({id:'late-abyss',src:`assets/update25/background-a-${n}.webp`});
const sky=(n,id='late-sky')=>({id,src:`assets/update25/background-b-${n}.webp`});
export function sceneBackground(state){
 if(state.phase==='lobby')return LOBBY;
 if(['title','base','camp','ending'].includes(state.phase)||state.mode==='farm')return EARLY;
 if(state.mode==='challenge')return state.challengeStage>=2?sky(3,'late-final'):state.challengeStage===1?sky(2):abyss(6);
 if(state.node<6)return EARLY;
 if(state.node>=21)return sky(3);
 if(state.node>=19)return sky(2);
 if(state.node>=16)return sky(1);
 // Consecutive encounters share their scenery with rewards, events and route selection.
 const section=state.node<8?1:state.node<10?2:state.node<12?3:state.node<13?4:state.node<14?5:6;
 return abyss(section);
}
