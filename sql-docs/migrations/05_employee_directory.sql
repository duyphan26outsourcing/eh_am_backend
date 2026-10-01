-- ============================================================================
-- 05_employee_directory.sql — UC-IAM-15: Tra cứu danh sách nhân viên
-- ============================================================================
--
-- Một RPC ĐỌC, không ghi, không audit (hậu điều kiện UC: không có dòng nhật ký nào).
-- Gộp vào DB ba việc mà PostgREST làm được nhưng dễ sai:
--   1. Tìm KHÔNG DẤU tiếng Việt trên display_name (unaccent) + email + mã nhân viên.
--   2. Lọc vai trò theo CỬA SỔ HIỆU LỰC của context_role_assignments (bỏ dòng Sắp/Đã hết
--      hiệu lực) — AC.2.
--   3. Lấy trạng thái LỜI MỜI MỚI NHẤT; quy SENT đã quá hạn thành EXPIRED tại thời điểm đọc
--      (migration 04 chỉ hạ hạn lúc preview/claim) — AC.1.
--
-- ⚠️ Idempotent: create extension if not exists + create or replace. Không sửa 01–04.
-- ⚠️ unaccent() xử lý dấu tiếng Việt và đ→d theo từ điển mặc định của extension.

create extension if not exists unaccent;

-- ⚠️ Index cho lateral "lời mời mới nhất theo user": thiếu nó, mỗi dòng của trang quét lại cả
-- bảng activation_invites. Partial index sẵn có chỉ phủ SENT/ACTIVATING, không phủ truy vấn này.
create index if not exists idx_activation_invites_user_created
  on public.activation_invites (user_id, created_at desc);

create or replace function public.list_employees(
  p_search text,
  p_location_id uuid,
  p_department_id uuid,
  p_role_code text,
  p_status text,
  p_employment_type text,
  p_limit int,
  p_offset int
) returns table (
  id uuid,
  display_name text,
  work_email text,
  phone text,
  employee_code text,
  job_title text,
  employment_type text,
  status text,
  start_date date,
  primary_location_id uuid,
  location_code text,
  location_name text,
  department_id uuid,
  department_code text,
  department_name text,
  invite_status text,
  invite_expires_at timestamptz,
  total_count bigint
)
language sql
stable
security definer
-- ⚠️ Gồm `extensions`: trên Supabase `unaccent` thường cài ở schema `extensions`, không phải
-- `public` — thiếu nó, unaccent() không resolve và mọi lời gọi lỗi lúc chạy. `pg_temp` cuối
-- cùng là chuẩn hardening cho security definer.
set search_path = public, extensions, pg_temp
as $$
  with filtered as (
    select p.*
    from public.user_profiles p
    where (p_status is null or p.status = p_status)
      and (p_location_id is null or p.primary_location_id = p_location_id)
      and (p_department_id is null or p.department_id = p_department_id)
      and (p_employment_type is null or p.employment_type = p_employment_type)
      and (
        p_search is null
        or unaccent(lower(p.display_name)) like '%' || unaccent(lower(p_search)) || '%'
        or p.work_email ilike '%' || p_search || '%'
        or p.employee_code ilike '%' || p_search || '%'
      )
      and (
        p_role_code is null
        or exists (
          select 1
          from public.context_role_assignments cra
          where cra.subject_type = 'USER'
            and cra.subject_id = p.id
            and cra.role_code = p_role_code
            and cra.effective_from <= now()
            and (cra.effective_to is null or cra.effective_to > now())
            -- Khi lọc kèm location, chỉ tính vai trò đúng phạm vi location đó.
            and (p_location_id is null or cra.context_id = p_location_id)
        )
      )
  )
  select
    f.id,
    f.display_name,
    f.work_email,
    f.phone,
    f.employee_code,
    f.job_title,
    f.employment_type,
    f.status,
    f.start_date,
    f.primary_location_id,
    loc.code as location_code,
    loc.name as location_name,
    f.department_id,
    dep.code as department_code,
    dep.name as department_name,
    inv.invite_status,
    inv.invite_expires_at,
    count(*) over () as total_count
  from filtered f
  left join public.locations loc on loc.id = f.primary_location_id
  left join public.departments dep on dep.id = f.department_id
  left join lateral (
    select
      case
        when ai.status = 'SENT' and ai.expires_at <= now() then 'EXPIRED'
        else ai.status
      end as invite_status,
      ai.expires_at as invite_expires_at
    from public.activation_invites ai
    where ai.user_id = f.id
    order by ai.created_at desc
    limit 1
  ) inv on true
  order by f.display_name asc, f.id asc
  -- ⚠️ Chặn `p_limit` ngay trong SQL (tối đa 100) để dù có ai gọi thẳng RPC cũng không kéo
  -- cả sổ bằng một lần. DTO cũng chặn ở tầng API, đây là lớp phòng thủ thứ hai.
  limit least(coalesce(p_limit, 20), 100)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- ⚠️ CHỈ service_role (backend) được gọi. Phải revoke khỏi CẢ `anon` VÀ `authenticated`, không chỉ
-- `public`: Supabase cấp sẵn EXECUTE cho anon/authenticated trên function mới trong schema public
-- (qua ALTER DEFAULT PRIVILEGES), và `revoke from public` KHÔNG gỡ các grant theo role đó. Thiếu
-- dòng này, một người đăng nhập (hoặc cả anon) gọi thẳng `rpc('list_employees')` qua Supabase REST
-- sẽ lấy email/điện thoại mọi nhân viên, vượt guard SYSTEM_ADMIN của Nest (hàm SECURITY DEFINER bỏ RLS).
revoke all on function public.list_employees(text, uuid, uuid, text, text, text, int, int) from public, anon, authenticated;
grant execute on function public.list_employees(text, uuid, uuid, text, text, text, int, int) to service_role;
