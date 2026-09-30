# Kế hoạch kỹ thuật backend — UC-MDM-07: Cập nhật danh mục lý do

> **Yêu cầu 2 (backend).** UC: [UC-MDM-07](../../product-usecase/M02-danh-muc-nen/UC-MDM-07_cap-nhat-danh-muc-ly-do.md). Tính năng F-MDM-07. Cùng mẫu [UC-MDM-03](../UC-MDM-03/README.md).
>
> **Trạng thái: CORE + AC.2 đã dựng (tsc/eslint/test xanh).** Tạo mới + sửa tên (label) + **ngừng lý do (AC.2)**. Migration `02f` + `02g` + `02h_deactivate_rpc.sql` đã chạy (+ gen:types).

## LỆCH SCHEMA vs UC — ĐÃ CHỐT: mở lên 22 nhóm (migration 02g)

Migration 02 ban đầu chỉ có 8 nhóm; Duy đã chốt **mở lên đủ 22 nhóm (QĐ-06)** → `migration 02g_reason_groups_22.sql` sửa CHECK `reason_group` (8 mã cũ giữ nguyên + 14 mã mới) và seed mục 'Khác' cho 14 nhóm mới. `REASON_GROUPS` cập nhật ở BE (`dto/reason-code.dto.ts`) + FE (`master-data.api.ts`) + i18n (`masterData.reasonCodes.group.*`, 22 nhãn vi/en).

**⚠️ Duy cần chạy `02g_reason_groups_22.sql` + `npm run gen:types`** để 22 nhóm có hiệu lực runtime.

Còn lệch (giữ theo schema, chấp nhận được): mã duy nhất **theo nhóm** (không phải toàn danh mục); độ dài mã DB 1–40 (DTO siết 2–20).

Nhóm `CATALOG_DEACTIVATE` + `LOCATION_CLOSE` đã có → **mở khoá** luồng NGỪNG mục danh mục (UC-MDM-03/07/08 AC.2) và đóng location (UC-MDM-02). Các luồng NGỪNG sẽ dựng tiếp (deactivate RPC + kiểm "còn dùng").

**22 nhóm (mã → thao tác):** ROLE_ASSIGNMENT(13), ROLE_REVOKE(14), PROFILE_EDIT(1), ACCOUNT_LOCK(15), ACCOUNT_UNLOCK(16), TERMINATION(17), EMAIL_CHANGE(18), TRANSFER(5), VOUCHER_CANCEL(6), APPROVAL_REJECT(7), DISPOSAL(8), PROPOSAL_CANCEL(9), LOSS_CONFIRM(10), ASSET_RECOVERY(11), LABEL_REPRINT(12), ASSET_CANCEL(3), FINANCE_ADJUST(2), USE_STATUS_CHANGE(4), CATALOG_DEACTIVATE(19), LOCATION_CLOSE(20), CONFIG_CHANGE(21), ACCEPTANCE_FAIL(22).

## 1. Endpoint và tầng
- `GET /v1/master-data/reason-codes?page&pageSize&reasonGroup&status`
- `POST` — tạo (reasonGroup + code + label). `PATCH /:id` — sửa label; mã + nhóm chỉ đọc.
- `ReasonCodesController` → `ReasonCodesService` → `ReasonCodeRepository` → `toReasonCodeModel`. Guard: chỉ `SYSTEM_ADMIN`.

## 2. Điểm kỹ thuật chốt
- RPC `create_reason_code`/`update_reason_code` (02f) ghi lý do + audit nguyên tử. Seed mục 'Khác' (`is_freetext=true`) cho mỗi nhóm.
- **EX.3 `SYSTEM_REASON_PROTECTED` (409, mã mới):** service chặn sửa/ngừng mục 'Khác' (`is_freetext`) trước khi gọi RPC.
- Trùng (nhóm, mã) → `DUPLICATE_RECORD`. Khoá lạc quan `version` → `RECORD_VERSION_CONFLICT`.

## 3. Ngừng lý do (AC.2) — ĐÃ DỰNG

- Endpoint `POST /v1/master-data/reason-codes/:id/deactivate` — body `{ reasonCodeId, note?, version }` (`DeactivateReasonCodeDto`).
- Hàm `deactivate_reason_code` (migration `02h`): khoá dòng, kiểm lý do ngừng còn hoạt động + thuộc nhóm `CATALOG_DEACTIVATE`, lật `INACTIVE` + audit `mdm.reason_code.deactivated` (nguyên tử).
- **EX.3:** chặn ngừng mục 'Khác' (`is_freetext`) ở service → `SYSTEM_REASON_PROTECTED` (409). **EX.1:** chặn chọn chính lý do đang ngừng làm lý do ngừng ở service → `VALIDATION_FAILED` (400); lý do sai nhóm/hết hiệu lực (kiểm trong RPC) → `VALIDATION_FAILED`. **EX.4:** `RECORD_VERSION_CONFLICT` (409).
- Lý do không bị FK tham chiếu nên không có phép kiểm "còn dùng"; nhật ký cũ giữ nội dung lý do tại thời điểm ghi (BR-AUD-01) nên ngừng không hỏng lịch sử.

## 4. Kế hoạch test (TDD)
- Unit (service mock): chuẩn hoá mã + truyền nhóm; not-found → NOT_FOUND; **is_freetext → SYSTEM_REASON_PROTECTED**; version passthrough. ✅ (`reason-codes.service.spec.ts`, 4 test).

## 5. Kiểm chứng
`npx tsc --noEmit` · `npx eslint src test` · `npm test` (36/36). Không commit.
