import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  type PaginatedResult,
  paginated,
} from '@/common/interfaces/paginated-result.interface';
import { BaseRepository } from '@/common/repository/base.repository';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { type Database } from '@/supabase/database.types';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseTable } from '@/supabase/supabase.define';
import {
  type EmployeeDirectoryRow,
  type ResendEmployeeInviteRow,
  type RoleAssignmentRow,
} from './employee.model';

export interface GrantRoleAssignmentsArgs {
  p_command_key: string;
  p_employee_id: string;
  p_role_code: string;
  p_context_type: string;
  p_context_ids: string[];
  p_effective_from: string;
  p_effective_to: string | null;
  p_reason: string;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface GrantedRoleRow {
  id: string;
  employee_id: string;
  role_code: string;
  context_type: string;
  context_id: string;
  effective_from: string;
  effective_to: string | null;
  grant_reason: string | null;
  created_at: string;
}

export interface RevokeRoleAssignmentArgs {
  p_command_key: string;
  p_assignment_id: string;
  p_employee_id: string;
  p_reason: string;
  p_actor_id: string;
  p_actor_label: string;
  p_request_id: string;
  p_ip: string | null | undefined;
  p_user_agent: string;
}

export interface RevokedRoleRow {
  id: string;
  employee_id: string;
  role_code: string;
  context_type: string;
  context_id: string;
  effective_from: string;
  effective_to: string | null;
  grant_reason: string | null;
  revoke_reason: string | null;
  revoked_by: string | null;
  created_at: string;
}

export interface ListEmployeesArgs {
  search: string | null;
  locationId: string | null;
  departmentId: string | null;
  roleCode: string | null;
  status: string | null;
  employmentType: string | null;
  page: number;
  pageSize: number;
}

type GeneratedCreateEmployeeArgs =
  Database['public']['Functions']['create_employee']['Args'];
type NullableCreateEmployeeFields =
  | 'p_department_id'
  | 'p_effective_from'
  | 'p_effective_to'
  | 'p_employment_type'
  | 'p_invite_expires_at'
  | 'p_invite_token_hash'
  | 'p_manager_id'
  | 'p_reason_code_id'
  | 'p_role_code'
  | 'p_role_context_id'
  | 'p_role_context_type'
  | 'p_start_date';
type CreateEmployeeArgs = Omit<
  GeneratedCreateEmployeeArgs,
  NullableCreateEmployeeFields
> &
  Record<NullableCreateEmployeeFields, string | null>;
type EmployeeRow =
  Database['public']['Functions']['create_employee']['Returns'];

@Injectable()
export class EmployeesRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, EmployeesRepository.name);
  }

  async createOptions() {
    const [locations, departments, managers, reasons] = await Promise.all([
      this.db
        .from(SupabaseTable.LOCATIONS)
        .select('id,code,name,type')
        .eq('status', 'ACTIVE')
        .neq('type', 'EXTERNAL')
        .order('code'),
      this.db
        .from(SupabaseTable.DEPARTMENTS)
        .select('id,code,name')
        .eq('status', 'ACTIVE')
        .order('code'),
      this.db
        .from(SupabaseTable.USER_PROFILES)
        .select('id,display_name,employee_code')
        .eq('status', 'ACTIVE')
        .order('display_name'),
      this.db
        .from(SupabaseTable.REASON_CODES)
        .select('id,code,label,is_freetext')
        .eq('status', 'ACTIVE')
        .eq('reason_group', 'ROLE_ASSIGNMENT')
        .order('code'),
    ]);
    for (const result of [locations, departments, managers, reasons]) {
      if (result.error) mapSupabasePostgrestError(result.error);
    }
    return {
      locations: locations.data ?? [],
      departments: departments.data ?? [],
      managers: managers.data ?? [],
      reasons: reasons.data ?? [],
    };
  }

  async listEmployees(
    args: ListEmployeesArgs,
  ): Promise<PaginatedResult<EmployeeDirectoryRow>> {
    // ⚠️ Supabase CLI không mã hoá nullability của tham số SQL, nên type sinh ra khai các tham
    // số lọc là `string` (không null). Postgres nhận NULL cho các tham số này (bỏ lọc tương ứng);
    // giữ workaround cast ở đúng biên rpc, giống `create_employee`.
    const rpcArgs = {
      p_search: args.search,
      p_location_id: args.locationId,
      p_department_id: args.departmentId,
      p_role_code: args.roleCode,
      p_status: args.status,
      p_employment_type: args.employmentType,
      p_limit: args.pageSize,
      p_offset: (args.page - 1) * args.pageSize,
    } as Database['public']['Functions']['list_employees']['Args'];
    const { data, error } = await this.db.rpc('list_employees', rpcArgs);
    if (error) mapSupabasePostgrestError(error);
    const rows = (data ?? []) as Array<
      EmployeeDirectoryRow & { total_count: number }
    >;
    // ⚠️ `total_count` là `count(*) over()` của tập đã lọc, giống nhau trên mọi dòng của trang.
    // Trang rỗng (không khớp) → không có dòng nào → tổng 0 (EX.1).
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    // `total_count` còn dính trên mỗi dòng nhưng không bao giờ ra API: service map từng dòng
    // qua `toEmployeeListItemModel`, chỉ nhặt các trường đã khai.
    return paginated(rows, total, args.page, args.pageSize);
  }

  async findLocation(id: string) {
    const { data, error } = await this.db
      .from(SupabaseTable.LOCATIONS)
      .select('id,type,status')
      .eq('id', id)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    return data;
  }

  async findDepartment(id: string) {
    const { data, error } = await this.db
      .from(SupabaseTable.DEPARTMENTS)
      .select('id,status')
      .eq('id', id)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    return data;
  }

  async findManager(id: string) {
    const { data, error } = await this.db
      .from(SupabaseTable.USER_PROFILES)
      .select('id,status')
      .eq('id', id)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    return data;
  }

  async findReason(id: string) {
    const { data, error } = await this.db
      .from(SupabaseTable.REASON_CODES)
      .select('id,status,reason_group,is_freetext')
      .eq('id', id)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    return data;
  }

  async findReceipt(
    commandKey: string,
    actorId: string,
  ): Promise<EmployeeRow | null> {
    const { data, error } = await this.db
      .from(SupabaseTable.EMPLOYEE_COMMAND_RECEIPTS)
      .select('actor_id,operation,result_row,completed_at')
      .eq('command_key', commandKey)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    if (!data) return null;
    if (data.actor_id !== actorId || data.operation !== 'CREATE')
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    return data.completed_at && data.result_row
      ? (data.result_row as EmployeeRow)
      : null;
  }

  async findResendReceipt(
    commandKey: string,
    actorId: string,
    employeeId: string,
  ): Promise<ResendEmployeeInviteRow | null> {
    const { data, error } = await this.db
      .from(SupabaseTable.EMPLOYEE_COMMAND_RECEIPTS)
      .select(
        'actor_id,employee_id,operation,result_row,completed_at,delivery_status',
      )
      .eq('command_key', commandKey)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    if (!data) return null;
    if (
      data.actor_id !== actorId ||
      data.employee_id !== employeeId ||
      data.operation !== 'RESEND_INVITE'
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    if (!data.completed_at || !data.result_row) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    return {
      ...(data.result_row as unknown as ResendEmployeeInviteRow),
      delivery_status: data.delivery_status as 'PENDING' | 'SENT' | 'FAILED',
      is_replay: true,
    };
  }

  async resendInviteViaRpc(args: {
    p_command_key: string;
    p_employee_id: string;
    p_invite_token_hash: string;
    p_invite_expires_at: string;
    p_actor_id: string;
    p_actor_label: string;
    p_request_id: string;
    p_ip: string | null | undefined;
    p_user_agent: string;
  }): Promise<ResendEmployeeInviteRow> {
    const { data, error } = await this.db.rpc('resend_employee_invite', args);
    if (error) this.handleResendRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as ResendEmployeeInviteRow;
  }

  async markInviteDelivery(
    commandKey: string,
    status: 'SENT' | 'FAILED',
    audit: {
      actorId: string;
      actorLabel: string;
      requestId: string;
      ipAddress: string | null | undefined;
      userAgent: string;
    },
  ): Promise<void> {
    const { error } = await this.db.rpc('complete_resend_invite_delivery', {
      p_command_key: commandKey,
      p_delivery_status: status,
      p_actor_id: audit.actorId,
      p_actor_label: audit.actorLabel,
      p_request_id: audit.requestId,
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent,
    });
    if (error) this.handleResendRpcError(error.message);
  }

  async findAccessProfile(id: string): Promise<{
    id: string;
    display_name: string;
    employee_code: string | null;
    status: string;
  } | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.USER_PROFILES)
        .select('id,display_name,employee_code,status')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async findRoleAssignments(employeeId: string): Promise<RoleAssignmentRow[]> {
    const rows = this.many(
      await this.db
        .from(SupabaseTable.CONTEXT_ROLE_ASSIGNMENTS)
        .select(
          'id,role_code,context_type,context_id,effective_from,effective_to,grant_reason,revoked_by',
        )
        .eq('subject_type', 'USER')
        .eq('subject_id', employeeId)
        .order('effective_from', { ascending: false }),
    );
    // ⚠️ `context_id` của vai trò LOCATION không có FK tới `locations` (bảng thuộc M02), nên
    // không embed được qua PostgREST. Nạp tên location trong một truy vấn phụ rồi ghép.
    const locationIds = [
      ...new Set(
        rows
          .filter((row) => row.context_type === 'LOCATION')
          .map((row) => row.context_id),
      ),
    ];
    const locationsById = new Map<string, { code: string; name: string }>();
    if (locationIds.length > 0) {
      const locations = this.many(
        await this.db
          .from(SupabaseTable.LOCATIONS)
          .select('id,code,name')
          .in('id', locationIds),
      );
      for (const loc of locations) {
        locationsById.set(loc.id, { code: loc.code, name: loc.name });
      }
    }
    return rows.map((row) => ({
      id: row.id,
      role_code: row.role_code,
      context_type: row.context_type,
      context_id: row.context_id,
      effective_from: row.effective_from,
      effective_to: row.effective_to,
      grant_reason: row.grant_reason,
      revoked_by: row.revoked_by,
      location_code: locationsById.get(row.context_id)?.code ?? null,
      location_name: locationsById.get(row.context_id)?.name ?? null,
    }));
  }

  async listActiveLocations(): Promise<
    Array<{ id: string; code: string; name: string }>
  > {
    return this.many(
      await this.db
        .from(SupabaseTable.LOCATIONS)
        .select('id,code,name')
        .eq('status', 'ACTIVE')
        .neq('type', 'EXTERNAL')
        .order('code'),
    );
  }

  async grantRolesViaRpc(
    args: GrantRoleAssignmentsArgs,
  ): Promise<GrantedRoleRow[]> {
    const { data, error } = await this.db.rpc(
      'grant_role_assignments',
      args as Database['public']['Functions']['grant_role_assignments']['Args'],
    );
    if (error) this.handleGrantRpcError(error.message);
    return (data ?? []) as unknown as GrantedRoleRow[];
  }

  async revokeRoleViaRpc(
    args: RevokeRoleAssignmentArgs,
  ): Promise<RevokedRoleRow> {
    // ⚠️ Cast chọn overload rpc có kiểu của supabase-js. Bỏ cast thì overload rơi về bản generic
    // trả `any` (mất kiểu `data`), nên eslint báo "thừa" là sai ở đây — TS cần cast để suy ra kiểu.
    const { data, error } = await this.db.rpc(
      'revoke_role_assignment',
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      args as Database['public']['Functions']['revoke_role_assignment']['Args'],
    );
    if (error) this.handleRevokeRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return data as unknown as RevokedRoleRow;
  }

  async createViaRpc(args: CreateEmployeeArgs): Promise<EmployeeRow> {
    // Supabase CLI does not encode SQL function-argument nullability. Postgres accepts
    // NULL for these optional parameters; keep the generated-type workaround at this boundary.
    const { data, error } = await this.db.rpc(
      'create_employee',
      args as GeneratedCreateEmployeeArgs,
    );
    if (error) this.handleRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.ACCOUNT_CREATE_FAILED);
    return data;
  }

  private handleRpcError(message: string): never {
    if (message.includes('EMAIL_ALREADY_REGISTERED')) {
      throw new AppException(ErrorCode.EMAIL_ALREADY_REGISTERED);
    }
    if (message.includes('EMPLOYEE_CODE_TAKEN')) {
      throw new AppException(ErrorCode.EMPLOYEE_CODE_TAKEN);
    }
    if (message.includes('INVALID_SUPERIOR')) {
      throw new AppException(ErrorCode.INVALID_SUPERIOR);
    }
    if (
      message.includes('ROLE_NOT_ASSIGNABLE') ||
      message.includes('ROLE_CONTEXT_INVALID')
    ) {
      throw new AppException(ErrorCode.ROLE_NOT_ASSIGNABLE);
    }
    if (message.includes('REASON_'))
      throw new AppException(ErrorCode.REASON_INVALID);
    if (
      message.includes('LOCATION_') ||
      message.includes('DEPARTMENT_') ||
      message.includes('ACTIVATION_METHOD') ||
      message.includes('INVITE_') ||
      message.includes('ROLE_FIELDS') ||
      message.includes('ROLE_EFFECTIVE') ||
      message.includes('IDEMPOTENCY')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.ACCOUNT_CREATE_FAILED);
  }

  private handleResendRpcError(message: string): never {
    if (message.includes('ACCOUNT_STATE_CONFLICT')) {
      throw new AppException(ErrorCode.ACCOUNT_STATE_CONFLICT);
    }
    if (message.includes('AUDIT_WRITE_FAILED')) {
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
    if (message.includes('IDEMPOTENCY_IN_PROGRESS')) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    if (
      message.includes('IDEMPOTENCY_KEY_REUSED') ||
      message.includes('INVITE_INVALID')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  private handleGrantRpcError(message: string): never {
    if (message.includes('ROLE_NOT_ASSIGNABLE')) {
      throw new AppException(ErrorCode.ROLE_NOT_ASSIGNABLE);
    }
    if (message.includes('LOCATION_STAFF_OTHER_SCOPE')) {
      throw new AppException(ErrorCode.LOCATION_STAFF_SCOPE_CONFLICT);
    }
    if (message.includes('ROLE_ASSIGNMENT_OVERLAP')) {
      throw new AppException(ErrorCode.ROLE_ASSIGNMENT_EXISTS);
    }
    if (message.includes('LOCATION_NOT_ACTIVE')) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }
    if (message.includes('REASON_REQUIRED')) {
      throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
    }
    if (message.includes('AUDIT_WRITE_FAILED')) {
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
    if (message.includes('IDEMPOTENCY_IN_PROGRESS')) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    if (
      message.includes('ROLE_CONTEXT_INVALID') ||
      message.includes('EFFECTIVE_WINDOW_INVALID') ||
      message.includes('LOCATION_STAFF_SINGLE_SCOPE') ||
      message.includes('IDEMPOTENCY_KEY_REUSED') ||
      message.includes('EMPLOYEE_NOT_ACTIVE')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  private handleRevokeRpcError(message: string): never {
    // ⚠️ Dòng không tồn tại hoặc không thuộc nhân viên này → coi như không tìm thấy (404), không
    // tiết lộ dòng của người khác.
    if (message.includes('ASSIGNMENT_NOT_FOUND')) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }
    if (message.includes('ROLE_NOT_REVOCABLE')) {
      throw new AppException(ErrorCode.ROLE_NOT_REVOCABLE);
    }
    // Trigger `tg_role_assignment_close_only` và tiền kiểm "đã đóng / quá hạn" đều dùng mã này.
    if (message.includes('HISTORY_IMMUTABLE')) {
      throw new AppException(ErrorCode.HISTORY_IMMUTABLE);
    }
    if (message.includes('REASON_REQUIRED')) {
      throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
    }
    if (message.includes('AUDIT_WRITE_FAILED')) {
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
    if (message.includes('IDEMPOTENCY_IN_PROGRESS')) {
      throw new AppException(ErrorCode.REQUEST_TIMEOUT);
    }
    if (message.includes('IDEMPOTENCY_KEY_REUSED')) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }
}
