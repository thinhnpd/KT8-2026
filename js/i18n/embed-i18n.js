/* Dịch trang được nhúng (iframe) theo ngôn ngữ của trang chủ.
   - Đọc ngôn ngữ từ nút VI/EN của index.html (#langTg) và tự cập nhật khi người dùng đổi.
   - Dịch chữ trong trang và các thuộc tính placeholder, aria-label, title, alt.
   - Không cần sửa mã của trò chơi: các câu ghép số/tên được dịch bằng "rules" (biểu thức chính quy).
   - Chữ do người dùng nhập (tên ô, tên ứng viên) nằm trong class .nm hoặc [data-no-i18n] sẽ không bị dịch.
   Dùng chung cho mọi trang nhúng: nạp file này, rồi nạp file từ điển (en-embed.js). */
(function () {
  'use strict';
  var D = {}, lang = 'vi', started = false, obs = null, rec = new WeakMap(), title0 = document.title;
  var SKIP = 'script,style,textarea,[data-no-i18n],.nm';
  var ATTR = ['placeholder', 'aria-label', 'title', 'alt'];

  function add(l, d) {
    var x = D[l] || (D[l] = { exact: {}, rules: [] });
    Object.assign(x.exact, d.exact || {});
    (d.rules || []).forEach(function (r) { x.rules.push(r); });
  }

  /* Dịch một chuỗi (giữ khoảng trắng đầu/cuối) */
  function tr(s) {
    var m = D[lang]; if (!m) return s;
    var k = s.trim(); if (!k) return s;
    var a = s.indexOf(k), pre = s.slice(0, a), post = s.slice(a + k.length), out = null;
    if (Object.prototype.hasOwnProperty.call(m.exact, k)) out = m.exact[k];
    else for (var i = 0; i < m.rules.length; i++) {
      if (m.rules[i][0].test(k)) { out = k.replace(m.rules[i][0], m.rules[i][1]); break; }
    }
    return out === null ? s : pre + out + post;
  }

  function skipped(n) {
    var e = n.nodeType === 1 ? n : n.parentElement;
    return !e || !!e.closest(SKIP);
  }

  function doText(n) {
    if (skipped(n)) return;
    var r = rec.get(n), cur = n.nodeValue;
    if (!r || cur !== r.t) { r = { o: cur, t: cur }; rec.set(n, r); }   // chữ mới do trang tự ghi = bản gốc mới
    var t = lang === 'vi' ? r.o : tr(r.o);
    if (t !== cur) n.nodeValue = t;
    r.t = t;
  }

  function doAttr(e, a) {
    if (!e.hasAttribute(a) || e.closest(SKIP)) return;
    var st = e.__i18n || (e.__i18n = {}), r = st[a], cur = e.getAttribute(a);
    if (!r || cur !== r.t) { r = { o: cur, t: cur }; st[a] = r; }
    var t = lang === 'vi' ? r.o : tr(r.o);
    if (t !== cur) e.setAttribute(a, t);
    r.t = t;
  }

  function tree(root) {
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) doText(n);
    var els = [root].concat([].slice.call(root.querySelectorAll('[placeholder],[aria-label],[title],[alt]')));
    els.forEach(function (e) { ATTR.forEach(function (a) { doAttr(e, a); }); });
  }

  function watch() {
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
  }
  function onMut(list) {
    if (lang === 'vi') return;                  // tiếng Việt là bản gốc, không cần xử lý
    obs.disconnect();                           // tránh vòng lặp vì chính ta cũng sửa DOM
    list.forEach(function (m) {
      if (m.type === 'characterData') doText(m.target);
      else if (m.type === 'attributes') doAttr(m.target, m.attributeName);
      else m.addedNodes.forEach(tree);
    });
    watch();
  }

  function setLang(l) {
    if (started && l === lang) return;
    lang = l; started = true;
    document.documentElement.lang = l;
    document.title = lang === 'vi' ? title0 : tr(title0);
    if (obs) obs.disconnect(); else obs = new MutationObserver(onMut);
    tree(document.body);
    watch();
  }

  /* Ngôn ngữ hiện tại của trang chủ (chỉ đọc được khi cùng một website, qua http/https) */
  function detect() {
    try {
      var pd = window.parent.document, b = pd.querySelector('#langTg [aria-pressed="true"]');
      if (b && b.dataset.lang) return b.dataset.lang;
      var l = pd.documentElement.lang; if (l) return l.slice(0, 2);
    } catch (e) {}
    return 'vi';
  }
  function follow() {
    try {
      var p = window.parent; if (p === window) return;
      var pd = p.document, f = function () { setLang(detect()); };
      new p.MutationObserver(f).observe(pd.documentElement, { attributes: true, attributeFilter: ['lang'] });
      var tg = pd.getElementById('langTg');
      if (tg) new p.MutationObserver(f).observe(tg, { attributes: true, subtree: true, attributeFilter: ['aria-pressed', 'class'] });
    } catch (e) {}
  }

  function init() { setLang(detect()); follow(); }
  window.EmbedI18n = { add: add, tr: tr, setLang: setLang };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
