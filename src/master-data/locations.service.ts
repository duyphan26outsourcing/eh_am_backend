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
    status?: string,
    types?: string[],
    query?: string,
  ): Promise<PaginatedResult<LocationModel>> {
    const result = await this.repo.list(page, pageSize, status, types, query);
    return { ...result, items: result.items.map(toLocationModel) };
  }

  async create(
    dto: CreateLocationDto,
    commandKey: string,
    req: AuthRequest,
  ): Promise<LocationModel> {
    // Chuẩn hoá mã như mã nhân viên: bỏ khoảng trắng hai đầu, in hoa (BR-MDM-01, Giả định 1).
    const code = dto.code.trim().toUpperCase();
    const provinceCode = dto.provinceCode.trim();
    const provinceName = dto.provinceName.trim();
    const wardName = dto.wardName.trim();
    const addressDetail = dto.addressDetail.trim();

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
        province_code: provinceCode,
        province_name: provinceName,
        ward_name: wardName,
        address_detail: addressDetail,
        default_cost_center_id: dto.defaultCostCenterId,
      },
      [
        'code',
        'name',
        'type',
        'province_code',
        'province_name',
        'ward_name',
        'address_detail',
        'default_cost_center_id',
      ],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.createViaRpc({
      p_code: code,
      p_command_key: commandKey,
      p_name: dto.name,
      p_type: dto.type,
      p_province_code: provinceCode,
      p_province_name: provinceName,
      p_ward_name: wardName,
      p_address_detail: addressDetail,
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
    commandKey: string,
    req: AuthRequest,
  ): Promise<LocationModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    if (!(await this.repo.activeCostCenterExists(dto.defaultCostCenterId))) {
      throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
    }

    const provinceCode = dto.provinceCode.trim();
    const provinceName = dto.provinceName.trim();
    const wardName = dto.wardName.trim();
    const addressDetail = dto.addressDetail.trim();
    const changes = diffFields(
      {
        name: current.name,
        province_code: current.province_code,
        province_name: current.province_name,
        ward_name: current.ward_name,
        address_detail: current.address_detail,
        default_cost_center_id: current.default_cost_center_id,
      },
      {
        name: dto.name,
        province_code: provinceCode,
        province_name: provinceName,
        ward_name: wardName,
        address_detail: addressDetail,
        default_cost_center_id: dto.defaultCostCenterId,
      },
      [
        'name',
        'province_code',
        'province_name',
        'ward_name',
        'address_detail',
        'default_cost_center_id',
      ],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.updateViaRpc({
      p_id: id,
      p_command_key: commandKey,
      p_expected_version: dto.version,
      p_name: dto.name,
      p_province_code: provinceCode,
      p_province_name: provinceName,
      p_ward_name: wardName,
      p_address_detail: addressDetail,
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
