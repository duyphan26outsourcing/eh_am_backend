import { AppException } from '@/common/exceptions/app.exception';
import { type TableRow } from '@/supabase/supabase.define';
import { type AuthRequest } from '@/auth/auth.interface';
import { AssetTypeRepository } from './asset-type.repository';
import { AssetTypesService } from './asset-types.service';

type AssetTypeRow = TableRow<'asset_types'>;
type RpcArgs = Record<string, unknown>;

function makeRow(overrides: Partial<AssetTypeRow> = {}): AssetTypeRow {
  return {
    id: 'at-1',
    parent_id: 'grp-1',
    code: 'LAPTOP',
    name: 'Máy tính xách tay',
    asset_kind: 'FIXED_ASSET',
    serial_required: true,
    useful_life_months: 36,
    fast_group_code: 'FA-IT',
    status: 'ACTIVE',
    version: 1,
    created_at: '2026-09-30T00:00:00Z',
    updated_at: '2026-09-30T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function buildService(current?: AssetTypeRow | null) {
  const findById = jest.fn(() => Promise.resolve(current ?? null));
  const createGroupViaRpc = jest.fn<Promise<AssetTypeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ parent_id: null, asset_kind: null })),
  );
  const createTypeViaRpc = jest.fn<Promise<AssetTypeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow()),
  );
  const updateGroupViaRpc = jest.fn<Promise<AssetTypeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ parent_id: null, asset_kind: null })),
  );
  const updateTypeViaRpc = jest.fn<Promise<AssetTypeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ name: 'Đổi tên' })),
  );
  const deactivateViaRpc = jest.fn<Promise<AssetTypeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ status: 'INACTIVE', version: 2 })),
  );
  const list = jest.fn();

  const repo = {
    findById,
    createGroupViaRpc,
    createTypeViaRpc,
    updateGroupViaRpc,
    updateTypeViaRpc,
    deactivateViaRpc,
    list,
  } as unknown as AssetTypeRepository;

  return {
    service: new AssetTypesService(repo),
    createGroupViaRpc,
    createTypeViaRpc,
    updateGroupViaRpc,
    updateTypeViaRpc,
    deactivateViaRpc,
  };
}

const req = {
  user: { sub: 'user-1', displayName: 'Nguyễn Văn A', employeeCode: 'EH-001' },
  ip: '127.0.0.1',
  headers: { 'user-agent': 'jest' },
  requestId: 'req-1',
} as unknown as AuthRequest;

describe('AssetTypesService.createGroup', () => {
  it('chuẩn hoá mã (in hoa, bỏ khoảng trắng) rồi gọi rpc tạo nhóm', async () => {
    const { service, createGroupViaRpc } = buildService();
    await service.createGroup({ code: '  it-eq ', name: 'Thiết bị IT' }, req);
    expect(createGroupViaRpc.mock.calls[0][0].p_code).toBe('IT-EQ');
  });
});

describe('AssetTypesService.createType', () => {
  it('truyền parentId + cờ; field trống dùng sentinel (0 / rỗng)', async () => {
    const { service, createTypeViaRpc } = buildService();
    await service.createType(
      {
        parentId: 'grp-1',
        code: 'chair',
        name: 'Ghế',
        assetKind: 'TOOL',
      },
      req,
    );
    const args = createTypeViaRpc.mock.calls[0][0];
    expect(args.p_parent_id).toBe('grp-1');
    expect(args.p_code).toBe('CHAIR');
    expect(args.p_asset_kind).toBe('TOOL');
    // Không nhập → sentinel: 0 (thời gian) và '' (mã FAST) để RPC đổi thành NULL.
    expect(args.p_useful_life_months).toBe(0);
    expect(args.p_fast_group_code).toBe('');
    expect(args.p_serial_required).toBe(false);
  });

  it('chuẩn hoá mã FAST in hoa khi có nhập', async () => {
    const { service, createTypeViaRpc } = buildService();
    await service.createType(
      {
        parentId: 'grp-1',
        code: 'LAPTOP',
        name: 'Laptop',
        assetKind: 'FIXED_ASSET',
        usefulLifeMonths: 36,
        fastGroupCode: ' fa-it ',
      },
      req,
    );
    const args = createTypeViaRpc.mock.calls[0][0];
    expect(args.p_useful_life_months).toBe(36);
    expect(args.p_fast_group_code).toBe('FA-IT');
  });
});

describe('AssetTypesService.updateGroup', () => {
  it('không tìm thấy hoặc mục là loại → NOT_FOUND, không gọi rpc', async () => {
    const { service, updateGroupViaRpc } = buildService(makeRow()); // makeRow là LOẠI
    await expect(
      service.updateGroup('at-1', { name: 'X', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateGroupViaRpc).not.toHaveBeenCalled();
  });

  it('sửa nhóm hợp lệ → truyền version', async () => {
    const { service, updateGroupViaRpc } = buildService(
      makeRow({ parent_id: null, asset_kind: null }),
    );
    await service.updateGroup('grp-1', { name: 'Đổi tên', version: 4 }, req);
    expect(updateGroupViaRpc.mock.calls[0][0].p_expected_version).toBe(4);
  });
});

describe('AssetTypesService.updateType', () => {
  it('mục là nhóm → NOT_FOUND, không gọi rpc', async () => {
    const { service, updateTypeViaRpc } = buildService(
      makeRow({ parent_id: null, asset_kind: null }),
    );
    await expect(
      service.updateType(
        'grp-1',
        { name: 'X', assetKind: 'TOOL', version: 1 },
        req,
      ),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateTypeViaRpc).not.toHaveBeenCalled();
  });

  it('sửa loại hợp lệ → truyền version + cờ', async () => {
    const { service, updateTypeViaRpc } = buildService(makeRow());
    await service.updateType(
      'at-1',
      { name: 'Laptop', assetKind: 'FIXED_ASSET', version: 2 },
      req,
    );
    const args = updateTypeViaRpc.mock.calls[0][0];
    expect(args.p_expected_version).toBe(2);
    expect(args.p_asset_kind).toBe('FIXED_ASSET');
  });
});

describe('AssetTypesService.deactivate', () => {
  it('không tìm thấy → NOT_FOUND, không gọi rpc', async () => {
    const { service, deactivateViaRpc } = buildService(null);
    await expect(
      service.deactivate('at-x', { reasonCodeId: 'r-1', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(deactivateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền lý do + version + diff trạng thái', async () => {
    const { service, deactivateViaRpc } = buildService(makeRow());
    await service.deactivate(
      'at-1',
      { reasonCodeId: 'r-1', note: 'Gộp loại', version: 3 },
      req,
    );
    const args = deactivateViaRpc.mock.calls[0][0];
    expect(args.p_reason_code_id).toBe('r-1');
    expect(args.p_note).toBe('Gộp loại');
    expect(args.p_expected_version).toBe(3);
    expect(args.p_changes).toMatchObject({
      status: { from: 'ACTIVE', to: 'INACTIVE' },
    });
  });
});
