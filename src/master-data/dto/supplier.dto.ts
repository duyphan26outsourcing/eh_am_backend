import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  normalizeOptionalText,
  normalizeSupplierEmail,
  normalizeSupplierPhone,
  normalizeSupplierTaxId,
} from '../supplier-normalization';

const TAX_ID_PATTERN = /^\d{10}(?:-\d{3})?$/;
const PHONE_PATTERN = /^0\d{9}$/;

function transformString(
  value: unknown,
  normalizer: (input: string) => string | null,
): unknown {
  return typeof value === 'string' ? normalizer(value) : value;
}

class SupplierFieldsDto {
  @Transform(({ value }) =>
    transformString(value as unknown, (input) => input.trim()),
  )
  @IsString()
  @Length(1, 200)
  name!: string;

  @Transform(({ value }) =>
    transformString(value as unknown, normalizeSupplierTaxId),
  )
  @IsOptional()
  @Matches(TAX_ID_PATTERN)
  taxId?: string | null;

  @Transform(({ value }) =>
    transformString(value as unknown, normalizeOptionalText),
  )
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string | null;

  @Transform(({ value }) =>
    transformString(value as unknown, normalizeSupplierPhone),
  )
  @IsOptional()
  @Matches(PHONE_PATTERN)
  contactPhone?: string | null;

  @Transform(({ value }) =>
    transformString(value as unknown, normalizeSupplierEmail),
  )
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  contactEmail?: string | null;
}

export class CreateSupplierDto extends SupplierFieldsDto {}

export class UpdateSupplierDto extends SupplierFieldsDto {
  @IsInt()
  @Min(1)
  version!: number;
}

export class DeactivateSupplierDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsInt()
  @Min(1)
  version!: number;
}
