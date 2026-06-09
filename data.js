// Shared data + config for all Hour Report pages.
const DATA = {"teams":[{"group":"ENG","team":"M2 TEAM","workers":[{"id":1,"name":"李尔东","role":"主管"},{"id":2,"name":"徐国伟","role":"设计"},{"id":3,"name":"王毛毛","role":"设计"},{"id":4,"name":"王洁","role":"设计"},{"id":5,"name":"王慧","role":"设计"},{"id":6,"name":"许美妮","role":"设计"},{"id":7,"name":"朱婷","role":"设计"},{"id":8,"name":"聂川童","role":"设计"},{"id":9,"name":"李栋","role":"设计"},{"id":10,"name":"李娜","role":"设计"},{"id":11,"name":"胡昇安","role":"校对"},{"id":12,"name":"姜东东","role":"校对"},{"id":13,"name":"吴斌","role":"校对"},{"id":14,"name":"胡建平","role":"校对"}]},{"group":"ENG","team":"M3 TEAM","workers":[{"id":15,"name":"武鑫","role":"主管"},{"id":16,"name":"栗晓晓","role":"设计"},{"id":17,"name":"韩安","role":"设计"},{"id":18,"name":"张强","role":"设计"},{"id":19,"name":"黄志强","role":"设计"},{"id":20,"name":"谢宇国","role":"设计"},{"id":21,"name":"杭文龙","role":"设计"},{"id":22,"name":"张宁","role":"设计"},{"id":23,"name":"孙红华","role":"校对"},{"id":24,"name":"杜艳","role":"校对"}]},{"group":"ENG","team":"IPU","workers":[{"id":25,"name":"郭壮","role":"主管"},{"id":26,"name":"盛文俊","role":"IPU支持"},{"id":27,"name":"魏祥明","role":"校对"},{"id":28,"name":"龙周杰","role":"IPU支持"},{"id":29,"name":"沈秋生","role":"系统工程师"}]},{"group":"ENG","team":"System","workers":[{"id":30,"name":"蒋玥婷","role":"数字化"}]}],"tasks":["订单设计","订单校对","订单沟通","IPU订单支持","Key user类支持","部门内部支持","跨部门支持","会议/培训","加班","休假"]};
const TASK_EN = ["Order design","Order proofreading","Order communication","IPU order support","Key-user support","Internal dept. support","Cross-dept. support","Meeting / training","Overtime","Leave"];
const LEAVE_CATS = ["Annual leave","Sick leave","Maternity/paternity/parental leave","Comp off","Overtime"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const YEAR = 2026;

// ---- Firebase cloud sync config (filled in after project setup) ----
const firebaseConfig = {
  // FIREBASE_CONFIG_PLACEHOLDER
};
