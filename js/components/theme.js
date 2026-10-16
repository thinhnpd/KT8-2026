'use strict';
/* Màu chủ đạo theo logo lớp và công tắc sáng/tối */
function applyAccent(){document.documentElement.style.setProperty('--acc',cur().color)}
function isDark(){var t=document.documentElement.getAttribute('data-theme');return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches}
function syncTg(){var d=isDark();$('tg').classList.toggle('dk',d);$('tg').setAttribute('aria-pressed',String(d))}
$('tg').onclick=function(){document.documentElement.setAttribute('data-theme',isDark()?'light':'dark');syncTg()};
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTg)}catch(e){}
