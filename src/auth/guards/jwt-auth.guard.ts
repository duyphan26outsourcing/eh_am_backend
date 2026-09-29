import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import {
  USER_PROFILE_GUARD_COLUMNS,
  UserProfileTableName,
} from '@/supabase/supabase.define';
import { getAccessToken } from '@/utils/utils';
import { EncryptionService } from '../encryption.service';
import { SupabaseJwtService } from '../supabase-jwt/supabase-jwt.service';
import { JwtPayload } from '../types';
import { AuthRequest } from '../auth.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Guard xác thực — cửa vào duy nhất của mọi route cần đăng nhập.
 *
 * =========================================================================
 * BỐN BƯỚC, VÀ VÌ SAO KHÔNG BỎ ĐƯỢC BƯỚC NÀO
 * =========================================================================
 *
 *   1. Giải mã lớp AES của hệ thống      → token trong header không đọc được bằng mắt
 *   2. Xác minh chữ ký JWT qua JWKS       → token không bị làm giả
 *   3. Đọc `user_profiles` từ database    → trạng thái tài khoản là **hiện tại**
 *   4. Dựng `JwtPayload` và gán vào req   → tầng sau không tự suy diễn gì nữa
 *
 * ⚠️ BƯỚC 3 LÀ BƯỚC HAY BỊ CẮT ĐỂ "TỐI ƯU", VÀ CẮT NÓ LÀ MỘT LỖ HỔNG.
 *
 * JWT của Supabase sống hàng giờ. Nếu guard chỉ tin nội dung JWT thì một nhân viên nghỉ việc
 * (tài khoản chuyển `DEACTIVATED`) vẫn gọi API bình thường tới khi token hết hạn — tức vẫn
 * quét QR, vẫn xác nhận nhận hàng, vẫn thấy sổ tài sản của cửa hàng cũ. Một truy vấn theo
 * primary key trên mỗi request là giá phải trả, và nó rẻ.
 *
 * =========================================================================
 * ⚠️ KHÔNG ĐỌC PHẠM VI TỪ HEADER CLIENT GỬI
 * =========================================================================
 *
 * Guard này không nhận `x-location-id` hay bất kỳ header nào nói "tôi đang thao tác ở cửa hàng
 * nào". Location của một thao tác nằm trong **tài nguyên** (URL, hoặc bản ghi trong database),
 * và quyền trên location đó được `PermissionsGuard` / `AccessScopeService` tra từ
 * `context_role_assignments`. Tin một header nghĩa là đổi một UUID là hành động được dưới danh
 * nghĩa cửa hàng khác.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: SupabaseJwtService,
    private readonly encryptionService: EncryptionService,
    private readonly supabaseAdmin: SupabaseAdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new AppException(ErrorCode.ACCESS_TOKEN_MISSING);
    }

    // --- Bước 1: giải mã lớp AES của hệ thống ---
    const encryptedToken = getAccessToken(authorization);
    let accessToken: string;
    try {
      accessToken = this.encryptionService.decrypt(encryptedToken);
    } catch {
      throw new AppException(ErrorCode.ACCESS_TOKEN_INVALID);
    }

    // --- Bước 2: xác minh chữ ký ---
    const payload = await this.jwtService.verify(accessToken);

    if (!payload.sub || payload.sub.length === 0) {
      throw new AppException(ErrorCode.ACCESS_TOKEN_INVALID);
    }

    // --- Bước 3: đọc trạng thái hiện tại từ database ---
    const profile = await this.loadUserProfile(payload.sub);

    if (!profile) {
      // Có JWT hợp lệ nhưng chưa có hồ sơ: tài khoản vừa được tạo ở Supabase Auth mà
      // chưa qua bước tạo hồ sơ người dùng Every Half.
      //
      // ⚠️ Trả 403 kèm mã máy đọc được, KHÔNG trả 401. 401 làm frontend hiểu là token
      // hỏng và đẩy người dùng về trang đăng nhập — họ sẽ đăng nhập lại thành công rồi
      // lại bị đẩy về, thành một vòng lặp không có lời giải thích nào.
      throw new AppException(ErrorCode.PROFILE_NOT_INITIALIZED);
    }

    // ⚠️ GẮN NGÔN NGỮ TRƯỚC KHI KIỂM TRẠNG THÁI — THỨ TỰ NÀY QUAN TRỌNG
    //
    // `AllExceptionsFilter` đọc ngôn ngữ từ `req.user.preferredLocale`. Nếu việc gán `req.user`
    // nằm sau bước kiểm trạng thái thì lỗi `ACCOUNT_INACTIVE` được ném ra khi `req.user` **vẫn
    // rỗng** — và filter rơi về `Accept-Language`. Người dùng chọn tiếng Anh nhưng nhận thông
    // báo "tài khoản bị khoá" bằng tiếng Việt, đúng lúc cần họ hiểu vì sao bị chặn.
    //
    // Gán một object tối giản ở đây, rồi thay bằng payload đầy đủ ở bước 4.
    (req as AuthRequest).user = {
      sub: payload.sub,
      displayName: profile.display_name,
      employeeCode: profile.employee_code,
      preferredLocale: profile.preferred_locale,
    };

    if (profile.status !== 'ACTIVE') {
      throw new AppException(ErrorCode.ACCOUNT_INACTIVE, {
        status: profile.status,
      });
    }

    // --- Bước 4: dựng payload đã xác minh ---
    const app_metadata =
      typeof payload.app_metadata === 'object' && payload.app_metadata !== null
        ? (payload.app_metadata as { role?: string })
        : undefined;

    const jwtPayload: JwtPayload = {
      sub: payload.sub,
      displayName: profile.display_name,
      employeeCode: profile.employee_code,
      preferredLocale: profile.preferred_locale,
      app_metadata,
      aal:
        payload.aal === 'aal1' || payload.aal === 'aal2'
          ? payload.aal
          : undefined,
      amr: this.parseAmr(payload.amr),
      authSessionId:
        typeof payload.session_id === 'string' ? payload.session_id : undefined,
    };

    const authReq = req as AuthRequest;
    authReq.user = jwtPayload;
    authReq.userProfile = profile;

    // Thay header bằng JWT đã giải mã.
    //
    // ⚠️ Cần thiết vì các service phía sau gọi `supabase.auth.getUser(token)` và
    // `admin.signOut(token)` — chúng cần JWT thật, không phải chuỗi đã mã hoá. Bỏ dòng này
    // thì mọi lời gọi đó trả 401 ở một chỗ chẳng liên quan tới xác thực.
    req.headers.authorization = `Bearer ${accessToken}`;

    return true;
  }

  private async loadUserProfile(userId: string) {
    const { data } = await this.supabaseAdmin.client
      .from(UserProfileTableName)
      .select(USER_PROFILE_GUARD_COLUMNS)
      .eq('id', userId)
      .maybeSingle();

    return data;
  }

  /**
   * `amr` trong JWT là mảng object kiểu tự do. Lọc từng phần tử thay vì ép kiểu cả
   * mảng: một phần tử sai hình dạng sẽ bị bỏ đi, chứ không làm cả trường thành dữ liệu
   * không tin được mà vẫn mang kiểu đúng.
   */
  private parseAmr(
    raw: unknown,
  ): Array<{ method: string; timestamp: number }> | undefined {
    if (!Array.isArray(raw)) return undefined;

    return raw.flatMap((entry) => {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        typeof (entry as { method?: unknown }).method !== 'string' ||
        typeof (entry as { timestamp?: unknown }).timestamp !== 'number'
      ) {
        return [];
      }
      return [
        {
          method: (entry as { method: string }).method,
          timestamp: (entry as { timestamp: number }).timestamp,
        },
      ];
    });
  }
}
