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

export const CANCELLATION_DECISIONS = ['APPROVE', 'REJECT'] as const;

const blankToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export class DecideAssetCancellationDto {
  @IsIn(CANCELLATION_DECISIONS, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  decision!: (typeof CANCELLATION_DECISIONS)[number];

  // Bắt buộc khi REJECT (nhóm APPROVAL_REJECT) — RPC kiểm lại; tùy chọn ở tầng DTO.
  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId?: string;

  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonNote?: string;

  // Version của ĐỀ NGHỊ (khóa lạc quan chống hai người duyệt cùng lúc).
  @IsInt()
  @Min(1)
  @Max(2_147_483_647)
  expectedVersion!: number;
}
