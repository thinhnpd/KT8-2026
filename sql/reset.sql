-- XÓA toàn bộ bảng và hàm của S Class (và mọi dữ liệu trong các bảng đó). Chỉ dùng khi chạy schema.sql bị lỗi giữa chừng
-- hoặc muốn làm lại từ đầu. Tài khoản đăng nhập trong Authentication > Users không bị xóa; hãy xóa tay các tài khoản thử nghiệm.
drop table if exists ballots, ballot_receipts, round_candidates, rounds, elections,
  study_group_members, study_groups, group_sets, notification_reads, notifications,
  committee, teachers, profiles, student_contacts, students, class_secrets, classes, class_maps cascade;
drop function if exists my_class(), is_admin(), check_class_code(text, text),
  register_class_admin(text, text, text, text), register_student(text, text, text, uuid),
  list_class_students(text, text), save_group_set(text, text, jsonb),
  open_round(uuid, int, text, int, uuid[]), cast_ballot(uuid, uuid), round_progress(uuid), close_round(uuid),
  set_display_name(text), save_class_map(int, int, int, boolean, boolean, jsonb),
  gen_class_code(), get_join_code(), rotate_join_code(), rotate_admin_code(),
  round_vote_status(uuid), link_my_student(uuid) cascade;
