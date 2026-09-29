import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { API_VERSION_1 } from './common/constants/api-version.const';
import { httpLogMiddleware } from './common/middleware/http-log.middleware';
import { requestContextMiddleware } from './common/middleware/request-context.middleware';

/**
 * ============================================================================
 * CẤU HÌNH ỨNG DỤNG — DÙNG CHUNG CHO `main.ts` VÀ TEST
 * ============================================================================
 *
 * ⚠️ VÌ SAO PHẢI TÁCH RA KHỎI `main.ts`
 *
 * Test e2e tạo app bằng `Test.createTestingModule(...).createNestApplication()`. Hàm đó
 * **không** chạy `bootstrap()` trong `main.ts`, nên nếu cấu hình chỉ nằm ở đó thì app trong
 * test **không có**: versioning, `ValidationPipe`, giới hạn body, helmet.
 *
 * Hệ quả cụ thể và nó rất dễ mắc:
 *
 *   · Test gọi `/v1/auth/login` → **404**, vì versioning chưa bật. Người viết test sẽ "sửa"
 *     bằng cách gọi `/auth/login` — và từ đó test kiểm một đường dẫn **không tồn tại** ở
 *     production.
 *   · Test gửi body thiếu trường → **200** thay vì 400, vì `ValidationPipe` chưa chạy. Test
 *     xanh, nhưng nó chứng minh điều ngược lại với sự thật.
 *
 * Loại lỗi đó tệ hơn không có test: nó tạo niềm tin sai. Nên mọi cấu hình ảnh hưởng tới hành
 * vi HTTP phải nằm ở đây, và `main.ts` chỉ còn phần thật sự thuộc về tiến trình (đọc PORT,
 * `listen`, log).
 *
 * ⚠️ THÊM CẤU HÌNH MỚI THÌ THÊM VÀO ĐÂY, KHÔNG THÊM VÀO `main.ts`.
 */

/**
 * Cổng mặc định khi không khai `PORT`.
 *
 * ⚠️ 3006, KHÔNG phải 3005: trên máy dev của đội, 3005 đã do backend Avantily và Darlene
 * dùng. Trùng cổng thì hai backend không chạy song song được, và lỗi `EADDRINUSE` dễ bị đọc
 * nhầm thành "backend Every Half lỗi". Phải khớp `EXPOSE`/`HEALTHCHECK` trong Dockerfile và
 * `VITE_API_BASE_URL` của eh_am_frontend.
 */
export const DEFAULT_PORT = 3006;

/**
 * Giới hạn kích thước thân request.
 *
 * ⚠️ ĐÂY LÀ MỘT LỚP CHỐNG TỪ CHỐI DỊCH VỤ, KHÔNG PHẢI MỘT TUỲ CHỌN TIỆN DỤNG
 *
 * Mặc định của Express là 100 KB — đủ cho mọi endpoint JSON của hệ thống này. Nhưng nếu để
 * mặc định ngầm thì một ngày nào đó có người nâng nó lên để cho qua một payload lớn, và mức
 * mới đó áp cho **toàn bộ** API.
 *
 * 256 KB: dư cho phần dài nhất mà API này nhận (danh sách kết quả một lượt kiểm kê gửi theo
 * lô, ghi chú sửa chữa dài). Tệp thì **không** đi qua đây — ảnh tài sản, ảnh chụp lúc quét QR,
 * hoá đơn/PO, biên bản thanh lý đều upload trực tiếp lên Supabase Storage bằng URL đã ký, nên
 * backend không bao giờ phải nhận một tệp trong body.
 *
 * ⚠️ Nhập danh mục tài sản ban đầu từ Excel (hàng nghìn dòng) KHÔNG được làm bằng cách nâng
 * mức này: tệp đi lên Storage, backend đọc tệp đó trong một job nền. Nâng mức toàn cục để một
 * endpoint chạy được là mở rộng bề mặt tấn công cho mọi endpoint còn lại.
 */
export const MAX_BODY_SIZE = '256kb';

/**
 * Danh sách origin được phép gọi API.
 *
 * Đọc từ `CORS_ORIGINS` (các origin cách nhau bởi dấu phẩy). Every Half hiện có **một**
 * frontend (eh_am_frontend — web quản trị + thao tác quét QR trên điện thoại), nhưng vẫn đọc
 * danh sách thay vì một giá trị: khi thêm môi trường staging, hoặc tách một app quét QR riêng
 * cho cửa hàng, chỉ cần khai thêm origin — không phải sửa code.
 */
export function resolveAllowedOrigins(): string[] {
  const fromEnv = process.env.CORS_ORIGINS?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (fromEnv?.length) return fromEnv;

  return [
    'http://localhost:5175', // eh_am_frontend (Vite)
  ];
}

/**
 * Số tầng proxy đứng trước ứng dụng.
 *
 * ⚠️ CON SỐ NÀY PHẢI KHỚP SỐ TẦNG PROXY THẬT, VÀ TUYỆT ĐỐI KHÔNG ĐƯỢC LÀ `true`.
 *
 * `req.socket.remoteAddress` sẽ là `127.0.0.1` (nginx cùng máy) nên vô dụng. Express phải
 * đọc `X-Forwarded-For`, và nó dựng danh sách địa chỉ **từ gần server ra xa**:
 *
 *     [127.0.0.1 (nginx), IP biên CDN, IP người dùng]
 *
 * `trust proxy: n` nghĩa là bỏ `n` địa chỉ gần server nhất rồi lấy địa chỉ kế tiếp. Nên với
 * chuỗi trên, `1` chỉ bỏ nginx và trả về **IP biên của CDN** — không phải người dùng. `2` bỏ
 * cả nginx và CDN, trả đúng IP người dùng.
 *
 * ⚠️ VÌ SAO ĐẶT SAI LÀ MỘT LỖI IM LẶNG
 *
 * Nó không làm gì hỏng lúc chạy — chỉ ghi sai một địa chỉ IP vào `audit_events`, bảng **chỉ
 * ghi thêm**. Không sửa lại được, không backfill được. Và `audit_events.ip_address` là dữ
 * liệu dùng khi điều tra một tài sản bị báo mất hay một lần thanh lý bất thường, tức đúng lúc
 * cần nó nhất thì nó sai.
 *
 * ⚠️ VÌ SAO KHÔNG DÙNG `true`
 *
 * `true` là tin **toàn bộ** chuỗi header, mà header đó client gửi được. Ai cũng đặt được
 * `X-Forwarded-For: 1.2.3.4`, tức **vượt giới hạn tần suất tuỳ ý** và **ghi IP giả vào
 * audit**. Một con số cố định thì không bịa được: client gửi thêm bao nhiêu địa chỉ cũng chỉ
 * đẩy chúng ra xa hơn trong danh sách, còn Express vẫn đếm từ phía server vào.
 *
 * ⚠️ ĐỔI HẠ TẦNG THÌ PHẢI ĐỔI SỐ NÀY. Tắt proxy của CDN là còn một tầng — để `2` sẽ trả
 * `127.0.0.1`. Sai theo hướng vô dụng, không phải theo hướng bịa được, nhưng vẫn là sai.
 *
 * Ở dev không có proxy nào nên mặc định `0`.
 */
export function resolveTrustProxyHops(): number {
  const raw = process.env.TRUST_PROXY_HOPS?.trim();
  if (!raw) return 0;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error(
      `TRUST_PROXY_HOPS phải là số nguyên không âm, nhận được "${raw}". ` +
        'Xem chú thích trong src/bootstrap.ts về ý nghĩa của con số này.',
    );
  }
  return parsed;
}

/**
 * Áp toàn bộ cấu hình HTTP lên app.
 *
 * Gọi từ `main.ts` (production) **và** từ `test/helpers/test-app.ts` (e2e) — hai nơi phải
 * dùng đúng một hàm này, xem chú thích đầu file.
 */
export function configureApp(app: NestExpressApplication): void {
  app.set('trust proxy', resolveTrustProxyHops());

  /**
   * ⚠️ HAI MIDDLEWARE NÀY PHẢI ĐỨNG ĐẦU, TRƯỚC CẢ HELMET
   *
   * Vòng đời NestJS: **middleware → guard → interceptor → pipe → controller**.
   *
   * Guard chạy **trước** interceptor. Nên nếu mã tương quan và việc ghi log nằm ở interceptor
   * thì mọi phản hồi bị guard từ chối (401 của `JwtAuthGuard`, 403 của `PermissionsGuard`,
   * 429 của `ApiThrottlerGuard`) sẽ **không có `requestId` và không có dòng log** — đúng nhóm
   * phản hồi mà người ta đọc log để tìm.
   *
   * Đặt ở đây thì chúng chạy cho **mọi** request, kể cả 404 (không khớp route nào) và 413
   * (lỗi phân tích body, xảy ra trước guard).
   *
   * ⚠️ `requestContextMiddleware` trước `httpLogMiddleware`: cái sau đọc `req.requestId`.
   */
  app.use(requestContextMiddleware);
  app.use(httpLogMiddleware);

  // Header bảo mật cơ bản.
  //
  // `contentSecurityPolicy: false` vì đây là API thuần JSON, không trả HTML — một CSP ở đây
  // không bảo vệ gì mà có thể làm vỡ trang tài liệu API nếu sau này thêm Swagger. CSP thật
  // của hệ thống nằm ở frontend (eh_am_frontend — plugin `cspMetaPlugin` trong vite.config.ts).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ⚠️ Phải đặt **trước** `useGlobalPipes`. Middleware phân tích body chạy trước pipe, nên
  // đặt sau thì `ValidationPipe` đã nhận một object đã phân tích xong — tức là toàn bộ chi
  // phí bộ nhớ và CPU của việc phân tích một payload lớn đã bị tiêu trước khi có ai kiểm.
  app.use(json({ limit: MAX_BODY_SIZE }));
  app.use(urlencoded({ extended: true, limit: MAX_BODY_SIZE }));

  /**
   * Versioning theo URI: `/v1/auth/login`.
   *
   * `defaultVersion: API_VERSION_1` để controller chỉ phục vụ bản 1 không phải khai gì —
   * nhưng các controller ở đây **vẫn khai tường minh** `version: API_VERSION_1`. Lý do:
   * `defaultVersion` là một giá trị đặt ở một file khác, nên đọc một controller không khai
   * version thì không biết nó thuộc bản nào. Khi có bản 2, sự thiếu rõ ràng đó là chỗ để một
   * route bị gán sai bản.
   *
   * ⚠️ `/health` không mang tiền tố — controller của nó khai `VERSION_NEUTRAL`. Xem
   * `api-version.const.ts` về lý do health check phải nằm ngoài versioning.
   */
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION_1,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      // ⚠️ `forbidNonWhitelisted: true` = gửi trường lạ thì bị **từ chối**, không phải bị âm
      // thầm bỏ đi. Với các DTO có giá trị tiền (nguyên giá, chi phí sửa chữa), một trường bị
      // bỏ âm thầm (`originalCost` gõ thành `orginalCost`) sẽ tạo ra một tài sản thiếu nguyên
      // giá mà client tưởng đã gửi đủ — và nó sẽ lệch với FAST ngay kỳ đối chiếu đầu tiên.
      forbidNonWhitelisted: true,
      // Trả về TẤT CẢ lỗi validation, không dừng ở lỗi đầu tiên: người dùng sửa một lần xong
      // cả form, không phải submit năm lần để phát hiện năm lỗi.
      stopAtFirstError: false,
    }),
  );

  // ⚠️ `AllExceptionsFilter` KHÔNG đăng ký ở đây mà qua `APP_FILTER` trong `app.module.ts`.
  // Nó inject `I18nService`, nên `new AllExceptionsFilter()` sẽ không có DI. Xem chú thích ở
  // `app.module.ts`.

  const allowedOrigins = resolveAllowedOrigins();

  app.enableCors({
    // Dùng callback thay vì mảng tĩnh để cho qua request **không có** header `Origin`
    // (curl, health check, job nội bộ gọi vòng). Các request đó không phải cross-origin nên
    // chặn chúng là chặn nhầm.
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin không được phép: ${origin}`));
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
}
