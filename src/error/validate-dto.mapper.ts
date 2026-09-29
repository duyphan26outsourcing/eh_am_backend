import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * `ValidationPipe` với `whitelist: true` sẽ **âm thầm loại bỏ** mọi trường không khai
 * trong DTO. Với một PATCH mà client gửi sai hết tên trường, kết quả là một object
 * rỗng đi tới service — và service đó sẽ chạy một câu UPDATE không có gì để cập nhật,
 * rồi trả về 200 như thể đã thành công.
 *
 * Hai hàm dưới đây chặn đúng trường hợp đó: gọi ở đầu service, trước khi ghi.
 */
export function mapValidateCreateDtoError(dto: object) {
  if (Object.keys(dto).length === 0) {
    throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
  }
}

export function mapValidateUpdateDtoError(dto: object) {
  if (Object.keys(dto).length === 0) {
    throw new AppException(ErrorCode.REQUIRED_FIELD_MISSING);
  }
}
