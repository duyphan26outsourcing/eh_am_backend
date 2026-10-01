# UC-IAM-08 — Cập nhật hồ sơ nhân viên (kế hoạch backend)

## 1. Hợp đồng API

- `GET /v1/employees/:id/profile`: bản dựng quản trị gồm hồ sơ, `profileVersion`, trạng thái đồng
  bộ email và options đang hoạt động (location, department, manager, lý do `EMAIL_CHANGE`).
- `PATCH /v1/employees/:id/profile`: snapshot các trường được phép sửa + `profileVersion` + lý do
  tùy chọn; bắt buộc `Idempotency-Key`.
- `POST /v1/employees/:id/change-email`: `{ email, reasonCodeId, reasonNote?, profileVersion }` +
  `Idempotency-Key`.
- Cả ba route chỉ `SYSTEM_ADMIN` phạm vi `PLATFORM`; DTO whitelist không nhận status, role hoặc
  trường nội bộ.

## 2. Cập nhật hồ sơ thường

RPC `update_employee_profile` trong migration 13:

1. Receipt gắn toàn payload; replay trả đúng kết quả lần đầu.
2. Khóa hồ sơ đích, kiểm trạng thái không phải `DEACTIVATED`, kiểm `profile_version`.
3. Chuẩn hóa/kiểm họ tên, mã nhân viên, điện thoại, chức danh, loại hình, ngày vào làm.
4. Chỉ khi reference **đổi**, kiểm location/department/manager mới đang hoạt động. Location văn
   phòng bắt buộc department; location khác ép department về `NULL`.
5. Khi đổi manager, lấy advisory transaction lock cho cây tổ chức, kiểm manager không phải chính
   mình và không nằm trong nhánh cấp dưới bằng recursive CTE.
6. Dựng `changes` chỉ gồm trường thật sự đổi. Rỗng → trả `changed=false`, không update/audit.
7. Update + tăng version + audit `identity.profile.updated` cùng transaction.

Vai trò không nằm trong payload và không bị chạm. `RECORD_VERSION_CONFLICT`,
`EMPLOYEE_CODE_TAKEN`, `INVALID_SUPERIOR`, `AUDIT_WRITE_FAILED` được ánh xạ theo contract chung.

## 3. Đổi email

RPC `change_employee_email` đổi `work_email`, tăng version, thu hồi lời mời còn mở và tạo lời mời
mới khi `PENDING_ACTIVATION`, ghi audit cùng transaction; kiểm reason group `EMAIL_CHANGE` và
unique gồm cả hồ sơ đã ngừng. RPC đặt `auth_email_sync_status=PENDING`.

Sau commit service thử tối đa 3 lần:

1. `auth.admin.updateUserById` đổi email đăng nhập;
2. nếu đang chờ kích hoạt qua email, gửi lời mời mới tới địa chỉ mới;
3. gọi RPC nhỏ đánh dấu `IN_SYNC`; nếu hết retry thì đánh dấu `FAILED`, log vận hành và trả
   `REQUEST_TIMEOUT`. Hồ sơ/audit/email mới trong DB không rollback.

Không ghi token, lỗi hạ tầng chi tiết hay secret vào audit. Link cũ vô hiệu vì activation invite cũ
đã `REVOKED` trong transaction.

## 4. TDD / review / verify

- Test đỏ DTO, no-op, forwarding profileVersion, mapping xung đột, retry email và trạng thái sync.
- Review IDOR, mass assignment, reference changed-only, cycle concurrency, idempotency payload,
  audit diff tối thiểu và quyền execute RPC.
- Verify toàn bộ Jest, typecheck, lint, build; migration mới revoke public/anon/authenticated và chỉ
  grant service_role. Không sửa migration 01–12.

