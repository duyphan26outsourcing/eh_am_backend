# UC-IAM-13 — Cho nhân viên nghỉ việc (kế hoạch backend)

- `GET /v1/employees/:id/termination-preview`: hồ sơ/version, cấp dưới trực tiếp, vai trò còn mở,
  manager candidates và lý do `TERMINATION`. Tài sản trả `[]` vì M03 chưa có bảng tài sản.
- `POST /v1/employees/:id/terminate`: `{ profileVersion, newManagerId?, reasonCodeId,
  reasonNote?, assetTransfers: [] }` + Idempotency-Key, SYSTEM_ADMIN/PLATFORM.
- Migration 14 thêm ngày/lý do nghỉ việc và RPC transaction: khóa hồ sơ, chặn tự ngừng/quản trị cuối
  cùng, kiểm version/lý do/manager; đổi manager cho cấp dưới; đóng mọi role còn mở; chuyển
  `DEACTIVATED`, tăng version; ghi audit từng nhóm. Sau commit service thu hồi session như UC-12.
- Fail-closed: trước khi M03 có contract tài sản, payload `assetTransfers` khác rỗng bị từ chối. M03
  phải mở rộng RPC này trong migration mới để kiểm role theo location và chuyển người phụ trách.
- TDD: preview mapping, DTO, transaction forwarding, session-failure semantics; review advisory lock
  quản trị cuối, close-only roles, idempotency, audit rollback và RPC grants.

