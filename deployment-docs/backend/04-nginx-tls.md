# Backend — nginx + TLS cho `am-api.wecoloresoft.com`

> Làm sau khi backend đã chạy được ở `127.0.0.1:3006`
> ([`02-deploy-lan-dau.md`](02-deploy-lan-dau.md)) và zone `wecoloresoft.com` đã
> Active trên Cloudflare.
>
> Chỉ cần làm **1 lần** — sau này deploy code mới không đụng gì tới nginx.

## Mô hình TLS

```text
Client --HTTPS (chứng chỉ Cloudflare)--> Cloudflare edge
Cloudflare edge --HTTPS (chứng chỉ Origin CA)--> nginx trên VPS
nginx --HTTP nội bộ (127.0.0.1:3006)--> container eh-am-backend
```

Dùng **Cloudflare Origin Certificate**, không phải Let's Encrypt — client thật
không bao giờ chạm trực tiếp vào VPS, chỉ Cloudflare mới kết nối tới origin.
Origin cert miễn phí, hạn tới 15 năm, không cần renew.

⚠️ SSL/TLS mode luôn **Full (strict)**, không bao giờ **Flexible** — Flexible để
chặng Cloudflare→VPS đi HTTP trần, mà chặng đó mang access token quản trị.

## 1. Tạo Origin Certificate cho `wecoloresoft.com`

Dashboard → chọn zone **`wecoloresoft.com`** → **SSL/TLS → Origin Server → Create
Certificate**:

- Giữ mặc định "Let Cloudflare generate a private key and a CSR"
- Hostnames: `*.wecoloresoft.com` và `wecoloresoft.com`
- Certificate Validity: **15 years**
- Create → copy cả **Origin Certificate** và **Private Key**

⚠️ Private Key chỉ hiện **đúng một lần**. Đóng tab trước khi dán xong là phải tạo
cert mới.

## 2. Lưu cert vào VPS

Tên file phải **khác** các cert của app khác để không ghi đè.

```bash
sudo nano /etc/nginx/ssl/wecoloresoft-origin.pem   # dán Origin Certificate
sudo nano /etc/nginx/ssl/wecoloresoft-origin.key   # dán Private Key
sudo chmod 600 /etc/nginx/ssl/wecoloresoft-origin.key
sudo chmod 644 /etc/nginx/ssl/wecoloresoft-origin.pem
```

Kiểm:

```bash
sudo openssl x509 -in /etc/nginx/ssl/wecoloresoft-origin.pem -noout -subject -dates
sudo openssl rsa -in /etc/nginx/ssl/wecoloresoft-origin.key -check -noout
```

Câu đầu in `subject=... CloudFlare Origin Certificate` + hạn 15 năm; câu hai in
`RSA key ok`. Sai thường do thiếu dòng `-----BEGIN...`/`-----END...` khi dán.

## 3. Tạo file cấu hình site

```bash
sudo nano /etc/nginx/sites-available/am-api.wecoloresoft.com
```

Dán:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name am-api.wecoloresoft.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name am-api.wecoloresoft.com;

    ssl_certificate     /etc/nginx/ssl/wecoloresoft-origin.pem;
    ssl_certificate_key /etc/nginx/ssl/wecoloresoft-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # ⚠️ 1m là đủ. Chứng từ tài sản KHÔNG đi qua backend: trình duyệt PUT thẳng
    # tệp lên Supabase Storage bằng signed URL (xem AssetStorageService). Backend
    # chỉ nhận JSON nhỏ (giới hạn body 256kb ở bootstrap.ts), nên không cần nới
    # client_max_body_size như các API tải tệp qua server.
    client_max_body_size 1m;

    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 60s;
        proxy_send_timeout    60s;
        proxy_read_timeout    60s;
    }
}
```

### ⚠️ Bốn dòng `proxy_set_header` gắn với `TRUST_PROXY_HOPS`

`X-Forwarded-For` do nginx dựng ở đây là thứ Express đọc để biết IP thật, và chỉ
có tác dụng khi `.env` có `TRUST_PROXY_HOPS=2`. Sửa một bên phải sửa bên kia:

| Hạ tầng | `TRUST_PROXY_HOPS` |
| --- | --- |
| `am-api` **Proxied** qua Cloudflare, sau nginx | `2` |
| `am-api` **DNS only**, vẫn sau nginx | `1` |
| Thêm một tầng cân bằng tải trước nginx | `3` |

### ⚠️ Cú pháp `http2`

nginx ≤ 1.24 dùng `listen 443 ssl http2;`. Cú pháp mới `http2 on;` (dòng riêng)
chỉ chạy từ nginx ≥ 1.25.1 — dùng nhầm báo `unknown directive "http2"`.

## 4. Kích hoạt site

```bash
sudo ln -s /etc/nginx/sites-available/am-api.wecoloresoft.com /etc/nginx/sites-enabled/
sudo nginx -t
```

Phải in `test is successful`.

### ⚠️ `nginx -t` phải có `sudo`

Chạy `nginx -t` trần dưới user thường báo `cannot load certificate key ...
Permission denied` cho một cert của **app khác** (private key mode 600 của root,
user thường không đọc được) — **không phải lỗi file vừa tạo**. Dấu hiệu: có dòng
`[warn] the "user" directive...` ở đầu, và tên file trong thông báo không phải
`wecoloresoft-origin.key`. Tuyệt đối không xoá symlink site của app khác.

### `could not build server_names_hash`

Thêm vhost mới có thể làm bảng băm server name tràn bucket mặc định:

```bash
grep -n "server_names_hash_bucket_size" /etc/nginx/nginx.conf
```

Có dòng không `#` (thường đã đặt `64;` từ lần dựng trước) là xong. Chưa có thì
thêm `server_names_hash_bucket_size 64;` vào khối `http { }` của
`/etc/nginx/nginx.conf` rồi `sudo nginx -t`. ⚠️ File này **dùng chung** — chỉ đổi
sizing bảng băm, không đổi route, nhưng đã đụng file chung thì xác nhận app khác
còn sống ở mục 6.

### Kích hoạt

```bash
ls -la /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

Dùng `reload`, không `restart`: `reload` nạp cấu hình mới mà không cắt kết nối
đang mở — app khác đang chạy thật. `ln: ... File exists` nghĩa là symlink đã tạo
từ trước, bỏ qua.

## 5. Bật DNS + Cloudflare cho `am-api`

Cloudflare → zone `wecoloresoft.com` → **DNS → Add record**:

| Type | Name | IPv4 | Proxy status |
| --- | --- | --- | --- |
| A | `am-api` | `<VPS_IP>` | **Proxied** (mây cam) |

Rồi **SSL/TLS → Overview → Full (strict)**. Record `am-api` bật Proxied ngay được
vì origin đã có Origin Certificate hợp lệ.

## 6. Test từ bên ngoài

```powershell
curl.exe -i https://am-api.wecoloresoft.com/health
curl.exe -i http://am-api.wecoloresoft.com/health
curl.exe -i https://am-api.wecoloresoft.com/v1/assets
```

| Lệnh | Đạt khi |
| --- | --- |
| 1 | `HTTP/2 200`, header `Server: cloudflare` |
| 2 | `301` chuyển sang `https://` |
| 3 | **`401`** — guard đang bật. Trả `200` là sự cố bảo mật |

Kiểm app khác vẫn sống (thay bằng domain thật của chúng), rồi xác nhận
`TRUST_PROXY_HOPS`:

```bash
docker compose logs app --tail=200 | grep -i "trust proxy"
```

Phải thấy `trust proxy = 2`.

---

API đã ra Internet ở `https://am-api.wecoloresoft.com`. Bước tiếp theo — frontend:
[`../frontend/01-app-vercel.md`](../frontend/01-app-vercel.md).
