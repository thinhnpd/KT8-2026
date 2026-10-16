'use strict';
/* Trang Settings: thông tin lớp, logo, danh sách lớp, chuyển tài khoản */
function vSettings(){
  var c=cur(),a=admin(),dis=a?'':' disabled';
  var h=head('Cài đặt','Thông tin lớp và tài khoản');
  h+='<div class="rolebar"><span>Xem thử vai trò:</span><span class="seg" role="group" aria-label="Vai trò"><button data-act="role" data-r="admin" aria-pressed="'+a+'">Admin</button><button data-act="role" data-r="member" aria-pressed="'+!a+'">Thành viên</button></span><span>Chỉ dùng để xem thử, bản thật lấy từ tài khoản đăng nhập.</span></div>';
  h+='<section class="card"><h2>Thông tin lớp</h2>'+lockNote()+
    '<div class="g2"><div><label for="fSchool">Trường</label><input type="text" id="fSchool" data-f="school" value="'+esc(c.school)+'"'+dis+'></div><div><label for="fName">Lớp</label><input type="text" id="fName" data-f="name" value="'+esc(c.name)+'"'+dis+'></div></div>'+
    '<div style="margin-top:12px"><label>Logo</label><div class="logo-row"><span class="logo-box">'+(c.logo?'<img alt="Logo hiện tại" src="'+c.logo+'">':ic('image',24))+'</span><div class="fg" style="gap:6px"><div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn gh" style="margin:0;color:var(--tx)'+(a?'':';opacity:.5;cursor:not-allowed')+'">'+ic('upload',15)+'Tải logo lên<input type="file" id="fLogo" accept="image/*" hidden'+dis+'></label><button class="btn gh" data-act="sample"'+dis+'>Thử logo mẫu</button></div><span class="note"><span class="sw"></span>Màu giao diện '+c.color.toUpperCase()+', lấy tự động từ logo</span></div></div></div>'+
    '<div style="margin-top:14px"><div class="frow" style="justify-content:space-between;align-items:center"><label style="margin:0">Danh sách lớp ('+c.students.length+' học sinh)</label></div>'+
    (a?'<form id="stForm" class="frow" style="margin-top:6px" novalidate><input type="text" id="stNew" placeholder="Họ và tên học sinh mới" autocomplete="off" aria-label="Họ và tên học sinh mới"><button class="btn" type="submit">'+ic('plus',15)+'Thêm</button></form><div class="err" id="stErr"'+(S.stErr?'':' hidden')+'>'+esc(S.stErr)+'</div>':'')+
    '<div class="stl"><table><thead><tr><th>STT</th><th>Họ và tên</th>'+(a?'<th></th>':'')+'</tr></thead><tbody>'+c.students.map(function(s,i){return '<tr><td class="rn">'+(i+1)+'</td><td>'+esc(s)+'</td>'+(a?'<td style="width:34px;text-align:center"><button class="ic-btn" data-act="stDel" data-i="'+i+'" aria-label="Xoá '+esc(s)+'">'+ic('trash',15)+'</button></td>':'')+'</tr>'}).join('')+'</tbody></table></div></div></section>';
  h+='<section class="card"><h2>Chuyển tài khoản</h2><p class="mu">Thoát khỏi lớp này để đăng nhập hoặc đăng ký tài khoản khác.</p><div class="frow" style="align-items:center;flex-wrap:wrap"><button class="btn gh" disabled aria-describedby="swNote">'+ic('log-out',15)+'Chuyển tài khoản</button><span class="note" id="swNote">Chưa mở, sẽ làm cùng màn hình đăng nhập và đăng ký.</span></div></section>';
  return h;
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur(),i=+a.dataset.i;
  if(act==='role'){S.role=a.dataset.r;render();toast(admin()?'Đang xem với vai trò Admin':'Đang xem với vai trò Thành viên')}
  else if(act==='sample')sampleLogo();
  else if(act==='stDel'){var nm3=c.students[i];c.students.splice(i,1);syncDerived(c);render();toast('Đã xoá '+nm3)}
});

document.addEventListener('change',function(e){
  var t=e.target,c=cur();
  if(t.dataset.f){var v=t.value.trim();if(!v){t.value=c[t.dataset.f];return}c[t.dataset.f]=v;renderSidebar();toast('Đã lưu')}
  else if(t.id==='fLogo'&&t.files[0]){var fr=new FileReader();fr.onload=function(){setLogo(fr.result)};fr.readAsDataURL(t.files[0])}
});

document.addEventListener('submit',function(e){
  if(e.target.id!=='stForm')return;
  e.preventDefault();var c=cur();
    var v=$('stNew').value.trim().replace(/\s+/g,' ');
    if(!v){S.stErr='Nhập họ và tên học sinh.'}
    else if(c.students.indexOf(v)>-1){S.stErr='Tên này đã có trong danh sách.'}
    else{c.students.push(v);syncDerived(c);S.stErr='';render();toast('Đã thêm '+v);$('stNew').focus();return}
    $('stErr').textContent=S.stErr;$('stErr').hidden=false;
});
