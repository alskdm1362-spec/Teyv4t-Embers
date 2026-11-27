// Describes the implemented attack cycles, not hypothetical monster skills.
import {ENEMY_CYCLES,STRESS_PIP,ELITE_MENTAL,BOSS_MENTAL} from './enemy-patterns.js';
const BOSSES=new Set(['nightmare','keeper','sentinel']);
// v0.36: generated from the same cycle table the engine uses. Damage is before the target's DEF.
export const ENEMY_MOVES=Object.fromEntries(Object.entries(ENEMY_CYCLES).map(([kind,cycle])=>[kind,cycle.map((m,i)=>[m.name,[
 `${i+1}번째 순서.`,m.damage?`피해 ${m.damage*17}(방어력 적용 전).`:'직접 공격하지 않습니다.',
 m.mental?(BOSSES.has(kind)?`정신 공격: 정신 부담 +${BOSS_MENTAL*STRESS_PIP}, 보호막과 무관.`:`정예로 나오면 정신 공격: 정신 부담 +${ELITE_MENTAL*STRESS_PIP}, 보호막과 무관.`):'',
 BOSSES.has(kind)&&i===0?'다음 행동이 미리 표시됩니다.':''].filter(Boolean).join(' ')])]));

// Look-specific move names (same rules as the kind, different creature).
export const LOOK_MOVES={
 cherubim:[['사도의 부름','날개 달린 금서를 불러내며 피해 170 · 정신 부담 8.'],['내리꽂는 광휘','피해 170 · 정신 부담 8.'],['천공의 파도','세 번째 순서의 강공격. 피해 306 · 정신 부담 20. 금서를 쓰러뜨리면 사도의 장막도 약해집니다.']]
};
