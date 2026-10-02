# Backend — chuẩn bị không gian riêng trên VPS dùng chung

> Làm đúng **một lần**. VPS đã có sẵn Docker, nginx, UFW từ các lần dựng app
> trước, nên phần cài hệ thống hầu như đã xong. Việc còn lại là tạo một không
> gian tách biệt cho EH_AM.

VPS: Ubuntu, thay `<VPS_IP>` bằng IP thật.

## Vì sao tách user Linux thay vì để chung

Nhiều app chung một home nghĩa là chung quyền đọc `.env`. Mỗi `.env` chứa
**service role key của Supabase** — chìa khoá bỏ qua toàn bộ RLS **và** mở được
bucket `asset-documents` (chứng từ tài sản). Tách user thì một lỗ hổng bên này
không tự đọc được bí mật bên kia, và `chmod 600 .env` mới thật sự có nghĩa.

Docker vẫn dùng chung engine (cùng daemon, cùng image cache) — đó là chủ ý, đỡ
tốn ổ đĩa và RAM.

## 1. SSH vào bằng root

```bash
ssh root@<VPS_IP>
```

## 2. Tạo user `ehamdeploy`

```bash
adduser ehamdeploy
usermod -aG sudo ehamdeploy
usermod -aG docker ehamdeploy
```

`adduser` hỏi mật khẩu — gõ **bằng bàn phím thật**, đừng dán (một số terminal
không nhận paste vào ô ẩn ký tự rồi báo "No password has been supplied"). Các
câu Full Name/Room Number cứ Enter bỏ qua.

## 3. Kiểm tra nhóm quyền

```bash
exit
ssh ehamdeploy@<VPS_IP>
groups
```

Phải thấy cả `sudo` và `docker`. Thiếu `docker` thì đổi nhóm chưa áp dụng cho
phiên đang mở — đăng nhập lại.

```bash
docker run hello-world
```

Phải thấy `Hello from Docker!`. Báo `permission denied ... docker.sock` là chưa
đăng nhập lại sau khi vào nhóm `docker`.

## 4. Xác nhận cổng 3006 còn trống

```bash
sudo ss -tlnp | grep -E ':(3001|3003|3005|3006)\b'
```

Phải thấy `3001`, `3003`, `3005` đang bị các app khác chiếm, và **không** thấy
`3006`. Nếu `3006` đã có tiến trình khác, chọn cổng khác và sửa đồng bộ **bốn**
nơi:

| Nơi | Dòng |
| --- | --- |
| `.env` trên VPS | `PORT=3006` |
| `docker-compose.yml` | `- '127.0.0.1:3006:3006'` |
| `Dockerfile` | `EXPOSE 3006` **và** URL trong `HEALTHCHECK` |
| nginx site | `proxy_pass http://127.0.0.1:3006;` |

⚠️ Quên `HEALTHCHECK` trong `Dockerfile` là lỗi khó chịu nhất: app chạy đúng
nhưng container mãi `unhealthy` vì healthcheck gọi cổng cũ.

## 5. Kiểm tra tài nguyên còn lại

VPS này sắp nuôi thêm một backend Node nữa.

```bash
free -h
df -h /
docker stats --no-stream
swapon --show
```

Mỗi container NestJS nghỉ chiếm ~150–250 MB RAM; `npm ci` lúc build cần thêm vài
trăm MB. RAM trống nên còn ≥ 500 MB **sau khi** tất cả container chạy. Chưa đủ thì
bật swap trước để build không bị OOM kill:

```bash
# Nếu swapon --show đã có /swapfile thì bỏ qua
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

Ổ đĩa cần ít nhất ~3 GB trống cho image mới.

⚠️ Ổ gần đầy thì `docker image prune -f` (chỉ xoá image không còn container nào
dùng). **Không bao giờ** `docker system prune -a` — nó xoá image của mọi app
trên VPS.

## 6. Firewall không cần đổi

```bash
sudo ufw status
```

Phải thấy `OpenSSH`, `80/tcp`, `443/tcp` đang `ALLOW`. **Không mở thêm 3006** —
container chỉ publish ra `127.0.0.1`, traffic từ Internet đi qua nginx ở 443. Mở
`3006` ra Internet là bỏ qua TLS + rate limit của nginx, và làm
`TRUST_PROXY_HOPS=2` trở thành sai.

---

Không gian đã sẵn sàng. Bước tiếp theo: [`02-deploy-lan-dau.md`](02-deploy-lan-dau.md).
