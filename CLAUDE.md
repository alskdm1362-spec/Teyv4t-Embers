# 티바트 방어전 · 잔불 | Claude 협업 시작
기준 버전 v0.34 · 2026-11-26 · v0.25(원본 Git 커밋 b9b1c077dd28c8e9dbfd41605cbacb86b85b272f) 위에 Claude가 작업

## 실행 및 검증
- Windows에서 압축을 완전히 해제하고 Node.js 22 이상에서 START-WINDOWS.cmd를 실행하세요. 터미널에서는 프로젝트 루트에서 node start.mjs를 실행하세요.
- 본편 http://127.0.0.1:8080/ · QA http://127.0.0.1:8080/qa
- npm test로 검사합니다. 별도의 npm install 없이 실행됩니다. 인계 시점에 178개 모두 통과했습니다.
- dist/가 직접 편집하는 게임 소스와 리소스입니다. tests/에는 자동 테스트가 있습니다.

## 먼저 읽을 문서
1. docs/UI-REPAIR-33.md에서 최신 변경과 검증 범위를 확인하세요(이전 변경은 docs/UI-REPAIR-30.md, 29.md, 28.md, 27.md, 26.md, 25.md). START-HERE.md와 GEMINI.md는 이전 시점의 인계 기록입니다.
2. docs/ILLUSTRATIONS-3.md와 dist/assets/update25/manifest.json에서 그림별 용도를 확인하세요. 몬스터 외형은 dist/enemy-looks.js, 전투원 포즈는 cast-art.js의 CAST_SPRITES, 전투 이펙트는 dist/battle-vfx.js, 정신 붕괴 컷인 배경은 dist/collapse-scene.js에 있습니다. 전투 스탠딩, HUD 초상, 카드, 필살기 및 붕괴 컷인은 별도 역할입니다.
3. UI를 바꿀 때는 docs/UI-STYLE-GUIDE.md, 기존 화면 구조, docs/implementation-lessons.md를 함께 확인하세요.

## 함께 작업할 때
작업 시작 전에 공유 Git 커밋과 담당 기능을 기록하세요. 각 작업자는 자신의 브랜치에서 수정하고, 변경 파일·테스트 결과·남은 확인 사항을 커밋과 함께 인계하세요. 동일한 화면이나 dist/app.js의 같은 부분을 동시에 수정할 때는 먼저 담당 범위를 합의하세요.
UI 작업은 모바일 가로 본편과 QA에서 해당 조작 흐름까지 확인하세요. v0.26에서도 실제 휴대전화의 터치·프레임 성능 및 사람의 전체 원정 플레이는 미검수입니다. 지도(dist/map.js)는 노드 번호를 열 번호로 그대로 쓰므로 ROUTE 길이를 바꾸면 지도도 다시 생성됩니다. 로비·세이브 데이터·레이드처럼 원정 밖에 남아야 하는 값은 반드시 s.collection에 두세요. 원정 종료와 새 원정은 collection만 이어받습니다.
