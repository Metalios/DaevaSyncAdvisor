import { gearTypes, baseCapacity, totalCapacity } from './capacity.js';
import { pools } from './pools.js';
import { classes, skillNames } from './skills.js';
import { profiles, equipmentPlan } from './recommendations.js';
import { cumulative } from './probability.js';
import { JOURNAL_KEY, UNLISTED, UNKNOWN, regions, rarities, reportOptions, labelOutcome, validateReport, journalCsv } from './journal.js';
const $ = id => document.getElementById(id);
const el = (tag, text='', cls='') => { const node=document.createElement(tag);node.textContent=text;if(cls)node.className=cls;return node; };
const opt = (v,t) => new Option(t,v);
const fmt = p => !Number.isFinite(p)?'—':p>0&&p<.00005?'<0.01%':p<1&&p>.99995?'>99.99%':`${(p*100).toFixed(2)}%`;
const safeStorage = (key, fallback) => {try {return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}};
const saveStorage = (key,value) => {try {localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
let journal=safeStorage(JOURNAL_KEY,[]);journal=Array.isArray(journal)?journal.filter(r=>r && validateReport(r)):[];
const legacyJournal=safeStorage('daeva-sync-journal-v1',[]);
const legacyCount=Array.isArray(legacyJournal)?legacyJournal.length:0;
let estimate=false;
const pool=()=>pools.find(p=>p.id===$('slot').value);
const count=()=>baseCapacity(pool().id,$('gear-type').value);
const fused=()=>$('soul-fuse').value==='yes';
const total=()=>totalCapacity(pool().id,$('gear-type').value,fused());
const targetLabel=()=> $('target').selectedOptions[0]?.textContent??'';
function baseRate(){const p=pool(),id=$('target').value;if(!id||id==='@custom')return null;if(id.startsWith('@skill:'))return p.skill==='active'?20/12:p.skill==='passive'?2:null;return Object.hasOwn(p.stats,id)?p.stats[id]*(p.split??.8):null;}
function populateTargets(){const p=pool();$('target').replaceChildren(opt('','Choose one stat'));for(const name of Object.keys(p.stats).sort())$('target').add(opt(name,name));if(p.skill)for(const name of skillNames($('class').value,p.skill))$('target').add(opt(`@skill:${name}`,`${name} +1`));$('target').add(opt('@custom','Other / unlisted stat (manual rate)'));resetRate();}
function resetRate(){estimate=false;$('rate').value='';render();}
function chooseTarget(id){$('target').value=id;resetRate();}
function drawPlan(){
 const base=count(),plan=equipmentPlan(pool().id,$('class').value,$('profile').value,base,fused());
 $('bis-context').textContent=base===null?`${pool().name} · capacity unavailable`:`${pool().name} · ${total()} total lines (${base} base${fused()?' + 1 Soul Fuse':''})`;
 const list=$('recommendations'),alts=$('alternatives'),fuseNote=$('fuse-note');list.replaceChildren();alts.replaceChildren();fuseNote.hidden=true;
 if(!plan){$('bis-note').textContent='Select a supported equipment family. No custom stat line count or BiS configuration is inferred.';return;}
 function addTarget(r){const b=el('button',r.label,'bis-target');b.type='button';b.setAttribute('aria-pressed',String($('target').value===r.id));b.addEventListener('click',()=>chooseTarget(r.id));return b;}
 for(const r of plan.ranked){const li=el('li');li.append(addTarget(r));list.append(li);}
 for(let i=0;i<plan.unranked;i++)list.append(el('li','No supported recommendation for this line','muted unresolved'));
 if(fused()){
  const li=el('li','','fuse-target');
  li.append(el('span','Soul Fuse · additional line','fuse-tag'));
  li.append(el('span',plan.fuseCandidate?.label??'No supported recommendation','fuse-candidate'));
  list.append(li);fuseNote.hidden=false;fuseNote.textContent='Extra line: next suggested stat from the ordinary pool, for planning only. Soul Fuse-specific eligibility and Sync rates are not verified.';
 }
 $('bis-note').textContent=plan.unranked?'The available guide does not support a complete ranked configuration for this item.':`Showing ${base} ordinary targets${fused()?' and one separate Soul Fuse line':''}.`;
 for(const r of plan.alternatives){const b=el('button',r.label,'alternative');b.type='button';b.addEventListener('click',()=>chooseTarget(r.id));alts.append(b);}if(!plan.alternatives.length)alts.append(el('p','No additional ranked suggestions.','muted small'));
}
function render(){drawPlan();const rateText=$('rate').value.trim(),v=Number(rateText),n=Number($('stones').value),b=baseRate(),selected=Boolean($('target').value);const valid=selected&&rateText!==''&&Number.isFinite(v)&&v>=0&&v<=100&&Number.isInteger(n)&&n>=1&&n<=10000;const p=valid?v/100:NaN,q=cumulative(p,n);$('rate').disabled=!selected;$('use-estimate').disabled=b===null;$('use-estimate').textContent=b===null?'No base estimate':`Use ${fmt(b/100)} estimate`;
 $('rate-status').textContent=!selected?'Choose a stat first.':estimate?'Provisional base-binding estimate, not a verified Sync-specific rate.':rateText!==''?'User-entered rate; confirm it is applicable to the current single line.':b===null?'No base estimate available. Enter a known single-line rate.':'Enter a known single-line rate, or explicitly use the provisional base estimate.';
 $('result-card').dataset.ready=String(Number.isFinite(q));$('result').textContent=fmt(q);$('per-stone').textContent=fmt(p);$('miss').textContent=fmt(1-q);$('result-fill').style.width=`${Number.isFinite(q)?q*100:0}%`;$('result-label').textContent=selected?`${targetLabel()} · ${Number.isInteger(n)&&n>=1?n:'—'} ${n===1?'stone':'stones'}`:'Select a target to calculate your odds';$('copy-current').disabled=!valid;$('minus').disabled=n<=1;$('plus').disabled=n>=10000;
 for(const btn of $('quick').children)btn.setAttribute('aria-pressed',String(Number(btn.dataset.n)===n));
 const body=$('odds');body.replaceChildren();for(let i=1;i<=10;i++){const tr=el('tr');if(i===n)tr.className='selected';const prob=cumulative(p,i);tr.append(el('td',String(i)),el('td',fmt(prob)),el('td',fmt(1-prob)));body.append(tr);}
}
function setCount(n){$('stones').value=String(Math.max(1,Math.min(10000,Math.trunc(Number.isFinite(n)?n:1))));render();}
async function copy(text){try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(text);$('status').textContent='Copied for Discord.';}catch{$('copy-text').value=text;if(!$('copy-dialog').open)$('copy-dialog').showModal();$('copy-text').select();}}
function currentSummary(){const n=Number($('stones').value),p=Number($('rate').value)/100,q=cumulative(p,n);copy(`**DaevaArchitect · Global Sync Stone Advisor**\n${$('class').value} · ${pool().name} · ${count()??'Unknown'} ordinary lines${fused()?' + 1 Soul Fuse':''}\nTarget: ${targetLabel()}\n${n} Sync Stones · ${fmt(p)} per stone\nSuccess: **${fmt(q)}** · Miss: ${fmt(1-q)}\n${estimate?'Provisional base estimate (not verified Sync rate).':'User-entered rate.'} One stat only; constant independent odds. Not guaranteed.`);}
function reportDraft(){return {className:$('log-class').value,slot:$('log-item').value,region:$('log-region').value,itemRarity:$('log-rarity').value,gearType:$('log-type').value,lineCount:String(baseCapacity($('log-item').value,$('log-type').value)??'unknown'),fuseStatus:$('log-fuse').value,lineKind:$('log-kind').value,before:$('log-before').value,after:$('log-after').value};}
function updateReportButton(){$('log-add').disabled=!validateReport(reportDraft())||journal.length>=10000;}
function populateReportOutcomes(){
  const groups=reportOptions($('log-item').value,$('log-class').value);
  for(const id of ['log-before','log-after']){
    const select=$(id);select.replaceChildren(opt('',id==='log-before'?'Select previous stat':'Select actual result'));
    for(const group of groups){const g=el('optgroup');g.label=group.label;for(const entry of group.options)g.append(opt(entry.id,entry.label));select.append(g);}
  }
  updateReportButton();
}
function initializeReporting(){
  for(const name of classes)$('log-class').add(opt(name,name));$('log-class').value=$('class').value;
  for(const p of pools)$('log-item').add(opt(p.id,p.name.replace(' (manual only)','')));$('log-item').value=$('slot').value;
  for(const name of regions)$('log-region').add(opt(name,name));$('log-region').value='Not specified';
  for(const name of rarities)$('log-rarity').add(opt(name,name));$('log-rarity').value='Other / not sure';
  populateGearTypes($('log-type'),$('log-item').value,true); updateLogCapacity();
  $('log-class').addEventListener('change',populateReportOutcomes);
  $('log-item').addEventListener('change',()=>{populateGearTypes($('log-type'),$('log-item').value,true);updateLogCapacity();populateReportOutcomes();});
  for(const id of ['log-type','log-fuse'])$(id).addEventListener('change',()=>{updateLogCapacity();updateReportButton();});
  for(const id of ['log-before','log-after','log-region','log-rarity','log-kind'])$(id).addEventListener('change',updateReportButton);
  populateReportOutcomes();
}
function drawJournal(message=''){
  const root=$('log-list');root.replaceChildren();
  const incomplete=journal.filter(r=>[r.before,r.after].some(x=>x===UNLISTED||x===UNKNOWN)).length;
  $('log-count').textContent=`${journal.length} recorded attempt${journal.length===1?'':'s'} · ${incomplete} incomplete. ${message}${legacyCount?' Older free-text reports are preserved separately in browser storage; use v0.4 to them.':''}`;
  for(const entry of journal.slice(-5).reverse()){
    const row=el('div','','allocation-row'),info=el('div');const slot=pools.find(p=>p.id===entry.slot)?.name??entry.slot;
    info.append(el('strong',`${entry.className} · ${slot}`),el('p',`${labelOutcome(entry.before)} → ${labelOutcome(entry.after)} · ${entry.lineKind??'legacy line type unknown'}`,'small muted'));
    const undo=el('button','Remove');undo.type='button';undo.setAttribute('aria-label',`Remove report ${entry.id}`);undo.addEventListener('click',()=>{journal=journal.filter(r=>r.id!==entry.id);const saved=saveStorage(JOURNAL_KEY,journal);drawJournal(saved?'Report removed.':'Storage unavailable; before closing.');});row.append(info,undo);root.append(row);
  }
  $('log-export').disabled=!journal.length;$('log-clear').disabled=!journal.length;updateReportButton();
}
function logAttempt(){
  const record=reportDraft();if(!validateReport(record)){drawJournal('Select valid equipment and observed outcomes.');return;}
  if(journal.length>=10000){drawJournal('Journal full; before clearing.');return;}
  const id=globalThis.crypto?.randomUUID?.()??`${Date.now()}-${Math.random().toString(36).slice(2)}`;
  journal.push({schemaVersion:4,id,date:new Date().toISOString(),...record});
  const saved=saveStorage(JOURNAL_KEY,journal);
  // The next roll starts from the actual replacement; require an explicit new result.
  $('log-before').value=record.after===UNKNOWN?'':record.after;$('log-after').value='';drawJournal(saved?'Saved locally.':'Storage unavailable; before closing.');
}
function exportJournal(){const csv=journalCsv(journal);const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=el('a');a.href=url;a.download='aion2-sync-reports-v4.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

for(const name of classes)$('class').add(opt(name,name));$('class').value='Templar';
for(const [id,name] of Object.entries(profiles))$('profile').add(opt(id,name));
for(const p of pools)$('slot').add(opt(p.id,p.name));
populateGearTypes($('gear-type'),$('slot').value);
for(const n of [1,3,4,5,10]){const b=el('button',String(n));b.type='button';b.dataset.n=String(n);b.setAttribute('aria-label',`Use ${n} stones`);b.addEventListener('click',()=>setCount(n));$('quick').append(b);}
function populateGearTypes(select,slot,report=false){
 const old=select.value,types=gearTypes(slot);
 select.replaceChildren(opt('unknown',report?'Not sure / unlisted equipment':'Choose equipment type'));
 for(const [id,t] of types)select.add(opt(id,`${t.label} — ${t.base} lines`));
 select.value=types.some(([id])=>id===old)?old:report?'unknown':types.some(([id])=>id==='dungeon')?'dungeon':'unknown';
}
function updateCapacityNote(){const base=count();$('soul-fuse').disabled=base===null;if(base===null)$('soul-fuse').value='no';$('capacity-note').textContent=base===null?'No supported equipment family selected; capacity unavailable.':`${base} base + ${Number(fused())} Soul Fuse = ${total()} total stat lines. Match the family to your actual item.`;}
function updateLogCapacity(){const base=baseCapacity($('log-item').value,$('log-type').value),fuse=$('log-fuse').value;$('log-capacity').textContent=base===null?'Capacity not recorded.':`${base} base lines${fuse==='yes'?' + 1 Soul Fuse':fuse==='unknown'?' · Soul Fuse unknown':''}.`;if(fuse!=='yes'&&$('log-kind').value==='fuse')$('log-kind').value='ordinary';$('log-kind').querySelector('option[value="fuse"]').disabled=fuse!=='yes';}
$('slot').addEventListener('change',()=>{populateGearTypes($('gear-type'),$('slot').value);$('soul-fuse').value='no';updateCapacityNote();populateTargets();});$('class').addEventListener('change',populateTargets);$('profile').addEventListener('change',render);$('gear-type').addEventListener('change',()=>{updateCapacityNote();resetRate();});$('soul-fuse').addEventListener('change',()=>{updateCapacityNote();resetRate();});$('target').addEventListener('change',resetRate);$('rate').addEventListener('input',()=>{estimate=false;render();});$('use-estimate').addEventListener('click',()=>{const b=baseRate();if(b!==null){estimate=true;$('rate').value=String(b);render();}});$('stones').addEventListener('input',render);$('stones').addEventListener('change',()=>setCount(Number($('stones').value)));$('minus').addEventListener('click',()=>setCount(Number($('stones').value)-1));$('plus').addEventListener('click',()=>setCount(Number($('stones').value)+1));$('copy-current').addEventListener('click',currentSummary);
$('log-add').addEventListener('click',logAttempt);$('log-export').addEventListener('click',exportJournal);$('log-clear').addEventListener('click',()=>{if(confirm('Clear the local journal? Export first if needed.')){journal=[];saveStorage(JOURNAL_KEY,journal);drawJournal();}});
updateCapacityNote();populateTargets();initializeReporting();drawJournal();
