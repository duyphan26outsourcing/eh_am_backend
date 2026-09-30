import { Injectable } from '@nestjs/common';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { CostCenterRepository } from './cost-center.repository';
import {
  CreateCostCenterDto,
  DeactivateCostCenterDto,
  UpdateCostCenterDto,
} from './dto/cost-center.dto';
import { toCostCenterModel, type CostCenterModel } from './cost-center.model';

@Injectable()
export class CostCentersService {
  constructor(private readonly repo: CostCenterRepository) {}

  async list(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<PaginatedResult<CostCenterModel>> {
    const result = await this.repo.list(page, pageSize, status);
    return { ...result, items: result.items.map(toCostCenterModel) };
  }

  async create(
    dto: CreateCostCenterDto,
    req: AuthRequest,
  ): Promise<CostCenterModel> {
    // Chuẩn hoá mã như mã nhân viên: bỏ khoảng trắng hai đầu, in hoa (BR-MDM-01, Giả định 2).
    const code = dto.code.trim().toUpperCase();

    const changes = diffFields(null, { code, name: dto.name }, [
      'code',
      'name',
    ]);
    const ctx = auditContextOf(req);

    const row = await this.repo.createViaRpc({
      p_code: code,
      p_name: dto.name,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toCostCenterModel(row);
  }

  async update(
    id: string,
    dto: UpdateCostCenterDto,
    req: AuthRequest,
  ): Promise<CostCenterModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    const changes = diffFields({ name: current.name }, { name: dto.name }, [
      'name',
    ]);
    const ctx = auditContextOf(req);

    const row = await this.repo.updateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_name: dto.name,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toCostCenterModel(row);
  }

  // UC-MDM-03.AC.2: ngừng cost center. Kiểm tồn tại ở đây; kiểm lý do (còn hoạt động, đúng nhóm)
  // + "còn dùng" (còn location đang dùng làm mặc định) làm trong RPC có khoá dòng (UC-MDM-03 3f).
  async deactivate(
    id: string,
    dto: DeactivateCostCenterDto,
    req: AuthRequest,
  ): Promise<CostCenterModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }

    // Diff trạng thái để nhật ký ghi trước/sau (BR-CMN-02).
    const changes = diffFields(
      { status: current.status },
      { status: 'INACTIVE' },
      ['status'],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.deactivateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_reason_code_id: dto.reasonCodeId,
      p_note: dto.note ?? '',
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toCostCenterModel(row);
  }
}
