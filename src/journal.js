import {baseCapacity} from './capacity.js';
import { pools } from './pools.js';
import { classes, skillNames } from './skills.js';
export const JOURNAL_KEY = 'daeva-sync-journal-v2';
export const UNLISTED = '@unlisted';
export const UNKNOWN = '@unknown';
export const regions = ['NA East','NA West','Europe','Latin America','Asia','Not specified'];
export const rarities = ['Common','Rare','Epic','Unique','Heroic','Other / not sure'];
export function reportOptions(slot, className) {
  const pool = pools.find(p=>p.id===slot);
  if (!pool || !classes.includes(className)) return [];
  const known = Object.keys(pool.stats).sort().map(name=>({id:`stat:${name}`,label:name}));
  const skills = (pool.skill ? skillNames(className,pool.skill) : skillNames(className)).map(name=>({id:`skill:${name}`,label:`${name} +1`}));
  // Also allow unexpected actual results to be recorded without assigning a fictional probability.
  const extraStats = [...new Set(pools.flatMap(p=>Object.keys(p.stats)))].filter(name=>!Object.hasOwn(pool.stats,name)).sort().map(name=>({id:`stat:${name}`,label:name}));
  const extraSkills = skillNames(className).filter(name=>!pool.skill || !skillNames(className,pool.skill).includes(name)).map(name=>({id:`skill:${name}`,label:`${name} +1`}));
  return [{label:'Listed stat pool (provisional)',options:known},{label:pool.skill?`Listed ${pool.skill} skills (provisional)`:'Class mastery skills — eligibility unverified',options:skills},{label:'Other known stats — eligibility unverified',options:extraStats},{label:'Other class skills — eligibility unverified',options:extraSkills.filter(x=>!skills.some(y=>y.id===x.id))},{label:'Incomplete observation',options:[{id:UNLISTED,label:'Unlisted stat / skill'},{id:UNKNOWN,label:'Not observed / unknown'}]}].filter(g=>g.options.length);
}
export function labelOutcome(id) {
  if(id===UNLISTED)return 'Unlisted stat / skill';
  if(id===UNKNOWN)return 'Not observed / unknown';
  if(id.startsWith('skill:'))return `${id.slice(6)} +1`;
  if(id.startsWith('stat:'))return id.slice(5);
  return 'Unknown';
}
export function validateReport(record) {
  if(!classes.includes(record.className)||!pools.some(p=>p.id===record.slot)||!regions.includes(record.region)||!rarities.includes(record.itemRarity))return false;
  const valid=new Set(reportOptions(record.slot,record.className).flatMap(g=>g.options.map(x=>x.id)));
  if(record.schemaVersion===4){const base=baseCapacity(record.slot,record.gearType);if(record.gearType!=='unknown'&&base===null)return false;if(record.lineCount!==String(base??'unknown'))return false;}
  if(record.schemaVersion===3 || record.lineKind!==undefined){if(!['unknown','no','yes'].includes(record.fuseStatus)||!['ordinary','fuse','unknown'].includes(record.lineKind)|| (record.lineKind==='fuse'&&record.fuseStatus!=='yes') || !['unknown','1','2','3','4','5'].includes(record.lineCount))return false;}
  return valid.has(record.before)&&valid.has(record.after)&&['unknown','1','2','3','4','5','6','7','8','9','10'].includes(record.lineCount);
}
export function journalCsv(rows) {
  const keys=['schemaVersion','id','date','region','className','slot','itemRarity','lineCount','before','after','fuseStatus','lineKind','gearType'];
  const escape=v=>{let s=String(v??'');if(/^[\s]*[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  return [keys.join(','),...rows.map(row=>keys.map(key=>escape(row[key])).join(','))].join('\r\n');
}
