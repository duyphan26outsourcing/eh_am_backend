# Những việc phải chốt trước khi deploy

Các mục dưới đây không gây lỗi lúc build hay lúc khởi động — chúng chỉ sai khi có
người dùng thật, đúng lúc khó phát hiện nhất. Chốt xong hẵng gõ lệnh deploy đầu.

| # | Vấn đề | Loại | Chặn deploy? |
| --- | --- | --- | --- |
| 1 | Dùng **project Supabase dev** cho bản demo | Hạ tầng | Không, nếu chỉ demo (đọc kỹ) |
| 2 | Domain + CORS trong `.env.production.local` | Sửa `.env` | Có |
| 3 | Bucket `asset-documents` phải private | Hạ tầng | Có |
| 4 | `TRUST_PROXY_HOPS` khớp số tầng proxy | Sửa `.env` | Có |
| 5 | Tên subdomain API + domain đã lên Cloudflare chưa | Quyết định | Có |

---

## 1. Dùng project Supabase dev cho bản demo

Founder đã chốt: đây là demo để thấy logic, **dùng chung database Supabase dev**.
Chấp nhận được **với điều kiện không mở cho người dùng thật**, vì:

- Mọi lần `npm run start:dev` ở local ghi thẳng vào chính database mà demo dùng.
- `audit_events` và `asset_events` là bảng **chỉ-ghi-thêm** (trigger chặn cả
  `service_role`): dữ liệu thử nghiệm đổ vào thì **không dọn lại được bằng xoá**.
- "Xoá" tài sản trong hệ thống là đổi trạng thái + lý do + audit, không có endpoint
  `DELETE` — nên hồ sơ thử cũng ở lại.

⚠️ Trước khi có bất kỳ người ngoài nào truy cập thật, phải tách project Supabase
production riêng: tạo project mới, chạy lại toàn bộ migration trong `sql-docs`,
tạo lại bucket, đổi `SUPABASE_URL` + hai key trong `.env.production.local`. Chuyển
sau khi đã có dữ liệu thật thì phải di trú, và phần audit thì không di trú được mà
không phá dấu vết.

Với mục tiêu demo hiện tại: **giữ project dev là đủ.** Chỉ cần dọn dữ liệu rác
trước khi đưa link cho người chấm.

---

## 2. Domain + CORS trong `.env.production.local`

Ba file `.env*` nằm trong `.gitignore`, chỉ tồn tại trên máy đang deploy. Giá trị
đúng cho bản demo:

```env
# eh_am_backend/.env.production.local
NODE_ENV="production"
PORT="3006"
TRUST_PROXY_HOPS="2"
APP_URL="https://am.wecoloresoft.com"
CORS_ORIGINS="https://am.wecoloresoft.com"
SUPABASE_URL="https://<project-ref>.supabase.co"
# SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, ENCRYPTION_SECRET_KEY: điền từ Supabase + tự sinh
```

```env
# eh_am_frontend (khai trên Vercel, không commit)
VITE_API_BASE_URL="https://am-api.wecoloresoft.com/v1"
VITE_DEFAULT_LOCALE="vi"
VITE_APP_ENV="production"
VITE_ENABLE_DEVTOOLS="false"
```

Mỗi biến sai gây một triệu chứng khác nhau:

| Biến sai | Triệu chứng |
| --- | --- |
| `CORS_ORIGINS` | Frontend load được nhưng **mọi** request API bị trình duyệt chặn, giao diện trắng, console báo CORS. `bootstrap.ts` chặn thẳng origin lạ, không fallback |
| `VITE_API_BASE_URL` | Không đăng nhập được. Biến `VITE_*` nhúng **lúc build** — sửa xong phải Redeploy trên Vercel |
| `ENCRYPTION_SECRET_KEY` | App **ném lỗi lúc khởi động** nếu không đúng 64 ký tự hex |
| `APP_URL` | Liên kết trong email đặt lại mật khẩu trỏ sai chỗ |

⚠️ `/v1` ở cuối `VITE_API_BASE_URL` là **bắt buộc** (version đặt ở đường dẫn,
`API_VERSION_1`). Thiếu nó là mọi lời gọi trả 404, và triệu chứng là "đăng nhập
không được" chứ không phải thông báo rõ ràng.

---

## 3. Bucket `asset-documents` phải private

Chứng từ tài sản (hoá đơn, PO, biên bản bàn giao, ảnh) nằm ở bucket
`asset-documents`. Backend chỉ phát ra ngoài qua **signed URL hết hạn sau 60 giây**,
cấp sau khi kiểm quyền (BR-CMN-06: hoá đơn/PO chỉ cho vai trò xem tài chính).

Supabase Dashboard → **Storage** → `asset-documents` → Public bucket: **tắt**.

Kiểm bằng lệnh, không chỉ bằng mắt (phải trả 400/404, KHÔNG trả file):

```powershell
curl.exe -i "https://<project-ref>.supabase.co/storage/v1/object/public/asset-documents/test.pdf"
```

Trả `200` kèm nội dung là bucket đang public — dừng deploy, sửa ngay. Migration
`22_asset_documents.sql` tạo bucket ở chế độ private, và `23_asset_documents_hardening.sql`
đặt giới hạn 10MB + allowlist MIME; chạy đủ hai migration là đúng.

---

## 4. `TRUST_PROXY_HOPS` khớp số tầng proxy

Chuỗi thật khi API qua Cloudflare: `Cloudflare → nginx → Express` = **2** tầng.

| Hạ tầng | `TRUST_PROXY_HOPS` |
| --- | --- |
| `am-api` **Proxied** qua Cloudflare, sau nginx | `2` |
| `am-api` **DNS only**, vẫn sau nginx | `1` |
| Chạy local, không proxy | `0` |

Sai số này thì `clientIp()` trả `127.0.0.1` cho mọi người dùng → rate limit dồn
một rổ, và cột `ip_address` của bảng audit chỉ-ghi-thêm ghi sai vĩnh viễn. Xem
`resolveTrustProxyHops()` trong `src/bootstrap.ts`.

---

## 5. Tên subdomain API + domain trên Cloudflare

- **Frontend:** `am.wecoloresoft.com` (Vercel) — đã chốt.
- **API:** đề xuất `am-api.wecoloresoft.com`. Nếu muốn khác (`api.am.wecoloresoft.com`…)
  thì sửa đồng bộ: `VITE_API_BASE_URL`, nginx `server_name`, DNS record, Origin cert.
- `wecoloresoft.com` **phải đã là zone Active trên Cloudflare** thì mới làm được
  Origin Certificate và Proxied. Chưa đưa về Cloudflare thì làm bước đó trước (DNS
  cần thời gian lan). Nếu không dùng Cloudflare, thay bằng Let's Encrypt và đặt
  `TRUST_PROXY_HOPS=1`.

---

## Sau khi sửa xong — chạy ở local trước

```powershell
# eh_am_backend
npm run format ; npx tsc --noEmit ; npx eslint src test ; npm test

# eh_am_frontend
npm run typecheck ; npm run lint ; npm test ; npm run build
```

Tất cả PASS mới commit và deploy. Đừng để VPS hay Vercel là nơi đầu tiên phát
hiện lỗi biên dịch.
