import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

interface EncryptedPayload {
  iv: string;
  authTag: string;
  data: string;
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.iv === 'string' &&
    typeof candidate.authTag === 'string' &&
    typeof candidate.data === 'string'
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

/**
 * Mã hoá access token trước khi trả về client, giải mã lại ở `JwtAuthGuard`.
 *
 * ⚠️ ĐIỀU NÀY KHÔNG THAY THẾ HTTPS VÀ KHÔNG PHẢI LỚP BẢO MẬT CHÍNH
 *
 * Nó giải quyết một việc hẹp hơn: JWT của Supabase là chuỗi base64 giải mã được bằng
 * mắt, chứa `sub`, `email`, `app_metadata`. Bọc thêm một lớp AES-GCM khiến token trong
 * `localStorage` hoặc trong log của một proxy trung gian không đọc ra được nội dung
 * đó, và khiến token không dùng trực tiếp được với endpoint Supabase công khai.
 *
 * Bảo vệ thật vẫn là: HTTPS, thời hạn token ngắn, và guard đọc trạng thái tài khoản từ
 * database trên mỗi request.
 *
 * ⚠️ AES-256-GCM, KHÔNG PHẢI CBC. GCM có authentication tag nên phát hiện được token
 * bị sửa; CBC thì không, và một token sửa được là một cửa cho tấn công oracle.
 */
@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly algorithm = 'aes-256-gcm';
  private readonly secretKey: Buffer;

  constructor(private configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_SECRET_KEY');

    // Ném lỗi ngay lúc khởi động, không đợi request đầu tiên.
    //
    // ⚠️ Nếu để im và chỉ lỗi lúc chạy thì triệu chứng sẽ là "đăng nhập được nhưng mọi
    // request sau đó trả 401" — một triệu chứng không hề trỏ về cấu hình thiếu.
    if (!key || key.length !== 64) {
      throw new Error(
        'ENCRYPTION_SECRET_KEY phải là đúng 64 ký tự hex (32 byte). ' +
          "Sinh bằng: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
      );
    }
    this.secretKey = Buffer.from(key, 'hex');
  }

  encrypt(plainText: string): string {
    try {
      // 12 byte là độ dài IV chuẩn cho GCM.
      const iv = randomBytes(12);
      const cipher = createCipheriv(this.algorithm, this.secretKey, iv);

      let encrypted = cipher.update(plainText, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      const authTag = cipher.getAuthTag();

      const result = {
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        data: encrypted,
      };

      return Buffer.from(JSON.stringify(result)).toString('base64');
    } catch (error: unknown) {
      this.logger.error(`Encryption failed: ${errorMessage(error)}`);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedData: string): string {
    try {
      const jsonStr = Buffer.from(encryptedData, 'base64').toString('utf8');
      const parsed: unknown = JSON.parse(jsonStr);
      if (!isEncryptedPayload(parsed)) {
        throw new Error('Invalid encrypted data format');
      }
      const { iv, authTag, data } = parsed;

      const decipher = createDecipheriv(
        this.algorithm,
        this.secretKey,
        Buffer.from(iv, 'base64'),
      );
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));

      let decrypted = decipher.update(data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: unknown) {
      // ⚠️ Chỉ log message, KHÔNG log `encryptedData`. Chuỗi đó là token của một người
      // dùng thật — đưa vào log là biến log thành nơi lấy được phiên đăng nhập.
      this.logger.error(`Decryption failed: ${errorMessage(error)}`);
      throw new Error('Failed to decrypt data');
    }
  }
}
