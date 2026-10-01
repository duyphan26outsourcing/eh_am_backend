/**
 * DANH MỤC MÃ SỰ KIỆN KIỂM TOÁN — EVERY HALF.
 *
 * Brief gốc, nguyên tắc số 1: "Không bao giờ xoá lịch sử. Mọi thay đổi phải lưu: Ai – Khi nào –
 * Thay đổi gì – Trước/Sau – Lý do." Mỗi mã dưới đây là một "thay đổi gì"; `AuditService` lo
 * phần Ai (`actor_id` + `actor_label`), Khi nào (`created_at`), Trước/Sau (`changes`) và Lý do
 * (`reason`).
 *
 * ⚠️ VÌ SAO KHÔNG VIẾT CHUỖI TRỰC TIẾP Ở TỪNG SERVICE
 *
 * `audit_events` là bảng **chỉ ghi thêm** — không sửa, không xoá. Một mã gõ sai
 * (`'asset.asset.creatd'`) sẽ nằm đó mãi mãi, và mọi truy vấn đối chiếu sau này sẽ bỏ sót
 * đúng những dòng đó mà không báo lỗi. Danh mục tập trung là cách duy nhất để compiler bắt
 * được lỗi chính tả trước khi nó thành dữ liệu vĩnh viễn.
 *
 * Quy ước đặt tên: `<domain>.<đối tượng>.<hành động ở thể quá khứ>`.
 * Thể quá khứ vì audit ghi lại việc **đã xảy ra**, không phải ý định.
 */
export const AuditEvent = {
  // -------------------------------------------------------------------------
  // Phiên đăng nhập
  //
  // ⚠️ VÌ SAO GHI CẢ SỰ KIỆN THÀNH CÔNG VÀ THẤT BẠI
  //
  // Chỉ ghi thất bại thì thấy được nỗ lực dò mật khẩu nhưng không thấy được nó có
  // **thành công** hay không — mà đó mới là câu hỏi phải trả lời khi điều tra. Chỉ ghi
  // thành công thì không phát hiện được tấn công đang diễn ra.
  //
  // ⚠️ `AUTH_LOGIN_FAILED` KHÔNG bao giờ ghi mật khẩu, và cũng KHÔNG ghi email vào
  // `metadata`. Email của một lần đăng nhập thất bại có thể là email của người **không**
  // có tài khoản (người khác gõ sai), nên lưu nó là thu thập dữ liệu cá nhân của người
  // ngoài hệ thống vào một bảng không xoá được.
  // -------------------------------------------------------------------------
  AUTH_LOGIN_SUCCEEDED: 'auth.session.login_succeeded',
  AUTH_LOGIN_FAILED: 'auth.session.login_failed',
  AUTH_LOGOUT: 'auth.session.logout',
  AUTH_SESSION_REFRESHED: 'auth.session.refreshed',
  /** Làm mới thất bại — token sai, hết hạn, hoặc đã bị thu hồi. */
  AUTH_SESSION_REFRESH_REJECTED: 'auth.session.refresh_rejected',
  /**
   * Gửi lại email xác nhận đăng ký.
   *
   * ⚠️ Ghi cả khi không biết email có tồn tại. Endpoint đó luôn trả cùng một câu (chống dò
   * danh sách người dùng), nên số lần gọi từ cùng một IP là tín hiệu **duy nhất** phát hiện
   * nó bị dùng để quấy rối hộp thư người khác.
   */
  AUTH_CONFIRMATION_EMAIL_RESENT: 'auth.email.confirmation_resent',
  AUTH_PASSWORD_CHANGED: 'auth.password.changed',
  AUTH_PASSWORD_RESET_REQUESTED: 'auth.password.reset_requested',
  AUTH_PASSWORD_RESET_COMPLETED: 'auth.password.reset_completed',
  /** Thu hồi mọi phiên — do người dùng chủ động. */
  AUTH_ALL_SESSIONS_REVOKED: 'auth.session.all_revoked',

  // -------------------------------------------------------------------------
  // Người dùng & phân quyền
  // -------------------------------------------------------------------------
  IDENTITY_PROFILE_CREATED: 'identity.profile.created',
  IDENTITY_PROFILE_UPDATED: 'identity.profile.updated',
  IDENTITY_PROFILE_EMAIL_CHANGED: 'identity.profile.email_changed',
  IAM_ROLE_GRANTED: 'iam.role.granted',
  IAM_ROLE_REVOKED: 'iam.role.revoked',
  IAM_EMPLOYEE_CREATED: 'iam.employee.created',
  IAM_EMPLOYEE_ACTIVATED: 'iam.employee.activated',
  IAM_ACCOUNT_LOCKED: 'iam.account.locked',
  IAM_ACCOUNT_UNLOCKED: 'iam.account.unlocked',
  IAM_EMPLOYEE_TERMINATED: 'iam.employee.terminated',
  IDENTITY_PROFILE_MANAGER_CHANGED: 'identity.profile.manager_changed',

  // -------------------------------------------------------------------------
  // M02 — Danh mục nền
  // -------------------------------------------------------------------------
  MDM_LOCATION_CREATED: 'mdm.location.created',
  MDM_LOCATION_UPDATED: 'mdm.location.updated',
  MDM_COST_CENTER_CREATED: 'mdm.cost_center.created',
  MDM_COST_CENTER_UPDATED: 'mdm.cost_center.updated',
  MDM_DEPARTMENT_CREATED: 'mdm.department.created',
  MDM_DEPARTMENT_UPDATED: 'mdm.department.updated',
  MDM_REASON_CODE_CREATED: 'mdm.reason_code.created',
  MDM_REASON_CODE_UPDATED: 'mdm.reason_code.updated',
  // Luồng NGỪNG mục danh mục (AC.2). Ngừng phòng ban + đóng location chờ bảng phụ thuộc
  // (user_profiles.department_id / M03) nên chưa có mã ở đây.
  MDM_COST_CENTER_DEACTIVATED: 'mdm.cost_center.deactivated',
  MDM_REASON_CODE_DEACTIVATED: 'mdm.reason_code.deactivated',
  // Cây loại tài sản (UC-MDM-04). Dùng chung cho cả nhóm và loại.
  MDM_ASSET_TYPE_CREATED: 'mdm.asset_type.created',
  MDM_ASSET_TYPE_UPDATED: 'mdm.asset_type.updated',
  MDM_ASSET_TYPE_DEACTIVATED: 'mdm.asset_type.deactivated',

  // -------------------------------------------------------------------------
  // ⏳ NGHIỆP VỤ — MÃ MẪU TẠM THỜI
  //
  // Chỉ để minh hoạ quy ước đặt tên. Danh mục thật của từng module (tài sản, QR & kiểm kê,
  // điều chuyển, bảo trì, thanh lý, khấu hao, đồng bộ FAST…) được chốt SAU khi Master
  // Blueprint được duyệt — thêm vào đây cùng lúc với code của module đó.
  // -------------------------------------------------------------------------
  ASSET_CREATED: 'asset.asset.created',
  ASSET_UPDATED: 'asset.asset.updated',
  ASSET_STATUS_CHANGED: 'asset.asset.status_changed',
} as const;

export type AuditEvent = (typeof AuditEvent)[keyof typeof AuditEvent];

export const AUDIT_EVENT_VALUES = Object.values(AuditEvent);
