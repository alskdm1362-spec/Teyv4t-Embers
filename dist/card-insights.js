import {V2_BRANCHES} from './cards-v2.js';
/* Each insight changes a tactic; resource procs are limited by the engine per turn. */
export const INSIGHT_NAME='전술 각성';
export const INSIGHT_BRANCHES=['A','B','C','D'];
// v0.36 stage 4: 56 cards × 4 branches (A 안정 / B 자원 / C 변형 / D 빌드) live in cards-v2.js.
export const INSIGHTS=V2_BRANCHES;
export function insightSpec(key,branch){return INSIGHTS[key]?.[branch]||null;}
export function compatibleSparkIds(info){
 const pool=['ember_support','ember_calm'];
 if(info.cost>0)pool.push('ember_cost');
 if(info.cost>0||info.exhaust)pool.push('ember_draw');
 if(info.type==='attack')pool.push('ember_force');
 if(['guard','counter'].includes(info.type))pool.push('ember_bastion');
 if(['guard','counter','cover'].includes(info.type))pool.push('ember_mercy');
 return pool;
}
export function effectDescription(e={}){
 const out=[];
 if(e.extraPierce)out.push(`장막 추가 압박 ${Math.round(e.extraPierce*100/9)}%.`);
 if(e.crack||e.vuln)out.push(`균열 ${e.crack||Math.min(5,e.vuln*2)} 부여.`);
 if(e.wither)out.push(`위축 ${e.wither}턴.`);
 if(e.shield)out.push(`방어력 기반 보호막 ${Math.round(e.shield*200/7)}% 추가.`);
 if(e.focus)out.push(`이번 턴 다음 자신의 공격 피해 +${Math.round(e.focus*100/9)}%.`);
 if(e.nextPierce)out.push(`이번 턴 다음 자신의 공격 장막 압박 +${Math.round(e.nextPierce*100/9)}%.`);
 if(e.reflect||e.counter)out.push(`되비춤(방어력 기반 피해 ${Math.round((e.reflect||e.counter)*100/9)}%) 준비.`);
 if(e.heal)out.push(`최대 체력 기반 회복 ${e.heal}% (턴당 1회).`);
 if(e.calm)out.push(`자신의 정신 부담 ${e.calm} 완화.`);
 if(e.support)out.push(`지원 +${e.support}.`);
 if(e.draw)out.push(`카드 ${e.draw}장 드로우 (턴당 1회).`);
 if(e.refund)out.push(`행동력 ${e.refund} 회수 (턴당 1회).`);
 if(e.killRefund)out.push(`처치 시 행동력 ${e.killRefund} 회수 (턴당 1회).`);
 if(e.killGold)out.push(`처치 시 모라 ${e.killGold} 획득 (전투당 1회).`);
 if(e.discountNext)out.push('이번 턴 다음 공격 카드 비용 -1 (중첩 불가).');
 if(e.shieldDamage)out.push(`본인 보호막 기반 피해 ${Math.round(e.shieldDamage*100)}% 추가 (최대 ${Math.round(e.shieldDamageCap*100/9)}%).`);
 if(e.create)out.push(`${e.create==='d_resonance'?'타다 남은 불티':'비밀 수첩'} 1장 생성 (전투당 1회).`);
 return out.join(' ');
}
