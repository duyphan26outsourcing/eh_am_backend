import { Injectable } from '@nestjs/common';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import {
  CreateSupplierDto,
  DeactivateSupplierDto,
  UpdateSupplierDto,
} from './dto/supplier.dto';
import { toSupplierModel, type SupplierModel } from './supplier.model';
import {
  normalizeOptionalText,
  normalizeSupplierEmail,
  normalizeSupplierPhone,
  normalizeSupplierTaxId,
} from './supplier-normalization';
import { SupplierRepository } from './supplier.repository';

const SUPPLIER_FIELDS = [
  'name',
  'taxId',
  'contactName',
  'contactPhone',
  'contactEmail',
] as const;

@Injectable()
export class SuppliersService {
  constructor(private readonly repo: SupplierRepository) {}

  async list(
    page: number,
    pageSize: number,
    status?: string,
    query?: string,
  ): Promise<PaginatedResult<SupplierModel>> {
    const result = await this.repo.list(page, pageSize, status, query);
    return { ...result, items: result.items.map(toSupplierModel) };
  }

  async create(
    dto: CreateSupplierDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<SupplierModel> {
    const values = this.normalize(dto);
    const ctx = auditContextOf(req);
    const changes = diffFields(null, values, SUPPLIER_FIELDS);
    const row = await this.repo.createViaRpc({
      ...this.rpcValues(values),
      ...this.auditArgs(req, ctx, changes),
      p_command_key: commandKey,
    });
    return toSupplierModel(row);
  }

  async update(
    id: string,
    dto: UpdateSupplierDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<SupplierModel> {
    const current = await this.repo.findById(id);
    if (!current) throw new AppException(ErrorCode.NOT_FOUND);

    const values = this.normalize(dto);
    const before = {
      name: current.name,
      taxId: current.tax_id,
      contactName: current.contact_name,
      contactPhone: current.contact_phone,
      contactEmail: current.contact_email,
    };
    const ctx = auditContextOf(req);
    const changes = diffFields(before, values, SUPPLIER_FIELDS);
    const row = await this.repo.updateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      ...this.rpcValues(values),
      ...this.auditArgs(req, ctx, changes),
      p_command_key: commandKey,
    });
    return toSupplierModel(row);
  }

  async deactivate(
    id: string,
    dto: DeactivateSupplierDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<SupplierModel> {
    const current = await this.repo.findById(id);
    if (!current) throw new AppException(ErrorCode.NOT_FOUND);

    const ctx = auditContextOf(req);
    const changes = diffFields(
      { status: current.status },
      { status: 'INACTIVE' },
      ['status'],
    );
    const row = await this.repo.deactivateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_reason_code_id: dto.reasonCodeId,
      p_note: dto.note?.trim() ?? '',
      ...this.auditArgs(req, ctx, changes),
      p_command_key: commandKey,
    });
    return toSupplierModel(row);
  }

  private normalize(dto: CreateSupplierDto | UpdateSupplierDto) {
    return {
      name: dto.name.trim(),
      taxId: normalizeSupplierTaxId(dto.taxId),
      contactName: normalizeOptionalText(dto.contactName),
      contactPhone: normalizeSupplierPhone(dto.contactPhone),
      contactEmail: normalizeSupplierEmail(dto.contactEmail),
    };
  }

  private rpcValues(values: ReturnType<SuppliersService['normalize']>) {
    return {
      p_name: values.name,
      p_tax_id: values.taxId ?? '',
      p_contact_name: values.contactName ?? '',
      p_contact_phone: values.contactPhone ?? '',
      p_contact_email: values.contactEmail ?? '',
    };
  }

  private auditArgs(
    req: AuthRequest,
    ctx: ReturnType<typeof auditContextOf>,
    changes: ReturnType<typeof diffFields>,
  ) {
    return {
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    };
  }
}
