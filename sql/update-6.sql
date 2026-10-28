-- Bỏ phiếu trực tuyến: học sinh tự bỏ phiếu, admin chỉ theo dõi và bỏ phiếu cho chính mình.
-- Chạy một lần trong Supabase > SQL Editor nếu bạn ĐÃ chạy schema.sql trước đây.
-- (Cài mới từ schema.sql hiện tại thì đã có sẵn, không cần chạy file này.)

-- 1) Trạng thái cuộc bầu (ứng viên, luật, vòng hiện tại, người đã đi tiếp, lịch sử kết quả).
--    Chỉ admin ghi được (chính sách elections_admin có sẵn); cả lớp đọc được. Không chứa phiếu của từng người.
alter table elections add column if not exists state jsonb not null default '{}'::jsonb;

-- 2) Mỗi lớp chỉ có một cuộc bầu đang mở tại một thời điểm (hai admin cùng bấm "Bắt đầu" thì người sau bị từ chối)
create unique index if not exists elections_one_open on elections(class_id) where status = 'open';

-- 3) Mỗi tài khoản đọc được dòng "đã bỏ phiếu" của chính mình (để biết đã bỏ phiếu ở vòng này chưa).
--    Bảng này không ghi bạn chọn ai, và không ai đọc được dòng của người khác.
drop policy if exists receipts_own on ballot_receipts;
create policy receipts_own on ballot_receipts for select using (voter_id = auth.uid());
