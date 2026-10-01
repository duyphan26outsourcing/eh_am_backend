import { AppException } from '@/common/exceptions/app.exception';
import { type AuthRequest } from '@/auth/auth.interface';
import { SupplierRepository } from './supplier.repository';
import { SuppliersService } from './suppliers.service';

type SupplierRow = {
  id: string;
  name: string;
  tax_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
};

type RpcArgs = Record<string, unknown>;

function makeRow(overrides: Partial<SupplierRow> = {}): SupplierRow {
  return {
    id: 'supplier-1',
    name: 'Nhà cung cấp kiểm thử',
    tax_id: '0312345678',
    contact_name: 'Nguyễn An',
    contact_phone: '0901234567',
    contact_email: 'an@example.com',
    status: 'ACTIVE',
    version: 1,
    created_at: '2026-09-30T00:00:00Z',
    updated_at: '2026-09-30T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function buildService(current?: SupplierRow | null) {
  const findById = jest.fn(() => Promise.resolve(current ?? null));
  const createViaRpc = jest.fn<Promise<SupplierRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow()),
  );
  const updateViaRpc = jest.fn<Promise<SupplierRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ name: 'Tên mới', version: 2 })),
  );
  const deactivateViaRpc = jest.fn<Promise<SupplierRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ status: 'INACTIVE', version: 2 })),
  );
  const list = jest.fn();

  const repo = {
    findById,
    createViaRpc,
    updateViaRpc,
    deactivateViaRpc,
    list,
  } as unknown as SupplierRepository;

  return {
    service: new SuppliersService(repo),
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

const commandKey = '11111111-1111-4111-8111-111111111111';

describe('SuppliersService.create', () => {
  it('chuẩn hoá dữ liệu liên hệ và truyền command key vào rpc', async () => {
    const { service, createViaRpc } = buildService();

    await service.create(
      {
        name: '  Nhà cung cấp kiểm thử  ',
        taxId: ' 0312345678 ',
        contactName: '  Nguyễn An  ',
        contactPhone: '+84 901.234-567',
        contactEmail: '  AN@EXAMPLE.COM ',
      },
      commandKey,
      req,
    );

    expect(createViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_name: 'Nhà cung cấp kiểm thử',
        p_tax_id: '0312345678',
        p_contact_name: 'Nguyễn An',
        p_contact_phone: '0901234567',
        p_contact_email: 'an@example.com',
        p_command_key: commandKey,
      }),
    );
  });

  it('đổi các trường liên hệ để trống thành sentinel cho rpc', async () => {
    const { service, createViaRpc } = buildService();

    await service.create({ name: 'Cá nhân', taxId: '' }, commandKey, req);

    expect(createViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_tax_id: '',
        p_contact_name: '',
        p_contact_phone: '',
        p_contact_email: '',
      }),
    );
  });
});

describe('SuppliersService.update', () => {
  it('không tìm thấy supplier thì không gọi rpc sửa', async () => {
    const { service, updateViaRpc } = buildService(null);

    await expect(
      service.update(
        'supplier-x',
        { name: 'Tên mới', version: 1 },
        commandKey,
        req,
      ),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền version, command key và diff các trường thay đổi', async () => {
    const { service, updateViaRpc } = buildService(makeRow());

    await service.update(
      'supplier-1',
      {
        name: 'Tên mới',
        taxId: '0312345678-001',
        contactName: 'Nguyễn Bình',
        contactPhone: '0912345678',
        contactEmail: 'binh@example.com',
        version: 3,
      },
      commandKey,
      req,
    );

    const args = updateViaRpc.mock.calls[0][0];
    expect(args.p_expected_version).toBe(3);
    expect(args.p_command_key).toBe(commandKey);
    expect(args.p_changes).toEqual(
      expect.objectContaining({
        name: { from: 'Nhà cung cấp kiểm thử', to: 'Tên mới' },
        taxId: { from: '0312345678', to: '0312345678-001' },
      }),
    );
  });
});

describe('SuppliersService.deactivate', () => {
  it('truyền lý do, version, command key và diff trạng thái', async () => {
    const { service, deactivateViaRpc } = buildService(makeRow());

    await service.deactivate(
      'supplier-1',
      { reasonCodeId: 'reason-1', note: 'Không còn giao dịch', version: 4 },
      commandKey,
      req,
    );

    expect(deactivateViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_reason_code_id: 'reason-1',
        p_note: 'Không còn giao dịch',
        p_expected_version: 4,
        p_command_key: commandKey,
        p_changes: {
          status: { from: 'ACTIVE', to: 'INACTIVE' },
        },
      }),
    );
  });
});
