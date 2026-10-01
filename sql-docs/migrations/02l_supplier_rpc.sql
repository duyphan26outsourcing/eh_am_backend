-- =============================================================================
-- MIGRATION 02l: RPC NHÀ CUNG CẤP (UC-MDM-05)
-- Phụ thuộc: 02k_suppliers.sql, 02g_reason_codes.sql. Chạy xong: npm run gen:types.
-- =============================================================================

create or replace function public.create_supplier(
  p_command_key uuid,
  p_name text,
  p_tax_id text,
  p_contact_name text,
  p_contact_phone text,
  p_contact_email text,
  p_actor_id uuid,
  p_actor_label text,
  p_changes jsonb,
  p_request_id text,
  p_ip inet,
  p_user_agent text
)
returns public.suppliers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.suppliers;
  v_receipt public.supplier_command_receipts;
begin
  insert into public.supplier_command_receipts (command_key, operation, actor_id)
  values (p_command_key, 'CREATE', p_actor_id)
  on conflict do nothing;

  if not found then
    select * into v_receipt from public.supplier_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'CREATE' or v_receipt.actor_id <> p_actor_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return jsonb_populate_record(null::public.suppliers, v_receipt.result_row);
  end if;

  insert into public.suppliers
    (name, tax_id, contact_name, contact_phone, contact_email, created_by, updated_by)
  values
    (p_name, p_tax_id, p_contact_name, p_contact_phone, p_contact_email, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.supplier.created', p_actor_id, p_actor_label, 'Supplier', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', '', p_changes,
     p_request_id, p_ip, p_user_agent);

  update public.supplier_command_receipts
     set supplier_id = v_row.id, result_row = to_jsonb(v_row), completed_at = now()
   where command_key = p_command_key;
  return v_row;
end;
$$;

create or replace function public.update_supplier(
  p_command_key uuid,
  p_id uuid,
  p_expected_version integer,
  p_name text,
  p_tax_id text,
  p_contact_name text,
  p_contact_phone text,
  p_contact_email text,
  p_actor_id uuid,
  p_actor_label text,
  p_changes jsonb,
  p_request_id text,
  p_ip inet,
  p_user_agent text
)
returns public.suppliers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.suppliers;
  v_receipt public.supplier_command_receipts;
begin
  insert into public.supplier_command_receipts (command_key, operation, supplier_id, actor_id)
  values (p_command_key, 'UPDATE', p_id, p_actor_id)
  on conflict do nothing;

  if not found then
    select * into v_receipt from public.supplier_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'UPDATE' or v_receipt.actor_id <> p_actor_id or v_receipt.supplier_id <> p_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return jsonb_populate_record(null::public.suppliers, v_receipt.result_row);
  end if;

  update public.suppliers
     set name = p_name,
         tax_id = p_tax_id,
         contact_name = p_contact_name,
         contact_phone = p_contact_phone,
         contact_email = p_contact_email,
         version = version + 1,
         updated_by = p_actor_id
   where id = p_id and version = p_expected_version
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.suppliers where id = p_id) then
      raise exception 'SUPPLIER_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.supplier.updated', p_actor_id, p_actor_label, 'Supplier', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', '', p_changes,
     p_request_id, p_ip, p_user_agent);

  update public.supplier_command_receipts
     set result_row = to_jsonb(v_row), completed_at = now()
   where command_key = p_command_key;
  return v_row;
end;
$$;

create or replace function public.deactivate_supplier(
  p_command_key uuid,
  p_id uuid,
  p_expected_version integer,
  p_reason_code_id uuid,
  p_note text,
  p_actor_id uuid,
  p_actor_label text,
  p_changes jsonb,
  p_request_id text,
  p_ip inet,
  p_user_agent text
)
returns public.suppliers
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.suppliers;
  v_receipt public.supplier_command_receipts;
  v_reason_label text;
  v_reason_freetext boolean;
  v_reason text;
begin
  insert into public.supplier_command_receipts (command_key, operation, supplier_id, actor_id)
  values (p_command_key, 'DEACTIVATE', p_id, p_actor_id)
  on conflict do nothing;

  if not found then
    select * into v_receipt from public.supplier_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'DEACTIVATE' or v_receipt.actor_id <> p_actor_id or v_receipt.supplier_id <> p_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return jsonb_populate_record(null::public.suppliers, v_receipt.result_row);
  end if;

  select * into v_row from public.suppliers where id = p_id for update;
  if not found then raise exception 'SUPPLIER_NOT_FOUND'; end if;
  if v_row.version <> p_expected_version then raise exception 'VERSION_CONFLICT'; end if;

  select label, is_freetext into v_reason_label, v_reason_freetext
    from public.reason_codes
   where id = p_reason_code_id and status = 'ACTIVE' and reason_group = 'CATALOG_DEACTIVATE';
  if not found then raise exception 'REASON_INVALID'; end if;
  if v_reason_freetext and btrim(coalesce(p_note, '')) = '' then
    raise exception 'REASON_NOTE_REQUIRED';
  end if;
  v_reason := case
    when v_reason_freetext then btrim(p_note)
    else v_reason_label || coalesce(': ' || nullif(btrim(p_note), ''), '')
  end;

  update public.suppliers
     set status = 'INACTIVE', version = version + 1, updated_by = p_actor_id
   where id = p_id
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.supplier.deactivated', p_actor_id, p_actor_label, 'Supplier', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000', v_reason, p_changes,
     p_request_id, p_ip, p_user_agent);

  update public.supplier_command_receipts
     set result_row = to_jsonb(v_row), completed_at = now()
   where command_key = p_command_key;
  return v_row;
end;
$$;

revoke all on function public.create_supplier(uuid,text,text,text,text,text,uuid,text,jsonb,text,inet,text) from public;
revoke all on function public.update_supplier(uuid,uuid,integer,text,text,text,text,text,uuid,text,jsonb,text,inet,text) from public;
revoke all on function public.deactivate_supplier(uuid,uuid,integer,uuid,text,uuid,text,jsonb,text,inet,text) from public;
grant execute on function public.create_supplier(uuid,text,text,text,text,text,uuid,text,jsonb,text,inet,text) to service_role;
grant execute on function public.update_supplier(uuid,uuid,integer,text,text,text,text,text,uuid,text,jsonb,text,inet,text) to service_role;
grant execute on function public.deactivate_supplier(uuid,uuid,integer,uuid,text,uuid,text,jsonb,text,inet,text) to service_role;
