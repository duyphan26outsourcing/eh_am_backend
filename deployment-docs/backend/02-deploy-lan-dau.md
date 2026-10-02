# Backend — deploy lần đầu lên VPS

> Điều kiện: đã xong [`01-chuan-bi-vps.md`](01-chuan-bi-vps.md) (user `ehamdeploy`,
> cổng 3006 trống) và [`../database/01-sql-va-storage.md`](../database/01-sql-va-storage.md)
> (migration + bucket + tài khoản admin).

## 0. Trên máy local — kiểm tra rồi đẩy code lên `main`

```powershell
cd C:\Users\Admin\development\everyhalf\eh_am_backend

npm run format
npx tsc --noEmit
npx eslint src test
npm test

git add -A
git commit -m "chore: them docker-compose va deployment docs"
git push origin main
```

⚠️ Build/test FAIL thì dừng. Đừng để VPS là nơi đầu tiên phát hiện lỗi biên dịch —
trên đó lỗi hiện ra dưới dạng container `Restarting` liên tục, khó đọc hơn nhiều.

## 1. Tạo deploy key để `git clone` (không dùng token)

Trên VPS, SSH bằng `ehamdeploy`:

```bash
ssh-keygen -t ed25519 -C "vps-eh-am-backend-deploy" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

Copy dòng in ra. Vào **GitHub → repo `eh_am_backend` → Settings → Deploy keys →
Add deploy key**, dán vào, đặt tên `vps-production`, **KHÔNG** tick "Allow write
access" — VPS chỉ cần đọc.

⚠️ Đây là key riêng của `ehamdeploy`, độc lập với deploy key của các app khác.
Một key cho một repo là cách duy nhất thu hồi quyền một bên mà không ảnh hưởng bên
kia.

```bash
ssh -T git@github.com
```

Gõ `yes` lần đầu. Phải thấy `Hi <user>/eh_am_backend! You've successfully
authenticated...`.

## 2. Clone code

```bash
cd ~
git clone git@github.com:<user>/eh_am_backend.git
cd eh_am_backend
git branch --show-current
```

Phải in `main`.

## 3. Chuyển file `.env` lên VPS

Mở **cửa sổ PowerShell MỚI trên Windows** — không phải cửa sổ đang SSH.

```powershell
cd C:\Users\Admin\development\everyhalf\eh_am_backend
scp .env.production.local ehamdeploy@<VPS_IP>:~/eh_am_backend/.env
```

⚠️ **Bẫy tên file.** Đích phải là `.env`, không phải `.env.production.local`.
`docker-compose.yml` khai `env_file: - .env`; sai tên thì container khởi động
không có biến nào và chết ngay ở `SupabaseAdminService` với `Invalid URL`.

⚠️ **Bẫy đường dẫn Windows.** Luôn `cd` vào thư mục rồi dùng tên file tương đối;
dùng `C:\Users\...` thẳng trong `scp` thì dấu `:` sau ổ đĩa bị hiểu thành
`host:path` → lỗi `Could not resolve hostname c`.

Trên VPS, kiểm tra và khoá quyền đọc:

```bash
cd ~/eh_am_backend
ls -la .env
chmod 600 .env
grep -c SUPABASE_SECRET_KEY .env
```

`chmod 600` là **bắt buộc**: file này chứa service role key (bỏ qua RLS + mở bucket
`asset-documents`). `scp` mặc định tạo file `644`, tức các user khác đọc được.

### Kiểm lại nội dung `.env` trước khi build

```bash
grep -vE 'SECRET|PUBLISHABLE|ENCRYPTION' .env
```

Phải thấy đúng:

```env
NODE_ENV="production"
PORT="3006"
TRUST_PROXY_HOPS="2"
APP_URL="https://am.wecoloresoft.com"
CORS_ORIGINS="https://am.wecoloresoft.com"
SUPABASE_URL="https://<project-ref>.supabase.co"
```

⚠️ `TRUST_PROXY_HOPS` phải là **2** (Cloudflare → nginx → Express). Sai số này thì
`clientIp()` trả `127.0.0.1` cho mọi người dùng, rate limit dồn một rổ, và cột
`ip_address` của bảng audit chỉ-ghi-thêm ghi sai — bảng đó không xoá lại được.

⚠️ `ENCRYPTION_SECRET_KEY` phải đúng **64 ký tự hex**, nếu không app ném lỗi lúc
khởi động.

## 4. Build và chạy

```bash
docker compose up -d --build
```

Lần đầu mất vài phút (tải base image `node:22-bookworm-slim`, `npm ci` hai lần,
biên dịch TypeScript).

```bash
docker compose ps
docker compose logs app --tail=50
```

`eh-am-backend` phải `Up`, sau ~15 giây chuyển `(healthy)`, log không có exception,
và in dòng khởi động có `trust proxy = 2`.

### Ba phép thử trong VPS

```bash
curl -i http://127.0.0.1:3006/health
curl -i http://127.0.0.1:3006/v1/assets
curl -i http://127.0.0.1:3006/v1/auth/me
```

| Lệnh | Đạt khi |
| --- | --- |
| `/health` | `200` |
| `/v1/assets` | **`401`** — guard đang bật. Trả `200` là **sự cố bảo mật**, dừng deploy ngay |
| `/v1/auth/me` | **`401`** khi không có token |

### Xác nhận các backend cùng sống, không đụng nhau

```bash
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
```

`eh-am-backend` phải `Up`, và cột `Ports` phải là `127.0.0.1:3006->3006/tcp`.

⚠️ Thấy `0.0.0.0:3006->3006/tcp` thay vì `127.0.0.1:3006->3006/tcp` là compose
đang publish ra Internet. Sửa `docker-compose.yml` rồi `docker compose up -d` lại.

---

## Lỗi hay gặp

| Lỗi | Nguyên nhân | Sửa |
| --- | --- | --- |
| `permission denied ... docker.sock` | Chưa đăng nhập lại sau khi vào nhóm `docker` | `exit` rồi `ssh` lại |
| Container `Restarting` liên tục | Thiếu biến môi trường hoặc `.env` sai tên | `docker compose logs app --tail=100`; `ls -la .env` |
| Log `Invalid URL` / `Invalid API key` | `SUPABASE_URL`/`SUPABASE_SECRET_KEY` sai hoặc thiếu nháy | Sửa `.env`, `docker compose up -d --build` |
| Log báo lỗi `ENCRYPTION_SECRET_KEY` | Không đúng 64 ký tự hex | Sinh lại: `openssl rand -hex 32` |
| `curl /health` `Connection refused` | Container chưa `Up` hoặc `PORT` khác `3006` | `docker compose ps`; đối chiếu `PORT` với `ports` |
| `port is already allocated` | Cổng 3006 bị chiếm | `sudo ss -tlnp \| grep 3006`; xem mục 4 của tài liệu 01 |
| `git clone` permission denied | Deploy key chưa add đúng repo | Kiểm mục 1 |
| Build bị kill giữa chừng | Hết RAM lúc `npm ci` | Bật swap — mục 5 của tài liệu 01 |
| Compose dựng container **thứ hai** | Thư mục clone tên khác → Compose coi là project mới | `docker-compose.yml` đã khai `name: eh-am`; kiểm dòng đó còn không |

---

Backend đã chạy ở `127.0.0.1:3006`. Bước tiếp theo — đưa ra Internet:
[`04-nginx-tls.md`](04-nginx-tls.md).
