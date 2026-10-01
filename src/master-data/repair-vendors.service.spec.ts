import { type AuthRequest } from '@/auth/auth.interface';
import { type TableRow } from '@/supabase/supabase.define';
import { RepairVendorRepository } from './repair-vendor.repository';
import { RepairVendorsService } from './repair-vendors.service';

type Row = TableRow<'repair_vendors'>;
type Args = Record<string, unknown>;

const row = (overrides: Partial<Row> = {}): Row => ({
  id: 'vendor-1',
  name: 'Điện máy Minh Tâm',
  contact_name: null,
  contact_phone: null,
  contact_email: null,
  service_types: ['REPAIR'],
  external_location_id: '00000000-0000-4000-8000-000000000001',
  status: 'ACTIVE',
  deactivated_reason_code_id: null,
  deactivated_note: null,
  deactivated_at: null,
  deactivated_by: null,
  version: 1,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  created_by: null,
  updated_by: null,
  ...overrides,
});

const req = {
  user: { sub: 'user-1', displayName: 'Duy', employeeCode: 'EH-001' },
  headers: { 'user-agent': 'jest' },
  ip: '127.0.0.1',
  requestId: 'req-1',
} as unknown as AuthRequest;

function setup(current: Row | null = row()) {
  const createViaRpc = jest.fn<Promise<Row>, [Args]>(() =>
    Promise.resolve(row()),
  );
  const updateViaRpc = jest.fn<Promise<Row>, [Args]>(() =>
    Promise.resolve(row({ version: 2 })),
  );
  const deactivateViaRpc = jest.fn<Promise<Row>, [Args]>(() =>
    Promise.resolve(row({ status: 'INACTIVE', version: 2 })),
  );
  const findById = jest.fn(() => Promise.resolve(current));
  const availableLocations = jest.fn(() =>
    Promise.resolve([{ id: 'loc-1', code: 'EXT-01', name: 'Minh Tâm' }]),
  );
  const repo = {
    createViaRpc,
    updateViaRpc,
    deactivateViaRpc,
    findById,
    availableLocations,
    list: jest.fn(),
  } as unknown as RepairVendorRepository;
  return {
    service: new RepairVendorsService(repo),
    createViaRpc,
    updateViaRpc,
    deactivateViaRpc,
    availableLocations,
  };
}

describe('RepairVendorsService', () => {
  it('create chuẩn hoá liên hệ, dịch vụ và truyền location', async () => {
    const { service, createViaRpc } = setup();
    await service.create(
      {
        name: ' Điện máy Minh Tâm ',
        contactPhone: '+84 901-234-567',
        contactEmail: ' HELLO@EXAMPLE.COM ',
        serviceTypes: ['WARRANTY', 'REPAIR', 'REPAIR'],
        externalLocationId: '00000000-0000-4000-8000-000000000001',
      },
      '00000000-0000-4000-8000-000000000002',
      req,
    );
    expect(createViaRpc.mock.calls[0][0]).toMatchObject({
      p_name: 'Điện máy Minh Tâm',
      p_contact_phone: '0901234567',
      p_contact_email: 'hello@example.com',
      p_service_types: ['REPAIR', 'WARRANTY'],
      p_external_location_id: '00000000-0000-4000-8000-000000000001',
    });
  });

  it('update không truyền location', async () => {
    const { service, updateViaRpc } = setup();
    await service.update(
      'vendor-1',
      { name: 'Tên mới', serviceTypes: ['REPAIR'], version: 1 },
      '00000000-0000-4000-8000-000000000002',
      req,
    );
    expect(updateViaRpc.mock.calls[0][0]).not.toHaveProperty(
      'p_external_location_id',
    );
  });

  it('available locations giữ location hiện tại khi sửa', async () => {
    const { service, availableLocations } = setup();
    await service.availableLocations('vendor-1');
    expect(availableLocations).toHaveBeenCalledWith(
      '00000000-0000-4000-8000-000000000001',
    );
  });

  it('deactivate gửi thay đổi cho cả vendor và location', async () => {
    const { service, deactivateViaRpc } = setup();
    await service.deactivate(
      'vendor-1',
      {
        reasonCodeId: '00000000-0000-4000-8000-000000000003',
        version: 1,
      },
      '00000000-0000-4000-8000-000000000002',
      req,
    );
    const args = deactivateViaRpc.mock.calls[0][0];
    expect(args.p_vendor_changes).toBeDefined();
    expect(args.p_location_changes).toBeDefined();
  });
});
