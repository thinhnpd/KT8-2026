'use strict';
/* English – trang Groups (gồm cả công cụ chia nhóm học tập) */
I18N.add('en',{
  'Nhóm':'Groups',
  'Lưu bộ nhóm này cho môn:':'Save this group set for subject:','Lưu':'Save',
  'Toán':'Maths','Ngữ Văn':'Literature','Ngữ văn':'Literature','Tiếng Anh':'English','Vật lý':'Physics','Hoá học':'Chemistry','Sinh học':'Biology','Lịch sử':'History',
  'Sắp có':'Coming soon','chưa bầu':'not elected yet',
  'Mỗi nhóm sẽ có trang riêng. Phần này đang thiết kế nên chưa mở được.':'Each group will have its own page. This part is still being designed, so it cannot be opened yet.',
  'Công cụ chia nhóm học tập':'Study group creator',
  'Chia nhóm học tập':'Study groups',
  'Chọn trò chơi để thực hiện việc chia nhóm cho lớp.':'Choose a game to divide the class into groups.',
  'Bi lăn ngẫu nhiên':'Random ball drop',
  'Đèn may mắn':'Lucky lights',
  'Bi rơi qua các chốt và dừng ngẫu nhiên ở một ô trong danh sách tùy chỉnh.':'The ball falls through the pegs and lands randomly in one slot of a custom list.',
  'Các đèn nhấp nháy theo màu của từng nhóm, rồi chia đều thành viên vào các nhóm.':'Lights flash in each group\u2019s colour, then the members are divided evenly into the groups.',
  '← Quay lại':'← Back'
},[
  [/^Đã lưu cho môn (.+)\.$/,function(s){return 'Saved for '+I18N.tr(s)+'.'}],
  [/^Đã lưu nhóm học tập môn (.+)$/,function(s){return 'Study groups saved for '+I18N.tr(s)}],
  [/^(\d+) tên không có trong danh sách lớp sẽ bị bỏ qua\.$/,function(n){return n+(+n===1?' name is':' names are')+' not in the class list and will be skipped.'}],
  [/^Nhóm học tập môn (.+) đã được cập nhật$/,function(s){return 'Study groups for '+I18N.tr(s)+' were updated'}],
  [/^(\d+) nhóm$/,function(n){return +n===1?'1 group':n+' groups'}],
  [/^(\d+) bạn$/,function(n){return +n===1?'1 member':n+' members'}],
  [/^Leader: (.+)$/,function(n){return 'Leader: '+I18N.tr(n)}],
  [/^Chơi (.+)$/,function(n){return 'Play '+I18N.tr(n)}]
]);