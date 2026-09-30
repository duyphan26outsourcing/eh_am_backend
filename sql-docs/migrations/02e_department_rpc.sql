-- =============================================================================
-- MIGRATION 02e: HÀM RPC CHO DANH MỤC PHÒNG BAN (thay đổi + audit nguyên tử)
-- =============================================================================
--
-- ⚠️ Cùng mẫu 02b/02d: gói INSERT/UPDATE + INSERT audit vào một hàm plpgsql (một transaction),
-- vì supabase-js không có transaction nhiều câu lệnh (UC-MDM-08 BR-AUD-04, EX.6).
--
-- ⚠️ PHẠM VI GĐ NÀY: tạo mới + sửa tên (luồng chính + UC-MDM-08.AC.1). CHƯA làm:
--   · Gán/đổi trưởng phòng (manager_id) — cần danh sách nhân viên Đang hoạt động (UC-IAM-15) +
--     kiểm BR-MDM-07; để `manager_id` NULL khi tạo (Giả định 1: trưởng phòng gán sau).
--   · Ngừng phòng ban (AC.2) + EX.3 `CATALOG_ITEM_IN_USE` — cần danh mục lý do (UC-MDM-07) và
--     đếm nhân viên theo phòng ban (user_profiles.department_id, thuộc M01/UC-IAM-05).
--
-- ⚠️ PHỤ THUỘC: chạy SAU 02 + 02c. Idempotent. Chạy xong `npm run gen:types`.
-- =============================================================================

create or replace function public.create_department(
  p_code                text,
  p_name                text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.departments
language plpgsql
as $$
declare
  v_row public.departments;
begin
  insert into public.departments
    (code, name, created_by, updated_by)
  values
    (p_code, p_name, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.department.created', p_actor_id, p_actor_label, 'Department', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Sửa tên phòng ban theo khoá lạc quan. Mã KHÔNG đổi (BR-MDM-17). Đổi trưởng phòng để sau.
create or replace function public.update_department(
  p_id                  uuid,
  p_expected_version    integer,
  p_name                text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.departments
language plpgsql
as $$
declare
  v_row public.departments;
begin
  update public.departments
    set name       = p_name,
        version    = version + 1,
        updated_by = p_actor_id
  where id = p_id and version = p_expected_version
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.departments where id = p_id) then
      raise exception 'DEPARTMENT_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.department.updated', p_actor_id, p_actor_label, 'Department', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;
