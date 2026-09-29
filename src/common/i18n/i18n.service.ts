import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_LOCALE, Locale } from './locale.const';
import { ERROR_DEFINITIONS, ErrorCode } from './error-code.const';
import { MESSAGE_DEFINITIONS, MessageCode } from './message-code.const';

export type MessageParams = Readonly<Record<string, string | number>>;

/**
 * Dịch mã lỗi thành câu thông báo theo ngôn ngữ của người đọc.
 *
 * ⚠️ VÌ SAO KHÔNG DÙNG `nestjs-i18n` HAY MỘT THƯ VIỆN i18n
 *
 * Thư viện i18n đọc bản dịch từ tệp JSON lúc chạy. Điều đó có một hệ quả mà repo này không
 * chấp nhận: **thiếu một bản dịch không phải lỗi biên dịch**. Nó chỉ lộ ra khi người dùng gặp
 * đúng lỗi đó — tức những lỗi ít gặp nhất sẽ là những lỗi thiếu bản dịch lâu nhất.
 *
 * `ERROR_DEFINITIONS` là một object TypeScript có `satisfies Record<ErrorCode, ...>`, nên
 * thêm một mã lỗi mà quên dịch **không biên dịch được**. Đó là toàn bộ lý do chọn cách này.
 *
 * Đánh đổi: đổi một câu chữ phải deploy lại. Chấp nhận được — đây là thông báo lỗi hệ thống,
 * không phải nội dung marketing cần sửa hằng ngày.
 *
 * ⏳ Khi nào nên chuyển sang thư viện: khi có người **không phải lập trình viên** cần sửa bản
 * dịch, hoặc khi số ngôn ngữ vượt 3–4.
 */
@Injectable()
export class I18nService {
  private readonly logger = new Logger(I18nService.name);

  /**
   * Câu thông báo cho một mã lỗi.
   *
   * ⚠️ Không bao giờ ném lỗi. Hàm này chạy trong `AllExceptionsFilter` — tức nó đang xử lý
   * một lỗi. Một lỗi ở đây sẽ che mất lỗi gốc và biến mọi thứ thành 500 không có thông tin.
   */
  translate(code: ErrorCode, locale: Locale, params?: MessageParams): string {
    const definition = ERROR_DEFINITIONS[code];

    if (!definition) {
      // Tới được đây nghĩa là có ai đó ép kiểu một chuỗi thành `ErrorCode`.
      this.logger.error(
        `Mã lỗi không có trong ERROR_DEFINITIONS: "${code}". ` +
          'Kiểm tra chỗ nào đã ép kiểu chuỗi thành ErrorCode.',
      );
      return ERROR_DEFINITIONS.INTERNAL_ERROR.messages[locale];
    }

    // `?? DEFAULT_LOCALE` là lưới an toàn cho trường hợp `locale` tới từ một chỗ chưa kiểm
    // kiểu. `satisfies` đã bảo đảm mọi Locale hợp lệ đều có bản dịch, nên nhánh này không
    // chạy trong luồng bình thường.
    const template =
      definition.messages[locale] ?? definition.messages[DEFAULT_LOCALE];

    return params ? this.interpolate(template, params) : template;
  }

  /** Mã HTTP gắn với một mã lỗi. Khai cùng chỗ với bản dịch — xem `ERROR_DEFINITIONS`. */
  statusOf(code: ErrorCode): number {
    return ERROR_DEFINITIONS[code]?.status ?? 500;
  }

  /**
   * Câu thông báo **thành công** cho một mã — xem `message-code.const.ts` về lý do tồn tại.
   *
   * Cùng quy tắc với `translate()`: không ném lỗi, thiếu ngôn ngữ thì rơi về `vi`.
   */
  translateMessage(
    code: MessageCode,
    locale: Locale,
    params?: MessageParams,
  ): string {
    const definition = MESSAGE_DEFINITIONS[code];
    const template = definition[locale] ?? definition[DEFAULT_LOCALE];
    return params ? this.interpolate(template, params) : template;
  }

  /**
   * Thay `{ten}` bằng giá trị trong `params`.
   *
   * ⚠️ CHỖ CHÈN KHÔNG CÓ GIÁ TRỊ THÌ GIỮ NGUYÊN `{ten}`, KHÔNG XOÁ ĐI
   *
   * Giữ nguyên làm lỗi lộ ra ngay: người đọc thấy `Mã nhân viên "{employeeCode}" đã gắn…` và
   * báo lại. Xoá đi cho ra `Mã nhân viên "" đã gắn…` — một câu trông bình thường nhưng thiếu
   * thông tin, và không ai biết là có lỗi.
   *
   * ⚠️ KHÔNG dùng `eval`, `new Function`, hay template engine. Chuỗi mẫu tới từ
   * `ERROR_DEFINITIONS` (do ta viết) nhưng `params` có thể chứa dữ liệu người dùng — ví dụ
   * `{employeeCode}` là mã họ vừa gõ. Một template engine cho phép biểu thức trong chuỗi là mở
   * đường tiêm mã qua dữ liệu đầu vào.
   */
  private interpolate(template: string, params: MessageParams): string {
    return template.replace(/\{(\w+)\}/g, (whole, key: string) => {
      const value = params[key];
      return value === undefined ? whole : String(value);
    });
  }
}
