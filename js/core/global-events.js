'use strict';
/* Sự kiện toàn cục: nút điều hướng, bấm ra ngoài để đóng hộp, phím Esc */
document.addEventListener('click',function(e){
  var goBtn=e.target.closest('[data-go]');if(goBtn){go(goBtn.dataset.go);return}
  var a=e.target.closest('[data-act]');
  if(!a){
    if(!e.target.closest('.dd')&&!e.target.closest('#bellBtn')&&!e.target.closest('#avBtn'))closeDd();
    var pop=$('pop');if(pop&&!e.target.closest('.chipw'))pop.hidden=true;
  }
});

document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeDd();closeModal();var p=$('pop');if(p)p.hidden=true}});
