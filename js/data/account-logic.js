'use strict';
/* Tạo tài khoản học sinh hàng loạt: phần thuần logic (không gọi mạng, dễ kiểm thử). */
var AccountLogic = (function () {
  /* "Nguyễn Văn Ánh" -> ["nguyen","van","anh"] (bỏ dấu, đ -> d, chỉ giữ chữ và số) */
  function words(name) {
    return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  }
  /* Quy ước thường gặp ở Việt Nam: tên + chữ cái đầu của họ và tên đệm. "Nguyễn Văn Ánh" -> "anhnv". Phạm Khánh -> "khanhp". */
  function baseUsername(name) {
    var w = words(name);
    if (!w.length) return '';
    var given = w[w.length - 1], init = w.slice(0, -1).map(function (x) { return x[0]; }).join('');
    return (given + init).slice(0, 24);
  }
  /* Tên đăng nhập duy nhất trong tập `taken` (chữ thường), tối thiểu 3 ký tự. Thêm số nếu trùng hoặc quá ngắn. */
  function uniqueUsername(name, taken) {
    var b = baseUsername(name) || 'hs', u = b, n = 1;
    if (u.length < 3) { u = b + '01'.slice(0, 3 - b.length + 1); }
    while (taken[u]) { n++; u = b + n; }
    taken[u] = 1;
    return u;
  }
  var USER_RE = /^[a-z0-9._-]{3,30}$/;
  function validUsername(u) { return USER_RE.test(String(u)); }

  /* Mật khẩu ngẫu nhiên dễ đọc (bỏ ký tự dễ nhầm: 0 o 1 l i), luôn có cả chữ và số. rnd(n) trả về số nguyên ngẫu nhiên [0,n) */
  var ALPHA = 'abcdefghjkmnpqrstuvwxyz', DIGIT = '23456789', ALL = ALPHA + DIGIT;
  function webRnd(n) {
    var a = new Uint32Array(1), lim = Math.floor(4294967296 / n) * n;
    do { crypto.getRandomValues(a); } while (a[0] >= lim);   // tránh lệch phân phối
    return a[0] % n;
  }
  function genPassword(len, rnd) {
    rnd = rnd || webRnd; len = len || 8;
    var out = [];
    for (var i = 0; i < len; i++) out.push(ALL[rnd(ALL.length)]);
    if (!/[a-z]/.test(out.join(''))) out[rnd(len)] = ALPHA[rnd(ALPHA.length)];
    if (!/[2-9]/.test(out.join(''))) { var k = rnd(len); out[k] = DIGIT[rnd(DIGIT.length)]; if (!/[a-z]/.test(out.join(''))) out[(k + 1) % len] = ALPHA[rnd(ALPHA.length)]; }
    return out.join('');
  }

  /* Phân loại từng học sinh.
     students: [{id,name}], profiles: [{id,username,full_name,role,student_id}], adminNames: [tên giữ chức vụ admin trong ban cán sự]
     -> {todo:[{id,name}], hasAccount:[...], admins:[...]}  (admin và người đã có tài khoản không nằm trong todo) */
  function classify(students, profiles, adminNames) {
    var byStudent = {}, adminFull = {}, adminSet = {};
    profiles.forEach(function (p) {
      if (p.student_id) byStudent[p.student_id] = p;
      if (p.role === 'admin' && p.full_name) adminFull[p.full_name.trim().toLowerCase()] = 1;   // admin đăng ký riêng, chưa gắn với dòng học sinh
    });
    (adminNames || []).forEach(function (n) { adminSet[String(n).trim().toLowerCase()] = 1; });
    var out = { todo: [], hasAccount: [], admins: [] };
    students.forEach(function (s) {
      var p = byStudent[s.id], k = s.name.trim().toLowerCase();
      if ((p && p.role === 'admin') || adminFull[k] || adminSet[k]) out.admins.push(s);
      else if (p) out.hasAccount.push(s);
      else out.todo.push(s);
    });
    return out;
  }

  /* CSV mở được bằng Excel (có BOM, dấu ngoặc kép được thoát đúng) */
  function csv(rows) {
    var q = function (v) { v = String(v == null ? '' : v); return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return '\ufeff' + rows.map(function (r) { return r.map(q).join(','); }).join('\r\n') + '\r\n';
  }
  return { words: words, baseUsername: baseUsername, uniqueUsername: uniqueUsername, validUsername: validUsername, genPassword: genPassword, classify: classify, csv: csv };
})();
if (typeof module !== 'undefined') module.exports = AccountLogic;
