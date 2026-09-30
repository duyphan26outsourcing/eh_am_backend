# Checklist 20 điểm: M07 Báo hỏng, sửa chữa và bảo trì

UC-MNT-01 và UC-MNT-02 viết từ lần chạy trước; đã đọc lại, đủ 13 trường và đúng quy tắc nên giữ nguyên. Bảy UC còn lại viết mới ở lần chạy này.

## UC-MNT-01: Báo hỏng tài sản bằng QR

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-04 và TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 và 7 cùng Nhân viên điểm, bước 10 đến 13 liền bốn bước Hệ thống; gộp thêm sẽ làm bước có hai hành động |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Có quyền, mã lạ, ảnh, mất mạng, hai người cùng lúc, nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-02: Tiếp nhận yêu cầu sửa chữa

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Tiếp nhận hoặc từ chối là hai kết quả của cùng một việc xem xét yêu cầu |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 và 8 cùng Quản lý tài sản, bước 10 đến 12 liền ba bước Hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Trạng thái nguồn, xử lý đồng thời, thiếu dữ liệu, quyền, nhật ký, mất kết nối |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-03: Gửi tài sản đi sửa bên ngoài

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Kết thúc khi phiếu điều chuyển đã lập; xuất giao và nhận là UC-TRF-03 và UC-TRF-04 |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Nhận về là luồng thay thế cùng mục tiêu đưa tài sản qua đơn vị sửa |
| C5 | Ranh giới hệ thống rõ | ✅ | Việc điều chuyển giao cho UC-TRF-01 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 10 đến 12 liền ba bước Hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-TRF-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-04: Cập nhật tiến độ sửa chữa

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ⚠️ | UC-MNT-04.AC.2 là việc hệ thống trả phiếu về Đã tiếp nhận khi UC-DSP-02 hoặc UC-DSP-04 gọi (HO-30), không có người bấm; giữ ở đây vì README giao HO-30 cho UC-MNT-04, nên tách nếu QA thấy lẫn |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5 đến 7 liền ba bước Quản lý tài sản |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | UC-MNT-04.AC.2 kết thúc tại chỗ và trả kết quả cho UC gọi, không có "tiếp tục từ bước" |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có; UC-DSP-02 và UC-DSP-04 gọi UC này |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-MNT-05: Ghi chi phí sửa chữa

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Ban giám đốc chỉ nhận việc, duyệt ở UC-MNT-06 |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5 đến 7 liền ba bước Quản lý tài sản |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Bước 10 chỉ kiểm, việc vượt ngưỡng tách sang UC-MNT-05.AC.1 |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-06: Duyệt báo giá sửa chữa

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Duyệt hoặc từ chối là hai kết quả của một quyết định |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 9 liền bốn bước Hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-07: Nghiệm thu tài sản sau sửa

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 3 và 4, bước 6 đến 8 cùng Quản lý điểm |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-08: Chuyển phiếu sửa sang thanh lý

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Kết thúc khi đề nghị đã gửi duyệt; duyệt và thực hiện là UC-DSP-02 và UC-DSP-03 |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Việc lập đề nghị giao cho UC-DSP-01 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 8 cùng Quản lý tài sản, bước 11 đến 13 liền ba bước Hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Ghi "Không có" |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-DSP-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-MNT-09: Xem lịch sử bảo trì tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | UC chỉ đọc |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | TBD-1 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | UC chỉ đọc nên hậu điều kiện nêu dữ liệu không đổi |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 4 và 5 liền hai bước Hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | UC-MNT-09.AC.1 kết thúc tại chỗ, không có "tiếp tục từ bước" |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | UC đọc: quyền, không tồn tại, lỗi tải, ảnh, ẩn chi phí |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có đề xuất | Chín UC dùng đủ tác nhân trong danh mục hiện có | Không áp dụng |
