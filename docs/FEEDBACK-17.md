# v0.17 메인 로비 · 보스 레이드 · 근거리 돌진 · 전리품 장착 · 카제나 연마 연출

## 변경 파일
- `dist/engine.js`: `BRANCH_A_SPECS`(16종 카드 A강화 구체화), `RAID_BOSS_DEFAULT`, 로비 귀환/복귀(`returnToLobby`/`resumeExpedition`), 보스 레이드(세이브 데이터당 3회 트라이 · 최고 단일 트라이 피해 누적 토벌 `startRaid`/`finishRaid`/`resetRaidBoss`), 전리품 장비 즉시 장착(`pendingEquip`/`equipPending`/`skipPendingEquip`) 추가.
- `dist/cast-art.js`: 카드 강화 시 일러스트 교체 분기를 제거해 기본 일러스트를 유지하도록 변경.
- `dist/motion.js`: 근거리 캐릭터(로엔·일루가·야호다) 공격 시 타게팅한 적 앞으로 돌진 → 타격 → 제자리 복귀 애니메이션 및 잔상(`.melee-dashing`) 구현.
- `dist/app.js`, `dist/feedback-v17.css`, `dist/index.html`: 카제나·명일방주·블루아카이브 감성의 메인 로비(`로엔 스탠딩` + `late-b.webp` 배경 + 원정/보스 레이드/전투원·파트너/도감 4버튼), 거점 `임시저장 후 로비로` 버튼, 보스 레이드 출격/정산 모달, 전리품 장비 장착 대상 선택 모달, 카제나 번뜩임 스타일 카드 강화 연출(`refineCutin`) 추가.
- `tests/feedback-v17.test.mjs`, `tests/illustrations-scene.test.mjs`: v0.17 신규 5개 테스트 추가 및 총 120/120 통과 확인.
