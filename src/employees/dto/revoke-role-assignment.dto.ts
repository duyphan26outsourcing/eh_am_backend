import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

// ⚠️ Thu hồi vai trò BẮT BUỘC có lý do do người dùng nhập (BR-AUD-03, UC-IAM-11.EX.2); hệ thống
// không tự điền. Chỉ cần lý do — dòng cần đóng được xác định bằng assignmentId trên URL.
export class RevokeRoleAssignmentDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @MinLength(2, { message: ErrorCode.REQUIRED_FIELD_MISSING })
  @MaxLength(500, { message: ErrorCode.VALIDATION_FAILED })
  reason!: string;
}
