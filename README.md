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
│  └─ modal-toast.css  responsive.css   (responsive luôn nạp cuối)
└─ js/
   ├─ core/        config, utils, icons, state, router, global-events
   ├─ data/        names, class-helpers, seed
   ├─ components/  toast, modal, theme, sidebar, topbar, notifications, account, page-helpers, logo
   ├─ pages/       event, map, contacts, groups, vote, feedback, settings
   └─ main.js      khởi chạy
```

## Vì sao dùng script thường (không ES module)
Các file chia sẻ chung phạm vi toàn cục nên `index.html` chạy được ngay khi mở bằng file://. Thứ tự nạp trong `index.html` là bắt buộc:
core/config → utils → icons → data/* → core/state → components/* → pages/* → core/router → core/global-events → main.js

## Thêm một trang mới
1. Tạo `css/page-xxx.css` và `js/pages/xxx.js` (hàm vẽ trang + sự kiện riêng của trang, dùng `data-act`).
2. Thêm mục vào `NAV`, `TITLES`, `VIEWS` (trong core/config.js và core/router.js).
3. Thêm thẻ `<link>` và `<script>` tương ứng vào `index.html` (trước `core/router.js`).

## Lưu ý
- Đã sửa 1 lỗi CSS của bản gốc: lớp `.st` của ghế ngồi bị trùng với `.tg .st` (ngôi sao ở nút sáng/tối), làm nút bị méo ở chế độ tối. Nay ghế dùng `.desk .st`.
- Có thể nâng cấp lên ES modules (`import/export`) sau này nếu dùng Vite.
