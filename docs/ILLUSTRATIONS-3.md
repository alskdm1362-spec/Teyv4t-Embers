# 일러스트 3 자산 매핑 및 검증

사용자 첨부 `일러스트3.zip`, `main.png`, `teyvat_defense_embers_logo.png`를 원본으로 사용했다. 새로운 그림 생성, 내용 편집, 배경 제거, 추가 크롭, 색상 보정, 좌우 반전은 수행하지 않았다. 원본 PNG와 ZIP은 수정하지 않았다.

## 출처와 안전 확인

- 압축 원본: `일러스트3.zip` (56,863,891 bytes), SHA-256 `35eec9f41a8d5969277f2345b96d264a7fb61f6bb4fc03f3d4ee83539706a0f8`.
- 62 ZIP 항목 중 폴더 6개와 PNG 56개를 확인했다. 절대 경로·상위 경로 이동·심볼릭 링크가 없고, 파일별 크기·압축률 제한을 통과한 항목만 별도 디렉터리에 추출했다.
- 추가 첨부 이미지 2개를 포함하여 원본 58장 전체를 용도별 contact sheet로 시각 검토하고, 변환 출력 58장 전체도 다시 시각 검토했다.
- 전달된 로컬 첨부 파일명과 아래 개별 SHA-256으로 출처를 기록했다. 이번 첨부의 Library 식별자는 제공되지 않아 기재하지 않았다.

## 경로와 용도

모든 런타임 경로는 `dist/` 기준이다. 상세 경로맵과 개별 검증 데이터는 `dist/assets/illustrations3/manifest.json`에 있다.

| 분류 | 장수 | 런타임 경로 | 원본 → 출력 | 용도 |
|---|---:|---|---|---|
| 스탠딩 | 13 | `assets/illustrations3/standing/<id>[-collapse].webp` | 832×1216 → 624×912 | 상태창, 파트너 멘탈 케어, 키라라 장면 |
| 파트너 카드 | 4 | `assets/illustrations3/partner-cards/<id>.webp` | 832×1216 → 416×608 | 바르카·알베도·플린스·네페르 지원 카드 |
| 결손 카드 | 4 | `assets/illustrations3/injuries/<hero>/eye-card.webp` | 832×1216 → 416×608 | 눈 결손 전용 카드 |
| 결손 컷인 | 12 | `assets/illustrations3/injuries/<hero>/{eye,arm,leg}-cutin.webp` | 1216×832 → 912×624 | 눈·팔·다리 결손 상황 연출 |
| 스킬 초상화 | 8 | `assets/illustrations3/skill-portraits/<id>.webp` | 400×300 → 동일 | 전투원·파트너 액션 얼굴 배너 |
| 붕괴 SD | 4 | `assets/illustrations3/battle-collapse/<hero>.webp` | 1024×1024 → 512×512 | 붕괴 중에만 정상 전투 SD 대신 표시 |
| 전투원 초상화 | 8 | `assets/illustrations3/portraits/<hero>[-collapse].webp` | 300×300 → 동일 | 정상·붕괴 상태 HUD 얼굴 |
| 거점·튜토리얼 장면 | 3 | `assets/illustrations3/scenes/{party-base,tutorial-1,tutorial-2}.webp` | 1920×1088 → 1440×816 | 거점 편성, 튜토리얼 컷신 1·2 |
| 메인 화면 | 1 | `assets/illustrations3/title-main.webp` | 1920×1088 → 동일 | 타이틀 배경 |
| 로고 | 1 | `assets/illustrations3/title-logo.webp` | 1376×768 → 동일 | 투명 타이틀 로고 |

전투원 ID는 `lohen`, `durin`, `illuga`, `jahoda`이며, 파트너 ID는 `varka`, `albedo`, `flins`, `nefer`다. `kirara`는 일반 스탠딩만 포함된다. 스킬 초상화는 8장의 가로 얼굴 배너이며, 앞서 전달된 36장의 개별 스킬/붕괴 카드 그림과 구별하여 사용한다.

## 표시 권장 및 주의

- 전투원 HUD의 눈·어깨 중심 얼굴은 전용 `portraits/`의 300×300 정상·붕괴 그림을 사용한다. 상태창은 `standing/`의 새 스탠딩을 사용한다.
- 파트너 지원 Dock은 `skill-portraits/`의 400×300 얼굴 배너를 사용한다. 파트너용 300×300 전용 초상은 이번 첨부에 없다. 멘탈 케어 장면은 파트너 `standing/`을 사용한다.
- 파트너 스탠딩은 정면에 가까운 3/4 자세다. 바르카·알베도는 화면 오른쪽을 약간 향하고, 플린스·네페르는 화면 왼쪽을 약간 향한다. 원본 방향 그대로 저장했고 좌우 반전하지 않았다.
- 일부 스탠딩 원본의 캔버스 왼쪽 가장자리에 가느다란 어두운 세로 흔적이 있다. 원본 보존을 위해 수정하지 않았다. 필요하면 앱의 표시 영역에서만 다룬다.
- 붕괴 SD는 네 전투원 모두 오른쪽을 향한 측면 자세이며 고개와 몸을 숙이고 있다. 원본 전체 캔버스를 유지했다. manifest의 `battle_alignment`에 불투명 하단 8% 영역을 바탕으로 산출한 발 중심과 지면 높이 정규화 좌표를 기록했다.
- `party-base`는 로엔이 손을 들어 매와 함께 있는 거점 편성 장면, `tutorial-1`은 로엔과 서풍 매가 가까이 함께 있는 장면, `tutorial-2`는 청록색 참격/마법 장면이다. 번호는 원본 파일명과 일치한다.
- 위 3장면은 투명 영역을 포함한 연출 그림이므로 평면 배경으로 오인하지 않는다. 제목 로고도 원본의 넓은 투명 캔버스와 여백을 유지했다.
- 기존 정상 전투 SD, 필살기·정신 붕괴 컷인 파일은 이번 자산 작업에서 바꾸지 않았다. 앱·엔진·CSS·오디오 코드는 편집하지 않았다.

## 인코딩과 확인

- 전체 캔버스와 종횡비를 유지하며 LANCZOS로 축소했다. 알파 채널은 임계값 처리나 배경 제거 없이 RGBA로 보존했다.
- 54장은 lossless WebP로 인코딩했다. 큰 장면 3장과 타이틀 메인 1장은 WebP quality 94로 인코딩했다. 제목 로고는 원본 해상도의 lossless RGBA다.
- 출력 58장 전체의 알파 배열은 리사이즈 직후 데이터와 완전히 일치했다. lossless 출력 54장은 RGBA 전체가 리사이즈 직후 데이터와 완전히 일치했다. 나머지 4장은 압축에 따른 RGB 오차만 있다.
- 모든 출력의 파일 존재 여부, 경로 중복 없음, 크기, 개별 원본/출력 SHA-256을 재검증했다.
- 런타임 이미지 합계: **58장, 17,645,470 bytes (16.83 MiB)**. 입력 PNG 합계 61,951,526 bytes 대비 71.5% 감소했다. manifest 및 문서는 이 이미지 합계에 포함하지 않는다.
- 자산 변환과 검증만 완료했다. 앱 연결·실제 플레이 화면 확인은 앱 담당 작업에 속하며, 이 문서는 게임 전체 완료를 뜻하지 않는다.

## 개별 원본과 출력

| 원본 파일명 | 역할 | 출력 경로 | 크기 | 원본 SHA-256 | 출력 SHA-256 |
|---|---|---|---|---|---|
| 스탠딩 일러스트/albedo.png | normal-standing | `assets/illustrations3/standing/albedo.webp` | 624×912 | `c75b3c3bf5bf6835d2c32eed71ebbde209642af3c9efa433a29a6fae8350ff8b` | `73415006e44ecf03bafd0eb466937c5d9bd0c753ca222ea3120e308f419e7665` |
| 스탠딩 일러스트/durin-붕괴.png | collapse-standing | `assets/illustrations3/standing/durin-collapse.webp` | 624×912 | `3d59fb2fa5595ceb4f28917990d307d47aed1f6b00ee545f5226b02023ea4d2f` | `a173ec295e08931e704061f626d2346270e58a1acf5cc3982d32d23175e15e73` |
| 스탠딩 일러스트/durin.png | normal-standing | `assets/illustrations3/standing/durin.webp` | 624×912 | `1c33379dfcfe7ae49d9355439b423bfd9f0a449ea724ce78bac87fd347b16401` | `f66307546c4c23a7ea47bdaaa4a302b87ba0a5e735687c729c86c71967274698` |
| 스탠딩 일러스트/flins.png | normal-standing | `assets/illustrations3/standing/flins.webp` | 624×912 | `016f4e396f62e543fc7896c4206515206dacca34f4f925e09612bf83b0d4de63` | `18689d3a9645616ea1dea01696458409b5b924ac7ead42680f80dba02c0e2534` |
| 스탠딩 일러스트/illuga-붕괴.png | collapse-standing | `assets/illustrations3/standing/illuga-collapse.webp` | 624×912 | `44f89867f0201cf54eff0e8ead997d1820e83878c1f0e1aa6bfec0888b518477` | `65759e8e6e55ebc9e72c7b017197f814cb4c39c383ccaf6c98fd1fc41f7f83e5` |
| 스탠딩 일러스트/illuga.png | normal-standing | `assets/illustrations3/standing/illuga.webp` | 624×912 | `1dbd5416e8b37955328d8d060c5ce41429244c8ff1838e3003a29f2ed77b4217` | `57f79bed6e020fb16fe856898116e37a318aca14975c435c35c8cba58585303e` |
| 스탠딩 일러스트/jahoda-붕괴.png | collapse-standing | `assets/illustrations3/standing/jahoda-collapse.webp` | 624×912 | `e0603cada73edf01e8c23a14a2669e207336d676fa65228ef461e15e12d584f7` | `febe196aea0e61c35509539c4cf8c8ebf4bae9ebc6b0175b7151f6429b198932` |
| 스탠딩 일러스트/jahoda.png | normal-standing | `assets/illustrations3/standing/jahoda.webp` | 624×912 | `d6bca7891ba5f18f8c756e2bcc1bc7ab7642c4a5e52c731e257d12f8d13b825e` | `cc295dde5d454514c1ea4a9fc13765e5cf10d1c31a9f0e459e9a47ef4904366c` |
| 스탠딩 일러스트/kirara.png | shopkeeper-standing | `assets/illustrations3/standing/kirara.webp` | 624×912 | `c6b5308b93d4066d12cc879573f0a5892ce29e3d8e69edaca4592259081297bb` | `805eab786d78fb01052b2700a569b0e95b5218e6f927b849b960c7f5be654128` |
| 스탠딩 일러스트/lohen-붕괴.png | collapse-standing | `assets/illustrations3/standing/lohen-collapse.webp` | 624×912 | `fcb08b392113b1041bed313373f5337b5fe1ca58a10d44319dd73c69ba07d919` | `f0d3ae86f364d09d9c579fa3655a7aa28432203a937de292bf50976d98e550a4` |
| 스탠딩 일러스트/lohen.png | normal-standing | `assets/illustrations3/standing/lohen.webp` | 624×912 | `24b8e505c584717618c911d4acfcccc6973ce743088645ab1965e4092cd39054` | `d02d60f4ca1764e515c51f2482c791e67844cef3a5d1c2350f23f29c6fc7dd97` |
| 스탠딩 일러스트/nefer.png | normal-standing | `assets/illustrations3/standing/nefer.webp` | 624×912 | `55cef721eb90240cbc4cfcfd75b4c62901368f5c55aee444580425cbe821f265` | `c9d898586d0253919c3c81cdad1a3b5e2252401db2a4e6caf7317896ca7cd1a0` |
| 스탠딩 일러스트/varka.png | normal-standing | `assets/illustrations3/standing/varka.webp` | 624×912 | `7187b077a0b20eb4ae05368e0e44570f9783f18be25aaa5145a55419e536fa1f` | `ee55ad8c4981e98bfcb7f8d6579e79503c6ebb46ba8e34caf55213849fb70c74` |
| 파트너 카드/네페르.png | partner-card | `assets/illustrations3/partner-cards/nefer.webp` | 416×608 | `c99e730e547258cb572389678e392f64f6986708744d541a5bb26da76d56c515` | `45e2368b674df903337e626d3d42ecb97148b8339b7cf50f60c1ae3d03dfd27e` |
| 파트너 카드/바르카.png | partner-card | `assets/illustrations3/partner-cards/varka.webp` | 416×608 | `9c9fbfd726068523bf02eca87deff7163eaa3c6d52b08a1949837866b5eea826` | `321dfe6cd1e60dff03540b028b64c644f4d8f5406172e5c7060001dc8e401911` |
| 파트너 카드/알베도.png | partner-card | `assets/illustrations3/partner-cards/albedo.webp` | 416×608 | `4481e7f57098416b46142fbb41a94d1f9532b08ad11386ca244281cdc25841a4` | `016c9aba5a96c6268d6728b780ff642a7ca0cf1cb2f3e8da3fa86a955eefc3b5` |
| 파트너 카드/플린스.png | partner-card | `assets/illustrations3/partner-cards/flins.webp` | 416×608 | `f826e79d95a17242d7200dcf7bf88e2e2c73251117d051b2827a3e82f2aa965d` | `bee568c6a0dcee5263f386f907cde5d50c75e3a7032a8c2b4abf9e841ad14a8d` |
| 결손 일러스트/durin-눈 결손 카드.png | eye-loss-card | `assets/illustrations3/injuries/durin/eye-card.webp` | 416×608 | `863189568ff0894c7e78d0f9c3c0763d1e8f4e63d1198a3483d918e0427b55e2` | `bce4b5fbe7360fec5f3b909f08be779034cd4c707659dbf83bd77865812b810d` |
| 결손 일러스트/durin-눈 결손 컷인.png | eye-cutin | `assets/illustrations3/injuries/durin/eye-cutin.webp` | 912×624 | `5c22d1103c5265e1c836b4487f5a7e2f10308f166b930c237fde5e52043690c1` | `77965512693821bda1a25ed3d5f7d41e9908a6e199f974ad290acc608d3d75c2` |
| 결손 일러스트/durin-다리 결손 컷인.png | leg-cutin | `assets/illustrations3/injuries/durin/leg-cutin.webp` | 912×624 | `c9370f5b8dd1792b7a5421b676195fb67ec5229e01c264a4435ebb2cfeda71dc` | `6a0226c424dbd7f672b9ca4ce0e50f15fea2a63bbbeeac751a88086a29e57319` |
| 결손 일러스트/durin-팔 결손 컷인.png | arm-cutin | `assets/illustrations3/injuries/durin/arm-cutin.webp` | 912×624 | `efb919d498d08fe2a6f63aef4b52710b6923370135bcf3532ee36454ad88400b` | `7cca3152863de8c095a7e12afbd0f6dd13d16a6c46b2b89f43880ba167992345` |
| 결손 일러스트/illuga-눈 결손 카드.png | eye-loss-card | `assets/illustrations3/injuries/illuga/eye-card.webp` | 416×608 | `079b458b2e0a441faf3726253e679ca9c21d24545c0ca50519c6509a69c53c9c` | `877f1f33fa1444a9caf0b0c798cc09ff4245dfcbb058acab6c2a47780b15eae9` |
| 결손 일러스트/illuga-눈 결손 컷인.png | eye-cutin | `assets/illustrations3/injuries/illuga/eye-cutin.webp` | 912×624 | `f7b53af12df08a9fe577cbd9de8dc826a51cfcfd9fd14588d3174ae41c0d52c9` | `58f24f50b5750aecab43aaf53a48976796ba9e1e319fdac81170de05bcf2bdea` |
| 결손 일러스트/illuga-다리 결손 컷인.png | leg-cutin | `assets/illustrations3/injuries/illuga/leg-cutin.webp` | 912×624 | `d1e38ef469cfe2464dcd3d3343992e1f89ae23a8e349a5bcbaa6a4d651b18914` | `5d0c05a03265cc2d46d397fb4756ea1a6c9d13337e94a94eb7d8941d9089d38f` |
| 결손 일러스트/illuga-팔 결손 컷인.png | arm-cutin | `assets/illustrations3/injuries/illuga/arm-cutin.webp` | 912×624 | `bcd52d7908ffa4facf7753c64727b6c21dbf1388582582afed20c33c0ba4d3aa` | `aacd4d84600a3c23bc0cfd201b4a037ebf89c46a2609d7591331678d97873806` |
| 결손 일러스트/jahoda-눈 결손 카드.png | eye-loss-card | `assets/illustrations3/injuries/jahoda/eye-card.webp` | 416×608 | `758a87ca42b2b0abe8ca5eb7d5415f5ededc3b2bd6b3818b9396f53bdcc2a20f` | `92a7dc53b023708c71e25286f862a6b1db91175c3330aea24a0ee228720e38d7` |
| 결손 일러스트/jahoda-눈 결손 컷인.png | eye-cutin | `assets/illustrations3/injuries/jahoda/eye-cutin.webp` | 912×624 | `e31ea9b2479779bcbebff402c75daf08f2366551d247b205ee4054e828f5d06e` | `94d6c288e88c758a4ddb1e1184b7889b62a64c5afd347b71fcf61a9dc8022946` |
| 결손 일러스트/jahoda-다리 결손 컷인.png | leg-cutin | `assets/illustrations3/injuries/jahoda/leg-cutin.webp` | 912×624 | `440d26edc9ce63a6a83e4a3272021faee35f1ee54039442ad0b05f4f1a0a7d5c` | `46088a93ac2f03ff7435e3832b14e5b90c7363a781462a109cd6f3ecb8460317` |
| 결손 일러스트/jahoda-팔 결손 컷인.png | arm-cutin | `assets/illustrations3/injuries/jahoda/arm-cutin.webp` | 912×624 | `916fd4b69b6fb8ac76c5c79f8b303aab9c4f3a548f0039de6dd32c13ce300fef` | `7f6cbfa7dd30f27624a740417bd95029a83592224f87bb7ea2ff0406fc171b13` |
| 결손 일러스트/lohen-눈 결손 카드.png | eye-loss-card | `assets/illustrations3/injuries/lohen/eye-card.webp` | 416×608 | `a873c7b42332b6118c353981da05d32cbf9ec8f1737dbdbaed4c0800d2c6bc08` | `0f9b9bd546fdf4136a4a76a7025054e48129787b1fae223ad1d50c8acd99194c` |
| 결손 일러스트/lohen-눈 결손 컷인.png | eye-cutin | `assets/illustrations3/injuries/lohen/eye-cutin.webp` | 912×624 | `89818a21942188ac73f153f97b144c346b7df1f02bb1afddafc4baca38083370` | `b5901607572fe13ca83aa28db8410e8768a03986f60e3bf1ec2a85f5801f04f7` |
| 결손 일러스트/lohen-다리 결손 컷인.png | leg-cutin | `assets/illustrations3/injuries/lohen/leg-cutin.webp` | 912×624 | `cf5a6e33e94176d294771de1caeb04ae0f838ff1e25a49dafe1748ab1e900fb7` | `4fbdad8addf8189dff8b6659876c8af6e476e1a49da1522b657c80c5a10c433a` |
| 결손 일러스트/lohen-팔 결손 컷인.png | arm-cutin | `assets/illustrations3/injuries/lohen/arm-cutin.webp` | 912×624 | `6c73add9ffd1c3ae1add3269a66bdafbd89965245dfbc9bd11f2e6e421762468` | `1085ce580acc4476b4103766c9017a1d7051ec615c4d237276a6db06dc6901bb` |
| 스킬 초상화/albedo.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/albedo.webp` | 400×300 | `cb7509cfdba06d2ef55b7765395ba915fbf65ebb1cd000ba140d73f15a841590` | `0af49b4b1fbac343dbb976a22a1f54a2fa81e840040a81b1f201154f48f67ba8` |
| 스킬 초상화/durin.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/durin.webp` | 400×300 | `c03a78e846c07fdb9beb146dfe0431123cadd6d47624a5d868bceca99645163e` | `d02a44b208c270f3d45dd04760a58cfb9058fa83294ea2e375b180c2c4f06e42` |
| 스킬 초상화/flins.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/flins.webp` | 400×300 | `d8cbf9889f330965d6df846adab2df2da65280324b2afc0a7fc2d8933cd45254` | `f06d468677d5bcefb6cd6eb5b96e02051cadfe8bd727884c8fb5d1de43880ab6` |
| 스킬 초상화/illuga.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/illuga.webp` | 400×300 | `bf2c1fa3bc4b94e170c17ddf19d734ed3631352e3c763977ab55e6ef8e07857b` | `e659b4abc6d354eca251cc5b02fbab0f6a56ac5128963454d728594ce2626ac2` |
| 스킬 초상화/jahoda.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/jahoda.webp` | 400×300 | `7e572eb0fbd5c1f7cb6fe13ac70f253dc36c140cd36e83fbcce7b663add0adc6` | `b552bed20741e29bb3075be6265a6c19cb55786d75414cf1ae18937bac2e1a11` |
| 스킬 초상화/lohen.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/lohen.webp` | 400×300 | `e88340950c51efef93412341d2c69c6c46b9cc155c9693f7c0a6ed73867be396` | `8d04ff93c7faf9ab52fbf69421790e1c9a6af655bdfecfdf25ab31768d4231fc` |
| 스킬 초상화/nefer.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/nefer.webp` | 400×300 | `8eb8d80cd922d0c68dc31e8c2a8e0925e2096dec954302dcd8cc1ea5126fc716` | `048a8779094694d3bba70cc774996c1d6359e82a041b70dd22465b4bba0bd326` |
| 스킬 초상화/varka.png | skill-portrait-banner | `assets/illustrations3/skill-portraits/varka.webp` | 400×300 | `449dbfb0f65df81aaa92f8c698e615a9c4ca7af49e9d342f0661551715210f19` | `ad9ad9e606317ca1ffc75affa9291a06b64d6f6f56ca53ca3500679f4ab5c5f2` |
| 추가 인게임 리소스/durin-붕괴.png | collapse-battle-sd | `assets/illustrations3/battle-collapse/durin.webp` | 512×512 | `3094b240261d3fee278b03afb356b0d855195b0d8afa9e0386f88cb20ee5db25` | `24b8435fac18d47b0169c554ed8b29ed31c4ad446ac9985f4063ceb90d13e4f2` |
| 추가 인게임 리소스/illuga-붕괴.png | collapse-battle-sd | `assets/illustrations3/battle-collapse/illuga.webp` | 512×512 | `04780b9596a21278394959b9a1142408408982b9d077a1f0d7fbd0168db8ba36` | `1f6deabdd9621e8f38991d477dd4043de8deed4d0d43a8fc5c7dcf10d063a278` |
| 추가 인게임 리소스/jahoda-붕괴.png | collapse-battle-sd | `assets/illustrations3/battle-collapse/jahoda.webp` | 512×512 | `376da43e78ee478cd3d3ed875eed2f73cbfc8970f92456cba59038c99ac5b077` | `5d3461a8b283137954861e42699fec752fa245c9493bc86a4aa929075190248e` |
| 추가 인게임 리소스/lohen-붕괴.png | collapse-battle-sd | `assets/illustrations3/battle-collapse/lohen.webp` | 512×512 | `5ced6ba958e504904422fbb3df84be22c3c24649d1215e09d015a9d4d8a3e8e6` | `c960af210d66391f45d20a32613ee075849b76163499e4f01c3e2c32cc4994e1` |
| 초상화/durin-붕괴.png | collapse-face-portrait | `assets/illustrations3/portraits/durin-collapse.webp` | 300×300 | `bdc54ce931747bfc87ad5c28917fa0a5ecec42025802922ec8e708c3ed16813f` | `46552dcdef209bd906832b8be8db12a5ffaadfa8d44de2d06730136015fb27a6` |
| 초상화/durin.png | normal-face-portrait | `assets/illustrations3/portraits/durin.webp` | 300×300 | `4739caf51d2b9341caf23b105839fe52c3c551771ce009660358a891005f015c` | `123117e09e4b0105ff43fbb10de223f5dbed502754cbfd49dc066733347b0b9a` |
| 초상화/illuga-붕괴.png | collapse-face-portrait | `assets/illustrations3/portraits/illuga-collapse.webp` | 300×300 | `1b7fc2e660ae684433e092f342fdb1230165e2087d0bce3cd86788d6878717cc` | `e6aad595d8b604588ba2fc15fa667a45c5991448770c5792b4eecf83d7e7bf30` |
| 초상화/illuga.png | normal-face-portrait | `assets/illustrations3/portraits/illuga.webp` | 300×300 | `203dd9264ec78ca7bc1697ab57e8947e43cad66649272cdcc63f06a303ce61fa` | `f580ac237362594d9a2dcf02d12dc5613b3932eaafd573cb98538a62f85d9b56` |
| 초상화/jahoda-붕괴.png | collapse-face-portrait | `assets/illustrations3/portraits/jahoda-collapse.webp` | 300×300 | `cfb9e14fb133cce4a7184d19ac78390608bfabf8b190e7bed1611027ddc92524` | `28a741ffe97e47785de4458755d7a561b0eef8187c2c7a132b44ae82a167e160` |
| 초상화/jahoda.png | normal-face-portrait | `assets/illustrations3/portraits/jahoda.webp` | 300×300 | `3d2cebd2a285c8ee1f99f9576b6d3bdd20c8f595c44753d323699c2238ec4b6e` | `06b6c6f0f8321ea0bdeff1c0019c35f8ff52f2c5857048821ee42ab797099443` |
| 초상화/lohen-붕괴.png | collapse-face-portrait | `assets/illustrations3/portraits/lohen-collapse.webp` | 300×300 | `cccc053c7f4198f31b32581f238d915bc99b300344f0716fe93498b194dfee85` | `2c2406d851b4b4526227639c1f43050266bd6bf7e23f8136cc6ecbd1ff055894` |
| 초상화/lohen.png | normal-face-portrait | `assets/illustrations3/portraits/lohen.webp` | 300×300 | `2bc8e588c70962882a11533e2bbad345a84efd54aa12d7f88440f0a4eb0357fa` | `58e82b05a78350d0003a8cd2f1223d5aef94bfc5a32ac0094b96787d1e39fa38` |
| 거점 편성.png | base-party-scene | `assets/illustrations3/scenes/party-base.webp` | 1440×816 | `56d638f5aa47fb3fdf6ff79d833a67855dc03112869bfed22f86e747d3438bdd` | `4edada90d86b720b496801995101e232592edebe3b6dedf8143026152b4ea873` |
| 튜토리얼 컷신1.png | tutorial-scene | `assets/illustrations3/scenes/tutorial-1.webp` | 1440×816 | `cc2d496648b007f31960b7232f0c61b04eddee5de13b870e6771ae44c33930dc` | `923a7ad33ea8ddf7cc1f5e190098f73329a791cd5c3b65efbc55e706d9ce0f77` |
| 튜토리얼 컷신2.png | tutorial-scene | `assets/illustrations3/scenes/tutorial-2.webp` | 1440×816 | `f2f1abcfb8e9566d7228655918964dba13f4e4ff05d6c7d7b5a577ac91591f29` | `3dedc0396811f73b390ba846cec4754d76b857f66e20e93cb019acfc183022b1` |
| main.png | title-main | `assets/illustrations3/title-main.webp` | 1920×1088 | `b3ada43399df0b9b6ff3b085f09db769e29748902504d81488cad85a39091afb` | `f59947189fb7b95d4ac6c36e0776f1e6419a5741c2fa93138f93fc25b1cafb66` |
| teyvat_defense_embers_logo.png | title-logo | `assets/illustrations3/title-logo.webp` | 1376×768 | `05c57540d2e3a9299936b46de51126e4b314c2a2a8d21b6fc441d83be9d81f9c` | `8e99a213ff1e640ddc12e6cc2be22ed98ed8980537514450b1d56911a7843012` |
