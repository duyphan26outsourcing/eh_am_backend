# Database — chạy SQL và chuẩn bị Storage (lần đầu)

> Dùng project Supabase như đã chốt ở
> [`../00-viec-phai-quyet-truoc.md`](../00-viec-phai-quyet-truoc.md) mục 1 (bản
> demo dùng chung project dev). Mọi lệnh chạy trong **SQL Editor** của project đó.

## 1. Chạy migration theo đúng thứ tự

Migration là các file `.sql` đánh số trong [`../../sql-docs/migrations/`](../../sql-docs/migrations/),
chạy **tay** trong SQL Editor, **đúng thứ tự số**. Quy tắc đầy đủ ở
[`../../sql-docs/README.md`](../../sql-docs/README.md).

```text
01_...  → ... → 22_asset_documents.sql → 23_asset_documents_hardening.sql → ...
```

- Mỗi file idempotent (chạy lại không hỏng), nhưng vẫn chạy **lần lượt**, xong
  file này mới sang file sau, và đọc kết quả mỗi lần.
- Nếu project đã chạy một phần (vì đang dùng chung dev), chỉ chạy các file **chưa**
  chạy. `23_asset_documents_hardening.sql` phải chạy sau `22`.

## 2. Tạo tài khoản admin đầu tiên (break-glass)

Sau khi migration xong, chạy [`../../sql-docs/admin-set.sql`](../../sql-docs/admin-set.sql)
để nâng một user lên quản trị tối cao (`app_metadata.role = 'admin'`).

- User phải tồn tại trước trong Supabase Auth (đăng ký qua app hoặc tạo ở
  Dashboard → Authentication → Users).
- Email + mật khẩu admin ghi ở `admin-account.md` (file này **đã bị gitignore**,
  không commit).

## 3. Kiểm bucket `asset-documents` là private

```powershell
# Phải trả 400/404 — KHÔNG được trả file
curl.exe -i "https://<project-ref>.supabase.co/storage/v1/object/public/asset-documents/test.pdf"
```

Trả `200` kèm nội dung là bucket đang public → Dashboard → Storage →
`asset-documents` → tắt Public bucket. (Migration 22 tạo bucket private sẵn; mục
này chỉ xác nhận.)

## 4. Sinh lại types sau khi schema đổi

Trên máy local, sau khi migration chạy xong:

```bash
npm run gen:types
```

Lệnh suy project ref từ `SUPABASE_URL` trong `.env`. Commit `src/supabase/database.types.ts`
nếu nó đổi.

⚠️ Không chuyển hướng output của Supabase CLI bằng `>` trong PowerShell 5.1 — toán
tử đó ghi UTF-16LE làm hỏng file types. Luôn dùng `npm run gen:types`.

## 5. Dọn dữ liệu rác trước khi đưa link demo

Vì dùng chung project dev, trước khi gửi link cho người chấm nên dọn các bản ghi
thử. Lưu ý `audit_events` và `asset_events` chỉ-ghi-thêm (trigger chặn xoá cả
`service_role`) — không dọn được, nên hạn chế thao tác thử sinh rác ngay từ đầu.

---

## Các lần sau có SQL mới

- Chạy file SQL mới trên Supabase **TRƯỚC** khi deploy code backend dùng tới nó.
- Migration phải **cộng thêm**, giữ tương thích ngược (cột mới thêm thì code cũ vẫn
  chạy), để rollback code không vỡ.
- Không sửa migration đã chạy; sai thì viết migration mới để sửa.
