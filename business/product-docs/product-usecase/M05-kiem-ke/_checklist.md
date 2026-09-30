# Checklist 20 điểm: M05 Kiểm kê

## UC-STK-01: Lập đợt kiểm kê

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Một đợt mỗi location mỗi tháng (A-05); số điểm mỗi đợt ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Các bước 7 đến 13 đều do Hệ thống; mỗi bước là một hành động xử lý riêng sau lệnh Mở đợt |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, đợt trùng, không đủ quyền, lỗi lưu, mất mạng và bấm hai lần, thiếu lý do huỷ |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-STK-02: Mở đợt kiểm kê tháng tự động

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Mức Hệ thống; một lần chạy job cho ra đợt Đang mở đủ danh sách, việc và nhật ký |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Bộ lập lịch |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | Tác nhân loại Thời gian theo `tac-nhan.md` |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Mỗi tháng một lần (A-05); số location ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | UC chạy theo lịch, không có người thao tác; chỉ Bộ lập lịch mở và đóng lần chạy, các bước giữa do Hệ thống |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Thiếu cấu hình, thiếu người phân công, chạy trùng, lỗi lưu, job bị ngắt, bỏ lỡ lịch; không có nhập sai hay mạng điện thoại vì không có người dùng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-STK-03: Quét kiểm kê tại điểm

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Một lượt quét ra một kết quả có ảnh; quét nhiều tài sản là lặp UC |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Nhân viên điểm |
| C5 | Ranh giới hệ thống rõ | ✅ | UC-QR-04 là UC được gọi, không trộn vào luồng |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Mỗi tài sản một lượt mỗi tháng (A-05, A-02); số lượt ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Các bước 9 đến 14 đều do Hệ thống, mỗi bước một hành động xử lý riêng sau lệnh Gửi lượt quét |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Sáu luồng: nhập tay, hư hỏng, sai vị trí, tài sản lạ hai kiểu, quét lại |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Đợt hoặc điểm đã khoá, thiếu ảnh, mã lạ, không đủ quyền, mất mạng có hàng đợi và chống trùng, lỗi Storage, lỗi lưu hoặc nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04 và UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-STK-04: Chốt kết quả kiểm kê của điểm

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Nhân viên điểm |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Mỗi điểm một lần mỗi đợt (A-05); số lần kiểm lại ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Các bước 7 đến 11 đều do Hệ thống, mỗi bước một hành động xử lý riêng sau lệnh Xác nhận chốt |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Còn lượt chưa gửi, chốt hai lần hoặc hai người, không đủ quyền, không có người duyệt, mất mạng, lỗi lưu |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-STK-05: Duyệt kết quả kiểm kê của điểm

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý điểm; Quản lý tài sản là phụ khi Quản lý điểm là người kiểm |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Mỗi điểm một lần mỗi đợt (A-05); số lần kiểm lại ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Các bước 5 đến 11 đều do Hệ thống, mỗi bước một hành động xử lý riêng sau lệnh Duyệt kết quả |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Không đủ quyền hoặc tự duyệt, duyệt hai người cùng lúc, tài sản đổi trạng thái, thiếu lý do, lỗi lưu, mất mạng, lỗi Storage |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-STK-06: Xử lý chênh lệch kiểm kê

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ⚠️ | Luồng chính xử lý một chênh lệch Sai vị trí; các loại khác nằm ở luồng thay thế và UC-STK-06.AC.5 lặp lại trong một phiên; chấp nhận vì mỗi chênh lệch tự đủ mục tiêu, cần Duy xác nhận có tách theo loại không |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản |
| C5 | Ranh giới hệ thống rõ | ✅ | UC-TRF-01, UC-MNT-01, UC-AST-01 là UC được gọi |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Mỗi chênh lệch một lần, phát sinh theo đợt hằng tháng (A-05, A-02); số chênh lệch ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Các bước 6 đến 10 đều do Hệ thống, mỗi bước một hành động xử lý riêng sau lệnh Lập điều chuyển điều chỉnh |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Không đủ quyền, tài sản không đủ điều kiện, xử lý hai người, UC được gọi bỏ dở, thiếu lý do, mất mạng hoặc lỗi nhật ký, lỗi Storage |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-TRF-01, UC-MNT-01, UC-AST-01 đều có file |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-STK-07: Xem báo cáo kiểm kê

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Gắn A-05 nhưng chưa có số lần xem mỗi ngày, ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | UC chỉ đọc; hậu điều kiện nêu rõ dữ liệu không đổi |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Không đủ quyền hoặc ngoài phạm vi, đợt không hiển thị được, lỗi Storage, mất mạng; UC chỉ đọc nên không có xung đột ghi |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-STK-08: Xác minh tài sản nghi mất

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản |
| C5 | Ranh giới hệ thống rõ | ✅ | UC-TRF-01 và UC-DSP-05 là UC được gọi |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Mỗi tài sản Nghi mất một lần, phát sinh theo đợt hằng tháng (A-05); số tài sản ở [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Các bước 9 đến 11 đều do Hệ thống, mỗi bước một hành động xử lý riêng sau lệnh Lưu kết luận |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Thiếu thông tin, hai người kết luận, không đủ quyền, location không hợp lệ, lỗi Storage, UC được gọi bỏ dở, mất mạng hoặc lỗi nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-TRF-01 và UC-DSP-05 đều có file |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có | Mọi UC của M05 dùng tác nhân có sẵn trong `tac-nhan.md` | Không áp dụng |

Ghi chú cho người điều phối: README chưa có điểm bàn giao từ UC-STK-06 sang UC-AST-01 (lập hồ sơ cho tài sản lạ, theo F-STK-07); đề xuất thêm một dòng HO. UC-STK-06 và UC-STK-08 gọi UC-TRF-01, UC-MNT-01, UC-DSP-05 đúng theo HO-07, HO-08, HO-09.
