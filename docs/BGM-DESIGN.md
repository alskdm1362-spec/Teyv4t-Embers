# 제공 BGM 5곡 적용 · 0.6


`dist/assets/audio/bgm/manifest.json`에 원본 이름, 배포 경로, 바이트 수, SHA-256, 길이, 스트림 정보, 계측치를 보존한다. 복사본은 각각 원본과 전체 바이트 및 SHA-256이 일치한다. 총 21,469,540 bytes. 모든 음악 스트림은 MP3 / 48kHz / stereo이며 원본에 포함된 커버 이미지 스트림도 그대로 남아 있다.

## 배포 파일과 측정치

| 원본 | 논리 ID / 배포 파일 | 길이 | 통합 음량 LUFS | 추정 true peak dBTP | LRA LU |
|---|---|---:|---:|---:|---:|
| main.mp3 | main / main.mp3 | 192.000초 | -16.04 | -4.16 | 8.1 |
| stageA.mp3 | stage-a / stage-a.mp3 | 182.832초 | -15.09 | -4.44 | 3.5 |
| stageB.mp3 | stage-b / stage-b.mp3 | 166.992초 | -13.66 | -3.14 | 7.7 |
| Boss.mp3 | boss / boss.mp3 | 161.952초 | -15.02 | -3.66 | 4.1 |
| Boss2.mp3 | boss-final / boss-final.mp3 | 208.824초 | -14.67 | -3.75 | 3.8 |

FFprobe로 컨테이너·스트림·길이를 확인하고, FFmpeg `loudnorm`의 입력 계측값(input_i, input_tp, input_lra)을 수집했다. 오디오 출력은 버리고 원본 파일은 변경하지 않았다. 통합 음량의 최대 차이는 2.38 LU다. 이 수치만으로 큰 음량 불균형이나 청감 품질을 단정하지 않는다. 최대 true peak 계측치는 -3.14dBTP이며, 곡별로 별도의 보정 게인을 임의 적용하지 않았다. BGM/SFX 실제 혼합은 SoundBank의 버스와 사용자 설정에서 조율한다.

## 씬별 선택

`sceneMusic(state)`는 다음 우선순위를 사용한다. 게임 진행 상태를 읽기만 하며 저장이나 전투 규칙을 바꾸지 않는다.

| 조건 | 곡 |
|---|---|
| title / base / camp / ending | main |
| challenge 모드, challengeStage 0 또는 1 | boss |
| challenge 모드, challengeStage 2 이상 | boss-final |
| farm 모드 | stage-a |
| route의 정예·보스 전투 또는 해당 전멸 화면 | boss |
| 나머지 route, node 6 이상 | stage-b |
| 나머지 route 초반 | stage-a |

현재 경로의 node 6은 연결 장막 정예 전투다. 따라서 전투 및 전멸에는 boss, 전투 뒤 보상/탐사 화면에는 stage-b가 적용된다. 향후 명시적인 `encounterType: 'elite'|'boss'`가 있으면 해당 전투에도 boss를 선택한다. 타이틀·거점·야영·엔딩은 오래된 mode 값보다 phase를 우선한다.

## MusicDirector 계약

```js
import {MusicDirector,sceneMusic,MUSIC_TRACKS} from './music.js';
const director=new MusicDirector(existingAudio,{
  setMixGain:(value,seconds)=>sounds.setMusicMixGain(value,seconds),
  onTrackChange:(id,track)=>{ document.body.dataset.music=id; },
  onError:(error,detail)=>{ /* detail.track / detail.phase */ },
});
// 최초 화면 및 씬 변경 시
void director.setScene(state);
// master/music 설정 변경 시. 실제 음량은 SoundBank 버스가 제어한다.
void director.setEnabled(prefs.volume>0 && prefs.music>0);
// 사용자 제스처 핸들러에서, 앞에 await를 넣지 않고 호출한다.
void sounds.unlock();
void director.unlock();
// 앱을 폐기할 때
// director.destroy();
```

- 하나의 기존 HTMLAudioElement만 사용한다. `createMediaElementSource`를 다시 만들지 않는다.
- `audio.volume=1`, `loop=true`이며 자동 재생은 하지 않는다. 실제 재생은 최초 사용자 제스처의 `unlock()` 뒤에만 허용한다.
- `unlock()`은 내부 await 전에 `audio.play()`를 동기 호출하므로 AudioContext.resume()와 병렬로 호출해도 사용자 제스처 권한을 유지한다.
- 바뀐 곡은 기본 200ms 페이드아웃 후 source를 교체하고, 새 곡 재생이 시작되면 220ms 페이드인한다. 모든 게인 자동화는 `setMixGain(value,seconds)` 콜백으로만 전달한다.
- setMixGain은 SoundBank의 전용 transitionGain 버스에 연결해야 한다. 사용자 musicGain 및 duck 버스를 덮어쓰면 안 된다.
- 같은 곡에 대한 render/씬 갱신은 source나 currentTime을 다시 설정하지 않는다.
- 빠른 씬 변경은 이전 대기와 토큰을 취소하고 마지막 곡만 적용한다. 오래된 play Promise의 완료가 새 곡을 pause하거나 source를 덮어쓰지 않는다.
- 음소거 상태의 씬 변경은 source 선택만 하고 재생하지 않는다. 다시 켜면 선택된 곡을 재생한다.
- visibility hidden에서 음악을 pause하고, visible 시 이전에 unlock됐고 enabled인 경우에만 재개한다. 같은 곡이면 currentTime을 보존한다.
- `destroy()`는 대기를 모두 종료하고 음원을 멈추며 이벤트 리스너를 제거한다. MediaElementSource 소유권은 SoundBank에 남긴다.
- SoundBank는 AudioContext/버스의 준비·복귀를 담당하고 실제 music.play/pause 및 BGM visibility 처리는 MusicDirector에 맡긴다.

## 확인 범위

`tests/music.test.mjs`에서 씬 선택, 최초 제스처 이전 무재생, unlock의 동기 play 호출, 같은 곡 재생 위치 유지, 빠른 전환 취소, 기존 곡으로 전환 취소, 음소거 중 씬 이동, 탭 복귀, 오래된 play Promise 경합, 실제 배포 파일 해시를 검증했다.

원본 길이·디코딩·통합 음량·피크는 도구로 계측했지만, 헤드폰이나 스피커로 5곡을 직접 청취하지는 않았다. 브라우저 통합 후 실제 청취로 페이드, 루프 연결, BGM/SFX 균형을 확인해야 한다. 원본에 루프 마커가 없으므로 HTMLAudioElement의 전체 곡 반복을 사용하며 샘플 단위의 무봉제 반복을 보장하지 않는다.


## 앱 통합과 실제 브라우저 확인 (2026-11-22)

app.js에서 단일 scene-music 요소와 MusicDirector를 연결했다. SoundBank의 기존 musicGain/duck 버스를 유지하고 별도 transitionGain으로 곡 전환 페이드만 제어한다. 최초 제스처에서 AudioContext 준비와 음악 unlock을 동기 시작한다.

main/stage-a/stage-b/boss/boss-final의 장면별 src 교체와 재생 상태, 오류 없음, loop=true를 확인했다. main과 stage-a 및 boss의 실제 currentTime 증가를 관찰했고, 거점에서 같은 곡을 사용하는 강화 행동 후 재생 위치가 유지되는 것을 확인했다. 음악 슬라이더 Home에서 paused=true, End에서 같은 곡 재개, HTMLAudioElement 한 개 유지도 확인했다. stage-b의 곡 끝 전체 재생, 실제 탭 숨김 전환, 물리 출력 청취는 브라우저 통합 검증에 포함하지 않는다(탭 숨김 규칙은 단위검사).
