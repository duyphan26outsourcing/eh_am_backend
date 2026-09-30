import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import { THROTTLE_WRITE } from '@/common/constants/throttle.const';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { RequireContext } from '@/auth/decorators/context-permission.decorator';
import { ContextType, Role } from '@/utils/enums/role.enum';
import { type AuthRequest } from '@/auth/auth.interface';
import { ReasonCodesService } from './reason-codes.service';
import {
  CreateReasonCodeDto,
  DeactivateReasonCodeDto,
  UpdateReasonCodeDto,
} from './dto/reason-code.dto';

/**
 * `/v1/master-data/reason-codes` — danh mục lý do (F-MDM-07, UC-MDM-07).
 *
 * ⚠️ Quyền: chỉ Quản trị hệ thống (UC không có tác nhân phụ). Kiểm ở máy chủ.
 *
 * ⚠️ GĐ này: tạo + sửa tên (label). Ngừng lý do (AC.2) chờ nhóm 'CATALOG_DEACTIVATE' (chưa có
 * trong schema — xem README của UC). Mục 'Khác' (is_freetext) không sửa/ngừng (EX.3).
 */
@Controller({ path: 'master-data/reason-codes', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN],
  contextType: ContextType.PLATFORM,
})
export class ReasonCodesController {
  constructor(private readonly service: ReasonCodesService) {}

  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(50), ParseIntPipe) pageSize: number,
    @Query('reasonGroup') reasonGroup?: string,
    @Query('status') status?: string,
  ) {
    return this.service.list(page, pageSize, reasonGroup, status);
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  async create(@Body() dto: CreateReasonCodeDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req);
  }

  @Patch(':id')
  @Throttle({ default: THROTTLE_WRITE })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReasonCodeDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, dto, req);
  }

  // UC-MDM-07.AC.2: ngừng lý do (chặn mục 'Khác', lý do ngừng từ nhóm CATALOG_DEACTIVATE).
  @Post(':id/deactivate')
  @Throttle({ default: THROTTLE_WRITE })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeactivateReasonCodeDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.deactivate(id, dto, req);
  }
}
