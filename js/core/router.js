'use strict';
/* Bảng trang, vẽ lại giao diện và chuyển trang */
var VIEWS={event:vEvent,map:vMap,contacts:vContacts,groups:vGroups,vote:vVote,chianhom:function(){return ''},feedback:vFeedback,settings:vSettings};
function render(){
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
