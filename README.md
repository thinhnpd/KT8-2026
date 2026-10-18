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
