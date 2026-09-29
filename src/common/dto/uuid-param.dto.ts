import { IsUUID } from 'class-validator';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Tham số đường dẫn là UUID.
 *
 * ⚠️ VÌ SAO PHẢI VALIDATE Ở ĐÂY CHỨ KHÔNG ĐỂ POSTGRES BÁO
 *
 * Mọi cột `*_id` trong schema là `UUID`. Đưa một chuỗi thường xuống làm Postgres raise
 * `22P02 invalid input syntax for type uuid` ở tận đáy — và người dùng nhận lỗi ở một màn
 * hình chẳng liên quan gì tới chỗ giá trị sai được nhập.
 *
 * Chặn ở DTO thì lỗi là 400 với mã `INVALID_REFERENCE_ID`.
 *
 * ⚠️ `message` LÀ MÃ LỖI, KHÔNG PHẢI CÂU TIẾNG VIỆT
 *
 * `class-validator` chỉ nhận chuỗi, nên DTO không ném được `AppException`. Đặt `message` là mã
 * lỗi thì `AllExceptionsFilter` nhận ra và dịch theo ngôn ngữ người đọc (xem §Validation trong
 * filter). Đây là mẫu cho mọi DTO mới.
 *
 * ⚠️ PHÂN BIỆT UUID VỚI MÃ TÀI SẢN
 *
 * Mã in trên tem QR (ví dụ `EH-ESP-000123`) là **mã nghiệp vụ**, không phải UUID. Endpoint tra
 * cứu theo mã tem phải có DTO riêng với pattern của mã tài sản — ép nó qua `UuidParamDto` sẽ chặn
 * mọi lượt quét hợp lệ.
 *
 * Cách dùng:
 *
 * ```ts
 * @Get(':id')
 * findOne(@Param() params: UuidParamDto) { ... }
 * ```
 *
 * Với route có nhiều tham số UUID, khai một DTO riêng thay vì tái dùng cái này:
 *
 * ```ts
 * export class TransferLineParamsDto {
 *   @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID }) transferId!: string;
 *   @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID }) lineId!: string;
 * }
 * ```
 */
export class UuidParamDto {
  @IsUUID('4', { message: ErrorCode.INVALID_REFERENCE_ID })
  id!: string;
}
