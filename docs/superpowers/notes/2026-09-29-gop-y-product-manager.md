# Góp ý Product Manager — Master Blueprint EH-AM

| Góp ý từ | Duy (BA/PO) → voltagent-biz:product-manager |
| --- | --- |
| Ngày | 2026-09-29 |
| Giai đoạn | Trước viết blueprint (Bước 2, song song với khai thác yêu cầu) |
| Phục vụ | Chốt chiến lược sản phẩm, ưu tiên tính năng, KPI, phân kỳ |

## 1. Tuyên ngôn và tầm nhìn

EH-AM là hệ thống quản lý vòng đời tài sản sản xuất của chuỗi F&B Every Half, giúp truy xuất đầy đủ và nhanh từng tài sản: là gì, ở đâu, ai quản lý, còn giá trị bao nhiêu, lịch sử thay đổi.

**Tầm nhìn giai đoạn.**

Giai đoạn 1 (GĐ1) xây dựng sổ vận hành chính thức: hồ sơ tài sản có nhãn QR, kiểm kê tháng, điều chuyển, sửa chữa, thanh lý có duyệt. Mục tiêu là dữ liệu vị trí và trạng thái luôn khớp thực tế, từng thay đổi được ghi nhận. Đối tượng khởi động là một hoặc hai cửa hàng tiêu biểu để kiểm chứng quy trình trước khi triển khai toàn chuỗi.

Giai đoạn 2 (GĐ2) kết nối với FAST để sổ kế toán và sổ vận hành không còn lệch. Bao gồm tính khấu hao, đối soát nguyên giá và giá trị còn lại, báo giảm tài sản. Yêu cầu tích hợp với bản FAST đang dùng: nếu không có API thì dùng nhập/xuất file. Rủi ro này cần xử lý tách biệt ở GĐ2 để không trì hoãn GĐ1.

Giai đoạn 3 (GĐ3) tối ưu hoạt động: dự báo bảo trì, tối ưu chi phí sửa chữa theo dòng máy, gợi ý giải quyết bất thường. Có thể dùng AI để phân tích biểu mẫu bảo trì và đề xuất, nhưng không ra quyết định thay con người.

Dài hạn, EH-AM trở thành nền tảng quản lý tài sản cho toàn chuỗi mở rộng: cửa hàng mới, loại tài sản mới, pháp nhân mới. Nó cung cấp dữ liệu để Every Half quyết định đầu tư và điều chuyển tài sản giữa điểm bán, tính khấu hao đúng chính sách, lập báo cáo tài chính với bằng chứng đầy đủ.

## 2. Giá trị cho từng bên

| Bên liên quan | Nỗi đau hiện tại | Giá trị EH-AM cung cấp |
| --- | --- | --- |
| Ban giám đốc | Không biết tổng giá trị tài sản, tỷ lệ mất hàng năm, chi phí sửa chữa theo điểm; kiểm kê tốn nhân lực; không phê duyệt thanh lý theo quy trình | Nhìn được tổng giá trị, mất mát, sửa chữa trên dashboard; phê duyệt thanh lý tập trung theo giá trị; dữ liệu cho quyết định đầu tư |
| Kế toán trưởng, kế toán tài sản | Sổ FAST lệch thực tế hàng tháng; lịch sử sửa đổi không rõ ràng; khấu hao tính sai khi tài sản mất được phát hiện trễ; ghi giảm chậm vì tài sản chưa được báo | Sổ khớp thực tế qua kiểm kê hằng tháng; lịch sử thay đổi đầy đủ; bảng điều chỉnh khấu hao; đối soát tự động với FAST |
| Vận hành tập trung | Không biết tài sản ở đâu; điều phối khó khăn; kiểm kê thủ công; sửa chữa không được theo dõi | Vị trí cập nhật ngay khi nhận hàng; kiểm kê bằng quét QR; chi phí sửa chữa được theo dõi; báo cáo theo location và cost center |
| Quản lý cửa hàng | Kiểm kê tốn thời gian ca; nhận hàng không có biên nhận; báo hỏng không được theo dõi | Kiểm kê quét QR không nhập tay; biên nhận tự động; báo hỏng và theo dõi sửa chữa trên app; chịu trách nhiệm rõ ràng |
| Nhân viên ca | Kiểm kê thủ công rườm rà; không biết lý do phải quét | Quét QR với điện thoại vài thao tác, không làm chậm ca; hiểu được vì sao (dấu vết để xử lý mất mát) |
| Kỹ thuật nội bộ hoặc sửa chữa | Yêu cầu sửa không có hệ thống; không biết đã sửa xong hay chưa | Nhận yêu cầu qua hệ thống; báo giá, tiến độ, hoàn thành được ghi nhận |

## 3. North Star và chỉ số dẫn dắt

**North Star Metric.** Quét bất kỳ tài sản nào và biết đủ sáu thông tin: là gì, ở đâu, ai quản lý, giá trị (nguyên giá, khấu hao tháng, giá trị còn lại), lịch sử đầy đủ. Cách đo: nhân viên quét QR, hệ thống trả lời trong vài giây trên mạng di động; tỷ lệ truy vấn thành công (không lỗi, không thiếu thông tin) ≥ 95%. Mục tiêu này áp dụng từ GĐ1 (chưa có khấu hao chính xác, nhưng có giá trị còn lại từ FAST) và hoàn chỉnh sau GĐ2.

**Chỉ số dẫn dắt.**

1. **Tỷ lệ tài sản có hồ sơ và nhãn QR.** Công thức: (tài sản có nhãn QR và hồ sơ đầy đủ 5 trường) / (tài sản cần quản lý) × 100%. Nguồn: cơ sở dữ liệu EH-AM. Chịu trách nhiệm: Vận hành tập trung. Mục tiêu GĐ1: ≥ 90%. Cách đo: hằng tháng sau lần dán nhãn đầu tiên.

2. **Tỷ lệ hoàn thành kiểm kê đúng hạn từng location hằng tháng.** Công thức: (location đã chốt kiểm kê trước ngày chốt của tháng) / (tổng location) × 100%. Nguồn: nhật ký kiểm kê EH-AM. Chịu trách nhiệm: Quản lý cửa hàng theo location. Mục tiêu GĐ1: ≥ 80%. Cách đo: hằng tháng ngay sau hạn kiểm kê.

3. **Chênh lệch sổ EH-AM với FAST.** Công thức: |số tài sản EH-AM có liên kết mã FAST - số tài sản FAST đó| / (số tài sản FAST) × 100%. Nguồn: EH-AM và FAST sau kỳ đối soát. Chịu trách nhiệm: Kế toán tài sản. Mục tiêu GĐ2: ≤ 5% theo số lượng. Cách đo: hằng tháng sau đối soát.

4. **Thời gian từ duyệt thanh lý tới báo giảm FAST.** Công thức: (ngày báo giảm FAST - ngày duyệt thanh lý) tính theo ngày làm việc. Nguồn: nhật ký EH-AM và FAST. Chịu trách nhiệm: Kế toán tài sản. Mục tiêu GĐ2: ≤ 3 ngày làm việc. Cách đo: từng phiếu thanh lý.

5. **Thời gian trả lời North Star Metric.** Công thức: (thời gian từ lúc quét tới hiện sáu thông tin) tính theo mili giây trên mạng 4G. Nguồn: đo tại pilot GĐ1. Chịu trách nhiệm: Nhóm kỹ thuật. Mục tiêu GĐ1 pilot: ≤ 2 giây. Cách đo: kiểm thử hiệu năng sau khi làm xong tính năng quét.

## 4. Ưu tiên tính năng (MoSCoW)

| FR | Tính năng | Must/Should/Could/Won't | Lý do |
| --- | --- | --- | --- |
| FR-01 | Asset ID duy nhất + mã QR | Must | Định danh tài sản là nền tảng; không có nó không thể tra cứu |
| FR-02 | Hồ sơ: tên, loại, serial, ảnh | Must | Dữ liệu cơ bản để xác định tài sản; phục vụ North Star |
| FR-03 | Hồ sơ: ngày mua, nhà cung cấp, hoá đơn | Must | Bắt buộc cho kế toán và xác thực nguồn gốc |
| FR-04 | Hồ sơ: nguyên giá, khấu hao, giá trị còn lại | Must | Phục vụ dashboard giám đốc và đối soát FAST ở GĐ2 |
| FR-05 | Hồ sơ: location, cost center, người quản lý | Must | Phạm vi kiểm quyền; phục vụ báo cáo theo cost center |
| FR-06 | Đính kèm chứng từ | Should | Hỗ trợ audit; chưa bắt buộc ở GĐ1 nếu không có đủ scan |
| FR-07 | Quản lý trạng thái tài sản (6 trạng thái) | Must | Theo dõi vòng đời; phục vụ quy tắc xử lý chi phí |
| FR-08 | Tổ chức kiểm kê hằng tháng | Must | Yêu cầu cốt lõi của Every Half; phục vụ đối soát |
| FR-09 | Ghi kết quả kiểm kê (có, mất, sai vị trí, hư) | Must | Định danh sự cố; phục vụ quyết định thanh lý |
| FR-10 | Ghi người quét, thời gian, ảnh, vị trí, tình trạng | Must | Bằng chứng audit; vị trí có thể chỉ cần ảnh + giờ server ở GĐ1 |
| FR-11 | Lịch sử điều chuyển tài sản | Must | Phục vụ truy vết; nền tảng cho North Star |
| FR-12 | Bên nhận xác nhận nhận hàng bằng QR | Must | Điểm xác nhận để thay đổi location; an toàn chuyển giao |
| FR-13 | Báo hỏng từ quét QR tại cửa hàng | Must | Phục vụ quy trình sửa chữa; dễ dùng nhân viên ca |
| FR-14 | Lưu lịch sử bảo trì, chi phí, đơn vị sửa chữa | Must | Dữ liệu cho quyết định thay máy hoặc kỳ vọng tuổi |
| FR-15 | Cập nhật trạng thái suốt quá trình sửa chữa | Must | Phục vụ theo dõi; phục vụ audit |
| FR-16 | Phê duyệt thanh lý, đổi trạng thái, báo giảm FAST | Must | Cấu trúc quy trình; phục vụ kế toán |
| FR-17 | Theo dõi khấu hao theo kỳ | Should | GĐ1 có từ FAST; GĐ2 tính trong EH-AM nếu FAST không có API |
| FR-18 | Liên kết Asset ID với mã FAST | Must | Tiền điều kiện để đối soát và báo giảm |
| FR-19 | Đồng bộ hai chiều: nguyên giá, khấu hao, cost center, thanh lý | Should | Chọn cách phân công: hệ nào làm chủ trường nào (xem mục 5) |
| FR-20 | Ghi nhật ký đồng bộ (Synced, Pending, Error) | Should | Hỗ trợ tàng lập xử lý lỗi; để GĐ2 |
| FR-21 | Dashboard tổng tài sản & giá trị | Must | Phục vụ giám đốc; phục vụ North Star |
| FR-22 | Dashboard tài sản theo location, roastery, kho | Must | Phục vụ quản lý; phục vụ báo cáo cost center |
| FR-23 | Dashboard khấu hao & giá trị còn lại | Should | GĐ2 khi có dữ liệu chính xác từ FAST |
| FR-24 | Dashboard tài sản mất, hỏng | Must | Phục vụ quyết định thanh lý; phục vụ điều tra mất mát |
| FR-25 | Dashboard tiến độ kiểm kê hoàn thành | Must | Theo dõi kỷ luật vận hành |
| FR-26 | Dashboard chênh lệch với FAST | Should | GĐ2 khi có đối soát |
| FR-27 | Truy vấn tài sản bằng quét QR (North Star) | Must | Phục vụ trực tiếp North Star Metric |
| FR-28 | Quản lý tài sản ở bốn loại điểm | Must | Brief yêu cầu; đảm bảo không bỏ sót |
| FR-29 | Quản lý danh mục nền (location, cost center, loại, nhà cung cấp, đơn vị sửa) | Must | Nền tảng cho dữ liệu hồ sơ; phục vụ kiểm quyền |
| FR-30 | Quản lý người dùng & vai trò theo location | Must | Phục vụ kiểm quyền; phục vụ audit |

Hạng tổng hợp: 23 Must, 5 Should, 0 Could, 2 Won't (FR-06 nếu không scan, FR-20 nếu không có API FAST).

## 5. Phạm vi MVP và phân kỳ GĐ1–GĐ3

**Kiểm lại phân kỳ ở spec §6.4.**

Spec đề xuất: GĐ1 vận hành tài sản; GĐ2 khấu hao, FAST, đối soát; GĐ3 tối ưu. Đánh giá: **Tôi đồng ý cách phân kỳ này.** Lý do:

- Tích hợp FAST phụ thuộc bản FAST (không biết có API), chính sách kế toán (chưa biết), người đầu mối (chưa rõ). Nó là rủi ro cao nhất (R-01, R-02). Tách sang GĐ2 cho phép GĐ1 xử lý rủi ro vận hành trước mà không bị khóa.

- GĐ1 giải quyết nỗi đau vận hành trước (không biết tài sản ở đâu, kiểm kê tốn công, lịch sử không rõ). Đó là yêu cầu trực tiếp từ Vận hành và quản lý cửa hàng.

- Khấu hao yêu cầu dữ liệu chuẩn từ FAST (nguyên giá, tuổi, phương pháp) nên để GĐ2 là logic. Nó không chặn vận hành.

- GĐ3 cần dữ liệu sạch từ GĐ1 + GĐ2 mới nên dự báo chính xác. Đúng mức độ chín.

**Quyết định về đăng ký tài khoản công khai.**

Comment ở RegisterDto nêu rõ: "Mở hay đóng đăng ký công khai là một quyết định sản phẩm." Tôi **đề xuất đóng đăng ký công khai** cho GĐ1 và dài hạn. Lý do:

EH-AM là hệ thống nội bộ quản lý tài sản. Người dùng chính (nhân viên ca, quản lý, kế toán) đều có tài khoản công ty; không cần đăng ký công khai. Mở đăng ký công khai tạo ba rủi ro: (1) ai có email có thể đăng ký và xem dữ liệu nhạy cảm (giá trị tài sản, location) cho tới khi quản trị phát hiện và khóa; (2) số lượng tài khoản không kiểm soát; (3) nhân viên nghỉ việc có thể vẫn giữ tài khoản khi không ai xóa.

Đánh đổi: quản trị cần tạo tài khoản trong hệ thống IT của Every Half. Lợi là an toàn và kiểm soát. Quy trình: IT hoặc Nhân sự tạo tài khoản công ty → PO gửi email mời + mật khẩu tạm → nhân viên đổi mật khẩu lần đầu → PO gán vai trò cho từng location. Điều này có thể tự động hoá bằng Single Sign-On (SSO) với hệ thống IT sau này (GĐ3), nhưng cho GĐ1 tạo tay cũng được vì số lượng nhân viên hữu hạn.

## 6. KPI theo cấp

| Cấp | KPI | Định nghĩa | Công thức | Nguồn dữ liệu | Chịu trách nhiệm | Kỳ đo |
| --- | --- | --- | --- | --- | --- | --- |
| Ban giám đốc | Tổng giá trị tài sản | Giá trị còn lại của toàn bộ tài sản hiện hoạt | SUM(giá_trị_còn_lại) WHERE trạng_thái IN ['Đang sử dụng', 'Đang sửa chữa'] | Dashboard EH-AM | Kế toán trưởng | Hằng tháng (khoá kỳ 10) |
| Ban giám đốc | Tỷ lệ mất hàng năm | Số tài sản bị ghi mất trong năm tương ứng với số tài sản cần quản lý | COUNT(trạng_thái = 'Mất') / COUNT(tài_sản_cần_quản_lý) × 100% | Kết quả kiểm kê, phê duyệt thanh lý | Vận hành tập trung | Hằng quý |
| Ban giám đốc | Chi phí sửa chữa bất thường | Tổng chi phí sửa chữa vượt ngưỡng mà hệ thống cảnh báo | SUM(chi_phí_sửa) WHERE chi_phí > ngưỡng (để xác định từ GĐ3) | Lịch sử bảo trì EH-AM | Quản lý xưởng rang | Hằng quý |
| Kế toán/Vận hành | Chênh lệch sổ EH-AM với FAST | Số tài sản không khớp giữa hai hệ sau đối soát | |COUNT(EH-AM) - COUNT(FAST tương ứng)| / COUNT(FAST) × 100% | EH-AM và FAST sau kỳ đối soát | Kế toán tài sản | Hằng tháng (sau đối soát) |
| Kế toán/Vận hành | Thời gian báo giảm FAST sau duyệt thanh lý | Độ trễ từ duyệt thanh lý tới báo giảm FAST | Ngày báo giảm - Ngày duyệt (tính ngày làm việc) | EH-AM + FAST | Kế toán tài sản | Từng phiếu (báo cáo hằng tháng) |
| Cửa hàng | Tỷ lệ hoàn thành kiểm kê đúng hạn | Tỷ lệ location đã chốt kiểm kê trước ngày hạn cuối cùng | COUNT(location chốt) / COUNT(tổng_location) × 100% | Nhật ký kiểm kê EH-AM | Quản lý cửa hàng từng location | Hằng tháng (ngay sau hạn) |
| Cửa hàng | Tỷ lệ tài sản có biên nhận | Tỷ lệ tài sản nhận hàng đã xác nhận bằng QR | COUNT(xác_nhận_nhận) / COUNT(lệnh_chuyển_tới) × 100% | Nhật ký điều chuyển EH-AM | Quản lý cửa hàng nhận hàng | Hằng tháng (tóm tắt) |
| Cửa hàng | Số lượng báo hỏng chưa sửa xong | Số báo hỏng ở trạng thái "Đang sửa chữa" vượt quá ngưỡng (cảnh báo nếu > 3 tuần chưa xong) | COUNT(trạng_thái = 'Đang sửa chữa' AND ngày_báo > hôm_nay - 21 ngày) | Lịch sử bảo trì EH-AM | Quản lý cửa hàng | Hằng tuần (báo cáo yêu cầu) |

## 7. Đo lường lợi ích

Lợi ích định lượng được cần baseline (mức hiện tại trước go-live) và mục tiêu ở cuối GĐ1 (6 tháng sau go-live).

| Lợi ích | Cách đo | Baseline cần chốt | Mục tiêu GĐ1 | Khi đo |
| --- | --- | --- | --- | --- |
| Tỷ lệ tài sản có hồ sơ và nhãn | (tài sản có hồ sơ đầy đủ + nhãn QR) / tất cả tài sản × 100% | Hiện tại bao nhiêu (A-PM-01) | ≥ 90% | Tháng 1 go-live, sau đó hằng tháng |
| Tỷ lệ hoàn thành kiểm kê đúng hạn | location chốt / location tất cả × 100% | 0% (chưa có quy trình) | ≥ 80% | Tháng 2 go-live (sau kiểm kê tháng đầu) |
| Thời gian kiểm kê một location | giờ nhân lực | Hiện tại bao lâu (A-PM-02) | Giảm 60% | Tháng 2-3 go-live |
| Chênh lệch sổ FAST | |COUNT(EH-AM) - COUNT(FAST)| / COUNT(FAST) × 100% | Bao nhiêu trước go-live (A-PM-03) | ≤ 5% | GĐ2 tháng 3 (sau đối soát) |
| Thời gian từ duyệt thanh lý tới báo giảm FAST | ngày làm việc | Hiện tại bao lâu (A-PM-04) | ≤ 3 ngày | GĐ2 hằng tháng |

Mỗi KPI baseline cần Every Half cung cấp trước kick-off hoặc trong 2 tuần đầu. Nếu không có dữ liệu chính xác, dùng ước lượng từ phỏng vấn và ghi rõ là giả định (A-PM-xx) để xác minh lại sau khi go-live.

## 8. Rủi ro giá trị và giả định

**Rủi ro giá trị.**

Rủi ro quan trọng nhất không phải là công nghệ mà là việc EH-AM làm ra mà không ai dùng hoặc dùng sai cách. Các tình huống:

1. Nhân viên ca coi kiểm kê là việc thêm và làm qua loa, dẫn tới dữ liệu không chính xác. Giải pháp: kiểm thử ở một cửa hàng pilot 2-4 tuần, đo tỷ lệ hoàn thành và mức độ sai sót, rút ra đào tạo cụ thể; nhắc nhở qua dashboard; gắn kiểm kê với công việc, không thêm.

2. Quản lý cửa hàng không tin dữ liệu vì bị bỏ sót tài sản, dẫn tới không xác nhận nhận hàng hoặc không chốt kiểm kê. Giải pháp: chiến dịch dán nhãn kỹ lưỡng trước go-live, kiểm toàn bộ danh sách hiện có, đối chiếu với sổ FAST để không bỏ sót; test với 2-3 cửa hàng trước mở rộng.

3. Kế toán không dùng đối soát EH-AM + FAST vì quy trình đối soát hiện tại đã quen, dẫn tới GĐ2 bị từ chối. Giải pháp: gặp Kế toán trưởng và Kế toán tài sản trước GĐ2 để hiểu quy trình hiện tại, thiết kế tính năng khớp chứ không thay đổi cách làm; demo đối soát tự động; liên tục hỗ trợ 3 tháng đầu GĐ2.

4. Dữ liệu hiện tại không sạch (trùng serial, thiếu nguyên giá, location sai), khiến dữ liệu ban đầu phải làm sạch lâu. Giải pháp: kiểm tra mẫu 5% danh sách hiện tại ở tuần 2 project, ước lượng công sạch dữ liệu, quyết định nâng quy mô hay lùi deadline.

**Giả định bổ sung.**

| Mã | Giả định | Ai xác nhận | Rủi ro nếu sai |
| --- | --- | --- | --- |
| A-PM-01 | Hiện tại tỷ lệ tài sản không có hồ sơ hoặc nhãn khoảng 40–60% | Kế toán trưởng, Vận hành | Baseline sai, không đo được tiến độ |
| A-PM-02 | Hiện tại kiểm kê một cửa hàng mất 4–8 giờ nhân lực | Vận hành, quản lý cửa hàng | Mục tiêu giảm 60% không thể đánh giá |
| A-PM-03 | Chênh lệch hiện tại giữa sổ FAST và thực tế khoảng 10–20% | Kế toán trưởng | Không biết GĐ2 cải thiện được bao nhiêu |
| A-PM-04 | Hiện tại từ đề nghị thanh lý tới báo giảm FAST mất 7–14 ngày | Kế toán tài sản | Mục tiêu 3 ngày có khả thi không |
| A-PM-05 | Danh sách tài sản ban đầu (Excel hoặc FAST) đầy đủ serial, ngày mua, nguyên giá ≥ 70% | Kế toán trưởng, Vận hành | Phải dành công sạch dữ liệu, lùi lịch GĐ1 |
| A-PM-06 | Mỗi location có ít nhất một điện thoại có camera + mạng 4G hoặc Wi-Fi trong giờ mở cửa | Vận hành, IT | Không thể quét tại hiện trường |
| A-PM-07 | Every Half sẽ đào tạo và khuyến khích nhân viên ca quét qua cách gắn kiểm kê với công việc hằng ngày | Ban giám đốc, Nhân sự | Nhân viên không quét, dữ liệu không chính xác |

## 9. Câu hỏi cho Every Half

| Mã | Câu hỏi | Đối tượng | Liên quan tới |
| --- | --- | --- | --- |
| Q-PM-01 | Hiện tại mỗi tháng mất hoặc hỏng bao nhiêu tài sản; giá trị trung bình; trong năm gần nhất là bao nhiêu | Ban giám đốc, Vận hành | Baseline lợi ích A-PM-01 |
| Q-PM-02 | Kiểm kê hiện tại (nếu có) mất bao lâu; ai làm; xong khi nào; dữ liệu đâu | Vận hành, quản lý cửa hàng | Baseline lợi ích A-PM-02, yêu cầu kiểm kê |
| Q-PM-03 | Dự kiến Every Half sẽ mở thêm bao nhiêu cửa hàng trong 12 tháng tới; thêm loại tài sản mới không (ví dụ máy móc sản xuất, thiết bị IT cá nhân) | Ban giám đốc, Vận hành | Phạm vi mở rộng GĐ3, quy mô dữ liệu |
| Q-PM-04 | Tại sao kiểm kê cần ảnh và tọa độ (hiện tại chưa rõ yêu cầu bên dưới); GPS trong nhà lệch hàng chục mét và là dữ liệu cá nhân, liệu ảnh + giờ server đã đủ không | Pháp chế, Vận hành | Yêu cầu phi chức năng NFR-07, thu thập dữ liệu cá nhân |
| Q-PM-05 | Quy trình thanh lý hiện tại ra sao (ai duyệt, hạn mức, hình thức, biên bản); Every Half có quy trình được Kiểm toán xác nhận không | Ban giám đốc, Kế toán trưởng | Quy tắc BR-06, tính năng FR-16 |
| Q-PM-06 | Tỷ lệ nhân viên dùng điện thoại cá nhân vs điện thoại của cửa hàng khi quét; nếu cá nhân, cách xử lý khi nhân viên nghỉ việc (thu hồi ứng dụng, tài khoản, quyền camera) | IT, Nhân sự | Quyết định kiến trúc auth, yêu cầu phi chức năng NFR-04 |

---

## Tóm tắt bốn điểm góp ý lớn

1. **Phân kỳ GĐ1/GĐ2 giảm rủi ro tích hợp FAST.** Kết quả khai thác xác định tích hợp FAST là rủi ro cao nhất vì phụ thuộc bản FAST, chính sách kế toán, và người đầu mối. Tách sang GĐ2 cho phép GĐ1 giải quyết nỗi đau vận hành trước mà không bị khóa bởi tích hợp. GĐ2 có thể chạy song song hoặc sau GĐ1 tùy tình hình FAST trong tuần 2.

2. **Đóng đăng ký công khai vì EH-AM là hệ thống nội bộ.** Dữ liệu nhạy cảm (giá trị tài sản, location) và người dùng chính (nhân viên công ty) nên an toàn hơn khi quản trị tạo tài khoản. Quy trình: IT tạo → PO mời → nhân viên đổi mật khẩu → PO gán vai trò. Có thể tự động hoá bằng SSO sau này (GĐ3).

3. **Baseline lợi ích cần Every Half xác nhận trước GĐ1.** Bốn con số (A-PM-01, A-PM-02, A-PM-03, A-PM-04) là điều kiện để đo được cải thiện. Yêu cầu Kế toán trưởng, Vận hành cung cấp trước kick-off hoặc tuần 1-2 project.

4. **Dữ liệu ban đầu phải sạch trước go-live.** Giả định A-PM-05 là yếu tố chính ảnh hưởng lịch. Nếu danh sách hiện tại có > 30% bản ghi thiếu serial hoặc nguyên giá, phải dành công sạch dữ liệu, có thể lùi go-live.
