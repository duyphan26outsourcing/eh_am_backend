import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

export const ASSET_DOCUMENT_TYPES = [
  'INVOICE',
  'PO',
  'HANDOVER',
  'WARRANTY',
  'PHOTO',
] as const;

/** [TBD-2] allowlist + dung lượng — mặc định, chờ Vận hành chốt. */
export const ALLOWED_DOCUMENT_CONTENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class RequestDocumentUploadDto {
  @IsIn(ASSET_DOCUMENT_TYPES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  docType!: (typeof ASSET_DOCUMENT_TYPES)[number];

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(150)
  contentType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;
}

export class ConfirmDocumentDto {
  @IsIn(ASSET_DOCUMENT_TYPES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  docType!: (typeof ASSET_DOCUMENT_TYPES)[number];

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  storagePath!: string;

  @Transform(trim)
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  fileName!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(150)
  contentType!: string;

  @IsInt()
  @Min(1)
  sizeBytes!: number;
}
