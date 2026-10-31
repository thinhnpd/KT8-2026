'use strict';
/* Hằng số cấu hình dùng chung */
/* Tuần học được đánh số theo mốc cố định: tuần 12 bắt đầu Thứ 2, 12/10/2026. CUR = tuần chứa ngày hôm nay (tự tính, không sửa tay). */
var WK0=12,WK0_START=new Date(2026,9,12);
function weekOf(date){var m=new Date(date.getFullYear(),date.getMonth(),date.getDate()-((date.getDay()+6)%7));return WK0+Math.round((m-WK0_START)/604800000)}   /* làm tròn để không lệch khi đổi giờ mùa hè */
function weekNow(){return weekOf(new Date())}
function todayIdx(){return(new Date().getDay()+6)%7}   /* 0 = Thứ 2 ... 6 = CN */
var CUR=weekNow();
var DAYS=['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','CN'];
var CL={'Sinh hoạt':'g','Bài tập':'y','Kiểm tra':'r','Sự kiện':'b'};
var GSUBJ=[{c:'To',vi:'Toán',en:'Maths'},{c:'Va',vi:'Ngữ Văn',en:'Literature'},{c:'Anh',vi:'Tiếng Anh',en:'English'},{c:'Su',vi:'Lịch sử',en:'History'},{c:'Ly',vi:'Vật lý',en:'Physics'},{c:'Ho',vi:'Hoá học',en:'Chemistry'},{c:'Si',vi:'Sinh học',en:'Biology'},{c:'Ti',vi:'Tin học',en:'Information Technology'},{c:'Cn',vi:'Công nghệ',en:'Technical Education'},{c:'Di',vi:'Địa lý',en:'Geography'},{c:'Kt',vi:'Giáo dục Kinh tế và Pháp luật',en:'Economics and Law Education'},{c:'An',vi:'Âm nhạc',en:'Music'},{c:'Mt',vi:'Mỹ thuật',en:'Art'},{c:'Ph',vi:'Tiếng Pháp',en:'French'}];   /* môn có bộ nhóm học tập; c = mã lưu trong CSDL (khớp sql/update-12.sql) */
var SUBJ=['Toán','Ngữ văn','Tiếng Anh','Lịch sử','Vật lý','Hoá học','Sinh học','Tin học','Công nghệ','Địa lý','Giáo dục Kinh tế và Pháp luật','Âm nhạc','Mỹ thuật','Tiếng Pháp'];
var POSITIONS=['Lớp trưởng','Lớp phó học tập','Lớp phó lao động','Bí thư chi đoàn','Thủ quỹ','Tổ trưởng Tổ 1','Tổ trưởng Tổ 2','Tổ trưởng Tổ 3','Tổ trưởng Tổ 4'];
var ADMIN_POS=['Lớp trưởng','Lớp phó học tập','Bí thư chi đoàn'];
var STXT={none:'Chưa có ứng viên',zero:'Chưa có phiếu',tie:'Hai ứng viên bằng phiếu'};
var NAV=[{id:'event',i:'calendar-event',t:'Sự kiện'},{id:'map',i:'layout-grid',t:'Sơ đồ lớp'},{id:'contacts',i:'contact',t:'Danh bạ'},{id:'groups',i:'users',t:'Nhóm'},{id:'vote',i:'vote',t:'Bỏ phiếu'},{id:'feedback',i:'message-circle',t:'Góp ý'}];
var TITLES={event:'Sự kiện',map:'Sơ đồ lớp',contacts:'Danh bạ',groups:'Nhóm',vote:'Bỏ phiếu',chianhom:'Chia nhóm học tập',feedback:'Góp ý',settings:'Cài đặt'};
