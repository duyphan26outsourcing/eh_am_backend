import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { auditContextOf } from '@/audit/audit.service';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { ROLE_CATALOG } from '@/utils/enums/role.enum';
import { sanitizeSearchTerm } from '@/utils/utils';
import { type AuthRequest } from '@/auth/auth.interface';
import { type CreateEmployeeDto } from './dto/create-employee.dto';
import { type ListEmployeesQueryDto } from './dto/list-employees.dto';
import {
  normalizeEmployeeCode,
  normalizeEmployeeEmail,
  normalizeEmployeePhone,
  optionalTrim,
  resolveInitialRoleContext,
} from './employee-normalization';
import {
  type CreatedEmployeeModel,
  type EmployeeListItemModel,
  toEmployeeListItemModel,
} from './employee.model';
import { EmployeesRepository } from './employees.repository';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);

  constructor(
    private readonly repository: EmployeesRepository,
    private readonly supabaseAdmin: SupabaseAdminService,
    private readonly config: ConfigService,
  ) {}

  async createOptions() {
    const options = await this.repository.createOptions();
    return {
      locations: options.locations,
      departments: options.departments,
      managers: options.managers.map((manager) => ({
        id: manager.id,
        displayName: manager.display_name,
        employeeCode: manager.employee_code,
      })),
      reasons: options.reasons.map((reason) => ({
        id: reason.id,
        code: reason.code,
        label: reason.label,
        isFreetext: reason.is_freetext,
      })),
      roles: ROLE_CATALOG.filter((role) => role.assignable).map((role) => ({
        code: role.code,
        nameVi: role.nameVi,
        nameEn: role.nameEn,
        contextType: role.contextType,
        descriptionVi: role.descriptionVi,
      })),
    };
  }

  async list(
    query: ListEmployeesQueryDto,
  ): Promise<PaginatedResult<EmployeeListItemModel>> {
    const page = await this.repository.listEmployees({
      // ⚠️ Làm sạch từ khoá ở đúng một chỗ (EX.3): bỏ `% _ , ( )`. Khi chỉ còn ký tự đặc biệt,
      // `sanitizeSearchTerm` trả null → coi như không có từ khoá, không quét cả bảng.
      search: sanitizeSearchTerm(query.search),
      locationId: query.locationId ?? null,
      departmentId: query.departmentId ?? null,
      roleCode: query.roleCode ?? null,
      status: query.status ?? null,
      employmentType: query.employmentType ?? null,
      page: query.page,
      pageSize: query.pageSize,
    });
    return {
      ...page,
      items: page.items.map(toEmployeeListItemModel),
    };
  }

  async create(
    dto: CreateEmployeeDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<CreatedEmployeeModel> {
    const replay = await this.repository.findReceipt(commandKey, req.user.sub);
    if (replay) {
      return this.toModel(
        replay,
        dto.activationMethod,
        dto.activationMethod === 'EMAIL_INVITE',
      );
    }

    const email = normalizeEmployeeEmail(dto.workEmail);
    const phone = normalizeEmployeePhone(dto.phone);
    if (phone && !/^0\d{9}$/.test(phone)) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    const employeeCode = normalizeEmployeeCode(dto.employeeCode);
    const location = await this.repository.findLocation(dto.primaryLocationId);
    if (
      !location ||
      location.status !== 'ACTIVE' ||
      location.type === 'EXTERNAL'
    ) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }
    if (location.type === 'OFFICE') {
      if (!dto.departmentId)
        throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
      const department = await this.repository.findDepartment(dto.departmentId);
      if (!department || department.status !== 'ACTIVE') {
        throw new AppException(ErrorCode.VALIDATION_FAILED);
      }
    } else if (dto.departmentId) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    if (dto.managerId) {
      const manager = await this.repository.findManager(dto.managerId);
      if (!manager || manager.status !== 'ACTIVE') {
        throw new AppException(ErrorCode.INVALID_SUPERIOR);
      }
    }
    if (dto.startDate) {
      const max = new Date();
      max.setFullYear(max.getFullYear() + 1);
      if (new Date(dto.startDate).getTime() > max.getTime()) {
        throw new AppException(ErrorCode.VALIDATION_FAILED);
      }
    }

    let roleContext: ReturnType<typeof resolveInitialRoleContext> | null = null;
    if (dto.roleCode) {
      roleContext = resolveInitialRoleContext(
        dto.roleCode,
        dto.primaryLocationId,
      );
      if (!dto.reasonCodeId)
        throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
      const reason = await this.repository.findReason(dto.reasonCodeId);
      if (
        !reason ||
        reason.status !== 'ACTIVE' ||
        reason.reason_group !== 'ROLE_ASSIGNMENT'
      ) {
        throw new AppException(ErrorCode.REASON_INVALID);
      }
      if (reason.is_freetext && !dto.reasonNote?.trim()) {
        throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
      }
    }

    if (
      dto.activationMethod === 'TEMPORARY_PASSWORD' &&
      !dto.temporaryPassword
    ) {
      throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
    }

    const invitation = dto.activationMethod === 'EMAIL_INVITE';
    const authResult = invitation
      ? await this.supabaseAdmin.client.auth.admin.inviteUserByEmail(email, {
          data: { display_name: dto.displayName.trim() },
          redirectTo: `${this.resolveAppUrl()}/activate-account`,
        })
      : await this.supabaseAdmin.client.auth.admin.createUser({
          email,
          password: dto.temporaryPassword,
          email_confirm: true,
          user_metadata: { display_name: dto.displayName.trim() },
        });
    if (authResult.error || !authResult.data.user) {
      const afterConflict = await this.waitForReceipt(commandKey, req.user.sub);
      if (afterConflict) {
        return this.toModel(
          afterConflict,
          dto.activationMethod,
          dto.activationMethod === 'EMAIL_INVITE',
        );
      }
      if (
        authResult.error?.code === 'email_exists' ||
        authResult.error?.message.toLowerCase().includes('already')
      ) {
        throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED);
      }
      throw new AppException(
        invitation
          ? ErrorCode.EMAIL_SEND_FAILED
          : ErrorCode.ACCOUNT_CREATE_FAILED,
      );
    }

    const userId = authResult.data.user.id;
    const inviteTokenHash = invitation
      ? createHash('sha256').update(randomBytes(32)).digest('hex')
      : null;
    const inviteExpiresAt = invitation
      ? new Date(Date.now() + this.invitationTtlMs()).toISOString()
      : null;
    const audit = auditContextOf(req);
    let created: Awaited<ReturnType<EmployeesRepository['createViaRpc']>>;
    try {
      created = await this.repository.createViaRpc({
        p_command_key: commandKey,
        p_user_id: userId,
        p_work_email: email,
        p_display_name: dto.displayName.trim(),
        p_phone: phone ?? '',
        p_preferred_locale: dto.preferredLocale,
        p_employee_code: employeeCode ?? '',
        p_job_title: optionalTrim(dto.jobTitle) ?? '',
        p_primary_location_id: dto.primaryLocationId,
        p_department_id:
          location.type === 'OFFICE' ? (dto.departmentId ?? null) : null,
        p_manager_id: dto.managerId ?? null,
        p_employment_type: dto.employmentType ?? null,
        p_start_date: dto.startDate ?? null,
        p_must_change_password: dto.activationMethod === 'TEMPORARY_PASSWORD',
        p_activation_method: dto.activationMethod,
        p_invite_token_hash: inviteTokenHash,
        p_invite_expires_at: inviteExpiresAt,
        p_role_code: dto.roleCode ?? null,
        p_role_context_type: roleContext?.contextType ?? null,
        p_role_context_id: roleContext?.contextId ?? null,
        p_effective_from: dto.effectiveFrom ?? null,
        p_effective_to: dto.effectiveTo ?? null,
        p_reason_code_id: dto.roleCode ? (dto.reasonCodeId ?? null) : null,
        p_reason_note: dto.roleCode ? (optionalTrim(dto.reasonNote) ?? '') : '',
        p_actor_id: req.user.sub,
        p_actor_label: audit.actorLabel ?? '',
        p_changes: {
          display_name: { before: null, after: dto.displayName.trim() },
          work_email: { before: null, after: email },
          primary_location_id: { before: null, after: dto.primaryLocationId },
          department_id: { before: null, after: dto.departmentId ?? null },
          employee_code: { before: null, after: employeeCode },
          role_code: { before: null, after: dto.roleCode ?? null },
        },
        p_request_id: audit.requestId ?? '',
        p_ip: audit.ipAddress,
        p_user_agent: audit.userAgent ?? '',
      });
    } catch (error) {
      const cleanup =
        await this.supabaseAdmin.client.auth.admin.deleteUser(userId);
      if (cleanup.error) {
        this.logger.error(
          `Không dọn được auth user sau lỗi tạo hồ sơ: user=${userId}`,
        );
      }
      throw error;
    }

    return this.toModel(created, dto.activationMethod, invitation);
  }

  private resolveAppUrl(): string {
    const appUrl = this.config.get<string>('APP_URL')?.trim();
    if (appUrl) return appUrl.replace(/\/+$/, '');
    const firstOrigin = this.config
      .get<string>('CORS_ORIGINS')
      ?.split(',')[0]
      ?.trim();
    return (firstOrigin || 'http://localhost:5175').replace(/\/+$/, '');
  }

  private invitationTtlMs(): number {
    const configured = Number(
      this.config.get<string>('SUPABASE_EMAIL_OTP_EXPIRY_SECONDS'),
    );
    // Mặc định chính thức của Supabase là 3600 giây. Khi Dashboard đổi Email OTP
    // Expiration, biến này phải đổi cùng để DB không báo còn hạn cho một link Auth đã chết.
    const seconds =
      Number.isFinite(configured) && configured > 0 ? configured : 3600;
    return seconds * 1000;
  }

  private async waitForReceipt(commandKey: string, actorId: string) {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const receipt = await this.repository.findReceipt(commandKey, actorId);
      if (receipt) return receipt;
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    }
    return null;
  }

  private toModel(
    row: {
      id: string;
      display_name: string;
      work_email: string | null;
      employee_code: string | null;
      status: string;
    },
    activationMethod: string,
    invitationEmailSent: boolean,
  ): CreatedEmployeeModel {
    return {
      id: row.id,
      displayName: row.display_name,
      workEmail: row.work_email ?? '',
      employeeCode: row.employee_code,
      status: row.status,
      activationMethod,
      invitationEmailSent,
    };
  }
}
