import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { ROLE_CATALOG } from '@/utils/enums/role.enum';
import { EMPLOYMENT_TYPES } from './create-employee.dto';

/** Trạng thái tài khoản dùng cho bộ lọc (khớp check của migration 03). */
export const ACCOUNT_STATUSES = [
  'PENDING_ACTIVATION',
  'ACTIVE',
  'SUSPENDED',
  'DEACTIVATED',
] as const;

const ROLE_CODES = ROLE_CATALOG.map((role) => role.code);

/**
 * Query cho `GET /v1/employees` (UC-IAM-15).
 *
 * ⚠️ Từ khoá KHÔNG được làm sạch ở đây — chỉ cắt khoảng trắng. Việc bỏ ký tự `% _ , ( )`
 * (EX.3) do service làm bằng `sanitizeSearchTerm` ngay trước khi vào truy vấn, để một chỗ
 * duy nhất chịu trách nhiệm và test được.
 */
export class ListEmployeesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as unknown),
  )
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  locationId?: string;

  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  departmentId?: string;

  @IsOptional()
  @IsIn(ROLE_CODES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  roleCode?: string;

  @IsOptional()
  @IsIn(ACCOUNT_STATUSES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  status?: (typeof ACCOUNT_STATUSES)[number];

  @IsOptional()
  @IsIn(EMPLOYMENT_TYPES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  employmentType?: (typeof EMPLOYMENT_TYPES)[number];
}
