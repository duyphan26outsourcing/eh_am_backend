import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { CreateAssetDto } from './dto/create-asset.dto';
import { toCreatedAssetModel, type CreatedAssetRow } from './asset.model';
import { AssetsService } from './assets.service';

function assetRow(overrides: Partial<CreatedAssetRow> = {}): CreatedAssetRow {
  return {
    id: 'asset-1',
    asset_code: 'TS000123',
    name: 'Máy pha cà phê',
    asset_type_id: 'type-1',
    serial: 'SN-001',
    primary_location_id: 'loc-1',
    cost_center_id: 'cc-1',
    responsible_user_id: 'user-1',
    lifecycle_status: 'IN_STORAGE',
    physical_condition: 'GOOD',
    qr_token: 'abc123def456',
    profile_version: 1,
    created_at: '2026-10-01T03:00:00.000Z',
    is_replay: false,
    ...overrides,
  };
}

describe('toCreatedAssetModel', () => {
  it('maps the RPC row to camelCase and exposes the QR token', () => {
    const model = toCreatedAssetModel(assetRow());
    expect(model).toEqual(
      expect.objectContaining({
        id: 'asset-1',
        assetCode: 'TS000123',
        qrToken: 'abc123def456',
        lifecycleStatus: 'IN_STORAGE',
        physicalCondition: 'GOOD',
        costCenterId: 'cc-1',
      }),
    );
    // Không rò cột nội bộ dạng snake_case.
    expect(Object.keys(model)).not.toContain('created_by');
    expect(Object.keys(model)).not.toContain('asset_code');
  });
});

describe('AssetsService.create', () => {
  const req = { user: { sub: 'actor' }, headers: {}, ip: '127.0.0.1' } as never;

  function setup() {
    const repository = {
      createViaRpc: jest.fn().mockResolvedValue(assetRow()),
    };
    const service = new AssetsService(repository as never, {} as never);
    return { service, repository };
  }

  const baseDto: CreateAssetDto = {
    name: 'Máy pha cà phê',
    assetTypeId: '11111111-1111-4111-8111-111111111111',
    serial: 'SN-001',
    primaryLocationId: '22222222-2222-4222-8222-222222222222',
    responsibleUserId: '33333333-3333-4333-8333-333333333333',
    initialStatus: 'IN_STORAGE',
  };

  it('forwards normalized params to the RPC and maps the result', async () => {
    const { service, repository } = setup();
    const result = await service.create(baseDto, 'cmd-1', req);
    expect(repository.createViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_command_key: 'cmd-1',
        p_name: 'Máy pha cà phê',
        p_asset_type_id: baseDto.assetTypeId,
        p_serial: 'SN-001',
        p_primary_location_id: baseDto.primaryLocationId,
        p_responsible_user_id: baseDto.responsibleUserId,
        p_lifecycle_status: 'IN_STORAGE',
        p_actor_id: 'actor',
      }),
    );
    expect(result.assetCode).toBe('TS000123');
    expect(result.qrToken).toBe('abc123def456');
  });

  it('passes null for omitted optional fields', async () => {
    const { service, repository } = setup();
    await service.create(
      { ...baseDto, serial: undefined, note: undefined, supplierId: undefined },
      'cmd-2',
      req,
    );
    expect(repository.createViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_serial: null,
        p_note: null,
        p_supplier_id: null,
        p_invoice_no: null,
        p_purchase_date: null,
      }),
    );
  });

  it('propagates a duplicate-serial error from the repository', async () => {
    const repository = {
      createViaRpc: jest
        .fn()
        .mockRejectedValue({ code: ErrorCode.DUPLICATE_RECORD }),
    };
    const service = new AssetsService(repository as never, {} as never);
    await expect(service.create(baseDto, 'cmd-3', req)).rejects.toMatchObject({
      code: ErrorCode.DUPLICATE_RECORD,
    });
  });
});

describe('CreateAssetDto', () => {
  function validate(input: Record<string, unknown>) {
    return validateSync(plainToInstance(CreateAssetDto, input));
  }

  const valid = {
    name: 'Ghế văn phòng',
    assetTypeId: '11111111-1111-4111-8111-111111111111',
    primaryLocationId: '22222222-2222-4222-8222-222222222222',
    responsibleUserId: '33333333-3333-4333-8333-333333333333',
    initialStatus: 'IN_USE',
  };

  it('accepts a minimal valid payload (serial optional)', () => {
    expect(validate(valid)).toHaveLength(0);
  });

  it('rejects a missing name', () => {
    expect(validate({ ...valid, name: '' })).not.toHaveLength(0);
  });

  it('rejects an initial status outside the domain', () => {
    const errors = validate({ ...valid, initialStatus: 'DISPOSED' });
    expect(errors[0].constraints?.isIn).toBe(ErrorCode.VALUE_OUT_OF_DOMAIN);
  });

  it('rejects a malformed asset type id', () => {
    const errors = validate({ ...valid, assetTypeId: 'nope' });
    expect(errors[0].constraints?.isUuid).toBe(ErrorCode.INVALID_REFERENCE_ID);
  });
});

describe('AssetsService.list (UC-AST-07)', () => {
  const req = { user: { sub: 'actor' }, headers: {}, ip: '127.0.0.1' } as never;

  function directoryRow() {
    return {
      id: 'asset-1',
      asset_code: 'TS000001',
      name: 'Máy pha',
      asset_type_id: 'type-1',
      asset_type_code: 'COFFEE',
      asset_type_name: 'Máy pha cà phê',
      asset_kind: 'FIXED_ASSET',
      serial: 'SN-1',
      lifecycle_status: 'IN_USE',
      physical_condition: 'GOOD',
      primary_location_id: 'loc-1',
      location_code: 'Q1',
      location_name: 'Cửa hàng Quận 1',
      responsible_user_id: 'user-1',
      responsible_name: 'Nguyễn Văn A',
      responsible_employee_code: 'NV001',
      cost_center_id: 'cc-1',
      created_at: '2026-10-01T03:00:00.000Z',
    };
  }

  function setup(
    scope: { allLocations: boolean; locationIds: string[] },
    listResult: unknown = { items: [], total: 0, page: 1, pageSize: 20 },
  ) {
    const repository = { listAssets: jest.fn().mockResolvedValue(listResult) };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue(scope),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    return { service, repository };
  }

  it('rejects a user with no qualifying role (empty scope) with ROLE_REQUIRED (EX.1)', async () => {
    const { service, repository } = setup({
      allLocations: false,
      locationIds: [],
    });
    await expect(
      service.list({ page: 1, pageSize: 20 }, req),
    ).rejects.toMatchObject({ code: ErrorCode.ROLE_REQUIRED });
    expect(repository.listAssets).not.toHaveBeenCalled();
  });

  it('passes null location scope for platform roles and maps rows', async () => {
    const { service, repository } = setup(
      { allLocations: true, locationIds: [] },
      { items: [directoryRow()], total: 1, page: 1, pageSize: 20 },
    );
    const result = await service.list(
      { page: 1, pageSize: 20, search: '  Máy%  ' },
      req,
    );
    expect(repository.listAssets).toHaveBeenCalledWith(
      expect.objectContaining({ locationIds: null, search: 'Máy' }),
    );
    expect(result.items[0].assetCode).toBe('TS000001');
    expect(result.items[0].location?.name).toBe('Cửa hàng Quận 1');
  });

  it('limits a location manager to their assigned locations', async () => {
    const { service, repository } = setup({
      allLocations: false,
      locationIds: ['loc-1', 'loc-2'],
    });
    await service.list({ page: 1, pageSize: 20 }, req);
    expect(repository.listAssets).toHaveBeenCalledWith(
      expect.objectContaining({ locationIds: ['loc-1', 'loc-2'] }),
    );
  });
});
