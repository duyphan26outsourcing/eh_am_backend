import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Làm mới phiên đăng nhập.
 *
 * =========================================================================
 * ⚠️ VÌ SAO REFRESH TOKEN ĐI TRONG BODY, KHÔNG PHẢI HEADER `Authorization`
 * =========================================================================
 *
 * `Authorization` mang **access token** đã hết hạn ở đúng thời điểm gọi endpoint này. Đặt
 * refresh token vào cùng header buộc `JwtAuthGuard` phải phân biệt hai loại token trong
 * cùng một chỗ — và một guard có hai đường xử lý cho cùng một header là một guard sẽ bị
 * dùng sai. Body tách bạch hoàn toàn: endpoint này **không** đi qua `JwtAuthGuard`.
 *
 * =========================================================================
 * ⚠️ VÌ SAO KHÔNG DÙNG COOKIE `httpOnly` — VÀ ĐÂY LÀ MỘT ĐÁNH ĐỔI CÓ THẬT
 * =========================================================================
 *
 * Cookie `httpOnly` **an toàn hơn**: JavaScript không đọc được, nên một lỗ XSS ở frontend
 * không lấy được refresh token. Body + `sessionStorage` thì lấy được. Đây là một điểm yếu
 * thật, không phải một chi tiết kỹ thuật.
 *
 * Chọn body (kế thừa quyết định của codebase gốc) vì ba lý do vận hành:
 *
 *   1. **Frontend và API khác tên miền.** Ở dev là hai cổng khác nhau (5175 / 3006), ở
 *      production thường là hai subdomain. Cookie dùng chung đòi `SameSite=None` + `Secure` +
 *      `domain` khai đúng, và mỗi môi trường khai một kiểu. Sai một cấu hình là **không đăng
 *      nhập được**, và triệu chứng rất khó đọc: request đi được nhưng cookie không kèm theo.
 *   2. **Trình duyệt trên điện thoại cửa hàng.** Một số trình duyệt nhúng (mở link QR từ app
 *      chat, Zalo…) chặn cookie bên thứ ba theo mặc định — đúng kênh mà nhân viên hay dùng để
 *      mở liên kết.
 *   3. **CSRF.** Cookie tự động gửi kèm mọi request, nên mở ra CSRF và cần thêm một lớp chống
 *      CSRF. Token trong body không tự gửi, nên không có CSRF.
 *
 * ⚠️ HAI VIỆC PHẢI LÀM ĐỂ ĐÁNH ĐỔI NÀY CHẤP NHẬN ĐƯỢC — cả hai đều là điều kiện, không
 * phải gợi ý:
 *
 *   1. **Frontend lưu refresh token trong `sessionStorage`, không phải `localStorage`.**
 *      `sessionStorage` mất khi đóng tab, nên máy tính quầy dùng chung không giữ lại phiên.
 *   2. **Content-Security-Policy chặt ở frontend.** XSS là con đường duy nhất lấy được token
 *      này; CSP là lớp chặn XSS (eh_am_frontend — `cspMetaPlugin` trong `vite.config.ts`).
 *
 * =========================================================================
 * ⚠️ REFRESH TOKEN ĐƯỢC MÃ HOÁ TRƯỚC KHI TRẢ VỀ CLIENT
 * =========================================================================
 *
 * Client nhận một chuỗi đã mã hoá AES-256-GCM, không phải refresh token gốc của Supabase.
 *
 * Lý do là điều gì xảy ra nếu chuỗi đó bị lấy. Refresh token gốc dùng được **trực tiếp**
 * với endpoint công khai của Supabase (`/auth/v1/token?grant_type=refresh_token`) — chỉ cần
 * thêm anon key, thứ vốn công khai. Nghĩa là kẻ lấy được nó không cần đi qua backend này,
 * và hệ quả là:
 *
 *   · không có giới hạn tần suất nào áp lên,
 *   · không có dòng nào trong `audit_events`,
 *   · không ai kiểm `user_profiles.status` — nhân viên đã nghỉ việc (DEACTIVATED) vẫn làm
 *     mới được phiên.
 *
 * Mã hoá buộc mọi lần làm mới đi qua endpoint này, nơi cả ba lớp trên đều có.
 *
 * ⚠️ HỆ QUẢ PHẢI BIẾT: đổi `ENCRYPTION_SECRET_KEY` sẽ **đăng xuất toàn bộ người dùng**, vì
 * mọi refresh token đang lưu ở client trở thành không giải mã được. Đó là hệ quả đúng và
 * chấp nhận được (giống access token), nhưng phải biết trước khi xoay khoá — không phải
 * phát hiện ra sau khi đã xoay.
 */
export class RefreshTokenDto {
  /**
   * Refresh token **đã mã hoá**, đúng chuỗi mà `/auth/login` hoặc `/auth/refresh` trả về.
   *
   * ⚠️ `@MaxLength(4096)` là chặn tiêu thụ tài nguyên, không phải kiểm định dạng. Không có
   * nó, một chuỗi vài megabyte sẽ đi qua bước giải mã AES trước khi bị loại — tức là kẻ
   * gửi rác quyết định được lượng CPU mà server tiêu. 4096 là dư gấp nhiều lần một token
   * thật đã mã hoá.
   */
  @IsString({ message: 'refreshToken phải là chuỗi.' })
  @IsNotEmpty({ message: 'Thiếu refreshToken.' })
  @MaxLength(4096, { message: 'refreshToken không hợp lệ.' })
  refreshToken!: string;
}
