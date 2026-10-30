-- Đổi mã môn: Tiếng Anh An -> Anh, Âm nhạc Am -> An; thêm Tiếng Pháp = Ph.
-- Mã môn sau khi chạy: To, Va, Anh, Su, Ly, Ho, Si, Ti, Cn, Di, Kt, An (Âm nhạc), Mt, Ph.
-- Chạy một lần trong Supabase > SQL Editor, SAU update-4.sql. Không cần chạy update-12.sql (file này đã bao gồm nó).
-- Thứ tự quan trọng: phải đổi An -> Anh trước, rồi mới đổi Am -> An.

alter table group_sets drop constraint if exists group_sets_subject_chk;

update group_sets set subject = 'Anh' where subject = 'An';
update group_sets set subject = 'An' where subject = 'Am';

alter table group_sets add constraint group_sets_subject_chk
  check (subject in ('To','Va','Anh','Su','Ly','Ho','Si','Ti','Cn','Di','Kt','An','Mt','Ph')) not valid;   -- not valid: giữ dòng cũ chưa đổi mã, chỉ kiểm tra dữ liệu mới

create or replace function save_group_set(p_subject text, p_method text, p_groups jsonb) returns uuid
language plpgsql security definer set search_path = public, extensions as $$
declare cid uuid := my_class(); sid uuid; gid uuid; g jsonb;
begin
  if not is_admin() then raise exception 'forbidden'; end if;
  if p_subject not in ('To','Va','Anh','Su','Ly','Ho','Si','Ti','Cn','Di','Kt','An','Mt','Ph') then raise exception 'bad_subject'; end if;
  update group_sets set is_current = false where class_id = cid and subject = p_subject and is_current;
  insert into group_sets(class_id, subject, method, created_by) values (cid, p_subject, p_method, auth.uid()) returning id into sid;
  for g in select * from jsonb_array_elements(p_groups) loop
    insert into study_groups(set_id, group_no, color) values (sid, (g->>'no')::int, g->>'color') returning id into gid;
    insert into study_group_members(group_id, student_id)
      select gid, s.id from jsonb_array_elements_text(g->'members') m join students s on s.id = m::uuid and s.class_id = cid;
  end loop;
  return sid;
end $$;
