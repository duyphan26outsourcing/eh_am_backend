# Backend — Ghi chú kỹ thuật & vận hành (`eh_am_backend`)

Tài liệu dành cho người code: cách chạy, lệnh hay dùng, cấu trúc thư mục, các điều bất biến và nguồn gốc kiến trúc. Tổng quan sản phẩm và cách tiếp cận thiết kế nằm ở [`README.md`](README.md).

API nghiệp vụ cho hệ thống quản lý tài sản & công cụ dụng cụ (CCDC) của chuỗi Every Half — cửa hàng, kho, xưởng rang, văn phòng.

**Ngăn xếp:** NestJS 11 · TypeScript 5.7 · Supabase (PostgreSQL + Auth + Storage) · Node.js 22

> North Star (brief gốc): *Quét bất kỳ tài sản, CCDC nào → biết ngay nó là gì, đang ở đâu, ai quản lý, giá trị bao nhiêu và toàn bộ lịch sử của nó.*

---

## Trạng thái

| Việc | Trạng thái |
| --- | --- |
| Hạ tầng: Supabase (2 client) · env · versioning `/v1` · lỗi + i18n (vi/en) · rate limit · helmet · request-id · log | ✅ Dựng xong |
| Luồng auth: đăng ký · xác nhận email · đăng nhập · refresh (token mã hoá AES-GCM) · 3 phạm vi đăng xuất · 3 luồng mật khẩu · `/me` | ✅ Dựng xong |
| Phân quyền theo **vai trò × location**: `PermissionsGuard` + `AccessScopeService` | ✅ Hạ tầng xong · danh mục vai trò **tạm thời** |
| Audit "Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do" (`audit_events` chỉ-ghi-thêm) | ✅ Hạ tầng xong |
| Module M03 (Hồ sơ tài sản): tạo · sửa mô tả · đổi người giữ · đổi vòng đời · tra cứu · chi tiết · chứng từ · đề nghị/duyệt huỷ | ✅ Đã làm (bản demo) |
| `database.types.ts` | Sinh bằng `npm run gen:types` |
| Các module nghiệp vụ còn lại (QR & kiểm kê, điều chuyển, bảo trì, thanh lý, khấu hao, FAST, dashboard) | ⏸️ Ngoài phạm vi bản demo |

Tài liệu sản phẩm (phân tích yêu cầu, Master Blueprint, use case): [`business/product-docs/`](business/product-docs/).

---

## Chạy lần đầu

```bash
npm ci
copy .env.development.local .env      # PowerShell / cmd  (bash: cp)
# điền SUPABASE_URL + 2 key của project Supabase DEV vào .env
# chạy các migration trong sql-docs/migrations theo thứ tự trên Supabase, rồi sql-docs/admin-set.sql
npm run gen:types
npm run start:dev
```

Kiểm: `curl http://localhost:3006/health`

⚠️ Cổng **3006** (không phải 3005 — cổng đó đã bị một backend khác trên máy dev dùng). Frontend: `http://localhost:5175`.

---

## Lệnh hay dùng

```bash
npm run start:dev                     # dev, tự reload
npm run build                         # biên dịch
npx tsc --noEmit                      # kiểm kiểu
npx eslint src test                   # lint
npm run format                        # prettier
npm test                              # unit test (không cần Supabase)
npm run test:e2e -- auth-contract     # contract test /v1/auth (không cần Supabase)
npm run test:e2e -- auth-flow         # luồng đầy đủ — cần Supabase thật + SMOKE_TEST_ALLOW_WRITES=true
npm run gen:types                     # sinh database.types.ts từ Supabase
```

Trước mỗi commit: `npm run format && npx tsc --noEmit && npx eslint src test && npm test`

---

## Cấu trúc

```text
eh_am_backend/
├── src/
│   ├── main.ts               khởi động tiến trình (PORT, listen, log) — cố ý mỏng
│   ├── bootstrap.ts          ⭐ mọi cấu hình HTTP: CORS, helmet, versioning, ValidationPipe, body limit, trust proxy
│   ├── app.module.ts         bản đồ module
│   ├── supabase/             2 client (service_role / anon) + registry tên bảng + generated types
│   ├── auth/                 luồng auth + JwtAuthGuard + PermissionsGuard + AccessScopeService (phạm vi location)
│   ├── audit/                AuditService (@Global) + diffFields (Trước/Sau)
│   ├── assets/               module M03: repository → service → controller + model theo người xem
│   ├── common/               i18n (mã lỗi + thông báo song ngữ), throttle, DTO chung, BaseRepository, middleware
│   ├── error/                AllExceptionsFilter + mapper lỗi Supabase → mã lỗi
│   ├── utils/                hàm dùng chung + danh mục vai trò & mã sự kiện audit
│   └── types/                mở rộng Express.Request
├── sql-docs/                 migration đánh số + admin-set.sql (xem sql-docs/README.md)
├── tools/                    gen-supabase-types.mjs + seed/smoke cho M03
├── test/                     e2e (contract + luồng đầy đủ)
└── business/product-docs/    tài liệu sản phẩm (.md để chuyển sang Lark)
```

---

## Bốn điều đọc trước khi viết dòng code nghiệp vụ đầu tiên

| # | Điều bất biến | Ở đâu |
| --- | --- | --- |
| 1 | **Không bao giờ xoá lịch sử.** Bảng nhật ký chỉ-ghi-thêm (trigger chặn cả `service_role`); "xoá" trên giao diện = đổi trạng thái + lý do + audit | `sql-docs/migrations/` |
| 2 | **Biên bảo mật là phạm vi location.** Backend dùng `service_role` nên RLS không lọc giúp — mọi truy vấn danh sách phải qua `applyLocationScope()` | `src/auth/access-scope.service.ts` |
| 3 | **Frontend phân nhánh theo `code`, không theo `message`.** `message` đổi theo ngôn ngữ | `src/common/i18n/error-code.const.ts` |
| 4 | **Không trả thẳng dòng database ra API.** Mỗi loại người xem một mapper (nhân viên quét QR không thấy nguyên giá) | `src/common/model/base.model.ts` |

---

## Nguồn gốc

Kiến trúc, luồng auth, xử lý lỗi, i18n, versioning và bảo mật kế thừa từ `Avantily/avantily_backend`. Các điểm **đã sửa so với bản gốc** (có ghi chú tại chỗ trong code):

- 429 trả đúng số giây và đúng ngôn ngữ (bản gốc hiện nguyên chữ `{seconds}`).
- Mảng `errors` được dịch theo ngôn ngữ; chỉ trả cho lỗi 400 (không lộ câu nội bộ "Cannot GET …").
- Hiệu lực vai trò theo thời gian xét trong SQL (bản gốc so chuỗi ISO — lệch 7 giờ nếu database đặt múi giờ +07).
- Bảng lịch sử không có khoá ngoại `on delete` ngay từ migration đầu (bản gốc phải vá bằng migration sau).
- Thông báo thành công song ngữ (bản gốc chỉ có tiếng Việt viết cứng).
- `/v1/auth/me` trả vai trò theo phạm vi + ngôn ngữ.
