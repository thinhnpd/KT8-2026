'use strict';
/* Trang Vote: hiển thị bo_phieu/vote.html trong iframe, giữ nguyên khi chuyển trang. */
var VOTE_SRC='bo_phieu/vote.html';
function mountVote(){
  var h=$('voteHost');
  if(h.firstChild)return;               // chỉ tạo một lần để không mất dữ liệu đang bỏ phiếu
  var f=document.createElement('iframe');
  f.className='vt-frame';f.title='Bỏ phiếu';f.src=VOTE_SRC;
  h.appendChild(f);
}