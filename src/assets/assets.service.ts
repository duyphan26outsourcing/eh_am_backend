import { Injectable } from '@nestjs/common';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import {
  AccessScopeService,
  type LocationScopeRule,
} from '@/auth/access-scope.service';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { Role } from '@/utils/enums/role.enum';
import { sanitizeSearchTerm } from '@/utils/utils';
import {
  type AssetCreateOptions,
  type AssetDetailModel,
  type AssetListItemModel,
  type CreatedAssetModel,
  type UpdatedAssetDescriptionModel,
  toAssetListItemModel,
  toAssetDetailModel,
  toCreatedAssetModel,
  toUpdatedAssetDescriptionModel,
  type ChangedAssetResponsibleModel,
  toChangedAssetResponsibleModel,
  type AssetResponsibilityContextRow,
  type ChangedAssetLifecycleModel,
  toChangedAssetLifecycleModel,
  type RequestedCancellationModel,
  toRequestedCancellationModel,
  type DecidedCancellationModel,
  toDecidedCancellationModel,
  type CancellationQueueItemModel,
} from './asset.model';
import { type CreateAssetDto } from './dto/create-asset.dto';
import { type ListAssetsQueryDto } from './dto/list-assets.dto';
import { type UpdateAssetDescriptionDto } from './dto/update-asset-description.dto';
import { type ChangeAssetResponsibleDto } from './dto/change-asset-responsible.dto';
import { type SetAssetLifecycleDto } from './dto/set-asset-lifecycle.dto';
import { type RequestAssetCancellationDto } from './dto/request-asset-cancellation.dto';
import { type DecideAssetCancellationDto } from './dto/decide-asset-cancellation.dto';
import { type ListCancellationsQueryDto } from './dto/list-cancellations.dto';
import { AssetsRepository } from './assets.repository';

/**
 * Quy tắc phạm vi của DANH SÁCH tài sản (UC-AST-07):
 *   · Quản lý tài sản / Kế toán tài sản (toàn hệ thống) → thấy mọi location.
 *   · Quản lý điểm → chỉ location được gán.
 *   · Nhân viên điểm / Kỹ thuật viên… không có vai trò ở đây → phạm vi rỗng → service trả 403 (EX.1).
 */
export const ASSET_LIST_SCOPE: LocationScopeRule = {
  platformRoles: [Role.ASSET_MANAGER, Role.ASSET_ACCOUNTANT],
  locationRoles: [Role.LOCATION_MANAGER],
};

export const ASSET_DETAIL_SCOPE: LocationScopeRule = {
  platformRoles: [
    Role.ASSET_MANAGER,
    Role.ASSET_ACCOUNTANT,
    Role.CHIEF_ACCOUNTANT,
    Role.EXECUTIVE,
    Role.AUDITOR,
  ],
  locationRoles: [Role.LOCATION_MANAGER],
};

export const ASSET_RESPONSIBILITY_SCOPE: LocationScopeRule = {
  platformRoles: [Role.ASSET_MANAGER],
  locationRoles: [Role.LOCATION_MANAGER],
};

@Injectable()
export class AssetsService {
  constructor(
    private readonly repository: AssetsRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async createOptions(): Promise<AssetCreateOptions> {
    return this.repository.createOptions();
  }

  async list(
    query: ListAssetsQueryDto,
    req: AuthRequest,
  ): Promise<PaginatedResult<AssetListItemModel>> {
    const scope = await this.accessScope.resolveLocationScope(
      req.user,
      ASSET_LIST_SCOPE,
    );
    // ⚠️ EX.1: không có vai trò nào được dùng màn hình (không platform, không location nào) → 403,
    // KHÔNG trả danh sách rỗng. Quản lý điểm luôn có ≥1 location nên phạm vi rỗng ⟺ không đủ vai trò.
    if (!scope.allLocations && scope.locationIds.length === 0) {
      throw new AppException(ErrorCode.ROLE_REQUIRED);
    }
    const page = await this.repository.listAssets({
      locationIds: scope.allLocations ? null : scope.locationIds,
      search: sanitizeSearchTerm(query.search),
      assetTypeId: query.assetTypeId ?? null,
      status: query.status ?? null,
      physicalCondition: query.physicalCondition ?? null,
      locationId: query.locationId ?? null,
      page: query.page,
      pageSize: query.pageSize,
    });
    return { ...page, items: page.items.map(toAssetListItemModel) };
  }

  async detail(assetId: string, req: AuthRequest): Promise<AssetDetailModel> {
    const scope = await this.accessScope.resolveLocationScope(
      req.user,
      ASSET_DETAIL_SCOPE,
    );
    if (!scope.allLocations && scope.locationIds.length === 0) {
      throw new AppException(ErrorCode.ROLE_REQUIRED);
    }

    const row = await this.repository.findDetailInScope(
      assetId,
      scope.allLocations ? null : scope.locationIds,
    );
    // ⚠️ Không phân biệt “không tồn tại” với “ngoài phạm vi”: phân biệt hai trường hợp sẽ tạo oracle dò tài sản.
    if (!row) throw new AppException(ErrorCode.NOT_FOUND);

    const timeline = await this.repository.listTimeline(assetId);
    const refNames = await this.repository.resolveAuditReferenceNames(timeline);
    return toAssetDetailModel(row, timeline, scope.allLocations, refNames);
  }

  async create(
    dto: CreateAssetDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<CreatedAssetModel> {
    const audit = auditContextOf(req);
    const row = await this.repository.createViaRpc({
      p_command_key: commandKey,
      p_name: dto.name,
      p_asset_type_id: dto.assetTypeId,
      p_serial: dto.serial ?? null,
      p_note: dto.note ?? null,
      p_purchase_date: dto.purchaseDate ?? null,
      p_supplier_id: dto.supplierId ?? null,
      p_invoice_no: dto.invoiceNo ?? null,
      p_primary_location_id: dto.primaryLocationId,
      p_responsible_user_id: dto.responsibleUserId,
      p_lifecycle_status: dto.initialStatus,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toCreatedAssetModel(row);
  }

  async updateDescription(
    assetId: string,
    dto: UpdateAssetDescriptionDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<UpdatedAssetDescriptionModel> {
    const audit = auditContextOf(req);
    const row = await this.repository.updateDescriptionViaRpc({
      p_command_key: commandKey,
      p_asset_id: assetId,
      p_name: dto.name,
      p_asset_type_id: dto.assetTypeId,
      p_serial: dto.serial ?? null,
      p_note: dto.note ?? null,
      p_expected_version: dto.profileVersion,
      p_reason_code_id: dto.reasonCodeId ?? null,
      p_reason_note: dto.reasonNote ?? null,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toUpdatedAssetDescriptionModel(row);
  }

  private async responsibilityContext(
    assetId: string,
    req: AuthRequest,
  ): Promise<AssetResponsibilityContextRow> {
    const scope = await this.accessScope.resolveLocationScope(
      req.user,
      ASSET_RESPONSIBILITY_SCOPE,
    );
    if (!scope.allLocations && scope.locationIds.length === 0) {
      throw new AppException(ErrorCode.ROLE_REQUIRED);
    }
    const asset = await this.repository.findResponsibilityContext(assetId);
    if (
      !asset ||
      (!scope.allLocations &&
        !scope.locationIds.includes(asset.primary_location_id))
    ) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return asset;
  }

  async responsibilityOptions(assetId: string, req: AuthRequest) {
    const asset = await this.responsibilityContext(assetId, req);
    if (asset.location_type === 'EXTERNAL') {
      throw new AppException(ErrorCode.ASSET_EXTERNAL_RESPONSIBILITY_LOCKED);
    }
    const options = await this.repository.listResponsibilityOptions(
      asset.primary_location_id,
    );
    return { currentResponsibleUserId: asset.responsible_user_id, ...options };
  }

  async lifecycleOptions(assetId: string, req: AuthRequest) {
    const asset = await this.responsibilityContext(assetId, req);
    const reasons = await this.repository.listReasonCodes('USE_STATUS_CHANGE');
    // FE suy ra trạng thái đích = trạng thái đối; chỉ IN_STORAGE/IN_USE mới hiện thao tác.
    return {
      currentStatus: asset.lifecycle_status,
      profileVersion: asset.profile_version,
      reasons,
    };
  }

  async changeResponsible(
    assetId: string,
    dto: ChangeAssetResponsibleDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<ChangedAssetResponsibleModel> {
    await this.responsibilityContext(assetId, req);
    const audit = auditContextOf(req);
    const row = await this.repository.changeResponsibleViaRpc({
      p_command_key: commandKey,
      p_asset_id: assetId,
      p_responsible_user_id: dto.responsibleUserId,
      p_expected_version: dto.profileVersion,
      p_reason_code_id: dto.reasonCodeId,
      p_reason_note: dto.reasonNote ?? null,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toChangedAssetResponsibleModel(row);
  }

  async changeLifecycle(
    assetId: string,
    dto: SetAssetLifecycleDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<ChangedAssetLifecycleModel> {
    // ⚠️ Dùng chung biên scope + 404 với đổi người chịu trách nhiệm (cùng vai trò, cùng location
    // của tài sản). KHÔNG khóa EXTERNAL như responsibilityOptions: đưa vào/ngừng sử dụng không
    // phụ thuộc location có phải nội bộ hay không.
    await this.responsibilityContext(assetId, req);
    const audit = auditContextOf(req);
    const row = await this.repository.setLifecycleViaRpc({
      p_command_key: commandKey,
      p_asset_id: assetId,
      p_target_status: dto.targetStatus,
      p_expected_version: dto.profileVersion,
      p_reason_code_id: dto.reasonCodeId,
      p_reason_note: dto.reasonNote ?? null,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toChangedAssetLifecycleModel(row);
  }

  async requestCancellation(
    assetId: string,
    dto: RequestAssetCancellationDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<RequestedCancellationModel> {
    const audit = auditContextOf(req);
    const row = await this.repository.requestCancellationViaRpc({
      p_command_key: commandKey,
      p_asset_id: assetId,
      p_reason_code_id: dto.reasonCodeId,
      p_reason_note: dto.reasonNote ?? null,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toRequestedCancellationModel(row);
  }

  async cancellationReasonOptions() {
    return { reasons: await this.repository.listReasonCodes('ASSET_CANCEL') };
  }

  async rejectReasonOptions() {
    return {
      reasons: await this.repository.listReasonCodes('APPROVAL_REJECT'),
    };
  }

  async listCancellations(
    query: ListCancellationsQueryDto,
  ): Promise<PaginatedResult<CancellationQueueItemModel>> {
    return this.repository.listCancellations({
      status: query.status ?? 'PENDING',
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async decideCancellation(
    cancellationId: string,
    dto: DecideAssetCancellationDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<DecidedCancellationModel> {
    const audit = auditContextOf(req);
    const row = await this.repository.decideCancellationViaRpc({
      p_command_key: commandKey,
      p_cancellation_id: cancellationId,
      p_decision: dto.decision,
      p_reason_code_id: dto.reasonCodeId ?? null,
      p_reason_note: dto.reasonNote ?? null,
      p_expected_version: dto.expectedVersion,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toDecidedCancellationModel(row);
  }
}
