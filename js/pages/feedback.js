'use strict';
/* Trang Feedback: gửi và xử lý góp ý */
function vFeedback(){
  var c=cur();
  return head('Góp ý',esc(c.name))+'<form class="card" id="fbForm" novalidate><label for="fbText">Góp ý của bạn</label><textarea id="fbText" placeholder="Viết góp ý cho lớp hoặc giáo viên"></textarea><div class="err" id="fbErr" hidden>Nhập nội dung góp ý trước khi gửi.</div><div class="ft"><label class="chk"><input type="checkbox" id="fbAnon"> Gửi ẩn danh</label><button class="btn" type="submit">Gửi góp ý</button></div></form><div class="fb">'+
    c.feedback.map(function(f,i){return '<div class="fi"><header><b style="font-weight:500">'+esc(f.who)+'</b><span>'+f.time+' · <span class="tag '+(f.st==='Mới'?'t-y':'t-g')+'">'+f.st+'</span></span></header><p>'+esc(f.text)+'</p>'+(admin()&&f.st==='Mới'?'<div style="margin-top:8px"><button class="btn gh" data-act="fbDone" data-i="'+i+'">'+ic('check',14)+'Đánh dấu đã xử lý</button></div>':'')+'</div>'}).join('')+'</div>';
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur(),i=+a.dataset.i;
  if(act==='fbDone'&&admin()){c.feedback[i].st='Đã xử lý';render();toast('Đã đánh dấu đã xử lý')}
});

document.addEventListener('submit',function(e){
  if(e.target.id!=='fbForm')return;
  e.preventDefault();var c=cur();
    var tx=$('fbText').value.trim();if(!tx){$('fbErr').hidden=false;return}
    c.feedback.unshift({who:$('fbAnon').checked?'Ẩn danh':S.name,text:tx,time:'Vừa xong',st:'Mới'});render();toast('Đã gửi góp ý');
});
