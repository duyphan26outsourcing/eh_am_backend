import { JwtPayload } from '../auth/types';
import type { UserProfileRow } from '../supabase/supabase.define';

/**
 * Mở rộng `Express.Request` để các guard/decorator đọc được dữ liệu đã xác thực mà
 * không phải ép kiểu ở mọi chỗ.
 *
 * ⚠️ MỌI TRƯỜNG Ở ĐÂY LÀ OPTIONAL, VÀ ĐÓ LÀ SỰ THẬT CHỨ KHÔNG PHẢI SỰ BẤT TIỆN.
 *
 * Một request chưa qua `JwtAuthGuard` thì thật sự không có `user`. Khai `user: JwtPayload`
 * (không optional) sẽ làm TypeScript tin rằng mọi request đều đã đăng nhập, và một
 * controller công khai đọc `req.user.sub` sẽ compile sạch rồi ném
 * `Cannot read properties of undefined` lúc chạy.
 *
 * Ở controller **đã có guard**, dùng `AuthRequest` (xem `auth/auth.interface.ts`) —
 * kiểu đó khai `user` bắt buộc, vì lúc đó nó đã được bảo đảm.
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      userProfile?: UserProfileRow;
      contextRoles?: string[];

      /**
       * Mã tương quan của request, do `requestContextMiddleware` gán.
       *
       * ⚠️ Optional vì về lý thuyết có đường đi không qua middleware đó (lỗi phát sinh trước
       * nó). Khai bắt buộc sẽ làm TypeScript tin rằng nó luôn có, và filter sẽ in `undefined`
       * vào log thay vì `-`.
       */
      requestId?: string;
    }
  }
}

export {};
