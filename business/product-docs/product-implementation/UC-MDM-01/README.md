# Kế hoạch kỹ thuật backend — UC-MDM-01: Cập nhật danh mục location

> **Yêu cầu 2 (backend).** UC: [UC-MDM-01](../../product-usecase/M02-danh-muc-nen/UC-MDM-01_cap-nhat-danh-muc-location.md). Tính năng F-MDM-01. Theo `/ecc:plan` + `tdd-workflow` (bảng skill ở `CLAUDE.md`).
>
> **Trạng thái: chưa dựng.** Cần chạy `migration 02` (đã viết) + `npm run gen:types` trước. Đây là UC nghiệp vụ ĐẦU TIÊN được dựng — nó lập khuôn tầng repository→service→model cho các danh mục M02 còn lại và cho module tài sản.

## 1. Endpoint và tầng
- `GET /v1/master-data/locations` — danh sách (kèm loại, cost center mặc định, trạng thái). Lọc/tìm sau.
- `POST /v1/master-data/locations` — tạo mới.
- `PATCH /v1/master-data/locations/:id` — sửa (tên, địa chỉ, cost center mặc định); mã và loại chỉ đọc (BR-MDM-17, Giả định 2).
- Module `master-data` (`src/master-data/`): controller → service → repository (kế thừa `BaseRepository`) → model mapper `toLocationModel`.
- Guard: `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@RequireContext({ roles: [SYSTEM_ADMIN, ASSET_MANAGER], contextType: PLATFORM })` (BR-CMN-03). Đăng ký `imports: [SupabaseModule, SupabaseJwtModule]`.

## 2. Sơ đồ trình tự (tạo location)
```mermaid
sequenceDiagram
    actor AD as Quan tri / Quan ly tai san
    participant API as locations.controller
    participant SVC as LocationsService
    participant RPC as rpc(create_location)
    participant DB as locations + audit_events
    AD->>API: POST /v1/master-data/locations (kem idempotency key)
    API->>SVC: create(dto)
    SVC->>SVC: chuan hoa code (upper/trim); kiem loai hop le
    SVC->>SVC: kiem cost center Dang hoat dong (EX.1)
    SVC->>RPC: create_location(fields, actor, reason)
    alt trung ma (EX.2)
        RPC-->>SVC: unique_violation
        SVC-->>API: 409 DUPLICATE_RECORD
    else ok
        RPC->>DB: insert location + insert audit (cung transaction, BR-AUD-04)
        RPC-->>SVC: location row
        SVC-->>API: 201 toLocationModel
    end
```

## 3. Điểm kỹ thuật chốt (từ UC)
- **Nguyên tử thay đổi + audit** (BR-AUD-04, hậu điều kiện 3): location và dòng `audit_events` trong **một transaction** → hàm Postgres `create_location` / `update_location` gọi qua `rpc()` (supabase-js không có transaction nhiều câu). EX.5 `AUDIT_WRITE_FAILED` (500): audit lỗi thì rollback cả thay đổi.
- **Chuẩn hoá + duy nhất mã** (BR-MDM-01): upper/trim rồi kiểm unique trên toàn bảng (kể cả INACTIVE); DB đã có `uq_locations_code`. Trùng → `DUPLICATE_RECORD` (409).
- **Khoá lạc quan** (EX.4): PATCH nhận `version`; `update ... where id=? and version=?`, không khớp → `RECORD_VERSION_CONFLICT` (409, mã mới). Cột `version` đã thêm ở migration 02.
- **Idempotency** (EX.6, QĐ-01): key do client sinh; lệnh trùng key trả kết quả lần đầu.
- **Cost center bắt buộc + Đang hoạt động** (BR-MDM-04): kiểm tồn tại + ACTIVE ở service trước khi tạo.
- **Mã/loại bất biến sau tạo**: PATCH bỏ qua/từ chối đổi `code`, `type`.
- **Model mapper**: không trả thẳng dòng DB; `toLocationModel(row)` camelCase, `toIsoString` cho mốc thời gian.

## 4. Mã lỗi mới (thêm `error-code.const.ts`)
`RECORD_VERSION_CONFLICT` (409), `AUDIT_WRITE_FAILED` (500). (`DUPLICATE_RECORD` 409, `VALIDATION_FAILED` 400, `ROLE_REQUIRED` 403, `REQUEST_TIMEOUT` 408, `ACCOUNT_INACTIVE` 403 — kiểm đã có, thêm nếu thiếu.)

## 5. Thay đổi hạ tầng kèm theo
- `SupabaseTable` registry (`supabase.define.ts`): thêm `cost_centers`, `locations`, `departments`, `reason_codes`.
- `database.types.ts`: bổ sung kiểu 4 bảng (hoặc `npm run gen:types` khi migration đã chạy).
- Audit event codes `mdm.location.created` / `mdm.location.updated` (`audit-event.enum.ts`).
- Message + i18n cho thông báo thành công.

## 6. Kế hoạch test (TDD — RED→GREEN)
- Unit (pure/service với mock): chuẩn hoá mã; kiểm loại hợp lệ; map DTO→row; `toLocationModel`; nhánh version-conflict; nhánh cost-center-inactive; role guard.
- Hàm Postgres `create_location`/`update_location`: test nguyên tử (audit lỗi → không lưu location).
- e2e contract offline: định tuyến + hình dạng lỗi (`VALIDATION_FAILED`, `DUPLICATE_RECORD`, `RECORD_VERSION_CONFLICT`).
- Manual (cổng Yêu cầu 3): tạo 3–4 location đủ 5 loại, sửa, thử trùng mã, thử sửa đồng thời.

## 7. Kiểm chứng trước khi báo xong
`npx tsc --noEmit` · `npx eslint src test` · `npm test` · `npm run test:e2e -- <contract>`. Không commit (chờ Duy).

## 8. Kế hoạch sửa lỗi địa chỉ có cấu trúc (2026-10-01)

- Không sửa migration đã chạy. Tạo `02n_location_structured_address.sql`, bổ sung `province_code`, `province_name`, `ward_name`, `address_detail` và thay chữ ký RPC location.
- DTO tạo/sửa bắt buộc đủ tỉnh/thành, phường/xã và địa chỉ chi tiết; service chuẩn hoá từng trường rồi RPC tự tạo chuỗi `address` tương thích dữ liệu cũ.
- API trả cả bốn trường có cấu trúc để dialog sửa khôi phục đúng từng control, không phân tích ngược chuỗi tự do.
- Danh sách location trả thêm mã/tên cost center từ quan hệ FK; giao diện hiện mã và tooltip tên, không lộ UUID.
- TDD: kiểm DTO/service không gọi RPC khi thiếu trường; kiểm RPC args và mapper cost center trước khi triển khai.
