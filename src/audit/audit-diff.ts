import type { Json } from '@/supabase/database.types';

/**
 * Phần "Trước/Sau" của một dòng audit: `{ tenTruong: { from, to } }`.
 *
 * Ví dụ một lần điều chuyển được xác nhận nhận hàng:
 *
 * ```json
 * {
 *   "location_id":    { "from": "…kho-tong…", "to": "…store-q1…" },
 *   "cost_center_id": { "from": "…cc-kho…",   "to": "…cc-q1…" },
 *   "status":         { "from": "IN_TRANSIT", "to": "IN_USE" }
 * }
 * ```
 */
export type AuditChanges = Record<string, { from: Json; to: Json }>;

/**
 * So hai trạng thái của một bản ghi và trả về các trường đã đổi.
 *
 * ⚠️ `fields` LÀ DANH SÁCH CHO PHÉP (ALLOW-LIST), BẮT BUỘC
 *
 * Không có tham số này thì cách tiện nhất là so toàn bộ object — và một ngày nào đó object
 * đó mang theo một trường không nên nằm trong bảng chỉ-ghi-thêm (đường dẫn ký tạm của tệp,
 * toạ độ GPS chi tiết, ghi chú nội bộ). Bảng audit không xoá được, nên "lỡ ghi" là ghi vĩnh
 * viễn. Bắt người gọi liệt kê trường là biến việc đưa một trường vào lịch sử thành một hành
 * động cố ý, review được.
 *
 * ⚠️ `before = null` nghĩa là TẠO MỚI: mọi trường có giá trị đều hiện `from: null`.
 *
 * Trả `null` (không phải `{}`) khi không có gì đổi, để người gọi phân biệt được "cập nhật
 * không có thay đổi" — trường hợp nên chặn ở service, vì một dòng audit "đã cập nhật" mà không
 * có thay đổi nào là một dòng nhiễu nằm vĩnh viễn trong lịch sử tài sản.
 */
export function diffFields<T extends Record<string, unknown>>(
  before: Partial<T> | null | undefined,
  after: Partial<T> | null | undefined,
  fields: readonly (keyof T & string)[],
): AuditChanges | null {
  const changes: AuditChanges = {};

  for (const field of fields) {
    const from = toJsonValue(before?.[field]);
    const to = toJsonValue(after?.[field]);

    if (stableStringify(from) !== stableStringify(to)) {
      changes[field] = { from, to };
    }
  }

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Đưa một giá trị bất kỳ về dạng JSON lưu được.
 *
 * ⚠️ `undefined` → `null`. Hai giá trị này phải coi là **bằng nhau**: một bản ghi đọc từ
 * database có `null`, một DTO cập nhật không gửi trường đó có `undefined`. Coi là khác nhau
 * thì mọi lần cập nhật một phần sẽ ghi ra hàng loạt "thay đổi" giả `null → undefined`.
 *
 * ⚠️ `Date` → chuỗi ISO. `JSON.stringify` cũng làm vậy, nhưng làm tường minh ở đây để việc so
 * sánh không phụ thuộc vào chỗ nào đã gọi `JSON.stringify` trước.
 */
function toJsonValue(value: unknown): Json {
  if (value === undefined || value === null) return null;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }
  // Object/array: đi một vòng JSON để bỏ hàm, `undefined` lồng bên trong, prototype…
  return JSON.parse(JSON.stringify(value)) as Json;
}

/**
 * `JSON.stringify` với khoá đã sắp xếp.
 *
 * ⚠️ Cần vì `{ a: 1, b: 2 }` và `{ b: 2, a: 1 }` là **cùng một giá trị** nhưng
 * `JSON.stringify` cho ra hai chuỗi khác nhau — PostgREST không cam kết thứ tự khoá của cột
 * `jsonb` trả về. So bằng chuỗi thường thì một trường JSON không đổi vẫn bị báo là đã đổi.
 */
function stableStringify(value: Json): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map(
      (key) => `${JSON.stringify(key)}:${stableStringify(value[key] ?? null)}`,
    )
    .join(',')}}`;
}
