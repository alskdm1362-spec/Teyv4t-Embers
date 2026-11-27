/* v0.36 stage 3: simplified monster behaviour (planning doc §8).
   Looks, names and placement stay; only the raid boss keeps its gimmicks (wards, summons).
   Normal monsters: plain attacks that differ by numbers and order.
   Elites: may use a mental attack. Expedition bosses: fixed order, next action shown, mental attacks.
   damage is in raw points (scaled by ENEMY_DAMAGE_SCALE and the target's DEF in the engine).
   mental:true marks a mental attack; it only becomes one in elite or boss fights. */

export const STRESS_PIP=10;            // one '정신력' step on the 100-point 정신부담 gauge (mental attacks)
export const HIT_STRESS={normal:5,elite:10,boss:15}; // an unblocked hit, by the attacker's rank (user decision 11-28)
export const HIT_STRESS_CAP=2;         // unblocked hits count at most twice per hero per turn
export const ELITE_MENTAL=2,BOSS_MENTAL=3; // steps added by a mental attack, regardless of shields

export const ENEMY_CYCLES={
 trainingSlime:[{name:'느린 몸통박치기',damage:3}],
 hound:[{name:'침식의 이빨',damage:5},{name:'균열의 도약',damage:8}],
 wanderer:[{name:'흔적 추적',damage:5},{name:'마디 휘감기',damage:7}],
 hunter:[{name:'추적 표식',damage:5},{name:'갈라진 추격',damage:12}],
 angler:[{name:'이끌림의 촉수',damage:6},{name:'응시하는 눈',damage:4,mental:true}],
 mimic:[{name:'공허한 변형',damage:6},{name:'의태 · 강습',damage:16},{name:'공허의 속삭임',damage:3,mental:true}],
 breacher:[{name:'코어의 수축',damage:7},{name:'균열 분출',damage:13},{name:'맥동하는 공포',damage:4,mental:true}],
 nightmare:[{name:'어둠의 부름',damage:10},{name:'내리꽂는 그림자',damage:12},{name:'악몽의 파도',damage:18,mental:true}],
 keeper:[{name:'영역 검출',damage:10},{name:'관측의 시선',damage:6,mental:true},{name:'관측된 결말',damage:19}],
 sentinel:[{name:'침묵의 검출',damage:10},{name:'타락한 별빛',damage:6,mental:true},{name:'별의 심판',damage:24}],
 star:[{name:'심판에 힘을 보냄',damage:0}],
};
// Same order, different creature names.
export const LOOK_CYCLE_NAMES={cherubim:['사도의 부름','내리꽂는 광휘','천공의 파도']};

export function cycleMove(kind,turn,look){
 const cycle=ENEMY_CYCLES[kind]||[{name:'공격',damage:5}],i=((turn%cycle.length)+cycle.length)%cycle.length,move=cycle[i];
 const renamed=LOOK_CYCLE_NAMES[look]?.[i];return renamed?{...move,name:renamed}:move;
}
