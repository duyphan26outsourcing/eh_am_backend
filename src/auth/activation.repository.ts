import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { BaseRepository } from '@/common/repository/base.repository';
import { type Json } from '@/supabase/database.types';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';

export type ActivationPreviewRecord = {
  inviteId: string;
  userId: string;
  displayName: string;
  workEmail: string;
  status: string;
  expiresAt: string;
  mustChangePassword: boolean;
  profileStatus: string;
};

export type ActivationClaimRecord = {
  inviteId: string;
  userId: string;
  status: string;
  claimed: boolean;
};

function objectOf(value: Json): Record<string, Json | undefined> | null {
  return value !== null && !Array.isArray(value) && typeof value === 'object'
    ? value
    : null;
}

function requiredString(
  row: Record<string, Json | undefined>,
  key: string,
): string {
  const value = row[key];
  if (typeof value !== 'string')
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  return value;
}

@Injectable()
export class ActivationRepository extends BaseRepository {
  constructor(supabaseAdmin: SupabaseAdminService) {
    super(supabaseAdmin, ActivationRepository.name);
  }

  async preview(userId: string): Promise<ActivationPreviewRecord | null> {
    const { data, error } = await this.db.rpc('preview_activation_invite', {
      p_user_id: userId,
    });
    if (error) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    if (data === null) return null;
    const row = objectOf(data);
    if (!row) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    if (
      typeof row.must_change_password !== 'boolean' ||
      typeof row.profile_status !== 'string'
    ) {
      throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    }
    return {
      inviteId: requiredString(row, 'invite_id'),
      userId: requiredString(row, 'user_id'),
      displayName: requiredString(row, 'display_name'),
      workEmail: requiredString(row, 'work_email'),
      status: requiredString(row, 'status'),
      expiresAt: requiredString(row, 'expires_at'),
      mustChangePassword: row.must_change_password,
      profileStatus: row.profile_status,
    };
  }

  async claim(userId: string): Promise<ActivationClaimRecord | null> {
    const { data, error } = await this.db.rpc('claim_activation_invite', {
      p_user_id: userId,
    });
    if (error) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    if (data === null) return null;
    const row = objectOf(data);
    if (!row || typeof row.claimed !== 'boolean')
      throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
    return {
      inviteId: requiredString(row, 'invite_id'),
      userId: requiredString(row, 'user_id'),
      status: requiredString(row, 'status'),
      claimed: row.claimed,
    };
  }

  async release(inviteId: string, userId: string): Promise<void> {
    const { error } = await this.db.rpc('release_activation_invite', {
      p_invite_id: inviteId,
      p_user_id: userId,
    });
    if (error) throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }

  async complete(args: {
    inviteId: string;
    userId: string;
    requestId: string;
    ipAddress: string | null;
    userAgent: string;
  }): Promise<void> {
    const { error } = await this.db.rpc('complete_account_activation', {
      p_invite_id: args.inviteId,
      p_user_id: args.userId,
      p_request_id: args.requestId,
      p_ip: args.ipAddress,
      p_user_agent: args.userAgent,
    });
    if (!error) return;
    if (error.message.includes('AUDIT_WRITE_FAILED'))
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    if (error.message.includes('INVITATION_USED_OR_REPLACED'))
      throw new AppException(ErrorCode.INVITATION_USED_OR_REPLACED);
    if (error.message.includes('INVITATION_INVALID'))
      throw new AppException(ErrorCode.INVITATION_INVALID);
    throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
  }
}
