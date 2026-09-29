# Khai thác yêu cầu — EH-AM (Every Half · Quản lý tài sản & CCDC)

| Mục | Nội dung |
| --- | --- |
| Trạng thái | Bản nháp 1 · 29/09/2026 |
| Người soạn | Duy (BA/PO), với skill `product-discovery` (`ask-why-ba`, BA Zone) |
| Đầu vào | Bản chép brief `2026-09-29-brief-every-half.md` (B-01…B-40) |
| Giới hạn | Chưa phỏng vấn được Every Half. Mọi câu hỏi "vì sao" được chuyển thành câu hỏi mở `Q-`, mọi điều suy ra được ghi thành giả định `A-` |

Mã `FR-`, `NFR-`, `BR-` trong file này là mã nháp của bước khai thác. Blueprint sẽ đánh lại theo module (`F-<MÃ>-nn`, `BR-<MÃ>-nn`).

## 1. Phân loại ý định

| Nhóm trong brief | Mã brief | Loại ý định | Nhận xét |
| --- | --- | --- | --- |
| Mục tiêu | B-01, B-02 | Mục tiêu kinh doanh | Nói rõ cần truy xuất được gì, chưa có con số nào để biết đã đạt hay chưa |
| 1. Hồ sơ tài sản, CCDC | B-03…B-09 | Yêu cầu tính năng | Danh sách trường dữ liệu khá đủ; sáu trạng thái chưa có định nghĩa và quy tắc chuyển |
| 2. QR & kiểm kê | B-10…B-13 | Yêu cầu tính năng, nỗi đau vận hành, lo ngại tuân thủ | Kiểm kê hằng tháng là việc tay chân lặp lại. Ghi toạ độ và ảnh chạm tới dữ liệu cá nhân của nhân viên |
| 3. Điều chuyển | B-14…B-16 | Vấn đề quy trình | Điểm mấu chốt là bên nhận xác nhận bằng quét QR, tức vị trí chỉ đổi khi có người nhận |
| 4. Bảo trì, sửa chữa, báo hỏng | B-17…B-19 | Vấn đề quy trình | Chưa rõ ai tiếp nhận yêu cầu, ai chọn đơn vị sửa, ai nghiệm thu |
| 5. Thanh lý, báo giảm | B-20 | Vấn đề quy trình, tích hợp | Chuỗi duyệt → đổi trạng thái → báo giảm FAST; thiếu bước thực hiện thanh lý |
| 6. Khấu hao | B-21…B-25 | Lo ngại tuân thủ, nhu cầu báo cáo | "Tuân thủ quy định Việt Nam" là yêu cầu cần dịch thành quy tắc kiểm chứng được |
| 7. Kết nối FAST | B-26…B-30 | Tích hợp, **thiên lệch giải pháp** | "Đồng bộ 2 chiều" là một giải pháp được nêu sẵn. Nhu cầu bên dưới là sổ vận hành và sổ kế toán khớp nhau |
| 8. Dashboard | B-31…B-36 | Nhu cầu báo cáo | Chưa biết ai xem, bao lâu một lần, xem để ra quyết định gì |
| Nguyên tắc | B-37…B-39 | Lo ngại tuân thủ và kiểm soát | Ba nguyên tắc này là ràng buộc thiết kế xuyên suốt, không phải tính năng riêng |
| North Star | B-40 | Mục tiêu kinh doanh | Mô tả giá trị cho người quét tại hiện trường; là phép thử cho mọi màn hình |

**Thiên lệch giải pháp cần xem như giả thuyết, chưa phải yêu cầu đã chốt:**

- "Đồng bộ 2 chiều nguyên giá, phân loại, khấu hao, cost center, thanh lý" (B-29). Nếu cả hai hệ cùng được sửa nguyên giá và khấu hao thì sẽ có vòng ghi đè. Cần hỏi Kế toán trưởng trường nào thuộc về hệ nào (Q-06, Q-07).
- "Tọa độ" khi quét (B-13). Nhu cầu thật có lẽ là bằng chứng người kiểm có mặt tại điểm. GPS trong nhà lệch hàng chục mét và là dữ liệu cá nhân, nên có thể ảnh chụp tại chỗ cộng giờ server đã đủ (Q-20, Q-30).
- "Scan QR bằng điện thoại" (B-11). Chưa rõ điện thoại cá nhân hay của cửa hàng; khác nhau về đăng nhập, quyền camera và việc thu hồi quyền khi nhân viên nghỉ (Q-18).

## 2. Năm tầng yêu cầu (BABOK)

| Tầng | Trạng thái | Bằng chứng |
| --- | --- | --- |
| Yêu cầu kinh doanh (vì sao) | 🟡 | Có mục tiêu truy xuất (B-01, B-02, B-40); chưa có KPI, mức hiện tại, mục tiêu, thời hạn |
| Yêu cầu của các bên (ai cần gì) | 🟡 | Có nhắc nhân viên quét, store nhận hàng, người duyệt thanh lý, kế toán FAST; chưa có sơ đồ tổ chức, tên vai trò, số người |
| Yêu cầu chức năng (hệ thống làm gì) | 🟡 | 8 nhóm chức năng ở mức tính năng (B-03…B-36); thiếu luồng chi tiết, cấp duyệt, quy tắc xung đột khi đồng bộ |
| Yêu cầu phi chức năng (làm tốt đến đâu) | ⛔ | Chỉ có audit và phân quyền (B-37…B-39). Chưa có hiệu năng, khả dụng, làm việc khi mạng yếu, lưu trữ, dữ liệu cá nhân |
| Yêu cầu chuyển đổi (từ hiện trạng sang tương lai) | ⛔ | Brief không nhắc dữ liệu tài sản hiện có, dán nhãn lần đầu, đào tạo, số dư đầu kỳ trên FAST, chạy thử |

## 3. Biết và chưa biết

| Đã biết | Chưa biết |
| --- | --- |
| Phạm vi điểm: cửa hàng, kho, roastery, văn phòng (B-01) | Số lượng từng loại điểm, kế hoạch mở mới (Q-02) |
| Danh sách trường của hồ sơ tài sản (B-03…B-08) | Số lượng tài sản, ngưỡng CCDC "cần quản lý" (Q-03) |
| Sáu trạng thái tài sản (B-09) | Định nghĩa từng trạng thái, "Mất" khác "Hủy" ra sao, có cần "đang vận chuyển" (Q-10, Q-11) |
| Kiểm kê hằng tháng bằng điện thoại, 4 kết quả (B-11, B-12) | Kiểm toàn bộ hay kiểm vòng, ai kiểm, ai duyệt, xử lý "mất" thế nào (Q-12, Q-13) |
| Bên nhận quét QR xác nhận nhận hàng (B-15) | Ai được tạo lệnh điều chuyển, có cần duyệt không, nhận thiếu xử lý ra sao (Q-11) |
| Báo hỏng bằng quét QR tại store (B-17) | Đội sửa nội bộ hay thuê ngoài, ai nghiệm thu (Q-14) |
| Thanh lý cần phê duyệt (B-20) | Ai duyệt, hạn mức theo giá trị, hình thức thanh lý, biên bản (Q-08, Q-09) |
| FAST quản lý kế toán, EH-AM quản lý vận hành (B-26, B-27) | Bản FAST, cơ chế tích hợp, hệ nào tính khấu hao (Q-04, Q-06, Q-07) |
| Ba nguyên tắc: không xoá lịch sử, audit đủ 5 yếu tố, phân quyền theo vai trò và location (B-37…B-39) | Ai được xem giá trị tài sản, có cấp vùng không (Q-16, Q-17) |
| Có dashboard với 6 chỉ tiêu (B-31…B-36) | Ai xem, xem để quyết định gì, kỳ đối soát với FAST (Q-01, Q-29) |

## 4. Kết quả khai thác (13 mục theo mẫu của skill)

### 4.1. Vấn đề kinh doanh

Every Half đang có tài sản và CCDC nằm rải ở nhiều cửa hàng, kho, xưởng rang và văn phòng, và chúng di chuyển liên tục giữa các điểm và đơn vị sửa chữa. Khi cần trả lời "máy này là gì, đang ở đâu, ai giữ, còn giá trị bao nhiêu, đã qua những gì", không có một nguồn dữ liệu nào trả lời chắc chắn: thông tin vật lý nằm ở vận hành, thông tin giá trị nằm ở FAST, còn lịch sử thì gần như không có. Hậu quả suy ra được là kiểm kê tốn công mà khó kiểm chứng, sổ kế toán lệch thực tế, và mất mát khó quy trách nhiệm. Mức độ thật của từng hậu quả chưa được Every Half xác nhận (Q-01).

### 4.2. Mục tiêu kinh doanh

Mục tiêu brief nêu là truy xuất được đủ sáu thông tin (gì, ở đâu, ai quản lý, giá trị, tình trạng, lịch sử) cho mọi tài sản và CCDC cần quản lý (B-02, B-40). Để đo được, đề xuất các chỉ tiêu dưới đây; mức hiện tại và mục tiêu phải lấy từ Every Half (Q-01, Q-24):

| Chỉ tiêu đề xuất | Cách đo | Mức hiện tại | Mục tiêu | Thời hạn |
| --- | --- | --- | --- | --- |
| Tỷ lệ tài sản có hồ sơ và nhãn QR | Tài sản có nhãn / tài sản cần quản lý | Q-01 | Q-01 | Q-24 |
| Tỷ lệ điểm hoàn thành kiểm kê đúng hạn mỗi tháng | Điểm đã chốt kiểm kê / tổng điểm | Q-01 | Q-01 | Q-24 |
| Chênh lệch sổ EH-AM với FAST | Số tài sản lệch / tổng tài sản đã liên kết mã FAST | Q-01 | Q-01 | Q-24 |
| Thời gian ghi giảm trên FAST sau khi duyệt thanh lý | Ngày từ duyệt đến trạng thái Synced | Q-01 | Q-01 | Q-24 |
| Thời gian trả lời câu hỏi North Star | Giây từ lúc quét tới lúc hiện đủ sáu thông tin | Chưa có | Đo ở pilot | Q-24 |

### 4.3. Các bên liên quan

| Vai trò | Tổ chức | Mối quan tâm |
| --- | --- | --- |
| Ban giám đốc | Every Half | Tổng giá trị tài sản, tổn thất, quyết định thanh lý giá trị lớn, ngân sách dự án |
| Kế toán trưởng, kế toán tài sản | Every Half | Sổ FAST khớp thực tế, khấu hao đúng chính sách, ghi giảm đúng kỳ, chứng từ đủ |
| Vận hành – Hành chính (quản lý tài sản tập trung) | Every Half | Biết tài sản ở đâu, điều phối điều chuyển và sửa chữa, tổ chức kiểm kê |
| Quản lý cửa hàng | Every Half | Biết mình chịu trách nhiệm những gì, nhận hàng có biên nhận, báo hỏng nhanh |
| Nhân viên cửa hàng, barista | Every Half | Quét, chụp, xác nhận nhanh, không làm chậm ca |
| Thủ kho | Every Half | Xuất, nhận có đối chiếu, biết hàng đang ở đâu trên đường |
| Quản lý xưởng rang | Every Half | Máy rang giá trị cao, lịch bảo trì, thời gian dừng máy |
| Kỹ thuật nội bộ (nếu có) | Every Half | Nhận yêu cầu sửa, ghi kết quả (Q-14) |
| Kiểm soát nội bộ, kiểm toán | Every Half hoặc bên ngoài | Dấu vết đầy đủ Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do |
| Quản trị hệ thống (IT) | Every Half | Tài khoản, vai trò, cấu hình, bảo mật |
| Nhà cung cấp, đơn vị sửa chữa | Bên ngoài | Nhận yêu cầu sửa, báo giá, trả máy (không đăng nhập ở GĐ1, A-07) |
| Đầu mối FAST | Nhà cung cấp phần mềm FAST | Cơ chế tích hợp, định dạng dữ liệu (Q-04) |
| Đội triển khai | Bên triển khai của Duy | Phạm vi rõ, quyết định kịp thời, dữ liệu đầu vào sạch |

### 4.4. Nỗi đau (triệu chứng, suy luận từ brief)

- Không có câu trả lời chắc chắn "tài sản này đang ở đâu" khi nó đi lại giữa kho, cửa hàng và nơi sửa chữa (B-14).
- Kiểm kê hằng tháng làm bằng tay, tốn thời gian ca và khó kiểm chứng ai kiểm, có đến tận nơi không (B-11, B-13).
- Sổ FAST và thực tế lệch nhau; tài sản đã mất hoặc đã thanh lý có thể vẫn nằm trên sổ và vẫn bị trích khấu hao (B-20, B-36).
- Mất mát, hư hỏng khó quy trách nhiệm vì thiếu biên nhận bàn giao (B-15).
- Chi phí sửa chữa rời rạc, không so được theo dòng máy hay đơn vị sửa (B-18).
- Dữ liệu bị sửa mà không để lại dấu vết (B-37, B-38).

### 4.5. Nguyên nhân gốc

Mỗi nguyên nhân sâu hơn nỗi đau tương ứng một bậc. Tất cả là suy luận, cần Every Half xác nhận ở buổi làm rõ yêu cầu.

- Tài sản không có định danh gắn trên thân máy, nên không nối được các lần xuất hiện của cùng một tài sản qua nhiều điểm.
- Vị trí trên sổ không có điểm xác nhận bắt buộc: tài sản đổi chỗ mà không ai "nhận", nên sổ không đổi theo thực tế.
- Dữ liệu vật lý và dữ liệu tài chính nằm ở hai hệ, không có khoá liên kết (mã FAST), nên không đối chiếu được.
- Duyệt thanh lý và ghi giảm không đi chung một luồng có trạng thái, nên việc ghi giảm phụ thuộc trí nhớ của người làm.
- Không có lịch sử chỉ ghi thêm, nên sửa đè là mất dấu và không quy được trách nhiệm.
- Sự cố và chi phí sửa không được ghi theo cấu trúc (tài sản, lần sửa, đơn vị, chi phí), nên không tổng hợp được.

### 4.6. Yêu cầu chức năng

| Mã nháp | Yêu cầu | Nguồn brief |
| --- | --- | --- |
| FR-01 | Mỗi tài sản, CCDC cần quản lý có một Asset ID duy nhất và một mã QR riêng in từ Asset ID | B-03, B-10 |
| FR-02 | Hồ sơ lưu tên, loại, serial, hình ảnh | B-04 |
| FR-03 | Hồ sơ lưu ngày mua, nhà cung cấp, số hoá đơn hoặc PO | B-05 |
| FR-04 | Hồ sơ hiện nguyên giá, khấu hao, giá trị còn lại | B-06 |
| FR-05 | Hồ sơ lưu location, cost center, người quản lý | B-07 |
| FR-06 | Đính kèm và xem chứng từ liên quan | B-08 |
| FR-07 | Quản lý trạng thái theo sáu giá trị của brief và quy tắc chuyển trạng thái | B-09 |
| FR-08 | Tổ chức kiểm kê hằng tháng; nhân viên quét QR bằng điện thoại | B-11 |
| FR-09 | Ghi kết quả từng tài sản: có mặt, mất, sai vị trí, hư hỏng | B-12 |
| FR-10 | Mỗi lượt quét ghi người quét, thời gian, ảnh, vị trí, tình trạng | B-13 |
| FR-11 | Lưu lịch sử điều chuyển giữa kho, cửa hàng, nơi sửa chữa | B-14 |
| FR-12 | Bên nhận quét QR để xác nhận đã nhận hàng | B-15 |
| FR-13 | Quét QR tại cửa hàng để báo hỏng, tạo yêu cầu sửa chữa | B-17 |
| FR-14 | Lưu lịch sử bảo trì, chi phí sửa chữa, đơn vị cung cấp dịch vụ | B-18 |
| FR-15 | Cập nhật trạng thái tài sản trong suốt quá trình sửa chữa | B-19 |
| FR-16 | Phê duyệt thanh lý, đổi trạng thái, đồng bộ báo giảm sang FAST | B-20 |
| FR-17 | Theo dõi nguyên giá, khấu hao tháng, khấu hao luỹ kế, giá trị còn lại theo kỳ | B-21, B-22, B-23, B-24 |
| FR-18 | Liên kết Asset ID với mã tài sản FAST | B-28 |
| FR-19 | Đồng bộ nguyên giá, phân loại, khấu hao, cost center, thanh lý giữa EH-AM và FAST | B-29 |
| FR-20 | Ghi nhật ký đồng bộ với trạng thái Synced, Pending, Error | B-30 |
| FR-21 | Dashboard tổng tài sản và giá trị | B-31 |
| FR-22 | Dashboard tài sản theo cửa hàng, roastery, kho | B-32 |
| FR-23 | Dashboard khấu hao và giá trị còn lại | B-33 |
| FR-24 | Dashboard tài sản mất, hỏng | B-34 |
| FR-25 | Dashboard tiến độ kiểm kê đã hoàn thành | B-35 |
| FR-26 | Dashboard chênh lệch với FAST | B-36 |
| FR-27 | Quét bất kỳ tài sản nào là thấy đủ: là gì, ở đâu, ai quản lý, giá trị, lịch sử | B-02, B-40 |
| FR-28 | Quản lý tài sản ở cả bốn loại điểm: cửa hàng, kho, roastery, văn phòng | B-01 |
| FR-29 | Quản lý danh mục nền cần cho các trường trên: location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa | B-05, B-07, B-18 (suy ra) |
| FR-30 | Quản lý người dùng và gán vai trò theo location | B-39 (suy ra) |

### 4.7. Yêu cầu phi chức năng (đề xuất)

| Mã nháp | Yêu cầu | Nguồn brief |
| --- | --- | --- |
| NFR-01 | Phân quyền theo vai trò và theo location, kiểm ở phía server cho cả thao tác lẫn danh sách | B-39 |
| NFR-02 | Lịch sử và nhật ký thay đổi chỉ ghi thêm, không sửa, không xoá | B-16, B-37, B-38 |
| NFR-03 | Khấu hao và số liệu kế toán tuân thủ chế độ kế toán Việt Nam và chính sách của Every Half; cần Kế toán trưởng xác nhận | B-25 |
| NFR-04 | App quét chạy trên trình duyệt điện thoại phổ thông, dùng camera, thao tác một tay | B-11 |
| NFR-05 | Lượt quét gửi lại khi mạng chập chờn không tạo bản ghi trùng | B-11, B-13 |
| NFR-06 | Thời điểm ghi nhận lấy theo đồng hồ server; kỳ kế toán tính theo giờ Việt Nam | B-13, B-22 |
| NFR-07 | Dữ liệu cá nhân (toạ độ, ảnh có người, định danh nhân viên) được thu thập tối thiểu, có thông báo cho nhân viên; cần pháp chế xác nhận căn cứ | B-13 |
| NFR-08 | Giá trị tiền tệ lưu dạng số thập phân chính xác, tổng hợp bằng cơ sở dữ liệu | B-06, B-21…B-24 |
| NFR-09 | Kết quả tra cứu bằng QR hiện trong vài giây trên mạng di động; con số mục tiêu đo ở pilot | B-40 |
| NFR-10 | Giao diện tiếng Việt mặc định, có tiếng Anh | Suy ra từ người dùng |
| NFR-11 | Sao lưu và khôi phục được dữ liệu và tệp đính kèm | Suy ra từ B-37 |

### 4.8. Quy tắc nghiệp vụ (đề xuất, chờ Every Half xác nhận)

| Mã nháp | Quy tắc | Nguồn brief |
| --- | --- | --- |
| BR-01 | Không xoá lịch sử. Mọi "xoá" trên giao diện là đổi trạng thái kèm lý do | B-16, B-37 |
| BR-02 | Mọi thay đổi lưu đủ Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do | B-38 |
| BR-03 | Asset ID là duy nhất và không tái sử dụng, kể cả sau khi tài sản thanh lý | B-03 |
| BR-04 | Vị trí tài sản chỉ đổi qua điều chuyển có xác nhận nhận hàng | B-14, B-15 |
| BR-05 | Trạng thái chỉ chuyển theo bảng chuyển trạng thái đã duyệt | B-09 |
| BR-06 | Tài sản chỉ chuyển sang "Đã thanh lý" sau khi đề nghị được duyệt và việc thanh lý đã thực hiện | B-20 |
| BR-07 | FAST là sổ kế toán, EH-AM là sổ vận hành; mỗi trường dữ liệu có đúng một hệ làm chủ | B-26, B-27, B-29 |
| BR-08 | Một tài sản EH-AM liên kết với tối đa một mã tài sản FAST; ngoại lệ cho CCDC chờ Q-28 | B-28 |
| BR-09 | Khấu hao, phân bổ tính theo chính sách đã được Kế toán trưởng duyệt | B-25 |
| BR-10 | Người dùng chỉ thấy và thao tác tài sản của location mình có vai trò | B-39 |
| BR-11 | Mỗi location có một đợt kiểm kê mỗi tháng | B-11 |
| BR-12 | Kết quả "mất" khi kiểm kê là nghi mất; chỉ thành "Mất" sau xác minh và phê duyệt | B-12 |
| BR-13 | Báo hỏng được tiếp nhận thì tài sản chuyển "Đang sửa chữa"; nghiệm thu xong mới trở lại "Đang sử dụng" | B-17, B-19 |
| BR-14 | Mỗi lần sửa ghi chi phí và đơn vị sửa chữa | B-18 |
| BR-15 | Nhật ký đồng bộ có đúng ba trạng thái: Synced, Pending, Error | B-30 |
| BR-16 | Người đề nghị thanh lý không tự duyệt đề nghị của mình | B-20 (suy ra) |
| BR-17 | Nguyên giá và giá trị còn lại chỉ hiện cho vai trò được phép xem | B-06 (suy ra, chờ Q-16) |

### 4.9. Ràng buộc

- FAST là phần mềm kế toán đang dùng và tiếp tục dùng; EH-AM không thay thế FAST (B-27).
- Codebase đã chọn: NestJS 11 và Supabase ở backend, Vite + React ở frontend; hạ tầng auth, phân quyền, audit đã có.
- Quét bằng điện thoại (B-11), không giả định có máy quét chuyên dụng.
- Không xoá lịch sử (B-37) chi phối thiết kế dữ liệu: không có thao tác xoá cứng.
- Chế độ kế toán Việt Nam (B-25).
- Ngân sách, thời hạn, quy mô đội chưa biết (Q-24, A-11).

### 4.10. Rủi ro

| Mã | Rủi ro | Khả năng | Ảnh hưởng | Cách giảm |
| --- | --- | --- | --- | --- |
| R-01 | Bản FAST đang dùng không có API, hoặc API không mở phần tài sản | Cao | Cao | Tách tích hợp FAST sang GĐ2; thiết kế lớp tích hợp chạy được cả qua file nhập/xuất |
| R-02 | Chính sách khấu hao hoặc quy tắc làm tròn của EH-AM khác FAST, tạo chênh lệch từng tháng | Trung bình | Cao | Một hệ tính khấu hao chính thức, hệ kia chỉ hiển thị; đối soát hằng tháng |
| R-03 | Danh sách tài sản ban đầu thiếu serial, ngày mua, nguyên giá hoặc trùng lặp | Cao | Cao | Chiến dịch làm sạch và dán nhãn có kiểm soát, đối chiếu với sổ FAST trước khi mở hệ thống |
| R-04 | Nhân viên quét ảnh chụp mã QR thay vì đến tận nơi | Trung bình | Trung bình | Ảnh chụp tại chỗ bắt buộc, giờ server, cảnh báo quét bất thường |
| R-05 | Nhãn QR bong hoặc mờ ở khu quầy bar vì nhiệt và ẩm | Cao | Trung bình | Nhãn chịu nhiệt ẩm, quy trình in lại nhãn có lý do |
| R-06 | Mạng yếu ở kho, cửa hàng làm mất lượt quét | Trung bình | Trung bình | Hàng đợi gửi lại, chống ghi trùng |
| R-07 | Thu toạ độ và ảnh nhân viên mà không có căn cứ và thông báo phù hợp | Trung bình | Cao | Thu tối thiểu, thông báo và đồng ý theo quy định, pháp chế rà trước go-live |
| R-08 | Cấu hình phân quyền sai làm lộ giá trị tài sản hoặc tài sản của điểm khác | Trung bình | Trung bình | Mặc định từ chối, kiểm quyền ở server, rà quyền định kỳ |
| R-09 | Nhân viên ca coi kiểm kê là việc thêm, làm qua loa | Trung bình | Trung bình | Luồng quét tối đa vài thao tác, đào tạo, theo dõi tỷ lệ hoàn thành |
| R-10 | Đồng bộ hai chiều ghi đè qua lại giữa EH-AM và FAST | Trung bình | Cao | Ma trận sở hữu dữ liệu theo từng trường |
| R-11 | Phạm vi "CCDC cần quản lý" không rõ, dẫn tới lập hồ sơ quá nhiều hoặc quá ít | Cao | Trung bình | Every Half chốt ngưỡng và danh mục loại cần quản lý |
| R-12 | Người duyệt vắng mặt làm đề nghị thanh lý hoặc điều chuyển bị treo | Trung bình | Thấp | Uỷ quyền duyệt có thời hạn, cảnh báo quá hạn |

### 4.11. Giả định

| Mã | Giả định | Ai xác nhận |
| --- | --- | --- |
| A-01 | Every Half có nhiều cửa hàng, ít nhất một kho, một xưởng rang và một văn phòng; số lượng mỗi loại chưa biết | Vận hành |
| A-02 | Số tài sản và CCDC cần quản lý ở mức hàng nghìn, không phải hàng trăm nghìn | Kế toán trưởng, Vận hành |
| A-03 | Every Half đã có sổ tài sản cố định và CCDC trên FAST | Kế toán trưởng |
| A-04 | Mỗi điểm có ít nhất một điện thoại có camera và mạng 4G hoặc Wi-Fi dùng được cho việc quét | Vận hành |
| A-05 | Kiểm kê hằng tháng áp cho mọi location | Vận hành, Kế toán trưởng |
| A-06 | Thanh lý do Ban giám đốc duyệt, có thể phân cấp theo giá trị | Ban giám đốc |
| A-07 | Đơn vị sửa chữa và nhà cung cấp không đăng nhập hệ thống ở GĐ1 | Vận hành |
| A-08 | Mỗi location gắn với một cost center mặc định | Kế toán trưởng |
| A-09 | Mỗi nhân viên dùng tài khoản riêng (email hoặc số điện thoại), không dùng chung tài khoản | IT, Nhân sự |
| A-10 | Có danh sách tài sản hiện tại (Excel hoặc trên FAST) làm dữ liệu ban đầu | Kế toán trưởng, Vận hành |
| A-11 | Đội triển khai gồm một PO/BA, một đến hai backend, một frontend, một QA bán thời gian | Duy |
| A-12 | "Người quản lý" trong brief là người chịu trách nhiệm tài sản, thường là quản lý điểm | Vận hành |
| A-13 | Tài sản cố định và CCDC quản lý chung một sổ, phân biệt bằng loại | Kế toán trưởng |
| A-14 | Toàn chuỗi dùng một pháp nhân và một sổ FAST | Kế toán trưởng |
| A-15 | Hệ thống cần dùng được trong toàn bộ giờ mở cửa của cửa hàng | Vận hành |

### 4.12. Phụ thuộc

- Sản phẩm FAST đang dùng, cơ chế tích hợp và đầu mối kỹ thuật phía FAST (Q-04).
- Project Supabase của Every Half (chưa tạo; migration 01 chưa chạy).
- Chính sách kế toán tài sản của Every Half (Q-05).
- Sơ đồ tổ chức, danh mục location và cost center (Q-02, Q-17).
- Vật tư nhãn QR và nơi in (Q-22).
- Điện thoại dùng để quét tại điểm (A-04).
- Danh sách tài sản hiện có (A-10, Q-21).

### 4.13. Câu hỏi mở

Cột "Cần trước cổng" ghi "chờ Task 7" vì danh sách cổng kiểm soát chưa chốt; blueprint ánh xạ lại ở Phụ lục H.

| Mã | Câu hỏi | Người trả lời | Cần trước cổng |
| --- | --- | --- | --- |
| Q-01 | Hiện mỗi năm mất, hỏng bao nhiêu tài sản; sổ FAST lệch thực tế bao nhiêu; một lượt kiểm kê mất bao lâu? Đây là mức nền để đo lợi ích | Ban giám đốc, Kế toán trưởng | chờ Task 7 |
| Q-02 | Có bao nhiêu cửa hàng, kho, xưởng rang, văn phòng; 12 tháng tới mở thêm bao nhiêu điểm? | Vận hành | chờ Task 7 |
| Q-03 | Có khoảng bao nhiêu tài sản và CCDC; ngưỡng nào thì một CCDC "cần quản lý"? | Kế toán trưởng | chờ Task 7 |
| Q-04 | Every Half dùng sản phẩm và phiên bản FAST nào; có API hoặc cơ chế nhập/xuất cho phân hệ tài sản không; ai là đầu mối? | Kế toán trưởng, IT | chờ Task 7 |
| Q-05 | Chính sách khấu hao: phương pháp, thời gian sử dụng theo nhóm, ngày bắt đầu tính, làm tròn; CCDC phân bổ trong bao lâu? | Kế toán trưởng | chờ Task 7 |
| Q-06 | Hệ nào là nơi tính khấu hao chính thức: FAST hay EH-AM? | Kế toán trưởng | chờ Task 7 |
| Q-07 | Với "đồng bộ 2 chiều": trường nào EH-AM được sửa và đẩy sang FAST, trường nào chỉ nhận từ FAST? | Kế toán trưởng | chờ Task 7 |
| Q-08 | Ai duyệt thanh lý; có hạn mức theo giá trị; cần mấy cấp duyệt? | Ban giám đốc | chờ Task 7 |
| Q-09 | Thanh lý gồm những hình thức nào (bán, huỷ bỏ, cho tặng, trả nhà cung cấp) và cần biên bản gì? | Kế toán trưởng | chờ Task 7 |
| Q-10 | "Mất" và "Hủy" khác nhau thế nào; "Hủy" là huỷ bỏ tài sản vật lý hay huỷ một hồ sơ nhập sai? | Kế toán trưởng, Vận hành | chờ Task 7 |
| Q-11 | Có cần trạng thái riêng cho tài sản đang trên đường điều chuyển; nhận thiếu hoặc nhận hỏng xử lý ra sao? | Vận hành | chờ Task 7 |
| Q-12 | Kiểm kê hằng tháng là kiểm toàn bộ hay kiểm vòng theo nhóm; ai kiểm; bao lâu phải xong; ai duyệt kết quả? | Vận hành, Kế toán trưởng | chờ Task 7 |
| Q-13 | Tài sản không tìm thấy khi kiểm kê: ai xác minh, sau bao lâu thì đề nghị ghi giảm? | Kế toán trưởng, Ban giám đốc | chờ Task 7 |
| Q-14 | Every Half có đội kỹ thuật nội bộ hay thuê ngoài toàn bộ; có hợp đồng bảo trì định kỳ không; ai nghiệm thu sau sửa? | Vận hành | chờ Task 7 |
| Q-15 | "Người quản lý" tài sản là quản lý điểm hay người sử dụng trực tiếp? | Vận hành | chờ Task 7 |
| Q-16 | Ai được xem nguyên giá và giá trị còn lại; quản lý cửa hàng có được xem không? | Ban giám đốc, Kế toán trưởng | chờ Task 7 |
| Q-17 | Có cấp vùng hoặc khu vực và vị trí quản lý vùng không? | Vận hành | chờ Task 7 |
| Q-18 | Nhân viên cửa hàng đăng nhập bằng gì (email công ty, số điện thoại); điện thoại quét là của cá nhân hay của cửa hàng? | IT, Nhân sự | chờ Task 7 |
| Q-19 | Mở đăng ký tài khoản công khai, hay chỉ quản trị tạo và mời tài khoản? | IT, Ban giám đốc | chờ Task 7 |
| Q-20 | Every Half đã có nội quy hoặc văn bản đồng ý về việc thu toạ độ và ảnh của nhân viên khi làm việc chưa? | Pháp chế, Nhân sự | chờ Task 7 |
| Q-21 | Danh sách tài sản hiện có nằm ở đâu, đầy đủ đến đâu (serial, ngày mua, nguyên giá, vị trí)? | Kế toán trưởng, Vận hành | chờ Task 7 |
| Q-22 | Nhãn QR in nội bộ hay thuê in; khu quầy bar cần nhãn chịu nhiệt, ẩm không? | Vận hành | chờ Task 7 |
| Q-23 | Thông báo gửi qua kênh nào: email, Zalo, Lark? | Vận hành, IT | chờ Task 7 |
| Q-24 | Thời hạn go-live mong muốn, ngân sách, có chạy thử ở vài cửa hàng trước không? | Ban giám đốc | chờ Task 7 |
| Q-25 | Chuỗi có nhiều pháp nhân hoặc nhiều sổ FAST không? | Kế toán trưởng | chờ Task 7 |
| Q-26 | Đơn vị sửa chữa có cần nhận thông báo hoặc xác nhận qua hệ thống không? | Vận hành | chờ Task 7 |
| Q-27 | Tài sản giao cho cá nhân giữ (laptop, điện thoại văn phòng) có quản lý theo người không? | Nhân sự, IT | chờ Task 7 |
| Q-28 | Có CCDC nào cần quản lý theo số lượng (ví dụ nhiều ca đánh sữa giống nhau) thay vì từng chiếc? | Vận hành, Kế toán trưởng | chờ Task 7 |
| Q-29 | Chênh lệch với FAST đo theo chỉ tiêu nào (số lượng, nguyên giá, giá trị còn lại, cost center) và đối soát bao lâu một lần? | Kế toán trưởng | chờ Task 7 |
| Q-30 | App quét có cần chạy được khi mất mạng hoàn toàn (ví dụ kho không có sóng) không? | Vận hành | chờ Task 7 |

## 5. Tình huống biên

Các tình huống chưa được brief nhắc tới nhưng sẽ xảy ra. Blueprint phải có quy tắc cho từng nhóm; use case phải có ngoại lệ tương ứng.

### 5.1. Nhận diện và nhãn

- Quét một mã QR không thuộc hệ thống, nhãn giả, hoặc nhãn của tài sản đã thanh lý.
- Tài sản có trên sổ nhưng nhãn bong hoặc mất; cần in lại mà không tạo Asset ID mới.
- Nhập danh sách ban đầu có Asset ID trùng hoặc serial trùng.
- Tài sản cấu thành từ nhiều phần (máy pha và bộ phụ kiện): tách hay gộp hồ sơ.

### 5.2. Kiểm kê

- Một tài sản bị quét hai lần trong cùng đợt, hoặc bởi hai người khác nhau với kết quả khác nhau.
- Hai người cùng kiểm một location và gửi kết quả mâu thuẫn.
- Người kiểm từ chối quyền vị trí trên điện thoại, hoặc toạ độ lệch vì ở trong nhà.
- Giờ trên điện thoại sai; thời điểm ghi nhận phải theo giờ server.
- Quét ảnh chụp mã QR gửi qua tin nhắn thay vì quét tại chỗ.
- Tài sản không tìm thấy rồi sau đó tìm lại được.
- Tài sản của điểm khác xuất hiện tại điểm đang kiểm (sai vị trí).

### 5.3. Điều chuyển

- Bên nhận nhận thiếu (xuất ba, nhận hai) hoặc nhận tài sản hỏng.
- Điều chuyển tới sai điểm; bên nhận không xác nhận quá số ngày cho phép.
- Tài sản đang sửa chữa hoặc đang chờ thanh lý bị lập lệnh điều chuyển.
- Đổi cost center giữa tháng khi tài sản chuyển điểm; khấu hao tháng đó thuộc cost center nào.
- Đóng cửa một cửa hàng: toàn bộ tài sản phải đi đâu và theo lệnh nào.

### 5.4. Sửa chữa

- Đơn vị sửa giữ máy quá hạn, hoặc trả về một máy khác (đổi máy, thay linh kiện lớn).
- Chi phí sửa lớn làm tăng giá trị tài sản (nâng cấp) khác với sửa thường; cách ghi nhận do kế toán quyết định.
- Sửa không được, chuyển sang đề nghị thanh lý.

### 5.5. Thanh lý và mất

- Người đề nghị thanh lý cũng là người có quyền duyệt.
- Đã duyệt thanh lý nhưng chưa bán hoặc chưa huỷ được; hoặc thanh lý xong mới phát hiện tài sản vẫn còn dùng được.
- Tài sản đã ghi "Mất" rồi tìm thấy.

### 5.6. FAST và khấu hao

- Gửi sang FAST thất bại giữa chừng, gửi trùng, FAST trả lỗi dữ liệu.
- Sửa nguyên giá sau khi kỳ khấu hao đã khoá.
- Một mã FAST cho nhiều CCDC giống nhau (Q-28).

### 5.7. Người dùng và phân quyền

- Nhân viên nghỉ việc đang là người quản lý của nhiều tài sản.
- Quản lý cửa hàng A cố xem hoặc sửa tài sản của cửa hàng B.
- Người duyệt nghỉ phép; cần uỷ quyền có thời hạn.

## 6. Kết luận của bước khai thác

Tầng chức năng đã đủ để vẽ module và tính năng. Tầng kinh doanh và tầng các bên liên quan mới ở mức một nửa. Tầng phi chức năng và tầng chuyển đổi gần như trống, và đây là chỗ blueprint phải đề xuất nhiều nhất. Ba điểm cần Every Half trả lời sớm nhất vì chúng quyết định kiến trúc:

- Q-04, Q-06, Q-07: bản FAST và hệ nào làm chủ số liệu kế toán.
- Q-10, Q-11: định nghĩa trạng thái.
- Q-16: ai được xem giá trị tài sản.

Dải mã của file này: A-01…A-15, Q-01…Q-30, R-01…R-12. Các agent ở Task 3 dùng mã tạm có tiền tố riêng; sổ A/Q/R chung sẽ đánh tiếp sau các dải này.
