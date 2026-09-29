import { SetMetadata } from '@nestjs/common';
import { ContextType, Role } from '@/utils/enums/role.enum';

/**
 * Khai báo vai trò cần có để gọi một route, kèm phạm vi mà vai trò đó phải có.
 *
 * ⚠️ ĐỌC KỸ PHẦN NÀY TRƯỚC KHI DÙNG
 *
 * `PermissionsGuard` **không tạo ra quyền** cho route không có decorator này — nó
 * `return true` và đi tiếp. Nghĩa là: gắn `@UseGuards(JwtAuthGuard, PermissionsGuard)`
 * mà quên `@RequireContext` thì route đó chỉ cần đăng nhập là gọi được, và không có
 * cảnh báo nào.
 *
 * Đó là lựa chọn có chủ ý (guard không được đoán ý), nhưng nó đặt trách nhiệm lên
 * người viết controller. Route nào đọc hoặc ghi dữ liệu tài sản thì phải có decorator này.
 *
 * ```ts
 * // Vai trò toàn hệ thống
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequireContext({ roles: [Role.SYSTEM_ADMIN], contextType: ContextType.PLATFORM })
 * grantRole(...) {}
 *
 * // Vai trò trên đúng location trong URL — HOẶC vai trò toàn hệ thống tương đương
 * @Patch('locations/:locationId/...')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequireContext({
 *   roles: [Role.LOCATION_MANAGER],
 *   contextType: ContextType.LOCATION,
 *   contextParam: 'locationId',
 *   platformRoles: [Role.ASSET_MANAGER],
 * })
 * confirm(...) {}
 * ```
 */

interface PlatformContextRequirement {
  /** Mã vai trò canonical từ `role.enum.ts` — không phải nhãn hiển thị. */
  roles: readonly Role[];
  contextType: typeof ContextType.PLATFORM;
  /**
   * Vai trò toàn hệ thống không gắn với bản ghi nào nên không cần param.
   * Guard tự dùng `PLATFORM_CONTEXT_ID`.
   */
  contextParam?: never;
  platformRoles?: never;
}

interface LocationContextRequirement {
  /** Vai trò phải có **trên đúng location** mang id ở `contextParam`. */
  roles: readonly Role[];
  contextType: typeof ContextType.LOCATION;
  /**
   * Tên param trên URL hoặc field trong body mang id của location.
   *
   * ⚠️ BẮT BUỘC với `LOCATION`. Kiểu ở đây (`contextParam` không optional) làm TypeScript
   * chặn ngay lúc biên dịch nếu quên — nếu để optional thì guard sẽ phải đoán một location
   * nào đó và cấp quyền sai chỗ.
   */
  contextParam: string;
  /**
   * Vai trò **toàn hệ thống** cũng thoả yêu cầu này, với MỌI location.
   *
   * ⚠️ VÌ SAO CẦN — VÀ VÌ SAO PHẢI KHAI TƯỜNG MINH
   *
   * Quản lý tài sản trung tâm làm việc trên mọi cửa hàng; bắt cấp cho họ một dòng
   * `LOCATION_MANAGER` trên từng location là vừa thừa vừa dễ sót khi mở cửa hàng mới. Nhưng
   * một vai trò toàn hệ thống **không** tự động thoả mọi yêu cầu location: route nào chấp
   * nhận nó phải liệt kê ra ở đây, để người review thấy được "ai ngoài cửa hàng cũng làm được
   * việc này".
   */
  platformRoles?: readonly Role[];
}

export type ContextRequirement =
  PlatformContextRequirement | LocationContextRequirement;

export const CONTEXT_PERMISSION_KEY = 'eh:context_permission';

export const RequireContext = (requirement: ContextRequirement) =>
  SetMetadata(CONTEXT_PERMISSION_KEY, requirement);
