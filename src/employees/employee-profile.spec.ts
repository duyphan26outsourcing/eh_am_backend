import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { ChangeEmployeeEmailDto } from './dto/change-employee-email.dto';
import { EmployeesService } from './employees.service';
import { ErrorCode } from '@/common/i18n/error-code.const';

describe('UpdateEmployeeProfileDto (UC-IAM-08)', () => {
  const valid = {
    displayName: 'Nguyễn Văn An',
    employeeCode: 'EH0012',
    phone: '0901234567',
    preferredLocale: 'vi',
    primaryLocationId: '11111111-1111-4111-8111-111111111111',
    departmentId: null,
    jobTitle: 'Quản lý cửa hàng',
    employmentType: 'FULL_TIME',
    startDate: '2026-10-01',
    managerId: null,
    reason: '',
    profileVersion: 3,
  };

  it('accepts the editable snapshot and normalizes blank optional strings', () => {
    const dto = plainToInstance(UpdateEmployeeProfileDto, {
      ...valid,
      employeeCode: '  ',
      phone: ' ',
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.employeeCode).toBeNull();
    expect(dto.phone).toBeNull();
  });

  it('rejects an invalid Vietnamese phone and unknown employment type', () => {
    const dto = plainToInstance(UpdateEmployeeProfileDto, {
      ...valid,
      phone: '09abc',
      employmentType: 'FREELANCE',
    });
    expect(validateSync(dto).length).toBeGreaterThanOrEqual(2);
  });
});

describe('ChangeEmployeeEmailDto', () => {
  it('normalizes email and requires reason/version', () => {
    const dto = plainToInstance(ChangeEmployeeEmailDto, {
      email: '  AN@EVERYHALF.VN ',
      reasonCodeId: '11111111-1111-4111-8111-111111111111',
      profileVersion: 2,
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.email).toBe('an@everyhalf.vn');
  });

  it('rejects malformed email', () => {
    const dto = plainToInstance(ChangeEmployeeEmailDto, {
      email: 'not-email',
      reasonCodeId: '11111111-1111-4111-8111-111111111111',
      profileVersion: 2,
    });
    expect(validateSync(dto)).not.toHaveLength(0);
  });
});

describe('EmployeesService profile commands (UC-IAM-08)', () => {
  const req = {
    user: { sub: 'actor-1' },
    userProfile: { display_name: 'Quản trị' },
    headers: {},
    ip: '127.0.0.1',
  } as never;

  const profilePayload = {
    displayName: 'Nguyễn Văn An',
    employeeCode: 'EH0012',
    phone: '0901234567',
    preferredLocale: 'vi' as const,
    primaryLocationId: '11111111-1111-4111-8111-111111111111',
    departmentId: null,
    jobTitle: 'Quản lý cửa hàng',
    employmentType: 'FULL_TIME',
    startDate: '2026-10-01',
    managerId: null,
    reason: 'Cập nhật hồ sơ',
    profileVersion: 3,
  };

  function setup() {
    const repository = {
      updateProfileViaRpc: jest.fn().mockResolvedValue({
        id: 'emp-1',
        profile_version: 4,
        changed: true,
      }),
      changeEmailViaRpc: jest.fn().mockResolvedValue({
        id: 'emp-1',
        work_email: 'new@everyhalf.vn',
        status: 'ACTIVE',
        profile_version: 5,
        invitation_required: false,
        is_replay: false,
      }),
      markEmailSync: jest.fn().mockResolvedValue(undefined),
    };
    const updateUserById = jest
      .fn()
      .mockResolvedValue({ data: {}, error: null });
    const inviteUserByEmail = jest
      .fn()
      .mockResolvedValue({ data: {}, error: null });
    const service = new EmployeesService(
      repository as never,
      {
        client: { auth: { admin: { updateUserById, inviteUserByEmail } } },
      } as never,
      { get: jest.fn().mockReturnValue('http://localhost:5175') } as never,
    );
    return {
      service,
      repository,
      updateUserById,
      inviteUserByEmail,
    };
  }

  it('sends the editable snapshot and optimistic version to the profile RPC', async () => {
    const { service, repository } = setup();
    const result = await service.updateProfile(
      'emp-1',
      profilePayload,
      'cmd-1',
      req,
    );
    expect(repository.updateProfileViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_employee_id: 'emp-1',
        p_expected_version: 3,
        p_display_name: 'Nguyễn Văn An',
        p_employee_code: 'EH0012',
        p_actor_id: 'actor-1',
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({ profileVersion: 4, changed: true }),
    );
  });

  it('changes the Auth email then marks the profile in sync', async () => {
    const { service, repository, updateUserById } = setup();
    const result = await service.changeEmployeeEmail(
      'emp-1',
      {
        email: 'new@everyhalf.vn',
        reasonCodeId: '11111111-1111-4111-8111-111111111111',
        profileVersion: 4,
      },
      'cmd-email',
      req,
    );
    expect(updateUserById).toHaveBeenCalledWith('emp-1', {
      email: 'new@everyhalf.vn',
      email_confirm: true,
    });
    expect(repository.markEmailSync).toHaveBeenCalledWith('emp-1', 'IN_SYNC');
    expect(result.authEmailSyncStatus).toBe('IN_SYNC');
  });

  it('retries Auth three times, marks FAILED and returns REQUEST_TIMEOUT', async () => {
    const { service, repository, updateUserById } = setup();
    updateUserById.mockResolvedValue({
      data: null,
      error: new Error('provider unavailable'),
    });
    await expect(
      service.changeEmployeeEmail(
        'emp-1',
        {
          email: 'new@everyhalf.vn',
          reasonCodeId: '11111111-1111-4111-8111-111111111111',
          profileVersion: 4,
        },
        'cmd-email',
        req,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.REQUEST_TIMEOUT });
    expect(updateUserById).toHaveBeenCalledTimes(3);
    expect(repository.markEmailSync).toHaveBeenCalledWith('emp-1', 'FAILED');
  });
});
