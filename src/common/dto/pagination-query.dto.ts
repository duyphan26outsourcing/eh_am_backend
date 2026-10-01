import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * DTO phân trang dùng chung cho mọi endpoint danh sách.
 *
 * ⚠️ `@Max(100)` LÀ RÀNG BUỘC BẢO MẬT, KHÔNG PHẢI TỐI ƯU HIỆU NĂNG
 *
 * Không có nó thì `?pageSize=999999` là một cách kéo toàn bộ sổ tài sản bằng một request. Với
 * Every Half, điều đó nghiêm trọng hơn bình thường: biên bảo mật là **phạm vi location** của
 * người gọi, tự lọc ở từng truy vấn — nếu một endpoint có lỗ hổng lọc ở đâu đó, `pageSize`
 * không giới hạn là cách rút dữ liệu (kể cả nguyên giá, giá trị còn lại) nhanh nhất qua lỗ đó.
 *
 * ⚠️ Xuất báo cáo đầy đủ (Excel toàn bộ sổ tài sản cho kế toán) KHÔNG làm bằng cách nâng mức
 * này — nó là một endpoint xuất riêng, chạy nền, có kiểm quyền riêng và có ghi audit.
 *
 * ⚠️ `@Type(() => Number)` LÀ BẮT BUỘC
 *
 * Query param luôn là string. Không có `@Type` thì `@IsInt()` nhận `"20"` và **luôn**
 * thất bại — nhưng chỉ thất bại ở runtime, và thông báo lỗi ("must be an integer") trông
 * như lỗi của client trong khi thực ra là thiếu một dòng ở DTO.
 *
 * Cách dùng — kế thừa rồi thêm bộ lọc riêng:
 *
 * ```ts
 * export class QueryAssetsDto extends PaginationQueryDto {
 *   @IsOptional() @IsUUID('4') locationId?: string;
 *   @IsOptional() @IsIn(ASSET_STATUS_VALUES) status?: AssetStatus;
 * }
 * ```
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên.' })
  @Min(1, { message: 'page nhỏ nhất là 1.' })
  // ⚠️ Chặn trên: `(page-1)*pageSize` là offset int4 trong RPC; `page` khổng lồ làm tràn int4
  // (Postgres 22003 → 500) thay vì một trang rỗng. Không có use case nào cần quá 100k trang.
  @Max(100_000, { message: 'page lớn nhất là 100000.' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize phải là số nguyên.' })
  @Min(1, { message: 'pageSize nhỏ nhất là 1.' })
  @Max(100, { message: 'pageSize lớn nhất là 100.' })
  pageSize: number = 20;
}

/**
 * Sắp xếp dùng chung.
 *
 * ⚠️ KHÔNG nhận tên cột trực tiếp từ client. Mỗi endpoint tự khai một danh sách CHO PHÉP
 * và ánh xạ `sortBy` sang tên cột thật:
 *
 * ```ts
 * const SORT_MAP = { newest: 'created_at', value: 'original_cost' } as const;
 * const column = SORT_MAP[query.sortBy] ?? 'created_at';
 * ```
 *
 * Nhận tên cột trực tiếp cho phép client sắp theo một cột không nên lộ, và với một số
 * driver là mở đường cho tiêm truy vấn.
 */
export const SortDirection = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortDirection = (typeof SortDirection)[keyof typeof SortDirection];
