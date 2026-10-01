import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

export class ChangeEmployeeEmailDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  @MaxLength(320, { message: ErrorCode.VALIDATION_FAILED })
  email!: string;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString({ message: ErrorCode.VALIDATION_FAILED })
  @MaxLength(500, { message: ErrorCode.VALIDATION_FAILED })
  reasonNote?: string;

  @IsInt({ message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  @Min(1, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  profileVersion!: number;
}
