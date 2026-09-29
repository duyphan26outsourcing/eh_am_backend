# Kế hoạch thực thi: Bộ tài liệu sản phẩm EH-AM (Master Blueprint và Use case)

> **Cho agent thực thi:** BẮT BUỘC dùng `superpowers:executing-plans` (Duy đã chọn) để chạy từng task. Task nào giao việc cho subagent thì gọi Agent tool đúng loại agent ghi trong task. Bước dùng checkbox `- [ ]` để đánh dấu.

**Mục tiêu:** Soạn Master Blueprint EH-AM (một file `.md` theo khung FDI Today 5.0) và bộ use case cho mọi tính năng của 12 module, bằng tiếng Việt, văn phong senior/lead; xong thì xoá bộ 01–10 cũ.

**Cách làm:** Khai thác yêu cầu từ brief bằng skill `product-discovery`, lấy góp ý của 4 subagent chuyên môn, rồi một người viết blueprint để giữ một giọng văn và một hệ mã. Danh mục tính năng khoá sau cổng phản biện nội bộ. Use case viết theo 3 đợt, sắp theo phụ thuộc giữa module, trên bộ quy ước chung. Hai script Python kiểm tra cấu trúc đóng vai trò "test".

**Công cụ:** Markdown GFM, Python 3.12, Agent tool (subagent `voltagent-*`), skill `humanizer:humanizer`, skill `use-case-writer`, skill ở thư mục `product-discovery/`.

**Spec:** `docs/superpowers/specs/2026-09-29-eh-am-tai-lieu-san-pham-design.md` (đã duyệt). Người thực thi đọc cả spec và kế hoạch này.

## Bối cảnh

Every Half gửi brief một trang cho hệ thống quản lý tài sản & CCDC. Bộ 01–10 trong `business/product-docs/` được soạn trước đó, chưa qua bước khai thác yêu cầu và chưa dùng bộ skill chuẩn. Duy muốn làm lại bằng quy trình và bộ skill đã ghi trong CLAUDE.md (mục "Skill bắt buộc khi soạn hoặc cập nhật tài liệu sản phẩm"), để blueprint gửi được cho Every Half duyệt và bộ UC dùng được cho dev/QA.

## Quy ước đường dẫn

- `REPO` = `c:\Users\Admin\development\everyhalf\eh_am_backend`
- `SP` = `C:\Users\Admin\AppData\Local\Temp\claude\c--Users-Admin-development-everyhalf-eh-am-backend\49c0cbeb-a232-441e-8ba7-19973fef5a78\scratchpad`
- `NOTES` = `REPO\docs\superpowers\notes`
- `BP` = `REPO\business\product-docs\product-manager\EveryHalf_AM_Master_Blueprint_v1.0.md`
- `UCROOT` = `REPO\business\product-docs\product-usecase`
- `TIENDO` = `NOTES\2026-09-29-tien-do-thuc-thi.md`
- Script nằm ở `SP\tools\` (spec §8 bước 9: không đưa vào repo). Brief đã trích sẵn ở `SP\inputs\eh_brief.md`.

## Ràng buộc chung

Mọi task ngầm bao gồm các ràng buộc này:

- Mọi tài liệu viết tiếng Việt; thuật ngữ kỹ thuật thông dụng (API, QR, cost center, audit…) giữ tiếng Anh (D-02, D-03).
- Blueprint theo spec §6.5:
  - đúng một file tại `BP`, Markdown GFM thuần;
  - không HTML, không Mermaid, không `<br>`, không emoji;
  - tiêu đề tối đa 3 cấp;
  - các khung viết bằng blockquote, nhãn in đậm ở dòng đầu.
- Bản gốc của blueprint là các file phần trong `SP\bp\` cho tới hết Task 18. `BP` luôn là bản lắp ghép bằng `assemble_blueprint.py`; muốn sửa thì sửa file phần rồi lắp lại. Mỗi lần ghi một file phần tối đa khoảng 25 KB; dài hơn thì tách thành nhiều file có tên sắp xếp được.
- Hệ mã theo spec §6.6, cộng thêm:
  - `B-nn`: dòng brief, định nghĩa ở bản chép brief;
  - `BR-CMN-nn`: quy tắc chung đầu §14;
  - `D-nn`: định nghĩa ở bảng "Quyết định" của Phụ lục I;
  - `M01`–`M12` định nghĩa ở §13;
  - chỉ có `GĐ1`, `GĐ2`, `GĐ3`.

  Mỗi mã được định nghĩa đúng một lần, bằng một dòng trong bảng có cột đầu tên "Mã", đặt ở mục nhà của mã.
- Không có con số nào về Every Half (số điểm, số tài sản, tần suất, quy mô đội, thời hạn) mà không gắn `A-nn`. Trong UC, "Tần suất sử dụng" phải có `A-nn` hoặc `[TBD-n]`.
- Mỗi đoạn nói về quy định kế toán hoặc pháp lý phải có số hiệu văn bản và câu "cần Kế toán trưởng xác nhận" (hoặc "cần pháp chế xác nhận").
- UC theo spec §7.3–§7.5; người tạo và người cập nhật "Duy (BA/PO)"; ngày `2026-09-29`.
- Văn phong theo spec §10 và skill `humanizer:humanizer`.
- Không sửa code hay migration, không commit (D-10), không liên hệ Every Half.
- Quy tắc với subagent:
  - Subagent không gọi được Skill tool, nên đọc thẳng file của skill.
  - Prompt nào cũng ghi rõ: file cần đọc, file phải ghi, tiêu đề bắt buộc, ràng buộc ngôn ngữ và văn phong, cấm bịa số.
  - Subagent chỉ ghi vào file được giao.
  - `voltagent-research:research-analyst` và `voltagent-qa-sec:qa-expert` không có Write/Edit: hai agent này trả toàn văn trong tin nhắn cuối, người thực thi chép nguyên văn vào file ghi chú.
- Xong mỗi task:
  - cập nhật `TIENDO` (task đã xong, quyết định mới, dải mã đã dùng, việc còn treo);
  - báo Duy một dòng tiến độ.

  Sau khi ngữ cảnh bị nén, đọc `TIENDO` trước khi làm tiếp.

## Tâm điểm rà soát

Năm lỗi có khả năng gây hại nhất, xếp theo khả năng xảy ra:

1. Một dòng brief không có tính năng tương ứng, tức mất yêu cầu. Chặn bằng `E-TRACE` (Task 1) và cổng phản biện (Task 9).
2. Mã tham chiếu trỏ tới thứ không tồn tại (BR, UC trong "Bao gồm", SCR, A/Q/R/D). Chặn bằng `E-ID-UNDEF` (Task 1), `E-BR`, `E-INC`, `E-SCR` (Task 12).
3. Số liệu về Every Half do mô hình tự đặt ra. Chặn bằng `W-NUM`, `E-PLAN-ASSUMP` (Task 1), `E-FREQ` (Task 12) và bước đọc soát ở Task 10.
4. Định dạng vỡ khi dán sang Lark: HTML, `<br>`, tiêu đề cấp 4, Mermaid, emoji, bảng lệch số ô. Chặn bằng `E-FMT`, `E-TABLE` (Task 1, Task 12).
5. Hai module mô tả cùng một việc theo hai cách: điều chuyển đi sửa (M06/M07), ghi giảm (M08/M10), đổi cost center (M06/M10), mất tài sản khi kiểm kê (M05/M08). Chặn bằng câu hỏi bắt buộc của cổng phản biện (Task 9), bảng "Điểm bàn giao" (Task 11) và đọc chéo (Task 16).

---

### Task 1: Chép brief, lập file tiến độ, viết script kiểm tra blueprint

**Files:**

- Create: `NOTES\2026-09-29-brief-every-half.md`, `TIENDO`
- Create: `SP\tools\check_blueprint.py`, `SP\tools\assemble_blueprint.py`, `SP\tools\sample\` (mẫu sạch và mẫu lỗi)

**Interfaces:**

- Produces: mã `B-01`…`B-nn`, mỗi dòng nội dung của brief một mã, giữ nguyên văn.
- Produces: `assemble_blueprint.py`: nối `SP\bp\*.md` theo tên file, ghi `BP` dạng UTF-8 không BOM, xuống dòng LF.
- Produces: `check_blueprint.py --file <BP> --brief <bản chép brief> [--upto MD|I|II|III|IV|V|VI|VII|PL] [--export <thư mục>]`:
  - exit 0 khi không có `ERROR`; in từng dòng `ERROR [mã] <vị trí>: …` hoặc `WARN [mã] …`;
  - `--upto` mặc định là `PL` (toàn bộ);
  - `--export` ghi `features.json` (`[{id, module, name, phase, source}]`), `brs.json` (`[{id, module, text}]`), `screens.json` (`[{id, name, users, module}]`), `codes.json` (`[{id, type, home, text}]`).

- [ ] **Bước 1:** Chép kế hoạch đã duyệt sang `REPO\docs\superpowers\plans\2026-09-29-eh-am-tai-lieu-san-pham.md`. Cập nhật spec cho khớp ba điểm kế hoạch đã chỉnh sau khi phản biện:
  - §8 bước 8: UC viết 3 đợt theo phụ thuộc (M01–M04 + M12 → M05–M08 → M09–M11), thay cho 2 đợt;
  - §6.6: thêm `B-nn`, `BR-CMN-nn`, `D-nn` và mục nhà của chúng;
  - §3: thêm sổ A/Q/R và file tiến độ vào danh sách ghi chú.
- [ ] **Bước 2:** Viết bản chép brief:
  - bảng nguồn: tên file, ngày nhận, bên gửi là Every Half;
  - bảng `| Mã | Nhóm | Nội dung nguyên văn |`, mỗi dòng nội dung một mã `B-nn`, gồm mục tiêu, 8 nhóm chức năng, 3 nguyên tắc, North Star.

  Tạo `TIENDO` với khung: task đã xong · quyết định · dải mã · việc treo.
- [ ] **Bước 3:** Viết `check_blueprint.py`. Mọi kiểm tra đều bỏ qua nội dung nằm trong code span và khối code. Các kiểm tra:
  - `E-HEAD`: kiểm các thành phần sau, trong phạm vi `--upto`:
    - phần mở đầu: một tiêu đề cấp 1 (`#`) làm tên tài liệu, blockquote có "**Ranh giới tin cậy**", `## Kiểm soát tài liệu`, `## Brief gốc → Blueprint 1.0`, `## Mục lục cấu trúc`, `## Quy ước đọc`;
    - mỗi `# PHẦN <số La Mã>` có blockquote "**Tuyên bố thiết kế**" trước `##` đầu tiên của phần đó;
    - `## <n>.` với n = 1…41, nằm đúng Phần theo spec §6.1;
    - `# PHỤ LỤC` và `## Phụ lục <X>` cho X = A…K.
  - `E-FMT`: thẻ HTML, `<br`, khối ` ```mermaid `, tiêu đề từ `####`, ký tự emoji (dải `U+1F300–U+1FAFF`, `U+2600–U+27BF`).
  - `E-TABLE`: dòng bảng có số ô khác dòng tiêu đề của bảng (không đếm `\|`).
  - `E-ID-UNDEF`, `E-ID-DUP`:
    - Định nghĩa là ô đầu của dòng thuộc bảng có ô tiêu đề đầu bắt đầu bằng "Mã", nằm trong mục nhà.
    - Mục nhà: M ở §13; F, BR (gồm BR-CMN) ở §14; WF ở §22; G ở §34; SCR ở Phụ lục K; A ở G; Q ở H; R, D ở I.
    - S định nghĩa bằng tiêu đề `### 31.<n>. S<nn>`; B định nghĩa ở file `--brief`.
    - Khi dùng `--upto`, mã chưa định nghĩa mà mục nhà nằm ngoài phạm vi thì bỏ qua, không bỏ qua mã trùng.
  - `E-GD`: có mã giai đoạn khác `GĐ1`, `GĐ2`, `GĐ3`.
  - `E-TRACE` (chỉ khi `--upto PL`): một `B-nn` không có dòng trong Phụ lục F, dòng đó không có mã `F-`, hoặc mã `F-` trong Phụ lục F không tồn tại.
  - `E-PLAN-ASSUMP`: §33 không có mã `A-` nào.
  - `E-LEGAL`: đoạn nhắc "Thông tư", "Nghị định" hoặc "Luật" mà thiếu một trong hai điều kiện:
    - có số hiệu theo mẫu `\d+/\d{4}/[A-ZĐ0-9-]+` (hoặc "Luật … số …");
    - có cụm "cần" … "xác nhận".
  - `W-NUM`: trước tiên xoá mã (F-, BR-, S01, WF-…), ngày tháng, số phiên bản. Sau đó cảnh báo dòng có con số đứng trong vòng 3 từ quanh "cửa hàng", "điểm bán", "kho", "xưởng", "tài sản", "CCDC", "nhân viên", "người dùng", "lượt", "%", "đ", "VND", "triệu", "tỷ" mà trên dòng đó không có `A-` hoặc `Q-`.
- [ ] **Bước 4:** Viết `assemble_blueprint.py`.
- [ ] **Bước 5:** Dựng `SP\tools\sample\sach.md` (đủ khung tối thiểu, mọi mã được định nghĩa) và `SP\tools\sample\loi.md` (mỗi loại lỗi đúng một chỗ), kèm một brief mẫu.
- [ ] **Bước 6:** Chạy `check_blueprint.py` trên `sach.md`. Kỳ vọng: exit 0. Chạy trên `loi.md`. Kỳ vọng: mỗi mã `E-` xuất hiện đúng một lần. Chạy `sach.md --upto II` và `sach.md --export SP\tools\sample\out`. Kỳ vọng: exit 0; có đủ 4 file JSON.
- [ ] **Bước 7:** Chạy `check_blueprint.py --file BP --brief …`. Kỳ vọng: FAIL, báo `BP` chưa tồn tại.

### Task 2: Khai thác yêu cầu bằng product-discovery

**Files:**

- Create: `NOTES\2026-09-29-kham-pha-yeu-cau.md`

**Interfaces:**

- Consumes: bản chép brief.
- Produces: giả định `A-01…`, câu hỏi `Q-01…`, rủi ro `R-01…`, tình huống biên. Dải mã cuối cùng ghi vào `TIENDO`.

- [ ] **Bước 1:** Đọc `product-discovery/SKILL.md`, `references/requirement-layers.md`, `references/detection-logic.md`, `references/question-library.json`, `references/output-schema.json`, `templates/findings-summary.md`.
- [ ] **Bước 2:** Viết file theo thứ tự:
  - phân loại ý định cho từng nhóm của brief;
  - bảng 5 tầng BABOK, mỗi tầng ✅/🟡/⛔ kèm bằng chứng;
  - bảng biết/chưa biết;
  - đủ 13 mục của `templates/findings-summary.md`;
  - danh sách tình huống biên;
  - các câu hỏi "vì sao" chưa hỏi được Every Half, chuyển thành `Q-nn`. Cột "Cần trả lời trước cổng" ghi "chờ Task 7"; sẽ ánh xạ lại ở Task 8.
- [ ] **Bước 3:** Kiểm tra ba điều, kỳ vọng không thiếu điều nào:
  - mọi `Q-nn` có người trả lời (vai trò phía Every Half);
  - mọi `A-nn` có "ai xác nhận";
  - mọi `B-nn` xuất hiện ít nhất một lần trong bảng FR, NFR hoặc BR.
- [ ] **Bước 4:** Đọc `business/product-docs/01-…10-…md` để vét câu hỏi và tình huống biên còn thiếu. Dùng lại thì viết lại, không chép văn.

### Task 3: Góp ý chuyên môn, gộp sổ A/Q/R, xếp hạng giả định

**Files:**

- Create: `NOTES\2026-09-29-gop-y-product-manager.md`, `…-gop-y-project-manager.md`, `…-gop-y-scrum-master.md`, `…-kiem-chung-quy-dinh.md`, `…-so-dang-ky-a-q-r.md`, `…-xep-hang-gia-dinh.md`

**Interfaces:**

- Consumes: spec, bản chép brief, `kham-pha-yeu-cau.md`, CLAUDE.md, `eh_am_frontend/package.json`.
- Produces: sổ A/Q/R duy nhất (`so-dang-ky-a-q-r.md`) có bảng đối chiếu mã tạm → mã chính. Từ Task 4 trở đi chỉ dùng mã chính.

- [ ] **Bước 1:** Gọi song song 4 agent trong một lượt. Mỗi agent dùng mã tạm riêng cho giả định, câu hỏi, rủi ro mới: product-manager `A-PM-nn`, project-manager `A-PJ-nn`, scrum-master `A-SM-nn`, research `A-RS-nn` (Q, R tương tự).
  - `voltagent-biz:product-manager`. Tiêu đề bắt buộc:
    `## 1. Tuyên ngôn và tầm nhìn` · `## 2. Giá trị cho từng bên` · `## 3. North Star và chỉ số dẫn dắt` · `## 4. Ưu tiên tính năng (MoSCoW, có lý do)` · `## 5. Phạm vi MVP và phân kỳ GĐ1–GĐ3` · `## 6. KPI theo cấp` · `## 7. Đo lường lợi ích` · `## 8. Rủi ro giá trị và giả định` · `## 9. Câu hỏi cho Every Half`.
    Việc riêng: kiểm lại phân kỳ ở spec §6.4 mục 2; cho ý kiến mở hay đóng đăng ký tài khoản công khai (comment trong `src/auth/dto/register.dto.ts`).
  - `voltagent-biz:project-manager`. Tiêu đề bắt buộc:
    `## 1. Lộ trình theo tuần kể từ kick-off` · `## 2. Cổng kiểm soát` (8–10 cổng: tên, mục đích, tiêu chí vào/ra, thẩm quyền, quyết định có thể) · `## 3. Mô hình quản trị và RACI` · `## 4. RAID` · `## 5. Chuyển đổi dữ liệu và chiến dịch dán nhãn` · `## 6. Go-live và hypercare` · `## 7. Nhóm chi phí vận hành` (không ghi đơn giá) · `## 8. Truyền thông và đào tạo` · `## 9. Câu hỏi cho Every Half`.
  - `voltagent-biz:scrum-master`. Tiêu đề bắt buộc:
    `## 1. Mô hình giao hàng và vai trò trong đội` · `## 2. Nhịp sprint và nghi thức` · `## 3. Cấu trúc backlog (module → tính năng → UC → story)` · `## 4. Definition of Ready` · `## 5. Definition of Done (story, module, bản phát hành)` · `## 6. Kế hoạch phát hành theo sprint` · `## 7. Nhịp UAT với Every Half` · `## 8. Chỉ số giao hàng` · `## 9. Rủi ro giao hàng`.
  - `voltagent-research:research-analyst`. Tiêu đề bắt buộc:
    `## 1. Ghi nhận TSCĐ và CCDC` · `## 2. Khấu hao TSCĐ` · `## 3. Phân bổ CCDC` · `## 4. Thanh lý, nhượng bán, báo giảm` · `## 5. Kiểm kê tài sản` · `## 6. Chứng từ và thời hạn lưu trữ` · `## 7. Dữ liệu cá nhân (GPS, ảnh, định danh nhân viên)` · `## 8. Các sản phẩm FAST và khả năng tích hợp` · `## 9. Điểm cần Kế toán trưởng hoặc pháp chế xác nhận`.
    Mỗi khẳng định ghi: tên văn bản, số hiệu, ngày hiệu lực, tình trạng hiệu lực tại 2026-09, URL nguồn, mức tin cậy; không có nguồn thì ghi "chưa kiểm chứng". Agent trả toàn văn; người thực thi chép vào `kiem-chung-quy-dinh.md`.
- [ ] **Bước 2:** Kiểm tra bốn file:
  - đủ tiêu đề bắt buộc;
  - không có con số về Every Half mà không gắn mã giả định;
  - file research có nguồn cho từng khẳng định.

  Thiếu thì gửi tiếp cho đúng agent qua SendMessage.
- [ ] **Bước 3:** Gộp mọi A/Q/R của Task 2 và bốn file thành `so-dang-ky-a-q-r.md`. Mã chính đánh tiếp sau dải của Task 2; gộp các mục trùng ý. Có bảng `| Mã tạm | Mã chính |`.
- [ ] **Bước 4:** Gọi `voltagent-biz:assumption-mapping` với toàn bộ `A-` trong sổ. Đầu ra là bảng `| Mã | Giả định | Hậu quả nếu sai | Mức chắc chắn | Ưu tiên xác nhận | Cách xác nhận | Ai xác nhận |`. Kỳ vọng: đủ mọi `A-` của sổ.

### Task 4: Blueprint, phần mở đầu và Phần I–II (§1–§11)

**Files:**

- Create: `SP\bp\00-mo-dau.md`, `SP\bp\10-phan-1.md`, `SP\bp\20-phan-2.md`; lắp ra `BP`

**Interfaces:**

- Consumes: spec §6.1, §6.5; ghi chú của Task 2–3; sổ A/Q/R.
- Produces:
  - tên nhóm người dùng và mã vai trò ở §8, dùng y nguyên ở §14, Phụ lục K, `_chung/tac-nhan.md`;
  - bảng "Quy ước đọc" định nghĩa nhãn, giai đoạn, hệ mã (có `BR-CMN`, `B-`).

- [ ] **Bước 1:** Viết phần mở đầu:
  - bìa và khung "Ranh giới tin cậy";
  - bảng Kiểm soát tài liệu (phiên bản 1.0, ngày 29/09/2026);
  - bảng "Brief gốc → Blueprint 1.0";
  - mục lục cấu trúc;
  - bảng quy ước đọc.
- [ ] **Bước 2:** Viết Phần I, §1–§7, theo spec §6.1:
  - §5 lấy từ nguyên nhân gốc ở Task 2 và ghi rõ phần nào là suy luận;
  - §7 có bảng bối cảnh hệ thống.
- [ ] **Bước 3:** Viết Phần II, §8–§11:
  - §8 là bảng nhóm người dùng; mỗi nhóm có mã vai trò đề xuất theo kiểu `role.enum.ts` (ví dụ `LOCATION_MANAGER`), không gian làm việc, nhu cầu cốt lõi;
  - §10 là vòng đời tài sản.
- [ ] **Bước 4:** Lắp ghép, chạy `check_blueprint.py --upto II`. Kỳ vọng: không `ERROR`; `WARN` nào cũng đã đọc và xử lý.

### Task 5: Blueprint, Phần III (§12–§14, 12 module)

**Files:**

- Create: `SP\bp\30-phan-3-dau.md` (§12, §13, phần đầu §14), `SP\bp\30-phan-3-m01.md` … `SP\bp\30-phan-3-m12.md`; lắp lại `BP`

**Interfaces:**

- Consumes: spec §6.2–§6.4; ưu tiên và phân kỳ trong `gop-y-product-manager.md`; `kiem-chung-quy-dinh.md`.
- Produces: đây là danh mục mà Task 9 khoá và Task 11 dùng.
  - Bảng `| Mã | Module | Mục tiêu | Người dùng chính | GĐ | Nguồn brief |` ở §13.
  - Bảng `| Mã | Quy tắc chung |` (BR-CMN) ở đầu §14.
  - Mỗi module có bảng `| Mã | Tính năng | Mô tả | GĐ | Nguồn |` và `| Mã | Quy tắc | Nguồn |`.

- [ ] **Bước 1:** Viết §12 (khoảng 6 lớp sản phẩm), §13 và phần đầu §14 (bảng `BR-CMN-nn`).
- [ ] **Bước 2:** Viết §14.1–§14.12 theo mẫu spec §6.3, mỗi module một file:
  - M01 có quyết định đề xuất: đăng ký công khai hay quản trị tạo tài khoản;
  - M10 có ma trận sở hữu dữ liệu theo từng trường (spec §6.4 mục 1);
  - M09 nêu hai phương án về hệ tính khấu hao, kèm phương án khuyến nghị và câu hỏi cho Kế toán trưởng.

  Tên tác nhân lấy đúng §8. Bảng "ngoài phạm vi" dùng cột đầu khác "Mã" để script không coi là định nghĩa.
- [ ] **Bước 3:** Lắp ghép, chạy `check_blueprint.py --upto III`. Kỳ vọng: không `ERROR`.

### Task 6: Blueprint, Phần IV–V (§15–§26)

**Files:**

- Create: `SP\bp\40-phan-4.md`, `SP\bp\50-phan-5.md` (tách thêm nếu vượt 25 KB); lắp lại `BP`

**Interfaces:**

- Consumes: spec §6.1; `kiem-chung-quy-dinh.md` mục 7–8; KPI (product-manager); RACI và TCO (project-manager); trạng thái đã định ở §14.
- Produces: bảng `| Mã | Quy trình | Trigger | Tác nhân | Người duyệt | Trạng thái | SLA |` ở §22.

- [ ] **Bước 1:** Viết Phần IV, §15–§21:
  - §15–§16: job tự động (khấu hao tháng, đồng bộ FAST, nhắc kiểm kê, cảnh báo quá hạn); mỗi job có chủ sở hữu, lịch chạy, cách chạy lại, log;
  - §17: lớp dữ liệu và nhóm thực thể;
  - §19: nhóm API `/v1`, tích hợp FAST qua outbox và đối soát;
  - §20: mục dữ liệu cá nhân dựa trên file research.
- [ ] **Bước 2:** Viết Phần V, §22–§26:
  - §22: bảng WF và khung hợp đồng máy trạng thái;
  - §23: KPI có định nghĩa, công thức, nguồn, chủ sở hữu;
  - §25: RACI;
  - §26: nhóm chi phí, không ghi đơn giá.
- [ ] **Bước 3:** Lắp ghép, chạy `check_blueprint.py --upto V`. Kỳ vọng: không `ERROR`.

### Task 7: Blueprint, Phần VI–VII (§27–§41)

**Files:**

- Create: `SP\bp\60-phan-6-a.md` (§27–§30), `SP\bp\60-phan-6-b.md` (§31), `SP\bp\60-phan-6-c.md` (§32), `SP\bp\70-phan-7.md` (tách thêm nếu vượt 25 KB); lắp lại `BP`

**Interfaces:**

- Consumes: CLAUDE.md; `README.md` gốc; `sql-docs/README.md`; `eh_am_frontend/package.json`; ghi chú của project-manager và scrum-master.
- Produces: tiêu đề `### 31.<n>. S<nn>: …` cho S01–S14; bảng `| Mã | Tên | Mục đích | Thẩm quyền | Quyết định có thể |` ở §34.

- [ ] **Bước 1:** Viết Phần VI:
  - §27–§28 bám stack thật: NestJS 11, Supabase, Vite + React 19 + TanStack, i18next.
  - §29: khoảng 10 hợp đồng kỹ thuật lấy từ quy tắc đang có trong code:
    - phạm vi location xác định phía server;
    - không xoá dữ liệu, có audit;
    - `numeric` và `SUM()` trong SQL;
    - kỳ kế toán theo giờ Asia/Ho_Chi_Minh;
    - mapper theo người xem;
    - idempotent cho lượt quét gửi lại;
    - FAST qua outbox và đối soát;
    - không lộ bí mật trong log;
    - version API.
  - §30: bảng những gì đã có.
  - §31: mỗi bước một bảng key–value gồm Lộ trình, Phạm vi, Đầu ra chính, Phụ thuộc, Quy trình WF, Tiêu chí nghiệm thu, Quyền mẫu, Ranh giới tự động hoá.
  - §32: Definition of Done cấp module.
- [ ] **Bước 2:** Viết Phần VII, §33–§41:
  - §33: lộ trình theo tuần, có mã `A-` về quy mô đội;
  - §34: các cổng;
  - §35: chuyển đổi dữ liệu và dán nhãn, có khung "Không được phép";
  - §36: go-live và hypercare;
  - §37: đo lợi ích có baseline;
  - §38: mở rộng chuỗi;
  - §39: thứ tự thực thi, bảng Seq, Bước, Tên, Nhánh git, Điều kiện trước, Cổng merge;
  - §40–§41: tiêu chí nghiệm thu và tuyên bố kết thúc.
- [ ] **Bước 3:** Lắp ghép, chạy `check_blueprint.py --upto VII`. Kỳ vọng: không `ERROR`.

### Task 8: Blueprint, phụ lục A–K

**Files:**

- Create: `SP\bp\80-pl-0-dau.md`, `SP\bp\80-pl-a.md` … `SP\bp\80-pl-k.md`; lắp lại `BP`

**Interfaces:**

- Consumes: mọi mã đã dùng ở Task 4–7; sổ A/Q/R; `xep-hang-gia-dinh.md`.
- Produces: bảng định nghĩa SCR, A, Q, R, D; Phụ lục F để truy vết.

- [ ] **Bước 1:** Viết Phụ lục A–E theo spec §6.1. Phụ lục D ghi đường dẫn tới `product-usecase/README.md`.
- [ ] **Bước 2:** Viết Phụ lục F, bảng `| Dòng brief | Nội dung | Module | Tính năng |`, đủ mọi `B-nn`.
- [ ] **Bước 3:** Viết Phụ lục G–I:
  - G: `| Mã | Giả định | … |`, xếp theo ưu tiên xác nhận;
  - H: `| Mã | Câu hỏi | Người trả lời | Cần trước cổng |`; ánh xạ các dòng "chờ Task 7" sang cổng thật ở §34;
  - I: bảng `| Mã | Loại (Rủi ro / Vấn đề / Phụ thuộc) | … |` cho R, và bảng `| Mã | Quyết định | Trạng thái | Nơi nêu |` cho D, gồm các quyết định đề xuất ở §14 và §19.
- [ ] **Bước 4:** Viết Phụ lục J (thuật ngữ) và K: `| Mã | Màn hình | Người dùng | Module | Thiết bị |`.
- [ ] **Bước 5:** Lắp ghép, chạy `check_blueprint.py` (toàn bộ). Kỳ vọng: exit 0.

### Task 9: Cổng phản biện nội bộ

**Files:**

- Create: `NOTES\2026-09-29-phan-bien-danh-muc-tinh-nang.md`
- Modify: các file trong `SP\bp\`; lắp lại `BP`

- [ ] **Bước 1:** Gọi `voltagent-biz:business-analyst` làm phản biện. Agent đọc `BP` và bản chép brief, trả lời bắt buộc các câu sau và ghi vào file phản biện:
  - dòng brief nào chưa được phủ đủ;
  - tính năng nào trùng giữa hai module, riêng các cặp: M06/M07 điều chuyển đi sửa, M08/M10 ghi giảm, M06/M10 đổi cost center, M05/M08 mất tài sản;
  - quy tắc nào mơ hồ hoặc mâu thuẫn;
  - trạng thái nào có ở §14 mà thiếu ở Phụ lục B;
  - vai trò nào dùng ở §14 mà không có ở §8;
  - tính năng nào không đủ rõ để tách UC.
- [ ] **Bước 2:** Sửa file phần theo các điểm được chấp nhận; điểm không chấp nhận thì ghi lý do vào file phản biện. Lắp ghép, chạy `check_blueprint.py`. Kỳ vọng: exit 0.

### Task 10: Soát văn blueprint và khoá danh mục

**Files:**

- Create: `NOTES\2026-09-29-soat-van-blueprint.md`, `SP\tools\export\` (4 file JSON)
- Modify: các file trong `SP\bp\`; lắp lại `BP`

- [ ] **Bước 1:** Gọi skill `humanizer:humanizer`, áp quy tắc của skill cùng spec §10 lên từng file phần. Sửa trực tiếp.
- [ ] **Bước 2:** Rà mọi `WARN [W-NUM]`: sửa, hoặc gắn `A-nn`.
- [ ] **Bước 3:** Gọi `voltagent-qa-sec:ai-writing-auditor`: đọc `BP`, chỉ ghi báo cáo vào `soat-van-blueprint.md` (vị trí, dấu hiệu, mức độ cao/trung bình/thấp, gợi ý viết lại). Agent không sửa `BP`.
- [ ] **Bước 4:** Sửa mọi mục mức cao và trung bình. Lắp ghép, chạy `check_blueprint.py --export SP\tools\export`. Kỳ vọng:
  - exit 0;
  - `features.json` có đủ 12 module, mỗi module ít nhất 3 tính năng;
  - `screens.json` không rỗng.

  Từ đây danh mục tính năng coi như đã khoá; muốn đổi thì ghi vào `TIENDO` và chạy lại export.

### Task 11: Bộ quy ước UC, danh sách UC, bảng điểm bàn giao

**Files:**

- Create: `UCROOT\README.md`, `UCROOT\_chung\mau-uc.md`, `UCROOT\_chung\mau-checklist.md`, `UCROOT\_chung\tac-nhan.md`, `UCROOT\_chung\thuat-ngu.md`, `UCROOT\_chung\quy-tac-nghiep-vu.md`, 12 thư mục module theo spec §7.1

**Interfaces:**

- Consumes: `BP` (§8, §14, Phụ lục B, J, K), `features.json`, `brs.json`, `screens.json`.
- Produces: các "hợp đồng" giao cho agent ở Task 13–15:
  - Danh sách UC trong README: `| Mã UC | Tên UC | Module | Tính năng | Tác nhân chính | Mức mục tiêu | Ưu tiên | GĐ | File |`.
  - Bảng "Điểm bàn giao giữa UC": `| Mã | UC gửi / gọi | UC nhận / được gọi | Đầu vào | Đầu ra | Ngoại lệ do bên nào xử lý | Trạng thái tài sản lúc bàn giao |`.
  - Mẫu `_checklist.md`: mỗi UC một mục `## <Mã UC>: <Tên>` gồm bảng `| Mã | Tiêu chí | Kết quả | Ghi chú |` với các dòng C1–C20 (tên tiêu chí tiếng Việt lấy từ `quality-checklist.md`) và dòng "Tổng hợp". Cuối file có hai mục `## Quy tắc nghiệp vụ đề xuất bổ sung` (`| Mã | Quy tắc | UC dùng |`) và `## Tác nhân đề xuất bổ sung` (`| Tác nhân | Lý do | UC dùng |`).

- [ ] **Bước 1:** Đọc `use-case-writer/SKILL.md` (chế độ B, 4 quy tắc phạm vi, 3 kỹ thuật tách UC), `references/template-guide.md`, `references/writing-style.md`, `references/quality-checklist.md`.
- [ ] **Bước 2:** Viết `_chung/mau-uc.md` (đúng spec §7.3) và `_chung/mau-checklist.md` (theo mục Produces ở trên).
- [ ] **Bước 3:** Viết `_chung/tac-nhan.md`, bảng `| Tác nhân | Loại (Người / Hệ thống / Thời gian) | Mô tả | Mã vai trò | Dùng ở module |`. Tên tác nhân người lấy đúng §8; thêm FAST, Bộ lập lịch, Dịch vụ email, Dịch vụ lưu trữ tệp. Viết `_chung/thuat-ngu.md` từ Phụ lục J. Viết `_chung/quy-tac-nghiep-vu.md` gồm mọi dòng của `brs.json`, giữ nguyên văn, bảng `| Mã | Quy tắc | Module | Nguồn |`.
- [ ] **Bước 4:** Lập danh sách UC cho từng module bằng ba kỹ thuật (theo mục tiêu, theo sự kiện, theo CRUD) và coffee-break test:
  - M01 phải phủ đủ 10 route của `src/auth/auth.controller.ts` (register, resend-confirmation, login, refresh, logout, logout-all, forgot-password, reset-password, change-password, me): mỗi route là một UC, một luồng thay thế, hoặc một include;
  - UC dùng chung (ví dụ quét và nhận diện tài sản bằng QR) ghi mức "Chức năng con";
  - tính năng không cần UC thì ghi lý do.
- [ ] **Bước 5:** Lập bảng "Điểm bàn giao" cho mọi include và mọi cặp UC khác module có trao tài sản hoặc trạng thái cho nhau. Tối thiểu gồm: báo hỏng → sửa chữa → điều chuyển đi sửa; thanh lý → báo giảm FAST; điều chuyển → đổi cost center → FAST; kiểm kê → xử lý mất; mọi thay đổi → audit.
- [ ] **Bước 6:** Viết `README.md`:
  - cách đọc, trỏ tới `_chung/mau-uc.md`;
  - quy ước mã và tên file;
  - định nghĩa độ ưu tiên và mức mục tiêu;
  - danh sách UC;
  - "Tính năng không cần UC";
  - "Điểm bàn giao giữa UC";
  - ma trận truy vết `F-` → UC;
  - "Tổng hợp checklist" để trống, điền ở Task 18.

### Task 12: Script kiểm tra bộ UC

**Files:**

- Create: `SP\tools\check_usecases.py`, `SP\tools\sample-uc\`

**Interfaces:**

- Consumes: định dạng đã chốt ở Task 11; `SP\tools\export\*.json`.
- Produces: `check_usecases.py --root <UCROOT> --export-dir SP\tools\export [--modules M01,…] [--chung-hash <file>] [--write-chung-hash <file>]`, exit 0 khi không có `ERROR`.

- [ ] **Bước 1:** Viết script. Trước khi so khớp chữ tiếng Việt, chuẩn hoá NFC và bỏ định dạng (`**`, dấu câu cuối, phần trong ngoặc). Các kiểm tra:
  - `E-FILE`: tên file sai mẫu `^UC-[A-Z]{2,3}-\d{2}_[a-z0-9-]+\.md$`; mã ở tên file, tiêu đề `#` và ô "Mã UC" không khớp.
  - `E-DUP`: mã UC trùng.
  - `E-FIELD`: thiếu một trong 10 nhãn định danh hoặc 13 nhãn trường (danh sách ở spec §7.3).
  - `E-EN`: còn nhãn tiếng Anh (Use Case ID, Actor, Preconditions, Postconditions, Normal Course, Alternative Courses, Exceptions, Includes, Special Requirements, Assumptions, Notes and Issues).
  - `E-AC`, `E-EX`: sai mẫu `.AC.<n>` hoặc `.EX.<n>`; AC thiếu "Tại bước"; EX thiếu "Khi nào:", "Hệ thống:" hoặc "Trạng thái cuối:".
  - `E-INC`: "Bao gồm" trỏ tới mã không có trong danh sách UC của README (đối chiếu danh sách dự kiến, không chỉ file đã viết).
  - `E-BR`: mã `BR-` không có trong `_chung/quy-tac-nghiep-vu.md` và cũng không có trong mục "đề xuất bổ sung" của `_checklist.md` cùng module. Ở Task 16, sau khi gộp, bật cờ `--strict-br` để chỉ chấp nhận mã trong `_chung/`.
  - `E-ACTOR`: tác nhân sau "Chính:" hoặc "Phụ:" (tách theo dấu phẩy và chữ "và"; bỏ qua "Không có") không có trong `_chung/tac-nhan.md`, cũng không có trong mục "Tác nhân đề xuất bổ sung" cùng module.
  - `E-SCR`: chữ in đậm đi sau "màn hình" không trùng tên màn hình nào trong `screens.json`.
  - `E-FREQ`: "Tần suất sử dụng" không có `A-nn` và không có `[TBD-n]`.
  - `E-FEAT`: mã tính năng không có trong `features.json`; hoặc (trong phạm vi `--modules`) một mã của `features.json` không có UC và không nằm trong "Tính năng không cần UC".
  - `E-CHK`: `_checklist.md` thiếu mục của một UC, thiếu dòng C1–C20, có ❌, hoặc có ⚠️ mà ô Ghi chú trống.
  - `E-REG`: danh sách UC trong README lệch với file thực có, trong phạm vi `--modules`.
  - `E-TABLE`: dòng bảng có số ô khác dòng tiêu đề (không đếm `\|`).
  - `E-CHUNG`: khi có `--chung-hash`, hash SHA-256 của `_chung/*` khác file hash (agent đã sửa `_chung/`).
  - `W-NUM`: trong Mô tả và Giả định, có con số đi cùng từ khoá của Task 1 mà không có `A-` hoặc `[TBD-`.
  - `W-EXCOUNT`: số ngoại lệ ngoài khoảng 3–7.
  - `W-STEPS`: số bước luồng chính ngoài khoảng 5–15.
  - `W-SUBJ`: bước của luồng chính không mở đầu bằng "Hệ thống" hoặc tên một tác nhân.

  `--modules` giới hạn mọi kiểm tra trong các module được liệt kê.
- [ ] **Bước 2:** Dựng `sample-uc\` gồm một UC đúng và một UC có mỗi loại lỗi, kèm `_chung/` và README mẫu. Chạy script. Kỳ vọng: UC đúng không bị báo; mỗi mã `E-` xuất hiện với UC sai.
- [ ] **Bước 3:** Chạy trên `UCROOT` thật. Kỳ vọng: chỉ có `E-REG`, `E-FEAT`, `E-CHK` (UC và checklist chưa viết).

### Task 13: Viết UC đợt 1 (M01, M02, M03, M04, M12)

**Files:**

- Create: file UC và `_checklist.md` trong 5 thư mục module

**Interfaces:**

- Consumes: danh sách UC, bảng điểm bàn giao, `_chung/*`, `BP`.
- Produces: file UC đúng danh sách; mỗi module một `_checklist.md` đúng mẫu. Agent không sửa `_chung/` và README.

- [ ] **Bước 1:** Chạy `check_usecases.py --root UCROOT --export-dir … --write-chung-hash SP\state\chung.sha256`.
- [ ] **Bước 2:** Gọi song song 5 agent `voltagent-biz:business-analyst`, mỗi agent một module. Prompt gồm:
  - file cần đọc: `use-case-writer/SKILL.md`, 4 file `references/`, `assets/uc-template.md`, spec §7, `UCROOT\README.md`, `_chung/*`, §14.x của module, Phụ lục B và K của `BP`;
  - riêng M01 đọc thêm: `src/auth/auth.controller.ts`, `auth.service.ts`, `dto/*.ts`, `guards/jwt-auth.guard.ts`, `src/common/i18n/error-code.const.ts`, `src/common/constants/throttle.const.ts`, `src/utils/utils.ts`;
  - danh sách UC được giao và các dòng điểm bàn giao liên quan;
  - quy tắc:
    - mẫu `_chung/mau-uc.md`, mỗi UC viết trọn (D-11);
    - tác nhân, BR, tên màn hình chỉ lấy từ `_chung/` và Phụ lục K; cần cái mới thì ghi vào mục "đề xuất bổ sung" của `_checklist.md`;
    - tần suất gắn `A-nn` hoặc `[TBD-n]`;
    - văn phong theo spec §10;
  - chạy checklist 20 điểm cho từng UC và ghi `_checklist.md` theo `_chung/mau-checklist.md`.
- [ ] **Bước 3:** Chạy `check_usecases.py --modules M01,M02,M03,M04,M12 --chung-hash SP\state\chung.sha256`. Kỳ vọng: exit 0. Có lỗi thì sửa, hoặc gửi lại đúng agent qua SendMessage.

### Task 14: Viết UC đợt 2 (M05, M06, M07, M08)

Làm như Task 13 cho 4 module này, chạy song song 4 agent. Prompt có thêm: đọc UC đã viết của M03, M04, M12 và các UC ở đầu kia của mọi điểm bàn giao liên quan.

- [ ] **Bước 1:** Ghi lại hash `_chung/`.
- [ ] **Bước 2:** Gọi song song 4 agent `voltagent-biz:business-analyst`.
- [ ] **Bước 3:** Chạy `check_usecases.py --modules M05,M06,M07,M08 --chung-hash …`. Kỳ vọng: exit 0.

### Task 15: Viết UC đợt 3 (M09, M10, M11)

Làm như Task 13 cho 3 module này, chạy song song 3 agent. Prompt có thêm:

- M09, M10 đọc UC của M06 và M08;
- M10 đọc ma trận sở hữu dữ liệu ở §14.10 và mục FAST trong `kiem-chung-quy-dinh.md`;
- M11 đọc danh mục KPI ở §23.

- [ ] **Bước 1:** Ghi lại hash `_chung/`.
- [ ] **Bước 2:** Gọi song song 3 agent `voltagent-biz:business-analyst`.
- [ ] **Bước 3:** Chạy `check_usecases.py --modules M09,M10,M11 --chung-hash …`. Kỳ vọng: exit 0.

### Task 16: Gộp đề xuất, rà chéo, đọc lại từng module

**Files:**

- Modify: `UCROOT\_chung\quy-tac-nghiep-vu.md`, `UCROOT\_chung\tac-nhan.md`, `UCROOT\README.md` (nếu danh sách đổi), các file UC có lỗi, `UCROOT\M01-…\_checklist.md`

- [ ] **Bước 1:** Chép các mục "đề xuất bổ sung" (BR và tác nhân) của 12 file `_checklist.md` vào `_chung/`. Gộp mục trùng ý, sửa tham chiếu trong UC, xoá các mục đã gộp khỏi `_checklist.md`.
- [ ] **Bước 2:** Chạy `check_usecases.py --strict-br` (toàn bộ), sửa đến khi exit 0.
- [ ] **Bước 3:** Người thực thi đọc lại từng module (spec §8 bước 9):
  - thuật ngữ, tác nhân, tên màn hình thống nhất;
  - hậu điều kiện của UC gửi khớp tiền điều kiện của UC nhận, theo từng dòng của bảng "Điểm bàn giao".

  Ghi điểm đã sửa vào `TIENDO`.
- [ ] **Bước 4:** Thêm vào `M01-…\_checklist.md` mục `## Đối chiếu route auth`, bảng `| Route | UC / luồng | Khớp code | Ghi chú |` cho đủ 10 route. Chỗ lệch thì ghi vào "Ghi chú và vấn đề mở" của UC.
- [ ] **Bước 5:** Chạy lại `check_usecases.py --strict-br`. Kỳ vọng: exit 0.

### Task 17: Rà khả năng kiểm thử và soát văn bộ UC

**Files:**

- Create: `NOTES\2026-09-29-ra-soat-kiem-thu-uc.md`, `NOTES\2026-09-29-soat-van-uc.md`
- Modify: các file UC và `_checklist.md` theo kết quả rà

- [ ] **Bước 1:** Gọi song song 3 agent `voltagent-qa-sec:qa-expert`, lần lượt phụ trách M01–M04, M05–M08, M09–M12. Mỗi agent trả báo cáo trong tin nhắn cuối: hậu điều kiện không kiểm chứng được, ngoại lệ còn thiếu, bước mơ hồ, mâu thuẫn giữa UC; mỗi mục có mã UC và mức độ. Người thực thi chép nguyên văn vào `ra-soat-kiem-thu-uc.md`.
- [ ] **Bước 2:** Gọi skill `humanizer:humanizer` cho phần Mô tả, Giả định, Ghi chú của từng module. Gọi `voltagent-qa-sec:ai-writing-auditor` lấy mẫu mỗi module 2 UC, chỉ ghi báo cáo vào `soat-van-uc.md`.
- [ ] **Bước 3:** Sửa mọi mục mức cao và trung bình của cả hai báo cáo; cập nhật `_checklist.md` của UC bị sửa.
- [ ] **Bước 4:** Chạy `check_usecases.py --strict-br`. Kỳ vọng: exit 0.

### Task 18: Chốt README bộ UC, cập nhật và soát lại blueprint

**Files:**

- Modify: `UCROOT\README.md`, `SP\bp\80-pl-d.md`, `SP\bp\80-pl-e.md`; lắp lại `BP`

- [ ] **Bước 1:** Điền "Tổng hợp checklist" trong README, bảng `| Module | Số UC | Số ✅ | Số ⚠️ | Ghi chú |`, lấy số từ các file `_checklist.md`.
- [ ] **Bước 2:** Sửa Phụ lục D, E: đường dẫn bộ UC, số UC theo module, tóm tắt mẫu UC. Áp `humanizer:humanizer` cho hai phụ lục vừa sửa. Lắp ghép.
- [ ] **Bước 3:** Chạy `check_blueprint.py` và `check_usecases.py --strict-br`. Kỳ vọng: cả hai exit 0.

### Task 19: Dọn dẹp và kiểm chứng cuối

**Files:**

- Delete: `REPO\business\product-docs\01-master-blueprint.md`, `02-phan-tich-brief.md`, `03-pham-vi-mvp-lo-trinh.md`, `04-nguoi-dung-vai-tro-phan-quyen.md`, `05-quy-trinh-va-trang-thai.md`, `06-yeu-cau-chuc-nang.md`, `07-user-story-va-nghiem-thu.md`, `08-danh-sach-man-hinh.md`, `09-yeu-cau-phi-chuc-nang.md`, `10-mo-hinh-du-lieu.md`
- Modify: `REPO\README.md`, `REPO\CLAUDE.md`

- [ ] **Bước 1:** Gọi skill `superpowers:verification-before-completion`. Chạy lại hai script, đối chiếu từng tiêu chí ở spec §9.1–§9.2. Chưa đạt thì dừng, chưa xoá gì.
- [ ] **Bước 2:** Chép 10 file cũ sang `SP\backup-product-docs-cu\`. Các file này chưa từng được commit, nên xoá là mất hẳn; bản chép là lưới an toàn trong phiên. Sau đó xoá 10 file.
- [ ] **Bước 3:** Sửa `README.md` gốc: dòng "Tài liệu sản phẩm" trỏ tới `business/product-docs/product-manager/` và `business/product-docs/product-usecase/`. Sửa `CLAUDE.md`: thêm đường dẫn spec, plan, `docs/superpowers/notes/`.
- [ ] **Bước 4:** Chạy `ls business/product-docs`. Kỳ vọng: chỉ còn `product-manager/` và `product-usecase/`.
- [ ] **Bước 5:** Tìm tên 10 file cũ, trừ `docs/superpowers/`, `node_modules/`, `dist/`, `product-discovery/`, `use-case-writer/`. Kỳ vọng: không còn tham chiếu nào.

  ```bash
  grep -rn -e 01-master-blueprint -e 02-phan-tich-brief -e 03-pham-vi-mvp -e 04-nguoi-dung-vai-tro -e 05-quy-trinh-va-trang-thai -e 06-yeu-cau-chuc-nang -e 07-user-story -e 08-danh-sach-man-hinh -e 09-yeu-cau-phi-chuc-nang -e 10-mo-hinh-du-lieu . --exclude-dir=docs --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=product-discovery --exclude-dir=use-case-writer
  ```

- [ ] **Bước 6:** Báo Duy kết quả:
  - danh sách file tạo mới;
  - số UC theo module;
  - mười câu hỏi mở ưu tiên cao nhất cho Every Half;
  - việc Duy tự làm: dán `BP` sang Lark và kiểm hiển thị; cân nhắc thêm `product-discovery/`, `use-case-writer/` vào `.gitignore` trước lần commit đầu vì hai thư mục có `.git` riêng.

---

## Kiểm chứng đầu–cuối

1. `python SP\tools\check_blueprint.py --file BP --brief NOTES\2026-09-29-brief-every-half.md` → exit 0.
2. `python SP\tools\check_usecases.py --root UCROOT --export-dir SP\tools\export --strict-br` → exit 0.
3. Các báo cáo `soat-van-blueprint.md`, `phan-bien-danh-muc-tinh-nang.md`, `ra-soat-kiem-thu-uc.md`, `soat-van-uc.md` không còn mục mức cao chưa xử lý.
4. `business/product-docs/` chỉ còn hai thư mục mới. Không còn tham chiếu tới file 01–10 ngoài `docs/superpowers/`.
5. Việc của Duy (agent không tự làm được): dán `BP` sang Lark, kiểm bảng và khung hiển thị đúng.
