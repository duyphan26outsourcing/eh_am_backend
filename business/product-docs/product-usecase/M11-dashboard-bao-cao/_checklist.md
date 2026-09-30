# Checklist 20 điểm: M11 Dashboard và báo cáo

## UC-DSH-01: Xem dashboard tổng quan

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Kết thúc khi chỉ số hiện đủ, người xem dùng được ngay |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản ghi ở Phụ, cũng thực hiện được |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có giả định A-nn về số lần mở; dùng [TBD-1], blueprint chỉ định KPI đo sau go-live |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Nêu rõ không đổi dữ liệu, không có dòng nhật ký |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 8 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 3 và 4 đều của hệ thống, cùng là hiển thị |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Quyền, phiên bị thu hồi, lỗi tổng hợp, hết thời gian chờ, mất mạng; UC chỉ đọc nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSH-02: Xem tài sản theo location

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | [TBD-1], chưa có giả định A-nn về số lần mở |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 8 bước; bước 5 và 6 hiển thị nhiều chỉ số cùng loại |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 5 và 6 đều của hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 3 luồng |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Có location ngoài phạm vi (BR-CMN-03); UC chỉ đọc nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSH-03: Theo dõi tài sản mất và hỏng

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | [TBD-1], chưa có giả định A-nn về số lần mở |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 8 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Có khoảng thời gian sai; UC chỉ đọc nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSH-04: Theo dõi tiến độ kiểm kê

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Chỉ đọc số liệu của M05, không thay đổi đợt kiểm kê |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Gắn A-05 cho nhịp đợt hằng tháng, nhưng số lần mở là [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | Việc lượt quét từ hàng đợi chưa tới để ở Giả định |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 7 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 3 luồng |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Có đợt hoặc điểm ngoài phạm vi; UC chỉ đọc nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSH-05: Xem dashboard của điểm

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Tác nhân phụ: Không có |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | [TBD-1], chưa có giả định A-nn về số lần mở |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 9 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 3 đến 7 đều của hệ thống, cùng là hiển thị chỉ số |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 3 luồng |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Có mất mạng trên điện thoại và location ngoài phạm vi; UC chỉ đọc nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-DSH-06: Xuất báo cáo tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Kết thúc khi tải được file |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Ban giám đốc, Kế toán tài sản ghi ở Phụ, cũng thực hiện được |
| C5 | Ranh giới hệ thống rõ | ✅ | Dịch vụ lưu trữ tệp là tác nhân phụ |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | [TBD-1], chưa có giả định A-nn về số lần xuất |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có file, đường dẫn tải, dòng nhật ký `report.exported` |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 4 và 5 đều của Quản lý tài sản, cùng là thao tác nhập; bước 6 đến 10 của hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 1 luồng |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Quyền, bộ lọc sai, Storage lỗi, nhật ký lỗi, hết thời gian chờ, mất mạng; xuất không sửa dữ liệu nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có; bước ghi nhật ký viết trong luồng theo BR-CMN-02 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có | Mọi tác nhân của M11 đều có trong `_chung/tac-nhan.md`; Kế toán trưởng và Kiểm soát nội bộ chưa được gắn vào UC nào vì Phụ lục K không liệt kê họ ở màn hình M11 (xem [TBD-4] của UC-DSH-01 và [TBD-5] của UC-DSH-06) | Không có |
