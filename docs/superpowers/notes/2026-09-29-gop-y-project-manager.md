# Góp ý project manager cho Master Blueprint EH-AM

**Người viết:** Duy (PM Senior)  
**Ngày:** 29/09/2026  
**Phạm vi:** lộ trình, cổng kiểm soát, quản trị, RAID, chuyển đổi dữ liệu, go-live, chi phí vận hành, truyền thông, câu hỏi cho Every Half.

Tài liệu này bổ sung các yếu tố quản lý dự án vào Spec 2026-09-29-eh-am-tai-lieu-san-pham-design.md.

---

## 1. Lộ trình theo tuần kể từ kick-off

### Giả định quy mô đội (A-PJ-01)

Lộ trình tính dựa trên cơ cấu sau:
- 1 PO/BA (80% cho EH-AM, 20% dự án khác)
- 1 backend senior (100%)
- 1 backend junior hoặc 0,5 backend thêm (phụ thuộc A-PJ-02 về phạm vi tích hợp FAST)
- 1 frontend (100%)
- 1 QA bán thời gian 0,5 fulltime tương đương

**Nếu đội nhỏ hơn (chỉ 1 backend fulltime, không QA):** cộng thêm 4–6 tuần cho GĐ1 và GĐ2, qua tuần 14–16 thay vì tuần 10.

**Nếu đội lớn hơn (2 backend fulltime, 1 QA fulltime):** trừ 2–4 tuần, về tuần 6–8 cho GĐ1.

### Bảng lộ trình tương đối (A-PJ-02, A-PJ-03, A-PJ-04)

| Tuần | Giai đoạn | Hoạt động chính | Cổng | Kết quả |
|------|-----------|-----------------|------|---------|
| **Tuần -1 đến 1** | Chuẩn bị | Kick-off, quyết định kiến trúc, chuẩn bị hạ tầng Supabase, migration 01 | G0 | Dự án chính thức bắt đầu, project Supabase, migration chạy |
| **Tuần 2–3** | GĐ1: Hồ sơ & QR | Thiết kế và code M03 (hồ sơ tài sản), M04 (QR & nhãn), nhập ban đầu mô-đun | | Code review qua, UC chiến trường |
| **Tuần 2 (song song)** | GĐ1: Nền tảng | Code M01 (phân quyền theo location), M02 (danh mục) |  | Chi tiết quyền từng location, danh mục nền sạch |
| **Tuần 4–5** | GĐ1: Kiểm kê | Code M05 (kiểm kê hằng tháng qua app), luồng quét trên điện thoại, chống ghi trùng | G1 | App quét dùng được offline/online |
| **Tuần 5–6** | GĐ1: Điều chuyển | Code M06 (điều chuyển, xác nhận nhận hàng), kiểm tra ranh giới với kiểm kê | | Luồng điều chuyển đầy đủ |
| **Tuần 6–7** | GĐ1: Bảo trì | Code M07 (báo hỏng, sửa chữa, bảo trì), quản lý chi phí sửa | | Báo hỏng qua QR, lịch sửa đầy đủ |
| **Tuần 7** | GĐ1: Thanh lý | Code M08 (thanh lý có duyệt, báo giảm, trạng thái), tích hợp với FAST tạm | | Luồng thanh lý đầy đủ (chưa đồng bộ FAST) |
| **Tuần 8** | GĐ1: Dashboard | Code M11 (dashboard vận hành: tài sản theo điểm, mất/hỏng, tiến độ kiểm kê), không tính khấu hao | | 6 widget chính hoạt động |
| **Tuần 8–9** | GĐ1: Audit | Code M12 (nhật ký lịch sử, thông báo, không xoá), kiểm tra audit trail | G2 | Lịch sử đầy đủ, không thể xoá |
| **Tuần 9–10** | Pilot & UAT | Chạy pilot tại 2–3 cửa hàng, quy trình kiểm kê ban đầu, dùng thử dashboard | G3 | Phản hồi từ Every Half, danh sách lỗi ưu tiên |
| **Tuần 10–11** | Sửa GĐ1 | Sửa lỗi pilot, tối ưu UI/UX quét, tài liệu hướng dẫn cho nhân viên | | GĐ1 sẵn sàng mở rộng |
| **Tuần 12** | GĐ2: Khấu hao | Code M09 (khấu hao & phân bổ), tính theo chính sách Kế toán xác nhận, so sánh với FAST | G4 | Khấu hao đúng chính sách |
| **Tuần 12–13** | GĐ2: Tích hợp FAST | Code M10 (đồng bộ FAST 2 chiều), mapping Asset ID ↔ mã FAST, đối soát | | Log đồng bộ rõ, chênh lệch báo được |
| **Tuần 14** | GĐ2: Đối soát | Đối soát toàn bộ với FAST, xử lý lệch số | G5 | Sổ khớp, chênh lệch dưới 0,1% |
| **Tuần 14–15** | GĐ3: Tối ưu | Cảnh báo quy trình (nhãn QR mất, kiểm kê quá hạn), báo cáo nâng cao, tuning hiệu năng | | Hệ thống sẵn sàng scale |
| **Tuần 15–16** | Go-live prep | Huấn luyện, dữ liệu chuyên sâu, chuẩn bị hypercare | G6 | Đội và Every Half sẵn sàng |
| **Tuần 17** | **GO-LIVE** | Bật trên toàn chuỗi, hypercare 24/7 | G7 | Hệ thống live, không lỗi nguy hiểm |
| **Tuần 18–20** | Hypercare | Hỗ trợ 24/7, cập nhật nhanh | | Tỷ lệ hoàn thành kiểm kê ≥ 90%, không down |
| **Tuần 21+** | Chuyên cấp độ 2 | Sửa lỗi định kỳ, tối ưu, chuẩn bị tính năng GĐ3 | | Hệ thống ổn định |

### Ghi chú về lộ trình

**Pilot ở tuần 9** không phải bản hoàn chỉnh GĐ1. Chọn 2–3 cửa hàng với tài sản ít, nhân viên sẵn sàng, để kiểm:
- Quét trên điện thoại thực tế bao lâu
- Nhãn QR có bị mờ/bong không
- Kiểm kê hằng tháng ai duyệt, ai làm
- Một lần chuyển hàng thực tế có vấn đề gì

Dữ liệu pilot không bị xóa; dùng làm dữ liệu cho tuần 14 (đối soát).

**Tuần 10–11 (sửa GĐ1)** không phải pause dự án; backend/frontend song song chuẩn bị GĐ2 trong khi QA sửa lỗi.

**GĐ2 từ tuần 12** vì tích hợp FAST phụ thuộc Q-04 (bản FAST, API) và Q-06, Q-07 (sở hữu dữ liệu kế toán). Nếu mãi không có câu trả lời, GĐ2 bị treo theo R-01.

**Go-live tuần 17** là giả định A-PJ-05 (không có hiệp hành từ bên thứ ba, không kỳ kế toán khóa). Nếu Every Half muốn đẩy lên tuần 12, cách duy nhất là giảm phạm vi GĐ1 (chỉ hồ sơ, không kiểm kê hằng tháng).

---

## 2. Cổng kiểm soát

### Tổng quan

Mười cổng có trách nhiệm quyết định tương ứng từng người/vai trò phía Every Half. Người triển khai báo cáo tiến độ và thay phiên gặp Every Half để quyết định từng cổng. Không được bỏ qua cổng, không được go-live nếu chưa qua cổng cuối.

### Bảng cổng kiểm soát

| Cổng | Tên | Tuần | Mục đích | Tiêu chí vào | Tiêu chí ra | Quyết định | Người quyết |
|------|-----|------|---------|-------------|-----------|-----------|-----------|
| **G0** | Khởi động chính thức | 1 | Phê duyệt phạm vi, lộ trình, đội, kiến trúc, project Supabase | Spec được duyệt, hạ tầng sẵn sàng, đội xác nhận | Migration 01 chạy, sprint 1 bắt đầu | GO / GO-có điều kiện / Hoãn | Ban giám đốc + CTO (If có) |
| **G1** | Hoàn thành GĐ1 kiểm kê & quét | 5 | App quét không lỗi chi tiết trên điện thoại | M05 code xong, UC qua QA, unit test ≥ 80% | App quét offline/online, QA approve | GO / Sửa rồi duyệt lại | Quản lý Vận hành |
| **G2** | Hoàn thành audit trail | 9 | Lịch sử đầy đủ, không thể sửa sau | M12 code xong, audit log show đủ 5 yếu tố | Kiểm soát nội bộ / kiểm toán xác nhận | GO / Bổ sung | Kế toán trưởng + Kiểm soát |
| **G3** | Pilot thành công | 10 | Phản hồi GĐ1 từ thực tế, dữ liệu sạch | Pilot tại 2–3 cửa hàng tuần 2, kiểm kê ≥ 1 lần | Danh sách lỗi tối đa 10, không critical, nhân viên dùng tốt | GO / Kéo dài pilot | Quản lý cửa hàng + Vận hành |
| **G4** | Khấu hao chính xác | 12 | Khấu hao theo chính sách, so sánh FAST | Q-05 trả lời, quy tắc tính trong M09, test data đầy đủ | Khấu hao 3 tháng match FAST ±0,01%, chính sách được duyệt | GO / Chọn hệ nào tính | Kế toán trưởng |
| **G5** | Đối soát FAST hoàn | 14 | Sổ vận hành = sổ kế toán (trong sai số cho phép) | M10 code xong, data migration từ FAST xong, mapping rõ | Chênh lệch < 0,1%, log đồng bộ rõ, không vòng ghi đè | GO / Chọn phương án khác | Kế toán trưởng + IT FAST |
| **G6** | Hypercare sẵn sàng | 16 | Đội và Every Half sẵn sàng go-live | Tất cả 5 cổng trên pass, tài liệu + video đào tạo xong, contact list | Nhân viên tất cả điểm pass test, on-call list, SOP sửa lỗi | GO / Hoãn 2 tuần | Ban giám đốc + Quản lý Vận hành |
| **G7** | Go-live thành công | 17 | Hệ thống live, không crash, dữ liệu toàn vẹn | G6 pass, database sạch (dự phòng full), status tất cả điểm green | Dashboard 6 chỉ tiêu hiển thị, kiểm kê có ghi nhận, không downtime | GO / Rollback | CTO + Ban giám đốc |
| **G8** | Hypercare kết thúc | 20 | Bảo dưỡng độ 2, không cần on-call toàn thời gian | Tỷ lệ hoàn thành kiểm kê ≥ 90%, không lỗi pendant, sổ ổn định | Chuyển sang support định kỳ, nhân viên độc lập quét | GO | Quản lý Vận hành |
| **G9** | GĐ3 ra mắt | 22 | Tối ưu, cảnh báo, báo cáo nâng cao | G8 pass, tính năng tối ưu code xong, test UAT | Cảnh báo hoạt động, báo cáo nâng cao có dữ liệu, không down | GO | Ban giám đốc |

### Nguyên tắc cổng

1. **Quyết định rõ ràng** có ba lựa chọn: GO (tiếp tục), GO-có-điều-kiện (tiếp tục nhưng phải theo đó), hoãn (trì hoãn vài tuần), hoặc dừng (nếu vượt ngoài khả năng tính toán lại). Không có "GO với cảnh báo".

2. **Tiêu chí định lượng** giúp quyết định khách quan. Ví dụ "kiểm kê ≥ 90%" chứ không "kiểm kê được chạy". Nếu tiêu chí chưa đặt, G đó chưa sẵn sàng.

3. **Người quyết chính** là người dùng cuối tương ứng (Kế toán cho G4–G5, Quản lý cửa hàng cho G3, Ban giám đốc cho go-live), không phải đội triển khai.

4. **Báo cáo hai chiều** hằng tuần: một chiều đội báo tiến độ, tần suất rủi ro; chiều khác Every Half báo phản hồi, thay đổi phạm vi. Ghi log lại để audit.

5. **Không bypass cổng.** Nếu mãi không qua được, tìm cách thay thế (khác tính năng, khác lộ trình) và báo cáo lại.

---

## 3. Mô hình quản trị và RACI

### Các cơ chế quản trị

**Ban chỉ đạo dự án**
- Thành viên: Ban giám đốc Every Half, Kế toán trưởng, CTO/IT (nếu có), PO/BA triển khai.
- Tần suất: 2 tuần/lần, vào thứ năm để quyết định tuần sau.
- Chức năng: duyệt cấp cao, quyết cổng, thay đổi phạm vi, phân bổ ngân sách.

**Chủ dữ liệu kế toán (Kế toán trưởng)**
- Chịu trách nhiệm: chính sách khấu hao (Q-05), bản FAST (Q-04), mapping khấu hao (G4), đối soát (G5).
- Không được: ủy quyền xác nhận các Q trên cho nhân viên khác.

**Chủ vận hành tài sản (Quản lý Vận hành)**
- Chịu trách nhiệm: danh sách location và cost center (Q-02, Q-17), quy trình kiểm kê (Q-12), điều phối sửa chữa (Q-14), xác nhận pilot (G3).
- Hỗ trợ: đẩy thông báo tới quản lý cửa hàng, định kỳ kiểm tra tỷ lệ kiểm kê.

**Scrum Master / Quản lý dự án**
- Tổ chức họp tuần, track cổng, viết báo cáo tiến độ, quản lý rủi ro (RAID).
- Không được quyết định scope; chỉ báo ảnh hưởng nếu scope thay.

### Bảng RACI (10 hoạt động chính)

| Hoạt động | Ban chỉ đạo | Kế toán trưởng | Vận hành | Quản lý cửa hàng | PO/BA | Backend/Frontend | QA | Kiểm soát |
|-----------|------------|----------------|---------|-----------------|-------|------------------|-----|-----------|
| Xác nhận chính sách khấu hao (Q-05) | C | **R** | I | I | I | I | I | I |
| Chốt bản FAST & API (Q-04) | I | **R** | I | I | I | A | I | I |
| Định nghĩa trạng thái & luồng (Q-10, Q-11) | C | **R** | **R** | C | I | C | I | I |
| Lập danh sách location & cost center (Q-02) | I | C | **R** | C | I | I | I | I |
| Thiết kế quy trình kiểm kê & cấp duyệt (Q-12, Q-13) | C | C | **R** | **R** | C | I | I | I |
| Chạy pilot (G3) | C | I | **R** | **R** | C | A | A | I |
| Đối soát FAST (G5) | C | **R** | I | I | I | A | C | **R** |
| Khôi phục từ sự cố go-live (G7) | **R** | C | **R** | I | A | **R** | **R** | I |
| Xác nhận huấn luyện (G6) | C | I | **R** | **R** | C | I | I | I |
| Chuyển sang support độ 2 (G8) | **R** | I | **R** | C | I | C | I | I |

**Chú thích:** R = Responsible (thực thi), A = Accountable (chọn người R, phê duyệt kết quả), C = Consulted (hỏi trước), I = Informed (báo sau).

---

## 4. RAID

### Mở rộng rủi ro và vấn đề từ khai thác yêu cầu

Tài liệu 2026-09-29-kham-pha-yeu-cau.md có R-01 đến R-12. Góp ý project manager bổ sung các rủi ro dự án và vấn đề mở.

| Mã | Loại | Nội dung | Khả năng | Ảnh hưởng | Chủ sở hữu | Hành động giảm | Cảnh báo kích hoạt |
|----|------|---------|----------|----------|-----------|---------------|--------------------|
| **R-PJ-01** | Rủi ro | Mã FAST không duy nhất cho từng tài sản (one-to-many CCDC) | Cao | Cao | PO + Kế toán | Q-28 trước G2, thiết kế API đồng bộ chỉnh sửa | Kỹ thuật FAST báo không thể map 1-1 |
| **R-PJ-02** | Rủi ro | Mạng yếu ở kho, nhãn lệch toạ độ GPS | Cao | Trung bình | Backend | Dùng giờ server, ảnh chụp vị trí thay toạ độ (Q-20, Q-30), hàng đợi gửi lại | Nhân viên báo hiệp lệnh không đến tận nơi |
| **R-PJ-03** | Rủi ro | Data ban đầu từ FAST bị thiếu nguyên giá, serial, hoặc trùng lặp | Rất cao | Rất cao | Kế toán | Chiến dịch làm sạch data Q-21 trước tuần 2, đối chiếu với hoá đơn | Kiểm kê lần 1 mà có quá 5 tài sản chưa nhận diện được |
| **R-PJ-04** | Rủi ro | Nhân viên ca quét ảnh chụp QR, không đến tận nơi | Trung bình | Trung bình | QA + Vận hành | Yêu cầu ảnh chứa tài sản + nền quanh, GPS từ server (R-PJ-02), cảnh báo quét bất thường, đào tạo | Cảnh báo kiểm kê mà không có ảnh |
| **R-PJ-05** | Rủi ro | Quy định bảo vệ dữ liệu cá nhân (ảnh, toạ độ) thay đổi hoặc không rõ | Trung bình | Cao | Pháp chế | Research analyst kiểm quy định hiện hành, viết thông báo đặc thù trước go-live | Luật thay hay cảnh báo từ Lao động |
| **R-PJ-06** | Rủi ro | Hypercare vượt dự tính vì lỗi hệ thống hoặc quy trình | Trung bình | Cao | PO + Backend | Tối ưu UI/UX quét sau pilot (tuần 11), test load tại go-live, SOP sửa nhanh | Nhiều đơn yêu cầu hỗ trợ hơn 30 cái/ngày |
| **R-PJ-07** | Rủi ro | Nhãn QR bong, mờ ở quầy bar hoặc kho lạnh | Cao | Trung bình | Vận hành | Nhãn chịu nhiệt ±80°C, in test trước (Q-22), quy trình in lại với lý do, không tái sử dụng Asset ID cũ | Nhân viên báo nhãn bong mà không có con số ước tính |
| **R-PJ-08** | Rủi ro | Nhân viên sử dụng điện thoại cá nhân, mất mạng, ứng dụng quét crash | Cao | Trung bình | Frontend | Chỉ định điện thoại công ty (Q-18), hàng đợi offline + sync, exception handling chặt | Công ty phải mua/cấp điện thoại cho từng cửa hàng |
| **R-PJ-09** | Rủi ro | Cấu hình phân quyền sai, lộ giá trị tài sản hoặc tài sản của điểm khác | Trung bình | Cao | Backend | Mặc định từ chối, security review trước G1, rà quyền định kỳ (tuần 10, 15, trước go-live) | Quản lý cửa hàng báo xem được tài sản điểm khác |
| **R-PJ-10** | Rủi ro | Cần pivot sang cơ sở dữ liệu khác (không phải Supabase) giữa đường | Thấp | Rất cao | CTO | Kiến trúc dữ liệu không ràng buộc Supabase (tránh RLS quá specific), trong vòng 2 tuần có thể chuyển API sang database khác | Hợp đồng Supabase bị hủy hoặc không phê duyệt |
| **A-PJ-02** | Giả định | Cần 1 backend thêm nếu FAST có API phức tạp (R-01 xảy ra) | N/A | Cao | PM | Phân công sớm, xin ngân sách tuần 1 | Q-04 trả lời FAST cần customization cao |
| **A-PJ-03** | Giả định | Mỗi cửa hàng có ít nhất một điện thoại với camera + 4G/WiFi | N/A | Cao | Vận hành | Khảo sát Q-04 trước kick-off, có kế hoạch mua nếu thiếu | Mở cửa hàng mới không có điện thoại quét |
| **A-PJ-04** | Giả định | Kiểm kê hằng tháng được thực hiện đầy đủ và đúng hạn | N/A | Trung bình | Vận hành | Ghi lịch kiểm kê trong dashboard, cảnh báo quá hạn, báo cáo tỷ lệ định kỳ | Tỷ lệ kiểm kê < 60% 3 tháng đầu |
| **A-PJ-05** | Giả định | Thời gian go-live không trùng kỳ khóa sổ kế toán hoặc cao điểm kinh doanh | N/A | Cao | Ban giám đốc | Xác nhận tuần 5 (Q-24 trả lời) | Go-live tuần mùa bán không, sải nha có rủi ro |
| **Q-PJ-01** | Câu hỏi | Điểm nào trong chuỗi cần ưu tiên đầu tiên (pilot hoặc go-live) vì logistics, nhân viên sẵn sàng? | Vận hành | Tuần 1 | Dùng để chọn 2–3 cửa hàng pilot |
| **Q-PJ-02** | Câu hỏi | Có thể chạy hypercare chỉ tối ưu trên một vài cửa hàng trước (không toàn bộ) không? | Ban giám đốc | Tuần 7 | Nếu yes, giảm tải on-call, nếu no, tăng staffing |

---

## 5. Chuyển đổi dữ liệu và chiến dịch dán nhãn

### Quy trình chuyển đổi dữ liệu hiện có

**Bước 1: Chuẩn bị dữ liệu (Tuần 1–2)**
- Kế toán xuất danh sách tài sản từ FAST: Asset Code, tên, loại, nguyên giá, ngày mua, nhà cung cấp, cost center, trạng thái hiện tại.
- Ba: kiểm danh sách: thiếu serial, ngây mua, hoặc trùng Asset Code hay serial.
- Sửa chữa trong Excel hoặc trực tiếp FAST (không sửa trong hệ thống EH-AM); ghi lại ký phê duyệt của Kế toán trưởng.

**Bước 2: Nhập vào EH-AM (Tuần 2–3)**
- Backend viết job nhập hàng loạt từ file CSV: tạo Asset ID, mapping với FAST Asset Code, tính ngày bắt đầu khấu hao.
- Kho dữ liệu trên Supabase, bảng `assets` và `asset_fast_mapping`.
- Lưu lịch sử nhập (who, when, file version, number of rows inserted).

**Bước 3: Dán nhãn QR lần đầu (Tuần 3–8, song song với code)**
- Vận hành chọn nhà in hoặc in nội bộ dựa trên Q-22.
- Mỗi cửa hàng nhận bộ nhãn tương ứng với danh sách tài sản của nó (dựa trên location).
- Người in ghi biên bản: ngày in, số lượng, Asset ID từ–đến, nhà in, lô in (để có thể in lại nếu bong).
- Đóng gói nhãn theo location, gửi đến từng cửa hàng tuần 8.

**Bước 4: Gắn nhãn vật lý (Tuần 8–9, trước pilot)**
- Mỗi cửa hàng gắn nhãn trên tài sản: chọn vị trí tối ưu (không che màn hình, không quá nóng ở quầy bar), dùng keo chuyên dụng.
- Ghi biên bản: ngày gắn, người gắn (chữ ký), số lượng gắn xong, tài sản nào gắn không được vì không tìm thấy.
- Báo lại Vận hành số lượng gắn xong, tài sản chưa tìm được.

**Bước 5: Kiểm kê lần đầu (Tuần 9, đầu pilot)**
- Mỗi cửa hàng quét tất cả tài sản có nhãn QR một lần bằng app, ghi lại kết quả: tìm được, mất, hỏng, sai vị trí.
- So sánh với danh sách dự kiến; nếu lệch > 5%, xem lại gắn nhãn hoặc kiểm kê.
- Báo cáo lên Vận hành: tỷ lệ tìm được, số mất, vị trí sai.

### Chiến dịch kiểm duyệt (A-PJ-06)

Trước khi mở hệ thống cho mỗi location, phải qua:

1. **Đối soát danh sách** (Tuần 9–10 cho pilot, Tuần 15 cho go-live):
   - Danh sách tài sản trong EH-AM = danh sách đã gắn nhãn + ghi chú "chưa tìm được".
   - Không được phép mở hệ thống nếu lệch > 5% hoặc chưa gắn xong nhãn.
   - Ký duyệt: Quản lý cửa hàng + Vận hành.

2. **Đối soát với FAST** (Tuần 14 cho đối soát GĐ2, Tuần 16 cho go-live):
   - Danh sách tài sản đã mapping trong EH-AM = danh sách trong FAST theo cost center đó.
   - Nếu lệch, điều tra: tài sản xoá sai trong FAST, chưa cập nhật, hay Asset Code sai.
   - Ký duyệt: Kế toán trưởng.

3. **Danh sách "không được phép"**:
   - Không mở hệ thống cho location nếu chưa đối soát xong danh sách.
   - Không đồng bộ sang FAST nếu chưa xác nhận mapping đúng.
   - Không go-live toàn chuỗi nếu chưa qua G5 (đối soát FAST).

### Ước tính chi phí dán nhãn

Dựa trên A-02 (hàng nghìn tài sản), nếu 3.000 tài sản:
- Nhãn QR: 3.000–5.000 cái, chi phí in khoảng 0,5–2% ngân sách phần mềm.
- Gắn nhãn: nhân công 30–50 ngày/người, có thể dùng nhân viên hiện có.
- Kiểm kê lần đầu: 10–20 ngày/người.

---

## 6. Go-live và hypercare

### Gói go-live (Tuần 17)

**T-7 (Tuần 16)**
- Sao lưu database toàn bộ, kiểm tra restore.
- On-call schedule: hai backend/frontend, quay vòng 8 giờ, 24/7 tuần đầu.
- SOP sửa nhanh cho các lỗi thường gặp: quét không ra, kiểm kê không gửi, hiển thị sai dữ liệu.

**T-1 (Thứ 6 tuần 16)**
- Duyệt lại database sạch, không có dữ liệu pilot cũ cần xóa.
- Kiểm tra thông báo gửi được (email, Zalo, Lark nếu dùng).
- Test end-to-end trên tất cả location: quét một tài sản, đồng bộ FAST, dashboard cập nhật.

**T+0 (Thứ hai tuần 17, sáng)**
- Mở app cho tất cả nhân viên.
- Giờ này không cầu cứu hỗ trợ khác, chỉ hỗ trợ EH-AM.
- Báo cáo tình trạng lên Ban giám đốc mỗi 2 giờ.

**T+4 (Thứ 5 tuần 17)**
- Gọi mục đích G7 (go-live thành công) nếu không có downtime, lỗi critical.

### Hypercare (Tuần 17–20)

**Tiêu chí kết thúc hypercare (G8, tuần 20)**
- Tỷ lệ hoàn thành kiểm kê hằng tháng ≥ 90% ở tất cả location.
- Không có lỗi pendant (phiếu chờ duyệt quá 2 ngày).
- Sổ ổn định 1 tuần không ai báo lỗi.
- Nhân viên không cần hỏi IT mỗi lần quét.

**On-call**
- Tuần 17–18: hai backend + hai frontend, 24/7.
- Tuần 18–20: ba backend + một frontend, 12/7 (8h sáng tới 20h tối).
- Gọi đúng giờ < 15 phút.

**Cách quay đơn**
- Không quay hàng ngày; quay sau mỗi lần response (tức vài giờ, tối đa 4 giờ).
- Khi hết hypercare, chuyển sang support định kỳ thứ 2 buổi sáng, 30 phút/lần, không on-call.

---

## 7. Nhóm chi phí vận hành

Liệt kê nhóm chi phí và yếu tố chi phối; không ghi đơn giá hay tổng tiền (vì phụ thuộc quy mô Every Half chưa biết).

| Nhóm | Mục | Yếu tố chi phối |
|------|-----|-----------------|
| **Hạ tầng & Hosting** | Supabase (Postgres, Auth, Storage) | Số dòng tài sản, số lượt quét/tháng, lưu trữ ảnh |
| | Backup & disaster recovery | Quy định nội bộ, RTO/RPO |
| | DNS, SSL, domain | Số năm đăng ký |
| **Nhãn & Máy in** | Mua nhãn QR lần đầu | Số tài sản (A-02), chất lượng nhãn |
| | In lại nhãn hằng tháng | Tỷ lệ bong (R-07), tài sản mới (mở cửa hàng) |
| | Máy in loại nào | In nội bộ (thêm chi phí máy) hay thuê in |
| | Keo dán, công cụ gắn | Loại tài sản, vị trí gắn |
| **Thiết bị** | Điện thoại quét tại điểm | Số cửa hàng, loại điện thoại, bảo hành |
| | SIM / data công ty | Số điểm, dung lượng data/tháng |
| | Laptop cho Vận hành & Kế toán (nếu cần máy riêng) | Nếu dùng máy cá nhân |
| **Tích hợp FAST** | API của FAST (nếu tính phí) | Số API call/tháng, phí sử dụng |
| | Support từ nhà cung cấp FAST | Hỗ trợ mapping, sync, lỗi tích hợp |
| **Hỗ trợ & Bảo dưỡng** | Hỗ trợ định kỳ sau go-live (độ 2) | Số lần gặp sự cố/tháng, SLA yêu cầu |
| | Tối ưu, feature requests GĐ3 | Độ ưu tiên, số feature/năm |
| | Cập nhật bảo mật | Định kỳ, hoặc khi có lỗ hổng |

**Ghi chú:** Mỗi nhóm có chi phí cố định (hạ tầng, máy in) và biến động (data quét, nhãn in thêm, support). Từng năm sau nên review chi phí base trên thực tế dùng EH-AM (A-PJ-07).

---

## 8. Truyền thông và đào tạo

### Lịch trình truyền thông

| Thời điểm | Đối tượng | Nội dung | Kênh |
|-----------|----------|---------|------|
| **Tuần 1** | Tất cả nhân viên | Dự án EH-AM khởi động, lợi ích, timeline | Email + buổi họp tất cả điểm hoặc Zoom |
| **Tuần 4** | Quản lý cửa hàng + Vận hành | Test app trên điện thoại, feedback sớm | Workshop trực tiếp hoặc qua video ghi hình |
| **Tuần 9** | Nhân viên 2–3 cửa hàng pilot | Video hướng dẫn quét, lưu ý nhãn QR | App + Email + ghi chú trên điều phối |
| **Tuần 11** | Tất cả quản lý cửa hàng | Báo cáo kết quả pilot, chỉnh sửa dự kiến | Họp trực tiếp hoặc Zoom chi tiết 30 phút |
| **Tuần 15** | Tất cả nhân viên quét | Video + sổ tay hướng dẫn quét, kiểm kê, báo hỏng, gửi thông báo | Tải file, in sổ tay, test trên điện thoại |
| **Tuần 16** | On-call team | SOP sửa lỗi, escalation, contact list | Workshop 4 giờ trực tiếp hoặc Zoom |
| **Tuần 17 sáng** | Tất cả nhân viên | Go-live, bật lên đúng 8h sáng, hotline hỗ trợ | Thông báo qua SMS + email + tin nhắn Lark/Zalo |

### Kế hoạch đào tạo theo nhóm

**Nhóm 1: Ban giám đốc & Kế toán trưởng**
- Nội dung: Mục đích EH-AM, dashboard chỉ tiêu, KPI đo lợi ích (doanh thu kiểm kê, tỷ lệ lệch với FAST, thời gian ghi giảm).
- Tài liệu: Bản trình bày PDF (slide 8–10), liên hệ: PO.
- Lịch: Tuần 16 (1 giờ).

**Nhóm 2: Quản lý cửa hàng & Vận hành**
- Nội dung: Quy trình gắn nhãn, quét mỗi tháng, báo hỏng, điều chuyển, duyệt kiểm kê. Qui tắc không được (ví dụ không được sửa trạng thái tài sản thủ công).
- Tài liệu: Video 5 phút/chức năng, sổ tay PDF, link app test.
- Lịch: Tuần 15 (workshop 2 giờ + test 1 giờ), rồi tuần 16 (Q&A 30 phút).

**Nhóm 3: Nhân viên quét (barista, nhân viên kho, nhân viên xưởng rang)**
- Nội dung: Cách quét QR bằng điện thoại, chụp ảnh tại chỗ, gửi kết quả, xử lý lỗi "không quét được".
- Tài liệu: Video 2 phút từng bước, "thẻ nhanh" in giấy gắn cạnh quầy.
- Lịch: Tuần 15 (video group 30 phút + test từng người 15 phút), tuần 17 sáng (Q&A 15 phút trước go-live).

**Nhóm 4: IT / Quản trị hệ thống**
- Nội dung: Cách tạo người dùng, gán vai trò, reset mật khẩu, export log, backup database.
- Tài liệu: Tài liệu quản trị, access guide, SOP sửa lỗi.
- Lịch: Tuần 14–15 (workshop 3 giờ + lab hands-on 2 giờ).

**Nhóm 5: Hỗ trợ kỹ thuật (on-call)**
- Nội dung: Cách gỡ lỗi, kiểm tra database, restore từ backup, escalate tới Duy (PO), notifikasi status.
- Tài liệu: Runbook 1 trang/vấn đề phổ biến, flowchart debug, contact list.
- Lịch: Tuần 16 (workshop hands-on 4 giờ trên thực tế).

### Đoàn kết và công nhân

**Mục đích:** Giảm lo sợ khi thay đổi, tăng buy-in, giúp nhân viên cảm thấy dự án là của họ.

- **Tuần 1:** Email từ Ban giám đốc về tầm nhìn, lợi ích dự án.
- **Tuần 9:** Vinh danh 2–3 cửa hàng pilot (gửi thank-you gift hoặc voucher).
- **Tuần 17:** Buổi "kick off go-live" trực tiếp 30 phút với tất cả, Ban giám đốc cảm ơn.
- **Tuần 22:** Báo cáo kết quả 1 tháng dùng EH-AM (số tài sản dán nhãn, tỷ lệ kiểm kê, lỗi giảm so với trước), công nhân đội thắng giải.

---

## 9. Câu hỏi cho Every Half

Danh sách Q đã trong 2026-09-29-kham-pha-yeu-cau.md, dòng 247–279 (Q-01 đến Q-30). Project manager bổ sung các câu hỏi liên quan đến tổ chức, lộ trình, chi phí.

| Mã | Câu hỏi | Người trả lời | Cần trước cổng | Ghi chú |
|----|---------|-------------|---------------|--------|
| **Q-PJ-01** | Cửa hàng nào trong chuỗi sẵn sàng nhất cho pilot (có tài sản ít, nhân viên tích cực)? Đề xuất chọn 2–3 cửa hàng. | Quản lý Vận hành, Ban giám đốc | G1 | Ảnh hưởng: lộ trình kiểm kê lần đầu tuần 9. |
| **Q-PJ-02** | Thời gian go-live mong muốn (tuần mấy/tháng mấy 2027)? Có kỳ khóa sổ hoặc cao điểm kinh doanh không? | Ban giám đốc | G0 | Dựng lộ trình từ go-live về phía trước. |
| **Q-PJ-03** | Ngân sách dự án (cho phát triển, không bao gồm chi phí vận hành hằng tháng)? | Ban giám đốc | G0 | Ảnh hưởng: quy mô đội, scope. |
| **Q-PJ-04** | Cần hypercare 24/7 suốt 4 tuần hay chỉ 8–12 giờ/ngày? Có nhân sự on-call từ phía Every Half không? | Ban giám đốc + Vận hành | G6 | Ảnh hưởng: staffing, chi phí. |
| **Q-PJ-05** | Sau khi EH-AM go-live, chiếc nào phần mềm FAST sẽ "xác nhận chính thức" về khấu hao, thanh lý, v.v.? | Kế toán trưởng | G2 | Liên quan đến R-02 (vòng ghi đè khấu hao). |
| **Q-PJ-06** | Kỳ kiểm kê bao lâu một lần: hằng tháng, hằng quý, hay khác? Ai duyệt kết quả kiểm kê? | Vận hành + Kế toán | Q-12 | Ảnh hưởng: dashboard KPI, cảnh báo. |
| **Q-PJ-07** | Số điểm (cửa hàng + kho + xưởng + văn phòng) trong chuỗi hiện tại là bao nhiêu? Kế hoạch mở thêm bao nhiêu trong 12 tháng sau? | Vận hành + Ban giám đốc | G0 | A-02, A-PJ-03: ảnh hưởng đến chi phí hạ tầng, đội hỗ trợ. |
| **Q-PJ-08** | Mỗi điểm có máy in hoặc in ngoài? Nếu in ngoài, bao lâu giao nhãn? | Vận hành | G0 | Ảnh hưởng: lịch dán nhãn (tuần 8–9), kỳ kiểm kê lần đầu. |
| **Q-PJ-09** | Danh sách số điện thoại On-call từ phía Every Half (Kế toán, Vận hành, IT) để báo sự cố hypercare. | IT + Kế toán + Vận hành | G6 | Ghi vào SOP sửa lỗi. |
| **Q-PJ-10** | Bất kỳ tài sản nào có giá trị quá cao hoặc quá thấp không nên quản lý trong EH-AM (ví dụ building, xe công ty)? Ngưỡng là bao nhiêu? | Vận hành + Kế toán | G0 | A-02: phạm vi "CCDC cần quản lý". |

---

## Tóm tắt & Điểm quan trọng

### Ba điểm góp ý quan trọng nhất

1. **Phân kỳ GĐ1–GĐ2 là rủi ro lớn nhất (R-01, R-02 vượt qua, nhưng Q-04, Q-06, Q-07 chưa trả lời).** Nếu FAST không có API hoặc chính sách khấu hao chưa xác định, GĐ2 sẽ bị treo từ tuần 12 sang 16–20. Khuyến nghị: Kế toán trưởng xác nhận bản FAST và khả năng tích hợp sớm nhất tuần 1 kick-off (Q-04); nếu không chắc, dùng phương án B (nhập xuất qua file) và ghi vào scope GĐ3 thay vì GĐ2.

2. **Chiến dịch làm sạch dữ liệu tài sản ban đầu (R-PJ-03) phải chạy song song tuần 1–3, không được chậm.** Nếu danh sách FAST có 20% thiếu serial/ngày mua hoặc trùng Asset Code, kiểm kê lần đầu sẽ thất bại, dẫn tới pilot fail (G3 không pass), kéo dài 3–4 tuần. Khuyến nghị: Kế toán trưởng ưu tiên làm sạch ngay tuần 1, có kiểm tra chéo với hoá đơn.

3. **Đội triển khai quy mô A-PJ-01 là giới hạn cứng, và quy mô nhỏ hơn kéo dài lộ trình tối thiểu 4–6 tuần.** Nếu muốn go-live tuần 15 thay tuần 17, phải tăng backend hoặc cắt scope GĐ1. Khuyến nghị: Xác nhận ngân sách và thời hạn go-live tuần 1 (Q-PJ-02, Q-PJ-03), rồi tính lộ trình chính xác; không bao giờ kéo dài sprint hiện tại để "tiết kiệm", vì nợ kỹ thuật sẽ dồn lên hypercare.

