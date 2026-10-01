import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequireContext } from '@/auth/decorators/context-permission.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { type AuthRequest } from '@/auth/auth.interface';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import { THROTTLE_WRITE } from '@/common/constants/throttle.const';
import { requireIdempotencyKey } from '@/common/http/idempotency-key';
import { ContextType, Role } from '@/utils/enums/role.enum';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetsService } from './assets.service';

// ⚠️ Quản lý tài sản là vai trò TOÀN HỆ THỐNG (platform): lập hồ sơ cho tài sản ở mọi location.
// Biên dữ liệu theo location chỉ áp ở các UC ĐỌC (AST-07/08) qua AccessScopeService.
@Controller({ path: 'assets', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.ASSET_MANAGER],
  contextType: ContextType.PLATFORM,
})
export class AssetsController {
  constructor(private readonly service: AssetsService) {}

  @Get('create-options')
  async createOptions() {
    return this.service.createOptions();
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  async create(
    @Body() dto: CreateAssetDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.create(dto, requireIdempotencyKey(idempotencyKey), req);
  }
}
