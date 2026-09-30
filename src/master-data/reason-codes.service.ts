import { Injectable } from '@nestjs/common';
import { type PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { diffFields } from '@/audit/audit-diff';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { ReasonCodeRepository } from './reason-code.repository';
import {
  CreateReasonCodeDto,
  DeactivateReasonCodeDto,
  UpdateReasonCodeDto,
} from './dto/reason-code.dto';
import { toReasonCodeModel, type ReasonCodeModel } from './reason-code.model';

@Injectable()
export class ReasonCodesService {
  constructor(private readonly repo: ReasonCodeRepository) {}

  async list(
    page: number,
    pageSize: number,
    reasonGroup?: string,
    status?: string,
  ): Promise<PaginatedResult<ReasonCodeModel>> {
    const result = await this.repo.list(page, pageSize, reasonGroup, status);
    return { ...result, items: result.items.map(toReasonCodeModel) };
  }

  async create(
    dto: CreateReasonCodeDto,
    req: AuthRequest,
  ): Promise<ReasonCodeModel> {
    // Chuẩn hoá mã: bỏ khoảng trắng hai đầu, in hoa (BR-MDM-14, Giả định 3).
    const code = dto.code.trim().toUpperCase();

    const changes = diffFields(
      null,
      { reason_group: dto.reasonGroup, code, label: dto.label },
      ['reason_group', 'code', 'label'],
    );
    const ctx = auditContextOf(req);

    const row = await this.repo.createViaRpc({
      p_reason_group: dto.reasonGroup,
      p_code: code,
      p_label: dto.label,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toReasonCodeModel(row);
  }

  async update(
    id: string,
    dto: UpdateReasonCodeDto,
    req: AuthRequest,
  ): Promise<ReasonCodeModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    // UC-MDM-07.EX.3: mục 'Khác' (is_freetext) là mục hệ thống, không sửa/ngừng được.
    if (current.is_freetext) {
      throw new AppException(ErrorCode.SYSTEM_REASON_PROTECTED);
    }

    const changes = diffFields({ label: current.label }, { label: dto.label }, [
      'label',
    ]);
    const ctx = auditContextOf(req);

    const row = await this.repo.updateViaRpc({
      p_id: id,
      p_expected_version: dto.version,
      p_label: dto.label,
      p_actor_id: req.user.sub,
      p_actor_label: ctx.actorLabel ?? '',
      p_changes: changes ?? {},
      p_reason: '',
      p_request_id: ctx.requestId ?? '',
      p_ip: ctx.ipAddress,
      p_user_agent: ctx.userAgent ?? '',
    });
    return toReasonCodeModel(row);
  }

  // UC-MDM-07.AC.2: ngừng lý do. Chặn mục 'Khác' + tự-tham-chiếu ở đây; kiểm lý do ngừng (còn
  // hoạt động, đúng nhóm CATALOG_DEACTIVATE) làm trong RPC có khoá dòng (UC-MDM-07 3e).
  async deactivate(
    id: string,
    dto: DeactivateReasonCodeDto,
    req: AuthRequest,
  ): Promise<ReasonCodeModel> {
    const current = await this.repo.findById(id);
    if (!current) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    // EX.3: mục 'Khác' (is_freetext) là mục hệ thống, mọi nhóm đều cần nên không ngừng được.
    if (current.is_freetext) {
      throw new AppException(ErrorCode.SYSTEM_REASON_PROTECTED);
    }
    // EX.1: không được chọn chính lý do đang ngừng làm lý do ngừng.
    if (dto.reasonCodeId === id) {
      throw new AppException(ErrorCode.VALIDATION_FAILED);
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
    return toReasonCodeModel(row);
  }
}
