-- =============================================================================
-- UC-IAM-10 — Gán vai trò theo phạm vi
-- Chạy sau 07. Không sửa migration đã chạy.
-- =============================================================================

create table if not exists public.role_assignment_command_receipts (
  command_key uuid primary key,
  actor_id uuid not null,
  employee_id uuid not null,
  operation text not null check (operation in ('GRANT')),
  result_rows jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.role_assignment_command_receipts enable row level security;
revoke all on table public.role_assignment_command_receipts from public, anon, authenticated;
grant select, insert, update on table public.role_assignment_command_receipts to service_role;

create or replace function public.grant_role_assignments(
  p_command_key uuid,
  p_employee_id uuid,
  p_role_code text,
  p_context_type text,
  p_context_ids uuid[],
  p_effective_from timestamptz,
  p_effective_to timestamptz,
  p_reason text,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_receipt public.role_assignment_command_receipts;
  v_profile public.user_profiles;
  v_context_id uuid;
  v_assignment public.context_role_assignments;
  v_results jsonb := '[]'::jsonb;
  v_platform_id constant uuid := '00000000-0000-0000-0000-000000000000';
begin
  insert into public.role_assignment_command_receipts(
    command_key, actor_id, employee_id, operation
  ) values (p_command_key, p_actor_id, p_employee_id, 'GRANT')
  on conflict do nothing;

  if not found then
    select * into v_receipt
      from public.role_assignment_command_receipts
      where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.employee_id <> p_employee_id
       or v_receipt.operation <> 'GRANT' then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_rows is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_rows;
  end if;

  select * into v_profile from public.user_profiles
    where id = p_employee_id for update;
  if not found or v_profile.status <> 'ACTIVE' then
    raise exception 'EMPLOYEE_NOT_ACTIVE';
  end if;

  if p_role_code = 'SYSTEM_ADMIN'
     or p_role_code not in (
       'EXECUTIVE','CHIEF_ACCOUNTANT','ASSET_ACCOUNTANT','ASSET_MANAGER',
       'LOCATION_MANAGER','LOCATION_STAFF','TECHNICIAN','AUDITOR'
     ) then
    raise exception 'ROLE_NOT_ASSIGNABLE';
  end if;
  if nullif(btrim(p_reason), '') is null then raise exception 'REASON_REQUIRED'; end if;
  if p_effective_from is null
     or (p_effective_to is not null and p_effective_to < p_effective_from) then
    raise exception 'EFFECTIVE_WINDOW_INVALID';
  end if;

  if p_role_code in ('LOCATION_MANAGER','LOCATION_STAFF') then
    if p_context_type <> 'LOCATION'
       or coalesce(array_length(p_context_ids, 1), 0) = 0 then
      raise exception 'ROLE_CONTEXT_INVALID';
    end if;
    if p_role_code = 'LOCATION_STAFF' and array_length(p_context_ids, 1) <> 1 then
      raise exception 'LOCATION_STAFF_SINGLE_SCOPE';
    end if;
  else
    if p_context_type <> 'PLATFORM'
       or p_context_ids <> array[v_platform_id]::uuid[] then
      raise exception 'ROLE_CONTEXT_INVALID';
    end if;
  end if;

  if (select count(*) from unnest(p_context_ids) value)
     <> (select count(distinct value) from unnest(p_context_ids) value) then
    raise exception 'ROLE_CONTEXT_INVALID';
  end if;

  foreach v_context_id in array p_context_ids loop
    if p_context_type = 'LOCATION' and not exists (
      select 1 from public.locations
      where id = v_context_id and status = 'ACTIVE' and type <> 'EXTERNAL'
    ) then
      raise exception 'LOCATION_NOT_ACTIVE:%', v_context_id;
    end if;

    perform 1 from public.context_role_assignments
      where subject_type = 'USER' and subject_id = p_employee_id
      for update;

    if exists (
      select 1 from public.context_role_assignments existing
      where existing.subject_type = 'USER'
        and existing.subject_id = p_employee_id
        and existing.context_type = p_context_type
        and existing.context_id = v_context_id
        and existing.role_code = p_role_code
        and tstzrange(
          existing.effective_from,
          coalesce(existing.effective_to, 'infinity'::timestamptz), '[]'
        ) && tstzrange(
          p_effective_from,
          coalesce(p_effective_to, 'infinity'::timestamptz), '[]'
        )
    ) then
      raise exception 'ROLE_ASSIGNMENT_OVERLAP:%', v_context_id;
    end if;

    if p_role_code = 'LOCATION_STAFF' and exists (
      select 1 from public.context_role_assignments existing
      where existing.subject_type = 'USER'
        and existing.subject_id = p_employee_id
        and existing.role_code = 'LOCATION_STAFF'
        and existing.context_id <> v_context_id
        and tstzrange(
          existing.effective_from,
          coalesce(existing.effective_to, 'infinity'::timestamptz), '[]'
        ) && tstzrange(
          p_effective_from,
          coalesce(p_effective_to, 'infinity'::timestamptz), '[]'
        )
    ) then
      raise exception 'LOCATION_STAFF_OTHER_SCOPE';
    end if;

    insert into public.context_role_assignments(
      subject_type, subject_id, context_type, context_id, role_code,
      effective_from, effective_to, granted_by, grant_reason
    ) values (
      'USER', p_employee_id, p_context_type, v_context_id, p_role_code,
      p_effective_from, p_effective_to, p_actor_id, btrim(p_reason)
    ) returning * into v_assignment;

    begin
      insert into public.audit_events(
        event_code, actor_id, actor_label, subject_type, subject_id,
        context_type, context_id, reason, changes, metadata,
        request_id, ip_address, user_agent
      ) values (
        'iam.role.granted', p_actor_id, nullif(p_actor_label, ''),
        'UserProfile', p_employee_id, p_context_type, v_context_id,
        btrim(p_reason),
        jsonb_build_object(
          'role_code', jsonb_build_object('before', null, 'after', p_role_code),
          'effective_from', jsonb_build_object('before', null, 'after', v_assignment.effective_from),
          'effective_to', jsonb_build_object('before', null, 'after', v_assignment.effective_to)
        ),
        jsonb_build_object('assignment_id', v_assignment.id),
        nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
      );
    exception when others then
      raise exception 'AUDIT_WRITE_FAILED';
    end;

    v_results := v_results || jsonb_build_array(jsonb_build_object(
      'id', v_assignment.id,
      'employee_id', v_assignment.subject_id,
      'role_code', v_assignment.role_code,
      'context_type', v_assignment.context_type,
      'context_id', v_assignment.context_id,
      'effective_from', v_assignment.effective_from,
      'effective_to', v_assignment.effective_to,
      'grant_reason', v_assignment.grant_reason,
      'created_at', v_assignment.created_at
    ));
  end loop;

  update public.role_assignment_command_receipts
    set result_rows = v_results, completed_at = now()
    where command_key = p_command_key;
  return v_results;
end $$;

revoke all on function public.grant_role_assignments(
  uuid,uuid,text,text,uuid[],timestamptz,timestamptz,text,
  uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.grant_role_assignments(
  uuid,uuid,text,text,uuid[],timestamptz,timestamptz,text,
  uuid,text,text,inet,text
) to service_role;
