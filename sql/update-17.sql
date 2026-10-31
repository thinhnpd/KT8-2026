-- Lưu xác nhận "Đã đọc" của bản tin tuần để admin và cán sự lớp biết ai đã đọc, ai chưa.
-- Chạy một lần trong Supabase > SQL Editor (sau update-14.sql, vì dùng hàm can_manage()).
--   - Mỗi tài khoản xác nhận một lần cho mỗi tuần (qua hàm mark_week_read, không giả danh được).
--   - Thành viên thường chỉ xem được xác nhận của chính mình; admin / cán sự lớp xem được danh sách cả lớp (hàm week_readers).
--   - Khi nội dung bản tin tuần thay đổi (sự kiện, tin ghim, nhắc nhở; riêng phân công trực nhật thì không tính),
--     trigger tự xoá xác nhận của tuần đó để mọi người xác nhận lại.

create table if not exists week_reads (
  class_id uuid not null references classes(id) on delete cascade,
  week int not null,
  profile_id uuid not null references profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (class_id, week, profile_id)
);
alter table week_reads enable row level security;
drop policy if exists week_reads_read on week_reads;
create policy week_reads_read on week_reads for select
  using (class_id = my_class() and (profile_id = auth.uid() or can_manage()));
-- Không có policy insert / update / delete: chỉ ghi qua hàm và trigger bên dưới.

create or replace function mark_week_read(p_week int) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare p profiles;
begin
  select * into p from profiles where id = auth.uid();
  if p.id is null then raise exception 'not_authenticated'; end if;
  insert into week_reads (class_id, week, profile_id) values (p.class_id, p_week, p.id)
  on conflict do nothing;
end $$;
revoke execute on function mark_week_read(int) from public, anon;
grant execute on function mark_week_read(int) to authenticated;

-- Danh sách học sinh (id trong danh sách lớp) đã xác nhận đọc tuần p_week; chỉ admin / cán sự lớp gọi được
create or replace function week_readers(p_week int) returns table(student_id uuid)
language plpgsql stable security definer set search_path = public, extensions as $$
begin
  if not can_manage() then raise exception 'forbidden'; end if;
  return query
    select p.student_id from week_reads r join profiles p on p.id = r.profile_id
    where r.class_id = my_class() and r.week = p_week and p.student_id is not null;
end $$;
revoke execute on function week_readers(int) from public, anon;
grant execute on function week_readers(int) to authenticated;

create or replace function reset_week_reads() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
begin
  if (old.data - 'duty') is distinct from (new.data - 'duty') then
    delete from week_reads where class_id = new.class_id and week = new.week;
  end if;
  return new;
end $$;
drop trigger if exists class_weeks_reset_reads on class_weeks;
create trigger class_weeks_reset_reads after update on class_weeks
  for each row execute function reset_week_reads();

-- Cập nhật tức thời cho admin / cán sự lớp đang mở trang (bỏ qua nếu đã thêm)
do $$ begin
  alter publication supabase_realtime add table week_reads;
exception when duplicate_object then null; end $$;
