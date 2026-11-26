/* v0.27 per-combatant Save Data. An expedition is a run; when it ends (clear, defeat or
   retreat) each combatant who took part may keep a snapshot of the build they made.
   Snapshots live in collection.saveData, outside the run, and are used by the raid. */
export const SAVE_SLOTS=3;
export const SAVE_OUTCOMES={clear:'클리어',defeat:'전멸',retreat:'귀환'};
const clone=x=>JSON.parse(JSON.stringify(x));
// Value is a readable measure of how far a build was pushed, in the spirit of CZN's data points.
export function saveValue(entry,cards,equipment){
 let v=0;for(const key of entry.acquired||[])v+=10;v+=Object.keys(entry.upgrades||{}).length*10;v+=Object.keys(entry.sparks||{}).length*20;v+=(entry.removedCards||[]).length*10;
 for(const key of Object.values(entry.equipment||{}).filter(Boolean))v+=equipment[key]?.rarity==='elite'?20:10;v-=(entry.curses||[]).length*5;return Math.max(0,v);
}
export function makeSaveEntry(s,hero,outcome,{cards,equipment,ownedDeck}){
 const h=s.heroes[hero];
 const entry={id:`save-${hero}-${s.seed}-${s.rng}-${s.battlesWon||0}`,hero,outcome,savedAt:new Date().toISOString().slice(0,10),level:h.level,battlesWon:s.battlesWon||0,node:s.node,
  legacyLoadout:!!h.legacyLoadout,acquired:clone(h.acquired||[]),removedCards:clone(h.removedCards||[]),curses:clone(h.curses||[]),upgrades:clone(h.upgrades||{}),sparks:clone(h.sparks||{}),equipment:clone(h.equipment||{weapon:null,accessory:null})};
 entry.deck=ownedDeck(s,hero).map(c=>c.key);entry.value=saveValue(entry,cards,equipment);return entry;
}
// Overlay a snapshot on a fresh hero state, so the deck rules (ownedDeck) rebuild the same deck.
export function applySaveEntry(hero,entry){
 return {...hero,level:entry.level||1,legacyLoadout:!!entry.legacyLoadout,acquired:clone(entry.acquired||[]),removedCards:clone(entry.removedCards||[]),curses:clone(entry.curses||[]),upgrades:clone(entry.upgrades||{}),sparks:clone(entry.sparks||{}),equipment:clone(entry.equipment||{weapon:null,accessory:null}),stress:0,breakdown:null,retired:false};
}
