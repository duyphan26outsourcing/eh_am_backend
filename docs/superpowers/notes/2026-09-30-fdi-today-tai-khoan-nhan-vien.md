# FDI Today: tài khoản nhân viên, hồ sơ nhân viên và sơ đồ tổ chức

| Mục | Nội dung |
| --- | --- |
| Ngày khảo sát | 30/09/2026 |
| Mục đích | Đầu vào để thiết kế lại module M01 "Người dùng và phân quyền" của EH-AM |
| Phạm vi | Tạo tài khoản nhân viên trong một tenant, hồ sơ nhân viên, sơ đồ tổ chức, gán quyền trong tenant. 16 nhóm người dùng chỉ được nhắc ở chỗ chúng chạm vào luồng tạo tài khoản |
| Cách làm | Chỉ đọc. Khi code và tài liệu lệch nhau, báo cáo lấy code làm chuẩn; chỗ lệch ghi ở cuối từng mục và tổng hợp ở 7.3 |
| Quy ước đường dẫn | `BE` = `C:\Users\Admin\development\fdi_today_backend`, `FE` = `C:\Users\Admin\development\fdi_today_frontend`. Số dòng theo bản đọc ngày 30/09/2026 |

Tóm tắt:

- Tài khoản nhân viên do quản trị viên trong tenant tạo bằng wizard 4 bước; cả 4 bước gửi chung một request `POST /iam/users`. Quản trị viên tự đặt mật khẩu. Không có mời qua email, không có bước kích hoạt.
- Hồ sơ nhân viên nằm ngay trên bảng `users` (1-1 với `auth.users`), gồm 8 cột nhân sự. Phòng ban, chức danh, địa điểm là chữ tự do.
- Sơ đồ tổ chức chỉ dựng từ `users.manager_id`, gốc của mỗi nhánh là pháp nhân. Không có bảng phòng ban, chức danh hay cấp bậc. Sơ đồ chỉ để xem.
- Quyền là dòng `context_role_assignments` (chủ thể × phạm vi × vai trò × khoảng hiệu lực), cấp ở trang Phân quyền, thu hồi bằng xoá cứng dòng.
- Khoá tài khoản bằng cách đổi `users.status`. Trạng thái mới có hiệu lực khi đăng nhập, khi làm mới phiên và trên route có `@RequireContext`. Nó không thu hồi vai trò và không cắt phiên đang mở.

## 1. Mô hình tenant, tổ chức, nhân viên (thực thể, quan hệ, bảng và cột chính)

### 1.1. Sơ đồ quan hệ

```text
tenants (không gian làm việc, ranh giới cô lập dữ liệu)
  |-- 1:N --> organizations (pháp nhân, có mã số thuế)
  |              |-- 1:N --> organization_classifications --N:1--> user_group_definitions (16 nhóm)
  |-- 1:N --> users (hồ sơ nghiệp vụ, id = auth.users.id)
                 users.organization_id  --N:1--> organizations   (nullable)
                 users.manager_id       --N:1--> users           (tự tham chiếu, cạnh của sơ đồ)

context_role_assignments:
  (subject_type USER|ORGANIZATION, subject_id)
  x (context_type TENANT|PROJECT|DATA_ROOM|TRANSACTION, context_id)
  x role_code x [effective_from, effective_to]
```

Nguồn: `BE/business/docs/tenant/tenant-vs-organization.md:131-152`, `BE/sql-docs/setup-lan-dau/03_organizations_va_users.sql:18-21`.

### 1.2. Bảng và cột chính

| Thực thể | Bảng | Cột chính | Ghi chú | Nguồn |
| --- | --- | --- | --- | --- |
| Không gian làm việc | `tenants` | `id`, `slug` UNIQUE, `name`, `status` (TEXT tự do, mặc định `ACTIVE`), `tier`, `metadata` JSONB, `version` | `metadata.accountKind` giữ vai trò tự khai lúc đăng ký, chỉ dùng chọn cổng giao diện. Enum code: `ACTIVE`, `SUSPENDED`, `ARCHIVED` | `BE/sql-docs/setup-lan-dau/02_tenants_va_user_groups.sql:25-35`; `BE/src/utils/enums/tenant.enum.ts:1-5`; `BE/src/tenant/tenant.service.ts:111-118` |
| Pháp nhân | `organizations` | `id`, `tenant_id` NOT NULL, `tax_code`, `name_vi` NOT NULL, `name_en`, `status` (mặc định `ACTIVE`), `metadata`; về sau thêm các cột `platform_verification_*` | `tax_code` không có UNIQUE ở DB; service chặn trùng trong tenant | `BE/sql-docs/setup-lan-dau/03_organizations_va_users.sql:29-39`; `BE/src/supabase/database.types.ts:21849-21871`; `BE/src/iam/iam.service.ts:140-158` |
| Phân loại pháp nhân | `organization_classifications` | `organization_id`, `user_group_id`, `organization_subtype_code`, `verification_status` (`UNVERIFIED`, `VERIFIED`, `REJECTED`), `effective_from/to`, `tenant_attestation_*` | UNIQUE (`organization_id`, `user_group_id`). Nhóm của nhân viên suy ra qua pháp nhân | `BE/sql-docs/setup-lan-dau/03_organizations_va_users.sql:47-59`; `BE/src/supabase/database.types.ts:21383-21402` |
| Tài khoản đăng nhập | `auth.users` (Supabase) | email, mật khẩu băm, `app_metadata.tenant_id` (ký vào JWT), `app_metadata.role = 'admin'` cho Super Admin | Hệ thống không tự quản lý bảng này | `BE/business/docs/architecture/01-bao-mat-va-guard.md:201-217`; `BE/src/iam/iam.service.ts:537-544` |
| Người dùng, nhân sự | `users` | định danh, `status`, `attributes` (ABAC), `organization_id`, 8 cột nhân sự, `manager_id`, `version` | Chi tiết ở mục 3 | `BE/sql-docs/setup-lan-dau/03_organizations_va_users.sql:66-128` |
| Phân quyền theo ngữ cảnh | `context_role_assignments` | `subject_type`, `subject_id`, `context_type`, `context_id`, `role_code` (TEXT), `effective_from` NOT NULL mặc định `now()`, `effective_to`, `permissions_profile_id` (cột kế thừa, không dùng) | CHECK loại chủ thể, loại ngữ cảnh, `effective_to > effective_from`; UNIQUE trên bộ 5 cột; bật RLS, thu hồi quyền của `anon` và `authenticated` | `BE/sql-docs/setup-lan-dau/04_iam_va_audit.sql:25-81` |
| Nhật ký IAM | `iam_audit_logs` | `tenant_id`, `actor_user_id` (FK `users` ON DELETE CASCADE), `action_type`, `target_type`, `target_id`, `payload` | Ghi bởi `IamService.auditLog()` | `BE/sql-docs/setup-lan-dau/04_iam_va_audit.sql:86-95`; `BE/src/iam/iam.service.ts:57-73` |
| Nhật ký nghiệp vụ | `audit_logs` | `user_id` (ON DELETE SET NULL), `action`, `entity_name`, `entity_id`, `payload_before`, `payload_after`, `idempotency_key` UNIQUE | Ghi bởi `IdentityService.logAction()`, dùng cho sửa hồ sơ nhân sự | `BE/sql-docs/setup-lan-dau/04_iam_va_audit.sql:102-115`; `BE/src/identity/identity.service.ts:57-89` |

### 1.3. Quy tắc gắn kết

- Một tenant chứa nhiều pháp nhân. Một user thuộc đúng một tenant (`users.tenant_id` NOT NULL) và tối đa một pháp nhân tại một thời điểm (`users.organization_id` nullable). Nguồn: `BE/sql-docs/setup-lan-dau/03_organizations_va_users.sql:68,80`; `BE/business/docs/user_group/usergroup-organization-relationship.md:56`.
- `users.email` là UNIQUE trên toàn nền tảng, không theo tenant (`03_organizations_va_users.sql:69`). Tạo nhân viên với email đã thuộc tenant khác trả 409 (`BE/src/iam/iam.service.ts:569-575`).
- Không có bảng phòng ban, đơn vị, chức danh, cấp bậc hay tuyến báo cáo. Tìm `departments|org_units|positions|organization_units|job_positions|reporting_lines` trong BE (trừ `node_modules`) không có kết quả. `department`, `job_title`, `work_location` là cột TEXT trên `users` (`03_organizations_va_users.sql:89-95`). Thực thể "đơn vị" duy nhất có bảng riêng là pháp nhân.
- `users.organization_id` là quan hệ "thuộc về", không phải phạm vi quyền. Tài liệu cấm suy phạm vi của `ORG_ADMIN` từ cột này (`BE/business/docs/tenant/tenant-vs-organization.md:381-396`; `BE/business/docs/architecture/02-iam-va-phan-quyen.md:204-215`).
- Loại ngữ cảnh `DEPARTMENT` chỉ xuất hiện như một ví dụ trong `BE/business/docs/user_group/context_base.md:17`; CHECK của `context_role_assignments` không có giá trị này (`04_iam_va_audit.sql:52-53`).

### 1.4. Ba trục độc lập

| Trục | Lưu ở | Quyết định gì | Nguồn |
| --- | --- | --- | --- |
| Chức danh, phòng ban | `users.job_title`, `users.department` | Chỉ hiển thị | `BE/business/docs/tenant/tenant-vs-organization.md:404-411` |
| Quan hệ báo cáo | `users.manager_id` | Các đường nối của sơ đồ | `BE/business/docs/use-guide/hdsd/07_hdsd_sodotochuc.md:244-245` |
| Vai trò quyền hạn | `context_role_assignments` | Được làm gì, ở phạm vi nào | `BE/business/docs/use-guide/hdsd/08_hdsd_phanquyen.md:31-47` |
| Nhóm người dùng của pháp nhân (riêng FDI) | `organization_classifications` đã `VERIFIED` | Cổng giao diện, dashboard; một số chốt nghiệp vụ | `BE/business/docs/user_group/usergroup-organization-relationship.md:256` |

## 2. Các bước tạo tài khoản nhân viên trong một tenant

Nguyên tắc sản phẩm: nhân viên không tự đăng ký. Tự đăng ký tạo ra một tenant riêng, nên tài khoản nhân viên phải do quản trị viên tạo từ bên trong tenant (`BE/business/docs/use-guide/hdsd/05_hdsd_taotaikhoannhanvien.md:16-27`).

| Bước | Ai làm | Màn hình hoặc API | Thông tin nhập | Bắt buộc | Kiểm tra | Kết quả |
| --- | --- | --- | --- | --- | --- | --- |
| 0a. Tạo tenant và quản trị viên đầu tiên (tự đăng ký) | Bất kỳ ai, chưa đăng nhập | Trang Đăng ký; `POST /tenants/register` | Loại tổ chức (3 cổng), tên đơn vị, slug, họ tên, email, mật khẩu, nhập lại, ô đồng ý | Tên đơn vị, slug, họ tên, email, mật khẩu | Slug 3 đến 63 ký tự, duy nhất; email chưa có trong `users`; chính sách mật khẩu; ô đồng ý chỉ kiểm ở FE | Tenant, tài khoản Auth đã xác nhận, dòng `users` ACTIVE, vai trò `TENANT_ADMIN @ TENANT`; lỗi giữa chừng thì xoá bù |
| 0b. Tạo tenant và quản trị viên (Super Admin) | Super Admin | Chỉ có API: `POST /tenants`, rồi API của bước 1 và 5 kèm header `x-tenant-id`, rồi `POST /tenants/:id/admins` | Tên, slug, tier; sau đó `userId` | Tên, slug; `userId` | `AdminGuard`; user phải thuộc tenant | Tenant chưa có tài khoản nào; `TENANT_ADMIN` cho một user có sẵn. Không có màn hình |
| 1. Khai pháp nhân | TENANT_ADMIN hoặc ORG_ADMIN | Quản lý tổ chức: cửa chặn "Chưa có pháp nhân" hoặc Thông tin tổ chức, nút Tạo pháp nhân; `POST /iam/organizations`, `POST /iam/organizations/:orgId/classifications` | Tên tiếng Việt, tên tiếng Anh, mã số thuế, nhóm người dùng, loại tổ chức | Tên tiếng Việt | Tên từ 2 ký tự (FE); mã số thuế không trùng trong tenant | Pháp nhân; người tạo được gắn vào pháp nhân nếu chưa thuộc pháp nhân nào; phân loại `UNVERIFIED` nếu có chọn nhóm |
| 2. Wizard bước 1/4 "Pháp nhân & nhóm" | TENANT_ADMIN hoặc ORG_ADMIN | Quản lý tổ chức, Quản lý nhân viên (`/organization/members`), nút Thêm nhân viên | Pháp nhân, nhóm người dùng, loại tổ chức con | Pháp nhân | Chỉ kiểm ô của bước hiện tại khi bấm "Lưu và tiếp tục" | Chưa gọi API |
| 3. Wizard bước 2/4 "Thông tin cá nhân" | như trên | như trên | Họ và tên, email công việc, số điện thoại | Họ tên, email | Họ tên từ 2 ký tự; email hợp lệ | Chưa gọi API |
| 4. Wizard bước 3/4 "Chi tiết công việc" | như trên | như trên | Mã nhân viên, vị trí, phòng ban, loại hình làm việc, ngày vào làm, cấp trên trực tiếp, địa điểm làm việc | Không ô nào | FE chỉ kiểm kiểu dữ liệu; BE kiểm ở bước 5 | Chưa gọi API |
| 5. Wizard bước 4/4 "Tài khoản đăng nhập", bấm Tạo tài khoản | như trên | `POST /iam/users`, một request cho cả 4 bước | Mật khẩu, nhập lại mật khẩu | Cả hai | FE: chính sách mật khẩu, khớp nhập lại. BE: xem 2.6 | Tài khoản Auth đã xác nhận, dòng `users` ACTIVE có hồ sơ và cấp trên; phân loại pháp nhân `VERIFIED` nếu có chọn nhóm; một dòng `iam_audit_logs` |
| 6. Bàn giao và đăng nhập lần đầu | Quản trị viên báo mật khẩu ngoài hệ thống; nhân viên đăng nhập | `/login`, `POST /auth/login`; đổi mật khẩu ở `/profile` | Email, mật khẩu | Cả hai | `users.status` phải là ACTIVE; `app_metadata.tenant_id` là UUID hợp lệ | Phiên đăng nhập. UI chỉ nhắc nên đổi mật khẩu, không bắt buộc |
| 7. Cấp vai trò | TENANT_ADMIN hoặc ROLE_PERMISSION_ADMIN | Quản lý tổ chức, Phân quyền (`/organization/permissions`); `POST /iam/context-roles/assign` | Loại phạm vi, dự án, cấp cho (nhân sự hoặc pháp nhân), đối tượng, vai trò, hiệu lực từ, hiệu lực đến | Loại phạm vi, đối tượng, vai trò (và dự án nếu phạm vi là dự án) | Xem 6.4 | Một dòng `context_role_assignments`, một dòng `iam_audit_logs` |

Gán vào đơn vị tổ chức nằm trong bước 2 (pháp nhân) và bước 4 (phòng ban dạng chữ, cấp trên). Sửa sau bằng `PATCH /workspace/members/:id` (mục 3).

### 2.1. Bước 0a: tự đăng ký tenant

- DTO công khai: `tenantName` (bắt buộc, tối đa 255), `tenantSlug` (3 đến 63 ký tự, `SLUG_PATTERN` cho phép chữ có dấu, số, gạch nối), `fullName` (tối đa 255), `email`, `password` (chính sách chung), `accountKind` tuỳ chọn `GOVERNMENT`, `INVESTOR`, `SERVICE`. Nguồn: `BE/src/tenant/dto/register-tenant.dto.ts:23-84`; `BE/src/utils/utils.ts:32`.
- Thứ tự xử lý: kiểm trùng slug và email (409), tạo tenant (tier `STANDARD`, `metadata.accountKind`), tạo tài khoản Auth (`email_confirm: true`, `app_metadata.tenant_id`), đồng bộ dòng `users`, cấp `TENANT_ADMIN` với cờ nội bộ `allowTenantOwnerRole`. Lỗi giữa chừng thì xoá tài khoản Auth, dòng `users` và tenant. Ghi `audit_logs` hành động `REGISTER_TENANT`. Nguồn: `BE/src/tenant/tenant.service.ts:78-206`.
- FE: schema ở `FE/src/features/auth/RegisterPage.tsx:34-68`; ô đồng ý `acceptTerms` là `z.literal(true)` nhưng không được gửi lên API (`RegisterPage.tsx:104-123`), nên không có bản ghi đồng ý nào được lưu.
- Tài liệu vận hành: `BE/business/docs/use-guide/hdsd/01_hdsd_dangkydangnhap.md:228-293`.

### 2.2. Bước 0b: Super Admin cấp tenant

- `POST /tenants` chỉ tạo tenant (tên, slug, tier, metadata), không tạo tài khoản (`BE/src/tenant/tenant.service.ts:41-72`; `BE/src/tenant/tenant.controller.ts:41-45`).
- `POST /tenants/:id/admins` nhận `userId`, đòi user đó đã thuộc tenant, rồi cấp `TENANT_ADMIN` qua `assignContextRole(..., { allowTenantOwnerRole: true })` (`BE/src/tenant/tenant.service.ts:328-363`; `BE/src/tenant/dto/assign-tenant-admin.dto.ts:3-7`).
- Super Admin thao tác thay tenant bằng header `x-tenant-id` (`BE/src/auth/guards/jwt-auth.guard.ts:114-131`), được `PermissionsGuard` cho qua (`BE/src/auth/guards/permission.guard.ts:59-62`), và được miễn điều kiện "người tạo phải thuộc một pháp nhân" (`BE/src/iam/iam.service.ts:509`).
- FE không có màn hình cho `/tenants/:id/admins` (tìm `/admins` trong `FE/src` không có kết quả). `CreateTenantDialog` chỉ có tên, slug, tier. FE luôn gửi `x-tenant-id` của chính người đăng nhập (`FE/src/lib/api/client.ts:159-165`); không tìm thấy màn hình chuyển tenant cho Super Admin.

### 2.3. Bước 1: khai pháp nhân trước khi tạo nhân viên

- Vì sao bắt buộc: DTO tạo nhân viên đòi `organizationId` (`BE/src/iam/dto/create-user-account.dto.ts:46-49`), và người gọi (trừ Super Admin) phải đã thuộc một pháp nhân, nếu không thì 400 "Cần tạo và liên kết pháp nhân của người quản trị trước khi thêm nhân sự." (`BE/src/iam/iam.service.ts:501-513`). FE chặn cả khu Quản lý tổ chức bằng màn hình onboarding khi tenant chưa có pháp nhân (`FE/src/features/workspace/WorkspaceLayout.tsx:182-183,225-241`).
- API: `POST /iam/organizations` nhận `nameVi` (bắt buộc), `nameEn`, `taxCode` (`BE/src/iam/dto/create-organization.dto.ts:3-15`; `BE/src/iam/iam.controller.ts:103-118`). Service chặn trùng mã số thuế trong tenant, chỉ gắn người tạo vào pháp nhân khi họ chưa có pháp nhân, trả cờ `linkedToCreator`, ghi `CREATE_ORGANIZATION` (`BE/src/iam/iam.service.ts:134-211`).
- FE gửi hai request nối nhau (tạo pháp nhân rồi phân loại), nên có thể tạo pháp nhân xong mà phân loại lỗi (`FE/src/features/workspace/workspace.hooks.ts:95-117`; `FE/src/features/workspace/CreateOrganizationDialog.tsx:38-108`).

### 2.4. Bước 2 đến 5: wizard "Hồ sơ nhân viên"

- Wizard 4 bước chia đúng theo trường API nhận (`FE/src/features/workspace/AddMemberWizard.tsx:47-68`). Tên bước và dòng mô tả lấy từ i18n: "Pháp nhân & nhóm", "Thông tin cá nhân", "Chi tiết công việc", "Tài khoản đăng nhập" (`FE/src/i18n/locales/vi/common.json`, khoá `workspace.step*`).
- "Lưu và tiếp tục" chỉ kiểm các trường của bước hiện tại (`AddMemberWizard.tsx:158-161`). Thanh bước bên trái cho bấm nhảy bước (`AddMemberWizard.tsx:209`); khi gửi, toàn bộ schema được kiểm lại (`AddMemberWizard.tsx:70-98,223-224`). Không có lưu nháp giữa các bước: đóng hộp thoại là mất dữ liệu (`AddMemberWizard.tsx:151-155`).

| Bước wizard | Trường (API) | Nhãn UI | Kiểu, giá trị | Bắt buộc | Ràng buộc FE | Ràng buộc BE |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `organizationId` | Pháp nhân | chọn trong danh sách pháp nhân của tenant; tự chọn nếu chỉ có một | Có | `min(1)` | `IsUUID`; phải thuộc tenant, không thì 404 |
| 1 | `userGroupCode` | Nhóm người dùng | 1 trong 16 nhóm hoặc "Giữ nguyên phân loại hiện tại" | Không | | phải có trong `user_group_definitions`, không thì 404 |
| 1 | `organizationSubtypeCode` | Loại tổ chức | chỉ hiện khi nhóm có loại con (seed chỉ có nhóm ngân hàng) | Không | | không kiểm với danh mục |
| 2 | `fullName` | Họ và tên | chữ | Có | `min(2)` | `IsNotEmpty`, tối đa 255 |
| 2 | `email` | Email công việc (gợi ý: "Đây cũng là email dùng để đăng nhập.") | email | Có | `email()`; gửi dạng chữ thường | `IsEmail`; trim, chữ thường; trùng tenant khác thì 409 |
| 2 | `phone` | Số điện thoại | chữ | Không | | tối đa 30, không kiểm định dạng |
| 3 | `employeeCode` | Mã nhân viên | chữ | Không | | tối đa 50; duy nhất trong tenant, trùng thì 409 |
| 3 | `jobTitle` | Vị trí | chữ tự do | Không | | tối đa 255 |
| 3 | `department` | Phòng ban | chữ tự do | Không | | tối đa 255 |
| 3 | `employmentType` | Loại hình làm việc | `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`, `OUTSOURCED` (Full-time, Part-time, Hợp đồng, Thực tập, Thuê ngoài) | Không | | `IsIn` + CHECK ở DB |
| 3 | `joinedAt` | Ngày vào làm | ngày (DatePicker) | Không | | `IsDateString` |
| 3 | `managerId` | Cấp trên trực tiếp (gợi ý: "Quan hệ này chính là các đường nối trong sơ đồ tổ chức.") | chọn trong toàn bộ nhân sự của tenant, kể cả người không ACTIVE | Không | | `IsUUID`; phải thuộc tenant, không thì 400 |
| 3 | `workLocation` | Địa điểm làm việc | chữ tự do | Không | | tối đa 255 |
| 4 | `password` | Mật khẩu | chữ | Có | `PASSWORD_REGEX`, tối đa 72 | `MinLength(8)`, `MaxLength(72)`, `PASSWORD_PATTERN` |
| 4 | `confirmPassword` | Nhập lại mật khẩu | chữ | Có | phải khớp | không gửi lên |

Nguồn bảng: `BE/src/iam/dto/create-user-account.dto.ts:29-101`; `BE/src/utils/enums/workspace.enum.ts:3-14`; `BE/src/utils/utils.ts:50-75`; `FE/src/features/workspace/AddMemberWizard.tsx:117-136,229-547`; `FE/src/lib/password.ts:13-17`; `BE/sql-docs/setup-lan-dau/05_seed_taxonomy.sql:73-83`.

- Bước 4 hiện dòng xác nhận "Tài khoản sẽ được tạo với email {{email}}. Nhân viên nên đổi mật khẩu sau lần đăng nhập đầu tiên." (i18n `workspace.accountNote`) và checklist 4 điều kiện mật khẩu (`AddMemberWizard.tsx:506-526`).
- Nút Tạo tài khoản chỉ bị khoá khi request đang chạy (`AddMemberWizard.tsx:572`).

### 2.5. Bước 5 phía server: `POST /iam/users`

Route yêu cầu `TENANT_ADMIN` hoặc `ORG_ADMIN` ở ngữ cảnh TENANT (`BE/src/iam/iam.controller.ts:35-38,71-86`). Service chạy theo thứ tự (`BE/src/iam/iam.service.ts:495-699`):

1. Người gọi phải thuộc một pháp nhân, trừ Super Admin (501-513).
2. Email được trim và đổi chữ thường (515).
3. `organizationId` phải thuộc tenant (521, hàm ở 222-235, trả 404 để không lộ sự tồn tại). `managerId` phải thuộc tenant (522-534, trả 400).
4. Tạo tài khoản Auth bằng `auth.admin.createUser` với `email_confirm: true`, `app_metadata: { tenant_id }`, `user_metadata: { full_name }` (537-544).
5. Nếu Auth báo email đã đăng ký: tra `users` theo email; không thấy thì 400; thuộc tenant khác thì 409; cùng tenant thì dùng lại user đó và đi tiếp (548-580). Mật khẩu trong request không được áp cho tài khoản Auth đã có.
6. `IdentityService.syncUserProfile` chèn dòng `users` với `status = 'ACTIVE'`, `attributes = { clearance_level: 1 }`, `version = 1`; dòng đã có thì trả nguyên, không ghi đè (`BE/src/identity/identity.service.ts:11-54`).
7. Ghi họ tên, pháp nhân và các trường hồ sơ trong một lệnh UPDATE; trùng mã nhân viên thì 409 (594-622).
8. Nếu có `userGroupCode`: dùng lại phân loại đã `VERIFIED`, không thì tạo phân loại rồi gọi thẳng `verifyClassification(..., VERIFIED)` (637-675).
9. Ghi `iam_audit_logs` với `action_type = 'CREATE_USER_ACCOUNT'`, payload `{ email, userGroupCode }` (677-684).
10. Đọc lại hồ sơ, trả `{ user, organization, classification }` (687-698).

Lệnh này không cấp vai trò nào. Không có bù trừ nếu bước 7 lỗi: tài khoản Auth và dòng `users` ACTIVE chưa gắn pháp nhân vẫn còn; gọi lại cùng email sẽ đi nhánh ở bước 5.

### 2.6. Bước 6: bàn giao, đăng nhập, mật khẩu

- Hệ thống không gửi gì cho nhân viên. Quản trị viên tự báo mật khẩu. Không có cờ bắt đổi mật khẩu lần đầu (tìm `must_change|force password|first login` trong `BE/src` không có kết quả).
- Đăng nhập: `POST /auth/login` chặn tài khoản khác ACTIVE (401 `AUTH_ACCOUNT_INACTIVE`) và đòi `app_metadata.tenant_id` là UUID (`BE/src/auth/auth.service.ts:62-89,141-227`).
- Quên mật khẩu: luôn trả cùng một câu, liên kết về `<APP_URL>/reset-password`; đặt lại bằng mã khôi phục của Supabase (`BE/src/auth/auth.service.ts:433-481`).
- Đổi mật khẩu: bắt buộc mật khẩu hiện tại (kiểm bằng ephemeral client), mật khẩu mới phải khác cũ, không thu hồi phiên ở máy khác (`BE/src/auth/auth.service.ts:493-533`; `BE/src/auth/dto/password.dto.ts:41-58`).
- Quản trị viên không có API đặt lại mật khẩu cho nhân viên trong tenant: `updateUserById` chỉ xuất hiện ở luồng đặt lại, đổi mật khẩu và các module vai trò nền tảng (tìm `updateUserById` trong `BE/src`).
- Trang `/profile` chỉ đọc, trừ thẻ đổi mật khẩu (`FE/src/features/profile/ProfilePage.tsx:74-144`). Nhân viên không tự sửa hồ sơ nhân sự.

### 2.7. Những bước không có trong FDI Today

| Bước thường gặp | Trạng thái | Nguồn |
| --- | --- | --- |
| Mời qua email, liên kết kích hoạt | Không có. Tài liệu ghi "Chưa" | `BE/business/docs/tenant/tenant-vs-organization.md:496`; `BE/src/iam/iam.service.ts:537-544`; tìm `inviteUserByEmail|generateLink` trong `BE/src` không có kết quả |
| Trạng thái "chờ kích hoạt" tự động | Không có. `INVITED` chỉ đặt được bằng tay | mục 5 |
| Nhập nhân viên hàng loạt | Không tìm thấy trong module `iam`/`workspace` | `BE/src/iam/iam.controller.ts`, `BE/src/workspace/workspace.controller.ts` |
| Cấp vai trò ngay trong wizard | Không có; tách sang trang Phân quyền | `BE/src/iam/iam.service.ts:495-699`; `BE/business/docs/use-guide/hdsd/05_hdsd_taotaikhoannhanvien.md:179-196` |

## 3. Hồ sơ nhân viên

Hồ sơ nằm trên bảng `users`. Người sửa được: `TENANT_ADMIN`, `ORG_ADMIN` và Super Admin, qua `PATCH /workspace/members/:id` (`BE/src/workspace/workspace.controller.ts:31-34,64,104-116`). `ROLE_PERMISSION_ADMIN` và nhân viên thường không sửa được.

| Trường | Kiểu | Bắt buộc | Ràng buộc | Ai sửa được | Nguồn |
| --- | --- | --- | --- | --- | --- |
| `id` | UUID | Hệ thống | = `auth.users.id`, ON DELETE CASCADE | Không ai | `03_organizations_va_users.sql:67` |
| `tenant_id` | UUID | Hệ thống | NOT NULL, FK `tenants`; lấy từ tenant người gọi | Không ai | `03_organizations_va_users.sql:68`; `iam.service.ts:583-588` |
| `email` | TEXT | Có | UNIQUE toàn nền tảng; trim, chữ thường; cũng là email đăng nhập | Không sửa được qua UI hay API; phải nhờ hỗ trợ | `03_organizations_va_users.sql:69`; `update-member.dto.ts:24-89` (không có trường email); `06_hdsd_danhsachnhansu.md:185` |
| `full_name` | TEXT | Có | NOT NULL; tối đa 255; FE đòi từ 2 ký tự; `PATCH` không chặn chuỗi rỗng ở BE | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:70`; `create-user-account.dto.ts:41-44`; `update-member.dto.ts:25-28`; `MemberFormDialog.tsx:47` |
| `avatar_url` | TEXT | Không | Không có luồng ghi ở BE, chỉ đọc | Không ai | `03_organizations_va_users.sql:71`; tìm `avatar_url\s*[:=]` trong `BE/src` chỉ ra khai báo kiểu |
| `status` | TEXT | Hệ thống đặt `ACTIVE` | DTO nhận `ACTIVE`, `INVITED`, `SUSPENDED`, `INACTIVE`; DB không có CHECK | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:72`; `workspace.enum.ts:17-26`; `update-member.dto.ts:82-84`; `identity.service.ts:39` |
| `attributes` | JSONB | Không | Thuộc tính ABAC nội bộ, khởi tạo `{ clearance_level: 1 }`; không trả ra FE | Không có API | `03_organizations_va_users.sql:75`; `identity.service.ts:40`; `workspace.service.ts:39-47` |
| `organization_id` | UUID | Có khi tạo (DTO), nullable ở DB | FK `organizations` ON DELETE SET NULL; phải thuộc tenant; `null` = gỡ khỏi pháp nhân | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:80`; `update-member.dto.ts:76-80`; `workspace.service.ts:237-239` |
| `employee_code` | TEXT | Không | Tối đa 50; trim; UNIQUE (`tenant_id`, `employee_code`) khi khác NULL | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:89,119-121`; `workspace.service.ts:276-283` |
| `job_title` | TEXT | Không | Tối đa 255; chữ tự do; không cấp quyền | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:90`; `update-member.dto.ts:36-40` |
| `department` | TEXT | Không | Tối đa 255; chữ tự do, không danh mục; có index (`tenant_id`, `department`) | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:91,127-128` |
| `employment_type` | TEXT | Không | CHECK trong `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERN`, `OUTSOURCED` | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:92,110-114`; `workspace.enum.ts:3-14` |
| `work_location` | TEXT | Không | Tối đa 255; chữ tự do | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:93` |
| `phone` | TEXT | Không | Tối đa 30; không kiểm định dạng | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:94`; `update-member.dto.ts:59-63` |
| `joined_at` | DATE | Không | `IsDateString` | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:95` |
| `manager_id` | UUID | Không | FK `users` ON DELETE SET NULL; CHECK khác chính mình; cùng tenant; không tạo vòng; `null` = gỡ cấp trên | TENANT_ADMIN, ORG_ADMIN | `03_organizations_va_users.sql:97-99,107-108`; `workspace.service.ts:483-529` |
| `created_at`, `updated_at` | TIMESTAMPTZ | Hệ thống | `updated_at` do service ghi | Không ai | `03_organizations_va_users.sql:101-102` |
| `version` | INT | Hệ thống | Khoá lạc quan; `PATCH` phải gửi version hiện tại, sai thì 400 "Concurrency Conflict" | Tự tăng khi sửa | `03_organizations_va_users.sql:103`; `update-member.dto.ts:86-88`; `workspace.service.ts:241-287` |

Đường dẫn rút gọn trong bảng: `03_organizations_va_users.sql` nằm ở `BE/sql-docs/setup-lan-dau/`; `*.dto.ts` và `*.service.ts` nằm ở `BE/src/iam/`, `BE/src/workspace/`, `BE/src/identity/`; `MemberFormDialog.tsx` ở `FE/src/features/workspace/`.

Trường suy diễn, không lưu trên `users`: `tenantRoles` (vai trò cấp tenant, chỉ có ở danh sách và sơ đồ), `directReports` (số cấp dưới), tóm tắt pháp nhân, tóm tắt cấp trên, `contextRoles` (`BE/src/workspace/workspace.service.ts:118-181`).

Quy ước `PATCH`: không gửi trường nghĩa là giữ nguyên, gửi `null` nghĩa là xoá; chuỗi rỗng được đổi thành `null` (`BE/src/workspace/dto/update-member.dto.ts:16-23`; `BE/src/workspace/workspace.service.ts:246-262,533-537`). FE luôn gửi đủ mọi trường của hộp thoại sửa (`FE/src/features/workspace/MemberFormDialog.tsx:124-159`).

Nhật ký sửa hồ sơ: `audit_logs` với `action = 'UPDATE'`, `entity_name = 'Member'`, `payload_before` và `payload_after` là cả bản ghi; không có lý do (`BE/src/workspace/workspace.service.ts:289-297`).

### 3.1. Hiển thị hồ sơ trên FE

- Bảng nhân sự 9 cột: Tên (avatar, email, nhãn "Bạn"), Mã NV, Pháp nhân (hoặc "Chưa gắn pháp nhân"), Địa điểm làm việc, Phòng ban, Vị trí, Loại hình làm việc, Trạng thái, Ngày vào làm (`FE/src/features/workspace/MemberTableView.tsx:74-231`). Cột Vị trí trống thì hiện vai trò cấp tenant đầu tiên kèm dòng "vai trò quyền hạn, chưa khai chức danh", không có vai trò thì "Chưa có vị trí" (`FE/src/features/workspace/memberDisplay.ts:14-24`).
- Tìm theo tên, email, mã NV; lọc theo pháp nhân và trạng thái; 10 dòng một trang (`MemberTableView.tsx:35,235-283`). API còn nhận lọc `department`, `employmentType` nhưng FE không dùng (`BE/src/workspace/dto/query-members.dto.ts:7-17`; `BE/src/workspace/workspace.service.ts:63-107`).
- Trang chi tiết `/organization/members/:id` có 4 tab: Tóm tắt, Cá nhân, Công việc, Vai trò & Quyền (`FE/src/features/workspace/MemberDetailPage.tsx:140-313`). Tab vai trò chỉ đọc, không hiện ngày hiệu lực, có nút mở trang Phân quyền (`MemberDetailPage.tsx:261-313`).
- Hộp thoại "Cập nhật hồ sơ nhân sự" có 3 khối: Thông tin định danh (họ tên, mã NV, điện thoại, trạng thái), Công việc (vị trí, phòng ban, loại hình, ngày vào làm, địa điểm), Cơ cấu tổ chức (pháp nhân, cấp trên). Danh sách cấp trên loại chính người đang sửa (`FE/src/features/workspace/MemberFormDialog.tsx:122,170-384`).

### 3.2. Lệch giữa tài liệu và code

- `06_hdsd_danhsachnhansu.md:146` nói khối "Cấp dưới trực tiếp" liệt kê người; code chỉ hiện số đếm (`MemberDetailPage.tsx:194`; `workspace.service.ts:168-172`).
- Trang chi tiết đọc `m.tenantRoles` để hiện huy hiệu vai trò (`MemberDetailPage.tsx:131`), nhưng API chi tiết không đính trường này (`workspace.service.ts:152-181`), nên huy hiệu không hiện.
- `06_hdsd_danhsachnhansu.md:76-81` chỉ nêu ô tìm kiếm và lọc pháp nhân; UI còn có lọc trạng thái (`MemberTableView.tsx:264-282`).

## 4. Sơ đồ tổ chức bộ máy

### 4.1. Mô hình

| Khái niệm | Cách FDI mô hình hoá | Nguồn |
| --- | --- | --- |
| Đơn vị | Chỉ pháp nhân là đơn vị có bảng (`organizations`). Không có bảng phòng ban, chi nhánh | `03_organizations_va_users.sql:29-39,89-95` |
| Phòng ban | Chữ tự do `users.department`, hiện trên thẻ, không tạo nhánh | `FE/src/features/workspace/OrgChartNodes.tsx:104-106` |
| Chức danh | Chữ tự do `users.job_title` | `03_organizations_va_users.sql:90` |
| Cấp bậc | Không có trường cấp bậc hay ngạch. "Cấp" chỉ là độ sâu trong cây `manager_id` | `FE/src/features/workspace/orgChartLayout.ts:166-173` |
| Quan hệ báo cáo | Một cấp trên trực tiếp (`manager_id`); không có báo cáo kiêm nhiệm hay đường chấm. Cho phép báo cáo chéo pháp nhân trong cùng tenant | `03_organizations_va_users.sql:97-99`; `FE/src/features/workspace/OrgChartView.tsx:92-101` |

### 4.2. Dữ liệu cho sơ đồ

- `GET /workspace/chart` trả toàn bộ nhân sự (không phân trang), danh sách pháp nhân và tổng số; cạnh `manager_id` trỏ ra ngoài tập được cắt về `null` (`BE/src/workspace/workspace.service.ts:191-220`). Route mở cho `TENANT_ADMIN`, `ORG_ADMIN`, `ROLE_PERMISSION_ADMIN` (`BE/src/workspace/workspace.controller.ts:26-30,91-95`).
- Không phân trang là cố ý; khi có hàng nghìn nhân sự thì phải chuyển sang nạp theo nhánh (`BE/business/docs/architecture/03-workspace-nhan-su.md:133-141`).
- Bảng và sơ đồ dùng chung một lần gọi `/workspace/chart` (`FE/src/features/workspace/MemberManagementPage.tsx:14-23`); sửa hồ sơ làm mới cả hai (`FE/src/features/workspace/workspace.hooks.ts:56-68`).

### 4.3. Quy tắc dựng cây

| Nhân sự | Nối lên |
| --- | --- |
| Có `manager_id` và cấp trên có trong tập | Cấp trên đó |
| Không có cấp trên, có pháp nhân | Thẻ pháp nhân |
| Không có cả hai | Thẻ ảo "Chưa gắn pháp nhân" |

- Nguồn: `FE/src/features/workspace/OrgChartView.tsx:92-159`; mô tả tương ứng ở `BE/business/docs/tenant/tenant-vs-organization.md:459-467`.
- Chỉ tạo thẻ pháp nhân khi pháp nhân có ít nhất một nhân sự gốc; thẻ pháp nhân hiện số nhân sự thuộc pháp nhân (`OrgChartView.tsx:128-140`).
- Bố cục "tidy tree" tự viết, chiều dọc, tất định, vẽ bằng React Flow (`@xyflow/react`) (`FE/src/features/workspace/orgChartLayout.ts:1-10,96-164`; `OrgChartView.tsx:4-15`).

### 4.4. Hiển thị

- Thẻ nhân sự: avatar hoặc chữ đầu, họ tên (kèm "(Bạn)"), dòng phụ (chức danh, hoặc vai trò cấp tenant, hoặc "Chưa có vị trí"), phòng ban, mã NV ở góc phải, nút +/- khi có cấp dưới (`FE/src/features/workspace/OrgChartNodes.tsx:68-131`). Thẻ không hiện trạng thái tài khoản.
- Thẻ pháp nhân: tên, "N nhân sự"; thẻ ảo có viền nét đứt (`OrgChartNodes.tsx:134-184`).
- Thanh công cụ: ô tìm (so tên, email, mã NV; làm nổi người khớp, làm mờ người khác, hiện "N kết quả"); chọn "Tất cả cấp" hoặc "N cấp" tới độ sâu thực có; nút "Mở rộng tất cả"; nút phóng to, thu nhỏ, vừa khung (`OrgChartView.tsx:172-182,247-255,269-327`).
- Không kéo thả thẻ, không nối cạnh (`OrgChartView.tsx:318-322`). Nhấp đôi vào thẻ mở trang chi tiết (`OrgChartNodes.tsx:79`; i18n `workspace.chartHint`).

### 4.5. Thao tác thêm, sửa, di chuyển, ngừng

| Thao tác | Cách làm | Nguồn |
| --- | --- | --- |
| Thêm | Tạo tài khoản kèm `managerId` ở wizard bước 3; chỉ chọn được người đã tồn tại, nên phải tạo từ trên xuống | `05_hdsd_taotaikhoannhanvien.md:145-152` |
| Sửa | `PATCH /workspace/members/:id` (vị trí, phòng ban, cấp trên, pháp nhân) | `BE/src/workspace/workspace.service.ts:225-300` |
| Di chuyển | Đổi Cấp trên hoặc Pháp nhân trong hộp thoại sửa. Cả nhánh con đi theo vì cấp dưới vẫn trỏ về người đó | `FE/src/features/workspace/MemberFormDialog.tsx:326-384` |
| Ngừng | Đổi trạng thái sang `INACTIVE`. Người đó vẫn hiện trên sơ đồ, cấp dưới không tự chuyển | `workspace.service.ts:191-199` (không lọc `status`); `07_hdsd_sodotochuc.md:216-217` |
| Xoá | Không có | `BE/src/workspace/workspace.controller.ts:78-116` |
| Xuất ảnh | Không có | `07_hdsd_sodotochuc.md:214-215` |

Tài liệu vận hành gọi đủ: `BE/business/docs/use-guide/hdsd/05_hdsd_taotaikhoannhanvien.md`, `07_hdsd_sodotochuc.md` (cùng thư mục).

### 4.6. Giới hạn số cấp và chống vòng

- Không giới hạn độ sâu ở DB hay BE. UI chỉ giới hạn độ sâu hiển thị (`OrgChartView.tsx:252-255`).
- Chống vòng hai lớp: CHECK `manager_id <> id` (`03_organizations_va_users.sql:107-108`); khi `PATCH`, service nạp mọi cạnh của tenant rồi đi ngược chuỗi cấp trên, gặp lại chính người đang sửa thì 400 (`workspace.service.ts:478-529`). Khi tạo mới chỉ kiểm cấp trên tồn tại, vì người mới chưa có cấp dưới (`iam.service.ts:522-534`).
- Nếu dữ liệu có vòng (ghi thẳng vào DB), không node nào của vòng thành gốc nên cả nhánh biến mất khỏi sơ đồ, không lặp vô hạn (`orgChartLayout.ts:42-63`; `07_hdsd_sodotochuc.md:151-160`).

### 4.7. Lệch giữa tài liệu và code

| Tài liệu nói | Code | Nguồn |
| --- | --- | --- |
| Bấm một lần vào thẻ mở hồ sơ | Nhấp đôi | `07_hdsd_sodotochuc.md:94`; `OrgChartNodes.tsx:79` |
| Có nút "Mở rộng tất cả" và "Thu gọn" | Chỉ có "Mở rộng tất cả"; thu gọn làm theo từng thẻ; không có khoá i18n `collapseAll` | `07_hdsd_sodotochuc.md:105`; `OrgChartView.tsx:302-305` |
| Con số trên nút là số người bị ẩn bên dưới | Là số cấp dưới trực tiếp | `07_hdsd_sodotochuc.md:124`; `OrgChartNodes.tsx:13-14,116-121` |
| "1 cấp" hiện thẻ pháp nhân và người đứng đầu | "1 cấp" chỉ còn thẻ pháp nhân, vì thẻ pháp nhân tính là cấp 1 | `07_hdsd_sodotochuc.md:115`; `orgChartLayout.ts:65-83` |
| Ô tìm theo tên hoặc mã NV | Còn so cả email | `07_hdsd_sodotochuc.md:103`; `OrgChartView.tsx:172-182` |

## 5. Vòng đời tài khoản và trạng thái

### 5.1. Các trạng thái

| Mã | Nhãn UI | Ai đặt | Đăng nhập được | Ghi chú |
| --- | --- | --- | --- | --- |
| `ACTIVE` | Hoạt động | Hệ thống khi tạo; quản trị viên | Có | Mặc định của mọi tài khoản mới |
| `INVITED` | Đã mời | Chỉ đặt tay qua `PATCH`; không luồng nào tự đặt | Không (401) | Tài liệu mô tả là "đã tạo nhưng chưa đăng nhập lần nào", code không có luồng đó |
| `SUSPENDED` | Tạm ngưng | Quản trị viên | Không | Tài liệu gợi ý cho nghỉ dài, điều tra nội bộ |
| `INACTIVE` | Ngừng hoạt động | Quản trị viên | Không | Nghỉ việc; không xoá tài khoản |

Nguồn: `BE/src/utils/enums/workspace.enum.ts:16-26`; i18n `workspace.memberStatus`; `BE/src/identity/identity.service.ts:39`; `BE/src/auth/auth.service.ts:72`; `BE/business/docs/use-guide/hdsd/06_hdsd_danhsachnhansu.md:101-108`.

### 5.2. Chuyển trạng thái

- Ai: `TENANT_ADMIN`, `ORG_ADMIN`, Super Admin, qua `PATCH /workspace/members/:id` (`BE/src/workspace/workspace.controller.ts:64,104-116`).
- Không có máy trạng thái: đổi tự do giữa 4 giá trị, không bắt lý do, không có xác nhận riêng (`BE/src/workspace/workspace.service.ts:225-300`).
- Không chặn tự khoá mình, không chặn `ORG_ADMIN` khoá `TENANT_ADMIN`: `updateMember` không kiểm vai trò của người bị sửa (`workspace.service.ts:225-300`). Vai trò `TENANT_ADMIN` không thu hồi được (`BE/src/iam/iam.service.ts:917-925`), nhưng tài khoản giữ vai trò đó vẫn bị khoá được qua trạng thái.
- Đổi trạng thái không tự thu hồi vai trò; quy trình nghỉ việc do người vận hành làm tay 3 bước: đổi trạng thái, thu hồi vai trò ở từng phạm vi, chuyển tài liệu riêng tư (`BE/business/docs/use-guide/hdsd/06_hdsd_danhsachnhansu.md:195-214`; `08_hdsd_phanquyen.md:234-245`).
- Xoá: không có endpoint. Ở DB, `users.id` ON DELETE CASCADE từ `auth.users` (`03_organizations_va_users.sql:67`); `iam_audit_logs.actor_user_id` ON DELETE CASCADE, nên xoá cứng một người ở Supabase sẽ xoá luôn nhật ký IAM do người đó thực hiện (`04_iam_va_audit.sql:89`); `audit_logs.user_id` ON DELETE SET NULL (`04_iam_va_audit.sql:105`).
- Trạng thái tenant `SUSPENDED` chưa được thực thi (`BE/business/docs/architecture/01-bao-mat-va-guard.md:392`; `BE/business/docs/tenant/tenant-vs-organization.md:497`).
- `users.status` là trạng thái nhân sự do tenant quản; module diễn đàn cố ý dùng bảng chế tài riêng vì quản trị viên tenant sửa được cột này (`BE/sql-docs/setup-lan-dau/forum/184_forum_gate3_kiem_duyet_khieu_nai_development.sql:16-22`).

### 5.3. Ảnh hưởng tới phiên đăng nhập

| Cửa | Hành vi khi `users.status` khác `ACTIVE` | Nguồn |
| --- | --- | --- |
| `POST /auth/login`, `POST /auth/admin-login` | Thu hồi phiên vừa tạo (`signOut` global), trả 401 `AUTH_ACCOUNT_INACTIVE`. Không có dòng `users` thì không chặn | `BE/src/auth/auth.service.ts:62-89,109,165` |
| `POST /auth/refresh` | Như trên | `auth.service.ts:328-354` |
| Route có `@RequireContext` | `PermissionsGuard` trả 403 "User account is currently inactive or suspended" | `BE/src/auth/guards/permission.guard.ts:85-89` |
| Route không có `@RequireContext` | `JwtAuthGuard` có đọc dòng `users` (kể cả cột `status`) để lấy tenant nhưng không kiểm trạng thái; access token còn dùng được tới khi hết hạn, khoảng 1 giờ | `BE/src/auth/guards/jwt-auth.guard.ts:105-112,179-187`; `BE/src/forum/forum-moderator-account.service.ts:77-99` |
| Lúc quản trị viên đổi trạng thái | Không thu hồi phiên. Ghi chú trong code: `admin.signOut` cần access token của chính người dùng nên quản trị viên không gọi được | `workspace.service.ts:225-300`; `forum-moderator-account.service.ts:93-97` |

- Đăng xuất chỉ thu hồi phiên đang dùng (`'local'`) (`auth.service.ts:401-416`).
- Access token và refresh token đều được mã hoá AES-256-GCM trước khi trả client (`auth.service.ts:121-137,171-187,367-371`).

### 5.4. Lệch giữa tài liệu và code

- `06_hdsd_danhsachnhansu.md:106`: `INVITED` là "đã tạo nhưng chưa đăng nhập lần nào"; code tạo tài khoản ở `ACTIVE` và chặn đăng nhập với `INVITED`.
- `01-bao-mat-va-guard.md:390-391`: "không có refresh token rotation", "refresh_token không mã hoá"; code đã có `/auth/refresh` và mã hoá cả refresh token (`auth.service.ts:136,186,296-373`).
- `forum-moderator-account.dto.ts:112` nói `users.status` có CHECK; migration không có (`03_organizations_va_users.sql:72`).
- `forum-moderator-account.service.ts:84-85` nói `JwtAuthGuard` không đọc database; guard có đọc `users` ở mỗi request (`jwt-auth.guard.ts:105,179-187`), chỉ không kiểm trạng thái.

## 6. Gán và thu hồi quyền cho nhân viên

### 6.1. Mô hình

- Mỗi dòng quyền = chủ thể × phạm vi × vai trò × khoảng hiệu lực (`BE/sql-docs/setup-lan-dau/04_iam_va_audit.sql:25-59`; `BE/business/docs/architecture/01-bao-mat-va-guard.md:131-158`).
- Chủ thể `USER` hoặc `ORGANIZATION`. Cấp cho pháp nhân thì mọi nhân sự đang thuộc pháp nhân đó được hưởng, kể cả người vào sau (`BE/src/auth/guards/permission.guard.ts:162-187`; `BE/business/docs/use-guide/hdsd/08_hdsd_phanquyen.md:147-157`).
- Phạm vi: `TENANT`, `PROJECT`, `DATA_ROOM`, `TRANSACTION` (`BE/src/iam/dto/assign-context-role.dto.ts:15-20`). Trang Phân quyền chỉ cho `TENANT` và `PROJECT` (`FE/src/features/workspace/PermissionsPage.tsx:30-38`). `DATA_ROOM` quản trị trong chính Data Room; `TRANSACTION` bị service chặn vì chưa có bảng (`BE/src/iam/iam.service.ts:759-764`).

### 6.2. Danh mục vai trò

- Danh mục nằm trong code, trả qua `GET /iam/role-catalog`; FE không hard-code (`BE/src/utils/enums/role.enum.ts:3-69,85-327`; `BE/src/iam/iam.controller.ts:192-196`). Mỗi mục có `code`, `nameVi/En`, `contextType`, `assignable`, `allowedSubjectTypes`, `descriptionVi/En`, `applicableUserGroups` (chỉ là gợi ý, BE không chặn theo trường này).
- 25 mã: 5 cấp TENANT, 15 cấp PROJECT, 3 cấp DATA_ROOM, 2 cấp TRANSACTION.

| Vai trò cấp tenant | Ý nghĩa | Ràng buộc | Nguồn |
| --- | --- | --- | --- |
| `TENANT_ADMIN` Quản trị không gian làm việc | Chủ sở hữu; quản trị control-plane ở mọi phạm vi thuộc tenant, không tự đọc nội dung Data Room | `assignable: false`; chỉ `USER`; không thu hồi được; chỉ cấp qua đăng ký hoặc API Super Admin | `role.enum.ts:89-98`; `iam.service.ts:813-820,917-925` |
| `ORG_ADMIN` Quản trị pháp nhân | Tạo, phân loại pháp nhân và quản lý nhân sự toàn tenant; không phân quyền | Chỉ `USER` | `role.enum.ts:99-108` |
| `ROLE_PERMISSION_ADMIN` Quản trị vai trò & phân quyền | Cấp, thu hồi vai trò | Chỉ `USER` | `role.enum.ts:109-117` |
| `COMPLIANCE_ADMIN` Quản trị tuân thủ | Theo dõi tuân thủ, NDA, consent | Không giới hạn chủ thể | `role.enum.ts:118-125` |
| `DATA_STEWARD` Quản lý dữ liệu | Chất lượng và vòng đời dữ liệu | Không giới hạn chủ thể | `role.enum.ts:126-133` |

Tách người quản lý nhân sự (`ORG_ADMIN`) khỏi người cấp quyền (`ROLE_PERMISSION_ADMIN`) là chủ ý: một người vừa tạo tài khoản vừa tự cấp quyền thì không còn lớp kiểm nào (`08_hdsd_phanquyen.md:62-63`).

### 6.3. Ai được làm gì (theo code)

| Thao tác | API | Vai trò được phép ở BE | FE hiện cho |
| --- | --- | --- | --- |
| Tạo tài khoản nhân viên | `POST /iam/users` | TENANT_ADMIN, ORG_ADMIN | TENANT_ADMIN, ORG_ADMIN |
| Danh sách, chi tiết, sửa hồ sơ | `GET /workspace/members`, `GET/PATCH /workspace/members/:id` | TENANT_ADMIN, ORG_ADMIN | TENANT_ADMIN, ORG_ADMIN |
| Tổng quan, sơ đồ | `GET /workspace/overview`, `GET /workspace/chart` | TENANT_ADMIN, ORG_ADMIN, ROLE_PERMISSION_ADMIN | Trang Quản lý nhân viên: TENANT_ADMIN, ORG_ADMIN; ROLE_PERMISSION_ADMIN chỉ dùng dữ liệu này trong hộp thoại cấp vai trò |
| Tạo, phân loại pháp nhân | `POST /iam/organizations`, `POST/GET /iam/organizations/:orgId/classifications` | TENANT_ADMIN, ORG_ADMIN | TENANT_ADMIN, ORG_ADMIN |
| Duyệt phân loại | `PATCH /iam/classifications/:id/verify` | TENANT_ADMIN | TENANT_ADMIN |
| Cấp, thu hồi, xem vai trò | `POST /iam/context-roles/assign`, `DELETE /iam/context-roles/:assignmentId`, `GET /iam/contexts/:type/:id/assigned-subjects` | TENANT_ADMIN, ROLE_PERMISSION_ADMIN | TENANT_ADMIN, ROLE_PERMISSION_ADMIN |
| Cấp, thu hồi TENANT_ADMIN | `POST /tenants/:id/admins`, `DELETE /tenants/:id/admins/:assignmentId` | Super Admin | Không có màn hình |
| Mọi thao tác trên | | Super Admin được `PermissionsGuard` cho qua | Super Admin |

Nguồn: `BE/src/iam/iam.controller.ts:31-38,71-236`; `BE/src/workspace/workspace.controller.ts:26-34,62-116`; `BE/src/tenant/tenant.controller.ts:63-81`; `BE/src/auth/guards/permission.guard.ts:59-62`; `FE/src/features/auth/authorization.ts:3-63`; `FE/src/features/workspace/WorkspaceLayout.tsx:55-72,177-201`.

### 6.4. Cấp vai trò: màn hình và kiểm tra

- Trang "Phân quyền theo ngữ cảnh": chọn Loại phạm vi (Không gian làm việc hoặc Dự án); nếu là dự án thì chọn dự án từ 100 dự án đầu (`useProjects({ page: 1, limit: 100 })`); danh sách ai đang có vai trò kèm nhãn Sắp hiệu lực, Đang hiệu lực, Đã hết hiệu lực, ngày từ, ngày đến ("Không thời hạn"), nút Thu hồi hoặc "Không thu hồi được" (`FE/src/features/workspace/PermissionsPage.tsx:40-47,62,126-292`).
- Hộp thoại "Cấp vai trò theo ngữ cảnh" (`FE/src/features/workspace/AssignRoleDialog.tsx:45-196`):

| Ô | Giá trị | Bắt buộc | Ghi chú |
| --- | --- | --- | --- |
| Cấp cho | `USER` hoặc `ORGANIZATION` | Có | Gợi ý: "Cấp cho pháp nhân thì mọi nhân sự của pháp nhân đó đều được hưởng quyền." |
| Nhân sự hoặc Pháp nhân | chọn từ toàn bộ nhân sự hoặc pháp nhân của tenant | Có | Không lọc theo trạng thái nhân sự |
| Vai trò | lọc theo `contextType`, `assignable !== false`, `allowedSubjectTypes`; gợi ý theo nhóm đã `VERIFIED` của pháp nhân; có ô "Hiện tất cả vai trò (còn N vai trò khác)" | Có | Hiện mô tả của vai trò đã chọn |
| Hiệu lực từ | ngày | Không | Bỏ trống là có hiệu lực ngay; gửi `YYYY-MM-DDT00:00:00.000Z` |
| Hiệu lực đến | ngày, không trước ngày bắt đầu | Không | Bỏ trống là không thời hạn; gửi `YYYY-MM-DDT23:59:59.999Z` |

- Mốc ngày được đổi theo UTC (`AssignRoleDialog.tsx:55-58,183-185`): "hết ngày 31/12" thực tế là 06:59:59 sáng 01/01 giờ Việt Nam.
- Kiểm ở `IamService.assignContextRole` (`BE/src/iam/iam.service.ts:798-891`), theo thứ tự: chủ thể thuộc tenant (774-796); phạm vi thuộc tenant, `TENANT` phải trùng tenant người gọi, `PROJECT`/`DATA_ROOM` phải có `tenant_id` khớp (714-771); `role_code` có trong danh mục; không phải `TENANT_ADMIN` trừ luồng nội bộ; `contextType` của vai trò khớp; `allowedSubjectTypes`; `effectiveTo > effectiveFrom` (mặc định từ = bây giờ); không trùng bộ 5 cột. Sau đó ghi dòng và `iam_audit_logs` `ASSIGN_CONTEXT_ROLE` với payload là DTO.
- `contextId` dùng `IsUUID('loose')` để nhận UUID của tenant nền tảng (`BE/src/iam/dto/assign-context-role.dto.ts:35-49`).
- Dòng quyền không có cột người cấp hay lý do; người cấp chỉ nằm ở `iam_audit_logs.actor_user_id` (`04_iam_va_audit.sql:25-59,86-95`).

### 6.5. Thu hồi

- `DELETE /iam/context-roles/:assignmentId`: đọc dòng, kiểm phạm vi thuộc tenant, chặn `TENANT_ADMIN`, rồi xoá cứng dòng; ghi `iam_audit_logs` `REVOKE_CONTEXT_ROLE` với payload là dòng đã xoá. Không có lý do thu hồi (`BE/src/iam/iam.service.ts:893-948`).
- UI hỏi lại "Thu hồi vai trò ... của ...?" trước khi xoá (`FE/src/features/workspace/PermissionsPage.tsx:303-319`).
- Hết hạn tự nhiên theo `effective_to`; dòng hết hạn vẫn nằm trong danh sách với nhãn "Đã hết hiệu lực" (`PermissionsPage.tsx:40-47`).
- Kiểm trùng không xét hiệu lực, cộng với UNIQUE ở DB, nên dòng đã hết hạn vẫn chặn cấp lại cùng vai trò; phải xoá dòng cũ trước (`iam.service.ts:850-864`; `04_iam_va_audit.sql:57-58`).
- Xoá cứng làm bảng quyền mất câu trả lời "ai từng có quyền gì, từ khi nào tới khi nào". Trong cùng repo, module M04 dựng bảng phân quyền riêng theo hướng thu hồi bằng mốc `revoked_at`, `revoked_by`, không DELETE (`BE/sql-docs/m04/354_m04_g1_tai_khoan_chien_luoc_development.sql:99-139`).

### 6.6. Kiểm quyền phía server khi sử dụng

1. `JwtAuthGuard`: chỉ đọc header `Authorization`, không đọc cookie; giải mã token; xác minh chữ ký; lấy tenant từ `users.tenant_id` rồi `app_metadata.tenant_id`; header `x-tenant-id` khác tenant thì 403, trừ Super Admin (`BE/src/auth/guards/jwt-auth.guard.ts:27-131`).
2. `PermissionsGuard`: route không có `@RequireContext` thì cho qua; Super Admin cho qua; đòi `status = ACTIVE`; đòi tenant khớp; `contextId` mặc định là tenant người gọi, hoặc lấy từ param/body theo `contextParam`; `TENANT_ADMIN` đi qua mọi phạm vi không phải TENANT sau khi xác minh phạm vi thuộc tenant; còn lại tra dòng quyền của `USER` và `ORGANIZATION` như hai namespace tách biệt, lọc theo khoảng hiệu lực tại thời điểm gọi (`BE/src/auth/guards/permission.guard.ts:35-283`).
3. Lớp dữ liệu: guard không biết UUID trong body/URL thuộc tenant nào, nên mọi service phải tự kiểm (`BE/business/docs/tenant/tenant-vs-organization.md:209-239`; `BE/business/docs/architecture/01-bao-mat-va-guard.md:183-199`).
4. Vai trò không nằm trong JWT. FE lấy `GET /iam/me/capabilities` (thông tin user, pháp nhân, nhóm đã xác minh, `activeContextRoles` của cả user lẫn pháp nhân) để ẩn hiện giao diện (`BE/src/iam/iam.service.ts:1045-1184`; `FE/src/features/auth/authorization.ts:30-35`).

## 7. Quy tắc và kiểm tra đáng chú ý

### 7.1. Nên học theo

1. "Thêm nhân viên" là một lệnh nghiệp vụ: UI chia bước nhưng chỉ gửi ở bước cuối, server ghi hồ sơ trong một lệnh UPDATE (`BE/src/iam/dto/create-user-account.dto.ts:21-28`; `BE/business/docs/tenant/tenant-vs-organization.md:398-402`).
2. Mọi UUID do client gửi (`organizationId`, `managerId`, `subjectId`, `contextId`, `assignmentId`) được kiểm thuộc tenant ở service; trả 404 để không lộ sự tồn tại (`BE/src/iam/iam.service.ts:213-235,705-796`).
3. Không tin tenant do client khai, trừ Super Admin (`BE/src/auth/guards/jwt-auth.guard.ts:90-131`).
4. Chức danh khác vai trò; sơ đồ tổ chức không cấp quyền (`07_hdsd_sodotochuc.md:244-245`; `08_hdsd_phanquyen.md:31-47`).
5. Chống vòng hai lớp; `ON DELETE SET NULL` cho cấp trên để xoá một người không xoá lây cả nhánh (`03_organizations_va_users.sql:97-99,105-108`).
6. Khoá lạc quan bằng `version`; quy ước `null` khác `undefined` trong `PATCH` (`BE/business/docs/architecture/03-workspace-nhan-su.md:84-96`).
7. Allow-list cột trả về để không lộ `attributes` (`BE/src/workspace/workspace.service.ts:39-47`).
8. Danh mục vai trò tập trung, mã bất biến, không tái dùng; `assignable`; `allowedSubjectTypes` cho vai trò quản trị (`BE/src/utils/enums/role.enum.ts:3-69`).
9. Vai trò chủ sở hữu không cấp qua màn hình chung và không thu hồi được; API trả cờ `revocable` để UI ẩn nút (`iam.service.ts:813-820,917-925,1021-1023`).
10. Chính sách mật khẩu một nguồn, hai bên FE/BE khớp nhau, tối đa 72 ký tự (`BE/src/utils/utils.ts:45-75`; `FE/src/lib/password.ts:1-17`).
11. Quên mật khẩu trả câu trung tính; đổi mật khẩu phải nhập mật khẩu cũ (`BE/src/auth/auth.service.ts:422-533`).
12. Đăng nhập và làm mới phiên đều kiểm trạng thái, thu hồi toàn bộ phiên khi tài khoản bị khoá (`auth.service.ts:42-89,318-354`).
13. Không xoá nhân sự; nghỉ việc là đổi trạng thái (`06_hdsd_danhsachnhansu.md:195-214`).
14. Phân quyền hiển thị trạng thái hiệu lực và ngày; khuyến nghị đặt hạn cho mọi vai trò cấp cho bên ngoài (`08_hdsd_phanquyen.md:116-130,161-171`).
15. Nhãn "Chưa gắn pháp nhân" và chỉ số `unassignedMembers` biến lỗi dữ liệu thành việc cần làm (`07_hdsd_sodotochuc.md:77`; `BE/business/docs/architecture/03-workspace-nhan-su.md:157-159`).

### 7.2. Điểm yếu, không nên lặp lại

1. Không mời qua email, không kích hoạt: quản trị viên đặt và biết mật khẩu của nhân viên; không bắt đổi mật khẩu lần đầu (mục 2.6, 2.7).
2. `INVITED` không có luồng, và người ở `INVITED` không đăng nhập được (`BE/src/auth/auth.service.ts:72`).
3. Khoá tài khoản chưa có hiệu lực ngay trên route không có `@RequireContext`, tối đa khoảng 1 giờ (mục 5.3).
4. Đổi trạng thái không tự đóng vai trò; phải thu hồi tay ở từng phạm vi (mục 5.2).
5. Thu hồi vai trò là DELETE, không có lý do, dòng quyền không ghi người cấp và người thu hồi (mục 6.4, 6.5).
6. Không có chốt chống khoá chủ sở hữu hay tự khoá: `ORG_ADMIN` đặt được `TENANT_ADMIN` về `INACTIVE` (`BE/src/workspace/workspace.service.ts:225-300`).
7. Lệnh ghép vượt quyền: `ORG_ADMIN` gọi `POST /iam/users` kèm `userGroupCode` làm phân loại pháp nhân thành `VERIFIED`, trong khi API duyệt phân loại chỉ cho `TENANT_ADMIN` (`BE/src/iam/iam.controller.ts:164-165`; `BE/src/iam/iam.service.ts:637-675`). Service gọi thẳng hàm con nên bỏ qua kiểm vai trò ở route.
8. Idempotent theo email trong cùng tenant: nhập email của một nhân viên đang có sẽ ghi đè họ tên, pháp nhân và các trường hồ sơ vừa nhập lên người đó, không báo trùng; mật khẩu mới bị bỏ qua (`iam.service.ts:548-612`).
9. Không bù trừ khi ghi hồ sơ lỗi: tài khoản Auth và dòng `users` ACTIVE chưa gắn pháp nhân vẫn còn và đăng nhập được (`iam.service.ts:583-622`).
10. `iam_audit_logs.actor_user_id` ON DELETE CASCADE: xoá người dùng xoá luôn nhật ký IAM của họ (`04_iam_va_audit.sql:89`).
11. Nhật ký sửa hồ sơ ghi cả bản ghi trước/sau, không allow-list trường, không lý do (`workspace.service.ts:289-297`).
12. `POST /identity/sync-me` nhận `tenantId` từ body và tạo dòng `users` nếu chưa có, không đối chiếu `app_metadata.tenant_id` (`BE/src/identity/identity.controller.ts:11-25`; `BE/src/identity/identity.service.ts:11-54`). Chỉ có tác dụng với tài khoản Auth chưa có dòng `users`, nhưng đây là một đường nhận tenant do client khai.
13. Từ khoá tìm kiếm được ghép thẳng vào chuỗi `.or()` của PostgREST, không escape (`workspace.service.ts:82-88`). Truy vấn vẫn khoá theo `tenant_id` nên không lộ chéo tenant, nhưng dễ vỡ khi từ khoá có dấu phẩy hay ngoặc.
14. Phòng ban, chức danh, địa điểm là chữ tự do: cùng một phòng có thể viết nhiều cách, lọc và báo cáo theo phòng ban kém tin cậy (`03_organizations_va_users.sql:89-95`).
15. Ô đồng ý điều khoản khi đăng ký chỉ kiểm ở FE, không gửi và không lưu (`FE/src/features/auth/RegisterPage.tsx:61-63,104-123`), trong khi tài liệu coi đó là bằng chứng về sau (`01_hdsd_dangkydangnhap.md:278-282`).
16. Ngày hiệu lực của vai trò đổi theo UTC, không theo giờ Việt Nam (`FE/src/features/workspace/AssignRoleDialog.tsx:55-58`).
17. Trang chi tiết lấy vai trò bằng `.in('subject_id', ...)`, không lọc `subject_type`, không lọc hiệu lực (`workspace.service.ts:422-441`), trái quy tắc tách namespace mà chính `PermissionsGuard` đặt ra (`permission.guard.ts:162-164`).
18. Danh sách chọn cấp trên và danh sách người được cấp quyền gồm cả người không ACTIVE (`AddMemberWizard.tsx:472-477`; `AssignRoleDialog.tsx:254-260`).
19. Người đã ngừng vẫn nằm giữa cây và thẻ không có dấu hiệu trạng thái (mục 4.4, 4.5).

### 7.3. Tài liệu lệch code (tổng hợp)

| Tài liệu nói | Code thực tế | Nguồn tài liệu | Nguồn code |
| --- | --- | --- | --- |
| `ROLE_PERMISSION_ADMIN` tạo được tài khoản nhân viên và xem được bảng nhân sự | `POST /iam/users` và `/workspace/members` chỉ cho `TENANT_ADMIN`, `ORG_ADMIN`; FE chặn trang nhân viên với vai trò này | `05_hdsd_taotaikhoannhanvien.md:37`; `06_hdsd_danhsachnhansu.md:53`; i18n `workspace.workspaceAccessDeniedDescription` | `iam.controller.ts:35-38,71-75`; `workspace.controller.ts:64`; `WorkspaceLayout.tsx:194-195` |
| Actor chỉ có `ORG_ADMIN` thì `organizationId` phải bằng pháp nhân của actor | Không có kiểm tra này | `usergroup-organization-relationship.md:188-193` | `iam.service.ts:495-534` |
| `ORG_ADMIN` không tự xác minh phân loại | Làm được qua `POST /iam/users` | `02-iam-va-phan-quyen.md:204-209`; `tenant-vs-organization.md:381-383` | `iam.service.ts:637-675` |
| `INVITED` = đã tạo, chưa đăng nhập | Không luồng nào đặt `INVITED`; `INVITED` bị chặn đăng nhập | `06_hdsd_danhsachnhansu.md:106` | `identity.service.ts:39`; `auth.service.ts:72` |
| Khối "Cấp dưới trực tiếp" là danh sách | Chỉ là số đếm | `06_hdsd_danhsachnhansu.md:146` | `MemberDetailPage.tsx:194` |
| Nút Tạo tài khoản mờ khi mật khẩu chưa đạt | Nút chỉ khoá khi đang gửi | `05_hdsd_taotaikhoannhanvien.md:301-302` | `AddMemberWizard.tsx:572` |
| Email "chưa dùng trên nền tảng" | Email đã có trong cùng tenant được dùng lại và ghi đè hồ sơ | `05_hdsd_taotaikhoannhanvien.md:121` | `iam.service.ts:548-580` |
| Sơ đồ: bấm một lần; có "Thu gọn"; số trên nút là số người ẩn; "1 cấp" gồm người đứng đầu | Nhấp đôi; chỉ "Mở rộng tất cả"; số cấp dưới trực tiếp; "1 cấp" chỉ thẻ pháp nhân | `07_hdsd_sodotochuc.md:94,105,115,124` | `OrgChartNodes.tsx:79,116-121`; `OrgChartView.tsx:302-305`; `orgChartLayout.ts:65-83` |
| Danh mục có 24 vai trò | Có 25 mã | `tenant-vs-organization.md:270` | `role.enum.ts:85-327` |
| Chưa có refresh token rotation; refresh token không mã hoá | Đã có `/auth/refresh`, refresh token được mã hoá | `01-bao-mat-va-guard.md:390-391` | `auth.service.ts:136,186,296-373` |
| `users.status` có CHECK | Migration không có CHECK cho cột này | `BE/src/forum/dto/forum-moderator-account.dto.ts:112` | `03_organizations_va_users.sql:72` |
| `JwtAuthGuard` không đọc database | Có đọc `users` mỗi request, chỉ không kiểm trạng thái | `forum-moderator-account.service.ts:84-85` | `jwt-auth.guard.ts:105,179-187` |
| Chú thích enum trỏ `sql-docs/users/users.employee.update.sql`; migration 03 dẫn `sql-docs/_lich-su/` | Không tìm thấy hai thư mục này trong repo; nội dung đã gộp vào migration 03 | `workspace.enum.ts:1-2`; `03_organizations_va_users.sql:5-16` | `ls BE/sql-docs` |

Đường dẫn rút gọn trong bảng: tài liệu hdsd ở `BE/business/docs/use-guide/hdsd/`, tài liệu kiến trúc ở `BE/business/docs/architecture/`, tài liệu tenant ở `BE/business/docs/tenant/`, tài liệu nhóm người dùng ở `BE/business/docs/user_group/`.

## 8. Gợi ý áp dụng cho EH-AM

### 8.1. Khác biệt bối cảnh

| Khía cạnh | FDI Today | EH-AM hiện tại hoặc theo Blueprint | Nguồn EH-AM |
| --- | --- | --- | --- |
| Tenant và pháp nhân | Nhiều tenant, mỗi tenant nhiều pháp nhân, tự đăng ký công khai | Một pháp nhân; tài khoản do Quản trị hệ thống tạo; đăng ký công khai sẽ đóng (D-01) | `business/product-docs/product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md:353` |
| Đơn vị | Pháp nhân | Location: cửa hàng, kho, xưởng rang, văn phòng (M02) | `src/utils/enums/role.enum.ts:27-37` |
| Chủ thể nhận quyền | `USER`, `ORGANIZATION` (kế thừa) | Chỉ `USER` | `src/utils/enums/role.enum.ts:41-53` |
| Phạm vi | `TENANT`, `PROJECT`, `DATA_ROOM`, `TRANSACTION` | `PLATFORM` (UUID nil), `LOCATION` | `sql-docs/migrations/01_identity_rbac_audit.sql:100-167` |
| Vai trò | 25 mã | 9 nhóm: `EXECUTIVE`, `CHIEF_ACCOUNTANT`, `ASSET_ACCOUNTANT`, `ASSET_MANAGER`, `LOCATION_MANAGER`, `LOCATION_STAFF`, `TECHNICIAN`, `AUDITOR`, `SYSTEM_ADMIN` | Blueprint dòng 185-199 |
| Thu hồi | Xoá dòng | Đóng hiệu lực kèm `revoked_by`, `revoke_reason`; trigger chặn sửa | `sql-docs/migrations/01_identity_rbac_audit.sql:116-120,138-156,313-365` |
| Khoá tài khoản | Hiệu lực ở đăng nhập, làm mới, route có `@RequireContext` | Guard đọc `user_profiles` mỗi request; BR-IAM-04 đòi mất quyền ngay | `sql-docs/migrations/01_identity_rbac_audit.sql:47-52`; Blueprint dòng 364 |
| Trạng thái | `ACTIVE`, `INVITED`, `SUSPENDED`, `INACTIVE` | `ACTIVE`, `SUSPENDED`, `DEACTIVATED` | `sql-docs/migrations/01_identity_rbac_audit.sql:80-85` |

Đường dẫn trong bảng này tính từ gốc repo EH-AM `c:\Users\Admin\development\everyhalf\eh_am_backend`.

### 8.2. Nên giữ nguyên

1. Một lệnh "Thêm người dùng": UI có thể chia bước, nhưng server nhận một request và ghi hồ sơ trong một lần. Với EH-AM, phần ghi `user_profiles`, vai trò ban đầu và dòng audit nên đi chung một hàm Postgres qua `rpc()`; phần tạo tài khoản Auth thì có bù trừ khi lỗi (FDI có bù trừ ở đăng ký, thiếu ở tạo nhân viên).
2. Kiểm mọi id do client gửi ở service (location, cấp trên, người được gán), trả 404 khi không thuộc phạm vi.
3. Ba trục tách biệt: chức danh để hiển thị, cấp trên để vẽ sơ đồ, vai trò × location để phân quyền. Ghi rõ trên UI rằng sơ đồ tổ chức không cấp quyền.
4. Danh mục vai trò trong code, trả qua API, có `assignable`; `SYSTEM_ADMIN` chỉ cấp qua script (EH-AM đã có).
5. Vai trò có ngày bắt đầu, ngày kết thúc và nhãn Sắp hiệu lực, Đang hiệu lực, Đã hết hiệu lực; ô "Hiệu lực đến" hiểu là hết ngày đã chọn, nhưng tính theo `Asia/Ho_Chi_Minh`, không theo UTC.
6. Chống vòng cấp trên bằng CHECK cộng kiểm ở service; `ON DELETE SET NULL` cho `manager_id`.
7. Khoá lạc quan bằng `version` và quy ước `null` khác `undefined` cho `PATCH` hồ sơ.
8. Không xoá người dùng; nghỉ việc là chuyển trạng thái; email không sửa trên màn hình thường.
9. Sơ đồ tổ chức chỉ để xem, dựng lại từ dữ liệu, có ô tìm, chọn số cấp, mở và gập nhánh, thẻ "Chưa gắn đơn vị" để lộ lỗi dữ liệu.
10. Bảng người dùng tìm theo tên, email, mã nhân viên; lọc theo trạng thái; thêm lọc theo location và vai trò (F-IAM-07).

### 8.3. Nên đơn giản hoá hoặc làm khác

1. Bỏ hai tầng tenant và pháp nhân, bỏ phân loại 16 nhóm và bước "Pháp nhân & nhóm" của wizard. Đơn vị gốc là location; bước đầu của wizard trở thành "Đơn vị công tác".
2. Bỏ chủ thể `ORGANIZATION` và cơ chế quyền kế thừa theo tổ chức (EH-AM đã chỉ cho `USER`).
3. Thay việc quản trị viên đặt mật khẩu bằng lời mời qua email (F-IAM-03): tài khoản ở trạng thái chờ kích hoạt cho tới khi nhân viên tự đặt mật khẩu; lời mời có hạn và gửi lại được. Cần một migration thêm trạng thái chờ kích hoạt vào CHECK hiện có. Hàm tạo lời mời của Supabase cần kiểm lại theo phiên bản supabase-js đang dùng.
4. Khoá hoặc ngừng tài khoản phải có lý do do người dùng nhập, ghi audit, có hiệu lực ở request kế tiếp (BR-IAM-04, guard EH-AM đã đọc hồ sơ mỗi request), và thu hồi phiên của người đó.
5. Khi ngừng tài khoản: đóng hiệu lực mọi vai trò đang mở trong cùng thao tác, dùng lại lý do quản trị viên đã nhập; liệt kê tài sản người đó đang chịu trách nhiệm để giao lại (BR-AST-09). Có chặn ngừng khi chưa giao lại tài sản hay không là câu hỏi cho Every Half.
6. Chốt an toàn mà FDI thiếu: không tự khoá mình; không khoá hoặc ngừng `SYSTEM_ADMIN` cuối cùng; người không phải `SYSTEM_ADMIN` không đổi được trạng thái của `SYSTEM_ADMIN`.
7. Lệnh ghép phải kiểm quyền của từng phần: nếu màn hình tạo người dùng cho gán vai trò ban đầu, server kiểm cả quyền tạo tài khoản lẫn quyền gán từng vai trò trên từng location (bài học 7.2 mục 7).
8. Tạo người dùng với email đã có thì trả 409, không ghi đè; muốn chạy lại an toàn thì dùng khoá idempotency (bài học 7.2 mục 8).
9. Phòng ban là danh mục nhỏ ở M02 (chỉ cho location loại văn phòng), không phải chữ tự do. Chức danh giữ chữ tự do vì chỉ để hiển thị.
10. Danh sách chọn cấp trên và người được gán vai trò chỉ gồm người đang hoạt động; vai trò theo location chỉ gán trên location đang hoạt động (BR-IAM-08).
11. Không lưu ảnh đại diện (FDI có cột nhưng không có luồng ghi) và không lưu thuộc tính ABAC dạng JSONB trên hồ sơ.
12. Trên sơ đồ, thẻ phải có dấu hiệu Tạm khoá hoặc Đã ngừng; người đã ngừng không nằm giữa cây mà chuyển vào nhóm riêng.
13. Nhật ký sửa hồ sơ dùng `diffFields` với allow-list, không ghi cả bản ghi; khoá ngoại tới người thực hiện không `ON DELETE CASCADE` (FDI làm mất nhật ký khi xoá người).

### 8.4. Trường hồ sơ nhân viên nên có

| Trường | Đã có trong migration 01 của EH-AM | Đề xuất | Lý do |
| --- | --- | --- | --- |
| Email công việc (ở `auth.users`) | Có | Bắt buộc, duy nhất, là tên đăng nhập; đổi qua quy trình riêng có audit | FDI không cho sửa, phải nhờ hỗ trợ |
| `display_name` | Có | Bắt buộc, từ 2 ký tự | Tên trên biên bản, lịch sử tài sản |
| `employee_code` | Có (in hoa, 2 đến 30 ký tự, duy nhất) | Tuỳ chọn, nên có | Tìm kiếm, đối chiếu với hệ thống nhân sự |
| `phone` | Có | Tuỳ chọn, kiểm định dạng số Việt Nam | Liên lạc khi mất mật khẩu; FDI không kiểm định dạng |
| `job_title` | Có | Tuỳ chọn, chỉ hiển thị | Không dùng để phân quyền |
| `preferred_locale` | Có | Giữ | |
| `status` | Có | Giữ, thêm trạng thái chờ kích hoạt nếu làm lời mời qua email | FDI có `INVITED` nhưng không có luồng |
| Đơn vị công tác chính (`home_location_id`) | Chưa | Khoá ngoại tới location của M02; nên bắt buộc với Nhân viên điểm | Gốc của sơ đồ; khác với phạm vi quyền |
| Phòng ban (`department_id`) | Chưa | Khoá ngoại tới danh mục phòng ban của M02, chỉ cho văn phòng | Thay cho chữ tự do của FDI |
| Cấp trên trực tiếp (`manager_id`) | Chưa | Tuỳ chọn; tự tham chiếu; khác chính mình; không vòng; chỉ chọn người đang hoạt động | Sơ đồ, luồng duyệt theo cấp nếu Every Half cần |
| Loại hình làm việc | Chưa | Tuỳ chọn; danh sách cần Every Half xác nhận | FDI dùng 5 giá trị |
| Ngày vào làm | Chưa | Tuỳ chọn | |
| Ngày ngừng, lý do ngừng | Chưa (lý do có thể chỉ nằm ở audit) | Nên có để đo KPI "thời gian từ khi nghỉ tới khi khoá" | KPI M01, Blueprint dòng 345 |
| `version` | Chưa | Thêm để khoá lạc quan | Nhiều quản trị viên sửa cùng lúc |
| `created_by`, `created_at`, `updated_at` | Có | Giữ | |

Không đề xuất lưu CCCD, ngày sinh, địa chỉ nhà hay ảnh chân dung. Mức tối thiểu dữ liệu cá nhân cần `voltagent-research:research-analyst` kiểm chứng theo quy định bảo vệ dữ liệu cá nhân hiện hành (bước 5 trong `CLAUDE.md`).

### 8.5. Sơ đồ tổ chức cho EH-AM

- Gốc là loại location (Văn phòng, Xưởng rang, Kho, Cửa hàng), rồi từng location, rồi người theo `manager_id`; trong văn phòng có thể nhóm thêm theo phòng ban.
- Quan hệ báo cáo chỉ là thông tin. Quyền xem tài sản vẫn theo vai trò × location (BR-CMN-03), không theo vị trí trên cây.
- Cơ cấu chuỗi cà phê khá nông, nên không cần giới hạn số cấp; công cụ chọn số cấp chỉ để trình bày.
- Every Half có cần sơ đồ ở GĐ1 hay chỉ cần danh sách người dùng theo location là câu hỏi mở; không tìm thấy yêu cầu sơ đồ trong Blueprint (tìm "sơ đồ" trong mục M01 dòng 338-372 không có).

### 8.6. Luồng tạo tài khoản đề xuất (cần duyệt)

| Bước | Ai | Thông tin | Kết quả |
| --- | --- | --- | --- |
| 1. Nhập hồ sơ | Quản trị hệ thống | Họ tên, email công việc, mã NV, điện thoại, chức danh, đơn vị công tác chính, phòng ban (nếu là văn phòng), cấp trên, ngày vào làm, ngôn ngữ | Chưa gọi API |
| 2. Vai trò ban đầu (tuỳ chọn) | Quản trị hệ thống | Vai trò × phạm vi (toàn hệ thống hoặc từng location) × hiệu lực từ, đến, lý do | Chưa gọi API |
| 3. Gửi | Hệ thống | Một request | Tài khoản chờ kích hoạt, hồ sơ, dòng vai trò, dòng audit; email mời |
| 4. Kích hoạt | Nhân viên | Mật khẩu mới theo BR-IAM-06 | Trạng thái chuyển sang Đang hoạt động, có audit |
| 5. Lời mời hết hạn | Quản trị hệ thống | Gửi lại | Lời mời mới, lời mời cũ vô hiệu |

## 9. Danh sách file đã đọc

Backend FDI Today (`C:\Users\Admin\development\fdi_today_backend`):

- `C:\Users\Admin\development\fdi_today_backend\src\iam\dto\create-user-account.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\dto\assign-context-role.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\dto\create-organization.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\dto\classify-organization.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\dto\verify-classification.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\iam.controller.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\iam.service.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\iam.service.spec.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\iam\iam.module.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\workspace\dto\query-members.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\workspace\dto\update-member.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\workspace\workspace.controller.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\workspace\workspace.service.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\workspace\workspace.module.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\dto\register-tenant.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\dto\assign-tenant-admin.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\dto\change-tenant-status.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\dto\create-tenant.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\dto\query-tenants.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\dto\update-tenant.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\tenant-registration.controller.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\tenant.controller.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\tenant.service.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\tenant\tenant.module.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\identity\identity.controller.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\identity\identity.service.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\identity\identity.module.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\auth.controller.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\auth.service.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\auth.interface.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\types.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\dto\login.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\dto\admin-login.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\dto\password.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\dto\refresh-token.dto.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\decorators\context-permission.decorator.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\guards\admin.guard.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\guards\jwt-auth.guard.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\auth\guards\permission.guard.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\utils\enums\workspace.enum.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\utils\enums\role.enum.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\utils\enums\iam.enum.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\utils\enums\tenant.enum.ts`
- `C:\Users\Admin\development\fdi_today_backend\src\utils\utils.ts` (các hằng mật khẩu, slug, `isAdmin`)
- `C:\Users\Admin\development\fdi_today_backend\src\supabase\database.types.ts` (bảng `users`, `organizations`, `organization_classifications`, `tenants`, `context_role_assignments`, `iam_audit_logs`)
- `C:\Users\Admin\development\fdi_today_backend\src\supabase\supabase.define.ts` (tên bảng)
- `C:\Users\Admin\development\fdi_today_backend\src\forum\dto\forum-moderator-account.dto.ts` (đoạn trạng thái)
- `C:\Users\Admin\development\fdi_today_backend\src\forum\forum-moderator-account.service.ts` (đoạn thu hồi phiên)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\02_tenants_va_user_groups.sql`
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\03_organizations_va_users.sql`
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\04_iam_va_audit.sql`
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\05_seed_taxonomy.sql` (seed loại tổ chức con)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\90_verify_schema.sql` (danh sách cột `users`)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\99_bootstrap_super_admin.sql` (phần đầu)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\setup-lan-dau\forum\184_forum_gate3_kiem_duyet_khieu_nai_development.sql` (phần đầu)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\m04\354_m04_g1_tai_khoan_chien_luoc_development.sql` (bảng `sa_role_assignments`)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\m04-dot2\374_m04_h1_doi_ngu_tai_khoan_development.sql` (phần đầu)
- `C:\Users\Admin\development\fdi_today_backend\sql-docs\m09\400_m09_g1_hotfix_thanh_vien_cung_tenant_nguoi_dung_development.sql` (phần đầu)
- `C:\Users\Admin\development\fdi_today_backend\supabase\` (chỉ có `.temp`, không có migration)
- `C:\Users\Admin\development\fdi_today_backend\business\docs\tenant\tenant-vs-organization.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\user_group\usergroup-organization-relationship.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\user_group\user_group.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\user_group\context_base.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\architecture\01-bao-mat-va-guard.md` (mục 5 đến 7, 12)
- `C:\Users\Admin\development\fdi_today_backend\business\docs\architecture\02-iam-va-phan-quyen.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\architecture\03-workspace-nhan-su.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\architecture\33-phien-dang-nhap-va-lam-moi-token.md` (phần đầu)
- `C:\Users\Admin\development\fdi_today_backend\business\docs\use-guide\tai-khoan-va-mat-khau-huong-dan-su-dung-va-test.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\use-guide\hdsd\01_hdsd_dangkydangnhap.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\use-guide\hdsd\05_hdsd_taotaikhoannhanvien.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\use-guide\hdsd\06_hdsd_danhsachnhansu.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\use-guide\hdsd\07_hdsd_sodotochuc.md`
- `C:\Users\Admin\development\fdi_today_backend\business\docs\use-guide\hdsd\08_hdsd_phanquyen.md`

Frontend FDI Today (`C:\Users\Admin\development\fdi_today_frontend`):

- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\AddMemberWizard.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\MemberFormDialog.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\MemberManagementPage.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\MemberTableView.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\MemberDetailPage.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\MemberBadges.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\memberDisplay.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\OrgChartView.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\OrgChartNodes.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\orgChartLayout.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\PermissionsPage.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\AssignRoleDialog.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\WorkspaceLayout.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\WorkspaceInfoPage.tsx` (phần đầu và chỗ quyền duyệt)
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\CreateOrganizationDialog.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\workspace\workspace.hooks.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\auth\authorization.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\auth\RegisterPage.tsx` (schema và hàm gửi)
- `C:\Users\Admin\development\fdi_today_frontend\src\features\profile\ProfilePage.tsx`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\tenant\tenant.hooks.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\features\tenant\CreateTenantDialog.tsx` (các trường)
- `C:\Users\Admin\development\fdi_today_frontend\src\lib\password.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\lib\api\types.ts` (kiểu nhân sự, quyền, capabilities)
- `C:\Users\Admin\development\fdi_today_frontend\src\lib\api\client.ts` (đoạn gắn header)
- `C:\Users\Admin\development\fdi_today_frontend\src\lib\api\endpoints\workspace.api.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\lib\api\endpoints\iam.api.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\lib\api\endpoints\tenant.api.ts`
- `C:\Users\Admin\development\fdi_today_frontend\src\router.tsx` (route `/organization/*`, `/tenants`)
- `C:\Users\Admin\development\fdi_today_frontend\src\i18n\locales\vi\common.json` (khoá `workspace.*`)

Thư mục `C:\Users\Admin\development\Fditoday`: chỉ có `branding/` và `business/FDITODAY.COM V3.0/` (diễn đàn, sự kiện, tin tức, mạng chuyên gia). Tìm `manager_id|reports_to|department|employee|org chart|sơ đồ tổ chức|phòng ban|nhân viên` trong các tệp `.sql` và `.md` không có kết quả, nên không có nội dung liên quan.

EH-AM (đọc để đối chiếu mục 8, `c:\Users\Admin\development\everyhalf\eh_am_backend`):

- `c:\Users\Admin\development\everyhalf\eh_am_backend\src\utils\enums\role.enum.ts`
- `c:\Users\Admin\development\everyhalf\eh_am_backend\src\utils\enums\audit-event.enum.ts`
- `c:\Users\Admin\development\everyhalf\eh_am_backend\sql-docs\migrations\01_identity_rbac_audit.sql` (bảng `user_profiles`, `context_role_assignments`)
- `c:\Users\Admin\development\everyhalf\eh_am_backend\business\product-docs\product-manager\EveryHalf_AM_Master_Blueprint_v1.0.md` (mục 8 và 14.1)
