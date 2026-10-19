'use strict';
/* Sidebar: thẻ lớp và menu chức năng */
function renderSidebar(){
  var c=cur();
  $('clogo').innerHTML=c.logo?'<img alt="Logo '+esc(c.name)+'" src="'+c.logo+'">':ic('school',20);
  $('ctt').textContent=c.name;
  $('cin').innerHTML='<div>'+ic('file-text',15)+c.students.length+' Học sinh</div><div>'+ic('building',15)+esc(c.school)+'</div>';
  $('nav').innerHTML=NAV.map(function(n){return '<button class="it" data-go="'+n.id+'"'+((S.page===n.id||(n.id==='groups'&&S.page==='chianhom'))?' aria-current="page"':'')+'>'+ic(n.i,20)+'<span class="lbl">'+n.t+'</span></button>'}).join('');
}

$('brandBtn').onclick=function(){$('sb').classList.toggle('open')};
