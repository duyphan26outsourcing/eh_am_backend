import { Request } from 'express';
import { JwtPayload } from './types';
import type { UserProfileRow } from '@/supabase/supabase.define';

/**
 * Request đã đi qua `JwtAuthGuard`.
 *
 * Các trường ngoài `user` được guard gán thêm để tầng sau không phải truy vấn lại
 * cùng một bản ghi.
 */
export interface AuthRequest extends Request {
  user: JwtPayload;

  /** Hồ sơ đã đọc trong guard — tái dùng, đừng query lại. */
  userProfile?: UserProfileRow;

  /**
   * Vai trò đã resolve cho phạm vi của request, nếu `PermissionsGuard` đã chạy.
   *
   * Rỗng KHÔNG có nghĩa là không có quyền — nó có nghĩa là route này không khai
   * `@RequireContext`, nên guard đã thoát sớm mà không tra bảng phân quyền.
   */
  contextRoles?: string[];
}
