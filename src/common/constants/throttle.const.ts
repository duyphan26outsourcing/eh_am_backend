/**
 * ============================================================================
 * CÁC MỨC GIỚI HẠN TẦN SUẤT CÓ TÊN
 * ============================================================================
 *
 * Khai tập trung ở đây thay vì rải `@Throttle({ default: { limit: 5, ttl: 60000 } })` khắp
 * controller. Lý do không phải gọn code mà là **kiểm tra được**: một reviewer cần trả lời
 * được câu "endpoint đăng nhập cho phép bao nhiêu lần một phút" bằng cách đọc một file.
 * Khi con số nằm rải rác, câu trả lời đúng là "tuỳ endpoint" — và đó là lúc có một endpoint
 * đăng nhập nào đó bị bỏ sót.
 *
 * ⚠️ CÁCH ĐẶT CON SỐ
 *
 * Mỗi mức trả lời hai câu, và câu thứ hai quan trọng hơn:
 *
 *   1. Người dùng **thật** cần bao nhiêu lần trong khoảng đó?
 *   2. Nếu bị lạm dụng ở đúng mức này thì **thiệt hại là gì**?
 *
 * Một endpoint tìm tài sản bị gọi 60 lần/phút thì tốn CPU. Một endpoint đăng nhập bị gọi 60
 * lần/phút là 60 lần thử mật khẩu — nên nó không thể dùng chung mức với tìm kiếm dù cả hai
 * đều là "đọc".
 *
 * ⚠️ `ttl` TÍNH THEO MILLISECOND. `Retry-After` TRẢ RA TÍNH THEO GIÂY.
 * Nhầm đơn vị ở đây cho ra một giới hạn lỏng hơn 1000 lần mà không có lỗi nào báo.
 *
 * ⚠️ WIFI CỬA HÀNG: NHIỀU NHÂN VIÊN CHUNG MỘT IP
 *
 * Mọi điện thoại trong một cửa hàng thường ra Internet qua **một** IP của router. Giới hạn
 * đếm theo IP (lớp toàn cục, xem `ApiThrottlerGuard`) nghĩa là cả ca kiểm kê của một cửa hàng
 * dùng chung một bộ đếm. Vì vậy mức mặc định không được hạ quá thấp — và các endpoint quét QR
 * phải đặt `ApiThrottlerGuard` ở controller SAU `JwtAuthGuard` để đếm theo tài khoản.
 */

const MOT_PHUT = 60_000;
const MOT_GIO = 3_600_000;

/**
 * Mặc định toàn API. Áp cho mọi route không khai mức riêng.
 *
 * 120/phút: đủ cho một người dùng thao tác liên tục trên giao diện (mỗi trang thường gọi
 * 3–6 endpoint), nhưng chặn được script quét endpoint bằng một luồng.
 */
export const THROTTLE_DEFAULT = { ttl: MOT_PHUT, limit: 120 } as const;

/**
 * Đăng nhập: 10 lần / 5 phút.
 *
 * ⚠️ TÁCH RIÊNG KHỎI `THROTTLE_AUTH` VÌ CỬA SỔ THỜI GIAN KHÁC HẲN
 *
 * `THROTTLE_AUTH` là 10 lần / **phút** — hợp cho refresh token và đổi mật khẩu, nơi mỗi lần
 * gọi là một thao tác hợp lệ của người đã đăng nhập. Đăng nhập thì khác: mỗi lần gọi là một
 * lần **thử mật khẩu**, nên cửa sổ phải rộng hơn để tổng số lần thử trong một khoảng dài bị
 * chặn thật.
 *
 * Cụ thể: 10/phút cho phép 50 lần thử trong 5 phút; 10/5 phút cho phép đúng 10. Với dò mật
 * khẩu, chênh lệch đó là chênh lệch 5 lần.
 *
 * ⚠️ Vẫn đủ rộng cho người dùng thật: gõ sai 3 lần rồi bấm quên mật khẩu là 4 request.
 * ⚠️ Nhưng nhớ §WIFI CỬA HÀNG ở đầu file: đầu ca, cả cửa hàng đăng nhập cùng lúc qua một IP.
 * Nếu cửa hàng có trên ~8 nhân viên đăng nhập trong 5 phút, cân nhắc nới mức này — đo trên
 * dữ liệu thật của pilot trước khi đổi.
 */
export const THROTTLE_LOGIN = { ttl: 5 * MOT_PHUT, limit: 10 } as const;

/**
 * Refresh token, đổi mật khẩu, đặt lại mật khẩu, đăng xuất mọi thiết bị.
 *
 * ⚠️ 10 LẦN / PHÚT LÀ MỘT PHẦN CỦA CHỐNG DÒ MẬT KHẨU, KHÔNG PHẢI TOÀN BỘ
 *
 * Giới hạn theo IP không chặn được **credential stuffing phân tán**: 10.000 IP × 10 lần =
 * 100.000 lần thử mà không IP nào vượt ngưỡng. Ba lớp còn lại nằm ngoài file này:
 *
 *   1. **Khoá theo tài khoản** — Supabase Auth tự chặn tạm sau nhiều lần sai liên tiếp trên
 *      cùng một email. Đây là lớp thật sự chặn dò mật khẩu một tài khoản cụ thể.
 *   2. **CAPTCHA** — bật ở Supabase Auth khi thấy dấu hiệu tấn công. Chưa bật ở MVP.
 *   3. **Cảnh báo** — số lần đăng nhập thất bại tăng vọt phải tạo cảnh báo vận hành, chứ
 *      không chỉ nằm trong log.
 *
 * ⚠️ KHÔNG hạ mức này xuống dưới 5 để "an toàn hơn". Một người gõ sai mật khẩu 3 lần rồi
 * bấm quên mật khẩu là 4 request hợp lệ; chặn ở 5 là chặn người dùng thật.
 */
export const THROTTLE_AUTH = { ttl: MOT_PHUT, limit: 10 } as const;

/**
 * Endpoint gửi email: quên mật khẩu, gửi lại thư xác nhận, mời người dùng.
 *
 * ⚠️ VÌ SAO CHẶT HƠN `THROTTLE_AUTH` NHIỀU VÀ TÍNH THEO GIỜ
 *
 * Ba thiệt hại, và thiệt hại thứ ba là thứ không sửa được bằng tiền:
 *
 *   1. **Tốn tiền** — mỗi email là một lần trả phí cho nhà cung cấp SMTP.
 *   2. **Quấy rối người khác** — kẻ tấn công nhập email của một người bất kỳ và gọi lặp
 *      lại; hộp thư của người đó nhận hàng trăm thư "đặt lại mật khẩu" mà họ không yêu cầu.
 *   3. **Mất uy tín tên miền** — người nhận bấm "báo spam", tỉ lệ spam của tên miền tăng,
 *      và sau đó **thư hợp lệ cũng vào spam** — kể cả thư thông báo "tài sản chờ bạn xác nhận
 *      nhận hàng". Khôi phục uy tín tên miền mất nhiều tuần.
 *
 * ⚠️ Giới hạn theo IP là chưa đủ cho nhóm này. Phải có thêm giới hạn **theo địa chỉ nhận**
 * ở tầng nghiệp vụ (tối đa N thư tới cùng một email trong M phút), vì đó là thứ bảo vệ mục
 * 2 và 3 ở trên. Supabase Auth có sẵn một mức cho việc này — kiểm tra nó thay vì tin rằng
 * đã có.
 */
export const THROTTLE_EMAIL = { ttl: MOT_GIO, limit: 5 } as const;

/**
 * Endpoint ghi dữ liệu nghiệp vụ: tạo tài sản, tạo phiếu điều chuyển, báo hỏng, đề nghị thanh
 * lý.
 *
 * 30/phút: cao hơn cảm giác cần thiết, vì người nhập liệu ban đầu có thể tạo tài sản liên tục.
 * ⚠️ Nhập hàng loạt (import Excel) KHÔNG đi qua endpoint từng bản ghi — nó là một job nền, nên
 * không cần và không được nới mức này để "cho import chạy".
 */
export const THROTTLE_WRITE = { ttl: MOT_PHUT, limit: 30 } as const;

/**
 * Endpoint tìm kiếm và gợi ý (tìm tài sản theo tên/mã/serial).
 *
 * ⚠️ Tìm kiếm tiếng Việt có `unaccent` + `pg_trgm` là truy vấn tốn CPU của database, không
 * phải của backend. Nên mức này bảo vệ **database**, và nó phải chặt hơn mức đọc thường dù
 * cả hai đều là GET.
 *
 * 60/phút cho phép gõ-để-tìm với `debounce` 300ms ở frontend. Không có debounce thì mỗi ký
 * tự là một request và người dùng thật sẽ chạm ngưỡng — nên đây là con số **phụ thuộc vào
 * frontend có debounce**; ghi ra để khi frontend bỏ debounce thì biết chỗ nào vỡ.
 */
export const THROTTLE_SEARCH = { ttl: MOT_PHUT, limit: 60 } as const;
