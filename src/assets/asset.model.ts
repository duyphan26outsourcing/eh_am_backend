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
}
