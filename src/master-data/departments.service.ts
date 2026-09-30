import { Injectable } from '@nestjs/common';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { DepartmentRepository } from './department.repository';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';
import { toDepartmentModel, type DepartmentModel } from './department.model';

@Injectable()
export class DepartmentsService {
  constructor(private readonly repo: DepartmentRepository) {}

  async list(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<PaginatedResult<DepartmentModel>> {
    const result = await this.repo.list(page, pageSize, status);
    return { ...result, items: result.items.map(toDepartmentModel) };
  }

  async create(
    dto: CreateDepartmentDto,
    req: AuthRequest,
  ): Promise<DepartmentModel> {
    // Chuẩn hoá mã: bỏ khoảng trắng hai đầu, in hoa (BR-MDM-14, Giả định 2).
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
    return toDepartmentModel(row);
  }

  async update(
    id: string,
    dto: UpdateDepartmentDto,
    req: AuthRequest,
  ): Promise<DepartmentModel> {
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
    return toDepartmentModel(row);
  }
}
