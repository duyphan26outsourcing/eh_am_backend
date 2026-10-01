-- =============================================================================
-- 19 — Bàn giao tài sản ngay trong lệnh nghỉ việc (QĐ-11, UC-IAM-13/AST-05).
-- Chạy sau 18. Không sửa migration 14 đã chạy.
-- =============================================================================

create or replace function public.terminate_employee(
  p_command_key uuid,p_employee_id uuid,p_expected_version integer,p_new_manager_id uuid,
  p_reason_code_id uuid,p_reason_note text,p_asset_transfers jsonb,p_actor_id uuid,
  p_actor_label text,p_request_id text,p_ip inet,p_user_agent text
) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
  v_old public.user_profiles;
  v_reason public.reason_codes;
  v_receipt public.employee_termination_receipts;
  v_payload jsonb;
  v_reason_text text;
  v_reports integer;
  v_roles integer;
  v_admins integer;
  v_asset_count integer;
  v_transfer_count integer;
  v_assets_transferred integer := 0;
  v_result jsonb;
  v_transfer record;
  v_asset public.assets;
  v_new_responsible public.user_profiles;
begin
  v_payload:=jsonb_build_object('version',p_expected_version,'manager',p_new_manager_id,'reason',p_reason_code_id,
    'note',nullif(btrim(p_reason_note),''),'assets',coalesce(p_asset_transfers,'[]'::jsonb));
  insert into public.employee_termination_receipts(command_key,actor_id,employee_id,payload)
    values(p_command_key,p_actor_id,p_employee_id,v_payload) on conflict do nothing;
  if not found then
    select * into v_receipt from public.employee_termination_receipts where command_key=p_command_key;
    if v_receipt.actor_id<>p_actor_id or v_receipt.employee_id<>p_employee_id or v_receipt.payload<>v_payload then raise exception 'IDEMPOTENCY_KEY_REUSED'; end if;
    if v_receipt.completed_at is null then raise exception 'IDEMPOTENCY_IN_PROGRESS'; end if;
    return v_receipt.result_row||jsonb_build_object('is_replay',true);
  end if;
  if jsonb_typeof(coalesce(p_asset_transfers,'[]'::jsonb))<>'array' then raise exception 'ASSET_HANDOVER_INVALID'; end if;

  perform pg_advisory_xact_lock(hashtext('iam.active_system_admin'));
  perform pg_advisory_xact_lock(hashtext('iam.organization_chart'));
  select * into v_old from public.user_profiles where id=p_employee_id for update;
  if not found then raise exception 'EMPLOYEE_NOT_FOUND'; end if;
  if v_old.status not in ('ACTIVE','SUSPENDED') then raise exception 'ACCOUNT_STATE_CONFLICT'; end if;
  if p_expected_version is null or v_old.profile_version is distinct from p_expected_version then raise exception 'RECORD_VERSION_CONFLICT'; end if;
  if p_employee_id=p_actor_id then raise exception 'SELF_ACCOUNT_LOCK_FORBIDDEN'; end if;
  select * into v_reason from public.reason_codes where id=p_reason_code_id and status='ACTIVE' and reason_group='TERMINATION';
  if not found or (v_reason.is_freetext and nullif(btrim(p_reason_note),'') is null) then raise exception 'REASON_INVALID'; end if;
  v_reason_text:=v_reason.label||case when nullif(btrim(p_reason_note),'') is null then '' else ': '||btrim(p_reason_note) end;

  if v_old.status='ACTIVE' and exists(select 1 from public.context_role_assignments where subject_id=p_employee_id and subject_type='USER' and role_code='SYSTEM_ADMIN' and context_type='PLATFORM' and effective_from<=now() and (effective_to is null or effective_to>now())) then
    select count(distinct cra.subject_id) into v_admins from public.context_role_assignments cra join public.user_profiles up on up.id=cra.subject_id and up.status='ACTIVE'
      where cra.subject_type='USER' and cra.role_code='SYSTEM_ADMIN' and cra.context_type='PLATFORM' and cra.effective_from<=now() and (cra.effective_to is null or cra.effective_to>now());
    if v_admins<=1 then raise exception 'LAST_SYSTEM_ADMIN_REQUIRED'; end if;
  end if;
  select count(*) into v_reports from public.user_profiles where manager_id=p_employee_id and status<>'DEACTIVATED';
  if v_reports>0 and (p_new_manager_id is null or p_new_manager_id=p_employee_id or not exists(select 1 from public.user_profiles where id=p_new_manager_id and status='ACTIVE')) then raise exception 'INVALID_SUPERIOR'; end if;
  if v_reports>0 and p_new_manager_id is not null and exists(
    with recursive sub(id) as (
      select id from public.user_profiles where manager_id=p_employee_id and status<>'DEACTIVATED'
      union all select up.id from public.user_profiles up join sub on up.manager_id=sub.id and up.status<>'DEACTIVATED'
    ) select 1 from sub where id=p_new_manager_id
  ) then raise exception 'INVALID_SUPERIOR'; end if;

  -- QĐ-11: mọi tài sản chưa kết thúc tại location nội bộ phải có đúng một người nhận.
  select count(*) into v_asset_count
  from public.assets a join public.locations l on l.id=a.primary_location_id
  where a.responsible_user_id=p_employee_id
    and a.lifecycle_status not in ('DISPOSED','CANCELLED') and l.type<>'EXTERNAL';
  v_transfer_count:=jsonb_array_length(coalesce(p_asset_transfers,'[]'::jsonb));
  if v_transfer_count<>v_asset_count then raise exception 'ASSET_HANDOVER_REQUIRED'; end if;
  if v_transfer_count<>(select count(distinct x.asset_id) from jsonb_to_recordset(coalesce(p_asset_transfers,'[]'::jsonb)) as x(asset_id uuid,new_responsible_user_id uuid)) then
    raise exception 'ASSET_HANDOVER_INVALID';
  end if;

  -- Khoá theo UUID ổn định để hai lệnh bàn giao giao nhau không deadlock.
  perform 1 from public.assets a
    join jsonb_to_recordset(coalesce(p_asset_transfers,'[]'::jsonb)) as x(asset_id uuid,new_responsible_user_id uuid) on x.asset_id=a.id
    order by a.id for update of a;
  for v_transfer in
    select x.asset_id,x.new_responsible_user_id
    from jsonb_to_recordset(coalesce(p_asset_transfers,'[]'::jsonb)) as x(asset_id uuid,new_responsible_user_id uuid)
    order by x.asset_id
  loop
    select * into v_asset from public.assets where id=v_transfer.asset_id;
    if not found or v_asset.responsible_user_id<>p_employee_id
       or v_asset.lifecycle_status in ('DISPOSED','CANCELLED') then raise exception 'ASSET_HANDOVER_INVALID'; end if;
    if exists(select 1 from public.locations where id=v_asset.primary_location_id and type='EXTERNAL') then raise exception 'ASSET_HANDOVER_INVALID'; end if;
    if v_transfer.new_responsible_user_id=p_employee_id then raise exception 'ASSET_HANDOVER_INVALID'; end if;
    select * into v_new_responsible from public.user_profiles where id=v_transfer.new_responsible_user_id for share;
    if not found or v_new_responsible.status<>'ACTIVE' then raise exception 'RESPONSIBLE_NOT_ON_LOCATION'; end if;
    if not exists(
      select 1 from public.context_role_assignments cra
      where cra.subject_type='USER' and cra.subject_id=v_transfer.new_responsible_user_id
        and cra.effective_from<=now() and (cra.effective_to is null or cra.effective_to>now())
        and ((cra.context_type='LOCATION' and cra.context_id=v_asset.primary_location_id and cra.role_code in ('LOCATION_MANAGER','LOCATION_STAFF'))
          or (cra.context_type='PLATFORM' and cra.role_code='ASSET_MANAGER'))
    ) then raise exception 'RESPONSIBLE_NOT_ON_LOCATION'; end if;
  end loop;

  begin
    for v_transfer in
      select x.asset_id,x.new_responsible_user_id
      from jsonb_to_recordset(coalesce(p_asset_transfers,'[]'::jsonb)) as x(asset_id uuid,new_responsible_user_id uuid)
      order by x.asset_id
    loop
      select * into v_asset from public.assets where id=v_transfer.asset_id;
      update public.assets set responsible_user_id=v_transfer.new_responsible_user_id,
        profile_version=profile_version+1,updated_at=now() where id=v_transfer.asset_id;
      insert into public.audit_events(event_code,actor_id,actor_label,subject_type,subject_id,context_type,context_id,reason,changes,metadata,request_id,ip_address,user_agent)
        values('asset.responsible.changed',p_actor_id,nullif(p_actor_label,''),'Asset',v_asset.id,'LOCATION',v_asset.primary_location_id,v_reason_text,
          jsonb_build_object('responsible_user_id',jsonb_build_object('before',p_employee_id,'after',v_transfer.new_responsible_user_id)),
          jsonb_build_object('asset_code',v_asset.asset_code,'termination_employee_id',p_employee_id),nullif(p_request_id,''),p_ip,nullif(p_user_agent,''));
      v_assets_transferred:=v_assets_transferred+1;
    end loop;

    insert into public.audit_events(event_code,actor_id,actor_label,subject_type,subject_id,reason,changes,metadata,request_id,ip_address,user_agent)
      select 'identity.profile.manager_changed',p_actor_id,nullif(p_actor_label,''),'UserProfile',id,v_reason_text,
        jsonb_build_object('manager_id',jsonb_build_object('before',p_employee_id,'after',p_new_manager_id)),jsonb_build_object('termination_employee_id',p_employee_id),nullif(p_request_id,''),p_ip,nullif(p_user_agent,'')
      from public.user_profiles where manager_id=p_employee_id and status<>'DEACTIVATED';
    update public.user_profiles set manager_id=p_new_manager_id,profile_version=profile_version+1,updated_at=now() where manager_id=p_employee_id and status<>'DEACTIVATED';
    with closed as (
      update public.context_role_assignments set effective_to=greatest(now(),effective_from),revoked_by=p_actor_id,revoke_reason=v_reason_text
      where subject_type='USER' and subject_id=p_employee_id and revoked_by is null and (effective_to is null or effective_to>now()) returning *
    ), audited as (
      insert into public.audit_events(event_code,actor_id,actor_label,subject_type,subject_id,context_type,context_id,reason,changes,metadata,request_id,ip_address,user_agent)
      select 'iam.role.revoked',p_actor_id,nullif(p_actor_label,''),'UserProfile',p_employee_id,context_type,context_id,v_reason_text,
        jsonb_build_object('effective_to',jsonb_build_object('before',null,'after',effective_to)),jsonb_build_object('assignment_id',id,'termination',true),nullif(p_request_id,''),p_ip,nullif(p_user_agent,'') from closed returning 1
    ) select count(*) into v_roles from audited;
    update public.user_profiles set status='DEACTIVATED',termination_date=(now() at time zone 'Asia/Ho_Chi_Minh')::date,termination_reason_code_id=p_reason_code_id,
      termination_note=nullif(btrim(p_reason_note),''),profile_version=profile_version+1,updated_at=now() where id=p_employee_id;
    insert into public.audit_events(event_code,actor_id,actor_label,subject_type,subject_id,reason,changes,metadata,request_id,ip_address,user_agent)
      values('iam.employee.terminated',p_actor_id,nullif(p_actor_label,''),'UserProfile',p_employee_id,v_reason_text,
        jsonb_build_object('status',jsonb_build_object('before',v_old.status,'after','DEACTIVATED'),'termination_date',jsonb_build_object('before',null,'after',(now() at time zone 'Asia/Ho_Chi_Minh')::date)),
        jsonb_build_object('direct_reports',v_reports,'roles',v_roles,'assets',v_assets_transferred),nullif(p_request_id,''),p_ip,nullif(p_user_agent,''));
  exception when others then
    if sqlerrm like '%INVALID_SUPERIOR%' or sqlerrm like '%HISTORY_IMMUTABLE%' then raise; end if;
    raise exception 'AUDIT_WRITE_FAILED' using detail=sqlerrm;
  end;
  v_result:=jsonb_build_object('id',p_employee_id,'status','DEACTIVATED','profile_version',p_expected_version+1,
    'direct_reports_reassigned',v_reports,'roles_closed',v_roles,'assets_transferred',v_assets_transferred,'is_replay',false);
  update public.employee_termination_receipts set result_row=v_result,completed_at=now() where command_key=p_command_key;
  return v_result;
end $$;

revoke all on function public.terminate_employee(uuid,uuid,integer,uuid,uuid,text,jsonb,uuid,text,text,inet,text) from public,anon,authenticated;
grant execute on function public.terminate_employee(uuid,uuid,integer,uuid,uuid,text,jsonb,uuid,text,text,inet,text) to service_role;
