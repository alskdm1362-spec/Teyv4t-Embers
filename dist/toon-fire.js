// v0.39 두린의 불 — 「그린 듯한」 셀 불꽃 (나모 님 2차 피드백: 이전 불꽃 혀 찍기 방식은 버렸다).
// 방법: 작은 열기 덩어리(blob) 수백 개를 띄워 올리며 저해상도 버퍼에 밀도로 더한 뒤,
// 밀도를 몇 단계 문턱으로 잘라 평평한 색 띠(검붉은 윤곽 → 진홍 → 주황 → 노란 심지)로 칠한다.
// 덩어리끼리 녹아 붙고 갈라지면서, 위로 늘어난 덩어리 끝이 뾰족한 불꽃 혀가 된다 — 손으로 그린 애니메이션 불의 모양.
// 버퍼는 화면의 절반 해상도라 휴대전화에서도 가볍다(효과 하나에 많아야 240×200 화소 정도).

import {spikeStar} from './fx-brush.js';
const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),out3=t=>1-Math.pow(1-clamp(t),3),out5=t=>1-Math.pow(1-clamp(t),5),sm=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x);};
const hash=(i,s)=>{const x=Math.sin(i*127.1+s*311.7)*43758.5453;return x-Math.floor(x);};

// 색 띠: [밀도 문턱, 색]. 마지막 줄(가장 진한 곳)이 심지.
// v0.39 나모 님 참고 그림 6장(2차): 검은 윤곽 없음 · 노랑→주황→붉은 주황의 평평한 띠 · 바깥은 옅은 빛무리 띠 · 심지는 아래쪽.
// [문턱, 색, 불투명도]. 첫 줄은 빛무리(옅게), 마지막 줄이 가장 뜨거운 심지.
export const DURIN_FIRE=Object.freeze({bands:[[.06,[255,84,24],.22],[.13,[255,96,26],.5],[.2,[238,70,24],1],[.38,[255,132,30],1],[.6,[255,194,48],1],[.84,[255,242,150],1]],glow:'#ff5a1e',hot:'#ffd23a'});
// 두린 날개: 진홍빛이 섞인 불 (두린 영상의 붉은 날개)
export const DURIN_WING=Object.freeze({bands:[[.06,[255,40,70],.22],[.13,[240,40,70],.5],[.2,[214,22,58],1],[.38,[255,70,52],1],[.6,[255,150,60],1],[.84,[255,226,150],1]],glow:'#ff2a4a',hot:'#ffb060'});

let dot=null;
function dotSprite(){if(dot)return dot;const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),im=g.createImageData(64,64);
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){const dx=(x+.5-32)/32,dy=(y+.5-32)/32,r2=dx*dx+dy*dy,v=r2>=1?0:Math.pow(1-r2,2);const i=(y*64+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=255;im.data[i+3]=Math.round(v*255);}
 g.putImageData(im,0,0);dot=c;return c;}

/** 한 덩어리의 불. 좌표는 이펙트의 지역 좌표(px). */
export class ToonFire{
 constructor({x0,y0,w,h,res=.6,pal=DURIN_FIRE,rise=520,drag=1.6}){this.x0=x0;this.y0=y0;this.w=w;this.h=h;this.res=res;this.pal=pal;this.rise=rise;this.drag=drag;this.blobs=[];
  const bw=Math.max(8,Math.round(w*res)),bh=Math.max(8,Math.round(h*res));this.buf=document.createElement('canvas');this.buf.width=bw;this.buf.height=bh;this.bc=this.buf.getContext('2d',{willReadFrequently:true});
  this.out=document.createElement('canvas');this.out.width=bw;this.out.height=bh;this.oc=this.out.getContext('2d');this.img=this.oc.createImageData(bw,bh);}
 /** r 반지름, life 수명, str 밀도(0~1.4), up 부력 배율, shrink 끝 반지름 비율 */
 add(o){this.blobs.push({x:0,y:0,vx:0,vy:0,r:10,life:.6,age:0,str:1,up:1,shrink:.15,wob:.6,ph:Math.random()*TAU,...o});}
 step(dt){if(dt<=0)return;const d=Math.exp(-this.drag*dt);this.blobs=this.blobs.filter(b=>{b.age+=dt;if(b.age>=b.life)return false;b.vx*=d;b.vy=b.vy*d-this.rise*b.up*dt;b.x+=b.vx*dt+Math.sin(b.age*9+b.ph)*b.wob*b.r*dt*3;b.y+=b.vy*dt;return true;});}
 get alive(){return this.blobs.length>0;}
 draw(c,alpha=1){const B=this.bc,bw=this.buf.width,bh=this.buf.height,k=this.res,sp=dotSprite();B.setTransform(1,0,0,1,0,0);B.clearRect(0,0,bw,bh);if(!this.blobs.length)return;B.globalCompositeOperation='lighter';
  for(const b of this.blobs){const q=b.age/b.life,r=b.r*(1-(1-b.shrink)*q)*k,a=b.str*(q<.12?q/.12:1)*(1-sm(.7,1,q));if(r<.5||a<=0)continue;const sp2=Math.hypot(b.vx,b.vy),e=Math.min(2.2,sp2/260);
   B.globalAlpha=Math.min(1,a);B.setTransform(1,0,0,1,(b.x-this.x0)*k,(b.y-this.y0)*k);if(e>.05)B.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);B.drawImage(sp,-r,-r*(1+e)*1.25,r*2,r*2*(1+e));}
  const src=B.getImageData(0,0,bw,bh).data,dst=this.img.data,bands=this.pal.bands,n=bands.length;
  // 띠 경계는 밀도 0.035 폭 안에서만 섞는다 → 칠한 듯 또렷하지만 계단 모양은 생기지 않는다
  const E=.035;for(let i=0;i<src.length;i+=4){const v=src[i+3]/255;if(v<bands[0][0]){dst[i+3]=0;continue;}let j=n-1;while(j>0&&v<bands[j][0])j--;const col=bands[j][1],f=Math.min(1,(v-bands[j][0])/E);
   const a1=bands[j][2]??1;if(j===0){dst[i]=col[0];dst[i+1]=col[1];dst[i+2]=col[2];dst[i+3]=f*a1*255;}else{const p=bands[j-1][1],a0=bands[j-1][2]??1;dst[i]=p[0]+(col[0]-p[0])*f;dst[i+1]=p[1]+(col[1]-p[1])*f;dst[i+2]=p[2]+(col[2]-p[2])*f;dst[i+3]=(a0+(a1-a0)*f)*255;}}
  this.oc.putImageData(this.img,0,0);c.save();c.globalCompositeOperation='source-over';c.globalAlpha=clamp(alpha);c.imageSmoothingEnabled=true;c.drawImage(this.out,this.x0,this.y0,this.w,this.h);c.restore();}
}

function vignette(c,a){if(a<=0)return;c.save();c.setTransform(1,0,0,1,0,0);const W=c.canvas.width,H=c.canvas.height,g=c.createRadialGradient(W/2,H/2,Math.min(W,H)*.2,W/2,H/2,Math.max(W,H)*.75);g.addColorStop(0,'rgba(20,3,10,0)');g.addColorStop(1,`rgba(20,3,10,${a})`);c.fillStyle=g;c.fillRect(0,0,W,H);c.restore();}
// 시간 진행: spawn(sys,t)에서 부르면 still()의 빠른 감기에서도 같은 장면이 나온다.
function ticker(){let last=0;return t=>{const dt=clamp(t-last,0,.05);last=t;return dt;};}

export function durinFX(H){const {flash,ring,rnd,burst}=H;const F=DURIN_FIRE;
 // 불티: 사방으로 튀는 짧은 빛줄기 (참고 그림의 오렌지 불티)
 const embers=(sys,x,y,S,R,n=14,sp=520)=>burst(sys,x,y,{core:'#fff3b0',main:'#ffb030',spark:'#ff8a1e',deep:'#ff5a1e'},R,{n,speed:sp*S,size:4*S,up:160*S});
 // 가로로 퍼지는 강한 빛 고리 (버섯 폭발 참고 그림)
 const flare=(c,u,S,a=1)=>{const k=out3(u/.22),f=(1-sm(.05,.5,u))*a;if(f<=0)return;H.brushStroke(c,[[-240*S*k,6*S],[240*S*k,6*S]],{w:26*S*f,alpha:f,cols:{core:'#fffbe0',main:'#ffcf4a',deep:'#ff7a1e'},tail:'soft',head:'soft',belly:.5,glow:2.4,core:.55});ring(c,0,10*S,30*S+220*S*k,10*S*f,'#ffd36a',f,.22);};
 // 둥글게 터지는 불: 가운데 큰 덩어리들이 부풀고, 작은 덩어리가 사방으로 튀었다가 위로 타오른다
 const blast=(fire,x,y,S,R,{n=26,big=1}={})=>{for(let i=0;i<n;i++){const a=R()*TAU,v=(60+R()*260)*S*big;fire.add({x:x+Math.cos(a)*8*S,y:y+Math.sin(a)*6*S,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7-60*S,r:(9+R()*14)*S*big,life:.4+R()*.45,str:.3+R()*.28,up:1.1+R()*.7,shrink:.03});}
  for(let i=0;i<4;i++)fire.add({x:x+(R()-.5)*20*S,y:y+(R()-.5)*14*S,vx:(R()-.5)*60*S,vy:-(40+R()*80)*S,r:(26+R()*14)*S*big,life:.5+R()*.3,str:.3,up:.8,shrink:.1});};
 // 땅불: 줄을 따라 덩어리가 계속 솟는다
 const groundLine=(fire,x,y,half,S,R,rate,dt)=>{let n=rate*dt;while(n>0){if(R()<n){const d=(R()*2-1);fire.add({x:x+d*half,y:y+(R()-.5)*6*S,vx:(R()-.5)*30*S,vy:-(80+R()*120)*S,r:(7+R()*9)*S*(1-Math.abs(d)*.4),life:.35+R()*.35,str:.55,up:1.2,shrink:.03,wob:.9});}n--;}};
 const glowAt=(c,x,y,r,a)=>{flash(c,x,y,r,F.glow,.55*a);flash(c,x,y,r*.45,F.hot,.5*a);};
 return {
  // 타다 남은 불티 · 용광로 · 공명하는 손: 작게 펑. 흑염의 날개(wing): 옆에서 불 벽이 쓸고 와서 터진다
  celBurst(cols,{big=false,wing=false}){const S0=big?1.4:1;let fire=null,boomed=false;const tk=ticker(),T=wing?.22:0;return {dur:1.4,spawn(sys,t,R,s){const S=s*S0;fire??=new ToonFire({x0:-200*S,y0:-230*S,w:400*S,h:330*S});const dt=tk(t);
    if(wing&&t<T+.05){const x=-190*S+190*S*out3(t/T);let n=90*dt*4;while(n-->0)fire.add({x:x+(R()-.5)*20*S,y:(30-R()*90)*S,vx:(260+R()*120)*S,vy:-(20+R()*60)*S,r:(10+R()*12)*S,life:.25+R()*.25,str:.55,up:1.1,shrink:.04});}
    if(!boomed&&t>=T){boomed=true;blast(fire,0,0,S,R,{n:big?30:20,big:big?1.15:.85});embers(sys,0,0,S,R,big?18:10);}
    if(boomed&&t<T+.5)groundLine(fire,0,44*S,(big?90:60)*S,S,R,big?70:45,dt);fire.step(dt);},
   draw(c,t,s){if(!fire)return;const u=t-T;if(u>=0){glowAt(c,0,0,(big?170:120)*s,1-sm(0,.5,u));if(u<.06)H.flash(c,0,0,70*s,'#ffffff',1-u/.06);}fire.draw(c);}};},
  // 용의 발톱: 불꽃 긁기 세 줄 — 긁는 자리를 따라 불이 피어오른다
  fireClaw(cols){let fire=null;const tk=ticker();return {dur:1.1,spawn(sys,t,R,s){fire??=new ToonFire({x0:-140*s,y0:-170*s,w:280*s,h:280*s});const dt=tk(t);
    for(let i=0;i<3;i++){const t0=i*.035,k0=clamp((t-dt-t0)/.08),k1=clamp((t-t0)/.08);if(k1<=k0)continue;const x0=-70*s+i*30*s,y0=-70*s,x1=x0+60*s,y1=70*s;for(let q=k0;q<k1;q+=.03){fire.add({x:x0+(x1-x0)*q,y:y0+(y1-y0)*q,vx:(R()-.5)*50*s,vy:-(30+R()*60)*s,r:(9+R()*7)*s,life:.3+R()*.35,str:.6,up:1.1,shrink:.04});}}
    if(t>=.1&&!this.b){this.b=1;blast(fire,0,0,s,R,{n:10,big:.6});embers(sys,0,0,s,R,10,420);}fire.step(dt);},
   draw(c,t,s){if(!fire)return;for(let i=0;i<3;i++){const t0=i*.035,k=out5((t-t0)/.08),f=1-sm(.12,.3,t);if(k<=0||f<=0)continue;const x0=-70*s+i*30*s,y0=-70*s;H.streak(c,x0,y0,x0+60*s*k,y0+140*s*k,4*s,{core:'#fff8e0',main:'#ffb347',deep:'#c8162a'},f);}
    glowAt(c,0,0,110*s,1-sm(.1,.5,t));fire.draw(c);}};},
  // 낙성의 불길: 오른쪽 위에서 불덩이가 꼬리를 끌며 떨어져 크게 터진다
  fireComet(cols){const T=.32;let fire=null,boomed=false;const tk=ticker();return {dur:1.6,spawn(sys,t,R,s){fire??=new ToonFire({x0:-220*s,y0:-420*s,w:520*s,h:520*s});const dt=tk(t);
    if(t<T){const k=t/T,x=280*s*(1-k),y=-360*s*(1-k);let n=200*dt;while(n-->0)fire.add({x:x+(R()-.5)*14*s,y:y+(R()-.5)*14*s,vx:(50+R()*40)*s,vy:-(50+R()*50)*s,r:(10+R()*12)*s,life:.1+R()*.12,str:.55,up:.6,shrink:.04});fire.add({x,y,vx:0,vy:0,r:26*s,life:.05,str:1,up:0,shrink:1});}
    if(!boomed&&t>=T){boomed=true;blast(fire,0,0,s,R,{n:34,big:1.2});embers(sys,0,0,s,R,20,640);}if(boomed&&t<T+.6)groundLine(fire,0,48*s,110*s,s,R,80,dt);fire.step(dt);},
   draw(c,t,s){if(!fire)return;if(t<T){const k=t/T;glowAt(c,280*s*(1-k),-360*s*(1-k),70*s,1);}else{const u=t-T;glowAt(c,0,0,200*s,1-sm(0,.55,u));if(u<.07)H.flash(c,0,0,90*s,'#ffffff',1-u/.07);}fire.draw(c);if(t>=T)flare(c,t-T,s*.8);}};},
  // 잿빛 소나기: 작은 불방울 여럿이 떨어져 톡톡 터진다
  fireRain(cols){const drops=Array.from({length:7},(_,i)=>({x:(hash(i,1)-.5)*150,t0:hash(i,2)*.24,y:(hash(i,3)-.5)*60,hit:false}));let fire=null;const tk=ticker();return {dur:1.3,spawn(sys,t,R,s){fire??=new ToonFire({x0:-150*s,y0:-320*s,w:300*s,h:420*s});const dt=tk(t);
    for(const d of drops){const u=(t-d.t0)/.16;if(u<0)continue;if(u<1){const y=-280*s*(1-u)+d.y*s;fire.add({x:d.x*s,y,vx:0,vy:200*s,r:9*s,life:.12,str:.8,up:0,shrink:.3});}else if(!d.hit){d.hit=true;blast(fire,d.x*s,d.y*s,s,R,{n:7,big:.5});}}fire.step(dt);},
   draw(c,t,s){glowAt(c,0,0,130*s,.5*Math.sin(Math.PI*clamp(t/1)));fire?.draw(c);}};},
  // 두린 필살기 (두린 영상): ① 두린 등 뒤로 불꽃 날개가 뼈대를 따라 타오르며 펼쳐진다 ② 날개 사이에서 불덩이가 생겨 날아간다 ③ 닿으면 크게 터지고 땅에 불이 번진다
  durinUlt(cols,{from}){const f=from||{x:-360,y:-20},OPEN=.32,FIRE=.46,HIT=.82;let wings=null,ball=null,boom=null,boomed=false;const tk=ticker();
   const bones=side=>[[.25,-1.05],[.7,-.86],[1.02,-.46],[.95,.06]].map(([a,b])=>[side*a,b]);
   return {dur:2.1,spawn(sys,t,R,s){const W=110*s,Hh=100*s,bx=f.x,by=f.y-6*s;wings??=new ToonFire({x0:bx-W*1.35,y0:by-Hh*1.55,w:W*2.7,h:Hh*2.1,rise:380,pal:DURIN_WING});ball??=new ToonFire({x0:Math.min(f.x,0)-90*s,y0:Math.min(f.y,0)-200*s,w:Math.abs(f.x)+180*s,h:Math.abs(f.y)+300*s,rise:200});boom??=new ToonFire({x0:-260*s,y0:-300*s,w:520*s,h:400*s,rise:560});const dt=tk(t);
     // ① 날개: 뼈대 네 줄을 따라 덩어리가 바깥으로 흐른다. 펼쳐질수록 뼈대가 길어진다
     if(t<HIT+.05){const open=out3(t/OPEN),keep=t<HIT-.1?1:.35;for(const side of [-1,1]){const B=bones(side),root=[bx+side*12*s,by];
       // 날개막: 이웃한 뼈대 사이를 옅은 덩어리로 채운다 (진홍·검붉은 띠로 칠해짐)
       let n=320*dt*4*keep;while(n-->0){const k=Math.floor(R()*3),q=Math.sqrt(R())*open,m=R(),[ax,ay]=B[k],[cx,cy]=B[k+1],tx=ax+(cx-ax)*m,ty=ay+(cy-ay)*m-.12*Math.sin(m*Math.PI);wings.add({x:root[0]+tx*W*q,y:root[1]+ty*Hh*q,vx:tx*30*s,vy:-(20+R()*40)*s,r:(9+R()*7)*s,life:.14+R()*.12,str:.1+R()*.05,up:.6,shrink:.5,wob:.3});}
       // 뼈대: 진한 덩어리가 바깥으로 흐른다 (주황·노란 띠), 끝은 불꽃 혀로 솟는다
       for(const [i2,[tx,ty]] of B.entries()){let m2=48*dt*4*keep;while(m2-->0){const q=Math.pow(R(),.8)*open,w2=1-q*.65;wings.add({x:root[0]+tx*W*q,y:root[1]+ty*Hh*q,vx:tx*70*s+(R()-.5)*20*s,vy:ty*50*s-40*s,r:(4+7*w2+R()*3)*s,life:.14+R()*.16,str:.5+R()*.2,up:.6,shrink:.05,wob:.3});}
        if(open>.6&&R()<20*dt*4)wings.add({x:root[0]+tx*W*open,y:root[1]+ty*Hh*open,vx:tx*60*s,vy:-(120+R()*80)*s,r:(7+R()*4)*s,life:.22+R()*.12,str:.65,up:1.4,shrink:.02});}}}
     wings.step(dt);
     // ② 불덩이
     if(t>=FIRE-.08&&t<HIT){const k=clamp((t-FIRE)/(HIT-FIRE)),e=k*k*.5+k*.5,x=f.x*(1-e),y=(f.y-30*s)*(1-e)-Math.sin(Math.PI*k)*50*s,grow=sm(FIRE-.08,FIRE,t);let n=220*dt;while(n-->0)ball.add({x:x+(R()-.5)*16*s,y:y+(R()-.5)*16*s,vx:Math.sign(f.x||-1)*(100+R()*80)*s,vy:-(40+R()*60)*s,r:(10+R()*14)*s*grow,life:.16+R()*.2,str:.55,up:.9,shrink:.04});ball.add({x,y,vx:0,vy:0,r:30*s*grow,life:.04,str:1,up:0,shrink:1});}
     ball.step(dt);
     // ③ 폭발과 번지는 땅불
     if(!boomed&&t>=HIT){boomed=true;blast(boom,0,0,s,R,{n:48,big:1.45});embers(sys,0,0,s,R,30,760);}if(boomed&&t<HIT+.75)groundLine(boom,0,52*s,170*s,s,R,130,dt);boom.step(dt);},
    draw(c,t,s){if(!wings)return;vignette(c,.45*sm(0,.15,t)*(1-sm(HIT+.25,1.5,t)));
     const open=out3(t/OPEN)*(1-sm(HIT-.1,HIT+.2,t));glowAt(c,f.x,f.y-50*s,170*s,.8*open);wings.draw(c);
     if(t>=FIRE-.08&&t<HIT){const k=clamp((t-FIRE)/(HIT-FIRE)),e=k*k*.5+k*.5;glowAt(c,f.x*(1-e),(f.y-30*s)*(1-e)-Math.sin(Math.PI*k)*50*s,90*s,1);}ball.draw(c);
     if(t>=HIT){const u=t-HIT;glowAt(c,0,0,260*s,1-sm(0,.7,u));if(u<.08){H.flash(c,0,0,130*s,'#ffffff',1-u/.08);spikeStar(c,0,0,200*s*(1-u/.08),{alpha:1,cols:{core:'#ffffff',main:'#ffd36a',deep:'#ff6a22'},rot:.2,seed:5,thick:.12,extra:4});}}boom.draw(c);if(t>=HIT)flare(c,t-HIT,s*1.1);}};},
 };}
