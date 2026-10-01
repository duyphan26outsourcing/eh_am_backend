import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { BaseRepository } from '@/common/repository/base.repository';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { type Database } from '@/supabase/database.types';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';
import {
  type AvailableRepairLocationModel,
  type RepairVendorListRow,
} from './repair-vendor.model';

type RepairVendorRow = TableRow<'repair_vendors'>;
type CreateArgs =
  Database['public']['Functions']['create_repair_vendor']['Args'];
type UpdateArgs =
  Database['public']['Functions']['update_repair_vendor']['Args'];
type DeactivateArgs =
  Database['public']['Functions']['deactivate_repair_vendor']['Args'];

@Injectable()
export class RepairVendorRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, RepairVendorRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
    status?: string,
    query?: string,
  ): Promise<PaginatedResult<RepairVendorListRow>> {
    const [from, to] = this.range(page, pageSize);
    let request = this.db
      .from(SupabaseTable.REPAIR_VENDORS)
      .select(
        '*, external_location:locations!repair_vendors_external_location_id_fkey(code,name,status,type)',
        { count: 'exact' },
      );
    if (status) request = request.eq('status', status);
    const term = query?.trim();
    if (term) {
      const safe = term.replace(/[,%()]/g, ' ');
      request = request.or(
        `name.ilike.%${safe}%,contact_name.ilike.%${safe}%,contact_phone.ilike.%${safe}%,contact_email.ilike.%${safe}%`,
      );
    }
    return this.page(
      await request.order('created_at', { ascending: false }).range(from, to),
      page,
      pageSize,
    );
  }

  async findById(id: string): Promise<RepairVendorRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.REPAIR_VENDORS)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async availableLocations(
    includeLocationId?: string,
  ): Promise<AvailableRepairLocationModel[]> {
    const { data: assigned, error: assignedError } = await this.db
      .from(SupabaseTable.REPAIR_VENDORS)
      .select('external_location_id');
    if (assignedError) mapSupabasePostgrestError(assignedError);
    const assignedIds = (assigned ?? [])
      .map((row) => row.external_location_id)
      .filter((id) => id !== includeLocationId);

    let request = this.db
      .from(SupabaseTable.LOCATIONS)
      .select('id,code,name')
      .eq('type', 'EXTERNAL')
      .eq('status', 'ACTIVE')
      .order('code');
    if (assignedIds.length)
      request = request.not('id', 'in', `(${assignedIds.join(',')})`);
    const { data, error } = await request;
    if (error) mapSupabasePostgrestError(error);
    return data ?? [];
  }

  async createViaRpc(args: CreateArgs): Promise<RepairVendorRow> {
    const { data, error } = await this.db.rpc('create_repair_vendor', args);
    if (error) this.handleRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.INTERNAL_ERROR);
    return data;
  }

  async updateViaRpc(args: UpdateArgs): Promise<RepairVendorRow> {
    const { data, error } = await this.db.rpc('update_repair_vendor', args);
    if (error) this.handleRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.NOT_FOUND);
    return data;
  }

  async deactivateViaRpc(args: DeactivateArgs): Promise<RepairVendorRow> {
    const { data, error } = await this.db.rpc('deactivate_repair_vendor', args);
    if (error) this.handleRpcError(error.message);
    if (!data) throw new AppException(ErrorCode.NOT_FOUND);
    return data;
  }

  private handleRpcError(message: string): never {
    if (message.includes('VERSION_CONFLICT')) {
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    }
    if (message.includes('REPAIR_VENDOR_NOT_FOUND')) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    if (message.includes('CATALOG_ITEM_IN_USE')) {
      throw new AppException(ErrorCode.CATALOG_ITEM_IN_USE);
    }
    if (message.includes('EXTERNAL_LOCATION_UNAVAILABLE')) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }
    if (message.includes('EXTERNAL_LOCATION_TAKEN')) {
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    }
    if (
      message.includes('REASON_INVALID') ||
      message.includes('REASON_NOTE_REQUIRED') ||
      message.includes('IDEMPOTENCY_KEY_REUSED')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
    throw new AppException(ErrorCode.INTERNAL_ERROR);
  }
}
