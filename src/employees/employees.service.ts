import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import { auditContextOf } from '@/audit/audit.service';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { ROLE_CATALOG, Role } from '@/utils/enums/role.enum';
import { sanitizeSearchTerm } from '@/utils/utils';
import { type AuthRequest } from '@/auth/auth.interface';
import { type CreateEmployeeDto } from './dto/create-employee.dto';
import { type GrantRoleAssignmentDto } from './dto/grant-role-assignment.dto';
import { type ListEmployeesQueryDto } from './dto/list-employees.dto';
import { type RevokeRoleAssignmentDto } from './dto/revoke-role-assignment.dto';
import { type ChangeAccountStatusDto } from './dto/change-account-status.dto';
import { type UpdateEmployeeProfileDto } from './dto/update-employee-profile.dto';
import { type ChangeEmployeeEmailDto } from './dto/change-employee-email.dto';
import { type TerminateEmployeeDto } from './dto/terminate-employee.dto';
import {
  normalizeEmployeeCode,
  normalizeEmployeeEmail,
  normalizeEmployeePhone,
  optionalTrim,
  resolveInitialRoleContext,
} from './employee-normalization';
import { resolveGrantRoleInput } from './employee-role-assignment';
import {
  type CreatedEmployeeModel,
  type EmployeeAccessModel,
  type EmployeeListItemModel,
  type ResendEmployeeInviteRow,
  type ResentEmployeeInviteModel,
  type RoleAssignmentModel,
  type ChangedAccountStatusModel,
  toEmployeeListItemModel,
  toRoleAssignmentModel,
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

  async getAccess(employeeId: string): Promise<EmployeeAccessModel> {
    const profile = await this.repository.findAccessProfile(employeeId);
    if (!profile) throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    const [assignments, locations, accountStatusReasons] = await Promise.all([
      this.repository.findRoleAssignments(employeeId),
      this.repository.listActiveLocations(),
      this.repository.listAccountStatusReasons(),
    ]);
    return {
      employee: {
        id: profile.id,
        displayName: profile.display_name,
        employeeCode: profile.employee_code,
        status: profile.status,
      },
      assignments: assignments.map((row) => toRoleAssignmentModel(row)),
      options: {
        // ⚠️ Không cấp SYSTEM_ADMIN qua giao diện (BR-IAM-05); chỉ các vai trò assignable.
        roles: ROLE_CATALOG.filter(
          (role) => role.assignable && role.code !== Role.SYSTEM_ADMIN,
        ).map((role) => ({
          code: role.code,
          nameVi: role.nameVi,
          nameEn: role.nameEn,
          contextType: role.contextType,
        })),
        locations,
        accountStatusReasons: accountStatusReasons.map((reason) => ({
          id: reason.id,
          code: reason.code,
          label: reason.label,
          group: reason.reason_group as 'ACCOUNT_LOCK' | 'ACCOUNT_UNLOCK',
          isFreetext: reason.is_freetext,
        })),
      },
    };
  }

  async grantRoles(
    employeeId: string,
    dto: GrantRoleAssignmentDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<RoleAssignmentModel[]> {
    const profile = await this.repository.findAccessProfile(employeeId);
    if (!profile) throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    // ⚠️ Lớp chặn ở service (RPC không tự kiểm actor): nhân viên đích phải Đang hoạt động (EX.2).
    if (profile.status !== 'ACTIVE') {
      throw new AppException(ErrorCode.ACCOUNT_INACTIVE, {
        status: profile.status,
      });
    }
    const resolved = resolveGrantRoleInput({
      roleCode: dto.roleCode,
      contextIds: dto.contextIds,
      effectiveFrom: dto.effectiveFrom,
      effectiveTo: dto.effectiveTo,
    });
    const audit = auditContextOf(req);
    const rows = await this.repository.grantRolesViaRpc({
      p_command_key: commandKey,
      p_employee_id: employeeId,
      p_role_code: resolved.role.code,
      p_context_type: resolved.role.contextType,
      p_context_ids: resolved.contextIds,
      p_effective_from: resolved.effectiveFrom,
      p_effective_to: resolved.effectiveTo,
      p_reason: dto.reason,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return rows.map((row) =>
      toRoleAssignmentModel({
        id: row.id,
        role_code: row.role_code,
        context_type: row.context_type,
        context_id: row.context_id,
        effective_from: row.effective_from,
        effective_to: row.effective_to,
        grant_reason: row.grant_reason,
        revoked_by: null,
        location_code: null,
        location_name: null,
      }),
    );
  }

  async revokeRole(
    employeeId: string,
    assignmentId: string,
    dto: RevokeRoleAssignmentDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<RoleAssignmentModel> {
    // ⚠️ Không chặn theo trạng thái tài khoản nhân viên: vẫn thu hồi được vai trò của người đang
    // bị khoá/nghỉ. Mọi kiểm tra (dòng thuộc đúng nhân viên, chưa đóng, không phải SYSTEM_ADMIN)
    // nằm trong RPC để một transaction vừa đóng hiệu lực vừa ghi audit (EX.1/EX.3/EX.6).
    const audit = auditContextOf(req);
    const row = await this.repository.revokeRoleViaRpc({
      p_command_key: commandKey,
      p_assignment_id: assignmentId,
      p_employee_id: employeeId,
      p_reason: dto.reason,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toRoleAssignmentModel({
      id: row.id,
      role_code: row.role_code,
      context_type: row.context_type,
      context_id: row.context_id,
      effective_from: row.effective_from,
      effective_to: row.effective_to,
      grant_reason: row.grant_reason,
      revoked_by: row.revoked_by,
      location_code: null,
      location_name: null,
    });
  }

  async changeAccountStatus(
    employeeId: string,
    dto: ChangeAccountStatusDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<ChangedAccountStatusModel> {
    const audit = auditContextOf(req);
    const row = await this.repository.changeAccountStatusViaRpc({
      p_command_key: commandKey,
      p_employee_id: employeeId,
      p_action: dto.action,
      p_reason_code_id: dto.reasonCodeId,
      p_reason_note: dto.reasonNote ?? '',
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });

    let sessionRevocation: ChangedAccountStatusModel['sessionRevocation'] =
      'NOT_REQUIRED';
    // Trạng thái + audit đã commit. Thu hồi phiên là side effect hậu transaction: lỗi không được
    // hoàn tác khóa, vì JwtAuthGuard vẫn chặn mọi request kế tiếp theo user_profiles.status.
    if (dto.action === 'LOCK' && !row.is_replay) {
      try {
        await this.repository.revokeEmployeeSessions(employeeId);
        sessionRevocation = 'SUCCEEDED';
      } catch (error) {
        sessionRevocation = 'FAILED';
        this.logger.error(
          `Không thu hồi hết phiên sau khi khóa tài khoản: employee=${employeeId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
    return { id: row.id, status: row.status, sessionRevocation };
  }

  async getProfile(employeeId: string) {
    const [profile, options, emailReasons, managerRows] = await Promise.all([
      this.repository.findProfile(employeeId),
      this.repository.createOptions(),
      this.repository.listEmailChangeReasons(),
      this.repository.listActiveManagerCandidates(),
    ]);
    if (!profile) throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    const excludedManagers = new Set<string>([employeeId]);
    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const manager of managerRows) {
        if (
          manager.manager_id &&
          excludedManagers.has(manager.manager_id) &&
          !excludedManagers.has(manager.id)
        ) {
          excludedManagers.add(manager.id);
          expanded = true;
        }
      }
    }
    return {
      profile: {
        id: profile.id,
        displayName: profile.display_name,
        workEmail: profile.work_email,
        employeeCode: profile.employee_code,
        phone: profile.phone,
        preferredLocale: profile.preferred_locale,
        primaryLocationId: profile.primary_location_id,
        departmentId: profile.department_id,
        jobTitle: profile.job_title,
        employmentType: profile.employment_type,
        startDate: profile.start_date,
        managerId: profile.manager_id,
        status: profile.status,
        profileVersion: profile.profile_version,
        authEmailSyncStatus: profile.auth_email_sync_status,
        authEmailSyncUpdatedAt: profile.auth_email_sync_updated_at,
      },
      options: {
        locations: options.locations,
        departments: options.departments,
        managers: managerRows
          .filter((manager) => !excludedManagers.has(manager.id))
          .map((manager) => ({
            id: manager.id,
            displayName: manager.display_name,
            employeeCode: manager.employee_code,
          })),
        emailReasons: emailReasons.map((reason) => ({
          id: reason.id,
          code: reason.code,
          label: reason.label,
          isFreetext: reason.is_freetext,
        })),
      },
    };
  }

  async updateProfile(
    employeeId: string,
    dto: UpdateEmployeeProfileDto,
    commandKey: string,
    req: AuthRequest,
  ) {
    const audit = auditContextOf(req);
    const row = await this.repository.updateProfileViaRpc({
      p_command_key: commandKey,
      p_employee_id: employeeId,
      p_expected_version: dto.profileVersion,
      p_display_name: dto.displayName,
      p_employee_code: dto.employeeCode
        ? normalizeEmployeeCode(dto.employeeCode)
        : null,
      p_phone: dto.phone ? normalizeEmployeePhone(dto.phone) : null,
      p_preferred_locale: dto.preferredLocale,
      p_primary_location_id: dto.primaryLocationId,
      p_department_id: dto.departmentId,
      p_job_title: dto.jobTitle,
      p_employment_type: dto.employmentType,
      p_start_date: dto.startDate,
      p_manager_id: dto.managerId,
      p_reason: dto.reason ?? '',
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return {
      id: row.id,
      profileVersion: row.profile_version,
      changed: row.changed,
    };
  }

  async changeEmployeeEmail(
    employeeId: string,
    dto: ChangeEmployeeEmailDto,
    commandKey: string,
    req: AuthRequest,
  ) {
    const audit = auditContextOf(req);
    const row = await this.repository.changeEmailViaRpc({
      p_command_key: commandKey,
      p_employee_id: employeeId,
      p_expected_version: dto.profileVersion,
      p_email: normalizeEmployeeEmail(dto.email),
      p_reason_code_id: dto.reasonCodeId,
      p_reason_note: dto.reasonNote ?? '',
      p_invite_token_hash: createHash('sha256')
        .update(randomBytes(32))
        .digest('hex'),
      p_invite_expires_at: new Date(
        Date.now() + this.invitationTtlMs(),
      ).toISOString(),
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const authResult =
        await this.supabaseAdmin.client.auth.admin.updateUserById(employeeId, {
          email: row.work_email,
          email_confirm: true,
        });
      let syncError = authResult.error;
      if (!syncError && row.invitation_required) {
        const invite =
          await this.supabaseAdmin.client.auth.admin.inviteUserByEmail(
            row.work_email,
            {
              data: { display_name: row.work_email },
              redirectTo: `${this.resolveAppUrl()}/activate-account`,
            },
          );
        syncError = invite.error;
      }
      if (!syncError) {
        await this.repository.markEmailSync(employeeId, 'IN_SYNC');
        return {
          id: row.id,
          workEmail: row.work_email,
          profileVersion: row.profile_version,
          authEmailSyncStatus: 'IN_SYNC' as const,
        };
      }
    }
    await this.repository.markEmailSync(employeeId, 'FAILED');
    this.logger.error(
      `Không đồng bộ được email đăng nhập: employee=${employeeId}`,
    );
    throw new AppException(ErrorCode.REQUEST_TIMEOUT);
  }

  async getTerminationPreview(employeeId: string) {
    const [profileDetail, directReports, assignments, reasons, assets] =
      await Promise.all([
        this.getProfile(employeeId),
        this.repository.listDirectReports(employeeId),
        this.repository.findRoleAssignments(employeeId),
        this.repository.listTerminationReasons(),
        this.repository.listAssetsForTermination(employeeId),
      ]);
    const candidates = await this.repository.listAssetHandoverCandidates([
      ...new Set(assets.map((asset) => asset.primary_location_id)),
    ]);
    return {
      employee: profileDetail.profile,
      directReports: directReports.map((row) => ({
        id: row.id,
        displayName: row.display_name,
        employeeCode: row.employee_code,
      })),
      openRoles: assignments
        .map((row) => toRoleAssignmentModel(row))
        .filter((row) => row.status === 'ACTIVE' || row.status === 'UPCOMING'),
      assets: assets.map((asset) => ({
        id: asset.id,
        code: asset.asset_code,
        name: asset.name,
        locationId: asset.primary_location_id,
        locationCode: asset.location?.code ?? '',
        locationName: asset.location?.name ?? '',
        candidates: candidates.filter(
          (person) =>
            person.id !== employeeId &&
            person.locationIds.includes(asset.primary_location_id),
        ),
      })),
      options: {
        managers: profileDetail.options.managers,
        reasons: reasons.map((reason) => ({
          id: reason.id,
          code: reason.code,
          label: reason.label,
          isFreetext: reason.is_freetext,
        })),
      },
    };
  }

  async terminateEmployee(
    employeeId: string,
    dto: TerminateEmployeeDto,
    commandKey: string,
    req: AuthRequest,
  ) {
    const audit = auditContextOf(req);
    const row = await this.repository.terminateViaRpc({
      p_command_key: commandKey,
      p_employee_id: employeeId,
      p_expected_version: dto.profileVersion,
      p_new_manager_id: dto.newManagerId ?? null,
      p_reason_code_id: dto.reasonCodeId,
      p_reason_note: dto.reasonNote ?? '',
      p_asset_transfers: dto.assetTransfers.map((transfer) => ({
        assetId: transfer.assetId,
        newResponsibleUserId: transfer.newResponsibleUserId,
      })),
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    let sessionRevocation: 'SUCCEEDED' | 'FAILED' | 'NOT_REQUIRED' =
      'NOT_REQUIRED';
    if (!row.is_replay) {
      try {
        await this.repository.revokeEmployeeSessions(employeeId);
        sessionRevocation = 'SUCCEEDED';
      } catch (error) {
        sessionRevocation = 'FAILED';
        this.logger.error(
          `Không thu hồi hết phiên sau khi cho nghỉ việc: employee=${employeeId}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }
    return {
      id: row.id,
      status: row.status,
      profileVersion: row.profile_version,
      directReportsReassigned: row.direct_reports_reassigned,
      rolesClosed: row.roles_closed,
      assetsTransferred: row.assets_transferred,
      sessionRevocation,
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

  async resendInvite(
    employeeId: string,
    commandKey: string,
    req: AuthRequest,
  ): Promise<ResentEmployeeInviteModel> {
    const replay = await this.repository.findResendReceipt(
      commandKey,
      req.user.sub,
      employeeId,
    );
    if (replay) return this.resolveResendReplay(replay);

    const audit = auditContextOf(req);
    const row = await this.repository.resendInviteViaRpc({
      p_command_key: commandKey,
      p_employee_id: employeeId,
      p_invite_token_hash: createHash('sha256')
        .update(randomBytes(32))
        .digest('hex'),
      p_invite_expires_at: new Date(
        Date.now() + this.invitationTtlMs(),
      ).toISOString(),
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    if (row.is_replay) return this.resolveResendReplay(row);

    // ⚠️ Giao dịch DB đã commit trước khi gọi nhà cung cấp. Nếu gửi lỗi, không được xoá lời
    // mời mới hoặc khôi phục lời mời cũ; lần bấm mới sẽ tạo một command key mới.
    const { error } =
      await this.supabaseAdmin.client.auth.admin.inviteUserByEmail(
        row.work_email,
        {
          data: { display_name: row.display_name },
          redirectTo: `${this.resolveAppUrl()}/activate-account`,
        },
      );
    if (error) {
      await this.repository.markInviteDelivery(commandKey, 'FAILED', {
        actorId: req.user.sub,
        actorLabel: audit.actorLabel ?? '',
        requestId: audit.requestId ?? '',
        ipAddress: audit.ipAddress,
        userAgent: audit.userAgent ?? '',
      });
      this.logger.error(
        `Không gửi được lời mời kích hoạt lại: employee=${employeeId}`,
      );
      throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
    }
    await this.repository.markInviteDelivery(commandKey, 'SENT', {
      actorId: req.user.sub,
      actorLabel: audit.actorLabel ?? '',
      requestId: audit.requestId ?? '',
      ipAddress: audit.ipAddress,
      userAgent: audit.userAgent ?? '',
    });
    return this.toResentInviteModel(row);
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

  private resolveResendReplay(
    row: ResendEmployeeInviteRow,
  ): ResentEmployeeInviteModel {
    if (row.delivery_status === 'FAILED') {
      throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
    }
    if (row.delivery_status !== 'SENT') {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    return this.toResentInviteModel(row);
  }

  private toResentInviteModel(
    row: ResendEmployeeInviteRow,
  ): ResentEmployeeInviteModel {
    return {
      employeeId: row.employee_id,
      displayName: row.display_name,
      email: row.work_email,
      inviteId: row.invite_id,
      sentAt: row.sent_at,
      expiresAt: row.expires_at,
    };
  }
}
