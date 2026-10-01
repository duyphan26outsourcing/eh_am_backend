import { IsIn, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ErrorCode } from '@/common/i18n/error-code.const';

export const CANCELLATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
] as const;

export class ListCancellationsQueryDto extends PaginationQueryDto {
  // Mặc định PENDING: hàng đợi duyệt (hộp việc GĐ1).
  @IsOptional()
  @IsIn(CANCELLATION_STATUSES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  status?: (typeof CANCELLATION_STATUSES)[number];
}
