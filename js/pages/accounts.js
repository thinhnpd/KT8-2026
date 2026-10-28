'use strict';
/* Cài đặt > Tài khoản học sinh: tạo tài khoản hàng loạt cho cả lớp (chỉ admin).
   Bỏ qua: admin (kể cả người giữ chức vụ admin trong ban cán sự) và học sinh đã có tài khoản. */
var ACCT={info:null,run:null,saved:false};

function acctSection(){
  return '<section class="card" id="acctCard"><h2>Tài khoản học sinh</h2><p class="mu">Tạo tài khoản đăng nhập cho cả lớp. Học sinh dùng giao diện riêng chỉ để xem và bỏ phiếu.</p><div id="acctBox" class="acct-box"><span class="note">Đang tải...</span></div></section>';
}

/* Gọi sau khi trang Settings được vẽ: hỏi cơ sở dữ liệu ai đã có tài khoản */
function loadAcct(){
  if(!admin()||!$('acctBox'))return;
  var c=cur();
  AccountsAPI.profiles().then(function(pr){
    var students=c.students.map(function(n){return{id:API.idOf(n),name:n}}).filter(function(s){return s.id});
    var cl=AccountLogic.classify(students,pr,adminList(c).map(function(x){return x.n}));
    ACCT.info=cl;
    var box=$('acctBox');if(!box)return;
    box.innerHTML='<div class="acct-n"><span class="tag t-y">'+cl.todo.length+' chưa có tài khoản</span><span class="tag t-g">'+cl.hasAccount.length+' đã có tài khoản</span><span class="tag ad">'+cl.admins.length+' admin (bỏ qua)</span></div>'+
      '<div class="frow" style="margin-top:10px"><button class="btn" data-act="acctOpen"'+(cl.todo.length?'':' disabled')+'>'+ic('user-plus',15)+'Tạo tài khoản hàng loạt</button></div>'+
      (cl.todo.length?'':'<p class="note" style="margin-top:6px">Mọi học sinh (không phải admin) đều đã có tài khoản.</p>');
  }).catch(function(e){
    console.error(e);var box=$('acctBox');if(box)box.innerHTML='<span class="err">Không tải được danh sách tài khoản. Hãy tải lại trang.</span>';
  });
}

var ACCT_ERR={taken:'Tên đăng nhập đã có người dùng',rate:'Bị giới hạn số lần đăng ký của Supabase',weak_password:'Mật khẩu bị từ chối',signup_disabled:'Đăng ký đang bị tắt trong Supabase',network:'Mất kết nối',link_failed:'Đã tạo tài khoản nhưng chưa gắn được vào học sinh',unknown:'Lỗi không xác định'};

function acctPreview(){
  var cl=ACCT.info,taken={};
  /* tên đăng nhập gợi ý, duy nhất trong lớp */
  var rows=cl.todo.map(function(s){return{studentId:s.id,name:s.name,username:AccountLogic.uniqueUsername(s.name,taken),status:'wait'}});
  ACCT.run={items:rows,cancel:false,going:false,done:false,wait:0};ACCT.saved=false;
  var body='<p class="note" style="margin:0 0 8px">Sẽ tạo '+rows.length+' tài khoản học sinh. Bỏ qua '+cl.hasAccount.length+' bạn đã có tài khoản và '+cl.admins.length+' admin. Có thể sửa tên đăng nhập trước khi tạo.</p>'+
    '<div class="stl acct-tbl"><table><thead><tr><th>STT</th><th>Họ và tên</th><th>Tên đăng nhập</th></tr></thead><tbody>'+
    rows.map(function(r,i){return '<tr><td class="rn">'+(i+1)+'</td><td>'+esc(r.name)+'</td><td><input type="text" class="acct-u" data-i="'+i+'" value="'+esc(r.username)+'" maxlength="30" autocomplete="off" spellcheck="false" aria-label="Tên đăng nhập của '+esc(r.name)+'"></td></tr>'}).join('')+'</tbody></table></div>'+
    '<div class="banner" style="margin-top:10px">'+ic('key',16)+'<span>Mật khẩu ngẫu nhiên (8 ký tự) được tạo khi bấm Tạo và chỉ hiện một lần. Hãy tải file CSV để phát cho học sinh; học sinh đổi mật khẩu sau khi đăng nhập.</span></div>'+
    '<div class="err" id="acctErr" hidden></div>';
  openModal('Tạo tài khoản hàng loạt',body,ic('user-plus',15)+'Tạo '+rows.length+' tài khoản',acctStart);
  $('mcx').onclick=acctClose;
}

function acctClose(){
  var r=ACCT.run;
  if(r&&r.going){r.cancel=true;$('mcx').textContent='Đang dừng...';$('mcx').disabled=true;return}
  if(r&&r.done&&!ACCT.saved&&r.items.some(function(i){return i.status==='ok'})){
    if(!r.warned){r.warned=true;$('mcx').textContent='Chưa tải CSV. Bấm lần nữa để đóng';return}
  }
  ACCT.run=null;closeModal();loadAcct();
}

function acctStart(){
  var r=ACCT.run;if(!r||r.going||r.done)return false;
  var err=$('acctErr'),seen={},bad='';
  Array.prototype.forEach.call(document.querySelectorAll('.acct-u'),function(inp){
    var it=r.items[+inp.dataset.i],u=inp.value.trim().toLowerCase();it.username=u;
    if(!bad&&!AccountLogic.validUsername(u))bad='Tên đăng nhập của '+it.name+' không hợp lệ (3–30 ký tự: chữ không dấu, số, dấu chấm, gạch).';
    else if(!bad&&seen[u])bad='Hai bạn trùng tên đăng nhập: '+u+'.';
    seen[u]=1;
  });
  if(bad){err.textContent=bad;err.hidden=false;return false}
  r.items.forEach(function(it){it.password=AccountLogic.genPassword(8)});
  r.going=true;
  $('mok').disabled=true;$('mok').textContent='Đang tạo...';$('mcx').textContent='Dừng';
  acctRenderRun();
  AccountsAPI.run(r.items,{
    update:function(){acctRenderRun()},
    wait:function(s){r.wait=s;acctRenderRun()},
    cancelled:function(){return r.cancel}
  }).then(function(){r.going=false;r.done=true;acctFinish()})
    .catch(function(e){console.error(e);r.going=false;r.done=true;acctFinish()});
  return false;
}

var ST_TXT={wait:'Chờ',busy:'Đang tạo...',ok:'Đã tạo',error:'Lỗi',skipped:'Bỏ qua'};
function acctRenderRun(){
  var r=ACCT.run,mb=$('mb');if(!r||!mb)return;
  var ok=r.items.filter(function(i){return i.status==='ok'}).length,fin=r.items.filter(function(i){return i.status==='ok'||i.status==='error'||i.status==='skipped'}).length;
  var h='<p class="note" style="margin:0 0 6px">'+(r.done?'Hoàn tất':'Đang tạo tài khoản, đừng đóng trang')+': '+fin+'/'+r.items.length+' · thành công '+ok+'</p>'+
    '<div class="pbar2"><i style="width:'+Math.round(fin/r.items.length*100)+'%"></i></div>'+
    (r.wait?'<p class="note" style="margin-top:6px">Supabase giới hạn số lần đăng ký, chờ '+r.wait+' giây rồi tiếp tục...</p>':'')+
    '<div class="stl acct-tbl" style="margin-top:8px"><table><thead><tr><th>STT</th><th>Họ và tên</th><th>Tên đăng nhập</th><th>Mật khẩu</th><th></th></tr></thead><tbody>'+
    r.items.map(function(it,i){
      var done=it.status==='ok';
      return '<tr><td class="rn">'+(i+1)+'</td><td>'+esc(it.name)+'</td><td>'+esc(it.username)+'</td><td class="acct-pw">'+(done?esc(it.password):'<span class="mu">-</span>')+'</td>'+
        '<td><span class="tag '+(done?'t-g':it.status==='error'?'t-r':it.status==='busy'?'t-y':'t-n')+'">'+ST_TXT[it.status]+'</span>'+(it.status==='error'?'<div class="note">'+esc(ACCT_ERR[it.error]||ACCT_ERR.unknown)+'</div>':'')+'</td></tr>';
    }).join('')+'</tbody></table></div>';
  var keep=$('acctFoot');mb.innerHTML=h+(keep?keep.outerHTML:'');
}

function acctFinish(){
  var r=ACCT.run,ok=r.items.filter(function(i){return i.status==='ok'}),bad=r.items.filter(function(i){return i.status==='error'}),orph=bad.filter(function(i){return i.orphan});
  acctRenderRun();
  var note='<div id="acctFoot">'+(bad.length?'<p class="err" style="margin-top:8px">'+bad.length+' tài khoản chưa tạo được. Mở lại "Tạo tài khoản hàng loạt" để thử lại cho những bạn còn lại.</p>':'')+
    (orph.length?'<p class="note">Có '+orph.length+' tài khoản đã được tạo nhưng chưa gắn vào học sinh ('+orph.map(function(i){return esc(i.username)}).join(', ')+'). Hãy chạy sql/update-7.sql nếu chưa chạy, rồi xoá các tài khoản này trong Supabase > Authentication > Users và tạo lại.</p>':'')+
    (ok.length?'<div class="banner" style="margin-top:10px">'+ic('key',16)+'<span>Mật khẩu chỉ hiện ở đây. Tải file CSV trước khi đóng.</span></div>':'')+'</div>';
  $('mb').insertAdjacentHTML('beforeend',note);
  var okb=$('mok'),cx=$('mcx');
  cx.disabled=false;cx.textContent='Đóng';cx.onclick=acctClose;
  if(ok.length){okb.disabled=false;okb.innerHTML=ic('upload',15)+'Tải file CSV';okb.onclick=acctCsv}
  else{okb.hidden=true}
  if(ok.length)toast('Đã tạo '+ok.length+' tài khoản học sinh');
}

function acctCsv(){
  var r=ACCT.run;if(!r)return;
  var rows=[['STT','Họ và tên','Tên đăng nhập','Mật khẩu','Lớp']],n=0,cn=cur().name;
  r.items.forEach(function(it){if(it.status==='ok')rows.push([++n,it.name,it.username,it.password,cn])});
  var blob=new Blob([AccountLogic.csv(rows)],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='tai-khoan-hoc-sinh.csv';document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(a.href);a.remove()},1000);
  ACCT.saved=true;r.warned=false;
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a||a.dataset.act!=='acctOpen')return;
  if(!admin()||!ACCT.info||!ACCT.info.todo.length)return;
  acctPreview();
});

/* Không cho bấm ra ngoài hộp thoại để đóng khi đang tạo (sẽ mất mật khẩu chưa tải) */
$('layer').addEventListener('mousedown',function(e){if(e.target.id==='mod'&&ACCT.run&&(ACCT.run.going||ACCT.run.done))e.stopPropagation()},true);
