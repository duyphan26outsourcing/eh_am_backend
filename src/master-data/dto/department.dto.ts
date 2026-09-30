import { IsInt, IsString, Length, Matches, Min } from 'class-validator';

export class CreateDepartmentDto {
  // Mã: 2-20 ký tự, chữ/số/gạch, ký tự đầu là chữ hoặc số (UC-MDM-08 Giả định 5).
  // Backend chuẩn hoá in hoa + bỏ khoảng trắng hai đầu trước khi kiểm trùng (BR-MDM-14).
  @IsString()
  @Length(2, 20)
  @Matches(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
  code!: string;

  @IsString()
  @Length(1, 150)
  name!: string;

  // ⚠️ Trưởng phòng (manager) KHÔNG có ở GĐ này: gán sau qua sửa, cần danh sách nhân viên Đang
  // hoạt động + kiểm BR-MDM-07 (UC-IAM-15 chưa có). Tạo phòng ban để manager_id NULL (Giả định 1).
}

/** Sửa phòng ban: chỉ sửa tên; mã KHÔNG đổi (BR-MDM-17). Đổi trưởng phòng để sau. */
export class UpdateDepartmentDto {
  @IsString()
  @Length(1, 150)
  name!: string;

  // Phiên bản đang xem — khoá lạc quan (UC-MDM-08.EX.4).
  @IsInt()
  @Min(1)
  version!: number;
}
