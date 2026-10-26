-- Thêm lưu sơ đồ lớp. Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây.
-- (Cài mới từ schema.sql hiện tại thì đã có sẵn, không cần chạy file này.)
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
