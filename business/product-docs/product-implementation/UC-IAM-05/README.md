# Kế hoạch kỹ thuật backend — UC-IAM-05: Thêm nhân viên mới

> UC nguồn: `business/product-docs/product-usecase/M01-nguoi-dung-phan-quyen/UC-IAM-05_them-nhan-vien-moi.md`; blueprint §8, §14.1. Cập nhật trước code ngày 2026-10-01.

## 1. Quyết định triển khai

- API canonical: `POST /v1/employees`; lookup dùng `GET /v1/employees/create-options`.
- Chỉ `SYSTEM_ADMIN` phạm vi `PLATFORM` được tạo. Đăng ký công khai `POST /v1/auth/register` được đóng.
- Mời email là mặc định và dùng `admin.inviteUserByEmail`, đúng API mời người dùng của Supabase. Hạn DB đọc từ `SUPABASE_EMAIL_OTP_EXPIRY_SECONDS` (mặc định chính thức 3600 giây) và phải khớp cấu hình Email OTP Expiration trên Dashboard.
- Nhánh mật khẩu tạm không tạo lời mời, đặt `must_change_password=true`; mật khẩu chỉ đi thẳng vào Supabase Auth và không ghi DB/audit/log.
- Registry code dùng đủ 9 vai trò blueprint. `SYSTEM_ADMIN` không assignable; vai trò location dùng location chính làm phạm vi, vai trò platform dùng UUID nil.
- Một lệnh chỉ nhận tối đa một vai trò ban đầu; bỏ trống vai trò là hợp lệ.

## 2. Migration 03

Tạo migration mới, không sửa 01/02:

- Mở rộng `user_profiles`: `work_email`, `primary_location_id`, `department_id`, `manager_id`, `employment_type`, `start_date`, `profile_version`, `must_change_password`; status thêm `PENDING_ACTIVATION`.
- Unique case-insensitive cho email, unique mã nhân viên đã chuẩn hoá; FK location/department/manager và trigger chống manager tự tham chiếu/vòng lặp.
- `activation_invites`: chỉ lưu `token_hash`, trạng thái, hạn dùng và người tạo; RLS đóng.
- `employee_command_receipts`: biên nhận idempotency bền vững.
- RPC `create_employee`: khóa receipt và các tham chiếu, kiểm location/department/manager/reason/role, rồi ghi profile + role tùy chọn + invite tùy chọn + một audit trong cùng transaction.
- Supabase Auth vẫn ở ngoài transaction: service tạo Auth user trước, RPC lỗi thì bù trừ bằng `admin.deleteUser`.

## 3. Hợp đồng và tầng mã

- DTO tách theo cấu trúc wizard nhưng gửi một payload cuối; normalize email lowercase, mã nhân viên uppercase, số điện thoại về `0xxxxxxxxx`.
- `EmployeesRepository`: lookup location/phòng ban/cấp trên/lý do, kiểm profile theo email, gọi RPC.
- `EmployeesService`: kiểm role assignable/context; nhánh email gọi API invite để tạo Auth user và gửi thư, nhánh mật khẩu tạm gọi `createUser`; sau đó gọi RPC và bù trừ bằng xoá Auth user nếu RPC lỗi. Email đã phát trước một lỗi DB hiếm sẽ dẫn tới liên kết không dùng được, nhưng không để lại tài khoản mồ côi.
- `EmployeesController`: `JwtAuthGuard`, `PermissionsGuard`, `SYSTEM_ADMIN/PLATFORM`, write throttle, `Idempotency-Key` UUID bắt buộc.
- `AuthController` bỏ route register công khai; login giữ `PENDING_ACTIVATION` là chưa hoạt động cho tới UC-IAM-06.

## 4. TDD

RED trước cho normalization/DTO, mapping role context, phòng ban bắt buộc chỉ với OFFICE, cấp trên active và không tự tham chiếu, reason `ROLE_ASSIGNMENT`, role không assignable, tạo Auth rồi RPC, bù trừ khi RPC lỗi, replay idempotent và không log password.

GREEN rồi chạy typecheck, full Jest, ESLint, review security/service-role boundary. Runtime smoke RPC chỉ chạy sau khi Duy chạy migration 03; không hardcode credential, không xoá lịch sử, không commit.

## 5. Ngoài phạm vi UC này

- Danh sách/hồ sơ đầy đủ thuộc UC-IAM-15/14; sau tạo, UI hiển thị xác nhận có mã hồ sơ.
- Kích hoạt lời mời, gửi lại và bắt buộc đổi mật khẩu thuộc UC-IAM-06/07/01/04. UC này tạo đúng trạng thái và dữ liệu nền cho các UC đó.

## 6. Trạng thái 2026-10-01

- BE/FE đã dựng; backend 74 test xanh, typecheck/lint/build xanh; frontend 145 test xanh, typecheck/build xanh, lint không có error (7 warning cũ).
- Migration `03_employee_onboarding.sql` đã chạy; `npm run gen:types` và smoke RPC thực tế đã xanh cho replay idempotency, chặn email trùng, trạng thái `PENDING_ACTIVATION`, cờ `must_change_password` và audit.
- Còn chờ manual test UI của Duy tại `/employees/new`.
