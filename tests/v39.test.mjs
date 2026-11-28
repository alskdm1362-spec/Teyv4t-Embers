import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CAST_SPRITES,CAST_FEET,CAST_NUDGE,spriteFrame,castArt} from '../dist/cast-art.js';
import {isMeleeCard,cardStyle,CARD_FX} from '../dist/cast-vfx.js';
import {AJAW_CRUSH_ART} from '../dist/cast36.js';
import {V2_CARDS} from '../dist/cards-v2.js';

const dist=p=>new URL('../dist/'+p,import.meta.url);
// webp 그림의 너비 (VP8 / VP8L / VP8X 머리만 읽는다)
function webpWidth(file){const b=fs.readFileSync(file),kind=b.toString('ascii',12,16);
 if(kind==='VP8X')return 1+b.readUIntLE(24,3);if(kind==='VP8L'){const bits=b.readUInt32LE(21);return (bits&0x3fff)+1;}if(kind==='VP8 ')return b.readUInt16LE(26)&0x3fff;throw Error('unknown webp '+kind);}

test('v0.39 전투 배치: 대기 그림 배율은 캔버스 너비/446 — 나모 님이 맞춘 픽셀 크기를 그대로 살린다',()=>{
 for(const id of Object.keys(CAST_SPRITES)){const w=webpWidth(dist(castArt(id,'battle')));assert.ok(Math.abs(CAST_SPRITES[id].base-w/446)<.002,id+' '+w);}
});
test('v0.39 전투 배치: 그림마다 발 위치가 있고, 포즈를 바꿔도 발 위치를 따라간다',()=>{
 for(const [id,sp] of Object.entries(CAST_SPRITES)){assert.ok(CAST_FEET[id]?.idle>.3&&CAST_FEET[id].idle<.75,id);for(const pose of Object.keys(sp.poses)){const f=spriteFrame(id,pose);assert.ok(f.foot>.3&&f.foot<.8,id+'/'+pose);assert.ok(Math.abs(f.scale-sp.base*sp.poses[pose])<.001);}}
 assert.ok(CAST_NUDGE.jahoda>0&&CAST_NUDGE.lyney<0&&CAST_NUDGE.cyno<0,'야호다 오른쪽, 리니·사이노 왼쪽');
 const css=fs.readFileSync(dist('cast-art.css'),'utf8');assert.match(css,/left:calc\(\(\.5 - var\(--foot-x,\.5\)\)\*var\(--cast-px\)\*var\(--sprite-scale,1\) \+ var\(--nudge,0\)\*var\(--cast-px\)\)/);
 const motion=fs.readFileSync(dist('motion.js'),'utf8');assert.ok(motion.includes("source.style.setProperty('--foot-x',f.foot)"),'포즈를 바꿀 때 발 위치도 바꾼다');
});
test('v0.39 카드별 이펙트: 모든 카드 이름이 실제 카드이고, 원거리 카드는 돌진하지 않는다',()=>{
 const keys=new Set(Object.values(V2_CARDS).map(c=>c.key));for(const [hero,map] of Object.entries(CARD_FX))for(const k of Object.keys(map))assert.ok(keys.has(k),hero+'/'+k);
 assert.equal(isMeleeCard('lohen','l_strike'),true);assert.equal(isMeleeCard('lohen','l_pierce'),false);assert.equal(isMeleeCard('lohen','l_breach'),true);
 assert.equal(isMeleeCard('kinich','k_shot'),false);assert.equal(isMeleeCard('jahoda','j_dart'),false);assert.equal(isMeleeCard('cyno','c_claw'),true);assert.equal(cardStyle('durin','d_comet'),'comet');
});
test('v0.39 키니치 분쇄 모드: 분쇄 아쥬 그림이 있고 전투 화면이 모드에 따라 아쥬를 바꾼다',()=>{
 assert.ok(fs.existsSync(dist(AJAW_CRUSH_ART)));const app=fs.readFileSync(dist('app.js'),'utf8');assert.ok(app.includes("state.battle.kmode==='crush'?`<img class=\"ajaw-crush\""));
});
test('v0.39 두린 불: 윤곽선 없는 평평한 색 띠, 심지가 가장 진하다',async()=>{
 const {DURIN_FIRE,DURIN_WING}=await import('../dist/toon-fire.js');for(const P of [DURIN_FIRE,DURIN_WING]){const th=P.bands.map(b=>b[0]);for(let i=1;i<th.length;i++)assert.ok(th[i]>th[i-1]);const [r,g,b]=P.bands.at(-1)[1];assert.ok(r>240&&g>200,'심지는 밝은 노랑');assert.ok(P.bands[0][2]<.5,'바깥은 옅은 빛무리');}
});
test('v0.39 결합 빛: 작은 빛 0.3초 → 0.1~0.2초 만에 큰 빛',async()=>{
 const {COMBINE_BEATS}=await import('../dist/judgment-vfx.js');assert.equal(COMBINE_BEATS.small,.3);assert.ok(COMBINE_BEATS.grow>=.1&&COMBINE_BEATS.grow<=.2);
});
