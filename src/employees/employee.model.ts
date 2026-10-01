export interface EmployeeCreateOptions {
  locations: Array<{ id: string; code: string; name: string; type: string }>;
  departments: Array<{ id: string; code: string; name: string }>;
  managers: Array<{
    id: string;
    displayName: string;
    employeeCode: string | null;
  }>;
  reasons: Array<{
    id: string;
    code: string;
    label: string;
    isFreetext: boolean;
  }>;
  roles: Array<{
    code: string;
    nameVi: string;
    nameEn: string;
    contextType: string;
    descriptionVi: string;
  }>;
}

import { roleAssignmentStatus } from './employee-role-assignment';

export interface CreatedEmployeeModel {
  id: string;
  displayName: string;
  workEmail: string;
  employeeCode: string | null;
  status: string;
  activationMethod: string;
  invitationEmailSent: boolean;
}

export interface ResentEmployeeInviteModel {
  employeeId: string;
  displayName: string;
  email: string;
  inviteId: string;
  sentAt: string;
  expiresAt: string;
}

export interface ResendEmployeeInviteRow {
  employee_id: string;
  display_name: string;
  work_email: string;
  invite_id: string;
  sent_at: string;
  expires_at: string;
  delivery_status: 'PENDING' | 'SENT' | 'FAILED';
  is_replay: boolean;
}

/**
 * Một dòng của danh sách nhân viên (UC-IAM-15), bản dựng riêng cho Quản trị hệ thống.
 *
 * ⚠️ KHÔNG trả thẳng dòng DB ra API. Mapper này chỉ phơi các trường màn hình danh sách cần;
 * cột nội bộ (`profile_version`, `created_by`, token lời mời…) không bao giờ ra ngoài.
 */
export interface EmployeeListItemModel {
  id: string;
  displayName: string;
  workEmail: string | null;
  phone: string | null;
  employeeCode: string | null;
  jobTitle: string | null;
  employmentType: string | null;
  status: string;
  startDate: string | null;
  location: { id: string; code: string; name: string } | null;
  department: { id: string; code: string; name: string } | null;
  /** Chỉ có nghĩa khi status = PENDING_ACTIVATION; các trạng thái khác trả null. */
  inviteStatus: string | null;
  inviteExpiresAt: string | null;
}

/** Dòng RPC `list_employees` trả về (snake_case). */
export interface EmployeeDirectoryRow {
  id: string;
  display_name: string;
  work_email: string | null;
  phone: string | null;
  employee_code: string | null;
  job_title: string | null;
  employment_type: string | null;
  status: string;
  start_date: string | null;
  primary_location_id: string | null;
  location_code: string | null;
  location_name: string | null;
  department_id: string | null;
  department_code: string | null;
  department_name: string | null;
  invite_status: string | null;
  invite_expires_at: string | null;
}

export function toEmployeeListItemModel(
  row: EmployeeDirectoryRow,
): EmployeeListItemModel {
  // ⚠️ Trạng thái lời mời chỉ hiện với người Chờ kích hoạt. Một người đã ACTIVE vẫn còn dòng
  // invite ACCEPTED trong DB — phơi nó ra danh sách sẽ gây hiểu nhầm "còn lời mời treo".
  const pending = row.status === 'PENDING_ACTIVATION';
  return {
    id: row.id,
    displayName: row.display_name,
    workEmail: row.work_email,
    phone: row.phone,
    employeeCode: row.employee_code,
    jobTitle: row.job_title,
    employmentType: row.employment_type,
    status: row.status,
    startDate: row.start_date,
    location: row.primary_location_id
      ? {
          id: row.primary_location_id,
          code: row.location_code ?? '',
          name: row.location_name ?? '',
        }
      : null,
    department: row.department_id
      ? {
          id: row.department_id,
          code: row.department_code ?? '',
          name: row.department_name ?? '',
        }
      : null,
    inviteStatus: pending ? row.invite_status : null,
    inviteExpiresAt: pending ? row.invite_expires_at : null,
  };
}

// ---------------------------------------------------------------------------
// UC-IAM-10: Phân quyền theo phạm vi
// ---------------------------------------------------------------------------

/** Dòng phân quyền đọc từ `context_role_assignments` (kèm tên location join sẵn). */
export interface RoleAssignmentRow {
  id: string;
  role_code: string;
  context_type: string;
  context_id: string;
  effective_from: string;
  effective_to: string | null;
  grant_reason: string | null;
  revoked_by: string | null;
  location_code: string | null;
  location_name: string | null;
}

export interface RoleAssignmentModel {
  id: string;
  roleCode: string;
  contextType: string;
  contextId: string;
  location: { id: string; code: string; name: string } | null;
  effectiveFrom: string;
  effectiveTo: string | null;
  grantReason: string | null;
  status: 'UPCOMING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface EmployeeAccessModel {
  employee: {
    id: string;
    displayName: string;
    employeeCode: string | null;
    status: string;
  };
  assignments: RoleAssignmentModel[];
  options: {
    roles: Array<{
      code: string;
      nameVi: string;
      nameEn: string;
      contextType: string;
    }>;
    locations: Array<{ id: string; code: string; name: string }>;
    accountStatusReasons: Array<{
      id: string;
      code: string;
      label: string;
      group: 'ACCOUNT_LOCK' | 'ACCOUNT_UNLOCK';
      isFreetext: boolean;
    }>;
  };
}

export interface ChangedAccountStatusModel {
  id: string;
  status: 'ACTIVE' | 'SUSPENDED';
  sessionRevocation: 'SUCCEEDED' | 'FAILED' | 'NOT_REQUIRED';
}

export function toRoleAssignmentModel(
  row: RoleAssignmentRow,
  now = new Date(),
): RoleAssignmentModel {
  return {
    id: row.id,
    roleCode: row.role_code,
    contextType: row.context_type,
    contextId: row.context_id,
    // ⚠️ Vai trò PLATFORM dùng nil-UUID làm context nên không có location.
    location:
      row.context_type === 'LOCATION' && row.location_code
        ? {
            id: row.context_id,
            code: row.location_code,
            name: row.location_name ?? '',
          }
        : null,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    grantReason: row.grant_reason,
    status: roleAssignmentStatus(row, now),
  };
}
