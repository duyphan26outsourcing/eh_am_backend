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
import {
  type AssetDetailRow,
  type AssetDirectoryRow,
  type AssetTimelineRow,
  type CreatedAssetRow,
  type UpdatedAssetDescriptionRow,
  type AssetResponsibilityContextRow,
  type ChangedAssetResponsibleRow,
  type ChangedAssetLifecycleRow,
  type RequestedCancellationRow,
  type DecidedCancellationRow,
  type CancellationQueueItemModel,
  toCancellationQueueItemModel,
  type AssetDocumentRow,
  type AssetDocumentModel,
  toAssetDocumentModel,
  type AttachedDocumentRow,
} from './asset.model';

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

export interface UpdateAssetDescriptionArgs {
  p_command_key: string;
  p_asset_id: string;
  p_name: string;
  p_asset_type_id: string;
  p_serial: string | null;
  p_note: string | null;
  p_expected_version: number;
  p_reason_code_id: string | null;
  p_reason_note: string | null;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface ChangeAssetResponsibleArgs {
  p_command_key: string;
  p_asset_id: string;
  p_responsible_user_id: string;
  p_expected_version: number;
  p_reason_code_id: string;
  p_reason_note: string | null;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface SetAssetLifecycleArgs {
  p_command_key: string;
  p_asset_id: string;
  p_target_status: string;
  p_expected_version: number;
  p_reason_code_id: string;
  p_reason_note: string | null;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface RequestCancellationArgs {
  p_command_key: string;
  p_asset_id: string;
  p_reason_code_id: string;
  p_reason_note: string | null;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface AttachDocumentArgs {
  p_asset_id: string;
  p_doc_type: string;
  p_file_name: string;
  p_storage_path: string;
  p_content_type: string;
  p_size_bytes: number;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface DecideCancellationArgs {
  p_command_key: string;
  p_cancellation_id: string;
  p_decision: string;
  p_reason_code_id: string | null;
  p_reason_note: string | null;
  p_expected_version: number;
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
    const [assetTypes, locations, suppliers, responsibles, profileEditReasons] =
      await Promise.all([
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
        this.db
          .from(SupabaseTable.REASON_CODES)
          .select('id,code,label,is_freetext')
          .eq('status', 'ACTIVE')
          .eq('reason_group', 'PROFILE_EDIT')
          .order('code'),
      ]);
    for (const result of [
      assetTypes,
      locations,
      suppliers,
      responsibles,
      profileEditReasons,
    ]) {
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
      profileEditReasons: (profileEditReasons.data ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        label: row.label,
        isFreetext: row.is_freetext,
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

  async updateDescriptionViaRpc(
    args: UpdateAssetDescriptionArgs,
  ): Promise<UpdatedAssetDescriptionRow> {
    const { data, error } = await this.db.rpc(
      'update_asset_description',
      args as Database['public']['Functions']['update_asset_description']['Args'],
    );
    if (error) this.handleUpdateDescriptionRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as UpdatedAssetDescriptionRow;
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

  async findDetailInScope(
    assetId: string,
    locationIds: string[] | null,
  ): Promise<AssetDetailRow | null> {
    let query = this.db
      .from(SupabaseTable.ASSETS)
      .select(
        'id,asset_code,name,asset_type_id,serial,note,purchase_date,supplier_id,invoice_no,primary_location_id,cost_center_id,responsible_user_id,lifecycle_status,physical_condition,profile_version,created_at,updated_at,asset_type:asset_types!assets_asset_type_id_fkey(id,code,name,asset_kind),location:locations!assets_primary_location_id_fkey(id,code,name,type),cost_center:cost_centers!assets_cost_center_id_fkey(id,code,name),responsible:user_profiles!assets_responsible_user_id_fkey(id,display_name,employee_code),supplier:suppliers!assets_supplier_id_fkey(id,name)',
      )
      .eq('id', assetId);
    if (locationIds !== null) {
      query = query.in('primary_location_id', locationIds);
    }
    const result = await query.maybeSingle();
    return this.maybe(result);
  }

  async listTimeline(assetId: string): Promise<AssetTimelineRow[]> {
    const result = await this.db
      .from(SupabaseTable.AUDIT_EVENTS)
      .select('id,event_code,actor_label,created_at,reason,changes')
      .eq('subject_type', 'Asset')
      .eq('subject_id', assetId)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    return this.many(result);
  }

  // Gom UUID khóa ngoại trong audit changes của timeline rồi tra tên hiển thị theo lô (UC-AST-08):
  // trả map { uuid: tên }. UUID toàn cục duy nhất nên gộp chung một map được.
  async resolveAuditReferenceNames(
    timeline: readonly AssetTimelineRow[],
  ): Promise<Record<string, string>> {
    const assetTypeIds = new Set<string>();
    const locationIds = new Set<string>();
    const costCenterIds = new Set<string>();
    const userIds = new Set<string>();
    const supplierIds = new Set<string>();
    const fieldSets: Record<string, Set<string>> = {
      asset_type_id: assetTypeIds,
      primary_location_id: locationIds,
      cost_center_id: costCenterIds,
      responsible_user_id: userIds,
      supplier_id: supplierIds,
    };
    const add = (set: Set<string>, value: unknown) => {
      if (typeof value === 'string' && value.length > 0) set.add(value);
    };
    for (const event of timeline) {
      const changes = event.changes;
      if (!changes || typeof changes !== 'object') continue;
      for (const [key, child] of Object.entries(
        changes as Record<string, unknown>,
      )) {
        const set = fieldSets[key];
        if (!set) continue;
        if (child && typeof child === 'object' && !Array.isArray(child)) {
          const record = child as Record<string, unknown>;
          add(set, record.before);
          add(set, record.after);
        } else {
          add(set, child);
        }
      }
    }
    const names: Record<string, string> = {};
    const [types, locations, costCenters, users, suppliers] = await Promise.all(
      [
        assetTypeIds.size
          ? this.db
              .from(SupabaseTable.ASSET_TYPES)
              .select('id,name')
              .in('id', [...assetTypeIds])
          : null,
        locationIds.size
          ? this.db
              .from(SupabaseTable.LOCATIONS)
              .select('id,name')
              .in('id', [...locationIds])
          : null,
        costCenterIds.size
          ? this.db
              .from(SupabaseTable.COST_CENTERS)
              .select('id,name')
              .in('id', [...costCenterIds])
          : null,
        userIds.size
          ? this.db
              .from(SupabaseTable.USER_PROFILES)
              .select('id,display_name')
              .in('id', [...userIds])
          : null,
        supplierIds.size
          ? this.db
              .from(SupabaseTable.SUPPLIERS)
              .select('id,name')
              .in('id', [...supplierIds])
          : null,
      ],
    );
    for (const result of [types, locations, costCenters, suppliers]) {
      if (!result) continue;
      if (result.error) mapSupabasePostgrestError(result.error);
      for (const item of result.data ?? []) names[item.id] = item.name;
    }
    if (users) {
      if (users.error) mapSupabasePostgrestError(users.error);
      for (const item of users.data ?? []) names[item.id] = item.display_name;
    }
    return names;
  }

  async findResponsibilityContext(
    assetId: string,
  ): Promise<AssetResponsibilityContextRow | null> {
    const result = await this.db
      .from(SupabaseTable.ASSETS)
      .select(
        'id,asset_code,primary_location_id,responsible_user_id,lifecycle_status,profile_version,location:locations!assets_primary_location_id_fkey(type)',
      )
      .eq('id', assetId)
      .maybeSingle();
    const row = this.maybe(result) as
      | (Omit<AssetResponsibilityContextRow, 'location_type'> & {
          location: { type: string } | null;
        })
      | null;
    return row ? { ...row, location_type: row.location?.type ?? '' } : null;
  }

  async listResponsibilityOptions(locationId: string) {
    const now = new Date().toISOString();
    const [locationAssignments, platformAssignments, reasons] =
      await Promise.all([
        this.db
          .from(SupabaseTable.CONTEXT_ROLE_ASSIGNMENTS)
          .select('subject_id')
          .eq('subject_type', 'USER')
          .eq('context_type', 'LOCATION')
          .eq('context_id', locationId)
          .in('role_code', ['LOCATION_MANAGER', 'LOCATION_STAFF'])
          .lte('effective_from', now)
          .or(`effective_to.is.null,effective_to.gt."${now}"`),
        this.db
          .from(SupabaseTable.CONTEXT_ROLE_ASSIGNMENTS)
          .select('subject_id')
          .eq('subject_type', 'USER')
          .eq('context_type', 'PLATFORM')
          .eq('role_code', 'ASSET_MANAGER')
          .lte('effective_from', now)
          .or(`effective_to.is.null,effective_to.gt."${now}"`),
        this.db
          .from(SupabaseTable.REASON_CODES)
          .select('id,code,label,is_freetext')
          .eq('status', 'ACTIVE')
          .eq('reason_group', 'PROFILE_EDIT')
          .order('code'),
      ]);
    for (const result of [locationAssignments, platformAssignments, reasons]) {
      if (result.error) mapSupabasePostgrestError(result.error);
    }
    const ids = [
      ...new Set(
        [
          ...(locationAssignments.data ?? []),
          ...(platformAssignments.data ?? []),
        ].map((row) => row.subject_id),
      ),
    ];
    // ⚠️ Nhánh rỗng trả `null` (không phải `{ data: [], error: null }`): literal đó làm union của
    // ternary rộng thành `any`, nuốt kiểu dòng và bật loạt lỗi no-unsafe-*. Dùng `null` giữ nguyên
    // kiểu dòng Supabase suy ra từ `.select(...)`.
    const people = ids.length
      ? await this.db
          .from(SupabaseTable.USER_PROFILES)
          .select('id,display_name,employee_code')
          .eq('status', 'ACTIVE')
          .in('id', ids)
          .order('display_name')
      : null;
    if (people?.error) mapSupabasePostgrestError(people.error);
    return {
      candidates: (people?.data ?? []).map((row) => ({
        id: row.id,
        displayName: row.display_name,
        employeeCode: row.employee_code,
      })),
      reasons: (reasons.data ?? []).map((row) => ({
        id: row.id,
        code: row.code,
        label: row.label,
        isFreetext: row.is_freetext,
      })),
    };
  }

  // Danh mục lý do ACTIVE của một nhóm (UC-AST-11 dùng nhóm STATUS_CHANGE). Mục 'Khác'
  // (is_freetext) để cuối để dropdown ưu tiên preset.
  async listReasonCodes(
    group: string,
  ): Promise<
    { id: string; code: string; label: string; isFreetext: boolean }[]
  > {
    const result = await this.db
      .from(SupabaseTable.REASON_CODES)
      .select('id,code,label,is_freetext')
      .eq('status', 'ACTIVE')
      .eq('reason_group', group)
      .order('is_freetext', { ascending: true })
      .order('code', { ascending: true });
    if (result.error) mapSupabasePostgrestError(result.error);
    return (result.data ?? []).map((row) => ({
      id: row.id,
      code: row.code,
      label: row.label,
      isFreetext: row.is_freetext,
    }));
  }

  async changeResponsibleViaRpc(
    args: ChangeAssetResponsibleArgs,
  ): Promise<ChangedAssetResponsibleRow> {
    const { data, error } = await this.db.rpc(
      'change_asset_responsible',
      args as Database['public']['Functions']['change_asset_responsible']['Args'],
    );
    if (error) this.handleChangeResponsibleRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as ChangedAssetResponsibleRow;
  }

  async setLifecycleViaRpc(
    args: SetAssetLifecycleArgs,
  ): Promise<ChangedAssetLifecycleRow> {
    const { data, error } = await this.db.rpc(
      'set_asset_lifecycle_status',
      args as Database['public']['Functions']['set_asset_lifecycle_status']['Args'],
    );
    if (error) this.handleLifecycleRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as ChangedAssetLifecycleRow;
  }

  async requestCancellationViaRpc(
    args: RequestCancellationArgs,
  ): Promise<RequestedCancellationRow> {
    const { data, error } = await this.db.rpc(
      'request_asset_cancellation',
      args as Database['public']['Functions']['request_asset_cancellation']['Args'],
    );
    if (error) this.handleRequestCancellationRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as RequestedCancellationRow;
  }

  async decideCancellationViaRpc(
    args: DecideCancellationArgs,
  ): Promise<DecidedCancellationRow> {
    const { data, error } = await this.db.rpc(
      'decide_asset_cancellation',
      args as Database['public']['Functions']['decide_asset_cancellation']['Args'],
    );
    if (error) this.handleDecideCancellationRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as DecidedCancellationRow;
  }

  // Hàng đợi duyệt (hộp việc GĐ1): lấy trang đề nghị theo trạng thái, resolve tên theo lô (không
  // dùng embedded join để khỏi vướng kiểu hand-written). Mapper không phơi UUID/cột nội bộ.
  async listCancellations(params: {
    status: string;
    page: number;
    pageSize: number;
  }): Promise<PaginatedResult<CancellationQueueItemModel>> {
    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const result = await this.db
      .from(SupabaseTable.ASSET_CANCELLATION_REQUESTS)
      .select(
        'id,asset_id,status,request_reason_code_id,request_reason_note,requested_by,requested_at,version',
        { count: 'exact' },
      )
      .eq('status', params.status)
      .order('requested_at', { ascending: true })
      .range(from, to);
    if (result.error) mapSupabasePostgrestError(result.error);
    const rows = result.data ?? [];

    const assetIds = [...new Set(rows.map((row) => row.asset_id))];
    const userIds = [...new Set(rows.map((row) => row.requested_by))];
    const reasonIds = [
      ...new Set(rows.map((row) => row.request_reason_code_id)),
    ];
    const [assetsRes, usersRes, reasonsRes] = await Promise.all([
      assetIds.length
        ? this.db
            .from(SupabaseTable.ASSETS)
            .select('id,asset_code,name,primary_location_id')
            .in('id', assetIds)
        : null,
      userIds.length
        ? this.db
            .from(SupabaseTable.USER_PROFILES)
            .select('id,display_name')
            .in('id', userIds)
        : null,
      reasonIds.length
        ? this.db
            .from(SupabaseTable.REASON_CODES)
            .select('id,label')
            .in('id', reasonIds)
        : null,
    ]);
    const assetMap = new Map<
      string,
      { asset_code: string; name: string; primary_location_id: string }
    >();
    if (assetsRes) {
      if (assetsRes.error) mapSupabasePostgrestError(assetsRes.error);
      for (const item of assetsRes.data ?? [])
        assetMap.set(item.id, {
          asset_code: item.asset_code,
          name: item.name,
          primary_location_id: item.primary_location_id,
        });
    }
    const locationIds = [
      ...new Set([...assetMap.values()].map((a) => a.primary_location_id)),
    ];
    const locationsRes = locationIds.length
      ? await this.db
          .from(SupabaseTable.LOCATIONS)
          .select('id,name')
          .in('id', locationIds)
      : null;
    const locationMap = new Map<string, string>();
    if (locationsRes) {
      if (locationsRes.error) mapSupabasePostgrestError(locationsRes.error);
      for (const item of locationsRes.data ?? [])
        locationMap.set(item.id, item.name);
    }
    const userMap = new Map<string, string>();
    if (usersRes) {
      if (usersRes.error) mapSupabasePostgrestError(usersRes.error);
      for (const item of usersRes.data ?? [])
        userMap.set(item.id, item.display_name);
    }
    const reasonMap = new Map<string, string>();
    if (reasonsRes) {
      if (reasonsRes.error) mapSupabasePostgrestError(reasonsRes.error);
      for (const item of reasonsRes.data ?? [])
        reasonMap.set(item.id, item.label);
    }

    const items = rows.map((row) => {
      const asset = assetMap.get(row.asset_id);
      return toCancellationQueueItemModel(row, {
        assetCode: asset?.asset_code ?? null,
        assetName: asset?.name ?? null,
        locationName: asset
          ? (locationMap.get(asset.primary_location_id) ?? null)
          : null,
        requestedByName: userMap.get(row.requested_by) ?? null,
        reasonLabel: reasonMap.get(row.request_reason_code_id) ?? null,
      });
    });
    return paginated(items, result.count, params.page, params.pageSize);
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

  private handleUpdateDescriptionRpcError(message: string): never {
    if (message.includes('ASSET_NOT_FOUND')) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    if (message.includes('ASSET_READ_ONLY')) {
      throw new AppException(ErrorCode.ASSET_READ_ONLY);
    }
    if (message.includes('RECORD_VERSION_CONFLICT')) {
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    }
    if (message.includes('NO_CHANGES')) {
      throw new AppException(ErrorCode.NO_CHANGES);
    }
    if (message.includes('DUPLICATE_RECORD')) {
      throw new AppException(ErrorCode.DUPLICATE_RECORD);
    }
    if (message.includes('ASSET_SERIAL_REQUIRED')) {
      throw new AppException(ErrorCode.ASSET_SERIAL_REQUIRED);
    }
    if (message.includes('REASON_INVALID')) {
      throw new AppException(ErrorCode.REASON_INVALID);
    }
    if (message.includes('AUDIT_WRITE_FAILED')) {
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
    if (message.includes('IDEMPOTENCY_IN_PROGRESS')) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    if (
      message.includes('ASSET_TYPE_INVALID') ||
      message.includes('ASSET_NAME_INVALID') ||
      message.includes('IDEMPOTENCY_KEY_REUSED')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  private handleChangeResponsibleRpcError(message: string): never {
    if (message.includes('ASSET_NOT_FOUND'))
      throw new AppException(ErrorCode.NOT_FOUND);
    if (message.includes('ASSET_READ_ONLY'))
      throw new AppException(ErrorCode.ASSET_READ_ONLY);
    if (message.includes('ASSET_EXTERNAL_RESPONSIBILITY_LOCKED')) {
      throw new AppException(ErrorCode.ASSET_EXTERNAL_RESPONSIBILITY_LOCKED);
    }
    if (message.includes('RECORD_VERSION_CONFLICT')) {
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    }
    if (message.includes('RESPONSIBLE_NOT_ON_LOCATION')) {
      throw new AppException(ErrorCode.RESPONSIBLE_NOT_ON_LOCATION);
    }
    if (message.includes('REASON_INVALID'))
      throw new AppException(ErrorCode.REASON_INVALID);
    if (message.includes('AUDIT_WRITE_FAILED')) {
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
    if (message.includes('IDEMPOTENCY_IN_PROGRESS')) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    if (
      message.includes('RESPONSIBLE_UNCHANGED') ||
      message.includes('IDEMPOTENCY_KEY_REUSED')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  private handleLifecycleRpcError(message: string): never {
    if (message.includes('ASSET_NOT_FOUND'))
      throw new AppException(ErrorCode.NOT_FOUND);
    if (message.includes('ASSET_READ_ONLY'))
      throw new AppException(ErrorCode.ASSET_READ_ONLY);
    if (message.includes('ASSET_STATUS_LOCKED'))
      throw new AppException(ErrorCode.ASSET_STATUS_LOCKED);
    if (message.includes('RECORD_VERSION_CONFLICT'))
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    if (message.includes('NO_CHANGES'))
      throw new AppException(ErrorCode.NO_CHANGES);
    if (message.includes('REASON_INVALID'))
      throw new AppException(ErrorCode.REASON_INVALID);
    if (message.includes('AUDIT_WRITE_FAILED'))
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    if (message.includes('IDEMPOTENCY_IN_PROGRESS'))
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    if (message.includes('IDEMPOTENCY_KEY_REUSED'))
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  private handleRequestCancellationRpcError(message: string): never {
    if (message.includes('ASSET_NOT_FOUND'))
      throw new AppException(ErrorCode.NOT_FOUND);
    if (message.includes('ASSET_READ_ONLY'))
      throw new AppException(ErrorCode.ASSET_READ_ONLY);
    if (message.includes('ASSET_STATUS_LOCKED'))
      throw new AppException(ErrorCode.ASSET_STATUS_LOCKED);
    if (message.includes('CANCELLATION_PENDING_EXISTS'))
      throw new AppException(ErrorCode.CANCELLATION_PENDING_EXISTS);
    if (message.includes('NO_APPROVER_AVAILABLE'))
      throw new AppException(ErrorCode.NO_APPROVER_AVAILABLE);
    if (message.includes('REASON_INVALID'))
      throw new AppException(ErrorCode.REASON_INVALID);
    if (message.includes('AUDIT_WRITE_FAILED'))
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    if (message.includes('IDEMPOTENCY_IN_PROGRESS'))
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    if (message.includes('IDEMPOTENCY_KEY_REUSED'))
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  async attachDocumentViaRpc(
    args: AttachDocumentArgs,
  ): Promise<AttachedDocumentRow> {
    const { data, error } = await this.db.rpc('attach_asset_document', args);
    if (error) this.handleAttachDocumentRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data;
  }

  // Danh sách chứng từ của hồ sơ (resolve tên người tải theo lô). BR-CMN-06 lọc ở service.
  async listDocuments(assetId: string): Promise<AssetDocumentModel[]> {
    const result = await this.db
      .from(SupabaseTable.ASSET_DOCUMENTS)
      .select(
        'id,asset_id,doc_type,file_name,storage_path,content_type,size_bytes,uploaded_by,uploaded_at',
      )
      .eq('asset_id', assetId)
      .order('uploaded_at', { ascending: false });
    if (result.error) mapSupabasePostgrestError(result.error);
    const rows = (result.data ?? []) as AssetDocumentRow[];
    const userIds = [...new Set(rows.map((row) => row.uploaded_by))];
    const names = new Map<string, string>();
    if (userIds.length) {
      const people = await this.db
        .from(SupabaseTable.USER_PROFILES)
        .select('id,display_name')
        .in('id', userIds);
      if (people.error) mapSupabasePostgrestError(people.error);
      for (const item of people.data ?? [])
        names.set(item.id, item.display_name);
    }
    return rows.map((row) =>
      toAssetDocumentModel(row, names.get(row.uploaded_by) ?? null),
    );
  }

  // Một chứng từ thuộc hồ sơ (để cấp signed URL) — gồm storage_path + doc_type cho kiểm BR-CMN-06.
  async findDocument(
    assetId: string,
    documentId: string,
  ): Promise<AssetDocumentRow | null> {
    const result = await this.db
      .from(SupabaseTable.ASSET_DOCUMENTS)
      .select(
        'id,asset_id,doc_type,file_name,storage_path,content_type,size_bytes,uploaded_by,uploaded_at',
      )
      .eq('id', documentId)
      .eq('asset_id', assetId)
      .maybeSingle();
    return this.maybe(result);
  }

  private handleAttachDocumentRpcError(message: string): never {
    if (message.includes('ASSET_NOT_FOUND'))
      throw new AppException(ErrorCode.NOT_FOUND);
    if (message.includes('ASSET_READ_ONLY'))
      throw new AppException(ErrorCode.ASSET_READ_ONLY);
    if (message.includes('DOCUMENT_TYPE_INVALID'))
      throw new AppException(ErrorCode.VALUE_OUT_OF_DOMAIN);
    if (message.includes('AUDIT_WRITE_FAILED'))
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  private handleDecideCancellationRpcError(message: string): never {
    if (message.includes('CANCELLATION_NOT_FOUND'))
      throw new AppException(ErrorCode.NOT_FOUND);
    if (message.includes('CANCELLATION_ALREADY_DECIDED'))
      throw new AppException(ErrorCode.CANCELLATION_ALREADY_DECIDED);
    if (message.includes('RECORD_VERSION_CONFLICT'))
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    if (message.includes('SELF_APPROVAL_FORBIDDEN'))
      throw new AppException(ErrorCode.SELF_APPROVAL_FORBIDDEN);
    if (message.includes('ASSET_NOT_FOUND'))
      throw new AppException(ErrorCode.NOT_FOUND);
    if (message.includes('ASSET_STATUS_LOCKED'))
      throw new AppException(ErrorCode.ASSET_STATUS_LOCKED);
    if (message.includes('REASON_INVALID'))
      throw new AppException(ErrorCode.REASON_INVALID);
    if (message.includes('DECISION_INVALID'))
      throw new AppException(ErrorCode.VALUE_OUT_OF_DOMAIN);
    if (message.includes('AUDIT_WRITE_FAILED'))
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    if (message.includes('IDEMPOTENCY_IN_PROGRESS'))
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    if (message.includes('IDEMPOTENCY_KEY_REUSED'))
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }
}
