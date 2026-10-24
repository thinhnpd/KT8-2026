'use strict';
/* Chuông thông báo */
function renderBell(){
  var un=notifs.filter(function(n){return n.un}).length;
  $('bellDd').innerHTML='<div class="dd-h"><b>Thông báo'+(un?' ('+un+')':'')+'</b><button class="linkbtn" data-act="readAll"'+(un?'':' disabled')+'>Đánh dấu đã đọc tất cả</button></div><div class="nl">'+
    notifs.map(function(n){return '<button class="ni'+(n.un?' unread':'')+'" data-act="notif" data-id="'+n.id+'"><span class="ico">'+ic(n.i,16)+'</span><span style="flex:1;min-width:0"><p>'+esc(n.t)+'</p><small>'+n.time+' · mở '+TITLES[n.pg]+'</small></span>'+(n.un?'<span class="dot" aria-label="Chưa đọc"></span>':'')+'</button>'}).join('')+'</div>';
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act;
  if(act==='readAll'){var ids=notifs.filter(function(n){return n.un}).map(function(n){return n.id});notifs.forEach(function(n){n.un=false});renderBell();renderTop();if(ids.length)API.markRead(ids).catch(function(){})}
  else if(act==='notif'){var n=notifs.filter(function(x){return x.id===+a.dataset.id})[0];if(n.un){n.un=false;API.markRead([n.id]).catch(function(){})}go(n.pg)}
});
