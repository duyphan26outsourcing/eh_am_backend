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
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

/**
 * `/v1/master-data/departments` — danh mục phòng ban (F-MDM-08, UC-MDM-08).
 *
 * ⚠️ Quyền: Quản trị hệ thống, phạm vi toàn hệ thống (BR-CMN-03). Tác nhân phụ KHÔNG có (khác
 * location/cost center) — chỉ SYSTEM_ADMIN. Kiểm ở máy chủ; ẩn nút trên UI chỉ là lớp phụ.
 *
 * ⚠️ GĐ này chỉ tạo/sửa tên. Gán trưởng phòng + ngừng (AC.2) chờ UC-IAM-15 / UC-MDM-07 + M03.
 */
@Controller({ path: 'master-data/departments', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN],
  contextType: ContextType.PLATFORM,
})
export class DepartmentsController {
  constructor(private readonly service: DepartmentsService) {}

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
  async create(@Body() dto: CreateDepartmentDto, @Req() req: AuthRequest) {
    return this.service.create(dto, req);
  }

  @Patch(':id')
  @Throttle({ default: THROTTLE_WRITE })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, dto, req);
  }
}
