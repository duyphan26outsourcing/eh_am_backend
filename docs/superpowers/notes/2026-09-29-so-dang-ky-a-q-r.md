# Sổ đăng ký giả định, câu hỏi, rủi ro dùng chung

Mã chính của EH-AM: giả định `A-01…A-19`, câu hỏi `Q-01…Q-35`, rủi ro `R-01…R-17`. Từ Task 4 trở đi, blueprint và bộ use case chỉ dùng mã chính.

- `A-01…A-15`, `Q-01…Q-30`, `R-01…R-12`: nội dung đầy đủ ở `2026-09-29-kham-pha-yeu-cau.md` (mục 4.10, 4.11, 4.13).
- Các mã mới dưới đây lấy từ góp ý của product-manager, project-manager, scrum-master sau khi đã gộp mục trùng ý.
- Theo quyết định của Duy ngày 29/09, tích hợp FAST (M10) và khấu hao (M09) nằm ở GĐ2, ngoài MVP1. Các giả định, câu hỏi, rủi ro về FAST vẫn giữ để dùng khi vào GĐ2.

## Giả định mới

| Mã | Giả định | Ai xác nhận | Nguồn |
| --- | --- | --- | --- |
| A-16 | Danh sách tài sản hiện có ghi đủ serial, ngày mua và nguyên giá cho phần lớn bản ghi; nếu thiếu nhiều, thời gian làm sạch dữ liệu phải cộng vào lộ trình | Kế toán trưởng, Vận hành | A-PM-05 |
| A-17 | Ban giám đốc và Nhân sự đưa việc quét kiểm kê vào quy trình ca làm việc của cửa hàng | Ban giám đốc, Nhân sự | A-PM-07 |
| A-18 | Nếu FAST chỉ tích hợp được qua cách phức tạp, GĐ2 cần thêm một backend | Duy | A-PJ-02 |
| A-19 | Ngày go-live tránh kỳ khoá sổ kế toán và mùa cao điểm bán hàng | Ban giám đốc | A-PJ-05 |

## Câu hỏi mới

Cột "Cần trước cổng" ghi "chờ Task 7"; blueprint ánh xạ sang cổng thật ở Phụ lục H.

| Mã | Câu hỏi | Người trả lời | Cần trước cổng | Nguồn |
| --- | --- | --- | --- | --- |
| Q-31 | Ảnh chụp tại chỗ cộng giờ server có đủ làm bằng chứng người kiểm có mặt tại điểm không, hay bắt buộc phải có toạ độ? | Vận hành, Pháp chế | chờ Task 7 | Q-PM-04 |
| Q-32 | Hai hoặc ba điểm nào nên chạy thử (pilot) trước: ít tài sản, nhân viên sẵn sàng, dễ hỗ trợ? | Vận hành, Ban giám đốc | chờ Task 7 | Q-PJ-01 |
| Q-33 | Hypercare cần trực bao nhiêu giờ mỗi ngày; phía Every Half ai trực cùng (Vận hành, Kế toán, IT) và liên hệ thế nào? | Ban giám đốc, Vận hành | chờ Task 7 | Q-PJ-04, Q-PJ-09 |
| Q-34 | Khi người duyệt (điều chuyển, thanh lý, kết quả kiểm kê) vắng mặt, ai duyệt thay; có cho uỷ quyền có thời hạn không? | Ban giám đốc | chờ Task 7 | Q-SM-03 |
| Q-35 | Nếu pilot hoặc UAT phát hiện nhiều lỗi, Every Half chọn cắt phạm vi để giữ ngày go-live hay lùi ngày để sửa đủ? | Ban giám đốc | chờ Task 7 | Q-SM-05 |
| Q-36 | Điều chuyển nào cần duyệt trước khi xuất (khác cost center, tài sản giá trị cao, đi sửa bên ngoài), và ai duyệt? | Vận hành, Kế toán trưởng | chờ Task 7 | Blueprint §14.6 |
| Q-37 | Báo giá sửa chữa từ mức nào thì cần duyệt trước khi sửa, và ai duyệt? | Ban giám đốc, Vận hành | chờ Task 7 | Blueprint §14.7 |
| Q-38 | Ảnh bằng chứng kiểm kê và ảnh báo hỏng cần lưu trong bao lâu? | Vận hành, Pháp chế | chờ Task 7 | Blueprint §18 |
| Q-39 | Khi có sự cố, Every Half chấp nhận mất tối đa bao nhiêu giờ dữ liệu và chờ khôi phục tối đa bao lâu? | Ban giám đốc, IT | chờ Task 7 | Blueprint §20 |

## Rủi ro mới

| Mã | Rủi ro | Khả năng | Ảnh hưởng | Cách giảm | Nguồn |
| --- | --- | --- | --- | --- | --- |
| R-13 | Một mã tài sản FAST ứng với nhiều CCDC giống nhau, không liên kết một-một được (GĐ2) | Cao | Cao | Chốt Q-28 trước khi thiết kế liên kết; cho phép liên kết nhiều-một có kiểm soát | R-PJ-01 |
| R-14 | Hypercare quá tải vì lỗi quy trình hoặc hướng dẫn chưa đủ | Trung bình | Cao | Sửa luồng quét sau pilot, SOP xử lý lỗi thường gặp, go-live theo đợt | R-PJ-06 |
| R-15 | Nhân viên quét bằng điện thoại cá nhân: không kiểm soát thiết bị, khó thu hồi truy cập khi nghỉ việc | Cao | Trung bình | Khoá tài khoản ngay khi nghỉ việc; cân nhắc điện thoại của cửa hàng (Q-18) | R-PJ-08 |
| R-16 | Phải đổi nền tảng cơ sở dữ liệu giữa chừng (bỏ Supabase) | Thấp | Cao | Giữ logic phân quyền ở backend, không phụ thuộc chính sách RLS riêng của Supabase | R-PJ-10 |
| R-17 | Mô hình phân quyền chốt muộn hoặc đổi sau khi đã code, phải sửa schema và API | Trung bình | Cao | Chốt vai trò và phạm vi location ở cổng đầu tiên sau kick-off (Q-16, Q-17) | R-SM-02 |

## Đối chiếu mã tạm

| Mã tạm | Mã chính | Ghi chú |
| --- | --- | --- |
| A-PM-01, A-PM-02, A-PM-03, A-PM-04 | Q-01 | Số liệu nền (tỷ lệ chưa có hồ sơ, giờ kiểm kê, chênh lệch FAST, thời gian ghi giảm) là thứ cần hỏi, không đặt con số giả định |
| A-PM-05 | A-16 | |
| A-PM-06, A-PJ-03 | A-04 | Trùng ý |
| A-PM-07 | A-17 | |
| A-PJ-01, A-SM-01 | A-11 | Cùng giả định quy mô đội |
| A-PJ-02 | A-18 | |
| A-PJ-04 | A-05 | Trùng ý |
| A-PJ-05 | A-19 | |
| A-PJ-06, A-PJ-07 | Bỏ | Không phải giả định (một là tên hoạt động, một là việc cần làm định kỳ) |
| Q-PM-01, Q-PM-02 | Q-01 | |
| Q-PM-03, Q-PJ-07 | Q-02 | |
| Q-PM-04 | Q-31 | |
| Q-PM-05 | Q-08, Q-09 | |
| Q-PM-06 | Q-18 | |
| Q-PJ-01 | Q-32 | |
| Q-PJ-02, Q-PJ-03 | Q-24 | Thời hạn và ngân sách |
| Q-PJ-04, Q-PJ-09 | Q-33 | |
| Q-PJ-05 | Q-06 | |
| Q-PJ-06 | Q-12 | |
| Q-PJ-08 | Q-22 | |
| Q-PJ-10 | Q-03 | |
| Q-SM-01, Q-SM-02, Q-SM-04 | Bỏ | Câu hỏi nội bộ của đội triển khai; đã chốt sprint 2 tuần |
| Q-SM-03 | Q-34 | |
| Q-SM-05 | Q-35 | |
| R-PJ-01 | R-13 | |
| R-PJ-02, R-SM-06 | R-06 | |
| R-PJ-03, R-SM-04 | R-03 | |
| R-PJ-04 | R-04 | |
| R-PJ-05 | R-07 | |
| R-PJ-06 | R-14 | |
| R-PJ-07, R-SM-03 | R-05 | |
| R-PJ-08 | R-15 | |
| R-PJ-09, R-SM-07 | R-08 | |
| R-PJ-10 | R-16 | |
| R-SM-01 | R-01 | |
| R-SM-02 | R-17 | |
| R-SM-05 | R-12 | |
