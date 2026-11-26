# 제공 일러스트 28장 — 역할 매핑과 인코딩 기록

## 전송 출처

- 제공 파일: `일러스트.zip`
- 런타임 디렉터리: `dist/assets/cast/`
- 4명 × 7장, 총 28장. 원본 파일은 수정하지 않았다.

## 역할 매핑

| 경로 키 | 사용자 지정 용도 | 출력 크기 |
|---|---|---|
| `battle.webp` | 전투 이미지 | 512×512 |
| `cutin-1.webp` | 기본 초상 | 1152×768 |
| `cutin-2.webp` | 필살기 컷인 | 1152×768 |
| `breakdown-1.webp` | 정신 붕괴 컷인 | 640×960 |
| `breakdown-2.webp` | 정신 붕괴 초상 | 640×960 |
| `partner-1.webp` | 파트너 지원 아이콘·초상 | 768×768 |
| `partner-2.webp` | 파트너 지원 컷인 | 768×768 |

파트너 매핑은 로엔–바르카, 두린–알베도, 일루가–플린스, 야호다–네페르다. 전투/붕괴 구분은 사용자 지시를 따랐다. 컷인 번호별 세부 용도는 이번 통합에서 위 표처럼 정했으며, 감상창에서는 두 그림을 모두 볼 수 있다.

## 개별 파일

| 전투원 | 원본 파일명 | 출력 파일 | 용도 | 바이트 |
|---|---|---|---|---:|
| 로엔 | `lohen/로엔 전투.png` | `lohen/battle.webp` | 전투 이미지 | 145,526 |
| 로엔 | `lohen/로엔 컷인1.png` | `lohen/cutin-1.webp` | 기본 초상 | 941,218 |
| 로엔 | `lohen/로엔 컷인2.png` | `lohen/cutin-2.webp` | 필살기 컷인 | 753,664 |
| 로엔 | `lohen/로엔 붕괴1.png` | `lohen/breakdown-1.webp` | 정신 붕괴 컷인 | 333,936 |
| 로엔 | `lohen/로엔 붕괴2.png` | `lohen/breakdown-2.webp` | 정신 붕괴 초상 | 424,656 |
| 로엔 | `lohen/바르카 컷인1.png` | `lohen/partner-1.webp` | 파트너 지원 아이콘·초상 | 559,888 |
| 로엔 | `lohen/바르카 컷인2.png` | `lohen/partner-2.webp` | 파트너 지원 컷인 | 567,906 |
| 두린 | `durin/두린 전투.png` | `durin/battle.webp` | 전투 이미지 | 157,314 |
| 두린 | `durin/두린 컷인1.png` | `durin/cutin-1.webp` | 기본 초상 | 896,956 |
| 두린 | `durin/두린 컷인2.png` | `durin/cutin-2.webp` | 필살기 컷인 | 969,482 |
| 두린 | `durin/두린 붕괴1.png` | `durin/breakdown-1.webp` | 정신 붕괴 컷인 | 351,630 |
| 두린 | `durin/두린 붕괴2.png` | `durin/breakdown-2.webp` | 정신 붕괴 초상 | 314,500 |
| 두린 | `durin/알베도 컷인1.png` | `durin/partner-1.webp` | 파트너 지원 아이콘·초상 | 550,178 |
| 두린 | `durin/알베도 컷인2.png` | `durin/partner-2.webp` | 파트너 지원 컷인 | 512,248 |
| 일루가 | `illuga/일루가 전투.png` | `illuga/battle.webp` | 전투 이미지 | 150,474 |
| 일루가 | `illuga/일루가 컷인1.png` | `illuga/cutin-1.webp` | 기본 초상 | 1,027,178 |
| 일루가 | `illuga/일루가 컷인2.png` | `illuga/cutin-2.webp` | 필살기 컷인 | 1,024,726 |
| 일루가 | `illuga/일루가 붕괴1.png` | `illuga/breakdown-1.webp` | 정신 붕괴 컷인 | 381,036 |
| 일루가 | `illuga/일루가 붕괴2.png` | `illuga/breakdown-2.webp` | 정신 붕괴 초상 | 202,820 |
| 일루가 | `illuga/플린스 컷인1.png` | `illuga/partner-1.webp` | 파트너 지원 아이콘·초상 | 579,834 |
| 일루가 | `illuga/플린스 컷인2.png` | `illuga/partner-2.webp` | 파트너 지원 컷인 | 554,840 |
| 야호다 | `jahoda/야호다 전투.png` | `jahoda/battle.webp` | 전투 이미지 | 146,120 |
| 야호다 | `jahoda/야호다 컷인1.png` | `jahoda/cutin-1.webp` | 기본 초상 | 755,248 |
| 야호다 | `jahoda/야호다 컷인2.png` | `jahoda/cutin-2.webp` | 필살기 컷인 | 895,832 |
| 야호다 | `jahoda/야호다 붕괴1.png` | `jahoda/breakdown-1.webp` | 정신 붕괴 컷인 | 322,404 |
| 야호다 | `jahoda/야호다 붕괴2.png` | `jahoda/breakdown-2.webp` | 정신 붕괴 초상 | 284,994 |
| 야호다 | `jahoda/네페르 컷인1.png` | `jahoda/partner-1.webp` | 파트너 지원 아이콘·초상 | 549,280 |
| 야호다 | `jahoda/네페르 컷인2.png` | `jahoda/partner-2.webp` | 파트너 지원 컷인 | 591,042 |

## 인코딩·검사

- 원본은 모두 RGBA PNG이며 실제 투명도가 있다.
- 전체 캔버스와 종횡비를 유지했다. 크롭·배경제거·색조 변경·생성·복원·임의 편집은 하지 않았다.
- 크기 변경은 LANCZOS 리사이즈만 사용했다.
- WebP는 lossless=True, quality=100, method=4, exact=True로 인코딩했다.
- 28장 모두 WebP를 다시 디코드해 리사이즈 직후 기준 RGBA 배열과 완전히 일치함을 확인했다. 알파도 정확하게 일치한다.
- 원본과 출력 각각의 SHA256, 원본/출력 크기, 용도, 알파 범위와 bbox를 `manifest.json`에 기록했다.
- 원본 28장과 출력 28장을 각각 dark-background contact sheet로 육안 확인했다. 색·자세·효과·복장과 투명 외곽이 유지되었다.
- 갤러리/전투/상태창의 실제 화면 검증은 앱 통합 담당자가 별도로 진행한다. 이 작업은 이미지 인코딩과 검사에 한정했다.

## 용량

- 원본 총합: 41,390,988 bytes (39.47 MiB).
- 런타임 WebP 총합: 14,944,930 bytes (14.25 MiB).
- 원본 대비 63.9% 감소. 매니페스트와 이 문서 용량은 위 WebP 합계에서 제외했다.
- 모든 그림을 처음부터 한꺼번에 디코드하기보다 화면별 지연 로드를 권장한다.

## 전투 이미지 배치 주의

전투 원본은 1024×1024 정사각 캔버스지만 실제 몸체·망토가 왼쪽으로 치우치고 우측 여백이 다르다. 머리·망토·발이 원본 경계에 닿아 있으므로 추가 크롭으로 맞추지 않는다. 전체 캔버스는 유지하고 발밑 위치에 맞춰 배치하는 편이 안전하다.

`manifest.json`의 `battle_alignment.normalized_foot_center_x`와 `normalized_ground_y`를 사용하면 망토 폭에 끌리지 않고 발밑 기준을 맞출 수 있다. 발밑 중심은 알파≥128 불투명 영역 중 하단 8% 띠에서 계산했다. 이는 권장 배치용 메타데이터이며 이미지 자체에 적용한 변경이 아니다.

| 전투원 | 캔버스 내 발밑 중심 X | 지면 Y | 알파≥128 bbox |
|---|---:|---:|---|
| 로엔 | 0.563477 | 1.0 | `[0, 0, 383, 512]` |
| 두린 | 0.740234 | 1.0 | `[1, 0, 478, 512]` |
| 일루가 | 0.573242 | 0.994141 | `[0, 0, 445, 509]` |
| 야호다 | 0.583008 | 1.0 | `[1, 0, 447, 512]` |

기본 초상·필살기·파트너 그림은 공격 효과가 포함된 가로/정사각 구도다. 전체 감상 갤러리에서는 contain을 사용해야 바깥쪽 검격과 마법 효과까지 볼 수 있다. 작은 지원 아이콘에 cover를 적용하는 것은 UI 선택이지만 원본 파일의 크롭은 하지 않았다.

## 매니페스트 구조

- `characters.<hero>.assets.<key>`: 캐릭터별 역할 조회.
- `assets[]`: 전체 28장 순회용 목록.
- `source_filename`, `source_sha256`, `source_size`: 전송 원본 추적.
- `file`: `dist/assets/cast/` 기준 상대 경로.
- `path`: `dist/` 기준 런타임 경로.
- `size`, `bytes`, `sha256`: 출력 파일 정보.
- `alpha_bbox`, `content_bbox_16`, `opaque_bbox_128`: 각각 alpha≥1, ≥16, ≥128의 점유 범위. 실제 파일의 알파를 임계 처리하지 않았다.
- `rgba_roundtrip_exact`, `alpha_roundtrip_exact`: 인코딩 후 배열 비교 결과.

커밋·배포는 이 리소스 작업에서 수행하지 않았다.
