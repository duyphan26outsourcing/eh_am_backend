# CLAUDE.md

File này hướng dẫn Claude Code (claude.ai/code) khi làm việc với code trong repository này.

## Dự án

`eh_am_backend` là API cho hệ thống quản lý tài sản & CCDC của Every Half, phục vụ cửa hàng, kho, xưởng rang (roastery) và văn phòng. Stack: NestJS 11, TypeScript 5.7, Supabase (Postgres + Auth + Storage), Node 22. Frontend nằm ở repo riêng `eh_am_frontend` (Vite, `http://localhost:5175`).

**Trạng thái hiện tại:** mới có phần hạ tầng (auth, RBAC theo phạm vi, audit, lỗi/i18n, giới hạn tần suất). Các module nghiệp vụ (tài sản, QR & kiểm kê, điều chuyển, bảo trì, thanh lý, khấu hao, đồng bộ kế toán FAST, dashboard) **cố ý chưa làm**, chờ Master Blueprint trong `business/product-docs/product-manager/` được duyệt. Không thêm module nghiệp vụ vào `app.module.ts` khi module đó chưa có đặc tả được duyệt. Danh mục vai trò (`src/utils/enums/role.enum.ts`) và các mã audit `ASSET_*` đang là bản tạm. `src/supabase/database.types.ts` là bản viết tay, sẽ bị `npm run gen:types` ghi đè khi có project Supabase.

Comment trong code viết tiếng Việt theo lối "⚠️ vì sao": mỗi quyết định kèm theo lỗi mà nó chặn. Đọc comment đầu file trước khi sửa file đó, và viết comment mới theo cùng lối.

## Quy ước ngôn ngữ

- **Tài liệu viết tiếng Việt**: blueprint, use case, README, CLAUDE.md, spec, plan…, kể cả khi skill mặc định tiếng Anh. Ví dụ `use-case-writer` quy định output English, dự án này vẫn viết tiếng Việt và giữ nguyên 13 trường cùng checklist 20 điểm. Thuật ngữ kỹ thuật thông dụng (API, QR, cost center, audit…) giữ tiếng Anh.
- **Code viết tiếng Anh**: tên biến, hàm, class, file. Chỉ comment giải thích dùng tiếng Việt.
- Nội dung hiển thị cho người dùng (bản `vi` trong i18n) vẫn là tiếng Việt. Code cũ còn vài tên và log tiếng Việt (ví dụ `MOT_PHUT`); không tự refactor khi chưa được yêu cầu.

## Tài liệu sản phẩm (`business/product-docs/`)

| Thư mục | Nội dung |
| --- | --- |
| `product-manager/` | Master Blueprint, một file `.md`. Khung mục theo *FDI Today Master Blueprint All-In-One 5.0* (`C:\Users\Admin\development\fdi_today_backend\business\docs\original_owner_sent\FDI_Today_Master_Blueprint_All_In_One_5.0.docx.pdf`). Nguồn yêu cầu là brief Every Half gửi (`EVERY HALF — PHẦN MỀM QUẢN LÝ TÀI SẢN-2.docx`, nằm ngoài repo). Viết Markdown GFM thuần để dán sang Lark rồi xuất PDF: không HTML, không Mermaid. |
| `product-usecase/` | Use case cho từng tính năng của từng module trong blueprint, theo mẫu 13 trường và checklist 20 điểm của `use-case-writer`. |

### Skill bắt buộc khi soạn hoặc cập nhật tài liệu sản phẩm

Làm mới hoặc sửa lớn tài liệu nào thì dùng **đủ** bộ skill/agent của tài liệu đó. Muốn bỏ hoặc thay một skill thì hỏi Duy trước. Plugin cần có: `superpowers@superpowers-dev`, các plugin `voltagent-*` (`voltagent-biz@voltagent-subagents` và các nhóm research, qa-sec cùng nguồn) và `humanizer`.

**Master Blueprint (`product-manager/`)**

| Bước | Bắt buộc dùng | Để làm gì |
| --- | --- | --- |
| 1. Làm rõ yêu cầu và thiết kế | `superpowers:brainstorming` | Chốt cách hiểu, hướng làm và thiết kế với Duy; viết spec |
| 2. Khai thác yêu cầu | Skill ở thư mục `product-discovery/` (tên trong SKILL.md là `ask-why-ba`; chưa đăng ký như skill cài sẵn nên đọc thẳng `SKILL.md` và `references/`) | 5 tầng yêu cầu BABOK, bảng biết/chưa biết, nguyên nhân gốc, tình huống biên, giả định, câu hỏi mở |
| 3. Lập kế hoạch | `superpowers:writing-plans`, chạy trong plan mode `/plan` | Kế hoạch từng bước có bước kiểm chứng |
| 4. Góp ý chuyên môn | `voltagent-biz:product-manager`, `voltagent-biz:project-manager`, `voltagent-biz:scrum-master` | Giá trị, ưu tiên, MVP, KPI · lộ trình, cổng kiểm soát, RAID, go-live · nhịp sprint, DoR/DoD, kế hoạch phát hành |
| 5. Kiểm chứng dữ kiện | `voltagent-research:research-analyst` | Quy định kế toán Việt Nam về TSCĐ và CCDC, luật bảo vệ dữ liệu cá nhân (GPS, ảnh), khả năng tích hợp của FAST |
| 6. Xếp hạng giả định | `voltagent-biz:assumption-mapping` | Chọn ra giả định rủi ro nhất để Every Half xác nhận trước |
| 7. Thực thi | `superpowers:executing-plans` | Viết theo kế hoạch đã duyệt |
| 8. Soát văn | `humanizer:humanizer`, sau đó `voltagent-qa-sec:ai-writing-auditor` | Văn phong senior/lead, không còn dấu hiệu văn máy |

**Use case (`product-usecase/`)**

| Bước | Bắt buộc dùng | Để làm gì |
| --- | --- | --- |
| 1. Lập kế hoạch | `superpowers:writing-plans`, chạy trong plan mode `/plan` | Kế hoạch tách và viết UC theo module |
| 2. Tách và viết UC | Skill `use-case-writer` (đã cài; bản gốc ở thư mục `use-case-writer/`; hướng dẫn: <https://bazone.org/p/bo-skill-claude-ai-tro-ly-viet-tai>) | Mẫu 13 trường, 4 quy tắc xác định phạm vi, checklist 20 điểm. Viết tiếng Việt thay cho mặc định tiếng Anh của skill |
| 3. Viết theo module | `voltagent-biz:business-analyst`, mỗi module một agent | Viết UC song song, mỗi UC tự chạy checklist 20 điểm |
| 4. Thực thi | `superpowers:executing-plans` | Chạy theo kế hoạch đã duyệt |
| 5. Rà khả năng kiểm thử | `voltagent-qa-sec:qa-expert` | Hậu điều kiện kiểm chứng được, ngoại lệ đủ để viết test case |
| 6. Soát văn | `humanizer:humanizer`, sau đó `voltagent-qa-sec:ai-writing-auditor` | Văn phong senior/lead, không còn dấu hiệu văn máy |

Hai thư mục `product-discovery/` và `use-case-writer/` là skill tham khảo clone từ BA Zone (có `.git` riêng), không thuộc code sản phẩm.

## Lệnh thường dùng

```bash
npm run start:dev                  # dev server có watch, cổng 3006 (không dùng 3005: backend khác trên máy dev đã chiếm)
npm run build
npx tsc --noEmit                   # kiểm kiểu
npx eslint src test                # lint (`npm run lint` có thêm --fix)
npm run format                     # prettier
npm test                           # unit test (src/**/*.spec.ts), không cần Supabase
npx jest audit-diff                # chạy một file unit test theo pattern đường dẫn (rootDir của jest là src/)
npx jest audit-diff -t "<tên>"     # chạy một test theo tên
npm run test:e2e -- auth-contract  # contract test HTTP cho /v1/auth, không cần Supabase
npm run test:e2e -- auth-flow      # luồng đầy đủ với Supabase thật, xem bên dưới
npm run gen:types                  # sinh lại src/supabase/database.types.ts
```

Trước khi commit: `npm run format && npx tsc --noEmit && npx eslint src test && npm test`

Health check: `curl http://localhost:3006/health` (route duy nhất không có tiền tố version).

**e2e `auth-flow`** ghi dữ liệu thật, trong đó có dòng vào bảng chỉ-ghi-thêm không dọn được. Bộ test tự **skip** (không phải pass) trừ khi có credential Supabase thật **và** `SMOKE_TEST_ALLOW_WRITES=true`. PowerShell: `$env:SMOKE_TEST_ALLOW_WRITES='true'; npm run test:e2e -- auth-flow`. Không bao giờ chạy với production.

**Sinh types:** luôn dùng `npm run gen:types`. Không chuyển hướng output của Supabase CLI bằng `>` trong PowerShell 5.1: toán tử đó ghi UTF-16LE và làm hỏng ESLint cùng toàn bộ kiểu Supabase. Script tự suy project ref từ `SUPABASE_URL` trong `.env` (hoặc `--project=<ref>`). `kiem:types:prod` vẫn đang chứa project ref giữ chỗ.

## Môi trường

- NestJS **chỉ đọc `.env`**. `.env.development.local` và `.env.production.local` là bản lưu để copy sang `.env`, Nest không đọc chúng. `test/helpers/jest-setup.ts` nạp `.env.development.local` rồi `.env` cho các lần chạy e2e.
- Bắt buộc: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (service_role) và `ENCRYPTION_SECRET_KEY` (đúng 64 ký tự hex, sai là app ném lỗi lúc khởi động).
- Khi không có credential thật, e2e boot bằng giá trị giả trong `FAKE_ENV` (`test/helpers/test-app.ts`). supabase-js và JWKS không kết nối lúc khởi tạo, nên test định tuyến, validation, hình dạng lỗi và throttling chạy được offline.
- `TRUST_PROXY_HOPS` phải bằng đúng số tầng proxy thật đứng trước app, và không bao giờ là `true`. Đặt sai là ghi IP sai vào bảng audit chỉ-ghi-thêm mà không có lỗi nào báo. Xem `resolveTrustProxyHops()` trong `src/bootstrap.ts`.

## Kiến trúc

### Bootstrap và đường đi của request

Mọi hành vi HTTP nằm trong `configureApp()` ở `src/bootstrap.ts`: CORS, helmet, giới hạn body 256kb, versioning theo URI và `ValidationPipe` toàn cục (`whitelist` + `forbidNonWhitelisted`, nên trường lạ bị từ chối chứ không bị bỏ âm thầm). `main.ts` chỉ đọc PORT và listen. **Cấu hình HTTP mới đặt ở `bootstrap.ts`**, vì test e2e phải dựng app bằng `createTestApp()` trong `test/helpers/test-app.ts`, và hàm này gọi đúng hàm đó. Không gọi thẳng `createNestApplication()` trong test.

Thứ tự xử lý mỗi request:

1. Middleware: `requestContextMiddleware` (gán `requestId`), rồi `httpLogMiddleware`. Hai việc này là middleware chứ không phải interceptor, để phản hồi 401/403/429 vẫn có request ID và dòng log.
2. `ApiThrottlerGuard` toàn cục, đếm theo IP.
3. Guard của controller: `JwtAuthGuard`, rồi `PermissionsGuard` hoặc `SuperAdminGuard`. Thứ tự có ý nghĩa; đặt sai sẽ ném `GUARD_ORDER_ERROR` (500).
4. `TimeoutInterceptor`.
5. `ValidationPipe`.
6. Handler.

`AllExceptionsFilter` đăng ký bằng `APP_FILTER` trong `app.module.ts`, không dùng `useGlobalFilters(new …)`, vì nó cần DI để có `I18nService`.

Controller khai tường minh `version: API_VERSION_1` dù đó là mặc định. `/health` dùng `VERSION_NEUTRAL` và không bao giờ chạm database.

### Supabase và biên bảo mật

`SupabaseAdminService` dùng **service_role key, bỏ qua RLS**. `SupabaseAuthService` dùng anon key cho các lời gọi auth. Khi cần kiểm tra mật khẩu thì dùng `createEphemeralClient()`, để không làm thay đổi session của client dùng chung.

Vì RLS không bảo vệ truy vấn của backend, **biên bảo mật dữ liệu là phạm vi location của người gọi, và code phải tự thực thi**. Có hai lớp, thiếu lớp nào cũng hở:

- **Lớp route:** `@RequireContext({ roles, contextType, contextParam?, platformRoles? })` đi kèm `@UseGuards(JwtAuthGuard, PermissionsGuard)`. Route có `PermissionsGuard` mà không có `@RequireContext` thì chỉ cần đăng nhập là gọi được. Đó là chủ ý, nên route nào chạm dữ liệu tài sản cũng phải có decorator. Location ID lấy từ URL param hoặc body và chỉ dùng để tra vai trò; service vẫn phải kiểm tài nguyên có thật sự thuộc location đó không.
- **Lớp dữ liệu:** với truy vấn danh sách, gọi `AccessScopeService.resolveLocationScope(user, rule)`, rồi `applyLocationScope(query, scope, 'location_id')` trong repository. Phạm vi rỗng vẫn áp `.in(col, [])`, tức không trả dòng nào. Đừng "tối ưu" thành bỏ qua bộ lọc.

Không bao giờ đọc location hay trạng thái tài khoản từ header client gửi. Vai trò nằm ở `context_role_assignments`: vai trò × phạm vi `PLATFORM`/`LOCATION`, có hiệu lực theo thời gian, thu hồi bằng cách đóng `effective_to`, không bao giờ sửa hay xoá. Vai trò `PLATFORM` dùng nil UUID `PLATFORM_CONTEXT_ID`. Quản trị tối cao (break-glass) là `app_metadata.role === 'admin'` trong JWT (`isSuperAdmin()`) và đi xuyên mọi kiểm tra phạm vi.

Tên bảng lấy từ registry `SupabaseTable` trong `src/supabase/supabase.define.ts`. Truyền vào `.from()` dưới dạng literal để supabase-js giữ được kiểu của dòng; truyền một biến `string` là kết quả rơi về `any`. Bảng mới đăng ký ở đó cùng lúc với migration của nó.

### Token xác thực

Access token trả cho client là JWT của Supabase được bọc AES-256-GCM (`EncryptionService`). `JwtAuthGuard` làm bốn việc:

1. Giải mã token.
2. Xác minh chữ ký qua JWKS của Supabase (`SupabaseJwtService`).
3. Đọc `user_profiles` trên mỗi request, để tài khoản bị khoá mất quyền ngay. Không có hồ sơ thì trả 403 `PROFILE_NOT_INITIALIZED`, không trả 401.
4. Gán `req.user` (`JwtPayload`) và thay header `Authorization` bằng JWT gốc cho các lời gọi Supabase phía sau.

Vai trò cố ý **không** nằm trong payload; chỉ tra khi cần.

### Module

`CommonModule`, `SupabaseModule` (import ở nơi cần), `AuthModule` và `AuditModule` là phần hạ tầng. `AuthModule` và `AuditModule` là `@Global()`. `SupabaseJwtModule` cố ý **không** được re-export, nên module nghiệp vụ nào có controller dùng `JwtAuthGuard` phải tự khai `imports: [SupabaseModule, SupabaseJwtModule]`. Logic nghiệp vụ không đặt trong `src/common/`; service chỉ một domain dùng thì thuộc domain đó.

### Phân tầng repository → service → model

- **Repository** kế thừa `BaseRepository` (`src/common/repository/base.repository.ts`). Chỉ repository được dùng `this.db` (protected). Bọc kết quả bằng `must()` (bắt buộc có dòng, không có thì 404), `maybe()`, `many()`, `page()` (cần `select(..., { count: 'exact' })`) hoặc `void_()`. Các hàm này đổi lỗi Postgres qua `mapSupabasePostgrestError`, nên truy vấn lỗi không bao giờ trông như kết quả rỗng. Hàm đọc trên bảng thuộc location nhận `LocationScope` (`findInScope(id, scope)`, không phải `findById(id)`). Repository không kiểm vai trò, không ghi audit, không chứa quy tắc nghiệp vụ. **Không có hàm xoá**: "xoá" là đổi trạng thái kèm lý do và dòng audit.
- **Service** giữ quy tắc nghiệp vụ, kiểm tài nguyên có thuộc đúng location không, và ghi audit.
- **Model** (`src/common/model/base.model.ts`): không bao giờ trả thẳng dòng database ra API. Viết mapper `toXxxModel(row)` tường minh (camelCase), mỗi đối tượng người xem một mapper (ví dụ bản quét QR, bản chi tiết, bản tài chính), vì nhân viên cửa hàng không được thấy nguyên giá. Không dùng hàm tự đổi snake→camel. Dùng `toIsoString()` cho mốc thời gian và `toNumber()` cho cột `numeric` (PostgREST trả về **chuỗi**). Cộng dồn tiền bằng `SUM()` trong SQL, không cộng ở JS.

### Lỗi và i18n

- Ném `new AppException(ErrorCode.X, params?)`. HTTP status khai theo từng mã trong `ERROR_DEFINITIONS` (`src/common/i18n/error-code.const.ts`), không truyền ở chỗ ném.
- Mỗi mã phải có câu `vi` và `en`; `satisfies` biến bản dịch thiếu thành lỗi biên dịch. Mã của domain thêm vào cùng file thành một nhóm có tiêu đề.
- Thông báo thành công dùng cùng cơ chế trong `message-code.const.ts`.
- Validator của DTO truyền `ErrorCode` làm `message` (`@IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })`) để filter dịch được.
- Hình dạng phản hồi lỗi: `{ statusCode, code, message, path, requestId, errors? }`. Frontend phân nhánh theo `code`, không bao giờ theo `message`. `errors` chỉ có ở lỗi 400.
- `params` được gửi ra client, nên không bao giờ chứa bí mật, lỗi thô của database hay giá trị người gọi không được xem.
- Thứ tự chọn ngôn ngữ: `user_profiles.preferred_locale`, rồi `Accept-Language`, rồi `vi`.

### Audit

Nguyên tắc sản phẩm: không bao giờ xoá lịch sử; mọi thay đổi lưu Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do. Dùng `AuditService.recordOrThrow()` cho thay đổi dữ liệu nghiệp vụ và phân quyền, `record()` (log rồi đi tiếp) cho sự kiện phiên đăng nhập. Dựng actor, IP và request ID bằng `auditContextOf(req)`. Dựng Trước/Sau bằng `diffFields(before, after, allowList)`: allow-list là bắt buộc, và kết quả `null` nghĩa là không có gì đổi, nên không ghi dòng audit. Mã sự kiện đặt ở `src/utils/enums/audit-event.enum.ts` theo dạng `<domain>.<đối tượng>.<hành động thể quá khứ>`. `reason` phải do người dùng nhập, không bao giờ tự bịa. `audit_events` là bảng chỉ-ghi-thêm và tồn tại vĩnh viễn, nên không đưa token, URL đã ký hay toạ độ GPS chi tiết vào `changes` hoặc `metadata`.

supabase-js không có transaction nhiều câu lệnh. Với thao tác có hệ quả kế toán, hướng đã định là một hàm Postgres gọi qua `rpc()`, ghi dòng nghiệp vụ và lịch sử của nó trong cùng một transaction.

### Giới hạn tần suất

Các mức có tên nằm ở `src/common/constants/throttle.const.ts` (`THROTTLE_DEFAULT`, `LOGIN`, `AUTH`, `EMAIL`, `WRITE`, `SEARCH`). Dùng các mức này trong `@Throttle()`, không viết số trực tiếp. Guard toàn cục đếm theo IP, mà cả cửa hàng thường dùng chung một IP. Muốn giới hạn theo người dùng (ví dụ quét QR) thì thêm `ApiThrottlerGuard` ở controller, **sau** `JwtAuthGuard`. Bộ đếm nằm trong bộ nhớ của từng instance.

## Migration database (`sql-docs/`)

Migration là các file SQL đánh số, chạy tay trong SQL Editor của Supabase theo đúng thứ tự, sau đó chạy `admin-set.sql` để tạo quản trị viên đầu tiên. Đổi schema xong thì chạy `npm run gen:types`. Quy tắc lấy từ `sql-docs/README.md`:

- Không sửa migration đã chạy ở bất kỳ môi trường nào; sai thì viết migration mới để sửa.
- Migration phải idempotent.
- Gắn `tg_append_only()` cho bảng lịch sử và nhật ký.
- Không đặt khoá ngoại `on delete` lên cột người thực hiện của bảng lịch sử.
- Bật RLS (mặc định từ chối) cho mọi bảng mới.
- Không bao giờ xoá cứng dữ liệu nghiệp vụ.

Migration 01 đã viết nhưng chưa chạy.

## Quy ước code

- Alias `@/` trỏ tới `src/` (alias `src/…` cũng dùng được) trong app, jest và e2e.
- Prettier: nháy đơn, dấu phẩy cuối.
- ESLint dùng bộ quy tắc có kiểm kiểu; riêng `test/` nới các quy tắc `no-unsafe-*` về member và assignment.
- `database.types.ts` được loại khỏi lint và tsc.
- Kiến trúc, luồng auth, xử lý lỗi và i18n kế thừa từ `Avantily/avantily_backend`. Những chỗ cố ý sửa so với bản gốc đều có comment tại chỗ (xem mục "Nguồn gốc" trong README), nên đừng "khôi phục" hành vi cũ.
