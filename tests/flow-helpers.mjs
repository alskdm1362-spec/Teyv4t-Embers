import assert from 'node:assert/strict';
import {act,cardInfo,CARDS,healingNeeds,travelOptions,legLocked} from '../dist/engine.js';
export function completeJoin(s){const go=a=>{const r=act(s,a);assert.ok(r.ok,r.error);};if(s.phase==='arrival')go({type:'ackRecruit'});while(s.phase==='joinDialogue')go({type:'joinNext'});}
export function finishCare(s,hero){const go=a=>{const r=act(s,a);assert.ok(r.ok,r.error);};go({type:'careStart',hero});for(let i=0;i<20;i++)go({type:'careNext'});go({type:'calm',hero});}

function action(s,a){const r=act(s,a);assert.equal(r.ok,true,r.error);return r;}
// A plain greedy player: best value card first, guards only when a hit is coming.
export function botTurn(s){
 const b=s.battle;
 if(b.pickDraw){action(s,{type:'pickDraw',uid:b.draw.at(-1).uid});return;}
 if(b.chooseDiscard){const d=b.discardCtx;if(d?.optional){action(s,{type:'discardDone'});return;}const sorted=b.hand.map(c=>({c,i:cardInfo(s,c)})).filter(x=>!(d?.filter==='nonShard'&&x.i.shard)).sort((a,b)=>a.i.amount-b.i.amount);action(s,{type:'discard',uid:sorted[0].c.uid});return;}
 const enemies=b.enemies.filter(e=>e.hp>0);
 const target=[...enemies].sort((a,b)=>(a.kind==='star'?-1:b.kind==='star'?1:0)||(a.hp+a.ward)-(b.hp+b.ward))[0];
 if(s.support>=2&&!b.supportUsed){const hero=s.party.includes('durin')&&s.hp<s.maxHp*.45?'durin':s.party.includes('lohen')?'lohen':s.party[0];action(s,{type:'support',hero,target:target.id});return;}
 const incoming=enemies.reduce((n,e)=>n+(e.intent?.damage||0),0);
 const cards=b.hand.map(c=>({c,i:cardInfo(s,c)})).filter(x=>x.i.cost<=b.ap&&!(x.i.perTurnUse&&(b.turnUses?.[x.c.key]||0)>=x.i.perTurnUse)).map(x=>{
  const i=x.i;let value=-100;
  if(i.type==='attack')value=(i.amount+(i.target==='all'?(enemies.length-1)*i.amount:0))/(i.cost||.5)+3;
  if(i.type==='focus'&&b.hand.some(c=>CARDS[c.key].type==='attack'&&c.owner===x.c.owner))value=40;
  if(i.type==='energy')value=45;
  if(i.type==='draw'&&b.hand.length<6)value=35;
  if(i.type==='guard'||i.type==='counter'){const party=x.c.owner==='illuga'&&i.type==='guard',mine=enemies.filter(e=>party||e.intent?.target===x.c.owner).reduce((n,e)=>n+(e.intent?.damage||0),0),have=party?s.shield:(s.heroes[x.c.owner].shield||0);value=have<mine?i.amount/(i.cost||.5)+(s.hp<s.maxHp*.4?10:0):0;}
  if(i.type==='cover')value=1;
  if(i.type==='breakdown')value=20;
  if(i.type==='skill')value=(i.keywords||[]).includes('unplayable')?-100:i.cost===0?30:4;
  if(i.xCost)value=b.ap>=2?60:-100;
  return {...x,value};
 }).sort((a,b)=>b.value-a.value);
 if(cards[0]?.value>0){const {c,i}=cards[0];action(s,{type:'play',uid:c.uid,target:i.target==='ally'?s.party.find(id=>!s.heroes[id].retired):target.id});return;}
 action(s,{type:'endTurn'});
}
// Walks a whole expedition with legal actions only. Returns what it saw.
export function botExpedition(s,{maxRestarts=12}={}){
  const visited=new Set(),turn=botTurn;
  let restarts=0,lastFarm=-1;for(let n=0;n<12000&&s.phase!=='ending'&&restarts<maxRestarts;n++){
   visited.add(s.node);
   if(s.phase==='base'){
    if(healingNeeds(s).needed&&!s.healUsed)action(s,{type:"heal"});
    else if(lastFarm!==restarts&&restarts>0&&s.healUsed&&healingNeeds(s).needed){lastFarm=restarts;action(s,{type:'farm'});continue;}
    const broken=s.party.find(id=>s.heroes[id].breakdown);if(broken&&!s.careUsed)finishCare(s,broken);
    if(s.upgradeOffer){const c=s.upgradeOffer.candidates[0];action(s,{type:'upgrade',hero:c.owner,card:c.key,branch:'A'});}
    for(const id of s.party)if(!s.heroes[id].equipment.weapon&&s.gold>=30)act(s,{type:'equip',hero:id,slot:'weapon',item:'plainSpear'});
    action(s,{type:'challenge'});
   }else if(s.phase==='battle')turn(s);
   else if(s.phase==='reward')action(s,{type:'claimReward'});
   else if(s.phase==='travel')action(s,{type:'travel',id:travelOptions(s)[0].id});
   else if(s.phase==='refine'){const c=s.upgradeOffer.candidates[0];action(s,{type:'upgrade',hero:c.owner,card:c.key,branch:'A'});}
   else if(s.phase==='event'){const choices=s.eventOffer.choices.filter(c=>!legLocked(s,c)),c=[...choices].sort((a,b)=>(a.cost.hp||0)+(a.cost.curse||0)*100+(a.cost.stress||0)-(b.cost.hp||0)-(b.cost.curse||0)*100-(b.cost.stress||0))[0];action(s,{type:'event',choice:c.id});}
   else if(s.phase==='eventRemove')action(s,{type:'eventRemoveCard',skip:true});
   else if(s.phase==='camp'){action(s,{type:'camp',choice:'rest'});action(s,{type:'leaveCamp'});}
   else if(s.phase==='cardReward'){const c=s.cardOffer.candidates[0];action(s,{type:'pickCard',hero:c.owner,card:c.key});}
   else if(s.phase==='defeat'){restarts++;action(s,{type:'restart'});}
   else throw Error('Unexpected expedition phase '+s.phase);
  }
  return {visited,restarts,cleared:s.phase==='ending'};
}
