// v0.36 7단계: 시드별 저장 칸과, 다른 기기로 옮기는 저장 파일·코드.
// 서버가 없으므로 시드만으로는 다른 기기의 기록을 가져올 수 없다. 파일(.embers)이나 코드를 직접 옮긴다.
import {hydrate,serialize,HEROES,currentNode} from './engine.js';
import {normalizeSeed,randomSeed,isSeed,seedNumber} from './seed.js';
export const SAVE_APP='teyvat-embers',SAVE_FORMAT=1,SAVE_EXTENSION='.embers',CODE_PLAIN='EMBR1:',CODE_PACKED='EMBR2:';
export const SAVE_REASONS={
 empty:'내용이 비어 있습니다.',
 broken:'저장 파일을 읽을 수 없습니다. 파일이 손상되었거나 잔불의 저장 파일이 아닙니다.',
 code:'코드가 손상되었습니다. 처음부터 끝까지 다시 복사해 주세요.',
 foreign:'잔불의 저장 파일이 아닙니다.',
 newer:'더 새로운 버전의 잔불에서 만든 저장 파일입니다. 게임을 최신 버전으로 연 뒤 불러와 주세요.',
 state:'저장 파일 안의 진행 기록을 읽을 수 없습니다.',
 seed:'저장 파일의 시드가 올바르지 않습니다.',
};
const clone=x=>JSON.parse(JSON.stringify(x));
// 저장 한 벌. 시드 · 로비 쪽 누적 기록(collection) · 진행 중인 원정 · 설정을 담는다.
export function packSave(state,{prefs=null,savedAt=new Date().toISOString()}={}){
 const c=state.collection||{};
 return {app:SAVE_APP,format:SAVE_FORMAT,seed:c.seed||null,savedAt,clears:c.clears||0,runs:c.runs||0,prefs:prefs?clone(prefs):null,state:JSON.parse(serialize(state))};
}
// 덮어쓰기 전에 양쪽을 견줄 때 보여 줄 요약.
export function saveSummary(env){
 const s=env?.state;if(!s)return null;const active=!!s.runActive&&s.phase!=='title';
 let place='';try{place=active?currentNode(s).name:'';}catch{}
 return {seed:env.seed||'',savedAt:env.savedAt||'',clears:env.clears||0,runs:env.runs||0,active,place,party:active?(s.party||[]).map(id=>HEROES[id]?.name).filter(Boolean):[]};
}
export function formatSavedAt(iso){const d=new Date(iso);if(!iso||Number.isNaN(d.getTime()))return '기록 없음';const p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;}
export const saveFileText=env=>JSON.stringify(env);
export const saveFileName=env=>`${env.seed||'EMBR-SAVE'}${SAVE_EXTENSION}`;
const b64={
 encode(bytes){let bin='';for(let i=0;i<bytes.length;i+=0x8000)bin+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(bin).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');},
 decode(text){const bin=atob(text.replace(/-/g,'+').replace(/_/g,'/'));const out=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);return out;},
};
async function pipe(bytes,stream){const body=new Blob([bytes]).stream().pipeThrough(stream);return new Uint8Array(await new Response(body).arrayBuffer());}
const check=text=>seedNumber(text).toString(36);
// 코드는 파일과 같은 내용을 한 줄 글자로 만든 것이다. 압축을 쓸 수 있으면 줄인다.
export async function saveCode(env){
 const json=saveFileText(env),bytes=new TextEncoder().encode(json);
 if(typeof CompressionStream==='function'){try{return CODE_PACKED+check(json)+':'+b64.encode(await pipe(bytes,new CompressionStream('deflate-raw')));}catch{}}
 return CODE_PLAIN+check(json)+':'+b64.encode(bytes);
}
async function codeText(text){
 const packed=text.startsWith(CODE_PACKED),[sum,body]=text.slice(CODE_PLAIN.length).split(':');if(!sum||!body||!/^[A-Za-z0-9_-]+$/.test(body))throw Error('code');
 let bytes=b64.decode(body);if(packed){if(typeof DecompressionStream!=='function')throw Error('code');bytes=await pipe(bytes,new DecompressionStream('deflate-raw'));}
 const json=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(check(json)!==sum)throw Error('code');return json;
}
// 파일 내용이나 코드를 읽는다. 실패하면 이유를 돌려주고 아무것도 바꾸지 않는다.
// 성공: {ok:true, envelope, legacy}  (envelope.state 는 지금 버전으로 고쳐 읽은 상태)
export async function parseSave(input){
 const text=String(input??'').trim().replace(/^﻿/,'');if(!text)return {ok:false,reason:SAVE_REASONS.empty};
 let json=text;const coded=text.startsWith(CODE_PLAIN)||text.startsWith(CODE_PACKED);
 if(coded){try{json=await codeText(text.replace(/\s+/g,''));}catch{return {ok:false,reason:SAVE_REASONS.code};}}
 let data;try{data=JSON.parse(json);}catch{return {ok:false,reason:coded?SAVE_REASONS.code:SAVE_REASONS.broken};}
 if(!data||typeof data!=='object'||Array.isArray(data))return {ok:false,reason:SAVE_REASONS.foreign};
 // v0.35까지의 내보내기는 진행 상태만 담은 JSON이었다. 그대로 읽어 새 형식으로 감싼다.
 const legacy=data.app===undefined&&data.version!==undefined&&Array.isArray(data.party);
 if(!legacy&&data.app!==SAVE_APP)return {ok:false,reason:SAVE_REASONS.foreign};
 if(!legacy){if(!Number.isInteger(data.format)||data.format<1)return {ok:false,reason:SAVE_REASONS.broken};if(data.format>SAVE_FORMAT)return {ok:false,reason:SAVE_REASONS.newer};}
 let state;try{state=hydrate(legacy?data:data.state);}catch{return {ok:false,reason:SAVE_REASONS.state};}
 // 시드가 아직 없는 저장(null)은 받아 주고, 불러올 때 새 시드를 붙인다. 적혀 있는데 틀린 시드는 거절한다.
 let seed=null;
 if(legacy)seed=isSeed(state.collection.seed)?state.collection.seed:null;
 else if(data.seed!==null&&data.seed!==undefined){seed=normalizeSeed(data.seed);if(!seed)return {ok:false,reason:SAVE_REASONS.seed};}
 state.collection.seed=seed;
 return {ok:true,legacy,envelope:{app:SAVE_APP,format:SAVE_FORMAT,seed,savedAt:legacy?'':String(data.savedAt||''),clears:state.collection.clears||0,runs:state.collection.runs||0,prefs:!legacy&&data.prefs&&typeof data.prefs==='object'?clone(data.prefs):null,state}};
}
// 시드별 저장 칸. storage 는 localStorage 와 같은 모양이면 된다.
export function saveStore(storage,prefix=SAVE_APP){
 const LAST=prefix+'-last-seed',slot=seed=>`${prefix}-save:${seed}`;
 const read=seed=>{try{const env=JSON.parse(storage.getItem(slot(seed))||'null');if(!env||env.app!==SAVE_APP||!isSeed(env.seed))return null;const state=hydrate(env.state);state.collection.seed=env.seed;return {...env,state};}catch{return null;}};
 return {
  last(){try{const seed=storage.getItem(LAST);return isSeed(seed)?seed:null;}catch{return null;}},
  has(seed){try{return storage.getItem(slot(seed))!==null;}catch{return false;}},
  read,
  write(env){if(!isSeed(env.seed))throw Error('seed');storage.setItem(slot(env.seed),saveFileText(env));storage.setItem(LAST,env.seed);},
  remove(seed){storage.removeItem(slot(seed));if(storage.getItem(LAST)===seed)storage.removeItem(LAST);},
  seeds(){const out=[];for(let i=0;i<storage.length;i++){const key=storage.key(i);if(key?.startsWith(prefix+'-save:'))out.push(key.slice(prefix.length+6));}return out.filter(isSeed).sort();},
  // v0.35까지는 저장 칸이 하나였다. 처음 한 번 시드를 붙여 새 칸으로 옮긴다. 옛 칸은 지우지 않는다.
  migrate(legacyKey,random=Math.random){
   if(this.last())return null;let state;try{const raw=storage.getItem(legacyKey);if(!raw)return null;state=hydrate(raw);}catch{return null;}
   let seed=isSeed(state.collection.seed)?state.collection.seed:randomSeed(random);for(let i=0;i<20&&this.has(seed);i++)seed=randomSeed(random);
   state.collection.seed=seed;const env=packSave(state,{savedAt:''});this.write(env);return env;
  },
 };
}
