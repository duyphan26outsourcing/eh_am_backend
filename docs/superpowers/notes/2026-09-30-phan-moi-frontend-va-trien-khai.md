# Phần mới: nhận diện thương hiệu, frontend design system, kế hoạch kỹ thuật và triển khai

Duy giao ngày 30/09/2026, sau khi bộ Master Blueprint và 83 use case của MVP1 hoàn tất. Đây là bản ghi để không quên quy trình và bộ skill bắt buộc. Đọc file này trước khi làm tiếp phần mới.

## Quy ước đường dẫn

- `BE` = `c:\Users\Admin\development\everyhalf\eh_am_backend`
- `FE` = `c:\Users\Admin\development\everyhalf\eh_am_frontend`
- Bộ UC nguồn: `BE\business\product-docs\product-usecase\` (83 UC, 10 module GĐ1).

## Yêu cầu 0: Nhận diện thương hiệu và cảm hứng layout

Phân tích `https://www.everyhalf.vn/` và một trang Larksuite (ví dụ `https://ssgwqee1lorp.sg.larksuite.com/drive/home/`) để:
- Từ everyhalf.vn: rút bộ nhận diện thương hiệu: logo, bộ màu (design token), design system, border, shadow, underline, text style, font chữ (typography), hover style, accessibility.
- Từ Larksuite: lấy cảm hứng layout, wireframe cho các tính năng của platform quản lý tài sản.
- Kết quả: file tài liệu nhận diện thương hiệu, làm ánh xạ hỗ trợ Yêu cầu 1.

Ghi tài liệu vào `FE\business\product-docs\product-design\` (ví dụ `00-brand-identity-everyhalf.md`).

Công cụ: `WebFetch` + MCP `chrome-devtools` của plugin ecc (navigate, take_screenshot, get_css_styles, take_snapshot) để lấy màu, font, computed style thật.

## Yêu cầu 1: Frontend codebase (design token, design system, common component)

Làm một lượt trọn vẹn. Xây trong repo `FE`: design token, design system, các common component (đủ cho mọi tính năng UC đã định nghĩa, có style UI CSS). Responsive cho cả mobile, thân thiện PWA (progressive web app).

Ghi tài liệu design token, design system, common component vào `FE\business\product-docs\product-design\`.

Bộ skill bắt buộc (Duy chỉ định):
- `taste-skill@taste-skill` (các skill: `taste-skill:taste-skill`, `brandkit`, `redesign-skill`, `image-to-code-skill`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `minimalist-skill`, `soft-skill`…)
- `ui-ux-pro-max@ui-ux-pro-max-skill` (`ui-ux-pro-max:design-system`, `design`, `ui-styling`, `brand`, `ui-ux-pro-max`)
- `core-skills@hyperframes` và `hyperframes@hyperframes` (motion, video, animation)
- `impeccable@impeccable` (`impeccable:impeccable`)
- `gsap-skills@gsap-skills` (`gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance`…)
- Claude design (skill `frontend-design` của example-skills; `artifact-design` khi làm mẫu)
- Được thêm skill khác nếu xịn hơn; tránh nhồi nhiều gây loạn.

Ràng buộc kỹ thuật FE (từ CLAUDE.md): Vite, React 19, TanStack Router/Query/Table, Radix/shadcn, Tailwind 4, i18next, axios, Vitest; cổng dev 5175.

## Yêu cầu 2: Kế hoạch kỹ thuật cho từng UC (backend và frontend), rồi triển khai

Với mỗi mã UC, tạo một thư mục trong cả hai repo:
- `BE\business\product-docs\product-implementation\<Mã UC>\`
- `FE\business\product-docs\product-implementation\<Mã UC>\`

Trong thư mục đó soạn technical implementation plan:
- Backend: đọc file UC tương ứng ở product-usecase, dùng skill ecc `/ecc:plan "describe the feature"` rồi `tdd-workflow` để soạn file technical implementation plan (có sơ đồ mermaid, mô tả technical, UML data flow, kỹ thuật backend liên quan).
- Frontend: tương tự, nhưng chỉ cần mô tả tính năng phía frontend.

Bộ skill bắt buộc: plugin `ecc@ecc` (skill `/ecc:plan`, `ecc:tdd-workflow`, và các skill dev của ecc) cộng các dev skill của Claude. Duy dặn: đủ xịn rồi, đừng nhồi nhiều skill, tránh over-engineering.

## Yêu cầu 3: Nhịp làm việc

- Yêu cầu 1: làm một lượt cho xong.
- Yêu cầu 2: step by step. Xong plan kỹ thuật của UC thứ nhất thì triển khai code UC đó theo dev flow của ecc: `implement -> review -> verify -> remember -> improve`. Code xong Duy manual test và xác nhận ổn thì mới sang UC thứ hai (viết plan rồi code), cứ thế.
- Không tự nhảy sang UC kế tiếp khi Duy chưa xác nhận UC hiện tại.

## Thứ tự đề xuất (chờ Duy chốt)

1. Yêu cầu 0 (nhận diện thương hiệu) trước, vì Yêu cầu 1 cần nó.
2. Yêu cầu 1 (frontend design system) một lượt.
3. Yêu cầu 2: chọn UC đầu tiên để làm mẫu (đề xuất UC-IAM-01 đăng nhập, vì mọi UC khác phụ thuộc đăng nhập và code auth đã có sẵn).

## Ghi chú môi trường

- Hook GateGuard (plugin ecc) yêu cầu nêu facts trước lệnh Bash đầu tiên và trước Edit/Write lần đầu mỗi file. Tắt hẳn bằng `ECC_GATEGUARD=off` hoặc `ECC_DISABLED_HOOKS=pre:bash:gateguard-fact-force,pre:edit-write:gateguard-fact-force`; hoặc thêm glob tài liệu vào `GATEGUARD_EXEMPT_GLOBS`; hoặc nêu facts mỗi lần (facts của file tài liệu thường rất ngắn).
- MCP chrome-devtools của ecc đã sẵn (các tool `mcp__plugin_ecc_chrome-devtools__*`), nạp schema bằng ToolSearch trước khi gọi.
- Cần thêm hai bảng "Skill bắt buộc" cho phần frontend-design và product-implementation vào `CLAUDE.md` của cả hai repo (yêu cầu 4).
 
## Tiến độ đêm 30/09/2026 (làm khi Duy đi ngủ)

**Yêu cầu 0 — Nhận diện thương hiệu: XONG.** Trích màu/font/style thật từ everyhalf.vn bằng chrome-devtools MCP (đơn sắc ấm "mực trên giấy": #231F20 mực, #F9F9F6 giấy; Bricolage Grotesque tiêu đề, SUSE Mono mã, Inter thân). File `eh_am_frontend/business/product-docs/product-design/00-nhan-dien-thuong-hieu-everyhalf.md` + ảnh `assets/everyhalf-hero-reference.png`.

**Yêu cầu 1 — Frontend design system: XONG (một lượt).**
- `src/styles/theme.css`: chỉnh token từ xám xanh sang trung tính ấm + thêm nhóm trạng thái (success/warning/info/destructive, mỗi nhóm có -foreground/-subtle) + font vars (bricolage, mono). Kiểm render thật ở `/sign-in`: nền kem, nút mực, chữ xám ấm (hết xanh).
- `index.html`: thêm Google Fonts Bricolage Grotesque + SUSE Mono; manifest + theme-color light/dark. `src/config/fonts.ts`: thêm 'bricolage'. `public/manifest.webmanifest` (PWA cài được).
- Component mới `src/components/`: `status-badge`, `code-text`, `page-header`, `empty-state`, `description-list` (+ `DescriptionItem`). Typecheck + lint + prettier sạch.
- Tài liệu: `product-design/10-design-tokens.md`, `20-design-system.md`, `30-common-components.md`.
- PWA offline đầy đủ (service worker, tự host font) và icon chính thức: ghi là bước sau, chờ Duy duyệt thêm dependency (xem 20-design-system.md §8).

**Yêu cầu 4 — Ghi skill vào CLAUDE.md: XONG.** Thêm bảng "Skill bắt buộc" cho frontend-design + product-implementation vào `eh_am_frontend/CLAUDE.md`; thêm bảng product-implementation (Yêu cầu 2) vào `eh_am_backend/CLAUDE.md`.

**Yêu cầu 2 — UC-IAM-01 (UC #1): plan XONG, code XONG phần an toàn, DỪNG ở cổng manual test.**
- Plan kỹ thuật BE: `eh_am_backend/business/product-docs/product-implementation/UC-IAM-01/README.md` (mermaid sequence + state, bảng đối chiếu code↔UC, gap analysis, test plan).
- Plan FE: `eh_am_frontend/.../product-implementation/UC-IAM-01/README.md` (mô tả tính năng, ánh xạ lỗi→UI).
- Code (TDD): vá UC-IAM-01.EX.3 — `login()` nay thu hồi phiên Supabase vừa tạo khi tài khoản không ACTIVE (giống refreshSession). Thêm `src/auth/auth.service.spec.ts` (bộ khung unit-test đầu tiên cho AuthService): RED→GREEN. Kiểm chứng: tsc 0, eslint 0, jest 18/18, e2e auth-contract 55/55. **Không commit** (chờ Duy).
- CHƯA làm (cần Duy / migration): AC.1 mật khẩu tạm + EX.8 (cần migration thêm PENDING_ACTIVATION + cờ mật khẩu tạm + mã PASSWORD_CHANGE_REQUIRED + guard 3-route). Xem plan BE §6. Không tự thêm module/migration khi vắng Duy.

**Cổng Yêu cầu 3:** dừng tại đây chờ Duy manual test UC-IAM-01 (đăng nhập ở http://localhost:5175). Duy xác nhận OK thì mới sang UC #2 (đề xuất: UC đầu tiên cần dựng mới — module danh mục nền M02 — vì cần Duy chạy migration và duyệt module).

**Môi trường:** dev server frontend đang chạy ở cổng 5175 (đã khởi động lại với design system mới; đã dừng instance cũ giữ cổng). GateGuard chặn Edit/Write lần đầu mỗi file và lệnh bash huỷ diệt — đã nêu facts từng lần; muốn tắt cho mượt thì đặt `ECC_GATEGUARD=off` hoặc `GATEGUARD_EXEMPT_GLOBS` ở tiến trình Claude Code.

## Tiến độ (tiếp) — login redesign + UC-IAM-02/03/04

**Login redesign (theo yêu cầu Duy):** dựng bố cục hai cột kiểu Larksuite + animation (GSAP + @gsap/react) ở `auth-layout.tsx` + `brand-panel.tsx` (entrance timeline, float loops, glow drift, mouse parallax, reduced-motion). Thay logo CSS "EH" bằng **logo EVHA thật** từ everyhalf.vn (`public/images/every-half-logo.png`) trong component `Logo` dùng chung (dark:invert) và panel (invert). i18n vi/en cho brand copy. Verified: tsc/eslint/build 0, console sạch.

**UC-IAM-02 (đăng xuất):** đã có sẵn, không độ lệch. Plan BE+FE + đối chiếu. Verify auth-contract.

**UC-IAM-03 (đặt lại mật khẩu):** VÁ EX.8 (TDD) — `reset-password` nay kiểm `user_profiles.status`, không ACTIVE thì `ACCOUNT_INACTIVE`, không đổi mật khẩu. Plan BE+FE.

**UC-IAM-04 (đổi mật khẩu):** VÁ QĐ-18 (TDD) — đảo thứ tự: xác minh mật khẩu hiện tại TRƯỚC khi kiểm mới-trùng-cũ. Plan BE+FE. Phần mật khẩu tạm (AC.1/AC.2) HOÃN — cần migration.

**Kiểm chứng tổng:** `auth.service.spec.ts` 7 test (login EX.3, changePassword QĐ-18, resetPassword EX.8) — RED→GREEN. Full unit 22/22, tsc 0, eslint 0, e2e auth-contract 55/55. Chưa commit.

**Admin bootstrap:** kết quả SELECT toàn FAIL chỉ do câu kiểm tra hardcode `admin@everyhalf.vn` trong khi `v_admin_email='admintaisan@everyhalf.vn'`. Khối DO đã chạy đúng (Duy login được). Sửa email ở `WITH target AS` rồi chạy lại là PASS.

**Cổng tiếp theo:** UC-IAM-05 (thêm nhân viên mới) là UC ĐẦU TIÊN cần dựng mới + cần **migration** (PENDING_ACTIVATION, cờ mật khẩu tạm, mã PASSWORD_CHANGE_REQUIRED, guard 3-route). Cần Duy chốt cách làm migration trước khi build module. UC-IAM-05..15 (trừ 07/14 auth) là các build mới thực sự cho quản lý tài khoản/nhân sự.

## Quyết định đã chốt (Duy uỷ quyền "tự quyết theo khuyến nghị") + kế hoạch M02

**Quyết định khoá:**
- Thứ tự: **làm nền M02 trước**, rồi UC-IAM-05 (M02 là phụ thuộc chặn — migration 01 không có locations/departments/reasons).
- Tên nhóm API cho quản lý nhân viên: **`/v1/employees`** (khớp blueprint §14.1). Cần đồng bộ §19 sau.
- **Đóng `POST /v1/auth/register`** công khai (D-01), thay bằng lệnh admin tạo (UC-IAM-05).
- Dùng **bộ 9 vai trò của blueprint** (thay 4 mã tạm trong `role.enum.ts`).

**Finding migration 01:** `user_profiles` ĐÃ có `phone`, `job_title`, `created_by`. Migration cho M01 account-mgmt (sau) chỉ cần thêm: `primary_location_id`, `department_id`, `manager_id`, `employment_type`, `start_date`, `profile_version`, `must_change_password`, và `PENDING_ACTIVATION` vào CHECK status; bảng `invitations`; hàm `create_employee`.

**Kế hoạch M02 (nền danh mục) — bước tiếp theo:**
1. Đọc blueprint §14.2 (đặc tả M02) để lấy đúng: loại location (cửa hàng/kho/xưởng rang/văn phòng), mô hình phòng ban, các nhóm mục lý do (gán vai trò, điều chuyển, thanh lý…), trường của từng danh mục.
2. Viết **migration 02** (`02_master_data.sql`): bảng `locations`, `departments`, `reasons` — theo đúng khuôn migration 01 (idempotent, CHECK chuẩn hoá, `tg_set_updated_at`, RLS deny-by-default, không FK on-delete lên cột lịch sử). Master data là dữ liệu SỬA ĐƯỢC (không append-only), "xoá" = đổi status INACTIVE.
3. Build module `master-data` theo TDD: UC-MDM-01 (locations CRUD) trước, rồi UC-MDM-08 (departments), UC-MDM-07 (reasons). Dừng ở cổng manual test từng UC.
4. Sau khi có M02 + role.enum thật → quay lại UC-IAM-05 (migration 03 + module employees).

Mã lỗi mới sẽ thêm khi build (không phải migration): PASSWORD_CHANGE_REQUIRED, EMAIL_ALREADY_REGISTERED, ROLE_NOT_ASSIGNABLE, INVALID_SUPERIOR, REASON_INVALID, EMAIL_SEND_FAILED.

## Tiến độ (tiếp) — nền M02: migration 02 + plan UC-MDM-01

- **migration 02** `sql-docs/migrations/02_master_data.sql`: 4 bảng danh mục nền (cost_centers, locations, departments, reason_codes) theo đúng khuôn migration 01 (idempotent, CHECK chuẩn hoá upper/trim, `tg_set_updated_at`, RLS deny-by-default, không FK on-delete lên cột lịch sử). Có cột `version` cho khoá lạc quan (UC-MDM-01.EX.4). Đã ghi vào `sql-docs/README.md`. **Duy chạy migration này + `npm run gen:types` trước khi build module.**
- **UC-MDM-01 plan** (BE + FE): endpoint `/v1/master-data/locations`, module `src/master-data/`, tạo/sửa nguyên tử location + audit qua hàm Postgres `rpc()` (BR-AUD-04), khoá lạc quan, idempotency, chuẩn hoá + duy nhất mã (BR-MDM-01), mapper theo người xem.
- **Kỹ năng dùng (Yêu cầu 4):** theo cấu trúc `/ecc:plan` cho plan; khi build code sẽ theo dev-flow ecc (implement→review→verify→remember→improve) + `superpowers:test-driven-development` + reviewer `ecc:typescript-reviewer`/`ecc:database-reviewer`.

**Bước build tiếp (sau khi Duy chạy migration 02):**
1. Hàm Postgres `create_location` / `update_location` (nguyên tử location + audit) → migration 02b, Duy chạy.
2. Module `master-data`: `SupabaseTable` registry + types 4 bảng; repository (BaseRepository) + service + controller + DTO + `toLocationModel`; mã lỗi mới `RECORD_VERSION_CONFLICT`, `AUDIT_WRITE_FAILED`; audit events `mdm.location.*`; i18n. TDD RED→GREEN.
3. Frontend: `master-data.api.ts` + màn Danh mục location (data-table + form) dùng common component đã dựng.
4. Dừng ở cổng manual test UC-MDM-01. Rồi UC-MDM-03 (cost center) / UC-MDM-08 (departments) / UC-MDM-07 (reasons), rồi quay lại UC-IAM-05.

## Tiến độ (tiếp) — UC-MDM-01 backend XONG (module master-data đầu tiên)

**Đã build + kiểm chứng (tsc 0, eslint 0, jest 26/26):** module `src/master-data/` cho UC-MDM-01:
- `dto/location.dto.ts` (Create/Update, chuẩn hoá mã, 5 loại), `location.model.ts` (`toLocationModel`), `location.repository.ts` (list/findById/activeCostCenterExists + createViaRpc/updateViaRpc), `locations.service.ts`, `locations.controller.ts` (`/v1/master-data/locations`, guard SYSTEM_ADMIN/ASSET_MANAGER PLATFORM), `master-data.module.ts` (đã wire vào app.module).
- Hạ tầng: `SupabaseTable` +4 bảng M02; error code `RECORD_VERSION_CONFLICT`; audit events `mdm.location.*`.
- Test: `locations.service.spec.ts` (chuẩn hoá mã, cost-center inactive → REFERENCE_NOT_FOUND, update not-found, version cho khoá lạc quan).

**MẪU CHUNG rút ra (dùng cho mọi module nghiệp vụ sau):**
- Thao tác ghi + audit nguyên tử = một hàm Postgres `rpc()` (migration riêng), `changes` dựng ở TS bằng `diffFields` rồi truyền jsonb. Repository map lỗi rpc (23505→DUPLICATE_RECORD, message 'VERSION_CONFLICT'→RECORD_VERSION_CONFLICT).
- Danh mục nền KHÔNG theo scope location → không dùng applyLocationScope.
- Khoá lạc quan: cột `version`, service đọc bản hiện tại rồi update `where version=?`.
- Controller: `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@RequireContext(... PLATFORM)` ở cấp class (guard đọc getClass()). Module tự import `SupabaseModule` + `SupabaseJwtModule`.

**CẦN DUY CHẠY để chạy runtime + manual test:**
1. `sql-docs/migrations/02c_master_data_version.sql` (thêm cột version — vì 02 bản đầu chưa có).
2. `npm run gen:types`.
(02b đã chạy.) Sau đó API `/v1/master-data/locations` (GET/POST/PATCH) chạy được.

**Còn lại của UC-MDM-01:** màn frontend Danh mục location (data-table + form, dùng common component đã dựng) + `master-data.api.ts`. Rồi tiếp UC-MDM-03 (cost center) / 08 (departments) / 07 (reasons) theo mẫu này, rồi quay lại UC-IAM-05.

## Cập nhật (tiếp): DESIGN-README + UC-MDM-03 core

**Sau khi Duy chạy 02c + xác nhận yêu cầu DESIGN-README:**

- `gen:types` đã chạy (02c live) → bỏ workaround cast `version` trong `location.model.ts`; sửa `makeRow` spec thêm `version`. Backend UC-MDM-01 xanh trên type thật.
- **DESIGN-README (nhiệm vụ bắt buộc mới của Yêu cầu 2):** mỗi thư mục UC **frontend** phải có `README.md` (kế hoạch tính năng) + `DESIGN-README.md` (mock UI/wireframe ASCII, vẽ trước khi code). Đã ghi vào **cả hai** `CLAUDE.md` (bảng Yêu cầu 2 thêm bước 2b + prose). Mẫu tham chiếu: `UC-MDM-01/DESIGN-README.md`. Skill: `frontend-design` + `ui-ux-pro-max` + `taste-skill`.
- Đã viết: `UC-MDM-01` frontend README (bản đầy đủ) + DESIGN-README; `UC-MDM-03` backend README + frontend README + DESIGN-README.

**UC-MDM-03 (cost center) — CORE backend đã dựng** (mẫu y hệt UC-MDM-01):
- `src/master-data/`: `dto/cost-center.dto.ts`, `cost-center.model.ts`, `cost-center.repository.ts`, `cost-centers.service.ts`, `cost-centers.controller.ts`, `cost-centers.service.spec.ts`; đăng ký trong `master-data.module.ts`.
- Endpoint `/v1/master-data/cost-centers` GET(`?status`)/POST/PATCH. GET có lọc `status=ACTIVE` cho ô chọn cost center của UC-MDM-01.
- Migration `02d_cost_center_rpc.sql` (create/update cost_center, audit nguyên tử). Audit `mdm.cost_center.created/updated`.
- **Thêm tay** 2 hàm rpc vào `database.types.ts` (chờ Duy chạy 02d + gen:types).
- **CHƯA dựng:** AC.2 ngừng cost center + EX.3 `CATALOG_ITEM_IN_USE` — chờ danh mục lý do (UC-MDM-07) + bảng tài sản (M03).
- Kiểm chứng: tsc 0 · eslint 0 (full `src test`) · jest **29/29** (5 suite).

**Việc Duy cần chạy để manual test UC-MDM-03:** `02d_cost_center_rpc.sql` + `npm run gen:types`.

**Thứ tự tiếp theo (M02):** frontend UC-MDM-01 + UC-MDM-03 (feature `master-data` chung, ô chọn cost center đã có endpoint) → UC-MDM-08 (phòng ban) → UC-MDM-07 (lý do) → quay lại AC.2 ngừng cost center → UC-IAM-05.

## Cập nhật (tiếp): UC-MDM-01 FRONTEND — FULL FLOW XONG

**Sau khi Duy chạy 02d + gen:types** (types thật của create/update_cost_center đã vào; bỏ phần thêm tay). Backend M02 (locations + cost-centers core) xanh: tsc/eslint/jest 29/29.

**Feature `master-data` (frontend) — màn Danh mục location đã dựng end-to-end:**
- `src/lib/api/master-data.api.ts` (listLocations/create/update + listCostCenters), `master-data.queries.ts` (queryOptions + key factory).
- `src/features/master-data/locations/`: `location-schema.ts` (Zod khớp backend) + `location-schema.test.ts` (8 test ✅), `locations-columns.tsx`, `location-form-dialog.tsx` (tạo/sửa, mã+loại readonly khi sửa, khoá lạc quan version, ánh xạ DUPLICATE_RECORD/RECORD_VERSION_CONFLICT/VALIDATION_FAILED theo `code`), `locations-page.tsx` (PageHeader + DataTable toolbar/pagination + trạng thái tải/rỗng/lỗi).
- Route `src/routes/_authenticated/master-data/locations.tsx` (loader prefetch). Sidebar thêm nhóm "Danh mục nền" → Location (roles SYSTEM_ADMIN/ASSET_MANAGER).
- i18n `masterData.locations.*` + `nav.*` + `common.edit/retry` (vi + en).
- `error-code.ts` thêm `RECORD_VERSION_CONFLICT`.
- Ô chọn cost center mặc định lấy từ `/v1/master-data/cost-centers?status=ACTIVE` (UC-MDM-03 core).

**Kiểm chứng FE:** `npx vite build` ✅ (route code-split `locations-*.js`) · `npm run typecheck` ✅ · `npm run lint` ✅ 0 error (1 warning cố hữu của TanStack Table + React Compiler, không phải lỗi) · `vitest` schema 8/8 ✅.

**Duy manual test được ngay** (backend đã chạy đủ 02/02b/02c/02d + gen:types): đăng nhập → sidebar "Danh mục nền" → Location → xem danh sách, Thêm (đủ 5 loại; cần tạo cost center trước nếu ô chọn trống), Sửa (mã/loại khoá), thử trùng mã, thử sửa 2 tab (xung đột version).
  - ⚠️ Chưa có màn tạo cost center trên UI → nếu DB chưa có cost center ACTIVE, ô chọn sẽ trống và form báo "tạo cost center trước". Có thể thêm nhanh bằng SQL hoặc chờ màn UC-MDM-03 FE (kế tiếp).

**Kế tiếp:** UC-MDM-03 FRONTEND (màn Danh mục cost center — thêm/sửa, dùng lại y hệt mẫu locations) để khép kín ô chọn cost center. Rồi UC-MDM-08 (phòng ban) / UC-MDM-07 (lý do) → cost-center AC.2 (ngừng) khi có UC-MDM-07 + M03 → UC-IAM-05.

## Cập nhật (tiếp): Polish UC-MDM-01 (manual-test feedback) + UC-MDM-03 FRONTEND

**6 điểm Duy nêu khi manual test locations — đã sửa + thành CHUẨN UI bắt buộc (ghi ở `eh_am_frontend/CLAUDE.md` §"Chuẩn UI bắt buộc"):**
1. Khung trang: bọc `<Header>` + `<Main>` (gutter chuẩn) — trước đó render trần nên dính sidebar.
2. Full tiếng Việt cho bản `vi`: *location→địa điểm*, *cost center→trung tâm chi phí* (vi + en đồng bộ khoá). Trường bắt buộc gắn `<RequiredMark/>` (sao đỏ) — component mới `@/components/required-mark`.
3. Dialog form rộng `sm:max-w-2xl`.
4. Trạng thái thiếu trung tâm chi phí → thêm nút "Tạo trung tâm chi phí" điều hướng sang màn cost center.
5. Địa chỉ: `AddressPicker` mới (`@/components/address-picker`) Tỉnh/Thành→Phường/Xã→số nhà; data 34 tỉnh `@/lib/data/vn-provinces.ts` — **TẠM, cần nạp dataset phường/xã chính thức (không bịa ~3300 phường)**.
6. Gợi ý mã kế tiếp: `suggestNextCodes` (`src/features/master-data/next-code.ts`) → chip bấm-để-điền ở ô mã.

**UC-MDM-03 FRONTEND (Danh mục trung tâm chi phí) — dựng xong**, dùng lại y hệt mẫu locations + đủ 6 chuẩn UI:
- API `createCostCenter`/`updateCostCenter` (thêm vào `master-data.api.ts`).
- `src/features/master-data/cost-centers/`: schema (+ test), columns, form-dialog (mã readonly khi sửa, gợi ý mã, version conflict), page (Header+Main). Route `/master-data/cost-centers` + nav "Trung tâm chi phí". i18n `masterData.costCenters.*` (vi+en).
- Ô chọn cost center của locations giờ khép kín: chưa có CC → nút sang màn tạo.

**Kiểm chứng FE:** `vite build` ✅ · `typecheck` ✅ · `lint` 0 error (2 warning cố hữu TanStack Table) ✅ · `vitest` 17/17 ✅ (location-schema 8 + next-code 5 + cost-center-schema 4).

**Duy manual test được:** sidebar "Danh mục nền" → Trung tâm chi phí (tạo vài CC) → sang Địa điểm tạo location (ô chọn CC giờ có dữ liệu; địa chỉ chọn tỉnh; gợi ý mã hiện khi mã theo dãy số).

**Kế tiếp:** UC-MDM-08 (phòng ban) → UC-MDM-07 (lý do) → cost-center AC.2 (ngừng, cần UC-MDM-07 + M03) → UC-IAM-05. Và: cần nạp dataset phường/xã 34 tỉnh chính thức cho AddressPicker.

## Cập nhật (tiếp): AddressPicker data thật + UC-MDM-08 (phòng ban) + polish UI + chuẩn mới

**Địa chỉ (AddressPicker):** đã tải dataset chính thức (qtv100291/Vietnam-administrative-division-json-server, 07/2025) → sinh `src/lib/data/vn-provinces.ts` (34 tỉnh + 3321 phường/xã). Ward giờ là dropdown cascading thật. Bố cục: Tỉnh/Thành + Phường/Xã hàng ngang (grid 2 cột, w-full bằng nhau) có label, ô số nhà/tên đường hàng dưới.

**UC-MDM-08 (phòng ban) — backend core + frontend XONG:**
- BE: migration `02e_department_rpc.sql` (đã chạy + gen:types), module `departments.*` (dto/model/repo/service/controller/spec) `/v1/master-data/departments` (chỉ SYSTEM_ADMIN), audit `mdm.department.*`. tsc/eslint/jest **32/32**.
- FE: feature `master-data/departments` (schema+test, columns, form-dialog, page) + route + nav "Phòng ban" + i18n. Chưa: gán trưởng phòng (cần UC-IAM-15), ngừng AC.2 (cần UC-MDM-07 + M03).

**Polish UI (manual-test feedback) + CHUẨN MỚI ghi ở `eh_am_frontend/CLAUDE.md`:**
- AddressPicker: label mỗi dropdown, flex-row, select w-full bằng nhau.
- Select disabled: nền `bg-muted` (rõ trạng thái disabled).
- Nút to hơn: Button `default` h-10/px-5, `lg` h-11/px-8; nút chính dùng `size='lg'`, Lưu `min-w-32`.
- Secondary/link action: component `LinkButton` (gạch chân sẵn, hover đổi màu chữ + gạch chân sang primary, không đổi weight). Dùng cho "Tạo trung tâm chi phí".
- **Chuẩn #8 (cursor + a11y):** Button có `cursor-pointer` / `disabled:cursor-not-allowed` / `aria-busy:cursor-wait`; nút chờ mutation truyền `aria-busy`. A11y tối thiểu bắt buộc mọi component tương tác.
- **Chuẩn #9:** LinkButton cho hành động phụ; nút chính size lg.

**Smoke + seed:** `tools/smoke-master-data.mjs` — đăng nhập admin, tạo mẫu cost center → phòng ban → location, rồi đối chiếu listing. Chạy: `$env:SMOKE_ADMIN_EMAIL=...; $env:SMOKE_ADMIN_PASSWORD=...; node tools/smoke-master-data.mjs`. Vừa smoke test vừa tạo data để manual test màn listing.

**Kiểm chứng FE:** vite build ✅ · typecheck ✅ · lint 0 error (3 warning cố hữu TanStack Table) ✅ · vitest **21/21** (location 8 + next-code 5 + cost-center 4 + department 4).

**Kế tiếp:** UC-MDM-07 (lý do) → cost-center/department "ngừng" (AC.2, cần lý do + M03) → UC-IAM-05. Việc treo: gán trưởng phòng (UC-IAM-15), nạp thêm nếu dataset phường/xã cần cập nhật.

## Cập nhật (tiếp): UC-MDM-07 (danh mục lý do) — full flow XONG + LỆCH SCHEMA cần Duy quyết

**UC-MDM-07 backend core + frontend XONG.**
- BE: migration `02f_reason_code_rpc.sql` (đã chạy + gen:types) — RPC create/update_reason_code + seed mục 'Khác' mỗi nhóm. Module `reason-code(s).*` `/v1/master-data/reason-codes` (chỉ SYSTEM_ADMIN). Mã lỗi mới `SYSTEM_REASON_PROTECTED` (409). Audit `mdm.reason_code.*`. jest **36/36**.
- FE: feature `master-data/reason-codes` (schema+test, columns, form-dialog có select nhóm, page có lọc nhóm + trạng thái) + route + nav "Lý do" + i18n (kèm nhãn 8 nhóm). Cột NHÓM; mục 'Khác' (isFreetext) khoá (icon + Sửa disabled). Kiểm chứng: vite build ✅ · typecheck ✅ · lint 0 error ✅ · vitest **26/26**.

**⚠️ LỆCH SCHEMA vs UC — cần Duy/Vận hành quyết (tính năng phát sinh khi dev, ghi ở UC-MDM-07/README):**
- Schema đã chạy (migration 02) chỉ có **8 nhóm** lý do, mã duy nhất **theo nhóm**, mã 1–40; UC-MDM-07 (QĐ-06) muốn **22 nhóm**, mã duy nhất toàn danh mục, mã 2–20.
- **KHÔNG có nhóm 'CATALOG_DEACTIVATE'** → luồng NGỪNG mục danh mục (cost center/phòng ban/lý do AC.2) **VẪN treo**.
- Dựng theo 8 nhóm thật. Muốn mở rộng: viết migration sửa CHECK `reason_group` + cập nhật `REASON_GROUPS` (BE `dto/reason-code.dto.ts` + FE `master-data.api.ts`) + i18n `masterData.reasonCodes.group.*`.

**Smoke/seed:** `tools/smoke-master-data.mjs` giờ seed thêm lý do mẫu (4 lý do ở 3 nhóm).

**Trạng thái M02:** location (01), cost center (03), phòng ban (08), lý do (07) — đều có backend core + frontend, đã kiểm chứng. Còn treo (cần quyết định/nhóm mới): các luồng NGỪNG (AC.2) + gán trưởng phòng (UC-IAM-15).

**Kế tiếp:** chờ Duy quyết nhóm lý do (để mở luồng NGỪNG) HOẶC sang UC-IAM-05 (thêm nhân viên) như kế hoạch M02-first ban đầu. UC-MDM còn: 02 (đóng location), 04 (cây loại tài sản), 05 (nhà cung cấp), 06 (đơn vị sửa chữa) — chưa làm.

## Cập nhật (tiếp): CHỐT 22 nhóm lý do + chuẩn enum→i18n

- Duy chốt **mở lên 22 nhóm** (QĐ-06). `migration 02g_reason_groups_22.sql` sửa CHECK `reason_group` (8 mã cũ + 14 mã mới) + seed 'Khác' 14 nhóm mới. Gồm `CATALOG_DEACTIVATE` + `LOCATION_CLOSE` → **mở khoá** luồng NGỪNG (AC.2) và đóng location (UC-MDM-02).
- Cập nhật `REASON_GROUPS` (22) ở BE `dto/reason-code.dto.ts` + FE `master-data.api.ts`; i18n 22 nhãn nhóm (vi + en). ⚠️ **Sửa lỗi đếm:** ban đầu lỡ thành 23 (thừa `PROFILE_ADJUST`), đã bỏ → đúng 22.
- **Chuẩn UI #10 (bắt buộc, ghi ở `eh_am_frontend/CLAUDE.md`):** enum/hằng DB (status, type, reason_group…) PHẢI map i18n, không show mã thô; mã do người dùng nhập thì hiển thị qua `CodeText`.
- Kiểm chứng: BE tsc ✅ + jest master-data 14/14 ✅; FE build ✅ + typecheck ✅ + lint 0 error ✅ + vitest 26/26 ✅.

**⚠️ Duy cần chạy:** `02g_reason_groups_22.sql` + `npm run gen:types` (để 22 nhóm chạy runtime; và để dựng tiếp luồng NGỪNG dùng nhóm CATALOG_DEACTIVATE).

**Kế tiếp (thứ tự hợp lý):**
1. Luồng NGỪNG (AC.2) cho cost center / phòng ban / lý do + đóng location (UC-MDM-02) — dùng nhóm CATALOG_DEACTIVATE/LOCATION_CLOSE. Cần deactivate RPC (khoá dòng + kiểm "còn dùng" + chọn lý do). Kiểm "còn dùng": location dùng cost center (được); nhân viên trong phòng ban (user_profiles.department_id — cần UC-IAM-05); tài sản (M03 chưa có → bỏ qua có ghi chú).
2. M02 còn thiếu bảng: UC-MDM-04 (cây loại tài sản), UC-MDM-05 (nhà cung cấp), UC-MDM-06 (đơn vị sửa chữa) — **cần migration tạo BẢNG MỚI** (chưa có trong 02), thiết kế theo blueprint data model.
3. Rồi UC-IAM-05 (thêm nhân viên) — cần migration 03 (user_profiles cột + invitations + create_employee RPC + 9-role blueprint).
