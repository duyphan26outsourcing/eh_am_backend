# Checklist 20 điểm: M08 Thanh lý và báo giảm

## UC-DSP-01: Đề nghị thanh lý tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản ghi ở Phụ kèm "cũng thực hiện được" |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu, ghi [TBD-1] và A-06 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 13 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 9 đến 13 liên tiếp là bước hệ thống (kiểm, xếp cấp, lưu, tạo việc, hiển thị); tách thêm bước người dùng sẽ là bước không có hành động thật |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập thiếu, quyền, hai người cùng lúc, kho tệp, mất kết nối |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSP-02: Duyệt đề nghị thanh lý hoặc xác nhận mất

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ⚠️ | Mục tiêu là "duyệt đề nghị chờ duyệt"; ba loại đề nghị dùng chung một UC theo README. Kế toán trưởng duyệt loại khôi phục nên ghi ở Phụ kèm điều kiện |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | [TBD-1], A-06, A-20 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Tách theo duyệt, từ chối, xác nhận mất, khôi phục |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 12 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 12 liên tiếp là bước hệ thống sau một hành động **Duyệt** của người dùng |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 đến AC.3 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Tự duyệt, quyền, hai người cùng lúc, ảnh, mất kết nối |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-MNT-04 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-DSP-03: Thực hiện thanh lý tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Việc bán, huỷ, tặng ngoài đời nằm ngoài hệ thống (Giả định 1) |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | [TBD-1], A-06 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 14 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 10 đến 14 liên tiếp là bước hệ thống sau hành động **Xác nhận thực hiện** |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSP-04: Huỷ đề nghị thanh lý

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 13 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 8 đến 13 liên tiếp là bước hệ thống sau hành động **Xác nhận huỷ** |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-MNT-04 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSP-05: Đề nghị xác nhận tài sản mất

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Việc tìm tài sản ngoài đời do UC-STK-08 và UC-TRF-05 xác minh trước |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | [TBD-1], A-20, A-05 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 13 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 9 đến 13 liên tiếp là bước hệ thống sau hành động **Gửi đề nghị** |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Báo mất đột xuất nằm ở AC.1 và AC.2 |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSP-06: Đề nghị khôi phục tài sản tìm thấy

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Phiếu điều chuyển điều chỉnh do UC-TRF-01 làm sau khi duyệt |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | [TBD-1], A-20 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 15 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 11 đến 15 liên tiếp là bước hệ thống sau hành động **Gửi đề nghị** |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có; HO-07 đi qua việc do UC-DSP-02 tạo |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có | Các UC của M08 chỉ dùng tác nhân đã có trong `tac-nhan.md` | Không có |
