import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import {
  Observable,
  TimeoutError,
  catchError,
  throwError,
  timeout,
} from 'rxjs';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Thời gian tối đa cho một request. Vượt → 408.
 *
 * 25 giây: dưới ngưỡng mặc định của phần lớn reverse proxy (thường 30s hoặc 60s), để
 * **backend là bên trả lỗi** chứ không phải proxy. Khác biệt quan trọng: khi proxy cắt,
 * client nhận 504 kèm trang HTML của proxy, và backend không có dòng log nào — nên không
 * biết endpoint nào chậm. Khi backend cắt, có 408 dạng JSON đúng contract và có log.
 */
const DEFAULT_TIMEOUT_MS = 25_000;

/**
 * Cắt request chạy quá lâu.
 *
 * ⚠️ ĐIỀU INTERCEPTOR NÀY KHÔNG LÀM: NÓ KHÔNG HUỶ CÔNG VIỆC ĐANG CHẠY
 *
 * `rxjs timeout` chỉ dừng việc **chờ** kết quả. Câu truy vấn Supabase, lệnh gọi sang FAST,
 * vòng lặp đang chạy — tất cả vẫn chạy tới hết. Nên phải đọc nó đúng như nó là: một cách bảo
 * vệ **client** khỏi phải treo, không phải một cách bảo vệ **server** khỏi quá tải.
 *
 * ⚠️ HỆ QUẢ NGHIÊM TRỌNG VỚI THAO TÁC GHI CÓ HỆ QUẢ KẾ TOÁN
 *
 * Nếu request "duyệt thanh lý" bị cắt ở giây 25 trong khi lệnh báo giảm sang FAST vẫn hoàn
 * tất, client nhận 408 nhưng **tài sản đã được báo giảm**. Người dùng thấy "lỗi" rồi bấm lại →
 * hai lần báo giảm, hoặc một lần duyệt bị ghi hai dòng lịch sử.
 *
 * Vì vậy mọi thao tác ghi có hệ quả **phải** có khoá chống trùng ở tầng nghiệp vụ, không dựa
 * vào việc request kết thúc bình thường:
 *
 *   · Chuyển trạng thái (điều chuyển, thanh lý, xác nhận nhận hàng): kiểm trạng thái nguồn +
 *     `version` (optimistic concurrency) — lần thứ hai thấy trạng thái đã đổi và dừng.
 *   · Gọi FAST: qua bảng outbox có khoá idempotent theo (loại nghiệp vụ, mã tài sản, kỳ),
 *     job gửi lại an toàn — không bao giờ gọi FAST trực tiếp trong request của người dùng.
 *
 * Chi tiết cơ chế chốt khi thiết kế từng module (tài liệu sản phẩm ở `business/product-docs/`).
 *
 * ⚠️ VIỆC DÀI KHÔNG THUỘC VỀ MỘT REQUEST HTTP
 *
 * Nếu một endpoint chạm ngưỡng 25 giây, câu trả lời gần như luôn là chuyển nó sang job nền
 * và trả `202 Accepted` kèm một mã để tra tiến độ — chứ không phải nâng ngưỡng. Nhập danh mục
 * tài sản từ Excel, in hàng loạt tem QR, chốt khấu hao tháng là ví dụ đúng của việc đó.
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(
      timeout(DEFAULT_TIMEOUT_MS),
      catchError((error: unknown) =>
        throwError(() =>
          // ⚠️ Ném MÃ LỖI, không ném `RequestTimeoutException('câu tiếng Việt')`: câu viết sẵn
          // luôn là tiếng Việt và chỉ lọt vào `errors`, còn mã thì được `AllExceptionsFilter`
          // dịch theo ngôn ngữ người đọc — xem `ERROR_DEFINITIONS.REQUEST_TIMEOUT`.
          error instanceof TimeoutError
            ? new AppException(ErrorCode.REQUEST_TIMEOUT)
            : error,
        ),
      ),
    );
  }
}
