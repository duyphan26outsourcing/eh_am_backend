import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  const req = {
    user: { sub: 'actor', displayName: 'Admin', employeeCode: 'AD01' },
    requestId: 'request-1',
    headers: {},
    ip: '127.0.0.1',
  } as never;
  const dto = {
    primaryLocationId: '11111111-1111-4111-8111-111111111111',
    departmentId: '22222222-2222-4222-8222-222222222222',
    displayName: 'Nguyễn Văn A',
    workEmail: 'A@Example.com',
    phone: '+84 901 234 567',
    preferredLocale: 'vi' as const,
    activationMethod: 'EMAIL_INVITE' as const,
    roleCode: 'LOCATION_STAFF',
    reasonCodeId: '33333333-3333-4333-8333-333333333333',
  };

  function setup(overrides: Record<string, unknown> = {}) {
    const repository = {
      findReceipt: jest.fn().mockResolvedValue(null),
      findLocation: jest.fn().mockResolvedValue({
        id: dto.primaryLocationId,
        type: 'OFFICE',
        status: 'ACTIVE',
      }),
      findDepartment: jest
        .fn()
        .mockResolvedValue({ id: dto.departmentId, status: 'ACTIVE' }),
      findManager: jest.fn(),
      findReason: jest.fn().mockResolvedValue({
        id: dto.reasonCodeId,
        status: 'ACTIVE',
        reason_group: 'ROLE_ASSIGNMENT',
        is_freetext: false,
      }),
      createViaRpc: jest.fn().mockResolvedValue({
        id: 'employee-1',
        display_name: 'Nguyễn Văn A',
        work_email: 'a@example.com',
        employee_code: null,
        status: 'PENDING_ACTIVATION',
      }),
      createOptions: jest.fn(),
      ...overrides,
    };
    const admin = {
      client: {
        auth: {
          admin: {
            createUser: jest.fn().mockResolvedValue({
              data: { user: { id: 'employee-1' } },
              error: null,
            }),
            inviteUserByEmail: jest.fn().mockResolvedValue({
              data: { user: { id: 'employee-1' } },
              error: null,
            }),
            deleteUser: jest.fn().mockResolvedValue({ error: null }),
          },
        },
      },
    };
    return {
      service: new EmployeesService(
        repository as never,
        admin as never,
        {
          get: jest.fn((key: string) =>
            key === 'APP_URL' ? 'http://localhost:5175/' : undefined,
          ),
        } as never,
      ),
      repository,
      admin,
    };
  }

  it('creates auth user then one atomic employee command with normalized values', async () => {
    const { service, repository, admin } = setup();
    const result = await service.create(
      dto,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      req,
    );
    expect(repository.createViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_work_email: 'a@example.com',
        p_phone: '0901234567',
        p_role_context_type: 'LOCATION',
        p_role_context_id: dto.primaryLocationId,
      }),
    );
    expect(result.invitationEmailSent).toBe(true);
    expect(admin.client.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      'a@example.com',
      {
        data: { display_name: 'Nguyễn Văn A' },
        redirectTo: 'http://localhost:5175/activate-account',
      },
    );
    expect(admin.client.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('requires an active department for an office location', async () => {
    const { service, admin } = setup({
      findDepartment: jest.fn().mockResolvedValue(null),
    });
    await expect(
      service.create(dto, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', req),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    expect(admin.client.auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
  });

  it('removes the newly-created auth user when the database command fails', async () => {
    const { service, repository, admin } = setup({
      createViaRpc: jest
        .fn()
        .mockRejectedValue(new AppException(ErrorCode.ACCOUNT_CREATE_FAILED)),
    });
    await expect(
      service.create(dto, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', req),
    ).rejects.toBeInstanceOf(AppException);
    expect(repository.createViaRpc).toHaveBeenCalled();
    expect(admin.client.auth.admin.deleteUser).toHaveBeenCalledWith(
      'employee-1',
    );
  });

  it('returns a completed receipt without creating another auth account', async () => {
    const receipt = {
      id: 'employee-1',
      display_name: 'Nguyễn Văn A',
      work_email: 'a@example.com',
      employee_code: null,
      status: 'PENDING_ACTIVATION',
    };
    const { service, admin } = setup({
      findReceipt: jest.fn().mockResolvedValue(receipt),
    });
    const result = await service.create(
      dto,
      'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      req,
    );
    expect(admin.client.auth.admin.createUser).not.toHaveBeenCalled();
    expect(admin.client.auth.admin.inviteUserByEmail).not.toHaveBeenCalled();
    expect(result.id).toBe('employee-1');
  });
});
