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

export interface CreatedEmployeeModel {
  id: string;
  displayName: string;
  workEmail: string;
  employeeCode: string | null;
  status: string;
  activationMethod: string;
  invitationEmailSent: boolean;
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
