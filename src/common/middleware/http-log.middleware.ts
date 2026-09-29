import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

/**
 * Log một dòng cho **mỗi** phản hồi HTTP.
 *
 * ```
 * POST /v1/auth/login    201  87ms rid=8f3a… actor=-     ip=203.0.113.9
 * GET  /v1/auth/me       401   3ms rid=1c9b… actor=-     ip=203.0.113.9
 * GET  /v1/assets        200  34ms rid=7d21… actor=c4f2… ip=203.0.113.9
 * ```
 *
 * ============================================================================
 * ⚠️ MIDDLEWARE + `res.on('finish')`, KHÔNG PHẢI INTERCEPTOR
 * ============================================================================
 *
 * Interceptor chạy **sau** guard trong vòng đời NestJS, nên một bản viết bằng interceptor bỏ
 * sót đúng ba nhóm phản hồi cần đọc nhất:
 *
 *   1. **401 từ `JwtAuthGuard`** — token thiếu, hỏng, hoặc hết hạn.
 *   2. **403 từ `PermissionsGuard`** — thiếu vai trò trên location đang thao tác.
 *   3. **429 từ `ApiThrottlerGuard`** — vượt giới hạn tần suất.
 *
 * Cộng thêm **404** (không khớp route nào, nên không có interceptor nào chạy) và **413** (lỗi
 * của middleware phân tích body, xảy ra trước cả guard).
 *
 * Một cụm 403 bất thường (ai đó thử xem tài sản của cửa hàng khác) hay một cụm 429 là dấu hiệu
 * cần điều tra — và bản interceptor làm chúng vô hình. `res.on('finish')` bắt **mọi** phản hồi
 * đã gửi xong, không phụ thuộc nó đi qua tầng nào.
 *
 * ============================================================================
 * ⚠️ TUYỆT ĐỐI KHÔNG LOG THÂN REQUEST
 * ============================================================================
 *
 * Thân request ở Every Half chứa: mật khẩu (`/auth/register`, `/auth/login`,
 * `/auth/change-password`), refresh token (`/auth/refresh`), **toạ độ GPS** của nhân viên lúc
 * quét QR kiểm kê (dữ liệu vị trí là dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP), và giá trị
 * tài sản. Log những thứ đó là tạo ra một bản sao dữ liệu nhạy cảm ở một nơi có chính sách lưu
 * trữ lỏng hơn database — thường là một dịch vụ log của bên thứ ba, nhiều người đọc được.
 *
 * Một lần bật "log body cho dễ debug" rồi quên tắt là một sự cố dữ liệu. Nên middleware này
 * **không có** đường dẫn nào để log body, kể cả sau một cờ cấu hình.
 *
 * ⚠️ Cũng không log query string. `?q=` của tìm kiếm có thể chứa tên người, số serial; `?lat=`
 * nếu có endpoint nào nhận toạ độ qua query. `req.path` bỏ query; `req.originalUrl` thì không
 * — nên dùng `req.path`.
 *
 * ============================================================================
 * ⚠️ VỀ `actor`
 * ============================================================================
 *
 * `actor` là `user_profiles.id`, do `JwtAuthGuard` gắn vào `req.user`. Nó tra cứu được khi
 * cần điều tra nhưng tự nó không phải dữ liệu cá nhân — nên log giữ được giá trị điều tra mà
 * không biến file log thành một danh sách email nhân viên.
 *
 * `-` với request chưa qua guard hoặc bị guard từ chối. Đó là thông tin đúng: ở thời điểm đó
 * hệ thống thật sự không biết người gọi là ai.
 */
export function httpLogMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // ⚠️ `process.hrtime.bigint()` chứ không `Date.now()`. `Date.now()` dùng đồng hồ hệ thống,
  // nên một lần đồng bộ NTP giữa hai mốc có thể cho ra thời lượng âm — và một biểu đồ độ trễ
  // có giá trị âm là biểu đồ không ai tin nữa.
  const startedAt = process.hrtime.bigint();

  // `once` chứ không `on`: `finish` chỉ phát một lần cho mỗi phản hồi, nhưng dùng `once` để
  // nếu Express đổi hành vi thì cũng không sinh hai dòng log cho một request.
  res.once('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    logger.log(
      `${req.method} ${req.path} ${res.statusCode} ${durationMs.toFixed(0)}ms ` +
        `rid=${req.requestId ?? '-'} actor=${req.user?.sub ?? '-'} ip=${req.ip ?? '-'}`,
    );
  });

  next();
}
