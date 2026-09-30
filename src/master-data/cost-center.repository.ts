import { Injectable } from '@nestjs/common';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { type Database } from '@/supabase/database.types';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';
import { BaseRepository } from '@/common/repository/base.repository';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';

type CostCenterRow = TableRow<'cost_centers'>;
export type CreateCostCenterRpcArgs =
  Database['public']['Functions']['create_cost_center']['Args'];
export type UpdateCostCenterRpcArgs =
  Database['public']['Functions']['update_cost_center']['Args'];
export type DeactivateCostCenterRpcArgs =
  Database['public']['Functions']['deactivate_cost_center']['Args'];

/**
 * Truy cập bảng `cost_centers`. Danh mục nền toàn hệ thống (không theo phạm vi location) nên
 * KHÔNG dùng `applyLocationScope`. Tạo/sửa đi qua hàm rpc để cost center + audit ghi nguyên tử
 * (xem migration 02d). Cùng mẫu với `LocationRepository`.
 */
@Injectable()
export class CostCenterRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, CostCenterRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<PaginatedResult<CostCenterRow>> {
    const [from, to] = this.range(page, pageSize);
    // ⚠️ `status` tuỳ chọn: màn quản lý xem tất cả; ô chọn cost center của UC-MDM-01 chỉ lấy
    // ACTIVE (`?status=ACTIVE`). Lọc ở đây để không lộ cost center đã ngừng ra ô chọn.
    let query = this.db
      .from(SupabaseTable.COST_CENTERS)
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

  async findById(id: string): Promise<CostCenterRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.COST_CENTERS)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async createViaRpc(args: CreateCostCenterRpcArgs): Promise<CostCenterRow> {
    const { data, error } = await this.db.rpc('create_cost_center', args);
    if (error) {
      // 23505 = unique_violation → trùng mã (BR-MDM-01, EX.2).
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

  async updateViaRpc(args: UpdateCostCenterRpcArgs): Promise<CostCenterRow> {
    const { data, error } = await this.db.rpc('update_cost_center', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('COST_CENTER_NOT_FOUND')) {
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

  // Ngừng cost center (UC-MDM-03.AC.2). RPC 02h khoá dòng, kiểm lý do + "còn dùng" (còn location
  // đang dùng) rồi lật INACTIVE + ghi audit nguyên tử. Map message của hàm sang ErrorCode.
  async deactivateViaRpc(
    args: DeactivateCostCenterRpcArgs,
  ): Promise<CostCenterRow> {
    const { data, error } = await this.db.rpc('deactivate_cost_center', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('COST_CENTER_NOT_FOUND')) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      if (error.message.includes('CATALOG_ITEM_IN_USE')) {
        throw new AppException(ErrorCode.CATALOG_ITEM_IN_USE);
      }
      // Lý do hết hiệu lực/sai nhóm, hoặc chọn 'Khác' mà ô ghi thêm trống (UC-MDM-03 EX.1).
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
