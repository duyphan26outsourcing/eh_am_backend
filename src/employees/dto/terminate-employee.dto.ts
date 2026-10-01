import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

export class AssetTerminationTransferDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  assetId!: string;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  newResponsibleUserId!: string;
}

export class TerminateEmployeeDto {
  @IsInt({ message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  @Min(1, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  profileVersion!: number;

  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  newManagerId?: string;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString({ message: ErrorCode.VALIDATION_FAILED })
  @MaxLength(500, { message: ErrorCode.VALIDATION_FAILED })
  reasonNote?: string;

  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @IsArray({ message: ErrorCode.VALIDATION_FAILED })
  @ArrayMaxSize(500, { message: ErrorCode.VALIDATION_FAILED })
  @ValidateNested({ each: true })
  @Type(() => AssetTerminationTransferDto)
  assetTransfers!: AssetTerminationTransferDto[];
}
