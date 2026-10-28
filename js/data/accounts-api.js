'use strict';
/* Tạo tài khoản học sinh hàng loạt. Nạp SAU api.js và account-logic.js (dùng SB, SB_CONFIG, AccountLogic).
   Cách làm, không cần khóa service_role:
   1) Một kết nối Supabase PHỤ (không lưu phiên) gọi signUp cho từng học sinh, nên phiên đăng nhập của admin không bị đổi.
   2) Kết nối CHÍNH của admin gọi admin_link_student (sql/update-7.sql) để gắn tài khoản vừa tạo vào đúng học sinh với vai trò "student".
   Mật khẩu chỉ nằm trong bộ nhớ trình duyệt của admin cho tới khi tải file CSV. */
var AccountsAPI = (function () {
  var tmp = null;
  function tmpClient() {
    if (!tmp) tmp = supabase.createClient(SB_CONFIG.url, SB_CONFIG.key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'sclass-bulk-tmp' } });
    return tmp;
  }
  function emailOf(u) { return String(u).trim().toLowerCase() + ((typeof SB_CONFIG !== 'undefined' && SB_CONFIG.emailDomain) || '@sclass.app'); }
  function fail(code, detail) { var e = new Error(code); e.detail = detail || ''; return e; }
  function signUpCode(e) {
    var m = (e && e.message) || String(e);
    if (/registered|already|exists/i.test(m)) return 'taken';
    if (/rate limit|too many|over_.*rate|429/i.test(m) || (e && e.status === 429)) return 'rate';
    if (/password/i.test(m) && /weak|short|least|characters/i.test(m)) return 'weak_password';
    if (/disabled|not allowed/i.test(m)) return 'signup_disabled';
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return 'network';
    return 'unknown';
  }

  /* Tài khoản hiện có của lớp (RLS: chỉ thấy cùng lớp) */
  async function profiles() {
    var r = await SB.from('profiles').select('id, username, full_name, role, student_id');
    if (r.error) throw r.error;
    return r.data;
  }

  /* Tạo một tài khoản. item = {studentId, username, password}. Ném lỗi có .message = mã:
     taken | rate | weak_password | signup_disabled | network | link_failed (tài khoản đã tạo nhưng chưa gắn được: item.orphan = true) | unknown */
  async function createOne(item) {
    var c = tmpClient(), r;
    try { r = await c.auth.signUp({ email: emailOf(item.username), password: item.password }); }
    catch (e) { throw fail(signUpCode(e), e.message); }
    if (r.error) throw fail(signUpCode(r.error), r.error.message);
    /* Nếu bật "Confirm email", email đã tồn tại sẽ trả về người dùng giả không có identities */
    if (!r.data.user || (r.data.user.identities && r.data.user.identities.length === 0)) throw fail('taken', 'email đã tồn tại');
    var g = await SB.rpc('admin_link_student', { p_uid: r.data.user.id, p_username: item.username, p_student_id: item.studentId });
    try { await c.auth.signOut(); } catch (e) {}
    if (g.error) { item.orphan = true; throw fail('link_failed', g.error.message); }
  }

  var sleep = function (ms) { return new Promise(function (res) { setTimeout(res, ms); }); };

  /* Chạy tuần tự (Supabase giới hạn số lần đăng ký theo thời gian, nên gặp giới hạn thì chờ rồi thử lại).
     items: [{studentId, name, username, password, status:'wait'}]; hooks: {update(item), wait(seconds|0), cancelled()} */
  async function run(items, hooks) {
    var taken = {}; items.forEach(function (i) { taken[i.username] = 1; });
    for (var k = 0; k < items.length; k++) {
      var it = items[k];
      if (hooks.cancelled()) { it.status = 'skipped'; hooks.update(it); continue; }
      it.status = 'busy'; hooks.update(it);
      var tries = 0, waits = 0;
      while (true) {
        try { await createOne(it); it.status = 'ok'; break; }
        catch (e) {
          if (e.message === 'taken' && tries < 5) {   // tên đăng nhập đã có ở lớp khác: thử tên có số đuôi
            tries++; var base = it.username.replace(/\d+$/, ''); var n = tries + 1, u = base + n;
            while (taken[u]) { n++; u = base + n; }
            taken[u] = 1; it.username = u; hooks.update(it); continue;
          }
          if (e.message === 'rate' && waits < 12 && !hooks.cancelled()) {
            waits++;
            for (var s = 20; s > 0 && !hooks.cancelled(); s--) { hooks.wait(s); await sleep(1000); }
            hooks.wait(0); continue;
          }
          it.status = 'error'; it.error = e.message; it.detail = e.detail; break;
        }
      }
      hooks.update(it);
    }
  }
  return { profiles: profiles, createOne: createOne, run: run };
})();
