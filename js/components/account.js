'use strict';
/* Hộp tài khoản (avatar): thông tin, lối vào Cài đặt, đăng xuất. Đổi tên và mật khẩu nằm ở trang Settings. */
function renderAcc(){
  $('avDd').innerHTML='<div class="dd-b"><div class="who"><span class="av lg">'+esc(initials(S.name))+'</span><span><b>'+esc(S.name)+'</b><small>'+roleLabel()+' · '+esc(cur().name)+'</small></span></div>'+
    '<button class="rowbtn" data-go="settings">'+ic('settings',16)+'<span class="sp">Tài khoản và cài đặt</span></button>'+
    '<button class="rowbtn" data-act="logout">'+ic('log-out',16)+'<span class="sp">Đăng xuất</span></button></div>';
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='logout'){
    a.disabled=true;
    /* Xóa phiếu đăng nhập rồi về trang đăng nhập (replace: nút Back không quay lại trang cũ) */
    API.signOut().catch(function(){}).then(function(){location.replace('auth/login.html')});
  }
});
