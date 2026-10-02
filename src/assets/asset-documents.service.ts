import { Injectable } from '@nestjs/common';
import { auditContextOf } from '@/audit/audit.service';
import { type AuthRequest } from '@/auth/auth.interface';
import { AccessScopeService } from '@/auth/access-scope.service';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  toAttachedDocumentModel,
  type AttachedDocumentModel,
} from './asset.model';
import {
  ALLOWED_DOCUMENT_CONTENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  type ConfirmDocumentDto,
  type RequestDocumentUploadDto,
} from './dto/asset-document.dto';
import { AssetsRepository } from './assets.repository';
import { AssetStorageService } from './asset-storage.service';
import { ASSET_DETAIL_SCOPE } from './assets.service';

const TERMINAL = new Set(['DISPOSED', 'LOST', 'CANCELLED']);
const FINANCIAL_DOC_TYPES = new Set(['INVOICE', 'PO']);

/**
 * UC-AST-06 — chứng từ tài sản. Upload trực tiếp trình duyệt → Storage (signed URL); server chỉ cấp
 * URL sau khi kiểm quyền và gắn metadata. Đọc qua signed URL có thời hạn + BR-CMN-06 cho hoá đơn/PO.
 */
@Injectable()
export class AssetDocumentsService {
  constructor(
    private readonly repository: AssetsRepository,
    private readonly storage: AssetStorageService,
    private readonly accessScope: AccessScopeService,
  ) {}

  private assertFileAllowed(contentType: string, sizeBytes: number) {
    if (
      !(ALLOWED_DOCUMENT_CONTENT_TYPES as readonly string[]).includes(
        contentType,
      )
    ) {
      throw new AppException(ErrorCode.FILE_TYPE_NOT_ALLOWED);
    }
    if (sizeBytes > MAX_DOCUMENT_SIZE_BYTES) {
      throw new AppException(ErrorCode.FILE_TOO_LARGE);
    }
  }

  private async loadActiveAsset(assetId: string) {
    const asset = await this.repository.findResponsibilityContext(assetId);
    if (!asset) throw new AppException(ErrorCode.NOT_FOUND);
    if (TERMINAL.has(asset.lifecycle_status)) {
      throw new AppException(ErrorCode.ASSET_READ_ONLY);
    }
    return asset;
  }

  async requestUploadUrl(assetId: string, dto: RequestDocumentUploadDto) {
    this.assertFileAllowed(dto.contentType, dto.sizeBytes);
    await this.loadActiveAsset(assetId);
    const path = this.storage.buildPath(assetId, dto.fileName);
    return this.storage.createUploadUrl(path);
  }

  async confirmDocument(
    assetId: string,
    dto: ConfirmDocumentDto,
    req: AuthRequest,
  ): Promise<AttachedDocumentModel> {
    this.assertFileAllowed(dto.contentType, dto.sizeBytes);
    await this.loadActiveAsset(assetId);
    // ⚠️ Chống IDOR + path traversal (review M1): path PHẢI đúng khuôn do buildPath sinh ra cho CHÍNH
    // asset này — `assets/<assetId>/<uuid>-<tên an toàn>` — nên mọi `..`, `//`, `\`, hay thư mục hồ sơ
    // khác đều bị từ chối.
    const expectedPath = new RegExp(
      `^assets/${assetId}/[0-9a-f-]{36}-[A-Za-z0-9._-]{1,120}$`,
    );
    if (!expectedPath.test(dto.storagePath)) {
      throw new AppException(ErrorCode.INVALID_REFERENCE_ID);
    }
    if (!(await this.storage.objectExists(dto.storagePath))) {
      throw new AppException(ErrorCode.FILE_STORAGE_ERROR);
    }
    const audit = auditContextOf(req);
    const row = await this.repository.attachDocumentViaRpc({
      p_asset_id: assetId,
      p_doc_type: dto.docType,
      p_file_name: dto.fileName,
      p_storage_path: dto.storagePath,
      p_content_type: dto.contentType,
      p_size_bytes: dto.sizeBytes,
      p_actor_id: req.user.sub,
      p_actor_label: audit.actorLabel ?? '',
      p_request_id: audit.requestId ?? '',
      p_ip: audit.ipAddress,
      p_user_agent: audit.userAgent ?? '',
    });
    return toAttachedDocumentModel(row);
  }

  async getDownloadUrl(
    assetId: string,
    documentId: string,
    req: AuthRequest,
  ): Promise<{ url: string }> {
    const scope = await this.accessScope.resolveLocationScope(
      req.user,
      ASSET_DETAIL_SCOPE,
    );
    if (!scope.allLocations && scope.locationIds.length === 0) {
      throw new AppException(ErrorCode.ROLE_REQUIRED);
    }
    // Asset phải trong phạm vi người gọi (chống dò tài sản ngoài scope).
    const asset = await this.repository.findDetailInScope(
      assetId,
      scope.allLocations ? null : scope.locationIds,
    );
    if (!asset) throw new AppException(ErrorCode.NOT_FOUND);

    const doc = await this.repository.findDocument(assetId, documentId);
    if (!doc) throw new AppException(ErrorCode.NOT_FOUND);
    // BR-CMN-06: hoá đơn/PO chỉ cho vai trò xem tài chính; ngoài ra ẩn như không tồn tại.
    if (FINANCIAL_DOC_TYPES.has(doc.doc_type) && !scope.allLocations) {
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    const url = await this.storage.createDownloadUrl(doc.storage_path, 60);
    return { url };
  }
}
