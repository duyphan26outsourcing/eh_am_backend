-- =============================================================================
-- MIGRATION 04: UC-IAM-06 — KÍCH HOẠT TÀI KHOẢN ĐƯỢC MỜI
-- Chạy sau 03. KHÔNG sửa migration 03 đã chạy.
-- =============================================================================

alter table public.activation_invites
  drop constraint if exists activation_invites_status_check;

alter table public.activation_invites
  add column if not exists activation_started_at timestamptz null,
  add constraint activation_invites_status_check
    check (status in ('SENT','ACTIVATING','ACCEPTED','EXPIRED','REVOKED'));

-- Một người chỉ có một lời mời còn mở, kể cả lúc một request đang chiếm lời mời.
drop index if exists public.uq_activation_invites_open_user;
create unique index uq_activation_invites_open_user
  on public.activation_invites(user_id)
  where status in ('SENT','ACTIVATING');

create or replace function public.preview_activation_invite(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.activation_invites;
  v_profile public.user_profiles;
begin
  -- Đánh dấu hết hạn ở một lệnh không ném exception để thay đổi này được commit.
  update public.activation_invites
    set status = 'EXPIRED'
    where user_id = p_user_id
      and expires_at <= now()
      and (
        status = 'SENT'
        or (status = 'ACTIVATING' and activation_started_at < now() - interval '2 minutes')
      );

  update public.activation_invites
    set status = 'SENT', activation_started_at = null
    where user_id = p_user_id
      and status = 'ACTIVATING'
      and expires_at > now()
      and activation_started_at < now() - interval '2 minutes';

  select * into v_invite from public.activation_invites
    where user_id = p_user_id order by created_at desc limit 1;
  if not found then return null; end if;

  select * into v_profile from public.user_profiles where id = p_user_id;
  if not found then return null; end if;

  return jsonb_build_object(
    'invite_id', v_invite.id,
    'user_id', v_invite.user_id,
    'display_name', v_profile.display_name,
    'work_email', v_profile.work_email,
    'status', v_invite.status,
    'expires_at', v_invite.expires_at,
    'must_change_password', v_profile.must_change_password,
    'profile_status', v_profile.status
  );
end $$;

create or replace function public.claim_activation_invite(p_user_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.activation_invites;
  v_claimed boolean := false;
begin
  update public.activation_invites
    set status = 'EXPIRED'
    where user_id = p_user_id and status = 'SENT' and expires_at <= now();

  -- Request bị treo quá hai phút không được khoá người dùng vĩnh viễn.
  update public.activation_invites
    set status = 'ACTIVATING', activation_started_at = now()
    where id = (
      select id from public.activation_invites
      where user_id = p_user_id
      order by created_at desc limit 1
    )
      and expires_at > now()
      and (
        status = 'SENT'
        or (status = 'ACTIVATING' and activation_started_at < now() - interval '2 minutes')
      )
    returning * into v_invite;

  if found then
    v_claimed := true;
  else
    select * into v_invite from public.activation_invites
      where user_id = p_user_id order by created_at desc limit 1;
    if not found then return null; end if;
  end if;

  return jsonb_build_object(
    'invite_id', v_invite.id,
    'user_id', v_invite.user_id,
    'status', v_invite.status,
    'claimed', v_claimed
  );
end $$;

create or replace function public.release_activation_invite(
  p_invite_id uuid, p_user_id uuid
) returns boolean
language sql security definer set search_path = public as $$
  update public.activation_invites
    set status = case when expires_at <= now() then 'EXPIRED' else 'SENT' end,
        activation_started_at = null
    where id = p_invite_id and user_id = p_user_id and status = 'ACTIVATING'
  returning true;
$$;

create or replace function public.complete_account_activation(
  p_invite_id uuid, p_user_id uuid,
  p_request_id text, p_ip inet, p_user_agent text
) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_invite public.activation_invites;
  v_profile public.user_profiles;
begin
  select * into v_invite from public.activation_invites
    where id = p_invite_id and user_id = p_user_id for update;
  if not found or v_invite.status <> 'ACTIVATING' then
    raise exception 'INVITATION_USED_OR_REPLACED';
  end if;

  select * into v_profile from public.user_profiles
    where id = p_user_id for update;
  if not found
     or v_profile.status <> 'PENDING_ACTIVATION'
     or v_profile.must_change_password then
    raise exception 'INVITATION_INVALID';
  end if;

  update public.activation_invites
    set status = 'ACCEPTED', accepted_at = now(), activation_started_at = null
    where id = p_invite_id;

  update public.user_profiles
    set status = 'ACTIVE', must_change_password = false
    where id = p_user_id;

  begin
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, changes, metadata, request_id, ip_address, user_agent
    ) values (
      'iam.employee.activated', p_user_id, v_profile.display_name,
      'UserProfile', p_user_id, 'PLATFORM',
      '00000000-0000-0000-0000-000000000000'::uuid,
      jsonb_build_object('status', jsonb_build_object(
        'before', 'PENDING_ACTIVATION', 'after', 'ACTIVE'
      )),
      jsonb_build_object('activation_method', 'EMAIL_INVITE'),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED';
  end;

  return true;
end $$;

revoke all on function public.preview_activation_invite(uuid) from public;
revoke all on function public.claim_activation_invite(uuid) from public;
revoke all on function public.release_activation_invite(uuid,uuid) from public;
revoke all on function public.complete_account_activation(uuid,uuid,text,inet,text) from public;

grant execute on function public.preview_activation_invite(uuid) to service_role;
grant execute on function public.claim_activation_invite(uuid) to service_role;
grant execute on function public.release_activation_invite(uuid,uuid) to service_role;
grant execute on function public.complete_account_activation(uuid,uuid,text,inet,text) to service_role;
