/* Từ điển tiếng Anh cho: Bi lăn, Đèn may mắn, Bỏ phiếu.
   "exact": chữ khớp nguyên văn (đã bỏ khoảng trắng đầu/cuối).
   "rules": [biểu thức, câu thay thế] cho các câu có số hoặc tên xen giữa ($1, $2... là phần bắt được). */
(function () {
  var n1 = function (n, a, b) { return String(n) === '1' ? a : b; };
  EmbedI18n.add('en', {
    exact: {
      /* ---- Dùng chung ---- */
      'Thiết lập': 'Settings',
      'Môn học': 'Subject',
      'Toán': 'Maths', 'Ngữ Văn': 'Literature', 'Tiếng Anh': 'English', 'Lịch sử': 'History',
      'Vật lý': 'Physics', 'Hoá học': 'Chemistry', 'Sinh học': 'Biology', 'Tin học': 'Information Technology', 'Công nghệ': 'Technical Education', 'Địa lý': 'Geography', 'Giáo dục Kinh tế và Pháp luật': 'Economics and Law Education', 'Âm nhạc': 'Music', 'Mỹ thuật': 'Art', 'Tiếng Pháp': 'French',
      'Bắt đầu': 'Start',
      'Danh sách ô': 'Slot list',
      '(mỗi dòng một ô)': '(one slot per line)',
      '(mỗi dòng một người)': '(one person per line)',
      'Cần ít nhất 2 dòng': 'At least 2 lines are required',

      /* Trang chủ chia nhóm */
      'Bi lăn ngẫu nhiên': 'Random ball drop',
      'Bi rơi qua các chốt và dừng ngẫu nhiên ở một ô trong danh sách tùy chỉnh.': 'The ball falls through pegs and stops at a random slot on the list.',
      'Chơi Bi lăn ngẫu nhiên': 'Play Random ball drop',
      'Chia nhóm học tập': 'Create study groups',
      'Chọn trò chơi để thực hiện việc chia nhóm cho lớp.': 'Choose a game to create study groups for the class.',
      'Đèn may mắn': 'Lucky lights',
      'Các đèn nhấp nháy theo màu của từng nhóm, rồi chia đều thành viên vào các nhóm.': "The lights blink each group's colour, then divide classmates evenly into groups.",
      'Chơi Đèn may mắn': 'Play Lucky lights',

      /* ---- Bi lăn ---- */
      'Bi lăn': 'Ball drop',
      'Tốc độ rơi': 'Fall speed',
      'Vị trí thả': 'Drop position',
      'Ngẫu nhiên': 'Random',
      'Tự chọn': 'Custom',
      'Vị trí ngang': 'Horizontal position',
      'Xóa thống kê': 'Clear statistics',
      'Bi rơi vào ô': 'The ball landed in slot',
      'Bi đang rơi...': 'The ball is falling...',

      /* ---- Đèn may mắn ---- */
      'Đèn may mắn': 'Lucky lights',
      'Bảng đèn': 'Light board',
      'Kết quả chia nhóm': 'Group results',
      'Chế độ': 'Mode',
      'Chọn một ô': 'Pick one slot',
      'Chia nhóm': 'Divide into groups',
      'Số nhóm': 'Number of groups',
      'Màu từng nhóm': 'Colour of each group',
      'Danh sách thành viên': 'Member list',
      'Thời gian quay': 'Spin time',
      'Quay': 'Spin',
      'Dùng danh sách lớp': 'Use class list',
      'Xóa lịch sử': 'Clear history',
      'Lịch sử': 'History',
      'Chưa có lượt quay nào': 'No spins yet',
      'Đang quay...': 'Spinning...',
      'Đèn sáng ở ô': 'The light is on at slot',
      'Đang chia nhóm...': 'Dividing into groups...',
      'Số nhóm phải từ 2 đến 12': 'The number of groups must be between 2 and 12',
      'Có nhóm trùng màu, hãy chọn màu khác nhau': 'Some groups share a colour; please choose different colours',
      'Đỏ': 'Red', 'Xanh dương': 'Blue', 'Xanh lá': 'Green', 'Cam': 'Orange', 'Tím': 'Purple',
      'Xanh ngọc': 'Teal', 'Cam đất': 'Burnt orange', 'Hồng': 'Pink', 'Xanh rêu': 'Olive',
      'Nâu': 'Brown', 'Chàm': 'Indigo', 'Lục bảo': 'Emerald',

      /* ---- Bỏ phiếu ---- */
      'Bỏ phiếu': 'Voting',
      'Bảng bỏ phiếu': 'Voting board',
      'Kết quả': 'Results',
      'Luật bỏ phiếu': 'Voting rules',
      'Ứng viên': 'Candidates',
      'Số vòng': 'Number of rounds',
      'Làm lại': 'Reset',
      'Tiếp tục': 'Continue',
      'người đi tiếp': 'move on',
      'Một vòng: ứng viên nhiều phiếu nhất thắng cuộc.': 'One round: the candidate with the most votes wins.',
      'Cần ít nhất 2 ứng viên.': 'At least 2 candidates are required.',
      'Thiết lập luật bên phải rồi nhấn "Bắt đầu".': 'Set the rules on the right, then press "Start".',
      'Người thắng cuộc': 'Winner',
      'Chọn 1 người thắng cuộc.': 'Choose 1 winner.',
      'Giảm': 'Decrease',
      'Thêm phiếu': 'Add a vote',
      'Kết thúc vòng': 'End round',
      'Bị loại': 'Eliminated',
      'Thắng cuộc': 'Winner',
      'Đi tiếp': 'Advances',
      'Đồng điểm': 'Tied',
      'Kết quả cuối cùng': 'Final result',
      'Kết quả vừa công bố': 'Latest result',
      'Tên cuộc bầu': 'Vote title',
      'Bỏ phiếu lớp': 'Class vote',
      'Chọn tất cả': 'Select all',
      'Bỏ chọn': 'Clear',
      'Số ứng viên': 'Number of candidates',
      'Cuộc bầu đang diễn ra': 'Vote in progress',
      'Huỷ cuộc bầu': 'Cancel vote',
      'Bấm lần nữa để huỷ': 'Press again to cancel',
      'Gửi phiếu của tôi': 'Submit my vote',
      'Bấm lần nữa để kết thúc vòng': 'Press again to end the round',
      'Bạn đã bỏ phiếu ở vòng này.': 'You have voted in this round.',
      'Bạn chưa bỏ phiếu. Chọn một ứng viên rồi gửi phiếu.': 'You have not voted yet. Pick a candidate, then submit your vote.',
      'Số phiếu từng ứng viên chỉ hiện sau khi kết thúc vòng. Admin chỉ bỏ phiếu cho chính mình, không nhập số phiếu.': 'Votes per candidate only appear after the round ends. Admins only cast their own vote and do not enter vote counts.',
      'Cuộc bầu bị lỗi: không có vòng nào đang mở. Hãy huỷ cuộc bầu rồi tạo lại.': 'This vote is broken: no round is open. Cancel it and create a new one.',
      'Đang có một cuộc bỏ phiếu khác đang mở. Đã tải lại.': 'Another vote is already open. Reloaded.',
      'Không bắt đầu được. Hãy thử lại.': 'Could not start. Please try again.',
      'Không gửi được phiếu. Hãy thử lại.': 'Could not send your vote. Please try again.',
      'Không huỷ được. Hãy thử lại.': 'Could not cancel. Please try again.',
      'Không thực hiện được. Đang tải lại trạng thái.': 'Could not complete that. Reloading the state.',
      'Không tải được dữ liệu bỏ phiếu. Vui lòng tải lại trang.': 'Could not load voting data. Please reload the page.'
    },
    rules: [
      [/^Môn này đã có bộ nhóm \((\d+) nhóm\)\. Lưu bộ mới sẽ thay thế bộ cũ\.$/, 'This subject already has a group set ($1 groups). Saving a new one will replace it.'],
      /* ---- Đếm số ô / người (Bi lăn, Đèn may mắn) ---- */
      [/^Tối đa (\d+) ô, chỉ dùng (\d+) dòng đầu$/, 'Maximum $1 slots; only the first $2 lines are used'],
      [/^(\d+) (ô|người)(?: \(chỉ dùng (\d+) dòng đầu\))?(?: · mỗi nhóm (\d+)(?:–(\d+))? người)?$/,
        function (m, n, u, mx, a, b) {
          var s = n + (u === 'ô' ? n1(n, ' slot', ' slots') : n1(n, ' person', ' people'));
          if (mx) s += ' (only the first ' + mx + ' lines are used)';
          if (a) s += ' · ' + (b ? a + '–' + b : a) + ' per group';
          return s;
        }],
      [/^Cần ít nhất (\d+) người cho (\d+) nhóm$/, 'At least $1 people are required for $2 groups'],

      /* ---- Đèn may mắn ---- */
      [/^Đã chia (\d+) người thành (\d+) nhóm\.$/, 'Divided $1 people into $2 groups.'],
      [/^Nhóm (\d+) · (.+) \((\d+) người\)$/,
        function (m, g, c, n) { return 'Group ' + g + ' · ' + EmbedI18n.tr(c) + ' (' + n + n1(n, ' person)', ' people)'); }],
      [/^Nhóm (\d+)$/, 'Group $1'],
      [/^Màu nhóm (\d+)$/, 'Colour of group $1'],

      /* ---- Bỏ phiếu: luật ---- */
      [/^(\d+) ứng viên \(tối đa (\d+)\)$/, '$1 candidates (max $2)'],
      [/^Đã bỏ phiếu: (\d+)\/(\d+)$/, 'Voted: $1/$2'],
      [/^Vòng (\d+) \(vòng cuối\) luôn còn đúng 2 ứng viên để bỏ phiếu 50\/50\.$/, 'Round $1 (the final round) always has exactly 2 candidates for a 50/50 vote.'],
      [/^Sau vòng (\d+)$/, 'After round $1'],
      [/^Cần ít nhất (\d+) ứng viên cho (\d+) vòng\.$/, 'At least $1 candidates are required for $2 rounds.'],
      [/^Sau vòng (\d+): số người đi tiếp phải từ 2 đến (\d+)\.$/, 'After round $1: the number moving on must be between 2 and $2.'],

      /* ---- Bỏ phiếu: bảng bỏ phiếu ---- */
      [/^Vòng (\d+)\/(\d+)( · vòng cuối)?$/, function (m, a, b, f) { return 'Round ' + a + '/' + b + (f ? ' · final round' : ''); }],
      [/^Vòng phụ \(thuộc vòng (\d+)\)$/, 'Tie-break round (part of round $1)'],
      [/^Chọn (\d+) người trong (\d+) người đồng điểm\.$/, 'Choose $1 of the $2 tied candidates.'],
      [/^Chọn (\d+) người đi tiếp\.$/, 'Choose $1 to move on.'],
      [/^Số phiếu (.+)$/, 'Votes for $1'],
      [/^Tổng số phiếu: (\d+)$/, 'Total votes: $1'],

      /* ---- Bỏ phiếu: kết quả ---- */
      [/^Kết quả vòng phụ \(vòng (\d+)\)$/, 'Tie-break round results (round $1)'],
      [/^Kết quả vòng (\d+)\/(\d+)$/, 'Round $1/$2 results'],
      [/^(\d+) phiếu$/, function (m, n) { return n + n1(n, ' vote', ' votes'); }],
      [/^Người thắng cuộc: (.+)\.$/, 'Winner: $1.'],
      [/^Đi tiếp vòng (\d+): (.+)\.$/, 'Moving on to round $1: $2.'],
      [/^Đồng điểm ở vị trí cuối: (.+) \((\d+) phiếu\)\. Cần vòng phụ để chọn (\d+) người\.$/,
        function (m, names, v, k) { return 'Tied for the last spot: ' + names + ' (' + v + n1(v, ' vote', ' votes') + '). A tie-break round is needed to choose ' + k + ' of them.'; }]
    ]
  });
})();
