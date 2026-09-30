import { Injectable } from '@nestjs/common';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { type Database } from '@/supabase/database.types';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';
import { BaseRepository } from '@/common/repository/base.repository';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';

type LocationRow = TableRow<'locations'>;
export type CreateLocationRpcArgs =
  Database['public']['Functions']['create_location']['Args'];
export type UpdateLocationRpcArgs =
  Database['public']['Functions']['update_location']['Args'];

/**
 * Truy cập bảng `locations`. Danh mục nền là dữ liệu toàn hệ thống (không theo phạm vi
 * location), nên KHÔNG dùng `applyLocationScope`. Tạo/sửa đi qua hàm rpc để location + audit
 * ghi nguyên tử (xem migration 02b).
 */
@Injectable()
export class LocationRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, LocationRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<LocationRow>> {
    const [from, to] = this.range(page, pageSize);
    return this.page(
      await this.db
        .from(SupabaseTable.LOCATIONS)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to),
      page,
      pageSize,
    );
  }

  async findById(id: string): Promise<LocationRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.LOCATIONS)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  /** cost center Đang hoạt động? Dùng kiểm BR-MDM-04 / UC-MDM-01.EX.1 trước khi ghi. */
  async activeCostCenterExists(id: string): Promise<boolean> {
    const row = this.maybe(
      await this.db
        .from(SupabaseTable.COST_CENTERS)
        .select('id')
        .eq('id', id)
        .eq('status', 'ACTIVE')
        .maybeSingle(),
    );
    return row !== null;
  }

  async createViaRpc(args: CreateLocationRpcArgs): Promise<LocationRow> {
    const { data, error } = await this.db.rpc('create_location', args);
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

  async updateViaRpc(args: UpdateLocationRpcArgs): Promise<LocationRow> {
    const { data, error } = await this.db.rpc('update_location', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('LOCATION_NOT_FOUND')) {
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
