'use strict';
/* Trang Groups: chọn môn rồi xem bộ nhóm học tập đã lưu trong cơ sở dữ liệu */
var GRP_METHOD={lights:'Đèn may mắn',ball:'Bi lăn',manual:'Thủ công'};
function vGroups(){
  var c=cur();
  return head('Nhóm',esc(c.name))+
    (admin()?'<div class="cn-row"><button class="cn-open" onclick="go(\'chianhom\')">'+ic('users',16)+'<span>Công cụ chia nhóm học tập</span></button></div>':'')+
    '<form class="card" id="grpForm" novalidate><div class="frow"><div style="flex:1;max-width:260px"><label for="grpSubj">Môn học</label>'+
    '<select id="grpSubj">'+GSUBJ.map(function(s){return '<option value="'+s.c+'">'+esc(s.vi)+'</option>'}).join('')+'</select></div>'+
    '<button class="btn" type="submit" id="grpBtn">Xem nhóm</button></div></form><div id="grpOut" aria-live="polite"></div>';
}
function grpShow(nm,s){
  var d=new Date(s.created),dt=isNaN(d)?'':d.toLocaleDateString('vi-VN');
  return '<div class="gmeta"><h2>'+esc(nm)+'</h2><span class="tag t-n">'+s.groups.length+' nhóm</span>'+
    '<span class="mu">Chia bằng '+esc(GRP_METHOD[s.method]||s.method)+'</span>'+(dt?'<span class="mu">Lưu ngày '+dt+'</span>':'')+'</div><div class="cards w">'+
    s.groups.map(function(g){
      var m=g.members.filter(Boolean),col=/^#[0-9a-f]{3,8}$/i.test(g.color||'')?g.color:'var(--acc)';
      return '<div class="gcd" style="--gc:'+col+'"><header><b>Nhóm '+g.no+'</b><span class="tag t-n">'+m.length+' bạn</span></header><ol>'+
        m.map(function(n){return '<li>'+esc(n)+'</li>'}).join('')+'</ol></div>';
    }).join('')+'</div>';
}
async function grpLoad(){
  var sl=$('grpSubj'),nm=sl.options[sl.selectedIndex].text,code=sl.value,btn=$('grpBtn');
  btn.disabled=true;$('grpOut').innerHTML='<p class="mu">Đang tải...</p>';
  var html;
  try{
    var s=(await API.loadGroups())[code];
    html=s?grpShow(nm,s):'<div class="card"><p class="mu">'+esc(nm)+' chưa có bộ nhóm học tập.</p></div>';
  }catch(err){console.error(err);html='<p class="err">Không tải được dữ liệu. Vui lòng thử lại.</p>'}
  var out=$('grpOut');if(!out)return;   // người dùng đã chuyển sang trang khác
  out.innerHTML=html;btn.disabled=false;
}
document.addEventListener('submit',function(e){
  if(e.target.id!=='grpForm')return;
  e.preventDefault();grpLoad();
});
