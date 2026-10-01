import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

const blankToUndefined = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') return value;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

export class RequestAssetCancellationDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  @Transform(blankToUndefined)
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonNote?: string;
}
