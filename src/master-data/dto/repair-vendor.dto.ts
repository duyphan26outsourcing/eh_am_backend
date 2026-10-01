import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEmail,
  IsIn,
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
  normalizeRepairVendorEmail,
  normalizeRepairVendorPhone,
  normalizeRepairVendorText,
  normalizeServiceTypes,
  REPAIR_VENDOR_SERVICE_TYPES,
} from '../repair-vendor-normalization';

const transform = (
  value: unknown,
  normalizer: (input: string) => string | null,
) => (typeof value === 'string' ? normalizer(value) : value);

const transformName = (value: unknown): unknown =>
  typeof value === 'string' ? value.trim() : value;

const transformServices = (value: unknown): unknown =>
  Array.isArray(value) ? normalizeServiceTypes(value as string[]) : value;

class RepairVendorFieldsDto {
  @Transform(({ value }) => transformName(value as unknown))
  @IsString()
  @Length(1, 200)
  name!: string;

  @Transform(({ value }) => transformServices(value as unknown))
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsIn(REPAIR_VENDOR_SERVICE_TYPES, { each: true })
  serviceTypes!: string[];

  @Transform(({ value }) => transform(value, normalizeRepairVendorText))
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName?: string | null;

  @Transform(({ value }) => transform(value, normalizeRepairVendorPhone))
  @IsOptional()
  @Matches(/^0\d{9}$/)
  contactPhone?: string | null;

  @Transform(({ value }) => transform(value, normalizeRepairVendorEmail))
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  contactEmail?: string | null;
}

export class CreateRepairVendorDto extends RepairVendorFieldsDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  externalLocationId!: string;
}

export class UpdateRepairVendorDto extends RepairVendorFieldsDto {
  @IsInt()
  @Min(1)
  version!: number;
}

export class DeactivateRepairVendorDto {
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
