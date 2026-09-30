-- =============================================================================
-- MIGRATION 02c: BỔ SUNG CỘT `version` CHO DANH MỤC NỀN (khoá lạc quan)
-- =============================================================================
--
-- ⚠️ VÌ SAO TÁCH RA MIGRATION RIÊNG
--
-- Migration 02 bản đầu (đã chạy trên môi trường dev) chưa có cột `version`. Theo quy tắc
-- "không sửa migration đã chạy" (sql-docs/README.md), thêm cột bằng một migration mới thay vì
-- sửa 02. Cột này cần cho khoá lạc quan ở UC-MDM-01.EX.4 (hai người sửa cùng một bản ghi) và
-- được hàm `update_location` (migration 02b) dùng ở `where version = p_expected_version`.
--
-- ⚠️ PHỤ THUỘC: chạy SAU `02_master_data.sql`. Idempotent (`add column if not exists`).
-- Chạy xong nhớ `npm run gen:types`.
-- =============================================================================

alter table public.cost_centers add column if not exists version integer not null default 1;
alter table public.locations    add column if not exists version integer not null default 1;
alter table public.departments  add column if not exists version integer not null default 1;
alter table public.reason_codes add column if not exists version integer not null default 1;
