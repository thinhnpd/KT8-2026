-- Mỗi bộ nhóm học tập gắn với một môn, lưu bằng mã: To = Toán, Va = Ngữ Văn, An = Tiếng Anh, Su = Lịch sử.
-- Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây.
-- (Cài mới từ schema.sql hiện tại thì đã có sẵn, không cần chạy file này.)

-- 1) Đổi tên môn cũ sang mã (dữ liệu đã lưu được giữ lại)
update group_sets set subject = case subject
  when 'Toán' then 'To' when 'Ngữ văn' then 'Va' when 'Tiếng Anh' then 'An' when 'Lịch sử' then 'Su'
  else subject end;

-- 2) Chỉ cho phép 4 mã. "not valid": dòng cũ của môn khác (Vật lý, Hoá học, Sinh học) vẫn được giữ, nhưng không thể thêm mới
alter table group_sets drop constraint if exists group_sets_subject_chk;
alter table group_sets add constraint group_sets_subject_chk check (subject in ('To','Va','An','Su')) not valid;

-- 3) Hàm lưu: từ chối mã môn không hợp lệ
create or replace function save_group_set(p_subject text, p_method text, p_groups jsonb) returns uuid
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
