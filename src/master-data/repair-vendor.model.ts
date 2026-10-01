import { toIsoString } from '@/common/model/base.model';
import { type TableRow } from '@/supabase/supabase.define';

type RepairVendorRow = TableRow<'repair_vendors'>;
export type RepairVendorListRow = RepairVendorRow & {
  external_location?: {
    code: string;
    name: string;
    status: string;
    type: string;
  } | null;
};

export interface RepairVendorModel {
  id: string;
  name: string;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  serviceTypes: string[];
  externalLocationId: string;
  externalLocationCode: string | null;
  externalLocationName: string | null;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AvailableRepairLocationModel {
  id: string;
  code: string;
  name: string;
}

export function toRepairVendorModel(
  row: RepairVendorListRow,
): RepairVendorModel {
  return {
    id: row.id,
    name: row.name,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    serviceTypes: row.service_types,
    externalLocationId: row.external_location_id,
    externalLocationCode: row.external_location?.code ?? null,
    externalLocationName: row.external_location?.name ?? null,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
