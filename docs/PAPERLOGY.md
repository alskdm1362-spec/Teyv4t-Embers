# Paperlogy 웹폰트 출처·라이선스·파일 매핑

확인일: 2026-11-22. 이 작업은 공식 폰트 파일·라이선스·출처 문서 추가만 수행했다. 앱/CSS 적용, Git 커밋, 배포는 하지 않았다.

## 공식 출처 확인

- [제작자 공식 소개·배포 페이지](https://freesentation.blog/paperlogyfont)
- [공식 GitHub 저장소 Freesentation/paperlogy](https://github.com/Freesentation/paperlogy)
- [공식 웹폰트 CSS](https://github.com/Freesentation/paperlogy/blob/8ef35f53b318c7ca914c52b1b382b9a8bad07a61/Paperlogy.css)
- [공식 라이선스 전문](https://github.com/Freesentation/paperlogy/blob/8ef35f53b318c7ca914c52b1b382b9a8bad07a61/OFL%20license.txt)

제작자 사이트의 다운로드 링크가 Freesentation/paperlogy 저장소를 가리키는 것을 확인했다. 저장소의 공식 `woff2/` 파일과 `Paperlogy.css`를 기준으로 필요한 3개 굵기를 가져왔다. 제3자 변환본/CDN 복사본은 사용하지 않았다.

고정 출처 커밋: `8ef35f53b318c7ca914c52b1b382b9a8bad07a61`. 배포 폰트는 원본 WOFF2 그대로이며 이름·내부 테이블·글리프를 수정하거나 서브셋을 새로 만들지 않았다.

## 파일과 CSS 굵기

| 표시 굵기 | CSS weight | 런타임 경로 | 바이트 | SHA256 |
|---|---:|---|---:|---|
| Regular | 400 | `assets/fonts/Paperlogy-4Regular.woff2` | 438,072 | `4b2e0fda1132919826d68682f13868f217cc26fafc073c390cfc06ab9073b7ed` |
| Medium | 500 | `assets/fonts/Paperlogy-5Medium.woff2` | 439,492 | `83f2ba8b73f385f0732ec7326b3a031b6aa326cbd37fa41a2558dbbe121281b3` |
| Bold | 700 | `assets/fonts/Paperlogy-7Bold.woff2` | 440,468 | `39daa190bc0ccaa7dfe8bb55716953fc56acdad812da6701a6e31a4a051173af` |

- 권장 CSS family: `Paperlogy`; style: `normal`; format: `woff2`.
- 공식 CSS는 Regular=400, Medium=500, Bold=700을 선언한다. Fontconfig의 내부 weight 80/100/200은 다른 척도이므로 CSS에 그대로 쓰지 않는다.
- 세 폰트 합계: 1,318,032 bytes (1.26 MiB).
- 원본 파일 이름을 유지했다. 기존 `SUIT-Variable.woff2` 및 기존 `OFL.txt`는 수정하지 않았다.
- 자체 호스팅 파일을 사용하므로 공식 CSS 안의 외부 CDN 주소를 앱에 추가할 필요가 없다.

## 라이선스 기록

- 라이선스: **SIL Open Font License 1.1 (OFL-1.1)**.
- 공식 저작권 고지: `Copyright 2024 The PAPERLOGY Authors (https://freesentation.blog/paperlogy)`.
- 공식 원문 전체를 `dist/assets/fonts/Paperlogy-OFL.txt`로 동봉했다.
- OFL은 폰트의 사용·임베딩과 소프트웨어에 동봉한 재배포를 허용한다. 폰트만 단독으로 판매할 수 없으며 폰트 배포 시 저작권 고지와 라이선스를 유지해야 한다.
- 폰트 자체에 적용되는 라이선스를 다른 라이선스로 대체하지 않는다. 폰트를 사용해 만든 게임 콘텐츠 전체를 OFL로 바꾸라는 조건은 아니다.
- 이 프로젝트에서는 공식 WOFF2를 수정 없이 동봉하므로 수정 폰트의 이름·글리프 변형을 수행하지 않았다. 라이선스 전문을 최종 기준으로 삼는다.

## 내려받은 파일 검증

1. 원본 파일의 WOFF2 시그니처 `wOF2` 확인.
2. GitHub Contents API가 제공한 파일 크기와 Git blob SHA1을 실제 다운로드 바이트와 대조해 일치 확인.
3. `fc-scan`으로 세 WOFF2를 열어 Paperlogy family와 각각의 굵기를 확인.
4. 주요 한국어 캐릭터·상태명 및 영문/숫자 샘플의 cmap 지원을 확인.
5. 현재 `dist/app.js`, `dist/engine.js`에서 발견한 모든 한글 음절에 대해 세 폰트의 누락이 없음을 확인. 이는 현재 소스 문자 검사이며 이후 추가 문자의 지원을 보장하지 않는다.
6. 실제 브라우저에서의 폰트 적용·줄바꿈·가독성 검증은 앱 통합 담당자가 진행한다. 본 작업에서 CSS 적용이나 화면 검증을 했다고 주장하지 않는다.

공식 소개는 한글 2,780자를 사용한 경량화와 별도의 일본어 포함 배포를 안내한다. 현재 추가한 파일은 공식 CSS의 `Paperlogy` 계열 3개이며 `PaperlogyJP` 파일을 임의로 섞지 않았다. 새 문자나 다른 언어가 추가될 때를 위해 기존 시스템/대체 폰트 fallback은 유지하는 것이 좋다.

## 추가 메타데이터

`dist/assets/fonts/Paperlogy-manifest.json`에 공식 URL, 고정 출처 커밋, Git blob SHA1, SHA256, byte size, family/weight 검사 결과, 샘플 문자 검사 결과를 기록했다.

이 문서는 폰트 자산 추가 범위의 출처 기록이며 게임의 전체 법률 검토나 별도 배포 조건을 추가하는 문서가 아니다.
