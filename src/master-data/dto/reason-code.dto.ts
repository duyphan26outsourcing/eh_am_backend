import {
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

/**
 * Nhóm lý do — 22 nhóm theo QĐ-06 (mở rộng ở migration 02g).
 *
 * ⚠️ PHẢI khớp CHECK `reason_group` (02g) và FE `master-data.api.ts` REASON_GROUPS. Đổi danh
 * sách này thì đổi cả migration + FE + i18n `masterData.reasonCodes.group.*`.
 */
export const REASON_GROUPS = [
  'ROLE_ASSIGNMENT',
  'ROLE_REVOKE',
  'PROFILE_EDIT',
  'ACCOUNT_LOCK',
  'ACCOUNT_UNLOCK',
  'TERMINATION',
  'EMAIL_CHANGE',
  'TRANSFER',
  'VOUCHER_CANCEL',
  'APPROVAL_REJECT',
  'DISPOSAL',
  'PROPOSAL_CANCEL',
  'LOSS_CONFIRM',
  'ASSET_RECOVERY',
  'LABEL_REPRINT',
  'ASSET_CANCEL',
  'FINANCE_ADJUST',
  'USE_STATUS_CHANGE',
  'CATALOG_DEACTIVATE',
  'LOCATION_CLOSE',
  'CONFIG_CHANGE',
  'ACCEPTANCE_FAIL',
] as const;

export class CreateReasonCodeDto {
  @IsIn(REASON_GROUPS)
  reasonGroup!: string;

  // Mã: 2-20 ký tự, chữ/số/gạch, ký tự đầu là chữ hoặc số (UC-MDM-07 Giả định 6).
  // Backend chuẩn hoá in hoa + bỏ khoảng trắng hai đầu trước khi kiểm trùng (BR-MDM-14).
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
  code!: string;

  @IsString()
  @Length(1, 150)
  label!: string;
}

/** Sửa lý do: chỉ sửa tên (label); mã + nhóm KHÔNG đổi (BR-MDM-17). */
export class UpdateReasonCodeDto {
  @IsString()
  @Length(1, 150)
  label!: string;

  // Phiên bản đang xem — khoá lạc quan (UC-MDM-07.EX.4).
  @IsInt()
  @Min(1)
  version!: number;
}

/** Ngừng lý do (UC-MDM-07.AC.2): lý do ngừng bắt buộc từ nhóm 'Ngừng mục danh mục'. */
export class DeactivateReasonCodeDto {
  // Lý do ngừng — chọn từ nhóm CATALOG_DEACTIVATE (UC-MDM-07.AC.2 3c). Không được là chính lý do
  // đang bị ngừng (kiểm ở service); còn hoạt động + đúng nhóm kiểm lại trong RPC (UC-MDM-07 3e).
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  // Ô ghi thêm — bắt buộc khi lý do là 'Khác' (kiểm trong RPC); tối đa 500 ký tự (Giả định 6).
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  // Phiên bản đang xem — khoá lạc quan (UC-MDM-07.EX.4).
  @IsInt()
  @Min(1)
  version!: number;
}
