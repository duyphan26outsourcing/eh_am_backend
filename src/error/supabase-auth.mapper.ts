import { Logger } from '@nestjs/common';
import { AuthError } from '@supabase/supabase-js';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

const logger = new Logger('SupabaseAuthMapper');

/**
 * Đổi lỗi của Supabase Auth thành `AppException` mang mã lỗi của hệ thống.
 *
 * ⚠️ KHÔNG chuyển nguyên `error.message` ra ngoài. Message của Supabase mô tả trạng thái nội
 * bộ ("User already registered", "Invalid login credentials") và ở một số endpoint điều đó
 * thành công cụ dò tài khoản: gõ thử một loạt email rồi đọc phản hồi là biết ai có tài khoản.
 * Ghi log để đội vận hành xem, trả mã lỗi trung tính cho client.
 *
 * ⚠️ VÌ SAO TRẢ MÃ LỖI CHỨ KHÔNG TRẢ CÂU TIẾNG VIỆT
 *
 * Hàm này được gọi từ tầng service, nơi **không biết** ngôn ngữ của người gọi. Nếu nó tự dịch
 * thì mọi service phải nhận thêm tham số `locale`, và ngôn ngữ — một chi tiết trình bày — sẽ
 * lan vào chữ ký của cả tầng nghiệp vụ. `AllExceptionsFilter` dịch ở biên, một chỗ duy nhất.
 * Xem chú thích ở `AppException`.
 */
export function mapSupabaseAuthError(error: AuthError): never {
  const { status, code, message } = error;

  // ⚠️ Log ở mức `debug`: message của Supabase có thể chứa email người dùng. Ở mức `error` nó
  // sẽ vào log production và ở đó lâu hơn cần thiết.
  logger.debug(
    `Supabase Auth error status=${status ?? 'n/a'} code=${code ?? 'n/a'}: ${message}`,
  );

  // ⚠️ Nhận diện email chưa xác nhận TRƯỚC khi rơi vào nhánh 400 chung.
  //
  // Supabase trả `email_not_confirmed` với status 400. Không tách nhánh này thì người dùng
  // nhận "Dữ liệu gửi lên không hợp lệ" — một câu không nói họ phải làm gì, và họ sẽ thử lại
  // đúng thao tác vừa thất bại thay vì đi kiểm hộp thư.
  //
  // Đây là ngoại lệ có chủ ý với nguyên tắc "không phân biệt trường hợp": biết một email
  // **đã đăng ký nhưng chưa xác nhận** không giúp kẻ tấn công dò danh sách người dùng, vì
  // để tới được đây họ đã phải gõ đúng mật khẩu.
  if (code === 'email_not_confirmed') {
    throw new AppException(ErrorCode.EMAIL_NOT_CONFIRMED);
  }

  // ⚠️ SAI THÔNG TIN ĐĂNG NHẬP: SUPABASE TRẢ **400**, KHÔNG PHẢI 401
  //
  // Đo được trên Supabase thật (dự án Avantily): `signInWithPassword` với mật khẩu sai trả
  // `{ status: 400, code: 'invalid_credentials' }`.
  //
  // Không tách nhánh này thì nó rơi vào nhánh `status === 400` bên dưới và người dùng nhận
  // **400 "Dữ liệu gửi lên không hợp lệ"** cho một lần gõ sai mật khẩu. Câu đó nói sai hoàn
  // toàn: nó bảo dữ liệu gửi lên bị hỏng, nên người dùng sẽ đi kiểm lại form thay vì thử lại
  // mật khẩu. Và frontend không phân biệt được nó với một lỗi validation thật.
  //
  // Phải là **401 `CREDENTIALS_INVALID`**.
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    code === 'user_not_found'
  ) {
    throw new AppException(ErrorCode.CREDENTIALS_INVALID);
  }

  // Refresh token sai / đã thu hồi.
  if (code === 'refresh_token_not_found' || code === 'session_not_found') {
    throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
  }

  if (status === 429)
    throw new AppException(ErrorCode.TOO_MANY_REQUESTS, { seconds: 60 });
  if (status === 413) throw new AppException(ErrorCode.PAYLOAD_TOO_LARGE);
  if (status === 422) throw new AppException(ErrorCode.VALIDATION_FAILED);
  if (status === 400) throw new AppException(ErrorCode.VALIDATION_FAILED);
  if (status === 401) throw new AppException(ErrorCode.CREDENTIALS_INVALID);
  if (status === 403) throw new AppException(ErrorCode.FORBIDDEN);
  if (status === 404) throw new AppException(ErrorCode.NOT_FOUND);

  throw new AppException(ErrorCode.INTERNAL_ERROR);
}
