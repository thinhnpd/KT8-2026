'use strict';
/* English – trang Class Map (sơ đồ lớp) */
I18N.add('en',{
  'Admin chưa tạo sơ đồ lớp.':'The admin has not created a class map yet.',
  'Đã xác nhận và lưu sơ đồ lớp':'Class map confirmed and saved',
  'Không lưu được sơ đồ, vui lòng thử lại.':'Could not save the map; please try again.',
  'Chỉ admin mới được thay đổi.':'Only admins can change this.',
  'Sơ đồ lớp':'Class map','Sơ đồ đã xác nhận.':'Class map confirmed.','Tạo sơ đồ mới':'Create new map',
  'Bàn giáo viên':"Teacher's desk",'BẢNG':'BOARD','Thông tin và bàn học':'Info and desks',
  'Số hàng dọc':'Number of rows','Số hàng ngang':'Number of columns','Mỗi bàn':'Seats per desk',
  'Danh sách học sinh':'Student list','Nam/nữ xen kẽ':'Alternate boys and girls','Ngẫu nhiên':'Random',
  'Sắp xếp tự động':'Auto arrange','Sắp xếp':'Arrange','Tạo sơ đồ bàn':'Generate desk map',
  'Làm lại':'Redo','Xác nhận sơ đồ':'Confirm map','Huỷ, giữ sơ đồ cũ':'Cancel, keep the old map',
  'Xem lại sơ đồ. Bấm hai học sinh để đổi chỗ cho nhau.':'Review the map. Click two students to swap seats.',
  'Nhập thông tin bàn học rồi bấm Tạo sơ đồ bàn.':'Enter the desk details, then click Generate desk map.',
  'Chưa đủ chỗ cho cả lớp, tăng số hàng hoặc số học sinh mỗi bàn':'Not enough seats for the whole class; increase the rows or students per desk',
  'Chọn ít nhất một tuỳ chọn trước nhé':'Please choose at least one option first',
  'Đã xác nhận sơ đồ lớp':'Class map confirmed','Chỉnh danh sách':'Edit list','Chỗ trống':'Empty seat'
},[
  [/^Sức chứa (\d+) chỗ, lớp có (\d+) học sinh\.$/,function(a,b){return 'Capacity: '+a+' seats; the class has '+b+' students.'}],
  [/^Thiếu (\d+) chỗ\.$/,function(n){return n+' seats short.'}],
  [/^Lấy từ mục Thông tin lớp: (\d+) học sinh\.$/,function(n){return 'Taken from Class info: '+n+' students.'}],
  [/^(\d+) học sinh chưa có chỗ vì sơ đồ đã đầy\. Bấm Tạo sơ đồ mới để sắp lại\.$/,function(n){return n+' students have no seat because the map is full. Click Create new map to rearrange.'}],
  [/^(\d+) học sinh$/,function(n){return +n===1?'1 student':n+' students'}],
  [/^(\d+) học sinh\.$/,function(n){return n+' students.'}]
]);
