-- =============================================================================
-- 20 — Đưa vào / ngừng sử dụng tài sản (M03, UC-AST-11). Chạy sau 19.
-- Không sửa migration 01–19.
-- =============================================================================

-- (a) Nhận thêm operation CHANGE_LIFECYCLE cho bảng receipt (idempotency dùng chung).
alter table public.asset_command_receipts
  drop constraint if exists asset_command_receipts_operation_check;
alter table public.asset_command_receipts
  add constraint asset_command_receipts_operation_check
  check (operation in (
    'CREATE', 'UPDATE_DESCRIPTION', 'CHANGE_RESPONSIBLE', 'CHANGE_LIFECYCLE'));

-- ⚠️ KHÔNG đụng CHECK reason_group: migration 02g (QĐ-06) đã mở 22 nhóm, trong đó có sẵn nhóm
-- 'USE_STATUS_CHANGE' (đưa vào / ngừng sử dụng, UC-AST-11) kèm mục 'Khác'. Sửa lại CHECK ở đây sẽ
-- phá 21 nhóm kia (23514). RPC dưới dùng thẳng nhóm 'USE_STATUS_CHANGE'.

-- (b) RPC đổi trạng thái vòng đời Lưu kho ↔ Đang sử dụng. Nguyên tử + audit. Mẫu migration 18.
create or replace function public.set_asset_lifecycle_status(
  p_command_key uuid,
  p_asset_id uuid,
  p_target_status text,
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
  v_reason public.reason_codes;
  v_payload jsonb;
  v_reason_note text := nullif(btrim(p_reason_note), '');
  v_reason_text text;
  v_old_status text;
  v_result jsonb;
begin
  -- Chỉ nhận hai trạng thái đổi tay được; chặn sớm giá trị lạ (defense-in-depth cùng DTO).
  if p_target_status is null or p_target_status not in ('IN_STORAGE', 'IN_USE') then
    raise exception 'ASSET_STATUS_LOCKED';
  end if;

  v_payload := jsonb_build_object(
    'asset_id', p_asset_id, 'target_status', p_target_status,
    'expected_version', p_expected_version, 'reason_code_id', p_reason_code_id,
    'reason_note', v_reason_note);
  insert into public.asset_command_receipts(command_key, actor_id, operation, payload)
    values (p_command_key, p_actor_id, 'CHANGE_LIFECYCLE', v_payload)
    on conflict do nothing;
  if not found then
    select * into v_receipt from public.asset_command_receipts where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.operation <> 'CHANGE_LIFECYCLE'
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
  -- EX.2: trạng thái kết thúc chỉ còn xem.
  if v_asset.lifecycle_status in ('DISPOSED', 'LOST', 'CANCELLED') then
    raise exception 'ASSET_READ_ONLY';
  end if;
  -- EX.1: trạng thái chưa kết thúc nhưng không đổi tay được (đang ở luồng khác).
  if v_asset.lifecycle_status not in ('IN_STORAGE', 'IN_USE') then
    raise exception 'ASSET_STATUS_LOCKED';
  end if;
  -- EX.4: khóa lạc quan.
  if v_asset.profile_version is distinct from p_expected_version then
    raise exception 'RECORD_VERSION_CONFLICT';
  end if;
  -- Trạng thái đích phải khác hiện tại (chỉ có hai giá trị nên "khác" ⟺ "đối").
  if v_asset.lifecycle_status = p_target_status then
    raise exception 'NO_CHANGES';
  end if;
  v_old_status := v_asset.lifecycle_status;

  -- EX.3: lý do nhóm USE_STATUS_CHANGE, ACTIVE; mục freetext bắt ghi chú.
  select * into v_reason from public.reason_codes
    where id = p_reason_code_id and status = 'ACTIVE'
      and reason_group = 'USE_STATUS_CHANGE' for share;
  if not found or (v_reason.is_freetext and v_reason_note is null) then
    raise exception 'REASON_INVALID';
  end if;
  v_reason_text := case when v_reason.is_freetext then v_reason_note
                        when v_reason_note is null then v_reason.label
                        else v_reason.label || ': ' || v_reason_note end;

  begin
    -- ⚠️ CHỈ đổi lifecycle_status (+ version). Giữ nguyên location/responsible/cost_center/
    -- physical_condition (BR-AST-04).
    update public.assets set
      lifecycle_status = p_target_status,
      profile_version = profile_version + 1,
      updated_at = now()
    where id = p_asset_id returning * into v_asset;
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata,
      request_id, ip_address, user_agent
    ) values (
      'asset.lifecycle.changed', p_actor_id, nullif(p_actor_label, ''),
      'Asset', v_asset.id, 'LOCATION', v_asset.primary_location_id,
      v_reason_text,
      jsonb_build_object('lifecycle_status', jsonb_build_object(
        'before', v_old_status, 'after', p_target_status)),
      jsonb_build_object('asset_code', v_asset.asset_code, 'reason_code_id', p_reason_code_id),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', v_asset.id, 'asset_code', v_asset.asset_code,
    'lifecycle_status', v_asset.lifecycle_status,
    'profile_version', v_asset.profile_version, 'updated_at', v_asset.updated_at,
    'is_replay', false);
  update public.asset_command_receipts set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on function public.set_asset_lifecycle_status(
  uuid,uuid,text,integer,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.set_asset_lifecycle_status(
  uuid,uuid,text,integer,uuid,text,uuid,text,text,inet,text
) to service_role;
