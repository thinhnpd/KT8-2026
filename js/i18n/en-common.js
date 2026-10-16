'use strict';
/* English – phần dùng chung: khung ứng dụng, thời gian, chức danh, vai trò, thông báo, tài khoản */
(function(){
  var T=function(s){return I18N.tr(s)};
  var pl=function(n,a,b){return n+' '+(+n===1?a:b)};
  var WD={'2':'Mon','3':'Tue','4':'Wed','5':'Thu','6':'Fri','7':'Sat'};

  I18N.add('en',{
    /* khung */
    'Chức năng':'Features','Menu chính':'Main menu','Mở hoặc thu gọn menu':'Open or collapse menu',
    'Đổi giao diện sáng hoặc tối':'Switch between light and dark theme',
    'Thông báo':'Notifications','Cài đặt':'Settings','Tài khoản':'Account',
    'Logo S Class':'S Class logo','Logo hiện tại':'Current logo',
    'Trường THPT Chuyên Lê Quý Đôn':'Lê Quý Đôn High School for the Gifted',
    /* nút chung */
    'Huỷ':'Cancel','Thêm':'Add','Lưu thay đổi':'Save changes','Tất cả':'All','Đã lưu':'Saved',
    'Chưa đọc':'Unread','Đã đọc':'Read','Mới':'New','Đã xử lý':'Resolved','Ẩn danh':'Anonymous',
    /* nhãn chung */
    'Lớp':'Class','Trường':'School','Họ và tên':'Full name','Ngày':'Date','Thứ':'Day','Loại':'Type',
    'Nội dung':'Content','Tiêu đề':'Title','Chi tiết':'Details','Vai trò':'Role','Chức vụ':'Position',
    'Bạn':'You','Admin lớp':'Class admin','Admin của lớp:':'Class admins:','Thành viên':'Member',
    'Giáo viên':'Teacher','Học sinh':'Student','Giáo viên chủ nhiệm':'Homeroom teacher',
    'Hôm nay':'Today','Hôm qua':'Yesterday','Vừa xong':'Just now','Sáng nay':'This morning',
    /* chức vụ */
    'Lớp trưởng':'Class president','Lớp phó học tập':'Vice president (academics)',
    'Lớp phó lao động':'Vice president (labor)','Bí thư chi đoàn':'Youth Union secretary','Thủ quỹ':'Treasurer',
    'Tổ trưởng':'Team leader',
    /* thứ trong tuần */
    'Thứ 2':'Mon','Thứ 3':'Tue','Thứ 4':'Wed','Thứ 5':'Thu','Thứ 6':'Fri','Thứ 7':'Sat','CN':'Sun','Chủ nhật':'Sun',
    /* môn học */
    'Toán':'Math','Ngữ văn':'Literature','Tiếng Anh':'English','Vật lý':'Physics','Hoá học':'Chemistry',
    'Sinh học':'Biology','Lịch sử':'History',
    /* loại sự kiện */
    'Sinh hoạt':'Class meeting','Bài tập':'Assignment','Kiểm tra':'Test','Sự kiện':'Event',
    /* chuông thông báo */
    'Đánh dấu đã đọc tất cả':'Mark all as read',
    'Admin cập nhật danh sách lớp':'Admin updated the class list',
    'Bầu ban cán sự đang mở, hạn bỏ phiếu 18/10':'The class officer election is open; voting closes 18/10',
    'Bạn được xếp trực nhật hôm nay (Thứ 5)':'You are on duty today (Thu)',
    'Cô Hằng đăng lịch kiểm tra 15 phút môn Hoá học':'Ms. Hằng posted a 15-minute Chemistry quiz',
    'Góp ý của bạn về lịch học bù đã được xử lý':'Your feedback about the make-up schedule has been resolved',
    'Tin ghim mới: Lịch thi Giữa kỳ HK1':'New pinned post: Semester 1 midterm exam schedule',
    /* đổi mật khẩu */
    'Mật khẩu hiện tại':'Current password','Mật khẩu mới':'New password',
    'Xác nhận lại mật khẩu mới':'Confirm new password','Đổi mật khẩu':'Change password',
    'Bản xem thử: chưa kiểm tra mật khẩu hiện tại với máy chủ.':'Preview only: the current password is not checked against a server.',
    'Hai mật khẩu mới chưa khớp.':'The two new passwords do not match.',
    'Mật khẩu mới cần ít nhất 8 ký tự.':'The new password needs at least 8 characters.',
    'Nhập mật khẩu hiện tại.':'Enter your current password.',
    'Đã đổi mật khẩu (bản xem thử)':'Password changed (preview)',
    /* câu nối trong chuỗi ghép */
    '. Danh sách này đổi sau mỗi lần bầu ban cán sự.':'. This list changes after every class officer election.'
  },[
    [/^Thông báo \((\d+)\)$/,function(n){return 'Notifications ('+n+')'}],
    [/^Thông báo, (\d+) chưa đọc$/,function(n){return 'Notifications, '+n+' unread'}],
    [/^Chưa đọc \((\d+)\)$/,function(n){return 'Unread ('+n+')'}],
    [/^Tất cả (\d+)$/,function(n){return 'All '+n}],
    [/^Giáo viên (\d+)$/,function(n){return 'Teachers '+n}],
    [/^Học sinh (\d+)$/,function(n){return 'Students '+n}],
    [/^(\d+) Học sinh$/,function(n){return pl(n,'Student','Students')}],
    [/^Logo Lớp (\S+)$/,function(n){return 'Class '+n+' logo'}],
    [/^Lớp (\d\S*)$/,function(n){return 'Class '+n}],
    [/^Tổ (\d+)$/,function(n){return 'Team '+n}],
    [/^Tổ trưởng Tổ (\d+)$/,function(n){return 'Team '+n+' leader'}],
    /* thời gian */
    [/^(\d+) giờ trước$/,function(n){return pl(n,'hour','hours')+' ago'}],
    [/^(\d+) ngày trước$/,function(n){return pl(n,'day','days')+' ago'}],
    [/^mở (.+)$/,function(p){return 'open '+p}],
    [/^hạn (.+)$/,function(d){return 'due '+d}],
    [/^(.+) ·$/,function(a){return T(a)+' ·'}],
    [/^Thứ ([2-7])(.*)$/,function(d,r){return WD[d]+r}],
    [/^CN( .*)$/,function(r){return 'Sun'+r}],
    [/^Tuần (\d+)(.*)$/,function(n,r){return 'Week '+n+r}],
    /* chức danh + tên */
    [/^(Cô|Thầy) (\p{Lu}[^\s.,;:!?]*(?: \p{Lu}[^\s.,;:!?]*){0,4})$/u,function(t,n){return (t==='Cô'?'Ms. ':'Mr. ')+n}],
    [/^\((.+?)\)(.*)$/,function(a,b){return '('+T(a)+')'+T(b)}],
    [/^Chỉnh sửa (.+)$/,function(n){return 'Edit '+T(n)}],
    [/^Xoá (.+)$/,function(n){return 'Delete '+T(n)}],
    [/^Hiện tại: (.+)$/,function(n){return 'Current: '+T(n)}],
    [/^Đã thêm (.+)$/,function(n){return 'Added '+T(n)}],
    [/^Đã xoá (.+)$/,function(n){return 'Removed '+T(n)}],
    [/^• (.+)$/,function(t){return '• '+T(t)}]
  ]);
})();
