# Checklist 20 điểm: M01 Người dùng và phân quyền

Tổng hợp module: 15 UC, 283 ✅, 17 ⚠️, 0 ❌. Mỗi ⚠️ có lý do ở cột Ghi chú.

## UC-IAM-01: Đăng nhập vào EH-AM

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Định tính, gắn A-09 và [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Sau khi nhân viên bấm Đăng nhập, bước 5 đến 10 là hệ thống chạy liền; không có hành động của nhân viên để xen vào |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 và AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, sai thông tin, khoá, giới hạn tần suất, dịch vụ ngoài, mất mạng, phiên hết hạn |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-IAM-04 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-02: Đăng xuất khỏi EH-AM

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Đăng xuất một thiết bị và mọi thiết bị cùng một mục tiêu, khác phạm vi |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Định tính, gắn A-09 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Chỉ bước 1 là của nhân viên, bước 2 đến 6 là hệ thống; thao tác một chạm, không có gì khác để nhân viên làm |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Phiên hết hạn, dịch vụ ngoài, mất mạng, giới hạn tần suất |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-03: Đặt lại mật khẩu khi quên

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ⚠️ | Luồng đi qua hộp thư giữa bước 5 và 6; coi là một việc liên tục vì nhân viên không dừng giữa chừng, nhưng thực tế có thể hai phiên trình duyệt |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Email là kênh, Dịch vụ email là tác nhân phụ |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Định tính, gắn A-09 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | Việc truy cập được hộp thư để ở Giả định |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ⚠️ | Bước 3 gộp nhập email với bấm gửi, bước 8 gộp nhập mật khẩu với bấm xác nhận; biểu mẫu một ô nên không tách |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 9 đến 12 là hệ thống chạy liền sau khi nhân viên xác nhận |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Không có luồng thay thế, ghi rõ |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, giới hạn tần suất, dịch vụ ngoài, đường dẫn hết hạn, mật khẩu yếu, phiên không thu hồi được |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 17 ✅, 3 ⚠️, 0 ❌.

## UC-IAM-04: Đổi mật khẩu đang dùng

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Định tính, gắn A-09 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | Việc nhân viên biết mật khẩu hiện tại không nằm ở tiền điều kiện, được kiểm ở bước 7 |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 11 là hệ thống chạy liền sau khi nhân viên bấm Đổi mật khẩu |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 và AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, mật khẩu cũ sai, phiên hết hạn, giới hạn tần suất, dịch vụ ngoài, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-05: Thêm nhân viên mới

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Dịch vụ xác thực và Dịch vụ email là tác nhân phụ |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn A-09 và [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | 6 hậu điều kiện |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ⚠️ | Các bước 3, 5, 7 gộp nhập ô của một bước wizard với bấm Tiếp tục để giữ trong 15 bước; bước 9 nhập cả cách kích hoạt lẫn vai trò |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 12 đến 15 là hệ thống chạy liền sau khi Quản trị hệ thống bấm Tạo tài khoản |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Điều kiện của ô (phòng ban chỉ cho văn phòng, lý do khi có vai trò) ghi như ràng buộc ô |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 đến AC.4 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, trùng email và mã, cấp trên sai, quyền, dịch vụ ngoài, hết thời gian, đồng thời |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01, UC-IAM-10 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-IAM-06: Kích hoạt tài khoản được mời

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | Người được mời có trong tac-nhan.md |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 10 là hệ thống chạy liền sau khi người được mời bấm Kích hoạt tài khoản |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Không có luồng thay thế, ghi rõ |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Hết hạn, đã dùng, mật khẩu yếu, dịch vụ ngoài, mất mạng, đồng thời, giới hạn tần suất |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-07: Gửi lại lời mời kích hoạt

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 10 là hệ thống chạy liền sau khi Quản trị hệ thống xác nhận |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Trạng thái đổi đồng thời, quyền, dịch vụ ngoài, giới hạn tần suất, hết thời gian |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01, UC-IAM-15 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-08: Cập nhật hồ sơ nhân viên

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 đến 11 là hệ thống chạy liền sau khi Quản trị hệ thống bấm Lưu |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 đến AC.4 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, xung đột phiên bản, trùng mã, cấp trên vòng, danh mục ngừng, quyền, nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01, UC-IAM-10 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-09: Xem sơ đồ tổ chức

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Ban giám đốc ghi ở Phụ kèm "(cũng thực hiện được)" |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 và AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Quyền, dữ liệu vòng, tải lỗi, không có kết quả, phiên hết hạn |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-IAM-08 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 20 ✅, 0 ⚠️, 0 ❌.

## UC-IAM-10: Gán vai trò theo location

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 8 đến 11 là hệ thống chạy liền sau khi Quản trị hệ thống bấm Gán vai trò |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 đến AC.3 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai, không cấp được, trùng và đồng thời, quyền, nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-11: Thu hồi vai trò theo location

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 đến 10 là hệ thống chạy liền sau khi Quản trị hệ thống bấm Xác nhận thu hồi |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Đóng hai lần đồng thời, thiếu lý do, không thu hồi được, quyền, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-12: Khoá hoặc mở khoá tài khoản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ⚠️ | Tên UC theo bảng giao việc gộp khoá và mở khoá; luồng chính là khoá, mở khoá ở AC.1, cùng tác nhân và cùng màn hình |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 đến 11 là hệ thống chạy liền sau khi Quản trị hệ thống bấm Xác nhận khoá |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Chốt an toàn, trạng thái đổi đồng thời, thiếu lý do, quyền, dịch vụ ngoài, nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-IAM-13: Cho nhân viên nghỉ việc

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Bàn giao tài sản sang UC-AST-05 theo HO-26 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-2]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | 7 hậu điều kiện |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 đến 14 là hệ thống chạy liền sau khi Quản trị hệ thống xác nhận, vì cả lệnh chạy trong một giao dịch |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Phương án chặn hay cảnh báo (Q-41) đưa vào ngoại lệ |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 và AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Chốt an toàn, tài sản chưa giao, cấp trên sai, lỗi giữa chừng, dịch vụ ngoài, đồng thời, quyền |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AST-05, UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-14: Xem hồ sơ cá nhân và đổi ngôn ngữ

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ⚠️ | Tên UC theo bảng giao việc gộp xem hồ sơ và đổi ngôn ngữ; cùng tác nhân, cùng màn hình, cùng một phiên |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | Nhân viên có tài khoản có trong tac-nhan.md |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Định tính, gắn A-09 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Phiên hết hạn, khoá, dịch vụ ngoài, giá trị sai, mất mạng, trường lạ |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-IAM-15: Tra cứu danh sách nhân viên

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Gắn [TBD-1]; không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 và AC.2 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Không có kết quả, quyền, ký tự đặc biệt, giới hạn tìm kiếm, truy vấn lỗi, bộ lọc sai |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-IAM-07 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 20 ✅, 0 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Quản trị tối cao (break-glass) | Tài khoản có `app_metadata.role` bằng admin, đi xuyên mọi kiểm vai trò và phạm vi trong code (§20 của blueprint) nhưng chưa có trong `tac-nhan.md`. UC M01 không dùng làm tác nhân; đề xuất người điều phối quyết định ghi vào danh mục hoặc để ở phần bảo mật, khi viết UC-AUD-02 | Chưa UC nào của M01 |

## Đối chiếu route auth

| Route | UC / luồng | Khớp code | Ghi chú |
| --- | --- | --- | --- |
| POST /v1/auth/register | UC-IAM-05, mục Ghi chú và vấn đề mở (độ lệch) | Lệch có chủ ý | Route hiện là đăng ký công khai: tài khoản chưa xác nhận email, hồ sơ mặc định ACTIVE, không vai trò, gửi thư xác nhận. D-01 đề xuất đóng (Q-19); lệnh thêm nhân viên ở UC-IAM-05 thay nó. Không nằm trong luồng nào của UC |
| POST /v1/auth/resend-confirmation | UC-IAM-07, mục Ghi chú và vấn đề mở (độ lệch) | Lệch có chủ ý | Route công khai, người dùng tự gọi, gửi lại thư xác nhận đăng ký, luôn trả một câu chung. UC-IAM-07 do Quản trị hệ thống gọi khi đã đăng nhập và gắn với bảng lời mời; đóng cùng lúc với register khi D-01 được duyệt |
| POST /v1/auth/login | UC-IAM-01 bước 5; UC-IAM-01.EX.1 đến EX.6 | Khớp một phần | Code chưa có trạng thái Chờ kích hoạt và cờ mật khẩu tạm (UC-IAM-01.AC.1); khi tài khoản không hoạt động, `login` không thu hồi phiên vừa tạo, khác `refresh` |
| POST /v1/auth/refresh | UC-IAM-01.AC.2 bước 1a đến 1d; UC-IAM-01.EX.7 | Khớp | Làm mới xác minh lại trạng thái hồ sơ và thu hồi mọi phiên khi tài khoản không hoạt động; làm mới thành công không ghi nhật ký |
| POST /v1/auth/logout | UC-IAM-02 bước 2 và 3; UC-IAM-02.EX.1, EX.2, EX.4 | Khớp | Phạm vi một thiết bị; lỗi thu hồi ở Dịch vụ xác thực không ném ra ngoài, vẫn ghi nhật ký |
| POST /v1/auth/logout-all | UC-IAM-02.AC.1 bước 1c; UC-IAM-02.EX.3, EX.5 | Khớp | Lỗi thu hồi được báo ra ngoài và không ghi nhật ký; có giới hạn tần suất nhóm xác thực |
| POST /v1/auth/forgot-password | UC-IAM-03 bước 4; UC-IAM-03.EX.2 đến EX.4 | Khớp | Luôn trả một câu chung, ghi nhật ký một dòng cho mỗi lần gọi không kèm email; dùng client dùng chung thay vì client dùng một lần |
| POST /v1/auth/reset-password | UC-IAM-03 bước 9 và 10; UC-IAM-03.EX.5 đến EX.7 | Khớp một phần | Code không kiểm trạng thái hồ sơ, nên tài khoản Tạm khoá hoặc Đã ngừng vẫn đặt lại được mật khẩu (đã ghi ở UC-IAM-03) |
| POST /v1/auth/change-password | UC-IAM-04 bước 6 đến 10; UC-IAM-04.EX.1 đến EX.6 | Khớp một phần | Code chưa có cờ phải đổi mật khẩu nên UC-IAM-04.AC.1 và AC.2 chưa chạy được; thu hồi mọi phiên khớp với UC |
| GET /v1/auth/me | UC-IAM-14 bước 2 và 3; UC-IAM-01 bước 9 | Khớp một phần | Code trả mã vai trò, mã location, ngôn ngữ; chưa trả chức danh, số điện thoại, đơn vị công tác, cấp trên, tên location, hiệu lực của vai trò. Chưa có route đổi ngôn ngữ (bước 5 của UC-IAM-14) |
