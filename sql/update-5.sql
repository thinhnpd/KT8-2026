-- Cho admin thêm / sửa / xoá sự kiện, tin ghim, nhắc nhở và phân công trực nhật, có lưu lại.
-- Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây.
-- (Cài mới từ schema.sql hiện tại thì đã có sẵn, không cần chạy file này.)

-- Mỗi lớp, mỗi tuần một dòng. data = {"pins":[], "rem":[], "ev":[], "duty":{"tasks":[], "cells":{}}}
create table if not exists class_weeks (
  class_id uuid not null references classes(id) on delete cascade,
  week int not null,
  data jsonb not null default '{}'::jsonb,
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (class_id, week)
);
alter table class_weeks enable row level security;
drop policy if exists class_weeks_read on class_weeks;
drop policy if exists class_weeks_admin on class_weeks;
create policy class_weeks_read on class_weeks for select using (class_id = my_class());
create policy class_weeks_admin on class_weeks for all
  using (class_id = my_class() and is_admin()) with check (class_id = my_class() and is_admin());

-- Cập nhật tức thời cho các thành viên đang mở trang (bỏ qua nếu đã thêm)
do $$ begin
  alter publication supabase_realtime add table class_weeks;
exception when duplicate_object then null; end $$;
