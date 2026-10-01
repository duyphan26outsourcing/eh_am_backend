import { Transform } from 'class-transformer';
import {
  IsIn,
  IsDefined,
  IsInt,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

const optionalText = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;

export class UpdateEmployeeProfileDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @MinLength(2, { message: ErrorCode.VALIDATION_FAILED })
  @MaxLength(150, { message: ErrorCode.VALIDATION_FAILED })
  displayName!: string;

  @Transform(optionalText)
  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @Matches(/^[A-Za-z0-9_-]{1,32}$/, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  employeeCode!: string | null;

  @Transform(optionalText)
  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @Matches(/^0\d{9}$/, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  phone!: string | null;

  @IsIn(['vi', 'en'], { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  preferredLocale!: 'vi' | 'en';

  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  primaryLocationId!: string;

  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  departmentId!: string | null;

  @Transform(optionalText)
  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @MaxLength(100, { message: ErrorCode.VALIDATION_FAILED })
  jobTitle!: string | null;

  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN'], {
    message: ErrorCode.VALUE_OUT_OF_DOMAIN,
  })
  employmentType!: string | null;

  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  startDate!: string | null;

  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  managerId!: string | null;

  @Transform(optionalText)
  @IsDefined({ message: ErrorCode.REQUIRED_FIELD_MISSING })
  @ValidateIf((_object, value: unknown) => value !== null)
  @MaxLength(500, { message: ErrorCode.VALIDATION_FAILED })
  reason!: string | null;

  @IsInt({ message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  @Min(1, { message: ErrorCode.VALUE_OUT_OF_DOMAIN })
  profileVersion!: number;
}
