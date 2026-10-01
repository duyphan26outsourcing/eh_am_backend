import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type TableRow } from '@/supabase/supabase.define';
import { type AuthRequest } from '@/auth/auth.interface';
import { LocationRepository } from './location.repository';
import { LocationsService } from './locations.service';

type LocationRow = TableRow<'locations'>;
type RpcArgs = Record<string, unknown>;

function makeRow(overrides: Partial<LocationRow> = {}): LocationRow {
  return {
    id: 'loc-1',
    code: 'Q1',
    name: 'Cửa hàng Quận 1',
    type: 'STORE',
    address: null,
    province_code: null,
    province_name: null,
    ward_name: null,
    address_detail: null,
    default_cost_center_id: 'cc-1',
    status: 'ACTIVE',
    version: 1,
    created_at: '2026-09-30T00:00:00Z',
    updated_at: '2026-09-30T00:00:00Z',
    created_by: null,
    deactivated_at: null,
    deactivated_by: null,
    deactivated_note: null,
    deactivated_reason_code_id: null,
    updated_by: null,
    ...overrides,
  };
}

function buildService(active: boolean, current?: LocationRow | null) {
  const activeCostCenterExists = jest.fn(() => Promise.resolve(active));
  const findById = jest.fn(() => Promise.resolve(current ?? null));
  const createViaRpc = jest.fn<Promise<LocationRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow()),
  );
  const updateViaRpc = jest.fn<Promise<LocationRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ name: 'Đổi tên' })),
  );
  const list = jest.fn();

  const repo = {
    activeCostCenterExists,
    findById,
    createViaRpc,
    updateViaRpc,
    list,
  } as unknown as LocationRepository;

  return {
    service: new LocationsService(repo),
    activeCostCenterExists,
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
const commandKey = '00000000-0000-4000-8000-000000000099';

describe('LocationsService.create', () => {
  it('chuẩn hoá mã (in hoa, bỏ khoảng trắng) rồi gọi rpc tạo', async () => {
    const { service, createViaRpc } = buildService(true);
    await service.create(
      {
        code: '  q1 ',
        name: 'Cửa hàng Quận 1',
        type: 'STORE',
        provinceCode: '79',
        provinceName: 'Thành phố Hồ Chí Minh',
        wardName: 'Phường Bến Nghé',
        addressDetail: '123 Nguyễn Huệ',
        defaultCostCenterId: 'cc-1',
      },
      commandKey,
      req,
    );
    expect(createViaRpc).toHaveBeenCalledTimes(1);
    expect(createViaRpc.mock.calls[0][0].p_code).toBe('Q1');
    expect(createViaRpc.mock.calls[0][0]).toMatchObject({
      p_province_code: '79',
      p_province_name: 'Thành phố Hồ Chí Minh',
      p_ward_name: 'Phường Bến Nghé',
      p_address_detail: '123 Nguyễn Huệ',
    });
  });

  it('⚠️ EX.1/BR-MDM-04: cost center không Đang hoạt động → REFERENCE_NOT_FOUND, không tạo', async () => {
    const { service, createViaRpc } = buildService(false);
    await expect(
      service.create(
        {
          code: 'Q1',
          name: 'Cửa hàng Quận 1',
          type: 'STORE',
          provinceCode: '79',
          provinceName: 'Thành phố Hồ Chí Minh',
          wardName: 'Phường Bến Nghé',
          addressDetail: '123 Nguyễn Huệ',
          defaultCostCenterId: 'cc-x',
        },
        commandKey,
        req,
      ),
    ).rejects.toMatchObject({ code: ErrorCode.REFERENCE_NOT_FOUND });
    expect(createViaRpc).not.toHaveBeenCalled();
  });
});

describe('LocationsService.update', () => {
  it('không tìm thấy location → NOT_FOUND', async () => {
    const { service, updateViaRpc } = buildService(true, null);
    await expect(
      service.update(
        'loc-x',
        {
          name: 'X',
          provinceCode: '79',
          provinceName: 'Thành phố Hồ Chí Minh',
          wardName: 'Phường Bến Nghé',
          addressDetail: '123 Nguyễn Huệ',
          defaultCostCenterId: 'cc-1',
          version: 1,
        },
        commandKey,
        req,
      ),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền đúng version cho khoá lạc quan', async () => {
    const { service, updateViaRpc } = buildService(true, makeRow());
    await service.update(
      'loc-1',
      {
        name: 'Đổi tên',
        provinceCode: '79',
        provinceName: 'Thành phố Hồ Chí Minh',
        wardName: 'Phường Bến Nghé',
        addressDetail: '123 Nguyễn Huệ',
        defaultCostCenterId: 'cc-1',
        version: 3,
      },
      commandKey,
      req,
    );
    expect(updateViaRpc.mock.calls[0][0].p_expected_version).toBe(3);
    expect(updateViaRpc.mock.calls[0][0].p_ward_name).toBe('Phường Bến Nghé');
  });
});
