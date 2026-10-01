export function normalizeOptionalText(value?: string | null): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function normalizeSupplierTaxId(value?: string | null): string | null {
  return normalizeOptionalText(value);
}

export function normalizeSupplierPhone(value?: string | null): string | null {
  const compact = normalizeOptionalText(value)?.replace(/[\s.-]/g, '');
  if (!compact) return null;
  if (compact.startsWith('+84')) return `0${compact.slice(3)}`;
  return /^84\d{9}$/.test(compact) ? `0${compact.slice(2)}` : compact;
}

export function normalizeSupplierEmail(value?: string | null): string | null {
  return normalizeOptionalText(value)?.toLowerCase() ?? null;
}
