'use strict';
/* Điểm khởi chạy: kiểm tra đăng nhập, nạp dữ liệu lớp từ cơ sở dữ liệu, rồi vẽ lần đầu */
(async function(){
  try{
    if(!(await API.session())){location.replace('auth/login.html');return}
    await API.loadClass();                         /* học sinh, danh bạ, giáo viên, ban cán sự -> đối tượng C */
    try{                                           /* bản tin tuần đã lưu (bảng class_weeks); chưa chạy sql/update-5.sql thì giữ dữ liệu mẫu */
      var wks=await API.loadWeeks();Object.keys(wks).forEach(function(k){C.weeks[k]=normWeek(wks[k])});
      API.onWeeks(function(w,data){C.weeks[w]=normWeek(data);if(S.page==='event')render();refreshReads(w)});   /* nội dung đổi -> trigger đã xoá xác nhận cũ, lấy lại trạng thái */
    }catch(e){console.warn('[S Class] Chưa tải được bản tin tuần:',e)}
    try{                                           /* xác nhận đã đọc (bảng week_reads); chưa chạy sql/update-17.sql thì coi như chưa đọc */
      (await API.loadMyReads()).forEach(function(w){rd(C,w).me=true});
      API.onReads(function(w){if(!canManage())return;if(S.page==='event'&&S.week===w)refreshReads(w);else rd(C,w).at=0});
    }catch(e){console.warn('[S Class] Chưa tải được trạng thái đã đọc:',e)}
    try{                                           /* góp ý của lớp (bảng feedback); chưa chạy sql/update-16.sql thì để trống */
      C.feedback=await API.loadFeedback();
      API.onFeedback(function(ev,f){
        var i=C.feedback.findIndex(function(x){return x.id===f.id});
        if(i<0){if(ev==='INSERT')C.feedback.unshift(f)}else C.feedback[i].st=f.st;
        if(S.page==='feedback')fbPaintList();
      });
    }catch(e){console.warn('[S Class] Chưa tải được góp ý:',e)}
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
