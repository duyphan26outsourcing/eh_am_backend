import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import type { JWTPayload } from 'jose';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Xác minh chữ ký JWT do Supabase Auth phát.
 *
 * ⚠️ XÁC MINH BẰNG JWKS, KHÔNG BẰNG SHARED SECRET
 *
 * `createRemoteJWKSet` tải public key từ endpoint `.well-known/jwks.json` của project
 * và tự cache + tự làm mới khi Supabase luân chuyển khoá. Cách cũ (đối chiếu với một
 * `JWT_SECRET` sao chép vào `.env`) có hai vấn đề: secret đó phải đồng bộ tay ở mọi
 * môi trường, và một lần Supabase rotate khoá là toàn bộ request trả 401 cho tới khi
 * ai đó nhớ ra phải cập nhật.
 *
 * ⚠️ BA THAM SỐ DƯỚI ĐÂY LÀ BẮT BUỘC, KHÔNG PHẢI TÙY CHỌN
 *
 * Thiếu `issuer` thì một JWT hợp lệ của **project Supabase khác** cũng qua được — kể
 * cả project do người ngoài tự tạo. Thiếu `audience` thì token của service khác trong
 * cùng project (ví dụ token `anon`) cũng qua. Thiếu `algorithms` thì mở đường cho tấn
 * công đổi thuật toán.
 */
@Injectable()
export class SupabaseJwtService {
  private jwks: ReturnType<typeof createRemoteJWKSet>;
  private issuer: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL')!;
    this.issuer = `${supabaseUrl}/auth/v1`;

    this.jwks = createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
  }

  async verify(token: string): Promise<JWTPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        algorithms: ['ES256'],
        issuer: this.issuer,
        audience: 'authenticated',
      });

      return payload;
    } catch {
      // Không đưa chi tiết lỗi của `jose` ra ngoài: nó phân biệt được "hết hạn" với
      // "chữ ký sai", và thông tin đó giúp người tấn công dò cách hệ thống xác minh.
      // Chi tiết vẫn còn trong log của Nest ở tầng filter.
      throw new AppException(ErrorCode.ACCESS_TOKEN_INVALID);
    }
  }
}
