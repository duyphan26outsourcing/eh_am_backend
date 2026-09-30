# Quyết định khi sửa bộ UC theo rà soát kiểm thử

Người điều phối chốt ngày 30/09/2026 để sửa các mục Cao và Trung bình trong `2026-09-29-ra-soat-kiem-thu-uc.md`. Mọi agent sửa UC theo đúng các quyết định này; chỗ nào Every Half chưa trả lời thì viết theo quyết định và ghi `[TBD-n]` dẫn mã Q-nn. Cột cuối là mục QA được giải quyết.

## Quy ước chung

| Mã | Quyết định | Mục QA |
| --- | --- | --- |
| QĐ-01 | Mọi lệnh ghi, từ web hay điện thoại, mang khoá chống trùng do client sinh cho mỗi lần bấm; gửi lại cùng khoá trả kết quả lần đầu, không tạo bản thứ hai (mở rộng BR-CMN-09). Mỗi UC có lệnh ghi tiền, tạo hồ sơ, tạo đề nghị hoặc đổi trạng thái có một ngoại lệ "gửi trùng" theo quy ước này | B02, B34, D01, D02, D20 |
| QĐ-02 | Thay đổi nghiệp vụ và dòng nhật ký lưu trong cùng một giao dịch. Việc chỉ làm được sau giao dịch (thu hồi phiên, gửi email, cấp đường dẫn tải file) làm sau khi giao dịch thành công; lỗi ở bước sau không hoàn tác giao dịch, được ghi log vận hành và thử lại. Riêng xuất file: ghi nhật ký rồi mới cấp đường dẫn; lỗi ghi nhật ký thì xoá file đã lưu. UC gọi UC-AUD-01 truyền giá trị trước và sau | A11, A12, B09, B31, D32 |
| QĐ-03 | Mỗi ngoại lệ ghi đúng một mã lỗi. Dùng mã có trong `src/common/i18n/error-code.const.ts` khi có; mã mới viết in hoa có gạch dưới và ghi "(mã mới)" | A28 |
| QĐ-04 | Ngưỡng hệ thống chưa chốt được ghi giá trị mặc định đề xuất để test, kèm "(mặc định đề xuất)" và `[TBD-n]`: file nhập tài sản tối đa 5 MB và 2.000 dòng; tệp đính kèm tối đa 10 MB, định dạng JPG, PNG, PDF; danh sách 50 dòng một trang, sắp theo thời điểm cập nhật mới nhất; xuất file tối đa 10.000 dòng; lô in tối đa 500 nhãn; thử gửi email lại 3 lần. Hạn mức duyệt ở GĐ1 là một cấp Ban giám đốc cho mọi giá trị tới khi có Q-08, bỏ nhánh "sai cấp duyệt"; ngưỡng báo giá cần duyệt là "lớn hơn hoặc bằng" giá trị Every Half đặt, tính theo từng báo giá (Q-37) | B11, C24, D14, D21 |
| QĐ-05 | Hiệu lực vai trò là khoảng nửa mở [từ, đến) theo giờ Việt Nam. Chọn "đến ngày D" lưu đến bằng 00:00 ngày D+1. Thu hồi dòng Sắp hiệu lực đặt đến bằng từ (dòng không bao giờ có hiệu lực). Hiệu lực từ không sớm hơn thời điểm gán. Không chồng khoảng cùng vai trò và phạm vi, kể cả dòng Sắp hiệu lực (BR-IAM-22) | A09, A19 |
| QĐ-06 | Mọi thao tác cần lý do dùng danh mục lý do (UC-MDM-07) theo nhóm: điều chỉnh hồ sơ, điều chỉnh tài chính, huỷ hồ sơ, đưa vào hoặc ngừng sử dụng, điều chuyển, huỷ phiếu, từ chối duyệt, thanh lý, huỷ đề nghị, xác nhận mất, khôi phục, in lại nhãn, gán vai trò, thu hồi vai trò, khoá tài khoản, mở khoá, nghỉ việc, đổi email, ngừng mục danh mục, đóng location, đổi cấu hình, nghiệm thu không đạt. Máy chủ kiểm lý do còn hoạt động và đúng nhóm. Sửa thông tin mô tả (UC-AST-03) và sửa hồ sơ nhân viên thường thì lý do tuỳ chọn | A02, A33, B30, B35 |
| QĐ-07 | Việc gửi cho nhiều người nhận: một người xử lý thì việc đóng với mọi người nhận. Người có vai trò toàn hệ thống nhận việc như người có vai trò trên location. Mỗi việc mới trong hộp việc được đưa vào hàng đợi email theo bảng sự kiện thông báo ở §14.12; UC nghiệp vụ không cần bước riêng cho email | B12, B19, B20 |
| QĐ-08 | Tắt một loại thông báo không ảnh hưởng mục đã vào hàng đợi (BR-AUD-08). Bật tắt job làm ở màn hình **Cấu hình thông báo**. Khổ nhãn cấu hình ở màn hình **In nhãn** (luồng thay thế của UC-QR-02, Quản trị hệ thống hoặc Quản lý tài sản) | B08, B10 |

## M01, M02

| Mã | Quyết định | Mục QA |
| --- | --- | --- |
| QĐ-10 | UC-IAM-10 nhận cả tài khoản Chờ kích hoạt; vai trò có hiệu lực từ khi nhân viên kích hoạt | A01 |
| QĐ-11 | UC-IAM-13 tự giao người chịu trách nhiệm mới trong cùng lệnh cho nghỉ việc: Quản trị hệ thống chọn một người cho tất cả hoặc từng người cho từng tài sản; danh sách chỉ gồm tài sản chưa ở trạng thái kết thúc và không ở location bên ngoài. UC-AST-05 giữ nguyên cho việc đổi thường ngày, không được IAM-13 gọi nữa. Còn tài sản chưa có người nhận thì chặn cho nghỉ (phương án chặn, chờ Q-41) | A03, A20, B04 |
| QĐ-12 | Đổi email của tài khoản Chờ kích hoạt làm lời mời cũ mất hiệu lực và gửi lời mời mới tới email mới | A04 |
| QĐ-13 | Location bên ngoài đã gắn đơn vị sửa chỉ đóng qua UC-MDM-06; chưa gắn thì đóng qua UC-MDM-02. Kiểm "đang hoạt động" chỉ áp cho trường được đổi. "Phiếu đang mở" gắn với location qua điểm gửi hoặc điểm nhận, tính cả phiếu Nháp. Phép đếm "nhân viên đang hoạt động" gồm Chờ kích hoạt, Đang hoạt động, Tạm khoá. Phòng ban bắt buộc khi location làm việc chính là văn phòng, bị bỏ trống với loại location khác | A05, A06, A29, A34 |
| QĐ-14 | Tài khoản dùng mật khẩu tạm chỉ gọi được đổi mật khẩu, đăng xuất và xem hồ sơ của mình; route khác trả 403 mã `PASSWORD_CHANGE_REQUIRED` (mã mới). UC-IAM-05 tách hậu điều kiện theo nhánh mời email và nhánh mật khẩu tạm | A07, A08, A17 |
| QĐ-15 | "Quản trị hệ thống đang hoạt động" là tài khoản Đang hoạt động có vai trò `SYSTEM_ADMIN` còn hiệu lực; phép kiểm "còn người khác" và việc khoá hay cho nghỉ chạy trong cùng một giao dịch có khoá dòng | A10 |
| QĐ-16 | Ngày nghỉ việc do Quản trị hệ thống nhập ở UC-IAM-13, mặc định hôm nay, không được ở tương lai | A21 |
| QĐ-17 | Email chuẩn hoá chữ thường và bỏ khoảng trắng hai đầu; kiểm trùng tính cả tài khoản Đã ngừng. Wizard kiểm từng bước ở client; máy chủ kiểm lại toàn bộ khi gửi, nên ngoại lệ trùng email, trùng mã xảy ra ở bước gửi | A13, A14 |
| QĐ-18 | Đổi mật khẩu xác minh mật khẩu hiện tại trước khi kiểm mật khẩu mới. Tài khoản Tạm khoá không đặt lại mật khẩu được | A23, A24 |

## M03, M04, M12

| Mã | Quyết định | Mục QA |
| --- | --- | --- |
| QĐ-19 | Tạo hồ sơ (UC-AST-01, UC-AST-02) ghi một dòng nhật ký cho mỗi hồ sơ, gồm cả việc sinh mã QR; UC-QR-01 không ghi dòng riêng | B01 |
| QĐ-20 | UC-AST-01 có luồng thay thế "lập từ tài sản lạ" do UC-STK-06 gọi: điền sẵn mô tả, ảnh, location nơi thấy; người lập nhập loại, người chịu trách nhiệm, trạng thái; trả Asset ID; huỷ giữa chừng thì chênh lệch giữ Chưa xử lý | B03 |
| QĐ-21 | Quản lý tài sản thực hiện được UC-AST-05, UC-AST-11, UC-QR-03 trên mọi location | B05 |
| QĐ-22 | Xác nhận dán nhãn không cho nhập tay Asset ID: UC-QR-03 gọi UC-QR-04 ở chế độ chỉ quét. Bản ghi xác nhận dán lưu theo từng lượt in, nên sau in lại có lượt xác nhận mới | B06, B07 |
| QĐ-23 | UC-AUD-02 chỉ cho Kiểm soát nội bộ. UC-AST-07 cho Kế toán trưởng, Ban giám đốc, Kiểm soát nội bộ xem danh sách (không thao tác). Phạm vi rỗng trả danh sách rỗng; vai trò không được dùng màn hình trả 403; lọc location ngoài phạm vi và location không tồn tại cùng trả danh sách rỗng | B16, B17, B18, B29 |

## M05, M06

| Mã | Quyết định | Mục QA |
| --- | --- | --- |
| QĐ-24 | BR-STK-19 thực hiện ngay trong bước duyệt của UC-STK-05: hệ thống bỏ tài sản khỏi phiếu điều chuyển chưa xuất (phiếu rỗng thì tự huỷ), huỷ đề nghị thanh lý chưa thực hiện (phiếu sửa nguồn trở lại Đã tiếp nhận theo BR-MNT-08), phiếu sửa tại chỗ giữ nguyên kèm ghi chú; mỗi việc một dòng nhật ký. EX.3 chỉ còn cho tài sản đã sang trạng thái kết thúc | C01, C02, C03, D08 |
| QĐ-25 | Tài sản rời điểm giữa đợt qua phiếu đã xuất giao được loại khỏi Không tìm thấy, ghi "đã chuyển trong đợt". Quét Có mặt một tài sản Nghi mất là kết luận tìm thấy. Kết quả hiện hành của tài sản là lượt có giờ quét mới nhất (giờ trên máy nếu có, không thì giờ máy chủ). Ảnh kiểm kê phải chụp trực tiếp bằng camera trong app, không chọn từ thư viện; không kiểm EXIF. Duyệt kết quả điểm theo BR-STK-14 | C04, C05, C06, C07, C08 |
| QĐ-26 | Tìm thấy tài sản Nghi mất (UC-STK-08, áp cho mọi nguồn Nghi mất, kể cả do nhận thiếu) hoặc Mất (UC-DSP-06): trạng thái đích Lưu kho hoặc Đang sử dụng do người xác minh chọn, hoặc Đang sửa chữa nếu phiếu sửa còn mở. Tìm thấy ở nơi khác sổ thì lập phiếu điều chuyển điều chỉnh: phiếu điều chỉnh nhận tài sản Nghi mất hoặc Mất (ngoại lệ của BR-TRF-03), tài sản sang Chờ điều chuyển khi lập phiếu, điểm nhận xác nhận thì thành trạng thái đích. UC-DSP-05 nhận sẵn kết quả xác minh từ UC-STK-08 và cho đính kèm tệp ngay tại UC-DSP-05 | C09, C10, C11, C12, D17 |
| QĐ-27 | Nút "Không tới" có ở phiếu thường và phiếu gửi sửa, không có ở phiếu điều chỉnh. Với phiếu gửi sửa, tài sản không tới giữ Đang sửa chữa tới khi Quản lý tài sản kết luận; không tìm thấy thì Nghi mất, phiếu sửa giữ nguyên kèm ghi chú | C13, D10 |
| QĐ-28 | Chênh lệch chỉ thành Đã xử lý khi phiếu điều chỉnh Đã nhận, yêu cầu sửa đã tạo, hoặc hồ sơ đã lập; huỷ phiếu điều chỉnh mở lại chênh lệch. Chênh lệch gắn được với phiếu hoặc yêu cầu đã có | C14, C15 |
| QĐ-29 | Phiếu điều chỉnh không qua duyệt (BR-TRF-09). Việc duyệt phiếu giao cho mọi Quản lý tài sản khác người tạo; chỉ có một người thì ghi ngoại lệ "không có người duyệt hợp lệ". Phiếu Đã duyệt tạo việc chờ xuất giao cho Quản lý điểm nơi gửi, điểm gửi là location bên ngoài thì cho Quản lý tài sản. Quá hạn tính theo phiếu Đang vận chuyển hoặc Nhận một phần | C25, C26, C27, C32 |

## M07, M08, M11

| Mã | Quyết định | Mục QA |
| --- | --- | --- |
| QĐ-31 | Tổng chi phí của phiếu sửa chỉ gồm chi phí thực tế; báo giá hiện riêng. Đính chính chi phí là luồng thay thế của UC-MNT-05: dòng cũ giữ lịch sử, dòng mới có lý do, tổng tính lại. Chỉ báo giá mới nhất quyết định việc chặn Đang sửa. Phiếu sửa kết thúc bằng `CLOSED` Đã đóng (Phụ lục B.4). UC-DSP-01.AC.2 nhận Nháp lập từ phiếu sửa và kiểm theo điều kiện của đề nghị từ phiếu sửa | D03, D04, D05, D06, D07 |
| QĐ-32 | Báo mất đột xuất tài sản Đang sửa chữa: phiếu sửa giữ nguyên kèm ghi chú, thao tác M07 tạm khoá tới khi có kết luận; tìm thấy thì trở lại Đang sửa chữa; xác nhận mất thì phiếu sửa thành Đã đóng | D09 |
| QĐ-33 | Location nơi trả về không có Quản lý điểm, hoặc tài sản do Quản lý tài sản chịu trách nhiệm, thì việc nghiệm thu giao cho Quản lý tài sản | D11 |
| QĐ-34 | Báo cáo tháng (UC-DSH-06) chọn tháng; số chốt lúc 00:00 ngày 1 tháng sau theo giờ Việt Nam, xuất lại cho cùng số. UC-DSH-03: mốc ngày là ngày tài sản vào trạng thái (Nghi mất, Mất, Đang sửa chữa) hoặc ngày tình trạng thành Hư hỏng; các nhóm có thể chồng nhau, không cộng; khoảng ngày theo giờ Việt Nam, gồm cả ngày cuối | D12, D13 |
| QĐ-35 | Mã sự kiện nhật ký viết ba đoạn `<domain>.<đối tượng>.<hành động thể quá khứ>` | D34 |
