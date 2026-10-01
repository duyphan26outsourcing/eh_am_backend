# UC-AST-09 — Đề nghị huỷ hồ sơ tạo sai (kế hoạch kỹ thuật backend)

> Maker-checker: Quản lý tài sản / Kế toán tài sản **đề nghị** huỷ một hồ sơ tạo nhầm/trùng kèm lý do.
> Hồ sơ KHÔNG bị xoá, chưa đổi trạng thái; phải một Quản lý tài sản **khác** duyệt ở UC-AST-10. Dùng
> chung bảng + migration với UC-AST-10 (migration 21).

## 1. Thực thể mới (migration 21)

Bảng **`asset_cancellation_requests`** (có version để khóa lạc quan ở bước duyệt):

| Cột | Ghi chú |
| --- | --- |
| id uuid pk | |
| asset_id uuid fk assets | |
| status text | `PENDING` / `APPROVED` / `REJECTED` (check), default PENDING |
| request_reason_code_id, request_reason_note | lý do đề nghị (nhóm `ASSET_CANCEL`) |
| requested_by uuid, requested_at timestamptz | |
| decided_by uuid, decided_at, decision_reason_code_id, decision_reason_note | điền ở UC-AST-10 |
| version int default 1, created_at, updated_at | |

- **Partial unique** `uq_asset_cancellation_pending (asset_id) where status='PENDING'` — mỗi hồ sơ chỉ một
  đề nghị Chờ duyệt (EX.3 / [TBD-5]).
- RLS bật, mặc định từ chối. Không xoá cứng; đổi trạng thái + audit.

## 2. RPC `request_asset_cancellation` (migration 21)

Idempotency qua `asset_command_receipts` (operation `REQUEST_CANCEL`). Trong transaction:
1. `assets ... for update`; không có → `ASSET_NOT_FOUND`.
2. lifecycle_status kết thúc (DISPOSED/LOST/CANCELLED) → `ASSET_READ_ONLY`; ∉ {IN_STORAGE,IN_USE} →
   `ASSET_STATUS_LOCKED` (EX.1).
3. Đã có đề nghị `PENDING` → `CANCELLATION_PENDING_EXISTS` (EX.3).
4. **EX.5 — cần người duyệt chéo:** đếm `context_role_assignments` PLATFORM `ASSET_MANAGER` ACTIVE,
   `subject_id <> requester`; = 0 → `NO_APPROVER_AVAILABLE`.
5. Lý do nhóm `ASSET_CANCEL` ACTIVE; freetext thiếu ghi chú → `REASON_INVALID` (EX.2).
6. Insert request `PENDING`; audit `asset.cancellation.requested` (metadata asset_code; reason).

## 3. Endpoint

- `POST /v1/assets/:id/cancellation-request` — actor platform `ASSET_MANAGER` **hoặc** `ASSET_ACCOUNTANT`
  (`@RequireContext` PLATFORM với `platformRoles`). Idempotency-Key bắt buộc.
- Hàng đợi duyệt (hộp việc) ở UC-AST-10.

## 4. "Hộp việc" (HO-24) ở GĐ1

Chưa có module thông báo/hộp việc. GĐ1 hiện **danh sách đề nghị Chờ duyệt** (UC-AST-10 GET) thay cho
push-notification; thông báo kết quả cho người đề nghị **HOÃN** (làm khi có module thông báo).

## 5. Test (TDD)

- DTO: reasonCodeId sai UUID → INVALID_REFERENCE_ID; reasonNote > 500 → lỗi.
- Service: happy path gọi RPC đúng args. (Guard nghiệp vụ EX.1/3/5 ở RPC, smoke live phủ.)

## 6. Ngoài phạm vi / quyết định

- [TBD-4] rút đề nghị đang chờ: chưa có luồng.
- Tiền điều kiện "tài sản không trong phiếu điều chuyển/sửa chữa/thanh lý mở": M06/M07/M08 CHƯA có →
  tạm chỉ kiểm theo lifecycle_status; bổ sung khi có các module đó.
