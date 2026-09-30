import { type TableRow } from '@/supabase/supabase.define';
import { toIsoString } from '@/common/model/base.model';

/** Bản phòng ban trả ra API (camelCase). Không trả thẳng dòng database. */
export interface DepartmentModel {
  id: string;
  code: string;
  name: string;
  managerId: string | null;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export function toDepartmentModel(
  row: TableRow<'departments'>,
): DepartmentModel {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    managerId: row.manager_id,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
