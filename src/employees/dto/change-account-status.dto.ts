import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

export const ACCOUNT_STATUS_ACTIONS = ['LOCK', 'UNLOCK'] as const;
export type AccountStatusAction = (typeof ACCOUNT_STATUS_ACTIONS)[number];

export class ChangeAccountStatusDto {
  @IsIn(ACCOUNT_STATUS_ACTIONS, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  action!: AccountStatusAction;

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  reasonCodeId!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @IsString({ message: ErrorCode.VALIDATION_FAILED })
  @MaxLength(500, { message: ErrorCode.VALIDATION_FAILED })
  reasonNote?: string;
}
