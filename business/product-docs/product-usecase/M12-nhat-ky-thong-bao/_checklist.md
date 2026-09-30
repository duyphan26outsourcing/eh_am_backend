# Checklist 20 điểm: M12 Nhật ký, lịch sử và thông báo

## UC-AUD-01: Ghi nhật ký thay đổi dữ liệu

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Ghi" cộng "nhật ký thay đổi dữ liệu" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ⚠️ | Mức "Chức năng con" theo README: UC do các UC khác gọi (HO-23), người dùng không dừng nghỉ sau khi xong UC này. Giữ nguyên theo giao việc |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Chính là Nhân viên có tài khoản; Bộ lập lịch ghi ở Phụ kèm "(cũng thực hiện được)" vì cùng một mục tiêu, đường đi riêng ở AC.1 |
| C5 | Ranh giới hệ thống rõ | ✅ | Chỉ tới lúc dòng nhật ký được ghi và UC gọi nhận kết quả |
| C6 | Tác nhân là vai trò cụ thể | ✅ | "Nhân viên có tài khoản" là tác nhân trong `tac-nhan.md`, dùng vì UC không phụ thuộc vai trò |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Gắn A-02 và A-05 cho quy mô và cao điểm; số dòng mỗi ngày chưa có, ghi [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | 3 điều kiện kiểm được bằng trạng thái tài khoản và dữ liệu UC gọi |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | 6 hậu điều kiện |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước; bước 1 gộp giá trị mới và lý do vì cùng là nhập liệu |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 3 đến 9 đều là hệ thống. Là chức năng con, các bước xử lý nội bộ này là điểm bàn giao HO-23 nên giữ, nhưng dev nên coi bước 4 đến 8 là mô tả hành vi chứ không phải màn hình |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | Bước 1 là trigger; bước 8 đạt hậu điều kiện 1 đến 4, bước 9 đạt hậu điều kiện 5 |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 4 luồng thay thế; AC.3 kết thúc UC mà không quay về luồng chính, có nói rõ |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Lỗi ghi, không đủ quyền, thiếu lý do (nhập sai), hai người cùng lúc, mất mạng gửi lại từ điện thoại, sửa hoặc xoá nhật ký. Không có dịch vụ ngoài trong UC này |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | Hiệu năng, bảo mật, tin cậy, tuân thủ, audit |

Tổng hợp: 17 ✅, 3 ⚠️, 0 ❌.

## UC-AUD-02: Tra cứu nhật ký thay đổi

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Người tra xem xong danh sách và chi tiết là có thể dừng; xuất file là luồng thay thế |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Chính là Kiểm soát nội bộ; Quản lý tài sản ở Phụ kèm "(cũng thực hiện được)" theo cột người dùng của SCR-38 |
| C5 | Ranh giới hệ thống rõ | ✅ | Chỉ màn hình **Nhật ký thay đổi** và kho tệp cho file xuất |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số; ghi [TBD-1], cao điểm gắn A-05 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Có cả trạng thái nhật ký không đổi và trạng thái khi có xuất file |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 7 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | Bước 7 đạt hậu điều kiện 1 và 2 |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Không đủ quyền, nhập sai điều kiện, hết thời gian chờ, hết phiên hoặc mất mạng, lỗi kho tệp khi xuất, đường dẫn hết hạn. Không có xung đột hai người vì UC chỉ đọc |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 có trong README |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | Dòng Audit nói việc ghi nhật ký khi xuất, thuộc phần audit, không lặp luồng |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AUD-03: Xem hộp việc và thông báo

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Người dùng thấy việc của mình và mở được việc cần làm; xử lý việc thuộc UC khác |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | UC dừng khi phiếu hoặc đề nghị được mở; không xử lý việc |
| C6 | Tác nhân là vai trò cụ thể | ✅ | "Nhân viên có tài khoản" đúng ghi chú của `tac-nhan.md`: hộp việc và thông báo thuộc nhóm thao tác không phụ thuộc vai trò |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số; ghi [TBD-1], cao điểm gắn A-05 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 7 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | Bước 5 đạt hậu điều kiện 4, bước 6 đạt hậu điều kiện 2 |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế; AC.1 kết thúc UC, có nói rõ |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Hết phiên hoặc khoá tài khoản, mất quyền, mất mạng và hết thời gian chờ trên điện thoại, đường dẫn sai, hai thiết bị cùng lúc. Không có nhập liệu nên không có lỗi nhập sai |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AUD-04: Gửi thông báo qua email

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Mức "Hệ thống": một lần chạy job trọn vẹn từ hàng đợi tới trạng thái đã gửi hoặc lỗi gửi |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Chính là Bộ lập lịch; Dịch vụ email là Phụ |
| C5 | Ranh giới hệ thống rõ | ✅ | UC dừng ở việc Dịch vụ email nhận email; không theo dõi email tới hộp thư |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | "Chạy liên tục" lấy từ §15, không có số email mỗi ngày; ghi [TBD-1], cao điểm gắn A-05 |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 2 đến 5 và 7 đến 9 là hệ thống liên tiếp vì đây là job nền không có người ngồi trước màn hình; chỉ Bộ lập lịch và Dịch vụ email xen vào |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Bước 8 là vòng lặp, cách viết được skill chấp nhận; mọi nhánh nằm ở luồng thay thế và ngoại lệ |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | Bước 7 đạt hậu điều kiện 1 và 2, bước 9 đạt hậu điều kiện 4 |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 3 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Dịch vụ email lỗi và quá thời gian chờ, lỗi liên tục, hai bản chạy cùng lúc, email không tồn tại, lỗi ghi trạng thái. Không có nhập liệu và phân quyền người dùng nên không có hai loại lỗi đó |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có; UC-AUD-05 và UC-AUD-06 chỉ nhắc ở tiền điều kiện và luồng thay thế |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-AUD-05: Nhắc hạn và cảnh báo quá hạn

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Nhắc" cộng "hạn", "cảnh báo" cộng "quá hạn" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Mức "Hệ thống": một lần chạy job hằng ngày. Gộp bốn job của §15 cùng cơ chế thành một UC; xem [TBD-5] về lời mời |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | UC chỉ tạo thông báo và hàng đợi; không đổi trạng thái nghiệp vụ, gửi email thuộc UC-AUD-04 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Một lần mỗi ngày theo §15, gắn A-05; số thông báo mỗi lần chạy ghi [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Gồm cả trạng thái dữ liệu nghiệp vụ không đổi |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 2 đến 10 là hệ thống liên tiếp vì là job nền; chỉ Bộ lập lịch mở và đóng lần chạy |
| C14 | Luồng chính không có rẽ nhánh | ✅ | Bước 4 liệt kê các loại nhắc, không rẽ nhánh; việc loại đang tắt nằm ở AC.1 |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | Bước 7 đạt hậu điều kiện 1 và 2, bước 8 đạt hậu điều kiện 3, bước 10 đạt hậu điều kiện 5 |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Lỗi cơ sở dữ liệu và hết thời gian chờ, thiếu ngưỡng (cấu hình sai), thiếu người nhận, chạy song song và chạy lại, job bị ngắt |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-04 gọi ở bước 9 theo HO-25 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-AUD-06: Cấu hình thông báo

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ⚠️ | "Cấu hình" vừa là danh từ vừa là động từ; tên do README chốt, ở đây dùng như động từ cộng đối tượng "thông báo" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | UC dừng ở lúc cấu hình được lưu; hiệu ứng lên job thuộc UC-AUD-04 và UC-AUD-05 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chưa có số; ghi [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 10 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | Bước 9 đạt hậu điều kiện 1 đến 4, bước 10 đạt hậu điều kiện 5 |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 2 luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Không đủ quyền, nhập sai, thiếu lý do, hai người cùng lúc, lỗi ghi nhật ký, mất mạng khi lưu |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 gọi ở bước 9 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

Tổng hợp module M12: 6 UC, 110 ✅, 10 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có đề xuất | Sáu UC dùng đủ tác nhân trong `tac-nhan.md` | Không áp dụng |
