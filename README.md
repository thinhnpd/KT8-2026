# KT8-2026
# S Class – Cấu trúc dự án

Mở `index.html` bằng cách bấm đúp (không cần server) hoặc dùng Live Server.

## Thư mục
```
S_Class/
├─ index.html            # khung HTML + nạp CSS/JS
├─ css/
│  ├─ base.css  layout.css  sidebar.css  topbar.css  controls.css  components.css
│  ├─ page-event.css  page-map.css  page-contacts.css  page-groups.css
│  ├─ page-vote.css  page-feedback.css  page-settings.css
│  ├─ lang-toggle.css     # nút VI / EN
│  └─ modal-toast.css  responsive.css   (responsive luôn nạp cuối)
└─ js/
   ├─ core/        config, utils, icons, state, router, global-events
   ├─ data/        names, class-helpers, seed
   ├─ components/  toast, modal, theme, sidebar, topbar, notifications, account, page-helpers, logo, lang-toggle
   ├─ pages/       event, map, contacts, groups, vote, feedback, settings
   ├─ i18n/        engine.js + từ điển en-common, en-event, en-map, en-contacts, en-groups, en-vote, en-feedback, en-settings
   └─ main.js      khởi chạy
```

## Vì sao dùng script thường (không ES module)
Các file chia sẻ chung phạm vi toàn cục nên `index.html` chạy được ngay khi mở bằng file://. Thứ tự nạp trong `index.html` là bắt buộc:
core/config → utils → icons → data/* → core/state → components/* → pages/* → core/router → core/global-events → i18n/engine → i18n/en-* → components/lang-toggle → main.js

## Thêm một trang mới
1. Tạo `css/page-xxx.css` và `js/pages/xxx.js` (hàm vẽ trang + sự kiện riêng của trang, dùng `data-act`).
2. Thêm mục vào `NAV`, `TITLES`, `VIEWS` (trong core/config.js và core/router.js).
3. Thêm thẻ `<link>` và `<script>` tương ứng vào `index.html` (trước `core/router.js`).

## Lưu ý
- Đã sửa 1 lỗi CSS của bản gốc: lớp `.st` của ghế ngồi bị trùng với `.tg .st` (ngôi sao ở nút sáng/tối), làm nút bị méo ở chế độ tối. Nay ghế dùng `.desk .st`.
- Có thể nâng cấp lên ES modules (`import/export`) sau này nếu dùng Vite.

## Đa ngôn ngữ (nút VI / EN)
- Giao diện gốc viết bằng tiếng Việt. Khi bấm EN, `i18n/engine.js` dịch ở mức DOM: chữ hiển thị và các thuộc tính `placeholder`, `aria-label`, `title`, `alt`. Code từng trang **không phải sửa**, dữ liệu và logic vẫn là tiếng Việt nên không bị ảnh hưởng.
- Một MutationObserver tự dịch phần mới được vẽ ra (đổi trang, mở modal, toast, chuông thông báo...). Bấm VI sẽ khôi phục đúng chữ gốc.
- Lựa chọn được nhớ trong `localStorage` (khoá `sclass.lang`), mặc định là tiếng Việt.
- Từ điển nằm ở `js/i18n/en-*.js`, mỗi trang một file:
  - `dict`: khớp nguyên câu, ví dụ `'Danh bạ':'Directory'`.
  - `patterns`: `[RegExp, hàm]` cho câu có số hoặc tên riêng, ví dụ `[/^(\d+) phiếu$/, n => n+' votes']`.
  - Chuỗi có dấu ` · ` được tách ra dịch từng đoạn. File nạp sau có độ ưu tiên cao hơn.
- Thêm chữ mới: thêm vào `dict` hoặc `patterns` của file trang tương ứng. Chữ chưa có bản dịch sẽ hiện nguyên tiếng Việt, không gây lỗi.
- Thêm ngôn ngữ mới (ví dụ `ja`): tạo `js/i18n/ja-*.js` dùng `I18N.add('ja', ...)`, thêm nút `<button data-lang="ja">` trong `index.html`.
- Tên riêng, email, tên tệp và nội dung người dùng tự nhập được giữ nguyên.

## Admin chỉnh sửa sự kiện, trực nhật, việc cần làm
- Trang Sự kiện: admin thấy nút sửa / xoá ở từng sự kiện, tin ghim và nhắc nhở (việc cần làm), và nút sửa ở khung "Trực nhật trong tuần" (đổi người, đổi tên / thêm / xoá nhiệm vụ, hoặc quay về phân công tự động). Tuần đã qua chỉ xem.
- Thành viên thường không thấy các nút này; quyền ghi cũng được chặn ở máy chủ (RLS).
- Dữ liệu lưu ở bảng `class_weeks`. **Chạy `sql/update-5.sql` một lần** trong Supabase > SQL Editor nếu bạn đã chạy `schema.sql` trước đây (cài mới thì `schema.sql` đã có sẵn). Chưa chạy thì chỉnh sửa vẫn hiện trên máy bạn nhưng sẽ mất khi tải lại trang.

## Bỏ phiếu trực tuyến (admin theo dõi, học sinh bỏ phiếu)
- **Học sinh** đăng nhập sẽ vào thẳng `bo_phieu/student.html`: chỉ xem cuộc bỏ phiếu đang diễn ra và gửi một phiếu mỗi vòng (phiếu kín, không đổi được). Các trang khác của lớp không mở được với tài khoản học sinh.
- **Admin** dùng `bo_phieu/vote.html` (nhúng trong trang Bỏ phiếu): chọn ứng viên từ danh sách lớp, đặt số vòng, rồi bắt đầu. Trong lúc bỏ phiếu admin chỉ bỏ phiếu cho chính mình và theo dõi số người đã bỏ phiếu; không nhập số phiếu. Số phiếu do máy chủ đếm khi admin kết thúc vòng (`close_round`), rồi luật đi tiếp / vòng phụ khi đồng điểm áp dụng như trước.
- Mã: `js/data/vote-logic.js` (luật vòng, không cần mạng), `js/data/vote-api.js` (Supabase).
- Cơ sở dữ liệu: cài mới dùng `sql/schema.sql`; nếu đã cài trước đó, chạy thêm `sql/update-6.sql` một lần.

## Tạo tài khoản học sinh hàng loạt (admin)
- Cài đặt > **Tài khoản học sinh** > "Tạo tài khoản hàng loạt". Tạo tài khoản cho mọi học sinh trong danh sách lớp, **bỏ qua** admin (tài khoản admin, hoặc người giữ chức vụ admin trong ban cán sự) và học sinh đã có tài khoản.
- Tên đăng nhập gợi ý theo quy ước tên + chữ cái đầu họ và tên đệm (Nguyễn Văn Ánh -> `anhnv`), sửa được trước khi tạo. Mật khẩu ngẫu nhiên 8 ký tự chỉ hiện một lần; tải file CSV để phát cho học sinh. Học sinh đổi mật khẩu ngay trong giao diện bỏ phiếu.
- Không dùng khóa service_role: trình duyệt admin tạo từng tài khoản bằng một kết nối phụ (không đổi phiên của admin), rồi gọi `admin_link_student` để gắn vào đúng học sinh. Cài mới dùng `sql/schema.sql`; nếu đã cài trước đó, chạy thêm `sql/update-7.sql`.
- Supabase giới hạn số lần đăng ký trong một khoảng thời gian; khi chạm giới hạn, công cụ tự chờ rồi tiếp tục. Lớp đông có thể tăng giới hạn ở Authentication > Rate Limits.
- Mã: `js/data/account-logic.js` (tên đăng nhập, mật khẩu, phân loại), `js/data/accounts-api.js`, `js/pages/accounts.js`.
