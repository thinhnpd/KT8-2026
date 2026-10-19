/* Kho tài khoản tạm thời trong trình duyệt (dự án chưa có cơ sở dữ liệu).
   - Tài khoản đăng ký chỉ tồn tại trong trình duyệt/máy đã đăng ký (localStorage).
   - Khi có máy chủ, thay các hàm bên dưới bằng lời gọi tới máy chủ. */
var AuthStore = (function () {
  'use strict';
  var KEY = 'sclass_accounts';

  /* Danh sách lớp và mã lớp hợp lệ. THAY bằng dữ liệu thật của trường.
     Lưu ý: ai mở được file này đều đọc được danh sách, nên đây chưa phải bảo mật thật. */
  var CLASS_CODES = [
    { name: '10A5', code: 'LQD-10A5-2026' }
  ];
  var RESERVED = ['user123'];   // tài khoản mặc định, không cho đăng ký trùng

  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { localStorage.setItem(KEY, JSON.stringify(list)); }   // có thể ném lỗi nếu bị chặn
  function norm(s) { return String(s).trim().toLowerCase().replace(/\s+/g, ''); }

  /* Băm mật khẩu (SHA-256) để không lưu chữ thường. Chỉ dùng được trên https hoặc localhost. */
  async function hash(s) {
    try {
      if (window.crypto && crypto.subtle) {
        var b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('sclass|' + s));
        return 'h:' + Array.from(new Uint8Array(b)).map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
      }
    } catch (e) {}
    return 'p:' + s;
  }

  function isTaken(user) {
    var u = user.toLowerCase();
    return RESERVED.indexOf(u) >= 0 || load().some(function (a) { return a.user.toLowerCase() === u; });
  }
  function checkClass(name, code) {
    var n = norm(name), c = norm(code);
    return CLASS_CODES.some(function (x) { return norm(x.name) === n && norm(x.code) === c; });
  }
  async function add(user, pass, cls) {
    var list = load();
    list.push({ user: user, pass: await hash(pass), cls: cls.trim() });
    save(list);
  }
  async function verify(user, pass) {
    var h = await hash(pass), u = user.toLowerCase();
    return load().find(function (a) { return a.user.toLowerCase() === u && (a.pass === h || a.pass === 'p:' + pass); }) || null;
  }
  return { isTaken: isTaken, checkClass: checkClass, add: add, verify: verify };
})();
