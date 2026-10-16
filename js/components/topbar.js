'use strict';
/* Thanh trên: breadcrumb, nút chuông, cài đặt, avatar, hộp xổ xuống */
function renderTop(){
  $('crumb').innerHTML='S Class / <b>'+TITLES[S.page]+'</b>';
  var un=notifs.filter(function(n){return n.un}).length;
  $('bellBtn').innerHTML=ic('bell',20)+(un?'<span class="badge">'+(un>9?'9+':un)+'</span>':'');
  $('bellBtn').setAttribute('aria-label','Thông báo'+(un?', '+un+' chưa đọc':''));
  $('gearBtn').innerHTML=ic('settings',20);
  $('gearBtn').classList.toggle('on',S.page==='settings');
  $('avBtn').textContent=initials(S.name);
}
function closeDd(){['bellDd','avDd'].forEach(function(i){$(i).hidden=true});$('bellBtn').setAttribute('aria-expanded','false');$('avBtn').setAttribute('aria-expanded','false')}
function toggleDd(which){
  var id=which==='bell'?'bellDd':'avDd',was=!$(id).hidden;closeDd();
  if(was)return;
  if(which==='bell')renderBell();else renderAcc();
  $(id).hidden=false;$(which==='bell'?'bellBtn':'avBtn').setAttribute('aria-expanded','true');
}

$('bellBtn').onclick=function(){toggleDd('bell')};
$('avBtn').onclick=function(){toggleDd('av')};
$('gearBtn').onclick=function(){go('settings')};
