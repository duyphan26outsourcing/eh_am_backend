-- =============================================================================
-- EVERY HALF · ASSET MANAGEMENT — MIGRATION 02: DANH MỤC NỀN (M02, phần lõi)
-- =============================================================================
--
-- Danh mục nền dùng chung cho các module sau. Migration này tạo phần LÕI cần cho luồng
-- tài khoản/nhân sự (M01) và làm nền kế toán: cost center, location, phòng ban, danh mục
-- lý do. Các danh mục thiên về tài sản (loại tài sản, nhà cung cấp, đơn vị sửa chữa) để
-- một migration sau cùng M03.
--
-- Nguồn: blueprint §14.2 (M02), brief B-01, B-05, B-07, B-18. UC: UC-MDM-01, 03, 07, 08.
--
-- ⚠️ PHỤ THUỘC: phải chạy SAU `01_identity_rbac_audit.sql` (dùng `public.user_profiles`,
-- hàm `public.tg_set_updated_at`, extension pgcrypto). Chạy: dán vào Supabase → SQL Editor.
-- Idempotent (`if not exists`), chạy lại không hỏng dữ liệu đã có.
--
-- =============================================================================
-- ⚠️ HAI QUY TẮC XUYÊN SUỐT DANH MỤC NỀN
-- =============================================================================
--
--   1. KHÔNG XOÁ, chỉ NGỪNG (BR-MDM-02): mỗi bảng có cột `status` ACTIVE/INACTIVE. Mục đã
--      ngừng vẫn phải đọc đúng tên trong lịch sử cũ, nên không bao giờ DELETE.
--   2. MÃ DUY NHẤT, KHÔNG DÙNG LẠI (BR-MDM-01): mã chuẩn hoá (in hoa, bỏ khoảng trắng hai
--      đầu) và UNIQUE trên toàn bảng, kể cả mục đã ngừng — không cấp lại mã đã dùng.
--
-- Đây KHÔNG phải bảng lịch sử (được sửa), nên `created_by`/`updated_by` dùng khoá ngoại
-- `on delete set null` như `user_profiles.created_by` ở migration 01 — khác bảng chỉ-ghi-thêm.
-- =============================================================================


-- =============================================================================
-- 1. COST_CENTERS — trung tâm chi phí (mã khớp FAST để dùng ở GĐ2)
-- =============================================================================
--
-- ⚠️ `code` khớp mã cost center bên FAST (BR-MDM-03 ở §14.2): đồng bộ kế toán GĐ2 dựa vào
-- mã này, nên chuẩn hoá và duy nhất từ đầu.
create table if not exists public.cost_centers (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null
                        check (code = upper(btrim(code))
                               and length(code) between 1 and 30),
  name                text not null check (length(btrim(name)) >= 1),
  status              text not null default 'ACTIVE'
                        check (status in ('ACTIVE', 'INACTIVE')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.user_profiles (id) on delete set null,
  updated_by          uuid references public.user_profiles (id) on delete set null
);

create unique index if not exists uq_cost_centers_code
  on public.cost_centers (code);
create index if not exists idx_cost_centers_status
  on public.cost_centers (status);


-- =============================================================================
-- 2. LOCATIONS — điểm: cửa hàng, kho, xưởng rang, văn phòng, bên ngoài
-- =============================================================================
--
-- Năm loại (F-MDM-01). "Bên ngoài" (EXTERNAL) là điểm ảo cho đơn vị sửa chữa: tài sản gửi
-- đi sửa được điều chuyển tới một location EXTERNAL (D-02), nhờ vậy vẫn có "vị trí" và người
-- chịu trách nhiệm trong lúc ở ngoài.
--
-- ⚠️ Mỗi location có đúng một cost center mặc định (BR-MDM-04). Để nullable ở tầng DB cho
-- việc nhập liệu nhiều bước; backend BẮT BUỘC khi tạo/kích hoạt location (UC-MDM-01). Không
-- đặt NOT NULL ở đây để migration không vỡ nếu tạo cost center và location trong hai bước.
create table if not exists public.locations (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null
                        check (code = upper(btrim(code))
                               and length(code) between 1 and 30),
  name                text not null check (length(btrim(name)) >= 1),
  type                text not null
                        check (type in ('STORE', 'WAREHOUSE', 'ROASTERY',
                                        'OFFICE', 'EXTERNAL')),
  address             text,
  default_cost_center_id uuid references public.cost_centers (id),
  status              text not null default 'ACTIVE'
                        check (status in ('ACTIVE', 'INACTIVE')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.user_profiles (id) on delete set null,
  updated_by          uuid references public.user_profiles (id) on delete set null
);

create unique index if not exists uq_locations_code
  on public.locations (code);
create index if not exists idx_locations_status
  on public.locations (status);
create index if not exists idx_locations_type
  on public.locations (type, status);


-- =============================================================================
-- 3. DEPARTMENTS — phòng ban của khối văn phòng (F-MDM-08)
-- =============================================================================
--
-- Danh sách phẳng theo khối văn phòng (vận hành, kế toán, nhân sự, IT…; danh sách thật chờ
-- Q-42). Dùng cho hồ sơ nhân viên và sơ đồ tổ chức ở M01.
--
-- ⚠️ `manager_id` (trưởng phòng) KHÔNG FK `on delete cascade`: xoá tài khoản trưởng phòng
-- không được xoá phòng ban. Dùng `on delete set null`; backend đảm bảo trưởng phòng là nhân
-- viên đang hoạt động (BR-MDM-07). Phòng còn nhân viên đang hoạt động thì không ngừng được —
-- kiểm ở backend, không ở DB (cần quét user_profiles.department_id thêm ở migration 03).
create table if not exists public.departments (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null
                        check (code = upper(btrim(code))
                               and length(code) between 1 and 30),
  name                text not null check (length(btrim(name)) >= 1),
  manager_id          uuid references public.user_profiles (id) on delete set null,
  status              text not null default 'ACTIVE'
                        check (status in ('ACTIVE', 'INACTIVE')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.user_profiles (id) on delete set null,
  updated_by          uuid references public.user_profiles (id) on delete set null
);

create unique index if not exists uq_departments_code
  on public.departments (code);
create index if not exists idx_departments_status
  on public.departments (status);


-- =============================================================================
-- 4. REASON_CODES — danh mục lý do chuẩn theo nhóm thao tác (F-MDM-07)
-- =============================================================================
--
-- Lý do chuẩn cho các thao tác cần "vì sao" (audit). `reason_group` quyết định lý do xuất
-- hiện ở dropdown nào. UC-IAM-05 dùng nhóm 'ROLE_ASSIGNMENT'.
--
-- ⚠️ Luôn có mục 'Khác' (`is_freetext = true`) ở mỗi nhóm để người dùng nhập lý do tự do khi
-- danh mục chưa phủ (BR-CMN-10); ô ghi thêm lưu ở dòng nghiệp vụ/audit, không ở đây.
create table if not exists public.reason_codes (
  id                  uuid primary key default gen_random_uuid(),
  code                text not null
                        check (code = upper(btrim(code))
                               and length(code) between 1 and 40),
  -- Nhóm sử dụng. Nới bằng cách sửa CHECK khi module sau cần nhóm mới.
  reason_group        text not null
                        check (reason_group in (
                          'ROLE_ASSIGNMENT',  -- gán / thu hồi vai trò (M01)
                          'PROFILE_EDIT',     -- điều chỉnh hồ sơ nhân viên / tài sản
                          'ACCOUNT_LOCK',     -- khoá / mở khoá / cho nghỉ việc (M01)
                          'TRANSFER',         -- điều chuyển (M06)
                          'DISPOSAL',         -- thanh lý / báo giảm (M08)
                          'LABEL_REPRINT',    -- in lại nhãn (M04)
                          'ASSET_CANCEL',     -- huỷ hồ sơ tài sản tạo sai (M03)
                          'FINANCE_ADJUST'    -- điều chỉnh thông tin tài chính (M03)
                        )),
  label               text not null check (length(btrim(label)) >= 1),
  -- Mục 'Khác': cho phép kèm ô ghi thêm tự do.
  is_freetext         boolean not null default false,
  status              text not null default 'ACTIVE'
                        check (status in ('ACTIVE', 'INACTIVE')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  created_by          uuid references public.user_profiles (id) on delete set null,
  updated_by          uuid references public.user_profiles (id) on delete set null
);

-- Mã duy nhất trong TỪNG nhóm (cùng mã ở hai nhóm khác nhau là hợp lệ).
create unique index if not exists uq_reason_codes_group_code
  on public.reason_codes (reason_group, code);
create index if not exists idx_reason_codes_group_status
  on public.reason_codes (reason_group, status);


-- =============================================================================
-- 5. TRIGGER — `updated_at` tự cập nhật (dùng lại hàm của migration 01)
-- =============================================================================
drop trigger if exists trg_cost_centers_updated_at on public.cost_centers;
create trigger trg_cost_centers_updated_at
  before update on public.cost_centers
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_locations_updated_at on public.locations;
create trigger trg_locations_updated_at
  before update on public.locations
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_departments_updated_at on public.departments;
create trigger trg_departments_updated_at
  before update on public.departments
  for each row execute function public.tg_set_updated_at();

drop trigger if exists trg_reason_codes_updated_at on public.reason_codes;
create trigger trg_reason_codes_updated_at
  before update on public.reason_codes
  for each row execute function public.tg_set_updated_at();


-- =============================================================================
-- 6. ROW LEVEL SECURITY — bật, không policy = deny-by-default cho anon key
-- =============================================================================
--
-- Như migration 01 §8: backend dùng service_role (bỏ qua RLS), quyền quyết định ở guard
-- NestJS; RLS là phòng tuyến cho anon key gọi thẳng Supabase.
alter table public.cost_centers  enable row level security;
alter table public.locations     enable row level security;
alter table public.departments   enable row level security;
alter table public.reason_codes  enable row level security;
