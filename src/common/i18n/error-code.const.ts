import { HttpStatus } from '@nestjs/common';
import { Locale } from './locale.const';

/**
 * ============================================================================
 * DANH MỤC MÃ LỖI NGHIỆP VỤ — NGUỒN DUY NHẤT
 * ============================================================================
 *
 * ⚠️ MÃ LỖI LÀ CONTRACT. MESSAGE LÀ TIỆN ÍCH CHO NGƯỜI ĐỌC.
 *
 * Frontend **phải** phân nhánh theo `response.code`, tuyệt đối không theo `response.message`.
 * Lý do: `message` đổi theo ngôn ngữ của người dùng và đổi khi ai đó sửa câu văn cho dễ hiểu
 * hơn. Một `if (message.includes('đã tồn tại'))` ở frontend sẽ vỡ khi người dùng đổi sang
 * tiếng Anh — và vỡ im lặng, vì nhánh đó chỉ đơn giản không chạy.
 *
 * Đổi `message` **không** phải thay đổi phá vỡ (không cần tăng version API).
 * Đổi hoặc xoá một `code` **là** thay đổi phá vỡ.
 *
 * ⚠️ MỘT MÃ = MỘT MÃ HTTP, KHAI CÙNG CHỖ
 *
 * `status` nằm trong `ERROR_DEFINITIONS` chứ không truyền ở chỗ ném lỗi. Nếu mỗi chỗ ném tự
 * chọn status thì cùng một mã lỗi sẽ trả 409 ở endpoint này và 400 ở endpoint kia — và
 * frontend không thể xử lý nhất quán.
 *
 * ⚠️ THÊM MÃ MỚI: PHẢI DỊCH ĐỦ MỌI NGÔN NGỮ, NẾU KHÔNG SẼ KHÔNG BIÊN DỊCH ĐƯỢC
 *
 * `satisfies Record<ErrorCode, ErrorDefinition>` bên dưới buộc mọi mã có đủ `vi` và `en`. Đó
 * là chủ ý: một bản dịch thiếu trả về `undefined` ở đúng những lỗi ít gặp nhất — loại lỗi
 * khó phát hiện nhất khi chạy thật.
 *
 * ⚠️ MÃ LỖI CỦA TỪNG DOMAIN (tài sản, điều chuyển, kiểm kê, thanh lý, FAST…) CHƯA CÓ Ở ĐÂY
 *
 * Giai đoạn nền móng chỉ khai mã của hạ tầng + xác thực. Mỗi module khi triển khai thêm nhóm
 * mã của mình vào file này (một nhóm có tiêu đề riêng), theo đặc tả đã được duyệt của module.
 */
export const ErrorCode = {
  // -------------------------------------------------------------------------
  // Chung
  // -------------------------------------------------------------------------
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NOT_FOUND: 'NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  REQUEST_TIMEOUT: 'REQUEST_TIMEOUT',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  INVALID_REFERENCE_ID: 'INVALID_REFERENCE_ID',

  // -------------------------------------------------------------------------
  // Xác thực và phiên
  // -------------------------------------------------------------------------
  ACCESS_TOKEN_MISSING: 'ACCESS_TOKEN_MISSING',
  ACCESS_TOKEN_INVALID: 'ACCESS_TOKEN_INVALID',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
  CREDENTIALS_INVALID: 'CREDENTIALS_INVALID',
  EMAIL_NOT_CONFIRMED: 'EMAIL_NOT_CONFIRMED',
  SESSION_CREATE_FAILED: 'SESSION_CREATE_FAILED',
  CURRENT_PASSWORD_INCORRECT: 'CURRENT_PASSWORD_INCORRECT',
  NEW_PASSWORD_SAME_AS_CURRENT: 'NEW_PASSWORD_SAME_AS_CURRENT',
  RECOVERY_TOKEN_INVALID: 'RECOVERY_TOKEN_INVALID',
  ACCOUNT_CREATE_FAILED: 'ACCOUNT_CREATE_FAILED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  PASSWORD_CHANGE_REQUIRED: 'PASSWORD_CHANGE_REQUIRED',
  INVITATION_INVALID: 'INVITATION_INVALID',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVITATION_USED_OR_REPLACED: 'INVITATION_USED_OR_REPLACED',
  PASSWORD_UPDATE_FAILED: 'PASSWORD_UPDATE_FAILED',

  // -------------------------------------------------------------------------
  // Hồ sơ người dùng
  // -------------------------------------------------------------------------
  PROFILE_NOT_INITIALIZED: 'PROFILE_NOT_INITIALIZED',
  /** ⚠️ Có tham số `{status}` — dùng cho cả `SUSPENDED` và `DEACTIVATED`. */
  ACCOUNT_INACTIVE: 'ACCOUNT_INACTIVE',
  ACCOUNT_STATE_CONFLICT: 'ACCOUNT_STATE_CONFLICT',
  SELF_ACCOUNT_LOCK_FORBIDDEN: 'SELF_ACCOUNT_LOCK_FORBIDDEN',
  LAST_SYSTEM_ADMIN_REQUIRED: 'LAST_SYSTEM_ADMIN_REQUIRED',
  /** Chặn đổi email đăng nhập cho chính mình hoặc cho tài khoản SYSTEM_ADMIN (UC-IAM-08, chống chiếm tài khoản). */
  EMAIL_CHANGE_TARGET_FORBIDDEN: 'EMAIL_CHANGE_TARGET_FORBIDDEN',
  EMPLOYEE_CODE_TAKEN: 'EMPLOYEE_CODE_TAKEN',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  INVALID_SUPERIOR: 'INVALID_SUPERIOR',

  // -------------------------------------------------------------------------
  // Phân quyền
  // -------------------------------------------------------------------------
  ROLE_REQUIRED: 'ROLE_REQUIRED',
  SUPER_ADMIN_REQUIRED: 'SUPER_ADMIN_REQUIRED',
  GUARD_ORDER_ERROR: 'GUARD_ORDER_ERROR',
  ROLE_NOT_ASSIGNABLE: 'ROLE_NOT_ASSIGNABLE',
  /** Đã có dòng phân quyền cùng vai trò, cùng phạm vi, khoảng hiệu lực chồng lấn (UC-IAM-10.EX.3). */
  ROLE_ASSIGNMENT_EXISTS: 'ROLE_ASSIGNMENT_EXISTS',
  /** Nhân viên điểm chỉ ở một location; đang có hiệu lực ở location khác (UC-IAM-10.EX.5). */
  LOCATION_STAFF_SCOPE_CONFLICT: 'LOCATION_STAFF_SCOPE_CONFLICT',
  /** SYSTEM_ADMIN chỉ thu hồi qua quy trình riêng, không qua màn hình (UC-IAM-11.EX.3, BR-IAM-18). */
  ROLE_NOT_REVOCABLE: 'ROLE_NOT_REVOCABLE',
  REASON_INVALID: 'REASON_INVALID',

  // -------------------------------------------------------------------------
  // Truy cập dữ liệu và toàn vẹn lịch sử
  // -------------------------------------------------------------------------
  DUPLICATE_RECORD: 'DUPLICATE_RECORD',
  SUPPLIER_TAX_ID_TAKEN: 'SUPPLIER_TAX_ID_TAKEN',
  RECORD_VERSION_CONFLICT: 'RECORD_VERSION_CONFLICT',
  SYSTEM_REASON_PROTECTED: 'SYSTEM_REASON_PROTECTED',
  /** Ngừng một mục danh mục nền khi nó còn được dùng (UC-MDM-02/03/08.EX). */
  CATALOG_ITEM_IN_USE: 'CATALOG_ITEM_IN_USE',
  REFERENCE_NOT_FOUND: 'REFERENCE_NOT_FOUND',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  VALUE_OUT_OF_DOMAIN: 'VALUE_OUT_OF_DOMAIN',
  APPEND_ONLY_TABLE: 'APPEND_ONLY_TABLE',
  /** Bản ghi lịch sử chỉ được "đóng hiệu lực" một lần — xem trigger `tg_role_assignment_close_only` ở migration 01. */
  HISTORY_IMMUTABLE: 'HISTORY_IMMUTABLE',
  DATA_ACCESS_ERROR: 'DATA_ACCESS_ERROR',
  AUDIT_WRITE_FAILED: 'AUDIT_WRITE_FAILED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

interface ErrorDefinition {
  status: HttpStatus;
  /** Bản dịch cho từng ngôn ngữ. Chỗ chèn tham số viết `{tenThamSo}`. */
  messages: Record<Locale, string>;
}

/**
 * ⚠️ ĐỌC TRƯỚC KHI VIẾT MỘT CÂU THÔNG BÁO MỚI
 *
 * Ba nguyên tắc, và nguyên tắc thứ ba là nguyên tắc bảo mật:
 *
 *   1. **Nói người dùng phải làm gì tiếp**, không chỉ nói có lỗi. "Mã nhân viên đã được dùng,
 *      vui lòng kiểm tra lại" hơn "Trùng dữ liệu".
 *   2. **Không lộ chi tiết hạ tầng.** Không có tên bảng, tên index, tên cột, tên nhà cung cấp.
 *   3. ⚠️ **Không phân biệt được các trường hợp mà kẻ tấn công muốn phân biệt.**
 *      `CREDENTIALS_INVALID` dùng cho **cả** "email không tồn tại" và "sai mật khẩu". Hai câu
 *      khác nhau biến endpoint đăng nhập thành công cụ dò danh sách người dùng.
 */
export const ERROR_DEFINITIONS = {
  // -------------------------------------------------------------------------
  INTERNAL_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messages: {
      vi: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
      en: 'An unexpected error occurred. Please try again.',
    },
  },
  VALIDATION_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Dữ liệu gửi lên không hợp lệ.',
      en: 'The submitted data is invalid.',
    },
  },
  NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    messages: {
      vi: 'Không tìm thấy dữ liệu yêu cầu.',
      en: 'The requested resource was not found.',
    },
  },
  FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Bạn không có quyền thực hiện hành động này.',
      en: 'You do not have permission to perform this action.',
    },
  },
  UNAUTHORIZED: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Vui lòng đăng nhập để tiếp tục.',
      en: 'Please sign in to continue.',
    },
  },
  TOO_MANY_REQUESTS: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    messages: {
      vi: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau {seconds} giây.',
      en: 'Too many requests. Please try again in {seconds} seconds.',
    },
  },
  REQUEST_TIMEOUT: {
    status: HttpStatus.REQUEST_TIMEOUT,
    messages: {
      vi:
        'Yêu cầu xử lý quá lâu và đã bị dừng. Vui lòng thử lại sau ít phút. ' +
        'Nếu đây là thao tác ghi (điều chuyển, thanh lý, xác nhận nhận hàng), hãy mở lịch sử ' +
        'tài sản để kiểm tra trước khi thử lại.',
      en:
        'The request took too long and was stopped. Please try again in a few minutes. ' +
        'If this was a write action (transfer, disposal, receipt confirmation), check the ' +
        "asset's history before retrying.",
    },
  },
  PAYLOAD_TOO_LARGE: {
    status: HttpStatus.PAYLOAD_TOO_LARGE,
    messages: {
      vi: 'Nội dung gửi lên quá lớn.',
      en: 'The submitted content is too large.',
    },
  },
  INVALID_REFERENCE_ID: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Định dạng mã tham chiếu không hợp lệ.',
      en: 'Invalid reference identifier format.',
    },
  },

  // -------------------------------------------------------------------------
  ACCESS_TOKEN_MISSING: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Thiếu access token.',
      en: 'Missing access token.',
    },
  },
  ACCESS_TOKEN_INVALID: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Access token không hợp lệ. Vui lòng đăng nhập lại.',
      en: 'Invalid access token. Please sign in again.',
    },
  },
  REFRESH_TOKEN_INVALID: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Phiên đã hết hiệu lực. Vui lòng đăng nhập lại.',
      en: 'Your session has expired. Please sign in again.',
    },
  },
  // ⚠️ Dùng cho CẢ "email không tồn tại" VÀ "sai mật khẩu". Xem nguyên tắc 3 ở trên.
  CREDENTIALS_INVALID: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Email hoặc mật khẩu không đúng.',
      en: 'Incorrect email or password.',
    },
  },
  EMAIL_NOT_CONFIRMED: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi:
        'Email chưa được xác nhận. Vui lòng kiểm tra hộp thư, hoặc dùng chức năng ' +
        '"Gửi lại email xác nhận".',
      en:
        'Your email is not confirmed yet. Check your inbox, or use ' +
        '"Resend confirmation email".',
    },
  },
  SESSION_CREATE_FAILED: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Không tạo được phiên đăng nhập. Vui lòng thử lại.',
      en: 'Could not create a session. Please try again.',
    },
  },
  CURRENT_PASSWORD_INCORRECT: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Mật khẩu hiện tại không đúng.',
      en: 'Current password is incorrect.',
    },
  },
  NEW_PASSWORD_SAME_AS_CURRENT: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Mật khẩu mới phải khác mật khẩu hiện tại.',
      en: 'The new password must differ from the current one.',
    },
  },
  RECOVERY_TOKEN_INVALID: {
    status: HttpStatus.UNAUTHORIZED,
    messages: {
      vi: 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
      en: 'The password reset link is invalid or has expired.',
    },
  },
  ACCOUNT_CREATE_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Không tạo được tài khoản. Vui lòng thử lại.',
      en: 'Could not create the account. Please try again.',
    },
  },
  EMAIL_SEND_FAILED: {
    status: HttpStatus.BAD_GATEWAY,
    messages: {
      vi: 'Chưa gửi được email mời. Vui lòng kiểm tra trạng thái mới nhất trước khi thử lại.',
      en: 'The invitation email could not be sent. Check the latest status before trying again.',
    },
  },
  PASSWORD_CHANGE_REQUIRED: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Bạn cần đổi mật khẩu tạm trước khi tiếp tục.',
      en: 'You must change the temporary password before continuing.',
    },
  },
  INVITATION_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Liên kết kích hoạt không hợp lệ. Vui lòng mở lại liên kết mới nhất trong email.',
      en: 'This activation link is invalid. Please open the latest link in your email.',
    },
  },
  INVITATION_EXPIRED: {
    status: HttpStatus.GONE,
    messages: {
      vi: 'Liên kết kích hoạt đã hết hạn. Vui lòng liên hệ quản trị hệ thống để được gửi lại.',
      en: 'This activation link has expired. Please ask your system administrator to resend it.',
    },
  },
  INVITATION_USED_OR_REPLACED: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Liên kết kích hoạt không còn hiệu lực. Nếu đã kích hoạt, bạn có thể đăng nhập; nếu chưa, hãy dùng email mới nhất.',
      en: 'This activation link is no longer valid. If activation is complete, sign in; otherwise use the latest email.',
    },
  },
  PASSWORD_UPDATE_FAILED: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messages: {
      vi: 'Chưa đặt được mật khẩu. Vui lòng mở lại liên kết và thử lần nữa.',
      en: 'Your password could not be set. Please reopen the link and try again.',
    },
  },

  // -------------------------------------------------------------------------
  PROFILE_NOT_INITIALIZED: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Tài khoản chưa có hồ sơ người dùng Every Half. Vui lòng liên hệ quản trị hệ thống.',
      en: 'This account has no Every Half user profile yet. Please contact the system administrator.',
    },
  },
  ACCOUNT_INACTIVE: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Tài khoản đang ở trạng thái {status} nên không thực hiện được hành động này. Vui lòng liên hệ quản trị hệ thống.',
      en: 'This account is {status}, so the action cannot be completed. Please contact the system administrator.',
    },
  },
  ACCOUNT_STATE_CONFLICT: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Tài khoản không còn ở trạng thái có thể gửi lại lời mời. Vui lòng làm mới danh sách để kiểm tra trạng thái mới nhất.',
      en: 'This account can no longer receive a replacement invitation. Refresh the list to check its latest status.',
    },
  },
  SELF_ACCOUNT_LOCK_FORBIDDEN: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Bạn không thể tự khóa tài khoản đang dùng. Hãy nhờ một quản trị hệ thống khác thực hiện nếu cần.',
      en: 'You cannot lock the account you are currently using. Ask another system administrator if needed.',
    },
  },
  LAST_SYSTEM_ADMIN_REQUIRED: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Không thể khóa quản trị hệ thống đang hoạt động cuối cùng. Hãy bảo đảm còn một quản trị viên khác trước khi tiếp tục.',
      en: 'The last active system administrator cannot be locked. Ensure another administrator remains active first.',
    },
  },
  EMAIL_CHANGE_TARGET_FORBIDDEN: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Không thể đổi email đăng nhập cho tài khoản của chính bạn hoặc cho quản trị hệ thống từ màn hình này. Việc này cần quy trình riêng có xác minh.',
      en: 'You cannot change the login email for your own account or for a system administrator from this screen. That requires a separate, verified process.',
    },
  },
  EMPLOYEE_CODE_TAKEN: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Mã nhân viên "{employeeCode}" đã gắn với một tài khoản khác. Vui lòng kiểm tra lại.',
      en: 'Employee code "{employeeCode}" is already linked to another account. Please check it again.',
    },
  },
  EMAIL_ALREADY_REGISTERED: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Email công việc này đã thuộc về một tài khoản khác. Vui lòng kiểm tra lại.',
      en: 'This work email already belongs to another account. Please check it again.',
    },
  },
  INVALID_SUPERIOR: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Cấp trên đã chọn không hợp lệ hoặc không còn hoạt động.',
      en: 'The selected manager is invalid or no longer active.',
    },
  },
  ROLE_ASSIGNMENT_EXISTS: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Nhân viên đã có vai trò này trên cùng phạm vi trong khoảng thời gian đã chọn. Vui lòng xem lại tab vai trò.',
      en: 'The employee already has this role on the same scope within the chosen period. Please review the roles tab.',
    },
  },
  LOCATION_STAFF_SCOPE_CONFLICT: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Nhân viên điểm chỉ thuộc một địa điểm. Hãy thu hồi vai trò ở địa điểm cũ (UC-IAM-11) trước khi gán địa điểm mới.',
      en: 'A location staff member belongs to a single location. Revoke the role at the old location (UC-IAM-11) before assigning a new one.',
    },
  },

  // -------------------------------------------------------------------------
  ROLE_REQUIRED: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Bạn không có vai trò cần thiết cho phạm vi này (toàn hệ thống hoặc điểm tài sản đang thao tác).',
      en: 'You do not hold a required role for this scope (company-wide or the location in question).',
    },
  },
  SUPER_ADMIN_REQUIRED: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Hành động này chỉ dành cho quản trị tối cao của hệ thống.',
      en: 'This action is restricted to the system super administrator.',
    },
  },
  // ⚠️ Lỗi lập trình, không phải lỗi người dùng — xem chú thích ở `PermissionsGuard`.
  GUARD_ORDER_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messages: {
      vi: 'Cấu hình bảo vệ endpoint sai. Vui lòng báo bộ phận vận hành.',
      en: 'Endpoint protection is misconfigured. Please report this to the operations team.',
    },
  },
  ROLE_NOT_ASSIGNABLE: {
    status: HttpStatus.FORBIDDEN,
    messages: {
      vi: 'Vai trò này không thể cấp từ màn hình thêm nhân viên.',
      en: 'This role cannot be assigned from the employee creation screen.',
    },
  },
  ROLE_NOT_REVOCABLE: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Vai trò này chỉ thu hồi qua quy trình riêng có người chịu trách nhiệm, không thu hồi từ màn hình này.',
      en: 'This role can only be revoked through a dedicated, accountable process, not from this screen.',
    },
  },
  REASON_INVALID: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Lý do đã chọn không còn dùng được cho thao tác gán vai trò.',
      en: 'The selected reason is no longer valid for assigning a role.',
    },
  },

  // -------------------------------------------------------------------------
  DUPLICATE_RECORD: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Dữ liệu này đã tồn tại. Vui lòng dùng giá trị khác.',
      en: 'This record already exists. Please use a different value.',
    },
  },
  SUPPLIER_TAX_ID_TAKEN: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Mã số thuế này đã thuộc về nhà cung cấp "{existingName}". Vui lòng kiểm tra lại.',
      en: 'This tax ID already belongs to supplier "{existingName}". Please check it again.',
    },
  },
  RECORD_VERSION_CONFLICT: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Bản ghi đã được người khác cập nhật. Vui lòng tải lại và thử lại.',
      en: 'This record was updated by someone else. Please reload and try again.',
    },
  },
  SYSTEM_REASON_PROTECTED: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Đây là lý do hệ thống ("Khác"), không sửa hay ngừng được vì mọi nhóm đều cần nó.',
      en: 'This is a system reason ("Other"). It cannot be edited or deactivated because every group needs it.',
    },
  },
  CATALOG_ITEM_IN_USE: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Mục này vẫn đang được dùng nên chưa ngừng được. Vui lòng chuyển các bản ghi đang dùng nó sang mục khác rồi thử lại.',
      en: 'This item is still in use, so it cannot be deactivated yet. Move the records that use it to another item, then try again.',
    },
  },
  REFERENCE_NOT_FOUND: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Dữ liệu tham chiếu không tồn tại hoặc đã ngừng sử dụng.',
      en: 'The referenced record does not exist or is no longer in use.',
    },
  },
  REQUIRED_FIELD_MISSING: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Thiếu thông tin bắt buộc.',
      en: 'A required field is missing.',
    },
  },
  VALUE_OUT_OF_DOMAIN: {
    status: HttpStatus.BAD_REQUEST,
    messages: {
      vi: 'Giá trị không nằm trong danh mục hợp lệ của hệ thống.',
      en: 'The value is outside the set allowed by the system.',
    },
  },
  APPEND_ONLY_TABLE: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Bản ghi này thuộc nhật ký chỉ-ghi-thêm nên không thể sửa hoặc xoá. Mọi điều chỉnh phải là một bản ghi mới có lý do.',
      en: 'This record belongs to an append-only log and cannot be modified or deleted. Any correction must be a new record with a reason.',
    },
  },
  HISTORY_IMMUTABLE: {
    status: HttpStatus.CONFLICT,
    messages: {
      vi: 'Bản ghi lịch sử này không sửa hoặc xoá được; chỉ được đóng hiệu lực một lần, kèm người thực hiện và lý do.',
      en: 'This history record cannot be edited or deleted; it can only be closed once, with the actor and a reason.',
    },
  },
  DATA_ACCESS_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messages: {
      vi: 'Lỗi truy cập dữ liệu. Vui lòng thử lại.',
      en: 'A data access error occurred. Please try again.',
    },
  },
  AUDIT_WRITE_FAILED: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    messages: {
      vi: 'Không ghi được nhật ký cho hành động này nên hành động bị dừng và CHƯA được thực hiện. Vui lòng thử lại; nếu tiếp tục lỗi hãy báo bộ phận vận hành.',
      en: 'The action was stopped because its audit record could not be written, so it did NOT take effect. Please retry; if it persists, contact the operations team.',
    },
  },
} as const satisfies Record<ErrorCode, ErrorDefinition>;

/**
 * Mã lỗi mặc định theo HTTP status, dùng cho exception **không** mang mã.
 *
 * ⚠️ Cần thiết vì `ValidationPipe`, `ThrottlerGuard` và các exception dựng sẵn của Nest ném
 * `HttpException` thuần. Không có bảng này thì phản hồi của chúng thiếu trường `code` — và
 * frontend phải xử lý hai hình dạng lỗi khác nhau, tức sẽ có một hình dạng bị xử lý sai.
 */
export const DEFAULT_CODE_BY_STATUS: Readonly<
  Partial<Record<number, ErrorCode>>
> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_FAILED,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.REQUEST_TIMEOUT]: ErrorCode.REQUEST_TIMEOUT,
  [HttpStatus.CONFLICT]: ErrorCode.DUPLICATE_RECORD,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.INTERNAL_SERVER_ERROR]: ErrorCode.INTERNAL_ERROR,
};

const ERROR_CODE_VALUES: readonly string[] = Object.keys(ERROR_DEFINITIONS);

/** Một chuỗi có phải mã lỗi đã khai hay không. Dùng ở filter — xem `AllExceptionsFilter`. */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && ERROR_CODE_VALUES.includes(value);
}
