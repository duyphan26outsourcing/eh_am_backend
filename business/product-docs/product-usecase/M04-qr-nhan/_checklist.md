# Checklist 20 điểm: M04 QR và nhãn

## UC-QR-01: Sinh mã QR cho tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | "Sinh" cộng "mã QR cho tài sản" |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ⚠️ | Mức Chức năng con theo README, do UC-AST-01 và UC-AST-02 gọi; không qua coffee-break test vì không phải mục tiêu độc lập của một phiên |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản; mục tiêu là hồ sơ có mã QR |
| C5 | Ranh giới hệ thống rõ | ✅ | Chỉ từ Asset ID tới mã QR gắn hồ sơ; cấp Asset ID và lưu hồ sơ thuộc UC-AST |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu; gắn A-02, A-10 và [TBD-1] theo quy ước không tự đặt số |
| C9 | Tiền điều kiện kiểm được | ✅ | 4 điều kiện, đều kiểm được bằng dữ liệu |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Mã QR, nội dung mã, trạng thái nhãn, trạng thái vòng đời, nhật ký |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 9 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 2 đến 8 đều là việc của hệ thống vì đây là chức năng con; chỉ có hai điểm chạm với người dùng (bước 1 và 9) |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 nhập từ file |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Lỗi sinh mã, nhật ký, đồng thời, quyền, hết thời gian; không có mất mạng điện thoại vì thao tác chạy trên máy tính |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-QR-02: In nhãn QR theo lô

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Một người, một phiên, ra file in và lô đã ghi |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản; mục tiêu là file in cho một lô |
| C5 | Ranh giới hệ thống rõ | ✅ | Dừng ở file in đã tải; in ra giấy và dán nằm ngoài UC |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu; gắn A-02, A-10 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | Gồm điều kiện có khổ nhãn đã cấu hình, kiểm được bằng dữ liệu cấu hình |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Lô in, trạng thái nhãn, file in, tài sản không đổi, nhật ký |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 12 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5 đến 7 là ba lần nhập liệu liên tiếp và bước 8 đến 11 là bốn bước hệ thống liên tiếp; tách ra mới giữ được mỗi bước một hành động |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 chọn toàn bộ |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập thiếu, đồng thời, quyền, Storage, nhật ký, hết thời gian; không có mất mạng điện thoại vì thao tác chạy trên máy tính |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-QR-03: Xác nhận dán nhãn tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Xác nhận xong một nhãn là xong việc; AC.1 cho làm liên tiếp nhiều nhãn trong cùng phiên |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý điểm; mục tiêu là nhãn đã xác nhận dán đúng tài sản |
| C5 | Ranh giới hệ thống rõ | ✅ | Nhận diện nhãn do UC-QR-04 làm; UC này chỉ xác nhận và ghi |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu; gắn A-02, A-10 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | 3 điều kiện kiểm được bằng dữ liệu |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Trạng thái nhãn, người và thời điểm, tài sản không đổi, nhật ký, mã chống trùng |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | Việc nhãn đã dán lên tài sản đặt ở Giả định vì hệ thống không kiểm được |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 11 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 8 đến 10 là ba bước hệ thống liên tiếp ở phần ghi dữ liệu, còn lại luân phiên |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập sai (dán nhầm), không đọc được, quyền, đồng thời, mã lạ, mất mạng và hết thời gian, nhật ký |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04, UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 20 ✅, 0 ⚠️, 0 ❌.

## UC-QR-04: Quét QR nhận diện tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ⚠️ | Mức Chức năng con theo README, do sáu UC khác gọi (HO-03); kết quả dừng ở Asset ID và thông tin trả cho UC gọi, chưa phải mục tiêu độc lập |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Nhân viên điểm; mục tiêu là nhận diện tài sản từ nhãn |
| C5 | Ranh giới hệ thống rõ | ✅ | Chỉ nhận diện và kiểm quyền; cách dùng kết quả do UC gọi quyết định |
| C6 | Tác nhân là vai trò cụ thể | ✅ | Các vai trò khác ghi ở Phụ kèm "cũng thực hiện được" theo tac-nhan.md |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu; gắn A-05, A-02, A-10 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Đầu ra cho UC gọi, mức thông tin, tài sản không đổi, cờ nhập tay |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 9 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 4 đến 9 là sáu bước hệ thống liên tiếp vì đây là chức năng con; người dùng chỉ chạm ở bước 1 và 3 |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 nhập mã, AC.2 tài sản ngoài phạm vi |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 6 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Mã lạ, tài sản kết thúc, phiên và quyền, nhập sai, mất mạng và hết thời gian, camera; không có xung đột đồng thời vì UC chỉ đọc |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01, gọi ở EX.1 và EX.2 thay vì ở một bước của luồng chính vì chỉ ghi khi mã lạ hoặc tài sản kết thúc (BR-QR-05) |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-QR-05: Tra cứu tài sản bằng QR

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Một người, một phiên, biết được tài sản là gì, ở đâu, ai chịu trách nhiệm |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Nhân viên điểm; mục tiêu là đọc thông tin tài sản từ nhãn |
| C5 | Ranh giới hệ thống rõ | ✅ | Nhận diện và kiểm quyền do UC-QR-04; UC này lo phần hiển thị kết quả |
| C6 | Tác nhân là vai trò cụ thể | ✅ | Các vai trò khác ghi ở Phụ kèm "cũng thực hiện được" |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu; gắn A-17, A-04 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Nội dung kết quả theo mức thông tin, tài sản không đổi, trạng thái app |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 8 bước |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | Bước 4 đến 6 là ba bước hệ thống liên tiếp, còn lại luân phiên |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | 4 luồng thay thế: tài chính, ngoài phạm vi, camera mặc định, nhập mã |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 5 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Mã lạ, tài sản kết thúc, phiên và quyền, mất mạng và hết thời gian, camera; không có xung đột đồng thời vì UC chỉ đọc |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04, UC-IAM-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 20 ✅, 0 ⚠️, 0 ❌.

## UC-QR-06: In lại nhãn QR

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | Một người, một phiên, có file in lại cho tài sản |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | Quản lý tài sản; mục tiêu là file in lại với cùng mã QR |
| C5 | Ranh giới hệ thống rõ | ✅ | Dừng ở file in đã tải; dán lại thuộc UC-QR-03 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | Chưa có số liệu; gắn A-02 và [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | 5 điều kiện kiểm được bằng dữ liệu |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | Lượt in lại, Asset ID và mã QR giữ nguyên, trạng thái nhãn, file in, tài sản không đổi, nhật ký |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | 12 bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5 đến 7 là ba lần nhập liệu liên tiếp và bước 8 đến 11 là bốn bước hệ thống liên tiếp; tách ra mới giữ được mỗi bước một hành động |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | AC.1 nhiều tài sản |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | 7 ngoại lệ |
| C18 | Phủ các lỗi thường gặp | ✅ | Nhập thiếu, tài sản không hợp lệ, đồng thời, quyền, Storage và hết thời gian, nhật ký; không có mất mạng điện thoại vì thao tác chạy trên máy tính |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có đề xuất | Danh mục tác nhân hiện có đủ cho M04; việc Nhân viên điểm có được xác nhận dán nhãn hay không chờ [TBD-2] của UC-QR-03 | Không áp dụng |
