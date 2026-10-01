-- =============================================================================
-- 13 — Cập nhật hồ sơ nhân viên + đổi email (UC-IAM-08). Chạy sau 12.
-- =============================================================================

alter table public.user_profiles
  add column if not exists auth_email_sync_status text not null default 'IN_SYNC',
  add column if not exists auth_email_sync_updated_at timestamptz;
alter table public.user_profiles drop constraint if exists user_profiles_auth_email_sync_status_check;
alter table public.user_profiles add constraint user_profiles_auth_email_sync_status_check
  check (auth_email_sync_status in ('IN_SYNC','PENDING','FAILED'));

create table if not exists public.employee_profile_command_receipts (
  command_key uuid primary key,
  actor_id uuid not null,
  employee_id uuid not null,
  operation text not null check (operation in ('UPDATE_PROFILE','CHANGE_EMAIL')),
  payload jsonb not null,
  result_row jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.employee_profile_command_receipts enable row level security;

create or replace function public.update_employee_profile(
  p_command_key uuid, p_employee_id uuid, p_expected_version integer,
  p_display_name text, p_employee_code text, p_phone text, p_preferred_locale text,
  p_primary_location_id uuid, p_department_id uuid, p_job_title text,
  p_employment_type text, p_start_date date, p_manager_id uuid, p_reason text,
  p_actor_id uuid, p_actor_label text, p_request_id text, p_ip inet, p_user_agent text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_old public.user_profiles; v_new public.user_profiles; v_location public.locations;
  v_payload jsonb; v_receipt public.employee_profile_command_receipts;
  v_changes jsonb := '{}'::jsonb; v_result jsonb;
  v_code text := nullif(upper(btrim(p_employee_code)), '');
  v_phone text := nullif(btrim(p_phone), ''); v_job text := nullif(btrim(p_job_title), '');
begin
  v_payload := jsonb_build_object('version',p_expected_version,'display_name',btrim(p_display_name),
    'employee_code',v_code,'phone',v_phone,'locale',p_preferred_locale,'location',p_primary_location_id,
    'department',p_department_id,'job_title',v_job,'employment_type',p_employment_type,
    'start_date',p_start_date,'manager',p_manager_id,'reason',nullif(btrim(p_reason),''));
  insert into public.employee_profile_command_receipts(command_key,actor_id,employee_id,operation,payload)
    values(p_command_key,p_actor_id,p_employee_id,'UPDATE_PROFILE',v_payload) on conflict do nothing;
  if not found then
    select * into v_receipt from public.employee_profile_command_receipts where command_key=p_command_key;
    if v_receipt.actor_id<>p_actor_id or v_receipt.employee_id<>p_employee_id
       or v_receipt.operation<>'UPDATE_PROFILE' or v_receipt.payload<>v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null then raise exception 'IDEMPOTENCY_IN_PROGRESS'; end if;
    return v_receipt.result_row;
  end if;

  -- ⚠️ Lấy advisory lock org-chart TRƯỚC khi khóa hàng — cùng thứ tự với terminate_employee (14
  -- lấy org_chart rồi mới FOR UPDATE). Khác thứ tự sẽ deadlock khi đổi cấp trên song song lúc nghỉ việc.
  perform pg_advisory_xact_lock(hashtext('iam.organization_chart'));
  select * into v_old from public.user_profiles where id=p_employee_id for update;
  if not found or v_old.status='DEACTIVATED' then raise exception 'EMPLOYEE_NOT_FOUND'; end if;
  -- ⚠️ null-safe: p_expected_version NULL không được bỏ qua kiểm phiên bản.
  if p_expected_version is null or v_old.profile_version is distinct from p_expected_version then raise exception 'RECORD_VERSION_CONFLICT'; end if;
  -- ⚠️ null-safe + đủ ràng buộc cột (chặn trước UPDATE để lỗi không bị gói thành AUDIT_WRITE_FAILED).
  if coalesce(char_length(btrim(p_display_name)),0)<2 or char_length(btrim(p_display_name))>100
     or coalesce(p_preferred_locale,'') not in ('vi','en')
     or (v_code is not null and v_code !~ '^[A-Z0-9_-]{1,32}$')
     or (v_phone is not null and v_phone !~ '^0[0-9]{9}$')
     or (v_job is not null and char_length(v_job)>100)
     or (p_employment_type is not null and p_employment_type not in ('FULL_TIME','PART_TIME','CONTRACT','INTERN'))
  then raise exception 'PROFILE_VALIDATION_FAILED'; end if;

  -- ⚠️ for share: không cho ngừng location song song lọt qua. Quy tắc location khớp create_employee:
  -- đổi sang location phải ACTIVE và KHÔNG EXTERNAL; non-OFFICE không được gắn phòng ban (báo lỗi, không nuốt).
  select * into v_location from public.locations where id=p_primary_location_id for share;
  if not found or (p_primary_location_id is distinct from v_old.primary_location_id and (v_location.status<>'ACTIVE' or v_location.type='EXTERNAL'))
    then raise exception 'LOCATION_INVALID'; end if;
  if v_location.type='OFFICE' and p_department_id is null then raise exception 'DEPARTMENT_REQUIRED'; end if;
  if v_location.type<>'OFFICE' and p_department_id is not null then raise exception 'DEPARTMENT_NOT_ALLOWED'; end if;
  if p_department_id is not null and p_department_id is distinct from v_old.department_id
     and not exists(select 1 from public.departments where id=p_department_id and status='ACTIVE')
    then raise exception 'DEPARTMENT_INVALID'; end if;

  if p_manager_id is distinct from v_old.manager_id then
    if p_manager_id=p_employee_id or (p_manager_id is not null and not exists(
      select 1 from public.user_profiles where id=p_manager_id and status='ACTIVE')) then
      raise exception 'INVALID_SUPERIOR';
    end if;
    if p_manager_id is not null and exists(
      with recursive reports(id) as (
        select id from public.user_profiles where manager_id=p_employee_id
        union all select up.id from public.user_profiles up join reports r on up.manager_id=r.id
      ) select 1 from reports where id=p_manager_id
    ) then raise exception 'INVALID_SUPERIOR'; end if;
  end if;

  if v_old.display_name is distinct from btrim(p_display_name) then v_changes:=v_changes||jsonb_build_object('display_name',jsonb_build_object('before',v_old.display_name,'after',btrim(p_display_name))); end if;
  if v_old.employee_code is distinct from v_code then v_changes:=v_changes||jsonb_build_object('employee_code',jsonb_build_object('before',v_old.employee_code,'after',v_code)); end if;
  if v_old.phone is distinct from v_phone then v_changes:=v_changes||jsonb_build_object('phone',jsonb_build_object('before',v_old.phone,'after',v_phone)); end if;
  if v_old.preferred_locale is distinct from p_preferred_locale then v_changes:=v_changes||jsonb_build_object('preferred_locale',jsonb_build_object('before',v_old.preferred_locale,'after',p_preferred_locale)); end if;
  if v_old.primary_location_id is distinct from p_primary_location_id then v_changes:=v_changes||jsonb_build_object('primary_location_id',jsonb_build_object('before',v_old.primary_location_id,'after',p_primary_location_id)); end if;
  if v_old.department_id is distinct from p_department_id then v_changes:=v_changes||jsonb_build_object('department_id',jsonb_build_object('before',v_old.department_id,'after',p_department_id)); end if;
  if v_old.job_title is distinct from v_job then v_changes:=v_changes||jsonb_build_object('job_title',jsonb_build_object('before',v_old.job_title,'after',v_job)); end if;
  if v_old.employment_type is distinct from p_employment_type then v_changes:=v_changes||jsonb_build_object('employment_type',jsonb_build_object('before',v_old.employment_type,'after',p_employment_type)); end if;
  if v_old.start_date is distinct from p_start_date then v_changes:=v_changes||jsonb_build_object('start_date',jsonb_build_object('before',v_old.start_date,'after',p_start_date)); end if;
  if v_old.manager_id is distinct from p_manager_id then v_changes:=v_changes||jsonb_build_object('manager_id',jsonb_build_object('before',v_old.manager_id,'after',p_manager_id)); end if;

  if v_changes='{}'::jsonb then
    v_result:=jsonb_build_object('id',v_old.id,'profile_version',v_old.profile_version,'changed',false);
  else
    begin
      update public.user_profiles set display_name=btrim(p_display_name),employee_code=v_code,phone=v_phone,
        preferred_locale=p_preferred_locale,primary_location_id=p_primary_location_id,department_id=p_department_id,
        job_title=v_job,employment_type=p_employment_type,start_date=p_start_date,manager_id=p_manager_id,
        profile_version=profile_version+1,updated_at=now() where id=p_employee_id returning * into v_new;
      insert into public.audit_events(event_code,actor_id,actor_label,subject_type,subject_id,reason,changes,request_id,ip_address,user_agent)
        values('identity.profile.updated',p_actor_id,nullif(p_actor_label,''),'UserProfile',p_employee_id,
          nullif(btrim(p_reason),''),v_changes,nullif(p_request_id,''),p_ip,nullif(p_user_agent,''));
    exception when unique_violation then raise exception 'EMPLOYEE_CODE_TAKEN';
      when others then if sqlerrm like '%EMPLOYEE_CODE_TAKEN%' then raise; end if; raise exception 'AUDIT_WRITE_FAILED' using detail=sqlerrm;
    end;
    v_result:=jsonb_build_object('id',v_new.id,'profile_version',v_new.profile_version,'changed',true);
  end if;
  update public.employee_profile_command_receipts set result_row=v_result,completed_at=now() where command_key=p_command_key;
  return v_result;
end $$;

create or replace function public.change_employee_email(
  p_command_key uuid,p_employee_id uuid,p_expected_version integer,p_email text,
  p_reason_code_id uuid,p_reason_note text,p_invite_token_hash text,p_invite_expires_at timestamptz,
  p_actor_id uuid,p_actor_label text,p_request_id text,p_ip inet,p_user_agent text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare v_old public.user_profiles; v_new public.user_profiles; v_reason public.reason_codes;
  v_payload jsonb; v_receipt public.employee_profile_command_receipts; v_invite boolean:=false; v_result jsonb;
  v_email text:=lower(btrim(p_email)); v_reason_text text;
begin
  v_payload:=jsonb_build_object('version',p_expected_version,'email',v_email,'reason',p_reason_code_id,'note',nullif(btrim(p_reason_note),''));
  insert into public.employee_profile_command_receipts(command_key,actor_id,employee_id,operation,payload)
    values(p_command_key,p_actor_id,p_employee_id,'CHANGE_EMAIL',v_payload) on conflict do nothing;
  if not found then
    select * into v_receipt from public.employee_profile_command_receipts where command_key=p_command_key;
    if v_receipt.actor_id<>p_actor_id or v_receipt.employee_id<>p_employee_id or v_receipt.operation<>'CHANGE_EMAIL' or v_receipt.payload<>v_payload then raise exception 'IDEMPOTENCY_KEY_REUSED'; end if;
    if v_receipt.completed_at is null then raise exception 'IDEMPOTENCY_IN_PROGRESS'; end if;
    return v_receipt.result_row||jsonb_build_object('is_replay',true);
  end if;
  select * into v_old from public.user_profiles where id=p_employee_id for update;
  if not found or v_old.status='DEACTIVATED' then raise exception 'EMPLOYEE_NOT_FOUND'; end if;
  if p_expected_version is null or v_old.profile_version is distinct from p_expected_version then raise exception 'RECORD_VERSION_CONFLICT'; end if;
  -- ⚠️ BẢO MẬT (sec review H1): đổi email đăng nhập là đường chiếm tài khoản. Chặn tự đổi email của
  -- chính mình và chặn đổi email của tài khoản đang giữ SYSTEM_ADMIN — chỉ qua quy trình riêng có xác minh.
  if p_employee_id=p_actor_id then raise exception 'EMAIL_CHANGE_TARGET_FORBIDDEN'; end if;
  if exists(select 1 from public.context_role_assignments where subject_id=p_employee_id and subject_type='USER'
      and role_code='SYSTEM_ADMIN' and context_type='PLATFORM' and effective_from<=now() and (effective_to is null or effective_to>now()))
    then raise exception 'EMAIL_CHANGE_TARGET_FORBIDDEN'; end if;
  select * into v_reason from public.reason_codes where id=p_reason_code_id and status='ACTIVE' and reason_group='EMAIL_CHANGE';
  if not found or (v_reason.is_freetext and nullif(btrim(p_reason_note),'') is null) then raise exception 'REASON_INVALID'; end if;
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then raise exception 'EMAIL_INVALID'; end if;
  if v_old.work_email=v_email then raise exception 'NO_CHANGES'; end if;
  v_invite:=v_old.status='PENDING_ACTIVATION' and exists(select 1 from public.activation_invites where user_id=p_employee_id and status in ('SENT','ACTIVATING'));
  begin
    update public.user_profiles set work_email=v_email,profile_version=profile_version+1,
      auth_email_sync_status='PENDING',auth_email_sync_updated_at=now(),updated_at=now()
      where id=p_employee_id returning * into v_new;
    if v_invite then
      update public.activation_invites set status='REVOKED' where user_id=p_employee_id and status in ('SENT','ACTIVATING');
      insert into public.activation_invites(user_id,token_hash,status,expires_at,created_by)
        values(p_employee_id,p_invite_token_hash,'SENT',p_invite_expires_at,p_actor_id);
    end if;
    v_reason_text:=v_reason.label||case when nullif(btrim(p_reason_note),'') is null then '' else ': '||btrim(p_reason_note) end;
    insert into public.audit_events(event_code,actor_id,actor_label,subject_type,subject_id,reason,changes,metadata,request_id,ip_address,user_agent)
      values('identity.profile.email_changed',p_actor_id,nullif(p_actor_label,''),'UserProfile',p_employee_id,v_reason_text,
        jsonb_build_object('work_email',jsonb_build_object('before',v_old.work_email,'after',v_email)),
        jsonb_build_object('reason_code_id',p_reason_code_id),nullif(p_request_id,''),p_ip,nullif(p_user_agent,''));
  exception when unique_violation then raise exception 'EMAIL_ALREADY_REGISTERED';
    when others then if sqlerrm like '%EMAIL_ALREADY_REGISTERED%' then raise; end if; raise exception 'AUDIT_WRITE_FAILED' using detail=sqlerrm;
  end;
  v_result:=jsonb_build_object('id',p_employee_id,'work_email',v_email,'status',v_new.status,
    'profile_version',v_new.profile_version,'invitation_required',v_invite,'is_replay',false);
  update public.employee_profile_command_receipts set result_row=v_result,completed_at=now() where command_key=p_command_key;
  return v_result;
end $$;

create or replace function public.mark_employee_email_sync(p_employee_id uuid,p_status text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if p_status not in ('IN_SYNC','FAILED') then raise exception 'SYNC_STATUS_INVALID'; end if;
  -- ⚠️ Chỉ cập nhật khi đang PENDING: một mark IN_SYNC/FAILED đến muộn không ghi đè trạng thái đã
  -- chốt của lần đổi email sau. (Chưa khớp theo email — xem ghi chú handoff nếu cần chống đua triệt để.)
  update public.user_profiles set auth_email_sync_status=p_status,auth_email_sync_updated_at=now()
    where id=p_employee_id and auth_email_sync_status='PENDING';
end $$;

revoke all on table public.employee_profile_command_receipts from public,anon,authenticated;
grant all on table public.employee_profile_command_receipts to service_role;
revoke all on function public.update_employee_profile(uuid,uuid,integer,text,text,text,text,uuid,uuid,text,text,date,uuid,text,uuid,text,text,inet,text) from public,anon,authenticated;
grant execute on function public.update_employee_profile(uuid,uuid,integer,text,text,text,text,uuid,uuid,text,text,date,uuid,text,uuid,text,text,inet,text) to service_role;
revoke all on function public.change_employee_email(uuid,uuid,integer,text,uuid,text,text,timestamptz,uuid,text,text,inet,text) from public,anon,authenticated;
grant execute on function public.change_employee_email(uuid,uuid,integer,text,uuid,text,text,timestamptz,uuid,text,text,inet,text) to service_role;
revoke all on function public.mark_employee_email_sync(uuid,text) from public,anon,authenticated;
grant execute on function public.mark_employee_email_sync(uuid,text) to service_role;

