# Phần mới: nhận diện thương hiệu, frontend design system, kế hoạch kỹ thuật và triển khai

Duy giao ngày 30/09/2026, sau khi bộ Master Blueprint và 83 use case của MVP1 hoàn tất. Đây là bản ghi để không quên quy trình và bộ skill bắt buộc. Đọc file này trước khi làm tiếp phần mới.

## Quy ước đường dẫn

- `BE` = `c:\Users\Admin\development\everyhalf\eh_am_backend`
- `FE` = `c:\Users\Admin\development\everyhalf\eh_am_frontend`
- Bộ UC nguồn: `BE\business\product-docs\product-usecase\` (83 UC, 10 module GĐ1).

## Yêu cầu 0: Nhận diện thương hiệu và cảm hứng layout

Phân tích `https://www.everyhalf.vn/` và một trang Larksuite (ví dụ `https://ssgwqee1lorp.sg.larksuite.com/drive/home/`) để:
- Từ everyhalf.vn: rút bộ nhận diện thương hiệu: logo, bộ màu (design token), design system, border, shadow, underline, text style, font chữ (typography), hover style, accessibility.
- Từ Larksuite: lấy cảm hứng layout, wireframe cho các tính năng của platform quản lý tài sản.
- Kết quả: file tài liệu nhận diện thương hiệu, làm ánh xạ hỗ trợ Yêu cầu 1.

Ghi tài liệu vào `FE\business\product-docs\product-design\` (ví dụ `00-brand-identity-everyhalf.md`).

Công cụ: `WebFetch` + MCP `chrome-devtools` của plugin ecc (navigate, take_screenshot, get_css_styles, take_snapshot) để lấy màu, font, computed style thật.

## Yêu cầu 1: Frontend codebase (design token, design system, common component)

Làm một lượt trọn vẹn. Xây trong repo `FE`: design token, design system, các common component (đủ cho mọi tính năng UC đã định nghĩa, có style UI CSS). Responsive cho cả mobile, thân thiện PWA (progressive web app).

Ghi tài liệu design token, design system, common component vào `FE\business\product-docs\product-design\`.

Bộ skill bắt buộc (Duy chỉ định):
- `taste-skill@taste-skill` (các skill: `taste-skill:taste-skill`, `brandkit`, `redesign-skill`, `image-to-code-skill`, `imagegen-frontend-web`, `imagegen-frontend-mobile`, `minimalist-skill`, `soft-skill`…)
- `ui-ux-pro-max@ui-ux-pro-max-skill` (`ui-ux-pro-max:design-system`, `design`, `ui-styling`, `brand`, `ui-ux-pro-max`)
- `core-skills@hyperframes` và `hyperframes@hyperframes` (motion, video, animation)
- `impeccable@impeccable` (`impeccable:impeccable`)
- `gsap-skills@gsap-skills` (`gsap-core`, `gsap-react`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance`…)
- Claude design (skill `frontend-design` của example-skills; `artifact-design` khi làm mẫu)
- Được thêm skill khác nếu xịn hơn; tránh nhồi nhiều gây loạn.

Ràng buộc kỹ thuật FE (từ CLAUDE.md): Vite, React 19, TanStack Router/Query/Table, Radix/shadcn, Tailwind 4, i18next, axios, Vitest; cổng dev 5175.

## Yêu cầu 2: Kế hoạch kỹ thuật cho từng UC (backend và frontend), rồi triển khai

Với mỗi mã UC, tạo một thư mục trong cả hai repo:
- `BE\business\product-docs\product-implementation\<Mã UC>\`
- `FE\business\product-docs\product-implementation\<Mã UC>\`

Trong thư mục đó soạn technical implementation plan:
- Backend: đọc file UC tương ứng ở product-usecase, dùng skill ecc `/ecc:plan "describe the feature"` rồi `tdd-workflow` để soạn file technical implementation plan (có sơ đồ mermaid, mô tả technical, UML data flow, kỹ thuật backend liên quan).
- Frontend: tương tự, nhưng chỉ cần mô tả tính năng phía frontend.

Bộ skill bắt buộc: plugin `ecc@ecc` (skill `/ecc:plan`, `ecc:tdd-workflow`, và các skill dev của ecc) cộng các dev skill của Claude. Duy dặn: đủ xịn rồi, đừng nhồi nhiều skill, tránh over-engineering.

## Yêu cầu 3: Nhịp làm việc

- Yêu cầu 1: làm một lượt cho xong.
- Yêu cầu 2: step by step. Xong plan kỹ thuật của UC thứ nhất thì triển khai code UC đó theo dev flow của ecc: `implement -> review -> verify -> remember -> improve`. Code xong Duy manual test và xác nhận ổn thì mới sang UC thứ hai (viết plan rồi code), cứ thế.
- Không tự nhảy sang UC kế tiếp khi Duy chưa xác nhận UC hiện tại.

## Thứ tự đề xuất (chờ Duy chốt)

1. Yêu cầu 0 (nhận diện thương hiệu) trước, vì Yêu cầu 1 cần nó.
2. Yêu cầu 1 (frontend design system) một lượt.
3. Yêu cầu 2: chọn UC đầu tiên để làm mẫu (đề xuất UC-IAM-01 đăng nhập, vì mọi UC khác phụ thuộc đăng nhập và code auth đã có sẵn).

## Ghi chú môi trường

- Hook GateGuard (plugin ecc) yêu cầu nêu facts trước lệnh Bash đầu tiên và trước Edit/Write lần đầu mỗi file. Tắt hẳn bằng `ECC_GATEGUARD=off` hoặc `ECC_DISABLED_HOOKS=pre:bash:gateguard-fact-force,pre:edit-write:gateguard-fact-force`; hoặc thêm glob tài liệu vào `GATEGUARD_EXEMPT_GLOBS`; hoặc nêu facts mỗi lần (facts của file tài liệu thường rất ngắn).
- MCP chrome-devtools của ecc đã sẵn (các tool `mcp__plugin_ecc_chrome-devtools__*`), nạp schema bằng ToolSearch trước khi gọi.
- Cần thêm hai bảng "Skill bắt buộc" cho phần frontend-design và product-implementation vào `CLAUDE.md` của cả hai repo (yêu cầu 4).
