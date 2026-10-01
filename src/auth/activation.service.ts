import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { clientIp, clientUserAgent } from '@/utils/utils';
import { ActivationRepository } from './activation.repository';
import {
  ActivationPreviewDto,
  CompleteActivationDto,
} from './dto/activation.dto';
import { SupabaseJwtService } from './supabase-jwt/supabase-jwt.service';

@Injectable()
export class ActivationService {
  private readonly logger = new Logger(ActivationService.name);

  constructor(
    private readonly repository: ActivationRepository,
    private readonly jwtService: SupabaseJwtService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  async preview(dto: ActivationPreviewDto) {
    const userId = await this.userIdFromToken(dto.accessToken);
    const invite = await this.repository.preview(userId);
    this.assertUsable(invite);
    return {
      displayName: invite.displayName,
      workEmail: invite.workEmail,
      expiresAt: invite.expiresAt,
    };
  }

  async complete(dto: CompleteActivationDto, req: Request) {
    const userId = await this.userIdFromToken(dto.accessToken);
    // Không phụ thuộc frontend đã gọi preview: API complete tự kiểm toàn bộ điều kiện.
    this.assertUsable(await this.repository.preview(userId));

    const claim = await this.repository.claim(userId);
    if (!claim) throw new AppException(ErrorCode.INVITATION_INVALID);
    if (!claim.claimed) {
      if (claim.status === 'EXPIRED')
        throw new AppException(ErrorCode.INVITATION_EXPIRED);
      throw new AppException(ErrorCode.INVITATION_USED_OR_REPLACED);
    }

    try {
      const { error } =
        await this.supabaseAdmin.client.auth.admin.updateUserById(userId, {
          password: dto.newPassword,
          email_confirm: true,
        });
      if (error) throw new AppException(ErrorCode.PASSWORD_UPDATE_FAILED);

      await this.repository.complete({
        inviteId: claim.inviteId,
        userId,
        requestId: req.requestId ?? '',
        ipAddress: clientIp(req),
        userAgent: clientUserAgent(req) ?? '',
      });
    } catch (error) {
      await this.releaseWithoutMasking(claim.inviteId, userId);
      throw error;
    }

    return { activated: true };
  }

  private assertUsable(
    invite: Awaited<ReturnType<ActivationRepository['preview']>>,
  ): asserts invite is NonNullable<typeof invite> {
    if (!invite) throw new AppException(ErrorCode.INVITATION_INVALID);
    if (
      invite.mustChangePassword ||
      invite.profileStatus !== 'PENDING_ACTIVATION'
    ) {
      throw new AppException(ErrorCode.INVITATION_INVALID);
    }
    if (invite.status === 'EXPIRED')
      throw new AppException(ErrorCode.INVITATION_EXPIRED);
    if (invite.status !== 'SENT')
      throw new AppException(ErrorCode.INVITATION_USED_OR_REPLACED);
  }

  private async userIdFromToken(accessToken: string): Promise<string> {
    try {
      const payload = await this.jwtService.verify(accessToken.trim());
      if (!payload.sub) throw new Error('missing sub');
      return payload.sub;
    } catch {
      // Không chuyển tiếp ACCESS_TOKEN_INVALID: đây là màn kích hoạt, contract công khai chỉ
      // nói liên kết không hợp lệ và không tiết lộ token hỏng ở lớp nào.
      throw new AppException(ErrorCode.INVITATION_INVALID);
    }
  }

  private async releaseWithoutMasking(
    inviteId: string,
    userId: string,
  ): Promise<void> {
    try {
      await this.repository.release(inviteId, userId);
    } catch {
      this.logger.error(
        `Không trả được lời mời về trạng thái chờ sau lỗi kích hoạt: invite=${inviteId}`,
      );
    }
  }
}
