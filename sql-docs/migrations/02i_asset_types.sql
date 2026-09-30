-- =============================================================================
-- MIGRATION 02i: BẢNG CÂY LOẠI TÀI SẢN (M02 — UC-MDM-04, F-MDM-04)
-- =============================================================================
--
-- Cây HAI CẤP: nhóm (cấp 1) → loại (cấp 2), gộp trong MỘT bảng tự tham chiếu `parent_id`.
--   · Nhóm:  `parent_id IS NULL`, `asset_kind IS NULL` (nhóm không mang cờ TSCĐ/CCDC).
--   · Loại:  `parent_id` trỏ tới một nhóm, `asset_kind` bắt buộc (TSCĐ hoặc CCDC).
-- CHECK `asset_types_level_check` buộc đúng ngữ nghĩa này. Ràng buộc "cha phải là NHÓM" (không
-- lồng 3 cấp) kiểm ở RPC (02j) vì cần đọc dòng cha — CHECK cột không làm được.
--
-- ⚠️ HAI QUY TẮC XUYÊN SUỐT DANH MỤC NỀN (như 02):
--   1. KHÔNG XOÁ, chỉ NGỪNG (BR-MDM-02): cột `status` ACTIVE/INACTIVE.
--   2. MÃ DUY NHẤT TOÀN BẢNG, KHÔNG DÙNG LẠI (BR-MDM-01): `code` in hoa + btrim + UNIQUE, kể cả
--      mục đã ngừng. Nhóm và loại dùng chung không gian mã (BR-MDM-14).
--
-- ⚠️ `asset_kind` (TSCĐ/CCDC) của loại ĐÃ CÓ TÀI SẢN không được đổi (BR-MDM-06); phép kiểm này
-- cần bảng tài sản (M03) nên HOÃN — xem 02j. `serial_required` đổi được, chỉ áp cho hồ sơ lập sau
-- (UC-MDM-04 Giả định 6).
--
-- ⚠️ `useful_life_months`: thời gian sử dụng tham khảo. Đơn vị (năm hay tháng) còn [TBD-3]; lưu số
-- nguyên dương, tạm hiểu là THÁNG, không bắt buộc ở GĐ1. Không dùng cho tính khấu hao ở GĐ1 (M09).
--
-- ⚠️ PHỤ THUỘC: chạy SAU 01 (dùng `user_profiles`, `tg_set_updated_at`). Idempotent. Chạy xong
-- `npm run gen:types`.
-- =============================================================================

create table if not exists public.asset_types (
  id                  uuid primary key default gen_random_uuid(),
  -- NULL = nhóm (cấp 1); trỏ tới một nhóm = loại (cấp 2). Không FK on delete cascade: danh mục
  -- không xoá cứng, chỉ ngừng.
  parent_id           uuid references public.asset_types (id),
  code                text not null
                        check (code = upper(btrim(code))
                               and length(code) between 1 and 40),
  name                text not null check (length(btrim(name)) >= 1),
  -- Cờ TSCĐ/CCDC: chỉ loại (lá) mới có; nhóm để NULL. FIXED_ASSET = TSCĐ, TOOL = CCDC.
  asset_kind          text
                        check (asset_kind in ('FIXED_ASSET', 'TOOL')),
  -- Bắt buộc nhập serial khi lập hồ sơ tài sản của loại này (BR-AST-02). Nhóm luôn false.
  serial_required     boolean not null default false,
  -- Thời gian sử dụng tham khảo (đơn vị [TBD-3], tạm tháng); số nguyên dương nếu có.
  useful_life_months  integer check (useful_life_months is null or useful_life_months > 0),
  -- Mã nhóm tài sản bên FAST để GĐ2 đối chiếu; không bắt buộc GĐ1.
  fast_group_code     text
                        check (fast_group_code is null
                               or (fast_group_code = upper(btrim(fast_group_code))
                                   and length(fast_group_code) between 1 and 20)),
  status              text not null default 'ACTIVE'
                        check (status in ('ACTIVE', 'INACTIVE')),
  version             integer not null default 1,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.user_profiles (id) on delete set null,
  updated_by          uuid references public.user_profiles (id) on delete set null,
  -- Nhóm không mang cờ TSCĐ/CCDC; loại bắt buộc có (UC-MDM-04 hậu ĐK 1, EX.1).
  constraint asset_types_level_check check (
    (parent_id is null and asset_kind is null)
    or (parent_id is not null and asset_kind is not null)
  )
);

create unique index if not exists uq_asset_types_code
  on public.asset_types (code);
create index if not exists idx_asset_types_parent
  on public.asset_types (parent_id, status);
create index if not exists idx_asset_types_status
  on public.asset_types (status);

drop trigger if exists trg_asset_types_updated_at on public.asset_types;
create trigger trg_asset_types_updated_at
  before update on public.asset_types
  for each row execute function public.tg_set_updated_at();

-- RLS bật, không policy = deny-by-default cho anon key (backend dùng service_role, quyền ở guard).
alter table public.asset_types enable row level security;
