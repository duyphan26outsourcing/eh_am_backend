import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  type EmployeeDirectoryRow,
  toEmployeeListItemModel,
} from './employee.model';
import { EmployeesService } from './employees.service';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';
import { RevokeRoleAssignmentDto } from './dto/revoke-role-assignment.dto';

function row(
  overrides: Partial<EmployeeDirectoryRow> = {},
): EmployeeDirectoryRow {
  return {
    id: 'emp-1',
    display_name: 'Nguyễn Văn A',
    work_email: 'a@everyhalf.vn',
    phone: '0901234567',
    employee_code: 'NV0012',
    job_title: 'Nhân viên',
    employment_type: 'FULL_TIME',
    status: 'ACTIVE',
    start_date: '2026-09-01',
    primary_location_id: 'loc-1',
    location_code: 'CH01',
    location_name: 'Cửa hàng Quận 1',
    department_id: null,
    department_code: null,
    department_name: null,
    invite_status: null,
    invite_expires_at: null,
    ...overrides,
  };
}

describe('toEmployeeListItemModel', () => {
  it('maps snake_case row to admin view with nested location', () => {
    const model = toEmployeeListItemModel(row());
    expect(model).toEqual(
      expect.objectContaining({
        id: 'emp-1',
        displayName: 'Nguyễn Văn A',
        workEmail: 'a@everyhalf.vn',
        phone: '0901234567',
        employeeCode: 'NV0012',
        location: { id: 'loc-1', code: 'CH01', name: 'Cửa hàng Quận 1' },
        department: null,
        inviteStatus: null,
      }),
    );
  });

  it('never leaks internal columns (no total_count, no snake_case keys)', () => {
    const model = toEmployeeListItemModel(row());
    const keys = Object.keys(model);
    expect(keys).not.toContain('total_count');
    expect(keys).not.toContain('primary_location_id');
    expect(keys).not.toContain('location_code');
  });

  it('exposes invite status only for PENDING_ACTIVATION employees', () => {
    const pending = toEmployeeListItemModel(
      row({
        status: 'PENDING_ACTIVATION',
        invite_status: 'EXPIRED',
        invite_expires_at: '2026-09-10T00:00:00.000Z',
      }),
    );
    expect(pending.inviteStatus).toBe('EXPIRED');
    expect(pending.inviteExpiresAt).toBe('2026-09-10T00:00:00.000Z');

    // Người đã ACTIVE còn dòng invite ACCEPTED trong DB — không được lộ ra danh sách.
    const active = toEmployeeListItemModel(
      row({ status: 'ACTIVE', invite_status: 'ACCEPTED' }),
    );
    expect(active.inviteStatus).toBeNull();
    expect(active.inviteExpiresAt).toBeNull();
  });
});

describe('EmployeesService.list', () => {
  function setup(
    listResult: unknown = { items: [], total: 0, page: 1, pageSize: 20 },
  ) {
    const repository = {
      listEmployees: jest.fn().mockResolvedValue(listResult),
    };
    const service = new EmployeesService(
      repository as never,
      {} as never,
      {} as never,
    );
    return { service, repository };
  }

  it('sanitizes the keyword and forwards null filters', async () => {
    const { service, repository } = setup();
    await service.list({
      search: '  Nguyễn%  ',
      page: 1,
      pageSize: 20,
    });
    expect(repository.listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'Nguyễn',
        locationId: null,
        departmentId: null,
        roleCode: null,
        status: null,
        employmentType: null,
        page: 1,
        pageSize: 20,
      }),
    );
  });

  it('treats a keyword of only special characters as no keyword (EX.3)', async () => {
    const { service, repository } = setup();
    await service.list({
      search: '%,()_',
      page: 1,
      pageSize: 20,
    });
    expect(repository.listEmployees).toHaveBeenCalledWith(
      expect.objectContaining({ search: null }),
    );
  });

  it('maps each row to the admin model and keeps pagination meta', async () => {
    const { service } = setup({
      items: [row({ status: 'PENDING_ACTIVATION', invite_status: 'SENT' })],
      total: 1,
      page: 2,
      pageSize: 20,
    });
    const result = await service.list({
      page: 2,
      pageSize: 20,
    });
    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.items[0].inviteStatus).toBe('SENT');
  });
});

describe('ListEmployeesQueryDto', () => {
  function validate(input: Record<string, unknown>) {
    const dto = plainToInstance(ListEmployeesQueryDto, input);
    return validateSync(dto);
  }

  it('accepts empty query (all filters optional)', () => {
    expect(validate({})).toHaveLength(0);
  });

  it('rejects an unknown account status with VALUE_OUT_OF_DOMAIN', () => {
    const errors = validate({ status: 'BANNED' });
    expect(errors[0].constraints?.isIn).toBe(ErrorCode.VALUE_OUT_OF_DOMAIN);
  });

  it('rejects a malformed locationId with INVALID_REFERENCE_ID', () => {
    const errors = validate({ locationId: 'not-a-uuid' });
    expect(errors[0].constraints?.isUuid).toBe(ErrorCode.INVALID_REFERENCE_ID);
  });

  it('rejects pageSize above the cap', () => {
    const errors = validate({ pageSize: 999 });
    expect(errors).not.toHaveLength(0);
  });
});

describe('EmployeesService role assignments (UC-IAM-10)', () => {
  const req = { user: { sub: 'actor' }, headers: {}, ip: '127.0.0.1' } as never;

  function setup(overrides: Record<string, unknown> = {}) {
    const repository = {
      findAccessProfile: jest.fn().mockResolvedValue({
        id: 'emp-1',
        display_name: 'Nguyễn Văn A',
        employee_code: 'NV0012',
        status: 'ACTIVE',
      }),
      findRoleAssignments: jest.fn().mockResolvedValue([]),
      listActiveLocations: jest.fn().mockResolvedValue([]),
      grantRolesViaRpc: jest.fn().mockResolvedValue([
        {
          id: 'ra-1',
          employee_id: 'emp-1',
          role_code: 'EXECUTIVE',
          context_type: 'PLATFORM',
          context_id: '00000000-0000-0000-0000-000000000000',
          effective_from: '2026-10-03T00:00:00.000+07:00',
          effective_to: null,
          grant_reason: 'Bổ nhiệm',
          created_at: '2026-10-02T10:00:00.000Z',
        },
      ]),
      ...overrides,
    };
    const service = new EmployeesService(
      repository as never,
      {} as never,
      {} as never,
    );
    return { service, repository };
  }

  it('getAccess excludes SYSTEM_ADMIN from assignable role options', async () => {
    const { service } = setup();
    const access = await service.getAccess('emp-1');
    expect(access.employee.id).toBe('emp-1');
    expect(access.options.roles.some((r) => r.code === 'SYSTEM_ADMIN')).toBe(
      false,
    );
    expect(access.options.roles.length).toBeGreaterThan(0);
  });

  it('grantRoles forces platform context to the nil UUID and maps the result', async () => {
    const { service, repository } = setup();
    const result = await service.grantRoles(
      'emp-1',
      {
        roleCode: 'EXECUTIVE',
        contextIds: ['11111111-1111-4111-8111-111111111111'],
        effectiveFrom: '2026-10-03',
        reason: 'Bổ nhiệm',
      },
      'cmd-1',
      req,
    );
    expect(repository.grantRolesViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_role_code: 'EXECUTIVE',
        p_context_type: 'PLATFORM',
        p_context_ids: ['00000000-0000-0000-0000-000000000000'],
      }),
    );
    expect(result[0].roleCode).toBe('EXECUTIVE');
  });

  it('grantRoles rejects an employee who is not active', async () => {
    const { service, repository } = setup({
      findAccessProfile: jest.fn().mockResolvedValue({
        id: 'emp-1',
        display_name: 'A',
        employee_code: null,
        status: 'SUSPENDED',
      }),
    });
    await expect(
      service.grantRoles(
        'emp-1',
        {
          roleCode: 'EXECUTIVE',
          contextIds: [],
          effectiveFrom: '2026-10-03',
          reason: 'x',
        },
        'cmd-1',
        req,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.ACCOUNT_INACTIVE });
    expect(repository.grantRolesViaRpc).not.toHaveBeenCalled();
  });
});

describe('EmployeesService.revokeRole (UC-IAM-11)', () => {
  const req = {
    user: { sub: 'actor' },
    headers: {},
    ip: '127.0.0.1',
  } as never;

  function setup(revokeResult: unknown = defaultRevoked()) {
    const repository = {
      revokeRoleViaRpc: jest.fn().mockResolvedValue(revokeResult),
    };
    const service = new EmployeesService(
      repository as never,
      {} as never,
      {} as never,
    );
    return { service, repository };
  }

  function defaultRevoked() {
    return {
      id: 'ra-1',
      employee_id: 'emp-1',
      role_code: 'LOCATION_MANAGER',
      context_type: 'LOCATION',
      context_id: 'loc-1',
      effective_from: '2026-10-01T00:00:00.000+07:00',
      effective_to: '2026-10-05T10:00:00.000Z',
      grant_reason: 'Bổ nhiệm',
      revoke_reason: 'Chuyển điểm',
      revoked_by: 'actor',
      created_at: '2026-10-01T00:00:00.000Z',
    };
  }

  it('forwards the assignment id, employee id and reason to the RPC', async () => {
    const { service, repository } = setup();
    await service.revokeRole(
      'emp-1',
      'ra-1',
      { reason: 'Chuyển điểm' },
      'cmd-1',
      req,
    );
    expect(repository.revokeRoleViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_assignment_id: 'ra-1',
        p_employee_id: 'emp-1',
        p_reason: 'Chuyển điểm',
        p_command_key: 'cmd-1',
        p_actor_id: 'actor',
      }),
    );
  });

  it('maps the closed row to a REVOKED model', async () => {
    const { service } = setup();
    const result = await service.revokeRole(
      'emp-1',
      'ra-1',
      { reason: 'Chuyển điểm' },
      'cmd-1',
      req,
    );
    expect(result.status).toBe('REVOKED');
    expect(result.effectiveTo).toBe('2026-10-05T10:00:00.000Z');
    expect(result.roleCode).toBe('LOCATION_MANAGER');
  });

  it('propagates the RPC error unchanged (e.g. HISTORY_IMMUTABLE)', async () => {
    const repository = {
      revokeRoleViaRpc: jest
        .fn()
        .mockRejectedValue({ code: ErrorCode.HISTORY_IMMUTABLE }),
    };
    const service = new EmployeesService(
      repository as never,
      {} as never,
      {} as never,
    );
    await expect(
      service.revokeRole('emp-1', 'ra-1', { reason: 'x' }, 'cmd-1', req),
    ).rejects.toMatchObject({ code: ErrorCode.HISTORY_IMMUTABLE });
  });
});

describe('RevokeRoleAssignmentDto', () => {
  function validate(input: Record<string, unknown>) {
    const dto = plainToInstance(RevokeRoleAssignmentDto, input);
    return validateSync(dto);
  }

  it('rejects a blank reason with REQUIRED_FIELD_MISSING (EX.2)', () => {
    const errors = validate({ reason: '   ' });
    expect(errors).not.toHaveLength(0);
    const constraints = errors[0].constraints ?? {};
    expect(Object.values(constraints)).toContain(
      ErrorCode.REQUIRED_FIELD_MISSING,
    );
  });

  it('accepts a real reason', () => {
    expect(validate({ reason: 'Chuyển điểm' })).toHaveLength(0);
  });
});
