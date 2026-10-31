'use strict';
/* Trang Feedback: gửi góp ý (lưu trên máy chủ, cả lớp đọc được) và admin đánh dấu đã xử lý */
function fbListHTML(){
  var c=cur();
  if(!c.feedback.length)return '<div class="empty"><p>Chưa có góp ý nào.</p></div>';
  return c.feedback.map(function(f){return '<div class="fi"><header><b style="font-weight:500">'+esc(f.who)+'</b><span>'+esc(f.time)+' · <span class="tag '+(f.st==='Mới'?'t-y':'t-g')+'">'+f.st+'</span></span></header><p>'+esc(f.text)+'</p>'+(admin()&&f.st==='Mới'?'<div style="margin-top:8px"><button class="btn gh" data-act="fbDone" data-id="'+f.id+'">'+ic('check',14)+'Đánh dấu đã xử lý</button></div>':'')+'</div>'}).join('');
}
function fbPaintList(){var el=$('fbList');if(el)el.innerHTML=fbListHTML()}   /* chỉ vẽ lại danh sách, giữ nguyên ô đang gõ */
function vFeedback(){
  var c=cur();
  return head('Góp ý',esc(c.name))+'<form class="card" id="fbForm" novalidate><label for="fbText">Góp ý của bạn</label><textarea id="fbText" maxlength="2000" placeholder="Viết góp ý cho lớp hoặc giáo viên"></textarea><div class="err" id="fbErr" hidden>Nhập nội dung góp ý trước khi gửi.</div><div class="ft"><label class="chk"><input type="checkbox" id="fbAnon"> Gửi ẩn danh</label><button class="btn" type="submit">Gửi góp ý</button></div></form><div class="fb" id="fbList">'+fbListHTML()+'</div>';
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act!=='fbDone'||!admin())return;
  var c=cur(),id=+a.dataset.id,f=c.feedback.find(function(x){return x.id===id});if(!f)return;
  a.disabled=true;
  API.setFeedbackStatus(id,'Đã xử lý').then(function(){f.st='Đã xử lý';fbPaintList();toast('Đã đánh dấu đã xử lý')}).catch(function(err){
    console.error(err);a.disabled=false;
    toast(err.message==='forbidden'?'Chỉ admin mới đánh dấu được.':err.message==='no_schema'?'Chưa lưu được: hãy chạy sql/update-16.sql trong Supabase.':'Không cập nhật được, vui lòng thử lại.');
  });
});

document.addEventListener('submit',function(e){
  if(e.target.id!=='fbForm')return;
  e.preventDefault();var c=cur();
  var tx=$('fbText').value.trim();if(!tx){$('fbErr').hidden=false;return}
  $('fbErr').hidden=true;
  var btn=e.target.querySelector('button[type=submit]');btn.disabled=true;
  API.postFeedback(tx,$('fbAnon').checked).then(function(f){
    if(!c.feedback.some(function(x){return x.id===f.id}))c.feedback.unshift(f);   /* tin realtime có thể đã thêm trước */
    var t=$('fbText');if(t)t.value='';fbPaintList();toast('Đã gửi góp ý');
  }).catch(function(err){
    console.error(err);
    toast(err.message==='too_long'?'Góp ý quá dài, tối đa 2000 ký tự.':err.message==='no_schema'?'Chưa gửi được: hãy chạy sql/update-16.sql trong Supabase.':'Không gửi được góp ý, vui lòng thử lại.');
  }).then(function(){btn.disabled=false});
});
