-- ============================================================================
-- 16 — Tra cứu danh sách tài sản (M03, UC-AST-07). Chạy sau 15.
-- Một RPC ĐỌC, không ghi, không audit. KHÔNG sửa migration 01–15 đã chạy.
-- ============================================================================
--
-- ⚠️ BIÊN PHẠM VI LOCATION ĐI VÀO RPC DƯỚI DẠNG MẢNG
--   Service giải phạm vi bằng AccessScopeService rồi truyền xuống:
--     · vai trò toàn hệ thống (Quản lý tài sản / Kế toán tài sản) → p_location_ids = NULL (mọi location);
--     · Quản lý điểm → p_location_ids = mảng location được gán (service đã chặn mảng rỗng = 403 ở trên).
--   `p_location_id` là bộ lọc MỘT location người dùng chọn: giao với scope (EX.2 — lọc ngoài phạm vi → rỗng).
-- ⚠️ Tìm KHÔNG DẤU trên `name` (unaccent) + asset_code + serial, giống list_employees.

create extension if not exists unaccent;

create or replace function public.list_assets(
  p_location_ids uuid[],
  p_search text,
  p_asset_type_id uuid,
  p_status text,
  p_physical_condition text,
  p_location_id uuid,
  p_limit int,
  p_offset int
) returns table (
  id uuid,
  asset_code text,
  name text,
  asset_type_id uuid,
  asset_type_code text,
  asset_type_name text,
  asset_kind text,
  serial text,
  lifecycle_status text,
  physical_condition text,
  primary_location_id uuid,
  location_code text,
  location_name text,
  responsible_user_id uuid,
  responsible_name text,
  responsible_employee_code text,
  cost_center_id uuid,
  created_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
set search_path = public, extensions, pg_temp
as $$
  with filtered as (
    select a.*
    from public.assets a
    where (p_location_ids is null or a.primary_location_id = any(p_location_ids))
      and (p_location_id is null or a.primary_location_id = p_location_id)
      and (p_asset_type_id is null or a.asset_type_id = p_asset_type_id)
      and (p_status is null or a.lifecycle_status = p_status)
      and (p_physical_condition is null or a.physical_condition = p_physical_condition)
      and (
        p_search is null
        or unaccent(lower(a.name)) like '%' || unaccent(lower(p_search)) || '%'
        or a.asset_code ilike '%' || p_search || '%'
        or a.serial ilike '%' || p_search || '%'
      )
  )
  select
    f.id,
    f.asset_code,
    f.name,
    f.asset_type_id,
    at.code as asset_type_code,
    at.name as asset_type_name,
    at.asset_kind,
    f.serial,
    f.lifecycle_status,
    f.physical_condition,
    f.primary_location_id,
    loc.code as location_code,
    loc.name as location_name,
    f.responsible_user_id,
    up.display_name as responsible_name,
    up.employee_code as responsible_employee_code,
    f.cost_center_id,
    f.created_at,
    count(*) over () as total_count
  from filtered f
  left join public.asset_types at on at.id = f.asset_type_id
  left join public.locations loc on loc.id = f.primary_location_id
  left join public.user_profiles up on up.id = f.responsible_user_id
  order by f.created_at desc, f.id desc
  limit least(coalesce(p_limit, 20), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.list_assets(uuid[], text, uuid, text, text, uuid, int, int)
  from public, anon, authenticated;
grant execute on function public.list_assets(uuid[], text, uuid, text, text, uuid, int, int)
  to service_role;
