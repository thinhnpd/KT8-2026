'use strict';
/* Sidebar: thẻ lớp và menu chức năng */
function renderSidebar(){
  var c=cur();
  $('clogo').innerHTML=c.logo?'<img alt="Logo '+esc(c.name)+'" src="'+c.logo+'">':ic('school',20);
  $('ctt').textContent=c.name;
  $('cin').innerHTML='<div>'+ic('file-text',15)+c.students.length+' Học sinh</div><div>'+ic('building',15)+esc(c.school)+'</div>';
  $('nav').innerHTML=NAV.map(function(n){return '<button class="it" data-go="'+n.id+'"'+((S.page===n.id||(n.id==='groups'&&S.page==='chianhom'))?' aria-current="page"':'')+'>'+ic(n.i,20)+'<span class="lbl">'+n.t+'</span></button>'}).join('');
}

/* Logo + tên "S Class": bấm để về trang chủ (trang đầu tiên trong NAV).
   Màn hình cảm ứng không có rê chuột để mở rộng menu, nên chạm lần đầu chỉ mở menu, chạm lần nữa mới về trang chủ. */
$('brandBtn').setAttribute('href','#'+NAV[0].id);
$('brandBtn').addEventListener('click',function(e){
  e.preventDefault();
  var sb=$('sb');
  if(matchMedia('(hover:none)').matches&&!sb.classList.contains('open')){sb.classList.add('open');return}
  go(NAV[0].id);
});
/* Cảm ứng: chạm ra ngoài menu để thu gọn lại */
document.addEventListener('click',function(e){if(!e.target.closest('#sb'))$('sb').classList.remove('open')});
