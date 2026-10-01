import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Patch,
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
import { UpdateAssetDescriptionDto } from './dto/update-asset-description.dto';
import { RequestAssetCancellationDto } from './dto/request-asset-cancellation.dto';
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

  @Patch(':id/description')
  @Throttle({ default: THROTTLE_WRITE })
  async updateDescription(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAssetDescriptionDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.updateDescription(
      id,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  // UC-AST-09: danh mục lý do đề nghị huỷ (nhóm ASSET_CANCEL).
  @Get(':id/cancellation-options')
  @RequireContext({
    roles: [Role.ASSET_MANAGER, Role.ASSET_ACCOUNTANT],
    contextType: ContextType.PLATFORM,
  })
  async cancellationOptions() {
    return this.service.cancellationReasonOptions();
  }

  // UC-AST-09: Kế toán tài sản cũng được đề nghị → method-level ghi đè vai trò lớp (ASSET_MANAGER).
  @Post(':id/cancellation-request')
  @Throttle({ default: THROTTLE_WRITE })
  @RequireContext({
    roles: [Role.ASSET_MANAGER, Role.ASSET_ACCOUNTANT],
    contextType: ContextType.PLATFORM,
  })
  async requestCancellation(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RequestAssetCancellationDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.requestCancellation(
      id,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }
}
