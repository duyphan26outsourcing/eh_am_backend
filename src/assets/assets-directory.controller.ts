import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { type AuthRequest } from '@/auth/auth.interface';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import { THROTTLE_SEARCH } from '@/common/constants/throttle.const';
import { ListAssetsQueryDto } from './dto/list-assets.dto';
import { AssetsService } from './assets.service';

/**
 * Danh sách tài sản (UC-AST-07) — nhiều vai trò dùng (Quản lý tài sản/Kế toán tài sản toàn hệ thống,
 * Quản lý điểm theo location), KHÔNG có location trong URL.
 *
 * ⚠️ VÌ SAO CHỈ `JwtAuthGuard`, KHÔNG `@RequireContext`
 * `PermissionsGuard`/`@RequireContext` không diễn tả được "có vai trò LOCATION trên BẤT KỲ location
 * nào" cho một endpoint danh sách. Theo đúng hướng dẫn ở `access-scope.service.ts`, phân quyền +
 * biên dữ liệu của danh sách nằm ở service qua `AccessScopeService` (phạm vi rỗng → 403, EX.1).
 */
@Controller({ path: 'assets', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard)
export class AssetsDirectoryController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  @Throttle({ default: THROTTLE_SEARCH })
  async list(@Query() query: ListAssetsQueryDto, @Req() req: AuthRequest) {
    return this.service.list(query, req);
  }
}
