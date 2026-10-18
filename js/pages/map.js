'use strict';
/* Trang Class Map: tạo, sắp xếp, đổi chỗ, xác nhận sơ đồ lớp */
var FEMALE=['thị','ngọc','diệu','kim','tuyết','huyền','linh','trang','my','lan','hoa','mai','thu','thảo','nhung','yến','phương','uyên','trinh','giang','hà','châu','vy','hương','ngân','chi','hạnh','oanh'];
var MALE=['văn','hữu','đức','quốc','công','minh','mạnh','tuấn','khôi','hùng','dũng','trung','bình','long','sơn','nam','phúc','thành','an','dương','việt','khoa','hiếu','quân','thắng'];
/* Class Map */
function guessGender(n){
  var w=n.toLowerCase().split(/\s+/).slice(1);
  if(w.some(function(x){return FEMALE.indexOf(x)>-1}))return 'F';
  if(w.some(function(x){return MALE.indexOf(x)>-1}))return 'M';
  return null;
}
function shuffle(a){var r=a.slice();for(var i=r.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=r[i];r[i]=r[j];r[j]=t}return r}
function interleave(names,sw){
  var m=[],f=[],t=true;
  names.forEach(function(n){var g=guessGender(n);if(g==='M')m.push(n);else if(g==='F')f.push(n);else{if(t)m.push(n);else f.push(n);t=!t}});
  if(sw){m=shuffle(m);f=shuffle(f)}
  var r=[],mx=Math.max(m.length,f.length);
  for(var i=0;i<mx;i++){if(i<m.length)r.push(m[i]);if(i<f.length)r.push(f[i])}
  return r;
}
function fmtName(name){
  var w=name.trim().split(/\s+/);
  if(w.length>=3){var m=Math.ceil(w.length/2);return{l1:w.slice(0,m).join(' '),l2:w.slice(m).join(' ')}}
  return{l1:name,l2:''};
}
function capHTML(c){var mp=c.map,cap=mp.rows*mp.cols*mp.spd,n=c.students.length;return 'Sức chứa '+cap+' chỗ, lớp có '+n+' học sinh.'+(cap<n?' <span class="err">Thiếu '+(n-cap)+' chỗ.</span>':'')}
function seatHTML(name,di,si,inter){
  var k=di+'-'+si,cls='st'+(S.sel===k?' sel':'')+(S.swp.indexOf(k)>-1?' sw':'')+(name?'':' em'),f=name?fmtName(name):null;
  return '<button type="button" class="'+cls+'" data-act="mseat" data-k="'+k+'"'+(inter?'':' disabled')+(name?' title="'+esc(name)+'"':' aria-label="Chỗ trống"')+'>'+(name?(f.l2?'<span>'+esc(f.l1)+'</span><span>'+esc(f.l2)+'</span>':esc(f.l1)):'·')+'</button>';
}
function boardHTML(c,grid,inter){
  var mp=c.map,nc=mp.cols,w=Math.max(nc*mp.spd*70+(nc-1)*8,300),cs='grid-template-columns:repeat('+nc+',minmax(0,1fr))';
  var top=nc>1?'<div class="mrow" style="'+cs+'"><div class="tdesk">Bàn giáo viên</div><div class="bdb" style="grid-column:span '+(nc-1)+'">BẢNG</div></div>'
    :'<div class="mrow"><div class="tdesk">Bàn giáo viên</div><div class="bdb">BẢNG</div></div>';
  var desks='<div class="dgrid" style="'+cs+'">'+grid.map(function(d,di){return '<div class="desk">'+d.seats.map(function(s,si){return seatHTML(s,di,si,inter)}).join('')+'</div>'}).join('')+'</div>';
  return '<div class="scroll"><div style="min-width:'+w+'px">'+top+desks+'</div></div>';
}
function vMap(){
  var c=cur(),mp=c.map,a=admin(),n=c.students.length;
  var h=head('Sơ đồ lớp',esc(c.name)+' · '+n+' học sinh')+lockNote();
  var mode=a?mp.mode:'confirmed';
  if(mode==='setup'){
    var step=function(k,t,body){return '<div><div class="stp"><span class="sn">'+k+'</span><b>'+t+'</b></div><div class="fg">'+body+'</div></div>'};
    var cfg='<section class="card"><div class="fg" style="gap:18px">'+
      step(1,'Thông tin và bàn học','<div class="g2"><div><label for="mr">Số hàng ngang</label><input type="text" inputmode="numeric" id="mr" data-m="rows" value="'+mp.rows+'"></div><div><label for="mcc">Số hàng dọc</label><input type="text" inputmode="numeric" id="mcc" data-m="cols" value="'+mp.cols+'"></div></div>'+
        '<div><label for="ms">Mỗi bàn</label><select id="ms" data-m="spd">'+[1,2,3,4,5,6].map(function(k){return '<option value="'+k+'"'+(k===mp.spd?' selected':'')+'>'+k+' học sinh</option>'}).join('')+'</select></div>'+
        '<div class="note" id="cap">'+capHTML(c)+'</div><button class="btn" data-act="mgen">'+ic('layout-grid',15)+'Tạo sơ đồ bàn</button>')+
      step(2,'Danh sách học sinh','<p class="note">Lấy từ mục Thông tin lớp: '+n+' học sinh.</p><button class="btn gh" data-go="settings">Chỉnh danh sách</button>')+
      step(3,'Sắp xếp','<label class="chk"><input type="checkbox" id="mag" data-m="ag"'+(mp.ag?' checked':'')+'> Nam/nữ xen kẽ</label><label class="chk"><input type="checkbox" id="mrnd" data-m="rnd"'+(mp.rnd?' checked':'')+'> Ngẫu nhiên</label><button class="btn" data-act="msort">Sắp xếp tự động</button>')+
      (mp.saved?'<button class="btn gh" data-act="mcancel">Huỷ, giữ sơ đồ cũ</button>':'')+'</div></section>';
    var ph='<section class="card"><div class="empty" style="border:0">'+ic('layout-grid',34)+'<p>Nhập thông tin bàn học rồi bấm Tạo sơ đồ bàn.</p></div></section>';
    return h+'<div class="mapg">'+cfg+ph+'</div>';
  }
  if(mode==='preview'){
    return h+'<section class="card" style="border-color:var(--acc)">'+boardHTML(c,mp.grid,true)+'</section>'+
      '<div class="ft"><span class="note">Xem lại sơ đồ. Bấm hai học sinh để đổi chỗ cho nhau.</span><span class="acts"><button class="btn gh" data-act="mreset">'+ic('chevron-left',15)+'Làm lại</button><button class="btn" data-act="mconfirm">'+ic('check',15)+'Xác nhận sơ đồ</button></span></div>';
  }
  var g=a?mp.grid:mp.saved,missing=0;
  if(a){var have={};g.forEach(function(d){d.seats.forEach(function(s){if(s)have[s]=1})});c.students.forEach(function(s){if(!have[s])missing++})}
  return h+'<div class="bar"><span class="note">Sơ đồ đã xác nhận.</span><span class="grow"></span>'+(a?'<button class="btn" data-act="mnew">'+ic('edit',15)+'Tạo sơ đồ mới</button>':'')+'</div>'+
    (missing?'<div class="banner">'+ic('lock',16)+'<span>'+missing+' học sinh chưa có chỗ vì sơ đồ đã đầy. Bấm Tạo sơ đồ mới để sắp lại.</span></div>':'')+
    '<section class="card">'+boardHTML(c,g,false)+'</section>';
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur(),mp=c.map;
  if(act==='mgen'){
    if(mp.rows*mp.cols*mp.spd<c.students.length){toast('Chưa đủ chỗ cho cả lớp, tăng số hàng hoặc số học sinh mỗi bàn');return}
    mp.grid=buildGrid(c.students,mp.rows,mp.cols,mp.spd);mp.mode='preview';S.sel=null;render();
  }
  else if(act==='msort'){
    if(!mp.ag&&!mp.rnd){toast('Chọn ít nhất một tuỳ chọn trước nhé');return}
    if(mp.rows*mp.cols*mp.spd<c.students.length){toast('Chưa đủ chỗ cho cả lớp, tăng số hàng hoặc số học sinh mỗi bàn');return}
    var nm=c.students.slice();if(mp.rnd)nm=shuffle(nm);if(mp.ag)nm=interleave(nm,mp.rnd);
    mp.grid=buildGrid(nm,mp.rows,mp.cols,mp.spd);mp.mode='preview';S.sel=null;render();
  }
  else if(act==='mconfirm'){mp.saved=cloneG(mp.grid);mp.mode='confirmed';S.sel=null;render();toast('Đã xác nhận sơ đồ lớp')}
  else if(act==='mreset'){mp.mode='setup';S.sel=null;render()}
  else if(act==='mnew'){mp.mode='setup';S.sel=null;render()}
  else if(act==='mcancel'){mp.grid=cloneG(mp.saved);mp.mode='confirmed';render()}
  else if(act==='mseat'){
    if(!admin()||mp.mode!=='preview')return;
    var k=a.dataset.k;
    if(!S.sel){S.sel=k;render();return}
    if(S.sel===k){S.sel=null;render();return}
    var p1=S.sel.split('-').map(Number),p2=k.split('-').map(Number),g=mp.grid,tmp=g[p1[0]].seats[p1[1]];
    g[p1[0]].seats[p1[1]]=g[p2[0]].seats[p2[1]];g[p2[0]].seats[p2[1]]=tmp;
    S.swp=[S.sel,k];S.sel=null;render();
    setTimeout(function(){S.swp=[];Array.prototype.forEach.call(document.querySelectorAll('.st.sw'),function(el){el.classList.remove('sw')})},700);
  }
});

document.addEventListener('change',function(e){
  var t=e.target,c=cur();
  if(t.dataset.m){
    var mp=c.map,key=t.dataset.m;
    if(key==='ag'||key==='rnd')mp[key]=t.checked;
    else{mp[key]=Math.max(1,Math.min(key==='spd'?6:12,parseInt(t.value,10)||1));t.value=mp[key];$('cap').innerHTML=capHTML(c)}
  }
});
