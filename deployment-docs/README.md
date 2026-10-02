# Deployment Docs — EVERY HALF · Asset Management

Tài liệu deploy production cho bản demo EH_AM. Mô hình bám theo các app khác đã
chạy thật trên cùng VPS: **VPS dùng chung + Docker + nginx + Cloudflare** cho
backend, **Vercel** cho frontend. Database dùng **Supabase** (môi trường dev —
xem cảnh báo mục [`00-viec-phai-quyet-truoc.md`](00-viec-phai-quyet-truoc.md)).

## Hai nơi host

| Thành phần | Domain | Nơi host | Công nghệ |
| --- | --- | --- | --- |
| `eh_am_backend` | `am-api.wecoloresoft.com` *(xác nhận lại)* | VPS dùng chung | NestJS 11, Docker |
| `eh_am_frontend` | `am.wecoloresoft.com` | Vercel | Vite + React + TanStack Router (SPA) |

Database và Storage ở **Supabase**: bucket `asset-documents` (chứng từ tài sản,
**phải private**).

> Đây là bản demo cho bài test năng lực. Phạm vi: hạ tầng + module M03 (Hồ sơ
> tài sản). Không mở cho người dùng thật, nên chấp nhận dùng chung project
> Supabase dev — với điều kiện đọc kỹ mục 1 của `00-viec-phai-quyet-truoc.md`.

## Đọc theo thứ tự nào

**Deploy lần đầu:**

1. [`00-viec-phai-quyet-truoc.md`](00-viec-phai-quyet-truoc.md) — các việc phải chốt trước khi gõ lệnh đầu
2. [`database/01-sql-va-storage.md`](database/01-sql-va-storage.md) — migration + bucket + tài khoản admin
3. [`backend/01-chuan-bi-vps.md`](backend/01-chuan-bi-vps.md) — tạo không gian riêng trên VPS đang chạy app khác
4. [`backend/02-deploy-lan-dau.md`](backend/02-deploy-lan-dau.md) — clone, `.env`, `docker compose up`
5. [`backend/04-nginx-tls.md`](backend/04-nginx-tls.md) — đưa API ra Internet
6. [`frontend/01-app-vercel.md`](frontend/01-app-vercel.md) — frontend SPA trên Vercel
7. [`production/01-kiem-tra-sau-deploy.md`](production/01-kiem-tra-sau-deploy.md) — nghiệm thu

**Các lần sau, khi có code mới:**

- Backend: [`backend/03-cap-nhat-deploy-lai.md`](backend/03-cap-nhat-deploy-lai.md) — 3 lệnh
- Frontend: `git push`, Vercel tự build
- Có SQL mới: chạy SQL trên Supabase **TRƯỚC** khi deploy code

## Không được đụng vào — VPS dùng chung nhiều app

VPS này còn chạy vài app nội bộ khác, **mỗi app một user Linux + một cổng
loopback riêng**. nginx, Docker engine, UFW và cổng 80/443 là tài nguyên dùng
chung. Thêm site mới thì được; `systemctl reload nginx` được. Nhưng trùng bất kỳ
giá trị riêng nào của EH_AM với app khác sẽ làm chúng ghi đè nhau.

| Hạng mục | Giá trị EH_AM |
| --- | --- |
| User Linux | `ehamdeploy` |
| Thư mục | `/home/ehamdeploy/eh_am_backend` |
| Cổng loopback | `127.0.0.1:3006` (các app khác đã dùng `3001`, `3003`, `3005`) |
| Container | `eh-am-backend` |
| Compose project | `eh-am` (khai trong `docker-compose.yml`) |
| nginx site | `am-api.wecoloresoft.com` |
| Origin cert | `/etc/nginx/ssl/wecoloresoft-origin.pem` (+ `.key`) |

⚠️ **Đừng bao giờ chạy `docker system prune -a` trên máy này** — nó xoá image của
mọi app trên VPS. Cần dọn ổ đĩa thì `docker image prune -f` (chỉ xoá image không
còn container nào dùng).

## Bất biến, đừng đổi khi không hiểu vì sao

- **Compose chỉ publish ra `127.0.0.1:3006`, không phải `0.0.0.0`.** Publish ra
  `0.0.0.0` tự thêm rule iptables đứng trước UFW — API lộ thẳng ra Internet dù
  UFW không mở cổng. Xem ghi chú trong [`../docker-compose.yml`](../docker-compose.yml).
- **File trên VPS phải tên đúng `.env`**, không phải `.env.production.local`.
- **`TRUST_PROXY_HOPS=2`** — khớp chuỗi `Cloudflare → nginx → Express`. Sai số
  này thì `clientIp()` trả `127.0.0.1` cho mọi người dùng, rate limit dồn một rổ,
  và cột `ip_address` của bảng audit chỉ-ghi-thêm ghi sai vĩnh viễn.
- **TLS giữa Cloudflare và VPS dùng Cloudflare Origin Certificate**, SSL/TLS mode
  luôn **Full (strict)**, không bao giờ Flexible.
- **`SUPABASE_SECRET_KEY` chỉ ở backend.** Không bao giờ vào repo frontend, biến
  `VITE_*`, hay log.
- **Bucket `asset-documents` phải private.** Nó chứa chứng từ tài sản (hoá đơn,
  PO). Đặt public là mọi tệp đọc được bởi ai đoán ra đường dẫn.
- **Dùng npm, không pnpm/yarn.**

## Cổng 3006, giữ ở mọi môi trường

Dev và production đều dùng `3006`. Lý do ghi trong [`../Dockerfile`](../Dockerfile)
(EXPOSE + HEALTHCHECK) và `src/main.ts`. Đổi cổng phải sửa đồng bộ bốn nơi: `.env`
(`PORT`), `docker-compose.yml` (`127.0.0.1:<port>:<port>`), `Dockerfile` (`EXPOSE`
+ URL trong `HEALTHCHECK`), nginx (`proxy_pass`).
