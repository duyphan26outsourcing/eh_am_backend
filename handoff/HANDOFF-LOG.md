# Sổ chuyển giao Codex ⇄ Claude Code

> Nơi hai bên bàn giao qua lại khi đổi agent (hết quota). **Luật:** trước khi dừng phiên, agent đang làm ghi **một entry mới lên ĐẦU** danh sách dưới (mới nhất trên cùng). Agent tiếp nhận đọc entry trên cùng + [HANDOFF-CODEX.md](../HANDOFF-CODEX.md) rồi làm tiếp.
>
> **Mẫu entry:**
> ```
> ## <ngày> — <Codex|Claude> → <bên nhận>
> - Vừa xong: <UC/việc + trạng thái tsc/eslint/test>
> - Duy đã manual test: <có/chưa, kết quả>
> - Migration cần Duy chạy: <file .sql hoặc "không">
> - Đang dở / chưa xong: <mô tả + file>
> - Làm tiếp: <UC/việc kế + gợi ý mẫu để copy>
> - Bẫy/lưu ý: <nếu có>
> ```

---

## 2026-10-01 — Claude → Duy/Codex — UC-AST-07 (danh sách tài sản) XONG CODE + REVIEW
- **Bối cảnh:** Duy đã chạy 15 (assets) và 16 (list_assets). Làm **UC-AST-07 — Tra cứu danh sách tài sản**: UC ĐỌC đầu tiên áp biên phạm vi location.
- **BE:** migration **16_asset_directory.sql** RPC `list_assets` (tìm không dấu unaccent trên name+asset_code+serial; lọc loại/trạng thái/tình trạng/location; phạm vi location vào dưới dạng mảng `p_location_ids`; `count(*) over()`; revoke/grant hardening). Route `GET /v1/assets` trên controller riêng **AssetsDirectoryController** (chỉ `JwtAuthGuard`, KHÔNG @RequireContext — guard không diễn tả được "vai trò LOCATION trên bất kỳ location nào"). Phân quyền + biên dữ liệu ở **service** qua `AccessScopeService` + `ASSET_LIST_SCOPE` (platform: ASSET_MANAGER/ASSET_ACCOUNTANT → mọi location; location: LOCATION_MANAGER → location được gán; phạm vi rỗng → **403 ROLE_REQUIRED**, EX.1). Bộ lọc `locationId` do client chọn giao với scope trong RPC (EX.2 — lọc ngoài phạm vi → rỗng, không lộ). Mapper không phơi cột giá trị (BR-CMN-06) / qr_token. `database.types.ts` thêm tay `list_assets` (gen:types ghi đè). DTO/model/repository/service + test (service: rỗng→403 không gọi repo; platform→locationIds=null; location manager→đúng mảng).
- **Review security (biên phạm vi là trọng tâm): KHÔNG CRITICAL/HIGH/MEDIUM.** Xác nhận: không đọc được ngoài phạm vi, scope không nhận từ client, 403 đúng, grants đúng, không lộ giá trị/qr. Đã áp 1 fix LOW: thêm `@Max(100_000)` cho `page` ở `PaginationQueryDto` (chống tràn int4 offset → 500; áp cho MỌI danh sách). LOW để lại: `cost_center_id` còn trong SELECT của RPC 16 (mapper đã bỏ, không lộ — muốn gỡ hẳn cần migration 17 vì 16 đã chạy); `sanitizeSearchTerm` chưa lọc `\` (không phải lỗ hổng).
- **FE:** trang `/assets` thành danh sách thật (tìm debounce + lọc + bảng `useReactTable` + `DataTablePagination`); nút Thêm chỉ hiện với ASSET_MANAGER (`hasAnyRole`); lọc loại/địa điểm lấy từ create-options (tự ẩn với Quản lý điểm vì 403); lọc trạng thái/tình trạng là enum tĩnh. columns + api + queries + i18n vi/en (`assets.list.*`, `lifecycleFull`, `condition`) + test cột. Docs BE/FE + DESIGN-README.
- Kiểm chứng: BE tsc 0 · eslint 0 · **jest 149/149** · build. FE typecheck 0 · lint 0 error/11 warning cố hữu · **vitest 181/181** · build.
- Duy đã manual test: chưa. Migration cần chạy: KHÔNG còn (15, 16 đã chạy). `gen:types` Duy đã chạy.
- Làm tiếp: **UC-AST-08 (xem chi tiết tài sản)** — cùng biên scope, trả 404/403 nếu ngoài phạm vi; hoặc UC-AST-05 (đổi người chịu trách nhiệm, gắn với nợ terminate ở dưới) / 03/04 (sửa mô tả / tài chính). Mẫu scope: `ASSET_LIST_SCOPE` + `applyLocationScope`/mảng location.
- Bẫy/lưu ý: migrations 01–16 đã chạy KHÔNG sửa. Danh sách dùng controller riêng + authz ở service (không @RequireContext). Vẫn nợ: terminate_employee (migration 14) chưa xử lý người nghỉ còn chịu trách nhiệm tài sản (cần migration 17 + UC-AST-05).

## 2026-10-01 — Claude → Duy/Codex — M03 BẮT ĐẦU: UC-AST-01 XONG CODE + REVIEW; chờ chạy migration 15
- **Bối cảnh:** M01 xong (Duy đã chạy 12/13/14). Bắt đầu M03 (Hồ sơ tài sản). Làm **UC-AST-01 — Tạo hồ sơ tài sản** end-to-end: nền module `assets` cho cả M03.
- **BE:** migration **15_assets.sql**: bảng `assets` (asset_code từ sequence — BR-AST-01 không tái dùng; qr_token; partial unique serial-per-type trừ CANCELLED — BR-AST-03; lifecycle/physical_condition checks), `asset_command_receipts`, RPC `create_asset` (atomic asset+QR+audit, idempotent). Module `AssetsModule` (controller/service/repository/model/dto) đăng ký vào `app.module.ts` (M03 có UC duyệt nên được phép). Route `POST /v1/assets` + `GET /v1/assets/create-options`, guard `ASSET_MANAGER`/PLATFORM. BR-AST-09 (người chịu trách nhiệm phải có vai trò trên location, hoặc là ASSET_MANAGER) kiểm trong RPC. ErrorCode mới `ASSET_SERIAL_REQUIRED`, `RESPONSIBLE_NOT_ON_LOCATION`. `database.types.ts` + `supabase.define.ts` thêm tay `assets`/`asset_command_receipts`/`create_asset` (gen:types ghi đè sau khi chạy 15).
- **Review:** database-reviewer trên migration 15 → **không CRITICAL/HIGH**. Đã áp các fix: M1 khoá người chịu trách nhiệm `for share` (TOCTOU vs terminate); M2 validate supplier ACTIVE (tránh FK 500); M3 `unique_violation` phân biệt đúng index serial (không báo nhầm "trùng serial" khi đụng asset_code); L1 null-safe lifecycle_status; L3 revoke/grant sequence `asset_code_seq`. Để lại (ghi rõ): M4 serial đang case-sensitive (BR-AST-03 không nói hoa/thường — chờ Duy chốt); qr_token/PII trong receipt (service_role only).
- **FE:** trang `/assets` (điểm vào + EmptyState, nav chỉ ASSET_MANAGER) + `AssetFormDialog` (form: tên/loại/serial động/ghi chú/ngày mua/NCC/số HĐ/địa điểm/người chịu trách nhiệm/trạng thái), schema zod serial-bắt-buộc-động, api + queries + i18n vi/en + route + test schema. Lỗi EX.3 (RESPONSIBLE_NOT_ON_LOCATION) hiện cạnh trường; EX.1 serial; trùng serial → khối chung.
- Kiểm chứng: BE tsc 0 · eslint 0 · **jest 146/146** · build. FE typecheck 0 · lint 0 error/10 warning cố hữu (RHF/TanStack) · **vitest 179/179** · build.
- Duy đã manual test: chưa.
- **Migration cần Duy chạy: `sql-docs/migrations/15_assets.sql`** rồi `npm run gen:types`.
- **GHI NỢ CẦN MIGRATION MỚI (vì 14 đã chạy):** `terminate_employee` (migration 14) hardcode `'assets',0` — giờ đã có bảng assets, cho nghỉ việc một người đang là **người chịu trách nhiệm tài sản** chưa bị chặn/giao lại (BR-AST-09, Q-41 blocking-vs-warning). Cần migration 16 vá + UC-AST-05 (đổi người chịu trách nhiệm). Chưa làm (chờ chốt chính sách + UC-AST-05).
- Làm tiếp: UC-AST-05 (đổi người chịu trách nhiệm) hoặc UC-AST-07 (danh sách tài sản — dùng AccessScopeService + applyLocationScope('primary_location_id'), mẫu đã ghi trong access-scope.service) → 08 chi tiết → các UC M03 còn lại. Nền `assets` + biên scope đã sẵn.
- Bẫy/lưu ý: migrations 01–14 đã chạy KHÔNG sửa; 15 chưa chạy. `assets` KHÔNG append-only (được sửa ở UC sau); chỉ audit/lịch sử mới append-only. Mọi RPC mới revoke/grant. Không commit.

## 2026-10-01 — Claude → Duy/Codex — M01 XONG CODE (UC-08/12/13/14) + ĐÃ REVIEW & SỬA; chờ chạy migration 12/13/14
- **Bối cảnh:** Codex đã làm xong CODE của cả UC-IAM-08/12/13/14 (không chỉ 12 + dở 08 như entry cũ ngay dưới — entry đó viết sớm, chưa cập nhật). Cả hai repo XANH khi em nhận: BE tsc 0 · eslint 0 · **jest 138/138** · build; FE typecheck 0 · lint 0 error/9 warning cũ · **vitest 174/174** · build.
- **Em (Claude) đã làm:** chạy 3 review (DB cho migration 12/13/14; security cho admin-mutations 08/12/13; security cho self-service 14). Kết quả: UC-14 sạch; 08/12/13 có lỗi thật mà test không bắt. Đã SỬA trực tiếp vào 12/13/14 (CHƯA CHẠY nên sửa file là đúng luật; các file idempotent `create or replace`/`add column if not exists`):
  - **14 (terminate):** (H) thêm `revoked_by is null` vào UPDATE đóng vai trò — nếu không, một vai trò sắp-hiệu-lực ĐÃ thu hồi (effective_to tương lai) làm trigger close-only raise → không bao giờ nghỉ việc được. (H) thêm kiểm `p_new_manager_id` không phải hậu duệ của người nghỉ (recursive CTE) → tránh self-manager/vòng. null-safe version; `context_type='PLATFORM'` cho đếm admin; `current_date`→giờ VN; re-raise INVALID_SUPERIOR/HISTORY_IMMUTABLE thay vì nuốt thành AUDIT_WRITE_FAILED. (Service đã tự revoke session sau terminate — OK.)
  - **13 (profile/email):** (H) đảo thứ tự lock — lấy advisory `iam.organization_chart` TRƯỚC `for update` (khớp 14) để không deadlock khi đổi cấp trên song song lúc nghỉ việc. null-safe version; validation null-safe + pattern employee_code + độ dài; location phải ACTIVE & KHÔNG EXTERNAL khi đổi + `for share`; non-OFFICE có phòng ban → báo `DEPARTMENT_NOT_ALLOWED` (không nuốt). **change_email: (sec H1) chặn tự đổi email của chính mình & chặn đổi email tài khoản SYSTEM_ADMIN** (chống chiếm tài khoản) → ErrorCode mới `EMAIL_CHANGE_TARGET_FORBIDDEN`. `mark_employee_email_sync` chỉ ghi khi đang `PENDING`.
  - **12 (lock):** `revoke_employee_sessions` chỉ xóa phiên khi status đang SUSPENDED/DEACTIVATED (tránh xóa nhầm phiên khi UNLOCK xen vào).
  - UC-14 (cheap): DTO `@IsIn` thêm message `VALUE_OUT_OF_DOMAIN`; thêm dòng `me/locale` vào bảng guard trong auth.controller.
  - BE verify lại sau sửa: tsc 0 · eslint 0 · jest 138/138.
- **ĐỂ LẠI CHO DUY QUYẾT (chính sách/thiết kế, em KHÔNG tự làm):**
  1. PII trong bảng append-only: `audit_events.changes` + `*_command_receipts.payload` lưu email/phone/tên vĩnh viễn → xung đột quyền xoá dữ liệu cá nhân (nên mask/hash). Áp cả cho create_employee cũ.
  2. Break-glass admin (`app_metadata.role='admin'`): nếu có `user_profiles` mà không có dòng SYSTEM_ADMIN thì guard last-admin của 12/14 không bảo vệ → có thể bị khóa/nghỉ/đổi email. Cần quyết cách bảo vệ.
  3. Email↔Auth lệch khi sync lỗi (M2/M3): hiện commit DB trước, Auth sau, lỗi→FAILED + REQUEST_TIMEOUT; chưa có RPC bù/khôi phục & chưa rõ GoTrue có vô hiệu link mời cũ khi đổi email PENDING_ACTIVATION. Cần endpoint resync + mã lỗi `AUTH_EMAIL_SYNC_FAILED` riêng, và cân nhắc `email_confirm:false`/xác minh.
  4. `departments.manager_id`: terminate chưa gỡ người nghỉ khỏi vai trò trưởng phòng (chờ module phòng ban/tài sản).
  5. (LOW) `updatePreferredLocale` (auth.service) không bump `profile_version` → PATCH hồ sơ cũ của admin có thể ghi đè; cân nhắc bump hoặc bỏ locale khỏi form admin. `mark_employee_email_sync` nên khớp theo email để chống đua triệt để.
- Duy đã manual test: chưa.
- **Migration cần Duy chạy (THEO THỨ TỰ):** **12 → 13 → 14** (bản đã sửa), rồi `npm run gen:types`. (01–11 đã chạy.) Các file idempotent nên chạy lại an toàn kể cả lỡ chạy bản cũ.
- **Làm tiếp:** M01 coi như XONG CODE (chờ Duy chạy migration + manual test). Tiếp theo là **M03** (Duy cần gấp M03/M04). Khi bắt đầu M03: đọc use case ở `business/product-docs/product-usecase/`, theo đúng nhịp CLAUDE.md (đọc UC → plan BE + FE README + DESIGN-README trước khi code → TDD → review → verify), KHÔNG thêm module vào `app.module.ts` khi UC chưa duyệt.
- Bẫy/lưu ý: migrations 01–11 KHÔNG sửa; 12/13/14 vừa sửa, chưa chạy. Mọi RPC mới revoke/grant. Enum→i18n vi+en. Không commit. GateGuard hook bắt nêu facts trước khi tạo/sửa file đầu tiên.

## 2026-10-01 — Codex → Codex/Claude — UC-IAM-12 XONG; UC-IAM-08 ĐÃ PLAN + BẮT ĐẦU TDD
- Vừa xong: UC-IAM-12 full BE/FE/docs/review/verify; chi tiết ở entry ngay dưới. **Bổ sung review chéo:** migration 12 đã sửa để mỗi LOCK/UNLOCK tăng `profile_version` (UC-08 yêu cầu mọi admin mutation làm stale form bị conflict). Migration 12 chưa chạy nên sửa trực tiếp file 12 là đúng luật.
- UC-IAM-08 đã làm: đọc toàn UC; viết đủ BE `product-implementation/UC-IAM-08/README.md`, FE README và `DESIGN-README.md`; chốt kiến trúc profile route + update command + email command/sync state. TDD DTO đã đi RED rồi GREEN **4/4**.
  - File mới: `src/employees/dto/update-employee-profile.dto.ts`, `change-employee-email.dto.ts`, `employee-profile.spec.ts`.
  - DTO đã chuẩn hóa blank nullable fields, email lowercase, phone VN, employment type, UUID refs, ngày, `profileVersion`.
- Duy đã manual test: chưa.
- Migration cần Duy chạy: **12_lock_unlock_account.sql** (đã gồm tăng profile_version), rồi gen types. **Chưa có migration 13**; đừng chạy file UC-08 nào cho tới khi code tiếp hoàn tất.
- Đang dở: UC-IAM-08 chưa có migration 13/RPC, controller-service-repository/model, profile UI/edit dialog/change-email dialog. Docs mô tả contract dự kiến; tiếp tục TDD service/repository trước production.
- Làm tiếp: hoàn tất UC-IAM-08 theo docs → full verify/review → UC-IAM-13 → UC-IAM-14 → M03. Không nhảy qua UC-08.
- Bẫy: đổi hồ sơ thường phải validate active reference **chỉ khi field đổi**; no-op không version/audit; manager concurrency cần khóa + cycle check; đổi email DB/audit commit trước Auth, retry 3 và đánh dấu sync FAILED nếu hết retry. Không commit, không sửa migration 01–11.

## 2026-10-01 — Codex → Codex/Claude — UC-IAM-12 XONG CODE, chờ chạy migration 12
- Vừa xong: **UC-IAM-12 — Khóa/mở khóa tài khoản**, đủ BE plan + FE README + `DESIGN-README.md`, TDD, review và verify.
  - BE: `POST /v1/employees/:id/account-status`, SYSTEM_ADMIN/PLATFORM, throttle + Idempotency-Key. Migration 12 có RPC `change_employee_account_status`: `ACTIVE→SUSPENDED` / `SUSPENDED→ACTIVE`, tăng `profile_version`, reason đúng `ACCOUNT_LOCK`/`ACCOUNT_UNLOCK`, audit cùng transaction, receipt gắn payload, chặn tự khóa, chặn khóa quản trị hệ thống cuối cùng bằng advisory transaction lock để đóng race. Sau commit, RPC riêng xóa `auth.sessions`; nếu bước này lỗi vẫn giữ tài khoản SUSPENDED và trả `sessionRevocation=FAILED` vì guard đã chặn request kế tiếp.
  - FE: hành động cạnh badge trên `/employees/$id`, ẩn khi chính mình/trạng thái không hỗ trợ; dialog lý do + ghi chú bắt buộc với mục tự do, copy vi/en, a11y/touch target/responsive, toast riêng khi phiên chưa thu hồi hết. `GET /access` nay trả `accountStatusReasons`.
  - ErrorCode mới: `SELF_ACCOUNT_LOCK_FORBIDDEN`, `LAST_SYSTEM_ADMIN_REQUIRED`. `database.types.ts` đã thêm tay 2 RPC để full-flow không bị chặn trước khi chạy SQL.
- Kiểm chứng: BE eslint 0 · Jest **125/125** · build xanh. FE typecheck 0 · lint 0 error (9 warning cũ sau khi bỏ warning mới của dialog) · Vitest **170/170** · build xanh. Test đã đi RED rồi GREEN.
- Duy đã manual test: chưa.
- Migration cần Duy chạy: **`sql-docs/migrations/12_lock_unlock_account.sql`**, sau đó `npm run gen:types` (gen sẽ thay phần type thêm tay bằng schema thật).
- Đang dở / chưa xong: chưa smoke runtime vì migration 12 chưa chạy. Không commit.
- Làm tiếp: **UC-IAM-08 (cập nhật hồ sơ)** → 13 → 14, rồi mới M03. Đọc UC và viết đủ 3 docs trước code.
- Bẫy/lưu ý: 01–11 đã chạy, không sửa. Migration 12 có function đụng `auth.sessions`; sau khi chạy cần manual test khóa một user đang đăng nhập ở tab khác, tab đó phải bị chặn ở request kế tiếp và refresh không dùng lại được.

## 2026-10-01 — Claude → Codex/Claude — Smoke script + UC-IAM-11 XONG CODE
- Vừa xong 1: **`tools/smoke-employee-directory.mjs`** — smoke + seed cho các UC đã dev (IAM-05/15/07/09/10). HTTP qua admin login (`SMOKE_ADMIN_EMAIL/PASSWORD`, `API_BASE` mặc định :3006). Seed vài nhân viên mẫu (email cố định `smoke.dir.*`, idempotent); smoke IAM-15 (list + lọc status/employmentType/search + status ngoài miền 400), IAM-09 (org-chart 200), IAM-10 (access options loại SYSTEM_ADMIN + guard ACCOUNT_INACTIVE khi gán cho PENDING). Nhánh **cấp quyền thật** (happy-path migration 10) bật khi có `SUPABASE_URL/SUPABASE_SECRET_KEY`: tạo + kích hoạt 1 nhân viên ACTIVE mẫu (`smoke.dir.active@example.com` / `SmokeEH#2026aA`) rồi cấp LOCATION_MANAGER + verify. IAM-07 resend **gửi email thật** → chỉ chạy khi `SMOKE_ALLOW_INVITE_EMAILS=true`. `node --check` OK; Duy chạy để seed + kiểm (cần server :3006 chạy).
- Vừa xong 2: **UC-IAM-11 — Thu hồi vai trò theo location**, đủ plan BE + FE + `DESIGN-README.md`, TDD, review (DB + security), verify.
  - BE: `POST /v1/employees/:id/role-assignments/:assignmentId/revoke` (SYSTEM_ADMIN/PLATFORM, THROTTLE_WRITE, Idempotency-Key). RPC **migration 11** `revoke_role_assignment`: đóng hiệu lực một dòng (`effective_to`+`revoked_by`+`revoke_reason`) đúng một lần, cùng transaction với audit `iam.role.revoked`. Khoá `FOR UPDATE`; kiểm dòng thuộc đúng nhân viên (chống IDOR); chặn SYSTEM_ADMIN (ROLE_NOT_REVOCABLE 409); chặn đã-đóng/quá-hạn trước UPDATE (HISTORY_IMMUTABLE 409); dòng Sắp hiệu lực đóng tại `effective_from` (AC.1). Receipt dùng chung (nới `operation` thêm REVOKE + cột `assignment_id`). ErrorCode mới `ROLE_NOT_REVOCABLE`. `database.types.ts` thêm tay `revoke_role_assignment` (gen:types sẽ ghi đè sau khi chạy migration 11).
  - FE: thêm `revokeRoleAssignment` api, `revoke-role-dialog.tsx` (xác nhận + lý do bắt buộc), cột **Thao tác** + nút **Thu hồi** trên access page (ẩn với SYSTEM_ADMIN và dòng đã đóng — chỉ là tiện ích, server vẫn chặn). i18n `employees.access.revoke.*` + `columns.actions` (vi+en). `roleAssignmentStatus` đổi `<`→`<=` cho khớp DB.
  - Review: DB-reviewer + security-reviewer **không CRITICAL/HIGH/MEDIUM**. Đã áp 4 fix low: DTO `@MaxLength` thêm message token; dialog `key={assignmentId}` tránh stale Idempotency-Key; audit exception giữ `sqlerrm` ở detail; status `<=`.
- Kiểm chứng: BE `tsc` 0 · eslint 0 · Jest **119/119** · build. FE typecheck 0 · lint 0 error/9 warning TanStack cố hữu · Vitest **167/167** · Vite build xanh.
- Duy đã manual test: chưa (Duy bảo cứ làm tiếp, test sau).
- Migration: **09, 10, 11 Duy ĐÃ CHẠY** (11 = bản đã gồm fix `using detail = sqlerrm`). Nên chạy `npm run gen:types` để đồng bộ `database.types.ts` (hiện đã thêm tay `revoke_role_assignment`, khớp signature — không chạy cũng compile được).
- Làm tiếp (CHO CODEX — theo thứ tự này): **UC-IAM-12 (khoá/mở khoá tài khoản)** → **08 (cập nhật hồ sơ)** → **13 (nghỉ việc)** → **14 (hồ sơ cá nhân + đổi ngôn ngữ)**. Xong hết M01 rồi mới sang M03 (Duy cần gấp M03/M04).
  - **Mẫu copy tốt nhất cho UC-12/13**: chính UC-IAM-11 vừa xong (RPC đóng/đổi trạng thái + audit cùng transaction + idempotency receipt + guard SYSTEM_ADMIN/PLATFORM + ánh xạ lỗi ở `handleXxxRpcError`). UC-12 = đổi `user_profiles.status` ACTIVE↔SUSPENDED có lý do + audit; UC-13 = chuyển `DEACTIVATED` + đóng mọi vai trò đang mở (tái dùng ý tưởng close-only của revoke).
  - File hay đụng: BE `src/employees/{employees.controller,employees.service,employees.repository}.ts`, `src/common/i18n/error-code.const.ts`, `src/supabase/database.types.ts` (thêm tay function mới), migration mới **12_...sql** (01–11 KHÔNG sửa). FE `src/lib/api/employees.api.ts`, `src/features/employees/...`, i18n `src/lib/i18n/locales/{vi,en}.ts`.
  - Đọc UC ở `business/product-docs/product-usecase/M01-nguoi-dung-phan-quyen/UC-IAM-12_khoa-hoac-mo-khoa-tai-khoan.md` (và 08/13/14).
- Verify lệnh: BE `npx tsc --noEmit && npx eslint src test && npx jest`; FE (repo `eh_am_frontend`) `npx tsc -b --noEmit && npx eslint . && npx vitest run --browser.headless && npx vite build`.
- Bẫy/lưu ý: migrations **01–11 đã chạy, KHÔNG sửa** (sai thì viết migration mới). Mọi RPC mới PHẢI `revoke all ... from public, anon, authenticated; grant execute ... to service_role`. Enum→i18n bắt buộc vi+en cùng khoá. Không commit. Smoke script `tools/smoke-employee-directory.mjs` để lại dữ liệu mẫu (không dọn) — chủ ý để manual test; chạy cần server :3006 + env `SMOKE_ADMIN_EMAIL/PASSWORD` (+ `SUPABASE_*` cho nhánh cấp quyền, `SMOKE_ALLOW_INVITE_EMAILS=true` cho IAM-07). GateGuard hook (ECC) bắt nêu facts trước mỗi lần tạo/sửa file đầu tiên — Codex cứ nêu rồi retry.

## 2026-10-02 — Codex → Claude/Codex — UC-IAM-09 XONG CODE
- Vừa xong: **UC-IAM-09 — Xem sơ đồ tổ chức**, đủ plan BE + plan FE + `DESIGN-README.md`, TDD, review và verify.
  - BE: `GET /v1/org-chart`, guard `SYSTEM_ADMIN|EXECUTIVE` / `PLATFORM`; projection tối thiểu không email/số điện thoại; loại `DEACTIVATED`; giữ nhãn `PENDING_ACTIVATION`/`SUSPENDED`; phát hiện vòng cấp trên bằng DFS, tách mọi thành viên vòng vào danh sách cần sửa nhưng vẫn trả phần cây lành; liệt kê người ACTIVE thiếu cấp trên/đơn vị. Đây là luồng đọc nên không audit và không migration.
  - FE: route `/organization-chart`, menu đúng hai vai trò; canvas **`@xyflow/react` 12.11.2** theo pattern FDI Today (tidy-tree tất định, pan/zoom, Controls, smooth-step edges, node không kéo/nối); tìm tên không dấu/mã, 0 kết quả không làm mờ cả cây, giới hạn độ sâu, mở/gập nhánh, panel dữ liệu cần hoàn thiện, i18n vi/en và touch target/a11y. SYSTEM_ADMIN mở danh sách nhân viên đã lọc; EXECUTIVE mở chi tiết tại chỗ.
  - `@xyflow/react` được thêm vào `package.json`/lockfile. `npm install` báo audit hiện có 9 vấn đề (6 moderate, 3 high); chưa tự chạy `npm audit fix` vì có thể đổi dependency ngoài phạm vi.
- Kiểm chứng: BE `tsc` 0 · eslint 0 · Jest **108/108** · auth-contract e2e **44/44** · Nest build xanh. FE typecheck 0 · lint 0 error/8 warning TanStack/RHF cố hữu · Vitest **163/163** · Vite build xanh. Impeccable detector cho feature UC-09: `[]`.
- Duy đã manual test: chưa.
- Migration cần Duy chạy: không có migration mới cho UC-09. Migration **07** của UC-IAM-07 vẫn cần chạy + `npm run gen:types`.
- Đang dở / chưa xong: chưa chụp render thật do Chrome DevTools MCP đang bị profile-lock từ một browser process đã chạy sẵn; automated compile/test/build đều xanh.
- Làm tiếp: **UC-IAM-10**, sau đó 11 → 12 → 13 → 14; không sang M03 trước khi xong chuỗi này.
- Bẫy/lưu ý: migrations 01–06 đã chạy, không sửa. Không commit. UC-IAM-08 chưa có route hồ sơ chỉnh sửa nên UC-09 chủ động không tạo link chết/API ghi thay thế.
 
## 2026-10-02 — Codex → Claude/Codex — UC-IAM-07 XONG CODE, chờ chạy migration 07
- Vừa xong: **UC-IAM-07 — Gửi lại lời mời kích hoạt**, đủ plan BE + plan FE + `DESIGN-README.md`, TDD và review.
  - BE: `POST /v1/employees/:id/resend-invite` (SYSTEM_ADMIN/PLATFORM, `THROTTLE_EMAIL`, Idempotency-Key); RPC transaction thu hồi lời mời cũ, tạo lời mời mới, audit và receipt. Replay không gửi thêm email. Email lỗi giữ lời mời mới, đánh dấu `FAILED`, ghi audit lỗi và trả `EMAIL_SEND_FAILED`; trạng thái không còn phù hợp trả `ACCOUNT_STATE_CONFLICT` 409.
  - Bảo mật: email lấy từ hồ sơ; không log/audit token hoặc link; hai RPC mới revoke `public, anon, authenticated`, chỉ grant `service_role`. Route công khai cũ `/v1/auth/resend-confirmation` đã đóng.
  - FE: bật action trên `/employees` chỉ cho `PENDING_ACTIVATION` có lời mời email; dialog xác nhận nói rõ link cũ mất hiệu lực; loading/a11y, idempotency UUID, toast riêng cho success/conflict/email lỗi/kết quả chưa chắc chắn; vi/en đã humanize.
- Kiểm chứng: BE `tsc` 0 · eslint 0 · Jest **105/105** · auth-contract e2e **43/43** · Nest build xanh. FE typecheck 0 · lint 0 error/8 warning TanStack/RHF cố hữu · Vitest **158/158** · Vite build xanh. `git diff --check` sạch.
- Duy đã manual test: chưa.
- Migration cần Duy chạy: **`sql-docs/migrations/07_resend_activation_invite.sql`**, sau đó `npm run gen:types`. `src/supabase/database.types.ts` đã cập nhật tay để full-flow không bị chặn; gen sẽ ghi đè bằng type thật.
- Làm tiếp: theo chỉ đạo mới của Duy, hoàn tất các UC M01 còn lại trước M03/M04; bắt đầu **UC-IAM-09 — Xem sơ đồ tổ chức** (UC-IAM-15 đã xong). Vẫn xử lý tuần tự từng UC theo đọc UC → plan BE/FE + wireframe → TDD → review → verify.
- Bẫy/lưu ý: migrations 01–06 đã chạy, không sửa. Migration 07 chưa chạy nên runtime resend sẽ chưa hoạt động. Không commit. Supabase Auth hiện tại hỗ trợ mời lại user chưa xác nhận và thay confirmation token; tiếp tục dùng `admin.inviteUserByEmail`, không tự đưa token vào URL.

## 2026-10-02 (khuya) — Claude → Duy/Codex — UC-IAM-10 (gán vai trò) WIRE XONG BE+FE
Codex mới scaffold UC-IAM-10 (migration 08 + DTO + helper) nhưng chưa wire. Claude đã **hoàn thiện end-to-end** (Duy đã chạy SQL 07+08; cho phép làm tiếp không chờ manual test).
- **Migration mới `10_grant_role_assignments_fix.sql`** (sửa các finding review của 08, create or replace): overlap range `'[)'` (hết chặn nhầm bàn giao end=start); idempotency **gắn payload** (thêm cột role_code/context_type/context_ids/effective_from/effective_to vào `role_assignment_command_receipts`, cùng key khác payload → `IDEMPOTENCY_KEY_REUSED`); null-safe `p_role_code/p_context_type/p_context_ids`; `for share` trên locations; bỏ lock thừa; revoke public/anon/authenticated + grant service_role.
- **BE**: endpoint `GET /v1/employees/:id/access` (hồ sơ tối thiểu + lịch sử vai trò + options role/location) và `POST /v1/employees/:id/role-assignments` (SYSTEM_ADMIN/PLATFORM, THROTTLE_WRITE, Idempotency-Key). Service pre-check nhân viên đích ACTIVE (EX.2 → ACCOUNT_INACTIVE), `resolveGrantRoleInput` (chặn SYSTEM_ADMIN/non-assignable, ép context PLATFORM nil, staff 1 location, biên ngày GMT+7). Repo `findAccessProfile/findRoleAssignments(join location thủ công vì context_id không FK)/listActiveLocations/grantRolesViaRpc`. Mã lỗi mới `ROLE_ASSIGNMENT_EXISTS`(409, EX.3) + `LOCATION_STAFF_SCOPE_CONFLICT`(409, EX.5). Model `RoleAssignmentModel/EmployeeAccessModel` + `toRoleAssignmentModel` (status qua `roleAssignmentStatus`).
- **FE**: route `/employees/$id` (trang Quyền truy cập — cũng là đích điều hướng khi bấm tên ở danh sách, lấp gap UC-IAM-14 tạm thời) + dialog "Gán vai trò" (SelectDropdown role, Checkbox đa location khi role LOCATION, DateField ngày theo chuẩn #11, Textarea lý do, zod schema + test). i18n vi+en `employees.access.*`.
- Kiểm chứng: BE **tsc 0 · eslint exit 0 · jest 114/114 · build xanh**. FE **typecheck 0 · lint 0 error (9 warning TanStack) · vitest 167/167 · build xanh**.
- **Chờ Duy:** chạy `sql-docs/migrations/10_grant_role_assignments_fix.sql` (chữ ký hàm KHÔNG đổi → không bắt buộc gen:types; nhưng nên chạy để types bảng receipt khớp). Rồi manual test: mở danh sách → bấm tên → trang Quyền truy cập → Thêm vai trò (thử role platform + role location + staff nhiều location bị chặn + lý do bắt buộc). Và kiểm `rpc('grant_role_assignments')` bằng JWT authenticated phải 42501.
- **Security-reviewer đã soát — không CRITICAL/HIGH.** Guard/scope đúng, không tin role/context từ client, không lộ PII ở `/access`, grants đúng. Đã sửa theo finding: **MEDIUM** (idempotency chưa gắn `reason` → thêm cột `reason` vào receipt + so khớp trong migration 10); **LOW-3** (thêm `@IsIn` vai trò assignable vào DTO `roleCode`); **LOW-2** (sort `contextIds` trong `resolveGrantRoleInput` để replay không phụ thuộc thứ tự). Verify lại BE tsc 0 · eslint 0 · jest 114/114.
- **Quyết định chính sách cho Duy (chưa áp, reviewer nêu):** (a) MEDIUM-2 — không chặn tự-gán vai trò cho chính mình/step-up; super-admin vốn break-glass nên rủi ro thấp, nhưng nếu cần phân tách nhiệm vụ cho vai trò kế toán thì chặn `employeeId === actor` hoặc đánh dấu audit; (b) LOW-4 — cho phép backdating `effectiveFrom` quá khứ (đang audit lại); (c) LOW-5 — danh sách vai trò assignable đang lặp ở SQL (RPC) và `ROLE_CATALOG` TS, cần note/test khi thêm vai trò mới (RPC là phía chặt hơn nên drift fail-closed).
- **Bẫy/lưu ý:** dialog dùng `SelectDropdown` ĐƯỢC vì nằm trong `FormField` (có form context) — khác trang danh sách phải dùng Select primitive. UC-IAM-10 EX.5 (staff chỉ 1 location) chặn ở helper + RPC. Không commit. Không sửa migration đã chạy (01–08; 09/10 Duy sẽ chạy).

## 2026-10-02 (đêm) — Claude → Codex/Duy — Review UC-IAM-07/09/10 của Codex + migration 09 (sửa audit)
Claude đã REVIEW toàn bộ phần Codex vừa làm (UC-IAM-07 resend invite, UC-IAM-09 org chart, UC-IAM-10 grant role) + chạy 2 reviewer (database + security). **Không CRITICAL/HIGH.** Đã verify lại sau khi Duy chạy SQL 07+08 + gen:types:
- BE **tsc 0 · eslint exit 0 · jest 111/111 · nest build xanh** (đã sửa 3 prettier + 2 warning `no-unsafe-argument` trong `employee-role-assignment.spec.ts`).
- FE **typecheck 0 · lint 0 error (8 warning TanStack) · vitest 163/163 · build xanh**.

**Đã làm (an toàn, trong lúc Duy ngủ):** viết **migration `09_resend_invite_audit_fix.sql`** — `create or replace` lại `resend_employee_invite` sửa 2 lỗi MEDIUM vi phạm nguyên tắc audit:
1. 07 revoke cả EXPIRED/REVOKED cũ (`where status <> 'ACCEPTED'`) → mất lịch sử. 09 chỉ revoke `SENT`/`ACTIVATING`.
2. 07 ghi audit `before` cứng = 'REVOKED' + `replaced_invite_ids` = MỌI lời mời. 09 lấy đúng id + trạng thái trước qua `UPDATE … RETURNING` (CTE). Thêm null-safe expiry + `pg_temp` + `using detail=sqlerrm`.
Chữ ký hàm không đổi → backend không cần sửa. **Duy chạy `09_resend_invite_audit_fix.sql` sau 08** (rồi `gen:types` — không bắt buộc vì chữ ký giữ nguyên).

**CODEX LÀM TIẾP — UC-IAM-10 (gán vai trò) CHƯA WIRE:** migration 08 + `grant-role-assignment.dto.ts` + `employee-role-assignment.ts` (helper) + spec đã có, NHƯNG **chưa có endpoint/service** (không có route trong `employees.controller.ts`, không có method trong service). Phải wire:
- Endpoint `POST /v1/employees/:id/role-assignments` (SYSTEM_ADMIN/PLATFORM, THROTTLE_WRITE, Idempotency-Key) → service gọi `grant_role_assignments` RPC.
- **Service PHẢI tự enforce (reviewer yêu cầu):** chặn tự gán cho chính mình; vai trò PLATFORM cần quyền platform; (sau này) location manager chỉ gán trong location của họ. RPC không kiểm actor nên service là lớp chặn.
- **Sửa migration 08 khi wire (viết migration 10 mới, KHÔNG sửa 08 đã chạy):** (a) overlap dùng `'[)'` thay `'[]'` (hiện chặn nhầm ca bàn giao end=start); (b) idempotency gắn payload (cùng command_key + payload khác hiện trả kết quả cũ như thành công — phải raise `IDEMPOTENCY_KEY_REUSED`); (c) null-safe `p_role_code/p_context_type/p_context_ids`; (d) `for share` trên locations; (e) bỏ `perform … for update` thừa trong loop.

**Finding LOW còn lại (ghi để xử lý, chưa làm):**
- Dead code: `AuthService.resendConfirmationEmail` (auth.service.ts:242) + `AuditEvent.AUTH_CONFIRMATION_EMAIL_RESENT` không còn route gọi (đã đóng theo D-01) → Codex xoá cho sạch, kẻo vô tình expose lại.
- org-chart (UC-IAM-09): query không giới hạn → PostgREST cap ~1000 dòng có thể cắt cây âm thầm + `totals.people` sai. Nếu danh bạ lớn, cần phân trang/ngưỡng.
- 07 (đã ở trong 09 không sửa): lỗi employee không tồn tại trả FK 23503 thay vì ACCOUNT_STATE_CONFLICT (LOW, backend có thể map). Để nguyên.

**Nhịp rule:** UC-IAM-07/09/10 chờ Duy manual test. UC-IAM-10 chưa chạy được (chưa wire). Không commit. Không sửa migration đã chạy (01–08).

## 2026-10-02 — Claude → Codex — UC-IAM-15 XONG CODE + migration đã chạy, sẵn sàng manual test
- **Duy đã chạy migration `05_employee_directory.sql` + `06_rpc_execute_hardening.sql`** và `npm run gen:types`.
  - `database.types.ts` giờ là bản sinh thật: có `list_employees` (Args/Returns đúng) và cả hàm `unaccent` trong `public` → xác nhận extension truy cập được, search không dấu chạy được.
  - CLI sinh Args **không nullable** (`p_search: string`…) nên repo đã cast ở biên rpc: `… as Database['public']['Functions']['list_employees']['Args']` trong `src/employees/employees.repository.ts#listEmployees` (giống workaround `create_employee`). Postgres vẫn nhận NULL để bỏ lọc.
- Kiểm chứng lại sau gen:types: BE **tsc 0 · eslint exit 0 · jest 100/100 · nest build xanh**. FE không đổi (typecheck 0 · lint 0 error/8 warning · vitest 157/157 · build xanh).
- **Còn lại cho Duy:** manual test trang `/employees` (tìm không dấu, 5 bộ lọc, phân trang, lọc "Chờ kích hoạt" xem trạng thái lời mời). Nên kiểm lỗ hổng đã đóng: gọi `rpc('list_employees')` bằng JWT `authenticated` phải trả **42501 permission denied** (xác nhận migration 06 có tác dụng).
- **CODEX LÀM TIẾP (chỉ sau khi Duy xác nhận manual test UC-IAM-15 ổn — nhịp rule):** **UC-IAM-07 (Gửi lại lời mời kích hoạt)**:
  1. Đọc UC `product-usecase/M01-nguoi-dung-phan-quyen/UC-IAM-07_*.md` (lưu ý "Bao gồm UC-IAM-15" đã xong).
  2. Viết plan BE + FE (README) — FE không cần màn mới, chỉ bật nút trên `/employees` (và hồ sơ sau này); vẫn theo chuẩn UI.
  3. Migration mới (07): RPC tạo invite mới + đổi invite cũ của user sang trạng thái vô hiệu (REVOKED/REPLACED) + audit `iam.employee.invite_resent`, trong 1 transaction. **Nhớ `revoke … from public, anon, authenticated` + `grant … to service_role`** (xem migration 05/06).
  4. Service: gọi RPC rồi `admin.inviteUserByEmail` lại (redirect `${APP_URL}/activate-account`), bù trừ nếu gửi mail lỗi (`EMAIL_SEND_FAILED` 502). Endpoint `POST /v1/employees/:id/resend-invite` (SYSTEM_ADMIN/PLATFORM, THROTTLE_EMAIL). Mã lỗi mới: `ACCOUNT_STATE_CONFLICT`(409) khi user không ở PENDING_ACTIVATION.
  5. Đóng route công khai cũ `resend-confirmation` (D-01) nếu còn.
  6. FE: bật nút "Gửi lại lời mời" (hiện disabled) trong `src/features/employees/list/employees-columns.tsx` → gọi mutation + toast; chỉ hiện cho dòng `PENDING_ACTIVATION`.
- **Bẫy/lưu ý cho Codex:** trang danh sách dùng `Select` primitives (KHÔNG `SelectDropdown` — nó bọc `FormControl` cần form context). Dòng/tên nhân viên CHƯA điều hướng hồ sơ (UC-IAM-14 chưa có). Mọi RPC mới PHẢI revoke anon/authenticated. Không commit. Không sửa migration đã chạy (01–06).

## 2026-10-01 (khuya) — Claude → Duy/Codex — UC-IAM-15 (danh sách nhân viên) full BE+FE
- **Vừa xong UC-IAM-15** theo đúng quy trình (đọc UC → plan BE/FE + DESIGN-README wireframe → TDD → verify).
  - Plan: `business/product-docs/product-implementation/UC-IAM-15/README.md` (BE) + FE `README.md` + `DESIGN-README.md`.
  - BE: `GET /v1/employees` (SYSTEM_ADMIN/PLATFORM, THROTTLE_SEARCH). Migration **05_employee_directory.sql**: RPC `list_employees` (đọc, không ghi) — unaccent search tên/email/mã, lọc location/phòng ban/vai trò(cửa sổ hiệu lực)/trạng thái/loại hình, trạng thái lời mời mới nhất (SENT quá hạn→EXPIRED), `count(*) over()` phân trang. DTO/repo/service/mapper + test `employees.directory.spec.ts`.
  - FE: trang `/employees` (sidebar "Nhân viên"): ô tìm debounce 300ms + 5 filter (Select primitives, server-side), bảng + phân trang, badge trạng thái, nhánh Chờ kích hoạt hiện trạng thái lời mời + nút "Gửi lại lời mời" **disabled (chỗ đặt cho UC-IAM-07)**. i18n vi+en. Test `employees-columns.test.tsx`.
- Kiểm chứng: BE tsc 0 · jest **100/100** · eslint exit 0 · nest build xanh. FE typecheck 0 · lint 0 error (8 warning TanStack cố hữu) · vitest **157/157** · build xanh.
- **Bảo mật (self-review đã sửa):** migration 05 chỉ `grant execute … to service_role`, KHÔNG `authenticated` — tránh người đăng nhập thường gọi thẳng RPC qua Supabase REST lấy email/điện thoại mọi người.
- Duy đã manual test: chưa. **Migration cần Duy chạy (theo thứ tự): `05_employee_directory.sql`, rồi `06_rpc_execute_hardening.sql`**, rồi `npm run gen:types` + smoke RPC. Migration chưa chạy → `database.types.ts` đã thêm tay type `list_employees` (sẽ bị gen:types ghi đè).
- **Reviewer (database + security) đã chạy — đã sửa theo phát hiện:**
  - **HIGH (cả 2 reviewer):** `revoke from public` KHÔNG gỡ grant execute mà Supabase tự cấp cho anon/authenticated → RPC SECURITY DEFINER gọi thẳng được qua `/rest/v1/rpc/*`, bỏ qua guard Nest. Lỗ hổng này có ở MỌI RPC cũ (02l–04), không riêng 05. → migration 05 đổi thành `revoke … from public, anon, authenticated`; thêm **migration 06** gỡ execute anon/authenticated trên mọi function `public` + chặn default privileges (service_role giữ nguyên; backend không ảnh hưởng vì dùng service_role).
  - **Medium:** `unaccent` có thể ở schema `extensions` trên Supabase → đổi `search_path = public, extensions, pg_temp` (tránh lỗi runtime). Clamp `p_limit ≤ 100` ngay trong SQL. Thêm index `idx_activation_invites_user_created (user_id, created_at desc)` cho lateral.
  - Còn lại là minor/info: search full-scan (ổn ở quy mô danh bạ), `ACTIVATING` quá hạn hiển thị thô (hiếm, transient), đọc PII không ghi audit (đúng hậu điều kiện UC).
- Làm tiếp (SAU khi Duy xác nhận UC-IAM-15): **UC-IAM-07 (Gửi lại lời mời kích hoạt)** — bật nút trên trang này + RPC tạo invite mới/đổi invite cũ→REPLACED + audit + `inviteUserByEmail` lại; đóng route `resend-confirmation` công khai (D-01); mã lỗi `ACCOUNT_STATE_CONFLICT`(409), `EMAIL_SEND_FAILED`(502).
- Bẫy/lưu ý: trang danh sách dùng `Select` primitives (không `SelectDropdown` vì nó bọc `FormControl` cần form context). Dòng/tên nhân viên CHƯA điều hướng hồ sơ (UC-IAM-14 chưa có). Không commit.

## 2026-10-01 (tối) — Claude → Duy/Codex — copy mật khẩu tạm + chốt thứ tự UC kế
- Nút copy mật khẩu tạm (màn thành công `/employees/new`): đã có sẵn, làm rõ hơn (icon Copy/Check + mật khẩu full-width). typecheck/lint/build xanh.
- **Chốt thứ tự UC kế** (Duy gợi ý cần trang quản lý tài khoản + theo dõi đã activate chưa + resend): UC-IAM-07 (gửi lại lời mời) "Bao gồm UC-IAM-15" và chạy trên màn Hồ sơ/Danh sách nhân viên (chưa có) → làm **UC-IAM-15 (danh sách nhân viên + trạng thái kích hoạt: đã/chưa activate, trạng thái lời mời SENT/EXPIRED/…) TRƯỚC**, rồi **UC-IAM-07 (nút Gửi lại lời mời trên trang đó + RPC tạo invite mới/đổi invite cũ sang REPLACED + audit + `inviteUserByEmail` lại; đóng route `resend-confirmation` công khai cũ theo D-01)**.
- BE sẵn có: bảng `activation_invites` + trạng thái (migration 03/04). Chưa bắt đầu code UC-IAM-15/07 — nên /compact trước cho context gọn.

## 2026-10-01 (chiều) — Claude → Duy/Codex — polish UC-IAM-05 UI + date picker chung
- Theo feedback manual test của Duy ở `/employees/new`: thay native `<select>` → `SelectDropdown`; canh field `min-h-11 sm:min-h-9` (hết lệch + touch 44px); nút `size='lg'` + submit `min-w-32`/`aria-busy`; copy "Location"→"Địa điểm" toàn bộ vi (employees + repair-vendors + nhãn `LOCATION_CLOSE`); step 1 đưa ghi chú phòng ban xuống full-width (hết lệch hàng); lưới field `items-start` (lỗi 1 ô không đẩy ô cùng hàng); xoá lỗi `root` khi đổi bước.
- **Date picker chung mới:** `DateField` + `DateTimeField` (`@/components/date-picker`, Calendar+Popover design-system, chuỗi `YYYY-MM-DD` / `YYYY-MM-DDTHH:mm`) thay native date/datetime-local (startDate, effectiveFrom/To). Thêm `common.selectDate` (vi+en).
- **Chuẩn UI bắt buộc mới ghi ở `eh_am_frontend/CLAUDE.md`:** #11 date picker chung (CẤM native date input), #12 `items-start` + clear `root` theo bước.
- Kiểm chứng: typecheck 0 · lint 0 error (7 warning TanStack) · build OK · vitest 154/154. Đã chụp ảnh xác nhận date picker + layout.
- Duy đã chạy migration 04 + thêm 2 redirect URL (activate-account, reset-password) → UC-IAM-06 chạy runtime được.
- Làm tiếp: Duy manual test lại /employees/new + luồng kích hoạt/đặt lại mật khẩu; rồi **UC-IAM-07 (gửi lại lời mời)**. Không commit. Mọi màn sau dùng date picker PHẢI là DateField/DateTimeField.

## 2026-10-01 — Claude → Duy/Codex
- Vừa xong: tiếp nhận **UC-IAM-06 (kích hoạt tài khoản được mời)** từ Codex. Trên đĩa đã đủ: BE (`src/auth/activation.*` service/repo/dto + 2 route `@Public` throttled `activation/preview|complete` + migration `04_account_activation.sql` 4 RPC: preview/claim/release/complete_account_activation) và FE (route `(auth)/activate-account`, feature `activate-account/` form + link-parser + schema + test + screenshot). **Sửa lỗi Codex để lại:** BE eslint RED 2 lỗi `prefer-promise-reject-errors` trong `activation.service.spec.ts` → thêm helper `rejectWith(err: Error)`.
- Kiểm chứng (toàn bộ 2 repo): BE tsc 0 · eslint 0 · jest **90/90** (16 suite). FE typecheck 0 · lint 0 error (7 warning TanStack cố hữu) · build OK · vitest **154/154** (26 file).
- Duy đã manual test: chưa. UC-IAM-05 đã chạy được runtime (migration 03 đã chạy, smoke RPC xanh); UC-IAM-06 chờ chạy migration 04.
- Migration cần Duy chạy: chỉ còn **`04_account_activation.sql`** → `npm run gen:types`. (03 đã chạy rồi.) Sau đó: Supabase Dashboard bật redirect `http://localhost:5175/activate-account`; khớp Email OTP expiry với `SUPABASE_EMAIL_OTP_EXPIRY_SECONDS`; thử email mời thật (`admin.inviteUserByEmail`, callback `type=invite`).
- Đang dở / chưa xong: không có UC code dở. UC-IAM-05 + UC-IAM-06 chờ Duy manual test (gồm 3 bug location Codex đã sửa, chưa manual lại; wizard `/employees/new` mobile/desktop).
- Làm tiếp (SAU khi Duy xác nhận UC-IAM-05/06): **UC-IAM-07 (gửi lại lời mời kích hoạt)** — nối tiếp invite flow, dùng lại `activation_invites`. Mẫu: `src/auth/activation.*`, `src/employees/`.
- Bẫy/lưu ý: migration 04 CHƯA chạy nên còn sửa được nếu review thấy lỗi; `database.types.ts` đã sửa tay cho 04 (sẽ bị gen:types ghi đè). Luồng invite đúng = `admin.inviteUserByEmail` + callback `type=invite` (đừng đổi về createUser/signup). Không commit.

## 2026-10-01 — Codex → Claude/Codex
- Vừa xong: fix 3 bug locations/supplier input; UC-MDM-05 và UC-MDM-06 full BE/FE. Duy đã chạy 02k–02p; sinh lại types và smoke UC-MDM-06 xanh (idempotency, version, vendor+location cùng ngừng, audit 3+2). UC-IAM-05 đã viết lại plan BE/FE + DESIGN wireframe trước code, dựng migration 03, BE employees module và FE wizard `/employees/new`; đóng public register; registry đủ 9 role. BE 14 suite/74 test, tsc/eslint/nest build xanh. FE 21 file/145 test, typecheck/build xanh; lint 0 error, 7 warning cũ.
- Duy đã manual test: location có 3 bug đã báo; code fix xong nhưng chưa manual lại. UC-MDM-05/06/IAM-05 chưa manual.
- Migration cần Duy chạy: `sql-docs/migrations/03_employee_onboarding.sql`, sau đó `npm run gen:types`.
- Đang dở / chưa xong: UC-IAM-05 chưa DB smoke/runtime vì migration 03 chưa chạy. `database.types.ts` đã cập nhật tay để compile. Cần kiểm tra email invite thật trên Supabase và wizard ở mobile/desktop sau migration.
- Làm tiếp: chạy smoke UC-IAM-05 sau migration 03, xử lý manual feedback; rồi UC-IAM-06 theo đúng quy trình đọc UC → plan BE/FE + DESIGN → TDD. Mẫu code: `src/employees/` và FE `src/features/employees/new/`.
- Bẫy/lưu ý: không sửa 02n–02p vì Duy đã chạy. Migration 03 chưa chạy nên còn được sửa nếu review phát hiện lỗi. Không commit. Reviewer sub-agent cuối UC-MDM-06 hết workspace credit nên đã self-review + smoke thay thế. Email lỗi trả `EMAIL_SEND_FAILED` nhưng hồ sơ vẫn tồn tại; FE hiển thị cảnh báo thành công. Mật khẩu tạm chỉ hiện ở success panel một lần, không audit/log.

## 2026-09-30 — Claude → Codex
- Vừa xong: M02 UC-MDM-01/03/04/07/08 (BE code + FE), đều tsc/eslint/test xanh. Luồng NGỪNG (AC.2) cho cost center + lý do. Chi tiết trong [HANDOFF-CODEX.md](../HANDOFF-CODEX.md) mục 8.
- Duy đã manual test: 01/03/07/08 OK; 04 (cây loại tài sản) chờ xác nhận runtime.
- Migration cần Duy chạy/xác nhận: `02i_asset_types.sql` + `02j_asset_type_rpc.sql` + `npm run gen:types`, rồi chạy lại `tools/smoke-master-data.mjs` (lần trước phần cây loại tài sản trả 500 vì chưa chạy).
- Đang dở: không có UC nào code dở.
- Làm tiếp: **UC-MDM-05 (nhà cung cấp)** theo công thức mục 9 của HANDOFF-CODEX (copy mẫu `cost-centers`). Rồi UC-MDM-06, UC-IAM-05.
- Bẫy/lưu ý: đọc kỹ mục 7 (ràng buộc cứng): không sửa migration đã chạy, không hardcode creds, được sửa tay `database.types.ts` khi migration chưa chạy.
