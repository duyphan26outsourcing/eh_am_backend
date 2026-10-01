import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  type PaginatedResult,
  paginated,
} from '@/common/interfaces/paginated-result.interface';
import { BaseRepository } from '@/common/repository/base.repository';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { type Database } from '@/supabase/database.types';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseTable } from '@/supabase/supabase.define';
import { type AssetDirectoryRow, type CreatedAssetRow } from './asset.model';

export interface ListAssetsArgs {
  locationIds: string[] | null;
  search: string | null;
  assetTypeId: string | null;
  status: string | null;
  physicalCondition: string | null;
  locationId: string | null;
  page: number;
  pageSize: number;
}

export interface CreateAssetArgs {
  p_command_key: string;
  p_name: string;
  p_asset_type_id: string;
  p_serial: string | null;
  p_note: string | null;
  p_purchase_date: string | null;
  p_supplier_id: string | null;
  p_invoice_no: string | null;
  p_primary_location_id: string;
  p_responsible_user_id: string;
  p_lifecycle_status: string;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

@Injectable()
export class AssetsRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, AssetsRepository.name);
  }

  async createOptions() {
    const [assetTypes, locations, suppliers, responsibles] = await Promise.all([
      // Chỉ LOẠI LÁ (parent_id not null) ACTIVE — nhóm không gắn được tài sản.
      this.db
        .from(SupabaseTable.ASSET_TYPES)
        .select('id,code,name,asset_kind,serial_required')
        .eq('status', 'ACTIVE')
        .not('parent_id', 'is', null)
        .order('code'),
      this.db
        .from(SupabaseTable.LOCATIONS)
        .select('id,code,name,type')
        .eq('status', 'ACTIVE')
        .neq('type', 'EXTERNAL')
        .order('code'),
      this.db
        .from(SupabaseTable.SUPPLIERS)
        .select('id,name,tax_id')
        .eq('status', 'ACTIVE')
        .order('name'),
      this.db
        .from(SupabaseTable.USER_PROFILES)
        .select('id,display_name,employee_code')
        .eq('status', 'ACTIVE')
        .order('display_name'),
    ]);
    for (const result of [assetTypes, locations, suppliers, responsibles]) {
      if (result.error) mapSupabasePostgrestError(result.error);
    }
    return {
      assetTypes: (assetTypes.data ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
        assetKind: row.asset_kind ?? '',
        serialRequired: row.serial_required,
      })),
      locations: locations.data ?? [],
      suppliers: (suppliers.data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        taxId: row.tax_id,
      })),
      responsibleCandidates: (responsibles.data ?? []).map((row) => ({
        id: row.id,
        displayName: row.display_name,
        employeeCode: row.employee_code,
      })),
    };
  }

  async createViaRpc(args: CreateAssetArgs): Promise<CreatedAssetRow> {
    const { data, error } = await this.db.rpc(
      'create_asset',
      args as Database['public']['Functions']['create_asset']['Args'],
    );
    if (error) this.handleCreateRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as CreatedAssetRow;
  }

  async listAssets(
    args: ListAssetsArgs,
  ): Promise<PaginatedResult<AssetDirectoryRow>> {
    const rpcArgs = {
      p_location_ids: args.locationIds,
      p_search: args.search,
      p_asset_type_id: args.assetTypeId,
      p_status: args.status,
      p_physical_condition: args.physicalCondition,
      p_location_id: args.locationId,
      p_limit: args.pageSize,
      p_offset: (args.page - 1) * args.pageSize,
    } as Database['public']['Functions']['list_assets']['Args'];
    const { data, error } = await this.db.rpc('list_assets', rpcArgs);
    if (error) mapSupabasePostgrestError(error);
    const rows = (data ?? []) as Array<
      AssetDirectoryRow & { total_count: number }
    >;
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    return paginated(rows, total, args.page, args.pageSize);
  }

  private handleCreateRpcError(message: string): never {
    // Serial trùng trong cùng loại (BR-AST-03) — thông điệp mang asset_code đang giữ, không chuyển
    // ra client qua params (giữ params sạch); FE chỉ cần biết trùng.
    if (message.includes('DUPLICATE_RECORD')) {
      throw new AppException(ErrorCode.DUPLICATE_RECORD);
    }
    if (message.includes('ASSET_SERIAL_REQUIRED')) {
      throw new AppException(ErrorCode.ASSET_SERIAL_REQUIRED);
    }
    if (message.includes('RESPONSIBLE_NOT_ON_LOCATION')) {
      throw new AppException(ErrorCode.RESPONSIBLE_NOT_ON_LOCATION);
    }
    if (message.includes('AUDIT_WRITE_FAILED')) {
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
    if (message.includes('IDEMPOTENCY_IN_PROGRESS')) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    // Defense-in-depth: DTO đã chặn phần lớn; các mã còn lại là dữ liệu chọn không hợp lệ.
    if (
      message.includes('ASSET_TYPE_INVALID') ||
      message.includes('ASSET_STATUS_INVALID') ||
      message.includes('ASSET_NAME_INVALID') ||
      message.includes('LOCATION_INVALID') ||
      message.includes('LOCATION_COST_CENTER_MISSING') ||
      message.includes('SUPPLIER_INVALID') ||
      message.includes('RESPONSIBLE_INVALID') ||
      message.includes('IDEMPOTENCY_KEY_REUSED')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }
}
