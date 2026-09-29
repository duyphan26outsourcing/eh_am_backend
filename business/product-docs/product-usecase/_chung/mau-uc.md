# Mẫu use case EH-AM

Mẫu 13 trường của skill `use-case-writer` (Karl Wiegers, IIBA), viết bằng tiếng Việt. Chép khối dưới đây cho mỗi UC, thay phần trong ngoặc nhọn.

Quy ước bắt buộc:

- Tên file: `<Mã UC>_<ten-uc-khong-dau>.md`, ví dụ `UC-AST-01_tao-ho-so-tai-san.md`.
- Tiêu đề cấp 1: `# <Mã UC>: <Tên UC>`.
- Tên UC dạng động từ cộng đối tượng, ba đến bảy từ.
- Tác nhân chỉ lấy từ `tac-nhan.md`; quy tắc nghiệp vụ tham chiếu theo mã trong `quy-tac-nghiep-vu.md`; tên màn hình lấy đúng Phụ lục K của blueprint và viết `màn hình **<Tên màn hình>**`.
- "Tần suất sử dụng" gắn mã giả định `A-nn` của blueprint hoặc `[TBD-n]`; không tự đặt con số về Every Half.
- Luồng chính không có "nếu"; rẽ nhánh đưa vào luồng thay thế hoặc ngoại lệ.
- Mỗi UC có từ 3 đến 7 ngoại lệ.
- Trong ô bảng, xuống dòng bằng `<br>`; ký tự `|` trong nội dung viết thành `\|`.

```markdown
# UC-XXX-nn: <Tên UC>

| Mã UC | UC-XXX-nn | Tên UC | <Tên UC> |
| --- | --- | --- | --- |
| Người tạo | Duy (BA/PO) | Người cập nhật | Duy (BA/PO) |
| Ngày tạo | 2026-09-30 | Ngày cập nhật | 2026-09-30 |
| Module | Mnn: <Tên module> | Tính năng | F-XXX-nn |
| Giai đoạn | GĐ1 | Mức mục tiêu | Mục tiêu người dùng |

| **Tác nhân:** | **Chính:** <tác nhân>. **Phụ:** <tác nhân phụ, hoặc Không có>. |
| ---: | :--- |
| **Mô tả:** | <2 đến 4 câu: vì sao, làm gì, kết quả> |
| **Tiền điều kiện:** | 1. <điều kiện kiểm được><br>2. <...> |
| **Hậu điều kiện:** | 1. <trạng thái sau khi thành công><br>2. <...> |
| **Độ ưu tiên:** | Cao / Trung bình / Thấp. <lý do> |
| **Tần suất sử dụng:** | <số lần theo đơn vị thời gian, gắn A-nn, hoặc [TBD-1]>; cao điểm: <...> |
| **Luồng sự kiện chính:** | 1. <Tác nhân> <hành động>.<br>2. Hệ thống <phản hồi>.<br>3. <...> |
| **Luồng thay thế:** | **UC-XXX-nn.AC.1: <tên>**<br>Tại bước <N>, nếu <điều kiện>:<br>Na. <...><br>Nb. <...><br>Tiếp tục từ bước <M> của luồng chính. |
| **Ngoại lệ:** | **UC-XXX-nn.EX.1: <tên>**<br>Khi nào: <...><br>Hệ thống: <...><br>Trạng thái cuối: <...> |
| **Bao gồm:** | UC-YYY-nn: <tên> (gọi ở bước <N>), hoặc Không có |
| **Yêu cầu đặc biệt:** | **Hiệu năng:** <...><br>**Bảo mật:** <...><br>**Tin cậy:** <...><br>**Tuân thủ:** <...><br>**Audit:** <...> |
| **Giả định:** | 1. <...> |
| **Ghi chú và vấn đề mở:** | [TBD-1] <câu hỏi> \| Người trả lời: <...> \| Hạn: <...> \| Kết luận: Chưa có |
```

Giải thích một số ô:

- Mức mục tiêu: "Mục tiêu người dùng" với UC một người làm xong trong một phiên; "Chức năng con" với UC dùng chung được UC khác gọi qua trường Bao gồm; "Hệ thống" với UC do Bộ lập lịch chạy.
- Tính năng: một hoặc nhiều mã `F-` của blueprint, cách nhau bằng dấu phẩy.
- Độ ưu tiên: Cao là thiếu UC này thì MVP1 không vận hành được; Trung bình là cần cho MVP1 nhưng có cách làm tạm; Thấp là để sau MVP1 cũng được.
