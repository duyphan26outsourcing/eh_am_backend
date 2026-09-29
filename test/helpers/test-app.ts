import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerStorage } from '@nestjs/throttler';
import { AppModule } from '@/app.module';
import { configureApp } from '@/bootstrap';

/**
 * ============================================================================
 * TIỆN ÍCH DỰNG APP CHO TEST E2E
 * ============================================================================
 *
 * ⚠️ MỌI TEST E2E PHẢI DÙNG HÀM NÀY, KHÔNG TỰ GỌI `createNestApplication()`
 *
 * `createNestApplication()` **không** chạy `bootstrap()` trong `main.ts`, nên app trần không
 * có versioning, không có `ValidationPipe`, không có giới hạn body. Hệ quả:
 *
 *   · gọi `/v1/auth/login` → 404 (versioning chưa bật),
 *   · gửi body thiếu trường → 200 thay vì 400 (`ValidationPipe` chưa chạy).
 *
 * Trường hợp thứ hai là trường hợp nguy hiểm: test **xanh** trong khi nó chứng minh điều
 * ngược lại với sự thật. `configureApp()` là đúng hàm mà `main.ts` gọi, nên app trong test có
 * cùng hành vi HTTP với production.
 */
export async function createTestApp(): Promise<NestExpressApplication> {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication<NestExpressApplication>();
  configureApp(app);
  await app.init();

  return app;
}

/**
 * Xoá bộ đếm giới hạn tần suất.
 *
 * ⚠️ VÌ SAO CẦN, VÀ VÌ SAO CÁCH NÀY CHỨ KHÔNG TẮT THROTTLER TRONG TEST
 *
 * `/v1/auth/register` giới hạn 5 lần / 10 phút. Một bộ test validation có hơn 5 phép thử trên
 * endpoint đó, nên từ phép thử thứ 6 sẽ nhận **429** thay vì **400** — test đỏ vì một lý do
 * chẳng liên quan tới điều nó kiểm.
 *
 *   ❌ **Tắt throttler trong test.** App trong test khác app production, và mất luôn khả năng
 *      kiểm 429.
 *   ❌ **Đặt `TRUST_PROXY_HOPS=1` rồi đổi `X-Forwarded-For` mỗi test.** Đổi cấu hình bảo mật
 *      của app chỉ để lách một giới hạn.
 *   ✅ **Xoá bộ đếm giữa các test.** App giữ nguyên cấu hình production; chỉ trạng thái tích
 *      luỹ giữa các phép thử độc lập bị dọn.
 *
 * ⚠️ VÌ SAO ĐẶT `totalHits` VỀ 0 CHỨ KHÔNG GỌI `storage.clear()`
 *
 * `ThrottlerStorageService` đặt một `setTimeout` cho mỗi lần tăng bộ đếm, và callback của nó
 * đọc lại đúng key đó. Sau `clear()`, mọi timer đang chờ sẽ nổ `TypeError: Cannot destructure
 * property 'totalHits'…` **bên ngoài** mọi khối `try` của Jest — những test **ngẫu nhiên** bị
 * đỏ, không dòng nào trỏ về nguyên nhân. Giữ key và đặt `totalHits` về 0 thì vô hại.
 *
 * ⚠️ Chỉ hoạt động với `ThrottlerStorageService` mặc định (một `Map` trong tiến trình). Khi
 * chuyển sang Redis, hàm này phải đổi theo — nên nó ném lỗi khi không tìm thấy `Map`, thay vì
 * im lặng không làm gì.
 */
interface ThrottleRecord {
  totalHits: Map<string, number>;
  isBlocked: boolean;
  blockExpiresAt: number;
}

export function resetThrottleCounters(app: NestExpressApplication): void {
  const storage = app.get<{ storage?: Map<string, ThrottleRecord> }>(
    ThrottlerStorage,
    { strict: false },
  );

  if (!(storage.storage instanceof Map)) {
    throw new Error(
      'resetThrottleCounters(): không tìm thấy Map bộ đếm của ThrottlerStorage. ' +
        'Có phải đã chuyển sang storage dùng chung (Redis)? Hãy cập nhật hàm này.',
    );
  }

  for (const record of storage.storage.values()) {
    for (const throttlerName of record.totalHits.keys()) {
      record.totalHits.set(throttlerName, 0);
    }
    record.isBlocked = false;
    record.blockExpiresAt = 0;
  }
}

/**
 * Biến môi trường giả, đủ để app **khởi động** mà không cần Supabase thật.
 *
 * ⚠️ VÌ SAO CÁCH NÀY CHẠY ĐƯỢC
 *
 * `createClient()` của supabase-js **không** kết nối lúc khởi tạo, và
 * `createRemoteJWKSet(new URL(...))` chỉ cần một URL hợp lệ về cú pháp — nó tải khoá công
 * khai ở lần xác minh token đầu tiên. Nên app boot xong bình thường với giá trị giả, và mọi
 * test **không chạm database** (định tuyến, validation, hình dạng lỗi, i18n, giới hạn tần
 * suất) đều kiểm được.
 *
 * ⚠️ `ENCRYPTION_SECRET_KEY` phải là **đúng 64 ký tự hex** — `EncryptionService` ném lỗi ngay
 * ở constructor nếu không. Giá trị dưới đây là chuỗi `0` lặp lại: hợp lệ về định dạng và **cố
 * ý vô giá trị** để không ai nhầm nó với một khoá thật.
 *
 * ⚠️ TUYỆT ĐỐI KHÔNG đặt các giá trị này vào `.env` hay dùng ở môi trường thật.
 */
export const FAKE_ENV: Readonly<Record<string, string>> = {
  SUPABASE_URL: 'https://khong-ton-tai.supabase.co',
  SUPABASE_SECRET_KEY: 'test-service-role-key-khong-dung-that',
  SUPABASE_PUBLISHABLE_KEY: 'test-anon-key-khong-dung-that',
  ENCRYPTION_SECRET_KEY: '0'.repeat(64),
  CORS_ORIGINS: 'http://localhost:5175',
  APP_URL: 'http://localhost:5175',
  TRUST_PROXY_HOPS: '0',
  NODE_ENV: 'test',
};

/** Đặt `FAKE_ENV` cho những biến **chưa** có giá trị thật. */
export function applyFakeEnvWhereMissing(): void {
  for (const [key, value] of Object.entries(FAKE_ENV)) {
    if (!process.env[key]?.trim()) {
      process.env[key] = value;
    }
  }
}

/**
 * Có project Supabase thật để chạy test luồng đầy đủ hay không.
 *
 * ⚠️ Kiểm `SUPABASE_URL` **không phải** giá trị giả, chứ không chỉ kiểm nó tồn tại: sau khi
 * `applyFakeEnvWhereMissing()` chạy thì biến nào cũng tồn tại.
 */
export function hasLiveSupabase(): boolean {
  const url = process.env.SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  const encryptionKey = process.env.ENCRYPTION_SECRET_KEY?.trim();

  return Boolean(
    url &&
    url !== FAKE_ENV.SUPABASE_URL &&
    url.startsWith('https://') &&
    secret &&
    secret !== FAKE_ENV.SUPABASE_SECRET_KEY &&
    encryptionKey &&
    encryptionKey !== FAKE_ENV.ENCRYPTION_SECRET_KEY,
  );
}

/**
 * Email dùng một lần cho test đăng ký.
 *
 * ⚠️ Dùng `SMOKE_TEST_EMAIL_DOMAIN` nếu có: Supabase Auth **từ chối** một số tên miền
 * dùng-một-lần, và một số nhà cung cấp SMTP chặn tên miền không tồn tại.
 *
 * ⚠️ Không dùng `Math.random()`: hai lần chạy song song có thể trùng. `process.hrtime.bigint()`
 * đơn điệu tăng trong một tiến trình, cộng thêm `pid` để phân biệt các tiến trình.
 */
export function throwawayEmail(prefix = 'smoke'): string {
  const domain = process.env.SMOKE_TEST_EMAIL_DOMAIN?.trim() || 'example.com';
  return `${prefix}-${process.pid}-${process.hrtime.bigint()}@${domain}`;
}

/** Mã nhân viên dùng một lần — duy nhất theo lần chạy, đúng `EMPLOYEE_CODE_PATTERN`. */
export function throwawayEmployeeCode(prefix = 'T'): string {
  return `${prefix}${process.pid}-${process.hrtime.bigint()}`.slice(0, 30);
}

/** Mật khẩu thoả `PASSWORD_PATTERN`: ≥8 ký tự, có chữ, số và ký tự đặc biệt. */
export const VALID_PASSWORD = 'Smoke#Test2026';
