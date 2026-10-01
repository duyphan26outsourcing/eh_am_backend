import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '@/supabase/supabase.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { EncryptionService } from './encryption.service';
import { AccessScopeService } from './access-scope.service';
import { SupabaseJwtModule } from './supabase-jwt/supabase-jwt.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permission.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { ActivationRepository } from './activation.repository';
import { ActivationService } from './activation.service';

/**
 * `@Global()` để `EncryptionService` và `AccessScopeService` có sẵn ở mọi injector.
 *
 * ⚠️ `AccessScopeService` PHẢI GLOBAL: `PermissionsGuard` inject nó, và khi truyền guard vào
 * `@UseGuards()` thì Nest khởi tạo guard trong injector của **module khai báo controller** —
 * module đó không import `AuthModule`. Không export global thì mọi module nghiệp vụ dùng
 * `PermissionsGuard` sẽ không boot được.
 *
 * ⚠️ NHƯNG `SupabaseJwtModule` **KHÔNG** ĐƯỢC RE-EXPORT TỪ ĐÂY, VÀ ĐÓ LÀ CHỦ Ý.
 *
 * Nếu re-export, mọi module sẽ có `SupabaseJwtService` mà không phải khai gì — nghe tiện,
 * nhưng nó xoá mất tín hiệu "module này có controller cần xác thực". Bắt từng module tự
 * khai `imports: [SupabaseModule, SupabaseJwtModule]` làm phụ thuộc đó hiện ra ngay trong
 * file module, và lỗi thiếu nó xuất hiện lúc boot chứ không phải lúc một request cụ thể
 * chạy qua guard lần đầu.
 */
@Global()
@Module({
  imports: [ConfigModule, SupabaseJwtModule, SupabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    ActivationRepository,
    ActivationService,
    EncryptionService,
    AccessScopeService,
    JwtAuthGuard,
    PermissionsGuard,
    SuperAdminGuard,
  ],
  exports: [
    AuthService,
    EncryptionService,
    AccessScopeService,
    JwtAuthGuard,
    PermissionsGuard,
    SuperAdminGuard,
  ],
})
export class AuthModule {}
