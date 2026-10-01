-- =============================================================================
-- MIGRATION 02p: RPC ĐƠN VỊ SỬA CHỮA (UC-MDM-06)
-- Phụ thuộc 02o. Sau khi chạy: npm run gen:types.
-- =============================================================================

-- Điểm mở rộng cho M03/M06/M07: các migration tạo tài sản/phiếu sẽ replace hàm này
-- để trả tổng usage đang mở theo loại. Schema hiện tại chưa có các bảng đó.
create or replace function public.location_open_usage_counts(p_location_id uuid)
returns jsonb language sql stable security definer set search_path = public
as $$ select jsonb_build_object('assets', 0, 'transfers', 0, 'repairs', 0, 'stocktakes', 0) $$;

create or replace function public.create_repair_vendor(
  p_command_key uuid, p_name text, p_contact_name text, p_contact_phone text,
  p_contact_email text, p_service_types text[], p_external_location_id uuid,
  p_actor_id uuid, p_actor_label text, p_changes jsonb, p_request_id text,
  p_ip inet, p_user_agent text
) returns public.repair_vendors
language plpgsql security definer set search_path = public as $$
declare
  v_row public.repair_vendors;
  v_receipt public.repair_vendor_command_receipts;
  v_location public.locations;
begin
  insert into public.repair_vendor_command_receipts(command_key, operation, actor_id)
  values (p_command_key, 'CREATE', p_actor_id) on conflict do nothing;
  if not found then
    select * into v_receipt from public.repair_vendor_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'CREATE' or v_receipt.actor_id <> p_actor_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return jsonb_populate_record(null::public.repair_vendors, v_receipt.result_row);
  end if;

  select * into v_location from public.locations where id = p_external_location_id for update;
  if not found or v_location.status <> 'ACTIVE' or v_location.type <> 'EXTERNAL' then
    raise exception 'EXTERNAL_LOCATION_UNAVAILABLE';
  end if;
  if exists(select 1 from public.repair_vendors where external_location_id = p_external_location_id) then
    raise exception 'EXTERNAL_LOCATION_TAKEN';
  end if;

  insert into public.repair_vendors
    (name, contact_name, contact_phone, contact_email, service_types,
     external_location_id, created_by, updated_by)
  values
    (btrim(p_name), nullif(btrim(p_contact_name), ''), nullif(btrim(p_contact_phone), ''),
     nullif(lower(btrim(p_contact_email)), ''), p_service_types,
     p_external_location_id, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id, context_type,
     context_id, reason, changes, request_id, ip_address, user_agent)
  values ('mdm.repair_vendor.created', p_actor_id, p_actor_label, 'RepairVendor', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', '', p_changes,
     p_request_id, p_ip, p_user_agent);

  update public.repair_vendor_command_receipts
     set repair_vendor_id = v_row.id, result_row = to_jsonb(v_row), completed_at = now()
   where command_key = p_command_key;
  return v_row;
end $$;

create or replace function public.update_repair_vendor(
  p_command_key uuid, p_id uuid, p_expected_version integer, p_name text,
  p_contact_name text, p_contact_phone text, p_contact_email text,
  p_service_types text[], p_actor_id uuid, p_actor_label text, p_changes jsonb,
  p_request_id text, p_ip inet, p_user_agent text
) returns public.repair_vendors
language plpgsql security definer set search_path = public as $$
declare
  v_row public.repair_vendors;
  v_receipt public.repair_vendor_command_receipts;
begin
  insert into public.repair_vendor_command_receipts(command_key, operation, repair_vendor_id, actor_id)
  values (p_command_key, 'UPDATE', p_id, p_actor_id) on conflict do nothing;
  if not found then
    select * into v_receipt from public.repair_vendor_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'UPDATE' or v_receipt.actor_id <> p_actor_id
       or v_receipt.repair_vendor_id <> p_id then raise exception 'IDEMPOTENCY_KEY_REUSED'; end if;
    return jsonb_populate_record(null::public.repair_vendors, v_receipt.result_row);
  end if;

  update public.repair_vendors
     set name = btrim(p_name), contact_name = nullif(btrim(p_contact_name), ''),
         contact_phone = nullif(btrim(p_contact_phone), ''),
         contact_email = nullif(lower(btrim(p_contact_email)), ''),
         service_types = p_service_types, version = version + 1, updated_by = p_actor_id
   where id = p_id and version = p_expected_version and status = 'ACTIVE'
  returning * into v_row;
  if not found then
    if not exists(select 1 from public.repair_vendors where id = p_id) then
      raise exception 'REPAIR_VENDOR_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id, context_type,
     context_id, reason, changes, request_id, ip_address, user_agent)
  values ('mdm.repair_vendor.updated', p_actor_id, p_actor_label, 'RepairVendor', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', '', p_changes,
     p_request_id, p_ip, p_user_agent);
  update public.repair_vendor_command_receipts
     set result_row = to_jsonb(v_row), completed_at = now() where command_key = p_command_key;
  return v_row;
end $$;

create or replace function public.deactivate_repair_vendor(
  p_command_key uuid, p_id uuid, p_expected_version integer, p_reason_code_id uuid,
  p_note text, p_actor_id uuid, p_actor_label text, p_vendor_changes jsonb,
  p_location_changes jsonb, p_request_id text, p_ip inet, p_user_agent text
) returns public.repair_vendors
language plpgsql security definer set search_path = public as $$
declare
  v_row public.repair_vendors;
  v_location public.locations;
  v_receipt public.repair_vendor_command_receipts;
  v_reason_label text; v_reason_freetext boolean; v_reason text; v_usage jsonb;
begin
  insert into public.repair_vendor_command_receipts(command_key, operation, repair_vendor_id, actor_id)
  values (p_command_key, 'DEACTIVATE', p_id, p_actor_id) on conflict do nothing;
  if not found then
    select * into v_receipt from public.repair_vendor_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'DEACTIVATE' or v_receipt.actor_id <> p_actor_id
       or v_receipt.repair_vendor_id <> p_id then raise exception 'IDEMPOTENCY_KEY_REUSED'; end if;
    return jsonb_populate_record(null::public.repair_vendors, v_receipt.result_row);
  end if;

  select * into v_row from public.repair_vendors where id = p_id for update;
  if not found then raise exception 'REPAIR_VENDOR_NOT_FOUND'; end if;
  if v_row.version <> p_expected_version or v_row.status <> 'ACTIVE' then
    raise exception 'VERSION_CONFLICT';
  end if;
  select * into v_location from public.locations where id = v_row.external_location_id for update;
  if not found or v_location.status <> 'ACTIVE' then raise exception 'VERSION_CONFLICT'; end if;

  select label, is_freetext into v_reason_label, v_reason_freetext
    from public.reason_codes where id = p_reason_code_id and status = 'ACTIVE'
      and reason_group = 'CATALOG_DEACTIVATE';
  if not found then raise exception 'REASON_INVALID'; end if;
  if v_reason_freetext and btrim(coalesce(p_note, '')) = '' then
    raise exception 'REASON_NOTE_REQUIRED';
  end if;
  v_reason := case when v_reason_freetext then btrim(p_note)
    else v_reason_label || coalesce(': ' || nullif(btrim(p_note), ''), '') end;

  v_usage := public.location_open_usage_counts(v_location.id);
  if exists(select 1 from jsonb_each_text(v_usage) where value::integer > 0) then
    raise exception 'CATALOG_ITEM_IN_USE:%', v_usage::text;
  end if;

  update public.repair_vendors set status = 'INACTIVE', version = version + 1,
    deactivated_reason_code_id = p_reason_code_id, deactivated_note = nullif(btrim(p_note), ''),
    deactivated_at = now(), deactivated_by = p_actor_id, updated_by = p_actor_id
    where id = p_id returning * into v_row;
  update public.locations set status = 'INACTIVE', version = version + 1,
    deactivated_reason_code_id = p_reason_code_id, deactivated_note = nullif(btrim(p_note), ''),
    deactivated_at = now(), deactivated_by = p_actor_id, updated_by = p_actor_id
    where id = v_location.id returning * into v_location;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id, context_type,
     context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.repair_vendor.deactivated', p_actor_id, p_actor_label, 'RepairVendor', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', v_reason, p_vendor_changes,
     p_request_id, p_ip, p_user_agent),
    ('mdm.location.deactivated', p_actor_id, p_actor_label, 'Location', v_location.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', v_reason, p_location_changes,
     p_request_id, p_ip, p_user_agent);

  update public.repair_vendor_command_receipts
     set result_row = to_jsonb(v_row), completed_at = now() where command_key = p_command_key;
  return v_row;
end $$;

revoke all on function public.location_open_usage_counts(uuid) from public;
revoke all on function public.create_repair_vendor(uuid,text,text,text,text,text[],uuid,uuid,text,jsonb,text,inet,text) from public;
revoke all on function public.update_repair_vendor(uuid,uuid,integer,text,text,text,text,text[],uuid,text,jsonb,text,inet,text) from public;
revoke all on function public.deactivate_repair_vendor(uuid,uuid,integer,uuid,text,uuid,text,jsonb,jsonb,text,inet,text) from public;
grant execute on function public.location_open_usage_counts(uuid) to service_role;
grant execute on function public.create_repair_vendor(uuid,text,text,text,text,text[],uuid,uuid,text,jsonb,text,inet,text) to service_role;
grant execute on function public.update_repair_vendor(uuid,uuid,integer,text,text,text,text,text[],uuid,text,jsonb,text,inet,text) to service_role;
grant execute on function public.deactivate_repair_vendor(uuid,uuid,integer,uuid,text,uuid,text,jsonb,jsonb,text,inet,text) to service_role;
