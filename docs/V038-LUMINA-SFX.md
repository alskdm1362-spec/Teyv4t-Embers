# v0.38 효과음 보강 (2차 수정 포함)

## 원칙
- **합성 비프음 · 음높이가 미끄러지는 '삐융' 계열 소리는 쓰지 않는다.** (나모 님 지시, 2026-11-28) Lumina SFX에서 고를 때도 실제 녹음 기반 소리만 쓴다. `tests/v38-sfx.test.mjs`가 금지 키와 합성 계열 레시피 이름을 막는다.
- 나모 님이 준 녹음이 있으면 그것을 먼저 쓴다.

## 2차 수정에서 뺀 것
| 키 | 이유 |
|---|---|
| radio_connect, radio_glitch(구), radio_noise(구), radio_release(구) | 합성 비프·주파수 훑기 → 제공 녹음 `도도통신기-초반/끝`으로 교체 |
| enemy_fade | 흩어질 때 내려가는 음 → 삭제 |
| battle_start, enemy_turn | 휘익 내려가는 소리·비프 → 소리 없이 글자만 |
| stress_rise, arc_snap, frost_shard, recruit, awaken | 합성 음색 → 삭제하거나 제공 녹음으로 대체 |
| ward_break, collapse, defeat, gold, save | 합성 계열 → Lumina의 실제 녹음 기반 소리로 교체 |
| dice_hit | 주사위 튕김 3회 → 제공 `주사위` 한 번 |

## 지금 쓰는 소리
| 키 | 장면 | 원본 | 출처 |
|---|---|---|---|
| `radio_glitch` | 프롤로그 첫 잡음 | 도도통신기-초반.mp3 | 나모 님 제공 |
| `radio_noise` | 잡음 대사마다 짧은 잡음 조각 | 도도통신기-초반.mp3 외 | 나모 님 제공 |
| `radio_release` | 통신 장면을 떠날 때 | 도도통신기-끝.mp3 | 나모 님 제공 |
| `dice_roll` | 판정 주사위 굴림 | 주사위.mp3 | 나모 님 제공 |
| `enemy_kill` | 일반 적 처치 | 심연 잡몹 처치1.mp3 | 나모 님 제공 |
| `enemy_kill_heavy` | 정예·보스 처치 | 심연 몬스터 처치1.mp3 | 나모 님 제공 |
| `celestial_hit` | 천공 적을 때릴 때 덧붙는 소리 | 천공 몬스터 피격.mp3 | 나모 님 제공 |
| `shield_cast` | 보호막 얻기 | 쉴드.mp3 | 나모 님 제공 |
| `hero_hit` | 아군이 막지 못한 공격에 맞을 때 | 피격음.mp3 외 | 나모 님 제공 |
| `hero_hit_heavy` | 정예·보스 공격에 맞을 때 | 둔탁한 공격.mp3 | 나모 님 제공 |
| `thunder` | 사이노 「칠흑의 심판」 착탄 | 천둥번개.mp3 | 나모 님 제공 |
| `cherubim_attack` | 케루빔 공격 개시 | 케루빔 공격 효과.mp3 | 나모 님 제공 |
| `lyney_throw` | 리니 카드 공격·필살기 | 리니 카드 투척.mp3 | 나모 님 제공 |
| `burn_impact` | 리니 필살기 착탄 후 불타는 소리 | 부딛힌 후 타는 소리.mp3 | 나모 님 제공 |
| `kinich_attack` | 키니치 카드 공격·필살기 | 키니치-공격.mp3 | 나모 님 제공 |
| `polearm_swing` | 사이노 카드 공격(3가지 번갈아) | 스윙.mp3 외 | 나모 님 제공 |
| `illuga_light` | 일루가 필살기 빛 | 일루가 빛.mp3 | 나모 님 제공 |
| `varka_skill` | 바르카 지원 | 바르카 스킬.mp3 | 나모 님 제공 |
| `tighnari_skill` | 타이나리 지원(3가지 번갈아) | 타이나리 스킬1.mp3 외 | 나모 님 제공 |
| `spark` | 번뜩임 · 전술 각성 · 레벨 상승 | 빛 관련.mp3 | 나모 님 제공 |
| `recover` | 정신 붕괴 극복 · 동료 합류 | 빛 관련2.mp3 | 나모 님 제공 |
| `expedition_clear` | 원정 완료(엔딩) | 스테이지 클리어.mp3 | 나모 님 제공 |
| `ward_break` | 적 장막 파괴 | crevasse-ice-break | Lumina |
| `collapse` | 정신 붕괴 컷인 | window-glass-shatter | Lumina |
| `gold` | 모라 획득 | coins-swept-into-a-purse | Lumina |
| `save` | 기록·세이브 저장 | book-cover-shut | Lumina |
| `defeat` | 원정 패배 | knees-strike-and-hands-catch | Lumina |
| `roulette_tick` | 부상 룰렛 | rotary-selector-crosses-one-stop | Lumina |
| `injury_crack` | 부상 경상 | joint-crack-with-tendon-release | Lumina |
| `injury_snap` | 부상 중상 | brittle-double-bone-snap | Lumina |
| `injury_loss` | 부상 결손 | soft-tissue-pull-and-snap | Lumina |
| `map_step` | 지도 이동 | map-table-marker-plant | Lumina |
| `map_open` | 지도 열기 | map-table-board-fold | Lumina |
| `reward_claim` | 보상 획득 | reward-drawer-delivered | Lumina |
| `reward_skip` | 보상 건너뛰기 | trade-offer-declined | Lumina |
| `turn_start` | YOUR TURN | tab-selects-with-a-hard-detent | Lumina |
| `panel_open` | 창 열기 | accordion-panel-unfolds | Lumina |
| `panel_close` | 창 닫기 | accordion-panel-folds-away | Lumina |

출처가 Lumina인 소리는 LuminaBench/lumina-sfx v1.5에서 렌더했다(게임 안 사용 무료, 표기 의무 없음, 효과음 묶음 재배포 금지). 매니페스트 `source`에 레시피와 시드가 있다.


## 적 행동 소리 (3차)
적 공격 연출은 적 스프라이트가 앞으로 덮치고 맞은 쪽에서 파편이 터진다(정예·보스 동일). 덮칠 때 그 생물의 모습에 맞는 소리를, 맞을 때 기존 `hero_hit`/`hero_hit_heavy`/`shield_hit`를 낸다. 장막·강화처럼 공격이 아닌 행동(빛 알갱이가 모이는 연출)은 세계별로 조용한 소리를 낸다. 표는 `dist/sound.js`의 `ENEMY_ATTACK_SOUNDS`.

| 적(모습) | 소리 키 | 원본(Lumina, 녹음 기반) |
|---|---|---|
| 떠도는 점액 | enemy_slime | mud-squelch-footstep (2종) |
| 심연 진드기 | enemy_bite | knife-prop-sinks-into-a-melon (2종) |
| 알을 품은 유충 · 응시하는 부유체 | enemy_wet | close-palm-slap-with-wet-tail (3종) |
| 되살아나는 마디벌레 | enemy_drag | body-dragged-one-length |
| 갈래낫 추적자 · 백은의 추격 기사 | enemy_blade | light-blade-swish |
| 가시심장 포식자 | enemy_crunch | heavy-crunch-under-falling-weight (2종) |
| 맥동하는 균열 고치 | enemy_burst | heavy-fall-into-wet-leaves |
| 천의 눈 · 모태(보스) | enemy_growl | grizzly-grumbles-under-brush (1.4초로 자름) |
| 깃털 감시조 · 검날개 집행자 | enemy_wings | duck-flapping-after-a-bath |
| 붉은 장막의 순례자 · 관측의 결정 | enemy_cloth | linen-page-wipe (2종) |
| 날개 달린 금서 | enemy_pages | book-page-turn |
| 금빛 가시룡 | enemy_hiss | cat-hisses-and-springs-away |
| 초승달의 관측자 | enemy_blast | distant-blast-roll (1.6초) |
| 좌천사 · 별의 파수 | enemy_thunder | thunder-isolated-rolling-strike (2초) |
| 케루빔(레이드) | cherubim_attack | 나모 님 제공 `케루빔 공격 효과` |
| 공격 아닌 행동 | enemy_slime / enemy_cloth | 심연 / 천공 |

후보로 뽑았다가 뺀 것: goose-hissing(울음소리가 위로 꺾임), blade-checks-on-timber·distant-impact-through-a-floor(짧은 음이 섞임), velvet-whip-cut(합성 느낌의 휘익).

## 코드
- 캐릭터별 공격 소리: `dist/sound.js`의 `OWNER_SOUNDS` (`영웅:행동` → [시작, 착탄, 덧소리]). 여기에 없으면 기존 `ATTACK_SOUNDS`를 쓴다.
- 적 행동: `ENEMY_ATTACK_SOUNDS`·`enemyActionSound()` (모습 → 소리).
- 적 등급: 적 요소의 `data-rank`(normal/elite/boss)로 처치·피격 소리를 나눈다.
- 연출이 없는 사건과 프롤로그 통신음: `dist/sound-cues.js`.

## 확인한 것 / 남은 것
- `npm test` 247개 전체 통과. QA 화면에서 일반전(마디벌레)·정예전(부유체)·보스전(모태)을 자동으로 쳐서 적 공격 소리와 사이노 창 휘두르기, 정예 처치, 정예 피격, 부상 룰렛·경상, 프롤로그 통신음이 울리는 것을 기록으로 확인했다.
- 리니·키니치 공격, 바르카·타이나리 지원, 케루빔 공격, 사이노 천둥은 같은 경로를 쓰지만 자동 플레이에서 그 장면까지는 가지 못했다.
- 예전부터 있던 합성 소리(`resource`, `shield_hit`, `victory`, `arcane_*`, `abyss_*` 등 v0.2x 원본)는 이번에 건드리지 않았다.
