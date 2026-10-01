import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

const blankToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export class ChangeAssetResponsibleDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  responsibleUserId!: string;

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
