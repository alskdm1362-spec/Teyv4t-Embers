/* Stable, read-only travel choices. Main story gates cannot be skipped. */
import {mapChoices,MAP_START} from './map.js';
export function stageChoices(s,route){
 if(s.mode==='farm')return [{id:'return-base',type:'base',name:'생명의 거점',description:'부상을 유지한 채 귀환합니다. 회복은 불꽃에서 선택합니다.',node:7,mode:'route'}];
 if(s.mode==='challenge'){
  const stage=s.challengeStage+1;
  if(stage>=3)return [{id:'front-ending',type:'ending',name:'남겨진 불씨',description:'확보한 전선의 기록을 남깁니다.',mode:'challenge',stage}];
  return [{id:'front-'+stage,type:'boss',name:['그윽한 균열','영역의 관측자','타락한 별의 파수'][stage],description:stage===1?'관측을 끊으며 영역 수호자를 돌파합니다.':'별을 파괴하고 파수꾼의 심판을 저지합니다.',mode:'challenge',stage,enemies:stage===1?['keeper']:['sentinel']}];
 }
 if(s.node>=MAP_START-1&&s.node<route.length-1)return mapChoices(s,route);
 const node=Math.min(route.length-1,s.node+1),n=route[node],choices=[{...n,id:`route-${node}-a`,node,mode:'route'}];
 const alternatives={
  2:{type:'battle',name:'침묵한 감시로',description:'배회자 둘의 잔향을 끊으며 우회합니다.',enemies:['wanderer','wanderer']},
  5:{type:'battle',name:'불 꺼진 외곽',description:'야영 대신 추가 전투와 보급을 선택합니다.',enemies:['hound','hunter']},
  9:{type:'battle',name:'성당의 우회로',description:'사건 대신 전투로 보급을 확보한다.',enemies:['hound','hunter']},
  13:{type:'battle',name:'빛바랜 성벽',description:'제단을 지나쳐 성벽 위로 향한다.',enemies:['breacher','wanderer']},
  17:{type:'event',name:'잊힌 등불',description:'사냥터를 우회해 작은 불빛을 찾는다.'},
  20:{type:'elite',name:'검은 파도의 첨병',description:'거래 대신 강한 적의 전리품을 노린다.',enemies:['mimic','hunter']},
  6:{type:'elite',name:'파열된 경계',description:'균열계와 사냥꾼을 돌파하는 또 다른 길.',enemies:['breacher','hunter']},
 };
 if(alternatives[node])choices.push({...alternatives[node],id:`route-${node}-b`,node,mode:'route'});
 return choices;
}
