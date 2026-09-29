import type { Request } from 'express';

/**
 * Ngôn ngữ hệ thống hỗ trợ.
 *
 * ⚠️ `vi` LÀ MẶC ĐỊNH, KHÔNG PHẢI `en`
 *
 * Người dùng Every Half — nhân viên cửa hàng, thủ kho, xưởng rang, kế toán — làm việc bằng
 * tiếng Việt. Đặt `en` làm mặc định nghĩa là mọi người dùng không khai ngôn ngữ sẽ nhận thông
 * báo lỗi bằng tiếng Anh — tức gần như toàn bộ người dùng thật. `en` tồn tại cho ban điều hành
 * và đối tác nước ngoài (nếu có).
 *
 * ⚠️ THÊM MỘT NGÔN NGỮ LÀ MỘT THAY ĐỔI CÓ CHI PHÍ THẬT
 *
 * Thêm `ja` vào đây làm `ERROR_DEFINITIONS` **không biên dịch được** cho tới khi mọi mã lỗi
 * có bản dịch tiếng Nhật. Đó là chủ ý: một ngôn ngữ được khai nhưng dịch thiếu sẽ trả về
 * `undefined` ở đúng những lỗi ít gặp nhất — loại lỗi khó phát hiện nhất.
 *
 * ⚠️ Thêm ngôn ngữ mới phải sửa CẢ ba chỗ: `SUPPORTED_LOCALES` (đây), CHECK của
 * `user_profiles.preferred_locale` (migration), và `SUPPORTED_LOCALES` ở eh_am_frontend.
 */
export const Locale = {
  VI: 'vi',
  EN: 'en',
} as const;

export type Locale = (typeof Locale)[keyof typeof Locale];

export const DEFAULT_LOCALE: Locale = Locale.VI;

export const SUPPORTED_LOCALES: readonly Locale[] = [Locale.VI, Locale.EN];

function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Ngôn ngữ của một request, theo thứ tự ưu tiên.
 *
 * ```
 * 1. user_profiles.preferred_locale     ← lựa chọn của TÀI KHOẢN
 * 2. header Accept-Language             ← lựa chọn của TRÌNH DUYỆT
 * 3. DEFAULT_LOCALE ('vi')
 * ```
 *
 * ⚠️ THỨ TỰ NÀY KHÔNG ĐẢO ĐƯỢC
 *
 * Lựa chọn của tài khoản phải thắng `Accept-Language`. Một nhân viên chọn giao diện tiếng
 * Việt nhưng dùng máy tính quầy có Chrome cài tiếng Anh sẽ nhận thông báo lỗi tiếng Anh nếu
 * đảo thứ tự — và họ không hiểu vì sao, vì họ đã chọn tiếng Việt trong cài đặt.
 *
 * ⚠️ `preferred_locale` ĐỌC TỪ DATABASE, KHÔNG TỪ HEADER
 *
 * `JwtAuthGuard` đọc nó cùng lượt với `status` (một truy vấn theo khoá chính, xem
 * `USER_PROFILE_GUARD_COLUMNS`). Tin một header như `x-locale` thì client đặt được — vô hại
 * với ngôn ngữ, nhưng nó tạo tiền lệ "đọc trạng thái tài khoản từ header" mà repo này cấm ở
 * mọi chỗ khác.
 *
 * ⚠️ REQUEST KHÔNG ĐĂNG NHẬP CHỈ CÓ BƯỚC 2
 *
 * Đăng ký, đăng nhập, quên mật khẩu chạy trước khi biết người gọi là ai — nên chúng dựa vào
 * `Accept-Language`. Đó là lý do frontend **phải** gửi header đó, kể cả khi đã đăng nhập.
 */
export function resolveLocale(req: Request): Locale {
  const fromProfile = req.user?.preferredLocale;
  if (fromProfile && isSupportedLocale(fromProfile)) {
    return fromProfile;
  }

  return parseAcceptLanguage(req.headers['accept-language']);
}

/**
 * Đọc `Accept-Language` và trả về ngôn ngữ hỗ trợ đầu tiên theo thứ tự ưu tiên `q`.
 *
 * Ví dụ: `vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7` → `vi`
 *
 * ⚠️ SO KHỚP THEO PHẦN NGÔN NGỮ, BỎ PHẦN VÙNG
 *
 * `vi-VN` phải khớp `vi`. So khớp nguyên chuỗi thì `vi-VN` không khớp gì và rơi về mặc định —
 * đúng kết quả may mắn với `vi`, nhưng `en-US` sẽ **không** ra `en`, và người dùng tiếng Anh
 * nhận thông báo tiếng Việt.
 *
 * ⚠️ SẮP THEO `q` GIẢM DẦN, KHÔNG LẤY PHẦN TỬ ĐẦU
 *
 * Chrome gửi `en-US,en;q=0.9,vi;q=0.8` khi giao diện tiếng Anh. Nhưng một cấu hình như
 * `en;q=0.5,vi;q=0.9` là hợp lệ và có nghĩa "ưu tiên tiếng Việt". Lấy phần tử đầu sẽ cho ra
 * tiếng Anh — sai với ý người dùng.
 *
 * ⚠️ Không dùng thư viện phân tích `Accept-Language`. Header này do client kiểm soát và một
 * thư viện phân tích là thêm một bề mặt tấn công cho một việc gói gọn trong 15 dòng. Mọi giá
 * trị lạ đều rơi về `DEFAULT_LOCALE`.
 */
export function parseAcceptLanguage(header: string | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;

  // ⚠️ Cắt ở 200 ký tự: header do client kiểm soát, không giới hạn độ dài. Một chuỗi vài
  // megabyte với hàng nghìn phần tử sẽ tiêu CPU ở bước `split` — tức kẻ gửi rác quyết định
  // được lượng CPU server dùng. Một header thật dài nhất cũng dưới 100 ký tự.
  const candidates = header
    .slice(0, 200)
    .split(',')
    .map((part) => {
      const [tag, ...directives] = part.trim().split(';');
      const qDirective = directives.find((d) => d.trim().startsWith('q='));
      const q = qDirective ? Number(qDirective.trim().slice(2)) : 1;
      return {
        // `vi-VN` → `vi`; chữ thường vì `Accept-Language` không phân biệt hoa thường
        language: (tag ?? '').trim().toLowerCase().split('-')[0] ?? '',
        // `q` sai định dạng (`q=abc`) → coi là 0, tức xếp cuối. Không bỏ phần tử đó đi:
        // nếu nó là ngôn ngữ duy nhất hỗ trợ thì vẫn tốt hơn mặc định.
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const candidate of candidates) {
    if (isSupportedLocale(candidate.language)) {
      return candidate.language;
    }
  }

  return DEFAULT_LOCALE;
}
