import type { Database } from './database.types';

/**
 * Registry tên bảng public duy nhất của backend.
 *
 * ⚠️ VÌ SAO KHÔNG VIẾT THẲNG `'user_profiles'` TRONG REPOSITORY
 *
 * `satisfies Record<string, PublicTableName>` bên dưới buộc mọi giá trị phải tồn tại
 * trong generated `Database` types. Khi một migration đổi tên hoặc xoá bảng,
 * TypeScript báo lỗi ngay **tại file này** — một chỗ, đọc được ngay. Còn nếu mỗi
 * repository tự viết một string rời rạc thì cùng lỗi đó chỉ lộ ra lúc chạy, dưới dạng
 * `relation "..." does not exist` ở một endpoint chẳng liên quan.
 *
 * ⚠️ VÀ TÊN BẢNG PHẢI LÀ **LITERAL** KHI TRUYỀN VÀO `.from()`
 *
 * supabase-js suy kiểu trả về từ chuỗi tên bảng ở thời điểm biên dịch. Truyền một
 * biến kiểu `string` (ví dụ dựng tên bảng bằng template literal) làm kết quả rơi về
 * `any` — mất sạch kiểm kiểu mà không có một cảnh báo nào. Các hằng ở đây là literal
 * nhờ `as const`, nên `.from(UserProfileTableName)` vẫn giữ được kiểu.
 *
 * ⚠️ BẢNG CỦA CÁC MODULE NGHIỆP VỤ (location, tài sản, điều chuyển, …) CHƯA CÓ Ở ĐÂY — chúng
 * được thêm cùng migration của từng module, sau khi mô hình dữ liệu được chốt trong tài liệu
 * sản phẩm (`business/product-docs/`).
 */
export type PublicTableName = keyof Database['public']['Tables'];
export type TableRow<T extends PublicTableName> =
  Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends PublicTableName> =
  Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends PublicTableName> =
  Database['public']['Tables'][T]['Update'];

export const SupabaseTable = {
  AUDIT_EVENTS: 'audit_events',
  CONTEXT_ROLE_ASSIGNMENTS: 'context_role_assignments',
  USER_PROFILES: 'user_profiles',
  // Danh mục nền M02
  COST_CENTERS: 'cost_centers',
  DEPARTMENTS: 'departments',
  LOCATIONS: 'locations',
  REASON_CODES: 'reason_codes',
  ASSET_TYPES: 'asset_types',
  SUPPLIERS: 'suppliers',
  REPAIR_VENDORS: 'repair_vendors',
  ACTIVATION_INVITES: 'activation_invites',
  EMPLOYEE_COMMAND_RECEIPTS: 'employee_command_receipts',
  // Tài sản M03
  ASSETS: 'assets',
  ASSET_COMMAND_RECEIPTS: 'asset_command_receipts',
  ASSET_CANCELLATION_REQUESTS: 'asset_cancellation_requests',
} as const satisfies Record<string, PublicTableName>;

// ---------------------------------------------------------------------------
// Identity
// ---------------------------------------------------------------------------

// Table: user_profiles — hồ sơ người dùng Every Half (1-1 với auth.users)
export const UserProfileTableName = SupabaseTable.USER_PROFILES;

/**
 * Phần hồ sơ mà `JwtAuthGuard` đọc trên **mỗi request**.
 *
 * Cố ý hẹp: guard chỉ cần đủ để trả lời "người này là ai, còn hoạt động không, đọc thông báo
 * bằng ngôn ngữ nào". Select thêm cột là thêm byte trên hot path của toàn bộ API mà không ai
 * dùng tới.
 *
 * ⚠️ VAI TRÒ KHÔNG NẰM Ở ĐÂY. Vai trò có phạm vi (toàn hệ thống / từng location) và có hiệu
 * lực theo thời gian — nó nằm ở `context_role_assignments` và chỉ được tra khi route thật sự
 * cần (`PermissionsGuard`) hoặc khi dựng phạm vi dữ liệu (`AccessScopeService`). Đọc vai trò
 * ở guard xác thực là thêm một truy vấn cho mọi request, kể cả những request không cần quyền.
 */
export interface UserProfileRow {
  id: string;
  display_name: string;
  employee_code: string | null;
  status: string;
  /**
   * Ngôn ngữ hiển thị mà người này chọn — dùng để dịch thông báo lỗi.
   *
   * ⚠️ Có ở đây vì `AllExceptionsFilter` cần nó, và guard đã đọc hồ sơ trên **mỗi** request
   * rồi. Đọc riêng một truy vấn nữa chỉ để lấy ngôn ngữ là thêm một lượt đi-về database trên
   * hot path của toàn bộ API.
   */
  preferred_locale: string;
}

/** Danh sách cột tương ứng `UserProfileRow` — giữ hai chỗ này khớp nhau. */
export const USER_PROFILE_GUARD_COLUMNS =
  'id, display_name, employee_code, status, preferred_locale';

// ---------------------------------------------------------------------------
// Phân quyền theo phạm vi (toàn hệ thống / location)
// ---------------------------------------------------------------------------

// Table: context_role_assignments — chỉ được "đóng hiệu lực", không sửa/xoá
export const ContextRoleAssignmentTableName =
  SupabaseTable.CONTEXT_ROLE_ASSIGNMENTS;

/** Dòng phân quyền tối giản mà guard/scope cần để xét hiệu lực theo thời gian. */
export interface RoleAssignmentRow {
  role_code: string;
  context_type: string;
  context_id: string;
  effective_from: string;
  effective_to: string | null;
}

/** Danh sách cột tương ứng `RoleAssignmentRow` — giữ hai chỗ này khớp nhau. */
export const ROLE_ASSIGNMENT_COLUMNS =
  'role_code, context_type, context_id, effective_from, effective_to';

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

// Table: audit_events — chỉ ghi thêm
export const AuditEventTableName = SupabaseTable.AUDIT_EVENTS;
