'use strict';
/* English – trang Groups */
I18N.add('en',{
  'Sắp có':'Coming soon','chưa bầu':'not elected yet',
  'Mỗi nhóm sẽ có trang riêng. Phần này đang thiết kế nên chưa mở được.':'Each group will have its own page. This part is still being designed, so it cannot be opened yet.'
},[
  [/^(\d+) nhóm$/,function(n){return +n===1?'1 group':n+' groups'}],
  [/^(\d+) bạn$/,function(n){return +n===1?'1 member':n+' members'}],
  [/^Leader: (.+)$/,function(n){return 'Leader: '+I18N.tr(n)}]
]);
