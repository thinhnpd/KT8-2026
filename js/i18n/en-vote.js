'use strict';
/* English – trang Vote (bầu ban cán sự, bỏ phiếu, tạo bỏ phiếu) */
(function(){
  var T=function(s){return I18N.tr(s)};
  var pl=function(n,a,b){return n+' '+(+n===1?a:b)};
  I18N.add('en',{
    'Bầu ban cán sự':'Class officer election','Bỏ phiếu':'Vote','Tạo bỏ phiếu':'Create poll',
    'Đang mở':'Open','Đã đóng':'Closed','Đã chốt':'Finalized','Đang bầu':'Voting in progress',
    'Gửi phiếu bầu':'Submit ballot','Đã gửi phiếu bầu':'Ballot submitted','Đã bỏ phiếu':'Voted','Bạn đã bỏ phiếu.':'You have voted.',
    'Bạn đã gửi phiếu. Mỗi tài khoản gửi một lần. Admin xem được số phiếu tạm thời.':'You have submitted your ballot. Each account can submit once. Admins can see the interim vote counts.',
    'Bạn đã gửi phiếu. Mỗi tài khoản gửi một lần.':'You have submitted your ballot. Each account can submit once.',
    'Chọn ứng viên cho từng chức vụ rồi gửi phiếu. Mỗi tài khoản gửi một lần. Admin xem được số phiếu tạm thời.':'Choose a candidate for each position, then submit. Each account can submit once. Admins can see the interim vote counts.',
    'Chọn ứng viên cho từng chức vụ rồi gửi phiếu. Mỗi tài khoản gửi một lần.':'Choose a candidate for each position, then submit. Each account can submit once.',
    'Mỗi bạn bỏ một phiếu cho mỗi chức vụ. Tổ trưởng do thành viên của tổ đó bầu.':'Each student casts one vote per position. Team leaders are elected by the members of that team.',
    'Hiện tại':'Current','Người trúng cử':'Elected','Trúng cử':'Elected','Bạn chọn':'Your pick',
    'Chốt kết quả và áp dụng':'Finalize results and apply','Xác nhận chốt kết quả':'Confirm finalizing results',
    'Người nhiều phiếu nhất mỗi chức vụ sẽ được áp dụng ngay cho cả lớp.':'The candidate with the most votes for each position is applied to the whole class immediately.',
    'Xác nhận chốt':'Confirm finalizing',
    'Khi chốt kết quả, Danh bạ, quyền admin và tổ trưởng của các tổ được cập nhật theo người trúng cử. Admin gồm giáo viên chủ nhiệm, lớp trưởng, lớp phó học tập và bí thư chi đoàn.':'When results are finalized, the Directory, admin permissions and team leaders are updated to match the elected students. Admins are the homeroom teacher, class president, vice president (academics) and Youth Union secretary.',
    'Muốn bầu lại, mở một đợt mới. Ứng viên ban đầu là người đang giữ chức vụ.':'To hold a new election, open a new round. The initial candidates are the current office holders.',
    'Mở đợt bầu mới':'Open a new election round','Thêm ứng viên...':'Add candidate...',
    'Chọn một bạn trong danh sách trước khi thêm':'Select a student from the list before adding',
    'Chưa có ứng viên.':'No candidates yet.','Chưa có ứng viên':'No candidates','Chưa có phiếu':'No votes yet',
    'Hai ứng viên bằng phiếu':'Candidates are tied','Số phiếu hiện sau khi admin chốt.':'Vote counts appear after the admin finalizes.',
    'chưa có':'none yet','không có':'none',
    'Đã chốt kết quả, Danh bạ và quyền admin đã cập nhật':'Results finalized; Directory and admin permissions updated',
    'Đã chốt kết quả. Bạn không còn là admin của lớp.':'Results finalized. You are no longer a class admin.',
    'Đã mở đợt bầu mới':'New election round opened',
    'Kết quả bầu ban cán sự đã được áp dụng. Danh bạ và quyền admin đã cập nhật.':'The class officer election results have been applied. The Directory and admin permissions are updated.',
    'Chọn ít nhất một ứng viên trước khi gửi':'Choose at least one candidate before submitting',
    /* bỏ phiếu thường */
    'Cuộc bỏ phiếu mới hiện ở tab Bỏ phiếu cho cả lớp. Mỗi bạn chọn một lựa chọn.':'The new poll appears in the Vote tab for the whole class. Each student picks one option.',
    'Câu hỏi':'Question','Các lựa chọn':'Options','Mô tả (không bắt buộc)':'Description (optional)','Thời hạn':'Deadline',
    '1 ngày':'1 day','2 ngày':'2 days','3 ngày':'3 days','5 ngày':'5 days','7 ngày':'7 days',
    'Thêm lựa chọn':'Add option','Đăng bỏ phiếu':'Post poll','Đóng bỏ phiếu':'Close poll',
    'Đã đóng bỏ phiếu':'Poll closed','Đã đăng bỏ phiếu':'Poll posted',
    'Nhập câu hỏi cho cuộc bỏ phiếu.':'Enter a question for the poll.',
    'Cần ít nhất hai lựa chọn khác nhau.':'At least two different options are required.',
    'Có hai lựa chọn trùng nhau, hãy sửa lại.':'Two options are identical; please fix them.',
    'Chọn một lựa chọn trước khi bỏ phiếu':'Choose an option before voting',
    'Chọn địa điểm tổng kết học kỳ':'Choose a venue for the end-of-semester event',
    'Chưa có cuộc bỏ phiếu nào.':'There are no polls yet.',
    'Chọn màu áo lớp':'Choose the class shirt color','Chọn địa điểm cắm trại':'Choose the camping location',
    'Cả lớp chọn một địa điểm. Kết quả chốt vào cuối tuần.':'Everyone picks one location. The result is finalized at the end of the week.',
    'Bãi biển':'Beach','Suối Mơ':'Mơ Stream','Đồi thông':'Pine hill','Trắng':'White','Xám':'Gray','Xanh navy':'Navy blue'
  },[
    [/^(\d+) phiếu(?: · (\d+%))?$/,function(n,p){return pl(n,'vote','votes')+(p?' · '+p:'')}],
    [/^Do (.+) tạo$/,function(n){return 'Created by '+T(n)}],
    [/^(\S+) bạn đã bỏ phiếu$/,function(n){return n+' students have voted'}],
    [/^Đã bỏ phiếu: (.+)$/,function(n){return 'Voted: '+n}],
    [/^Chỉ thành viên Tổ (\d+) bỏ phiếu\.$/,function(n){return 'Only members of Team '+n+' can vote.'}],
    [/^Thêm ứng viên cho (.+)$/,function(n){return 'Add candidate for '+T(n)}],
    [/^Đã thêm ứng viên (.+)$/,function(n){return 'Added candidate '+T(n)}],
    [/^Lựa chọn (\d+)$/,function(n){return 'Option '+n}],
    [/^Xoá lựa chọn (\d+)$/,function(n){return 'Delete option '+n}],
    [/^Bỏ phiếu mới: (.+)$/,function(q){return 'New poll: '+q}],
    [/^Chưa có cuộc bỏ phiếu nào\. Mở tab Tạo bỏ phiếu để tạo mới\.$/,function(){return 'There are no polls yet. Open the Create poll tab to start one.'}],
    [/^Còn (\d+) chức vụ chưa chốt được\. Thêm ứng viên hoặc chờ thêm phiếu\.$/,function(n){return pl(n,'position','positions')+' still cannot be decided. Add candidates or wait for more votes.'}],
    [/^Đã áp dụng kết quả\. Admin mới: (.+?)\. Không còn là admin: (.+?)\.$/,function(a,b){return 'Results applied. New admins: '+a+'. No longer admins: '+b+'.'}],
    [/^Admin mới: (.+?)\. Không còn là admin: (.+?)\. Danh bạ, quyền admin và tổ trưởng sẽ cập nhật theo\.$/,function(a,b){return 'New admins: '+a+'. No longer admins: '+b+'. The Directory, admin permissions and team leaders will update accordingly.'}],
    [/^Admin mới: (.+)$/,function(a){return 'New admins: '+a}],
    [/^Không còn là admin: (.+)$/,function(a){return 'No longer admins: '+a}]
  ]);
})();
