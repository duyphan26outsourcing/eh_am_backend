import { type TableRow } from '@/supabase/supabase.define';
import { toIsoString } from '@/common/model/base.model';

/** Bản location trả ra API (camelCase). Không trả thẳng dòng database. */
export interface LocationModel {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string | null;
  provinceCode: string | null;
  provinceName: string | null;
  wardName: string | null;
  addressDetail: string | null;
  defaultCostCenterId: string | null;
  defaultCostCenterCode: string | null;
  defaultCostCenterName: string | null;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

type LocationRow = TableRow<'locations'>;
export type LocationListRow = LocationRow & {
  default_cost_center?: { code: string; name: string } | null;
};

export function toLocationModel(row: LocationListRow): LocationModel {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    address: row.address,
    provinceCode: row.province_code,
    provinceName: row.province_name,
    wardName: row.ward_name,
    addressDetail: row.address_detail,
    defaultCostCenterId: row.default_cost_center_id,
    defaultCostCenterCode: row.default_cost_center?.code ?? null,
    defaultCostCenterName: row.default_cost_center?.name ?? null,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
