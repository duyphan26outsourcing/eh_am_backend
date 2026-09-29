/**
 * ============================================================================
 * TẦNG MODEL — RANH GIỚI GIỮA DÒNG DATABASE VÀ PHẢN HỒI API
 * ============================================================================
 *
 * ⚠️ QUY TẮC MỘT: KHÔNG BAO GIỜ TRẢ THẲNG MỘT DÒNG DATABASE RA API
 *
 * ```ts
 * // ❌ SAI
 * async findOne(id: string) {
 *   return this.repo.findById(id);           // trả nguyên `TableRow<'assets'>`
 * }
 *
 * // ✅ ĐÚNG
 * async findOne(id: string, scope: LocationScope) {
 *   return toAssetDetailModel(await this.repo.findInScope(id, scope));
 * }
 * ```
 *
 * Ba lý do, và lý do thứ nhất là lý do bảo mật:
 *
 *   1. **Cột nội bộ sẽ lộ ra mà không ai cố ý.** Một migration thêm `fast_asset_code`,
 *      `purchase_invoice_path`, `internal_note` vào bảng thì **ngay lập tức** cột đó có trong
 *      phản hồi API — không có bước nào phải sửa, không có test nào đỏ, không có ai review.
 *      Với Every Half điều này có thật: nhân viên cửa hàng được xem tài sản ở quầy của mình
 *      nhưng KHÔNG nhất thiết được xem nguyên giá, số hoá đơn hay nhà cung cấp.
 *
 *      Mapper làm điều ngược lại: cột mới **không** lộ ra tới khi có người viết thêm một
 *      dòng vào đây. Việc lộ dữ liệu trở thành một hành động cố ý, nhìn thấy được khi review.
 *
 *   2. **`snake_case` của Postgres đi ngược quy ước của frontend.** Frontend viết TypeScript,
 *      dùng `camelCase`. Trả `snake_case` buộc mỗi component tự đổi tên, và sẽ có chỗ đổi khác
 *      chỗ.
 *
 *   3. **Đổi schema không được phá vỡ API.** Tách bảng `assets` thành hai bảng (thông tin vật
 *      lý / thông tin tài chính) là việc bên trong; nếu API trả nguyên dòng thì đó là một thay
 *      đổi phá vỡ và phải lên version mới. Có mapper thì nó là một lần sửa một hàm.
 *
 * ============================================================================
 * ⚠️ QUY TẮC HAI: MAPPER KHÔNG PHẢI CHỖ KIỂM QUYỀN
 * ============================================================================
 *
 * Mapper là hàm thuần, không truy vấn gì, không biết người xem là ai. Nó **không** dùng để
 * lọc theo phạm vi location.
 *
 * Việc lọc phải xảy ra **ở câu truy vấn** (`WHERE location_id IN (...)`), tức ở repository.
 * Lý do: nếu lọc ở mapper thì dữ liệu không được phép xem **đã đi vào tiến trình** rồi mới bị
 * bỏ — và mọi thứ đứng giữa (log, cache, `total` của phân trang, một `console.log` khi gỡ
 * lỗi) đều đã nhìn thấy nó. Đếm số bản ghi cũng sai: `total` sẽ tính cả bản ghi bị lọc.
 *
 * Nói gọn: **repository quyết định thấy được gì; mapper quyết định hình dạng của thứ đã được
 * phép thấy.**
 *
 * ============================================================================
 * ⚠️ QUY TẮC BA: MỘT ĐỐI TƯỢNG CÓ THỂ CẦN NHIỀU MAPPER
 * ============================================================================
 *
 * Cùng một dòng `assets` hiện ra ba hình dạng khác nhau:
 *
 *   · `toAssetScanModel()`      — nhân viên quét QR tại quầy: tên, mã, vị trí, tình trạng,
 *                                 người quản lý. KHÔNG có nguyên giá, hoá đơn.
 *   · `toAssetDetailModel()`    — quản lý tài sản: thêm nhà cung cấp, bảo hành, chứng từ.
 *   · `toAssetFinanceModel()`   — kế toán: thêm nguyên giá, khấu hao, giá trị còn lại, mã FAST.
 *
 * ⚠️ Đây là cách làm **đúng**, không phải trùng lặp cần gộp. Gộp ba hình dạng thành một
 * mapper có tham số `viewerRole` là đưa quyết định phân quyền vào mapper — đúng thứ mà Quy
 * tắc Hai cấm. Và một `if (viewerRole === 'ACCOUNTANT')` bên trong mapper là một dòng rất dễ
 * bị gọi sai từ một endpoint mới.
 *
 * Ba hàm riêng thì mỗi endpoint chọn tường minh, và tên hàm nói rõ nó dành cho ai.
 *
 * ⚠️ North Star của sản phẩm là "quét bất kỳ tài sản nào → biết ngay nó là gì, ở đâu, ai
 * quản lý, giá trị bao nhiêu, lịch sử ra sao". "Giá trị bao nhiêu" hiện cho ai là **quyết
 * định phân quyền** (chốt trong tài liệu sản phẩm) — không phải chi tiết giao diện.
 *
 * ============================================================================
 * MẪU
 * ============================================================================
 *
 * ```ts
 * // src/assets/model/asset.model.ts
 * import type { TableRow } from '@/supabase/supabase.define';
 *
 * export interface AssetScanModel {
 *   id: string;
 *   assetCode: string;
 *   name: string;
 *   status: string;
 *   locationId: string;
 *   updatedAt: string | null;
 * }
 *
 * export function toAssetScanModel(row: TableRow<'assets'>): AssetScanModel {
 *   return {
 *     id: row.id,
 *     assetCode: row.asset_code,
 *     name: row.name,
 *     status: row.status,
 *     locationId: row.location_id,
 *     updatedAt: toIsoString(row.updated_at),
 *   };
 * }
 * ```
 *
 * ⚠️ KHÔNG dùng một hàm `snakeToCamel(row)` tự động để khỏi phải viết tay.
 *
 * Nó chạy được, và nó phá bỏ toàn bộ giá trị của tầng này: một cột mới trong migration lại
 * tự động xuất hiện trong phản hồi. Việc phải viết tay từng trường **chính là** cơ chế bảo
 * vệ — nó biến "lộ một cột" thành một hành động có người ký tên.
 */

/**
 * Chuẩn hoá `timestamptz` của Postgres về chuỗi ISO-8601 cho API.
 *
 * ⚠️ MỌI MỐC THỜI GIAN TRẢ RA API PHẢI LÀ ISO-8601 CÓ MÚI GIỜ (`...Z` hoặc `+07:00`).
 *
 * supabase-js trả `timestamptz` dưới dạng chuỗi, nhưng định dạng phụ thuộc cấu hình của
 * PostgREST và có thể là `2026-08-17 09:30:00+00` — thiếu chữ `T`. `new Date()` của
 * JavaScript **không** phân tích được dạng đó một cách nhất quán giữa các trình duyệt:
 * Safari trả `Invalid Date` ở đúng chỗ Chrome trả đúng. Triệu chứng là "màn hình lịch sử tài
 * sản hiện NaN trên iPhone của cửa hàng trưởng" — một lỗi rất khó truy ngược về đây.
 *
 * ⚠️ KHÔNG định dạng theo giờ Việt Nam ở backend. Backend trả mốc thời gian tuyệt đối;
 * việc hiển thị "3 giờ trước" hay "17/08/2026 16:30" là của frontend, nơi biết múi giờ và
 * ngôn ngữ của người đang xem.
 *
 * ⚠️ NGOẠI LỆ CÓ CHỦ Ý: **kỳ kế toán** (tháng khấu hao, kỳ kiểm kê) là khái niệm theo giờ Việt
 * Nam (Asia/Ho_Chi_Minh), không phải UTC. Tài sản đưa vào sử dụng lúc 23:30 ngày 31/10 giờ VN
 * là 16:30 UTC cùng ngày — nhưng nếu tính kỳ theo UTC thì một tài sản nhận lúc 01:00 ngày 1/11
 * giờ VN (18:00 UTC ngày 31/10) sẽ bị tính khấu hao từ tháng 10. Kỳ phải được tính ở tầng dữ
 * liệu với múi giờ tường minh — quy tắc cụ thể chốt cùng kế toán khi làm module khấu hao.
 */
export function toIsoString(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(
    value.includes('T') ? value : value.replace(' ', 'T'),
  );
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/**
 * Chuẩn hoá `numeric`/`bigint` của Postgres về `number`.
 *
 * ⚠️ CỘT `numeric` TRẢ VỀ **CHUỖI**, KHÔNG PHẢI SỐ
 *
 * `original_cost`, `accumulated_depreciation`, `repair_cost` sẽ là `numeric` — Postgres và
 * PostgREST trả chúng dưới dạng chuỗi để không mất độ chính xác. Nghĩa là:
 *
 *     row.original_cost + row.repair_cost   // "45000000" + "1200000" = "450000001200000"
 *
 * Đó là một lỗi **không** làm hỏng gì ngay: nó cho ra một con số, chỉ là con số sai. Trên sổ
 * tài sản sẽ đối chiếu với FAST, đó là loại lỗi tệ nhất.
 *
 * ⚠️ VÀ ĐÂY LÀ GIỚI HẠN CỦA HÀM NÀY: `number` CỦA JAVASCRIPT LÀ IEEE-754
 *
 * An toàn tới `Number.MAX_SAFE_INTEGER` (~9.007 × 10¹⁵). Với VND (không có phần thập phân),
 * đó là khoảng 9 triệu tỉ đồng — dư xa cho mọi tài sản. Nhưng **không** dùng `number` cho phép
 * tính cộng dồn nhiều bước ở backend: tổng giá trị còn lại của một cửa hàng phải tính bằng
 * `SUM()` trong Postgres (nơi `numeric` là số thập phân chính xác), rồi mới đổi sang `number`
 * ở bước cuối để trả ra API.
 *
 * ⚠️ KHẤU HAO LÀ NƠI SAI SỐ LÀM TRÒN THÀNH CHÊNH LỆCH VỚI FAST
 *
 * 45.000.000 đ khấu hao 36 tháng = 1.250.000 đ/tháng — chia hết. Nhưng 10.000.000 đ / 36 tháng
 * = 277.777,77… đ. Làm tròn từng tháng rồi cộng dồn sẽ lệch vài đồng so với nguyên giá ở tháng
 * cuối, và lệch với cách FAST làm tròn. Quy tắc làm tròn và **tháng điều chỉnh cuối kỳ** là
 * quy tắc nghiệp vụ phải chốt với kế toán, tính trong database, không tính ở đây.
 */
export function toNumber(value: string | number | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
