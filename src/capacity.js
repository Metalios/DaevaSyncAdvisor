// Global family presets; not an exhaustive item database. No custom line counts.
export const weaponTypes = Object.freeze({
  kromede: {label:'Enraged Kromede (+2m reach)',base:3,weaponOnly:true},
  ludra: {label:'Ludra (+2m reach)',base:3,weaponOnly:true},
  dungeon: {label:'Standard Unique dungeon / field boss gear',base:4},
  dragon: {label:'Crafted Dragon Lord gear',base:5}
});
export function gearTypes(slot) {
  if (!slot || slot === 'other' || ['belt','amulet'].includes(slot)) return [];
  return Object.entries(weaponTypes).filter(([,type])=>slot==='weapon'||!type.weaponOnly);
}
export function baseCapacity(slot,category) {
  return gearTypes(slot).find(([id])=>id===category)?.[1].base??null;
}
export function totalCapacity(slot,category,fused=false) {
  const base=baseCapacity(slot,category);
  return base===null||typeof fused!=='boolean'?null:base+Number(fused);
}
export function validCapacity(slot,category,count) {
  return Number.isInteger(count) && baseCapacity(slot,category)===count;
}
export function blockedTargetNames(current,existing,label) {
  return new Set([current,...existing].filter(x=>x && !['@unknown','@unlisted'].includes(x)).map(x=>label(x).trim().toLowerCase()));
}
