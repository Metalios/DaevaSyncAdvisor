import { pools } from './pools.js';
import { skillNames } from './skills.js';

// Editorial starting points, not a measured DPS model. Only base-pool candidates are shown.
export const profiles = {
  'pve-dps':'PvE · Damage', 'pve-tank':'PvE · Tank', 'pve-support':'PvE · Healing / Support',
  'pvp-burst':'PvP · Burst / Control', 'pvp-survival':'PvP · Survivability'
};
const offense={weapon:['Combat Speed','Weapon Damage Boost','Damage Boost','Multi-hit Chance','Might','Precision'],guard:['Combat Speed','Weapon Damage Boost','Damage Boost','Multi-hit Chance','Might','Precision'],helmet:['Attack Increase','Double Chance','Attack'],shoulders:['Critical Damage Boost','Double Chance','Attack'],chest:['Damage Boost','Attack','Perfect Chance'],gloves:['Combat Speed','Attack','Perfect Chance'],pants:['Attack Increase','Attack','Perfect Chance'],boots:['Move Speed','Attack','Perfect Chance'],cloak:['Attack Increase','Double Chance','Attack'],necklace:['Combat Speed','Might','Precision','Attack'],earring:['Might','Precision','Attack','Move Speed'],ring:['Might','Precision','Attack'],bracelet:['Destruction [Zikel]','Illusion [Kaisinel]','Death [Triniel]','Wisdom [Lumiel]']};
const defense={helmet:['Endurance','Incoming Heal','HP','Block'],shoulders:['Defense Increase','Critical Damage Defense','HP','Block'],chest:['Defense Increase','Weapon Damage Tolerance','HP','Block'],gloves:['Combat Speed','Defense Increase','HP','Block'],pants:['Damage Tolerance','Endurance','HP','Block'],boots:['Move Speed','Defense Increase','HP','Block'],cloak:['Critical Damage Tolerance','Endurance','HP','Block'],necklace:['Combat Speed','HP','Block','Might'],earring:['HP','Block','Move Speed','Might'],ring:['HP','Block','Might'],bracelet:['Life [Yustiel]','Justice [Nezekan]','Illusion [Kaisinel]']};
const skillFocus={
 Gladiator:{active:['Ruinous Blow','Keen Strike','Rending Blow'],passive:['Murderous Burst','Experienced Counterstrike','Attack Preparation'],pvp:['Ankle Slice','Aerial Snare','Ruinous Blow'],protect:['Survival Willpower','Protection Armor']},
 Templar:{active:['Judgment','Punishment','Pummel'],passive:['Fury','Punishing Benediction','Insulting Roar'],pvp:['Punishment','Judgment','Shield Smite'],protect:['Fury','Survival Willpower','Ironclad Defense','Block Pain']},
 Assassin:{active:['Heart Gore','Quick Slice','Insignia Explosion'],passive:['Rear Smite','Exploit Weakness','Assault Stance'],pvp:['Heart Gore','Ambush','Shadowstrike'],protect:['Heightened Sixth Sense','Determination']},
 Ranger:{active:['Deadshot','Burst Arrow','Snipe'],passive:['Concentrated Fire','Focused Eye','Hunter\'s Soul'],pvp:['Deadshot','Burst Arrow','Snare Shot'],protect:['Unyielding Resolve','Hunter\'s Resolve']},
 Sorcerer:{active:['Hellfire','Blaze','Firestorm'],passive:['Fire Mark','Robe of Flame','Grace of Enhancement'],pvp:['Hellfire','Frost','Winter\'s Shackles'],protect:['Grace of Resistance','Robe of Earth']},
 Spiritmaster:{active:['Elemental Fusion','Summon: Fire Spirit','Jointstrike: Curse'],passive:['Element Unification','Spirit Strike','Corrode'],pvp:['Dimensional Control','Jointstrike: Curse','Elemental Fusion'],protect:['Spirit Protection','Mental Focus']},
 Cleric:{active:['Condemnation','Judgment Thunder','Earth\'s Retribution'],passive:['Healing Enhancement','Heal Block','Radiant Benediction'],pvp:['Chain of Torment','Condemnation','Healing Light'],protect:['Healing Enhancement','Immortal Veil','Survival Willpower'],heal:['Healing Light','Radiant Recovery','Light of Regeneration']},
 Chanter:{active:['Dark Crush','Incandescent Blow','Onslaught'],passive:['Attack Preparation','Raging Spell','Wind\'s Promise'],pvp:['Dark Crush','Impactful Crush','Recuperation'],protect:['Blessing of Life','Crossguard','Survival Willpower'],heal:['Recuperation','Dark Crush']}
};
const unique = a => [...new Set(a)];
export function recommendations(slot, className, profile) {
 const pool=pools.find(p=>p.id===slot), focus=skillFocus[className];
 if(!pool || !focus || !Object.hasOwn(profiles,profile) || pool.manual)return [];
 const pvp=profile.startsWith('pvp'), defensive=['pve-tank','pve-support','pvp-survival'].includes(profile);
 let stats=[...(defensive?(defense[slot]??offense[slot]??[]):(offense[slot]??[]))];
 if(profile==='pve-support' && Object.hasOwn(pool.stats,'Attack'))stats=unique([...stats.slice(0,2),'Attack',...stats.slice(2)]);
 if(pvp){if(['weapon','guard'].includes(slot))stats=unique(['Combat Speed','Status Effect Chance',...stats]);else if(Object.hasOwn(pool.stats,'Status Effect Resist'))stats=unique(['Status Effect Resist',...stats]);if(profile==='pvp-survival'&&slot==='earring')stats=unique(['Move Speed',...stats]);}
 const result=stats.filter(s=>Object.hasOwn(pool.stats,s)).map((s,i)=>({id:s,label:s,tier:i<2?'Core target':'Alternative',reason:i<2?'Primary slot target for this profile.':'Useful alternative; value depends on build and caps.'}));
 if(pool.skill){let names=pool.skill==='active'?(profile==='pve-support'&&focus.heal?focus.heal:pvp?focus.pvp:focus.active):(defensive||pvp?focus.protect:focus.passive);
 const valid=skillNames(className,pool.skill);
 for(const name of names.filter(n=>valid.includes(n)))result.push({id:`@skill:${name}`,label:`${name} +1`,tier:'Skill target',reason:'Candidate for this class/profile; prioritize only if used and the extra level helps.'});}
 return result;
}

// A physical capacity is independent of the random outcome of one Sync.
export function linePlan(slot, className, profile, count, current='', existing=[]) {
 if(!Number.isInteger(count)||count<1||count>5)return null;
 const candidates=recommendations(slot,className,profile);
 const ranked=candidates.slice(0,count).map((r,i)=>({...r,rank:i+1}));
 const alternatives=candidates.slice(count);
 const known=[current,...existing].filter(id=>id&&id!=='@unknown'&&id!=='@unlisted');
 const owned=new Set(known);
 const missing=ranked.filter(r=>!owned.has(r.id));
 return {count,ranked,alternatives,missing,matched:ranked.length-missing.length,
   recorded:known.length,unranked:Math.max(0,count-ranked.length)};
}

// The extra line is a planning candidate from the ordinary pool, not a verified fuse-specific roll.
export function equipmentPlan(slot,className,profile,base,fused=false) {
 const plan=linePlan(slot,className,profile,base);
 if(!plan||![3,4,5].includes(base)||typeof fused!=='boolean')return null;
 const fuseCandidate=fused?(plan.alternatives[0]??null):null;
 return {...plan,total:base+Number(fused),fused,fuseCandidate,alternatives:fuseCandidate?plan.alternatives.slice(1):plan.alternatives};
}
