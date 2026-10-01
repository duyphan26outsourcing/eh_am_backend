import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { ErrorCode } from '@/common/i18n/error-code.const';

export const ASSET_LIFECYCLE_STATUSES = [
  'IN_STORAGE',
  'IN_USE',
  'UNDER_REPAIR',
  'PENDING_DISPOSAL',
  'DISPOSED',
  'CANCELLED',
] as const;

export const ASSET_PHYSICAL_CONDITIONS = [
  'GOOD',
  'NEEDS_REPAIR',
  'BROKEN',
] as const;

/**
 * Query cho `GET /v1/assets` (UC-AST-07).
 *
 * ⚠️ Từ khoá chỉ cắt khoảng trắng ở đây; việc bỏ `% _ , ( )` (sanitizeSearchTerm) do service làm
 * ngay trước truy vấn — một chỗ chịu trách nhiệm, test được. Phạm vi location KHÔNG nhận từ client
 * (chỉ có bộ lọc `locationId` để giao với phạm vi; biên thực thi ở service + RPC).
 */
export class ListAssetsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : (value as unknown),
  )
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  assetTypeId?: string;

  @IsOptional()
  @IsIn(ASSET_LIFECYCLE_STATUSES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  status?: (typeof ASSET_LIFECYCLE_STATUSES)[number];

  @IsOptional()
  @IsIn(ASSET_PHYSICAL_CONDITIONS, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  physicalCondition?: (typeof ASSET_PHYSICAL_CONDITIONS)[number];

  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  locationId?: string;
}
