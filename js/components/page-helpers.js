'use strict';
/* Phần đầu trang và ghi chú khoá quyền dùng chung cho các trang */
function head(t,sub){return '<div class="ph"><h1>'+t+'</h1><p>'+sub+'</p></div>'}
function lockNote(){return admin()?'':'<div class="banner">'+ic('lock',16)+'<span>Bạn đang xem với vai trò thành viên, chỉ admin mới chỉnh sửa được.</span></div>'}
