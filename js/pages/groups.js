'use strict';
/* Trang Groups (các nhóm chưa mở được) */
function vGroups(){
  var c=cur(),g=groupsOf(c);
  return head('Groups',esc(c.name)+' · '+g.length+' nhóm')+'<div class="banner">'+ic('lock',16)+'<span>Mỗi nhóm sẽ có trang riêng. Phần này đang thiết kế nên chưa mở được.</span></div><div class="cards w">'+
    g.map(function(m,i){var l=holder(c,'Tổ trưởng Tổ '+(i+1));return '<div class="gi" aria-disabled="true"><span class="gico">'+ic('users',18)+'</span><div><b>Tổ '+(i+1)+'</b><small>'+m.length+' bạn · Tổ trưởng: '+(l?esc(l):'chưa bầu')+'</small></div><span class="tag t-n">Sắp có</span></div>'}).join('')+'</div>';
}
