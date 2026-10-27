'use strict';
/* Trang Event: bản tin tuần, trực nhật, thêm thông tin, tìm kiếm, tooltip */
/* Event */
function rowsHTML(){
  var c=cur(),d=wkData(c,S.week),q=S.q;
  var rows=d.ev.map(function(e,i){return{e:e,i:i}}).sort(function(a,b){return a.e.d-b.e.d||a.i-b.i}).filter(function(x){return !q||(x.e.t+x.e.c+(x.e.det||'')).toLowerCase().indexOf(q)>-1});
  var can=canEdit();
  if(!rows.length)return '<tr><td class="rn">1</td><td colspan="'+(can?6:5)+'" class="mu">Không có lịch trình.</td></tr>';
  return rows.map(function(x,k){var e=x.e;return '<tr data-i="'+x.i+'"><td class="rn">'+(k+1)+'</td><td>'+DAYS[e.d]+'</td><td>'+ds(S.week,e.d)+'</td><td>'+esc(e.t)+'</td><td><span class="tag t-'+CL[e.c]+'">'+e.c+'</span></td><td>'+(e.f?'<span class="file">'+ic('paperclip',13)+esc(e.f)+'</span>':'<span class="mu">-</span>')+'</td>'+
    (can?'<td class="racts">'+actBtns('ev',x.i,e.t)+'</td>':'')+'</tr>'}).join('');
}
/* Phân công trực nhật: nếu admin đã chỉnh tay thì dùng d.duty = {tasks:[tên việc], cells:{'việc_thứ':[tên,...]}}, nếu không thì tự xoay vòng theo danh sách lớp */
function dutyData(c,wk){
  var d=wkData(c,wk);if(d.duty)return d.duty;
  var tasks=['Quét lớp','Tưới cây'],n=c.students.length,sh=(wk-CUR)*8,cells={};
  if(n)tasks.forEach(function(t,r){[0,1,2,3,4].forEach(function(dd){var i=(((r*5+dd)*2+sh)%n+n)%n;cells[r+'_'+dd]=[c.students[i],c.students[(i+1)%n]]})});
  return{tasks:tasks,cells:cells,auto:true};
}
function dutyHTML(c,wk){
  var D=dutyData(c,wk),t0=wk===CUR?3:-1,set={},can=canEdit(),manual=!!wkData(c,wk).duty;
  c.students.forEach(function(s){set[s]=1});
  if(!c.students.length&&!manual)return '';
  var cols=[0,1,2,3,4].map(function(d){
    return '<div class="dday'+(d===t0?' today':'')+'"><b>'+DAYS[d]+' '+ds(wk,d)+(d===t0?' · Hôm nay':'')+'</b>'+D.tasks.map(function(t,r){
      var seen={},who=(D.cells[r+'_'+d]||[]).filter(function(x){if(!set[x]||seen[x])return false;seen[x]=1;return true});
      return '<div><span class="mu">'+esc(t)+'</span><br>'+(who.length?who.map(function(x){return esc(short(x))}).join(', '):'<span class="mu">-</span>')+'</div>'}).join('')+'</div>'}).join('');
  return '<div class="bx" style="margin-bottom:10px"><h5>'+ic('clipboard-check',13)+'Trực nhật trong tuần<span class="grow"></span>'+(can?'<button class="ic-btn ed" data-act="dutyEdit" aria-label="Chỉnh sửa trực nhật">'+ic('edit',15)+'</button>':'')+'</h5>'+
    (D.tasks.length?'<div class="scroll"><div class="dutyg">'+cols+'</div></div>':'<p class="mu">Chưa có phân công trực nhật.</p>')+'</div>';
}
/* Quyền chỉnh sửa: chỉ admin, và chỉ với tuần hiện tại hoặc tuần sau */
function canEdit(){return admin()&&S.week>=CUR}
function actBtns(kind,i,name){
  return '<button class="ic-btn ed" data-act="'+kind+'Edit" data-i="'+i+'" aria-label="Chỉnh sửa">'+ic('edit',15)+'</button><button class="ic-btn" data-act="'+kind+'Del" data-i="'+i+'" aria-label="Xoá">'+ic('trash',15)+'</button>';
}
function vEvent(){
  var c=cur(),wk=S.week,d=wkData(c,wk),ro=wk<CUR,can=canEdit(),r=rd(c,wk),n=c.students.length;r.n=Math.min(r.n,n);
  var empty=!d.pins.length&&!d.rem.length&&!d.ev.length,un=n-r.n;
  var h=head('Bản tin tuần',esc(c.name)+' · '+esc(c.school));
  h+='<div class="bar"><button class="sq" data-act="wk" data-d="-1" aria-label="Tuần trước">'+ic('chevron-left',16)+'</button><div class="wk">Tuần '+wk+' ('+ds(wk,0)+' - '+ds(wk,6)+'/'+dt(wk,6).getFullYear()+')</div><button class="sq" data-act="wk" data-d="1" aria-label="Tuần sau">'+ic('chevron-right',16)+'</button>'+
    (can?'<button class="btn" data-act="addEv">'+ic('plus',15)+'Thêm thông tin</button>':'')+
    '<span class="grow"></span><label class="srch" style="margin:0">'+ic('search',15)+'<input id="q" type="text" placeholder="Tìm kiếm" aria-label="Tìm kiếm" value="'+esc(S.q)+'"></label>'+
    '<div class="chipw"><button class="chip" data-act="pop" aria-haspopup="true">'+ic('eye',15)+'Đã đọc: '+r.n+'/'+n+'</button><div class="pop" id="pop" hidden><b style="font-weight:500">Chưa đọc ('+un+')</b><br>'+(un?c.students.slice(-Math.min(un,8)).map(esc).join('<br>')+(un>8?'<br>…':''):'Cả lớp đã đọc.')+'</div></div></div>';
  if(ro)h+='<div class="banner">'+ic('lock',16)+'<span>Tuần đã qua, chỉ xem, không chỉnh sửa được.</span></div>';
  if(empty){h+='<div class="empty" style="margin-bottom:10px">'+ic('calendar-plus',34)+'<p>'+(ro?'Tuần này không có thông báo nào.':'Chưa có thông báo cho tuần này.'+(admin()?' Bấm Thêm thông tin để lên lịch trước.':''))+'</p></div>'+dutyHTML(c,wk);return h}
  h+='<div class="row2"><div class="bx"><h5>'+ic('pin',13)+'Tin ghim quan trọng</h5>'+(d.pins.length?d.pins.map(function(p,i){return '<p class="itm"><span><span class="tag t-r">'+esc(p.tag||'Quan trọng')+'</span> <b style="font-weight:500">'+esc(p.t)+'</b>'+(p.det?'<br><span class="mu">'+esc(p.det)+'</span>':'')+(p.f?' <span class="file">'+ic('paperclip',13)+esc(p.f)+'</span>':'')+'</span>'+(can?'<span class="racts">'+actBtns('pin',i,p.t)+'</span>':'')+'</p>'}).join(''):'<p class="mu">Không có tin ghim.</p>')+'</div>'+
    '<div class="bx"><h5>Nhắc nhở và việc cần làm</h5>'+(d.rem.length?d.rem.map(function(x,i){return '<p class="itm"><span>• '+esc(x)+'</span>'+(can?'<span class="racts">'+actBtns('rem',i,x)+'</span>':'')+'</p>'}).join(''):'<p class="mu">Không có nhắc nhở.</p>')+'</div></div>';
  h+=dutyHTML(c,wk);
  h+='<div class="scroll"><table style="min-width:560px"><thead><tr><th></th><th>Thứ</th><th>Ngày</th><th>Nội dung</th><th>Loại</th><th>Đính kèm</th>'+(can?'<th></th>':'')+'</tr></thead><tbody id="tb">'+rowsHTML()+'</tbody></table></div>';
  h+='<div class="ft"><span class="note">'+(ro?'Chế độ chỉ đọc.':r.me?'Mỗi tài khoản bấm một lần. Nút mở lại khi tin được cập nhật.':'Bấm để xác nhận bạn đã đọc bản tin này.')+'</span>'+(ro?'':'<button class="btn'+(r.me?' done':'')+'" data-act="read" aria-disabled="'+r.me+'">'+ic('check',15)+(r.me?'Bạn đã đọc':'Đã đọc')+'</button>')+'</div>';
  return h;
}

/* Lưu tuần lên máy chủ (chỉ admin ghi được nhờ RLS). Lỗi thì giữ thay đổi tại máy và báo cho người dùng */
function persist(w){
  if(typeof API==='undefined'||!API.saveWeek)return;
  API.saveWeek(w,wkData(cur(),w)).catch(function(err){
    console.error(err);
    toast(err.message==='forbidden'?'Chỉ admin mới được thay đổi.':err.message==='no_schema'?'Chưa lưu được lên máy chủ: hãy chạy sql/update-5.sql trong Supabase.':'Không lưu được lên máy chủ, vui lòng thử lại.');
  });
}
function confirmDel(msg,fn){openModal('Xác nhận xoá','<p>'+esc(msg)+'</p>','Xoá',function(){fn()})}

/* Thêm mới (idx rỗng) hoặc sửa một mục: kind = 'ev' | 'pin' | 'rem' */
function itemModal(kind,idx){
  var edit=idx!=null,d0=wkData(cur(),S.week),old=edit?(kind==='ev'?d0.ev[idx]:kind==='pin'?d0.pins[idx]:d0.rem[idx]):null;
  if(edit&&old==null)return;
  var wo='';for(var w=CUR;w<=CUR+3;w++)wo+='<option value="'+w+'"'+(w===Math.max(S.week,CUR)?' selected':'')+'>Tuần '+w+' ('+ds(w,0)+' - '+ds(w,6)+')</option>';
  var dayo=DAYS.map(function(n,i){return '<option value="'+i+'"'+(edit&&kind==='ev'&&old.d===i?' selected':'')+'>'+n+'</option>'}).join('');
  var types=['Sinh hoạt','Bài tập','Kiểm tra','Sự kiện'].map(function(t){return '<option'+(edit&&kind==='ev'&&old.c===t?' selected':'')+'>'+t+'</option>'}).join('');
  var tags=['Quan trọng','Cấp thiết'].map(function(t){return '<option'+(edit&&kind==='pin'&&(old.tag||'Quan trọng')===t?' selected':'')+'>'+t+'</option>'}).join('');
  var vt=edit?(kind==='rem'?old:old.t):'',vd=edit&&kind!=='rem'?(old.det||''):'',vf=edit&&kind!=='rem'?(old.f||''):'';
  var body=(edit?'':'<div class="g2"><div><label for="mw">Tuần áp dụng</label><select id="mw">'+wo+'</select></div><div><label for="mc">Phân loại tin</label><select id="mc"><option value="ev">Lịch trình trong tuần</option><option value="pin">Tin ghim quan trọng</option><option value="rem">Nhắc nhở chung</option></select></div></div>')+
    '<div class="g2" id="evx"'+(edit&&kind!=='ev'?' hidden':'')+'><div><label for="md">Ngày</label><select id="md">'+dayo+'</select></div><div><label for="mt">Loại sự kiện</label><select id="mt">'+types+'</select></div></div>'+
    '<div id="pgx"'+(edit&&kind==='pin'?'':' hidden')+'><label for="mg">Nhãn tin ghim</label><select id="mg">'+tags+'</select></div>'+
    '<label for="ml">Tiêu đề</label><input type="text" id="ml" placeholder="Kiểm tra 15 phút môn Sinh học" value="'+esc(vt)+'"><div class="err" id="me" hidden>Nhập tiêu đề trước khi đăng.</div>'+
    '<div id="dtx"'+(edit&&kind==='rem'?' hidden':'')+'><label for="mx">Chi tiết</label><textarea id="mx" placeholder="Phạm vi, địa điểm, lưu ý">'+esc(vd)+'</textarea>'+
    '<label for="mf">Đính kèm (ảnh, PDF)</label><input type="file" id="mf">'+(vf?'<div class="mu" style="margin-top:4px;font-size:12px">Tệp hiện tại: '+esc(vf)+'. Chọn tệp mới để thay thế.</div>':'')+'</div>';
  openModal(edit?'Chỉnh sửa thông tin':'Thêm thông tin',body,edit?'Lưu thay đổi':'Đăng tin',function(){
    if(!admin())return false;
    var t=$('ml').value.trim();if(!t){$('me').hidden=false;$('ml').focus();return false}
    var w=edit?S.week:+$('mw').value,k=edit?kind:$('mc').value,fl=kind==='rem'&&edit?null:$('mf').files[0],f=fl?fl.name:vf,d=wkData(cur(),w),det=$('mx').value.trim();
    if(k==='ev'){var o={d:+$('md').value,t:t,c:$('mt').value,det:det,f:f};if(edit)d.ev[idx]=o;else d.ev.push(o)}
    else if(k==='pin'){var o2={tag:$('mg').value||'Quan trọng',t:t,det:det,f:f};if(edit)d.pins[idx]=o2;else d.pins.push(o2)}
    else{if(edit)d.rem[idx]=t;else d.rem.push(t)}
    cur().reads[w]={n:0,me:false};S.week=w;persist(w);render();toast(edit?'Đã cập nhật, trạng thái đã đọc được đặt lại':'Đã đăng tin, trạng thái đã đọc được đặt lại');
  });
  var mc=$('mc'),sync=function(){var k=mc?mc.value:kind;$('evx').hidden=k!=='ev';$('pgx').hidden=k!=='pin';$('dtx').hidden=k==='rem'};
  if(mc){mc.onchange=sync;sync()}
}
function addEv(){itemModal(null,null)}

/* Xoá một mục (có hộp thoại xác nhận) */
function delItem(kind,i){
  var d=wkData(cur(),S.week),list=kind==='ev'?d.ev:kind==='pin'?d.pins:d.rem;if(list[i]==null)return;
  confirmDel(kind==='ev'?'Bạn chắc chắn muốn xoá sự kiện này?':kind==='pin'?'Bạn chắc chắn muốn xoá tin ghim này?':'Bạn chắc chắn muốn xoá nhắc nhở này?',function(){
    list.splice(i,1);persist(S.week);render();toast('Đã xoá');
  });
}

/* Chỉnh sửa phân công trực nhật của tuần đang xem */
var DE=null;
function dutyPaint(){
  var c=cur(),opts='<option value="">-</option>'+c.students.map(function(s){return '<option value="'+esc(s)+'">'+esc(s)+'</option>'}).join('');
  var h=DE.tasks.map(function(t,r){
    return '<div class="dtask"><div class="dth"><input type="text" class="dtn" data-r="'+r+'" value="'+esc(t)+'" aria-label="Tên nhiệm vụ"><button type="button" class="ic-btn" data-act="dtDel" data-r="'+r+'" aria-label="Xoá nhiệm vụ">'+ic('trash',15)+'</button></div>'+
      [0,1,2,3,4].map(function(d){return '<div class="dtr"><span class="mu">'+DAYS[d]+' '+ds(S.week,d)+'</span>'+[0,1].map(function(k){return '<select class="dts" data-r="'+r+'" data-d="'+d+'" data-k="'+k+'" aria-label="'+DAYS[d]+'">'+opts+'</select>'}).join('')+'</div>'}).join('')+'</div>'}).join('');
  h+='<div class="err" id="dte" hidden>Nhập tên cho mọi nhiệm vụ.</div><div class="dfoot"><button type="button" class="btn gh" data-act="dtAdd">'+ic('plus',15)+'Thêm nhiệm vụ</button>'+(wkData(c,S.week).duty?'<button type="button" class="btn gh" data-act="dtAuto">Về phân công tự động</button>':'')+'</div>';
  $('mb').innerHTML=h;
  [].forEach.call($('mb').querySelectorAll('select.dts'),function(se){se.value=(DE.cells[se.dataset.r+'_'+se.dataset.d]||[])[+se.dataset.k]||''});
}
function dutySync(){
  [].forEach.call($('mb').querySelectorAll('input.dtn'),function(i){DE.tasks[+i.dataset.r]=i.value});
  DE.cells={};
  [].forEach.call($('mb').querySelectorAll('select.dts'),function(se){var key=se.dataset.r+'_'+se.dataset.d;(DE.cells[key]=DE.cells[key]||[])[+se.dataset.k]=se.value});
}
function dutyModal(){
  var src=dutyData(cur(),S.week);
  DE={tasks:src.tasks.slice(),cells:JSON.parse(JSON.stringify(src.cells))};
  openModal('Chỉnh sửa trực nhật','<div id="dtb"></div>','Lưu thay đổi',function(){
    if(!admin())return false;
    dutySync();
    if(DE.tasks.some(function(t){return !t.trim()})){$('dte').hidden=false;return false}
    var cells={};
    DE.tasks.forEach(function(t,r){[0,1,2,3,4].forEach(function(d){
      var seen={},arr=(DE.cells[r+'_'+d]||[]).filter(function(x){if(!x||seen[x])return false;seen[x]=1;return true});
      if(arr.length)cells[r+'_'+d]=arr})});
    wkData(cur(),S.week).duty={tasks:DE.tasks.map(function(t){return t.trim()}),cells:cells};
    persist(S.week);render();toast('Đã lưu phân công trực nhật');
  });
  $('mod').querySelector('.mp').style.width='min(560px,100%)';
  dutyPaint();
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur();
  if(act==='wk'){S.week+=+a.dataset.d;render()}
  else if(act==='read'){var r=rd(c,S.week);if(!r.me){r.me=true;r.n=Math.min(c.students.length,r.n+1);render()}}
  else if(act==='pop'){var p=$('pop');p.hidden=!p.hidden}
  else if(!admin()||S.week<CUR)return;
  else if(act==='addEv')addEv();
  else if(act==='evEdit')itemModal('ev',+a.dataset.i);
  else if(act==='pinEdit')itemModal('pin',+a.dataset.i);
  else if(act==='remEdit')itemModal('rem',+a.dataset.i);
  else if(act==='evDel')delItem('ev',+a.dataset.i);
  else if(act==='pinDel')delItem('pin',+a.dataset.i);
  else if(act==='remDel')delItem('rem',+a.dataset.i);
  else if(act==='dutyEdit')dutyModal();
  else if(DE&&act==='dtAdd'){dutySync();DE.tasks.push('');dutyPaint()}
  else if(DE&&act==='dtDel'){dutySync();var r0=+a.dataset.r;DE.tasks.splice(r0,1);var nc={};Object.keys(DE.cells).forEach(function(k){var p=k.split('_'),r=+p[0];if(r<r0)nc[k]=DE.cells[k];else if(r>r0)nc[(r-1)+'_'+p[1]]=DE.cells[k]});DE.cells=nc;dutyPaint()}
  else if(DE&&act==='dtAuto'){delete wkData(c,S.week).duty;persist(S.week);closeModal();render();toast('Đã về phân công tự động')}
});

document.addEventListener('input',function(e){
  if(e.target.id==='q'){S.q=e.target.value.trim().toLowerCase();$('tb').innerHTML=rowsHTML()}
});

/* Tooltip dòng lịch trình */
document.addEventListener('mousemove',function(e){
  var tip=$('tip'),tr=e.target.closest&&e.target.closest('#tb tr[data-i]');
  if(!tr){tip.hidden=true;return}
  var ev=wkData(cur(),S.week).ev[+tr.dataset.i];if(!ev){tip.hidden=true;return}
  tip.innerHTML='<b>'+esc(ev.t)+'</b><br>'+DAYS[ev.d]+', '+ds(S.week,ev.d)+'<br>'+esc(ev.det||'Chưa có mô tả.')+(ev.f?'<br><span class="file">'+ic('paperclip',13)+esc(ev.f)+'</span>':'');
  tip.hidden=false;var x=e.clientX+14,y=e.clientY+14;if(x+250>innerWidth)x=innerWidth-254;if(y+tip.offsetHeight>innerHeight)y=e.clientY-tip.offsetHeight-8;
  tip.style.left=Math.max(4,x)+'px';tip.style.top=y+'px';
});
