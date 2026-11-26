# 제공 일러스트2 — 웹 변환 및 원본 추적

## 출처와 범위

- 런타임 변환: 스탠딩 5장 + 스킬 카드 28장 + 붕괴 카드 8장 + 후반 배경 2장 = 43장.
- 참고용 원본 보관: 몬스터 PNG 14장. 반드시 `reference_only: true`, `runtime: false`.
- 기존 전투 SD, 필살기 컷인, 붕괴 컷인은 유지했다. 아래 변환 기록과 앱 통합 기록을 함께 참조한다.

## 용도와 크기

| 분류 | 경로 | 크기·형식 | 용도 |
|---|---|---|---|
| 스탠딩 5장 | `dist/assets/illustrations/portraits/<hero>.webp` | 640×935 RGBA lossless WebP | 기본 초상·스탠딩 |
| 스킬 카드 28장 | `dist/assets/illustrations/cards/<hero>/skill-1..7.webp` | 416×608 RGB WebP quality95 | 제공 번호 순서 유지. 아래 기존 카드 배정표 참조 |
| 붕괴 카드 8장 | `dist/assets/illustrations/cards/<hero>/collapse-1..2.webp` | 512×512 RGB WebP quality95 | 붕괴 전용 카드 그림 |
| 후반 배경 A/B | `dist/assets/backgrounds/late-a.webp`, `late-b.webp` | 1920×1088 RGB WebP quality94 | 후반 지역에서만 사용 |
| 몬스터 14장 | `references/monsters/monster-01..14.png` | 원본 PNG 크기·바이트 보존 | 참고 전용. 런타임 미적용 |

## 변경과 검사

- 원본 전체 캔버스를 유지했다. 추가 자르기, 배경 재편집/제거, 포즈·복장 변경, 색조 변경, 새 그림 생성은 하지 않았다.
- 리사이즈는 종횡비를 유지하는 LANCZOS 방식이다. 스탠딩은 원본832×1216을 최대 폭640으로 맞춘 결과640×935이며 정수 픽셀 반올림만 있다.
- 스탠딩의 실제 투명도를 유지했고 lossless WebP 재디코드 RGBA가 리사이즈 기준 배열과 정확히 일치했다.
- 카드 원본은 알파 최솟값252~254/최댓값255인 거의 불투명 PNG였다. 승인된 RGB 경로로 변환했으며 배경 합성이나 새 배경 추가는 하지 않았다.
- 배경 원본도 알파254~255였으며 RGB WebP로 인코딩했다. 배경은 원본1920×1088 그대로다.
- RGB 파일은 손실 압축을 사용한다. 별도의 팔레트/명도/채도 조정은 하지 않았다. 인코딩 평균 절대 채널 오차는 manifest에 기록했다(최대 3.2686/255).
- 스탠딩5·카드36·배경2·몬스터14 원본과 런타임 출력43장을 contact sheet로 시각 확인했다.
- 몬스터14개는 source SHA256과 복사본 SHA256이 모두 같다. 원본13번째 항목의 회색 배경/부분 알파도 그대로 보존했다.
- 앱 통합 후 실제 화면/조작 결과는 docs/QA.md의 0.6 항목에 기록했다.

## 용량

- 런타임 원본43장: 94,053,302 bytes (89.70 MiB).
- 런타임 WebP43장: 6,362,606 bytes (6.07 MiB).
- 런타임 이미지 바이트 감소: 93.24%.
- 몬스터 참고용 원본14장: 16,130,492 bytes (15.38 MiB), 배포용 dist 바깥 보관.
- JSON/문서 용량은 이미지 합계에서 제외했다.

## 런타임 파일 매핑·원본 SHA256

| 역할 | 원본 파일명 | 런타임 경로 | 출력 크기 | 원본 SHA256 |
|---|---|---|---|---|
| standing-portrait | `스탠딩 일러스트/lohen.png` | `assets/illustrations/portraits/lohen.webp` | 640×935 | `57c9e73fbcedb98791ac3576003b5b086a7cad4055188f22e216a715fc2b6c3e` |
| standing-portrait | `스탠딩 일러스트/durin.png` | `assets/illustrations/portraits/durin.webp` | 640×935 | `44b2f1b729c3c9057ccf5e55de04f134055d43de827a6ddf2a738e094a760d7a` |
| standing-portrait | `스탠딩 일러스트/illuga.png` | `assets/illustrations/portraits/illuga.webp` | 640×935 | `04d7dcb80917f9abb3c6c08a49ac4afcf6aba8e2021100d2d3c64b92ae5274d7` |
| standing-portrait | `스탠딩 일러스트/jahoda.png` | `assets/illustrations/portraits/jahoda.webp` | 640×935 | `37e434af53a82ce12e227a9c85ae78f2022cdab7e485de2087aa74529bd23f60` |
| standing-portrait | `스탠딩 일러스트/varka.png` | `assets/illustrations/portraits/varka.webp` | 640×935 | `f3d16e0fa543a6830b7587b573fbb824f0558a9787524ddf9e3dcb6fc88b7e5a` |
| skill-card | `카드 일러스트/스킬카드/로엔1.png` | `assets/illustrations/cards/lohen/skill-1.webp` | 416×608 | `778e72b01a06d919dfe09ca4598e4b30e163b3f331a847d22eddbd6e5e0b53cc` |
| skill-card | `카드 일러스트/스킬카드/로엔2.png` | `assets/illustrations/cards/lohen/skill-2.webp` | 416×608 | `782273b3df816510e78f67d5371a5f2c2fda686d1d71f0de4b2e570e027da37c` |
| skill-card | `카드 일러스트/스킬카드/로엔3.png` | `assets/illustrations/cards/lohen/skill-3.webp` | 416×608 | `47dfc369f7b112e4428e6c465c63168c0f6923bbe6d4ff964b873f868769e9dc` |
| skill-card | `카드 일러스트/스킬카드/로엔4.png` | `assets/illustrations/cards/lohen/skill-4.webp` | 416×608 | `0e6f073b50435bce093691ec20eba9c942359e9f1ea0ea7c4f9a26209503e1e5` |
| skill-card | `카드 일러스트/스킬카드/로엔5.png` | `assets/illustrations/cards/lohen/skill-5.webp` | 416×608 | `5dad154b7238069388822f2daa406128b6949fa54aca8abaf97160411c5f5939` |
| skill-card | `카드 일러스트/스킬카드/로엔6.png` | `assets/illustrations/cards/lohen/skill-6.webp` | 416×608 | `91a1a7cedf2312ce9b323edd5df557d5e048efeb2a54674f4f7c54f01c34032d` |
| skill-card | `카드 일러스트/스킬카드/로엔7.png` | `assets/illustrations/cards/lohen/skill-7.webp` | 416×608 | `0ee3f898e9e60398943a8e74d69eed523592c1ba22a98445373818fa2a82301e` |
| collapse-card | `카드 일러스트/붕괴 카드/로엔1.png` | `assets/illustrations/cards/lohen/collapse-1.webp` | 512×512 | `13e24658345c975d50bf2b4fc671e0299e69ea473863e4d87a7c9957abeff6fb` |
| collapse-card | `카드 일러스트/붕괴 카드/로엔2.png` | `assets/illustrations/cards/lohen/collapse-2.webp` | 512×512 | `cf3ecf8dcccb3199e5084a1027961343664d31511aaa018af96e06cf66135c34` |
| skill-card | `카드 일러스트/스킬카드/두린1.png` | `assets/illustrations/cards/durin/skill-1.webp` | 416×608 | `91c806b60ae3269a421566809168dd9514d42fac52cb44e5baeced20d6439619` |
| skill-card | `카드 일러스트/스킬카드/두린2.png` | `assets/illustrations/cards/durin/skill-2.webp` | 416×608 | `7fafee9236a72969412b225b00164d4c3c46cf1e8749dc0100be1ac7a8022a09` |
| skill-card | `카드 일러스트/스킬카드/두린3.png` | `assets/illustrations/cards/durin/skill-3.webp` | 416×608 | `876242f03ed042d181b13dcf47200ab12658f8571cdaa71f361b41ae73304f6c` |
| skill-card | `카드 일러스트/스킬카드/두린4.png` | `assets/illustrations/cards/durin/skill-4.webp` | 416×608 | `170b3cebbab0bb1ffd710da64da76a56fb0c5ce53e4ea2687fd10995dd0001ce` |
| skill-card | `카드 일러스트/스킬카드/두린5.png` | `assets/illustrations/cards/durin/skill-5.webp` | 416×608 | `1cde06865fd8335b3babea436257b792b8896ef93a470a551dd6db666ca6b0d9` |
| skill-card | `카드 일러스트/스킬카드/두린6.png` | `assets/illustrations/cards/durin/skill-6.webp` | 416×608 | `a0e35a2a6034447eef5c6b17b37c1db76ed2475d8374066a33e76b4d82224f57` |
| skill-card | `카드 일러스트/스킬카드/두린7.png` | `assets/illustrations/cards/durin/skill-7.webp` | 416×608 | `a4f41dfb4172c5e568130c374fa7762e36d76b2cca6bf09be57a13c8ed92438f` |
| collapse-card | `카드 일러스트/붕괴 카드/두린1.png` | `assets/illustrations/cards/durin/collapse-1.webp` | 512×512 | `3dc8088d7bc3fd46f62adc3f9f2435e84965594e2f73b61d5244859adc879496` |
| collapse-card | `카드 일러스트/붕괴 카드/두린2.png` | `assets/illustrations/cards/durin/collapse-2.webp` | 512×512 | `ec9ef2e38b5cba57f93bc08065dbc1746a015fe7bfccad170ad5b7cfe687d745` |
| skill-card | `카드 일러스트/스킬카드/일루가1.png` | `assets/illustrations/cards/illuga/skill-1.webp` | 416×608 | `cc8480aff35849e559303fafa022e1349260600f2159016ff04f5bcfdc96b6bd` |
| skill-card | `카드 일러스트/스킬카드/일루가2.png` | `assets/illustrations/cards/illuga/skill-2.webp` | 416×608 | `62c4d575f70af04bb16efa0cfef85d6e6909ecfac5732bfe58db9d0e1f1a8c05` |
| skill-card | `카드 일러스트/스킬카드/일루가3.png` | `assets/illustrations/cards/illuga/skill-3.webp` | 416×608 | `66751b9ed22f46a350728a12b58a79e379217763fb116cc31a6b684fa8d3678e` |
| skill-card | `카드 일러스트/스킬카드/일루가4.png` | `assets/illustrations/cards/illuga/skill-4.webp` | 416×608 | `c1341ee2812ebfa47985923bbf38e2536f7a3eea53735f32fbc026b8e4678106` |
| skill-card | `카드 일러스트/스킬카드/일루가5.png` | `assets/illustrations/cards/illuga/skill-5.webp` | 416×608 | `71cc58b9cba47467c1e8f89ea26ffdf00263d3ae3b682889639d00982a9f35f7` |
| skill-card | `카드 일러스트/스킬카드/일루가6.png` | `assets/illustrations/cards/illuga/skill-6.webp` | 416×608 | `ba43f1c63e5f6fa280dc9c41d2edcbb848ffccfc5174e90008f10a3e675aafd2` |
| skill-card | `카드 일러스트/스킬카드/일루가7.png` | `assets/illustrations/cards/illuga/skill-7.webp` | 416×608 | `29be08012b1aba0fa4dfd015b9701b81332af90cf987ba260ed6e4d99031ae53` |
| collapse-card | `카드 일러스트/붕괴 카드/일루가1.png` | `assets/illustrations/cards/illuga/collapse-1.webp` | 512×512 | `d14f22d7470646e6813c2c3b4b62c4308022c7d3373cfc7799f562dfbed9c1eb` |
| collapse-card | `카드 일러스트/붕괴 카드/일루가2.png` | `assets/illustrations/cards/illuga/collapse-2.webp` | 512×512 | `04a39794b3dd33172466223b33c42ac8838edbd9bd50ac6ed7cc6a933d104fd3` |
| skill-card | `카드 일러스트/스킬카드/야호다1.png` | `assets/illustrations/cards/jahoda/skill-1.webp` | 416×608 | `7dcd1b88e3cbade1cbaa7f876bfc0ae8651286aeca008c4c49d5a3283b97fdc9` |
| skill-card | `카드 일러스트/스킬카드/야호다2.png` | `assets/illustrations/cards/jahoda/skill-2.webp` | 416×608 | `c8a073de35c2742906bd6b9fd3f7223bd73aca27ef742a26695d295b3c65a9b1` |
| skill-card | `카드 일러스트/스킬카드/야호다3.png` | `assets/illustrations/cards/jahoda/skill-3.webp` | 416×608 | `0bfa6b65e07ef211b2b3ad768671dc0c3476fc76976e1cf90fd0b2eacdbc8429` |
| skill-card | `카드 일러스트/스킬카드/야호다4.png` | `assets/illustrations/cards/jahoda/skill-4.webp` | 416×608 | `972956cb3e22a90f7215ee9e6b210bce3200040e3446990ac8ae485e8c526f18` |
| skill-card | `카드 일러스트/스킬카드/야호다5.png` | `assets/illustrations/cards/jahoda/skill-5.webp` | 416×608 | `aa3bcf3b7ba8bf1a4c728ba4cd59f8e54c2415a0802316e7408140aebf7dd034` |
| skill-card | `카드 일러스트/스킬카드/야호다6.png` | `assets/illustrations/cards/jahoda/skill-6.webp` | 416×608 | `cfc8d3d98574e1a71656e10c9014acc3becbaa7dd47be643a88493c51c6644d2` |
| skill-card | `카드 일러스트/스킬카드/야호다7.png` | `assets/illustrations/cards/jahoda/skill-7.webp` | 416×608 | `faf013c7014cbd702fb867c0494203d8790e4e6154ecc96e7938668485374b50` |
| collapse-card | `카드 일러스트/붕괴 카드/야호다1.png` | `assets/illustrations/cards/jahoda/collapse-1.webp` | 512×512 | `786d08976917201febf32d34d68799bfdd8c01696de8ad6963593af332bd2086` |
| collapse-card | `카드 일러스트/붕괴 카드/야호다2.png` | `assets/illustrations/cards/jahoda/collapse-2.webp` | 512×512 | `1f4741223558213c5dae2128d3903c9ee2344442a46f4858d5245b9cda81ef53` |
| late-background | `배경/A.png` | `assets/backgrounds/late-a.webp` | 1920×1088 | `1f7274236e8934da300160cd9a55b64c74660073c9201e0706e38ab0ca76d21d` |
| late-background | `배경/B.png` | `assets/backgrounds/late-b.webp` | 1920×1088 | `9dc64ef2309cebf46a89402606153994a9706b51315375d5bbf7c5c7fba384f9` |

## 몬스터 참고용 복사·원본 SHA256

아래 파일은 런타임 자산 목록에 포함되지 않는다. 원본의 긴 프롬프트형 이름은 안전한 ASCII 번호 파일명으로 바꾸어 복사했으며 내용은 변경하지 않았다.

| 참고 파일 | 원본 파일명 | 원본 크기 | 원본 SHA256 |
|---|---|---|---|
| `references/monsters/monster-01.png` | `몬스터/no humans, solo, floating, {ophanim}, interlocking golden rings, glowing red ver s-3256935275.png` | 1024×1024 | `4b5f6bd50352b1aa678900123f8943caa84b96da841929b0299456098c9e866f` |
| `references/monsters/monster-02.png` | `몬스터/no humans, solo, floating, {ophanim}, interlocking golden rings, glowing red ver s-546601625.png` | 1024×1024 | `3f6d6e36e8a6091c4b85979a7aec6d8661fe17015abbf5731a7ed979d2173502` |
| `references/monsters/monster-03.png` | `몬스터/no humans, solo, full body, floating, legless, white and gold, glowing red slit, s-1399317826.png` | 832×1216 | `c51d4497205e31894aa097e60399d9536177d42238340dbcc48de4de06944c64` |
| `references/monsters/monster-04.png` | `몬스터/no humans, solo, full body, floating, legless, white and gold, glowing red slit, s-3724632223.png` | 832×1216 | `b0f10e82d42c46f6ff24aa6e3f5c44a06de2dd5bd859bafbf9a99b607fa74b5b` |
| `references/monsters/monster-05.png` | `몬스터/no humans, solo, full body, floating, legless, {heavy armor}, white and gold arm s-1665184791.png` | 1024×1024 | `cc8d5883805713e7783b12a16633080db22267da250b5de842542f42ce0d3759` |
| `references/monsters/monster-06.png` | `몬스터/no humans, solo, full body, floating, legless, {heavy armor}, white and gold arm s-2813895463.png` | 832×1216 | `dc78050fa521225c56afc696adea0407d35cd92cf062ab02f64f89358497475f` |
| `references/monsters/monster-07.png` | `몬스터/no humans, solo, full body, floating, legless, {heavy armor}, white and gold arm s-3361783194.png` | 1024×1024 | `918de9699739f92c2b7bdfc0cd7dc2ee8d4aa9ba83a12580c470ca40cce8c08b` |
| `references/monsters/monster-08.png` | `몬스터/no humans, solo, monster, floating, {eldritch horror}, jellyfish-like body, spli s-1299634347.png` | 1024×1024 | `d698605a33066ca580b41b7ebe1e681116f12be6ee82ab20db724e94617b6b93` |
| `references/monsters/monster-09.png` | `몬스터/no humans, solo, monster, floating, {eldritch horror}, jellyfish-like body, spli s-2215030511.png` | 1024×1024 | `48f1cccc1d50a9eccef484a75086aa6caadf659dff08c2ac1c59336590033db8` |
| `references/monsters/monster-10.png` | `몬스터/no humans, solo, monster, floating, {eldritch horror}, jellyfish-like body, spli s-3270457644.png` | 1024×1024 | `76899dff1821361688dc99f41f5bf96e916286f2bc355acddcc45992049894fa` |
| `references/monsters/monster-11.png` | `몬스터/no humans, solo, monster, floating, {eldritch horror}, jellyfish-like body, spli s-3393208387.png` | 1024×1024 | `a725af039e61e328a04a5a3950dc28f7e535b2d2bca4e840701dcf73595dc67d` |
| `references/monsters/monster-12.png` | `몬스터/no humans, solo, monster, {insectoid}, dark purple chitin, glowing magenta sac,  s-1811009934.png` | 1024×1024 | `068ab4c74e94fac312421624d99f4e992fd49ab541d025572e88f3ffd7d9bc3a` |
| `references/monsters/monster-13.png` | `몬스터/no humans, solo, monster, {insectoid}, dark purple chitin, glowing magenta sac,  s-2165253313.png` | 832×1216 | `6fc80d70233841af467d87645f9e22b71d73655be9517cf767141a96b4d15a78` |
| `references/monsters/monster-14.png` | `몬스터/no humans, solo, monster, {insectoid}, dark purple chitin, glowing magenta sac,  s-958494463.png` | 1024×1024 | `52f3336524022afc57143940372dea7fecfb90117a5b721ff993e36c6eec8459` |

## 매니페스트 구조

- `dist/assets/illustrations/manifest.json`: `portraits.<hero>`, `cards.<hero>.skills[]`, `cards.<hero>.collapse[]`, `backgrounds.<key>`, `assets[]`(런타임43장).
- `reference_only_monsters`는 위치·개수·runtime:false 선언만 포함한다. 몬스터 실제 원본 목록은 dist 바깥 `references/monsters/manifest.json`에 있다.
- 각 런타임 항목에는 source filename/hash/size, output path/hash/size/bytes, role, encoding 설정과 원본 알파 범위를 기록했다.
- 스킬카드 index1..7과 붕괴카드 index1..2의 제공 순서는 변경하지 않았다.



## 앱 적용과 기존 카드별 배정 (0.6)

로엔·두린·일루가·야호다의 정상 초상과 로엔의 파트너 바르카 초상에 새 스탠딩을 연결한다. 정상 초상은 새 스탠딩, 붕괴 초상은 기존 breakdown-2, 필살기/붕괴/지원 컷인은 기존 제공 그림을 유지한다. 이전 cutin-1과 partner-1도 일러스트 감상의 별도 항목으로 계속 열 수 있다.

번호는 해당 캐릭터의 제공 스킬카드 파일 번호다. 기존 효과/코스트/카드풀은 변경하지 않는다. 강화 A/B는 같은 강화 그림을 사용한다.

| 캐릭터 | 기존 카드 | 기본 그림 | 강화 그림 |
|---|---|---:|---:|
| 로엔 | 정확한 일격 | 1 | 5 |
| 로엔 | 방어 태세 | 4 | 6 |
| 로엔 | 집중 관통 | 3 | 7 |
| 로엔 | 조준 | 2 | 2 |
| 두린 | 용의 발톱 | 1 | 5 |
| 두린 | 비늘의 수호 | 4 | 4 |
| 두린 | 흑염의 날개 | 3 | 7 |
| 두린 | 용의 숨결 | 2 | 6 |
| 일루가 | 견제 | 3 | 7 |
| 일루가 | 보호 전개 | 1 | 6 |
| 일루가 | 반격 준비 | 4 | 4 |
| 일루가 | 엄호 | 2 | 5 |
| 야호다 | 기습 | 1 | 4 |
| 야호다 | 방어 태세 | 6 | 7 |
| 야호다 | 재정비 | 5 | 5 |
| 야호다 | 행동 지원 | 3 | 2 |

붕괴는 절망/공황=붕괴카드1, 불신/폭주=붕괴카드2. 현재 유형 메타데이터를 읽어 선택하므로 원래 카드 종류와 무관하게 전용 그림과 효과가 함께 변한다.

### 후반 배경

| 구간 | 배경 |
|---|---|
| 초반·야영·거점·재탐사·엔딩 | 기존 배경 |
| 연결 장막 정예 이후·악몽영주 | B: 심연의 숲 |
| 영역수호자 | A: 무너진 성당 |
| 최종 파수꾼 | A: 최종전 명도/채도 |

현재 첫 거점+3전선 개발 범위의 후반에만 배정했다. 전체8지역을 새로 구현한 변경은 아니다.

### 카드 틀 참고

카제나 공식 소개 https://chaoszeronightmare.onstove.com/ko?mcode=28 및 검색으로 확인한 실제 전투 스크린샷 https://img.game8.co/4373920/c883843d69c2a9debe4ad3e900445b4a.jpg/poster 를 참고했다. 전면 일러스트, 얇은 옆선 프레임, 좌상단 흰 코스트, 짧은 이름/분류, 하단 작은 태그의 정보 배치를 재구성했다. 참고 게임의 이미지/프레임 텍스처는 배포에 포함하지 않는다. 실제 카드 그림은 사용자 제공 파일이다.
