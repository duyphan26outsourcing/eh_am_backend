import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from '../types';
import { isSuperAdmin } from '@/utils/utils';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Chỉ quản trị tối cao (break-glass, `app_metadata.role = 'admin'`) qua được.
 *
 * Dùng cho số ít thao tác cứu hộ hệ thống. Nghiệp vụ hằng ngày KHÔNG dùng guard này — dùng
 * `PermissionsGuard` + vai trò trong `context_role_assignments`, để quyền có phạm vi, có thời
 * hạn và có dấu vết cấp/thu hồi.
 *
 * ⚠️ PHẢI ĐẶT SAU `JwtAuthGuard` TRONG `@UseGuards(...)`.
 *
 * Guard này đọc `req.user` do `JwtAuthGuard` gán. Nest chạy guard theo đúng thứ tự
 * khai báo, nên đặt ngược lại (`@UseGuards(SuperAdminGuard, JwtAuthGuard)`) sẽ làm
 * nó thấy `req.user` là `undefined` và ném lỗi cấu hình cho **mọi** người — kể cả admin thật.
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const user: JwtPayload | undefined = req.user;

    if (!user) {
      throw new AppException(ErrorCode.GUARD_ORDER_ERROR);
    }

    if (!isSuperAdmin(user)) {
      throw new AppException(ErrorCode.SUPER_ADMIN_REQUIRED);
    }

    return true;
  }
}
