'use strict';
/* Bảng trang, vẽ lại giao diện và chuyển trang */
var VIEWS={event:vEvent,map:vMap,contacts:vContacts,groups:vGroups,vote:vVote,chianhom:function(){return ''},feedback:vFeedback,settings:vSettings};
var ADMIN_PAGES={chianhom:1};   /* trang chỉ admin được vào; thành viên bị đưa về trang Nhóm */
function render(){
  if(ADMIN_PAGES[S.page]&&!admin()){S.page='groups';try{history.replaceState(null,'','#groups')}catch(e){}if(typeof toast==='function')toast('Chỉ admin mới dùng được chức năng này.')}
  var p=S.page;
  $('view').hidden=(p==='chianhom'||p==='vote');
  $('cnHost').hidden=(p!=='chianhom');
  $('voteHost').hidden=(p!=='vote');
  if(p==='chianhom')mountChiaNhom();
  else if(p==='vote')mountVote();
  else $('view').innerHTML=VIEWS[p]();
  renderSidebar();renderTop();
}
function go(p){S.page=p;S.sel=null;S.stErr='';S.fin=false;closeDd();$('sb').classList.remove('open');render();try{history.replaceState(null,'','#'+p)}catch(e){}window.scrollTo(0,0)}