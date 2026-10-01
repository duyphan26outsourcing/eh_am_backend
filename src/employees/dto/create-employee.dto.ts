import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export const ACTIVATION_METHODS = [
  'EMAIL_INVITE',
  'TEMPORARY_PASSWORD',
] as const;
export const EMPLOYMENT_TYPES = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
] as const;

export class CreateEmployeeDto {
  @IsUUID('4')
  primaryLocationId!: string;

  @IsOptional()
  @IsUUID('4')
  departmentId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  displayName!: string;

  @IsEmail()
  @MaxLength(320)
  workEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsIn(['vi', 'en'])
  preferredLocale!: 'vi' | 'en';

  @IsOptional()
  @Matches(/^[A-Za-z0-9_-]{1,32}$/)
  employeeCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  jobTitle?: string;

  @IsOptional()
  @IsIn(EMPLOYMENT_TYPES)
  employmentType?: (typeof EMPLOYMENT_TYPES)[number];

  @IsOptional()
  @IsDateString({ strict: true })
  startDate?: string;

  @IsOptional()
  @IsUUID('4')
  managerId?: string;

  @IsIn(ACTIVATION_METHODS)
  activationMethod!: (typeof ACTIVATION_METHODS)[number];

  @ValidateIf(
    (value: CreateEmployeeDto) =>
      value.activationMethod === 'TEMPORARY_PASSWORD',
  )
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
  temporaryPassword?: string;

  @IsOptional()
  @IsString()
  roleCode?: string;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsUUID('4')
  reasonCodeId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reasonNote?: string;
}
