import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

/** Trạng thái vòng đời được phép ĐẶT khi tạo hồ sơ (BR-AST-02): chỉ Lưu kho hoặc Đang sử dụng. */
export const ASSET_INITIAL_STATUSES = ['IN_STORAGE', 'IN_USE'] as const;

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateAssetDto {
  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  assetTypeId!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  serial?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsDateString({ strict: true })
  purchaseDate?: string;

  @IsOptional()
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  supplierId?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100)
  invoiceNo?: string;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  primaryLocationId!: string;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  responsibleUserId!: string;

  @IsIn(ASSET_INITIAL_STATUSES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  initialStatus!: (typeof ASSET_INITIAL_STATUSES)[number];
}
