// Weights below are conditional on the normal-stat pool, not a full binding.
const weapon={Accuracy:8,Attack:7,'Back Attack':7,Block:7,'Combat Speed':4,'Critical Attack':8,'Critical Hit':7,'Damage Boost':2,'Front Attack':7,HP:8,MP:8,'Multi-hit Chance':6,'Status Effect Chance':4,'Weapon Damage Boost':4,Might:6,Precision:7};
const armor={Accuracy:5,Attack:4,'Back Defense':5,Block:6,'Critical Damage Defense':6,'Critical Hit':5,'Critical Hit Resist':6,Defense:5,Evasion:5,'Front Defense':5,HP:6,MP:6,'Natural HP Regen':6,'Natural MP Regen':6,'Status Effect Resist':3,Constitution:4,Dexterity:4,Willpower:4};
const accessory={Accuracy:6,Attack:6,Block:9.5,'Critical Hit':6,'Critical Hit Resist':9.5,Defense:6,Evasion:6,'Flight Power':6,HP:9.5,MP:9.5,'Natural HP Regen':10,'Natural MP Regen':10,Intelligence:2,Might:2,Precision:2};
const jewelryExtra=(name)=>({...accessory,Block:9,'Critical Hit Resist':9,HP:9,MP:9,[name]:2});
const rare=(names)=>Object.fromEntries(names.map(name=>[name,1.2]));
const armorPool=(special,names)=>({...armor,[special]:3,...rare(names)});
const bracelet=Object.fromEntries(['Death [Triniel]','Destiny [Marchutan]','Destruction [Zikel]','Freedom [Vaizel]','Illusion [Kaisinel]','Justice [Nezekan]','Life [Yustiel]','Wisdom [Lumiel]'].map(name=>[name,12.5]));
export const pools=[
 {id:'weapon',name:'Weapon',stats:weapon,skill:'active'}, {id:'guard',name:'Guard',stats:weapon,skill:'active'},
 {id:'helmet',name:'Helmet',stats:armorPool('Incoming Heal',['Attack Increase','Double Chance','Endurance','Perfect Resist','Weapon Damage Tolerance']),skill:'passive'},
 {id:'shoulders',name:'Shoulders / Pauldrons',stats:armorPool('Critical Damage Boost',['Defense Increase','Double Chance','Endurance Penetration','Perfect Resist','Regeneration']),skill:'passive'},
 {id:'chest',name:'Chest / Top',stats:armorPool('Damage Boost',['Defense Increase','Double Resist','Perfect Chance','Regeneration','Weapon Damage Tolerance']),skill:'passive'},
 {id:'gloves',name:'Gloves',stats:armorPool('Combat Speed',['Defense Increase','Endurance Penetration','Multi-hit Resist','Perfect Chance','Regeneration']),skill:'passive'},
 {id:'pants',name:'Pants / Legs',stats:armorPool('Damage Tolerance',['Attack Increase','Double Resist','Endurance','Multi-hit Resist','Perfect Chance']),skill:'passive'},
 {id:'boots',name:'Boots / Shoes',stats:armorPool('Move Speed',['Defense Increase','Endurance Penetration','Perfect Chance','Perfect Resist','Regeneration']),skill:'passive'},
 {id:'cloak',name:'Cloak / Cape',stats:armorPool('Critical Damage Tolerance',['Attack Increase','Double Chance','Endurance','Endurance Penetration','Weapon Damage Tolerance']),skill:'passive'},
 {id:'necklace',name:'Necklace',stats:jewelryExtra('Combat Speed'),skill:'passive',inferred:true},
 {id:'earring',name:'Earring',stats:jewelryExtra('Move Speed'),skill:'passive',inferred:true},
 {id:'ring',name:'Ring',stats:accessory,skill:'active',inferred:true},
 {id:'bracelet',name:'Bracelet',stats:bracelet,split:1,inferred:true},
 {id:'belt',name:'Belt (manual only)',stats:{},manual:true},{id:'amulet',name:'Amulet (manual only)',stats:{},manual:true},
 {id:'other',name:'Other / unlisted item (manual only)',stats:{},manual:true}
];
