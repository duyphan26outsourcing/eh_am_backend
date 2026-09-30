-- =============================================================================
-- MIGRATION 02g: MỞ RỘNG `reason_group` LÊN 22 NHÓM (QĐ-06) + SEED 'Khác'
-- =============================================================================
--
-- ⚠️ VÌ SAO: UC-MDM-07 (QĐ-06) cần 22 nhóm lý do; migration 02 mới có 8 nhóm. Duy đã chốt mở
-- lên 22. Việc này MỞ KHOÁ luồng "ngừng mục danh mục" (nhóm 'CATALOG_DEACTIVATE') cho cost
-- center / phòng ban / lý do (AC.2) và "đóng location" ('LOCATION_CLOSE', UC-MDM-02).
--
-- ⚠️ GIỮ NGUYÊN 8 mã nhóm cũ (dòng 'Khác' đã seed ở 02f dùng chúng); THÊM 14 nhóm mới → 22.
-- `add constraint ... check` sẽ kiểm lại mọi dòng hiện có: các dòng cũ dùng 8 mã cũ vẫn nằm
-- trong danh sách 22 nên qua được.
--
-- ⚠️ PHỤ THUỘC: chạy SAU 02 + 02f. Idempotent (drop if exists + on conflict do nothing).
-- Chạy xong `npm run gen:types`.
-- =============================================================================

alter table public.reason_codes
  drop constraint if exists reason_codes_reason_group_check;

alter table public.reason_codes
  add constraint reason_codes_reason_group_check
  check (reason_group in (
    -- 8 nhóm gốc (02) — giữ nguyên mã
    'ROLE_ASSIGNMENT',    -- (13) gán vai trò
    'PROFILE_EDIT',       -- (1) điều chỉnh hồ sơ
    'ACCOUNT_LOCK',       -- (15) khoá tài khoản
    'TRANSFER',           -- (5) điều chuyển
    'DISPOSAL',           -- (8) thanh lý
    'LABEL_REPRINT',      -- (12) in lại nhãn
    'ASSET_CANCEL',       -- (3) huỷ hồ sơ tài sản
    'FINANCE_ADJUST',     -- (2) điều chỉnh tài chính
    -- 14 nhóm bổ sung → đủ 22 (QĐ-06)
    'USE_STATUS_CHANGE',  -- (4) đưa vào / ngừng sử dụng (UC-AST-11)
    'VOUCHER_CANCEL',     -- (6) huỷ phiếu (UC-TRF-06, UC-STK-01)
    'APPROVAL_REJECT',    -- (7) từ chối duyệt
    'PROPOSAL_CANCEL',    -- (9) huỷ đề nghị (UC-DSP-04)
    'LOSS_CONFIRM',       -- (10) xác nhận mất (UC-DSP-05)
    'ASSET_RECOVERY',     -- (11) khôi phục (UC-DSP-06)
    'ROLE_REVOKE',        -- (14) thu hồi vai trò (UC-IAM-11)
    'ACCOUNT_UNLOCK',     -- (16) mở khoá (UC-IAM-12)
    'TERMINATION',        -- (17) nghỉ việc (UC-IAM-13)
    'EMAIL_CHANGE',       -- (18) đổi email (UC-IAM-08.AC.3)
    'CATALOG_DEACTIVATE', -- (19) ngừng mục danh mục (UC-MDM-03..08)
    'LOCATION_CLOSE',     -- (20) đóng location (UC-MDM-02)
    'CONFIG_CHANGE',      -- (21) đổi cấu hình thông báo (UC-AUD-06)
    'ACCEPTANCE_FAIL'     -- (22) nghiệm thu không đạt (UC-MNT-07)
  ));

-- Seed mục 'Khác' cho 14 nhóm mới (8 nhóm cũ đã seed ở 02f). Idempotent theo (reason_group, code).
insert into public.reason_codes (reason_group, code, label, is_freetext)
values
  ('USE_STATUS_CHANGE',  'OTHER', 'Khác', true),
  ('VOUCHER_CANCEL',     'OTHER', 'Khác', true),
  ('APPROVAL_REJECT',    'OTHER', 'Khác', true),
  ('PROPOSAL_CANCEL',    'OTHER', 'Khác', true),
  ('LOSS_CONFIRM',       'OTHER', 'Khác', true),
  ('ASSET_RECOVERY',     'OTHER', 'Khác', true),
  ('ROLE_REVOKE',        'OTHER', 'Khác', true),
  ('ACCOUNT_UNLOCK',     'OTHER', 'Khác', true),
  ('TERMINATION',        'OTHER', 'Khác', true),
  ('EMAIL_CHANGE',       'OTHER', 'Khác', true),
  ('CATALOG_DEACTIVATE', 'OTHER', 'Khác', true),
  ('LOCATION_CLOSE',     'OTHER', 'Khác', true),
  ('CONFIG_CHANGE',      'OTHER', 'Khác', true),
  ('ACCEPTANCE_FAIL',    'OTHER', 'Khác', true)
on conflict (reason_group, code) do nothing;
