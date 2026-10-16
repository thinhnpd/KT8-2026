'use strict';
/* English – trang Settings (thông tin lớp, logo, chuyển tài khoản) */
I18N.add('en',{
  'Thông tin lớp và tài khoản':'Class info and account','Thông tin lớp':'Class info',
  'Họ và tên học sinh mới':'New student full name','Nhập họ và tên học sinh.':'Enter the student full name.',
  'Tải logo lên':'Upload logo','Thử logo mẫu':'Try a sample logo','STT':'No.','Màu giao diện':'Theme color',
  'Chuyển tài khoản':'Switch account',
  'Thoát khỏi lớp này để đăng nhập hoặc đăng ký tài khoản khác.':'Leave this class to sign in or register with another account.',
  'Chưa mở, sẽ làm cùng màn hình đăng nhập và đăng ký.':'Not available yet; it will arrive with the sign-in and register screens.',
  'Xem thử vai trò:':'Preview role:',
  'Đang xem với vai trò Admin':'Viewing as Admin','Đang xem với vai trò Thành viên':'Viewing as Member',
  'Chỉ dùng để xem thử, bản thật lấy từ tài khoản đăng nhập.':'For preview only; the real role comes from the signed-in account.',
  'Bạn đang xem với vai trò thành viên, chỉ admin mới chỉnh sửa được.':'You are viewing as a member; only admins can edit.',
  'Đã đổi logo, màu giao diện lấy từ logo':'Logo changed; the theme color was taken from the logo',
  'Đã đổi logo, không tìm được màu nổi bật nên giữ màu cũ':'Logo changed; no prominent color was found, so the old color is kept',
  'Không đọc được ảnh này, thử tệp PNG hoặc JPG khác':'Cannot read this image; try another PNG or JPG file'
},[
  [/^Danh sách lớp \((\d+) học sinh\)$/,function(n){return 'Class list ('+(+n===1?'1 student':n+' students')+')'}],
  [/^Màu giao diện (#[0-9A-Fa-f]{3,8}), lấy tự động từ logo$/,function(c){return 'Theme color '+c+', picked automatically from the logo'}]
]);
