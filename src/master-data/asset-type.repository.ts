import { Injectable } from '@nestjs/common';
import { type PostgrestError } from '@supabase/supabase-js';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { type Database } from '@/supabase/database.types';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';
import { BaseRepository } from '@/common/repository/base.repository';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';

type AssetTypeRow = TableRow<'asset_types'>;
export type CreateAssetTypeGroupRpcArgs =
  Database['public']['Functions']['create_asset_type_group']['Args'];
export type CreateAssetTypeRpcArgs =
  Database['public']['Functions']['create_asset_type']['Args'];
export type UpdateAssetTypeGroupRpcArgs =
  Database['public']['Functions']['update_asset_type_group']['Args'];
export type UpdateAssetTypeRpcArgs =
  Database['public']['Functions']['update_asset_type']['Args'];
export type DeactivateAssetTypeRpcArgs =
  Database['public']['Functions']['deactivate_asset_type']['Args'];

/**
 * Truy cập bảng `asset_types` (cây 2 cấp). Danh mục nền toàn hệ thống nên KHÔNG dùng
 * `applyLocationScope`. Tạo/sửa/ngừng đi qua rpc (02j) để thay đổi + audit ghi nguyên tử.
 */
@Injectable()
export class AssetTypeRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, AssetTypeRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<PaginatedResult<AssetTypeRow>> {
    const [from, to] = this.range(page, pageSize);
    let query = this.db
      .from(SupabaseTable.ASSET_TYPES)
      .select('*', { count: 'exact' });
    if (status) {
      query = query.eq('status', status);
    }
    // Nhóm (parent_id null) đứng trước loại con, rồi theo tên — để client dựng cây gọn.
    return this.page(
      await query
        .order('parent_id', { ascending: true, nullsFirst: true })
        .order('name', { ascending: true })
        .range(from, to),
      page,
      pageSize,
    );
  }

  async findById(id: string): Promise<AssetTypeRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.ASSET_TYPES)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async createGroupViaRpc(
    args: CreateAssetTypeGroupRpcArgs,
  ): Promise<AssetTypeRow> {
    const { data, error } = await this.db.rpc('create_asset_type_group', args);
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

  async createTypeViaRpc(args: CreateAssetTypeRpcArgs): Promise<AssetTypeRow> {
    const { data, error } = await this.db.rpc('create_asset_type', args);
    if (error) {
      if (error.code === '23505') {
        throw new AppException(ErrorCode.DUPLICATE_RECORD);
      }
      // Nhóm cha không tồn tại / đã ngừng / không phải nhóm (UC-MDM-04 EX.1).
      if (error.message.includes('PARENT_INVALID')) {
        throw new AppException(ErrorCode.VALIDATION_FAILED);
      }
      mapSupabasePostgrestError(error);
    }
    if (!data) {
      throw new AppException(ErrorCode.INTERNAL_ERROR);
    }
    return data;
  }

  async updateGroupViaRpc(
    args: UpdateAssetTypeGroupRpcArgs,
  ): Promise<AssetTypeRow> {
    const { data, error } = await this.db.rpc('update_asset_type_group', args);
    return this.mapUpdateResult(data, error);
  }

  async updateTypeViaRpc(args: UpdateAssetTypeRpcArgs): Promise<AssetTypeRow> {
    const { data, error } = await this.db.rpc('update_asset_type', args);
    return this.mapUpdateResult(data, error);
  }

  async deactivateViaRpc(
    args: DeactivateAssetTypeRpcArgs,
  ): Promise<AssetTypeRow> {
    const { data, error } = await this.db.rpc('deactivate_asset_type', args);
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('ASSET_TYPE_NOT_FOUND')) {
        throw new AppException(ErrorCode.NOT_FOUND);
      }
      if (error.message.includes('CATALOG_ITEM_IN_USE')) {
        throw new AppException(ErrorCode.CATALOG_ITEM_IN_USE);
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

  /** Map lỗi chung cho hai hàm sửa (nhóm + loại): version / not-found / trùng mã. */
  private mapUpdateResult(
    data: AssetTypeRow | null,
    error: PostgrestError | null,
  ): AssetTypeRow {
    if (error) {
      if (error.message.includes('VERSION_CONFLICT')) {
        throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
      }
      if (error.message.includes('ASSET_TYPE_NOT_FOUND')) {
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
