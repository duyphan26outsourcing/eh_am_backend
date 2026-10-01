import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { Server } from 'node:http';
import {
  VALID_PASSWORD,
  applyFakeEnvWhereMissing,
  createTestApp,
  resetThrottleCounters,
} from './helpers/test-app';

/**
 * ============================================================================
 * SMOKE TEST — CONTRACT CỦA `/v1/auth/*`
 * ============================================================================
 *
 * ⚠️ BỘ TEST NÀY CHẠY ĐƯỢC **NGAY**, KHÔNG CẦN PROJECT SUPABASE
 *
 * Nó kiểm những gì không chạm database: định tuyến và versioning, validation, hình dạng phản
 * hồi lỗi, dịch thông báo theo ngôn ngữ, mã tương quan, giới hạn kích thước body, giới hạn
 * tần suất, header bảo mật.
 *
 * Luồng đầy đủ (đăng ký → xác nhận → đăng nhập → làm mới → đăng xuất) nằm ở
 * `auth-flow.e2e-spec.ts` và cần Supabase thật.
 *
 * ⚠️ VÌ SAO TÁCH HAI FILE
 *
 * Nếu gộp, cả bộ test sẽ bị skip khi chưa có Supabase — kể cả những phép thử không cần nó.
 * Và một bộ test bị skip toàn bộ trong nhiều tuần là một bộ test đã chết mà không ai biết.
 *
 * Chạy: `npm run test:e2e -- auth-contract`
 */

// ⚠️ Phải đặt env TRƯỚC khi `AppModule` (đã import ở helper) khởi tạo provider.
// `applyFakeEnvWhereMissing()` chỉ điền biến còn trống, nên `.env` thật vẫn thắng.
applyFakeEnvWhereMissing();

describe('Auth contract (e2e, không cần Supabase)', () => {
  let app: NestExpressApplication;
  let server: Server;

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // ⚠️ Xoá bộ đếm giới hạn tần suất trước MỖI phép thử — xem `resetThrottleCounters()`.
  beforeEach(() => {
    resetThrottleCounters(app);
  });

  // =========================================================================
  // 1. Định tuyến và versioning
  // =========================================================================

  describe('Versioning', () => {
    it('GET /health — không mang tiền tố version', async () => {
      await request(server).get('/health').expect(200);
    });

    it('⚠️ GET /v1/health → 404 (health nằm NGOÀI versioning)', async () => {
      await request(server).get('/v1/health').expect(404);
    });

    it('⚠️ POST /auth/login (thiếu /v1) → 404', async () => {
      // Phép thử này bảo vệ chính bộ test: nếu `configureApp()` không được gọi thì versioning
      // tắt, `/auth/login` sẽ trả 400/401 thay vì 404 — và mọi test khác đang gọi sai đường dẫn.
      await request(server).post('/auth/login').expect(404);
    });

    it('POST /v2/auth/login → 404 (v2 chưa tồn tại)', async () => {
      await request(server).post('/v2/auth/login').expect(404);
    });

    it.each([
      ['post', '/v1/auth/login'],
      ['post', '/v1/auth/refresh'],
      ['post', '/v1/auth/forgot-password'],
      ['post', '/v1/auth/reset-password'],
    ] as const)('%s %s tồn tại (không 404)', async (method, path) => {
      const res = await request(server)[method](path).send({});
      expect(res.status).not.toBe(404);
    });

    it('POST /v1/auth/resend-confirmation đã đóng', async () => {
      await request(server)
        .post('/v1/auth/resend-confirmation')
        .send({})
        .expect(404);
    });
  });

  // =========================================================================
  // 2. Guard — route cần đăng nhập
  // =========================================================================

  describe('Guard trên route cần đăng nhập', () => {
    it.each([
      ['get', '/v1/auth/me'],
      ['post', '/v1/auth/logout'],
      ['post', '/v1/auth/logout-all'],
      ['post', '/v1/auth/change-password'],
      ['get', '/v1/org-chart'],
      [
        'post',
        '/v1/employees/11111111-1111-4111-8111-111111111111/resend-invite',
      ],
    ] as const)('%s %s không token → 401', async (method, path) => {
      const res = await request(server)[method](path).send({});
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('ACCESS_TOKEN_MISSING');
    });

    it('Authorization không mở đầu bằng "Bearer " → 401', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', 'Token abc');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('ACCESS_TOKEN_MISSING');
    });

    it('⚠️ token là chuỗi rác → 401 ACCESS_TOKEN_INVALID (không phải 500)', async () => {
      // Chuỗi rác thất bại ở bước giải mã AES. Nếu nó trả 500 thì lỗi giải mã đang lọt ra
      // ngoài chưa được bắt — và thông báo 500 có thể chứa chi tiết về thuật toán.
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer khong-phai-token');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('ACCESS_TOKEN_INVALID');
    });

    it('⚠️ /v1/auth/refresh KHÔNG có guard (access token đã hết hạn là lý do gọi)', async () => {
      const res = await request(server).post('/v1/auth/refresh').send({});
      expect(res.status).not.toBe(401);
      expect(res.status).toBe(400); // thiếu refreshToken → lỗi validation
    });
  });

  // =========================================================================
  // 3. Hình dạng phản hồi lỗi — contract với frontend
  // =========================================================================

  describe('Hình dạng phản hồi lỗi', () => {
    it('có đủ statusCode · code · message · path · requestId', async () => {
      const res = await request(server).get('/v1/auth/me');

      expect(res.body).toMatchObject({
        statusCode: 401,
        code: 'ACCESS_TOKEN_MISSING',
        path: '/v1/auth/me',
      });
      expect(typeof res.body.message).toBe('string');
      expect(res.body.message.length).toBeGreaterThan(0);
      expect(typeof res.body.requestId).toBe('string');
    });

    it('⚠️ `path` KHÔNG mang query string (có thể chứa từ khoá tìm kiếm)', async () => {
      const res = await request(server).get('/v1/auth/me?q=Nguyen%20Van%20A');
      expect(res.body.path).toBe('/v1/auth/me');
    });

    it('⚠️ requestId trong body KHỚP header x-request-id', async () => {
      const res = await request(server).get('/v1/auth/me');

      expect(res.headers['x-request-id']).toBeDefined();
      expect(res.body.requestId).toBe(res.headers['x-request-id']);
    });

    it('nhận lại x-request-id do client gửi khi đúng định dạng UUID', async () => {
      const supplied = '11111111-2222-4333-8444-555555555555';
      const res = await request(server)
        .get('/v1/auth/me')
        .set('x-request-id', supplied);

      expect(res.headers['x-request-id']).toBe(supplied);
      expect(res.body.requestId).toBe(supplied);
    });

    it('⚠️ BỎ QUA x-request-id không phải UUID (chống tiêm ký tự vào log)', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('x-request-id', 'khong-phai-uuid');

      expect(res.headers['x-request-id']).not.toBe('khong-phai-uuid');
      expect(res.headers['x-request-id']).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    it('⚠️ 404 không khớp route → KHÔNG kèm `errors` (không lộ câu nội bộ "Cannot GET …")', async () => {
      const res = await request(server).get('/v1/khong-ton-tai');

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
      expect(res.body.errors).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('Cannot GET');
    });
  });

  // =========================================================================
  // 4. Validation
  // =========================================================================

  describe('Validation — làm mới phiên', () => {
    it('thiếu refreshToken → 400', async () => {
      const res = await request(server).post('/v1/auth/refresh').send({});
      expect(res.status).toBe(400);
    });

    it('refreshToken rỗng → 400', async () => {
      const res = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: '' });
      expect(res.status).toBe(400);
    });

    it('⚠️ refreshToken 5000 ký tự → 400 (MaxLength 4096 chặn tiêu CPU)', async () => {
      const res = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'x'.repeat(5000) });
      expect(res.status).toBe(400);
    });

    it('refreshToken rác nhưng đúng kiểu → 401 REFRESH_TOKEN_INVALID (giải mã thất bại)', async () => {
      const res = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'rac-hoan-toan' });
      expect(res.status).toBe(401);
      expect(res.body.code).toBe('REFRESH_TOKEN_INVALID');
    });
  });

  describe('Validation — mật khẩu', () => {
    it('forgot-password thiếu email → 400', async () => {
      const res = await request(server)
        .post('/v1/auth/forgot-password')
        .send({});
      expect(res.status).toBe(400);
    });

    it('reset-password thiếu accessToken → 400', async () => {
      const res = await request(server)
        .post('/v1/auth/reset-password')
        .send({ newPassword: VALID_PASSWORD });
      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // 5. Đa ngôn ngữ — điểm này là lý do lớp i18n tồn tại
  // =========================================================================

  describe('⚠️ Thông báo lỗi theo ngôn ngữ', () => {
    it('không có Accept-Language → tiếng Việt (mặc định)', async () => {
      const res = await request(server).get('/v1/auth/me');
      expect(res.body.code).toBe('ACCESS_TOKEN_MISSING');
      expect(res.body.message).toContain('Thiếu access token');
    });

    it('Accept-Language: en → tiếng Anh', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'en');

      expect(res.body.code).toBe('ACCESS_TOKEN_MISSING');
      expect(res.body.message).toBe('Missing access token.');
    });

    it('⚠️ mã lỗi GIỮ NGUYÊN khi đổi ngôn ngữ (message đổi, code không)', async () => {
      // Contract quan trọng nhất của lớp i18n: frontend phân nhánh theo `code`, nên `code`
      // phải bất biến theo ngôn ngữ.
      const vi = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'vi');
      const en = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'en');

      expect(vi.body.code).toBe(en.body.code);
      expect(vi.body.message).not.toBe(en.body.message);
    });

    it('⚠️ en-US khớp en (so theo phần ngôn ngữ, bỏ phần vùng)', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'en-US,en;q=0.9');

      expect(res.body.message).toBe('Missing access token.');
    });

    it('⚠️ sắp theo q giảm dần, KHÔNG lấy phần tử đầu', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'en;q=0.5,vi;q=0.9');

      expect(res.body.message).toContain('Thiếu access token');
    });

    it('ngôn ngữ không hỗ trợ → rơi về tiếng Việt', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'ja,ko;q=0.8');

      expect(res.body.message).toContain('Thiếu access token');
    });

    it('Accept-Language rác → không lỗi, rơi về mặc định', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', ';;;q=abc,,,');

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Thiếu access token');
    });

    it('⚠️ Accept-Language rất dài → không treo (cắt ở 200 ký tự)', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Accept-Language', 'xx,'.repeat(2000) + 'en');

      expect(res.status).toBe(401);
      expect(typeof res.body.message).toBe('string');
    });
  });

  // =========================================================================
  // 6. Giới hạn kích thước body
  // =========================================================================

  describe('Giới hạn kích thước body', () => {
    it('⚠️ body 300 KB → 413', async () => {
      const res = await request(server)
        .post('/v1/auth/login')
        .send({ email: 'a@example.com', password: 'x'.repeat(320_000) });

      expect(res.status).toBe(413);
      expect(res.body.code).toBe('PAYLOAD_TOO_LARGE');
    });
  });

  // =========================================================================
  // 8. Header bảo mật
  // =========================================================================

  describe('Header bảo mật (helmet)', () => {
    it('có X-Content-Type-Options: nosniff', async () => {
      const res = await request(server).get('/health');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('KHÔNG lộ X-Powered-By', async () => {
      const res = await request(server).get('/health');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });
  });

  // =========================================================================
  // 9. Không rò rỉ thông tin
  // =========================================================================

  describe('⚠️ Không rò rỉ thông tin trong phản hồi lỗi', () => {
    it('không có stack trace', async () => {
      const res = await request(server).get('/v1/auth/me');
      const body = JSON.stringify(res.body);

      expect(body).not.toMatch(/\bat .*\.ts:\d+/);
      expect(res.body.stack).toBeUndefined();
    });

    it('không lộ tên bảng, tên cột, hay chuỗi kết nối', async () => {
      const res = await request(server).post('/v1/auth/login').send({});
      const body = JSON.stringify(res.body).toLowerCase();

      expect(body).not.toContain('user_profiles');
      expect(body).not.toContain('auth.users');
      expect(body).not.toContain('supabase.co');
      expect(body).not.toContain('service_role');
    });

    it('⚠️ không lộ mật khẩu vừa gửi lên', async () => {
      const res = await request(server)
        .post('/v1/auth/login')
        .send({ email: 'x', password: 'MatKhauBiMat#1' });

      expect(JSON.stringify(res.body)).not.toContain('MatKhauBiMat');
    });
  });
});
