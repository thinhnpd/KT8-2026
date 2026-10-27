'use strict';
/* English – trang Contacts (danh bạ) */
I18N.add('en',{
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
  [/^Đã lưu thông tin (.+)$/,function(n){return 'Saved info for '+I18N.tr(n)}],
  [/^(\d+) thành viên$/,function(n){return n+' members'}]
]);
