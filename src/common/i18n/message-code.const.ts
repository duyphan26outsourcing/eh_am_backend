import { Locale } from './locale.const';

/**
 * ============================================================================
 * DANH MỤC THÔNG BÁO THÀNH CÔNG — SONG NGỮ
 * ============================================================================
 *
 * ⚠️ VÌ SAO CÓ FILE NÀY (KHÁC CODEBASE GỐC)
 *
 * Ở codebase gốc, thông báo **lỗi** được dịch theo ngôn ngữ người đọc, nhưng thông báo
 * **thành công** ("Đăng nhập thành công", "Đã đổi mật khẩu…") là câu tiếng Việt viết cứng
 * trong service. Người dùng chọn tiếng Anh sẽ thấy một màn hình nửa Anh nửa Việt: lỗi bằng
 * tiếng Anh, thành công bằng tiếng Việt.
 *
 * Cùng cơ chế với `ERROR_DEFINITIONS`: `satisfies Record<MessageCode, …>` buộc mọi mã có đủ
 * `vi` và `en` — thiếu một bản dịch là không biên dịch được.
 *
 * ⚠️ FRONTEND KHÔNG PHÂN NHÁNH THEO CÂU NÀY. Luồng của frontend dựa vào các trường có cấu trúc
 * trong phản hồi (`sessionsRevoked`, `confirmationEmailSent`, …); `message` chỉ để hiện ra.
 */
export const MessageCode = {
  AUTH_REGISTERED: 'AUTH_REGISTERED',
  AUTH_REGISTERED_EMAIL_PENDING: 'AUTH_REGISTERED_EMAIL_PENDING',
  AUTH_CONFIRMATION_RESENT: 'AUTH_CONFIRMATION_RESENT',
  AUTH_LOGGED_IN: 'AUTH_LOGGED_IN',
  AUTH_LOGGED_OUT: 'AUTH_LOGGED_OUT',
  AUTH_ALL_SESSIONS_REVOKED: 'AUTH_ALL_SESSIONS_REVOKED',
  AUTH_SESSION_REFRESHED: 'AUTH_SESSION_REFRESHED',
  AUTH_RESET_LINK_SENT: 'AUTH_RESET_LINK_SENT',
  AUTH_PASSWORD_RESET: 'AUTH_PASSWORD_RESET',
  AUTH_PASSWORD_CHANGED: 'AUTH_PASSWORD_CHANGED',
} as const;

export type MessageCode = (typeof MessageCode)[keyof typeof MessageCode];

export const MESSAGE_DEFINITIONS = {
  AUTH_REGISTERED: {
    vi: 'Đã tạo tài khoản. Vui lòng kiểm tra email để xác nhận trước khi đăng nhập.',
    en: 'Account created. Please check your email to confirm it before signing in.',
  },
  AUTH_REGISTERED_EMAIL_PENDING: {
    vi:
      'Đã tạo tài khoản nhưng chưa gửi được email xác nhận. ' +
      'Vui lòng dùng chức năng "Gửi lại email xác nhận".',
    en:
      'The account was created but the confirmation email could not be sent. ' +
      'Please use "Resend confirmation email".',
  },
  // ⚠️ Cùng một câu cho mọi trường hợp — chống dò danh sách người dùng (xem AuthService).
  AUTH_CONFIRMATION_RESENT: {
    vi:
      'Nếu email này có tài khoản chưa xác nhận, hệ thống đã gửi lại liên kết xác nhận. ' +
      'Vui lòng kiểm tra cả hộp thư rác.',
    en:
      'If this email has an unconfirmed account, a new confirmation link has been sent. ' +
      'Please check your spam folder too.',
  },
  AUTH_LOGGED_IN: {
    vi: 'Đăng nhập thành công.',
    en: 'Signed in successfully.',
  },
  AUTH_LOGGED_OUT: {
    vi: 'Đã đăng xuất.',
    en: 'Signed out.',
  },
  AUTH_ALL_SESSIONS_REVOKED: {
    vi: 'Đã đăng xuất khỏi tất cả thiết bị. Vui lòng đăng nhập lại.',
    en: 'Signed out of all devices. Please sign in again.',
  },
  AUTH_SESSION_REFRESHED: {
    vi: 'Đã làm mới phiên.',
    en: 'Session refreshed.',
  },
  // ⚠️ Cùng một câu kể cả khi email không tồn tại — chống dò danh sách người dùng.
  AUTH_RESET_LINK_SENT: {
    vi:
      'Nếu email này có tài khoản, hệ thống đã gửi liên kết đặt lại mật khẩu. ' +
      'Vui lòng kiểm tra cả hộp thư rác.',
    en:
      'If this email has an account, a password reset link has been sent. ' +
      'Please check your spam folder too.',
  },
  AUTH_PASSWORD_RESET: {
    vi:
      'Đã đặt lại mật khẩu và đăng xuất khỏi tất cả thiết bị. ' +
      'Vui lòng đăng nhập bằng mật khẩu mới.',
    en:
      'Your password has been reset and every device has been signed out. ' +
      'Please sign in with the new password.',
  },
  AUTH_PASSWORD_CHANGED: {
    vi: 'Đã đổi mật khẩu. Mọi phiên đăng nhập đã bị thu hồi — vui lòng đăng nhập lại bằng mật khẩu mới.',
    en: 'Password changed. Every session has been revoked — please sign in again with the new password.',
  },
} as const satisfies Record<MessageCode, Record<Locale, string>>;
