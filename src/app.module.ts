import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AllExceptionsFilter } from './error/http-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { ApiThrottlerGuard } from './common/guards/api-throttler.guard';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { THROTTLE_DEFAULT } from './common/constants/throttle.const';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { MasterDataModule } from './master-data/master-data.module';

/**
 * ============================================================================
 * BẢN ĐỒ MODULE — EVERY HALF · ASSET MANAGEMENT BACKEND
 * ============================================================================
 *
 * Hai nhóm, và thứ tự import phản ánh sự phụ thuộc:
 *
 *   1. HẠ TẦNG      CommonModule · SupabaseModule · AuthModule · AuditModule
 *                   Đều là `@Global()` vì mọi domain đều dùng.
 *
 *   2. DOMAIN       (chưa làm — dừng ở đây theo kế hoạch, chờ Master Blueprint được duyệt)
 *
 * ⚠️ Danh mục module, phạm vi và thứ tự triển khai nằm ở tài liệu sản phẩm
 *    (`business/product-docs/`). Đừng thêm module vào đây trước khi module tương ứng có đặc
 *    tả đã được khách hàng duyệt — một module không có đặc tả là một module không ai biết khi
 *    nào coi là xong.
 *
 * ⚠️ KHÔNG CÓ `FeatureFlagModule` (cổng pháp lý) như Avantily: Every Half không có tính năng
 *    tài chính cần cổng pháp lý 5 trạng thái. Việc bật/tắt đồng bộ FAST là cấu hình vận hành
 *    có người chịu trách nhiệm — xem `FAST_SYNC_ENABLED` trong `.env.production.example`.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * Giới hạn tần suất mặc định cho toàn bộ API.
     *
     * ⚠️ Đây là mức **mặc định**, không phải mức cho mọi route. Các endpoint nhạy cảm khai
     * mức riêng chặt hơn bằng `@Throttle()`; danh mục các mức nằm ở
     * `common/constants/throttle.const.ts`.
     *
     * ⚠️ Bộ đếm nằm trong **bộ nhớ của từng instance**. Chạy nhiều instance thì giới hạn
     * thực tế là `limit × số instance`. Khi scale ngang phải chuyển sang storage dùng chung
     * (Redis) — nếu không, mọi con số trong `@Throttle()` chỉ còn là hình thức, và đó là
     * loại thoái hoá bảo mật không có triệu chứng nào cho tới khi bị lạm dụng.
     */
    ThrottlerModule.forRoot([THROTTLE_DEFAULT]),

    /**
     * Cần cho các job nền chạy theo lịch (ví dụ dự kiến: chốt khấu hao cuối tháng, đồng bộ và
     * đối chiếu với FAST, nhắc kỳ kiểm kê).
     *
     * ⚠️ Khi chạy NHIỀU INSTANCE, mỗi instance sẽ chạy job một lần. Chốt khấu hao hai lần
     * trong một tháng là hai bút toán khấu hao — nên job có tác dụng phụ PHẢI có khoá phân
     * tán + khoá idempotent theo (kỳ, tài sản) ở tầng dữ liệu trước khi bật.
     */
    ScheduleModule.forRoot(),

    CommonModule,
    SupabaseModule,
    AuthModule,
    AuditModule,

    // Module nghiệp vụ
    MasterDataModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    /**
     * ⚠️ MÃ TƯƠNG QUAN VÀ GHI LOG **KHÔNG** Ở ĐÂY — CHÚNG LÀ MIDDLEWARE
     *
     * Vòng đời NestJS: **middleware → guard → interceptor → pipe → controller**. Guard chạy
     * **trước** interceptor, nên nếu hai việc đó nằm ở interceptor thì mọi phản hồi bị guard
     * từ chối (401, 403, 429) sẽ không có `requestId` và không có dòng log — đúng nhóm phản
     * hồi cần tra nhất.
     *
     * Chúng nằm ở `src/common/middleware/`, đăng ký ở `bootstrap.ts`.
     *
     * `TimeoutInterceptor` thì đúng là interceptor: nó chỉ có nghĩa quanh việc xử lý của
     * handler, và nó cần bọc được luồng `Observable` mà middleware không thấy.
     */
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },

    /**
     * Giới hạn tần suất áp cho **mọi** route, kể cả route mới thêm sau này.
     *
     * ⚠️ VÌ SAO ĐĂNG KÝ TOÀN CỤC CHỨ KHÔNG GẮN TỪNG CONTROLLER
     *
     * Gắn từng chỗ nghĩa là một controller mới quên gắn thì nó **không có giới hạn nào** —
     * và không có gì báo lỗi. Toàn cục thì mặc định là "có bảo vệ", và việc nới lỏng phải làm
     * tường minh bằng `@SkipThrottle()` — thứ hiện lên rõ khi đọc code và khi review.
     *
     * ⚠️ HỆ QUẢ: guard toàn cục chạy TRƯỚC `JwtAuthGuard` của controller, nên ở đây
     * `req.user` luôn rỗng và việc đếm là **theo IP**. Xem §Tracker trong
     * `ApiThrottlerGuard` — đó là hành vi đúng cho lớp này, không phải thiếu sót.
     */
    { provide: APP_GUARD, useClass: ApiThrottlerGuard },

    /**
     * Bộ lọc lỗi toàn cục.
     *
     * ⚠️ ĐĂNG KÝ QUA `APP_FILTER` Ở ĐÂY, KHÔNG QUA `app.useGlobalFilters()` TRONG `main.ts`
     *
     * `AllExceptionsFilter` inject `I18nService` để dịch thông báo lỗi theo ngôn ngữ của người
     * đọc. `app.useGlobalFilters(new AllExceptionsFilter())` tự khởi tạo bằng `new`, nên nó
     * **không đi qua DI** và `this.i18n` sẽ là `undefined` — mọi lỗi trở thành
     * `TypeError: Cannot read properties of undefined` **bên trong bộ lọc lỗi**, tức không có
     * gì bắt được nó và client nhận một 500 rỗng.
     *
     * Đó là loại lỗi tệ nhất có thể xảy ra ở tầng này: nó chỉ xuất hiện khi có lỗi khác, và
     * nó xoá sạch thông tin về lỗi gốc.
     */
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
