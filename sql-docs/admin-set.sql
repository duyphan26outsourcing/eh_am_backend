-- ============================================================================
-- BOOTSTRAP TÀI KHOẢN QUẢN TRỊ ĐẦU TIÊN CHO MỘT MÔI TRƯỜNG
-- ============================================================================
--
-- CHẠY KHI NÀO
--
--   Một lần cho mỗi môi trường Supabase (development, production), **sau khi**:
--     1. đã chạy `sql-docs/migrations/01_identity_rbac_audit.sql`
--     2. đã tạo tài khoản bằng tay ở Supabase → Authentication → Users → Add user
--        ⚠️ nhớ tích **Auto Confirm User** khi tạo, nếu không sẽ không đăng nhập được.
--
--   Script **idempotent**: chạy lại nhiều lần vẫn an toàn, không tạo bản ghi trùng.
--
-- CÁCH DÙNG
--
--   Sửa khối `v_*` ngay đầu block DO bên dưới, rồi dán toàn bộ file vào SQL Editor.
--   Không cần điền UUID — script tự tra theo email.
--
-- CÁCH KIỂM TRA
--
--   Câu `SELECT` ở cuối file là bảng kết quả duy nhất Supabase hiển thị.
--   **Mọi dòng phải `PASS`.** ⚠️ Nhớ sửa email ở câu SELECT đó nếu đã đổi `v_admin_email`.
--
-- ============================================================================
-- VÌ SAO CẦN SCRIPT NÀY THAY VÌ MỘT ENDPOINT "TẠO ADMIN"
-- ============================================================================
--
-- Một endpoint tạo quản trị viên là một endpoint có thể bị gọi. Dù có bảo vệ bằng token
-- thiết lập ban đầu thì token đó phải nằm ở đâu đó, và nó trở thành khoá vạn năng của cả
-- hệ thống. Script SQL chỉ chạy được bởi người đã có quyền vào Supabase SQL Editor — tức
-- người vốn đã có toàn quyền trên database. Nó không mở thêm bề mặt tấn công nào.
--
-- ============================================================================
-- BA THỨ PHẢI TẠO, THIẾU MỘT LÀ ĐĂNG NHẬP ĐƯỢC NHƯNG KHÔNG DÙNG ĐƯỢC
-- ============================================================================
--
--   1. `auth.users.raw_app_meta_data.role = 'admin'`  (quản trị tối cao — break-glass)
--      → `isSuperAdmin()` trong `utils.ts` đọc `app_metadata.role` từ JWT. Đây là vai trò
--        DUY NHẤT không đọc từ `context_role_assignments`, để còn đường vào khi chính bảng
--        phân quyền bị cấu hình sai.
--      ⚠️ Cột này chỉ ghi được bằng `service_role` key hoặc SQL Editor — người dùng không
--        tự sửa được, nên nó tin được.
--
--   2. Dòng trong `public.user_profiles`
--      → `JwtAuthGuard` đọc bảng này trên **mỗi request**. Không có dòng nào thì mọi
--        request trả **403 `PROFILE_NOT_INITIALIZED`** — kể cả với admin.
--      ⚠️ `id` phải **bằng** `auth.users.id`, không sinh UUID mới.
--
--   3. Dòng `SYSTEM_ADMIN` trong `public.context_role_assignments`
--      → quản trị tối cao đi xuyên `PermissionsGuard`, nhưng vẫn cấp vai trò tường minh vì:
--        (a) nhật ký đọc lại rõ nghĩa, (b) nếu sau này bỏ đường thoát break-glass thì admin
--        vẫn hoạt động.
--
-- ============================================================================

BEGIN;

DO $$
DECLARE
  -- ========================================================================
  -- SỬA CÁC GIÁ TRỊ DƯỚI ĐÂY
  -- ========================================================================

  -- Email của tài khoản đã tạo bằng tay ở Authentication → Users.
  v_admin_email          text := 'admintaisan@everyhalf.vn';

  v_admin_display_name   text := 'Quản trị hệ thống Every Half';

  -- Mã nhân viên (tuỳ chọn). ⚠️ CHỈ ASCII, IN HOA, 2-30 ký tự. Để NULL nếu chưa có.
  v_admin_employee_code  text := NULL;

  -- ========================================================================
  -- Không cần sửa từ đây trở xuống
  -- ========================================================================
  v_user_id              uuid;
  v_platform_ctx         uuid := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- ------------------------------------------------------------------------
  -- §0. Tra tài khoản
  -- ------------------------------------------------------------------------
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE lower(email) = lower(v_admin_email)
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION
      E'Không tìm thấy tài khoản "%" trong auth.users.\n\n'
      'Hãy tạo trước ở Supabase → Authentication → Users → Add user:\n'
      '  · Email: %\n'
      '  · Password: (mật khẩu bạn chọn)\n'
      '  · ✅ TÍCH "Auto Confirm User"\n\n'
      'Rồi chạy lại file này.',
      v_admin_email, v_admin_email;
  END IF;

  RAISE NOTICE 'Tìm thấy tài khoản: % (id=%)', v_admin_email, v_user_id;

  -- ------------------------------------------------------------------------
  -- §1. Gắn role admin vào app_metadata
  -- ------------------------------------------------------------------------
  --
  -- ⚠️ Dùng `||` (merge) chứ KHÔNG gán cả object mới. Supabase để các khoá nội bộ
  -- trong `raw_app_meta_data` (`provider`, `providers`); ghi đè cả object sẽ xoá chúng,
  -- và tài khoản có thể không đăng nhập lại được.
  UPDATE auth.users
  SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                          || jsonb_build_object('role', 'admin')
  WHERE id = v_user_id;

  RAISE NOTICE '§1 app_metadata.role = admin ✓';

  -- ------------------------------------------------------------------------
  -- §2. Xác nhận email nếu chưa
  -- ------------------------------------------------------------------------
  --
  -- ⚠️ Luồng đăng ký đặt `email_confirm: false` nên tài khoản chưa xác nhận email thì
  -- **không đăng nhập được**. Quên tích "Auto Confirm User" lúc tạo tay thì admin bị chặn
  -- ngay ở bước đăng nhập — một triệu chứng không hề trỏ về nguyên nhân.
  --
  -- Chỉ đặt khi đang NULL: không ghi đè mốc thời gian xác nhận thật.
  UPDATE auth.users
  SET email_confirmed_at = now()
  WHERE id = v_user_id AND email_confirmed_at IS NULL;

  RAISE NOTICE '§2 email đã xác nhận ✓';

  -- ------------------------------------------------------------------------
  -- §3. Hồ sơ user_profiles
  -- ------------------------------------------------------------------------
  --
  -- ⚠️ `ON CONFLICT (id) DO UPDATE` chỉ cập nhật những trường script này quản lý.
  INSERT INTO public.user_profiles (
    id, display_name, employee_code, preferred_locale, status
  )
  VALUES (
    v_user_id, v_admin_display_name, v_admin_employee_code, 'vi', 'ACTIVE'
  )
  ON CONFLICT (id) DO UPDATE
  SET display_name  = excluded.display_name,
      employee_code = excluded.employee_code,
      status        = 'ACTIVE';

  RAISE NOTICE '§3 user_profiles ✓';

  -- ------------------------------------------------------------------------
  -- §4. Vai trò SYSTEM_ADMIN toàn hệ thống
  -- ------------------------------------------------------------------------
  --
  -- ⚠️ Kiểm tồn tại rồi mới chèn, thay vì `ON CONFLICT`: unique index
  -- `uq_context_role_active` là **partial index**, và `ON CONFLICT` không dùng được với
  -- partial index nếu không nêu lại đúng vị từ `WHERE` của nó.
  IF NOT EXISTS (
    SELECT 1 FROM public.context_role_assignments
    WHERE subject_type = 'USER'
      AND subject_id   = v_user_id
      AND context_type = 'PLATFORM'
      AND context_id   = v_platform_ctx
      AND role_code    = 'SYSTEM_ADMIN'
      AND (effective_to IS NULL OR effective_to > now())
  ) THEN
    INSERT INTO public.context_role_assignments (
      subject_type, subject_id, context_type, context_id,
      role_code, granted_by, grant_reason
    )
    VALUES (
      'USER', v_user_id, 'PLATFORM', v_platform_ctx,
      'SYSTEM_ADMIN', v_user_id,
      'Bootstrap môi trường qua sql-docs/admin-set.sql'
    );
    RAISE NOTICE '§4 cấp vai trò SYSTEM_ADMIN ✓';
  ELSE
    RAISE NOTICE '§4 vai trò SYSTEM_ADMIN đã có, bỏ qua';
  END IF;

  -- ------------------------------------------------------------------------
  -- §5. Nhật ký
  -- ------------------------------------------------------------------------
  --
  -- ⚠️ Ghi audit cho chính việc bootstrap: đây là hành động cấp đặc quyền cao nhất của hệ
  -- thống, nên nó phải có dấu vết — kể cả khi nó do một script chạy tay.
  INSERT INTO public.audit_events (
    event_code, actor_id, actor_label, subject_type, subject_id,
    context_type, context_id, reason, metadata
  )
  VALUES (
    'iam.role.granted', v_user_id, v_admin_display_name, 'UserProfile', v_user_id,
    'PLATFORM', v_platform_ctx,
    'Bootstrap tài khoản quản trị đầu tiên của môi trường',
    jsonb_build_object('source', 'sql-docs/admin-set.sql', 'role', 'SYSTEM_ADMIN')
  );

  RAISE NOTICE '§5 audit_events ✓';
  RAISE NOTICE '=== XONG. Kiểm bảng kết quả bên dưới: mọi dòng phải PASS. ===';
END $$;

COMMIT;

-- ============================================================================
-- KIỂM TRA — mọi dòng phải PASS
-- ============================================================================
--
-- ⚠️ Sửa email ở dòng `WITH target AS` nếu bạn đã đổi `v_admin_email`.

WITH target AS (
  SELECT id FROM auth.users WHERE lower(email) = lower('admintaisan@everyhalf.vn') LIMIT 1
)
SELECT '1. auth.users tồn tại' AS kiem_tra,
       CASE WHEN EXISTS (SELECT 1 FROM target) THEN 'PASS' ELSE 'FAIL' END AS ket_qua,
       (SELECT id::text FROM target) AS chi_tiet

UNION ALL
SELECT '2. app_metadata.role = admin',
       CASE WHEN (SELECT raw_app_meta_data ->> 'role' FROM auth.users
                  WHERE id = (SELECT id FROM target)) = 'admin'
            THEN 'PASS' ELSE 'FAIL' END,
       coalesce((SELECT raw_app_meta_data ->> 'role' FROM auth.users
                 WHERE id = (SELECT id FROM target)), '(rỗng)')

UNION ALL
SELECT '3. email đã xác nhận',
       CASE WHEN (SELECT email_confirmed_at FROM auth.users
                  WHERE id = (SELECT id FROM target)) IS NOT NULL
            THEN 'PASS' ELSE 'FAIL — không đăng nhập được' END,
       coalesce((SELECT email_confirmed_at::text FROM auth.users
                 WHERE id = (SELECT id FROM target)), '(NULL)')

UNION ALL
SELECT '4. user_profiles tồn tại và ACTIVE',
       CASE WHEN EXISTS (SELECT 1 FROM public.user_profiles
                         WHERE id = (SELECT id FROM target) AND status = 'ACTIVE')
            THEN 'PASS' ELSE 'FAIL — mọi request trả 403 PROFILE_NOT_INITIALIZED' END,
       coalesce((SELECT format('tên=%s, mã NV=%s, ngôn ngữ=%s',
                               display_name, coalesce(employee_code, '—'), preferred_locale)
                 FROM public.user_profiles WHERE id = (SELECT id FROM target)),
                '(không có dòng nào)')

UNION ALL
SELECT '5. có vai trò SYSTEM_ADMIN còn hiệu lực',
       CASE WHEN EXISTS (SELECT 1 FROM public.context_role_assignments
                         WHERE subject_type = 'USER'
                           AND subject_id = (SELECT id FROM target)
                           AND role_code = 'SYSTEM_ADMIN'
                           AND (effective_to IS NULL OR effective_to > now()))
            THEN 'PASS' ELSE 'FAIL' END,
       (SELECT string_agg(role_code, ', ' ORDER BY role_code)
        FROM public.context_role_assignments
        WHERE subject_type = 'USER'
          AND subject_id = (SELECT id FROM target)
          AND (effective_to IS NULL OR effective_to > now()));
