# UC-AST-01 — Tạo hồ sơ tài sản (kế hoạch kỹ thuật backend)

> UC đầu tiên của M03. Dựng nền module `assets`: bảng `assets`, dãy cấp Asset ID, mã QR, RPC tạo
> hồ sơ atomic (asset + QR + audit) idempotent, và **biên phạm vi location** cho các UC đọc sau.

## 1. Phạm vi

- Thêm module `AssetsModule` (controller/service/repository/model/dto) vào `app.module.ts` — M03 đã
  có bộ UC duyệt nên được phép.
- Migration **15**: bảng `assets` + `asset_code_seq` + bảng `asset_command_receipts` + RPC `create_asset`.
- Route `POST /v1/assets` (Quản lý tài sản), `GET /v1/assets/create-options`.
- Chưa làm: ảnh (AC.1 — kho tệp riêng, để UC sau/khi có storage), nhập từ file (UC-AST-02), tài chính
  (UC-AST-04). QR = sinh **token** gắn asset ở GĐ này; ảnh QR render ở M04.

## 2. Bảng `assets` (migration 15)

| Cột | Kiểu | Ghi chú |
| --- | --- | --- |
| id | uuid pk | khoá nội bộ |
| asset_code | text unique not null | Asset ID người đọc; `'TS'||lpad(nextval('asset_code_seq'),6,'0')`; **không tái dùng** (BR-AST-01), cho phép khoảng trống |
| name | text not null | BR-AST-02 |
| asset_type_id | uuid not null → asset_types | phải là **loại lá** (parent_id not null, asset_kind not null), ACTIVE |
| serial | text null | bắt buộc nếu `asset_types.serial_required` (BR-AST-02) |
| note | text null | |
| purchase_date / supplier_id / invoice_no | date / uuid→suppliers / text (đều null) | thông tin mua, không bắt buộc (A-16) |
| primary_location_id | uuid not null → locations | ACTIVE |
| cost_center_id | uuid not null → cost_centers | = `locations.default_cost_center_id` lúc tạo (BR-MDM-04) |
| responsible_user_id | uuid not null → user_profiles | BR-AST-09 |
| lifecycle_status | text not null | check IN_STORAGE/IN_USE/UNDER_REPAIR/PENDING_DISPOSAL/DISPOSED/CANCELLED; tạo chỉ đặt IN_STORAGE/IN_USE |
| physical_condition | text not null default GOOD | check GOOD/NEEDS_REPAIR/BROKEN (BR-AST-19) |
| qr_token | text unique not null | token ngẫu nhiên gắn Asset ID (UC-QR-01) |
| profile_version | int not null default 1 | optimistic concurrency cho UC sửa sau |
| created_by / created_at / updated_at | | |

Index: unique(asset_code), unique(qr_token), **partial unique** `(asset_type_id, serial) where serial is not null and lifecycle_status <> 'CANCELLED'` (BR-AST-03), index(primary_location_id). RLS bật, deny-by-default.

## 3. RPC `create_asset` (atomic + idempotent)

Trong một transaction: nhận receipt (idempotency theo payload) → validate → cấp asset_code + qr_token
→ insert `assets` → insert audit `asset.asset.created` (lỗi → AUDIT_WRITE_FAILED, rollback) → lưu
receipt → trả hồ sơ. Kiểm (ánh xạ lỗi):

- loại tài sản phải là lá + ACTIVE; serial bắt buộc theo `serial_required` → `ASSET_SERIAL_REQUIRED` (400).
- location ACTIVE; `default_cost_center_id` null → `LOCATION_COST_CENTER_MISSING` (400).
- **BR-AST-09**: responsible ACTIVE **và** (có vai trò LOCATION trên đúng location đó) **hoặc**
  (ASSET_MANAGER platform, cho cả location EXTERNAL) → nếu không: `RESPONSIBLE_NOT_ON_LOCATION` (400).
- lifecycle_status ∈ {IN_STORAGE, IN_USE} → khác: `ASSET_STATUS_INVALID` (400).
- serial trùng (partial unique) → `unique_violation` → `DUPLICATE_RECORD` (409) kèm asset_code đang giữ.
- idempotency: cùng key khác payload → `IDEMPOTENCY_KEY_REUSED`; đang chạy → `IDEMPOTENCY_IN_PROGRESS` (408).

`security definer set search_path=public,pg_temp`; `revoke all ... from public,anon,authenticated; grant execute ... to service_role`.

## 4. Guard / scope / audit

- `POST /assets`, `GET /assets/create-options`: `@RequireContext({ roles:[ASSET_MANAGER], contextType: PLATFORM })` (EX.5). Quản lý tài sản là vai trò platform.
- Audit `asset.asset.created`: actor, subject=Asset, changes = giá trị sau, metadata { qr_generated:true, asset_code }. Không ghi đường dẫn tệp (BR-AUD-02).
- Biên dữ liệu: các UC đọc (AST-07/08) dùng `AccessScopeService` + `applyLocationScope(query, scope, 'primary_location_id')` với `ASSET_LIST_SCOPE` (platform: ASSET_MANAGER/ASSET_ACCOUNTANT/EXECUTIVE/AUDITOR; location: LOCATION_MANAGER/LOCATION_STAFF). UC-AST-01 là ghi nên guard platform là đủ.

## 5. Phân tầng & model

- `assets.repository.ts` (`createViaRpc`, `createOptions`, error mapper), `assets.service.ts` (dựng audit ctx, map model), `assets.model.ts` (`toCreatedAssetModel`, không lộ cột nội bộ), DTO `create-asset.dto.ts`.
- `database.types.ts`: thêm tay bảng `assets` + fn `create_asset` (gen:types ghi đè sau khi chạy 15).
- `supabase.define.ts`: thêm `ASSETS: 'assets'`, `ASSET_COMMAND_RECEIPTS`.

## 6. Test (TDD)

- DTO: thiếu name/type/location/responsible/status → lỗi; status ngoài miền; serial optional.
- Service: forward đúng tham số xuống RPC; map kết quả → model có asset_code/qr_token/status; lỗi RPC (DUPLICATE_RECORD, RESPONSIBLE_NOT_ON_LOCATION) truyền nguyên.
- (Scope thuần đã có test ở `access-scope`; thêm khi làm AST-07.)

## 7. Ngoài phạm vi / để lại

- Ảnh tài sản (AC.1) chờ hạ tầng kho tệp riêng tư (§18) — note Q-20 dữ liệu cá nhân.
- Lập từ tài sản lạ (AC.2) chờ M05 (UC-STK-06).
- [TBD-2] ngưỡng giá trị CCDC phải lập hồ sơ — chưa chặn (chưa có nguyên giá lúc tạo).
