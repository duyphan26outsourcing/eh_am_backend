# Quy tắc nghiệp vụ

Sinh tự động từ §14 của Master Blueprint (bảng quy tắc chung và bảng quy tắc của từng module), giữ nguyên văn. Không sửa tay phần bảng chính; muốn đổi quy tắc thì sửa blueprint rồi sinh lại. BR-DEP và BR-FST thuộc GĐ2, ghi ở đây để UC của GĐ1 tham chiếu khi cần.

| Mã | Quy tắc | Module | Nguồn |
| --- | --- | --- | --- |
| BR-CMN-01 | Không xoá dữ liệu nghiệp vụ. "Xoá" trên giao diện là đổi trạng thái kèm lý do | Chung | [Brief] B-16, B-37 |
| BR-CMN-02 | Mọi thay đổi dữ liệu nghiệp vụ và phân quyền ghi một dòng nhật ký: người làm, thời điểm theo giờ máy chủ, đối tượng, giá trị trước và sau, lý do | Chung | [Brief] B-38 |
| BR-CMN-03 | Mọi thao tác và mọi danh sách được kiểm quyền theo vai trò và phạm vi location ở máy chủ. Người không có vai trò trên một location thì không thấy dữ liệu của location đó | Chung | [Brief] B-39 |
| BR-CMN-04 | Location của một thao tác lấy từ tài nguyên đang thao tác (tài sản, phiếu), không lấy từ thông tin điện thoại gửi lên | Chung | [Đề xuất] |
| BR-CMN-05 | Thời điểm ghi nhận theo giờ máy chủ. Kỳ (tháng kiểm kê, kỳ khấu hao) tính theo giờ Việt Nam | Chung | [Đề xuất] |
| BR-CMN-06 | Nguyên giá và giá trị còn lại chỉ hiện với Ban giám đốc, Kế toán trưởng, Kế toán tài sản, Quản lý tài sản, Kiểm soát nội bộ; vai trò khác thấy hồ sơ không kèm giá trị (Q-16) | Chung | [Đề xuất] |
| BR-CMN-07 | Mỗi phiếu (kiểm kê, điều chuyển, sửa chữa, thanh lý) có mã riêng và trạng thái theo bảng chuyển trạng thái; trạng thái không sửa được ngoài luồng | Chung | [Đề xuất] |
| BR-CMN-08 | Người đề nghị không tự duyệt đề nghị của chính mình | Chung | [Đề xuất] |
| BR-CMN-09 | Lượt gửi từ điện thoại có mã chống trùng; gửi lại cùng một lượt không tạo bản ghi thứ hai | Chung | [Đề xuất] |
| BR-CMN-10 | Thao tác cần lý do dùng danh mục lý do chuẩn, kèm ô ghi thêm khi chọn "Khác" | Chung | [Đề xuất] |
| BR-IAM-01 | Mỗi người một tài khoản; không dùng chung tài khoản giữa nhân viên (A-09) | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-02 | Tài khoản mới chưa có vai trò nào; chưa được gán vai trò thì không thấy dữ liệu của location nào | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-03 | Dòng phân quyền chỉ được đóng hiệu lực, không sửa và không xoá; việc thu hồi ghi người thu hồi và lý do | M01: Người dùng và phân quyền | [Brief] B-37 |
| BR-IAM-04 | Tài khoản bị khoá hoặc ngừng mất quyền ngay ở thao tác kế tiếp, kể cả khi phiên đăng nhập chưa hết hạn | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-05 | Vai trò Quản trị hệ thống chỉ được cấp qua script khởi tạo có người chịu trách nhiệm, không cấp qua màn hình | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-06 | Mật khẩu dài ít nhất 8 ký tự, có chữ, số và ký tự đặc biệt | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-07 | Đăng nhập sai nhiều lần bị giới hạn tần suất; thông báo lỗi và thông báo gửi email không cho biết email có tồn tại hay không | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-08 | Vai trò theo location chỉ gán được trên location đang hoạt động; người được gán vai trò Quản lý điểm trên nhiều location thấy dữ liệu của tất cả các location đó | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-MDM-01 | Mã location, mã cost center, mã loại tài sản là duy nhất và không dùng lại sau khi ngừng | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-02 | Danh mục chỉ ngừng hoạt động, không xoá; mục đã ngừng vẫn hiện đúng tên trong lịch sử cũ | M02: Danh mục nền | [Brief] B-37 |
| BR-MDM-03 | Location chỉ đóng được khi không còn tài sản ở trạng thái đang ghi tại đó và không còn phiếu kiểm kê, điều chuyển, sửa chữa đang mở | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-04 | Mỗi location có đúng một cost center mặc định; tài sản chuyển tới location nhận cost center của location đó, trừ khi tài sản có cost center riêng do Kế toán tài sản đặt (A-08) | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-05 | Tài sản đang ở location bên ngoài không thuộc đợt kiểm kê của điểm nào; người chịu trách nhiệm trong thời gian đó là Quản lý tài sản | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-06 | Loại tài sản đã có tài sản gắn vào thì không đổi được cờ TSCĐ hoặc CCDC; muốn đổi thì tạo loại mới và chuyển từng tài sản có lý do | M02: Danh mục nền | [Đề xuất] |
| BR-AST-01 | Asset ID do hệ thống cấp, duy nhất, không đổi và không dùng lại, kể cả sau khi tài sản thanh lý | M03: Hồ sơ tài sản và CCDC | [Brief] B-03 |
| BR-AST-02 | Trường bắt buộc khi tạo: tên, loại, location, người chịu trách nhiệm, trạng thái ban đầu (Lưu kho hoặc Đang sử dụng); serial bắt buộc với loại có cờ "bắt buộc serial" | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-03 | Serial không được trùng trong cùng một loại tài sản | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-04 | Location của tài sản chỉ đổi qua điều chuyển có xác nhận nhận hàng; màn hình sửa hồ sơ không có trường location | M03: Hồ sơ tài sản và CCDC | [Brief] B-14, B-15 |
| BR-AST-05 | Thông tin tài chính chỉ Kế toán tài sản sửa, bắt buộc lý do; mỗi lần sửa lưu giá trị trước và sau | M03: Hồ sơ tài sản và CCDC | [Brief] B-06, B-38 |
| BR-AST-06 | Trạng thái chỉ đổi theo bảng chuyển trạng thái dưới đây; đổi tay chỉ có một trường hợp là huỷ hồ sơ tạo sai, cần Quản lý tài sản duyệt (Q-10) | M03: Hồ sơ tài sản và CCDC | [Brief] B-09 |
| BR-AST-07 | Tài sản ở trạng thái kết thúc (Đã thanh lý, Mất, Hủy) chỉ được xem; ngoại lệ duy nhất là luồng tìm thấy lại tài sản đã mất ở M08 | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-08 | Nhập từ file: dòng lỗi không được nhập; các dòng hợp lệ được nhập, báo cáo liệt kê từng dòng bị bỏ và lý do | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-09 | Người chịu trách nhiệm phải có vai trò trên location của tài sản | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-10 | Tình trạng vật lý (Tốt, Hư hỏng nhẹ, Hư hỏng) tách khỏi trạng thái vòng đời; kiểm kê và sửa chữa cập nhật tình trạng mà không đổi trạng thái (D-06) | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-QR-01 | Nội dung QR chỉ là đường dẫn tra cứu chứa Asset ID; không chứa tên, giá trị hay dữ liệu cá nhân | M04: QR và nhãn | [Đề xuất] |
| BR-QR-02 | Quét chỉ trả thông tin khi người quét đã đăng nhập; thông tin trả về theo vai trò và phạm vi location | M04: QR và nhãn | [Brief] B-39, B-40 |
| BR-QR-03 | Quét tài sản của location khác chỉ hiện thông tin nhận diện: Asset ID, tên, loại, location đang ghi; đủ để ghi kết quả "sai vị trí" khi kiểm kê | M04: QR và nhãn | [Đề xuất] |
| BR-QR-04 | In lại nhãn không tạo Asset ID mới; mỗi lần in lại ghi người in và lý do | M04: QR và nhãn | [Đề xuất] |
| BR-QR-05 | Mã QR không thuộc hệ thống, hoặc thuộc tài sản đã thanh lý, mất, huỷ, được báo rõ cho người quét và ghi vào nhật ký | M04: QR và nhãn | [Đề xuất] |
| BR-QR-06 | Khổ nhãn và chất liệu nhãn theo khu vực dùng (quầy bar cần nhãn chịu nhiệt và ẩm) do Vận hành chốt (Q-22) | M04: QR và nhãn | [Đề xuất] |
| BR-STK-01 | Mỗi location có một đợt kiểm kê mỗi tháng (A-05, Q-12) | M05: Kiểm kê | [Brief] B-11 |
| BR-STK-02 | Danh sách dự kiến của điểm được chốt lúc mở đợt: tài sản đang ghi ở location đó, trừ tài sản đang vận chuyển, đang ở location bên ngoài, hoặc ở trạng thái kết thúc | M05: Kiểm kê | [Đề xuất] |
| BR-STK-03 | Mỗi tài sản trong một đợt có đúng một kết quả; quét lại thì kết quả sau thay kết quả trước, cả hai lượt quét đều được lưu | M05: Kiểm kê | [Đề xuất] |
| BR-STK-04 | Kết quả "có mặt" và "hư hỏng" cần ảnh chụp bằng camera ngay lúc quét (Q-31) | M05: Kiểm kê | [Brief] B-13 |
| BR-STK-05 | Toạ độ chỉ ghi khi Every Half bật tính năng và người dùng cho phép; thiếu toạ độ không chặn việc kiểm kê (Q-20) | M05: Kiểm kê | [Brief] B-13 |
| BR-STK-06 | Kết quả của điểm do Quản lý điểm duyệt; nếu Quản lý điểm cũng là người kiểm thì Quản lý tài sản duyệt | M05: Kiểm kê | [Đề xuất] |
| BR-STK-07 | Tài sản "Nghi mất" phải có kết luận (tìm thấy hoặc đề nghị xác nhận mất) trong thời hạn Every Half đặt (Q-13) | M05: Kiểm kê | [Đề xuất] |
| BR-STK-08 | Đợt đã duyệt thì khoá kết quả; phát hiện sai sau đó xử lý bằng thao tác mới có lý do, không sửa kết quả cũ | M05: Kiểm kê | [Brief] B-37 |
| BR-TRF-01 | Tài sản chỉ đổi location qua phiếu điều chuyển | M06: Điều chuyển | [Brief] B-14 |
| BR-TRF-02 | Location và cost center đổi tại thời điểm bên nhận xác nhận, không đổi lúc tạo phiếu hay lúc xuất | M06: Điều chuyển | [Brief] B-15 |
| BR-TRF-03 | Phiếu điều chuyển thường chỉ nhận tài sản đang ở trạng thái Lưu kho hoặc Đang sử dụng; tài sản đang sửa chỉ đi theo phiếu gửi sửa hoặc nhận về từ sửa do M07 tạo | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-04 | Một tài sản chỉ nằm trong một phiếu điều chuyển đang mở tại một thời điểm | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-05 | Người xác nhận nhận hàng phải có vai trò trên location nhận; với đơn vị sửa chữa, Quản lý tài sản xác nhận thay | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-06 | Phiếu và lịch sử điều chuyển không xoá được; huỷ chỉ áp cho phiếu chưa xuất | M06: Điều chuyển | [Brief] B-16 |
| BR-TRF-07 | Tài sản đang vận chuyển quá số ngày Every Half đặt thì cảnh báo Quản lý tài sản (Q-11) | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-08 | Gửi đi sửa và nhận về từ sửa dùng cùng luồng phiếu điều chuyển, tạo từ phiếu sửa chữa (D-02) | M06: Điều chuyển | [Brief] B-14 |
| BR-MNT-01 | Mỗi yêu cầu sửa gắn với đúng một tài sản | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-02 | Một tài sản chỉ có một phiếu sửa đang mở; báo hỏng thêm khi đã có phiếu mở thì bổ sung vào phiếu đó | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-03 | Tài sản chuyển "Đang sửa chữa" khi yêu cầu được tiếp nhận, không phải lúc mới báo hỏng | M07: Báo hỏng, sửa chữa và bảo trì | [Brief] B-19 |
| BR-MNT-04 | Chi phí sửa ghi theo từng lần sửa, kèm đơn vị sửa và chứng từ; báo giá vượt ngưỡng Every Half đặt cần duyệt trước khi sửa (Q-37) | M07: Báo hỏng, sửa chữa và bảo trì | [Brief] B-18 |
| BR-MNT-05 | Tài sản chỉ rời trạng thái "Đang sửa chữa" khi phiếu sửa được nghiệm thu hoặc chuyển sang đề nghị thanh lý | M07: Báo hỏng, sửa chữa và bảo trì | [Brief] B-19 |
| BR-MNT-06 | Chi phí sửa được ghi nhận là chi phí trong kỳ hay làm tăng nguyên giá do Kế toán trưởng quyết định; EH-AM chỉ lưu số tiền và phân loại được chọn | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-07 | Người báo hỏng nhận thông báo khi yêu cầu được tiếp nhận, bị từ chối và khi nghiệm thu xong | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-DSP-01 | Tài sản chỉ chuyển "Đã thanh lý" khi đề nghị đã được duyệt và việc thanh lý đã thực hiện, có biên bản | M08: Thanh lý và báo giảm | [Brief] B-20 |
| BR-DSP-02 | Người đề nghị không duyệt đề nghị của chính mình (BR-CMN-08) | M08: Thanh lý và báo giảm | [Đề xuất] |
| BR-DSP-03 | Cấp duyệt theo hạn mức nguyên giá do Every Half đặt (Q-08) | M08: Thanh lý và báo giảm | [Đề xuất] |
| BR-DSP-04 | Tài sản đang trong phiếu điều chuyển hoặc phiếu sửa đang mở không được đề nghị thanh lý, trừ đề nghị lập từ chính phiếu sửa đó | M08: Thanh lý và báo giảm | [Đề xuất] |
| BR-DSP-05 | "Mất" chỉ ghi khi có kết quả xác minh và có người duyệt; kiểm kê không tìm thấy chỉ tạo trạng thái "Nghi mất" (D-07) | M08: Thanh lý và báo giảm | [Brief] B-12 |
| BR-DSP-06 | Đề nghị đã duyệt mà chưa thực hiện quá số ngày Every Half đặt thì cảnh báo Quản lý tài sản | M08: Thanh lý và báo giảm | [Đề xuất] |
| BR-DSP-07 | Ở GĐ2, mỗi lần thực hiện thanh lý hoặc xác nhận mất tạo đúng một yêu cầu báo giảm sang FAST; trạng thái theo nhật ký đồng bộ của M10 | M08: Thanh lý và báo giảm | [Brief] B-20, B-30 |
| BR-DEP-01 | Khấu hao theo chính sách do Kế toán trưởng duyệt; căn cứ đề xuất là Thông tư 45/2013/TT-BTC về quản lý, sử dụng và trích khấu hao tài sản cố định và các văn bản sửa đổi, cần Kế toán trưởng xác nhận văn bản còn hiệu lực và đúng với doanh nghiệp | M09: Khấu hao và phân bổ | [Brief] B-25 |
| BR-DEP-02 | Chỉ một hệ tính khấu hao chính thức (D-03) | M09: Khấu hao và phân bổ | [Đề xuất] |
| BR-DEP-03 | Tài sản đã thanh lý, mất hoặc huỷ thôi trích khấu hao; cách tính cho kỳ có thay đổi trạng thái do Kế toán trưởng chốt | M09: Khấu hao và phân bổ | [Đề xuất] |
| BR-DEP-04 | Số tiền lưu dạng số thập phân chính xác và được cộng dồn trong cơ sở dữ liệu | M09: Khấu hao và phân bổ | [Đề xuất] |
| BR-FST-01 | Mỗi trường có một hệ làm chủ theo ma trận; hệ không làm chủ không ghi đè (D-05) | M10: Tích hợp FAST | [Brief] B-29 |
| BR-FST-02 | Yêu cầu đồng bộ đi qua hàng đợi có trạng thái Pending, Synced, Error; thao tác của người dùng không chờ FAST trả lời | M10: Tích hợp FAST | [Brief] B-30 |
| BR-FST-03 | Gửi lại một yêu cầu không tạo ghi nhận trùng bên FAST | M10: Tích hợp FAST | [Đề xuất] |
| BR-FST-04 | Yêu cầu lỗi nằm trong nhật ký cho tới khi được xử lý, không tự xoá | M10: Tích hợp FAST | [Đề xuất] |
| BR-FST-05 | Chỉ Kế toán tài sản sửa liên kết mã, bắt buộc lý do | M10: Tích hợp FAST | [Đề xuất] |
| BR-DSH-01 | Số liệu dashboard áp cùng phạm vi location với danh sách tài sản (BR-CMN-03) | M11: Dashboard và báo cáo | [Brief] B-39 |
| BR-DSH-02 | Chỉ số về giá trị chỉ hiện với vai trò được xem giá trị (BR-CMN-06) | M11: Dashboard và báo cáo | [Đề xuất] |
| BR-DSH-03 | Mỗi chỉ số ghi thời điểm cập nhật và có định nghĩa khi rê chuột hoặc chạm vào | M11: Dashboard và báo cáo | [Đề xuất] |
| BR-DSH-04 | File xuất chỉ chứa cột người xuất được xem; mỗi lần xuất ghi nhật ký | M11: Dashboard và báo cáo | [Đề xuất] |
| BR-AUD-01 | Nhật ký chỉ ghi thêm; không ai sửa hay xoá được, kể cả Quản trị hệ thống | M12: Nhật ký, lịch sử và thông báo | [Brief] B-37 |
| BR-AUD-02 | Nhật ký không chứa mật khẩu, token, đường dẫn tệp có thời hạn hay toạ độ chi tiết | M12: Nhật ký, lịch sử và thông báo | [Đề xuất] |
| BR-AUD-03 | Lý do do người dùng nhập; hệ thống không tự điền lý do thay người dùng | M12: Nhật ký, lịch sử và thông báo | [Brief] B-38 |
| BR-AUD-04 | Thao tác thay đổi dữ liệu nghiệp vụ không hoàn tất nếu không ghi được nhật ký | M12: Nhật ký, lịch sử và thông báo | [Đề xuất], đã có trong code |
| BR-AUD-05 | Thông báo không chứa giá trị tài sản hay dữ liệu cá nhân, chỉ chứa mã việc và đường dẫn tới việc | M12: Nhật ký, lịch sử và thông báo | [Đề xuất] |
| BR-AUD-06 | Kiểm soát nội bộ chỉ xem, không thực hiện thao tác nghiệp vụ | M12: Nhật ký, lịch sử và thông báo | [Đề xuất] |
