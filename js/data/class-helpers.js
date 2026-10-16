'use strict';
/* Hàm làm việc với dữ liệu lớp: tổ, chức vụ, sơ đồ, đồng bộ, danh sách admin */
function POSG(r){var m=/^Tổ trưởng Tổ (\d)$/.exec(r);return m?+m[1]-1:-1}
function groupsOf(c){var g=[[],[],[],[]];c.students.forEach(function(s,i){g[i%4].push(s)});return g}
function holder(c,r){var m=c.committee.filter(function(x){return x.r===r})[0];return m?m.w:''}
function cloneG(g){return g.map(function(d){return{seats:d.seats.slice()}})}
function buildGrid(names,rows,cols,spd){var d=[],idx=0;for(var i=0;i<rows*cols;i++){var s=[];for(var k=0;k<spd;k++){s.push(names[idx]||null);idx++}d.push({seats:s})}return d}
function wkData(c,w){return c.weeks[w]||(c.weeks[w]={pins:[],rem:[],ev:[]})}
function rd(c,w){return c.reads[w]||(c.reads[w]={n:0,me:false})}
function fixGrid(g,set,students){
  if(!g)return;
  var placed={};
  g.forEach(function(d){d.seats=d.seats.map(function(s){if(s&&set[s]&&!placed[s]){placed[s]=1;return s}return null})});
  students.forEach(function(s){
    if(placed[s])return;
    for(var i=0;i<g.length;i++){var j=g[i].seats.indexOf(null);if(j>-1){g[i].seats[j]=s;placed[s]=1;return}}
  });
}
function syncDerived(c){
  var set={};c.students.forEach(function(s){set[s]=1});
  c.committee.forEach(function(m){if(!set[m.w])m.w=''});
  Object.keys(c.el.cands).forEach(function(k){c.el.cands[k]=c.el.cands[k].filter(function(x){return set[x.n]})});
  c.students.forEach(function(s,k){if(!c.info[s])c.info[s]={email:'',phone:'',subj:'',talent:''}});
  Object.keys(c.reads).forEach(function(k){c.reads[k].n=Math.min(c.reads[k].n,c.students.length)});
  fixGrid(c.map.grid,set,c.students);fixGrid(c.map.saved,set,c.students);
}
function renameStudent(c,old,nw){
  var i=c.students.indexOf(old);c.students[i]=nw;
  c.committee.forEach(function(m){if(m.w===old)m.w=nw});
  Object.keys(c.el.cands).forEach(function(k){c.el.cands[k].forEach(function(x){if(x.n===old)x.n=nw})});
  c.info[nw]=c.info[old];delete c.info[old];
  [c.map.grid,c.map.saved].forEach(function(g){if(g)g.forEach(function(d){d.seats=d.seats.map(function(s){return s===old?nw:s})})});
  if(S.name===old)S.name=nw;
}
function adminList(c,com){
  var out=[],idx={};com=com||c.committee;
  c.teachers.forEach(function(t){if(t.gv){idx[t.n]=out.length;out.push({n:t.n,t:'Giáo viên chủ nhiệm'})}});
  com.forEach(function(m){
    if(m.w&&ADMIN_POS.indexOf(m.r)>-1){if(idx[m.w]!=null)out[idx[m.w]].t+=', '+m.r;else{idx[m.w]=out.length;out.push({n:m.w,t:m.r})}}
  });
  return out;
}
