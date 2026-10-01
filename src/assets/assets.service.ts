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
  type AssetListItemModel,
  type CreatedAssetModel,
  toAssetListItemModel,
  toCreatedAssetModel,
} from './asset.model';
import { type CreateAssetDto } from './dto/create-asset.dto';
import { type ListAssetsQueryDto } from './dto/list-assets.dto';
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
}
