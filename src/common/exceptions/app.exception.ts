import { HttpException } from '@nestjs/common';
import { ERROR_DEFINITIONS, ErrorCode } from '@/common/i18n/error-code.const';
import type { MessageParams } from '@/common/i18n/i18n.service';

/**
 * Ngoại lệ nghiệp vụ mang **mã lỗi**, không mang câu thông báo.
 *
 * ============================================================================
 * ⚠️ VÌ SAO DỊCH Ở FILTER, KHÔNG DỊCH Ở CHỖ NÉM LỖI
 * ============================================================================
 *
 * Cách làm hiển nhiên hơn là dịch ngay lúc ném:
 *
 * ```ts
 * // ❌ SAI
 * throw new ConflictException(this.i18n.translate('EMPLOYEE_CODE_TAKEN', locale, { code }));
 * ```
 *
 * Cách đó buộc **mọi** service phải biết ngôn ngữ của người gọi, tức phải nhận `locale` (hoặc
 * cả `Request`) làm tham số. Hệ quả cụ thể:
 *
 *   · `assertEmployeeCodeAvailable(code)` thành `assertEmployeeCodeAvailable(code, locale)`,
 *   · rồi mọi hàm gọi nó cũng phải nhận `locale`,
 *   · rồi repository cũng phải nhận, vì `mapSupabasePostgrestError` cũng ném lỗi.
 *
 * Nghĩa là ngôn ngữ — một chi tiết **trình bày** — lan vào chữ ký của toàn bộ tầng nghiệp vụ
 * và tầng dữ liệu. Và chỗ nào quên truyền thì hiển thị sai ngôn ngữ mà không có lỗi nào báo.
 *
 * Ném mã lỗi thì tầng nghiệp vụ **không cần biết** ngôn ngữ. `AllExceptionsFilter` có
 * `Request` nên nó biết, và nó là **một** chỗ duy nhất phải đúng.
 *
 * ============================================================================
 * CÁCH DÙNG
 * ============================================================================
 *
 * ```ts
 * throw new AppException(ErrorCode.EMPLOYEE_CODE_TAKEN, { employeeCode });
 * throw new AppException(ErrorCode.ACCOUNT_INACTIVE, { status: profile.status });
 * throw new AppException(ErrorCode.PROFILE_NOT_INITIALIZED);
 * ```
 *
 * **Không** truyền HTTP status — nó khai cùng chỗ với bản dịch trong `ERROR_DEFINITIONS`.
 *
 * ⚠️ Lý do: nếu mỗi chỗ ném tự chọn status thì cùng một mã lỗi sẽ trả 409 ở endpoint này và
 * 400 ở endpoint kia — và frontend không thể xử lý nhất quán một mã lỗi có hai status.
 *
 * ============================================================================
 * ⚠️ `params` ĐI RA NGOÀI, NÊN KHÔNG ĐƯỢC CHỨA DỮ LIỆU NHẠY CẢM
 * ============================================================================
 *
 * Giá trị trong `params` được chèn vào câu thông báo trả về client. Nên **không** đưa vào đây:
 * mật khẩu, token, toạ độ GPS, nguyên giá của tài sản mà người gọi không có quyền xem, tên
 * bảng, tên cột, tên index, thông báo lỗi thô của Postgres, của Supabase hay của FAST.
 *
 * Chi tiết để điều tra thì ghi log ở chỗ ném lỗi, đừng đưa vào `params`.
 */
export class AppException extends HttpException {
  readonly code: ErrorCode;
  readonly params?: MessageParams;

  constructor(code: ErrorCode, params?: MessageParams) {
    // `super(code, status)` đặt `message` = chính mã lỗi. Đó là chủ ý: nếu vì lý do nào đó
    // exception này không đi qua `AllExceptionsFilter` (ví dụ bị bắt ở một filter khác),
    // client vẫn nhận được một mã máy đọc được thay vì một chuỗi rỗng.
    super(code, ERROR_DEFINITIONS[code].status);
    this.code = code;
    this.params = params;
  }
}
