import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AppException } from '@/common/exceptions/app.exception';
import {
  DEFAULT_CODE_BY_STATUS,
  ErrorCode,
  isErrorCode,
} from '@/common/i18n/error-code.const';
import { I18nService } from '@/common/i18n/i18n.service';
import { Locale, resolveLocale } from '@/common/i18n/locale.const';

/**
 * Bộ lọc lỗi cuối cùng — mọi exception không được xử lý ở tầng trên đều rơi vào đây.
 *
 * =========================================================================
 * BA NGUYÊN TẮC
 * =========================================================================
 *
 * 1. **Không để lỗi thô lọt ra ngoài.** Một `PostgrestError` hay stack trace trả về client
 *    là rò rỉ thông tin về schema và hạ tầng. Lỗi 500 chỉ trả một câu trung tính; chi tiết
 *    đi vào log của server.
 *
 * 2. **Nhưng lỗi 4xx thì phải nói rõ.** Người dùng cần biết mình phải làm gì tiếp. Thông báo
 *    chỉ nói "có lỗi" thì bằng không có thông báo.
 *
 * 3. ⚠️ **Đây là chỗ DUY NHẤT dịch thông báo lỗi.** Tầng nghiệp vụ ném `AppException` mang
 *    mã lỗi; filter này biết `Request` nên nó biết ngôn ngữ của người đọc. Xem chú thích ở
 *    `AppException` về lý do không dịch ở chỗ ném lỗi.
 *
 * =========================================================================
 * HÌNH DẠNG PHẢN HỒI LỖI — CONTRACT VỚI FRONTEND
 * =========================================================================
 *
 * ```json
 * {
 *   "statusCode": 409,
 *   "code": "EMPLOYEE_CODE_TAKEN",
 *   "message": "Mã nhân viên \"EH0123\" đã gắn với một tài khoản khác. Vui lòng kiểm tra lại.",
 *   "path": "/v1/auth/register",
 *   "requestId": "8f3a…"
 * }
 * ```
 *
 * ⚠️ **Frontend phân nhánh theo `code`, KHÔNG theo `message`.** `message` đổi theo ngôn ngữ
 * của người dùng và đổi khi có người sửa câu văn cho dễ hiểu hơn. Một
 * `if (message.includes('đã tồn tại'))` sẽ vỡ khi người dùng đổi sang tiếng Anh — và vỡ im
 * lặng, vì nhánh đó chỉ đơn giản không chạy.
 *
 * ⚠️ `errors` chỉ xuất hiện với lỗi validation, và nó là **mảng chuỗi đã dịch**. Xem
 * §Validation.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * ⚠️ Nhận `I18nService` qua constructor, nên filter này phải đăng ký bằng `APP_FILTER`
   * trong `app.module.ts` — **không** bằng `app.useGlobalFilters(new AllExceptionsFilter())`
   * trong `main.ts`. Cách thứ hai tự khởi tạo nên không có DI, và `this.i18n` sẽ là
   * `undefined`.
   */
  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = request.requestId ?? '-';
    const locale = resolveLocale(request);

    const { status, code, params, rawMessages } = this.classify(exception);

    // ⚠️ Log trước khi dịch, và log **mã lỗi** chứ không log câu đã dịch. Câu đã dịch đổi
    // theo ngôn ngữ người dùng, nên `grep` theo nó sẽ bỏ sót — trong khi mã lỗi thì không.
    //
    // `Number(HttpStatus...)`: `status` là `number` thuần (từ `exception.getStatus()`), còn
    // `HttpStatus` là enum — so sánh trực tiếp làm ESLint báo `no-unsafe-enum-comparison`.
    if (status >= Number(HttpStatus.INTERNAL_SERVER_ERROR)) {
      this.logger.error(
        `${request.method} ${request.path} → ${status} ${code} rid=${requestId}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.debug(
        `${request.method} ${request.path} → ${status} ${code} rid=${requestId}`,
      );
    }

    const errors = rawMessages
      ? this.translateEach(rawMessages, locale)
      : undefined;

    response.status(status).json({
      statusCode: status,
      code,
      message: this.i18n.translate(code, locale, params),
      // ⚠️ `path` chứ không `url`: `url` mang cả query string, và query string có thể chứa từ
      // khoá tìm kiếm (tên người, số serial) — xem `httpLogMiddleware`. Phản hồi lỗi được
      // frontend hiện ra và người dùng chụp màn hình gửi đi; không có lý do để kèm query.
      path: request.path,
      /**
       * ⚠️ TRẢ `requestId` RA CLIENT — CÓ CHỦ Ý, VÀ NÓ KHÔNG PHẢI RÒ RỈ THÔNG TIN
       *
       * Đây là một UUID ngẫu nhiên, không mang thông tin gì về hạ tầng hay dữ liệu. Nhưng nó
       * biến một báo lỗi không tra được ("em bấm xác nhận nhận hàng thì báo lỗi, khoảng 3 giờ
       * chiều") thành một lần grep. Với thao tác có hệ quả kế toán (thanh lý, điều chuyển đổi
       * cost center), chênh lệch đó là chênh lệch giữa xử lý được một sai lệch với FAST và không.
       *
       * `-` khi chưa có: lỗi phát sinh trước `requestContextMiddleware` thì thật sự chưa có mã
       * nào (trường hợp rất hiếm vì middleware đó đứng đầu chuỗi).
       */
      requestId,
      // Chỉ có với lỗi validation. `undefined` bị `res.json()` bỏ qua nên trường này không
      // xuất hiện trong các phản hồi khác.
      ...(errors ? { errors } : {}),
    });
  }

  /**
   * Phân loại exception thành `{ status, code, params, rawMessages }`.
   *
   * Bốn loại, theo thứ tự kiểm:
   *
   *   1. `AppException`                        → có mã và tham số, dùng luôn
   *   2. `HttpException` có `message` là mã lỗi → ⚠️ xem §Validation
   *   3. `HttpException` thường (Nest dựng sẵn) → suy mã từ HTTP status
   *   4. Không phải `HttpException`              → lỗi middleware 4xx, hoặc 500
   */
  private classify(exception: unknown): {
    status: number;
    code: ErrorCode;
    params?: Record<string, string | number>;
    rawMessages?: string[];
  } {
    // --- 1 ---
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        params: exception.params,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const messages = this.extractMessages(payload);

      // --- 2 ---
      //
      // ⚠️ §Validation — VÌ SAO KIỂM CHUỖI CÓ PHẢI MÃ LỖI
      //
      // `class-validator` chỉ nhận một **chuỗi** trong `{ message: ... }` của decorator, nên
      // DTO không ném được `AppException`. Cách để DTO vẫn dịch được: đặt `message` là mã lỗi
      //
      //     @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
      //
      // rồi filter nhận ra chuỗi đó là một mã đã khai và dịch nó. DTO nào còn viết câu tiếng
      // Việt tay thì câu đó đi nguyên vào `errors` — vẫn đọc được, chỉ là không đổi ngôn ngữ.
      const firstCode = messages.find((m) => isErrorCode(m));
      if (firstCode && isErrorCode(firstCode)) {
        return {
          status,
          code: firstCode,
          // Vẫn trả toàn bộ danh sách: một form có 5 lỗi thì người dùng cần thấy cả 5, không
          // phải sửa một lỗi rồi submit lại để phát hiện lỗi thứ hai.
          rawMessages: messages.length > 0 ? messages : undefined,
        };
      }

      // --- 3 ---
      //
      // ⚠️ `errors` CHỈ CHO 400. Bản gốc trả `errors` cho mọi `HttpException` dựng sẵn, nên một
      // 404 không khớp route mang theo `errors: ["Cannot GET /v1/xyz"]` — câu tiếng Anh nội bộ
      // của Express lọt ra giao diện. Với 400 thì danh sách đó là lỗi validation người dùng cần.
      return {
        status,
        code:
          DEFAULT_CODE_BY_STATUS[status] ??
          (status >= 500 ? ErrorCode.INTERNAL_ERROR : ErrorCode.FORBIDDEN),
        rawMessages:
          status === Number(HttpStatus.BAD_REQUEST) && messages.length > 0
            ? messages
            : undefined,
      };
    }

    // --- 4 ---
    //
    // ⚠️ LỖI CỦA MIDDLEWARE EXPRESS — KHÔNG PHẢI `HttpException`
    //
    // `express.json({ limit })` từ chối payload quá lớn bằng cách ném một `Error` thuần của
    // `body-parser`, mang `status = 413` và `type = 'entity.too.large'`. Nó **không** phải
    // `HttpException`, nên không có nhánh này thì nó rơi xuống 500 — và client nhận
    // "Đã xảy ra lỗi không mong muốn" cho một việc hoàn toàn xác định là "nội dung quá lớn".
    //
    // Cùng nhánh này xử lý luôn `entity.parse.failed` (JSON sai cú pháp, status 400).
    //
    // ⚠️ Chỉ tin `status` khi nó là mã 4xx. Một `Error` bất kỳ có thuộc tính `status` bằng
    // 200 hoặc 502 thì đó không phải lỗi client — trả nó ra sẽ nói sai với client về nguyên
    // nhân, và với 200 thì còn trả một phản hồi "thành công" cho một lỗi.
    const parserStatus = this.extractParserStatus(exception);
    if (parserStatus !== null) {
      return {
        status: parserStatus,
        code:
          DEFAULT_CODE_BY_STATUS[parserStatus] ?? ErrorCode.VALIDATION_FAILED,
      };
    }

    // Lỗi không phải HttpException = lỗi lập trình hoặc lỗi hạ tầng. Chi tiết đi vào log
    // (xem `catch()`), **không** trả ra ngoài.
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ErrorCode.INTERNAL_ERROR,
    };
  }

  /**
   * Dịch từng phần tử của `errors` nếu nó là mã lỗi; giữ nguyên nếu là câu viết tay.
   *
   * ⚠️ VÌ SAO DỊCH CẢ MẢNG, KHÔNG CHỈ `message`
   *
   * Bản gốc (Avantily) chỉ dịch `message` và để `errors` là chuỗi thô — nên một DTO dùng mã
   * lỗi làm `message` sẽ trả `errors: ["INVALID_REFERENCE_ID"]`, và frontend hiện nguyên mã đó
   * cho người dùng. Dịch ở đây thì `errors` luôn là câu đọc được, đúng ngôn ngữ.
   *
   * ⚠️ Không có tham số: `class-validator` không truyền được tham số theo cách của
   * `AppException`. Mã nào có `{…}` trong mẫu câu thì không nên dùng làm `message` của DTO.
   */
  private translateEach(messages: string[], locale: Locale): string[] {
    return messages.map((message) =>
      isErrorCode(message) ? this.i18n.translate(message, locale) : message,
    );
  }

  /**
   * Mã 4xx từ một lỗi middleware Express, hoặc `null` nếu không phải loại đó.
   *
   * `body-parser` đặt cả `status` và `statusCode`; đọc cả hai để không phụ thuộc phiên bản.
   */
  private extractParserStatus(exception: unknown): number | null {
    if (!exception || typeof exception !== 'object') return null;

    const candidate = exception as { status?: unknown; statusCode?: unknown };
    const raw =
      typeof candidate.status === 'number'
        ? candidate.status
        : typeof candidate.statusCode === 'number'
          ? candidate.statusCode
          : null;

    if (raw === null) return null;
    return raw >= 400 && raw < 500 ? raw : null;
  }

  /**
   * Lấy danh sách câu lỗi từ payload của `HttpException`.
   *
   * `getResponse()` trả về ba hình dạng khác nhau tuỳ nơi ném:
   *   · chuỗi                                    — `new ForbiddenException('...')`
   *   · `{ message: string }`                    — mặc định của Nest
   *   · `{ message: string[] }`                  — `ValidationPipe`
   */
  private extractMessages(payload: unknown): string[] {
    if (typeof payload === 'string') return [payload];

    if (payload && typeof payload === 'object' && 'message' in payload) {
      const raw: unknown = payload.message;
      if (typeof raw === 'string') return [raw];
      if (Array.isArray(raw)) {
        return raw.filter((item): item is string => typeof item === 'string');
      }
    }

    return [];
  }
}
