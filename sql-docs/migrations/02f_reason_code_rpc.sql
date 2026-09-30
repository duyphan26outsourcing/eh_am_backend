-- =============================================================================
-- MIGRATION 02f: HÀM RPC + SEED "KHÁC" CHO DANH MỤC LÝ DO (UC-MDM-07 core)
-- =============================================================================
--
-- ⚠️ Cùng mẫu 02b/02d/02e: ghi lý do + audit nguyên tử trong một hàm plpgsql.
--
-- ⚠️ LỆCH GIỮA UC VÀ SCHEMA ĐÃ CHẠY (ghi để nhớ, quyết định ở UC-MDM-07/README):
--   · Migration 02 (đã chạy) chỉ cho 8 `reason_group`, mã duy nhất THEO NHÓM (uq theo
--     reason_group, code), mã dài 1..40. UC-MDM-07 (QĐ-06) mô tả 22 nhóm + mã duy nhất toàn
--     danh mục. Xây theo schema THẬT (8 nhóm) vì 02 không sửa được; mở rộng 22 nhóm +
--     nhóm 'CATALOG_DEACTIVATE' cần migration mới + chốt danh sách nhóm với Vận hành ([TBD-1/2]).
--   · Vì CHƯA có nhóm 'CATALOG_DEACTIVATE', luồng NGỪNG mục danh mục (cost center/phòng ban
--     AC.2) VẪN treo cho tới khi nhóm này được thêm.
--
-- ⚠️ PHẠM VI: tạo mới + sửa tên (label). Chặn sửa/ngừng mục 'Khác' (is_freetext) ở tầng service
-- (SYSTEM_REASON_PROTECTED). Ngừng lý do thường (AC.2) để sau (cần nhóm CATALOG_DEACTIVATE).
--
-- ⚠️ PHỤ THUỘC: chạy SAU 02 + 02c. Idempotent. Chạy xong `npm run gen:types`.
-- =============================================================================

-- Tạo lý do + audit. Trùng (nhóm, mã) → 23505 → DUPLICATE_RECORD. is_freetext luôn false
-- (mục 'Khác' chỉ do seed hệ thống tạo).
create or replace function public.create_reason_code(
  p_reason_group        text,
  p_code                text,
  p_label               text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.reason_codes
language plpgsql
as $$
declare
  v_row public.reason_codes;
begin
  insert into public.reason_codes
    (reason_group, code, label, is_freetext, created_by, updated_by)
  values
    (p_reason_group, p_code, p_label, false, p_actor_id, p_actor_id)
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.reason_code.created', p_actor_id, p_actor_label, 'ReasonCode', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Sửa tên (label) theo khoá lạc quan. Mã + nhóm KHÔNG đổi (BR-MDM-17). Chặn mục 'Khác' đã làm
-- ở service trước khi gọi hàm này.
create or replace function public.update_reason_code(
  p_id                  uuid,
  p_expected_version    integer,
  p_label               text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_reason              text,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.reason_codes
language plpgsql
as $$
declare
  v_row public.reason_codes;
begin
  update public.reason_codes
    set label      = p_label,
        version    = version + 1,
        updated_by = p_actor_id
  where id = p_id and version = p_expected_version
  returning * into v_row;

  if not found then
    if not exists (select 1 from public.reason_codes where id = p_id) then
      raise exception 'REASON_CODE_NOT_FOUND';
    end if;
    raise exception 'VERSION_CONFLICT';
  end if;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.reason_code.updated', p_actor_id, p_actor_label, 'ReasonCode', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     p_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Seed mục 'Khác' (is_freetext) cho MỖI nhóm hiện có (BR-CMN-10, BR-MDM-15). Idempotent theo
-- (reason_group, code). Không có actor (dữ liệu hệ thống lúc khởi tạo) nên created_by NULL.
insert into public.reason_codes (reason_group, code, label, is_freetext)
values
  ('ROLE_ASSIGNMENT', 'OTHER', 'Khác', true),
  ('PROFILE_EDIT',    'OTHER', 'Khác', true),
  ('ACCOUNT_LOCK',    'OTHER', 'Khác', true),
  ('TRANSFER',        'OTHER', 'Khác', true),
  ('DISPOSAL',        'OTHER', 'Khác', true),
  ('LABEL_REPRINT',   'OTHER', 'Khác', true),
  ('ASSET_CANCEL',    'OTHER', 'Khác', true),
  ('FINANCE_ADJUST',  'OTHER', 'Khác', true)
on conflict (reason_group, code) do nothing;
