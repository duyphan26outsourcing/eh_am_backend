export const REPAIR_VENDOR_SERVICE_TYPES = ['REPAIR', 'WARRANTY'] as const;
export type RepairVendorServiceType =
  (typeof REPAIR_VENDOR_SERVICE_TYPES)[number];

export function normalizeRepairVendorPhone(
  value?: string | null,
): string | null {
  const compact = value?.trim().replace(/[\s.-]/g, '');
  if (!compact) return null;
  if (compact.startsWith('+84')) return `0${compact.slice(3)}`;
  return /^84\d{9}$/.test(compact) ? `0${compact.slice(2)}` : compact;
}

export function normalizeRepairVendorEmail(
  value?: string | null,
): string | null {
  return value?.trim().toLowerCase() || null;
}

export function normalizeRepairVendorText(
  value?: string | null,
): string | null {
  return value?.trim() || null;
}

export function normalizeServiceTypes(
  values: readonly string[],
): RepairVendorServiceType[] {
  const selected = new Set(values);
  return REPAIR_VENDOR_SERVICE_TYPES.filter((type) => selected.has(type));
}
