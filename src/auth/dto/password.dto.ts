import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_RULES_MESSAGE,
} from '@/utils/utils';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email không hợp lệ.' })
  @MaxLength(320)
  email!: string;
}

/**
 * Đặt lại mật khẩu bằng liên kết trong email.
 *
 * `accessToken` là token khôi phục do Supabase gắn vào liên kết gửi qua email, được
 * frontend đọc từ phần hash của URL rồi chuyển sang đây.
 *
 * ⚠️ NÓ ĐI TRONG BODY, KHÔNG ĐI TRONG HEADER `Authorization`.
 *
 * Lúc này người dùng chưa có phiên, và `JwtAuthGuard` còn giải mã lớp AES riêng của hệ
 * thống — token của Supabase không có lớp đó nên sẽ bị từ chối ngay ở bước giải mã.
 * Chữ ký của nó được xác minh riêng ở tầng service.
 */
export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Thiếu mã khôi phục.' })
  accessToken!: string;

  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu không được dài hơn ${PASSWORD_MAX_LENGTH} ký tự.`,
  })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_RULES_MESSAGE })
  newPassword!: string;
}

/**
 * Đổi mật khẩu khi đang đăng nhập.
 *
 * ⚠️ `currentPassword` LÀ BẮT BUỘC, VÀ ĐÂY LÀ LÝ DO.
 *
 * `supabase.auth.updateUser` **không** kiểm mật khẩu cũ. Bỏ trường này nghĩa là bất kỳ
 * ai chạm được vào một phiên đang mở — máy bỏ quên chưa khoá, token bị lấy từ
 * localStorage — đều đổi được mật khẩu và chiếm luôn tài khoản.
 */
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu hiện tại.' })
  currentPassword!: string;

  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu không được dài hơn ${PASSWORD_MAX_LENGTH} ký tự.`,
  })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_RULES_MESSAGE })
  newPassword!: string;
}
