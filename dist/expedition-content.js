export const LOOT_RULES=Object.freeze({normalUpgrade:.15,normalEquipment:.25,eliteUpgrade:.55,eliteEquipment:1,eliteRarity:.25,baseRefinement:.35});
export const EXTRA_ROUTE=[
 {type:'battle',name:'잿빛 바람길',description:'수계의 발자국을 따라 보급로를 연다.',enemies:['hound','wanderer']},
 {type:'event',name:'버려진 보급함',description:'잠금쇠 너머에서 익숙한 목소리가 들린다.'},
 {type:'elite',name:'장막의 쌍둥이',description:'두 낚시꾼의 연결을 끊는다.',enemies:['angler','angler']},
 {type:'base',name:'바람막이 거점',description:'바람을 막아낸 폐허에 불빛이 머문다.'},
 {type:'battle',name:'뒤틀린 성당 회랑',description:'추적자를 뚫고 성당 안으로 향한다.',enemies:['hunter','hound']},
 {type:'event',name:'금빛 잔해의 제단',description:'빛과 심연이 뒤섞인 제물이 남아 있다.'},
 {type:'elite',name:'이름 없는 의태',description:'여러 겹의 공허 장막 너머를 겨눈다.',enemies:['mimic','hound']},
 {type:'camp',name:'기울어진 종탑 아래',description:'종소리 대신 불꽃의 소리를 듣는다.'},
 {type:'battle',name:'광계의 파편 지대',description:'균열계가 퍼뜨린 빛이 길을 잠식한다.',enemies:['breacher','wanderer']},
 {type:'elite',name:'황야의 사냥',description:'연계 공격을 끊고 사냥꾼을 제압한다.',enemies:['hunter','hunter','hound']},
 {type:'base',name:'마지막 등불의 거점',description:'쓰러진 길 위로 생명의 불꽃을 잇는다.'},
 {type:'battle',name:'하늘 아래 검은 물결',description:'의태와 균열계가 서로의 모습을 훔친다.',enemies:['mimic','breacher']},
 {type:'event',name:'메아리의 거래',description:'돌아갈 수 없는 상인이 값을 제안한다.'},
 {type:'elite',name:'광계와 심연의 경계',description:'장막의 균열을 이용해 돌파한다.',enemies:['breacher','angler','hound']},
 {type:'camp',name:'여명 이전의 야영',description:'마지막 전선을 앞두고 준비한다.'},
 {type:'base',name:'잔불의 전초기지',description:'악몽 영주와 천공의 전선이 앞에 있다.'}
];
// Each event exposes exactly three choices; benefit and cost are both visible before selection.
export const EVENTS=[
 {id:'supply',name:'목소리가 새어 나오는 보급함',text:'뚜껑 아래에서 당신의 이름을 부른다.',choices:[
 {id:'coins',label:'바깥 주머니만 챙긴다',benefit:{kind:'gold',amount:14},cost:{}},
 {id:'gear',label:'깊숙한 장비함을 연다',benefit:{kind:'equipment',elite:false},cost:{hp:12}},
 {id:'refine',label:'메아리 속 전투 기억을 받아들인다',benefit:{kind:'upgrade'},cost:{stress:18}}]},
 {id:'altar',name:'뒤집힌 성상의 제단',text:'서로 다른 빛이 하나의 그림자를 만든다.',choices:[
 {id:'remove',label:'낡은 전투 기억 하나를 내려놓는다',benefit:{kind:'remove'},cost:{}},
 {id:'coins',label:'금빛 잔해를 모두 거둔다',benefit:{kind:'gold',amount:45},cost:{hp:15,curse:1}},
 {id:'refine',label:'검은 불꽃에서 전술 각성을 얻는다',benefit:{kind:'upgrade'},cost:{hp:8,stress:12}}]},
 {id:'trade',name:'얼굴 없는 상인의 제안',text:'그는 모라보다 무거운 대가를 원한다.',choices:[
 {id:'coins',label:'남겨진 잔돈만 줍는다',benefit:{kind:'gold',amount:12},cost:{}},
 {id:'elite',label:'귀한 장비와 그림자를 교환한다',benefit:{kind:'equipment',elite:true},cost:{stress:22,curse:1}},
 {id:'remove',label:'카드 한 장을 태워 달라고 한다',benefit:{kind:'remove'},cost:{hp:6}}]},
 {id:'echo',name:'깨진 거울 속의 자신',text:'거울 속 전투는 이미 끝나 있다.',choices:[
 {id:'refine',label:'짧은 전투 기억을 되짚는다',benefit:{kind:'upgrade'},cost:{stress:8}},
 {id:'gear',label:'거울 속의 장비를 꺼낸다',benefit:{kind:'equipment',elite:false},cost:{curse:1}},
 {id:'coins',label:'거울을 깨고 파편을 챙긴다',benefit:{kind:'gold',amount:35},cost:{hp:10,stress:10}}]}
];
