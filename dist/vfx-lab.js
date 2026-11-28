// 이펙트 시험장 (vfx-lab.html). 게임과 같은 SuppliedVFX·심판 연출을 가짜 전장 위에서 골라 재생한다.
import {SuppliedVFX} from './supplied-vfx.js';
import {judgmentScene,verdictSpark,combineFlash,BEATS} from './judgment-vfx.js';
import {castArt,castPose,spriteFrame,CAST_SPRITES} from './cast-art.js';
import {HEROES} from './engine.js';
import {V2_CARDS} from './cards-v2.js';
import {AJAW_CRUSH_ART,AJAW_ART} from './cast36.js';

const $=s=>document.querySelector(s),game=$('#game'),ally=$('#ally img'),enemy=$('#enemy img'),hud=$('#hud');
const opt={short:false,calm:false,loop:false};
const vfx=new SuppliedVFX({short:()=>opt.short,glow:()=>.85});
const CAST=['lohen','illuga','jahoda','durin','kinich','lyney','cyno'];
const name=id=>HEROES[id]?.name||id;

// 이펙트 목록: [제목, 설명, 실행 함수(→ 끝나면 풀리는 Promise), 이 이펙트에서 왼쪽에 세울 전투원]
const hit=(kind,o={},on='enemy')=>()=>vfx.play(kind,on==='enemy'?enemy:on==='ally'?ally:game,{from:ally,...o});
const atk=(hero,card,label,extra={})=>[label,cardName(card)+(extra.desc||''),posed(hit('spear',{hero,card,...extra.o})),null,'attack'];
const cardName=k=>{const c=Object.values(V2_CARDS).find(c=>c.key===k);return c?`카드 「${c.name}」`:'';};
// 일루가 보호막: 게임과 같은 순서 (일루가 몸에서 빛 → 금빛 새 → 금빛 보호막)
const illugaShield=card=>async()=>{const v=vfx.play('illuga-light',ally,{hero:'illuga'});void vfx.play('illuga-bird',enemy2,{from:ally,hero:'illuga'});await new Promise(r=>setTimeout(r,240));return Promise.all([v,vfx.play('guard',ally,{hero:'illuga',shield:true,card})]);};
const groups=[];
const CARDS={
 lohen:[['창 찌르기 (근거리)','l_strike'],['얼음 화살 (원거리)','l_pierce'],['단검 베기 (근거리)','l_breach']],
 illuga:[['등불 휘두르기','i_strike'],['빛의 응수 · 초승달','i_riposte']],
 jahoda:[['기습 · 연속 발차기','j_strike'],['독 묻은 다트 (원거리)','j_dart']],
 durin:[['용의 발톱','d_strike'],['흑염의 날개 (전체)','d_wave'],['잿빛 소나기 (전체)','d_cinder'],['낙성의 불길 (전체)','d_comet'],['타다 남은 불티 (전체)','d_resonance']],
 kinich:[['추적 사격 (픽셀 탄)','k_shot'],['고리 선회','k_loop'],['정글 질주','k_dash'],['비늘 포격 (분쇄)','k_cannon'],['맹렬한 주먹 (분쇄)','k_fist']],
 lyney:[['소품 화살','y_arrow'],['지팡이 묘기','y_cane'],['대마술 · 불꽃 쇼','y_show'],['커튼콜','y_curtain']],
 cyno:[['창 찌르기','c_thrust'],['검은 발톱 · 휘두르기','c_claw']],
};
const PARTNERS={lohen:[],illuga:[['플린스','flins']],jahoda:[['네페르','nefer']],durin:[],kinich:[['말라니','mualani'],['카치나','kachina']],lyney:[['리넷','lynette']],cyno:[['타이나리','tighnari']]};
for(const id of CAST){const items=[];
 for(const [label,card] of CARDS[id])items.push(atk(id,card,label));
 items.push(['필살기',`${name(id)} 필살기`+(id==='jahoda'?' (몸에 두르는 분홍-청록 기운)':id==='kinich'?' = 모드 전환 (분쇄 아쥬)':''),id==='jahoda'?hit('jahoda-aura',{hero:id},'ally'):id==='kinich'?()=>kinichMode():posed(hit('spear',{hero:id,ultimate:true}))]);
 if(id==='illuga'){items.push(['보호막 · 등불 밝히기','빛은 일루가에게만 → 금빛 새 → 금빛 보호막',illugaShield('i_guard')],['보호막 · 꺼지지 않는 등대','더 큰 금빛 막과 빛줄기',illugaShield('i_watch')],['보호막 · 되비추는 빛','막 위를 도는 거울 조각',()=>vfx.play('guard',ally,{hero:'illuga',shield:true,card:'i_counter'})]);}
 else items.push(['보호막',`${name(id)} 보호막`,hit('guard',{hero:id,shield:true},'ally')]);
 if(id==='jahoda')items.push(['버프 · 태엽 감기','행동력 +1: 발밑 톱니',hit('rally',{hero:id,card:'j_wind'},'ally')],['버프 · 행동 지원','행동력 +2: 두 겹 톱니 + 물결',hit('rally',{hero:id,card:'j_energy'},'ally')],['버프 · 예비 동력','다음 턴 행동력: 떠오르는 고리',hit('focus',{hero:id,card:'j_reserve'},'ally')],['버프 · 재정비','뽑고 버리기: 카드 소용돌이',hit('focus',{hero:id,card:'j_draw'},'ally')]);
 for(const [pn,pid] of PARTNERS[id])items.push([`파트너 · ${pn}`,`${pn}의 지원`,hit('partner',{hero:id,partner:pid})]);
 if(id==='cyno')items.push(
  ['심판',`결합 카드 「심판」 (눈 → 번개, ${BEATS.end}초)`,()=>judgmentScene({target:enemy,short:opt.short,calm:opt.calm}).done,'judgment'],
  ['죄 발동','손에 있는 「죄」가 저절로 발동',()=>verdictSpark(enemy,{part:'sin',short:opt.short})],
  ['명계 발동','손에 있는 「명계」가 저절로 발동',()=>verdictSpark(enemy,{part:'dark',short:opt.short})],
  ['결합 별빛','작은 빛 0.3초 → 큰 빛',()=>{const r=game.querySelector('.cards').getBoundingClientRect();return combineFlash(r.left+r.width/2,r.top+r.height*.4,{short:opt.short});}]);
 groups.push({title:name(id),icon:castArt(id,'portrait'),hero:id,items});}
groups.push({title:'적',hero:'lohen',items:[
 ['심연 타격','심연 적이 아군을 침',hit('abyss-hit',{},'ally')],['천공 타격','천공 적이 아군을 침',hit('celestial-hit',{},'ally')],
 ['심연 충전','심연 적의 큰 공격 준비',hit('abyss-charge')],['천공 충전','천공 적의 큰 공격 준비',hit('celestial-charge')],
 ['적 보호막','심연 적 보호막',hit('guard',{shield:true,enemy:true})],['막기','보호막이 공격을 막음',hit('guard-hit',{},'ally')],
 ['소멸','적이 쓰러져 재가 됨',hit('dissolve')]]});
groups.push({title:'공용',hero:'illuga',items:[
 ['격려·집중','버프 반짝임',hit('focus',{},'ally')],['회복','회복 반짝임',hit('recover',{},'ally')],['생명의 불꽃','거점 회복: 몸 둘레를 맴도는 불빛',hit('flame-heal',{},'ally')],
 ['바람 가르기','바르카 지원',hit('wind-cleave')],
 ['클리어','전투 승리 (게임처럼 0.65배)',()=>vfx.play('victory',game,{scale:.65})],
 ['시간 되감기','원본 묶음 이펙트 (손대지 않음)',hit('time-rewind',{},'ally')]]});
// 키니치 모드 전환: 픽셀 조각 + 분쇄 아쥬가 뒤에 뜬다
let crushImg=null;
async function kinichMode(){const on=!crushImg;if(crushImg){crushImg.remove();crushImg=null;}else{crushImg=document.createElement('img');crushImg.src=AJAW_CRUSH_ART;crushImg.className='lab-ajaw';$('#ally').prepend(crushImg);}return vfx.play('kinich-mode',ally,{hero:'kinich',mode:on?'crush':'chase'});}
// ---------- 목록 그리기 ----------
let current=null,token=0;
const list=$('#list');
groups.forEach((g,gi)=>{const d=document.createElement('details');if(gi===CAST.length-1)d.open=true;d.innerHTML=`<summary>${g.icon?`<img src="${g.icon}" alt="">`:''}${g.title}</summary>`;
 g.items.forEach(([label,desc,run,mode])=>{const b=document.createElement('button');b.className='fx';b.innerHTML=`${label}<small>${desc}</small>`;b.onclick=()=>select({label,desc,run,mode,hero:g.hero,group:g.title},b);d.append(b);});list.append(d);});

function select(item,btn){document.querySelectorAll('.fx.on').forEach(n=>n.classList.remove('on'));btn.classList.add('on');current=item;setAlly(item.hero);$('#scrub').classList.toggle('show',item.mode==='judgment');play();}
// v0.39: 게임과 같은 크기·발 위치로 세운다 (정사각형 그림 한 변 = 146px × 배율, 발이 자리 가운데).
let allyId='cyno';
function placeAlly(id,pose='idle'){const f=spriteFrame(id,pose);ally.src=pose==='idle'?castArt(id,'battle'):castPose(id,pose);ally.style.height=`calc(146px*${f.scale}*var(--scale))`;ally.style.translate=`calc((.5 - ${f.foot})*146px*${f.scale}*var(--scale)) 0`;}
function setAlly(id){allyId=id;placeAlly(id);$('#ally span').textContent=name(id);if(id!=='kinich'&&crushImg){crushImg.remove();crushImg=null;}}
// 공격·필살기는 게임처럼 잠깐 공격 포즈로 바꾼다
function posed(run,pose){return async()=>{const P=CAST_SPRITES[allyId]?.poses||{};const p=P[pose]?pose:P.attack1?'attack1':null;if(p)placeAlly(allyId,p);try{return await run();}finally{setTimeout(()=>placeAlly(allyId),420);}};}
function clearAll(){vfx.clear();document.querySelectorAll('.judgment-vfx').forEach(n=>n.remove());}
async function play(){if(!current)return;const my=++token;clearAll();const t0=performance.now();hud.innerHTML=`<b>${current.group} · ${current.label}</b> — ${current.desc}`;
 try{await current.run();}catch(e){hud.textContent='오류: '+e.message;console.error(e);return;}
 if(my!==token)return;const ms=Math.round(performance.now()-t0);hud.innerHTML=`<b>${current.group} · ${current.label}</b> — ${current.desc} · 게임이 다음 동작으로 넘어가는 시점 ${ms}ms`;
 if(opt.loop&&my===token)setTimeout(()=>{if(my===token)play();},1400);}

// ---------- 조작 ----------
const pick=(sel,fn)=>document.querySelectorAll(sel+' button').forEach(b=>b.onclick=()=>{document.querySelectorAll(sel+' button').forEach(n=>n.classList.toggle('on',n===b));fn(b);});
pick('#speeds',b=>window.__lab.setScale(+b.dataset.s));
pick('#bgs',b=>{const v=b.dataset.bg;game.style.background=v.startsWith('#')?v:`#1a1428 url(${v}) center/cover no-repeat`;game.querySelector('.shade').style.display=v.startsWith('#')?'none':'';});
pick('#sizes',b=>{const m=b.dataset.size==='mobile';game.classList.toggle('mobile',m);game.style.setProperty('--scale',m?'.66':'1');});
$('#step').onclick=()=>{if(window.__lab.scale!==0){window.__lab.setScale(0);document.querySelectorAll('#speeds button').forEach(n=>n.classList.toggle('on',n.dataset.s==='0'));}window.__lab.step(1000/24);};
$('#again').onclick=play;
$('#loop').onclick=e=>{opt.loop=!opt.loop;e.target.textContent=opt.loop?'반복 켬':'반복 끔';e.target.classList.toggle('on',opt.loop);if(opt.loop)play();};
$('#short').onchange=e=>{opt.short=e.target.checked;};
$('#calm').onchange=e=>{opt.calm=e.target.checked;};
// 심판 장면 고정
$('#T').oninput=e=>{const T=+e.target.value;$('#Tv').textContent=T.toFixed(2)+'초';token++;clearAll();judgmentScene({target:enemy,calm:opt.calm}).still(T);hud.innerHTML=`<b>심판</b> — ${T.toFixed(2)}초 장면`;};
addEventListener('resize',()=>{if(current?.mode==='judgment'&&!opt.loop)return;});
setAlly('cyno');document.querySelector('#bgs button.on').click();
// 주소에 #이펙트이름 을 붙이면 바로 재생 (예: vfx-lab.html#사이노/심판)
const want=decodeURIComponent(location.hash.slice(1));if(want){const [g,l]=want.split('/');const btn=[...document.querySelectorAll('details')].find(d=>d.querySelector('summary').textContent.trim()===g)?.querySelectorAll('.fx');const i=groups.find(x=>x.title===g)?.items.findIndex(x=>x[0]===l);if(btn&&i>=0)btn[i].click();}
