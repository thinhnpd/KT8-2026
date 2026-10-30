-- Bổ nhiệm admin trong hộp 'Chỉnh sửa thành viên' + lưu hồ sơ học sinh vào cơ sở dữ liệu.
-- Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây. (Cài mới từ schema.sql hiện tại thì đã có sẵn.)
alter table students add column if not exists is_admin boolean not null default false;
update students s set is_admin = true from profiles p where p.student_id = s.id and p.role = 'admin';   -- đồng bộ các admin hiện có

create or replace function register_student(p_username text, p_class_name text, p_join_code text, p_student_id uuid) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid; uid uuid := auth.uid(); sname text; sadm boolean;
begin
  if uid is null then raise exception 'not_authenticated'; end if;
  select c.id into cid from classes c join class_secrets s on s.class_id = c.id
   where lower(c.name) = lower(trim(p_class_name)) and s.join_code_hash is not null
     and s.join_code_hash = crypt(p_join_code, s.join_code_hash);
  if cid is null then raise exception 'bad_class_code'; end if;
  select full_name, is_admin into sname, sadm from students where id = p_student_id and class_id = cid;
  if sname is null then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  insert into profiles(id, username, full_name, role, class_id, student_id)
   values (uid, lower(trim(p_username)), sname, case when sadm then 'admin' else 'student' end, cid, p_student_id);   -- đã được bổ nhiệm admin từ trước thì thành admin ngay
  return cid;
end $$;

create or replace function link_my_student(p_student_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid(); cid uuid := my_class();
begin
  if uid is null or cid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from profiles where id = uid and student_id is not null) then raise exception 'already_linked'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  update profiles set student_id = p_student_id where id = uid;
  update students set is_admin = true where id = p_student_id and exists (select 1 from profiles where id = uid and role = 'admin');   -- giữ cờ admin của danh sách khớp với tài khoản
end $$;

-- ---------- Admin lớp: bổ nhiệm / bãi nhiệm và sửa hồ sơ học sinh ----------
-- Cờ is_admin nằm ở học sinh trong danh sách (để bổ nhiệm được cả người chưa có tài khoản).
-- Khi người đó đã có tài khoản thì vai trò của tài khoản đổi ngay; chưa có thì thành admin lúc đăng ký.
create or replace function set_student_admin(p_student_id uuid, p_admin boolean) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); others int;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if not p_admin then   -- lớp phải còn ít nhất một admin có tài khoản
    select count(*) into others from profiles where class_id = cid and role = 'admin' and student_id is distinct from p_student_id;
    if others = 0 then raise exception 'last_admin'; end if;
  end if;
  update students set is_admin = p_admin where id = p_student_id;
  update profiles set role = case when p_admin then 'admin' else 'student' end where student_id = p_student_id;
end $$;

-- Sửa hồ sơ một học sinh: admin sửa được mọi người (kể cả đổi tên); học sinh chỉ sửa hồ sơ của mình và không đổi được tên
create or replace function update_student_info(p_student_id uuid, p_name text, p_email text, p_phone text, p_subject text, p_talent text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); mine uuid; cur_name text; nm text := regexp_replace(trim(coalesce(p_name, '')), '\s+', ' ', 'g');
begin
  if cid is null then raise exception 'not_authenticated'; end if;
  select full_name into cur_name from students where id = p_student_id and class_id = cid;
  if cur_name is null then raise exception 'bad_student'; end if;
  if not is_admin() then
    select student_id into mine from profiles where id = auth.uid();
    if mine is distinct from p_student_id or nm <> cur_name then raise exception 'forbidden'; end if;
  end if;
  if length(nm) < 1 or length(nm) > 80 then raise exception 'bad_name'; end if;
  update students set full_name = nm, subject = left(coalesce(p_subject, ''), 60), talent = left(coalesce(p_talent, ''), 120) where id = p_student_id;
  insert into student_contacts(student_id, email, phone) values (p_student_id, left(coalesce(p_email, ''), 120), left(coalesce(p_phone, ''), 20))
    on conflict (student_id) do update set email = excluded.email, phone = excluded.phone;
end $$;
revoke execute on function set_student_admin(uuid, boolean), update_student_info(uuid, text, text, text, text, text) from public, anon;
grant execute on function set_student_admin(uuid, boolean), update_student_info(uuid, text, text, text, text, text) to authenticated;
