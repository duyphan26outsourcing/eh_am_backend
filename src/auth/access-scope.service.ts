import { Injectable } from '@nestjs/common';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import {
  ContextRoleAssignmentTableName,
  ROLE_ASSIGNMENT_COLUMNS,
  RoleAssignmentRow,
} from '@/supabase/supabase.define';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import {
  ContextType,
  PLATFORM_CONTEXT_ID,
  Role,
  SubjectType,
} from '@/utils/enums/role.enum';
import { isSuperAdmin } from '@/utils/utils';
import { JwtPayload } from './types';

/**
 * ============================================================================
 * PHẠM VI LOCATION — BIÊN BẢO MẬT DỮ LIỆU CỦA EVERY HALF
 * ============================================================================
 *
 * Brief gốc: "Phân quyền theo vai trò **và** theo location." Có hai lớp, và cả hai đều phải có:
 *
 *   1. **Lớp route** — `PermissionsGuard` + `@RequireContext`: "người này có được làm hành
 *      động X trên location Y (trong URL) không?"
 *   2. **Lớp dữ liệu** — service này: "trong một danh sách (tìm tài sản, dashboard, báo cáo),
 *      người này được THẤY những location nào?"
 *
 * ⚠️ VÌ SAO LỚP 2 KHÔNG THAY ĐƯỢC BẰNG LỚP 1
 *
 * `GET /v1/assets?q=máy pha` không có location nào trong URL để guard kiểm. Không có lớp 2 thì
 * endpoint danh sách trả tài sản của **mọi** cửa hàng cho bất kỳ ai đã đăng nhập — và backend
 * dùng `service_role` nên RLS không chặn giúp. Đây là thứ thay cho `tenant_id` trong kiến trúc
 * này: mọi truy vấn đọc dữ liệu theo location phải đi qua `applyLocationScope()`.
 *
 * ⚠️ HIỆU LỰC THEO THỜI GIAN ĐƯỢC XÉT TRONG SQL, KHÔNG PHẢI Ở JAVASCRIPT
 *
 * Bản gốc (Avantily) tải mọi dòng rồi so `effective_from/to` bằng so sánh chuỗi ISO. Cách đó chỉ
 * đúng khi hai chuỗi cùng offset: PostgREST trả `…+00:00` khi database ở UTC, nhưng nếu ai đó
 * đặt timezone của database về `Asia/Ho_Chi_Minh` (rất tự nhiên với một hệ thống Việt Nam) thì
 * nó trả `…+07:00`, và phép so chuỗi lệch đúng 7 tiếng — một quản lý cửa hàng bị thu hồi quyền
 * lúc 17:00 vẫn thao tác được tới 24:00. Để Postgres so `timestamptz` thì không có lỗi đó.
 */
export interface LocationScope {
  /** `true` = thấy mọi location (vai trò toàn hệ thống phù hợp, hoặc quản trị tối cao). */
  allLocations: boolean;
  /** Các location được thấy khi `allLocations = false`. Có thể rỗng — nghĩa là không thấy gì. */
  locationIds: string[];
}

/**
 * Quy tắc "vai trò nào cho thấy phạm vi nào" của MỘT loại dữ liệu.
 *
 * ⚠️ Khai theo từng use case, không khai một bảng chung cho cả hệ thống: nhân viên cửa hàng
 * được xem danh sách tài sản tại quầy nhưng không được xem báo cáo giá trị còn lại của chính
 * cửa hàng đó. Một quy tắc chung sẽ buộc chọn giữa "cho xem quá nhiều" và "chặn quá tay".
 */
export interface LocationScopeRule {
  /** Vai trò toàn hệ thống cho thấy MỌI location. */
  platformRoles: readonly Role[];
  /** Vai trò theo location cho thấy location đó. */
  locationRoles: readonly Role[];
}

export interface ActiveAssignmentFilter {
  contextType?: ContextType;
  contextId?: string;
  roles?: readonly Role[];
}

@Injectable()
export class AccessScopeService {
  constructor(private readonly supabaseAdmin: SupabaseAdminService) {}

  /**
   * Các dòng phân quyền **đang có hiệu lực** của một người, có thể lọc thêm theo phạm vi/vai trò.
   *
   * ⚠️ Truy vấn lỗi → NÉM LỖI, không trả `[]`. Trả rỗng khi database lỗi nghĩa là người dùng
   * nhận 403 "không có vai trò" — đúng về an toàn (fail-closed) nhưng nói sai nguyên nhân, và
   * đội vận hành sẽ đi kiểm bảng phân quyền thay vì kiểm kết nối database.
   */
  async findActiveAssignments(
    userId: string,
    filter: ActiveAssignmentFilter = {},
  ): Promise<RoleAssignmentRow[]> {
    const now = new Date().toISOString();

    let query = this.supabaseAdmin.client
      .from(ContextRoleAssignmentTableName)
      .select(ROLE_ASSIGNMENT_COLUMNS)
      // ⚠️ Lọc theo CẢ `subject_type` VÀ `subject_id` — xem chú thích ở `PermissionsGuard`.
      .eq('subject_type', SubjectType.USER)
      .eq('subject_id', userId)
      .lte('effective_from', now)
      // Giá trị đặt trong nháy kép: chuỗi ISO có `:` và `.`, và cú pháp logic của PostgREST
      // coi một số ký tự là phân cách nếu không bọc.
      .or(`effective_to.is.null,effective_to.gt."${now}"`);

    if (filter.contextType) {
      query = query.eq('context_type', filter.contextType);
    }
    if (filter.contextId) {
      query = query.eq('context_id', filter.contextId);
    }
    if (filter.roles) {
      query = query.in('role_code', [...filter.roles]);
    }

    const { data, error } = await query;
    if (error) mapSupabasePostgrestError(error);

    return data ?? [];
  }

  /**
   * Phạm vi location mà người gọi được thấy, theo quy tắc của một loại dữ liệu.
   *
   * Quản trị tối cao (break-glass) thấy mọi location — cùng lý do `PermissionsGuard` cho họ đi
   * xuyên: đó là đường vào cuối cùng khi chính bảng phân quyền bị cấu hình sai.
   */
  async resolveLocationScope(
    user: JwtPayload,
    rule: LocationScopeRule,
  ): Promise<LocationScope> {
    if (isSuperAdmin(user)) {
      return { allLocations: true, locationIds: [] };
    }

    const assignments = await this.findActiveAssignments(user.sub, {
      roles: [...rule.platformRoles, ...rule.locationRoles],
    });

    return computeLocationScope(assignments, rule);
  }
}

/**
 * Tính phạm vi từ các dòng phân quyền đã có hiệu lực. Hàm thuần — có unit test riêng.
 *
 * ⚠️ Chỉ tính dòng khớp ĐÚNG cặp (loại phạm vi, vai trò) của quy tắc. Một dòng
 * `LOCATION_MANAGER` trên `PLATFORM` (dữ liệu sai) không được hiểu thành "thấy mọi location" —
 * đọc lỏng ở đây là biến một dòng dữ liệu hỏng thành quyền rộng nhất hệ thống.
 */
export function computeLocationScope(
  assignments: readonly Pick<
    RoleAssignmentRow,
    'role_code' | 'context_type' | 'context_id'
  >[],
  rule: LocationScopeRule,
): LocationScope {
  const platformRoles: readonly string[] = rule.platformRoles;
  const locationRoles: readonly string[] = rule.locationRoles;

  const hasPlatformRole = assignments.some(
    (a) =>
      a.context_type === ContextType.PLATFORM &&
      a.context_id === PLATFORM_CONTEXT_ID &&
      platformRoles.includes(a.role_code),
  );
  if (hasPlatformRole) {
    return { allLocations: true, locationIds: [] };
  }

  const locationIds = new Set(
    assignments
      .filter(
        (a) =>
          a.context_type === ContextType.LOCATION &&
          locationRoles.includes(a.role_code),
      )
      .map((a) => a.context_id),
  );

  return { allLocations: false, locationIds: [...locationIds].sort() };
}

/** Kiểu tối thiểu mà một query builder cần để áp phạm vi — `PostgrestFilterBuilder` thoả nó. */
interface InFilterable<Self> {
  in(column: string, values: readonly string[]): Self;
}

/**
 * Áp phạm vi location lên một truy vấn Supabase.
 *
 * ```ts
 * const scope = await this.accessScope.resolveLocationScope(req.user, ASSET_LIST_SCOPE);
 * const query = applyLocationScope(
 *   this.db.from(SupabaseTable.ASSETS).select('...', { count: 'exact' }),
 *   scope,
 *   'location_id',
 * );
 * ```
 *
 * ⚠️ `locationIds` RỖNG VẪN ÁP `.in(column, [])` — KHÔNG BỎ QUA BỘ LỌC
 *
 * Cách viết "nếu danh sách rỗng thì khỏi lọc" nghe hợp lý và là một lỗ hổng: người không có
 * vai trò nào sẽ thấy **mọi thứ**. `.in(col, [])` trả về không dòng nào — đúng nghĩa "không
 * thấy gì". (Repository vẫn có thể thoát sớm trước khi gọi database cho đỡ một lượt đi-về.)
 */
export function applyLocationScope<Q extends InFilterable<Q>>(
  query: Q,
  scope: LocationScope,
  column: string,
): Q {
  if (scope.allLocations) return query;
  return query.in(column, scope.locationIds);
}
