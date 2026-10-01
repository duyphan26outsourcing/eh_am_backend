-- =============================================================================
-- UC-IAM-07 — Gửi lại lời mời kích hoạt
-- Chạy sau 06. KHÔNG sửa các migration đã chạy.
-- =============================================================================

alter table public.employee_command_receipts
  drop constraint if exists employee_command_receipts_operation_check;

alter table public.employee_command_receipts
  add constraint employee_command_receipts_operation_check
    check (operation in ('CREATE', 'RESEND_INVITE')),
  add column if not exists delivery_status text null,
  add column if not exists delivered_at timestamptz null,
  add constraint employee_command_receipts_delivery_status_check
    check (delivery_status is null or delivery_status in ('PENDING', 'SENT', 'FAILED'));

create or replace function public.resend_employee_invite(
  p_command_key uuid,
  p_employee_id uuid,
  p_invite_token_hash text,
  p_invite_expires_at timestamptz,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_profile public.user_profiles;
  v_receipt public.employee_command_receipts;
  v_invite public.activation_invites;
  v_old_invite_ids jsonb;
  v_result jsonb;
begin
  insert into public.employee_command_receipts(
    command_key, operation, employee_id, actor_id, delivery_status
  ) values (
    p_command_key, 'RESEND_INVITE', p_employee_id, p_actor_id, 'PENDING'
  ) on conflict do nothing;

  if not found then
    select * into v_receipt
      from public.employee_command_receipts
      where command_key = p_command_key;
    if v_receipt.operation <> 'RESEND_INVITE'
       or v_receipt.actor_id <> p_actor_id
       or v_receipt.employee_id <> p_employee_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_row is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_row || jsonb_build_object(
      'delivery_status', v_receipt.delivery_status,
      'is_replay', true
    );
  end if;

  select * into v_profile
    from public.user_profiles
    where id = p_employee_id
    for update;

  if not found then raise exception 'ACCOUNT_STATE_CONFLICT'; end if;
  if v_profile.status <> 'PENDING_ACTIVATION'
     or v_profile.must_change_password
     or v_profile.work_email is null
     or not exists (
       select 1 from public.activation_invites where user_id = p_employee_id
     ) then
    raise exception 'ACCOUNT_STATE_CONFLICT';
  end if;
  if nullif(p_invite_token_hash, '') is null or p_invite_expires_at <= now() then
    raise exception 'INVITE_INVALID';
  end if;

  select coalesce(jsonb_agg(id order by created_at), '[]'::jsonb)
    into v_old_invite_ids
    from public.activation_invites
    where user_id = p_employee_id;

  update public.activation_invites
    set status = 'REVOKED', activation_started_at = null
    where user_id = p_employee_id and status <> 'ACCEPTED';

  insert into public.activation_invites(
    user_id, token_hash, status, expires_at, created_by
  ) values (
    p_employee_id, p_invite_token_hash, 'SENT', p_invite_expires_at, p_actor_id
  ) returning * into v_invite;

  begin
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, changes, metadata, request_id, ip_address, user_agent
    ) values (
      'iam.activation_invite.resent', p_actor_id, nullif(p_actor_label, ''),
      'UserProfile', p_employee_id, 'PLATFORM',
      '00000000-0000-0000-0000-000000000000',
      jsonb_build_object('invite_status', jsonb_build_object('before', 'REVOKED', 'after', 'SENT')),
      jsonb_build_object('new_invite_id', v_invite.id, 'replaced_invite_ids', v_old_invite_ids),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED';
  end;

  v_result := jsonb_build_object(
    'employee_id', v_profile.id,
    'display_name', v_profile.display_name,
    'work_email', v_profile.work_email,
    'invite_id', v_invite.id,
    'sent_at', v_invite.created_at,
    'expires_at', v_invite.expires_at,
    'delivery_status', 'PENDING',
    'is_replay', false
  );

  update public.employee_command_receipts
    set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on function public.resend_employee_invite(
  uuid,uuid,text,timestamptz,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.resend_employee_invite(
  uuid,uuid,text,timestamptz,uuid,text,text,inet,text
) to service_role;

create or replace function public.complete_resend_invite_delivery(
  p_command_key uuid,
  p_delivery_status text,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_receipt public.employee_command_receipts;
begin
  if p_delivery_status not in ('SENT', 'FAILED') then
    raise exception 'DELIVERY_STATUS_INVALID';
  end if;
  select * into v_receipt
    from public.employee_command_receipts
    where command_key = p_command_key
    for update;
  if not found
     or v_receipt.operation <> 'RESEND_INVITE'
     or v_receipt.actor_id <> p_actor_id then
    raise exception 'IDEMPOTENCY_KEY_REUSED';
  end if;
  if v_receipt.delivery_status <> 'PENDING' then return; end if;

  update public.employee_command_receipts
    set delivery_status = p_delivery_status,
        delivered_at = case when p_delivery_status = 'SENT' then now() else null end
    where command_key = p_command_key;

  if p_delivery_status = 'FAILED' then
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, changes, metadata, request_id, ip_address, user_agent
    ) values (
      'iam.activation_invite.email_failed', p_actor_id, nullif(p_actor_label, ''),
      'UserProfile', v_receipt.employee_id, 'PLATFORM',
      '00000000-0000-0000-0000-000000000000', '{}'::jsonb,
      jsonb_build_object('invite_id', v_receipt.result_row ->> 'invite_id'),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  end if;
end $$;

revoke all on function public.complete_resend_invite_delivery(
  uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.complete_resend_invite_delivery(
  uuid,text,uuid,text,text,inet,text
) to service_role;

revoke all on table public.employee_command_receipts from public, anon, authenticated;
grant select, insert, update on table public.employee_command_receipts to service_role;

