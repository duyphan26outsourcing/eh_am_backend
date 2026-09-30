-- =============================================================================
-- MIGRATION 02j: HÀM RPC CHO CÂY LOẠI TÀI SẢN (UC-MDM-04)
-- =============================================================================
--
-- Cùng mẫu 02b/02d/02h: thay đổi + audit nguyên tử trong plpgsql (BR-AUD-04).
--
-- ⚠️ TÁCH HÀM THEO NHÓM vs LOẠI: nhóm không có `parent_id`/`asset_kind`, nên hàm tạo/sửa nhóm
-- KHÔNG mang các tham số đó — tránh phải truyền NULL qua rpc (supabase-js sinh kiểu tham số hàm
-- là non-null, truyền null sẽ vỡ TypeScript). Field optional của LOẠI dùng sentinel: chuỗi rỗng
-- và số 0 nghĩa là "không nhập", hàm tự đổi thành NULL.
--
-- ⚠️ PHỤ THUỘC: chạy SAU 02i (bảng), 02g (nhóm lý do CATALOG_DEACTIVATE). Idempotent. Chạy xong
-- `npm run gen:types`.
-- =============================================================================

-- Tạo NHÓM (cấp 1). 23505 → DUPLICATE_RECORD (map ở repo).
create or replace function public.create_asset_type_group(
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
returns public.asset_types
language plpgsql
as $$
declare
  v_row public.asset_types;
begin
  insert into public.asset_types (parent_id, code, name, created_by, updated_by)
  values (null, p_code, p_name, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.asset_type.created', p_actor_id, p_actor_label, 'AssetType', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Tạo LOẠI (cấp 2) dưới một nhóm đang hoạt động. Sentinel: p_useful_life_months <= 0 → NULL;
-- p_fast_group_code '' → NULL. Message lỗi: PARENT_INVALID → VALIDATION_FAILED (nhóm cha không
-- tồn tại / đã ngừng / không phải nhóm). 23505 → DUPLICATE_RECORD.
create or replace function public.create_asset_type(
  p_parent_id           uuid,
  p_code                text,
  p_name                text,
  p_asset_kind          text,
  p_serial_required     boolean,
  p_useful_life_months  integer,
  p_fast_group_code     text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.asset_types
language plpgsql
as $$
declare
  v_row    public.asset_types;
  v_parent public.asset_types;
begin
  select * into v_parent from public.asset_types where id = p_parent_id;
  if not found or v_parent.parent_id is not null or v_parent.status <> 'ACTIVE' then
    raise exception 'PARENT_INVALID';
  end if;

  insert into public.asset_types
    (parent_id, code, name, asset_kind, serial_required,
     useful_life_months, fast_group_code, created_by, updated_by)
  values
    (p_parent_id, p_code, p_name, p_asset_kind, coalesce(p_serial_required, false),
     case when p_useful_life_months > 0 then p_useful_life_months else null end,
     nullif(upper(btrim(coalesce(p_fast_group_code, ''))), ''),
     p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.asset_type.created', p_actor_id, p_actor_label, 'AssetType', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Sửa NHÓM: chỉ tên. Message: ASSET_TYPE_NOT_FOUND → NOT_FOUND; VERSION_CONFLICT → 409.
create or replace function public.update_asset_type_group(
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
returns public.asset_types
language plpgsql
as $$
declare
  v_row public.asset_types;
begin
  update public.asset_types
     set name = p_name, version = version + 1, updated_by = p_actor_id
   where id = p_id and version = p_expected_version and parent_id is null
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.asset_types where id = p_id and parent_id is null) then
      raise exception 'ASSET_TYPE_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.asset_type.updated', p_actor_id, p_actor_label, 'AssetType', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Sửa LOẠI: tên + cờ TSCĐ/CCDC + bắt buộc serial + thời gian + mã FAST. Mã + nhóm cha KHÔNG đổi
-- (BR-MDM-17). Sentinel như create. Message: ASSET_TYPE_NOT_FOUND / VERSION_CONFLICT.
--
-- ⚠️ HOÃN (M03): đổi cờ TSCĐ/CCDC của loại ĐÃ CÓ TÀI SẢN phải chặn (BR-MDM-06, EX.3). Bảng tài
-- sản chưa có nên chưa kiểm — bổ sung khi M03 xong.
create or replace function public.update_asset_type(
  p_id                  uuid,
  p_expected_version    integer,
  p_name                text,
  p_asset_kind          text,
  p_serial_required     boolean,
  p_useful_life_months  integer,
  p_fast_group_code     text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.asset_types
language plpgsql
as $$
declare
  v_row public.asset_types;
begin
  update public.asset_types
     set name               = p_name,
         asset_kind         = p_asset_kind,
         serial_required    = coalesce(p_serial_required, false),
         useful_life_months = case when p_useful_life_months > 0 then p_useful_life_months else null end,
         fast_group_code    = nullif(upper(btrim(coalesce(p_fast_group_code, ''))), ''),
         version            = version + 1,
         updated_by         = p_actor_id
   where id = p_id and version = p_expected_version and parent_id is not null
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.asset_types where id = p_id and parent_id is not null) then
      raise exception 'ASSET_TYPE_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.asset_type.updated', p_actor_id, p_actor_label, 'AssetType', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Ngừng nhóm hoặc loại (UC-MDM-04.AC.3). Message:
--   ASSET_TYPE_NOT_FOUND → NOT_FOUND; VERSION_CONFLICT → 409;
--   REASON_INVALID / REASON_NOTE_REQUIRED → VALIDATION_FAILED;
--   CATALOG_ITEM_IN_USE → 409 (nhóm còn loại ĐANG HOẠT ĐỘNG).
--
-- ⚠️ HOÃN (M03): ngừng LOẠI phải kiểm không còn tài sản chưa kết thúc (BR-MDM-10, EX.3).
create or replace function public.deactivate_asset_type(
  p_id                  uuid,
  p_expected_version    integer,
  p_reason_code_id      uuid,
  p_note                text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.asset_types
language plpgsql
as $$
declare
  v_row             public.asset_types;
  v_reason_label    text;
  v_reason_freetext boolean;
  v_reason          text;
begin
  select * into v_row from public.asset_types where id = p_id for update;
  if not found then
    raise exception 'ASSET_TYPE_NOT_FOUND';
  end if;
  if v_row.version <> p_expected_version then
    raise exception 'VERSION_CONFLICT';
  end if;

  select label, is_freetext into v_reason_label, v_reason_freetext
    from public.reason_codes
   where id = p_reason_code_id
     and status = 'ACTIVE'
     and reason_group = 'CATALOG_DEACTIVATE';
  if not found then
    raise exception 'REASON_INVALID';
  end if;
  if v_reason_freetext and btrim(coalesce(p_note, '')) = '' then
    raise exception 'REASON_NOTE_REQUIRED';
  end if;
  v_reason := case
    when v_reason_freetext then btrim(p_note)
    else v_reason_label || coalesce(': ' || nullif(btrim(p_note), ''), '')
  end;

  -- Nhóm: không được còn loại con ĐANG HOẠT ĐỘNG (BR-MDM-10). Loại: kiểm tài sản HOÃN (M03).
  if v_row.parent_id is null and exists (
    select 1 from public.asset_types where parent_id = p_id and status = 'ACTIVE'
  ) then
    raise exception 'CATALOG_ITEM_IN_USE';
  end if;

  update public.asset_types
     set status = 'INACTIVE', version = version + 1, updated_by = p_actor_id
   where id = p_id
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.asset_type.deactivated', p_actor_id, p_actor_label, 'AssetType', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     v_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;
