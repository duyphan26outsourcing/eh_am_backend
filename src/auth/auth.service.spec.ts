import type { Request } from 'express';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { AuditService } from '@/audit/audit.service';
import { I18nService } from '@/common/i18n/i18n.service';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseAuthService } from '@/supabase/supabase-auth.service';
import { AccessScopeService } from './access-scope.service';
import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';
import { SupabaseJwtService } from './supabase-jwt/supabase-jwt.service';
import { type AuthRequest } from './auth.interface';
import { LoginDto } from './dto/login.dto';

// ⚠️ Chặn nạp `supabase-jwt.service` (kéo theo `jose`, gói chỉ-ESM mà ts-jest không transform
// trong node_modules). `login` không dùng SupabaseJwtService, nên thay bằng lớp rỗng để chuỗi
// import của AuthService không chạm `jose`. Factory phải không nạp module thật.
jest.mock('./supabase-jwt/supabase-jwt.service', () => ({
  SupabaseJwtService: class {},
}));

/** Giả lập chuỗi builder `.from().select().eq().maybeSingle()` của supabase-js. */
type ProfileQuery = {
  select: jest.Mock;
  eq: jest.Mock;
  maybeSingle: jest.Mock;
};

/**
 * Dựng AuthService với phụ thuộc giả. Trả về cả các jest.fn quan trọng để assert.
 *
 * Bộ khung unit-test đầu tiên cho AuthService; dùng lại cho các UC auth sau. Chỉ giả lập
 * đúng những gì `login` chạm tới.
 *
 * @param profile hồ sơ mà `user_profiles` trả về (null = chưa có hồ sơ).
 */
function buildService(profile: Record<string, unknown> | null) {
  const signInWithPassword = jest.fn(() =>
    Promise.resolve({
      data: {
        user: { id: 'user-1', email: 'nv@everyhalf.vn' },
        session: {
          access_token: 'AT',
          refresh_token: 'RT',
          token_type: 'bearer',
          expires_in: 3600,
          expires_at: 1_800_000_000,
        },
      },
      error: null,
    }),
  );
  const maybeSingle = jest.fn(() => Promise.resolve({ data: profile }));
  const profileQuery: ProfileQuery = {
    select: jest.fn((): ProfileQuery => profileQuery),
    eq: jest.fn((): ProfileQuery => profileQuery),
    maybeSingle,
  };
  const from = jest.fn((): ProfileQuery => profileQuery);
  const signOut = jest.fn(() => Promise.resolve({ error: null }));
  const encrypt = jest.fn((raw: string) => `enc:${raw}`);
  const record = jest.fn(() => Promise.resolve(undefined));
  const translateMessage = jest.fn(() => 'Đã đăng nhập');

  const authSvc = {
    createEphemeralClient: jest.fn(() => ({ auth: { signInWithPassword } })),
  } as unknown as SupabaseAuthService;
  const adminSvc = {
    client: { from, auth: { admin: { signOut } } },
  } as unknown as SupabaseAdminService;
  const encryption = { encrypt } as unknown as EncryptionService;
  const audit = { record } as unknown as AuditService;
  const i18n = { translateMessage } as unknown as I18nService;

  const service = new AuthService(
    authSvc,
    adminSvc,
    encryption,
    {} as unknown as SupabaseJwtService, // không dùng trong login
    {} as unknown as never, // configService — không dùng trong login
    audit,
    {} as unknown as AccessScopeService, // không dùng trong login
    i18n,
  );

  return { service, signInWithPassword, signOut, encrypt, record };
}

const req = {
  ip: '127.0.0.1',
  headers: { 'user-agent': 'jest' },
  requestId: 'req-1',
} as unknown as Request;

const dto: LoginDto = { email: 'NV@everyhalf.vn', password: 'secret-123' };

describe('AuthService.login', () => {
  it('⚠️ EX.3: tài khoản không ACTIVE → thu hồi phiên vừa tạo và ném ACCOUNT_INACTIVE', async () => {
    const { service, signOut } = buildService({
      status: 'SUSPENDED',
      display_name: 'Nguyễn Văn A',
      employee_code: null,
    });

    // UC-IAM-01.EX.3: phải thu hồi phiên `signInWithPassword` vừa tạo ở Dịch vụ xác thực,
    // giống nhánh tương ứng của refreshSession. Token không tới trình duyệt nhưng nếu không
    // thu hồi thì phiên vẫn sống ở Supabase.
    await expect(service.login(dto, req)).rejects.toBeInstanceOf(AppException);
    expect(signOut).toHaveBeenCalledWith('AT', 'global');
  });

  it('EX.3: mã lỗi trả về là ACCOUNT_INACTIVE', async () => {
    const { service } = buildService({
      status: 'DEACTIVATED',
      display_name: 'Nguyễn Văn A',
      employee_code: null,
    });

    await expect(service.login(dto, req)).rejects.toMatchObject({
      code: ErrorCode.ACCOUNT_INACTIVE,
    });
  });

  it('tài khoản ACTIVE → trả session với token đã mã hoá, không thu hồi phiên', async () => {
    const { service, signOut, encrypt, record } = buildService({
      status: 'ACTIVE',
      display_name: 'Nguyễn Văn A',
      employee_code: 'EH-001',
    });

    const res = await service.login(dto, req);

    expect(res.session.access_token).toBe('enc:AT');
    expect(res.session.refresh_token).toBe('enc:RT');
    expect(res.user).toMatchObject({ id: 'user-1', employeeCode: 'EH-001' });
    expect(encrypt).toHaveBeenCalledWith('AT');
    expect(signOut).not.toHaveBeenCalled();
    expect(record).toHaveBeenCalled();
  });
});

describe('AuthService.changePassword', () => {
  // Giả lập: đọc email tài khoản, đăng nhập thử để xác minh mật khẩu hiện tại, cập nhật mật
  // khẩu. `signInError=true` nghĩa là mật khẩu hiện tại sai.
  function buildForChange(signInError: boolean) {
    const getUserById = jest.fn(() =>
      Promise.resolve({
        data: { user: { email: 'nv@everyhalf.vn' } },
        error: null,
      }),
    );
    const signInWithPassword = jest.fn(() =>
      Promise.resolve({ error: signInError ? { message: 'invalid' } : null }),
    );
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const record = jest.fn(() => Promise.resolve(undefined));

    const authSvc = {
      createEphemeralClient: jest.fn(() => ({ auth: { signInWithPassword } })),
    } as unknown as SupabaseAuthService;
    const adminSvc = {
      client: { auth: { admin: { getUserById, updateUserById } } },
    } as unknown as SupabaseAdminService;
    const audit = { record } as unknown as AuditService;
    const i18n = {
      translateMessage: jest.fn(() => 'ok'),
    } as unknown as I18nService;

    const service = new AuthService(
      authSvc,
      adminSvc,
      {} as unknown as EncryptionService,
      {} as unknown as SupabaseJwtService,
      {} as unknown as never,
      audit,
      {} as unknown as AccessScopeService,
      i18n,
    );
    return { service, signInWithPassword, updateUserById };
  }

  const changeReq = {
    user: {
      sub: 'user-1',
      displayName: 'Nguyễn Văn A',
      employeeCode: 'EH-001',
    },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
    requestId: 'req-1',
  } as unknown as AuthRequest;

  it('⚠️ QĐ-18: xác minh mật khẩu hiện tại TRƯỚC khi báo trùng — sai mật khẩu hiện tại thì trả CURRENT_PASSWORD_INCORRECT dù mới trùng cũ', async () => {
    // UC-IAM-04.EX.1: mật khẩu hiện tại sai thì trả CURRENT_PASSWORD_INCORRECT "dù mật khẩu
    // mới có trùng hay không". Nếu code kiểm "mới trùng cũ" trước khi xác minh (lỗi cũ) thì sẽ
    // trả nhầm NEW_PASSWORD_SAME_AS_CURRENT.
    const { service, updateUserById } = buildForChange(true);
    await expect(
      service.changePassword(changeReq, {
        currentPassword: 'same-pass',
        newPassword: 'same-pass',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.CURRENT_PASSWORD_INCORRECT });
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('mật khẩu hiện tại đúng, mật khẩu mới trùng → NEW_PASSWORD_SAME_AS_CURRENT', async () => {
    const { service, updateUserById } = buildForChange(false);
    await expect(
      service.changePassword(changeReq, {
        currentPassword: 'cur-pass',
        newPassword: 'cur-pass',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.NEW_PASSWORD_SAME_AS_CURRENT });
    expect(updateUserById).not.toHaveBeenCalled();
  });
});

describe('AuthService.resetPassword', () => {
  // Giả lập: verify mã khôi phục → sub; đọc trạng thái hồ sơ; cập nhật mật khẩu; thu hồi phiên.
  function buildForReset(status: string) {
    const verify = jest.fn(() => Promise.resolve({ sub: 'user-1' }));
    const maybeSingle = jest.fn(() => Promise.resolve({ data: { status } }));
    const profileQuery: ProfileQuery = {
      select: jest.fn((): ProfileQuery => profileQuery),
      eq: jest.fn((): ProfileQuery => profileQuery),
      maybeSingle,
    };
    const from = jest.fn((): ProfileQuery => profileQuery);
    const updateUserById = jest.fn(() => Promise.resolve({ error: null }));
    const signOut = jest.fn(() => Promise.resolve({ error: null }));
    const record = jest.fn(() => Promise.resolve(undefined));

    const jwtSvc = { verify } as unknown as SupabaseJwtService;
    const adminSvc = {
      client: { from, auth: { admin: { updateUserById, signOut } } },
    } as unknown as SupabaseAdminService;
    const audit = { record } as unknown as AuditService;
    const i18n = {
      translateMessage: jest.fn(() => 'ok'),
    } as unknown as I18nService;

    const service = new AuthService(
      {} as unknown as SupabaseAuthService,
      adminSvc,
      {} as unknown as EncryptionService,
      jwtSvc,
      {} as unknown as never,
      audit,
      {} as unknown as AccessScopeService,
      i18n,
    );
    return { service, updateUserById };
  }

  const resetReq = {
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
    requestId: 'req-1',
  } as unknown as Request;

  it('⚠️ EX.8: tài khoản không ACTIVE → ACCOUNT_INACTIVE, không đổi mật khẩu', async () => {
    const { service, updateUserById } = buildForReset('SUSPENDED');
    await expect(
      service.resetPassword(
        { accessToken: 'recovery', newPassword: 'new-pass-123' },
        resetReq,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.ACCOUNT_INACTIVE });
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('tài khoản ACTIVE → đặt lại mật khẩu', async () => {
    const { service, updateUserById } = buildForReset('ACTIVE');
    await service.resetPassword(
      { accessToken: 'recovery', newPassword: 'new-pass-123' },
      resetReq,
    );
    expect(updateUserById).toHaveBeenCalled();
  });
});
