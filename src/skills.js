// English Global class mastery identifiers; reference: SenseOS Global character-page catalog, Oct 2026.
// Names identify outcomes, not verified item eligibility or Sync probability weights.
const catalog = {
  Gladiator: ["Rending Blow|Keen Strike|Leaping Slam|Mocking Blade|Overhead Slam|Sword Aura Rampage|Ankle Slice|Crushing Wave|Rush Strike|Aerial Snare|Ruinous Blow|Defiance", "Survival Stance|Protection Armor|Blood Absorption|Identify Weakness|Attack Preparation|Impact Hit|Destructive Impulse|Experienced Counterstrike|Survival Willpower|Murderous Burst"],
  Templar: ["Vicious Strike|Pummel|Poach|Shield Smite|Judgment|Flash Rampage|Debilitating Smash|Warding Strike|Shield Rush|Annihilate|Punishment|Defiance", "Enhance Health|Warding Shield|Punishing Benediction|Ironclad Defense|Guarding Seal|Impact Hit|Insulting Roar|Fury|Survival Willpower|Block Pain"],
  Assassin: ["Quick Slice|Shadowstrike|Savage Roar|Ambush|Heart Gore|Storm Rampage|Whirlwind Slice|Flash Slice|Infiltrate|Shadow Fall|Insignia Explosion|Defiance", "Heightened Sixth Sense|Exploit Weakness|Apply Poison|Rear Smite|Assault Stance|Impact Hit|Ambush Stance|Defense Break|Revitalization Contract|Determination"],
  Ranger: ["Snipe|Snare Shot|Tempest Shot|Marking Shot|Drill Dart|Arrow Scattershot|Gale Arrow|Explosion Trap|Burst Arrow|Suppressing Arrow|Deadshot|Defiance", "Vigilant Eye|Concentrated Fire|Wind Vigor|Focused Eye|Hunter's Resolve|Unyielding Resolve|Rooting Eye|Melee Fire|Revitalization Contract|Hunter's Soul"],
  Sorcerer: ["Firestorm|Ice Chain|Flame Arrow|Bittercold Wind|Blaze|Flame Scattershot|Frost|Winter's Shackles|Frost Burst|Wish of Concentration|Hellfire|Defiance", "Fire Mark|Robe of Earth|Cold Snap|Robe of Flame|Absorb Essence|Grace of Resistance|Robe of Cold|Grace of Enhancement|Revitalization Contract|Vitality Evaporation"],
  Spiritmaster: ["Cold Shock|Combustion|Summon: Fire Spirit|Summon: Water Spirit|Jointstrike: Curse|Rapid Scattershot|Summon: Earth Spirit|Dimensional Control|Summon: Wind Spirit|Soul's Cry|Elemental Fusion|Defiance", "Spirit Strike|Spirit Protection|Spirit's Descent|Corrode|Spirit Revitalization|Mental Focus|Consecutive Countercurrent|Spirit Communion|Revitalization Contract|Element Unification"],
  Cleric: ["Earth's Retribution|Judgment Thunder|Debilitating Mark|Divine Aura|Chain of Torment|Lightning Strike Scattershot|Light of Regeneration|Condemnation|Healing Light|Radiant Recovery|Bolt|Defiance", "Warm Benediction|Empyrean Lords' Benediction|Empyrean Lord's Grace|Healing Enhancement|Immortal Veil|Heal Block|Prayer of Concentration|Earth's Grace|Survival Willpower|Radiant Benediction"],
  Chanter: ["Onslaught|Incandescent Blow|Rushing Smash|Impactful Crush|Dark Crush|Gust Rampage|Heat Wave Blow|Recuperation|Tremor Crush|Wave Blow|Spinning Strike|Defiance", "Blessing of Life|Crossguard|Protection Circle|Inspiring Spell|Attack Preparation|Impact Hit|Raging Spell|Earth's Promise|Survival Willpower|Wind's Promise"]
};
export const classes = Object.keys(catalog);
export function skillNames(className, kind) {
  const entry = catalog[className];
  if (!entry) return [];
  return (kind === 'active' ? [entry[0]] : kind === 'passive' ? [entry[1]] : entry).flatMap(s => s.split('|')).sort((a,b)=>a.localeCompare(b));
}
