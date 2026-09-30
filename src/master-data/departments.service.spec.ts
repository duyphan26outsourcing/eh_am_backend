import { AppException } from '@/common/exceptions/app.exception';
import { type TableRow } from '@/supabase/supabase.define';
import { type AuthRequest } from '@/auth/auth.interface';
import { DepartmentRepository } from './department.repository';
import { DepartmentsService } from './departments.service';

type DepartmentRow = TableRow<'departments'>;
type RpcArgs = Record<string, unknown>;

function makeRow(overrides: Partial<DepartmentRow> = {}): DepartmentRow {
  return {
    id: 'dep-1',
    code: 'VP-KT',
    name: 'Phòng Kế toán',
    manager_id: null,
    status: 'ACTIVE',
    version: 1,
    created_at: '2026-09-30T00:00:00Z',
    updated_at: '2026-09-30T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function buildService(current?: DepartmentRow | null) {
  const findById = jest.fn(() => Promise.resolve(current ?? null));
  const createViaRpc = jest.fn<Promise<DepartmentRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow()),
  );
  const updateViaRpc = jest.fn<Promise<DepartmentRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ name: 'Đổi tên' })),
  );
  const list = jest.fn();

  const repo = {
    findById,
    createViaRpc,
    updateViaRpc,
    list,
  } as unknown as DepartmentRepository;

  return {
    service: new DepartmentsService(repo),
    findById,
    createViaRpc,
    updateViaRpc,
  };
}

const req = {
  user: { sub: 'user-1', displayName: 'Nguyễn Văn A', employeeCode: 'EH-001' },
  ip: '127.0.0.1',
  headers: { 'user-agent': 'jest' },
  requestId: 'req-1',
} as unknown as AuthRequest;

describe('DepartmentsService.create', () => {
  it('chuẩn hoá mã (in hoa, bỏ khoảng trắng) rồi gọi rpc tạo', async () => {
    const { service, createViaRpc } = buildService();
    await service.create({ code: '  vp-kt ', name: 'Phòng Kế toán' }, req);
    expect(createViaRpc).toHaveBeenCalledTimes(1);
    expect(createViaRpc.mock.calls[0][0].p_code).toBe('VP-KT');
  });
});

describe('DepartmentsService.update', () => {
  it('không tìm thấy phòng ban → NOT_FOUND, không gọi rpc sửa', async () => {
    const { service, updateViaRpc } = buildService(null);
    await expect(
      service.update('dep-x', { name: 'X', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền đúng version cho khoá lạc quan', async () => {
    const { service, updateViaRpc } = buildService(makeRow());
    await service.update('dep-1', { name: 'Đổi tên', version: 2 }, req);
    expect(updateViaRpc.mock.calls[0][0].p_expected_version).toBe(2);
  });
});
