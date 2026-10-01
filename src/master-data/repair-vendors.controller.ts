import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Headers,
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
import { type AuthRequest } from '@/auth/auth.interface';
import { RequireContext } from '@/auth/decorators/context-permission.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import { THROTTLE_WRITE } from '@/common/constants/throttle.const';
import { requireIdempotencyKey } from '@/common/http/idempotency-key';
import { ContextType, Role } from '@/utils/enums/role.enum';
import {
  CreateRepairVendorDto,
  DeactivateRepairVendorDto,
  UpdateRepairVendorDto,
} from './dto/repair-vendor.dto';
import { RepairVendorsService } from './repair-vendors.service';

@Controller({ path: 'master-data/repair-vendors', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN, Role.ASSET_MANAGER],
  contextType: ContextType.PLATFORM,
})
export class RepairVendorsController {
  constructor(private readonly service: RepairVendorsService) {}

  @Get()
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('status') status?: string,
    @Query('query') query?: string,
  ) {
    return this.service.list(page, pageSize, status, query);
  }

  @Get('available-locations')
  availableLocations(@Query('repairVendorId') repairVendorId?: string) {
    return this.service.availableLocations(repairVendorId);
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  create(
    @Body() dto: CreateRepairVendorDto,
    @Headers('idempotency-key') commandKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.create(dto, requireIdempotencyKey(commandKey), req);
  }

  @Patch(':id')
  @Throttle({ default: THROTTLE_WRITE })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRepairVendorDto,
    @Headers('idempotency-key') commandKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.update(id, dto, requireIdempotencyKey(commandKey), req);
  }

  @Post(':id/deactivate')
  @Throttle({ default: THROTTLE_WRITE })
  deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeactivateRepairVendorDto,
    @Headers('idempotency-key') commandKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.deactivate(
      id,
      dto,
      requireIdempotencyKey(commandKey),
      req,
    );
  }
}
