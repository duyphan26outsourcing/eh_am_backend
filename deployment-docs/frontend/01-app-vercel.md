# Frontend (`eh_am_frontend`) — deploy lên Vercel

Domain đích: `am.wecoloresoft.com`. Vite + React + TanStack Router — **SPA thuần**.

> Điều kiện: backend đã chạy ở `https://am-api.wecoloresoft.com`
> ([`../backend/04-nginx-tls.md`](../backend/04-nginx-tls.md)).

## 1. Bắt buộc: `vercel.json` cho SPA fallback

Bản build (`dist/`) chỉ có **đúng một** `index.html` thật. Mọi route của app
(`/assets`, `/assets/:id`, `/asset-cancellations`, `/sign-in`…) chỉ tồn tại phía
client sau khi TanStack Router nhận `index.html` và tự vẽ.

Ai bấm **thẳng** `https://am.wecoloresoft.com/assets` — hoặc F5 ở một trang con,
hoặc bookmark — mà Vercel không biết trả `index.html` thì nó tìm file vật lý ở
đường dẫn đó, không thấy, trả **404**.

Tạo `vercel.json` ở gốc repo `eh_am_frontend` (nếu chưa có):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

⚠️ Thiếu file này thì trang đăng nhập vẫn vào bình thường (`/` có file thật), nên
rất dễ nghiệm thu nhầm là "chạy tốt". Lỗi chỉ lộ khi F5 ở trang con.

## 2. Biến môi trường (khai trên Vercel TRƯỚC khi Deploy)

Vite chỉ nhúng biến bắt đầu `VITE_`, và nhúng **lúc build**.

| Biến | Giá trị production |
| --- | --- |
| `VITE_API_BASE_URL` | `https://am-api.wecoloresoft.com/v1` |
| `VITE_DEFAULT_LOCALE` | `vi` |
| `VITE_APP_ENV` | `production` |
| `VITE_ENABLE_DEVTOOLS` | `false` |

⚠️ **`/v1` ở cuối là bắt buộc** (version đặt ở đường dẫn). Thiếu nó là mọi lời gọi
trả 404, triệu chứng là "đăng nhập không được".

⚠️ **Sửa biến `VITE_*` xong phải Redeploy thủ công** — chúng nhúng lúc build, không
đọc lúc chạy.

## 3. CSP đổ theo domain — đổi domain phải build lại

`vite.config.ts` tiêm CSP `<meta>` **lúc build**. `connect-src` gồm chính origin,
origin của `VITE_API_BASE_URL`, và `https://*.supabase.co`.

⚠️ Dòng `https://*.supabase.co` là **bắt buộc**: đính kèm chứng từ tài sản PUT tệp
**thẳng từ trình duyệt lên Supabase Storage** qua signed URL, không qua backend.
Thiếu origin Supabase trong `connect-src` thì nút tải chứng từ bị CSP chặn ngay,
console báo "Content Security Policy". Đổi domain API hay project Supabase đều phải
build lại vì CSP đã bị đóng băng trong HTML.

## 4. Import vào Vercel

1. Vercel → **Add New → Project** → import repo `eh_am_frontend`.
2. Framework Preset: **Vite**. Build `npm run build`, Output `dist`.
3. Khai bốn biến ở mục 2 cho môi trường **Production**.
4. **Deploy**. Build chạy `tsc -b && vite build`.

## 5. Gắn domain `am.wecoloresoft.com`

Vercel → Project → **Settings → Domains → Add** `am.wecoloresoft.com`.

⚠️ **Thêm domain với Cloudflare ở DNS only trước**, đợi Vercel báo "Valid
Configuration", **rồi mới** bật Proxied:

1. Cloudflare → zone `wecoloresoft.com` → DNS → thêm record Vercel chỉ dẫn
   (thường `CNAME am → cname.vercel-dns.com`), Proxy status **DNS only** (mây xám).
2. Đợi Vercel chuyển sang "Valid Configuration" (cấp TLS xong).
3. Bật lại **Proxied** (mây cam) nếu muốn qua Cloudflare.

Bật Proxied quá sớm làm Vercel không xác minh được domain và không cấp được chứng
chỉ.

## 6. Test

```powershell
curl.exe -i https://am.wecoloresoft.com/
curl.exe -i https://am.wecoloresoft.com/assets
```

- `/` trả `200`, HTML của app.
- `/assets` (gõ thẳng) trả `200` **cùng** nội dung `index.html` — bằng chứng
  `vercel.json` SPA fallback đang chạy. Trả `404` là thiếu `vercel.json`.

Mở `https://am.wecoloresoft.com` trên trình duyệt, DevTools → Console: **không**
được có dòng "Content Security Policy". Đăng nhập, mở một hồ sơ tài sản, thử đính
kèm một chứng từ — nếu PUT lên Storage bị chặn thì xem lại mục 3.

---

Xong frontend. Bước cuối — nghiệm thu:
[`../production/01-kiem-tra-sau-deploy.md`](../production/01-kiem-tra-sau-deploy.md).
