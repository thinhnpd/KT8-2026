'use strict';
/* Điểm khởi chạy: kiểm tra đăng nhập, nạp dữ liệu lớp từ cơ sở dữ liệu, rồi vẽ lần đầu */
(async function(){
  try{
    if(!(await API.session())){location.replace('auth/login.html');return}
    await API.loadClass();                         /* học sinh, danh bạ, giáo viên, ban cán sự -> đối tượng C */
    try{                                           /* bản tin tuần đã lưu (bảng class_weeks); chưa chạy sql/update-5.sql thì giữ dữ liệu mẫu */
      var wks=await API.loadWeeks();Object.keys(wks).forEach(function(k){C.weeks[k]=normWeek(wks[k])});
      API.onWeeks(function(w,data){C.weeks[w]=normWeek(data);if(S.page==='event')render()});
    }catch(e){console.warn('[S Class] Chưa tải được bản tin tuần:',e)}
    notifs=await API.loadNotifs();                 /* thông báo của lớp, kèm trạng thái đã đọc của tài khoản này */
    API.onNotif(function(n){notifs.unshift(n);renderBell();renderTop()});   /* thông báo mới hiện ngay, không cần tải lại */
  }catch(err){
    console.error(err);
    if(typeof toast==='function')toast('Không tải được dữ liệu lớp. Vui lòng tải lại trang.');
  }
  var h0='';try{h0=location.hash.slice(1)}catch(e){}
  if(VIEWS[h0])S.page=h0;
  applyAccent();syncTg();render();
  I18N.init();   /* áp dụng ngôn ngữ đã lưu (mặc định vi) */
})();
