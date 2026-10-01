-- =============================================================================
-- 17 — Sửa thông tin mô tả tài sản (M03, UC-AST-03). Chạy sau 16.
-- Không sửa migration 01–16 đã chạy.
-- =============================================================================

alter table public.asset_command_receipts
  drop constraint if exists asset_command_receipts_operation_check;
alter table public.asset_command_receipts
  add constraint asset_command_receipts_operation_check
  check (operation in ('CREATE', 'UPDATE_DESCRIPTION'));

create or replace function public.update_asset_description(
  p_command_key uuid,
  p_asset_id uuid,
  p_name text,
  p_asset_type_id uuid,
  p_serial text,
  p_note text,
  p_expected_version integer,
  p_reason_code_id uuid,
  p_reason_note text,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_receipt public.asset_command_receipts;
  v_old public.assets;
  v_asset public.assets;
  v_old_type public.asset_types;
  v_new_type public.asset_types;
  v_reason public.reason_codes;
  v_name text := btrim(p_name);
  v_serial text := nullif(btrim(p_serial), '');
  v_note text := nullif(btrim(p_note), '');
  v_reason_note text := nullif(btrim(p_reason_note), '');
  v_payload jsonb;
  v_changes jsonb := '{}'::jsonb;
  v_result jsonb;
  v_reason_text text;
  v_constraint text;
begin
  v_payload := jsonb_build_object(
    'asset_id', p_asset_id, 'name', v_name, 'asset_type_id', p_asset_type_id,
    'serial', v_serial, 'note', v_note, 'expected_version', p_expected_version,
    'reason_code_id', p_reason_code_id, 'reason_note', v_reason_note);

  insert into public.asset_command_receipts(command_key, actor_id, operation, payload)
    values (p_command_key, p_actor_id, 'UPDATE_DESCRIPTION', v_payload)
    on conflict do nothing;
  if not found then
    select * into v_receipt from public.asset_command_receipts
      where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.operation <> 'UPDATE_DESCRIPTION'
       or v_receipt.payload <> v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_row is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_row || jsonb_build_object('is_replay', true);
  end if;

  select * into v_old from public.assets where id = p_asset_id for update;
  if not found then raise exception 'ASSET_NOT_FOUND'; end if;
  if v_old.lifecycle_status in ('DISPOSED', 'CANCELLED') then
    raise exception 'ASSET_READ_ONLY';
  end if;
  if p_expected_version is null or v_old.profile_version <> p_expected_version then
    raise exception 'RECORD_VERSION_CONFLICT';
  end if;
  if coalesce(char_length(v_name), 0) < 1 or char_length(v_name) > 200 then
    raise exception 'ASSET_NAME_INVALID';
  end if;

  select * into v_old_type from public.asset_types where id = v_old.asset_type_id;
  select * into v_new_type from public.asset_types
    where id = p_asset_type_id for share;
  if not found or v_new_type.status <> 'ACTIVE'
     or v_new_type.parent_id is null or v_new_type.asset_kind is null then
    raise exception 'ASSET_TYPE_INVALID';
  end if;
  if v_new_type.serial_required and v_serial is null then
    raise exception 'ASSET_SERIAL_REQUIRED';
  end if;

  if p_reason_code_id is not null then
    select * into v_reason from public.reason_codes
      where id = p_reason_code_id and status = 'ACTIVE'
        and reason_group = 'PROFILE_EDIT' for share;
    if not found or (v_reason.is_freetext and v_reason_note is null) then
      raise exception 'REASON_INVALID';
    end if;
    v_reason_text := case when v_reason.is_freetext then v_reason_note
                          when v_reason_note is null then v_reason.label
                          else v_reason.label || ': ' || v_reason_note end;
  end if;
  if v_old_type.asset_kind is distinct from v_new_type.asset_kind
     and p_reason_code_id is null then
    raise exception 'REASON_INVALID';
  end if;

  if v_old.name is distinct from v_name then
    v_changes := v_changes || jsonb_build_object(
      'name', jsonb_build_object('before', v_old.name, 'after', v_name));
  end if;
  if v_old.asset_type_id is distinct from p_asset_type_id then
    v_changes := v_changes || jsonb_build_object(
      'asset_type_id', jsonb_build_object('before', v_old.asset_type_id, 'after', p_asset_type_id));
  end if;
  if v_old.serial is distinct from v_serial then
    v_changes := v_changes || jsonb_build_object(
      'serial', jsonb_build_object('before', v_old.serial, 'after', v_serial));
  end if;
  if v_old.note is distinct from v_note then
    v_changes := v_changes || jsonb_build_object(
      'note', jsonb_build_object('before', v_old.note, 'after', v_note));
  end if;
  if v_changes = '{}'::jsonb then raise exception 'NO_CHANGES'; end if;

  begin
    update public.assets set
      name = v_name,
      asset_type_id = p_asset_type_id,
      serial = v_serial,
      note = v_note,
      profile_version = profile_version + 1,
      updated_at = now()
    where id = p_asset_id returning * into v_asset;

    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata,
      request_id, ip_address, user_agent
    ) values (
      'asset.description.updated', p_actor_id, nullif(p_actor_label, ''),
      'Asset', v_asset.id, 'LOCATION', v_asset.primary_location_id,
      v_reason_text, v_changes,
      jsonb_strip_nulls(jsonb_build_object(
        'asset_code', v_asset.asset_code, 'reason_code_id', p_reason_code_id)),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception
    when unique_violation then
      get stacked diagnostics v_constraint = constraint_name;
      if v_constraint = 'uq_asset_serial_per_type' then
        raise exception 'DUPLICATE_RECORD';
      end if;
      raise;
    when others then
      if sqlerrm like '%DUPLICATE_RECORD%' then raise; end if;
      raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', v_asset.id, 'asset_code', v_asset.asset_code, 'name', v_asset.name,
    'asset_type_id', v_asset.asset_type_id, 'serial', v_asset.serial,
    'note', v_asset.note, 'profile_version', v_asset.profile_version,
    'updated_at', v_asset.updated_at, 'is_replay', false);
  update public.asset_command_receipts
    set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on function public.update_asset_description(
  uuid,uuid,text,uuid,text,text,integer,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.update_asset_description(
  uuid,uuid,text,uuid,text,text,integer,uuid,text,uuid,text,text,inet,text
) to service_role;
