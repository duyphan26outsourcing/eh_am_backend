-- =============================================================================
-- MIGRATION 02n: ĐỊA CHỈ LOCATION CÓ CẤU TRÚC (UC-MDM-01 bugfix)
-- Chạy sau 02m. Giữ `address` làm chuỗi trình bày tương thích dữ liệu cũ.
-- =============================================================================

alter table public.locations
  add column if not exists province_code text,
  add column if not exists province_name text,
  add column if not exists ward_name text,
  add column if not exists address_detail text;

alter table public.locations
  drop constraint if exists locations_province_code_length,
  drop constraint if exists locations_province_name_length,
  drop constraint if exists locations_ward_name_length,
  drop constraint if exists locations_address_detail_length,
  add constraint locations_province_code_length
    check (province_code is null or char_length(btrim(province_code)) between 1 and 20),
  add constraint locations_province_name_length
    check (province_name is null or char_length(btrim(province_name)) between 1 and 120),
  add constraint locations_ward_name_length
    check (ward_name is null or char_length(btrim(ward_name)) between 1 and 120),
  add constraint locations_address_detail_length
    check (address_detail is null or char_length(btrim(address_detail)) between 1 and 200);

create table if not exists public.location_command_receipts (
  command_key uuid primary key,
  operation text not null check (operation in ('CREATE', 'UPDATE')),
  location_id uuid null references public.locations(id),
  actor_id uuid not null,
  result_row jsonb null,
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);
alter table public.location_command_receipts enable row level security;
revoke all on table public.location_command_receipts from anon, authenticated;

drop function if exists public.create_location(text,text,text,text,uuid,uuid,text,jsonb,text,text,inet,text);
drop function if exists public.update_location(uuid,integer,text,text,uuid,uuid,text,jsonb,text,text,inet,text);

create function public.create_location(
  p_command_key uuid,
  p_code text,
  p_name text,
  p_type text,
  p_province_code text,
  p_province_name text,
  p_ward_name text,
  p_address_detail text,
  p_cost_center_id uuid,
  p_actor_id uuid,
  p_actor_label text,
  p_changes jsonb,
  p_reason text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
)
returns public.locations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.locations;
  v_receipt public.location_command_receipts;
  v_address text;
begin
  insert into public.location_command_receipts(command_key, operation, actor_id)
  values (p_command_key, 'CREATE', p_actor_id) on conflict do nothing;
  if not found then
    select * into v_receipt from public.location_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'CREATE' or v_receipt.actor_id <> p_actor_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return jsonb_populate_record(null::public.locations, v_receipt.result_row);
  end if;

  if nullif(btrim(p_province_code), '') is null
     or nullif(btrim(p_province_name), '') is null
     or nullif(btrim(p_ward_name), '') is null
     or nullif(btrim(p_address_detail), '') is null then
    raise exception 'LOCATION_ADDRESS_REQUIRED';
  end if;

  v_address := concat_ws(', ', btrim(p_address_detail), btrim(p_ward_name), btrim(p_province_name));
  if char_length(v_address) > 300 then
    raise exception 'LOCATION_ADDRESS_TOO_LONG';
  end if;

  insert into public.locations
    (code, name, type, address, province_code, province_name, ward_name, address_detail,
     default_cost_center_id, created_by, updated_by)
  values
    (p_code, p_name, p_type, v_address, btrim(p_province_code), btrim(p_province_name),
     btrim(p_ward_name), btrim(p_address_detail), p_cost_center_id, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.location.created', p_actor_id, p_actor_label, 'Location', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  update public.location_command_receipts
     set location_id = v_row.id, result_row = to_jsonb(v_row), completed_at = now()
   where command_key = p_command_key;

  return v_row;
end;
$$;

create function public.update_location(
  p_command_key uuid,
  p_id uuid,
  p_expected_version integer,
  p_name text,
  p_province_code text,
  p_province_name text,
  p_ward_name text,
  p_address_detail text,
  p_cost_center_id uuid,
  p_actor_id uuid,
  p_actor_label text,
  p_changes jsonb,
  p_reason text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
)
returns public.locations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.locations;
  v_receipt public.location_command_receipts;
  v_address text;
begin
  insert into public.location_command_receipts(command_key, operation, location_id, actor_id)
  values (p_command_key, 'UPDATE', p_id, p_actor_id) on conflict do nothing;
  if not found then
    select * into v_receipt from public.location_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'UPDATE' or v_receipt.actor_id <> p_actor_id
       or v_receipt.location_id <> p_id then raise exception 'IDEMPOTENCY_KEY_REUSED'; end if;
    return jsonb_populate_record(null::public.locations, v_receipt.result_row);
  end if;

  if nullif(btrim(p_province_code), '') is null
     or nullif(btrim(p_province_name), '') is null
     or nullif(btrim(p_ward_name), '') is null
     or nullif(btrim(p_address_detail), '') is null then
    raise exception 'LOCATION_ADDRESS_REQUIRED';
  end if;

  v_address := concat_ws(', ', btrim(p_address_detail), btrim(p_ward_name), btrim(p_province_name));
  if char_length(v_address) > 300 then
    raise exception 'LOCATION_ADDRESS_TOO_LONG';
  end if;

  update public.locations
     set name = p_name,
         address = v_address,
         province_code = btrim(p_province_code),
         province_name = btrim(p_province_name),
         ward_name = btrim(p_ward_name),
         address_detail = btrim(p_address_detail),
         default_cost_center_id = p_cost_center_id,
         version = version + 1,
         updated_by = p_actor_id
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

  update public.location_command_receipts
     set result_row = to_jsonb(v_row), completed_at = now()
   where command_key = p_command_key;

  return v_row;
end;
$$;

revoke all on function public.create_location(uuid,text,text,text,text,text,text,text,uuid,uuid,text,jsonb,text,text,inet,text) from public;
revoke all on function public.update_location(uuid,uuid,integer,text,text,text,text,text,uuid,uuid,text,jsonb,text,text,inet,text) from public;
grant execute on function public.create_location(uuid,text,text,text,text,text,text,text,uuid,uuid,text,jsonb,text,text,inet,text) to service_role;
grant execute on function public.update_location(uuid,uuid,integer,text,text,text,text,text,uuid,uuid,text,jsonb,text,text,inet,text) to service_role;
