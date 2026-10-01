import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  ContextType,
  findRole,
  PLATFORM_CONTEXT_ID,
  Role,
} from '@/utils/enums/role.enum';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function resolveGrantRoleInput(input: {
  roleCode: string;
  contextIds: string[];
  effectiveFrom: string;
  effectiveTo?: string;
}) {
  const role = findRole(input.roleCode);
  if (!role?.assignable || role.code === Role.SYSTEM_ADMIN) {
    throw new AppException(ErrorCode.ROLE_NOT_ASSIGNABLE);
  }
  const contextIds =
    role.contextType === ContextType.PLATFORM
      ? [PLATFORM_CONTEXT_ID]
      : // ⚠️ Sort sau khi bỏ trùng: để replay idempotency không phụ thuộc thứ tự người dùng
        // chọn location (receipt so khớp mảng context_ids theo đúng thứ tự).
        [...new Set(input.contextIds)].sort();
  if (role.contextType === ContextType.LOCATION && contextIds.length === 0) {
    throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
  }
  if (role.code === Role.LOCATION_STAFF && contextIds.length !== 1) {
    throw new AppException(ErrorCode.VALIDATION_FAILED);
  }
  if (!DATE_ONLY.test(input.effectiveFrom)) {
    throw new AppException(ErrorCode.VALIDATION_FAILED);
  }
  if (input.effectiveTo && !DATE_ONLY.test(input.effectiveTo)) {
    throw new AppException(ErrorCode.VALIDATION_FAILED);
  }
  const effectiveFrom = `${input.effectiveFrom}T00:00:00.000+07:00`;
  const effectiveTo = input.effectiveTo
    ? `${input.effectiveTo}T23:59:59.999+07:00`
    : null;
  if (effectiveTo && new Date(effectiveTo) < new Date(effectiveFrom)) {
    throw new AppException(ErrorCode.VALIDATION_FAILED);
  }
  return { role, contextIds, effectiveFrom, effectiveTo };
}

export function roleAssignmentStatus(
  row: {
    effective_from: string;
    effective_to: string | null;
    revoked_by: string | null;
  },
  now = new Date(),
): 'UPCOMING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED' {
  if (row.revoked_by) return 'REVOKED';
  if (new Date(row.effective_from) > now) return 'UPCOMING';
  // ⚠️ `<=` khớp DB và access-scope.service (dùng `effective_to.gt.now`): tại đúng mốc kết thúc
  // dòng đã hết hiệu lực, không còn ACTIVE.
  if (row.effective_to && new Date(row.effective_to) <= now) return 'EXPIRED';
  return 'ACTIVE';
}
