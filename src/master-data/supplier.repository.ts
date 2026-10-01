import { Injectable } from '@nestjs/common';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { BaseRepository } from '@/common/repository/base.repository';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { type Database } from '@/supabase/database.types';
import { SupabaseTable, type TableRow } from '@/supabase/supabase.define';

type SupplierRow = TableRow<'suppliers'>;
export type CreateSupplierRpcArgs =
  Database['public']['Functions']['create_supplier']['Args'];
export type UpdateSupplierRpcArgs =
  Database['public']['Functions']['update_supplier']['Args'];
export type DeactivateSupplierRpcArgs =
  Database['public']['Functions']['deactivate_supplier']['Args'];

@Injectable()
export class SupplierRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, SupplierRepository.name);
  }

  async list(
    page: number,
    pageSize: number,
    status?: string,
    query?: string,
  ): Promise<PaginatedResult<SupplierRow>> {
    const [from, to] = this.range(page, pageSize);
    let request = this.db
      .from(SupabaseTable.SUPPLIERS)
      .select('*', { count: 'exact' });
    if (status) request = request.eq('status', status);
    const term = query?.trim();
    if (term) {
      const safe = term.replace(/[,%()]/g, ' ');
      request = request.or(
        `name.ilike.%${safe}%,tax_id.ilike.%${safe}%,contact_name.ilike.%${safe}%,contact_phone.ilike.%${safe}%,contact_email.ilike.%${safe}%`,
      );
    }
    return this.page(
      await request.order('created_at', { ascending: false }).range(from, to),
      page,
      pageSize,
    );
  }

  async findById(id: string): Promise<SupplierRow | null> {
    return this.maybe(
      await this.db
        .from(SupabaseTable.SUPPLIERS)
        .select('*')
        .eq('id', id)
        .maybeSingle(),
    );
  }

  async createViaRpc(args: CreateSupplierRpcArgs): Promise<SupplierRow> {
    const { data, error } = await this.db.rpc('create_supplier', args);
    if (error) {
      if (error.code === '23505') {
        const existingName = args.p_tax_id
          ? await this.findNameByTaxId(args.p_tax_id)
          : null;
        throw new AppException(
          existingName
            ? ErrorCode.SUPPLIER_TAX_ID_TAKEN
            : ErrorCode.DUPLICATE_RECORD,
          existingName ? { existingName } : undefined,
        );
      }
      this.mapRpcError(error.message);
      mapSupabasePostgrestError(error);
    }
    if (!data) throw new AppException(ErrorCode.INTERNAL_ERROR);
    return data;
  }

  async updateViaRpc(args: UpdateSupplierRpcArgs): Promise<SupplierRow> {
    const { data, error } = await this.db.rpc('update_supplier', args);
    if (error) {
      if (error.code === '23505') {
        const existingName = args.p_tax_id
          ? await this.findNameByTaxId(args.p_tax_id)
          : null;
        throw new AppException(
          existingName
            ? ErrorCode.SUPPLIER_TAX_ID_TAKEN
            : ErrorCode.DUPLICATE_RECORD,
          existingName ? { existingName } : undefined,
        );
      }
      this.mapRpcError(error.message);
      mapSupabasePostgrestError(error);
    }
    if (!data) throw new AppException(ErrorCode.NOT_FOUND);
    return data;
  }

  async deactivateViaRpc(
    args: DeactivateSupplierRpcArgs,
  ): Promise<SupplierRow> {
    const { data, error } = await this.db.rpc('deactivate_supplier', args);
    if (error) {
      this.mapRpcError(error.message);
      mapSupabasePostgrestError(error);
    }
    if (!data) throw new AppException(ErrorCode.NOT_FOUND);
    return data;
  }

  private async findNameByTaxId(taxId: string): Promise<string | null> {
    const row = this.maybe<SupplierRow>(
      await this.db
        .from(SupabaseTable.SUPPLIERS)
        .select('*')
        .eq('tax_id', taxId)
        .maybeSingle(),
    );
    return row?.name ?? null;
  }

  private mapRpcError(message: string): void {
    if (message.includes('VERSION_CONFLICT')) {
      throw new AppException(ErrorCode.RECORD_VERSION_CONFLICT);
    }
    if (message.includes('SUPPLIER_NOT_FOUND')) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    if (
      message.includes('REASON_INVALID') ||
      message.includes('REASON_NOTE_REQUIRED') ||
      message.includes('IDEMPOTENCY_KEY_REUSED')
    ) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
    }
  }
}
