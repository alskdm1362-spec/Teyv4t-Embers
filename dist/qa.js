import {HEROES,PART_NAMES,hydrate,serialize} from './engine.js';
import {QA_SCENARIOS,qaFixture,qaApplyCondition} from './qa-fixtures.js';
import {feedbackEntry,feedbackDocument,importFeedback,mergeFeedback} from './qa-feedback.js';
import {faceArt36} from './cast36.js';
// v0.39 QA 화면 리디자인: 편성 칩 · 장면 목록(찾기) · 연출 미리보기(필요한 장면을 알아서 불러옴) · 탭(게임 / 이펙트 시험장 / 피드백)
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),STORE='teyvat-embers-qa-feedback-v1',DRAFT='teyvat-embers-qa-draft-v1',frame=$('#game-preview');
let gameState=null,context=null,entries=[],editId=null,gameBusy=false,afterLoad=null;
const status=text=>{$('#feedback-status').textContent=text;$('#feedback-status-2').textContent=text;};
function store(){try{localStorage.setItem(STORE,JSON.stringify(entries));}catch{status('피드백 자동 저장이 실패했습니다. JSON으로 내보내주세요.');}}
function draft(){return {title:$('#feedback-title').value,actual:$('#actual').value,expected:$('#expected').value,category:$('#category').value,priority:$('#priority').value,includeSave:$('#include-save').checked};}
function restoreDraft(d){if(!d)return;for(const [id,key] of [['feedback-title','title'],['actual','actual'],['expected','expected'],['category','category'],['priority','priority']])if(typeof d[key]==='string')$('#'+id).value=d[key];$('#include-save').checked=d.includeSave!==false;}
function saveDraft(){try{localStorage.setItem(DRAFT,JSON.stringify(draft()));}catch{status('작성 중인 내용은 JSON 내보내기로 보존해주세요.');}}
try{entries=importFeedback(JSON.stringify({schema:'teyvat-embers-feedback-v1',entries:JSON.parse(localStorage.getItem(STORE)||'[]')})).entries;restoreDraft(JSON.parse(localStorage.getItem(DRAFT)||'null'));}catch{status('이전에 작성한 기록을 읽지 못했습니다. JSON이 있다면 불러와 주세요.');}

// ---------- 1. 편성: 초상 칩, 누른 순서대로 셋 ----------
const CAST=Object.keys(HEROES);let picked=['lohen','durin','illuga'];
$('#scenario').innerHTML=Object.entries(QA_SCENARIOS).map(([id,name])=>`<option value="${id}">${name}</option>`).join('');
for(const id of ['hero','companion1','companion2'])$('#'+id).innerHTML=CAST.map(k=>`<option value="${k}">${HEROES[k].name}</option>`).join('');
function renderCast(){$('#cast-picker').innerHTML=CAST.map(id=>{const n=picked.indexOf(id);return `<button type="button" class="cast-chip ${n>=0?'on':''}" data-cast="${id}" style="--chip:${HEROES[id].color}" aria-pressed="${n>=0}" title="${n===0?'전투원 (연출 대상)':n>0?'동료 '+n:'고르기'}"><img src="${faceArt36(id)}" alt=""><span>${HEROES[id].name}</span><b>${n>=0?n+1:''}</b></button>`;}).join('');
 $('#hero').value=picked[0];$('#companion1').value=picked[1]||picked[0];$('#companion2').value=picked[2]||picked[0];}
$('#cast-picker').onclick=e=>{const b=e.target.closest('[data-cast]');if(!b)return;const id=b.dataset.cast,n=picked.indexOf(id);if(n>=0){if(picked.length>1)picked.splice(n,1);}else{if(picked.length>=3)picked.pop();picked.push(id);}renderCast();if(picked.length===3)status(`편성: ${picked.map(id=>HEROES[id].name).join(' · ')} — 장면을 고르면 이 편성으로 불러옵니다.`);};
renderCast();

// ---------- 2. 장면: 묶음 + 찾기 ----------
const SCENE_GROUPS=[['시작 · 튜토리얼',['title','prologue','prologueCity','tutorial','partner','tutorialBase','tutorialLobby','lobby','formation','formationFree']],['모집 · 합류',['recruitTalk1','recruit1','recruitTalk2','recruit2','arrival','joinDialogue']],['전투',['battle','elite','boss','special','awakening','collapse','collapseStep','eyesSerious','eyesLoss','defeat']],['거점 · 원정',['base','lateBase','camp','travel','care','injury','refine','equipment']],['보상 · 사건',['reward','loot','event','eventRemove','eventPremium','ending']]];
{const known=new Set(SCENE_GROUPS.flatMap(g=>g[1]));const rest=Object.keys(QA_SCENARIOS).filter(k=>!known.has(k));if(rest.length)SCENE_GROUPS.push(['기타',rest]);}
let lastScene='battle';
function renderScenes(){const q=$('#scene-search').value.trim();$('#scene-list').innerHTML=SCENE_GROUPS.map(([title,keys])=>{const items=keys.filter(k=>QA_SCENARIOS[k]&&(!q||QA_SCENARIOS[k].includes(q)||title.includes(q)||k.includes(q)));return items.length?`<div class="scene-group"><h3>${title}</h3><div>${items.map(k=>`<button type="button" class="chip ${k===lastScene?'on':''}" data-scene="${k}">${esc(QA_SCENARIOS[k])}</button>`).join('')}</div></div>`:'';}).join('')||'<p class="hint">맞는 장면이 없습니다.</p>';}
$('#scene-search').oninput=renderScenes;
function loadScene(k,then=null){lastScene=k;$('#scenario').value=k;renderScenes();afterLoad=then;try{send('load',{state:qaFixture(k,{hero:picked[0],pair:[picked[1]||picked[0],picked[2]||picked[0]],breakdown:$('#breakdown').value||'despair',failures:$('#failures').value})});status(`「${QA_SCENARIOS[k]}」 장면을 불러왔습니다.`);}catch(e){afterLoad=null;status(e.message);}}
$('#scene-list').onclick=e=>{const b=e.target.closest('[data-scene]');if(b)loadScene(b.dataset.scene);};
renderScenes();

// ---------- 4. 연출 미리보기: 필요한 장면이 아니면 먼저 불러온다 ----------
const PREVIEWS=[['컷인',[['ultimate','필살기'],['support','파트너 지원'],['breakdown','정신 붕괴'],['injury-eyes','눈 결손'],['injury-leftArm','팔 결손'],['injury-leftLeg','다리 결손'],['refine-cutin','전술 각성']]],
 ['창',[['personnel','전투원 · 파트너 열람'],['formation','편성'],['status','전투원 상태 창'],['insight','전술 각성 미리보기']]],
 ['전투 연출',[['dice','3D 주사위 · 17',null],['vfx-blind','실명 카드 연소','battle'],['vfx-enemy-shield','적 방어막 · 분홍 보라','battle'],['vfx-enemy-white','적 방어막 · 하양','battle']]],
 ['거점',[['care','정신 안정 대화','care'],['shop','키라라 상점','base'],['equipment','획득 장비 장착','equipment']]]];
const NEED={};$('#preview-kind').innerHTML=PREVIEWS.flatMap(([,items])=>items.map(([k,l,need])=>{if(need)NEED[k]=need;return `<option value="${k}">${l}</option>`;})).join('');
const ready=(k)=>{const need=NEED[k];if(!need||!gameState)return !need;if(need==='battle')return gameState.phase==='battle';if(need==='base')return ['base','camp'].includes(gameState.phase);if(need==='care')return gameState.phase==='base'&&!!gameState.heroes[picked[0]]?.breakdown;if(need==='equipment')return !!gameState.pendingEquip?.length;return true;};
function renderPreviews(){$('#preview-list').innerHTML=PREVIEWS.map(([title,items])=>`<div class="scene-group"><h3>${title}</h3><div>${items.map(([k,l])=>`<button type="button" class="chip ${NEED[k]&&!ready(k)?'need':''}" data-preview="${k}" title="${NEED[k]&&!ready(k)?'「'+QA_SCENARIOS[NEED[k]]+'」 장면을 먼저 불러온 뒤 엽니다':''}">${l}</button>`).join('')}</div></div>`).join('');}
function openPreview(k){$('#preview-kind').value=k;const go=()=>send('preview',{hero:picked[0],kind:k,hold:$('#hold-vfx').checked,collapseStage:$('#collapse-stage').value});if(ready(k))go();else{if(k==='care'&&!$('#breakdown').value)$('#breakdown').value='despair';loadScene(NEED[k],()=>setTimeout(go,350));}}
$('#preview-list').onclick=e=>{const b=e.target.closest('[data-preview]');if(b)openPreview(b.dataset.preview);};
renderPreviews();

function send(type,data={}){if(gameBusy){status('연출이 끝난 뒤 다시 눌러주세요.');return;}frame.contentWindow.postMessage({source:'embers-qa-controls',type,...data},location.origin);}
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.source!=='embers-game-qa')return;if(e.data.error){status(e.data.error);afterLoad=null;return;}if(!e.data.state)return;try{gameState=hydrate(e.data.state);for(const id of ['load-scenario','apply-condition','preview'])$('#'+id).disabled=false;gameBusy=!!e.data.busy;$('#game-dot').className='dot '+(gameBusy?'busy':'live');
 context={scenario:$('#scenario').value,phase:gameState.phase,node:gameState.node,party:gameState.party,turn:gameState.battle?.turn||null,width:frame.clientWidth,height:frame.clientHeight,hero:picked[0]};
 $('#game-context').textContent=`${QA_SCENARIOS[context.scenario]||gameState.phase} · ${gameState.party.map(id=>HEROES[id].name).join(' / ')}${context.turn?' · '+context.turn+'턴':''}`;renderPreviews();
 if(afterLoad&&!gameBusy){const f=afterLoad;afterLoad=null;f();}}catch{status('테스트 상태를 읽지 못했습니다.');}});
$('#load-scenario').onclick=()=>loadScene($('#scenario').value);
$('#apply-condition').onclick=()=>{try{if(!gameState)throw Error('게임이 연결된 뒤 사용하세요.');send('load',{animate:$('#animate-condition').checked,state:qaApplyCondition(gameState,{hero:picked[0],part:$('#part').value,stage:$('#stage').value,breakdown:$('#breakdown').value,failures:$('#failures').value,ap:$('#ap').value,support:$('#support').value,scar:$('#scar').value})});status(`${HEROES[picked[0]].name}에게 상태를 적용했습니다.`);}catch(e){status(e.message);}};
$('#preview').onclick=()=>openPreview($('#preview-kind').value);$('#resume').onclick=()=>send('resume');
$('#viewport-size').onchange=()=>{const size={desktop:[1280,720],landscape:[844,390],compact:[640,360],portrait:[390,740]}[$('#viewport-size').value];frame.style.width=size?size[0]+'px':'100%';frame.style.height=size?size[1]+'px':'';if(context){context.width=size?.[0]||frame.clientWidth;context.height=size?.[1]||frame.clientHeight;}};
function renderEntries(){const open=entries.filter(e=>e.status!=='resolved').length;$('#feedback-count').textContent=entries.length?open+'/'+entries.length:'0';$('#feedback-summary').textContent=entries.length?`미검토 ${open} · 전체 ${entries.length}`:'';$('#feedback-list').innerHTML=entries.length?[...entries].reverse().map(e=>`<article class="feedback-item ${e.status==='resolved'?'feedback-done':''}" data-id="${esc(e.id)}"><small>${esc(e.category)} · ${esc(e.context?.phase||'장면 없음')} · ${esc(e.context?.width||'?')}×${esc(e.context?.height||'?')} · ${esc(e.createdAt.slice(0,16).replace('T',' '))}</small><h3><span class="feedback-tag ${esc(e.priority)}">${({normal:'보통',high:'높음',blocker:'진행 불가',idea:'제안'})[e.priority]}</span> ${esc(e.title)}</h3><p>${esc(e.actual)}</p>${e.expected?`<p><b>원하는 모습</b><br>${esc(e.expected)}</p>`:''}<small>${e.save?'테스트 상태 첨부됨':'상태 첨부 없음'} · ${e.status==='resolved'?'확인 완료':'미검토'}</small><div class="item-actions"><button data-fb="edit">수정</button><button data-fb="resolved">${e.status==='resolved'?'미검토로':'확인 완료로'}</button>${e.save?'<button data-fb="reproduce">이 상태 재현</button>':''}<button data-fb="remove">기록 지우기</button></div></article>`).join(''):'<p class="hint">아직 기록이 없습니다. 위 양식으로 첫 피드백을 남겨주세요.</p>';}
function resetForm(){editId=null;$('#feedback-form').reset();$('#save-feedback').textContent='피드백 추가';$('#cancel-edit').hidden=true;saveDraft();}
$('#feedback-form').addEventListener('input',saveDraft);$('#feedback-form').onsubmit=e=>{e.preventDefault();try{const old=entries.find(x=>x.id===editId),fields={...draft(),id:editId,createdAt:old?.createdAt,status:old?.status};const entry=feedbackEntry(fields,old?.context||context,old?.save||gameState);if(editId)entries=entries.map(x=>x.id===editId?entry:x);else entries.push(entry);store();renderEntries();resetForm();status('피드백을 저장했습니다. JSON으로 내보내 채팅에 첨부할 수 있습니다.');}catch(e){status(e.message);}};$('#cancel-edit').onclick=resetForm;
$('#feedback-list').onclick=e=>{const action=e.target.closest('[data-fb]'),row=action?.closest('[data-id]'),entry=entries.find(x=>x.id===row?.dataset.id);if(!entry)return;switch(action.dataset.fb){case'edit':editId=entry.id;restoreDraft({...entry,includeSave:!!entry.save});$('#save-feedback').textContent='수정 저장';$('#cancel-edit').hidden=false;show('feedback');$('#feedback-title').focus();break;case'resolved':entry.status=entry.status==='resolved'?'open':'resolved';entry.updatedAt=new Date().toISOString();store();renderEntries();break;case'reproduce':try{if(QA_SCENARIOS[entry.context?.scenario])$('#scenario').value=entry.context.scenario;show('game');send('load',{state:hydrate(entry.save)});status('첨부된 테스트 상태를 불러왔습니다.');}catch{status('첨부된 저장 상태를 불러올 수 없습니다.');}break;case'remove':entries=entries.filter(x=>x.id!==entry.id);store();renderEntries();status('기록을 지웠습니다. 내보낸 JSON이 있으면 다시 불러올 수 있습니다.');break;}};
$('#export-feedback').onclick=()=>{const content=JSON.stringify(feedbackDocument(entries,draft()),null,2),url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`teyvat-embers-feedback-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('피드백과 작성 중인 내용을 JSON으로 내보냈습니다.');};
$('#import-feedback').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>15*1024*1024)throw Error('15MB 이하의 피드백 JSON을 선택하세요.');const data=importFeedback(await file.text());entries=mergeFeedback(entries,data.entries);store();if(data.draft)restoreDraft(data.draft);saveDraft();renderEntries();status(`${data.entries.length}개 기록을 불러왔습니다. 같은 기록은 최신 수정본을 유지합니다.`);}catch(e){status(e.message);}e.target.value='';};renderEntries();

$('#stop-preview').onclick=()=>send('stopPreview');

// ---------- 탭: 게임 / 이펙트 시험장 / 피드백. 주소 #lab, #lab/그룹/이름(예: #lab/사이노/심판), #feedback ----------
const lab=$('#vfx-lab'),tabs=[...document.querySelectorAll('.qa-tabs button')];
function show(tab,target=''){const isLab=tab==='lab';tabs.forEach(b=>{b.classList.toggle('on',b.dataset.tab===tab);b.setAttribute('aria-selected',String(b.dataset.tab===tab));});document.querySelectorAll('[data-pane]').forEach(p=>{p.hidden=p.dataset.pane!==tab;});
 if(isLab){const src='vfx-lab.html'+(target?'#'+encodeURIComponent(target).replace(/%2F/g,'/'):'');if(!lab.getAttribute('src')||target)lab.src=src;}
 const want=tab==='lab'?'#lab'+(target?'/'+target:''):tab==='feedback'?'#feedback':'';if(location.hash!==want)history.replaceState(null,'',want||location.pathname+location.search);}
tabs.forEach(b=>b.onclick=()=>show(b.dataset.tab));$('#open-lab').onclick=()=>show('lab');
const fromHash=()=>{const h=decodeURIComponent(location.hash.slice(1));if(h==='lab'||h.startsWith('lab/'))show('lab',h.slice(4));else if(h==='feedback')show('feedback');};fromHash();addEventListener('hashchange',fromHash);
