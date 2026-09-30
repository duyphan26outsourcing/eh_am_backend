import { Injectable } from '@nestjs/common';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { type Database } from '@/supabase/database.types';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';
import { BaseRepository } from '@/common/repository/base.repository';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';

type ReasonCodeRow = TableRow<'reason_codes'>;
export type CreateReasonCodeRpcArgs =
  Database['public']['Functions']['create_reason_code']['Args'];
export type UpdateReasonCodeRpcArgs =
  Database['public']['Functions']['update_reason_code']['Args'];
export type DeactivateReasonCodeRpcArgs =
  Database['public']['Functions']['deactivate_reason_code']['Args'];

/**
 * Truy cập bảng `reason_codes`. Danh mục nền toàn hệ thống nên KHÔNG dùng `applyLocationScope`.
 * Tạo/sửa qua rpc để lý do + audit ghi nguyên tử (02f). Cùng mẫu các danh mục M02 khác.
 */
@Injectable()
export class ReasonCodeRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, ReasonCodeRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
    reasonGroup?: string,
    status?: string,
  ): Promise<PaginatedResult<ReasonCodeRow>> {
    const [from, to] = this.range(page, pageSize);
    let query = this.db
      .from(SupabaseTable.REASON_CODES)
      .select('*', { count: 'exact' });
    if (reasonGroup) {
      query = query.eq('reason_group', reasonGroup);
    }
    if (status) {
      query = query.eq('status', status);
    }
    // Sắp theo nhóm rồi mã cho danh sách gom nhóm dễ đọc.
    return this.page(
      await query
        .order('reason_group', { ascending: true })
        .order('code', { ascending: true })
        .range(from, to),
      page,
      pageSize,
    );
  }

  async findById(id: string): Promise<ReasonCodeRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.REASON_CODES)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async createViaRpc(args: CreateReasonCodeRpcArgs): Promise<ReasonCodeRow> {
    const { data, error } = await this.db.rpc('create_reason_code', args);
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

  async updateViaRpc(args: UpdateReasonCodeRpcArgs): Promise<ReasonCodeRow> {
    const { data, error } = await this.db.rpc('update_reason_code', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('REASON_CODE_NOT_FOUND')) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      mapSupabasePostgrestError(error);
    }
    if (!data) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return data;
  }

  // Ngừng lý do (UC-MDM-07.AC.2). RPC 02h khoá dòng, kiểm lý do ngừng (còn hoạt động + đúng
  // nhóm) rồi lật INACTIVE + ghi audit. Chặn 'Khác'/tự-tham-chiếu đã làm ở service.
  async deactivateViaRpc(
    args: DeactivateReasonCodeRpcArgs,
  ): Promise<ReasonCodeRow> {
    const { data, error } = await this.db.rpc('deactivate_reason_code', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('REASON_CODE_NOT_FOUND')) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      if (
        error.message.includes('REASON_INVALID') ||
        error.message.includes('REASON_NOTE_REQUIRED')
      ) {
        throw new AppException(ErrorCode.VALIDATION_FAILED);
      }
      mapSupabasePostgrestError(error);
    }
    if (!data) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return data;
  }
}
