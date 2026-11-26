/* v0.26 branching expedition map. Columns keep the ROUTE indices, so every save field
   that stores s.node (bases, checkpoints, farm returns) keeps its meaning; a lane picks
   which of the column's two or three nodes the party is standing on. */
export const MAP_START=8;
const NAMES={
 battle:['잿빛 바람길','무너진 순례로','젖은 석회 회랑','검은 이끼 숲','부러진 첨탑 아래','침식된 수로','흩어진 깃발의 들판','녹슨 감시탑','가라앉은 광장','속삭이는 회랑','재가 내린 골목','끊어진 다리'],
 elite:['장막의 사냥터','겹쳐진 그림자','심연의 매복','깨진 거울의 방','검은 파도의 첨병','관측의 그늘'],
 event:['버려진 보급함','금빛 잔해의 제단','이름 없는 상인','불 꺼진 등대','물에 잠긴 종루','깃털이 떨어진 자리','균열 속 서고','말 없는 행렬'],
 camp:['기울어진 종탑 아래','바람이 그친 동굴','무너진 예배당','별이 보이는 언덕'],
};
const DESC={battle:'적의 흔적이 이어진다.',elite:'강한 적이 길을 막고 있다. 전리품이 좋다.',event:'무슨 일이 기다리는지 알 수 없다.',camp:'불을 피우고 숨을 고를 수 있다.'};
const BATTLES=[
 [['hound','wanderer'],['hunter','hound'],['wanderer','wanderer','hound'],['hunter','wanderer']],
 [['breacher','wanderer'],['hunter','hound','wanderer'],['mimic','hound'],['breacher','hound']],
 [['mimic','breacher'],['hunter','hunter','wanderer'],['breacher','hunter'],['mimic','hunter']],
];
const ELITES=[
 [['angler','angler'],['mimic','hound'],['breacher','hunter']],
 [['hunter','hunter','hound'],['mimic','hunter'],['breacher','angler','hound']],
 [['mimic','breacher','hound'],['breacher','angler','angler'],['mimic','mimic']],
];
function rng(seed){let a=(seed^0x5eed1234)>>>0;return ()=>{a=(a+0x6d2b79f5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
const pick=(r,list)=>list[Math.floor(r()*list.length)];
function tier(c,last){return Math.min(2,Math.floor((c-MAP_START)/Math.max(1,(last-MAP_START+1)/3)));}
export function generateMap(seed,route){
 const r=rng(Number(seed)>>>0),last=route.length-1,columns={},edges={},used=new Set();
 const name=type=>{const options=NAMES[type].filter(n=>!used.has(n));const n=pick(r,options.length?options:NAMES[type]);used.add(n);return n;};
 for(let c=MAP_START;c<=last;c++){
  const spine=route[c],t=tier(c,last);used.add(spine.name);
  if(spine.type==='base'){columns[c]=[{...spine,lane:1,id:`route-${c}-a`}];continue;}
  const nodes=[{...spine,lane:1,id:`route-${c}-a`}];
  for(const [lane,suffix] of [[0,'b'],[2,'c']]){
   const before=columns[c-1]?.find(n=>n.lane===lane)||columns[c-1]?.[0],next=route[c+1];
   const weights=[['battle',40],['event',28],['elite',c>MAP_START+1?18:0],['camp',before?.type==='camp'||before?.type==='base'||next?.type==='base'||nodes.some(n=>n.type==='camp')?0:14]];
   let roll=r()*weights.reduce((a,[,w])=>a+w,0),type='battle';for(const [k,w] of weights){if(roll<w){type=k;break;}roll-=w;}
   const node={type,name:name(type),description:DESC[type],lane,id:`route-${c}-${suffix}`};
   if(type==='battle')node.enemies=pick(r,BATTLES[t]);if(type==='elite')node.enemies=pick(r,ELITES[t]);
   nodes.push(node);
  }
  columns[c]=nodes.sort((a,b)=>a.lane-b.lane);
 }
 for(let c=MAP_START-1;c<last;c++){
  const from=columns[c]||[{lane:1}],to=columns[c+1],list=[];
  for(const a of from)for(const b of to){if(from.length===1||to.length===1||Math.abs(a.lane-b.lane)<=1)list.push([a.lane,b.lane]);}
  // Thin some diagonals so lanes feel like roads, but never strand a node.
  const thinned=list.filter(([a,b])=>{if(a===b||from.length===1||to.length===1)return true;return r()>.4;});
  for(const b of to)if(!thinned.some(e=>e[1]===b.lane))thinned.push([b.lane,b.lane]);
  for(const a of from)if(!thinned.some(e=>e[0]===a.lane))thinned.push([a.lane,a.lane]);
  edges[c]=thinned;
 }
 return {v:1,start:MAP_START,last,columns,edges};
}
export function ensureMap(s,route){if(!s.map||s.map.v!==1||s.map.last!==route.length-1)s.map=generateMap(s.seed,route);s.lane??=1;return s.map;}
export function mapChoices(s,route){
 const map=ensureMap(s,route),next=s.node+1,nodes=map.columns[next];if(!nodes)return [];
 const lane=s.lane??1,links=(map.edges[s.node]||[]).filter(([a])=>a===lane||(map.columns[s.node]||[]).length<=1||s.node<MAP_START).map(([,b])=>b);
 return nodes.filter(n=>links.includes(n.lane)).map(n=>({...n,node:next,mode:'route'}));
}
// Enemy strength rises with depth so later fights actually threaten body and mind.
export function depthScale(s){
 if(s.mode==='challenge')return {hp:1.3+.08*(s.challengeStage||0),damage:1.3};
 if(s.mode==='farm')return {hp:1.1,damage:1.1};
 if(s.mode!=='route'||s.node<MAP_START)return {hp:1,damage:1};
 const t=Math.min(1,(s.node-MAP_START)/15);return {hp:1.08+.35*t,damage:1.08+.25*t};
}
