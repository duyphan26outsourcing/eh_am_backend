# sql-docs — Migration & script vận hành

Mọi thay đổi schema của Every Half AM đi qua thư mục này. Chạy tay trên Supabase → SQL Editor, **theo đúng thứ tự số**.

| Thứ tự | File | Nội dung | Trạng thái |
| --- | --- | --- | --- |
| 1 | `migrations/01_identity_rbac_audit.sql` | `user_profiles` · `context_role_assignments` · `audit_events` · trigger lịch sử · RLS | ✅ Đã viết |
| 2 | `migrations/02_master_data.sql` | Danh mục nền M02 (phần lõi): `cost_centers` · `locations` · `departments` · `reason_codes` · trigger `updated_at` · RLS | ✅ Đã viết |
| 2b | `migrations/02b_master_data_rpc.sql` | Hàm `create_location` / `update_location` (thay đổi location + audit nguyên tử, BR-AUD-04) | ✅ Đã viết |
| 2c | `migrations/02c_master_data_version.sql` | Bổ sung cột `version` (khoá lạc quan) cho 4 bảng danh mục nền | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2d | `migrations/02d_cost_center_rpc.sql` | Hàm `create_cost_center` / `update_cost_center` (UC-MDM-03 core: tạo + sửa tên, audit nguyên tử) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2e | `migrations/02e_department_rpc.sql` | Hàm `create_department` / `update_department` (UC-MDM-08 core: tạo + sửa tên, audit nguyên tử) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2f | `migrations/02f_reason_code_rpc.sql` | Hàm `create_reason_code` / `update_reason_code` + seed mục 'Khác' mỗi nhóm (UC-MDM-07 core) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2g | `migrations/02g_reason_groups_22.sql` | Mở `reason_group` CHECK lên 22 nhóm (QĐ-06) + seed 'Khác' cho 14 nhóm mới (gồm `CATALOG_DEACTIVATE`, `LOCATION_CLOSE`) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2h | `migrations/02h_deactivate_rpc.sql` | Hàm `deactivate_cost_center` / `deactivate_reason_code` (UC-MDM-03/07.AC.2: khoá dòng, kiểm lý do + "còn dùng", lật INACTIVE, audit) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2i | `migrations/02i_asset_types.sql` | Bảng `asset_types` — cây loại tài sản 2 cấp tự tham chiếu `parent_id` (UC-MDM-04) + trigger + RLS | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2j | `migrations/02j_asset_type_rpc.sql` | Hàm create/update (nhóm + loại) + `deactivate_asset_type` (UC-MDM-04) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
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
