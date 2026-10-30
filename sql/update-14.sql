-- Vai trò "Cán sự lớp" (manager): thấp hơn admin, cao hơn thành viên.
--   admin     : sửa mọi thứ, bổ nhiệm admin / cán sự lớp, đổi cài đặt lớp.
--   manager   : chỉ sửa được bản tin tuần (sự kiện, tin ghim, nhắc nhở, trực nhật); KHÔNG đổi cài đặt lớp, KHÔNG bổ nhiệm ai.
--   student   : thành viên, chỉ xem và sửa hồ sơ của mình.
-- Chạy một lần trong Supabase > SQL Editor, SAU update-5.sql, update-10.sql và update-11.sql.

-- 1) Tài khoản có thêm vai trò manager
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check check (role in ('admin','manager','student'));

-- 2) Học sinh trong danh sách có thể được bổ nhiệm cán sự lớp trước khi có tài khoản (giống cờ is_admin)
alter table students add column if not exists is_manager boolean not null default false;

-- 3) Quyền sửa bản tin tuần: admin hoặc cán sự lớp
create or replace function can_manage() returns boolean language sql stable security definer set search_path = public, extensions as
$$ select exists (select 1 from profiles where id = auth.uid() and role in ('admin','manager')) $$;
revoke execute on function can_manage() from public, anon;
grant execute on function can_manage() to authenticated;

drop policy if exists class_weeks_admin on class_weeks;
drop policy if exists class_weeks_manage on class_weeks;
create policy class_weeks_manage on class_weeks for all
  using (class_id = my_class() and can_manage()) with check (class_id = my_class() and can_manage());

-- 4) Phân vai trò: chỉ admin (máy chủ kiểm tra), lớp phải còn ít nhất một admin có tài khoản
create or replace function set_student_role(p_student_id uuid, p_role text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); others int;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_role not in ('admin','manager','student') then raise exception 'bad_role'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if p_role <> 'admin' then
    select count(*) into others from profiles where class_id = cid and role = 'admin' and student_id is distinct from p_student_id;
    if others = 0 then raise exception 'last_admin'; end if;
  end if;
  update students set is_admin = (p_role = 'admin'), is_manager = (p_role = 'manager') where id = p_student_id;
  update profiles set role = p_role where student_id = p_student_id;
end $$;
revoke execute on function set_student_role(uuid, text) from public, anon;
grant execute on function set_student_role(uuid, text) to authenticated;

-- Hàm cũ giữ lại cho tương thích, nay dùng chung logic mới
create or replace function set_student_admin(p_student_id uuid, p_admin boolean) returns void
language plpgsql security definer set search_path = public, extensions as $$
begin
  perform set_student_role(p_student_id, case when p_admin then 'admin' else 'student' end);
end $$;

-- 5) Đăng ký / gắn tài khoản: nhận đúng vai trò đã được bổ nhiệm từ trước
create or replace function register_student(p_username text, p_class_name text, p_join_code text, p_student_id uuid) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid; uid uuid := auth.uid(); sname text; sadm boolean; smgr boolean;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select c.id into cid from classes c join class_secrets s on s.class_id = c.id
   where lower(c.name) = lower(trim(p_class_name)) and s.join_code_hash is not null
     and s.join_code_hash = crypt(p_join_code, s.join_code_hash);
  if cid is null then raise exception 'bad_class_code'; end if;
  select full_name, is_admin, is_manager into sname, sadm, smgr from students where id = p_student_id and class_id = cid;
  if sname is null then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  insert into profiles(id, username, full_name, role, class_id, student_id)
   values (uid, lower(trim(p_username)), sname, case when sadm then 'admin' when smgr then 'manager' else 'student' end, cid, p_student_id);
  return cid;
end $$;

create or replace function admin_link_student(p_uid uuid, p_username text, p_student_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); uname text := lower(trim(p_username));
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if uname !~ '^[a-z0-9._-]{3,30}$' then raise exception 'bad_username'; end if;
  if not exists (select 1 from auth.users where id = p_uid and lower(split_part(email, '@', 1)) = uname
                   and created_at > now() - interval '10 minutes') then raise exception 'no_user'; end if;
  if exists (select 1 from profiles where id = p_uid) then raise exception 'user_has_profile'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  insert into profiles(id, username, full_name, role, class_id, student_id)
    select p_uid, uname, s.full_name, case when s.is_admin then 'admin' when s.is_manager then 'manager' else 'student' end, cid, s.id
    from students s where s.id = p_student_id;
end $$;

-- Admin tự gắn tài khoản vào một tên trong danh sách: giữ cờ admin, bỏ cờ cán sự lớp nếu có
create or replace function link_my_student(p_student_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid(); cid uuid := my_class();
begin
  if uid is null or cid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from profiles where id = uid and student_id is not null) then raise exception 'already_linked'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  update profiles set student_id = p_student_id where id = uid;
  update students set is_admin = true, is_manager = false
   where id = p_student_id and exists (select 1 from profiles where id = uid and role = 'admin');
end $$;
