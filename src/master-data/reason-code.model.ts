import { type TableRow } from '@/supabase/supabase.define';
import { toIsoString } from '@/common/model/base.model';

/** Bản lý do trả ra API (camelCase). Không trả thẳng dòng database. */
export interface ReasonCodeModel {
  id: string;
  code: string;
  label: string;
  reasonGroup: string;
  isFreetext: boolean;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export function toReasonCodeModel(
  row: TableRow<'reason_codes'>,
): ReasonCodeModel {
  return {
    id: row.id,
    code: row.code,
    label: row.label,
    reasonGroup: row.reason_group,
    isFreetext: row.is_freetext,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
