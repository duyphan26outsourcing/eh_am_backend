/**
 * PHIÊN BẢN API.
 *
 * =========================================================================
 * CHIẾN LƯỢC: VERSION TRONG URI, MẶC ĐỊNH `1`
 * =========================================================================
 *
 * Đường dẫn thật: `/v1/auth/login`, `/v1/assets`, `/v2/assets`, …
 *
 * ⚠️ VÌ SAO URI CHỨ KHÔNG PHẢI HEADER
 *
 * Nest hỗ trợ bốn kiểu: URI, HEADER, MEDIA_TYPE, CUSTOM. Chọn URI vì:
 *
 *   1. **Đọc được trong log và trong báo lỗi.** Một dòng log `POST /v1/transfers` nói đủ.
 *      Với header versioning, log chỉ có `POST /transfers` và phải mở header mới biết client
 *      gọi bản nào — đúng lúc đang điều tra sự cố thì đó là thông tin bị thiếu.
 *   2. **Chia sẻ được bằng đường dẫn.** Frontend, curl, tài liệu, Postman đều chỉ cần URL.
 *   3. **CDN cache theo đường dẫn.** Header versioning buộc phải khai `Vary` đúng, và một
 *      lần khai sai là trả bản v1 cho người gọi v2.
 *
 * Đánh đổi: URL không còn "vĩnh viễn" theo nghĩa thuần REST. Chấp nhận được — với một hệ
 * thống có web quản trị và thao tác quét QR trên điện thoại (điện thoại có thể giữ bản PWA
 * cũ trong bộ nhớ đệm nhiều ngày), việc biết chắc client đang gọi bản nào quan trọng hơn sự
 * thuần khiết của URL.
 *
 * =========================================================================
 * ⚠️ KHI NÀO TĂNG VERSION — VÀ KHI NÀO KHÔNG
 * =========================================================================
 *
 * Tăng version là việc **đắt**: nó nhân đôi bề mặt phải bảo trì, phải test, phải tài liệu
 * hoá. Chỉ tăng khi có **thay đổi phá vỡ** mà không thể tránh:
 *
 *   ✅ Xoá một trường trong phản hồi
 *   ✅ Đổi tên trường
 *   ✅ Đổi kiểu dữ liệu của trường (string → number)
 *   ✅ Thêm một trường **bắt buộc** vào request
 *   ✅ Đổi ý nghĩa của một giá trị đã có (ví dụ `status: 'IN_USE'` đổi nghĩa)
 *   ✅ Đổi mã HTTP của một luồng thành công
 *
 *   ❌ Thêm trường **tuỳ chọn** vào request        → không cần
 *   ❌ Thêm trường mới vào phản hồi                 → không cần
 *   ❌ Thêm endpoint mới                            → không cần
 *   ❌ Thêm giá trị mới vào một enum **đầu ra**     → không cần
 *   ❌ Sửa lỗi để hành vi khớp tài liệu             → không cần
 *   ❌ Đổi thông báo lỗi (giữ nguyên mã lỗi)        → không cần
 *
 * ⚠️ Thêm giá trị mới vào enum **đầu vào** thì không phá vỡ; thêm vào enum **đầu ra** thì
 * có thể phá client nếu client dùng `switch` không có `default`. Với trạng thái tài sản điều
 * này có thật: thêm một trạng thái mới mà app quét QR cũ không biết sẽ làm màn hình tài sản
 * hiện trống. Contract phải nói rõ client phải chịu được giá trị lạ.
 *
 * =========================================================================
 * QUY TẮC VẬN HÀNH NHIỀU VERSION
 * =========================================================================
 *
 *   · Tối đa **hai** version phục vụ đồng thời (N và N-1). Ba version là ba bộ test.
 *   · Khi phát hành N+1: N-1 vào giai đoạn ngừng hỗ trợ, thông báo trước ≥90 ngày.
 *   · Version cũ **chỉ nhận sửa lỗi bảo mật**, không nhận tính năng mới.
 *   · Endpoint chỉ có ở một version thì khai đúng version đó, không khai cả hai.
 *
 * ⚠️ KHÔNG bao giờ đổi hành vi của một version đã phát hành. Nếu một client đang dựa vào
 * hành vi sai, việc sửa hành vi đó là thay đổi phá vỡ — thuộc version sau.
 */

/**
 * Version hiện tại. Controller **không** cần khai `version` nếu chỉ phục vụ bản này —
 * `defaultVersion` trong `bootstrap.ts` lo phần đó.
 */
export const API_VERSION_1 = '1';

/**
 * Đã khai sẵn để khi cần bản 2 thì không phải sửa nhiều chỗ.
 *
 * ⚠️ Khai hằng số **không** tạo ra version. Version chỉ tồn tại khi có controller khai
 * `version: API_VERSION_2`. Đừng thêm vào `SUPPORTED_API_VERSIONS` trước lúc đó — danh
 * sách đó là nguồn cho tài liệu và cho phép kiểm, khai sớm là nói sai.
 */
export const API_VERSION_2 = '2';
export const API_VERSION_3 = '3';

/** Các version đang thật sự phục vụ. Dùng cho tài liệu và cho log lúc khởi động. */
export const SUPPORTED_API_VERSIONS: readonly string[] = [API_VERSION_1];

/**
 * Đường dẫn **không** mang tiền tố version.
 *
 * ⚠️ `/health` cố ý nằm ngoài versioning: Docker `HEALTHCHECK` và load balancer gọi nó, và
 * chúng không nên phải biết version nào đang chạy. Một health check trỏ vào `/v1/health`
 * sẽ vỡ đúng vào lúc phát hành v2 và bỏ v1 — thời điểm tệ nhất để mất health check.
 */
export const VERSION_NEUTRAL_ROUTES: readonly string[] = ['health'];
