'use strict';
/* Thông báo nhanh */
var toastT;
function toast(m){var t=$('toast');t.textContent=m;t.classList.add('on');clearTimeout(toastT);toastT=setTimeout(function(){t.classList.remove('on')},2600)}
