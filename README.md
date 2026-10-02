# EVERY HALF · Asset Management — Backend (`eh_am_backend`)

Hệ thống quản lý tài sản & công cụ dụng cụ (CCDC) cho chuỗi Every Half: cửa hàng, kho, xưởng rang, văn phòng. Đây là bản demo làm cho bài test năng lực vị trí **product builder**: mục tiêu là cho thấy **cách tôi nhận một ý tưởng thô từ founder rồi đưa nó thành đặc tả sản phẩm và code chạy được**, nên phạm vi dừng ở một lát cắt đủ sâu (module Hồ sơ tài sản M03), không làm hết mọi tính năng.

- **Bản demo:** <https://am.wecoloresoft.com> (dùng chung database Supabase môi trường dev).
- **Ngăn xếp:** NestJS 11 · TypeScript · Supabase (PostgreSQL + Auth + Storage) · Node.js 22.
- **Frontend:** [`eh_am_frontend`](../eh_am_frontend) — React 19 + Vite + TanStack, cổng 5175.
- **Chạy máy, lệnh, cấu trúc, điều bất biến:** xem [`DEVELOPMENT.md`](DEVELOPMENT.md).

> North Star của brief: *Quét bất kỳ tài sản hay CCDC nào là biết ngay nó là gì, đang ở đâu, ai quản lý, giá trị bao nhiêu và toàn bộ lịch sử của nó.*

Phần còn lại của README này nói về **cách tiếp cận**: đi từ ý tưởng của founder tới Master Blueprint, rồi từ blueprint tới bộ use case, rồi tới code. Mỗi bước nêu rõ đã dùng skill / agent của plugin nào và để làm gì.

---

## Cách tôi nhận và bóc tách yêu cầu

Đầu vào là một brief một trang của founder: tám nhóm chức năng, ba nguyên tắc, một North Star. Một brief như vậy chưa đủ để code: nó nói *muốn gì* chứ chưa nói *vì sao*, *ai làm*, *ngoại lệ ra sao*, *đo thành công bằng gì*. Việc đầu tiên là bóc tách yêu cầu theo tầng, tách phần mình biết chắc khỏi phần đang giả định, và ghi lại mọi câu hỏi cần founder trả lời. Toàn bộ quyết định thiết kế được chốt qua một spec trước khi viết blueprint, để không có con số hay quy tắc nào về Every Half do tôi tự bịa ra.

Quy trình chia ba chặng, mỗi chặng có bộ skill riêng và một bước kiểm chứng ở cuối.

---

## Chặng 1 — Từ ý tưởng của founder tới Master Blueprint

Kết quả: một file Master Blueprint duy nhất, [`business/product-docs/product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md`](business/product-docs/product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md) — viết Markdown thuần để dán sang Lark và xuất PDF.

| Bước | Skill / agent (plugin) | Để làm gì |
| --- | --- | --- |
| Làm rõ & thiết kế | `superpowers:brainstorming` | Chốt cách hiểu brief và hướng làm với founder; viết spec thiết kế trước khi đặt bút |
| Khai thác yêu cầu | skill `product-discovery` (ask-why-ba) | 5 tầng yêu cầu BABOK, bảng "biết / chưa biết", truy nguyên nhân gốc, liệt kê tình huống biên, giả định, câu hỏi mở |
| Lập kế hoạch | `superpowers:writing-plans` (chạy trong plan mode) | Kế hoạch từng bước, mỗi bước có cách kiểm chứng |
| Góc nhìn Product Manager | `voltagent-biz:product-manager` | Giá trị cho từng bên, North Star, ưu tiên MoSCoW, phạm vi MVP, phân kỳ GĐ1–GĐ3, KPI |
| Góc nhìn Project Manager | `voltagent-biz:project-manager` | Lộ trình theo tuần, cổng kiểm soát, RACI, RAID, chuyển đổi dữ liệu, go-live và hypercare |
| Góc nhìn Scrum Master | `voltagent-biz:scrum-master` | Nhịp sprint, cấu trúc backlog, Definition of Ready/Done, kế hoạch phát hành, nhịp UAT |
| Kiểm chứng pháp lý & tích hợp | `voltagent-research:research-analyst` | Quy định kế toán Việt Nam về TSCĐ và CCDC, luật bảo vệ dữ liệu cá nhân (GPS, ảnh), khả năng tích hợp của phần mềm kế toán FAST — mỗi khẳng định kèm số hiệu văn bản và nguồn |
| Xếp hạng giả định | `voltagent-biz:assumption-mapping` | Chọn ra giả định rủi ro nhất để founder xác nhận trước |
| Viết theo kế hoạch | `superpowers:executing-plans` | Thực thi đúng kế hoạch đã duyệt |
| Soát văn | `humanizer:humanizer`, rồi `voltagent-qa-sec:ai-writing-auditor` | Đưa về văn phong người viết senior, bỏ dấu hiệu văn máy |

Mỗi mã trong blueprint (tính năng, quy tắc nghiệp vụ, giả định, câu hỏi, màn hình) được định nghĩa đúng một lần và truy vết ngược được về dòng brief gốc, nên không mất yêu cầu và không có mã trỏ tới thứ không tồn tại.

---

## Chặng 2 — Từ Master Blueprint tới bộ Use Case

Kết quả: bộ use case cho từng tính năng của từng module, ở [`business/product-docs/product-usecase/`](business/product-docs/product-usecase/) (xem [`product-usecase/README.md`](business/product-docs/product-usecase/README.md) để có danh sách UC, điểm bàn giao giữa UC và ma trận truy vết).

| Bước | Skill / agent (plugin) | Để làm gì |
| --- | --- | --- |
| Lập kế hoạch | `superpowers:writing-plans` (plan mode) | Tách UC theo module, sắp theo thứ tự phụ thuộc |
| Chuẩn và khuôn UC | skill `use-case-writer` | Mẫu 13 trường, 4 quy tắc xác định phạm vi, coffee-break test, checklist 20 điểm cho mỗi UC |
| Viết từng module | `voltagent-biz:business-analyst` (mỗi module một agent, chạy song song) | Viết UC của module đó, tự chạy checklist 20 điểm |
| Viết theo kế hoạch | `superpowers:executing-plans` | Thực thi đúng kế hoạch đã duyệt |
| Rà khả năng kiểm thử | `voltagent-qa-sec:qa-expert` | Hậu điều kiện kiểm chứng được, ngoại lệ đủ để viết test case |
| Soát văn | `humanizer:humanizer`, rồi `voltagent-qa-sec:ai-writing-auditor` | Văn phong senior, không còn dấu hiệu văn máy |

UC dùng chung bộ quy ước ở [`product-usecase/_chung/`](business/product-docs/product-usecase/_chung/): mẫu UC, danh sách tác nhân, thuật ngữ, quy tắc nghiệp vụ. Nhờ đó tác nhân, tên màn hình và mã quy tắc trong mọi UC đều nhất quán.

---

## Chặng 3 — Từ Use Case tới code

Mỗi UC được chốt rồi mới có một thư mục kế hoạch kỹ thuật, song song hai repo:

- Backend: [`business/product-docs/product-implementation/<Mã UC>/`](business/product-docs/product-implementation/) — mô tả kỹ thuật, sơ đồ luồng/sequence/trạng thái, bảng + RPC + migration, guard/scope/audit áp dụng, kế hoạch test theo TDD.
- Frontend: `../eh_am_frontend/business/product-docs/product-implementation/<Mã UC>/` — `README.md` (kế hoạch) và `DESIGN-README.md` (wireframe vẽ trước khi code).

| Bước | Skill / agent (plugin) | Để làm gì |
| --- | --- | --- |
| Đọc UC | File UC tương ứng ở `product-usecase/` | Hiểu luồng chính, luồng thay thế, ngoại lệ, hậu điều kiện |
| Kế hoạch kỹ thuật | `ecc:plan`, rồi `ecc:tdd-workflow` | Technical plan: sơ đồ mermaid, UML data flow, bảng/RPC/migration |
| Viết code theo TDD | dev flow `ecc` + `superpowers:test-driven-development` | RED → GREEN → refactor; mỗi hàm có test đã thấy fail trước |
| Review | `ecc:typescript-reviewer`, `ecc:database-reviewer`, `ecc:security-reviewer` | Rà kiểu, truy vấn, biên bảo mật (phạm vi location, audit) khi chạm SQL/auth |
| Kiểm chứng cuối | `superpowers:verification-before-completion` | Chạy `tsc --noEmit`, `eslint`, test trước khi báo xong |

Module đã dựng theo lát cắt này là **M03 — Hồ sơ tài sản** (tạo, sửa mô tả, đổi người giữ, đổi vòng đời, tra cứu, xem chi tiết, đính kèm chứng từ, đề nghị và duyệt huỷ hồ sơ), đủ để thấy luồng maker-checker, audit "Trước/Sau", phân quyền theo location và mapper dữ liệu theo người xem. Các module còn lại nằm ngoài phạm vi bản demo.

---

## Tài liệu ở đâu (theo vai trò)

| Vai trò | Nội dung | Backend | Frontend |
| --- | --- | --- | --- |
| Product Manager / Product Owner | Tầm nhìn, giá trị từng bên, North Star, ưu tiên, phạm vi MVP, phân kỳ GĐ1–GĐ3, KPI | Master Blueprint: [`product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md`](business/product-docs/product-manager/EveryHalf_AM_Master_Blueprint_v1.0.md) | Thiết kế thương hiệu & design system: [`product-design/`](../eh_am_frontend/business/product-docs/product-design/) |
| Project Manager | Lộ trình theo tuần, cổng kiểm soát, RACI, RAID, chuyển đổi dữ liệu, go-live | Các phần lộ trình & quản trị trong Master Blueprint | Kế hoạch triển khai từng UC: [`product-implementation/`](../eh_am_frontend/business/product-docs/product-implementation/) |
| Business Analyst | Use case 13 trường, điểm bàn giao giữa UC, quy tắc nghiệp vụ, tác nhân, thuật ngữ | [`product-usecase/`](business/product-docs/product-usecase/) (+ `_chung/`) | — |
| Kỹ thuật (BE/FE) | Kế hoạch kỹ thuật từng UC | [`product-implementation/`](business/product-docs/product-implementation/) | [`product-implementation/<UC>/`](../eh_am_frontend/business/product-docs/product-implementation/) gồm `README.md` + `DESIGN-README.md` |

Toàn bộ tài liệu viết tiếng Việt (thuật ngữ kỹ thuật thông dụng như API, QR, cost center, audit giữ tiếng Anh); code và tên biến viết tiếng Anh, comment giải thích tiếng Việt.

---

## Phạm vi bản demo

Founder đã nói rõ: chỉ cần demo để thấy logic và cách làm, chưa cần xây đủ tính năng thực tế. Vì vậy bản này dừng ở hạ tầng (auth, phân quyền theo location, audit, lỗi + i18n, rate limit) và một module nghiệp vụ hoàn chỉnh (M03), chạy trên database Supabase dev. Phần hướng dẫn chạy và chi tiết kỹ thuật ở [`DEVELOPMENT.md`](DEVELOPMENT.md).
