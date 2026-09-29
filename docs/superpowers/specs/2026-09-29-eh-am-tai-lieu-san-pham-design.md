# Thiết kế: Bộ tài liệu sản phẩm EH-AM (Master Blueprint và Use case)

| Mục | Nội dung |
| --- | --- |
| Ngày | 2026-09-29 |
| Người yêu cầu | Duy |
| Trạng thái | Chờ Duy duyệt spec |
| Quy trình | `superpowers:brainstorming` (xong phần thiết kế) → `superpowers:writing-plans` trong plan mode → `superpowers:executing-plans` |

## 1. Mục tiêu và người đọc

Soạn lại bộ tài liệu sản phẩm cho hệ thống quản lý tài sản & CCDC của Every Half (EH-AM), gồm hai sản phẩm:

1. **Master Blueprint**: một file `.md`, dựng theo khung *FDI Today Master Blueprint All-In-One 5.0*. Người đọc chính là Ban giám đốc, Kế toán trưởng và bộ phận Vận hành của Every Half, sau đó là đội triển khai (PO, UX, backend, frontend, QA). Duy dán nội dung sang Lark Suite rồi xuất PDF.
2. **Bộ use case**: đặc tả cho từng tính năng của từng module trong blueprint, theo mẫu 13 trường và checklist 20 điểm của skill `use-case-writer`. Người đọc chính là đội dev và QA; Every Half dùng khi nghiệm thu.

Văn phong của cả hai: như người có kinh nghiệm viết, mức senior/lead, không có dấu hiệu văn máy.

## 2. Đầu vào

| Đầu vào | Vị trí | Ghi chú |
| --- | --- | --- |
| Brief của Every Half | `C:\Users\Admin\Downloads\EVERY HALF — PHẦN MỀM QUẢN LÝ TÀI SẢN-2.docx` | Khoảng 1 trang: mục tiêu, 8 nhóm chức năng, 3 nguyên tắc, North Star. Nguồn yêu cầu duy nhất |
| Khung tham chiếu | `C:\Users\Admin\development\fdi_today_backend\business\docs\original_owner_sent\FDI_Today_Master_Blueprint_All_In_One_5.0.docx.pdf` | 92 trang, 7 phần, 41 mục, phụ lục A–E |
| Skill khai thác yêu cầu | `product-discovery/` (tên trong SKILL.md: `ask-why-ba`) | Đọc thẳng `SKILL.md`, `references/`, `templates/` |
| Skill viết use case | `use-case-writer/` (đã cài thành skill `use-case-writer`) | `SKILL.md`, `references/`, `assets/uc-template.md` |
| Codebase | `eh_am_backend` (repo này), `eh_am_frontend` (repo riêng, nếu có trên máy) | Căn cứ cho Phần VI và cho UC của các luồng auth đã code |
| Bộ tài liệu cũ 01–10 | `business/product-docs/01-…md` đến `10-…md` | Chỉ để tham khảo, không chép. Phần có giá trị được đưa vào blueprint mới. Xoá khi xong |

Ngoài brief, Duy không có thêm dữ kiện nào về Every Half (số điểm bán, số lượng tài sản, bản FAST, chính sách khấu hao, sơ đồ tổ chức, thời hạn, quy mô đội).

## 3. Đầu ra

| Đầu ra | Vị trí |
| --- | --- |
| Master Blueprint | `business/product-docs/product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md` |
| Bộ use case | `business/product-docs/product-usecase/` (cấu trúc ở §7.1) |
| Spec này | `docs/superpowers/specs/2026-09-29-eh-am-tai-lieu-san-pham-design.md` |
| Kế hoạch | `docs/superpowers/plans/2026-09-29-eh-am-tai-lieu-san-pham.md` |
| Ghi chú làm việc | `docs/superpowers/notes/2026-09-29-*.md`: bản chép brief, kết quả khai thác yêu cầu, góp ý của từng agent, sổ giả định/câu hỏi/rủi ro (A/Q/R) dùng chung, báo cáo soát văn, báo cáo phản biện, báo cáo rà kiểm thử, file tiến độ thực thi |
| CLAUDE.md, README.md gốc | Cập nhật đường dẫn và bộ skill bắt buộc (CLAUDE.md đã có bảng skill) |

## 4. Quyết định đã chốt với Duy

| Mã | Quyết định |
| --- | --- |
| D-01 | Làm theo hướng A: khai thác yêu cầu trước; một người viết blueprint; subagent góp ý chuyên môn; UC viết song song theo module trên bộ quy ước chung, có script rà chéo |
| D-02 | Mọi tài liệu viết tiếng Việt. Code viết tiếng Anh, chỉ comment giải thích là tiếng Việt |
| D-03 | Use case viết tiếng Việt, thay cho mặc định tiếng Anh của `use-case-writer`; giữ nguyên 13 trường và checklist 20 điểm |
| D-04 | Làm liền một mạch, không dừng cho Duy duyệt blueprint trước khi viết UC. Bù bằng cổng phản biện nội bộ (§8, bước 4) |
| D-05 | Chỉ có brief. Dữ kiện thiếu ghi thành giả định `A-nn` và câu hỏi mở `Q-nn`, không bịa số |
| D-06 | UC trình bày bằng bảng 2 cột có `<br>` theo mẫu skill; sửa lỗi các dòng 4 ô của mẫu gốc |
| D-07 | Dùng thêm `voltagent-research:research-analyst`, `voltagent-biz:assumption-mapping`, `voltagent-qa-sec:ai-writing-auditor`, `voltagent-qa-sec:qa-expert`. Không cài skill bên thứ ba khác |
| D-08 | Blueprint là một file duy nhất, Markdown GFM thuần để dán sang Lark |
| D-09 | Xoá 10 file 01–10 cũ sau khi kiểm tra xong đầu ra mới |
| D-10 | Không commit khi Duy chưa yêu cầu |
| D-11 | Mỗi UC viết trọn trong một lần, thay cho chế độ viết tuần tự 5 nhóm mục của `use-case-writer`; bù bằng ba lớp kiểm tra ở §7.6 |

## 5. Giả định làm việc

- Every Half là chuỗi F&B cỡ vừa, có nhiều cửa hàng, ít nhất một kho, một xưởng rang và văn phòng. Mọi con số quy mô trong blueprint (số điểm, số tài sản, tần suất) đều là giả định `A-nn` cần Every Half xác nhận.
- Every Half đang dùng một sản phẩm của FAST cho kế toán; chưa rõ bản nào và có API hay không.
- Đội triển khai là đội của Duy; quy mô đội, ngày bắt đầu và ngân sách chưa biết, nên lộ trình tính theo tuần kể từ kick-off.
- Lark chấp nhận Markdown GFM khi dán (tiêu đề, bảng, trích dẫn, danh sách); không tự vẽ Mermaid và không chắc hiểu HTML.

## 6. Thiết kế Master Blueprint

### 6.1. Khung mục

Giữ vị trí và số thứ tự của 41 mục FDI Today. Mục nào FDI viết cho tầm quốc gia thì giữ chỗ, đổi nội dung cho đúng tầm chuỗi F&B.

**Mở đầu (không đánh số):** bìa (tên, phụ đề, câu định vị, phạm vi, phiên bản, ngày, trạng thái) · khung "Ranh giới tin cậy" · Kiểm soát tài liệu · bảng "Brief gốc → Blueprint 1.0" (thay bảng "Từ 4.0 sang 5.0" của FDI) · Mục lục cấu trúc · Quy ước đọc (nhãn, hệ mã, giai đoạn).

Mỗi Phần mở đầu bằng tiêu đề phần, một câu định vị và khung "Tuyên bố thiết kế", như trang mở phần của FDI.

| Phần | Mục | Tiêu đề EH-AM | Ghi chú so với FDI |
| --- | --- | --- | --- |
| I | 1 | Tuyên ngôn sản phẩm | Có khung "Tuyên ngôn sản phẩm" |
| I | 2 | Tầm nhìn phát triển | Bảng giai đoạn: GĐ1, GĐ2, GĐ3, dài hạn |
| I | 3 | Mục đích của EH-AM | |
| I | 4 | Ý nghĩa với từng bên | Bảng đối tượng → ý nghĩa |
| I | 5 | Lý do cần thiết | Lấy từ nguyên nhân gốc của bước khai thác yêu cầu; ghi rõ phần nào là suy luận |
| I | 6 | Chuyển đổi mô hình | Bảng cách làm hiện tại (giả định) → cách làm với EH-AM |
| I | 7 | Vai trò đúng và ranh giới của hệ thống | Kèm bảng bối cảnh hệ thống (FAST, email, Storage…) |
| II | 8 | Các nhóm người dùng | Cột "Không gian làm việc" (app quét trên điện thoại / web quản trị) thay cột AI Copilot |
| II | 9 | Hợp đồng thiết kế cho từng nhóm người dùng | Kèm khung "Quy tắc UX cấp hệ thống" |
| II | 10 | Vòng đời tài sản chuẩn hoá | Thay "Vòng đời FDI" |
| II | 11 | Kiến trúc giá trị đa phía | |
| III | 12 | Kiến trúc sản phẩm theo lớp | Khoảng 6 lớp thay 12 lớp chiến lược |
| III | 13 | Bản đồ 12 module | Cột "Giai đoạn", "Nguồn brief" thay cột AI |
| III | 14 | Đặc tả chức năng 12 module | Mẫu ở §6.3 |
| IV | 15 | Tự động hoá có kiểm soát | Thay "Kiến trúc AI-native". Job định kỳ, cảnh báo; AI chỉ là định hướng GĐ3, không ra quyết định |
| IV | 16 | Quy tắc kiểm soát cho từng job tự động | Thay "Hợp đồng quản trị AI cho mỗi Copilot" |
| IV | 17 | Kiến trúc dữ liệu | Bảng lớp dữ liệu, nhóm thực thể |
| IV | 18 | Hồ sơ số và bằng chứng | |
| IV | 19 | API và tích hợp | Nhóm API `/v1`, nguyên tắc tích hợp FAST |
| IV | 20 | Bảo mật, quyền riêng tư và kiểm soát | Có phần dữ liệu cá nhân (GPS, ảnh) |
| IV | 21 | UX/UI, di động và khả năng tiếp cận | |
| V | 22 | Hệ thống quy trình chuẩn | Danh mục `WF-nn` và hợp đồng máy trạng thái |
| V | 23 | Dashboard và khung KPI | |
| V | 24 | Bảng điều hành cho Ban giám đốc | Thay "National Command Center" |
| V | 25 | Mô hình quản trị dự án và vận hành | Có RACI |
| V | 26 | Chi phí vận hành và tính bền vững | Thay "Mô hình kinh tế". Liệt kê nhóm chi phí và yếu tố chi phối, không bịa đơn giá |
| VI | 27 | Kiến trúc công nghệ mục tiêu | Bám codebase thật |
| VI | 28 | Cấu trúc repository và bounded context | |
| VI | 29 | Hợp đồng kỹ thuật không thương lượng | |
| VI | 30 | Nền tảng kỹ thuật đã có | Những gì `eh_am_backend` đã làm |
| VI | 31 | Các bước triển khai | Khoảng 14 bước `S01`–`S14`, mỗi bước một bảng key–value như FDI |
| VI | 32 | Definition of Done cấp module | |
| VII | 33 | Lộ trình triển khai | Tính theo tuần kể từ kick-off |
| VII | 34 | Cổng kiểm soát | Bảng cổng từ `G0`, dự kiến 8–10 cổng (project-manager đề xuất số chốt), và nguyên tắc cổng |
| VII | 35 | Chuyển đổi dữ liệu và chiến dịch dán nhãn | Thay "Legacy Data Migration Factory" |
| VII | 36 | Go-live và hypercare | |
| VII | 37 | Đo lường lợi ích | |
| VII | 38 | Mở rộng quy mô chuỗi | Thay "Global Federation Factory": cửa hàng mới, pháp nhân mới, loại tài sản mới |
| VII | 39 | Thứ tự thực thi cho đội phát triển | Thay "AI Coding Agent Execution Order" |
| VII | 40 | Tiêu chí nghiệm thu Master Blueprint | |
| VII | 41 | Tuyên bố kết thúc | |
| Phụ lục | A | Nhóm API và hợp đồng tích hợp | |
| Phụ lục | B | Mã trạng thái chuẩn | Vòng đời tài sản, tình trạng vật lý, kết quả kiểm kê, trạng thái phiếu |
| Phụ lục | C | Module × bước triển khai | Tương ứng Phụ lục C của FDI |
| Phụ lục | D | Tài liệu tham chiếu | Trỏ sang bộ UC, repo, `sql-docs/`, brief |
| Phụ lục | E | Mẫu use case | Tóm tắt mẫu, trỏ sang `product-usecase/README.md` |
| Phụ lục | F | Truy vết brief → module → tính năng | Mỗi dòng brief có ít nhất một mã `F-` |
| Phụ lục | G | Giả định | `A-nn`, có xếp hạng rủi ro |
| Phụ lục | H | Câu hỏi mở cho Every Half | `Q-nn`, người trả lời, cần trước cổng nào |
| Phụ lục | I | Rủi ro và vấn đề (RAID) | `R-nn` |
| Phụ lục | J | Thuật ngữ | |
| Phụ lục | K | Danh mục màn hình chính | `SCR-nn`; UC dùng đúng tên màn hình ở đây |

### 6.2. Mười hai module

| Mã | Module | Mã dùng trong F/BR/UC | Nguồn |
| --- | --- | --- | --- |
| M01 | Người dùng & phân quyền | IAM | Nguyên tắc "phân quyền theo vai trò và location" |
| M02 | Danh mục nền | MDM | Ngầm định: location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa chữa |
| M03 | Hồ sơ tài sản & CCDC | AST | Brief nhóm 1 |
| M04 | QR & nhãn | QR | Brief nhóm 1 (Asset ID + QR), nhóm 2 |
| M05 | Kiểm kê | STK | Brief nhóm 2 |
| M06 | Điều chuyển | TRF | Brief nhóm 3 |
| M07 | Báo hỏng, sửa chữa & bảo trì | MNT | Brief nhóm 4 |
| M08 | Thanh lý & báo giảm | DSP | Brief nhóm 5 |
| M09 | Khấu hao & phân bổ | DEP | Brief nhóm 6 |
| M10 | Tích hợp FAST | FST | Brief nhóm 7 |
| M11 | Dashboard & báo cáo | DSH | Brief nhóm 8 |
| M12 | Nhật ký, lịch sử & thông báo | AUD | Nguyên tắc "không bao giờ xoá lịch sử", "Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do" |

Việc nhập danh sách tài sản ban đầu và in nhãn hàng loạt nằm trong M03 và M04; kế hoạch chuyển đổi và chiến dịch dán nhãn nằm ở §35.

### 6.3. Mẫu đặc tả một module (§14.x)

1. Bảng key–value: Mục tiêu · Người dùng chính · Nguồn trong brief · KPI cốt lõi · Giai đoạn · Đầu ra kỹ thuật (dữ liệu, API, quy trình, quyền, audit, test).
2. "Các tính năng bắt buộc": danh sách có mã `F-<MÃ>-<nn>`, mỗi tính năng một dòng, ghi giai đoạn và nhãn `[Brief]`/`[Đề xuất]`.
3. "Quy tắc nghiệp vụ": các quy tắc cốt lõi có mã `BR-<MÃ>-<nn>`.
4. Trạng thái và chuyển trạng thái chính (khi module có đối tượng mang trạng thái).
5. Ngoài phạm vi của module (khi cần vạch ranh giới với module khác).

Quy tắc chung áp cho mọi module (kiểm quyền theo location, audit mọi thay đổi, không xoá, không trả thẳng dòng database…) viết **một lần** ở đầu §14, không lặp lại trong từng module như FDI.

### 6.4. Ba quyết định lớn ghi dạng [Đề xuất]

1. **Sở hữu dữ liệu với FAST.** EH-AM làm chủ dữ liệu vật lý (vị trí, người quản lý, tình trạng, trạng thái vòng đời). FAST làm chủ số liệu kế toán (nguyên giá, khấu hao, giá trị còn lại). "Đồng bộ hai chiều" trong brief được hiện thực theo từng trường: mỗi trường có đúng một chiều đi và một quy tắc xử lý khi hai bên lệch. Có ma trận sở hữu theo trường. Hệ nào tính khấu hao là câu hỏi mở cho Kế toán trưởng, kèm phương án khuyến nghị và lý do.
2. **Phân kỳ.** GĐ1 vận hành tài sản (hồ sơ, QR, kiểm kê, điều chuyển, sửa chữa, thanh lý có duyệt, dashboard vận hành, audit). GĐ2 kế toán (khấu hao, FAST, đối soát). GĐ3 tối ưu. Lý do: tích hợp FAST phụ thuộc bản FAST và chính sách kế toán, là rủi ro lớn nhất. Subagent product-manager kiểm lại cách phân kỳ.
3. **Lộ trình tương đối.** Tính theo tuần kể từ kick-off; quy mô đội và ngày bắt đầu là giả định.

### 6.5. Định dạng cho Lark

- Markdown GFM thuần. `#` cho Phần, `##` cho mục đánh số, `###` cho tiểu mục; không sâu hơn 3 cấp.
- Bảng dùng cú pháp GFM; không xuống dòng trong ô, không `<br>`.
- Khung "Ranh giới tin cậy", "Tuyên bố thiết kế", "Tuyên ngôn sản phẩm", "Không được phép" viết bằng blockquote, nhãn in đậm ở dòng đầu.
- Không HTML, không Mermaid, không emoji trang trí. Sơ đồ (nếu thật sự cần) thể hiện bằng bảng hoặc danh sách có mũi tên.
- Nhãn `[Brief]`, `[Đề xuất]`, `[Chốt]` đặt trong cột bảng hoặc cuối dòng tính năng, không rải trong câu văn.

### 6.6. Hệ mã tham chiếu

| Mã | Dùng cho | Ví dụ |
| --- | --- | --- |
| `Mnn` | Module | M03 |
| `F-<MÃ>-<nn>` | Tính năng | F-AST-01 |
| `BR-<MÃ>-<nn>` | Quy tắc nghiệp vụ | BR-TRF-03 |
| `WF-nn` | Quy trình chuẩn | WF-07 |
| `Snn` | Bước triển khai | S05 |
| `Gn` | Cổng kiểm soát | G2 |
| `SCR-nn` | Màn hình | SCR-12 |
| `A-nn`, `Q-nn`, `R-nn`, `D-nn` | Giả định, câu hỏi mở, rủi ro, quyết định | Q-04 |
| `BR-CMN-nn` | Quy tắc chung áp cho mọi module | BR-CMN-02 |
| `B-nn` | Dòng nội dung của brief | B-07 |
| `GĐ1`, `GĐ2`, `GĐ3` | Giai đoạn | |

Mã nào xuất hiện trong văn bản thì phải được định nghĩa ở đúng một chỗ: một dòng trong bảng có cột đầu tên "Mã", đặt ở mục nhà của mã. Mục nhà: `Mnn` ở §13; `F-`, `BR-` (gồm `BR-CMN-`) ở §14; `WF-` ở §22; `Snn` là tiêu đề `### 31.<n>. S<nn>`; `Gn` ở §34; `SCR-` ở Phụ lục K; `A-` ở Phụ lục G; `Q-` ở Phụ lục H; `R-` và `D-` ở Phụ lục I; `B-` ở bản chép brief trong `docs/superpowers/notes/`.

## 7. Thiết kế bộ use case

### 7.1. Cấu trúc thư mục

```text
business/product-docs/product-usecase/
├── README.md                  cách đọc, quy ước, danh mục toàn bộ UC, ma trận truy vết F-… → UC, tổng hợp checklist
├── _chung/
│   ├── thuat-ngu.md           bảng thuật ngữ
│   ├── tac-nhan.md            danh mục tác nhân (vai trò người dùng, FAST, bộ lập lịch, dịch vụ email/lưu trữ)
│   └── quy-tac-nghiep-vu.md   toàn bộ BR-…: các mã của blueprint chép nguyên văn, cộng quy tắc chi tiết bổ sung
├── M01-nguoi-dung-phan-quyen/
│   ├── UC-IAM-01_<ten-khong-dau>.md
│   └── _checklist.md          bảng 20 điểm của từng UC trong module
├── M02-danh-muc-nen/
├── M03-ho-so-tai-san/
├── M04-qr-nhan/
├── M05-kiem-ke/
├── M06-dieu-chuyen/
├── M07-sua-chua-bao-tri/
├── M08-thanh-ly-bao-giam/
├── M09-khau-hao-phan-bo/
├── M10-tich-hop-fast/
├── M11-dashboard-bao-cao/
└── M12-nhat-ky-thong-bao/
```

### 7.2. Mã và tên file

- Mã UC: `UC-<MÃ>-<nn>` với mã module ở §6.2, đánh số hai chữ số từ 01.
- Tên file: `<Mã UC>_<ten-uc-khong-dau-kebab>.md`, ví dụ `UC-AST-01_tao-ho-so-tai-san.md`.
- Luồng thay thế `UC-<MÃ>-<nn>.AC.<n>`, ngoại lệ `UC-<MÃ>-<nn>.EX.<n>`, vấn đề mở `[TBD-n]`.

### 7.3. Mẫu UC tiếng Việt

```markdown
# UC-AST-01: Tạo hồ sơ tài sản

| Mã UC | UC-AST-01 | Tên UC | Tạo hồ sơ tài sản |
| --- | --- | --- | --- |
| Người tạo | Duy (BA/PO) | Người cập nhật | Duy (BA/PO) |
| Ngày tạo | 2026-09-29 | Ngày cập nhật | 2026-09-29 |
| Module | M03 — Hồ sơ tài sản & CCDC | Tính năng | F-AST-01 |
| Giai đoạn | GĐ1 | Mức mục tiêu | Mục tiêu người dùng |

| **Tác nhân:** | **Chính:** <vai trò cụ thể>. **Phụ:** <hệ thống/người hỗ trợ>. |
| ---: | :--- |
| **Mô tả:** | <2–4 câu: vì sao → làm gì → kết quả> |
| **Tiền điều kiện:** | 1. …<br>2. … |
| **Hậu điều kiện:** | 1. …<br>2. … |
| **Độ ưu tiên:** | Cao / Trung bình / Thấp — <lý do> |
| **Tần suất sử dụng:** | <số lần / đơn vị thời gian>, cao điểm: <…> |
| **Luồng sự kiện chính:** | 1. <Tác nhân> …<br>2. Hệ thống …<br>… |
| **Luồng thay thế:** | **UC-AST-01.AC.1: <tên>**<br>Tại bước <N>, nếu <điều kiện>:<br>Na. …<br>Nb. …<br>→ Tiếp tục từ bước <M> của luồng chính. |
| **Ngoại lệ:** | **UC-AST-01.EX.1: <tên>**<br>Khi nào: …<br>Hệ thống: …<br>Trạng thái cuối: … |
| **Bao gồm:** | UC-QR-01: <tên> (gọi ở bước <N>) |
| **Yêu cầu đặc biệt:** | **Hiệu năng:** …<br>**Bảo mật:** …<br>**Tin cậy:** …<br>**Tuân thủ:** …<br>**Audit:** … |
| **Giả định:** | 1. … |
| **Ghi chú và vấn đề mở:** | [TBD-1] <câu hỏi> \| Người trả lời: <…> \| Hạn: <…> \| Kết luận: <…> |
```

Bảng định danh 4 cột thay cho các dòng 4 ô trong bảng 2 cột của mẫu gốc (GFM bỏ ô thừa khi hiển thị). Bảng thứ hai giữ đúng bố cục 2 cột của skill.

### 7.4. Quy tắc tách UC

- Làm theo chế độ B của `use-case-writer`: lập danh sách UC của từng module trước, bằng ba kỹ thuật theo mục tiêu, theo sự kiện, theo CRUD.
- Mỗi UC qua coffee-break test; một tác nhân chính, một mục tiêu, một phiên làm việc.
- Bước dùng chung cho từ hai UC trở lên được viết thành UC mức "chức năng con", ghi rõ ở ô "Mức mục tiêu", và được gọi qua trường "Bao gồm". Ví dụ: quét và nhận diện tài sản bằng QR.
- Job hệ thống chạy theo lịch (khấu hao tháng, đồng bộ FAST, nhắc kiểm kê) được viết thành UC có tác nhân chính là "Bộ lập lịch".
- Mỗi mã `F-` có ít nhất một UC. Tính năng thuần phi chức năng không cần UC thì ghi lý do trong ma trận truy vết.
- Ước tính 70–80 UC, mỗi module 3–9 UC. Con số chốt khi lập danh sách.

### 7.5. Quy tắc nội dung

- Viết tiếng Việt, câu chủ động, thì hiện tại, mỗi bước một hành động, luân phiên tác nhân và hệ thống.
- Không nhúng if/else trong luồng chính; rẽ nhánh đưa vào luồng thay thế hoặc ngoại lệ.
- Quy tắc nghiệp vụ chỉ tham chiếu theo mã `BR-`, không viết lại trong bước.
- Tên màn hình, nút in đậm và khớp Phụ lục K của blueprint.
- Tác nhân chỉ lấy từ `_chung/tac-nhan.md`.
- Tần suất phải có số; chưa có số thì ghi `[TBD-n]` kèm người trả lời.
- Mỗi UC có 3–7 ngoại lệ, phủ các lỗi thường gặp: nhập sai, không đủ quyền, hai người thao tác cùng lúc, mất mạng khi quét trên điện thoại, dịch vụ ngoài lỗi (FAST, Storage, email), hết thời gian chờ.
- Yêu cầu đặc biệt chỉ chứa yêu cầu phi chức năng.
- UC cho các luồng đã code (đăng ký, đăng nhập, làm mới phiên, đăng xuất, quên/đặt lại/đổi mật khẩu, `/me`) phải khớp hành vi trong `src/auth/`. Chỗ nào lệch thì ghi vào "Ghi chú và vấn đề mở".
- Người tạo và người cập nhật ghi "Duy (BA/PO)"; ngày `2026-09-29`.

### 7.6. Chế độ viết và kiểm tra

Skill mặc định viết lần lượt 5 nhóm mục, dừng chờ xác nhận sau mỗi nhóm. Theo D-11, mỗi agent viết trọn một UC trong một lần. Ba lớp kiểm tra thay cho các lần dừng:

1. Checklist 20 điểm cho từng UC, ghi vào `_checklist.md` của module. Kết quả chấp nhận: không có ❌; mỗi ⚠️ có lý do.
2. `voltagent-qa-sec:qa-expert` rà khả năng kiểm thử: hậu điều kiện kiểm chứng được, ngoại lệ đủ để viết test case.
3. Script Python rà chéo toàn bộ thư mục (§9).

## 8. Quy trình thực thi và bộ skill

| Bước | Việc | Skill / agent |
| --- | --- | --- |
| 1 | Chép brief vào `docs/superpowers/notes/`; khai thác yêu cầu: phân loại ý định, 5 tầng BABOK, bảng biết/chưa biết, nguyên nhân gốc, tình huống biên, giả định, câu hỏi mở | Skill `product-discovery/` (`ask-why-ba`) |
| 2 | Góp ý chuyên môn, chạy song song; mỗi agent ghi một file trong `docs/superpowers/notes/` | `voltagent-biz:product-manager` (tầm nhìn, giá trị, ưu tiên, MVP và phân kỳ, North Star và KPI, đo lợi ích) · `voltagent-biz:project-manager` (lộ trình, cổng, RACI, RAID, chuyển đổi dữ liệu, dán nhãn, go-live, TCO) · `voltagent-biz:scrum-master` (mô hình giao hàng, nhịp sprint, nghi thức, DoR/DoD, kế hoạch phát hành, nhịp UAT với Every Half) · `voltagent-research:research-analyst` (quy định kế toán Việt Nam về TSCĐ và CCDC, luật bảo vệ dữ liệu cá nhân, khả năng tích hợp của các sản phẩm FAST; có nguồn và số hiệu văn bản) |
| 3 | Xếp hạng giả định theo mức rủi ro và độ chắc chắn | `voltagent-biz:assumption-mapping` |
| 4 | Viết blueprint theo §6: Phần I → VII → phụ lục | Em (Claude) là người viết duy nhất |
| 5 | Soát văn blueprint | `humanizer:humanizer`, sau đó `voltagent-qa-sec:ai-writing-auditor` (báo cáo, em sửa) |
| 6 | Cổng phản biện nội bộ: mọi dòng brief có mã `F-`, ranh giới module không chồng nhau, mã được định nghĩa đủ | Một subagent phản biện (`voltagent-biz:business-analyst`); em sửa rồi khoá danh mục tính năng |
| 7 | Lập bộ quy ước UC (`README.md`, `_chung/`) và danh sách UC (chế độ B) | `use-case-writer` |
| 8 | Viết UC theo module, 3 đợt sắp theo phụ thuộc: M01–M04 và M12 → M05–M08 → M09–M11 | `voltagent-biz:business-analyst`, mỗi module một agent; agent đọc thẳng file của skill `use-case-writer/` |
| 9 | Rà chéo bằng script; em đọc lại từng module | Script Python (không đưa vào repo) |
| 10 | Rà khả năng kiểm thử, soát văn phần mô tả và ghi chú | `voltagent-qa-sec:qa-expert`, `humanizer:humanizer`, `voltagent-qa-sec:ai-writing-auditor` |
| 11 | Chốt `README.md` của bộ UC; blueprint Phụ lục D trỏ sang bộ UC | |
| 12 | Kiểm tra đầu ra, xoá 01–10, cập nhật README gốc và CLAUDE.md (đường dẫn spec, plan) | `superpowers:verification-before-completion` |

Mọi subagent nhận đủ: đường dẫn spec này, bản chép brief, kết quả khai thác yêu cầu (từ bước 2 trở đi), phần blueprint liên quan (từ bước 6 trở đi) và quy tắc văn phong ở §10. Subagent không gọi được Skill tool, nên đọc thẳng file của skill.

## 9. Tiêu chí chấp nhận

### 9.1. Blueprint

1. Có đủ phần mở đầu, 41 mục và phụ lục A–K theo §6.1.
2. Mỗi dòng của brief có trong Phụ lục F và trỏ tới ít nhất một mã `F-`.
3. Mọi mã đã dùng đều được định nghĩa đúng một lần (§6.6).
4. Không có con số nào về Every Half mà không gắn giả định `A-nn`.
5. Mọi điểm về quy định kế toán hoặc pháp lý có số hiệu văn bản và ghi cần Kế toán trưởng (hoặc pháp chế) xác nhận.
6. Đúng định dạng §6.5: không HTML, không Mermaid, không `<br>`, tiêu đề tối đa 3 cấp.
7. Báo cáo của ai-writing-auditor không còn lỗi mức cao.

### 9.2. Bộ use case

1. Mỗi mã `F-` có ít nhất một UC, hoặc có lý do được ghi trong ma trận truy vết.
2. Mỗi UC đủ 13 trường, nhãn tiếng Việt, qua checklist 20 điểm (không có ❌).
3. Script rà chéo không báo lỗi, gồm các kiểm tra:
   - mã UC trùng, tên file không khớp mã;
   - "Bao gồm" trỏ tới UC không tồn tại;
   - mã `BR-` không có trong `_chung/quy-tac-nghiep-vu.md`;
   - tác nhân không có trong `_chung/tac-nhan.md`;
   - thiếu trường, còn nhãn tiếng Anh;
   - `.AC`/`.EX` sai định dạng;
   - tần suất trống.
4. `README.md` có danh mục đủ UC và ma trận truy vết.
5. Báo cáo của qa-expert và ai-writing-auditor không còn lỗi mức cao.

### 9.3. Dọn dẹp

1. 10 file 01–10 bị xoá sau khi các tiêu chí trên đạt.
2. README gốc, CLAUDE.md và spec/plan trỏ đúng vị trí mới.

## 10. Quy tắc văn phong

Áp cho blueprint, UC và mọi ghi chú. Bộ quy tắc đầy đủ lấy từ skill `humanizer:humanizer` lúc thực thi; phần dưới đây là cách áp cho tiếng Việt.

- Không dựng câu đối lập để tạo hiệu ứng: "không chỉ… mà còn…", "không phải X, mà là Y".
- Không mở đoạn bằng câu dẫn rỗng ("Trong bối cảnh…", "Có thể nói…", "Như đã biết…") và không kết đoạn bằng câu khẩu hiệu một dòng.
- Không gom ba tính từ hay ba danh từ chỉ cho đủ nhịp.
- Hạn chế dấu gạch dài; dùng dấu phẩy, dấu hai chấm hoặc tách câu.
- Tránh từ sáo khi không mang nghĩa cụ thể: "toàn diện", "tối ưu hoá", "nâng tầm", "hành trình", "then chốt", "vượt trội", "đột phá", "liền mạch", "mạnh mẽ", "giải pháp", "hệ sinh thái".
- Không in đậm tràn lan; in đậm dành cho cảnh báo thật sự và nhãn khung.
- Câu có chủ thể, động từ cụ thể, có số liệu hoặc điều kiện kiểm chứng được. Quyết định luôn kèm lý do và đánh đổi. Rủi ro nói thẳng.
- Không phóng đại lợi ích; lợi ích nào cũng có cách đo.
- Không lặp một ý ở nhiều mục; tham chiếu chéo bằng mã.

## 11. Rủi ro

| Rủi ro | Cách chặn |
| --- | --- |
| Quy định kế toán hoặc luật dữ liệu cá nhân đã thay đổi so với hiểu biết của mô hình | research-analyst dẫn nguồn và số hiệu văn bản; mọi điểm kế toán ghi cần Kế toán trưởng xác nhận |
| Không có cổng duyệt của Duy giữa blueprint và UC | Cổng phản biện nội bộ ở bước 6 trước khi khoá danh mục tính năng |
| Nhiều agent viết UC song song dễ lệch thuật ngữ, tác nhân, mã | Bộ quy ước chung, danh mục tác nhân và BR cố định trước khi viết, script rà chéo, em đọc lại từng module |
| Mô hình tự bịa số liệu về Every Half | Tiêu chí chấp nhận số 4 của blueprint; mọi số phải gắn `A-nn` |
| Khối lượng lớn, chạy lâu | Báo tiến độ sau mỗi bước ở §8 |

## 12. Ngoài phạm vi

- Sửa code hoặc migration (ví dụ danh mục vai trò trong `role.enum.ts`). Blueprint chỉ đề xuất; sửa code là việc sau khi Every Half duyệt.
- Xuất PDF hoặc dán sang Lark (Duy tự làm).
- Liên hệ Every Half để hỏi câu hỏi mở.
- Commit git khi chưa được yêu cầu.
