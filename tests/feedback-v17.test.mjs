import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 createGame, act, cardInfo, BRANCH_A_SPECS, RAID_BOSS_DEFAULT, EQUIPMENT,
 serialize, hydrate,
} from '../dist/engine.js';
import { cardArtwork } from '../dist/cast-art.js';

function setupCampaignWithRecord(seed = 20261124) {
 const s = createGame(seed, { tutorial: false });
 s.party = ['lohen', 'durin', 'illuga'];
 s.collection.unlocked = ['lohen', 'durin', 'illuga', 'jahoda'];
 s.phase = 'base';
 s.battle = null;
 const r1 = act(s, { type: 'saveRecord', label: '1번 세이브 덱' });
 assert.equal(r1.ok, true);
 return { s, recId: s.collection.records[0].id };
}

test('v0.17 lobby return from base saves checkpoint and resumes expedition cleanly', () => {
 const { s } = setupCampaignWithRecord();
 const ret = act(s, { type: 'returnToLobby' });
 assert.equal(ret.ok, true);
 assert.equal(s.phase, 'lobby');
 assert.equal(s.savedExpedition, true);

 const res = act(s, { type: 'resumeExpedition' });
 assert.equal(res.ok, true);
 assert.equal(s.phase, 'base');
 assert.equal(s.savedExpedition, false);
});

test('raid rejects party records (v0.27 raids use per-combatant save data), preserves saved records and the announced boss name',()=>{
 const {s,recId}=setupCampaignWithRecord(77);act(s,{type:'returnToLobby'});
 s.collection.raid.totalDamage=95;s.collection.raid.recordStats[recId]={triesUsed:2,bestDamage:95};
 for(const id of [recId,'missing']){const before=serialize(s),r=act(s,{type:'startRaid',id});assert.equal(r.ok,false);assert.match(r.error,/세이브 데이터/);assert.equal(serialize(s),before);}
 const restored=hydrate(serialize(s));assert.equal(restored.collection.raid.bossName,'천공의 사도·케루빔');assert.equal(restored.collection.raid.totalDamage,95);assert.equal(restored.collection.records.length,1);
});

test('v0.17 Branch A upgrades have concrete titles/effects and card artwork does not swap on upgrade', () => {
 const s = createGame(33, { tutorial: false });
 s.party = ['lohen', 'durin', 'illuga'];
 assert.ok(BRANCH_A_SPECS.l_pierce && BRANCH_A_SPECS.d_strike && BRANCH_A_SPECS.i_cover && BRANCH_A_SPECS.j_strike);

 const baseArt = cardArtwork('lohen', cardInfo(s, { owner: 'lohen', key: 'l_pierce' }), 'l_pierce');
 s.heroes.lohen.upgrades.l_pierce = 'A';
 const upgInfo = cardInfo(s, { owner: 'lohen', key: 'l_pierce' });
 const upgArt = cardArtwork('lohen', upgInfo, 'l_pierce');
 assert.equal(upgArt, baseArt, 'upgraded card must preserve base artwork');
 assert.ok(upgInfo.upgraded&&!upgInfo.desc.includes('['));
});

test('v0.17 looted equipment enters pendingEquip and can be equipped immediately to a chosen ally', () => {
 const s = createGame(55, { tutorial: false });
 s.party = ['lohen', 'durin', 'illuga'];
 s.phase = 'reward';
 s.lastReward = { gold: 10, xp: 10, pending: true, equipment: [Object.keys(EQUIPMENT).find(k => EQUIPMENT[k].slot === 'weapon')] };

 const claim = act(s, { type: 'claimReward' });
 assert.equal(claim.ok, true);
 assert.deepEqual(s.pendingEquip, [Object.keys(EQUIPMENT).find(k => EQUIPMENT[k].slot === 'weapon')]);

 const eq = act(s, { type: 'equipPending', hero: 'durin', item: Object.keys(EQUIPMENT).find(k => EQUIPMENT[k].slot === 'weapon') });
 assert.equal(eq.ok, true);
 assert.equal(s.heroes.durin.equipment.weapon, Object.keys(EQUIPMENT).find(k => EQUIPMENT[k].slot === 'weapon'));
 assert.equal(s.pendingEquip.length, 0);
});

test('v0.17 UI, lobby, melee lunge, and CZN epiphany cutin wiring exist', () => {
 const html = fs.readFileSync('dist/index.html', 'utf8');
 const motion = fs.readFileSync('dist/motion.js', 'utf8');
 const app = fs.readFileSync('dist/app.js', 'utf8');
 assert.ok(html.includes('feedback-v17.css'));
 assert.ok(motion.includes('melee-dashing') && motion.includes("['lohen','illuga','jahoda','kinich','cyno']"));
 assert.ok(app.includes('function lobby(') && app.includes('function raidModal(') && app.includes('function pendingEquipModal(') && app.includes('function refineCutin(') && /version:\x27\d+\.\d+\x27/.test(app));
});
