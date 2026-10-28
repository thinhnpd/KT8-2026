-- =====================================================================
-- Chạy SAU schema.sql, trong Supabase > SQL Editor. Đổi nội dung cho đúng lớp của bạn.
-- KHÔNG đưa file này (đã điền mã thật) lên GitHub. Mã lớp chỉ được lưu dạng băm trong cơ sở dữ liệu.
-- =====================================================================

-- 0) Mỗi tên lớp chỉ xuất hiện một lần (đăng ký admin tìm lớp theo tên)
create unique index if not exists classes_name_uq on classes (lower(name));

-- 1) Tạo lớp và hai mã. Dùng chuỗi dài, ngẫu nhiên (ví dụ 16-24 ký tự); đừng dùng mã dễ đoán.
with c as (insert into classes(name, school) values ('10A5', 'THPT Chuyên Lê Quý Đôn') returning id)
insert into class_secrets(class_id, admin_code_hash, join_code_hash, join_code_plain)
select id, crypt('DOI-MA-QUAN-TRI-DAI-VA-NGAU-NHIEN', gen_salt('bf')), crypt('DOI-MA-HOC-SINH-KHAC', gen_salt('bf')), 'DOI-MA-HOC-SINH-KHAC' from c;

-- 2) Danh sách học sinh (thay bằng tên thật; mỗi tên là duy nhất trong lớp)
insert into students(class_id, full_name)
select (select id from classes where lower(name) = '10a5'), n
from unnest(array['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C']) as n;

-- 3) Liên hệ và thông tin thêm (tùy chọn), ví dụ:
-- insert into student_contacts(student_id, email, phone)
--   select id, 'a@truong.edu.vn', '0900000000' from students where full_name = 'Nguyễn Văn A';
-- update students set subject = 'Toán', talent = 'Bóng đá' where full_name = 'Nguyễn Văn A';

-- 4) Giáo viên và ban cán sự (tùy chọn), ví dụ:
-- insert into teachers(class_id, name, subject, is_homeroom)
--   values ((select id from classes where lower(name) = '10a5'), 'Cô Hoa', 'Ngữ văn', true);
-- insert into committee(class_id, position, student_id)
--   values ((select id from classes where lower(name) = '10a5'), 'Lớp trưởng', (select id from students where full_name = 'Nguyễn Văn A'));
