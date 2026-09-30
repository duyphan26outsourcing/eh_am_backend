import { AppException } from '@/common/exceptions/app.exception';
import { type TableRow } from '@/supabase/supabase.define';
import { type AuthRequest } from '@/auth/auth.interface';
import { CostCenterRepository } from './cost-center.repository';
import { CostCentersService } from './cost-centers.service';

type CostCenterRow = TableRow<'cost_centers'>;
type RpcArgs = Record<string, unknown>;

function makeRow(overrides: Partial<CostCenterRow> = {}): CostCenterRow {
  return {
    id: 'cc-1',
    code: 'CC-STORE-01',
    name: 'Cửa hàng Quận 1',
    status: 'ACTIVE',
    version: 1,
    created_at: '2026-09-30T00:00:00Z',
    updated_at: '2026-09-30T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function buildService(current?: CostCenterRow | null) {
  const findById = jest.fn(() => Promise.resolve(current ?? null));
  const createViaRpc = jest.fn<Promise<CostCenterRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow()),
  );
  const updateViaRpc = jest.fn<Promise<CostCenterRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ name: 'Đổi tên' })),
  );
  const deactivateViaRpc = jest.fn<Promise<CostCenterRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ status: 'INACTIVE', version: 2 })),
  );
  const list = jest.fn();

  const repo = {
    findById,
    createViaRpc,
    updateViaRpc,
    deactivateViaRpc,
    list,
  } as unknown as CostCenterRepository;

  return {
    service: new CostCentersService(repo),
    findById,
    createViaRpc,
    updateViaRpc,
    deactivateViaRpc,
  };
}

const req = {
  user: { sub: 'user-1', displayName: 'Nguyễn Văn A', employeeCode: 'EH-001' },
  ip: '127.0.0.1',
  headers: { 'user-agent': 'jest' },
  requestId: 'req-1',
} as unknown as AuthRequest;

describe('CostCentersService.create', () => {
  it('chuẩn hoá mã (in hoa, bỏ khoảng trắng) rồi gọi rpc tạo', async () => {
    const { service, createViaRpc } = buildService();
    await service.create(
      { code: '  cc-store-01 ', name: 'Cửa hàng Quận 1' },
      req,
    );
    expect(createViaRpc).toHaveBeenCalledTimes(1);
    expect(createViaRpc.mock.calls[0][0].p_code).toBe('CC-STORE-01');
  });
});

describe('CostCentersService.update', () => {
  it('không tìm thấy cost center → NOT_FOUND, không gọi rpc sửa', async () => {
    const { service, updateViaRpc } = buildService(null);
    await expect(
      service.update('cc-x', { name: 'X', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền đúng version cho khoá lạc quan', async () => {
    const { service, updateViaRpc } = buildService(makeRow());
    await service.update('cc-1', { name: 'Đổi tên', version: 3 }, req);
    expect(updateViaRpc.mock.calls[0][0].p_expected_version).toBe(3);
  });
});

describe('CostCentersService.deactivate', () => {
  it('không tìm thấy cost center → NOT_FOUND, không gọi rpc ngừng', async () => {
    const { service, deactivateViaRpc } = buildService(null);
    await expect(
      service.deactivate('cc-x', { reasonCodeId: 'reason-1', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(deactivateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền lý do, ô ghi thêm, version và diff trạng thái cho rpc ngừng', async () => {
    const { service, deactivateViaRpc } = buildService(makeRow());
    await service.deactivate(
      'cc-1',
      { reasonCodeId: 'reason-1', note: 'Gộp trung tâm', version: 3 },
      req,
    );
    const args = deactivateViaRpc.mock.calls[0][0];
    expect(args.p_reason_code_id).toBe('reason-1');
    expect(args.p_note).toBe('Gộp trung tâm');
    expect(args.p_expected_version).toBe(3);
    // Diff trạng thái ACTIVE → INACTIVE để nhật ký ghi trước/sau (BR-CMN-02).
    expect(args.p_changes).toMatchObject({
      status: { from: 'ACTIVE', to: 'INACTIVE' },
    });
  });
});
