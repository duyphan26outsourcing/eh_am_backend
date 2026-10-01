-- =============================================================================
-- 21 — Huỷ hồ sơ tạo sai (M03, UC-AST-09 đề nghị + UC-AST-10 duyệt). Chạy sau 20.
-- Maker-checker: người đề nghị ≠ người duyệt (BR-CMN-08). Không sửa migration 01–20.
-- =============================================================================

-- (a) Receipt nhận thêm 2 operation của luồng huỷ.
alter table public.asset_command_receipts
  drop constraint if exists asset_command_receipts_operation_check;
alter table public.asset_command_receipts
  add constraint asset_command_receipts_operation_check
  check (operation in (
    'CREATE', 'UPDATE_DESCRIPTION', 'CHANGE_RESPONSIBLE', 'CHANGE_LIFECYCLE',
    'REQUEST_CANCEL', 'DECIDE_CANCEL'));

-- (b) Bảng đề nghị huỷ. KHÔNG xoá cứng; đổi trạng thái PENDING → APPROVED/REJECTED + audit.
create table if not exists public.asset_cancellation_requests (
  id                      uuid primary key default gen_random_uuid(),
  asset_id                uuid not null references public.assets(id),
  status                  text not null default 'PENDING'
                            check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  request_reason_code_id  uuid not null references public.reason_codes(id),
  request_reason_note     text,
  requested_by            uuid not null references public.user_profiles(id),
  requested_at            timestamptz not null default now(),
  decided_by              uuid references public.user_profiles(id),
  decided_at              timestamptz,
  decision_reason_code_id uuid references public.reason_codes(id),
  decision_reason_note    text,
  version                 integer not null default 1,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
-- ⚠️ Mỗi hồ sơ chỉ MỘT đề nghị PENDING (EX.3). Partial unique chặn cả đua chèn song song.
create unique index if not exists uq_asset_cancellation_pending
  on public.asset_cancellation_requests (asset_id) where status = 'PENDING';
create index if not exists idx_asset_cancellation_status
  on public.asset_cancellation_requests (status, requested_at);
alter table public.asset_cancellation_requests enable row level security;

-- (c) RPC đề nghị huỷ (UC-AST-09). Mẫu idempotency/audit như migration 18.
create or replace function public.request_asset_cancellation(
  p_command_key uuid,
  p_asset_id uuid,
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
  v_reason public.reason_codes;
  v_payload jsonb;
  v_reason_note text := nullif(btrim(p_reason_note), '');
  v_reason_text text;
  v_request public.asset_cancellation_requests;
  v_result jsonb;
begin
  v_payload := jsonb_build_object(
    'asset_id', p_asset_id, 'reason_code_id', p_reason_code_id, 'reason_note', v_reason_note);
  insert into public.asset_command_receipts(command_key, actor_id, operation, payload)
    values (p_command_key, p_actor_id, 'REQUEST_CANCEL', v_payload)
    on conflict do nothing;
  if not found then
    select * into v_receipt from public.asset_command_receipts where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.operation <> 'REQUEST_CANCEL'
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
  if v_asset.lifecycle_status in ('DISPOSED', 'LOST', 'CANCELLED') then
    raise exception 'ASSET_READ_ONLY';
  end if;
  if v_asset.lifecycle_status not in ('IN_STORAGE', 'IN_USE') then
    raise exception 'ASSET_STATUS_LOCKED';
  end if;
  if exists (
    select 1 from public.asset_cancellation_requests
    where asset_id = p_asset_id and status = 'PENDING'
  ) then raise exception 'CANCELLATION_PENDING_EXISTS'; end if;

  -- EX.5: cần ≥1 Quản lý tài sản platform ACTIVE KHÁC người đề nghị để duyệt chéo.
  if not exists (
    select 1 from public.context_role_assignments cra
    join public.user_profiles up on up.id = cra.subject_id
    where cra.subject_type = 'USER' and cra.context_type = 'PLATFORM'
      and cra.role_code = 'ASSET_MANAGER'
      and cra.effective_from <= now()
      and (cra.effective_to is null or cra.effective_to > now())
      and up.status = 'ACTIVE' and cra.subject_id <> p_actor_id
  ) then raise exception 'NO_APPROVER_AVAILABLE'; end if;

  select * into v_reason from public.reason_codes
    where id = p_reason_code_id and status = 'ACTIVE'
      and reason_group = 'ASSET_CANCEL' for share;
  if not found or (v_reason.is_freetext and v_reason_note is null) then
    raise exception 'REASON_INVALID';
  end if;
  v_reason_text := case when v_reason.is_freetext then v_reason_note
                        when v_reason_note is null then v_reason.label
                        else v_reason.label || ': ' || v_reason_note end;

  begin
    insert into public.asset_cancellation_requests(
      asset_id, status, request_reason_code_id, request_reason_note, requested_by)
      values (p_asset_id, 'PENDING', p_reason_code_id, v_reason_note, p_actor_id)
      returning * into v_request;
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata,
      request_id, ip_address, user_agent
    ) values (
      'asset.cancellation.requested', p_actor_id, nullif(p_actor_label, ''),
      'Asset', p_asset_id, 'LOCATION', v_asset.primary_location_id, v_reason_text,
      jsonb_build_object('cancellation_status', jsonb_build_object('before', null, 'after', 'PENDING')),
      jsonb_build_object('asset_code', v_asset.asset_code, 'cancellation_id', v_request.id,
        'reason_code_id', p_reason_code_id),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception
    when unique_violation then raise exception 'CANCELLATION_PENDING_EXISTS';
    when others then raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', v_request.id, 'asset_id', p_asset_id, 'status', v_request.status,
    'requested_at', v_request.requested_at, 'version', v_request.version, 'is_replay', false);
  update public.asset_command_receipts set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

-- (d) RPC duyệt / từ chối (UC-AST-10). decider ≠ requester kiểm TRONG transaction.
create or replace function public.decide_asset_cancellation(
  p_command_key uuid,
  p_cancellation_id uuid,
  p_decision text,
  p_reason_code_id uuid,
  p_reason_note text,
  p_expected_version integer,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_receipt public.asset_command_receipts;
  v_req public.asset_cancellation_requests;
  v_asset public.assets;
  v_reason public.reason_codes;
  v_payload jsonb;
  v_reason_note text := nullif(btrim(p_reason_note), '');
  v_reason_text text;
  v_old_status text;
  v_result jsonb;
begin
  if p_decision is null or p_decision not in ('APPROVE', 'REJECT') then
    raise exception 'DECISION_INVALID';
  end if;
  v_payload := jsonb_build_object(
    'cancellation_id', p_cancellation_id, 'decision', p_decision,
    'reason_code_id', p_reason_code_id, 'reason_note', v_reason_note,
    'expected_version', p_expected_version);
  insert into public.asset_command_receipts(command_key, actor_id, operation, payload)
    values (p_command_key, p_actor_id, 'DECIDE_CANCEL', v_payload)
    on conflict do nothing;
  if not found then
    select * into v_receipt from public.asset_command_receipts where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.operation <> 'DECIDE_CANCEL'
       or v_receipt.payload <> v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_row is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_row || jsonb_build_object('is_replay', true);
  end if;

  select * into v_req from public.asset_cancellation_requests
    where id = p_cancellation_id for update;
  if not found then raise exception 'CANCELLATION_NOT_FOUND'; end if;
  if v_req.status <> 'PENDING' then raise exception 'CANCELLATION_ALREADY_DECIDED'; end if;
  if v_req.version is distinct from p_expected_version then
    raise exception 'RECORD_VERSION_CONFLICT';
  end if;
  -- BR-CMN-08: không tự duyệt đề nghị do mình lập.
  if v_req.requested_by = p_actor_id then raise exception 'SELF_APPROVAL_FORBIDDEN'; end if;

  select * into v_asset from public.assets where id = v_req.asset_id for update;
  if not found then raise exception 'ASSET_NOT_FOUND'; end if;
  v_old_status := v_asset.lifecycle_status;

  if p_decision = 'APPROVE' then
    -- EX.2: sau khi gửi, hồ sơ có thể đã rời trạng thái đổi tay được → chỉ cho Từ chối.
    if v_asset.lifecycle_status not in ('IN_STORAGE', 'IN_USE') then
      raise exception 'ASSET_STATUS_LOCKED';
    end if;
    -- Giả định 3 của UC-10: nhật ký huỷ dùng lý do của ĐỀ NGHỊ, không nhập lại khi duyệt.
    select * into v_reason from public.reason_codes where id = v_req.request_reason_code_id;
    v_reason_text := case when v_reason.is_freetext then v_req.request_reason_note
                          when v_req.request_reason_note is null then v_reason.label
                          else v_reason.label || ': ' || v_req.request_reason_note end;
    begin
      update public.assets set lifecycle_status = 'CANCELLED',
        profile_version = profile_version + 1, updated_at = now()
        where id = v_asset.id returning * into v_asset;
      update public.asset_cancellation_requests set status = 'APPROVED',
        decided_by = p_actor_id, decided_at = now(), version = version + 1, updated_at = now()
        where id = p_cancellation_id returning * into v_req;
      insert into public.audit_events(
        event_code, actor_id, actor_label, subject_type, subject_id,
        context_type, context_id, reason, changes, metadata,
        request_id, ip_address, user_agent
      ) values (
        'asset.cancellation.approved', p_actor_id, nullif(p_actor_label, ''),
        'Asset', v_asset.id, 'LOCATION', v_asset.primary_location_id, v_reason_text,
        jsonb_build_object('lifecycle_status', jsonb_build_object('before', v_old_status, 'after', 'CANCELLED')),
        jsonb_build_object('asset_code', v_asset.asset_code, 'cancellation_id', v_req.id,
          'requested_by', v_req.requested_by),
        nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
      );
    exception when others then raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
    end;
  else
    -- REJECT: bắt lý do nhóm APPROVAL_REJECT; hồ sơ giữ nguyên.
    if p_reason_code_id is null then raise exception 'REASON_INVALID'; end if;
    select * into v_reason from public.reason_codes
      where id = p_reason_code_id and status = 'ACTIVE'
        and reason_group = 'APPROVAL_REJECT' for share;
    if not found or (v_reason.is_freetext and v_reason_note is null) then
      raise exception 'REASON_INVALID';
    end if;
    v_reason_text := case when v_reason.is_freetext then v_reason_note
                          when v_reason_note is null then v_reason.label
                          else v_reason.label || ': ' || v_reason_note end;
    begin
      update public.asset_cancellation_requests set status = 'REJECTED',
        decided_by = p_actor_id, decided_at = now(),
        decision_reason_code_id = p_reason_code_id, decision_reason_note = v_reason_note,
        version = version + 1, updated_at = now()
        where id = p_cancellation_id returning * into v_req;
      insert into public.audit_events(
        event_code, actor_id, actor_label, subject_type, subject_id,
        context_type, context_id, reason, changes, metadata,
        request_id, ip_address, user_agent
      ) values (
        'asset.cancellation.rejected', p_actor_id, nullif(p_actor_label, ''),
        'Asset', v_asset.id, 'LOCATION', v_asset.primary_location_id, v_reason_text,
        jsonb_build_object('cancellation_status', jsonb_build_object('before', 'PENDING', 'after', 'REJECTED')),
        jsonb_build_object('asset_code', v_asset.asset_code, 'cancellation_id', v_req.id,
          'reason_code_id', p_reason_code_id),
        nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
      );
    exception when others then raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
    end;
  end if;

  v_result := jsonb_build_object(
    'id', v_req.id, 'asset_id', v_req.asset_id, 'status', v_req.status,
    'decision', p_decision, 'version', v_req.version, 'is_replay', false);
  update public.asset_command_receipts set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on function public.request_asset_cancellation(
  uuid,uuid,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.request_asset_cancellation(
  uuid,uuid,uuid,text,uuid,text,text,inet,text
) to service_role;

revoke all on function public.decide_asset_cancellation(
  uuid,uuid,text,uuid,text,integer,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.decide_asset_cancellation(
  uuid,uuid,text,uuid,text,integer,uuid,text,text,inet,text
) to service_role;
