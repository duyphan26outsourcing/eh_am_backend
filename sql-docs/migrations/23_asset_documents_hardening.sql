-- =============================================================================
-- 23 — Siết kho tệp chứng từ (M03, UC-AST-06 — hardening từ security review). Chạy sau 22.
-- Không sửa migration 01–22.
-- =============================================================================

-- (M2) Chốt chặn thật ở tầng bucket: loại tệp + dung lượng tối đa. Client khai contentType/sizeBytes
--      chỉ để báo lỗi sớm; Storage mới là nơi ép buộc (upload vượt/sai loại sẽ bị Storage từ chối).
update storage.buckets
  set file_size_limit = 10485760,  -- 10MB
      allowed_mime_types = array[
        'application/pdf', 'image/jpeg', 'image/png', 'image/webp'
      ]
  where id = 'asset-documents';

-- (L3) asset_documents chỉ-ghi-thêm: chặn UPDATE/DELETE kể cả service_role (đúng nguyên tắc "không xoá
--      lịch sử"; GĐ1 chưa có gỡ chứng từ — khi làm sẽ là đổi-trạng-thái bằng migration mới, không xoá).
drop trigger if exists trg_asset_documents_append_only on public.asset_documents;
create trigger trg_asset_documents_append_only
  before update or delete on public.asset_documents
  for each row execute function public.tg_append_only();
