import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type TableRow } from '@/supabase/supabase.define';
import { type AuthRequest } from '@/auth/auth.interface';
import { ReasonCodeRepository } from './reason-code.repository';
import { ReasonCodesService } from './reason-codes.service';

type ReasonCodeRow = TableRow<'reason_codes'>;
type RpcArgs = Record<string, unknown>;

function makeRow(overrides: Partial<ReasonCodeRow> = {}): ReasonCodeRow {
  return {
    id: 'rc-1',
    code: 'LOST',
    label: 'Mất mát',
    reason_group: 'DISPOSAL',
    is_freetext: false,
    status: 'ACTIVE',
    version: 1,
    created_at: '2026-09-30T00:00:00Z',
    updated_at: '2026-09-30T00:00:00Z',
    created_by: null,
    updated_by: null,
    ...overrides,
  };
}

function buildService(current?: ReasonCodeRow | null) {
  const findById = jest.fn(() => Promise.resolve(current ?? null));
  const createViaRpc = jest.fn<Promise<ReasonCodeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow()),
  );
  const updateViaRpc = jest.fn<Promise<ReasonCodeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ label: 'Đổi tên' })),
  );
  const deactivateViaRpc = jest.fn<Promise<ReasonCodeRow>, [RpcArgs]>(() =>
    Promise.resolve(makeRow({ status: 'INACTIVE', version: 2 })),
  );
  const list = jest.fn();

  const repo = {
    findById,
    createViaRpc,
    updateViaRpc,
    deactivateViaRpc,
    list,
  } as unknown as ReasonCodeRepository;

  return {
    service: new ReasonCodesService(repo),
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

describe('ReasonCodesService.create', () => {
  it('chuẩn hoá mã (in hoa, bỏ khoảng trắng) + truyền nhóm cho rpc', async () => {
    const { service, createViaRpc } = buildService();
    await service.create(
      { reasonGroup: 'DISPOSAL', code: '  lost ', label: 'Mất mát' },
      req,
    );
    expect(createViaRpc.mock.calls[0][0].p_code).toBe('LOST');
    expect(createViaRpc.mock.calls[0][0].p_reason_group).toBe('DISPOSAL');
  });
});

describe('ReasonCodesService.update', () => {
  it('không tìm thấy → NOT_FOUND, không gọi rpc sửa', async () => {
    const { service, updateViaRpc } = buildService(null);
    await expect(
      service.update('rc-x', { label: 'X', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(updateViaRpc).not.toHaveBeenCalled();
  });

  it('⚠️ EX.3: sửa mục hệ thống "Khác" (is_freetext) → SYSTEM_REASON_PROTECTED', async () => {
    const { service, updateViaRpc } = buildService(
      makeRow({ is_freetext: true, code: 'OTHER', label: 'Khác' }),
    );
    await expect(
      service.update('rc-1', { label: 'X', version: 1 }, req),
    ).rejects.toMatchObject({ code: ErrorCode.SYSTEM_REASON_PROTECTED });
    expect(updateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền đúng version cho khoá lạc quan', async () => {
    const { service, updateViaRpc } = buildService(makeRow());
    await service.update('rc-1', { label: 'Đổi tên', version: 4 }, req);
    expect(updateViaRpc.mock.calls[0][0].p_expected_version).toBe(4);
  });
});

describe('ReasonCodesService.deactivate', () => {
  it('không tìm thấy → NOT_FOUND, không gọi rpc ngừng', async () => {
    const { service, deactivateViaRpc } = buildService(null);
    await expect(
      service.deactivate('rc-x', { reasonCodeId: 'reason-1', version: 1 }, req),
    ).rejects.toBeInstanceOf(AppException);
    expect(deactivateViaRpc).not.toHaveBeenCalled();
  });

  it('⚠️ EX.3: ngừng mục hệ thống "Khác" (is_freetext) → SYSTEM_REASON_PROTECTED', async () => {
    const { service, deactivateViaRpc } = buildService(
      makeRow({ is_freetext: true, code: 'OTHER', label: 'Khác' }),
    );
    await expect(
      service.deactivate('rc-1', { reasonCodeId: 'reason-1', version: 1 }, req),
    ).rejects.toMatchObject({ code: ErrorCode.SYSTEM_REASON_PROTECTED });
    expect(deactivateViaRpc).not.toHaveBeenCalled();
  });

  it('⚠️ EX.1: chọn chính lý do đang ngừng làm lý do ngừng → VALIDATION_FAILED', async () => {
    const { service, deactivateViaRpc } = buildService(makeRow());
    await expect(
      service.deactivate('rc-1', { reasonCodeId: 'rc-1', version: 1 }, req),
    ).rejects.toMatchObject({ code: ErrorCode.VALIDATION_FAILED });
    expect(deactivateViaRpc).not.toHaveBeenCalled();
  });

  it('truyền lý do, ô ghi thêm, version và diff trạng thái cho rpc ngừng', async () => {
    const { service, deactivateViaRpc } = buildService(makeRow());
    await service.deactivate(
      'rc-1',
      { reasonCodeId: 'reason-1', note: 'Không dùng nữa', version: 5 },
      req,
    );
    const args = deactivateViaRpc.mock.calls[0][0];
    expect(args.p_reason_code_id).toBe('reason-1');
    expect(args.p_note).toBe('Không dùng nữa');
    expect(args.p_expected_version).toBe(5);
    expect(args.p_changes).toMatchObject({
      status: { from: 'ACTIVE', to: 'INACTIVE' },
    });
  });
});
