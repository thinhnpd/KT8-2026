'use strict';
/* Hộp thoại dùng chung */
function openModal(title,body,okText,onOk){
  var l=$('layer');
  l.innerHTML='<div class="mod" id="mod"><div class="mp" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><h3>'+esc(title)+'</h3><div id="mb">'+body+'</div><div class="mf"><button class="btn gh" id="mcx">Huỷ</button><button class="btn" id="mok">'+okText+'</button></div></div></div>';
  $('mcx').onclick=closeModal;
  $('mok').onclick=function(){if(onOk()!==false)closeModal()};
  $('mod').addEventListener('mousedown',function(e){if(e.target===this)closeModal()});
  var f=l.querySelector('input,textarea,select');if(f)f.focus();
}
function closeModal(){$('layer').innerHTML=''}
