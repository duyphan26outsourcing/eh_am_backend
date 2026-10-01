import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseUUIDPipe,
  Post,
  Patch,
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
  THROTTLE_EMAIL,
  THROTTLE_SEARCH,
  THROTTLE_WRITE,
} from '@/common/constants/throttle.const';
import { requireIdempotencyKey } from '@/common/http/idempotency-key';
import { ContextType, Role } from '@/utils/enums/role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { GrantRoleAssignmentDto } from './dto/grant-role-assignment.dto';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';
import { RevokeRoleAssignmentDto } from './dto/revoke-role-assignment.dto';
import { ChangeAccountStatusDto } from './dto/change-account-status.dto';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { ChangeEmployeeEmailDto } from './dto/change-employee-email.dto';
import { TerminateEmployeeDto } from './dto/terminate-employee.dto';
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

  @Post(':id/resend-invite')
  @Throttle({ default: THROTTLE_EMAIL })
  async resendInvite(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.resendInvite(
      employeeId,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Get(':id/access')
  @Throttle({ default: THROTTLE_SEARCH })
  async access(@Param('id', new ParseUUIDPipe()) employeeId: string) {
    return this.service.getAccess(employeeId);
  }

  @Post(':id/role-assignments')
  @Throttle({ default: THROTTLE_WRITE })
  async grantRoles(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Body() dto: GrantRoleAssignmentDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.grantRoles(
      employeeId,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Post(':id/role-assignments/:assignmentId/revoke')
  @Throttle({ default: THROTTLE_WRITE })
  async revokeRole(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Param('assignmentId', new ParseUUIDPipe()) assignmentId: string,
    @Body() dto: RevokeRoleAssignmentDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.revokeRole(
      employeeId,
      assignmentId,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Post(':id/account-status')
  @Throttle({ default: THROTTLE_WRITE })
  async changeAccountStatus(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Body() dto: ChangeAccountStatusDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.changeAccountStatus(
      employeeId,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Get(':id/profile')
  @Throttle({ default: THROTTLE_SEARCH })
  async profile(@Param('id', new ParseUUIDPipe()) employeeId: string) {
    return this.service.getProfile(employeeId);
  }

  @Patch(':id/profile')
  @Throttle({ default: THROTTLE_WRITE })
  async updateProfile(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Body() dto: UpdateEmployeeProfileDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.updateProfile(
      employeeId,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Post(':id/change-email')
  @Throttle({ default: THROTTLE_WRITE })
  async changeEmail(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Body() dto: ChangeEmployeeEmailDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.changeEmployeeEmail(
      employeeId,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }

  @Get(':id/termination-preview')
  @Throttle({ default: THROTTLE_SEARCH })
  async terminationPreview(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
  ) {
    return this.service.getTerminationPreview(employeeId);
  }

  @Post(':id/terminate')
  @Throttle({ default: THROTTLE_WRITE })
  async terminate(
    @Param('id', new ParseUUIDPipe()) employeeId: string,
    @Body() dto: TerminateEmployeeDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: AuthRequest,
  ) {
    return this.service.terminateEmployee(
      employeeId,
      dto,
      requireIdempotencyKey(idempotencyKey),
      req,
    );
  }
}
