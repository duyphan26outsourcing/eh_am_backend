import { Module } from '@nestjs/common';
import { SupabaseModule } from '@/supabase/supabase.module';
import { SupabaseJwtModule } from '@/auth/supabase-jwt/supabase-jwt.module';
import { AssetsController } from './assets.controller';
import { AssetsDirectoryController } from './assets-directory.controller';
import { AssetCancellationsController } from './assets-cancellations.controller';
import { AssetDocumentsController } from './assets-documents.controller';
import { AssetsRepository } from './assets.repository';
import { AssetsService } from './assets.service';
import { AssetStorageService } from './asset-storage.service';
import { AssetDocumentsService } from './asset-documents.service';

@Module({
  imports: [SupabaseModule, SupabaseJwtModule],
  controllers: [
    AssetsController,
    AssetsDirectoryController,
    AssetCancellationsController,
    AssetDocumentsController,
  ],
  providers: [
    AssetsRepository,
    AssetsService,
    AssetStorageService,
    AssetDocumentsService,
  ],
})
export class AssetsModule {}
