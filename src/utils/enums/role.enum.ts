/**
 * DANH MỤC VAI TRÒ THEO PHẠM VI (Contextual Role Catalog) — EVERY HALF.
 *
 * Brief gốc: "Phân quyền chặt chẽ: Phân quyền theo vai trò **và** theo location." Hai trục
 * đó là hai cột của cùng một bảng: `role_code` (vai trò) × `context_type/context_id` (phạm
 * vi: toàn hệ thống, hoặc một location cụ thể).
 *
 * ⚠️ VÌ SAO DANH MỤC NÀY Ở TRONG CODE, KHÔNG Ở TRONG DATABASE
 *
 * `context_role_assignments.role_code` là cột TEXT — không có bảng danh mục nào ràng buộc nó
 * ở tầng database. Nếu để frontend tự nhập hoặc hard-code thì mỗi màn hình sẽ gọi một tên
 * khác nhau cho cùng một quyền, và không ai biết danh sách thật gồm những gì.
 *
 * Mã vai trò là **khoá bảo mật**: nó phải bất biến, phải review được qua git, và không được
 * là dữ liệu ai cũng thêm được bằng một câu INSERT. Đây là registry tập trung đó.
 *
 * ⚠️ THÊM MÃ MỚI THÌ THÊM VÀO ĐÂY. KHÔNG ĐỔI VÀ KHÔNG TÁI DÙNG MÃ ĐÃ CÓ DỮ LIỆU.
 * Mã cũ còn nằm trong `audit_events` và trong các dòng phân quyền đã hết hiệu lực —
 * tái dùng một mã làm lịch sử đọc lại sai nghĩa.
 *
 * ⏳ TRẠNG THÁI: DANH MỤC TẠM THỜI — chỉ đủ để hạ tầng phân quyền (guard, bootstrap admin, test)
 * chạy được. Danh mục vai trò thật (và ma trận quyền theo từng module) được chốt trong Master
 * Blueprint, sau khi Every Half xác nhận sơ đồ tổ chức. Đổi danh mục TRƯỚC khi có dữ liệu thật
 * thì rẻ; đổi sau đó là một migration dữ liệu phân quyền.
 */

/**
 * Phạm vi mà một vai trò có hiệu lực.
 *
 * `PLATFORM` không trỏ tới bản ghi nghiệp vụ nào, nên `context_id` dùng hằng
 * `PLATFORM_CONTEXT_ID` bên dưới. `LOCATION` trỏ tới id của một location (cửa hàng, kho,
 * xưởng rang, văn phòng) — bảng location thuộc module danh mục nền, chưa có ở giai đoạn này.
 */
export const ContextType = {
  PLATFORM: 'PLATFORM',
  LOCATION: 'LOCATION',
} as const;

export type ContextType = (typeof ContextType)[keyof typeof ContextType];

/**
 * Loại chủ thể nhận vai trò.
 *
 * Every Half chỉ có `USER`. Cột `subject_type` vẫn được giữ trong schema (CHECK chỉ cho
 * `USER`) để khi cần gán vai trò cho một nhóm/phòng ban thì mở rộng CHECK, không phải đổi cấu
 * trúc bảng — và để `PermissionsGuard` giữ đúng kỷ luật "luôn lọc theo cả `subject_type` lẫn
 * `subject_id`" kế thừa từ codebase gốc.
 */
export const SubjectType = {
  USER: 'USER',
} as const;

export type SubjectType = (typeof SubjectType)[keyof typeof SubjectType];

/**
 * `context_id` dùng cho vai trò toàn hệ thống.
 *
 * ⚠️ Cột `context_id` là `uuid NOT NULL`, nên vai trò toàn hệ thống vẫn cần một giá trị.
 * Dùng UUID nil (toàn số 0) thay vì cho phép NULL: NULL trong khoá tổ hợp của unique index
 * làm Postgres coi mỗi dòng là khác nhau (NULL != NULL), tức ràng buộc chống cấp trùng vai
 * trò sẽ không còn tác dụng ở đúng nhóm vai trò quan trọng nhất.
 */
export const PLATFORM_CONTEXT_ID = '00000000-0000-0000-0000-000000000000';

/**
 * Giá trị của `app_metadata.role` trong JWT cho quản trị tối cao (break-glass).
 *
 * Đây là vai trò DUY NHẤT không đọc từ `context_role_assignments` — xem `isSuperAdmin()`
 * trong `utils.ts` để biết vì sao.
 */
export const SUPER_ADMIN_METADATA_ROLE = 'admin';

export const Role = {
  // Toàn hệ thống
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  EXECUTIVE: 'EXECUTIVE',
  CHIEF_ACCOUNTANT: 'CHIEF_ACCOUNTANT',
  ASSET_ACCOUNTANT: 'ASSET_ACCOUNTANT',
  ASSET_MANAGER: 'ASSET_MANAGER',
  TECHNICIAN: 'TECHNICIAN',
  AUDITOR: 'AUDITOR',
  // Theo location
  LOCATION_MANAGER: 'LOCATION_MANAGER',
  LOCATION_STAFF: 'LOCATION_STAFF',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface RoleCatalogItem {
  code: Role;
  nameVi: string;
  nameEn: string;
  contextType: ContextType;
  descriptionVi: string;
  /**
   * `false` nghĩa là vai trò này chỉ được cấp bằng quy trình riêng (script bootstrap có người
   * chịu trách nhiệm), không cấp được qua màn hình phân quyền chung.
   */
  assignable: boolean;
}

export const ROLE_CATALOG: readonly RoleCatalogItem[] = [
  {
    code: Role.SYSTEM_ADMIN,
    nameVi: 'Quản trị hệ thống',
    nameEn: 'System Administrator',
    contextType: ContextType.PLATFORM,
    descriptionVi:
      'Quản lý người dùng, cấp/thu hồi vai trò, danh mục nền và cấu hình. Chỉ cấp qua sql-docs/admin-set.sql.',
    assignable: false,
  },
  {
    code: Role.EXECUTIVE,
    nameVi: 'Ban giám đốc',
    nameEn: 'Executive',
    contextType: ContextType.PLATFORM,
    descriptionVi:
      'Xem tổng quan toàn hệ thống và thực hiện các bước duyệt theo thẩm quyền.',
    assignable: true,
  },
  {
    code: Role.CHIEF_ACCOUNTANT,
    nameVi: 'Kế toán trưởng',
    nameEn: 'Chief Accountant',
    contextType: ContextType.PLATFORM,
    descriptionVi:
      'Phê duyệt chính sách và điều chỉnh thông tin kế toán tài sản.',
    assignable: true,
  },
  {
    code: Role.ASSET_ACCOUNTANT,
    nameVi: 'Kế toán tài sản',
    nameEn: 'Asset Accountant',
    contextType: ContextType.PLATFORM,
    descriptionVi:
      'Quản lý nguyên giá, hoá đơn, chứng từ và ghi nhận nghiệp vụ kế toán tài sản.',
    assignable: true,
  },
  {
    code: Role.ASSET_MANAGER,
    nameVi: 'Quản lý tài sản',
    nameEn: 'Asset Manager',
    contextType: ContextType.PLATFORM,
    descriptionVi: 'Quản lý nghiệp vụ tài sản trên mọi location.',
    assignable: true,
  },
  {
    code: Role.LOCATION_MANAGER,
    nameVi: 'Quản lý điểm',
    nameEn: 'Location Manager',
    contextType: ContextType.LOCATION,
    descriptionVi:
      'Chịu trách nhiệm tài sản tại một location (cửa hàng, kho, xưởng rang, văn phòng).',
    assignable: true,
  },
  {
    code: Role.LOCATION_STAFF,
    nameVi: 'Nhân viên điểm',
    nameEn: 'Location Staff',
    contextType: ContextType.LOCATION,
    descriptionVi: 'Nhân viên làm việc tại một location.',
    assignable: true,
  },
  {
    code: Role.TECHNICIAN,
    nameVi: 'Kỹ thuật viên',
    nameEn: 'Technician',
    contextType: ContextType.PLATFORM,
    descriptionVi:
      'Tiếp nhận yêu cầu sửa chữa và cập nhật tiến độ, kết quả xử lý.',
    assignable: true,
  },
  {
    code: Role.AUDITOR,
    nameVi: 'Kiểm soát nội bộ',
    nameEn: 'Internal Auditor',
    contextType: ContextType.PLATFORM,
    descriptionVi: 'Tra cứu nhật ký và báo cáo ở chế độ chỉ đọc.',
    assignable: true,
  },
];

export const ROLE_CODES: readonly Role[] = ROLE_CATALOG.map((r) => r.code);

export function findRole(code: string): RoleCatalogItem | undefined {
  return ROLE_CATALOG.find((r) => r.code === code);
}
