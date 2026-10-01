import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

/** Hai trạng thái đổi tay được của UC-AST-11 (BR-AST-06). */
export const ASSET_TOGGLE_STATUSES = ['IN_STORAGE', 'IN_USE'] as const;

const blankToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export class SetAssetLifecycleDto {
  @IsIn(ASSET_TOGGLE_STATUSES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  targetStatus!: (typeof ASSET_TOGGLE_STATUSES)[number];

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonNote?: string;

  // ⚠️ Chặn trên int4: profile_version là integer trong Postgres; giá trị > 2^31-1 làm RPC ném
  // lỗi out-of-range → 500 thay vì 400. Khóa lạc quan hợp lệ không bao giờ tới mức này.
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  profileVersion!: number;
}
