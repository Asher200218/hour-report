// Shared data + config for all Hour Report pages.
let DATA = {"teams":[{"group":"ENG","team":"M2 TEAM","workers":[{"id":1,"name":"李尔东","role":"主管"},{"id":2,"name":"徐国伟","role":"设计"},{"id":3,"name":"王毛毛","role":"设计"},{"id":4,"name":"王洁","role":"设计"},{"id":5,"name":"王慧","role":"设计"},{"id":6,"name":"许美妮","role":"设计"},{"id":7,"name":"朱婷","role":"设计"},{"id":8,"name":"聂川童","role":"设计"},{"id":9,"name":"李栋","role":"设计"},{"id":10,"name":"李娜","role":"设计"},{"id":11,"name":"胡昇安","role":"校对"},{"id":12,"name":"姜东东","role":"校对"},{"id":13,"name":"吴斌","role":"校对"},{"id":14,"name":"胡建平","role":"校对"}]},{"group":"ENG","team":"M3 TEAM","workers":[{"id":15,"name":"武鑫","role":"主管"},{"id":16,"name":"栗晓晓","role":"设计"},{"id":17,"name":"韩安","role":"设计"},{"id":18,"name":"张强","role":"设计"},{"id":19,"name":"黄志强","role":"设计"},{"id":20,"name":"谢宇国","role":"设计"},{"id":21,"name":"杭文龙","role":"设计"},{"id":22,"name":"张宁","role":"设计"},{"id":23,"name":"孙红华","role":"校对"},{"id":24,"name":"杜艳","role":"校对"}]},{"group":"ENG","team":"IPU","workers":[{"id":25,"name":"郭壮","role":"主管"},{"id":26,"name":"盛文俊","role":"IPU支持"},{"id":27,"name":"魏祥明","role":"校对"},{"id":28,"name":"龙周杰","role":"IPU支持"},{"id":29,"name":"沈秋生","role":"系统工程师"}]},{"group":"ENG","team":"System","workers":[{"id":30,"name":"蒋玥婷","role":"数字化"}]}],"tasks":["订单设计","订单校对","订单沟通","IPU订单支持","Key user类支持","部门内部支持","跨部门支持","会议/培训","加班"]};
let TASK_EN = ["Order design","Order proofreading","Order communication","IPU order support","Key-user support","Internal dept. support","Cross-dept. support","Meeting / training","Overtime"];
const LEAVE_CATS = ["Annual leave","Sick leave","Maternity/paternity/parental leave","Comp off"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ---- Multi-year support ----
// curYear is the active year; all storage keys & cloud paths are scoped to it.
let curYear = new Date().getFullYear();
const YEARS_KEY = 'hr_years';
function localYears(){
  const set = new Set([new Date().getFullYear(), 2026, curYear]);
  try{ (JSON.parse(localStorage.getItem(YEARS_KEY))||[]).forEach(y=>set.add(+y)); }catch(e){}
  for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const m=k&&k.match(/^hr_(\d{4})_/); if(m)set.add(+m[1]); }
  return [...set].filter(y=>y>=2000&&y<=2100);
}
function rememberYear(y){
  y=+y; if(!y||y<2000||y>2100)return;
  const ys=new Set(localYears()); ys.add(y);
  localStorage.setItem(YEARS_KEY, JSON.stringify([...ys].sort((a,b)=>a-b)));
}
function allYears(extra){
  const set=new Set(localYears()); (extra||[]).forEach(y=>set.add(+y)); set.add(curYear);
  return [...set].filter(y=>y>=2000&&y<=2100).sort((a,b)=>a-b);
}
// Fill a <select> with known years (+ any cloud `extra`) and an "add new" sentinel.
function fillYearSelect(sel, extra){
  if(!sel)return;
  sel.innerHTML = allYears(extra).map(y=>`<option value="${y}">${y}</option>`).join('')
    + `<option value="__add__">➕ Add year…</option>`;
  sel.value = String(curYear);
}
// Handle a year-select change. Returns true if curYear actually changed.
function onYearSelect(sel){
  if(sel.value==='__add__'){
    const input=prompt('Enter a year to start tracking (e.g. '+(curYear+1)+'):', String(curYear+1));
    const y=parseInt(input,10);
    if(!y||y<2000||y>2100){ sel.value=String(curYear); return false; }
    rememberYear(y); curYear=y; fillYearSelect(sel, []); return true;
  }
  const y=+sel.value; if(y===curYear){ return false; }
  curYear=y; rememberYear(y); fillYearSelect(sel, []); return true;
}

// ---- Firebase cloud sync config ----
const firebaseConfig = {
  apiKey: "AIzaSyDBtCyw2zta-p5x035TXNo6q2Lf0j9kml4",
  authDomain: "hour-report-7b67f.firebaseapp.com",
  databaseURL: "https://hour-report-7b67f-default-rtdb.firebaseio.com",
  projectId: "hour-report-7b67f",
  storageBucket: "hour-report-7b67f.firebasestorage.app",
  messagingSenderId: "202754768533",
  appId: "1:202754768533:web:e1be7837c941d1c169259c"
};

// ---- Dynamic structure: teams / workers / tasks (synced across pages & devices) ----
// DATA.teams / DATA.tasks / TASK_EN above are the built-in defaults. At runtime they
// can be overridden by a saved structure (localStorage now, Firebase `structure` node
// for cross-device sync) so added workers/teams/tasks appear on all three pages.
const STRUCT_KEY = 'hr_structure';
function structSnapshot(){ return { teams: JSON.parse(JSON.stringify(DATA.teams)), tasks: [...DATA.tasks], tasksEn: [...TASK_EN] }; }
// Firebase drops empty arrays and can return arrays as objects, so coerce
// everything back to real arrays before using it.
function asArray(v){ return Array.isArray(v) ? v : (v && typeof v==='object' ? Object.values(v) : null); }
function applyStructure(s){
  if(!s || typeof s!=='object') return false;
  const teams=asArray(s.teams), tasks=asArray(s.tasks), tasksEn=asArray(s.tasksEn);
  if(teams)   DATA.teams = teams.map(t => ({...t, workers: asArray(t.workers)||[]}));
  if(tasks)   DATA.tasks = tasks;
  if(tasksEn) TASK_EN    = tasksEn;
  while(TASK_EN.length < DATA.tasks.length) TASK_EN.push(DATA.tasks[TASK_EN.length]);
  return true;
}
function loadStructureLocal(){ try{ return applyStructure(JSON.parse(localStorage.getItem(STRUCT_KEY))); }catch(e){ return false; } }
function saveStructureLocal(){ try{ localStorage.setItem(STRUCT_KEY, JSON.stringify(structSnapshot())); }catch(e){} }
function nextWorkerId(){ let m=0; DATA.teams.forEach(t=>(t.workers||[]).forEach(w=>{ if(+w.id>m) m=+w.id; })); return m+1; }
function addTask(zh, en){ zh=(zh||'').trim(); if(!zh) return false; DATA.tasks.push(zh); TASK_EN.push((en||'').trim()||zh); return true; }
function addTeam(group, team){ group=(group||'').trim(); team=(team||'').trim(); if(!group||!team) return false; DATA.teams.push({group, team, workers:[]}); return true; }
function addWorker(teamIdx, name, role){ name=(name||'').trim(); const t=DATA.teams[teamIdx]; if(!name||!t) return false; (t.workers=t.workers||[]).push({ id: nextWorkerId(), name, role:(role||'').trim()||'—' }); return true; }
function removeTask(idx){ if(idx<0||idx>=DATA.tasks.length||DATA.tasks.length<=1) return false; DATA.tasks.splice(idx,1); TASK_EN.splice(idx,1); return true; }
function removeTeam(idx){ if(idx<0||idx>=DATA.teams.length||DATA.teams.length<=1) return false; DATA.teams.splice(idx,1); return true; }
function removeWorker(wid){ for(const t of DATA.teams){ const i=(t.workers||[]).findIndex(w=>w.id===wid); if(i>=0){ t.workers.splice(i,1); return true; } } return false; }

// ---- Deletion data hygiene ----
// Hours are stored keyed by task index ("{taskIdx}_{dayOfMonth}"), so removing a task
// must drop its hours and shift every later task's keys down one, or history would be
// silently attributed to the wrong tasks. Worker data is keyed by worker id, and ids
// are reused by nextWorkerId(), so a deleted worker's records must be purged too.
function remapHoursForTaskDelete(h, idx){
  const out={};
  for(const k in h){
    const us=k.indexOf('_'); const ti=us>0?+k.slice(0,us):NaN;
    if(isNaN(ti)){ out[k]=h[k]; continue; }
    if(ti===idx) continue;
    out[ ti>idx ? (ti-1)+k.slice(us) : k ] = h[k];
  }
  return out;
}
// Remap every record saved in this browser (all years/months/workers).
function remapLocalForTaskDelete(idx){
  const keys=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&/^hr_\d{4}_\d+_\d+$/.test(k)) keys.push(k); }
  keys.forEach(k=>{ try{ const v=JSON.parse(localStorage.getItem(k)||'{}'); v.h=remapHoursForTaskDelete(v.h||{}, idx); localStorage.setItem(k, JSON.stringify(v)); }catch(e){} });
}
// Remap the cloud copy (all years). Calls cb when done; safe with db=null.
function remapCloudForTaskDelete(db, idx, cb){
  if(!db){ cb&&cb(); return; }
  db.ref('reports').once('value').then(s=>{
    const all=s.val(); if(!all){ cb&&cb(); return; }
    Object.keys(all).forEach(y=>{ const months=all[y]||{};
      Object.keys(months).forEach(m=>{ const wk=months[m]||{};
        Object.keys(wk).forEach(wid=>{ const r=wk[wid]||{}; r.h=remapHoursForTaskDelete(r.h||{}, idx); });
      });
    });
    db.ref('reports').set(all).then(()=>cb&&cb()).catch(()=>cb&&cb());
  }).catch(()=>cb&&cb());
}
// Delete every saved record for the given worker ids (this browser + cloud, all years).
function purgeWorkersData(db, wids){
  const set=new Set(wids.map(Number));
  const keys=[]; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); const m=k&&k.match(/^hr_\d{4}_\d+_(\d+)$/); if(m&&set.has(+m[1])) keys.push(k); }
  keys.forEach(k=>localStorage.removeItem(k));
  if(!db) return;
  db.ref('reports').once('value').then(s=>{
    const all=s.val(); if(!all) return;
    const updates={};
    Object.keys(all).forEach(y=>Object.keys(all[y]||{}).forEach(m=>Object.keys(all[y][m]||{}).forEach(wid=>{
      if(set.has(+wid)) updates[`reports/${y}/${m}/${wid}`]=null;
    })));
    if(Object.keys(updates).length) db.ref().update(updates).catch(()=>{});
  }).catch(()=>{});
}
// Firebase helpers (db may be null — all guard internally).
function pushStructure(db){ if(db){ try{ db.ref('structure').set(structSnapshot()).catch(()=>{}); }catch(e){} } }
function fetchStructure(db, cb){
  if(!db){ cb&&cb(); return; }
  db.ref('structure').once('value').then(s=>{ const v=s.val(); if(v){ applyStructure(v); saveStructureLocal(); } cb&&cb(); }).catch(()=>{ cb&&cb(); });
}
function watchStructure(db, onChange){
  if(!db) return;
  db.ref('structure').on('value', s=>{
    const v=s.val();
    if(v){ applyStructure(v); saveStructureLocal(); onChange&&onChange(); }
    else { pushStructure(db); } // seed cloud from current (default) structure on first run
  }, ()=>{});
}
// Apply any structure already saved on this device, before the pages render.
loadStructureLocal();

// ---- Print auto-fit ----
// The hour grid is far wider than a printed page, and the on-screen scroll container
// would clip it. Just for printing, scale each table down to the printable width of
// A4 landscape; afterprint restores the screen layout untouched.
window.addEventListener('beforeprint', function(){
  var avail=1060; // ~A4 landscape width minus 8mm margins at 96dpi
  document.querySelectorAll('.tablewrap').forEach(function(w){
    var t=w.querySelector('table'); if(!t) return;
    var z=Math.min(1, avail/t.scrollWidth);
    if(z<1) w.style.zoom=z;
  });
});
window.addEventListener('afterprint', function(){
  document.querySelectorAll('.tablewrap').forEach(function(w){ w.style.zoom=''; });
});
