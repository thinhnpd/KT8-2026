'use strict';
/* Trang Settings: tài khoản (tên hiển thị, mật khẩu), thông tin lớp, logo, danh sách lớp */
function vSettings(){
  var c=cur(),a=admin(),dis=a?'':' disabled';
  var h=head('Cài đặt','Thông tin lớp và tài khoản');
  /* Chỉ admin thật mới xem thử được giao diện thành viên; thành viên không bật được giao diện admin */
  if(S.realRole==='admin')h+='<div class="rolebar"><span>Xem thử vai trò:</span><span class="seg" role="group" aria-label="Vai trò"><button data-act="role" data-r="admin" aria-pressed="'+a+'">Admin</button><button data-act="role" data-r="member" aria-pressed="'+!a+'">Thành viên</button></span><span>Chỉ đổi cách hiển thị, quyền thật lấy từ tài khoản đăng nhập.</span></div>';

  /* ---- Tài khoản: ai cũng dùng được ---- */
  h+='<section class="card"><h2>Tài khoản</h2>'+
    '<form id="nameForm" novalidate><div class="g2"><div><label for="aName">Tên hiển thị</label><input type="text" id="aName" maxlength="60" autocomplete="name" value="'+esc(S.name)+'"></div>'+
    '<div><label for="aUser">Tên đăng nhập</label><input type="text" id="aUser" value="'+esc(S.username||'')+'" disabled></div></div>'+
    '<div class="err" id="nameErr" hidden></div><div class="frow" style="margin-top:10px"><button class="btn" type="submit">Lưu tên</button></div></form>'+
    '<h3 style="margin:20px 0 8px;font-size:14px;font-weight:600">Đổi mật khẩu</h3>'+
    '<form id="pwForm" class="fg" style="max-width:360px" novalidate>'+
    '<div><label for="pwOld">Mật khẩu hiện tại</label><input type="password" id="pwOld" autocomplete="current-password"></div>'+
    '<div><label for="pwNew">Mật khẩu mới</label><input type="password" id="pwNew" autocomplete="new-password"></div>'+
    '<div><label for="pwNew2">Xác nhận lại mật khẩu mới</label><input type="password" id="pwNew2" autocomplete="new-password"></div>'+
    '<div class="err" id="pwErr" hidden></div><div><button class="btn" type="submit">Đổi mật khẩu</button></div></form></section>';

  /* ---- Thông tin lớp: chỉ admin chỉnh được, người khác bị khóa ---- */
  h+='<section class="card"><h2>Thông tin lớp</h2>'+lockNote()+
    '<div class="g2"><div><label for="fSchool">Trường</label><input type="text" id="fSchool" data-f="school" value="'+esc(c.school)+'"'+dis+'></div><div><label for="fName">Lớp</label><input type="text" id="fName" data-f="name" value="'+esc(c.name)+'"'+dis+'></div></div>'+
    '<div style="margin-top:12px"><label>Logo</label><div class="logo-row"><span class="logo-box">'+(c.logo?'<img alt="Logo hiện tại" src="'+c.logo+'">':ic('image',24))+'</span><div class="fg" style="gap:6px"><div style="display:flex;gap:8px;flex-wrap:wrap"><label class="btn gh" style="margin:0;color:var(--tx)'+(a?'':';opacity:.5;cursor:not-allowed')+'">'+ic('upload',15)+'Tải logo lên<input type="file" id="fLogo" accept="image/*" hidden'+dis+'></label><button class="btn gh" data-act="sample"'+dis+'>Thử logo mẫu</button></div><span class="note"><span class="sw"></span>Màu giao diện '+c.color.toUpperCase()+', lấy tự động từ logo</span></div></div></div>'+
    '<div style="margin-top:14px"><div class="frow" style="justify-content:space-between;align-items:center"><label style="margin:0">Danh sách lớp ('+c.students.length+' học sinh)</label></div>'+
    (a?'<form id="stForm" class="frow" style="margin-top:6px" novalidate><input type="text" id="stNew" placeholder="Họ và tên học sinh mới" autocomplete="off" aria-label="Họ và tên học sinh mới"><button class="btn" type="submit">'+ic('plus',15)+'Thêm</button></form><div class="err" id="stErr"'+(S.stErr?'':' hidden')+'>'+esc(S.stErr)+'</div>':'')+
    '<div class="stl"><table><thead><tr><th>STT</th><th>Họ và tên</th>'+(a?'<th></th>':'')+'</tr></thead><tbody>'+c.students.map(function(s,i){return '<tr><td class="rn">'+(i+1)+'</td><td>'+esc(s)+'</td>'+(a?'<td style="width:34px;text-align:center"><button class="ic-btn" data-act="stDel" data-i="'+i+'" aria-label="Xoá '+esc(s)+'">'+ic('trash',15)+'</button></td>':'')+'</tr>'}).join('')+'</tbody></table></div></div></section>';

  h+='<section class="card"><h2>Chuyển tài khoản</h2><p class="mu">Đăng xuất để đăng nhập hoặc đăng ký tài khoản khác.</p><div class="frow" style="align-items:center;flex-wrap:wrap"><button class="btn gh" data-act="logout">'+ic('log-out',15)+'Đăng xuất</button></div></section>';
  return h;
}

function setErr(id,msg){var el=$(id);if(!el)return;el.textContent=msg||'';el.hidden=!msg}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur();
  if(act==='role'){if(S.realRole!=='admin')return;S.role=a.dataset.r;render();toast(admin()?'Đang xem với vai trò Admin':'Đang xem với vai trò Thành viên')}
  else if(act==='sample')sampleLogo();
  else if(act==='stDel'){
    if(!admin())return;
    var nm3=c.students[+a.dataset.i];
    API.removeStudent(nm3).then(function(){var k=c.students.indexOf(nm3);if(k>-1)c.students.splice(k,1);syncDerived(c);render();toast('Đã xoá '+nm3)})
      .catch(function(err){console.error(err);toast(err.message==='forbidden'?'Chỉ admin mới được thay đổi.':'Không lưu được, vui lòng thử lại.')});
  }
});

document.addEventListener('change',function(e){
  var t=e.target,c=cur();
  if(t.dataset&&t.dataset.f){
    var field=t.dataset.f;
    if(!admin()){t.value=c[field];return}
    var v=t.value.trim();
    if(field==='name')v=v.replace(/^lớp\s+/i,'').trim();   /* "Lớp" chỉ là tiền tố hiển thị, không lưu */
    if(!v){t.value=c[field];return}
    var old=c[field],shown=field==='name'?'Lớp '+v:v,patch={};patch[field]=v;
    API.saveClass(patch).then(function(){c[field]=shown;t.value=shown;renderSidebar();toast('Đã lưu')})
      .catch(function(err){console.error(err);t.value=old;toast(err.message==='name_taken'?'Tên lớp này đã được dùng.':err.message==='forbidden'?'Chỉ admin mới được thay đổi.':'Không lưu được, vui lòng thử lại.')});
  }
  else if(t.id==='fLogo'&&t.files[0]){var fr=new FileReader();fr.onload=function(){setLogo(fr.result)};fr.readAsDataURL(t.files[0])}
});

document.addEventListener('submit',function(e){
  var f=e.target,c=cur();
  if(f.id==='nameForm'){
    e.preventDefault();
    var nv=$('aName').value.trim().replace(/\s+/g,' ');
    if(nv.length<1||nv.length>60){setErr('nameErr','Tên hiển thị gồm 1–60 ký tự.');return}
    setErr('nameErr','');
    API.setDisplayName(nv).then(function(){S.name=nv;$('aName').value=nv;renderTop();toast('Đã đổi tên hiển thị')})
      .catch(function(err){console.error(err);setErr('nameErr','Không lưu được, vui lòng thử lại.')});
  }
  else if(f.id==='pwForm'){
    e.preventDefault();
    var o=$('pwOld').value,n1=$('pwNew').value,n2=$('pwNew2').value,m='';
    if(!o)m='Nhập mật khẩu hiện tại.';else if(n1.length<8)m='Mật khẩu mới cần ít nhất 8 ký tự.';else if(n1!==n2)m='Hai mật khẩu mới chưa khớp.';
    if(m){setErr('pwErr',m);return}
    setErr('pwErr','');
    var btn=f.querySelector('button[type=submit]');btn.disabled=true;
    API.changePassword(o,n1).then(function(){f.reset();toast('Đã đổi mật khẩu')})
      .catch(function(err){console.error(err);setErr('pwErr',err.message==='wrong_password'?'Mật khẩu hiện tại không đúng.':err.message==='same_password'?'Mật khẩu mới phải khác mật khẩu hiện tại.':'Không lưu được, vui lòng thử lại.')})
      .then(function(){btn.disabled=false});
  }
  else if(f.id==='stForm'){
    e.preventDefault();
    if(!admin())return;
    var v=$('stNew').value.trim().replace(/\s+/g,' ');
    if(!v){S.stErr='Nhập họ và tên học sinh.'}
    else if(c.students.indexOf(v)>-1){S.stErr='Tên này đã có trong danh sách.'}
    else{
      API.addStudent(v).then(function(){c.students.push(v);syncDerived(c);S.stErr='';render();toast('Đã thêm '+v);var i=$('stNew');if(i)i.focus()})
        .catch(function(err){console.error(err);S.stErr=err.message==='name_taken'?'Tên này đã có trong danh sách.':'Không lưu được, vui lòng thử lại.';setErr('stErr',S.stErr)});
      return;
    }
    setErr('stErr',S.stErr);
  }
});
