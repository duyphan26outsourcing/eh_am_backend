import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  type EmployeeDirectoryRow,
  toEmployeeListItemModel,
} from './employee.model';
import { EmployeesService } from './employees.service';
import { ListEmployeesQueryDto } from './dto/list-employees.dto';

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
