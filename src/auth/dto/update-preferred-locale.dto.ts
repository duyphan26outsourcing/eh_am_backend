import { IsIn } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

export class UpdatePreferredLocaleDto {
  // ⚠️ message = ErrorCode để AllExceptionsFilter dịch được (chuẩn dự án: validator trả mã, không
  // trả chuỗi tiếng Anh mặc định của class-validator).
  @IsIn(['vi', 'en'], { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  preferredLocale!: 'vi' | 'en';
}
