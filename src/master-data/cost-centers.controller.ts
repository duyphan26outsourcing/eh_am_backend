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
import { CostCentersService } from './cost-centers.service';
import {
  CreateCostCenterDto,
  DeactivateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-center.dto';

/**
 * `/v1/master-data/cost-centers` — danh mục cost center (F-MDM-03, UC-MDM-03).
 *
 * ⚠️ Quyền: Quản trị hệ thống hoặc Quản lý tài sản, phạm vi toàn hệ thống (BR-CMN-03). Kiểm ở
 * máy chủ bằng `PermissionsGuard` + `@RequireContext`; ẩn nút trên UI chỉ là lớp phụ.
 *
 * ⚠️ GĐ này chỉ có tạo mới + sửa tên (luồng chính + AC.1). Ngừng cost center (AC.2) + kiểm "còn
 * được dùng" (EX.3) chờ danh mục lý do (UC-MDM-07) và bảng tài sản (M03).
 */
@Controller({ path: 'master-data/cost-centers', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN, Role.ASSET_MANAGER],
  contextType: ContextType.PLATFORM,
})
export class CostCentersController {
  constructor(private readonly service: CostCentersService) {}

  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('status') status?: string,
  ) {
    return this.service.list(page, pageSize, status);
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  async create(@Body() dto: CreateCostCenterDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req);
  }

  @Patch(':id')
  @Throttle({ default: THROTTLE_WRITE })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCostCenterDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, dto, req);
  }

  // UC-MDM-03.AC.2: ngừng cost center (lý do bắt buộc, kiểm "còn dùng" trong RPC).
  @Post(':id/deactivate')
  @Throttle({ default: THROTTLE_WRITE })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeactivateCostCenterDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.deactivate(id, dto, req);
  }
}
