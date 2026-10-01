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
