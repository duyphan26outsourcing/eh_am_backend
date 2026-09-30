# Phản biện danh mục tính năng Master Blueprint 1.0

Phạm vi: §8, §13, §14, Phụ lục B, F, K. Không phản biện lại MVP1 = GĐ1 hay M09, M10 ở GĐ2. Vị trí ghi theo file phần trong `bp/` (m06 = 30-phan-3-m06).

## 1. Dòng brief chưa được phủ đủ

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-01 | B-01 "cần quản lý" nhưng không có tiêu chí CCDC nào phải lập hồ sơ; CCDC theo số lượng để GĐ3 (Q-28) | m03 Ngoài phạm vi | Trung bình | Thêm BR-AST-11: ngưỡng giá trị hoặc loại CCDC bắt buộc lập hồ sơ; hỏi Vận hành |
| PB-02 | B-40 đòi thấy khấu hao, giá trị còn lại khi quét; GĐ1 chỉ có nguyên giá nhưng F-QR-04, BR-CMN-06 vẫn nhắc giá trị còn lại | m04 F-QR-04; 80-pl-f B-06, B-40 | Trung bình | Ghi rõ GĐ1 chỉ hiện nguyên giá; Phụ lục F đánh dấu B-06, B-40 phủ một phần |
| PB-03 | B-13 ghi "tình trạng" khi quét; F-STK-03 chỉ có ba kết quả, B.3 thiếu mức hư hỏng nhẹ dù B.2 có `MINOR_DAMAGE` | m05 F-STK-03; m03 BR-AST-10 | Trung bình | F-STK-03 thêm trường tình trạng (Tốt, Hư hỏng nhẹ, Hư hỏng) tách khỏi kết quả quét |
| PB-04 | B-29 đồng bộ "phân loại" nhưng F-FST-02, F-FST-03 không gửi hay nhận phân loại; ma trận ghi FAST làm chủ mà ánh xạ từ EH-AM | m10 ma trận, F-FST-02, F-FST-03 | Trung bình | Thêm "lệch phân loại" vào F-FST-05; sửa dòng Phân loại của ma trận cho khớp chiều thực tế |

## 2. Tính năng trùng hoặc lệch giữa hai module

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-05 | M06/M07, gửi sửa: F-MNT-02 cho tài sản thành Đang sửa chữa lúc tiếp nhận rồi mới tạo phiếu điều chuyển; bảng M03 chỉ cho Lưu kho, Đang sử dụng vào Chờ điều chuyển | m07 F-MNT-02, F-MNT-03, BR-MNT-03; m03 bảng | Cao | Chọn một mô hình: tại chỗ thì Đang sửa chữa lúc tiếp nhận; gửi ngoài thì qua Chờ điều chuyển, Đang vận chuyển. Sửa BR-MNT-03 |
| PB-06 | M06/M07, nhận về: BR-MNT-05 chỉ cho rời Đang sửa chữa khi nghiệm thu, bảng M03 cho ra ngay khi bên nhận xác nhận; F-MNT-06 "trạng thái trước sửa" không có chỗ lưu | m07 BR-MNT-05, F-MNT-06; m03 dòng Đang vận chuyển | Cao | Nhận về giữ Đang sửa chữa; chỉ nghiệm thu mới chuyển Lưu kho hoặc Đang sử dụng. Lưu trạng thái trước sửa trên phiếu sửa |
| PB-07 | M08/M10: F-DSP-07 và F-FST-02 cùng "tạo yêu cầu ghi giảm"; BR-DSP-07 lặp BR-FST-02; Phụ lục F gán B-20 chỉ cho F-DSP-07 | m08 F-DSP-07; m10 F-FST-02; 80-pl-f B-20 | Trung bình | M10 làm chủ việc tạo yêu cầu; bỏ F-DSP-07, BR-DSP-07 chỉ dẫn sang M10 |
| PB-08 | M08/M10, ghi giảm thiếu ba ca: thanh lý hoặc mất trong GĐ1 trước khi liên kết; tìm thấy lại sau ghi giảm; Hủy hồ sơ đã liên kết FAST | m08 F-DSP-06; m10 F-FST-01, F-FST-02; m03 F-AST-09 | Cao | Thêm F-FST-07 ghi giảm tồn lúc go-live GĐ2; tìm thấy lại tạo cảnh báo Kế toán tài sản, không tự ghi tăng |
| PB-09 | M06/M10: BR-TRF-02 đổi cost center theo điểm nhận, D-02 coi đơn vị sửa là location; mỗi lượt gửi sửa và nhận về sinh hai yêu cầu đổi cost center sang FAST | m06 BR-TRF-02; m02 BR-MDM-04, F-MDM-06 | Cao | BR-TRF-02 chỉ đổi cost center khi điểm nhận không phải location bên ngoài; gửi sửa giữ nguyên |
| PB-10 | M06/M10: BR-TRF-02 bỏ ngoại lệ "cost center riêng" của BR-MDM-04; F-TRF-02 duyệt khi khác cost center nhưng chưa có người duyệt | m06 F-TRF-02, BR-TRF-02; m02 BR-MDM-04 | Trung bình | Thêm ngoại lệ vào BR-TRF-02, thông báo Kế toán tài sản mỗi lần đổi, ghi ngày hiệu lực; chốt người duyệt (PB-29) |
| PB-11 | M05/M06, sai vị trí: điểm A (theo sổ) ghi NOT_FOUND, điểm B ghi WRONG_LOCATION; duyệt A đẩy tài sản sang Nghi mất dù B đã thấy | m05 F-STK-04, F-STK-06, BR-STK-03 | Cao | Khi duyệt đối chiếu chéo trong đợt; NOT_FOUND ở A mà WRONG_LOCATION ở B thì thành chênh lệch sai vị trí, không Nghi mất |
| PB-12 | M05/M08: F-DSP-05 cho "báo mất đột xuất" nhưng bảng M03 chỉ có đường vào Nghi mất qua duyệt kiểm kê | m08 F-DSP-05; m03 dòng Nghi mất | Cao | Thêm dòng "Lưu kho, Đang sử dụng, Đang sửa chữa sang Nghi mất: báo mất đột xuất (M08)" |
| PB-13 | M06/M05, nhận thiếu: không có dòng Đang vận chuyển sang Nghi mất; BR-STK-02 loại hàng đang vận chuyển khỏi kiểm kê nên không đợt nào bắt được; phiếu Nhận một phần không có điều kiện đóng | m06 F-TRF-05; m05 BR-STK-02, BR-STK-07 | Cao | Thêm dòng chuyển đó, điểm gửi chịu trách nhiệm, áp hạn BR-STK-07; phiếu RECEIVED khi mọi dòng có kết luận |

## 3. Quy tắc mơ hồ hoặc mâu thuẫn

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-14 | F-DSP-06 đưa tài sản tìm thấy lại về "location nơi tìm thấy", trái BR-AST-04 và BR-TRF-01; Mất chỉ sang Đang sử dụng, kho thì sai | m08 F-DSP-06; m03 BR-AST-04 | Trung bình | Giữ location theo sổ, lập điều chuyển điều chỉnh nếu khác; cho Mất sang Lưu kho hoặc Đang sử dụng |
| PB-15 | BR-AST-09 bắt người chịu trách nhiệm có vai trò trên location, nhưng F-TRF-04 đổi location không đổi người; BR-MDM-05 giao Quản lý tài sản (vai trò toàn hệ thống) | m03 BR-AST-09; m06 F-TRF-04; m02 BR-MDM-05 | Cao | F-TRF-04 bắt buộc chọn người chịu trách nhiệm mới; BR-AST-09 cho vai trò toàn hệ thống hợp lệ với location bên ngoài |
| PB-16 | BR-DSP-03 chọn cấp duyệt theo nguyên giá, nhưng người lập (Quản lý điểm) không thấy nguyên giá (BR-CMN-06) và nguyên giá có thể trống | m08 BR-DSP-03; 30-phan-3-dau BR-CMN-06 | Cao | Hệ thống tự xếp cấp duyệt, không lộ số cho người lập; thiếu nguyên giá thì chặn gửi duyệt |
| PB-17 | F-AST-01 không có nguyên giá nên tổng ở F-DSH-01 thiếu không cảnh báo; §8 giao Kế toán trưởng duyệt điều chỉnh tài chính nhưng F-AST-04 không có bước duyệt; sau liên kết FAST vẫn sửa được | m03 F-AST-04, BR-AST-05; m11 F-DSH-01; m10 ma trận | Trung bình | Thêm chỉ số tài sản chưa có nguyên giá; F-AST-04 thêm duyệt Kế toán trưởng; có liên kết FAST thì nguyên giá chỉ đọc |
| PB-18 | BR-CMN-05 "giờ máy chủ" là giờ nhận, không phải giờ quét (B-13) khi có hàng đợi gửi lại; lượt đến sau khi điểm đã chốt hoặc duyệt chưa có quy tắc | 30-phan-3-dau §12.1, BR-CMN-05; m05 BR-STK-08 | Cao | Lưu thêm giờ quét theo đồng hồ máy kèm cờ chưa xác thực; lượt đến muộn sau khi khoá thì từ chối bằng mã lỗi |
| PB-19 | BR-STK-02 chưa nói Chờ điều chuyển, Chờ thanh lý, Nghi mất, Đang sửa tại chỗ, tài sản đến giữa đợt có vào danh sách dự kiến không | m05 F-STK-01, BR-STK-02 | Trung bình | Lập bảng trạng thái vào và ra danh sách; tài sản đến giữa đợt ghi UNLISTED |
| PB-20 | Hủy hồ sơ từ "mọi trạng thái trừ Đã thanh lý, Mất" gồm cả Đang vận chuyển, Đang sửa chữa có phiếu mở; Quản lý tài sản vừa lập vừa duyệt trái BR-CMN-08 | m03 F-AST-09, BR-AST-06 | Trung bình | Chỉ Hủy từ Lưu kho, Đang sử dụng khi không còn phiếu mở; tách người đề nghị và người duyệt |
| PB-21 | Phiếu sửa sang TO_DISPOSAL là cuối, nhưng đề nghị bị từ chối hoặc huỷ thì tài sản kẹt Đang sửa chữa không phiếu mở, trái BR-MNT-05 | m07 F-MNT-07, BR-MNT-05; m08 F-DSP-04 | Cao | TO_DISPOSAL chưa phải cuối: đề nghị bị từ chối hoặc huỷ thì phiếu về ACCEPTED hoặc đóng REJECTED |
| PB-22 | Khoá tài sản chưa rõ: B.1 nói Chờ điều chuyển là "chưa xuất", bảng M03 gắn với "tạo phiếu"; phiếu Nháp có khoá không; BR-TRF-03 dùng "thường" | 80-pl-b B.1; m06 BR-TRF-03, BR-TRF-04 | Trung bình | Khoá ngay khi thêm vào phiếu, kể cả Nháp; bỏ chữ "thường", nêu ngoại lệ là phiếu do M07 tạo |
| PB-23 | BR-CMN-06 chỉ che nguyên giá; hoá đơn, PO (F-AST-06), chi phí sửa (F-MNT-05), tiền thu thanh lý (F-DSP-03) đều lộ giá, chưa có quy tắc xem | m03 F-AST-06; m07 F-MNT-05; m08 F-DSP-03 | Trung bình | Mở rộng BR-CMN-06 thành "thông tin tài chính" gồm các mục trên; gắn cờ nhạy cảm cho loại chứng từ |
| PB-24 | BR-MDM-03 chưa nói tài sản trạng thái kết thúc, Nghi mất có chặn đóng location không; BR-AST-03 chưa loại hồ sơ Hủy khỏi kiểm trùng serial | m02 BR-MDM-03; m03 BR-AST-03 | Thấp | Chỉ tính tài sản chưa kết thúc, Nghi mất vẫn chặn đóng; bỏ hồ sơ Hủy khỏi kiểm trùng |

## 4. Trạng thái có ở §14 mà thiếu hoặc lệch ở Phụ lục B

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-25 | Không có dòng Lưu kho sang Đang sử dụng hay ngược lại dù §10 bước 3, BR-AST-06 cấm đổi tay; không nói ai chọn Lưu kho hay Đang sử dụng khi nhận hàng | 20-phan-2 §10; m03 BR-AST-06 | Cao | Thêm "đưa vào sử dụng, ngừng sử dụng" có lý do; mặc định khi nhận: kho thì Lưu kho, còn lại Đang sử dụng |
| PB-26 | Bảng M03 thiếu bốn dòng: Đang sửa chữa sang Chờ điều chuyển hoặc Đang vận chuyển (PB-05, 06); Đang vận chuyển sang Nghi mất (PB-13); báo mất đột xuất (PB-12); Mất sang Lưu kho (PB-14) | m03 bảng chuyển trạng thái | Cao | Thêm bốn dòng, mỗi dòng ghi luồng kích hoạt và điều kiện |
| PB-27 | BR-CMN-07 hứa bảng chuyển trạng thái cho phiếu nhưng chỉ tài sản có bảng; B.4 chỉ liệt kê tên trạng thái, không có từ, sang, điều kiện, vai trò | 30-phan-3-dau BR-CMN-07; 80-pl-b B.4 | Cao | Thêm B.5 cho đợt, điều chuyển, sửa chữa, đề nghị (gồm REPAIRED, REJECTED, PARTIALLY_RECEIVED, RECOUNT_REQUESTED) |
| PB-28 | Chỉ có trạng thái cho điểm trong đợt; BR-STK-08 và F-DSH-04 cần trạng thái cấp đợt. Mã trùng giữa enum (`DAMAGED` B.2 và B.3, `IN_TRANSIT` B.1 và B.4); lẫn "Hủy", "Huỷ" | m05 BR-STK-08; m11 F-DSH-04; 80-pl-b | Trung bình | Thêm trạng thái đợt DRAFT, OPEN, CLOSED, CANCELLED; đặt tiền tố enum; thống nhất "Huỷ" |

## 5. Vai trò dùng ở §14 mà không có ở §8

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-29 | Nhiều bước "người duyệt" không gán vai trò: F-TRF-02 (Q-36), chi phí sửa (Q-37), F-DSP-05, F-DSP-06, F-AST-09; §8 chỉ nêu Ban giám đốc duyệt thanh lý | m06 F-TRF-02; m07 F-MNT-05; m08 F-DSP-05, F-DSP-06 | Cao | Thêm ma trận phiếu, người đề nghị, người duyệt vào §8, kiểm BR-CMN-08; chưa có Q thì ghi giả định |
| PB-30 | "Vận hành" (BR-QR-06), "người dán nhãn" (F-QR-03), "người nghiệm thu" (F-MNT-06), "người vận chuyển" (F-TRF-03) không có ở §8; F-DSP-03 giao Kế toán tài sản thanh lý, §8 không nêu; SCR-27, SCR-28 thiếu `ASSET_MANAGER` dù BR-TRF-05 | m04 BR-QR-06; m07 F-MNT-06; m08 F-DSP-03; 80-pl-k SCR-28 | Trung bình | Vận hành là `ASSET_MANAGER`; người dán, nghiệm thu là nhân viên hoặc quản lý điểm; người vận chuyển chỉ ghi văn bản; bổ sung §8 và SCR-27, 28 |

## 6. Tính năng chưa đủ rõ để tách use case

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-31 | F-STK-07 gộp bốn luồng (sai vị trí, xác minh nghi mất, đề nghị mất, báo hỏng); không có chức năng ghi kết luận xác minh nghi mất | m05 F-STK-07, BR-STK-07 | Cao | Tách F-STK-07a sai vị trí, F-STK-07b xác minh nghi mất (kết luận, ảnh, hạn); hai luồng kia chỉ dẫn sang M08, M07 |
| PB-32 | F-TRF-05 gộp nhận thiếu, nhận hỏng, nhận một phần; chưa nêu ai xử lý và trạng thái sau xử lý | m06 F-TRF-05 | Cao | Tách F-TRF-05a nhận thiếu, F-TRF-05b nhận hỏng, theo PB-13 |
| PB-33 | Điều kiện nằm ở câu hỏi mở: F-TRF-02 (Q-36), F-MNT-05 (Q-37), F-DSP-02 (Q-08); F-AST-02 chưa có cột mẫu file và cách cấp Asset ID, QR hàng loạt | m06, m07, m08; m03 F-AST-02 | Trung bình | Ghi mặc định đề xuất (ví dụ một cấp duyệt) đánh dấu giả định; thêm phụ lục cột mẫu nhập file |
| PB-34 | F-AUD-04 đến F-AUD-06 chưa liệt kê sự kiện thông báo, người nhận, kênh, hạn; F-STK-02, BR-TRF-07, BR-DSP-06 mỗi nơi nhắc một kiểu | m12 F-AUD-04 đến 06; m05 F-STK-02 | Trung bình | Thêm bảng sự kiện thông báo: sự kiện, người nhận, kênh, ngưỡng mặc định |
| PB-35 | F-QR-05 cho nhập tay Asset ID, chưa nói lượt nhập tay có tính là quét kiểm kê và có cần ảnh (BR-STK-04) không | m04 F-QR-05; m05 F-STK-03 | Trung bình | Đánh dấu riêng lượt nhập tay, vẫn bắt buộc ảnh; F-STK-08 báo tỷ lệ nhập tay theo điểm |

## 7. Tổng hợp đề xuất sửa

| Mã | Vấn đề | Vị trí (file, mã F/BR) | Mức (Cao/Trung bình/Thấp) | Đề xuất sửa cụ thể |
| --- | --- | --- | --- | --- |
| PB-36 | Bảng chuyển trạng thái tài sản thiếu dòng và lệch M06, M07, M08 (gộp PB-05, 06, 12, 13, 14, 25, 26) | m03 bảng chuyển | Cao | Làm đầu tiên: bổ sung dòng, thêm B.5 (PB-27), rồi mới viết use case M05 đến M08 |
| PB-37 | Luồng gửi sửa, nhận về, thanh lý từ phiếu sửa chưa khép kín (gộp PB-05, 06, 21, 22) | m06, m07, m08 | Cao | Chốt một mô hình trạng thái cho phiếu sửa và phiếu điều chuyển, sửa BR-MNT-03, BR-MNT-05, BR-TRF-03 cùng lúc |
| PB-38 | Quyền duyệt và quyền thấy giá chưa nhất quán (gộp PB-10, 16, 20, 23, 29, 30) | §8, BR-CMN-06 | Cao | Thêm ma trận người duyệt vào §8; mở rộng BR-CMN-06 sang mọi thông tin tài chính |
| PB-39 | FAST: ghi giảm trùng, thiếu ca ngoại lệ, cost center gửi sửa (gộp PB-04, 07, 08, 09) | m08 F-DSP-07; m10 | Trung bình | Bỏ F-DSP-07, thêm F-FST-07, sửa BR-TRF-02; ghi vào D-02, D-05 |
| PB-40 | Bằng chứng và xử lý mất trong kiểm kê (gộp PB-03, 11, 18, 19, 31, 32, 35) | m05, m06 | Cao | Thêm quy tắc đối chiếu chéo, giờ quét máy, tách F-STK-07 và F-TRF-05 trước khi tách use case. Các PB Thấp làm ở đợt soát văn |

## 8. Kết quả xử lý (người điều phối, 30/09/2026)

| Mã | Kết quả | Sửa ở đâu hoặc lý do |
| --- | --- | --- |
| PB-01 | Chấp nhận | BR-AST-11, dùng câu hỏi có sẵn Q-03 thay vì câu hỏi mới |
| PB-02 | Chấp nhận | F-QR-04, BR-CMN-06, Phụ lục F dòng B-06, B-40 |
| PB-03 | Chấp nhận | F-STK-03 thêm tình trạng vật lý tách khỏi kết quả quét |
| PB-04 | Dời sang GĐ2 | Chỉ liên quan M10; Duy chốt FAST không làm trong MVP1. Xử lý khi viết UC M10 |
| PB-05, PB-06 | Chấp nhận, chọn một mô hình | Tài sản ở Đang sửa chữa từ lúc tiếp nhận tới nghiệm thu, cả khi gửi ra ngoài; phiếu gửi sửa, nhận về chỉ đổi location. Sửa bảng chuyển trạng thái M03, F-MNT-02, F-MNT-03, BR-TRF-03, B.1 |
| PB-07, PB-08 | Dời sang GĐ2 | Chỉ liên quan ghi giảm sang FAST (M10). Ghi lại để làm khi bắt đầu GĐ2 |
| PB-09, PB-10 | Chấp nhận | BR-TRF-02: location bên ngoài giữ cost center, cost center riêng giữ nguyên, thông báo Kế toán tài sản |
| PB-11 | Chấp nhận | BR-STK-09, F-STK-06 |
| PB-12, PB-13 | Chấp nhận | Bảng chuyển trạng thái M03 thêm hai đường vào Nghi mất; F-TRF-05 viết lại, phiếu Đã nhận khi mọi tài sản có kết luận |
| PB-14 | Chấp nhận | F-DSP-06 giữ location theo sổ, lập điều chuyển điều chỉnh (BR-TRF-09); Mất sang Lưu kho hoặc Đang sử dụng |
| PB-15 | Chấp nhận | F-TRF-04 chọn người chịu trách nhiệm mới; BR-AST-09 cho Quản lý tài sản ở location bên ngoài |
| PB-16 | Chấp nhận | BR-DSP-03, F-DSP-02 |
| PB-17 | Chấp nhận một phần | F-DSH-01 thêm số tài sản chưa có nguyên giá; BR-AST-12 điều chỉnh cần Kế toán trưởng duyệt. Phần "có liên kết FAST thì nguyên giá chỉ đọc" dời sang GĐ2 |
| PB-18 | Chấp nhận | BR-CMN-05, BR-STK-10 |
| PB-19 | Chấp nhận | BR-STK-02 |
| PB-20 | Chấp nhận | F-AST-09, BR-AST-06, bảng chuyển trạng thái (Hủy chỉ từ Lưu kho, Đang sử dụng) |
| PB-21 | Chấp nhận | BR-MNT-08, Phụ lục B.5 |
| PB-22 | Chấp nhận | F-TRF-01, BR-TRF-03, BR-TRF-04 |
| PB-23 | Chấp nhận | BR-CMN-06 mở rộng thành thông tin tài chính |
| PB-24 | Chấp nhận | BR-MDM-03, BR-AST-03 |
| PB-25, PB-26 | Chấp nhận | F-AST-11 đưa vào, ngừng sử dụng; bảng chuyển trạng thái M03 viết lại đủ các dòng |
| PB-27 | Chấp nhận | Phụ lục B.5 chuyển trạng thái của phiếu và tài khoản |
| PB-28 | Chấp nhận một phần | Thêm trạng thái đợt kiểm kê. Không đặt tiền tố enum: mỗi đối tượng một kiểu riêng, ghi rõ ở cuối B.5. Giữ chữ "Hủy" theo brief B-09 |
| PB-29, PB-33 | Chấp nhận | Ma trận "Ai đề nghị, ai duyệt" ở §8 với người duyệt mặc định, A-20 |
| PB-30 | Chấp nhận một phần | §8 thêm Kế toán tài sản ghi nhận thực hiện thanh lý; SCR-27, SCR-28 thêm Quản lý tài sản; F-MNT-06 ghi rõ người nghiệm thu. "Vận hành" ở BR-QR-06 là bộ phận của Every Half trả lời câu hỏi, không phải vai trò trong hệ thống, nên giữ nguyên |
| PB-31, PB-32 | Chấp nhận | Tách F-STK-09 xác minh nghi mất khỏi F-STK-07; tách F-TRF-08 nhận hỏng khỏi F-TRF-05 |
| PB-34 | Chấp nhận | Bảng sự kiện thông báo mặc định ở cuối §14.12 |
| PB-35 | Chấp nhận | BR-STK-11, F-QR-05 |
| PB-36 đến PB-40 | Là dòng gộp | Đã xử lý qua các dòng trên |
