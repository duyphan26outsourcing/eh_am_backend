# Kế hoạch kỹ thuật backend — UC-IAM-06: Kích hoạt tài khoản được mời

> UC nguồn: `business/product-docs/product-usecase/M01-nguoi-dung-phan-quyen/UC-IAM-06_kich-hoat-tai-khoan-duoc-moi.md`. Soạn trước code ngày 2026-10-01.
>
> **Trạng thái: XONG (BE + FE), đã kiểm chứng.** BE tsc/eslint/jest 90/90 xanh; FE typecheck/lint/build/vitest 154/154 xanh. **Chờ Duy chạy `04_account_activation.sql` + `gen:types` + manual test** (migration 03 đã chạy).

## 1. Hợp đồng và ranh giới bảo mật

- Hai route công khai, đều giới hạn theo nhóm xác thực: `POST /v1/auth/activation/preview` đọc họ tên/email; `POST /v1/auth/activation/complete` nhận mật khẩu mới và hoàn tất kích hoạt.
- Frontend gửi Supabase access token loại `invite` trong body như luồng recovery hiện có. Backend xác minh chữ ký, chỉ chấp nhận profile `PENDING_ACTIVATION`, `must_change_password=false` và lời mời email còn hiệu lực.
- Token, mật khẩu và email không đi vào URL API, audit hay log. HTTP middleware không log body/query.
- Email mời của UC-IAM-05 phải chuyển về `${APP_URL}/activate-account`; frontend đọc token từ URL fragment rồi xoá fragment ngay lần render đầu.

## 2. Migration 04 (không sửa migration 03 đã chạy)

- Mở rộng trạng thái `activation_invites` với `ACTIVATING`, thêm `activation_started_at` để chiếm lời mời có thời hạn và phục hồi yêu cầu bị treo.
- RPC `preview_activation_invite(user_id)`: trả đúng dữ liệu tối thiểu của lời mời đang dùng được; hết hạn đổi sang `EXPIRED`; không trả token/hash.
- RPC `claim_activation_invite(user_id)`: cập nhật có điều kiện `SENT → ACTIVATING`, chỉ một request thắng; request treo quá thời gian xử lý được phép trả lại `SENT`.
- RPC `release_activation_invite(invite_id, user_id)`: `ACTIVATING → SENT` khi đặt mật khẩu ở Auth thất bại hoặc bước hoàn tất DB thất bại.
- RPC `complete_activation(invite_id, user_id, audit context)`: trong một transaction đổi lời mời sang `ACCEPTED`, profile sang `ACTIVE` và ghi một audit `iam.employee.activated`. Không sửa `effective_from` vì bảng vai trò là lịch sử bất biến; hiệu lực thực tế là giao của trạng thái profile `ACTIVE` và cửa sổ hiệu lực đã chọn, đúng quy tắc “mốc muộn hơn”.
- RLS tiếp tục đóng; chỉ `service_role` được execute. Audit không chứa token/hash/mật khẩu.

## 3. Tầng mã

- DTO riêng cho preview và complete; access token tối đa 4096 ký tự, mật khẩu dùng chung `PASSWORD_PATTERN`/72 ký tự.
- `ActivationRepository` chỉ gọi bốn RPC và ánh xạ lỗi DB sang mã nghiệp vụ.
- `ActivationService` xác minh JWT → preview/claim → `admin.updateUserById(password, email_confirm)` → complete. Nếu bước Auth hoặc DB lỗi sau claim thì luôn cố release; nếu mật khẩu đã đổi nhưng DB lỗi, trả lỗi và lần sau mật khẩu mới sẽ ghi đè như UC quy định.
- Mã lỗi mới: `INVITATION_INVALID` (400), `INVITATION_EXPIRED` (410), `INVITATION_USED_OR_REPLACED` (409), `PASSWORD_UPDATE_FAILED` (500). Lỗi audit giữ `AUDIT_WRITE_FAILED`.
- Sau thành công không cấp phiên EH-AM; người dùng được đưa về đăng nhập theo UC-IAM-01.

## 4. TDD và kiểm chứng

- RED: token thiếu/sai; profile mật khẩu tạm; lời mời hết hạn/đã dùng; hai request chỉ một request claim; password update lỗi phải release; complete lỗi phải release; thành công đổi profile/invite và chỉ có một audit; không lộ secret.
- GREEN: unit test service/repository mapping, typecheck, Jest đầy đủ, lint, build; sau khi migration được chạy thì `gen:types` và smoke DB thực tế.
- Không sửa migration đã chạy, không hardcode credential, không commit.

## 5. Ngoài phạm vi

- Gửi lại/thay thế lời mời thuộc UC-IAM-07.
- Luồng mật khẩu tạm và chặn route cho tới khi đổi mật khẩu thuộc UC-IAM-01/04.
- Không xây SMTP riêng; dùng email **Invite user** của Supabase với redirect cố định về màn kích hoạt EH-AM.
