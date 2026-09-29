/**
 * Hình dạng phản hồi của mọi endpoint danh sách.
 *
 * ⚠️ MỌI ENDPOINT DANH SÁCH TRẢ ĐÚNG HÌNH DẠNG NÀY, KHÔNG CÓ NGOẠI LỆ
 *
 * Frontend dựng một hook dùng chung cho phân trang. Một endpoint trả `{ data, meta }`
 * trong khi phần còn lại trả `{ items, total }` buộc frontend viết trường hợp riêng — và
 * trường hợp riêng đó sẽ được sao chép sang chỗ khác.
 *
 * `total` là **tổng số bản ghi khớp bộ lọc**, không phải số bản ghi trong trang hiện tại.
 * Supabase trả nó qua `{ count: 'exact' }`.
 *
 * ⚠️ `count: 'exact'` chạy một `COUNT(*)` thật trên bộ lọc. Với bảng lớn và bộ lọc rộng,
 * đó là truy vấn tốn nhất của cả request. Khi một endpoint danh sách bắt đầu chậm, đây là
 * chỗ nhìn trước — cân nhắc `count: 'planned'` (dùng thống kê của Postgres, nhanh nhưng
 * gần đúng) cho những danh sách mà con số chính xác không quan trọng.
 */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * Dựng phản hồi phân trang từ kết quả Supabase.
 *
 * Gom vào một hàm để không có chỗ nào trả `total: data.length` — một lỗi dễ mắc và làm
 * frontend tính sai số trang.
 */
export function paginated<T>(
  items: T[] | null,
  total: number | null,
  page: number,
  pageSize: number,
): PaginatedResult<T> {
  return {
    items: items ?? [],
    total: total ?? 0,
    page,
    pageSize,
  };
}

/**
 * Khoảng `range` cho Supabase, tính từ `page` và `pageSize`.
 *
 * ⚠️ Supabase `.range(from, to)` là **bao gồm cả hai đầu**, khác `LIMIT/OFFSET`. Nên `to`
 * là `from + pageSize - 1`, không phải `from + pageSize`. Sai chỗ này làm mỗi trang trả
 * thừa một bản ghi — và bản ghi thừa đó là bản ghi đầu của trang sau, nên nó xuất hiện hai
 * lần trên giao diện.
 */
export function rangeOf(page: number, pageSize: number): [number, number] {
  const from = (page - 1) * pageSize;
  return [from, from + pageSize - 1];
}
