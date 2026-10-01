import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDescriptionDto } from './dto/update-asset-description.dto';
import { ChangeAssetResponsibleDto } from './dto/change-asset-responsible.dto';
import { SetAssetLifecycleDto } from './dto/set-asset-lifecycle.dto';
import { RequestAssetCancellationDto } from './dto/request-asset-cancellation.dto';
import { DecideAssetCancellationDto } from './dto/decide-asset-cancellation.dto';
import { ListCancellationsQueryDto } from './dto/list-cancellations.dto';
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

describe('AssetsService.detail (UC-AST-08)', () => {
  const req = {
    user: { sub: 'actor', app_metadata: {} },
    headers: {},
    ip: '127.0.0.1',
  } as never;

  const detailRow = {
    id: 'asset-1',
    asset_code: 'TS000001',
    name: 'Máy pha cà phê',
    asset_type_id: 'type-1',
    serial: 'SN-1',
    note: 'Quầy bar',
    purchase_date: '2026-09-20',
    supplier_id: 'supplier-1',
    invoice_no: 'HD-001',
    primary_location_id: 'loc-1',
    cost_center_id: 'cc-1',
    responsible_user_id: 'user-1',
    lifecycle_status: 'IN_USE',
    physical_condition: 'GOOD',
    profile_version: 1,
    created_at: '2026-10-01T03:00:00.000Z',
    updated_at: '2026-10-01T03:00:00.000Z',
    asset_type: {
      id: 'type-1',
      code: 'COFFEE',
      name: 'Máy pha',
      asset_kind: 'FIXED_ASSET',
    },
    location: { id: 'loc-1', code: 'Q1', name: 'Cửa hàng Quận 1' },
    cost_center: { id: 'cc-1', code: 'CC-Q1', name: 'Vận hành Quận 1' },
    responsible: {
      id: 'user-1',
      display_name: 'Nguyễn Văn A',
      employee_code: 'NV001',
    },
    supplier: { id: 'supplier-1', name: 'Công ty ABC' },
  };

  const timelineRows = [
    {
      id: 1,
      event_code: 'asset.asset.created',
      actor_label: 'Quản lý tài sản',
      created_at: '2026-10-01T03:00:00.000Z',
      reason: null,
      changes: {
        lifecycle_status: { from: null, to: 'IN_USE' },
        original_cost: { from: null, to: 12000000 },
      },
    },
  ];

  function setup(scope: { allLocations: boolean; locationIds: string[] }) {
    const repository = {
      findDetailInScope: jest.fn().mockResolvedValue(detailRow),
      listTimeline: jest.fn().mockResolvedValue(timelineRows),
      resolveAuditReferenceNames: jest.fn().mockResolvedValue({}),
    };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue(scope),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    return { service, repository };
  }

  it('rejects an actor without a qualifying role before reading the asset', async () => {
    const { service, repository } = setup({
      allLocations: false,
      locationIds: [],
    });
    await expect(service.detail('asset-1', req)).rejects.toMatchObject({
      code: ErrorCode.ROLE_REQUIRED,
    });
    expect(repository.findDetailInScope).not.toHaveBeenCalled();
  });

  it('returns financial fields for a platform-scoped viewer', async () => {
    const { service, repository } = setup({
      allLocations: true,
      locationIds: [],
    });
    const result = await service.detail('asset-1', req);
    expect(repository.findDetailInScope).toHaveBeenCalledWith('asset-1', null);
    expect(result.financial).toEqual({ invoiceNo: 'HD-001' });
    expect(result.timeline[0].changes).toHaveProperty('original_cost');
    expect(result).not.toHaveProperty('qrToken');
  });

  it('masks financial fields and monetary timeline changes for a location manager', async () => {
    const { service, repository } = setup({
      allLocations: false,
      locationIds: ['loc-1'],
    });
    const result = await service.detail('asset-1', req);
    expect(repository.findDetailInScope).toHaveBeenCalledWith('asset-1', [
      'loc-1',
    ]);
    expect(result.financial).toBeNull();
    expect(result.timeline[0].changes).not.toHaveProperty('original_cost');
    expect(result.timeline[0].changes).toHaveProperty('lifecycle_status');
  });

  it('returns NOT_FOUND without loading timeline when the asset is outside scope', async () => {
    const { service, repository } = setup({
      allLocations: false,
      locationIds: ['loc-2'],
    });
    repository.findDetailInScope.mockResolvedValue(null);
    await expect(service.detail('asset-1', req)).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    expect(repository.listTimeline).not.toHaveBeenCalled();
  });

  it('marks terminal profiles as read-only', async () => {
    const { service, repository } = setup({
      allLocations: true,
      locationIds: [],
    });
    repository.findDetailInScope.mockResolvedValue({
      ...detailRow,
      lifecycle_status: 'DISPOSED',
    });
    await expect(service.detail('asset-1', req)).resolves.toMatchObject({
      readOnly: true,
    });
  });

  it('resolves reference ids in the timeline to display names', async () => {
    const { service, repository } = setup({
      allLocations: true,
      locationIds: [],
    });
    repository.listTimeline.mockResolvedValue([
      {
        id: 2,
        event_code: 'asset.responsible.changed',
        actor_label: 'Quản lý tài sản',
        created_at: '2026-10-01T04:00:00.000Z',
        reason: 'Bàn giao',
        changes: {
          responsible_user_id: { before: 'user-1', after: 'user-2' },
        },
      },
    ]);
    repository.resolveAuditReferenceNames.mockResolvedValue({
      'user-1': 'Nguyễn Văn A',
      'user-2': 'Trần Thị B',
    });
    const result = await service.detail('asset-1', req);
    expect(result.timeline[0].changes).toMatchObject({
      responsible_user_id: { before: 'Nguyễn Văn A', after: 'Trần Thị B' },
    });
  });
});

describe('UpdateAssetDescriptionDto (UC-AST-03)', () => {
  const valid = {
    name: 'Máy pha cà phê',
    assetTypeId: '11111111-1111-4111-8111-111111111111',
    serial: 'SN-001',
    note: 'Quầy bar',
    profileVersion: 2,
  };

  const validate = (input: Record<string, unknown>) => {
    const dto = plainToInstance(UpdateAssetDescriptionDto, input);
    return { dto, errors: validateSync(dto) };
  };

  it('accepts and trims a valid description update', () => {
    const { dto, errors } = validate({
      ...valid,
      name: '  Máy pha cà phê  ',
      serial: '  SN-001  ',
      note: '  Quầy bar  ',
    });
    expect(errors).toHaveLength(0);
    expect(dto).toMatchObject({
      name: 'Máy pha cà phê',
      serial: 'SN-001',
      note: 'Quầy bar',
    });
  });

  it('rejects an empty name and non-positive version', () => {
    expect(
      validate({ ...valid, name: '', profileVersion: 0 }).errors,
    ).toHaveLength(2);
  });

  it('normalizes blank optional fields to undefined', () => {
    const { dto, errors } = validate({ ...valid, serial: ' ', note: ' ' });
    expect(errors).toHaveLength(0);
    expect(dto.serial).toBeUndefined();
    expect(dto.note).toBeUndefined();
  });
});

describe('AssetsService.updateDescription (UC-AST-03)', () => {
  it('forwards only description fields, version and audit context to the RPC', async () => {
    const repository = {
      updateDescriptionViaRpc: jest.fn().mockResolvedValue({
        id: 'asset-1',
        asset_code: 'TS000001',
        name: 'Tên mới',
        asset_type_id: 'type-1',
        serial: null,
        note: null,
        profile_version: 3,
        updated_at: '2026-10-01T04:00:00.000Z',
        is_replay: false,
      }),
    };
    const service = new AssetsService(repository as never, {} as never);
    const req = {
      user: { sub: 'actor-1' },
      headers: {},
      ip: '127.0.0.1',
    } as never;
    const dto: UpdateAssetDescriptionDto = {
      name: 'Tên mới',
      assetTypeId: '11111111-1111-4111-8111-111111111111',
      profileVersion: 2,
    };

    const result = await service.updateDescription(
      'asset-1',
      dto,
      'cmd-1',
      req,
    );
    expect(repository.updateDescriptionViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_asset_id: 'asset-1',
        p_name: 'Tên mới',
        p_asset_type_id: dto.assetTypeId,
        p_serial: null,
        p_note: null,
        p_reason_code_id: null,
        p_expected_version: 2,
        p_actor_id: 'actor-1',
        p_command_key: 'cmd-1',
      }),
    );
    expect(result).toMatchObject({ assetCode: 'TS000001', profileVersion: 3 });
  });
});

describe('ChangeAssetResponsibleDto (UC-AST-05)', () => {
  it('accepts a complete change and trims the optional note', () => {
    const dto = plainToInstance(ChangeAssetResponsibleDto, {
      responsibleUserId: '11111111-1111-4111-8111-111111111111',
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
      reasonNote: '  Bàn giao ca mới  ',
      profileVersion: 2,
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.reasonNote).toBe('Bàn giao ca mới');
  });

  it('rejects missing references and a non-positive version', () => {
    const dto = plainToInstance(ChangeAssetResponsibleDto, {
      responsibleUserId: '',
      reasonCodeId: '',
      profileVersion: 0,
    });
    expect(validateSync(dto)).toHaveLength(3);
  });
});

describe('AssetsService responsibility scope (UC-AST-05)', () => {
  const context = {
    id: 'asset-1',
    asset_code: 'TS000001',
    primary_location_id: 'location-1',
    location_type: 'STORE',
    responsible_user_id: 'old-user',
    lifecycle_status: 'IN_USE',
    profile_version: 2,
  };
  const req = {
    user: { sub: 'actor-1' },
    headers: {},
    ip: '127.0.0.1',
  } as never;

  it('does not expose an asset outside the location manager scope', async () => {
    const repository = {
      findResponsibilityContext: jest.fn().mockResolvedValue(context),
      listResponsibilityOptions: jest.fn(),
    };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue({
        allLocations: false,
        locationIds: ['location-2'],
      }),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    await expect(
      service.responsibilityOptions('asset-1', req),
    ).rejects.toMatchObject({
      code: ErrorCode.NOT_FOUND,
    });
    expect(repository.listResponsibilityOptions).not.toHaveBeenCalled();
  });

  it('passes an authorized change to the atomic RPC', async () => {
    const repository = {
      findResponsibilityContext: jest.fn().mockResolvedValue(context),
      changeResponsibleViaRpc: jest.fn().mockResolvedValue({
        id: 'asset-1',
        asset_code: 'TS000001',
        responsible_user_id: '11111111-1111-4111-8111-111111111111',
        profile_version: 3,
        updated_at: '2026-10-01T10:00:00Z',
      }),
    };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue({
        allLocations: false,
        locationIds: ['location-1'],
      }),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    const dto: ChangeAssetResponsibleDto = {
      responsibleUserId: '11111111-1111-4111-8111-111111111111',
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
      profileVersion: 2,
    };
    await expect(
      service.changeResponsible('asset-1', dto, 'cmd-1', req),
    ).resolves.toMatchObject({
      responsibleUserId: dto.responsibleUserId,
      profileVersion: 3,
    });
    expect(repository.changeResponsibleViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_asset_id: 'asset-1',
        p_responsible_user_id: dto.responsibleUserId,
        p_reason_code_id: dto.reasonCodeId,
        p_expected_version: 2,
        p_command_key: 'cmd-1',
        p_actor_id: 'actor-1',
      }),
    );
  });
});

describe('SetAssetLifecycleDto (UC-AST-11)', () => {
  it('accepts a valid toggle and trims the note', () => {
    const dto = plainToInstance(SetAssetLifecycleDto, {
      targetStatus: 'IN_USE',
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
      reasonNote: '  Đưa ra quầy  ',
      profileVersion: 2,
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.reasonNote).toBe('Đưa ra quầy');
  });

  it('rejects a status outside the toggle domain and a bad version', () => {
    const dto = plainToInstance(SetAssetLifecycleDto, {
      targetStatus: 'UNDER_REPAIR',
      reasonCodeId: '',
      profileVersion: 0,
    });
    // targetStatus ngoài miền + reasonCodeId sai UUID + version < 1.
    expect(validateSync(dto)).toHaveLength(3);
  });
});

describe('AssetsService lifecycle scope (UC-AST-11)', () => {
  const context = {
    id: 'asset-1',
    asset_code: 'TS000001',
    primary_location_id: 'location-1',
    location_type: 'STORE',
    responsible_user_id: 'old-user',
    lifecycle_status: 'IN_STORAGE',
    profile_version: 2,
  };
  const req = {
    user: { sub: 'actor-1' },
    headers: {},
    ip: '127.0.0.1',
  } as never;
  const dto: SetAssetLifecycleDto = {
    targetStatus: 'IN_USE',
    reasonCodeId: '22222222-2222-4222-8222-222222222222',
    profileVersion: 2,
  };

  it('rejects an empty scope before touching the repository', async () => {
    const repository = {
      findResponsibilityContext: jest.fn(),
      setLifecycleViaRpc: jest.fn(),
    };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue({
        allLocations: false,
        locationIds: [],
      }),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    await expect(
      service.changeLifecycle('asset-1', dto, 'cmd-1', req),
    ).rejects.toMatchObject({ code: ErrorCode.ROLE_REQUIRED });
    expect(repository.setLifecycleViaRpc).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND for an asset outside the location scope', async () => {
    const repository = {
      findResponsibilityContext: jest.fn().mockResolvedValue(context),
      setLifecycleViaRpc: jest.fn(),
    };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue({
        allLocations: false,
        locationIds: ['location-2'],
      }),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    await expect(
      service.changeLifecycle('asset-1', dto, 'cmd-1', req),
    ).rejects.toMatchObject({ code: ErrorCode.NOT_FOUND });
    expect(repository.setLifecycleViaRpc).not.toHaveBeenCalled();
  });

  it('passes an authorized toggle to the atomic RPC', async () => {
    const repository = {
      findResponsibilityContext: jest.fn().mockResolvedValue(context),
      setLifecycleViaRpc: jest.fn().mockResolvedValue({
        id: 'asset-1',
        asset_code: 'TS000001',
        lifecycle_status: 'IN_USE',
        profile_version: 3,
        updated_at: '2026-10-01T10:00:00Z',
      }),
    };
    const accessScope = {
      resolveLocationScope: jest.fn().mockResolvedValue({
        allLocations: false,
        locationIds: ['location-1'],
      }),
    };
    const service = new AssetsService(
      repository as never,
      accessScope as never,
    );
    await expect(
      service.changeLifecycle('asset-1', dto, 'cmd-1', req),
    ).resolves.toMatchObject({
      lifecycleStatus: 'IN_USE',
      profileVersion: 3,
    });
    expect(repository.setLifecycleViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_asset_id: 'asset-1',
        p_target_status: 'IN_USE',
        p_reason_code_id: dto.reasonCodeId,
        p_expected_version: 2,
        p_command_key: 'cmd-1',
        p_actor_id: 'actor-1',
      }),
    );
  });
});

describe('Asset cancellation DTOs (UC-AST-09/10)', () => {
  it('accepts a valid cancellation request and trims the note', () => {
    const dto = plainToInstance(RequestAssetCancellationDto, {
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
      reasonNote: '  Trùng hồ sơ  ',
    });
    expect(validateSync(dto)).toHaveLength(0);
    expect(dto.reasonNote).toBe('Trùng hồ sơ');
  });

  it('rejects a cancellation request with a bad reason id', () => {
    const dto = plainToInstance(RequestAssetCancellationDto, {
      reasonCodeId: 'nope',
    });
    expect(validateSync(dto)).toHaveLength(1);
  });

  it('accepts a valid decision and rejects a bad decision/version', () => {
    expect(
      validateSync(
        plainToInstance(DecideAssetCancellationDto, {
          decision: 'APPROVE',
          expectedVersion: 1,
        }),
      ),
    ).toHaveLength(0);
    expect(
      validateSync(
        plainToInstance(DecideAssetCancellationDto, {
          decision: 'MAYBE',
          expectedVersion: 0,
        }),
      ).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('rejects an out-of-domain queue status', () => {
    const dto = plainToInstance(ListCancellationsQueryDto, {
      status: 'NOPE',
    });
    expect(validateSync(dto)).toHaveLength(1);
  });
});

describe('AssetsService cancellation (UC-AST-09/10)', () => {
  const req = {
    user: { sub: 'actor-1' },
    headers: {},
    ip: '127.0.0.1',
  } as never;

  it('passes a cancellation request to the atomic RPC', async () => {
    const repository = {
      requestCancellationViaRpc: jest.fn().mockResolvedValue({
        id: 'req-1',
        asset_id: 'asset-1',
        status: 'PENDING',
        requested_at: '2026-10-02T03:00:00Z',
        version: 1,
      }),
    };
    const service = new AssetsService(repository as never, {} as never);
    const dto: RequestAssetCancellationDto = {
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
    };
    await expect(
      service.requestCancellation('asset-1', dto, 'cmd-1', req),
    ).resolves.toMatchObject({ id: 'req-1', status: 'PENDING', version: 1 });
    expect(repository.requestCancellationViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_asset_id: 'asset-1',
        p_reason_code_id: dto.reasonCodeId,
        p_command_key: 'cmd-1',
        p_actor_id: 'actor-1',
      }),
    );
  });

  it('defaults the queue status to PENDING', async () => {
    const repository = {
      listCancellations: jest
        .fn()
        .mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 }),
    };
    const service = new AssetsService(repository as never, {} as never);
    await service.listCancellations({ page: 1, pageSize: 20 });
    expect(repository.listCancellations).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING', page: 1, pageSize: 20 }),
    );
  });

  it('passes an approve decision with the expected version', async () => {
    const repository = {
      decideCancellationViaRpc: jest.fn().mockResolvedValue({
        id: 'req-1',
        asset_id: 'asset-1',
        status: 'APPROVED',
        decision: 'APPROVE',
        version: 2,
      }),
    };
    const service = new AssetsService(repository as never, {} as never);
    const dto: DecideAssetCancellationDto = {
      decision: 'APPROVE',
      expectedVersion: 1,
    };
    await expect(
      service.decideCancellation('req-1', dto, 'cmd-2', req),
    ).resolves.toMatchObject({ status: 'APPROVED', decision: 'APPROVE' });
    expect(repository.decideCancellationViaRpc).toHaveBeenCalledWith(
      expect.objectContaining({
        p_cancellation_id: 'req-1',
        p_decision: 'APPROVE',
        p_expected_version: 1,
        p_reason_code_id: null,
        p_command_key: 'cmd-2',
      }),
    );
  });
});
