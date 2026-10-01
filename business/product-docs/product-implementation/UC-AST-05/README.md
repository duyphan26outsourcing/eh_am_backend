# UC-AST-05 — Đổi người chịu trách nhiệm tài sản (kế hoạch backend)

## Contract và phân quyền

- `GET /v1/assets/:id/responsibility-options`: trả ứng viên ACTIVE có vai trò hiệu lực tại đúng location và lý do ACTIVE nhóm `PROFILE_EDIT`.
- `PATCH /v1/assets/:id/responsible`: nhận `responsibleUserId`, `reasonCodeId`, `reasonNote?`, `profileVersion`; bắt `Idempotency-Key`.
- Quản lý tài sản (PLATFORM) thao tác mọi location nội bộ; Quản lý điểm chỉ thao tác tài sản tại location mình quản lý. Service suy ra scope từ vai trò hiện tại và asset trong DB, không tin location từ client. Ngoài scope và không tồn tại cùng trả `NOT_FOUND`.

## Giao dịch

Migration 18 mở operation `CHANGE_RESPONSIBLE`, tạo RPC `change_asset_responsible` và vá `terminate_employee` để xử lý danh sách bàn giao theo QĐ-11. RPC khóa asset, kiểm phiên bản/trạng thái/location nội bộ, người mới ACTIVE và có vai trò location (hoặc Asset Manager platform), lý do đúng nhóm, rồi cập nhật người chịu trách nhiệm + audit trong một giao dịch. Replay cùng khóa không ghi lần hai.

## Lỗi và test

- Cùng người hiện tại, ứng viên/lý do sai → `VALIDATION_FAILED` hoặc `RESPONSIBLE_NOT_ON_LOCATION`.
- Location `EXTERNAL` → `ASSET_EXTERNAL_RESPONSIBILITY_LOCKED` (409); hồ sơ kết thúc → `ASSET_READ_ONLY`; lệch phiên bản → `RECORD_VERSION_CONFLICT`.
- Test service phải chứng minh scope all-location/location cụ thể/ngoài scope và chỉ gọi RPC sau khi authorize.
- Review IDOR, TOCTOU ứng viên, allowlist audit, idempotency, transaction rollback và grants.
