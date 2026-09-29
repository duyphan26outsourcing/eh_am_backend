import {
  Logger,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  CONTEXT_PERMISSION_KEY,
  ContextRequirement,
} from '../decorators/context-permission.decorator';
import { AuthRequest } from '../auth.interface';
import { AccessScopeService } from '../access-scope.service';
import { isSuperAdmin, UUID_PATTERN } from '@/utils/utils';
import { ContextType, PLATFORM_CONTEXT_ID } from '@/utils/enums/role.enum';
import type { RoleAssignmentRow } from '@/supabase/supabase.define';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Guard phân quyền theo phạm vi (contextual RBAC).
 *
 * Trả lời đúng một câu hỏi: *"người này có vai trò X trên phạm vi Y (toàn hệ thống, hoặc
 * location trong URL), còn hiệu lực tại thời điểm này, hay không?"*
 *
 * ⚠️ GUARD NÀY KHÔNG XÉT QUY TẮC NGHIỆP VỤ.
 *
 * "Người đề nghị thanh lý không được tự duyệt", "người xuất hàng không tự xác nhận nhận hàng",
 * "chỉ điều chuyển được tài sản đang ở trạng thái cho phép" — đó là quy tắc của từng module,
 * phụ thuộc dữ liệu của bản ghi, và nằm ở service. Guard chung không nên biết chúng.
 *
 * ⚠️ GUARD NÀY CŨNG KHÔNG LỌC DANH SÁCH.
 *
 * Endpoint danh sách không có location trong URL — dùng `AccessScopeService` +
 * `applyLocationScope()` ở repository. Xem chú thích đầu `access-scope.service.ts`.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly accessScope: AccessScopeService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const user = req.user;

    if (!user?.sub) {
      // ⚠️ Lỗi LẬP TRÌNH, không phải lỗi người dùng: endpoint khai `PermissionsGuard`
      // mà thiếu `JwtAuthGuard` đứng trước. Trả 500 để nó lộ ra trong log lỗi thay vì
      // trông như một lần từ chối quyền bình thường.
      throw new AppException(ErrorCode.GUARD_ORDER_ERROR);
    }

    const requirement = this.reflector.getAllAndOverride<ContextRequirement>(
      CONTEXT_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Route không khai `@RequireContext` thì guard KHÔNG tạo ra quyền giả — nó đi tiếp.
    // Xem cảnh báo trong `context-permission.decorator.ts` về trách nhiệm đi kèm.
    if (!requirement || requirement.roles.length === 0) {
      return true;
    }

    // Quản trị tối cao đi xuyên mọi phạm vi (break-glass) — xem `isSuperAdmin()`.
    if (isSuperAdmin(user)) {
      req.contextRoles = ['SUPER_ADMIN'];
      return true;
    }

    const assignments = await this.loadMatchingAssignments(
      req,
      user.sub,
      requirement,
    );

    if (assignments.length === 0) {
      // ⚠️ KHÔNG đưa danh sách vai trò cần thiết vào thông báo. Nó tiết lộ cấu trúc phân
      // quyền nội bộ cho một người vừa bị từ chối — tức đúng người không nên biết. Danh
      // sách đó ghi vào log để đội vận hành tra.
      this.logger.debug(
        `Từ chối: cần một trong [${requirement.roles.join(', ')}] trên ${requirement.contextType}`,
      );
      throw new AppException(ErrorCode.ROLE_REQUIRED);
    }

    // Chuyển tiếp vai trò đã resolve để service không phải truy vấn lại.
    req.contextRoles = assignments.map((r) => r.role_code);
    return true;
  }

  /**
   * Các dòng phân quyền còn hiệu lực thoả yêu cầu của route.
   *
   * ⚠️ Lọc theo CẢ `subject_type` VÀ `subject_id` (bên trong `findActiveAssignments`). Gộp
   * nhiều loại chủ thể vào một `.in('subject_id', [...])` là chỗ hỏng thật khi schema mở rộng
   * thêm loại chủ thể: hai bảng có thể có UUID trùng, và một bên thừa hưởng quyền của bên kia.
   */
  private async loadMatchingAssignments(
    req: AuthRequest,
    userId: string,
    requirement: ContextRequirement,
  ): Promise<RoleAssignmentRow[]> {
    if (requirement.contextType === ContextType.PLATFORM) {
      return this.accessScope.findActiveAssignments(userId, {
        contextType: ContextType.PLATFORM,
        contextId: PLATFORM_CONTEXT_ID,
        roles: requirement.roles,
      });
    }

    const locationId = this.resolveLocationId(req, requirement.contextParam);

    const lookups: Array<Promise<RoleAssignmentRow[]>> = [
      this.accessScope.findActiveAssignments(userId, {
        contextType: ContextType.LOCATION,
        contextId: locationId,
        roles: requirement.roles,
      }),
    ];

    // Vai trò toàn hệ thống mà route cho phép thay thế — xem `platformRoles` ở decorator.
    if (requirement.platformRoles?.length) {
      lookups.push(
        this.accessScope.findActiveAssignments(userId, {
          contextType: ContextType.PLATFORM,
          contextId: PLATFORM_CONTEXT_ID,
          roles: requirement.platformRoles,
        }),
      );
    }

    return (await Promise.all(lookups)).flat();
  }

  /**
   * Lấy id location từ URL param hoặc body.
   *
   * ⚠️ Giá trị này do CLIENT gửi, nên nó chỉ được dùng để **tra** vai trò, không bao giờ
   * được tin là "location hợp lệ". Việc location đó có tồn tại, và tài nguyên đang thao tác có
   * thật sự thuộc location đó hay không, là việc của service — guard chỉ trả lời được "người
   * này có vai trò trên đúng id đó không".
   *
   * ⚠️ VÌ SAO SERVICE VẪN PHẢI KIỂM LẠI
   *
   * `PATCH /locations/:locationId/assets/:assetId` — guard chỉ thấy `locationId`. Nếu service
   * không kiểm `asset.location_id === locationId` thì quản lý cửa hàng A gửi `locationId` của A
   * kèm `assetId` của cửa hàng B là sửa được tài sản của B.
   */
  private resolveLocationId(req: AuthRequest, paramKey: string): string {
    const body: unknown = req.body;
    const bodyValue =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)[paramKey]
        : undefined;

    const candidate = req.params[paramKey] ?? bodyValue;
    const locationId = typeof candidate === 'string' ? candidate : '';

    if (!locationId) {
      // ⚠️ Lỗi lập trình: `@RequireContext` khai `contextParam: 'x'` mà route không có `:x`
      // (và body cũng không có). Trả 500, không trả 403 — 403 làm nó trông như lỗi quyền của
      // người dùng và không ai đi sửa cấu hình.
      throw new AppException(ErrorCode.GUARD_ORDER_ERROR);
    }

    // Guard chạy TRƯỚC `ValidationPipe`, nên giá trị ở đây chưa được DTO kiểm. Chặn chuỗi
    // không phải UUID ngay tại đây: để nó xuống Postgres là nhận `22P02` ở tận đáy.
    if (!UUID_PATTERN.test(locationId)) {
      throw new AppException(ErrorCode.INVALID_REFERENCE_ID);
    }

    return locationId;
  }
}
