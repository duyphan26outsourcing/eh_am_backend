import { Module } from '@nestjs/common';
import { SupabaseAdminService } from './supabase-admin.service';
import { SupabaseAuthService } from './supabase-auth.service';

@Module({
  providers: [SupabaseAdminService, SupabaseAuthService],
  exports: [SupabaseAdminService, SupabaseAuthService],
})
export class SupabaseModule {}
