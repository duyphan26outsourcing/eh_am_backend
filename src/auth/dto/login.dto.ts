import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { PASSWORD_MAX_LENGTH } from '@/utils/utils';

export class LoginDto {
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @MaxLength(320, { message: 'Email quá dài.' })
  email!: string;

  /**
   * ⚠️ KHÔNG áp `PASSWORD_PATTERN` ở đây, chỉ ở luồng ĐẶT mật khẩu.
   *
   * Nếu validate độ mạnh lúc đăng nhập thì tài khoản cũ (đặt mật khẩu trước khi chính
   * sách siết lại) sẽ bị chặn ngay ở cửa với thông báo về quy tắc mật khẩu — người dùng
   * đọc xong sẽ tưởng mình gõ sai, chứ không hiểu là mật khẩu đúng nhưng hệ thống không
   * cho vào nữa.
   *
   * Ở đây chỉ chặn hai đầu để tránh gửi payload vô nghĩa xuống Supabase.
   */
  @IsString({ message: 'Mật khẩu không hợp lệ.' })
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu.' })
  @MaxLength(PASSWORD_MAX_LENGTH, { message: 'Mật khẩu quá dài.' })
  password!: string;
}
