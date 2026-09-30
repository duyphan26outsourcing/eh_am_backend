import { Injectable } from '@nestjs/common';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { AssetTypeRepository } from './asset-type.repository';
import {
  CreateAssetTypeDto,
  CreateAssetTypeGroupDto,
  DeactivateAssetTypeDto,
  UpdateAssetTypeDto,
  UpdateAssetTypeGroupDto,
} from './dto/asset-type.dto';
import { toAssetTypeModel, type AssetTypeModel } from './asset-type.model';

@Injectable()
export class AssetTypesService {
  constructor(private readonly repo: AssetTypeRepository) {}

  async list(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<PaginatedResult<AssetTypeModel>> {
    const result = await this.repo.list(page, pageSize, status);
    return { ...result, items: result.items.map(toAssetTypeModel) };
  }

  async createGroup(
    dto: CreateAssetTypeGroupDto,
    req: AuthRequest,
  ): Promise<AssetTypeModel> {
    const code = dto.code.trim().toUpperCase();
    const changes = diffFields(null, { code, name: dto.name }, [
      'code',
      'name',
    ]);
    const ctx = auditContextOf(req);

    const row = await this.repo.createGroupViaRpc({
      p_code: code,
      p_name: dto.name,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toAssetTypeModel(row);
  }

  async createType(
    dto: CreateAssetTypeDto,
    req: AuthRequest,
  ): Promise<AssetTypeModel> {
    const code = dto.code.trim().toUpperCase();
    const serialRequired = dto.serialRequired ?? false;
    const fastGroupCode = dto.fastGroupCode?.trim().toUpperCase() || null;
    const usefulLife = dto.usefulLifeMonths ?? null;

    const changes = diffFields(
      null,
      {
        code,
        name: dto.name,
        asset_kind: dto.assetKind,
        serial_required: serialRequired,
        useful_life_months: usefulLife,
        fast_group_code: fastGroupCode,
      },
      [
        'code',
        'name',
        'asset_kind',
        'serial_required',
        'useful_life_months',
        'fast_group_code',
      ],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.createTypeViaRpc({
      p_parent_id: dto.parentId,
      p_code: code,
      p_name: dto.name,
      p_asset_kind: dto.assetKind,
      p_serial_required: serialRequired,
      // Sentinel: 0 = không nhập (RPC đổi thành NULL) — tránh truyền null qua rpc.
      p_useful_life_months: usefulLife ?? 0,
      p_fast_group_code: fastGroupCode ?? '',
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toAssetTypeModel(row);
  }

  async updateGroup(
    id: string,
    dto: UpdateAssetTypeGroupDto,
    req: AuthRequest,
  ): Promise<AssetTypeModel> {
    const current = await this.repo.findById(id);
    if (!current || current.parent_id !== null) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    const changes = diffFields({ name: current.name }, { name: dto.name }, [
      'name',
    ]);
    const ctx = auditContextOf(req);

    const row = await this.repo.updateGroupViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_name: dto.name,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toAssetTypeModel(row);
  }

  async updateType(
    id: string,
    dto: UpdateAssetTypeDto,
    req: AuthRequest,
  ): Promise<AssetTypeModel> {
    const current = await this.repo.findById(id);
    if (!current || current.parent_id === null) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const serialRequired = dto.serialRequired ?? false;
    const fastGroupCode = dto.fastGroupCode?.trim().toUpperCase() || null;
    const usefulLife = dto.usefulLifeMonths ?? null;

    const changes = diffFields(
      {
        name: current.name,
        asset_kind: current.asset_kind,
        serial_required: current.serial_required,
        useful_life_months: current.useful_life_months,
        fast_group_code: current.fast_group_code,
      },
      {
        name: dto.name,
        asset_kind: dto.assetKind,
        serial_required: serialRequired,
        useful_life_months: usefulLife,
        fast_group_code: fastGroupCode,
      },
      [
        'name',
        'asset_kind',
        'serial_required',
        'useful_life_months',
        'fast_group_code',
      ],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.updateTypeViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_name: dto.name,
      p_asset_kind: dto.assetKind,
      p_serial_required: serialRequired,
      p_useful_life_months: usefulLife ?? 0,
      p_fast_group_code: fastGroupCode ?? '',
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toAssetTypeModel(row);
  }

  async deactivate(
    id: string,
    dto: DeactivateAssetTypeDto,
    req: AuthRequest,
  ): Promise<AssetTypeModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    const changes = diffFields(
      { status: current.status },
      { status: 'INACTIVE' },
      ['status'],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.deactivateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_reason_code_id: dto.reasonCodeId,
      p_note: dto.note ?? '',
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toAssetTypeModel(row);
  }
}
