'use strict';
/* Lớp truy cập dữ liệu (Supabase). Đặt tại js/data/api.js, nạp SAU thư viện supabase-js và TRƯỚC các file khác.
   Trong index.html (trước mọi script của dự án):
     <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.0/dist/umd/supabase.js"></script>
     <script src="js/data/supabase-config.js"></script>   (điền URL và khóa anon của bạn)
     <script src="js/data/api.js"></script>
   Khóa "anon" công khai theo thiết kế; an toàn nhờ Row Level Security trong db/schema.sql.
   TUYỆT ĐỐI không đưa khóa "service_role" vào mã web hoặc lên GitHub. */
/* "Ghi nhớ đăng nhập": bật -> lưu phiên trong localStorage (nhớ lâu); tắt -> sessionStorage (mất khi đóng tab). */
var REMEMBER_KEY = 'sclass_remember';
function wantRemember() { try { return localStorage.getItem(REMEMBER_KEY) !== '0'; } catch (e) { return true; } }
var sessionStore = {
  getItem: function (k) { try { return localStorage.getItem(k) || sessionStorage.getItem(k); } catch (e) { return null; } },
  setItem: function (k, v) { try { var r = wantRemember(); (r ? localStorage : sessionStorage).setItem(k, v); (r ? sessionStorage : localStorage).removeItem(k); } catch (e) {} },
  removeItem: function (k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} }
};
var SB = supabase.createClient(SB_CONFIG.url, SB_CONFIG.key, { auth: { storage: sessionStore, persistSession: true, autoRefreshToken: true } });

var API = (function () {
  var EMAIL_DOMAIN = SB_CONFIG.emailDomain || '@sclass.app';   // cần TẮT "Confirm email" trong Authentication > Providers > Email
  function emailOf(u) { return String(u).trim().toLowerCase() + EMAIL_DOMAIN; }
  function ok(r) { if (r.error) throw r.error; return r.data; }

  /* ---------- Đăng nhập / đăng ký ---------- */
  async function signIn(username, password) {
    var r = await SB.auth.signInWithPassword({ email: emailOf(username), password: password });
    if (r.error) throw new Error(r.error.status === 400 || /invalid|credentials/i.test(r.error.message) ? 'invalid' : 'network');
    return r.data.session;
  }
  function setRemember(on) { try { localStorage.setItem(REMEMBER_KEY, on ? '1' : '0'); } catch (e) {} }
  async function signOut() { await SB.auth.signOut(); }
  async function session() { return (await SB.auth.getSession()).data.session; }
  async function me() {
    var s = await session(); if (!s) return null;
    return ok(await SB.from('profiles').select('*').eq('id', s.user.id).single());
  }

  /* Admin lớp: kiểm tra mã ở máy chủ -> tạo tài khoản -> gắn vào lớp */
  async function signUpAdmin(o) {   // {username, password, fullName, className, code}
    if (!ok(await SB.rpc('check_class_code', { p_class_name: o.className, p_code: o.code }))) throw new Error('bad_class_code');
    var r = await SB.auth.signUp({ email: emailOf(o.username), password: o.password });
    if (r.error) throw new Error(/registered|exists/i.test(r.error.message) ? 'taken' : r.error.message);
    var g = await SB.rpc('register_class_admin', { p_username: o.username, p_full_name: o.fullName || '', p_class_name: o.className, p_code: o.code });
    if (g.error) { await SB.auth.signOut(); throw new Error(/duplicate|unique/i.test(g.error.message) ? 'taken' : g.error.message); }
  }
  /* Học sinh: bước 1 lấy danh sách tên chưa có tài khoản, bước 2 đăng ký */
  async function freeStudents(className, joinCode) {
    return ok(await SB.rpc('list_class_students', { p_class_name: className, p_join_code: joinCode }));
  }
  async function signUpStudent(o) { // {username, password, className, joinCode, studentId}
    var r = await SB.auth.signUp({ email: emailOf(o.username), password: o.password });
    if (r.error) throw new Error(/registered|exists/i.test(r.error.message) ? 'taken' : r.error.message);
    var g = await SB.rpc('register_student', { p_username: o.username, p_class_name: o.className, p_join_code: o.joinCode, p_student_id: o.studentId });
    if (g.error) { await SB.auth.signOut(); throw new Error(g.error.message); }
  }

  /* ---------- Nạp dữ liệu lớp vào đối tượng C hiện có (giữ nguyên cấu trúc của seed.js) ---------- */
  var ids = { byName: {}, byId: {} };   // học sinh trong ứng dụng được định danh bằng TÊN; bảng này đổi qua lại tên <-> id
  async function loadClass() {
    var p = await me();
    var cls = ok(await SB.from('classes').select('*').eq('id', p.class_id).single());
    var st = ok(await SB.from('students').select('id, full_name, subject, talent, student_contacts(email, phone)').eq('class_id', p.class_id).order('full_name'));
    var tc = ok(await SB.from('teachers').select('*').eq('class_id', p.class_id));
    var cm = ok(await SB.from('committee').select('position, student_id').eq('class_id', p.class_id));
    ids = { byName: {}, byId: {} };
    C.name = 'Lớp ' + cls.name; C.school = cls.school; C.color = cls.color; C.logo = cls.logo_url;
    C.students = st.map(function (s) { ids.byName[s.full_name] = s.id; ids.byId[s.id] = s.full_name; return s.full_name; });
    C.info = {};
    st.forEach(function (s) { var k = s.student_contacts || {}; C.info[s.full_name] = { email: k.email || '', phone: k.phone || '', subj: s.subject, talent: s.talent }; });
    C.teachers = tc.map(function (t) { return { n: t.name, s: t.subject, email: t.email, phone: t.phone, gv: t.is_homeroom }; });
    C.committee = cm.map(function (m) { return { r: m.position, w: ids.byId[m.student_id] || '' }; });
    S.name = p.full_name; S.role = p.role;
    if (typeof syncDerived === 'function') syncDerived(C);   // làm khớp sơ đồ lớp, ứng viên... với danh sách học sinh mới
    return p;
  }
  var idOf = function (name) { return ids.byName[name]; };
  var nameOf = function (id) { return ids.byId[id]; };

  /* ---------- Thông báo (cập nhật tức thời) ---------- */
  function ago(iso) {
    var m = Math.round((Date.now() - new Date(iso)) / 60000);
    return m < 1 ? 'Vừa xong' : m < 60 ? m + ' phút trước' : m < 1440 ? Math.round(m / 60) + ' giờ trước' : Math.round(m / 1440) + ' ngày trước';
  }
  function toNotif(n, readSet) { return { id: n.id, i: n.icon, t: n.text, time: ago(n.created_at), pg: n.page, un: !readSet[n.id] }; }
  async function loadNotifs() {
    var s = await session();
    var list = ok(await SB.from('notifications').select('*').order('created_at', { ascending: false }).limit(50));
    var rd = ok(await SB.from('notification_reads').select('notification_id').eq('profile_id', s.user.id));
    var set = {}; rd.forEach(function (r) { set[r.notification_id] = 1; });
    return list.map(function (n) { return toNotif(n, set); });
  }
  function onNotif(cb) {   // cb(thông báo mới)
    return SB.channel('notifs').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' },
      function (e) { cb(toNotif(e.new, {})); }).subscribe();
  }
  async function markRead(idList) {
    var s = await session();
    ok(await SB.from('notification_reads').upsert(idList.map(function (id) { return { notification_id: id, profile_id: s.user.id }; })));
  }
  async function notify(text, page, icon) {   // chỉ admin
    var p = await me();
    ok(await SB.from('notifications').insert({ class_id: p.class_id, text: text, page: page || 'event', icon: icon || 'calendar-event', created_by: p.id }));
  }

  /* ---------- Nhóm học tập (mỗi môn một bộ) ---------- */
  async function saveGroups(subject, method, groups) {   // groups: [{no, color, members:[tên học sinh]}]
    var payload = groups.map(function (g) { return { no: g.no, color: g.color, members: g.members.map(idOf).filter(Boolean) }; });
    return ok(await SB.rpc('save_group_set', { p_subject: subject, p_method: method, p_groups: payload }));
  }
  async function loadGroups() {   // -> {Toán:{method,created,groups:[{no,color,members:[tên]}]}, ...}
    var rows = ok(await SB.from('group_sets').select('subject, method, created_at, study_groups(group_no, color, study_group_members(student_id))').eq('is_current', true));
    var out = {};
    rows.forEach(function (r) {
      out[r.subject] = { method: r.method, created: r.created_at, groups: r.study_groups.sort(function (a, b) { return a.group_no - b.group_no; })
        .map(function (g) { return { no: g.group_no, color: g.color, members: g.study_group_members.map(function (m) { return nameOf(m.student_id); }) }; }) };
    });
    return out;
  }

  /* ---------- Bầu cử và phiếu bầu ---------- */
  async function createElection(title, rounds, advance) {
    var p = await me();
    return ok(await SB.from('elections').insert({ class_id: p.class_id, title: title, rounds: rounds, advance: advance }).select().single());
  }
  async function openRound(electionId, no, kind, need, names) {
    return ok(await SB.rpc('open_round', { p_election: electionId, p_round_no: no, p_kind: kind, p_need: need, p_candidates: names.map(idOf) }));
  }
  async function openRounds() {   // các vòng đang mở mà học sinh có thể bỏ phiếu, kèm ứng viên
    var rows = ok(await SB.from('rounds').select('id, round_no, kind, need, elections(title), round_candidates(student_id)').eq('status', 'open'));
    return rows.map(function (r) { return { id: r.id, no: r.round_no, kind: r.kind, need: r.need, title: r.elections.title,
      candidates: r.round_candidates.map(function (c) { return { id: c.student_id, name: nameOf(c.student_id) }; }) }; });
  }
  async function castBallot(roundId, candidateId) {
    var r = await SB.rpc('cast_ballot', { p_round: roundId, p_candidate: candidateId });
    if (r.error) throw new Error(/ballot_receipts_pkey|duplicate/i.test(r.error.message) ? 'already_voted' : r.error.message);
  }
  async function progress(roundId) { return ok(await SB.rpc('round_progress', { p_round: roundId })); }
  async function closeRound(roundId) {   // -> [{name, votes}] đã sắp xếp; sau đó ứng dụng áp dụng luật đồng điểm như hiện nay
    var rows = ok(await SB.rpc('close_round', { p_round: roundId }));
    return rows.map(function (r) { return { id: r.student_id, name: nameOf(r.student_id), votes: r.votes }; });
  }
  async function saveOutcomes(roundId, outcomes) {   // outcomes: [{id, outcome:'advance'|'out'|'tied'|'winner'}]
    for (var i = 0; i < outcomes.length; i++)
      ok(await SB.from('round_candidates').update({ outcome: outcomes[i].outcome }).eq('round_id', roundId).eq('student_id', outcomes[i].id));
  }
  function onRounds(cb) {   // học sinh nhận biết khi có vòng mới mở / đóng
    return SB.channel('rounds').on('postgres_changes', { event: '*', schema: 'public', table: 'rounds' }, cb).subscribe();
  }

  return { setRemember: setRemember, signIn: signIn, signOut: signOut, session: session, me: me, signUpAdmin: signUpAdmin, freeStudents: freeStudents, signUpStudent: signUpStudent,
    loadClass: loadClass, idOf: idOf, nameOf: nameOf, loadNotifs: loadNotifs, onNotif: onNotif, markRead: markRead, notify: notify,
    saveGroups: saveGroups, loadGroups: loadGroups, createElection: createElection, openRound: openRound, openRounds: openRounds,
    castBallot: castBallot, progress: progress, closeRound: closeRound, saveOutcomes: saveOutcomes, onRounds: onRounds };
})();
