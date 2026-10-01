# UC-AST-10 — Duyệt huỷ hồ sơ tạo sai (kế hoạch kỹ thuật backend)

> Checker của cặp maker-checker. Một Quản lý tài sản **khác người đề nghị** duyệt hoặc từ chối đề nghị
> ở `PENDING` (UC-AST-09). Duyệt → hồ sơ sang `CANCELLED` (giữ Asset ID, vẫn trong lịch sử). Dùng chung
> bảng `asset_cancellation_requests` + migration 21.

## 1. Hàng đợi duyệt (thay hộp việc GĐ1)

- `GET /v1/asset-cancellations?status=PENDING` → danh sách đề nghị Chờ duyệt kèm thông tin hồ sơ tối
  thiểu (asset_code, tên, địa điểm, người đề nghị, lý do, thời điểm). Quyền: platform `ASSET_MANAGER`.
- Phân trang `PaginatedResult`. Mapper không phơi cột nội bộ.

## 2. RPC `decide_asset_cancellation` (migration 21)

Idempotency qua `asset_command_receipts` (operation `DECIDE_CANCEL`). Tham số: request_id, decision
(`APPROVE`/`REJECT`), reason (khi REJECT), expected_version, actor. Trong transaction:
1. `asset_cancellation_requests ... for update`; không có → `NOT_FOUND`.
2. status ≠ `PENDING` → `CANCELLATION_ALREADY_DECIDED` (EX.3).
3. `version <> expected_version` → `RECORD_VERSION_CONFLICT`.
4. `decided_by = requested_by` → `SELF_APPROVAL_FORBIDDEN` (EX.1, BR-CMN-08).
5. **APPROVE:** `assets ... for update`; nếu lifecycle_status ∉ {IN_STORAGE,IN_USE} → `ASSET_STATUS_LOCKED`
   (EX.2 — chỉ cho Từ chối); set `lifecycle_status='CANCELLED'`, `profile_version+1`; set request
   `APPROVED` + decided_by/at; audit `asset.cancellation.approved` (changes lifecycle before/after; reason
   = lý do ĐỀ NGHỊ, giả định 3 của UC-10).
6. **REJECT:** lý do nhóm `APPROVAL_REJECT` ACTIVE (freetext bắt ghi chú) → `REASON_INVALID`; set request
   `REJECTED` + decision reason; audit `asset.cancellation.rejected`; hồ sơ KHÔNG đổi.
7. Ghi receipt result.

## 3. Endpoint

- `POST /v1/asset-cancellations/:requestId/decision` — platform `ASSET_MANAGER`; body
  `{ decision, reasonCodeId?, reasonNote?, profileVersion }`. Idempotency-Key bắt buộc.
- Maker-checker (decider ≠ requester) kiểm trong RPC (không tin client).

## 4. Hậu điều kiện khớp UC (BR-AST-01/03/07)

- Asset ID không đổi, không dùng lại; serial của hồ sơ CANCELLED không còn tính trùng (partial unique
  `where lifecycle_status <> 'CANCELLED'` của migration 15 đã lo). QR báo Đã hủy (BR-QR-05) — M04.

## 5. Test (TDD)

- DTO: decision ∉ {APPROVE,REJECT} → VALUE_OUT_OF_DOMAIN; REJECT thiếu reasonCodeId → lỗi; version < 1 → lỗi.
- Service: queue scope (platform ASSET_MANAGER); decide happy path (approve/reject) gọi RPC đúng args.
- Smoke live: request → queue thấy → self-approve chặn → approve bởi người khác → asset CANCELLED +
  timeline; nhánh reject.

## 6. Ngoài phạm vi

- Thông báo kết quả cho người đề nghị (HO-24) HOÃN tới khi có module thông báo.
- [TBD-5] Phụ lục K chưa có màn hình duyệt riêng; GĐ1 dùng trang hàng đợi + trang chi tiết.
