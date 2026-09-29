import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseJwtService } from './supabase-jwt.service';

/**
 * ⚠️ MODULE NÀY KHÔNG `@Global()` — VÀ ĐÓ LÀ NGUỒN CỦA MỘT LỖI HAY GẶP.
 *
 * Khi truyền một class vào `@UseGuards()`, Nest khởi tạo guard đó **trong injector của
 * module khai báo controller**, không dùng lại instance đã tạo ở `AuthModule`. Nên mọi
 * module có controller dùng `JwtAuthGuard` phải tự import cặp:
 *
 *     imports: [SupabaseModule, SupabaseJwtModule]
 *
 * Thiếu nó thì ứng dụng **không boot được** với lỗi
 * `Nest can't resolve dependencies of the JwtAuthGuard`.
 *
 * ⚠️ Và `npm run build`, ESLint, unit test đều KHÔNG bắt được lỗi này: không có phép
 * kiểm tĩnh nào dựng đồ thị DI thật, còn unit test thì dùng repository giả nên không
 * đi qua guard. Nó chỉ lộ ra khi chạy `npm run start:dev`.
 */
@Module({
  imports: [ConfigModule],
  providers: [SupabaseJwtService],
  exports: [SupabaseJwtService],
})
export class SupabaseJwtModule {}
