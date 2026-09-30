import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';

/** Năm loại location (F-MDM-01). Nhãn tiếng Việt do frontend hiển thị. */
export const LOCATION_TYPES = [
  'STORE',
  'WAREHOUSE',
  'ROASTERY',
  'OFFICE',
  'EXTERNAL',
] as const;

export class CreateLocationDto {
  // Mã: 2-20 ký tự, chữ/số/gạch, ký tự đầu là chữ hoặc số (UC-MDM-01 Giả định 6).
  // Backend chuẩn hoá in hoa + bỏ khoảng trắng hai đầu trước khi kiểm trùng (BR-MDM-01).
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
  code!: string;

  @IsString()
  @Length(1, 150)
  name!: string;

  @IsIn(LOCATION_TYPES)
  type!: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  address?: string;

  @IsUUID('4')
  defaultCostCenterId!: string;
}

/** Sửa location: mã và loại KHÔNG đổi được (BR-MDM-17) nên không có ở DTO. */
export class UpdateLocationDto {
  @IsString()
  @Length(1, 150)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  address?: string;

  @IsUUID('4')
  defaultCostCenterId!: string;

  // Phiên bản đang xem — dùng cho khoá lạc quan (UC-MDM-01.EX.4).
  @IsInt()
  @Min(1)
  version!: number;
}
