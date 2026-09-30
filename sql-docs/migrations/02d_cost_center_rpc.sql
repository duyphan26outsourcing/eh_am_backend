-- =============================================================================
-- MIGRATION 02d: HÀM RPC CHO DANH MỤC COST CENTER (thay đổi + audit nguyên tử)
-- =============================================================================
--
-- ⚠️ VÌ SAO CẦN HÀM POSTGRES — GIỐNG 02b (LOCATION)
--
-- UC-MDM-03 (BR-AUD-04, EX.6): thay đổi cost center và dòng `audit_events` phải CÙNG thành công
-- hoặc CÙNG không có. supabase-js không có transaction nhiều câu lệnh, nên gói INSERT/UPDATE +
-- INSERT audit vào một hàm plpgsql. Đây là cùng mẫu với `create_location`/`update_location`.
--
-- Logic "trước/sau" (`changes`) dựng ở backend bằng `diffFields()` rồi truyền vào jsonb.
--
-- ⚠️ PHẠM VI GĐ NÀY: chỉ tạo mới + sửa tên (luồng chính + UC-MDM-03.AC.1). Luồng NGỪNG
-- (UC-MDM-03.AC.2) + kiểm "còn được dùng" (EX.3 CATALOG_ITEM_IN_USE) để lại migration sau, vì nó
-- phụ thuộc danh mục lý do (UC-MDM-07) và bảng tài sản (M03) — cả hai CHƯA có.
--
-- ⚠️ PHỤ THUỘC: chạy SAU `02_master_data.sql` và `02c_master_data_version.sql`.
-- Idempotent (`create or replace`). Chạy xong nhớ `npm run gen:types`.
-- =============================================================================

-- Tạo cost center + dòng audit trong một transaction. Trùng mã → unique_violation (23505),
-- backend map sang DUPLICATE_RECORD.
create or replace function public.create_cost_center(
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
returns public.cost_centers
language plpgsql
as $$
declare
  v_row public.cost_centers;
begin
  insert into public.cost_centers
    (code, name, created_by, updated_by)
  values
    (p_code, p_name, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.cost_center.created', p_actor_id, p_actor_label, 'CostCenter', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Sửa tên cost center theo khoá lạc quan. Không khớp version → 'VERSION_CONFLICT'; không tồn tại
-- → 'COST_CENTER_NOT_FOUND'. Backend đọc message để map lỗi. Mã KHÔNG đổi (BR-MDM-17).
create or replace function public.update_cost_center(
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
returns public.cost_centers
language plpgsql
as $$
declare
  v_row public.cost_centers;
begin
  update public.cost_centers
    set name       = p_name,
        version    = version + 1,
        updated_by = p_actor_id
  where id = p_id and version = p_expected_version
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.cost_centers where id = p_id) then
      raise exception 'COST_CENTER_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.cost_center.updated', p_actor_id, p_actor_label, 'CostCenter', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;
