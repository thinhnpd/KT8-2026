-- Tệp đính kèm cho bản tin tuần: lưu thật trên Supabase Storage để thành viên bấm tải về.
-- Chạy một lần trong Supabase > SQL Editor (sau update-14.sql, vì dùng hàm can_manage()).
-- Bucket riêng tư: không có đường dẫn công khai; ứng dụng cấp đường dẫn tạm khi người dùng bấm tải.
-- Đường dẫn tệp: <class_id>/<tuần>/<tên tệp>. Mọi thành viên trong lớp đọc được, chỉ admin / cán sự lớp tải lên và xoá.

insert into storage.buckets (id, name, public, file_size_limit)
values ('bulletin-files', 'bulletin-files', false, 10485760)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

drop policy if exists bulletin_files_read   on storage.objects;
drop policy if exists bulletin_files_insert on storage.objects;
drop policy if exists bulletin_files_delete on storage.objects;

create policy bulletin_files_read on storage.objects for select to authenticated
  using (bucket_id = 'bulletin-files' and (storage.foldername(name))[1] = my_class()::text);

create policy bulletin_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'bulletin-files' and (storage.foldername(name))[1] = my_class()::text and can_manage());

create policy bulletin_files_delete on storage.objects for delete to authenticated
  using (bucket_id = 'bulletin-files' and (storage.foldername(name))[1] = my_class()::text and can_manage());
