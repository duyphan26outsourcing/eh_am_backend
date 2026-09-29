import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

/**
 * Client dùng `service_role` key — **bỏ qua toàn bộ Row Level Security**.
 *
 * ⚠️ ĐÂY LÀ CLIENT CÓ QUYỀN CAO NHẤT TRONG HỆ THỐNG. HAI HỆ QUẢ PHẢI NHỚ:
 *
 * 1. **RLS không bảo vệ gì cho client này.** Biên bảo mật dữ liệu của Every Half là
 *    **phạm vi location** của người gọi (xem `sql-docs/migrations/01_identity_rbac_audit.sql`
 *    §Quyết định kiến trúc), nên mỗi truy vấn đọc dữ liệu tài sản PHẢI tự lọc theo các
 *    location mà người gọi có vai trò — dùng `applyLocationScope()` ở
 *    `src/auth/access-scope.service.ts`. Quên một điều kiện là nhân viên cửa hàng A thấy
 *    tài sản cửa hàng B, và Postgres sẽ trả về kết quả 200 OK một cách vui vẻ.
 *
 * 2. **Trigger vẫn chạy.** Service role bỏ qua RLS nhưng không bỏ qua trigger, nên các
 *    bảng chỉ-ghi-thêm (`audit_events`) và bảng lịch sử chỉ-đóng-hiệu-lực
 *    (`context_role_assignments`) vẫn chặn sửa/xoá thật sự — đó là ràng buộc của nguyên tắc
 *    "không bao giờ xoá lịch sử", không phải quy ước.
 *
 * `autoRefreshToken: false` + `persistSession: false`: đây là client máy chủ dùng một
 * key tĩnh, không có phiên người dùng nào để giữ hay làm mới. Bật lên chỉ tạo thêm
 * timer nền vô nghĩa trong tiến trình.
 */
@Injectable()
export class SupabaseAdminService {
  readonly client: SupabaseClient<Database>;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL')!;
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SECRET_KEY',
    )!;

    this.client = createClient<Database>(url, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}
