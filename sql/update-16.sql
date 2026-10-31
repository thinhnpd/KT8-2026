-- Góp ý của lớp: lưu thật trên máy chủ, mọi thành viên trong lớp đều đọc được.
-- Chạy một lần trong Supabase > SQL Editor.
-- Gửi góp ý và đổi trạng thái đi qua hàm (RPC) nên không ai giả tên người khác được:
--   - Góp ý ẩn danh KHÔNG lưu người gửi (author_id và author_name đều để trống) nên không ai truy ra được, kể cả admin.
--   - Chỉ admin đánh dấu "Đã xử lý".

create table if not exists feedback (
  id bigint generated always as identity primary key,
  class_id uuid not null references classes(id) on delete cascade,
  author_id uuid references profiles(id) on delete set null,   -- trống nếu ẩn danh
  author_name text,                                            -- trống nếu ẩn danh
  text text not null check (char_length(btrim(text)) between 1 and 2000),
  status text not null default 'Mới' check (status in ('Mới','Đã xử lý')),
  created_at timestamptz not null default now()
);
create index if not exists feedback_class_idx on feedback(class_id, created_at desc);

alter table feedback enable row level security;
drop policy if exists feedback_read on feedback;
create policy feedback_read on feedback for select using (class_id = my_class());
-- Không có policy insert / update / delete: chỉ ghi được qua hai hàm bên dưới.

create or replace function post_feedback(p_text text, p_anon boolean) returns bigint
language plpgsql security definer set search_path = public, extensions as $$
declare p profiles; new_id bigint;
begin
  select * into p from profiles where id = auth.uid();
  if p.id is null then raise exception 'not_authenticated'; end if;
  if p_text is null or char_length(btrim(p_text)) = 0 then raise exception 'empty'; end if;
  if char_length(p_text) > 2000 then raise exception 'too_long'; end if;
  insert into feedback (class_id, author_id, author_name, text)
  values (p.class_id,
          case when p_anon then null else p.id end,
          case when p_anon then null else coalesce(nullif(btrim(p.full_name), ''), p.username) end,
          btrim(p_text))
  returning id into new_id;
  return new_id;
end $$;
revoke execute on function post_feedback(text, boolean) from public, anon;
grant execute on function post_feedback(text, boolean) to authenticated;

create or replace function set_feedback_status(p_id bigint, p_status text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_status not in ('Mới','Đã xử lý') then raise exception 'bad_status'; end if;
  update feedback set status = p_status where id = p_id and class_id = my_class();
end $$;
revoke execute on function set_feedback_status(bigint, text) from public, anon;
grant execute on function set_feedback_status(bigint, text) to authenticated;

-- Cập nhật tức thời cho các thành viên đang mở trang (bỏ qua nếu đã thêm)
do $$ begin
  alter publication supabase_realtime add table feedback;
exception when duplicate_object then null; end $$;
