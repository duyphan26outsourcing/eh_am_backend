import { Global, Module } from '@nestjs/common';
import { I18nService } from './i18n/i18n.service';

/**
 * ============================================================================
 * COMMON MODULE
 * ============================================================================
 *
 * ⚠️ CHỈ CÓ MỘT PROVIDER, VÀ ĐÓ LÀ CHỦ Ý
 *
 * `I18nService` là provider duy nhất ở đây. Nó cần DI vì `AllExceptionsFilter` inject nó, và
 * `@Global()` để không phải khai `imports: [CommonModule]` ở từng domain module.
 *
 * Phần còn lại của `src/common/` là class thuần, hàm thuần, hằng số hoặc lớp abstract —
 * **không** cái nào cần provider:
 *
 *   · `dto/`         — class thuần, `ValidationPipe` khởi tạo, không qua DI
 *   · `interfaces/`  — kiểu và hàm thuần (`paginated`, `rangeOf`)
 *   · `constants/`   — hằng số
 *   · `repository/`  — lớp **abstract**, không đăng ký được như provider
 *   · `interceptors/`, `guards/` — đăng ký ở `bootstrap.ts` / `app.module.ts` bằng
 *                       `APP_INTERCEPTOR` / `APP_GUARD`, không export từ đây
 *
 * Vậy tại sao vẫn giữ file này? Vì hai lý do, và cả hai đều là để chống một loại lỗi cụ thể:
 *
 *   1. **Chỗ đặt cho provider dùng chung thật sự sau này.** Ví dụ đã thấy trước:
 *      `StorageService` (ký URL cho Supabase Storage — ảnh tài sản, ảnh kiểm kê, hoá đơn),
 *      `SearchService` (chuẩn hoá từ khoá tiếng Việt khi tìm tài sản), `IdempotencyService`
 *      (khoá chống ghi trùng cho lượt quét QR gửi lại khi mạng cửa hàng chập chờn). Khi cái
 *      đầu tiên xuất hiện, nó có chỗ rõ ràng để vào — thay vì bị nhét vào `AuthModule` chỉ vì
 *      `AuthModule` là `@Global()` và "tiện".
 *
 *   2. **Ranh giới đọc được.** Có `common.module.ts` là có câu trả lời cho "cái gì là dùng
 *      chung": thứ nào ở `src/common/` thì dùng chung, thứ nào ở `src/<domain>/` thì không.
 *      Không có ranh giới đó, `utils.ts` sẽ phình ra thành nơi chứa mọi thứ không biết đặt
 *      đâu — và một file như vậy thì không ai dám sửa.
 *
 * ⚠️ ĐIỀU KHÔNG ĐƯỢC ĐẶT VÀO ĐÂY
 *
 *   ❌ Logic nghiệp vụ của bất kỳ domain nào. Nếu một service chỉ có một domain gọi, nó
 *      thuộc domain đó — kể cả khi tên nó nghe có vẻ chung (ví dụ bộ tính khấu hao thuộc
 *      module khấu hao, dù dashboard cũng hiển thị số khấu hao).
 *   ❌ Truy cập bảng cụ thể. `AssetRepository` không phải thứ dùng chung dù nó kế thừa
 *      `BaseRepository`.
 *   ❌ Cấu hình. `ConfigModule` đã `isGlobal: true`.
 *
 * `@Global()` để domain module không phải import lại. Với một module chỉ chứa hạ tầng
 * ngang, việc bắt mọi domain khai `imports: [CommonModule]` là những dòng nhiễu không đổi lấy
 * bất kỳ sự tách biệt nào.
 */
@Global()
@Module({
  providers: [I18nService],
  exports: [I18nService],
})
export class CommonModule {}
