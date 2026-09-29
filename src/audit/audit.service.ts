import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { AuditEventTableName } from '@/supabase/supabase.define';
import type { AuditEvent } from '@/utils/enums/audit-event.enum';
import type { Json } from '@/supabase/database.types';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';
import { clientIp, clientUserAgent } from '@/utils/utils';
import type { AuditChanges } from './audit-diff';

export interface RecordAuditParams {
  eventCode: AuditEvent;

  // --- AI -------------------------------------------------------------------
  actorId?: string | null;
  /**
   * Nhãn đọc được của người thực hiện TẠI THỜI ĐIỂM hành động — "Nguyễn Văn A (EH0123)".
   *
   * ⚠️ VÌ SAO LƯU BẢN CHỤP TÊN, KHÔNG CHỈ `actor_id`
   *
   * `actor_id` không có khoá ngoại (bảng chỉ-ghi-thêm — xem migration 01), và hồ sơ người
   * dùng có thể đổi tên hoặc bị xoá. Kiểm toán hỏi "AI đã duyệt thanh lý máy pha này năm
   * 2027" thì câu trả lời phải đọc được ngay trên dòng audit, không phụ thuộc hồ sơ còn tồn
   * tại hay không.
   */
  actorLabel?: string | null;

  // --- THAY ĐỔI GÌ, TRÊN CÁI GÌ, Ở ĐÂU -------------------------------------
  subjectType?: string | null;
  /**
   * ⚠️ Nhận `null` một cách tường minh, vì có sự kiện thật sự không có đối tượng: một lần
   * đăng nhập thất bại không gắn được với `user_profiles` nào (chưa biết người gọi là ai,
   * và email họ gõ có thể không tồn tại).
   */
  subjectId?: string | null;
  /** Phạm vi xảy ra hành động — với Every Half thường là `LOCATION` + id của cửa hàng/kho. */
  contextType?: string | null;
  contextId?: string | null;

  // --- TRƯỚC/SAU, LÝ DO -----------------------------------------------------
  /** Kết quả của `diffFields()` — xem `audit-diff.ts` về vì sao phải qua allow-list. */
  changes?: AuditChanges | null;
  /**
   * Lý do do NGƯỜI DÙNG nhập (điều chỉnh nguyên giá, đổi trạng thái sang "Mất", huỷ phiếu…).
   *
   * ⚠️ Service **không** ghi lý do thay người dùng ("system update"). Một lý do bịa làm dòng
   * audit trông đầy đủ trong khi câu hỏi "vì sao" thật sự không có câu trả lời. Hành động nào
   * brief yêu cầu có lý do thì DTO của nó phải có trường `reason` bắt buộc.
   */
  reason?: string | null;
  metadata?: Record<string, unknown>;

  // --- KHI NÀO / TỪ ĐÂU -----------------------------------------------------
  // `created_at` do database đặt (`default now()`), KHÔNG nhận từ client: giờ của điện thoại
  // nhân viên có thể lệch, và "khi nào" trong audit phải là đồng hồ của server.
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

/**
 * Bốn trường "ngữ cảnh người gọi" mà hầu như mọi dòng audit đều cần, lấy từ request.
 *
 * Gom lại để không service nào phải nhớ đủ cả bốn — và để `requestId` (thứ nối một dòng audit
 * với dòng log HTTP tương ứng) không bị quên ở đúng những chỗ cần tra nhất.
 */
export function auditContextOf(
  req: Request,
): Pick<
  RecordAuditParams,
  'actorId' | 'actorLabel' | 'ipAddress' | 'userAgent' | 'requestId'
> {
  const user = req.user;
  return {
    actorId: user?.sub ?? null,
    actorLabel: user
      ? user.employeeCode
        ? `${user.displayName} (${user.employeeCode})`
        : user.displayName
      : null,
    ipAddress: clientIp(req),
    userAgent: clientUserAgent(req),
    requestId: req.requestId ?? null,
  };
}

/**
 * Ghi nhật ký hành động vào `audit_events`.
 *
 * =========================================================================
 * ⚠️ GHI AUDIT KHÔNG ĐƯỢC LÀM VỠ NGHIỆP VỤ — VÀ NGƯỢC LẠI
 * =========================================================================
 *
 * Có hai lựa chọn khi việc ghi audit thất bại:
 *
 *   A. Ném lỗi → hành động nghiệp vụ không hoàn tất. Bảo đảm "không hành động nào không có
 *      dấu vết", nhưng một sự cố ở bảng audit sẽ làm dừng thao tác của cả chuỗi.
 *
 *   B. Ghi log rồi đi tiếp → nghiệp vụ luôn chạy, nhưng có thể mất một dòng audit.
 *
 * Service này chọn **B cho sự kiện phiên đăng nhập** (`record()`) và cung cấp
 * `recordOrThrow()` cho **A ở mọi thay đổi dữ liệu nghiệp vụ**. Với Every Half, "mọi thay đổi
 * dữ liệu nghiệp vụ" nghĩa là gần như mọi thứ: brief ghi "Không bao giờ xoá lịch sử" — một
 * thay đổi tài sản không có dòng lịch sử là vi phạm trực tiếp nguyên tắc số 1.
 *
 * ⚠️ `recordOrThrow()` VẪN CHƯA ĐỦ CHO THAO TÁC CÓ HỆ QUẢ KẾ TOÁN
 *
 * supabase-js gọi PostgREST theo từng câu lệnh, không có transaction bao nhiều câu. Nên chuỗi
 * "UPDATE assets → INSERT audit" có thể dừng ở giữa: UPDATE thành công, INSERT thất bại →
 * `recordOrThrow` ném lỗi, người dùng thấy lỗi, nhưng tài sản **đã** đổi.
 *
 * Hướng xử lý đề xuất cho các module nghiệp vụ (chốt khi thiết kế module): thao tác ghi nghiệp
 * vụ + dòng lịch sử của đối tượng nằm trong **một hàm Postgres** gọi qua `rpc()` — một
 * transaction, hoặc tất cả hoặc không gì cả. `AuditService` lo nhật ký hành động ở tầng ứng
 * dụng; tính nguyên tử của dữ liệu nghiệp vụ là việc của database.
 *
 * ⚠️ KHÔNG ĐƯA DỮ LIỆU NHẠY CẢM VÀO `metadata` HAY `changes`.
 * `audit_events` là bảng chỉ-ghi-thêm, lưu lâu hơn mọi bảng khác và không xoá được — nên nó
 * là chỗ tệ nhất để lỡ ghi mật khẩu, token, đường dẫn ký tạm của tệp, hay toạ độ GPS chi tiết.
 */
@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly supabaseAdmin: SupabaseAdminService) {}

  /** Ghi audit; thất bại thì log và đi tiếp. Dùng cho sự kiện phiên/đăng nhập. */
  async record(params: RecordAuditParams): Promise<void> {
    const { error } = await this.insert(params);

    if (error) {
      // Log ở mức `error` chứ không `warn`: mất một dòng audit là chuyện cần người biết,
      // kể cả khi nghiệp vụ vẫn chạy. Log dòng này chính là bản sao cuối cùng của sự kiện
      // đã mất, nên nó phải chứa đủ để dựng lại.
      this.logger.error(
        `Ghi audit thất bại — event=${params.eventCode} actor=${params.actorId ?? 'n/a'} ` +
          `subject=${params.subjectType ?? ''}:${params.subjectId ?? ''} ` +
          `rid=${params.requestId ?? '-'} lỗi="${error.message}"`,
      );
    }
  }

  /**
   * Ghi audit; thất bại thì **ném lỗi** để hành động nghiệp vụ không hoàn tất.
   *
   * Dùng cho mọi thay đổi dữ liệu nghiệp vụ và phân quyền — xem chú thích đầu class về giới
   * hạn của nó khi không có transaction.
   */
  async recordOrThrow(params: RecordAuditParams): Promise<void> {
    const { error } = await this.insert(params);

    if (error) {
      this.logger.error(
        `Ghi audit BẮT BUỘC thất bại — chặn hành động. event=${params.eventCode} ` +
          `rid=${params.requestId ?? '-'} lỗi="${error.message}"`,
      );
      throw new AppException(ErrorCode.AUDIT_WRITE_FAILED);
    }
  }

  private insert(params: RecordAuditParams) {
    return this.supabaseAdmin.client.from(AuditEventTableName).insert({
      event_code: params.eventCode,
      actor_id: params.actorId ?? null,
      actor_label: params.actorLabel ?? null,
      subject_type: params.subjectType ?? null,
      subject_id: params.subjectId ?? null,
      context_type: params.contextType ?? null,
      context_id: params.contextId ?? null,
      changes: (params.changes ?? null) as Json,
      reason: params.reason?.trim() || null,
      metadata: (params.metadata ?? {}) as Json,
      ip_address: params.ipAddress ?? null,
      user_agent: params.userAgent ?? null,
      request_id: params.requestId ?? null,
    });
  }
}
