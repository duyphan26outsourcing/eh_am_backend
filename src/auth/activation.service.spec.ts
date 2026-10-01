import type { Request } from 'express';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseJwtService } from './supabase-jwt/supabase-jwt.service';
import { ActivationRepository } from './activation.repository';
import { ActivationService } from './activation.service';

jest.mock('./supabase-jwt/supabase-jwt.service', () => ({
  SupabaseJwtService: class {},
}));

const req = {
  ip: '127.0.0.1',
  headers: { 'user-agent': 'jest' },
  requestId: 'req-activation',
} as unknown as Request;

function buildService(options?: {
  previewStatus?: string;
  claimStatus?: string;
  claimed?: boolean;
  updateError?: { message: string } | null;
  completeError?: Error;
  verifyError?: Error;
  mustChangePassword?: boolean;
  profileStatus?: string;
}) {
  // ⚠️ Nhận err kiểu Error qua tham số để Promise.reject không dính cảnh báo
  // prefer-promise-reject-errors (closure làm TS mở lại kiểu về Error | undefined).
  const rejectWith = (err: Error) => jest.fn(() => Promise.reject(err));
  const verify = options?.verifyError
    ? rejectWith(options.verifyError)
    : jest.fn(() =>
        Promise.resolve({ sub: 'user-1', email: 'nv@everyhalf.vn' }),
      );
  const preview = jest.fn(() =>
    Promise.resolve({
      inviteId: 'invite-1',
      userId: 'user-1',
      displayName: 'Nguyễn Văn A',
      workEmail: 'nv@everyhalf.vn',
      status: options?.previewStatus ?? 'SENT',
      expiresAt: '2026-10-04T00:00:00.000Z',
      mustChangePassword: options?.mustChangePassword ?? false,
      profileStatus: options?.profileStatus ?? 'PENDING_ACTIVATION',
    }),
  );
  const claim = jest.fn(() =>
    Promise.resolve({
      inviteId: 'invite-1',
      userId: 'user-1',
      status: options?.claimStatus ?? 'ACTIVATING',
      claimed: options?.claimed ?? true,
    }),
  );
  const release = jest.fn(() => Promise.resolve(undefined));
  const complete = options?.completeError
    ? rejectWith(options.completeError)
    : jest.fn(() => Promise.resolve(undefined));
  const updateUserById = jest.fn(() =>
    Promise.resolve({ error: options?.updateError ?? null }),
  );

  const repository = {
    preview,
    claim,
    release,
    complete,
  } as unknown as ActivationRepository;
  const service = new ActivationService(
    repository,
    { verify } as unknown as SupabaseJwtService,
    {
      client: { auth: { admin: { updateUserById } } },
    } as unknown as SupabaseAdminService,
  );

  return { service, preview, claim, release, complete, updateUserById };
}

describe('ActivationService', () => {
  it('token sai luôn trả INVITATION_INVALID và không đọc database', async () => {
    const { service, preview } = buildService({
      verifyError: new Error('JWT signature detail'),
    });
    await expect(
      service.preview({ accessToken: 'tampered' }),
    ).rejects.toMatchObject({ code: ErrorCode.INVITATION_INVALID });
    expect(preview).not.toHaveBeenCalled();
  });

  it('tài khoản mật khẩu tạm không được đi qua luồng email mời', async () => {
    const { service, claim, updateUserById } = buildService({
      mustChangePassword: true,
    });
    await expect(
      service.complete(
        { accessToken: 'signup-token', newPassword: 'Strong!123' },
        req,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.INVITATION_INVALID });
    expect(claim).not.toHaveBeenCalled();
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('trả dữ liệu tối thiểu khi lời mời còn hiệu lực', async () => {
    const { service } = buildService();
    await expect(
      service.preview({ accessToken: 'signup-token' }),
    ).resolves.toEqual({
      displayName: 'Nguyễn Văn A',
      workEmail: 'nv@everyhalf.vn',
      expiresAt: '2026-10-04T00:00:00.000Z',
    });
  });

  it.each([
    ['EXPIRED', ErrorCode.INVITATION_EXPIRED],
    ['ACCEPTED', ErrorCode.INVITATION_USED_OR_REPLACED],
    ['REVOKED', ErrorCode.INVITATION_USED_OR_REPLACED],
    ['ACTIVATING', ErrorCode.INVITATION_USED_OR_REPLACED],
  ])('ánh xạ trạng thái %s sang %s', async (previewStatus, code) => {
    const { service } = buildService({ previewStatus });
    await expect(
      service.preview({ accessToken: 'signup-token' }),
    ).rejects.toMatchObject({ code });
  });

  it('hai request đồng thời: request không claim được không đặt mật khẩu', async () => {
    const { service, updateUserById } = buildService({ claimed: false });
    await expect(
      service.complete(
        { accessToken: 'signup-token', newPassword: 'Strong!123' },
        req,
      ),
    ).rejects.toMatchObject({
      code: ErrorCode.INVITATION_USED_OR_REPLACED,
    });
    expect(updateUserById).not.toHaveBeenCalled();
  });

  it('đặt mật khẩu lỗi thì trả lời mời về SENT', async () => {
    const { service, release, complete } = buildService({
      updateError: { message: 'auth unavailable' },
    });
    await expect(
      service.complete(
        { accessToken: 'signup-token', newPassword: 'Strong!123' },
        req,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.PASSWORD_UPDATE_FAILED });
    expect(release).toHaveBeenCalledWith('invite-1', 'user-1');
    expect(complete).not.toHaveBeenCalled();
  });

  it('complete DB lỗi sau khi đổi mật khẩu vẫn release để người dùng thử lại', async () => {
    const dbError = new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    const { service, release, updateUserById } = buildService({
      completeError: dbError,
    });
    await expect(
      service.complete(
        { accessToken: 'signup-token', newPassword: 'Strong!123' },
        req,
      ),
    ).rejects.toBe(dbError);
    expect(updateUserById).toHaveBeenCalled();
    expect(release).toHaveBeenCalledWith('invite-1', 'user-1');
  });

  it('thành công: đặt mật khẩu rồi hoàn tất profile/audit đúng một lần', async () => {
    const { service, complete, release, updateUserById } = buildService();
    await expect(
      service.complete(
        { accessToken: 'signup-token', newPassword: 'Strong!123' },
        req,
      ),
    ).resolves.toEqual({ activated: true });
    expect(updateUserById).toHaveBeenCalledWith('user-1', {
      password: 'Strong!123',
      email_confirm: true,
    });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(release).not.toHaveBeenCalled();
  });
});
