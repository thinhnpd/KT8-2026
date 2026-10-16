'use strict';
/* Nút chuyển ngôn ngữ VI / EN trên thanh trên */
(function(){
  var box=document.getElementById('langTg');
  function sync(lang){
    box.querySelectorAll('button[data-lang]').forEach(function(b){
      b.setAttribute('aria-pressed',String(b.dataset.lang===lang));
    });
  }
  box.addEventListener('click',function(e){
    var b=e.target.closest('button[data-lang]');
    if(b)I18N.set(b.dataset.lang);
  });
  I18N.onChange(sync);
  sync(I18N.get());
})();
