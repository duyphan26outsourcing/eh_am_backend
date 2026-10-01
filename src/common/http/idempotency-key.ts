import { isUUID } from 'class-validator';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

export function requireIdempotencyKey(value: unknown): string {
  if (typeof value !== 'string' || !isUUID(value, '4')) {
    throw new AppException(ErrorCode.INVALID_REFERENCE_ID);
  }
  return value;
}
