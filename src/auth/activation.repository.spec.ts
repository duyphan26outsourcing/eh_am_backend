import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { ActivationRepository } from './activation.repository';

describe('ActivationRepository', () => {
  function setup(result: { data: unknown; error: { message: string } | null }) {
    const rpc = jest.fn().mockResolvedValue(result);
    const repository = new ActivationRepository({ client: { rpc } } as never);
    return { repository, rpc };
  }

  it('chỉ map các trường tối thiểu từ preview RPC', async () => {
    const { repository } = setup({
      data: {
        invite_id: 'invite-1',
        user_id: 'user-1',
        display_name: 'Nguyễn Văn A',
        work_email: 'a@everyhalf.vn',
        status: 'SENT',
        expires_at: '2026-10-04T00:00:00.000Z',
        must_change_password: false,
        profile_status: 'PENDING_ACTIVATION',
      },
      error: null,
    });

    await expect(repository.preview('user-1')).resolves.toEqual({
      inviteId: 'invite-1',
      userId: 'user-1',
      displayName: 'Nguyễn Văn A',
      workEmail: 'a@everyhalf.vn',
      status: 'SENT',
      expiresAt: '2026-10-04T00:00:00.000Z',
      mustChangePassword: false,
      profileStatus: 'PENDING_ACTIVATION',
    });
  });

  it.each([
    ['AUDIT_WRITE_FAILED', ErrorCode.AUDIT_WRITE_FAILED],
    ['INVITATION_USED_OR_REPLACED', ErrorCode.INVITATION_USED_OR_REPLACED],
    ['INVITATION_INVALID', ErrorCode.INVITATION_INVALID],
  ])('map lỗi RPC %s sang mã nghiệp vụ %s', async (message, code) => {
    const { repository } = setup({ data: null, error: { message } });
    await expect(
      repository.complete({
        inviteId: 'invite-1',
        userId: 'user-1',
        requestId: 'request-1',
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).rejects.toMatchObject({ code });
  });

  it('không trả lỗi thô của database ra ngoài', async () => {
    const { repository } = setup({
      data: null,
      error: { message: 'relation internal_secret does not exist' },
    });
    await expect(
      repository.complete({
        inviteId: 'invite-1',
        userId: 'user-1',
        requestId: 'request-1',
        ipAddress: null,
        userAgent: '',
      }),
    ).rejects.toEqual(expect.any(AppException));
    await expect(
      repository.complete({
        inviteId: 'invite-1',
        userId: 'user-1',
        requestId: 'request-1',
        ipAddress: null,
        userAgent: '',
      }),
    ).rejects.toMatchObject({ code: ErrorCode.DATA_ACCESS_ERROR });
  });
});
