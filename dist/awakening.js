// The permanent four-card loadout and the four expedition discoveries are separate.
export const STARTERS={
 lohen:['l_strike','l_strike','l_guard','l_pierce'],
 durin:['d_strike','d_strike','d_guard','d_wave'],
 illuga:['i_strike','i_guard','i_guard','i_counter'],
 jahoda:['j_strike','j_strike','j_guard','j_energy'],
};
export const DISCOVERIES={
 lohen:['l_aim','l_thread','l_chase','l_breach'],
 durin:['d_charge','d_cinder','d_furnace','d_comet'],
 illuga:['i_cover','i_lantern','i_riposte','i_watch'],
 jahoda:['j_draw','j_cache','j_signal','j_contract'],
};
// key, art, reference card for its four upgrade paths, name, cost, power, extra effects
export const NEW_CARDS=[
 ['l_thread',5,'l_strike','바늘 궤적',1,8,{extraPierce:4}],
 ['l_chase',6,'l_strike','추격의 창끝',1,8,{killRefund:1}],
 ['l_breach',7,'l_pierce','빙열 돌파',2,16,{vuln:1}],
 ['d_cinder',5,'d_wave','잿빛 소나기',1,6,{focus:3}],
 ['d_furnace',6,'d_charge','용광로의 맥동',1,6,{discountNext:1}],
 ['d_comet',7,'d_wave','낙성의 불길',3,21,{refund:1}],
 ['i_lantern',5,'i_guard','등불의 온기',1,6,{heal:4}],
 ['i_riposte',6,'i_strike','수호자의 반격',1,6,{shieldDamage:.4,shieldDamageCap:8}],
 ['i_watch',7,'i_counter','야경의 맹세',2,12,{counter:10}],
 ['j_cache',2,'j_guard','은닉 보급품',1,5,{draw:1}],
 ['j_signal',4,'j_energy','철수 신호',1,1,{support:2}],
 ['j_contract',7,'j_strike','현상 계약',1,7,{killGold:6}],
 // v0.26 battle-reward cards. Art numbers reuse the supplied skill-1..7 illustrations.
 ['l_vigil',2,'l_guard','서약의 경계',1,8,{calm:4}],
 ['l_lunge',1,'l_strike','가벼운 찌르기',0,5,{}],
 ['l_tempest',3,'l_pierce','폭풍 관통',2,22,{extraPierce:6}],
 ['l_breath',4,'l_aim','호흡 고르기',0,4,{calm:3}],
 ['d_ashscale',2,'d_guard','잿빛 비늘',1,9,{calm:3}],
 ['d_ashclaw',3,'d_strike','재의 발톱',1,10,{vuln:1}],
 ['d_scorch',1,'d_wave','그을린 하늘',2,11,{calm:2}],
 ['d_ember',4,'d_charge','불씨 삼키기',0,4,{draw:1}],
 ['i_bulwark',2,'i_guard','방벽 정렬',2,18,{}],
 ['i_lull',3,'i_cover','자장가의 엄호',0,10,{calm:3}],
 ['i_bash',1,'i_strike','방패 밀치기',1,8,{shield:4}],
 ['i_vow',4,'i_counter','불침번',2,14,{counter:8,calm:3}],
 ['j_dart',5,'j_strike','독 묻은 다트',1,6,{vuln:2}],
 ['j_slip',3,'j_guard','그림자 걸음',1,8,{calm:3}],
 ['j_rummage',6,'j_draw','주머니 뒤지기',0,2,{support:1}],
 ['j_rush',1,'j_strike','속공',0,5,{}],
];
// Cards that can appear after a won battle: the expedition discoveries plus reward-only cards.
export const REWARD_CARDS={
 lohen:['l_vigil','l_lunge','l_tempest','l_breath'],
 durin:['d_ashscale','d_ashclaw','d_scorch','d_ember'],
 illuga:['i_bulwark','i_lull','i_bash','i_vow'],
 jahoda:['j_dart','j_slip','j_rummage','j_rush'],
};
export const REWARD_POOL=Object.fromEntries(Object.keys(STARTERS).map(id=>[id,[...DISCOVERIES[id],...REWARD_CARDS[id],STARTERS[id][2]]]));
