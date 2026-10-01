-- =============================================================================
-- MIGRATION 03: UC-IAM-05 — THÊM NHÂN VIÊN MỚI
-- Chạy sau 02p. KHÔNG sửa migration 01 đã chạy.
-- =============================================================================

alter table public.user_profiles drop constraint if exists user_profiles_status_check;
alter table public.user_profiles drop constraint if exists user_profiles_employee_code_check;
alter table public.user_profiles drop constraint if exists user_profiles_work_email_check;
alter table public.user_profiles drop constraint if exists user_profiles_phone_check;
alter table public.user_profiles drop constraint if exists user_profiles_job_title_check;
alter table public.user_profiles drop constraint if exists user_profiles_employment_type_check;
alter table public.user_profiles drop constraint if exists user_profiles_profile_version_check;
alter table public.user_profiles drop constraint if exists user_profiles_manager_not_self;

alter table public.user_profiles
  add column if not exists work_email text null,
  add column if not exists primary_location_id uuid null references public.locations(id),
  add column if not exists department_id uuid null references public.departments(id),
  add column if not exists manager_id uuid null references public.user_profiles(id) on delete set null,
  add column if not exists employment_type text null,
  add column if not exists start_date date null,
  add column if not exists profile_version integer not null default 1,
  add column if not exists must_change_password boolean not null default false;

alter table public.user_profiles
  add constraint user_profiles_status_check
    check (status in ('PENDING_ACTIVATION','ACTIVE','SUSPENDED','DEACTIVATED')),
  add constraint user_profiles_employee_code_check
    check (employee_code is null or (
      employee_code = upper(btrim(employee_code))
      and employee_code ~ '^[A-Z0-9_-]{1,32}$'
    )),
  add constraint user_profiles_work_email_check
    check (work_email is null or (
      work_email = lower(btrim(work_email)) and char_length(work_email) between 3 and 320
    )),
  add constraint user_profiles_phone_check
    check (phone is null or phone ~ '^0[0-9]{9}$'),
  add constraint user_profiles_job_title_check
    check (job_title is null or (job_title = btrim(job_title) and char_length(job_title) between 1 and 100)),
  add constraint user_profiles_employment_type_check
    check (employment_type is null or employment_type in ('FULL_TIME','PART_TIME','CONTRACT','INTERN')),
  add constraint user_profiles_profile_version_check check (profile_version > 0),
  add constraint user_profiles_manager_not_self check (manager_id is null or manager_id <> id);

create unique index if not exists uq_user_profiles_work_email
  on public.user_profiles (work_email) where work_email is not null;
create index if not exists idx_user_profiles_primary_location
  on public.user_profiles (primary_location_id, status);
create index if not exists idx_user_profiles_department
  on public.user_profiles (department_id, status);
create index if not exists idx_user_profiles_manager
  on public.user_profiles (manager_id, status);

create or replace function public.tg_user_profile_manager_cycle()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.manager_id is null then return new; end if;
  if exists (
    with recursive chain(id, manager_id) as (
      select p.id, p.manager_id from public.user_profiles p where p.id = new.manager_id
      union all
      select p.id, p.manager_id from public.user_profiles p join chain c on p.id = c.manager_id
    )
    select 1 from chain where id = new.id
  ) then raise exception 'INVALID_SUPERIOR'; end if;
  return new;
end $$;

drop trigger if exists user_profiles_manager_cycle on public.user_profiles;
create trigger user_profiles_manager_cycle
before insert or update of manager_id on public.user_profiles
for each row execute function public.tg_user_profile_manager_cycle();

create table if not exists public.activation_invites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.user_profiles(id),
  token_hash text not null check (char_length(token_hash) between 32 and 255),
  status text not null default 'SENT' check (status in ('SENT','ACCEPTED','EXPIRED','REVOKED')),
  expires_at timestamptz not null,
  created_by uuid null references public.user_profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz null
);
create unique index if not exists uq_activation_invites_open_user
  on public.activation_invites(user_id) where status = 'SENT';
create unique index if not exists uq_activation_invites_token_hash
  on public.activation_invites(token_hash);
alter table public.activation_invites enable row level security;
revoke all on table public.activation_invites from anon, authenticated;

create table if not exists public.employee_command_receipts (
  command_key uuid primary key,
  operation text not null check (operation = 'CREATE'),
  employee_id uuid null references public.user_profiles(id),
  actor_id uuid not null,
  result_row jsonb null,
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);
alter table public.employee_command_receipts enable row level security;
revoke all on table public.employee_command_receipts from anon, authenticated;

create or replace function public.create_employee(
  p_command_key uuid, p_user_id uuid, p_work_email text, p_display_name text,
  p_phone text, p_preferred_locale text, p_employee_code text, p_job_title text,
  p_primary_location_id uuid, p_department_id uuid, p_manager_id uuid,
  p_employment_type text, p_start_date date, p_must_change_password boolean,
  p_activation_method text, p_invite_token_hash text, p_invite_expires_at timestamptz,
  p_role_code text, p_role_context_type text, p_role_context_id uuid,
  p_effective_from timestamptz, p_effective_to timestamptz,
  p_reason_code_id uuid, p_reason_note text,
  p_actor_id uuid, p_actor_label text, p_changes jsonb, p_request_id text,
  p_ip inet, p_user_agent text
) returns public.user_profiles
language plpgsql security definer set search_path = public as $$
declare
  v_row public.user_profiles;
  v_receipt public.employee_command_receipts;
  v_location public.locations;
  v_reason public.reason_codes;
  v_role_context_type text;
  v_role_context_id uuid;
  v_role_reason text;
begin
  insert into public.employee_command_receipts(command_key, operation, employee_id, actor_id)
  values (p_command_key, 'CREATE', null, p_actor_id) on conflict do nothing;
  if not found then
    select * into v_receipt from public.employee_command_receipts where command_key = p_command_key;
    if v_receipt.operation <> 'CREATE' or v_receipt.actor_id <> p_actor_id then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    return jsonb_populate_record(null::public.user_profiles, v_receipt.result_row);
  end if;

  select * into v_location from public.locations
    where id = p_primary_location_id and status = 'ACTIVE' and type <> 'EXTERNAL' for share;
  if not found then raise exception 'LOCATION_INVALID'; end if;

  if v_location.type = 'OFFICE' then
    if p_department_id is null or not exists(
      select 1 from public.departments where id = p_department_id and status = 'ACTIVE'
    ) then raise exception 'DEPARTMENT_REQUIRED'; end if;
  elsif p_department_id is not null then
    raise exception 'DEPARTMENT_NOT_ALLOWED';
  end if;

  if p_manager_id is not null and not exists(
    select 1 from public.user_profiles where id = p_manager_id and status = 'ACTIVE'
  ) then raise exception 'INVALID_SUPERIOR'; end if;

  if p_activation_method not in ('EMAIL_INVITE','TEMPORARY_PASSWORD') then
    raise exception 'ACTIVATION_METHOD_INVALID';
  end if;
  if p_activation_method = 'EMAIL_INVITE'
     and (nullif(p_invite_token_hash, '') is null or p_invite_expires_at <= now()) then
    raise exception 'INVITE_INVALID';
  end if;
  if p_activation_method = 'TEMPORARY_PASSWORD' and p_invite_token_hash is not null then
    raise exception 'INVITE_NOT_ALLOWED';
  end if;

  if p_role_code is not null then
    if p_role_code = 'SYSTEM_ADMIN' or p_role_code not in (
      'EXECUTIVE','CHIEF_ACCOUNTANT','ASSET_ACCOUNTANT','ASSET_MANAGER',
      'LOCATION_MANAGER','LOCATION_STAFF','TECHNICIAN','AUDITOR'
    ) then raise exception 'ROLE_NOT_ASSIGNABLE'; end if;

    v_role_context_type := case when p_role_code in ('LOCATION_MANAGER','LOCATION_STAFF')
      then 'LOCATION' else 'PLATFORM' end;
    v_role_context_id := case when v_role_context_type = 'LOCATION'
      then p_primary_location_id else '00000000-0000-0000-0000-000000000000'::uuid end;
    if p_role_context_type is distinct from v_role_context_type
       or p_role_context_id is distinct from v_role_context_id then
      raise exception 'ROLE_CONTEXT_INVALID';
    end if;
    if p_effective_to is not null and p_effective_to < coalesce(p_effective_from, now()) then
      raise exception 'ROLE_EFFECTIVE_WINDOW_INVALID';
    end if;
    select * into v_reason from public.reason_codes
      where id = p_reason_code_id and status = 'ACTIVE' and reason_group = 'ROLE_ASSIGNMENT';
    if not found then raise exception 'REASON_INVALID'; end if;
    if v_reason.is_freetext and nullif(btrim(coalesce(p_reason_note, '')), '') is null then
      raise exception 'REASON_NOTE_REQUIRED';
    end if;
    v_role_reason := case when v_reason.is_freetext then btrim(p_reason_note)
      else v_reason.label || coalesce(': ' || nullif(btrim(p_reason_note), ''), '') end;
  elsif p_reason_code_id is not null or p_role_context_type is not null or p_role_context_id is not null then
    raise exception 'ROLE_FIELDS_WITHOUT_ROLE';
  end if;

  insert into public.user_profiles(
    id, work_email, display_name, phone, preferred_locale, employee_code, job_title,
    primary_location_id, department_id, manager_id, employment_type, start_date,
    must_change_password, status, created_by
  ) values (
    p_user_id, lower(btrim(p_work_email)), btrim(p_display_name), nullif(btrim(p_phone), ''),
    p_preferred_locale, nullif(upper(btrim(p_employee_code)), ''), nullif(btrim(p_job_title), ''),
    p_primary_location_id, p_department_id, p_manager_id, p_employment_type, p_start_date,
    p_must_change_password, 'PENDING_ACTIVATION', p_actor_id
  ) returning * into v_row;

  if p_role_code is not null then
    insert into public.context_role_assignments(
      subject_type, subject_id, context_type, context_id, role_code,
      effective_from, effective_to, granted_by, grant_reason
    ) values (
      'USER', v_row.id, v_role_context_type, v_role_context_id, p_role_code,
      coalesce(p_effective_from, now()), p_effective_to, p_actor_id, v_role_reason
    );
  end if;

  if p_activation_method = 'EMAIL_INVITE' then
    insert into public.activation_invites(user_id, token_hash, expires_at, created_by)
    values (v_row.id, p_invite_token_hash, p_invite_expires_at, p_actor_id);
  end if;

  insert into public.audit_events(
    event_code, actor_id, actor_label, subject_type, subject_id, context_type,
    context_id, reason, changes, metadata, request_id, ip_address, user_agent
  ) values (
    'iam.employee.created', p_actor_id, p_actor_label, 'UserProfile', v_row.id,
    'PLATFORM', '00000000-0000-0000-0000-000000000000', v_role_reason, p_changes,
    jsonb_build_object('activation_method', p_activation_method, 'initial_role', p_role_code),
    p_request_id, p_ip, p_user_agent
  );

  update public.employee_command_receipts
    set employee_id = v_row.id, result_row = to_jsonb(v_row), completed_at = now()
    where command_key = p_command_key;
  return v_row;
exception
  when unique_violation then
    if sqlerrm like '%work_email%' then raise exception 'EMAIL_ALREADY_REGISTERED'; end if;
    if sqlerrm like '%employee_code%' then raise exception 'EMPLOYEE_CODE_TAKEN'; end if;
    raise;
end $$;

revoke all on function public.tg_user_profile_manager_cycle() from public;
revoke all on function public.create_employee(
  uuid,uuid,text,text,text,text,text,text,uuid,uuid,uuid,text,date,boolean,text,text,timestamptz,
  text,text,uuid,timestamptz,timestamptz,uuid,text,uuid,text,jsonb,text,inet,text
) from public;
grant execute on function public.create_employee(
  uuid,uuid,text,text,text,text,text,text,uuid,uuid,uuid,text,date,boolean,text,text,timestamptz,
  text,text,uuid,timestamptz,timestamptz,uuid,text,uuid,text,jsonb,text,inet,text
) to service_role;
