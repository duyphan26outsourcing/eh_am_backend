# EH-AM Master Blueprint 1.0

Hệ thống quản lý tài sản và công cụ dụng cụ của Every Half

Quét một tài sản, biết ngay nó là gì, đang ở đâu, ai chịu trách nhiệm, giá trị bao nhiêu và đã qua những gì.

Tầm nhìn · Người dùng · 12 module · Quy trình · Dữ liệu · Bảo mật · Kiến trúc kỹ thuật · 14 bước triển khai · Lộ trình MVP1

Phiên bản 1.0 · 30/09/2026 · Bản thiết kế để Every Half duyệt phạm vi trước khi triển khai

> **Ranh giới tin cậy**
> Tài liệu này là bản thiết kế sản phẩm và triển khai của EH-AM, dùng để Every Half duyệt phạm vi và trả lời các câu hỏi còn mở. Tài liệu không thay cho xác nhận của Kế toán trưởng về chính sách kế toán, và không phải tư vấn pháp lý hay thuế. Nội dung gắn nhãn [Đề xuất] chỉ có hiệu lực khi Every Half xác nhận.

## Kiểm soát tài liệu

| Mục | Nội dung |
| --- | --- |
| Tên tài liệu | EveryHalf_AM_Master_Blueprint_v1.0 |
| Phiên bản | 1.0 |
| Ngày phát hành | 30/09/2026 |
| Phạm vi | Tầm nhìn, người dùng, module, quy trình, dữ liệu, bảo mật, kiến trúc kỹ thuật, lộ trình và go-live của EH-AM. MVP1 là giai đoạn GĐ1, vận hành tài sản |
| Đối tượng sử dụng | Ban giám đốc, Kế toán trưởng, bộ phận Vận hành và quản lý các điểm của Every Half; PO/BA, UX, backend, frontend và QA của đội triển khai |
| Cơ sở hợp nhất | Brief "EVERY HALF — PHẦN MỀM QUẢN LÝ TÀI SẢN" do Every Half gửi (40 dòng nội dung, mã B-01 đến B-40); codebase `eh_am_backend` và `eh_am_frontend`; khung mục của FDI Today Master Blueprint 5.0 |
| Thẩm quyền thay đổi | Ban giám đốc Every Half cho phạm vi và ưu tiên; Kế toán trưởng cho các nội dung kế toán và GĐ2; PO bên triển khai cho nội dung kỹ thuật |
| Trạng thái | Bản đề xuất, chờ Every Half duyệt phạm vi MVP1 và trả lời câu hỏi ở Phụ lục H |
| Tài liệu đi kèm | Bộ use case tại `business/product-docs/product-usecase/` (Phụ lục D) |

## Từ brief gốc đến Blueprint 1.0

| Nội dung | Brief gốc | Blueprint 1.0 |
| --- | --- | --- |
| Phạm vi chức năng | 8 nhóm chức năng và 3 nguyên tắc | 12 module; bốn module M01, M02, M04, M12 là phần brief ngầm đòi hỏi (phân quyền theo location, danh mục điểm và cost center, nhãn QR, lịch sử không xoá) |
| Người dùng | Nhắc tới nhân viên quét, cửa hàng nhận hàng, người duyệt thanh lý, kế toán | Chín nhóm người dùng, mỗi nhóm có mã vai trò và phạm vi location |
| Trạng thái tài sản | Sáu trạng thái, chưa có quy tắc chuyển | Vòng đời chuẩn hoá, bảng chuyển trạng thái, tình trạng vật lý tách khỏi trạng thái vòng đời |
| Kiểm kê | Hằng tháng, bốn kết quả | Đợt kiểm kê theo điểm, bằng chứng tại chỗ, "nghi mất" trước khi thành "Mất", duyệt kết quả |
| FAST | Đồng bộ hai chiều | Ma trận sở hữu dữ liệu theo từng trường; làm ở GĐ2, ngoài MVP1 |
| Phi chức năng | Có audit và phân quyền | Thêm yêu cầu về mạng yếu, dữ liệu cá nhân, lưu trữ, hiệu năng |
| Chuyển đổi | Chưa nhắc | Làm sạch dữ liệu, dán nhãn theo điểm, pilot, go-live theo đợt |
| Triển khai | Chưa có | 14 bước S01 đến S14, 9 cổng G0 đến G8, lộ trình tính theo tuần |

## Mục lục cấu trúc

| Phần | Nội dung |
| --- | --- |
| Phần I | Tầm nhìn, mục đích, ý nghĩa và sự cần thiết (§1 đến §7) |
| Phần II | Người dùng và giá trị cho từng bên (§8 đến §11) |
| Phần III | Kiến trúc sản phẩm và 12 module (§12 đến §14) |
| Phần IV | Tự động hoá, dữ liệu, tích hợp, bảo mật và trải nghiệm (§15 đến §21) |
| Phần V | Quy trình, KPI, điều hành và mô hình vận hành (§22 đến §26) |
| Phần VI | Kiến trúc kỹ thuật và các bước triển khai (§27 đến §32) |
| Phần VII | Lộ trình, cổng kiểm soát, chuyển đổi dữ liệu và go-live (§33 đến §41) |
| Phụ lục | A. Nhóm API · B. Mã trạng thái · C. Module và bước triển khai · D. Tài liệu tham chiếu · E. Mẫu use case · F. Truy vết brief · G. Giả định · H. Câu hỏi mở · I. Rủi ro và quyết định · J. Thuật ngữ · K. Danh mục màn hình |

## Quy ước đọc

| Ký hiệu | Ý nghĩa |
| --- | --- |
| [Brief] | Yêu cầu có trong brief của Every Half |
| [Đề xuất] | Đội triển khai đề xuất để hoàn thiện yêu cầu; chờ Every Half xác nhận |
| [Chốt] | Đã thống nhất với Every Half |
| GĐ1, GĐ2, GĐ3 | Giai đoạn triển khai: GĐ1 vận hành tài sản (MVP1), GĐ2 kế toán và FAST, GĐ3 tối ưu và mở rộng |
| `Mnn` | Mã module, ví dụ M03 là Hồ sơ tài sản và CCDC (§13) |
| `F-<MÃ>-<nn>` | Tính năng của một module (§14) |
| `BR-<MÃ>-<nn>`, `BR-CMN-<nn>` | Quy tắc nghiệp vụ của một module, và quy tắc chung áp cho mọi module (§14) |
| `WF-<nn>` | Quy trình chuẩn (§22) |
| `S<nn>`, `G<n>` | Bước triển khai (§31) và cổng kiểm soát (§34) |
| `SCR-<nn>` | Màn hình (Phụ lục K) |
| `A-<nn>`, `Q-<nn>`, `R-<nn>`, `D-<nn>` | Giả định (Phụ lục G), câu hỏi mở (Phụ lục H), rủi ro và quyết định (Phụ lục I) |
| `B-<nn>` | Dòng nội dung của brief gốc (Phụ lục F) |

Mã module trong mã tính năng và quy tắc: IAM (M01), MDM (M02), AST (M03), QR (M04), STK (M05), TRF (M06), MNT (M07), DSP (M08), DEP (M09), FST (M10), DSH (M11), AUD (M12).

# PHẦN I. Tầm nhìn, mục đích, ý nghĩa và sự cần thiết

EH-AM là hệ thống vận hành tài sản vật lý của chuỗi, được dùng hằng ngày tại cửa hàng, kho, xưởng rang và văn phòng.

> **Tuyên bố thiết kế**
> Nội dung của các phần trong tài liệu này là căn cứ để viết use case, thiết kế dữ liệu, API, phân quyền và kiểm thử. Khi use case hay code mâu thuẫn với blueprint, sửa blueprint trước rồi mới sửa phần còn lại.

## 1. Tuyên ngôn sản phẩm

> **Tuyên ngôn sản phẩm**
> EH-AM là sổ tài sản dùng chung của Every Half. Mỗi tài sản và công cụ dụng cụ cần quản lý có một mã định danh dán trên thân, một vị trí, một người chịu trách nhiệm, một giá trị, một tình trạng và một lịch sử ghi đủ từ lúc nhận về tới lúc thanh lý.

Mọi sự kiện trong đời tài sản đều thành một bản ghi có người làm, thời điểm, bằng chứng và lý do: nhận về, dán nhãn, đưa vào dùng, kiểm kê, điều chuyển, báo hỏng, sửa, mất, thanh lý. Bản ghi cũ không bị xoá hay sửa đè (B-37, B-38). Thao tác tại cửa hàng bắt đầu bằng quét mã QR; gõ tay chỉ dùng khi nhãn hỏng.

Sáu nguyên tắc thiết kế:

1. Không xoá lịch sử. "Xoá" trên giao diện là đổi trạng thái kèm lý do. [Brief] B-16, B-37
2. Mỗi thay đổi lưu đủ "Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do". [Brief] B-38
3. Người dùng chỉ thấy và thao tác tài sản của location mà họ có vai trò; quyền được kiểm ở máy chủ. [Brief] B-39
4. EH-AM giữ dữ liệu vận hành và tài sản vật lý, FAST giữ sổ kế toán, và mỗi trường dữ liệu chỉ có một hệ làm chủ. [Brief] B-26, B-27; phần "một hệ làm chủ" là [Đề xuất]
5. Bằng chứng lấy tại hiện trường: người quét, giờ máy chủ, ảnh chụp tại chỗ, tình trạng quan sát được. [Brief] B-13
6. Quét trước, gõ sau. [Đề xuất]

## 2. Tầm nhìn phát triển

| Giai đoạn | Nội dung | Điều kiện bắt đầu |
| --- | --- | --- |
| GĐ1 · MVP1 vận hành tài sản | Mọi tài sản cần quản lý có hồ sơ và nhãn QR; kiểm kê hằng tháng bằng điện thoại; điều chuyển có xác nhận nhận hàng bằng QR; báo hỏng và theo dõi sửa chữa có chi phí; thanh lý có phê duyệt; dashboard vận hành; nhật ký thay đổi đầy đủ | Every Half duyệt phạm vi MVP1 ở cổng G0 |
| GĐ2 · Kế toán và FAST | Khấu hao và phân bổ CCDC theo kỳ; liên kết mã tài sản FAST; đồng bộ theo ma trận sở hữu dữ liệu; nhật ký Synced, Pending, Error; đối soát và dashboard tài chính | Kế toán trưởng trả lời Q-04, Q-05, Q-06, Q-07 |
| GĐ3 · Tối ưu | Bảo trì định kỳ, cảnh báo bất thường, so sánh chi phí sửa theo dòng máy và đơn vị sửa, thông báo qua Zalo hoặc Lark, CCDC quản lý theo số lượng | GĐ1 đã chạy ổn định qua ít nhất một đợt kiểm kê toàn chuỗi |
| Dài hạn | Dữ liệu vòng đời làm căn cứ cho quyết định mua sắm: khi nào thay máy, dòng máy nào bền, bộ tài sản chuẩn cho mỗi mô hình cửa hàng | Có dữ liệu sửa chữa và kiểm kê từ một năm vận hành trở lên |

Đích đến xa hơn là mỗi khoản đầu tư vào máy móc, thiết bị của chuỗi đều truy được: đang được dùng ở đâu, tốn bao nhiêu để duy trì, và khi nào nên thay.

## 3. Mục đích của EH-AM

- Một sổ tài sản số duy nhất cho cửa hàng, kho, xưởng rang và văn phòng (B-01).
- Một mã định danh cho mỗi tài sản: Asset ID và mã QR in trên nhãn, giữ nguyên suốt vòng đời (B-03, B-10).
- Một quy trình kiểm kê hằng tháng bằng điện thoại, bằng chứng được ghi ngay khi quét (B-11, B-13).
- Một chuỗi lịch sử di chuyển giữa kho, cửa hàng và nơi sửa chữa (B-14).
- Một luồng báo hỏng và sửa chữa có trạng thái, chi phí và đơn vị sửa (B-17, B-18, B-19).
- Một luồng thanh lý có phê duyệt, sang GĐ2 thì nối với ghi giảm trên FAST (B-20).
- Một bảng điều hành cho Ban giám đốc, Vận hành và quản lý các điểm (B-31 đến B-36).
- Một câu trả lời trong vài giây cho câu hỏi North Star khi quét bất kỳ tài sản nào (B-40).

## 4. Ý nghĩa với từng bên

| Đối tượng | Ý nghĩa |
| --- | --- |
| Ban giám đốc | Thấy số tài sản đang dùng, phân bổ theo điểm, số tài sản mất và hỏng trên một màn hình, số liệu cập nhật theo từng thao tác |
| Kế toán | Có danh sách tài sản vật lý đã kiểm để đối chiếu với sổ FAST; tài sản mất hoặc đã thanh lý được báo sớm để ghi giảm đúng kỳ |
| Vận hành và hành chính | Biết tài sản ở đâu và đang ở trạng thái nào; điều phối điều chuyển, sửa chữa có dấu vết; kết quả kiểm kê tự tổng hợp |
| Quản lý các điểm | Biết mình đang chịu trách nhiệm những tài sản nào; nhận hàng có biên nhận; báo hỏng trong vài thao tác |
| Nhân viên | Quét, chụp, xác nhận trên điện thoại thay cho biểu mẫu giấy |
| Kiểm soát nội bộ, kiểm toán | Tra được ai đổi gì, lúc nào, giá trị trước và sau, vì sao; mọi lần sửa dữ liệu đều để lại dấu vết |

## 5. Lý do cần thiết

Các vấn đề dưới đây suy ra từ brief và từ cách một chuỗi F&B nhiều điểm thường vận hành. Mức độ thật của từng vấn đề cần Every Half xác nhận bằng số liệu (Q-01).

1. Tài sản chưa có định danh dán trên thân máy. Cùng một máy xuất hiện ở nhiều điểm qua thời gian mà không nối được các lần đó với nhau, nên không trả lời được "máy này đang ở đâu" (B-02, B-03).
2. Vị trí trên sổ không đổi theo thực tế. Tài sản đi lại giữa kho, cửa hàng, xưởng rang và đơn vị sửa chữa nhưng không có bước "nhận" bắt buộc (B-14, B-15).
3. Kiểm kê hằng tháng tốn thời gian ca và khó kiểm chứng. Không rõ ai kiểm, lúc nào, có đến tận nơi hay không (B-11, B-13).
4. Sổ vận hành và sổ kế toán nằm ở hai nơi, không có khoá liên kết. Tài sản đã mất hoặc đã thanh lý có thể vẫn nằm trên sổ FAST và vẫn bị trích khấu hao (B-20, B-28, B-36).
5. Thanh lý và ghi giảm không đi chung một luồng có trạng thái, nên việc ghi giảm phụ thuộc trí nhớ của người làm (B-20).
6. Sự cố và chi phí sửa không được ghi theo tài sản, lần sửa và đơn vị sửa, nên không so được máy nào, đơn vị nào tốn kém (B-18).
7. Dữ liệu bị sửa đè không để lại dấu, nên khi mất mát xảy ra thì không quy được trách nhiệm (B-37, B-38).
8. Số điểm tăng thì cách quản lý bằng bảng tính càng khó theo kịp; tốc độ mở điểm mới cần Every Half cho biết (Q-02).

## 6. Chuyển đổi mô hình

| Cách làm hiện tại (giả định, cần xác nhận) | Cách làm với EH-AM |
| --- | --- |
| Bảng tính rời theo từng bộ phận | Một sổ tài sản dùng chung, phân quyền theo vai trò và location |
| Nhận diện tài sản bằng mô tả | Asset ID và mã QR dán trên tài sản |
| Kiểm kê trên giấy, tổng hợp bằng tay | Quét QR theo đợt kiểm kê, bằng chứng ghi ngay, kết quả tổng hợp tự động |
| Điều chuyển báo miệng hoặc qua tin nhắn | Phiếu điều chuyển; bên nhận quét QR để xác nhận đã nhận hàng |
| Báo hỏng qua tin nhắn | Phiếu sửa chữa gắn với tài sản, có trạng thái và chi phí |
| Thanh lý qua email hoặc giấy tờ | Đề nghị, phê duyệt, thực hiện; sang GĐ2 thì ghi giảm trên FAST |
| Đối chiếu với FAST vào cuối năm | Đối soát theo kỳ, chênh lệch hiện trên dashboard (GĐ2) |
| Sửa dữ liệu không để lại dấu | Mỗi thay đổi có người làm, thời điểm, giá trị trước và sau, lý do |

Cột bên trái dựa trên giả định A-10 về dữ liệu hiện có; Every Half sửa lại cột này ở buổi làm rõ yêu cầu.

## 7. Vai trò đúng và ranh giới của hệ thống

- EH-AM giữ dữ liệu vận hành và tài sản vật lý; FAST giữ sổ kế toán (B-26, B-27). EH-AM không hạch toán, không lập báo cáo tài chính, không tính thuế.
- EH-AM không quản lý mua sắm (đề xuất mua, duyệt mua, đặt hàng). Hồ sơ tài sản chỉ lưu tham chiếu hoá đơn hoặc PO (B-05). [Đề xuất]
- Nguyên vật liệu và hàng tiêu hao (cà phê nhân, sữa, ly giấy) thuộc hệ thống kho hoặc POS. [Đề xuất]
- Hệ thống ghi nhận và thực thi quyết định của người có thẩm quyền. Thanh lý, xác nhận mất và ghi giảm đều do người duyệt quyết định.
- Nhà cung cấp và đơn vị sửa chữa không đăng nhập ở GĐ1; họ là danh mục đối tác (A-07). [Đề xuất]

Bối cảnh hệ thống:

| Hệ thống | Quan hệ với EH-AM | Giai đoạn |
| --- | --- | --- |
| FAST | Đồng bộ theo ma trận sở hữu dữ liệu: mã tài sản, nguyên giá, phân loại, khấu hao, cost center, ghi giảm | GĐ2 |
| Email | Xác nhận tài khoản, đặt lại mật khẩu, thông báo | GĐ1 |
| Supabase Storage | Ảnh tài sản, ảnh bằng chứng kiểm kê, chứng từ | GĐ1 |
| Máy in nhãn | In nhãn QR theo lô từ file EH-AM xuất ra | GĐ1 |
| Zalo, Lark | Kênh thông báo, tuỳ câu trả lời Q-23 | GĐ3 |
| POS, hệ thống nhân sự | Không tích hợp trong phạm vi hiện tại | Không có |

# PHẦN II. Người dùng và giá trị cho từng bên

Chín nhóm người dùng, mỗi nhóm có một vai trò hệ thống, một phạm vi location và một không gian làm việc.

> **Tuyên bố thiết kế**
> Mỗi nhóm người dùng dưới đây là một tác nhân trong use case. Tên nhóm và mã vai trò được dùng y nguyên trong mọi tài liệu sau blueprint.

## 8. Các nhóm người dùng

| # | Nhóm người dùng | Mã vai trò đề xuất | Phạm vi | Không gian làm việc | Nhu cầu cốt lõi |
| --- | --- | --- | --- | --- | --- |
| 1 | Ban giám đốc | `EXECUTIVE` | Toàn hệ thống | Web quản trị | Xem tổng tài sản, phân bổ theo điểm, tài sản mất và hỏng; duyệt thanh lý theo hạn mức (Q-08) |
| 2 | Kế toán trưởng | `CHIEF_ACCOUNTANT` | Toàn hệ thống | Web quản trị | Chốt chính sách kế toán tài sản, duyệt điều chỉnh thông tin tài chính; ở GĐ2 phụ trách khấu hao và FAST |
| 3 | Kế toán tài sản | `ASSET_ACCOUNTANT` | Toàn hệ thống | Web quản trị | Nhập và điều chỉnh nguyên giá, hoá đơn, chứng từ; ở GĐ2 liên kết mã FAST và đối soát |
| 4 | Quản lý tài sản | `ASSET_MANAGER` | Toàn hệ thống | Web quản trị, app quét | Lập hồ sơ, in nhãn, điều phối điều chuyển và sửa chữa, tổ chức đợt kiểm kê, rà kết quả |
| 5 | Quản lý điểm | `LOCATION_MANAGER` | Các location được gán | App quét, web quản trị | Chịu trách nhiệm tài sản tại điểm; xuất và nhận hàng; duyệt kết quả kiểm kê của điểm; báo hỏng; đề nghị thanh lý |
| 6 | Nhân viên điểm | `LOCATION_STAFF` | Một location | App quét | Quét kiểm kê, báo hỏng, tra cứu tài sản bằng QR |
| 7 | Kỹ thuật viên | `TECHNICIAN` | Toàn hệ thống | App quét, web quản trị | Nhận yêu cầu sửa, cập nhật tiến độ, ghi kết quả sửa; chỉ có khi Every Half có đội kỹ thuật nội bộ (Q-14) |
| 8 | Kiểm soát nội bộ | `AUDITOR` | Toàn hệ thống, chỉ đọc | Web quản trị | Tra nhật ký thay đổi theo tài sản, người, thời gian; xuất báo cáo |
| 9 | Quản trị hệ thống | `SYSTEM_ADMIN` | Toàn hệ thống | Web quản trị | Tạo tài khoản, gán vai trò theo location, quản lý danh mục nền và cấu hình |

Quản lý điểm gồm quản lý cửa hàng, thủ kho, quản lý xưởng rang và người phụ trách văn phòng. Họ dùng chung một vai trò vì quyền của họ giống nhau và chỉ khác nhau ở loại location. Nhà cung cấp và đơn vị sửa chữa là danh mục đối tác, không có tài khoản ở GĐ1 (A-07).

Code hiện có bốn mã vai trò tạm trong `role.enum.ts` (`SYSTEM_ADMIN`, `ASSET_MANAGER`, `LOCATION_MANAGER`, `LOCATION_STAFF`). Năm mã còn lại sẽ thêm vào code sau khi Every Half duyệt bảng này (Q-16, Q-17).

## 9. Hợp đồng thiết kế cho từng nhóm người dùng

Trước khi thiết kế màn hình cho một nhóm người dùng, đội triển khai phải có đủ:

- Persona, mục tiêu, việc làm hằng ngày và thiết bị họ dùng.
- Hành trình từ lần đăng nhập đầu tiên tới việc họ làm thường xuyên nhất.
- Màn hình chính, chỉ số, cảnh báo và thao tác nhanh.
- Vai trò, phạm vi location, dữ liệu được xem và dữ liệu bị ẩn (ví dụ nguyên giá, Q-16).
- Thông báo họ nhận và kênh nhận thông báo.
- Use case, tiêu chí nghiệm thu, trạng thái lỗi và dòng audit mà thao tác của họ sinh ra.

> **Quy tắc UX cấp hệ thống**
> Mỗi nhóm người dùng chỉ thấy dữ liệu và thao tác thuộc vai trò của mình. Menu và nút ngoài quyền bị ẩn theo quyền mà máy chủ trả về; ẩn trên giao diện là lớp phòng vệ thứ hai, lớp thứ nhất là kiểm quyền ở máy chủ.

## 10. Vòng đời tài sản chuẩn hoá

1. Nhận tài sản về và lập hồ sơ, nhập tay hoặc nhập từ file (B-03 đến B-08).
2. In và dán nhãn QR (B-10).
3. Đưa vào sử dụng tại một location, gán người chịu trách nhiệm (B-07).
4. Kiểm kê hằng tháng tại location (B-11, B-12, B-13).
5. Điều chuyển giữa các location; bên nhận quét QR để xác nhận (B-14, B-15).
6. Báo hỏng, sửa chữa, nghiệm thu, đưa lại vào sử dụng (B-17, B-18, B-19).
7. Ghi nhận mất sau khi xác minh (B-12).
8. Đề nghị, duyệt và thực hiện thanh lý (B-20).
9. Ghi giảm trên FAST ở GĐ2 và lưu trữ hồ sơ (B-20, B-29).

Qua mọi bước, tài sản giữ nguyên Asset ID, và bản ghi của bước trước không bị ghi đè.

## 11. Kiến trúc giá trị đa phía

| Bên tham gia | Đóng góp vào hệ thống | Nhận lại |
| --- | --- | --- |
| Ban giám đốc | Quyết định phạm vi, hạn mức duyệt thanh lý, chỉ đạo việc quét trở thành việc của ca (A-17) | Số liệu tài sản theo điểm đủ tin để quyết định mua, thay, thanh lý |
| Kế toán | Chính sách kế toán, danh sách tài sản trên FAST, nguyên giá | Danh sách vật lý đã kiểm để đối chiếu; báo mất và thanh lý đúng lúc |
| Vận hành | Danh mục điểm, phân công kiểm kê, điều phối điều chuyển và sửa chữa | Ít việc tổng hợp tay; mọi điều phối có dấu vết |
| Quản lý điểm | Nhận hàng, duyệt kết quả kiểm kê, báo hỏng | Trách nhiệm rõ ràng; biên nhận khi nhận hàng; biết tài sản nào đang ở điểm mình |
| Nhân viên điểm | Lượt quét, ảnh chụp, tình trạng quan sát được | Làm vài thao tác trên điện thoại thay cho biểu mẫu giấy |
| Kiểm soát nội bộ | Yêu cầu về dấu vết và báo cáo | Nhật ký tra được theo tài sản, người, thời gian |
| Đội triển khai | Thiết kế, xây dựng, vận hành hệ thống | Phạm vi rõ theo module và use case, ít phải sửa đi sửa lại |

# PHẦN III. Kiến trúc sản phẩm và 12 module

Bản đồ sản phẩm để Product, UX, backend, frontend và QA cùng làm theo một phạm vi.

> **Tuyên bố thiết kế**
> Mỗi tính năng dưới đây có một mã `F-`, mỗi quy tắc có một mã `BR-`. Use case, story và test case tham chiếu theo các mã này; một yêu cầu không có mã thì chưa nằm trong phạm vi.

## 12. Kiến trúc sản phẩm theo lớp

### 12.1. Lớp hiện trường: app quét trên điện thoại

Web chạy trên trình duyệt điện thoại, dùng camera để quét mã QR, dành cho nhân viên và quản lý tại điểm.

- Quét QR để tra cứu tài sản
- Quét kiểm kê theo đợt, chụp ảnh bằng chứng
- Quét xuất giao và xác nhận nhận hàng
- Báo hỏng bằng quét QR
- Xác nhận dán nhãn
- Hàng đợi gửi lại khi mạng chập chờn
- Hộp việc cần làm và thông báo

### 12.2. Lớp văn phòng: web quản trị

Web trên máy tính cho Vận hành, Kế toán, Ban giám đốc và quản trị hệ thống.

- Hồ sơ tài sản, nhập danh sách từ file, in nhãn theo lô
- Phiếu điều chuyển, phiếu sửa chữa, đề nghị thanh lý
- Lập và theo dõi đợt kiểm kê, xử lý chênh lệch
- Dashboard và xuất báo cáo
- Danh mục nền, người dùng, vai trò theo location
- Tra cứu nhật ký thay đổi

### 12.3. Lớp nghiệp vụ

- Máy trạng thái của tài sản và của từng loại phiếu (kiểm kê, điều chuyển, sửa chữa, thanh lý)
- Quy tắc duyệt và phân tách nhiệm vụ
- Quy tắc phạm vi location cho mọi thao tác và mọi danh sách
- Job chạy theo lịch: mở đợt kiểm kê, nhắc hạn, cảnh báo quá hạn

### 12.4. Lớp dữ liệu và bằng chứng

- Sổ tài sản và các phiếu
- Lịch sử sự kiện của từng tài sản, chỉ ghi thêm
- Nhật ký thay đổi (audit), chỉ ghi thêm
- Kho tệp: ảnh tài sản, ảnh bằng chứng kiểm kê, chứng từ

### 12.5. Lớp tích hợp

- Email cho tài khoản và thông báo (GĐ1)
- Kho tệp Supabase Storage (GĐ1)
- File in nhãn cho máy in nhãn (GĐ1)
- FAST (GĐ2)
- Zalo hoặc Lark cho thông báo (GĐ3)

### 12.6. Lớp nền tảng và kiểm soát

- Xác thực, phiên đăng nhập, mật khẩu
- Phân quyền theo vai trò và theo location, kiểm ở máy chủ
- Thông báo lỗi và giao diện hai ngôn ngữ, tiếng Việt mặc định
- Giới hạn tần suất, ghi log có mã request, sao lưu

## 13. Bản đồ 12 module

| Mã | Module | Mục tiêu | Người dùng chính | GĐ | Nguồn brief |
| --- | --- | --- | --- | --- | --- |
| M01 | Người dùng và phân quyền | Tài khoản riêng cho từng người, vai trò gán theo location, thu hồi được ngay | Quản trị hệ thống | GĐ1 | B-39 |
| M02 | Danh mục nền | Location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa, lý do dùng chung | Quản trị hệ thống, Quản lý tài sản | GĐ1 | B-01, B-05, B-07, B-18 |
| M03 | Hồ sơ tài sản và CCDC | Hồ sơ đủ trường, trạng thái vòng đời, tình trạng vật lý, chứng từ, lịch sử | Quản lý tài sản, Kế toán tài sản | GĐ1 | B-03 đến B-09 |
| M04 | QR và nhãn | Mã QR riêng cho từng tài sản, in nhãn, quét ra ngay thông tin | Quản lý tài sản, Nhân viên điểm | GĐ1 | B-03, B-10, B-40 |
| M05 | Kiểm kê | Kiểm kê hằng tháng bằng quét QR, có bằng chứng, chênh lệch được xử lý tới cùng | Quản lý điểm, Nhân viên điểm, Quản lý tài sản | GĐ1 | B-11, B-12, B-13, B-35 |
| M06 | Điều chuyển | Mọi lần đổi chỗ đi qua phiếu; vị trí chỉ đổi khi bên nhận quét xác nhận | Quản lý tài sản, Quản lý điểm | GĐ1 | B-14, B-15, B-16 |
| M07 | Báo hỏng, sửa chữa và bảo trì | Báo hỏng bằng QR, phiếu sửa có trạng thái, chi phí, đơn vị sửa, nghiệm thu | Nhân viên điểm, Quản lý tài sản, Kỹ thuật viên | GĐ1 | B-17, B-18, B-19 |
| M08 | Thanh lý và báo giảm | Đề nghị, duyệt, thực hiện thanh lý; xác nhận mất có duyệt | Quản lý điểm, Quản lý tài sản, Ban giám đốc | GĐ1 | B-09, B-20 |
| M09 | Khấu hao và phân bổ | Nguyên giá, khấu hao tháng, luỹ kế, giá trị còn lại theo kỳ | Kế toán trưởng, Kế toán tài sản | GĐ2 | B-06, B-21 đến B-25 |
| M10 | Tích hợp FAST | Liên kết mã FAST, đồng bộ theo ma trận sở hữu, nhật ký, đối soát | Kế toán tài sản | GĐ2 | B-26 đến B-30 |
| M11 | Dashboard và báo cáo | Số tài sản, phân bổ, mất hỏng, tiến độ kiểm kê; giá trị và chênh lệch FAST ở GĐ2 | Ban giám đốc, Quản lý tài sản, Quản lý điểm | GĐ1 | B-31 đến B-36 |
| M12 | Nhật ký, lịch sử và thông báo | Dấu vết đủ năm yếu tố, tra được; việc cần làm đến đúng người | Kiểm soát nội bộ, mọi vai trò | GĐ1 | B-16, B-37, B-38 |

MVP1 gồm mười module GĐ1. M09 và M10 thuộc GĐ2, được đặc tả ở đây để các module GĐ1 chừa sẵn chỗ nối (trường mã FAST, mã nhóm FAST của loại tài sản, trạng thái ghi giảm), nhưng không có use case và không được xây trong MVP1 (D-04).

## 14. Đặc tả chức năng 12 module

Mỗi module có bảng tóm tắt, danh sách tính năng, quy tắc nghiệp vụ và phần ngoài phạm vi khi cần. Các quy tắc dưới đây áp cho mọi module và không nhắc lại trong từng module.

| Mã | Quy tắc chung | Nguồn |
| --- | --- | --- |
| BR-CMN-01 | Không xoá dữ liệu nghiệp vụ. "Xoá" trên giao diện là đổi trạng thái kèm lý do | [Brief] B-16, B-37 |
| BR-CMN-02 | Mọi thay đổi dữ liệu nghiệp vụ và phân quyền ghi một dòng nhật ký: người làm, thời điểm theo giờ máy chủ, đối tượng, giá trị trước và sau, lý do | [Brief] B-38 |
| BR-CMN-03 | Mọi thao tác và mọi danh sách được kiểm quyền theo vai trò và phạm vi location ở máy chủ. Người không có vai trò trên một location thì không thấy dữ liệu của location đó | [Brief] B-39 |
| BR-CMN-04 | Location của một thao tác lấy từ tài nguyên đang thao tác (tài sản, phiếu), không lấy từ thông tin điện thoại gửi lên | [Đề xuất] |
| BR-CMN-05 | Thời điểm ghi nhận theo giờ máy chủ. Kỳ (tháng kiểm kê, kỳ khấu hao) tính theo giờ Việt Nam | [Đề xuất] |
| BR-CMN-06 | Nguyên giá và giá trị còn lại chỉ hiện với Ban giám đốc, Kế toán trưởng, Kế toán tài sản, Quản lý tài sản, Kiểm soát nội bộ; vai trò khác thấy hồ sơ không kèm giá trị (Q-16) | [Đề xuất] |
| BR-CMN-07 | Mỗi phiếu (kiểm kê, điều chuyển, sửa chữa, thanh lý) có mã riêng và trạng thái theo bảng chuyển trạng thái; trạng thái không sửa được ngoài luồng | [Đề xuất] |
| BR-CMN-08 | Người đề nghị không tự duyệt đề nghị của chính mình | [Đề xuất] |
| BR-CMN-09 | Lượt gửi từ điện thoại có mã chống trùng; gửi lại cùng một lượt không tạo bản ghi thứ hai | [Đề xuất] |
| BR-CMN-10 | Thao tác cần lý do dùng danh mục lý do chuẩn, kèm ô ghi thêm khi chọn "Khác" | [Đề xuất] |

### 14.1. M01: Người dùng và phân quyền

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Mỗi người dùng có một tài khoản riêng; vai trò gán trên toàn hệ thống hoặc trên từng location, có ngày hiệu lực, thu hồi được ngay |
| Người dùng chính | Quản trị hệ thống; mọi người dùng cho đăng nhập và mật khẩu |
| Nguồn trong brief | B-39: phân quyền theo vai trò và theo location |
| KPI cốt lõi | Số tài khoản còn hoạt động của người đã nghỉ việc (mục tiêu bằng không); thời gian từ khi nhân viên nghỉ tới khi tài khoản bị khoá |
| Giai đoạn | GĐ1. Code đã có đăng ký, xác nhận email, đăng nhập, làm mới phiên, đăng xuất một hoặc mọi thiết bị, quên, đặt lại, đổi mật khẩu, xem hồ sơ cá nhân |
| Đầu ra kỹ thuật | Bảng `user_profiles`, `context_role_assignments` (migration 01); API `/v1/auth`, `/v1/users`, `/v1/role-assignments`; sự kiện audit `auth.*`, `iam.*`; test phân quyền cả trường hợp được phép và bị từ chối |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-IAM-01 | Đăng nhập và phiên làm việc | Đăng nhập bằng email và mật khẩu; phiên tự làm mới; đăng xuất thiết bị đang dùng hoặc mọi thiết bị | GĐ1 | [Đề xuất], đã có trong code |
| F-IAM-02 | Quản lý mật khẩu | Quên mật khẩu qua email, đặt lại bằng đường dẫn khôi phục, đổi mật khẩu khi đang đăng nhập | GĐ1 | [Đề xuất], đã có trong code |
| F-IAM-03 | Tạo và mời tài khoản | Quản trị hệ thống tạo tài khoản cho nhân viên và gửi email kích hoạt. Đăng ký công khai hiện có trong code sẽ đóng khi D-01 được duyệt | GĐ1 | [Đề xuất] |
| F-IAM-04 | Gán và thu hồi vai trò theo location | Gán vai trò toàn hệ thống hoặc vai trò trên từng location, có ngày bắt đầu và ngày kết thúc; thu hồi bằng cách đóng hiệu lực | GĐ1 | [Brief] B-39 |
| F-IAM-05 | Khoá và mở khoá tài khoản | Tạm khoá hoặc ngừng tài khoản khi nhân viên nghỉ việc hay có sự cố, có lý do; mở khoá lại khi cần | GĐ1 | [Đề xuất] |
| F-IAM-06 | Hồ sơ cá nhân và ngôn ngữ | Xem thông tin tài khoản và vai trò đang có; đổi ngôn ngữ hiển thị giữa tiếng Việt và tiếng Anh | GĐ1 | [Đề xuất], đã có một phần |
| F-IAM-07 | Tra cứu người dùng | Danh sách người dùng, lọc theo location, vai trò, trạng thái tài khoản | GĐ1 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-IAM-01 | Mỗi người một tài khoản; không dùng chung tài khoản giữa nhân viên (A-09) | [Đề xuất] |
| BR-IAM-02 | Tài khoản mới chưa có vai trò nào; chưa được gán vai trò thì không thấy dữ liệu của location nào | [Đề xuất], đã có trong code |
| BR-IAM-03 | Dòng phân quyền chỉ được đóng hiệu lực, không sửa và không xoá; việc thu hồi ghi người thu hồi và lý do | [Brief] B-37 |
| BR-IAM-04 | Tài khoản bị khoá hoặc ngừng mất quyền ngay ở thao tác kế tiếp, kể cả khi phiên đăng nhập chưa hết hạn | [Đề xuất], đã có trong code |
| BR-IAM-05 | Vai trò Quản trị hệ thống chỉ được cấp qua script khởi tạo có người chịu trách nhiệm, không cấp qua màn hình | [Đề xuất], đã có trong code |
| BR-IAM-06 | Mật khẩu dài ít nhất 8 ký tự, có chữ, số và ký tự đặc biệt | [Đề xuất], đã có trong code |
| BR-IAM-07 | Đăng nhập sai nhiều lần bị giới hạn tần suất; thông báo lỗi và thông báo gửi email không cho biết email có tồn tại hay không | [Đề xuất], đã có trong code |
| BR-IAM-08 | Vai trò theo location chỉ gán được trên location đang hoạt động; người được gán vai trò Quản lý điểm trên nhiều location thấy dữ liệu của tất cả các location đó | [Đề xuất] |

Trạng thái tài khoản: Đang hoạt động, Tạm khoá, Đã ngừng (mã ở Phụ lục B).

Ngoài phạm vi: đăng nhập một lần qua hệ thống của Every Half (SSO) thuộc GĐ3; xác thực hai lớp cân nhắc cho vai trò duyệt thanh lý ở GĐ3.

### 14.2. M02: Danh mục nền

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Một bộ danh mục chuẩn dùng chung cho mọi module: location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa, lý do thao tác |
| Người dùng chính | Quản trị hệ thống, Quản lý tài sản; Kế toán trưởng góp ý cost center và loại tài sản |
| Nguồn trong brief | B-01 (bốn loại điểm), B-05 (nhà cung cấp), B-07 (location, cost center), B-18 (đơn vị cung cấp dịch vụ sửa chữa) |
| KPI cốt lõi | Không có tài sản nào gắn với location, cost center hoặc loại đã ngừng hoạt động |
| Giai đoạn | GĐ1 |
| Đầu ra kỹ thuật | Bảng `locations`, `cost_centers`, `asset_categories`, `suppliers`, `repair_vendors`, `reason_codes`; API `/v1/master-data/*`; sự kiện audit `mdm.*` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-MDM-01 | Quản lý location | Tạo, sửa location thuộc năm loại: cửa hàng, kho, xưởng rang, văn phòng, bên ngoài (đơn vị sửa chữa); mỗi location có mã, tên, địa chỉ, cost center mặc định | GĐ1 | [Brief] B-01, B-07 |
| F-MDM-02 | Đóng location | Ngừng hoạt động location khi đóng cửa hàng hay kho; chỉ đóng được khi không còn tài sản đang ghi tại đó và không còn phiếu mở | GĐ1 | [Đề xuất] |
| F-MDM-03 | Quản lý cost center | Tạo, sửa, ngừng cost center; mã cost center khớp với FAST để dùng ở GĐ2 | GĐ1 | [Brief] B-07 |
| F-MDM-04 | Quản lý loại tài sản | Cây phân loại hai cấp (nhóm, loại); mỗi loại có cờ TSCĐ hoặc CCDC, cờ bắt buộc serial, thời gian sử dụng tham khảo, mã nhóm FAST để dùng ở GĐ2 | GĐ1 | [Brief] B-04 |
| F-MDM-05 | Quản lý nhà cung cấp | Danh mục nhà cung cấp tài sản: tên, mã số thuế, người liên hệ | GĐ1 | [Brief] B-05 |
| F-MDM-06 | Quản lý đơn vị sửa chữa | Danh mục đơn vị sửa chữa và bảo hành: tên, liên hệ, loại dịch vụ; mỗi đơn vị gắn với một location loại "bên ngoài" để tài sản được điều chuyển tới (D-02) | GĐ1 | [Brief] B-18 |
| F-MDM-07 | Quản lý danh mục lý do | Danh sách lý do chuẩn cho điều chỉnh hồ sơ, điều chuyển, thanh lý, khoá tài khoản, in lại nhãn | GĐ1 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-MDM-01 | Mã location, mã cost center, mã loại tài sản là duy nhất và không dùng lại sau khi ngừng | [Đề xuất] |
| BR-MDM-02 | Danh mục chỉ ngừng hoạt động, không xoá; mục đã ngừng vẫn hiện đúng tên trong lịch sử cũ | [Brief] B-37 |
| BR-MDM-03 | Location chỉ đóng được khi không còn tài sản ở trạng thái đang ghi tại đó và không còn phiếu kiểm kê, điều chuyển, sửa chữa đang mở | [Đề xuất] |
| BR-MDM-04 | Mỗi location có đúng một cost center mặc định; tài sản chuyển tới location nhận cost center của location đó, trừ khi tài sản có cost center riêng do Kế toán tài sản đặt (A-08) | [Đề xuất] |
| BR-MDM-05 | Tài sản đang ở location bên ngoài không thuộc đợt kiểm kê của điểm nào; người chịu trách nhiệm trong thời gian đó là Quản lý tài sản | [Đề xuất] |
| BR-MDM-06 | Loại tài sản đã có tài sản gắn vào thì không đổi được cờ TSCĐ hoặc CCDC; muốn đổi thì tạo loại mới và chuyển từng tài sản có lý do | [Đề xuất] |

Ngoài phạm vi: cấp vùng hoặc khu vực trên location chờ câu trả lời Q-17; nếu có, thêm một cấp nhóm location mà không đổi cách gán vai trò.

### 14.3. M03: Hồ sơ tài sản và CCDC

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Mỗi tài sản cần quản lý có một hồ sơ đủ trường, một trạng thái vòng đời, một tình trạng vật lý và dòng thời gian mọi sự kiện |
| Người dùng chính | Quản lý tài sản lập và sửa hồ sơ; Kế toán tài sản nhập thông tin tài chính; Quản lý điểm xem tài sản của điểm mình |
| Nguồn trong brief | B-02 đến B-09 |
| KPI cốt lõi | Tỷ lệ tài sản có hồ sơ đủ trường bắt buộc; số hồ sơ trùng serial (mục tiêu bằng không) |
| Giai đoạn | GĐ1 |
| Đầu ra kỹ thuật | Bảng `assets`, `asset_events` (chỉ ghi thêm), `asset_documents`; API `/v1/assets`; mapper riêng cho bản quét, bản chi tiết, bản có giá trị; sự kiện audit `asset.*` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-AST-01 | Tạo hồ sơ tài sản | Nhập thông tin mô tả (tên, loại, serial, ảnh), thông tin mua (ngày mua, nhà cung cấp, số hoá đơn hoặc PO), vị trí ban đầu (location, người chịu trách nhiệm); hệ thống cấp Asset ID | GĐ1 | [Brief] B-03, B-04, B-05, B-07 |
| F-AST-02 | Nhập danh sách tài sản từ file | Tải file Excel theo mẫu, hệ thống kiểm từng dòng, cho xem trước, nhập các dòng hợp lệ và trả báo cáo dòng lỗi | GĐ1 | [Đề xuất], phục vụ chuyển đổi dữ liệu ở §35 |
| F-AST-03 | Cập nhật thông tin mô tả | Sửa tên, loại, serial, ảnh, ghi chú; không sửa location ở đây | GĐ1 | [Brief] B-04 |
| F-AST-04 | Cập nhật thông tin tài chính | Nhập hoặc điều chỉnh nguyên giá, ngày bắt đầu sử dụng, thời gian sử dụng, cost center riêng; bắt buộc lý do và chứng từ | GĐ1 | [Brief] B-06 |
| F-AST-05 | Đổi người chịu trách nhiệm | Chuyển trách nhiệm tài sản cho người khác trong cùng location, có lý do | GĐ1 | [Brief] B-07 |
| F-AST-06 | Đính kèm chứng từ | Tải lên hoá đơn, PO, biên bản bàn giao, phiếu bảo hành, ảnh; xem và tải về theo quyền | GĐ1 | [Brief] B-08 |
| F-AST-07 | Tra cứu và lọc tài sản | Danh sách trong phạm vi location của người dùng; tìm theo tên, Asset ID, serial; lọc theo loại, trạng thái, tình trạng, location | GĐ1 | [Brief] B-02 |
| F-AST-08 | Xem hồ sơ và dòng thời gian | Hồ sơ đầy đủ theo quyền, kèm dòng thời gian mọi sự kiện: tạo, dán nhãn, điều chuyển, kiểm kê, sửa chữa, thay đổi dữ liệu | GĐ1 | [Brief] B-02, B-40 |
| F-AST-09 | Huỷ hồ sơ tạo sai | Đưa hồ sơ tạo nhầm hoặc trùng sang trạng thái Hủy, có lý do và người duyệt; hồ sơ vẫn còn trong lịch sử | GĐ1 | [Brief] B-09 |
| F-AST-10 | Xuất danh sách tài sản | Xuất Excel theo bộ lọc; file chỉ có các cột người xuất được xem | GĐ1 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-AST-01 | Asset ID do hệ thống cấp, duy nhất, không đổi và không dùng lại, kể cả sau khi tài sản thanh lý | [Brief] B-03 |
| BR-AST-02 | Trường bắt buộc khi tạo: tên, loại, location, người chịu trách nhiệm, trạng thái ban đầu (Lưu kho hoặc Đang sử dụng); serial bắt buộc với loại có cờ "bắt buộc serial" | [Đề xuất] |
| BR-AST-03 | Serial không được trùng trong cùng một loại tài sản | [Đề xuất] |
| BR-AST-04 | Location của tài sản chỉ đổi qua điều chuyển có xác nhận nhận hàng; màn hình sửa hồ sơ không có trường location | [Brief] B-14, B-15 |
| BR-AST-05 | Thông tin tài chính chỉ Kế toán tài sản sửa, bắt buộc lý do; mỗi lần sửa lưu giá trị trước và sau | [Brief] B-06, B-38 |
| BR-AST-06 | Trạng thái chỉ đổi theo bảng chuyển trạng thái dưới đây; đổi tay chỉ có một trường hợp là huỷ hồ sơ tạo sai, cần Quản lý tài sản duyệt (Q-10) | [Brief] B-09 |
| BR-AST-07 | Tài sản ở trạng thái kết thúc (Đã thanh lý, Mất, Hủy) chỉ được xem; ngoại lệ duy nhất là luồng tìm thấy lại tài sản đã mất ở M08 | [Đề xuất] |
| BR-AST-08 | Nhập từ file: dòng lỗi không được nhập; các dòng hợp lệ được nhập, báo cáo liệt kê từng dòng bị bỏ và lý do | [Đề xuất] |
| BR-AST-09 | Người chịu trách nhiệm phải có vai trò trên location của tài sản | [Đề xuất] |
| BR-AST-10 | Tình trạng vật lý (Tốt, Hư hỏng nhẹ, Hư hỏng) tách khỏi trạng thái vòng đời; kiểm kê và sửa chữa cập nhật tình trạng mà không đổi trạng thái (D-06) | [Đề xuất] |

Trạng thái và chuyển trạng thái (mã ở Phụ lục B):

| Từ trạng thái | Sang trạng thái | Luồng |
| --- | --- | --- |
| Hồ sơ mới | Lưu kho hoặc Đang sử dụng | Tạo hồ sơ hoặc nhập từ file (M03) |
| Lưu kho, Đang sử dụng | Chờ điều chuyển | Tạo phiếu điều chuyển (M06) |
| Chờ điều chuyển | Đang vận chuyển | Xuất giao (M06) |
| Chờ điều chuyển | Trạng thái trước đó | Huỷ phiếu điều chuyển (M06) |
| Đang vận chuyển | Lưu kho, Đang sử dụng, Đang sửa chữa | Bên nhận xác nhận; tới đơn vị sửa chữa thì thành Đang sửa chữa (M06) |
| Lưu kho, Đang sử dụng | Đang sửa chữa | Tiếp nhận yêu cầu sửa tại chỗ (M07) |
| Đang sửa chữa | Lưu kho, Đang sử dụng | Nghiệm thu sau sửa (M07) |
| Lưu kho, Đang sử dụng | Nghi mất | Duyệt kết quả kiểm kê có tài sản không tìm thấy (M05) |
| Nghi mất | Lưu kho, Đang sử dụng | Tìm thấy khi xác minh (M05) |
| Nghi mất | Mất | Duyệt xác nhận mất (M08) |
| Lưu kho, Đang sử dụng, Đang sửa chữa | Chờ thanh lý | Duyệt đề nghị thanh lý (M08) |
| Chờ thanh lý | Đã thanh lý | Thực hiện thanh lý (M08) |
| Chờ thanh lý | Trạng thái trước đó | Huỷ đề nghị thanh lý (M08) |
| Mất | Đang sử dụng | Duyệt tìm thấy lại (M08) |
| Mọi trạng thái trừ Đã thanh lý, Mất | Hủy | Huỷ hồ sơ tạo sai, có duyệt (M03) |

Ngoài phạm vi: CCDC quản lý theo số lượng thay vì từng chiếc chờ Q-28 và thuộc GĐ3; tài sản cấu thành từ nhiều phần (máy và bộ phụ kiện) quản lý thành các hồ sơ riêng có ghi chú liên kết, không có quan hệ cha con ở GĐ1.

### 14.4. M04: QR và nhãn

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Mỗi tài sản có một mã QR riêng in từ Asset ID; quét QR là thấy ngay thông tin tài sản theo quyền |
| Người dùng chính | Quản lý tài sản in và quản lý nhãn; mọi người dùng có app quét để tra cứu |
| Nguồn trong brief | B-03, B-10, B-40 |
| KPI cốt lõi | Tỷ lệ tài sản đã dán nhãn và đã xác nhận; thời gian từ lúc quét tới lúc hiện thông tin (mục tiêu chốt sau pilot) |
| Giai đoạn | GĐ1 |
| Đầu ra kỹ thuật | Sinh QR phía máy chủ; bảng `label_batches`, `label_prints`; API `/v1/labels`, `/v1/scan/{assetId}`; sự kiện audit `label.*`, `scan.*` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-QR-01 | Sinh mã QR | Hệ thống sinh mã QR ngay khi hồ sơ được tạo; nội dung QR là đường dẫn tra cứu chứa Asset ID | GĐ1 | [Brief] B-10 |
| F-QR-02 | In nhãn theo lô | Chọn tài sản theo location, loại hoặc lần nhập; xuất file in nhãn theo khổ nhãn đã cấu hình; ghi nhận lô in | GĐ1 | [Đề xuất] |
| F-QR-03 | Xác nhận dán nhãn | Người dán quét nhãn vừa dán để xác nhận đúng tài sản; hồ sơ ghi đã dán nhãn, người dán, thời điểm | GĐ1 | [Đề xuất] |
| F-QR-04 | Quét QR tra cứu tài sản | Quét bằng camera điện thoại; hiện tài sản là gì, ở đâu, ai chịu trách nhiệm, tình trạng, lịch sử gần nhất; giá trị chỉ hiện với vai trò được xem | GĐ1 | [Brief] B-40 |
| F-QR-05 | Nhập mã thay cho quét | Gõ Asset ID khi nhãn mờ hoặc camera không đọc được | GĐ1 | [Đề xuất] |
| F-QR-06 | In lại nhãn | Nhãn hỏng hoặc mất thì in lại cùng mã QR, bắt buộc lý do | GĐ1 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-QR-01 | Nội dung QR chỉ là đường dẫn tra cứu chứa Asset ID; không chứa tên, giá trị hay dữ liệu cá nhân | [Đề xuất] |
| BR-QR-02 | Quét chỉ trả thông tin khi người quét đã đăng nhập; thông tin trả về theo vai trò và phạm vi location | [Brief] B-39, B-40 |
| BR-QR-03 | Quét tài sản của location khác chỉ hiện thông tin nhận diện: Asset ID, tên, loại, location đang ghi; đủ để ghi kết quả "sai vị trí" khi kiểm kê | [Đề xuất] |
| BR-QR-04 | In lại nhãn không tạo Asset ID mới; mỗi lần in lại ghi người in và lý do | [Đề xuất] |
| BR-QR-05 | Mã QR không thuộc hệ thống, hoặc thuộc tài sản đã thanh lý, mất, huỷ, được báo rõ cho người quét và ghi vào nhật ký | [Đề xuất] |
| BR-QR-06 | Khổ nhãn và chất liệu nhãn theo khu vực dùng (quầy bar cần nhãn chịu nhiệt và ẩm) do Vận hành chốt (Q-22) | [Đề xuất] |

Ngoài phạm vi: nhãn RFID hoặc NFC; in nhãn trực tiếp từ trình duyệt tới máy in nhãn mà không qua file.

### 14.5. M05: Kiểm kê

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Mỗi location kiểm kê hằng tháng bằng quét QR; kết quả từng tài sản có bằng chứng; chênh lệch được xử lý tới cùng |
| Người dùng chính | Quản lý tài sản lập đợt và xử lý chênh lệch; Quản lý điểm duyệt kết quả của điểm; Nhân viên điểm quét |
| Nguồn trong brief | B-11, B-12, B-13, B-35 |
| KPI cốt lõi | Tỷ lệ location chốt kiểm kê đúng hạn; tỷ lệ tài sản được quét trong đợt; số tài sản nghi mất quá hạn chưa xử lý |
| Giai đoạn | GĐ1 |
| Đầu ra kỹ thuật | Bảng `stocktakes`, `stocktake_locations`, `stocktake_items`, `scan_records`; API `/v1/stocktakes`; hàng đợi gửi lại trên app quét; sự kiện audit `stocktake.*` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-STK-01 | Lập đợt kiểm kê | Tạo đợt kiểm kê cho các location, đặt hạn, phân công người kiểm; lúc mở đợt, hệ thống chốt danh sách tài sản dự kiến của từng location | GĐ1 | [Brief] B-11 |
| F-STK-02 | Mở đợt và nhắc hạn tự động | Hệ thống tự mở đợt theo lịch tháng nếu được cấu hình, và nhắc người được phân công trước hạn | GĐ1 | [Đề xuất] |
| F-STK-03 | Quét kiểm kê tại điểm | Nhân viên quét từng tài sản và chọn kết quả: có mặt, hư hỏng, sai vị trí; chụp ảnh; hệ thống ghi người quét, giờ máy chủ, toạ độ nếu được bật | GĐ1 | [Brief] B-12, B-13 |
| F-STK-04 | Ghi nhận tài sản lạ | Quét được tài sản đang ghi ở location khác, hoặc thấy tài sản chưa có nhãn: ghi nhận kèm ảnh để xử lý sau | GĐ1 | [Brief] B-12 |
| F-STK-05 | Chốt kết quả kiểm kê của điểm | Người kiểm gửi kết quả; tài sản trong danh sách mà chưa được quét được đánh dấu "không tìm thấy" | GĐ1 | [Brief] B-12 |
| F-STK-06 | Duyệt kết quả kiểm kê | Người duyệt rà kết quả của điểm, duyệt hoặc yêu cầu kiểm lại; khi duyệt, tài sản không tìm thấy chuyển "Nghi mất" | GĐ1 | [Đề xuất] |
| F-STK-07 | Xử lý chênh lệch | Quản lý tài sản xử lý từng chênh lệch: sai vị trí thì lập điều chuyển điều chỉnh; nghi mất thì xác minh, tìm thấy hoặc đề nghị xác nhận mất; hư hỏng thì báo hỏng | GĐ1 | [Đề xuất] |
| F-STK-08 | Báo cáo kiểm kê | Kết quả đợt theo điểm: số dự kiến, đã quét, có mặt, hư hỏng, sai vị trí, không tìm thấy; tiến độ cập nhật theo từng lượt quét | GĐ1 | [Brief] B-35 |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-STK-01 | Mỗi location có một đợt kiểm kê mỗi tháng (A-05, Q-12) | [Brief] B-11 |
| BR-STK-02 | Danh sách dự kiến của điểm được chốt lúc mở đợt: tài sản đang ghi ở location đó, trừ tài sản đang vận chuyển, đang ở location bên ngoài, hoặc ở trạng thái kết thúc | [Đề xuất] |
| BR-STK-03 | Mỗi tài sản trong một đợt có đúng một kết quả; quét lại thì kết quả sau thay kết quả trước, cả hai lượt quét đều được lưu | [Đề xuất] |
| BR-STK-04 | Kết quả "có mặt" và "hư hỏng" cần ảnh chụp bằng camera ngay lúc quét (Q-31) | [Brief] B-13 |
| BR-STK-05 | Toạ độ chỉ ghi khi Every Half bật tính năng và người dùng cho phép; thiếu toạ độ không chặn việc kiểm kê (Q-20) | [Brief] B-13 |
| BR-STK-06 | Kết quả của điểm do Quản lý điểm duyệt; nếu Quản lý điểm cũng là người kiểm thì Quản lý tài sản duyệt | [Đề xuất] |
| BR-STK-07 | Tài sản "Nghi mất" phải có kết luận (tìm thấy hoặc đề nghị xác nhận mất) trong thời hạn Every Half đặt (Q-13) | [Đề xuất] |
| BR-STK-08 | Đợt đã duyệt thì khoá kết quả; phát hiện sai sau đó xử lý bằng thao tác mới có lý do, không sửa kết quả cũ | [Brief] B-37 |

Trạng thái của một điểm trong đợt: Chưa bắt đầu, Đang kiểm, Đã chốt, Yêu cầu kiểm lại, Đã duyệt (mã ở Phụ lục B).

### 14.6. M06: Điều chuyển

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Mọi lần tài sản đổi chỗ đi qua phiếu điều chuyển; vị trí chỉ đổi khi bên nhận quét QR xác nhận |
| Người dùng chính | Quản lý tài sản tạo và theo dõi phiếu; Quản lý điểm xuất giao và nhận hàng |
| Nguồn trong brief | B-14, B-15, B-16 |
| KPI cốt lõi | Tỷ lệ phiếu nhận đủ trong hạn; số tài sản đang vận chuyển quá hạn |
| Giai đoạn | GĐ1 |
| Đầu ra kỹ thuật | Bảng `transfers`, `transfer_items`; API `/v1/transfers`; sự kiện audit `transfer.*`; job cảnh báo quá hạn nhận |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-TRF-01 | Tạo phiếu điều chuyển | Chọn tài sản bằng quét hoặc từ danh sách, chọn điểm gửi, điểm nhận (kể cả đơn vị sửa chữa), lý do, ngày dự kiến | GĐ1 | [Brief] B-14 |
| F-TRF-02 | Duyệt phiếu điều chuyển | Phiếu cần duyệt trước khi xuất khi thoả điều kiện Every Half đặt, ví dụ khác cost center hoặc tài sản giá trị cao (Q-36) | GĐ1 | [Đề xuất] |
| F-TRF-03 | Xuất giao tài sản | Điểm gửi quét từng tài sản khi giao cho người vận chuyển; tài sản chuyển "Đang vận chuyển" | GĐ1 | [Đề xuất] |
| F-TRF-04 | Xác nhận đã nhận hàng bằng QR | Điểm nhận quét từng tài sản để xác nhận; tài sản đổi location và cost center theo điểm nhận | GĐ1 | [Brief] B-15 |
| F-TRF-05 | Xử lý nhận thiếu, nhận hỏng | Ghi nhận tài sản không tới hoặc tới trong tình trạng hỏng; tài sản không tới được đưa vào xác minh, tài sản hỏng được báo hỏng | GĐ1 | [Đề xuất] |
| F-TRF-06 | Huỷ phiếu điều chuyển | Huỷ phiếu chưa xuất, có lý do; tài sản trở lại trạng thái trước | GĐ1 | [Đề xuất] |
| F-TRF-07 | Theo dõi phiếu và lịch sử điều chuyển | Danh sách phiếu theo trạng thái, cảnh báo quá hạn nhận; lịch sử di chuyển của từng tài sản | GĐ1 | [Brief] B-14 |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-TRF-01 | Tài sản chỉ đổi location qua phiếu điều chuyển | [Brief] B-14 |
| BR-TRF-02 | Location và cost center đổi tại thời điểm bên nhận xác nhận, không đổi lúc tạo phiếu hay lúc xuất | [Brief] B-15 |
| BR-TRF-03 | Phiếu điều chuyển thường chỉ nhận tài sản đang ở trạng thái Lưu kho hoặc Đang sử dụng; tài sản đang sửa chỉ đi theo phiếu gửi sửa hoặc nhận về từ sửa do M07 tạo | [Đề xuất] |
| BR-TRF-04 | Một tài sản chỉ nằm trong một phiếu điều chuyển đang mở tại một thời điểm | [Đề xuất] |
| BR-TRF-05 | Người xác nhận nhận hàng phải có vai trò trên location nhận; với đơn vị sửa chữa, Quản lý tài sản xác nhận thay | [Đề xuất] |
| BR-TRF-06 | Phiếu và lịch sử điều chuyển không xoá được; huỷ chỉ áp cho phiếu chưa xuất | [Brief] B-16 |
| BR-TRF-07 | Tài sản đang vận chuyển quá số ngày Every Half đặt thì cảnh báo Quản lý tài sản (Q-11) | [Đề xuất] |
| BR-TRF-08 | Gửi đi sửa và nhận về từ sửa dùng cùng luồng phiếu điều chuyển, tạo từ phiếu sửa chữa (D-02) | [Brief] B-14 |

Trạng thái phiếu điều chuyển: Nháp, Chờ duyệt, Đã duyệt, Đang vận chuyển, Nhận một phần, Đã nhận, Đã huỷ (mã ở Phụ lục B).

### 14.7. M07: Báo hỏng, sửa chữa và bảo trì

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Báo hỏng trong vài thao tác bằng quét QR; mỗi lần sửa có trạng thái, đơn vị sửa, chi phí và kết quả nghiệm thu |
| Người dùng chính | Nhân viên điểm và Quản lý điểm báo hỏng; Quản lý tài sản tiếp nhận và điều phối; Kỹ thuật viên sửa nội bộ |
| Nguồn trong brief | B-17, B-18, B-19 |
| KPI cốt lõi | Thời gian từ báo hỏng tới đưa lại vào sử dụng; chi phí sửa theo tài sản, loại tài sản và đơn vị sửa |
| Giai đoạn | GĐ1; bảo trì định kỳ ở GĐ3 |
| Đầu ra kỹ thuật | Bảng `repair_requests`, `repair_costs`; API `/v1/repairs`; tạo phiếu điều chuyển gửi sửa qua M06; sự kiện audit `repair.*` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-MNT-01 | Báo hỏng bằng quét QR | Quét tài sản, chọn mô tả hỏng, chụp ảnh, gửi; hệ thống tạo yêu cầu sửa chữa gắn với tài sản | GĐ1 | [Brief] B-17 |
| F-MNT-02 | Tiếp nhận và phân loại yêu cầu | Quản lý tài sản xem yêu cầu, tiếp nhận hoặc từ chối khi báo nhầm, chọn cách xử lý: sửa tại chỗ, gửi đơn vị sửa, giao kỹ thuật viên nội bộ; tài sản chuyển "Đang sửa chữa" khi tiếp nhận | GĐ1 | [Brief] B-19 |
| F-MNT-03 | Gửi tài sản đi sửa và nhận về | Từ phiếu sửa, tạo phiếu điều chuyển tới đơn vị sửa chữa và phiếu nhận về theo luồng M06 | GĐ1 | [Brief] B-14 |
| F-MNT-04 | Cập nhật tiến độ sửa chữa | Ghi trạng thái phiếu sửa: chờ báo giá, đang sửa, chờ linh kiện, đã sửa xong; kèm ghi chú và ảnh | GĐ1 | [Brief] B-19 |
| F-MNT-05 | Ghi chi phí và đơn vị sửa chữa | Ghi báo giá, chi phí thực tế, đơn vị sửa, hoá đơn; báo giá vượt ngưỡng cần duyệt trước khi sửa (Q-37) | GĐ1 | [Brief] B-18 |
| F-MNT-06 | Nghiệm thu và đưa lại vào sử dụng | Người nhận nghiệm thu tài sản sau sửa, ghi kết quả và tình trạng; tài sản trở lại trạng thái trước khi sửa | GĐ1 | [Đề xuất] |
| F-MNT-07 | Chuyển sang đề nghị thanh lý | Khi không sửa được hoặc chi phí sửa không đáng, lập đề nghị thanh lý ngay từ phiếu sửa | GĐ1 | [Đề xuất] |
| F-MNT-08 | Lịch sử bảo trì của tài sản | Xem mọi lần hỏng, sửa, chi phí, đơn vị sửa của một tài sản | GĐ1 | [Brief] B-18 |
| F-MNT-09 | Kế hoạch bảo trì định kỳ | Lịch bảo trì theo loại tài sản (ví dụ máy rang, máy pha) và nhắc việc | GĐ3 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-MNT-01 | Mỗi yêu cầu sửa gắn với đúng một tài sản | [Đề xuất] |
| BR-MNT-02 | Một tài sản chỉ có một phiếu sửa đang mở; báo hỏng thêm khi đã có phiếu mở thì bổ sung vào phiếu đó | [Đề xuất] |
| BR-MNT-03 | Tài sản chuyển "Đang sửa chữa" khi yêu cầu được tiếp nhận, không phải lúc mới báo hỏng | [Brief] B-19 |
| BR-MNT-04 | Chi phí sửa ghi theo từng lần sửa, kèm đơn vị sửa và chứng từ; báo giá vượt ngưỡng Every Half đặt cần duyệt trước khi sửa (Q-37) | [Brief] B-18 |
| BR-MNT-05 | Tài sản chỉ rời trạng thái "Đang sửa chữa" khi phiếu sửa được nghiệm thu hoặc chuyển sang đề nghị thanh lý | [Brief] B-19 |
| BR-MNT-06 | Chi phí sửa được ghi nhận là chi phí trong kỳ hay làm tăng nguyên giá do Kế toán trưởng quyết định; EH-AM chỉ lưu số tiền và phân loại được chọn | [Đề xuất] |
| BR-MNT-07 | Người báo hỏng nhận thông báo khi yêu cầu được tiếp nhận, bị từ chối và khi nghiệm thu xong | [Đề xuất] |

Trạng thái phiếu sửa: Mới báo, Đã tiếp nhận, Chờ báo giá, Chờ duyệt chi phí, Đang sửa, Chờ linh kiện, Đã sửa xong, Đã nghiệm thu, Đã từ chối, Chuyển thanh lý (mã ở Phụ lục B).

### 14.8. M08: Thanh lý và báo giảm

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Tài sản rời sổ qua đề nghị, phê duyệt và thực hiện có biên bản; tài sản mất được xác nhận có duyệt; ở GĐ2, thanh lý và mất tự báo giảm sang FAST |
| Người dùng chính | Quản lý điểm và Quản lý tài sản đề nghị; Ban giám đốc duyệt theo hạn mức; Kế toán tài sản ghi nhận thực hiện |
| Nguồn trong brief | B-09 (Đã thanh lý, Mất, Hủy), B-20 |
| KPI cốt lõi | Số ngày từ đề nghị tới thực hiện thanh lý; số tài sản "Nghi mất" quá hạn chưa có kết luận |
| Giai đoạn | GĐ1; báo giảm sang FAST ở GĐ2 |
| Đầu ra kỹ thuật | Bảng `disposal_requests`, `loss_confirmations`; API `/v1/disposals`; sự kiện audit `disposal.*`, `asset.lost_*` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-DSP-01 | Đề nghị thanh lý | Chọn tài sản, lý do (hỏng không sửa được, lỗi thời, hết nhu cầu), hình thức đề xuất (bán, huỷ bỏ, cho tặng, trả nhà cung cấp), ảnh hiện trạng | GĐ1 | [Brief] B-20 |
| F-DSP-02 | Duyệt đề nghị thanh lý | Người duyệt theo hạn mức giá trị duyệt hoặc từ chối, có thể nhiều cấp (Q-08); duyệt xong tài sản chuyển "Chờ thanh lý" | GĐ1 | [Brief] B-20 |
| F-DSP-03 | Thực hiện thanh lý | Ghi hình thức thực tế, ngày, bên nhận hoặc bên mua, số tiền thu về, biên bản; tài sản chuyển "Đã thanh lý" | GĐ1 | [Brief] B-20 |
| F-DSP-04 | Huỷ đề nghị thanh lý | Huỷ đề nghị chưa thực hiện, có lý do; tài sản trở lại trạng thái trước | GĐ1 | [Đề xuất] |
| F-DSP-05 | Xác nhận tài sản mất | Từ tài sản "Nghi mất" sau kiểm kê, hoặc báo mất đột xuất: lập đề nghị xác nhận mất kèm kết quả xác minh; duyệt xong tài sản chuyển "Mất" | GĐ1 | [Brief] B-09, B-12 |
| F-DSP-06 | Ghi nhận tìm thấy lại | Tài sản đã "Mất" được tìm thấy: lập đề nghị khôi phục có duyệt; tài sản trở lại "Đang sử dụng" tại location nơi tìm thấy | GĐ1 | [Đề xuất] |
| F-DSP-07 | Báo giảm sang FAST | Sau khi thực hiện thanh lý hoặc xác nhận mất, tạo yêu cầu ghi giảm gửi sang FAST qua M10 | GĐ2 | [Brief] B-20 |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-DSP-01 | Tài sản chỉ chuyển "Đã thanh lý" khi đề nghị đã được duyệt và việc thanh lý đã thực hiện, có biên bản | [Brief] B-20 |
| BR-DSP-02 | Người đề nghị không duyệt đề nghị của chính mình (BR-CMN-08) | [Đề xuất] |
| BR-DSP-03 | Cấp duyệt theo hạn mức nguyên giá do Every Half đặt (Q-08) | [Đề xuất] |
| BR-DSP-04 | Tài sản đang trong phiếu điều chuyển hoặc phiếu sửa đang mở không được đề nghị thanh lý, trừ đề nghị lập từ chính phiếu sửa đó | [Đề xuất] |
| BR-DSP-05 | "Mất" chỉ ghi khi có kết quả xác minh và có người duyệt; kiểm kê không tìm thấy chỉ tạo trạng thái "Nghi mất" (D-07) | [Brief] B-12 |
| BR-DSP-06 | Đề nghị đã duyệt mà chưa thực hiện quá số ngày Every Half đặt thì cảnh báo Quản lý tài sản | [Đề xuất] |
| BR-DSP-07 | Ở GĐ2, mỗi lần thực hiện thanh lý hoặc xác nhận mất tạo đúng một yêu cầu báo giảm sang FAST; trạng thái theo nhật ký đồng bộ của M10 | [Brief] B-20, B-30 |

Trạng thái đề nghị thanh lý và đề nghị xác nhận mất: Nháp, Chờ duyệt, Đã duyệt, Đã thực hiện, Đã từ chối, Đã huỷ (mã ở Phụ lục B).

### 14.9. M09: Khấu hao và phân bổ

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Theo dõi nguyên giá, khấu hao tháng, khấu hao luỹ kế và giá trị còn lại theo kỳ, khớp với sổ FAST |
| Người dùng chính | Kế toán trưởng, Kế toán tài sản |
| Nguồn trong brief | B-06, B-21 đến B-25 |
| KPI cốt lõi | Chênh lệch giá trị còn lại giữa EH-AM và FAST sau mỗi kỳ |
| Giai đoạn | GĐ2, ngoài MVP1 (D-04). Ở GĐ1, hồ sơ tài sản đã lưu nguyên giá, ngày bắt đầu sử dụng và thời gian sử dụng để GĐ2 dùng lại |
| Đầu ra kỹ thuật | Bảng `depreciation_policies`, `depreciation_periods`, `depreciation_lines`; job chốt kỳ; sự kiện audit `depreciation.*` |

Hệ nào tính khấu hao chính thức là quyết định của Kế toán trưởng (Q-06, D-03). Hai phương án:

- Phương án A, khuyến nghị: FAST tính khấu hao chính thức; EH-AM nhận kết quả theo kỳ để hiển thị trên hồ sơ, dashboard và dùng khi đối soát. Một hệ tính thì chỉ có một con số, và FAST đã là sổ kế toán của Every Half.
- Phương án B: EH-AM tính theo chính sách Kế toán trưởng duyệt rồi gửi kết quả sang FAST. Chỉ chọn khi bản FAST đang dùng không xuất được số liệu tài sản theo kỳ (Q-04).

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-DEP-01 | Thiết lập chính sách khấu hao | Theo loại tài sản: phương pháp, thời gian sử dụng, ngày bắt đầu tính, cách làm tròn | GĐ2 | [Brief] B-25 |
| F-DEP-02 | Nhận hoặc tính khấu hao theo kỳ | Theo phương án được chọn: nhận số liệu từ FAST hoặc tính trong EH-AM | GĐ2 | [Brief] B-21, B-22, B-23, B-24 |
| F-DEP-03 | Xem bảng khấu hao theo kỳ | Theo tài sản, loại, location, cost center | GĐ2 | [Brief] B-22, B-23, B-24 |
| F-DEP-04 | Khoá kỳ | Kỳ đã khoá không sửa; điều chỉnh sau khi khoá đi vào kỳ sau | GĐ2 | [Đề xuất] |
| F-DEP-05 | Phân bổ chi phí CCDC | Theo dõi số đã phân bổ và số còn lại của từng CCDC theo kỳ | GĐ2 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-DEP-01 | Khấu hao theo chính sách do Kế toán trưởng duyệt; căn cứ đề xuất là Thông tư 45/2013/TT-BTC về quản lý, sử dụng và trích khấu hao tài sản cố định và các văn bản sửa đổi, cần Kế toán trưởng xác nhận văn bản còn hiệu lực và đúng với doanh nghiệp | [Brief] B-25 |
| BR-DEP-02 | Chỉ một hệ tính khấu hao chính thức (D-03) | [Đề xuất] |
| BR-DEP-03 | Tài sản đã thanh lý, mất hoặc huỷ thôi trích khấu hao; cách tính cho kỳ có thay đổi trạng thái do Kế toán trưởng chốt | [Đề xuất] |
| BR-DEP-04 | Số tiền lưu dạng số thập phân chính xác và được cộng dồn trong cơ sở dữ liệu | [Đề xuất] |

### 14.10. M10: Tích hợp FAST

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Sổ vận hành và sổ kế toán khớp nhau: mỗi tài sản EH-AM liên kết một mã FAST, dữ liệu đi theo ma trận sở hữu, lỗi đồng bộ hiện rõ và xử lý được |
| Người dùng chính | Kế toán tài sản, Kế toán trưởng, Quản trị hệ thống |
| Nguồn trong brief | B-26 đến B-30, B-36 |
| KPI cốt lõi | Số yêu cầu đồng bộ ở trạng thái Error quá hạn xử lý; số tài sản chưa liên kết mã FAST |
| Giai đoạn | GĐ2, ngoài MVP1 (D-04). Cách tích hợp (API hay file nhập/xuất) chờ Q-04 |
| Đầu ra kỹ thuật | Bảng `fast_links`, `sync_outbox`, `sync_logs`, `reconciliation_runs`; adapter FAST tách riêng; job gửi và nhận; sự kiện audit `fast.*` |

"Đồng bộ 2 chiều" (B-29) được hiện thực theo từng trường: chiều dữ liệu của cả hệ thống là hai chiều, nhưng mỗi trường chỉ đi một chiều và có một hệ làm chủ (D-05). Nhờ vậy hai hệ không ghi đè lên nhau.

| Trường dữ liệu | Hệ làm chủ | Chiều đồng bộ | Khi hai bên lệch |
| --- | --- | --- | --- |
| Asset ID | EH-AM | EH-AM sang FAST, lưu làm tham chiếu | Giữ giá trị của EH-AM |
| Mã tài sản FAST | FAST | Nhập vào EH-AM qua liên kết | Giữ giá trị của FAST |
| Phân loại kế toán | FAST | Loại tài sản EH-AM ánh xạ sang nhóm FAST qua mã nhóm FAST ở M02 | Báo chênh lệch, Kế toán tài sản xử lý |
| Nguyên giá | FAST | FAST sang EH-AM | Giữ giá trị của FAST, ghi chênh lệch |
| Khấu hao tháng, khấu hao luỹ kế, giá trị còn lại | FAST (phương án A ở M09) | FAST sang EH-AM | Giữ giá trị của FAST |
| Cost center | EH-AM, đổi theo location sau điều chuyển | EH-AM sang FAST | Giữ giá trị của EH-AM, lỗi hiện ở nhật ký đồng bộ |
| Ghi giảm do thanh lý hoặc mất | EH-AM | EH-AM sang FAST | Giữ giá trị của EH-AM |
| Location, người chịu trách nhiệm, tình trạng | EH-AM | Không đồng bộ | Không áp dụng |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-FST-01 | Liên kết Asset ID với mã FAST | Liên kết từng tài sản hoặc theo file; một tài sản tối đa một mã FAST, ngoại lệ cho CCDC chờ Q-28 | GĐ2 | [Brief] B-28 |
| F-FST-02 | Gửi thay đổi sang FAST | Cost center và ghi giảm theo ma trận; mỗi thay đổi thành một yêu cầu đồng bộ | GĐ2 | [Brief] B-29 |
| F-FST-03 | Nhận số liệu từ FAST | Nguyên giá, khấu hao, giá trị còn lại theo kỳ | GĐ2 | [Brief] B-29 |
| F-FST-04 | Nhật ký đồng bộ và xử lý lỗi | Trạng thái Synced, Pending, Error; gửi lại; ghi chú cách xử lý | GĐ2 | [Brief] B-30 |
| F-FST-05 | Đối soát EH-AM với FAST | Báo cáo chênh lệch theo kỳ: thiếu liên kết, lệch nguyên giá, lệch cost center, lệch trạng thái | GĐ2 | [Brief] B-36 |
| F-FST-06 | Cấu hình kết nối | Thông số kết nối hoặc mẫu file nhập, xuất theo bản FAST đang dùng | GĐ2 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-FST-01 | Mỗi trường có một hệ làm chủ theo ma trận; hệ không làm chủ không ghi đè (D-05) | [Brief] B-29 |
| BR-FST-02 | Yêu cầu đồng bộ đi qua hàng đợi có trạng thái Pending, Synced, Error; thao tác của người dùng không chờ FAST trả lời | [Brief] B-30 |
| BR-FST-03 | Gửi lại một yêu cầu không tạo ghi nhận trùng bên FAST | [Đề xuất] |
| BR-FST-04 | Yêu cầu lỗi nằm trong nhật ký cho tới khi được xử lý, không tự xoá | [Đề xuất] |
| BR-FST-05 | Chỉ Kế toán tài sản sửa liên kết mã, bắt buộc lý do | [Đề xuất] |

### 14.11. M11: Dashboard và báo cáo

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Nhìn nhanh số tài sản, phân bổ theo điểm, tài sản mất và hỏng, tiến độ kiểm kê theo đúng vai trò; ở GĐ2 thêm khấu hao và chênh lệch với FAST |
| Người dùng chính | Ban giám đốc, Quản lý tài sản, Quản lý điểm, Kế toán trưởng |
| Nguồn trong brief | B-31 đến B-36 |
| KPI cốt lõi | Số người dùng mở dashboard mỗi tuần theo vai trò; thời gian tải dashboard |
| Giai đoạn | GĐ1; chỉ số khấu hao và FAST ở GĐ2 |
| Đầu ra kỹ thuật | View tổng hợp trong cơ sở dữ liệu, áp phạm vi location; API `/v1/dashboard/*`, `/v1/reports/*`; sự kiện audit `report.exported` |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-DSH-01 | Dashboard tổng quan | Tổng số tài sản theo trạng thái và loại; tổng nguyên giá với vai trò được xem giá trị | GĐ1 | [Brief] B-31 |
| F-DSH-02 | Tài sản theo location | Phân bổ theo cửa hàng, xưởng rang, kho, văn phòng; mở vào từng điểm để xem chi tiết | GĐ1 | [Brief] B-32 |
| F-DSH-03 | Tài sản mất và hỏng | Số lượng và danh sách tài sản nghi mất, mất, hư hỏng, đang sửa; theo điểm và theo thời gian | GĐ1 | [Brief] B-34 |
| F-DSH-04 | Tiến độ kiểm kê | Trong đợt hiện tại: điểm đã duyệt, đã chốt, đang kiểm, chưa bắt đầu; tỷ lệ tài sản đã quét | GĐ1 | [Brief] B-35 |
| F-DSH-05 | Dashboard của điểm | Quản lý điểm thấy số liệu của điểm mình: tài sản, đang sửa, phiếu chờ nhận, đợt kiểm kê | GĐ1 | [Đề xuất] |
| F-DSH-06 | Xuất báo cáo | Xuất Excel hoặc PDF theo bộ lọc, trong phạm vi quyền | GĐ1 | [Đề xuất] |
| F-DSH-07 | Khấu hao và giá trị còn lại | Theo kỳ, loại, location, cost center | GĐ2 | [Brief] B-33 |
| F-DSH-08 | Chênh lệch với FAST | Kết quả đối soát kỳ gần nhất và các chênh lệch chưa xử lý | GĐ2 | [Brief] B-36 |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-DSH-01 | Số liệu dashboard áp cùng phạm vi location với danh sách tài sản (BR-CMN-03) | [Brief] B-39 |
| BR-DSH-02 | Chỉ số về giá trị chỉ hiện với vai trò được xem giá trị (BR-CMN-06) | [Đề xuất] |
| BR-DSH-03 | Mỗi chỉ số ghi thời điểm cập nhật và có định nghĩa khi rê chuột hoặc chạm vào | [Đề xuất] |
| BR-DSH-04 | File xuất chỉ chứa cột người xuất được xem; mỗi lần xuất ghi nhật ký | [Đề xuất] |

### 14.12. M12: Nhật ký, lịch sử và thông báo

| Mục | Nội dung |
| --- | --- |
| Mục tiêu | Mọi thay đổi có dấu vết đủ năm yếu tố và tra được; việc cần làm đến đúng người, đúng lúc |
| Người dùng chính | Kiểm soát nội bộ, Quản lý tài sản; mọi người dùng nhận thông báo |
| Nguồn trong brief | B-16, B-37, B-38 |
| KPI cốt lõi | Tỷ lệ thao tác thay đổi dữ liệu có dòng nhật ký (mục tiêu đủ tất cả); số việc quá hạn trong hộp việc |
| Giai đoạn | GĐ1; thông báo qua Zalo hoặc Lark ở GĐ3 |
| Đầu ra kỹ thuật | Bảng `audit_events` (đã có, chỉ ghi thêm), `notifications`, `tasks`; API `/v1/audit-events`, `/v1/inbox`; job gửi email |

| Mã | Tính năng | Mô tả | GĐ | Nguồn |
| --- | --- | --- | --- | --- |
| F-AUD-01 | Ghi nhật ký thay đổi | Hệ thống ghi mọi thay đổi: người làm, thời điểm, đối tượng, giá trị trước và sau, lý do, location, mã request | GĐ1 | [Brief] B-38 |
| F-AUD-02 | Tra cứu nhật ký | Lọc theo tài sản, người, loại sự kiện, location, khoảng thời gian; xem chi tiết trước và sau | GĐ1 | [Brief] B-38 |
| F-AUD-03 | Xuất nhật ký | Xuất kết quả tra cứu để phục vụ kiểm toán | GĐ1 | [Đề xuất] |
| F-AUD-04 | Hộp việc cần làm | Mỗi người thấy việc đang chờ mình: phiếu chờ nhận, đề nghị chờ duyệt, đợt kiểm kê được giao, yêu cầu sửa chờ tiếp nhận | GĐ1 | [Đề xuất] |
| F-AUD-05 | Thông báo | Thông báo trong ứng dụng và qua email khi có việc mới, sắp quá hạn, đã quá hạn | GĐ1 | [Đề xuất] |
| F-AUD-06 | Cấu hình thông báo | Quản trị hệ thống bật, tắt từng loại thông báo và đặt ngưỡng nhắc hạn | GĐ1 | [Đề xuất] |

| Mã | Quy tắc | Nguồn |
| --- | --- | --- |
| BR-AUD-01 | Nhật ký chỉ ghi thêm; không ai sửa hay xoá được, kể cả Quản trị hệ thống | [Brief] B-37 |
| BR-AUD-02 | Nhật ký không chứa mật khẩu, token, đường dẫn tệp có thời hạn hay toạ độ chi tiết | [Đề xuất] |
| BR-AUD-03 | Lý do do người dùng nhập; hệ thống không tự điền lý do thay người dùng | [Brief] B-38 |
| BR-AUD-04 | Thao tác thay đổi dữ liệu nghiệp vụ không hoàn tất nếu không ghi được nhật ký | [Đề xuất], đã có trong code |
| BR-AUD-05 | Thông báo không chứa giá trị tài sản hay dữ liệu cá nhân, chỉ chứa mã việc và đường dẫn tới việc | [Đề xuất] |
| BR-AUD-06 | Kiểm soát nội bộ chỉ xem, không thực hiện thao tác nghiệp vụ | [Đề xuất] |

# PHẦN IV. Tự động hoá, dữ liệu, tích hợp, bảo mật và trải nghiệm

Các năng lực dùng chung quyết định độ tin cậy của dữ liệu tài sản và trải nghiệm tại hiện trường.

> **Tuyên bố thiết kế**
> Các yêu cầu trong phần này áp cho mọi module. Use case của từng module tham chiếu tới đây thay vì viết lại, và code không được làm yếu đi bất kỳ yêu cầu nào mà không có quyết định ghi ở Phụ lục I.

## 15. Tự động hoá có kiểm soát

EH-AM dùng job chạy theo lịch cho các việc lặp lại, để không ai phải nhớ ngày mở đợt kiểm kê hay tự dò phiếu quá hạn. Job chỉ làm những việc có quy tắc rõ ràng; mọi quyết định có hậu quả (xác nhận mất, duyệt thanh lý, duyệt chi phí sửa) vẫn do người có thẩm quyền làm.

| Job | Việc làm | Lịch chạy | Chủ sở hữu | GĐ |
| --- | --- | --- | --- | --- |
| Mở đợt kiểm kê tháng | Tạo đợt cho mọi location đang hoạt động, chốt danh sách dự kiến (F-STK-02) | Ngày đầu tháng, giờ Việt Nam | Quản lý tài sản | GĐ1 |
| Nhắc hạn kiểm kê | Nhắc người được phân công trước hạn và khi quá hạn | Hằng ngày | Quản lý tài sản | GĐ1 |
| Cảnh báo đang vận chuyển quá hạn | Liệt kê tài sản đã xuất mà chưa được nhận (BR-TRF-07) | Hằng ngày | Quản lý tài sản | GĐ1 |
| Cảnh báo nghi mất quá hạn | Liệt kê tài sản "Nghi mất" chưa có kết luận (BR-STK-07) | Hằng ngày | Quản lý tài sản | GĐ1 |
| Cảnh báo thanh lý chưa thực hiện | Liệt kê đề nghị đã duyệt mà chưa thực hiện (BR-DSP-06) | Hằng ngày | Quản lý tài sản | GĐ1 |
| Gửi thông báo | Gửi email từ hàng đợi thông báo (F-AUD-05) | Liên tục | Quản trị hệ thống | GĐ1 |
| Đồng bộ FAST | Gửi yêu cầu trong hàng đợi, nhận số liệu theo kỳ (F-FST-02, F-FST-03) | Liên tục và theo kỳ | Kế toán tài sản | GĐ2 |
| Chốt kỳ khấu hao | Nhận hoặc tính số liệu kỳ, khoá kỳ (F-DEP-02, F-DEP-04) | Cuối tháng | Kế toán trưởng | GĐ2 |

AI là hướng đi của GĐ3, không có trong MVP1. Hai ứng dụng hợp lý là đọc hoá đơn để điền sẵn thông tin mua khi lập hồ sơ, và đánh dấu lượt quét bất thường khi kiểm kê (ví dụ nhiều tài sản được quét trong vài giây). Trong cả hai trường hợp, AI chỉ đề xuất; người dùng xác nhận trước khi dữ liệu được lưu.

## 16. Quy tắc kiểm soát cho từng job tự động

- Job có một người chịu trách nhiệm và lịch chạy tính theo giờ Việt Nam.
- Chạy lại một job không tạo bản ghi trùng: mở đợt kiểm kê hai lần trong một tháng vẫn chỉ có một đợt.
- Mỗi lần chạy ghi log: thời điểm bắt đầu, kết thúc, số bản ghi xử lý, lỗi.
- Khi backend chạy nhiều instance, mỗi lần chỉ một instance chạy job (khoá phân tán).
- Job nào đổi dữ liệu nghiệp vụ thì ghi nhật ký với tác nhân "Bộ lập lịch", như mọi thay đổi khác.
- Quản trị hệ thống tắt được từng job mà không cần triển khai lại.
- Job lỗi thì cảnh báo người chịu trách nhiệm, không lặng lẽ bỏ qua.

## 17. Kiến trúc dữ liệu

EH-AM dùng một cơ sở dữ liệu PostgreSQL trên Supabase làm nguồn dữ liệu chính. Lịch sử và nhật ký tách thành bảng riêng, chỉ ghi thêm, có trigger chặn sửa và xoá (migration 01 đã có cho nhật ký và phân quyền).

| Lớp dữ liệu | Nội dung | Nơi lưu |
| --- | --- | --- |
| Dữ liệu nghiệp vụ | Tài sản, các loại phiếu, danh mục, người dùng và phân quyền | PostgreSQL |
| Lịch sử và nhật ký | Sự kiện của tài sản, nhật ký thay đổi; chỉ ghi thêm | PostgreSQL, trigger chặn sửa xoá |
| Tệp | Ảnh tài sản, ảnh bằng chứng kiểm kê, chứng từ | Supabase Storage, truy cập bằng đường dẫn có thời hạn |
| Số liệu tổng hợp | View cho dashboard và báo cáo, áp phạm vi location | PostgreSQL |
| Hàng đợi | Thông báo chờ gửi; yêu cầu đồng bộ FAST ở GĐ2 | Bảng outbox trong PostgreSQL |

Nhóm thực thể chính:

| Nhóm | Thực thể |
| --- | --- |
| Danh tính và phân quyền | UserProfile, RoleAssignment |
| Danh mục nền | Location, CostCenter, AssetCategory, Supplier, RepairVendor, ReasonCode |
| Tài sản | Asset, AssetEvent, AssetDocument, LabelBatch, LabelPrint |
| Kiểm kê | Stocktake, StocktakeLocation, StocktakeItem, ScanRecord |
| Điều chuyển | Transfer, TransferItem |
| Sửa chữa | RepairRequest, RepairCost |
| Thanh lý và mất | DisposalRequest, LossConfirmation |
| Kế toán và FAST (GĐ2) | DepreciationPolicy, DepreciationPeriod, DepreciationLine, FastLink, SyncOutbox, SyncLog, ReconciliationRun |
| Nhật ký và thông báo | AuditEvent, Notification, Task |

Quy ước dữ liệu [Đề xuất]:

- Asset ID dạng `EH-A-000001`: tiền tố cố định và số tăng dần. Mã không chứa location hay loại, vì tài sản đổi chỗ và có thể đổi loại mà mã phải giữ nguyên.
- Mã phiếu có tiền tố theo loại và năm: `KK` kiểm kê, `DC` điều chuyển, `SC` sửa chữa, `TL` thanh lý, `XM` xác nhận mất, ví dụ `DC-2026-000123`.
- Tiền lưu kiểu `numeric`, đơn vị đồng; cộng dồn bằng `SUM()` trong cơ sở dữ liệu.
- Thời điểm lưu kiểu `timestamptz` theo giờ máy chủ; kỳ tính theo giờ Việt Nam.
- Không có thao tác xoá cứng trên dữ liệu nghiệp vụ (BR-CMN-01).

## 18. Hồ sơ số và bằng chứng

- Hồ sơ tài sản gồm thông tin mô tả, thông tin mua, thông tin tài chính và chứng từ: hoá đơn, PO, biên bản bàn giao, phiếu bảo hành, biên bản thanh lý, ảnh.
- Một lượt quét lưu người quét, giờ máy chủ, tài sản, kết quả, tình trạng, ảnh, và toạ độ khi được bật (BR-STK-05).
- Một dòng nhật ký lưu người làm, hành động, đối tượng, trạng thái trước và sau, lý do, location, thời điểm, mã request, địa chỉ IP (BR-CMN-02).
- Tệp nằm trong kho tệp riêng tư; người dùng xem qua đường dẫn có thời hạn do máy chủ cấp sau khi kiểm quyền.
- Tệp tải lên trực tiếp từ trình duyệt vào kho tệp bằng đường dẫn đã ký; backend không nhận tệp trong nội dung request.
- Thời hạn lưu chứng từ kế toán theo Luật Kế toán số 88/2015/QH13 và Nghị định 174/2016/NĐ-CP; cần Kế toán trưởng xác nhận thời hạn áp dụng cho từng loại chứng từ. Thời hạn lưu ảnh bằng chứng kiểm kê chờ Every Half chốt (Q-38).

## 19. API và tích hợp

| Nhóm API | Phạm vi | GĐ |
| --- | --- | --- |
| `/v1/auth` | Đăng nhập, phiên, mật khẩu, hồ sơ cá nhân (đã có) | GĐ1 |
| `/v1/users`, `/v1/role-assignments` | Tài khoản, khoá, vai trò theo location | GĐ1 |
| `/v1/master-data` | Location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa, lý do | GĐ1 |
| `/v1/assets` | Hồ sơ, nhập từ file, chứng từ, dòng thời gian, xuất danh sách | GĐ1 |
| `/v1/labels`, `/v1/scan` | Lô in nhãn, xác nhận dán nhãn, tra cứu bằng QR | GĐ1 |
| `/v1/stocktakes` | Đợt kiểm kê, lượt quét, chốt, duyệt, chênh lệch | GĐ1 |
| `/v1/transfers` | Phiếu điều chuyển, xuất, nhận | GĐ1 |
| `/v1/repairs` | Yêu cầu sửa, tiến độ, chi phí, nghiệm thu | GĐ1 |
| `/v1/disposals` | Đề nghị thanh lý, xác nhận mất, tìm thấy lại | GĐ1 |
| `/v1/dashboard`, `/v1/reports` | Chỉ số và xuất báo cáo | GĐ1 |
| `/v1/audit-events`, `/v1/inbox` | Nhật ký, hộp việc, thông báo | GĐ1 |
| `/v1/fast` | Liên kết mã, nhật ký đồng bộ, đối soát | GĐ2 |

Nguyên tắc API:

- Version nằm trong đường dẫn (`/v1`); `/health` không có version.
- Lỗi trả mã máy đọc được và thông điệp theo ngôn ngữ người dùng; frontend xử lý theo mã, không theo câu chữ.
- Quyền và phạm vi location được kiểm ở máy chủ cho cả thao tác lẻ và danh sách.
- Thao tác gửi từ app quét kèm khoá chống trùng (BR-CMN-09).
- Danh sách có phân trang; nội dung request tối đa 256 KB; giới hạn tần suất theo nhóm endpoint.
- Tích hợp FAST ở GĐ2 đi qua hàng đợi và đối soát; thao tác của người dùng không chờ FAST trả lời (BR-FST-02). Cách kết nối (API hay file) chờ Q-04.

## 20. Bảo mật, quyền riêng tư và kiểm soát

| Miền kiểm soát | Yêu cầu tối thiểu |
| --- | --- |
| Xác thực | Đăng nhập qua Supabase Auth; token trả cho trình duyệt được mã hoá thêm một lớp; trạng thái tài khoản kiểm lại ở mỗi request (đã có) |
| Phân quyền | Vai trò theo location, kiểm ở máy chủ, mặc định từ chối; danh sách lọc ngay trong câu truy vấn (BR-CMN-03) |
| Quản trị tối cao | Một tài khoản dự phòng dùng khi phân quyền bị cấu hình sai; mọi thao tác của tài khoản này được ghi nhật ký và rà lại |
| Bảo vệ dữ liệu | Giá trị tài sản chỉ hiện theo vai trò (BR-CMN-06); dữ liệu trả ra qua mapper riêng cho từng đối tượng người xem |
| Toàn vẹn lịch sử | Bảng lịch sử và nhật ký chỉ ghi thêm; trigger chặn sửa, xoá ở cấp cơ sở dữ liệu |
| Ứng dụng và API | Kiểm dữ liệu đầu vào, từ chối trường lạ, giới hạn tần suất, giới hạn kích thước request, header bảo mật, CORS theo danh sách |
| Sao lưu và khôi phục | Sao lưu hằng ngày; thử khôi phục trước go-live; mức chịu mất dữ liệu tối đa và thời gian khôi phục chờ Every Half chốt (Q-39) |

Dữ liệu cá nhân. Toạ độ khi quét, ảnh có thể có người trong khung hình, họ tên và mã nhân viên trong nhật ký đều là dữ liệu cá nhân. Căn cứ đề xuất là Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15; cần pháp chế xác nhận số hiệu, ngày hiệu lực và nghĩa vụ áp dụng cho Every Half (Q-20). Trong lúc chờ, EH-AM áp các biện pháp sau:

- Toạ độ tắt mặc định; Every Half quyết định có bật hay không (Q-20, Q-31).
- Nhân viên được thông báo mục đích thu ảnh và toạ độ trước lần quét đầu tiên.
- Toạ độ chỉ thu lúc bấm quét, không theo dõi vị trí liên tục.
- Nhật ký không chứa toạ độ chi tiết (BR-AUD-02).
- Ảnh bằng chứng chỉ người có vai trò trên location đó và Quản lý tài sản xem được.

## 21. UX/UI, di động và khả năng tiếp cận

| Nguyên tắc | Mô tả |
| --- | --- |
| Quét trước | Màn hình chính của app quét mở camera ngay; nhập mã chỉ để dự phòng |
| Một tay, ít chữ | Nút lớn ở nửa dưới màn hình; kết quả kiểm kê chọn bằng một chạm |
| Chịu được mạng yếu | Lượt quét vào hàng đợi trên máy và tự gửi lại; người dùng thấy rõ lượt nào đã gửi, lượt nào đang chờ |
| Theo vai trò | Mỗi vai trò có màn hình chính riêng; thao tác ngoài quyền không hiện |
| Trạng thái luôn hiện | Trạng thái tài sản và trạng thái phiếu hiện ở đầu mọi màn hình chi tiết |
| Lỗi nói rõ việc cần làm | Thông báo lỗi nói người dùng cần làm gì tiếp theo, bằng ngôn ngữ họ chọn |
| Tiếng Việt mặc định | Giao diện và thông báo tiếng Việt, chuyển được sang tiếng Anh |
| Dễ tiếp cận | Độ tương phản đủ đọc dưới đèn quầy, cỡ chữ đổi được, vùng chạm đủ lớn |

Yêu cầu vận hành đề xuất, đo và chốt ở pilot:

- Tra cứu bằng QR hiện kết quả trong khoảng 2 giây trên mạng 4G.
- App quét chạy trên Chrome cho Android và Safari cho iOS, không cần cài ứng dụng.
- Web quản trị dùng tốt trên màn hình máy tính phổ thông.

Danh mục màn hình chính ở Phụ lục K.

# PHẦN V. Quy trình, KPI, điều hành và mô hình vận hành

Chức năng được nối thành quy trình có người làm, người duyệt, trạng thái và thời hạn.

> **Tuyên bố thiết kế**
> Mỗi quy trình dưới đây ứng với một hoặc nhiều use case. Thời hạn trong cột SLA là đề xuất của đội triển khai; Every Half chốt con số cuối cùng trước pilot.

## 22. Hệ thống quy trình chuẩn

| Mã | Quy trình | Trigger | Tác nhân | Người duyệt | Trạng thái chính | SLA đề xuất |
| --- | --- | --- | --- | --- | --- | --- |
| WF-01 | Tạo tài khoản và gán vai trò | Có nhân viên mới | Quản trị hệ thống | Không cần | Tài khoản Đang hoạt động, có vai trò trên location | Trong ngày làm việc |
| WF-02 | Khoá tài khoản khi nghỉ việc | Nhân sự báo nhân viên nghỉ | Quản trị hệ thống | Không cần | Tài khoản Đã ngừng, vai trò đóng hiệu lực | Trong ngày nhân viên nghỉ |
| WF-03 | Lập hồ sơ và dán nhãn tài sản mới | Tài sản nhận về | Quản lý tài sản | Không cần | Lưu kho hoặc Đang sử dụng; đã dán nhãn | Dán nhãn trong tuần nhận tài sản |
| WF-04 | Nhập danh sách tài sản ban đầu | Chuyển đổi dữ liệu trước go-live | Quản lý tài sản | Kế toán trưởng xác nhận danh sách | Hồ sơ đã tạo, chờ dán nhãn | Theo kế hoạch §35 |
| WF-05 | Kiểm kê tháng tại điểm | Đợt kiểm kê mở | Nhân viên điểm | Quản lý điểm | Điểm trong đợt: Đang kiểm, Đã chốt, Đã duyệt | Chốt trước hạn của đợt |
| WF-06 | Xử lý chênh lệch kiểm kê | Đợt được duyệt có chênh lệch | Quản lý tài sản | Ban giám đốc cho xác nhận mất | Mỗi chênh lệch có kết luận | Theo thời hạn Q-13 |
| WF-07 | Điều chuyển giữa các điểm | Nhu cầu chuyển tài sản | Quản lý tài sản hoặc Quản lý điểm | Theo điều kiện Q-36 | Phiếu: Chờ duyệt, Đang vận chuyển, Đã nhận | Nhận trong số ngày Q-11 |
| WF-08 | Báo hỏng và sửa chữa | Nhân viên phát hiện hỏng | Nhân viên điểm, rồi Quản lý tài sản | Duyệt chi phí khi vượt ngưỡng Q-37 | Phiếu sửa: Mới báo, Đang sửa, Đã nghiệm thu | Tiếp nhận trong ngày làm việc kế tiếp |
| WF-09 | Gửi sửa bên ngoài và nhận về | Phiếu sửa chọn đơn vị sửa bên ngoài | Quản lý tài sản | Không cần | Tài sản tại location bên ngoài, rồi nhận về | Theo cam kết của đơn vị sửa |
| WF-10 | Thanh lý tài sản | Tài sản hỏng, lỗi thời, hết nhu cầu | Quản lý điểm hoặc Quản lý tài sản | Ban giám đốc theo hạn mức Q-08 | Chờ thanh lý, rồi Đã thanh lý | Thực hiện trong số ngày Every Half đặt |
| WF-11 | Xác nhận tài sản mất | Nghi mất sau kiểm kê hoặc báo mất đột xuất | Quản lý tài sản | Ban giám đốc | Nghi mất, rồi Mất | Theo thời hạn Q-13 |
| WF-12 | Tìm thấy lại tài sản đã mất | Tài sản Mất được tìm thấy | Quản lý điểm | Quản lý tài sản | Mất, rồi Đang sử dụng | Trong tuần tìm thấy |
| WF-13 | Đóng một location | Đóng cửa hàng, kho | Quản lý tài sản | Ban giám đốc | Location ngừng hoạt động | Sau khi mọi tài sản đã chuyển đi |
| WF-14 | In lại nhãn | Nhãn hỏng hoặc mất | Quản lý tài sản | Không cần | Nhãn mới được dán và xác nhận | Trong tuần phát hiện |
| WF-15 | Đồng bộ và đối soát với FAST | Có thay đổi thuộc ma trận sở hữu; cuối kỳ | Kế toán tài sản | Kế toán trưởng cho kết quả đối soát | Pending, Synced, Error | GĐ2, chốt sau Q-04 |
| WF-16 | Chốt kỳ khấu hao | Cuối tháng | Kế toán tài sản | Kế toán trưởng | Kỳ Đã khoá | GĐ2 |

> **Hợp đồng máy trạng thái**
> Trạng thái của tài sản và của phiếu chỉ đổi qua đúng luồng nghiệp vụ, không có màn hình sửa trạng thái trực tiếp. Mỗi lần chuyển trạng thái kiểm điều kiện trước, quyền của người làm và trạng thái hiện tại, để hai người thao tác cùng lúc trên một phiếu không ghi đè nhau. Từ chối, huỷ và quá hạn là trạng thái chính thức, có tên và có dòng nhật ký.

## 23. Dashboard và khung KPI

| Cấp | KPI | Định nghĩa và công thức | Nguồn | Chủ sở hữu | Kỳ đo |
| --- | --- | --- | --- | --- | --- |
| Ban giám đốc | Tài sản theo trạng thái | Số tài sản ở từng trạng thái vòng đời, theo điểm | Sổ tài sản | Quản lý tài sản | Theo thời gian thực |
| Ban giám đốc | Tỷ lệ tài sản mất trong kỳ | Số tài sản chuyển "Mất" trong kỳ chia số tài sản cần quản lý đầu kỳ | Đề nghị xác nhận mất | Quản lý tài sản | Quý |
| Ban giám đốc | Chi phí sửa chữa | Tổng chi phí sửa thực tế trong kỳ theo điểm, loại tài sản, đơn vị sửa | Phiếu sửa | Quản lý tài sản | Tháng |
| Vận hành | Tỷ lệ tài sản có hồ sơ và nhãn | Số tài sản đã xác nhận dán nhãn chia số tài sản cần quản lý | Hồ sơ, lô in nhãn | Quản lý tài sản | Tuần trong chiến dịch dán nhãn, sau đó tháng |
| Vận hành | Tỷ lệ điểm chốt kiểm kê đúng hạn | Số điểm được duyệt trước hạn chia số điểm trong đợt | Đợt kiểm kê | Quản lý tài sản | Tháng |
| Vận hành | Nghi mất quá hạn | Số tài sản "Nghi mất" quá thời hạn Q-13 chưa có kết luận | Đợt kiểm kê | Quản lý tài sản | Tuần |
| Vận hành | Thời gian sửa | Số ngày từ báo hỏng tới nghiệm thu, trung vị theo loại tài sản | Phiếu sửa | Quản lý tài sản | Tháng |
| Quản lý điểm | Tỷ lệ quét trong đợt | Số tài sản đã quét chia số tài sản dự kiến của điểm | Đợt kiểm kê | Quản lý điểm | Trong đợt |
| Quản lý điểm | Phiếu chờ nhận | Số phiếu điều chuyển đang vận chuyển tới điểm | Phiếu điều chuyển | Quản lý điểm | Theo thời gian thực |
| Kế toán | Chênh lệch với FAST | Số tài sản lệch ít nhất một trường thuộc ma trận sở hữu, sau đối soát | Đối soát | Kế toán tài sản | Tháng, GĐ2 |
| Nền tảng | Thời gian tra cứu QR | Phân vị 95 của thời gian từ lúc gửi mã tới lúc có kết quả | Log hệ thống | Đội triển khai | Tuần |

Nguyên tắc KPI:

- Mỗi KPI có định nghĩa, công thức, nguồn, chủ sở hữu và kỳ đo như bảng trên; đổi định nghĩa thì ghi ngày đổi.
- Mục tiêu bằng số chỉ đặt sau khi có số liệu nền (Q-01) và sau pilot, để mục tiêu không dựa trên phỏng đoán.
- Dashboard hiện số hiện tại; báo cáo tháng chốt số theo kỳ, và số đã chốt không đổi khi dữ liệu sau đó thay đổi.

## 24. Bảng điều hành cho Ban giám đốc

- Màn hình tổng quan: tài sản theo trạng thái, theo loại, theo điểm; tổng nguyên giá.
- Mở vào từng điểm để xem tài sản, tài sản đang sửa, tài sản nghi mất, tiến độ kiểm kê.
- Danh sách việc chờ Ban giám đốc quyết: đề nghị thanh lý và đề nghị xác nhận mất đang chờ duyệt, kèm ảnh và kết quả xác minh.
- Báo cáo tài sản tháng xuất PDF sau mỗi đợt kiểm kê: số tài sản, thay đổi trong tháng, tài sản mất, hỏng, chi phí sửa.
- Ở GĐ2 thêm giá trị còn lại theo điểm và kết quả đối soát với FAST.

## 25. Mô hình quản trị dự án và vận hành

| Cơ chế | Thành phần | Trách nhiệm |
| --- | --- | --- |
| Ban chỉ đạo | Ban giám đốc, Kế toán trưởng, trưởng bộ phận Vận hành, PO bên triển khai | Duyệt phạm vi và thay đổi lớn, quyết định ở các cổng; họp hai tuần một lần |
| Chủ dữ liệu tài sản | Trưởng bộ phận Vận hành | Danh mục location, quy trình kiểm kê, chiến dịch dán nhãn, chọn điểm pilot |
| Chủ dữ liệu kế toán | Kế toán trưởng | Chính sách kế toán tài sản, dữ liệu tài chính, toàn bộ GĐ2 |
| PO bên triển khai | Duy | Backlog, use case, nghiệm thu nội bộ, báo cáo tiến độ |
| Đội triển khai | Backend, frontend, QA, UX | Xây dựng, kiểm thử, triển khai, hỗ trợ hypercare |

RACI cho các hoạt động chính (R thực hiện, A chịu trách nhiệm cuối, C được hỏi ý kiến, I được thông báo):

| Hoạt động | Ban chỉ đạo | Kế toán trưởng | Vận hành | Quản lý điểm | PO | Đội triển khai |
| --- | --- | --- | --- | --- | --- | --- |
| Duyệt phạm vi MVP1 và blueprint | A | C | C | I | R | I |
| Chốt vai trò và phạm vi xem giá trị (Q-16) | A | C | R | C | C | I |
| Định nghĩa trạng thái và quy trình kiểm kê (Q-10, Q-12) | I | C | A | C | R | C |
| Làm sạch danh sách tài sản ban đầu | I | A | R | C | C | C |
| Dán nhãn tại điểm | I | I | A | R | C | I |
| Chạy pilot và nghiệm thu | A | C | R | R | R | R |
| Quyết định go-live | A | C | C | I | R | C |
| Hỗ trợ sau go-live | I | I | A | C | C | R |

Sau go-live, trưởng bộ phận Vận hành giữ danh mục location và lịch kiểm kê; Quản trị hệ thống giữ tài khoản và rà quyền mỗi quý; đội triển khai nhận yêu cầu hỗ trợ theo thoả thuận dịch vụ.

## 26. Chi phí vận hành và tính bền vững

| Nhóm chi phí | Mục | Yếu tố chi phối |
| --- | --- | --- |
| Hạ tầng | Supabase (cơ sở dữ liệu, xác thực, kho tệp), hosting backend và frontend, tên miền | Số tài sản, số lượt quét mỗi tháng, dung lượng ảnh |
| Nhãn | Nhãn QR lần đầu, nhãn in lại, máy in nhãn nếu in nội bộ | Số tài sản cần quản lý (Q-03), tỷ lệ nhãn hỏng, loại nhãn cho quầy bar |
| Thiết bị | Điện thoại quét nếu dùng máy của cửa hàng, gói dữ liệu di động | Số điểm (Q-02), chính sách điện thoại cá nhân (Q-18) |
| Email | Dịch vụ gửi email giao dịch | Số thông báo mỗi tháng |
| Hỗ trợ và bảo trì | Hỗ trợ sau go-live, cập nhật bảo mật, cải tiến | Thoả thuận dịch vụ, số yêu cầu mỗi tháng |
| FAST | Phí kết nối hoặc hỗ trợ từ nhà cung cấp FAST | Cách tích hợp (Q-04); GĐ2 |

Nguyên tắc bền vững:

- Dữ liệu xuất được ra file bất cứ lúc nào, để Every Half không bị khoá vào một nhà cung cấp.
- Logic phân quyền nằm ở backend, không phụ thuộc tính năng riêng của nền tảng hạ tầng (R-16).
- Ảnh được nén trước khi tải lên và có thời hạn lưu (Q-38), vì dung lượng ảnh tăng theo mỗi đợt kiểm kê.
- Chi phí hạ tầng được rà mỗi quý theo số liệu dùng thực tế.

# PHẦN VI. Kiến trúc kỹ thuật và các bước triển khai

Hợp đồng bàn giao để đội kỹ thuật chia việc theo module, dữ liệu, API, quyền và kiểm thử.

> **Tuyên bố thiết kế**
> Kiến trúc dưới đây bám theo hai repo đang có, `eh_am_backend` và `eh_am_frontend`. Đổi công nghệ nền hay bỏ một hợp đồng ở §29 cần ghi quyết định ở Phụ lục I trước khi code.

## 27. Kiến trúc công nghệ mục tiêu

| Tầng | Công nghệ | Ghi chú |
| --- | --- | --- |
| Frontend | Vite, React 19, TanStack Router, TanStack Query, TanStack Table, Radix UI và shadcn/ui, Tailwind CSS 4, i18next, axios | Repo `eh_am_frontend`; web quản trị và app quét là cùng một ứng dụng, giao diện điện thoại cho app quét |
| Backend | NestJS 11, TypeScript 5.7, Node 22 | Repo `eh_am_backend`; modular monolith, mỗi module nghiệp vụ một thư mục |
| Dữ liệu | Supabase: PostgreSQL, Auth, Storage | Migration SQL đánh số trong `sql-docs/`, chạy theo thứ tự |
| Job | `@nestjs/schedule` | Có khoá để chỉ một instance chạy (§16) |
| Kiểm thử | Jest cho backend, Vitest cho frontend, test e2e cho hợp đồng API | Test phân quyền có cả trường hợp bị từ chối |
| Triển khai | Docker, cổng 3006, kiểm tra sức khoẻ ở `/health` | Môi trường dev, staging, production tách biệt |

Kiến trúc triển khai đề xuất:

- MVP1 chạy một backend dạng modular monolith. Tách service riêng chỉ khi một phần cần mở rộng độc lập hoặc có ranh giới bảo mật riêng, ví dụ adapter FAST ở GĐ2.
- PostgreSQL là nơi lưu dữ liệu chính; ảnh và chứng từ ở Supabase Storage; hàng đợi thông báo và đồng bộ là bảng outbox.
- Mọi request mang mã request xuyên suốt log, nhật ký và phản hồi lỗi, để một báo lỗi từ cửa hàng tra ngược được tới dòng log.

## 28. Cấu trúc repository và bounded context

| Module | Thư mục backend | Bảng chính | Trạng thái |
| --- | --- | --- | --- |
| M01 Người dùng và phân quyền | `src/auth/`, `src/users/` | `user_profiles`, `context_role_assignments` | Auth đã có; quản lý người dùng chưa có |
| M02 Danh mục nền | `src/master-data/` | `locations`, `cost_centers`, `asset_categories`, `suppliers`, `repair_vendors`, `reason_codes` | Chưa có |
| M03 Hồ sơ tài sản | `src/assets/` | `assets`, `asset_events`, `asset_documents` | Chưa có |
| M04 QR và nhãn | `src/labels/` | `label_batches`, `label_prints` | Chưa có |
| M05 Kiểm kê | `src/stocktakes/` | `stocktakes`, `stocktake_locations`, `stocktake_items`, `scan_records` | Chưa có |
| M06 Điều chuyển | `src/transfers/` | `transfers`, `transfer_items` | Chưa có |
| M07 Sửa chữa | `src/repairs/` | `repair_requests`, `repair_costs` | Chưa có |
| M08 Thanh lý | `src/disposals/` | `disposal_requests`, `loss_confirmations` | Chưa có |
| M09 Khấu hao (GĐ2) | `src/depreciation/` | `depreciation_policies`, `depreciation_periods`, `depreciation_lines` | Chưa có |
| M10 FAST (GĐ2) | `src/fast/` | `fast_links`, `sync_outbox`, `sync_logs`, `reconciliation_runs` | Chưa có |
| M11 Dashboard | `src/dashboard/` | View tổng hợp | Chưa có |
| M12 Nhật ký và thông báo | `src/audit/`, `src/notifications/` | `audit_events`, `notifications`, `tasks` | Audit đã có; thông báo chưa có |

Quy tắc bounded context:

- Mỗi module sở hữu bảng, repository, service, mapper, DTO, controller và test của mình.
- `src/common/` chỉ chứa phần dùng chung thật sự (lỗi, i18n, phân trang, repository cơ sở); logic nghiệp vụ của một module không đặt ở đó.
- Module này đọc dữ liệu của module khác qua service công khai của module đó, không truy vấn thẳng bảng của nhau.
- Bảng mới đăng ký tên trong `src/supabase/supabase.define.ts` cùng lúc với migration tạo bảng.

## 29. Hợp đồng kỹ thuật không thương lượng

1. Phạm vi location được xác định ở máy chủ từ vai trò của người dùng và từ tài nguyên đang thao tác; không tin location do client gửi.
2. Không có thao tác xoá cứng dữ liệu nghiệp vụ; bảng lịch sử và nhật ký có trigger chặn sửa, xoá.
3. Mọi thay đổi dữ liệu nghiệp vụ ghi nhật ký; ghi nhật ký lỗi thì thao tác không hoàn tất.
4. Tiền lưu kiểu `numeric` và cộng dồn bằng `SUM()` trong SQL; không cộng tiền bằng số thực trong JavaScript.
5. Thời điểm theo giờ máy chủ; kỳ kiểm kê và kỳ kế toán tính theo múi giờ Asia/Ho_Chi_Minh.
6. API không trả nguyên bản ghi cơ sở dữ liệu; mỗi đối tượng người xem có mapper riêng, và trường giá trị chỉ có trong mapper của vai trò được xem.
7. Lượt gửi từ app quét có khoá chống trùng; gửi lại không tạo bản ghi thứ hai.
8. Tích hợp ngoài (email, FAST) đi qua outbox, có gửi lại và đối soát; thao tác của người dùng không chờ hệ thống ngoài.
9. Log và nhật ký không chứa mật khẩu, token, khoá bí mật, đường dẫn tệp có thời hạn.
10. API có version trong đường dẫn; thay đổi phá vỡ hợp đồng phải lên version mới.

## 30. Nền tảng kỹ thuật đã có

| Hạng mục | Trạng thái | Vị trí trong code |
| --- | --- | --- |
| Đăng ký, xác nhận email, đăng nhập, làm mới phiên, đăng xuất, quên, đặt lại, đổi mật khẩu, hồ sơ cá nhân | Đã có | `src/auth/` |
| Guard xác thực, guard phân quyền theo vai trò và location, dịch vụ phạm vi location | Đã có | `src/auth/guards/`, `src/auth/access-scope.service.ts` |
| Nhật ký chỉ ghi thêm, công cụ tính thay đổi trước và sau | Đã có | `src/audit/` |
| Mã lỗi và thông báo hai ngôn ngữ | Đã có | `src/common/i18n/` |
| Giới hạn tần suất, mã request, log HTTP | Đã có | `src/common/` |
| Migration `01_identity_rbac_audit.sql`: người dùng, phân quyền, nhật ký, trigger lịch sử, RLS | Đã viết, chưa chạy | `sql-docs/migrations/` |
| Kiểu dữ liệu Supabase | Bản viết tay tạm, sinh lại khi có project | `src/supabase/database.types.ts` |
| Danh mục vai trò | Bốn mã tạm, sẽ mở rộng theo §8 | `src/utils/enums/role.enum.ts` |
| Module nghiệp vụ M02 đến M12 | Chưa làm, chờ blueprint được duyệt | |

> **Lưu ý**
> Migration 01 chưa chạy vì Every Half chưa có project Supabase. Bước S01 tạo project, chạy migration và sinh lại kiểu dữ liệu trước khi code module đầu tiên.

## 31. Các bước triển khai

Mười bốn bước, mười ba bước thuộc MVP1 và một bước cho GĐ2. Tuần tính từ kick-off, dựa trên giả định quy mô đội A-11 (§33).

### 31.1. S01: Môi trường và nền dữ liệu

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 1-2, sprint 1 |
| Phạm vi | Tạo project Supabase cho dev, staging, production; chạy migration 01; tạo tài khoản quản trị đầu tiên; sinh lại kiểu dữ liệu; CI chạy format, kiểm kiểu, lint, test |
| Đầu ra chính | Ba môi trường chạy được; `database.types.ts` sinh từ schema thật; pipeline CI |
| Phụ thuộc | G0 |
| Quy trình | Không có |
| Tiêu chí nghiệm thu | `/health` trả 200 trên cả ba môi trường; migration 01 chạy không lỗi; script khởi tạo quản trị báo mọi kiểm tra đạt |
| Quyền mẫu | Chỉ đội triển khai và Quản trị hệ thống |
| Ranh giới tự động hoá | Không có job nghiệp vụ |

### 31.2. S02: Người dùng và phân quyền

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 1-3 |
| Phạm vi | M01: tạo và mời tài khoản, khoá tài khoản, gán và thu hồi vai trò theo location, danh sách người dùng; mở rộng danh mục vai trò theo §8; đóng đăng ký công khai theo D-01 |
| Đầu ra chính | API `/v1/users`, `/v1/role-assignments`; màn hình quản lý người dùng; danh mục vai trò mới trong code |
| Phụ thuộc | S01 |
| Quy trình | WF-01, WF-02 |
| Tiêu chí nghiệm thu | Người không có vai trò trên location bị từ chối ở cả thao tác lẻ và danh sách; tài khoản bị khoá mất quyền ngay ở request kế tiếp |
| Quyền mẫu | `SYSTEM_ADMIN` tạo, khoá, gán vai trò; mọi người dùng xem hồ sơ của mình |
| Ranh giới tự động hoá | Không có |

### 31.3. S03: Danh mục nền

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 2-3 |
| Phạm vi | M02: location năm loại, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa, danh mục lý do; đóng location |
| Đầu ra chính | Migration danh mục; API `/v1/master-data`; màn hình danh mục; dữ liệu danh mục thật của Every Half nạp vào staging |
| Phụ thuộc | S01, S02 |
| Quy trình | WF-13 |
| Tiêu chí nghiệm thu | Mã danh mục không trùng; location còn tài sản hoặc phiếu mở không đóng được |
| Quyền mẫu | `SYSTEM_ADMIN`, `ASSET_MANAGER` sửa; mọi vai trò xem danh mục cần dùng |
| Ranh giới tự động hoá | Không có |

### 31.4. S04: Hồ sơ tài sản và nhập từ file

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 3-5 |
| Phạm vi | M03: tạo, sửa, huỷ hồ sơ; thông tin tài chính; người chịu trách nhiệm; chứng từ; tra cứu, dòng thời gian; nhập từ file Excel; xuất danh sách |
| Đầu ra chính | Migration `assets`, `asset_events`, `asset_documents`; API `/v1/assets`; mapper cho bản quét, bản chi tiết, bản có giá trị |
| Phụ thuộc | S02, S03, S06 (khung nhật ký) |
| Quy trình | WF-03, WF-04 |
| Tiêu chí nghiệm thu | Nhập file mẫu có dòng lỗi: dòng hợp lệ vào hệ thống, báo cáo đúng từng dòng lỗi; vai trò không được xem giá trị không nhận trường giá trị trong phản hồi |
| Quyền mẫu | `ASSET_MANAGER` tạo, sửa; `ASSET_ACCOUNTANT` sửa thông tin tài chính; `LOCATION_MANAGER`, `LOCATION_STAFF` xem tài sản của location mình |
| Ranh giới tự động hoá | Không có |

### 31.5. S05: QR, nhãn và tra cứu

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 4-5 |
| Phạm vi | M04: sinh QR, in nhãn theo lô, xác nhận dán nhãn, quét tra cứu, nhập mã, in lại nhãn |
| Đầu ra chính | API `/v1/labels`, `/v1/scan`; màn hình quét trên điện thoại; mẫu file in nhãn theo khổ nhãn đã chọn (Q-22) |
| Phụ thuộc | S04 |
| Quy trình | WF-03, WF-14 |
| Tiêu chí nghiệm thu | Quét nhãn in thật trên điện thoại Android và iOS ra đúng tài sản; quét tài sản của location khác chỉ hiện thông tin nhận diện |
| Quyền mẫu | `ASSET_MANAGER` in nhãn; mọi vai trò có app quét tra cứu theo quyền |
| Ranh giới tự động hoá | Không có |

### 31.6. S06: Nhật ký, hộp việc và thông báo

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 3-6, khung làm trước, hoàn thiện cùng các module |
| Phạm vi | M12: tra cứu và xuất nhật ký; hộp việc; thông báo trong ứng dụng và email; cấu hình thông báo |
| Đầu ra chính | API `/v1/audit-events`, `/v1/inbox`; job gửi email; mã sự kiện nhật ký cho từng module |
| Phụ thuộc | S01 |
| Quy trình | Dùng chung cho mọi quy trình |
| Tiêu chí nghiệm thu | Mỗi thao tác thay đổi dữ liệu có đúng một dòng nhật ký đủ năm yếu tố; sửa hoặc xoá dòng nhật ký bị cơ sở dữ liệu từ chối |
| Quyền mẫu | `AUDITOR`, `ASSET_MANAGER` tra cứu nhật ký; mọi vai trò xem hộp việc của mình |
| Ranh giới tự động hoá | Job gửi email chỉ gửi, không đổi dữ liệu nghiệp vụ |

### 31.7. S07: Kiểm kê

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 5-8 |
| Phạm vi | M05: lập đợt, mở đợt tự động, quét, tài sản lạ, chốt, duyệt, xử lý chênh lệch, báo cáo |
| Đầu ra chính | API `/v1/stocktakes`; màn hình kiểm kê trên điện thoại có hàng đợi gửi lại; job mở đợt và nhắc hạn |
| Phụ thuộc | S04, S05, S06 |
| Quy trình | WF-05, WF-06 |
| Tiêu chí nghiệm thu | Tắt mạng khi đang quét rồi bật lại: mọi lượt được gửi, không trùng; đợt được duyệt chuyển tài sản không tìm thấy sang "Nghi mất" |
| Quyền mẫu | `ASSET_MANAGER` lập đợt, xử lý chênh lệch; `LOCATION_MANAGER` duyệt; `LOCATION_STAFF` quét |
| Ranh giới tự động hoá | Job chỉ mở đợt và nhắc hạn; không tự chốt hay tự duyệt |

### 31.8. S08: Điều chuyển

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 7-8 |
| Phạm vi | M06: tạo, duyệt, xuất, nhận bằng QR, nhận thiếu, nhận hỏng, huỷ phiếu, lịch sử |
| Đầu ra chính | API `/v1/transfers`; màn hình xuất và nhận trên điện thoại; job cảnh báo quá hạn |
| Phụ thuộc | S04, S05 |
| Quy trình | WF-07 |
| Tiêu chí nghiệm thu | Location và cost center chỉ đổi khi bên nhận quét; phiếu nhận một phần giữ đúng các tài sản còn đang vận chuyển |
| Quyền mẫu | `ASSET_MANAGER`, `LOCATION_MANAGER` tạo phiếu; `LOCATION_MANAGER` của điểm nhận xác nhận |
| Ranh giới tự động hoá | Job chỉ cảnh báo quá hạn |

### 31.9. S09: Báo hỏng và sửa chữa

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 9-10 |
| Phạm vi | M07: báo hỏng bằng QR, tiếp nhận, gửi sửa bên ngoài qua M06, tiến độ, chi phí, duyệt chi phí, nghiệm thu, chuyển thanh lý, lịch sử bảo trì |
| Đầu ra chính | API `/v1/repairs`; màn hình báo hỏng trên điện thoại; màn hình điều phối sửa chữa |
| Phụ thuộc | S04, S08 |
| Quy trình | WF-08, WF-09 |
| Tiêu chí nghiệm thu | Tài sản chỉ đổi sang "Đang sửa chữa" khi yêu cầu được tiếp nhận; gửi sửa bên ngoài tạo đúng phiếu điều chuyển |
| Quyền mẫu | `LOCATION_STAFF`, `LOCATION_MANAGER` báo hỏng; `ASSET_MANAGER` tiếp nhận; `TECHNICIAN` cập nhật tiến độ |
| Ranh giới tự động hoá | Không có |

### 31.10. S10: Thanh lý và xác nhận mất

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 9-10 |
| Phạm vi | M08: đề nghị, duyệt, thực hiện, huỷ thanh lý; xác nhận mất; tìm thấy lại |
| Đầu ra chính | API `/v1/disposals`; màn hình đề nghị và duyệt; biên bản thanh lý đính kèm |
| Phụ thuộc | S04, S07 |
| Quy trình | WF-10, WF-11, WF-12 |
| Tiêu chí nghiệm thu | Người đề nghị không duyệt được đề nghị của mình; tài sản chỉ thành "Đã thanh lý" sau bước thực hiện |
| Quyền mẫu | `LOCATION_MANAGER`, `ASSET_MANAGER` đề nghị; `EXECUTIVE` duyệt theo hạn mức; `ASSET_ACCOUNTANT` ghi nhận thực hiện |
| Ranh giới tự động hoá | Job chỉ cảnh báo đề nghị đã duyệt mà chưa thực hiện |

### 31.11. S11: Dashboard và báo cáo

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 11-12 |
| Phạm vi | M11 phần GĐ1: tổng quan, theo location, mất và hỏng, tiến độ kiểm kê, dashboard của điểm, xuất báo cáo |
| Đầu ra chính | View tổng hợp; API `/v1/dashboard`, `/v1/reports`; màn hình dashboard |
| Phụ thuộc | S07, S08, S09, S10 |
| Quy trình | Không có |
| Tiêu chí nghiệm thu | Số trên dashboard khớp số đếm trực tiếp trên dữ liệu thử; Quản lý điểm chỉ thấy số của điểm mình |
| Quyền mẫu | `EXECUTIVE`, `ASSET_MANAGER` xem toàn chuỗi; `LOCATION_MANAGER` xem điểm mình |
| Ranh giới tự động hoá | Không có |

### 31.12. S12: Chuyển đổi dữ liệu, dán nhãn và pilot

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 3-14, chạy song song với việc xây dựng |
| Phạm vi | Làm sạch danh sách tài sản, nạp theo điểm, in và dán nhãn, kiểm kê lần đầu, pilot tại hai hoặc ba điểm (Q-32) |
| Đầu ra chính | Danh sách tài sản đã đối chiếu của điểm pilot; biên bản dán nhãn; báo cáo pilot |
| Phụ thuộc | S04, S05 cho nạp dữ liệu và nhãn; S07 cho kiểm kê lần đầu |
| Quy trình | WF-04, WF-03, WF-05 |
| Tiêu chí nghiệm thu | Điểm pilot qua ít nhất một đợt kiểm kê đầy đủ; mọi lệch giữa danh sách và thực tế có kết luận |
| Quyền mẫu | `ASSET_MANAGER` nạp dữ liệu và in nhãn; `LOCATION_MANAGER` dán và xác nhận |
| Ranh giới tự động hoá | Không có |

### 31.13. S13: Go-live MVP1 và hypercare

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Tuần 15-20 |
| Phạm vi | Làm sạch dữ liệu và dán nhãn các điểm còn lại theo đợt, đào tạo, go-live theo đợt, hypercare |
| Đầu ra chính | Gói go-live của từng đợt; sổ tay người dùng; báo cáo kết thúc hypercare |
| Phụ thuộc | S01 đến S12, cổng G3 |
| Quy trình | Mọi quy trình GĐ1 |
| Tiêu chí nghiệm thu | Theo tiêu chí kết thúc hypercare ở §36 |
| Quyền mẫu | Như vận hành thật |
| Ranh giới tự động hoá | Mọi job GĐ1 bật trên production |

### 31.14. S14: GĐ2 khấu hao và tích hợp FAST

| Mục | Nội dung |
| --- | --- |
| Lộ trình | Sau cổng G7, khi Q-04 đến Q-07 có câu trả lời |
| Phạm vi | M09 và M10: chính sách khấu hao, số liệu theo kỳ, liên kết mã FAST, đồng bộ theo ma trận sở hữu, nhật ký, đối soát; chỉ số tài chính trên dashboard |
| Đầu ra chính | Adapter FAST theo cách tích hợp được chọn; job đồng bộ và chốt kỳ; báo cáo đối soát |
| Phụ thuộc | G6, G7 |
| Quy trình | WF-15, WF-16 |
| Tiêu chí nghiệm thu | Đối soát thử trên dữ liệu thật khớp với FAST trong sai số Kế toán trưởng chấp nhận |
| Quyền mẫu | `ASSET_ACCOUNTANT`, `CHIEF_ACCOUNTANT` |
| Ranh giới tự động hoá | Job đồng bộ không ghi đè trường mà EH-AM không làm chủ (BR-FST-01) |

## 32. Definition of Done cấp module

Một module chỉ coi là xong khi đạt đủ các điều sau:

- Use case của module đã được duyệt, có đủ luồng thay thế và ngoại lệ.
- Migration có RLS bật, bảng lịch sử có trigger chỉ ghi thêm, cột người thực hiện không có khoá ngoại xoá theo.
- API có version, DTO kiểm dữ liệu và từ chối trường lạ, lỗi trả mã máy đọc được, thông báo đủ tiếng Việt và tiếng Anh.
- Phân quyền theo location có test cho trường hợp được phép và bị từ chối, ở cả thao tác lẻ và danh sách.
- Mọi thay đổi dữ liệu ghi nhật ký; nhật ký ghi lỗi thì thao tác không hoàn tất.
- Dữ liệu trả ra qua mapper theo người xem; trường giá trị không lọt vào phản hồi của vai trò không được xem.
- `npm run format`, `npx tsc --noEmit`, `npx eslint src test`, `npm test` chạy sạch; test e2e của module xanh.
- Giao diện có trạng thái rỗng, đang tải và lỗi; dùng được trên điện thoại với các màn hình của app quét.
- Đã demo cho đại diện Every Half phụ trách module và ghi nhận ý kiến vào backlog.
- Blueprint và use case được cập nhật nếu trong lúc làm có thay đổi phạm vi.

# PHẦN VII. Lộ trình, cổng kiểm soát, chuyển đổi dữ liệu và go-live

Kế hoạch đưa MVP1 từ kick-off tới vận hành ổn định trên toàn chuỗi, rồi mở GĐ2.

> **Tuyên bố thiết kế**
> Mốc thời gian dưới đây là ước tính của đội triển khai, tính theo tuần kể từ kick-off. Mỗi cổng chỉ qua khi có bằng chứng theo tiêu chí của cổng đó.

## 33. Lộ trình triển khai

Lộ trình dựa trên giả định A-11 về đội triển khai (một PO/BA, một đến hai backend, một frontend, một QA bán thời gian), sprint hai tuần, và giả định A-16 rằng dữ liệu tài sản hiện có không cần làm sạch quá nhiều. Đội nhỏ hơn thì MVP1 kéo dài thêm khoảng 4 đến 6 tuần. Ngày go-live cụ thể chốt sau khi Every Half trả lời Q-24, tránh kỳ khoá sổ và mùa cao điểm (A-19).

| Tuần | Giai đoạn | Việc chính | Cổng |
| --- | --- | --- | --- |
| 0 | Khởi động | Duyệt blueprint và phạm vi MVP1; trả lời các câu hỏi ưu tiên ở Phụ lục H | G0 |
| 1-2 | Sprint 1 | S01 môi trường; S02 người dùng và phân quyền; bắt đầu S03 | G1 cuối tuần 2 |
| 3-4 | Sprint 2 | S03 danh mục nền; S04 hồ sơ tài sản; khung S06; bắt đầu làm sạch dữ liệu điểm pilot (S12) | |
| 5-6 | Sprint 3 | S05 QR và nhãn; S07 kiểm kê; in nhãn cho điểm pilot | |
| 7-8 | Sprint 4 | Hoàn thiện S07; S08 điều chuyển | |
| 9-10 | Sprint 5 | S09 sửa chữa; S10 thanh lý và xác nhận mất; dán nhãn tại điểm pilot | |
| 11-12 | Sprint 6 | S11 dashboard; hoàn thiện S06; kiểm thử hồi quy toàn bộ GĐ1 | G2 cuối tuần 12 |
| 13-14 | Pilot | Chạy thật tại hai hoặc ba điểm (Q-32), qua một đợt kiểm kê; sửa lỗi | G3 cuối tuần 14 |
| 15-16 | Chuẩn bị go-live | Làm sạch dữ liệu và dán nhãn các điểm còn lại theo đợt; đào tạo | G4 cuối tuần 16 |
| 17 | Go-live đợt đầu | Mở hệ thống cho nhóm điểm đầu tiên | G5 |
| 17-20 | Go-live và hypercare | Mở các đợt còn lại; hỗ trợ tăng cường | G6 cuối tuần 20 |
| Sau G6 | GĐ2 | S14 khấu hao và FAST, khoảng 6 đến 8 tuần khi đã có câu trả lời Q-04 đến Q-07 | G7, G8 |

## 34. Cổng kiểm soát

| Mã | Tên | Mục đích | Điều kiện qua cổng | Thẩm quyền | Quyết định có thể |
| --- | --- | --- | --- | --- | --- |
| G0 | Khởi động | Duyệt phạm vi MVP1, lộ trình, đội | Blueprint được duyệt; đầu mối Every Half cho từng module được chỉ định | Ban chỉ đạo | Qua, qua có điều kiện, hoãn |
| G1 | Chốt nền tảng | Không đổi mô hình phân quyền và trạng thái sau khi code nghiệp vụ | Vai trò và phạm vi xem giá trị đã chốt (Q-16); trạng thái đã chốt (Q-10, Q-11); danh mục location có đủ | Ban chỉ đạo | Qua, qua có điều kiện |
| G2 | Sẵn sàng pilot | Mười module GĐ1 chạy trên staging | Kiểm thử hồi quy xanh; dữ liệu điểm pilot đã đối chiếu; nhãn đã dán và xác nhận | Trưởng bộ phận Vận hành | Qua, sửa rồi xét lại |
| G3 | Kết thúc pilot | Quyết định mở rộng ra toàn chuỗi | Điểm pilot qua một đợt kiểm kê đầy đủ; không còn lỗi nghiêm trọng; người dùng tự làm được các thao tác chính | Ban chỉ đạo | Mở rộng, kéo dài pilot, dừng |
| G4 | Sẵn sàng go-live | Nhóm điểm đầu tiên sẵn sàng | Dữ liệu và nhãn của nhóm điểm đầu đã đối chiếu; đào tạo xong; sao lưu và khôi phục đã chạy thử | Ban chỉ đạo | Qua, hoãn |
| G5 | Go-live đợt đầu | Mở hệ thống cho nhóm điểm đầu tiên | Kiểm tra sau khi mở: đăng nhập, quét, kiểm kê, nhận hàng chạy được tại điểm | Ban giám đốc | Tiếp tục, dừng đợt, quay lại |
| G6 | Kết thúc hypercare | Chuyển sang hỗ trợ thường xuyên | Mọi điểm đã go-live; đợt kiểm kê đầu tiên sau go-live được duyệt ở mọi điểm; không còn lỗi nghiêm trọng | Trưởng bộ phận Vận hành | Chuyển hỗ trợ thường xuyên, kéo dài hypercare |
| G7 | Khởi động GĐ2 | Bắt đầu khấu hao và FAST | Q-04 đến Q-07 có câu trả lời; phương án khấu hao ở M09 được chọn | Kế toán trưởng | Qua, hoãn |
| G8 | Go-live GĐ2 | Bật đồng bộ FAST trên production | Đối soát thử trên dữ liệu thật khớp trong sai số Kế toán trưởng chấp nhận | Kế toán trưởng | Qua, hoãn |

Nguyên tắc cổng:

- Tới ngày trên kế hoạch không phải là lý do để qua cổng; cần bằng chứng theo cột điều kiện.
- Đội triển khai không tự duyệt cổng của mình.
- "Qua có điều kiện" phải ghi rõ điều kiện, người chịu trách nhiệm và hạn hoàn thành.
- Không mở rộng khi pilot còn lỗi nghiêm trọng chưa xử lý.
- Thay đổi lớn về phạm vi thì xét lại cổng gần nhất đã qua.

## 35. Chuyển đổi dữ liệu và chiến dịch dán nhãn

1. Thu thập danh sách tài sản hiện có (Excel hoặc xuất từ FAST) và chọn một nguồn chính (A-10, Q-21).
2. Làm sạch: serial trùng, thiếu trường bắt buộc, location và loại không khớp danh mục; Kế toán trưởng và trưởng bộ phận Vận hành xác nhận danh sách sau khi sửa.
3. Chuyển danh sách về mẫu nhập của F-AST-02, nạp thử trên staging và sửa theo báo cáo lỗi.
4. Nạp từng điểm vào production; hồ sơ ở trạng thái chưa xác nhận dán nhãn.
5. In nhãn theo lô cho từng điểm (F-QR-02) và gửi tới điểm cùng danh sách tài sản.
6. Dán nhãn và xác nhận bằng quét (F-QR-03); tài sản không tìm thấy khi dán được ghi lại.
7. Kiểm kê lần đầu ngay sau khi dán xong; kết quả là số liệu nền của điểm.
8. Đối chiếu kết quả kiểm kê lần đầu với danh sách đã nạp; điểm còn lệch lớn thì dán và kiểm lại trước khi mở hệ thống cho điểm đó.

> **Không được phép**
> Không mở hệ thống cho một điểm khi chưa đối chiếu xong danh sách của điểm đó. Không xoá hồ sơ nhập sai; hồ sơ sai được huỷ theo F-AST-09. Không nạp đè lên hồ sơ đã có lịch sử. Không in nhãn với Asset ID mới cho tài sản đã có Asset ID.

## 36. Go-live và hypercare

- Go-live theo đợt: điểm pilot trước, sau đó từng nhóm điểm; Every Half chọn thứ tự nhóm.
- Gói go-live của mỗi đợt gồm: danh sách điểm, dữ liệu đã đối chiếu, tài khoản và vai trò, nhãn đã dán, người dùng đã được đào tạo, sao lưu trước khi mở, kế hoạch quay lại.
- Trực chiến gồm đội triển khai và đầu mối của Every Half cho Vận hành, Kế toán, IT; giờ trực và cách liên hệ chốt theo Q-33.
- Quyết định ở mỗi đợt: tiếp tục, tiếp tục có điều kiện, dừng đợt, quay lại.
- Hypercare kết thúc khi đợt kiểm kê đầu tiên sau go-live được duyệt ở mọi điểm, không còn lỗi nghiêm trọng, số yêu cầu hỗ trợ giảm dần, và người dùng tự làm được các thao tác chính mà không cần hỏi.

## 37. Đo lường lợi ích

| Lợi ích | Chỉ số | Số liệu nền cần có trước go-live | Thời điểm đo |
| --- | --- | --- | --- |
| Biết tài sản ở đâu | Tỷ lệ tài sản có hồ sơ và nhãn; tỷ lệ kết quả "có mặt" trong đợt kiểm kê | Số tài sản cần quản lý (Q-03) | Sau kiểm kê lần đầu, sau đó hằng tháng |
| Kiểm kê nhanh và kiểm chứng được | Giờ công cho một đợt kiểm kê của điểm; tỷ lệ lượt quét có ảnh | Giờ công kiểm kê hiện nay (Q-01) | Tháng thứ hai sau go-live |
| Giảm mất mát | Tỷ lệ tài sản mất trong kỳ | Số tài sản mất trong năm trước (Q-01) | Hằng quý |
| Nhận hàng có trách nhiệm | Tỷ lệ phiếu được nhận đủ trong hạn | Không có, quy trình mới | Hằng tháng |
| Chi phí sửa minh bạch | Chi phí sửa theo loại tài sản và đơn vị sửa | Không có, dữ liệu mới | Hằng quý |
| Sổ khớp FAST (GĐ2) | Chênh lệch với FAST sau đối soát | Chênh lệch hiện nay (Q-01) | Sau mỗi kỳ đối soát |

Lợi ích nào có số liệu nền thì so với số nền; lợi ích nào chưa có số nền thì đo từ kỳ đầu tiên sau go-live và ghi rõ điều đó trong báo cáo.

## 38. Mở rộng quy mô chuỗi

- Mở điểm mới: tạo location và cost center, gán vai trò, nạp hoặc tạo hồ sơ tài sản, in và dán nhãn, kiểm kê lần đầu; quy trình giống chiến dịch ở §35 cho một điểm.
- Đóng điểm: điều chuyển hết tài sản rồi đóng location theo WF-13.
- Thêm loại tài sản: thêm vào danh mục loại ở M02, không cần sửa code.
- Thêm pháp nhân (Q-25): thêm cấp pháp nhân trên location; ở GĐ2, mỗi pháp nhân nối với một sổ FAST.
- Thêm cấp vùng (Q-17): thêm nhóm location và vai trò theo vùng mà không đổi cách gán vai trò theo location.
- Nhượng quyền: ngoài phạm vi hiện tại, cần thiết kế riêng về quyền sở hữu dữ liệu.

## 39. Thứ tự thực thi cho đội phát triển

Cổng merge chung của mọi bước: đạt Definition of Done ở §32 và có ít nhất một người khác review.

| Seq | Bước | Tên | Nhánh git | Điều kiện trước | Cổng merge riêng |
| --- | --- | --- | --- | --- | --- |
| 1 | S01 | Môi trường và nền dữ liệu | `feature/s01-foundation` | G0 | Migration 01 chạy trên staging |
| 2 | S02 | Người dùng và phân quyền | `feature/s02-iam` | S01 | Test phân quyền bị từ chối xanh |
| 3 | S03 | Danh mục nền | `feature/s03-master-data` | S01, S02 | Danh mục thật nạp vào staging |
| 4 | S06 | Nhật ký, hộp việc, thông báo (khung) | `feature/s06-audit-inbox` | S01 | Trigger chỉ ghi thêm được test |
| 5 | S04 | Hồ sơ tài sản và nhập từ file | `feature/s04-assets` | S02, S03, S06 | Nhập file mẫu đúng báo cáo lỗi |
| 6 | S05 | QR, nhãn và tra cứu | `feature/s05-labels-scan` | S04 | Quét nhãn in thật trên hai hệ điều hành |
| 7 | S07 | Kiểm kê | `feature/s07-stocktakes` | S04, S05, S06 | Thử mất mạng khi quét |
| 8 | S08 | Điều chuyển | `feature/s08-transfers` | S04, S05 | Nhận một phần đúng |
| 9 | S09 | Báo hỏng và sửa chữa | `feature/s09-repairs` | S04, S08 | Gửi sửa tạo đúng phiếu điều chuyển |
| 10 | S10 | Thanh lý và xác nhận mất | `feature/s10-disposals` | S04, S07 | Kiểm phân tách nhiệm vụ |
| 11 | S11 | Dashboard và báo cáo | `feature/s11-dashboard` | S07, S08, S09, S10 | Số khớp đếm trực tiếp |
| 12 | S13 | Phát hành MVP1 | `release/mvp1` | S01 đến S11, G3 | Gói go-live đợt đầu |
| 13 | S14 | GĐ2 khấu hao và FAST | `feature/s14-phase2` | G7 | Đối soát thử khớp |

S12 là công việc vận hành (làm sạch dữ liệu, dán nhãn, pilot) chạy song song, không có nhánh code riêng.

## 40. Tiêu chí nghiệm thu Master Blueprint

1. Mọi dòng của brief (B-01 đến B-40) có ít nhất một tính năng tương ứng ở Phụ lục F.
2. Mười hai module có ranh giới rõ, không có hai module cùng làm một việc.
3. Mỗi tính năng có mã, giai đoạn và nguồn; mỗi quy tắc có mã.
4. Chín nhóm người dùng có mã vai trò và phạm vi location; phạm vi xem giá trị được Every Half xác nhận.
5. Trạng thái của tài sản và của từng loại phiếu có bảng chuyển trạng thái.
6. Mỗi giả định có người xác nhận; mỗi câu hỏi mở có người trả lời và cổng cần trả lời trước.
7. Phạm vi MVP1 và phần để lại cho GĐ2, GĐ3 được Every Half đồng ý.
8. Đội triển khai viết được use case, story và test case từ blueprint mà không phải đoán ý.

## 41. Tuyên bố kết thúc

Blueprint 1.0 chốt phạm vi MVP1 của EH-AM: mười module GĐ1 đủ để mọi tài sản cần quản lý có hồ sơ, nhãn QR, lịch sử và một người chịu trách nhiệm, và để việc kiểm kê hằng tháng làm được trên điện thoại. Khấu hao và tích hợp FAST được thiết kế sẵn chỗ nối và làm ở GĐ2.

Việc tiếp theo là Every Half duyệt blueprint ở cổng G0 và trả lời các câu hỏi ưu tiên ở Phụ lục H. Sau đó đội triển khai chạy S01, viết story từ bộ use case và làm theo thứ tự ở §39.

# PHỤ LỤC

Bảng tham chiếu cho đội triển khai và Every Half khi rà phạm vi, viết use case và theo dõi câu hỏi mở.

> **Tuyên bố thiết kế**
> Các mã giả định, câu hỏi, rủi ro, quyết định và màn hình được định nghĩa tại đây. Nơi khác trong tài liệu và trong bộ use case chỉ tham chiếu theo mã.

## Phụ lục A. Nhóm API và hợp đồng tích hợp

| Nhóm API | Tài nguyên chính | Module | GĐ |
| --- | --- | --- | --- |
| `/v1/auth` | Đăng ký (đóng khi D-01 được duyệt), xác nhận email, đăng nhập, làm mới phiên, đăng xuất, đăng xuất mọi thiết bị, quên, đặt lại, đổi mật khẩu, `/me` | M01 | GĐ1, đã có |
| `/v1/users`, `/v1/role-assignments` | Tài khoản, lời mời, khoá, vai trò theo location | M01 | GĐ1 |
| `/v1/master-data` | Location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa, lý do | M02 | GĐ1 |
| `/v1/assets` | Hồ sơ, thông tin tài chính, người chịu trách nhiệm, chứng từ, dòng thời gian, nhập từ file, xuất danh sách | M03 | GĐ1 |
| `/v1/labels`, `/v1/scan` | Lô in nhãn, in lại, xác nhận dán nhãn, tra cứu bằng QR | M04 | GĐ1 |
| `/v1/stocktakes` | Đợt, điểm trong đợt, lượt quét, chốt, duyệt, chênh lệch | M05 | GĐ1 |
| `/v1/transfers` | Phiếu, duyệt, xuất, nhận, nhận thiếu, huỷ | M06 | GĐ1 |
| `/v1/repairs` | Yêu cầu, tiếp nhận, tiến độ, chi phí, nghiệm thu | M07 | GĐ1 |
| `/v1/disposals` | Đề nghị thanh lý, thực hiện, xác nhận mất, tìm thấy lại | M08 | GĐ1 |
| `/v1/dashboard`, `/v1/reports` | Chỉ số, báo cáo, xuất file | M11 | GĐ1 |
| `/v1/audit-events`, `/v1/inbox` | Nhật ký, hộp việc, thông báo | M12 | GĐ1 |
| `/v1/depreciation`, `/v1/fast` | Chính sách, kỳ, liên kết mã, nhật ký đồng bộ, đối soát | M09, M10 | GĐ2 |

| Hệ thống ngoài | Hợp đồng tích hợp | GĐ |
| --- | --- | --- |
| Email | Gửi qua hàng đợi thông báo; gửi lỗi thì thử lại và ghi log; nội dung không chứa giá trị tài sản | GĐ1 |
| Supabase Storage | Tải lên và tải về bằng đường dẫn có thời hạn do backend cấp sau khi kiểm quyền; tệp không công khai | GĐ1 |
| Máy in nhãn | EH-AM xuất file theo khổ nhãn đã cấu hình; máy in nhận file, không kết nối trực tiếp | GĐ1 |
| FAST | Qua outbox, có khoá chống trùng, gửi lại, nhật ký Synced, Pending, Error, đối soát theo kỳ; cách kết nối chờ Q-04 | GĐ2 |
| Zalo, Lark | Kênh thông báo bổ sung, chờ Q-23 | GĐ3 |

## Phụ lục B. Mã trạng thái chuẩn

### B.1. Trạng thái vòng đời tài sản

| Mã trạng thái | Tên hiển thị | Ý nghĩa | Kết thúc | Nguồn |
| --- | --- | --- | --- | --- |
| `IN_STORAGE` | Lưu kho | Có hồ sơ, chưa đưa vào sử dụng hoặc đang để dự phòng | Không | [Đề xuất] |
| `IN_USE` | Đang sử dụng | Đang dùng tại một location | Không | [Brief] B-09 |
| `PENDING_TRANSFER` | Chờ điều chuyển | Nằm trong phiếu điều chuyển chưa xuất | Không | [Brief] B-09 |
| `IN_TRANSIT` | Đang vận chuyển | Đã xuất, bên nhận chưa xác nhận (Q-11) | Không | [Đề xuất] |
| `UNDER_REPAIR` | Đang sửa chữa | Có phiếu sửa đã tiếp nhận | Không | [Brief] B-09 |
| `MISSING` | Nghi mất | Không tìm thấy khi kiểm kê, đang xác minh | Không | [Đề xuất] |
| `PENDING_DISPOSAL` | Chờ thanh lý | Đề nghị thanh lý đã duyệt, chưa thực hiện | Không | [Đề xuất] |
| `DISPOSED` | Đã thanh lý | Thanh lý đã thực hiện, có biên bản | Có | [Brief] B-09 |
| `LOST` | Mất | Đã xác minh và được duyệt xác nhận mất | Có | [Brief] B-09 |
| `CANCELLED` | Hủy | Hồ sơ tạo sai hoặc trùng, đã huỷ có duyệt; nghĩa của "Hủy" chờ Q-10 | Có | [Brief] B-09 |

### B.2. Tình trạng vật lý

| Mã tình trạng | Tên hiển thị | Ý nghĩa |
| --- | --- | --- |
| `GOOD` | Tốt | Dùng bình thường |
| `MINOR_DAMAGE` | Hư hỏng nhẹ | Vẫn dùng được, cần theo dõi hoặc sửa khi thuận tiện |
| `DAMAGED` | Hư hỏng | Không dùng được, cần báo hỏng |

### B.3. Kết quả kiểm kê từng tài sản

| Mã kết quả | Tên hiển thị | Ý nghĩa |
| --- | --- | --- |
| `PRESENT` | Có mặt | Tài sản ở đúng location, được quét, có ảnh |
| `DAMAGED` | Hư hỏng | Tài sản có mặt nhưng hư hỏng, có ảnh |
| `WRONG_LOCATION` | Sai vị trí | Tài sản đang ghi ở location khác được tìm thấy tại điểm kiểm |
| `NOT_FOUND` | Không tìm thấy | Có trong danh sách dự kiến nhưng chưa được quét khi chốt |
| `UNLISTED` | Tài sản lạ | Tài sản chưa có nhãn hoặc không có trong hệ thống |

### B.4. Trạng thái phiếu và đề nghị

| Đối tượng | Trạng thái |
| --- | --- |
| Điểm trong đợt kiểm kê | `NOT_STARTED` Chưa bắt đầu · `COUNTING` Đang kiểm · `SUBMITTED` Đã chốt · `RECOUNT_REQUESTED` Yêu cầu kiểm lại · `APPROVED` Đã duyệt |
| Phiếu điều chuyển | `DRAFT` Nháp · `PENDING_APPROVAL` Chờ duyệt · `APPROVED` Đã duyệt · `IN_TRANSIT` Đang vận chuyển · `PARTIALLY_RECEIVED` Nhận một phần · `RECEIVED` Đã nhận · `CANCELLED` Đã huỷ |
| Phiếu sửa chữa | `REPORTED` Mới báo · `ACCEPTED` Đã tiếp nhận · `AWAITING_QUOTE` Chờ báo giá · `AWAITING_COST_APPROVAL` Chờ duyệt chi phí · `IN_REPAIR` Đang sửa · `AWAITING_PARTS` Chờ linh kiện · `REPAIRED` Đã sửa xong · `ACCEPTED_BACK` Đã nghiệm thu · `REJECTED` Đã từ chối · `TO_DISPOSAL` Chuyển thanh lý |
| Đề nghị thanh lý, đề nghị xác nhận mất, đề nghị tìm thấy lại | `DRAFT` Nháp · `PENDING_APPROVAL` Chờ duyệt · `APPROVED` Đã duyệt · `COMPLETED` Đã thực hiện · `REJECTED` Đã từ chối · `CANCELLED` Đã huỷ |
| Tài khoản | `ACTIVE` Đang hoạt động · `SUSPENDED` Tạm khoá · `DEACTIVATED` Đã ngừng |
| Yêu cầu đồng bộ FAST (GĐ2) | `PENDING` · `SYNCED` · `ERROR` |

## Phụ lục C. Module và bước triển khai

| Bước | Tuần | GĐ | Phụ thuộc | Module |
| --- | --- | --- | --- | --- |
| S01 | 1-2 | GĐ1 | G0 | Nền tảng môi trường |
| S02 | 1-3 | GĐ1 | S01 | M01 Người dùng và phân quyền |
| S03 | 2-3 | GĐ1 | S01, S02 | M02 Danh mục nền |
| S04 | 3-5 | GĐ1 | S02, S03, S06 | M03 Hồ sơ tài sản và CCDC |
| S05 | 4-5 | GĐ1 | S04 | M04 QR và nhãn |
| S06 | 3-6 | GĐ1 | S01 | M12 Nhật ký, lịch sử và thông báo |
| S07 | 5-8 | GĐ1 | S04, S05, S06 | M05 Kiểm kê |
| S08 | 7-8 | GĐ1 | S04, S05 | M06 Điều chuyển |
| S09 | 9-10 | GĐ1 | S04, S08 | M07 Báo hỏng, sửa chữa và bảo trì |
| S10 | 9-10 | GĐ1 | S04, S07 | M08 Thanh lý và báo giảm |
| S11 | 11-12 | GĐ1 | S07, S08, S09, S10 | M11 Dashboard và báo cáo |
| S12 | 3-14 | GĐ1 | S04, S05, S07 | Chuyển đổi dữ liệu, dán nhãn, pilot |
| S13 | 15-20 | GĐ1 | S01 đến S12, G3 | Go-live MVP1 và hypercare |
| S14 | Sau G7 | GĐ2 | G6, G7 | M09 Khấu hao và M10 FAST |

## Phụ lục D. Tài liệu tham chiếu

| Tài liệu | Vị trí |
| --- | --- |
| Bộ use case của MVP1 | `business/product-docs/product-usecase/README.md` |
| Bản chép brief có mã B-01 đến B-40 | `docs/superpowers/notes/2026-09-29-brief-every-half.md` |
| Kết quả khai thác yêu cầu | `docs/superpowers/notes/2026-09-29-kham-pha-yeu-cau.md` |
| Sổ đăng ký giả định, câu hỏi, rủi ro | `docs/superpowers/notes/2026-09-29-so-dang-ky-a-q-r.md` |
| Thiết kế và kế hoạch soạn bộ tài liệu | `docs/superpowers/specs/`, `docs/superpowers/plans/` |
| Migration cơ sở dữ liệu | `sql-docs/` trong repo `eh_am_backend` |
| Hướng dẫn codebase backend | `CLAUDE.md`, `README.md` của repo `eh_am_backend` |
| Frontend | Repo `eh_am_frontend` |
| Khung mục tham chiếu | FDI Today Master Blueprint All-In-One 5.0 |

## Phụ lục E. Mẫu use case

Use case của EH-AM theo mẫu 13 trường (Karl Wiegers, IIBA) của skill `use-case-writer`, viết bằng tiếng Việt. Mẫu đầy đủ ở `business/product-docs/product-usecase/_chung/mau-uc.md`.

| Trường | Nội dung cần có |
| --- | --- |
| Tác nhân | Một tác nhân chính, lấy từ danh mục tác nhân; các tác nhân phụ nếu có |
| Mô tả | Hai đến bốn câu: vì sao, làm gì, kết quả |
| Tiền điều kiện | Điều kiện kiểm được phải đúng trước khi bắt đầu |
| Hậu điều kiện | Trạng thái hệ thống sau khi thành công, kiểm được |
| Độ ưu tiên | Cao, Trung bình, Thấp kèm lý do |
| Tần suất sử dụng | Số lần theo đơn vị thời gian, gắn mã giả định hoặc đánh dấu chờ số liệu |
| Luồng sự kiện chính | Các bước đánh số, luân phiên tác nhân và hệ thống, không rẽ nhánh |
| Luồng thay thế | Các đường khác vẫn đạt mục tiêu, neo vào một bước của luồng chính |
| Ngoại lệ | Các trường hợp không đạt mục tiêu: khi nào, hệ thống phản hồi gì, trạng thái cuối |
| Bao gồm | Use case được gọi lại |
| Yêu cầu đặc biệt | Yêu cầu phi chức năng: hiệu năng, bảo mật, tin cậy, tuân thủ, audit |
| Giả định | Điều tin là đúng nhưng chưa kiểm chứng |
| Ghi chú và vấn đề mở | Câu hỏi còn mở, người trả lời, hạn |

Mỗi use case tham chiếu tính năng (`F-`) và quy tắc (`BR-`) của blueprint theo mã, và tự kiểm theo checklist 20 điểm của skill trước khi bàn giao.

## Phụ lục F. Truy vết brief, module và tính năng

Nội dung nguyên văn từng dòng ở bản chép brief (Phụ lục D). Cột Nội dung dưới đây là bản rút gọn.

| Dòng brief | Nội dung | Module | Tính năng |
| --- | --- | --- | --- |
| B-01 | Quản lý toàn bộ tài sản, CCDC tại cửa hàng, kho, roastery, văn phòng | M02, M03 | F-MDM-01, F-AST-01, F-AST-07 |
| B-02 | Truy xuất: là gì, ở đâu, ai quản lý, giá trị, tình trạng, lịch sử | M03, M04 | F-AST-08, F-QR-04 |
| B-03 | Asset ID và QR Code | M03, M04 | F-AST-01, F-QR-01 |
| B-04 | Tên, loại, serial, hình ảnh | M02, M03 | F-MDM-04, F-AST-01, F-AST-03 |
| B-05 | Ngày mua, nhà cung cấp, invoice hoặc PO | M02, M03 | F-MDM-05, F-AST-01 |
| B-06 | Nguyên giá, khấu hao, giá trị còn lại | M03, M09 | F-AST-04, F-DEP-03 |
| B-07 | Location, cost center, người quản lý | M02, M03 | F-MDM-01, F-MDM-03, F-AST-01, F-AST-05 |
| B-08 | Hồ sơ, chứng từ liên quan | M03 | F-AST-06 |
| B-09 | Sáu trạng thái tài sản | M03, M08 | F-AST-09, F-DSP-03, F-DSP-05 |
| B-10 | Mỗi tài sản có QR riêng | M04 | F-QR-01, F-QR-02, F-QR-03 |
| B-11 | Scan QR bằng điện thoại khi kiểm kê hằng tháng | M05 | F-STK-01, F-STK-02, F-STK-03 |
| B-12 | Xác nhận có mặt, mất, sai vị trí, hư hỏng | M05 | F-STK-03, F-STK-04, F-STK-05, F-STK-06 |
| B-13 | Ghi người scan, thời gian, hình ảnh, toạ độ, tình trạng | M05 | F-STK-03 |
| B-14 | Lịch sử di chuyển giữa kho, store, sửa chữa | M06, M07 | F-TRF-01, F-TRF-07, F-MNT-03 |
| B-15 | Store nhận hàng scan QR để xác nhận | M06 | F-TRF-04 |
| B-16 | Không xoá lịch sử điều chuyển | M06, M12 | F-TRF-07, F-AUD-01 |
| B-17 | Báo hỏng khi scan QR tại store | M07 | F-MNT-01 |
| B-18 | Lịch sử bảo trì, chi phí, đơn vị cung cấp dịch vụ | M02, M07 | F-MDM-06, F-MNT-05, F-MNT-08 |
| B-19 | Cập nhật trạng thái trong quá trình sửa | M07 | F-MNT-02, F-MNT-04, F-MNT-06 |
| B-20 | Duyệt thanh lý, đổi trạng thái, báo giảm trên FAST | M08, M10 | F-DSP-01, F-DSP-02, F-DSP-03, F-DSP-07 |
| B-21 | Theo dõi nguyên giá | M03, M09 | F-AST-04, F-DEP-03 |
| B-22 | Theo dõi khấu hao tháng | M09 | F-DEP-02, F-DEP-03 |
| B-23 | Theo dõi khấu hao luỹ kế | M09 | F-DEP-03 |
| B-24 | Theo dõi giá trị còn lại | M09 | F-DEP-03 |
| B-25 | Tuân thủ chính sách kế toán và quy định Việt Nam | M09 | F-DEP-01 |
| B-26 | Asset System quản lý vận hành và tài sản vật lý | M03 | F-AST-01, F-AST-08 |
| B-27 | FAST quản lý kế toán | M10 | F-FST-02, F-FST-03 |
| B-28 | Mapping Asset ID với FAST Asset Code | M10 | F-FST-01 |
| B-29 | Đồng bộ hai chiều nguyên giá, phân loại, khấu hao, cost center, thanh lý | M10 | F-FST-02, F-FST-03 |
| B-30 | Log trạng thái Synced, Pending, Error | M10 | F-FST-04 |
| B-31 | Dashboard tổng tài sản và giá trị | M11 | F-DSH-01 |
| B-32 | Dashboard tài sản theo store, roastery, kho | M11 | F-DSH-02 |
| B-33 | Dashboard khấu hao, giá trị còn lại | M11 | F-DSH-07 |
| B-34 | Dashboard tài sản mất, hỏng | M11 | F-DSH-03 |
| B-35 | Dashboard kiểm kê đã hoàn thành | M05, M11 | F-STK-08, F-DSH-04 |
| B-36 | Dashboard chênh lệch với FAST | M10, M11 | F-FST-05, F-DSH-08 |
| B-37 | Không bao giờ xoá lịch sử | M12 | F-AUD-01 |
| B-38 | Lưu Ai, Khi nào, Thay đổi gì, Trước/Sau, Lý do | M12 | F-AUD-01, F-AUD-02 |
| B-39 | Phân quyền theo vai trò và theo location | M01 | F-IAM-04 |
| B-40 | North Star: quét là biết đủ và thấy toàn bộ lịch sử | M03, M04 | F-QR-04, F-AST-08 |

## Phụ lục G. Giả định

Mỗi giả định được chấm hai thang. "Hậu quả nếu sai" tính theo ảnh hưởng tới MVP1: Cao là phải đổi thiết kế nền, lộ trình dài thêm nhiều tuần, hoặc cửa hàng không dùng được hệ thống; Trung bình là sửa dữ liệu, quy tắc hay luồng trong vài module, hoặc dời ngày mà khối việc không đổi; Thấp là chỉnh cấu hình, danh mục, hoặc chỉ ảnh hưởng GĐ2. "Mức chắc chắn" là độ tin hiện có khi chưa phỏng vấn được Every Half. Bảng xếp theo hậu quả trước, mức chắc chắn sau; giả định hậu quả cao mà chắc chắn thấp được xác nhận đầu tiên.

| Mã | Giả định | Hậu quả nếu sai | Mức chắc chắn | Ưu tiên | Cách xác nhận | Ai xác nhận |
| --- | --- | --- | --- | --- | --- | --- |
| A-16 | Danh sách tài sản hiện có ghi đủ serial, ngày mua, nguyên giá cho phần lớn bản ghi | Cao | Thấp | 1 | Xin file danh sách đang dùng (FAST hoặc Excel), lấy ngẫu nhiên 30 dòng, đếm số dòng đủ cả ba trường; lấy thêm 10 dòng của một cửa hàng để đối chiếu với tài sản thật tại đó | Kế toán trưởng, Vận hành |
| A-09 | Mỗi nhân viên dùng tài khoản riêng | Cao | Thấp | 2 | Nhờ Nhân sự đếm ở hai cửa hàng số nhân viên có email công ty và số chỉ có điện thoại; hỏi IT nhân viên ca và bán thời gian có được cấp tài khoản riêng không, cửa hàng có đang dùng chung tài khoản cho phần mềm nào không (Q-18) | IT, Nhân sự |
| A-17 | Ban giám đốc và Nhân sự đưa việc quét kiểm kê vào quy trình ca làm việc | Cao | Thấp | 3 | Hỏi Ban giám đốc ở G0 ai ra văn bản đưa việc quét vào ca và áp dụng từ ngày nào; xin checklist ca hiện tại của cửa hàng để chỉ ra chỗ thêm việc quét | Ban giám đốc, Nhân sự |
| A-11 | Đội triển khai gồm một PO/BA, một đến hai backend, một frontend, một QA bán thời gian | Cao | Trung bình | 4 | Lập danh sách người theo tên, vai trò và tỷ lệ thời gian dành cho EH-AM tới hết hypercare; chỉ có một backend thì tính lại lộ trình §33 trước G0 | Duy |
| A-10 | Có danh sách tài sản hiện tại làm dữ liệu ban đầu | Cao | Trung bình | 5 | Hỏi danh sách tài sản đang nằm ở đâu (FAST, Excel của từng bộ phận); xin một file mẫu của mỗi nguồn, xem file có cho biết tài sản đang ở điểm nào không (Q-21) | Kế toán trưởng, Vận hành |
| A-04 | Mỗi điểm có ít nhất một điện thoại có camera và mạng dùng được cho việc quét | Cao | Trung bình | 6 | Khảo sát từng điểm: điện thoại nào dùng để quét, của cửa hàng hay cá nhân (Q-18), quầy và kho có Wi-Fi hoặc 4G không; quét thử ở hai điểm sóng yếu nhất | Vận hành |
| A-02 | Số tài sản và CCDC cần quản lý ở mức hàng nghìn | Cao | Trung bình | 7 | Xin số dòng TSCĐ và CCDC trên sổ hiện có, cùng ngưỡng để một CCDC được coi là cần quản lý (Q-03); đếm thử ở một cửa hàng để ước cỡ tổng | Kế toán trưởng, Vận hành |
| A-19 | Ngày go-live tránh kỳ khoá sổ và mùa cao điểm bán hàng | Trung bình | Thấp | 8 | Đặt các mốc tuần ở §33 lên lịch thật từ ngày kick-off; nếu kick-off vào giữa tháng 10/2026 thì tuần chuẩn bị go-live rơi vào dịp Tết 2027. Lấy lịch khoá sổ và tuần cao điểm (Q-24), trùng thì dời đợt go-live | Ban giám đốc |
| A-14 | Toàn chuỗi dùng một pháp nhân và một sổ FAST | Trung bình | Trung bình | 9 | Hỏi chuỗi có bao nhiêu mã số thuế và bao nhiêu sổ trên FAST; hơn một thì xin danh sách điểm thuộc từng pháp nhân (Q-25) | Kế toán trưởng |
| A-12 | "Người quản lý" trong brief là người chịu trách nhiệm tài sản, thường là quản lý điểm | Trung bình | Trung bình | 10 | Hỏi với ba tài sản cụ thể (máy pha ở quầy, máy rang ở xưởng, laptop ở văn phòng): mất thì ai chịu trách nhiệm (Q-15, Q-27) | Vận hành |
| A-08 | Mỗi location gắn với một cost center mặc định | Trung bình | Trung bình | 11 | Xin danh mục cost center trên FAST và bảng ghép cost center với từng điểm; đánh dấu điểm có hơn một cost center | Kế toán trưởng |
| A-07 | Đơn vị sửa chữa và nhà cung cấp không đăng nhập hệ thống ở GĐ1 | Trung bình | Trung bình | 12 | Cho Vận hành xem luồng gửi sửa trong đó Quản lý tài sản xác nhận thay đơn vị sửa (BR-TRF-05); hỏi đơn vị sửa hiện ký nhận và trả máy bằng giấy tờ gì (Q-26) | Vận hành |
| A-05 | Kiểm kê hằng tháng áp cho mọi location | Trung bình | Trung bình | 13 | Hỏi lịch kiểm kê mong muốn cho cửa hàng, kho, xưởng rang, văn phòng; xin biên bản kiểm kê gần nhất của mỗi loại điểm (Q-12) | Vận hành, Kế toán trưởng |
| A-06 | Thanh lý do Ban giám đốc duyệt, có thể phân cấp theo giá trị | Trung bình | Trung bình | 14 | Xin quy chế phân cấp phê duyệt (nếu có) và hai, ba biên bản thanh lý gần nhất để xem ai ký, ở mức giá trị nào (Q-08, Q-09) | Ban giám đốc |
| A-18 | Nếu FAST chỉ tích hợp được qua cách phức tạp, GĐ2 cần thêm một backend | Thấp | Trung bình | 15 | Khi có câu trả lời Q-04, ước lượng việc tích hợp theo cách FAST cho phép (API hay file) trước G7 | Duy |
| A-01 | Every Half có nhiều cửa hàng, ít nhất một kho, một xưởng rang và một văn phòng | Thấp | Cao | 16 | Xin danh sách điểm đang hoạt động (tên, loại, địa chỉ) và số điểm dự kiến mở trong 12 tháng tới (Q-02) | Vận hành |
| A-13 | TSCĐ và CCDC quản lý chung một sổ, phân biệt bằng loại | Thấp | Cao | 17 | Cho xem cây loại tài sản có cờ TSCĐ hoặc CCDC (F-MDM-04); hỏi có quy trình hay trường nào chỉ áp cho một nhóm không | Kế toán trưởng |
| A-15 | Hệ thống cần dùng được trong toàn bộ giờ mở cửa | Thấp | Cao | 18 | Xin giờ mở, đóng cửa của từng loại điểm và giờ nhận hàng của kho, xưởng rang; dùng để đặt lịch bảo trì và giờ trực hypercare (Q-33) | Vận hành |
| A-03 | Every Half đã có sổ TSCĐ và CCDC trên FAST | Thấp | Cao | 19 | Xin file xuất danh sách TSCĐ và CCDC từ FAST (dùng chung file của A-16); xem mỗi dòng có mã tài sản FAST không, vì GĐ2 cần mã này để liên kết | Kế toán trưởng |

Năm giả định đầu bảng cần câu trả lời trước kick-off:

1. A-16: lộ trình §33 dựa vào giả định này, trong khi R-03 chấm khả năng danh sách thiếu trường là Cao. Đếm mẫu trước G0 cho biết có phải cộng thêm tuần làm sạch dữ liệu không.
2. A-09: M01 chạy từ sprint 1 trên code hiện chỉ đăng nhập bằng email. Nhân viên ca không có email thì phải đổi cách đăng nhập; dùng chung tài khoản thì nhật ký không cho biết ai đã quét.
3. A-17: kiểm kê hằng tháng là việc chính của MVP1 và là điều kiện qua G3, G6. Đợi tới pilot ở tuần 13 mới biết cửa hàng không quét thì MVP1 đã gần xây xong.
4. A-11: G0 duyệt lộ trình cùng với đội; đội nhỏ hơn giả định thì MVP1 kéo dài thêm khoảng 4 đến 6 tuần (§33).
5. A-10: làm sạch dữ liệu cho điểm pilot bắt đầu từ sprint 2. Không có danh sách nào thì từng điểm phải kiểm đếm và lập hồ sơ từ đầu, và lộ trình phải tính lại.

## Phụ lục H. Câu hỏi mở cho Every Half

Câu hỏi cần trả lời trước cổng G0 và G1 có ảnh hưởng lớn nhất tới thiết kế; đội triển khai đề nghị Every Half trả lời nhóm này trong buổi làm rõ yêu cầu đầu tiên.

| Mã | Câu hỏi | Người trả lời | Cần trước cổng |
| --- | --- | --- | --- |
| Q-01 | Hiện mỗi năm mất, hỏng bao nhiêu tài sản; sổ FAST lệch thực tế bao nhiêu; một lượt kiểm kê mất bao lâu? | Ban giám đốc, Kế toán trưởng | G4 |
| Q-02 | Có bao nhiêu cửa hàng, kho, xưởng rang, văn phòng; mười hai tháng tới mở thêm bao nhiêu điểm? | Vận hành | G1 |
| Q-03 | Có khoảng bao nhiêu tài sản và CCDC; ngưỡng nào thì một CCDC cần quản lý? | Kế toán trưởng | G1 |
| Q-04 | Every Half dùng sản phẩm và phiên bản FAST nào; có API hay cơ chế nhập, xuất cho phân hệ tài sản không; ai là đầu mối? | Kế toán trưởng, IT | G7 |
| Q-05 | Chính sách khấu hao: phương pháp, thời gian sử dụng theo nhóm, ngày bắt đầu tính, làm tròn; CCDC phân bổ trong bao lâu? | Kế toán trưởng | G7 |
| Q-06 | Hệ nào là nơi tính khấu hao chính thức: FAST hay EH-AM? | Kế toán trưởng | G7 |
| Q-07 | Trường nào EH-AM được sửa và gửi sang FAST, trường nào chỉ nhận từ FAST? | Kế toán trưởng | G7 |
| Q-08 | Ai duyệt thanh lý; có hạn mức theo giá trị; cần mấy cấp duyệt? | Ban giám đốc | G1 |
| Q-09 | Thanh lý gồm những hình thức nào và cần biên bản gì? | Kế toán trưởng | G2 |
| Q-10 | "Mất" và "Hủy" khác nhau thế nào; "Hủy" là huỷ bỏ tài sản vật lý hay huỷ hồ sơ nhập sai? | Kế toán trưởng, Vận hành | G1 |
| Q-11 | Có dùng trạng thái riêng cho tài sản đang trên đường; bao nhiêu ngày thì coi là quá hạn nhận; nhận thiếu, nhận hỏng xử lý ra sao? | Vận hành | G1 |
| Q-12 | Kiểm kê hằng tháng là kiểm toàn bộ hay kiểm vòng theo nhóm; ai kiểm; bao lâu phải xong; ai duyệt? | Vận hành, Kế toán trưởng | G1 |
| Q-13 | Tài sản không tìm thấy khi kiểm kê: ai xác minh, sau bao lâu thì đề nghị xác nhận mất? | Kế toán trưởng, Ban giám đốc | G2 |
| Q-14 | Every Half có đội kỹ thuật nội bộ hay thuê ngoài toàn bộ; ai nghiệm thu sau sửa? | Vận hành | G1 |
| Q-15 | "Người quản lý" tài sản là quản lý điểm hay người sử dụng trực tiếp? | Vận hành | G1 |
| Q-16 | Ai được xem nguyên giá và giá trị còn lại; quản lý điểm có được xem không? | Ban giám đốc, Kế toán trưởng | G1 |
| Q-17 | Có cấp vùng hoặc khu vực và vị trí quản lý vùng không? | Vận hành | G1 |
| Q-18 | Nhân viên đăng nhập bằng gì; điện thoại quét là của cá nhân hay của cửa hàng? | IT, Nhân sự | G1 |
| Q-19 | Mở đăng ký tài khoản công khai hay chỉ quản trị tạo và mời tài khoản (D-01)? | IT, Ban giám đốc | G1 |
| Q-20 | Every Half đã có nội quy hoặc văn bản đồng ý về việc thu toạ độ và ảnh khi nhân viên làm việc chưa? | Pháp chế, Nhân sự | G4 |
| Q-21 | Danh sách tài sản hiện có nằm ở đâu và đầy đủ tới đâu? | Kế toán trưởng, Vận hành | G1 |
| Q-22 | Nhãn QR in nội bộ hay thuê in; khu quầy bar cần nhãn chịu nhiệt, ẩm không? | Vận hành | G1 |
| Q-23 | Thông báo gửi qua kênh nào: email, Zalo, Lark? | Vận hành, IT | G2 |
| Q-24 | Thời hạn go-live mong muốn, ngân sách, có chạy thử ở vài điểm trước không? | Ban giám đốc | G0 |
| Q-25 | Chuỗi có nhiều pháp nhân hoặc nhiều sổ FAST không? | Kế toán trưởng | G1 |
| Q-26 | Đơn vị sửa chữa có cần nhận thông báo hoặc xác nhận qua hệ thống không? | Vận hành | G2 |
| Q-27 | Tài sản giao cho cá nhân giữ (laptop, điện thoại) có quản lý theo người không? | Nhân sự, IT | G1 |
| Q-28 | Có CCDC nào cần quản lý theo số lượng thay vì từng chiếc? | Vận hành, Kế toán trưởng | G1 |
| Q-29 | Chênh lệch với FAST đo theo chỉ tiêu nào và đối soát bao lâu một lần? | Kế toán trưởng | G7 |
| Q-30 | App quét có cần chạy khi mất mạng hoàn toàn không? | Vận hành | G1 |
| Q-31 | Ảnh chụp tại chỗ cộng giờ máy chủ có đủ làm bằng chứng có mặt không, hay bắt buộc toạ độ? | Vận hành, Pháp chế | G1 |
| Q-32 | Hai hoặc ba điểm nào chạy thử trước? | Vận hành, Ban giám đốc | G1 |
| Q-33 | Hypercare trực bao nhiêu giờ mỗi ngày; phía Every Half ai trực cùng? | Ban giám đốc, Vận hành | G4 |
| Q-34 | Khi người duyệt vắng, ai duyệt thay; có cho uỷ quyền có thời hạn không? | Ban giám đốc | G2 |
| Q-35 | Pilot có nhiều lỗi thì cắt phạm vi để giữ ngày go-live hay lùi ngày? | Ban giám đốc | G3 |
| Q-36 | Điều chuyển nào cần duyệt trước khi xuất, và ai duyệt? | Vận hành, Kế toán trưởng | G1 |
| Q-37 | Báo giá sửa chữa từ mức nào cần duyệt trước khi sửa, và ai duyệt? | Ban giám đốc, Vận hành | G1 |
| Q-38 | Ảnh bằng chứng kiểm kê và ảnh báo hỏng lưu trong bao lâu? | Vận hành, Pháp chế | G4 |
| Q-39 | Khi có sự cố, chấp nhận mất tối đa bao nhiêu giờ dữ liệu và chờ khôi phục tối đa bao lâu? | Ban giám đốc, IT | G4 |

## Phụ lục I. Rủi ro, phụ thuộc và quyết định

### I.1. Rủi ro và phụ thuộc

| Mã | Loại | Nội dung | Khả năng | Ảnh hưởng | Cách giảm |
| --- | --- | --- | --- | --- | --- |
| R-01 | Phụ thuộc | Bản FAST đang dùng không có API hoặc không mở phần tài sản (GĐ2) | Cao | Cao | Tách FAST sang GĐ2; lớp tích hợp chạy được qua file nhập, xuất |
| R-02 | Rủi ro | Chính sách khấu hao hoặc cách làm tròn khác FAST, lệch số mỗi tháng (GĐ2) | Trung bình | Cao | Một hệ tính chính thức (D-03), đối soát hằng kỳ |
| R-03 | Rủi ro | Danh sách tài sản ban đầu thiếu trường hoặc trùng lặp | Cao | Cao | Làm sạch và đối chiếu trước khi mở từng điểm (§35) |
| R-04 | Rủi ro | Nhân viên quét ảnh chụp mã QR thay vì đến tận nơi | Trung bình | Trung bình | Ảnh chụp tại chỗ, giờ máy chủ, cảnh báo lượt quét bất thường ở GĐ3 |
| R-05 | Rủi ro | Nhãn QR bong hoặc mờ ở quầy bar vì nhiệt, ẩm | Cao | Trung bình | Nhãn chịu nhiệt và ẩm, in thử trước, quy trình in lại có lý do |
| R-06 | Rủi ro | Mạng yếu ở kho, cửa hàng làm mất lượt quét | Trung bình | Trung bình | Hàng đợi gửi lại và khoá chống trùng; thử mạng yếu ở S07 |
| R-07 | Rủi ro | Thu toạ độ, ảnh nhân viên khi chưa có căn cứ và thông báo phù hợp | Trung bình | Cao | Toạ độ tắt mặc định, thông báo trước, pháp chế rà trước G4 |
| R-08 | Rủi ro | Cấu hình phân quyền sai làm lộ giá trị hoặc tài sản của điểm khác | Trung bình | Trung bình | Mặc định từ chối, test bị từ chối trong mỗi module, rà quyền mỗi quý |
| R-09 | Rủi ro | Nhân viên coi kiểm kê là việc thêm, làm qua loa | Trung bình | Trung bình | Luồng quét ít thao tác, đào tạo, theo dõi tỷ lệ quét trong đợt |
| R-10 | Rủi ro | Đồng bộ hai chiều ghi đè qua lại giữa EH-AM và FAST (GĐ2) | Trung bình | Cao | Ma trận sở hữu dữ liệu (D-05) |
| R-11 | Rủi ro | Phạm vi "CCDC cần quản lý" không rõ, lập hồ sơ quá nhiều hoặc quá ít | Cao | Trung bình | Every Half chốt ngưỡng và danh sách loại cần quản lý (Q-03) |
| R-12 | Rủi ro | Người duyệt vắng làm đề nghị bị treo | Trung bình | Thấp | Uỷ quyền có thời hạn (Q-34), cảnh báo quá hạn |
| R-13 | Rủi ro | Một mã FAST ứng với nhiều CCDC, không liên kết một-một được (GĐ2) | Cao | Cao | Chốt Q-28 trước khi thiết kế liên kết |
| R-14 | Rủi ro | Hypercare quá tải vì hướng dẫn chưa đủ | Trung bình | Cao | Go-live theo đợt, sửa luồng quét sau pilot, hướng dẫn xử lý lỗi thường gặp |
| R-15 | Rủi ro | Nhân viên quét bằng điện thoại cá nhân, khó thu hồi truy cập khi nghỉ việc | Cao | Trung bình | Khoá tài khoản trong ngày nghỉ việc (WF-02); cân nhắc điện thoại của cửa hàng (Q-18) |
| R-16 | Rủi ro | Phải đổi nền tảng cơ sở dữ liệu giữa chừng | Thấp | Cao | Phân quyền và logic nghiệp vụ nằm ở backend, không phụ thuộc tính năng riêng của nền tảng |
| R-17 | Rủi ro | Mô hình phân quyền chốt muộn hoặc đổi sau khi đã code | Trung bình | Cao | Chốt vai trò và phạm vi xem giá trị ở G1 (Q-16, Q-17) |

### I.2. Quyết định

| Mã | Quyết định | Trạng thái | Nơi nêu |
| --- | --- | --- | --- |
| D-01 | Đóng đăng ký tài khoản công khai; Quản trị hệ thống tạo và mời tài khoản | Đề xuất, chờ Q-19 | §14.1 |
| D-02 | Đơn vị sửa chữa là location loại "bên ngoài"; mọi lần di chuyển tài sản, kể cả đi sửa, đều qua phiếu điều chuyển | Đề xuất | §14.2, §14.6, §14.7 |
| D-03 | FAST là nơi tính khấu hao chính thức (phương án A ở M09) | Đề xuất, chờ Q-06 | §14.9 |
| D-04 | MVP1 gồm mười module GĐ1; khấu hao và tích hợp FAST làm ở GĐ2 | Đề xuất | §13 |
| D-05 | Đồng bộ FAST theo ma trận sở hữu dữ liệu: mỗi trường một hệ làm chủ, một chiều đi | Đề xuất, chờ Q-07 | §14.10 |
| D-06 | Tình trạng vật lý tách khỏi trạng thái vòng đời | Đề xuất | §14.3 |
| D-07 | Kiểm kê không tìm thấy chỉ tạo "Nghi mất"; "Mất" cần xác minh và duyệt | Đề xuất | §14.5, §14.8 |
| D-08 | Nguyên giá và giá trị còn lại chỉ hiện với năm vai trò ở BR-CMN-06 | Đề xuất, chờ Q-16 | §14 |
| D-09 | Quản lý cửa hàng, thủ kho, quản lý xưởng rang, người phụ trách văn phòng dùng chung vai trò Quản lý điểm | Đề xuất | §8 |
| D-10 | Lộ trình tính theo tuần kể từ kick-off; go-live theo đợt, pilot trước | Đề xuất, chờ Q-24 | §33 |

## Phụ lục J. Thuật ngữ

| Thuật ngữ | Nghĩa trong EH-AM |
| --- | --- |
| Tài sản cố định (TSCĐ) | Tài sản đạt tiêu chuẩn ghi nhận tài sản cố định theo chính sách kế toán của Every Half |
| Công cụ dụng cụ (CCDC) | Tài sản không đủ tiêu chuẩn TSCĐ nhưng Every Half cần quản lý từng chiếc |
| Tài sản | Gọi chung TSCĐ và CCDC cần quản lý trong EH-AM |
| Asset ID | Mã định danh do EH-AM cấp cho mỗi tài sản, in trên nhãn QR, không đổi suốt vòng đời |
| Location | Một điểm: cửa hàng, kho, xưởng rang, văn phòng, hoặc location bên ngoài |
| Location bên ngoài | Location đại diện cho một đơn vị sửa chữa, dùng làm điểm đến khi gửi tài sản đi sửa |
| Cost center | Trung tâm chi phí mà tài sản được tính vào; mặc định theo location |
| Người chịu trách nhiệm | Người dùng chịu trách nhiệm về một tài sản tại location của nó ("người quản lý" trong brief) |
| Trạng thái vòng đời | Tài sản đang ở giai đoạn nào: lưu kho, đang sử dụng, đang sửa, đã thanh lý… (Phụ lục B.1) |
| Tình trạng vật lý | Tài sản còn tốt hay hư hỏng, tách khỏi trạng thái vòng đời (Phụ lục B.2) |
| Đợt kiểm kê | Một lần kiểm kê cho một nhóm location trong một kỳ |
| Danh sách dự kiến | Các tài sản hệ thống cho là đang ở một điểm lúc mở đợt kiểm kê |
| Nghi mất | Tài sản không tìm thấy khi kiểm kê, đang được xác minh |
| Phiếu điều chuyển | Chứng từ trong hệ thống cho một lần chuyển tài sản giữa hai location |
| Xuất giao | Bước điểm gửi quét tài sản khi giao cho người vận chuyển |
| Xác nhận nhận hàng | Bước điểm nhận quét tài sản khi nhận; lúc này location của tài sản mới đổi |
| Phiếu sửa chữa | Chứng từ theo dõi một lần hỏng và sửa của một tài sản |
| Nghiệm thu | Kiểm tra tài sản sau khi sửa trước khi đưa lại vào sử dụng |
| Đề nghị thanh lý | Đề nghị đưa tài sản ra khỏi sổ, cần duyệt |
| Báo giảm, ghi giảm | Ghi nhận tài sản rời sổ kế toán trên FAST (GĐ2) |
| Nhật ký thay đổi | Bản ghi chỉ ghi thêm về mọi thay đổi dữ liệu: ai, khi nào, thay đổi gì, trước và sau, lý do |
| Hộp việc | Danh sách việc đang chờ một người dùng xử lý |
| Phạm vi location | Tập location mà một người dùng có vai trò, quyết định dữ liệu họ thấy |
| App quét | Giao diện điện thoại của EH-AM dùng camera để quét QR |
| MVP1 | Bản phát hành đầu tiên, gồm các module GĐ1 |
| GĐ1, GĐ2, GĐ3 | Giai đoạn vận hành tài sản; kế toán và FAST; tối ưu và mở rộng |
| FAST | Phần mềm kế toán Every Half đang dùng |
| Ma trận sở hữu dữ liệu | Bảng quy định mỗi trường do hệ nào làm chủ và đồng bộ theo chiều nào |
| Outbox | Hàng đợi trong cơ sở dữ liệu cho việc gửi ra hệ thống ngoài |
| Pilot | Chạy thật ở một vài điểm trước khi mở toàn chuỗi |
| Hypercare | Giai đoạn hỗ trợ tăng cường ngay sau go-live |

## Phụ lục K. Danh mục màn hình chính

Use case dùng đúng tên màn hình ở cột "Màn hình".

| Mã | Màn hình | Người dùng | Module | Thiết bị |
| --- | --- | --- | --- | --- |
| SCR-01 | Đăng nhập | Mọi người dùng | M01 | Điện thoại, máy tính |
| SCR-02 | Quên mật khẩu | Mọi người dùng | M01 | Điện thoại, máy tính |
| SCR-03 | Đặt lại mật khẩu | Mọi người dùng | M01 | Điện thoại, máy tính |
| SCR-04 | Hồ sơ cá nhân | Mọi người dùng | M01 | Điện thoại, máy tính |
| SCR-05 | Danh sách người dùng | Quản trị hệ thống | M01 | Máy tính |
| SCR-06 | Chi tiết người dùng | Quản trị hệ thống | M01 | Máy tính |
| SCR-07 | Danh mục location | Quản trị hệ thống, Quản lý tài sản | M02 | Máy tính |
| SCR-08 | Danh mục cost center | Quản trị hệ thống, Quản lý tài sản | M02 | Máy tính |
| SCR-09 | Danh mục loại tài sản | Quản trị hệ thống, Quản lý tài sản | M02 | Máy tính |
| SCR-10 | Danh mục đối tác | Quản trị hệ thống, Quản lý tài sản | M02 | Máy tính |
| SCR-11 | Danh mục lý do | Quản trị hệ thống | M02 | Máy tính |
| SCR-12 | Danh sách tài sản | Quản lý tài sản, Quản lý điểm, Kế toán tài sản | M03 | Máy tính, điện thoại |
| SCR-13 | Chi tiết tài sản | Mọi vai trò theo quyền | M03 | Máy tính, điện thoại |
| SCR-14 | Biểu mẫu tài sản | Quản lý tài sản, Kế toán tài sản | M03 | Máy tính |
| SCR-15 | Nhập tài sản từ file | Quản lý tài sản | M03 | Máy tính |
| SCR-16 | In nhãn | Quản lý tài sản | M04 | Máy tính |
| SCR-17 | Quét QR | Mọi người dùng có app quét | M04 | Điện thoại |
| SCR-18 | Kết quả tra cứu | Mọi người dùng có app quét | M04 | Điện thoại |
| SCR-19 | Danh sách đợt kiểm kê | Quản lý tài sản, Quản lý điểm | M05 | Máy tính |
| SCR-20 | Chi tiết đợt kiểm kê | Quản lý tài sản, Quản lý điểm | M05 | Máy tính |
| SCR-21 | Kiểm kê tại điểm | Nhân viên điểm, Quản lý điểm | M05 | Điện thoại |
| SCR-22 | Duyệt kết quả kiểm kê | Quản lý điểm, Quản lý tài sản | M05 | Máy tính, điện thoại |
| SCR-23 | Xử lý chênh lệch | Quản lý tài sản | M05 | Máy tính |
| SCR-24 | Danh sách phiếu điều chuyển | Quản lý tài sản, Quản lý điểm | M06 | Máy tính |
| SCR-25 | Tạo phiếu điều chuyển | Quản lý tài sản, Quản lý điểm | M06 | Máy tính, điện thoại |
| SCR-26 | Chi tiết phiếu điều chuyển | Quản lý tài sản, Quản lý điểm | M06 | Máy tính, điện thoại |
| SCR-27 | Xuất giao | Quản lý điểm | M06 | Điện thoại |
| SCR-28 | Nhận hàng | Quản lý điểm | M06 | Điện thoại |
| SCR-29 | Báo hỏng | Nhân viên điểm, Quản lý điểm | M07 | Điện thoại |
| SCR-30 | Danh sách phiếu sửa chữa | Quản lý tài sản, Kỹ thuật viên | M07 | Máy tính |
| SCR-31 | Chi tiết phiếu sửa chữa | Quản lý tài sản, Kỹ thuật viên, Quản lý điểm | M07 | Máy tính, điện thoại |
| SCR-32 | Danh sách đề nghị | Quản lý tài sản, Ban giám đốc, Kế toán tài sản | M08 | Máy tính |
| SCR-33 | Tạo đề nghị thanh lý | Quản lý điểm, Quản lý tài sản | M08 | Máy tính, điện thoại |
| SCR-34 | Chi tiết đề nghị | Quản lý tài sản, Ban giám đốc, Kế toán tài sản | M08 | Máy tính |
| SCR-35 | Dashboard tổng quan | Ban giám đốc, Quản lý tài sản | M11 | Máy tính |
| SCR-36 | Dashboard của điểm | Quản lý điểm | M11 | Máy tính, điện thoại |
| SCR-37 | Xuất báo cáo | Ban giám đốc, Quản lý tài sản, Kế toán tài sản | M11 | Máy tính |
| SCR-38 | Nhật ký thay đổi | Kiểm soát nội bộ, Quản lý tài sản | M12 | Máy tính |
| SCR-39 | Hộp việc | Mọi người dùng | M12 | Điện thoại, máy tính |
| SCR-40 | Cấu hình thông báo | Quản trị hệ thống | M12 | Máy tính |
| SCR-41 | Liên kết mã FAST | Kế toán tài sản | M10 | Máy tính |
| SCR-42 | Nhật ký đồng bộ | Kế toán tài sản | M10 | Máy tính |
| SCR-43 | Đối soát FAST | Kế toán tài sản, Kế toán trưởng | M10 | Máy tính |
| SCR-44 | Bảng khấu hao | Kế toán tài sản, Kế toán trưởng | M09 | Máy tính |
