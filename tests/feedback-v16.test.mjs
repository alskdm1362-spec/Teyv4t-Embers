import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 createGame, act, cardInfo, makeUpgradeOffer, predictCardEffect,
 PARTNER_PASSIVES, SPARK_EFFECTS, serialize, hydrate, applyInjury,
} from '../dist/engine.js';

function startNonTutorialBattle(seed = 20261124) {
 const s = createGame(seed, { tutorial: false });
 s.party = ['lohen', 'durin', 'illuga'];
 s.collection.unlocked = ['lohen', 'durin', 'illuga', 'jahoda'];
 const res = act(s, { type: 'start' });
 assert.equal(res.ok, true);
 assert.equal(s.phase, 'battle');
 return s;
}

test('v0.16 battle undo restores AP, hand, enemy HP and decrements undoLeft (Varka passive = 2)', () => {
 const s = startNonTutorialBattle(42);
 assert.equal(s.battle.undoLeft, 2);
 const atkCard = s.battle.hand.find(c => cardInfo(s, c).type === 'attack' && cardInfo(s, c).cost <= s.battle.ap);
 assert.ok(atkCard, 'expected an affordable attack card in starting hand');
 const enemy = s.battle.enemies[0];
 const hpBefore = enemy.hp;
 const apBefore = s.battle.ap;
 const handCountBefore = s.battle.hand.length;

 const playRes = act(s, { type: 'play', uid: atkCard.uid, target: enemy.id });
 assert.equal(playRes.ok, true);
 assert.ok(s.battle.ap < apBefore || enemy.hp < hpBefore);

 const undoRes = act(s, { type: 'undo' });
 assert.equal(undoRes.ok, true);
 assert.equal(s.battle.undoLeft, 1);
 assert.equal(s.battle.ap, apBefore);
 assert.equal(s.battle.enemies[0].hp, hpBefore);
 assert.equal(s.battle.hand.length, handCountBefore);
 assert.ok(s.battle.hand.some(c => c.uid === atkCard.uid));

 // Ending turn clears undoStack
 const etRes = act(s, { type: 'endTurn' });
 assert.equal(etRes.ok, true);
 const failUndo = act(s, { type: 'undo' });
 assert.equal(failUndo.ok, false);
});

test('v0.16 predictCardEffect accurately predicts lethal kill, wanderer echo, and injury penalty', () => {
 const s = startNonTutorialBattle(99);
 const atkCard = s.battle.hand.find(c => cardInfo(s, c).type === 'attack');
 assert.ok(atkCard);
 const enemy = s.battle.enemies[0];
 enemy.kind = 'hound';
 enemy.hp = 5;
 enemy.ward = 0;
 enemy.hitWard = 0;

 const predKill = predictCardEffect(s, atkCard.uid, enemy.id);
 assert.ok(predKill);
 assert.equal(predKill.enemies[enemy.id].willKill, true);

 // Wanderer echo prediction
 enemy.kind = 'wanderer';
 enemy.echo = false;
 enemy.hp = 5;
 const predEcho = predictCardEffect(s, atkCard.uid, enemy.id);
 assert.equal(predEcho.enemies[enemy.id].willEcho, true);
 assert.equal(predEcho.enemies[enemy.id].willKill, false);

 // Injury penalty flag
 applyInjury(s, atkCard.owner, 'rightArm');
 applyInjury(s, atkCard.owner, 'rightArm');
 const predInj = predictCardEffect(s, atkCard.uid, enemy.id);
 assert.equal(predInj.injured, true);
 assert.ok(predInj.injuryPct < 100);
});

test('v0.16 rare Ember Spark attaches on elite upgrade offer and applies cardInfo/play effects', () => {
 const s = startNonTutorialBattle(123);
 s.phase = 'base';
 s.battle = null;
 const offer = makeUpgradeOffer(s, 'elite', 'base');
 assert.ok(offer && offer.candidates.length > 0);
 const sparked = offer.candidates.find(c => c.spark);
 assert.ok(sparked, 'elite upgrade offer should guarantee a rare spark candidate');
 assert.ok(SPARK_EFFECTS[sparked.spark]);

 s.upgradeOffer = offer;
 const upgRes = act(s, { type: 'upgrade', hero: sparked.owner, card: sparked.key, branch: sparked.sparkBranch });
 assert.equal(upgRes.ok, true);
 assert.equal(s.heroes[sparked.owner].sparks[sparked.key], sparked.spark);

 // Verify cardInfo reflects spark
 const info = cardInfo(s, { uid: 'test-spark', owner: sparked.owner, key: sparked.key });
 assert.equal(info.spark, sparked.spark);
 assert.ok(info.sparkName&&!info.desc.includes('['));
});

test('v0.16 breakdown recovery grants awaken buff and triggers partner passives', () => {
 const s = startNonTutorialBattle(777);
 const h = s.heroes.lohen;
 h.stress = 100;
 h.breakdown = { type: 'despair', failures: 10 }; // guaranteed recovery on next breakdown play
 const lohenCard = s.battle.hand.find(c => c.owner === 'lohen');
 assert.ok(lohenCard);
 const shieldBefore = s.shield;
 const apBefore = s.battle.ap;

 const res = act(s, { type: 'play', uid: lohenCard.uid });
 assert.equal(res.ok, true);
 const hAfter = s.heroes.lohen;
 assert.equal(hAfter.breakdown, null);
 assert.equal(hAfter.stress, 40);
 assert.equal(hAfter.buffs.awaken, 6);
 // Varka passive (+4 shield) & Albedo passive (+1 AP, since durin is in party)
 assert.equal(s.shield, shieldBefore + 4);
 assert.equal(s.battle.ap, Math.min(6, apBefore - 1 + 1));
 assert.ok(PARTNER_PASSIVES.varka && PARTNER_PASSIVES.albedo && PARTNER_PASSIVES.flins && PARTNER_PASSIVES.nefer);
});

test('v0.16 expedition records save, survive newGame, and launch boss challenge', () => {
 const s = startNonTutorialBattle(555);
 s.phase = 'base';
 s.battle = null;
 s.heroes.lohen.upgrades.l_pierce = 'B';
 s.heroes.lohen.sparks.l_pierce = 'ember_cost';

 const saveRes = act(s, { type: 'saveRecord', label: '테스트 잔불 덱' });
 assert.equal(saveRes.ok, true);
 assert.equal(s.collection.records.length, 1);
 const recId = s.collection.records[0].id;

 // Roundtrip serialize/hydrate + newGame preserves records
 const reloaded = hydrate(serialize(s));
 assert.equal(reloaded.collection.records.length, 1);
 const ngRes = act(reloaded, { type: 'newGame', seed: 100 });
 assert.equal(ngRes.ok, true);
 assert.equal(reloaded.collection.records.length, 1);

 // Launch boss defense challenge from saved record
 const chRes = act(reloaded, { type: 'challengeRecord', id: recId });
 assert.equal(chRes.ok, true);
 assert.equal(reloaded.phase, 'battle');
 assert.equal(reloaded.mode, 'challenge');
 assert.equal(reloaded.heroes.lohen.upgrades.l_pierce, 'B');
 assert.equal(reloaded.heroes.lohen.sparks.l_pierce, 'ember_cost');

 // Delete record
 const delRes = act(reloaded, { type: 'deleteRecord', id: recId });
 assert.equal(delRes.ok, true);
 assert.equal(reloaded.collection.records.length, 0);
});

test('v0.16 UI assets and wiring exist in dist/index.html, dist/feedback-v16.css, and dist/app.js', () => {
 const html = fs.readFileSync('dist/index.html', 'utf8');
 const css = fs.readFileSync('dist/feedback-v16.css', 'utf8');
 const app = fs.readFileSync('dist/app.js', 'utf8');
 assert.ok(html.includes('feedback-v16.css'));
 assert.ok(css.includes('.enemy-preview-badge') && css.includes('.keyword-strip') && css.includes('.undo-btn'));
 assert.ok(/version:\x27\d+\.\d+\x27/.test(app) && app.includes('KEYWORD_GLOSSARY') && app.includes('updateEnemyPreviews') && app.includes('recordsRail'));
});
