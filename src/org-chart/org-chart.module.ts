import { Module } from '@nestjs/common';
import { SupabaseJwtModule } from '@/auth/supabase-jwt/supabase-jwt.module';
import { SupabaseModule } from '@/supabase/supabase.module';
import { OrgChartController } from './org-chart.controller';
import { OrgChartRepository } from './org-chart.repository';
import { OrgChartService } from './org-chart.service';

@Module({
  imports: [SupabaseModule, SupabaseJwtModule],
  controllers: [OrgChartController],
  providers: [OrgChartRepository, OrgChartService],
})
export class OrgChartModule {}
