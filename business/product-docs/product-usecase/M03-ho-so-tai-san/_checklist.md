# Checklist 20 điểm: M03 Hồ sơ tài sản và CCDC

## UC-AST-01: Tạo hồ sơ tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Tạo" cộng "hồ sơ tài sản" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Xong một hồ sơ có Asset ID và mã QR trong một phiên |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | UC-AST-01 khớp README |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản, lập một hồ sơ |
| C5 | Ranh giới hệ thống rõ | ✅ | Chỉ EH-AM; mã QR và nhật ký là UC con |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] và A-10 |
| C9 | Tiền điều kiện kiểm được | ✅ | 3 điều kiện, đều truy vấn được |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | 7 hậu điều kiện, có HO-01 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | Tình trạng vật lý ban đầu đặt ở Giả định vì blueprint chưa nêu |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 đến 11 là 5 bước hệ thống liên tiếp; giữ tách để HO-01 (bước 9) và HO-23 (bước 10) gắn được vào từng bước |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, trùng serial, quyền, QR, nhật ký, mất mạng, kho tệp |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-01, UC-AUD-01 có trong README |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-AST-02: Nhập danh sách tài sản từ file

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Nhập" cộng "danh sách tài sản từ file" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Một lần nhập trọn vẹn trong một phiên, có báo cáo kết quả |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản, nhập một file |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] và A-10 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | 7 hậu điều kiện, có HO-01 và BR-AST-08 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 13 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Tối đa 4 bước hệ thống liên tiếp (bước 8 đến 11) |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1, AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | File sai mẫu, dòng lỗi, kho tệp, đồng thời, QR, nhật ký, quyền, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-01, UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AST-03: Sửa thông tin mô tả tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Không đụng location, thông tin tài chính (BR-AST-04, BR-AST-05) |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Tối đa 4 bước hệ thống liên tiếp |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1, AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, đồng thời, quyền, trạng thái kết thúc, nhật ký, mất mạng, kho tệp |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AST-04: Điều chỉnh thông tin tài chính tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Điều chỉnh" cộng "thông tin tài chính tài sản" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Kế toán tài sản xong việc khi đề nghị đã gửi; duyệt là UC khác (UC-AST-12) |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Nhập lần đầu là AC.1 của cùng mục tiêu |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1], A-10, A-16 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có HO-29, HO-24 và nhánh nhập lần đầu |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 13 bước; bước 9 gộp các phép kiểm cùng loại |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 9 đến 13 là 5 bước hệ thống liên tiếp; giữ tách để HO-24 (bước 11) và HO-23 (bước 12) gắn được vào từng bước |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1, AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, quyền, đồng thời (hai cách), trạng thái kết thúc, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Đã bỏ UC-AUD-03 khỏi Bao gồm (người nhận tự mở hộp việc, HO-24 thể hiện ở Hậu điều kiện) |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-AST-05: Đổi người chịu trách nhiệm tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Đổi một tài sản trong một phiên; AC.1 lặp lại cho danh sách bàn giao |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản là Phụ (cũng thực hiện được) |
| C5 | Ranh giới hệ thống rõ | ✅ | Quyết định chặn nghỉ việc nằm ở UC-IAM-13 (HO-26) |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có HO-26 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Tối đa 4 bước hệ thống liên tiếp |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Người nhận sai, thiếu dữ liệu, location bên ngoài, quyền, trạng thái kết thúc, đồng thời, nhật ký và mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AST-06: Đính kèm chứng từ tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Kế toán tài sản là Phụ (cũng thực hiện được) |
| C5 | Ranh giới hệ thống rõ | ✅ | Xem và tải chứng từ thuộc UC-AST-08 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 10 là 5 bước hệ thống liên tiếp (kiểm tệp, kho tệp nhận, gắn tệp, nhật ký, hiển thị); giữ tách để ngoại lệ gắn đúng bước |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Tệp sai, kho tệp, mất mạng, hết hạn đường dẫn, quyền, trạng thái kết thúc, nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-AST-07: Tra cứu danh sách tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Xuất Excel (F-AST-10) là AC.1 theo README |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Mở chi tiết tài sản thuộc UC-AST-08 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có nhánh xuất file và BR-DSH-04 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 6 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1, AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Quyền, ngoài phạm vi, tham số sai, mất mạng, kho tệp, nhật ký xuất, hết hạn đường dẫn; UC đọc nên không có xung đột đồng thời |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AST-08: Xem hồ sơ chi tiết tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Năm vai trò khác ghi ở Phụ kèm "cũng thực hiện được" vì Phụ lục K ghi "mọi vai trò theo quyền" |
| C5 | Ranh giới hệ thống rõ | ✅ | Nhân viên điểm xem qua QR (UC-QR-05), ngoài UC này |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | UC đọc; hậu điều kiện nêu dữ liệu không đổi và phần ẩn theo vai trò |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 7 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 2 đến 5 là 4 bước hệ thống liên tiếp, đúng ví dụ mẫu của skill |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Bước 4 hiển thị theo vai trò, không tạo nhánh luồng |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1, AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Ngoài phạm vi, không tồn tại, quyền chứng từ, hết hạn, kho tệp, mất mạng, mất quyền giữa phiên |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Ghi "Không có" |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AST-09: Đề nghị huỷ hồ sơ tạo sai

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Người đề nghị xong việc khi đề nghị đã tới người duyệt; duyệt là UC-AST-10 |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Kế toán tài sản là Phụ (cũng thực hiện được) theo ma trận §8 |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có HO-24 |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Tối đa 4 bước hệ thống liên tiếp (bước 8 đến 11) |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Ghi "Không có"; khác biệt duy nhất là người đề nghị, đã ghi ở ô Tác nhân |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Không đủ điều kiện, thiếu lý do, đề nghị trùng, quyền, không có người duyệt, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Đã bỏ UC-AUD-03 khỏi Bao gồm (người nhận tự mở hộp việc, HO-24 thể hiện ở Hậu điều kiện) |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AST-10: Duyệt huỷ hồ sơ tạo sai

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Người duyệt khác người đề nghị (BR-CMN-08) |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ⚠️ | Điều kiện 3 (người duyệt khác người đề nghị) cũng là BR-CMN-08 kiểm lại ở bước 5; giữ vì so sánh mã người là kiểm được |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có nhánh từ chối và tác động lên QR (BR-QR-05) |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 9 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5 đến 9 là 5 bước hệ thống liên tiếp; giữ tách để ngoại lệ và HO-23, HO-24 gắn đúng bước |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Tự duyệt, hết điều kiện huỷ, đồng thời, quyền, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Đã bỏ UC-AUD-03 khỏi Bao gồm (người nhận tự mở hộp việc, HO-24 thể hiện ở Hậu điều kiện) |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 17 ✅, 3 ⚠️, 0 ❌.

## UC-AST-11: Đưa vào hoặc ngừng sử dụng tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ⚠️ | Tên có hai động từ nối bằng "hoặc" nhưng do README chốt; hai chiều đổi dùng chung một luồng và một mục tiêu |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Mục tiêu là đổi trạng thái giữa Lưu kho và Đang sử dụng |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Nêu cả hai chiều đổi |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Tối đa 4 bước hệ thống liên tiếp (bước 7 đến 10) |
| C14 | Luồng chính không có rẽ nhánh | ⚠️ | Bước 2 nêu thao tác hợp với từng trạng thái; các bước sau dùng chung cho cả hai chiều nên không có nhánh luồng, nhưng câu chữ bước 2 cần người soát cuối xem lại |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Ghi "Không có" |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Trạng thái không cho đổi, kết thúc, thiếu lý do, đồng thời, quyền, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 17 ✅, 3 ⚠️, 0 ❌.

## UC-AST-12: Duyệt điều chỉnh thông tin tài chính

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số liệu; gắn [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ⚠️ | Điều kiện 3 (người duyệt khác người đề nghị) cũng là BR-CMN-08 kiểm lại ở bước 6; giữ vì so sánh mã người là kiểm được |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có HO-29, HO-24 và nhánh từ chối |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 10 là 5 bước hệ thống liên tiếp; giữ tách để ngoại lệ và HO-23, HO-24 gắn đúng bước |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Tự duyệt, quyền, đồng thời, trạng thái kết thúc, chứng từ, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Đã bỏ UC-AUD-03 khỏi Bao gồm (người nhận tự mở hộp việc, HO-24 thể hiện ở Hậu điều kiện) |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 17 ✅, 3 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có | Mọi tác nhân của M03 đã có trong `tac-nhan.md` | Không áp dụng |
