import {
  Controller,
  Body,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { type AuthRequest } from '@/auth/auth.interface';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import {
  THROTTLE_SEARCH,
  THROTTLE_WRITE,
} from '@/common/constants/throttle.const';
import { requireIdempotencyKey } from '@/common/http/idempotency-key';
import { ListAssetsQueryDto } from './dto/list-assets.dto';
import { ChangeAssetResponsibleDto } from './dto/change-asset-responsible.dto';
import { SetAssetLifecycleDto } from './dto/set-asset-lifecycle.dto';
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

  @Get(':id')
  async detail(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.service.detail(id, req);
  }

  @Get(':id/responsibility-options')
  async responsibilityOptions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.service.responsibilityOptions(id, req);
  }

  @Patch(':id/responsible')
  @Throttle({ default: THROTTLE_WRITE })
  async changeResponsible(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ChangeAssetResponsibleDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.changeResponsible(
      id,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Get(':id/lifecycle-options')
  async lifecycleOptions(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: AuthRequest,
  ) {
    return this.service.lifecycleOptions(id, req);
  }

  @Patch(':id/lifecycle')
  @Throttle({ default: THROTTLE_WRITE })
  async changeLifecycle(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: SetAssetLifecycleDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.changeLifecycle(
      id,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }
}
