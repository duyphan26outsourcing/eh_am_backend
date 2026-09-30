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
import { AssetTypesService } from './asset-types.service';
import {
  CreateAssetTypeDto,
  CreateAssetTypeGroupDto,
  DeactivateAssetTypeDto,
  UpdateAssetTypeDto,
  UpdateAssetTypeGroupDto,
} from './dto/asset-type.dto';

/**
 * `/v1/master-data/asset-types` — cây loại tài sản (F-MDM-04, UC-MDM-04).
 *
 * ⚠️ Quyền: Quản lý tài sản hoặc Quản trị hệ thống, phạm vi toàn hệ thống (BR-CMN-03).
 *
 * ⚠️ Cây HAI CẤP: nhóm (`groups`) và loại tách endpoint riêng vì trường khác nhau. Ngừng dùng
 * chung một endpoint (nhóm hay loại đều `POST :id/deactivate`).
 */
@Controller({ path: 'master-data/asset-types', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.ASSET_MANAGER, Role.SYSTEM_ADMIN],
  contextType: ContextType.PLATFORM,
})
export class AssetTypesController {
  constructor(private readonly service: AssetTypesService) {}

  @Get()
  async list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(200), ParseIntPipe)
    pageSize: number,
    @Query('status') status?: string,
  ) {
    return this.service.list(page, pageSize, status);
  }

  @Post('groups')
  @Throttle({ default: THROTTLE_WRITE })
  async createGroup(
    @Body() dto: CreateAssetTypeGroupDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.createGroup(dto, req);
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  async createType(@Body() dto: CreateAssetTypeDto, @Req() req: AuthRequest) {
    return this.service.createType(dto, req);
  }

  @Patch('groups/:id')
  @Throttle({ default: THROTTLE_WRITE })
  async updateGroup(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetTypeGroupDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.updateGroup(id, dto, req);
  }

  @Patch(':id')
  @Throttle({ default: THROTTLE_WRITE })
  async updateType(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssetTypeDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.updateType(id, dto, req);
  }

  // UC-MDM-04.AC.3: ngừng nhóm hoặc loại (kiểm lý do + "còn dùng" trong RPC).
  @Post(':id/deactivate')
  @Throttle({ default: THROTTLE_WRITE })
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeactivateAssetTypeDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.deactivate(id, dto, req);
  }
}
