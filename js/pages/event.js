'use strict';
/* Trang Event: bản tin tuần, trực nhật, thêm thông tin, tìm kiếm, tooltip */
/* Event */
function rowsHTML(){
  var c=cur(),d=wkData(c,S.week),q=S.q;
  var rows=d.ev.map(function(e,i){return{e:e,i:i}}).sort(function(a,b){return a.e.d-b.e.d||a.i-b.i}).filter(function(x){return !q||(x.e.t+x.e.c+(x.e.det||'')).toLowerCase().indexOf(q)>-1});
  if(!rows.length)return '<tr><td class="rn">1</td><td colspan="5" class="mu">Không có lịch trình.</td></tr>';
  return rows.map(function(x,k){var e=x.e;return '<tr data-i="'+x.i+'"><td class="rn">'+(k+1)+'</td><td>'+DAYS[e.d]+'</td><td>'+ds(S.week,e.d)+'</td><td>'+esc(e.t)+'</td><td><span class="tag t-'+CL[e.c]+'">'+e.c+'</span></td><td>'+(e.f?'<span class="file">'+ic('paperclip',13)+esc(e.f)+'</span>':'<span class="mu">-</span>')+'</td></tr>'}).join('');
}
function dutyHTML(c,wk){
  var tasks=['Quét lớp','Tưới cây'],n=c.students.length,t0=wk===CUR?3:-1,sh=(wk-CUR)*8;
  if(!n)return '';
  var cols=[0,1,2,3,4].map(function(d){
    return '<div class="dday'+(d===t0?' today':'')+'"><b>'+DAYS[d]+' '+ds(wk,d)+(d===t0?' · Hôm nay':'')+'</b>'+tasks.map(function(t,r){
      var i=(((r*5+d)*2+sh)%n+n)%n,a=c.students[i],b=c.students[(i+1)%n];
      return '<div><span class="mu">'+t+'</span><br>'+esc(short(a))+', '+esc(short(b))+'</div>'}).join('')+'</div>'}).join('');
  return '<div class="bx" style="margin-bottom:10px"><h5>'+ic('clipboard-check',13)+'Trực nhật trong tuần</h5><div class="scroll"><div class="dutyg">'+cols+'</div></div></div>';
}
function vEvent(){
  var c=cur(),wk=S.week,d=wkData(c,wk),ro=wk<CUR,r=rd(c,wk),n=c.students.length;r.n=Math.min(r.n,n);
  var empty=!d.pins.length&&!d.rem.length&&!d.ev.length,un=n-r.n;
  var h=head('Bản tin tuần',esc(c.name)+' · '+esc(c.school));
  h+='<div class="bar"><button class="sq" data-act="wk" data-d="-1" aria-label="Tuần trước">'+ic('chevron-left',16)+'</button><div class="wk">Tuần '+wk+' ('+ds(wk,0)+' - '+ds(wk,6)+'/'+dt(wk,6).getFullYear()+')</div><button class="sq" data-act="wk" data-d="1" aria-label="Tuần sau">'+ic('chevron-right',16)+'</button>'+
    (!ro&&admin()?'<button class="btn" data-act="addEv">'+ic('plus',15)+'Thêm thông tin</button>':'')+
    '<span class="grow"></span><label class="srch" style="margin:0">'+ic('search',15)+'<input id="q" type="text" placeholder="Tìm kiếm" aria-label="Tìm kiếm" value="'+esc(S.q)+'"></label>'+
    '<div class="chipw"><button class="chip" data-act="pop" aria-haspopup="true">'+ic('eye',15)+'Đã đọc: '+r.n+'/'+n+'</button><div class="pop" id="pop" hidden><b style="font-weight:500">Chưa đọc ('+un+')</b><br>'+(un?c.students.slice(-Math.min(un,8)).map(esc).join('<br>')+(un>8?'<br>…':''):'Cả lớp đã đọc.')+'</div></div></div>';
  if(ro)h+='<div class="banner">'+ic('lock',16)+'<span>Tuần đã qua, chỉ xem, không chỉnh sửa được.</span></div>';
  if(empty){h+='<div class="empty" style="margin-bottom:10px">'+ic('calendar-plus',34)+'<p>'+(ro?'Tuần này không có thông báo nào.':'Chưa có thông báo cho tuần này.'+(admin()?' Bấm Thêm thông tin để lên lịch trước.':''))+'</p></div>'+dutyHTML(c,wk);return h}
  h+='<div class="row2"><div class="bx"><h5>'+ic('pin',13)+'Tin ghim quan trọng</h5>'+(d.pins.length?d.pins.map(function(p){return '<p><span class="tag t-r">'+esc(p.tag||'Quan trọng')+'</span> <b style="font-weight:500">'+esc(p.t)+'</b>'+(p.det?'<br><span class="mu">'+esc(p.det)+'</span>':'')+(p.f?' <span class="file">'+ic('paperclip',13)+esc(p.f)+'</span>':'')+'</p>'}).join(''):'<p class="mu">Không có tin ghim.</p>')+'</div>'+
    '<div class="bx"><h5>Nhắc nhở và việc cần làm</h5>'+(d.rem.length?d.rem.map(function(x){return '<p>• '+esc(x)+'</p>'}).join(''):'<p class="mu">Không có nhắc nhở.</p>')+'</div></div>';
  h+=dutyHTML(c,wk);
  h+='<div class="scroll"><table style="min-width:560px"><thead><tr><th></th><th>Thứ</th><th>Ngày</th><th>Nội dung</th><th>Loại</th><th>Đính kèm</th></tr></thead><tbody id="tb">'+rowsHTML()+'</tbody></table></div>';
  h+='<div class="ft"><span class="note">'+(ro?'Chế độ chỉ đọc.':r.me?'Mỗi tài khoản bấm một lần. Nút mở lại khi tin được cập nhật.':'Bấm để xác nhận bạn đã đọc bản tin này.')+'</span>'+(ro?'':'<button class="btn'+(r.me?' done':'')+'" data-act="read" aria-disabled="'+r.me+'">'+ic('check',15)+(r.me?'Bạn đã đọc':'Đã đọc')+'</button>')+'</div>';
  return h;
}

function addEv(){
  var wo='';for(var w=CUR;w<=CUR+3;w++)wo+='<option value="'+w+'"'+(w===Math.max(S.week,CUR)?' selected':'')+'>Tuần '+w+' ('+ds(w,0)+' - '+ds(w,6)+')</option>';
  var dayo=DAYS.map(function(n,i){return '<option value="'+i+'">'+n+'</option>'}).join('');
  openModal('Thêm thông tin','<div class="g2"><div><label for="mw">Tuần áp dụng</label><select id="mw">'+wo+'</select></div><div><label for="mc">Phân loại tin</label><select id="mc"><option value="ev">Lịch trình trong tuần</option><option value="pin">Tin ghim quan trọng</option><option value="rem">Nhắc nhở chung</option></select></div></div>'+
    '<div class="g2" id="evx"><div><label for="md">Ngày</label><select id="md">'+dayo+'</select></div><div><label for="mt">Loại sự kiện</label><select id="mt"><option>Sinh hoạt</option><option>Bài tập</option><option>Kiểm tra</option><option>Sự kiện</option></select></div></div>'+
    '<label for="ml">Tiêu đề</label><input type="text" id="ml" placeholder="Kiểm tra 15 phút môn Sinh học"><div class="err" id="me" hidden>Nhập tiêu đề trước khi đăng.</div>'+
    '<label for="mx">Chi tiết</label><textarea id="mx" placeholder="Phạm vi, địa điểm, lưu ý"></textarea>'+
    '<label for="mf">Đính kèm (ảnh, PDF)</label><input type="file" id="mf">','Đăng tin',function(){
      var t=$('ml').value.trim();if(!t){$('me').hidden=false;$('ml').focus();return false}
      var w=+$('mw').value,k=$('mc').value,f=$('mf').files[0]?$('mf').files[0].name:'',d=wkData(cur(),w),det=$('mx').value.trim();
      if(k==='ev')d.ev.push({d:+$('md').value,t:t,c:$('mt').value,det:det,f:f});
      else if(k==='pin')d.pins.push({tag:'Quan trọng',t:t,det:det,f:f});
      else d.rem.push(t);
      cur().reads[w]={n:0,me:false};S.week=w;render();toast('Đã đăng tin, trạng thái đã đọc được đặt lại');
    });
  $('mc').onchange=function(){$('evx').hidden=this.value!=='ev'};
}

document.addEventListener('click',function(e){
  var a=e.target.closest('[data-act]');if(!a)return;
  var act=a.dataset.act,c=cur();
  if(act==='wk'){S.week+=+a.dataset.d;render()}
  else if(act==='read'){var r=rd(c,S.week);if(!r.me){r.me=true;r.n=Math.min(c.students.length,r.n+1);render()}}
  else if(act==='pop'){var p=$('pop');p.hidden=!p.hidden}
  else if(act==='addEv')addEv();
});

document.addEventListener('input',function(e){
  if(e.target.id==='q'){S.q=e.target.value.trim().toLowerCase();$('tb').innerHTML=rowsHTML()}
});

/* Tooltip dòng lịch trình */
document.addEventListener('mousemove',function(e){
  var tip=$('tip'),tr=e.target.closest&&e.target.closest('#tb tr[data-i]');
  if(!tr){tip.hidden=true;return}
  var ev=wkData(cur(),S.week).ev[+tr.dataset.i];if(!ev){tip.hidden=true;return}
  tip.innerHTML='<b>'+esc(ev.t)+'</b><br>'+DAYS[ev.d]+', '+ds(S.week,ev.d)+'<br>'+esc(ev.det||'Chưa có mô tả.')+(ev.f?'<br><span class="file">'+ic('paperclip',13)+esc(ev.f)+'</span>':'');
  tip.hidden=false;var x=e.clientX+14,y=e.clientY+14;if(x+250>innerWidth)x=innerWidth-254;if(y+tip.offsetHeight>innerHeight)y=e.clientY-tip.offsetHeight-8;
  tip.style.left=Math.max(4,x)+'px';tip.style.top=y+'px';
});
