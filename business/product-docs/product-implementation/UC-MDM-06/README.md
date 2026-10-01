# Kế hoạch kỹ thuật backend — UC-MDM-06: Đơn vị sửa chữa

> UC nguồn: `business/product-docs/product-usecase/M02-danh-muc-nen/UC-MDM-06_cap-nhat-danh-muc-don-vi-sua-chua.md`; blueprint §14.2. Soạn trước code ngày 2026-10-01.

## 1. Hợp đồng API

- `GET /v1/master-data/repair-vendors?page&pageSize&status&query` — danh sách có mã/tên location bên ngoài.
- `GET /v1/master-data/repair-vendors/available-locations` — location `EXTERNAL` + `ACTIVE` chưa gắn đơn vị; khi sửa vẫn trả location hiện tại.
- `POST /v1/master-data/repair-vendors` — tên, liên hệ, `serviceTypes`, `externalLocationId`; yêu cầu `Idempotency-Key` UUID v4.
- `PATCH /v1/master-data/repair-vendors/:id` — sửa tên/liên hệ/loại dịch vụ + `version`; không nhận đổi location.
- `POST /v1/master-data/repair-vendors/:id/deactivate` — lý do/note/version; ngừng vendor và location trong một RPC.
- Quyền server: `SYSTEM_ADMIN` hoặc `ASSET_MANAGER`, context `PLATFORM`.

## 2. Dữ liệu và migration

- `02o_repair_vendors.sql`: bảng `repair_vendors`, unique `external_location_id`, `service_types text[]` chỉ gồm `REPAIR|WARRANTY` và không rỗng; RLS đóng; trigger version/timestamp theo mẫu supplier; bảng receipt idempotency.
- `02p_repair_vendor_rpc.sql`: create/update/deactivate atomic với audit `mdm.repair_vendor.*`; create khóa location rồi kiểm `ACTIVE + EXTERNAL + chưa gắn`; deactivate khóa cả vendor/location, kiểm version và reason, đổi hai status rồi ghi hai audit.
- Không sửa migration cũ. Trước khi Duy chạy SQL, cập nhật tay `database.types.ts` đúng hợp đồng để compile; sau khi chạy phải `npm run gen:types`.
- Kiểm tra tài sản/phiếu mở của BR-MDM-03 được đặt sau một helper RPC riêng. Ở schema hiện tại M03/M06/M07 chưa tồn tại nên helper chỉ kiểm các bảng đã có; migration của các module đó phải mở rộng helper, không nhét tên bảng tương lai chưa chốt vào UC này.

## 3. Tầng mã

`repair-vendor-normalization.ts` → DTO → model → repository → service → controller, đăng ký module/`SupabaseTable`. Copy cấu trúc supplier, nhưng mapper list nhận relation location `{code,name,type,status}`.

- Tên trim, 1–200.
- Liên hệ tuỳ chọn; phone chuẩn hoá về `0xxxxxxxxx`, email lowercase.
- `serviceTypes`: loại trùng, sắp theo thứ tự `REPAIR`, `WARRANTY`, ít nhất một.
- Location bất biến sau tạo; DTO update không có `externalLocationId`.
- Unique/FK race map thành `RECORD_VERSION_CONFLICT` hoặc `REFERENCE_NOT_FOUND`, không lộ Postgres message.

## 4. TDD và kiểm chứng

RED trước cho: chuẩn hoá phone/email; thiếu service type; create truyền location; update không đổi location; list map code/name; inactive/wrong-type/đã gắn location; optimistic lock; idempotent replay; deactivate đổi vendor + location và hai audit.

Sau GREEN: review bảo mật/service-role boundary, `npm run format`, build/typecheck/lint/full test. Runtime smoke chỉ chạy sau 02o/02p; không hardcode credential, không xoá lịch sử, không commit.

## 5. Trạng thái kiểm chứng 2026-10-01

- Duy đã chạy `02o` và `02p`; types đã sinh lại từ schema thật.
- `tools/smoke-repair-vendor-rpc.mjs` xanh: create/update/deactivate replay idempotent, location trùng và version cũ bị chặn, vendor + location cùng ngừng, audit đúng 3 dòng vendor và 2 dòng location.
- Unit test, typecheck, lint và build đã xanh; còn manual test giao diện của Duy.
