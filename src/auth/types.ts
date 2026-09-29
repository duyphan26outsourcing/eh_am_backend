/**
 * Nội dung đã xác minh của một request đã đăng nhập.
 *
 * ⚠️ MỌI TRƯỜNG Ở ĐÂY ĐƯỢC RESOLVE Ở PHÍA SERVER, KHÔNG LẤY TỪ HEADER CLIENT GỬI.
 *
 * `JwtAuthGuard` dựng object này từ hai nguồn tin được: chữ ký JWT do Supabase phát,
 * và bảng `user_profiles` trong database. Không có trường nào đọc từ header tuỳ ý
 * của client — xem chú thích trong guard để biết vì sao đó là điều kiện bắt buộc.
 *
 * ⚠️ VAI TRÒ VÀ PHẠM VI LOCATION KHÔNG NẰM Ở ĐÂY
 *
 * Chúng có hiệu lực theo thời gian và thay đổi độc lập với phiên đăng nhập (quản lý cửa hàng
 * chuyển sang cửa hàng khác giữa ca). `PermissionsGuard` và `AccessScopeService` đọc chúng từ
 * `context_role_assignments` đúng lúc cần — không cache vào payload sống hàng giờ.
 */
export interface JwtPayload {
  /** `auth.users.id` — cũng là `user_profiles.id`. */
  sub: string;

  /**
   * Tên hiển thị, lấy từ `user_profiles`.
   *
   * Có ở đây để service ghi audit (`actor_label`) mà không phải truy vấn lại hồ sơ.
   */
  displayName: string;

  /** Mã nhân viên (nếu đã gắn). `null` với tài khoản chưa được quản trị gắn mã. */
  employeeCode: string | null;

  /**
   * Ngôn ngữ hiển thị mà tài khoản này chọn (`user_profiles.preferred_locale`).
   *
   * ⚠️ `AllExceptionsFilter` dùng nó để dịch thông báo lỗi. Đọc từ **database**, không từ
   * header — client đặt được `x-locale`, và dù việc đó vô hại với ngôn ngữ, nó tạo tiền lệ
   * "đọc trạng thái tài khoản từ header" mà repo này cấm ở mọi chỗ khác.
   *
   * ⚠️ Optional vì request **chưa đăng nhập** không có. Với những request đó,
   * `resolveLocale()` dùng `Accept-Language` — nên frontend phải luôn gửi header đó.
   */
  preferredLocale?: string;

  app_metadata?: {
    /** `'admin'` cho quản trị tối cao (break-glass), hoặc undefined. */
    role?: string;
  };

  /** Authentication Assurance Level lấy từ JWT Supabase đã xác minh. */
  aal?: 'aal1' | 'aal2';

  /**
   * Authentication Method References.
   *
   * `timestamp` dùng để kiểm tra độ "tươi" của lần xác thực khi cần step-up authentication
   * cho hành động nhạy cảm (ví dụ duyệt giảm tài sản).
   */
  amr?: Array<{ method: string; timestamp: number }>;

  /** ID phiên đăng nhập đã ký bởi Supabase. */
  authSessionId?: string;
}
