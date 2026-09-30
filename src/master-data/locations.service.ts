import { Injectable } from '@nestjs/common';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { LocationRepository } from './location.repository';
import { CreateLocationDto, UpdateLocationDto } from './dto/location.dto';
import { toLocationModel, type LocationModel } from './location.model';

@Injectable()
export class LocationsService {
  constructor(private readonly repo: LocationRepository) {}

  async list(
    page: number,
    pageSize: number,
  ): Promise<PaginatedResult<LocationModel>> {
    const result = await this.repo.list(page, pageSize);
    return { ...result, items: result.items.map(toLocationModel) };
  }

  async create(
    dto: CreateLocationDto,
    req: AuthRequest,
  ): Promise<LocationModel> {
    // Chuẩn hoá mã như mã nhân viên: bỏ khoảng trắng hai đầu, in hoa (BR-MDM-01, Giả định 1).
    const code = dto.code.trim().toUpperCase();
    const address = dto.address?.trim() ? dto.address.trim() : null;

    // UC-MDM-01.EX.1 / BR-MDM-04: cost center mặc định phải Đang hoạt động.
    if (!(await this.repo.activeCostCenterExists(dto.defaultCostCenterId))) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }

    const changes = diffFields(
      null,
      {
        code,
        name: dto.name,
        type: dto.type,
        address,
        default_cost_center_id: dto.defaultCostCenterId,
      },
      ['code', 'name', 'type', 'address', 'default_cost_center_id'],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.createViaRpc({
      p_code: code,
      p_name: dto.name,
      p_type: dto.type,
      p_address: address ?? '',
      p_cost_center_id: dto.defaultCostCenterId,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toLocationModel(row);
  }

  async update(
    id: string,
    dto: UpdateLocationDto,
    req: AuthRequest,
  ): Promise<LocationModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    if (!(await this.repo.activeCostCenterExists(dto.defaultCostCenterId))) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }

    const address = dto.address?.trim() ? dto.address.trim() : null;
    const changes = diffFields(
      {
        name: current.name,
        address: current.address,
        default_cost_center_id: current.default_cost_center_id,
      },
      {
        name: dto.name,
        address,
        default_cost_center_id: dto.defaultCostCenterId,
      },
      ['name', 'address', 'default_cost_center_id'],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.updateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_name: dto.name,
      p_address: address ?? '',
      p_cost_center_id: dto.defaultCostCenterId,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toLocationModel(row);
  }
}
