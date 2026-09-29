import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  EMPLOYEE_CODE_PATTERN,
  PASSWORD_MAX_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_RULES_MESSAGE,
} from '@/utils/utils';

/**
 * Đăng ký tài khoản.
 *
 * ⚠️ ĐĂNG KÝ ≠ CÓ QUYỀN
 *
 * Tài khoản vừa đăng ký (và đã xác nhận email) đăng nhập được, nhưng **không có vai trò nào**
 * — nên không đọc được tài sản của location nào. Quyền chỉ có khi quản trị gán vai trò theo
 * phạm vi (`context_role_assignments`). Mở hay đóng đăng ký công khai là một quyết định sản
 * phẩm (so với mô hình quản trị tạo tài khoản / mời qua email) — chốt trong tài liệu sản phẩm.
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @MaxLength(320)
  email!: string;

  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu không được dài hơn ${PASSWORD_MAX_LENGTH} ký tự.`,
  })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_RULES_MESSAGE })
  password!: string;

  /**
   * Họ tên — giữ nguyên dấu tiếng Việt.
   *
   * Đây là thứ người khác đọc trên biên bản bàn giao và lịch sử tài sản, nên nó phải là tên
   * thật của người ta viết đúng chính tả.
   */
  @IsString()
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự.' })
  @MaxLength(120, { message: 'Họ tên quá dài.' })
  displayName!: string;

  /**
   * Mã nhân viên do Every Half cấp — tuỳ chọn lúc đăng ký.
   *
   * Không bắt buộc vì nhân viên mới có thể chưa có mã; quản trị gắn sau. Nếu gửi thì phải đúng
   * định dạng và chưa gắn với tài khoản nào khác.
   */
  @IsOptional()
  @IsString()
  @Matches(EMPLOYEE_CODE_PATTERN, {
    message:
      'Mã nhân viên chỉ gồm chữ không dấu, số, dấu chấm, gạch dưới, gạch ngang; dài 2-30 ký tự và không bắt đầu/kết thúc bằng dấu.',
  })
  employeeCode?: string;
}
