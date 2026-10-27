-- =====================================================================
-- S Class: cấu trúc cơ sở dữ liệu cho Supabase (PostgreSQL)
-- Cách dùng: Supabase Dashboard > SQL Editor > dán toàn bộ file này > Run.
-- Bảo mật nằm ở Row Level Security (RLS): mọi bảng bật RLS, quyền ghi đi qua
-- chính sách hoặc hàm (RPC) bên dưới. Khóa "anon" trong mã web là công khai theo thiết kế.
-- =====================================================================
-- Trên Supabase, pgcrypto (hàm crypt, gen_salt) nằm trong schema "extensions", không phải "public".
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

-- ---------- Lớp, người dùng, danh sách học sinh ----------
create table classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  school text not null default '',
  color text not null default '#3D78C0',
  logo_url text,
  share_contacts boolean not null default false,   -- cho học sinh xem số điện thoại/email của nhau
  created_at timestamptz not null default now()
);
-- Mã lớp lưu dạng băm, tách bảng riêng và KHÔNG có chính sách đọc => trình duyệt không thể đọc
create table class_secrets (
  class_id uuid primary key references classes(id) on delete cascade,
  admin_code_hash text not null,                   -- mã quản trị lớp (đăng ký admin)
  join_code_hash text                              -- mã tham gia cho học sinh (có thể để trống)
);
create table students (                            -- danh sách lớp (có thể chưa có tài khoản)
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  full_name text not null,
  subject text not null default '',                -- môn học tốt
  talent text not null default '',
  unique (class_id, full_name)
);
create table student_contacts (
  student_id uuid primary key references students(id) on delete cascade,
  email text not null default '',
  phone text not null default ''
);
create table profiles (                            -- tài khoản đăng nhập
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  full_name text not null default '',
  role text not null check (role in ('admin','student')),
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid references students(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index profiles_student_uq on profiles(student_id) where student_id is not null;
create table teachers (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  name text not null, subject text not null default '',
  email text not null default '', phone text not null default '',
  is_homeroom boolean not null default false
);
create table committee (                           -- ban cán sự
  class_id uuid not null references classes(id) on delete cascade,
  position text not null,
  student_id uuid references students(id) on delete set null,
  primary key (class_id, position)
);

-- ---------- Thông báo ----------
create table notifications (
  id bigint generated always as identity primary key,
  class_id uuid not null references classes(id) on delete cascade,
  icon text not null default 'calendar-event',
  text text not null,
  page text not null default 'event',              -- trang mở khi bấm vào thông báo
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table notification_reads (
  notification_id bigint not null references notifications(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  primary key (notification_id, profile_id)
);

-- ---------- Nhóm học tập (mỗi môn một bộ nhóm riêng) ----------
create table group_sets (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  subject text not null check (subject in ('To','Va','An','Su')),   -- mã môn: To=Toán, Va=Ngữ Văn, An=Tiếng Anh, Su=Lịch sử
  method text not null check (method in ('lights','ball','manual')),
  is_current boolean not null default true,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create unique index group_sets_current_uq on group_sets(class_id, subject) where is_current;
create table study_groups (
  id uuid primary key default gen_random_uuid(),
  set_id uuid not null references group_sets(id) on delete cascade,
  group_no int not null, color text,
  unique (set_id, group_no)
);
create table study_group_members (
  group_id uuid not null references study_groups(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  primary key (group_id, student_id)
);

-- ---------- Bầu cử và phiếu bầu ----------
create table elections (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id) on delete cascade,
  title text not null,
  rounds int not null default 1 check (rounds between 1 and 6),
  advance int[] not null default '{}',             -- số người đi tiếp sau mỗi vòng (trừ vòng cuối)
  status text not null default 'open' check (status in ('open','closed')),
  deadline timestamptz,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table rounds (
  id uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  round_no int not null,
  kind text not null check (kind in ('main','mini')),
  need int not null,                               -- số người cần chọn ra
  status text not null default 'open' check (status in ('open','closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);
create table round_candidates (
  round_id uuid not null references rounds(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  final_votes int,                                 -- điền khi đóng vòng
  outcome text check (outcome in ('advance','out','tied','winner')),
  primary key (round_id, student_id)
);
-- Phiếu kín: bảng "ai đã bỏ phiếu" tách khỏi bảng "phiếu bầu cho ai" và không có thời gian,
-- nên không truy ngược được ai bầu cho ai. Mỗi học sinh một phiếu mỗi vòng (khóa chính).
create table ballot_receipts (
  round_id uuid not null references rounds(id) on delete cascade,
  voter_id uuid not null references profiles(id) on delete cascade,
  primary key (round_id, voter_id)
);
create table ballots (
  id bigint generated always as identity primary key,
  round_id uuid not null,
  student_id uuid not null,
  foreign key (round_id, student_id) references round_candidates(round_id, student_id) on delete cascade
);

-- ---------- Hàm hỗ trợ ----------
create function my_class() returns uuid language sql stable security definer set search_path = public, extensions as
$$ select class_id from profiles where id = auth.uid() $$;
create function is_admin() returns boolean language sql stable security definer set search_path = public, extensions as
$$ select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- ---------- Đăng ký (kiểm tra mã lớp ở máy chủ, không để trong mã web) ----------
create function check_class_code(p_class_name text, p_code text) returns boolean
language sql security definer set search_path = public, extensions as
$$ select exists (select 1 from classes c join class_secrets s on s.class_id = c.id
   where lower(c.name) = lower(trim(p_class_name)) and s.admin_code_hash = crypt(p_code, s.admin_code_hash)) $$;

create function register_class_admin(p_username text, p_full_name text, p_class_name text, p_code text) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid; uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select c.id into cid from classes c join class_secrets s on s.class_id = c.id
   where lower(c.name) = lower(trim(p_class_name)) and s.admin_code_hash = crypt(p_code, s.admin_code_hash);
  if cid is null then raise exception 'bad_class_code'; end if;
  insert into profiles(id, username, full_name, role, class_id)
   values (uid, lower(trim(p_username)), coalesce(p_full_name, ''), 'admin', cid);
  return cid;
end $$;

-- Học sinh: nhập mã tham gia và chọn đúng tên trong danh sách lớp (mỗi tên chỉ nhận một lần)
create function register_student(p_username text, p_class_name text, p_join_code text, p_student_id uuid) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid; uid uuid := auth.uid(); sname text;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select c.id into cid from classes c join class_secrets s on s.class_id = c.id
   where lower(c.name) = lower(trim(p_class_name)) and s.join_code_hash is not null
     and s.join_code_hash = crypt(p_join_code, s.join_code_hash);
  if cid is null then raise exception 'bad_class_code'; end if;
  select full_name into sname from students where id = p_student_id and class_id = cid;
  if sname is null then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  insert into profiles(id, username, full_name, role, class_id, student_id)
   values (uid, lower(trim(p_username)), sname, 'student', cid, p_student_id);
  return cid;
end $$;

-- Danh sách tên chưa có tài khoản, để học sinh chọn tên mình khi đăng ký (cần đúng mã tham gia)
create function list_class_students(p_class_name text, p_join_code text) returns table (id uuid, full_name text)
language sql stable security definer set search_path = public, extensions as
$$ select st.id, st.full_name from classes c
     join class_secrets s on s.class_id = c.id
     join students st on st.class_id = c.id
    where lower(c.name) = lower(trim(p_class_name)) and s.join_code_hash is not null
      and s.join_code_hash = crypt(p_join_code, s.join_code_hash)
      and not exists (select 1 from profiles p where p.student_id = st.id)
    order by st.full_name $$;

-- ---------- Nhóm học tập: lưu cả bộ nhóm cho một môn trong một lần ----------
-- p_groups = [{"no":1,"color":"#E5484D","members":["<id học sinh>", ...]}, ...]
create function save_group_set(p_subject text, p_method text, p_groups jsonb) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); sid uuid; gid uuid; g jsonb;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_subject not in ('To','Va','An','Su') then raise exception 'bad_subject'; end if;
  update group_sets set is_current = false where class_id = cid and subject = p_subject and is_current;
  insert into group_sets(class_id, subject, method, created_by) values (cid, p_subject, p_method, auth.uid()) returning id into sid;
  for g in select * from jsonb_array_elements(p_groups) loop
    insert into study_groups(set_id, group_no, color) values (sid, (g->>'no')::int, g->>'color') returning id into gid;
    insert into study_group_members(group_id, student_id)
      select gid, s.id from jsonb_array_elements_text(g->'members') m join students s on s.id = m::uuid and s.class_id = cid;
  end loop;
  return sid;
end $$;

-- ---------- Bầu cử: mở vòng, bỏ phiếu, đóng vòng ----------
create function open_round(p_election uuid, p_round_no int, p_kind text, p_need int, p_candidates uuid[]) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare rid uuid;
begin
  if not is_admin() or not exists (select 1 from elections where id = p_election and class_id = my_class()) then
    raise exception 'forbidden'; end if;
  insert into rounds(election_id, round_no, kind, need) values (p_election, p_round_no, p_kind, p_need) returning id into rid;
  insert into round_candidates(round_id, student_id)
    select rid, s.id from unnest(p_candidates) c join students s on s.id = c and s.class_id = my_class();
  return rid;
end $$;

create function cast_ballot(p_round uuid, p_candidate uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare r rounds; e elections;
begin
  select * into r from rounds where id = p_round;
  if not found then raise exception 'no_round'; end if;
  select * into e from elections where id = r.election_id;
  if e.class_id is distinct from my_class() then raise exception 'forbidden'; end if;
  if r.status <> 'open' then raise exception 'round_closed'; end if;
  insert into ballot_receipts(round_id, voter_id) values (p_round, auth.uid());   -- trùng khóa = đã bỏ phiếu rồi
  insert into ballots(round_id, student_id) values (p_round, p_candidate);
end $$;

-- Số người đã bỏ phiếu (không tiết lộ ai bầu cho ai)
create function round_progress(p_round uuid) returns int
language sql stable security definer set search_path = public, extensions as
$$ select count(*)::int from ballot_receipts br join rounds r on r.id = br.round_id join elections e on e.id = r.election_id
   where br.round_id = p_round and e.class_id = my_class() $$;

-- Đóng vòng: đếm phiếu ở máy chủ, ghi kết quả vào round_candidates, trả về bảng kết quả
create function close_round(p_round uuid) returns table (student_id uuid, votes int)
language plpgsql security definer set search_path = public, extensions as $$
begin
  if not is_admin() or not exists (select 1 from rounds r join elections e on e.id = r.election_id
       where r.id = p_round and e.class_id = my_class()) then raise exception 'forbidden'; end if;
  update rounds set status = 'closed', closed_at = now() where id = p_round and status = 'open';
  update round_candidates rc set final_votes = (select count(*) from ballots b where b.round_id = rc.round_id and b.student_id = rc.student_id)
   where rc.round_id = p_round;
  return query select rc.student_id, rc.final_votes from round_candidates rc where rc.round_id = p_round order by rc.final_votes desc;
end $$;

-- ---------- Tài khoản: đổi tên hiển thị ----------
-- Đổi tên hiển thị của chính mình (chỉ sửa cột full_name, không ai sửa được vai trò hay lớp của mình)
create or replace function set_display_name(p_name text) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then raise exception 'not_authenticated'; end if;
  p_name := trim(coalesce(p_name, ''));
  if length(p_name) < 1 or length(p_name) > 60 then raise exception 'bad_name'; end if;
  update profiles set full_name = p_name where id = auth.uid();
end $$;
revoke execute on function set_display_name(text) from public, anon;
grant execute on function set_display_name(text) to authenticated;

-- ---------- Sơ đồ lớp (mỗi lớp một sơ đồ đã xác nhận) ----------
create table if not exists class_maps (
  class_id uuid primary key references classes(id) on delete cascade,
  n_rows int not null check (n_rows between 1 and 12),
  n_cols int not null check (n_cols between 1 and 12),
  seats_per_desk int not null check (seats_per_desk between 1 and 6),
  arrange_gender boolean not null default false,
  arrange_random boolean not null default false,
  layout jsonb not null,                 -- [[id học sinh hoặc null, ...], ...] mỗi bàn một mảng
  updated_by uuid references profiles(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table class_maps enable row level security;
drop policy if exists class_maps_read on class_maps;
create policy class_maps_read on class_maps for select using (class_id = my_class());   -- ghi chỉ qua hàm bên dưới

-- Lưu sơ đồ: chỉ admin; kiểm tra kích thước; id không thuộc lớp hoặc bị trùng sẽ thành chỗ trống
create or replace function save_class_map(p_rows int, p_cols int, p_spd int, p_ag boolean, p_rnd boolean, p_layout jsonb) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); clean jsonb := '[]'::jsonb; desk jsonb; seat jsonb; ds jsonb; sid text; seen text[] := '{}';
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_rows not between 1 and 12 or p_cols not between 1 and 12 or p_spd not between 1 and 6 then raise exception 'bad_size'; end if;
  if jsonb_typeof(p_layout) is distinct from 'array' or jsonb_array_length(p_layout) > p_rows * p_cols then raise exception 'bad_layout'; end if;
  for desk in select value from jsonb_array_elements(p_layout) loop
    if jsonb_typeof(desk) is distinct from 'array' or jsonb_array_length(desk) > p_spd then raise exception 'bad_layout'; end if;
    ds := '[]'::jsonb;
    for seat in select value from jsonb_array_elements(desk) loop
      sid := case when jsonb_typeof(seat) = 'string' then seat #>> '{}' end;
      if sid is not null and not (sid = any (seen)) and exists (select 1 from students where id::text = sid and class_id = cid) then
        ds := ds || to_jsonb(sid); seen := seen || sid;
      else
        ds := ds || 'null'::jsonb;
      end if;
    end loop;
    clean := clean || jsonb_build_array(ds);
  end loop;
  insert into class_maps(class_id, n_rows, n_cols, seats_per_desk, arrange_gender, arrange_random, layout, updated_by, updated_at)
    values (cid, p_rows, p_cols, p_spd, coalesce(p_ag, false), coalesce(p_rnd, false), clean, auth.uid(), now())
  on conflict (class_id) do update set n_rows = excluded.n_rows, n_cols = excluded.n_cols, seats_per_desk = excluded.seats_per_desk,
    arrange_gender = excluded.arrange_gender, arrange_random = excluded.arrange_random, layout = excluded.layout,
    updated_by = excluded.updated_by, updated_at = excluded.updated_at;
end $$;
revoke execute on function save_class_map(int, int, int, boolean, boolean, jsonb) from public, anon;
grant execute on function save_class_map(int, int, int, boolean, boolean, jsonb) to authenticated;

-- ---------- Row Level Security ----------
alter table classes enable row level security;
alter table class_secrets enable row level security;      -- không có chính sách nào: chỉ hàm security definer đọc được
alter table students enable row level security;
alter table student_contacts enable row level security;
alter table profiles enable row level security;
alter table teachers enable row level security;
alter table committee enable row level security;
alter table notifications enable row level security;
alter table notification_reads enable row level security;
alter table group_sets enable row level security;
alter table study_groups enable row level security;
alter table study_group_members enable row level security;
alter table elections enable row level security;
alter table rounds enable row level security;
alter table round_candidates enable row level security;
alter table ballot_receipts enable row level security;    -- không có chính sách: chỉ cast_ballot ghi được
alter table ballots enable row level security;            -- không có chính sách: không ai đọc được từng phiếu

create policy classes_read on classes for select using (id = my_class());
create policy classes_admin_update on classes for update using (id = my_class() and is_admin());

create policy students_read on students for select using (class_id = my_class());
create policy students_admin on students for all using (class_id = my_class() and is_admin()) with check (class_id = my_class() and is_admin());

create policy contacts_read on student_contacts for select using (
  exists (select 1 from students s where s.id = student_id and s.class_id = my_class()
    and (is_admin() or s.id = (select student_id from profiles where id = auth.uid())
         or (select share_contacts from classes where id = s.class_id))));
create policy contacts_admin on student_contacts for all using (
  is_admin() and exists (select 1 from students s where s.id = student_id and s.class_id = my_class()))
  with check (is_admin() and exists (select 1 from students s where s.id = student_id and s.class_id = my_class()));

create policy profiles_read on profiles for select using (class_id = my_class());

create policy teachers_read on teachers for select using (class_id = my_class());
create policy teachers_admin on teachers for all using (class_id = my_class() and is_admin()) with check (class_id = my_class() and is_admin());
create policy committee_read on committee for select using (class_id = my_class());
create policy committee_admin on committee for all using (class_id = my_class() and is_admin()) with check (class_id = my_class() and is_admin());

create policy notif_read on notifications for select using (class_id = my_class());
create policy notif_admin_insert on notifications for insert with check (class_id = my_class() and is_admin());
create policy notif_admin_delete on notifications for delete using (class_id = my_class() and is_admin());
create policy nreads_own on notification_reads for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy gsets_read on group_sets for select using (class_id = my_class());
create policy sgroups_read on study_groups for select using (exists (select 1 from group_sets g where g.id = set_id and g.class_id = my_class()));
create policy sgmembers_read on study_group_members for select using (exists (
  select 1 from study_groups sg join group_sets g on g.id = sg.set_id where sg.id = group_id and g.class_id = my_class()));

create policy elections_read on elections for select using (class_id = my_class());
create policy elections_admin on elections for all using (class_id = my_class() and is_admin()) with check (class_id = my_class() and is_admin());
create policy rounds_read on rounds for select using (exists (select 1 from elections e where e.id = election_id and e.class_id = my_class()));
create policy rcands_read on round_candidates for select using (exists (
  select 1 from rounds r join elections e on e.id = r.election_id where r.id = round_id and e.class_id = my_class()));
create policy rcands_admin_update on round_candidates for update using (is_admin() and exists (
  select 1 from rounds r join elections e on e.id = r.election_id where r.id = round_id and e.class_id = my_class()));

-- ---------- Quyền gọi hàm ----------
revoke execute on all functions in schema public from public;
grant execute on function check_class_code(text, text) to anon, authenticated;
grant execute on function register_class_admin(text, text, text, text) to authenticated;
grant execute on function register_student(text, text, text, uuid) to authenticated;
grant execute on function list_class_students(text, text) to anon, authenticated;
grant execute on function save_group_set(text, text, jsonb) to authenticated;
grant execute on function open_round(uuid, int, text, int, uuid[]) to authenticated;
grant execute on function cast_ballot(uuid, uuid) to authenticated;
grant execute on function round_progress(uuid) to authenticated;
grant execute on function close_round(uuid) to authenticated;
grant execute on function my_class() to authenticated;
grant execute on function is_admin() to authenticated;

-- ---------- Cập nhật tức thời (Realtime) ----------
alter publication supabase_realtime add table notifications, rounds, elections;

-- ---------- Ví dụ tạo lớp đầu tiên (chạy tay trong SQL Editor, đổi mã cho riêng bạn) ----------
-- with c as (insert into classes(name, school) values ('10A5', 'THPT Chuyên Lê Quý Đôn') returning id)
-- insert into class_secrets(class_id, admin_code_hash, join_code_hash)
--   select id, crypt('MA-QUAN-TRI-DAI-VA-NGAU-NHIEN', gen_salt('bf')), crypt('MA-HOC-SINH-KHAC', gen_salt('bf')) from c;

-- ---------- Kiểm tra: danh sách bảng vừa tạo (phải có đúng 18 dòng trong bảng kết quả) ----------
select tablename from pg_tables where schemaname = 'public' order by tablename;
