import {
  IsBoolean,
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

/** Cờ phân loại (UC-MDM-04): TSCĐ hay CCDC. Nhãn map i18n, không show mã thô. */
export const ASSET_KINDS = ['FIXED_ASSET', 'TOOL'] as const;

// Mã: 2-20 ký tự, chữ/số/gạch, ký tự đầu là chữ hoặc số (UC-MDM-04 Giả định 7). Backend chuẩn hoá
// in hoa + bỏ khoảng trắng hai đầu trước khi kiểm trùng (BR-MDM-01, BR-MDM-14).
const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

/** Tạo NHÓM (cấp 1): chỉ mã + tên. */
export class CreateAssetTypeGroupDto {
  @IsString()
  @Length(2, 20)
  @Matches(CODE_PATTERN)
  code!: string;

  @IsString()
  @Length(1, 150)
  name!: string;
}

/** Tạo LOẠI (cấp 2) dưới một nhóm. */
export class CreateAssetTypeDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  parentId!: string;

  @IsString()
  @Length(2, 20)
  @Matches(CODE_PATTERN)
  code!: string;

  @IsString()
  @Length(1, 150)
  name!: string;

  // TSCĐ (FIXED_ASSET) hay CCDC (TOOL) — bắt buộc với loại (UC-MDM-04 EX.1).
  @IsIn(ASSET_KINDS)
  assetKind!: string;

  @IsOptional()
  @IsBoolean()
  serialRequired?: boolean;

  // Thời gian sử dụng tham khảo — số nguyên dương nếu có (UC-MDM-04 EX.1).
  @IsOptional()
  @IsInt()
  @Min(1)
  usefulLifeMonths?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  fastGroupCode?: string;
}

/** Sửa NHÓM: chỉ tên (mã không đổi — BR-MDM-17). */
export class UpdateAssetTypeGroupDto {
  @IsString()
  @Length(1, 150)
  name!: string;

  @IsInt()
  @Min(1)
  version!: number;
}

/** Sửa LOẠI: tên + cờ + serial + thời gian + mã FAST (mã + nhóm cha không đổi — BR-MDM-17). */
export class UpdateAssetTypeDto {
  @IsString()
  @Length(1, 150)
  name!: string;

  @IsIn(ASSET_KINDS)
  assetKind!: string;

  @IsOptional()
  @IsBoolean()
  serialRequired?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  usefulLifeMonths?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  fastGroupCode?: string;

  @IsInt()
  @Min(1)
  version!: number;
}

/** Ngừng nhóm hoặc loại (UC-MDM-04.AC.3): lý do từ nhóm CATALOG_DEACTIVATE. */
export class DeactivateAssetTypeDto {
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
