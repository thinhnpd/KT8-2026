'use strict';
/* English – trang Settings (thông tin lớp, logo, chuyển tài khoản) */
I18N.add('en',{
  'Thêm học sinh (mỗi dòng một học sinh)':'Add students (one per line)',
  'Mỗi dòng một họ và tên, có thể dán cả danh sách':'One full name per line; you can paste a whole list',
  'Thêm vào lớp':'Add to class',
  'Nhập ít nhất một họ và tên.':'Enter at least one full name.',
  'Tất cả các tên đã có trong danh sách.':'All of these names are already in the list.',
  'Mỗi lần thêm tối đa 100 học sinh.':'You can add at most 100 students at a time.',
  'Thông tin lớp và tài khoản':'Class info and account','Thông tin lớp':'Class info',
  'Họ và tên học sinh mới':'New student full name','Nhập họ và tên học sinh.':'Enter the student full name.',
  'Tải logo lên':'Upload logo','Thử logo mẫu':'Try a sample logo','STT':'No.','Màu giao diện':'Theme color',
  'Chuyển tài khoản':'Switch account',
  'Thoát khỏi lớp này để đăng nhập hoặc đăng ký tài khoản khác.':'Leave this class to sign in or register with another account.',
  'Chưa mở, sẽ làm cùng màn hình đăng nhập và đăng ký.':'Not available yet; it will arrive with the sign-in and register screens.',
  'Chỉ dùng để xem thử, bản thật lấy từ tài khoản đăng nhập.':'For preview only; the real role comes from the signed-in account.',
  'Bạn đang xem với vai trò thành viên, chỉ admin mới chỉnh sửa được.':'You are viewing as a member; only admins can edit.',
  'Đã đổi logo, màu giao diện lấy từ logo':'Logo changed; the theme color was taken from the logo',
  'Đã đổi logo, không tìm được màu nổi bật nên giữ màu cũ':'Logo changed; no prominent color was found, so the old color is kept',
  'Không đọc được ảnh này, thử tệp PNG hoặc JPG khác':'Cannot read this image; try another PNG or JPG file',
  /* tài khoản */
  'Tài khoản và cài đặt':'Account and settings','Tên hiển thị':'Display name','Tên đăng nhập':'Username','Lưu tên':'Save name',
  'Tên hiển thị gồm 1–60 ký tự.':'The display name must be 1–60 characters.',
  'Đã đổi tên hiển thị':'Display name changed','Đã đổi mật khẩu':'Password changed',
  'Nhập mật khẩu hiện tại.':'Enter the current password.','Mật khẩu mới cần ít nhất 8 ký tự.':'The new password needs at least 8 characters.',
  'Hai mật khẩu mới chưa khớp.':'The two new passwords do not match.',
  'Mật khẩu hiện tại không đúng.':'The current password is incorrect.',
  'Mật khẩu mới phải khác mật khẩu hiện tại.':'The new password must be different from the current one.',
  /* lưu thay đổi */
  'Không lưu được, vui lòng thử lại.':'Could not save; please try again.','Không lưu được logo, vui lòng thử lại.':'Could not save the logo; please try again.',
  'Chỉ admin mới được thay đổi.':'Only admins can change this.','Tên lớp này đã được dùng.':'This class name is already in use.',
  'Tên này đã có trong danh sách.':'This name is already in the list.',
  'Đăng xuất để đăng nhập hoặc đăng ký tài khoản khác.':'Sign out to log in or register with another account.'
},[
  [/^Sẽ thêm (\d+) học sinh$/,function(n){return 'Will add '+(+n===1?'1 student':n+' students')}],
  [/^bỏ qua (\d+) dòng đã có hoặc trùng$/,function(n){return 'skipping '+n+(+n===1?' line that is':' lines that are')+' already in the list or duplicated'}],
  [/^Đã thêm (\d+) học sinh$/,function(n){return 'Added '+(+n===1?'1 student':n+' students')}],
  [/^Đã bỏ qua (\d+) tên đã có: (.+)$/,function(n,l){return 'Skipped '+n+(+n===1?' name':' names')+' already in the list: '+l}],
  [/^Có tên dài quá 80 ký tự: (.+)$/,function(n){return 'A name is longer than 80 characters: '+n}],
  [/^Danh sách lớp \((\d+) học sinh\)$/,function(n){return 'Class list ('+(+n===1?'1 student':n+' students')+')'}],
  [/^Màu giao diện (#[0-9A-Fa-f]{3,8}), lấy tự động từ logo$/,function(c){return 'Theme color '+c+', picked automatically from the logo'}]
]);
