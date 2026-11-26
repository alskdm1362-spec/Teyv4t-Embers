// v0.30 monster roster. Battle rules stay keyed by ENEMIES kinds (hound, angler, ...);
// a "look" is the creature that wears those rules: its name, art, realm and on-screen size.
// Abyss creatures fill the early map; from the second third, some battles take place in the
// celestial realm and the same rules come in white-and-gold forms.
export const ENEMY_LOOKS=Object.freeze({
 'abyss-slime':{kind:'trainingSlime',realm:'abyss',name:'떠도는 점액',size:.5,note:'더듬이를 흔들며 굴러다니는 작은 점액. 위협보다는 연습 상대에 가깝다.'},
 'abyss-tick':{kind:'hound',realm:'abyss',name:'심연 진드기',size:.5,note:'빠르게 달라붙어 독을 남기는 작은 벌레.'},
 'abyss-grub':{kind:'hound',realm:'abyss',name:'알을 품은 유충',size:.58,note:'분홍빛 알을 끌어안고 있는 유충. 물린 자리가 오래 쓰라리다.'},
 'abyss-worm':{kind:'wanderer',realm:'abyss',name:'되살아나는 마디벌레',size:1,note:'몸을 끊어도 마디 하나가 남아 다시 자라난다.'},
 'abyss-mantis':{kind:'hunter',realm:'abyss',name:'갈래낫 추적자',size:.98,note:'한 사람을 정해 끝까지 쫓는 낫발 사냥꾼.'},
 'abyss-jelly':{kind:'angler',realm:'abyss',name:'응시하는 부유체',size:.6,note:'촉수 끝으로 동족과 장막을 이어 붙이는 해파리.'},
 'abyss-maw':{kind:'mimic',realm:'abyss',name:'가시심장 포식자',size:1.18,note:'드러난 심장을 가시로 감싼 포식자. 껍질을 여러 번 깨야 한다.'},
 'abyss-cocoon':{kind:'breacher',realm:'abyss',name:'맥동하는 균열 고치',size:1,note:'고치가 깨지기 전까지는 수축만 반복하다, 껍질이 벗겨지면 쏟아져 나온다.'},
 'abyss-womb':{kind:'nightmare',realm:'abyss',name:'천의 눈 · 모태',size:1.5,boss:true,note:'수많은 눈으로 전장을 지켜보며 부유체를 낳는 심연의 모태.'},
 'sky-seraph':{kind:'hound',realm:'celestial',name:'깃털 감시조',size:.6,note:'광륜을 단 작은 천사. 날개깃이 상처를 오래 남긴다.'},
 'sky-pilgrim':{kind:'wanderer',realm:'celestial',name:'붉은 장막의 순례자',size:.98,note:'쓰러뜨려도 붉은 천이 남아 다시 형체를 짓는다.'},
 'sky-knight':{kind:'hunter',realm:'celestial',name:'백은의 추격 기사',size:1,note:'붉은 눈으로 표적을 새기고 정확히 베어 낸다.'},
 'sky-tome':{kind:'angler',realm:'celestial',name:'날개 달린 금서',size:.6,note:'펼쳐진 책장이 동족과 장막을 묶는다.'},
 'sky-serpent':{kind:'mimic',realm:'celestial',name:'금빛 가시룡',size:1.12,note:'금빛 가시 비늘을 여러 번 벗겨야 몸통이 드러난다.'},
 'sky-bladewing':{kind:'breacher',realm:'celestial',name:'검날개 집행자',size:1.12,note:'칼날 같은 날개로 몸을 감싼 집행자. 날개가 열리면 일격이 쏟아진다.'},
 'sky-crescent':{kind:'keeper',realm:'celestial',name:'초승달의 관측자',size:1.45,boss:true,note:'자신을 거듭 벤 자를 기억하고 결말을 내린다.'},
 'sky-throne':{kind:'sentinel',realm:'celestial',name:'좌천사 · 별의 파수',size:1.55,boss:true,note:'별을 펼쳐 심판을 준비하는 여섯 날개의 파수.'},
 'sky-prism':{kind:'star',realm:'celestial',name:'관측의 결정',size:.48,note:'파수가 심판에 쓰는 빛의 결정.'},
 'cherubim':{kind:'nightmare',realm:'celestial',name:'천공의 사도·케루빔',size:1.6,boss:true,raid:true,note:'보스 레이드에서만 만나는 천공의 사도. 금서를 불러내 장막을 두른다.'},
});
export const KIND_LOOKS=Object.freeze({
 trainingSlime:{abyss:['abyss-slime']},
 hound:{abyss:['abyss-tick','abyss-grub'],celestial:['sky-seraph']},
 wanderer:{abyss:['abyss-worm'],celestial:['sky-pilgrim']},
 hunter:{abyss:['abyss-mantis'],celestial:['sky-knight']},
 angler:{abyss:['abyss-jelly'],celestial:['sky-tome']},
 mimic:{abyss:['abyss-maw'],celestial:['sky-serpent']},
 breacher:{abyss:['abyss-cocoon'],celestial:['sky-bladewing']},
 nightmare:{abyss:['abyss-womb']},
 keeper:{celestial:['sky-crescent']},
 sentinel:{celestial:['sky-throne']},
 star:{celestial:['sky-prism']},
});
export const RAID_LOOK='cherubim';
export const enemyArtPath=look=>`assets/enemies/${ENEMY_LOOKS[look]?look:'abyss-slime'}.webp`;
export function pickLook(kind,realm='abyss',salt=0){const set=KIND_LOOKS[kind]||{},list=set[realm]||set.abyss||set.celestial||['abyss-slime'];return list[Math.abs(salt|0)%list.length];}
export const lookOf=e=>ENEMY_LOOKS[e?.look]?e.look:pickLook(e?.kind,'abyss',0);
export const lookName=look=>ENEMY_LOOKS[look]?.name||look;
