'use strict';
/* Trang Vote: bầu ban cán sự (ảnh hưởng admin, danh bạ, tổ trưởng), bỏ phiếu, tạo bỏ phiếu */
function electionResult(c){
  var rows=[],issues=[];
  POSITIONS.forEach(function(r){
    var cs=(c.el.cands[r]||[]).slice().sort(function(a,b){return b.v-a.v}),st='ok',top=cs[0]?cs[0].n:'';
    if(!cs.length){st='none';top=''}
    else if(cs[0].v===0){st='zero';top=''}
    else if(cs[1]&&cs[1].v===cs[0].v){st='tie';top=''}
    if(st!=='ok')issues.push(r);
    rows.push({r:r,cur:holder(c,r),top:top,st:st});
  });
  return{rows:rows,issues:issues};
}
function finPanel(c){
  var res=electionResult(c),com=res.rows.map(function(x){return{r:x.r,w:x.top}}),after=adminList(c,com).map(function(x){return x.n}),before=adminList(c).map(function(x){return x.n});
  var add=after.filter(function(x){return before.indexOf(x)<0}),rem=before.filter(function(x){return after.indexOf(x)<0});
  return '<section class="card" style="border-color:var(--acc);margin-bottom:12px"><h2>Xác nhận chốt kết quả</h2><p class="mu">Người nhiều phiếu nhất mỗi chức vụ sẽ được áp dụng ngay cho cả lớp.</p><div class="scroll"><table><thead><tr><th>Chức vụ</th><th>Hiện tại</th><th>Người trúng cử</th></tr></thead><tbody>'+
    res.rows.map(function(x){return '<tr><td>'+x.r+'</td><td>'+(x.cur?esc(x.cur):'<span class="mu">-</span>')+'</td><td>'+(x.top?'<b style="font-weight:500">'+esc(x.top)+'</b>'+(x.top!==x.cur?' <span class="tag t-g">Mới</span>':''):'<span class="tag t-r">'+STXT[x.st]+'</span>')+'</td></tr>'}).join('')+'</tbody></table></div>'+
    (res.issues.length?'<p class="err" style="margin-top:8px">Còn '+res.issues.length+' chức vụ chưa chốt được. Thêm ứng viên hoặc chờ thêm phiếu.</p>':
      '<p class="note" style="margin-top:8px">Admin mới: '+(add.length?add.map(esc).join(', '):'không có')+'. Không còn là admin: '+(rem.length?rem.map(esc).join(', '):'không có')+'. Danh bạ, quyền admin và tổ trưởng sẽ cập nhật theo.</p>')+
    '<div class="mf"><button class="btn gh" data-act="finCancel">Huỷ</button><button class="btn" data-act="finOk"'+(res.issues.length?' disabled':'')+'>'+ic('check',15)+'Xác nhận chốt</button></div></section>';
}
function finalizeEl(c){
  var res=electionResult(c);if(res.issues.length)return;
  var com=res.rows.map(function(x){return{r:x.r,w:x.top}}),before=adminList(c).map(function(x){return x.n}),after=adminList(c,com).map(function(x){return x.n});
  c.committee=com;c.el.status='closed';
  c.el.sum={add:after.filter(function(x){return before.indexOf(x)<0}),rem:before.filter(function(x){return after.indexOf(x)<0})};
  S.fin=false;
  var was=S.role;S.role=after.indexOf(S.name)>-1?'admin':'member';
  notifs.unshift({id:Date.now(),i:'vote',t:'Kết quả bầu ban cán sự đã được áp dụng. Danh bạ và quyền admin đã cập nhật.',time:'Vừa xong',pg:'contacts',un:true});
  render();
  toast(S.role!==was&&S.role==='member'?'Đã chốt kết quả. Bạn không còn là admin của lớp.':'Đã chốt kết quả, Danh bạ và quyền admin đã cập nhật');
}
function vElection(){
  var c=cur(),el=c.el,n=c.students.length,closed=el.status==='closed',a=admin(),showRes=a||closed,g=groupsOf(c),myT=c.students.indexOf(S.name)%4;
  var h='<section class="card" style="margin-bottom:12px"><div class="frow" style="justify-content:space-between;align-items:flex-start;flex-wrap:wrap"><div><h2>Bầu ban cán sự</h2><p class="mu">Mỗi bạn bỏ một phiếu cho mỗi chức vụ. Tổ trưởng do thành viên của tổ đó bầu.</p></div><div style="text-align:right"><span class="tag '+(closed?'t-g':'t-y')+'">'+(closed?'Đã chốt':'Đang bầu · hạn '+el.deadline)+'</span><p class="note" style="margin-top:4px">Đã bỏ phiếu: '+el.voted+'/'+n+'</p></div></div>'+
    '<div class="banner" style="margin:8px 0 0">'+ic('key',16)+'<span>Khi chốt kết quả, Danh bạ, quyền admin và tổ trưởng của các tổ được cập nhật theo người trúng cử. Admin gồm giáo viên chủ nhiệm, lớp trưởng, lớp phó học tập và bí thư chi đoàn.</span></div></section>';
  if(closed){
    var s=el.sum||{add:[],rem:[]};
    h+='<div class="banner" style="margin-bottom:12px">'+ic('check',16)+'<span>Đã áp dụng kết quả. Admin mới: '+(s.add.length?s.add.map(esc).join(', '):'không có')+'. Không còn là admin: '+(s.rem.length?s.rem.map(esc).join(', '):'không có')+'.</span></div>';
  }
  if(S.fin&&a&&!closed)h+=finPanel(c);
  h+='<div class="cards w">'+POSITIONS.map(function(r,p){
    var tg=POSG(r),cs=el.cands[r]||[],tot=cs.reduce(function(x,y){return x+y.v},0),w=holder(c,r),canVote=!closed&&!el.me&&(tg<0||tg===myT);
    var top=closed?cs.slice().sort(function(x,y){return y.v-x.v})[0]:null;
    var list=cs.length?cs.map(function(x){
      var pct=tot?Math.round(x.v/tot*100):0,win=closed&&top&&x.n===top.n;
      return '<label class="cand'+(win?' win':'')+'">'+(showRes?'<span class="fillbar" style="width:'+pct+'%"></span>':'')+'<span class="cin2">'+(canVote?'<input type="radio" name="pk'+p+'" value="'+esc(x.n)+'" data-act="pick" data-p="'+p+'"'+(S.pick[p]===x.n?' checked':'')+'>':'')+'<span class="cn">'+esc(x.n)+'</span>'+(win?'<span class="tag t-g">Trúng cử</span>':'')+(showRes?'<span class="cv">'+x.v+' phiếu</span>':'')+'</span></label>';
    }).join(''):'<p class="note">Chưa có ứng viên.</p>';
    var info='';
    if(!closed&&el.me)info='Bạn đã bỏ phiếu.';
    else if(!closed&&tg>=0&&tg!==myT)info='Chỉ thành viên Tổ '+(tg+1)+' bỏ phiếu.';
    else if(!closed&&!a)info='Số phiếu hiện sau khi admin chốt.';
    var add='';
    if(a&&!closed){
      var names=cs.map(function(x){return x.n}),pool=(tg<0?c.students:g[tg]).filter(function(s){return names.indexOf(s)<0});
      add='<div class="frow" style="margin-top:6px"><select id="cs'+p+'" aria-label="Thêm ứng viên cho '+esc(r)+'"><option value="">Thêm ứng viên...</option>'+pool.map(function(s){return '<option>'+esc(s)+'</option>'}).join('')+'</select><button class="btn gh" data-act="addCand" data-p="'+p+'">'+ic('plus',14)+'Thêm</button></div>';
    }
    return '<div class="gcard"><h3><span>'+r+'</span>'+(ADMIN_POS.indexOf(r)>-1?'<span class="tag ad">Admin</span>':'')+'</h3><p class="note" style="margin:-2px 0 8px">Hiện tại: '+(w?esc(w):'chưa có')+'</p>'+list+(info?'<p class="note">'+info+'</p>':'')+add+'</div>';
  }).join('')+'</div>';
  if(!closed){
    h+='<div class="ft"><span class="note">'+(el.me?'Bạn đã gửi phiếu. Mỗi tài khoản gửi một lần.':'Chọn ứng viên cho từng chức vụ rồi gửi phiếu. Mỗi tài khoản gửi một lần.')+(a?' Admin xem được số phiếu tạm thời.':'')+'</span><span class="acts">'+
      (el.me?'':'<button class="btn" data-act="submitEl">'+ic('check',15)+'Gửi phiếu bầu</button>')+
      (a&&!S.fin?'<button class="btn gh" data-act="finStart">Chốt kết quả và áp dụng</button>':'')+'</span></div>';
  }else if(a){
    h+='<div class="ft"><span class="note">Muốn bầu lại, mở một đợt mới. Ứng viên ban đầu là người đang giữ chức vụ.</span><button class="btn gh" data-act="reopen">Mở đợt bầu mới</button></div>';
  }
  return h;
}
function vPolls(){
  var c=cur(),n=c.students.length,a=admin();
  if(!c.polls.length)return '<div class="empty">'+ic('vote',34)+'<p>Chưa có cuộc bỏ phiếu nào.'+(a?' Mở tab Tạo bỏ phiếu để tạo mới.':'')+'</p></div>';
  return '<div class="cards w">'+c.polls.map(function(p){
    var tot=p.opts.reduce(function(s,o){return s+o.v},0),done=p.my!=null,show=done||p.closed||a,can=!done&&!p.closed;
    return '<div class="gcard"><h3><span>'+esc(p.t)+'</span><span class="tag '+(p.closed?'t-n':'t-y')+'">'+(p.closed?'Đã đóng':'Đang mở')+'</span></h3>'+(p.desc?'<p class="note" style="margin:-2px 0 8px">'+esc(p.desc)+'</p>':'')+
      p.opts.map(function(o,i){var pct=tot?Math.round(o.v/tot*100):0;return '<label class="cand">'+(show?'<span class="fillbar" style="width:'+pct+'%"></span>':'')+'<span class="cin2">'+(can?'<input type="radio" name="pp'+p.id+'" value="'+i+'" data-act="ppick" data-id="'+p.id+'"'+(S.ppick[p.id]===i?' checked':'')+'>':'')+'<span class="cn">'+esc(o.t)+'</span>'+(p.my===i?'<span class="tag ad">Bạn chọn</span>':'')+(show?'<span class="cv">'+o.v+' phiếu · '+pct+'%</span>':'')+'</span></label>'}).join('')+
      '<p class="note" style="margin-top:4px">Do '+esc(p.by)+' tạo · hạn '+p.end+' · '+tot+'/'+n+' bạn đã bỏ phiếu</p>'+
      (can||(a&&!p.closed)?'<div class="ft" style="margin-top:8px"><span></span><span class="acts">'+(can?'<button class="btn" data-act="pvote" data-id="'+p.id+'">Bỏ phiếu</button>':'')+(a&&!p.closed?'<button class="btn gh" data-act="pclose" data-id="'+p.id+'">Đóng bỏ phiếu</button>':'')+'</span></div>':'')+'</div>';
  }).join('')+'</div>';
}
function vCreate(){
  return '<form class="card" id="pollForm" novalidate><h2>Tạo bỏ phiếu</h2><p class="mu">Cuộc bỏ phiếu mới hiện ở tab Bỏ phiếu cho cả lớp. Mỗi bạn chọn một lựa chọn.</p><div class="fg" style="max-width:520px">'+
    '<div><label for="pt">Câu hỏi</label><input type="text" id="pt" value="'+esc(S.pt)+'" placeholder="Chọn địa điểm tổng kết học kỳ" autocomplete="off"></div>'+
    '<div><label for="pdsc">Mô tả (không bắt buộc)</label><textarea id="pdsc">'+esc(S.pdsc)+'</textarea></div>'+
    '<div><label for="po0">Các lựa chọn</label><div class="fg" style="gap:6px">'+S.popts.map(function(v,i){return '<div class="frow" style="align-items:center"><input type="text" class="popt" id="po'+i+'" value="'+esc(v)+'" placeholder="Lựa chọn '+(i+1)+'" aria-label="Lựa chọn '+(i+1)+'" autocomplete="off">'+(S.popts.length>2?'<button type="button" class="sq" data-act="popDel" data-i="'+i+'" aria-label="Xoá lựa chọn '+(i+1)+'">'+ic('x',15)+'</button>':'')+'</div>'}).join('')+'</div>'+
      '<div style="margin-top:8px"><button type="button" class="btn gh" data-act="popAdd">'+ic('plus',14)+'Thêm lựa chọn</button></div></div>'+
    '<div><label for="pdays">Thời hạn</label><select id="pdays">'+[['1','1 ngày'],['2','2 ngày'],['3','3 ngày'],['5','5 ngày'],['7','7 ngày']].map(function(o){return '<option value="'+o[0]+'"'+(S.pdays===o[0]?' selected':'')+'>'+o[1]+'</option>'}).join('')+'</select></div>'+
    '<div class="err" id="pe"'+(S.perr?'':' hidden')+'>'+esc(S.perr)+'</div><div><button class="btn" type="submit">Đăng bỏ phiếu</button></div></div></form>';
}
function readPoll(){
  if(!$('pt'))return;
  S.pt=$('pt').value;S.pdsc=$('pdsc').value;S.pdays=$('pdays').value;
  S.popts=Array.prototype.map.call(document.querySelectorAll('.popt'),function(i){return i.value});
}
function vVote(){
  var a=admin();if(S.vtab==='create'&&!a)S.vtab='election';
  var tabs=[['election','Bầu ban cán sự'],['polls','Bỏ phiếu']].concat(a?[['create','Tạo bỏ phiếu']]:[]);
  return head('Bỏ phiếu',esc(cur().name))+'<div class="tabs" role="tablist">'+tabs.map(function(t){return '<button role="tab" data-act="vtab" data-v="'+t[0]+'" aria-selected="'+(S.vtab===t[0])+'">'+t[1]+'</button>'}).join('')+'</div>'+
    (S.vtab==='election'?vElection():S.vtab==='polls'?vPolls():vCreate());
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur(),i=+a.dataset.i;
  if(act==='vtab'){if(S.vtab==='create')readPoll();S.vtab=a.dataset.v;S.fin=false;render()}
  else if(act==='addCand'){
    var sel=$('cs'+i),v=sel?sel.value:'';
    if(!v){toast('Chọn một bạn trong danh sách trước khi thêm');return}
    c.el.cands[POSITIONS[i]].push({n:v,v:0});render();toast('Đã thêm ứng viên '+v);
  }
  else if(act==='submitEl'){
    var keys=Object.keys(S.pick);
    if(!keys.length){toast('Chọn ít nhất một ứng viên trước khi gửi');return}
    keys.forEach(function(q){var r=POSITIONS[+q],nm2=S.pick[q];(c.el.cands[r]||[]).forEach(function(x){if(x.n===nm2)x.v++})});
    c.el.voted=Math.min(c.students.length,c.el.voted+1);c.el.me=true;S.pick={};render();toast('Đã gửi phiếu bầu');
  }
  else if(act==='finStart'){S.fin=true;render()}
  else if(act==='finCancel'){S.fin=false;render()}
  else if(act==='finOk')finalizeEl(c);
  else if(act==='reopen'){
    var dl=new Date(2026,9,22);
    c.el={status:'open',deadline:fmtD(dl),voted:0,me:false,cands:{},sum:null};
    POSITIONS.forEach(function(r){var w=holder(c,r);c.el.cands[r]=w?[{n:w,v:0}]:[]});
    S.pick={};S.fin=false;render();toast('Đã mở đợt bầu mới');
  }
  else if(act==='pvote'){
    var pl=c.polls.filter(function(x){return x.id===a.dataset.id})[0],ch=S.ppick[pl.id];
    if(ch==null){toast('Chọn một lựa chọn trước khi bỏ phiếu');return}
    pl.opts[ch].v++;pl.my=ch;render();toast('Đã bỏ phiếu');
  }
  else if(act==='pclose'){var pl2=c.polls.filter(function(x){return x.id===a.dataset.id})[0];pl2.closed=true;render();toast('Đã đóng bỏ phiếu')}
  else if(act==='popAdd'){readPoll();if(S.popts.length<8)S.popts.push('');render();var li=$('po'+(S.popts.length-1));if(li)li.focus()}
  else if(act==='popDel'){readPoll();S.popts.splice(i,1);render()}
});

document.addEventListener('change',function(e){
  var t=e.target;
  if(t.dataset.act==='pick'){S.pick[t.dataset.p]=t.value}
  else if(t.dataset.act==='ppick'){S.ppick[t.dataset.id]=+t.value}
});

document.addEventListener('submit',function(e){
  if(e.target.id!=='pollForm')return;
  e.preventDefault();var c=cur();
    readPoll();
    var t=S.pt.trim(),opts=S.popts.map(function(x){return x.trim()}).filter(Boolean),uniq=opts.filter(function(x,k){return opts.indexOf(x)===k}),er=$('pe'),m='';
    if(!t)m='Nhập câu hỏi cho cuộc bỏ phiếu.';else if(uniq.length<2)m='Cần ít nhất hai lựa chọn khác nhau.';else if(uniq.length!==opts.length)m='Có hai lựa chọn trùng nhau, hãy sửa lại.';
    if(m){S.perr=m;er.textContent=m;er.hidden=false;return}
    S.perr='';
    c.polls.unshift({id:'p'+Date.now(),t:t,desc:S.pdsc.trim(),opts:opts.map(function(x){return{t:x,v:0}}),my:null,end:fmtD(new Date(2026,9,15+(+S.pdays))),closed:false,by:S.name});
    notifs.unshift({id:Date.now(),i:'vote',t:'Bỏ phiếu mới: '+t,time:'Vừa xong',pg:'vote',un:true});
    S.pt='';S.pdsc='';S.popts=['',''];S.pdays='3';S.vtab='polls';render();toast('Đã đăng bỏ phiếu');
});
