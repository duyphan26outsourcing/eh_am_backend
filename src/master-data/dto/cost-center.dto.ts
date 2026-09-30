import {
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

export class CreateCostCenterDto {
  // Mã: 2-20 ký tự, chữ/số/gạch, ký tự đầu là chữ hoặc số (UC-MDM-03 Giả định 5).
  // Backend chuẩn hoá in hoa + bỏ khoảng trắng hai đầu trước khi kiểm trùng (BR-MDM-01).
  // Mã phải khớp danh mục cost center trên FAST; GĐ1 chưa kiểm với FAST (D-04, Giả định 1).
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
  code!: string;

  @IsString()
  @Length(1, 150)
  name!: string;
}

/** Sửa cost center: chỉ sửa tên; mã KHÔNG đổi được (BR-MDM-17) nên không có ở DTO. */
export class UpdateCostCenterDto {
  @IsString()
  @Length(1, 150)
  name!: string;

  // Phiên bản đang xem — dùng cho khoá lạc quan (UC-MDM-03.EX.4).
  @IsInt()
  @Min(1)
  version!: number;
}

/** Ngừng cost center (UC-MDM-03.AC.2): lý do bắt buộc từ nhóm 'Ngừng mục danh mục'. */
export class DeactivateCostCenterDto {
  // Lý do ngừng — chọn từ danh mục lý do nhóm CATALOG_DEACTIVATE (UC-MDM-03.AC.2 3d, BR-CMN-10).
  // Còn hoạt động + đúng nhóm được kiểm lại trong RPC có khoá dòng (UC-MDM-03 3f).
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  // Ô ghi thêm — bắt buộc khi lý do là 'Khác' (kiểm trong RPC); tối đa 500 ký tự (Giả định 6).
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  // Phiên bản đang xem — khoá lạc quan (UC-MDM-03.EX.4).
  @IsInt()
  @Min(1)
  version!: number;
}
