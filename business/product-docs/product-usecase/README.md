# Bộ use case EH-AM

Bộ use case (UC) cho các module GĐ1 của EH-AM, viết từ Master Blueprint 1.0 (`business/product-docs/product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md`). Mỗi UC mô tả một tác nhân làm xong một việc trong một phiên làm việc, đủ để dev dựng API, màn hình và để QA viết test case.

## Cách đọc

Mở danh sách UC bên dưới, tìm UC theo module hoặc theo mã tính năng ở ma trận truy vết. Mỗi file UC theo mẫu 13 trường ở `_chung/mau-uc.md`. Tác nhân, thuật ngữ, quy tắc nghiệp vụ dùng chung nằm trong `_chung/`; UC chỉ tham chiếu quy tắc theo mã `BR-`, không chép lại. Mỗi module có một `_checklist.md` ghi kết quả checklist 20 điểm của từng UC.

| Thư mục hoặc file | Nội dung |
| --- | --- |
| `_chung/mau-uc.md` | Mẫu UC 13 trường và quy ước viết |
| `_chung/mau-checklist.md` | Mẫu checklist 20 điểm |
| `_chung/tac-nhan.md` | Danh mục tác nhân |
| `_chung/thuat-ngu.md` | Thuật ngữ |
| `_chung/quy-tac-nghiep-vu.md` | Quy tắc nghiệp vụ BR, sinh từ §14 của blueprint |
| `M01-nguoi-dung-phan-quyen/` | UC của M01: Người dùng và phân quyền |
| `M02-danh-muc-nen/` | UC của M02: Danh mục nền |
| `M03-ho-so-tai-san/` | UC của M03: Hồ sơ tài sản và CCDC |
| `M04-qr-nhan/` | UC của M04: QR và nhãn |
| `M05-kiem-ke/` | UC của M05: Kiểm kê |
| `M06-dieu-chuyen/` | UC của M06: Điều chuyển |
| `M07-sua-chua-bao-tri/` | UC của M07: Báo hỏng, sửa chữa và bảo trì |
| `M08-thanh-ly-bao-giam/` | UC của M08: Thanh lý và báo giảm |
| `M11-dashboard-bao-cao/` | UC của M11: Dashboard và báo cáo |
| `M12-nhat-ky-thong-bao/` | UC của M12: Nhật ký, lịch sử và thông báo |

## Quy ước mã và tên file

| Loại | Mẫu | Ví dụ |
| --- | --- | --- |
| Mã UC | `UC-<mã module>-<nn>` | `UC-AST-01` |
| Tên file | `<Mã UC>_<ten-uc-khong-dau>.md` | `UC-AST-01_tao-ho-so-tai-san.md` |
| Luồng thay thế | `<Mã UC>.AC.<n>` | `UC-AST-01.AC.1` |
| Ngoại lệ | `<Mã UC>.EX.<n>` | `UC-AST-01.EX.2` |
| Vấn đề mở trong một UC | `[TBD-<n>]` | `[TBD-1]` |
| Điểm bàn giao giữa UC | `HO-<nn>` | `HO-03` |

Mã module: IAM (M01), MDM (M02), AST (M03), QR (M04), STK (M05), TRF (M06), MNT (M07), DSP (M08), DSH (M11), AUD (M12). M09 khấu hao và M10 tích hợp FAST thuộc GĐ2, chưa có UC.

## Độ ưu tiên và mức mục tiêu

| Giá trị | Nghĩa |
| --- | --- |
| Cao | Thiếu UC này thì MVP1 không vận hành được |
| Trung bình | Cần cho MVP1 nhưng có cách làm tạm trong vài tuần đầu |
| Thấp | Để sau MVP1 cũng được |
| Mục tiêu người dùng | Một tác nhân làm xong một việc trong một phiên |
| Chức năng con | Bước dùng chung, được UC khác gọi qua trường Bao gồm |
| Hệ thống | Việc do Bộ lập lịch chạy theo lịch |

## Danh sách UC

Tổng 83 UC: M01 có 15, M02 có 8, M03 có 12, M04 có 6, M05 có 8, M06 có 7, M07 có 9, M08 có 6, M11 có 6, M12 có 6.

| Mã UC | Tên UC | Module | Tính năng | Tác nhân chính | Mức mục tiêu | Ưu tiên | GĐ | File |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UC-IAM-01 | Đăng nhập vào EH-AM | M01 | F-IAM-01 | Nhân viên có tài khoản | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-01](M01-nguoi-dung-phan-quyen/UC-IAM-01_dang-nhap-vao-eh-am.md) |
| UC-IAM-02 | Đăng xuất khỏi EH-AM | M01 | F-IAM-01 | Nhân viên có tài khoản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-IAM-02](M01-nguoi-dung-phan-quyen/UC-IAM-02_dang-xuat-khoi-eh-am.md) |
| UC-IAM-03 | Đặt lại mật khẩu khi quên | M01 | F-IAM-02 | Nhân viên có tài khoản | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-03](M01-nguoi-dung-phan-quyen/UC-IAM-03_dat-lai-mat-khau-khi-quen.md) |
| UC-IAM-04 | Đổi mật khẩu đang dùng | M01 | F-IAM-02 | Nhân viên có tài khoản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-IAM-04](M01-nguoi-dung-phan-quyen/UC-IAM-04_doi-mat-khau-dang-dung.md) |
| UC-IAM-05 | Thêm nhân viên mới | M01 | F-IAM-03 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-05](M01-nguoi-dung-phan-quyen/UC-IAM-05_them-nhan-vien-moi.md) |
| UC-IAM-06 | Kích hoạt tài khoản được mời | M01 | F-IAM-08 | Người được mời | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-06](M01-nguoi-dung-phan-quyen/UC-IAM-06_kich-hoat-tai-khoan-duoc-moi.md) |
| UC-IAM-07 | Gửi lại lời mời kích hoạt | M01 | F-IAM-08 | Quản trị hệ thống | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-IAM-07](M01-nguoi-dung-phan-quyen/UC-IAM-07_gui-lai-loi-moi-kich-hoat.md) |
| UC-IAM-08 | Cập nhật hồ sơ nhân viên | M01 | F-IAM-09 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-08](M01-nguoi-dung-phan-quyen/UC-IAM-08_cap-nhat-ho-so-nhan-vien.md) |
| UC-IAM-09 | Xem sơ đồ tổ chức | M01 | F-IAM-10 | Quản trị hệ thống | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-IAM-09](M01-nguoi-dung-phan-quyen/UC-IAM-09_xem-so-do-to-chuc.md) |
| UC-IAM-10 | Gán vai trò theo location | M01 | F-IAM-04 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-10](M01-nguoi-dung-phan-quyen/UC-IAM-10_gan-vai-tro-theo-location.md) |
| UC-IAM-11 | Thu hồi vai trò theo location | M01 | F-IAM-04 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-11](M01-nguoi-dung-phan-quyen/UC-IAM-11_thu-hoi-vai-tro-theo-location.md) |
| UC-IAM-12 | Khoá hoặc mở khoá tài khoản | M01 | F-IAM-05 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-12](M01-nguoi-dung-phan-quyen/UC-IAM-12_khoa-hoac-mo-khoa-tai-khoan.md) |
| UC-IAM-13 | Cho nhân viên nghỉ việc | M01 | F-IAM-11 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-IAM-13](M01-nguoi-dung-phan-quyen/UC-IAM-13_cho-nhan-vien-nghi-viec.md) |
| UC-IAM-14 | Xem hồ sơ cá nhân và đổi ngôn ngữ | M01 | F-IAM-06 | Nhân viên có tài khoản | Mục tiêu người dùng | Thấp | GĐ1 | [UC-IAM-14](M01-nguoi-dung-phan-quyen/UC-IAM-14_xem-ho-so-ca-nhan-va-doi-ngon-ngu.md) |
| UC-IAM-15 | Tra cứu danh sách nhân viên | M01 | F-IAM-07 | Quản trị hệ thống | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-IAM-15](M01-nguoi-dung-phan-quyen/UC-IAM-15_tra-cuu-danh-sach-nhan-vien.md) |
| UC-MDM-01 | Cập nhật danh mục location | M02 | F-MDM-01 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-MDM-01](M02-danh-muc-nen/UC-MDM-01_cap-nhat-danh-muc-location.md) |
| UC-MDM-02 | Đóng location ngừng hoạt động | M02 | F-MDM-02 | Quản trị hệ thống | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MDM-02](M02-danh-muc-nen/UC-MDM-02_dong-location-ngung-hoat-dong.md) |
| UC-MDM-03 | Cập nhật danh mục cost center | M02 | F-MDM-03 | Quản trị hệ thống | Mục tiêu người dùng | Cao | GĐ1 | [UC-MDM-03](M02-danh-muc-nen/UC-MDM-03_cap-nhat-danh-muc-cost-center.md) |
| UC-MDM-04 | Cập nhật cây loại tài sản | M02 | F-MDM-04 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-MDM-04](M02-danh-muc-nen/UC-MDM-04_cap-nhat-cay-loai-tai-san.md) |
| UC-MDM-05 | Cập nhật danh mục nhà cung cấp | M02 | F-MDM-05 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MDM-05](M02-danh-muc-nen/UC-MDM-05_cap-nhat-danh-muc-nha-cung-cap.md) |
| UC-MDM-06 | Cập nhật danh mục đơn vị sửa chữa | M02 | F-MDM-06 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MDM-06](M02-danh-muc-nen/UC-MDM-06_cap-nhat-danh-muc-don-vi-sua-chua.md) |
| UC-MDM-07 | Cập nhật danh mục lý do | M02 | F-MDM-07 | Quản trị hệ thống | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MDM-07](M02-danh-muc-nen/UC-MDM-07_cap-nhat-danh-muc-ly-do.md) |
| UC-MDM-08 | Cập nhật danh mục phòng ban | M02 | F-MDM-08 | Quản trị hệ thống | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MDM-08](M02-danh-muc-nen/UC-MDM-08_cap-nhat-danh-muc-phong-ban.md) |
| UC-AST-01 | Tạo hồ sơ tài sản | M03 | F-AST-01 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-AST-01](M03-ho-so-tai-san/UC-AST-01_tao-ho-so-tai-san.md) |
| UC-AST-02 | Nhập danh sách tài sản từ file | M03 | F-AST-02 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-AST-02](M03-ho-so-tai-san/UC-AST-02_nhap-danh-sach-tai-san-tu-file.md) |
| UC-AST-03 | Sửa thông tin mô tả tài sản | M03 | F-AST-03 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-03](M03-ho-so-tai-san/UC-AST-03_sua-thong-tin-mo-ta-tai-san.md) |
| UC-AST-04 | Điều chỉnh thông tin tài chính tài sản | M03 | F-AST-04 | Kế toán tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-AST-04](M03-ho-so-tai-san/UC-AST-04_dieu-chinh-thong-tin-tai-chinh-tai-san.md) |
| UC-AST-05 | Đổi người chịu trách nhiệm tài sản | M03 | F-AST-05 | Quản lý điểm | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-05](M03-ho-so-tai-san/UC-AST-05_doi-nguoi-chiu-trach-nhiem-tai-san.md) |
| UC-AST-06 | Đính kèm chứng từ tài sản | M03 | F-AST-06 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-06](M03-ho-so-tai-san/UC-AST-06_dinh-kem-chung-tu-tai-san.md) |
| UC-AST-07 | Tra cứu danh sách tài sản | M03 | F-AST-07, F-AST-10 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-AST-07](M03-ho-so-tai-san/UC-AST-07_tra-cuu-danh-sach-tai-san.md) |
| UC-AST-08 | Xem hồ sơ chi tiết tài sản | M03 | F-AST-08 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-AST-08](M03-ho-so-tai-san/UC-AST-08_xem-ho-so-chi-tiet-tai-san.md) |
| UC-AST-09 | Đề nghị huỷ hồ sơ tạo sai | M03 | F-AST-09 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-09](M03-ho-so-tai-san/UC-AST-09_de-nghi-huy-ho-so-tao-sai.md) |
| UC-AST-10 | Duyệt huỷ hồ sơ tạo sai | M03 | F-AST-09 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-10](M03-ho-so-tai-san/UC-AST-10_duyet-huy-ho-so-tao-sai.md) |
| UC-AST-11 | Đưa vào hoặc ngừng sử dụng tài sản | M03 | F-AST-11 | Quản lý điểm | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-11](M03-ho-so-tai-san/UC-AST-11_dua-vao-hoac-ngung-su-dung-tai-san.md) |
| UC-AST-12 | Duyệt điều chỉnh thông tin tài chính | M03 | F-AST-04 | Kế toán trưởng | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AST-12](M03-ho-so-tai-san/UC-AST-12_duyet-dieu-chinh-thong-tin-tai-chinh.md) |
| UC-QR-01 | Sinh mã QR cho tài sản | M04 | F-QR-01 | Quản lý tài sản | Chức năng con | Cao | GĐ1 | [UC-QR-01](M04-qr-nhan/UC-QR-01_sinh-ma-qr-cho-tai-san.md) |
| UC-QR-02 | In nhãn QR theo lô | M04 | F-QR-02 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-QR-02](M04-qr-nhan/UC-QR-02_in-nhan-qr-theo-lo.md) |
| UC-QR-03 | Xác nhận dán nhãn tài sản | M04 | F-QR-03 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-QR-03](M04-qr-nhan/UC-QR-03_xac-nhan-dan-nhan-tai-san.md) |
| UC-QR-04 | Quét QR nhận diện tài sản | M04 | F-QR-04, F-QR-05 | Nhân viên điểm | Chức năng con | Cao | GĐ1 | [UC-QR-04](M04-qr-nhan/UC-QR-04_quet-qr-nhan-dien-tai-san.md) |
| UC-QR-05 | Tra cứu tài sản bằng QR | M04 | F-QR-04 | Nhân viên điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-QR-05](M04-qr-nhan/UC-QR-05_tra-cuu-tai-san-bang-qr.md) |
| UC-QR-06 | In lại nhãn QR | M04 | F-QR-06 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-QR-06](M04-qr-nhan/UC-QR-06_in-lai-nhan-qr.md) |
| UC-STK-01 | Lập đợt kiểm kê | M05 | F-STK-01 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-STK-01](M05-kiem-ke/UC-STK-01_lap-dot-kiem-ke.md) |
| UC-STK-02 | Mở đợt kiểm kê tháng tự động | M05 | F-STK-02 | Bộ lập lịch | Hệ thống | Trung bình | GĐ1 | [UC-STK-02](M05-kiem-ke/UC-STK-02_mo-dot-kiem-ke-thang-tu-dong.md) |
| UC-STK-03 | Quét kiểm kê tại điểm | M05 | F-STK-03, F-STK-04 | Nhân viên điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-STK-03](M05-kiem-ke/UC-STK-03_quet-kiem-ke-tai-diem.md) |
| UC-STK-04 | Chốt kết quả kiểm kê của điểm | M05 | F-STK-05 | Nhân viên điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-STK-04](M05-kiem-ke/UC-STK-04_chot-ket-qua-kiem-ke-cua-diem.md) |
| UC-STK-05 | Duyệt kết quả kiểm kê của điểm | M05 | F-STK-06 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-STK-05](M05-kiem-ke/UC-STK-05_duyet-ket-qua-kiem-ke-cua-diem.md) |
| UC-STK-06 | Xử lý chênh lệch kiểm kê | M05 | F-STK-07 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-STK-06](M05-kiem-ke/UC-STK-06_xu-ly-chenh-lech-kiem-ke.md) |
| UC-STK-07 | Xem báo cáo kiểm kê | M05 | F-STK-08 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-STK-07](M05-kiem-ke/UC-STK-07_xem-bao-cao-kiem-ke.md) |
| UC-STK-08 | Xác minh tài sản nghi mất | M05 | F-STK-09 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-STK-08](M05-kiem-ke/UC-STK-08_xac-minh-tai-san-nghi-mat.md) |
| UC-TRF-01 | Tạo phiếu điều chuyển tài sản | M06 | F-TRF-01 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-TRF-01](M06-dieu-chuyen/UC-TRF-01_tao-phieu-dieu-chuyen-tai-san.md) |
| UC-TRF-02 | Duyệt phiếu điều chuyển | M06 | F-TRF-02 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-TRF-02](M06-dieu-chuyen/UC-TRF-02_duyet-phieu-dieu-chuyen.md) |
| UC-TRF-03 | Xuất giao tài sản điều chuyển | M06 | F-TRF-03 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-TRF-03](M06-dieu-chuyen/UC-TRF-03_xuat-giao-tai-san-dieu-chuyen.md) |
| UC-TRF-04 | Xác nhận nhận tài sản bằng QR | M06 | F-TRF-04, F-TRF-05, F-TRF-08 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-TRF-04](M06-dieu-chuyen/UC-TRF-04_xac-nhan-nhan-tai-san-bang-qr.md) |
| UC-TRF-05 | Xử lý tài sản nhận thiếu | M06 | F-TRF-05 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-TRF-05](M06-dieu-chuyen/UC-TRF-05_xu-ly-tai-san-nhan-thieu.md) |
| UC-TRF-06 | Huỷ phiếu điều chuyển | M06 | F-TRF-06 | Quản lý điểm | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-TRF-06](M06-dieu-chuyen/UC-TRF-06_huy-phieu-dieu-chuyen.md) |
| UC-TRF-07 | Theo dõi phiếu điều chuyển | M06 | F-TRF-07 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-TRF-07](M06-dieu-chuyen/UC-TRF-07_theo-doi-phieu-dieu-chuyen.md) |
| UC-MNT-01 | Báo hỏng tài sản bằng QR | M07 | F-MNT-01 | Nhân viên điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-MNT-01](M07-sua-chua-bao-tri/UC-MNT-01_bao-hong-tai-san-bang-qr.md) |
| UC-MNT-02 | Tiếp nhận yêu cầu sửa chữa | M07 | F-MNT-02 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-MNT-02](M07-sua-chua-bao-tri/UC-MNT-02_tiep-nhan-yeu-cau-sua-chua.md) |
| UC-MNT-03 | Gửi tài sản đi sửa bên ngoài | M07 | F-MNT-03 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-MNT-03](M07-sua-chua-bao-tri/UC-MNT-03_gui-tai-san-di-sua-ben-ngoai.md) |
| UC-MNT-04 | Cập nhật tiến độ sửa chữa | M07 | F-MNT-04 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MNT-04](M07-sua-chua-bao-tri/UC-MNT-04_cap-nhat-tien-do-sua-chua.md) |
| UC-MNT-05 | Ghi chi phí sửa chữa | M07 | F-MNT-05 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MNT-05](M07-sua-chua-bao-tri/UC-MNT-05_ghi-chi-phi-sua-chua.md) |
| UC-MNT-06 | Duyệt báo giá sửa chữa | M07 | F-MNT-05 | Ban giám đốc | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MNT-06](M07-sua-chua-bao-tri/UC-MNT-06_duyet-bao-gia-sua-chua.md) |
| UC-MNT-07 | Nghiệm thu tài sản sau sửa | M07 | F-MNT-06 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-MNT-07](M07-sua-chua-bao-tri/UC-MNT-07_nghiem-thu-tai-san-sau-sua.md) |
| UC-MNT-08 | Chuyển phiếu sửa sang thanh lý | M07 | F-MNT-07 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-MNT-08](M07-sua-chua-bao-tri/UC-MNT-08_chuyen-phieu-sua-sang-thanh-ly.md) |
| UC-MNT-09 | Xem lịch sử bảo trì tài sản | M07 | F-MNT-08 | Quản lý tài sản | Mục tiêu người dùng | Thấp | GĐ1 | [UC-MNT-09](M07-sua-chua-bao-tri/UC-MNT-09_xem-lich-su-bao-tri-tai-san.md) |
| UC-DSP-01 | Đề nghị thanh lý tài sản | M08 | F-DSP-01 | Quản lý điểm | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSP-01](M08-thanh-ly-bao-giam/UC-DSP-01_de-nghi-thanh-ly-tai-san.md) |
| UC-DSP-02 | Duyệt đề nghị thanh lý hoặc xác nhận mất | M08 | F-DSP-02, F-DSP-05, F-DSP-06 | Ban giám đốc | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSP-02](M08-thanh-ly-bao-giam/UC-DSP-02_duyet-de-nghi-thanh-ly-hoac-xac-nhan-mat.md) |
| UC-DSP-03 | Thực hiện thanh lý tài sản | M08 | F-DSP-03 | Kế toán tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSP-03](M08-thanh-ly-bao-giam/UC-DSP-03_thuc-hien-thanh-ly-tai-san.md) |
| UC-DSP-04 | Huỷ đề nghị thanh lý | M08 | F-DSP-04 | Quản lý điểm | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-DSP-04](M08-thanh-ly-bao-giam/UC-DSP-04_huy-de-nghi-thanh-ly.md) |
| UC-DSP-05 | Đề nghị xác nhận tài sản mất | M08 | F-DSP-05 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSP-05](M08-thanh-ly-bao-giam/UC-DSP-05_de-nghi-xac-nhan-tai-san-mat.md) |
| UC-DSP-06 | Đề nghị khôi phục tài sản tìm thấy | M08 | F-DSP-06 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-DSP-06](M08-thanh-ly-bao-giam/UC-DSP-06_de-nghi-khoi-phuc-tai-san-tim-thay.md) |
| UC-DSH-01 | Xem dashboard tổng quan | M11 | F-DSH-01 | Ban giám đốc | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSH-01](M11-dashboard-bao-cao/UC-DSH-01_xem-dashboard-tong-quan.md) |
| UC-DSH-02 | Xem tài sản theo location | M11 | F-DSH-02 | Ban giám đốc | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSH-02](M11-dashboard-bao-cao/UC-DSH-02_xem-tai-san-theo-location.md) |
| UC-DSH-03 | Theo dõi tài sản mất và hỏng | M11 | F-DSH-03 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSH-03](M11-dashboard-bao-cao/UC-DSH-03_theo-doi-tai-san-mat-va-hong.md) |
| UC-DSH-04 | Theo dõi tiến độ kiểm kê | M11 | F-DSH-04 | Quản lý tài sản | Mục tiêu người dùng | Cao | GĐ1 | [UC-DSH-04](M11-dashboard-bao-cao/UC-DSH-04_theo-doi-tien-do-kiem-ke.md) |
| UC-DSH-05 | Xem dashboard của điểm | M11 | F-DSH-05 | Quản lý điểm | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-DSH-05](M11-dashboard-bao-cao/UC-DSH-05_xem-dashboard-cua-diem.md) |
| UC-DSH-06 | Xuất báo cáo tài sản | M11 | F-DSH-06 | Quản lý tài sản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-DSH-06](M11-dashboard-bao-cao/UC-DSH-06_xuat-bao-cao-tai-san.md) |
| UC-AUD-01 | Ghi nhật ký thay đổi dữ liệu | M12 | F-AUD-01 | Nhân viên có tài khoản | Chức năng con | Cao | GĐ1 | [UC-AUD-01](M12-nhat-ky-thong-bao/UC-AUD-01_ghi-nhat-ky-thay-doi-du-lieu.md) |
| UC-AUD-02 | Tra cứu nhật ký thay đổi | M12 | F-AUD-02, F-AUD-03 | Kiểm soát nội bộ | Mục tiêu người dùng | Cao | GĐ1 | [UC-AUD-02](M12-nhat-ky-thong-bao/UC-AUD-02_tra-cuu-nhat-ky-thay-doi.md) |
| UC-AUD-03 | Xem hộp việc và thông báo | M12 | F-AUD-04, F-AUD-05 | Nhân viên có tài khoản | Mục tiêu người dùng | Trung bình | GĐ1 | [UC-AUD-03](M12-nhat-ky-thong-bao/UC-AUD-03_xem-hop-viec-va-thong-bao.md) |
| UC-AUD-04 | Gửi thông báo qua email | M12 | F-AUD-05 | Bộ lập lịch | Hệ thống | Trung bình | GĐ1 | [UC-AUD-04](M12-nhat-ky-thong-bao/UC-AUD-04_gui-thong-bao-qua-email.md) |
| UC-AUD-05 | Nhắc hạn và cảnh báo quá hạn | M12 | F-AUD-05, F-STK-02 | Bộ lập lịch | Hệ thống | Trung bình | GĐ1 | [UC-AUD-05](M12-nhat-ky-thong-bao/UC-AUD-05_nhac-han-va-canh-bao-qua-han.md) |
| UC-AUD-06 | Cấu hình thông báo | M12 | F-AUD-06 | Quản trị hệ thống | Mục tiêu người dùng | Thấp | GĐ1 | [UC-AUD-06](M12-nhat-ky-thong-bao/UC-AUD-06_cau-hinh-thong-bao.md) |

## Tính năng không cần UC

Mọi tính năng GĐ1 đều có ít nhất một UC. Tính năng nhỏ được gộp vào UC gần nhất và ghi ở cột Tính năng của UC đó, ví dụ F-AST-10 (xuất danh sách) nằm trong UC-AST-07, F-QR-05 (nhập mã thay cho quét) nằm trong UC-QR-04.

## Tính năng chưa viết UC (GĐ2, GĐ3)

Các tính năng dưới đây nằm ngoài MVP1 (D-04; Duy chốt ngày 29/09/2026 không làm tích hợp FAST trong MVP1). UC sẽ viết khi bắt đầu giai đoạn tương ứng.

| Tính năng | Tên | GĐ | Lý do |
| --- | --- | --- | --- |
| F-DEP-01 | Thiết lập chính sách khấu hao | GĐ2 | Module GĐ2 |
| F-DEP-02 | Nhận hoặc tính khấu hao theo kỳ | GĐ2 | Module GĐ2 |
| F-DEP-03 | Xem bảng khấu hao theo kỳ | GĐ2 | Module GĐ2 |
| F-DEP-04 | Khoá kỳ | GĐ2 | Module GĐ2 |
| F-DEP-05 | Phân bổ chi phí CCDC | GĐ2 | Module GĐ2 |
| F-DSH-07 | Khấu hao và giá trị còn lại | GĐ2 | Tính năng GĐ2 của module GĐ1 |
| F-DSH-08 | Chênh lệch với FAST | GĐ2 | Tính năng GĐ2 của module GĐ1 |
| F-DSP-07 | Báo giảm sang FAST | GĐ2 | Tính năng GĐ2 của module GĐ1 |
| F-FST-01 | Liên kết Asset ID với mã FAST | GĐ2 | Module GĐ2 |
| F-FST-02 | Gửi thay đổi sang FAST | GĐ2 | Module GĐ2 |
| F-FST-03 | Nhận số liệu từ FAST | GĐ2 | Module GĐ2 |
| F-FST-04 | Nhật ký đồng bộ và xử lý lỗi | GĐ2 | Module GĐ2 |
| F-FST-05 | Đối soát EH-AM với FAST | GĐ2 | Module GĐ2 |
| F-FST-06 | Cấu hình kết nối | GĐ2 | Module GĐ2 |
| F-MNT-09 | Kế hoạch bảo trì định kỳ | GĐ3 | Tính năng GĐ3 của module GĐ1 |

## Điểm bàn giao giữa UC

Mỗi dòng là một chỗ UC này gọi UC kia, hoặc trao tài sản hay trạng thái cho UC kia. Hậu điều kiện của UC gửi phải khớp tiền điều kiện của UC nhận.

| Mã | UC gửi / gọi | UC nhận / được gọi | Đầu vào | Đầu ra | Ngoại lệ do bên nào xử lý | Trạng thái tài sản lúc bàn giao |
| --- | --- | --- | --- | --- | --- | --- |
| HO-01 | UC-AST-01, UC-AST-02 | UC-QR-01 | Hồ sơ vừa lưu, đã có Asset ID | Mã QR gắn với hồ sơ (BR-QR-01) | UC gọi: không sinh được mã thì không lưu hồ sơ | Lưu kho hoặc Đang sử dụng |
| HO-02 | UC-QR-02 | UC-QR-03 | Lô nhãn đã in | Nhãn đã dán, ghi người dán và thời điểm | UC-QR-03: nhãn dán nhầm tài sản | Không đổi |
| HO-03 | UC-QR-03, UC-QR-05, UC-STK-03, UC-TRF-01, UC-TRF-03, UC-TRF-04, UC-MNT-01 | UC-QR-04 | Ảnh QR hoặc Asset ID gõ tay | Asset ID đã kiểm quyền, thông tin theo vai trò (BR-QR-02, BR-QR-03) | UC-QR-04 báo mã lạ hoặc tài sản đã kết thúc (BR-QR-05); UC gọi quyết định dừng hay quét tiếp | Không đổi |
| HO-04 | UC-STK-01, UC-STK-02 | UC-STK-03 | Đợt đã mở, danh sách dự kiến đã chốt (BR-STK-02) | Lượt quét và kết quả của từng tài sản | UC-STK-03 | Không đổi; tình trạng vật lý cập nhật theo kết quả (BR-AST-10) |
| HO-05 | UC-STK-04 | UC-STK-05 | Kết quả của điểm đã chốt; tài sản chưa quét là không tìm thấy | Kết quả được duyệt, hoặc yêu cầu kiểm lại | UC-STK-05 | Không đổi cho tới khi duyệt |
| HO-06 | UC-STK-05 | UC-STK-06, UC-STK-08 | Danh sách chênh lệch của điểm; tài sản không tìm thấy, trừ trường hợp BR-STK-09 | Sai vị trí, hư hỏng, tài sản lạ sang UC-STK-06; Nghi mất sang UC-STK-08 | UC-STK-06, UC-STK-08 | Tài sản không tìm thấy thành Nghi mất |
| HO-07 | UC-STK-06, UC-STK-08, UC-DSP-06 | UC-TRF-01 | Tài sản nằm ở nơi khác sổ: location đang ghi và location thực tế | Phiếu điều chuyển điều chỉnh, bỏ bước xuất giao (BR-TRF-09) | UC-TRF-01 | Chờ điều chuyển |
| HO-08 | UC-STK-08, UC-TRF-05 | UC-DSP-05 | Tài sản Nghi mất đã xác minh mà không tìm thấy | Đề nghị xác nhận mất | UC-DSP-05 | Nghi mất |
| HO-09 | UC-STK-06, UC-TRF-04 | UC-MNT-01 | Tài sản hư hỏng, kèm ảnh lúc kiểm kê hoặc lúc nhận | Yêu cầu sửa chữa | UC-MNT-01 | Không đổi; tình trạng Hư hỏng |
| HO-10 | UC-MNT-01 | UC-MNT-02 | Yêu cầu sửa gắn với một tài sản (BR-MNT-01) | Yêu cầu được tiếp nhận hoặc bị từ chối | UC-MNT-02 | Không đổi cho tới khi tiếp nhận (BR-MNT-03) |
| HO-11 | UC-MNT-03 | UC-TRF-01, UC-TRF-03, UC-TRF-04 | Phiếu sửa đã tiếp nhận, đơn vị sửa và location bên ngoài của đơn vị (D-02) | Phiếu điều chuyển gửi sửa hoặc nhận về (BR-TRF-08) | Luồng điều chuyển; Quản lý tài sản xác nhận thay đơn vị sửa (BR-TRF-05) | Đang sửa chữa suốt hai chiều; location đổi khi bên nhận xác nhận, cost center giữ nguyên (BR-TRF-02, BR-TRF-03) |
| HO-12 | UC-MNT-05 | UC-MNT-06 | Báo giá vượt ngưỡng (Q-37) | Báo giá được duyệt hoặc bị từ chối | UC-MNT-06 | Đang sửa chữa |
| HO-13 | UC-MNT-08 | UC-DSP-01 | Phiếu sửa không sửa được, lý do, ảnh hiện trạng | Đề nghị thanh lý lập từ phiếu sửa (BR-DSP-04) | UC-DSP-01 | Đang sửa chữa |
| HO-14 | UC-DSP-01, UC-DSP-05, UC-DSP-06 | UC-DSP-02 | Đề nghị ở trạng thái Chờ duyệt | Đề nghị được duyệt hoặc bị từ chối | UC-DSP-02 | Không đổi cho tới khi duyệt |
| HO-15 | UC-DSP-02 | UC-DSP-03 | Đề nghị thanh lý đã duyệt | Thanh lý đã thực hiện, có biên bản (BR-DSP-01) | UC-DSP-03 | Chờ thanh lý |
| HO-16 | UC-DSP-03, UC-DSP-02 | Báo giảm sang FAST (M10, GĐ2) | Thanh lý đã thực hiện, hoặc mất đã được duyệt | Một yêu cầu báo giảm (BR-DSP-07) | M10 ở GĐ2 | Đã thanh lý hoặc Mất |
| HO-17 | UC-TRF-04 | Đồng bộ cost center sang FAST (M10, GĐ2) | Location và cost center mới (BR-TRF-02) | Yêu cầu đồng bộ ở GĐ2 | M10 ở GĐ2 | Theo điểm nhận |
| HO-18 | UC-TRF-04 | UC-TRF-05 | Phiếu Nhận một phần có tài sản bị đánh dấu không tới | Mỗi tài sản đã nhận hoặc đã kết luận; phiếu Đã nhận khi đủ kết luận | UC-TRF-05 | Lúc bàn giao: Đang vận chuyển (phiếu gửi sửa: Đang sửa chữa); kết luận không tìm thấy thì Nghi mất tại location điểm gửi |
| HO-19 | UC-IAM-05, UC-IAM-07 | UC-IAM-06 | Email mời có đường dẫn kích hoạt dùng một lần (BR-IAM-14) | Tài khoản Đang hoạt động | UC-IAM-06; lời mời hết hạn thì Quản trị hệ thống gửi lại ở UC-IAM-07 | Không áp dụng |
| HO-20 | UC-IAM-05 | UC-IAM-10 | Nhân viên cần thêm vai trò ngoài vai trò ban đầu | Vai trò trên location | UC-IAM-10 | Không áp dụng |
| HO-21 | UC-IAM-11, UC-IAM-12, UC-IAM-13 | Mọi UC cần đăng nhập | Vai trò bị đóng hiệu lực, tài khoản bị khoá hoặc ngừng | Mất quyền ở thao tác kế tiếp; khoá và cho nghỉ việc còn thu hồi phiên (BR-IAM-04) | UC đang chạy của người bị thu hồi báo không đủ quyền | Không áp dụng |
| HO-22 | UC-MDM-06 | UC-MNT-03 | Đơn vị sửa chữa và location bên ngoài của đơn vị | Điểm đến của phiếu gửi sửa | UC-MNT-03 | Không áp dụng |
| HO-23 | Mọi UC có thay đổi dữ liệu | UC-AUD-01 | Đối tượng, giá trị trước và sau, lý do | Một dòng nhật ký (BR-CMN-02) | UC gọi: không ghi được nhật ký thì thao tác không hoàn tất (BR-AUD-04) | Theo UC gọi |
| HO-24 | Mọi UC tạo việc cho người khác | UC-AUD-03 | Việc chờ xử lý: phiếu chờ nhận, đề nghị chờ duyệt, đợt được giao, yêu cầu sửa | Việc nằm trong hộp việc của đúng người | UC-AUD-03 | Theo UC gửi |
| HO-25 | UC-AUD-05 | UC-AUD-04 | Thông báo trong hàng đợi | Email đã gửi, hoặc lỗi gửi được ghi lại | UC-AUD-04 | Không áp dụng |
| HO-29 | UC-AST-04 | UC-AST-12 | Điều chỉnh giá trị tài chính đã nhập, lý do, chứng từ | Điều chỉnh được duyệt và có hiệu lực, hoặc bị từ chối (BR-AST-12) | UC-AST-12 | Không đổi |
| HO-30 | UC-DSP-02, UC-DSP-04 | UC-MNT-04 | Đề nghị thanh lý lập từ phiếu sửa bị từ chối hoặc huỷ | Phiếu sửa trở lại Đã tiếp nhận (BR-MNT-08) | UC-MNT-04 | Đang sửa chữa |
| HO-31 | UC-STK-06 | UC-AST-01 | Tài sản lạ chưa có hồ sơ, kèm ảnh và location nơi thấy | Hồ sơ mới cho tài sản, chênh lệch Đã xử lý | UC-AST-01 | Lưu kho hoặc Đang sử dụng |
| HO-32 | UC-DSP-03 | Đóng phiếu sửa chữa (hệ thống, BR-MNT-08) | Đề nghị thanh lý lập từ phiếu sửa đã thực hiện | Phiếu sửa Đã đóng | UC-DSP-03 | Đã thanh lý |
| HO-26 | UC-IAM-13 | Người chịu trách nhiệm mới của từng tài sản, giao ngay trong lệnh cho nghỉ việc | Danh sách tài sản chưa kết thúc, không ở location bên ngoài, người nghỉ đang chịu trách nhiệm | Mỗi tài sản có người chịu trách nhiệm mới (BR-AST-09, BR-IAM-15) | UC-IAM-13 chặn cho nghỉ khi còn tài sản chưa có người nhận (chờ Q-41) | Không đổi |
| HO-27 | UC-MDM-01, UC-MDM-08 | UC-IAM-05, UC-IAM-08 | Location và phòng ban đang hoạt động | Đơn vị công tác của nhân viên | UC-IAM-05, UC-IAM-08 | Không áp dụng |
| HO-28 | UC-IAM-05, UC-IAM-08, UC-IAM-13 | UC-IAM-09 | Cấp trên trực tiếp, đơn vị công tác, trạng thái tài khoản | Vị trí trên sơ đồ tổ chức (BR-IAM-12) | UC gửi chặn vòng cấp trên | Không áp dụng |

## Ma trận truy vết

| Tính năng | Tên | Module | UC |
| --- | --- | --- | --- |
| F-IAM-01 | Đăng nhập và phiên làm việc | M01 | UC-IAM-01, UC-IAM-02 |
| F-IAM-02 | Quản lý mật khẩu | M01 | UC-IAM-03, UC-IAM-04 |
| F-IAM-03 | Tạo tài khoản nhân viên | M01 | UC-IAM-05 |
| F-IAM-04 | Gán và thu hồi vai trò theo location | M01 | UC-IAM-10, UC-IAM-11 |
| F-IAM-05 | Khoá và mở khoá tài khoản | M01 | UC-IAM-12 |
| F-IAM-06 | Hồ sơ cá nhân và ngôn ngữ | M01 | UC-IAM-14 |
| F-IAM-07 | Danh sách nhân viên | M01 | UC-IAM-15 |
| F-IAM-08 | Kích hoạt tài khoản | M01 | UC-IAM-06, UC-IAM-07 |
| F-IAM-09 | Hồ sơ nhân viên | M01 | UC-IAM-08 |
| F-IAM-10 | Sơ đồ tổ chức | M01 | UC-IAM-09 |
| F-IAM-11 | Cho nhân viên nghỉ việc | M01 | UC-IAM-13 |
| F-MDM-01 | Quản lý location | M02 | UC-MDM-01 |
| F-MDM-02 | Đóng location | M02 | UC-MDM-02 |
| F-MDM-03 | Quản lý cost center | M02 | UC-MDM-03 |
| F-MDM-04 | Quản lý loại tài sản | M02 | UC-MDM-04 |
| F-MDM-05 | Quản lý nhà cung cấp | M02 | UC-MDM-05 |
| F-MDM-06 | Quản lý đơn vị sửa chữa | M02 | UC-MDM-06 |
| F-MDM-07 | Quản lý danh mục lý do | M02 | UC-MDM-07 |
| F-MDM-08 | Quản lý danh mục phòng ban | M02 | UC-MDM-08 |
| F-AST-01 | Tạo hồ sơ tài sản | M03 | UC-AST-01 |
| F-AST-02 | Nhập danh sách tài sản từ file | M03 | UC-AST-02 |
| F-AST-03 | Cập nhật thông tin mô tả | M03 | UC-AST-03 |
| F-AST-04 | Cập nhật thông tin tài chính | M03 | UC-AST-04, UC-AST-12 |
| F-AST-05 | Đổi người chịu trách nhiệm | M03 | UC-AST-05 |
| F-AST-06 | Đính kèm chứng từ | M03 | UC-AST-06 |
| F-AST-07 | Tra cứu và lọc tài sản | M03 | UC-AST-07 |
| F-AST-08 | Xem hồ sơ và dòng thời gian | M03 | UC-AST-08 |
| F-AST-09 | Huỷ hồ sơ tạo sai | M03 | UC-AST-09, UC-AST-10 |
| F-AST-10 | Xuất danh sách tài sản | M03 | UC-AST-07 |
| F-AST-11 | Đưa vào hoặc ngừng sử dụng | M03 | UC-AST-11 |
| F-QR-01 | Sinh mã QR | M04 | UC-QR-01 |
| F-QR-02 | In nhãn theo lô | M04 | UC-QR-02 |
| F-QR-03 | Xác nhận dán nhãn | M04 | UC-QR-03 |
| F-QR-04 | Quét QR tra cứu tài sản | M04 | UC-QR-04, UC-QR-05 |
| F-QR-05 | Nhập mã thay cho quét | M04 | UC-QR-04 |
| F-QR-06 | In lại nhãn | M04 | UC-QR-06 |
| F-STK-01 | Lập đợt kiểm kê | M05 | UC-STK-01 |
| F-STK-02 | Mở đợt và nhắc hạn tự động | M05 | UC-STK-02, UC-AUD-05 |
| F-STK-03 | Quét kiểm kê tại điểm | M05 | UC-STK-03 |
| F-STK-04 | Ghi nhận tài sản lạ | M05 | UC-STK-03 |
| F-STK-05 | Chốt kết quả kiểm kê của điểm | M05 | UC-STK-04 |
| F-STK-06 | Duyệt kết quả kiểm kê | M05 | UC-STK-05 |
| F-STK-07 | Xử lý chênh lệch | M05 | UC-STK-06 |
| F-STK-08 | Báo cáo kiểm kê | M05 | UC-STK-07 |
| F-STK-09 | Xác minh tài sản nghi mất | M05 | UC-STK-08 |
| F-TRF-01 | Tạo phiếu điều chuyển | M06 | UC-TRF-01 |
| F-TRF-02 | Duyệt phiếu điều chuyển | M06 | UC-TRF-02 |
| F-TRF-03 | Xuất giao tài sản | M06 | UC-TRF-03 |
| F-TRF-04 | Xác nhận đã nhận hàng bằng QR | M06 | UC-TRF-04 |
| F-TRF-05 | Xử lý tài sản nhận thiếu | M06 | UC-TRF-04, UC-TRF-05 |
| F-TRF-06 | Huỷ phiếu điều chuyển | M06 | UC-TRF-06 |
| F-TRF-07 | Theo dõi phiếu và lịch sử điều chuyển | M06 | UC-TRF-07 |
| F-TRF-08 | Ghi nhận tài sản nhận hỏng | M06 | UC-TRF-04 |
| F-MNT-01 | Báo hỏng bằng quét QR | M07 | UC-MNT-01 |
| F-MNT-02 | Tiếp nhận và phân loại yêu cầu | M07 | UC-MNT-02 |
| F-MNT-03 | Gửi tài sản đi sửa và nhận về | M07 | UC-MNT-03 |
| F-MNT-04 | Cập nhật tiến độ sửa chữa | M07 | UC-MNT-04 |
| F-MNT-05 | Ghi chi phí và đơn vị sửa chữa | M07 | UC-MNT-05, UC-MNT-06 |
| F-MNT-06 | Nghiệm thu và đưa lại vào sử dụng | M07 | UC-MNT-07 |
| F-MNT-07 | Chuyển sang đề nghị thanh lý | M07 | UC-MNT-08 |
| F-MNT-08 | Lịch sử bảo trì của tài sản | M07 | UC-MNT-09 |
| F-DSP-01 | Đề nghị thanh lý | M08 | UC-DSP-01 |
| F-DSP-02 | Duyệt đề nghị thanh lý | M08 | UC-DSP-02 |
| F-DSP-03 | Thực hiện thanh lý | M08 | UC-DSP-03 |
| F-DSP-04 | Huỷ đề nghị thanh lý | M08 | UC-DSP-04 |
| F-DSP-05 | Xác nhận tài sản mất | M08 | UC-DSP-02, UC-DSP-05 |
| F-DSP-06 | Ghi nhận tìm thấy lại | M08 | UC-DSP-02, UC-DSP-06 |
| F-DSH-01 | Dashboard tổng quan | M11 | UC-DSH-01 |
| F-DSH-02 | Tài sản theo location | M11 | UC-DSH-02 |
| F-DSH-03 | Tài sản mất và hỏng | M11 | UC-DSH-03 |
| F-DSH-04 | Tiến độ kiểm kê | M11 | UC-DSH-04 |
| F-DSH-05 | Dashboard của điểm | M11 | UC-DSH-05 |
| F-DSH-06 | Xuất báo cáo | M11 | UC-DSH-06 |
| F-AUD-01 | Ghi nhật ký thay đổi | M12 | UC-AUD-01 |
| F-AUD-02 | Tra cứu nhật ký | M12 | UC-AUD-02 |
| F-AUD-03 | Xuất nhật ký | M12 | UC-AUD-02 |
| F-AUD-04 | Hộp việc cần làm | M12 | UC-AUD-03 |
| F-AUD-05 | Thông báo | M12 | UC-AUD-03, UC-AUD-04, UC-AUD-05 |
| F-AUD-06 | Cấu hình thông báo | M12 | UC-AUD-06 |

## Tổng hợp checklist

| Module | Số UC | Số ✅ | Số ⚠️ | Ghi chú |
| --- | --- | --- | --- | --- |
| M01 | 15 | 283 | 17 | |
| M02 | 8 | 150 | 10 | |
| M03 | 12 | 219 | 21 | |
| M04 | 6 | 114 | 6 | |
| M05 | 8 | 151 | 9 | |
| M06 | 7 | 129 | 11 | |
| M07 | 9 | 170 | 10 | |
| M08 | 6 | 113 | 7 | |
| M11 | 6 | 114 | 6 | |
| M12 | 6 | 110 | 10 | |
