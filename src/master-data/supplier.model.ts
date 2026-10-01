import { toIsoString } from '@/common/model/base.model';

export interface SupplierRow {
  id: string;
  name: string;
  tax_id: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface SupplierModel {
  id: string;
  name: string;
  taxId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: string;
  version: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export function toSupplierModel(row: SupplierRow): SupplierModel {
  return {
    id: row.id,
    name: row.name,
    taxId: row.tax_id,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    status: row.status,
    version: row.version,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}
