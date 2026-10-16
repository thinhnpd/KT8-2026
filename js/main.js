'use strict';
/* Điểm khởi chạy: mở đúng trang theo #hash rồi vẽ lần đầu */
(function(){
  var h0='';try{h0=location.hash.slice(1)}catch(e){}
  if(VIEWS[h0])S.page=h0;
  applyAccent();syncTg();render();
})();
