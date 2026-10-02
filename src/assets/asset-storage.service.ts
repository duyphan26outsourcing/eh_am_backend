import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';

/** Bucket RIÊNG TƯ cho chứng từ tài sản (tạo ở migration 22). */
const BUCKET = 'asset-documents';

/**
 * Lớp bọc Supabase Storage cho chứng từ tài sản (UC-AST-06).
 *
 * ⚠️ Tệp đi THẲNG từ trình duyệt vào Storage qua signed upload URL — server không bao giờ cầm nội dung
 * tệp (giữ request <256KB). Đọc qua signed download URL có thời hạn, cấp sau khi service đã kiểm quyền.
 * Bucket riêng tư + service_role, nên URL ký là cổng truy cập duy nhất.
 */
@Injectable()
export class AssetStorageService {
  constructor(private readonly supabase: SupabaseAdminService) {}

  private get bucket() {
    return this.supabase.client.storage.from(BUCKET);
  }

  /** Đường dẫn object: assets/<assetId>/<uuid>-<tên tệp an toàn>. */
  buildPath(assetId: string, fileName: string): string {
    const base = fileName.split(/[\\/]/).pop() ?? 'file';
    const safe = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file';
    return `assets/${assetId}/${randomUUID()}-${safe}`;
  }

  async createUploadUrl(
    path: string,
  ): Promise<{ uploadUrl: string; token: string; path: string }> {
    const { data, error } = await this.bucket.createSignedUploadUrl(path);
    if (error || !data) throw new AppException(ErrorCode.FILE_STORAGE_ERROR);
    return { uploadUrl: data.signedUrl, token: data.token, path: data.path };
  }

  async createDownloadUrl(
    path: string,
    expiresInSeconds = 60,
  ): Promise<string> {
    const { data, error } = await this.bucket.createSignedUrl(
      path,
      expiresInSeconds,
    );
    if (error || !data?.signedUrl) {
      throw new AppException(ErrorCode.FILE_STORAGE_ERROR);
    }
    return data.signedUrl;
  }

  /** Xác nhận object đã thực sự được tải lên trước khi gắn vào hồ sơ (chống gắn path giả). */
  async objectExists(path: string): Promise<boolean> {
    const slash = path.lastIndexOf('/');
    const folder = slash >= 0 ? path.slice(0, slash) : '';
    const name = slash >= 0 ? path.slice(slash + 1) : path;
    const { data, error } = await this.bucket.list(folder, {
      limit: 100,
      search: name,
    });
    if (error) throw new AppException(ErrorCode.FILE_STORAGE_ERROR);
    return (data ?? []).some((item) => item.name === name);
  }
}
