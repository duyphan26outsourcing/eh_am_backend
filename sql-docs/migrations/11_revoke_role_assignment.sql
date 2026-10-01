-- =============================================================================
-- 11 — Thu hồi vai trò theo location (UC-IAM-11). Chạy sau 10.
-- KHÔNG sửa migration đã chạy; chỉ create or replace + alter ... if not exists / drop+add.
-- =============================================================================
--
-- ⚠️ VÌ SAO
--   · "Thu hồi" = ĐÓNG HIỆU LỰC một dòng `context_role_assignments`: đặt `effective_to`,
--     `revoked_by`, `revoke_reason`. Trigger `tg_role_assignment_close_only` (migration 01) đã
--     chặn xoá/sửa và chỉ cho đóng một lần, chỉ rút ngắn. RPC này bọc đóng-hiệu-lực + audit
--     trong một transaction để hai việc cùng thành công hoặc cùng hỏng (BR-AUD-04).
--   · Dòng "Sắp hiệu lực" (effective_from > now): đóng với effective_to = effective_from, vì
--     `ck_cra_effective_window` đòi effective_to >= effective_from (UC-IAM-11.AC.1).
--   · Dòng đã bị thu hồi HOẶC đã quá ngày kết thúc: HISTORY_IMMUTABLE — chặn TRƯỚC khi UPDATE,
--     vì đóng một dòng đã quá hạn (effective_to quá khứ) sẽ là "kéo dài" và bị trigger chặn với
--     thông điệp khó hiểu (UC-IAM-11.EX.1).
--   · SYSTEM_ADMIN không thu hồi qua giao diện (BR-IAM-05/18) → ROLE_NOT_REVOCABLE.
--   · Idempotency theo payload: cùng command_key phải cùng (actor, employee, assignment, reason).

-- Receipt dùng chung với GRANT (migration 08/10). Nới operation + thêm cột assignment_id.
alter table public.role_assignment_command_receipts
  drop constraint if exists role_assignment_command_receipts_operation_check;
alter table public.role_assignment_command_receipts
  add constraint role_assignment_command_receipts_operation_check
  check (operation in ('GRANT', 'REVOKE'));
alter table public.role_assignment_command_receipts
  add column if not exists assignment_id uuid;

create or replace function public.revoke_role_assignment(
  p_command_key uuid,
  p_assignment_id uuid,
  p_employee_id uuid,
  p_reason text,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_receipt public.role_assignment_command_receipts;
  v_assignment public.context_role_assignments;
  v_end timestamptz;
  v_result jsonb;
begin
  insert into public.role_assignment_command_receipts(
    command_key, actor_id, employee_id, operation, assignment_id, reason
  ) values (
    p_command_key, p_actor_id, p_employee_id, 'REVOKE', p_assignment_id, btrim(p_reason)
  ) on conflict do nothing;

  if not found then
    select * into v_receipt
      from public.role_assignment_command_receipts
      where command_key = p_command_key;
    -- ⚠️ Cùng key nhưng khác nội dung = dùng lại key sai.
    if v_receipt.actor_id <> p_actor_id
       or v_receipt.employee_id <> p_employee_id
       or v_receipt.operation <> 'REVOKE'
       or v_receipt.assignment_id is distinct from p_assignment_id
       or v_receipt.reason is distinct from btrim(p_reason) then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_rows is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_rows;
  end if;

  if nullif(btrim(p_reason), '') is null then
    raise exception 'REASON_REQUIRED';
  end if;

  -- Khoá dòng để hai Quản trị hệ thống bấm cùng lúc không cùng đóng (EX.1).
  select * into v_assignment from public.context_role_assignments
    where id = p_assignment_id for update;
  if not found
     or v_assignment.subject_type <> 'USER'
     or v_assignment.subject_id <> p_employee_id then
    raise exception 'ASSIGNMENT_NOT_FOUND';
  end if;

  if v_assignment.role_code = 'SYSTEM_ADMIN' then
    raise exception 'ROLE_NOT_REVOCABLE';
  end if;

  -- Đã thu hồi, hoặc đã tới/quá ngày kết thúc → coi như đã đóng (EX.1).
  if v_assignment.revoked_by is not null
     or (v_assignment.effective_to is not null and v_assignment.effective_to <= now()) then
    raise exception 'HISTORY_IMMUTABLE';
  end if;

  -- Dòng Sắp hiệu lực: đóng bằng đúng effective_from (AC.1). Dòng Đang hiệu lực: đóng ngay bây giờ.
  v_end := greatest(now(), v_assignment.effective_from);

  update public.context_role_assignments
    set effective_to = v_end,
        revoked_by = p_actor_id,
        revoke_reason = btrim(p_reason)
    where id = p_assignment_id
    returning * into v_assignment;

  begin
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata,
      request_id, ip_address, user_agent
    ) values (
      'iam.role.revoked', p_actor_id, nullif(p_actor_label, ''),
      'UserProfile', p_employee_id, v_assignment.context_type, v_assignment.context_id,
      btrim(p_reason),
      jsonb_build_object(
        'role_code', jsonb_build_object('before', v_assignment.role_code, 'after', v_assignment.role_code),
        'effective_to', jsonb_build_object('before', null, 'after', v_assignment.effective_to),
        'revoked_by', jsonb_build_object('before', null, 'after', p_actor_id)
      ),
      jsonb_build_object('assignment_id', v_assignment.id),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    -- Giữ SQLERRM gốc ở `detail` để chẩn đoán khi audit hỏng; client chỉ nhận mã AUDIT_WRITE_FAILED.
    raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', v_assignment.id,
    'employee_id', v_assignment.subject_id,
    'role_code', v_assignment.role_code,
    'context_type', v_assignment.context_type,
    'context_id', v_assignment.context_id,
    'effective_from', v_assignment.effective_from,
    'effective_to', v_assignment.effective_to,
    'grant_reason', v_assignment.grant_reason,
    'revoke_reason', v_assignment.revoke_reason,
    'revoked_by', v_assignment.revoked_by,
    'created_at', v_assignment.created_at
  );

  update public.role_assignment_command_receipts
    set result_rows = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on function public.revoke_role_assignment(
  uuid,uuid,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.revoke_role_assignment(
  uuid,uuid,uuid,text,uuid,text,text,inet,text
) to service_role;
