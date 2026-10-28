-- Thêm xem mã học sinh và tạo mã mời mới. Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây.
-- (Cài mới từ schema.sql hiện tại thì đã có sẵn, không cần chạy file này.)
-- ---------- Mã mời vào lớp: xem mã học sinh, tạo mã mới ----------
-- Mã học sinh là mã MỜI (để chia sẻ) nên lưu thêm bản đọc được, chỉ admin lấy được qua hàm bên dưới.
-- Mã quản trị chỉ lưu dạng băm: không xem lại được, chỉ tạo mã mới (hiện đúng một lần).
alter table class_secrets add column if not exists join_code_plain text;

create or replace function gen_class_code() returns text
language plpgsql volatile set search_path = public, extensions as $$
declare chars constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';   -- bỏ I, L, O, 0, 1 cho dễ đọc
        res text := ''; i int; b int;
begin
  for i in 1..12 loop
    b := get_byte(gen_random_bytes(1), 0);
    while b >= 248 loop b := get_byte(gen_random_bytes(1), 0); end loop;   -- 248 = 31 x 8, tránh lệch xác suất
    res := res || substr(chars, (b % 31) + 1, 1);
    if i in (4, 8) then res := res || '-'; end if;
  end loop;
  return res;                                                              -- dạng XXXX-XXXX-XXXX
end $$;

create or replace function get_join_code() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare code text;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  select join_code_plain into code from class_secrets where class_id = my_class();
  return code;                                                             -- null nếu chưa từng tạo mã xem được
end $$;

create or replace function rotate_join_code() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare code text := gen_class_code();
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  update class_secrets set join_code_hash = crypt(code, gen_salt('bf')), join_code_plain = code where class_id = my_class();
  if not found then raise exception 'no_secrets'; end if;
  return code;
end $$;

create or replace function rotate_admin_code() returns text
language plpgsql security definer set search_path = public, extensions as $$
declare code text := gen_class_code();
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  update class_secrets set admin_code_hash = crypt(code, gen_salt('bf')) where class_id = my_class();
  if not found then raise exception 'no_secrets'; end if;
  return code;
end $$;

revoke execute on function gen_class_code() from public, anon, authenticated;
revoke execute on function get_join_code(), rotate_join_code(), rotate_admin_code() from public, anon;
grant execute on function get_join_code(), rotate_join_code(), rotate_admin_code() to authenticated;
