# Sổ tiến độ — plan: docs/superpowers/plans/2026-09-29-eh-am-tai-lieu-san-pham.md

Spec: `docs/superpowers/specs/2026-09-29-eh-am-tai-lieu-san-pham-design.md`. Người thực thi: Claude, theo `superpowers:executing-plans`. Sau khi ngữ cảnh bị nén, đọc file này trước khi làm tiếp; task nào có dòng `Task <N>: complete` thì không làm lại.

## Quyết định khi thiết lập

- Setup: Ruling: làm trực tiếp trên nhánh `main`, không tạo worktree — repo chưa có commit nào nên không tạo được worktree, D-10 cấm commit, và Duy yêu cầu ghi thẳng vào repo — nếu sai: không có git để quay lại; bù bằng việc chỉ thêm file mới (trừ CLAUDE.md, README.md) và sao lưu trước khi xoá 01–10.
- Setup: Ruling: dùng file này làm sổ tiến độ thay cho ledger ở `.superpowers/sdd/`, không chạy `task-start`/`task-done` — hai script cần commit (git rev-parse HEAD) — nếu sai: người thực thi khác phải đọc file này thay cho ledger mặc định.
- Setup: Ruling: "test" của các task tài liệu là hai script `check_blueprint.py`, `check_usecases.py`; riêng hai script này làm đúng TDD bằng bộ mẫu và file test chạy trước — nếu sai: script có thể lọt lỗi, bù bằng bước đọc soát của người và agent.
- Setup: Ruling: rà cuối cùng là một subagent mới đọc toàn bộ đầu ra đối chiếu spec và plan, thay cho review theo dải commit; bỏ `finishing-a-development-branch` vì không có nhánh và commit — nếu sai: không có diff git làm bằng chứng, chỉ có kết quả script và báo cáo rà.

## Rà giao diện giữa các task (pre-flight)

| Task tạo | Task dùng | Thứ được trao | Kết quả rà |
| --- | --- | --- | --- |
| 1 | 2–19 | Mã B-01…B-40; CLI `check_blueprint.py`, `assemble_blueprint.py` | Khớp |
| 2 | 3 | Dải A/Q/R của khai thác yêu cầu | Khớp; Task 3 dùng mã tạm rồi gộp |
| 3 | 4–8 | Sổ A/Q/R duy nhất | Khớp |
| 4 | 5, 8, 11 | Tên nhóm người dùng và mã vai trò ở §8 | Khớp |
| 5 | 9, 10, 11 | Bảng M, F, BR, BR-CMN | Khớp |
| 6 | 7, 8 | Mã WF ở §22 | Khớp |
| 7 | 8 | Mã cổng G ở §34 | Khớp; Phụ lục H ánh xạ câu hỏi sang cổng |
| 8 | 10, 12 | SCR ở Phụ lục K → `screens.json` | Khớp |
| 11 | 12 | Định dạng `_checklist.md`, README, bảng điểm bàn giao | Khớp; parser viết sau khi chốt định dạng |
| 12 | 13–18 | CLI `check_usecases.py` | Khớp |
| 13, 14 | 14, 15 | UC đã viết của module làm đầu vào cho đợt sau | Khớp |
| 16 | 17, 18 | `--strict-br` sau khi gộp BR | Khớp |

- Pre-flight: Ruling: `_chung/` có thêm `mau-uc.md`, `mau-checklist.md` ngoài 3 file spec §7.1 liệt kê — đây là phần mở rộng để 12 agent viết cùng một định dạng, không mâu thuẫn spec — nếu sai: thừa hai file.
- Pre-flight: Ruling: `E-FIELD` nhận nhãn có hoặc không có dấu hai chấm và in đậm, vì mẫu spec §7.3 dùng `**Tác nhân:**` còn bảng định danh dùng chữ thường — nếu sai: script bỏ sót nhãn viết lệch kiểu khác.

## Nhật ký task

- Task 1: Ruling: bộ mẫu kiểm tra được sinh trong `test_check_blueprint.py` (hàm `build()` rồi gây từng lỗi một) thay cho hai file tĩnh `sach.md`, `loi.md` — cùng độ phủ, mỗi mã lỗi có test riêng, không lệch khung mục khi sửa — nếu sai: không có.
- Task 1: complete (tests: `python SP/tools/test_check_blueprint.py` → 27/27 OK; `check_blueprint.py --file BP` → exit 2 "Không tìm thấy file", đúng kỳ vọng bước 7). Đã chép plan vào `docs/superpowers/plans/`, cập nhật spec (§3, §6.6, §8 bước 8), tạo bản chép brief B-01…B-40.
- Task 2: Ruling: áp skill `humanizer:humanizer` ngay trong lúc viết, không đợi tới Task 10/17 — Duy nhắc lại yêu cầu này ngày 29/09; bước soát văn ở Task 10/17 vẫn giữ làm lớp thứ hai; prompt của subagent kèm đường dẫn `C:/Users/Admin/.claude/plugins/cache/humanizer/humanizer/3.1.0/SKILL.md` — nếu sai: tốn thêm một ít thời gian viết.
- Task 2: Ruling: tài liệu giao nộp không dùng gạch dài (—, –), trừ khi trích nguyên văn brief; khoảng số viết "1 đến 4" hoặc "1-4"; tiêu đề dùng dấu hai chấm thay gạch dài; tiêu đề viết hoa kiểu câu, chỉ giữ chữ "PHẦN"/"PHỤ LỤC" in hoa cho cấu trúc — theo humanizer §8, §20 — nếu sai: lệch nhẹ kiểu chữ so với FDI Today.
- Task 2: Ruling: tiêu đề mở đầu "Brief gốc → Blueprint 1.0" đổi thành "Từ brief gốc đến Blueprint 1.0" (humanizer §20: không để mũi tên trong tiêu đề); đã sửa `check_blueprint.py` và test, 27/27 OK — nếu sai: chỉ khác tên tiêu đề.
- Task 2: complete (kiểm bằng script: 40/40 dòng B có trong bảng FR/NFR/BR; 30/30 Q có người trả lời; 15/15 A có người xác nhận; 12 R). File: `2026-09-29-kham-pha-yeu-cau.md`.
- Task 3: Ruling: bỏ agent `research-analyst` — Duy từ chối lệnh gọi và nói ngày 29/09 "mấy cái kế toán, FAST không quan trọng, quan trọng dữ liệu"; điểm pháp lý viết từ hiểu biết sẵn có, có số hiệu văn bản và câu "cần Kế toán trưởng xác nhận"; không tạo `kiem-chung-quy-dinh.md` — nếu sai: số hiệu hoặc hiệu lực văn bản có thể đã đổi, Kế toán trưởng sẽ phải soát.
- Task 3: Ruling: tích hợp FAST (nhóm 7 brief, M10) không làm trong MVP1 theo lời Duy; M09 khấu hao và M10 FAST đánh dấu GĐ2; MVP1 = GĐ1 — nếu sai: phải kéo lại phạm vi MVP.
- Task 3: Ruling: bộ UC chỉ viết cho module của MVP1; M09, M10 ghi vào README mục "Tính năng chưa viết UC (GĐ2)" — Duy yêu cầu làm nhanh và hai module này ngoài MVP1 — nếu sai: phải viết thêm UC cho M09, M10 khi Duy yêu cầu.
- Task 3: Ruling: `assumption-mapping` chạy nền trong lúc viết Phần I–VII, kết quả dùng ở Task 8 (Phụ lục G) — để không chặn tiến độ — nếu sai: không có.
- Task 3: Ruling: số liệu nền A-PM-01…04 (tỷ lệ, giờ, ngày tự ước) không đưa vào blueprint, chuyển thành câu hỏi Q-01 — tránh con số bịa về Every Half — nếu sai: blueprint thiếu con số minh hoạ cho KPI.
- Task 3: Ruling: lộ trình MVP1 lấy khung của project-manager (go-live khoảng tuần 17), thứ tự module lấy từ scrum-master, M12 audit làm từ sprint đầu vì mọi module ghi audit; bỏ M09, M10 khỏi lộ trình MVP1 — nếu sai: phải dựng lại lộ trình nếu Duy muốn gộp GĐ2.
- Task 3: Ruling: ngày phát hành blueprint và ngày tạo UC dùng 30/09/2026 (ngày thực tế khi viết), thay cho 29/09 trong spec — nếu sai: chỉ lệch ngày.
- Task 4: Ruling: `check_blueprint.py` chỉ tính số đứng riêng (bỏ "MVP1", "4G") và nhận "10.000.000đ" là tiền; số phiên bản chỉ còn dạng 1.0, 14.15 — sửa theo TDD, thêm 2 test, 29/29 OK — nếu sai: có thể lọt số dạng khác.
- Task 4: complete (`check_blueprint.py --upto II` → 0 lỗi, 0 cảnh báo; 3 file phần 00, 10, 20; hai gạch dài còn lại là trích nguyên văn brief).
- Task 5: complete (`check_blueprint.py --upto III` → 0 lỗi, 0 cảnh báo; 86 tính năng, 89 quy tắc gồm BR-CMN; 13 file phần 30-*). Mã mới cần định nghĩa ở phụ lục: Q-36 (điều kiện duyệt điều chuyển), Q-37 (ngưỡng duyệt chi phí sửa), D-01…D-07.
- Task 6: Ruling: từ khoá của W-NUM so nguyên từ ("kho" không khớp "khoảng"); thêm test, 30/30 OK — nếu sai: không có.
- Task 6: complete (`check_blueprint.py --upto V` → 0 lỗi, 0 cảnh báo; file 40-phan-4, 50-phan-5; WF-01…WF-16). Mã mới cần định nghĩa ở phụ lục: Q-38 (thời hạn lưu ảnh), Q-39 (RPO/RTO).
- Task 7: complete (`check_blueprint.py --upto VII` → 0 lỗi, 0 cảnh báo; file 60-phan-6-a/b/c, 70-phan-7; S01…S14, G0…G8).
- Task 8: toàn bộ blueprint `check_blueprint.py` → 0 lỗi, 0 cảnh báo, 34 file phần, 169 KB. Còn chờ: sắp Phụ lục G theo kết quả assumption-mapping (đang chạy lại nền). Định nghĩa đủ A-01…A-19, Q-01…Q-39, R-01…R-17, D-01…D-10, SCR-01…SCR-44.
- Task 9–11: Ruling: chạy agent phản biện (Task 9) ở nền, song song làm phần của Task 11 không phụ thuộc danh mục tính năng (mẫu UC, mẫu checklist, tác nhân, thuật ngữ) — Duy yêu cầu làm nhanh — nếu sai: mẫu phải sửa nếu phản biện đổi vai trò.
- Task 3: Ruling: assumption-mapping chạy nền bị dừng vì account cũ hết lượt (429); chạy lại ở Task 8, lỗi nữa thì tự xếp hạng — nếu sai: không có.
- Ghi chú kỹ thuật: Bash của phiên này bỏ bớt dấu `\` trong lệnh heredoc; script Python có dấu `\` phải viết bằng Write rồi chạy file, không nhúng vào lệnh Bash.
- Task 3: complete (3/4 agent chuyên môn đã ghi file, đủ tiêu đề bắt buộc; research bỏ theo Ruling; sổ `2026-09-29-so-dang-ky-a-q-r.md` gộp mã tạm, thêm A-16…A-19, Q-31…Q-35, R-13…R-17; assumption-mapping đang chạy nền, kiểm ở Task 8).
- Task 8: Ruling: Phụ lục G giữ nguyên câu chữ giả định đã định nghĩa, lấy thêm 4 cột xếp hạng từ `2026-09-29-xep-hang-gia-dinh.md`; ô "Cách xác nhận" của A-19 viết lại thành câu điều kiện ("nếu kick-off vào giữa tháng 10/2026 thì…") vì ngày kick-off chưa chốt — nếu sai: không có.
- Task 8: complete (`check_blueprint.py` toàn bộ → 0 lỗi, 0 cảnh báo; 34 file phần, 175 KB; Phụ lục G xếp 19 giả định theo ưu tiên, 5 giả định đầu: A-16, A-09, A-17, A-11, A-10).
- Task 11: Ruling: `_chung/tac-nhan.md` thêm 4 tác nhân ngoài danh sách của plan: "Người dùng EH-AM" (thao tác trên tài khoản của chính mình, mọi vai trò), "Người được mời" (chưa kích hoạt), "Dịch vụ xác thực" (Supabase Auth), "Đơn vị sửa chữa" (bên ngoài, không đăng nhập) — cần cho UC của M01, M06, M07 — nếu sai: phải đổi tác nhân trong các UC đó.
- Task 11: Ruling: `_chung/quy-tac-nghiep-vu.md` sinh bằng `SP/tools/gen_uc_chung.py` từ `brs.json`; phần "Quy tắc bổ sung từ bộ UC" (Task 16) được giữ khi sinh lại. Để có cột Nguồn, export `brs.json` thêm trường `source` (TDD: thêm assert, thấy fail, sửa, 30/30 OK) — nếu sai: không có.
- Task 12: Ruling: làm trước Task 9–11 trong lúc chờ agent phản biện, vì định dạng UC, checklist và README đã chốt ở `_chung/mau-uc.md`, `_chung/mau-checklist.md` — nếu sai: sửa parser khi README đổi định dạng.
- Task 12: Ruling: bộ mẫu sinh trong `test_check_usecases.py` (như Task 1) thay cho thư mục tĩnh `sample-uc/`; thêm 3 kiểm tra ngoài plan: `W-IF` (luồng chính có "nếu"), `E-INC` cho bảng điểm bàn giao, `E-FILE` khi tiền tố mã UC khác thư mục module; `--write-chung-hash` chỉ ghi hash rồi thoát — nếu sai: không có.
- Task 12: script và test xong (`python SP/tools/test_check_usecases.py` → 40/40 OK; trước khi có script: 38/40 fail). Còn bước 3 (chạy trên UCROOT thật) sau khi có README ở Task 11.
- Task 11: Ruling: README bộ UC sinh bằng `SP/tools/gen_uc_readme.py` (dữ liệu danh sách UC và điểm bàn giao nằm trong script); đổi danh sách thì sửa script rồi sinh lại. 75 UC cho 10 module; tên UC danh mục dùng "Cập nhật danh mục …" thay cho "Quản lý …" (skill cấm động từ chung chung); tác nhân "Người dùng EH-AM" đổi thành "Nhân viên có tài khoản" (skill cấm tác nhân "User") — nếu sai: đổi tên trong script và sinh lại.
- Task 11: Ruling: F-AST-10 gộp vào UC-AST-07, F-QR-05 vào UC-QR-04, F-AUD-03 vào UC-AUD-02 dưới dạng luồng thay thế; duyệt đề nghị thanh lý, xác nhận mất, khôi phục gộp thành UC-DSP-02; huỷ hồ sơ tạo sai tách hai UC (đề nghị, duyệt) vì BR-AST-06 cần người duyệt khác — nếu sai: tách hoặc gộp lại UC tương ứng.
- Task 12: complete (tests: `python SP/tools/test_check_usecases.py` → 40/40 OK; chạy trên UCROOT thật khi chưa có file UC → chỉ E-REG (75) và E-FEAT (71), đúng kỳ vọng bước 3).

- Yêu cầu mới của Duy ngày 30/09/2026: phần quản lý tài khoản nhân viên và phân quyền (M01) phải làm kỹ như FDI Today: các bước tạo tài khoản nhân viên trong một tenant và thông tin cần ở từng bước, hồ sơ nhân viên, sơ đồ tổ chức bộ máy theo cấp bậc. Không lấy 16 nhóm người dùng của FDI Today (EH-AM giữ 9 nhóm ở §8). Việc cần làm: agent khảo sát FDI Today ghi `2026-09-30-fdi-today-tai-khoan-nhan-vien.md`; sau đó sửa §14.1 (tính năng, quy tắc), §13, §17, Phụ lục B (trạng thái tài khoản), Phụ lục K (màn hình), Phụ lục F; lập lại danh sách UC của M01 trong `gen_uc_readme.py`; UC M01 viết theo bản mới.
- Task 10: Ruling: rà tự động dấu hiệu văn AI trên 34 file phần trước khi gọi ai-writing-auditor; chỉ sửa một câu mẫu "không chỉ…" ở `70-phan-7.md`; hai chỗ gạch dài còn lại là trích nguyên văn brief — nếu sai: không có.

## Dải mã đã dùng

| Loại | Dải | Ghi chú |
| --- | --- | --- |
| B | B-01…B-40 | Bản chép brief |
| A | A-01…A-15 | Khai thác yêu cầu (Task 2) |
| Q | Q-01…Q-30 | Khai thác yêu cầu (Task 2); cột cổng "chờ Task 7" |
| R | R-01…R-12 | Khai thác yêu cầu (Task 2) |

## Việc còn treo
