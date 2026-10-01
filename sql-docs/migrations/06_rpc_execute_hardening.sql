-- ============================================================================
-- 06_rpc_execute_hardening.sql — Khóa quyền EXECUTE của mọi RPC về service_role
-- ============================================================================
--
-- ⚠️ VÌ SAO CÓ MIGRATION NÀY
--
-- Các migration RPC trước (02l, 02m, 02n, 02p, 03, 04, 05) đều `revoke all ... from public`
-- rồi `grant execute ... to service_role`. Nhưng trên Supabase, function MỚI trong schema
-- `public` được cấp sẵn EXECUTE cho `anon` và `authenticated` qua ALTER DEFAULT PRIVILEGES
-- (của role `postgres`/`supabase_admin`). `REVOKE ... FROM PUBLIC` KHÔNG gỡ các grant theo role
-- cụ thể đó.
--
-- Hệ quả: các RPC SECURITY DEFINER (create_employee, complete_account_activation,
-- claim_activation_invite, list_employees, các RPC master-data…) có thể bị gọi THẲNG qua
-- `POST /rest/v1/rpc/<tên>` bằng anon key hoặc JWT của người đăng nhập thường — bỏ qua toàn bộ
-- guard của NestJS. Backend chỉ gọi RPC bằng `service_role`, nên gỡ execute khỏi anon/authenticated
-- KHÔNG ảnh hưởng ứng dụng (frontend đi qua backend, không gọi RPC trực tiếp).
--
-- ⚠️ Không sửa migration đã chạy — đây là migration mới, idempotent, chạy lại được nhiều lần.

-- 1) Gỡ EXECUTE khỏi anon + authenticated trên MỌI function trong schema public (độc lập chữ ký).
do $$
declare
  r record;
begin
  for r in
    select p.oid,
           p.proname,
           pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format(
      'revoke all on function public.%I(%s) from anon, authenticated',
      r.proname, r.args
    );
  end loop;
end $$;

-- 2) Chặn tận gốc cho function TƯƠNG LAI: mặc định không cấp EXECUTE cho anon/authenticated nữa.
--    (Áp cho đối tượng do vai trò hiện tại tạo — chạy migration bằng cùng vai trò quản trị đang
--    dùng cho các migration khác.)
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- 3) service_role vẫn giữ execute (các migration trước đã grant riêng cho service_role; bước 1
--    chỉ gỡ anon/authenticated nên không đụng tới service_role).
