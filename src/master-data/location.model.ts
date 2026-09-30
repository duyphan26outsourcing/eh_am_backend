import { type TableRow } from '@/supabase/supabase.define';
import { toIsoString } from '@/common/model/base.model';

/** Bản location trả ra API (camelCase). Không trả thẳng dòng database. */
export interface LocationModel {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string | null;
  defaultCostCenterId: string | null;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export function toLocationModel(row: TableRow<'locations'>): LocationModel {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    type: row.type,
    address: row.address,
    defaultCostCenterId: row.default_cost_center_id,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
