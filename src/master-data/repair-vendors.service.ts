import { Injectable } from '@nestjs/common';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import {
  CreateRepairVendorDto,
  DeactivateRepairVendorDto,
  UpdateRepairVendorDto,
} from './dto/repair-vendor.dto';
import {
  normalizeRepairVendorEmail,
  normalizeRepairVendorPhone,
  normalizeRepairVendorText,
  normalizeServiceTypes,
} from './repair-vendor-normalization';
import {
  type AvailableRepairLocationModel,
  type RepairVendorModel,
  toRepairVendorModel,
} from './repair-vendor.model';
import { RepairVendorRepository } from './repair-vendor.repository';

const FIELDS = [
  'name',
  'contactName',
  'contactPhone',
  'contactEmail',
  'serviceTypes',
] as const;

@Injectable()
export class RepairVendorsService {
  constructor(private readonly repo: RepairVendorRepository) {}

  async list(
    page: number,
    pageSize: number,
    status?: string,
    query?: string,
  ): Promise<PaginatedResult<RepairVendorModel>> {
    const result = await this.repo.list(page, pageSize, status, query);
    return { ...result, items: result.items.map(toRepairVendorModel) };
  }

  async availableLocations(
    repairVendorId?: string,
  ): Promise<AvailableRepairLocationModel[]> {
    const vendor = repairVendorId
      ? await this.repo.findById(repairVendorId)
      : null;
    if (repairVendorId && !vendor) throw new AppException(ErrorCode.NOT_FOUND);
    return this.repo.availableLocations(vendor?.external_location_id);
  }

  async create(
    dto: CreateRepairVendorDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<RepairVendorModel> {
    const values = this.normalize(dto);
    const ctx = auditContextOf(req);
    const changes = diffFields(
      null,
      { ...values, externalLocationId: dto.externalLocationId },
      [...FIELDS, 'externalLocationId'],
    );
    const row = await this.repo.createViaRpc({
      ...this.rpcValues(values),
      p_external_location_id: dto.externalLocationId,
      p_command_key: commandKey,
      ...this.auditArgs(req, ctx, changes),
    });
    return toRepairVendorModel(row);
  }

  async update(
    id: string,
    dto: UpdateRepairVendorDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<RepairVendorModel> {
    const current = await this.repo.findById(id);
    if (!current) throw new AppException(ErrorCode.NOT_FOUND);
    const values = this.normalize(dto);
    const before = {
      name: current.name,
      contactName: current.contact_name,
      contactPhone: current.contact_phone,
      contactEmail: current.contact_email,
      serviceTypes: current.service_types,
    };
    const ctx = auditContextOf(req);
    const row = await this.repo.updateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_command_key: commandKey,
      ...this.rpcValues(values),
      ...this.auditArgs(req, ctx, diffFields(before, values, FIELDS)),
    });
    return toRepairVendorModel(row);
  }

  async deactivate(
    id: string,
    dto: DeactivateRepairVendorDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<RepairVendorModel> {
    const current = await this.repo.findById(id);
    if (!current) throw new AppException(ErrorCode.NOT_FOUND);
    const ctx = auditContextOf(req);
    const statusChanges = diffFields(
      { status: current.status },
      { status: 'INACTIVE' },
      ['status'],
    );
    const audit = this.baseAuditArgs(req, ctx);
    const row = await this.repo.deactivateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_reason_code_id: dto.reasonCodeId,
      p_note: dto.note?.trim() ?? '',
      p_command_key: commandKey,
      p_vendor_changes: statusChanges ?? {},
      p_location_changes: statusChanges ?? {},
      ...audit,
    });
    return toRepairVendorModel(row);
  }

  private normalize(dto: CreateRepairVendorDto | UpdateRepairVendorDto) {
    return {
      name: dto.name.trim(),
      contactName: normalizeRepairVendorText(dto.contactName),
      contactPhone: normalizeRepairVendorPhone(dto.contactPhone),
      contactEmail: normalizeRepairVendorEmail(dto.contactEmail),
      serviceTypes: normalizeServiceTypes(dto.serviceTypes),
    };
  }

  private rpcValues(values: ReturnType<RepairVendorsService['normalize']>) {
    return {
      p_name: values.name,
      p_contact_name: values.contactName ?? '',
      p_contact_phone: values.contactPhone ?? '',
      p_contact_email: values.contactEmail ?? '',
      p_service_types: values.serviceTypes,
    };
  }

  private auditArgs(
    req: AuthRequest,
    ctx: ReturnType<typeof auditContextOf>,
    changes: ReturnType<typeof diffFields>,
  ) {
    return {
      ...this.baseAuditArgs(req, ctx),
      p_changes: changes ?? {},
    };
  }

  private baseAuditArgs(
    req: AuthRequest,
    ctx: ReturnType<typeof auditContextOf>,
  ) {
    return {
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    };
  }
}
