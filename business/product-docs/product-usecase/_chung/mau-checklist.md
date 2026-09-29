# Mẫu checklist 20 điểm

Mỗi module có một file `_checklist.md` theo mẫu này. Mỗi UC một mục `##`; tiêu chí lấy từ `use-case-writer/references/quality-checklist.md`. Kết quả dùng ✅ (đạt), ⚠️ (cần xem lại, bắt buộc ghi lý do), ❌ (không đạt, phải sửa trước khi bàn giao).

```markdown
# Checklist 20 điểm: Mnn <Tên module>

## UC-XXX-nn: <Tên UC>

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 20 ✅, 0 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

| Mã | Quy tắc | UC dùng |
| --- | --- | --- |

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
```

Mã quy tắc đề xuất bổ sung đánh tiếp số cuối của module mình trong `quy-tac-nghiep-vu.md` (ví dụ module đang có đến BR-AST-10 thì đề xuất từ BR-AST-11). Không sửa file trong `_chung/`; người điều phối gộp các đề xuất sau mỗi đợt.
