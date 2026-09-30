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
import { LocationsService } from './locations.service';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';

/**
 * `/v1/master-data/locations` — danh mục location (F-MDM-01, UC-MDM-01).
 *
 * ⚠️ Quyền: Quản trị hệ thống hoặc Quản lý tài sản, phạm vi toàn hệ thống (BR-CMN-03). Kiểm ở
 * máy chủ bằng `PermissionsGuard` + `@RequireContext`; ẩn nút trên UI chỉ là lớp phụ.
 */
@Controller({ path: 'master-data/locations', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN, Role.ASSET_MANAGER],
  contextType: ContextType.PLATFORM,
})
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    return this.service.list(page, pageSize);
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  async create(@Body() dto: CreateLocationDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req);
  }

  @Patch(':id')
  @Throttle({ default: THROTTLE_WRITE })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLocationDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, dto, req);
  }
}
