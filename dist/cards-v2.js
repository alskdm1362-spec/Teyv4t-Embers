/* v0.36 stage 4: card lists from the planning docs (4차 §5·§1, 11-28 전술 각성 분기).
   Coefficients are percentages: damage of ATK, shields of DEF, healing of max HP.
   Every card is data: `ops` run in order when the card is played; branches A-D replace parts of it.
   Branch lines follow the doc: A 안정(수치) / B 자원 / C 변형 / D 빌드. */

const D=(pct,o={})=>({op:'dmg',pct,...o});
const ALL=(pct,o={})=>({op:'dmg',pct,aoe:true,...o});
const SH=(pct,o={})=>({op:'shield',pct,...o});
const op=(name,o={})=>({op:name,...o});

function card(owner,key,name,cost,type,target,art,text,ops,extra={}){
 return {key,owner,name,cost,type,target,art,text,ops,v2:true,keywords:extra.keywords||[],...extra};
}

export const V2_CARDS={};
export const V2_BRANCHES={};
const add=(c,branches)=>{V2_CARDS[c.key]=c;if(branches)V2_BRANCHES[c.key]=branches;};
// A branch is {title,text,...overrides}. Overrides replace the base field (ops, cost, keywords, extras).
const br=(title,text,o={})=>({title,text,...o});

/* ---------------- 로엔 — 서리 파편 버리기 → 추가공격 ---------------- */
add(card('lohen','l_frost','서리 파편',0,'skill','none',9,'버려질 때마다 마지막 대상에게 추가공격 피해 30%를 하고 소멸한다. 손패에 최대 3장.',[],{keywords:['unplayable'],generated:true,frost:true,onDiscard:[D(30,{frost:true})]}));
add(card('lohen','l_strike','정확한 일격',1,'attack','enemy',1,'피해 100%. 서리 파편 1장 생성.',[D(100),op('create',{card:'l_frost',n:1})]),{
 A:br('정확한 일격 · 안정','피해 130%. 서리 파편 1장 생성.',{ops:[D(130),op('create',{card:'l_frost',n:1})]}),
 B:br('정확한 일격 · 자원','피해 100%. 서리 파편 1장 생성. 손패에 서리 파편이 2장 이상이면 1장 드로우.',{ops:[D(100),op('create',{card:'l_frost',n:1}),op('if',{cond:'frostInHand2',ops:[op('draw',{n:1})]})]}),
 C:br('정확한 일격 · 변형','피해 80%. 서리 파편 2장 생성.',{ops:[D(80),op('create',{card:'l_frost',n:2})]}),
 D:br('정확한 일격 · 빌드','피해 100%. 서리 파편 1장 생성. 버려질 때: 마지막 대상에게 피해 120%.',{onDiscard:[D(120)]}),
});
add(card('lohen','l_guard','방어 태세',1,'guard','none',4,'방어력 기반 본인 보호막 200%.',[SH(200)]),{
 A:br('방어 태세 · 안정','방어력 기반 본인 보호막 260%.',{ops:[SH(260)]}),
 B:br('방어 태세 · 자원','방어력 기반 본인 보호막 200%.',{cost:0,keywords:['exhaust']}),
 C:br('방어 태세 · 변형','방어력 기반 본인 보호막 150%. 서리 파편 1장 생성.',{ops:[SH(150),op('create',{card:'l_frost',n:1})]}),
 D:br('방어 태세 · 빌드','방어력 기반 본인 보호막 200%. 보존: 보호막 +100%.',{keywords:['retain'],ops:[SH(200,{retainPct:100})]}),
});
add(card('lohen','l_pierce','집중 관통',2,'attack','enemy',3,'피해 240%.',[D(240)]),{
 A:br('집중 관통 · 안정','피해 300%.',{ops:[D(300)]}),
 B:br('집중 관통 · 자원','피해 170%.',{cost:1,ops:[D(170)]}),
 C:br('집중 관통 · 변형','피해 240%. 대상의 장막을 무시한다.',{ops:[D(240,{pierceWard:true})]}),
 D:br('집중 관통 · 빌드','피해 420%.',{cost:3,keywords:['exhaust'],ops:[D(420)]}),
});
add(card('lohen','l_aim','숨 고르기',0,'skill','none',2,'다음 로엔 공격 피해 +50%.',[op('buffNext',{pct:50})],{keywords:['exhaust']}),{
 A:br('숨 고르기 · 안정','다음 로엔 공격 피해 +70%.',{ops:[op('buffNext',{pct:70})]}),
 B:br('숨 고르기 · 자원','다음 로엔 공격 피해 +50%. 1장 드로우.',{ops:[op('buffNext',{pct:50}),op('draw',{n:1})]}),
 C:br('숨 고르기 · 변형','다음 로엔 공격 피해 +50%. 보존: +100%로 증가.',{keywords:['retain','exhaust'],ops:[op('buffNext',{pct:50,retainPct:50})]}),
 D:br('숨 고르기 · 빌드','이번 턴 서리 파편 추가공격 피해 +20%.',{ops:[op('frostBoost',{pct:20})]}),
});
add(card('lohen','l_chase','추격의 창끝',1,'attack','enemy',5,'피해 100%. 처치 시 행동력 +1.',[D(100),op('ifKill',{ops:[op('ap',{n:1})]})]),{
 A:br('추격의 창끝 · 안정','피해 130%. 처치 시 행동력 +1.',{ops:[D(130),op('ifKill',{ops:[op('ap',{n:1})]})]}),
 B:br('추격의 창끝 · 자원','피해 100%. 처치 시 행동력 +1, 1장 드로우.',{ops:[D(100),op('ifKill',{ops:[op('ap',{n:1}),op('draw',{n:1})]})]}),
 C:br('추격의 창끝 · 변형','피해 100%. 처치 시 행동력 +1, 처치하지 못하면 서리 파편 1장 생성.',{ops:[D(100),op('ifKill',{ops:[op('ap',{n:1})],else:[op('create',{card:'l_frost',n:1})]})]}),
 D:br('추격의 창끝 · 빌드','피해 100%. 이번 전투에서 이 카드를 쓴 횟수당 피해 +25%(최대 5). 처치 시 행동력 +1.',{ops:[D(100,{perUse:25,perMax:5}),op('ifKill',{ops:[op('ap',{n:1})]})]}),
});
add(card('lohen','l_shatter','쇄빙',1,'skill','none',7,'손패의 서리 파편을 전부 버린다. 이번 추가공격 피해 +30%.',[op('shatter',{pct:30})]),{
 A:br('쇄빙 · 안정','손패의 서리 파편을 전부 버린다. 이번 추가공격 피해 +50%.',{ops:[op('shatter',{pct:50})]}),
 B:br('쇄빙 · 자원','손패의 서리 파편을 전부 버린다. 이번 추가공격 피해 +30%.',{cost:0}),
 C:br('쇄빙 · 변형','서리 파편 1장을 먼저 생성한 뒤 전부 버린다. 이번 추가공격 피해 +30%.',{ops:[op('create',{card:'l_frost',n:1}),op('shatter',{pct:30})]}),
 D:br('쇄빙 · 빌드','손패의 서리 파편을 전부 버린다. 이번 추가공격 피해 +30%. 버린 파편 1장당 1장 드로우.',{ops:[op('shatter',{pct:30,drawEach:true})]}),
});
add(card('lohen','l_breach','빙열 돌파',2,'attack','enemy',6,'피해 200%. 서리 파편 3장을 생성한 뒤 즉시 전부 버린다.',[D(200),op('create',{card:'l_frost',n:3,force:true}),op('shatter',{pct:0})],{keywords:['unique','finale']}),{
 A:br('빙열 돌파 · 안정','피해 260%. 서리 파편 3장을 생성한 뒤 즉시 전부 버린다.',{ops:[D(260),op('create',{card:'l_frost',n:3,force:true}),op('shatter',{pct:0})]}),
 B:br('빙열 돌파 · 자원','피해 150%. 서리 파편 3장을 생성한 뒤 즉시 전부 버린다.',{keywords:['unique'],ops:[D(150),op('create',{card:'l_frost',n:3,force:true}),op('shatter',{pct:0})]}),
 C:br('빙열 돌파 · 변형','피해 200%. 서리 파편 3장을 생성한 뒤 즉시 전부 버린다. 이번 추가공격은 적 전체를 노린다.',{ops:[D(200),op('create',{card:'l_frost',n:3,force:true}),op('shatter',{pct:0,aoe:true})]}),
 D:br('빙열 돌파 · 빌드','피해 200%. 무덤의 로엔 공격 카드 1장당 피해 +20%(최대 5). 서리 파편 3장을 생성한 뒤 즉시 전부 버린다.',{ops:[D(200,{perGraveAttack:20,perMax:5}),op('create',{card:'l_frost',n:3,force:true}),op('shatter',{pct:0})]}),
});
add(card('lohen','l_javelin','결빙 투창',1,'skill','none',8,'이번 턴에 버린 카드 수만큼(최대 3) 서리 파편 생성.',[op('javelin',{max:3})]),{
 A:br('결빙 투창 · 안정','이번 턴에 버린 카드 수만큼(최대 4) 서리 파편 생성.',{ops:[op('javelin',{max:4})]}),
 B:br('결빙 투창 · 자원','이번 턴에 버린 카드 수만큼(최대 3) 서리 파편 생성.',{cost:0,keywords:['exhaust']}),
 C:br('결빙 투창 · 변형','이번 턴에 버린 카드 수만큼(최대 3) 서리 파편 생성.',{keywords:['retain']}),
 D:br('결빙 투창 · 빌드','이번 턴에 버린 카드 수만큼(최대 3) 서리 파편을 생성하고, 그 절반만큼 드로우.',{ops:[op('javelin',{max:3,drawHalf:true})]}),
});

/* ---------------- 두린 — 서브어태커 · 광역 (패시브 협공) ---------------- */
add(card('durin','d_resonance','타다 남은 불티',0,'attack','all',9,'전체 피해 30%. 균열 1.',[ALL(30,{crack:1})],{keywords:['exhaust','evaporate'],generated:true}));
add(card('durin','d_strike','용의 발톱',1,'attack','enemy',1,'피해 100%.',[D(100)]),{
 A:br('용의 발톱 · 안정','피해 130%.',{ops:[D(130)]}),
 B:br('용의 발톱 · 자원','피해 100%. 처치 시 행동력 +1.',{ops:[D(100),op('ifKill',{ops:[op('ap',{n:1})]})]}),
 C:br('용의 발톱 · 변형','전체 피해 60%.',{target:'all',ops:[ALL(60)]}),
 D:br('용의 발톱 · 빌드','피해 100%. 균열 대상이면 피해 +60%.',{ops:[D(100,{ifCrack:60})]}),
});
add(card('durin','d_guard','비늘의 수호',1,'guard','none',4,'방어력 기반 본인 보호막 200%.',[SH(200)]),{
 A:br('비늘의 수호 · 안정','방어력 기반 본인 보호막 260%.',{ops:[SH(260)]}),
 B:br('비늘의 수호 · 자원','방어력 기반 본인 보호막 200%. 다음 카드 비용 -1.',{ops:[SH(200),op('costNext',{n:1,count:1})]}),
 C:br('비늘의 수호 · 변형','방어력 기반 본인 보호막 200%.',{cost:0,keywords:['exhaust']}),
 D:br('비늘의 수호 · 빌드','방어력 기반 본인 보호막 200%. 이번 턴 협공 확률 +25%.',{ops:[SH(200),op('assistBoost',{chance:.25})]}),
});
add(card('durin','d_wave','흑염의 날개',2,'attack','all',3,'전체 피해 70%.',[ALL(70)]),{
 A:br('흑염의 날개 · 안정','전체 피해 95%.',{ops:[ALL(95)]}),
 B:br('흑염의 날개 · 자원','전체 피해 70%. 행동력 1 환급.',{ops:[ALL(70),op('ap',{n:1})]}),
 C:br('흑염의 날개 · 변형','전체 피해 70%. 균열 1.',{ops:[ALL(70,{crack:1})]}),
 D:br('흑염의 날개 · 빌드','전체 피해 160%.',{cost:3,keywords:['exhaust'],ops:[ALL(160)]}),
});
add(card('durin','d_charge','용의 숨결',0,'skill','none',2,'다음 두린 공격 피해 +50%.',[op('buffNext',{pct:50})],{keywords:['exhaust']}),{
 A:br('용의 숨결 · 안정','다음 두린 공격 피해 +70%.',{ops:[op('buffNext',{pct:70})]}),
 B:br('용의 숨결 · 자원','다음 두린 공격 피해 +50%. 1장 드로우.',{ops:[op('buffNext',{pct:50}),op('draw',{n:1})]}),
 C:br('용의 숨결 · 변형','다음 두린 공격 피해 +50%. 「타다 남은 불티」 1장 생성.',{ops:[op('buffNext',{pct:50}),op('create',{card:'d_resonance',n:1})]}),
 D:br('용의 숨결 · 빌드','이번 턴 협공 상한 +1.',{ops:[op('assistBoost',{cap:1})]}),
});
add(card('durin','d_cinder','잿빛 소나기',1,'attack','all',5,'전체 피해 40%. 보존: 피해 +40%.',[ALL(40,{retainPct:40})],{keywords:['retain']}),{
 A:br('잿빛 소나기 · 안정','전체 피해 55%. 보존: 피해 +40%.',{ops:[ALL(55,{retainPct:40})]}),
 B:br('잿빛 소나기 · 자원','전체 피해 40%. 보존: 피해 +40%, 비용 0.',{costRule:'retained0'}),
 C:br('잿빛 소나기 · 변형','전체 피해 40%. 균열 1. 보존: 피해 +40%.',{ops:[ALL(40,{retainPct:40,crack:1})]}),
 D:br('잿빛 소나기 · 빌드','전체 피해 40%. 보존한 턴 수만큼 피해 +40%(최대 3).',{ops:[ALL(40,{perRetain:40,perMax:3})]}),
});
add(card('durin','d_furnace','용광로의 맥동',1,'attack','all',6,'전체 피해 30%. 다음 카드 비용 -1.',[ALL(30),op('costNext',{n:1,count:1})]),{
 A:br('용광로의 맥동 · 안정','전체 피해 45%. 다음 카드 비용 -1.',{ops:[ALL(45),op('costNext',{n:1,count:1})]}),
 B:br('용광로의 맥동 · 자원','전체 피해 30%. 다음 2장 비용 -1.',{ops:[ALL(30),op('costNext',{n:1,count:2})]}),
 C:br('용광로의 맥동 · 변형','지속: 턴 시작 시 다음 카드 비용 -1.',{type:'skill',target:'none',keywords:['unique'],ops:[op('persist',{ops:[op('costNext',{n:1,count:1})]})]}),
 D:br('용광로의 맥동 · 빌드','전체 피해 30%. 다음 3코스트 이상 카드 피해 +50%.',{ops:[ALL(30),op('bigNext',{pct:50})]}),
});
add(card('durin','d_comet','낙성의 불길',3,'attack','all',7,'전체 피해 150%. 행동력 1 환급. 「타다 남은 불티」 1장 생성.',[ALL(150),op('ap',{n:1}),op('create',{card:'d_resonance',n:1})],{keywords:['unique']}),{
 A:br('낙성의 불길 · 안정','전체 피해 190%. 행동력 1 환급. 「타다 남은 불티」 1장 생성.',{ops:[ALL(190),op('ap',{n:1}),op('create',{card:'d_resonance',n:1})]}),
 B:br('낙성의 불길 · 자원','전체 피해 150%. 행동력 2 환급. 「타다 남은 불티」 1장 생성.',{ops:[ALL(150),op('ap',{n:2}),op('create',{card:'d_resonance',n:1})]}),
 C:br('낙성의 불길 · 변형','전체 피해 110%. 「타다 남은 불티」 1장 생성.',{cost:2,ops:[ALL(110),op('create',{card:'d_resonance',n:1})]}),
 D:br('낙성의 불길 · 빌드','지속: 턴 시작 시 전체 피해 60%. 대신 두린 공격 카드를 쓸 수 없다.',{type:'skill',target:'none',ops:[op('persist',{ops:[ALL(60)],lock:'durinAttack'})]}),
});
add(card('durin','d_hand','공명하는 손',1,'attack','all',8,'전체 피해 35%. 연계: 동료가 공격 카드를 쓰면 전체 피해 35% (턴당 1회).',[ALL(35)],{keywords:['chain'],chain:{on:'attack',ops:[ALL(35)],perTurn:1}}),{
 A:br('공명하는 손 · 안정','전체 피해 50%. 연계: 전체 피해 50% (턴당 1회).',{ops:[ALL(50)],chain:{on:'attack',ops:[ALL(50)],perTurn:1}}),
 B:br('공명하는 손 · 자원','전체 피해 35%. 연계: 전체 피해 35%, 1장 드로우 (턴당 1회).',{chain:{on:'attack',ops:[ALL(35),op('draw',{n:1})],perTurn:1}}),
 C:br('공명하는 손 · 변형','전체 피해 35%. 연계: 전체 피해 35% (턴당 2회).',{chain:{on:'attack',ops:[ALL(35)],perTurn:2}}),
 D:br('공명하는 손 · 빌드','전체 피해 35%. 연계: 전체 피해 35%, 발동할 때마다 다음 발동 +20%(전투 중 최대 5) (턴당 1회).',{chain:{on:'attack',ops:[ALL(35,{chainGrow:20,perMax:5})],perTurn:1}}),
});

/* ---------------- 야호다 — 행동력 중심 ---------------- */
add(card('jahoda','j_spring','여분의 태엽',0,'skill','none',8,'행동력 +1.',[op('ap',{n:1})],{keywords:['exhaust','evaporate'],generated:true}));
add(card('jahoda','j_strike','기습',1,'attack','enemy',1,'피해 100%.',[D(100)]),{
 A:br('기습 · 안정','피해 130%.',{ops:[D(130)]}),
 B:br('기습 · 자원','피해 100%. 1장 드로우.',{ops:[D(100),op('draw',{n:1})]}),
 C:br('기습 · 변형','피해 100%. 균열 1.',{ops:[D(100,{crack:1})]}),
 D:br('기습 · 빌드','피해 100%. 이번 턴 행동력을 회복한 적이 있으면 비용 0.',{costRule:'apRestored0'}),
});
add(card('jahoda','j_wind','태엽 감기',0,'skill','none',3,'행동력 +1.',[op('ap',{n:1})],{keywords:['exhaust']}),{
 A:br('태엽 감기 · 안정','행동력 +1. 1장 드로우.',{ops:[op('ap',{n:1}),op('draw',{n:1})]}),
 B:br('태엽 감기 · 자원','행동력 +1 (턴당 1회).',{keywords:[],perTurnUse:1}),
 C:br('태엽 감기 · 변형','행동력 +1.',{keywords:['opening','exhaust']}),
 D:br('태엽 감기 · 빌드','행동력 +2. 다음 턴 행동력 -1.',{ops:[op('ap',{n:2}),op('apNext',{n:-1})]}),
});
add(card('jahoda','j_cache','은닉 보급품',1,'guard','none',6,'방어력 기반 본인 보호막 150%. 손패에 「여분의 태엽」 생성 (전투당 2회).',[SH(150),op('create',{card:'j_spring',n:1,battleCap:2})]),{
 A:br('은닉 보급품 · 안정','방어력 기반 본인 보호막 200%. 「여분의 태엽」 생성 (전투당 2회).',{ops:[SH(200),op('create',{card:'j_spring',n:1,battleCap:2})]}),
 B:br('은닉 보급품 · 자원','방어력 기반 본인 보호막 150%. 「여분의 태엽」 생성 (전투당 3회).',{ops:[SH(150),op('create',{card:'j_spring',n:1,battleCap:3})]}),
 C:br('은닉 보급품 · 변형','방어력 기반 본인 보호막 150%. 보존이 붙은 「여분의 태엽」 생성 (전투당 2회).',{ops:[SH(150),op('create',{card:'j_spring',n:1,battleCap:2,retain:true})]}),
 D:br('은닉 보급품 · 빌드','방어력 기반 본인 보호막 150%, 손패 1장당 +20%. 「여분의 태엽」 생성 (전투당 2회).',{ops:[SH(150,{perHand:20}),op('create',{card:'j_spring',n:1,battleCap:2})]}),
});
add(card('jahoda','j_energy','행동 지원',1,'skill','none',5,'행동력 +2.',[op('ap',{n:2})],{keywords:['initiative','exhaust']}),{
 A:br('행동 지원 · 안정','행동력 +3.',{ops:[op('ap',{n:3})]}),
 B:br('행동 지원 · 자원','행동력 +2. 1장 드로우.',{ops:[op('ap',{n:2}),op('draw',{n:1})]}),
 C:br('행동 지원 · 변형','행동력 +2.',{keywords:['opening','exhaust']}),
 D:br('행동 지원 · 빌드','행동력 +2. 이번 턴 다음 카드 비용 -1.',{ops:[op('ap',{n:2}),op('costNext',{n:1,count:1})]}),
});
add(card('jahoda','j_reserve','예비 동력',1,'skill','none',2,'다음 턴 행동력 +1. 보존: +2.',[op('apNext',{n:1,retainN:1})],{keywords:['retain']}),{
 A:br('예비 동력 · 안정','다음 턴 행동력 +2. 보존: +3.',{ops:[op('apNext',{n:2,retainN:1})]}),
 B:br('예비 동력 · 자원','다음 턴 행동력 +1. 보존: +2.',{cost:0}),
 C:br('예비 동력 · 변형','다음 턴 행동력 +1, 1장 드로우 추가. 보존: 행동력 +2.',{ops:[op('apNext',{n:1,retainN:1}),op('drawNext',{n:1})]}),
 D:br('예비 동력 · 빌드','지속: 매 턴 처음 0코스트 카드를 쓰면 행동력 +1.',{keywords:['unique'],ops:[op('persist',{watch:'firstZero'})]}),
});
add(card('jahoda','j_draw','재정비',0,'skill','none',7,'2장 뽑고 1장 버린다.',[op('draw',{n:2}),op('discard',{n:1})],{keywords:['exhaust']}),{
 A:br('재정비 · 안정','3장 뽑고 1장 버린다.',{ops:[op('draw',{n:3}),op('discard',{n:1})]}),
 B:br('재정비 · 자원','2장 뽑는다.',{ops:[op('draw',{n:2})]}),
 C:br('재정비 · 변형','2장 뽑고 1장 버린다.',{cost:1,keywords:[]}),
 D:br('재정비 · 빌드','2장 뽑고 1장 버린다. 버린 카드가 동료 카드면 행동력 +1.',{ops:[op('draw',{n:2}),op('discard',{n:1,allyAp:1})]}),
});
add(card('jahoda','j_dart','독 묻은 다트',1,'attack','enemy',4,'피해 70%. 균열 2.',[D(70,{crack:2})]),{
 A:br('독 묻은 다트 · 안정','피해 100%. 균열 2.',{ops:[D(100,{crack:2})]}),
 B:br('독 묻은 다트 · 자원','피해 70%. 균열 3.',{ops:[D(70,{crack:3})]}),
 C:br('독 묻은 다트 · 변형','피해 40%. 균열 1.',{cost:0,ops:[D(40,{crack:1})]}),
 D:br('독 묻은 다트 · 빌드','피해 70%. 균열 2. 균열 5인 적에게 피해 2배.',{ops:[D(70,{crack:2,crackMaxDouble:true})]}),
});

/* ---------------- 일루가 — 파티 보호막 · 등불 ---------------- */
add(card('illuga','i_strike','등불 휘두르기',1,'attack','enemy',3,'피해 90%.',[D(90)]),{
 A:br('등불 휘두르기 · 안정','피해 120%.',{ops:[D(120)]}),
 B:br('등불 휘두르기 · 자원','피해 90%. 방어력 기반 본인 보호막 80%.',{ops:[D(90),SH(80)]}),
 C:br('등불 휘두르기 · 변형','방어력 기반 피해 130%.',{ops:[D(130,{basis:'def'})]}),
 D:br('등불 휘두르기 · 빌드','피해 90%. 본인 보호막이 있으면 피해 +60%.',{ops:[D(90,{ifShield:60})]}),
});
add(card('illuga','i_guard','등불 밝히기',1,'guard','none',6,'방어력 기반 파티 전원 보호막 70%.',[SH(70,{who:'party'})]),{
 A:br('등불 밝히기 · 안정','방어력 기반 파티 전원 보호막 95%.',{ops:[SH(95,{who:'party'})]}),
 B:br('등불 밝히기 · 자원','방어력 기반 파티 전원 보호막 50%.',{cost:0,keywords:['exhaust'],ops:[SH(50,{who:'party'})]}),
 C:br('등불 밝히기 · 변형','방어력 기반 파티 전원 보호막 70%. 상흔이 가장 높은 동료는 2배.',{ops:[SH(70,{who:'party',scarDouble:true})]}),
 D:br('등불 밝히기 · 빌드','방어력 기반 파티 전원 보호막 70%, 손패 1장당 +8%.',{ops:[SH(70,{who:'party',perHand:8})]}),
});
add(card('illuga','i_counter','되비추는 빛',2,'guard','none',4,'방어력 기반 본인 보호막 150%. 되비춤(방어력 기반 피해 100%).',[SH(150),op('reflect',{pct:100})]),{
 A:br('되비추는 빛 · 안정','방어력 기반 본인 보호막 200%. 되비춤(방어력 기반 피해 130%).',{ops:[SH(200),op('reflect',{pct:130})]}),
 B:br('되비추는 빛 · 자원','방어력 기반 본인 보호막 100%. 되비춤(방어력 기반 피해 100%).',{cost:1,ops:[SH(100),op('reflect',{pct:100})]}),
 C:br('되비추는 빛 · 변형','방어력 기반 본인 보호막 150%. 되비춤(방어력 기반 피해 100%)이 적 전체를 노린다.',{ops:[SH(150),op('reflect',{pct:100,aoe:true})]}),
 D:br('되비추는 빛 · 빌드','방어력 기반 본인 보호막 150%. 되비춤(방어력 기반 피해 100%). 되비춤 발동 시 행동력 +1 (턴당 1회).',{ops:[SH(150),op('reflect',{pct:100,ap:1})]}),
});
add(card('illuga','i_cover','길잡이 불빛',0,'skill','ally',2,'선택한 동료가 다음에 받을 정신부담 10 감소, 방어력 기반 보호막 50%.',[op('cover',{stress:10,shieldPct:50})],{keywords:['exhaust']}),{
 A:br('길잡이 불빛 · 안정','선택한 동료가 다음에 받을 정신부담 10 감소, 방어력 기반 보호막 100%.',{ops:[op('cover',{stress:10,shieldPct:100})]}),
 B:br('길잡이 불빛 · 자원','선택한 동료가 다음에 받을 정신부담 10 감소, 보호막 50%. 1장 드로우.',{ops:[op('cover',{stress:10,shieldPct:50}),op('draw',{n:1})]}),
 C:br('길잡이 불빛 · 변형','파티 전원이 다음에 받을 정신부담 10 감소, 보호막 50%.',{cost:1,target:'none',ops:[op('cover',{stress:10,shieldPct:50,all:true})]}),
 D:br('길잡이 불빛 · 빌드','선택한 동료가 다음에 받을 정신부담 10 감소, 보호막 50%. 그 동료의 다음 공격 피해 +40%.',{ops:[op('cover',{stress:10,shieldPct:50,buff:40})]}),
});
add(card('illuga','i_lantern','등불의 온기',1,'skill','none',1,'최대 체력 기반 회복 6%. 상흔도 같은 양 감소.',[op('heal',{pct:6})]),{
 A:br('등불의 온기 · 안정','최대 체력 기반 회복 9%. 상흔도 같은 양 감소.',{ops:[op('heal',{pct:9})]}),
 B:br('등불의 온기 · 자원','최대 체력 기반 회복 6%. 상흔도 같은 양 감소.',{cost:0,keywords:['exhaust']}),
 C:br('등불의 온기 · 변형','최대 체력 기반 회복 6%. 파티 전원의 상흔이 같은 양 감소.',{ops:[op('heal',{pct:6,scarAll:true})]}),
 D:br('등불의 온기 · 빌드','최대 체력 기반 회복 6%. 넘친 회복량만큼 본인 보호막.',{ops:[op('heal',{pct:6,overShield:true})]}),
});
add(card('illuga','i_riposte','빛의 응수',1,'attack','enemy',5,'본인 보호막을 소모해 그 50%만큼 피해.',[D(50,{basis:'shield'})]),{
 A:br('빛의 응수 · 안정','본인 보호막을 소모해 그 70%만큼 피해.',{ops:[D(70,{basis:'shield'})]}),
 B:br('빛의 응수 · 자원','본인 보호막의 70%를 소모해 그 50%만큼 피해. 보호막 30%는 남는다.',{ops:[D(50,{basis:'shield',keepShield:.3})]}),
 C:br('빛의 응수 · 변형','본인 보호막을 소모해 그 50%만큼 전체 피해.',{target:'all',ops:[D(50,{basis:'shield',aoe:true})]}),
 D:br('빛의 응수 · 빌드','본인 보호막을 소모해 그 50%만큼 피해. 보존: 피해 +50%.',{keywords:['retain'],ops:[D(50,{basis:'shield',retainPct:50})]}),
});
add(card('illuga','i_watch','꺼지지 않는 등대',2,'guard','none',7,'방어력 기반 파티 전원 보호막 180%.',[SH(180,{who:'party'})],{keywords:['unique','finale']}),{
 A:br('꺼지지 않는 등대 · 안정','방어력 기반 파티 전원 보호막 230%.',{ops:[SH(230,{who:'party'})]}),
 B:br('꺼지지 않는 등대 · 자원','방어력 기반 파티 전원 보호막 120%.',{keywords:['unique'],ops:[SH(120,{who:'party'})]}),
 C:br('꺼지지 않는 등대 · 변형','방어력 기반 파티 전원 보호막 180%. 이번 턴 받는 정신부담 무효.',{ops:[SH(180,{who:'party'}),op('stressImmune')]}),
 D:br('꺼지지 않는 등대 · 빌드','지속: 턴 시작 시 방어력 기반 파티 전원 보호막 50%.',{keywords:['unique'],ops:[op('persist',{ops:[SH(50,{who:'party'})]})]}),
});

/* ---------------- 키니치 — 모드 전환 연타 (추적 ↔ 분쇄) ---------------- */
const M=(pct,hits,o={})=>({op:'dmg',pct,hits,multi:true,...o});
add(card('kinich','k_ajaw','아쥬의 참견',0,'skill','none',1,'추적흔 +2.',[op('track',{n:2})],{keywords:['exhaust','evaporate'],generated:true}));
add(card('kinich','k_shot','추적 사격',1,'attack','enemy',10,'「추적」 피해 35% × 3회. 타당 추적흔 1.',[M(35,3)],{mode:'chase'}),{
 A:br('추적 사격 · 안정','「추적」 피해 35% × 4회. 타당 추적흔 1.',{ops:[M(35,4)]}),
 B:br('추적 사격 · 자원','「추적」 피해 35% × 3회. 타당 추적흔 1. 추적흔 5 이상이면 1장 드로우.',{ops:[M(35,3),op('if',{cond:'track5',ops:[op('draw',{n:1})]})]}),
 C:br('추적 사격 · 변형','「추적」 피해 50% × 2회. 타당 추적흔 2.',{ops:[M(50,2,{trackPer:2})]}),
 D:br('추적 사격 · 빌드','「추적」 피해 20% × 6회. 타당 추적흔 1.',{ops:[M(20,6)]}),
});
add(card('kinich','k_cannon','비늘 포격',2,'attack','enemy',8,'「분쇄」 피해 45% × 추적흔 수. 추적흔을 소모한다.',[D(0,{perTrack:45,trackUse:'all'})],{mode:'crush'}),{
 A:br('비늘 포격 · 안정','「분쇄」 피해 55% × 추적흔 수. 추적흔을 소모한다.',{ops:[D(0,{perTrack:55,trackUse:'all'})]}),
 B:br('비늘 포격 · 자원','「분쇄」 피해 45% × 추적흔 수. 추적흔을 절반만 소모한다.',{ops:[D(0,{perTrack:45,trackUse:'half'})]}),
 C:br('비늘 포격 · 변형','「분쇄」 전체 피해 30% × 추적흔 수. 추적흔을 소모한다.',{target:'all',ops:[ALL(0,{perTrack:30,trackUse:'all'})]}),
 D:br('비늘 포격 · 빌드','「분쇄」 피해 70% × 추적흔 수. 추적흔을 소모한다.',{cost:3,ops:[D(0,{perTrack:70,trackUse:'all'})]}),
});
add(card('kinich','k_dodge','회피 기동',1,'guard','none',9,'방어력 기반 본인 보호막 200%.',[SH(200)]),{
 A:br('회피 기동 · 안정','방어력 기반 본인 보호막 260%.',{ops:[SH(260)]}),
 B:br('회피 기동 · 자원','방어력 기반 본인 보호막 200%.',{cost:0,keywords:['exhaust']}),
 C:br('회피 기동 · 변형','방어력 기반 본인 보호막 200%. 추적흔 +2.',{ops:[SH(200),op('track',{n:2})]}),
 D:br('회피 기동 · 빌드','방어력 기반 본인 보호막 200%. 이번 턴 모드 전환 1회 추가.',{ops:[SH(200),op('modeExtra',{n:1})]}),
});
add(card('kinich','k_loop','고리 선회',1,'attack','enemy',2,'「추적」 피해 35% × 2회. 1장 드로우.',[M(35,2),op('draw',{n:1})],{mode:'chase'}),{
 A:br('고리 선회 · 안정','「추적」 피해 35% × 3회. 1장 드로우.',{ops:[M(35,3),op('draw',{n:1})]}),
 B:br('고리 선회 · 자원','「추적」 피해 35% × 2회. 2장 드로우.',{ops:[M(35,2),op('draw',{n:2})]}),
 C:br('고리 선회 · 변형','「추적」 무작위 적에게 피해 35% × 4회. 1장 드로우.',{target:'none',ops:[M(35,4,{random:true}),op('draw',{n:1})]}),
 D:br('고리 선회 · 빌드','「추적」 피해 35% × 2회. 1장 드로우. 사용 후 모드가 자동으로 전환된다.',{ops:[M(35,2),op('draw',{n:1}),op('autoSwitch')]}),
});
add(card('kinich','k_dash','정글 질주',0,'attack','enemy',5,'피해 25% × 2회.',[M(25,2)],{keywords:['exhaust'],mode:'chase'}),{
 A:br('정글 질주 · 안정','피해 35% × 2회.',{ops:[M(35,2)]}),
 B:br('정글 질주 · 자원','피해 25% × 2회. 1장 드로우.',{ops:[M(25,2),op('draw',{n:1})]}),
 C:br('정글 질주 · 변형','피해 25% × 2회.',{cost:1,keywords:[]}),
 D:br('정글 질주 · 빌드','피해 25% × 2회.',{keywords:['recall']}),
});
add(card('kinich','k_fist','맹렬한 주먹',1,'attack','enemy',4,'「분쇄」 피해 130%. 추적흔 5 이상이면 비용 0.',[D(130)],{mode:'crush',costRule:'track5'}),{
 A:br('맹렬한 주먹 · 안정','「분쇄」 피해 170%. 추적흔 5 이상이면 비용 0.',{ops:[D(170)]}),
 B:br('맹렬한 주먹 · 자원','「분쇄」 피해 130%. 추적흔 3 이상이면 비용 0.',{costRule:'track3'}),
 C:br('맹렬한 주먹 · 변형','「분쇄」 피해 130%. 균열 2. 추적흔 5 이상이면 비용 0.',{ops:[D(130,{crack:2})]}),
 D:br('맹렬한 주먹 · 빌드','「분쇄」 피해 130%, 추적흔 1당 +10%(소모하지 않음). 추적흔 5 이상이면 비용 0.',{ops:[D(130,{perTrackBonus:10})]}),
});
add(card('kinich','k_instinct','야수의 직감',1,'skill','none',6,'다음 연타 카드 타수 +2. 보존: +3.',[op('bonusHits',{n:2,retainN:1})],{keywords:['retain']}),{
 A:br('야수의 직감 · 안정','다음 연타 카드 타수 +3. 보존: +4.',{ops:[op('bonusHits',{n:3,retainN:1})]}),
 B:br('야수의 직감 · 자원','다음 연타 카드 타수 +2. 보존: +3.',{cost:0}),
 C:br('야수의 직감 · 변형','이번 턴 모든 연타 카드 타수 +1.',{ops:[op('multiPlus',{n:1})]}),
 D:br('야수의 직감 · 빌드','다음 분쇄 카드 피해 +80%.',{ops:[op('crushNext',{pct:80})]}),
});
add(card('kinich','k_blessing','대령왕의 가호',2,'skill','none',7,'이번 턴 두 모드의 파트너 지원을 동시에 받는다.',[op('bothModes')],{keywords:['unique']}),{
 A:br('대령왕의 가호 · 안정','이번 턴 두 모드의 파트너 지원을 동시에 받는다. 키니치 피해 +20%.',{ops:[op('bothModes'),op('turnDmg',{pct:20})]}),
 B:br('대령왕의 가호 · 자원','이번 턴 두 모드의 파트너 지원을 동시에 받는다.',{cost:1}),
 C:br('대령왕의 가호 · 변형','이번 턴 두 모드의 파트너 지원을 동시에 받는다.',{keywords:['unique','opening']}),
 D:br('대령왕의 가호 · 빌드','지속: 턴 시작 시 추적흔 +2.',{ops:[op('persist',{ops:[op('track',{n:2})]})]}),
});
add(card('kinich','k_hook','갈고리 도약',0,'skill','none',3,'1장 드로우. 이번 턴 모드 전환 1회 추가.',[op('draw',{n:1}),op('modeExtra',{n:1})],{keywords:['exhaust']}),{
 A:br('갈고리 도약 · 안정','2장 드로우. 이번 턴 모드 전환 1회 추가.',{ops:[op('draw',{n:2}),op('modeExtra',{n:1})]}),
 B:br('갈고리 도약 · 자원','1장 드로우. 이번 턴 모드 전환 1회 추가 (턴당 1회).',{keywords:[],perTurnUse:1}),
 C:br('갈고리 도약 · 변형','1장 드로우. 이번 턴 모드 전환 1회 추가. 추적흔 +2.',{ops:[op('draw',{n:1}),op('modeExtra',{n:1}),op('track',{n:2})]}),
 D:br('갈고리 도약 · 빌드','1장 드로우. 이번 턴 모드 전환 1회 추가. 다음 카드 비용 -1.',{ops:[op('draw',{n:1}),op('modeExtra',{n:1}),op('costNext',{n:1,count:1})]}),
});

/* ---------------- 리니 — 드로우 중심 ---------------- */
add(card('lyney','y_tophat','마술 모자',0,'skill','none',2,'1장 드로우.',[op('draw',{n:1}),op('hatUsed')],{keywords:['exhaust'],generated:true}));
add(card('lyney','y_arrow','소품 화살',1,'attack','enemy',3,'피해 90%.',[D(90)]),{
 A:br('소품 화살 · 안정','피해 120%.',{ops:[D(120)]}),
 B:br('소품 화살 · 자원','피해 90%. 1장 드로우.',{ops:[D(90),op('draw',{n:1})]}),
 C:br('소품 화살 · 변형','피해 90%. 「마술 모자」 1장 생성.',{ops:[D(90),op('create',{card:'y_tophat',n:1})]}),
 D:br('소품 화살 · 빌드','피해 90%, 손패 1장당 +10%.',{ops:[D(90,{perHand:10})]}),
});
add(card('lyney','y_trick','카드 마술',1,'skill','none',6,'2장 드로우.',[op('draw',{n:2})]),{
 A:br('카드 마술 · 안정','3장 드로우.',{ops:[op('draw',{n:3})]}),
 B:br('카드 마술 · 자원','1장 드로우.',{cost:0,ops:[op('draw',{n:1})]}),
 C:br('카드 마술 · 변형','뽑을 카드 더미에서 1장을 골라 손으로 가져온다.',{ops:[op('pickDraw',{n:1})]}),
 D:br('카드 마술 · 빌드','2장 드로우. 그중 생성 카드가 있으면 1장 더.',{ops:[op('draw',{n:2,bonusIfGenerated:1})]}),
});
add(card('lyney','y_hat','모자 인사',1,'guard','none',8,'방어력 기반 본인 보호막 150%. 1장 드로우.',[SH(150),op('draw',{n:1})]),{
 A:br('모자 인사 · 안정','방어력 기반 본인 보호막 200%. 1장 드로우.',{ops:[SH(200),op('draw',{n:1})]}),
 B:br('모자 인사 · 자원','방어력 기반 본인 보호막 150%. 2장 드로우.',{ops:[SH(150),op('draw',{n:2})]}),
 C:br('모자 인사 · 변형','방어력 기반 본인 보호막 150%. 1장 드로우. 「마술 모자」 1장 생성.',{ops:[SH(150),op('draw',{n:1}),op('create',{card:'y_tophat',n:1})]}),
 D:br('모자 인사 · 빌드','방어력 기반 본인 보호막 150%, 손패 1장당 +15%. 1장 드로우.',{ops:[SH(150,{perHand:15}),op('draw',{n:1})]}),
});
add(card('lyney','y_cane','지팡이 묘기',1,'attack','enemy',4,'피해 80%. 손패에 「마술 모자」 생성.',[D(80),op('create',{card:'y_tophat',n:1})]),{
 A:br('지팡이 묘기 · 안정','피해 110%. 손패에 「마술 모자」 생성.',{ops:[D(110),op('create',{card:'y_tophat',n:1})]}),
 B:br('지팡이 묘기 · 자원','피해 80%. 「마술 모자」 2장 생성.',{ops:[D(80),op('create',{card:'y_tophat',n:2})]}),
 C:br('지팡이 묘기 · 변형','전체 피해 50%. 손패에 「마술 모자」 생성.',{target:'all',ops:[ALL(50),op('create',{card:'y_tophat',n:1})]}),
 D:br('지팡이 묘기 · 빌드','피해 80%. 「마술 모자」 생성. 이번 턴 「마술 모자」를 쓸 때마다 무작위 적에게 피해 30%.',{ops:[D(80),op('create',{card:'y_tophat',n:1}),op('hatProc',{pct:30})]}),
});
add(card('lyney','y_entrance','깜짝 등장',1,'skill','none',5,'3장 뽑고 1장 버린다.',[op('draw',{n:3}),op('discard',{n:1})]),{
 A:br('깜짝 등장 · 안정','4장 뽑고 1장 버린다.',{ops:[op('draw',{n:4}),op('discard',{n:1})]}),
 B:br('깜짝 등장 · 자원','2장 뽑고 1장 버린다.',{cost:0,ops:[op('draw',{n:2}),op('discard',{n:1})]}),
 C:br('깜짝 등장 · 변형','3장 뽑고 1장 버린다. 동료 카드를 버리면 행동력 +1.',{ops:[op('draw',{n:3}),op('discard',{n:1,allyAp:1})]}),
 D:br('깜짝 등장 · 빌드','3장 뽑고 1장을 뽑을 카드 더미 맨 위로 올린다.',{ops:[op('draw',{n:3}),op('discard',{n:1,toTop:true})]}),
});
add(card('lyney','y_show','대마술 · 불꽃 쇼',2,'attack','all',7,'전체 피해 50%, 손패 1장당 +8%.',[ALL(50,{perHand:8})]),{
 A:br('불꽃 쇼 · 안정','전체 피해 70%, 손패 1장당 +8%.',{ops:[ALL(70,{perHand:8})]}),
 B:br('불꽃 쇼 · 자원','전체 피해 50%, 손패 1장당 +12%.',{ops:[ALL(50,{perHand:12})]}),
 C:br('불꽃 쇼 · 변형','전체 피해 30%, 손패 1장당 +8%.',{cost:1,ops:[ALL(30,{perHand:8})]}),
 D:br('불꽃 쇼 · 빌드','전체 피해 50%, 손패 1장당 +8%, 이번 턴 뽑은 카드 1장당 +10%.',{ops:[ALL(50,{perHand:8,perDrawn:10})]}),
});
add(card('lyney','y_curtain','커튼콜',2,'attack','all',9,'손패를 전부 버리고 버린 장수당 전체 피해 25%.',[op('discardHand',{perPct:25})],{keywords:['unique']}),{
 A:br('커튼콜 · 안정','손패를 전부 버리고 버린 장수당 전체 피해 32%.',{ops:[op('discardHand',{perPct:32})]}),
 B:br('커튼콜 · 자원','손패를 전부 버리고 버린 장수당 전체 피해 25%. 그 뒤 2장 드로우.',{ops:[op('discardHand',{perPct:25,thenDraw:2})]}),
 C:br('커튼콜 · 변형','버리지 않고 손패 1장당 전체 피해 12%.',{ops:[op('discardHand',{perPct:12.5,keep:true})]}),
 D:br('커튼콜 · 빌드','손패를 전부 버리고 버린 장수당 전체 피해 45%.',{keywords:['unique','finale'],ops:[op('discardHand',{perPct:45})]}),
});
add(card('lyney','y_gift','깜짝 선물',0,'skill','none',1,'행동력 +1.',[op('ap',{n:1})],{keywords:['unique','exhaust']}),{
 A:br('깜짝 선물 · 안정','행동력 +1. 1장 드로우.',{ops:[op('ap',{n:1}),op('draw',{n:1})]}),
 B:br('깜짝 선물 · 자원','행동력 +2.',{ops:[op('ap',{n:2})]}),
 C:br('깜짝 선물 · 변형','행동력 +1.',{keywords:['unique','opening','exhaust']}),
 D:br('깜짝 선물 · 빌드','행동력 +1.',{keywords:['unique','recall']}),
});
add(card('lyney','y_shuffle','셔플',0,'skill','none',10,'손패 최대 3장을 버리고 그만큼 드로우.',[op('discard',{n:3,optional:true,thenDrawEqual:true})],{keywords:['exhaust']}),{
 A:br('셔플 · 안정','손패 최대 4장을 버리고 그만큼 드로우.',{ops:[op('discard',{n:4,optional:true,thenDrawEqual:true})]}),
 B:br('셔플 · 자원','손패 최대 3장을 버리고 버린 수 +1장 드로우.',{ops:[op('discard',{n:3,optional:true,thenDrawEqual:true,extraDraw:1})]}),
 C:br('셔플 · 변형','손패 전부를 덱에 섞고 같은 수만큼 드로우. 사용 불가 카드는 버린다.',{ops:[op('shuffleHand')]}),
 D:br('셔플 · 빌드','손패 최대 3장을 버리고 그만큼 드로우. 3장을 버렸으면 행동력 +1.',{ops:[op('discard',{n:3,optional:true,thenDrawEqual:true,apAt:3})]}),
});

/* ---------------- 사이노 — 명암 결합 한방 ---------------- */
/* v0.37 사이노 — 로스바이세(CZN) 명멸검 구조를 따른다 (cznmetadecks.com/ko/characters/rossweisse).
   「심판」은 턴이 시작되면 손으로 와서 「죄」(맨 왼쪽)·「명계」(맨 오른쪽)·「의식」으로 나뉜다(턴당 1회).
   손에 죄·명계와 사용 불가 카드만 남으면 다시 「심판」으로 결합하고, 의식의 판정 1당 이번 턴 심판 피해 +80%.
   죄·명계는 손에 있는 동안 조건이 맞으면 저절로 발동한다(무작위 적 피해, 의식 판정 +1). 조건은 심판의 분기를 따른다. */
add(card('cyno','c_sin','심판 · 죄',2,'attack','none',9,'무작위 적에게 피해 80%, 의식의 판정 +1. 사이노 카드를 쓸 때마다 이 효과가 발동한다(턴당 2회). 손패 맨 왼쪽에 놓인다.',[D(80,{random:true,preferAim:true}),op('verdict',{n:1})],{keywords:['unique','retain'],generated:true,shard:true,verdictPart:'sin'}));
add(card('cyno','c_dark','심판 · 명계',2,'attack','none',12,'무작위 적에게 피해 80%, 의식의 판정 +1. 동료 카드를 2장 쓸 때마다 이 효과가 발동한다(턴당 2회). 손패 맨 오른쪽에 놓인다.',[D(80,{random:true,preferAim:true}),op('verdict',{n:1})],{keywords:['unique','retain'],generated:true,shard:true,verdictPart:'dark'}));
add(card('cyno','c_rite','심판 · 의식',0,'skill','none',11,'판정 1~20. 「심판」으로 결합할 때 판정 1당 이번 턴 심판의 기본 피해 +80%.',[],{keywords:['unplayable','retain'],generated:true,shard:true,verdictPart:'rite'}));
add(card('cyno','c_thrust','창 찌르기',1,'attack','enemy',6,'피해 100%.',[D(100)]),{
 A:br('창 찌르기 · 안정','피해 130%.',{ops:[D(130)]}),
 B:br('창 찌르기 · 자원','피해 100%. 처치 시 행동력 +1.',{ops:[D(100),op('ifKill',{ops:[op('ap',{n:1})]})]}),
 C:br('창 찌르기 · 변형','피해 60%.',{cost:0,ops:[D(60)]}),
 D:br('창 찌르기 · 빌드','피해 100%. 의식의 판정 +1.',{ops:[D(100),op('verdict',{n:1})]}),
});
add(card('cyno','c_claw','검은 발톱',1,'attack','enemy',4,'피해 70%. 조준점 대상이면 +50%.',[D(70,{ifAim:50})]),{
 A:br('검은 발톱 · 안정','피해 95%. 조준점 대상이면 +50%.',{ops:[D(95,{ifAim:50})]}),
 B:br('검은 발톱 · 자원','피해 70%. 조준점 대상이면 +50%, 1장 드로우.',{ops:[D(70,{ifAim:50}),op('if',{cond:'aimTarget',ops:[op('draw',{n:1})]})]}),
 C:br('검은 발톱 · 변형','피해 70%. 조준점 대상이면 +50%. 대상에게 조준점 부여.',{ops:[D(70,{ifAim:50}),op('aim')]}),
 D:br('검은 발톱 · 빌드','피해 40% × 3회.',{ops:[D(40,{hits:3})]}),
});
add(card('cyno','c_gaze','심판관의 응시',1,'skill','none',3,'의식의 판정 +3.',[op('verdict',{n:3})]),{
 A:br('심판관의 응시 · 안정','의식의 판정 +4.',{ops:[op('verdict',{n:4})]}),
 B:br('심판관의 응시 · 자원','의식의 판정 +3. 1장 드로우.',{ops:[op('verdict',{n:3}),op('draw',{n:1})]}),
 C:br('심판관의 응시 · 변형','의식의 판정 +2.',{cost:0,keywords:['exhaust'],ops:[op('verdict',{n:2})]}),
 D:br('심판관의 응시 · 빌드','의식의 판정 +2. 다음 턴 시작 시 판정 +2.',{ops:[op('verdict',{n:2}),op('verdictCarry',{n:2})]}),
});
add(card('cyno','c_judgment','심판',0,'attack','enemy',10,'피해 400%. 결합한 턴에는 의식의 판정 1당 +80%.',[D(400,{verdictWhole:true})],{keywords:['unique','verdict'],combined:true,verdictPart:'whole'}),{
 A:br('심판 · 안정','피해 600%. 죄·명계의 피해 120%.',{ops:[D(600,{verdictWhole:true})],verdictPct:120}),
 B:br('심판 · 자원','피해 600%. 죄는 능력으로 카드를 버릴 때, 명계는 능력으로 카드를 뽑을 때 발동하고 피해 120%.',{ops:[D(600,{verdictWhole:true})],verdictPct:120,verdictRule:'cycle'}),
 C:br('심판 · 변형','피해 400%, 방어력 기반 본인 보호막 120%. 죄는 사이노가 피격될 때, 명계는 사이노가 보호막을 얻을 때 발동(턴당 1회)하고 피해 240%.',{ops:[D(400,{verdictWhole:true}),SH(120)],verdictPct:240,verdictRule:'aegis'}),
 D:br('심판 · 빌드','보유 행동력을 전부 소모. 피해 400% + 행동력 1당 120%. 죄는 능력으로 행동력을 얻을 때, 명계는 비용 1 이상 카드를 쓸 때 발동하고 피해 120%.',{xCost:true,keywords:['unique','verdict','finale'],ops:[D(400,{verdictWhole:true,judgment:true,perAp:120,perShard:0})],verdictPct:120,verdictRule:'unbound'}),
});
add(card('cyno','c_stance','침묵의 자세',1,'guard','none',2,'방어력 기반 본인 보호막 200%.',[SH(200)]),{
 A:br('침묵의 자세 · 안정','방어력 기반 본인 보호막 260%.',{ops:[SH(260)]}),
 B:br('침묵의 자세 · 자원','방어력 기반 본인 보호막 200%.',{cost:0,keywords:['exhaust']}),
 C:br('침묵의 자세 · 변형','방어력 기반 본인 보호막 200%. 의식의 판정 +1.',{ops:[SH(200),op('verdict',{n:1})]}),
 D:br('침묵의 자세 · 빌드','방어력 기반 본인 보호막 200%. 보존: 보호막 +100%.',{keywords:['retain'],ops:[SH(200,{retainPct:100})]}),
});
add(card('cyno','c_low','낮은 자세',0,'skill','none',5,'「심판」 카드가 아닌 손패 1장을 버리고 1장 드로우.',[op('discard',{n:1,filter:'nonShard',then:[op('draw',{n:1})]})],{keywords:['exhaust']}),{
 A:br('낮은 자세 · 안정','「심판」 카드가 아닌 손패 1장을 버리고 2장 드로우.',{ops:[op('discard',{n:1,filter:'nonShard',then:[op('draw',{n:2})]})]}),
 B:br('낮은 자세 · 자원','「심판」 카드가 아닌 손패 1장을 버리고 1장 드로우. 동료 카드를 버리면 행동력 +1.',{ops:[op('discard',{n:1,filter:'nonShard',allyAp:1,then:[op('draw',{n:1})]})]}),
 C:br('낮은 자세 · 변형','「심판」 카드가 아닌 손패 1장을 덱 맨 아래로 보내고 1장 드로우.',{ops:[op('discard',{n:1,filter:'nonShard',toBottom:true,then:[op('draw',{n:1})]})]}),
 D:br('낮은 자세 · 빌드','「심판」 카드가 아닌 손패를 전부 버리고 1장 드로우.',{ops:[op('discardHand',{filter:'nonShard',thenDraw:1})]}),
});
add(card('cyno','c_authority','대풍기관의 권한',0,'skill','none',1,'2장 드로우. 이번 전투에서 의식이 판정 2로 시작한다.',[op('draw',{n:2}),op('verdictStart',{n:1})],{keywords:['unique','opening']}),{
 A:br('대풍기관의 권한 · 안정','2장 드로우. 이번 전투에서 의식이 판정 3으로 시작한다.',{ops:[op('draw',{n:2}),op('verdictStart',{n:2})]}),
 B:br('대풍기관의 권한 · 자원','3장 드로우. 이번 전투에서 의식이 판정 2로 시작한다.',{ops:[op('draw',{n:3}),op('verdictStart',{n:1})]}),
 C:br('대풍기관의 권한 · 변형','2장 드로우. 이번 전투에서 의식이 판정 2로 시작한다.',{keywords:['unique','retain']}),
 D:br('대풍기관의 권한 · 빌드','지속: 결합할 때마다 다음 의식의 판정 +2 (누적).',{ops:[op('persist',{watch:'combineGrow'})]}),
});
add(card('cyno','c_summon','일곱 성인의 소환',0,'skill','none',8,'2장 뽑고 2장 버린다.',[op('draw',{n:2}),op('discard',{n:2})],{keywords:['exhaust']}),{
 A:br('일곱 성인의 소환 · 안정','3장 뽑고 2장 버린다.',{ops:[op('draw',{n:3}),op('discard',{n:2})]}),
 B:br('일곱 성인의 소환 · 자원','2장 뽑고 1장 버린다.',{ops:[op('draw',{n:2}),op('discard',{n:1})]}),
 C:br('일곱 성인의 소환 · 변형','2장 뽑고 2장 버린다. 의식의 판정 +2.',{ops:[op('draw',{n:2}),op('discard',{n:2}),op('verdict',{n:2})]}),
 D:br('일곱 성인의 소환 · 빌드','3장 뽑고 3장 버린다.',{ops:[op('draw',{n:3}),op('discard',{n:3})]}),
});

/* ---------------- 덱 구성 ---------------- */
export const V2_STARTERS={
 lohen:['l_strike','l_strike','l_guard','l_pierce'],
 durin:['d_strike','d_strike','d_guard','d_wave'],
 jahoda:['j_strike','j_strike','j_wind','j_cache'],
 illuga:['i_strike','i_guard','i_guard','i_counter'], kinich:['k_shot','k_shot','k_cannon','k_dodge'],
 lyney:['y_arrow','y_arrow','y_trick','y_hat'],
 cyno:['c_judgment','c_thrust','c_thrust','c_stance'],
};
export const SPECIAL_CARDS=['l_frost','d_resonance','j_spring','k_ajaw','y_tophat','c_sin','c_dark','c_rite'];
export function v2Pool(owner){const start=new Set(V2_STARTERS[owner]||[]);return Object.values(V2_CARDS).filter(c=>c.owner===owner&&!c.generated&&!c.combined&&!start.has(c.key)).map(c=>c.key);}
// Battle discoveries: the first four non-starter cards per owner, in table order.
export const V2_DISCOVERIES=Object.fromEntries(Object.keys(V2_STARTERS).map(id=>[id,v2Pool(id).slice(0,4)]));

/* Partner passives (planning doc). The engine reads the ids; the text is for the dossier. */
export const V2_PARTNERS={
 varka:'한 번에 서리 파편 3장이 버려지면 추가공격이 적 전체로 퍼진다. 단일 추가공격 피해 +30%.',
 albedo:'협공마다 태양화 1. 3이 되면 이번 턴 협공 상한 +1, 다음 협공에 두린 방어력 기반 추가 피해 60%.',
 nefer:'야호다 카드로 행동력이 회복될 때마다 체력이 가장 높은 적에게 균열 1.',
 flins:'보호막 → 공격력 전환 +20%. 아군 보호막이 전부 깨지면 공격자에게 일루가 방어력 기반 피해 40%.', mualani:'「추적」 모드: 연타 카드 타수 +1 (턴당 2회).',
 kachina:'「분쇄」 모드: 키니치가 공격하는 대상의 방어력 -30%, 적 장막에 주는 피해 2배.',
 lynette:'리니가 생성 카드를 만들면 30% 확률로 1장 더 생성. 리니의 카드로 카드를 버리면 턴당 1회 전체 피해 20%.',
 tighnari:'사이노가 전투에서 처음 쓰는 공격 카드의 대상에게 조준점(사이노 치명확률 +30%). 죄·명계의 무작위 피해는 조준점이 붙은 적을 먼저 노린다.',
};
export const V2_PASSIVES={
 lohen:'서리 파편: 버려질 때 마지막 대상에게 추가공격 피해 30%. 손패에 최대 3장.',
 durin:'협공: 아군이 공격 카드를 쓰면 50% 확률로 전체 피해 25% (턴당 최대 3회).',
 jahoda:'행동력 보충: 0코스트 행동력 카드로 다른 전투원의 카드를 이어 준다.',
 illuga:'턴 종료 시 본인에게 남은 보호막의 30%를 다음 턴 공격력에 더한다.', kinich:'필살기 버튼으로 「추적」↔「분쇄」 모드를 바꾼다(게이지 소모 없음, 턴당 1회). 전환할 때 「아쥬의 참견」 생성. 연타 1타마다 추적흔 1(최대 10).',
 lyney:'손패 10장 규칙 때문에 뽑기만 하면 막힌다. 버리는 카드가 출구다.',
 cyno:'명암: 「심판」은 턴이 시작되면 「죄」·「명계」·「의식」으로 나뉜다. 손에 죄·명계와 사용 불가 카드만 남으면 다시 「심판」으로 결합한다.',
};
