'use strict';
/* English – trang Contacts (danh bạ) */
I18N.add('en',{
  '. Admin bổ nhiệm hoặc bãi nhiệm admin trong hộp Chỉnh sửa thành viên.':'. Admins can appoint or remove admins in the Edit member box.','Admin của lớp':'Class admin',
  'Admin sửa được thông tin lớp, bản tin, sơ đồ, danh bạ và tạo cuộc bầu. Học sinh chưa có tài khoản sẽ thành admin khi đăng ký.':'Admins can edit class info, the weekly bulletin, the seating map and contacts, and start elections. A student without an account becomes an admin when they register.',
  'Bạn không thể tự bãi nhiệm chính mình. Hãy nhờ admin khác.':'You cannot remove your own admin role. Ask another admin.',
  'Lớp phải còn ít nhất một admin có tài khoản.':'The class must keep at least one admin with an account.',
  'Chưa cập nhật cơ sở dữ liệu. Chạy sql/update-10.sql và sql/update-11.sql trong Supabase.':'The database is not up to date. Run sql/update-10.sql and sql/update-11.sql in Supabase.',
  'Chỉ admin mới được thay đổi.':'Only admins can make changes.','Không lưu được, vui lòng thử lại.':'Could not save, please try again.',
  'Danh bạ':'Contacts','SĐT / Zalo':'Phone / Zalo','Số điện thoại / Zalo':'Phone number / Zalo',
  'Sở trường':'Talents','Môn dạy / hỗ trợ':'Subject taught / supported','Môn dạy':'Subject taught',
  'Môn hỗ trợ bạn bè':'Subject you support for classmates','Chưa cập nhật':'Not updated yet',
  'Loại thành viên':'Member type','Chỉnh sửa thành viên':'Edit member','Thêm thành viên':'Add member',
  'Không có':'None','Email chưa đúng định dạng.':'The email format is invalid.',
  'Số điện thoại chưa đúng.':'The phone number is invalid.','Nhập họ và tên.':'Enter a full name.',
  'Tên này đã có trong danh sách.':'This name is already in the list.',
  'Không tìm thấy thành viên nào.':'No members found.','Tìm trong danh bạ':'Search the directory',
  'Lọc theo vai trò':'Filter by role','Vẽ, hát, bóng đá...':'Drawing, singing, football...',
  'Môn hỗ trợ: bạn đại diện chỉ bài và giúp đỡ cả lớp ở môn đó. Sở trường do học sinh tự điền, admin cũng chỉnh sửa được. Chức vụ cập nhật theo kết quả bầu ban cán sự.':'Supported subject: the representative classmate tutors and helps everyone in that subject. Talents are filled in by students and admins can edit them too. Positions update with the class officer election results.',
  /* sở trường mẫu */
  'Bóng đá':'Football','Chơi guitar':'Playing guitar','Cầu lông':'Badminton','Hát':'Singing',
  'Lập trình':'Programming','Nhảy':'Dancing','Viết văn':'Writing','Vẽ':'Drawing'
},[
  [/^Đã bổ nhiệm (.+) làm admin$/,function(n){return 'Appointed '+I18N.tr(n)+' as admin'}],
  [/^Đã bãi nhiệm admin của (.+)$/,function(n){return 'Removed admin role from '+I18N.tr(n)}],
  [/^Đã lưu thông tin (.+)$/,function(n){return 'Saved info for '+I18N.tr(n)}],
  [/^(\d+) thành viên$/,function(n){return n+' members'}]
]);
