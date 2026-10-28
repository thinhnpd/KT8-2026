-- Quy tắc: ứng viên không được bỏ phiếu ở vòng mà mình đang là ứng viên + liên kết tài khoản với tên trong danh sách lớp.
-- Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây. (Cài mới từ schema.sql hiện tại thì đã có sẵn.)
-- Bỏ phiếu: ứng viên của chính vòng này KHÔNG được bỏ phiếu; tài khoản chưa liên kết với tên trong danh sách lớp cũng không được
-- (vì không biết họ có phải ứng viên hay không). Ứng viên đã bị loại ở vòng sau thì bỏ phiếu được ở các vòng mà họ không còn là ứng viên.
create or replace function cast_ballot(p_round uuid, p_candidate uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare r rounds; e elections; sid uuid;
begin
  select * into r from rounds where id = p_round;
  if not found then raise exception 'no_round'; end if;
  select * into e from elections where id = r.election_id;
  if e.class_id is distinct from my_class() then raise exception 'forbidden'; end if;
  if r.status <> 'open' then raise exception 'round_closed'; end if;
  select student_id into sid from profiles where id = auth.uid();
  if sid is null then raise exception 'not_linked'; end if;
  if exists (select 1 from round_candidates where round_id = p_round and student_id = sid) then
    raise exception 'candidate_cannot_vote';
  end if;
  insert into ballot_receipts(round_id, voter_id) values (p_round, auth.uid());   -- trùng khóa = đã bỏ phiếu rồi
  insert into ballots(round_id, student_id) values (p_round, p_candidate);
end $$;

-- Trạng thái của tôi trong một vòng, để giao diện báo lý do: ok | voted | candidate | not_linked | closed | forbidden | no_round
create or replace function round_vote_status(p_round uuid) returns text
language plpgsql stable security definer set search_path = public, extensions as $$
declare r rounds; e elections; sid uuid;
begin
  select * into r from rounds where id = p_round;
  if not found then return 'no_round'; end if;
  select * into e from elections where id = r.election_id;
  if e.class_id is distinct from my_class() then return 'forbidden'; end if;
  if r.status <> 'open' then return 'closed'; end if;
  select student_id into sid from profiles where id = auth.uid();
  if sid is null then return 'not_linked'; end if;
  if exists (select 1 from round_candidates where round_id = p_round and student_id = sid) then return 'candidate'; end if;
  if exists (select 1 from ballot_receipts where round_id = p_round and voter_id = auth.uid()) then return 'voted'; end if;
  return 'ok';
end $$;

-- Liên kết tài khoản (thường là admin, vì học sinh đã liên kết khi đăng ký) với đúng tên trong danh sách lớp. Chỉ một lần.
create or replace function link_my_student(p_student_id uuid) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare uid uuid := auth.uid(); cid uuid := my_class();
begin
  if uid is null or cid is null then raise exception 'not_authenticated'; end if;
  if exists (select 1 from profiles where id = uid and student_id is not null) then raise exception 'already_linked'; end if;
  if not exists (select 1 from students where id = p_student_id and class_id = cid) then raise exception 'bad_student'; end if;
  if exists (select 1 from profiles where student_id = p_student_id) then raise exception 'student_taken'; end if;
  update profiles set student_id = p_student_id where id = uid;
end $$;
revoke execute on function round_vote_status(uuid), link_my_student(uuid) from public, anon;
grant execute on function round_vote_status(uuid), link_my_student(uuid), cast_ballot(uuid, uuid) to authenticated;
