'use strict';
/* Hộp tài khoản (avatar) và đổi mật khẩu */
function renderAcc(){
  $('avDd').innerHTML='<div class="dd-b"><div class="who"><span class="av lg">'+esc(initials(S.name))+'</span><span><b>'+esc(S.name)+'</b><small>'+(admin()?'Admin lớp':'Thành viên')+' · '+esc(cur().name)+'</small></span></div>'+
    '<button class="rowbtn" data-act="pwToggle" aria-expanded="false" aria-controls="pwForm">'+ic('key',16)+'<span class="sp">Đổi mật khẩu</span>'+ic('chevron-down',16)+'</button>'+
    '<form id="pwForm" class="fg" hidden novalidate><div><label for="pwOld">Mật khẩu hiện tại</label><input type="password" id="pwOld" autocomplete="current-password"></div><div><label for="pwNew">Mật khẩu mới</label><input type="password" id="pwNew" autocomplete="new-password"></div><div><label for="pwNew2">Xác nhận lại mật khẩu mới</label><input type="password" id="pwNew2" autocomplete="new-password"></div><div class="err" id="pwErr" hidden></div><button class="btn" type="submit">Đổi mật khẩu</button><p class="note">Bản xem thử: chưa kiểm tra mật khẩu hiện tại với máy chủ.</p></form>'+
    '<button class="rowbtn" data-act="logout">'+ic('log-out',16)+'<span class="sp">Đăng xuất</span></button></div>';
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='pwToggle'){var f=$('pwForm'),open=f.hidden;f.hidden=!open;a.setAttribute('aria-expanded',String(open));if(open)$('pwOld').focus()}
  else if(a.dataset.act==='logout'){
    a.disabled=true;
    /* Xóa phiên đăng nhập rồi về trang đăng nhập (replace: nút Back không quay lại trang cũ) */
    API.signOut().catch(function(){}).then(function(){location.replace('auth/login.html')});
  }
});

document.addEventListener('submit',function(e){
  if(e.target.id!=='pwForm')return;
  e.preventDefault();
    var o=$('pwOld').value,n1=$('pwNew').value,n2=$('pwNew2').value,er2=$('pwErr'),m2='';
    if(!o)m2='Nhập mật khẩu hiện tại.';else if(n1.length<8)m2='Mật khẩu mới cần ít nhất 8 ký tự.';else if(n1!==n2)m2='Hai mật khẩu mới chưa khớp.';
    if(m2){er2.textContent=m2;er2.hidden=false;return}
    er2.hidden=true;e.target.reset();e.target.hidden=true;closeDd();toast('Đã đổi mật khẩu (bản xem thử)');
});
