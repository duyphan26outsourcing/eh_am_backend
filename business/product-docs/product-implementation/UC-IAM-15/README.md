# Kế hoạch kỹ thuật backend — UC-IAM-15: Tra cứu danh sách nhân viên

> UC nguồn: `business/product-docs/product-usecase/M01-nguoi-dung-phan-quyen/UC-IAM-15_tra-cuu-danh-sach-nhan-vien.md`; blueprint §8, §14.1, §19. Soạn trước code ngày 2026-10-01.

## 1. Quyết định triển khai

- API canonical: `GET /v1/employees` — danh sách phân trang, chỉ `SYSTEM_ADMIN` phạm vi `PLATFORM` (dùng lại guard sẵn có của `EmployeesController`). Blueprint §19 ghi `/v1/users` nhưng code đã chốt `/v1/employees` ở UC-IAM-05; giữ một tên.
- **Dùng RPC `list_employees`** thay cho query-builder vì cần ba việc trong một truy vấn, mà PostgREST làm được nhưng dễ sai:
  1. Tìm **không dấu tiếng Việt** trên `display_name` (`unaccent(lower(...))`), kèm email và mã nhân viên (`ilike`).
  2. Lọc **vai trò theo cửa sổ hiệu lực** (`context_role_assignments` đang hiệu lực: `effective_from <= now()` và `effective_to is null or effective_to > now()`), bỏ dòng Sắp/Đã hết hiệu lực (AC.2).
  3. Lấy **trạng thái lời mời mới nhất** cho người `PENDING_ACTIVATION` (AC.1), và quy `SENT` đã quá hạn thành `EXPIRED` tại thời điểm đọc (migration 04 chỉ hạ hạn lúc preview/claim).
- Đây là một **truy vấn đọc, không ghi** — RPC không ghi audit, không đổi dữ liệu (hậu điều kiện: không có dòng nhật ký nào). Phù hợp comment `THROTTLE_SEARCH`: truy vấn unaccent nặng CPU nên đặt ở DB.
- Trả về **bản dựng riêng cho Quản trị hệ thống** (`toEmployeeListItemModel`): có email, điện thoại; không có cột nội bộ (`profile_version`, `created_by`, token lời mời…).
- Tổng số kết quả lấy bằng `count(*) over()` trong RPC (một lần quét), tránh gọi `count: 'exact'` tách rời.

## 2. Migration 05 (`05_employee_directory.sql`)

Tạo migration mới, không sửa 01–04. Idempotent, RLS giữ đóng.

- `create extension if not exists unaccent;` (dùng cho tìm không dấu). Nếu môi trường đã có thì no-op.
- RPC `list_employees(p_search text, p_location_id uuid, p_department_id uuid, p_role_code text, p_status text, p_employment_type text, p_limit int, p_offset int)` → `returns table(... , invite_status text, invite_expires_at timestamptz, total_count bigint)`:
  - lọc theo `status`, `primary_location_id`, `department_id`, `employment_type` khi tham số khác null;
  - khi `p_search` khác rỗng: `unaccent(lower(display_name)) like '%'||unaccent(lower(p_search))||'%' or work_email ilike '%'||p_search||'%' or employee_code ilike '%'||p_search||'%'`;
  - khi `p_role_code` khác null: `exists` một dòng `context_role_assignments` đang hiệu lực đúng `role_code` (và đúng `context_id` khi lọc kèm location cho vai trò LOCATION);
  - `invite_status`: lấy lời mời mới nhất theo `created_at`; nếu `SENT` mà `expires_at <= now()` thì trả `EXPIRED`;
  - `total_count = count(*) over()`; sắp xếp `display_name` tăng dần; `limit/offset` phân trang.
- Chỉ `authenticated`/`service_role` execute; backend gọi bằng `service_role`.

## 3. Hợp đồng và tầng mã

- `ListEmployeesQueryDto extends PaginationQueryDto`: `search?` (string, cắt + để RPC unaccent; service `sanitizeSearchTerm` bỏ `% _ , ( )`), `locationId?`/`departmentId?` (`@IsUUID('4')` message `INVALID_REFERENCE_ID`), `roleCode?` (`@IsIn` theo `ROLE_CATALOG`, message `VALUE_OUT_OF_DOMAIN`), `status?` (`@IsIn` 4 trạng thái tài khoản), `employmentType?` (`@IsIn` `EMPLOYMENT_TYPES`). `pageSize` tối đa 100 (chuẩn chung).
- `EmployeesRepository.listEmployees(args)`: gọi `rpc('list_employees', …)`, map lỗi Postgres, dựng `PaginatedResult` (total từ `total_count` dòng đầu, hoặc 0 khi rỗng).
- `EmployeesService.list(query)`: `sanitizeSearchTerm`, chuyển query rỗng→null, gọi repo, map từng dòng qua `toEmployeeListItemModel`. Không ghi audit.
- `EmployeesController.list()`: `@Get()`, `@Throttle({ default: THROTTLE_SEARCH })`, dùng guard/`@RequireContext` sẵn có của class (SYSTEM_ADMIN/PLATFORM → EX.2 trả 403 `ROLE_REQUIRED`).
- `employee.model.ts`: thêm `EmployeeListItemModel` + mapper (camelCase, `toIsoString` cho mốc, quy đổi `invite_status`).

## 4. TDD

RED trước cho: DTO validation (status/role/employmentType ngoài danh mục → 400; locationId sai định dạng → `INVALID_REFERENCE_ID`; pageSize>100 chặn); service `sanitizeSearchTerm` (gõ `%_,()` → bỏ, chỉ còn ký tự đặc biệt → coi như không có từ khoá, EX.3); service chuyển query rỗng→null và gọi repo đúng tham số; mapper `toEmployeeListItemModel` (SENT quá hạn→EXPIRED, ACTIVE→invite null; không lộ cột nội bộ); phân trang (total từ `total_count`, rỗng→total 0, EX.1).

GREEN rồi `npx tsc --noEmit`, `npm test`, `npx eslint src test`, review `typescript-reviewer` + `database-reviewer` (RPC, không đụng biên bảo mật ghi). Smoke RPC thực tế chỉ chạy **sau khi Duy chạy migration 05** + `npm run gen:types`. Không hardcode credential, không commit.

## 5. Ngoài phạm vi UC này

- Mở hồ sơ nhân viên chi tiết là UC-IAM-14; UC này chỉ điều hướng tới route hồ sơ.
- Nút **Gửi lại lời mời** (bước 5b, AC.1) thuộc **UC-IAM-07** — UC-IAM-15 chỉ hiển thị trạng thái lời mời và chỗ đặt nút; hành vi gửi lại làm ở UC-IAM-07 ngay sau.

## 6. Trạng thái 2026-10-01

- BE đã dựng: migration 05 (RPC `list_employees`), DTO/repo/service/controller, mapper, test. tsc 0 · jest 100/100 · eslint exit 0 · nest build xanh.
- FE đã dựng: trang `/employees` (filter bar + bảng + phân trang + trạng thái), API/queries, columns, i18n vi+en, sidebar. typecheck 0 · lint 0 error (8 warning TanStack cố hữu) · vitest 157/157 · build xanh.
- **Bảo mật (self-review + 2 reviewer):** migration 05 `revoke … from public, anon, authenticated` (không chỉ `public`) + clamp `p_limit ≤ 100` + `search_path = public, extensions, pg_temp`. Thêm **migration 06** gỡ execute anon/authenticated trên mọi RPC cũ (02l–04 cùng lỗ hổng) + chặn default privileges. Backend không ảnh hưởng (dùng service_role).
- **Chờ Duy:** chạy `sql-docs/migrations/05_employee_directory.sql` rồi `06_rpc_execute_hardening.sql` + `npm run gen:types`, rồi smoke RPC; sau đó manual test trang `/employees`.
- Ngoài phạm vi: mở hồ sơ chi tiết (UC-IAM-14) — dòng/tên hiện chưa điều hướng; nút "Gửi lại lời mời" là chỗ đặt (disabled) cho UC-IAM-07.
