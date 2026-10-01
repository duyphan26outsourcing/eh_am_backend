import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  ContextType,
  findRole,
  PLATFORM_CONTEXT_ID,
} from '@/utils/enums/role.enum';

export function normalizeEmployeeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeEmployeeCode(value?: string | null): string | null {
  const normalized = value?.trim().toUpperCase();
  return normalized || null;
}

export function normalizeEmployeePhone(value?: string | null): string | null {
  const compact = value?.trim().replace(/[\s.-]/g, '');
  if (!compact) return null;
  if (compact.startsWith('+84')) return `0${compact.slice(3)}`;
  return /^84\d{9}$/.test(compact) ? `0${compact.slice(2)}` : compact;
}

export function optionalTrim(value?: string | null): string | null {
  return value?.trim() || null;
}

export function resolveInitialRoleContext(
  roleCode: string,
  locationId: string,
) {
  const role = findRole(roleCode);
  if (!role?.assignable) {
    throw new AppException(ErrorCode.ROLE_NOT_ASSIGNABLE);
  }
  return role.contextType === ContextType.LOCATION
    ? { contextType: ContextType.LOCATION, contextId: locationId }
    : { contextType: ContextType.PLATFORM, contextId: PLATFORM_CONTEXT_ID };
}
