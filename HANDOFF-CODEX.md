# Bàn giao cho Codex — Every Half Asset Management (EH-AM)

> Tài liệu này để **ChatGPT Codex tiếp tục code** khi hết quota Claude. Nó gói toàn bộ luật làm việc, quy trình, và cách đọc source từ lúc bắt đầu dự án tới nay. Đọc hết mục 0→10 trước khi gõ dòng code đầu tiên.
>
> Các skill/plugin của Claude (superpowers, ecc, voltagent, humanizer, frontend-design, ui-ux-pro-max, taste-skill…) đã được cài vào marketplace và **bật sẵn bên Codex** — hãy **gọi đúng skill** ở mỗi bước (như bảng mục 3.2). Phần "việc làm tay" kèm theo mỗi skill là để hiểu **ý đồ + kết quả cần ra**, dùng khi skill không tiện gọi.

## 0. Đọc gì trước (10 phút)

1. File này (toàn bộ).
2. `CLAUDE.md` (repo backend) và `../eh_am_frontend/CLAUDE.md` — luật kiến trúc + "Chuẩn UI bắt buộc".
3. `docs/superpowers/notes/2026-09-30-phan-moi-frontend-va-trien-khai.md` — nhật ký triển khai chi tiết theo thời gian (nguồn tiến độ chính).
4. `sql-docs/README.md` — bảng migration + trạng thái đã chạy.
5. UC kế tiếp: `business/product-docs/product-usecase/M02-danh-muc-nen/UC-MDM-05_cap-nhat-danh-muc-nha-cung-cap.md`.

## 1. Bức tranh tổng thể

- **2 repo:** `eh_am_backend` (NestJS 11, TS 5.7, Supabase, Node 22, **cổng 3006**) và `eh_am_frontend` (React 19, Vite, TanStack Router/Query/Table, Tailwind 4, shadcn, Zustand, Zod, i18next, **cổng 5175 strictPort**). Backend CORS chỉ cho 5175.
- **Supabase**: dùng `service_role` (bỏ qua RLS) → **biên bảo mật do code tự thực thi** (scope location). Migration = file SQL đánh số, **chạy tay** trong Supabase SQL Editor theo thứ tự, rồi `npm run gen:types`.
- **Sản phẩm**: quản lý tài sản & CCDC cho chuỗi Every Half (cửa hàng/kho/xưởng rang/văn phòng). 12 module (M01–M12), MVP1 có 83 UC đã viết.

## 2. Câu chuyện dự án (timeline)

1. Brief 1 trang của khách → **Master Blueprint** (`business/product-docs/product-manager/`).
2. Blueprint → **83 use case** (`business/product-docs/product-usecase/`, theo mẫu 13 trường).
3. **Frontend design system** (Yêu cầu 1, làm một lượt): nhận diện thương hiệu everyhalf.vn (đơn sắc ấm "mực trên giấy"), design token (`src/styles/theme.css`), common component, tài liệu ở `eh_am_frontend/business/product-docs/product-design/`.
4. **Triển khai từng UC** (Yêu cầu 2, step-by-step): mỗi UC → viết kế hoạch kỹ thuật (BE + FE) → code theo TDD → Duy manual test → mới sang UC kế.
5. **Đang ở đây:** M02 (danh mục nền) gần xong. Xem mục 8.

## 3. Bộ quy tắc làm việc BẮT BUỘC

### 3.1 Nhịp làm việc (Yêu cầu 3) — QUAN TRỌNG NHẤT
- **Step-by-step, một UC một lần.** Xong 1 UC (code + kiểm chứng) → **Duy manual test và xác nhận OK** → mới sang UC kế. **Không tự nhảy UC.**
- Không thêm module nghiệp vụ vào `app.module.ts` khi UC chưa được duyệt.
- Tránh over-engineering, đừng nhồi nhiều thứ. Làm **đúng và sát nhất** với file UC. UC nào mở rộng/sửa flow thì **cập nhật lại file tài liệu liên quan**.

### 3.2 Quy trình mỗi UC (Yêu cầu 2)
Với mỗi mã UC, tạo thư mục ở **cả hai repo**: `business/product-docs/product-implementation/<Mã UC>/`.

| Bước | Ý đồ (skill gốc) | Việc Codex làm tay |
| --- | --- | --- |
| 1. Đọc UC | — | Đọc file UC ở `product-usecase/`, nắm luồng chính/thay thế (AC), ngoại lệ (EX), hậu điều kiện |
| 2. Kế hoạch kỹ thuật | `ecc:plan` + `tdd-workflow` | **BE:** viết `README.md` (mô tả technical, sơ đồ mermaid luồng/sequence/state, UML data flow, bảng/RPC/migration, guard/scope/audit, kế hoạch test TDD). **FE:** viết `README.md` (chỉ mô tả tính năng FE, luồng màn, component, API, ánh xạ lỗi→UI) |
| 2b. Thiết kế UI (**chỉ FE, BẮT BUỘC trước khi code**) | `frontend-design`, `ui-ux-pro-max`, `taste-skill` | Viết `DESIGN-README.md`: **wireframe ASCII** cho từng page/dialog/form, kèm token, các trạng thái (tải/rỗng/lỗi/xung đột phiên), responsive, a11y. Mẫu: `eh_am_frontend/.../UC-MDM-01/DESIGN-README.md` |
| 3. Triển khai | dev flow ecc: implement→review→verify | Code theo **TDD** (viết test đỏ trước → code cho xanh). Xem mục 4 |
| 4. Review | `ecc:typescript-reviewer`, `database-reviewer`, `security-reviewer` | Tự rà: kiểu, truy vấn SQL, biên bảo mật (scope + audit) |
| 5. Kiểm chứng | `verification-before-completion` | Chạy đủ lệnh ở mục 10, **đọc output thật** trước khi báo xong |

### 3.3 Văn phong nội dung hiển thị (thay skill `humanizer`)
Mọi chữ hiển thị (i18n vi + en) phải tự nhiên như người viết nội dung viết, không lên giọng máy. Nhãn ngắn gọn; câu dài đọc mượt. Viết ở **góc độ người dùng** đang thao tác.

## 4. Thứ tự chuẩn: từ UC → code (checklist TDD)

1. Đọc UC. Liệt kê AC + EX cần phủ.
2. Viết plan BE `README.md` + (FE) `README.md` + `DESIGN-README.md`.
3. Thiết kế bảng/RPC nếu cần → **viết migration SQL mới đánh số** (xem mục 7). Nhờ Duy chạy, hoặc thêm tay type vào `database.types.ts` để code compile trước (xem mục 7).
4. **RED:** viết unit test (`*.spec.ts` BE / `*.test.ts(x)` FE) mô tả hành vi, chạy cho **fail đúng lý do**.
5. **GREEN:** viết code tối thiểu cho test xanh (repository → service → model/controller).
6. **REFACTOR** giữ test xanh.
7. Kiểm chứng đầy đủ (mục 10). Cập nhật doc tiến độ (`docs/superpowers/notes/...` + `README.md` UC + `sql-docs/README.md`).
8. **Dừng, chờ Duy manual test.** Không commit trừ khi Duy yêu cầu.

## 5. Đọc source BACKEND từ đầu

Kiến trúc kế thừa `Avantily`. Đọc `CLAUDE.md` mục "Kiến trúc" trước. Điểm cốt lõi:

- **Phân tầng:** `repository (extends BaseRepository, chỉ nó dùng this.db) → service (quy tắc nghiệp vụ + kiểm scope + ghi audit) → model (mapper toXxxModel camelCase, không trả thẳng row DB)`. **Không có hàm xoá** — "xoá" = đổi status + lý do + audit.
- **Ghi + audit nguyên tử:** supabase-js không có transaction nhiều lệnh → dùng **hàm Postgres plpgsql gọi qua `rpc()`** (ghi dòng nghiệp vụ + audit trong 1 transaction). `changes` dựng ở TS bằng `diffFields(before, after, allowList)` (trả `{field:{from,to}}` hoặc null=không đổi).
- **Khoá lạc quan:** cột `version`, update `where version=?`, lệch → `RECORD_VERSION_CONFLICT`.
- **Guard:** `@UseGuards(JwtAuthGuard, PermissionsGuard)` + `@RequireContext({roles, contextType})` ở cấp class. Module tự `imports: [SupabaseModule, SupabaseJwtModule]`.
- **Lỗi/i18n:** `throw new AppException(ErrorCode.X)`; HTTP status khai trong `ERROR_DEFINITIONS` (`src/common/i18n/error-code.const.ts`), **mỗi mã phải có vi + en** (`satisfies` ép đủ). FE phân nhánh theo `code`, không theo message.
- **Bảng:** đăng ký ở `SupabaseTable` (`src/supabase/supabase.define.ts`), truyền literal vào `.from()`.
- **Mẫu để copy:** module `src/master-data/` (đủ 5 danh mục). Copy `cost-center*` cho danh mục đơn giản, `asset-type*` nếu cần cây/nhiều RPC.

**Đọc theo thứ tự file:** `src/bootstrap.ts` → `src/common/repository/base.repository.ts` → `src/common/i18n/error-code.const.ts` → `src/master-data/cost-centers.service.ts` + `.repository.ts` + `.controller.ts` + `cost-center.model.ts` → `sql-docs/migrations/02d_cost_center_rpc.sql`.

## 6. Đọc source FRONTEND từ đầu

Đọc `eh_am_frontend/CLAUDE.md` toàn bộ, đặc biệt **"Chuẩn UI bắt buộc"** (10 chuẩn — áp cho MỌI màn):
1. Bọc `<Header>` + `<Main>`. 2. Full tiếng Việt + `<RequiredMark/>` (sao đỏ) ô bắt buộc. 3. Dialog rộng `sm:max-w-2xl`. 4. Trạng thái rỗng có nút hành động. 5. `AddressPicker` cho địa chỉ VN. 6. Chip gợi ý mã. 7. Văn phong i18n tự nhiên. 8. Cursor theo trạng thái + a11y (`aria-busy`, label, focus trap…). 9. `LinkButton` cho action phụ, nút chính `size='lg'` `min-w-32`. 10. **Enum DB → i18n**, không show mã thô; mã người dùng nhập → `CodeText`.

- **Kiến trúc:** route file-based (`src/routes/`, `routeTree.gen.ts` do Vite sinh — đừng sửa) render mỏng, gọi `src/features/<feature>/`. API ở `src/lib/api/` (`*.api.ts` mỏng + `*.queries.ts` queryOptions + `error-code.ts` mirror của backend). i18n `vi.ts` (nguồn) + `en.ts` (typed, thiếu khoá = lỗi compile).
- **Mẫu để copy:** `src/features/master-data/{locations,cost-centers,departments,reason-codes,asset-types}/` — mỗi feature: `*-schema.ts`(+test), `*-columns.tsx`, `*-form-dialog.tsx`, `*-page.tsx`. Ngừng dùng chung `deactivate-catalog-dialog.tsx`.

## 7. Ràng buộc CỨNG (không được vi phạm)

1. **KHÔNG sửa migration đã chạy.** Sai thì viết **migration mới đánh số** để vá. Idempotent, bật RLS, trigger `updated_at`, không FK on-delete lên cột người thực hiện của bảng lịch sử.
2. **Sinh types:** luôn `npm run gen:types`. **KHÔNG** dùng `>` redirect trong PowerShell 5.1 (hỏng UTF-16). Khi migration chưa chạy mà cần code compile: được **sửa tay `src/supabase/database.types.ts`** (thêm Functions/Tables theo đúng style, alphabetical) — Duy đã cho phép; file này bị loại khỏi lint/tsc và sẽ bị `gen:types` ghi đè khi chạy migration thật.
3. **KHÔNG hardcode credential.** Smoke đọc env `SMOKE_ADMIN_EMAIL` / `SMOKE_ADMIN_PASSWORD`. Không đưa token/URL đã ký/GPS chi tiết vào audit.
4. **KHÔNG bịa dữ liệu** (số liệu, phường/xã, quy định kế toán…). Thiếu thì ghi TODO/hỏi.
5. **`reason` audit do người dùng nhập**, không tự bịa.
6. **KHÔNG commit** trừ khi Duy yêu cầu. Cổng dev BE **3006** (không dùng 3005), FE **5175**.
7. **Comment tiếng Việt lối "⚠️ vì sao"**; code (tên biến/hàm) tiếng Anh; tài liệu tiếng Việt.

## 8. Tiến độ hiện tại

**Xong (BE code + FE, chờ/đã manual test):** M01 auth UC-IAM-01/02/03/04 (đối chiếu + vá nhỏ TDD); M02: UC-MDM-01 (location), 03 (cost center + **ngừng AC.2**), 04 (**cây loại tài sản**), 07 (lý do + **ngừng AC.2**), 08 (phòng ban).

**Migration đã viết:** 01, 02, 02b–02j. `02i`/`02j` (asset_types) **cần xác nhận đã chạy + gen:types + smoke lại** (lần chạy gần nhất phần cây loại tài sản trả 500 vì chưa chạy).

**Đang treo (chờ phụ thuộc):** UC-MDM-02 đóng location (cần M03 tài sản); ngừng phòng ban (cần `user_profiles.department_id`/UC-IAM-05); kiểm tài sản khi ngừng cost center/loại tài sản (M03); UC-IAM-05 thêm nhân viên (cần migration 03 + 9 vai trò blueprint).

**KẾ TIẾP:** **UC-MDM-05 (nhà cung cấp)** → UC-MDM-06 (đơn vị sửa chữa) → UC-IAM-05.

## 9. Công thức làm UC-MDM-05 (nhà cung cấp) — bám sát mẫu

1. Đọc `UC-MDM-05_cap-nhat-danh-muc-nha-cung-cap.md` + blueprint §14.2 để lấy đúng trường của bảng `suppliers`.
2. Viết `02k_suppliers.sql` (bảng `suppliers` + RLS + trigger, có `version`, `status`, mã chuẩn hoá upper/trim duy nhất) và `02l_supplier_rpc.sql` (`create_supplier`/`update_supplier`/`deactivate_supplier`, audit nguyên tử). Đăng ký `SUPPLIERS` vào `SupabaseTable`.
3. Thêm tay type vào `database.types.ts` (để compile trước khi Duy chạy migration).
4. BE: copy `cost-center*` → `supplier*` (dto/model/repo/service/controller/spec). Endpoint `/v1/master-data/suppliers`. Audit `mdm.supplier.*`. Mã lỗi tái dùng (`DUPLICATE_RECORD`, `RECORD_VERSION_CONFLICT`, `CATALOG_ITEM_IN_USE`).
5. FE: viết `DESIGN-README.md` trước → copy feature `cost-centers/` → `suppliers/` (schema+test, columns, form-dialog, page) + route + nav + i18n (vi+en) + ngừng dùng `DeactivateCatalogDialog`.
6. Seed vào `tools/smoke-master-data.mjs`. Kiểm chứng (mục 10). Cập nhật doc. Dừng chờ Duy.

## 10. Chạy & kiểm chứng

**Backend** (trước khi báo xong): `npm run format && npx tsc --noEmit && npx eslint src test && npm test`. Dev: `npm run start:dev` (cổng 3006). Health: `curl http://localhost:3006/health`.

**Frontend:** `npm run typecheck && npm run lint && npm test` và `npx vite build`. Dev: `npm run dev` (5175). (Cảnh báo cố hữu 1/dòng bảng của TanStack `useReactTable` react-hooks — không phải lỗi, eslint vẫn exit 0.)

**Smoke + seed M02** (server 3006 đang chạy):
```powershell
$env:SMOKE_ADMIN_EMAIL='admintaisan@everyhalf.vn'; $env:SMOKE_ADMIN_PASSWORD='<pass>'; node tools/smoke-master-data.mjs
```
(Đăng nhập `/auth/login` trả **201**; script chỉ cần `session.access_token`.)

**Ghi chú:** nếu chạy trong Claude Code có plugin `ecc`, hook **GateGuard** chặn lệnh Bash đầu tiên + Edit/Write lần đầu mỗi file (phải nêu "facts"). Tắt: `ECC_GATEGUARD=off`. Codex/ChatGPT không có hook này.
