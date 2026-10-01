import { Module } from '@nestjs/common';
import { SupabaseModule } from '@/supabase/supabase.module';
import { SupabaseJwtModule } from '@/auth/supabase-jwt/supabase-jwt.module';
import { AssetsController } from './assets.controller';
import { AssetsDirectoryController } from './assets-directory.controller';
import { AssetsRepository } from './assets.repository';
import { AssetsService } from './assets.service';

@Module({
  imports: [SupabaseModule, SupabaseJwtModule],
  controllers: [AssetsController, AssetsDirectoryController],
  providers: [AssetsRepository, AssetsService],
})
export class AssetsModule {}
