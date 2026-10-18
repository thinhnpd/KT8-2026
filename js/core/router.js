'use strict';
/* Bảng trang, vẽ lại giao diện và chuyển trang */
var VIEWS={event:vEvent,map:vMap,contacts:vContacts,groups:vGroups,vote:vVote,chianhom:function(){return ''},feedback:vFeedback,settings:vSettings};
function render(){
  var cn=S.page==='chianhom';
  $('view').hidden=cn;$('cnHost').hidden=!cn;
  if(cn)mountChiaNhom();else $('view').innerHTML=VIEWS[S.page]();
  renderSidebar();renderTop();
}
function go(p){S.page=p;S.sel=null;S.stErr='';S.fin=false;closeDd();$('sb').classList.remove('open');render();try{history.replaceState(null,'','#'+p)}catch(e){}window.scrollTo(0,0)}
