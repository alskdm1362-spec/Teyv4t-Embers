// 이펙트 시험장 (vfx-lab.html). 게임과 같은 SuppliedVFX·심판 연출을 가짜 전장 위에서 골라 재생한다.
import {SuppliedVFX} from './supplied-vfx.js';
import {judgmentScene,verdictSpark,combineFlash,BEATS} from './judgment-vfx.js';
import {castArt} from './cast-art.js';
import {HEROES} from './engine.js';

const $=s=>document.querySelector(s),game=$('#game'),ally=$('#ally img'),enemy=$('#enemy img'),hud=$('#hud');
const opt={short:false,calm:false,loop:false};
const vfx=new SuppliedVFX({short:()=>opt.short,glow:()=>.85});
const CAST=['lohen','illuga','jahoda','durin','kinich','lyney','cyno'];
const name=id=>HEROES[id]?.name||id;

// 이펙트 목록: [제목, 설명, 실행 함수(→ 끝나면 풀리는 Promise), 이 이펙트에서 왼쪽에 세울 전투원]
const hit=(kind,o={},on='enemy')=>()=>vfx.play(kind,on==='enemy'?enemy:on==='ally'?ally:game,{from:ally,...o});
const groups=[];
for(const id of CAST){const items=[
  ['공격',`${name(id)} 기본 공격`,hit('spear',{hero:id})],
  ['필살기',`${name(id)} 필살기 타격`,hit('spear',{hero:id,ultimate:true})],
  ['보호막',`${name(id)} 보호막`,hit('guard',{hero:id,shield:true},'ally')],
 ];
 if(id==='cyno')items.push(
  ['심판',`결합 카드 「심판」 (원소폭발풍, ${BEATS.end}초)`,()=>judgmentScene({target:enemy,short:opt.short,calm:opt.calm}).done,'judgment'],
  ['죄 발동','손에 있는 「죄」가 저절로 발동',()=>verdictSpark(enemy,{part:'sin',short:opt.short})],
  ['명계 발동','손에 있는 「명계」가 저절로 발동',()=>verdictSpark(enemy,{part:'dark',short:opt.short})],
  ['결합 별빛','죄·명계·의식이 「심판」으로 합쳐지는 순간',()=>{const r=game.querySelector('.cards').getBoundingClientRect();return combineFlash(r.left+r.width/2,r.top+r.height*.4,{short:opt.short});}]);
 groups.push({title:name(id),icon:castArt(id,'portrait'),hero:id,items});}
groups.push({title:'적',hero:'lohen',items:[
 ['심연 타격','심연 적이 아군을 침',hit('abyss-hit',{},'ally')],['천공 타격','천공 적이 아군을 침',hit('celestial-hit',{},'ally')],
 ['심연 충전','심연 적의 큰 공격 준비',hit('abyss-charge')],['천공 충전','천공 적의 큰 공격 준비',hit('celestial-charge')],
 ['적 보호막','심연 적 보호막',hit('guard',{shield:true,enemy:true})],['막기','보호막이 공격을 막음',hit('guard-hit',{},'ally')],
 ['소멸','적이 쓰러져 재가 됨',hit('dissolve')]]});
groups.push({title:'공용',hero:'illuga',items:[
 ['격려·집중','버프 반짝임',hit('focus',{},'ally')],['회복','회복 반짝임',hit('recover',{},'ally')],['생명의 불꽃','치유',hit('flame-heal',{},'ally')],
 ['바람 가르기','파트너 지원 (바람)',hit('wind-cleave')],['밤의 찌르기','파트너 지원 (번개)',hit('night-thrust')],['독 표식','파트너 지원 (독)',hit('venom-mark')],
 ['클리어','전투 승리 (게임처럼 0.65배)',()=>vfx.play('victory',game,{scale:.65})],
 ['시간 되감기','원본 묶음 이펙트 (손대지 않음)',hit('time-rewind',{},'ally')]]});

// ---------- 목록 그리기 ----------
let current=null,token=0;
const list=$('#list');
groups.forEach((g,gi)=>{const d=document.createElement('details');if(gi===CAST.length-1)d.open=true;d.innerHTML=`<summary>${g.icon?`<img src="${g.icon}" alt="">`:''}${g.title}</summary>`;
 g.items.forEach(([label,desc,run,mode])=>{const b=document.createElement('button');b.className='fx';b.innerHTML=`${label}<small>${desc}</small>`;b.onclick=()=>select({label,desc,run,mode,hero:g.hero,group:g.title},b);d.append(b);});list.append(d);});

function select(item,btn){document.querySelectorAll('.fx.on').forEach(n=>n.classList.remove('on'));btn.classList.add('on');current=item;setAlly(item.hero);$('#scrub').classList.toggle('show',item.mode==='judgment');play();}
function setAlly(id){ally.src=castArt(id,'battle');$('#ally span').textContent=name(id);}
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
