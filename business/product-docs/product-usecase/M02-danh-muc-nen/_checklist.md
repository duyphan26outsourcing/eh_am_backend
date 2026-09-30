# Checklist 20 điểm: M02 Danh mục nền

## UC-MDM-01: Cập nhật danh mục location

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Cập nhật" gộp thêm và sửa; tên cố định theo README |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản ghi ở Phụ (cũng thực hiện được) |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn A-01 và [TBD-1] (Q-02), không tự đặt con số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có bàn giao HO-27 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bốn bước hệ thống cuối là kiểm, lưu, ghi nhật ký, hiển thị |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 1 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, mã trùng, quyền, sửa đồng thời, lỗi nhật ký, mất kết nối. Không có Storage, email hay quét trên điện thoại |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MDM-02: Đóng location ngừng hoạt động

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Location bên ngoài chỉ đóng qua UC-MDM-06, ghi ở ngoại lệ EX.2 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn A-01 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ⚠️ | Tiền điều kiện 3 dựa vào nhóm lý do "ngừng hoạt động danh mục" mà F-MDM-07 chưa có; kiểm được nhưng cần [TBD-4] chốt |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 1 luồng thay thế (lý do Khác) |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Vi phạm BR-MDM-03, thiếu lý do, đóng đồng thời, quyền, lỗi nhật ký, mất kết nối |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-MDM-03: Cập nhật danh mục cost center

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Không kiểm mã với FAST ở GĐ1 (D-04) |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn A-08 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế (sửa tên, ngừng) |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, mã trùng, còn được dùng, sửa đồng thời, quyền, lỗi nhật ký, mất kết nối |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MDM-04: Cập nhật cây loại tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Ba luồng thay thế (thêm nhóm, sửa, ngừng) trên hai cấp của một cây; chưa cần tách |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn A-13, A-10 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 3 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ, EX.7 gộp lỗi nhật ký và mất kết nối vì cùng trạng thái cuối |
| C18 | Phủ các lỗi thường gặp | ✅ | Có BR-MDM-06 về đổi cờ TSCĐ hoặc CCDC |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MDM-05: Cập nhật danh mục nhà cung cấp

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; blueprint không có A-nn cho nhà cung cấp nên gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 12 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế (sửa, ngừng) |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, mã số thuế trùng, thao tác đồng thời, quyền, lỗi nhật ký, mất kết nối |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | Dòng Tuân thủ về dữ liệu cá nhân của người liên hệ |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MDM-06: Cập nhật danh mục đơn vị sửa chữa

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ⚠️ | Ngừng đơn vị đóng luôn location bên ngoài, nên một thao tác đổi hai đối tượng danh mục; ghi ở Giả định 5 và quy tắc đề xuất BR-MDM-13, cần Vận hành xác nhận khi duyệt quy tắc |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn A-07 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Khớp tiền điều kiện của UC-MNT-03 (HO-22) |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 12 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Có trường hợp không còn location bên ngoài trống và ngừng khi còn tài sản hoặc phiếu |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-MDM-07: Cập nhật danh mục lý do

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; danh sách lý do thật chưa có, gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Có sửa hoặc ngừng lý do Khác |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MDM-08: Cập nhật danh mục phòng ban

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Gán nhân viên vào phòng ban thuộc UC-IAM-05 và UC-IAM-08 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; danh sách phòng ban thật chờ Q-42, gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có bàn giao HO-27 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ, EX.7 gộp lỗi nhật ký và mất kết nối |
| C18 | Phủ các lỗi thường gặp | ✅ | Có trưởng phòng không hợp lệ và ngừng khi còn nhân viên (BR-MDM-07) |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

Tổng hợp module M02: 8 UC, 150 ✅, 10 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có | Mọi UC của M02 dùng đủ tác nhân trong `tac-nhan.md` (Quản trị hệ thống, Quản lý tài sản) | Không áp dụng |
