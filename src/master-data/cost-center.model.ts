import { type TableRow } from '@/supabase/supabase.define';
import { toIsoString } from '@/common/model/base.model';

/** Bản cost center trả ra API (camelCase). Không trả thẳng dòng database. */
export interface CostCenterModel {
  id: string;
  code: string;
  name: string;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export function toCostCenterModel(
  row: TableRow<'cost_centers'>,
): CostCenterModel {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
