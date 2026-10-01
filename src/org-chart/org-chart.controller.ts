import { Controller, Get, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequireContext } from '@/auth/decorators/context-permission.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import { THROTTLE_SEARCH } from '@/common/constants/throttle.const';
import { ContextType, Role } from '@/utils/enums/role.enum';
import { OrgChartService } from './org-chart.service';

@Controller({ path: 'org-chart', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.SYSTEM_ADMIN, Role.EXECUTIVE],
  contextType: ContextType.PLATFORM,
})
export class OrgChartController {
  constructor(private readonly service: OrgChartService) {}

  @Get()
  @Throttle({ default: THROTTLE_SEARCH })
  async getChart() {
    return this.service.getChart();
  }
}
