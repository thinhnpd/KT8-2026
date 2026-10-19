'use strict';
/* English – trang Groups (gồm cả công cụ chia nhóm học tập) */
I18N.add('en',{
  'Sắp có':'Coming soon','chưa bầu':'not elected yet',
  'Mỗi nhóm sẽ có trang riêng. Phần này đang thiết kế nên chưa mở được.':'Each group will have its own page. This part is still being designed, so it cannot be opened yet.',
  'Công cụ chia nhóm học tập':'Study group tool',
  'Chia nhóm học tập':'Study groups',
  'Chọn trò chơi để thực hiện việc chia nhóm cho lớp.':'Choose a game to divide the class into groups.',
  'Bi lăn ngẫu nhiên':'Random ball drop',
  'Đèn may mắn':'Lucky lights',
  'Bi rơi qua các chốt và dừng ngẫu nhiên ở một ô trong danh sách tùy chỉnh.':'The ball falls through the pegs and lands randomly in one slot of a custom list.',
  'Các đèn nhấp nháy theo màu của từng nhóm, rồi chia đều thành viên vào các nhóm.':'Lights flash in each group\u2019s colour, then the members are divided evenly into the groups.',
  '← Quay lại':'← Back'
},[
  [/^(\d+) nhóm$/,function(n){return +n===1?'1 group':n+' groups'}],
  [/^(\d+) bạn$/,function(n){return +n===1?'1 member':n+' members'}],
  [/^Leader: (.+)$/,function(n){return 'Leader: '+I18N.tr(n)}],
  [/^Chơi (.+)$/,function(n){return 'Play '+I18N.tr(n)}]
]);