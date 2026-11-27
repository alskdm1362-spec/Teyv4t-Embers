// 시드 = 저장 식별자. 원정 난수는 「시드 + 원정 회차」로 따로 만든다(기획 §4).
// 이 파일은 다른 모듈을 불러오지 않는다. 엔진과 저장 양쪽에서 쓴다.
export const SEED_PREFIX='EMBR-',SEED_LENGTH=4;
// 헷갈리는 글자(I·O·0·1)를 뺀 32자.
export const SEED_ALPHABET='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function randomSeed(random=Math.random){
 let body='';for(let i=0;i<SEED_LENGTH;i++)body+=SEED_ALPHABET[Math.min(SEED_ALPHABET.length-1,Math.floor(random()*SEED_ALPHABET.length))];
 return SEED_PREFIX+body;
}
// ''  = 빈칸(무작위로 만들라는 뜻) · null = 쓸 수 없는 입력 · 'EMBR-XXXX' = 정리된 시드
export function normalizeSeed(text){
 const raw=String(text??'').toUpperCase().replace(/[\s_]/g,'');if(!raw)return '';
 const body=raw.startsWith('EMBR')?raw.slice(4).replace(/^-/,''):raw.replace(/^-/,'');
 return body.length===SEED_LENGTH&&[...body].every(c=>SEED_ALPHABET.includes(c))?SEED_PREFIX+body:null;
}
export const isSeed=text=>typeof text==='string'&&normalizeSeed(text)===text;
// FNV-1a 32비트.
export function seedNumber(seed){let h=0x811c9dc5;for(const ch of String(seed)){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0;}return h>>>0;}
export function expeditionSeed(seed,run=1){return (seedNumber(seed)+Math.imul(Math.max(1,run|0),0x9e3779b1))>>>0;}
