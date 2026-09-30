-- =============================================================================
-- MIGRATION 02b: HÀM RPC CHO DANH MỤC LOCATION (thay đổi + audit nguyên tử)
-- =============================================================================
--
-- ⚠️ VÌ SAO CẦN HÀM POSTGRES, KHÔNG LÀM Ở TẦNG ỨNG DỤNG
--
-- UC-MDM-01 (BR-AUD-04, EX.5): thay đổi location và dòng `audit_events` phải CÙNG thành công
-- hoặc CÙNG không có. supabase-js không có transaction nhiều câu lệnh, nên gói cả hai câu
-- INSERT/UPDATE vào một hàm plpgsql — hàm chạy trong một transaction, audit lỗi thì thay đổi
-- location cũng rollback. Đây là mẫu chung cho mọi thao tác có hệ quả cần audit nguyên tử.
--
-- Logic "trước/sau" (`changes`) vẫn dựng ở backend bằng `diffFields()` rồi truyền vào dạng
-- jsonb — giữ một chỗ tính diff, hàm chỉ lo ghi nguyên tử.
--
-- ⚠️ PHỤ THUỘC: chạy SAU `02_master_data.sql`. Idempotent (`create or replace`).
-- =============================================================================

-- Tạo location + dòng audit trong một transaction. Trùng mã → unique_violation (23505),
-- backend map sang DUPLICATE_RECORD.
create or replace function public.create_location(
  p_code                text,
  p_name                text,
  p_type                text,
  p_address             text,
  p_cost_center_id      uuid,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.locations
language plpgsql
as $$
declare
  v_row public.locations;
begin
  insert into public.locations
    (code, name, type, address, default_cost_center_id, created_by, updated_by)
  values
    (p_code, p_name, p_type, p_address, p_cost_center_id, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.location.created', p_actor_id, p_actor_label, 'Location', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Sửa location theo khoá lạc quan. Không khớp version → 'VERSION_CONFLICT'; không tồn tại →
-- 'LOCATION_NOT_FOUND'. Backend đọc message để map lỗi.
create or replace function public.update_location(
  p_id                  uuid,
  p_expected_version    integer,
  p_name                text,
  p_address             text,
  p_cost_center_id      uuid,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.locations
language plpgsql
as $$
declare
  v_row public.locations;
begin
  update public.locations
    set name                   = p_name,
        address                = p_address,
        default_cost_center_id = p_cost_center_id,
        version                = version + 1,
        updated_by             = p_actor_id
  where id = p_id and version = p_expected_version
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.locations where id = p_id) then
      raise exception 'LOCATION_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.location.updated', p_actor_id, p_actor_label, 'Location', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;
