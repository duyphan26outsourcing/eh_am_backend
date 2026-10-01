-- =============================================================================
-- 18 — Đổi người chịu trách nhiệm tài sản (M03, UC-AST-05). Chạy sau 17.
-- Không sửa migration 01–17.
-- =============================================================================

alter table public.asset_command_receipts
  drop constraint if exists asset_command_receipts_operation_check;
alter table public.asset_command_receipts
  add constraint asset_command_receipts_operation_check
  check (operation in ('CREATE', 'UPDATE_DESCRIPTION', 'CHANGE_RESPONSIBLE'));

create or replace function public.change_asset_responsible(
  p_command_key uuid,
  p_asset_id uuid,
  p_responsible_user_id uuid,
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
  v_asset public.assets;
  v_location public.locations;
  v_responsible public.user_profiles;
  v_reason public.reason_codes;
  v_payload jsonb;
  v_reason_note text := nullif(btrim(p_reason_note), '');
  v_reason_text text;
  v_old_responsible_id uuid;
  v_result jsonb;
begin
  v_payload := jsonb_build_object(
    'asset_id', p_asset_id, 'responsible_user_id', p_responsible_user_id,
    'expected_version', p_expected_version, 'reason_code_id', p_reason_code_id,
    'reason_note', v_reason_note);
  insert into public.asset_command_receipts(command_key, actor_id, operation, payload)
    values (p_command_key, p_actor_id, 'CHANGE_RESPONSIBLE', v_payload)
    on conflict do nothing;
  if not found then
    select * into v_receipt from public.asset_command_receipts where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.operation <> 'CHANGE_RESPONSIBLE'
       or v_receipt.payload <> v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_row is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_row || jsonb_build_object('is_replay', true);
  end if;

  select * into v_asset from public.assets where id = p_asset_id for update;
  if not found then raise exception 'ASSET_NOT_FOUND'; end if;
  if v_asset.lifecycle_status in ('DISPOSED', 'CANCELLED') then
    raise exception 'ASSET_READ_ONLY';
  end if;
  if v_asset.profile_version is distinct from p_expected_version then
    raise exception 'RECORD_VERSION_CONFLICT';
  end if;
  if v_asset.responsible_user_id = p_responsible_user_id then
    raise exception 'RESPONSIBLE_UNCHANGED';
  end if;
  v_old_responsible_id := v_asset.responsible_user_id;
  select * into v_location from public.locations
    where id = v_asset.primary_location_id for share;
  if v_location.type = 'EXTERNAL' then
    raise exception 'ASSET_EXTERNAL_RESPONSIBILITY_LOCKED';
  end if;

  select * into v_responsible from public.user_profiles
    where id = p_responsible_user_id for share;
  if not found or v_responsible.status <> 'ACTIVE' then
    raise exception 'RESPONSIBLE_NOT_ON_LOCATION';
  end if;
  if not exists (
    select 1 from public.context_role_assignments cra
    where cra.subject_type = 'USER' and cra.subject_id = p_responsible_user_id
      and cra.effective_from <= now()
      and (cra.effective_to is null or cra.effective_to > now())
      and (
        (cra.context_type = 'LOCATION' and cra.context_id = v_asset.primary_location_id
          and cra.role_code in ('LOCATION_MANAGER', 'LOCATION_STAFF'))
        or (cra.context_type = 'PLATFORM' and cra.role_code = 'ASSET_MANAGER')
      )
  ) then raise exception 'RESPONSIBLE_NOT_ON_LOCATION'; end if;

  select * into v_reason from public.reason_codes
    where id = p_reason_code_id and status = 'ACTIVE'
      and reason_group = 'PROFILE_EDIT' for share;
  if not found or (v_reason.is_freetext and v_reason_note is null) then
    raise exception 'REASON_INVALID';
  end if;
  v_reason_text := case when v_reason.is_freetext then v_reason_note
                        when v_reason_note is null then v_reason.label
                        else v_reason.label || ': ' || v_reason_note end;

  begin
    update public.assets set
      responsible_user_id = p_responsible_user_id,
      profile_version = profile_version + 1,
      updated_at = now()
    where id = p_asset_id returning * into v_asset;
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata,
      request_id, ip_address, user_agent
    ) values (
      'asset.responsible.changed', p_actor_id, nullif(p_actor_label, ''),
      'Asset', v_asset.id, 'LOCATION', v_asset.primary_location_id,
      v_reason_text,
      jsonb_build_object('responsible_user_id', jsonb_build_object(
        'before', v_old_responsible_id,
        'after', p_responsible_user_id)),
      jsonb_build_object('asset_code', v_asset.asset_code, 'reason_code_id', p_reason_code_id),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', v_asset.id, 'asset_code', v_asset.asset_code,
    'responsible_user_id', v_asset.responsible_user_id,
    'profile_version', v_asset.profile_version, 'updated_at', v_asset.updated_at,
    'is_replay', false);
  update public.asset_command_receipts set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on function public.change_asset_responsible(
  uuid,uuid,uuid,integer,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.change_asset_responsible(
  uuid,uuid,uuid,integer,uuid,text,uuid,text,text,inet,text
) to service_role;
