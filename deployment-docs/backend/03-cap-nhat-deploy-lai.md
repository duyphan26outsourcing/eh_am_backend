# Backend — deploy bản code mới (VPS đã chạy sẵn)

Dùng cho MỌI lần sau lần đầu.

## Trên máy local

```powershell
cd C:\Users\Admin\development\everyhalf\eh_am_backend

npm run format
npx tsc --noEmit
npx eslint src test
npm test

git add -A
git commit -m "mô tả thay đổi"
git push origin main
```

Bốn lệnh kiểm tra không phải thủ tục. VPS build bằng `npm ci --omit=dev` và
`nest build`; lỗi TypeScript trên đó hiện ra dưới dạng build fail giữa chừng hoặc
container `Restarting` — chậm và khó đọc hơn sửa ở local.

## Trên VPS

```bash
ssh ehamdeploy@<VPS_IP>
cd eh_am_backend
git pull
docker compose up -d --build
```

`docker compose up -d --build` tự build lại image với code mới, dừng container cũ,
khởi động container mới. **Không cần** `docker compose down` trước — làm vậy chỉ
kéo dài thời gian ngừng dịch vụ.

## Kiểm tra

```bash
docker compose ps
docker compose logs app --tail=50
curl -i http://127.0.0.1:3006/health
curl -i http://127.0.0.1:3006/v1/assets
```

`eh-am-backend` phải `Up (healthy)`, log không lỗi, `/health` trả `200`, và
`/v1/assets` trả **`401`**.

Rồi kiểm từ ngoài Internet:

```powershell
curl.exe -i https://am-api.wecoloresoft.com/health
```

## Quay lại bản trước khi có sự cố

```bash
cd ~/eh_am_backend
git log --oneline -5
git checkout <commit-hash-bản-chạy-được>
docker compose up -d --build
# xong việc thì quay lại nhánh
git checkout main
```

⚠️ Rollback code **không** rollback database. Nếu bản lỗi đi kèm migration SQL đã
chạy, schema vẫn ở trạng thái mới. Đây là lý do migration phải **cộng thêm**,
không phá vỡ tương thích ngược: cột mới thêm thì code cũ vẫn chạy, cột bị xoá thì
không.

---

## Khi nào cần thêm bước khác

| Tình huống | Việc thêm |
| --- | --- |
| Có file SQL mới | Chạy SQL trên Supabase **TRƯỚC** khi deploy code, rồi `npm run gen:types` ở local và commit `database.types.ts` |
| Thêm biến môi trường mới | `nano ~/eh_am_backend/.env`, thêm dòng, `chmod 600 .env`, rồi `docker compose up -d --build` |
| Sửa `Dockerfile`/`docker-compose.yml` | Vẫn `docker compose up -d --build` — Compose tự phát hiện hai file này đổi |
| Đổi `CORS_ORIGINS` | Sửa `.env` rồi dựng lại container. Compose nạp `.env` lúc **tạo container**, không phải lúc build |
| Đổi cấu hình nginx/TLS | [`04-nginx-tls.md`](04-nginx-tls.md); không cần dựng lại container |
| Đổi giới hạn dung lượng chứng từ | Sửa **cả** hằng kích thước ở backend **và** `client_max_body_size` trong nginx; sửa một bên thì nginx chặn trước khi backend kịp trả lỗi tử tế |
| Ổ đĩa VPS sắp đầy | `docker image prune -f`. ⚠️ **Không bao giờ** `docker system prune -a` — nó xoá image của mọi app trên VPS |
