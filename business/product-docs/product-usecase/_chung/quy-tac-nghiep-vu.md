# Quy tắc nghiệp vụ

Sinh tự động từ §14 của Master Blueprint (bảng quy tắc chung và bảng quy tắc của từng module), giữ nguyên văn. Không sửa tay phần bảng chính; muốn đổi quy tắc thì sửa blueprint rồi sinh lại. BR-DEP và BR-FST thuộc GĐ2, ghi ở đây để UC của GĐ1 tham chiếu khi cần.

| Mã | Quy tắc | Module | Nguồn |
| --- | --- | --- | --- |
| BR-CMN-01 | Không xoá dữ liệu nghiệp vụ. "Xoá" trên giao diện là đổi trạng thái kèm lý do | Chung | [Brief] B-16, B-37 |
| BR-CMN-02 | Mọi thay đổi dữ liệu nghiệp vụ và phân quyền ghi một dòng nhật ký: người làm, thời điểm theo giờ máy chủ, đối tượng, giá trị trước và sau, lý do | Chung | [Brief] B-38 |
| BR-CMN-03 | Mọi thao tác và mọi danh sách được kiểm quyền theo vai trò và phạm vi location ở máy chủ. Người không có vai trò trên một location thì không thấy dữ liệu của location đó | Chung | [Brief] B-39 |
| BR-CMN-04 | Location của một thao tác lấy từ tài nguyên đang thao tác (tài sản, phiếu), không lấy từ thông tin điện thoại gửi lên | Chung | [Đề xuất] |
| BR-CMN-05 | Thời điểm ghi nhận theo giờ máy chủ. Lượt quét gửi lại từ hàng đợi trên máy lưu thêm giờ quét theo đồng hồ máy, đánh dấu chưa xác thực. Kỳ (tháng kiểm kê, kỳ khấu hao) tính theo giờ Việt Nam | Chung | [Đề xuất] |
| BR-CMN-06 | Thông tin tài chính (nguyên giá, giá trị còn lại từ GĐ2, hoá đơn và PO, chi phí sửa, tiền thu thanh lý) chỉ hiện với Ban giám đốc, Kế toán trưởng, Kế toán tài sản, Quản lý tài sản, Kiểm soát nội bộ; vai trò khác thấy hồ sơ không kèm giá trị (Q-16) | Chung | [Đề xuất] |
| BR-CMN-07 | Mỗi phiếu (kiểm kê, điều chuyển, sửa chữa, thanh lý) có mã riêng và trạng thái theo bảng chuyển trạng thái; trạng thái không sửa được ngoài luồng | Chung | [Đề xuất] |
| BR-CMN-08 | Người đề nghị không tự duyệt đề nghị của chính mình | Chung | [Đề xuất] |
| BR-CMN-09 | Lượt gửi từ điện thoại có mã chống trùng; gửi lại cùng một lượt không tạo bản ghi thứ hai | Chung | [Đề xuất] |
| BR-CMN-10 | Thao tác cần lý do dùng danh mục lý do chuẩn, kèm ô ghi thêm khi chọn "Khác" | Chung | [Đề xuất] |
| BR-IAM-01 | Mỗi người một tài khoản; không dùng chung tài khoản giữa nhân viên (A-09) | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-02 | Tài khoản mới chỉ có vai trò ban đầu được chọn ở wizard; không có vai trò thì không thấy dữ liệu của location nào | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-03 | Dòng phân quyền chỉ được đóng hiệu lực, không sửa và không xoá; việc thu hồi ghi người thu hồi và lý do | M01: Người dùng và phân quyền | [Brief] B-37 |
| BR-IAM-04 | Tài khoản bị khoá hoặc ngừng mất quyền ngay ở thao tác kế tiếp, kể cả khi phiên đăng nhập chưa hết hạn; các phiên đang mở bị thu hồi | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code một phần |
| BR-IAM-05 | Vai trò Quản trị hệ thống chỉ được cấp qua script khởi tạo có người chịu trách nhiệm, không cấp qua màn hình | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-06 | Mật khẩu dài 8 đến 72 ký tự, có chữ, số và ký tự đặc biệt | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-07 | Đăng nhập sai nhiều lần bị giới hạn tần suất; thông báo lỗi và thông báo gửi email không cho biết email có tồn tại hay không | M01: Người dùng và phân quyền | [Đề xuất], đã có trong code |
| BR-IAM-08 | Vai trò theo location và location làm việc chính chỉ chọn được location đang hoạt động; người có vai trò Quản lý điểm trên nhiều location thấy dữ liệu của tất cả các location đó | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-09 | Tạo nhân viên là một lệnh: hồ sơ, tài khoản, vai trò ban đầu và dòng nhật ký cùng thành công hoặc cùng không có; lỗi giữa chừng thì hệ thống xoá phần đã tạo ở dịch vụ xác thực. Máy chủ kiểm riêng quyền tạo nhân viên và quyền gán từng vai trò | M01: Người dùng và phân quyền | [Đề xuất], bài học từ FDI Today |
| BR-IAM-10 | Email đã có trong hệ thống thì không tạo được nhân viên mới và không ghi đè hồ sơ có sẵn | M01: Người dùng và phân quyền | [Đề xuất], bài học từ FDI Today |
| BR-IAM-11 | Mã nhân viên nếu có thì duy nhất sau khi chuẩn hoá in hoa và bỏ khoảng trắng hai đầu | M01: Người dùng và phân quyền | [Đề xuất], đã có trong migration 01 |
| BR-IAM-12 | Cấp trên trực tiếp phải là nhân viên đang hoạt động, khác chính người đó và không tạo vòng trên sơ đồ | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-13 | Sơ đồ tổ chức, chức danh, phòng ban và location làm việc chính không cấp quyền; quyền chỉ đến từ vai trò trên phạm vi (BR-CMN-03) | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-14 | Lời mời kích hoạt dùng một lần và có thời hạn (Q-40); gửi lại thì lời mời cũ mất hiệu lực. Tài khoản dùng mật khẩu tạm phải đổi mật khẩu ở lần đăng nhập đầu trước khi làm việc khác | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-15 | Cho nghỉ việc đóng hiệu lực mọi vai trò đang mở trong cùng thao tác, dùng chung lý do Quản trị hệ thống nhập; tài sản người đó chịu trách nhiệm phải có người nhận mới (BR-AST-09); chặn hay chỉ cảnh báo khi còn tài sản chờ Q-41 | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-IAM-16 | Không ai tự khoá hay tự cho mình nghỉ việc; không khoá hoặc ngừng tài khoản Quản trị hệ thống cuối cùng đang hoạt động | M01: Người dùng và phân quyền | [Đề xuất], bài học từ FDI Today |
| BR-IAM-17 | Sửa hồ sơ nhân viên dùng khoá lạc quan: người sửa sau trên bản cũ phải tải lại hồ sơ; nhật ký chỉ ghi các trường đổi, trước và sau | M01: Người dùng và phân quyền | [Đề xuất] |
| BR-MDM-01 | Mã location, mã cost center, mã loại tài sản là duy nhất và không dùng lại sau khi ngừng | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-02 | Danh mục chỉ ngừng hoạt động, không xoá; mục đã ngừng vẫn hiện đúng tên trong lịch sử cũ | M02: Danh mục nền | [Brief] B-37 |
| BR-MDM-03 | Location chỉ đóng được khi không còn tài sản chưa ở trạng thái kết thúc (kể cả Nghi mất) ghi tại đó và không còn phiếu kiểm kê, điều chuyển, sửa chữa đang mở | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-04 | Mỗi location có đúng một cost center mặc định; tài sản chuyển tới location nhận cost center của location đó, trừ khi tài sản có cost center riêng do Kế toán tài sản đặt (A-08) | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-05 | Tài sản đang ở location bên ngoài không thuộc đợt kiểm kê của điểm nào; người chịu trách nhiệm trong thời gian đó là Quản lý tài sản | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-06 | Loại tài sản đã có tài sản gắn vào thì không đổi được cờ TSCĐ hoặc CCDC; muốn đổi thì tạo loại mới và chuyển từng tài sản có lý do | M02: Danh mục nền | [Đề xuất] |
| BR-MDM-07 | Phòng ban còn nhân viên đang hoạt động thì không ngừng được; trưởng phòng phải là nhân viên đang hoạt động | M02: Danh mục nền | [Đề xuất] |
| BR-AST-01 | Asset ID do hệ thống cấp, duy nhất, không đổi và không dùng lại, kể cả sau khi tài sản thanh lý | M03: Hồ sơ tài sản và CCDC | [Brief] B-03 |
| BR-AST-02 | Trường bắt buộc khi tạo: tên, loại, location, người chịu trách nhiệm, trạng thái ban đầu (Lưu kho hoặc Đang sử dụng); serial bắt buộc với loại có cờ "bắt buộc serial" | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-03 | Serial không được trùng trong cùng một loại tài sản; hồ sơ Hủy không tính | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-04 | Location của tài sản chỉ đổi qua điều chuyển có xác nhận nhận hàng; màn hình sửa hồ sơ không có trường location | M03: Hồ sơ tài sản và CCDC | [Brief] B-14, B-15 |
| BR-AST-05 | Thông tin tài chính chỉ Kế toán tài sản sửa, bắt buộc lý do; mỗi lần sửa lưu giá trị trước và sau | M03: Hồ sơ tài sản và CCDC | [Brief] B-06, B-38 |
| BR-AST-06 | Trạng thái chỉ đổi theo bảng chuyển trạng thái dưới đây; đổi tay chỉ có hai trường hợp: đưa vào hoặc ngừng sử dụng (F-AST-11), và huỷ hồ sơ tạo sai, cần một Quản lý tài sản khác người đề nghị duyệt (Q-10, BR-CMN-08) | M03: Hồ sơ tài sản và CCDC | [Brief] B-09 |
| BR-AST-07 | Tài sản ở trạng thái kết thúc (Đã thanh lý, Mất, Hủy) chỉ được xem; ngoại lệ duy nhất là luồng tìm thấy lại tài sản đã mất ở M08 | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-08 | Nhập từ file: dòng lỗi không được nhập; các dòng hợp lệ được nhập, báo cáo liệt kê từng dòng bị bỏ và lý do | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-09 | Người chịu trách nhiệm phải có vai trò trên location của tài sản; tài sản ở location bên ngoài do Quản lý tài sản chịu trách nhiệm (BR-MDM-05) | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-10 | Tình trạng vật lý (Tốt, Hư hỏng nhẹ, Hư hỏng) tách khỏi trạng thái vòng đời; tình trạng đổi khi người chịu trách nhiệm quan sát và ghi nhận: kiểm kê, nhận hàng điều chuyển, tiếp nhận sửa, nghiệm thu; báo hỏng một mình không đổi tình trạng; các lần đổi này không đổi trạng thái (D-06) | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-AST-11 | CCDC chỉ bắt buộc lập hồ sơ từng chiếc khi đạt ngưỡng giá trị hoặc thuộc loại Every Half chọn (Q-03); CCDC dưới ngưỡng không có hồ sơ ở GĐ1 | M03: Hồ sơ tài sản và CCDC | [Brief] B-01 |
| BR-AST-12 | Nhập thông tin tài chính lần đầu không cần duyệt; điều chỉnh giá trị đã nhập cần Kế toán trưởng duyệt trước khi có hiệu lực, người điều chỉnh không tự duyệt | M03: Hồ sơ tài sản và CCDC | [Đề xuất] |
| BR-QR-01 | Nội dung QR chỉ là đường dẫn tra cứu chứa Asset ID; không chứa tên, giá trị hay dữ liệu cá nhân | M04: QR và nhãn | [Đề xuất] |
| BR-QR-02 | Quét chỉ trả thông tin khi người quét đã đăng nhập; thông tin trả về theo vai trò và phạm vi location | M04: QR và nhãn | [Brief] B-39, B-40 |
| BR-QR-03 | Quét tài sản của location khác chỉ hiện thông tin nhận diện: Asset ID, tên, loại, location đang ghi; đủ để ghi kết quả "sai vị trí" khi kiểm kê | M04: QR và nhãn | [Đề xuất] |
| BR-QR-04 | In lại nhãn không tạo Asset ID mới; mỗi lần in lại ghi người in và lý do | M04: QR và nhãn | [Đề xuất] |
| BR-QR-05 | Mã QR không thuộc hệ thống, hoặc thuộc tài sản đã thanh lý, mất, huỷ, được báo rõ cho người quét và ghi vào nhật ký | M04: QR và nhãn | [Đề xuất] |
| BR-QR-06 | Khổ nhãn và chất liệu nhãn theo khu vực dùng (quầy bar cần nhãn chịu nhiệt và ẩm) do Vận hành chốt (Q-22) | M04: QR và nhãn | [Đề xuất] |
| BR-STK-01 | Mỗi location có một đợt kiểm kê mỗi tháng (A-05, Q-12) | M05: Kiểm kê | [Brief] B-11 |
| BR-STK-02 | Danh sách dự kiến của điểm được chốt lúc mở đợt: tài sản đang ghi ở location đó ở trạng thái Lưu kho, Đang sử dụng, Chờ điều chuyển, Chờ thanh lý, Nghi mất, hoặc Đang sửa chữa tại chỗ; không gồm tài sản đang vận chuyển, đang ở location bên ngoài, hoặc ở trạng thái kết thúc. Tài sản tới điểm giữa đợt được ghi là tài sản lạ | M05: Kiểm kê | [Đề xuất] |
| BR-STK-03 | Mỗi tài sản trong một đợt có đúng một kết quả; quét lại thì kết quả sau thay kết quả trước, cả hai lượt quét đều được lưu | M05: Kiểm kê | [Đề xuất] |
| BR-STK-04 | Kết quả "có mặt" và "hư hỏng" cần ảnh chụp bằng camera ngay lúc quét (Q-31) | M05: Kiểm kê | [Brief] B-13 |
| BR-STK-05 | Toạ độ chỉ ghi khi Every Half bật tính năng và người dùng cho phép; thiếu toạ độ không chặn việc kiểm kê (Q-20) | M05: Kiểm kê | [Brief] B-13 |
| BR-STK-06 | Kết quả của điểm do Quản lý điểm duyệt; nếu Quản lý điểm cũng là người kiểm thì Quản lý tài sản duyệt | M05: Kiểm kê | [Đề xuất] |
| BR-STK-07 | Tài sản "Nghi mất" phải có kết luận (tìm thấy hoặc đề nghị xác nhận mất) trong thời hạn Every Half đặt (Q-13) | M05: Kiểm kê | [Đề xuất] |
| BR-STK-08 | Đợt đã duyệt thì khoá kết quả; phát hiện sai sau đó xử lý bằng thao tác mới có lý do, không sửa kết quả cũ | M05: Kiểm kê | [Brief] B-37 |
| BR-STK-09 | Khi duyệt một điểm, tài sản không tìm thấy ở điểm đó mà cùng đợt đã được điểm khác ghi sai vị trí thì thành chênh lệch sai vị trí, không chuyển Nghi mất | M05: Kiểm kê | [Đề xuất] |
| BR-STK-10 | Lượt quét từ hàng đợi trên máy tới sau khi điểm đã chốt thì bị từ chối kèm mã lỗi; app báo người quét để Quản lý điểm yêu cầu kiểm lại nếu cần | M05: Kiểm kê | [Đề xuất] |
| BR-STK-11 | Lượt nhập Asset ID bằng tay được đánh dấu riêng và vẫn cần ảnh như lượt quét (BR-STK-04); báo cáo kiểm kê có tỷ lệ nhập tay theo điểm | M05: Kiểm kê | [Đề xuất] |
| BR-STK-19 | Tài sản không tìm thấy khi duyệt mà đang Chờ điều chuyển, Chờ thanh lý hoặc Đang sửa chữa tại chỗ vẫn chuyển Nghi mất; tài sản được bỏ khỏi phiếu điều chuyển chưa xuất, đề nghị thanh lý chưa thực hiện bị huỷ, phiếu sửa giữ nguyên kèm ghi chú; mỗi việc có dòng nhật ký | M05: Kiểm kê | [Đề xuất], từ bộ UC |
| BR-TRF-01 | Tài sản chỉ đổi location qua phiếu điều chuyển | M06: Điều chuyển | [Brief] B-14 |
| BR-TRF-02 | Location và cost center đổi tại thời điểm bên nhận xác nhận, không đổi lúc tạo phiếu hay lúc xuất. Tài sản có cost center riêng do Kế toán tài sản đặt thì giữ cost center đó (BR-MDM-04); điểm nhận là location bên ngoài thì cost center giữ nguyên; mỗi lần cost center đổi, Kế toán tài sản nhận thông báo | M06: Điều chuyển | [Brief] B-15 |
| BR-TRF-03 | Phiếu điều chuyển do người dùng tạo chỉ nhận tài sản Lưu kho hoặc Đang sử dụng. Ngoại lệ duy nhất là phiếu gửi sửa và nhận về do M07 tạo: tài sản giữ trạng thái Đang sửa chữa suốt hai chiều, chỉ location đổi khi bên nhận xác nhận | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-04 | Một tài sản chỉ nằm trong một phiếu điều chuyển đang mở tại một thời điểm, tính cả phiếu Nháp | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-05 | Người xác nhận nhận hàng phải có vai trò trên location nhận; với đơn vị sửa chữa, Quản lý tài sản xác nhận thay | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-06 | Phiếu và lịch sử điều chuyển không xoá được; huỷ chỉ áp cho phiếu chưa xuất | M06: Điều chuyển | [Brief] B-16 |
| BR-TRF-07 | Tài sản đang vận chuyển quá số ngày Every Half đặt thì cảnh báo Quản lý tài sản (Q-11) | M06: Điều chuyển | [Đề xuất] |
| BR-TRF-08 | Gửi đi sửa và nhận về từ sửa dùng cùng luồng phiếu điều chuyển, tạo từ phiếu sửa chữa (D-02) | M06: Điều chuyển | [Brief] B-14 |
| BR-TRF-09 | Phiếu điều chuyển điều chỉnh (lập từ F-STK-07, F-STK-09, F-DSP-06 khi tài sản đã nằm ở nơi khác sổ) bỏ bước xuất giao; điểm thực tế vẫn quét xác nhận nhận hàng | M06: Điều chuyển | [Đề xuất] |
| BR-MNT-01 | Mỗi yêu cầu sửa gắn với đúng một tài sản | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-02 | Một tài sản chỉ có một phiếu sửa đang mở; báo hỏng thêm khi đã có phiếu mở thì bổ sung vào phiếu đó | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-03 | Tài sản chuyển "Đang sửa chữa" khi yêu cầu được tiếp nhận, không phải lúc mới báo hỏng | M07: Báo hỏng, sửa chữa và bảo trì | [Brief] B-19 |
| BR-MNT-04 | Chi phí sửa ghi theo từng lần sửa, kèm đơn vị sửa và chứng từ; báo giá vượt ngưỡng Every Half đặt cần duyệt trước khi sửa (Q-37) | M07: Báo hỏng, sửa chữa và bảo trì | [Brief] B-18 |
| BR-MNT-05 | Tài sản chỉ rời trạng thái "Đang sửa chữa" khi phiếu sửa được nghiệm thu hoặc chuyển sang đề nghị thanh lý | M07: Báo hỏng, sửa chữa và bảo trì | [Brief] B-19 |
| BR-MNT-06 | Chi phí sửa được ghi nhận là chi phí trong kỳ hay làm tăng nguyên giá do Kế toán trưởng quyết định; EH-AM chỉ lưu số tiền và phân loại được chọn | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-07 | Người báo hỏng nhận thông báo khi yêu cầu được tiếp nhận, bị từ chối và khi nghiệm thu xong | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-08 | Chuyển thanh lý chưa phải trạng thái kết thúc của phiếu sửa: đề nghị thanh lý bị từ chối hoặc huỷ thì phiếu sửa trở lại Đã tiếp nhận; đề nghị được thực hiện thì phiếu sửa đóng | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất] |
| BR-MNT-09 | Nghiệm thu không đạt đưa phiếu sửa từ Đã sửa xong về Đang sửa, kèm lý do người nghiệm thu chọn; tài sản giữ Đang sửa chữa | M07: Báo hỏng, sửa chữa và bảo trì | [Đề xuất], từ bộ UC |
| BR-DSP-01 | Tài sản chỉ chuyển "Đã thanh lý" khi đề nghị đã được duyệt và việc thanh lý đã thực hiện, có biên bản | M08: Thanh lý và báo giảm | [Brief] B-20 |
| BR-DSP-02 | Người đề nghị không duyệt đề nghị của chính mình (BR-CMN-08) | M08: Thanh lý và báo giảm | [Đề xuất] |
| BR-DSP-03 | Cấp duyệt theo hạn mức nguyên giá do Every Half đặt (Q-08); hệ thống tự xếp cấp duyệt mà không hiện nguyên giá cho người lập; tài sản chưa có nguyên giá thì không gửi duyệt được cho tới khi Kế toán tài sản nhập | M08: Thanh lý và báo giảm | [Đề xuất] |
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

## Quy tắc bổ sung từ bộ UC

Quy tắc chi tiết do các agent viết UC đề xuất khi blueprint chưa nói đủ, gộp ngày 2026-09-30. Chưa được Every Half duyệt; khi blueprint cập nhật thì chuyển quy tắc tương ứng lên §14.

| Mã | Quy tắc | Module | Nguồn |
| --- | --- | --- | --- |
| BR-IAM-18 | Vai trò Quản trị hệ thống không thu hồi qua giao diện; chỉ thu hồi qua quy trình riêng có người chịu trách nhiệm, đối xứng với BR-IAM-05 | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-11 |
| BR-IAM-19 | Nhân viên chỉ có vai trò Nhân viên điểm còn hiệu lực trên một location tại một thời điểm (§8: phạm vi một location); chuyển điểm thì thu hồi vai trò cũ trước | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-10 |
| BR-IAM-20 | Không thu hồi vai trò cuối cùng của một người trên location khi người đó còn là người chịu trách nhiệm tài sản ở location đó; giao lại qua UC-AST-05 trước. Chặn hay chỉ cảnh báo chờ Q-41, cùng cách với cho nghỉ việc | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-11 |
| BR-IAM-21 | Tài khoản dùng mật khẩu tạm ở trạng thái Chờ kích hoạt; được đăng nhập chỉ để đổi mật khẩu, mọi thao tác khác bị chặn, đổi xong chuyển sang Đang hoạt động. Làm rõ BR-IAM-14 và §14.1 | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-01, UC-IAM-04, UC-IAM-05 |
| BR-IAM-22 | Không có hai dòng phân quyền cùng nhân viên, cùng vai trò, cùng phạm vi có khoảng hiệu lực chồng nhau; gia hạn là gán dòng mới sau khi dòng cũ hết hiệu lực hoặc liền kề | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-10 |
| BR-IAM-23 | Đổi email công việc là thao tác riêng của Quản trị hệ thống, bắt lý do, email mới theo BR-IAM-10, nhật ký ghi email trước và sau | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-08 |
| BR-IAM-24 | Lời mời cũ chỉ mất hiệu lực sau khi lời mời mới đã lưu; lời mời chỉ chuyển sang Đã dùng sau khi mật khẩu đã đặt xong. Làm rõ BR-IAM-14 | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-06, UC-IAM-07 |
| BR-IAM-25 | Nhân viên chỉ tự đổi ngôn ngữ hiển thị trên hồ sơ của mình; mọi trường nhân sự khác chỉ Quản trị hệ thống sửa (§14.1 bảng hồ sơ và F-IAM-06) | M01: Người dùng và phân quyền | Đề xuất từ bộ UC; dùng ở UC-IAM-14, UC-IAM-08 |
| BR-MDM-08 | Ngừng hoạt động một mục danh mục (location, cost center, nhóm và loại tài sản, nhà cung cấp, đơn vị sửa chữa, lý do, phòng ban) bắt buộc có lý do chọn từ danh mục lý do, kèm ô ghi thêm khi chọn Khác | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-02, UC-MDM-03, UC-MDM-04, UC-MDM-05, UC-MDM-06, UC-MDM-07, UC-MDM-08 |
| BR-MDM-09 | Cost center chỉ ngừng được khi không còn location đang hoạt động lấy làm mặc định và không còn tài sản chưa ở trạng thái kết thúc mang cost center đó (KPI của M02) | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-03 |
| BR-MDM-10 | Loại tài sản chỉ ngừng được khi không còn tài sản chưa ở trạng thái kết thúc thuộc loại; nhóm chỉ ngừng được khi mọi loại con đã ngừng; loại chỉ tạo được dưới nhóm đang hoạt động (KPI của M02) | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-04 |
| BR-MDM-11 | Sửa mục danh mục dùng khoá lạc quan như BR-IAM-17: người lưu sau trên bản cũ phải tải lại; nhật ký chỉ ghi các trường đổi, trước và sau | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-01 đến UC-MDM-08 (luồng sửa) |
| BR-MDM-12 | Mã số thuế của nhà cung cấp, khi có nhập, là duy nhất trong danh mục kể cả nhà cung cấp đã ngừng | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-05 |
| BR-MDM-13 | Mỗi đơn vị sửa chữa gắn đúng một location bên ngoài đang hoạt động; mỗi location bên ngoài gắn nhiều nhất một đơn vị; location bên ngoài chỉ đóng cùng lúc với việc ngừng đơn vị, áp BR-MDM-03 | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-02, UC-MDM-06 |
| BR-MDM-14 | Mã nhóm tài sản, mã phòng ban và mã lý do duy nhất trong danh mục của mình và không dùng lại sau khi ngừng, mở rộng BR-MDM-01; mã chuẩn hoá bỏ khoảng trắng hai đầu và đổi sang chữ hoa trước khi kiểm trùng | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-04, UC-MDM-07, UC-MDM-08 |
| BR-MDM-15 | Lý do Khác là mục hệ thống có ở mọi nhóm thao tác, không sửa và không ngừng được (BR-CMN-10) | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-07 |
| BR-MDM-16 | Danh mục lý do có thêm nhóm dùng cho việc đóng location và ngừng một mục danh mục, ngoài năm nhóm ở F-MDM-07 | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-02, UC-MDM-07 |
| BR-MDM-17 | Mã của mọi mục danh mục, và loại của location, không sửa được sau khi tạo | M02: Danh mục nền | Đề xuất từ bộ UC; dùng ở UC-MDM-01 đến UC-MDM-08 (luồng sửa) |
| BR-AST-13 | Lệnh tạo hồ sơ từ biểu mẫu và lần nhập từ file mang khoá chống gửi trùng; bấm Lưu hai lần hoặc gửi lại sau khi mất kết nối không tạo hồ sơ thứ hai (mở rộng BR-CMN-09 sang web) | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-01, UC-AST-02 |
| BR-AST-14 | Sửa hồ sơ dùng khoá lạc quan: người lưu sau trên bản đã cũ phải tải lại hồ sơ; áp cho sửa mô tả, điều chỉnh tài chính, đổi người chịu trách nhiệm và đổi trạng thái (tương tự BR-IAM-17) | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-03, UC-AST-04, UC-AST-05, UC-AST-11 |
| BR-AST-15 | Mỗi tài sản chỉ có một đề nghị điều chỉnh thông tin tài chính ở Chờ duyệt tại một thời điểm | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-04, UC-AST-12 |
| BR-AST-16 | Mỗi tài sản chỉ có một đề nghị huỷ hồ sơ ở Chờ duyệt; lúc duyệt hệ thống kiểm lại điều kiện huỷ (BR-AST-06), không còn đủ thì chặn duyệt và chỉ cho từ chối | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-09, UC-AST-10 |
| BR-AST-17 | Nhập từ file dùng mẫu Excel do hệ thống cấp; file sai mẫu bị từ chối cả file; hai dòng trùng serial cùng loại trong một file đều bị coi là lỗi; giới hạn kích thước và số dòng mỗi lần do đội triển khai chốt | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-02 |
| BR-AST-18 | Quyền xem chứng từ theo loại: hoá đơn và PO theo BR-CMN-06, loại khác theo quyền xem hồ sơ; giá trị tiền trong chi tiết sự kiện của dòng thời gian bị ẩn với vai trò không được xem giá trị | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-06, UC-AST-08 |
| BR-AST-19 | Hồ sơ mới có tình trạng vật lý Tốt cho tới khi kiểm kê hoặc sửa chữa cập nhật (BR-AST-10 chưa nêu giá trị ban đầu) | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-01, UC-AST-02 |
| BR-AST-20 | Từ chối đề nghị (huỷ hồ sơ, điều chỉnh tài chính) bắt buộc chọn lý do từ danh mục lý do chuẩn | M03: Hồ sơ tài sản và CCDC | Đề xuất từ bộ UC; dùng ở UC-AST-10, UC-AST-12 |
| BR-QR-07 | Mỗi tài sản có trạng thái nhãn riêng gồm Chưa in, Đã in, Đã dán, tách khỏi trạng thái vòng đời và tình trạng vật lý. Chưa in chuyển sang Đã in khi hệ thống tạo file in cho tài sản, chuyển sang Đã dán khi có xác nhận dán nhãn. Đã in nghĩa là đã tạo file in, không có nghĩa nhãn đã ra giấy. Lô in là một lần tạo file in cho một nhóm tài sản | M04: QR và nhãn | Đề xuất từ bộ UC; dùng ở UC-QR-01, UC-QR-02, UC-QR-03, UC-QR-06 |
| BR-QR-08 | Xác nhận dán nhãn chỉ nhận từ người có vai trò trên location đang ghi của tài sản, cho nhãn ở trạng thái Đã in. Mỗi tài sản một bản ghi xác nhận, xác nhận lại không ghi đè. Xác nhận bằng cách quét nhãn, không bằng nhập tay Asset ID (chờ [TBD-3] của UC-QR-03) | M04: QR và nhãn | Đề xuất từ bộ UC; dùng ở UC-QR-03 |
| BR-QR-09 | In nhãn lần đầu chỉ cho tài sản có trạng thái nhãn Chưa in; tài sản đã in chỉ in lại qua thao tác In lại nhãn có lý do. Tài sản ở trạng thái kết thúc không được in hay in lại nhãn | M04: QR và nhãn | Đề xuất từ bộ UC; dùng ở UC-QR-02, UC-QR-06 |
| BR-QR-10 | In lại nhãn đưa trạng thái nhãn về Đã in và cần xác nhận dán lại; in lại cho nhiều tài sản cùng lúc vẫn ghi riêng từng tài sản kèm lý do (chờ [TBD-2] của UC-QR-06) | M04: QR và nhãn | Đề xuất từ bộ UC; dùng ở UC-QR-06 |
| BR-QR-11 | Nhật ký lượt quét mã lạ chỉ ghi người quét, thời điểm và Asset ID tách được, không ghi nguyên nội dung mã. Ghi nhật ký lượt quét không được chặn việc báo mã lạ cho người quét | M04: QR và nhãn | Đề xuất từ bộ UC; dùng ở UC-QR-04, UC-QR-05 |
| BR-STK-12 | Đợt kiểm kê chỉ mở khi mọi location tham gia có ít nhất một người được phân công, có vai trò trên location đó; danh sách dự kiến của điểm chốt lúc mở đợt và không đổi sau đó | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-01, UC-STK-02 |
| BR-STK-13 | Đợt Nháp huỷ được kèm lý do từ danh mục lý do; đợt đã mở chưa có đường huỷ ở GĐ1 | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-01 |
| BR-STK-14 | "Người kiểm" của điểm là người có lượt quét hoặc là người chốt kết quả của điểm trong đợt; người kiểm không duyệt điểm đó; không còn Quản lý điểm nào khác thì Quản lý tài sản duyệt (làm rõ BR-STK-06) | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-04, UC-STK-05 |
| BR-STK-15 | Điểm chỉ chốt khi điện thoại của người chốt đã gửi hết lượt quét trong hàng đợi trên máy; điểm đã chốt không nhận lượt quét mới cho tới khi được yêu cầu kiểm lại (bổ sung cho BR-STK-10) | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-03, UC-STK-04 |
| BR-STK-16 | Kết quả Sai vị trí và Tài sản lạ cũng cần ảnh chụp tại chỗ như BR-STK-04; Tài sản lạ chưa có nhãn phải kèm mô tả ngắn (theo F-STK-04) | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-03 |
| BR-STK-17 | Chênh lệch Sai vị trí, Hư hỏng, Tài sản lạ chỉ xử lý sau khi điểm được duyệt; mỗi chênh lệch có trạng thái Chưa xử lý hoặc Đã xử lý và đúng một cách xử lý; đóng chênh lệch không cần phiếu phải có lý do từ danh mục | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-05, UC-STK-06 |
| BR-STK-18 | Kết quả xác minh tài sản Nghi mất gồm nơi đã tìm, người đã hỏi và ảnh (bắt buộc khi tìm thấy); mỗi tài sản Nghi mất chỉ có một kết luận tại một thời điểm; tìm thấy thì tài sản về trạng thái trước khi Nghi mất | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-08 |
| BR-STK-20 | Đợt mở tự động dùng các Quản lý điểm của location làm người được phân công mặc định; location không có người bị loại khỏi đợt và Quản lý tài sản nhận cảnh báo; job chạy bù trong cùng tháng khi bỏ lỡ lịch | M05: Kiểm kê | Đề xuất từ bộ UC; dùng ở UC-STK-02 |
| BR-TRF-10 | Khi điểm gửi của phiếu là location bên ngoài của đơn vị sửa chữa (phiếu nhận về từ sửa), Quản lý tài sản xuất giao thay đơn vị sửa, cùng nguyên tắc BR-TRF-05 | M06: Điều chuyển | Đề xuất từ bộ UC; dùng ở UC-TRF-03 |
| BR-TRF-11 | Hoàn tất nhận hàng yêu cầu mọi tài sản của phiếu (hoặc của lượt nhận tiếp) đã được quét hoặc đánh dấu không tới; không lưu bản nhận dở trên máy chủ | M06: Điều chuyển | Đề xuất từ bộ UC; dùng ở UC-TRF-04 |
| BR-TRF-12 | Xuất giao yêu cầu quét đủ mọi tài sản của phiếu; không xuất một phần phiếu | M06: Điều chuyển | Đề xuất từ bộ UC; dùng ở UC-TRF-03 |
| BR-TRF-13 | Tài sản bị đánh dấu không tới giữ Đang vận chuyển và location điểm gửi cho tới khi Quản lý tài sản kết luận; kết luận không tìm thấy chuyển tài sản sang Nghi mất tại location điểm gửi | M06: Điều chuyển | Đề xuất từ bộ UC; dùng ở UC-TRF-04, UC-TRF-05 |
| BR-TRF-14 | Phiếu Nháp giữ tài sản ở Chờ điều chuyển; người tạo được sửa và gửi lại phiếu Nháp, kể cả phiếu bị người duyệt trả lại, và phiếu giữ mã cũ | M06: Điều chuyển | Đề xuất từ bộ UC; dùng ở UC-TRF-01, UC-TRF-02 |
| BR-MNT-10 | Dòng chi phí sửa đã ghi không sửa, không xoá; nhập sai thì đính chính bằng dòng thay thế kèm lý do, dòng cũ giữ trong lịch sử (mở rộng BR-CMN-01) | M07: Báo hỏng, sửa chữa và bảo trì | Đề xuất từ bộ UC; dùng ở UC-MNT-05, UC-MNT-09 |
| BR-MNT-11 | Phiếu sửa có báo giá vượt ngưỡng chưa được duyệt hoặc đã bị từ chối thì không chuyển sang Đang sửa (làm rõ BR-MNT-04) | M07: Báo hỏng, sửa chữa và bảo trì | Đề xuất từ bộ UC; dùng ở UC-MNT-04, UC-MNT-05, UC-MNT-06 |
| BR-MNT-12 | Chỉ nghiệm thu khi tài sản đã về location đã lưu trong phiếu; với phiếu gửi đơn vị sửa, phiếu điều chuyển nhận về phải Đã nhận | M07: Báo hỏng, sửa chữa và bảo trì | Đề xuất từ bộ UC; dùng ở UC-MNT-07 |
| BR-MNT-13 | Đề nghị thanh lý lập từ phiếu sửa, ở Nháp hay Chờ duyệt, đều đưa phiếu sang Chuyển thanh lý cùng lần lưu; khi đề nghị được thực hiện thì phiếu sửa đóng bằng trạng thái kết thúc mà blueprint cần bổ sung ở Phụ lục B.4 | M07: Báo hỏng, sửa chữa và bảo trì | Đề xuất từ bộ UC; dùng ở UC-MNT-08, UC-MNT-04 |
| BR-DSP-08 | Mỗi tài sản chỉ có một đề nghị đang mở (Nháp, Chờ duyệt, Đã duyệt) trong ba loại: thanh lý, xác nhận mất, khôi phục | M08: Thanh lý và báo giảm | Đề xuất từ bộ UC; dùng ở UC-DSP-01, UC-DSP-05, UC-DSP-06 |
| BR-DSP-09 | Khi duyệt đề nghị thanh lý, hệ thống lưu trạng thái tài sản ngay trước đó để đưa về khi đề nghị bị huỷ; khi báo mất đột xuất, lưu trạng thái trước lúc chuyển Nghi mất | M08: Thanh lý và báo giảm | Đề xuất từ bộ UC; dùng ở UC-DSP-02, UC-DSP-04, UC-DSP-05 |
| BR-DSP-10 | Nếu sau lúc gửi tài sản đã đổi trạng thái (vào phiếu điều chuyển hoặc phiếu sửa mở, sang trạng thái kết thúc, không còn đúng Nghi mất hay Mất) thì đề nghị chỉ được từ chối, không duyệt được | M08: Thanh lý và báo giảm | Đề xuất từ bộ UC; dùng ở UC-DSP-02 |
| BR-DSP-11 | Đề nghị xác nhận mất bị từ chối hoặc huỷ thì tài sản giữ Nghi mất và phải có kết luận mới trong thời hạn của BR-STK-07 | M08: Thanh lý và báo giảm | Đề xuất từ bộ UC; dùng ở UC-DSP-02, UC-DSP-05 |
| BR-DSP-12 | Đề nghị xác nhận mất và đề nghị khôi phục bắt buộc kèm ít nhất một tệp bằng chứng; đề nghị thanh lý bắt buộc kèm ít nhất một ảnh hiện trạng (số tệp tối đa chờ Q-38) | M08: Thanh lý và báo giảm | Đề xuất từ bộ UC; dùng ở UC-DSP-01, UC-DSP-05, UC-DSP-06 |
| BR-DSH-05 | Tổng nguyên giá và số tài sản cần quản lý không tính tài sản ở trạng thái kết thúc (Đã thanh lý, Mất, Hủy); số tài sản theo trạng thái vẫn hiện đủ các trạng thái. Chờ Kế toán trưởng xác nhận | M11: Dashboard và báo cáo | Đề xuất từ bộ UC; dùng ở UC-DSH-01, UC-DSH-02 |
| BR-DSH-06 | Tỷ lệ tài sản đã quét của đợt hoặc của điểm bằng số tài sản trong danh sách dự kiến đã có lượt quét chia số tài sản dự kiến; tài sản lạ không nằm trong tử số; số cộng dồn trong cơ sở dữ liệu | M11: Dashboard và báo cáo | Đề xuất từ bộ UC; dùng ở UC-DSH-04, UC-DSH-05 |
| BR-DSH-07 | Báo cáo tháng chốt số theo kỳ tính giờ Việt Nam và số đã chốt không đổi khi dữ liệu sau đó thay đổi (nguyên tắc KPI ở §23); báo cáo theo bộ lọc khác dùng số tại thời điểm xuất và ghi thời điểm đó trên file | M11: Dashboard và báo cáo | Đề xuất từ bộ UC; dùng ở UC-DSH-06 |
| BR-AUD-07 | Xuất nhật ký theo cùng quy tắc với xuất báo cáo: file chỉ chứa cột người xuất được xem, mỗi lần xuất ghi một dòng nhật ký gồm người xuất, điều kiện lọc và thời điểm, không chứa đường dẫn tải (mở rộng BR-DSH-04 sang F-AUD-03) | M12: Nhật ký, lịch sử và thông báo | Đề xuất từ bộ UC; dùng ở UC-AUD-02 |
| BR-AUD-08 | Ngưỡng nhắc hạn là số ngày nguyên dương; đổi cấu hình thông báo bắt buộc lý do, có hiệu lực từ lần chạy kế tiếp của job và không sửa thông báo đã tạo | M12: Nhật ký, lịch sử và thông báo | Đề xuất từ bộ UC; dùng ở UC-AUD-06, UC-AUD-05 |
| BR-AUD-09 | Mỗi việc chỉ có một thông báo cho mỗi người nhận ở mỗi mốc nhắc (trước hạn, quá hạn); chạy lại job không tạo thông báo trùng | M12: Nhật ký, lịch sử và thông báo | Đề xuất từ bộ UC; dùng ở UC-AUD-05 |
| BR-AUD-10 | Thông báo trong ứng dụng luôn được tạo; email chỉ gửi cho tài khoản đang hoạt động có địa chỉ email, và email lỗi không làm mất thông báo trong hộp việc | M12: Nhật ký, lịch sử và thông báo | Đề xuất từ bộ UC; dùng ở UC-AUD-04, UC-AUD-05 |
| BR-AUD-11 | Hộp việc và thông báo chỉ hiện cho người nhận, trong phạm vi location của người đó; mở thông báo chỉ đổi trạng thái đọc, không đổi trạng thái của việc | M12: Nhật ký, lịch sử và thông báo | Đề xuất từ bộ UC; dùng ở UC-AUD-03 |
