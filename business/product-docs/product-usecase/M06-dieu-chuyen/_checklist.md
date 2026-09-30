# Checklist 20 điểm: M06 Điều chuyển

Chấm ngày 2026-09-30. UC-TRF-01 có sẵn từ lần chạy trước, đã đọc lại và giữ nguyên nội dung; chỉ bổ sung UC-TRF-01.AC.6 (sửa và gửi phiếu Nháp) vì UC-TRF-02 trả phiếu về Nháp mà chưa có luồng nào gửi lại.

## UC-TRF-01: Tạo phiếu điều chuyển tài sản

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-01, A-02, [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5, 6, 7 đều do Quản lý điểm: chọn tài sản, chọn lý do và ngày, gửi phiếu; ba thao tác nhập liệu liên tiếp trên một màn hình, không có phản hồi hệ thống xen giữa |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Sáu luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Sáu ngoại lệ: tài sản không đủ điều kiện, đồng thời, nhập sai, quyền, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04, UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-TRF-02: Duyệt phiếu điều chuyển

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-01, A-02, [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | Điều kiện người duyệt khác người tạo đặt ở ngoại lệ EX.1, không ở tiền điều kiện |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 5 đến 9 do hệ thống liên tiếp: kiểm, lưu, ghi nhật ký, tạo việc, hiển thị; đều là xử lý phía máy chủ sau một lần bấm Duyệt |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Sáu ngoại lệ: tự duyệt, quyền, đồng thời, thiếu lý do, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-TRF-03: Xuất giao tài sản điều chuyển

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-01, A-02, [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ⚠️ | Bước 5 gộp việc lặp quét và bấm Xác nhận xuất giao; tách thành hai bước thì vòng lặp mất chỗ đứng, nên giữ một bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 8 đến 12 do hệ thống liên tiếp sau một lần xác nhận, cùng kiểu với UC-MNT-01 bước 10 đến 12 |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Bảy ngoại lệ: mã lạ, tài sản ngoài phiếu, chưa quét đủ, đồng thời, quyền, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04, UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-TRF-04: Xác nhận nhận tài sản bằng QR

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ⚠️ | Gộp ba tính năng F-TRF-04, F-TRF-05, F-TRF-08 theo README nên có bảy luồng thay thế; vẫn một phiên, một người, một mục tiêu là nhận hàng. Nếu dev thấy quá dài, tách nhận hỏng thành UC riêng |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-01, A-02, A-04, [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ⚠️ | Bước 6 ghi lựa chọn và nêu vòng lặp bước 3 đến 6 trong cùng một bước |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 8 đến 12 do hệ thống liên tiếp sau một lần Hoàn tất nhận hàng |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Bảy luồng thay thế; AC.2 kết thúc bằng việc mở UC-MNT-01 sau bước 12 |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Bảy ngoại lệ: mã lạ hoặc ngoài phiếu, quyền, thiếu thông tin, ảnh lỗi, đồng thời, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-QR-04, UC-AUD-01, UC-MNT-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 17 ✅, 3 ⚠️, 0 ❌.

## UC-TRF-05: Xử lý tài sản nhận thiếu

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Việc xác minh với điểm gửi nằm ngoài hệ thống, ghi ở bước 3 và Giả định 1 |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ⚠️ | Chỉ gắn [TBD-1] (Q-11), không có A-nn vì Phụ lục G không có giả định về tỷ lệ nhận thiếu |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 7 đến 11 do hệ thống liên tiếp sau một lần Lưu kết luận |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Năm ngoại lệ: thiếu lý do, quyền, đồng thời, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01, UC-DSP-05 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 18 ✅, 2 ⚠️, 0 ❌.

## UC-TRF-06: Huỷ phiếu điều chuyển

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-01, A-02, [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ⚠️ | Bước 6 đến 10 do hệ thống liên tiếp sau một lần xác nhận huỷ |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | Một luồng thay thế |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ✅ | Sáu ngoại lệ: đã xuất, quyền, thiếu lý do, đồng thời, nhật ký, mất mạng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | UC-AUD-01 |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## UC-TRF-07: Theo dõi phiếu điều chuyển

| Mã | Tiêu chí | Kết quả | Ghi chú |
| --- | --- | --- | --- |
| C1 | Tên UC dạng động từ cộng đối tượng | ✅ | |
| C2 | Đúng mức mục tiêu người dùng (coffee-break test) | ✅ | |
| C3 | Mã UC duy nhất, đúng quy ước | ✅ | |
| C4 | Một tác nhân chính và một mục tiêu | ✅ | |
| C5 | Ranh giới hệ thống rõ | ✅ | Cảnh báo chủ động hằng ngày thuộc UC-AUD-05, use case này chỉ hiện dấu quá hạn |
| C6 | Tác nhân là vai trò cụ thể | ✅ | |
| C7 | Mô tả có vì sao, làm gì, kết quả | ✅ | |
| C8 | Tần suất có số gắn giả định hoặc TBD | ✅ | A-01, A-02, [TBD-1] |
| C9 | Tiền điều kiện kiểm được | ✅ | |
| C10 | Hậu điều kiện đủ trạng thái và thay đổi | ✅ | UC chỉ đọc, hậu điều kiện nêu rõ không đổi dữ liệu |
| C11 | Không lẫn tiền điều kiện với giả định | ✅ | |
| C12 | Luồng chính đánh số, mỗi bước một hành động | ✅ | |
| C13 | Luân phiên tác nhân và hệ thống | ✅ | |
| C14 | Luồng chính không có rẽ nhánh | ✅ | |
| C15 | Luồng đi từ trigger tới hậu điều kiện | ✅ | |
| C16 | Luồng thay thế có "tại bước N" và điều kiện | ✅ | |
| C17 | Ngoại lệ có khi nào, phản hồi, trạng thái cuối | ✅ | |
| C18 | Phủ các lỗi thường gặp | ⚠️ | UC chỉ đọc nên không có ngoại lệ đồng thời hay nhật ký; đã phủ quyền, nhập sai, mất mạng, danh sách rỗng |
| C19 | Bao gồm trỏ tới UC có thật | ✅ | Không có |
| C20 | Yêu cầu đặc biệt chỉ là phi chức năng | ✅ | Hiệu năng ghi định tính, số liệu ở [TBD-2] |

Tổng hợp: 19 ✅, 1 ⚠️, 0 ❌.

## Quy tắc nghiệp vụ đề xuất bổ sung

Đã gộp vào `_chung/quy-tac-nghiep-vu.md` (mục "Quy tắc bổ sung từ bộ UC") ngày 2026-09-30.

## Tác nhân đề xuất bổ sung

| Tác nhân | Lý do | UC dùng |
| --- | --- | --- |
| Không có | Mọi tác nhân của M06 đã có trong danh mục | Không áp dụng |
