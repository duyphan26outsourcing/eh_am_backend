# Góp ý mô hình giao hàng cho dự án EH-AM

| Mục | Nội dung |
| --- | --- |
| Ngày | 2026-09-29 |
| Người viết | Scrum Master cấp senior |
| Phạm vi | Mô hình giao hàng, nhịp sprint, cấu trúc backlog, DoR/DoD, kế hoạch phát hành, UAT, chỉ số, rủi ro |
| Căn cứ | Brief Every Half, kết quả khai thác yêu cầu, spec blueprint, CLAUDE.md (quy ước codebase) |

## 1. Mô hình giao hàng và vai trò trong đội

Đội triển khai gồm năm vị trí, phục vụ ba lợi ích chính: xây dựng tính năng (value), bảo đảm chất lượng (quality), quản lý dự án (delivery). Một cá nhân có thể giữ nhiều vai trò khi đội chưa đủ người, nhưng ranh giới giữa quyết định tính năng và quyết định kỹ thuật phải tách rời để tránh xung đột lợi ích.

**Vai trò và trách nhiệm chính**

PO/BA (Duy hiện tại) chịu trách nhiệm về scope, ưu tiên và value. Người này duy trì backlog, lồng ghép feedback từ Every Half vào story, chốt acceptance criteria, tham dự review và retro. Cấu trúc backlog 3 cấp (module → feature → UC → story) do PO quản lý; UC viết trước, story phát sinh từ UC. Khi PO quyết định ưu tiên module nào vào sprint nào, quyết định đó căn cứ trên phụ thuộc (ví dụ M01-M02 trước để có cơ sở cho M03+) và rủi ro (ví dụ M10 tích hợp FAST có rủi ro cao nên để GĐ2).

Backend developer (1-2 người) xây dựng data model, API, tích hợp ngoài (FAST, Supabase), audit log. Họ bảo đảm code qua tsc, eslint, test coverage, và follow quy ước trong CLAUDE.md (camelCase DTO, snake_case database, mapper tường minh cho từng quyền xem, không trả dữ liệu gốc từ database).

Frontend developer (1 người) xây dựng UI, web dashboard, app quét QR trên điện thoại. Họ yêu cầu API contract sớm và phối hợp với UX (ngoài đội) về màn hình.

QA (0.5 người, bán thời gian) viết test case từ UC, lập quy trình test từng module, chạy UAT với Every Half, ghi bug, theo dõi defect escape. QA cũng kiểm tra DoD trước khi story xin đóng.

Thiết kế UX (ngoài đội nhưng cần) tư vấn giao diện ứng dụng quét QR trên điện thoại, dashboard cho ban giám đốc. Dù ngoài đội nhưng phải vào sprint planning khi có story UI.

**Đại diện Every Half**

Dự án cần ít nhất ba đại diện từ Every Half để quyết định nhanh: Kế toán trưởng (khấu hao, FAST, cost center), Vận hành (location, điều chuyển, kiểm kê), Ban giám đốc hoặc đại diện (thanh lý, ngân sách, thời hạn). Nếu không có, lựa chọn mặc định phải được ghi rõ trong UC để tránh rework.

**Cách ra quyết định**

Quyết định về scope và tính năng do PO đề xuất, ba bên Every Half xác nhận (RACI: PO responsible, ba bên accountable). Quyết định kỹ thuật (kiến trúc, tech stack, performance threshold) do đội dev kiến nghị, PO approve để vẫn keep scope. Quyết định rủi ro (delay, scope cut, thay đổi thứ tự sprint) được escalate cho Duy (hay người cấp trên) nếu ảnh hưởng timeline hoặc budget. Retro mỗi sprint để review quyết định trước.

## 2. Nhịp sprint và nghi thức

**Độ dài sprint:** 2 tuần (10 ngày làm việc). Sprint 2 tuần phù hợp với dự án có phụ thuộc cao (ví dụ M03 chờ M01 xong) và cần feedback từ Every Half thường xuyên. Nếu đội có trải nghiệm sprint 1 tuần thành công với velocity ổn định, có thể rút xuống 1 tuần ở GĐ2 (kế toán, ít phụ thuộc).

**Nghi thức hàng sprint**

| Nghi thức | Khi | Ai | Mục tiêu |
| --- | --- | --- | --- |
| Sprint Planning | Thứ Hai 09:00 (2h) | Đội + PO + ba bên Every Half | Chốt story vào sprint, định mức velocity, xác nhận phụ thuộc |
| Daily standup | Mỗi ngày 09:30 (15 phút) | Đội dev + QA | Cập nhật: làm xong gì, hôm nay làm gì, blocker gì |
| Backlog refinement | Thứ Năm 14:00 (1.5h) | Đội + PO | Review UC tuần tới, làm rõ AC, xử lý TBD |
| Sprint Review | Thứ Sáu 15:00 (1h) | Đội + PO + **Vận hành + Kế toán** từ Every Half | Demo module xong, feedback vào backlog |
| Retro | Thứ Sáu 16:00 (1h) | Đội + PO | Ghi lại gì tốt, gì cần cải, action item cho sprint tới |

Every Half được mời tham dự Planning (xác nhận ưu tiên), Review (feedback vào UC), Retro tùy ý. Nếu đội remote, dùng Loom ghi demo, email review feedback, họp Zoom cho planning để tranh thủ. Không bao giờ bỏ Planning hoặc Review vì nó là điểm giao nhân của đội dev và khách hàng.

## 3. Cấu trúc backlog (module → tính năng → UC → story)

Backlog tổ chức thành 4 cấp, từ chiến lược xuống chi tiết thực thi. Mỗi cấp có mã và quy ước đặt tên để truy vết từ brief đến story.

**Cấp 1: Module (M01–M12)**

Mỗi module là một bộ chức năng độc lập, có giai đoạn (GĐ1, GĐ2, GĐ3), schema riêng, API riêng. Module được phân từ brief: M01 (IAM), M02 (danh mục), M03–M12 (vận hành và kế toán). Xem §6.2 của spec blueprint.

**Cấp 2: Tính năng (F-<MÃ>-nn)**

Mỗi feature là một khả năng đơn của module, nằm trong brief hoặc được đề xuất. Mã gồm ba bộ phận: `F-` (tính năng), `<MÃ>` (mã module, ví dụ AST, QR, TRF), `-nn` (số thứ tự hai chữ số). Ví dụ: `F-AST-01` (tạo hồ sơ tài sản), `F-QR-02` (tạo lại nhãn QR). Xem Phụ lục F của blueprint (truy vết brief → feature).

**Cấp 3: Use case (UC-<MÃ>-nn)**

Mỗi UC mô tả một chuỗi sự kiện từ mục tiêu người dùng đến kết quả. Mã UC giống feature, ví dụ `UC-AST-01`. Mỗi feature có 1–3 UC (ví dụ feature "tạo hồ sơ" có UC "tạo hồ sơ ban đầu" và UC "tạo từ import"). UC viết trước story ít nhất 1 sprint. Xem bộ UC trong `business/product-docs/product-usecase/`.

**Cấp 4: Story (không có prefix, mã ticket từ Jira/Linear)**

Mỗi story là một phần thực thi của một UC (hoặc một tính năng nhỏ), chạy 1–3 ngày, có AC rõ ràng, do một backend hoặc frontend phụ trách. Story có thể là:
- Backend: "API POST /assets tạo hồ sơ tài sản, kiểm phân quyền location, ghi audit"
- Frontend: "Màn hình tạo hồ sơ, nhập tên/loại/serial, upload ảnh"
- QA: "Viết test case cho UC-AST-01, cover 3 luồng thay thế và 5 ngoại lệ"

Story được PO tách từ UC khi planning, và lập ngay vào board (sprint backlog).

**Truy vết và tham chiếu chéo**

Mỗi brief dòng (B-nn) → được ánh xạ tới feature (F-nn) → feature gồm UC (UC-nn) → UC gồm story. Người viết UC tham chiếu ngược quy tắc nghiệp vụ (BR-nn) từ blueprint. Truy vết này được kiểm dòng dọc (bộ script Python rà chéo) để đảm bảo không có yêu cầu nào bị bỏ sót.

## 4. Definition of Ready

Story chuẩn bị để vào sprint phải thỏa mãn DoR ở ba cấp: story, module, bản phát hành. DoR được kiểm trước planning, để planning chỉ xác nhận prioritization, không chặn để làm rõ AC.

**DoR cấp story**

1. Từ UC: story này phục vụ một hoặc hai bước trong một UC, AC từ mô tả bước UC rõ ràng.
2. Không phụ thuộc: story này không chờ story khác (ngoại lệ: schema từ M01-M02 có thể chờ trước, nhưng schema đó phải xác nhận rồi).
3. Có test data: QA đã chuẩn bị dữ liệu test, không phải "chờ xây dựng fixture".
4. AC kiểm được: mỗi AC là một hành động + kết quả (không phải "code phải đẹp", mà "story.created_at phải là timestamp giờ server").
5. Không bé lẻ: story này kéo dài 1–3 ngày, nếu dưới 4 giờ thì gom vào story khác.

Dùng template story:
```
As a [vai trò], I want to [hành động], so that [lợi ích].

AC:
- Given [tiền điều kiện], When [hành động], Then [kết quả kiểm được].
- ...

Dependencies: [story khác nếu có]
```

**DoR cấp module**

1. Tất cả UC của module đã viết xong (ở bước 6 của thực thi spec blueprint).
2. Data model draft đã review chéo giữa backend và Kế toán (nếu có trường tiền tệ), đặc biệt M09 khấu hao phải duyệt từ Kế toán trưởng.
3. API contract (request/response shape) đã align giữa backend và frontend: nếu backend cần trả trang, frontend biết; nếu frontend cần sorting, backend khai trước.
4. Quy tắc audit của module đã xác nhận (ví dụ M03 lưu Ai-Khi-Gì-Trước/Sau-Lý do cho tất cả sửa đổi tài sản).
5. Kiểm soát quyền cho module đã xác nhận (ví dụ M03: nhân viên quản lý location A không thấy tài sản location B).

**DoR cấp bản phát hành (go-live)**

1. Tất cả feature/module của bản phát hành đã vào sprint và vào definition of done (xem mục 5).
2. Chạy bộ test E2E đầy đủ (luồng chính của mỗi module) trên staging, 100% pass.
3. Dữ liệu nền (location, cost center, loại tài sản, nhà cung cấp, nhân viên) đã được load sạch vào database, gồm số liệu từ FAST nếu bản phát hành là GĐ2.
4. Training content cho nhân viên (video + tài liệu) đã chuẩn bị cho vòng thử ở 1-2 cửa hàng.
5. Rollback script đã chạy thành công trên staging (restore data từ backup trước go-live, không cần rollback code).

## 5. Definition of Done (story, module, bản phát hành)

DoD kiểm toàn bộ quy trình chất lượng từ code đến hành vi trên production.

**DoD cấp story**

1. **Code và kiểu**: 
   - Backend: `npm run format && npx tsc --noEmit && npx eslint src test && npm test` không lỗi (từ CLAUDE.md).
   - Frontend: tương tự, ngoài cộng Vite type check.
   - Không có `TODO` hoặc `FIXME` không ghi ngày hết hạn.

2. **Review**:
   - Ít nhất 1 dev khác approve PR (code review).
   - Nếu logic bảo mật (phân quyền, audit), backend lead approve.

3. **Test**:
   - Unit test: line coverage ≥ 80% cho logic mới.
   - Contract test: nếu endpoint API mới, contract test xanh (sử dụng `npm run test:e2e -- auth-contract` làm template).
   - QA test case từ UC: ít nhất luồng chính + 2 ngoại lệ đã test trên staging, ghi kết quả.

4. **Audit**:
   - Nếu thay đổi dữ liệu (tài sản, quyền, hoá đơn): dòng audit lưu Ai-Khi-Gì-Trước/Sau-Lý do (xem `AuditService.recordOrThrow()` ở CLAUDE.md).
   - Dòng audit không chứa token, URL ký, toạ độ GPS chi tiết (xem BC mục "Audit").

5. **i18n**:
   - UI text (button, error, message) lấy từ `message-code.const.ts` (tiếng Việt mặc định, tiếng Anh).
   - Frontend render đúng locale từ user profile (`preferred_locale`).
   - Nếu có dòng cứng (hardcoded), ghi lý do vào PR description.

6. **Documentation**:
   - Comment đầu file giải thích mục đích (nếu file mới).
   - Quy tắc xung đột (ví dụ "không được xóa lịch sử") được comment ở hàm có logic.
   - API mới được update vào API doc (có thể là Swagger comment hoặc file `.md`).

**DoD cấp module**

1. **Tất cả story done** (14 điều trên).

2. **E2E flow**:
   - Chạy e2e test đầy đủ luồng chính từ đầu đến cuối (ví dụ M03: create asset → view asset → generate QR → view history).
   - Pass 100% trên staging (database thật hoặc test data setup trong test).

3. **Performance**:
   - API response time trung bình < 500 ms trên mạng 4G mô phỏng (từ desktop throttle), P95 < 2s.
   - Query database không có N+1, tồi tệ nhất là dùng `select(..., {count: 'exact'})` một lần cho pagination.

4. **UAT**:
   - Demo với Vận hành (nếu M03-M06-M07-M08) hoặc Kế toán (nếu M09-M10): feedback ghi vào backlog, prioritize cho sprint tới.
   - Nếu feedback là "không vừa khả năng", ghi lại làm feature của GĐ3, không block module này.

5. **Rollback**:
   - Tạo bản backup dữ liệu trước khi deploy (migration không tự rollback, nên script backup cần check).
   - Ghi bước rollback schema (nếu có) trong document go-live.

6. **Documentation**:
   - README của module: ghi mục tiêu, quy tắc, ranh giới, API endpoint chính.
   - Bảng mã trạng thái (nếu có state machine): ví dụ M06 transfer có "Pending" → "InTransit" → "Received" (xem Phụ lục B blueprint).

**DoD cấp bản phát hành**

1. **Tất cả module done** (6 điều trên).

2. **Smoke test full**:
   - Chạy kịch bản end-to-end: user login → tạo tài sản → kiểm kê → điều chuyển → sửa → view history (nếu GĐ1) cộng khấu hao + sync FAST (nếu GĐ2).
   - Lập bộ test script có thể chạy tay trong 30 phút.

3. **Data migration**:
   - Nếu bản phát hành có schema thay đổi, migration script đã chạy trên staging data (copy từ production backup), không có loss.
   - Nếu load dữ liệu từ FAST (GĐ2): kiểm khớp số lượng tài sản và tổng giá trị trước/sau, log sự khác biệt.

4. **Deployment**:
   - Script deploy (Docker build, migration, env setup) chạy trên staging → production, ghi log step by step.
   - Database backup trước deploy, có restore procedure.
   - Feature flag (nếu có) kiểm được bật/tắt mà không redeploy.

5. **Go-live readiness**:
   - Dữ liệu nền: location, cost center, loại tài sản, nhà cung cấp, đơn vị sửa tất cả có sẵn.
   - Tài khoản nhân viên: danh sách email/số điện thoại từ HR, tài khoản được tạo (hoặc user self-register được mở), vai trò được gán.
   - Nhãn QR: nếu bản phát hành có chứa M04 (QR), nhãn in sẵn cho tất cả tài sản cần quản lý (hoặc có rota in).
   - Training: video hướng dẫn quét, dashboard, thống kê tài sản đã được xem, nhân viên confirm hiểu.

6. **Monitoring**:
   - Alert trên production: error rate > 1%, response time P95 > 5s, database disk > 80%.
   - Log aggregation (xem cộng vào CLAUDE.md): nếu có lỗi, trace từ request ID nhanh.
   - Hypercare 1 tuần: team on-call, sẵn sàng hotfix, monitor tổng lệnh sửa từ mỗi location.

## 6. Kế hoạch phát hành theo sprint

Kế hoạch phân 14 sprint (28 tuần), dựa trên giả định A-11 (đội 3.5 người: 1 PO, 1-2 backend, 1 frontend, 0.5 QA), sprint 2 tuần. Mỗi sprint mục tiêu khoảng 7-8 UC hoặc 15-18 point story. Mục tiêu này sẽ được hiệu chỉnh sau sprint 1-2 nếu velocity thực tế khác.

Phụ thuộc chính:
- M01 (IAM) + M02 (danh mục) phải xong trước M03+ (có schema cơ bản, quyền cơ bản).
- M03 (asset profile) + M04 (QR) phải xong trước M05+ (kiểm kê dùng QR).
- M03-M08 + M12 (vận hành + audit) làm xong trước M09-M10 (kế toán có dữ liệu vật lý).
- M10 (FAST sync) nên để GĐ2 (rủi ro cao, chờ Q-04).

Giai đoạn dụ ý:
- **GĐ1 (vận hành)**: M01, M02, M03, M04, M05, M06, M07, M08, M12 (sprint 1-11, tuần 1-22).
- **GĐ2 (kế toán)**: M09, M10 (sprint 9-10 song song M05-M06, nhưng go-live sau M08+M12 xong, sprint 12-13).
- **GĐ3 (tối ưu)**: feature tối ưu, báo cáo nâng cao (sprint 14+, không nằm trong bản phát hành đầu).

| Sprint | Tuần | Module | Mục tiêu | Milestone |
| --- | --- | --- | --- | --- |
| 1 | 1-2 | Setup, M01, M02 | Setup CI/CD, schema user/role/location/cost center, API user, assign role | Dev environment sẵn sàng |
| 2 | 3-4 | M01, M02 | API permission, multi-tenant by location, danh mục cơ bản (asset type, supplier, repair vendor) | Cổng G1 chốt chế độ quyền |
| 3 | 5-6 | M03, M04 | Asset profile schema, API create/view asset, QR generation (thư viện, không in chưa) | Backend asset API xanh |
| 4 | 7-8 | M03, M04, M05 | Frontend asset form, QR display, inventory planning | Frontend asset form xanh, QA test case UC-AST-01 etc |
| 5 | 9-10 | M05, M04 | Scan QR on mobile, inventory log, mark found/lost/damaged, submit | Demo quét mobile ở cửa hàng test |
| 6 | 11-12 | M06 | Transfer order creation, QR scan confirm receipt, transfer history | Transfer flow xanh |
| 7 | 13-14 | M06, M07 | Ngoài lệ transfer (receive fewer, receive damaged), maintenance request | Cổng G2 demo transfer + maintenance |
| 8 | 15-16 | M07, M08 | Maintenance history, repair log, update asset status during repair, disposal approval flow | M07 M08 flow xanh |
| 9 | 17-18 | M09 | Depreciation calculation logic, monthly depreciation, cumulative depreciation, remaining value | Depreciation logic rã chéo với Kế toán |
| 10 | 19-20 | M10 | FAST API client, mapping Asset ID ↔ FAST code, two-way sync nguyên giá/phân loại/cost center, error handling | FAST integration test, kiểm khớp dữ liệu |
| 11 | 21-22 | M11, M12 | Dashboard (summary, by location, depreciation, missing assets, reconcile vs FAST), audit log viewer, notification job | Dashboard xanh, Cổng G3 demo GĐ1+GĐ2 |
| 12 | 23-24 | UAT, fix | UAT đầy đủ tất cả module ở vài cửa hàng, ghi bug, fix hot issue | UAT pass >80%, pilot 1-2 cửa hàng |
| 13 | 25-26 | Dán nhãn, data load | In + dán nhãn hàng loạt cho tất cả tài sản, load dữ liệu từ FAST | Dữ liệu nền sạch, go-live readiness |
| 14 | 27-28 | Go-live, hypercare | Go-live từng khu vực, monitor log/error, hotfix | Production green light |

Mốc kiểm soát (cổng):
- **G0 (tuần 0, trước sprint 1)**: Duy chốt scope blueprint, ba bên Every Half ký vào, đội dev nắm kiến trúc.
- **G1 (tuần 2, sprint 2 end)**: Chế độ quyền, schema nền khớp brief, không thay đổi sau đây.
- **G2 (tuần 14, sprint 7 end)**: GĐ1 core flow (asset, transfer, maintenance) xanh trên staging.
- **G3 (tuần 22, sprint 11 end)**: GĐ1+GĐ2 xanh, UAT pass với mỗi stakeholder, ready go-live.

## 7. Nhịp UAT với Every Half

UAT là vòng phản hồi của khách hàng vào quy trình phát triển. Mục tiêu của UAT ở đây không phải "kiểm tra mọi chức năng", mà "xác nhận yêu cầu được hiểu đúng" và "tìm out case". Nếu dự án thất bại ở lúc go-live vì hiểu sai yêu cầu, thì UAT không có giá trị.

**Nhịp demo và feedback hàng sprint**

Vào Review mỗi sprint (thứ Sáu 15:00), đội demo module vừa xong (hoặc phần xong của module). Mời:
- Vận hành (M03-M08): quản lý cửa hàng, thủ kho, quản lý roastery đại diện.
- Kế toán (M09-M10): Kế toán trưởng, kế toán tài sản.
- Ban giám đốc (M08 thanh lý, M11 dashboard): đại diện quản trị.

Feedback được ghi vào backlog bằng mã Q-SM-nn (nếu cần mở UC mới) hoặc vào story xin làm lại. Mục tiêu: không để feedback chất đen hàng loạt cuối dự án.

**Vòng UAT tập trung ở sprint 12**

Khi GĐ1 + GĐ2 xong (sprint 11 end, tuần 22), đội mời 1-2 cửa hàng chạy thử ở độc lập (pilot). Mỗi cửa hàng được gán:
- 2-3 nhân viên quét (barista + quản lý) → test M03-M04-M05 scan, report result.
- Thủ kho → test M06 transfer, confirm receipt.
- Kế toán cửa hàng → test xem dashboard, kiểm tài sản.
- IT cửa hàng (nếu có) → kiểm kết nối mạng, backup.

Mỗi ngày, team dev họp với pilot (15 phút): ghi vấn đề, do dev fix ngay hoặc ghi vào backlog sprint 13. Nếu vấn đề dừng được test (ví dụ app quét crash khi quét liên tục), fix trong 1-2 giờ. Nếu vấn đề nhỏ (ví dụ button label không rõ), ghi fix cho sprint 13 hoặc go-live.

Kết quả pilot được tóm tắt: "Tổng 50 tài sản quét, 48 thành công, 1 crash (ghi bug SR-123), 1 timeout (ghi rủi ro R-SM-06)." Milestone: pass >95% (tối thiểu go-live với known issue được theo dõi).

**Vòng UAT chính ở sprint 13-14**

Khi go-live đến, team on-call (1 dev, 1 QA) ở trong văn phòng hoặc ready video call. Mỗi vấn đề ghi severity:
- Critical: dừng được sử dụng (ví dụ không login được, asset data mất) → fix ngay (<30 phút) hoặc rollback.
- High: làm lỗi quy trình (ví dụ transfer không ghi audit) → fix trong 2-4 giờ.
- Medium: không lỡ chức năng nhưng khó dùng (ví dụ scan chậm, UI lẩn thẩn) → ghi vào sprint tới.
- Low: cosmetic (ví dụ typo, màu sắc) → ghi vào backlog GĐ3.

Bắt đầu go-live từ khu vực nhỏ (ví dụ 1 cửa hàng, 100 tài sản) để kiểm, rồi mở rộng. Mỗi khu vực cần 3-5 ngày để đảm bảo ổn định.

## 8. Chỉ số giao hàng

Đội theo dõi các chỉ số này hàng sprint. Chỉ số nào lụt so với mục tiêu, team tìm cách cải.

**Chỉ số velocity**

| Chỉ số | Cách đo | Mục tiêu | Hành động nếu lụt |
| --- | --- | --- | --- |
| Sprint velocity | Story point hoàn thành / sprint | 15-18 point/sprint | Xem có blocker hay scope quá lớn, không làm lại estimate |
| Stability | Max velocity / min velocity ở 5 sprint gần nhất | < 1.5× | Nếu swing cao, kiểm scope có nhập ngoài sprint mid-sprint |
| Sprint goal achieved | % feature target hoàn thành | 100% | Xem phụ thuộc, nếu <90%, kiểm phụ thuộc A-SM-04 |

**Chỉ số chất lượng**

| Chỉ số | Cách đo | Mục tiêu | Hành động nếu lụt |
| --- | --- | --- | --- |
| Defect escape rate | Bug found sau go-live / tổng story ở bản phát hành | <5% | Tăng test coverage, kiểm UC ngoại lệ đầy đủ |
| Test coverage | Line coverage từ jest | ≥80% | Backend phải cover logic chính (ít nhất happy path + 1 sad path) |
| Code review turnaround | Giờ từ khi push đến approved | <24h | Tăng review mục tiêu, không để PR lơ lửng |
| Rework rate | Story quay lại rework / tổng story ở sprint | <10% | Xem AC không rõ hay scope thay đổi mid-sprint |

**Chỉ số delivery**

| Chỉ số | Cách đo | Mục tiêu | Hành động nếu lụt |
| --- | --- | --- | --- |
| On-time delivery | Sprint hoàn thành đúng ngày kết thúc sprint | 100% (hoặc 4/5 sprint cuối) | Sprint bị delay: phát hiện blocker sớm (daily standup), nếu không được, cut scope (PO quyết định) |
| Scope creep | Story thêm vào sau sprint day 3 | <1/sprint | PO kiểm đề xuất scope mới, nếu cần thêm, vào sprint sau |
| UAT pass rate | Story pass UAT khi chạy test case | 100% | Tìm yếu điểm trong UC hay AC, update UC cho sprint tới |

**Chỉ số vận hành (GĐ1/GĐ2 production)**

Sau go-live, theo dõi:
- Error rate ở Sentry: <0.1% (lỗi 500) hoặc <1% (lỗi 4xx do user).
- Response time P95 trên production: <2s ở 4G real, <500ms ở broadband.
- Defect reported từ Every Half: <10/tuần (nếu many, tăng monitoring scope).
- FAST sync success rate: >99% (sync lỗi được retry tự động, log để debug).

**Chỉ số team**

| Chỉ số | Cách đo | Mục tiêu | Hành động nếu lụt |
| --- | --- | --- | --- |
| Sprint retro action item | % action từ retro trước đã thực hiện | 100% | Ghi action rõ ràng (ai, bao giờ), PO/lead kiểm retro đầu sprint |
| Blocker turnaround | Ngày từ khi ghi blocker đến khi resolve | <2 ngày | Daily standup focus trên blocker, escalate nếu cần |
| Attendance | % người tham dự nghi thức | 100% | Nếu ai vắng thường xuyên, talk 1-1 để hiểu lý do |

## 9. Rủi ro giao hàng

Rủi ro ở đây là những sự kiện có thể làm delay, scale cut hoặc quality drop. Mỗi rủi ro ghi khả năng, ảnh hưởng, cách chặn, và thái độ chủ động (không chờ xảy ra).

| Mã | Rủi ro | Khả năng | Ảnh hưởng | Cách chặn | Thái độ |
| --- | --- | --- | --- | --- | --- |
| R-SM-01 | Bản FAST chưa xác định, API không mở → tích hợp FAST chậm, hoặc không thể tích hợp | Cao | Cao | Task 7 (Q-04) phải có trả lời tuần 1. Nếu không có API, sprint 9 thiết kế file import/export. Cổng G2 chốt cách tích hợp trước làm code | Theo dõi từ tuần 1, không chờ đến sprint 9 |
| R-SM-02 | Đội phát hiện chế độ phân quyền sai khi code, phải quay lại thay schema → tuần mất 2-3 tuần | Trung bình | Cao | Cổng G1 (sprint 2) phải chốt chế độ quyền (location-based, role-based, ai thấy giá trị) từ blueprint, Q-16 phải trả lời. Nếu đổi sau G1, delay sprint 2 tuần | Retro mỗi sprint kiểm có thay đổi yêu cầu quyền không |
| R-SM-03 | Nhãn QR bong hoặc mờ khi in/dán, phải in lại, delay go-live | Cao | Trung bình | Chọn nhãn loại chịu nhiệt, ẩm, in mẫu thử tuần 1 (ở Q-22). Quy trình in lại có ghi: mã tài sản, thời gian, lý do. Sprint 13 allocate 3 ngày riêng cho in + dán (không gộp chung sprint việc khác) | Kiểm mẫu nhãn tuần 1, test ở môi trường bar nếu tài sản bar |
| R-SM-04 | Dữ liệu ban đầu không sạch (serial trùng, giá trị sai, vị trí mơ hồ) → load không xong, hoặc load xong nhưng data lệch | Cao | Cao | Sprint 12: team làm sạch dữ liệu từ Excel/FAST. Kiểm trùng lặp (serial, asset ID). Match vị trị vs location master. Ghi audit "DATA_LOAD_FROM_<SOURCE>". Sprint 13: chạy script kiểm khớp với FAST (nếu GĐ2). Đôi chiếu thủ công với Kế toán trưởng | Tuần 22 (sprint 12 end) phải có báo cáo "dữ liệu sạch Y%, dữ liệu bỏ Z%" |
| R-SM-05 | Người duyệt (thanh lý, điều chuyển, tiếp nhận sửa) vắng mặt, yêu cầu treo → quy trình bị khóa | Trung bình | Thấp | Uỷ quyền duyệt: định nghĩa trong sprint 6 khi viết approval flow UC. Thời hạn uỷ quyền < 5 ngày (ví dụ PO uỷ quyền cho QA duyệt trong lúc PO nghỉ). Cảnh báo quá hạn gửi Email. Escalate tự động (đề nghị auto-approve hoặc gửi cấp trên cùng) nếu quá 10 ngày | Tài liệu quy trình uỷ quyền tuần 11, training tuần 24 |
| R-SM-06 | Mạng kém ở kho/quầy bar → quét QR timeout hoặc mất lượt, ghi trùng hoặc mất | Trung bình | Trung bình | NFR-05 (CLAUDE.md) đảm bảo hàng đợi + deduplication. Test quét ở mạng giới hạn (khoảng 0.5 Mbps) ở sprint 5. Notification email/SMS nếu upload failed để nhân viên retry | Sprint 5 test trên 4G yếu, sprint 12 pilot quét ở quầy bar đông khách |
| R-SM-07 | Công khai làm rò giá trị tài sản hoặc tài sản location khác (lỗi phân quyền) → risk tuân thủ, mất tin tưởng | Trung bình | Cao | NFR-01 (phân quyền ở server, không tin client). Mặc định từ chối. Kiểm quyền định kỳ (sprint 11 + sprint 13). Pháp chế rà: GPD, dữ liệu cá nhân, bảo mật từ bài 7 khai thác yêu cầu. Không bao giờ log giá trị trong error message | Cổng G0: pháp chế sign off đặc tả bảo mật, cấp access data để test |

Kế hoạch theo dõi rủi ro:
- Retro mỗi sprint: ghi rủi ro nào đang diễn ra (ví dụ R-SM-01 đang chờ Q-04 trả lời).
- Backlog grooming: cọi rủi ro đã thành sự kiện (ví dụ R-SM-03 nhãn bong → ghi task in lại).
- Go-live readiness (sprint 13): checklist rủi ro, mỗi rủi ro có mitigation.

---

### Mã tạm được tạo trong tài liệu này

| Mã | Loại | Nội dung |
| --- | --- | --- |
| A-SM-01 | Giả định | Quy mô đội sẽ là 1 PO, 1-2 backend, 1 frontend, 0.5 QA trong suốt dự án. Nếu tuyển thêm, tối ưu sequence song song |
| Q-SM-01 | Câu hỏi | Đội mong muốn sprint dài 1 hay 2 tuần? (2 tuần phù hợp GĐ1, 1 tuần ở GĐ2) |
| Q-SM-02 | Câu hỏi | Cải thiện nào cần cho nghi thức mỗi sprint (ví dụ dưới 2h planning có được không)? |
| Q-SM-03 | Câu hỏi | Ai là người duyệt thay cho PO nếu PO vắng? Ai là người escalate duyệt thanh lý nếu cấp 1 vắng? |
| Q-SM-04 | Câu hỏi | Liệu team có thể co-locate (ngồi chung văn phòng) ít nhất 2 ngày/tuần hay toàn remote? |
| Q-SM-05 | Câu hỏi | Nếu UAT fail (>20% bug), có cut scope để on-time go-live hay delay để fix? |
| R-SM-01 | Rủi ro | Tích hợp FAST phụ thuộc cao vào bản FAST, API, chính sách kế toán. Nếu chậm, delay GĐ2 |
| R-SM-02 | Rủi ro | Schema phân quyền bị sửa lại khi code (chế độ quyền sai). Cần chốt cổng G1 tuần 2 |
| R-SM-03 | Rủi ro | Nhãn QR không chịu được nhiệt, ẩm ở quầy. Phải chọn nhãn đúng loại |
| R-SM-04 | Rủi ro | Dữ liệu ban đầu từ FAST hoặc Excel không sạch. Phải làm sạch sprint 12 |
| R-SM-05 | Rủi ro | Người duyệt vắng, yêu cầu treo. Cần uỷ quyền có thời hạn |
| R-SM-06 | Rủi ro | Mạng kém ở cửa hàng/kho làm timeout quét. Cần queue + dedup, test sớm |
| R-SM-07 | Rủi ro | Lỗi phân quyền làm lộ giá trị/tài sản. Cần server-side check + pháp chế rà |
