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
function applyStructure(s){
  if(!s || typeof s!=='object') return false;
  if(Array.isArray(s.teams))   DATA.teams = s.teams;
  if(Array.isArray(s.tasks))   DATA.tasks = s.tasks;
  if(Array.isArray(s.tasksEn)) TASK_EN    = s.tasksEn;
  return true;
}
function loadStructureLocal(){ try{ return applyStructure(JSON.parse(localStorage.getItem(STRUCT_KEY))); }catch(e){ return false; } }
function saveStructureLocal(){ try{ localStorage.setItem(STRUCT_KEY, JSON.stringify(structSnapshot())); }catch(e){} }
function nextWorkerId(){ let m=0; DATA.teams.forEach(t=>(t.workers||[]).forEach(w=>{ if(+w.id>m) m=+w.id; })); return m+1; }
function addTask(zh, en){ zh=(zh||'').trim(); if(!zh) return false; DATA.tasks.push(zh); TASK_EN.push((en||'').trim()||zh); return true; }
function addTeam(group, team){ group=(group||'').trim(); team=(team||'').trim(); if(!group||!team) return false; DATA.teams.push({group, team, workers:[]}); return true; }
function addWorker(teamIdx, name, role){ name=(name||'').trim(); const t=DATA.teams[teamIdx]; if(!name||!t) return false; (t.workers=t.workers||[]).push({ id: nextWorkerId(), name, role:(role||'').trim()||'—' }); return true; }
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
