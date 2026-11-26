# v0.35 — 공격 레이어, 전리품 장착 창, 각성 문구, BGM·효과음

기준: main(PR #11 병합, ec9356b) 위, 브랜치 `claude/v0.35`.

## 전투
- 공격하는 전투원은 동작 동안 `.acting` 클래스를 받아 적보다 위(z-index 60)에 그려진다(motion.js `playerEffects`, feedback-v28.css).
- 로엔 근접 돌진: 중심 대신 발끝(스프라이트 아래쪽)끼리 거리를 재고, 적 몸통 왼쪽 18% 지점 바로 앞에 선다. 세로 이동은 ±40px로 제한한다.

## 상점·전리품
- 키라라 상점 `카드 제거` 탭에서 카드가 보이지 않던 문제: 상점 루트가 `data-state="idle"`로 남아 `.shop-content`가 숨겨졌다. 제거 탭에서는 `data-state="remove"`.
- 전투 후 전리품 장착 창(`pendingEquipModal`)을 상점의 '아이템 선택' 화면과 같은 구조로 바꿨다: 왼쪽 진열 캡슐+설명+`가방에 보관`, 오른쪽 전투원 행(현재 무기·장신구, `장착`/`교체 장착`). 장비가 여러 개면 `남은 장비 N`을 표시한다.

## 각성 카드 문구
- 카드 설명 뒤에 붙던 `[각성 이름]`, `[번뜩임: …]` 꼬리표를 없앴다. 번뜩임 효과 문장만 대괄호 없이 이어 붙인다(engine.js `cardInfo`).

## 효과음 (dist/assets/audio/sfx)
사용자 제공 효과음을 24 kHz·모노·16비트로 바꾸고, 앞쪽 무음을 잘라 타이밍을 맞췄으며, 실제 소리 구간 RMS를 맞추고 피크를 -3.3 dBFS 이하로 낮췄다(끝 30 ms 페이드). 출처와 처리 내역은 manifest.json 각 항목의 `source`·`processing`에 있다.

| 상황 | 휘두름(시작) | 타격(+90 ms) |
|---|---|---|
| 로엔 창 / 필살 | swing_light / swing_heavy | strike |
| 두린 불꽃 / 필살 | fire_weak / fire_strong | arcane_hit / heavy_hit |
| 일루가 반격 | swing_light | slash |
| 야호다 발차기 | kick | strike |
| 바르카 대검 | swing_heavy | slash |
| 네페르 발차기 | kick | dagger |

그 밖에: 카드 배분 card_flip, 버튼 ui_tap, 승리 stage_clear.

## BGM (dist/assets/audio/bgm)
| 장면 | 곡 |
|---|---|
| 로비 | lobby.mp3 |
| 원정 일반 전투·패배 | battle.mp3 (battle1) |
| 보스 레이드 | raid.mp3 (케루빔 테마) |
| 정예·보스 전투 | 기존 보스 곡 유지 |
| 탐색 / 타이틀·거점·야영 | 기존 stage-a/b / main 유지 |

원본 파일은 변환하지 않고 그대로 넣었다(LUFS -15.8 / -14.9 / -15.7로 이미 비슷함).

## 검증
- npm test 181/181 (tests/v35.test.mjs 추가, 음원 길이 제한은 `source`가 있는 항목만 2.2초로 완화).
- 1277×635, 844×390에서 전리품 장착 창, 카드 제거 탭 스크린샷 확인. 로엔 공격 중 z-index 60, 콘솔 오류 없음.
- 실제 휴대전화 소리 타이밍·음량은 미검수.
