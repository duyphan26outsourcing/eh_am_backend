import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type { Server } from 'node:http';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.types';
import {
  VALID_PASSWORD,
  createTestApp,
  hasLiveSupabase,
  resetThrottleCounters,
  throwawayEmail,
  throwawayEmployeeCode,
} from './helpers/test-app';

/**
 * ============================================================================
 * SMOKE TEST — LUỒNG AUTH ĐẦY ĐỦ (CẦN SUPABASE THẬT)
 * ============================================================================
 *
 * Kiểm end-to-end: đăng ký → xác nhận email → đăng nhập → làm mới phiên → đăng xuất, ba
 * luồng mật khẩu, và các bất biến của tầng dữ liệu (lịch sử không sửa/xoá được).
 *
 * ============================================================================
 * ⚠️ ĐIỀU KIỆN CHẠY
 * ============================================================================
 *
 * Cần **cả ba**:
 *
 *   1. `.env.development.local` có `SUPABASE_URL`, `SUPABASE_SECRET_KEY`,
 *      `SUPABASE_PUBLISHABLE_KEY`, `ENCRYPTION_SECRET_KEY` **thật**.
 *   2. Đã chạy `sql-docs/migrations/01_identity_rbac_audit.sql` trên project đó.
 *   3. `SMOKE_TEST_ALLOW_WRITES=true` — xem §Rào chắn.
 *
 * Thiếu bất kỳ điều kiện nào → toàn bộ describe bị **skip** kèm thông báo rõ.
 *
 * ⚠️ SKIP, KHÔNG PHẢI PASS. Một test "xanh" vì nó không chạy là tệ hơn không có test: nó tạo
 * niềm tin sai. Jest hiển thị số test bị skip, nên tình trạng đó nhìn thấy được.
 *
 * ============================================================================
 * §Rào chắn — vì sao cần `SMOKE_TEST_ALLOW_WRITES`
 * ============================================================================
 *
 * Bộ test này **ghi thật** vào `auth.users`, `user_profiles`, `context_role_assignments` và
 * `audit_events`. Nếu ai đó vô tình chạy nó với cấu hình production thì nó sẽ tạo tài khoản rác
 * trên production và ghi vào hai bảng **không xoá được**. Một biến môi trường phải bật tường
 * minh làm việc đó không xảy ra do vô tình.
 *
 * Chạy (PowerShell):  $env:SMOKE_TEST_ALLOW_WRITES='true'; npm run test:e2e -- auth-flow
 * Chạy (bash):        SMOKE_TEST_ALLOW_WRITES=true npm run test:e2e -- auth-flow
 *
 * ============================================================================
 * ⚠️ DỌN DẸP
 * ============================================================================
 *
 * `afterAll` xoá mọi tài khoản đã tạo bằng `admin.deleteUser` (hồ sơ xoá theo cascade). Dòng
 * trong `audit_events` và `context_role_assignments` **không xoá được** — đúng thiết kế
 * "không bao giờ xoá lịch sử", và là lý do bộ test này không được chạy trên production.
 */

const LIVE = hasLiveSupabase();
const WRITES_ALLOWED = process.env.SMOKE_TEST_ALLOW_WRITES === 'true';
const CAN_RUN = LIVE && WRITES_ALLOWED;

if (!CAN_RUN) {
  const reason = !LIVE
    ? 'chưa có SUPABASE_URL / SUPABASE_SECRET_KEY / ENCRYPTION_SECRET_KEY thật ' +
      '(đang dùng giá trị giả trong test/helpers/test-app.ts)'
    : 'thiếu SMOKE_TEST_ALLOW_WRITES=true';

  console.warn(
    `\n⚠️  BỎ QUA auth-flow.e2e-spec.ts: ${reason}.\n` +
      '   Bộ test này GHI THẬT vào Supabase (tạo tài khoản, đổi mật khẩu, thu hồi phiên).\n' +
      '   Chạy: SMOKE_TEST_ALLOW_WRITES=true npm run test:e2e -- auth-flow\n',
  );
}

const describeLive = CAN_RUN ? describe : describe.skip;

const PLATFORM_CONTEXT_ID = '00000000-0000-0000-0000-000000000000';

describeLive('Auth flow (e2e, cần Supabase thật)', () => {
  let app: NestExpressApplication;
  let server: Server;

  /**
   * `auth.users.id` của mọi tài khoản đã tạo — `afterAll` xoá hết.
   *
   * ⚠️ LƯU **ID**, KHÔNG LƯU EMAIL RỒI TRA LẠI BẰNG `listUsers()`: `listUsers()` phân trang và
   * mặc định chỉ trả trang đầu, nên việc dọn dẹp sẽ im lặng bỏ sót tài khoản.
   */
  const createdUserIds: string[] = [];

  /**
   * Client `service_role` dùng cho dọn dẹp và các bước thao tác trực tiếp lên database.
   *
   * ⚠️ Khai generic `<Database>`: không có nó thì `.from('user_profiles')` trả `any`, và một
   * `expect` đọc cột không tồn tại vẫn biên dịch được rồi so `undefined` với `undefined`.
   */
  const admin = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  /**
   * Tạo một tài khoản **đã xác nhận email** và sẵn sàng đăng nhập.
   *
   * ⚠️ Đi qua `/v1/auth/register` để kiểm đúng luồng thật, rồi xác nhận email bằng
   * `admin.updateUserById` — không có cách nào đọc được liên kết trong email từ trong test.
   */
  async function createConfirmedAccount(prefix: string): Promise<{
    email: string;
    userId: string;
  }> {
    const email = throwawayEmail(prefix);

    const res = await request(server).post('/v1/auth/register').send({
      email,
      password: VALID_PASSWORD,
      displayName: 'Người Dùng Smoke Test',
    });

    expect(res.status).toBe(201);
    createdUserIds.push(res.body.userId as string);

    const userId: string = res.body.userId;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });
    expect(error).toBeNull();

    return { email, userId };
  }

  async function login(email: string) {
    const res = await request(server)
      .post('/v1/auth/login')
      .send({ email, password: VALID_PASSWORD });
    expect(res.status).toBe(201);
    return res.body as {
      user: { id: string; displayName: string; employeeCode: string | null };
      session: {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };
    };
  }

  beforeAll(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    for (const userId of createdUserIds) {
      const { error } = await admin.auth.admin.deleteUser(userId);
      if (error) {
        // Không `throw`: một lỗi dọn dẹp không được làm cả bộ test đỏ. Nhưng phải in ra — một
        // tài khoản rác còn lại mà không ai biết sẽ tích lại qua từng lần chạy.
        console.warn(
          `Không xoá được tài khoản test ${userId}: ${error.message}`,
        );
      }
    }
    await app.close();
  });

  beforeEach(() => {
    resetThrottleCounters(app);
  });

  // =========================================================================
  // 1. Đăng ký
  // =========================================================================

  describe('POST /v1/auth/register', () => {
    it('tạo CẢ auth.users VÀ user_profiles', async () => {
      const email = throwawayEmail('reg');
      const employeeCode = throwawayEmployeeCode('eh');
      const res = await request(server).post('/v1/auth/register').send({
        email,
        password: VALID_PASSWORD,
        displayName: 'Nguyễn Văn A',
        employeeCode,
      });

      expect(res.status).toBe(201);
      expect(res.body.userId).toBeDefined();
      createdUserIds.push(res.body.userId as string);

      const userId: string = res.body.userId;

      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      expect(authUser?.user?.email?.toLowerCase()).toBe(email.toLowerCase());

      // ⚠️ user_profiles — `id` PHẢI bằng `auth.users.id`
      const { data: profile } = await admin
        .from('user_profiles')
        .select('id, display_name, employee_code, status, preferred_locale')
        .eq('id', userId)
        .maybeSingle();

      expect(profile).not.toBeNull();
      expect(profile!.id).toBe(userId);
      expect(profile!.status).toBe('ACTIVE');
      expect(profile!.preferred_locale).toBe('vi');
      // ⚠️ Giữ nguyên dấu tiếng Việt
      expect(profile!.display_name).toBe('Nguyễn Văn A');
      // ⚠️ Mã nhân viên được chuẩn hoá in hoa (khớp CHECK ở database)
      expect(profile!.employee_code).toBe(employeeCode.toUpperCase());
    });

    it('⚠️ email CHƯA xác nhận (email_confirm: false)', async () => {
      const email = throwawayEmail('unconf');
      const res = await request(server).post('/v1/auth/register').send({
        email,
        password: VALID_PASSWORD,
        displayName: 'Chưa Xác Nhận',
      });
      createdUserIds.push(res.body.userId as string);

      const { data } = await admin.auth.admin.getUserById(
        res.body.userId as string,
      );
      expect(data?.user?.email_confirmed_at).toBeFalsy();
    });

    it('ghi audit identity.profile.created kèm Trước/Sau', async () => {
      const email = throwawayEmail('audit');
      const res = await request(server).post('/v1/auth/register').send({
        email,
        password: VALID_PASSWORD,
        displayName: 'Audit Test',
      });
      createdUserIds.push(res.body.userId as string);

      const { data } = await admin
        .from('audit_events')
        .select(
          'event_code, actor_id, actor_label, changes, metadata, request_id',
        )
        .eq('actor_id', res.body.userId as string)
        .eq('event_code', 'identity.profile.created')
        .maybeSingle();

      expect(data).not.toBeNull();
      expect(data!.metadata).toMatchObject({ source: 'self_register' });
      expect(data!.actor_label).toBe('Audit Test');
      expect(data!.changes).toMatchObject({
        display_name: { from: null, to: 'Audit Test' },
      });
      expect(typeof data!.request_id).toBe('string');
    });

    it('⚠️ mã nhân viên trùng → 409 EMPLOYEE_CODE_TAKEN và KHÔNG tạo tài khoản thứ hai', async () => {
      const sharedCode = throwawayEmployeeCode('dup');

      const r1 = await request(server)
        .post('/v1/auth/register')
        .send({
          email: throwawayEmail('ec1'),
          password: VALID_PASSWORD,
          displayName: 'Người Một',
          employeeCode: sharedCode,
        });
      expect(r1.status).toBe(201);
      createdUserIds.push(r1.body.userId as string);

      const secondEmail = throwawayEmail('ec2');
      const r2 = await request(server).post('/v1/auth/register').send({
        email: secondEmail,
        password: VALID_PASSWORD,
        displayName: 'Người Hai',
        // ⚠️ Khác chữ hoa/thường vẫn phải bị coi là trùng
        employeeCode: sharedCode.toLowerCase(),
      });

      expect(r2.status).toBe(409);
      expect(r2.body.code).toBe('EMPLOYEE_CODE_TAKEN');

      // ⚠️ Kiểm mã chạy TRƯỚC createUser, nên không có tài khoản nào được tạo cho email thứ hai.
      const probe = await request(server)
        .post('/v1/auth/login')
        .send({ email: secondEmail, password: VALID_PASSWORD });
      expect(probe.body.code).toBe('CREDENTIALS_INVALID');
    });

    it('email đã tồn tại → lỗi trung tính, KHÔNG nói "email đã tồn tại"', async () => {
      const email = throwawayEmail('dup');
      const first = await request(server).post('/v1/auth/register').send({
        email,
        password: VALID_PASSWORD,
        displayName: 'Lần Một',
      });
      createdUserIds.push(first.body.userId as string);

      const res = await request(server).post('/v1/auth/register').send({
        email,
        password: VALID_PASSWORD,
        displayName: 'Lần Hai',
      });

      expect(res.status).toBeGreaterThanOrEqual(400);
      const body = JSON.stringify(res.body).toLowerCase();
      expect(body).not.toContain('already registered');
      expect(body).not.toContain('đã tồn tại');
    });
  });

  // =========================================================================
  // 2. Đăng nhập
  // =========================================================================

  describe('POST /v1/auth/login', () => {
    it('⚠️ chưa xác nhận email → KHÔNG đăng nhập được', async () => {
      const email = throwawayEmail('noconf');
      const created = await request(server).post('/v1/auth/register').send({
        email,
        password: VALID_PASSWORD,
        displayName: 'Chưa Xác Nhận',
      });
      createdUserIds.push(created.body.userId as string);

      const res = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: VALID_PASSWORD });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('EMAIL_NOT_CONFIRMED');
    });

    it('đã xác nhận → 201, session có đúng 5 trường', async () => {
      const { email } = await createConfirmedAccount('login');
      const body = await login(email);

      expect(Object.keys(body.session).sort()).toEqual([
        'access_token',
        'expires_at',
        'expires_in',
        'refresh_token',
        'token_type',
      ]);
    });

    it('⚠️ session KHÔNG chứa `user`, `provider_token`, `provider_refresh_token`', async () => {
      const { email } = await createConfirmedAccount('nospread');
      const body = await login(email);
      const session = body.session as Record<string, unknown>;

      expect(session.user).toBeUndefined();
      expect(session.provider_token).toBeUndefined();
      expect(session.provider_refresh_token).toBeUndefined();
    });

    it('⚠️ access_token KHÔNG phải JWT thô (đã mã hoá AES)', async () => {
      const { email } = await createConfirmedAccount('enc');
      const body = await login(email);

      // ⚠️ KHÔNG kiểm tiền tố 'eyJ' — cả JWT lẫn payload mã hoá (`{"iv"...`) đều bắt đầu bằng
      // nó. Dấu hiệu phân biệt thật: JWT có đúng 3 đoạn cách nhau bởi dấu chấm.
      expect(body.session.access_token.split('.')).toHaveLength(1);
      expect(body.session.refresh_token.split('.')).toHaveLength(1);

      const decoded: unknown = JSON.parse(
        Buffer.from(body.session.access_token, 'base64').toString('utf8'),
      );
      expect(decoded).toMatchObject({
        iv: expect.any(String),
        authTag: expect.any(String),
        data: expect.any(String),
      });
    });

    it('access_token dùng được với /v1/auth/me — tài khoản mới CHƯA có vai trò nào', async () => {
      const { email } = await createConfirmedAccount('me');
      const body = await login(email);

      const res = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${body.session.access_token}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(body.user.id);
      expect(res.body.isSuperAdmin).toBe(false);
      expect(res.body.preferredLocale).toBe('vi');
      // ⚠️ Đăng ký ≠ có quyền.
      expect(res.body.platformRoles).toEqual([]);
      expect(res.body.locationRoles).toEqual([]);
    });

    it('⚠️ /me trả vai trò theo phạm vi, và vai trò đã thu hồi biến mất NGAY', async () => {
      const { email, userId } = await createConfirmedAccount('roles');
      const body = await login(email);
      const locationId = '5b1c7c1e-6f7a-4d1b-9a53-1d1e2f3a4b5c';

      const { data: granted, error: grantError } = await admin
        .from('context_role_assignments')
        .insert([
          {
            subject_id: userId,
            context_type: 'PLATFORM',
            context_id: PLATFORM_CONTEXT_ID,
            role_code: 'ASSET_MANAGER',
            grant_reason: 'smoke test',
          },
          {
            subject_id: userId,
            context_type: 'LOCATION',
            context_id: locationId,
            role_code: 'LOCATION_MANAGER',
            grant_reason: 'smoke test',
          },
        ])
        .select('id, role_code');
      expect(grantError).toBeNull();

      const withRoles = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${body.session.access_token}`);
      expect(withRoles.body.platformRoles).toEqual(['ASSET_MANAGER']);
      expect(withRoles.body.locationRoles).toEqual([
        { locationId, roleCode: 'LOCATION_MANAGER' },
      ]);

      // Thu hồi đúng cách: đóng hiệu lực + người thu hồi + lý do.
      const platformRow = granted!.find(
        (r) => r.role_code === 'ASSET_MANAGER',
      )!;
      const { error: revokeError } = await admin
        .from('context_role_assignments')
        .update({
          effective_to: new Date().toISOString(),
          revoked_by: userId,
          revoke_reason: 'smoke test thu hồi',
        })
        .eq('id', platformRow.id);
      expect(revokeError).toBeNull();

      const afterRevoke = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${body.session.access_token}`);
      expect(afterRevoke.body.platformRoles).toEqual([]);
      expect(afterRevoke.body.locationRoles).toHaveLength(1);
    });

    it('⚠️ refresh_token đã mã hoá KHÔNG dùng được trực tiếp với Supabase', async () => {
      // Nếu phép thử này THÀNH CÔNG thì mọi lần làm mới có thể đi vòng qua backend — bỏ qua
      // rate limit, audit, và việc kiểm `user_profiles.status`.
      const { email } = await createConfirmedAccount('bypass');
      const body = await login(email);

      const anon = createClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } },
      );
      const { data, error } = await anon.auth.refreshSession({
        refresh_token: body.session.refresh_token,
      });

      expect(error).not.toBeNull();
      expect(data.session).toBeNull();
    });

    it('sai mật khẩu → 401 CREDENTIALS_INVALID + audit login_failed KHÔNG chứa email', async () => {
      const { email } = await createConfirmedAccount('wrongpw');

      const res = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: 'Sai#MatKhau9' });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('CREDENTIALS_INVALID');

      const { data } = await admin
        .from('audit_events')
        .select('event_code, actor_id, metadata')
        .eq('event_code', 'auth.session.login_failed')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(data?.[0]).toBeDefined();
      expect(data![0].actor_id).toBeNull();
      expect(JSON.stringify(data![0].metadata)).not.toContain('@');
    });

    it('⚠️ email không tồn tại → câu GIỐNG HỆT sai mật khẩu', async () => {
      const { email } = await createConfirmedAccount('enum');

      const wrongPw = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: 'Sai#MatKhau9' });

      resetThrottleCounters(app);

      const noUser = await request(server)
        .post('/v1/auth/login')
        .send({ email: throwawayEmail('nobody'), password: VALID_PASSWORD });

      expect(noUser.body.code).toBe(wrongPw.body.code);
      expect(noUser.body.message).toBe(wrongPw.body.message);
    });

    it('tài khoản SUSPENDED → 403 ACCOUNT_INACTIVE', async () => {
      const { email, userId } = await createConfirmedAccount('susp');
      await admin
        .from('user_profiles')
        .update({ status: 'SUSPENDED' })
        .eq('id', userId);

      const res = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: VALID_PASSWORD });

      // ⚠️ 403, KHÔNG PHẢI 401: thông tin đăng nhập ĐÚNG (nên không phải "chưa xác thực"),
      // nhưng tài khoản không được phép vào. Một mã lỗi = một mã HTTP trên toàn hệ thống.
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCOUNT_INACTIVE');
      expect(res.body.message).toContain('SUSPENDED');
    });

    it('⚠️ DEACTIVATED (nghỉ việc) sau khi đã có token → request tiếp theo 403 NGAY', async () => {
      const { email, userId } = await createConfirmedAccount('deact');
      const body = await login(email);

      await admin
        .from('user_profiles')
        .update({ status: 'DEACTIVATED' })
        .eq('id', userId);

      const res = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${body.session.access_token}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCOUNT_INACTIVE');
    });

    it('⚠️ không có user_profiles → 403 PROFILE_NOT_INITIALIZED (KHÔNG 401)', async () => {
      // Tạo tài khoản **chỉ ở `auth.users`** (bỏ qua `/v1/auth/register`) — đúng trạng thái
      // mà lỗi này mô tả: có tài khoản xác thực, chưa có hồ sơ người dùng Every Half.
      const email = throwawayEmail('noprof');
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email,
          password: VALID_PASSWORD,
          email_confirm: true,
        });
      expect(createErr).toBeNull();

      const newUser = created?.user;
      if (!newUser) throw new Error('admin.createUser không trả về user');
      createdUserIds.push(newUser.id);

      const res = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: VALID_PASSWORD });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('PROFILE_NOT_INITIALIZED');
    });
  });

  // =========================================================================
  // 3. Làm mới phiên
  //
  // ⚠️ Backend **không** tự làm mới token — frontend làm (xem
  // `eh_am_frontend/src/lib/api/client.ts`). Các test dưới đây kiểm đúng hợp đồng đó.
  // =========================================================================

  describe('POST /v1/auth/refresh', () => {
    it('⚠️ backend KHÔNG tự làm mới: token hỏng → 401, KHÔNG kèm token mới', async () => {
      const res = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', 'Bearer token-khong-hop-le');

      expect(res.status).toBe(401);
      const body = JSON.stringify(res.body);
      expect(body).not.toContain('access_token');
      expect(body).not.toContain('refresh_token');
      expect(res.headers['set-cookie']).toBeUndefined();
    });

    it('⚠️ trả `expires_in` để frontend hẹn giờ làm mới CHỦ ĐỘNG', async () => {
      const { email } = await createConfirmedAccount('expin');
      const body = await login(email);

      expect(typeof body.session.expires_in).toBe('number');
      expect(body.session.expires_in).toBeGreaterThan(0);
    });

    it('trả cặp token MỚI, khác cặp cũ, và access token mới dùng được', async () => {
      const { email } = await createConfirmedAccount('refr');
      const body = await login(email);

      const res = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: body.session.refresh_token });

      expect(res.status).toBe(200);
      expect(res.body.session.refresh_token).not.toBe(
        body.session.refresh_token,
      );
      expect(res.body.session.access_token).not.toBe(body.session.access_token);

      const me = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${res.body.session.access_token}`);
      expect(me.status).toBe(200);
    });

    it('làm mới nhiều lần liên tiếp đều thành công (chuỗi 3 lần)', async () => {
      const { email } = await createConfirmedAccount('chain');
      const body = await login(email);

      let rt = body.session.refresh_token;
      for (let i = 1; i <= 3; i++) {
        const res = await request(server)
          .post('/v1/auth/refresh')
          .send({ refreshToken: rt });

        expect(res.status).toBe(200);
        expect(res.body.session.refresh_token).not.toBe(rt);
        rt = res.body.session.refresh_token;
      }
    });

    it('⚠️ HÀNH VI ĐO ĐƯỢC: refresh token cũ VẪN dùng được sau khi xoay vòng', async () => {
      // Đo trên Supabase (dự án Avantily): cấu hình mặc định cấp token mới nhưng không thu hồi
      // token cũ. ⚠️ Test này tồn tại để PHÁT HIỆN khi cấu hình đó đổi (bật "refresh token
      // reuse detection") — lúc đó lớp gộp lời gọi làm mới ở frontend trở thành bắt buộc tuyệt
      // đối, và test này sẽ đỏ để báo.
      const { email } = await createConfirmedAccount('rot');
      const body = await login(email);

      const first = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: body.session.refresh_token });
      expect(first.status).toBe(200);

      const reuse = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: body.session.refresh_token });

      expect(reuse.status).toBe(200);
    });

    it('⚠️ token bị sửa → 401 (thẻ xác thực GCM chặn)', async () => {
      const { email } = await createConfirmedAccount('tamper');
      const body = await login(email);

      const tampered =
        body.session.refresh_token.slice(0, -4) +
        (body.session.refresh_token.slice(-4) === 'AAAA' ? 'BBBB' : 'AAAA');

      const res = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: tampered });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('REFRESH_TOKEN_INVALID');
    });

    it('⚠️ audit refresh_rejected KHÔNG chứa chuỗi token', async () => {
      await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: 'chuoi-rac-de-nhan-dien-12345' });

      const { data } = await admin
        .from('audit_events')
        .select('metadata')
        .eq('event_code', 'auth.session.refresh_rejected')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(data?.[0]).toBeDefined();
      const meta = JSON.stringify(data![0].metadata);
      expect(meta).not.toContain('chuoi-rac-de-nhan-dien');
      expect(meta).toContain('decrypt_failed');
    });

    it('⚠️ tài khoản SUSPENDED: 403 VÀ thu hồi luôn mọi phiên', async () => {
      const { email, userId } = await createConfirmedAccount('rsusp');
      const body = await login(email);

      await admin
        .from('user_profiles')
        .update({ status: 'SUSPENDED' })
        .eq('id', userId);

      const blocked = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: body.session.refresh_token });
      expect(blocked.status).toBe(403);
      expect(blocked.body.code).toBe('ACCOUNT_INACTIVE');

      // Mở lại tài khoản — refresh token cũ vẫn phải CHẾT, vì nó đã bị thu hồi ở bước trên.
      await admin
        .from('user_profiles')
        .update({ status: 'ACTIVE' })
        .eq('id', userId);

      const stillDead = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: body.session.refresh_token });
      expect(stillDead.status).toBe(401);
      expect(stillDead.body.code).toBe('REFRESH_TOKEN_INVALID');
    });

    it('⚠️ 10 lần/phút: lần thứ 11 → 429', async () => {
      const { email } = await createConfirmedAccount('rrate');
      const body = await login(email);

      let rt = body.session.refresh_token;
      for (let i = 0; i < 10; i++) {
        const res = await request(server)
          .post('/v1/auth/refresh')
          .send({ refreshToken: rt });
        expect(res.status).toBe(200);
        rt = res.body.session.refresh_token;
      }

      const blocked = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: rt });

      expect(blocked.status).toBe(429);
      expect(Number(blocked.headers['retry-after'])).toBeGreaterThanOrEqual(1);
    });
  });

  // =========================================================================
  // 4. Đăng xuất
  // =========================================================================

  describe('POST /v1/auth/logout', () => {
    it('⚠️ THU HỒI THẬT: refresh token sau đó không dùng được', async () => {
      const { email } = await createConfirmedAccount('lo');
      const body = await login(email);

      const out = await request(server)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${body.session.access_token}`);
      expect(out.status).toBe(200);

      const refresh = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: body.session.refresh_token });
      expect(refresh.status).toBe(401);
    });

    it('⚠️ phạm vi `local`: phiên KHÁC vẫn sống', async () => {
      const { email } = await createConfirmedAccount('loc');
      const a = await login(email);
      resetThrottleCounters(app);
      const b = await login(email);

      await request(server)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${a.session.access_token}`);

      const refreshB = await request(server)
        .post('/v1/auth/refresh')
        .send({ refreshToken: b.session.refresh_token });

      expect(refreshB.status).toBe(200);
    });

    it('đăng xuất lần hai bằng token đã chết → vẫn 200', async () => {
      const { email } = await createConfirmedAccount('lo2');
      const body = await login(email);

      await request(server)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${body.session.access_token}`);

      const again = await request(server)
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${body.session.access_token}`);

      expect(again.status).toBe(200);
    });

    it('⚠️ logout-all phạm vi `global`: MỌI phiên chết', async () => {
      const { email } = await createConfirmedAccount('loall');
      const a = await login(email);
      resetThrottleCounters(app);
      const b = await login(email);

      const out = await request(server)
        .post('/v1/auth/logout-all')
        .set('Authorization', `Bearer ${a.session.access_token}`);
      expect(out.status).toBe(200);

      for (const s of [a, b]) {
        const res = await request(server)
          .post('/v1/auth/refresh')
          .send({ refreshToken: s.session.refresh_token });
        expect(res.status).toBe(401);
      }
    });
  });

  // =========================================================================
  // 5. Mật khẩu
  // =========================================================================

  describe('Quên mật khẩu', () => {
    it('⚠️ email tồn tại và không tồn tại trả CÙNG một câu', async () => {
      const { email } = await createConfirmedAccount('fp');

      const exists = await request(server)
        .post('/v1/auth/forgot-password')
        .send({ email });
      resetThrottleCounters(app);
      const notExists = await request(server)
        .post('/v1/auth/forgot-password')
        .send({ email: throwawayEmail('nope') });

      expect(exists.status).toBe(200);
      expect(notExists.status).toBe(200);
      expect(notExists.body.message).toBe(exists.body.message);
    });

    it('ghi audit password.reset_requested, KHÔNG chứa email', async () => {
      await request(server)
        .post('/v1/auth/forgot-password')
        .send({ email: throwawayEmail('fpaudit') });

      const { data } = await admin
        .from('audit_events')
        .select('actor_id, metadata')
        .eq('event_code', 'auth.password.reset_requested')
        .order('created_at', { ascending: false })
        .limit(1);

      expect(data?.[0]).toBeDefined();
      expect(data![0].actor_id).toBeNull();
      expect(JSON.stringify(data![0].metadata)).not.toContain('@');
    });
  });

  describe('POST /v1/auth/change-password', () => {
    const NEW_PASSWORD = 'Doi#MatKhau2026';

    it('mật khẩu hiện tại SAI → 400 và mật khẩu KHÔNG đổi', async () => {
      const { email } = await createConfirmedAccount('cp1');
      const body = await login(email);

      const res = await request(server)
        .post('/v1/auth/change-password')
        .set('Authorization', `Bearer ${body.session.access_token}`)
        .send({ currentPassword: 'Sai#MatKhau9', newPassword: NEW_PASSWORD });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('CURRENT_PASSWORD_INCORRECT');

      resetThrottleCounters(app);
      const stillWorks = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: VALID_PASSWORD });
      expect(stillWorks.status).toBe(201);
    });

    it('mật khẩu mới TRÙNG mật khẩu cũ → 400', async () => {
      const { email } = await createConfirmedAccount('cp2');
      const body = await login(email);

      const res = await request(server)
        .post('/v1/auth/change-password')
        .set('Authorization', `Bearer ${body.session.access_token}`)
        .send({
          currentPassword: VALID_PASSWORD,
          newPassword: VALID_PASSWORD,
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NEW_PASSWORD_SAME_AS_CURRENT');
    });

    it('⚠️ Supabase thu hồi MỌI phiên khi đổi mật khẩu (kể cả phiên đang gọi)', async () => {
      const { email } = await createConfirmedAccount('cp3');
      const a = await login(email);
      resetThrottleCounters(app);
      const b = await login(email);

      const changed = await request(server)
        .post('/v1/auth/change-password')
        .set('Authorization', `Bearer ${a.session.access_token}`)
        .send({ currentPassword: VALID_PASSWORD, newPassword: NEW_PASSWORD });
      expect(changed.status).toBe(200);
      expect(changed.body.sessionsRevoked).toBe(true);

      for (const s of [a, b]) {
        const res = await request(server)
          .post('/v1/auth/refresh')
          .send({ refreshToken: s.session.refresh_token });
        expect(res.status).toBe(401);
      }

      resetThrottleCounters(app);
      const withNew = await request(server)
        .post('/v1/auth/login')
        .send({ email, password: NEW_PASSWORD });
      expect(withNew.status).toBe(201);
    });
  });

  // =========================================================================
  // 6. Đa ngôn ngữ theo TÀI KHOẢN
  // =========================================================================

  describe('⚠️ preferred_locale của tài khoản thắng Accept-Language', () => {
    it('preferred_locale = en → thông báo tiếng Anh dù Accept-Language là vi', async () => {
      const { email, userId } = await createConfirmedAccount('loc-en');
      const body = await login(email);

      await admin
        .from('user_profiles')
        .update({ preferred_locale: 'en', status: 'SUSPENDED' })
        .eq('id', userId);

      const res = await request(server)
        .get('/v1/auth/me')
        .set('Authorization', `Bearer ${body.session.access_token}`)
        .set('Accept-Language', 'vi');

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('ACCOUNT_INACTIVE');
      // ⚠️ Chỉ đạt nhờ guard gán `req.user` TRƯỚC bước kiểm trạng thái.
      expect(res.body.message).toContain('This account is');
    });
  });

  // =========================================================================
  // 7. ⚠️ "KHÔNG BAO GIỜ XOÁ LỊCH SỬ" — bất biến ở tầng database
  // =========================================================================

  describe('⚠️ Lịch sử không sửa/xoá được — kể cả bằng service_role', () => {
    it('audit_events: UPDATE bị trigger chặn', async () => {
      const { data } = await admin
        .from('audit_events')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      expect(data?.[0]).toBeDefined();

      const { error } = await admin
        .from('audit_events')
        .update({ event_code: 'bi.sua.lai' })
        .eq('id', data![0].id);

      expect(error?.message).toContain('APPEND_ONLY_TABLE');
    });

    it('audit_events: DELETE bị trigger chặn', async () => {
      const { data } = await admin
        .from('audit_events')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);

      const { error } = await admin
        .from('audit_events')
        .delete()
        .eq('id', data![0].id);

      expect(error?.message).toContain('APPEND_ONLY_TABLE');
    });

    it('context_role_assignments: đổi vai trò/phạm vi bị chặn; xoá bị chặn; thu hồi thiếu lý do bị chặn', async () => {
      const { userId } = await createConfirmedAccount('hist');

      const { data: row, error: insertError } = await admin
        .from('context_role_assignments')
        .insert({
          subject_id: userId,
          context_type: 'PLATFORM',
          context_id: PLATFORM_CONTEXT_ID,
          role_code: 'ASSET_MANAGER',
          grant_reason: 'smoke test',
        })
        .select('id')
        .single();
      expect(insertError).toBeNull();

      const changeRole = await admin
        .from('context_role_assignments')
        .update({ role_code: 'SYSTEM_ADMIN' })
        .eq('id', row!.id);
      expect(changeRole.error?.message).toContain('HISTORY_IMMUTABLE');

      const remove = await admin
        .from('context_role_assignments')
        .delete()
        .eq('id', row!.id);
      expect(remove.error?.message).toContain('HISTORY_IMMUTABLE');

      const noReason = await admin
        .from('context_role_assignments')
        .update({ effective_to: new Date().toISOString(), revoked_by: userId })
        .eq('id', row!.id);
      expect(noReason.error?.message).toContain('HISTORY_IMMUTABLE');
    });
  });
});
