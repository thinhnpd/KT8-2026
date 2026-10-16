'use strict';
/* Trang Contacts: danh bạ giáo viên và học sinh, thêm, sửa thành viên */
/* Danh bạ */
function contactRows(c){
  var rows=[];
  c.teachers.forEach(function(t,i){rows.push({k:'t:'+i,kind:'teacher',n:t.n,email:t.email,phone:t.phone,subj:t.s,talent:'',pos:'',role:'Giáo viên',gv:t.gv,me:false,o:i})});
  c.students.forEach(function(s,i){
    var inf=c.info[s]||{},pos=c.committee.filter(function(m){return m.w===s}).map(function(m){return m.r}),isAd=pos.some(function(r){return ADMIN_POS.indexOf(r)>-1});
    var o=i;if(isAd)o=Math.min.apply(null,pos.map(function(r){return POSITIONS.indexOf(r)}));
    rows.push({k:'s:'+i,kind:'student',n:s,email:inf.email,phone:inf.phone,subj:inf.subj,talent:inf.talent,pos:pos.join(', '),role:isAd?'Admin':'Học sinh',me:s===S.name,o:o});
  });
  var ord={'Admin':0,'Giáo viên':1,'Học sinh':2};
  rows.sort(function(a,b){return ord[a.role]-ord[b.role]||(a.role==='Admin'&&a.kind!==b.kind?(a.kind==='teacher'?-1:1):0)||a.o-b.o});
  return rows;
}
function contactRowHTML(r,k){
  var rt=r.role==='Admin'?'<span class="tag ad">Admin</span>':r.role==='Giáo viên'?'<span class="tag t-b">'+(r.gv?'Giáo viên chủ nhiệm':'Giáo viên')+'</span>':'<span class="tag t-n">Học sinh</span>';
  var can=admin()||(r.me&&r.kind==='student'),onlyT=S.cf==='Giáo viên';
  return '<tr><td class="rn">'+(k+1)+'</td><td><div class="nm"><span class="av sm">'+esc(initials(r.n.replace(/^(Cô|Thầy)\s/,'')))+'</span><span><b style="font-weight:500">'+esc(r.n)+'</b>'+(r.me?' <span class="tag t-g">Bạn</span>':'')+'<span class="sub">'+esc(r.email||'-')+'</span></span></div></td><td>'+esc(r.phone||'-')+'</td><td>'+rt+'</td>'+
    (onlyT?'':'<td>'+(r.pos?r.pos.split(', ').map(function(x){return '<span class="tag t-y">'+esc(x)+'</span>'}).join(' '):'<span class="mu">-</span>')+'</td>')+'<td>'+(r.subj?esc(r.subj):'<span class="mu">-</span>')+'</td>'+
    (onlyT?'':'<td>'+(r.kind==='student'?(r.talent?esc(r.talent):'<span class="mu">Chưa cập nhật</span>'):'<span class="mu">-</span>')+'</td>')+'<td style="width:40px;text-align:center">'+
    (can?'<button class="ic-btn ed" data-act="medit" data-k="'+r.k+'" aria-label="Chỉnh sửa '+esc(r.n)+'">'+ic('edit',16)+'</button>':'')+'</td></tr>';
}
function contactsBody(){
  var q=S.cq,rows=contactRows(cur()).filter(function(r){
    if(S.cf!=='all'&&r.role!==S.cf)return false;
    return !q||(r.n+' '+r.email+' '+r.phone+' '+r.pos+' '+r.subj+' '+r.talent).toLowerCase().indexOf(q)>-1;
  });
  if(!rows.length)return '<tr><td class="rn">1</td><td colspan="'+(S.cf==='Giáo viên'?5:7)+'" class="mu">Không tìm thấy thành viên nào.</td></tr>';
  return rows.map(contactRowHTML).join('');
}
function vContacts(){
  var c=cur(),rows=contactRows(c),a=admin(),cnt={all:rows.length,'Admin':0,'Học sinh':0,'Giáo viên':0};
  rows.forEach(function(r){cnt[r.role]++});
  var fs=[['all','Tất cả'],['Admin','Admin'],['Học sinh','Học sinh'],['Giáo viên','Giáo viên']],adm=adminList(c);
  var h=head('Danh bạ',esc(c.name)+' · '+cnt.all+' thành viên');
  h+='<div class="banner">'+ic('key',16)+'<span>Admin của lớp: '+adm.map(function(x){return '<b style="font-weight:500;color:var(--tx)">'+esc(x.n)+'</b> ('+esc(x.t)+')'}).join(', ')+'. Danh sách này đổi sau mỗi lần bầu ban cán sự.</span></div>';
  h+='<div class="bar"><span class="seg" role="group" aria-label="Lọc theo vai trò">'+fs.map(function(f){return '<button data-act="cf" data-v="'+f[0]+'" aria-pressed="'+(S.cf===f[0])+'">'+f[1]+' '+cnt[f[0]]+'</button>'}).join('')+'</span><span class="grow"></span>'+
    '<label class="srch" style="margin:0">'+ic('search',15)+'<input id="cq" type="text" placeholder="Tìm kiếm" aria-label="Tìm trong danh bạ" value="'+esc(S.cq)+'"></label>'+(a?'<button class="btn" data-act="madd">'+ic('user-plus',15)+'Thêm thành viên</button>':'')+'</div>';
  var onlyT=S.cf==='Giáo viên';
  h+='<div class="scroll"><table style="min-width:'+(onlyT?'640':'880')+'px"><thead><tr><th></th><th>Thành viên</th><th>SĐT / Zalo</th><th>Vai trò</th>'+(onlyT?'':'<th>Chức vụ</th>')+'<th>'+(onlyT?'Môn dạy':'Môn dạy / hỗ trợ')+'</th>'+(onlyT?'':'<th>Sở trường</th>')+'<th></th></tr></thead><tbody id="ctb">'+contactsBody()+'</tbody></table></div>';
  h+='<p class="note" style="margin-top:10px">Môn hỗ trợ: bạn đại diện chỉ bài và giúp đỡ cả lớp ở môn đó. Sở trường do học sinh tự điền, admin cũng chỉnh sửa được. Chức vụ cập nhật theo kết quả bầu ban cán sự.</p>';
  return h;
}
function memberForm(o){
  var so='<option value="">Không có</option>'+SUBJ.map(function(s){return '<option'+(s===o.subj?' selected':'')+'>'+s+'</option>'}).join('');
  return '<label for="mn">Họ và tên</label><input type="text" id="mn" value="'+esc(o.n)+'" autocomplete="off">'+
    '<div class="g2"><div><label for="mem">Email</label><input type="text" id="mem" value="'+esc(o.email)+'" autocomplete="off"></div><div><label for="mph">Số điện thoại / Zalo</label><input type="text" id="mph" value="'+esc(o.phone)+'" autocomplete="off"></div></div>'+
    '<div class="g2"><div><label id="msl" for="msj">'+(o.kind==='teacher'?'Môn dạy':'Môn hỗ trợ bạn bè')+'</label><select id="msj">'+so+'</select></div>'+
    (o.kind==='student'?'<div id="mtw"><label for="mtl">Sở trường</label><input type="text" id="mtl" value="'+esc(o.talent)+'" autocomplete="off" placeholder="Vẽ, hát, bóng đá..."></div>':'')+'</div><div class="err" id="mer" hidden></div>';
}
function validateMember(v){
  if(!v.nn)return 'Nhập họ và tên.';
  if(v.em&&v.em.indexOf('@')<1)return 'Email chưa đúng định dạng.';
  if(v.ph&&!/^[0-9+ .]{8,15}$/.test(v.ph))return 'Số điện thoại chưa đúng.';
  return '';
}
function readMember(){return{nn:$('mn').value.trim().replace(/\s+/g,' '),em:$('mem').value.trim(),ph:$('mph').value.trim(),sj:$('msj').value,tl:$('mtl')?$('mtl').value.trim():''}}
function editMember(k){
  var c=cur(),p=k.split(':'),kind=p[0]==='t'?'teacher':'student',i=+p[1],o;
  if(kind==='teacher'){if(!admin())return;var t=c.teachers[i];o={kind:kind,n:t.n,email:t.email,phone:t.phone,subj:t.s,talent:''}}
  else{var s=c.students[i];if(!admin()&&s!==S.name)return;var inf=c.info[s];o={kind:kind,n:s,email:inf.email,phone:inf.phone,subj:inf.subj,talent:inf.talent}}
  openModal('Chỉnh sửa thành viên',memberForm(o),'Lưu thay đổi',function(){
    var v=readMember(),m=validateMember(v),er=$('mer');
    if(!m&&kind==='student'&&v.nn!==o.n&&c.students.indexOf(v.nn)>-1)m='Tên này đã có trong danh sách.';
    if(m){er.textContent=m;er.hidden=false;return false}
    if(kind==='teacher'){var t=c.teachers[i];t.n=v.nn;t.email=v.em;t.phone=v.ph;t.s=v.sj}
    else{if(v.nn!==o.n)renameStudent(c,o.n,v.nn);var inf=c.info[v.nn];inf.email=v.em;inf.phone=v.ph;inf.subj=v.sj;inf.talent=v.tl}
    render();toast('Đã lưu thông tin '+v.nn);
  });
}
function addMember(){
  if(!admin())return;
  var c=cur();
  openModal('Thêm thành viên','<label for="mk">Loại thành viên</label><select id="mk"><option value="student">Học sinh</option><option value="teacher">Giáo viên</option></select>'+memberForm({kind:'student',n:'',email:'',phone:'',subj:'',talent:''}),'Thêm',function(){
    var kind=$('mk').value,v=readMember(),m=validateMember(v),er=$('mer');
    if(!m&&kind==='student'&&c.students.indexOf(v.nn)>-1)m='Tên này đã có trong danh sách.';
    if(m){er.textContent=m;er.hidden=false;return false}
    if(kind==='teacher')c.teachers.push({n:v.nn,s:v.sj,email:v.em,phone:v.ph,gv:false});
    else{c.students.push(v.nn);c.info[v.nn]={email:v.em,phone:v.ph,subj:v.sj,talent:v.tl};syncDerived(c)}
    render();toast('Đã thêm '+v.nn);
  });
  $('mk').onchange=function(){var t=this.value==='teacher';$('mtw').hidden=t;$('msl').textContent=t?'Môn dạy':'Môn hỗ trợ bạn bè'};
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act;
  if(act==='cf'){S.cf=a.dataset.v;render()}
  else if(act==='medit')editMember(a.dataset.k);
  else if(act==='madd')addMember();
});

document.addEventListener('input',function(e){
  if(e.target.id==='cq'){S.cq=e.target.value.trim().toLowerCase();$('ctb').innerHTML=contactsBody()}
});
