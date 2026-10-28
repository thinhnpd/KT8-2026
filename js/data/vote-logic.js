'use strict';
/* Luật bỏ phiếu theo vòng (không đụng tới mạng, dễ kiểm thử).
   Tách nguyên logic cũ của bo_phieu/vote.html: số người đi tiếp sau mỗi vòng, đồng điểm ở vị trí cuối -> vòng phụ.
   Trạng thái cuộc bầu (lưu ở elections.state):
     { cands:[id], R, adv:[số người đi tiếp sau vòng 1..R-1], idx, done, winner,
       cur:{ roundId, kind:'main'|'mini', need, ids:[id], secured:[id] }, hist:[{title, rows, msg}] }
   Số phiếu KHÔNG nhập tay: máy chủ đếm từ bảng phiếu kín (close_round), hàm resolve chỉ nhận kết quả đếm đó. */
var VoteLogic = (function () {
  /* Gợi ý số người đi tiếp: giảm dần, vòng cuối luôn còn 2 người (rồi chọn 1 người thắng) */
  function defAdv(N, R) {
    var n = R - 1, adv = [];
    if (n < 1) return adv;
    adv[n - 1] = 2;
    for (var k = n - 2; k >= 0; k--) adv[k] = Math.max(adv[k + 1] + 1, Math.round(2 + (N - 2) * (n - 1 - k) / n));
    return adv;
  }
  /* Kiểm tra luật; trả về câu báo lỗi, hoặc '' nếu hợp lệ */
  function validate(N, R, adv) {
    if (N < 2) return 'Cần ít nhất 2 ứng viên.';
    if (R > 1 && N < R + 1) return 'Cần ít nhất ' + (R + 1) + ' ứng viên cho ' + R + ' vòng.';
    var c = N;
    for (var k = 0; k < R - 1; k++) {
      if (!(adv[k] >= 2 && adv[k] < c)) return 'Sau vòng ' + (k + 1) + ': số người đi tiếp phải từ 2 đến ' + (c - 1) + '.';
      c = adv[k];
    }
    return '';
  }
  /* Vòng đầu tiên của một cuộc bầu mới */
  function start(cands, R, adv) {
    return { cands: cands.slice(), R: R, adv: adv.slice(0, Math.max(0, R - 1)), idx: 0, done: false, winner: null, hist: [],
      cur: { roundId: null, kind: 'main', need: R > 1 ? adv[0] : 1, ids: cands.slice(), secured: [] } };
  }
  /* Áp dụng kết quả đếm của vòng hiện tại.
     tallies: {idƯngViên: số phiếu}; name(id) -> tên hiển thị.
     Trả về { state: trạng thái mới (cur.roundId = null, nơi gọi điền sau khi mở vòng mới),
              outcomes: [{id, outcome}] để lưu vào round_candidates, entry: dòng lịch sử } */
  function resolve(st, tallies, name) {
    var c = st.cur, r = st.R, V = function (i) { return tallies[i] || 0; };
    var s = c.ids.slice().sort(function (a, b) { return V(b) - V(a); });
    var cut = V(s[c.need - 1]);
    var above = s.filter(function (i) { return V(i) > cut; });
    var tied = s.filter(function (i) { return V(i) === cut; });
    var slots = c.need - above.length;
    var secured = c.secured.concat(above);
    var names = function (a) { return a.map(name).join(', '); };
    var last = st.idx === r - 1, fits = tied.length <= slots, finalWin = null;
    var entry = { title: c.kind === 'mini' ? 'Kết quả vòng phụ (vòng ' + (st.idx + 1) + ')' : 'Kết quả vòng ' + (st.idx + 1) + '/' + r, rows: [], msg: '' };
    if (fits) {
      secured = secured.concat(tied);
      if (last) { finalWin = secured[0]; entry.msg = 'Người thắng cuộc: ' + name(finalWin) + '.'; }
      else entry.msg = 'Đi tiếp vòng ' + (st.idx + 2) + ': ' + names(secured) + '.';
    } else {
      entry.msg = 'Đồng điểm ở vị trí cuối: ' + names(tied) + ' (' + cut + ' phiếu). Cần vòng phụ để chọn ' + slots + ' người.';
    }
    var outcomes = [];
    s.forEach(function (i) {
      var status = 'Bị loại', cls = '', outcome = 'out';
      if (above.indexOf(i) > -1 || (fits && tied.indexOf(i) > -1)) {
        status = last ? 'Thắng cuộc' : 'Đi tiếp'; cls = 'up'; outcome = last ? 'winner' : 'advance';
      } else if (tied.indexOf(i) > -1) { status = 'Đồng điểm'; cls = 'tie'; outcome = 'tied'; }
      entry.rows.push({ id: i, name: name(i), votes: V(i), status: status, cls: cls });
      outcomes.push({ id: i, outcome: outcome });
    });
    var ns = JSON.parse(JSON.stringify(st));
    ns.hist = [entry].concat(st.hist || []);
    if (fits) {
      if (finalWin !== null) { ns.done = true; ns.winner = finalWin; ns.cur = null; }
      else { ns.idx = st.idx + 1; ns.cur = { roundId: null, kind: 'main', need: ns.idx < r - 1 ? st.adv[ns.idx] : 1, ids: secured.slice(), secured: [] }; }
    } else {
      ns.cur = { roundId: null, kind: 'mini', need: slots, ids: tied.slice(), secured: secured.slice() };
    }
    return { state: ns, outcomes: outcomes, entry: entry };
  }
  return { defAdv: defAdv, validate: validate, start: start, resolve: resolve };
})();
if (typeof module !== 'undefined') module.exports = VoteLogic;
