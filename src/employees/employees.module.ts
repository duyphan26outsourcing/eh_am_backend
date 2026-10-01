import { Module } from '@nestjs/common';
import { SupabaseModule } from '@/supabase/supabase.module';
import { SupabaseJwtModule } from '@/auth/supabase-jwt/supabase-jwt.module';
import { EmployeesController } from './employees.controller';
import { EmployeesRepository } from './employees.repository';
import { EmployeesService } from './employees.service';

@Module({
  imports: [SupabaseModule, SupabaseJwtModule],
  controllers: [EmployeesController],
  providers: [EmployeesRepository, EmployeesService],
})
export class EmployeesModule {}
