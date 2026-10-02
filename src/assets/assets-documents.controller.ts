import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { RequireContext } from '@/auth/decorators/context-permission.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@/auth/guards/permission.guard';
import { type AuthRequest } from '@/auth/auth.interface';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import { THROTTLE_WRITE } from '@/common/constants/throttle.const';
import { ContextType, Role } from '@/utils/enums/role.enum';
import {
  ConfirmDocumentDto,
  RequestDocumentUploadDto,
} from './dto/asset-document.dto';
import { AssetDocumentsService } from './asset-documents.service';

// UC-AST-06: đính kèm chứng từ. Quản lý tài sản + Kế toán tài sản (toàn hệ thống) được tải lên.
@Controller({ path: 'assets', version: API_VERSION_1 })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireContext({
  roles: [Role.ASSET_MANAGER, Role.ASSET_ACCOUNTANT],
  contextType: ContextType.PLATFORM,
})
export class AssetDocumentsController {
  constructor(private readonly service: AssetDocumentsService) {}

  // Bước 1: xin signed URL để trình duyệt tải thẳng tệp lên Storage.
  @Post(':id/documents/upload-url')
  @Throttle({ default: THROTTLE_WRITE })
  async requestUploadUrl(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RequestDocumentUploadDto,
  ) {
    return this.service.requestUploadUrl(id, dto);
  }

  // Bước 3: xác nhận gắn tệp đã tải vào hồ sơ (ghi metadata + audit).
  @Post(':id/documents')
  @Throttle({ default: THROTTLE_WRITE })
  async confirmDocument(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ConfirmDocumentDto,
    @Req() req: AuthRequest,
  ) {
    return this.service.confirmDocument(id, dto, req);
  }
}
