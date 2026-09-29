import { Logger } from '@nestjs/common';
import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/supabase/database.types';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import {
  PaginatedResult,
  paginated,
  rangeOf,
} from '@/common/interfaces/paginated-result.interface';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Hình dạng mà mọi truy vấn Supabase trả về.
 *
 * Khai lại thay vì import `PostgrestResponse` vì `PostgrestResponse` có nhiều biến thể
 * (`PostgrestSingleResponse`, `PostgrestMaybeSingleResponse`, …) và bốn hàm bên dưới chỉ
 * cần đúng ba trường này.
 */
interface QueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  count?: number | null;
}

/**
 * ============================================================================
 * LỚP REPOSITORY CƠ SỞ
 * ============================================================================
 *
 * ⚠️ VÌ SAO CÓ TẦNG REPOSITORY KHI ĐÃ CÓ SUPABASE CLIENT
 *
 * `supabase-js` đã là một client tiện dùng, nên câu hỏi hợp lý là tại sao không gọi thẳng
 * từ service. Ba lý do, và cả ba đều xuất phát từ một quyết định kiến trúc đã chốt: **biên
 * bảo mật dữ liệu của Every Half là phạm vi location của người gọi**, và backend dùng
 * `service_role` nên RLS không tự làm việc đó (xem `01_identity_rbac_audit.sql`).
 *
 *   1. **Chỗ duy nhất biết tên bảng và tên cột.** Khi đổi schema, sửa một tầng chứ không
 *      grep cả `src/`. Với schema còn đang lớn lên từng migration, đây không phải lo xa.
 *
 *   2. **Chỗ duy nhất áp bộ lọc phạm vi location.** Vì không có RLS chặn `service_role`, biên
 *      bảo mật là điều kiện `WHERE location_id IN (...)` do chính ta viết. Gom việc viết điều
 *      kiện đó vào một tầng làm nó **kiểm tra được** — một reviewer đọc repository là thấy đủ,
 *      không phải đi tìm trong service, controller, hay một hàm helper nào đó.
 *
 *   3. **Chỗ duy nhất đổi lỗi Postgres thành lỗi HTTP.** Nếu mỗi service tự xử lý `error`,
 *      sẽ có chỗ quên và trả `data: null` như thể "không tìm thấy" — trong khi thật ra
 *      truy vấn đã lỗi. Đó là loại lỗi im lặng tệ nhất: nó trông giống dữ liệu rỗng. Với
 *      kiểm kê, "không tìm thấy tài sản" và "truy vấn lỗi" dẫn tới hai kết luận khác hẳn nhau
 *      (báo mất tài sản vs. thử lại).
 *
 * ⚠️ ĐIỀU REPOSITORY KHÔNG LÀM
 *
 *   ❌ Không kiểm quyền vai trò. Đó là việc của guard (`PermissionsGuard`) và của service.
 *   ❌ Không ghi audit. Đó là việc của service — vì chỉ service biết hành động nghiệp vụ
 *      nào đang diễn ra (và **lý do** của nó); repository chỉ thấy một câu `UPDATE`.
 *   ❌ Không chứa logic nghiệp vụ. `if (asset.status === 'DISPOSED')` thuộc service.
 *
 * Ranh giới đó quan trọng: một repository biết về quyền sẽ bị gọi từ hai chỗ với hai kỳ
 * vọng khác nhau về việc ai đã kiểm quyền, và chỗ thứ hai là chỗ rò rỉ.
 *
 * ⚠️ REPOSITORY DÙNG `service_role` — KHÔNG CÓ LƯỚI AN TOÀN
 *
 * `this.db` bỏ qua RLS. Mỗi phương thức đọc dữ liệu tài sản **phải** nhận phạm vi location
 * của người gọi để tự lọc. Chữ ký như `findById(id: string)` cho một bảng có dữ liệu theo
 * location là một chữ ký sai — nó không có chỗ nào để đặt điều kiện lọc, nên người dùng nó
 * sẽ tin rằng có ai đó khác đã lọc.
 *
 * ✅ `findInScope(id: string, scope: LocationScope)`
 * ❌ `findById(id: string)` — trừ khi bảng đó không thuộc location nào (ví dụ danh mục loại
 *    tài sản)
 *
 * `LocationScope` lấy từ `AccessScopeService.resolveLocationScope()` — xem
 * `src/auth/access-scope.service.ts` và hàm `applyLocationScope()` ở đó.
 *
 * ============================================================================
 * CÁCH DÙNG
 * ============================================================================
 *
 * ```ts
 * @Injectable()
 * export class AssetRepository extends BaseRepository {
 *   constructor(supabaseAdmin: SupabaseAdminService) {
 *     super(supabaseAdmin, AssetRepository.name);
 *   }
 *
 *   async listInScope(scope: LocationScope, page: number, pageSize: number) {
 *     const [from, to] = this.range(page, pageSize);
 *     const query = this.db
 *       .from(SupabaseTable.ASSETS)
 *       .select('id, asset_code, name, status, location_id', { count: 'exact' });
 *     return this.page(
 *       await applyLocationScope(query, scope, 'location_id')
 *         .order('created_at', { ascending: false })
 *         .range(from, to),
 *       page,
 *       pageSize,
 *     );
 *   }
 * }
 * ```
 */
export abstract class BaseRepository {
  protected readonly logger: Logger;

  protected constructor(
    private readonly supabaseAdmin: SupabaseAdminService,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
  }

  /**
   * Client `service_role`.
   *
   * ⚠️ `protected` chứ không `public`: chỉ repository con dùng được. Nếu một service cần
   * `db` trực tiếp thì đó là dấu hiệu thiếu một phương thức ở repository — thêm phương
   * thức, đừng mở quyền truy cập.
   */
  protected get db(): SupabaseClient<Database> {
    return this.supabaseAdmin.client;
  }

  /** Khoảng `range` cho Supabase. Xem `rangeOf` để biết vì sao `to` phải trừ 1. */
  protected range(page: number, pageSize: number): [number, number] {
    return rangeOf(page, pageSize);
  }

  /**
   * Truy vấn **phải** trả dữ liệu. Lỗi → HttpException. Không có dòng nào → 404.
   *
   * Dùng cho `.single()` khi bản ghi bắt buộc phải tồn tại.
   */
  protected must<T>(result: QueryResult<T>): T {
    if (result.error) {
      mapSupabasePostgrestError(result.error);
    }
    if (result.data === null) {
      // Tới được đây nghĩa là `error` rỗng mà `data` cũng rỗng. Với `.single()` thì
      // PostgREST trả `PGRST116` và đã bị `mapSupabasePostgrestError` bắt ở trên, nên
      // trường hợp này chỉ xảy ra với `.maybeSingle()` — tức người gọi chọn sai hàm.
      //
      // ⚠️ Với dữ liệu theo location, "không thấy" có hai nghĩa: không tồn tại, HOẶC tồn tại
      // nhưng nằm ngoài phạm vi của người gọi. Trả **cùng một** 404 cho cả hai là chủ ý: phân
      // biệt được thì một nhân viên dò được mã tài sản nào tồn tại ở cửa hàng khác.
      throw new AppException(ErrorCode.NOT_FOUND);
    }
    return result.data;
  }

  /**
   * Truy vấn **có thể** không có dữ liệu. Lỗi → HttpException. Không có dòng nào → `null`.
   *
   * Dùng cho `.maybeSingle()` khi "không tồn tại" là một kết quả nghiệp vụ hợp lệ (kiểm mã
   * nhân viên đã dùng chưa, kiểm tài sản đã có trong phiếu kiểm kê chưa, …).
   *
   * ⚠️ Vẫn ném lỗi khi truy vấn thất bại. Đây là điểm khác biệt với việc đọc `data` trực
   * tiếp: `?? null` sẽ biến một lỗi kết nối thành "không tìm thấy", và luồng nghiệp vụ sẽ
   * đi tiếp như thể mã đó còn trống.
   */
  protected maybe<T>(result: QueryResult<T>): T | null {
    if (result.error) {
      mapSupabasePostgrestError(result.error);
    }
    return result.data;
  }

  /**
   * Truy vấn trả danh sách. Lỗi → HttpException. Không có dòng nào → `[]`.
   */
  protected many<T>(result: QueryResult<T[]>): T[] {
    if (result.error) {
      mapSupabasePostgrestError(result.error);
    }
    return result.data ?? [];
  }

  /**
   * Truy vấn phân trang. Đòi hỏi `select(..., { count: 'exact' })` ở phía gọi.
   *
   * ⚠️ Thiếu `{ count: 'exact' }` thì `count` là `null` và `total` thành `0` — danh sách
   * hiện đủ bản ghi nhưng bộ điều hướng trang nói "0 kết quả". Log cảnh báo ở đây để lỗi
   * đó lộ ra ở môi trường dev thay vì lên tới giao diện.
   */
  protected page<T>(
    result: QueryResult<T[]>,
    page: number,
    pageSize: number,
  ): PaginatedResult<T> {
    if (result.error) {
      mapSupabasePostgrestError(result.error);
    }
    if (result.count === null || result.count === undefined) {
      this.logger.warn(
        "Truy vấn phân trang không có `count`. Thiếu `{ count: 'exact' }` trong select() " +
          '→ total sẽ trả 0 và bộ điều hướng trang ở frontend sẽ sai.',
      );
    }
    return paginated(result.data, result.count ?? 0, page, pageSize);
  }

  /**
   * Ghi mà không cần đọc lại bản ghi (UPDATE không có `.select()`).
   *
   * ⚠️ Dùng khi **không** cần dữ liệu trả về. Nếu cần, dùng `.select().single()` rồi
   * `must()` — đừng gọi `void_()` rồi truy vấn lại, vì hai câu lệnh rời nhau không nằm
   * trong cùng một giao dịch và giữa chúng có thể có thay đổi khác.
   *
   * ⚠️ Every Half KHÔNG xoá dữ liệu nghiệp vụ ("không bao giờ xoá lịch sử"). Không có hàm
   * `delete` ở lớp cơ sở là chủ ý: một thao tác "xoá" ở giao diện phải là đổi trạng thái
   * (ví dụ `ARCHIVED`, `CANCELLED`) kèm lý do và audit.
   */
  protected void_(result: { error: PostgrestError | null }): void {
    if (result.error) {
      mapSupabasePostgrestError(result.error);
    }
  }
}
