# Danh mục tác nhân

Use case chỉ dùng tác nhân trong bảng này, viết đúng tên ở cột "Tác nhân". Chín nhóm người dùng và mã vai trò lấy nguyên từ §8 của Master Blueprint; cột "Dùng ở module" lấy từ §13 và bảng job ở §15.

| Tác nhân | Loại | Mô tả | Mã vai trò | Dùng ở module |
| --- | --- | --- | --- | --- |
| Ban giám đốc | Người | Xem tổng tài sản, phân bổ theo điểm, tài sản mất và hỏng; duyệt thanh lý và xác nhận mất theo hạn mức (Q-08). Phạm vi toàn hệ thống | `EXECUTIVE` | M08, M11 |
| Kế toán trưởng | Người | Chốt chính sách kế toán tài sản, duyệt điều chỉnh thông tin tài chính; ở GĐ2 phụ trách khấu hao và FAST. Phạm vi toàn hệ thống | `CHIEF_ACCOUNTANT` | M03, M11; GĐ2: M09, M10 |
| Kế toán tài sản | Người | Nhập và điều chỉnh nguyên giá, hoá đơn, chứng từ; ghi nhận thực hiện thanh lý (§14.8); ở GĐ2 liên kết mã FAST và đối soát. Phạm vi toàn hệ thống | `ASSET_ACCOUNTANT` | M03, M08, M11; GĐ2: M09, M10 |
| Quản lý tài sản | Người | Lập hồ sơ, in nhãn, điều phối điều chuyển và sửa chữa, tổ chức đợt kiểm kê, rà kết quả. Phạm vi toàn hệ thống | `ASSET_MANAGER` | M02 đến M08, M11 |
| Quản lý điểm | Người | Quản lý cửa hàng, thủ kho, quản lý xưởng rang, người phụ trách văn phòng (D-09). Chịu trách nhiệm tài sản tại điểm; xuất và nhận hàng; duyệt kết quả kiểm kê của điểm; báo hỏng; đề nghị thanh lý. Phạm vi các location được gán | `LOCATION_MANAGER` | M03 đến M08, M11 |
| Nhân viên điểm | Người | Quét kiểm kê, báo hỏng, tra cứu tài sản bằng QR. Phạm vi một location | `LOCATION_STAFF` | M04, M05, M07 |
| Kỹ thuật viên | Người | Nhận yêu cầu sửa, cập nhật tiến độ, ghi kết quả sửa; chỉ có khi Every Half có đội kỹ thuật nội bộ (Q-14) | `TECHNICIAN` | M07 |
| Kiểm soát nội bộ | Người | Tra nhật ký thay đổi theo tài sản, người, thời gian; xuất báo cáo. Phạm vi toàn hệ thống, chỉ đọc | `AUDITOR` | M11, M12 |
| Quản trị hệ thống | Người | Tạo tài khoản, gán vai trò theo location, quản lý danh mục nền và cấu hình | `SYSTEM_ADMIN` | M01, M02, M12 |
| Nhân viên có tài khoản | Người | Nhân viên thuộc bất kỳ nhóm nào ở §8, có tài khoản đang hoạt động. Chỉ dùng cho thao tác trên chính tài khoản của mình: đăng nhập, mật khẩu, hồ sơ cá nhân, hộp việc, thông báo | Mọi vai trò | M01, M12 |
| Người được mời | Người | Người đã nhận email mời nhưng chưa kích hoạt tài khoản | Chưa có | M01 |
| Bộ lập lịch | Thời gian | Job chạy theo lịch ở §15: mở đợt kiểm kê tháng, nhắc hạn, cảnh báo quá hạn, gửi thông báo. Ghi nhật ký với tên tác nhân này (§16) | Không áp dụng | M05, M06, M08, M12 |
| Dịch vụ xác thực | Hệ thống | Supabase Auth: tài khoản, mật khẩu, phiên đăng nhập, email xác nhận và đặt lại mật khẩu | Không áp dụng | M01 |
| Dịch vụ email | Hệ thống | Gửi email giao dịch và email thông báo | Không áp dụng | M01, M12 |
| Dịch vụ lưu trữ tệp | Hệ thống | Supabase Storage: ảnh tài sản, ảnh bằng chứng, chứng từ, file nhập và file xuất | Không áp dụng | M03, M05, M07, M08, M11 |
| FAST | Hệ thống | Phần mềm kế toán của Every Half; chỉ tham gia từ GĐ2 | Không áp dụng | GĐ2: M08, M09, M10 |
| Đơn vị sửa chữa | Bên ngoài | Đối tác sửa chữa, bảo hành; không đăng nhập ở GĐ1 (A-07), chỉ xuất hiện như location bên ngoài (D-02) | Không áp dụng | M06, M07 |

Ghi chú:

- "Nhân viên có tài khoản" chỉ làm tác nhân chính khi UC không phụ thuộc vai trò. UC nào chỉ một số vai trò được làm thì ghi đúng các vai trò đó.
- Khi một UC cho nhiều vai trò cùng làm (ví dụ Quản lý điểm và Quản lý tài sản cùng tạo phiếu điều chuyển), tác nhân chính ghi vai trò làm thường xuyên nhất, vai trò còn lại ghi ở tác nhân phụ kèm ngoặc "(cũng thực hiện được)".
