import { Injectable } from '@nestjs/common';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { type Database } from '@/supabase/database.types';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';
import { BaseRepository } from '@/common/repository/base.repository';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';

type DepartmentRow = TableRow<'departments'>;
export type CreateDepartmentRpcArgs =
  Database['public']['Functions']['create_department']['Args'];
export type UpdateDepartmentRpcArgs =
  Database['public']['Functions']['update_department']['Args'];

/**
 * Truy cập bảng `departments`. Danh mục nền toàn hệ thống (không theo phạm vi location) nên
 * KHÔNG dùng `applyLocationScope`. Tạo/sửa qua rpc để phòng ban + audit ghi nguyên tử (02e).
 * Cùng mẫu với `CostCenterRepository`.
 */
@Injectable()
export class DepartmentRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, DepartmentRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<PaginatedResult<DepartmentRow>> {
    const [from, to] = this.range(page, pageSize);
    let query = this.db
      .from(SupabaseTable.DEPARTMENTS)
      .select('*', { count: 'exact' });
    if (status) {
      query = query.eq('status', status);
    }
    return this.page(
      await query.order('created_at', { ascending: false }).range(from, to),
      page,
      pageSize,
    );
  }

  async findById(id: string): Promise<DepartmentRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.DEPARTMENTS)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async createViaRpc(args: CreateDepartmentRpcArgs): Promise<DepartmentRow> {
    const { data, error } = await this.db.rpc('create_department', args);
    if (error) {
      if (error.code === '23505') {
        throw new AppException(ErrorCode.DUPLICATE_RECORD);
      }
      mapSupabasePostgrestError(error);
    }
    if (!data) {
      throw new AppException(ErrorCode.INTERNAL_ERROR);
    }
    return data;
  }

  async updateViaRpc(args: UpdateDepartmentRpcArgs): Promise<DepartmentRow> {
    const { data, error } = await this.db.rpc('update_department', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('DEPARTMENT_NOT_FOUND')) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      if (error.code === '23505') {
        throw new AppException(ErrorCode.DUPLICATE_RECORD);
      }
      mapSupabasePostgrestError(error);
    }
    if (!data) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return data;
  }
}
