import { Logger } from '@nestjs/common';
import { PostgrestError } from '@supabase/supabase-js';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

const logger = new Logger('SupabasePostgresMapper');

/**
 * Đổi lỗi Postgres/PostgREST thô thành `AppException` mang mã lỗi của hệ thống.
 *
 * ⚠️ VÌ SAO PHẢI CÓ HÀM NÀY
 *
 * Không có nó, người dùng nghiệp vụ sẽ đọc đúng chuỗi
 * `duplicate key value violates unique constraint "uq_user_profiles_employee_code"` trên giao
 * diện. Đó vừa là trải nghiệm tệ, vừa là rò rỉ tên index và cấu trúc schema.
 *
 * ⚠️ 409 vs 400 KHÁC NHAU VỀ CÁCH XỬ LÝ, NÊN PHẢI KHÁC NHAU VỀ MÃ LỖI
 *
 * 409 nói "trạng thái đã đổi, tải lại rồi thử lại được"; 400 nói "dữ liệu bạn gửi sai, sửa
 * dữ liệu đi". Frontend dựa vào phân biệt đó để chọn giữa nút "Tải lại" và việc bôi đỏ ô
 * nhập. Trả chung một mã là ép frontend đoán.
 *
 * HTTP status của từng mã khai trong `ERROR_DEFINITIONS`, không truyền ở đây — nên một mã lỗi
 * luôn có đúng một status trên toàn hệ thống.
 */
export function mapSupabasePostgrestError(error: PostgrestError): never {
  const { code, message, details } = error;

  logger.debug(
    `Postgrest error code=${code} message=${message} details=${details ?? ''}`,
  );

  // Vi phạm ràng buộc UNIQUE — bản ghi đã tồn tại.
  //
  // ⚠️ Mã đúng của Postgres là 23505, không phải 23555. Sai một chữ số làm nhánh này không
  // bao giờ chạy và mọi lỗi trùng khoá rơi xuống nhánh cuối.
  if (code === '23505') {
    throw new AppException(ErrorCode.DUPLICATE_RECORD);
  }

  // Khoá ngoại không tồn tại — client tham chiếu một bản ghi chưa tạo (location, loại tài
  // sản, nhà cung cấp…).
  if (code === '23503') {
    throw new AppException(ErrorCode.REFERENCE_NOT_FOUND);
  }

  // Thiếu trường bắt buộc.
  if (code === '23502') {
    throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
  }

  // Vi phạm CHECK constraint — giá trị ngoài miền cho phép (ví dụ `status` của tài sản không
  // nằm trong danh mục trạng thái đã chốt).
  if (code === '23514') {
    throw new AppException(ErrorCode.VALUE_OUT_OF_DOMAIN);
  }

  // Không tìm thấy dòng nào khi dùng `.single()`.
  if (code === 'PGRST116') {
    throw new AppException(ErrorCode.NOT_FOUND);
  }

  // Chuỗi không phải UUID bị đưa xuống một cột UUID.
  //
  // ⚠️ Đúng ra phải chặn ở tầng DTO bằng `UuidParamDto` trước khi tới đây. Lọt xuống được
  // nghĩa là có một endpoint thiếu validation — nên trả 400 kèm mã rõ, và coi đó là dấu hiệu
  // cần rà lại DTO của endpoint đó.
  if (code === '22P02') {
    throw new AppException(ErrorCode.INVALID_REFERENCE_ID);
  }

  // Trigger `tg_append_only` chặn UPDATE/DELETE trên bảng nhật ký (`audit_events`, và sau
  // này `asset_events`, `inventory_scans`…).
  if (message.includes('APPEND_ONLY_TABLE')) {
    throw new AppException(ErrorCode.APPEND_ONLY_TABLE);
  }

  // Trigger `tg_close_only` chặn sửa/xoá bản ghi lịch sử có hiệu lực theo thời gian
  // (`context_role_assignments`), chỉ cho phép đóng hiệu lực một lần.
  if (message.includes('HISTORY_IMMUTABLE')) {
    throw new AppException(ErrorCode.HISTORY_IMMUTABLE);
  }

  throw new AppException(ErrorCode.DATA_ACCESS_ERROR);
}
