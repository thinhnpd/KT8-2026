'use strict';
/* Công cụ chia nhóm học tập: mở trò chơi ngay trong trang (iframe), không mở tab mới.
   Các iframe được giữ lại khi chuyển trang nên trò chơi không bị tải lại. */
var CN_GAMES=[
  {id:'bilan',name:'Bi lăn ngẫu nhiên',desc:'Bi rơi qua các chốt và dừng ngẫu nhiên ở một ô trong danh sách tùy chỉnh.',src:'game_chia_nhom/bi_lan.html'},
  {id:'den',name:'Đèn may mắn',desc:'Các đèn nhấp nháy theo màu của từng nhóm, rồi chia đều thành viên vào các nhóm.',src:'game_chia_nhom/den_may_man.html'}
];
var CN={built:false,frames:{}};

function mountChiaNhom(){
  if(CN.built)return;
  CN.built=true;
  var host=$('cnHost');
  host.innerHTML=
    '<div id="cnHub"><button class="cn-back" data-cn="groups">← Groups</button>'+
    '<h2 class="cn-t">Chia nhóm học tập</h2>'+
    '<p class="mu">Chọn trò chơi để thực hiện việc chia nhóm cho lớp.</p><div class="cn-grid">'+
    CN_GAMES.map(function(g){return '<div class="cn-card"><h3>'+esc(g.name)+'</h3><p class="mu">'+esc(g.desc)+'</p>'+
      '<button class="cn-btn" data-cn="'+g.id+'">Chơi '+esc(g.name)+'</button></div>'}).join('')+
    '</div></div>'+
    '<div id="cnGame" hidden><div class="cn-save" id="cnSave" hidden></div><div class="cn-bar"><button class="cn-back" data-cn="back">← Quay lại</button><b id="cnTitle"></b></div><div id="cnFrames"></div></div>';
  host.addEventListener('click',function(e){
    var b=e.target.closest('[data-cn]');if(!b)return;
    if(b.dataset.cn==='back')cnBack();
    else if(b.dataset.cn==='groups')go('groups');
    else cnOpen(CN_GAMES.filter(function(g){return g.id===b.dataset.cn})[0]);
  });
}

function cnOpen(g){
  var f=CN.frames[g.id];
  if(!f){
    f=document.createElement('iframe');
    f.className='cn-frame';f.title=g.name;f.src=g.src;
    f.addEventListener('load',function(){cnFit(f)});
    $('cnFrames').appendChild(f);CN.frames[g.id]=f;
  }
  CN_GAMES.forEach(function(x){if(CN.frames[x.id])CN.frames[x.id].hidden=(x.id!==g.id)});
  $('cnTitle').textContent=g.name;
  $('cnHub').hidden=true;$('cnGame').hidden=false;
}
function cnBack(){$('cnGame').hidden=true;$('cnHub').hidden=false}

/* Co giãn iframe theo chiều cao nội dung trò chơi (cùng một website nên được phép đọc) */
function cnFit(f){
  try{
    var d=f.contentDocument,fit=function(){f.style.height=Math.ceil(d.body.getBoundingClientRect().height)+'px'};
    fit();if(window.ResizeObserver)new ResizeObserver(fit).observe(d.body);
  }catch(e){f.style.height='80vh'}
}
/* Nhận kết quả chia nhóm từ trò chơi (iframe cùng website) và lưu vào cơ sở dữ liệu theo từng môn */
window.addEventListener('message',function(e){
  if(e.origin!==location.origin||!e.data||e.data.type!=='groups:done'||!admin())return;
  cnAskSave(e.data);
});
function cnAskSave(d){
  var box=$('cnSave'),unknown=0;
  d.groups.forEach(function(g){g.members.forEach(function(m){if(!API.idOf(m))unknown++})});
  box.innerHTML='<span>Lưu bộ nhóm này cho môn:</span> <select id="cnSubj">'+SUBJ.map(function(s){return '<option>'+esc(s)+'</option>'}).join('')+'</select> '+
    '<button class="cn-btn" id="cnSaveBtn">Lưu</button> <span class="mu" id="cnSaveMsg">'+(unknown?unknown+' tên không có trong danh sách lớp sẽ bị bỏ qua.':'')+'</span>';
  box.hidden=false;
  $('cnSaveBtn').onclick=async function(){
    var b=$('cnSaveBtn'),subj=$('cnSubj').value;b.disabled=true;
    try{
      await API.saveGroups(subj,d.method,d.groups);
      await API.notify('Nhóm học tập môn '+subj+' đã được cập nhật','groups','users');
      $('cnSaveMsg').textContent='Đã lưu cho môn '+subj+'.';
      if(typeof toast==='function')toast('Đã lưu nhóm học tập môn '+subj);
    }catch(err){console.error(err);$('cnSaveMsg').textContent='Không lưu được. Vui lòng thử lại.';b.disabled=false}
  };
}
