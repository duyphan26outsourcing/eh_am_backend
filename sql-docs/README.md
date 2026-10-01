# sql-docs — Migration & script vận hành

Mọi thay đổi schema của Every Half AM đi qua thư mục này. Chạy tay trên Supabase → SQL Editor, **theo đúng thứ tự số**.

| Thứ tự | File                                             | Nội dung                                                                                                                             | Trạng thái                              |
| ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------- |
| 1      | `migrations/01_identity_rbac_audit.sql`          | `user_profiles` · `context_role_assignments` · `audit_events` · trigger lịch sử · RLS                                                | ✅ Đã viết                              |
| 2      | `migrations/02_master_data.sql`                  | Danh mục nền M02 (phần lõi): `cost_centers` · `locations` · `departments` · `reason_codes` · trigger `updated_at` · RLS              | ✅ Đã viết                              |
| 2b     | `migrations/02b_master_data_rpc.sql`             | Hàm `create_location` / `update_location` (thay đổi location + audit nguyên tử, BR-AUD-04)                                           | ✅ Đã viết                              |
| 2c     | `migrations/02c_master_data_version.sql`         | Bổ sung cột `version` (khoá lạc quan) cho 4 bảng danh mục nền                                                                        | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2d     | `migrations/02d_cost_center_rpc.sql`             | Hàm `create_cost_center` / `update_cost_center` (UC-MDM-03 core: tạo + sửa tên, audit nguyên tử)                                     | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2e     | `migrations/02e_department_rpc.sql`              | Hàm `create_department` / `update_department` (UC-MDM-08 core: tạo + sửa tên, audit nguyên tử)                                       | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2f     | `migrations/02f_reason_code_rpc.sql`             | Hàm `create_reason_code` / `update_reason_code` + seed mục 'Khác' mỗi nhóm (UC-MDM-07 core)                                          | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2g     | `migrations/02g_reason_groups_22.sql`            | Mở `reason_group` CHECK lên 22 nhóm (QĐ-06) + seed 'Khác' cho 14 nhóm mới (gồm `CATALOG_DEACTIVATE`, `LOCATION_CLOSE`)               | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2h     | `migrations/02h_deactivate_rpc.sql`              | Hàm `deactivate_cost_center` / `deactivate_reason_code` (UC-MDM-03/07.AC.2: khoá dòng, kiểm lý do + "còn dùng", lật INACTIVE, audit) | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2i     | `migrations/02i_asset_types.sql`                 | Bảng `asset_types` — cây loại tài sản 2 cấp tự tham chiếu `parent_id` (UC-MDM-04) + trigger + RLS                                    | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2j     | `migrations/02j_asset_type_rpc.sql`              | Hàm create/update (nhóm + loại) + `deactivate_asset_type` (UC-MDM-04)                                                                | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2k     | `migrations/02k_suppliers.sql`                   | Bảng `suppliers` + biên nhận chống gửi trùng cho lệnh ghi (UC-MDM-05)                                                                | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2l     | `migrations/02l_supplier_rpc.sql`                | Hàm create/update/deactivate supplier + audit nguyên tử + idempotency (UC-MDM-05)                                                    | ✅ Đã viết · ✅ đã chạy (+ `gen:types`) |
| 2m     | `migrations/02m_supplier_optional_fields.sql`    | RPC supplier đổi sentinel chuỗi rỗng thành `NULL` cho trường tuỳ chọn                                                                | ✅ Đã chạy                              |
| 2n     | `migrations/02n_location_structured_address.sql` | Lưu tỉnh/phường/địa chỉ chi tiết riêng; RPC location tự ghép địa chỉ trình bày                                                       | ✅ Đã chạy                              |
| 2o     | `migrations/02o_repair_vendors.sql`              | Bảng đơn vị sửa chữa, gắn unique location bên ngoài, receipt idempotency                                                             | ✅ Đã chạy                              |
| 2p     | `migrations/02p_repair_vendor_rpc.sql`           | RPC tạo/sửa/ngừng đơn vị + location và audit nguyên tử                                                                               | ✅ Đã chạy                              |
| 3      | `migrations/03_employee_onboarding.sql`          | Mở rộng hồ sơ, lời mời và RPC tạo nhân viên nguyên tử (UC-IAM-05)                                                                    | ✅ Đã chạy · types và smoke RPC đã xanh |
| 4      | `migrations/04_account_activation.sql`           | Chiếm lời mời, kích hoạt hồ sơ và audit nguyên tử (UC-IAM-06)                                                                        | ✅ Đã chạy                              |
| 5      | `migrations/05_employee_directory.sql`            | Danh bạ nhân viên có tìm kiếm, bộ lọc và phân trang (UC-IAM-15)                                                                      | ✅ Đã chạy                              |
| 6      | `migrations/06_rpc_execute_hardening.sql`          | Thu hồi quyền gọi RPC trực tiếp của `anon`/`authenticated`; chỉ backend `service_role` được gọi                                      | ✅ Đã chạy                              |
| 7      | `migrations/07_resend_activation_invite.sql`       | Tạo lại lời mời kích hoạt và audit nguyên tử (UC-IAM-07)                                                                             | ✅ Đã chạy                              |
| 8      | `migrations/08_grant_role_assignments.sql`         | Cấp vai trò theo phạm vi và hiệu lực (UC-IAM-10, bản nền)                                                                            | ✅ Đã chạy                              |
| 9      | `migrations/09_resend_invite_audit_fix.sql`        | Vá audit cho luồng gửi lại lời mời                                                                                                   | ✅ Đã chạy                              |
| 10     | `migrations/10_grant_role_assignments_fix.sql`     | Vá overlap, idempotency và khoá dữ liệu khi cấp vai trò                                                                              | ✅ Đã chạy                              |
| 11     | `migrations/11_revoke_role_assignment.sql`         | Thu hồi một vai trò, giữ lịch sử và audit nguyên tử (UC-IAM-11)                                                                      | ✅ Đã chạy                              |
| 12     | `migrations/12_lock_unlock_account.sql`            | Khoá/mở khoá tài khoản, thu hồi phiên và audit nguyên tử (UC-IAM-12)                                                                 | ✅ Đã chạy                              |
| 13     | `migrations/13_update_employee_profile.sql`        | Cập nhật hồ sơ, đổi email và theo dõi trạng thái đồng bộ Auth (UC-IAM-08)                                                            | ✅ Đã chạy · `gen:types` đã chạy        |
| 14     | `migrations/14_terminate_employee.sql`             | Cho nhân viên nghỉ việc, đóng vai trò và bàn giao cấp dưới nguyên tử (UC-IAM-13)                                                     | ✅ Đã chạy · `gen:types` đã chạy        |
| —      | `admin-set.sql`                                  | Bootstrap tài khoản quản trị đầu tiên của một môi trường                                                                             | Chạy **sau** migration 01               |

## Quy trình cho một môi trường mới

1. Chạy `migrations/01_identity_rbac_audit.sql`.
2. Supabase → Authentication → Users → **Add user** (tích _Auto Confirm User_).
3. Sửa email trong `admin-set.sql` rồi chạy → mọi dòng kiểm tra phải `PASS`.
4. Ở backend: `npm run gen:types` để sinh lại `src/supabase/database.types.ts`.

## Quy ước khi viết migration mới

- Đánh số tăng dần, **không sửa** migration đã chạy trên môi trường nào — sai thì viết migration mới để sửa.
- Idempotent: `create ... if not exists`, `create or replace function`, `drop trigger if exists` trước `create trigger`.
- Bảng lịch sử/nhật ký: gắn `tg_append_only()`; **không** đặt khoá ngoại có `on delete` lên cột người thực hiện (xem §6 của migration 01).
- Không xoá dữ liệu nghiệp vụ: "xoá" trên giao diện = đổi trạng thái + lý do + audit.
- Bật RLS cho mọi bảng mới (deny-by-default).
