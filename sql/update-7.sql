-- Tạo tài khoản học sinh hàng loạt (admin). Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây.
-- (Cài mới từ schema.sql hiện tại thì đã có sẵn, không cần chạy file này.)
--
-- Trình duyệt của admin tạo từng tài khoản đăng nhập bằng một kết nối phụ (không đụng tới phiên đăng nhập của admin),
-- rồi gọi hàm này để gắn tài khoản đó vào đúng học sinh trong lớp. Không cần khóa service_role.
create or replace function admin_link_student(p_uid uuid, p_username text, p_student_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); uname text := lower(trim(p_username));
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if uname !~ '^[a-z0-9._-]{3,30}$' then raise exception 'bad_username'; end if;
  -- chỉ gắn tài khoản vừa tạo (trong 10 phút) và đúng tên đăng nhập, để không gắn nhầm tài khoản người khác
  if not exists (select 1 from auth.users where id = p_uid and lower(split_part(email, '@', 1)) = uname
                   and created_at > now() - interval '10 minutes') then raise exception 'no_user'; end if;
  if exists (select 1 from profiles where id = p_uid) then raise exception 'user_has_profile'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  insert into profiles(id, username, full_name, role, class_id, student_id)
    select p_uid, uname, s.full_name, 'student', cid, s.id from students s where s.id = p_student_id;
end $$;
revoke execute on function admin_link_student(uuid, text, uuid) from public, anon;
grant execute on function admin_link_student(uuid, text, uuid) to authenticated;
