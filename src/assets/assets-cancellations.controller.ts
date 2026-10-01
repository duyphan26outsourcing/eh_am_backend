import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequireContext } from '@/auth/decorators/context-permission.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { type AuthRequest } from '@/auth/auth.interface';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import {
  THROTTLE_SEARCH,
  THROTTLE_WRITE,
} from '@/common/constants/throttle.const';
import { requireIdempotencyKey } from '@/common/http/idempotency-key';
import { ContextType, Role } from '@/utils/enums/role.enum';
import { ListCancellationsQueryDto } from './dto/list-cancellations.dto';
import { DecideAssetCancellationDto } from './dto/decide-asset-cancellation.dto';
import { AssetsService } from './assets.service';

// UC-AST-10: hàng đợi duyệt + quyết định. Quyền duyệt là Quản lý tài sản TOÀN HỆ THỐNG; maker-checker
// (người duyệt ≠ người đề nghị) kiểm trong RPC, không tin client.
@Controller({ path: 'asset-cancellations', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.ASSET_MANAGER],
  contextType: ContextType.PLATFORM,
})
export class AssetCancellationsController {
  constructor(private readonly service: AssetsService) {}

  @Get()
  @Throttle({ default: THROTTLE_SEARCH })
  async list(@Query() query: ListCancellationsQueryDto) {
    return this.service.listCancellations(query);
  }

  // Danh mục lý do TỪ CHỐI (nhóm APPROVAL_REJECT).
  @Get('reject-options')
  async rejectOptions() {
    return this.service.rejectReasonOptions();
  }

  @Post(':id/decision')
  @Throttle({ default: THROTTLE_WRITE })
  async decide(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: DecideAssetCancellationDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.decideCancellation(
      id,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }
}
