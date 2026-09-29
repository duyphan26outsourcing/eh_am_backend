import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerLimitDetail } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { VERSION_NEUTRAL_ROUTES } from '@/common/constants/api-version.const';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * ============================================================================
 * GIỚI HẠN TẦN SUẤT — 429 CÓ `Retry-After`
 * ============================================================================
 *
 * Ba việc mà `ThrottlerGuard` mặc định không làm, và cả ba đều cần:
 *
 *   1. **Trả `Retry-After`.** Không có nó, client chỉ biết "bị chặn" mà không biết chờ bao
 *      lâu. Cách xử lý thường thấy là thử lại ngay — làm tình hình xấu thêm đúng lúc hệ
 *      thống đang cần được nghỉ.
 *   2. **Đếm theo người dùng khi biết được người dùng.** Xem §Tracker.
 *   3. **Bỏ qua `/health`.** Xem §Bỏ qua.
 *
 * ============================================================================
 * §TRACKER — ĐẾM THEO AI
 * ============================================================================
 *
 * ⚠️ ĐẾM THEO IP LÀ SAI Ở CỬA HÀNG, NHƯNG THƯỜNG LÀ THỨ DUY NHẤT CÓ
 *
 * Mọi điện thoại trong một cửa hàng Every Half ra Internet qua **một** IP của router, và nhà
 * mạng di động Việt Nam dùng NAT ở mức lớn. Giới hạn theo IP nghĩa là một nhân viên bấm nhiều
 * sẽ làm cạn hạn mức của cả ca — đúng vào lúc kiểm kê cuối tháng, khi cả cửa hàng cùng quét.
 *
 * Nên guard này đếm theo `user_profiles.id` **khi có**, và chỉ lùi về IP khi không có.
 *
 * ⚠️ ĐIỀU KIỆN ĐỂ NHÁNH `userId` THẬT SỰ CHẠY
 *
 * `req.user` do `JwtAuthGuard` gắn. Guard toàn cục chạy **trước** guard của controller, nên:
 *
 *   · Đăng ký ở `app.module` (toàn cục)              → `req.user` LUÔN rỗng → đếm theo IP
 *   · Đăng ký ở controller SAU `JwtAuthGuard`         → đếm theo `userId`
 *
 * Đây không phải lỗi cần sửa mà là hai lớp bổ sung cho nhau, và chúng bảo vệ hai thứ khác
 * nhau:
 *
 *   · Lớp toàn cục theo IP  → chặn kẻ chưa đăng nhập dò mật khẩu, quét endpoint.
 *   · Lớp controller theo user → chặn một tài khoản đã đăng nhập lạm dụng API.
 *
 * ⚠️ ĐẾM THEO IP CHỈ ĐÚNG KHI `TRUST_PROXY_HOPS` ĐÚNG
 *
 * `req.ip` lấy từ `X-Forwarded-For` theo số hop đã cấu hình. Khai quá nhiều hop → client
 * tự chọn được IP mình muốn bằng cách gửi header giả → **vượt giới hạn tuỳ ý**. Xem chú
 * thích `resolveTrustProxyHops()` trong `bootstrap.ts`.
 *
 * ============================================================================
 * §BỎ QUA
 * ============================================================================
 *
 * `/health` không tính hạn mức. Load balancer gọi nó mỗi 10–30 giây; nếu nó tiêu hạn mức
 * theo IP thì IP của load balancer sẽ bị chặn, và hệ thống sẽ bị đánh dấu là "không lành
 * mạnh" rồi bị rút khỏi vòng phục vụ — một sự cố tự gây ra hoàn toàn.
 *
 * ============================================================================
 * ⚠️ HẠN CHẾ PHẢI BIẾT: BỘ ĐẾM NẰM TRONG BỘ NHỚ TỪNG INSTANCE
 * ============================================================================
 *
 * `ThrottlerModule` mặc định dùng `ThrottlerStorageService` — một `Map` trong tiến trình.
 * Hai hệ quả:
 *
 *   1. Chạy N instance → giới hạn thực tế là `limit × N`, vì mỗi instance đếm riêng.
 *   2. Khởi động lại → bộ đếm về 0. Một vòng deploy là một lần xoá hạn mức.
 *
 * Với một instance thì đủ. **Trước khi scale ngang phải chuyển sang storage dùng chung**
 * (`@nest-lab/throttler-storage-redis`) — nếu không, con số trong `@Throttle()` không còn
 * nghĩa gì, và đó là loại thoái hoá bảo mật không có triệu chứng nào cho tới khi bị lạm dụng.
 */
@Injectable()
export class ApiThrottlerGuard extends ThrottlerGuard {
  /**
   * ⚠️ Trả về **chuỗi có tiền tố**, không phải giá trị trần.
   *
   * Không có tiền tố thì một `userId` và một IP về lý thuyết có thể trùng chuỗi và dùng
   * chung bộ đếm. Trên thực tế UUID không trùng IP, nhưng để hai không gian định danh dùng
   * chung một khoá là một thói quen sẽ gây lỗi ở chỗ khác — cùng lý do mà
   * `context_role_assignments` luôn lọc theo cả `subject_type` lẫn `subject_id`.
   */
  protected getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request;

    // `sub` là `auth.users.id`, cũng chính là `user_profiles.id` — xem `JwtPayload`.
    const userId = request.user?.sub;
    if (userId) {
      return Promise.resolve(`user:${userId}`);
    }

    return Promise.resolve(`ip:${request.ip ?? 'unknown'}`);
  }

  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') {
      return Promise.resolve(true);
    }

    const request = context.switchToHttp().getRequest<Request>();

    // `originalUrl` chứ không `path`: ta chỉ cần biết đường dẫn có mở đầu bằng một route
    // trung tính version hay không.
    const isVersionNeutral = VERSION_NEUTRAL_ROUTES.some((route) =>
      request.originalUrl.startsWith(`/${route}`),
    );

    return Promise.resolve(isVersionNeutral);
  }

  /**
   * Ném 429 kèm `Retry-After` và một câu nói rõ phải chờ bao lâu.
   *
   * ⚠️ `Retry-After` TÍNH THEO GIÂY, LÀM TRÒN LÊN
   *
   * `timeToExpire` của throttler tính theo **giây** (không phải ms). Làm tròn xuống sẽ cho
   * ra `0` khi còn dưới một giây, và client đọc `Retry-After: 0` sẽ thử lại tức thì rồi bị
   * chặn tiếp — vòng lặp chặt hơn cả lúc không có header.
   *
   * ⚠️ THÔNG BÁO KHÔNG NÓI ĐANG ĐẾM THEO GÌ
   *
   * Không tiết lộ hạn mức là theo IP hay theo tài khoản, và không tiết lộ con số `limit`.
   * Biết được điều đó là biết cách lách: kẻ dò mật khẩu sẽ đổi IP đúng ngưỡng, hoặc dừng
   * đúng dưới ngưỡng để không kích hoạt cảnh báo.
   *
   * ⚠️ NÉM `AppException` KÈM `{ seconds }`, KHÔNG NÉM `ThrottlerException` VỚI CÂU VIẾT SẴN
   *
   * Bản gốc (Avantily) ném `ThrottlerException('Bạn đã gửi quá nhiều yêu cầu… sau N giây.')`.
   * Exception đó không mang mã, nên `AllExceptionsFilter` suy mã `TOO_MANY_REQUESTS` từ status
   * 429 rồi dịch mẫu câu của mã đó — **không có tham số** — và người dùng đọc nguyên văn
   * "thử lại sau {seconds} giây". Câu viết sẵn thì chỉ lọt vào `errors`, và luôn là tiếng Việt
   * kể cả khi người dùng chọn tiếng Anh.
   *
   * Ném mã + tham số thì câu được dịch đúng ngôn ngữ và có đúng con số.
   */
  protected throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const response = context.switchToHttp().getResponse<Response>();

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(throttlerLimitDetail.timeToExpire),
    );

    response.setHeader('Retry-After', retryAfterSeconds);

    throw new AppException(ErrorCode.TOO_MANY_REQUESTS, {
      seconds: retryAfterSeconds,
    });
  }
}
