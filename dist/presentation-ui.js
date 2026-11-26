import {CARE_SCRIPT} from './story-scripts.js';
export const ICONS={
 raid:'M12 2 21 7v9l-9 6-9-6V7Zm0 4v12m-5-8 5 3 5-3',book:'M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3Zm9 2v16',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6',sword:'m6 17 12-14 3 0 0 3L7 18m-3-4 6 6m-7 1 4-4',event:'M12 2 22 12 12 22 2 12Zm0 5v6m0 3v1',home:'m2 11 10-9 10 9M5 9v13h14V9M9 22v-8h6v8',coin:'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-3 5h6m-3 0v10m-3 0h6',
 menu:'M4 6h16M4 12h16M4 18h16',people:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21v-3a7 7 0 0 1 14 0v3m1-16a3 3 0 0 1 0 6m1 4a5 5 0 0 1 4 5',cards:'m5 5 11-2 3 17-11 2ZM5 9H2v13h10',shop:'M3 8h18l-2-5H5Zm1 0v13h16V8M9 21v-7h6v7',heart:'M12 21 3 12C-3 4 7 0 12 6c5-6 15-2 9 6Z',fire:'M13 2c2 6-5 7-2 11 2 0 3-2 4-4 7 8 4 13-3 13C2 22 0 15 6 9c-1 6 4 8 3 3-1-4 4-7 4-10Z',left:'m15 3-9 9 9 9',right:'m9 3 9 9-9 9',map:'m2 5 7-3 6 3 7-3v17l-7 3-6-3-7 3Zm7-3v17m6-14v17',check:'m4 12 5 5L20 5'};
export function icon(name){return `<svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(ICONS[name]||ICONS.menu).split('~').map(d=>`<path d="${d}"/>`).join('')}</svg>`;}
export function recruitScript(size){return size===1?[
 ['바르카','그 종이, 계속 접었다 폈다 하는군. 지원 요청은 아직인가?'],
 ['로엔','사람이 늘면 지켜봐야 할 곳도 늘어. 혼자 움직이는 편이 빨라.'],
 ['바르카','등 뒤까지 네 창으로 막을 셈이냐. 네가 앞으로 나갈 수 있게, 뒤를 맡길 사람을 부르자는 거다.'],
 ['로엔','……알았어. 매는 내가 날릴게. 대신 발맞출 수 있는 사람으로.'],
]:[
 ['바르카','돌아오는 매의 날갯짓이 가볍군. 함께 싸워 보니 어때?'],
 ['로엔','쓸 만해. 그렇다고 아무나 더 부르자는 말은 하지 마.'],
 ['바르카','물론이지. 그러니 네가 골라. 서로의 빈틈을 메울 마지막 한 사람을.'],
 ['로엔','……이번 요청도 내가 쓸게. 여기서 멈출 생각은 없으니까.'],
];}
export const CARE_LINES=Object.fromEntries(Object.entries(CARE_SCRIPT).map(([id,lines])=>[id,lines.map(l=>[l.speaker,l.text])]));
export const SKILL_COPY={
 ultimate:{lohen:['서약의 일격','적 하나에게 피해 34 · 장막 추가 압박 10'],durin:['흑염의 비상','적 전체에게 피해 22'],illuga:['꺼지지 않는 수호','공용 보호막 25 · 방어 성공 시 추가 타격 12'],jahoda:['틈을 여는 손길','행동력 2 회복 · 카드 2장 드로우']},
 support:{lohen:['새벽 바람의 검','적 전체에게 피해 16 · 적이 하나뿐이면 피해 24, 장막 압박 6'],durin:['백악의 보호','공용 보호막 13 · 행동력 1 회복'],illuga:['밤을 가르는 일격','적 하나에게 피해 20 · 일루가의 다음 공격 +7'],jahoda:['드러난 약점','적 하나에게 피해 17 · 받는 피해 증가 2턴']},
};
export function glassFracture(){return `<svg class="glass-fracture" viewBox="0 0 1000 700" preserveAspectRatio="none" aria-hidden="true"><g class="glass-lines" fill="none" stroke="currentColor"><path d="m590 290-105-105-30-185m135 290 95-153L755 0M590 290l170 20 240-120M590 290l120 140 90 270M590 290 470 455 440 700M590 290 320 310 0 400m590-110-130-40-90-110-170-45M320 310l-30 140-210 50m630-70 110-45 180 110m-315-358 140 38 100-80m-355 360-90 35-70 180"/><path d="m485 185 60 5 45 100-100 25-20 140m120-165 92-11 78 31-50 120"/></g><g class="glass-shards" fill="#b8d7ed0d" stroke="#c9def333"><path style="--gx:-24px;--gy:-16px" d="M590 290 485 185 455 0 755 0 685 137Z"/><path style="--gx:35px;--gy:-8px" d="M590 290 685 137 755 0 1000 0 1000 190 760 310Z"/><path style="--gx:28px;--gy:25px" d="M590 290 760 310 1000 190 1000 700 800 700 710 430Z"/><path style="--gx:-18px;--gy:25px" d="M590 290 710 430 800 700 440 700 470 455Z"/><path style="--gx:-30px;--gy:10px" d="M590 290 470 455 440 700 0 700 0 400 320 310Z"/></g></svg>`;}
