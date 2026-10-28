'use strict';
/* Bỏ phiếu trực tuyến. Nạp SAU supabase-js, supabase-config.js, api.js (dùng SB và API từ api.js).
   Không phụ thuộc đối tượng C/S của trang chủ nên chạy được trong trang học sinh và trong iframe của admin.
   Phiếu kín: trình duyệt không đọc được phiếu của ai; số phiếu chỉ có sau khi admin đóng vòng (close_round, đếm ở máy chủ). */
var VoteAPI = (function () {
  function ok(r) { if (r.error) throw r.error; return r.data; }

  async function me() {
    var s = await API.session(); if (!s) return null;
    var p = await API.me();
    var c = ok(await SB.from('classes').select('name, color').eq('id', p.class_id).single());
    return { id: p.id, role: p.role, name: p.full_name || p.username, classId: p.class_id, className: c.name, color: c.color };
  }
  async function students() {   // [{id, name}] cả lớp
    return ok(await SB.from('students').select('id, full_name').order('full_name')).map(function (s) { return { id: s.id, name: s.full_name }; });
  }
  /* Cuộc bầu đang mở (nếu có) cùng vòng đang mở. -> null | {election:{id,title,state}, round:{id,no,kind,need,candidates:[{id,name}]} | null} */
  async function current() {
    var e = ok(await SB.from('elections').select('id, title, rounds, state').eq('status', 'open').order('created_at', { ascending: false }).limit(1));
    if (!e.length) return null;
    var rs = ok(await SB.from('rounds').select('id, round_no, kind, need, round_candidates(student_id, students(full_name))')
      .eq('election_id', e[0].id).eq('status', 'open').order('opened_at', { ascending: false }).limit(1));
    var r = rs[0];
    return { election: e[0], round: r ? { id: r.id, no: r.round_no, kind: r.kind, need: r.need,
      candidates: r.round_candidates.map(function (c) { return { id: c.student_id, name: c.students ? c.students.full_name : '?' }; })
        .sort(function (a, b) { return a.name.localeCompare(b.name, 'vi'); }) } : null };
  }
  /* Cuộc bầu gần nhất đã kết thúc (admin xem lại người thắng sau khi tải lại trang) */
  async function lastFinished() {
    var e = ok(await SB.from('elections').select('id, title, state').eq('status', 'closed').order('created_at', { ascending: false }).limit(1));
    return e[0] && e[0].state && e[0].state.done ? e[0] : null;
  }
  async function voted(roundId) {   // tài khoản này đã bỏ phiếu ở vòng này chưa (chỉ đọc được dòng của chính mình)
    var s = await API.session();
    var r = ok(await SB.from('ballot_receipts').select('round_id').eq('round_id', roundId).eq('voter_id', s.user.id));
    return r.length > 0;
  }
  async function progress(roundId) {   // {done: số đã bỏ phiếu, total: số tài khoản của lớp}
    var d = await API.progress(roundId);
    var t = await SB.from('profiles').select('id', { count: 'exact', head: true });
    if (t.error) throw t.error;
    return { done: d, total: t.count || 0 };
  }
  async function cast(roundId, candidateId) { await API.castBallot(roundId, candidateId); }   // ném 'already_voted' nếu đã bỏ phiếu

  /* Học sinh/admin nhận biết khi có vòng mới mở hoặc đóng: realtime + hỏi lại định kỳ phòng khi mất kết nối */
  function watch(cb, ms) {
    var ch = null, t = null;
    try { ch = API.onRounds(cb); } catch (e) {}
    t = setInterval(cb, ms || 5000);
    return function () { clearInterval(t); try { if (ch) SB.removeChannel(ch); } catch (e) {} };
  }

  /* ---------- Chỉ admin (máy chủ kiểm tra lại bằng is_admin()) ---------- */
  async function openRound(electionId, no, kind, need, ids) {
    return ok(await SB.rpc('open_round', { p_election: electionId, p_round_no: no, p_kind: kind, p_need: need, p_candidates: ids }));
  }
  async function saveState(electionId, state, status) {
    var f = { state: state }; if (status) f.status = status;
    var r = ok(await SB.from('elections').update(f).eq('id', electionId).select('id'));
    if (!r.length) throw new Error('forbidden');
  }
  /* Tạo cuộc bầu, mở vòng 1 và lưu trạng thái. state do VoteLogic.start dựng. Trả về trạng thái đã có roundId. */
  async function begin(title, state) {
    var p = await API.me();
    var e;
    try { e = ok(await SB.from('elections').insert({ class_id: p.class_id, title: title, rounds: state.R, advance: state.adv, created_by: p.id }).select('id').single()); }
    catch (err) { throw new Error(/elections_one_open|duplicate|unique/i.test(err.message || '') ? 'already_open' : (err.message || 'error')); }
    state.cur.roundId = await openRound(e.id, 1, 'main', state.cur.need, state.cur.ids);
    await saveState(e.id, state);
    return { electionId: e.id, state: state };
  }
  /* Đóng vòng hiện tại: máy chủ đếm phiếu -> áp luật -> lưu kết quả từng ứng viên -> mở vòng kế tiếp (nếu còn) -> lưu trạng thái */
  async function endRound(electionId, state, name) {
    var rows = ok(await SB.rpc('close_round', { p_round: state.cur.roundId }));
    var tallies = {}; rows.forEach(function (r) { tallies[r.student_id] = r.votes; });
    var res = VoteLogic.resolve(state, tallies, name);
    await API.saveOutcomes(state.cur.roundId, res.outcomes);
    var ns = res.state;
    if (ns.done) { await saveState(electionId, ns, 'closed'); }
    else {
      ns.cur.roundId = await openRound(electionId, ns.hist.length + 1, ns.cur.kind, ns.cur.need, ns.cur.ids);   // số thứ tự vòng = số vòng đã đóng + 1
      await saveState(electionId, ns);
    }
    return res;
  }
  /* Huỷ cuộc bầu đang mở: đóng vòng đang mở (kết quả bỏ đi) và đánh dấu cuộc bầu đã đóng, không có người thắng */
  async function cancel(electionId, state) {
    if (state && state.cur && state.cur.roundId) { try { ok(await SB.rpc('close_round', { p_round: state.cur.roundId })); } catch (e) {} }
    await saveState(electionId, Object.assign({}, state || {}, { cancelled: true, done: false, cur: null }), 'closed');
  }
  return { me: me, students: students, current: current, lastFinished: lastFinished, voted: voted, progress: progress, cast: cast, watch: watch,
    openRound: openRound, saveState: saveState, begin: begin, endRound: endRound, cancel: cancel };
})();
