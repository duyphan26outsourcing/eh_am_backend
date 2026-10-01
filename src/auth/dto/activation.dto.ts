import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_PATTERN,
  PASSWORD_RULES_MESSAGE,
} from '@/utils/utils';

export class ActivationPreviewDto {
  @IsString()
  @IsNotEmpty({ message: 'Thiếu mã kích hoạt.' })
  @MaxLength(4096)
  accessToken!: string;
}

export class CompleteActivationDto extends ActivationPreviewDto {
  @IsString()
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: `Mật khẩu không được dài hơn ${PASSWORD_MAX_LENGTH} ký tự.`,
  })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_RULES_MESSAGE })
  newPassword!: string;
}
