-- =============================================================================
-- 12 — Khóa / mở khóa tài khoản (UC-IAM-12). Chạy sau 11.
-- KHÔNG sửa migration 01–11 đã chạy.
-- =============================================================================

create table if not exists public.account_status_command_receipts (
  command_key uuid primary key,
  actor_id uuid not null,
  employee_id uuid not null,
  action text not null check (action in ('LOCK', 'UNLOCK')),
  reason_code_id uuid not null,
  reason_note text,
  result_row jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.account_status_command_receipts enable row level security;

create or replace function public.change_employee_account_status(
  p_command_key uuid,
  p_employee_id uuid,
  p_action text,
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
  v_receipt public.account_status_command_receipts;
  v_profile public.user_profiles;
  v_expected text;
  v_next text;
  v_reason_group text;
  v_reason public.reason_codes;
  v_reason_text text;
  v_active_admins integer;
  v_is_system_admin boolean;
  v_result jsonb;
begin
  if p_action not in ('LOCK', 'UNLOCK') then
    raise exception 'ACCOUNT_STATE_CONFLICT';
  end if;

  insert into public.account_status_command_receipts(
    command_key, actor_id, employee_id, action, reason_code_id, reason_note
  ) values (
    p_command_key, p_actor_id, p_employee_id, p_action, p_reason_code_id,
    nullif(btrim(p_reason_note), '')
  ) on conflict do nothing;

  if not found then
    select * into v_receipt
      from public.account_status_command_receipts
      where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.employee_id <> p_employee_id
       or v_receipt.action <> p_action
       or v_receipt.reason_code_id <> p_reason_code_id
       or v_receipt.reason_note is distinct from nullif(btrim(p_reason_note), '') then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_row is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_row || jsonb_build_object('is_replay', true);
  end if;

  v_expected := case p_action when 'LOCK' then 'ACTIVE' else 'SUSPENDED' end;
  v_next := case p_action when 'LOCK' then 'SUSPENDED' else 'ACTIVE' end;
  v_reason_group := case p_action when 'LOCK' then 'ACCOUNT_LOCK' else 'ACCOUNT_UNLOCK' end;

  select * into v_reason from public.reason_codes
    where id = p_reason_code_id
      and status = 'ACTIVE'
      and reason_group = v_reason_group;
  if not found or (v_reason.is_freetext and nullif(btrim(p_reason_note), '') is null) then
    raise exception 'REASON_INVALID';
  end if;

  -- Một advisory lock chung đóng race "hai quản trị viên cuối cùng khóa nhau" trên hai hàng khác nhau.
  if p_action = 'LOCK' then
    perform pg_advisory_xact_lock(hashtext('iam.active_system_admin'));
  end if;

  select * into v_profile from public.user_profiles
    where id = p_employee_id for update;
  if not found then raise exception 'EMPLOYEE_NOT_FOUND'; end if;
  if v_profile.status <> v_expected then raise exception 'ACCOUNT_STATE_CONFLICT'; end if;
  if p_action = 'LOCK' and p_employee_id = p_actor_id then
    raise exception 'SELF_ACCOUNT_LOCK_FORBIDDEN';
  end if;

  if p_action = 'LOCK' then
    select exists(
      select 1 from public.context_role_assignments cra
      where cra.subject_type = 'USER'
        and cra.subject_id = p_employee_id
        and cra.role_code = 'SYSTEM_ADMIN'
        and cra.context_type = 'PLATFORM'
        and cra.effective_from <= now()
        and (cra.effective_to is null or cra.effective_to > now())
    ) into v_is_system_admin;

    if v_is_system_admin then
      select count(distinct cra.subject_id) into v_active_admins
      from public.context_role_assignments cra
      join public.user_profiles up on up.id = cra.subject_id and up.status = 'ACTIVE'
      where cra.subject_type = 'USER'
        and cra.role_code = 'SYSTEM_ADMIN'
        and cra.context_type = 'PLATFORM'
        and cra.effective_from <= now()
        and (cra.effective_to is null or cra.effective_to > now());
      if v_active_admins <= 1 then raise exception 'LAST_SYSTEM_ADMIN_REQUIRED'; end if;
    end if;
  end if;

  update public.user_profiles
    set status = v_next,
        profile_version = profile_version + 1,
        updated_at = now()
    where id = p_employee_id
    returning * into v_profile;

  v_reason_text := v_reason.label ||
    case when nullif(btrim(p_reason_note), '') is null then '' else ': ' || btrim(p_reason_note) end;

  begin
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      reason, changes, metadata, request_id, ip_address, user_agent
    ) values (
      case p_action when 'LOCK' then 'iam.account.locked' else 'iam.account.unlocked' end,
      p_actor_id, nullif(p_actor_label, ''), 'UserProfile', p_employee_id,
      v_reason_text,
      jsonb_build_object('status', jsonb_build_object('before', v_expected, 'after', v_next)),
      jsonb_build_object('reason_code_id', p_reason_code_id, 'reason_code', v_reason.code),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', p_employee_id,
    'status', v_next,
    'profile_version', v_profile.profile_version,
    'is_replay', false
  );
  update public.account_status_command_receipts
    set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

-- Side effect hậu transaction. Xóa session chủ động có thể lỗi mà không được hoàn tác trạng thái khóa.
-- Xóa auth.sessions sẽ làm refresh token gắn với session mất hiệu lực theo ràng buộc của GoTrue.
create or replace function public.revoke_employee_sessions(p_employee_id uuid)
returns bigint
language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  v_count bigint;
begin
  -- ⚠️ Chỉ xóa phiên khi tài khoản THỰC SỰ đang bị khóa/nghỉ. Nếu không, một lệnh UNLOCK xen vào
  -- giữa commit và lần gọi revoke hậu-commit sẽ khiến ta xóa phiên của một tài khoản vừa active lại.
  if not exists (
    select 1 from public.user_profiles
    where id = p_employee_id and status in ('SUSPENDED', 'DEACTIVATED')
  ) then
    return 0;
  end if;
  delete from auth.sessions where user_id = p_employee_id;
  get diagnostics v_count = row_count;
  return v_count;
end $$;

revoke all on table public.account_status_command_receipts from public, anon, authenticated;
grant all on table public.account_status_command_receipts to service_role;

revoke all on function public.change_employee_account_status(
  uuid,uuid,text,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.change_employee_account_status(
  uuid,uuid,text,uuid,text,uuid,text,text,inet,text
) to service_role;

revoke all on function public.revoke_employee_sessions(uuid) from public, anon, authenticated;
grant execute on function public.revoke_employee_sessions(uuid) to service_role;

