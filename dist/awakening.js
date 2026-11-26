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
];
