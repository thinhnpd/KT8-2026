'use strict';
/* Bảng trang, vẽ lại giao diện và chuyển trang */
var VIEWS={event:vEvent,map:vMap,contacts:vContacts,groups:vGroups,vote:vVote,feedback:vFeedback,settings:vSettings};
function render(){$('view').innerHTML=VIEWS[S.page]();renderSidebar();renderTop()}
function go(p){S.page=p;S.sel=null;S.stErr='';S.fin=false;closeDd();$('sb').classList.remove('open');render();try{history.replaceState(null,'','#'+p)}catch(e){}window.scrollTo(0,0)}
