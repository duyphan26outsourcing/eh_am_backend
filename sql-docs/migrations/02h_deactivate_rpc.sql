-- =============================================================================
-- MIGRATION 02h: HÀM RPC NGỪNG MỤC DANH MỤC (UC-MDM-03.AC.2, UC-MDM-07.AC.2)
-- =============================================================================
--
-- ⚠️ VÌ SAO CẦN HÀM POSTGRES — GIỐNG 02b/02d/02f
--
-- Luồng NGỪNG (AC.2) phải làm nguyên tử trong MỘT giao dịch có KHOÁ DÒNG mục danh mục:
-- kiểm lại lý do (còn hoạt động, đúng nhóm), kiểm "còn dùng", lật `status` sang INACTIVE và
-- ghi `audit_events` — tất cả cùng thành công hoặc cùng không có (UC-MDM-03 3f, EX.6; BR-AUD-04).
-- supabase-js không có transaction nhiều câu lệnh nên gói vào plpgsql. Khoá dòng chặn tình
-- huống biên: có location/nhân viên gắn vào ĐỒNG THỜI với thao tác ngừng (UC-MDM-03 Tin cậy).
--
-- Ai/khi/vì-sao của việc ngừng nằm ở `audit_events` (actor_id, created_at, reason), không thêm
-- cột vào bảng danh mục — bảng chỉ lật `status`. Lý do ngừng = nhãn lý do đã chọn (+ ô ghi thêm
-- khi chọn "Khác"), hàm tự dựng để nhật ký đọc được nội dung tại thời điểm ghi (BR-AUD-01).
--
-- ⚠️ CHỈ NGỪNG COST CENTER + LÝ DO Ở MIGRATION NÀY:
--   · Ngừng phòng ban (UC-MDM-08.AC.2) cần đếm nhân viên còn ở phòng ban qua
--     `user_profiles.department_id` — cột này thuộc M01/UC-IAM-05, CHƯA có → để migration sau.
--   · Đóng location (UC-MDM-02) cần kiểm tài sản + phiếu mở (M03+) và đơn vị sửa chữa
--     (UC-MDM-06) — CHƯA có bảng → để migration sau.
--
-- ⚠️ PHỤ THUỘC: chạy SAU 02, 02c, 02d, 02f, 02g (cần nhóm 'CATALOG_DEACTIVATE' + mục "Khác").
-- Idempotent (`create or replace`). Chạy xong nhớ `npm run gen:types`.
-- =============================================================================

-- Ngừng cost center (UC-MDM-03.AC.2). Message lỗi để backend map:
--   COST_CENTER_NOT_FOUND → NOT_FOUND (404)
--   VERSION_CONFLICT      → RECORD_VERSION_CONFLICT (409)  (đã ngừng hoặc bị sửa song song)
--   REASON_INVALID        → VALIDATION_FAILED (400)  (lý do hết hiệu lực / sai nhóm)
--   REASON_NOTE_REQUIRED  → VALIDATION_FAILED (400)  (chọn "Khác" mà ô ghi thêm trống)
--   CATALOG_ITEM_IN_USE   → CATALOG_ITEM_IN_USE (409) (còn location đang dùng làm mặc định)
create or replace function public.deactivate_cost_center(
  p_id                  uuid,
  p_expected_version    integer,
  p_reason_code_id      uuid,
  p_note                text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.cost_centers
language plpgsql
as $$
declare
  v_row             public.cost_centers;
  v_reason_label    text;
  v_reason_freetext boolean;
  v_reason          text;
begin
  -- Khoá dòng cost center trước khi kiểm "còn dùng" và lật trạng thái (UC-MDM-03 3f).
  select * into v_row from public.cost_centers where id = p_id for update;
  if not found then
    raise exception 'COST_CENTER_NOT_FOUND';
  end if;
  if v_row.version <> p_expected_version then
    raise exception 'VERSION_CONFLICT';
  end if;

  -- Lý do ngừng phải còn hoạt động và thuộc nhóm 'Ngừng mục danh mục' (QĐ-06, UC-MDM-03 EX.1).
  select label, is_freetext into v_reason_label, v_reason_freetext
    from public.reason_codes
   where id = p_reason_code_id
     and status = 'ACTIVE'
     and reason_group = 'CATALOG_DEACTIVATE';
  if not found then
    raise exception 'REASON_INVALID';
  end if;
  if v_reason_freetext and btrim(coalesce(p_note, '')) = '' then
    raise exception 'REASON_NOTE_REQUIRED';
  end if;
  v_reason := case
    when v_reason_freetext then btrim(p_note)
    else v_reason_label || coalesce(': ' || nullif(btrim(p_note), ''), '')
  end;

  -- Kiểm "còn dùng": còn location ĐANG HOẠT ĐỘNG lấy cost center làm mặc định (BR-MDM-09,
  -- UC-MDM-03 EX.3). ⚠️ HOÃN kiểm tài sản chưa kết thúc mang cost center — bảng tài sản (M03)
  -- CHƯA có; hiện chưa có tài sản nên điều kiện này rỗng. Bổ sung khi M03 xong.
  if exists (
    select 1 from public.locations
     where default_cost_center_id = p_id and status = 'ACTIVE'
  ) then
    raise exception 'CATALOG_ITEM_IN_USE';
  end if;

  update public.cost_centers
     set status     = 'INACTIVE',
         version    = version + 1,
         updated_by = p_actor_id
   where id = p_id
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.cost_center.deactivated', p_actor_id, p_actor_label, 'CostCenter', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     v_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;

-- Ngừng lý do (UC-MDM-07.AC.2). Chặn mục "Khác" (is_freetext) + tự-tham-chiếu làm ở service
-- (SYSTEM_REASON_PROTECTED / VALIDATION_FAILED) trước khi gọi hàm. Message lỗi để backend map:
--   REASON_CODE_NOT_FOUND → NOT_FOUND (404)
--   VERSION_CONFLICT      → RECORD_VERSION_CONFLICT (409)
--   REASON_INVALID        → VALIDATION_FAILED (400)
--   REASON_NOTE_REQUIRED  → VALIDATION_FAILED (400)
create or replace function public.deactivate_reason_code(
  p_id                  uuid,
  p_expected_version    integer,
  p_reason_code_id      uuid,
  p_note                text,
  p_actor_id            uuid,
  p_actor_label         text,
  p_changes             jsonb,
  p_request_id          text,
  p_ip                  inet,
  p_user_agent          text
)
returns public.reason_codes
language plpgsql
as $$
declare
  v_row             public.reason_codes;
  v_reason_label    text;
  v_reason_freetext boolean;
  v_reason          text;
begin
  select * into v_row from public.reason_codes where id = p_id for update;
  if not found then
    raise exception 'REASON_CODE_NOT_FOUND';
  end if;
  if v_row.version <> p_expected_version then
    raise exception 'VERSION_CONFLICT';
  end if;

  -- Lý do ngừng phải còn hoạt động và thuộc nhóm 'Ngừng mục danh mục' (UC-MDM-07 EX.1).
  select label, is_freetext into v_reason_label, v_reason_freetext
    from public.reason_codes
   where id = p_reason_code_id
     and status = 'ACTIVE'
     and reason_group = 'CATALOG_DEACTIVATE';
  if not found then
    raise exception 'REASON_INVALID';
  end if;
  if v_reason_freetext and btrim(coalesce(p_note, '')) = '' then
    raise exception 'REASON_NOTE_REQUIRED';
  end if;
  v_reason := case
    when v_reason_freetext then btrim(p_note)
    else v_reason_label || coalesce(': ' || nullif(btrim(p_note), ''), '')
  end;

  -- Lý do không bị FK tham chiếu như cost center/location nên không có phép kiểm "còn dùng" ở
  -- tầng DB; nhật ký cũ giữ nội dung lý do tại thời điểm ghi (BR-AUD-01) nên ngừng không hỏng.

  update public.reason_codes
     set status     = 'INACTIVE',
         version    = version + 1,
         updated_by = p_actor_id
   where id = p_id
  returning * into v_row;

  insert into public.audit_events
    (event_code, actor_id, actor_label, subject_type, subject_id,
     context_type, context_id, reason, changes, request_id, ip_address, user_agent)
  values
    ('mdm.reason_code.deactivated', p_actor_id, p_actor_label, 'ReasonCode', v_row.id,
     'PLATFORM', '00000000-0000-0000-0000-000000000000',
     v_reason, p_changes, p_request_id, p_ip, p_user_agent);

  return v_row;
end;
$$;
