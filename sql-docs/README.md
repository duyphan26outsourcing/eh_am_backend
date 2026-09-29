# sql-docs — Migration & script vận hành

Mọi thay đổi schema của Every Half AM đi qua thư mục này. Chạy tay trên Supabase → SQL Editor, **theo đúng thứ tự số**.

| Thứ tự | File | Nội dung | Trạng thái |
| --- | --- | --- | --- |
| 1 | `migrations/01_identity_rbac_audit.sql` | `user_profiles` · `context_role_assignments` · `audit_events` · trigger lịch sử · RLS | ✅ Đã viết · ⏳ chưa chạy (chờ project Supabase) |
| — | `admin-set.sql` | Bootstrap tài khoản quản trị đầu tiên của một môi trường | Chạy **sau** migration 01 |

## Quy trình cho một môi trường mới

1. Chạy `migrations/01_identity_rbac_audit.sql`.
2. Supabase → Authentication → Users → **Add user** (tích *Auto Confirm User*).
3. Sửa email trong `admin-set.sql` rồi chạy → mọi dòng kiểm tra phải `PASS`.
4. Ở backend: `npm run gen:types` để sinh lại `src/supabase/database.types.ts`.

## Quy ước khi viết migration mới

- Đánh số tăng dần, **không sửa** migration đã chạy trên môi trường nào — sai thì viết migration mới để sửa.
- Idempotent: `create ... if not exists`, `create or replace function`, `drop trigger if exists` trước `create trigger`.
- Bảng lịch sử/nhật ký: gắn `tg_append_only()`; **không** đặt khoá ngoại có `on delete` lên cột người thực hiện (xem §6 của migration 01).
- Không xoá dữ liệu nghiệp vụ: "xoá" trên giao diện = đổi trạng thái + lý do + audit.
- Bật RLS cho mọi bảng mới (deny-by-default).
