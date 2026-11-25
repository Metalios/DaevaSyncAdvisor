import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recommendations,profiles,linePlan} from '../src/recommendations.js';
import {pools} from '../src/pools.js';
import {classes,skillNames} from '../src/skills.js';
test('all recommendation candidates are distinct and match provisional slot and class pools',()=>{
 for(const pool of pools)for(const cls of classes)for(const profile of Object.keys(profiles)){
 const rows=recommendations(pool.id,cls,profile);assert.equal(new Set(rows.map(x=>x.id)).size,rows.length);
 if(pool.manual)assert.equal(rows.length,0);else assert.ok(rows.length);
 for(const r of rows){if(r.id.startsWith('@skill:'))assert.ok(skillNames(cls,pool.skill).includes(r.id.slice(7)));else assert.ok(Object.hasOwn(pool.stats,r.id));}
 }
});
test('role and class selections change gear and skill priorities',()=>{
 assert.equal(recommendations('chest','Templar','pve-dps')[0].id,'Damage Boost');
 assert.equal(recommendations('chest','Templar','pvp-survival')[0].id,'Status Effect Resist');
 assert.ok(recommendations('ring','Templar','pve-dps').some(x=>x.id==='@skill:Punishment'));
 assert.ok(recommendations('ring','Sorcerer','pve-dps').some(x=>x.id==='@skill:Hellfire'));
 assert.ok(!recommendations('ring','Sorcerer','pve-dps').some(x=>x.id==='@skill:Punishment'));
});
test('weapon configurations respect actual physical capacity',()=>{
 const expected=['Combat Speed','Weapon Damage Boost','Damage Boost','Multi-hit Chance','Might','Precision'];
 for(let n=1;n<=5;n++){
  const p=linePlan('weapon','Templar','pve-dps',n);
  assert.deepEqual(p.ranked.map(r=>r.id),expected.slice(0,n));
  assert.equal(p.ranked.length,n);assert.equal(p.alternatives.some(r=>p.ranked.some(q=>q.id===r.id)),false);
 }
 for(const n of [0,6,7,3.5,NaN])assert.equal(linePlan('weapon','Templar','pve-dps',n),null);
});
test('ranked progress counts distinct observed lines, not unknowns or alternatives',()=>{
 const p=linePlan('weapon','Templar','pve-dps',3,'Combat Speed',['Combat Speed','Might','@unknown']);
 assert.equal(p.matched,1);assert.deepEqual(p.missing.map(r=>r.id),['Weapon Damage Boost','Damage Boost']);
 assert.equal(p.recorded,3);
});
test('capacity never creates invented suggestions for unsupported gear',()=>{
 for(const slot of pools)for(const cls of classes)for(const profile of Object.keys(profiles))for(let n=1;n<=5;n++){
  const p=linePlan(slot.id,cls,profile,n);assert.equal(p.ranked.length+p.unranked,n);assert.equal(p.missing.length,p.ranked.length);
  if(slot.manual)assert.equal(p.unranked,n);
 }
});
