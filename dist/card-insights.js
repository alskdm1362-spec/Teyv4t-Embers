import {NEW_CARDS} from './awakening.js';
/* Each insight changes a tactic; resource procs are limited by the engine per turn. */
export const INSIGHT_NAME='전술 각성';
export const INSIGHT_BRANCHES=['A','B','C','D'];
const path=(title,amount,effects={},extra={})=>({title,amount,effects,...extra});
export const INSIGHTS={
 l_strike:{A:path('예리한 찌르기',13,{extraPierce:3}),B:path('추격의 발판',10,{killRefund:1}),C:path('전진 사격',9,{draw:1},{cost:1}),D:path('순간의 급습',10,{},{cost:0,exhaust:true})},
 l_guard:{A:path('견고한 수비',11,{calm:2}),B:path('공세 전환',6,{focus:5}),C:path('가벼운 몸놀림',5,{},{cost:0,exhaust:true}),D:path('틈새 재장전',7,{draw:1})},
 l_pierce:{A:path('파쇄 관통',23,{extraPierce:4}),B:path('연속 관통',19,{focus:4}),C:path('간결한 궤적',14,{},{cost:1}),D:path('마지막 쐐기',33,{extraPierce:8},{cost:3,exhaust:true})},
 l_aim:{A:path('치명 조준',8,{nextPierce:3}),B:path('빠른 조준',5,{draw:1}),C:path('빈틈 노리기',10,{},{cost:1}),D:path('마지막 준비',6,{support:1})},
 d_strike:{A:path('맹렬한 발톱',12,{vuln:1}),B:path('용의 예열',9,{focus:4}),C:path('흩뿌린 불씨',6,{},{target:'all'}),D:path('흑염 회수',8,{killRefund:1})},
 d_guard:{A:path('흑요석 비늘',11),B:path('불씨 보존',7,{discountNext:1}),C:path('비늘 털기',5,{},{cost:0,exhaust:true}),D:path('날갯짓 준비',6,{draw:1})},
 d_wave:{A:path('작열 파동',17),B:path('잔열 회수',13,{refund:1}),C:path('먹구름의 균열',11,{vuln:1}),D:path('몰아치는 흑염',23,{},{cost:3,exhaust:true})},
 d_charge:{A:path('심화 호흡',7,{support:1}),B:path('용맥 정돈',5,{draw:1}),C:path('압축된 불꽃',10,{discountNext:1},{cost:1}),D:path('검은 공명',3,{create:'d_resonance'})},
 i_strike:{A:path('빈틈 포착',11,{vuln:1}),B:path('방패의 일격',7,{shieldDamage:.3,shieldDamageCap:8}),C:path('후방 엄호',7,{shield:5}),D:path('등불 수호',6,{heal:3})},
 i_guard:{A:path('성채 전개',14),B:path('되받아치는 빛',10,{counter:8}),C:path('온기를 나누다',8,{heal:4}),D:path('가벼운 전개',6,{},{cost:0,exhaust:true})},
 i_counter:{A:path('강철 반격',19,{counter:6}),B:path('날카로운 반격',17,{counter:10}),C:path('회복의 진형',13,{counter:6,heal:5}),D:path('선봉의 결의',9,{counter:6},{cost:1})},
 i_cover:{A:path('철벽 엄호',14,{shield:4}),B:path('불빛의 위로',12,{heal:4}),C:path('맞받아칠 준비',12,{counter:8}),D:path('넓게 드리운 빛',7,{coverAll:true},{target:'none',cost:1})},
 j_strike:{A:path('급소 강타',12,{support:1}),B:path('빈틈을 열다',8,{vuln:1}),C:path('돌파구 탐색',7,{draw:1}),D:path('보수 회수',8,{killGold:5})},
 j_guard:{A:path('민첩 회피',11,{calm:2}),B:path('재빠른 준비',7,{draw:1}),C:path('가벼운 발걸음',5,{},{cost:0,exhaust:true}),D:path('지원 신호',7,{support:1})},
 j_draw:{A:path('신속 정돈',3),B:path('빈틈없는 정리',2,{},{discard:0}),C:path('전술 연계',2,{discountNext:1}),D:path('비밀의 의뢰',0,{create:'j_dossier'},{type:'tactic',discard:0})},
 j_energy:{A:path('전술 가속',3),B:path('지원의 연결',2,{support:1}),C:path('손에 쥔 기회',2,{draw:1}),D:path('다음 수 읽기',1,{draw:2})},
};
for(const [key,,source,,cost,power] of NEW_CARDS){
 const original=INSIGHTS[source],baseline=original.A.amount;
 INSIGHTS[key]=Object.fromEntries(INSIGHT_BRANCHES.map(branch=>{
  const spec=original[branch];
  return [branch,{...spec,amount:Math.max(1,power+3+spec.amount-baseline),cost:spec.cost??cost}];
 }));
}
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
 if(e.extraPierce)out.push(`장막 추가 압박 ${e.extraPierce}.`);
 if(e.vuln)out.push(`공격한 적에게 취약 ${e.vuln}턴.`);
 if(e.shield)out.push(`공용 보호막 ${e.shield} 추가.`);
 if(e.focus)out.push(`이번 턴 다음 자신의 공격 피해 +${e.focus}.`);
 if(e.nextPierce)out.push(`이번 턴 다음 자신의 공격 장막 압박 +${e.nextPierce}.`);
 if(e.counter)out.push(`방어 성공 시 다음 자신의 공격에 추가 타격 ${e.counter}.`);
 if(e.heal)out.push(`공용 체력 ${e.heal} 회복 (턴당 1회).`);
 if(e.calm)out.push(`자신의 정신 부담 ${e.calm} 완화.`);
 if(e.support)out.push(`지원 +${e.support}.`);
 if(e.draw)out.push(`카드 ${e.draw}장 드로우 (턴당 1회).`);
 if(e.refund)out.push(`행동력 ${e.refund} 회수 (턴당 1회).`);
 if(e.killRefund)out.push(`처치 시 행동력 ${e.killRefund} 회수 (턴당 1회).`);
 if(e.killGold)out.push(`처치 시 모라 ${e.killGold} 획득 (전투당 1회).`);
 if(e.discountNext)out.push('이번 턴 다음 공격 카드 비용 -1 (중첩 불가).');
 if(e.shieldDamage)out.push(`공용 보호막의 ${Math.round(e.shieldDamage*100)}%만큼 피해 추가 (최대 ${e.shieldDamageCap}).`);
 if(e.create)out.push(`${e.create==='d_resonance'?'흑염의 잔향':'비밀 수첩'} 1장 생성 (전투당 1회).`);
 return out.join(' ');
}
