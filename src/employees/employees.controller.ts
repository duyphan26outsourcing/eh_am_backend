import {
  Body,
  Controller,
  Get,
  Headers,
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
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';
import { EmployeesService } from './employees.service';

@Controller({ path: 'employees', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN],
  contextType: ContextType.PLATFORM,
})
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get('create-options')
  async createOptions() {
    return this.service.createOptions();
  }

  @Get()
  @Throttle({ default: THROTTLE_SEARCH })
  async list(@Query() query: ListEmployeesQueryDto) {
    return this.service.list(query);
  }

  @Post()
  @Throttle({ default: THROTTLE_WRITE })
  async create(
    @Body() dto: CreateEmployeeDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.create(dto, requireIdempotencyKey(idempotencyKey), req);
  }
}
