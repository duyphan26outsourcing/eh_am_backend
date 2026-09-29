import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Header mang mã tương quan. Frontend và log cùng dùng đúng tên này. */
export const REQUEST_ID_HEADER = 'x-request-id';

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Gắn mã tương quan cho mỗi request và trả nó lại trong header phản hồi.
 *
 * ============================================================================
 * ⚠️ ĐÂY LÀ MIDDLEWARE, KHÔNG PHẢI INTERCEPTOR — VÀ ĐÓ LÀ MỘT SỬA LỖI
 * ============================================================================
 *
 * Bản đầu viết cái này thành `NestInterceptor`. Nó **sai**, vì thứ tự vòng đời của NestJS là:
 *
 *     middleware → GUARD → interceptor → pipe → controller
 *
 * Guard chạy **trước** interceptor. Nên khi `JwtAuthGuard` ném 401, hoặc `PermissionsGuard`
 * ném 403, hoặc `ApiThrottlerGuard` ném 429, interceptor **chưa từng chạy** — và hệ quả:
 *
 *   · `req.requestId` là `undefined` → phản hồi lỗi trả `requestId: "-"`,
 *   · header `x-request-id` **không** được đặt.
 *
 * Tức là mọi request bị guard từ chối đều **không tra được** — trong khi đó chính là nhóm
 * request cần tra nhất: 401 hàng loạt (token hỏng? khoá xoay?), 403 bất thường (ai đang thử
 * vào đâu?), 429 (bị lạm dụng?).
 *
 * Middleware chạy trước guard nên nó **luôn** chạy, không có ngoại lệ.
 *
 * ============================================================================
 * ⚠️ VÌ SAO NHẬN LẠI MÃ DO CLIENT GỬI
 * ============================================================================
 *
 * Cho phép frontend tạo mã trước rồi gửi kèm, để một hành động của người dùng gồm nhiều
 * request (tải ảnh → tạo bản ghi → công bố) có cùng một mã. Hai điều kiện:
 *
 *   1. Chỉ nhận nếu **đúng định dạng UUID**. Header do client kiểm soát, và mã này đi vào
 *      log — nhận chuỗi tuỳ ý là mở đường tiêm ký tự vào log: một chuỗi có `\n` tạo ra một
 *      dòng log trông như thật.
 *   2. Không bao giờ dùng nó cho việc gì ngoài log. Nó **không** phải khoá chống trùng.
 *      Client kiểm soát được nó, nên nó không dùng để chống ghi trùng đơn thanh toán.
 */
export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const supplied =
    typeof incoming === 'string' && UUID_PATTERN.test(incoming)
      ? incoming
      : undefined;

  const requestId = supplied ?? randomUUID();

  req.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);

  next();
}
