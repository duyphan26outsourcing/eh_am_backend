import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { BaseRepository } from '@/common/repository/base.repository';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { type Database } from '@/supabase/database.types';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseTable } from '@/supabase/supabase.define';

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
      .select('actor_id,result_row,completed_at')
      .eq('command_key', commandKey)
      .maybeSingle();
    if (error) mapSupabasePostgrestError(error);
    if (!data) return null;
    if (data.actor_id !== actorId)
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    return data.completed_at && data.result_row
      ? (data.result_row as EmployeeRow)
      : null;
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
}
