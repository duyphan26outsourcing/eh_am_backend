# Nghiệm thu sau deploy

Chạy sau khi backend, nginx và frontend đã lên. Mục tiêu: xác nhận cả chuỗi
Cloudflare → nginx → container → Supabase chạy đúng, và không app nào khác trên
VPS bị ảnh hưởng.

## 1. Backend qua Internet

```powershell
curl.exe -i https://am-api.wecoloresoft.com/health
curl.exe -i http://am-api.wecoloresoft.com/health
curl.exe -i https://am-api.wecoloresoft.com/v1/assets
```

| Lệnh | Đạt khi |
| --- | --- |
| `/health` (https) | `HTTP/2 200`, header `Server: cloudflare` |
| `/health` (http) | `301` sang `https://` |
| `/v1/assets` không token | **`401`**. Trả `200` là sự cố bảo mật — dừng, kiểm guard |

## 2. TRUST_PROXY_HOPS đúng

```bash
ssh ehamdeploy@<VPS_IP>
cd eh_am_backend
docker compose logs app --tail=200 | grep -i "trust proxy"
```

Phải thấy `trust proxy = 2`. Sai số này thì IP người dùng ghi vào audit toàn
`127.0.0.1`.

## 3. Frontend

- Mở `https://am.wecoloresoft.com` — vào được trang đăng nhập.
- F5 ở một trang con (ví dụ `https://am.wecoloresoft.com/assets`) — **không** ra
  404 (xác nhận `vercel.json`).
- DevTools → Console: **không** có dòng "Content Security Policy".

## 4. Luồng nghiệp vụ đầu-cuối (M03)

Đăng nhập bằng tài khoản có vai trò phù hợp rồi đi hết một vòng:

1. Danh sách tài sản load được, lọc/tìm chạy.
2. Mở chi tiết một tài sản — timeline hiện **chữ tiếng Việt** (không phải mã thô
   như `asset.asset.created`).
3. Tạo một tài sản mới → xuất hiện trong danh sách.
4. Đính kèm một chứng từ → tệp PUT thẳng lên Supabase Storage, xác nhận gắn xong,
   mở lại xem được qua signed URL.
5. Đề nghị huỷ một hồ sơ, rồi bằng **một tài khoản ASSET_MANAGER khác** vào
   `/asset-cancellations` duyệt — hồ sơ chuyển Hủy, timeline ghi lại.

## 5. Không app nào khác trên VPS bị ảnh hưởng

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
ls -la /etc/nginx/sites-enabled/
sudo nginx -t
```

- Mọi container của các app khác vẫn `Up`, mỗi cái bind đúng `127.0.0.1` cổng
  riêng; `eh-am-backend` là `127.0.0.1:3006`.
- `sites-enabled` có đủ site của các app + `am-api.wecoloresoft.com`.
- `nginx -t` (có `sudo`) in `test is successful`.

Kiểm nhanh domain của các app khác vẫn trả `200`/`301` như trước.

## 6. Bảo mật nhanh

- `/v1/assets` và `/v1/auth/me` không token → `401`.
- Bucket `asset-documents` không đọc trực tiếp được (mục 3 của
  [`../database/01-sql-va-storage.md`](../database/01-sql-va-storage.md)).
- `.env` trên VPS là `chmod 600`.
- Không có khoá bí mật nào trong bundle frontend: DevTools → Sources, tìm
  `SUPABASE_SECRET_KEY`/`service_role` — không được thấy.

---

Xong thì bản demo sẵn sàng. Deploy code mới các lần sau: backend theo
[`../backend/03-cap-nhat-deploy-lai.md`](../backend/03-cap-nhat-deploy-lai.md),
frontend chỉ cần `git push` (Vercel tự build).
