/** Dòng jsonb RPC `create_asset` trả về (snake_case). */
export interface CreatedAssetRow {
  id: string;
  asset_code: string;
  name: string;
  asset_type_id: string;
  serial: string | null;
  primary_location_id: string;
  cost_center_id: string;
  responsible_user_id: string;
  lifecycle_status: string;
  physical_condition: string;
  qr_token: string;
  profile_version: number;
  created_at: string;
  is_replay?: boolean;
}

/**
 * Hồ sơ tài sản vừa tạo, bản trả cho Quản lý tài sản.
 *
 * ⚠️ Mapper tường minh (chuẩn dự án): không trả thẳng dòng DB. `qr_token` được phơi để màn hình
 * chi tiết dựng mã QR in nhãn (M04); KHÔNG phơi cột nội bộ như created_by.
 */
export interface CreatedAssetModel {
  id: string;
  assetCode: string;
  name: string;
  assetTypeId: string;
  serial: string | null;
  primaryLocationId: string;
  costCenterId: string;
  responsibleUserId: string;
  lifecycleStatus: string;
  physicalCondition: string;
  qrToken: string;
  profileVersion: number;
  createdAt: string;
}

export function toCreatedAssetModel(row: CreatedAssetRow): CreatedAssetModel {
  return {
    id: row.id,
    assetCode: row.asset_code,
    name: row.name,
    assetTypeId: row.asset_type_id,
    serial: row.serial,
    primaryLocationId: row.primary_location_id,
    costCenterId: row.cost_center_id,
    responsibleUserId: row.responsible_user_id,
    lifecycleStatus: row.lifecycle_status,
    physicalCondition: row.physical_condition,
    qrToken: row.qr_token,
    profileVersion: row.profile_version,
    createdAt: row.created_at,
  };
}

export interface UpdatedAssetDescriptionRow {
  id: string;
  asset_code: string;
  name: string;
  asset_type_id: string;
  serial: string | null;
  note: string | null;
  profile_version: number;
  updated_at: string;
  is_replay?: boolean;
}

export interface AssetResponsibilityContextRow {
  id: string;
  asset_code: string;
  primary_location_id: string;
  location_type: string;
  responsible_user_id: string;
  lifecycle_status: string;
  profile_version: number;
}

export interface ChangedAssetResponsibleRow {
  id: string;
  asset_code: string;
  responsible_user_id: string;
  profile_version: number;
  updated_at: string;
  is_replay?: boolean;
}

export interface ChangedAssetResponsibleModel {
  id: string;
  assetCode: string;
  responsibleUserId: string;
  profileVersion: number;
  updatedAt: string;
}

export function toChangedAssetResponsibleModel(
  row: ChangedAssetResponsibleRow,
): ChangedAssetResponsibleModel {
  return {
    id: row.id,
    assetCode: row.asset_code,
    responsibleUserId: row.responsible_user_id,
    profileVersion: row.profile_version,
    updatedAt: row.updated_at,
  };
}

// ===== UC-AST-06: chứng từ tài sản =====

/** Dòng bảng `asset_documents`. */
export interface AssetDocumentRow {
  id: string;
  asset_id: string;
  doc_type: string;
  file_name: string;
  storage_path: string;
  content_type: string;
  size_bytes: number;
  uploaded_by: string;
  uploaded_at: string;
}

/** Bản hiển thị cho danh sách chứng từ ở chi tiết — KHÔNG phơi storage_path / signed URL. */
export interface AssetDocumentModel {
  id: string;
  docType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedByName: string | null;
  uploadedAt: string;
}

export function toAssetDocumentModel(
  row: AssetDocumentRow,
  uploadedByName: string | null,
): AssetDocumentModel {
  return {
    id: row.id,
    docType: row.doc_type,
    fileName: row.file_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    uploadedByName,
    uploadedAt: row.uploaded_at,
  };
}

/** jsonb RPC `attach_asset_document` trả về. */
export interface AttachedDocumentRow {
  id: string;
  doc_type: string;
  file_name: string;
  uploaded_at: string;
  is_replay?: boolean;
}

export interface AttachedDocumentModel {
  id: string;
  docType: string;
  fileName: string;
  uploadedAt: string;
}

export function toAttachedDocumentModel(
  row: AttachedDocumentRow,
): AttachedDocumentModel {
  return {
    id: row.id,
    docType: row.doc_type,
    fileName: row.file_name,
    uploadedAt: row.uploaded_at,
  };
}

// ===== UC-AST-09/10: huỷ hồ sơ tạo sai =====

/** jsonb RPC `request_asset_cancellation` trả về. */
export interface RequestedCancellationRow {
  id: string;
  asset_id: string;
  status: string;
  requested_at: string;
  version: number;
  is_replay?: boolean;
}

export interface RequestedCancellationModel {
  id: string;
  assetId: string;
  status: string;
  requestedAt: string;
  version: number;
}

export function toRequestedCancellationModel(
  row: RequestedCancellationRow,
): RequestedCancellationModel {
  return {
    id: row.id,
    assetId: row.asset_id,
    status: row.status,
    requestedAt: row.requested_at,
    version: row.version,
  };
}

/** jsonb RPC `decide_asset_cancellation` trả về. */
export interface DecidedCancellationRow {
  id: string;
  asset_id: string;
  status: string;
  decision: string;
  version: number;
  is_replay?: boolean;
}

export interface DecidedCancellationModel {
  id: string;
  assetId: string;
  status: string;
  decision: string;
  version: number;
}

export function toDecidedCancellationModel(
  row: DecidedCancellationRow,
): DecidedCancellationModel {
  return {
    id: row.id,
    assetId: row.asset_id,
    status: row.status,
    decision: row.decision,
    version: row.version,
  };
}

/** Dòng bảng `asset_cancellation_requests` cho hàng đợi duyệt. */
export interface CancellationRequestRow {
  id: string;
  asset_id: string;
  status: string;
  request_reason_code_id: string;
  request_reason_note: string | null;
  requested_by: string;
  requested_at: string;
  version: number;
}

export interface CancellationQueueContext {
  assetCode: string | null;
  assetName: string | null;
  locationName: string | null;
  requestedByName: string | null;
  reasonLabel: string | null;
}

export interface CancellationQueueItemModel {
  id: string;
  assetId: string;
  assetCode: string | null;
  assetName: string | null;
  locationName: string | null;
  status: string;
  requestedBy: string;
  requestedByName: string | null;
  requestedAt: string;
  reason: string | null;
  version: number;
}

// ⚠️ Ghép lý do label + ghi chú để người duyệt đọc nhanh; không phơi reason_code_id/UUID nội bộ.
export function toCancellationQueueItemModel(
  row: CancellationRequestRow,
  context: CancellationQueueContext,
): CancellationQueueItemModel {
  const reason =
    context.reasonLabel && row.request_reason_note
      ? `${context.reasonLabel}: ${row.request_reason_note}`
      : (context.reasonLabel ?? row.request_reason_note);
  return {
    id: row.id,
    assetId: row.asset_id,
    assetCode: context.assetCode,
    assetName: context.assetName,
    locationName: context.locationName,
    status: row.status,
    requestedBy: row.requested_by,
    requestedByName: context.requestedByName,
    requestedAt: row.requested_at,
    reason,
    version: row.version,
  };
}

/** Dòng jsonb RPC `set_asset_lifecycle_status` trả về (UC-AST-11). */
export interface ChangedAssetLifecycleRow {
  id: string;
  asset_code: string;
  lifecycle_status: string;
  profile_version: number;
  updated_at: string;
  is_replay?: boolean;
}

export interface ChangedAssetLifecycleModel {
  id: string;
  assetCode: string;
  lifecycleStatus: string;
  profileVersion: number;
  updatedAt: string;
}

export function toChangedAssetLifecycleModel(
  row: ChangedAssetLifecycleRow,
): ChangedAssetLifecycleModel {
  return {
    id: row.id,
    assetCode: row.asset_code,
    lifecycleStatus: row.lifecycle_status,
    profileVersion: row.profile_version,
    updatedAt: row.updated_at,
  };
}

export interface UpdatedAssetDescriptionModel {
  id: string;
  assetCode: string;
  name: string;
  assetTypeId: string;
  serial: string | null;
  note: string | null;
  profileVersion: number;
  updatedAt: string;
}

export function toUpdatedAssetDescriptionModel(
  row: UpdatedAssetDescriptionRow,
): UpdatedAssetDescriptionModel {
  return {
    id: row.id,
    assetCode: row.asset_code,
    name: row.name,
    assetTypeId: row.asset_type_id,
    serial: row.serial,
    note: row.note,
    profileVersion: row.profile_version,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// UC-AST-07: Tra cứu danh sách tài sản
// ---------------------------------------------------------------------------

/** Dòng RPC `list_assets` trả về (snake_case). */
export interface AssetDirectoryRow {
  id: string;
  asset_code: string;
  name: string;
  asset_type_id: string;
  asset_type_code: string | null;
  asset_type_name: string | null;
  asset_kind: string | null;
  serial: string | null;
  lifecycle_status: string;
  physical_condition: string;
  primary_location_id: string;
  location_code: string | null;
  location_name: string | null;
  responsible_user_id: string;
  responsible_name: string | null;
  responsible_employee_code: string | null;
  cost_center_id: string;
  created_at: string;
}

/**
 * Một dòng danh sách tài sản (UC-AST-07).
 *
 * ⚠️ Mapper theo người xem (BR-CMN-06): GĐ1 chưa có cột giá trị (nguyên giá) nên không phơi; khi
 * thêm cột tài chính phải tách mapper cho vai trò được xem. KHÔNG phơi qr_token/cột nội bộ ở danh sách.
 */
export interface AssetListItemModel {
  id: string;
  assetCode: string;
  name: string;
  serial: string | null;
  assetType: {
    id: string;
    code: string;
    name: string;
    kind: string | null;
  } | null;
  lifecycleStatus: string;
  physicalCondition: string;
  location: { id: string; code: string; name: string } | null;
  responsible: {
    id: string;
    displayName: string | null;
    employeeCode: string | null;
  };
  createdAt: string;
}

export function toAssetListItemModel(
  row: AssetDirectoryRow,
): AssetListItemModel {
  return {
    id: row.id,
    assetCode: row.asset_code,
    name: row.name,
    serial: row.serial,
    assetType: {
      id: row.asset_type_id,
      code: row.asset_type_code ?? '',
      name: row.asset_type_name ?? '',
      kind: row.asset_kind,
    },
    lifecycleStatus: row.lifecycle_status,
    physicalCondition: row.physical_condition,
    location: {
      id: row.primary_location_id,
      code: row.location_code ?? '',
      name: row.location_name ?? '',
    },
    responsible: {
      id: row.responsible_user_id,
      displayName: row.responsible_name,
      employeeCode: row.responsible_employee_code,
    },
    createdAt: row.created_at,
  };
}

export interface AssetCreateOptions {
  assetTypes: Array<{
    id: string;
    code: string;
    name: string;
    assetKind: string;
    serialRequired: boolean;
  }>;
  locations: Array<{ id: string; code: string; name: string; type: string }>;
  suppliers: Array<{ id: string; name: string; taxId: string | null }>;
  responsibleCandidates: Array<{
    id: string;
    displayName: string;
    employeeCode: string | null;
  }>;
  profileEditReasons: Array<{
    id: string;
    code: string;
    label: string;
    isFreetext: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// UC-AST-08: Xem hồ sơ chi tiết tài sản
// ---------------------------------------------------------------------------

export interface AssetDetailRow {
  id: string;
  asset_code: string;
  name: string;
  asset_type_id: string;
  serial: string | null;
  note: string | null;
  purchase_date: string | null;
  supplier_id: string | null;
  invoice_no: string | null;
  primary_location_id: string;
  cost_center_id: string;
  responsible_user_id: string;
  lifecycle_status: string;
  physical_condition: string;
  profile_version: number;
  created_at: string;
  updated_at: string;
  asset_type: {
    id: string;
    code: string;
    name: string;
    asset_kind: string | null;
  } | null;
  location: { id: string; code: string; name: string; type: string } | null;
  cost_center: { id: string; code: string; name: string } | null;
  responsible: {
    id: string;
    display_name: string;
    employee_code: string | null;
  } | null;
  supplier: { id: string; name: string } | null;
}

export interface AssetTimelineRow {
  id: number;
  event_code: string;
  actor_label: string | null;
  created_at: string;
  reason: string | null;
  changes: unknown;
}

export interface AssetDetailModel {
  id: string;
  assetCode: string;
  name: string;
  serial: string | null;
  note: string | null;
  lifecycleStatus: string;
  physicalCondition: string;
  readOnly: boolean;
  assetType: {
    id: string;
    code: string;
    name: string;
    kind: string | null;
  } | null;
  purchaseDate: string | null;
  supplier: { id: string; name: string } | null;
  location: { id: string; code: string; name: string; type: string } | null;
  costCenter: { id: string; code: string; name: string } | null;
  responsible: {
    id: string;
    displayName: string;
    employeeCode: string | null;
  } | null;
  financial: { invoiceNo: string | null } | null;
  documents: AssetDocumentModel[];
  timeline: Array<{
    id: number;
    eventCode: string;
    actor: { label: string | null };
    occurredAt: string;
    reason: string | null;
    changes: Record<string, unknown>;
  }>;
  profileVersion: number;
  createdAt: string;
  updatedAt: string;
}

const TERMINAL_ASSET_STATUSES = new Set(['DISPOSED', 'CANCELLED']);
const MONETARY_CHANGE_KEYS = new Set([
  'original_cost',
  'originalCost',
  'residual_value',
  'residualValue',
  'net_book_value',
  'netBookValue',
  'repair_cost',
  'repairCost',
  'disposal_proceeds',
  'disposalProceeds',
]);

function asChangeRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, unknown>;
}

function maskMonetaryChanges(value: unknown): Record<string, unknown> {
  const source = asChangeRecord(value);
  return Object.fromEntries(
    Object.entries(source)
      .filter(([key]) => !MONETARY_CHANGE_KEYS.has(key))
      .map(([key, child]) => [
        key,
        child && typeof child === 'object' && !Array.isArray(child)
          ? maskMonetaryChanges(child)
          : child,
      ]),
  );
}

const REFERENCE_CHANGE_KEYS = new Set([
  'asset_type_id',
  'primary_location_id',
  'cost_center_id',
  'responsible_user_id',
  'supplier_id',
]);

// ⚠️ Audit `changes` lưu khóa ngoại dạng UUID. Resolver (dựng ở service, gom tên từ DB) đổi UUID sang
// tên hiển thị để timeline UC-AST-08 không phơi UUID trần. Enum (lifecycle_status, physical_condition)
// GIỮ NGUYÊN code — frontend dịch i18n (vi/en) theo đúng cơ chế nhãn trạng thái.
function resolveReferenceChanges(
  changes: Record<string, unknown>,
  refNames: Record<string, string>,
): Record<string, unknown> {
  const resolve = (value: unknown): unknown =>
    typeof value === 'string' && refNames[value] !== undefined
      ? refNames[value]
      : value;
  return Object.fromEntries(
    Object.entries(changes).map(([key, child]) => {
      if (!REFERENCE_CHANGE_KEYS.has(key)) return [key, child];
      if (child && typeof child === 'object' && !Array.isArray(child)) {
        const record = child as Record<string, unknown>;
        return [
          key,
          {
            ...record,
            before: resolve(record.before),
            after: resolve(record.after),
          },
        ];
      }
      return [key, resolve(child)];
    }),
  );
}

export function toAssetDetailModel(
  row: AssetDetailRow,
  timeline: readonly AssetTimelineRow[],
  canViewFinancial: boolean,
  refNames: Record<string, string> = {},
  documents: AssetDocumentModel[] = [],
): AssetDetailModel {
  return {
    id: row.id,
    assetCode: row.asset_code,
    name: row.name,
    serial: row.serial,
    note: row.note,
    lifecycleStatus: row.lifecycle_status,
    physicalCondition: row.physical_condition,
    readOnly: TERMINAL_ASSET_STATUSES.has(row.lifecycle_status),
    assetType: row.asset_type
      ? {
          id: row.asset_type.id,
          code: row.asset_type.code,
          name: row.asset_type.name,
          kind: row.asset_type.asset_kind,
        }
      : null,
    purchaseDate: row.purchase_date,
    supplier: row.supplier
      ? { id: row.supplier.id, name: row.supplier.name }
      : null,
    location: row.location,
    costCenter: row.cost_center,
    responsible: row.responsible
      ? {
          id: row.responsible.id,
          displayName: row.responsible.display_name,
          employeeCode: row.responsible.employee_code,
        }
      : null,
    financial: canViewFinancial ? { invoiceNo: row.invoice_no } : null,
    documents,
    timeline: timeline.map((event) => ({
      id: event.id,
      eventCode: event.event_code,
      actor: { label: event.actor_label },
      occurredAt: event.created_at,
      reason: event.reason,
      changes: resolveReferenceChanges(
        canViewFinancial
          ? asChangeRecord(event.changes)
          : maskMonetaryChanges(event.changes),
        refNames,
      ),
    })),
    profileVersion: row.profile_version,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
