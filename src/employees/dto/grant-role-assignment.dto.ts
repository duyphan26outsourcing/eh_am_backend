import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { ROLE_CATALOG, Role } from '@/utils/enums/role.enum';

// ⚠️ Chặn ngay ở DTO các vai trò không cấp qua giao diện (gồm SYSTEM_ADMIN) — defense-in-depth,
// cho lỗi 400 rõ ràng trước khi xuống service/RPC (vẫn chặn lần nữa ở hai tầng đó).
const ASSIGNABLE_ROLE_CODES = ROLE_CATALOG.filter(
  (role) => role.assignable && role.code !== Role.SYSTEM_ADMIN,
).map((role) => role.code);

export class GrantRoleAssignmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  @IsIn(ASSIGNABLE_ROLE_CODES, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  roleCode!: string;

  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  contextIds!: string[];

  @IsDateString({ strict: true })
  effectiveFrom!: string;

  @IsOptional()
  @IsDateString({ strict: true })
  effectiveTo?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  reason!: string;
}
