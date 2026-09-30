import { type TableRow } from '@/supabase/supabase.define';
import { toIsoString } from '@/common/model/base.model';

/**
 * Bản loại tài sản trả ra API (camelCase). Không trả thẳng dòng database.
 *
 * `parentId = null` → là NHÓM (cấp 1); có `parentId` → là LOẠI (cấp 2). `assetKind` chỉ có ở loại.
 * Frontend dựng cây từ `parentId`.
 */
export interface AssetTypeModel {
  id: string;
  parentId: string | null;
  code: string;
  name: string;
  assetKind: string | null;
  serialRequired: boolean;
  usefulLifeMonths: number | null;
  fastGroupCode: string | null;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export function toAssetTypeModel(row: TableRow<'asset_types'>): AssetTypeModel {
  return {
    id: row.id,
    parentId: row.parent_id,
    code: row.code,
    name: row.name,
    assetKind: row.asset_kind,
    serialRequired: row.serial_required,
    usefulLifeMonths: row.useful_life_months,
    fastGroupCode: row.fast_group_code,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
