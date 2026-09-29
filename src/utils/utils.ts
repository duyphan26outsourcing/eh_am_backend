import type { Request } from 'express';
import { AuthRequest } from '../auth/auth.interface';
import { JwtPayload } from '../auth/types';
import { SUPER_ADMIN_METADATA_ROLE } from './enums/role.enum';

/**
 * Quản trị tối cao (break-glass) — vai trò duy nhất đọc từ JWT chứ không từ
 * `context_role_assignments`.
 *
 * ⚠️ VÌ SAO NGOẠI LỆ NÀY TỒN TẠI
 *
 * `app_metadata.role` chỉ đặt được bằng `service_role` key (tức từ backend hoặc SQL
 * Editor), người dùng **không** tự sửa được — nên nó tin được. Cần một vai trò nằm
 * ngoài bảng phân quyền để còn đường vào khi chính bảng phân quyền bị cấu hình sai.
 *
 * ⚠️ ĐI XUYÊN KIỂM VAI TRÒ, KHÔNG ĐI XUYÊN PHÂN TÁCH NHIỆM VỤ
 *
 * Super admin qua được `PermissionsGuard` ở mọi phạm vi. Nhưng các quy tắc phân tách nhiệm
 * vụ ở tầng nghiệp vụ (người đề nghị thanh lý không tự duyệt; người xuất hàng không tự xác
 * nhận nhận hàng) vẫn áp cho họ — chúng nằm ở service, không ở guard.
 *
 * Mọi vai trò nghiệp vụ khác PHẢI đi qua `context_role_assignments`.
 */
export function isSuperAdmin(user: JwtPayload): boolean {
  return user.app_metadata?.role === SUPER_ADMIN_METADATA_ROLE;
}

export function accessTokenFromAuthReq(req: AuthRequest): string {
  return getAccessToken(req.headers.authorization);
}

export function getAccessToken(authorization?: string): string {
  return authorization?.split(' ')[1] ?? '';
}

export const isProd = process.env.NODE_ENV === 'production';

/**
 * Bucket lưu ảnh: ảnh tài sản, ảnh chụp lúc quét kiểm kê, ảnh báo hỏng.
 *
 * ⚠️ PRIVATE, KHÔNG PUBLIC. Ảnh tài sản trông vô hại, nhưng ảnh chụp lúc kiểm kê có thể lộ
 * người, quầy thu ngân, màn hình POS. Mọi lượt xem đi qua URL ký có thời hạn do backend cấp
 * sau khi kiểm phạm vi location.
 */
export const EH_ASSET_MEDIA_BUCKET = 'eh-asset-media';
/** Bucket lưu chứng từ: hoá đơn, PO, biên bản bàn giao/thanh lý, báo giá sửa chữa. Private. */
export const EH_DOCUMENT_BUCKET = 'eh-documents';

// =========================================================================
// MÃ NHÂN VIÊN
// =========================================================================

/**
 * Mã nhân viên (do Every Half cấp, khớp hệ thống nhân sự) — chữ in hoa, số, `.`, `_`, `-`;
 * 2–30 ký tự.
 *
 * ⚠️ Chỉ ASCII: mã này xuất hiện trên biên bản bàn giao in ra và trong tệp đối chiếu với các
 * hệ thống khác. Cho chữ có dấu thì cùng một mã gõ trên hai bàn phím (tổ hợp/dựng sẵn) thành
 * hai chuỗi khác nhau — lọt qua ràng buộc UNIQUE.
 */
export const EMPLOYEE_CODE_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._-]{0,28}[A-Za-z0-9]$/;

/**
 * Chuẩn hoá mã nhân viên trước khi lưu hoặc so sánh: bỏ khoảng trắng hai đầu, in hoa.
 *
 * ⚠️ Database có CHECK buộc `employee_code = upper(btrim(employee_code))` — quên chuẩn hoá ở
 * đây thì câu INSERT bị từ chối với `VALUE_OUT_OF_DOMAIN` thay vì lọt qua thành hai mã
 * `eh0123` / `EH0123` "khác nhau".
 */
export function normalizeEmployeeCode(code: string): string {
  return code.trim().toUpperCase();
}

// =========================================================================
// TÌM KIẾM TIẾNG VIỆT
// =========================================================================

/**
 * Bỏ dấu tiếng Việt để so khớp tìm kiếm.
 *
 * Dùng cho ô tìm kiếm: người dùng gõ "may pha" phải tìm ra "Máy pha cà phê".
 * KHÔNG dùng để lưu — dữ liệu lưu phải giữ nguyên dấu.
 */
export function normalizeKeyword(q: string): string {
  return q
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

/**
 * Bỏ ký tự có nghĩa đặc biệt trong `ilike` của Postgres.
 *
 * ⚠️ Không có bước này, người dùng gõ `%` sẽ thành wildcard quét toàn bảng, và gõ `,`
 * sẽ phá cú pháp của `.or()` trong supabase-js — câu truy vấn trở thành một filter
 * khác hẳn ý định.
 */
export function sanitizeSearchTerm(search?: string): string | null {
  const value = (search ?? '').trim();
  if (!value) return null;
  return value.replace(/[%_,()]/g, ' ').trim() || null;
}

// =========================================================================
// CHÍNH SÁCH MẬT KHẨU — dùng CHUNG cho mọi nơi tạo tài khoản
// Frontend phải có bản đối chiếu; sửa một bên thì phải sửa bên kia.
// =========================================================================

export const PASSWORD_MIN_LENGTH = 8;
/** Giới hạn của bcrypt/Supabase Auth — dài hơn 72 byte sẽ bị cắt âm thầm. */
export const PASSWORD_MAX_LENGTH = 72;

/**
 * Yêu cầu: tối thiểu 8 ký tự, có ít nhất 1 chữ, 1 số và 1 ký tự đặc biệt.
 *
 * Dùng `\p{L}`/`\p{N}` (Unicode) thay vì `[A-Za-z0-9]` để không loại oan mật khẩu
 * chứa chữ có dấu; "ký tự đặc biệt" định nghĩa là bất cứ gì không phải chữ và không
 * phải số, nên khoảng trắng trong passphrase cũng được tính.
 */
export const PASSWORD_PATTERN =
  /^(?=.*\p{L})(?=.*\p{N})(?=.*[^\p{L}\p{N}]).{8,}$/u;

export const PASSWORD_RULES_MESSAGE =
  'Mật khẩu phải có tối thiểu 8 ký tự, gồm ít nhất 1 chữ, 1 số và 1 ký tự đặc biệt.';

// =========================================================================
// KHÁC
// =========================================================================

/**
 * Nhận dạng UUID để chặn giá trị không phải UUID **trước khi** nó xuống tới Postgres.
 *
 * Cần thiết vì mọi cột `*_id` đều là `UUID`: đưa một chuỗi thường xuống làm Postgres
 * raise `22P02 invalid input syntax for type uuid` ở tận đáy, và người dùng nhận lỗi
 * ở một màn hình chẳng liên quan gì tới chỗ giá trị sai được nhập.
 */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Làm sạch tên tệp upload — bỏ dấu, bỏ ký tự đường dẫn. */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9.-]/g, '_');
}

/**
 * Địa chỉ IP thật của người gọi, dùng cho `audit_events.ip_address`.
 *
 * ⚠️ `req.ip` chỉ đúng khi `trust proxy` được đặt khớp số tầng proxy thật — xem chú
 * thích dài ở `src/bootstrap.ts`. Đặt sai thì giá trị ghi vào audit log là IP của tầng
 * proxy, không phải của người dùng, và bảng audit là bảng chỉ-ghi-thêm nên **không
 * sửa lại được**.
 */
export function clientIp(req: Request): string | null {
  return req.ip ?? null;
}

/**
 * `User-Agent` của người gọi, dùng cho `audit_events.user_agent`.
 *
 * ⚠️ Cắt ở 512 ký tự. Header này do client kiểm soát hoàn toàn và không có giới hạn độ dài
 * nào ràng buộc nó; không cắt thì mỗi dòng audit có thể mang vài kilobyte rác — trên một
 * bảng chỉ-ghi-thêm, lưu lâu hơn mọi bảng khác. Một User-Agent thật dài nhất cũng dưới 300
 * ký tự.
 */
export function clientUserAgent(req: Request): string | null {
  const raw = req.headers['user-agent'];
  if (typeof raw !== 'string' || raw.length === 0) return null;
  return raw.slice(0, 512);
}
