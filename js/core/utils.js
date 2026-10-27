'use strict';
/* Hàm tiện ích: chọn phần tử, escape HTML, tên người, ngày tháng */
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pd(n){return n<10?'0'+n:''+n}
function noDia(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D')}
function initials(n){var w=n.trim().split(/\s+/);return((w[0]||'?')[0]+(w.length>1?w[w.length-1][0]:'')).toUpperCase()}
function short(n){var w=n.split(' ');return w[w.length-1]}
function last2(n){var w=n.trim().split(/\s+/);return w.slice(-2).join(' ')}   /* 2 từ cuối của họ tên, để phân biệt người trùng tên */
function dt(w,o){return new Date(2026,9,12+(w-CUR)*7+o)}
function ds(w,o){var d=dt(w,o);return pd(d.getDate())+'/'+pd(d.getMonth()+1)}
function fmtD(d){return pd(d.getDate())+'/'+pd(d.getMonth()+1)}
